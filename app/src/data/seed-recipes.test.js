// Store-file validation and finite-balance guarantees for every transcribed
// seed recipe (Mexican Chocolate, Pineapple, Coconut) — the D-07 review gate
// covers only these data files; nothing here is wired into store/seed.js,
// which this file never imports.
import { describe, it, expect } from 'vitest';
import { transcribedRecipeGroups } from './seed-recipes.js';
import { mexicanChocolateV1, mexicanChocolateV2, mexicanChocolateV3, mexicanChocolateV4 } from './mexican-chocolate.js';
import { validateStoreFile, STORE_SCHEMA_VERSION } from '../store/transfer.js';
import { computeBalance } from '../domain/composition.js';
import { buildFigures } from '../domain/figures.js';
import { buildAdvisories } from '../domain/advisories.js';
import { pineappleV1 } from './pineapple.js';
import { coconutV1, coconutV2 } from './coconut.js';
import { standingFor, NOT_YET_CHURNED, AWAITING_TASTING, TASTED } from '../domain/lastEvent.js';
import { railEntries } from '../domain/historyRail.js';

function flatten(groups) {
  return {
    recipes: groups.map((g) => g.recipe),
    versions: groups.flatMap((g) => g.versions),
    batches: groups.flatMap((g) => g.batches),
  };
}

function collectStrings(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

describe('transcribedRecipeGroups validates as a store file (D-07 gate: not wired into seed.js)', () => {
  it('passes validateStoreFile at the current schema version with no errors', () => {
    const { recipes, versions, batches } = flatten(transcribedRecipeGroups);
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

  it('every transcribed version computes a finite balance and builds figures/advisories without throwing', () => {
    const { versions } = flatten(transcribedRecipeGroups);
    expect(versions.length).toBeGreaterThan(0);
    for (const version of versions) {
      const balance = computeBalance(version.rows);
      expect(balance).not.toBeNull();
      expect(Number.isFinite(balance.pac)).toBe(true);
      expect(Number.isFinite(balance.pod)).toBe(true);
      for (const key of Object.keys(balance.percent)) {
        expect(Number.isFinite(balance.percent[key])).toBe(true);
      }
      expect(() => buildFigures(version)).not.toThrow();
      expect(() => buildAdvisories(version)).not.toThrow();
    }
  });

  it('no string anywhere in a transcribed module contains HTML (no "<" followed by a letter)', () => {
    const { recipes, versions, batches } = flatten(transcribedRecipeGroups);
    const strings = [
      ...collectStrings(recipes),
      ...collectStrings(versions),
      ...collectStrings(batches),
    ];
    for (const s of strings) {
      expect(s).not.toMatch(/<[a-zA-Z]/);
    }
  });
});

describe('mexicanChocolateV4 (D-01, D-02, D-03)', () => {
  it('has 12 rows in Ice Ed source order with matching grams', () => {
    const expected = [
      ['Whole Milk 3.3%', 563],
      ['Cream, heavy', 85.6],
      ['Dried Skimmed Milk Powder', 43.7],
      ['Sucrose', 33.4],
      ['Dextrose', 41],
      ['Allulose', 85.3],
      ['Fructose', 5.32],
      ['Salt', 1.07],
      ['Stabilizer Mix 4421', 2.33],
      ['Cocoa Powder', 40.8],
      ['Vanilla Extract', 7.45],
      ['Cinnamon', 2.77],
    ];
    expect(mexicanChocolateV4.rows).toHaveLength(12);
    mexicanChocolateV4.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      const total = row.portions.reduce((t, p) => t + p.grams, 0);
      expect(total).toBeCloseTo(expected[i][1], 5);
    });
  });
});

describe('mexicanChocolateV2 (v2-2.ier export, Mark 2026-09-25)', () => {
  it('has 12 rows in the .ier source order with matching grams', () => {
    const expected = [
      ['Whole Milk 3.3%', 427],
      ['Cocoa Powder', 30],
      ['Sucrose', 50],
      ['Dextrose', 35],
      ['Fructose', 5],
      ['Dried Skimmed Milk Powder', 39],
      ['Salt', 1],
      ['Cream, heavy', 140],
      ['Vanilla Extract', 7],
      ['Stabilizer Mix 4421', 2.2],
      ['Cinnamon', 2.6],
      ['Allulose', 50],
    ];
    expect(mexicanChocolateV2.rows).toHaveLength(12);
    mexicanChocolateV2.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      const total = row.portions.reduce((t, p) => t + p.grams, 0);
      expect(total).toBeCloseTo(expected[i][1], 5);
    });
  });

  it('carries the record fields Mark approved 2026-09-25', () => {
    expect(mexicanChocolateV2.id).toBe('mexican-chocolate-v2');
    expect(mexicanChocolateV2.versionLabel).toBe('v2');
    expect(mexicanChocolateV2.recipeId).toBe('mexican-chocolate');
    expect(mexicanChocolateV2.parentVersionId).toBe(mexicanChocolateV1.id);
    expect(mexicanChocolateV2.parentVersionLabel).toBe('v1');
    expect(mexicanChocolateV2.reason).toBeNull();
    expect(mexicanChocolateV2.citedBatchId).toBeNull();
    expect(mexicanChocolateV2.createdAt).toBe('2026-01-11T23:22:38.000Z');
    expect(mexicanChocolateV2.process).toEqual({ pasteuriseC: 75, holdMinutes: 60 });
    expect(mexicanChocolateV2.iceEd).toEqual({
      style: 'Gelato',
      servingTemperatureC: -16,
      hardness: 0.75,
      overrunPercent: 0.2993,
    });
  });

  it('method deep-equals mexicanChocolateV4s method (the v4 precedent, Mark 2026-09-25)', () => {
    expect(mexicanChocolateV2.method).toEqual(mexicanChocolateV4.method);
  });
});

describe('Mexican Chocolate lineage (v1 -> v2 -> v3 -> v4)', () => {
  it('v2s parent is v1, v3s parent is v2, and v4s parent is v3', () => {
    expect(mexicanChocolateV2.parentVersionId).toBe(mexicanChocolateV1.id);
    expect(mexicanChocolateV2.parentVersionLabel).toBe(mexicanChocolateV1.versionLabel);
    expect(mexicanChocolateV3.parentVersionId).toBe(mexicanChocolateV2.id);
    expect(mexicanChocolateV3.parentVersionLabel).toBe(mexicanChocolateV2.versionLabel);
    expect(mexicanChocolateV4.parentVersionId).toBe(mexicanChocolateV3.id);
    expect(mexicanChocolateV4.parentVersionLabel).toBe(mexicanChocolateV3.versionLabel);
  });

  it('the group holds exactly v1, v2, v3, v4 in order with strictly ascending createdAt', () => {
    const mexicanChocolateGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'mexican-chocolate');
    const ids = mexicanChocolateGroup.versions.map((v) => v.id);
    expect(ids).toEqual(['mexican-chocolate-v1', 'mexican-chocolate-v2', 'mexican-chocolate-v3', 'mexican-chocolate-v4']);
    const createdAts = mexicanChocolateGroup.versions.map((v) => v.createdAt);
    for (let i = 1; i < createdAts.length; i++) {
      expect(createdAts[i] > createdAts[i - 1]).toBe(true);
    }
  });

  it('railEntries names the four versions in order, with v2 not yet churned', () => {
    const mexicanChocolateGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'mexican-chocolate');
    const entries = railEntries(mexicanChocolateGroup.versions, mexicanChocolateGroup.batches, {
      currentVersionId: mexicanChocolateV4.id,
    });
    expect(entries.map((e) => e.name)).toEqual(['Version 1 · v1', 'Version 2 · v2', 'Version 3 · v3', 'Version 4 · v4']);
    const v2Entry = entries.find((e) => e.id === mexicanChocolateV2.id);
    expect(v2Entry.churned).toBe(false);
    expect(v2Entry.stateWords).toBe('not yet churned');
  });
});

describe('Mexican Chocolate v1/v2/v3 batches (D-02, D-06)', () => {
  it("v1s batch, if exported, has churnDate 2025-12-13", () => {
    const { batches } = flatten(transcribedRecipeGroups);
    const v1Batch = batches.find((b) => b.versionId === mexicanChocolateV1.id);
    if (v1Batch) expect(v1Batch.churn.churnDate).toBe('2025-12-13');
  });

  it('no v3 batch carries a tasting (its Observations are v1s words, D-02)', () => {
    const { batches } = flatten(transcribedRecipeGroups);
    const v3Batches = batches.filter((b) => b.versionId === mexicanChocolateV3.id);
    for (const batch of v3Batches) {
      expect(batch.tasting).toBeNull();
    }
  });

  it('no batch has versionId mexican-chocolate-v2 (v2 has no batch, so no tasting)', () => {
    const { batches } = flatten(transcribedRecipeGroups);
    const v2Batches = batches.filter((b) => b.versionId === mexicanChocolateV2.id);
    expect(v2Batches).toHaveLength(0);
  });

  it('a non-null citedBatchId always cites a batch belonging to the citing versions parent', () => {
    const { versions, batches } = flatten(transcribedRecipeGroups);
    const versionsById = new Map(versions.map((v) => [v.id, v]));
    for (const version of versions) {
      if (version.citedBatchId === null) continue;
      const citedBatch = batches.find((b) => b.id === version.citedBatchId);
      expect(citedBatch).toBeDefined();
      expect(citedBatch.versionId).toBe(version.parentVersionId);
    }
  });

  it('every exported batchs snapshot rows deep-equal its own versions rows, and null measured fields stay null', () => {
    const { versions, batches } = flatten(transcribedRecipeGroups);
    const versionsById = new Map(versions.map((v) => [v.id, v]));
    for (const batch of batches) {
      const version = versionsById.get(batch.versionId);
      expect(batch.snapshot.rows).toEqual(version.rows);
      for (const field of ['timeToDrawTempMinutes', 'outOfMachineTempC', 'churnDurationMinutes']) {
        if (batch.churn[field] === null) {
          expect(batch.churn[field]).toBeNull();
        }
      }
    }
  });
});

describe('Pineapple v1 and Coconut v1 -> v2 (D-05, D-06)', () => {
  it('pineappleV1 has no parent and exactly one batch with a tasting', () => {
    expect(pineappleV1.parentVersionId).toBeNull();
    const { batches } = flatten(transcribedRecipeGroups);
    const pineappleBatches = batches.filter((b) => b.versionId === pineappleV1.id);
    expect(pineappleBatches).toHaveLength(1);
    expect(pineappleBatches[0].tasting).not.toBeNull();
  });

  it('coconutV2s parent is coconutV1', () => {
    expect(coconutV2.parentVersionId).toBe(coconutV1.id);
  });

  it("coconutV2's batch has churnDurationMinutes 35 and outOfMachineTempC -8, and no tasting", () => {
    const { batches } = flatten(transcribedRecipeGroups);
    const v2Batch = batches.find((b) => b.versionId === coconutV2.id);
    expect(v2Batch.churn.churnDurationMinutes).toBe(35);
    expect(v2Batch.churn.outOfMachineTempC).toBe(-8);
    expect(v2Batch.tasting).toBeNull();
  });
});

describe('States coverage across transcribed recipes and batches (D-05)', () => {
  it('covers not-yet-churned, awaiting-tasting and tasted at least once each, per version', () => {
    // standingFor is recipe-scoped in the app (Home reads one standing per
    // recipe, from its newest batch) — D-05's coverage claim is per
    // VERSION (decisions_recorded 2: "Mexican Chocolate v3 if a batch is
    // recorded for it"), so this reads standingFor over each version's own
    // batches, not each recipe's.
    const { versions, batches } = flatten(transcribedRecipeGroups);
    const standings = versions.map((version) =>
      standingFor(batches.filter((b) => b.versionId === version.id)),
    );
    expect(standings).toContain(NOT_YET_CHURNED);
    expect(standings).toContain(AWAITING_TASTING);
    expect(standings).toContain(TASTED);
  });
});
