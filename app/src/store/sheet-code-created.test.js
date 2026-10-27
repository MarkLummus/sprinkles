// A created recipe's Sheet code finds its version, and still finds the same one
// after a Save-over that reorders its steps and rows and renames the recipe
// (MAKE-12, CODE-01, roadmap decision 19): the stored code is searched, never
// recomputed from content. Real IndexedDB through fake-indexeddb, a fresh
// IDBFactory per test; fake-indexeddb/auto comes first because repository.js
// opens its store on import.
import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { describe, it, beforeEach, expect } from 'vitest';
import { createRepository } from './repository.js';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { UNPLACED_STEP } from '../domain/creationSteps.js';
import { findVersionsByCode, codeFromVersionId } from '../domain/sheetCode.js';
import { library } from '../data/library.js';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

const step = (n, overrides = {}) => ({
  n,
  leadIn: `Lead ${n}`,
  instruction: `Do thing ${n}.`,
  uses: [],
  targets: [],
  purpose: '',
  aside: '',
  removed: false,
  ...overrides,
});

function createdRecipe() {
  const rows = [
    rowFromLibraryRecord({ id: 'wholeMilk', entry: library.wholeMilk }, { id: 'row-a', grams: 500, step: 1 }),
    rowFromLibraryRecord({ id: 'heavyCream', entry: library.heavyCream }, { id: 'row-b', grams: 250, step: 2 }),
    rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-c', grams: 100, step: UNPLACED_STEP }),
  ];
  return createRecipe(
    {
      name: 'Plain base',
      versionLabel: 'first try',
      rows,
      method: [step(1, { uses: ['row-a'] }), step(2, { uses: ['row-b'] })],
    },
    { recipeId: 'recipe-plain', versionId: 'version-plain-1', now: '2026-10-26T12:00:00.000Z' },
  );
}

describe('a created recipe’s Sheet code (MAKE-12, CODE-01, roadmap decision 19)', () => {
  it('finds the version it was stored with, by its stored code', async () => {
    const repository = createRepository();
    const { recipe, version } = createdRecipe();
    await repository.createRecipeWithVersion({ recipe, version });

    const found = findVersionsByCode(await repository.listVersions(), version.sheetCode);

    expect(version.sheetCode).toBe(codeFromVersionId('version-plain-1'));
    expect(found.map((stored) => stored.id)).toEqual(['version-plain-1']);
  });

  it('finds the same version, with the same stored code, after a Save-over that reorders steps and rows and renames the recipe', async () => {
    const repository = createRepository();
    const { recipe, version } = createdRecipe();
    await repository.createRecipeWithVersion({ recipe, version });
    const expected = {
      version: await repository.getVersion(version.id),
      recipe: await repository.getRecipe(recipe.id),
    };

    const rewritten = {
      ...version,
      method: [...version.method].reverse(),
      rows: [...version.rows].reverse(),
    };
    const result = await repository.saveFirstVersionOver({
      recipe: { ...recipe, name: 'Renamed base' },
      version: rewritten,
      expected,
    });

    expect(result).toEqual({ saved: true });
    const stored = await repository.getVersion(version.id);
    expect(stored.method.map((entry) => entry.n)).toEqual([2, 1]);
    expect(stored.rows.map((row) => row.id)).toEqual(['row-c', 'row-b', 'row-a']);
    expect((await repository.getRecipe(recipe.id)).name).toBe('Renamed base');

    const found = findVersionsByCode(await repository.listVersions(), version.sheetCode);
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe(version.id);
    expect(found[0].sheetCode).toBe(version.sheetCode);
  });
});
