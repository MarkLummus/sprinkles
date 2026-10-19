// The four seed tables travel in the store file with the library (LIB-09,
// decision 20): an export from one profile imported into a fresh one restores
// machines, styles, scales and problems; the file wins on a shared id, local rows
// the file lacks stay, and import never deletes (D-14). The import also refuses a
// file that would leave a store a valid batch cannot be recorded against (the
// four-core-scale rule, a retained version declaring a key the file makes core,
// two problems with one name). Real IndexedDB through fake-indexeddb, a fresh
// IDBFactory per test; fake-indexeddb/auto comes first because repository.js
// opens its store on import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { exportStore, importStore, validateStoreFile, OLDER_EXPORT_MESSAGE, STORE_SCHEMA_VERSION } from './transfer.js';
import { storeFileOf, stampedSeedVersions } from './storeFile.fixtures.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { CORE_SCALE_COUNT } from '../domain/catalog.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

async function seededProfile() {
  const repository = createRepository();
  await seedIfEmpty(repository);
  return repository;
}

const serialised = (value) => JSON.parse(JSON.stringify(value));

// The file's scales with sweetness demoted to a declared scale and one new core row.
const CREAMINESS = { id: 'creaminess', key: 'creaminess', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'core', order: 7 };
const demoteSweetness = (scales) => scales.map((row) => (row.key === 'sweetness' ? { ...row, group: 'declared' } : row));

describe('the four tables round-trip through the store file (LIB-09, decision 20, criterion 8)', () => {
  it('the store file is schema 9', () => {
    expect(STORE_SCHEMA_VERSION).toBe(9);
  });

  it('an export from a seeded profile imported into a fresh, never-seeded profile restores all four tables', async () => {
    const source = await seededProfile();
    const file = serialised(await exportStore(source));
    expect(file.schemaVersion).toBe(9);
    for (const table of ['machines', 'styles', 'scales', 'problems']) expect(file[table].length).toBeGreaterThan(0);
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });

    globalThis.indexedDB = new IDBFactory();
    const target = createRepository();
    expect(await target.listScales()).toEqual([]);
    expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });

    expect(await target.listMachines()).toEqual(file.machines);
    expect(await target.listStyles()).toEqual(file.styles);
    expect(await target.listScales()).toEqual(file.scales);
    expect(await target.listProblems()).toEqual(file.problems);
    expect(await target.listLibrary()).toEqual(file.library);
    // The seed catalog's own rows are what came back, not some other set.
    const byId = (rows) => [...rows].sort((a, b) => (a.id < b.id ? -1 : 1));
    expect(byId(await target.listScales())).toEqual(byId(SEED_CATALOG.scales));
  });

  it('the file wins on a shared id, a new id is added, and a local row the file lacks stays', async () => {
    const repository = await seededProfile();
    // A profile holding an extra local machine and a local hardness scale in other words.
    await repository.importAll({
      recipes: [],
      versions: [],
      batches: [],
      library: [],
      machines: [{ id: 'local-machine', name: 'Local machine', minFillG: 100, maxFillG: null, order: 9 }],
      styles: [],
      scales: [{ ...SEED_CATALOG.scales[0], name: 'Local hardness', low: 'mushy', high: 'rock' }],
      problems: [],
    });
    expect((await repository.listScales()).find((row) => row.id === 'hardness').name).toBe('Local hardness');

    const file = storeFileOf({ machines: [...structuredClone(SEED_CATALOG.machines), { id: 'file-machine', name: 'File machine', minFillG: 200, maxFillG: 900, order: 10 }] });
    expect(await importStore(repository, file)).toEqual({ ok: true, errors: [] });

    expect((await repository.listScales()).find((row) => row.id === 'hardness')).toEqual(SEED_CATALOG.scales[0]);
    const machineIds = (await repository.listMachines()).map((row) => row.id);
    expect(machineIds).toContain('local-machine');
    expect(machineIds).toContain('file-machine');
    expect(await repository.listMachines()).toHaveLength(SEED_CATALOG.machines.length + 2);
  });

  it('importing the same file twice leaves the same eight stores as importing it once', async () => {
    const source = await seededProfile();
    const file = serialised(await exportStore(source));

    globalThis.indexedDB = new IDBFactory();
    const target = createRepository();
    expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });
    const once = await target.exportAll();
    expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });
    expect(await target.exportAll()).toEqual(once);
  });

  it('a file missing the styles array, and a schema-8 file, are refused with no store changed', async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();

    const missingStyles = serialised(storeFileOf());
    delete missingStyles.styles;
    const noStyles = await importStore(repository, missingStyles);
    expect(noStyles.ok).toBe(false);
    expect(noStyles.errors).toContain('$.styles: expected an array');

    const schema8 = serialised({ ...storeFileOf(), schemaVersion: 8 });
    const older = await importStore(repository, schema8);
    expect(older.ok).toBe(false);
    expect(older.errors[0]).toBe(OLDER_EXPORT_MESSAGE);

    expect(await repository.exportAll()).toEqual(before);
  });
});

describe("a version's serving temperature survives the round trip (D-19)", () => {
  it('olive oil v1 saved with -12.5 comes back -12.5, and every other seeded version keeps its own Ice Ed figure', async () => {
    const source = await seededProfile();
    const oliveOil = await source.getVersion('olive-oil-ice-cream-v1');
    expect(oliveOil.serveTempC).toBeNull();
    await source.saveVersion({ ...oliveOil, serveTempC: -12.5 });
    const file = serialised(await exportStore(source));
    expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });

    globalThis.indexedDB = new IDBFactory();
    const target = createRepository();
    expect(await importStore(target, file)).toEqual({ ok: true, errors: [] });

    expect((await target.getVersion('olive-oil-ice-cream-v1')).serveTempC).toBe(-12.5);
    const seeded = seedRecipeGroups.flatMap((group) => group.versions);
    for (const version of seeded.filter((entry) => entry.id !== 'olive-oil-ice-cream-v1')) {
      expect((await target.getVersion(version.id)).serveTempC, version.id).toBe(version.iceEd.servingTemperatureC);
    }
    // A copied Ice Ed figure survives the trip, and an unknown one stays null.
    expect((await target.getVersion('mexican-chocolate-v1')).serveTempC).toBe(-15);
    expect((await target.getVersion('underbelly-light-base-v1')).serveTempC).toBeNull();
  });

  it('a version without the serveTempC key is refused at its path, and nothing is written', async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();
    const [oliveOil] = stampedSeedVersions();
    const { serveTempC, ...without } = oliveOil;
    expect(serveTempC).toBeNull();

    const result = await importStore(repository, serialised(storeFileOf({ versions: [without] })));

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.startsWith('$.versions[0].serveTempC'))).toBe(true);
    expect(await repository.exportAll()).toEqual(before);
  });
});

describe('the import refuses a store a valid batch cannot be recorded against', () => {
  it(`a file whose scales table adds a fifth core row is refused with the core-count message, and no store changes (Sprinkles reads exactly ${CORE_SCALE_COUNT})`, async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();
    const file = serialised(storeFileOf({ scales: [...structuredClone(SEED_CATALOG.scales), CREAMINESS] }));

    const result = await importStore(repository, file);

    expect(result).toEqual({
      ok: false,
      errors: ['$.scales: the scales table would hold 5 core scales after this import; Sprinkles reads exactly 4'],
    });
    expect(await repository.exportAll()).toEqual(before);
  });

  it('a file whose scales replace the four core rows words (same ids) imports', async () => {
    const repository = await seededProfile();
    const scales = structuredClone(SEED_CATALOG.scales).map((row) => (row.group === 'core' ? { ...row, name: `${row.name} (reworded)` } : row));

    expect(await importStore(repository, serialised(storeFileOf({ scales })))).toEqual({ ok: true, errors: [] });

    const held = await repository.listScales();
    expect(held.find((row) => row.id === 'hardness').name).toBe('Hardness (reworded)');
    expect(held).toHaveLength(SEED_CATALOG.scales.length);
  });

  it('a file with no versions that demotes sweetness and promotes oil is refused: the retained olive oil v1 declares Oil', async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();
    const scales = demoteSweetness(structuredClone(SEED_CATALOG.scales)).map((row) => (row.key === 'oil' ? { ...row, group: 'core' } : row));
    const file = serialised(storeFileOf({ versions: [], scales }));

    const result = await importStore(repository, file);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      '$.scales: "oil" would be a core scale after this import, but version "olive-oil-ice-cream-v1" declares its own scale under that key',
    ]);
    expect(await repository.exportAll()).toEqual(before);
  });

  it('the same file whose versions replace olive oil v1 with a copy declaring only Body imports', async () => {
    const repository = await seededProfile();
    const scales = demoteSweetness(structuredClone(SEED_CATALOG.scales)).map((row) => (row.key === 'oil' ? { ...row, group: 'core' } : row));
    const [oliveOil] = stampedSeedVersions();
    const bodyOnly = { ...oliveOil, declaredAxes: oliveOil.declaredAxes.filter((axis) => axis.key === 'body') };
    expect(bodyOnly.declaredAxes).toHaveLength(1);

    expect(await importStore(repository, serialised(storeFileOf({ versions: [bodyOnly], scales })))).toEqual({ ok: true, errors: [] });

    expect((await repository.getVersion('olive-oil-ice-cream-v1')).declaredAxes).toHaveLength(1);
    expect((await repository.listScales()).find((row) => row.key === 'oil').group).toBe('core');
  });

  it('a file that demotes sweetness and adds a core Creaminess row, which no version declares, imports', async () => {
    const repository = await seededProfile();
    const scales = [...demoteSweetness(structuredClone(SEED_CATALOG.scales)), CREAMINESS];

    expect(await importStore(repository, serialised(storeFileOf({ versions: [], scales })))).toEqual({ ok: true, errors: [] });

    const held = await repository.listScales();
    expect(held.find((row) => row.key === 'creaminess').group).toBe('core');
    expect(held.find((row) => row.key === 'sweetness').group).toBe('declared');
    expect(held.filter((row) => row.group === 'core')).toHaveLength(CORE_SCALE_COUNT);
  });

  it('a file whose problems add a second row under an existing name is refused, while one that renames the row itself imports', async () => {
    const repository = await seededProfile();
    const before = await repository.exportAll();
    const duplicate = { id: 'icy', name: 'Coarse, icy', order: 5 };

    const refused = await importStore(repository, serialised(storeFileOf({ problems: [...structuredClone(SEED_CATALOG.problems), duplicate] })));

    expect(refused.ok).toBe(false);
    expect(refused.errors).toEqual(['$.problems: "Coarse, icy" would name more than one problem after this import (ids coarse-icy, icy)']);
    expect(await repository.exportAll()).toEqual(before);

    const renamed = structuredClone(SEED_CATALOG.problems).map((row) => (row.id === 'coarse-icy' ? { ...row, name: 'Coarse and icy' } : row));
    expect(await importStore(repository, serialised(storeFileOf({ problems: renamed })))).toEqual({ ok: true, errors: [] });
    expect((await repository.listProblems()).find((row) => row.id === 'coarse-icy').name).toBe('Coarse and icy');
  });
});
