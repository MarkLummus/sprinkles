// The seeded batches' "newest" reading survives a real IndexedDB round
// trip. IndexedDB returns records in primary-key (id) order, not insertion
// order, so a seed that leaned on its own array order would read the wrong
// batch once it came back through getAllBatches. This file goes through
// the repository seam (the only path to the store) against fake-indexeddb.
// fake-indexeddb/auto installs indexedDB and every IDB constructor on the
// global before repository.js loads (its module-level singleton opens the
// store on import), so it must be the first import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { sortedBatches } from '../domain/batch.js';
import { activeWork, AWAITING_TASTING, TASTED } from '../domain/lastEvent.js';

beforeEach(() => {
  // A fresh database per test — the repository opens its connection when
  // createRepository() runs, after this reset.
  globalThis.indexedDB = new IDBFactory();
});

async function seededFromStore() {
  const repository = createRepository();
  await seedIfEmpty(repository);
  const [versions, batches, recipes] = await Promise.all([
    repository.listVersions(),
    repository.getAllBatches(),
    repository.listRecipes(),
  ]);
  return { versions, batches, recipes };
}

describe('seeded batches read back from the store', () => {
  it.each([
    ['coconut', 'coconut-v2-batch-01'],
    ['strawberry', 'strawberry-v2-1-batch-01'],
    ['mocha', 'mocha-v3-batch-01'],
  ])('%s: the newest batch is the last churned one', async (recipeId, newestBatchId) => {
    const { versions, batches } = await seededFromStore();
    const versionIds = new Set(versions.filter((v) => v.recipeId === recipeId).map((v) => v.id));
    const recipeBatches = batches.filter((b) => versionIds.has(b.versionId));
    expect(sortedBatches(recipeBatches)[0].id).toBe(newestBatchId);
  });

  it.each([
    ['coconut', AWAITING_TASTING],
    ['strawberry', TASTED],
    ['mocha', AWAITING_TASTING],
  ])('%s: standing is read from the newest batch', async (recipeId, standing) => {
    const { versions, batches, recipes } = await seededFromStore();
    const entry = activeWork(versions, batches, recipes).find((e) => e.id === recipeId);
    expect(entry.standing).toBe(standing);
  });
});
