// Strawberry — V1, V2 and V2.1, transcribed from Mark's binder photos
// (Ice Cream Log Pages/IMG_2455.HEIC, IMG_2456.HEIC, IMG_2457.HEIC), their
// Ice Ed exports (~/Desktop/Ice Cream/Strawberry V1.ier, V2.ier, V2.1.ier)
// and the comparisons workbook (~/Desktop/Ice Cream/Ice Cream
// Comparisons.xlsx, columns E, D, C). Mark's 2026-09-25 decisions 1, 2, 3
// and 5 (quick 260925-lpd); every judgement call is flagged in
// 03.5-SEED-REVIEW.md, which this file's own comments point at rather than
// repeat. Nothing here is wired into store/seed.js (D-07). The workbook's
// columns E, D and C are recorded in the sidecar, their verdicts not used
// (no page mark) — Mark 2026-09-25, "if not marked, then ignore".
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

export const strawberryRecipe = {
  id: 'strawberry',
  name: 'Strawberry',
  description: '',
};

// V1 — IMG_2455.HEIC (printed 9/2/24, 11:07 AM) + Strawberry V1.ier. First
// version; no parent.
export const STRAWBERRY_V1_ID = 'strawberry-v1';

export const strawberryV1 = {
  schemaVersion: 5,
  id: STRAWBERRY_V1_ID,
  recipeId: 'strawberry',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  // Printed 9/2/24 11:07 AM — no timezone given, treated as UTC (decision
  // 5, the Mexican Chocolate v1/v3 precedent).
  createdAt: '2024-09-02T11:07:00.000Z',
  versionLabel: 'V1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Strawberry',
  sheetDescription: '',
  // 11 rows, .ier order = printed table order.
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.5%', library.wholeMilk35, { portions: [{ step: 1, grams: 400 }], removed: false }) },
    { id: 'row-02', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 26 }], removed: false }) },
    { id: 'row-03', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 112 }], removed: false }) },
    { id: 'row-04', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 14 }], removed: false }) },
    { id: 'row-05', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 120 }], removed: false }) },
    { id: 'row-06', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 1 }], removed: false }) },
    { id: 'row-07', ...embed('Locust Bean Gum', library.locustBeanGum, { portions: [{ step: 1, grams: 0.3 }], removed: false }) },
    { id: 'row-08', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.1 }], removed: false }) },
    { id: 'row-09', ...embed('Lambda Carrageenan', library.carrageenan, { portions: [{ step: 1, grams: 0.2 }], removed: false }) },
    { id: 'row-10', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 208 }], removed: false }) },
    { id: 'row-11', ...embed('Strawberries', library.strawberries, { portions: [{ step: 1, grams: 518 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // Typed Notes: "Sous Vide for 45 minutes @ 77C".
  process: { pasteuriseC: 77, holdMinutes: 45 },
  iceEd: { style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.1014 },
  declaredAxes: [],
  declaredFlaw: null,
  // V1's other typed lines (stabilizer-mix reference, gellan note, the two
  // targets) are not transcribed onto the version — they go to the sidecar
  // (Task 3).
  method: [
    {
      n: 1,
      leadIn: 'Sous vide',
      instruction: 'Sous vide for 45 minutes at 77 °C.',
      targets: [
        { label: 'temp', value: '77 °C' },
        { label: 'hold', value: '45 min' },
      ],
      removed: false,
      uses: ['row-01', 'row-02', 'row-03', 'row-04', 'row-05', 'row-06', 'row-07', 'row-08', 'row-09', 'row-10', 'row-11'],
    },
  ],
  authored: { beforeYouStart: [] },
};

export const STRAWBERRY_V1_BATCH_ID = 'strawberry-v1-batch-01';

const strawberryV1ChurnFields = {
  churnDate: null,
  asMade: {},
  stepChanges: {},
  timeToDrawTempMinutes: null,
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  atTheMachine: 'Blend all strawberries after cooking down with All Dry (Except SMP).\nBlend 2 minutes.\nmixin Frozen Strawberries',
  ingredientNotes: null,
  nextTimeNote: null,
};

const strawberryV1TastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  // "Coming out of Fridge/Freezer Temp = -18°C", read as the ice cream's
  // temperature when judged — flagged.
  tastingTempC: -18,
  // "Too hard to scoop" -> hardness 5 (Mexican Chocolate v1's "Hard
  // straight from Freezer" precedent); "Not very sweet. Could be sweeter."
  // -> sweetness 2 (direction stated, degree read as leaning — flagged).
  marks: { sweetness: 2, hardness: 5 },
  note:
    'Not very sweet. Could be sweeter.\nStrawberry flavor is good. Could use more.\nFlaky, not creamy, Dry. (maybe cooked too much water?)\nComing out of Fridge/Freezer Temp = -18°C\nToo hard to scoop',
  defects: null,
  bitterDeclared: null,
  meltTestG: null,
  meltStyle: null,
};

export const strawberryV1Batch = createBatch(
  strawberryV1,
  strawberryV1ChurnFields,
  strawberryV1TastingFields,
  { id: STRAWBERRY_V1_BATCH_ID, now: strawberryV1.createdAt },
);

// V2 — IMG_2456.HEIC (no print timestamp) + Strawberry V2.ier. Parent: V1.
export const STRAWBERRY_V2_ID = 'strawberry-v2';

export const strawberryV2 = {
  schemaVersion: 5,
  id: STRAWBERRY_V2_ID,
  recipeId: 'strawberry',
  parentVersionId: STRAWBERRY_V1_ID,
  parentVersionLabel: 'V1',
  reason: null,
  citedBatchId: null,
  // createdAt: ordering placeholder — Mark to supply the real date: this
  // page has no print timestamp and its .ier time (2024-12-23 09:16
  // −05:00, the folder's archive stamp) falls after V2.1's print, so it
  // takes V2.1's createdAt minus one second (Mark 2026-09-25, answer 2).
  createdAt: '2024-09-14T12:03:59.000Z',
  versionLabel: 'V2',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Strawberry',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.5%', library.wholeMilk35, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 140 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 40 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 71 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 15 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 57 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 2.5 }], removed: false }) },
    { id: 'row-08', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 0 }], removed: false }) },
    { id: 'row-09', ...embed('Strawberry (dried)', library.driedStrawberry, { portions: [{ step: 1, grams: 56 }], removed: false }) },
    { id: 'row-10', ...embed('Strawberries', library.strawberries, { portions: [{ step: 1, grams: 100 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // Empty Notes on this page — the Coconut precedent (empty process, empty
  // method).
  process: {},
  iceEd: { style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.1014 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

export const STRAWBERRY_V2_BATCH_ID = 'strawberry-v2-batch-01';

const strawberryV2ChurnFields = {
  churnDate: null,
  asMade: {},
  stepChanges: {},
  timeToDrawTempMinutes: null,
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  // "Don't Cook Fruit." is read as this batch's own process note
  // (flagged). "Good Flavor in Sweet Cream / Sweet cream is thick" follow
  // "Age Overnight" in the page's same ink block; they observe the base,
  // which Mark 2026-09-25 ruled is not a tasting, so they sit here, in the
  // model's process note, rather than a tasting.
  atTheMachine: "Sous Vide 45min @ 77\nDon't Cook Fruit.\nAge Overnight\nGood Flavor in Sweet Cream\nSweet cream is thick",
  ingredientNotes: null,
  nextTimeNote: null,
};

// No tasting — the page records only the base, and workbook column D's
// verdicts are not used (Mark 2026-09-25), so V2 reads churned, not yet
// tasted.
export const strawberryV2Batch = createBatch(
  strawberryV2,
  strawberryV2ChurnFields,
  null,
  { id: STRAWBERRY_V2_BATCH_ID, now: strawberryV2.createdAt },
);

// V2.1 — IMG_2457.HEIC (printed 9/14/24, 12:04 PM) + Strawberry V2.1.ier.
// Parent: V2.
export const STRAWBERRY_V2_1_ID = 'strawberry-v2-1';

export const strawberryV2_1 = {
  schemaVersion: 5,
  id: STRAWBERRY_V2_1_ID,
  recipeId: 'strawberry',
  parentVersionId: STRAWBERRY_V2_ID,
  parentVersionLabel: 'V2',
  reason: null,
  citedBatchId: null,
  // Printed 9/14/24 12:04 PM — no timezone given, treated as UTC (decision 5).
  createdAt: '2024-09-14T12:04:00.000Z',
  versionLabel: 'V2.1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Strawberry',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.5%', library.wholeMilk35, { portions: [{ step: 1, grams: 449 }], removed: false }) },
    { id: 'row-02', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 100 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 12 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 119 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 3 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 50 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 2.5 }], removed: false }) },
    { id: 'row-08', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 0 }], removed: false }) },
    { id: 'row-09', ...embed('Strawberry (dried)', library.driedStrawberry, { portions: [{ step: 1, grams: 28 }], removed: false }) },
    { id: 'row-10', ...embed('Strawberries', library.strawberries, { portions: [{ step: 1, grams: 106 }], removed: false }) },
    { id: 'row-11', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 1 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: {},
  iceEd: { style: 'Gelato', servingTemperatureC: -17, hardness: 0.7, overrunPercent: 0.1014 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

export const STRAWBERRY_V2_1_BATCH_ID = 'strawberry-v2-1-batch-01';

const strawberryV2_1ChurnFields = {
  churnDate: null,
  // The ink overwrite 447 -> 449; the .ier's plan already holds 449 —
  // flagged.
  asMade: { 'row-01': [449] },
  stepChanges: {},
  timeToDrawTempMinutes: null,
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  atTheMachine: '77°C 45 minutes\n4hr. Aging',
  ingredientNotes: null,
  nextTimeNote: null,
};

const strawberryV2_1TastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  tastingTempC: null,
  // "Medium Hard" -> hardness 4 (Mexican Chocolate v1's "Hard straight from
  // Freezer" -> 5 precedent). Workbook column C's verdicts are not used
  // (Mark 2026-09-25: "if not marked, then ignore").
  marks: { hardness: 4 },
  note: 'Medium Hard,\nDry.\nNot as Hard as Strawberry V2\nNot as Soft as Mocha',
  defects: null,
  bitterDeclared: null,
  meltTestG: null,
  meltStyle: null,
};

export const strawberryV2_1Batch = createBatch(
  strawberryV2_1,
  strawberryV2_1ChurnFields,
  strawberryV2_1TastingFields,
  { id: STRAWBERRY_V2_1_BATCH_ID, now: strawberryV2_1.createdAt },
);
