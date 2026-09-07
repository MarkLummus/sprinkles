// The show-changes state's table rendering (route-recipe-version.md § 3,
// § 6, 03-04): a comparison-of-two-versions rendering, driven entirely by
// buildDiff's own row descriptors. Renders through renderToStaticMarkup in
// the existing node Vitest environment — IngredientTable renders no links,
// so no router context is needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { IngredientTable } from './IngredientTable.jsx';
import { buildDiff } from '../domain/diff.js';
import { displayNumbers } from '../domain/stepNumbers.js';

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

// The step column, the selector, the flags and the accessible names all
// name a step by the derived display number (03-10, G-03-3 S3), never the
// stored key. A three-step method — with the second step removed either
// at baseline (pre-existing) or during the pen session — is enough to
// prove position and key have diverged.
function makeThreeStepMethod() {
  return [
    { n: 1, leadIn: 'Warm', instruction: 'Warm the milk.' },
    { n: 2, leadIn: 'Cool', instruction: 'Cool it down.' },
    { n: 3, leadIn: 'Churn', instruction: 'Churn until set.' },
  ];
}

describe('IngredientTable — the selector keeps a removed step in its list (G-03-3 S3, 03-10)', () => {
  it("renders an option matching a row's own removed allocation, disabled and marked removed, carrying its pre-removal number", () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 2)]); // allocated to step 2
    version.method = makeThreeStepMethod();
    const draftVersion = structuredClone(version);
    draftVersion.method[1].removed = true; // step 2 removed in the pen
    const penDraft = { rows: { a: { grams: '10', step: 2, removed: false } }, asMade: {} };
    const currentStepNumbers = displayNumbers(draftVersion.method); // 1->1, 3->2
    const baselineStepNumbers = displayNumbers(version.method); // 1->1, 2->2, 3->3

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={currentStepNumbers}
        baselineStepNumbers={baselineStepNumbers}
      />,
    );

    // The removed step's own option: present, disabled, carrying the
    // number it had before removal (2) and the word "removed" — the whole
    // fix for S3, since the row's bound value (2) now has a home.
    expect(markup).toMatch(/<option value="2" disabled(="")?[^>]*>2\. Cool \(removed\)<\/option>/);
    // React marks the option matching the select's own value as selected,
    // even though it is disabled — the control shows the row's own
    // allocation, never falling back to the first non-disabled option.
    expect(markup).toMatch(/<option value="2"[^>]*selected(="")?[^>]*>/);
  });

  it("carries display numbers on the active options' labels, not the stored key", () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1)]);
    version.method = makeThreeStepMethod();
    const draftVersion = structuredClone(version);
    draftVersion.method[1].removed = true; // step 2 removed; step 3 is now position 2
    const penDraft = { rows: { a: { grams: '10', step: 1, removed: false } }, asMade: {} };
    const currentStepNumbers = displayNumbers(draftVersion.method);
    const baselineStepNumbers = displayNumbers(version.method);

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={currentStepNumbers}
        baselineStepNumbers={baselineStepNumbers}
      />,
    );

    expect(markup).toContain('>2. Churn<');
    expect(markup).not.toContain('>3. Churn<');
  });

  it("writes the stored key, not the display position, when a different step is chosen — every option's value is the stored key", () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1)]);
    version.method = makeThreeStepMethod();
    const draftVersion = structuredClone(version);
    draftVersion.method[1].removed = true;
    const penDraft = { rows: { a: { grams: '10', step: 1, removed: false } }, asMade: {} };
    const currentStepNumbers = displayNumbers(draftVersion.method);
    const baselineStepNumbers = displayNumbers(version.method);

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={currentStepNumbers}
        baselineStepNumbers={baselineStepNumbers}
      />,
    );

    expect(markup).toContain('<option value="1"');
    expect(markup).toContain('<option value="2"');
    expect(markup).toContain('<option value="3"');
  });
});

describe('IngredientTable — the step column resolves references through the maps (03-10)', () => {
  it('reads unallocated for a row named only by a removed step, the surviving reference alone for a split row, and both joined for two survivors', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', 10, 2), // allocated only to the removed step 2
      makeRow('b', 'Row B', 10, 2, { splitStep: 3 }), // split across the removed step and surviving step 3
      makeRow('c', 'Row C', 10, 1, { splitStep: 3 }), // two surviving steps
    ]);
    version.method = makeThreeStepMethod();
    version.method[1].removed = true; // step 2 already removed in this reading
    const currentStepNumbers = displayNumbers(version.method); // 1->1, 3->2

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" currentStepNumbers={currentStepNumbers} />,
    );

    const stepCells = [
      ...sectionMarkup(markup, 'tbody').matchAll(/<td class="ingredient-table__col-step">([^<]*)<\/td>/g),
    ].map((match) => match[1]);
    expect(stepCells).toEqual(['unallocated', '2', '1 + 2']);
  });

  it("shows the baseline's display number, not the stored key, in the pen's struck baseline beside a changed selector", () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 3)]); // allocated to step 3
    version.method = makeThreeStepMethod();
    version.method[0].removed = true; // step 1 already removed at baseline — step 3's baseline position is 2
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: { grams: '10', step: 2, removed: false } }, asMade: {} }; // reallocated to step 2
    const currentStepNumbers = displayNumbers(draftVersion.method);
    const baselineStepNumbers = displayNumbers(version.method); // 2->1, 3->2

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={currentStepNumbers}
        baselineStepNumbers={baselineStepNumbers}
      />,
    );

    expect(markup).toContain('<span class="struck-value">2</span>');
    expect(markup).not.toContain('<span class="struck-value">3</span>');
  });

  it("in show-changes, shows the parent's display number struck before the child's own, and the accessible name reads the same two numbers", () => {
    const parentVersion = makeVersion([makeRow('a', 'Row A', 10, 2)]);
    parentVersion.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.' },
      { n: 2, leadIn: 'Two', instruction: 'Do two.' },
      { n: 3, leadIn: 'Three', instruction: 'Do three.' },
      { n: 4, leadIn: 'Four', instruction: 'Do four.' },
    ];
    const currentVersion = structuredClone(parentVersion);
    currentVersion.method[0].removed = true; // step 1 removed in the child
    currentVersion.rows[0].step = 4; // reallocated to step 4 in the child

    const diff = buildDiff(currentVersion, parentVersion);
    const currentStepNumbers = displayNumbers(currentVersion.method); // 2->1, 3->2, 4->3
    const baselineStepNumbers = displayNumbers(parentVersion.method); // 1->1, 2->2, 3->3, 4->4

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={currentVersion.rows}
        diff={diff}
        showingChanges
        mode="reading"
        currentStepNumbers={currentStepNumbers}
        baselineStepNumbers={baselineStepNumbers}
      />,
    );

    expect(markup).toContain('<span class="struck-value">2</span>3');
    expect(markup).toContain('was step 2, now step 3');
  });
});

describe('IngredientTable — the orphaned-row flag names a removed step by its pre-removal number (03-10)', () => {
  it("names the causing step by the number it had before removal, not its stored key", () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 3)]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.', removed: true }, // already removed at baseline
      { n: 2, leadIn: 'Two', instruction: 'Do two.', uses: ['a'] }, // will be removed this session
      { n: 3, leadIn: 'Three', instruction: 'Do three.' },
    ];
    const draftVersion = structuredClone(version);
    draftVersion.method[1].removed = true; // step 2 removed — orphans row a
    const penDraft = { rows: { a: { grams: '10', step: 3, removed: false } }, asMade: {} };
    const currentStepNumbers = displayNumbers(draftVersion.method); // 3->1
    const baselineStepNumbers = displayNumbers(version.method); // 2->1, 3->2

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={currentStepNumbers}
        baselineStepNumbers={baselineStepNumbers}
      />,
    );

    expect(markup).toContain('step 1, Two');
    expect(markup).not.toContain('step 2, Two');
  });
});
