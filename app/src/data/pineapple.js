// Pineapple v1 — transcribed from Mark's binder photo
// (Ice Cream Log Pages/IMG_2481.HEIC). A single version, a single batch,
// churned and tasted (D-05). See 03.5-SEED-REVIEW.md.
// Nothing here is wired into store/seed.js (D-07).
import { embedFromLibrary } from './library-embed.js';
import { createBatch } from '../domain/batch.js';
import { SEED_CATALOG } from './seed-catalog.js';
import { KITCHEN_EQUIPMENT } from './mexican-chocolate.js';

export const pineappleRecipe = {
  id: 'pineapple',
  name: 'Pineapple',
  description: '',
};

export const PINEAPPLE_V1_ID = 'pineapple-v1';

export const pineappleV1 = {
  schemaVersion: 5,
  id: PINEAPPLE_V1_ID,
  recipeId: 'pineapple',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  // The page itself carries no print timestamp — createdAt is the .ier
  // file's own save time (Pineapple v1.ier, 2025-01-11 09:38:00 −05:00)
  // converted to UTC, Mark 2026-09-25 (03.5-SEED-REVIEW.md judgement
  // call 15).
  createdAt: '2025-01-11T14:38:00.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Pineapple',
  sheetDescription: '',
  // 12 rows, printed table order. DSMP keeps the printed 60.6 g plan value
  // — the handwritten "61" is the as-made correction, recorded on the
  // batch below, not the plan.
  rows: [
    { id: 'row-01', ...embedFromLibrary('Whole Milk 3.3%', 'wholeMilk33', { portions: [{ step: 1, grams: 342 }], removed: false }) },
    { id: 'row-02', ...embedFromLibrary('Cream, heavy', 'heavyCream', { portions: [{ step: 1, grams: 171 }], removed: false }) },
    { id: 'row-03', ...embedFromLibrary('Dried Skimmed Milk Powder', 'skimMilkPowder', { portions: [{ step: 1, grams: 60.6 }], removed: false }) },
    { id: 'row-04', ...embedFromLibrary('Sucrose', 'sucrose', { portions: [{ step: 1, grams: 26 }], removed: false }) },
    { id: 'row-05', ...embedFromLibrary('Dextrose', 'dextrose', { portions: [{ step: 1, grams: 89 }], removed: false }) },
    { id: 'row-06', ...embedFromLibrary('Fructose', 'fructose', { portions: [{ step: 1, grams: 0 }], removed: false }) },
    { id: 'row-07', ...embedFromLibrary('Lecithin', 'lecithin', { portions: [{ step: 1, grams: 1.1 }], removed: false }) },
    { id: 'row-08', ...embedFromLibrary('Locust Bean Gum', 'locustBeanGum', { portions: [{ step: 1, grams: 1.1 }], removed: false }) },
    { id: 'row-09', ...embedFromLibrary('Guar', 'guarGum', { portions: [{ step: 1, grams: 0.55 }], removed: false }) },
    { id: 'row-10', ...embedFromLibrary('Lambda Carrageenan', 'carrageenan', { portions: [{ step: 1, grams: 0.28 }], removed: false }) },
    { id: 'row-11', ...embedFromLibrary('Salt', 'salt', { portions: [{ step: 1, grams: 0.5 }], removed: false }) },
    { id: 'row-12', ...embedFromLibrary('Pineapple', 'pineapple', { portions: [{ step: 1, grams: 342 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: {},
  iceEd: { style: 'Gelato', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.1 },
  serveTempC: -14, // target serving temperature in degrees C (D-19), copied from the iceEd block's servingTemperatureC above, which balanced this formulation; a new recipe's comes from its chosen style
  declaredAxes: [],
  declaredFlaws: [],
  // The two process lines on the page ("Cooked Pineapple in SousVide
  // separate from Cream" and the crushed-pineapple mix-in) become this one
  // step's instruction; all 12 rows allocate to it as the base step (the
  // source names one base — decisions_recorded 7).
  method: [
    {
      n: 1,
      leadIn: 'Cook the pineapple, build the base',
      instruction:
        'Cook the pineapple in the sous vide, separate from the cream. Add ¼ cup of the cooked, crushed pineapple as a mix-in — increase next time.',
      targets: [],
      removed: false,
      uses: ['row-01', 'row-02', 'row-03', 'row-04', 'row-05', 'row-06', 'row-07', 'row-08', 'row-09', 'row-10', 'row-11', 'row-12'],
    },
  ],
  authored: { beforeYouStart: [] },
};

// The single batch — churned and tasted (D-05's "churned and tasted"
// state). The handwritten DSMP correction (60.6 -> 61) becomes an as-made
// value; "Filtering Pineapple was too much work" has no clean model home
// and goes to ingredientNotes (flagged); the outcome lines go verbatim to
// the tasting note, with "Less Stabilizer, getting Chewy" also parsed into
// Next time (judgement calls in 03.5-SEED-REVIEW.md).
export const PINEAPPLE_V1_BATCH_ID = 'pineapple-v1-batch-01';

const pineappleV1ChurnFields = {
  churnDate: null,
  asMade: { 'row-03': [61] },
  stepChanges: {},
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  atTheMachine: null,
  ingredientNotes: 'Filtering Pineapple was too much work.',
  nextTimeNote: 'Less Stabilizer, getting Chewy.',
};

const pineappleV1TastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  tastingTempC: null,
  // Only "Good Sweetness" maps to an axis without much stretch (sweetness
  // right, matching Mexican Chocolate v1's own "Sweetness Good" reading).
  // "Good Texture" has no single clean axis match and stays prose-only.
  marks: { sweetness: 3 },
  note: 'Good Texture\nGood Sweetness\nCould have more PA in Sweet Cream.\nLess Stabilizer, getting Chewy.',
  defects: null,
  declaredDefects: null,
  meltTestG: null,
  meltStyle: null,
};

// recordedAt moves with the version's own createdAt (2025-01-11T14:38:00.000Z,
// Mark 2026-09-25) rather than a churn-session timestamp of its own — no
// source records a separate churn date for this batch.
export const pineappleV1Batch = createBatch(
  pineappleV1,
  pineappleV1ChurnFields,
  pineappleV1TastingFields,
  { id: PINEAPPLE_V1_BATCH_ID, now: pineappleV1.createdAt, catalog: SEED_CATALOG },
);
