// The D-06 proof against a real IndexedDB: the cursor and transaction
// mechanics, not just the pure lift function in isolation (RESEARCH.md
// "Don't Hand-Roll" — a hand-rolled fake cannot reproduce transaction
// auto-commit timing). Lives outside app/src deliberately: the project's
// standing seam gate asserts that exactly one module under app/src imports
// 'idb', and this is the one test that must open a database directly to
// build a Phase 2-shaped fixture. Putting it here keeps that gate exact
// rather than weakening it. Runs under Vitest's default node environment
// (see app/vitest.config.js) — Node's native structuredClone means the
// fake-indexeddb jsdom caveat does not apply.
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
import { SEED_CREATED_AT, SEED_USES } from '../src/store/versionLift.js';
import { oliveOilVersion } from '../src/data/olive-oil.js';
import { augustSecondBatch } from '../src/data/batch-2026-08-02.js';
import { buildFigures } from '../src/domain/figures.js';

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

// A Phase 2-shaped version record: oliveOilVersion with every field this
// phase adds stripped back out, and the authored notes turned back into
// bare strings — exactly the shape a returning browser profile holds.
function makePhase2ShapedVersion(overrides = {}) {
  const version = structuredClone(oliveOilVersion);
  delete version.parentVersionLabel;
  delete version.reason;
  delete version.citedBatchId;
  delete version.createdAt;
  version.rows = version.rows.map(({ removed, ...rest }) => rest);
  version.method = version.method.map(({ removed, uses, ...rest }) => rest);
  version.authored = {
    carriedForward: version.authored.carriedForward.map((note) => note.text),
    beforeYouStart: version.authored.beforeYouStart.map((note) => note.text),
  };
  return { ...version, ...overrides };
}

// The Phase 2 upgrade shape, verbatim (db.js's own upgrade before this
// phase's oldVersion < 3 branch existed): a versions store keyed by id, a
// batches store keyed by id with a by-version index on versionId.
async function openPhase2Database() {
  return openDB(DB_NAME, 2, {
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

describe('the D-06 migration, against a real IndexedDB', () => {
  it('lifts a returning profile\'s stored version to the new shape, and its six figures and its batch read identically before and after', async () => {
    const phase2Version = makePhase2ShapedVersion();
    const preUpgradeFigures = Object.fromEntries(
      buildFigures(phase2Version).map((figure) => [figure.key, Number(figure.value.toFixed(figure.decimals))]),
    );
    expect(preUpgradeFigures).toEqual({ pac: 24.1, pod: 13.0, fat: 18.0, msnf: 8.5, sugar: 13.5, solids: 40.8 });

    const phase2Db = await openPhase2Database();
    await phase2Db.put('versions', phase2Version);
    await phase2Db.put('batches', augustSecondBatch);
    phase2Db.close();

    const db = await openStore();
    const lifted = await db.get('versions', phase2Version.id);
    const batch = await db.get('batches', augustSecondBatch.id);
    db.close();

    expect(lifted.parentVersionLabel).toBeNull();
    expect(lifted.reason).toBeNull();
    expect(lifted.citedBatchId).toBeNull();
    expect(lifted.createdAt).toBe(SEED_CREATED_AT);
    for (const row of lifted.rows) {
      expect(row.removed).toBe(false);
    }
    for (const step of lifted.method) {
      expect(step.removed).toBe(false);
      expect(step.uses).toEqual(SEED_USES[step.n]);
    }
    for (const note of [...lifted.authored.carriedForward, ...lifted.authored.beforeYouStart]) {
      expect(typeof note.text).toBe('string');
      expect(note.inheritedFrom).toBeNull();
    }

    const postUpgradeFigures = Object.fromEntries(
      buildFigures(lifted).map((figure) => [figure.key, Number(figure.value.toFixed(figure.decimals))]),
    );
    expect(postUpgradeFigures).toEqual(preUpgradeFigures);

    expect(batch).toEqual(augustSecondBatch);
  });

  it('lifts every stored version in one upgrade pass, not only the first — the failure mode an early transaction auto-commit would produce', async () => {
    const versionA = makePhase2ShapedVersion({ id: 'version-a', recipeId: 'recipe-a' });
    const versionB = makePhase2ShapedVersion({ id: 'version-b', recipeId: 'recipe-b' });

    const phase2Db = await openPhase2Database();
    await phase2Db.put('versions', versionA);
    await phase2Db.put('versions', versionB);
    phase2Db.close();

    const db = await openStore();
    const liftedA = await db.get('versions', 'version-a');
    const liftedB = await db.get('versions', 'version-b');
    db.close();

    for (const lifted of [liftedA, liftedB]) {
      expect(lifted.createdAt).toBe(SEED_CREATED_AT);
      expect(lifted.rows.every((row) => row.removed === false)).toBe(true);
      expect(lifted.method.every((step) => step.removed === false && Array.isArray(step.uses))).toBe(true);
    }
  });

  it('a second open at database version 3 changes nothing: the records are deep-equal across the second open', async () => {
    const phase2Version = makePhase2ShapedVersion();
    const phase2Db = await openPhase2Database();
    await phase2Db.put('versions', phase2Version);
    await phase2Db.put('batches', augustSecondBatch);
    phase2Db.close();

    const firstOpen = await openStore();
    const afterFirst = await firstOpen.get('versions', phase2Version.id);
    firstOpen.close();

    const secondOpen = await openStore();
    const afterSecond = await secondOpen.get('versions', phase2Version.id);
    secondOpen.close();

    expect(afterSecond).toEqual(afterFirst);
  });
});
