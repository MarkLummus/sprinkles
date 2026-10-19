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

  async function everything(repository) {
    return {
      recipes: await repository.listRecipes(),
      versions: await repository.listVersions(),
      batches: await repository.getAllBatches(),
      library: await repository.listLibrary(),
    };
  }

  it('writes recipes, versions, batches and library together', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord] });
    expect(await everything(repository)).toEqual({
      recipes: [recipe],
      versions: [version],
      batches: [batch],
      library: [libraryRecord],
    });
    expect(await repository.listBatchesForVersion('v1')).toEqual([batch]);
  });

  it('upserts by id and leaves records the file does not name', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord] });
    const changed = { id: 'l1', entry: { name: 'Entry, changed', composition: { fat: 2 } } };
    const added = { id: 'l2', entry: { name: 'Second', composition: { fat: 3 } } };
    await repository.importAll({
      recipes: [{ ...recipe, name: 'Renamed' }],
      versions: [],
      batches: [{ id: 'b2', versionId: 'v1' }],
      library: [changed, added],
    });
    const held = await everything(repository);
    expect(held.recipes).toEqual([{ ...recipe, name: 'Renamed' }]);
    expect(held.versions).toEqual([version]);
    expect(held.batches.map((entry) => entry.id).sort()).toEqual(['b1', 'b2']);
    expect(held.library.map((entry) => entry.id).sort()).toEqual(['l1', 'l2']);
    expect(await repository.getLibraryEntry('l1')).toEqual(changed);
  });

  it('rejects when a batch cannot be cloned, and all four stores hold exactly what they held before', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord] });
    const before = await everything(repository);

    // A function value cannot be structured-cloned: the batch put throws a
    // DataCloneError after the recipe and version puts were already queued.
    await expect(
      repository.importAll({
        recipes: [{ id: 'r2', name: 'New', description: '' }],
        versions: [{ id: 'v2', recipeId: 'r2' }],
        batches: [{ id: 'b2', versionId: 'v2', notClonable: () => {} }],
        library: [{ id: 'l2', entry: { name: 'Second', composition: { fat: 3 } } }],
      }),
    ).rejects.toThrow();

    expect(await everything(repository)).toEqual(before);
  });

  it('rejects when a library record cannot be cloned, and all four stores hold exactly what they held before (D-07)', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord] });
    const before = await everything(repository);

    // The recipe, version and batch puts are all good and already queued when
    // the library put throws a DataCloneError.
    await expect(
      repository.importAll({
        recipes: [{ id: 'r2', name: 'New', description: '' }],
        versions: [{ id: 'v2', recipeId: 'r2' }],
        batches: [{ id: 'b2', versionId: 'v2' }],
        library: [{ id: 'l2', entry: { name: 'Second', composition: { fat: 3 }, notClonable: () => {} } }],
      }),
    ).rejects.toThrow();

    expect(await everything(repository)).toEqual(before);
  });
});

describe('exportAll, through the repository seam (D-07a)', () => {
  it('reads recipes, versions, batches and library in one readonly transaction, and never the drafts', async () => {
    const repository = createRepository();
    const recipe = { id: 'r1', name: 'Recipe', description: '' };
    const version = { id: 'v1', recipeId: 'r1' };
    const batch = { id: 'b1', versionId: 'v1' };
    const libraryRecord = { id: 'l1', entry: { name: 'Entry', composition: { fat: 1 } } };
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord] });
    await repository.saveDraft(makeDraft('v1'));
    // Read once so the connection is open before the spy goes on.
    await repository.listRecipes();

    const spy = vi.spyOn(globalThis.IDBDatabase.prototype, 'transaction');
    try {
      const exported = await repository.exportAll();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(['recipes', 'versions', 'batches', 'library'], 'readonly');
      expect(exported).toEqual({ recipes: [recipe], versions: [version], batches: [batch], library: [libraryRecord] });
      expect(Object.keys(exported).sort()).toEqual(['batches', 'library', 'recipes', 'versions']);
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
    // Fails the last of the four reads, after the first three were queued.
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
