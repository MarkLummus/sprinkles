// Component test for the recipe list's one-row-per-recipe grouping
// (route-recipe-version.md § 3, 03-03). In the existing style —
// renderToStaticMarkup (react-dom/server) in the node test environment.
// Because the list renders Links it needs a router context: wrapped in a
// MemoryRouter from react-router, already a dependency — no testing
// library added.
import { describe, it, expect, vi } from 'vitest';
// RecipeList.jsx imports repository.js, whose module-level
// `export const repository = createRepository()` opens the real
// IndexedDB at import time (D-06) — a side effect this test never
// exercises, since RecipeRows takes `versions` as a prop and never
// touches the store. Stubbed here, at the one seam this file imports
// through, rather than pulling fake-indexeddb into a component test.
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { RecipeRows } from './RecipeList.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { rowGrams } from '../domain/rows.js';

function makeVersion(overrides = {}) {
  return {
    ...oliveOilVersion,
    id: 'v1',
    recipeId: 'r1',
    recipeName: 'Recipe',
    versionLabel: 'line',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderRows(versions) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <RecipeRows versions={versions} />
    </MemoryRouter>,
  );
}

describe('RecipeRows — one row per recipe, at its most recently created version', () => {
  it('renders two rows for three versions across two recipes', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
      makeVersion({ id: 'c', recipeId: 'r2', versionLabel: 'third', createdAt: '2026-01-15T00:00:00.000Z' }),
    ];
    const markup = renderRows(versions);
    expect(markup.match(/<li>/g)).toHaveLength(2);
  });

  it('renders the row for the version with the greatest createdAt', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const markup = renderRows(versions);
    expect(markup).toContain('second');
    expect(markup).not.toContain('>first<');
  });

  it('renders one row for a single version', () => {
    const markup = renderRows([makeVersion()]);
    expect(markup.match(/<li>/g)).toHaveLength(1);
  });

  it('renders no rows and does not crash for an empty store', () => {
    const markup = renderRows([]);
    expect(markup).not.toContain('<li>');
  });

  it('reports a mass that excludes a removed row', () => {
    const fullMass = oliveOilVersion.rows.reduce((total, row) => total + rowGrams(row), 0);
    const removedRowGrams = rowGrams(oliveOilVersion.rows[0]);
    const versionWithRemoval = makeVersion({
      rows: oliveOilVersion.rows.map((row, index) => (index === 0 ? { ...row, removed: true } : row)),
    });
    const markup = renderRows([versionWithRemoval]);
    const expectedMass = (fullMass - removedRowGrams).toFixed(1);
    expect(markup).toContain(`${expectedMass} g`);
    expect(markup).not.toContain(`${fullMass.toFixed(1)} g`);
  });
});
