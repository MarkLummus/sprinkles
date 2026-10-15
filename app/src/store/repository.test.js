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

  async function everything(repository) {
    return {
      recipes: await repository.listRecipes(),
      versions: await repository.listVersions(),
      batches: await repository.getAllBatches(),
    };
  }

  it('writes recipes, versions and batches together', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch] });
    expect(await everything(repository)).toEqual({ recipes: [recipe], versions: [version], batches: [batch] });
    expect(await repository.listBatchesForVersion('v1')).toEqual([batch]);
  });

  it('upserts by id and leaves records the file does not name', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch] });
    await repository.importAll({
      recipes: [{ ...recipe, name: 'Renamed' }],
      versions: [],
      batches: [{ id: 'b2', versionId: 'v1' }],
    });
    const held = await everything(repository);
    expect(held.recipes).toEqual([{ ...recipe, name: 'Renamed' }]);
    expect(held.versions).toEqual([version]);
    expect(held.batches.map((entry) => entry.id).sort()).toEqual(['b1', 'b2']);
  });

  it('rejects when a batch cannot be cloned, and all three stores hold exactly what they held before', async () => {
    const repository = createRepository();
    await repository.importAll({ recipes: [recipe], versions: [version], batches: [batch] });
    const before = await everything(repository);

    // A function value cannot be structured-cloned: the batch put throws a
    // DataCloneError after the recipe and version puts were already queued.
    await expect(
      repository.importAll({
        recipes: [{ id: 'r2', name: 'New', description: '' }],
        versions: [{ id: 'v2', recipeId: 'r2' }],
        batches: [{ id: 'b2', versionId: 'v2', notClonable: () => {} }],
      }),
    ).rejects.toThrow();

    expect(await everything(repository)).toEqual(before);
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
