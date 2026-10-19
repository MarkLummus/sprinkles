// Test-only builders for store files (plan 09-10). Not imported by the app:
// every store-file test builds its file through storeFileOf, so the four seed
// tables the file now carries are written in one place.
import { STORE_SCHEMA_VERSION } from './transfer.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';

/**
 * storeFileOf(parts) -> a well-formed schema-9 store file: the app tag, the
 * schema version, an export time, the eight arrays (recipes, versions, batches
 * and library empty; machines, styles, scales and problems copies of the seed
 * catalog), then `parts` over the top.
 */
export function storeFileOf(parts = {}) {
  return {
    app: 'sprinkles',
    schemaVersion: STORE_SCHEMA_VERSION,
    exportedAt: '2026-10-14T00:00:00.000Z',
    recipes: [],
    versions: [],
    batches: [],
    library: [],
    machines: structuredClone(SEED_CATALOG.machines),
    styles: structuredClone(SEED_CATALOG.styles),
    scales: structuredClone(SEED_CATALOG.scales),
    problems: structuredClone(SEED_CATALOG.problems),
    ...parts,
  };
}

/** stampedSeedVersions() -> copies of the seeded versions carrying their stored Sheet codes (seedRecipeGroups). */
export function stampedSeedVersions() {
  return structuredClone(seedRecipeGroups.flatMap((group) => group.versions));
}
