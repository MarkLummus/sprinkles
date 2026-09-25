import { describe, expect, it } from 'vitest';
import { RECIPE_NAME_REQUIRED, recipeNameMessage, renamedRecipe } from './recipe.js';

// Pure, framework-free (D-11, D-12, 03.5-04 Task 1): the recipe record's own
// rename rule and the write it produces — Rename edits only the recipe
// record, never a version, a Why, a fork, or a saved Sheet.
describe('recipeNameMessage', () => {
  it('refuses a blank name with the contract sentence', () => {
    expect(recipeNameMessage('')).toBe(RECIPE_NAME_REQUIRED);
  });

  it('refuses a whitespace-only name with the same sentence', () => {
    expect(recipeNameMessage('   ')).toBe(RECIPE_NAME_REQUIRED);
  });

  it('accepts a written name', () => {
    expect(recipeNameMessage('Olive')).toBeNull();
  });
});

describe('renamedRecipe', () => {
  it('trims the name, passes the description through as typed, and leaves its argument unchanged', () => {
    const recipe = { id: 'r', name: 'a', description: 'b' };
    const next = renamedRecipe(recipe, { name: '  New  ', description: 'd' });
    expect(next).toEqual({ id: 'r', name: 'New', description: 'd' });
    expect(recipe).toEqual({ id: 'r', name: 'a', description: 'b' });
  });
});
