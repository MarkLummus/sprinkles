// The transcribed-recipe groups Mark reviews at plan 09's D-07 gate.
// transcribedRecipeGroups: [{ recipe, versions, batches }] — one entry per
// recipe. Nothing here is imported by store/seed.js (D-07: not wired in).
import {
  mexicanChocolateRecipe,
  mexicanChocolateV1,
  mexicanChocolateV1Batch,
  mexicanChocolateV3,
  mexicanChocolateV3Batch,
  mexicanChocolateV4,
} from './mexican-chocolate.js';
import { pineappleRecipe, pineappleV1 } from './pineapple.js';
import { coconutRecipe, coconutV1, coconutV2, coconutV2Batch } from './coconut.js';

export const transcribedRecipeGroups = [
  {
    recipe: mexicanChocolateRecipe,
    versions: [mexicanChocolateV1, mexicanChocolateV3, mexicanChocolateV4],
    batches: [mexicanChocolateV1Batch, mexicanChocolateV3Batch],
  },
  { recipe: pineappleRecipe, versions: [pineappleV1], batches: [] },
  { recipe: coconutRecipe, versions: [coconutV1, coconutV2], batches: [coconutV2Batch] },
];
