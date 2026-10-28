// @vitest-environment jsdom
//
// Add, remove and move for steps and rows while creating (Phase 11 plan 08,
// STRUCT-01 to STRUCT-03, D-14 to D-17). The creation editor is mounted whole,
// under StrictMode, over an in-memory stand-in for the repository, holding a
// kept draft the case wrote. Focus is read after the render that drew its
// target, and the polite word is read from the status region; the animation
// frame is held by the test so "emptied, then written on the next frame" is
// seen as two states. jsdom turns no keyboard press into a click, so a press is
// a focus, the Enter keydown and the click a browser would fire.
import { StrictMode, act } from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';

const store = vi.hoisted(() => ({ drafts: new Map() }));

vi.mock('../store/repository.js', async () => {
  const { seedRecipeGroups } = await import('../data/seed-recipes.js');
  const { library } = await import('../data/library.js');
  const groups = seedRecipeGroups;
  return {
    repository: {
      getAll: vi.fn(async () => structuredClone(groups.flatMap((group) => group.versions))),
      getAllBatches: vi.fn(async () => structuredClone(groups.flatMap((group) => group.batches))),
      listRecipes: vi.fn(async () => structuredClone(groups.map((group) => group.recipe))),
      listLibrary: vi.fn(async () => Object.entries(library).map(([id, entry]) => ({ id, entry: structuredClone(entry) }))),
      listDrafts: vi.fn(async () => [...store.drafts.values()].map((record) => structuredClone(record))),
      getDraft: vi.fn(async (versionId) => {
        const found = store.drafts.get(versionId);
        return found ? structuredClone(found) : undefined;
      }),
      saveDraft: vi.fn(async (record) => {
        store.drafts.set(record.versionId, structuredClone(record));
      }),
      deleteDraft: vi.fn(async (versionId) => {
        store.drafts.delete(versionId);
      }),
      saveVersion: vi.fn(),
      createVersion: vi.fn(),
      putAll: vi.fn(),
      saveRecipe: vi.fn(),
      putAllRecipes: vi.fn(),
      saveBatch: vi.fn(),
      putAllBatches: vi.fn(),
      putAllLibrary: vi.fn(),
      importAll: vi.fn(),
    },
  };
});

import { repository } from '../store/repository.js';
import { NotebookPlace } from './NotebookPlace.jsx';
import { CreationRoute } from './CreationRoute.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { blankCreateDraft, buildDraftRecord } from '../domain/draft.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let current = null;
let originalMatchMedia = null;
// The animation frames the page asked for and has not yet been given, by id.
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

async function flush(until = () => false) {
  for (let i = 0; i < 40; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      await Promise.resolve();
    });
    if (until()) return;
  }
}

async function mountAt(path) {
  installMatchMedia();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <StrictMode>
        <CatalogFixture>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={<Outlet context={0} />}>
                <Route path="/notebook" element={<NotebookPlace />} />
                <Route path="/notebook/new" element={<CreationRoute />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </CatalogFixture>
      </StrictMode>,
    );
  });
  await flush();
  return container;
}

afterEach(async () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = null;
  delete Element.prototype.scrollIntoView;
  store.drafts.clear();
  vi.clearAllMocks();
});

const root = () => current.container;

function field(label) {
  return root().querySelector(`[aria-label="${label}"]`);
}

function buttonByText(text) {
  return [...root().querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await flush();
}

// A keyboard press on a button: focus it, then the Enter a browser turns into a
// click.
async function press(element) {
  await act(async () => {
    element.focus();
    element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await flush();
}

async function pressKey(element, key) {
  await act(async () => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });
  await flush();
}

async function type(element, value) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function advance(ms = 250) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
  await flush();
}

// The page asked for frames since the last call: run them, as a browser would.
async function nextFrames() {
  const due = [...frames.values()];
  frames = new Map();
  await act(async () => {
    for (const callback of due) callback(0);
  });
}

const announcer = () => root().querySelector('p.visually-hidden[role="status"][aria-live="polite"]');
const said = () => announcer().textContent;
const lastSaved = () => repository.saveDraft.mock.calls.at(-1)[0].payload;

const IDS = { recipeId: 'r-kept', versionId: 'v-kept' };

function keep(change) {
  const payload = change(blankCreateDraft({ ...IDS, name: 'Vanilla' }));
  store.drafts.set(
    IDS.versionId,
    buildDraftRecord({ versionId: IDS.versionId, kind: 'create', payload, now: '2026-10-20T08:00:00.000Z' }),
  );
}

const step = (n, leadIn, uses = []) => ({ n, leadIn, instruction: `${leadIn} it.`, uses, targets: [] });

async function open() {
  await mountAt('/notebook/new');
  await flush(() => field('Recipe name') !== null);
}

const leadIns = () => [...root().querySelectorAll('li.mk-step input[data-field="lead-in"]')].map((input) => input.value);
const numbers = () => [...root().querySelectorAll('li.mk-step .method-step__n')].map((node) => node.textContent);

describe('Move on a step (STRUCT-02, D-16)', () => {
  beforeEach(() => {
    keep((draft) => ({ ...draft, method: [step(1, 'Warm'), step(2, 'Churn'), step(3, 'Finish')] }));
  });

  it('draws Remove, Move up, Move down and Add step in each step, the first Move up and the last Move down off', async () => {
    await open();
    const acts = [...root().querySelectorAll('li.mk-step p.method-step__acts')];
    expect(acts).toHaveLength(3);
    expect([...acts[1].querySelectorAll('button')].map((button) => button.textContent)).toEqual([
      'Remove',
      'Move up',
      'Move down',
      'Add step',
    ]);
    expect([...acts[1].querySelectorAll('button')].map((button) => button.getAttribute('aria-label'))).toEqual([
      'Step 2, remove',
      'Step 2, move up',
      'Step 2, move down',
      'Step 2, add a step after it',
    ]);
    expect(field('Step 1, move up').classList.contains('mk-off')).toBe(true);
    expect(field('Step 1, move up').getAttribute('aria-disabled')).toBe('true');
    expect(field('Step 1, move up').getAttribute('tabindex')).toBe('0');
    expect(field('Step 3, move down').classList.contains('mk-off')).toBe(true);
    expect(field('Step 2, move up').classList.contains('mk-off')).toBe(false);
    expect(field('Step 2, move up').hasAttribute('aria-disabled')).toBe(false);
  });

  it('Move down on step 1 by keyboard reorders the steps, keeps every key, keeps focus on the moved step and says where it went', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await open();
    await press(field('Step 1, move down'));

    expect(leadIns()).toEqual(['Churn', 'Warm', 'Finish']);
    expect(numbers()).toEqual(['1', '2', '3']);
    // The moved step is now second, and focus is on its own Move down.
    expect(document.activeElement).toBe(field('Step 2, move down'));
    expect(document.activeElement.closest('li').querySelector('input[data-field="lead-in"]').value).toBe('Warm');
    await nextFrames();
    expect(said()).toBe('Step 2 of 3');

    repository.saveDraft.mockClear();
    await advance();
    const kept = lastSaved().method;
    expect(kept.map((candidate) => candidate.leadIn)).toEqual(['Churn', 'Warm', 'Finish']);
    // No step changed its stored number: Warm is still 1, Churn 2, Finish 3.
    expect(Object.fromEntries(kept.map((candidate) => [candidate.leadIn, candidate.n]))).toEqual({ Warm: 1, Churn: 2, Finish: 3 });
  });

  it('a repeated sentence is heard again: moving step 3 up to position 2 empties the status, then writes the same sentence', async () => {
    await open();
    await press(field('Step 1, move down'));
    await nextFrames();
    expect(said()).toBe('Step 2 of 3');

    await press(field('Step 3, move up'));
    expect(leadIns()).toEqual(['Churn', 'Finish', 'Warm']);
    // Emptied at the press, written on the next frame.
    expect(said()).toBe('');
    await nextFrames();
    expect(said()).toBe('Step 2 of 3');
    expect(document.activeElement).toBe(field('Step 2, move up'));
  });

  it('pressing again until the step is last moves focus to its Move up, and the off button then does nothing', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await open();
    await press(field('Step 1, move down'));
    await press(field('Step 2, move down'));
    expect(leadIns()).toEqual(['Churn', 'Finish', 'Warm']);
    // Move down turned off at the end of the list: focus is on the other Move.
    expect(field('Step 3, move down').getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(field('Step 3, move up'));
    await nextFrames();
    expect(said()).toBe('Step 3 of 3');

    await advance();
    repository.saveDraft.mockClear();
    await press(field('Step 3, move down'));
    await nextFrames();
    expect(leadIns()).toEqual(['Churn', 'Finish', 'Warm']);
    expect(said()).toBe('Step 3 of 3');
    await advance();
    expect(repository.saveDraft).not.toHaveBeenCalled();
    // The first step's Move up is off in the same way.
    await press(field('Step 1, move up'));
    expect(leadIns()).toEqual(['Churn', 'Finish', 'Warm']);
  });
});

describe('remove on a step (STRUCT-01, D-14)', () => {
  it('deletes the step outright with no restore, focus on the next step\'s lead-in, and says so', async () => {
    keep((draft) => ({ ...draft, method: [step(1, 'Warm'), step(2, 'Churn'), step(3, 'Finish')] }));
    await open();
    await click(field('Step 2, remove'));
    expect(leadIns()).toEqual(['Warm', 'Finish']);
    expect(numbers()).toEqual(['1', '2']);
    expect(root().textContent).not.toContain('Restore');
    expect(root().querySelector('.struck-value')).toBeNull();
    // The step that was third is now second; focus is in its lead-in.
    expect(document.activeElement).toBe(field('Step 2, lead-in'));
    expect(field('Step 2, lead-in').value).toBe('Finish');
    await nextFrames();
    expect(said()).toBe('Step 2, Churn, removed');
  });

  it('removing the last step focuses the previous step\'s lead-in; a blank lead-in is left out of the sentence', async () => {
    keep((draft) => ({ ...draft, method: [step(1, 'Warm'), step(2, '')] }));
    await open();
    await click(field('Step 2, remove'));
    expect(document.activeElement).toBe(field('Step 1, lead-in'));
    await nextFrames();
    expect(said()).toBe('Step 2 removed');
  });

  it('removing the only step focuses the heading\'s Add step', async () => {
    keep((draft) => ({ ...draft, method: [step(1, 'Warm')] }));
    await open();
    await click(field('Step 1, remove'));
    expect(root().querySelector('ol.method-steps')).toBeNull();
    expect(document.activeElement).toBe(root().querySelector('.method-region .mk-head-act'));
    expect(document.activeElement.textContent).toBe('Add step');
  });

  it('does not hand a removed step\'s key out again within the session', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    keep((draft) => ({ ...draft, method: [step(1, 'Warm'), step(2, 'Churn'), step(3, 'Finish')] }));
    await open();
    await click(field('Step 3, remove'));
    await click(buttonByText('Add step'));
    repository.saveDraft.mockClear();
    await advance();
    const keys = lastSaved().method.map((candidate) => candidate.n);
    // The new step goes first and carries a key above every earlier one.
    expect(keys).toHaveLength(4);
    expect(Math.max(...keys)).toBe(4);
    expect(new Set(keys).size).toBe(4);
    expect(lastSaved().method.find((candidate) => candidate.n === 3).removed).toBe(true);
  });
});

describe('Add step on a step (sketch 013 decision 33)', () => {
  it('adds a step right after it with focus in its lead-in', async () => {
    keep((draft) => ({ ...draft, method: [step(1, 'Warm'), step(2, 'Churn')] }));
    await open();
    await click(field('Step 1, add a step after it'));
    expect(leadIns()).toEqual(['Warm', '', 'Churn']);
    expect(document.activeElement).toBe(field('Step 2, lead-in'));
  });
});

const MILK = 'Whole milk, 3.5% fat';
const CREAM = 'Heavy cream, 36% fat';

const draftRow = (id, libraryId, portions) => ({ id, libraryId, portions });

// The table as a maker reads it: each group's head, and its lines in order.
const groups = () =>
  [...root().querySelectorAll('.ingredient-table tbody')].map((body) => ({
    head: body.querySelector('.ingredient-table__step-head')?.textContent ?? null,
    lines: [...body.querySelectorAll('tr[data-line]')].map((row) => row.getAttribute('data-line')),
  }));

const ctl = (line, name) => root().querySelector(`tr[data-line="${line}"] [data-act="${name}"]`);

describe('remove on a row (STRUCT-01, D-15)', () => {
  it('in a step group deletes the whole row, leaves no strike or restore, and focuses the next row\'s remove', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    keep((draft) => ({
      ...draft,
      rows: [draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '600' }]), draftRow('sucrose-row', 'sucrose', [{ step: 1, grams: '150' }])],
      method: [step(1, 'Warm', ['milk-row', 'sucrose-row'])],
    }));
    await open();
    await click(ctl('milk-row:1', 'remove'));
    expect(groups()).toEqual([{ head: 'Step 1Warm', lines: ['sucrose-row:1'] }]);
    expect(root().querySelector('.struck-value')).toBeNull();
    expect(root().textContent).not.toContain('Restore');
    expect(document.activeElement).toBe(ctl('sucrose-row:1', 'remove'));
    await nextFrames();
    expect(said()).toBe(`${MILK} removed`);

    repository.saveDraft.mockClear();
    await advance();
    expect(lastSaved().rows.map((row) => row.id)).toEqual(['sucrose-row']);
    expect(lastSaved().method[0].uses).toEqual(['sucrose-row']);
  });

  it('the last row of its group focuses the previous row\'s remove, and a row under Not in a step yet follows the same rule', async () => {
    keep((draft) => ({
      ...draft,
      rows: [
        draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '600' }]),
        draftRow('sucrose-row', 'sucrose', [{ step: 1, grams: '150' }]),
        draftRow('cream-row', 'heavyCream', [{ step: 1, grams: '250' }]),
      ],
      method: [step(1, 'Warm')],
    }));
    await open();
    expect(groups()).toEqual([{ head: 'Not in a step yet', lines: ['milk-row:0', 'sucrose-row:0', 'cream-row:0'] }]);
    await click(ctl('sucrose-row:0', 'remove'));
    expect(document.activeElement).toBe(ctl('cream-row:0', 'remove'));
    await click(ctl('cream-row:0', 'remove'));
    expect(document.activeElement).toBe(ctl('milk-row:0', 'remove'));
    await click(ctl('milk-row:0', 'remove'));
    expect(groups()).toEqual([]);
    expect(document.activeElement).toBe(root().querySelector('.ingredient-table-region .mk-head-act'));
    expect(document.activeElement.textContent).toBe('Add ingredient');
  });

  it('the only row while the picker is open focuses the picker\'s Cancel', async () => {
    keep((draft) => ({ ...draft, rows: [draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '600' }])] }));
    await open();
    await click(root().querySelector('.ingredient-table-region .mk-head-act'));
    expect(root().querySelector('div.pick')).not.toBeNull();
    await click(ctl('milk-row:0', 'remove'));
    expect(root().querySelector('div.pick')).not.toBeNull();
    expect(document.activeElement).toBe(root().querySelector('.ingredient-table-region .pick__head button'));
  });

  it('a split row removed from either line is gone from every step, and the kept draft prunes every uses', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    keep((draft) => ({
      ...draft,
      rows: [
        draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '400' }, { step: 2, grams: '200' }]),
        draftRow('sucrose-row', 'sucrose', [{ step: 2, grams: '150' }]),
      ],
      method: [step(1, 'Warm', ['milk-row']), step(2, 'Churn', ['milk-row', 'sucrose-row'])],
    }));
    await open();
    expect(groups()).toEqual([
      { head: 'Step 1Warm', lines: ['milk-row:1'] },
      { head: 'Step 2Churn', lines: ['milk-row:2', 'sucrose-row:2'] },
    ]);
    // Pressed on step 2's line: the whole row goes, and focus follows that group.
    await click(ctl('milk-row:2', 'remove'));
    expect(groups()).toEqual([{ head: 'Step 2Churn', lines: ['sucrose-row:2'] }]);
    expect(root().querySelector(`input[aria-label^="${MILK}"]`)).toBeNull();
    expect(document.activeElement).toBe(ctl('sucrose-row:2', 'remove'));
    repository.saveDraft.mockClear();
    await advance();
    const kept = lastSaved();
    expect(kept.rows.map((row) => row.id)).toEqual(['sucrose-row']);
    expect(kept.method.map((candidate) => candidate.uses)).toEqual([[], ['sucrose-row']]);
  });
});

describe('Move on a row stays within its own step (STRUCT-02, roadmap decision 9, D-16)', () => {
  it('keeps the row in its step and its id, moves focus to the other Move button when one turns off, and says where it went', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    keep((draft) => ({
      ...draft,
      rows: [draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '600' }]), draftRow('sucrose-row', 'sucrose', [{ step: 1, grams: '150' }])],
      method: [step(1, 'Warm', ['milk-row', 'sucrose-row'])],
    }));
    await open();
    await press(ctl('milk-row:1', 'move-down'));
    expect(groups()).toEqual([{ head: 'Step 1Warm', lines: ['sucrose-row:1', 'milk-row:1'] }]);
    // Last in its group now: Move down is off, so focus is on the row's Move up.
    expect(ctl('milk-row:1', 'move-down').getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(ctl('milk-row:1', 'move-up'));
    await nextFrames();
    expect(said()).toBe(`${MILK}, row 2 of 2 in step 1`);

    repository.saveDraft.mockClear();
    await advance();
    expect(lastSaved().method[0].uses).toEqual(['sucrose-row', 'milk-row']);
    expect(lastSaved().rows.map((row) => row.id)).toEqual(['milk-row', 'sucrose-row']);
  });

  it('keeps the same Move button when it can still act, so repeated presses keep moving the row', async () => {
    keep((draft) => ({
      ...draft,
      rows: [
        draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '600' }]),
        draftRow('sucrose-row', 'sucrose', [{ step: 1, grams: '150' }]),
        draftRow('cream-row', 'heavyCream', [{ step: 1, grams: '250' }]),
      ],
      method: [step(1, 'Warm', ['milk-row', 'sucrose-row', 'cream-row'])],
    }));
    await open();
    await press(ctl('milk-row:1', 'move-down'));
    expect(document.activeElement).toBe(ctl('milk-row:1', 'move-down'));
    await press(ctl('milk-row:1', 'move-down'));
    expect(groups()[0].lines).toEqual(['sucrose-row:1', 'cream-row:1', 'milk-row:1']);
    expect(document.activeElement).toBe(ctl('milk-row:1', 'move-up'));
  });

  it('under Not in a step yet it moves among the unplaced rows and says so; in a flat table it says only the place', async () => {
    keep((draft) => ({
      ...draft,
      rows: [
        draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '600' }]),
        draftRow('sucrose-row', 'sucrose', [{ step: 1, grams: '150' }]),
        draftRow('cream-row', 'heavyCream', [{ step: 1, grams: '250' }]),
      ],
    }));
    await open();
    await press(ctl('cream-row:0', 'move-up'));
    expect(groups()).toEqual([{ head: null, lines: ['milk-row:0', 'cream-row:0', 'sucrose-row:0'] }]);
    await nextFrames();
    expect(said()).toBe(`${CREAM}, row 2 of 3`);

    await click(buttonByText('Add step'));
    await press(ctl('cream-row:0', 'move-up'));
    expect(groups()[0]).toEqual({ head: 'Not in a step yet', lines: ['cream-row:0', 'milk-row:0', 'sucrose-row:0'] });
    await nextFrames();
    expect(said()).toBe(`${CREAM}, row 1 of 3, not in a step yet`);
  });

  it('each step orders its own rows: moving B up in step 1 leaves step 2 reading A, B (Mark, decide-p11-row-order-across-steps)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    keep((draft) => ({
      ...draft,
      rows: [
        draftRow('row-a', 'wholeMilk', [{ step: 1, grams: '400' }, { step: 2, grams: '200' }]),
        draftRow('row-b', 'sucrose', [{ step: 1, grams: '90' }, { step: 2, grams: '60' }]),
      ],
      method: [step(1, 'Warm', ['row-a', 'row-b']), step(2, 'Churn', ['row-a', 'row-b'])],
    }));
    await open();
    expect(groups().map((group) => group.lines)).toEqual([
      ['row-a:1', 'row-b:1'],
      ['row-a:2', 'row-b:2'],
    ]);
    // A split row's Move names its step.
    expect(ctl('row-b:1', 'move-up').getAttribute('aria-label')).toBe('Move Sucrose up in step 1');
    expect(ctl('row-b:2', 'move-up').getAttribute('aria-label')).toBe('Move Sucrose up in step 2');

    await press(ctl('row-b:1', 'move-up'));
    expect(groups().map((group) => group.lines)).toEqual([
      ['row-b:1', 'row-a:1'],
      ['row-a:2', 'row-b:2'],
    ]);
    await nextFrames();
    expect(said()).toBe('Sucrose, row 1 of 2 in step 1');
    repository.saveDraft.mockClear();
    await advance();
    expect(lastSaved().method.map((candidate) => candidate.uses)).toEqual([['row-b', 'row-a'], ['row-a', 'row-b']]);
    expect(lastSaved().rows.map((row) => row.id)).toEqual(['row-a', 'row-b']);

    // Then step 2 on its own: step 1 stays as it was.
    await press(ctl('row-b:2', 'move-up'));
    expect(groups().map((group) => group.lines)).toEqual([
      ['row-b:1', 'row-a:1'],
      ['row-b:2', 'row-a:2'],
    ]);
    await advance();
    expect(lastSaved().method.map((candidate) => candidate.uses)).toEqual([['row-b', 'row-a'], ['row-b', 'row-a']]);
    expect(lastSaved().rows.map((row) => row.id)).toEqual(['row-a', 'row-b']);
  });
});

describe('Add to step (decision 014 1, D-17)', () => {
  const draftWithCream = () =>
    keep((draft) => ({
      ...draft,
      rows: [
        draftRow('milk-row', 'wholeMilk', [{ step: 1, grams: '600' }]),
        draftRow('cream-row', 'heavyCream', [{ step: 1, grams: '250' }]),
      ],
      method: [step(1, 'Warm', ['milk-row']), step(2, '')],
    }));

  it('is offered only under Not in a step yet, and opening it puts focus on Cancel after the render', async () => {
    draftWithCream();
    await open();
    expect(ctl('milk-row:1', 'add-to-step')).toBeNull();
    expect(ctl('cream-row:0', 'add-to-step')).not.toBeNull();
    await click(ctl('cream-row:0', 'add-to-step'));
    expect([...root().querySelectorAll('.mk-row-acts--choosing button')].map((button) => button.textContent)).toEqual([
      'Cancel',
      'Step 1, Warm',
      'Step 2',
    ]);
    expect(document.activeElement).toBe(ctl('cream-row:0', 'cancel'));
  });

  it('Escape acts as Cancel and returns focus to Add to step', async () => {
    draftWithCream();
    await open();
    await click(ctl('cream-row:0', 'add-to-step'));
    await pressKey(ctl('cream-row:0', 'cancel'), 'Escape');
    expect(root().querySelector('.mk-row-acts--choosing')).toBeNull();
    expect(document.activeElement).toBe(ctl('cream-row:0', 'add-to-step'));
  });

  it('choosing a step ticks the row there as its last row and puts focus on its remove', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    draftWithCream();
    await open();
    await click(ctl('cream-row:0', 'add-to-step'));
    await click(ctl('cream-row:0', 'choose-1'));
    expect(groups()).toEqual([{ head: 'Step 1Warm', lines: ['milk-row:1', 'cream-row:1'] }]);
    expect(document.activeElement).toBe(ctl('cream-row:1', 'remove'));
    await nextFrames();
    expect(said()).toBe(`${CREAM} added to step 1`);
    repository.saveDraft.mockClear();
    await advance();
    expect(lastSaved().method[0].uses).toEqual(['milk-row', 'cream-row']);
    expect(lastSaved().rows.find((row) => row.id === 'cream-row').portions).toEqual([{ step: 1, grams: '250' }]);
  });
});
