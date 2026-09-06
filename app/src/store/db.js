import { openDB } from 'idb';

export const DB_NAME = 'sprinkles';
export const DB_VERSION = 2;

// The only module under app/src that touches the store library — every
// other module reaches the store through repository.js's seam (D-06).
export function openStore() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
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
    },
  });
}
