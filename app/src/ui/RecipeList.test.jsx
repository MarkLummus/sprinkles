// Component test for the recipe list's one-row-per-recipe grouping
// (route-recipe-version.md § 3, 03-03) and the App marks grammar (D-07,
// D-11, D-19, 03.4-04 Task 2). In the existing style —
// renderToStaticMarkup (react-dom/server) in the node test environment.
// Because the list renders Links it needs a router context: wrapped in a
// MemoryRouter from react-router, already a dependency — no testing
// library added.
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
import { RecipeRows, HomeLead, HomeBody } from './RecipeList.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

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
    recordedAt: '2026-01-01T00:00:00.000Z',
    changed: null,
    churn: { churnDate: '2026-01-01', atTheMachine: null },
    tasting: null,
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
    expect(markup.match(/<li /g)).toHaveLength(2);
  });

  it('renders the row for the version with the greatest createdAt', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const markup = renderRows(versions);
    expect(markup).toContain('href="/recipe/b"');
    expect(markup).not.toContain('href="/recipe/a"');
  });

  it('renders one row for a single version', () => {
    const markup = renderRows([makeVersion()]);
    expect(markup.match(/<li /g)).toHaveLength(1);
  });

  it('renders no rows and does not crash for an empty store', () => {
    const markup = renderRows([]);
    expect(markup).not.toContain('<li');
  });
});

describe('RecipeRows — the App marks grammar (D-07, D-11, D-19, 03.4-04 Task 2)', () => {
  it('reads the place name (Notebook) above the recipe name, and no version tally at all (D-11)', () => {
    const markup = renderRows([makeVersion()]);
    expect(markup).toContain('Notebook');
    expect(markup).not.toContain('version');
  });

  it('renders one hollow tally mark per batch across the recipe\'s own versions, and none of another recipe\'s, with the count in words', () => {
    const versions = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
      makeVersion({ id: 'c', recipeId: 'r2', versionLabel: 'third', createdAt: '2026-01-15T00:00:00.000Z' }),
    ];
    const batches = [
      makeBatch({ id: 'ba', versionId: 'a', churn: { churnDate: '2026-01-05' }, tasting: { tastedDate: '2026-01-06' } }),
      makeBatch({ id: 'bb', versionId: 'b', churn: { churnDate: '2026-02-05' }, tasting: { tastedDate: '2026-02-06' } }),
      makeBatch({ id: 'bc', versionId: 'c', churn: { churnDate: '2026-01-20' } }),
      makeBatch({ id: 'bd', versionId: 'c', churn: { churnDate: '2026-01-25' } }),
      makeBatch({ id: 'be', versionId: 'c', churn: { churnDate: '2026-01-30' } }),
    ];
    const markup = renderRows(versions, batches);
    expect(markup).toContain('2 batches');
    expect(markup).toContain('3 batches');
    const marks = markup.match(/home__tally-mark/g) ?? [];
    expect(marks).toHaveLength(5);
  });

  it('reads "not yet made" and draws no tally mark for a recipe with no batch', () => {
    const markup = renderRows([makeVersion()]);
    expect(markup).toContain('not yet made');
    expect(markup).not.toMatch(/home__tally-mark/);
  });

  it('gives a not-yet-churned recipe only Record a batch, with no secondary action', () => {
    const markup = renderRows([makeVersion()]);
    expect(markup).toContain('Record a batch');
    expect(markup).not.toContain('home__action--secondary');
  });

  it('gives an awaiting-tasting recipe Record a tasting (to the newest batch) with Continue developing beside it', () => {
    const version = makeVersion({ id: 'v1', recipeId: 'r1' });
    const batches = [makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01' }, tasting: null })];
    const markup = renderRows([version], batches);
    expect(markup).toContain('Record a tasting');
    expect(markup).toContain('href="/recipe/v1/batch/b1"');
    expect(markup).toContain('Continue developing');
  });

  it('gives a tasted recipe Next version with Adapt beside it', () => {
    const version = makeVersion({ id: 'v1', recipeId: 'r1' });
    const batches = [
      makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01' }, tasting: { tastedDate: '2026-01-02' } }),
    ];
    const markup = renderRows([version], batches);
    expect(markup).toContain('Next version');
    expect(markup).toContain('Adapt');
  });

  it('renders no maker-authored free text on any row — the hand appears only on the lead block (D-20)', () => {
    const version = makeVersion({ id: 'v1', recipeId: 'r1' });
    const batches = [
      makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01', nextTimeNote: '<script>alert(1)</script>' } }),
    ];
    const markup = renderRows([version], batches);
    expect(markup).not.toContain('<script>');
    expect(markup).not.toContain('alert(1)');
  });

  it('renders without a batches prop (the default) and does not throw', () => {
    expect(() => renderRows([makeVersion()])).not.toThrow();
  });
});

// The standing word (gap 6, D-07, D-11): every row states in plain
// words where it stands, beside — never instead of — its filled action.
describe('RecipeRows — the standing word (gap 6, D-07, D-11)', () => {
  it('renders "Not yet churned" for a recipe with no batch', () => {
    const markup = renderRows([makeVersion()]);
    expect(markup).toContain('home__standing');
    expect(markup).toContain('Not yet churned');
  });

  it('renders "Awaiting tasting" for a recipe whose newest batch has no tasting', () => {
    const version = makeVersion({ id: 'v1', recipeId: 'r1' });
    const batches = [makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01' }, tasting: null })];
    const markup = renderRows([version], batches);
    expect(markup).toContain('Awaiting tasting');
  });

  it('renders "Tasted" for a recipe whose newest batch carries a tasting', () => {
    const version = makeVersion({ id: 'v1', recipeId: 'r1' });
    const batches = [
      makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01' }, tasting: { tastedDate: '2026-01-02' } }),
    ];
    const markup = renderRows([version], batches);
    expect(markup).toContain('Tasted');
  });

  it('renders the standing word once per row, alongside the filled action, not instead of it', () => {
    const version = makeVersion({ id: 'v1', recipeId: 'r1' });
    const batches = [makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01' }, tasting: null })];
    const markup = renderRows([version], batches);
    const standingMatches = markup.match(/home__standing/g) ?? [];
    expect(standingMatches).toHaveLength(1);
    expect(markup).toContain('Awaiting tasting');
    expect(markup).toContain('Record a tasting');
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

// HomeBody (03.4-04 Task 3, D-08, D-06, D-12): the empty shelf when the
// store holds no recipes, or the lead block and the rows otherwise.
function renderBody(versions, batches = []) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <HomeBody versions={versions} batches={batches} />
    </MemoryRouter>,
  );
}

describe('HomeBody — the empty shelf (D-08, 03.4-04 Task 3)', () => {
  it('renders the sentence and the two leading links, and no row, for an empty store', () => {
    const markup = renderBody([]);
    expect(markup).toContain('Nothing is in progress');
    expect(markup).toContain('href="/recipe-book"');
    expect(markup).toContain('href="/idea-log"');
    expect(markup).not.toContain('<li');
    expect(markup).not.toContain('home__lead');
  });

  it('renders a lead block and a list of one for a single recipe, not the empty state (D-06, D-12)', () => {
    const markup = renderBody([makeVersion()]);
    expect(markup).not.toContain('Nothing is in progress');
    expect(markup).toContain('home__lead');
    expect(markup.match(/<li /g)).toHaveLength(1);
  });
});
