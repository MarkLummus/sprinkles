// Mexican Chocolate — v1, v3 and v4, transcribed from Mark's binder photos
// and Ice Ed exports (D-01, D-02). v1 comes from IMG_2453.HEIC and
// ~/Desktop/Ice Cream/Mexican Chocolate v1.ier; v3 from IMG_2454.HEIC; v4
// from ~/Downloads/recipe-Mexican Chocolate v4.json. Every judgement call is
// flagged in 03.5-SEED-REVIEW.md, which this file's own comments point at
// rather than repeat. Nothing here is wired into store/seed.js (D-07).
import { library } from './library.js';
import { createBatch } from '../domain/batch.js';

// This transcription's own bookkeeping number, matching olive-oil.js's
// VERSION_SCHEMA_VERSION (5) plus the recipes-store split it already
// reflects — these are new versions authored after that split, so they
// start at the same number olive-oil.js's version record carries.
export const MEXICAN_CHOCOLATE_SCHEMA_VERSION = 5;

// Deep-copy the ingredient record onto the row so a stored version is
// self-contained — matching olive-oil.js's own embed() exactly.
function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

// D-11: reached only through the repository seam's recipes methods. Name is
// the Ice Ed recipe name without its version suffix (D-01: the version
// carries its own name via versionLabel); no source sentence describes the
// recipe itself, so description stays '' (03.5-SEED-REVIEW.md "Mexican
// Chocolate v4", judgement call 1).
export const mexicanChocolateRecipe = {
  id: 'mexican-chocolate',
  name: 'Mexican Chocolate',
  description: '',
};

// Shared kitchen equipment (scale, machine) — copied from oliveOilVersion's
// own equipment block per this plan's decisions_recorded 3: Mexican
// Chocolate's own sources name no scale or machine, and domain/advisories.js
// dereferences version.equipment unconditionally, so an absent value would
// throw rather than read as "no advisory applies." The kitchen is shared
// across every recipe Mark churns; this is not per-recipe data
// (03.5-SEED-REVIEW.md judgement call 2).
const KITCHEN_EQUIPMENT = {
  scale: 'Kitchen scale',
  scaleResolutionG: 1,
  precisionScaleResolutionG: 0.01,
  batchesAhead: 4,
  machine: 'Whynter',
  minFillG: 700,
};

export const mexicanChocolateV4 = {
  schemaVersion: MEXICAN_CHOCOLATE_SCHEMA_VERSION,
  id: 'mexican-chocolate-v4',
  recipeId: 'mexican-chocolate',
  // v4 is the newest version and its parent is v3, not v1 (D-01).
  parentVersionId: 'mexican-chocolate-v3',
  parentVersionLabel: 'v3',
  reason: null,
  citedBatchId: null,
  // data.SavedAt from the Ice Ed export — the JSON's own save timestamp,
  // read as createdAt since no other date is authored (judgement call 3).
  createdAt: '2026-08-16T02:37:53.891Z',
  versionLabel: 'v4',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mexican Chocolate',
  sheetDescription: '',
  // 12 rows, in the Ice Ed export's own Ingredients order. Near-matches
  // (Cream heavy, DSMP, Sucrose, Dextrose, Allulose, Salt) map to the
  // existing library entries rather than becoming new ones — none of them
  // is edited (T-03.5-11) — per-ingredient reasoning in
  // 03.5-SEED-REVIEW.md's ingredient mapping table.
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 563 }], removed: false }) },
    { id: 'row-02', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 85.6 }], removed: false }) },
    { id: 'row-03', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 43.7 }], removed: false }) },
    { id: 'row-04', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 33.4 }], removed: false }) },
    { id: 'row-05', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 41 }], removed: false }) },
    { id: 'row-06', ...embed('Allulose', library.allulose, { portions: [{ step: 1, grams: 85.3 }], removed: false }) },
    { id: 'row-07', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 5.32 }], removed: false }) },
    { id: 'row-08', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 1.07 }], removed: false }) },
    { id: 'row-09', ...embed('Stabilizer Mix 4421', library.stabilizerMix4421, { portions: [{ step: 1, grams: 2.33 }], removed: false }) },
    { id: 'row-10', ...embed('Cocoa Powder', library.cocoaPowder, { portions: [{ step: 1, grams: 40.8 }], removed: false }) },
    { id: 'row-11', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 7.45 }], removed: false }) },
    { id: 'row-12', ...embed('Cinnamon', library.cinnamon, { portions: [{ step: 1, grams: 2.77 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // pasteuriseC/holdMinutes read directly from the Notes text's own process
  // line ("Sous Vide for 60 minutes @ 75C") — this IS Mexican Chocolate's
  // own recipe data, unlike equipment above.
  process: { pasteuriseC: 75, holdMinutes: 60 },
  // D-08: the export's Type/ServingTemperature/Hardness/Overrun each has a
  // home here (decisions_recorded 3).
  iceEd: { style: 'Gelato', servingTemperatureC: -17, hardness: 0.75, overrunPercent: 0.2017 },
  declaredAxes: [],
  declaredFlaw: null,
  // The Notes field mixes a process line with observations and next-version
  // deltas (decisions_recorded, "Specific Ideas"). Only the process line has
  // a home on this version — the "Observations:"/"To fix" text is v1's own
  // words, repeated a second time in v4's own export (judgement call 4,
  // flagged in the review); it is NOT this version's own result and goes
  // only to the sidecar. All 12 rows allocate to this one base step, since
  // the source names one base (decisions_recorded 7 / plan action text).
  method: [
    {
      n: 1,
      leadIn: 'Cayenne and sous vide',
      instruction: 'Add a pinch of cayenne pepper. Sous vide for 60 minutes at 75 °C.',
      targets: [
        { label: 'temp', value: '75 °C' },
        { label: 'hold', value: '60 min' },
      ],
      removed: false,
      uses: ['row-01', 'row-02', 'row-03', 'row-04', 'row-05', 'row-06', 'row-07', 'row-08', 'row-09', 'row-10', 'row-11', 'row-12'],
    },
    {
      n: 2,
      leadIn: 'Chill and churn',
      instruction: 'Chill the base overnight, then churn.',
      targets: [],
      aside: 'Very thick by morning. Takes 40+ minutes to churn.',
      removed: false,
      uses: [],
    },
  ],
  // No source names anything for "before you start" — nothing authored.
  authored: { beforeYouStart: [] },
};

// v1 — IMG_2453.HEIC (binder photo) + ~/Desktop/Ice Cream/Mexican Chocolate
// v1.ier (the same 11 rows, matching the printed table). The version keeps
// the TYPED plan (45 min @ 75 °C); the printout's ink overwrite (60 min @
// 176 °F = 80 °C) is recorded as the batch's own step change, not the
// version's plan (03.5-SEED-REVIEW.md judgement call 8).
export const MEXICAN_CHOCOLATE_V1_ID = 'mexican-chocolate-v1';

export const mexicanChocolateV1 = {
  schemaVersion: MEXICAN_CHOCOLATE_SCHEMA_VERSION,
  id: MEXICAN_CHOCOLATE_V1_ID,
  recipeId: 'mexican-chocolate',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  // Printed 12/12/25 11:20 PM — no timezone given, treated as UTC (flagged).
  createdAt: '2025-12-12T23:20:00.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mexican Chocolate',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cocoa Powder', library.cocoaPowder, { portions: [{ step: 1, grams: 30 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 50 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 86 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 5 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 39 }], removed: false }) },
    { id: 'row-07', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 1 }], removed: false }) },
    { id: 'row-08', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 67 }], removed: false }) },
    { id: 'row-09', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 7 }], removed: false }) },
    { id: 'row-10', ...embed('Stabilizer Mix 4421', library.stabilizerMix4421, { portions: [{ step: 1, grams: 5 }], removed: false }) },
    { id: 'row-11', ...embed('Cinnamon', library.cinnamon, { portions: [{ step: 1, grams: 2.6 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // The .ier's own typed plan — 45 min, 75 °C. The ink overwrite (60 min,
  // 176 °F) is the batch's, not the plan's (judgement call 8).
  process: { pasteuriseC: 75, holdMinutes: 45 },
  iceEd: { style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.2993 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [
    {
      n: 1,
      leadIn: 'Cayenne and sous vide',
      instruction: 'Add a pinch of cayenne pepper. Sous vide for 45 minutes at 75 °C.',
      targets: [
        { label: 'temp', value: '75 °C' },
        { label: 'hold', value: '45 min' },
      ],
      removed: false,
      uses: ['row-01', 'row-02', 'row-03', 'row-04', 'row-05', 'row-06', 'row-07', 'row-08', 'row-09', 'row-10', 'row-11'],
    },
  ],
  authored: { beforeYouStart: [] },
};

// v1's batch — the printout's ink: "Double Recipe" (batch mass twice the
// printed table, recorded here as each row's as-made value at 2x plan —
// judgement call 9), the handwritten date, the sous-vide overwrite as a
// step change, the churn/outcome text verbatim, and three interpreted
// battery marks (judgement call 10). No draw temperature or churn duration
// is recorded on the page — "40+ minutes to Churn" is inexact and is kept
// as prose, not coerced into a number.
export const MEXICAN_CHOCOLATE_V1_BATCH_ID = 'mexican-chocolate-v1-batch-01';

const mexicanChocolateV1ChurnFields = {
  churnDate: '2025-12-13',
  asMade: {
    'row-01': [1000],
    'row-02': [60],
    'row-03': [100],
    'row-04': [172],
    'row-05': [10],
    'row-06': [78],
    'row-07': [2],
    'row-08': [134],
    'row-09': [14],
    'row-10': [10],
    'row-11': [5.2],
  },
  stepChanges: {
    '1': {
      struck: false,
      line: 'Written over in ink: 176 °F (80 °C) for 60 minutes, not the printed 75 °C / 45 min.',
    },
  },
  timeToDrawTempMinutes: null,
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  atTheMachine: 'Chill Base Overnight. Very Thick in morning. 40+ minutes to Churn.',
  ingredientNotes: 'Double Recipe — batch mass twice the printed table; every as-made value above is the plan value x2.',
  nextTimeNote: 'To fix: lower Stabilizer to 2.5g/Kg / increase fat to 8%, 9-11% optimal. / Dextrose 86g → 55g / Allulose +30g',
};

const mexicanChocolateV1TastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  tastingTempC: null,
  // Interpreted mappings (judgement call 10): "Sweetness Good" -> sweetness
  // right (3); "Hard straight from Freezer" -> hardness high (5); "But
  // scoopable" -> scoopability right (3, neither crumbly nor gummy).
  marks: { sweetness: 3, hardness: 5, scoopability: 3 },
  note: 'Sweetness Good\nHard straight from Freezer\nBut scoopable',
  defects: null,
  bitterDeclared: null,
  meltTestG: null,
  meltStyle: null,
};

export const mexicanChocolateV1Batch = createBatch(
  mexicanChocolateV1,
  mexicanChocolateV1ChurnFields,
  mexicanChocolateV1TastingFields,
  { id: MEXICAN_CHOCOLATE_V1_BATCH_ID, now: '2025-12-13T00:00:00.000Z' },
);

// v3 — IMG_2454.HEIC (binder photo), zero handwriting. 12 rows including
// allulose, matching the v1 "To fix" list's direction (not its exact
// numbers). Every binder page was churned (audit correction 1), so a batch
// is recorded, but the page supports almost no measured churn fields and
// no churn date — none are guessed. The typed "Observations" block on this
// page is v1's own text, retyped: excluded from this version and this
// batch entirely (D-02), kept only in the sidecar, flagged.
export const MEXICAN_CHOCOLATE_V3_ID = 'mexican-chocolate-v3';

export const mexicanChocolateV3 = {
  schemaVersion: MEXICAN_CHOCOLATE_SCHEMA_VERSION,
  id: MEXICAN_CHOCOLATE_V3_ID,
  recipeId: 'mexican-chocolate',
  parentVersionId: MEXICAN_CHOCOLATE_V1_ID,
  parentVersionLabel: 'v1',
  // The v1 to-fix list is the closest source for "why this version" even
  // though the executed numbers differ slightly (dextrose 45 g not 55 g;
  // allulose 36.8 g not +30 g) — judgement call 11.
  reason: 'Lower stabilizer to 2.5 g/kg; increase fat to 8% minimum, 9–11% optimal; dextrose 86 g → 55 g; allulose +30 g.',
  citedBatchId: MEXICAN_CHOCOLATE_V1_BATCH_ID,
  // Printed 1/13/26 7:06 PM — no timezone given, treated as UTC (flagged).
  createdAt: '2026-01-13T19:06:00.000Z',
  versionLabel: 'v3',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mexican Chocolate',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cocoa Powder', library.cocoaPowder, { portions: [{ step: 1, grams: 16.1 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 46.2 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 45 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 4.48 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 34.6 }], removed: false }) },
    { id: 'row-07', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 0.9 }], removed: false }) },
    { id: 'row-08', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 77.4 }], removed: false }) },
    { id: 'row-09', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 6.28 }], removed: false }) },
    { id: 'row-10', ...embed('Stabilizer Mix 4421', library.stabilizerMix4421, { portions: [{ step: 1, grams: 1.96 }], removed: false }) },
    { id: 'row-11', ...embed('Cinnamon', library.cinnamon, { portions: [{ step: 1, grams: 2.33 }], removed: false }) },
    { id: 'row-12', ...embed('Allulose', library.allulose, { portions: [{ step: 1, grams: 36.8 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: { pasteuriseC: 75, holdMinutes: 60 },
  iceEd: { style: 'Gelato', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.2 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [
    {
      n: 1,
      leadIn: 'Cayenne and sous vide',
      instruction: 'Add a pinch of cayenne pepper. Sous vide for 60 minutes at 75 °C.',
      targets: [
        { label: 'temp', value: '75 °C' },
        { label: 'hold', value: '60 min' },
      ],
      removed: false,
      uses: ['row-01', 'row-02', 'row-03', 'row-04', 'row-05', 'row-06', 'row-07', 'row-08', 'row-09', 'row-10', 'row-11', 'row-12'],
    },
  ],
  authored: { beforeYouStart: [] },
};

// v3's batch — recorded because every binder page was churned, but almost
// entirely null: the page carries no draw temperature, duration, or churn
// date beyond the print timestamp, which is not treated as churnDate
// (never guessed). No tasting — the page's "Observations" text is v1's
// words, not v3's own result (D-02).
export const MEXICAN_CHOCOLATE_V3_BATCH_ID = 'mexican-chocolate-v3-batch-01';

const mexicanChocolateV3ChurnFields = {
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

export const mexicanChocolateV3Batch = createBatch(
  mexicanChocolateV3,
  mexicanChocolateV3ChurnFields,
  null,
  { id: MEXICAN_CHOCOLATE_V3_BATCH_ID, now: '2026-01-13T19:06:00.000Z' },
);
