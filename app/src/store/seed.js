import { seedRecipeGroups } from '../data/seed-recipes.js';

// Seed-on-empty-store (seed open questions approved 2026-09-28, D-07). The
// emptiness check goes through the repository seam, never a direct store
// probe, so the seam stays the single source of truth. The check reads the
// versions store, so versions are written last: recipes and batches go in
// first, each store in one transaction, and only the final versions write
// flips the check. A seed interrupted before that point leaves the store
// still looking empty and the next boot seeds again; the writes are puts,
// so the repeat is harmless. Groups keep seedRecipeGroups order (olive oil
// first, so the store's first-written records stay the working case).
export async function seedIfEmpty(repository) {
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  await repository.putAllRecipes(seedRecipeGroups.map((group) => group.recipe));
  await repository.putAllBatches(seedRecipeGroups.flatMap((group) => group.batches));
  await repository.putAll(seedRecipeGroups.flatMap((group) => group.versions));
}
