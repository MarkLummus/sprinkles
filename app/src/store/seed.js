import { seedRecipeGroups } from '../data/seed-recipes.js';

// Seed-on-empty-store (D-07: the transcribed groups wait for this file
// until Mark approves 03.5-SEED-REVIEW.md). The emptiness check goes
// through the repository seam, never a direct store probe, so the seam
// stays the single source of truth. Groups seed in seedRecipeGroups order
// (olive oil first, so the store's first-written records stay the working
// case): each group's recipe record, then every one of its versions, then
// every one of its batches — all through the same repository calls every
// later write uses.
export async function seedIfEmpty(repository) {
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  for (const group of seedRecipeGroups) {
    await repository.saveRecipe(group.recipe);
    for (const version of group.versions) {
      await repository.saveVersion(version);
    }
    for (const batch of group.batches) {
      await repository.saveBatch(batch);
    }
  }
}
