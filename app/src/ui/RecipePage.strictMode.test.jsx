// @vitest-environment jsdom
//
// 08-01 (D-10, Phase 8 Pitfall 2): a kept plan draft restores once when the
// page is mounted under React.StrictMode. StrictMode runs an effect twice in
// development; the restore effect is guarded by draftRestoreStartedRef, a ref
// with no cancelled flag, so the second run reads nothing. Deleting that guard
// must turn the second test red: pressing Save over this version calls
// setVersion(updated), which re-triggers the effect's dependency, and only the
// started-ref stops a second read of the draft.
//
// The mount harness is copied from RecipePage.drafts.test.jsx.
import { StrictMode } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

const store = vi.hoisted(() => ({
  drafts: new Map(),
  batches: [],
  getDraft: null,
  saveVersion: null,
}));

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe, oliveOilVersion } = await import('../data/olive-oil.js');
  store.getDraft = vi.fn(async (versionId) => {
    const found = store.drafts.get(versionId);
    return found ? structuredClone(found) : undefined;
  });
  store.saveVersion = vi.fn(async () => {});
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
      saveVersion: store.saveVersion,
      saveRecipe: vi.fn(async () => {}),
      getDraft: store.getDraft,
      saveDraft: vi.fn(async () => {}),
      deleteDraft: vi.fn(async (versionId) => {
        store.drafts.delete(versionId);
      }),
      listDrafts: async () => [...store.drafts.values()].map((record) => structuredClone(record)),
    },
  };
});

import { RecipePage, DRAFT_KEPT_STATUS } from './RecipePage.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { buildDraftRecord } from '../domain/draft.js';
import { penDraftFromVersion } from '../domain/penDraft.js';
import { oliveOilVersion } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VERSION = oliveOilVersion.id;
const VERSION_PATH = `/notebook/${oliveOilVersion.recipeId}/${VERSION}`;

let current = null;
let pageStatus = null;
let originalMatchMedia = null;

function Keyed({ onPageStatus }) {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={onPageStatus} />;
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

function nextVersionPen() {
  return current.container.querySelector('form[aria-label="Next version"]');
}

function versionNameField() {
  return current.container.querySelector('input[aria-label="Version name"]');
}

function buttonByText(text) {
  return [...current.container.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

async function mountStrict(path) {
  installMatchMedia();
  pageStatus = vi.fn();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <CatalogFixture>
        <StrictMode>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path="/notebook/:recipeId/:versionId" element={<Keyed onPageStatus={pageStatus} />} />
            </Routes>
          </MemoryRouter>
        </StrictMode>
      </CatalogFixture>,
    );
  });
  await flush(() => nextVersionPen() !== null);
  // One more turn: the restore reads the store after the loads settle.
  await flush(() => false);
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

function seedPlanDraft() {
  const payload = { ...penDraftFromVersion(oliveOilVersion), versionLabel: 'strict mode check' };
  const record = buildDraftRecord({
    versionId: VERSION,
    kind: 'plan',
    payload,
    penOpenedAt: '2026-10-10T08:00:00.000Z',
    now: '2026-10-10T08:05:00.000Z',
  });
  store.drafts.set(VERSION, structuredClone(record));
}

describe('a kept plan draft restores once under React.StrictMode', () => {
  it('restores the pen once: one read, one notice, the draft’s version name', async () => {
    seedPlanDraft();
    store.getDraft.mockClear();
    await mountStrict(VERSION_PATH);

    expect(nextVersionPen()).not.toBeNull();
    expect(versionNameField().value).toBe('strict mode check');
    expect(pageStatus.mock.calls.filter(([message]) => message === DRAFT_KEPT_STATUS)).toHaveLength(1);
    expect(store.getDraft).toHaveBeenCalledTimes(1);
  });

  it('Save over this version reads the draft zero more times', async () => {
    seedPlanDraft();
    store.getDraft.mockClear();
    store.saveVersion.mockClear();
    await mountStrict(VERSION_PATH);
    expect(nextVersionPen()).not.toBeNull();
    expect(store.getDraft).toHaveBeenCalledTimes(1);

    await click(buttonByText('Save over this version'));
    await flush(() => store.saveVersion.mock.calls.length > 0);
    await flush(() => false);

    expect(store.saveVersion).toHaveBeenCalledTimes(1);
    expect(store.getDraft).toHaveBeenCalledTimes(1);
  });
});
