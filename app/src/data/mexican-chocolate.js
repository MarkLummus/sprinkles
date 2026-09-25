// Mexican Chocolate — v1, v3 and v4, transcribed from Mark's binder and Ice
// Ed exports (D-01, D-02). See seed-recipes.test.js and 03.5-SEED-REVIEW.md.
// STUB: task 1's RED phase only. GREEN fills this in.
import { library } from './library.js';

export const MEXICAN_CHOCOLATE_SCHEMA_VERSION = 6;

function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

export const mexicanChocolateRecipe = {
  id: 'mexican-chocolate',
  name: 'Mexican Chocolate',
  description: '',
};

export const mexicanChocolateV4 = {
  schemaVersion: MEXICAN_CHOCOLATE_SCHEMA_VERSION,
  id: 'mexican-chocolate-v4',
  recipeId: 'mexican-chocolate',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: '2026-08-16T02:37:53.891Z',
  versionLabel: 'v4',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Mexican Chocolate',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole milk', library.wholeMilk, { portions: [{ step: 1, grams: 563 }], removed: false }) },
    { id: 'row-02', ...embed('Sucrose', library.sucrose, { portions: [{ step: 1, grams: 33.4 }], removed: false }) },
  ],
  equipment: {},
  process: {},
  iceEd: { style: null, servingTemperatureC: null, hardness: null, overrunPercent: null },
  declaredAxes: [],
  declaredFlaw: null,
  method: [
    {
      n: 1,
      leadIn: 'Stub step',
      instruction: 'Stub instruction.',
      targets: [],
      removed: false,
      uses: ['row-01', 'row-02'],
    },
  ],
  authored: { beforeYouStart: [] },
};
