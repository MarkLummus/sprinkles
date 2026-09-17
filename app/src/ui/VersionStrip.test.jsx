// Component test for the Versions disclosure's own card list
// (route-recipe-version.md § 3, § 6; rebuilt against sketch 003 variant
// B's own `.vtree`/`renderTree` markup for the disclosure — 03.3-06
// checkpoint feedback, Mark, 2026-09-10; the struck "Later" wording and
// the position markers retired/added 260917-odu). In the existing style —
// renderToStaticMarkup (react-dom/server) in the node test environment.
// Wrapped in a MemoryRouter because the strip renders react-router
// Links, which throw outside a router context even under static
// rendering (Task 3's RecipeList.test.jsx precedent).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { VersionStrip } from './VersionStrip.jsx';

// parentVersionId defaults to a truthy id, never left unset alongside
// parentVersionLabel — the store never produces that shape (transfer.js
// treats the pair as both-null or both-set), and the strip's own meta
// line now branches on parentVersionId (260917-odu). A case that needs a
// root overrides both to null explicitly, below.
function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'r1',
    createdAt: '2026-01-01T00:00:00.000Z',
    versionLabel: 'line',
    parentVersionId: 'v0',
    parentVersionLabel: 'parent line',
    citedBatchId: null,
    ...overrides,
  };
}

function makeBatch(overrides = {}) {
  return {
    id: 'batch-1',
    versionId: 'v1',
    churn: { churnDate: '2026-01-15' },
    ...overrides,
  };
}

function renderStrip(props) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <VersionStrip versions={[]} recipeId="r1" currentId="v1" allBatches={[]} {...props} />
    </MemoryRouter>,
  );
}

describe('VersionStrip — a list of one version is still a list (D-09 discipline, D-07)', () => {
  // The single entry is both the one in view and the newest — the whole
  // list is one card, so it wears both markers, in reading order, and
  // carries no link at all (260917-odu).
  it('renders the single version as a list entry, wearing both In view and Latest', () => {
    const versions = [makeVersion({ id: 'v1' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toMatch(/<ul class="version-strip__list">/);
    expect(markup).toContain('line');
    expect(markup).toContain('<span class="version-strip__marker">· In view · Latest</span>');
    expect(markup).not.toContain('<a');
  });
});

describe('VersionStrip — three versions of one recipe', () => {
  const versions = [
    makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
    makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'c', versionLabel: 'third', createdAt: '2026-03-01T00:00:00.000Z' }),
  ];

  it('renders three cards in creation order, most recently created first', () => {
    const markup = renderStrip({ versions, currentId: 'a' });
    const thirdIndex = markup.indexOf('third');
    const secondIndex = markup.indexOf('second');
    const firstIndex = markup.indexOf('first');
    // Two anchors per card (the version line itself and its own Open
    // control, both routing to the same version, 03.3-06) — except the
    // entry in view, currentId 'a' here, which loses both of its links
    // (260917-odu): four anchors, not six.
    expect(markup.match(/<a /g)).toHaveLength(4);
    expect(thirdIndex).toBeGreaterThan(-1);
    expect(thirdIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(firstIndex);
  });

  it('does not render a version belonging to a different recipeId', () => {
    const withOther = [...versions, makeVersion({ id: 'd', recipeId: 'other-recipe', versionLabel: 'elsewhere' })];
    const markup = renderStrip({ versions: withOther, currentId: 'a' });
    expect(markup).not.toContain('elsewhere');
    expect(markup.match(/<li/g)).toHaveLength(3);
  });

  it("carries the current version's entry with the distinguishing class, no longer a link, wearing In view", () => {
    const markup = renderStrip({ versions, currentId: 'b' });
    expect(markup).toMatch(
      /<li class="version-strip__item is-current"><p class="version-strip__vline">second <span class="version-strip__marker">· In view<\/span><\/p>/,
    );
    const currentLi = markup.match(/<li class="version-strip__item is-current">[\s\S]*?<\/li>/)[0];
    expect(currentLi).not.toContain('<a');
    expect(currentLi).not.toContain('Latest');
  });

  it('wears "churned <date>" on a version with a batch and not on one without, with no count', () => {
    const allBatches = [makeBatch({ id: 'batch-b', versionId: 'b', churn: { churnDate: '2026-08-29' } })];
    const markup = renderStrip({ versions, currentId: 'a', allBatches });
    // Matches the "churned" text node, not the CSS class of the same name.
    expect((markup.match(/>churned 29 Aug 2026</g) ?? []).length).toBe(1);
    expect(markup).not.toMatch(/churned\s*\(\d+\)/);
    expect(markup).not.toMatch(/\d+\s*churned/);
  });
});

// The card's own three lines (sketch 003 variant B, index.html:97-103,
// 440-447): the version line, a meta line naming the parent, the cited
// batch's date (when one was cited) and the written date, and a batch
// line naming the version's own most recent churn date plus Open.
describe('VersionStrip — the card content (03.3-06 checkpoint feedback, G-03.3-4)', () => {
  it('renders the version line as a link to the version — and, being the only entry, wearing Latest', () => {
    const versions = [makeVersion({ id: 'v2', versionLabel: '48 g oil · 800 g' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toMatch(
      /<p class="version-strip__vline"><a href="\/recipe\/v2"[^>]*>48 g oil · 800 g<\/a> <span class="version-strip__marker">· Latest<\/span><\/p>/,
    );
  });

  // The complete set meets a root version for the first time (260917-odu):
  // its parentVersionId and parentVersionLabel are both null, so the
  // meta line's "from …" clause is dropped rather than reading "from
  // null".
  it('renders a root version\'s meta line with no "from" clause and no "null" anywhere in the markup', () => {
    const versions = [
      makeVersion({
        id: 'v2',
        versionLabel: '48 g oil · 800 g',
        parentVersionId: null,
        parentVersionLabel: null,
        createdAt: '2026-08-18T00:00:00.000Z',
      }),
    ];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toContain('<p class="version-strip__meta">18 Aug 2026</p>');
    expect(markup).not.toContain('from ');
    expect(markup).not.toContain('null');
  });

  it('renders the meta line naming the parent, the cited batch\'s date, and the written date', () => {
    const versions = [
      makeVersion({
        id: 'v2',
        versionLabel: '48 g oil · 800 g',
        parentVersionLabel: '50 g oil · 800 g',
        createdAt: '2026-08-18T00:00:00.000Z',
        citedBatchId: 'batch-parent',
      }),
    ];
    const allBatches = [makeBatch({ id: 'batch-parent', versionId: 'v1', churn: { churnDate: '2026-08-02' } })];
    const markup = renderStrip({ versions, currentId: 'v1', allBatches });
    expect(markup).toContain(
      '<p class="version-strip__meta">from 50 g oil · 800 g · after the batch of 2 Aug 2026 · 18 Aug 2026</p>',
    );
  });

  it('drops the "after the batch of" segment when no batch was cited', () => {
    const versions = [
      makeVersion({
        id: 'v2',
        versionLabel: '48 g oil · 800 g',
        parentVersionLabel: '50 g oil · 800 g',
        createdAt: '2026-08-18T00:00:00.000Z',
        citedBatchId: null,
      }),
    ];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toContain('<p class="version-strip__meta">from 50 g oil · 800 g · 18 Aug 2026</p>');
    expect(markup).not.toContain('after the batch of');
  });

  it('renders the batch line with no churned span and still an Open control when the version has no batch', () => {
    const versions = [makeVersion({ id: 'v2' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toMatch(
      /<p class="version-strip__batch"><a class="text-control" href="\/recipe\/v2"[^>]*>Open<\/a><\/p>/,
    );
  });

  it('renders the batch line with churned <date> beside Open when the version has a batch', () => {
    const versions = [makeVersion({ id: 'v2' })];
    const allBatches = [makeBatch({ id: 'batch-2', versionId: 'v2', churn: { churnDate: '2026-08-29' } })];
    const markup = renderStrip({ versions, currentId: 'v1', allBatches });
    expect(markup).toContain('<span class="version-strip__churned">churned 29 Aug 2026</span>');
    expect(markup).toContain('>Open<');
  });

  it('reads the most recent churn date when a version has more than one batch', () => {
    const versions = [makeVersion({ id: 'v2' })];
    const allBatches = [
      makeBatch({ id: 'batch-2', versionId: 'v2', churn: { churnDate: '2026-08-29' } }),
      makeBatch({ id: 'batch-3', versionId: 'v2', churn: { churnDate: '2026-09-03' } }),
    ];
    const markup = renderStrip({ versions, currentId: 'v1', allBatches });
    expect(markup).toContain('churned 3 Sep 2026');
    expect(markup).not.toContain('churned 29 Aug 2026');
  });
});

// D-UAT-2: while a pen is open, the strip is not a way off the page.
describe('VersionStrip — disabled while a pen is open (D-UAT-2)', () => {
  const versions = [
    makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
    makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'c', versionLabel: 'third', createdAt: '2026-03-01T00:00:00.000Z' }),
  ];

  it('renders no anchor at all while a pen is open, still reads every label in words, and Open in words for every entry except the one in view', () => {
    const markup = renderStrip({ versions, currentId: 'a', openPen: 'plan', penReason: 'the plan is being developed' });
    expect(markup.match(/<a /g)).toBeNull();
    expect(markup).toContain('first');
    expect(markup).toContain('second');
    expect(markup).toContain('third');
    // 'a' is the entry in view — it renders no Open at all (dead-control
    // rule, 260917-odu), so two of the three entries read the word, not
    // three.
    expect((markup.match(/>Open</g) ?? []).length).toBe(2);
  });

  it('still marks the current version by its existing class while a pen is open', () => {
    const markup = renderStrip({ versions, currentId: 'b', openPen: 'plan', penReason: 'the plan is being developed' });
    expect(markup).toContain('version-strip__item is-current');
  });

  it('renders the single version as text, not a link, while a pen is open', () => {
    const single = [makeVersion({ id: 'v1' })];
    const markup = renderStrip({ versions: single, currentId: 'v1', openPen: 'plan', penReason: 'the plan is being developed' });
    expect(markup.match(/<a /g)).toBeNull();
    expect(markup).toContain('line');
  });

  it('renders four anchors with no pen open — two per card, except the entry in view which loses both', () => {
    const markup = renderStrip({ versions, currentId: 'a', openPen: null, penReason: null });
    expect(markup.match(/<a /g)).toHaveLength(4);
    expect(markup).not.toContain('cannot be opened while');
  });
});

// The position markers (route-recipe.md § 3, 260917-odu): words, not a
// class — a screen reader and forced colours still get the meaning.
describe('VersionStrip — the position markers', () => {
  const versions = [
    makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
    makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'c', versionLabel: 'third', createdAt: '2026-03-01T00:00:00.000Z' }),
  ];

  it('wears exactly one In view and one Latest, on different entries, viewed from the middle', () => {
    const markup = renderStrip({ versions, currentId: 'b' });
    expect((markup.match(/In view/g) ?? []).length).toBe(1);
    expect((markup.match(/Latest/g) ?? []).length).toBe(1);
    const currentLi = markup.match(/<li class="version-strip__item is-current">[\s\S]*?<\/li>/)[0];
    expect(currentLi).toContain('In view');
    expect(currentLi).not.toContain('Latest');
  });

  it('wears both markers, in reading order, on one entry when the newest is the one in view', () => {
    const markup = renderStrip({ versions, currentId: 'c' });
    expect(markup).toContain(
      '<p class="version-strip__vline">third <span class="version-strip__marker">· In view · Latest</span></p>',
    );
  });

  it('wears no marker text on an entry that is neither the newest nor the one in view', () => {
    const markup = renderStrip({ versions, currentId: 'b' });
    expect(markup).toMatch(/<p class="version-strip__vline"><a href="\/recipe\/a"[^>]*>first<\/a><\/p>/);
  });

  it('wears Latest only once — on the entry the list puts first — when two entries share a createdAt', () => {
    const tiedVersions = [
      makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    const markup = renderStrip({ versions: tiedVersions, currentId: 'z' });
    expect((markup.match(/Latest/g) ?? []).length).toBe(1);
    expect(markup).toMatch(
      /<p class="version-strip__vline"><a href="\/recipe\/a"[^>]*>first<\/a> <span class="version-strip__marker">· Latest<\/span><\/p>/,
    );
  });

  it('renders no <a> and no Open for the entry in view, with no pen open', () => {
    const markup = renderStrip({ versions, currentId: 'a' });
    const currentLi = markup.match(/<li class="version-strip__item is-current">[\s\S]*?<\/li>/)[0];
    expect(currentLi).not.toContain('<a');
    expect(currentLi).not.toContain('Open');
  });
});
