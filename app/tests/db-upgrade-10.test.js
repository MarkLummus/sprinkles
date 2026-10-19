// The 9-to-10 proof against a real IndexedDB (LIB-06, decisions 2 and 5): a
// stored version-9 profile opens at DB_VERSION with every old store cleared and
// reseeded, the library holds the larger seed, and an interrupted upgrade
// leaves the profile at 9 for the next open to run again. Lives outside
// app/src like db-reset.test.js, because it opens the database directly to
// build the version-9 fixture; it never imports idb itself.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { DB_NAME, DB_VERSION, upgradeStores } from '../src/store/db.js';
import { createRepository } from '../src/store/repository.js';
import { seedIfEmpty } from '../src/store/seed.js';
import { library } from '../src/data/library.js';
import { librarySeedDb } from '../src/data/library-seed-db.js';
import { seedRecipeGroups } from '../src/data/seed-recipes.js';
import { MACHINE_ROWS } from '../src/data/machines.js';
import { SEED_CATALOG } from '../src/data/seed-catalog.js';
import { validateLibraryRecord } from '../src/store/seedTables.js';
import { isScaleDefinition } from '../src/domain/catalog.js';

// What a fresh profile's library holds: the reviewed dataset merged under the 26.
const seededLibrary = { ...librarySeedDb, ...library };

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

// The data a profile left at version 9 holds: a recipe, a version, a batch, a
// draft, the 26 library records and one record an import wrote.
const storedRecipe = { id: 'old-recipe', name: 'Old', description: '' };
const storedVersion = { id: 'old-version', recipeId: 'old-recipe', name: 'Old v1', rows: [] };
const storedBatch = { id: 'old-batch', versionId: 'old-version' };
const storedDraft = { versionId: 'old-version', note: 'old draft' };
const importedRecord = { id: 'importedThing', entry: { name: 'Imported', composition: { fat: 1 } } };
const storedLibrary = [...Object.entries(library).map(([id, entry]) => ({ id, entry })), importedRecord];

const VERSION_9_RECORDS = [
  ['recipes', storedRecipe],
  ['versions', storedVersion],
  ['batches', storedBatch],
  ['drafts', storedDraft],
  ...storedLibrary.map((record) => ['library', record]),
];

// Builds the raw version-9 database (the five stores a profile at 9 held),
// puts each [storeName, record] pair and closes, so the app can upgrade it.
async function storeVersion9Profile() {
  const oldDb = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 9);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('versions', { keyPath: 'id' });
      db.createObjectStore('batches', { keyPath: 'id' }).createIndex('by-version', 'versionId');
      db.createObjectStore('recipes', { keyPath: 'id' });
      db.createObjectStore('drafts', { keyPath: 'versionId' });
      db.createObjectStore('library', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  for (const [name, record] of VERSION_9_RECORDS) {
    await new Promise((resolve, reject) => {
      const tx = oldDb.transaction(name, 'readwrite');
      tx.objectStore(name).put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  oldDb.close();
}

// Opens the database as it stands (no version asked for), reads what a test
// wants through `read(db)`, and closes.
async function inspect(read) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await read(db);
  } finally {
    db.close();
  }
}

function getAll(db, name) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(name).objectStore(name).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

describe('a stored version-9 profile opens at DB_VERSION reset and reseeded (LIB-06, decisions 2 and 5)', () => {
  it('opens at 10 with the larger library, the Whynter machine and the seeded recipes in the new shapes', async () => {
    await storeVersion9Profile();

    const repository = createRepository();
    await seedIfEmpty(repository);

    expect(DB_VERSION).toBe(10);
    expect(await inspect((db) => db.version)).toBe(DB_VERSION);

    // The library is the larger seed and not the record an import wrote.
    const records = await repository.listLibrary();
    expect(records.map((record) => record.id).sort()).toEqual(Object.keys(seededLibrary).sort());
    expect(records.some((record) => record.id === 'importedThing')).toBe(false);

    // Every reseeded library record passes the shared validator, six D-20 keys included.
    for (const record of records) {
      const errors = [];
      validateLibraryRecord(record, `$.library.${record.id}`, errors);
      expect(errors, record.id).toEqual([]);
    }

    // All four seed tables hold their committed rows (LIB-09).
    expect(await repository.listMachines()).toEqual(SEED_CATALOG.machines);
    expect(await repository.listStyles()).toEqual(SEED_CATALOG.styles);
    expect(await repository.listScales()).toEqual(SEED_CATALOG.scales);
    expect(await repository.listProblems()).toEqual(SEED_CATALOG.problems);

    // Only the seeded versions: the stored version-9 one is gone.
    const versions = await repository.listVersions();
    const seededIds = seedRecipeGroups.flatMap((group) => group.versions.map((version) => version.id));
    expect(versions.map((version) => version.id).sort()).toEqual([...seededIds].sort());
    expect(await repository.getVersion('old-version')).toBeUndefined();
    expect(await repository.getRecipe('old-recipe')).toBeUndefined();
    expect(await repository.getBatch('old-batch')).toBeUndefined();

    // Olive oil v1 comes back in the new shapes (D-05, D-19, plan 09-05).
    const oliveOil = versions.find((version) => version.id === 'olive-oil-ice-cream-v1');
    expect(oliveOil.sheetCode).toBe('64JH-G408');
    expect(oliveOil.rows.length).toBeGreaterThan(0);
    for (const row of oliveOil.rows) expect(typeof row.libraryId, row.id).toBe('string');
    expect(oliveOil.declaredAxes.length).toBeGreaterThan(0);
    for (const axis of oliveOil.declaredAxes) expect(isScaleDefinition(axis), axis.key).toBe(true);
    expect(oliveOil.serveTempC).toBeNull();
    expect(oliveOil.iceEd.servingTemperatureC).toBeNull();

    // The embedded copies carry the D-20 coefficients through the reset.
    const oilRow = oliveOil.rows.find((row) => row.libraryId === 'oliveOil');
    expect(oilRow.ingredient.fatStructural).toBe(false);
    const milkRow = oliveOil.rows.find((row) => row.libraryId === 'wholeMilk');
    expect(milkRow.ingredient.titratableAcidity).toBe(0.001496);
    expect(milkRow.ingredient.basis.titratableAcidity).toBe('derived');

    // A copied Ice Ed figure reads back from the reset store as a number.
    const mexican = versions.find((version) => version.id === 'mexican-chocolate-v1');
    expect(mexican.serveTempC).toBe(-15);

    // D-19 as amended: every reseeded version owns the figure its own Ice Ed block held.
    for (const version of versions) {
      expect(Object.hasOwn(version, 'serveTempC'), version.id).toBe(true);
      expect(version.serveTempC, version.id).toBe(version.iceEd.servingTemperatureC);
    }

    expect(await repository.listDrafts()).toEqual([]);
  });

  it('opening a version-10 profile again runs no destructive step, and seeding twice writes nothing the second time', async () => {
    await storeVersion9Profile();
    const first = createRepository();
    await seedIfEmpty(first);
    await first.saveDraft({ versionId: 'olive-oil-ice-cream-v1', note: 'made after the reset' });

    const second = createRepository();
    expect(await second.seedLibraryIfEmpty([{ id: 'x', entry: {} }])).toBe(false);
    expect(await second.seedTableIfEmpty('machines', MACHINE_ROWS)).toBe(false);
    await seedIfEmpty(second);

    expect(await second.listDrafts()).toEqual([{ versionId: 'olive-oil-ice-cream-v1', note: 'made after the reset' }]);
    expect(await second.listLibrary()).toHaveLength(Object.keys(seededLibrary).length);
    expect(await second.listMachines()).toEqual(MACHINE_ROWS);
  });

  it('seedTableIfEmpty refuses a store that is not one of the five seed tables', async () => {
    const repository = createRepository();
    await expect(repository.seedTableIfEmpty('versions', [])).rejects.toThrow(TypeError);
    await expect(repository.seedTableIfEmpty('drafts', [])).rejects.toThrow(TypeError);
  });

  it('an upgrade interrupted after the drops leaves the profile at 9 with its stores and records, and the next open resets it at 10', async () => {
    await storeVersion9Profile();

    // Opens at 10 by hand, runs upgradeStores (which drops the stores) and
    // aborts the versionchange transaction, the way a crash would.
    await expect(
      new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 10);
        request.onupgradeneeded = (event) => {
          upgradeStores(request.result, event.oldVersion, 10, request.transaction);
          request.transaction.abort();
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
    ).rejects.toBeTruthy();

    // The profile is still at 9 with every store and every record.
    const survived = await inspect(async (db) => ({
      version: db.version,
      stores: [...db.objectStoreNames].sort(),
      recipes: await getAll(db, 'recipes'),
      versions: await getAll(db, 'versions'),
      batches: await getAll(db, 'batches'),
      drafts: await getAll(db, 'drafts'),
      library: await getAll(db, 'library'),
    }));
    expect(survived.version).toBe(9);
    expect(survived.stores).toEqual(['batches', 'drafts', 'library', 'recipes', 'versions']);
    expect(survived.recipes).toEqual([storedRecipe]);
    expect(survived.versions).toEqual([storedVersion]);
    expect(survived.batches).toEqual([storedBatch]);
    expect(survived.drafts).toEqual([storedDraft]);
    expect(survived.library).toHaveLength(storedLibrary.length);

    // The next normal open runs the reset again.
    const repository = createRepository();
    await seedIfEmpty(repository);
    expect(await inspect((db) => db.version)).toBe(DB_VERSION);
    expect(await repository.getVersion('old-version')).toBeUndefined();
    expect(await repository.listDrafts()).toEqual([]);
    expect(await repository.listMachines()).toEqual(MACHINE_ROWS);
    expect(await repository.listLibrary()).toHaveLength(Object.keys(seededLibrary).length);
  });
});
