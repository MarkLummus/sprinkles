// The proof for Phase 7 success criterion 1: a recipe created from library
// records, by pure domain functions, is a store file the import check accepts
// and computes its six figures. It calls the pure validator only and opens no
// IndexedDB, because transfer.js imports no store module. Node environment.
import { describe, it, expect } from 'vitest';
import { validateStoreFile } from './transfer.js';
import { storeFileOf } from './storeFile.fixtures.js';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { nextStepKey } from '../domain/stepKeys.js';
import { buildFigures } from '../domain/figures.js';
import { buildAdvisories } from '../domain/advisories.js';
import { computeBalance } from '../domain/composition.js';
import { createChildVersion } from '../domain/lineage.js';
import { buildDiff } from '../domain/diff.js';
import { createBatch } from '../domain/batch.js';
import { sheetCode } from '../domain/sheetCode.js';
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
  return storeFileOf({ versions, batches, recipes });
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

describe('a recipe created from library records — the rest of the app reads it (D-02, D-03, D-07)', () => {
  it('an all-zero recipe passes the import check, has no balance and no figures, and gets no advisory (D-07)', () => {
    const { recipe, version } = createdRecipe([0, 0, 0]);
    expect(validateStoreFile(storeFile({ recipes: [recipe], versions: [version] }))).toEqual({
      ok: true,
      errors: [],
    });
    expect(computeBalance(version.rows)).toBeNull();
    expect(buildFigures(version)).toEqual([]);
    expect(buildAdvisories(version)).toEqual([]);
  });

  it("a child of the root version has the root's key set, with no own key holding undefined (first review IN-01)", () => {
    const { version } = createdRecipe();
    const child = createChildVersion(
      version,
      {
        versionLabel: 'second try',
        reason: null,
        citedBatchId: null,
        rows: version.rows,
        method: version.method,
        sheetTitle: version.sheetTitle,
        sheetDescription: version.sheetDescription,
        authored: version.authored,
      },
      { id: 'version-plain-2', now: NOW },
    );
    expect(Object.keys(child).sort()).toEqual(Object.keys(version).sort());
    expect(Object.entries(child).filter(([, value]) => value === undefined)).toEqual([]);
  });

  describe.each([
    ['weighted', [500, 250, 100]],
    ['all-zero', [0, 0, 0]],
  ])('with %s amounts', (_label, grams) => {
    it('a child of the root version passes the import check, and buildDiff compares the two (D-02)', () => {
      const { recipe, version } = createdRecipe(grams);
      const child = createChildVersion(
        version,
        {
          versionLabel: 'second try',
          reason: null,
          citedBatchId: null,
          rows: version.rows,
          method: version.method,
          sheetTitle: version.sheetTitle,
          sheetDescription: version.sheetDescription,
          authored: version.authored,
        },
        { id: 'version-plain-2', now: NOW },
      );
      expect(child.parentVersionId).toBe(version.id);
      expect(child.coefficientSetId).toBe('');
      expect(validateStoreFile(storeFile({ recipes: [recipe], versions: [version, child] }))).toEqual({
        ok: true,
        errors: [],
      });
      expect(buildDiff(child, version).targetsChanged).toBe(false);
    });

    it('a batch of the root version snapshots the version and passes the import check (D-03)', () => {
      const { recipe, version } = createdRecipe(grams);
      const batch = createBatch(version, { churnDate: '2026-10-14', asMade: { 'row-a': [500] } }, null, {
        id: 'batch-plain-1',
        now: NOW,
      });
      expect(batch.snapshot.coefficientSetId).toBe('');
      expect(Object.keys(batch.snapshot)).toEqual([
        'coefficientSetId',
        'versionLabel',
        'rows',
        'declaredAxes',
        'declaredFlaws',
      ]);
      expect(batch.snapshot.rows).toEqual(version.rows);

      const before = structuredClone(batch.snapshot.rows);
      version.rows[0].portions[0].grams += 1;
      expect(batch.snapshot.rows).toEqual(before);

      expect(validateStoreFile(storeFile({ recipes: [recipe], versions: [version], batches: [batch] }))).toEqual({
        ok: true,
        errors: [],
      });
    });

    it('its Sheet code computes (D-02)', () => {
      const { version } = createdRecipe(grams);
      expect(sheetCode(version)).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    });
  });
});
