// Pineapple v1 — transcribed from Mark's binder photo (IMG_2481.HEIC).
// Single version, single batch. See 03.5-SEED-REVIEW.md.
// STUB: task 3's RED phase only. GREEN fills this in.
import { library } from './library.js';

function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

export const pineappleRecipe = {
  id: 'pineapple',
  name: 'Pineapple',
  description: '',
};

export const pineappleV1 = {
  schemaVersion: 5,
  id: 'pineapple-v1',
  recipeId: 'pineapple',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: '2026-02-01T00:00:00.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Pineapple',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 342 }], removed: false }) },
  ],
  equipment: {},
  process: {},
  iceEd: { style: 'Gelato', servingTemperatureC: -14, hardness: 0.75, overrunPercent: 0.1 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [
    { n: 1, leadIn: 'Stub step', instruction: 'Stub instruction.', targets: [], removed: false, uses: ['row-01'] },
  ],
  authored: { beforeYouStart: [] },
};
