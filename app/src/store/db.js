import { openDB } from 'idb';

export const DB_NAME = 'sprinkles';
export const DB_VERSION = 1;

// The only module under app/src that touches the store library — every
// other module reaches the store through repository.js's seam (D-06).
export function openStore() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('versions', { keyPath: 'id' });
    },
  });
}
