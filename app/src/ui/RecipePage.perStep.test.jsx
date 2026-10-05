// @vitest-environment jsdom
//
// Phase 03.6 (sketch 011 decision 51, Mark's answers 1 and 3, 2026-10-05): in a
// split ingredient each remove link removes its own line, and the pen's portion
// line follows the lines still in. This is the end-to-end path over Olive Oil v1:
// the whole RecipePage, mounted over an in-memory stand-in for the repository
// seam (the only path to the store), with no batches.
//
// A sibling jsdom file, for the same reason as RecipePage.recordTasting.test.jsx:
// the behaviour is click and the page's own state, which renderToStaticMarkup
// cannot show, and RecipePage.test.jsx must keep running with no window in scope.
// The version list is kept in a mutable array that saveVersion appends to and
// getVersion and listVersions read, so later plans of the phase can extend this
// file to save and reopen.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

const store = vi.hoisted(() => ({ versions: [], saveVersion: null }));

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe } = await import('../data/olive-oil.js');
  store.saveVersion = vi.fn(async (record) => {
    const at = store.versions.findIndex((version) => version.id === record.id);
    if (at >= 0) store.versions[at] = structuredClone(record);
    else store.versions.push(structuredClone(record));
  });
  return {
    repository: {
      getVersion: async (id) => {
        const found = store.versions.find((version) => version.id === id);
        return found ? structuredClone(found) : undefined;
      },
      listVersions: async () => store.versions.map((version) => structuredClone(version)),
      listBatchesForVersion: async () => [],
      getAllBatches: async () => [],
      getBatch: async () => undefined,
      getRecipe: async () => oliveOilRecipe,
      saveBatch: vi.fn(async () => {}),
      saveVersion: store.saveVersion,
      saveRecipe: vi.fn(async () => {}),
    },
  };
});

import { RecipePage } from './RecipePage.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const RECIPE = oliveOilVersion.recipeId;
const VERSION = oliveOilVersion.id;
const VERSION_PATH = `/notebook/${RECIPE}/${VERSION}`;

let current = null;
let originalMatchMedia = null;

// router.jsx keys RecipePage by its route parameters; this wrapper does the same.
function Keyed() {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={() => {}} />;
}

// A fixed 393 coarse window, as RecipePage.recordTasting.test.jsx does.
function installMatchMedia() {
  Element.prototype.scrollIntoView = vi.fn();
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => {
    const max = query.match(/max-width:\s*([\d.]+)px/);
    const min = query.match(/min-width:\s*([\d.]+)px/);
    let matches = false;
    if (max) matches = 393 <= Number(max[1]);
    else if (min) matches = 393 >= Number(min[1]);
    else if (query.includes('pointer: coarse')) matches = true;
    return { matches, media: query, addEventListener() {}, removeEventListener() {} };
  };
}

async function flush(until) {
  for (let i = 0; i < 40; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await Promise.resolve();
    });
    if (until()) return;
  }
}

async function mountAt(path) {
  store.versions = [structuredClone(oliveOilVersion)];
  store.saveVersion.mockClear();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/notebook/:recipeId/:versionId" element={<Keyed />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await flush(() => buttonByText(container, 'Next version') !== null);
  return container;
}

function buttonByText(scope, text) {
  return [...scope.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

function buttonByLabel(label) {
  return [...current.container.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === label) ?? null;
}

// A table row is found by the button inside it, never by position.
function rowOf(label) {
  return buttonByLabel(label).closest('tr');
}

function nameCell(tr) {
  return tr.querySelector('.ingredient-table__col-name');
}

function totalCell() {
  return current.container.querySelector('tfoot .ingredient-table__col-grams');
}

function noteOf(label) {
  return nameCell(rowOf(label)).querySelector('.ingredient-table__portion-note').textContent;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

async function setValue(element, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

afterEach(async () => {
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = null;
  delete Element.prototype.scrollIntoView;
});

describe('one press on a split ingredient removes its own line (decision 51, Olive Oil v1)', () => {
  it("strikes Whole milk's Step 2 line alone, moves the total, follows the lines still in, and restores", async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));

    expect(totalCell().textContent.endsWith('799.7 g')).toBe(true);
    expect(buttonByLabel('remove Whole milk, Step 2')).not.toBeNull();
    expect(buttonByLabel('remove Whole milk, Step 3')).not.toBeNull();

    await click(buttonByLabel('remove Whole milk, Step 2'));

    expect(nameCell(rowOf('restore Whole milk, Step 2')).querySelector('.struck-value')).not.toBeNull();
    expect(buttonByLabel('restore Whole milk, Step 2')).not.toBeNull();
    const stepThree = rowOf('remove Whole milk, Step 3');
    expect(nameCell(stepThree).querySelector('.struck-value')).toBeNull();
    expect(buttonByLabel('remove Whole milk, Step 3')).not.toBeNull();
    expect(totalCell().textContent.endsWith('679.7 g')).toBe(true);
    expect(totalCell().querySelector('.struck-value').textContent).toBe('799.7');
    expect(noteOf('remove Whole milk, Step 3')).toBe('250.4 g of 250.4 g · 36.8% in all');
    expect(noteOf('restore Whole milk, Step 2')).toBe('120 g of 370.4 g · 46.3% in all');

    await click(buttonByLabel('restore Whole milk, Step 2'));

    expect(totalCell().textContent.endsWith('799.7 g')).toBe(true);
    expect(totalCell().querySelector('.struck-value')).toBeNull();
    expect(noteOf('remove Whole milk, Step 2')).toBe('120 g of 370.4 g · 46.3% in all');
  });
});

describe('a press survives Save as a boolean on the line alone (decision 51, plan 02)', () => {
  it("hands the repository a child whose Whole milk Step 2 line is out and Step 3 line is in, and leaves the parent alone", async () => {
    installMatchMedia();
    const parentBefore = structuredClone(oliveOilVersion);
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await click(buttonByLabel('remove Whole milk, Step 2'));
    await setValue(container.querySelector('input[aria-label="Version name"]'), 'less milk');
    await click(buttonByText(container, 'Save as a new version'));
    await flush(() => store.saveVersion.mock.calls.length > 0);

    expect(store.saveVersion).toHaveBeenCalledTimes(1);
    const saved = store.saveVersion.mock.calls[0][0];
    const milk = saved.rows.find((row) => row.id === 'row-01');
    expect(milk.portions[0].removed).toBe(true);
    expect(milk.portions[1].removed).toBe(false);
    expect(milk.removed).toBe(false);
    for (const row of saved.rows) {
      expect(row.removed).toBe(false);
      row.portions.forEach((portion, i) => {
        expect(typeof portion.removed).toBe('boolean');
        expect(portion.grams).toBe(parentBefore.rows.find((r) => r.id === row.id).portions[i].grams);
        expect(portion.step).toBe(parentBefore.rows.find((r) => r.id === row.id).portions[i].step);
        if (!(row.id === 'row-01' && i === 0)) expect(portion.removed).toBe(false);
      });
    }
    expect(store.versions.find((version) => version.id === VERSION)).toEqual(parentBefore);
  });
});

describe('a saved version with a line out reads without it (decision 51, plan 03)', () => {
  it('opens the saved child in the reading state at the figures the board measured', async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await click(buttonByLabel('remove Whole milk, Step 2'));
    await setValue(container.querySelector('input[aria-label="Version name"]'), 'less milk');
    await click(buttonByText(container, 'Save as a new version'));
    await flush(() => store.saveVersion.mock.calls.length > 0);
    const savedId = store.saveVersion.mock.calls[0][0].id;
    // The MemoryRouter lands on the saved child's route; wait for the reading state.
    await flush(() => current.container.querySelector('.ingredient-table') !== null && buttonByLabel('remove Whole milk, Step 2') === null);

    expect(savedId).not.toBe(VERSION);
    const table = current.container.querySelector('.ingredient-table');
    expect(totalCell().textContent.endsWith('679.7 g')).toBe(true);
    expect(totalCell().querySelector('.struck-value')).toBeNull();
    const milkRows = [...table.querySelectorAll('tbody tr[aria-label]')].filter((tr) => tr.getAttribute('aria-label').startsWith('Whole milk'));
    expect(milkRows).toHaveLength(1);
    expect(milkRows[0].querySelector('.ingredient-table__portion-note').textContent).toBe('250.4 g of 250.4 g · 36.8% in all');
    const cells = milkRows[0].querySelectorAll('td');
    expect(cells[cells.length - 1].textContent).toBe('36.8%');
    const sucroseRows = [...table.querySelectorAll('tbody tr[aria-label]')].filter((tr) => tr.getAttribute('aria-label').startsWith('Sucrose'));
    expect(sucroseRows.map((tr) => tr.querySelector('.ingredient-table__portion-note').textContent)).toEqual([
      '12 g of 76.0 g · 11.2% in all',
      '64 g of 76.0 g · 11.2% in all',
    ]);
    const controls = [...table.querySelectorAll('button')].filter((button) => /^(remove|restore)/.test(button.getAttribute('aria-label') ?? ''));
    expect(controls).toHaveLength(0);
    const heads = [...table.querySelectorAll('.ingredient-table__step-head')].map((tr) => tr.textContent);
    expect(heads.some((text) => text.startsWith('Step 2'))).toBe(true);
  });
});

// Rows of the table by ingredient name, in table order; one entry per line.
function linesOf(name) {
  const table = current.container.querySelector('.ingredient-table');
  return [...table.querySelectorAll('tbody tr[aria-label]')].filter((tr) => tr.getAttribute('aria-label').startsWith(name));
}

function gramsCellOf(tr) {
  return tr.querySelector('.ingredient-table__col-grams');
}

function shareCellOf(tr) {
  const cells = tr.querySelectorAll('td');
  return cells[cells.length - 1];
}

function struck(cell) {
  return [...cell.querySelectorAll('.struck-value')].map((node) => node.textContent);
}

async function saveChildAndShowChanges(container) {
  await setValue(container.querySelector('input[aria-label="Version name"]'), 'less milk');
  await click(buttonByText(container, 'Save as a new version'));
  await flush(() => store.saveVersion.mock.calls.length > 0);
  await flush(() => current.container.querySelector('.ingredient-table') !== null && buttonByText(current.container, 'Show changes') !== null);
  await click(buttonByText(current.container, 'Show changes'));
}

describe('Show changes compares a split ingredient line by line (decision 51, plan 04)', () => {
  it("strikes Whole milk's Step 2 amount and share, and the shares that moved, and nothing that did not", async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await setValue(container.querySelector('input[aria-label="Whole milk, grams, portion 1"]'), '100');
    await saveChildAndShowChanges(container);

    const [stepTwo, stepThree] = linesOf('Whole milk');
    expect(struck(gramsCellOf(stepTwo))).toEqual(['120 g']);
    expect(gramsCellOf(stepTwo).textContent).toBe('120 g100 g');
    expect(struck(shareCellOf(stepTwo))).toEqual(['15.0%']);
    expect(shareCellOf(stepTwo).textContent).toBe('15.0%12.8%');
    expect(struck(gramsCellOf(stepThree))).toEqual([]);
    expect(gramsCellOf(stepThree).textContent).toBe('250.4 g');
    expect(struck(shareCellOf(stepThree))).toEqual(['31.3%']);
    expect(shareCellOf(stepThree).textContent).toBe('31.3%32.1%');
    // Each note reads its own line's grams over the row's lines still in, as the
    // board's measured p_show_edit_1366 does.
    expect(stepTwo.querySelector('.ingredient-table__portion-note').textContent).toBe('100 g of 350.4 g · 44.9% in all');
    expect(stepThree.querySelector('.ingredient-table__portion-note').textContent).toBe('250.4 g of 350.4 g · 44.9% in all');

    const [sucroseTwo, sucroseThree] = linesOf('Sucrose');
    expect(struck(shareCellOf(sucroseTwo))).toEqual([]);
    expect(struck(shareCellOf(sucroseThree))).toEqual(['8.0%']);
    expect(shareCellOf(sucroseThree).textContent).toBe('8.0%8.2%');

    expect(struck(totalCell())).toEqual(['799.7']);
    expect(totalCell().textContent).toBe('799.7779.7 g');
  });
});

describe('Show changes reads a line that is out against the parent (decision 51, plan 04)', () => {
  it("strikes the removed Step 2 milk line, reads it against the parent, and moves the line left to the new batch", async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await click(buttonByLabel('remove Whole milk, Step 2'));
    await saveChildAndShowChanges(container);

    const [stepTwo, stepThree] = linesOf('Whole milk');
    expect(nameCell(stepTwo).querySelector('.struck-value')).not.toBeNull();
    expect(nameCell(stepThree).querySelector('.struck-value')).toBeNull();
    expect(stepTwo.querySelector('.ingredient-table__portion-note').textContent).toBe('120 g of 370.4 g · 46.3% in all');
    expect(stepThree.querySelector('.ingredient-table__portion-note').textContent).toBe('250.4 g of 250.4 g · 36.8% in all');
    expect(struck(gramsCellOf(stepTwo))).toEqual(['120 g']);
    expect(gramsCellOf(stepTwo).textContent).toBe('120 g');
    expect(shareCellOf(stepTwo).textContent).toBe('15.0%');
    expect(shareCellOf(stepThree).textContent).toBe('31.3%36.8%');
    expect(struck(totalCell())).toEqual(['799.7']);
    expect(totalCell().textContent).toBe('799.7679.7 g');
    expect(current.container.querySelector('.ingredient-table').textContent).not.toContain('86.3%');
  });
});

// The table's body in order: a head row's text, or a line's row.
function bodyEntries() {
  const table = current.container.querySelector('.ingredient-table');
  return [...table.querySelectorAll('tbody tr')].map((tr) =>
    tr.classList.contains('ingredient-table__step-head') ? { head: tr.textContent } : { line: tr },
  );
}

function headTexts() {
  return bodyEntries().filter((entry) => entry.head !== undefined).map((entry) => entry.head);
}

// The lines between a head that starts with `headStart` and the next head.
function linesUnder(headStart) {
  const entries = bodyEntries();
  const at = entries.findIndex((entry) => entry.head !== undefined && entry.head.startsWith(headStart));
  const lines = [];
  for (let i = at + 1; i < entries.length && entries[i].head === undefined; i += 1) lines.push(entries[i].line);
  return lines;
}

describe('a removed step takes its lines with it, struck in its own place (decision 51, plan 05)', () => {
  it("strikes the five lines of 'Gum slurry' under Removed, reads 666.0 g, and restores them with the step", async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await click(
      [...container.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === 'Step 2, remove'),
    );

    expect(headTexts()).toEqual([
      'RemovedGum slurry — the only high-heat step',
      'Step 2Build the base',
      'Step 5Allulose in, then crash-cool',
      'Step 7Emulsify the oil, cold',
    ]);
    const removed = linesUnder('Removed');
    expect(removed.map((tr) => nameCell(tr).textContent.replace(/estimated|unreviewed|\d.*$/g, '').trim())).toEqual([
      'Whole milk',
      'Sucrose',
      'Locust bean gum',
      'Guar gum',
      'Lambda carrageenan',
    ]);
    for (const tr of removed) {
      expect(nameCell(tr).querySelector('.struck-value')).not.toBeNull();
      expect(nameCell(tr).querySelector('button')).toBeNull();
    }
    expect(totalCell().textContent.endsWith('666.0 g')).toBe(true);
    expect(struck(totalCell())).toEqual(['799.7']);

    const noteIn = (tr) => nameCell(tr).querySelector('.ingredient-table__portion-note').textContent;
    expect(noteIn(removed[0])).toBe('120 g of 370.4 g · 46.3% in all');
    expect(noteIn(removed[1])).toBe('12 g of 76.0 g · 9.5% in all');
    const stepTwo = linesUnder('Step 2');
    const milk = stepTwo.find((tr) => tr.getAttribute('aria-label').startsWith('Whole milk'));
    const sucrose = stepTwo.find((tr) => tr.getAttribute('aria-label').startsWith('Sucrose'));
    expect(noteIn(milk)).toBe('250.4 g of 250.4 g · 37.6% in all');
    expect(struck(shareCellOf(milk))).toEqual(['31.3%']);
    expect(shareCellOf(milk).textContent).toBe('31.3%37.6%');
    expect(noteIn(sucrose)).toBe('64 g of 64.0 g · 9.6% in all');
    expect(shareCellOf(sucrose).textContent).toBe('8.0%9.6%');
    expect(shareCellOf(removed[0]).textContent).toBe('15.0%');
    expect(struck(shareCellOf(removed[0]))).toEqual(['15.0%']);
    expect(shareCellOf(removed[1]).textContent).toBe('1.5%');

    await click(
      [...container.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === 'Removed step 2, restore'),
    );

    expect(headTexts().map((text) => text.slice(0, 6))).toEqual(['Step 2', 'Step 3', 'Step 6', 'Step 8']);
    expect(headTexts()[0]).toBe('Step 2Gum slurry — the only high-heat step');
    expect(totalCell().textContent.endsWith('799.7 g')).toBe(true);
    expect(totalCell().querySelector('.struck-value')).toBeNull();
    expect(noteOf('remove Whole milk, Step 2')).toBe('120 g of 370.4 g · 46.3% in all');
    expect(noteOf('remove Whole milk, Step 3')).toBe('250.4 g of 370.4 g · 46.3% in all');
  });

  it("restores exactly the lines the step took: a line the maker removed on its own stays out", async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await click(buttonByLabel('remove Whole milk, Step 2'));
    await click(
      [...container.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === 'Step 2, remove'),
    );
    expect(totalCell().textContent.endsWith('666.0 g')).toBe(true);
    await click(
      [...container.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === 'Removed step 2, restore'),
    );

    expect(totalCell().textContent.endsWith('679.7 g')).toBe(true);
    expect(nameCell(rowOf('restore Whole milk, Step 2')).querySelector('.struck-value')).not.toBeNull();
    expect(buttonByLabel('remove Whole milk, Step 3')).not.toBeNull();
  });
});
