// Mexican Chocolate — v1, v3 and v4, transcribed from Mark's binder photos
// and Ice Ed exports (D-01, D-02). v1 comes from IMG_2453.HEIC and
// ~/Desktop/Ice Cream/Mexican Chocolate v1.ier; v3 from IMG_2454.HEIC; v4
// from ~/Downloads/recipe-Mexican Chocolate v4.json. Every judgement call is
// flagged in 03.5-SEED-REVIEW.md, which this file's own comments point at
// rather than repeat. Nothing here is wired into store/seed.js (D-07).
import { library } from './library.js';

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
  // Set to v3's id/label once v3 exists (task 2) — v4 is the newest version
  // and its parent is v3, not v1 (D-01). Left null here: v3 does not exist
  // in this task's own scope yet.
  parentVersionId: null,
  parentVersionLabel: null,
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

// STUB: task 2's RED phase only. GREEN fills these in (v1's real 11 rows,
// v3's real 12 rows, correct lineage).
export const mexicanChocolateV1 = {
  schemaVersion: MEXICAN_CHOCOLATE_SCHEMA_VERSION,
  id: 'mexican-chocolate-v1',
  recipeId: 'mexican-chocolate',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: '2025-12-12T23:20:00.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mexican Chocolate',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 500 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: { pasteuriseC: 75, holdMinutes: 45 },
  iceEd: { style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.2993 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [
    { n: 1, leadIn: 'Stub step', instruction: 'Stub instruction.', targets: [], removed: false, uses: ['row-01'] },
  ],
  authored: { beforeYouStart: [] },
};

export const mexicanChocolateV3 = {
  schemaVersion: MEXICAN_CHOCOLATE_SCHEMA_VERSION,
  id: 'mexican-chocolate-v3',
  recipeId: 'mexican-chocolate',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: '2026-01-13T19:06:00.000Z',
  versionLabel: 'v3',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mexican Chocolate',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 500 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: { pasteuriseC: 75, holdMinutes: 60 },
  iceEd: { style: 'Gelato', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.2 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [
    { n: 1, leadIn: 'Stub step', instruction: 'Stub instruction.', targets: [], removed: false, uses: ['row-01'] },
  ],
  authored: { beforeYouStart: [] },
};
