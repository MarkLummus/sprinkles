// The catalog as the app reads it (D-02, LIB-09): the five seed tables read
// through the repository, then sorted once, at catalogFrom, by order then id.
// The real repository over fake-indexeddb, which must be installed on the
// global before repository.js loads (its module-level singleton opens the store
// on import), so it is the first import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { readSeedTables, catalogFrom, loadCatalog } from './catalog.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

describe('loadCatalog over a seeded store', () => {
  it('reads the scales in the battery order and the problems as the four words, although getAll returns key order', async () => {
    const repository = createRepository();
    await seedIfEmpty(repository);
    // The store itself hands rows back in key (id) order: body before hardness.
    const raw = await repository.listScales();
    expect(raw.map((row) => row.id)).toEqual([...raw.map((row) => row.id)].sort());
    expect(raw[0].id).toBe('body');

    const catalog = await loadCatalog(repository);
    expect(catalog.scales.map((row) => row.key)).toEqual(['hardness', 'scoopability', 'smoothness', 'sweetness', 'body', 'oil']);
    expect(catalog.problems.map((row) => row.name)).toEqual(['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film']);
    expect(catalog.machines).toEqual(SEED_CATALOG.machines);
    expect(catalog.styles.map((row) => row.order)).toEqual([...catalog.styles.map((row) => row.order)].sort((a, b) => a - b));
  });

  it('readSeedTables returns the library and the four tables, every one filled after seeding', async () => {
    const repository = createRepository();
    await seedIfEmpty(repository);
    const lists = await readSeedTables(repository);
    expect(Object.keys(lists)).toEqual(['library', 'machines', 'styles', 'scales', 'problems']);
    for (const [table, rows] of Object.entries(lists)) expect(rows.length, table).toBeGreaterThan(0);
  });
});

describe('catalogFrom, the one sorting boundary', () => {
  it('sorts each list by order, then id, into new arrays', () => {
    const scales = [
      { id: 'b', order: 2 },
      { id: 'z', order: 1 },
      { id: 'a', order: 2 },
    ];
    const problems = [
      { id: 'two', order: 2 },
      { id: 'one', order: 1 },
    ];
    const machines = [
      { id: 'm2', order: 2 },
      { id: 'm1', order: 1 },
    ];
    const styles = [
      { id: 's2', order: 2 },
      { id: 's1', order: 1 },
    ];
    const catalog = catalogFrom({ machines, styles, scales, problems });
    expect(catalog.scales.map((row) => row.id)).toEqual(['z', 'a', 'b']);
    expect(catalog.problems.map((row) => row.id)).toEqual(['one', 'two']);
    expect(catalog.machines.map((row) => row.id)).toEqual(['m1', 'm2']);
    expect(catalog.styles.map((row) => row.id)).toEqual(['s1', 's2']);
    expect(catalog.scales).not.toBe(scales);
    expect(scales.map((row) => row.id)).toEqual(['b', 'z', 'a']);
    expect(Object.keys(catalog)).toEqual(['scales', 'problems', 'machines', 'styles']);
  });
});
