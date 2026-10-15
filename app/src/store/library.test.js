// Real-IndexedDB proofs for the ingredient library store (Phase 6: LIB-01,
// LIB-02, D-01a). The file reads the store only through the repository seam,
// except for the raw version-8 fixture, which opens the database at an older
// version the way db.test.js does.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRepository } from './repository.js';
import { DB_NAME } from './db.js';
import { seedIfEmpty } from './seed.js';
import { exportStore, importStore, validateStoreFile, STORE_SCHEMA_VERSION } from './transfer.js';
import { library } from '../data/library.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { oliveOilRecipe, oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { computeBalance } from '../domain/composition.js';
import { buildFigures } from '../domain/figures.js';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

describe('the library store, seeded on an empty database (LIB-01)', () => {
  it('holds every data/library.js entry as { id, entry } and nothing else, read through a fresh connection', async () => {
    await seedIfEmpty(createRepository());

    const repository = createRepository();
    const records = await repository.listLibrary();
    const ids = Object.keys(library);

    expect(records).toHaveLength(ids.length);
    expect(records.map((record) => record.id).sort()).toEqual([...ids].sort());
    for (const record of records) {
      expect(Object.keys(record).sort()).toEqual(['entry', 'id']);
      expect(record.entry).toEqual(library[record.id]);
      expect(Object.hasOwn(record.entry, 'id')).toBe(false);
    }
    expect(await repository.getLibraryEntry('wholeMilk')).toEqual({ id: 'wholeMilk', entry: library.wholeMilk });
  });
});

// The hold sits where a seed's library step hands back. With
// seedLibraryIfEmpty that is after its check and its write, which are one
// transaction. If the seed ever went back to a separate read and write, the
// hold would fall between them, the window the Codex review reproduced, and
// the held-seed test below would fail.
function holdAfterLibraryStep(repository) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let reachedResolve;
  let didReach = false;
  const reached = new Promise((resolve) => {
    reachedResolve = resolve;
  });
  const held = { ...repository };
  for (const name of ['seedLibraryIfEmpty', 'listLibrary', 'putAllLibrary']) {
    held[name] = async (...args) => {
      const result = await repository[name](...args);
      if (!didReach) {
        didReach = true;
        reachedResolve(result);
      }
      await gate;
      return result;
    };
  }
  return { repository: held, reached, release: () => release() };
}

const seedCounts = {
  recipes: seedRecipeGroups.length,
  versions: seedRecipeGroups.flatMap((g) => g.versions).length,
  batches: seedRecipeGroups.flatMap((g) => g.batches).length,
};

async function expectOneRecordPerSeedId(repository) {
  const held = {
    recipes: await repository.listRecipes(),
    versions: await repository.listVersions(),
    batches: await repository.getAllBatches(),
  };
  for (const [name, records] of Object.entries(held)) {
    expect(records).toHaveLength(seedCounts[name]);
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
  }
}

describe('seeding twice and in parallel (LIB-01 edges)', () => {
  it('seeding twice leaves the same library and no more versions', async () => {
    const repository = createRepository();
    await seedIfEmpty(repository);
    const afterFirst = await createRepository().listLibrary();

    await seedIfEmpty(repository);
    const fresh = createRepository();
    const afterSecond = await fresh.listLibrary();

    expect(afterSecond).toHaveLength(Object.keys(library).length);
    expect(afterSecond).toEqual(afterFirst);
    expect(await fresh.listVersions()).toHaveLength(seedCounts.versions);
  });

  it('two connections seeding at once end with one record per seed id in every store', async () => {
    await Promise.all([seedIfEmpty(createRepository()), seedIfEmpty(createRepository())]);

    const fresh = createRepository();
    const records = await fresh.listLibrary();
    expect(records).toHaveLength(Object.keys(library).length);
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    await expectOneRecordPerSeedId(fresh);
  });

  it('a seed held after its library step does not overwrite a library record changed meanwhile (D-04; review item 1)', async () => {
    const tabA = createRepository();
    const tabB = createRepository();
    const held = holdAfterLibraryStep(tabA);
    const seedA = seedIfEmpty(held.repository);

    // Tab A found the library empty and seeded it.
    expect(await held.reached).toBe(true);

    // Tab B's library step finds the library filled; tab A is still held
    // before its versions guard, so tab B writes recipes, batches, versions.
    await seedIfEmpty(tabB);

    // The write an import makes to the library store. Plan 03 repeats this
    // test with a real importStore.
    const changed = {
      id: 'sucrose',
      entry: {
        ...library.sucrose,
        composition: { ...library.sucrose.composition, pac: library.sucrose.composition.pac * 2 },
      },
    };
    await tabB.putAllLibrary([changed]);

    held.release();
    await seedA;

    const fresh = createRepository();
    expect(await fresh.getLibraryEntry('sucrose')).toEqual(changed);
    const records = await fresh.listLibrary();
    expect(records).toHaveLength(Object.keys(library).length);
    for (const record of records) {
      if (record.id !== 'sucrose') expect(record.entry).toEqual(library[record.id]);
    }
    await expectOneRecordPerSeedId(fresh);
  });
});

// Builds the raw version-8 database as db.test.js's seedOldProfile does, puts
// each [storeName, record] pair, and closes so the repository can upgrade it.
async function openVersion8Profile(records) {
  const oldDb = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 8);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('versions', { keyPath: 'id' });
      db.createObjectStore('batches', { keyPath: 'id' }).createIndex('by-version', 'versionId');
      db.createObjectStore('recipes', { keyPath: 'id' });
      db.createObjectStore('drafts', { keyPath: 'versionId' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  for (const [name, record] of records) {
    await new Promise((resolve, reject) => {
      const tx = oldDb.transaction(name, 'readwrite');
      tx.objectStore(name).put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  oldDb.close();
}

describe('a profile left at version 8, through the seed (D-01, D-01a, success criterion 2)', () => {
  it('opens at 9 with its four records and figures unchanged, and gains the full library', async () => {
    const draft = { versionId: oliveOilVersion.id, note: 'kept-draft' };
    const figuresBefore = buildFigures(oliveOilVersion);
    const balanceBefore = computeBalance(oliveOilVersion.rows);
    const batchBalanceBefore = computeBalance(augustSecondBatch.snapshot.rows);

    await openVersion8Profile([
      ['recipes', oliveOilRecipe],
      ['versions', oliveOilVersion],
      ['batches', augustSecondBatch],
      ['drafts', draft],
    ]);
    await seedIfEmpty(createRepository());

    const fresh = createRepository();
    // Versions were present, so only the library guard ran (D-04): no other
    // seed recipe or version was added.
    expect(await fresh.listRecipes()).toEqual([oliveOilRecipe]);
    expect(await fresh.listVersions()).toEqual([oliveOilVersion]);
    expect(await fresh.getAllBatches()).toEqual([augustSecondBatch]);
    expect(await fresh.listDrafts()).toEqual([draft]);
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(library).length);

    const [version] = await fresh.listVersions();
    const [batch] = await fresh.getAllBatches();
    expect(buildFigures(version)).toEqual(figuresBefore);
    expect(computeBalance(version.rows)).toEqual(balanceBefore);
    expect(computeBalance(batch.snapshot.rows)).toEqual(batchBalanceBefore);
  });
});

describe('who reads data/library.js, and who imports idb (success criterion 1, D-05)', () => {
  const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const labels = readdirSync(srcDir, { recursive: true })
    .map((p) => p.split(path.sep).join('/'))
    .filter((p) => (p.endsWith('.js') || p.endsWith('.jsx')) && !p.includes('.test.'))
    .sort();
  const importers = (pattern) =>
    labels.filter((label) => pattern.test(readFileSync(path.join(srcDir, label), 'utf8')));

  it('only store/seed.js and files directly under data/ import the library data; only store/db.js imports idb', () => {
    const libraryImporters = importers(/from\s+'[^']*\/library\.js'/);
    for (const label of libraryImporters) {
      expect(label === 'store/seed.js' || /^data\/[^/]+\.js$/.test(label), label).toBe(true);
    }
    expect(libraryImporters).toEqual(expect.arrayContaining(['store/seed.js', 'data/olive-oil.js']));
    expect(libraryImporters).not.toContain('store/db.js');

    expect(importers(/from\s+'idb'/)).toEqual(['store/db.js']);
  });
});

// Reads the persisted versions and batches through a new connection every
// call, never an object the test holds, and returns the figures computed
// from what the store returned.
async function figuresFromStore() {
  const repository = createRepository();
  const versions = await repository.listVersions();
  const batches = await repository.getAllBatches();
  return {
    versions: Object.fromEntries(
      versions.map((version) => [version.id, { balance: computeBalance(version.rows), figures: buildFigures(version) }]),
    ),
    batches: Object.fromEntries(
      batches.map((batch) => [batch.id, { snapshot: batch.snapshot, balance: computeBalance(batch.snapshot.rows) }]),
    ),
  };
}

// Sucrose's record with its PAC doubled and its sugar halved, written through
// the repository; returns the changed record.
async function changeSucrose(repository) {
  const { entry } = await repository.getLibraryEntry('sucrose');
  const changed = {
    id: 'sucrose',
    entry: { ...entry, composition: { ...entry.composition, pac: entry.composition.pac * 2, sugar: 0.5 } },
  };
  await repository.putAllLibrary([changed]);
  return changed;
}

describe('a change to a library entry moves no stored figure (LIB-02, success criterion 3)', () => {
  const usesSucrose = (rows) => rows.some((row) => row.ingredient.name === library.sucrose.name);

  it('changing sucrose in the library leaves every stored version balance, six figures and batch snapshot as they were', async () => {
    await seedIfEmpty(createRepository());
    const before = await figuresFromStore();

    // Not vacuous: stored versions and batch snapshots use sucrose.
    const stored = createRepository();
    expect((await stored.listVersions()).some((version) => usesSucrose(version.rows))).toBe(true);
    expect((await stored.getAllBatches()).some((batch) => usesSucrose(batch.snapshot.rows))).toBe(true);

    // Change the record: pac doubled, sugar halved.
    const changed = await changeSucrose(stored);

    // The change landed.
    const landed = await createRepository().getLibraryEntry('sucrose');
    expect(landed.entry.composition.pac).toBe(library.sucrose.composition.pac * 2);

    // The change would matter: a row that read the library would move PAC.
    const oliveOil = (await createRepository().listVersions()).find((version) => version.id === 'olive-oil-ice-cream-v1');
    const swapped = oliveOil.rows.map((row) =>
      row.ingredient.name === library.sucrose.name ? { ...row, ingredient: changed.entry } : row,
    );
    expect(computeBalance(swapped).pac).not.toBe(before.versions['olive-oil-ice-cream-v1'].balance.pac);

    // The proof.
    expect(await figuresFromStore()).toEqual(before);
  });

  it('the change survives export and import into a fresh store, and still moves no figure (LIB-02, LIB-03)', async () => {
    await seedIfEmpty(createRepository());
    const before = await figuresFromStore();
    const changed = await changeSucrose(createRepository());

    const file = JSON.parse(JSON.stringify(await exportStore(createRepository())));
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });
    expect(file.library).toHaveLength(Object.keys(library).length);
    expect(Object.hasOwn(file, 'drafts')).toBe(false);

    globalThis.indexedDB = new IDBFactory();
    expect(await importStore(createRepository(), file)).toEqual({ ok: true, errors: [] });

    // Now reading the target store.
    expect(await figuresFromStore()).toEqual(before);
    const fresh = createRepository();
    expect(await fresh.getLibraryEntry('sucrose')).toEqual(changed);
    expect((await fresh.getLibraryEntry('sucrose')).entry.composition.pac).toBe(library.sucrose.composition.pac * 2);
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(library).length);
  });
});

describe('export and import carry the library (LIB-03, D-04a, D-07)', () => {
  const fileOf = (parts) =>
    JSON.parse(
      JSON.stringify({
        app: 'sprinkles',
        schemaVersion: STORE_SCHEMA_VERSION,
        exportedAt: '2026-10-14T00:00:00.000Z',
        recipes: [],
        versions: [],
        batches: [],
        library: [],
        ...parts,
      }),
    );

  it("a file whose library list is empty leaves an unseeded store's library empty, and the next boot refills it (D-04a)", async () => {
    const file = fileOf({ recipes: [oliveOilRecipe], versions: [oliveOilVersion], batches: [augustSecondBatch] });

    expect(await importStore(createRepository(), file)).toEqual({ ok: true, errors: [] });
    expect(await createRepository().listLibrary()).toEqual([]);

    await seedIfEmpty(createRepository());

    const fresh = createRepository();
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(library).length);
    // Versions were present, so no seed recipe or version was added.
    expect(await fresh.listVersions()).toEqual([oliveOilVersion]);
    expect(await fresh.listRecipes()).toEqual([oliveOilRecipe]);
  });

  it('an import upserts the library by id: the record the file names is replaced and the others stay (D-07)', async () => {
    await seedIfEmpty(createRepository());
    const file = fileOf({ library: [{ id: 'sucrose', entry: { ...library.sucrose, name: 'Sucrose, renamed' } }] });

    expect(await importStore(createRepository(), file)).toEqual({ ok: true, errors: [] });

    const fresh = createRepository();
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(library).length);
    expect((await fresh.getLibraryEntry('sucrose')).entry.name).toBe('Sucrose, renamed');
    expect((await fresh.getLibraryEntry('wholeMilk')).entry).toEqual(library.wholeMilk);
  });

  it('a seed held after its library step does not overwrite a library record an import changed meanwhile (D-04, D-07; review item 1, import leg)', async () => {
    const tabA = createRepository();
    const tabB = createRepository();
    const held = holdAfterLibraryStep(tabA);
    const seedA = seedIfEmpty(held.repository);

    // Tab A found the library empty and seeded it.
    expect(await held.reached).toBe(true);

    await seedIfEmpty(tabB);

    const file = fileOf({
      library: [
        {
          id: 'sucrose',
          entry: {
            ...library.sucrose,
            composition: { ...library.sucrose.composition, pac: library.sucrose.composition.pac * 2 },
          },
        },
      ],
    });
    expect(await importStore(tabB, file)).toEqual({ ok: true, errors: [] });

    held.release();
    await seedA;

    const fresh = createRepository();
    const sucrose = await fresh.getLibraryEntry('sucrose');
    expect(sucrose.entry.composition.pac).toBe(library.sucrose.composition.pac * 2);
    expect(sucrose.entry).toEqual(file.library[0].entry);
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(library).length);
  });
});
