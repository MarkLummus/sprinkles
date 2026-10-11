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
import { PrintIngredientTable, SheetPage, sheetBlocks, useSheetPages } from './PrintSheetPages.jsx';
import { groupPortionsByStep } from './IngredientTable.jsx';
import { displayNumbers } from '../domain/stepNumbers.js';
import { layPages } from '../domain/sheetPages.js';
import { OLIVE_OIL_V1_SAFARI, OLIVE_OIL_V1_CHROME } from '../domain/sheetPages.fixtures.js';
import { oliveOilVersion } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

describe('sheetBlocks — the lines come from the screen table’s own grouping', () => {
  it('lists the groups and lines in groupPortionsByStep’s order', () => {
    const grouped = groupPortionsByStep(oliveOilVersion.rows, oliveOilVersion.method, displayNumbers(oliveOilVersion.method), false);
    expect(blocks.groups.map((group) => group.head.label)).toEqual(grouped.map((group) => `Step ${group.displayNumber}`));
    expect(blocks.groups.map((group) => group.lines.map((line) => line.name))).toEqual(
      grouped.map((group) => group.entries.map((entry) => entry.row.ingredientName)),
    );
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

  it('page 2 opens with the header row alone: no band, no notes, no Ingredients heading, no word “continued”', () => {
    const page = fragment(<SheetPage plan={safari[1]} blocks={blocks} />);
    expect(page.querySelector('.ps-band')).toBeNull();
    expect(page.querySelector('.ps-before')).toBeNull();
    expect(page.querySelector('.region-name')).toBeNull();
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
    expect(new Set(words)).toEqual(new Set(['Before you start', 'Ingredients']));
  });

  it('renders every stored string as text', () => {
    const hostile = { ...oliveOilVersion, sheetTitle: '<img src=x onerror=alert(1)>', sheetDescription: '<b>bold</b>' };
    const page = fragment(<SheetPage plan={safari[0]} blocks={sheetBlocks(hostile)} />);
    expect(page.querySelector('img')).toBeNull();
    expect(page.querySelector('h1').textContent).toBe('<img src=x onerror=alert(1)>');
  });
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
    expect(output.dataset.pages).toBe('2');
    expect(output.dataset.columns).toBe('90,80,200');
    expect(output.dataset.fit).toBe('1.06667');
    expect(host.querySelector('.ps-measure[aria-hidden="true"] .ps-box .ps-table')).not.toBeNull();
  });

  it('lays the whole Sheet on one page where nothing can be measured (a height of 0)', async () => {
    const output = await mount(oliveOilVersion, undefined);
    expect(output.dataset.pages).toBe('1');
  });
});
