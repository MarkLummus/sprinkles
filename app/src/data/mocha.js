// Mocha — v0, v1, v2 and v3, transcribed from Mark's Ice Ed exports
// (~/Desktop/Ice Cream/Mocha.ier, Mocha v1.ier, Mocha v3.ier) and binder
// photos (Ice Cream Log Pages/IMG_2464.HEIC, IMG_2465.HEIC, IMG_2466.HEIC).
// v2's rows come from the printed page IMG_2465 (Mark 2026-09-25, answer 1
// — the photo wins, the Mexican Chocolate v3 precedent); Mocha v2.ier was
// re-saved 11 minutes before Mocha v3.ier with v3's own values and is not
// a source for v2's rows (recorded in the sidecar). The first version is
// labelled v0 (Mark 2026-09-25, answer 3). Every judgement call is
// flagged in 03.5-SEED-REVIEW.md, which this file's own comments point at
// rather than repeat. Nothing here is wired into store/seed.js (D-07).
// Workbook columns I and J are recorded in the sidecar and not used (no
// page mark) — Mark 2026-09-25, "if not marked, then ignore".
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

export const mochaRecipe = {
  id: 'mocha',
  name: 'Mocha',
  description: '',
};

const MOCHA_SOUS_VIDE_STEP = (uses) => ({
  n: 1,
  leadIn: 'Sous vide',
  instruction: 'Sous vide for 45 minutes at 75 °C.',
  targets: [
    { label: 'temp', value: '75 °C' },
    { label: 'hold', value: '45 min' },
  ],
  removed: false,
  uses,
});

const MOCHA_ROW_IDS = [
  'row-01', 'row-02', 'row-03', 'row-04', 'row-05', 'row-06', 'row-07',
  'row-08', 'row-09', 'row-10', 'row-11', 'row-12', 'row-13', 'row-14',
];

// v0 — Mocha.ier (Recipe.Name is plain "Mocha"; the label v0 is Mark's) +
// IMG_2464.HEIC. First version; no parent.
export const MOCHA_V0_ID = 'mocha-v0';

export const mochaV0 = {
  schemaVersion: 5,
  id: MOCHA_V0_ID,
  recipeId: 'mocha',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  // createdAt: ordering placeholder — Mark to supply the real date: the
  // .ier time (2024-12-23 09:16:42 −05:00, the folder's archive stamp)
  // ties with Mocha v1.ier's to the second, so v0 takes v1's createdAt
  // minus one second; the real date predates August 2024 (Mango 2 on Light
  // Base, printed 8/14/24, already names "Stabilizer mix from Mocha").
  createdAt: '2024-12-23T14:16:41.000Z',
  versionLabel: 'v0',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mocha',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.5%', library.wholeMilk35, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cocoa Powder', library.cocoaPowder, { portions: [{ step: 1, grams: 60 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 42 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 105 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 5 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 33 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 1.5 }], removed: false }) },
    { id: 'row-08', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 0.9 }], removed: false }) },
    { id: 'row-09', ...embed('Locust Bean Gum', library.locustBeanGum, { portions: [{ step: 1, grams: 0.6 }], removed: false }) },
    { id: 'row-10', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.5 }], removed: false }) },
    { id: 'row-11', ...embed('Lambda Carrageenan', library.carrageenan, { portions: [{ step: 1, grams: 0.3 }], removed: false }) },
    { id: 'row-12', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 67 }], removed: false }) },
    { id: 'row-13', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 7 }], removed: false }) },
    { id: 'row-14', ...embed('Coffee Beans', library.coffeeBeans, { portions: [{ step: 1, grams: 30 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // Notes are empty on this file — no process text belongs on v0's plan.
  // The page's ink sous-vide line goes to the batch below.
  process: {},
  iceEd: { style: 'Gelato', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.2993 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

export const MOCHA_V0_BATCH_ID = 'mocha-v0-batch-01';

const mochaV0ChurnFields = {
  churnDate: null,
  // Four ink overwrites on IMG_2464: milk 500 -> 502, guar 0.5 -> 0.2,
  // cream 67 -> 70, coffee 30 -> 15.
  asMade: {
    'row-01': [502],
    'row-10': [0.2],
    'row-12': [70],
    'row-14': [15],
  },
  stepChanges: {},
  timeToDrawTempMinutes: null,
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  atTheMachine: 'Sous vide @ 77°C for 45 minutes',
  // The page's own margin note, no closer field (the Pineapple precedent).
  ingredientNotes: 'Cream has Guar 0.5%',
  nextTimeNote: null,
};

const mochaV0TastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  tastingTempC: null,
  // "Very smooth." -> smoothness 5 (the axis's own high anchor word,
  // flagged); "Not Hard", "Really strong cocoa" and "Base is Potent! …"
  // stay prose. Workbook column I's verdicts are not used — Mark
  // 2026-09-25: "if not marked, then ignore"; a batch carries only what
  // its binder page marks (recorded in the sidecar).
  marks: { smoothness: 5 },
  note:
    'Base is Potent! maybe too much cocoa + coffee\nReally strong cocoa.\nVery smooth.\nNot Hard.',
  defects: null,
  bitterDeclared: null,
  meltTestG: null,
  meltStyle: null,
};

export const mochaV0Batch = createBatch(
  mochaV0,
  mochaV0ChurnFields,
  mochaV0TastingFields,
  { id: MOCHA_V0_BATCH_ID, now: mochaV0.createdAt },
);

// v1 — Mocha v1.ier only; no binder page, no batch. Mark 2026-09-25 (open
// question 10) — all 29 binder photos are catalogued in the binder audit
// (Ice Cream Log Pages/sprinkles-churn-log-binder-audit.md) and none is
// Mocha v1. IMG_2464 is v0's churned batch (ink coffee 15, guar 0.2,
// cream 70, milk 502), so v1 was never churned on its own.
export const MOCHA_V1_ID = 'mocha-v1';

export const mochaV1 = {
  schemaVersion: 5,
  id: MOCHA_V1_ID,
  recipeId: 'mocha',
  parentVersionId: MOCHA_V0_ID,
  parentVersionLabel: 'v0',
  // No source says why coffee went 30 -> 15.
  // reason stays null (judgement call 36): v1 has no page, and its typed
  // "reduce Guar gum to 0.2" does not describe its rows (guar stays 0.5;
  // the v0 -> v1 change is coffee 30 -> 15), so no reason is set.
  reason: null,
  // Mark 2026-09-25 — Mocha v1.ier is the recipe re-saved after v0's
  // churned batch (IMG_2464), so v1 cites that batch.
  citedBatchId: MOCHA_V0_BATCH_ID,
  // createdAt: ordering placeholder — Mark to supply the real date: its
  // .ier time is the archive stamp, used as it stands.
  createdAt: '2024-12-23T14:16:42.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mocha',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.5%', library.wholeMilk35, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cocoa Powder', library.cocoaPowder, { portions: [{ step: 1, grams: 60 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 42 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 105 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 5 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 33 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 1.5 }], removed: false }) },
    { id: 'row-08', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 0.9 }], removed: false }) },
    { id: 'row-09', ...embed('Locust Bean Gum', library.locustBeanGum, { portions: [{ step: 1, grams: 0.6 }], removed: false }) },
    { id: 'row-10', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.5 }], removed: false }) },
    { id: 'row-11', ...embed('Lambda Carrageenan', library.carrageenan, { portions: [{ step: 1, grams: 0.3 }], removed: false }) },
    { id: 'row-12', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 67 }], removed: false }) },
    { id: 'row-13', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 7 }], removed: false }) },
    { id: 'row-14', ...embed('Coffee Beans', library.coffeeBeans, { portions: [{ step: 1, grams: 15 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // Typed Notes: "Sous Vide for 45 minutes @ 75C". "cream has Gellan gum -
  // reduce Guar gum to 0.2" is not transcribed onto the version (its rows
  // keep guar 0.5; it goes to the sidecar).
  process: { pasteuriseC: 75, holdMinutes: 45 },
  iceEd: { style: 'Gelato', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.2993 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [MOCHA_SOUS_VIDE_STEP(MOCHA_ROW_IDS)],
  authored: { beforeYouStart: [] },
};

// v2 — IMG_2465.HEIC, the printed page (Mark 2026-09-25, answer 1: the
// photo wins, the Mexican Chocolate v3 precedent). Mocha v2.ier is not a
// source for these rows: it was re-saved 2024-12-28 07:56 −05:00, 11
// minutes before Mocha v3.ier, holding v3's milk, sucrose and dextrose
// (recorded in the sidecar).
export const MOCHA_V2_ID = 'mocha-v2';

export const mochaV2 = {
  schemaVersion: 5,
  id: MOCHA_V2_ID,
  recipeId: 'mocha',
  parentVersionId: MOCHA_V1_ID,
  parentVersionLabel: 'v1',
  // Typed on IMG_2465 itself, v2's own words, matching v1 -> v2.
  reason: 'reduced Coffee from 15g to 8g, reduced Cocoa from 60g to 30g',
  citedBatchId: null,
  // createdAt: ordering placeholder — Mark to supply the real date:
  // '2024-12-28T12:56:38.000Z' is the .ier's re-save time, not v2's
  // creation; the page types "updated 12/23/2024".
  createdAt: '2024-12-28T12:56:38.000Z',
  versionLabel: 'v2',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mocha',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.5%', library.wholeMilk35, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cocoa Powder', library.cocoaPowder, { portions: [{ step: 1, grams: 30 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 46 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 89 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 5 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 39 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 1.5 }], removed: false }) },
    { id: 'row-08', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 1 }], removed: false }) },
    { id: 'row-09', ...embed('Locust Bean Gum', library.locustBeanGum, { portions: [{ step: 1, grams: 0.6 }], removed: false }) },
    { id: 'row-10', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.5 }], removed: false }) },
    { id: 'row-11', ...embed('Lambda Carrageenan', library.carrageenan, { portions: [{ step: 1, grams: 0.3 }], removed: false }) },
    { id: 'row-12', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 67 }], removed: false }) },
    { id: 'row-13', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 7 }], removed: false }) },
    { id: 'row-14', ...embed('Coffee Beans', library.coffeeBeans, { portions: [{ step: 1, grams: 8 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // Same process and step as v1, from the page's printed "Sous Vide for 45
  // minutes @ 75C".
  process: { pasteuriseC: 75, holdMinutes: 45 },
  // From the page: Gelato, -16 °C, 75%, 30%. overrunPercent kept at 0.2993
  // — the .ier's unrounded Overrun behind the printed "30 %", so Mocha's
  // four versions do not show a spurious overrun change.
  iceEd: { style: 'Gelato', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.2993 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [MOCHA_SOUS_VIDE_STEP(MOCHA_ROW_IDS)],
  authored: { beforeYouStart: [] },
};

export const MOCHA_V2_BATCH_ID = 'mocha-v2-batch-01';

const mochaV2ChurnFields = {
  churnDate: null,
  // row-11 Lambda Carrageenan: printed 0.3 overwritten 0.5 in ink. row-10
  // Guar: printed 0.5 struck through with nothing written beside it —
  // read as not added, an uncertain reading, flagged.
  asMade: {
    'row-10': [0],
    'row-11': [0.5],
  },
  stepChanges: {},
  timeToDrawTempMinutes: null,
  outOfMachineTempC: null,
  churnDurationMinutes: null,
  exitConsistency: null,
  airiness: null,
  atTheMachine: null,
  ingredientNotes:
    'Guar: the printed 0.5 is struck through in ink with nothing written beside it; recorded as 0 g as-made, an uncertain reading (the page\'s typed note says to reduce guar to 0.2).\nLambda Carrageenan: the printed 0.3 is overwritten 0.5 in ink.',
  nextTimeNote: null,
};

// No tasting — the page records no outcome of its own, and workbook
// column J's verdicts are not used (Mark 2026-09-25: "if not marked, then
// ignore"), so v2 reads churned, not yet tasted.
export const mochaV2Batch = createBatch(
  mochaV2,
  mochaV2ChurnFields,
  null,
  { id: MOCHA_V2_BATCH_ID, now: mochaV2.createdAt },
);

// v3 — Mocha v3.ier = IMG_2466.HEIC (no handwriting).
export const MOCHA_V3_ID = 'mocha-v3';

export const mochaV3 = {
  schemaVersion: 5,
  id: MOCHA_V3_ID,
  recipeId: 'mocha',
  parentVersionId: MOCHA_V2_ID,
  parentVersionLabel: 'v2',
  // Typed, printed on IMG_2466, v3's own line.
  reason: 'reduced Coffee from 8g to 6g',
  citedBatchId: null,
  // .ier save time (2024-12-28 08:07:34 −05:00, outside the archive
  // cluster, matching the page) — a real value.
  createdAt: '2024-12-28T13:07:34.000Z',
  versionLabel: 'v3',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mocha',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cocoa Powder', library.cocoaPowder, { portions: [{ step: 1, grams: 30 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 50 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 86 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 5 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 39 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 1.5 }], removed: false }) },
    { id: 'row-08', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 1 }], removed: false }) },
    { id: 'row-09', ...embed('Locust Bean Gum', library.locustBeanGum, { portions: [{ step: 1, grams: 0.6 }], removed: false }) },
    { id: 'row-10', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.5 }], removed: false }) },
    { id: 'row-11', ...embed('Lambda Carrageenan', library.carrageenan, { portions: [{ step: 1, grams: 0.3 }], removed: false }) },
    { id: 'row-12', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 67 }], removed: false }) },
    { id: 'row-13', ...embed('Vanilla Extract', library.vanillaExtract, { portions: [{ step: 1, grams: 7 }], removed: false }) },
    { id: 'row-14', ...embed('Coffee Beans', library.coffeeBeans, { portions: [{ step: 1, grams: 6 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: { pasteuriseC: 75, holdMinutes: 45 },
  iceEd: { style: 'Gelato', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.2993 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [MOCHA_SOUS_VIDE_STEP(MOCHA_ROW_IDS)],
  authored: { beforeYouStart: [] },
};

// Recorded because every binder page was churned (audit correction 1) —
// the Mexican Chocolate v3 precedent, exactly.
export const MOCHA_V3_BATCH_ID = 'mocha-v3-batch-01';

const mochaV3ChurnFields = {
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

export const mochaV3Batch = createBatch(
  mochaV3,
  mochaV3ChurnFields,
  null,
  { id: MOCHA_V3_BATCH_ID, now: mochaV3.createdAt },
);
