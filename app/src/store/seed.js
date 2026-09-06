import { oliveOilVersion } from '../data/olive-oil.js';

// Seed-on-empty-store (D-07). The emptiness check goes through the
// repository seam, never a direct store probe, so the seam stays the
// single source of truth. After the first write, the seeded recipe is
// data like any other — saved through the same call every later write uses.
export async function seedIfEmpty(repository) {
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  await repository.saveVersion(oliveOilVersion);
}
