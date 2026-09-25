// Underbelly Light Base — v1, v2 (Mark 2026-09-25, answer 4). v1 is the
// comparisons workbook's column G (`~/Desktop/Ice Cream/Ice Cream
// Comparisons.xlsx`), with a batch and a tasting from its four verdicts;
// v2 is `~/Desktop/Ice Cream/Underbelly Light Base.ier`, parent v1, no
// batch. A base in PRODUCT.md's vocabulary, but the recipe record has no
// field for that (D-11, D-08), so it is seeded as an ordinary recipe
// here. No gellan row (decision 3d). Every judgement call is flagged in
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

export const underbellyLightBaseRecipe = {
  id: 'underbelly-light-base',
  name: 'Underbelly Light Base',
  description: '',
};

// v1 — the workbook's column G. Row names are the Ice Ed names for Ice Ed
// ingredients (the workbook's labels "Whole Milk 3.7%", "Cream, Heavy" and
// "SMP" name the same ingredients as Standard Base's 'whole milk, 3.7%',
// 'Cream, heavy' and 'Dried Skimmed Milk Powder' — flagged) and 'Almond
// Extract' as the workbook writes it. No Gellan Gum row (column G's own
// Gellan Gum cell is blank; decision 3d).
export const UNDERBELLY_LIGHT_BASE_V1_ID = 'underbelly-light-base-v1';

export const underbellyLightBaseV1 = {
  schemaVersion: 5,
  id: UNDERBELLY_LIGHT_BASE_V1_ID,
  recipeId: 'underbelly-light-base',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  // createdAt: ordering placeholder — Mark to supply the real date: the
  // workbook column carries no date, so v1 takes v2's createdAt minus one
  // second; its 3.7% milk and 4.5 g lecithin match the workbook's "Mango
  // 2" column (Mango 2 on Light Base, printed 8/14/24), so the real date
  // is probably 2024.
  createdAt: '2025-01-11T14:22:07.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Underbelly Light Base',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('whole milk, 3.7%', library.wholeMilk37, { portions: [{ step: 1, grams: 500 }], removed: false }) },
    { id: 'row-02', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 220 }], removed: false }) },
    { id: 'row-03', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 55 }], removed: false }) },
    { id: 'row-04', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 56 }], removed: false }) },
    { id: 'row-05', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 8 }], removed: false }) },
    { id: 'row-06', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 51 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 4.5 }], removed: false }) },
    { id: 'row-08', ...embed('Almond Extract', library.almondExtract, { portions: [{ step: 1, grams: 5 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  // The workbook's Sous Vide Temp row is blank for this column.
  process: {},
  // olive oil's precedent for a version with no Ice Ed spec — the
  // workbook's Hardness 0.75 and Serving Temperature −18 rows are
  // calculator inputs, sent to the sidecar, not this field.
  iceEd: { style: null, servingTemperatureC: null, hardness: null, overrunPercent: null },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

export const UNDERBELLY_LIGHT_BASE_V1_BATCH_ID = 'underbelly-light-base-v1-batch-01';

const underbellyLightBaseV1ChurnFields = {
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

const underbellyLightBaseV1TastingFields = {
  tastedDate: null,
  temperingMinutes: null,
  tastingTempC: null,
  marks: { sweetness: 3, scoopability: 3 },
  note: 'Comparisons workbook — Sweetness: good · Texture: good · Scoopability: good · Flavor: good',
  defects: null,
  bitterDeclared: null,
  meltTestG: null,
  meltStyle: null,
};

export const underbellyLightBaseV1Batch = createBatch(
  underbellyLightBaseV1,
  underbellyLightBaseV1ChurnFields,
  underbellyLightBaseV1TastingFields,
  { id: UNDERBELLY_LIGHT_BASE_V1_BATCH_ID, now: underbellyLightBaseV1.createdAt },
);

// v2 — Underbelly Light Base.ier, parent v1, no batch. Peppermint on UBLB
// v1.ier (2024-12-26) already uses this gum-and-salt shape, so the formula
// may predate this save (evidence for Mark, not a placeholder).
export const UNDERBELLY_LIGHT_BASE_V2_ID = 'underbelly-light-base-v2';

export const underbellyLightBaseV2 = {
  schemaVersion: 5,
  id: UNDERBELLY_LIGHT_BASE_V2_ID,
  recipeId: 'underbelly-light-base',
  parentVersionId: UNDERBELLY_LIGHT_BASE_V1_ID,
  parentVersionLabel: 'v1',
  reason: null,
  citedBatchId: null,
  // .ier save time (2025-01-11 09:22:08 −05:00, outside the archive
  // cluster) — a real value.
  createdAt: '2025-01-11T14:22:08.000Z',
  versionLabel: 'v2',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Underbelly Light Base',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 480 }], removed: false }) },
    { id: 'row-02', ...embed('Cream, heavy', library.heavyCream, { portions: [{ step: 1, grams: 240 }], removed: false }) },
    { id: 'row-03', ...embed('Dried Skimmed Milk Powder', library.skimMilkPowder, { portions: [{ step: 1, grams: 85 }], removed: false }) },
    { id: 'row-04', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 70 }], removed: false }) },
    { id: 'row-05', ...embed('Dextrose', library.dextrose, { portions: [{ step: 1, grams: 36 }], removed: false }) },
    { id: 'row-06', ...embed('Fructose', library.fructose, { portions: [{ step: 1, grams: 6 }], removed: false }) },
    { id: 'row-07', ...embed('Lecithin', library.lecithin, { portions: [{ step: 1, grams: 2 }], removed: false }) },
    { id: 'row-08', ...embed('Locust Bean Gum', library.locustBeanGum, { portions: [{ step: 1, grams: 0.8 }], removed: false }) },
    { id: 'row-09', ...embed('Guar', library.guarGum, { portions: [{ step: 1, grams: 0.6 }], removed: false }) },
    { id: 'row-10', ...embed('Lambda Carrageenan', library.carrageenan, { portions: [{ step: 1, grams: 0.4 }], removed: false }) },
    { id: 'row-11', ...embed('Salt', library.salt, { portions: [{ step: 1, grams: 0.7 }], removed: false }) },
  ],
  equipment: KITCHEN_EQUIPMENT,
  process: {},
  iceEd: { style: 'Gelato', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.1014 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};
