// Component test for the Versions disclosure's own ruled register
// (route-recipe.md § 6 "The two history panels read as one register, not
// as cards", revised 2026-09-17; row grammar shared with BatchRow.jsx's
// batch panel; position markers from 260917-odu). In the existing
// style — renderToStaticMarkup (react-dom/server) in the node test
// environment. Wrapped in a MemoryRouter because the strip renders
// react-router Links, which throw outside a router context even under
// static rendering (Task 3's RecipeList.test.jsx precedent).
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { VersionStrip } from './VersionStrip.jsx';

// parentVersionId defaults to a truthy id, never left unset alongside
// parentVersionLabel — the store never produces that shape (transfer.js
// treats the pair as both-null or both-set), and the strip's own
// provenance line now branches on parentVersionId (260917-odu). A case
// that needs a root overrides both to null explicitly, below.
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
  // list is one row, so it wears both markers, in reading order, and
  // carries no link at all (260917-odu).
  it('renders the single version as a list entry, wearing both In view and Latest', () => {
    const versions = [makeVersion({ id: 'v1' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toMatch(/<ul class="history-register">/);
    expect(markup).toContain('Version 1 · line');
    expect(markup).toContain('<span class="history-register__marker">· In view · Latest</span>');
    expect(markup).not.toContain('<a');
  });
});

describe('VersionStrip — three versions of one recipe', () => {
  const versions = [
    makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
    makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'c', versionLabel: 'third', createdAt: '2026-03-01T00:00:00.000Z' }),
  ];

  it('renders three rows in creation order, most recently created first', () => {
    const markup = renderStrip({ versions, currentId: 'a' });
    const thirdIndex = markup.indexOf('third');
    const secondIndex = markup.indexOf('second');
    const firstIndex = markup.indexOf('first');
    // One anchor per row (the version line, the register's only link) —
    // except the entry in view, currentId 'a' here, which loses its link
    // entirely (260917-odu): two anchors, not three.
    expect(markup.match(/<a /g)).toHaveLength(2);
    expect(thirdIndex).toBeGreaterThan(-1);
    expect(thirdIndex).toBeLessThan(secondIndex);
    expect(secondIndex).toBeLessThan(firstIndex);
    // The ordinal is ordered.length - index off this same array: the
    // newest (third) is Version 3, down to the oldest (first) at Version 1.
    expect(markup).toContain('Version 3 · third');
    expect(markup).toContain('Version 2 · second');
    expect(markup).toContain('Version 1 · first');
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
      /<li class="history-register__item is-current"><div class="history-register__identity"><p class="history-register__name">Version 2 · second <span class="history-register__marker">· In view<\/span><\/p>/,
    );
    const currentLi = markup.match(/<li class="history-register__item is-current">[\s\S]*?<\/li>/)[0];
    expect(currentLi).not.toContain('<a');
    expect(currentLi).not.toContain('Latest');
  });

  it('wears the batch-history phrase — batchHistoryWords\' output — on a version with a batch and "not yet churned" on one without', () => {
    const allBatches = [makeBatch({ id: 'batch-b', versionId: 'b', churn: { churnDate: '2026-08-29' } })];
    const markup = renderStrip({ versions, currentId: 'a', allBatches });
    // Matches the phrase as a text node, not the CSS class of the same name.
    expect((markup.match(/>churned 29 Aug 2026</g) ?? []).length).toBe(1);
    expect((markup.match(/>not yet churned</g) ?? []).length).toBe(2);
  });
});

// The row's two blocks (route-recipe.md § 6, revised 2026-09-17): the
// identity block (version line, one provenance line) and the record block
// (written date, batch history in words).
describe('VersionStrip — the row content (route-recipe.md § 6)', () => {
  it('renders the version line as a link to the version — and, being the only entry, wearing Latest', () => {
    const versions = [makeVersion({ id: 'v2', versionLabel: '48 g oil · 800 g' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toMatch(
      /<p class="history-register__name"><a href="\/recipe\/v2"[^>]*>Version 1 · 48 g oil · 800 g<\/a> <span class="history-register__marker">· Latest<\/span><\/p>/,
    );
  });

  // The complete set meets a root version for the first time (260917-odu):
  // its parentVersionId and parentVersionLabel are both null, so
  // provenance stays null and no second identity line renders at all. The
  // record block still carries two lines — the row keeps its height from
  // the right column, not from a manufactured left-side line.
  it("renders a root version with no provenance element at all, and no \"null\" anywhere in the markup — the record block still carries two lines", () => {
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
    expect(markup).not.toContain('history-register__provenance');
    expect(markup).not.toContain('from ');
    expect(markup).not.toContain('null');
    expect(markup).toContain(
      '<div class="history-register__record"><p>written 18 Aug 2026</p><p>not yet churned</p></div>',
    );
  });

  it('shows only the citation when both a parent and a cited batch with a churn date exist — the citation wins (Mark, 2026-09-17)', () => {
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
    expect(markup).toContain('<p class="history-register__provenance">after the batch of 2 Aug 2026</p>');
    expect(markup).not.toContain('from 50 g oil · 800 g');
    expect(markup).toContain('<p>written 18 Aug 2026</p>');
  });

  it('falls through to "from <parent>" when the cited batch carries no churn date', () => {
    const versions = [
      makeVersion({
        id: 'v2',
        versionLabel: '48 g oil · 800 g',
        parentVersionLabel: '50 g oil · 800 g',
        createdAt: '2026-08-18T00:00:00.000Z',
        citedBatchId: 'batch-parent',
      }),
    ];
    const allBatches = [makeBatch({ id: 'batch-parent', versionId: 'v1', churn: { churnDate: null } })];
    const markup = renderStrip({ versions, currentId: 'v1', allBatches });
    expect(markup).toContain('<p class="history-register__provenance">from 50 g oil · 800 g</p>');
    expect(markup).not.toContain('after the batch of');
  });

  it('shows only "from <parent>" when no batch was cited', () => {
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
    expect(markup).toContain('<p class="history-register__provenance">from 50 g oil · 800 g</p>');
    expect(markup).toContain('<p>written 18 Aug 2026</p>');
    expect(markup).not.toContain('after the batch of');
  });

  it('reads "not yet churned" in the record block when the version has no batch, and renders no second link', () => {
    const versions = [makeVersion({ id: 'v2' })];
    const markup = renderStrip({ versions, currentId: 'v1' });
    expect(markup).toContain(
      '<div class="history-register__record"><p>written 1 Jan 2026</p><p>not yet churned</p></div>',
    );
    expect(markup.match(/<a /g)).toHaveLength(1);
  });

  it('reads "churned <date>" in the record block when the version has one batch, with no second link', () => {
    const versions = [makeVersion({ id: 'v2' })];
    const allBatches = [makeBatch({ id: 'batch-2', versionId: 'v2', churn: { churnDate: '2026-08-29' } })];
    const markup = renderStrip({ versions, currentId: 'v1', allBatches });
    expect(markup).toContain('<p>churned 29 Aug 2026</p>');
    expect(markup.match(/<a /g)).toHaveLength(1);
  });

  it('reads "churned twice · last <date>" — the count and the latest date — when a version has two batches', () => {
    const versions = [makeVersion({ id: 'v2' })];
    const allBatches = [
      makeBatch({ id: 'batch-2', versionId: 'v2', churn: { churnDate: '2026-08-29' } }),
      makeBatch({ id: 'batch-3', versionId: 'v2', churn: { churnDate: '2026-09-03' } }),
    ];
    const markup = renderStrip({ versions, currentId: 'v1', allBatches });
    expect(markup).toContain('churned twice · last 3 Sep 2026');
    expect(markup).not.toContain('churned 29 Aug 2026');
  });
});

// D-UAT-2: while a pen is open, the register is not a way off the page.
describe('VersionStrip — disabled while a pen is open (D-UAT-2)', () => {
  const versions = [
    makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
    makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-02-01T00:00:00.000Z' }),
    makeVersion({ id: 'c', versionLabel: 'third', createdAt: '2026-03-01T00:00:00.000Z' }),
  ];

  it('renders no anchor at all while a pen is open, and still reads every label in words', () => {
    const markup = renderStrip({ versions, currentId: 'a', openPen: 'plan', penReason: 'the plan is being developed' });
    expect(markup.match(/<a /g)).toBeNull();
    expect(markup).toContain('first');
    expect(markup).toContain('second');
    expect(markup).toContain('third');
  });

  it('still marks the current version by its existing class while a pen is open', () => {
    const markup = renderStrip({ versions, currentId: 'b', openPen: 'plan', penReason: 'the plan is being developed' });
    expect(markup).toContain('history-register__item is-current');
  });

  it('renders the single version as text, not a link, while a pen is open', () => {
    const single = [makeVersion({ id: 'v1' })];
    const markup = renderStrip({ versions: single, currentId: 'v1', openPen: 'plan', penReason: 'the plan is being developed' });
    expect(markup.match(/<a /g)).toBeNull();
    expect(markup).toContain('line');
  });

  it('renders two anchors with no pen open — one per row, except the entry in view which has none', () => {
    const markup = renderStrip({ versions, currentId: 'a', openPen: null, penReason: null });
    expect(markup.match(/<a /g)).toHaveLength(2);
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
    const currentLi = markup.match(/<li class="history-register__item is-current">[\s\S]*?<\/li>/)[0];
    expect(currentLi).toContain('In view');
    expect(currentLi).not.toContain('Latest');
  });

  it('wears both markers, in reading order, on one entry when the newest is the one in view', () => {
    const markup = renderStrip({ versions, currentId: 'c' });
    expect(markup).toContain(
      '<p class="history-register__name">Version 3 · third <span class="history-register__marker">· In view · Latest</span></p>',
    );
  });

  it('wears no marker text on an entry that is neither the newest nor the one in view', () => {
    const markup = renderStrip({ versions, currentId: 'b' });
    expect(markup).toMatch(/<p class="history-register__name"><a href="\/recipe\/a"[^>]*>Version 1 · first<\/a><\/p>/);
  });

  it('wears Latest only once — on the entry the list puts first — when two entries share a createdAt', () => {
    const tiedVersions = [
      makeVersion({ id: 'a', versionLabel: 'first', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeVersion({ id: 'b', versionLabel: 'second', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];
    const markup = renderStrip({ versions: tiedVersions, currentId: 'z' });
    expect((markup.match(/Latest/g) ?? []).length).toBe(1);
    // sortedVersions keeps tied entries in input order, so 'a' (input-first)
    // sorts first and wears the HIGHER ordinal — position decides, not the
    // date, the tie-break discipline `versionIdentity` shares with `Latest`.
    expect(markup).toMatch(
      /<p class="history-register__name"><a href="\/recipe\/a"[^>]*>Version 2 · first<\/a> <span class="history-register__marker">· Latest<\/span><\/p>/,
    );
    expect(markup).toContain('Version 1 · second');
  });

  it('carries no anti-goal form for the ordinal — no v3, #3, 3rd, zero-padding, or a wrapping element of its own', () => {
    const markup = renderStrip({ versions, currentId: 'b' });
    expect(markup).not.toContain('v3');
    expect(markup).not.toContain('#3');
    expect(markup).not.toContain('3rd');
    expect(markup).not.toContain('Version 03');
    expect(markup).not.toMatch(/<span[^>]*>Version 3<\/span>/);
  });

  it('renders no <a> at all for the entry in view, with no pen open', () => {
    const markup = renderStrip({ versions, currentId: 'a' });
    const currentLi = markup.match(/<li class="history-register__item is-current">[\s\S]*?<\/li>/)[0];
    expect(currentLi).not.toContain('<a');
  });
});
