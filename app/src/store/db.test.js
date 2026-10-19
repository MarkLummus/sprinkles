// The D-10/D-11/D-16 proof against a real IndexedDB: DB_VERSION 10 holds
// versions, batches, recipes, drafts, the ingredient library and the four seed
// tables (machines, styles, scales, problems). Phase 9 (LIB-06, decisions 2
// and 5) set the reset line: a returning profile below 10 resets (one-way,
// approved by Mark) rather than lifting. The reset is bounded: a profile at
// 10 or above keeps what it holds, and two ratchets below hold it there (the
// version-10 profile that survives a later bump, and the scan that finds no
// delete outside the reset block). No assertion pins a literal database
// version: they read DB_VERSION, and the newer-version test opens
// DB_VERSION + 1. This
// file imports db.js only — never repository.js and never idb itself, so
// the project's seam grep (only db.js under app/src imports 'idb') stays
// exact. The fake-indexeddb setup mirrors app/tests/db-reset.test.js: a
// fresh IDBFactory per test, since a leaked open connection from a failed
// assertion in one test would otherwise block a later test's delete/open
// indefinitely.
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
import { DB_NAME, DB_VERSION, openStore, upgradeStores } from './db.js';

// Every store a profile at DB_VERSION holds.
const ALL_STORES = ['versions', 'batches', 'recipes', 'drafts', 'library', 'machines', 'styles', 'scales', 'problems'];

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

// Opens the raw database at an earlier version, creating the stores a
// profile at that version already held, and puts the given records. Closes
// the connection so openStore can upgrade it.
async function seedOldProfile(version, { stores, records }) {
  const oldDb = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of stores) {
        if (db.objectStoreNames.contains(name)) continue;
        const store = db.createObjectStore(name, { keyPath: name === 'drafts' ? 'versionId' : 'id' });
        if (name === 'batches') store.createIndex('by-version', 'versionId');
      }
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

beforeEach(() => {
  // A fresh database state per test — fake-indexeddb's global indexedDB
  // persists across tests in the same file otherwise, and a leaked open
  // connection from a failed assertion would block a later delete/open.
  globalThis.indexedDB = new IDBFactory();
});

describe('openStore, against a real IndexedDB (fake-indexeddb)', () => {
  it('opens a fresh (deleted) database with every store, at DB_VERSION', async () => {
    const db = await openStore();
    expect(db.version).toBe(DB_VERSION);
    for (const name of ALL_STORES) expect(db.objectStoreNames.contains(name), name).toBe(true);
    // D-02, D-03: the library store is keyed by id and holds no index; so are
    // the four seed tables (LIB-09).
    for (const name of ['library', 'machines', 'styles', 'scales', 'problems']) {
      const store = db.transaction(name).store;
      expect(store.keyPath, name).toBe('id');
      expect(store.indexNames.length, name).toBe(0);
    }
    db.close();
  });

  it('keys the drafts store by versionId', async () => {
    const db = await openStore();
    await db.put('drafts', { versionId: 'v1', note: 'first' });
    await db.put('drafts', { versionId: 'v1', note: 'second' });
    expect(await db.getAll('drafts')).toEqual([{ versionId: 'v1', note: 'second' }]);
    db.close();
  });

  it('resets a database first opened at version 7 (one version, one batch) to every store, empty', async () => {
    await seedOldProfile(7, {
      stores: ['versions', 'batches', 'recipes'],
      records: [
        ['versions', { id: 'pre-existing' }],
        ['batches', { id: 'pre-existing-batch', versionId: 'pre-existing' }],
      ],
    });

    const db = await openStore();
    expect(db.version).toBe(DB_VERSION);
    for (const name of ALL_STORES) {
      expect(db.objectStoreNames.contains(name)).toBe(true);
      expect(await db.getAll(name)).toEqual([]);
    }
    db.close();
  });

  it('already at DB_VERSION keeps its records: a version and a draft survive a second open', async () => {
    const first = await openStore();
    await first.put('versions', { id: 'kept-version' });
    await first.put('drafts', { versionId: 'kept-version', note: 'kept-draft' });
    first.close();

    const db = await openStore();
    expect(await db.getAll('versions')).toEqual([{ id: 'kept-version' }]);
    expect(await db.getAll('drafts')).toEqual([{ versionId: 'kept-version', note: 'kept-draft' }]);
    db.close();
  });

  it('a profile left at version 8 (a recipe, a version, a batch and a draft) is reset at DB_VERSION: every store present and empty, the batches index kept (decisions 2 and 5)', async () => {
    await seedOldProfile(8, {
      stores: ['versions', 'batches', 'recipes', 'drafts'],
      records: [
        ['recipes', { id: 'old-recipe', name: 'Old', description: '' }],
        ['versions', { id: 'old-version', recipeId: 'old-recipe' }],
        ['batches', { id: 'old-batch', versionId: 'old-version' }],
        ['drafts', { versionId: 'old-version', note: 'old-draft' }],
      ],
    });

    const db = await openStore();
    expect(db.version).toBe(DB_VERSION);
    for (const name of ALL_STORES) {
      expect(await db.getAll(name), name).toEqual([]);
    }
    // The recreated batches store carries its by-version index.
    expect(await db.getAllFromIndex('batches', 'by-version', 'old-version')).toEqual([]);
    db.close();
  });

  it('resets a database first opened at version 5 (versions/batches only, one record put) to all three stores, empty', async () => {
    const oldDb = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 5);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('versions')) {
          db.createObjectStore('versions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('batches')) {
          const batches = db.createObjectStore('batches', { keyPath: 'id' });
          batches.createIndex('by-version', 'versionId');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = oldDb.transaction('versions', 'readwrite');
      tx.objectStore('versions').put({ id: 'pre-existing' });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    oldDb.close();

    const db = await openStore();
    expect(db.objectStoreNames.contains('versions')).toBe(true);
    expect(db.objectStoreNames.contains('batches')).toBe(true);
    expect(db.objectStoreNames.contains('recipes')).toBe(true);
    expect(await db.getAll('versions')).toEqual([]);
    db.close();
  });

  it('resets a database first opened at version 6 (all three stores, one record put) to all three stores, empty', async () => {
    const oldDb = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 6);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('versions')) {
          db.createObjectStore('versions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('batches')) {
          const batches = db.createObjectStore('batches', { keyPath: 'id' });
          batches.createIndex('by-version', 'versionId');
        }
        if (!db.objectStoreNames.contains('recipes')) {
          db.createObjectStore('recipes', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = oldDb.transaction('versions', 'readwrite');
      tx.objectStore('versions').put({ id: 'pre-existing' });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    oldDb.close();

    const db = await openStore();
    expect(db.version).toBe(DB_VERSION);
    expect(db.objectStoreNames.contains('versions')).toBe(true);
    expect(db.objectStoreNames.contains('batches')).toBe(true);
    expect(db.objectStoreNames.contains('recipes')).toBe(true);
    expect(db.objectStoreNames.contains('drafts')).toBe(true);
    expect(await db.getAll('versions')).toEqual([]);
    db.close();
  });
});

// Opens the raw database at an earlier version and keeps the connection open,
// so a later openStore at a newer version is blocked until the test closes it.
function holdOpen(version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, version);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('versions', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// A bounded wait on a condition, in awaited ticks, never a fixed sleep.
async function until(condition) {
  for (let i = 0; i < 200 && !condition(); i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  expect(condition()).toBe(true);
}

describe('openStore, when another tab holds the old version open (WR-08)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls onBlocked once, then finishes the upgrade at DB_VERSION when the other connection closes', async () => {
    const held = await holdOpen(7);
    const onBlocked = vi.fn();
    const opening = openStore({ onBlocked });
    await until(() => onBlocked.mock.calls.length > 0);
    expect(onBlocked).toHaveBeenCalledTimes(1);

    held.close();
    const db = await opening;
    expect(db.version).toBe(DB_VERSION);
    for (const name of ALL_STORES) {
      expect(db.objectStoreNames.contains(name)).toBe(true);
    }
    expect(onBlocked).toHaveBeenCalledTimes(1);
    db.close();
  });

  it('steps aside when a newer version asks: it closes its connection and reloads the tab', async () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { reload });
    const db = await openStore();

    const newer = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION + 1);
      let blocked = false;
      request.onblocked = () => {
        blocked = true;
      };
      request.onsuccess = () => (blocked ? reject(new Error('the upgrade was blocked')) : resolve(request.result));
      request.onerror = () => reject(request.error);
    });
    expect(newer.version).toBe(DB_VERSION + 1);
    expect(reload).toHaveBeenCalledTimes(1);
    newer.close();
    // A closed connection refuses a new transaction.
    expect(() => db.transaction('versions')).toThrow();
  });
});

// The two ratchets that hold the reset at version 10 (LIB-06, threat T-09-18):
// from Phase 11 the store holds recipes a maker made, so a later bump must
// never reach the destructive block.

// The historical version the reset may never reach: a literal 10, not
// DB_VERSION, so the proof keeps covering a version-10 profile once DB_VERSION
// moves past it.
const RESET_BOUND = 10;

// The stores a profile at version 10 held, written out here rather than read
// from db.js, so this fixture does not move when db.js does.
const VERSION_10_STORES = ['versions', 'batches', 'recipes', 'drafts', 'library', 'machines', 'styles', 'scales', 'problems'];

describe('the reset never reaches a profile at version 10 or above (behavioural ratchet)', () => {
  it('a version-10 profile with a record in every store survives an upgrade to DB_VERSION + 1, indexes included', async () => {
    const records = [
      ['versions', { id: 'kept-version', recipeId: 'kept-recipe' }],
      ['batches', { id: 'kept-batch', versionId: 'kept-version' }],
      ['recipes', { id: 'kept-recipe', name: 'Kept' }],
      ['drafts', { versionId: 'kept-version', create: true, note: 'kept-draft' }],
      ['library', { id: 'kept-library', entry: { name: 'Kept' } }],
      ['machines', { id: 'kept-machine', name: 'Kept' }],
      ['styles', { id: 'kept-style', name: 'Kept' }],
      ['scales', { id: 'kept-scale', name: 'Kept' }],
      ['problems', { id: 'kept-problem', name: 'Kept' }],
    ];
    await seedOldProfile(RESET_BOUND, { stores: VERSION_10_STORES, records });

    const upgraded = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION + 1);
      request.onupgradeneeded = (event) => {
        upgradeStores(request.result, event.oldVersion, event.newVersion, request.transaction);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    expect(upgraded.version).toBe(DB_VERSION + 1);
    for (const [name, record] of records) {
      const stored = await new Promise((resolve, reject) => {
        const request = upgraded.transaction(name).objectStore(name).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      expect(stored, name).toEqual([record]);
    }
    const byVersion = await new Promise((resolve, reject) => {
      const request = upgraded.transaction('batches').objectStore('batches').index('by-version').getAll('kept-version');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    expect(byVersion).toEqual([{ id: 'kept-batch', versionId: 'kept-version' }]);
    upgraded.close();
  });
});

// A string is matched before a comment, so a // or /* inside one stays code.
const STRING_OR_COMMENT = /('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\[\s\S]|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

function stripComments(source) {
  return source.replace(STRING_OR_COMMENT, (_match, literal) => literal ?? '');
}

const RESET_ANCHOR = 'if (oldVersion > 0 && oldVersion < 10) {';

// The positions of every deleteObjectStore( and .clear( call in the source
// (comments already stripped) that lies outside the anchored reset block, or
// null when the anchor is missing.
function destructiveCallsOutsideResetBlock(source) {
  const anchor = source.indexOf(RESET_ANCHOR);
  if (anchor === -1) return null;
  const open = anchor + RESET_ANCHOR.length - 1;
  let depth = 0;
  let close = -1;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close === -1) return null;
  const outside = [];
  for (const match of source.matchAll(/deleteObjectStore\(|\.clear\(/g)) {
    if (match.index < open || match.index > close) outside.push(match.index);
  }
  return outside;
}

describe('no delete or clear lies outside the reset block (static ratchet)', () => {
  const dbSource = stripComments(readFileSync(fileURLToPath(new URL('./db.js', import.meta.url)), 'utf8'));

  it('db.js holds the anchored block, and every deleteObjectStore( and .clear( call is inside it', () => {
    const outside = destructiveCallsOutsideResetBlock(dbSource);
    expect(outside, `the anchor line ${RESET_ANCHOR} is missing or its block never closes`).not.toBeNull();
    expect(outside).toEqual([]);
    // The block does hold the drops: the scan is not passing on an empty file.
    expect(dbSource.split('deleteObjectStore(').length - 1).toBeGreaterThanOrEqual(5);
  });

  it('the scan itself fails on a delete outside the block, a clear outside it, and a missing anchor', () => {
    const block = `${RESET_ANCHOR}\n  db.deleteObjectStore('versions');\n}\n`;
    expect(destructiveCallsOutsideResetBlock(block)).toEqual([]);
    expect(destructiveCallsOutsideResetBlock(`${block}db.deleteObjectStore('x');\n`)).toHaveLength(1);
    expect(destructiveCallsOutsideResetBlock(`${block}tx.store.clear();\n`)).toHaveLength(1);
    expect(destructiveCallsOutsideResetBlock('db.deleteObjectStore(\'x\');\n')).toBeNull();
  });

  it('a comment naming either call cannot trip it', () => {
    const source = stripComments(`// db.deleteObjectStore( and .clear( are named here\n${RESET_ANCHOR}\n}\n/* .clear( */`);
    expect(destructiveCallsOutsideResetBlock(source)).toEqual([]);
  });
});
