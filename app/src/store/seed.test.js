import { describe, it, expect } from 'vitest';
import { seedIfEmpty } from './seed.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { library } from '../data/library.js';
import { librarySeedDb } from '../data/library-seed-db.js';

// The library a fresh profile is seeded with: the reviewed dataset's entries
// merged under the 26 (LIB-04). The 26 win a clash.
const seededLibrary = { ...librarySeedDb, ...library };

// A plain in-memory object implementing the repository seam's contract —
// no store library, no browser. This is why seedIfEmpty takes its
// repository as a parameter, and testing the seam contract rather than the
// storage engine is the point. Its writers upsert by id, as the store's puts
// do, so a repeated write replaces records instead of duplicating them.
function upsert(list, items) {
  for (const item of items) {
    const i = list.findIndex((entry) => entry.id === item.id);
    if (i >= 0) list[i] = item;
    else list.push(item);
  }
}

function createInMemoryRepository(initial = [], initialLibrary = []) {
  const versions = [...initial];
  const batches = [];
  const recipes = [];
  const library = [...initialLibrary];
  const writes = [];
  return {
    versions,
    batches,
    recipes,
    library,
    writes,
    async listVersions() {
      return versions;
    },
    async putAll(items) {
      writes.push('versions');
      upsert(versions, items);
    },
    async putAllBatches(items) {
      writes.push('batches');
      upsert(batches, items);
    },
    async putAllRecipes(items) {
      writes.push('recipes');
      upsert(recipes, items);
    },
    async seedLibraryIfEmpty(records) {
      if (library.length > 0) return false;
      writes.push('library');
      upsert(library, records);
      return true;
    },
  };
}

describe('seedIfEmpty', () => {
  it('writes one recipe record per group, in seedRecipeGroups order', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    expect(repository.recipes.map((r) => r.id)).toEqual(seedRecipeGroups.map((g) => g.recipe.id));
  });

  it('writes every version of every group, in group and version order', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    const expectedVersionIds = seedRecipeGroups.flatMap((g) => g.versions.map((v) => v.id));
    expect(repository.versions.map((v) => v.id)).toEqual(expectedVersionIds);
  });

  it('writes every batch of every group, in group and batch order', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    const expectedBatchIds = seedRecipeGroups.flatMap((g) => g.batches.map((b) => b.id));
    expect(repository.batches.map((b) => b.id)).toEqual(expectedBatchIds);
  });

  it('writes oliveOilRecipe first and oliveOilVersion first', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    expect(repository.recipes[0].id).toBe('olive-oil-ice-cream');
    expect(repository.versions[0].id).toBe('olive-oil-ice-cream-v1');
  });

  it('writes the library first and versions last, so the versions check only flips once recipes and batches are in', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    expect(repository.writes).toEqual(['library', 'recipes', 'batches', 'versions']);
  });

  it('is idempotent: a second call against the filled repository writes nothing further', async () => {
    const repository = createInMemoryRepository([]);
    await seedIfEmpty(repository);
    const versionCount = repository.versions.length;
    const batchCount = repository.batches.length;
    const recipeCount = repository.recipes.length;
    const libraryCount = repository.library.length;
    const writeCount = repository.writes.length;
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(versionCount);
    expect(repository.batches.length).toBe(batchCount);
    expect(repository.recipes.length).toBe(recipeCount);
    expect(repository.library.length).toBe(libraryCount);
    expect(repository.writes.length).toBe(writeCount);
  });

  it('writes nothing and leaves an existing unrelated record untouched', async () => {
    const existingEntry = { id: 'existing-entry', entry: { name: 'Existing', composition: {} } };
    const repository = createInMemoryRepository([{ id: 'existing' }], [existingEntry]);
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(1);
    expect(repository.versions[0].id).toBe('existing');
    expect(repository.recipes.length).toBe(0);
    expect(repository.batches.length).toBe(0);
    expect(repository.writes).toEqual([]);
    expect(repository.library).toEqual([existingEntry]);
  });
});

describe('seedIfEmpty, the two independent guards (D-04)', () => {
  const expectSeededLibrary = (repository) => {
    expect(repository.library).toHaveLength(Object.keys(seededLibrary).length);
    for (const record of repository.library) {
      expect(Object.keys(record).sort()).toEqual(['entry', 'id']);
      expect(record.entry).toEqual(seededLibrary[record.id]);
    }
  };

  it('empty versions, empty library: writes the library, recipes, batches and versions', async () => {
    const repository = createInMemoryRepository([], []);
    await seedIfEmpty(repository);
    expect(repository.writes).toEqual(['library', 'recipes', 'batches', 'versions']);
    expectSeededLibrary(repository);
  });

  it('empty versions, filled library: writes recipes, batches and versions, and leaves the one library record alone', async () => {
    const existingEntry = { id: 'existing-entry', entry: { name: 'Existing', composition: {} } };
    const repository = createInMemoryRepository([], [existingEntry]);
    await seedIfEmpty(repository);
    expect(repository.writes).toEqual(['recipes', 'batches', 'versions']);
    expect(repository.library).toEqual([existingEntry]);
  });

  it('filled versions, empty library: writes the library only', async () => {
    const repository = createInMemoryRepository([{ id: 'existing' }], []);
    await seedIfEmpty(repository);
    expect(repository.writes).toEqual(['library']);
    expect(repository.versions).toEqual([{ id: 'existing' }]);
    expect(repository.recipes).toEqual([]);
    expect(repository.batches).toEqual([]);
    expectSeededLibrary(repository);
  });

  it('filled versions, filled library: writes nothing', async () => {
    const existingEntry = { id: 'existing-entry', entry: { name: 'Existing', composition: {} } };
    const repository = createInMemoryRepository([{ id: 'existing' }], [existingEntry]);
    await seedIfEmpty(repository);
    expect(repository.writes).toEqual([]);
    expect(repository.library).toEqual([existingEntry]);
    expect(repository.versions).toEqual([{ id: 'existing' }]);
  });

  it('an interrupted seed repeats only the part still missing (D-04)', async () => {
    const repository = createInMemoryRepository([], []);
    const putAll = repository.putAll;
    let failed = false;
    repository.putAll = async (items) => {
      if (!failed) {
        failed = true;
        throw new Error('interrupted');
      }
      return putAll(items);
    };

    await expect(seedIfEmpty(repository)).rejects.toThrow('interrupted');
    expect(repository.writes).toEqual(['library', 'recipes', 'batches']);
    expect(repository.versions).toEqual([]);

    repository.writes.length = 0;
    await seedIfEmpty(repository);
    expect(repository.writes).toEqual(['recipes', 'batches', 'versions']);

    expect(repository.library.map((record) => record.id)).toEqual(Object.keys(seededLibrary));
    for (const record of repository.library) expect(record.entry).toEqual(seededLibrary[record.id]);
    expect(repository.recipes).toEqual(seedRecipeGroups.map((g) => g.recipe));
    expect(repository.batches).toEqual(seedRecipeGroups.flatMap((g) => g.batches));
    expect(repository.versions).toEqual(seedRecipeGroups.flatMap((g) => g.versions));
  });
});
