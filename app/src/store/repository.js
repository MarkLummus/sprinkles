import { openStore } from './db.js';

// The repository seam D-06 and D-16 depend on — the only path to the store.
// No component, no domain module, and no seed check may reach past it.
export function createRepository() {
  const dbPromise = openStore();

  return {
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
  };
}

// One instance for the whole app (main.jsx seeds it, the routed components
// read through it) — created once, at module load.
export const repository = createRepository();
