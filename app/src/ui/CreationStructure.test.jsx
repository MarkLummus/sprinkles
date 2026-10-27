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

  it('draws remove, Move up, Move down and Add step in each step, the first Move up and the last Move down off', async () => {
    await open();
    const acts = [...root().querySelectorAll('li.mk-step p.method-step__acts')];
    expect(acts).toHaveLength(3);
    expect([...acts[1].querySelectorAll('button')].map((button) => button.textContent)).toEqual([
      'remove',
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
    expect(root().textContent).not.toContain('restore');
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
