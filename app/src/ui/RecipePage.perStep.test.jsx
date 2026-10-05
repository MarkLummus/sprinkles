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
