// @vitest-environment jsdom
//
// Quick 261011-dz2, decide-import-refreshes-open-recipe-pens = refuse: while a
// recipe pen is open (Next version, the record pen with its Tasting section,
// Correct), pressing Import in the header or in More's list opens no file
// chooser, reads no file, calls importStore not at all and leaves storeRevision
// where it was; the page notice says IMPORT_BLOCKED_STATUS. With no pen open,
// Import works as before. Shell, the routed wrapper (router.jsx's
// RecipePageForRoute) and RecipePage are mounted whole over the in-memory
// repository stand-in the draft tests use.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useOutletContext } from 'react-router';

const store = vi.hoisted(() => ({
  drafts: new Map(),
  batches: [],
}));

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe, oliveOilVersion } = await import('../data/olive-oil.js');
  return {
    repository: {
      getVersion: async (id) => (id === oliveOilVersion.id ? structuredClone(oliveOilVersion) : undefined),
      listVersions: async () => [structuredClone(oliveOilVersion)],
      listBatchesForVersion: async () => store.batches.map((batch) => structuredClone(batch)),
      getAllBatches: async () => store.batches.map((batch) => structuredClone(batch)),
      getBatch: async (id) => {
        const found = store.batches.find((batch) => batch.id === id);
        return found ? structuredClone(found) : undefined;
      },
      getRecipe: async () => oliveOilRecipe,
      saveBatch: vi.fn(async () => {}),
      saveVersion: vi.fn(async () => {}),
      saveRecipe: vi.fn(async () => {}),
      getDraft: async (versionId) => {
        const found = store.drafts.get(versionId);
        return found ? structuredClone(found) : undefined;
      },
      saveDraft: vi.fn(async (record) => {
        store.drafts.set(record.versionId, structuredClone(record));
      }),
      deleteDraft: vi.fn(async (versionId) => {
        store.drafts.delete(versionId);
      }),
      listDrafts: async () => [...store.drafts.values()].map((record) => structuredClone(record)),
    },
  };
});
// importStore is a stand-in that accepts; restoreAllMocks does not reset a
// factory vi.fn, so mount() clears it.
vi.mock('../store/transfer.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, importStore: vi.fn(async () => ({ ok: true })) };
});

import { importStore } from '../store/transfer.js';
import { Shell, IMPORT_BLOCKED_STATUS } from './Shell.jsx';
import { RecipePageForRoute } from '../router.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const RECIPE = oliveOilVersion.recipeId;
const VERSION = oliveOilVersion.id;
const VERSION_PATH = `/notebook/${RECIPE}/${VERSION}`;
const BATCH_PATH = `${VERSION_PATH}/batch/${augustSecondBatch.id}`;

let current = null;
let revisionNow = null;
let originalMatchMedia = null;
let chooserClick = null;

function Routed() {
  revisionNow = useOutletContext();
  return <RecipePageForRoute />;
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
  installMatchMedia();
  importStore.mockClear();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/notebook/:recipeId/:versionId" element={<Routed />} />
            <Route path="/notebook/:recipeId/:versionId/batch/:batchId" element={<Routed />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  });
  await flush(() => buttonByText('Next version') !== null);
  await flush(() => false);
  // Count only the Shell's own chooser call.
  chooserClick = vi.spyOn(current.container.querySelector('input.shell__file-input'), 'click').mockImplementation(() => {});
  return current.container;
}

afterEach(async () => {
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
  store.batches = [];
});

function buttonByText(text, scope) {
  const root = scope ?? current.container;
  return [...root.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

async function chooseFile(content) {
  const input = current.container.querySelector('input.shell__file-input');
  Object.defineProperty(input, 'files', { value: [{ text: async () => content }], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

const headerImport = () => buttonByText('Import', current.container.querySelector('.shell__tools'));
const moreImport = () => buttonByText('Import', current.container.querySelector('.shell__more'));
const notice = () => current.container.querySelector('.page-status').textContent;

function expectRefused() {
  expect(chooserClick).not.toHaveBeenCalled();
  expect(importStore).not.toHaveBeenCalled();
  expect(revisionNow).toBe(0);
  expect(notice()).toBe(IMPORT_BLOCKED_STATUS);
}

describe('Import is refused while a pen is open (261011-dz2, decide-import-refreshes-open-recipe-pens = refuse)', () => {
  it('Next version pen: the header Import opens no chooser, reads nothing, and the notice says why', async () => {
    await mountAt(VERSION_PATH);
    await click(buttonByText('Next version'));
    await flush(() => current.container.querySelector('form[aria-label="Next version"]') !== null);
    await click(headerImport());
    expectRefused();
  });

  it('Next version pen: More’s Import is refused the same way', async () => {
    await mountAt(VERSION_PATH);
    await click(buttonByText('Next version'));
    await flush(() => current.container.querySelector('form[aria-label="Next version"]') !== null);
    await click(moreImport());
    expectRefused();
  });

  it('record pen: Import is refused', async () => {
    await mountAt(VERSION_PATH);
    await click(buttonByText('Record a batch'));
    await flush(() => buttonByText('Save batch') !== null);
    await click(headerImport());
    expectRefused();
  });

  it('Correct pen (the Tasting section opens inside it): Import is refused', async () => {
    store.batches = [structuredClone(augustSecondBatch)];
    await mountAt(BATCH_PATH);
    await click(buttonByText('Correct'));
    await flush(() => buttonByText('Save batch') !== null);
    await click(headerImport());
    expectRefused();
  });

  it('after Cancel closes the pen, Import opens the chooser and a chosen file reaches importStore', async () => {
    await mountAt(VERSION_PATH);
    await click(buttonByText('Next version'));
    await flush(() => current.container.querySelector('form[aria-label="Next version"]') !== null);
    await click(buttonByText('Cancel'));
    await flush(() => current.container.querySelector('form[aria-label="Next version"]') === null);

    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    await chooseFile('{}');
    expect(importStore).toHaveBeenCalledTimes(1);
    expect(revisionNow).toBe(1);
  });

  it('with no pen ever opened, Import works as before', async () => {
    await mountAt(VERSION_PATH);
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(notice()).toBe('');
    await chooseFile('{}');
    expect(importStore).toHaveBeenCalledTimes(1);
    expect(revisionNow).toBe(1);
  });
});
