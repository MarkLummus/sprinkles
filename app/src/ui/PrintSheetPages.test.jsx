// @vitest-environment jsdom
//
// The Sheet's formula pages (04-07; PRINT-01, D-06a, sketch 010 E1 to E8, D29).
// jsdom computes no boxes, so the measuring step is injected where a test needs
// one; the browser proof is the print probe (04-print-probe.mjs, modes sheet and
// sweep). These tests read the markup the pages are made of.
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { PrintBalance, PrintClosingFoot, PrintIngredientTable, PrintInstructions, SheetPage, sheetBlocks, useSheetPages } from './PrintSheetPages.jsx';
import { groupPortionsByStep } from './IngredientTable.jsx';
import { displayNumbers } from '../domain/stepNumbers.js';
import { layPages } from '../domain/sheetPages.js';
import { OLIVE_OIL_V1_SAFARI, OLIVE_OIL_V1_CHROME } from '../domain/sheetPages.fixtures.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { activeRows, activeSteps, rowGrams } from '../domain/rows.js';
import { sheetCode } from '../domain/sheetCode.js';
import { buildFigures } from '../domain/figures.js';
import { BasisNote } from './BasisNote.jsx';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { library } from '../data/library.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The stamped olive oil version the store holds: it carries its stored sheetCode.
const oliveOilVersion = seedRecipeGroups[0].versions[0];

function fragment(element) {
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(element);
  return host;
}

const blocks = sheetBlocks(oliveOilVersion);

function tableOf({ header = true, total = true } = {}) {
  return fragment(
    <PrintIngredientTable groups={blocks.groups} showHeader={header} showTotal={total} totalText={blocks.totalText} />,
  );
}

describe('PrintIngredientTable — the print form of the table (E1, E2, E6, E7, E8)', () => {
  it('reads As made first, then Ingredient over the grams and the name', () => {
    const heads = [...tableOf().querySelectorAll('thead th')];
    expect(heads.map((head) => head.textContent)).toEqual(['As made', 'Ingredient']);
    expect(heads[1].getAttribute('colspan')).toBe('2');
    const cells = [...tableOf().querySelector('tbody tr:not(.ps-step-head)').children];
    expect(cells[0].querySelector('.ps-asmade')).not.toBeNull();
    expect(cells[1].textContent).toMatch(/^[\d.]+ g$/);
  });

  it('has no share column, no tick box and no control', () => {
    const table = tableOf();
    // A split ingredient's portion line says “in all”, a share of the whole batch; no
    // column of its own carries a percentage, and the header names none.
    expect(table.querySelector('thead').textContent).not.toContain('%');
    expect([...table.querySelectorAll('td')].filter((cell) => /^[\d.]+%$/.test(cell.textContent))).toHaveLength(0);
    expect(table.querySelectorAll('tbody tr:not(.ps-step-head) > td')).not.toHaveLength(0);
    for (const row of table.querySelectorAll('tbody tr:not(.ps-step-head)')) expect(row.children).toHaveLength(3);
    expect(table.querySelector('input, button, [type="checkbox"], [role="checkbox"]')).toBeNull();
  });

  it('draws a thead when the page repeats the header row, and none when it does not', () => {
    expect(tableOf({ header: true }).querySelector('thead')).not.toBeNull();
    expect(tableOf({ header: false }).querySelector('thead')).toBeNull();
  });

  it('draws the Total once, with an empty As made cell, only when the page holds the last line', () => {
    const table = tableOf();
    const feet = table.querySelectorAll('tfoot');
    expect(feet).toHaveLength(1);
    const cells = [...feet[0].querySelectorAll('td')];
    expect(cells[0].textContent).toBe('');
    expect(cells.map((cell) => cell.textContent)).toEqual(['', '799.7 g', 'Total']);
    expect(tableOf({ total: false }).querySelector('tfoot')).toBeNull();
  });

  it('opens each step group with its step and lead-in, then its lines', () => {
    const groups = [...tableOf().querySelectorAll('tbody.ps-group')];
    expect(groups).toHaveLength(blocks.groups.length);
    for (const group of groups) {
      expect(group.firstElementChild.className).toBe('ps-step-head');
      expect(group.firstElementChild.textContent).toMatch(/^Step \d+/);
    }
  });

  it('says estimated as a word, never as a colour', () => {
    const table = tableOf();
    const flags = [...table.querySelectorAll('.ps-flag .target-chip__value')].map((flag) => flag.textContent);
    expect(flags).toContain('estimated');
    expect(table.querySelector('[style]')).toBeNull();
  });

  it('pins the three column widths of a slice when it is given them', () => {
    const pinned = fragment(
      <PrintIngredientTable groups={blocks.groups} showHeader showTotal totalText={blocks.totalText} columns={[90, 80, 200]} />,
    );
    expect(pinned.querySelector('table').className).toBe('ps-table ps-table--pinned');
    expect([...pinned.querySelectorAll('col')].map((col) => col.getAttribute('style'))).toEqual(['width:90px', 'width:80px', 'width:200px']);
    expect(tableOf().querySelector('colgroup')).toBeNull();
  });

  it('prints a split ingredient’s portion line on each of its lines, and none on a one-line row', () => {
    const notes = [...tableOf().querySelectorAll('.ps-note')].map((note) => note.textContent);
    expect(notes).toContain('120 g of 370.4 g · 46.3% in all');
    const names = [...tableOf().querySelectorAll('tbody.ps-group tr:not(.ps-step-head)')]
      .filter((row) => !row.querySelector('.ps-note'))
      .map((row) => row.querySelector('.ps-col-name').firstChild.textContent);
    expect(names).toContain('Locust bean gum');
  });
});

describe('PrintIngredientTable — [edge PRINT-02/precision] grams as stored (04-08)', () => {
  it('prints the small portions as stored (1.04 g, 0.16 g) and the Total through formatGrams’ one decimal (799.7 g)', () => {
    const grams = [...tableOf().querySelectorAll('tbody.ps-group tr:not(.ps-step-head) .ps-col-grams')].map((cell) => cell.textContent);
    expect(grams).toContain('1.04 g');
    expect(grams).toContain('0.16 g');
    const totalCells = [...tableOf().querySelectorAll('tfoot td')].map((cell) => cell.textContent);
    expect(totalCells).toContain('799.7 g');
  });
});

describe('sheetBlocks — the lines come from the screen table’s own grouping', () => {
  it('lists the groups and lines in groupPortionsByStep’s order', () => {
    const grouped = groupPortionsByStep(oliveOilVersion.rows, oliveOilVersion.method, displayNumbers(oliveOilVersion.method), false);
    expect(blocks.groups.map((group) => group.head.label)).toEqual(grouped.map((group) => `Step ${group.displayNumber}`));
    expect(blocks.groups.map((group) => group.lines.map((line) => line.name))).toEqual(
      grouped.map((group) => group.entries.map((entry) => entry.row.ingredientName)),
    );
  });
});

describe('PrintBalance — Balance in column 2 (E3, E4)', () => {
  const all = blocks.figures.map((_, i) => i);
  const balance = (props) => fragment(<PrintBalance figures={blocks.figures} version={oliveOilVersion} gaugeIndexes={all} showHeading showBasis {...props} />);

  it('is headed by the plain word Balance in the ink heading, with no Hide control and no Watch for', () => {
    const column = balance();
    expect(column.querySelector('.region-name').textContent).toBe('Balance');
    expect(column.textContent).not.toMatch(/hide|watch for/i);
    expect(column.querySelector('button, a, input')).toBeNull();
  });

  it('draws one static gauge per figure it is given, whole, in the order given', () => {
    const column = balance({ gaugeIndexes: [4, 5], showHeading: false, showBasis: false });
    const gauges = [...column.querySelectorAll('.formulation-note__rule .ps-gauge')];
    expect(gauges).toHaveLength(2);
    expect(gauges.map((gauge) => gauge.querySelector('.graduated-rule__label-word').textContent)).toEqual(
      [blocks.figures[4], blocks.figures[5]].map((figure) => figure.label.word),
    );
    expect(column.querySelector('.region-name')).toBeNull();
    expect(column.querySelector('.basis-note')).toBeNull();
    for (const gauge of gauges) expect(gauge.querySelector('svg')).not.toBeNull();
  });

  it('puts the basis note last, and prints the fat breakdown under the fat gauge only', () => {
    const column = balance();
    const note = column.querySelector('.ps-balance').lastElementChild;
    expect(note.className).toBe('basis-note');
    const breakdowns = column.querySelectorAll('.formulation-note__fat-breakdown');
    expect(breakdowns).toHaveLength(1);
    expect(breakdowns[0].textContent).toMatch(/^Milkfat 13\.0% and added fat 5\.0% — 28% of fat\.$/);
    expect(breakdowns[0].parentElement.querySelector('.graduated-rule__label-word').textContent).toBe('Fat');
  });

  it('draws the basis note alone on a page that has only it to continue', () => {
    const column = balance({ gaugeIndexes: [], showHeading: false });
    expect(column.querySelector('.formulation-note')).toBeNull();
    expect(column.querySelector('.ps-balance').firstElementChild.className).toBe('basis-note');
  });

  it('says estimated and unreviewed as words in the gauge’s basis line', () => {
    const column = balance();
    expect(column.textContent).toContain('estimated: Whole milk, Heavy cream');
  });

  it('prints the Sweetness gauge on 0 to 40: band 96 to 128, anchors 0, inside 12–16, 40 (sketch 010 D30)', () => {
    const gauge = [...balance().querySelectorAll('.formulation-note__rule .ps-gauge')].find(
      (g) => g.querySelector('.graduated-rule__label-word').textContent === 'Sweetness',
    );
    const svg = gauge.querySelector('svg');
    const band = svg.querySelector('rect');
    expect(Math.abs(Number(band.getAttribute('x')) - 96)).toBeLessThan(0.01);
    expect(Math.abs(Number(band.getAttribute('width')) - 32)).toBeLessThan(0.01);
    const edges = [...svg.querySelectorAll('line[y1="2"]')].map((line) => Number(line.getAttribute('x1')));
    expect(edges).toHaveLength(2);
    expect(Math.abs(edges[0] - 96)).toBeLessThan(0.01);
    expect(Math.abs(edges[1] - 128)).toBeLessThan(0.01);
    expect([...gauge.querySelectorAll('.graduated-rule__anchors span')].map((span) => span.textContent)).toEqual(['0', 'inside 12–16', '40']);
  });
});

describe('SheetPage — one laid page of the Sheet', () => {
  const safari = layPages(OLIVE_OIL_V1_SAFARI.measure, OLIVE_OIL_V1_SAFARI.box);
  const chrome = layPages(OLIVE_OIL_V1_CHROME.measure, OLIVE_OIL_V1_CHROME.box);

  it('page 1 holds the band, Before you start once, the Ingredients heading and the groups the plan names', () => {
    const page = fragment(<SheetPage plan={safari[0]} blocks={blocks} />);
    expect(page.querySelector('.ps-band h1').textContent).toBe('Olive Oil Ice Cream');
    expect(page.querySelectorAll('.ps-before .region-name')).toHaveLength(1);
    expect(page.querySelector('.ps-before .region-name').textContent).toBe('Before you start');
    expect(page.querySelectorAll('.ps-before li').length).toBe(oliveOilVersion.authored.beforeYouStart.length);
    expect(page.querySelector('.ps-ingredients .region-name').textContent).toBe('Ingredients');
    expect([...page.querySelectorAll('.ps-step-head')].map((head) => head.textContent.slice(0, 6))).toEqual(['Step 2', 'Step 3']);
    expect(page.querySelector('tfoot')).toBeNull();
  });

  it('page 1 holds Balance beside the table: its heading and the first four gauges, no basis note yet', () => {
    const page = fragment(<SheetPage plan={safari[0]} blocks={blocks} />);
    expect(page.querySelector('.ps-row > .ps-col2 .region-name').textContent).toBe('Balance');
    expect(page.querySelectorAll('.ps-col2 .formulation-note__rule')).toHaveLength(4);
    expect(page.querySelector('.ps-col2 .basis-note')).toBeNull();
  });

  it('page 2 continues Balance: the last two gauges and the basis note, with no heading again', () => {
    const page = fragment(<SheetPage plan={safari[1]} blocks={blocks} />);
    expect(page.querySelectorAll('.ps-col2 .formulation-note__rule')).toHaveLength(2);
    expect(page.querySelector('.ps-col2 .region-name')).toBeNull();
    expect(page.querySelector('.ps-col2 .basis-note')).not.toBeNull();
  });

  it('draws no button anywhere on a Sheet page (paper has no controls)', () => {
    for (const plan of [...safari, ...chrome]) expect(fragment(<SheetPage plan={plan} blocks={blocks} />).querySelector('button')).toBeNull();
  });

  it('page 2 opens with the header row alone: no band, no notes, no Ingredients heading, no word “continued”', () => {
    const page = fragment(<SheetPage plan={safari[1]} blocks={blocks} />);
    expect(page.querySelector('.ps-band')).toBeNull();
    expect(page.querySelector('.ps-before')).toBeNull();
    // The Instructions' heading is the page's only heading (04-08).
    expect([...page.querySelectorAll('.region-name')].map((node) => node.textContent)).toEqual(['Instructions']);
    expect(page.querySelector('.ps-ingredients .region-name')).toBeNull();
    expect(page.querySelector('thead')).not.toBeNull();
    expect(page.textContent.toLowerCase()).not.toContain('continued');
    expect([...page.querySelectorAll('.ps-step-head')].map((head) => head.textContent.slice(0, 6))).toEqual(['Step 6', 'Step 8']);
    expect(page.querySelectorAll('tfoot')).toHaveLength(1);
  });

  it('the Chrome plan puts Step 6 on the formula page', () => {
    const page = fragment(<SheetPage plan={chrome[0]} blocks={blocks} />);
    expect([...page.querySelectorAll('.ps-step-head')].map((head) => head.textContent.slice(0, 6))).toEqual(['Step 2', 'Step 3', 'Step 6']);
  });

  it('prints only the built page’s own headings: no “Formula” and no other word the app does not have', () => {
    const words = [...safari, ...chrome].flatMap((plan) => [...fragment(<SheetPage plan={plan} blocks={blocks} />).querySelectorAll('.region-name')].map((node) => node.textContent));
    expect(new Set(words)).toEqual(new Set(['Before you start', 'Ingredients', 'Balance', 'Instructions']));
  });

  it('renders every stored string as text', () => {
    const hostile = { ...oliveOilVersion, sheetTitle: '<img src=x onerror=alert(1)>', sheetDescription: '<b>bold</b>' };
    const page = fragment(<SheetPage plan={safari[0]} blocks={sheetBlocks(hostile)} />);
    expect(page.querySelector('img')).toBeNull();
    expect(page.querySelector('h1').textContent).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('PrintInstructions — the method treatment on paper (04-08; PRINT-02; sketch 010 D18)', () => {
  const identity = 'Version 1';
  const real = sheetBlocks(oliveOilVersion, identity);
  const render = (steps = real.steps, numbers = real.numbers, showHeading = true) =>
    fragment(<PrintInstructions steps={steps} numbers={numbers} showHeading={showHeading} />);
  const step = (overrides) => ({ n: 1, leadIn: 'Stir', instruction: 'Stir it well.', purpose: '', aside: '', targets: [], removed: false, ...overrides });

  it('reads the version’s active steps, in order, each with its display number in the number column', () => {
    const list = render();
    const items = [...list.querySelectorAll('ol.mp-steps > li.mp-step')];
    expect(items).toHaveLength(activeSteps(oliveOilVersion).length);
    expect(items.map((item) => item.querySelector('.mp-n').textContent)).toEqual(items.map((_, i) => String(i + 1)));
    const first = activeSteps(oliveOilVersion)[0];
    expect(items[0].querySelector('.mp-lead b').textContent).toBe(`${first.leadIn}.`);
    expect(items[0].querySelector('.mp-lead').textContent).toBe(`${first.leadIn}. ${first.instruction}`);
  });

  it('numbers by position among the active steps: a removed step has no number and is not printed', () => {
    const removed = { ...oliveOilVersion, method: oliveOilVersion.method.map((entry, i) => (i === 0 ? { ...entry, removed: true } : entry)) };
    const forBlocks = sheetBlocks(removed, identity);
    expect(forBlocks.steps).toHaveLength(oliveOilVersion.method.length - 1);
    const numbers = [...render(forBlocks.steps, forBlocks.numbers).querySelectorAll('.mp-n')].map((node) => node.textContent);
    expect(numbers[0]).toBe('1');
    expect(numbers).toHaveLength(forBlocks.steps.length);
  });

  it('prints the typed targets as a tag row: a caps label and a value, verbatim, no box', () => {
    const tags = [...render().querySelectorAll('.mp-tags .mp-tag')].map((tag) => [tag.querySelector('.mp-tag__label').textContent, tag.querySelector('.mp-tag__value').textContent]);
    const stored = activeSteps(oliveOilVersion).flatMap((entry) => (entry.targets ?? []).map((target) => [target.label, target.value]));
    expect(tags).toEqual(stored);
    // [edge PRINT-02/precision] the stored strings, not a reformatting of them.
    const values = tags.map(([, value]) => value);
    for (const want of ['69 °C', '10–12 min', '−20 °C, 4+ h']) expect(values).toContain(want);
  });

  it('prints Why as the word why, an em dash and the sentence', () => {
    const why = [...render().querySelectorAll('.mp-why')];
    expect(why).toHaveLength(activeSteps(oliveOilVersion).filter((entry) => entry.purpose).length);
    const stored = activeSteps(oliveOilVersion).find((entry) => entry.purpose);
    expect(why[0].querySelector('.mp-why__label').textContent).toBe('why');
    expect(why[0].textContent).toBe(`why — ${stored.purpose}`);
  });

  it('prints the aside as a callout, and adds no word but why', () => {
    const asides = [...render().querySelectorAll('.mp-aside')].map((node) => node.textContent);
    expect(asides).toEqual(activeSteps(oliveOilVersion).filter((entry) => entry.aside).map((entry) => entry.aside));
    // Each step prints its number, its own words in order, and "why — " before the purpose: nothing else.
    const items = [...render().querySelectorAll('.mp-step')];
    const wanted = activeSteps(oliveOilVersion).map(
      (entry, i) =>
        `${i + 1}${entry.leadIn}. ${entry.instruction}${(entry.targets ?? []).map((target) => `${target.label}${target.value}`).join('')}${entry.purpose ? `why — ${entry.purpose}` : ''}${entry.aside ?? ''}`,
    );
    expect(items.map((item) => item.textContent)).toEqual(wanted);
  });

  it('is upright: no em or i element, no target chip, no italic Purpose or Aside class', () => {
    const markup = renderToStaticMarkup(<PrintInstructions steps={real.steps} numbers={real.numbers} showHeading />);
    expect(markup).not.toMatch(/<em[\s>]|<i[\s>]/);
    expect(markup).not.toContain('target-chip');
    expect(markup).not.toContain('method-step');
  });

  it('[edge PRINT-02/empty] a step with no targets prints no tag row, none without a purpose no why line, none without an aside no callout', () => {
    const bare = render([step()], new Map([[1, 1]]));
    expect(bare.querySelector('.mp-tags')).toBeNull();
    expect(bare.querySelector('.mp-why')).toBeNull();
    expect(bare.querySelector('.mp-aside')).toBeNull();
    expect(bare.querySelector('.mp-lead')).not.toBeNull();
    const full = render([step({ targets: [{ label: 'temp', value: '4 °C' }], purpose: 'Because.', aside: 'Careful.' })], new Map([[1, 1]]));
    expect(full.querySelectorAll('.mp-tag')).toHaveLength(1);
    expect(full.querySelector('.mp-why')).not.toBeNull();
    expect(full.querySelector('.mp-aside')).not.toBeNull();
  });

  it('draws the Instructions heading only when told to', () => {
    expect(render(real.steps, real.numbers, true).querySelector('h2.region-name').textContent).toBe('Instructions');
    expect(render(real.steps, real.numbers, false).querySelector('.region-name')).toBeNull();
  });

  it('renders every stored string as text', () => {
    const hostile = [step({ leadIn: '<b>x</b>', instruction: '<img src=x onerror=alert(1)>', purpose: '<i>y</i>', aside: '<u>z</u>', targets: [{ label: '<s>l</s>', value: '<s>v</s>' }] })];
    const list = render(hostile, new Map([[1, 1]]));
    expect(list.querySelector('img')).toBeNull();
    expect(list.querySelector('i, u, s')).toBeNull();
    expect(list.querySelector('.mp-tag__value').textContent).toBe('<s>v</s>');
  });
});

describe('PrintClosingFoot and the Sheet’s foot text (04-08; D7, D28; PRINT-04)', () => {
  it('draws one line of the words it is given, with no side label and no page n of m', () => {
    const foot = fragment(<PrintClosingFoot footText="Olive Oil Ice Cream · Version 1 · K7QM-2X9D" />).querySelector('.mp-foot');
    expect(foot.textContent).toBe('Olive Oil Ice Cream · Version 1 · K7QM-2X9D');
    expect(foot.textContent.toLowerCase()).not.toMatch(/side|page \d/);
  });

  it('reads the Sheet title, the version line and the version’s Sheet code, joined by a middle dot', () => {
    const forBlocks = sheetBlocks(oliveOilVersion, 'Version 1');
    expect(forBlocks.footText).toBe(`${oliveOilVersion.sheetTitle} · Version 1 · ${oliveOilVersion.sheetCode}`);
  });

  it('prints a stored code that differs from sheetCode(version), never the content-derived one', () => {
    const stored = { ...oliveOilVersion, sheetCode: 'ZZZZ-0000' };
    expect(sheetCode(stored)).not.toBe('ZZZZ-0000');
    expect(sheetBlocks(stored, 'Version 1').footText).toBe(`${stored.sheetTitle} · Version 1 · ZZZZ-0000`);
  });

  it('stands on the page the plan names, after the last step and inside the Instructions', () => {
    const plans = layPages(OLIVE_OIL_V1_SAFARI.measure, OLIVE_OIL_V1_SAFARI.box);
    const forBlocks = sheetBlocks(oliveOilVersion, 'Version 1');
    const marked = plans.map((plan) => fragment(<SheetPage plan={plan} blocks={forBlocks} />));
    expect(marked.map((page) => page.querySelectorAll('.mp-foot').length)).toEqual([0, 0, 1]);
    const last = marked[2];
    expect(last.querySelector('.ps-instructions > .mp-foot')).not.toBeNull();
    expect(last.querySelector('.ps-instructions').lastElementChild.className).toBe('mp-foot');
    expect(last.querySelector('.mp-foot').textContent).toBe(forBlocks.footText);
  });

  it('draws the Instructions heading on the first Instructions page only: steps 1 to 4, then 5 to 10 (Safari)', () => {
    const plans = layPages(OLIVE_OIL_V1_SAFARI.measure, OLIVE_OIL_V1_SAFARI.box);
    const forBlocks = sheetBlocks(oliveOilVersion, 'Version 1');
    const pages = plans.map((plan) => fragment(<SheetPage plan={plan} blocks={forBlocks} />));
    expect(pages.map((page) => page.querySelectorAll('.ps-instructions > .region-name').length)).toEqual([0, 1, 0]);
    expect(pages.map((page) => [...page.querySelectorAll('.mp-n')].map((node) => node.textContent))).toEqual([
      [],
      ['1', '2', '3', '4'],
      ['5', '6', '7', '8', '9', '10'],
    ]);
  });
});

// 04-07 Task 3: every seed version, not only Olive Oil v1. Fixed heights stand in
// for the measuring jsdom cannot do, one kind of height per kind of block, so a
// version is spread over several pages and every page kind is rendered.
describe('every seed version — the table lists exactly its active lines, in the screen table’s order', () => {
  const versions = seedRecipeGroups.flatMap((group) => group.versions);

  function fixedMeasure(forBlocks) {
    return {
      band: 126,
      before: forBlocks.notes.length > 0 ? 145 : 0,
      gap: 20,
      ingredientsHeading: 25,
      header: 27,
      total: 31,
      groups: forBlocks.groups.map((group) => ({ head: group.head ? 35 : 0, rows: group.lines.map(() => 40) })),
      balanceHeading: 25,
      gauges: forBlocks.figures.map(() => 100),
      gaugeGap: 20,
      basis: 120,
      basisGap: 20,
    };
  }

  it('covers every seed version', () => {
    expect(versions.length).toBeGreaterThanOrEqual(19);
  });

  for (const version of versions) {
    it(`${version.id}: its lines, once each and in order; no removed line; the Total once`, () => {
      const forBlocks = sheetBlocks(version);
      const grouped = groupPortionsByStep(version.rows, version.method, displayNumbers(version.method), false);
      const want = grouped.flatMap((group) => group.entries.map((entry) => `${entry.row.id}:${entry.portionIndex}`));
      // The lines of the active rows only: a line that is out never reaches a group.
      const activePortions = activeRows(version).reduce((count, row) => count + row.portions.length, 0);
      expect(want).toHaveLength(activePortions);

      const pages = layPages(fixedMeasure(forBlocks), { height: 900 });
      const host = document.createElement('div');
      host.innerHTML = pages.map((plan) => renderToStaticMarkup(<SheetPage plan={plan} blocks={forBlocks} />)).join('');
      const rendered = [...host.querySelectorAll('tbody.ps-group tr:not(.ps-step-head)')];
      expect(rendered).toHaveLength(want.length);

      const names = grouped.flatMap((group) => group.entries.map((entry) => entry.row.ingredientName));
      expect(rendered.map((row) => row.querySelector('.ps-col-name').firstChild.textContent)).toEqual(names);
      const grams = grouped.flatMap((group) => group.entries.map((entry) => `${entry.portion.grams} g`));
      expect(rendered.map((row) => row.querySelector('.ps-col-grams').textContent)).toEqual(grams);

      // A removed row or line is not printed: every printed name is an active row's.
      const activeNames = new Set(activeRows(version).map((row) => row.ingredientName));
      for (const name of names) expect(activeNames.has(name), name).toBe(true);
      // The Total is the active rows' sum, printed once.
      const total = activeRows(version).reduce((sum, row) => sum + rowGrams(row), 0);
      expect(host.querySelectorAll('tfoot')).toHaveLength(1);
      expect(host.querySelector('tfoot .ps-col-grams').textContent).toBe(`${total.toFixed(1)} g`);
      // Before you start is printed once, and only when the version has notes.
      expect(host.querySelectorAll('.ps-before')).toHaveLength(version.authored.beforeYouStart.length > 0 ? 1 : 0);
      // The header row opens every table page; the heading only the first.
      const tables = [...host.querySelectorAll('.ps-ingredients')];
      expect(tables.every((table) => table.querySelector('thead'))).toBe(true);
      expect(host.querySelectorAll('.ps-ingredients > .region-name')).toHaveLength(1);
      expect(host.textContent.toLowerCase()).not.toContain('continued');
      expect(host.querySelector('button')).toBeNull();
    });
  }
});

describe('useSheetPages — measures after render, then lays', () => {
  let host = null;
  let root = null;

  afterEach(async () => {
    await act(async () => root?.unmount());
    host?.remove();
    host = null;
    root = null;
  });

  function Probe({ version, read }) {
    const sheet = useSheetPages(version, read);
    return (
      <div>
        <output data-pages={sheet.pages ? sheet.pages.length : 'none'} data-columns={sheet.columns ? sheet.columns.join(',') : 'none'} data-fit={sheet.fit} />
        {sheet.measureElement}
      </div>
    );
  }

  async function mount(version, read) {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => {
      root.render(<Probe version={version} read={read} />);
    });
    return host.querySelector('output');
  }

  it('has no pages and no measuring box while there is no version', async () => {
    const output = await mount(null, undefined);
    expect(output.dataset.pages).toBe('none');
    expect(host.querySelector('.ps-measure')).toBeNull();
  });

  it('lays the measurement the injected reader answers, with the columns and fit it gives', async () => {
    const read = () => ({ ...OLIVE_OIL_V1_SAFARI, height: OLIVE_OIL_V1_SAFARI.box.height, columns: [90, 80, 200], fit: 1.06667 });
    const output = await mount(oliveOilVersion, read);
    expect(output.dataset.pages).toBe('3');
    expect(output.dataset.columns).toBe('90,80,200');
    expect(output.dataset.fit).toBe('1.06667');
    expect(host.querySelector('.ps-measure[aria-hidden="true"] .ps-box .ps-table')).not.toBeNull();
  });

  it('lays the whole Sheet on one page where nothing can be measured (a height of 0)', async () => {
    const output = await mount(oliveOilVersion, undefined);
    expect(output.dataset.pages).toBe('1');
  });
});

// Review 2026-10-11 P1: the printed Balance (six gauges and the basis note) read
// the stored rows, removed lines included, while the table beside it lists and
// totals the active ones. The Sheet's figures now read the same active reading
// the recipe page's own Balance reads; the band, the groups and the Sheet code
// stay on the stored version.
describe('sheetBlocks — Balance reads the active formula (review 2026-10-11 P1)', () => {
  const portionsOut = (row) => ({ ...row, portions: row.portions.map((portion) => ({ ...portion, removed: true })) });
  const fixtures = [
    {
      name: 'a removed only-line (every portion of Graza Drizzle removed)',
      version: { ...oliveOilVersion, rows: oliveOilVersion.rows.map((row) => (row.id === 'row-03' ? portionsOut(row) : row)) },
    },
    {
      name: 'a removed whole row (row-03 removed true)',
      version: { ...oliveOilVersion, rows: oliveOilVersion.rows.map((row) => (row.id === 'row-03' ? { ...row, removed: true } : row)) },
    },
    {
      name: 'one removed line of a split row (Whole milk step 2)',
      version: {
        ...oliveOilVersion,
        rows: oliveOilVersion.rows.map((row) =>
          row.id === 'row-01' ? { ...row, portions: row.portions.map((portion, i) => (i === 0 ? { ...portion, removed: true } : portion)) } : row,
        ),
      },
    },
    {
      name: 'a removed method step (step 6, Allulose)',
      version: { ...oliveOilVersion, method: oliveOilVersion.method.map((step) => (step.n === 6 ? { ...step, removed: true } : step)) },
    },
  ];

  const reading = (version) => ({ ...version, rows: activeRows(version), method: activeSteps(version) });
  const everyGauge = (figures) => figures.map((_, i) => i);
  const balanceOnly = (figures) => ({
    band: false,
    before: false,
    table: null,
    balance: { heading: true, gauges: everyGauge(figures), basis: true },
    instructions: null,
    foot: false,
  });
  const printedBalance = (version) => {
    const forBlocks = sheetBlocks(version, 'Version 1');
    return fragment(<SheetPage plan={balanceOnly(forBlocks.figures)} blocks={forBlocks} />).querySelector('.ps-balance');
  };
  const drawnBalance = (figures, version) =>
    fragment(<PrintBalance figures={figures} version={version} gaugeIndexes={everyGauge(figures)} showHeading showBasis />).querySelector('.ps-balance');
  const values = (figures) => figures.map((figure) => figure.value);

  for (const { name, version } of fixtures) {
    it(`${name}: the figures are the active reading's, and not the stored rows'`, () => {
      const forBlocks = sheetBlocks(version);
      expect(forBlocks.figures).toEqual(buildFigures(reading(version)));
      expect(values(forBlocks.figures)).not.toEqual(values(buildFigures(version)));
    });

    it(`${name}: the printed Balance, gauges and basis note, is the active one and not the stored one`, () => {
      const printed = printedBalance(version).outerHTML;
      expect(printed).toBe(drawnBalance(buildFigures(reading(version)), reading(version)).outerHTML);
      expect(printed).not.toBe(drawnBalance(buildFigures(version), version).outerHTML);
    });

    it(`${name}: the band, the groups and the Sheet code still read the stored version`, () => {
      const forBlocks = sheetBlocks(version, 'Version 1');
      expect(forBlocks.version).toBe(version);
      expect(forBlocks.footText).toBe([version.sheetTitle, 'Version 1', version.sheetCode].join(' · '));
    });
  }

  it('prints the review’s numbers for Graza Drizzle removed: PAC 25.3, POD 13.7, fat 13.7, MSNF 8.9, sugar 14.2, solids 37.7', () => {
    const { version } = fixtures[0];
    const read = (figures) => figures.map((figure) => figure.value.toFixed(figure.decimals));
    expect(read(sheetBlocks(version).figures)).toEqual(['25.3', '13.7', '13.7', '8.9', '14.2', '37.7']);
    expect(read(buildFigures(version))).toEqual(['24.1', '13.0', '18.0', '8.5', '13.5', '40.8']);
  });

  it('does not name Allulose in the printed basis note once its only step is removed', () => {
    const { version } = fixtures[3];
    expect(printedBalance(version).querySelector('.basis-note').textContent).not.toContain('Allulose');
    expect(fragment(<BasisNote version={version} />).querySelector('.basis-note').textContent).toContain('Allulose');
  });
});

describe('sheetBlocks — a recipe created from library records (Phase 7 D-02, D-07)', () => {
  function createdVersion(grams) {
    const rows = [
      rowFromLibraryRecord({ id: 'wholeMilk', entry: library.wholeMilk }, { id: 'row-a', grams: grams[0] }),
      rowFromLibraryRecord({ id: 'heavyCream', entry: library.heavyCream }, { id: 'row-b', grams: grams[1] }),
      rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-c', grams: grams[2] }),
    ];
    const root = createRecipe(
      { name: 'Plain base', versionLabel: 'first try', rows },
      { recipeId: 'recipe-plain', versionId: 'version-plain-1', now: '2026-10-14T12:00:00.000Z' },
    ).version;
    // createRecipe stores no code until Task 2 of this plan; stamp one here.
    return { ...root, sheetCode: root.sheetCode ?? 'ZZZZ-0000' };
  }

  it("builds the root version's blocks: six figures, one group with no head, no notes or steps, and the Sheet code in the foot", () => {
    const version = createdVersion([500, 250, 100]);
    const created = sheetBlocks(version, 'first try');
    expect(created.figures).toHaveLength(6);
    expect(created.groups).toHaveLength(1);
    expect(created.groups[0].head).toBeNull();
    expect(created.notes).toEqual([]);
    expect(created.steps).toEqual([]);
    expect(created.totalText).toBe('850.0 g');
    expect(created.footText).toBe(`Plain base · first try · ${version.sheetCode}`);
  });

  it("builds an all-zero root version's blocks without throwing: no figures and a 0.0 g total", () => {
    const created = sheetBlocks(createdVersion([0, 0, 0]), 'first try');
    expect(created.figures).toEqual([]);
    expect(created.totalText).toBe('0.0 g');
  });
});
