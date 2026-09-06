// The churned olive oil version — transcribed verbatim from the printed sheet
// (olive-oil-ice-cream-800g_1.md) via the old-sprinkles slice's olive-oil.js
// (read, not imported). Method and authored notes are added by plan 01-02;
// this shape does not change when they arrive.
import { library } from './library.js';

// Deep-copy the ingredient record onto the row so a stored version is
// self-contained (D-05): a later edit to the shared `library` must never
// move a figure already computed from a version's own rows.
function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

export const oliveOilVersion = {
  schemaVersion: 1,
  id: 'olive-oil-ice-cream-v1',
  recipeId: 'olive-oil-ice-cream',
  parentVersionId: null,
  recipeName: 'Olive Oil Ice Cream',
  versionLabel: '50 g oil · 800 g',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  headnote:
    'Scaled 0.8× from the 1 kg formula. All ratios unchanged — PAC, POD, fat, MSNF and total solids are identical to the full batch. Sized to two 16 oz Ball jars in a circulator bath.',
  rows: [
    { id: 'row-01', ...embed('Whole milk', library.wholeMilk, { grams: 370.4, step: 2, splitStep: 3 }) },
    { id: 'row-02', ...embed('Heavy cream', library.heavyCream, { grams: 252.8, step: 3 }) },
    { id: 'row-03', ...embed('Graza Drizzle', library.oliveOil, { grams: 40, step: 8 }) },
    { id: 'row-04', ...embed('Skim milk powder', library.skimMilkPowder, { grams: 22.4, step: 3 }) },
    { id: 'row-05', ...embed('Sucrose', library.sucrose, { grams: 76, step: 2, splitStep: 3 }) },
    { id: 'row-06', ...embed('Allulose', library.allulose, { grams: 20, step: 6 }) },
    { id: 'row-07', ...embed('Dextrose', library.dextrose, { grams: 12, step: 3 }) },
    { id: 'row-08', ...embed('Fine sea salt', library.salt, { grams: 3.2, step: 3 }) },
    { id: 'row-09', ...embed('Soy lecithin', library.lecithin, { grams: 1.2, step: 8 }) },
    { id: 'row-10', ...embed('Locust bean gum', library.locustBeanGum, { grams: 1.04, step: 2 }) },
    { id: 'row-11', ...embed('Guar gum', library.guarGum, { grams: 0.48, step: 2 }) },
    { id: 'row-12', ...embed('Lambda carrageenan', library.carrageenan, { grams: 0.16, step: 2 }) },
  ],
  // No `sugar` key: the sheet authored no band for sugar solids (D-10).
  targets: {
    pac: [22, 26],
    pod: [12, 16],
    fat: [16, 20],
    msnf: [7.5, 10],
    solids: [38, 42],
  },
  equipment: {
    scale: 'Kitchen scale',
    scaleResolutionG: 1,
    precisionScaleResolutionG: 0.01,
    batchesAhead: 4,
    machine: 'Whynter',
    minFillG: 700,
  },
  process: { pasteuriseC: 69, holdMinutes: 40 },
  // D-08: every Ice Ed export field has a home. The sheet states serve and
  // overrun as ranges (method targets); these scalar slots stay null rather
  // than being filled with an invented midpoint.
  iceEd: { style: null, servingTemperatureC: null, hardness: null, overrunPercent: null },
};
