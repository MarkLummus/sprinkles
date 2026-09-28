// The seeded set's own invariants (plan 09): D-01 lineage, D-05 standings,
// store-file validation, finite balance figures and Notebook routing —
// proven over seedRecipeGroups as a whole, the array store/seed.js
// actually writes. Node environment (app/vitest.config.js default);
// imports data and domain modules only, never store/repository.js or idb,
// so this file stays provably store-free like every other domain-adjacent
// suite in this project.
import { describe, it, expect } from 'vitest';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { validateStoreFile, STORE_SCHEMA_VERSION } from './transfer.js';
import { computeBalance } from '../domain/composition.js';
import { buildFigures } from '../domain/figures.js';
import { railEntries } from '../domain/historyRail.js';
import { activeWork, NOT_YET_CHURNED, AWAITING_TASTING, TASTED } from '../domain/lastEvent.js';
import { latestVersionPath } from '../ui/notebookPaths.js';

function flatten(groups) {
  return {
    recipes: groups.map((g) => g.recipe),
    versions: groups.flatMap((g) => g.versions),
    batches: groups.flatMap((g) => g.batches),
  };
}

const { recipes, versions, batches } = flatten(seedRecipeGroups);

describe('Mexican Chocolate v1 -> v2 -> v3 -> v4 (D-01, amended 2026-09-25)', () => {
  const mexicanChocolateVersions = versions.filter((v) => v.recipeId === 'mexican-chocolate');

  it('holds exactly the ids mexican-chocolate-v1, -v2, -v3 and -v4', () => {
    expect(mexicanChocolateVersions.map((v) => v.id)).toEqual([
      'mexican-chocolate-v1',
      'mexican-chocolate-v2',
      'mexican-chocolate-v3',
      'mexican-chocolate-v4',
    ]);
  });

  it('chains parentVersionId v1 -> v2 -> v3 -> v4', () => {
    const byId = Object.fromEntries(mexicanChocolateVersions.map((v) => [v.id, v]));
    expect(byId['mexican-chocolate-v1'].parentVersionId).toBeNull();
    expect(byId['mexican-chocolate-v2'].parentVersionId).toBe('mexican-chocolate-v1');
    expect(byId['mexican-chocolate-v3'].parentVersionId).toBe('mexican-chocolate-v2');
    expect(byId['mexican-chocolate-v4'].parentVersionId).toBe('mexican-chocolate-v3');
  });

  it("railEntries over them reads 'Version 1 · v1' through 'Version 4 · v4', oldest first", () => {
    const entries = railEntries(mexicanChocolateVersions, batches, {});
    expect(entries).toHaveLength(4);
    expect(entries.map((e) => e.name)).toEqual([
      'Version 1 · v1',
      'Version 2 · v2',
      'Version 3 · v3',
      'Version 4 · v4',
    ]);
  });
});

describe('Standings coverage across the whole seed (D-05)', () => {
  it('activeWork over every seeded version, batch and recipe covers all three standings', () => {
    const work = activeWork(versions, batches, recipes);
    expect(work.length).toBe(recipes.length);
    const standings = new Set(work.map((entry) => entry.standing));
    expect(standings.has(NOT_YET_CHURNED)).toBe(true);
    expect(standings.has(AWAITING_TASTING)).toBe(true);
    expect(standings.has(TASTED)).toBe(true);
  });
});

describe('Store-file validation over the whole seed (D-07 gate closed)', () => {
  it('validateStoreFile returns ok with no errors', () => {
    const result = validateStoreFile({
      app: 'sprinkles',
      schemaVersion: STORE_SCHEMA_VERSION,
      recipes,
      versions,
      batches,
    });
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });
});

describe('Every version resolves, computes and routes (D-06, D-14)', () => {
  const recipeIds = new Set(recipes.map((r) => r.id));

  it("every version's recipeId matches a seeded recipe's id", () => {
    for (const version of versions) {
      expect(recipeIds.has(version.recipeId)).toBe(true);
    }
  });

  it('computeBalance and buildFigures return finite numbers for every version', () => {
    expect(versions.length).toBeGreaterThan(0);
    for (const version of versions) {
      const balance = computeBalance(version.rows);
      expect(balance).not.toBeNull();
      expect(Number.isFinite(balance.pac)).toBe(true);
      expect(Number.isFinite(balance.pod)).toBe(true);
      for (const key of Object.keys(balance.percent)) {
        expect(Number.isFinite(balance.percent[key])).toBe(true);
      }
      const figures = buildFigures(version);
      for (const figure of figures) {
        expect(Number.isFinite(figure.value)).toBe(true);
      }
    }
  });

  it("latestVersionPath resolves a '/notebook/…' path for every seeded recipe", () => {
    for (const recipe of recipes) {
      const path = latestVersionPath(versions, recipe.id);
      expect(path).toMatch(/^\/notebook\//);
    }
  });
});
