import { describe, expect, it } from 'vitest';
import { RECIPE_NAME_REQUIRED, RECIPE_NAME_TAKEN, recipeNameMessage, recipeNameTaken, renamedRecipe } from './recipe.js';

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

// Sketch 013 decision 11, D-08c: a name another recipe already has is warned
// of, never refused. The comparison is trimmed and lower-cased, code unit for
// code unit: no accent folding, no Unicode normalisation (Phase 9 D-11).
describe('recipeNameTaken', () => {
  it('words the warning exactly as the board draws it', () => {
    expect(RECIPE_NAME_TAKEN).toBe('Another recipe already has this name. You can still use it.');
  });

  it('matches a name without regard to case or surrounding spaces', () => {
    expect(recipeNameTaken([{ name: 'Pineapple' }], 'pineapple ')).toBe(true);
    expect(recipeNameTaken([{ name: 'Pineapple' }], ' PINEAPPLE')).toBe(true);
  });

  it('does not match a different name, and a blank name matches nothing', () => {
    expect(recipeNameTaken([{ name: 'Pineapple' }], 'Pine apple')).toBe(false);
    expect(recipeNameTaken([{ name: 'Pineapple' }], '')).toBe(false);
    expect(recipeNameTaken([{ name: 'Pineapple' }], '   ')).toBe(false);
    expect(recipeNameTaken([{ name: '' }], '')).toBe(false);
  });

  it('folds no accents', () => {
    expect(recipeNameTaken([{ name: 'Crème' }], 'Creme')).toBe(false);
    expect(recipeNameTaken([{ name: 'Éclair' }], 'éclair')).toBe(true);
  });

  it('compares only string names', () => {
    expect(recipeNameTaken([{ name: 42 }, { name: null }, {}], '42')).toBe(false);
  });

  it('only compares a name like __proto__', () => {
    expect(recipeNameTaken([{ name: 'Pineapple' }], '__proto__')).toBe(false);
    expect(recipeNameTaken([{ name: '__proto__' }], '__PROTO__')).toBe(true);
  });
});
