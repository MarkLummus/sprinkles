// The repository seam against a real IndexedDB (fake-indexeddb): drafts
// (D-16) are stored and read only through it, and survive a reopen of the
// store. fake-indexeddb/auto installs indexedDB and every IDB constructor
// on the global before repository.js loads (its module-level singleton
// opens the store on import), so it must be the first import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';

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
