// The transcribed-recipe groups Mark reviews at plan 09's D-07 gate.
// transcribedRecipeGroups: [{ recipe, versions, batches }] — one entry per
// recipe. Nothing here is imported by store/seed.js (D-07: not wired in).
import {
  mexicanChocolateRecipe,
  mexicanChocolateV1,
  mexicanChocolateV1Batch,
  mexicanChocolateV2,
  mexicanChocolateV3,
  mexicanChocolateV3Batch,
  mexicanChocolateV4,
} from './mexican-chocolate.js';
import { oliveOilRecipe, oliveOilVersion } from './olive-oil.js';
import { augustSecondBatch } from './batch-2026-08-02.js';
import { pineappleRecipe, pineappleV1, pineappleV1Batch } from './pineapple.js';
import { coconutRecipe, coconutV1, coconutV1Batch, coconutV2, coconutV2Batch } from './coconut.js';
import {
  strawberryRecipe,
  strawberryV1,
  strawberryV1Batch,
  strawberryV2,
  strawberryV2Batch,
  strawberryV2_1,
  strawberryV2_1Batch,
} from './strawberry.js';
import { standardBaseRecipe, standardBaseV1, standardBaseV2 } from './standard-base.js';
import {
  underbellyLightBaseRecipe,
  underbellyLightBaseV1,
  underbellyLightBaseV2,
} from './underbelly-light-base.js';
import {
  mochaRecipe,
  mochaV0,
  mochaV0Batch,
  mochaV1,
  mochaV2,
  mochaV2Batch,
  mochaV3,
  mochaV3Batch,
} from './mocha.js';

export const transcribedRecipeGroups = [
  {
    recipe: mexicanChocolateRecipe,
    versions: [mexicanChocolateV1, mexicanChocolateV2, mexicanChocolateV3, mexicanChocolateV4],
    batches: [mexicanChocolateV1Batch, mexicanChocolateV3Batch],
  },
  { recipe: pineappleRecipe, versions: [pineappleV1], batches: [pineappleV1Batch] },
  { recipe: coconutRecipe, versions: [coconutV1, coconutV2], batches: [coconutV1Batch, coconutV2Batch] },
  { recipe: standardBaseRecipe, versions: [standardBaseV1, standardBaseV2], batches: [] },
  {
    recipe: underbellyLightBaseRecipe,
    versions: [underbellyLightBaseV1, underbellyLightBaseV2],
    batches: [],
  },
  {
    recipe: strawberryRecipe,
    versions: [strawberryV1, strawberryV2, strawberryV2_1],
    batches: [strawberryV1Batch, strawberryV2Batch, strawberryV2_1Batch],
  },
  {
    recipe: mochaRecipe,
    versions: [mochaV0, mochaV1, mochaV2, mochaV3],
    batches: [mochaV0Batch, mochaV2Batch, mochaV3Batch],
  },
];

// The full seed order (plan 09, D-07 approved): olive oil leads so the
// store's first-written records stay the working case, then every
// transcribed group in transcribedRecipeGroups's own order. This is the
// only array store/seed.js imports.
export const seedRecipeGroups = [
  { recipe: oliveOilRecipe, versions: [oliveOilVersion], batches: [augustSecondBatch] },
  ...transcribedRecipeGroups,
];
