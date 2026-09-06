import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

// Seed-on-empty-store (D-07). The emptiness check goes through the
// repository seam, never a direct store probe, so the seam stays the
// single source of truth. After the first write, the seeded recipe and
// its working-case batch are data like any other — saved through the same
// calls every later write uses.
export async function seedIfEmpty(repository) {
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  await repository.saveVersion(oliveOilVersion);
  await repository.saveBatch(augustSecondBatch);
}
