import { describe, it, expect } from 'vitest';
import { seedIfEmpty } from './seed.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';

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
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(versionCount);
    expect(repository.batches.length).toBe(batchCount);
    expect(repository.recipes.length).toBe(recipeCount);
  });

  it('writes nothing and leaves an existing unrelated record untouched', async () => {
    const repository = createInMemoryRepository([{ id: 'existing' }]);
    await seedIfEmpty(repository);
    expect(repository.versions.length).toBe(1);
    expect(repository.versions[0].id).toBe('existing');
    expect(repository.recipes.length).toBe(0);
    expect(repository.batches.length).toBe(0);
  });
});
