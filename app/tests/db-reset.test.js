// The D-05 proof against a real IndexedDB: the store resets rather than
// lifts — the cursor-free drop-and-recreate mechanics, not just the pure
// row shape in isolation. Lives outside app/src deliberately: the
// project's standing seam gate asserts that exactly one module under
// app/src imports 'idb', and this is the one test that must open a
// database directly to build a pre-03.2-shaped fixture. Putting it here
// keeps that gate exact rather than weakening it. Runs under Vitest's
// default node environment (see app/vitest.config.js) — Node's native
// structuredClone means the fake-indexeddb jsdom caveat does not apply.
import { describe, it, beforeEach, expect } from 'vitest';
import { openDB } from 'idb';
import {
  IDBFactory,
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBOpenDBRequest,
  IDBRequest,
  IDBTransaction,
  IDBVersionChangeEvent,
} from 'fake-indexeddb';
import { DB_NAME, openStore } from '../src/store/db.js';
import { seedIfEmpty } from '../src/store/seed.js';
import { oliveOilVersion } from '../src/data/olive-oil.js';
import { augustSecondBatch } from '../src/data/batch-2026-08-02.js';
import { buildFigures } from '../src/domain/figures.js';
import { computeBalance, formatGrams } from '../src/domain/composition.js';
import { activeRows } from '../src/domain/rows.js';

// idb's wrapper reaches for these IDB constructors on the global object,
// not only `indexedDB` itself (Node has none of them natively) — set once,
// module-wide, since they are stateless constructors shared across every
// database a test opens.
globalThis.IDBCursor = IDBCursor;
globalThis.IDBCursorWithValue = IDBCursorWithValue;
globalThis.IDBDatabase = IDBDatabase;
globalThis.IDBIndex = IDBIndex;
globalThis.IDBKeyRange = IDBKeyRange;
globalThis.IDBObjectStore = IDBObjectStore;
globalThis.IDBOpenDBRequest = IDBOpenDBRequest;
globalThis.IDBRequest = IDBRequest;
globalThis.IDBTransaction = IDBTransaction;
globalThis.IDBVersionChangeEvent = IDBVersionChangeEvent;

beforeEach(() => {
  // A fresh database state per test — fake-indexeddb's global indexedDB
  // persists across tests in the same file otherwise.
  globalThis.indexedDB = new IDBFactory();
});

// A pre-03.2-shaped version record: oliveOilVersion with its rows'
// `portions` collapsed back into a stored amount and the two retiring
// keys, `step` and `splitStep` (D-01, D-02) — exactly the shape a
// returning browser profile holds.
function makePreResetVersion(overrides = {}) {
  const version = structuredClone(oliveOilVersion);
  version.rows = version.rows.map(({ portions, ...rest }) => {
    const [first, second] = portions;
    const grams = portions.reduce((total, portion) => total + portion.grams, 0);
    const fields = { ...rest, grams, step: first.step };
    if (second) fields.splitStep = second.step;
    return fields;
  });
  return { ...version, ...overrides };
}

// The pre-03.2 upgrade shape, verbatim (db.js's own upgrade before this
// phase's reset branch existed): a versions store keyed by id, a batches
// store keyed by id with a by-version index on versionId.
async function openPreResetDatabase() {
  return openDB(DB_NAME, 3, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('versions')) {
        db.createObjectStore('versions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('batches')) {
        const batches = db.createObjectStore('batches', { keyPath: 'id' });
        batches.createIndex('by-version', 'versionId');
      }
    },
  });
}

describe('the D-05 reset, against a real IndexedDB', () => {
  it('a profile holding a pre-03.2 version and the seeded batch at version 3 comes back with both stores present and empty', async () => {
    const preResetVersion = makePreResetVersion();
    const preResetDb = await openPreResetDatabase();
    await preResetDb.put('versions', preResetVersion);
    await preResetDb.put('batches', augustSecondBatch);
    preResetDb.close();

    const db = await openStore();
    expect(db.objectStoreNames.contains('versions')).toBe(true);
    expect(db.objectStoreNames.contains('batches')).toBe(true);
    expect(await db.getAll('versions')).toEqual([]);
    expect(await db.getAll('batches')).toEqual([]);
    db.close();
  });

  it('seedIfEmpty writes the seed back after the reset, and the six figures and mass read unmoved', async () => {
    const preResetVersion = makePreResetVersion();
    const preResetDb = await openPreResetDatabase();
    await preResetDb.put('versions', preResetVersion);
    await preResetDb.put('batches', augustSecondBatch);
    preResetDb.close();

    // Opening once through the seam drops and recreates both stores.
    const opened = await openStore();
    opened.close();

    // Dynamic import, not a static one: repository.js's own module top
    // level runs `export const repository = createRepository()`, which
    // opens a database immediately at import time — before this file's
    // fake-indexeddb globals and beforeEach have run for any static
    // import. Deferring the import to here, after beforeEach, gives that
    // singleton a real indexedDB to open against instead of undefined.
    const { createRepository } = await import('../src/store/repository.js');
    const repository = createRepository();
    await seedIfEmpty(repository);

    const versions = await repository.listVersions();
    expect(versions).toHaveLength(1);
    const [seeded] = versions;

    const figures = Object.fromEntries(
      buildFigures(seeded).map((figure) => [figure.key, Number(figure.value.toFixed(figure.decimals))]),
    );
    expect(figures).toEqual({ pac: 24.1, pod: 13.0, fat: 18.0, msnf: 8.5, sugar: 13.5, solids: 40.8 });

    const balance = computeBalance(activeRows(seeded));
    expect(formatGrams(balance.mass)).toBe('799.7 g');
  });

  it('a brand-new profile (no prior database) opens at version 4 with both stores present and empty, and nothing was dropped', async () => {
    const db = await openStore();
    expect(db.objectStoreNames.contains('versions')).toBe(true);
    expect(db.objectStoreNames.contains('batches')).toBe(true);
    expect(await db.getAll('versions')).toEqual([]);
    expect(await db.getAll('batches')).toEqual([]);
    db.close();
  });
});
