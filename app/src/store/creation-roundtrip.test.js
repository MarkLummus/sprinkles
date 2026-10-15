// The proof for Phase 7 success criterion 1: a recipe created from library
// records, by pure domain functions, is a store file the import check accepts
// and computes its six figures. It calls the pure validator only and opens no
// IndexedDB, because transfer.js imports no store module. Node environment.
import { describe, it, expect } from 'vitest';
import { validateStoreFile, STORE_SCHEMA_VERSION } from './transfer.js';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { nextStepKey } from '../domain/stepKeys.js';
import { buildFigures } from '../domain/figures.js';
import { buildAdvisories } from '../domain/advisories.js';
import { library } from '../data/library.js';

const NOW = '2026-10-14T12:00:00.000Z';

function createdRecipe(grams = [500, 250, 100]) {
  const rows = [
    rowFromLibraryRecord({ id: 'wholeMilk', entry: library.wholeMilk }, { id: 'row-a', grams: grams[0] }),
    rowFromLibraryRecord({ id: 'heavyCream', entry: library.heavyCream }, { id: 'row-b', grams: grams[1] }),
    rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-c', grams: grams[2] }),
  ];
  return createRecipe(
    { name: 'Plain base', versionLabel: 'first try', rows },
    { recipeId: 'recipe-plain', versionId: 'version-plain-1', now: NOW },
  );
}

function storeFile({ recipes = [], versions = [], batches = [] }) {
  return {
    app: 'sprinkles',
    schemaVersion: STORE_SCHEMA_VERSION,
    versions,
    batches,
    recipes,
    library: [],
  };
}

describe('a recipe created from library records (criterion 1, MAKE-01)', () => {
  it('its recipe and root version pass the store file import check', () => {
    const { recipe, version } = createdRecipe();
    expect(validateStoreFile(storeFile({ recipes: [recipe], versions: [version] }))).toEqual({
      ok: true,
      errors: [],
    });
    expect(version.recipeId).toBe(recipe.id);
    expect(version.parentVersionId).toBeNull();
  });

  it('its six balance figures compute, in FIGURE_SPECS order', () => {
    const { version } = createdRecipe();
    expect(buildFigures(version).map((figure) => figure.key)).toEqual([
      'pac',
      'pod',
      'fat',
      'msnf',
      'sugar',
      'solids',
    ]);
  });

  it('buildAdvisories reads it without throwing, with no sub-scale or hydration advisory (D-02)', () => {
    const { version } = createdRecipe();
    expect(buildAdvisories(version).map((advisory) => advisory.key)).toEqual(['ultra-pasteurised', 'estimated']);
  });

  it('its first step key is 1, and its rows wait at step 1 (D-08)', () => {
    const { version } = createdRecipe();
    expect(nextStepKey(version.method)).toBe(1);
    for (const row of version.rows) expect(row.portions[0].step).toBe(1);
  });
});
