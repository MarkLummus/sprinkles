// The transcribed-recipe groups Mark reviews at plan 09's D-07 gate.
// transcribedRecipeGroups: [{ recipe, versions, batches }] — one entry per
// recipe. Nothing here is imported by store/seed.js (D-07: not wired in).
import { mexicanChocolateRecipe, mexicanChocolateV1, mexicanChocolateV3, mexicanChocolateV4 } from './mexican-chocolate.js';

export const transcribedRecipeGroups = [
  { recipe: mexicanChocolateRecipe, versions: [mexicanChocolateV1, mexicanChocolateV3, mexicanChocolateV4], batches: [] },
];
