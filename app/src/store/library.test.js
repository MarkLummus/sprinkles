// Real-IndexedDB proofs for the ingredient library store (Phase 6: LIB-01,
// LIB-02, D-01a). The file reads the store only through the repository seam,
// except for the raw version-8 fixture, which opens the database at an older
// version the way db.test.js does.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { seedIfEmpty } from './seed.js';
import { library } from '../data/library.js';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

describe('the library store, seeded on an empty database (LIB-01)', () => {
  it('holds every data/library.js entry as { id, entry } and nothing else, read through a fresh connection', async () => {
    await seedIfEmpty(createRepository());

    const repository = createRepository();
    const records = await repository.listLibrary();
    const ids = Object.keys(library);

    expect(records).toHaveLength(ids.length);
    expect(records.map((record) => record.id).sort()).toEqual([...ids].sort());
    for (const record of records) {
      expect(Object.keys(record).sort()).toEqual(['entry', 'id']);
      expect(record.entry).toEqual(library[record.id]);
      expect(Object.hasOwn(record.entry, 'id')).toBe(false);
    }
    expect(await repository.getLibraryEntry('wholeMilk')).toEqual({ id: 'wholeMilk', entry: library.wholeMilk });
  });
});
