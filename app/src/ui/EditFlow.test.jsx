// @vitest-environment jsdom
//
// The edit route end to end (Phase 11 plan 10, STRUCT-04, D-01 to D-03, D-06,
// D-07, D-23): /notebook/:recipeId/:versionId/edit opens the creation editor
// over a saved first version, keeps its ink as an 'edit' draft once it holds a
// change, and Save writes over the same version through
// repository.saveFirstVersionOver. Mounted whole, under StrictMode, over an
// in-memory stand-in for the repository.
import { StrictMode, act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router';

const store = vi.hoisted(() => ({ drafts: new Map(), recipes: [], versions: [], batches: [] }));

vi.mock('../store/repository.js', async () => {
  const { library } = await import('../data/library.js');
  const find = (list, id) => list.find((record) => record.id === id);
  return {
    repository: {
      getAll: vi.fn(async () => structuredClone(store.versions)),
      getAllBatches: vi.fn(async () => structuredClone(store.batches)),
      listRecipes: vi.fn(async () => structuredClone(store.recipes)),
      listLibrary: vi.fn(async () => Object.entries(library).map(([id, entry]) => ({ id, entry: structuredClone(entry) }))),
      listDrafts: vi.fn(async () => [...store.drafts.values()].map((record) => structuredClone(record))),
      getDraft: vi.fn(async (versionId) => {
        const found = store.drafts.get(versionId);
        return found ? structuredClone(found) : undefined;
      }),
      saveDraft: vi.fn(async (record) => {
        store.drafts.set(record.versionId, structuredClone(record));
        return true;
      }),
      deleteDraft: vi.fn(async (versionId) => {
        store.drafts.delete(versionId);
        return true;
      }),
      getVersion: vi.fn(async (id) => {
        const found = find(store.versions, id);
        return found ? structuredClone(found) : undefined;
      }),
      listBatchesForVersion: vi.fn(async (versionId) =>
        structuredClone(store.batches.filter((batch) => batch.versionId === versionId)),
      ),
      listVersions: vi.fn(async () => structuredClone(store.versions)),
      getRecipe: vi.fn(async (id) => {
        const found = find(store.recipes, id);
        return found ? structuredClone(found) : undefined;
      }),
      getBatch: vi.fn(async () => undefined),
      // Save-over's one transaction: replaced per case when a case needs a refusal.
      saveFirstVersionOver: vi.fn(async ({ recipe, version }) => {
        store.recipes = store.recipes.map((stored) => (stored.id === recipe.id ? structuredClone(recipe) : stored));
        store.versions = store.versions.map((stored) => (stored.id === version.id ? structuredClone(version) : stored));
        store.drafts.delete(version.id);
        return { saved: true };
      }),
      createRecipeWithVersion: vi.fn(),
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
import { RecipePageForRoute } from '../router.jsx';
import { EditRoute } from './EditRoute.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { buildCreation } from '../domain/creationSave.js';
import { buildDraftRecord, blankCreateDraft } from '../domain/draft.js';
import { addRow } from '../domain/creation.js';
import { addStep, normalizeAllocation, setLineGrams, setStepField, toggleStepUses } from '../domain/creationSteps.js';
import { library } from '../data/library.js';
import { STYLE_ROWS } from '../data/styles.js';
import { draftFromVersion } from '../domain/creationSave.js';
import { normalizeCreateDraft } from '../domain/creation.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const libraryById = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));
const WRITTEN = '2026-10-01T09:00:00.000Z';
const WRITE_SPIES = ['saveVersion', 'createVersion', 'putAll', 'saveRecipe', 'putAllRecipes', 'saveBatch', 'putAllBatches', 'createRecipeWithVersion'];

let current = null;
let location = null;
let originalMatchMedia = null;
let stateTrail = [];

function Probe() {
  location = useLocation();
  stateTrail.push(location.state);
  return null;
}

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
            <Probe />
            <Routes>
              <Route element={<Outlet context={0} />}>
                <Route path="/notebook/:recipeId/:versionId" element={<RecipePageForRoute />} />
                <Route path="/notebook/:recipeId/:versionId/edit" element={<EditRoute />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </CatalogFixture>
      </StrictMode>,
    );
  });
  await flush();
  return current.container;
}

afterEach(async () => {
  vi.useRealTimers();
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
  store.recipes = [];
  store.versions = [];
  store.batches = [];
  stateTrail = [];
  vi.clearAllMocks();
});

const root = () => current.container;
const field = (label) => root().querySelector(`[aria-label="${label}"]`);
const buttonByText = (text) => [...root().querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
const underSave = () => root().querySelector('.notebook-ceremony p.field-error')?.textContent ?? null;

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
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

async function advance(ms = 400) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
  await flush();
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const RECIPE_ID = 'r-vanilla';
const VERSION_ID = 'v-vanilla';
const EDIT_PATH = `/notebook/${RECIPE_ID}/${VERSION_ID}/edit`;
const PAGE_PATH = `/notebook/${RECIPE_ID}/${VERSION_ID}`;

// A saved Vanilla root with two steps: Whole milk split over both (400 g then
// 200 g), Sucrose in step 1 only (100 g).
function savedVanilla() {
  let draft = blankCreateDraft({ recipeId: RECIPE_ID, versionId: VERSION_ID, name: 'Vanilla' });
  draft = addRow(draft, { rowId: 'row-milk', libraryId: 'wholeMilk' });
  draft = addRow(draft, { rowId: 'row-sugar', libraryId: 'sucrose' });
  draft = addStep(draft, { afterN: null });
  draft = addStep(draft, { afterN: 1 });
  draft = setStepField(draft, 1, 'leadIn', 'Warm');
  draft = setStepField(draft, 1, 'instruction', 'Warm the milk.');
  draft = setStepField(draft, 2, 'leadIn', 'Chill');
  draft = setStepField(draft, 2, 'instruction', 'Chill it.');
  draft = toggleStepUses(draft, 1, 'row-milk');
  draft = toggleStepUses(draft, 1, 'row-sugar');
  draft = toggleStepUses(draft, 2, 'row-milk');
  draft = setLineGrams(draft, 'row-milk', 1, '400');
  draft = setLineGrams(draft, 'row-milk', 2, '200');
  draft = setLineGrams(draft, 'row-sugar', 1, '100');
  draft = { ...draft, description: 'Plain and cold.' };
  return buildCreation(draft, { libraryById, styles: STYLE_ROWS, now: WRITTEN });
}

function seedVanilla() {
  const { recipe, version } = savedVanilla();
  store.recipes = [recipe];
  store.versions = [version];
  return { recipe, version };
}

// The seed the edit route opens on, and an edit record kept over it.
function seedPayload() {
  const { recipe, version } = savedVanilla();
  return normalizeAllocation(normalizeCreateDraft(draftFromVersion(version, recipe, STYLE_ROWS)));
}

function keptEdit(change = {}) {
  return buildDraftRecord({
    versionId: VERSION_ID,
    kind: 'edit',
    payload: { ...seedPayload(), ...change },
    now: '2026-10-02T08:00:00.000Z',
  });
}

const stepHeads = () => [...root().querySelectorAll('li.mk-step')].map((node) => node.getAttribute('data-step'));

describe('the edit route opens the editor on a saved first version (D-01)', () => {
  it('shows the band, the editing ceremony, both steps and the table lines as saved', async () => {
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);

    expect(field('Recipe name').value).toBe('Vanilla');
    expect(field('Recipe description').value).toBe('Plain and cold.');
    expect(field('Version name').value).toBe('Version 1');
    const form = root().querySelector('form[aria-label="Edit version"]');
    expect(form).not.toBeNull();
    expect(form.querySelector('.notebook-caption').textContent).toBe('Version 1 · editing');
    expect([...form.querySelectorAll('button')].map((button) => button.textContent)).toEqual(['Cancel', 'Save']);
    expect(stepHeads()).toEqual(['1', '2']);
    const milk = [...root().querySelectorAll('input[aria-label^="Whole milk, 3.5% fat, grams"]')];
    expect(milk.map((input) => input.value)).toEqual(['400', '200']);
    expect(field('Sucrose, grams').value).toBe('100');
  });

  it('opening the route and pressing nothing writes no draft and no record', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await advance(1000);
    expect(repository.saveDraft).not.toHaveBeenCalled();
    expect(store.drafts.size).toBe(0);
    for (const name of WRITE_SPIES) expect(repository[name]).not.toHaveBeenCalled();
    expect(repository.saveFirstVersionOver).not.toHaveBeenCalled();
  });
});

describe('Save writes over the same version (D-03, D-07)', () => {
  it('calls saveFirstVersionOver once with the same id, code and date, the new name and order, and expected the stored records', async () => {
    const { recipe, version } = seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);

    await type(field('Recipe name'), 'Vanilla bean');
    await click(field('Step 1, move down'));
    await click(buttonByText('Save'));
    await flush(() => location.pathname === PAGE_PATH);

    expect(repository.saveFirstVersionOver).toHaveBeenCalledTimes(1);
    const call = repository.saveFirstVersionOver.mock.calls[0][0];
    expect(call.version.id).toBe(version.id);
    expect(call.version.sheetCode).toBe(version.sheetCode);
    expect(call.version.createdAt).toBe(version.createdAt);
    expect(call.recipe.name).toBe('Vanilla bean');
    expect(call.version.sheetTitle).toBe('Vanilla bean');
    expect(call.version.method.map((step) => step.n)).toEqual([2, 1]);
    expect(call.expected).toEqual({ version, recipe });
    for (const name of WRITE_SPIES) expect(repository[name]).not.toHaveBeenCalled();
    expect(location.pathname).toBe(PAGE_PATH);
  });

  it('lands on the page saying Changes saved. and spends the enum word once', async () => {
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await type(field('Recipe name'), 'Vanilla bean');
    await click(buttonByText('Save'));
    await flush(() => location.pathname === PAGE_PATH);
    await flush(() => root().querySelector('.page-status')?.textContent === 'Changes saved.');

    expect(stateTrail).toContainEqual({ focusVersion: true, saved: 'edited' });
    expect(root().querySelector('.page-status').textContent).toBe('Changes saved.');
    expect(location.state).toEqual({ focusVersion: true });
    expect(store.drafts.size).toBe(0);
  });

  it('two quick presses call it once, and the editor holds still while it is out', async () => {
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await type(field('Recipe name'), 'Vanilla bean');

    const gate = deferred();
    repository.saveFirstVersionOver.mockImplementationOnce(async () => {
      await gate.promise;
      return { saved: true };
    });
    await act(async () => {
      const save = buttonByText('Save');
      save.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      save.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await flush();
    expect(repository.saveFirstVersionOver).toHaveBeenCalledTimes(1);
    expect(buttonByText('Saving…')).not.toBeNull();
    expect(field('Recipe name').disabled).toBe(true);

    await act(async () => {
      gate.resolve();
    });
    await flush(() => location.pathname === PAGE_PATH);
    expect(repository.saveFirstVersionOver).toHaveBeenCalledTimes(1);
  });

  it('a rejected save-over keeps the draft, gives the writer back and says so under Save', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await type(field('Recipe name'), 'Vanilla bean');
    repository.saveFirstVersionOver.mockRejectedValueOnce(new Error('write failed'));
    await click(buttonByText('Save'));
    await flush(() => underSave() !== null);

    expect(underSave()).toBe('Couldn’t save the changes. Try again.');
    expect(location.pathname).toBe(EDIT_PATH);
    expect(buttonByText('Save')).not.toBeNull();
    await advance(400);
    expect(store.drafts.get(VERSION_ID).kind).toBe('edit');
    expect(store.drafts.get(VERSION_ID).payload.name).toBe('Vanilla bean');
  });
});
