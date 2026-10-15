import { openDB } from 'idb';

export const DB_NAME = 'sprinkles';
export const DB_VERSION = 9;

// The only module under app/src that touches the store library — every
// other module reaches the store through repository.js's seam (D-06).
// `onBlocked` is told when this open has to wait for another tab (WR-08).
export function openStore({ onBlocked = () => {} } = {}) {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // D-05, D-10: a returning profile below 8 resets rather than lifts:
      // the stores are dropped before the guarded creates below recreate
      // them, so the profile comes back with every store present and empty
      // and reseeds through seedIfEmpty. Order is load-bearing: for a
      // returning profile every guard below would skip (the stores already
      // exist), so the drop must run first or nothing would recreate them.
      // The bump to 8 resets because no live data exists and the shapes of
      // phase 04-03 (declared problems as lists, At draw / From freezer)
      // must reach every profile. The reset is bounded to profiles below 8
      // on purpose: records Mark makes from now on are real, so a later
      // bump must not inherit this wipe. It writes its own lift branch.
      // The bump to 9 (Phase 6, D-01) only adds the library store, so it needs neither a reset nor a lift.
      if (oldVersion > 0 && oldVersion < 8) {
        if (db.objectStoreNames.contains('versions')) db.deleteObjectStore('versions');
        if (db.objectStoreNames.contains('batches')) db.deleteObjectStore('batches');
        if (db.objectStoreNames.contains('recipes')) db.deleteObjectStore('recipes');
        if (db.objectStoreNames.contains('drafts')) db.deleteObjectStore('drafts');
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
      // D-16: one unsaved draft per version (one pen at a time, and the
      // recipe page is keyed by version), so the key is the version id.
      // Drafts stay on this device; they are never exported.
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'versionId' });
      }
      // One record per library entry, `{ id, entry }`, keyed by id like the
      // other stores (Phase 6 D-02); no secondary lookup, so no index (D-03);
      // store/seed.js fills it, never this file (D-05).
      if (!db.objectStoreNames.contains('library')) {
        db.createObjectStore('library', { keyPath: 'id' });
      }
      // This callback holds no async keyword at all: deleteObjectStore and
      // createObjectStore are synchronous, which is strictly stronger than
      // the previous IDB-native-only rule for what this callback could pause
      // on — nothing here can auto-commit the versionchange transaction early.
    },
    // Another tab holds an older version open, so this open waits until that
    // tab closes (WR-08). The caller says what to do; the open then finishes
    // on its own.
    blocked() {
      onBlocked();
    },
    // A newer version wants the database (WR-08): this tab is the old one.
    // The connection closes first, so the other tab is never left waiting,
    // then the tab reloads onto the new build. The reload's pagehide flush can
    // no longer write once the connection is closed, so up to the last 250 ms
    // of typing can be lost, the same bound RecipePage's pagehide comment
    // already accepts. `location` is absent under the node test environment.
    blocking(currentVersion, blockedVersion, event) {
      event.target.close();
      globalThis.location?.reload();
    },
  });
}
