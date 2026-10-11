// The D-10/D-11/D-16 proof against a real IndexedDB: DB_VERSION 8 (phase 04:
// the shapes of 04-03 must reach every profile, and the drafts store is
// new) holds versions, batches, recipes and drafts, and a returning profile
// below 8 resets (D-10, one-way, approved by Mark) rather than lifting. The
// reset is bounded: a profile already at 8 keeps what it holds. This file
// imports db.js only — never repository.js and never idb itself, so the
// project's seam grep (only db.js under app/src imports 'idb') stays
// exact. The fake-indexeddb setup mirrors app/tests/db-reset.test.js: a
// fresh IDBFactory per test, since a leaked open connection from a failed
// assertion in one test would otherwise block a later test's delete/open
// indefinitely.
import { describe, it, beforeEach, expect } from 'vitest';
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
import { DB_NAME, DB_VERSION, openStore } from './db.js';

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
  it('opens a fresh (deleted) database with versions, batches, recipes and drafts stores, at version 8', async () => {
    const db = await openStore();
    expect(db.version).toBe(8);
    expect(db.version).toBe(DB_VERSION);
    expect(db.objectStoreNames.contains('versions')).toBe(true);
    expect(db.objectStoreNames.contains('batches')).toBe(true);
    expect(db.objectStoreNames.contains('recipes')).toBe(true);
    expect(db.objectStoreNames.contains('drafts')).toBe(true);
    db.close();
  });

  it('keys the drafts store by versionId', async () => {
    const db = await openStore();
    await db.put('drafts', { versionId: 'v1', note: 'first' });
    await db.put('drafts', { versionId: 'v1', note: 'second' });
    expect(await db.getAll('drafts')).toEqual([{ versionId: 'v1', note: 'second' }]);
    db.close();
  });

  it('resets a database first opened at version 7 (one version, one batch) to all four stores, empty', async () => {
    await seedOldProfile(7, {
      stores: ['versions', 'batches', 'recipes'],
      records: [
        ['versions', { id: 'pre-existing' }],
        ['batches', { id: 'pre-existing-batch', versionId: 'pre-existing' }],
      ],
    });

    const db = await openStore();
    expect(db.version).toBe(8);
    for (const name of ['versions', 'batches', 'recipes', 'drafts']) {
      expect(db.objectStoreNames.contains(name)).toBe(true);
      expect(await db.getAll(name)).toEqual([]);
    }
    db.close();
  });

  it('already at 8 keeps its records: a version and a draft survive a second open', async () => {
    const first = await openStore();
    await first.put('versions', { id: 'kept-version' });
    await first.put('drafts', { versionId: 'kept-version', note: 'kept-draft' });
    first.close();

    const db = await openStore();
    expect(await db.getAll('versions')).toEqual([{ id: 'kept-version' }]);
    expect(await db.getAll('drafts')).toEqual([{ versionId: 'kept-version', note: 'kept-draft' }]);
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
    expect(db.version).toBe(8);
    expect(db.objectStoreNames.contains('versions')).toBe(true);
    expect(db.objectStoreNames.contains('batches')).toBe(true);
    expect(db.objectStoreNames.contains('recipes')).toBe(true);
    expect(db.objectStoreNames.contains('drafts')).toBe(true);
    expect(await db.getAll('versions')).toEqual([]);
    db.close();
  });
});
