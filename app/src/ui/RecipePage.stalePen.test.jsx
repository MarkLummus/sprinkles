// @vitest-environment jsdom
//
// Two tabs over one real store (Phase 11 plan 12, STRUCT-04, D-06; review
// concern L275@45089779 and L82@45089779): a Next version pen left open in one
// tab cannot write its stale copy of the version over what another tab did
// since the page read it. Plan 11-03 closed the gap at the repository boundary
// (saveVersion with { expected } compares, inside its transaction, the stored
// version with the one the pen's page read, and refuses a changed one or one
// that gained a batch); this is its proof with the editor saving first. No
// repository mock: both pages share one fake-indexeddb store and the real
// transactions decide.
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
import { CatalogProvider } from './CatalogContext.jsx';
import { VERSION_CHANGED_STATUS, VERSION_HAS_BATCH_STATUS } from './useVersionPen.js';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { createBatch } from '../domain/batch.js';
import { sameRecord } from '../domain/firstVersion.js';
import { library } from '../data/library.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';

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

const field = (tab, label) => tab.container.querySelector(`[aria-label="${label}"]`);
const buttonByText = (tab, text) => [...tab.container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
const penOf = (tab) => tab.container.querySelector('form[aria-label="Next version"]');
const formStatusOf = (tab) => tab.container.querySelector('.form-status')?.textContent ?? '';

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

// Tab B: the page, a clean Next version pen (it writes no draft), then a Version
// name and a grams amount typed.
async function openStalePen(catalog) {
  const tab = await openTab(PAGE_PATH, catalog);
  await settle(() => buttonByText(tab, 'Next version') !== null);
  await click(buttonByText(tab, 'Next version'));
  await settle(() => penOf(tab) !== null);
  expect(penOf(tab)).not.toBeNull();
  return tab;
}

async function typeIntoPen(tab) {
  await type(field(tab, 'Version name'), 'less milk');
  await type(tab.container.querySelector('input[aria-label^="Whole milk"][aria-label*="grams"]'), '111');
}

let catalog = null;

beforeEach(async () => {
  caseNumber += 1;
  RECIPE_ID = `r-vanilla-${caseNumber}`;
  VERSION_ID = `v-vanilla-${caseNumber}`;
  PAGE_PATH = `/notebook/${RECIPE_ID}/${VERSION_ID}`;
  EDIT_PATH = `${PAGE_PATH}/edit`;
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

describe('a Next version pen left open in another tab (STRUCT-04, D-06)', () => {
  it('cannot save over a version the edit route saved over first: it says so, writes nothing and stays open', async () => {
    await storeVanilla();
    const tabB = await openStalePen(catalog);

    // Tab A: the edit route changes the recipe name and saves over the root.
    const tabA = await openTab(EDIT_PATH, catalog);
    await settle(() => field(tabA, 'Recipe name') !== null);
    await type(field(tabA, 'Recipe name'), 'Vanilla bean');
    await click(buttonByText(tabA, 'Save'));
    await settle(() => tabA.location.pathname === PAGE_PATH);
    await settle(() => tabA.container.querySelector('.page-status')?.textContent === 'Changes saved.');
    expect(tabA.location.pathname).toBe(PAGE_PATH);
    expect(tabA.container.querySelector('.page-status')?.textContent).toBe('Changes saved.');

    const savedByA = await repository.getVersion(VERSION_ID);
    expect(savedByA.sheetTitle).toBe('Vanilla bean');

    // Tab B: still the page it read before A saved; types, then Save over this version.
    await typeIntoPen(tabB);
    await click(buttonByText(tabB, 'Save over this version'));
    await settle(() => formStatusOf(tabB) !== '');

    expect(formStatusOf(tabB)).toBe(VERSION_CHANGED_STATUS);
    expect(VERSION_CHANGED_STATUS).toBe('This version changed in another tab. Cancel, then reload the page.');
    const stored = await repository.getVersion(VERSION_ID);
    expect(sameRecord(stored, savedByA)).toBe(true);
    expect(stored.sheetTitle).toBe('Vanilla bean');
    expect(stored.versionLabel).toBe('Version 1');
    // Tab B's pen is still open, with what was typed.
    expect(penOf(tabB)).not.toBeNull();
    expect(field(tabB, 'Version name').value).toBe('less milk');
    expect(unhandled).toEqual([]);
  });

  it('cannot save over a version that gained a batch since its page read it: it says Save as a new version instead and writes nothing', async () => {
    const { version } = await storeVanilla();
    const tabB = await openStalePen(catalog);

    // Another tab's record pen stores a batch for the root.
    await repository.saveBatch(createBatch(version, { churnDate: '2026-10-09' }, null, { id: 'b-1', now: NOW, catalog: SEED_CATALOG }));

    await typeIntoPen(tabB);
    await click(buttonByText(tabB, 'Save over this version'));
    await settle(() => formStatusOf(tabB) !== '');

    expect(formStatusOf(tabB)).toBe(VERSION_HAS_BATCH_STATUS);
    expect(VERSION_HAS_BATCH_STATUS).toBe('This version has a batch now. Save as a new version instead.');
    const stored = await repository.getVersion(VERSION_ID);
    expect(sameRecord(stored, version)).toBe(true);
    expect(penOf(tabB)).not.toBeNull();
    expect(unhandled).toEqual([]);
  });
});
