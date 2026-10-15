import { seedRecipeGroups } from '../data/seed-recipes.js';
import { library } from '../data/library.js';

// Seed-on-empty-store (seed open questions approved 2026-09-28, D-07). There
// are two independent guards, both through the repository seam, never a
// direct store probe, so the seam stays the single source of truth.
//
// The library's is one repository call whose emptiness check and write are
// one transaction (Phase 6 D-04 as amended): an empty library gets every seed
// entry as { id, entry } (Phase 6 D-02), whatever the versions store holds,
// and a library another tab has already filled, or an import has changed, is
// left alone. An empty library is refilled at boot whatever emptied it
// (D-04a); a library holding any record is never topped up (D-05).
//
// The other reads the versions store, so versions are written last: recipes
// and batches go in first, each store in one transaction, and only the final
// versions write flips the check. The library goes first. An interrupted seed
// repeats whichever part is still empty, and the writes are puts, so a repeat
// is harmless. Groups keep seedRecipeGroups order (olive oil first, so the
// store's first-written records stay the working case).
export async function seedIfEmpty(repository) {
  await repository.seedLibraryIfEmpty(Object.entries(library).map(([id, entry]) => ({ id, entry })));
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  await repository.putAllRecipes(seedRecipeGroups.map((group) => group.recipe));
  await repository.putAllBatches(seedRecipeGroups.flatMap((group) => group.batches));
  await repository.putAll(seedRecipeGroups.flatMap((group) => group.versions));
}
