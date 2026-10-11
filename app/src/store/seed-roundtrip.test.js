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
import { sortedBatches, createBatch } from '../domain/batch.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { oliveOilVersion } from '../data/olive-oil.js';
import { exportStore, validateStoreFile, importStore } from './transfer.js';
import { activeWork, AWAITING_TASTING, NOT_YET_CHURNED, TASTED } from '../domain/lastEvent.js';

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
    // Undated, untasted, recorded 2026-01-13: it outranks v1, churned
    // 2025-12-13 and tasted (G-03.5-R2-5).
    ['mexican-chocolate', 'mexican-chocolate-v3-batch-01'],
  ])('%s: the newest batch is the newest one the maker made', async (recipeId, newestBatchId) => {
    const { versions, batches } = await seededFromStore();
    const versionIds = new Set(versions.filter((v) => v.recipeId === recipeId).map((v) => v.id));
    const recipeBatches = batches.filter((b) => versionIds.has(b.versionId));
    expect(sortedBatches(recipeBatches)[0].id).toBe(newestBatchId);
  });

  it.each([
    ['coconut', AWAITING_TASTING],
    ['strawberry', TASTED],
    ['mocha', AWAITING_TASTING],
    ['mexican-chocolate', AWAITING_TASTING],
  ])('%s: standing is read from the newest batch', async (recipeId, standing) => {
    const { versions, batches, recipes } = await seededFromStore();
    const entry = activeWork(versions, batches, recipes).find((e) => e.id === recipeId);
    expect(entry.standing).toBe(standing);
  });

  it('all three Home standings stay reachable across the seeded store (D-05)', async () => {
    const { versions, batches, recipes } = await seededFromStore();
    const standings = new Set(activeWork(versions, batches, recipes).map((e) => e.standing));
    expect(standings).toEqual(new Set([NOT_YET_CHURNED, AWAITING_TASTING, TASTED]));
  });
});

// Time to draw temp. is hidden on every screen (03.7.1, D-01) but stays in the
// stored shape until Phase 4's reseed (D-02): the value a batch already holds
// must come back from the store, out through an export and into a fresh store
// untouched. A guard on behaviour this phase does not change, so it passes
// before and after.
describe('a stored Time to draw temp. survives (03.7.1, D-02)', () => {
  it('reads back from the real store as the seeded 20', async () => {
    const { batches } = await seededFromStore();
    expect(batches.find((b) => b.id === augustSecondBatch.id).churn.timeToDrawTempMinutes).toBe(20);
  });

  it('survives export, validation and import into a fresh store, for every seeded batch', async () => {
    const first = createRepository();
    await seedIfEmpty(first);
    const exported = JSON.parse(JSON.stringify(await exportStore(first)));

    expect(validateStoreFile(exported)).toEqual({ ok: true, errors: [] });

    globalThis.indexedDB = new IDBFactory();
    const second = createRepository();
    expect(await importStore(second, exported)).toEqual({ ok: true, errors: [] });

    const before = await first.getAllBatches();
    const after = await second.getAllBatches();
    expect(after).toHaveLength(before.length);
    for (const batch of before) {
      const imported = after.find((b) => b.id === batch.id);
      expect(imported.churn.timeToDrawTempMinutes).toBe(batch.churn.timeToDrawTempMinutes);
    }
    const imported = await second.getBatch(augustSecondBatch.id);
    expect(imported.churn.timeToDrawTempMinutes).toBe(20);
    expect(imported).toEqual(await first.getBatch(augustSecondBatch.id));
  });
});

// The tracer's far end (04-03): declared problems are a list of 0 to 2 from the
// version through createBatch, the store file and back. The two-problem version
// is built from Olive Oil v1 with a second word that is test data, not seed data.
describe('declared problems round-trip through the store file', () => {
  const NO_CHURN = { churnDate: '2026-10-11' };

  it.each([
    ['no declared problem', []],
    ['one declared problem', ['Bitter']],
    ['two declared problems', ['Bitter', 'Salty']],
  ])('%s: the snapshot list and the ticks come back equal', async (_label, declaredFlaws) => {
    const version = { ...oliveOilVersion, id: `rt-${declaredFlaws.length}`, declaredFlaws };
    const ticks = declaredFlaws.length > 0 ? [declaredFlaws[declaredFlaws.length - 1]] : null;
    const batch = createBatch(version, NO_CHURN, { marks: {}, declaredDefects: ticks }, { id: `rt-batch-${declaredFlaws.length}`, now: '2026-10-11T09:00:00.000Z' });

    const first = createRepository();
    await seedIfEmpty(first);
    await first.putAll([version]);
    await first.putAllBatches([batch]);
    const exported = JSON.parse(JSON.stringify(await exportStore(first)));
    expect(validateStoreFile(exported)).toEqual({ ok: true, errors: [] });

    globalThis.indexedDB = new IDBFactory();
    const second = createRepository();
    expect(await importStore(second, exported)).toEqual({ ok: true, errors: [] });

    const imported = await second.getBatch(batch.id);
    expect(imported.snapshot.declaredFlaws).toEqual(declaredFlaws);
    expect(imported.tasting.declaredDefects).toEqual(ticks);
    expect(imported).toEqual(batch);
    expect((await second.getAll()).find((v) => v.id === version.id).declaredFlaws).toEqual(declaredFlaws);
  });
});
