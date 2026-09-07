// The show-changes state's table rendering (route-recipe-version.md § 3,
// § 6, 03-04): a comparison-of-two-versions rendering, driven entirely by
// buildDiff's own row descriptors. Renders through renderToStaticMarkup in
// the existing node Vitest environment — IngredientTable renders no links,
// so no router context is needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { IngredientTable } from './IngredientTable.jsx';
import { buildDiff } from '../domain/diff.js';

function makeRow(id, name, grams, step, overrides = {}) {
  return {
    id,
    ingredientName: name,
    grams,
    step,
    splitStep: null,
    removed: false,
    ingredient: { composition: {}, basis: {} },
    ...overrides,
  };
}

function makeVersion(rows) {
  return { versionLabel: 'v', headnote: '', targets: {}, rows, method: [] };
}

describe('IngredientTable — the show-changes state', () => {
  it('never reorders: a removed row reappears struck at its original index, in the version\'s own authored order', () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1), makeRow('c', 'Row C', 5, 2)]);
    const current = makeVersion([
      makeRow('a', 'Row A', 10, 1),
      makeRow('b', 'Row B', 20, 1, { removed: true }),
      makeRow('c', 'Row C', 5, 2),
    ]);
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" />,
    );

    const names = ['Row A', 'Row B', 'Row C'];
    const indices = names.map((name) => markup.indexOf(name));
    expect(indices[0]).toBeLessThan(indices[1]);
    expect(indices[1]).toBeLessThan(indices[2]);
    // The removed row reappears whole and struck, in its own place — never
    // dropped, never moved to the end.
    expect(markup).toContain('<span class="struck-value">Row B</span>');
  });

  it('renders a share strike alone for a row whose grams held but whose share moved', () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 30, 1)]);
    const diff = buildDiff(current, baseline);
    const rowADiff = diff.rows.find((row) => row.id === 'a');
    expect(rowADiff.gramsChanged).toBe(false);
    expect(rowADiff.shareChanged).toBe(true);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" />,
    );

    expect(markup).toContain(`was ${rowADiff.shareFrom}, now ${rowADiff.shareTo}`);
    expect(markup).not.toMatch(/was 10 g, now 10 g/);
  });

  it('renders no strike at all for a row whose value equals the parent\'s', () => {
    // Row B's grams move by the same amount Row D's move the other way, so
    // the batch's total mass — and therefore Row A's own share, even
    // though Row A never changes either — stays identical on both sides.
    const baseline = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1), makeRow('d', 'Row D', 70, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 25, 1), makeRow('d', 'Row D', 65, 1)]);
    const diff = buildDiff(current, baseline);
    const rowADiff = diff.rows.find((row) => row.id === 'a');
    expect(rowADiff.gramsChanged).toBe(false);
    expect(rowADiff.shareChanged).toBe(false);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" />,
    );

    const rowAIndex = markup.indexOf('Row A');
    const rowBIndex = markup.indexOf('Row B');
    const rowAMarkup = markup.slice(rowAIndex, rowBIndex);
    expect(rowAMarkup).not.toContain('struck-value');
  });

  it('marks in ink, never pen blue — no ink-field or ink-text class in the show-changes state', () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 10, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 12, 1)]);
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" />,
    );

    expect(markup).toContain('struck-value');
    expect(markup).not.toContain('ink-field');
    expect(markup).not.toContain('ink-text');
  });
});

// G-03-1 finding (b): hasAsMadeLayer (IngredientTable.jsx) already governed
// the total-row cell and the legend; these tests pin the header and body
// cells it was never wired to, plus the structural invariant that makes a
// conditional middle column safe — header, body and total row must always
// agree on how many cells they carry.
function makeBatch(asMade = {}) {
  return { churn: { asMade } };
}

function sectionMarkup(markup, tag) {
  const start = markup.indexOf(`<${tag}`);
  const end = markup.indexOf(`</${tag}>`) + `</${tag}>`.length;
  return markup.slice(start, end);
}

function countTag(markup, tag) {
  return (markup.match(new RegExp(`<${tag}[ >]`, 'g')) || []).length;
}

function assertCellCountsAgree(markup) {
  const headerCount = countTag(sectionMarkup(markup, 'thead'), 'th');
  const bodyCount = countTag(sectionMarkup(markup, 'tbody'), 'td');
  const totalCount = countTag(sectionMarkup(markup, 'tfoot'), 'td');
  expect(headerCount).toBe(bodyCount);
  expect(bodyCount).toBe(totalCount);
}

describe('IngredientTable — the As made column obeys hasAsMadeLayer (G-03-1 finding b)', () => {
  it('reading a version with no batch in view: no As made header, no legend', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={null} />);

    expect(markup).not.toContain('>As made<');
    expect(markup).not.toContain('As made totals what was written');
    assertCellCountsAgree(markup);
  });

  it('reading a version with a saved batch in view: As made header and legend both present', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const openBatch = makeBatch();

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={openBatch} />);

    expect(markup).toContain('>As made<');
    expect(markup).toContain('As made totals what was written');
    assertCellCountsAgree(markup);
  });

  it('recording: As made header present', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const draft = { asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="recording" draft={draft} openBatch={null} />,
    );

    expect(markup).toContain('>As made<');
    assertCellCountsAgree(markup);
  });

  it('developing on a version with no batch: As made header absent — the exact case the maker reported', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const draftVersion = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const penDraft = { rows: { a: { grams: '40', step: 1, removed: false } }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
      />,
    );

    expect(markup).not.toContain('>As made<');
    assertCellCountsAgree(markup);
  });

  it('developing on a version with a saved batch in view: As made header present — openBatch is not cleared while developing', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const draftVersion = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const penDraft = { rows: { a: { grams: '40', step: 1, removed: false } }, asMade: {} };
    const openBatch = makeBatch({ a: 38 });

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={openBatch}
      />,
    );

    expect(markup).toContain('>As made<');
    assertCellCountsAgree(markup);
  });

  it('show-changes with no batch in view: As made header absent', () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 48, 1)]);
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" openBatch={null} />,
    );

    expect(markup).not.toContain('>As made<');
    assertCellCountsAgree(markup);
  });
});
