// Component test for the Later disclosure's own card list
// (route-recipe-version.md § 3, § 6; rebuilt against sketch 003 variant
// B's own `.vtree`/`renderTree` markup for the disclosure — 03.3-06
// checkpoint feedback, Mark, 2026-09-10). In the existing style —
// renderToStaticMarkup (react-dom/server) in the node test environment.
// Wrapped in a MemoryRouter because the strip renders react-router
// Links, which throw outside a router context even under static
// rendering (Task 3's RecipeList.test.jsx precedent).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { VersionStrip } from './VersionStrip.jsx';

function makeVersion(overrides = {}) {
  return {
    id: 'v1',
    recipeId: 'r1',
    createdAt: '2026-01-01T00:00:00.000Z',
    versionLabel: 'line',
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
  it('renders the single version as a list entry, not nothing', () => {
    const versions = [makeVersion({ id: 'v1' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toMatch(/<ul class="version-strip__list">/);
    expect(markup).toContain('line');
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
    // Two anchors per card now — the version line itself and its own
    // Open control, both routing to the same version (03.3-06).
    expect(markup.match(/<a /g)).toHaveLength(6);
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

  it("carries the current version's entry with the distinguishing class, still a link", () => {
    const markup = renderStrip({ versions, currentId: 'b' });
    expect(markup).toMatch(
      /<li class="version-strip__item is-current"><p class="version-strip__vline"><a[^>]*href="\/recipe\/b"/,
    );
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
  it('renders the version line as a link to the version', () => {
    const versions = [makeVersion({ id: 'v2', versionLabel: '48 g oil · 800 g' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toMatch(/<p class="version-strip__vline"><a href="\/recipe\/v2"[^>]*>48 g oil · 800 g<\/a><\/p>/);
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

  it('renders no anchor at all while a pen is open, still reads every label in words, and Open in words too', () => {
    const markup = renderStrip({ versions, currentId: 'a', openPen: 'plan', penReason: 'the plan is being developed' });
    expect(markup.match(/<a /g)).toBeNull();
    expect(markup).toContain('first');
    expect(markup).toContain('second');
    expect(markup).toContain('third');
    expect((markup.match(/>Open</g) ?? []).length).toBe(3);
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

  it('renders the same six anchors as today with no pen open — two per card', () => {
    const markup = renderStrip({ versions, currentId: 'a', openPen: null, penReason: null });
    expect(markup.match(/<a /g)).toHaveLength(6);
    expect(markup).not.toContain('cannot be opened while');
  });
});
