import { openStore } from './db.js';

// The repository seam D-06 and D-16 depend on — the only path to the store:
// versions, batches, recipes, the ingredient library, and the drafts of unsaved pens.
// No component, no domain module, and no seed check may reach past it.
export function createRepository() {
  // Boot waits on the open, and an older tab can hold the open up (WR-08):
  // the flag and the single listener slot let main.jsx say so, whichever of
  // the event and the registration comes first.
  let blocked = false;
  let blockedListener = null;
  const dbPromise = openStore({
    onBlocked() {
      blocked = true;
      if (blockedListener) blockedListener();
    },
  });

  return {
    onBlocked(listener) {
      blockedListener = listener;
      if (blocked) listener();
    },
    async listVersions() {
      const db = await dbPromise;
      return db.getAll('versions');
    },
    async getVersion(id) {
      const db = await dbPromise;
      return db.get('versions', id);
    },
    async saveVersion(version) {
      const db = await dbPromise;
      return db.put('versions', version);
    },
    async getAll() {
      const db = await dbPromise;
      return db.getAll('versions');
    },
    async putAll(versions) {
      const db = await dbPromise;
      const tx = db.transaction('versions', 'readwrite');
      await Promise.all(versions.map((version) => tx.store.put(version)));
      return tx.done;
    },
    async listBatchesForVersion(versionId) {
      const db = await dbPromise;
      return db.getAllFromIndex('batches', 'by-version', versionId);
    },
    async getBatch(id) {
      const db = await dbPromise;
      return db.get('batches', id);
    },
    async saveBatch(batch) {
      const db = await dbPromise;
      return db.put('batches', batch);
    },
    async getAllBatches() {
      const db = await dbPromise;
      return db.getAll('batches');
    },
    async putAllBatches(batches) {
      const db = await dbPromise;
      const tx = db.transaction('batches', 'readwrite');
      await Promise.all(batches.map((batch) => tx.store.put(batch)));
      return tx.done;
    },
    async listRecipes() {
      const db = await dbPromise;
      return db.getAll('recipes');
    },
    async getRecipe(id) {
      const db = await dbPromise;
      return db.get('recipes', id);
    },
    async saveRecipe(recipe) {
      const db = await dbPromise;
      return db.put('recipes', recipe);
    },
    async putAllRecipes(recipes) {
      const db = await dbPromise;
      const tx = db.transaction('recipes', 'readwrite');
      await Promise.all(recipes.map((recipe) => tx.store.put(recipe)));
      return tx.done;
    },
    // A library record is `{ id, entry }`, `id` being the data/library.js key
    // and `entry` that entry unchanged (Phase 6 D-02). getLibraryEntry returns
    // the stored record, not the bare entry, as getRecipe returns the stored
    // recipe. putAllLibrary aborts by hand for the reason importAll gives: a
    // put the store cannot clone throws before it queues and leaves the
    // transaction open, so without the abort the puts already queued would
    // commit. It serves the tests that change an entry (this file's upsert
    // test, Plan 02's LIB-02 proof and its held-seed test); the seed gets its
    // own one-transaction method in Plan 02 (06-CONTEXT.md D-04 as amended),
    // and import writes through importAll (no other write method).
    async listLibrary() {
      const db = await dbPromise;
      return db.getAll('library');
    },
    async getLibraryEntry(id) {
      const db = await dbPromise;
      return db.get('library', id);
    },
    async putAllLibrary(records) {
      const db = await dbPromise;
      const tx = db.transaction('library', 'readwrite');
      const done = tx.done;
      const queued = [];
      try {
        for (const record of records) queued.push(tx.store.put(record));
        await Promise.all([...queued, done]);
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    // An import is one readwrite transaction over the three stores it
    // writes: a failed put aborts it, so a storage failure part-way leaves
    // every store exactly as it was. A put the store cannot clone throws
    // before it queues and leaves the transaction open, so the catch aborts
    // it by hand or the puts already queued would commit.
    async importAll({ recipes, versions, batches }) {
      const db = await dbPromise;
      const tx = db.transaction(['recipes', 'versions', 'batches'], 'readwrite');
      const done = tx.done;
      // Every queued put is kept so a failure can quiet the ones the abort
      // rejects behind it.
      const queued = [];
      try {
        for (const recipe of recipes) queued.push(tx.objectStore('recipes').put(recipe));
        for (const version of versions) queued.push(tx.objectStore('versions').put(version));
        for (const batch of batches) queued.push(tx.objectStore('batches').put(batch));
        await Promise.all([...queued, done]);
      } catch (error) {
        try {
          tx.abort();
        } catch {
          // The transaction already finished or aborted itself.
        }
        for (const request of [...queued, done]) request.catch(() => {});
        throw error;
      }
    },
    // D-16: a draft is one unsaved pen, keyed by its version id.
    async getDraft(versionId) {
      const db = await dbPromise;
      return db.get('drafts', versionId);
    },
    async saveDraft(record) {
      const db = await dbPromise;
      return db.put('drafts', record);
    },
    async deleteDraft(versionId) {
      const db = await dbPromise;
      return db.delete('drafts', versionId);
    },
    async listDrafts() {
      const db = await dbPromise;
      return db.getAll('drafts');
    },
  };
}

// One instance for the whole app (main.jsx seeds it, the routed components
// read through it) — created once, at module load.
export const repository = createRepository();
