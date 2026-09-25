// Pure. No framework, no DOM, no store import. The recipe record's own
// rename rule (03.5-CONTEXT.md D-11, D-12): Rename edits only the recipe
// record — no version, no Why, no fork, and no saved Sheet is touched.

export const RECIPE_NAME_REQUIRED = 'Enter a recipe name.';
export const RECIPE_SAVE_ERROR = 'Couldn’t save the name. Try again.';

/**
 * recipeNameMessage(name) -> RECIPE_NAME_REQUIRED when the name is blank
 * or whitespace-only, or null when it is written. The one gate Rename's
 * Save runs before writing anything through the seam.
 */
export function recipeNameMessage(name) {
  return name.trim() === '' ? RECIPE_NAME_REQUIRED : null;
}

/**
 * renamedRecipe(recipe, { name, description }) -> a new recipe record with
 * the name trimmed and the description passed through as typed — never
 * mutates its `recipe` argument. Copies only id, name and description
 * (T-03.5-15): a rename can never smuggle a version, Why, or Sheet field
 * into the recipe store.
 */
export function renamedRecipe(recipe, { name, description }) {
  return { id: recipe.id, name: name.trim(), description };
}
