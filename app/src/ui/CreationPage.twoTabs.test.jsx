// @vitest-environment jsdom
//
// A creation saved in another tab (review 11-REVIEW.md, WR-01): two tabs over
// one real store. Once tab A has saved a creation, tab B, which still holds the
// editor, must not write the create draft back (a ghost no Save can clear: it
// hides Edit and refuses Import), and B's own Save goes to the saved recipe
// instead of failing. No repository mock: both tabs share one fake-indexeddb
// store and the real transactions decide.
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
import { RecipePageForRoute, RECIPE_SAVED_STATUS } from '../router.jsx';
import { CreationRoute } from './CreationRoute.jsx';
import { RECIPE_CREATE_ERROR } from './CreationPage.jsx';
import { CatalogProvider } from './CatalogContext.jsx';
import { blankCreateDraft, buildDraftRecord, draftMatchesCreate } from '../domain/draft.js';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { sameRecord } from '../domain/firstVersion.js';
import { library } from '../data/library.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The store is one module-level connection that lives for the whole file, so each
// case stores its own creation under ids of its own.
let caseNumber = 0;
let RECIPE_ID = '';
let VERSION_ID = '';
let PAGE_PATH = '';
const NOW = '2026-11-15T10:00:00.000Z';
const TYPED_IN_B = 'Typed in B after A saved.';

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
                <Route path="/notebook" element={<p>Notebook</p>} />
                <Route path="/notebook/new" element={<CreationRoute />} />
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

const field = (tab, label) => tab.container.querySelector(`[aria-label="${label}"]`);
const buttonByText = (tab, text) => [...tab.container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
const lineUnderSave = (tab) => tab.container.querySelector('.notebook-ceremony p.field-error')?.textContent ?? '';
const statusOf = (tab) => tab.container.querySelector('.page-status')?.textContent ?? '';
const actsOf = (tab) => [...tab.container.querySelectorAll('.notebook-version__acts > *')].map((node) => node.textContent.trim());

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

// The create draft the Notebook's Start would have written, with one unplaced
// Sucrose row at 150 g: the smallest creation Save accepts.
async function storeCreateDraft() {
  const payload = {
    ...blankCreateDraft({ recipeId: RECIPE_ID, versionId: VERSION_ID, name: 'Vanilla' }),
    rows: [{ id: 'row-a', libraryId: 'sucrose', portions: [{ step: 1, grams: '150' }] }],
  };
  await repository.saveDraft(buildDraftRecord({ versionId: VERSION_ID, kind: 'create', payload, now: NOW }));
}

// What an older build left behind: the recipe and its root stored without the
// draft's delete (neither call touches drafts).
async function storeRootBesideDraft() {
  const rows = [rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-a', grams: 150 })];
  const { recipe, version } = createRecipe(
    { name: 'Vanilla', versionLabel: 'Version 1', rows },
    { recipeId: RECIPE_ID, versionId: VERSION_ID, now: NOW },
  );
  await repository.saveRecipe(recipe);
  await repository.createVersion(version);
}

async function openEditor(catalog) {
  const tab = await openTab('/notebook/new', catalog);
  await settle(() => field(tab, 'Recipe name') !== null);
  expect(field(tab, 'Recipe name')).not.toBeNull();
  return tab;
}

// Tab A saves and lands on the recipe's page.
async function saveInA(tabA) {
  await click(buttonByText(tabA, 'Save'));
  await settle(() => tabA.location.pathname === PAGE_PATH);
  expect(tabA.location.pathname).toBe(PAGE_PATH);
  expect(await repository.getDraft(VERSION_ID)).toBeUndefined();
}

let catalog = null;

beforeEach(async () => {
  caseNumber += 1;
  RECIPE_ID = `r-wr01-${caseNumber}`;
  VERSION_ID = `v-wr01-${caseNumber}`;
  PAGE_PATH = `/notebook/${RECIPE_ID}/${VERSION_ID}`;
  installMatchMedia();
  process.on('unhandledRejection', onUnhandled);
  await seedIfEmpty(repository);
  catalog = await loadCatalog(repository);
  // CreationRoute opens the newest create draft, so no earlier case's may stay.
  for (const record of await repository.listDrafts()) {
    // eslint-disable-next-line no-await-in-loop
    await repository.deleteDraft(record.versionId);
  }
  await storeCreateDraft();
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

describe('a creation saved in another tab (WR-01)', () => {
  it('U1: words typed in the other tab afterwards write no create draft back', async () => {
    const tabA = await openEditor(catalog);
    const tabB = await openEditor(catalog);
    await saveInA(tabA);

    await type(field(tabB, 'Recipe description'), TYPED_IN_B);
    // Past the 250 ms debounce.
    await settle(() => false, 40);

    expect(await repository.getDraft(VERSION_ID)).toBeUndefined();
    expect((await repository.listDrafts()).some(draftMatchesCreate)).toBe(false);
    expect(unhandled).toEqual([]);
  });

  it('U2: Save in the other tab goes to the saved recipe, writes nothing over it and keeps no draft', async () => {
    const tabA = await openEditor(catalog);
    const tabB = await openEditor(catalog);
    await saveInA(tabA);
    const savedByA = await repository.getVersion(VERSION_ID);

    await click(buttonByText(tabB, 'Save'));
    await settle(() => tabB.location.pathname !== '/notebook/new');

    expect(tabB.location.pathname).toBe(PAGE_PATH);
    expect(lineUnderSave(tabB)).not.toBe(RECIPE_CREATE_ERROR);
    expect(await repository.getDraft(VERSION_ID)).toBeUndefined();
    expect(sameRecord(await repository.getVersion(VERSION_ID), savedByA)).toBe(true);
    // This press wrote nothing, so no landing word claims it did.
    await settle(() => false, 20);
    expect(statusOf(tabB)).toBe('');
    expect(unhandled).toEqual([]);
  });

  it('U3: a ghost kept from before the guard opens, and its Save clears it and offers Edit', async () => {
    await storeRootBesideDraft();
    expect((await repository.getDraft(VERSION_ID)).kind).toBe('create');

    const tab = await openEditor(catalog);
    await click(buttonByText(tab, 'Save'));
    await settle(() => tab.location.pathname !== '/notebook/new');

    expect(tab.location.pathname).toBe(PAGE_PATH);
    expect(await repository.getDraft(VERSION_ID)).toBeUndefined();
    await settle(() => actsOf(tab).includes('Edit'));
    expect(actsOf(tab)).toContain('Edit');
    expect(unhandled).toEqual([]);
  });

  it('U4: with one tab, Save lands on the recipe with Recipe saved. and Edit', async () => {
    const tab = await openEditor(catalog);
    await click(buttonByText(tab, 'Save'));
    await settle(() => tab.location.pathname !== '/notebook/new');

    expect(tab.location.pathname).toBe(PAGE_PATH);
    expect(await repository.getDraft(VERSION_ID)).toBeUndefined();
    await settle(() => statusOf(tab) === RECIPE_SAVED_STATUS);
    expect(statusOf(tab)).toBe(RECIPE_SAVED_STATUS);
    await settle(() => actsOf(tab).includes('Edit'));
    expect(actsOf(tab)).toContain('Edit');
    expect(unhandled).toEqual([]);
  });
});
