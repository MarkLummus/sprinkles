// Store-file validation and finite-balance guarantees for every group in
// transcribedRecipeGroups — the D-07 review gate covers only these data
// files; nothing here is wired into store/seed.js, which this file never
// imports.
import { describe, it, expect } from 'vitest';
import { transcribedRecipeGroups } from './seed-recipes.js';
import { mexicanChocolateV1, mexicanChocolateV2, mexicanChocolateV3, mexicanChocolateV4 } from './mexican-chocolate.js';
import { validateStoreFile, STORE_SCHEMA_VERSION } from '../store/transfer.js';
import { computeBalance } from '../domain/composition.js';
import { buildFigures } from '../domain/figures.js';
import { buildAdvisories } from '../domain/advisories.js';
import { pineappleV1 } from './pineapple.js';
import { coconutV1, coconutV2 } from './coconut.js';
import { library } from './library.js';
import { strawberryV1, strawberryV2, strawberryV2_1 } from './strawberry.js';
import { standardBaseV1, standardBaseV2 } from './standard-base.js';
import { underbellyLightBaseV1, underbellyLightBaseV2 } from './underbelly-light-base.js';
import { mochaV0, mochaV1, mochaV2, mochaV3 } from './mocha.js';
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

describe('mexicanChocolateV3 reason (open question 8, Mark 2026-09-25)', () => {
  const grams = (version, name) =>
    version.rows.find((row) => row.ingredientName === name).portions.reduce((sum, p) => sum + p.grams, 0);

  it('describes the step from v2, not v1\'s to-fix list', () => {
    expect(mexicanChocolateV3.reason).not.toMatch(/stabilizer to 2\.5/);
    const named = [
      ['Whole Milk 3.3%', 'Milk'],
      ['Cream, heavy', 'cream'],
      ['Cocoa Powder', 'cocoa'],
      ['Dextrose', 'dextrose'],
      ['Allulose', 'allulose'],
    ];
    named.forEach(([name, word]) => {
      const phrase = `${word} ${grams(mexicanChocolateV2, name)} g → ${grams(mexicanChocolateV3, name)} g`;
      expect(mexicanChocolateV3.reason).toContain(phrase);
    });
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

  it('pineappleV1, coconutV1 and coconutV2 carry their .ier save times as createdAt, and each batch recordedAt moves with it (Mark 2026-09-25)', () => {
    expect(pineappleV1.createdAt).toBe('2025-01-11T14:38:00.000Z');
    expect(coconutV1.createdAt).toBe('2024-12-27T21:21:12.000Z');
    expect(coconutV2.createdAt).toBe('2024-12-28T15:10:46.000Z');
    const { versions, batches } = flatten(transcribedRecipeGroups);
    for (const versionId of [pineappleV1.id, coconutV1.id, coconutV2.id]) {
      const version = versions.find((v) => v.id === versionId);
      for (const batch of batches.filter((b) => b.versionId === versionId)) {
        expect(batch.recordedAt).toBe(version.createdAt);
      }
    }
  });
});

describe('library entries added 2026-09-25 (quick 260925-lpd)', () => {
  it('wholeMilk35, wholeMilk37, coffeeBeans, strawberries and driedStrawberry each carry a full estimated composition', () => {
    const entries = [
      ['wholeMilk35', { fat: 0.035, msnf: 0.087 }],
      ['wholeMilk37', { fat: 0.0366, msnf: 0.0865 }],
      ['coffeeBeans', { other: 1 }],
      ['strawberries', { fat: 0.0022, sugar: 0.049, other: 0.0378, pac: 8.5, pod: 6.1 }],
      ['driedStrawberry', { fat: 0.0022, sugar: 0.441, other: 0.5568, pac: 76.6, pod: 54.8 }],
    ];
    for (const [key, composition] of entries) {
      const entry = library[key];
      expect(entry.composition).toEqual(composition);
      for (const field of Object.keys(composition)) {
        expect(entry.basis[field]).toBe('estimated');
        expect(entry.source[field]).toMatch(/^Ice Ed export \(/);
      }
    }
  });

  it('almondExtract has an empty composition and basis, never zeroed', () => {
    expect(library.almondExtract.composition).toEqual({});
    expect(library.almondExtract.basis).toEqual({});
  });
});

describe('Strawberry V1 -> V2 -> V2.1 (IMG_2455-2457 + .ier + comparisons workbook)', () => {
  function totalGrams(row) {
    return row.portions.reduce((sum, p) => sum + p.grams, 0);
  }

  it('strawberryV1 has 11 rows in .ier order with matching grams', () => {
    const expected = [
      ['Whole Milk 3.5%', 400],
      ['Sucrose', 26],
      ['Dextrose', 112],
      ['Fructose', 14],
      ['Dried Skimmed Milk Powder', 120],
      ['Lecithin', 1],
      ['Locust Bean Gum', 0.3],
      ['Guar', 0.1],
      ['Lambda Carrageenan', 0.2],
      ['Cream, heavy', 208],
      ['Strawberries', 518],
    ];
    expect(strawberryV1.rows).toHaveLength(11);
    strawberryV1.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      expect(totalGrams(row)).toBeCloseTo(expected[i][1], 5);
    });
  });

  it('strawberryV2 has 10 rows in .ier order with matching grams', () => {
    const expected = [
      ['Whole Milk 3.5%', 500],
      ['Cream, heavy', 140],
      ['Sucrose', 40],
      ['Dextrose', 71],
      ['Fructose', 15],
      ['Dried Skimmed Milk Powder', 57],
      ['Lecithin', 2.5],
      ['Vanilla Extract', 0],
      ['Strawberry (dried)', 56],
      ['Strawberries', 100],
    ];
    expect(strawberryV2.rows).toHaveLength(10);
    strawberryV2.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      expect(totalGrams(row)).toBeCloseTo(expected[i][1], 5);
    });
  });

  it('strawberryV2_1 has 11 rows in .ier order with matching grams', () => {
    const expected = [
      ['Whole Milk 3.5%', 449],
      ['Cream, heavy', 100],
      ['Sucrose', 12],
      ['Dextrose', 119],
      ['Fructose', 3],
      ['Dried Skimmed Milk Powder', 50],
      ['Lecithin', 2.5],
      ['Vanilla Extract', 0],
      ['Strawberry (dried)', 28],
      ['Strawberries', 106],
      ['Salt', 1],
    ];
    expect(strawberryV2_1.rows).toHaveLength(11);
    strawberryV2_1.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      expect(totalGrams(row)).toBeCloseTo(expected[i][1], 5);
    });
  });

  it('carries the record fields Mark approved 2026-09-25', () => {
    expect(strawberryV1.id).toBe('strawberry-v1');
    expect(strawberryV2.id).toBe('strawberry-v2');
    expect(strawberryV2_1.id).toBe('strawberry-v2-1');
    expect([strawberryV1.versionLabel, strawberryV2.versionLabel, strawberryV2_1.versionLabel]).toEqual(['V1', 'V2', 'V2.1']);
    expect(strawberryV1.recipeId).toBe('strawberry');
    expect(strawberryV2.recipeId).toBe('strawberry');
    expect(strawberryV2_1.recipeId).toBe('strawberry');
    expect(strawberryV1.parentVersionId).toBeNull();
    expect(strawberryV1.parentVersionLabel).toBeNull();
    expect(strawberryV2.parentVersionId).toBe(strawberryV1.id);
    expect(strawberryV2.parentVersionLabel).toBe('V1');
    expect(strawberryV2_1.parentVersionId).toBe(strawberryV2.id);
    expect(strawberryV2_1.parentVersionLabel).toBe('V2');
    for (const version of [strawberryV1, strawberryV2, strawberryV2_1]) {
      expect(version.reason).toBeNull();
      expect(version.citedBatchId).toBeNull();
    }
    expect(strawberryV1.createdAt).toBe('2024-09-02T11:07:00.000Z');
    expect(strawberryV2.createdAt).toBe('2024-09-14T12:03:59.000Z');
    expect(strawberryV2_1.createdAt).toBe('2024-09-14T12:04:00.000Z');
    expect(strawberryV1.iceEd).toEqual({ style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.1014 });
    expect(strawberryV2.iceEd).toEqual({ style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.1014 });
    expect(strawberryV2_1.iceEd).toEqual({ style: 'Gelato', servingTemperatureC: -17, hardness: 0.7, overrunPercent: 0.1014 });
    expect(strawberryV1.process).toEqual({ pasteuriseC: 77, holdMinutes: 45 });
    expect(strawberryV2.process).toEqual({});
    expect(strawberryV2_1.process).toEqual({});
    expect(strawberryV1.method).toHaveLength(1);
    expect(strawberryV1.method[0].uses).toHaveLength(11);
    expect(strawberryV2.method).toEqual([]);
    expect(strawberryV2_1.method).toEqual([]);
  });

  it('has exactly one batch per version with the approved fields', () => {
    const strawberryGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'strawberry');
    const batchesFor = (versionId) => strawberryGroup.batches.filter((b) => b.versionId === versionId);

    const v1Batches = batchesFor(strawberryV1.id);
    expect(v1Batches).toHaveLength(1);
    expect(v1Batches[0].churn.asMade).toEqual({});
    expect(v1Batches[0].tasting.marks).toEqual({ sweetness: 2, hardness: 5 });
    expect(v1Batches[0].tasting.tastingTempC).toBe(-18);
    expect(v1Batches[0].tasting.note).toContain('Too hard to scoop');
    expect(v1Batches[0].tasting.note.endsWith('Comparisons workbook — Sweetness: ok · Texture: flaky · Scoopability: hard · Flavor: not enough')).toBe(true);

    const v2Batches = batchesFor(strawberryV2.id);
    expect(v2Batches).toHaveLength(1);
    expect(v2Batches[0].churn.asMade).toEqual({});
    expect(v2Batches[0].churn.atTheMachine).toContain("Don't Cook Fruit.");
    expect(v2Batches[0].tasting.marks).toEqual({ sweetness: 3 });
    expect(v2Batches[0].tasting.note).toContain('Good Flavor in Sweet Cream');
    expect(v2Batches[0].tasting.note.endsWith('Comparisons workbook — Sweetness: good · Texture: good · Scoopability: hard · Flavor: strong')).toBe(true);

    const v2_1Batches = batchesFor(strawberryV2_1.id);
    expect(v2_1Batches).toHaveLength(1);
    expect(v2_1Batches[0].churn.asMade).toEqual({ 'row-01': [449] });
    expect(v2_1Batches[0].tasting.marks).toEqual({ hardness: 4, sweetness: 3 });
    expect(v2_1Batches[0].tasting.note).toContain('Not as Soft as Mocha');
    expect(v2_1Batches[0].tasting.note.endsWith('Comparisons workbook — Sweetness: good · Texture: good · Scoopability: medium hard · Flavor: good')).toBe(true);

    for (const batch of strawberryGroup.batches) {
      expect(batch.churn.churnDate).toBeNull();
      const version = [strawberryV1, strawberryV2, strawberryV2_1].find((v) => v.id === batch.versionId);
      expect(batch.recordedAt).toBe(version.createdAt);
    }
  });

  it("the group's rail names are exactly Version 1-3 and every version stands TASTED", () => {
    const strawberryGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'strawberry');
    const entries = railEntries(strawberryGroup.versions, strawberryGroup.batches, {
      currentVersionId: strawberryV2_1.id,
    });
    expect(entries.map((e) => e.name)).toEqual(['Version 1 · V1', 'Version 2 · V2', 'Version 3 · V2.1']);
    for (const version of strawberryGroup.versions) {
      const versionBatches = strawberryGroup.batches.filter((b) => b.versionId === version.id);
      expect(standingFor(versionBatches)).toBe(TASTED);
    }
  });
});

describe('Mocha v0 -> v1 -> v2 -> v3 (IMG_2464-2466 + .ier + comparisons workbook)', () => {
  function totalGrams(row) {
    return row.portions.reduce((sum, p) => sum + p.grams, 0);
  }

  const mochaRowNames = [
    'Whole Milk 3.5%', 'Cocoa Powder', 'Sucrose', 'Dextrose', 'Fructose',
    'Dried Skimmed Milk Powder', 'Lecithin', 'Salt', 'Locust Bean Gum',
    'Guar', 'Lambda Carrageenan', 'Cream, heavy', 'Vanilla Extract', 'Coffee Beans',
  ];

  it('mochaV0 has 14 rows in .ier order with matching grams', () => {
    const expected = [500, 60, 42, 105, 5, 33, 1.5, 0.9, 0.6, 0.5, 0.3, 67, 7, 30];
    expect(mochaV0.rows).toHaveLength(14);
    mochaV0.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(mochaRowNames[i]);
      expect(totalGrams(row)).toBeCloseTo(expected[i], 5);
    });
  });

  it('mochaV1 is the same as v0 except row-14 (Coffee Beans 30 -> 15)', () => {
    expect(mochaV1.rows).toHaveLength(14);
    mochaV1.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(mochaV0.rows[i].ingredientName);
      if (row.id === 'row-14') {
        expect(totalGrams(row)).toBeCloseTo(15, 5);
      } else {
        expect(totalGrams(row)).toBeCloseTo(totalGrams(mochaV0.rows[i]), 5);
      }
    });
  });

  it('mochaV2 has 14 rows from the printed page IMG_2465', () => {
    const expected = [500, 30, 46, 89, 5, 39, 1.5, 1, 0.6, 0.5, 0.3, 67, 7, 8];
    expect(mochaV2.rows).toHaveLength(14);
    mochaV2.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(mochaRowNames[i]);
      expect(totalGrams(row)).toBeCloseTo(expected[i], 5);
    });
  });

  it('mochaV3 has 14 rows with Whole Milk 3.3%', () => {
    const expected = [500, 30, 50, 86, 5, 39, 1.5, 1, 0.6, 0.5, 0.3, 67, 7, 6];
    const names = ['Whole Milk 3.3%', ...mochaRowNames.slice(1)];
    expect(mochaV3.rows).toHaveLength(14);
    mochaV3.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(names[i]);
      expect(totalGrams(row)).toBeCloseTo(expected[i], 5);
    });
  });

  it('carries the record fields Mark approved 2026-09-25', () => {
    expect([mochaV0.id, mochaV1.id, mochaV2.id, mochaV3.id]).toEqual(['mocha-v0', 'mocha-v1', 'mocha-v2', 'mocha-v3']);
    expect([mochaV0.versionLabel, mochaV1.versionLabel, mochaV2.versionLabel, mochaV3.versionLabel]).toEqual(['v0', 'v1', 'v2', 'v3']);
    for (const version of [mochaV0, mochaV1, mochaV2, mochaV3]) {
      expect(version.recipeId).toBe('mocha');
      expect(version.citedBatchId).toBeNull();
    }
    expect(mochaV0.parentVersionId).toBeNull();
    expect(mochaV1.parentVersionId).toBe(mochaV0.id);
    expect(mochaV1.parentVersionLabel).toBe('v0');
    expect(mochaV2.parentVersionId).toBe(mochaV1.id);
    expect(mochaV3.parentVersionId).toBe(mochaV2.id);
    expect(mochaV0.createdAt).toBe('2024-12-23T14:16:41.000Z');
    expect(mochaV1.createdAt).toBe('2024-12-23T14:16:42.000Z');
    expect(mochaV2.createdAt).toBe('2024-12-28T12:56:38.000Z');
    expect(mochaV3.createdAt).toBe('2024-12-28T13:07:34.000Z');
    expect(mochaV0.iceEd).toEqual({ style: 'Gelato', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.2993 });
    expect(mochaV1.iceEd).toEqual({ style: 'Gelato', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.2993 });
    expect(mochaV2.iceEd).toEqual({ style: 'Gelato', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.2993 });
    expect(mochaV3.iceEd).toEqual({ style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.2993 });
    expect(mochaV0.process).toEqual({});
    expect(mochaV1.process).toEqual({ pasteuriseC: 75, holdMinutes: 45 });
    expect(mochaV2.process).toEqual({ pasteuriseC: 75, holdMinutes: 45 });
    expect(mochaV3.process).toEqual({ pasteuriseC: 75, holdMinutes: 45 });
    expect(mochaV0.reason).toBeNull();
    expect(mochaV1.reason).toBeNull();
    expect(mochaV2.reason).toBe('reduced Coffee from 15g to 8g, reduced Cocoa from 60g to 30g');
    expect(mochaV3.reason).toBe('reduced Coffee from 8g to 6g');
  });

  it('has exactly one batch each for v0, v2 and v3, and none for v1', () => {
    const mochaGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'mocha');
    const batchesFor = (versionId) => mochaGroup.batches.filter((b) => b.versionId === versionId);

    const v0Batches = batchesFor(mochaV0.id);
    expect(v0Batches).toHaveLength(1);
    expect(v0Batches[0].churn.asMade).toEqual({ 'row-01': [502], 'row-10': [0.2], 'row-12': [70], 'row-14': [15] });
    expect(v0Batches[0].churn.atTheMachine).toBe('Sous vide @ 77°C for 45 minutes');
    expect(v0Batches[0].churn.ingredientNotes).toBe('Cream has Guar 0.5%');
    expect(v0Batches[0].tasting.marks).toEqual({ smoothness: 5, sweetness: 3, scoopability: 3 });
    expect(v0Batches[0].tasting.note.endsWith('Comparisons workbook — Sweetness: good · Texture: great · Scoopability: great · Flavor: too strong')).toBe(true);

    expect(batchesFor(mochaV1.id)).toHaveLength(0);

    const v2Batches = batchesFor(mochaV2.id);
    expect(v2Batches).toHaveLength(1);
    expect(v2Batches[0].churn.asMade).toEqual({ 'row-10': [0], 'row-11': [0.5] });
    expect(v2Batches[0].tasting.marks).toEqual({ sweetness: 3, scoopability: 3 });
    expect(v2Batches[0].tasting.note).toBe('Comparisons workbook — Sweetness: good · Texture: great · Scoopability: great · Flavor: too much coffee');

    const v3Batches = batchesFor(mochaV3.id);
    expect(v3Batches).toHaveLength(1);
    expect(v3Batches[0].churn.asMade).toEqual({});
    expect(v3Batches[0].tasting).toBeNull();

    for (const batch of mochaGroup.batches) {
      const version = [mochaV0, mochaV1, mochaV2, mochaV3].find((v) => v.id === batch.versionId);
      expect(batch.recordedAt).toBe(version.createdAt);
    }
  });

  it('standings across Mocha versions cover TASTED, NOT_YET_CHURNED, TASTED and AWAITING_TASTING', () => {
    const mochaGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'mocha');
    const standingsInOrder = mochaGroup.versions.map((version) =>
      standingFor(mochaGroup.batches.filter((b) => b.versionId === version.id)),
    );
    expect(standingsInOrder).toEqual([TASTED, NOT_YET_CHURNED, TASTED, AWAITING_TASTING]);
  });
});

describe('Standard Base v1 -> v2 (.ier only)', () => {
  it('standardBaseV1 has 6 rows in .ier order with matching grams', () => {
    const expected = [
      ['whole milk, 3.7%', 264],
      ['Cream, heavy', 140],
      ['Sucrose', 43.1],
      ['Dextrose', 29.6],
      ['Dried Skimmed Milk Powder', 20.5],
      ['Lecithin', 2.42],
    ];
    expect(standardBaseV1.rows).toHaveLength(6);
    standardBaseV1.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      const total = row.portions.reduce((t, p) => t + p.grams, 0);
      expect(total).toBeCloseTo(expected[i][1], 5);
    });
  });

  it('standardBaseV2 has 6 rows in .ier order with matching grams', () => {
    const expected = [
      ['whole milk, 3.7%', 500],
      ['Cream, heavy', 260],
      ['Sucrose', 70],
      ['Dextrose', 65],
      ['Dried Skimmed Milk Powder', 37],
      ['Lecithin', 4.5],
    ];
    expect(standardBaseV2.rows).toHaveLength(6);
    standardBaseV2.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      const total = row.portions.reduce((t, p) => t + p.grams, 0);
      expect(total).toBeCloseTo(expected[i][1], 5);
    });
  });

  it('has no batch and reads Version 1 · v1, Version 2 · v2', () => {
    const standardBaseGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'standard-base');
    expect(standardBaseGroup.batches).toEqual([]);
    expect(standardBaseV2.parentVersionId).toBe(standardBaseV1.id);
    const entries = railEntries(standardBaseGroup.versions, standardBaseGroup.batches, {
      currentVersionId: standardBaseV2.id,
    });
    expect(entries.map((e) => e.name)).toEqual(['Version 1 · v1', 'Version 2 · v2']);
  });
});

describe('Underbelly Light Base v1 (workbook column G) -> v2 (.ier)', () => {
  it('underbellyLightBaseV1 has 8 rows in the workbook row order with matching grams', () => {
    const expected = [
      ['whole milk, 3.7%', 500],
      ['Cream, heavy', 220],
      ['Sucrose', 55],
      ['Dextrose', 56],
      ['Fructose', 8],
      ['Dried Skimmed Milk Powder', 51],
      ['Lecithin', 4.5],
      ['Almond Extract', 5],
    ];
    expect(underbellyLightBaseV1.rows).toHaveLength(8);
    underbellyLightBaseV1.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      const total = row.portions.reduce((t, p) => t + p.grams, 0);
      expect(total).toBeCloseTo(expected[i][1], 5);
    });
    expect(underbellyLightBaseV1.iceEd).toEqual({ style: null, servingTemperatureC: null, hardness: null, overrunPercent: null });
  });

  it('underbellyLightBaseV2 has 11 rows in .ier order with matching grams', () => {
    const expected = [
      ['Whole Milk 3.3%', 480],
      ['Cream, heavy', 240],
      ['Dried Skimmed Milk Powder', 85],
      ['Sucrose', 70],
      ['Dextrose', 36],
      ['Fructose', 6],
      ['Lecithin', 2],
      ['Locust Bean Gum', 0.8],
      ['Guar', 0.6],
      ['Lambda Carrageenan', 0.4],
      ['Salt', 0.7],
    ];
    expect(underbellyLightBaseV2.rows).toHaveLength(11);
    underbellyLightBaseV2.rows.forEach((row, i) => {
      expect(row.ingredientName).toBe(expected[i][0]);
      const total = row.portions.reduce((t, p) => t + p.grams, 0);
      expect(total).toBeCloseTo(expected[i][1], 5);
    });
    expect(underbellyLightBaseV2.parentVersionId).toBe(underbellyLightBaseV1.id);
    expect(underbellyLightBaseV2.parentVersionLabel).toBe('v1');
  });

  it('v1 has exactly one tasted batch from the workbook verdicts; v2 has none', () => {
    const ublbGroup = transcribedRecipeGroups.find((g) => g.recipe.id === 'underbelly-light-base');
    const v1Batches = ublbGroup.batches.filter((b) => b.versionId === underbellyLightBaseV1.id);
    expect(v1Batches).toHaveLength(1);
    expect(v1Batches[0].churn.churnDate).toBeNull();
    expect(v1Batches[0].tasting.marks).toEqual({ sweetness: 3, scoopability: 3 });
    expect(v1Batches[0].tasting.note).toBe('Comparisons workbook — Sweetness: good · Texture: good · Scoopability: good · Flavor: good');
    const v2Batches = ublbGroup.batches.filter((b) => b.versionId === underbellyLightBaseV2.id);
    expect(v2Batches).toHaveLength(0);
    const standings = ublbGroup.versions.map((version) =>
      standingFor(ublbGroup.batches.filter((b) => b.versionId === version.id)),
    );
    expect(standings).toEqual([TASTED, NOT_YET_CHURNED]);
  });
});

describe('transcribedRecipeGroups holds seven groups in order (D-05)', () => {
  it('lists recipe ids in the approved order, each with an empty description', () => {
    expect(transcribedRecipeGroups.map((g) => g.recipe.id)).toEqual([
      'mexican-chocolate',
      'pineapple',
      'coconut',
      'standard-base',
      'underbelly-light-base',
      'strawberry',
      'mocha',
    ]);
    for (const group of transcribedRecipeGroups) {
      expect(group.recipe.description).toBe('');
    }
  });
});

describe('every transcribed group reads as one chain in list order (D-05, D-06)', () => {
  it('every version belongs to its own group, is strictly dated, and chains through its parent; every batch belongs to its group', () => {
    for (const group of transcribedRecipeGroups) {
      for (const version of group.versions) {
        expect(version.recipeId).toBe(group.recipe.id);
      }
      for (let i = 1; i < group.versions.length; i++) {
        expect(group.versions[i].createdAt > group.versions[i - 1].createdAt).toBe(true);
      }
      expect(group.versions[0].parentVersionId).toBeNull();
      for (let i = 1; i < group.versions.length; i++) {
        expect(group.versions[i].parentVersionId).toBe(group.versions[i - 1].id);
        expect(group.versions[i].parentVersionLabel).toBe(group.versions[i - 1].versionLabel);
      }
      const entries = railEntries(group.versions, group.batches, {
        currentVersionId: group.versions[group.versions.length - 1].id,
      });
      expect(entries.map((e) => e.name)).toEqual(
        group.versions.map((v, i) => `Version ${i + 1} · ${v.versionLabel}`),
      );
      const versionIds = new Set(group.versions.map((v) => v.id));
      for (const batch of group.batches) {
        expect(versionIds.has(batch.versionId)).toBe(true);
      }
    }
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
