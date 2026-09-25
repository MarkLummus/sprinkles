// Coconut v1 -> v2 — transcribed from Mark's binder photos (IMG_2471.HEIC,
// IMG_2472.HEIC). See 03.5-SEED-REVIEW.md.
// STUB: task 3's RED phase only. GREEN fills this in.
import { library } from './library.js';
import { createBatch } from '../domain/batch.js';

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

export const coconutV1 = {
  schemaVersion: 5,
  id: 'coconut-v1',
  recipeId: 'coconut',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  versionLabel: 'v1',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Coconut',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 500 }], removed: false }) },
  ],
  equipment: {},
  process: {},
  iceEd: { style: 'Super-Premium', servingTemperatureC: -15, hardness: 0.75, overrunPercent: 0.3 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

export const COCONUT_V2_ID = 'coconut-v2';

export const coconutV2 = {
  schemaVersion: 5,
  id: COCONUT_V2_ID,
  recipeId: 'coconut',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: '2026-01-08T00:00:00.000Z',
  versionLabel: 'v2',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',
  sheetTitle: 'Coconut',
  sheetDescription: '',
  rows: [
    { id: 'row-01', ...embed('Whole Milk 3.3%', library.wholeMilk33, { portions: [{ step: 1, grams: 250 }], removed: false }) },
  ],
  equipment: {},
  process: {},
  iceEd: { style: 'Super-Premium', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.3 },
  declaredAxes: [],
  declaredFlaw: null,
  method: [],
  authored: { beforeYouStart: [] },
};

export const coconutV2Batch = createBatch(
  coconutV2,
  {
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
  },
  null,
  { id: 'coconut-v2-batch-01', now: '2026-01-08T00:00:00.000Z' },
);
