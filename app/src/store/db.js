import { openDB } from 'idb';

export const DB_NAME = 'sprinkles';
// DB_VERSION 10 is Phase 9's one shape change for v2.0 (LIB-06): the store file
// schema (transfer.js, plan 09-10) moves to 9 with it. VERSION_SCHEMA_VERSION
// (data/olive-oil.js, mirrored in domain/newRecipe.js) and BATCH_SCHEMA_VERSION
// (domain/batch.js) stay as they are: nothing branches on them.
export const DB_VERSION = 10;

// The upgrade, exported so a test can call it directly over a hand-built
// profile (the behavioural ratchet in db.test.js, the interrupted-upgrade case
// in tests/db-upgrade-10.test.js). It holds no async keyword at all:
// deleteObjectStore and createObjectStore are synchronous, which is strictly
// stronger than the previous IDB-native-only rule for what it could pause on,
// so nothing here can auto-commit the versionchange transaction early.
//
// The drops, the creates and the version change are one versionchange
// transaction: an interrupted upgrade leaves the profile at its old version
// and the next open runs it again.
export function upgradeStores(db, oldVersion, newVersion, transaction) {
  // Decisions 2 and 5, LIB-06: a returning profile below 10 resets rather
  // than lifts. The stores are dropped before the guarded creates below
  // recreate them, so the profile comes back with every store present and
  // empty and reseeds through seedIfEmpty. Order is load-bearing: for a
  // returning profile every guard below would skip (the stores already
  // exist), so the drop must run first or nothing would recreate them.
  // The library is dropped too, so the larger seed reaches every profile
  // (this amends Phase 6 D-05, which kept a library across upgrades); that
  // also removes library records an import wrote, which is harmless while the
  // library is read-only. Earlier resets (to 8 for Phase 4's shapes) are
  // folded into this one: a profile at any version below 10 gets the same drop.
  // This is the last reset v2.0 makes, and it is bounded to profiles below 10
  // on purpose: from Phase 11 the store holds recipes a maker made, so a later
  // bump writes its own lift branch and never reaches this block (the
  // ratchets in db.test.js hold it there).
  if (oldVersion > 0 && oldVersion < 10) {
    if (db.objectStoreNames.contains('versions')) db.deleteObjectStore('versions');
    if (db.objectStoreNames.contains('batches')) db.deleteObjectStore('batches');
    if (db.objectStoreNames.contains('recipes')) db.deleteObjectStore('recipes');
    if (db.objectStoreNames.contains('drafts')) db.deleteObjectStore('drafts');
    if (db.objectStoreNames.contains('library')) db.deleteObjectStore('library');
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
  // The four seed tables (LIB-09, D-17): machines, ice cream styles, scales and
  // problems. Each row is keyed by id with no secondary lookup; store/seed.js
  // fills them at boot while empty, never this file.
  for (const name of ['machines', 'styles', 'scales', 'problems']) {
    if (!db.objectStoreNames.contains(name)) {
      db.createObjectStore(name, { keyPath: 'id' });
    }
  }
}

// The only module under app/src that touches the store library — every
// other module reaches the store through repository.js's seam (D-06).
// `onBlocked` is told when this open has to wait for another tab (WR-08).
export function openStore({ onBlocked = () => {} } = {}) {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      upgradeStores(db, oldVersion, newVersion, transaction);
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
