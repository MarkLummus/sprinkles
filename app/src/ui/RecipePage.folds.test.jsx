// @vitest-environment jsdom
//
// Quick task 261004-oxa (sketch 011 decision 33, brief task 4): Balance and
// Watch for open by default wherever the Sheet is two columns (from 984),
// while Version details, History, Tasting and the batch list keep their 1366
// default (decision 18, unchanged). Each fold returns to its own width's
// default when the window crosses its own cut, and nothing is stored.
//
// A sibling jsdom file, for the reason RecipePage.recordTasting.test.jsx
// gives: the behaviour is the page's own state across a width crossing, which
// renderToStaticMarkup cannot show, and RecipePage.test.jsx must keep running
// with no window in scope. RecipePage is mounted whole over an in-memory
// stand-in for the repository seam, behind a mutable-width window.matchMedia
// (the shape Shell.flyout.test.jsx uses).
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe, oliveOilVersion } = await import('../data/olive-oil.js');
  const { augustSecondBatch } = await import('../data/batch-2026-08-02.js');
  return {
    repository: {
      getVersion: async (id) => (id === oliveOilVersion.id ? oliveOilVersion : undefined),
      listVersions: async () => [oliveOilVersion],
      listBatchesForVersion: async () => [structuredClone(augustSecondBatch)],
      getAllBatches: async () => [structuredClone(augustSecondBatch)],
      getBatch: async (id) => (id === augustSecondBatch.id ? structuredClone(augustSecondBatch) : undefined),
      getRecipe: async () => oliveOilRecipe,
      saveBatch: vi.fn(async () => {}),
      saveVersion: vi.fn(async () => {}),
      saveRecipe: vi.fn(async () => {}),
    },
  };
});

import { RecipePage } from './RecipePage.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const PATH = `/notebook/${oliveOilVersion.recipeId}/${oliveOilVersion.id}/batch/${augustSecondBatch.id}`;

// A mutable window width behind window.matchMedia: every list keeps its
// 'change' listeners, and setWidth recomputes each query and fires 'change'
// on the ones whose answer flipped, as a real resize does.
let width = 1024;
let lists = [];
let originalMatchMedia;
let current = null;

function evaluate(query) {
  const max = query.match(/max-width:\s*([\d.]+)px/);
  const min = query.match(/min-width:\s*([\d.]+)px/);
  if (max) return width <= Number(max[1]);
  if (min) return width >= Number(min[1]);
  return false;
}

function installMatchMedia(initialWidth) {
  width = initialWidth;
  lists = [];
  originalMatchMedia = window.matchMedia;
  // jsdom has no Element.scrollIntoView, which the band's focus return calls.
  Element.prototype.scrollIntoView = vi.fn();
  window.matchMedia = (query) => {
    const list = {
      media: query,
      listeners: new Set(),
      last: evaluate(query),
      get matches() {
        return evaluate(query);
      },
      addEventListener(type, fn) {
        if (type === 'change') list.listeners.add(fn);
      },
      removeEventListener(type, fn) {
        if (type === 'change') list.listeners.delete(fn);
      },
    };
    lists.push(list);
    return list;
  };
}

async function setWidth(next) {
  width = next;
  await act(async () => {
    for (const list of lists) {
      const now = evaluate(list.media);
      if (now !== list.last) {
        list.last = now;
        for (const fn of [...list.listeners]) fn({ matches: now, media: list.media });
      }
    }
  });
}

// router.jsx keys RecipePage by its three route parameters; this wrapper does
// the same.
function Keyed() {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={() => {}} />;
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

async function mountAt(initialWidth) {
  installMatchMedia(initialWidth);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[PATH]}>
        <Routes>
          <Route path="/notebook/:recipeId/:versionId/batch/:batchId" element={<Keyed />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await flush(() => row('fold-balance') !== null && row('fold-tasting') !== null);
  return container;
}

afterEach(async () => {
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = undefined;
  delete Element.prototype.scrollIntoView;
});

const row = (id) => current.container.querySelector(`.fold-row[aria-controls="${id}"]`);
const panel = (id) => current.container.querySelector(`#${id}`);

function buttonByText(scope, text) {
  return [...scope.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

function pen() {
  return current.container.querySelector('.batch-margin--pen');
}

// A fold is open when its row says so and its panel is shown: the two must agree.
function isOpen(id) {
  const expanded = row(id).getAttribute('aria-expanded') === 'true';
  expect(panel(id).hidden).toBe(!expanded);
  return expanded;
}

const states = () => ({
  balance: isOpen('fold-balance'),
  check: isOpen('fold-check'),
  version: isOpen('fold-version'),
  tasting: isOpen('fold-tasting'),
});

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

describe('Balance and Watch for open from 984, the rest from 1366 (decision 33, brief task 4)', () => {
  it.each([744, 983])('F1: at %i every fold is closed', async (at) => {
    await mountAt(at);
    expect(states()).toEqual({ balance: false, check: false, version: false, tasting: false });
  });

  it.each([984, 1024])('F2: at %i Balance and Watch for are open, Version details and Tasting closed', async (at) => {
    await mountAt(at);
    expect(states()).toEqual({ balance: true, check: true, version: false, tasting: false });
  });

  it('F3: at 1366 every fold is open', async () => {
    await mountAt(1366);
    expect(states()).toEqual({ balance: true, check: true, version: true, tasting: true });
  });

  it('F4: crossing 984 opens Balance and Watch for and leaves the band and log closed, and crossing back closes them', async () => {
    await mountAt(983);
    await setWidth(984);
    expect(states()).toEqual({ balance: true, check: true, version: false, tasting: false });
    await setWidth(983);
    expect(states()).toEqual({ balance: false, check: false, version: false, tasting: false });
  });

  it('F5: a Hide on Balance at 1024 survives a rotation to 1366 (its own cut is not crossed), while the others reset', async () => {
    await mountAt(1024);
    await click(row('fold-balance'));
    expect(states()).toEqual({ balance: false, check: true, version: false, tasting: false });
    await setWidth(1366);
    expect(states()).toEqual({ balance: false, check: true, version: true, tasting: true });
    await setWidth(1024);
    expect(states()).toEqual({ balance: false, check: true, version: false, tasting: false });
  });
});

// Sketch 011 decision 50 A, default C1 (Mark 2026-10-05): the Batch head is a
// fold row, open on first load at every width, and its default never changes,
// so a width crossing neither opens nor closes it. Hide hides the whole batch
// body and keeps the head with Correct and Record another.
describe('The Batch fold opens open at every width (sketch 011 decision 50, C1)', () => {
  it.each([393, 744, 1024, 1366])('is open at %i', async (at) => {
    await mountAt(at);
    expect(isOpen('fold-batch')).toBe(true);
  });

  it('Hide hides the whole body and keeps the head; crossing 1366 either way leaves it closed', async () => {
    await mountAt(1024);
    await click(row('fold-batch'));
    expect(isOpen('fold-batch')).toBe(false);
    expect(panel('fold-batch').hidden).toBe(true);
    expect(panel('fold-batch').querySelector('.batch-margin')).not.toBeNull();
    const heading = current.container.querySelector('h2#batch');
    expect(heading).not.toBeNull();
    expect(panel('fold-batch').contains(heading)).toBe(false);
    for (const selector of ['.batch-row__correct', '.batch-row__record']) {
      const control = current.container.querySelector(selector);
      expect(control).not.toBeNull();
      expect(panel('fold-batch').contains(control)).toBe(false);
    }
    expect(row('fold-batch').textContent).toContain('Show');
    await setWidth(1366);
    expect(isOpen('fold-batch')).toBe(false);
    await setWidth(1024);
    expect(isOpen('fold-batch')).toBe(false);
    await click(row('fold-batch'));
    expect(isOpen('fold-batch')).toBe(true);
  });

  it('Go to batch lands on h2#batch with the Batch fold open', async () => {
    await mountAt(1024);
    const jump = current.container.querySelector('.notebook-jump');
    expect(jump).not.toBeNull();
    await click(jump);
    expect(document.activeElement).toBe(current.container.querySelector('h2#batch'));
    expect(isOpen('fold-batch')).toBe(true);
  });

  // Decision 50, Mark 2026-10-05: the body must be shown when focus lands, so
  // the browser scrolls on the open page that 261004-uyd G7 measured.
  it.each([393, 1024])('Go to batch opens a closed Batch fold, then lands on h2#batch (decision 50, Mark 2026-10-05) at %i', async (at) => {
    await mountAt(at);
    await click(row('fold-batch'));
    expect(isOpen('fold-batch')).toBe(false);
    const heading = current.container.querySelector('h2#batch');
    const hiddenAtFocus = [];
    heading.focus = function focusRecorder(...args) {
      hiddenAtFocus.push(panel('fold-batch').hidden);
      return HTMLElement.prototype.focus.apply(this, args);
    };
    await click(current.container.querySelector('.notebook-jump'));
    expect(isOpen('fold-batch')).toBe(true);
    expect(row('fold-batch').textContent).toContain('Hide');
    expect(document.activeElement).toBe(heading);
    expect(heading.classList.contains('is-landing-focus')).toBe(true);
    expect(hiddenAtFocus).toEqual([false]);
  });

  // A guard, not a RED. It shows that only Go to batch opens the fold, not the
  // amendment save's shared landing. The closed return is undecided (261004-uyd
  // SUMMARY question 1). Change the test when Mark decides.
  it('a Correct started from a closed Batch fold still returns closed after Save (left as built, undecided)', async () => {
    await mountAt(1024);
    await click(row('fold-batch'));
    expect(isOpen('fold-batch')).toBe(false);
    await click(current.container.querySelector('.batch-row__correct'));
    expect(pen()).not.toBeNull();
    expect(panel('fold-batch').hidden).toBe(false);
    await click(buttonByText(pen(), 'Save batch'));
    await flush(() => pen() === null);
    expect(pen()).toBeNull();
    expect(isOpen('fold-batch')).toBe(false);
    expect(document.activeElement).toBe(current.container.querySelector('h2#batch'));
  });
});
