// Component test for the recipe list's one-row-per-recipe grouping
// (route-recipe-version.md § 3, 03-03; The Sprinkles Jar, route.md,
// 260918-gha). In the existing style — renderToStaticMarkup
// (react-dom/server) in the node test environment. Because the list
// renders Links it needs a router context: wrapped in a MemoryRouter
// from react-router, already a dependency — no testing library added.
import { describe, it, expect, vi } from 'vitest';
// RecipeList.jsx imports repository.js, whose module-level
// `export const repository = createRepository()` opens the real
// IndexedDB at import time (D-06) — a side effect this test never
// exercises, since RecipeRows takes `versions`/`batches` as props and
// never touches the store. Stubbed here, at the one seam this file
// imports through, rather than pulling fake-indexeddb into a component
// test.
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { RecipeRows, HomeLead } from './RecipeList.jsx';
import { recipeHueByRecipeId } from './recipe-colour.js';
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

function makeBatch(overrides = {}) {
  return {
    id: 'b1',
    versionId: 'v1',
    churn: { churnDate: '2026-01-01', atTheMachine: null },
    ...overrides,
  };
}

function renderRows(versions, batches) {
  const props = batches === undefined ? { versions } : { versions, batches };
  return renderToStaticMarkup(
    <MemoryRouter>
      <RecipeRows {...props} />
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

describe('RecipeRows — The Sprinkles Jar identity and tallies (route.md, 260918-gha)', () => {
  it("carries the hue recipeHueByRecipeId deals, the same for a recipe across its own versions", () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const expectedHue = recipeHueByRecipeId(versions).get('r1');
    const markup = renderRows(versions);
    expect(markup).toContain(`var(${expectedHue})`);
  });

  it('gives two recipes two different hue tokens', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'c', recipeId: 'r2', versionLabel: 'third', createdAt: '2026-01-15T00:00:00.000Z' }),
    ];
    const hues = recipeHueByRecipeId(versions);
    const markup = renderRows(versions);
    expect(hues.get('r1')).not.toBe(hues.get('r2'));
    expect(markup).toContain(`var(${hues.get('r1')})`);
    expect(markup).toContain(`var(${hues.get('r2')})`);
  });

  it('draws one version-tally mark per version the recipe has', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
      makeVersion({ id: 'c', recipeId: 'r1', versionLabel: 'third', createdAt: '2026-03-01T00:00:00.000Z' }),
    ];
    const markup = renderRows(versions);
    const versionMarks = markup.match(/home__tally-mark--version/g) ?? [];
    expect(versionMarks).toHaveLength(3);
  });

  it("draws one batch-tally mark per batch across the recipe's own versions, and none of another recipe's", () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
      makeVersion({ id: 'c', recipeId: 'r2', versionLabel: 'third', createdAt: '2026-01-15T00:00:00.000Z' }),
    ];
    const batches = [
      makeBatch({ id: 'ba', versionId: 'a', churn: { churnDate: '2026-01-05', atTheMachine: null } }),
      makeBatch({ id: 'bb', versionId: 'b', churn: { churnDate: '2026-02-05', atTheMachine: null } }),
      makeBatch({ id: 'bc', versionId: 'c', churn: { churnDate: '2026-01-20', atTheMachine: null } }),
      makeBatch({ id: 'bd', versionId: 'c', churn: { churnDate: '2026-01-25', atTheMachine: null } }),
      makeBatch({ id: 'be', versionId: 'c', churn: { churnDate: '2026-01-30', atTheMachine: null } }),
    ];
    const markup = renderRows(versions, batches);
    expect(markup).toContain('2 batches');
    expect(markup).toContain('3 batches');
    const batchMarks = markup.match(/home__tally-mark--batch/g) ?? [];
    expect(batchMarks).toHaveLength(5);
  });

  it('reads "not yet made" and draws no batch mark for a recipe with no batch', () => {
    const markup = renderRows([makeVersion()]);
    expect(markup).toContain('not yet made');
    expect(markup).not.toMatch(/home__tally-mark--batch/);
  });

  it('renders without a batches prop (the default) and does not throw', () => {
    expect(() => renderRows([makeVersion()])).not.toThrow();
  });
});

// HomeLead (03.4-04 Task 1, D-06, D-12, D-18, D-20): the recipe the maker
// touched last, as a larger block above the list — one presentational
// component over one activeWork() entry, so it is testable without
// driving RecipeList's own fetch effect.
function makeEntry(overrides = {}) {
  return {
    id: 'r1',
    name: 'Olive oil',
    latestVersion: makeVersion({ id: 'v1', recipeId: 'r1' }),
    versions: [makeVersion({ id: 'v1', recipeId: 'r1' })],
    batches: [],
    lastEventAt: '2026-01-01T00:00:00.000Z',
    standing: 'not-yet-churned',
    ...overrides,
  };
}

function renderLead(entry) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <HomeLead entry={entry} />
    </MemoryRouter>,
  );
}

describe('HomeLead', () => {
  it('renders nothing for a null entry', () => {
    expect(renderLead(null)).toBe('');
  });

  it("renders the place name, the recipe name as a link to its latest version, and the version identity and mass line", () => {
    const markup = renderLead(makeEntry());
    expect(markup).toContain('Notebook');
    expect(markup).toContain('Olive oil');
    expect(markup).toContain('href="/recipe/v1"');
    expect(markup).toContain('g');
  });

  it('renders no Next time when the newest batch carries none', () => {
    const entry = makeEntry({ batches: [makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01', nextTimeNote: null } })] });
    const markup = renderLead(entry);
    expect(markup).not.toContain('home__lead-next-time');
  });

  it("renders the maker's Next time in the hand role class, escaped as text", () => {
    const entry = makeEntry({
      batches: [
        makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01', nextTimeNote: '<script>alert(1)</script>' } }),
      ],
    });
    const markup = renderLead(entry);
    expect(markup).toContain('app-hand');
    expect(markup).toContain('&lt;script&gt;');
    expect(markup).not.toContain('<script>');
  });
});
