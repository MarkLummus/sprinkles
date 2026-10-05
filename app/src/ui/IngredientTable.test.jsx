// The show-changes state's table rendering (route-recipe-version.md § 3,
// § 6, 03-04): a comparison-of-two-versions rendering, driven entirely by
// buildDiff's own row descriptors. Renders through renderToStaticMarkup in
// the existing node Vitest environment — IngredientTable renders no links,
// so no router context is needed.
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Children } from 'react';
import { IngredientTable, IngredientsHead } from './IngredientTable.jsx';
import { buildDiff } from '../domain/diff.js';
import { displayNumbers } from '../domain/stepNumbers.js';
import { formatShareOfBatch } from '../domain/composition.js';
import { oliveOilVersion } from '../data/olive-oil.js';

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
  return { versionLabel: 'v', sheetTitle: '', sheetDescription: '', targets: {}, rows, method: [] };
}

// The pen draft's row shape (D-01, D-02; removal on the lines, plan 03.6-02):
// { portions: [{ step, grams, removed }] }, each portion's grams the raw typed
// string. For the common one-portion case, mirroring makeRow's own
// single-field ergonomics.
function onePortionDraftRow(step, grams, removed = false) {
  return { portions: [{ step, grams, removed }] };
}

// Takes one line out in a fixture the way the pen does: the draft portion's
// flag in both the pen draft and the draft version's own row (plan 03.6-02).
function setLineRemoved({ draftVersion, penDraft }, rowId, portionIndex, removed = true) {
  penDraft.rows[rowId].portions[portionIndex].removed = removed;
  draftVersion.rows.find((row) => row.id === rowId).portions[portionIndex].removed = removed;
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
    // A removed row prints its one struck old amount and no current amount
    // after it (sketch 011 decision 24).
    expect(markup).toContain('<span class="ingredient-table__plan-grams"><span class="struck-value">20 g</span></span>');
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

// A group-head <tr> carries a single colspanned <td> (Task 2) — stripped
// before counting, since its one cell would otherwise violate the
// header/body/total column-count invariant this helper checks.
function stripStepHeadRows(tbodyMarkup) {
  return tbodyMarkup.replace(/<tr class="ingredient-table__step-head">[\s\S]*?<\/tr>/g, '');
}

// Decision 15 (sketch 011, 03.5-11 Task 1): the head's first th now spans
// two body columns (the amount and the name share one "Ingredient" head),
// so a bare tag count would read the head as one column short. Weighting
// each cell by its own colSpan (default 1) is what lets the head's column
// count agree with the body's and the total row's again.
function countCells(markup, tag) {
  // `(\s[^>]*)?>` (not `[^>]*>`) so `<th` never matches `<thead`'s own
  // opening tag — the same tag-boundary the original bare countTag got via
  // `[ >]`, kept here so the colSpan attribute is still captured.
  const re = new RegExp(`<${tag}(\\s[^>]*)?>`, 'g');
  let total = 0;
  let match;
  while ((match = re.exec(markup))) {
    const spanMatch = match[1] && match[1].match(/colSpan="(\d+)"/);
    total += spanMatch ? Number(spanMatch[1]) : 1;
  }
  return total;
}

function assertCellCountsAgree(markup) {
  const headerCount = countCells(sectionMarkup(markup, 'thead'), 'th');
  const bodyCount = countCells(stripStepHeadRows(sectionMarkup(markup, 'tbody')), 'td');
  const totalCount = countCells(sectionMarkup(markup, 'tfoot'), 'td');
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

  // G-03.5-8a (03.5-22): the recording as-made field holds its own width
  // (--sheet-field-w-figure) and the live total stays out of the column's
  // content sizing, so typing never moves the As made or name column. Both
  // hooks exist in the recording state only.
  it('recording: the as-made input carries its sizing hook beside ink-field, and the tfoot total cell its live-total hook (G-03.5-8a)', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="recording" draft={{ asMade: {} }} openBatch={null} />,
    );

    expect(markup).toContain('class="ink-field ingredient-table__as-made-field"');
    const tfoot = markup.slice(markup.indexOf('<tfoot>'), markup.indexOf('</tfoot>'));
    expect(tfoot).toContain('<td class="ingredient-table__col-numeric ingredient-table__live-total">');
  });

  it("reading a saved batch carries neither recording hook (G-03.5-8a)", () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" draft={null} openBatch={makeBatch({ a: ['45'] })} />,
    );

    expect(markup).not.toContain('ingredient-table__as-made-field');
    expect(markup).not.toContain('ingredient-table__live-total');
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

  it('developing with an explicitly selected comparison batch: As made evidence is named and present', () => {
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
        comparisonBatchLabel="Compared with batch · 2 Aug 2026"
      />,
    );

    expect(markup).toContain('>As made<');
    expect(markup).toContain('<caption class="ingredient-table__comparison">Compared with batch · 2 Aug 2026</caption>');
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
    expect(markup).toContain('<span class="sheet-hand">120 g</span>');
    expect(markup).toContain('<span class="sheet-hand">263 g</span>');
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
    expect(markup).toContain('<span class="sheet-hand">120 g</span>');
    expect(markup).toContain('aria-label="Whole milk, 370.4 g, as made 120 g"');
    // The unwritten portion's own line: no as-made phrase and no ink-text —
    // full-string, so it cannot pass on a dangling accessible name either.
    expect(markup).toContain(
      'aria-label="Whole milk, 370.4 g"><td class="ingredient-table__col-grams">' +
        '<span class="ingredient-table__plan-grams">250.4 g</span></td>' +
        '<td class="ingredient-table__col-name">Whole milk' +
        '<span class="ingredient-table__portion-note">250.4 g of 370.4 g · 100.0% in all</span>' +
        '</td><td class="ingredient-table__col-numeric"></td>',
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

    expect(markup).toContain('<span class="sheet-hand">100 g</span>');
    expect(markup).toContain('<span class="sheet-hand">50 g</span>');
    expect(markup).toContain('aria-label="Row A, 170 g, as made 100 g"');
    expect(markup).toContain('aria-label="Row A, 170 g, as made 50 g"');
    expect(markup).toContain(
      'aria-label="Row A, 170 g"><td class="ingredient-table__col-grams">' +
        '<span class="ingredient-table__plan-grams">20 g</span></td>' +
        '<td class="ingredient-table__col-name">Row A' +
        '<span class="ingredient-table__portion-note">20 g of 170.0 g · 100.0% in all</span>',
    );
  });

  it('a row whose as-made key holds no written portion reads as no as-made at all', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', null, null, { portions: [{ step: 2, grams: 40 }, { step: 3, grams: 60 }] }),
    ]);
    const openBatch = makeBatch({ a: [null, null] });

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={openBatch} />);

    // Scoped to the tbody because the cell under test is a body cell. The
    // total row carries no as-made clause in this state either (nothing is
    // written, so its cell is blank); its own pins live in the describe
    // block for the blank total below.
    const bodyMarkup = sectionMarkup(markup, 'tbody');
    expect(bodyMarkup).not.toContain('ink-text');
    expect(bodyMarkup).not.toContain('as made');
    expect(sectionMarkup(markup, 'tfoot')).not.toContain('sheet-hand');
  });

  it('the pen announces the amount it would save for a portion field left blank', () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, { portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }] }),
    ]);
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: { a: { portions: [{ step: 2, grams: '120' }, { step: 3, grams: '' }] } },
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
    // The share cell is the row's only remaining col-numeric td (sketch
    // 011 Task 2: the grams field moved into the name cell's own
    // plan-grams slot, so index [0] — not [1] — is the share cell now).
    const shareCell = rowBTr.match(/<td class="ingredient-table__col-numeric">[\s\S]*?<\/td>/g)[0];
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

    // The total's own amount cell alone (sketch 011 decision 15, moved out
    // of the name cell) — the struck-then-current pair still nests inside
    // its own plan-grams slot there (sketch 011 Task 2), not a separate
    // numeric td — never the aria-label, which spells the unit as "grams"
    // and would falsely inflate an " g" substring count.
    const totalCellMatch = /<tfoot>[\s\S]*?<td class="ingredient-table__col-grams">([\s\S]*?)<\/td>/.exec(markup);
    const totalCellMarkup = totalCellMatch[1];
    expect(totalCellMarkup).toContain('<span class="struck-value">40.0</span>');
    expect((totalCellMarkup.match(/ g/g) || []).length).toBe(1);
  });

  it("in show-changes: the struck baseline reads the diff's own bare fromValue, and the unit appears exactly once", () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 48, 1)]);
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(<IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" />);

    const totalCellMatch = /<tfoot>[\s\S]*?<td class="ingredient-table__col-grams">([\s\S]*?)<\/td>/.exec(markup);
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
      rows: { a: { portions: [{ step: 1, grams: '5' }, { step: 2, grams: '10' }] } },
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

  it('groups a portion whose step is not in the method under a trailing "Unallocated" head, positioned after every numbered group, never dropped', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', 10, 1, { portions: [{ step: 1, grams: 5 }, { step: 9, grams: 5 }] }),
    ]);
    version.method = [{ n: 1, leadIn: 'One', instruction: 'Do one.' }];
    const currentStepNumbers = displayNumbers(version.method); // 1->1; step 9 is in no method

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={currentStepNumbers} />,
    );

    const step1Index = markup.indexOf('Step 1<span');
    const unallocatedIndex = markup.indexOf('>Unallocated<');
    expect(step1Index).toBeGreaterThan(-1);
    expect(unallocatedIndex).toBeGreaterThan(step1Index);
    // The portion still renders, under Unallocated — never silently dropped
    // (RESEARCH.md Pitfall 4, extended from rows to portions).
    const unallocatedSection = markup.slice(unallocatedIndex);
    expect(unallocatedSection).toContain('5 g of 10.0 g · 100.0% in all');
  });

  it('draws no line of a removed step in the reading state, and no Unallocated head for it (plan 03.6-05)', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', 10, 1, { portions: [{ step: 1, grams: 5 }, { step: 2, grams: 5 }] }),
    ]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.' },
      { n: 2, leadIn: 'Two', instruction: 'Do two.', removed: true },
    ];
    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={displayNumbers(version.method)} />,
    );

    expect(markup).not.toContain('Unallocated');
    expect(markup).not.toContain('>Two<');
    // One line left reads like a one-line row, with no portion line (Mark's List row
    // per-step-one-line-left, Mark's answer drop, 2026-10-05). This case used to pin
    // '5 g of 5.0 g · 100.0% in all'.
    expect(markup).not.toContain('ingredient-table__portion-note');
    expect(markup).toContain('aria-label="Row A, 5 g"');
    expect(sectionMarkup(markup, 'tfoot')).toContain('5.0 g');
  });
});

// Sketch 011 Task 2: every state now reads style 6 — the Data and Remove
// columns are gone outright, not just suppressed in the reading state
// (Task 1's own guard here is superseded now that recording joins it).
describe('IngredientTable — recording reads style 6 too (sketch 011 Task 2): no Grams, Source or Data column at all', () => {
  it('renders no Grams/Source/Data head, and the row carries the plan-grams span plus the as-made input', () => {
    const version = makeVersion([makeRow('a', 'Whole milk', 120, 1)]);
    const draft = { asMade: {} };
    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="recording" draft={draft} steps={version.method} />,
    );

    const headerRow = markup.slice(markup.indexOf('<thead>'), markup.indexOf('</thead>'));
    expect(headerRow).not.toContain('Grams');
    expect(headerRow).not.toContain('Source');
    expect(headerRow).not.toContain('Data');

    expect(markup).toContain(
      '<span class="ingredient-table__plan-grams">120 g</span></td><td class="ingredient-table__col-name">Whole milk',
    );
    expect(markup).toContain('aria-label="Whole milk, as made, grams"');
    expect(markup).not.toContain('ingredient-table__col-data');
    expect(markup).not.toContain('ingredient-table__col-remove');
  });
});

// Sketch 011 decisions 2, 3; D-19 (Task 1): the reading state's table takes
// style 6 — plan grams before the name, an "estimated"/"unreviewed" chip
// where Source used to be, and the batch's as-made grams written in the
// hand. Scoped to genuine reading (mode="reading", not showingChanges) —
// recording keeps its own markup until Task 2 (the test above).
describe('IngredientTable — the reading state reads in style 6 (sketch 011 decisions 2, 3; D-19)', () => {
  it('a split, estimated row with a batch in view: thead reads Ingredient/As made/% of batch, the name cell carries the plan-grams span, the chip, and the portion note, and the as-made value is written in the hand', () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, {
        portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }],
        ingredient: { composition: { fat: 1 }, basis: { fat: 'estimated' } },
      }),
      makeRow('b', 'Heavy cream', 429.28, 3),
    ]);
    version.method = [
      { n: 2, leadIn: 'Gum slurry.', instruction: 'x' },
      { n: 3, leadIn: 'Build the base.', instruction: 'x' },
    ];
    const currentStepNumbers = displayNumbers(version.method);
    const openBatch = makeBatch({ a: [120, 263] });

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        mode="reading"
        steps={version.method}
        currentStepNumbers={currentStepNumbers}
        openBatch={openBatch}
      />,
    );

    const headerRow = markup.slice(markup.indexOf('<thead>'), markup.indexOf('</thead>'));
    expect(headerRow).toContain('>Ingredient<');
    expect(headerRow).toContain('>As made<');
    expect(headerRow).toContain('>% of batch<');
    expect(headerRow).not.toContain('Grams');
    expect(headerRow).not.toContain('Source');

    expect(markup).toContain(
      '<span class="ingredient-table__plan-grams">120 g</span></td>' +
        '<td class="ingredient-table__col-name">Whole milk' +
        '<span class="target-chip ingredient-table__flag"><span class="target-chip__value">estimated</span></span>' +
        '<span class="ingredient-table__portion-note">120 g of 370.4 g · 46.3% in all</span>',
    );
    expect(markup).toContain('<span class="sheet-hand">120 g</span>');
    expect(markup).toContain('<span class="sheet-hand">263 g</span>');
    expect(markup).toContain('aria-label="Whole milk, 370.4 g, estimated, as made 120 g"');
    expect(markup).not.toContain('ingredient-table__col-data');
  });

  it('no batch in view: thead reads Ingredient/% of batch alone, the step head spans every column (three, decision 15), and no sheet-hand span renders', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    version.method = [{ n: 1, leadIn: 'Mix.', instruction: 'x' }];
    const currentStepNumbers = displayNumbers(version.method);

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        mode="reading"
        steps={version.method}
        currentStepNumbers={currentStepNumbers}
        openBatch={null}
      />,
    );

    const headerRow = markup.slice(markup.indexOf('<thead>'), markup.indexOf('</thead>'));
    expect(headerRow).toContain('>Ingredient<');
    expect(headerRow).toContain('>% of batch<');
    expect(headerRow).not.toContain('As made');
    expect(markup).toMatch(/<tr class="ingredient-table__step-head"><td colSpan="3">/);
    expect(markup).not.toContain('sheet-hand');
  });

  it('the total row: a plan-grams span holding the total then "Total", and the As made total written in the hand', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1), makeRow('b', 'Row B', 20, 1)]);
    version.method = [{ n: 1, leadIn: 'Mix.', instruction: 'x' }];
    const openBatch = makeBatch({ a: [45] });

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} openBatch={openBatch} />,
    );

    const totalRow = markup.slice(markup.indexOf('<tfoot>'), markup.indexOf('</tfoot>'));
    expect(totalRow).toContain(
      '<span class="ingredient-table__plan-grams">60.0 g</span></td><td class="ingredient-table__col-name">Total',
    );
    expect(totalRow).toContain('<span class="sheet-hand">65.0 g</span>');
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
        a: { portions: [{ step: 1, grams: '5' }, { step: 2, grams: '5' }] },
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

  // Sketch 011 decision 26: one gap span immediately before every remove or
  // restore button, so a link on the name's line stands clear of it.
  it('puts exactly one gap span immediately before every remove and restore link (sketch 011 decision 26)', () => {
    const chipless = { ingredient: { composition: { fat: 1 }, basis: { fat: 'stated' } } };
    const version = makeVersion([
      makeRow('a', 'Row A', 10, 1, chipless),
      makeRow('b', 'Row B', 20, 1, chipless),
    ]);
    const draftVersion = structuredClone(version);
    draftVersion.rows[1].portions[0].removed = true;
    const penDraft = { rows: { a: onePortionDraftRow(1, '10'), b: onePortionDraftRow(1, '20', true) }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );

    expect(markup).toMatch(/<span class="struck-value">Row B<\/span><span class="ingredient-table__remove-gap"> <\/span><button type="button" class="text-control"[^>]*>restore<\/button>/);
    const pairs = markup.match(/<span class="ingredient-table__remove-gap"> <\/span><button type="button" class="text-control"[^>]*>(remove|restore)<\/button>/g) ?? [];
    const spans = markup.match(/class="ingredient-table__remove-gap"/g) ?? [];
    const links = markup.match(/class="text-control"[^>]*>(remove|restore)<\/button>/g) ?? [];
    expect(pairs).toHaveLength(2);
    expect(spans).toHaveLength(2);
    expect(links).toHaveLength(2);
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

// Sketch 011 Task 2: every table state now reads style 6 — the pen, the
// record and show-changes join the reading state Task 1 already moved.
// Grams sits in the plan-grams slot everywhere, a changed value's parent
// amount strikes before it, remove sits after the name, and the Data and
// Remove columns are retired outright.
describe('IngredientTable — the pen reads style 6 too (sketch 011 Task 2): grams in the plan-grams slot, the struck parent before it, remove after the name', () => {
  it('a changed row: the struck parent grams sit before the plan-grams span holding the field, the estimated chip and remove come after the name, and no col-data/col-remove renders anywhere', () => {
    const version = makeVersion([
      makeRow('a', 'Graza Drizzle', 40, 8, { ingredient: { composition: { fat: 1 }, basis: { fat: 'stated' } } }),
    ]);
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: onePortionDraftRow(8, '48') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );

    const headerRow = markup.slice(markup.indexOf('<thead>'), markup.indexOf('</thead>'));
    expect(headerRow).not.toContain('Grams');
    expect(headerRow).not.toContain('Remove');
    expect(headerRow).not.toContain('Source');

    expect(markup).toContain('<span class="struck-value">40 g</span><span class="ingredient-table__plan-grams">');
    expect(markup).toContain('aria-label="Graza Drizzle, grams"');
    expect(markup).toContain('value="48"');
    expect(markup).toContain(' g</span></td><td class="ingredient-table__col-name">Graza Drizzle');
    expect(markup).toMatch(/Graza Drizzle<span class="ingredient-table__remove-gap"> <\/span><button type="button" class="text-control"[^>]*>remove<\/button>/);
    expect(markup).not.toContain('ingredient-table__col-data');
    expect(markup).not.toContain('ingredient-table__col-remove');
  });

  it('the total row strikes the parent total before the current one, inside the plan-grams slot', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const draftVersion = makeVersion([makeRow('a', 'Row A', 48, 1)]);
    const penDraft = { rows: { a: onePortionDraftRow(1, '48') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );

    const totalRow = markup.slice(markup.indexOf('<tfoot>'), markup.indexOf('</tfoot>'));
    expect(totalRow).toContain(
      '<span class="ingredient-table__plan-grams"><span class="struck-value">40.0</span>48.0 g</span>' +
        '</td><td class="ingredient-table__col-name">Total',
    );
  });
});

describe('IngredientTable — show-changes reads style 6 too (sketch 011 Task 2)', () => {
  it('a changed, single-portion row: the struck parent grams sit inside the plan-grams slot, before the current value', () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 48, 1)]);
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(<IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" />);

    expect(markup).toContain(
      '<span class="ingredient-table__plan-grams"><span class="struck-value">40 g</span>48 g</span>' +
        '</td><td class="ingredient-table__col-name">Row A',
    );
    expect(markup).not.toContain('ingredient-table__col-data');
    expect(markup).not.toContain('ingredient-table__col-remove');
  });
});

// Quick task 261001-doi: WebKit without Safari's tab-to-highlight preference
// Tabs only into text entry and into controls that carry an explicit
// tabindex — the same rule as every link, recorded in .claude/CLAUDE.md
// (the cause is spelled out in Segmented.test.jsx). Pinned on rendered
// markup: the attribute's whole effect is in the DOM WebKit reads.
describe('IngredientTable — the remove controls carry an explicit tabindex (quick task 261001-doi)', () => {
  it('one pen row renders its one remove control, tabindex="0"', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1)]);
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: onePortionDraftRow(1, '10') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );

    const tags = markup.match(/<button\b[^>]*>/g);
    expect(tags).toHaveLength(1);
    expect(tags[0]).toContain('tabindex="0"');
  });

  it('an orphaned row renders its remove control and the flag\'s remove this row, each tabindex="0"', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 3)]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.', uses: ['a'] },
      { n: 2, leadIn: 'Two', instruction: 'Do two.' },
      { n: 3, leadIn: 'Three', instruction: 'Do three.' },
    ];
    const draftVersion = structuredClone(version);
    draftVersion.method[0].removed = true;
    const penDraft = { rows: { a: onePortionDraftRow(3, '10') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(version.method)}
      />,
    );

    const tags = markup.match(/<button\b[^>]*>/g);
    expect(markup).toContain('remove this row');
    expect(tags).toHaveLength(2);
    for (const tag of tags) {
      expect(tag).toContain('tabindex="0"');
    }
  });
});

// Quick task 261004-eoi (sketch 011 decision 26; decision 33 addendum "The
// split row's remove link", Mark 2026-10-04): a split row's remove or restore
// link sits on the name's line, after the name, the estimated tag and the
// orphan flag when present, and before the portion line, which is a block
// that starts its own line under both. Only the order of the name cell's
// children is pinned here; every class, label and tabindex stays as it was.
// Decision 51 (03.6) keeps a link on every split line, each acting on its own
// line; a split line's link also carries an aria-label naming its line.
describe("IngredientTable — a split row's remove link sits on the name's line, before its portion line (261004-eoi; sketch 011 decision 26, decision 33 addendum)", () => {
  const PORTION_LINE = '120 g of 370.4 g · 46.3% in all';
  const CHIP = '<span class="target-chip ingredient-table__flag"><span class="target-chip__value">estimated</span></span>';
  const GAP = '<span class="ingredient-table__remove-gap"> </span>';

  function splitFixture() {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, {
        portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }],
        ingredient: { composition: { fat: 1 }, basis: { fat: 'estimated' } },
      }),
      makeRow('b', 'Heavy cream', 429.28, 3),
    ]);
    version.method = [
      { n: 1, leadIn: 'Gum slurry.', instruction: 'x' },
      { n: 2, leadIn: 'Warm the milk.', instruction: 'x' },
      { n: 3, leadIn: 'Build the base.', instruction: 'x' },
    ];
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: {
        a: { portions: [{ step: 2, grams: '120', removed: false }, { step: 3, grams: '250.4', removed: false }] },
        b: onePortionDraftRow(3, '429.28'),
      },
      asMade: {},
    };
    return { version, draftVersion, penDraft };
  }

  function renderPen({ version, draftVersion, penDraft }) {
    return renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(version.method)}
      />,
    );
  }

  // Every Whole milk name cell, from its opening tag to the first </td>; the
  // orphan flag is a <p> inside the cell, so the slice holds it.
  function wholeMilkCells(markup) {
    return markup.match(/<td class="ingredient-table__col-name">(?:<span class="struck-value">)?Whole milk[\s\S]*?<\/td>/g) ?? [];
  }

  it('Test A: every portion line runs name, estimated tag, gap, remove link, then the portion line, the link naming its line (sketch 011 decision 44)', () => {
    const markup = renderPen(splitFixture());
    const cells = wholeMilkCells(markup);
    const link = (step) => `<button type="button" class="text-control" tabindex="0" aria-label="remove Whole milk, Step ${step}">remove</button>`;

    expect(cells).toHaveLength(2);
    expect(cells[0]).toBe(
      '<td class="ingredient-table__col-name">Whole milk' +
        CHIP +
        GAP +
        link(2) +
        `<span class="ingredient-table__portion-note">${PORTION_LINE}</span></td>`,
    );
    expect(cells[1]).toBe(
      '<td class="ingredient-table__col-name">Whole milk' +
        CHIP +
        GAP +
        link(3) +
        '<span class="ingredient-table__portion-note">250.4 g of 370.4 g · 46.3% in all</span></td>',
    );
    // Two for Whole milk, one for Heavy cream; the one-portion row keeps its bare button.
    expect(markup.match(/>remove<\/button>/g) ?? []).toHaveLength(3);
    expect(markup.match(/class="ingredient-table__remove-gap"/g) ?? []).toHaveLength(3);
    const cream = markup.match(/<td class="ingredient-table__col-name">Heavy cream[\s\S]*?<\/td>/)[0];
    expect(cream).toBe(`<td class="ingredient-table__col-name">Heavy cream${GAP}<button type="button" class="text-control" tabindex="0">remove</button></td>`);
    expect(cream).not.toContain('aria-label');
  });

  it('Test B: a removed split row runs struck name, tag, gap, restore link, then the portion line, on every line (sketch 011 decision 44)', () => {
    const fixture = splitFixture();
    setLineRemoved(fixture, 'a', 0);
    setLineRemoved(fixture, 'a', 1);
    const cells = wholeMilkCells(renderPen(fixture));
    // Against the batch the pen opened on (799.68 g), the same basis as the struck share.
    const PORTION_LINES = ['120 g of 370.4 g · 46.3% in all', '250.4 g of 370.4 g · 46.3% in all'];

    expect(cells).toHaveLength(2);
    [2, 3].forEach((step, i) => {
      expect(cells[i]).toMatch(
        new RegExp(
          '^<td class="ingredient-table__col-name"><span class="struck-value">Whole milk</span>' +
            CHIP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            GAP +
            `<button type="button" class="text-control" tabindex="0" aria-label="restore Whole milk, Step ${step}">restore</button>` +
            `<span class="ingredient-table__portion-note">${PORTION_LINES[i]}</span></td>$`,
        ),
      );
    });
    // The struck share beside each line is the portion's share of the batch the pen opened on.
    const markup = renderPen(fixture);
    expect(markup).toContain(`<span class="struck-value">${formatShareOfBatch(120, 799.68)}</span>`);
    expect(markup).toContain(`<span class="struck-value">${formatShareOfBatch(250.4, 799.68)}</span>`);
  });

  it('Test C: an orphaned split row runs name, tag, orphan flag, gap, remove link, then the portion line on its first line only (sketch 011 decision 44)', () => {
    const fixture = splitFixture();
    fixture.version.method[0].uses = ['a'];
    fixture.draftVersion = structuredClone(fixture.version);
    fixture.draftVersion.method[0].removed = true;
    const cell = wholeMilkCells(renderPen(fixture))[0];

    const at = {
      name: cell.indexOf('Whole milk'),
      chip: cell.indexOf('target-chip'),
      flag: cell.indexOf('<p class="ingredient-table__flag">'),
      gap: cell.indexOf('class="ingredient-table__remove-gap"'),
      link: cell.indexOf('class="text-control" tabindex="0" aria-label="remove Whole milk, Step 1">remove</button>'),
      note: cell.indexOf('<span class="ingredient-table__portion-note">'),
    };
    for (const [part, index] of Object.entries(at)) expect(index, part).toBeGreaterThan(-1);
    expect(at.name).toBeLessThan(at.chip);
    expect(at.chip).toBeLessThan(at.flag);
    expect(at.flag).toBeLessThan(at.gap);
    expect(at.gap).toBeLessThan(at.link);
    expect(at.link).toBeLessThan(at.note);
    expect(cell.endsWith(`${PORTION_LINE}</span></td>`)).toBe(true);

    // The orphan flag stays on the first line; the second line has the gap and its own link.
    const second = wholeMilkCells(renderPen(fixture))[1];
    expect(second).not.toContain('<p class="ingredient-table__flag">');
    expect(second).toContain('class="ingredient-table__remove-gap"');
    expect(second.indexOf('aria-label="remove Whole milk, Step 2"')).toBeGreaterThan(-1);
    expect(second.indexOf('aria-label="remove Whole milk, Step 2"')).toBeLessThan(second.indexOf('<span class="ingredient-table__portion-note">'));
  });

  // A guard, not a change detector: a row with one portion has no portion
  // line, so its cell was name, tag, gap, link before this task and still is.
  it('Test D (guard): a non-split row with an estimated tag stays name, tag, gap, remove link, with no portion line', () => {
    const version = makeVersion([
      makeRow('c', 'Row C', 64, 3, { ingredient: { composition: { fat: 1 }, basis: { fat: 'estimated' } } }),
    ]);
    version.method = [{ n: 3, leadIn: 'Build the base.', instruction: 'x' }];
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { c: onePortionDraftRow(3, '64') }, asMade: {} };
    const markup = renderPen({ version, draftVersion, penDraft });

    const cell = markup.match(/<td class="ingredient-table__col-name">Row C[\s\S]*?<\/td>/)[0];
    expect(cell).toBe(
      '<td class="ingredient-table__col-name">Row C' +
        CHIP +
        GAP +
        '<button type="button" class="text-control" tabindex="0">remove</button></td>',
    );
    expect(cell).not.toContain('portion-note');
  });
});

// Quick task 261004-ox6 (sketch 011 decision 44 finding 1, Mark's answer 2 of
// 2026-10-04): a removed split row is outside the live batch, so its portion
// lines read its share of the batch the pen opened on, the same basis as the
// struck % of batch beside them. An active split row still reads the live batch.
describe("IngredientTable — a removed split row's portion line keeps the share it had when the pen opened (261004-ox6; sketch 011 decision 44 finding 1)", () => {
  function splitFixture() {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, {
        portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }],
        ingredient: { composition: { fat: 1 }, basis: { fat: 'estimated' } },
      }),
      makeRow('b', 'Heavy cream', 429.28, 3),
    ]);
    version.method = [
      { n: 1, leadIn: 'Gum slurry.', instruction: 'x' },
      { n: 2, leadIn: 'Warm the milk.', instruction: 'x' },
      { n: 3, leadIn: 'Build the base.', instruction: 'x' },
    ];
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: {
        a: { portions: [{ step: 2, grams: '120', removed: false }, { step: 3, grams: '250.4', removed: false }] },
        b: onePortionDraftRow(3, '429.28'),
      },
      asMade: {},
    };
    return { version, draftVersion, penDraft };
  }

  function renderPen({ version, draftVersion, penDraft }) {
    return renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(version.method)}
      />,
    );
  }

  function notes(markup) {
    return [...markup.matchAll(/<span class="ingredient-table__portion-note">([^<]*)<\/span>/g)].map((m) => m[1]);
  }

  // Heavy cream moves to 500 g in the pen; the draft's own rows carry it, as the pen's
  // handler writes both.
  function heavyCreamAt500(fixture) {
    fixture.draftVersion.rows[1].portions[0].grams = 500;
    fixture.penDraft.rows.b.portions[0].grams = '500';
  }

  it('Test F: another row changes, then Whole milk is removed: both notes keep the share of the batch the pen opened on', () => {
    const fixture = splitFixture();
    heavyCreamAt500(fixture);
    setLineRemoved(fixture, 'a', 0);
    setLineRemoved(fixture, 'a', 1);

    // 74.1% would be the live batch without the row (500 g); 46.3% is the batch it opened on.
    expect(notes(renderPen(fixture))).toEqual(['120 g of 370.4 g · 46.3% in all', '250.4 g of 370.4 g · 46.3% in all']);
  });

  it('Test G (guard): another row changes and Whole milk stays active: both notes read against the live batch', () => {
    const fixture = splitFixture();
    heavyCreamAt500(fixture);

    expect(notes(renderPen(fixture))).toEqual(['120 g of 370.4 g · 42.6% in all', '250.4 g of 370.4 g · 42.6% in all']);
  });
});

describe('IngredientTable: the As made total is blank until a value is written (quick 261001-eds)', () => {
  function tfootMarkup(markup) {
    return markup.slice(markup.indexOf('<tfoot>'), markup.indexOf('</tfoot>') + '</tfoot>'.length);
  }

  // assertCellCountsAgree above sums every body row's cells, so it only
  // holds for a one-row fixture; with two rows the head and the total row
  // are still compared one for one.
  function assertHeadAndTotalAgree(markup) {
    expect(countCells(sectionMarkup(markup, 'thead'), 'th')).toBe(countCells(sectionMarkup(markup, 'tfoot'), 'td'));
  }

  it('reading a saved batch with nothing written: the As made cell stays, empty, and the label reads the plan alone', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1), makeRow('b', 'Row B', 20, 1)]);

    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={makeBatch({})} />);

    expect(tfootMarkup(markup)).toBe(
      '<tfoot><tr aria-label="Total, plan 60.0 grams">' +
        '<td class="ingredient-table__col-grams"><span class="ingredient-table__plan-grams">60.0 g</span></td>' +
        '<td class="ingredient-table__col-name">Total</td>' +
        '<td class="ingredient-table__col-numeric"></td>' +
        '<td class="ingredient-table__col-numeric"></td>' +
        '</tr></tfoot>',
    );
    expect(tfootMarkup(markup)).not.toContain('sheet-hand');
    expect(tfootMarkup(markup)).not.toContain('as made');
    // D-05: the small print is untouched.
    expect(markup).toContain('As made totals what was written; the plan fills in where nothing was.');
    assertHeadAndTotalAgree(markup);
  });

  // The As made cell's own markup, cut from the total row: everything
  // between the "Total" name cell and the closing share cell.
  function asMadeTotalCell(markup) {
    const afterName = tfootMarkup(markup).split('<td class="ingredient-table__col-name">Total</td>')[1];
    return afterName.replace('<td class="ingredient-table__col-numeric"></td></tr></tfoot>', '');
  }

  function totalLabel(markup) {
    return tfootMarkup(markup).match(/^<tfoot><tr aria-label="([^"]*)"/)[1];
  }

  const FILLED = '<td class="ingredient-table__col-numeric"><span class="sheet-hand">65.0 g</span></td>';
  const BLANK = '<td class="ingredient-table__col-numeric"></td>';
  const FILLED_LIVE =
    '<td class="ingredient-table__col-numeric ingredient-table__live-total"><span class="sheet-hand">65.0 g</span></td>';
  const BLANK_LIVE = '<td class="ingredient-table__col-numeric ingredient-table__live-total"></td>';

  function twoRows() {
    return makeVersion([makeRow('a', 'Row A', 40, 1), makeRow('b', 'Row B', 20, 1)]);
  }

  function readingTable(asMade) {
    return renderToStaticMarkup(<IngredientTable rows={twoRows().rows} mode="reading" openBatch={makeBatch(asMade)} />);
  }

  function recordingTable(asMade) {
    return renderToStaticMarkup(
      <IngredientTable rows={twoRows().rows} mode="recording" draft={{ asMade }} openBatch={null} />,
    );
  }

  it('reading, one value written (45 on a 40 row): the total shows the as-made figure, the other row filling from the plan, with its clause', () => {
    const markup = readingTable({ a: [45] });

    expect(asMadeTotalCell(markup)).toBe(FILLED);
    expect(totalLabel(markup)).toBe('Total, plan 60.0 grams, as made 65.0 grams');
    assertHeadAndTotalAgree(markup);
  });

  it('reading, one value written that equals the plan: the total still shows (60.0 g) and keeps its clause', () => {
    const markup = readingTable({ a: [40] });

    expect(asMadeTotalCell(markup)).toBe(
      '<td class="ingredient-table__col-numeric"><span class="sheet-hand">60.0 g</span></td>',
    );
    expect(totalLabel(markup)).toBe('Total, plan 60.0 grams, as made 60.0 grams');
  });

  it('reading, a written 0 counts as written', () => {
    const markup = readingTable({ a: [0] });

    expect(asMadeTotalCell(markup)).toBe(
      '<td class="ingredient-table__col-numeric"><span class="sheet-hand">20.0 g</span></td>',
    );
    expect(totalLabel(markup)).toBe('Total, plan 60.0 grams, as made 20.0 grams');
  });

  it('reading, a key holding only null elements reads blank', () => {
    const markup = readingTable({ a: [null] });

    expect(asMadeTotalCell(markup)).toBe(BLANK);
    expect(totalLabel(markup)).toBe('Total, plan 60.0 grams');
    assertHeadAndTotalAgree(markup);
  });

  it('recording, an empty draft: the live-total cell stays with both classes and no child, and the label reads the plan alone', () => {
    const markup = recordingTable({});

    expect(asMadeTotalCell(markup)).toBe(BLANK_LIVE);
    expect(totalLabel(markup)).toBe('Total, plan 60.0 grams');
    assertHeadAndTotalAgree(markup);
  });

  it('recording, one typed string: the live-total cell holds the figure in the hand, with its clause', () => {
    const markup = recordingTable({ a: ['45'] });

    expect(asMadeTotalCell(markup)).toBe(FILLED_LIVE);
    expect(totalLabel(markup)).toBe('Total, plan 60.0 grams, as made 65.0 grams');
  });

  it('recording, a typed string equal to the plan: the cell shows', () => {
    const markup = recordingTable({ a: ['40'] });

    expect(asMadeTotalCell(markup)).toBe(
      '<td class="ingredient-table__col-numeric ingredient-table__live-total"><span class="sheet-hand">60.0 g</span></td>',
    );
    expect(totalLabel(markup)).toBe('Total, plan 60.0 grams, as made 60.0 grams');
  });

  it('recording, a lone unparseable string or an emptied field leaves the cell blank', () => {
    expect(asMadeTotalCell(recordingTable({ a: ['-'] }))).toBe(BLANK_LIVE);
    expect(asMadeTotalCell(recordingTable({ a: [''] }))).toBe(BLANK_LIVE);
    expect(totalLabel(recordingTable({ a: ['-'] }))).toBe('Total, plan 60.0 grams');
  });

  describe('show-changes (parent 40, current 48)', () => {
    function showChangesTable(asMade) {
      const baseline = makeVersion([makeRow('a', 'Row A', 40, 1)]);
      const current = makeVersion([makeRow('a', 'Row A', 48, 1)]);
      const diff = buildDiff(current, baseline);
      return renderToStaticMarkup(
        <IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" openBatch={makeBatch(asMade)} />,
      );
    }

    it('with nothing written: the plan cell is struck then current, and the As made cell is empty', () => {
      const markup = showChangesTable({});

      expect(tfootMarkup(markup)).toContain(
        '<span class="ingredient-table__plan-grams"><span class="struck-value">40.0</span>48.0 g</span>',
      );
      expect(asMadeTotalCell(markup)).toBe(BLANK);
      expect(totalLabel(markup)).toBe('Total, plan was 40.0 grams, now 48.0 grams');
      assertCellCountsAgree(markup);
    });

    it('with a value written: the As made cell shows it', () => {
      const markup = showChangesTable({ a: [45] });

      expect(asMadeTotalCell(markup)).toBe(
        '<td class="ingredient-table__col-numeric"><span class="sheet-hand">45.0 g</span></td>',
      );
      assertCellCountsAgree(markup);
    });
  });
});

// Quick task 261002-wdn (Mark, 2026-10-02, option 1): a lone "Unallocated"
// head labels nothing, so it is hidden when it is the only group; it stays
// whenever a numbered group sits beside it. Coconut v1 and v2 assign every
// portion to step 1 but carry an empty method, so no step resolves and every
// portion lands in that one group. Heads are counted by the exact class with
// its closing quote, so the "-lead" span is not counted.
describe('IngredientTable — a lone Unallocated group renders no step head (261002-wdn)', () => {
  const STEP_HEAD = 'class="ingredient-table__step-head"';
  const countStepHeads = (markup) => markup.split(STEP_HEAD).length - 1;
  const countTrs = (markup) => (markup.match(/<tr[ >]/g) || []).length;

  it('A: reading with every portion unresolved renders no step head, yet every row and the Total', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1)]);

    for (const currentStepNumbers of [displayNumbers([]), undefined]) {
      const markup = renderToStaticMarkup(
        <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={currentStepNumbers} />,
      );

      expect(countStepHeads(markup)).toBe(0);
      expect(markup).not.toContain('Unallocated');
      const tbody = sectionMarkup(markup, 'tbody');
      expect(countTrs(tbody)).toBe(2);
      expect(tbody).toContain('Row A');
      expect(tbody).toContain('Row B');
      expect(sectionMarkup(markup, 'tfoot')).toContain('Total');
    }
  });

  it('B: Show changes with every portion unresolved renders no step head, and the struck figure still renders', () => {
    const baseline = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1)]);
    const current = makeVersion([makeRow('a', 'Row A', 12, 1), makeRow('b', 'Row B', 20, 1)]);
    const diff = buildDiff(current, baseline);

    const markup = renderToStaticMarkup(
      <IngredientTable rows={current.rows} diff={diff} showingChanges mode="reading" steps={current.method} currentStepNumbers={displayNumbers([])} />,
    );

    expect(countStepHeads(markup)).toBe(0);
    expect(markup).not.toContain('Unallocated');
    expect(markup).toContain('struck-value');
    expect(countTrs(sectionMarkup(markup, 'tbody'))).toBe(2);
  });

  it('C: the pen with every portion on a step that is not in the method renders no step head, and one grams field per portion', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1)]);
    version.method = [{ n: 2, leadIn: 'Two', instruction: 'Do two.' }];
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: onePortionDraftRow(1, '10'), b: onePortionDraftRow(1, '20') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
      />,
    );

    expect(countStepHeads(markup)).toBe(0);
    expect(markup).not.toContain('Unallocated');
    expect(markup).toContain('aria-label="Row A, grams"');
    expect(markup).toContain('aria-label="Row B, grams"');
    expect((sectionMarkup(markup, 'tbody').match(/<input /g) || []).length).toBe(2);
  });

  it('C2: a lone Removed group keeps its head, because it says what the struck lines are (plan 03.6-05)', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 1)]);
    version.method = [{ n: 1, leadIn: 'One', instruction: 'Do one.', removed: true }];
    const draftVersion = structuredClone(version);
    const penDraft = { rows: { a: onePortionDraftRow(1, '10'), b: onePortionDraftRow(1, '20') }, asMade: {} };

    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
      />,
    );

    expect(countStepHeads(markup)).toBe(1);
    expect(markup).toContain('Removed<span class="ingredient-table__step-head-lead">One</span>');
    expect(markup).not.toContain('Unallocated');
    // Struck, with the grams field still present and no remove or restore control.
    const tbody = sectionMarkup(markup, 'tbody');
    expect(tbody).toContain('<span class="struck-value">Row A</span>');
    expect(tbody).toContain('<span class="struck-value">Row B</span>');
    expect(tbody).not.toContain('<button');
    expect((tbody.match(/<input /g) || []).length).toBe(2);
  });

  it('D (guard): a table mixing a numbered group and Unallocated keeps both heads, in reading and in the pen', () => {
    const version = makeVersion([
      makeRow('a', 'Row A', 10, 1, { portions: [{ step: 1, grams: 5 }, { step: 9, grams: 5 }] }),
    ]);
    version.method = [{ n: 1, leadIn: 'One', instruction: 'Do one.' }];
    const currentStepNumbers = displayNumbers(version.method);

    const reading = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={currentStepNumbers} />,
    );
    expect(countStepHeads(reading)).toBe(2);
    expect(reading.indexOf('Step 1<span')).toBeGreaterThan(-1);
    expect(reading.indexOf('>Unallocated<')).toBeGreaterThan(reading.indexOf('Step 1<span'));

    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: { a: { portions: [{ step: 1, grams: '5' }, { step: 9, grams: '5' }] } },
      asMade: {},
    };
    const pen = renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
      />,
    );
    expect(countStepHeads(pen)).toBe(2);
    expect(pen.indexOf('>Unallocated<')).toBeGreaterThan(pen.indexOf('Step 1<span'));
  });

  it('E (guard): a table with only numbered groups keeps one head per group and no Unallocated', () => {
    const version = makeVersion([makeRow('a', 'Row A', 10, 1), makeRow('b', 'Row B', 20, 2)]);
    version.method = [
      { n: 1, leadIn: 'One', instruction: 'Do one.' },
      { n: 2, leadIn: 'Two', instruction: 'Do two.' },
    ];

    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="reading" steps={version.method} currentStepNumbers={displayNumbers(version.method)} />,
    );

    expect(countStepHeads(markup)).toBe(2);
    expect(markup).toContain('Step 1<span class="ingredient-table__step-head-lead">One</span>');
    expect(markup).toContain('Step 2<span class="ingredient-table__step-head-lead">Two</span>');
    expect(markup).not.toContain('Unallocated');
  });
});

// Plan 03.6-05 (sketch 011 decision 51, Mark's answer 2, 2026-10-05): a removed
// step's lines form a 'Removed' group headed with the step's lead-in, in the
// step's own place, struck, with no remove or restore control.
describe('IngredientTable — a removed step\'s lines sit under a Removed head in the step\'s place (plan 03.6-05)', () => {
  function penFor(method, row) {
    const version = makeVersion([row]);
    version.method = method;
    const draftVersion = structuredClone(version);
    const penDraft = {
      rows: { [row.id]: { portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams), removed: false })) } },
      asMade: {},
    };
    return renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        steps={version.method}
        currentStepNumbers={displayNumbers(draftVersion.method)}
      />,
    );
  }
  const headLine = (markup) => [...markup.matchAll(/<tr class="ingredient-table__step-head"><td colSpan="\d+">(.*?)<\/td>/g)].map((match) => match[1].replace(/<[^>]*>/g, '|').replace(/\|+/g, '|'));

  it('sorts two removed steps in method order, each at its own place', () => {
    const row = makeRow('a', 'Row A', 20, 1, {
      portions: [{ step: 1, grams: 5 }, { step: 2, grams: 5 }, { step: 3, grams: 5 }, { step: 4, grams: 5 }],
    });
    const markup = penFor(
      [
        { n: 1, leadIn: 'One', instruction: '.' },
        { n: 2, leadIn: 'Two', instruction: '.', removed: true },
        { n: 3, leadIn: 'Three', instruction: '.' },
        { n: 4, leadIn: 'Four', instruction: '.', removed: true },
      ],
      row,
    );

    expect(headLine(markup)).toEqual(['Step 1|One|', 'Removed|Two|', 'Step 2|Three|', 'Removed|Four|']);
  });

  it('prints a removed step\'s lead-in as text, never as markup', () => {
    const row = makeRow('a', 'Row A', 10, 1, { portions: [{ step: 1, grams: 5 }, { step: 2, grams: 5 }] });
    const markup = penFor(
      [
        { n: 1, leadIn: 'One', instruction: '.' },
        { n: 2, leadIn: '<b>x</b>', instruction: '.', removed: true },
      ],
      row,
    );

    expect(markup).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(markup).not.toContain('<b>x</b>');
  });

  it('draws the line under a removed step struck with no control, and its sibling in an active step with one', () => {
    const row = makeRow('a', 'Row A', 10, 1, { portions: [{ step: 1, grams: 5 }, { step: 2, grams: 5 }] });
    const markup = penFor(
      [
        { n: 1, leadIn: 'One', instruction: '.' },
        { n: 2, leadIn: 'Two', instruction: '.', removed: true },
      ],
      row,
    );

    const tbody = sectionMarkup(markup, 'tbody');
    expect((tbody.match(/<button/g) || []).length).toBe(1);
    expect(tbody).toContain('aria-label="remove Row A, Step 1"');
    expect(tbody).not.toContain('Row A, Step 2');
    expect(tbody).toContain('<span class="struck-value">Row A</span>');
    expect(tbody).toContain('5 g of 5.0 g · 100.0% in all');
  });
});

// Quick task 261002-wn1: below 724 Show changes sits on the Ingredients
// heading row (sketch 011 decision 30 addendum, option 3; boards
// 393-show-changes-head.html and 723-show-changes-head.html). The component is
// hook-free and takes the width signal as a boolean, so both placements render
// here with no matchMedia.
describe('IngredientsHead — the Ingredients heading, with Show changes below 724 (261002-wn1)', () => {
  const PLAIN = '<h2 class="region-name">Ingredients</h2>';
  const headWith = (label) =>
    `<div class="ingredient-table-region__head"><h2 class="region-name">Ingredients</h2><button type="button" class="text-control" tabindex="0">${label}</button></div>`;
  const props = (overrides = {}) => ({
    parentVersion: { id: 'p' },
    openPen: null,
    below724: true,
    showingChanges: false,
    onToggleShowChanges: () => {},
    ...overrides,
  });
  const render = (overrides) => renderToStaticMarkup(<IngredientsHead {...props(overrides)} />);

  it('renders the board\'s head row byte for byte with Show changes (Test A)', () => {
    expect(render()).toBe(headWith('Show changes'));
  });

  it('reads Hide changes while changes are shown, and carries no aria-pressed (Test B)', () => {
    const markup = render({ showingChanges: true });
    expect(markup).toBe(headWith('Hide changes'));
    expect(markup).not.toContain('aria-pressed');
  });

  it('is the plain Ingredients heading for a first version (Test C)', () => {
    expect(render({ parentVersion: null })).toBe(PLAIN);
  });

  it('is the plain Ingredients heading while any pen is open (Test D)', () => {
    for (const openPen of ['plan', 'record', 'amend']) {
      expect(render({ openPen })).toBe(PLAIN);
    }
  });

  it('is the plain Ingredients heading from 724 up, in both states (Test E)', () => {
    expect(render({ below724: false })).toBe(PLAIN);
    expect(render({ below724: false, showingChanges: true })).toBe(PLAIN);
  });

  it('hands its button the very handler it was given (Test F)', () => {
    const onToggleShowChanges = () => {};
    const element = IngredientsHead(props({ onToggleShowChanges }));
    const button = Children.toArray(element.props.children).find((child) => child.type === 'button');
    expect(button.props.onClick).toBe(onToggleShowChanges);
  });
});

// 261004-ox8 (sketch 011 decisions 31, 32 and 33 brief (c)): the table's class says whether the
// As made layer is in view, so the D3 grid from 724 up can pick its four tracks (As made first)
// or its three. The class is set exactly when hasAsMadeLayer is, and the pen with no batch in
// view keeps its own class alone.
describe('IngredientTable — the table class carries ingredient-table--as-made exactly when the As made layer is in view (261004-ox8)', () => {
  const tableClass = (markup) => markup.match(/<table class="([^"]*)"/)[1];

  it('reading with no batch in view: the plain class', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={null} />);
    expect(tableClass(markup)).toBe('ingredient-table');
  });

  it('reading with a saved batch in view: the modifier follows the base class', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const markup = renderToStaticMarkup(<IngredientTable rows={version.rows} mode="reading" openBatch={makeBatch()} />);
    expect(tableClass(markup)).toBe('ingredient-table ingredient-table--as-made');
  });

  it('recording a batch: the modifier is present', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} mode="recording" draft={{ asMade: {} }} openBatch={null} />,
    );
    expect(tableClass(markup)).toContain('ingredient-table--as-made');
  });

  it('the Next version pen with no batch in view: is-developing alone (guard, passes before and after)', () => {
    const version = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const draftVersion = makeVersion([makeRow('a', 'Row A', 40, 1)]);
    const penDraft = { rows: { a: onePortionDraftRow(1, '40') }, asMade: {} };
    const markup = renderToStaticMarkup(
      <IngredientTable rows={version.rows} draftVersion={draftVersion} mode="developing" penDraft={penDraft} openBatch={null} />,
    );
    expect(tableClass(markup)).toBe('ingredient-table is-developing');
  });
});

// Phase 03.6 plan 02 (sketch 011 decision 51, Mark's answer 1 of 2026-10-05): in
// the pen each line of a split ingredient reads on its own, through the draft
// portion's flag alone. The five pen states of the decision 51 board, against
// the Olive Oil seed, quoting the figures .planning/canvas-generators/
// perstep-capture.json measured on the board.
describe('IngredientTable — each pen line reads on its own, to the figures decision 51 measured (03.6-02)', () => {
  function oliveFixture() {
    const version = structuredClone(oliveOilVersion);
    const draftVersion = structuredClone(version);
    const penDraft = { rows: {}, asMade: {} };
    for (const row of draftVersion.rows) {
      row.portions.forEach((portion) => {
        portion.removed = false;
      });
      penDraft.rows[row.id] = {
        portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams), removed: false })),
      };
    }
    return { version, draftVersion, penDraft };
  }

  // The pen's own handler writes the typed string to the draft and its parsed
  // number to the draft version; this does the same for one line.
  function setLineGrams({ draftVersion, penDraft }, rowId, portionIndex, grams) {
    penDraft.rows[rowId].portions[portionIndex].grams = String(grams);
    draftVersion.rows.find((row) => row.id === rowId).portions[portionIndex].grams = grams;
  }

  function renderPen({ version, draftVersion, penDraft }) {
    return renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineStepNumbers={displayNumbers(version.method)}
      />,
    );
  }

  // One entry per body line of an ingredient, read off the markup: whether its
  // name is struck, its control's label, its portion note, and its share cell.
  function linesOf(markup, name) {
    const body = markup.slice(markup.indexOf('<tbody>'), markup.indexOf('</tbody>'));
    const lines = [];
    for (const [tr] of body.matchAll(/<tr\b[^>]*>(?:(?!<\/tr>)[\s\S])*<\/tr>/g)) {
      const nameCell = tr.match(/<td class="ingredient-table__col-name">([\s\S]*?)<\/td>/)?.[1];
      if (!nameCell || !(nameCell.startsWith(name) || nameCell.startsWith(`<span class="struck-value">${name}</span>`))) continue;
      const cells = [...tr.matchAll(/<td class="ingredient-table__col-numeric">([\s\S]*?)<\/td>/g)];
      lines.push({
        struck: nameCell.startsWith('<span class="struck-value">'),
        control: nameCell.match(/aria-label="([^"]*)"/)?.[1],
        note: nameCell.match(/<span class="ingredient-table__portion-note">([^<]*)<\/span>/)?.[1],
        share: cells[cells.length - 1][1],
      });
    }
    return lines;
  }

  function totalOf(markup) {
    const tfoot = markup.slice(markup.indexOf('<tfoot>'));
    return tfoot.match(/<span class="ingredient-table__plan-grams">([\s\S]*?)<\/span><\/td>/)[1];
  }

  const struck = (text) => `<span class="struck-value">${text}</span>`;

  it('resting: nothing struck, the total and every line read against the whole batch', () => {
    const markup = renderPen(oliveFixture());

    expect(totalOf(markup)).toBe('799.7 g');
    expect(linesOf(markup, 'Whole milk').map((line) => line.note)).toEqual([
      '120 g of 370.4 g · 46.3% in all',
      '250.4 g of 370.4 g · 46.3% in all',
    ]);
    expect(linesOf(markup, 'Sucrose').map((line) => line.note)).toEqual([
      '12 g of 76.0 g · 9.5% in all',
      '64 g of 76.0 g · 9.5% in all',
    ]);
    expect(linesOf(markup, 'Whole milk').map((line) => line.struck)).toEqual([false, false]);
  });

  it('Step 2 milk line out: that line strikes alone, the Step 3 line reads the lines still in', () => {
    const fixture = oliveFixture();
    setLineRemoved(fixture, 'row-01', 0);
    const markup = renderPen(fixture);
    const [two, three] = linesOf(markup, 'Whole milk');

    expect(totalOf(markup)).toBe(`${struck('799.7')}679.7 g`);
    expect(two).toEqual({
      struck: true,
      control: 'restore Whole milk, Step 2',
      note: '120 g of 370.4 g · 46.3% in all',
      share: struck('15.0%'),
    });
    expect(three).toEqual({
      struck: false,
      control: 'remove Whole milk, Step 3',
      note: '250.4 g of 250.4 g · 36.8% in all',
      share: `${struck('31.3%')}36.8%`,
    });
    expect(linesOf(markup, 'Sucrose').map((line) => line.note)).toEqual([
      '12 g of 76.0 g · 11.2% in all',
      '64 g of 76.0 g · 11.2% in all',
    ]);
  });

  it('both milk lines out: both strike and offer restore, and read the batch the pen opened on', () => {
    const fixture = oliveFixture();
    setLineRemoved(fixture, 'row-01', 0);
    setLineRemoved(fixture, 'row-01', 1);
    const markup = renderPen(fixture);
    const lines = linesOf(markup, 'Whole milk');

    expect(totalOf(markup)).toBe(`${struck('799.7')}429.3 g`);
    expect(lines.map((line) => line.struck)).toEqual([true, true]);
    expect(lines.map((line) => line.control)).toEqual(['restore Whole milk, Step 2', 'restore Whole milk, Step 3']);
    expect(lines.map((line) => line.note)).toEqual([
      '120 g of 370.4 g · 46.3% in all',
      '250.4 g of 370.4 g · 46.3% in all',
    ]);
    expect(linesOf(markup, 'Sucrose').map((line) => line.note)).toEqual([
      '12 g of 76.0 g · 17.7% in all',
      '64 g of 76.0 g · 17.7% in all',
    ]);
  });

  it('only the Step 3 milk line out: the Step 2 line reads itself alone and its share moves', () => {
    const fixture = oliveFixture();
    setLineRemoved(fixture, 'row-01', 1);
    const markup = renderPen(fixture);
    const [two, three] = linesOf(markup, 'Whole milk');

    expect(totalOf(markup)).toBe(`${struck('799.7')}549.3 g`);
    expect(two.note).toBe('120 g of 120.0 g · 21.8% in all');
    expect(two.share).toBe(`${struck('15.0%')}21.8%`);
    expect(two.struck).toBe(false);
    expect(three.note).toBe('250.4 g of 370.4 g · 46.3% in all');
    expect(three.struck).toBe(true);
  });

  it("Step 2's milk amount 120 to 100 with nothing removed: both lines read the new 350.4 g, no stale figure prints", () => {
    const fixture = oliveFixture();
    setLineGrams(fixture, 'row-01', 0, 100);
    const markup = renderPen(fixture);

    expect(totalOf(markup)).toBe(`${struck('799.7')}779.7 g`);
    expect(linesOf(markup, 'Whole milk').map((line) => line.note)).toEqual([
      '100 g of 350.4 g · 44.9% in all',
      '250.4 g of 350.4 g · 44.9% in all',
    ]);
    expect(markup).not.toContain('370.4 g · 47.5%');
    expect(markup).not.toContain('47.5% in all');
  });

  it('a split row whose first line is out and which an orphan flag names prints the flag once, on the second line', () => {
    const version = makeVersion([
      makeRow('a', 'Whole milk', null, null, {
        portions: [{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }],
        ingredient: { composition: { fat: 1 }, basis: { fat: 'estimated' } },
      }),
    ]);
    version.method = [
      { n: 1, leadIn: 'Gum slurry.', instruction: 'x', uses: ['a'] },
      { n: 2, leadIn: 'Warm the milk.', instruction: 'x' },
      { n: 3, leadIn: 'Build the base.', instruction: 'x' },
    ];
    const draftVersion = structuredClone(version);
    draftVersion.method[0].removed = true;
    const penDraft = {
      rows: { a: { portions: [{ step: 2, grams: '120', removed: false }, { step: 3, grams: '250.4', removed: false }] } },
      asMade: {},
    };
    const fixture = { version, draftVersion, penDraft };
    setLineRemoved(fixture, 'a', 0);
    const markup = renderPen(fixture);
    const cells = markup.match(/<td class="ingredient-table__col-name">(?:<span class="struck-value">)?Whole milk[\s\S]*?<\/td>/g);

    expect(cells).toHaveLength(2);
    expect(markup.match(/<p class="ingredient-table__flag">/g) ?? []).toHaveLength(1);
    expect(cells[0]).not.toContain('<p class="ingredient-table__flag">');
    expect(cells[1]).toContain('<p class="ingredient-table__flag">');
  });
});

// Phase 03.6 plan 03 (T-03.6-06, decision 7): recording and a saved batch's reading
// receive the stored rows, and an as-made value stays on the line it was typed
// against by stored position when another line of the row is out. Alignment only:
// nothing here counts a row's as-made fields or says whether a line that is out has one.
describe('IngredientTable — as made stays on its own line when a line is out (plan 03.6-03)', () => {
  function versionWithMilkStepTwoOut() {
    const version = structuredClone(oliveOilVersion);
    version.rows.find((row) => row.id === 'row-01').portions[0].removed = true;
    return version;
  }

  function table(mode, version, extra) {
    return renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        steps={version.method}
        currentStepNumbers={displayNumbers(version.method)}
        mode={mode}
        {...extra}
      />,
    );
  }

  it('recording: the value typed against Whole milk\'s Step 3 line sits in its field by stored position, and the as-made total reads it', () => {
    const version = versionWithMilkStepTwoOut();
    const markup = table('recording', version, { draft: { asMade: { 'row-01': ['', '250'] } }, openBatch: null });

    expect(markup).toMatch(/<input[^>]*aria-label="Whole milk, as made, grams, portion 2" value="250"\/>/);
    expect(markup).toContain('aria-label="Total, plan 679.7 grams, as made 679.3 grams"');
    expect(markup).toContain('<span class="sheet-hand">679.3 g</span>');
    // Sucrose is untouched: both of its fields are still named by their own portion.
    expect(markup).toContain('aria-label="Sucrose, as made, grams, portion 1"');
    expect(markup).toContain('aria-label="Sucrose, as made, grams, portion 2"');
  });

  it('reading a saved batch: the value stored at index 1 reads on the line stored at index 1', () => {
    const version = versionWithMilkStepTwoOut();
    const markup = table('reading', version, { openBatch: makeBatch({ 'row-01': ['', 250] }) });

    const milk = markup.match(/<tr[^>]*aria-label="Whole milk[^"]*"[^>]*>[\s\S]*?<\/tr>/g);
    expect(milk).toHaveLength(1);
    expect(milk[0]).toContain('<span class="sheet-hand">250 g</span>');
    expect(milk[0]).toContain('aria-label="Whole milk, 250.4 g, estimated, as made 250 g"');
    expect(markup).toContain('aria-label="Total, plan 679.7 grams, as made 679.3 grams"');
  });
});

// Show changes over a saved child with a line out (sketch 011 decision 51,
// brief item d; Mark's answer 3): a line that is out reads the figures of the
// parent it was compared with, never the new batch it was not in.
describe('IngredientTable — show changes reads a line that is out against the parent (03.6-04)', () => {
  function showChanges(edit) {
    const parent = structuredClone(oliveOilVersion);
    const child = structuredClone(oliveOilVersion);
    edit(child);
    const markup = renderToStaticMarkup(
      <IngredientTable
        rows={child.rows}
        diff={buildDiff(child, parent)}
        baselineVersion={parent}
        showingChanges
        mode="reading"
        steps={child.method}
        currentStepNumbers={displayNumbers(child.method)}
      />,
    );
    return markup;
  }

  // Each <tr> of the body that names the ingredient, in table order.
  function linesOf(markup, name) {
    const body = markup.split('<tbody>')[1].split('</tbody>')[0];
    return body.split('<tr').filter((tr) => tr.includes(`aria-label="${name}`));
  }

  const note = (tr) => tr.match(/ingredient-table__portion-note">([^<]*)</)[1];
  const lastCell = (tr) => tr.split('<td class="ingredient-table__col-numeric">').pop().split('</td>')[0];
  const gramsCell = (tr) => tr.split('<td class="ingredient-table__col-grams">')[1].split('</td>')[0];
  const nameCell = (tr) => tr.split('<td class="ingredient-table__col-name">')[1].split('</td>')[0];
  const totalCell = (markup) => markup.split('<tfoot>')[1].split('</td>')[0];

  it('one line out: the Step 2 milk line strikes its name, amount and share against the parent, and the line left reads over the new batch', () => {
    const markup = showChanges((child) => {
      child.rows.find((row) => row.id === 'row-01').portions[0].removed = true;
    });
    const [stepTwo, stepThree] = linesOf(markup, 'Whole milk');

    expect(nameCell(stepTwo)).toContain('<span class="struck-value">Whole milk</span>');
    expect(gramsCell(stepTwo)).toBe('<span class="ingredient-table__plan-grams"><span class="struck-value">120 g</span></span>');
    expect(lastCell(stepTwo)).toBe('<span class="struck-value">15.0%</span>');
    expect(note(stepTwo)).toBe('120 g of 370.4 g · 46.3% in all');

    expect(nameCell(stepThree)).not.toContain('struck-value');
    expect(note(stepThree)).toBe('250.4 g of 250.4 g · 36.8% in all');
    expect(lastCell(stepThree)).toBe('<span class="struck-value">31.3%</span>36.8%');

    for (const tr of linesOf(markup, 'Sucrose')) expect(note(tr)).toMatch(/ of 76\.0 g · 11\.2% in all$/);
    expect(totalCell(markup)).toContain('<span class="struck-value">799.7</span>679.7 g');
  });

  it('both lines out: each reads the parent, the shares strike alone, and the build print\'s wrong figures never appear', () => {
    const markup = showChanges((child) => {
      const milk = child.rows.find((row) => row.id === 'row-01');
      milk.portions[0].removed = true;
      milk.portions[1].removed = true;
    });
    const [stepTwo, stepThree] = linesOf(markup, 'Whole milk');

    expect(note(stepTwo)).toBe('120 g of 370.4 g · 46.3% in all');
    expect(note(stepThree)).toBe('250.4 g of 370.4 g · 46.3% in all');
    expect(lastCell(stepTwo)).toBe('<span class="struck-value">15.0%</span>');
    expect(lastCell(stepThree)).toBe('<span class="struck-value">31.3%</span>');
    expect(markup).not.toContain('86.3%');
    expect(markup).not.toContain('28.0%');
    expect(markup).not.toContain('58.3%');
  });

  it('names the edited line with its own was and now, and the removed line with its from-amount and "removed" last', () => {
    const edited = showChanges((child) => {
      child.rows.find((row) => row.id === 'row-01').portions[0].grams = 100;
    });
    const [editedLine] = linesOf(edited, 'Whole milk');
    expect(editedLine).toContain('aria-label="Whole milk, was 120 g, now 100 g, was 15.0%, now 12.8%, estimated"');

    const removed = showChanges((child) => {
      child.rows.find((row) => row.id === 'row-01').portions[0].removed = true;
    });
    const [removedLine] = linesOf(removed, 'Whole milk');
    const label = removedLine.match(/aria-label="([^"]*)"/)[1];
    expect(label).toContain('was 120 g');
    expect(label.endsWith('removed')).toBe(true);
  });
});

// Mark's List row per-step-one-line-left, Mark's answer drop (2026-10-05); sketch 011
// README decision 51's "Not drawn" paragraph; 03.6-CONFORMANCE.md "Open for Mark" item 1.
// In the reading Sheet (and so in print), a split ingredient with exactly one line still
// in reads like a one-line row: no portion line, plain accessible name.
describe('IngredientTable — a split ingredient with one line left reads like a one-line row (Mark\'s List per-step-one-line-left: drop)', () => {
  function table(mode, version, extra) {
    return renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        steps={version.method}
        currentStepNumbers={displayNumbers(version.method)}
        mode={mode}
        {...extra}
      />,
    );
  }

  // Each <tr> of the body that names the ingredient, in table order.
  function linesOf(markup, name) {
    const body = markup.split('<tbody>')[1].split('</tbody>')[0];
    return body.split('<tr').filter((tr) => tr.includes(`aria-label="${name}`));
  }

  const note = (tr) => tr.match(/ingredient-table__portion-note">([^<]*)</)[1];

  function milkStepTwoOut() {
    const version = structuredClone(oliveOilVersion);
    version.rows.find((row) => row.id === 'row-01').portions[0].removed = true;
    return version;
  }

  it('reading, milk\'s Step 2 line out: Whole milk draws once with its name and chip only, and Sucrose keeps both portion lines', () => {
    const markup = table('reading', milkStepTwoOut());
    const milk = linesOf(markup, 'Whole milk');

    expect(milk).toHaveLength(1);
    expect(milk[0]).toContain('aria-label="Whole milk, 250.4 g, estimated"');
    expect(milk[0]).toContain(
      '<td class="ingredient-table__col-name">Whole milk<span class="target-chip ingredient-table__flag"><span class="target-chip__value">estimated</span></span></td>',
    );
    expect(markup).not.toContain('250.4 g of 250.4 g');
    expect(linesOf(markup, 'Sucrose').map(note)).toEqual([
      '12 g of 76.0 g · 11.2% in all',
      '64 g of 76.0 g · 11.2% in all',
    ]);
  });

  it('reading, Gum slurry (step 2) removed: Whole milk and Sucrose each read as one line with no portion line', () => {
    const version = structuredClone(oliveOilVersion);
    version.method.find((step) => step.n === 2).removed = true;
    const markup = table('reading', version);
    const milk = linesOf(markup, 'Whole milk');
    const sucrose = linesOf(markup, 'Sucrose');

    expect(milk).toHaveLength(1);
    expect(sucrose).toHaveLength(1);
    expect(milk[0]).not.toContain('ingredient-table__portion-note');
    expect(sucrose[0]).not.toContain('ingredient-table__portion-note');
    expect(markup).not.toContain('250.4 g of 250.4 g');
    expect(markup).not.toContain('64 g of 64.0 g');
  });

  it('guard, reading, every line in: both Whole milk lines keep their portion lines', () => {
    const markup = table('reading', structuredClone(oliveOilVersion));

    expect(linesOf(markup, 'Whole milk').map(note)).toEqual([
      '120 g of 370.4 g · 46.3% in all',
      '250.4 g of 370.4 g · 46.3% in all',
    ]);
  });

  // This pins only that the quick leaves recording as built. Open for Mark item 2 (as made
  // while recording, with a line out) is undecided, so this pin may change when Mark decides it.
  it('guard, recording, milk\'s Step 2 line out: the portion line and the as-made field name stay as built', () => {
    const markup = table('recording', milkStepTwoOut(), { draft: { asMade: {} }, openBatch: null });
    const milk = linesOf(markup, 'Whole milk');

    expect(milk).toHaveLength(1);
    expect(note(milk[0])).toBe('250.4 g of 250.4 g · 36.8% in all');
    expect(markup).toContain('aria-label="Whole milk, as made, grams, portion 2"');
  });
});

// Mark's List row per-step-open-pen-with-line-out, Mark's answer fix (2026-10-05);
// 03.6-REVIEW.md WR-02 and WR-03; 03.6-VERIFICATION.md advisory. A line already out when
// the pen opened has no share in the version the pen opened on, so it reads the parent's
// figures; a line pressed out in this session was in at open and reads the version the pen
// opened on, as before.
describe('IngredientTable — a pen opened on a version with a line already out reads the parent\'s figures (Mark\'s List per-step-open-pen-with-line-out)', () => {
  // The pen over a version that `opened` edits, with the draft seeded from the stored
  // flags the way the page seeds it. `parent` is the baselineVersion the page gives.
  function pen({ opened = () => {}, parent, edit = () => {} }) {
    const version = structuredClone(oliveOilVersion);
    opened(version);
    const draftVersion = structuredClone(version);
    const penDraft = { rows: {}, asMade: {} };
    for (const row of draftVersion.rows) {
      row.portions.forEach((portion) => {
        portion.removed = portion.removed === true;
      });
      penDraft.rows[row.id] = {
        portions: row.portions.map((portion) => ({ step: portion.step, grams: String(portion.grams), removed: portion.removed })),
      };
    }
    edit({ draftVersion, penDraft });
    return renderToStaticMarkup(
      <IngredientTable
        rows={version.rows}
        draftVersion={draftVersion}
        mode="developing"
        penDraft={penDraft}
        openBatch={null}
        steps={version.method}
        currentStepNumbers={displayNumbers(draftVersion.method)}
        baselineVersion={parent}
      />,
    );
  }

  const takeOut = (rowId, ...indexes) => (version) => {
    for (const index of indexes) version.rows.find((row) => row.id === rowId).portions[index].removed = true;
  };

  // Each <tr> of the body that names the ingredient, in table order.
  function linesOf(markup, name) {
    const body = markup.split('<tbody>')[1].split('</tbody>')[0];
    return body.split('<tr').filter((tr) => tr.includes(`aria-label="${name}`));
  }

  const note = (tr) => tr.match(/ingredient-table__portion-note">([^<]*)</)?.[1];
  const lastCell = (tr) => tr.split('<td class="ingredient-table__col-numeric">').pop().split('</td>')[0];
  const gramsCell = (tr) => tr.split('<td class="ingredient-table__col-grams">')[1].split('</td>')[0];

  it('H1, one line out at open: the struck Step 2 line reads the parent, and the sibling\'s name announces no change', () => {
    const markup = pen({ opened: takeOut('row-01', 0), parent: structuredClone(oliveOilVersion) });
    const [stepTwo, stepThree] = linesOf(markup, 'Whole milk');

    expect(note(stepTwo)).toBe('120 g of 370.4 g · 46.3% in all');
    expect(lastCell(stepTwo)).toBe('<span class="struck-value">15.0%</span>');
    expect(note(stepThree)).toBe('250.4 g of 250.4 g · 36.8% in all');
    expect(markup).toContain('aria-label="Whole milk, 250.4 g, estimated"');
    expect(markup).not.toContain('120 g of 250.4 g');
    expect(markup).not.toContain('17.7%');
    expect(markup).not.toContain('54.5%');
  });

  it('H2, both milk lines out at open: each reads the parent\'s figures, and the wrong shares print nowhere', () => {
    const markup = pen({ opened: takeOut('row-01', 0, 1), parent: structuredClone(oliveOilVersion) });
    const [stepTwo, stepThree] = linesOf(markup, 'Whole milk');

    expect(note(stepTwo)).toBe('120 g of 370.4 g · 46.3% in all');
    expect(note(stepThree)).toBe('250.4 g of 370.4 g · 46.3% in all');
    expect(lastCell(stepTwo)).toBe('<span class="struck-value">15.0%</span>');
    expect(lastCell(stepThree)).toBe('<span class="struck-value">31.3%</span>');
    expect(markup).not.toContain('86.3%');
    expect(markup).not.toContain('28.0%');
    expect(markup).not.toContain('58.3%');
  });

  it('H3, a one-line row (Heavy cream) out at open: its struck share is the parent\'s', () => {
    const markup = pen({ opened: takeOut('row-02', 0), parent: structuredClone(oliveOilVersion) });
    const [cream] = linesOf(markup, 'Heavy cream');

    expect(lastCell(cream)).toBe('<span class="struck-value">31.6%</span>');
    expect(markup).not.toContain('46.2%');
  });

  it('H4, neither the version the pen opened on nor its parent has the line in: no portion line, no share, the amount stays', () => {
    const parentWithoutLine = structuredClone(oliveOilVersion);
    takeOut('row-01', 0)(parentWithoutLine);
    for (const parent of [null, parentWithoutLine]) {
      const markup = pen({ opened: takeOut('row-01', 0), parent });
      const [stepTwo, stepThree] = linesOf(markup, 'Whole milk');

      expect(stepTwo).not.toContain('ingredient-table__portion-note');
      expect(lastCell(stepTwo)).toBe('');
      expect(gramsCell(stepTwo)).toContain('<span class="struck-value">120 g</span>');
      expect(stepTwo).toContain('restore');
      expect(note(stepThree)).toBe('250.4 g of 250.4 g · 36.8% in all');
    }
  });

  it('H5, a line pressed out in this session still reads the version the pen opened on, even with a parent given', () => {
    const parent = structuredClone(oliveOilVersion);
    parent.rows.find((row) => row.id === 'row-01').portions[0].grams = 100;
    const markup = pen({
      parent,
      edit: ({ draftVersion, penDraft }) => setLineRemoved({ draftVersion, penDraft }, 'row-01', 0),
    });
    const [stepTwo] = linesOf(markup, 'Whole milk');

    expect(note(stepTwo)).toBe('120 g of 370.4 g · 46.3% in all');
    expect(lastCell(stepTwo)).toBe('<span class="struck-value">15.0%</span>');
  });

  it('H6, with Step 3 typed over a line out at open, the name reads the row as it stood at open', () => {
    const markup = pen({
      opened: takeOut('row-01', 0),
      parent: structuredClone(oliveOilVersion),
      edit: ({ draftVersion, penDraft }) => {
        penDraft.rows['row-01'].portions[1].grams = '260';
        draftVersion.rows.find((row) => row.id === 'row-01').portions[1].grams = 260;
      },
    });

    expect(markup).toContain('aria-label="Whole milk, was 250.4 g, now 260 g, was 36.8%, now 37.7%, estimated"');
  });
});
