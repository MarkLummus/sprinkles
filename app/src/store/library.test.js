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
import { librarySeedDb } from '../data/library-seed-db.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { oliveOilRecipe, oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { computeBalance } from '../domain/composition.js';
import { buildFigures } from '../domain/figures.js';
import { STAGE_IDS } from '../domain/stages.js';

// What a fresh profile's library holds: the reviewed dataset's entries merged
// under the 26 (LIB-04), the 26 winning a clash.
const seededLibrary = { ...librarySeedDb, ...library };

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

describe('the library store, seeded on an empty database (LIB-01)', () => {
  it('holds every seeded entry, the reviewed dataset and data/library.js, as { id, entry } and nothing else, read through a fresh connection', async () => {
    await seedIfEmpty(createRepository());

    const repository = createRepository();
    const records = await repository.listLibrary();
    const ids = Object.keys(seededLibrary);

    expect(records).toHaveLength(ids.length);
    expect(records.map((record) => record.id).sort()).toEqual([...ids].sort());
    for (const record of records) {
      expect(Object.keys(record).sort()).toEqual(['entry', 'id']);
      expect(record.entry).toEqual(seededLibrary[record.id]);
      expect(Object.hasOwn(record.entry, 'id')).toBe(false);
    }
    expect(await repository.getLibraryEntry('wholeMilk')).toEqual({ id: 'wholeMilk', entry: library.wholeMilk });
  });

  it('keeps the 26 existing entries as data/library.js has them and adds the reviewed dataset beside them (LIB-04, D-09)', async () => {
    await seedIfEmpty(createRepository());

    const repository = createRepository();
    const records = await repository.listLibrary();
    const stored = Object.fromEntries(records.map((record) => [record.id, record.entry]));

    for (const key of Object.keys(library)) expect(stored[key], key).toEqual(library[key]);

    const newKeys = Object.keys(librarySeedDb);
    expect(newKeys.length).toBeGreaterThan(0);
    expect(records).toHaveLength(Object.keys(library).length + newKeys.length);
    // One new entry, read back from the store: its composition basis is inherited (D-08).
    const [newKey] = newKeys;
    expect(stored[newKey]).toEqual(librarySeedDb[newKey]);
    for (const field of Object.keys(stored[newKey].composition)) {
      expect(stored[newKey].basis[field], `${newKey}.${field}`).toBe('inherited');
    }
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

    expect(afterSecond).toHaveLength(Object.keys(seededLibrary).length);
    expect(afterSecond).toEqual(afterFirst);
    expect(await fresh.listVersions()).toHaveLength(seedCounts.versions);
  });

  it('two connections seeding at once end with one record per seed id in every store', async () => {
    await Promise.all([seedIfEmpty(createRepository()), seedIfEmpty(createRepository())]);

    const fresh = createRepository();
    const records = await fresh.listLibrary();
    expect(records).toHaveLength(Object.keys(seededLibrary).length);
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
    expect(records).toHaveLength(Object.keys(seededLibrary).length);
    for (const record of records) {
      if (record.id !== 'sucrose') expect(record.entry).toEqual(seededLibrary[record.id]);
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
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(seededLibrary).length);

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
  // Either quote; a static, side-effect or dynamic import; idb subpaths too.
  const IDB_IMPORT = /(?:from\s+|import\s*\(\s*|import\s+)['"]idb(?:\/[^'"]*)?['"]/;
  const LIBRARY_IMPORT = /(?:from\s+|import\s*\(\s*|import\s+)['"][^'"]*\/library\.js['"]/;
  const importers = (pattern) =>
    labels.filter((label) => pattern.test(readFileSync(path.join(srcDir, label), 'utf8')));

  it('only store/seed.js and files directly under data/ import the library data; only store/db.js imports idb', () => {
    const libraryImporters = importers(LIBRARY_IMPORT);
    for (const label of libraryImporters) {
      expect(label === 'store/seed.js' || /^data\/[^/]+\.js$/.test(label), label).toBe(true);
    }
    expect(libraryImporters).toEqual(expect.arrayContaining(['store/seed.js', 'data/library-embed.js']));
    expect(libraryImporters).not.toContain('store/db.js');

    expect(importers(IDB_IMPORT)).toEqual(['store/db.js']);
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
    expect(file.library).toHaveLength(Object.keys(seededLibrary).length);
    expect(Object.hasOwn(file, 'drafts')).toBe(false);

    globalThis.indexedDB = new IDBFactory();
    expect(await importStore(createRepository(), file)).toEqual({ ok: true, errors: [] });

    // Now reading the target store.
    expect(await figuresFromStore()).toEqual(before);
    const fresh = createRepository();
    expect(await fresh.getLibraryEntry('sucrose')).toEqual(changed);
    expect((await fresh.getLibraryEntry('sucrose')).entry.composition.pac).toBe(library.sucrose.composition.pac * 2);
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(seededLibrary).length);
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
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(seededLibrary).length);
    // Versions were present, so no seed recipe or version was added.
    expect(await fresh.listVersions()).toEqual([oliveOilVersion]);
    expect(await fresh.listRecipes()).toEqual([oliveOilRecipe]);
  });

  it('an import upserts the library by id: the record the file names is replaced and the others stay (D-07)', async () => {
    await seedIfEmpty(createRepository());
    const file = fileOf({ library: [{ id: 'sucrose', entry: { ...library.sucrose, name: 'Sucrose, renamed' } }] });

    expect(await importStore(createRepository(), file)).toEqual({ ok: true, errors: [] });

    const fresh = createRepository();
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(seededLibrary).length);
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
    expect(await fresh.listLibrary()).toHaveLength(Object.keys(seededLibrary).length);
  });
});

// D-20: every library entry owns the six coefficient keys, null allowed. The
// values of the 26 are pinned here by hand, not read back from the checks file
// alone, so a wrong value cannot ride in with a wrong approval record.
describe('the six D-20 coefficient keys on every library entry', () => {
  const SIX = ['titratableAcidity', 'fatStructural', 'ownEmulsifier', 'defaultStage', 'prepNote', 'requiresHeat'];
  const DAIRY_SOURCE = 'MSNF × 0.017, Goff pp. 142, 407';
  const checksPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../scripts/ingredient-seed-checks.json',
  );
  const checks = JSON.parse(readFileSync(checksPath, 'utf8'));

  it('a fresh profile holds the six keys on every entry, the 26 and every new one, and each stage is a known stage', async () => {
    await seedIfEmpty(createRepository());
    const records = await createRepository().listLibrary();

    expect(records).toHaveLength(Object.keys(seededLibrary).length);
    for (const { id, entry } of records) {
      for (const key of SIX) expect(Object.hasOwn(entry, key), `${id}.${key}`).toBe(true);
      expect(entry.defaultStage === null || STAGE_IDS.includes(entry.defaultStage), `${id}.defaultStage`).toBe(true);
      if (entry.titratableAcidity !== null) {
        expect(entry.basis.titratableAcidity, `${id} basis`).toBe('derived');
        expect(typeof entry.source.titratableAcidity, `${id} source`).toBe('string');
        expect(entry.source.titratableAcidity.length, `${id} source`).toBeGreaterThan(0);
      } else {
        expect(Object.hasOwn(entry.basis, 'titratableAcidity'), `${id} basis`).toBe(false);
        expect(Object.hasOwn(entry.source ?? {}, 'titratableAcidity'), `${id} source`).toBe(false);
      }
    }
  });

  it('the five dairy entries carry acidity as MSNF x 0.017 to six places, derived, with the Goff source', () => {
    const literals = {
      wholeMilk: 0.001496,
      heavyCream: 0.000918,
      skimMilkPowder: 0.01649,
      wholeMilk33: 0.001479,
      wholeMilk37: 0.001471,
    };
    for (const [key, value] of Object.entries(literals)) {
      const entry = library[key];
      expect(entry.titratableAcidity, key).toBe(value);
      expect(entry.titratableAcidity, key).toBe(Number((entry.composition.msnf * 0.017).toFixed(6)));
      expect(entry.basis.titratableAcidity, key).toBe('derived');
      expect(entry.source.titratableAcidity, key).toBe(DAIRY_SOURCE);
    }
    expect(library.sucrose.titratableAcidity).toBeNull();
    expect(Object.hasOwn(library.sucrose.basis, 'titratableAcidity')).toBe(false);
    expect(Object.hasOwn(library.sucrose.source, 'titratableAcidity')).toBe(false);
  });

  it('pins the flags and stages the notes and D-20 give', () => {
    expect(library.oliveOil.fatStructural).toBe(false);
    expect(library.oliveOil.defaultStage).toBe('before_churn');
    expect(library.heavyCream.fatStructural).toBe(true);
    expect(library.heavyCream.defaultStage).toBe('combine');
    expect(library.coconutCream.fatStructural).toBe(true);
    expect(library.lecithin.ownEmulsifier).toBe(true);
    expect(library.carrageenan.defaultStage).toBe('dry_blend');
    expect(library.allulose.defaultStage).toBe('after_heat');
    expect(library.vanillaExtract.defaultStage).toBe('after_heat');
    expect(library.shreddedCoconut.defaultStage).toBe('during_churn');

    const fatStructural = [
      'wholeMilk',
      'heavyCream',
      'skimMilkPowder',
      'wholeMilk33',
      'wholeMilk37',
      'cocoaPowder',
      'coconutCream',
      'shreddedCoconut',
      'coconutMilk',
    ];
    const dryBlend = [
      'sucrose',
      'dextrose',
      'fructose',
      'skimMilkPowder',
      'salt',
      'locustBeanGum',
      'guarGum',
      'carrageenan',
      'stabilizerMix4421',
    ];
    const combine = ['wholeMilk', 'wholeMilk33', 'wholeMilk37', 'heavyCream'];
    const otherStages = {
      allulose: 'after_heat',
      vanillaExtract: 'after_heat',
      oliveOil: 'before_churn',
      shreddedCoconut: 'during_churn',
    };
    for (const [key, entry] of Object.entries(library)) {
      const expectedFat = fatStructural.includes(key) ? true : key === 'oliveOil' ? false : null;
      expect(entry.fatStructural, `${key}.fatStructural`).toBe(expectedFat);
      expect(entry.ownEmulsifier, `${key}.ownEmulsifier`).toBe(key === 'lecithin' ? true : null);
      const expectedStage = dryBlend.includes(key)
        ? 'dry_blend'
        : combine.includes(key)
          ? 'combine'
          : (otherStages[key] ?? null);
      expect(entry.defaultStage, `${key}.defaultStage`).toBe(expectedStage);
      expect(entry.prepNote, `${key}.prepNote`).toBeNull();
      expect(entry.requiresHeat, `${key}.requiresHeat`).toBeNull();
    }
  });

  it('every entry of data/library.js holds exactly the six values Mark approved in the mapping (checks file existing)', () => {
    expect(Object.keys(checks.existing).sort()).toEqual(Object.keys(library).sort());
    for (const key of Object.keys(library)) {
      const six = Object.fromEntries(SIX.map((field) => [field, library[key][field]]));
      expect(six, key).toEqual(checks.existing[key]);
    }
  });

  it('every version row and batch snapshot row in the seed recipes embeds an ingredient owning the six keys', () => {
    const rows = seedRecipeGroups.flatMap((group) => [
      ...group.versions.flatMap((version) => version.rows),
      ...group.batches.flatMap((batch) => batch.snapshot.rows),
    ]);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      for (const key of SIX) expect(Object.hasOwn(row.ingredient, key), `${row.ingredient.name}.${key}`).toBe(true);
    }
  });
});
