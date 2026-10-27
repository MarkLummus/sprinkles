// The repository seam against a real IndexedDB (fake-indexeddb): drafts
// (D-16) are stored and read only through it, and survive a reopen of the
// store. fake-indexeddb/auto installs indexedDB and every IDB constructor
// on the global before repository.js loads (its module-level singleton
// opens the store on import), so it must be the first import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { createRepository } from './repository.js';
import { library } from '../data/library.js';
import { codeFromVersionId, SheetCodeError } from '../domain/sheetCode.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';

beforeEach(() => {
  // A fresh database per test — the repository opens its connection when
  // createRepository() runs, after this reset.
  globalThis.indexedDB = new IDBFactory();
});

function makeDraft(versionId, overrides = {}) {
  return { versionId, pen: 'amend', fields: { churnDate: '2026-10-11', note: `note for ${versionId}` }, ...overrides };
}

describe('drafts, through the repository seam', () => {
  it('saveDraft then getDraft returns a structurally equal record after the store is reopened', async () => {
    const draft = makeDraft('olive-oil-ice-cream-v1');
    const first = createRepository();
    await first.saveDraft(draft);

    // A second createRepository() opens the same database anew — what a
    // closed tab and a next-day visit do.
    const second = createRepository();
    expect(await second.getDraft('olive-oil-ice-cream-v1')).toEqual(draft);
  });

  it('getDraft reads undefined for a version with no draft', async () => {
    expect(await createRepository().getDraft('nothing-here')).toBeUndefined();
  });

  it('saveDraft keeps one draft per version: a second save replaces the first', async () => {
    const repository = createRepository();
    await repository.saveDraft(makeDraft('v1', { pen: 'first' }));
    await repository.saveDraft(makeDraft('v1', { pen: 'second' }));
    expect(await repository.listDrafts()).toEqual([makeDraft('v1', { pen: 'second' })]);
  });

  it('listDrafts returns every stored draft', async () => {
    const repository = createRepository();
    await repository.saveDraft(makeDraft('v1'));
    await repository.saveDraft(makeDraft('v2'));
    const drafts = await repository.listDrafts();
    expect(drafts).toHaveLength(2);
    expect(drafts).toEqual(expect.arrayContaining([makeDraft('v1'), makeDraft('v2')]));
  });

  it('deleteDraft removes the draft and leaves the others', async () => {
    const repository = createRepository();
    await repository.saveDraft(makeDraft('v1'));
    await repository.saveDraft(makeDraft('v2'));
    await repository.deleteDraft('v1');
    expect(await repository.getDraft('v1')).toBeUndefined();
    expect(await repository.listDrafts()).toEqual([makeDraft('v2')]);
  });
});

describe('importAll, through the repository seam', () => {
  const recipe = { id: 'r1', name: 'Recipe', description: '' };
  const version = { id: 'v1', recipeId: 'r1' };
  const batch = { id: 'b1', versionId: 'v1' };
  const libraryRecord = { id: 'l1', entry: { name: 'Entry', composition: { fat: 1 } } };
  // The four seed tables an import carries: the seed catalog, which holds the
  // four core scales every import must leave (plan 09-10).
  const tables = () => structuredClone(SEED_CATALOG);

  async function everything(repository) {
    return {
      recipes: await repository.listRecipes(),
      versions: await repository.listVersions(),
      batches: await repository.getAllBatches(),
      library: await repository.listLibrary(),
      machines: await repository.listMachines(),
      styles: await repository.listStyles(),
      scales: await repository.listScales(),
      problems: await repository.listProblems(),
    };
  }

  it('writes recipes, versions, batches, library, machines, styles, scales and problems together', async () => {
    const repository = createRepository();
    const catalog = tables();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord], ...catalog });
    const held = await everything(repository);
    const byId = (rows) => [...rows].sort((a, b) => (a.id < b.id ? -1 : 1));
    expect(held.recipes).toEqual([recipe]);
    expect(held.versions).toEqual([version]);
    expect(held.batches).toEqual([batch]);
    expect(held.library).toEqual([libraryRecord]);
    expect(byId(held.machines)).toEqual(byId(catalog.machines));
    expect(byId(held.styles)).toEqual(byId(catalog.styles));
    expect(byId(held.scales)).toEqual(byId(catalog.scales));
    expect(byId(held.problems)).toEqual(byId(catalog.problems));
    expect(await repository.listBatchesForVersion('v1')).toEqual([batch]);
  });

  it('upserts by id and leaves records the file does not name', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord], ...tables() });
    const changed = { id: 'l1', entry: { name: 'Entry, changed', composition: { fat: 2 } } };
    const added = { id: 'l2', entry: { name: 'Second', composition: { fat: 3 } } };
    const catalog = tables();
    const renamedMachine = { ...catalog.machines[0], name: 'Renamed machine' };
    const extraMachine = { ...catalog.machines[0], id: 'extra-machine', name: 'Extra machine' };
    await repository.importAll({
      recipes: [{ ...recipe, name: 'Renamed' }],
      versions: [],
      batches: [{ id: 'b2', versionId: 'v1' }],
      library: [changed, added],
      machines: [renamedMachine, extraMachine],
      styles: [],
      scales: [],
      problems: [],
    });
    const held = await everything(repository);
    expect(held.recipes).toEqual([{ ...recipe, name: 'Renamed' }]);
    expect(held.versions).toEqual([version]);
    expect(held.batches.map((entry) => entry.id).sort()).toEqual(['b1', 'b2']);
    expect(held.library.map((entry) => entry.id).sort()).toEqual(['l1', 'l2']);
    expect(await repository.getLibraryEntry('l1')).toEqual(changed);
    // The file wins on a shared id, a new id is added beside the local rows, and
    // a table the file leaves empty keeps every local row: import never deletes (D-14).
    expect(held.machines.find((row) => row.id === renamedMachine.id)).toEqual(renamedMachine);
    expect(held.machines.map((row) => row.id)).toContain('extra-machine');
    expect(held.machines).toHaveLength(catalog.machines.length + 1);
    expect(held.styles).toHaveLength(catalog.styles.length);
    expect(held.scales).toHaveLength(catalog.scales.length);
    expect(held.problems).toHaveLength(catalog.problems.length);
  });

  it('rejects when a batch cannot be cloned, and all eight stores hold exactly what they held before', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord], ...tables() });
    const before = await everything(repository);

    // A function value cannot be structured-cloned: the batch put throws a
    // DataCloneError after the recipe and version puts were already queued.
    await expect(
      repository.importAll({
        recipes: [{ id: 'r2', name: 'New', description: '' }],
        versions: [{ id: 'v2', recipeId: 'r2' }],
        batches: [{ id: 'b2', versionId: 'v2', notClonable: () => {} }],
        library: [{ id: 'l2', entry: { name: 'Second', composition: { fat: 3 } } }],
        ...tables(),
      }),
    ).rejects.toThrow();

    expect(await everything(repository)).toEqual(before);
  });

  it('rejects when a library record cannot be cloned, and all eight stores hold exactly what they held before (D-07)', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord], ...tables() });
    const before = await everything(repository);

    // The recipe, version and batch puts are all good and already queued when
    // the library put throws a DataCloneError.
    await expect(
      repository.importAll({
        recipes: [{ id: 'r2', name: 'New', description: '' }],
        versions: [{ id: 'v2', recipeId: 'r2' }],
        batches: [{ id: 'b2', versionId: 'v2' }],
        library: [{ id: 'l2', entry: { name: 'Second', composition: { fat: 3 }, notClonable: () => {} } }],
        ...tables(),
      }),
    ).rejects.toThrow();

    expect(await everything(repository)).toEqual(before);
  });

  it('rejects when a table row cannot be cloned, and all eight stores hold exactly what they held before', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord], ...tables() });
    const before = await everything(repository);

    // Every put before the problems put is good and already queued when it throws.
    await expect(
      repository.importAll({
        recipes: [{ id: 'r2', name: 'New', description: '' }],
        versions: [{ id: 'v2', recipeId: 'r2' }],
        batches: [{ id: 'b2', versionId: 'v2' }],
        library: [{ id: 'l2', entry: { name: 'Second', composition: { fat: 3 } } }],
        ...tables(),
        problems: [{ id: 'new-problem', name: 'New problem', order: 9, notClonable: () => {} }],
      }),
    ).rejects.toThrow();

    expect(await everything(repository)).toEqual(before);
  });
});

describe('exportAll, through the repository seam (D-07a)', () => {
  it('reads the eight stores a file carries in one readonly transaction, and never the drafts', async () => {
    const repository = createRepository();
    const recipe = { id: 'r1', name: 'Recipe', description: '' };
    const version = { id: 'v1', recipeId: 'r1' };
    const batch = { id: 'b1', versionId: 'v1' };
    const libraryRecord = { id: 'l1', entry: { name: 'Entry', composition: { fat: 1 } } };
    const catalog = structuredClone(SEED_CATALOG);
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord], ...catalog });
    await repository.saveDraft(makeDraft('v1'));
    // Read once so the connection is open before the spy goes on.
    await repository.listRecipes();

    const spy = vi.spyOn(globalThis.IDBDatabase.prototype, 'transaction');
    try {
      const exported = await repository.exportAll();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(['recipes', 'versions', 'batches', 'library', 'machines', 'styles', 'scales', 'problems'], 'readonly');
      const byId = (rows) => [...rows].sort((a, b) => (a.id < b.id ? -1 : 1));
      expect(exported.recipes).toEqual([recipe]);
      expect(exported.versions).toEqual([version]);
      expect(exported.batches).toEqual([batch]);
      expect(exported.library).toEqual([libraryRecord]);
      expect(byId(exported.machines)).toEqual(byId(catalog.machines));
      expect(byId(exported.styles)).toEqual(byId(catalog.styles));
      expect(byId(exported.scales)).toEqual(byId(catalog.scales));
      expect(byId(exported.problems)).toEqual(byId(catalog.problems));
      expect(Object.keys(exported).sort()).toEqual(['batches', 'library', 'machines', 'problems', 'recipes', 'scales', 'styles', 'versions']);
    } finally {
      spy.mockRestore();
    }
  });

  it('when a read fails it aborts the transaction, rethrows, and leaves no unhandled rejection', async () => {
    const repository = createRepository();
    await repository.listRecipes();

    const unhandled = [];
    const onUnhandled = (reason) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    // Fails the fourth of the eight reads, after the first three were queued.
    const original = globalThis.IDBObjectStore.prototype.getAll;
    const getAllSpy = vi.spyOn(globalThis.IDBObjectStore.prototype, 'getAll').mockImplementation(function (...args) {
      if (this.name === 'library') throw new Error('read failed');
      return original.apply(this, args);
    });
    const abortSpy = vi.spyOn(globalThis.IDBTransaction.prototype, 'abort');
    try {
      await expect(repository.exportAll()).rejects.toThrow('read failed');
      // Let the abort's rejection of tx.done reach the event loop.
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(abortSpy).toHaveBeenCalledTimes(1);
      expect(unhandled).toEqual([]);
    } finally {
      getAllSpy.mockRestore();
      abortSpy.mockRestore();
      process.off('unhandledRejection', onUnhandled);
    }
  });
});

describe('the ingredient library, through the repository seam', () => {
  const byId = (a, b) => (a.id < b.id ? -1 : 1);
  const wholeMilk = () => ({ id: 'wholeMilk', entry: structuredClone(library.wholeMilk) });
  const sucrose = () => ({ id: 'sucrose', entry: structuredClone(library.sucrose) });

  it('putAllLibrary then listLibrary returns both records, entries unchanged, after the store is reopened', async () => {
    await createRepository().putAllLibrary([wholeMilk(), sucrose()]);

    const held = await createRepository().listLibrary();
    expect([...held].sort(byId)).toEqual([sucrose(), wholeMilk()]);
    expect(held.find((record) => record.id === 'wholeMilk').entry).toEqual(library.wholeMilk);
    expect(held.find((record) => record.id === 'sucrose').entry).toEqual(library.sucrose);
  });

  it('getLibraryEntry returns the stored record, or undefined for an id it does not hold', async () => {
    const repository = createRepository();
    await repository.putAllLibrary([wholeMilk(), sucrose()]);
    expect(await repository.getLibraryEntry('sucrose')).toEqual({ id: 'sucrose', entry: library.sucrose });
    expect(await repository.getLibraryEntry('nothing-here')).toBeUndefined();
  });

  it('a second putAllLibrary upserts by id and leaves the records it does not name', async () => {
    const repository = createRepository();
    await repository.putAllLibrary([wholeMilk(), sucrose()]);

    const changed = sucrose();
    changed.entry.composition.pac *= 2;
    await repository.putAllLibrary([changed]);

    expect(await repository.getLibraryEntry('sucrose')).toEqual(changed);
    expect(await repository.getLibraryEntry('wholeMilk')).toEqual(wholeMilk());
    expect(await repository.listLibrary()).toHaveLength(2);
  });

  it('putAllLibrary rejects when a record cannot be cloned, and none of that call\'s records is written (review item 3)', async () => {
    const repository = createRepository();
    await repository.putAllLibrary([wholeMilk()]);

    // The function value cannot be structured-cloned: the second put throws
    // a DataCloneError after the sucrose put was already queued.
    await expect(
      repository.putAllLibrary([sucrose(), { id: 'bad', entry: { name: 'Bad', composition: {}, notClonable: () => {} } }]),
    ).rejects.toThrow();

    expect(await createRepository().listLibrary()).toEqual([wholeMilk()]);
  });
});

describe('seedLibraryIfEmpty, one transaction for the check and the write (D-04)', () => {
  const records = Object.entries(library).map(([id, entry]) => ({ id, entry }));

  it('on an empty library it writes every record and resolves true', async () => {
    expect(await createRepository().seedLibraryIfEmpty(records)).toBe(true);

    const held = await createRepository().listLibrary();
    expect(held).toHaveLength(Object.keys(library).length);
    for (const record of held) expect(record.entry).toEqual(library[record.id]);
  });

  it('on a library holding a record it writes nothing and resolves false', async () => {
    const existing = { id: 'existing-entry', entry: { name: 'Existing', composition: {} } };
    await createRepository().putAllLibrary([existing]);

    expect(await createRepository().seedLibraryIfEmpty(records)).toBe(false);
    expect(await createRepository().listLibrary()).toEqual([existing]);
  });

  it('two connections calling it at once on one empty database: exactly one writes', async () => {
    const results = await Promise.all([
      createRepository().seedLibraryIfEmpty(records),
      createRepository().seedLibraryIfEmpty(records),
    ]);
    expect(results.filter((result) => result === true)).toHaveLength(1);

    const held = await createRepository().listLibrary();
    expect(held).toHaveLength(Object.keys(library).length);
    expect(new Set(held.map((record) => record.id)).size).toBe(held.length);
  });

  it('a record the store cannot clone rejects the call and leaves the library empty, and the next call seeds it', async () => {
    const bad = { id: 'bad', entry: { name: 'Bad', composition: {}, notClonable: () => {} } };
    await expect(createRepository().seedLibraryIfEmpty([...records, bad])).rejects.toThrow();
    expect(await createRepository().listLibrary()).toEqual([]);

    expect(await createRepository().seedLibraryIfEmpty(records)).toBe(true);
    expect(await createRepository().listLibrary()).toHaveLength(records.length);
  });
});

// Two version ids whose id-derived codes are equal: the pair domain/sheetCode.test.js
// pins (a test file cannot be imported here, so the ids are repeated and the first
// case below proves they still collide).
const COLLIDING_ID_A = 'collide-1avm4ex8s';
const COLLIDING_ID_B = 'collide-1p5a0rvy0';

// A version as createChildVersion and createRecipe give it: its code derived from its id.
function makeVersion(id, overrides = {}) {
  return { id, recipeId: 'r1', versionLabel: id, sheetCode: codeFromVersionId(id), rows: [], method: [], ...overrides };
}

describe('createVersion, through the repository seam (CODE-01, D-04, D-04a)', () => {
  it('stands on a colliding pair of ids', () => {
    expect(COLLIDING_ID_A).not.toBe(COLLIDING_ID_B);
    expect(codeFromVersionId(COLLIDING_ID_A)).toBe(codeFromVersionId(COLLIDING_ID_B));
  });

  it('stores a version', async () => {
    const repository = createRepository();
    const version = makeVersion('v-new');
    await repository.createVersion(version);
    expect(await repository.getVersion('v-new')).toEqual(version);
  });

  it('refuses a second version whose code is the first one\'s, with a SheetCodeError, and keeps only the first', async () => {
    const repository = createRepository();
    const first = makeVersion(COLLIDING_ID_A);
    await repository.createVersion(first);

    const error = await repository.createVersion(makeVersion(COLLIDING_ID_B)).catch((e) => e);
    expect(error).toBeInstanceOf(SheetCodeError);
    expect(error.problems).toEqual([
      { kind: 'clash', code: first.sheetCode, versionId: COLLIDING_ID_A, otherVersionId: COLLIDING_ID_B },
    ]);
    expect(await repository.listVersions()).toEqual([first]);
  });

  it('refuses a version with no sheetCode with a TypeError and stores nothing', async () => {
    const repository = createRepository();
    const { sheetCode: _dropped, ...codeless } = makeVersion('v-codeless');
    await expect(repository.createVersion(codeless)).rejects.toThrow(TypeError);
    expect(await repository.listVersions()).toEqual([]);
  });

  it('refuses a version whose sheetCode is the lower-case form of a canonical code with a TypeError and stores nothing', async () => {
    const repository = createRepository();
    const version = makeVersion('v-lower');
    await expect(repository.createVersion({ ...version, sheetCode: version.sheetCode.toLowerCase() })).rejects.toThrow(TypeError);
    expect(await repository.listVersions()).toEqual([]);
  });
});

describe('saveVersion, through the repository seam (CODE-01, D-04b)', () => {
  it('stores a version whose stored record has the same code: its own code is not a clash', async () => {
    const repository = createRepository();
    const version = makeVersion('v-own');
    await repository.createVersion(version);
    const edited = { ...version, versionLabel: 'edited' };
    await repository.saveVersion(edited);
    expect(await repository.getVersion('v-own')).toEqual(edited);
  });

  it('refuses a version whose stored record has a different code, and leaves the stored record as it was', async () => {
    const repository = createRepository();
    const version = makeVersion('v-fixed');
    await repository.createVersion(version);

    const error = await repository.saveVersion({ ...version, sheetCode: 'ZZZZ-0000' }).catch((e) => e);
    expect(error).toBeInstanceOf(SheetCodeError);
    expect(error.problems).toEqual([
      { kind: 'changed', versionId: 'v-fixed', storedCode: version.sheetCode, incomingCode: 'ZZZZ-0000' },
    ]);
    expect(await repository.getVersion('v-fixed')).toEqual(version);
  });

  it('refuses a version whose code is another stored version\'s code', async () => {
    const repository = createRepository();
    const first = makeVersion(COLLIDING_ID_A);
    await repository.createVersion(first);
    // A different id with no stored record, carrying the first one's code.
    const error = await repository.saveVersion(makeVersion(COLLIDING_ID_B)).catch((e) => e);
    expect(error).toBeInstanceOf(SheetCodeError);
    expect(error.problems.map((p) => p.kind)).toEqual(['clash']);
    expect(await repository.listVersions()).toEqual([first]);
  });

  it('stores a version whose id has no stored record yet, with no changed problem', async () => {
    const repository = createRepository();
    const version = makeVersion('v-unseen');
    await repository.saveVersion(version);
    expect(await repository.getVersion('v-unseen')).toEqual(version);
  });
});

describe('two tabs creating at once (D-04a)', () => {
  it('stores exactly one of two versions whose ids derive the same code', async () => {
    const tabOne = createRepository();
    const tabTwo = createRepository();
    const results = await Promise.allSettled([
      tabOne.createVersion(makeVersion(COLLIDING_ID_A)),
      tabTwo.createVersion(makeVersion(COLLIDING_ID_B)),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(SheetCodeError);
    const stored = await tabOne.listVersions();
    expect(stored).toHaveLength(1);
    expect([COLLIDING_ID_A, COLLIDING_ID_B]).toContain(stored[0].id);
  });
});

describe('onBlocked, through the repository seam (WR-08)', () => {
  function holdOpen(version) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sprinkles', version);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('versions', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function until(condition) {
    for (let i = 0; i < 200 && !condition(); i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    expect(condition()).toBe(true);
  }

  it('tells the listener while an older connection is held, calls a late listener at once, and opens when it closes', async () => {
    const held = await holdOpen(7);
    const repository = createRepository();

    const early = vi.fn();
    repository.onBlocked(early);
    await until(() => early.mock.calls.length > 0);
    expect(early).toHaveBeenCalledTimes(1);

    // Registration is sticky: the event already fired.
    const late = vi.fn();
    repository.onBlocked(late);
    expect(late).toHaveBeenCalledTimes(1);

    held.close();
    expect(await repository.listVersions()).toEqual([]);
  });
});

// A recipe and its root as the creation editor saves them (Phase 11, MAKE-10).
const CREATED_AT = '2026-10-26T12:00:00.000Z';
function createdPair({ recipeId = 'recipe-new', versionId = 'version-new-1', name = 'Plain base', fields = {} } = {}) {
  const rows = [
    rowFromLibraryRecord({ id: 'wholeMilk', entry: library.wholeMilk }, { id: 'row-a', grams: 500 }),
    rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-b', grams: 100 }),
  ];
  return createRecipe({ name, versionLabel: 'first try', rows, ...fields }, { recipeId, versionId, now: CREATED_AT });
}

async function stores(repository) {
  return {
    recipes: await repository.listRecipes(),
    versions: await repository.listVersions(),
    batches: await repository.getAllBatches(),
    drafts: await repository.listDrafts(),
  };
}

describe('createRecipeWithVersion, through the repository seam (MAKE-10, T-11-07)', () => {
  it('stores the recipe and the version, and the create draft under the version id is gone', async () => {
    const repository = createRepository();
    const { recipe, version } = createdPair();
    await repository.saveDraft(makeDraft(version.id, { kind: 'create' }));
    await repository.saveDraft(makeDraft('other-version', { kind: 'create' }));

    await repository.createRecipeWithVersion({ recipe, version });

    expect(await repository.getRecipe(recipe.id)).toEqual(recipe);
    expect(await repository.getVersion(version.id)).toEqual(version);
    expect(await repository.getDraft(version.id)).toBeUndefined();
    // A draft under another id is another creation's, and stays.
    expect(await repository.getDraft('other-version')).toEqual(makeDraft('other-version', { kind: 'create' }));
  });

  it('writes neither the recipe nor the version when the version cannot be cloned, and the create draft stays', async () => {
    const repository = createRepository();
    const { recipe, version } = createdPair();
    const draft = makeDraft(version.id, { kind: 'create' });
    await repository.saveDraft(draft);
    const before = await stores(repository);

    // A function value cannot be structured-cloned: the version put throws a
    // DataCloneError after the recipe put was already queued.
    await expect(
      repository.createRecipeWithVersion({ recipe, version: { ...version, notClonable: () => {} } }),
    ).rejects.toThrow();

    expect(await stores(repository)).toEqual(before);
    expect(await repository.listRecipes()).toEqual([]);
    expect(await repository.listVersions()).toEqual([]);
    expect(await repository.getDraft(version.id)).toEqual(draft);
  });

  it('refuses a version whose Sheet code is a stored one, with a SheetCodeError, and stores nothing', async () => {
    const repository = createRepository();
    const first = createdPair({ recipeId: 'r-a', versionId: COLLIDING_ID_A });
    await repository.createRecipeWithVersion(first);
    const second = createdPair({ recipeId: 'r-b', versionId: COLLIDING_ID_B });
    const draft = makeDraft(COLLIDING_ID_B, { kind: 'create' });
    await repository.saveDraft(draft);
    const before = await stores(repository);

    const error = await repository.createRecipeWithVersion(second).catch((e) => e);
    expect(error).toBeInstanceOf(SheetCodeError);
    expect(await stores(repository)).toEqual(before);
    expect(await repository.getRecipe('r-b')).toBeUndefined();
  });

  it('refuses a version id that is already stored with a TypeError, and stores nothing', async () => {
    const repository = createRepository();
    const first = createdPair();
    await repository.createRecipeWithVersion(first);
    const again = createdPair({ recipeId: 'recipe-other', name: 'Another name' });
    const before = await stores(repository);

    await expect(repository.createRecipeWithVersion(again)).rejects.toThrow(TypeError);
    expect(await stores(repository)).toEqual(before);
    expect(await repository.getRecipe('recipe-other')).toBeUndefined();
  });
});
