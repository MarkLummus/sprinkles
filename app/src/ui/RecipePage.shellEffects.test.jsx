// @vitest-environment jsdom
//
// 08-01 (EDIT-06, Phase 8 Pitfall 5): characterization of two things the page
// shell does that no test covered before the split. The shell tells the Shell
// whether a pen is open (onPenOpenChange), and it leads the tab title with the
// recipe name while mounted. Both pass at the base commit, before any cut, so
// a cut that loses either one turns this file red.
//
// The mount harness is copied from RecipePage.drafts.test.jsx: RecipePage over
// an in-memory stand-in for the repository seam, inside a MemoryRouter.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

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
      saveDraft: vi.fn(async () => {}),
      deleteDraft: vi.fn(async () => {}),
      listDrafts: async () => [...store.drafts.values()].map((record) => structuredClone(record)),
    },
  };
});

import { RecipePage } from './RecipePage.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { oliveOilRecipe, oliveOilVersion } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VERSION_PATH = `/notebook/${oliveOilVersion.recipeId}/${oliveOilVersion.id}`;

let current = null;
let originalMatchMedia = null;

// router.jsx keys RecipePage by its three route parameters; this wrapper does
// the same, and also hands the page the onPenOpenChange spy.
function Keyed({ onPageStatus, onPenOpenChange }) {
  const { recipeId, versionId, batchId } = useParams();
  return (
    <RecipePage
      key={`${recipeId}::${versionId}::${batchId ?? ''}`}
      onPageStatus={onPageStatus}
      onPenOpenChange={onPenOpenChange}
    />
  );
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

async function mountAt(path, onPenOpenChange) {
  installMatchMedia();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <CatalogFixture>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route
              path="/notebook/:recipeId/:versionId"
              element={<Keyed onPageStatus={vi.fn()} onPenOpenChange={onPenOpenChange} />}
            />
          </Routes>
        </MemoryRouter>
      </CatalogFixture>,
    );
  });
  await flush(() => buttonByText('Next version') !== null);
  await flush(() => false);
  return current.container;
}

async function unmountPage() {
  await act(async () => current.root.unmount());
  current.container.remove();
  current = null;
  if (originalMatchMedia === undefined) delete window.matchMedia;
  else window.matchMedia = originalMatchMedia;
  originalMatchMedia = null;
  delete Element.prototype.scrollIntoView;
}

afterEach(async () => {
  vi.restoreAllMocks();
  if (current) await unmountPage();
  store.drafts.clear();
  store.batches = [];
});

function buttonByText(text) {
  return [...current.container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function lastCall(spy) {
  return spy.mock.calls[spy.mock.calls.length - 1][0];
}

describe('the shell’s own effects (characterization before the Phase 8 split)', () => {
  it('tells the Shell whether a pen is open (onPenOpenChange)', async () => {
    const onPenOpenChange = vi.fn();
    await mountAt(VERSION_PATH, onPenOpenChange);
    expect(onPenOpenChange).toHaveBeenCalled();
    expect(lastCall(onPenOpenChange)).toBe(false);

    await click(buttonByText('Next version'));
    expect(lastCall(onPenOpenChange)).toBe(true);
    await click(buttonByText('Cancel'));
    expect(lastCall(onPenOpenChange)).toBe(false);

    await click(buttonByText('Record a batch'));
    expect(lastCall(onPenOpenChange)).toBe(true);
    await click(buttonByText('Cancel'));
    expect(lastCall(onPenOpenChange)).toBe(false);
  });

  it('leads the tab title with the recipe name while mounted, and puts Sprinkles back on unmount', async () => {
    await mountAt(VERSION_PATH, vi.fn());
    expect(document.title).toBe(`${oliveOilRecipe.name} · Sprinkles`);
    await unmountPage();
    expect(document.title).toBe('Sprinkles');
  });
});
