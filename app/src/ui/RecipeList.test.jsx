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
import { RecipeList, RecipeRows, HomeLead, HomeBody } from './RecipeList.jsx';
import { oliveOilVersion, oliveOilRecipe } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { versionIdentity } from '../domain/lineage.js';
import { buildDraftRecord } from '../domain/draft.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { CatalogFixture } from './catalog.fixtures.jsx';

function makeVersion(overrides = {}) {
  return {
    ...oliveOilVersion,
    id: 'v1',
    recipeId: 'r1',
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
    expect(markup).toContain('href="/notebook/r1/b"');
    expect(markup).not.toContain('href="/notebook/r1/a"');
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

  it('gives an awaiting-tasting recipe Record a tasting (to the newest batch) with Keep developing beside it', () => {
    const version = makeVersion({ id: 'v1', recipeId: 'r1' });
    const batches = [makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01' }, tasting: null })];
    const markup = renderRows([version], batches);
    expect(markup).toContain('Record a tasting');
    expect(markup).toContain('href="/notebook/r1/v1/batch/b1"');
    expect(markup).toContain('Keep developing');
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

  it("renders the place name, the recipe name as a link to its latest version, and the version identity alone — no computed mass figure (03.4-12, Mark's ruling 6.4 of 2026-09-22)", () => {
    const entry = makeEntry();
    const markup = renderLead(entry);
    expect(markup).toContain('Notebook');
    expect(markup).toContain('Olive oil');
    expect(markup).toContain('href="/notebook/r1/v1"');
    expect(markup).toContain(versionIdentity(entry.versions, entry.latestVersion));
    expect(markup).not.toMatch(/\d\.\d\s*g\b/);
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

// The lead block as the board draws it (gap 5): bordered, rodded, a
// captioned Next time column, and its own actions.
describe('HomeLead — the board\'s block (gap 5)', () => {
  it('renders the destination rod, the same class the rows use', () => {
    const markup = renderLead(makeEntry());
    expect(markup).toContain('home__rail');
  });

  it('renders the place, name and meta line inside one identity element', () => {
    const markup = renderLead(makeEntry());
    expect(markup).toMatch(/<div class="home__lead-identity">[\s\S]*Notebook[\s\S]*Olive oil[\s\S]*<\/div>/);
  });

  it('renders a "Next time" caption and the note together, inside one column element, only when a note exists', () => {
    const entry = makeEntry({
      batches: [makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01', nextTimeNote: 'Taste again in a week.' } })],
    });
    const markup = renderLead(entry);
    expect(markup).toMatch(/<div class="home__lead-next">[\s\S]*Next time[\s\S]*Taste again in a week\.[\s\S]*<\/div>/);
  });

  it('renders no caption and no Next time column when the newest batch carries no note', () => {
    const markup = renderLead(makeEntry());
    expect(markup).not.toContain('home__lead-next');
    expect(markup).not.toContain('Next time');
  });

  it('gives a not-yet-churned lead the batch action alone', () => {
    const markup = renderLead(makeEntry());
    expect(markup).toContain('Record a batch');
    expect(markup).not.toContain('home__action--secondary');
  });

  it('gives an awaiting-tasting lead the filled tasting action with Keep developing beside it', () => {
    const entry = makeEntry({
      standing: 'awaiting-tasting',
      batches: [makeBatch({ id: 'b1', versionId: 'v1', churn: { churnDate: '2026-01-01' }, tasting: null })],
    });
    const markup = renderLead(entry);
    expect(markup).toContain('Record a tasting');
    expect(markup).toContain('Keep developing');
  });
});

// HomeBody (03.4-04 Task 3, D-08, D-06, D-12): the empty shelf when the
// store holds no recipes, or the lead block and the rows otherwise.
function renderBody(versions, batches = [], recipes = []) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <HomeBody versions={versions} batches={batches} recipes={recipes} catalog={SEED_CATALOG} />
    </MemoryRouter>,
  );
}

// The recipe record is the name's source (D-11): HomeBody threads a third
// `recipes` prop into activeWork so the lead's name link reads the record,
// not a field on the version.
describe('HomeBody — the recipe record is the name\'s source (D-11)', () => {
  it("reads the olive oil recipe's name from the recipe record, not the version", () => {
    const markup = renderBody([oliveOilVersion], [augustSecondBatch], [oliveOilRecipe]);
    expect(markup).toMatch(/<h2 class="home__lead-name">[\s\S]*Olive Oil Ice Cream, circulator[\s\S]*<\/h2>/);
  });
});

// D-10: the short link to the Search page's Sheet code field sits at the
// right of the Recipes row (sketch 010 screen-home.html).
describe('HomeBody — Enter Sheet code (D-10)', () => {
  it('renders the link to /search with tabindex 0 inside the Recipes section row', () => {
    const markup = renderBody([makeVersion()]);
    const row = markup.match(/<div class="home__section-row">[\s\S]*?<\/div>/)[0];
    expect(row).toMatch(/^<div class="home__section-row"><h2 class="home__section">Recipes<\/h2><a /);
    const link = row.match(/<a\b[^>]*class="home__code-link"[^>]*>([^<]*)<\/a>/);
    expect(link[0]).toContain('href="/search"');
    expect(link[0]).toContain('tabindex="0"');
    expect(link[1]).toBe('Enter Sheet code');
  });

  it('is not on the empty shelf, which has no recipes to row', () => {
    expect(renderBody([])).not.toContain('home__code-link');
  });
});

// D-18 (04-09, sketch 010 screen-home.html): Home names an open draft. The
// recipe holding the newest draft takes the lead, whose version line names the
// draft's version, with "Draft open on this version · Go to draft" beneath it;
// the list below keeps its order.
function renderBodyWithDrafts(versions, batches, drafts, catalog = SEED_CATALOG) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <HomeBody versions={versions} batches={batches} recipes={[]} drafts={drafts} catalog={catalog} />
    </MemoryRouter>,
  );
}

// What handleStartDeveloping builds, over a version's own rows and steps, so the
// draft fits the version it names (Home names only a draft that would reopen).
function planPayloadFor(version) {
  return {
    versionLabel: 'less oil',
    reason: '',
    citedBatchId: null,
    sheetTitle: version.sheetTitle,
    sheetDescription: version.sheetDescription,
    rows: Object.fromEntries(
      version.rows.map((row) => [
        row.id,
        { portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams), removed: false })) },
      ]),
    ),
    method: structuredClone(version.method),
    authored: structuredClone(version.authored),
  };
}

// The blank record draft's own values, written out as draft.test.js does.
function blankRecordPayload() {
  return {
    churnDate: '',
    asMade: {},
    stepChanges: {},
    outOfMachineTempC: '',
    churnDurationMinutes: '',
    exitConsistency: '',
    airiness: '',
    atDraw: '',
    atTheMachine: '',
    ingredientNotes: '',
    nextTimeNote: '',
    tastingOpen: false,
    tastedDate: '',
    temperingMinutes: '',
    tastingTempC: '',
    marks: {},
    note: '',
    defects: [],
    declaredDefects: [],
    fromFreezer: '',
    meltTestG: '',
    meltStyle: '',
  };
}

// A stored plan draft on the version, built the way the page builds it; the
// version must be one the test's `versions` holds (every makeVersion keeps the
// olive oil rows, method and authored text).
function draftOn(versionId, overrides = {}) {
  return {
    ...buildDraftRecord({
      versionId,
      kind: 'plan',
      payload: planPayloadFor(oliveOilVersion),
      now: '2026-03-01T00:00:00.000Z',
    }),
    ...overrides,
  };
}

// A Correct draft on the version, naming a batch, with a blank record payload
// and an identical baseline.
function correctDraftOn(versionId, batchId, payloadOverrides = {}) {
  const payload = { ...blankRecordPayload(), ...payloadOverrides };
  return buildDraftRecord({
    versionId,
    kind: 'amend',
    payload,
    amendingBatchId: batchId,
    amendBaseline: blankRecordPayload(),
    amendOpener: 'correct',
    now: '2026-03-01T00:00:00.000Z',
  });
}

function leadOf(markup) {
  return markup.match(/<section class="home__lead">[\s\S]*?<\/section>/)[0];
}

// The one draft line, as rendered: its text and its link's href.
function draftLine(markup) {
  const line = markup.match(/<p class="home__lead-draft">[\s\S]*?<\/p>/);
  return line ? line[0] : null;
}

function draftHref(markup) {
  return draftLine(markup)?.match(/href="([^"]+)"/)?.[1] ?? null;
}

function rowHrefs(markup) {
  const list = markup.match(/<ul class="home__list">[\s\S]*<\/ul>/)[0];
  return [...list.matchAll(/<h2 class="home__name"><a [^>]*href="([^"]+)"/g)].map((match) => match[1]);
}

describe('HomeBody — an open draft takes the lead (D-18, 04-09)', () => {
  // r1 was touched last (newer version), r2 earlier; the draft is on r2.
  const versions = [
    makeVersion({ id: 'v1', recipeId: 'r1', versionLabel: 'newest work', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'v2', recipeId: 'r2', versionLabel: 'older work', createdAt: '2026-01-01T00:00:00.000Z' }),
  ];

  it('with no draft there is no draft line and the most recently touched recipe leads', () => {
    const markup = renderBodyWithDrafts(versions, [], []);
    expect(markup).not.toContain('home__lead-draft');
    expect(leadOf(markup)).toContain('href="/notebook/r1/v1"');
  });

  it('a draft on another recipe moves that recipe to the lead, with the line and Go to draft linking to the draft’s address', () => {
    const markup = renderBodyWithDrafts(versions, [], [draftOn('v2')]);
    const lead = leadOf(markup);
    expect(lead).toMatch(/<h2 class="home__lead-name"><a [^>]*href="\/notebook\/r2\/v2"[^>]*>r2<\/a><\/h2>/);
    expect(lead).toContain('<p class="home__lead-meta">Version 1 · older work</p>');
    expect(draftLine(markup)).toMatch(/^<p class="home__lead-draft">Draft open on this version · <a [^>]*>Go to draft<\/a><\/p>$/);
    expect(draftHref(markup)).toBe('/notebook/r2/v2');
    expect(markup.match(/home__lead-draft/g)).toHaveLength(1);
    // Beneath the version line, inside the identity column.
    expect(lead.indexOf('home__lead-meta')).toBeLessThan(lead.indexOf('home__lead-draft'));
    expect(lead.indexOf('home__lead-draft')).toBeLessThan(lead.indexOf('home__actions'));
  });

  it('the list below keeps its order, the lead recipe included', () => {
    const withDraft = renderBodyWithDrafts(versions, [], [draftOn('v2')]);
    const without = renderBodyWithDrafts(versions, [], []);
    expect(rowHrefs(withDraft)).toEqual(['/notebook/r1/v1', '/notebook/r2/v2']);
    expect(rowHrefs(withDraft)).toEqual(rowHrefs(without));
  });

  it('on a recipe’s older version, the version line names that version and the link goes to it', () => {
    const two = [
      makeVersion({ id: 'a', recipeId: 'r1', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', recipeId: 'r1', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const markup = renderBodyWithDrafts(two, [], [draftOn('a')]);
    const lead = leadOf(markup);
    expect(lead).toContain('<p class="home__lead-meta">Version 1 · first</p>');
    expect(draftHref(markup)).toBe('/notebook/r1/a');
    // The lead's own name link and actions still open the latest version.
    expect(lead).toMatch(/<h2 class="home__lead-name"><a [^>]*href="\/notebook\/r1\/b"/);
  });

  it('the newest draft wins when several are kept', () => {
    const markup = renderBodyWithDrafts(
      versions,
      [],
      [draftOn('v1', { updatedAt: '2026-03-01T00:00:00.000Z' }), draftOn('v2', { updatedAt: '2026-03-02T00:00:00.000Z' })],
    );
    expect(draftHref(markup)).toBe('/notebook/r2/v2');
  });

  it('a Correct draft links to its batch’s address while the batch is stored, and is not named when it is not', () => {
    const batch = makeBatch({ id: 'b9', versionId: 'v2' });
    const amend = correctDraftOn('v2', 'b9');
    expect(draftHref(renderBodyWithDrafts(versions, [batch], [amend]))).toBe('/notebook/r2/v2/batch/b9');
    expect(draftLine(renderBodyWithDrafts(versions, [], [amend]))).toBeNull();
    expect(leadOf(renderBodyWithDrafts(versions, [], [amend]))).toContain('href="/notebook/r1/v1"');
  });

  it('a stale draft is not named: a wrong shape version, or a plan missing one of the version’s rows', () => {
    const wrongShape = draftOn('v2', { shapeVersion: 2 });
    const missingRow = draftOn('v2');
    delete missingRow.payload.rows[Object.keys(missingRow.payload.rows)[0]];
    for (const stale of [wrongShape, missingRow]) {
      const markup = renderBodyWithDrafts(versions, [], [stale]);
      expect(draftLine(markup)).toBeNull();
      expect(leadOf(markup)).toContain('href="/notebook/r1/v1"');
    }
  });

  it('when the newest draft is stale and an older one fits, the older one is named', () => {
    const staleNewest = draftOn('v1', { updatedAt: '2026-03-02T00:00:00.000Z', shapeVersion: 2 });
    const fittingOlder = draftOn('v2', { updatedAt: '2026-03-01T00:00:00.000Z' });
    const markup = renderBodyWithDrafts(versions, [], [staleNewest, fittingOlder]);
    expect(draftHref(markup)).toBe('/notebook/r2/v2');
  });

  it('a record draft whose declared problems are outside its version’s declared problems is not named', () => {
    const record = buildDraftRecord({
      versionId: 'v2',
      kind: 'record',
      payload: { ...blankRecordPayload(), declaredDefects: ['NotDeclared'] },
      now: '2026-03-01T00:00:00.000Z',
    });
    expect(draftLine(renderBodyWithDrafts(versions, [], [record]))).toBeNull();
    const declared = { ...record, payload: { ...record.payload, declaredDefects: ['Bitter'] } };
    expect(draftHref(renderBodyWithDrafts(versions, [], [declared]))).toBe('/notebook/r2/v2');
  });

  // The wiring: Home hands the catalog it was given to the fit check, so a mark
  // on a core scale only that catalog holds decides whether the draft is named.
  it('a record draft marking a core scale only the given catalog holds is named with that catalog and not with the seeded one', () => {
    const withCreaminess = structuredClone(SEED_CATALOG);
    withCreaminess.scales.push({
      id: 'creaminess',
      key: 'creaminess',
      name: 'Creaminess',
      low: 'thin',
      high: 'rich',
      kind: 'goldilocks',
      group: 'core',
      order: 7,
    });
    const record = buildDraftRecord({
      versionId: 'v2',
      kind: 'record',
      payload: { ...blankRecordPayload(), marks: { creaminess: 3 } },
      now: '2026-03-01T00:00:00.000Z',
    });
    expect(draftHref(renderBodyWithDrafts(versions, [], [record], withCreaminess))).toBe('/notebook/r2/v2');
    expect(draftLine(renderBodyWithDrafts(versions, [], [record], SEED_CATALOG))).toBeNull();
  });

  it('a draft whose version is not in the store is not named', () => {
    const markup = renderBodyWithDrafts(versions, [], [draftOn('gone')]);
    expect(markup).not.toContain('home__lead-draft');
  });

  it('Go to draft carries an explicit tabindex of 0', () => {
    const markup = renderBodyWithDrafts(versions, [], [draftOn('v2')]);
    const tag = markup.match(/<a\b[^>]*>Go to draft<\/a>/)[0];
    expect(tag).toContain('tabindex="0"');
  });
});

// Phase 9 plan 04 (D-18): a create draft belongs to no stored version, so a
// store holding one changes nothing Home shows.
describe('HomeBody — a create draft in the store changes nothing (D-18)', () => {
  const versions = [
    makeVersion({ id: 'v1', recipeId: 'r1', versionLabel: 'newest work', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'v2', recipeId: 'r2', versionLabel: 'older work', createdAt: '2026-01-01T00:00:00.000Z' }),
  ];

  function createDraftOn(versionId) {
    return buildDraftRecord({
      versionId,
      kind: 'create',
      payload: { recipeId: 'r-new', versionId, name: 'Lemon' },
      now: '2026-03-05T00:00:00.000Z',
    });
  }

  it('renders the same markup as with no drafts when the create draft names no stored version', () => {
    const without = renderBodyWithDrafts(versions, [], []);
    expect(renderBodyWithDrafts(versions, [], [createDraftOn('v-new')])).toBe(without);
  });

  it('renders the same markup even when its versionId equals a stored version’s id', () => {
    const without = renderBodyWithDrafts(versions, [], []);
    const markup = renderBodyWithDrafts(versions, [], [createDraftOn('v2')]);
    expect(markup).toBe(without);
    expect(markup).not.toContain('home__lead-draft');
  });
});

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

// Every <a> the app renders carries an explicit tabindex, closing
// G-03.4-r4-1 (.planning/debug/ipad-keyboard-locks-after-tab.md). WebKit
// admits an <a href> to the Tab order only under the embedder's
// TabsToLinks preference — off on Apple platforms, untouched by Full
// Keyboard Access — or when the link carries an explicit tabindex;
// 03.4-14 gave the shell's stops one, and Home's own links are this
// gap's other half. The rule is recorded in .claude/CLAUDE.md's
// Conventions. The pin is on rendered markup, not source text, because
// the attribute's whole effect is in the DOM WebKit reads.
describe('HomeBody — every link carries an explicit tabindex (G-03.4-r4-1, .planning/debug/ipad-keyboard-locks-after-tab.md)', () => {
  it('renders exactly 2 <a> opening tags for an empty store (Recipe book, Idea log), each carrying tabindex="0"', () => {
    const markup = renderBody([]);
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(2);
    for (const tag of tags) {
      expect(tag).toContain('tabindex="0"');
    }
  });

  it('renders exactly 12 <a> opening tags for three recipes, one per standing, the tasted one leading (Enter Sheet code 1; lead 3: name, Next version, Adapt; rows 8: not-yet-churned 2, awaiting-tasting 3, tasted 3), each carrying tabindex="0"', () => {
    const versions = [
      makeVersion({ id: 'v1', recipeId: 'r1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'v2', recipeId: 'r2', createdAt: '2026-01-02T00:00:00.000Z' }),
      makeVersion({ id: 'v3', recipeId: 'r3', createdAt: '2026-01-04T00:00:00.000Z' }),
    ];
    const batches = [
      makeBatch({ id: 'b2', versionId: 'v2', recordedAt: '2026-01-03T00:00:00.000Z', tasting: null }),
      makeBatch({ id: 'b3', versionId: 'v3', recordedAt: '2026-01-05T00:00:00.000Z', tasting: { tastedDate: '2026-01-06' } }),
    ];
    const markup = renderBody(versions, batches);
    const tags = markup.match(/<a\b[^>]*>/g) ?? [];
    expect(tags).toHaveLength(12);
    for (const tag of tags) {
      expect(tag).toContain('tabindex="0"');
    }
  });
});

// RecipeList — the loading state (03.4-13, G-03.4-1): before the store
// reads resolve, the page shows its wrapper, its title and a loading
// line, never nothing. renderToStaticMarkup runs no effects (react-dom/
// server, node environment — the same idiom this file already uses for
// HomeBody/HomeLead/RecipeRows), so versions/batches stay at their
// initial state and the component renders in exactly its loading state.
describe('RecipeList — the loading state (03.4-13, G-03.4-1)', () => {
  it('renders the page title and a loading line, and no recipe row, before the store reads resolve', () => {
    const markup = renderToStaticMarkup(
      <CatalogFixture>
        <MemoryRouter>
          <RecipeList />
        </MemoryRouter>
      </CatalogFixture>,
    );
    expect(markup).toContain('Pick up where you left off');
    expect(markup).toContain('home__loading');
    expect(markup).not.toContain('<li');
  });
});
