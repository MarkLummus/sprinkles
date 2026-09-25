import { openDB } from 'idb';

export const DB_NAME = 'sprinkles';
export const DB_VERSION = 6;

// The only module under app/src that touches the store library — every
// other module reaches the store through repository.js's seam (D-06).
export function openStore() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // D-05, D-10: the store resets rather than lifts — drop all three
      // stores before the three guarded creates below recreate them, so a
      // returning profile comes back with all three stores present and
      // empty and reseeds through seedIfEmpty. Order is load-bearing: for
      // a returning profile every guard below would skip (the stores
      // already exist), so the drop must run first or nothing would
      // recreate them.
      if (oldVersion > 0 && oldVersion < DB_VERSION) {
        if (db.objectStoreNames.contains('versions')) db.deleteObjectStore('versions');
        if (db.objectStoreNames.contains('batches')) db.deleteObjectStore('batches');
        if (db.objectStoreNames.contains('recipes')) db.deleteObjectStore('recipes');
      }
      // Every guard is load-bearing: this callback runs cumulatively from
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
      // D-11: the recipe record has no secondary lookup key, so no index.
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id' });
      }
      // This callback holds no async keyword at all: deleteObjectStore and
      // createObjectStore are synchronous, which is strictly stronger than
      // the previous IDB-native-only rule for what this callback could pause
      // on — nothing here can auto-commit the versionchange transaction early.
    },
  });
}
