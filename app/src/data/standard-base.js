// Standard Base — v1, v2, transcribed from Mark's Ice Ed exports
// (~/Desktop/Ice Cream/Standard Base.ier, Standard Base-2.ier). A base in
// PRODUCT.md's vocabulary, but the recipe record has no field for that
// (D-11, D-08), so it is seeded as an ordinary recipe here. Both files
// carry Recipe.Name "Standard Base"; Mark names them v1 and v2 (decision
// 1) — two versions, not a scale. No binder page and no workbook column,
// so no batch. Every judgement call is flagged in 03.5-SEED-REVIEW.md.
// Nothing here is wired into store/seed.js (D-07).
import { library } from './library.js';
import { KITCHEN_EQUIPMENT } from './mexican-chocolate.js';

function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

export const standardBaseRecipe = {
  id: 'standard-base',
  name: 'Standard Base',
  description: '',
};

export const STANDARD_BASE_V1_ID = 'standard-base-v1';

export const standardBaseV1 = {
  schemaVersion: 5,
  id: STANDARD_BASE_V1_ID,
  recipeId: 'standard-base',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  // createdAt: ordering placeholder — Mark to supply the real date: both
  // files' .ier times tie to the same second (2024-12-23 09:16:46 −05:00,
  // the folder's archive stamp), so v1 takes v2's createdAt minus one
  // second.
  createdAt: '2024-12-23T14:16:45.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Standard Base',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('whole milk, 3.7%', library.wholeMilk37, { portions: [{ step: 1, grams: 264 }], removed: false }) },
    { id: 'row-02', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 140 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 43.1 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 29.6 }], removed: false }) },
    { id: 'row-05', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 20.5 }], removed: false }) },
    { id: 'row-06', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 2.42 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // Empty Notes on this file — no process text belongs on this version's plan.
  process: {},
  iceEd: { style: 'Standard', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.1014 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

export const STANDARD_BASE_V2_ID = 'standard-base-v2';

export const standardBaseV2 = {
  schemaVersion: 5,
  id: STANDARD_BASE_V2_ID,
  recipeId: 'standard-base',
  parentVersionId: STANDARD_BASE_V1_ID,
  parentVersionLabel: 'v1',
  reason: null,
  citedBatchId: null,
  // createdAt: ordering placeholder — Mark to supply the real date: the
  // .ier's own save time is the archive stamp (2024-12-23 09:16:46 −05:00).
  createdAt: '2024-12-23T14:16:46.000Z',
  versionLabel: 'v2',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Standard Base',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('whole milk, 3.7%', library.wholeMilk37, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 260 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 70 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 65 }], removed: false }) },
    { id: 'row-05', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 37 }], removed: false }) },
    { id: 'row-06', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 4.5 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: {},
  iceEd: { style: 'Standard', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.1014 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};
