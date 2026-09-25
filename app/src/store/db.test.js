// The D-10/D-11 proof against a real IndexedDB: DB_VERSION 6 adds a third
// `recipes` store, and a returning profile at a prior version resets
// (D-10, one-way, approved by Mark) rather than lifting. This file
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

beforeEach(() => {
  // A fresh database state per test — fake-indexeddb's global indexedDB
  // persists across tests in the same file otherwise, and a leaked open
  // connection from a failed assertion would block a later delete/open.
  globalThis.indexedDB = new IDBFactory();
});

describe('openStore, against a real IndexedDB (fake-indexeddb)', () => {
  it('opens a fresh (deleted) database with versions, batches and recipes stores, at version 6', async () => {
    const db = await openStore();
    expect(db.version).toBe(6);
    expect(db.version).toBe(DB_VERSION);
    expect(db.objectStoreNames.contains('versions')).toBe(true);
    expect(db.objectStoreNames.contains('batches')).toBe(true);
    expect(db.objectStoreNames.contains('recipes')).toBe(true);
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
});
