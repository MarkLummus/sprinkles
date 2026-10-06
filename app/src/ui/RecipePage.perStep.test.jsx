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

const store = vi.hoisted(() => ({ versions: [], batches: [], saveVersion: null, saveBatch: null }));

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe } = await import('../data/olive-oil.js');
  store.saveVersion = vi.fn(async (record) => {
    const at = store.versions.findIndex((version) => version.id === record.id);
    if (at >= 0) store.versions[at] = structuredClone(record);
    else store.versions.push(structuredClone(record));
  });
  store.saveBatch = vi.fn(async (record) => {
    const at = store.batches.findIndex((batch) => batch.id === record.id);
    if (at >= 0) store.batches[at] = structuredClone(record);
    else store.batches.push(structuredClone(record));
  });
  return {
    repository: {
      getVersion: async (id) => {
        const found = store.versions.find((version) => version.id === id);
        return found ? structuredClone(found) : undefined;
      },
      listVersions: async () => store.versions.map((version) => structuredClone(version)),
      listBatchesForVersion: async (versionId) =>
        store.batches.filter((batch) => batch.versionId === versionId).map((batch) => structuredClone(batch)),
      getAllBatches: async () => store.batches.map((batch) => structuredClone(batch)),
      getBatch: async (id) => {
        const found = store.batches.find((batch) => batch.id === id);
        return found ? structuredClone(found) : undefined;
      },
      getRecipe: async () => oliveOilRecipe,
      saveBatch: store.saveBatch,
      saveVersion: store.saveVersion,
      saveRecipe: vi.fn(async () => {}),
    },
  };
});

import { RecipePage, VERSION_BLOCKED_STATUS } from './RecipePage.jsx';
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
  store.batches = [];
  store.saveVersion.mockClear();
  store.saveBatch.mockClear();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/notebook/:recipeId/:versionId" element={<Keyed />} />
          <Route path="/notebook/:recipeId/:versionId/batch/:batchId" element={<Keyed />} />
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
    // Mark's List row per-step-one-line-left, Mark's answer drop (2026-10-05); sketch 011 README
    // decision 51's "Not drawn" paragraph; 03.6-CONFORMANCE.md "Open for Mark" item 1.
    expect(milkRows[0].querySelector('.ingredient-table__portion-note')).toBeNull();
    expect(milkRows[0].getAttribute('aria-label')).toBe('Whole milk, 250.4 g, estimated');
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

describe('a saved version with every line in keeps its portion lines (per-step-one-line-left guard)', () => {
  it('reads both Whole milk portion lines on v1 at rest', async () => {
    installMatchMedia();
    await mountAt(VERSION_PATH);
    await flush(() => current.container.querySelector('.ingredient-table') !== null);

    const lines = linesOf('Whole milk');
    expect(lines).toHaveLength(2);
    expect(lines.map((tr) => tr.querySelector('.ingredient-table__portion-note').textContent)).toEqual([
      '120 g of 370.4 g · 46.3% in all',
      '250.4 g of 370.4 g · 46.3% in all',
    ]);
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

    // The gums' orphan flags are gone, because each gum row is out with its only
    // line; the removed step's cue names Whole milk and Sucrose as still used.
    expect(current.container.querySelector('.ingredient-table').textContent).not.toContain('used by');
    const cue = current.container.querySelector('.method-step__flag');
    expect(cue).not.toBeNull();
    expect(cue.textContent).toContain('Whole milk');
    expect(cue.textContent).toContain('Sucrose');
    expect(cue.textContent).toContain('still used by step 2');
    expect(cue.textContent).not.toContain('Locust bean gum');

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

describe('Show changes strikes a removed step with its lines (decision 51, plan 06)', () => {
  it("removes 'Gum slurry', saves, and draws its five lines struck under Removed, with the total 799.7 then 666.0 g", async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await click(
      [...container.querySelectorAll('button')].find((button) => button.getAttribute('aria-label') === 'Step 2, remove'),
    );
    await setValue(container.querySelector('input[aria-label="Version name"]'), 'no slurry');
    await click(buttonByText(container, 'Save as a new version'));
    await flush(() => store.saveVersion.mock.calls.length > 0);
    await flush(() => current.container.querySelector('.ingredient-table') !== null && buttonByText(current.container, 'Show changes') !== null);
    await click(buttonByText(current.container, 'Show changes'));

    expect(headTexts()[0]).toBe('RemovedGum slurry — the only high-heat step');
    const removed = linesUnder('Removed');
    const nameOf = (tr) => tr.getAttribute('aria-label');
    expect(removed.map((tr) => ['Whole milk', 'Sucrose', 'Locust bean gum', 'Guar gum', 'Lambda carrageenan'].find((name) => nameOf(tr).startsWith(name)))).toEqual([
      'Whole milk',
      'Sucrose',
      'Locust bean gum',
      'Guar gum',
      'Lambda carrageenan',
    ]);
    for (const tr of removed) expect(nameCell(tr).querySelector('.struck-value')).not.toBeNull();

    for (const name of ['Whole milk', 'Sucrose']) {
      const [, later] = linesOf(name);
      expect(nameCell(later).querySelector('.struck-value')).toBeNull();
    }
    expect(struck(totalCell())).toEqual(['799.7']);
    expect(totalCell().textContent.endsWith('666.0 g')).toBe(true);
  });
});

// Mark's List row per-step-open-pen-with-line-out, Mark's answer fix (2026-10-05);
// 03.6-REVIEW.md WR-02 and WR-03; 03.6-VERIFICATION.md advisory. Next version on a saved
// version that already has a line out: the struck line reads the parent's figures (the
// version the pen opened on has no share for it), and the untouched sibling line announces
// no change that did not happen.
//
// Mounts v1, takes Whole milk's Step 2 line out, saves 'less milk', waits for the saved
// child's Show changes button (proof that the parent read landed), then presses Next
// version on the child.
async function openPenOnChildWithStepTwoMilkOut() {
  installMatchMedia();
  const container = await mountAt(VERSION_PATH);
  await click(buttonByText(container, 'Next version'));
  await click(buttonByLabel('remove Whole milk, Step 2'));
  await setValue(container.querySelector('input[aria-label="Version name"]'), 'less milk');
  await click(buttonByText(container, 'Save as a new version'));
  await flush(() => store.saveVersion.mock.calls.length > 0);
  await flush(() => current.container.querySelector('.ingredient-table') !== null && buttonByText(current.container, 'Show changes') !== null);
  await click(buttonByText(current.container, 'Next version'));
  await flush(() => buttonByLabel('restore Whole milk, Step 2') !== null);
  return container;
}

describe('Next version on a saved version with a line out (Mark\'s List per-step-open-pen-with-line-out: fix)', () => {
  it('reads the struck Step 2 line against the parent, and names the untouched Step 3 line without a false change', async () => {
    await openPenOnChildWithStepTwoMilkOut();

    expect(totalCell().textContent.endsWith('679.7 g')).toBe(true);
    expect(totalCell().querySelector('.struck-value')).toBeNull();
    expect(noteOf('restore Whole milk, Step 2')).toBe('120 g of 370.4 g · 46.3% in all');
    expect(struck(shareCellOf(rowOf('restore Whole milk, Step 2')))).toEqual(['15.0%']);
    expect(noteOf('remove Whole milk, Step 3')).toBe('250.4 g of 250.4 g · 36.8% in all');
    expect(shareCellOf(rowOf('remove Whole milk, Step 3')).textContent).toBe('36.8%');
    expect(struck(shareCellOf(rowOf('remove Whole milk, Step 3')))).toEqual([]);
    expect(rowOf('remove Whole milk, Step 3').getAttribute('aria-label')).toBe('Whole milk, 250.4 g, estimated');
    expect(rowOf('restore Whole milk, Step 2').getAttribute('aria-label')).toBe('Whole milk, 250.4 g, estimated, removed');
    const markup = current.container.querySelector('.ingredient-table').outerHTML;
    expect(markup).not.toContain('120 g of 250.4 g');
    expect(markup).not.toContain('17.7%');
    expect(markup).not.toContain('54.5%');
  });

  it('restoring the line that was out moves the total, and the restored line has no share to strike', async () => {
    await openPenOnChildWithStepTwoMilkOut();
    await click(buttonByLabel('restore Whole milk, Step 2'));

    expect(struck(totalCell())).toEqual(['679.7']);
    expect(totalCell().textContent.endsWith('799.7 g')).toBe(true);
    const stepTwoShare = shareCellOf(rowOf('remove Whole milk, Step 2'));
    expect(stepTwoShare.textContent).toBe('15.0%');
    expect(struck(stepTwoShare)).toEqual([]);
    expect(noteOf('remove Whole milk, Step 2')).toBe('120 g of 370.4 g · 46.3% in all');
    const stepThreeShare = shareCellOf(rowOf('remove Whole milk, Step 3'));
    expect(struck(stepThreeShare)).toEqual(['36.8%']);
    expect(stepThreeShare.textContent).toBe('36.8%31.3%');
    expect(noteOf('remove Whole milk, Step 3')).toBe('250.4 g of 370.4 g · 46.3% in all');
    expect(rowOf('remove Whole milk, Step 3').getAttribute('aria-label')).toBe('Whole milk, 250.4 g, was 36.8%, now 46.3%, estimated');
  });
});

// A blocked save names the first blocked line that is in: focus lands on its field and only
// that line is marked (Mark's List row per-step-open-pen-with-line-out; 03.6-REVIEW.md WR-04).
describe('A blocked save focuses and marks the blocked line (Mark\'s List per-step-open-pen-with-line-out: fix)', () => {
  it('on the saved child, a blank Step 3 amount focuses the Step 3 field and marks the Step 3 line alone', async () => {
    const container = await openPenOnChildWithStepTwoMilkOut();
    store.saveVersion.mockClear();
    await setValue(container.querySelector('input[aria-label="Version name"]'), 'less milk again');
    await setValue(container.querySelector('input[aria-label="Whole milk, grams, portion 2"]'), '');
    await click(buttonByText(container, 'Save as a new version'));

    expect(document.activeElement.getAttribute('aria-label')).toBe('Whole milk, grams, portion 2');
    expect(rowOf('remove Whole milk, Step 3').classList.contains('is-marked')).toBe(true);
    expect(rowOf('restore Whole milk, Step 2').classList.contains('is-marked')).toBe(false);
    expect(store.saveVersion).not.toHaveBeenCalled();
  });

  it('on v1, a blank Step 2 amount focuses the Step 2 field and marks the Step 2 line alone', async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await setValue(container.querySelector('input[aria-label="Version name"]'), 'less milk');
    await setValue(container.querySelector('input[aria-label="Whole milk, grams, portion 1"]'), '');
    await click(buttonByText(container, 'Save as a new version'));

    expect(document.activeElement.getAttribute('aria-label')).toBe('Whole milk, grams, portion 1');
    expect(rowOf('remove Whole milk, Step 2').classList.contains('is-marked')).toBe(true);
    expect(rowOf('remove Whole milk, Step 3').classList.contains('is-marked')).toBe(false);
  });
});

// Sketch 011 README decision 57, Mark's answer "A recommended" (2026-10-05): when Save is
// blocked on an ingredient line, the sentence prints last in that line's own name cell, the
// field is invalid and described by it, and typing clears it with the outline.
describe('A blocked save prints its sentence in the blocked line (sketch 011 decision 57: A recommended)', () => {
  const field = (label) => current.container.querySelector(`input[aria-label="${label}"]`);
  const sentences = () => [...current.container.querySelectorAll('.field-error')];
  const statusText = () =>
    [...current.container.querySelectorAll('.form-status, .save-ceremony__status')].map((el) => el.textContent).join('');

  async function blockOn(label, value) {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await setValue(container.querySelector('input[aria-label="Version name"]'), 'v2');
    await setValue(field(label), value);
    await click(buttonByText(container, 'Save as a new version'));
    return container;
  }

  it('on a split line, prints under the Step 3 portion line and nowhere else', async () => {
    const container = await blockOn('Whole milk, grams, portion 2', '');

    const found = sentences();
    expect(found).toHaveLength(1);
    expect(found[0].textContent).toBe('Whole milk needs an amount, or remove it');
    const cell = nameCell(rowOf('remove Whole milk, Step 3'));
    expect(found[0].closest('td')).toBe(cell);
    expect(cell.lastElementChild).toBe(found[0]);
    expect(found[0].previousElementSibling.classList.contains('ingredient-table__portion-note')).toBe(true);
    expect(found[0].id).not.toBe('');
    expect(field('Whole milk, grams, portion 2').getAttribute('aria-invalid')).toBe('true');
    expect(field('Whole milk, grams, portion 2').getAttribute('aria-describedby')).toBe(found[0].id);
    expect(field('Whole milk, grams, portion 1').hasAttribute('aria-invalid')).toBe(false);
    expect(field('Whole milk, grams, portion 1').hasAttribute('aria-describedby')).toBe(false);
    expect(statusText()).toBe('');
    expect(container.querySelector('#version-field-error')).toBeNull();
    expect(store.saveVersion).not.toHaveBeenCalled();
  });

  it('on a one-line row, prints last in that row\'s name cell', async () => {
    await blockOn('Heavy cream, grams', '');

    const found = sentences();
    expect(found).toHaveLength(1);
    expect(found[0].textContent).toBe('Heavy cream needs an amount, or remove it');
    const cell = nameCell(field('Heavy cream, grams').closest('tr'));
    expect(cell.lastElementChild).toBe(found[0]);
    expect(field('Heavy cream, grams').getAttribute('aria-invalid')).toBe('true');
    expect(field('Heavy cream, grams').getAttribute('aria-describedby')).toBe(found[0].id);
  });

  it('for a value that is not a number, says so in the same line', async () => {
    await blockOn('Whole milk, grams, portion 2', '4o');

    const found = sentences();
    expect(found).toHaveLength(1);
    expect(found[0].textContent).toBe("Whole milk's amount is not a number");
    expect(found[0].closest('td')).toBe(nameCell(rowOf('remove Whole milk, Step 3')));
    expect(field('Whole milk, grams, portion 2').getAttribute('aria-invalid')).toBe('true');
  });

  it('typing one character in the blocked field removes the sentence, the attributes and the outline', async () => {
    await blockOn('Whole milk, grams, portion 2', '');
    expect(sentences()).toHaveLength(1);

    await setValue(field('Whole milk, grams, portion 2'), '2');

    expect(sentences()).toHaveLength(0);
    expect(field('Whole milk, grams, portion 2').hasAttribute('aria-invalid')).toBe(false);
    expect(field('Whole milk, grams, portion 2').hasAttribute('aria-describedby')).toBe(false);
    expect(rowOf('remove Whole milk, Step 3').classList.contains('is-marked')).toBe(false);
  });

  it('leaves the version line as built: first blocked wins, nothing in the table', async () => {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await setValue(field('Heavy cream, grams'), '');
    await click(buttonByText(container, 'Save as a new version'));

    expect(container.querySelector('#version-field-error').textContent).toBe('Enter a version.');
    expect(field('Version name').getAttribute('aria-invalid')).toBe('true');
    expect(field('Version name').getAttribute('aria-describedby')).toBe('version-field-error');
    expect(statusText()).toContain(VERSION_BLOCKED_STATUS);
    expect(sentences()).toHaveLength(1);
    expect(container.querySelector('.ingredient-table .field-error')).toBeNull();
    expect(container.querySelector('.ingredient-table input[aria-invalid]')).toBeNull();
  });
});

// Sketch 011 README decision 56, Mark's answer "A recommended" (2026-10-05): recording, and
// Correct, read a split ingredient with one line left like the Sheet; each value stays at
// its stored index, so nothing stored changes.
describe('Recording reads like the Sheet when one line is left (sketch 011 decision 56: A recommended)', () => {
  const band = () => current.container.querySelector('.notebook-version__acts .notebook-action');
  // One tbody per step group (sketch 011 decision 45): every group's rows, in table order.
  const bodyRows = (selector) => [...current.container.querySelectorAll('.ingredient-table tbody')].flatMap((body) => [...body.querySelectorAll(selector)]);
  const field = (label) => current.container.querySelector(`input[aria-label="${label}"]`);
  const rowsNamed = (name) => bodyRows('tr[aria-label]').filter((tr) => tr.getAttribute('aria-label').startsWith(name));
  const asMadeFieldsOf = (name) =>
    bodyRows('input').map((input) => input.getAttribute('aria-label')).filter((label) => label.startsWith(`${name}, as made`));
  const totalRowLabel = () => current.container.querySelector('tfoot tr').getAttribute('aria-label');

  async function reachV2() {
    installMatchMedia();
    const container = await mountAt(VERSION_PATH);
    await click(buttonByText(container, 'Next version'));
    await click(buttonByLabel('remove Whole milk, Step 2'));
    await setValue(container.querySelector('input[aria-label="Version name"]'), 'less milk');
    await click(buttonByText(container, 'Save as a new version'));
    await flush(() => store.saveVersion.mock.calls.length > 0);
    const savedId = store.saveVersion.mock.calls[0][0].id;
    await flush(() => current.container.querySelector('.ingredient-table') !== null && buttonByLabel('remove Whole milk, Step 2') === null);
    return savedId;
  }

  it('records, saves and corrects Whole milk as one line with its one field at stored index 1', async () => {
    const childId = await reachV2();
    expect(band().textContent).toBe('Record a batch');
    await click(band());
    await flush(() => current.container.querySelector('input[type="date"]') !== null);

    const milk = rowsNamed('Whole milk');
    expect(milk).toHaveLength(1);
    expect(milk[0].querySelector('.ingredient-table__portion-note')).toBeNull();
    expect(asMadeFieldsOf('Whole milk')).toEqual(['Whole milk, as made, grams']);
    expect(rowsNamed('Sucrose').map((tr) => tr.querySelector('.ingredient-table__portion-note').textContent)).toEqual([
      '12 g of 76.0 g · 11.2% in all',
      '64 g of 76.0 g · 11.2% in all',
    ]);
    expect(asMadeFieldsOf('Sucrose')).toEqual(['Sucrose, as made, grams, portion 1', 'Sucrose, as made, grams, portion 2']);

    await setValue(field('Whole milk, as made, grams'), '245');
    await setValue(field('Sucrose, as made, grams, portion 1'), '12.5');
    await setValue(field('Sucrose, as made, grams, portion 2'), '63');
    expect(totalRowLabel()).toBe('Total, plan 679.7 grams, as made 673.8 grams');

    await setValue(current.container.querySelector('input[type="date"]'), '2026-10-01');
    await click(buttonByText(current.container, 'Save batch'));
    await flush(() => store.saveBatch.mock.calls.length > 0);
    expect(store.saveBatch).toHaveBeenCalledTimes(1);
    const record = store.saveBatch.mock.calls[0][0];
    expect(record.versionId).toBe(childId);
    expect(record.churn.asMade['row-01']).toEqual([null, 245]);
    expect(record.churn.asMade['row-05']).toEqual([12.5, 63]);

    await flush(() => current.container.querySelector('.batch-row__correct') !== null);
    expect(rowsNamed('Whole milk')[0].getAttribute('aria-label')).toBe('Whole milk, 250.4 g, estimated, as made 245 g');

    await click(current.container.querySelector('.batch-row__correct'));
    await flush(() => field('Whole milk, as made, grams') !== null);
    expect(field('Whole milk, as made, grams').value).toBe('245');
    expect(field('Sucrose, as made, grams, portion 1').value).toBe('12.5');
    expect(field('Sucrose, as made, grams, portion 2').value).toBe('63');
    expect(asMadeFieldsOf('Whole milk')).toEqual(['Whole milk, as made, grams']);
    expect(totalRowLabel()).toBe('Total, plan 679.7 grams, as made 673.8 grams');
  });
});
