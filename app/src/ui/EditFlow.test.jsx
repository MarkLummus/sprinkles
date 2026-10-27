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
import { CreationRoute } from './CreationRoute.jsx';
import { NotebookPlace } from './NotebookPlace.jsx';
import { EDIT_CHANGED, EDIT_CLOSED, EDIT_DRAFT_HELD, EDIT_HAS_BATCH, EDIT_HAS_CHILD } from './CreationPage.jsx';
import { DRAFT_KEPT_STATUS } from './useKeptDraft.js';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { buildCreation, draftFromVersion } from '../domain/creationSave.js';
import { createBatch } from '../domain/batch.js';
import { buildDraftRecord, blankCreateDraft } from '../domain/draft.js';
import { addRow, normalizeCreateDraft } from '../domain/creation.js';
import { addStep, normalizeAllocation, setLineGrams, setStepField, toggleStepUses } from '../domain/creationSteps.js';
import { penDraftFromVersion } from '../domain/penDraft.js';
import { codeFromVersionId } from '../domain/sheetCode.js';
import { library } from '../data/library.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { STYLE_ROWS } from '../data/styles.js';

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
                <Route path="/notebook" element={<NotebookPlace />} />
                <Route path="/notebook/new" element={<CreationRoute />} />
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

describe('the kept edit draft (D-02, D-06, D-23)', () => {
  it('typing writes an edit record under the version id, 250 ms after the change', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await type(field('Recipe name'), 'Vanilla bean');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    await advance(300);
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    const record = store.drafts.get(VERSION_ID);
    expect(record.kind).toBe('edit');
    expect(record.payload.name).toBe('Vanilla bean');
  });

  it('a change made back to the saved content deletes the draft again', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await type(field('Recipe name'), 'Vanilla bean');
    await advance(300);
    expect(store.drafts.size).toBe(1);
    await type(field('Recipe name'), 'Vanilla');
    await advance(300);
    expect(store.drafts.size).toBe(0);
    expect(repository.deleteDraft).toHaveBeenCalledWith(VERSION_ID, 'edit');
  });

  it('Cancel deletes the draft and lands on the version page with no state', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await type(field('Recipe name'), 'Vanilla bean');
    await advance(300);
    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === PAGE_PATH);

    expect(location.pathname).toBe(PAGE_PATH);
    expect(location.state).toBeNull();
    expect(store.drafts.size).toBe(0);
    expect(repository.deleteDraft).toHaveBeenCalledWith(VERSION_ID, 'edit');
    expect(repository.saveFirstVersionOver).not.toHaveBeenCalled();
    // Nothing written back after the delete.
    await advance(1000);
    expect(store.drafts.size).toBe(0);
  });

  it('a reload with an edit kept restores its payload and announces Draft kept.', async () => {
    seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit({ name: 'Vanilla bean' }));
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await flush(() => field('Recipe name').value === 'Vanilla bean');

    expect(field('Recipe name').value).toBe('Vanilla bean');
    expect(root().textContent).toContain(DRAFT_KEPT_STATUS);
    expect(store.drafts.get(VERSION_ID).kind).toBe('edit');
  });
});

describe('the route redirects and deletes nothing (D-01, D-06; RESEARCH G-1, G-8)', () => {
  function addBatch() {
    store.batches = [
      createBatch(store.versions[0], { churnDate: '2026-10-09' }, null, { id: 'b-1', now: '2026-10-09T12:00:00.000Z', catalog: SEED_CATALOG }),
    ];
  }

  function addChild() {
    const parent = store.versions[0];
    store.versions.push({
      ...structuredClone(parent),
      id: 'v-child',
      parentVersionId: parent.id,
      parentVersionLabel: parent.versionLabel,
      versionLabel: 'Version 2',
      reason: 'Less sweet',
      sheetCode: codeFromVersionId('v-child'),
      createdAt: '2026-10-05T09:00:00.000Z',
    });
  }

  it('sends a version with a batch and no kept edit to its page', async () => {
    seedVanilla();
    addBatch();
    await mountAt(EDIT_PATH);
    await flush(() => location.pathname === PAGE_PATH);
    expect(location.pathname).toBe(PAGE_PATH);
    expect(field('Recipe name')).toBeNull();
    expect(repository.saveDraft).not.toHaveBeenCalled();
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });

  it('sends a version with a later version to its page', async () => {
    seedVanilla();
    addChild();
    await mountAt(EDIT_PATH);
    await flush(() => location.pathname === PAGE_PATH);
    expect(location.pathname).toBe(PAGE_PATH);
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });

  it("sends a version holding a pen's draft to its page and leaves the draft in place", async () => {
    seedVanilla();
    const plan = buildDraftRecord({
      versionId: VERSION_ID,
      kind: 'plan',
      payload: { ...penDraftFromVersion(store.versions[0]), versionLabel: 'Version 2 typed' },
      penOpenedAt: '2026-10-02T08:00:00.000Z',
      now: '2026-10-02T08:00:00.000Z',
    });
    store.drafts.set(VERSION_ID, plan);
    await mountAt(EDIT_PATH);
    await flush(() => location.pathname === PAGE_PATH);
    expect(location.pathname).toBe(PAGE_PATH);
    expect(store.drafts.get(VERSION_ID)).toEqual(plan);
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });

  it('shows not found for a version of another recipe, an unknown version and an unknown recipe, deleting nothing', async () => {
    seedVanilla();
    for (const path of [`/notebook/other/${VERSION_ID}/edit`, `/notebook/${RECIPE_ID}/nope/edit`]) {
      // eslint-disable-next-line no-await-in-loop
      await mountAt(path);
      // eslint-disable-next-line no-await-in-loop
      await flush(() => root().querySelector('.not-found') !== null);
      expect(root().querySelector('.not-found')).not.toBeNull();
      expect(field('Recipe name')).toBeNull();
      // eslint-disable-next-line no-await-in-loop
      await act(async () => current.root.unmount());
      current.container.remove();
      current = null;
    }
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });

  it("the Notebook's draft row and /notebook/new ignore a kept edit draft", async () => {
    seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit({ name: 'Vanilla bean' }));
    await mountAt('/notebook/new');
    await flush(() => location.pathname === '/notebook');
    expect(location.pathname).toBe('/notebook');
    await flush(() => buttonByText('New recipe') !== null);
    expect(root().querySelector('li.nb__draft')).toBeNull();
    expect(buttonByText('Resume')).toBeNull();
    expect(store.drafts.get(VERSION_ID).kind).toBe('edit');
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });
});

describe('a kept edit whose version has since gained a batch or a later version stays reachable (D-06)', () => {
  it('opens the editor on the kept draft with the refusal already standing under Save, and Cancel discards it', async () => {
    seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit({ name: 'Vanilla bean' }));
    store.batches = [
      createBatch(store.versions[0], { churnDate: '2026-10-09' }, null, { id: 'b-1', now: '2026-10-09T12:00:00.000Z', catalog: SEED_CATALOG }),
    ];
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name')?.value === 'Vanilla bean');

    expect(location.pathname).toBe(EDIT_PATH);
    expect(underSave()).toBe(EDIT_HAS_BATCH);
    expect(EDIT_HAS_BATCH).toBe('This version has a batch now and can no longer be edited.');
    expect(store.drafts.get(VERSION_ID).kind).toBe('edit');
    expect(repository.deleteDraft).not.toHaveBeenCalled();

    // A reload shows the same state.
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name')?.value === 'Vanilla bean');
    expect(underSave()).toBe(EDIT_HAS_BATCH);

    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === PAGE_PATH);
    expect(location.pathname).toBe(PAGE_PATH);
    expect(store.drafts.size).toBe(0);
  });

  it('names the later version when the version gained a child', async () => {
    seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit({ name: 'Vanilla bean' }));
    const parent = store.versions[0];
    store.versions.push({
      ...structuredClone(parent),
      id: 'v-child',
      parentVersionId: parent.id,
      parentVersionLabel: parent.versionLabel,
      versionLabel: 'Version 2',
      reason: 'Less sweet',
      sheetCode: codeFromVersionId('v-child'),
      createdAt: '2026-10-05T09:00:00.000Z',
    });
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name')?.value === 'Vanilla bean');
    expect(underSave()).toBe(EDIT_HAS_CHILD);
    expect(EDIT_HAS_CHILD).toBe('This version has a later version now and can no longer be edited.');
  });

  it('Save re-checks inside the transaction and shows the refusal it returns, writing nothing and keeping the draft', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    seedVanilla();
    await mountAt(EDIT_PATH);
    await flush(() => field('Recipe name') !== null);
    await type(field('Recipe name'), 'Vanilla bean');
    await advance(300);

    const lines = {
      'has-batch': EDIT_HAS_BATCH,
      'has-child': EDIT_HAS_CHILD,
      'draft-held': EDIT_DRAFT_HELD,
      changed: EDIT_CHANGED,
      gone: EDIT_CLOSED,
    };
    for (const [reason, line] of Object.entries(lines)) {
      repository.saveFirstVersionOver.mockResolvedValueOnce({ saved: false, reason });
      // eslint-disable-next-line no-await-in-loop
      await click(buttonByText('Save'));
      // eslint-disable-next-line no-await-in-loop
      await flush(() => underSave() === line);
      expect(underSave()).toBe(line);
      expect(location.pathname).toBe(EDIT_PATH);
      expect(buttonByText('Save')).not.toBeNull();
      expect(store.drafts.get(VERSION_ID).kind).toBe('edit');
    }
    expect(EDIT_DRAFT_HELD).toBe('This version has a Next version or a batch open in another tab. Close it there, then save.');
    expect(EDIT_CHANGED).toBe('This version changed in another tab. Cancel, then open it again.');
    expect(EDIT_CLOSED).toBe('This version can no longer be edited.');
    // The store itself was never written to (the stand-in's refusals write nothing).
    expect(store.versions[0].sheetTitle).toBe('Vanilla');
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });
});
