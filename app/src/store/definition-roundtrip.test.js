// The definitions a recipe and a batch carry, through creation, the store file
// and a reopen (TASTE-03, decision 3, D-03a, D-03b). A version declares a
// magnitude scale under a minted key and renames Oil under its kept key; the
// batch made from it keeps both, and the core words it was recorded with; an
// export of that profile validates and imports into a fresh one with every
// definition deep-equal and every mark on its key. The test proves storage and
// transfer only: how a magnitude scale reads on screen is Phase 12's.
//
// The last two cases close the loop between the catalog import (plan 09-10) and
// the batch validator: a catalog an import accepts, and one it refuses, each
// leave a store whose next recorded batch this build exports, validates and
// imports, so valid tables imply valid batches.
//
// Real IndexedDB through fake-indexeddb, a fresh IDBFactory per test;
// fake-indexeddb/auto comes first because repository.js opens its store on import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { loadCatalog } from './catalog.js';
import { exportStore, importStore, validateStoreFile } from './transfer.js';
import { storeFileOf } from './storeFile.fixtures.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { createBatch } from '../domain/batch.js';
import { createChildVersion } from '../domain/lineage.js';
import { mintScaleKey } from '../domain/catalog.js';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

const OLIVE_OIL_V1 = 'olive-oil-ice-cream-v1';
const NOW = '2026-10-18T09:00:00.000Z';

const TANG = { key: mintScaleKey('t1'), name: 'Tang', low: 'faint', high: 'sharp', kind: 'magnitude', group: 'declared' };
const OLIVE = { key: 'oil', name: 'Olive', low: 'mild', high: 'peppery', kind: 'goldilocks', group: 'declared' };

const serialised = (value) => JSON.parse(JSON.stringify(value));

async function seededProfile() {
  const repository = createRepository();
  await seedIfEmpty(repository);
  return repository;
}

// A child of the stored olive oil v1 that declares the magnitude scale and the renamed Oil.
async function storeChildWithDefinitions(repository) {
  const parent = await repository.getVersion(OLIVE_OIL_V1);
  const child = {
    ...createChildVersion(
      parent,
      {
        versionLabel: 'v2 tangy',
        reason: 'a tangier oil',
        citedBatchId: null,
        rows: parent.rows,
        method: parent.method,
        sheetTitle: parent.sheetTitle,
        sheetDescription: parent.sheetDescription,
        authored: parent.authored,
      },
      { id: 'rt-child', now: NOW },
    ),
    declaredAxes: [structuredClone(TANG), structuredClone(OLIVE)],
  };
  await repository.createVersion(child);
  return child;
}

// Records a batch the way the record pen's save does: createBatch with the catalog
// in hand, then saveBatch.
async function recordBatch(repository, version, marks, catalog, id = 'rt-batch') {
  const batch = createBatch(
    version,
    { churnDate: '2026-10-18', asMade: {}, stepChanges: {} },
    { tastedDate: '2026-10-19', marks },
    { id, now: NOW, catalog },
  );
  await repository.saveBatch(batch);
  return batch;
}

async function importInto(file) {
  globalThis.indexedDB = new IDBFactory();
  const target = createRepository();
  expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });
  return target;
}

describe('a magnitude scale and a renamed declared scale survive creation, export, import and reopening (TASTE-03)', () => {
  it('keeps every definition, its kind included, and every mark on its key', async () => {
    const source = await seededProfile();
    const child = await storeChildWithDefinitions(source);
    const batch = await recordBatch(source, child, { [TANG.key]: 2, oil: 5, sweetness: 3 }, structuredClone(SEED_CATALOG));

    const stored = await source.getVersion(child.id);
    expect(stored.declaredAxes).toEqual([TANG, OLIVE]);
    expect(stored.declaredAxes[0].kind).toBe('magnitude');

    const file = serialised(await exportStore(source));
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });
    const target = await importInto(file);

    const imported = await target.getVersion(child.id);
    expect(imported.declaredAxes).toEqual(stored.declaredAxes);
    const importedBatch = await target.getBatch(batch.id);
    expect(importedBatch.snapshot.declaredAxes).toEqual(batch.snapshot.declaredAxes);
    expect(importedBatch.snapshot.coreScales).toEqual(batch.snapshot.coreScales);
    expect(importedBatch.snapshot.coreProblems).toEqual(batch.snapshot.coreProblems);
    expect(importedBatch.tasting.marks).toEqual({ [TANG.key]: 2, oil: 5, sweetness: 3 });

    // A reopened store (a second repository on the same database) holds the same.
    const reopened = createRepository();
    expect((await reopened.getVersion(child.id)).declaredAxes).toEqual(stored.declaredAxes);
    const reopenedBatch = await reopened.getBatch(batch.id);
    expect(reopenedBatch.snapshot.declaredAxes).toEqual(batch.snapshot.declaredAxes);
    expect(reopenedBatch.snapshot.coreScales).toEqual(batch.snapshot.coreScales);
    expect(reopenedBatch.snapshot.coreProblems).toEqual(batch.snapshot.coreProblems);
    expect(reopenedBatch.tasting.marks).toEqual({ [TANG.key]: 2, oil: 5, sweetness: 3 });
  });

  it('keeps the renamed Oil under its own key: the batch snapshot names Olive, not the table row', async () => {
    const source = await seededProfile();
    const child = await storeChildWithDefinitions(source);
    const batch = await recordBatch(source, child, { oil: 4 }, structuredClone(SEED_CATALOG));

    const target = await importInto(serialised(await exportStore(source)));

    const importedBatch = await target.getBatch(batch.id);
    const oil = importedBatch.snapshot.declaredAxes.find((scale) => scale.key === 'oil');
    expect(oil).toEqual(OLIVE);
    expect((await target.listScales()).find((row) => row.key === 'oil').name).toBe('Oil');
  });

  it('records a batch from an accepted promotion: its export validates and imports into a fresh profile', async () => {
    const repository = await seededProfile();
    const creaminess = { id: 'creaminess', key: 'creaminess', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'core', order: 7 };
    const scales = [...structuredClone(SEED_CATALOG.scales).map((row) => (row.key === 'sweetness' ? { ...row, group: 'declared' } : row)), creaminess];
    expect(await importStore(repository, serialised(storeFileOf({ scales })))).toEqual({ ok: true, errors: [] });

    const oliveOil = await repository.getVersion(OLIVE_OIL_V1);
    const batch = await recordBatch(repository, oliveOil, { creaminess: 3, oil: 4 }, await loadCatalog(repository));

    const coreKeys = batch.snapshot.coreScales.map((scale) => scale.key);
    expect(coreKeys).toEqual(['hardness', 'scoopability', 'smoothness', 'creaminess']);
    const declaredKeys = batch.snapshot.declaredAxes.map((scale) => scale.key);
    expect(coreKeys.some((key) => declaredKeys.includes(key))).toBe(false);

    const file = serialised(await exportStore(repository));
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });
    const target = await importInto(file);
    expect((await target.getBatch(batch.id)).tasting.marks).toEqual({ creaminess: 3, oil: 4 });
  });

  it('records a batch after a refused duplicate-name import: it snapshots the four seeded words once each and exports', async () => {
    const repository = await seededProfile();
    const duplicate = { id: 'icy', name: 'Coarse, icy', order: 5 };
    const refused = await importStore(repository, serialised(storeFileOf({ problems: [...structuredClone(SEED_CATALOG.problems), duplicate] })));
    expect(refused.ok).toBe(false);

    const oliveOil = await repository.getVersion(OLIVE_OIL_V1);
    const batch = await recordBatch(repository, oliveOil, { sweetness: 3 }, await loadCatalog(repository));

    expect([...batch.snapshot.coreProblems].sort()).toEqual(['Coarse, icy', 'Greasy film', 'Gummy, elastic', 'Sandy, gritty']);
    expect(new Set(batch.snapshot.coreProblems).size).toBe(4);

    const file = serialised(await exportStore(repository));
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });
    await importInto(file);
  });

  it('refuses a batch whose snapshot holds a malformed coreProblems list without throwing', async () => {
    const repository = await seededProfile();
    const oliveOil = await repository.getVersion(OLIVE_OIL_V1);
    await recordBatch(repository, oliveOil, { sweetness: 3 }, structuredClone(SEED_CATALOG));
    const file = serialised(await exportStore(repository));
    const recorded = file.batches.findIndex((batch) => batch.id === 'rt-batch');
    file.batches[recorded].snapshot.coreProblems = null;
    file.batches[recorded].tasting.defects = ['Coarse, icy'];

    let result;
    expect(() => {
      result = validateStoreFile(file);
    }).not.toThrow();
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.startsWith(`$.batches[${recorded}].snapshot.coreProblems`))).toBe(true);
  });
});
