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

// The row fixture factory (D-01, D-02): a row is built with portions, an
// amount and a step for the common one-portion case, with an `overrides`
// object for anything else — including a `portions` array of its own, for
// a split row, which overrides amount/step entirely.
function makeRow(id, name, grams, step, overrides = {}) {
  const { portions, ...rest } = overrides;
  return {
    id,
    ingredientName: name,
    portions: portions ?? [{ step, grams }],
    removed: false,
    ingredient: { composition: {}, basis: {} },
    ...rest,
  };
}

function makeVersion(rows) {
  return { versionLabel: 'v', headnote: '', targets: {}, rows, method: [] };
}

// The pen draft's row shape (D-01, D-02): { portions: [{ step, grams }],
// removed }, each portion's grams the raw typed string. For the common
// one-portion case, mirroring makeRow's own single-field ergonomics.
function onePortionDraftRow(step, grams, removed = false) {
  return { portions: [{ step, grams }], removed };
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

// A group-head <tr> carries a single colspanned <td> (Task 2) — stripped
// before counting, since its one cell would otherwise violate the
// header/body/total column-count invariant this helper checks.
function stripStepHeadRows(tbodyMarkup) {
  return tbodyMarkup.replace(/<tr class="ingredient-table__step-head">[\s\S]*?<\/tr>/g, '');
}

function assertCellCountsAgree(markup) {
  const headerCount = countTag(sectionMarkup(markup, 'thead'), 'th');
  const bodyCount = countTag(stripStepHeadRows(sectionMarkup(markup, 'tbody')), 'td');
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
    const penDraft = { rows: { a: onePortionDraftRow(1, '40') }, asMade: {} };

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
    const penDraft = { rows: { a: onePortionDraftRow(1, '40') }, asMade: {} };
    const openBatch = makeBatch({ a: [38] });

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

describe('IngredientTable — the As made column reads and records per portion (D-10, D-18)', () => {
  // Task 2 (LD-01) supersedes the old joined-cell design these three tests
  // used to pin: a split row's portions now render as separate <tr>s, one
  // per step it participates in, so there is no cell left that would ever
  // join two portions' as-made readings with " + ". Each portion's own
  // as-made value (or the absence of one) is named on that portion's own
  // line alone; the row's OTHER portion's plan amount is now always
  // visible too, in that portion's own sub-line (formatPortionLine) —
  // the opposite of the old design's "never that portion's plan amount"
  // hiding, which the step-grouped table's whole point is to stop doing.
  it("a saved batch's split row reads each portion's own as-made value, each on its own portion line", () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] }),
    ]);
    const openBatch = makeBatch({ a: [120, 263] });

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={openBatch} />);

    expect(markup).not.toContain('120 + 263');
    expect(markup).toContain('<span class="ink-text">120 g</span>');
    expect(markup).toContain('<span class="ink-text">263 g</span>');
    expect(markup).toContain('aria-label="Whole milk, 370.4 g, as made 120 g"');
    expect(markup).toContain('aria-label="Whole milk, 370.4 g, as made 263 g"');
  });

  it("a split row with one written portion shows that portion's own as-made value; the unwritten portion's own line names no as-made value at all, though its own plan amount is visible in its own sub-line", () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] }),
    ]);
    const openBatch = makeBatch({ a: [120, null] });

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={openBatch} />);

    // Full-string assertions (03.2-05, CR-01): a toContain('120') substring
    // check is satisfied by a dangling '120 +  g' just as much as by a
    // clean '120 g' — asserting the whole cell and the whole accessible
    // name is the only way this class of regression cannot pass green.
    expect(markup).toContain('<span class="ink-text">120 g</span>');
    expect(markup).toContain('aria-label="Whole milk, 370.4 g, as made 120 g"');
    // The unwritten portion's own line: no as-made phrase and no ink-text —
    // full-string, so it cannot pass on a dangling accessible name either.
    expect(markup).toContain(
      'aria-label="Whole milk, 370.4 g"><td class="ingredient-table__col-name">Whole milk' +
        '<span class="ingredient-table__portion-note">250.4 g of 370.4 g · 100.0% in all</span>' +
        '</td><td class="ingredient-table__col-numeric">250.4 g</td><td class="ingredient-table__col-numeric"></td>',
    );
  });

  it('a three-portion row with a blank middle portion: each written portion shows its own as-made value on its own line; the unwritten middle portion carries no as-made phrase at all', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', null, null, {
        portions: [{ step: 2, grams: 100 }, { step: 3, grams: 20 }, { step: 4, grams: 50 }],
      }),
    ]);
    const openBatch = makeBatch({ a: [100, null, 50] });

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={openBatch} />);

    expect(markup).toContain('<span class="ink-text">100 g</span>');
    expect(markup).toContain('<span class="ink-text">50 g</span>');
    expect(markup).toContain('aria-label="Row A, 170 g, as made 100 g"');
    expect(markup).toContain('aria-label="Row A, 170 g, as made 50 g"');
    expect(markup).toContain(
      'aria-label="Row A, 170 g"><td class="ingredient-table__col-name">Row A' +
        '<span class="ingredient-table__portion-note">20 g of 170.0 g · 100.0% in all</span>',
    );
  });

  it('a row whose as-made key holds no written portion reads as no as-made at all', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', null, null, { portions: [{ step: 2, grams: 40 }, { step: 3, grams: 60 }] }),
    ]);
    const openBatch = makeBatch({ a: [null, null] });

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={openBatch} />);

    // Scoped to the row's own tbody markup, not the whole table: the total
    // row legitimately carries its own "as made X grams" phrase whenever
    // an as-made layer is showing at all (hasAsMadeLayer), which is true
    // here purely because openBatch is non-null — that phrase is correct
    // and unrelated to this row's own reading, so asserting against the
    // whole markup would fail on a clause this scenario never claimed to
    // test (found running Task 2's green pass; recorded in the SUMMARY).
    const bodyMarkup = sectionMarkup(markup, 'tbody');
    expect(bodyMarkup).not.toContain('ink-text');
    expect(bodyMarkup).not.toContain('as made');
  });

  it('the pen announces the amount it would save for a portion field left blank', () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] }),
    ]);
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: { a: { portions: [{ step: 2, grams: '120' }, { step: 3, grams: '' }], removed: false } },
      asMade: {},
    };

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
      />,
    );

    expect(markup).toContain('aria-label="Whole milk, was 370.4 g, now 120 + 250.4 g"');
  });

  it('recording a split row renders two as-made fields with distinct accessible names', () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] }),
    ]);
    const draft = { asMade: { a: ['120', ''] } };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="recording" draft={draft} openBatch={null} />,
    );

    expect(markup).toContain('aria-label="Whole milk, as made, grams, portion 1"');
    expect(markup).toContain('aria-label="Whole milk, as made, grams, portion 2"');
  });

  it('the total row still reads the as-made total', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1), makeRow('b', 'Row B', 20, 1)]);
    // Row A's as-made (45) replaces its plan (40); Row B has no as-made
    // key, so its own plan (20) fills the gap — the as-made total is 65 g.
    const openBatch = makeBatch({ a: [45] });

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={openBatch} />);

    expect(markup).toContain('65.0 g');
  });
});

describe('IngredientTable — a blocked save marks the offending row (critique P1 #3, D-21)', () => {
  it('carries the marked-row class on exactly the blocked row and none of its neighbours', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1), makeRow('c', 'Row C', 5, 1)]);
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: {
        a: onePortionDraftRow(1, '10'),
        b: onePortionDraftRow(1, '4o'),
        c: onePortionDraftRow(1, '5'),
      },
      asMade: {},
    };

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        blockedRowId="b"
      />,
    );

    function trContaining(text) {
      const trRegex = /<tr[^>]*>[\s\S]*?<\/tr>/g;
      let match;
      while ((match = trRegex.exec(markup))) {
        if (match[0].includes(text)) return match[0];
      }
      return null;
    }

    expect(trContaining('Row A')).not.toContain('class="is-marked"');
    expect(trContaining('Row B')).toContain('class="is-marked"');
    expect(trContaining('Row C')).not.toContain('class="is-marked"');
  });

  it('carries no marked-row class at all when nothing is blocked', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1)]);
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: onePortionDraftRow(1, '10') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );

    expect(markup).not.toContain('class="is-marked"');
  });
});

describe('IngredientTable — a rejected draft grams value holds the parent share (260909-oow)', () => {
  // Three rows summing to a round 100g mass, so Row B's parent share is
  // exactly 50.0% — draftVersion is a clone of the version, unmoved by
  // the pen, so this is the "parent's own stored grams" the plan-pen
  // figures must hold at when the pen's typed value is rejected.
  function trContaining(markup, text) {
    const trRegex = /<tr[^>]*>[\s\S]*?<\/tr>/g;
    let match;
    while ((match = trRegex.exec(markup))) {
      if (match[0].includes(text)) return match[0];
    }
    return null;
  }

  function renderWithRowBGrams(rowBGrams) {
    const version = makeVersion([makeRow('a', 'Row A', 25, 1), makeRow('b', 'Row B', 50, 1), makeRow('c', 'Row C', 25, 1)]);
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: {
        a: onePortionDraftRow(1, '25'),
        b: onePortionDraftRow(1, rowBGrams),
        c: onePortionDraftRow(1, '25'),
      },
      asMade: {},
    };
    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );
    return trContaining(markup, 'Row B');
  }

  it.each(['-5', '1e3', '1.2345', '4o'])(
    'holds Row B at the parent\'s own share, 50.0%%, when the pen holds %s',
    (rejectedValue) => {
      const rowBTr = renderWithRowBGrams(rejectedValue);
      expect(rowBTr).toContain('50.0%');
      expect(rowBTr).not.toContain('trace');
      expect(rowBTr).not.toContain('1000.0%');
      expect(rowBTr).not.toContain('1.2%');
    },
  );

  it('a written zero still takes effect: Row B\'s live share reads trace, not 50.0%', () => {
    const rowBTr = renderWithRowBGrams('0');
    // The share cell legitimately carries the parent's 50.0% as a struck
    // history value alongside the live one — strip that struck span
    // before asserting on the live figure, so the assertion is about
    // what changed, not about the history the change is shown against.
    const shareCell = rowBTr.match(/<td class="ingredient-table__col-numeric">[\s\S]*?<\/td>/g)[1];
    const liveShareText = shareCell.replace(/<span class="struck-value">[^<]*<\/span>/, '');
    expect(liveShareText).toContain('trace');
    expect(liveShareText).not.toContain('50.0%');
  });

  it('a valid value still takes effect: Row B reads 25.0%', () => {
    const rowBTr = renderWithRowBGrams('25');
    expect(rowBTr).toContain('25.0%');
  });
});

describe('IngredientTable — the orphaned-row flag names a removed step by its lead-in alone (G-03-14, D-UAT-5)', () => {
  it('names the causing step by its lead-in, presenting no step number at all', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 3)]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.', removed: true }, // already removed at baseline
      { n: 2, leadIn: 'Two', instruction: 'Do two.', uses: ['a'] }, // will be removed this session
      { n: 3, leadIn: 'Three', instruction: 'Do three.' },
    ];
    const draftVersion = structuredClone(version);
    draftVersion.method[1].removed = true; // step 2 removed — orphans row a
    const penDraft = { rows: { a: onePortionDraftRow(3, '10') }, asMade: {} };
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

    expect(markup).toContain('used by Two, which is removed');
    expect(markup).not.toContain('step 1, Two');
    expect(markup).not.toContain('step 2, Two');
  });

  it('names two causing steps the same way — by lead-in alone, joined — when two removed steps orphan one row', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 3)]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.', uses: ['a'] },
      { n: 2, leadIn: 'Two', instruction: 'Do two.', uses: ['a'] },
      { n: 3, leadIn: 'Three', instruction: 'Do three.' },
    ];
    const draftVersion = structuredClone(version);
    draftVersion.method[0].removed = true; // step 1 removed
    draftVersion.method[1].removed = true; // step 2 removed — both orphan row a
    const penDraft = { rows: { a: onePortionDraftRow(3, '10') }, asMade: {} };
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

    expect(markup).toContain('used by One and Two, which are removed');
  });
});

// The total row prints its unit once, on one line, in every state (D-22,
// critique P2 #2): the struck baseline reads through the bare-number
// formatter — formatGramsValue in the pen, diff.total.fromValue in
// show-changes — never a second already-unit-suffixed string composed
// beside the current reading.
describe('IngredientTable — the total row prints its unit once (D-22, critique P2 #2)', () => {
  it('in the pen: the struck baseline carries no unit of its own, and the unit appears exactly once', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const draftVersion = makeVersion([makeRow('a', 'Row A', 48, 1)]);
    const penDraft = { rows: { a: onePortionDraftRow(1, '48') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );

    // The total's own numeric cell alone — never the aria-label, which
    // spells the unit as "grams" and would falsely inflate an " g"
    // substring count.
    const totalCellMatch = /<tfoot>[\s\S]*?<td class="ingredient-table__col-numeric">([\s\S]*?)<\/td>/.exec(markup);
    const totalCellMarkup = totalCellMatch[1];
    expect(totalCellMarkup).toContain('<span class="struck-value">40.0</span>');
    expect((totalCellMarkup.match(/ g/g) || []).length).toBe(1);
  });

  it("in show-changes: the struck baseline reads the diff's own bare fromValue, and the unit appears exactly once", () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 48, 1)]);
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(<IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" />);

    const totalCellMatch = /<tfoot>[\s\S]*?<td class="ingredient-table__col-numeric">([\s\S]*?)<\/td>/.exec(markup);
    const totalCellMarkup = totalCellMatch[1];
    expect(totalCellMarkup).toContain(`<span class="struck-value">${diff.total.fromValue}</span>`);
    expect((totalCellMarkup.match(/ g/g) || []).length).toBe(1);
  });
});


// The pen's own field count (D-01, CONTEXT.md phase boundary): amounts
// edit, the split does not — a two-portion row gets two amount fields,
// each its own accessible name, and still one selector for the row.
describe("IngredientTable — the pen's grams cell carries one field per portion, each its own accessible name", () => {
  it('renders two amount fields with distinct accessible names and one selector for a two-portion row', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', 15, 1, { portions: [{ step: 1, grams: 5 }, { step: 2, grams: 10 }] }),
    ]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.' },
      { n: 2, leadIn: 'Two', instruction: 'Do two.' },
    ];
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: { a: { portions: [{ step: 1, grams: '5' }, { step: 2, grams: '10' }], removed: false } },
      asMade: {},
    };
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

    expect(markup).toContain('aria-label="Row A, grams, portion 1"');
    expect(markup).toContain('aria-label="Row A, grams, portion 2"');
    expect((markup.match(/aria-label="Row A, grams/g) || []).length).toBe(2);
    // LD-02: zero step-choice selects anywhere, not one — the pen offers no
    // control at all to change which step a portion belongs to.
    expect((markup.match(/<select /g) || []).length).toBe(0);
  });

  it("keeps a one-portion row's field name unqualified, exactly as before", () => {
    const version = makeVersion([makeRow('a', 'Row A', 15, 1)]);
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: onePortionDraftRow(1, '15') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
      />,
    );

    expect(markup).toContain('aria-label="Row A, grams"');
    expect(markup).not.toContain('portion 1');
  });
});

// LD-01, ROADMAP Scope bullet 3: the reading state groups portions by
// step, the step's lead-in text heading each group, in ascending display
// order.
describe('IngredientTable — the reading state groups portions by step (LD-01, ROADMAP Scope bullet 3)', () => {
  it('renders one step-head per step actually used, in ascending display order, each carrying its own lead-in text', () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] }),
      makeRow('b', 'Heavy cream', 429.28, 3),
    ]);
    version.method = [
      { n: 1, leadIn: 'Warm the milk.', instruction: 'Warm.' },
      { n: 2, leadIn: 'Weigh the base.', instruction: 'Weigh.' },
      { n: 3, leadIn: 'Churn.', instruction: 'Churn.' },
    ];
    const currentStepNumbers = displayNumbers(version.method);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={currentStepNumbers} />,
    );

    // Step 1 has no portion at all, so no group-head renders for it — only
    // the two steps actually used by a portion get one, in order.
    expect(markup).not.toContain('Step 1<span');
    const step2Index = markup.indexOf('Step 2<span class="ingredient-table__step-head-lead">Weigh the base.</span>');
    const step3Index = markup.indexOf('Step 3<span class="ingredient-table__step-head-lead">Churn.</span>');
    expect(step2Index).toBeGreaterThan(-1);
    expect(step3Index).toBeGreaterThan(-1);
    expect(step2Index).toBeLessThan(step3Index);
  });

  it("prints a split ingredient's sub-line on every occurrence, in the sketch's exact format", () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] }),
      makeRow('b', 'Heavy cream', 429.28, 3),
    ]);
    version.method = [
      { n: 1, leadIn: 'Warm the milk.', instruction: 'Warm.' },
      { n: 2, leadIn: 'Weigh the base.', instruction: 'Weigh.' },
      { n: 3, leadIn: 'Churn.', instruction: 'Churn.' },
    ];
    const currentStepNumbers = displayNumbers(version.method);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={currentStepNumbers} />,
    );

    expect(markup).toContain('<span class="ingredient-table__portion-note">120 g of 370.4 g · 46.3% in all</span>');
    expect(markup).toContain('<span class="ingredient-table__portion-note">250.4 g of 370.4 g · 46.3% in all</span>');
    // The unsplit row (Heavy cream, one portion) carries no sub-line at all.
    const heavyCreamStart = markup.indexOf('Heavy cream');
    const heavyCreamCell = markup.slice(heavyCreamStart, markup.indexOf('</td>', heavyCreamStart));
    expect(heavyCreamCell).not.toContain('ingredient-table__portion-note');
  });

  it('groups a portion whose step was removed under a trailing "Unallocated" head, positioned after every numbered group, never dropped', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', 10, 1, { portions: [{ step: 1, grams: 5 }, { step: 2, grams: 5 }] }),
    ]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.' },
      { n: 2, leadIn: 'Two', instruction: 'Do two.', removed: true },
    ];
    const currentStepNumbers = displayNumbers(version.method); // 1->1; step 2 absent

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={currentStepNumbers} />,
    );

    const step1Index = markup.indexOf('Step 1<span');
    const unallocatedIndex = markup.indexOf('>Unallocated<');
    expect(step1Index).toBeGreaterThan(-1);
    expect(unallocatedIndex).toBeGreaterThan(step1Index);
    // The removed-step portion still renders, under Unallocated — never
    // silently dropped (RESEARCH.md Pitfall 4, extended from rows to
    // portions).
    const unallocatedSection = markup.slice(unallocatedIndex);
    expect(unallocatedSection).toContain('5 g of 10.0 g · 100.0% in all');
  });
});

describe('IngredientTable — the Data column head reads Source (03.3-04)', () => {
  it('renders "Source" in the reading-state header, not "Data"', () => {
    const version = makeVersion([makeRow('a', 'Whole milk', 120, 1)]);
    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" steps={version.method} />);
    expect(markup).toMatch(/<th[^>]*class="ingredient-table__col-data"[^>]*>Source<\/th>/);
    const headerRow = markup.slice(markup.indexOf('<thead>'), markup.indexOf('</thead>'));
    expect(headerRow).not.toContain('Data');
  });
});

// LD-02: the pen offers NO control anywhere to change which step a
// portion belongs to — the step-choice <select> is removed outright, not
// relocated. This is a table-wide check (every branch, not just one row),
// unlike the single-row check the "grams cell" describe block above
// already covers for its own fixture.
describe('IngredientTable — the pen renders no step-choice control anywhere (LD-02)', () => {
  it('renders zero <select> elements across a multi-row, multi-portion pen', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', 10, 1, { portions: [{ step: 1, grams: 5 }, { step: 2, grams: 5 }] }),
      makeRow('b', 'Row B', 20, 2),
    ]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.' },
      { n: 2, leadIn: 'Two', instruction: 'Do two.' },
    ];
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: {
        a: { portions: [{ step: 1, grams: '5' }, { step: 2, grams: '5' }], removed: false },
        b: onePortionDraftRow(2, '20'),
      },
      asMade: {},
    };
    const currentStepNumbers = displayNumbers(draftVersion.method);

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        steps={draftVersion.method}
        currentStepNumbers={currentStepNumbers}
      />,
    );

    expect((markup.match(/<select/g) || []).length).toBe(0);
  });
});

// RemoveRowControl's own remove/restore control (03.3-03, 03.1 Gap 1
// override): the one per-row control surviving plan 02's rebuild that
// this plan reclasses as a text control, an underline-only opt-out from
// the button/select binder.
describe('IngredientTable — the pen\'s remove/restore control carries .text-control (03.3-03, 03.1 Gap 1 override)', () => {
  it("renders RemoveRowControl's own button with className=\"text-control\"", () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1)]);
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: onePortionDraftRow(1, '10') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );

    expect(markup).toMatch(/<button type="button" class="text-control"[^>]*>remove<\/button>/);
  });
});

// blockedRowAttempt's own dependency-array wiring (WR-01) is a
// source-level property of the useEffect call itself, not something
// renderToStaticMarkup can observe: this file's own top comment already
// states it runs under node with no DOM, and moving focus is a real DOM
// effect that a static-markup render never fires. Task 2's own
// <acceptance_criteria> greps (`grep -n 'blockedRowAttempt'` /
// `grep -n '\[blockedRowId\]'` against IngredientTable.jsx) are what prove
// the fix landed — deliberately not duplicated here as a render test that
// could never actually exercise the effect.

