// Coconut v1 -> v2 — transcribed from Mark's binder photos
// (Ice Cream Log Pages/IMG_2471.HEIC, IMG_2472.HEIC). v1 churned and
// tasted ("EPIC FAIL"); v2 churned, not yet tasted (D-05). See
// 03.5-SEED-REVIEW.md. Nothing here is wired into store/seed.js (D-07).
import { library } from './library.js';
import { createBatch } from '../domain/batch.js';
import { KITCHEN_EQUIPMENT } from './mexican-chocolate.js';

function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

export const coconutRecipe = {
  id: 'coconut',
  name: 'Coconut',
  description: '',
};

export const COCONUT_V1_ID = 'coconut-v1';

export const coconutV1 = {
  schemaVersion: 5,
  id: COCONUT_V1_ID,
  recipeId: 'coconut',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  // The page itself carries no print timestamp — createdAt is the .ier
  // file's own save time (Coconut v1 - FAIL.ier, 2024-12-27 16:21:12
  // −05:00) converted to UTC, Mark 2026-09-25 (03.5-SEED-REVIEW.md
  // judgement call 19).
  createdAt: '2024-12-27T21:21:12.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Coconut',
  sheetDescription: '',
  // 11 rows, printed table order (a 12th blank row on the printout is not
  // a real ingredient).
  rows: [
    { id: 'row-01', ...embed("Coconut Cream, Trader Joe's", library.coconutCream, { portions: [{ step: 1, grams: 400 }], removed: false }) },
    { id: 'row-02', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-03', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 88 }], removed: false }) },
    { id: 'row-04', ...embed('Coconut, Shredded', library.shreddedCoconut, { portions: [{ step: 1, grams: 72 }], removed: false }) },
    { id: 'row-05', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 90 }], removed: false }) },
    { id: 'row-06', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 95 }], removed: false }) },
    { id: 'row-07', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 13 }], removed: false }) },
    { id: 'row-08', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 30 }], removed: false }) },
    { id: 'row-09', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 2 }], removed: false }) },
    { id: 'row-10', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.5 }], removed: false }) },
    { id: 'row-11', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 1 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // "Process: none written" (binder audit) — no plan-level process text on
  // this page.
  process: {},
  iceEd: { style: 'Super-Premium', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.3 },
  declaredAxes: [],
  declaredFlaw: null,
  // No process text on this page — an empty method, not an invented step.
  method: [],
  authored: { beforeYouStart: [] },
};

// v1's batch — "EPIC FAIL." No specific axis mark is set for the
// congealing failure: none of the six fixed axes describes it, and the
// binder audit itself calls this a novel failure mode no checkbox
// anticipates. Kept as prose only (judgement call in
// 03.5-SEED-REVIEW.md).
export const COCONUT_V1_BATCH_ID = 'coconut-v1-batch-01';

const coconutV1ChurnFields = {
  churnDate: null,
  asMade: {},
  stepChanges: {},
  timeToDrawTempMinutes: null,
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  atTheMachine: null,
  ingredientNotes: null,
  nextTimeNote: null,
};

const coconutV1TastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  tastingTempC: null,
  marks: {},
  note: 'EPIC FAIL.\nCoconut fat congealed and froze into hard blobs.\nyeah!! ☺',
  defects: null,
  bitterDeclared: null,
  meltTestG: null,
  meltStyle: null,
};

export const coconutV1Batch = createBatch(
  coconutV1,
  coconutV1ChurnFields,
  coconutV1TastingFields,
  { id: COCONUT_V1_BATCH_ID, now: coconutV1.createdAt },
);

// v2 — the direct fix for v1's failure (coconut cream -> coconut milk),
// churned but not yet tasted (D-05). The page states no reason (left
// null); citedBatchId names v1's batch as the batch this version responds
// to, inferred from the formula change rather than a written citation
// (flagged). No process text belongs on the version's own plan here — the
// page's process/outcome notes are all churn-session content and are
// recorded on the batch below, per this plan's own action text.
export const COCONUT_V2_ID = 'coconut-v2';

export const coconutV2 = {
  schemaVersion: 5,
  id: COCONUT_V2_ID,
  recipeId: 'coconut',
  parentVersionId: COCONUT_V1_ID,
  parentVersionLabel: 'v1',
  reason: null,
  citedBatchId: COCONUT_V1_BATCH_ID,
  // The page itself carries no print timestamp — createdAt is the .ier
  // file's own save time (Coconut v2.ier, 2024-12-28 10:10:46 −05:00)
  // converted to UTC, Mark 2026-09-25 (03.5-SEED-REVIEW.md judgement
  // call 22).
  createdAt: '2024-12-28T15:10:46.000Z',
  versionLabel: 'v2',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Coconut',
  sheetDescription: '',
  // 10 rows, printed table order.
  rows: [
    { id: 'row-01', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 190 }], removed: false }) },
    { id: 'row-02', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 37 }], removed: false }) },
    { id: 'row-03', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 81 }], removed: false }) },
    { id: 'row-04', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 8 }], removed: false }) },
    { id: 'row-05', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 2 }], removed: false }) },
    { id: 'row-06', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.5 }], removed: false }) },
    { id: 'row-07', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 1 }], removed: false }) },
    { id: 'row-08', ...embed("Coconut Milk, Trader Joe's", library.coconutMilk, { portions: [{ step: 1, grams: 200 }], removed: false }) },
    { id: 'row-09', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 250 }], removed: false }) },
    { id: 'row-10', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 31 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: {},
  iceEd: { style: 'Super-Premium', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.3 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

// v2's batch — churned, not yet tasted. Every process/outcome note on this
// page is churn-session content, not a recipe plan: warming the coconut
// milk, the timed shredded-coconut mix-in, and the machine speed all go
// into atTheMachine as prose (none of the fixed SEGMENT_OPTIONS enums fit
// "Fast/Hard" as a machine-speed setting — flagged). churnDurationMinutes
// and outOfMachineTempC are the two measured fields the page does record
// cleanly.
export const COCONUT_V2_BATCH_ID = 'coconut-v2-batch-01';

const coconutV2ChurnFields = {
  churnDate: null,
  asMade: {},
  stepChanges: {},
  timeToDrawTempMinutes: null,
  outOfMachineTempC: -8,
  churnDurationMinutes: 35,
  exitConsistency: null,
  airiness: null,
  atTheMachine:
    'Churned on Fast/Hard. Warm coconut milk until solids melt; at 30 minutes, added ¼ cup shredded coconut (unsweetened).',
  ingredientNotes: null,
  nextTimeNote: null,
};

export const coconutV2Batch = createBatch(coconutV2, coconutV2ChurnFields, null, {
  id: COCONUT_V2_BATCH_ID,
  now: coconutV2.createdAt,
});
