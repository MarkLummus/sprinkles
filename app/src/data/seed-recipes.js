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
  // Batches listed newest first (judgement call 58): neither batch carries
  // a churnDate, so domain/batch.js's sortedBatches ties on that null field
  // and falls back to this array's own order to decide which one
  // standingFor reads as "the newest batch". v2 (the reformulated,
  // not-yet-tasted batch) came after v1 (the tasted "EPIC FAIL"), so it
  // leads here — the truthful order, not just the one Home would show.
  { recipe: coconutRecipe, versions: [coconutV1, coconutV2], batches: [coconutV2Batch, coconutV1Batch] },
  { recipe: standardBaseRecipe, versions: [standardBaseV1, standardBaseV2], batches: [] },
  {
    recipe: underbellyLightBaseRecipe,
    versions: [underbellyLightBaseV1, underbellyLightBaseV2],
    batches: [],
  },
  {
    // Batches newest first (judgement call 58, as coconut above): none of
    // the three carries a churnDate, so the same tie-break applies —
    // V2.1 -> V2 -> V1 is the true churn order.
    recipe: strawberryRecipe,
    versions: [strawberryV1, strawberryV2, strawberryV2_1],
    batches: [strawberryV2_1Batch, strawberryV2Batch, strawberryV1Batch],
  },
  {
    // Batches newest first (judgement call 58, as coconut above): none of
    // the three carries a churnDate, so the same tie-break applies — v3 ->
    // v2 -> v0 is the true churn order (v1 has no batch of its own).
    recipe: mochaRecipe,
    versions: [mochaV0, mochaV1, mochaV2, mochaV3],
    batches: [mochaV3Batch, mochaV2Batch, mochaV0Batch],
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
