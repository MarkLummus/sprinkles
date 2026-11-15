// @vitest-environment jsdom
//
// A kept edit resumed after another tab saved over its version (quick
// 261115-htp, WR-02 of 11-REVIEW.md; Phase 11 STRUCT-04, D-06). Cause: Save-over's
// `expected` is the records the edit route reads when the route opens, not the
// records the edit began against, and the kept edit carried no base. A kept edit
// resumed over a version that moved therefore passed every check in
// saveFirstVersionOver and wrote the old edit over the other tab's save. Now
// every edit record carries the fingerprint of the seed it began from, and a
// kept edit whose base is not what the version means now opens refused.
//
// Two tabs over one real fake-indexeddb store, modelled on
// RecipePage.stalePen.test.jsx: no repository mock, the real transactions decide.
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
import { EditRoute } from './EditRoute.jsx';
import { EDIT_CHANGED } from './CreationPage.jsx';
import { CatalogProvider } from './CatalogContext.jsx';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { buildDraftRecord } from '../domain/draft.js';
import { draftFromVersion } from '../domain/creationSave.js';
import { normalizeCreateDraft } from '../domain/creation.js';
import { normalizeAllocation } from '../domain/creationSteps.js';
import { library } from '../data/library.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The store is one module-level connection that lives for the whole file, so each
// case stores its own Vanilla under ids of its own.
let caseNumber = 0;
let RECIPE_ID = '';
let VERSION_ID = '';
let PAGE_PATH = '';
let EDIT_PATH = '';
const NOW = '2026-10-09T12:00:00.000Z';

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
                <Route path="/notebook/:recipeId/:versionId/edit" element={<EditRoute />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </CatalogProvider>
      </StrictMode>,
    );
  });
  return tab;
}

async function closeTab(tab) {
  await act(async () => tab.root.unmount());
  tab.container.remove();
  tabs = tabs.filter((other) => other !== tab);
}

const field = (tab, label) => tab.container.querySelector(`[aria-label="${label}"]`);
const buttonByText = (tab, text) => [...tab.container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
const underSave = (tab) => tab.container.querySelector('.notebook-ceremony p.field-error')?.textContent ?? null;

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

// A Vanilla root with no batch and no child, stored through the real
// repository the way a creation's Save stores it.
async function storeVanilla() {
  const rows = [
    rowFromLibraryRecord({ id: 'wholeMilk', entry: library.wholeMilk }, { id: 'row-a', grams: 500 }),
    rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-b', grams: 100 }),
  ];
  const { recipe, version } = createRecipe(
    { name: 'Vanilla', versionLabel: 'Version 1', rows },
    { recipeId: RECIPE_ID, versionId: VERSION_ID, now: NOW },
  );
  await repository.createRecipeWithVersion({ recipe, version });
  return { recipe, version };
}

const seedOf = (version, recipe) => normalizeAllocation(normalizeCreateDraft(draftFromVersion(version, recipe, catalog.styles)));

let catalog = null;

beforeEach(async () => {
  caseNumber += 1;
  RECIPE_ID = `r-stale-${caseNumber}`;
  VERSION_ID = `v-stale-${caseNumber}`;
  PAGE_PATH = `/notebook/${RECIPE_ID}/${VERSION_ID}`;
  EDIT_PATH = `${PAGE_PATH}/edit`;
  installMatchMedia();
  process.on('unhandledRejection', onUnhandled);
  await seedIfEmpty(repository);
  catalog = await loadCatalog(repository);
});

afterEach(async () => {
  vi.restoreAllMocks();
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

describe('a kept edit begun on what the version no longer says (WR-02, 261115-htp)', () => {
  it('A: a kept edit written back after another tab saved opens refused, writes nothing on any press, and Cancel ends it', async () => {
    await storeVanilla();

    // Tab A starts an edit and types: an edit draft is kept.
    const tabA = await openTab(EDIT_PATH, catalog);
    await settle(() => field(tabA, 'Recipe name') !== null);
    await type(field(tabA, 'Recipe name'), 'Vanilla A');
    await settle(undefined, 40);
    expect((await repository.getDraft(VERSION_ID)).kind).toBe('edit');

    // Tab B resumes it, changes the description and saves over the version.
    const tabB = await openTab(EDIT_PATH, catalog);
    await settle(() => field(tabB, 'Recipe name')?.value === 'Vanilla A');
    await type(field(tabB, 'Recipe description'), 'Saved by B.');
    await click(buttonByText(tabB, 'Save'));
    await settle(() => tabB.location.pathname === PAGE_PATH);
    expect(tabB.location.pathname).toBe(PAGE_PATH);
    expect((await repository.getVersion(VERSION_ID)).sheetDescription).toBe('Saved by B.');
    expect(await repository.getDraft(VERSION_ID)).toBeUndefined();

    // Tab A, still open, types again: the edit draft is written back.
    await type(field(tabA, 'Recipe name'), 'Vanilla A2');
    await settle(undefined, 40);
    expect((await repository.getDraft(VERSION_ID)).payload.name).toBe('Vanilla A2');

    // Its own Save is refused in the page (guarded already).
    await click(buttonByText(tabA, 'Save'));
    await settle(() => underSave(tabA) !== null);
    expect(underSave(tabA)).toBe(EDIT_CHANGED);
    await closeTab(tabA);

    // A fresh tab resumes that kept edit.
    const tabC = await openTab(EDIT_PATH, catalog);
    await settle(() => field(tabC, 'Recipe name')?.value === 'Vanilla A2');
    expect(field(tabC, 'Recipe name').value).toBe('Vanilla A2');
    expect(underSave(tabC)).toBe(EDIT_CHANGED);

    const saveOver = vi.spyOn(repository, 'saveFirstVersionOver');
    field(tabC, 'Recipe description').focus();
    await click(buttonByText(tabC, 'Save'));
    await settle(undefined, 20);
    expect(underSave(tabC)).toBe(EDIT_CHANGED);
    expect(tabC.location.pathname).toBe(EDIT_PATH);
    expect(saveOver).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(buttonByText(tabC, 'Save'));
    expect((await repository.getVersion(VERSION_ID)).sheetDescription).toBe('Saved by B.');
    expect((await repository.getRecipe(RECIPE_ID)).description).toBe('Saved by B.');
    expect((await repository.getDraft(VERSION_ID)).kind).toBe('edit');

    // A second press moves focus again and still writes nothing.
    field(tabC, 'Recipe description').focus();
    await click(buttonByText(tabC, 'Save'));
    await settle(undefined, 10);
    expect(saveOver).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(buttonByText(tabC, 'Save'));

    // Cancel ends the kept edit and leaves B's save.
    await click(buttonByText(tabC, 'Cancel'));
    await settle(() => tabC.location.pathname === PAGE_PATH);
    expect(tabC.location.pathname).toBe(PAGE_PATH);
    expect(await repository.getDraft(VERSION_ID)).toBeUndefined();
    expect((await repository.getVersion(VERSION_ID)).sheetDescription).toBe('Saved by B.');
    expect(unhandled).toEqual([]);
  });

  it('B: a kept edit stored without a base opens refused, is never re-based by typing, and Save writes nothing', async () => {
    const { version, recipe } = await storeVanilla();
    const legacy = buildDraftRecord({
      versionId: VERSION_ID,
      kind: 'edit',
      payload: { ...seedOf(version, recipe), name: 'Vanilla legacy' },
      now: NOW,
    });
    expect(await repository.saveDraft(legacy)).toBe(true);

    const tab = await openTab(EDIT_PATH, catalog);
    await settle(() => field(tab, 'Recipe name')?.value === 'Vanilla legacy');
    expect(field(tab, 'Recipe name').value).toBe('Vanilla legacy');
    expect(underSave(tab)).toBe(EDIT_CHANGED);

    const saveOver = vi.spyOn(repository, 'saveFirstVersionOver');
    await click(buttonByText(tab, 'Save'));
    await settle(undefined, 20);
    expect(saveOver).not.toHaveBeenCalled();
    expect(underSave(tab)).toBe(EDIT_CHANGED);
    expect((await repository.getVersion(VERSION_ID)).sheetTitle).toBe('Vanilla');

    await type(field(tab, 'Recipe name'), 'Vanilla legacy 2');
    await settle(undefined, 40);
    const kept = await repository.getDraft(VERSION_ID);
    expect(kept.payload.name).toBe('Vanilla legacy 2');
    expect(kept.baseFingerprint).toBeUndefined();
    expect(unhandled).toEqual([]);
  });

  it('C: one tab is unchanged, a kept edit reopens with no line and Save writes over the version, and the record carries its base', async () => {
    await storeVanilla();

    const tabA = await openTab(EDIT_PATH, catalog);
    await settle(() => field(tabA, 'Recipe name') !== null);
    await type(field(tabA, 'Recipe name'), 'Vanilla bean');
    await settle(undefined, 40);
    const kept = await repository.getDraft(VERSION_ID);
    await closeTab(tabA);

    const tabB = await openTab(EDIT_PATH, catalog);
    await settle(() => field(tabB, 'Recipe name')?.value === 'Vanilla bean');
    expect(field(tabB, 'Recipe name').value).toBe('Vanilla bean');
    expect(underSave(tabB)).toBeNull();

    await click(buttonByText(tabB, 'Save'));
    await settle(() => tabB.location.pathname === PAGE_PATH);
    expect(tabB.location.pathname).toBe(PAGE_PATH);
    expect((await repository.getVersion(VERSION_ID)).sheetTitle).toBe('Vanilla bean');
    expect(await repository.getDraft(VERSION_ID)).toBeUndefined();

    expect(typeof kept.baseFingerprint).toBe('string');
    expect(unhandled).toEqual([]);
  });
});
