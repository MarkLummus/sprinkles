// @vitest-environment jsdom
//
// The Next version pen changes the order of the steps (sketch 017, the version
// pen: changing the order of steps; Mark's answers of 2026-11-23 on
// bug-p11-pen-steps-no-reorder, decide-p12-pen-order-scope and
// look-p12-pen-step-order). Slice 1: the pen moves a step and saves the order. The
// "was step N" mark is slice 2's: the last describe below asserts it.
//
// One real fake-indexeddb store, the page built as the app builds it
// (RecipePage.stalePen.test.jsx's setup): no repository mock, so the kept draft,
// the restore and both saves run through the real transactions.
//
// repository.js opens its connection when its module loads, so the fake must
// exist before any module that imports the repository: this import stays first.
import 'fake-indexeddb/auto';
import { StrictMode, act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router';

import { repository } from '../store/repository.js';
import { seedIfEmpty } from '../store/seed.js';
import { loadCatalog } from '../store/catalog.js';
import { RecipePageForRoute } from '../router.jsx';
import { CatalogProvider } from './CatalogContext.jsx';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { library } from '../data/library.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let caseNumber = 0;
let RECIPE_ID = '';
let VERSION_ID = '';
let PAGE_PATH = '';
const NOW = '2026-11-23T12:00:00.000Z';

let tabs = [];
let originalMatchMedia = null;
const unhandled = [];
const onUnhandled = (reason) => unhandled.push(reason);

function installMatchMedia() {
  Element.prototype.scrollIntoView = vi.fn();
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => {
    const max = query.match(/max-width:\s*([\d.]+)px/);
    const min = query.match(/min-width:\s*([\d.]+)px/);
    let matches = false;
    if (max) matches = 1280 <= Number(max[1]);
    else if (min) matches = 1280 >= Number(min[1]);
    return { matches, media: query, addEventListener() {}, removeEventListener() {} };
  };
}

// The store is real, so a wait is real time: each turn lets fake-indexeddb run.
async function settle(until = () => false, turns = 80) {
  for (let i = 0; i < turns; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    if (until()) return;
  }
}

async function openTab(path, catalog) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const tab = { container, root, location: null };
  tabs.push(tab);
  function Where() {
    tab.location = useLocation();
    return null;
  }
  await act(async () => {
    root.render(
      <StrictMode>
        <CatalogProvider initialCatalog={catalog}>
          <MemoryRouter initialEntries={[path]}>
            <Where />
            <Routes>
              <Route element={<Outlet context={0} />}>
                <Route path="/notebook/:recipeId/:versionId" element={<RecipePageForRoute />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </CatalogProvider>
      </StrictMode>,
    );
  });
  return tab;
}

async function unmountTab(tab) {
  await act(async () => tab.root.unmount());
  tab.container.remove();
  tabs = tabs.filter((candidate) => candidate !== tab);
}

const field = (tab, label) => tab.container.querySelector(`[aria-label="${label}"]`);
const buttonByText = (tab, text) => [...tab.container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
const penOf = (tab) => tab.container.querySelector('form[aria-label="Next version"]');
const region = (tab) => tab.container.querySelector('.method-region');

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

async function type(element, value) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

// The press helper: the control inside the Instructions section with this name.
function control(tab, label) {
  const found = region(tab).querySelector(`[aria-label="${label}"]`);
  if (!found) throw new Error(`no control named ${label}`);
  return found;
}
async function press(tab, label) {
  await click(control(tab, label));
}

const stepItems = (tab) => [...region(tab).querySelectorAll('ol.method-steps > li')];
// An open step shows its lead-in in a field, a closed one in its line.
const leadOf = (li) =>
  li.querySelector('.method-step__lead b')?.textContent.replace(/\.$/, '') ?? li.querySelector('textarea[aria-label$=", lead-in"]').value;
const order = (tab) => stepItems(tab).map(leadOf);
const numbers = (tab) => stepItems(tab).map((li) => li.querySelector('.method-step__n').textContent);
const stepHeads = (tab) => [...tab.container.querySelectorAll('tr.ingredient-table__step-head')].map((tr) => tr.textContent);

const STEEP_ORDER = ['Steep', 'Strain', 'Rest', 'Sweeten', 'Churn'];

// Version 1 of the board's example (sketch 017 pen-step-order.html): Coffee, three
// ingredients, five steps whose stored keys read [1, 2, 4, 3, 5] (Rest is key 4,
// Sweeten key 3). No batch and no child.
async function storeCoffee() {
  const rows = [
    rowFromLibraryRecord({ id: 'heavyCream', entry: library.heavyCream }, { id: 'row-cream', grams: 400, step: 1 }),
    rowFromLibraryRecord({ id: 'coffeeBeans', entry: library.coffeeBeans }, { id: 'row-beans', grams: 40, step: 1 }),
    rowFromLibraryRecord({ id: 'dextrose', entry: library.dextrose }, { id: 'row-dex', grams: 120, step: 3 }),
  ];
  const step = (n, leadIn, instruction, uses = []) => ({ n, leadIn, instruction, uses, targets: [], removed: false });
  const method = [
    step(1, 'Steep', 'Steep the beans in the cream, cold, overnight.', ['row-cream', 'row-beans']),
    step(2, 'Strain', 'Strain out the beans and press them.'),
    step(4, 'Rest', 'Rest the base in the fridge for four hours.'),
    step(3, 'Sweeten', 'Whisk in the dextrose until it dissolves.', ['row-dex']),
    step(5, 'Churn', 'Churn until it holds a soft peak.'),
  ];
  const { recipe, version } = createRecipe(
    { name: 'Coffee', versionLabel: 'Version 1', rows, method },
    { recipeId: RECIPE_ID, versionId: VERSION_ID, now: NOW },
  );
  await repository.createRecipeWithVersion({ recipe, version });
  return { recipe, version };
}

async function openPen(catalog, path = PAGE_PATH) {
  const tab = await openTab(path, catalog);
  await settle(() => buttonByText(tab, 'Next version') !== null);
  await click(buttonByText(tab, 'Next version'));
  await settle(() => penOf(tab) !== null);
  expect(penOf(tab)).not.toBeNull();
  return tab;
}

let catalog = null;

beforeEach(async () => {
  caseNumber += 1;
  RECIPE_ID = `r-coffee-${caseNumber}`;
  VERSION_ID = `v-coffee-${caseNumber}`;
  PAGE_PATH = `/notebook/${RECIPE_ID}/${VERSION_ID}`;
  installMatchMedia();
  process.on('unhandledRejection', onUnhandled);
  await seedIfEmpty(repository);
  catalog = await loadCatalog(repository);
});

afterEach(async () => {
  for (const tab of tabs) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => tab.root.unmount());
    tab.container.remove();
  }
  tabs = [];
  process.off('unhandledRejection', onUnhandled);
  unhandled.length = 0;
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = null;
  delete Element.prototype.scrollIntoView;
});

describe('the Next version pen draws and changes the order of the steps (sketch 017, slice 1)', () => {
  it('T1: every closed live step offers Edit this step, Move up, Move down, Remove, and the ends are grey', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);

    expect(order(tab)).toEqual(STEEP_ORDER);
    const lines = [...region(tab).querySelectorAll('p.method-step__acts')];
    expect(lines).toHaveLength(5);
    lines.forEach((line, index) => {
      const buttons = [...line.querySelectorAll('button')];
      const n = index + 1;
      expect(buttons.map((b) => b.textContent.trim())).toEqual(['Edit this step', 'Move up', 'Move down', 'Remove']);
      expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
        `Step ${n}, edit this step`,
        `Step ${n}, move up`,
        `Step ${n}, move down`,
        `Step ${n}, remove`,
      ]);
    });
    for (const label of ['Step 1, move up', 'Step 5, move down']) {
      const grey = control(tab, label);
      expect(grey.classList.contains('mk-off')).toBe(true);
      expect(grey.getAttribute('aria-disabled')).toBe('true');
      expect(grey.getAttribute('tabindex')).toBe('0');
    }
    const live = [...region(tab).querySelectorAll('button[aria-label$=", move up"], button[aria-label$=", move down"]')].filter(
      (b) => !['Step 1, move up', 'Step 5, move down'].includes(b.getAttribute('aria-label')),
    );
    expect(live).toHaveLength(8);
    for (const b of live) {
      expect(b.classList.contains('mk-off')).toBe(false);
      expect(b.hasAttribute('aria-disabled')).toBe(false);
    }
    expect(region(tab).querySelectorAll('button')).toHaveLength(20);
    expect(region(tab).querySelectorAll('[aria-keyshortcuts]')).toHaveLength(0);
    expect(region(tab).querySelectorAll('.mk-keys')).toHaveLength(0);
  });

  it('T2: a press moves the step one place, no key changes, and the table follows', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    expect(stepHeads(tab)).toEqual(['Step 1Steep', 'Step 4Sweeten']);

    await press(tab, 'Step 4, move up');
    expect(order(tab)).toEqual(['Steep', 'Strain', 'Sweeten', 'Rest', 'Churn']);
    expect(numbers(tab)).toEqual(['1', '2', '3', '4', '5']);
    expect(stepItems(tab).map((li) => li.id)).toEqual(['method-step-1', 'method-step-2', 'method-step-3', 'method-step-4', 'method-step-5']);
    expect(stepItems(tab)[2].querySelector('[aria-label="Step 3, edit this step"]')).not.toBeNull();

    await press(tab, 'Step 3, move up');
    expect(order(tab)).toEqual(['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn']);
    expect(stepHeads(tab)).toEqual(['Step 1Steep', 'Step 2Sweeten']);
  });

  it('T3: a changed order is unsaved work: kept, and moving back leaves none', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    await press(tab, 'Step 4, move up');
    await press(tab, 'Step 3, move up');
    await settle(() => false, 40);

    const kept = await repository.getDraft(VERSION_ID);
    expect(kept.kind).toBe('plan');
    expect(kept.payload.method.map((step) => step.n)).toEqual([1, 3, 2, 4, 5]);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(penOf(tab)).not.toBeNull();

    await press(tab, 'Step 2, move down');
    await press(tab, 'Step 3, move down');
    expect(order(tab)).toEqual(STEEP_ORDER);
    await settle(async () => (await repository.getDraft(VERSION_ID)) === undefined, 40);
    const after = await repository.getDraft(VERSION_ID);
    expect(after == null || after.kind !== 'plan').toBe(true);

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    await settle(() => penOf(tab) === null);
    expect(penOf(tab)).toBeNull();
  });

  it('T4: the kept draft restores with its order after a reload', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    await press(tab, 'Step 4, move up');
    await press(tab, 'Step 3, move up');
    await settle(() => false, 40);
    await unmountTab(tab);

    const again = await openTab(PAGE_PATH, catalog);
    await settle(() => penOf(again) !== null);
    expect(penOf(again)).not.toBeNull();
    expect(order(again)).toEqual(['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn']);
  });

  it('T5: Save as new version stores the order and the child reads in it', async () => {
    const { version } = await storeCoffee();
    const tab = await openPen(catalog);
    await press(tab, 'Step 4, move up');
    await press(tab, 'Step 3, move up');
    await type(field(tab, 'Version name'), 'sweeten warm');
    await click(buttonByText(tab, 'Save as new version'));
    await settle(() => tab.location.pathname !== PAGE_PATH);
    expect(tab.location.pathname).not.toBe(PAGE_PATH);
    await settle(() => region(tab) !== null && penOf(tab) === null && order(tab).length === 5);

    const versions = await repository.listVersions();
    const child = versions.find((candidate) => candidate.parentVersionId === VERSION_ID);
    expect(child).toBeDefined();
    expect(child.method.map((step) => step.n)).toEqual([1, 3, 2, 4, 5]);
    for (const step of child.method) {
      const parent = version.method.find((candidate) => candidate.n === step.n);
      expect(step.leadIn).toBe(parent.leadIn);
      expect(step.instruction).toBe(parent.instruction);
    }
    const stored = await repository.getVersion(VERSION_ID);
    expect(stored.method.map((step) => step.n)).toEqual([1, 2, 4, 3, 5]);

    expect(order(tab)).toEqual(['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn']);
    expect(numbers(tab)).toEqual(['1', '2', '3', '4', '5']);
    expect(region(tab).querySelectorAll('button[aria-label$=", move up"], button[aria-label$=", move down"]')).toHaveLength(0);
    expect(unhandled).toEqual([]);
  });
});

// Sketch 017 CONTRACT section 3 and README decisions 4 and 5: focus stays on the
// pressed Move button of the moved step (the step's other one when it turned
// grey), and "Step N of M" is said in a polite region. The words and the focus rule
// are the creation editor's own, shared (app/src/ui/StepMoves.jsx), so these cases
// and CreationStructure.test.jsx's hold one copy.
describe('the pen keeps focus on the moved step and says where it went (sketch 017, slice 1)', () => {
  // The animation frames the pen asked for and has not yet been given, by id.
  let frames = new Map();
  let nextFrame = 0;

  beforeEach(() => {
    frames = new Map();
    nextFrame = 0;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      nextFrame += 1;
      frames.set(nextFrame, callback);
      return nextFrame;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The page asked for frames since the last call: run them, as a browser would.
  async function nextFrames() {
    const due = [...frames.values()];
    frames = new Map();
    await act(async () => {
      for (const callback of due) callback(0);
    });
  }

  const wordOf = (tab) => {
    const found = region(tab).querySelectorAll('.visually-hidden[role="status"][aria-live="polite"]');
    expect(found).toHaveLength(1);
    return found[0].textContent;
  };
  const focusedLabel = () => document.activeElement?.getAttribute('aria-label') ?? null;
  const acts = (li) => [...li.querySelectorAll('p.method-step__acts button')].map((b) => b.textContent.trim());

  it('F1: focus stays on the pressed button of the moved step, and the word is said on the next frame', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);

    await press(tab, 'Step 4, move up');
    expect(focusedLabel()).toBe('Step 3, move up');
    expect(stepItems(tab)[2].contains(document.activeElement)).toBe(true);
    expect(wordOf(tab)).toBe('');
    await nextFrames();
    expect(wordOf(tab)).toBe('Step 3 of 5');

    await press(tab, 'Step 3, move up');
    expect(wordOf(tab)).toBe('');
    expect(focusedLabel()).toBe('Step 2, move up');
    await nextFrames();
    expect(wordOf(tab)).toBe('Step 2 of 5');
  });

  it('F2: at an end the focus goes to the step\'s other Move button, and a grey press does nothing', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    await press(tab, 'Step 4, move up');
    await press(tab, 'Step 3, move up');
    await nextFrames();

    await press(tab, 'Step 2, move up');
    expect(order(tab)).toEqual(['Sweeten', 'Steep', 'Strain', 'Rest', 'Churn']);
    expect(control(tab, 'Step 1, move up').classList.contains('mk-off')).toBe(true);
    expect(focusedLabel()).toBe('Step 1, move down');
    await nextFrames();
    expect(wordOf(tab)).toBe('Step 1 of 5');

    const asked = nextFrame;
    await press(tab, 'Step 1, move up');
    expect(order(tab)).toEqual(['Sweeten', 'Steep', 'Strain', 'Rest', 'Churn']);
    expect(focusedLabel()).toBe('Step 1, move down');
    expect(wordOf(tab)).toBe('Step 1 of 5');
    expect(nextFrame).toBe(asked);

    await press(tab, 'Step 4, move down');
    expect(order(tab)).toEqual(['Sweeten', 'Steep', 'Strain', 'Churn', 'Rest']);
    expect(control(tab, 'Step 5, move down').classList.contains('mk-off')).toBe(true);
    expect(focusedLabel()).toBe('Step 5, move up');
    await nextFrames();
    expect(wordOf(tab)).toBe('Step 5 of 5');
  });

  it('F3: a removed step offers Edit this step and Restore, and one press passes it', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);

    await press(tab, 'Step 3, remove');
    const rest = stepItems(tab)[2];
    expect(acts(rest)).toEqual(['Edit this step', 'Restore']);
    expect(control(tab, 'Step 2, move down').classList.contains('mk-off')).toBe(false);
    expect(region(tab).querySelectorAll('button')).toHaveLength(18);

    await press(tab, 'Step 3, move up');
    expect(order(tab)).toEqual(['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn']);
    expect(numbers(tab)).toEqual(['1', '2', '3', '', '4']);
    await nextFrames();
    expect(wordOf(tab)).toBe('Step 2 of 4');

    const restButton = [...stepItems(tab)[3].querySelectorAll('button')].find((b) => b.textContent.trim() === 'Restore');
    await click(restButton);
    expect(numbers(tab)).toEqual(['1', '2', '3', '4', '5']);
    expect(order(tab)).toEqual(['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn']);
    expect(acts(stepItems(tab)[3])).toEqual(['Edit this step', 'Move up', 'Move down', 'Remove']);
  });

  it('F4: an open step has no Move and stays open while another step moves past it', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);

    await press(tab, 'Step 2, edit this step');
    const open = () => region(tab).querySelector('#method-step-2');
    expect(open().querySelector('[aria-label$=", move up"], [aria-label$=", move down"]')).toBeNull();
    expect(open().querySelector('.method-step__body').lastElementChild.classList.contains('method-step__done-cancel')).toBe(true);
    expect(region(tab).querySelectorAll('button[aria-label$=", move up"]')).toHaveLength(4);

    await press(tab, 'Step 4, move up');
    expect(order(tab)).toEqual(['Steep', 'Strain', 'Sweeten', 'Rest', 'Churn']);
    expect(field(tab, 'Step 2, lead-in')).not.toBeNull();

    await press(tab, 'Step 3, move up');
    expect(order(tab)).toEqual(['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn']);
    const lead = field(tab, 'Step 3, lead-in');
    expect(lead).not.toBeNull();
    await type(lead, 'Strained');
    const cancel = [...open().querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cancel');
    await click(cancel);
    expect(order(tab)).toEqual(['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn']);
    expect(field(tab, 'Step 3, lead-in')).toBeNull();
  });

  it('F5: one live step has both Moves grey and doing nothing; none live has no Move', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await press(tab, 'Step 1, remove');
    }
    for (const label of ['Step 1, move up', 'Step 1, move down']) {
      const grey = control(tab, label);
      expect(grey.classList.contains('mk-off')).toBe(true);
      expect(grey.getAttribute('aria-disabled')).toBe('true');
    }
    const before = order(tab);
    const asked = nextFrame;
    await press(tab, 'Step 1, move up');
    await press(tab, 'Step 1, move down');
    expect(order(tab)).toEqual(before);
    expect(nextFrame).toBe(asked);

    await press(tab, 'Step 1, remove');
    expect(region(tab).querySelectorAll('button[aria-label$=", move up"], button[aria-label$=", move down"]')).toHaveLength(0);
  });
});

// Sketch 017 CONTRACT section 5, choice A (decide-p12-pen-order-mark = A): once the order
// of the live steps differs from the version the pen opened on, every live step whose
// number changed reads " was step N" after its words, N being its number on that
// version. Moving back clears every mark; a removal alone marks nothing new.
describe('the pen marks a step whose number changed with its number on the opened version (sketch 017 CONTRACT section 5, slice 2)', () => {
  const SKIPPED = 'span.method-step__skipped-label';
  // Per step in document order: the joined text of the marks in its lead, or ''.
  const marks = (tab) =>
    stepItems(tab).map((li) => [...li.querySelectorAll(`.method-step__lead ${SKIPPED}`)].map((span) => span.textContent).join(''));
  const markCount = (tab) => region(tab).querySelectorAll(SKIPPED).length;

  it("W1: the pen says 'was step N' as the steps are moved, and moving back clears it", async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    expect(markCount(tab)).toBe(0);

    await press(tab, 'Step 4, move up');
    expect(marks(tab)).toEqual(['', '', ' was step 4', ' was step 3', '']);
    const lead = stepItems(tab)[2].querySelector('p.method-step__lead');
    const span = lead.lastElementChild;
    expect(span.matches(SKIPPED)).toBe(true);
    expect(span.previousElementSibling.querySelector('b').textContent).toBe('Sweeten.');

    await press(tab, 'Step 3, move up');
    expect(marks(tab)).toEqual(['', ' was step 4', ' was step 2', ' was step 3', '']);

    await press(tab, 'Step 2, move down');
    await press(tab, 'Step 3, move down');
    expect(order(tab)).toEqual(STEEP_ORDER);
    expect(markCount(tab)).toBe(0);
  });

  it('W2(a): a removal alone marks nothing new', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    await press(tab, 'Step 3, remove');
    // Bound: a removal alone passes before the change as well.
    expect(marks(tab)).toEqual(['', '', ' removed', '', '']);
  });

  it('W2(b): with a move every changed number is marked, and Restore brings pm-twice back', async () => {
    await storeCoffee();
    const tab = await openPen(catalog);
    await press(tab, 'Step 4, move up');
    await press(tab, 'Step 3, move up');
    await press(tab, 'Step 4, remove');
    expect(marks(tab)).toEqual(['', ' was step 4', ' was step 2', ' removed', ' was step 5']);
    expect(numbers(tab)).toEqual(['1', '2', '3', '', '4']);

    const restore = stepItems(tab)[3].querySelector('[aria-label$=", restore"]');
    expect(restore).not.toBeNull();
    await click(restore);
    expect(marks(tab)).toEqual(['', ' was step 4', ' was step 2', ' was step 3', '']);
  });
});
