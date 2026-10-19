// The 9-to-10 proof against a real IndexedDB (LIB-06, decisions 2 and 5): a
// stored version-9 profile opens at DB_VERSION with every old store cleared and
// reseeded, the library holds the larger seed, and an interrupted upgrade
// leaves the profile at 9 for the next open to run again. It also proves, on the
// database the bump produces, that the definitions land where they belong
// (TASTE-03, criterion 2) and that a batch's marks survive a later change to the
// scales and problems tables, to a later version's own definitions, and an
// export, an import into a fresh profile and a reopen (TASTE-03, criterion 4).
// The tables are edited through a raw IndexedDB transaction here, never through
// app code. Lives outside
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
import { loadCatalog } from '../src/store/catalog.js';
import { exportStore, importStore, validateStoreFile } from '../src/store/transfer.js';
import { augustSecondBatch } from '../src/data/batch-2026-08-02.js';
import { createBatch } from '../src/domain/batch.js';
import { createChildVersion } from '../src/domain/lineage.js';
import { axesForBatch, readMarkWord } from '../src/domain/axes.js';
import { coreProblemsForBatch } from '../src/domain/battery.js';
import { coreScaleDefinitions, isScaleDefinition, problemNames, scaleDefinition } from '../src/domain/catalog.js';

// What a fresh profile's library holds: the reviewed dataset merged under the 26.
const seededLibrary = { ...librarySeedDb, ...library };

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

// The store reads rows back in key order (alphabetical by id), not seed order.
const byId = (rows) => [...rows].sort((a, b) => a.id.localeCompare(b.id));

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
    expect(byId(await repository.listStyles())).toEqual(byId(SEED_CATALOG.styles));
    expect(byId(await repository.listScales())).toEqual(byId(SEED_CATALOG.scales));
    expect(byId(await repository.listProblems())).toEqual(byId(SEED_CATALOG.problems));

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

// ---------------------------------------------------------------------------
// Criterion 2 and criterion 4 on the bumped database (plan 09-15).

const OLIVE_OIL_V1 = 'olive-oil-ice-cream-v1';
const NOW = '2026-10-19T09:00:00.000Z';
const serialised = (value) => JSON.parse(JSON.stringify(value));

// A stored version-9 profile, upgraded and seeded: the database the bump produces.
async function upgradedProfile() {
  await storeVersion9Profile();
  const repository = createRepository();
  await seedIfEmpty(repository);
  return repository;
}

// Puts rows into and deletes keys from a seed table through a raw readwrite
// transaction, the way a later edit to the table would, never through app code.
async function editTable(storeName, { put = [], remove = [] }) {
  await inspect(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        for (const row of put) store.put(row);
        for (const key of remove) store.delete(key);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      }),
  );
}

// What a stored batch shows: its scales with their words, what its marks read
// as, its core problem words. Everything comes from the batch the store holds.
function whatTheBatchShows(batch) {
  const axes = axesForBatch(batch);
  const axisOf = (key) => axes.find((axis) => axis.key === key);
  return {
    axes: axes.map(({ key, name, low, high }) => ({ key, name, low, high })),
    marks: batch.tasting.marks,
    sweetnessRead: readMarkWord(axisOf('sweetness'), batch.tasting.marks.sweetness),
    oilRead: readMarkWord(axisOf('oil'), batch.tasting.marks.oil),
    coreProblems: coreProblemsForBatch(batch),
  };
}

const wordsOf = (shown, key) => shown.axes.find((axis) => axis.key === key);

// The later change to the tables: Sweetness gets new words, Oil's row goes, and a
// core problem is renamed. The 2 Aug batch marked sweetness 4 and oil 4.
async function changeTheTables(repository) {
  const scales = await repository.listScales();
  const problems = await repository.listProblems();
  const sweetness = scales.find((row) => row.key === 'sweetness');
  const coarse = problems.find((row) => row.name === 'Coarse, icy');
  await editTable('scales', { put: [{ ...sweetness, low: 'flat', high: 'cloying' }], remove: ['oil'] });
  await editTable('problems', { put: [{ ...coarse, name: 'Icy' }] });
  return loadCatalog(repository);
}

// A child of the stored olive oil v1 whose own Oil is renamed and rewritten.
async function storeChildWithOwnOil(repository) {
  const parent = await repository.getVersion(OLIVE_OIL_V1);
  const child = createChildVersion(
    parent,
    {
      versionLabel: 'v2 olive',
      reason: 'a gentler oil',
      citedBatchId: null,
      rows: parent.rows,
      method: parent.method,
      sheetTitle: parent.sheetTitle,
      sheetDescription: parent.sheetDescription,
      authored: parent.authored,
    },
    { id: 'upgrade-child', now: NOW },
  );
  child.declaredAxes = child.declaredAxes.map((scale) =>
    scale.key === 'oil' ? { ...scale, name: 'Olive', low: 'mild', high: 'peppery' } : scale,
  );
  await repository.createVersion(child);
  return child;
}

describe('criterion 2: a stored version-9 profile lands the definitions where they belong (TASTE-03)', () => {
  it('olive oil declares the scales table’s Body and Oil rows, and the 2 Aug batch holds the tables’ core scales and problems', async () => {
    const repository = await upgradedProfile();
    const catalog = await loadCatalog(repository);
    const row = (key) => scaleDefinition(catalog.scales.find((candidate) => candidate.key === key));

    const oliveOil = await repository.getVersion(OLIVE_OIL_V1);
    expect(oliveOil.declaredAxes).toEqual([row('body'), row('oil')]);

    const batch = await repository.getBatch(augustSecondBatch.id);
    expect(batch.snapshot.coreScales).toEqual(coreScaleDefinitions(catalog.scales));
    expect(batch.snapshot.coreScales).toHaveLength(4);
    expect(batch.snapshot.coreProblems).toEqual(problemNames(catalog.problems));
    expect(batch.snapshot.coreProblems).toHaveLength(4);
  });
});

describe('criterion 4: a batch’s marks survive a later change to the tables, through export, import and a reopen (TASTE-03)', () => {
  it('starts as the 2 Aug batch marks it: Sweetness less and more, Oil faint and strong, marks 4 and 4', async () => {
    const repository = await upgradedProfile();
    const shown = whatTheBatchShows(await repository.getBatch(augustSecondBatch.id));
    expect(shown.marks).toEqual({ sweetness: 4, oil: 4 });
    expect(wordsOf(shown, 'sweetness')).toEqual({ key: 'sweetness', name: 'Sweetness', low: 'less', high: 'more' });
    expect(wordsOf(shown, 'oil')).toEqual({ key: 'oil', name: 'Oil', low: 'faint', high: 'strong' });
    expect(shown.sweetnessRead).toBe('more');
    expect(shown.oilRead).toBe('strong');
    expect(shown.coreProblems[0]).toBe('Coarse, icy');
  });

  it('rewriting Sweetness, deleting Oil’s row and renaming a core problem moves nothing the batch shows', async () => {
    const repository = await upgradedProfile();
    const before = whatTheBatchShows(await repository.getBatch(augustSecondBatch.id));

    const catalog = await changeTheTables(repository);

    // The edit is real: the reloaded catalog holds the new words and no Oil row.
    expect(catalog.scales.find((row) => row.key === 'sweetness')).toMatchObject({ low: 'flat', high: 'cloying' });
    expect(catalog.scales.some((row) => row.key === 'oil')).toBe(false);
    expect(problemNames(catalog.problems)).toContain('Icy');
    expect(problemNames(catalog.problems)).not.toContain('Coarse, icy');

    // A batch taken after the edit does read the new words, so the equality
    // below could fail: the old batch is protected by its snapshot, not by
    // the edit having done nothing.
    const fresh = createBatch(
      await repository.getVersion(OLIVE_OIL_V1),
      { churnDate: '2026-10-19', asMade: {}, stepChanges: {} },
      { tastedDate: '2026-10-20', marks: { sweetness: 4 } },
      { id: 'after-the-edit', now: NOW, catalog },
    );
    expect(axesForBatch(fresh).find((axis) => axis.key === 'sweetness')).toMatchObject({ low: 'flat', high: 'cloying' });
    expect(coreProblemsForBatch(fresh)).toContain('Icy');

    // The 2 Aug batch, read again from the store (a second repository), is unmoved.
    const after = whatTheBatchShows(await createRepository().getBatch(augustSecondBatch.id));
    expect(after).toEqual(before);
    expect(wordsOf(after, 'sweetness')).toMatchObject({ name: 'Sweetness', low: 'less', high: 'more' });
    expect(wordsOf(after, 'oil')).toMatchObject({ name: 'Oil', low: 'faint', high: 'strong' });
    expect(after.sweetnessRead).toBe('more');
    expect(after.oilRead).toBe('strong');
    expect(after.coreProblems[0]).toBe('Coarse, icy');
    expect(Object.keys(after.marks).every((key) => after.axes.some((axis) => axis.key === key))).toBe(true);
  });

  it('a later version’s own renamed Oil leaves the batch’s Oil words and olive oil v1’s own definitions unmoved', async () => {
    const repository = await upgradedProfile();
    const before = whatTheBatchShows(await repository.getBatch(augustSecondBatch.id));
    const parentBefore = (await repository.getVersion(OLIVE_OIL_V1)).declaredAxes;

    const child = await storeChildWithOwnOil(repository);

    // The edit landed: the stored child declares Olive, mild and peppery.
    const storedChild = await repository.getVersion(child.id);
    expect(storedChild.declaredAxes.find((scale) => scale.key === 'oil')).toMatchObject({ name: 'Olive', low: 'mild', high: 'peppery' });

    const after = whatTheBatchShows(await repository.getBatch(augustSecondBatch.id));
    expect(after).toEqual(before);
    expect(wordsOf(after, 'oil')).toMatchObject({ name: 'Oil', low: 'faint', high: 'strong' });
    expect((await repository.getVersion(OLIVE_OIL_V1)).declaredAxes).toEqual(parentBefore);
  });

  it('holds through export, a JSON round trip, import into a fresh profile and a reopen', async () => {
    const source = await upgradedProfile();
    const batchBefore = await source.getBatch(augustSecondBatch.id);
    const before = whatTheBatchShows(batchBefore);
    await changeTheTables(source);
    const child = await storeChildWithOwnOil(source);

    const file = serialised(await exportStore(source));
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });
    // The edits are in the file: no Oil row, Sweetness rewritten, the child's own Oil.
    expect(file.scales.some((row) => row.key === 'oil')).toBe(false);
    expect(file.scales.find((row) => row.key === 'sweetness')).toMatchObject({ low: 'flat', high: 'cloying' });
    expect(file.problems.map((row) => row.name)).toContain('Icy');
    expect(file.versions.find((version) => version.id === child.id).declaredAxes.find((scale) => scale.key === 'oil').name).toBe('Olive');

    globalThis.indexedDB = new IDBFactory();
    const target = createRepository();
    expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });

    for (const repository of [target, createRepository()]) {
      const batch = await repository.getBatch(augustSecondBatch.id);
      expect(batch).toEqual(batchBefore);
      expect(batch.snapshot).toEqual(batchBefore.snapshot);
      expect(batch.tasting.marks).toEqual({ sweetness: 4, oil: 4 });
      const after = whatTheBatchShows(batch);
      expect(after).toEqual(before);
      expect(wordsOf(after, 'sweetness')).toMatchObject({ low: 'less', high: 'more' });
      expect(wordsOf(after, 'oil')).toMatchObject({ name: 'Oil', low: 'faint', high: 'strong' });
      expect((await repository.getVersion(OLIVE_OIL_V1)).sheetCode).toBe('64JH-G408');
    }
  });
});
