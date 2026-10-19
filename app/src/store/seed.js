import { seedRecipeGroups } from '../data/seed-recipes.js';
import { library } from '../data/library.js';
import { librarySeedDb } from '../data/library-seed-db.js';

// The library seed (D-08, LIB-04): the reviewed dataset's entries merged under
// the 26 the app already held. The 26 are spread last, so a new entry can never
// overwrite one of them even if a key were to clash (library-seed-db.test.js
// fails first on a clash). It fills an empty library only (Phase 6 D-04); the
// database version bump of plan 09-09 clears every profile's library so the
// larger seed reaches it (decision 2, amending Phase 6 D-05).
const seededLibrary = { ...librarySeedDb, ...library };

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
  await repository.seedLibraryIfEmpty(Object.entries(seededLibrary).map(([id, entry]) => ({ id, entry })));
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  await repository.putAllRecipes(seedRecipeGroups.map((group) => group.recipe));
  await repository.putAllBatches(seedRecipeGroups.flatMap((group) => group.batches));
  await repository.putAll(seedRecipeGroups.flatMap((group) => group.versions));
}
