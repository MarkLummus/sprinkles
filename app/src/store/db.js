import { openDB } from 'idb';
import { liftVersionRecord } from './versionLift.js';

export const DB_NAME = 'sprinkles';
export const DB_VERSION = 3;

// The only module under app/src that touches the store library — every
// other module reaches the store through repository.js's seam (D-06).
export function openStore() {
  return openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      // Both guards are load-bearing: this callback runs cumulatively from
      // whatever version a returning browser profile actually holds, so an
      // unguarded createObjectStore for 'versions' throws for anyone who
      // ran Phase 1's build.
      if (!db.objectStoreNames.contains('versions')) {
        db.createObjectStore('versions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('batches')) {
        const batches = db.createObjectStore('batches', { keyPath: 'id' });
        batches.createIndex('by-version', 'versionId');
      }
      // D-06: lift every stored version record to the current shape in
      // place. The only awaited expressions in this branch are
      // store.openCursor() and cursor.continue() — both IDB-native
      // requests on this same versionchange transaction; liftVersionRecord
      // itself is synchronous, so nothing here can auto-commit the
      // transaction early (RESEARCH.md Pitfall 1).
      if (oldVersion < 3) {
        const store = transaction.objectStore('versions');
        let cursor = await store.openCursor();
        while (cursor) {
          cursor.update(liftVersionRecord(cursor.value));
          cursor = await cursor.continue();
        }
      }
    },
  });
}
