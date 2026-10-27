// @vitest-environment jsdom
//
// Edit and Resume editing on the version page (Phase 11 plan 12, STRUCT-04,
// D-04, D-23, RESEARCH G-1c): a saved first version with no batch and no child
// offers Edit beside Next version, at every width; with an edit draft kept, the
// acts row reads Resume editing in its place and offers no Next version, no
// Record a batch and no pen; and nothing is offered while a read that could
// disqualify the version is still out (T-11-56). Mounted whole, under
// StrictMode, over an in-memory stand-in for the repository whose reads can be
// held on deferred promises.
import { StrictMode, act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation, useParams } from 'react-router';

const store = vi.hoisted(() => ({
  drafts: new Map(),
  recipes: [],
  versions: [],
  batches: [],
  // A read held on a deferred promise: { listBatchesForVersion, listDrafts, listVersions }.
  hold: {},
}));

vi.mock('../store/repository.js', () => {
  const find = (list, id) => list.find((record) => record.id === id);
  const held = (name, read) =>
    vi.fn(async (...args) => {
      if (store.hold[name]) await store.hold[name];
      return read(...args);
    });
  return {
    repository: {
      getVersion: vi.fn(async (id) => {
        const found = find(store.versions, id);
        return found ? structuredClone(found) : undefined;
      }),
      listVersions: held('listVersions', () => structuredClone(store.versions)),
      listBatchesForVersion: held('listBatchesForVersion', (versionId) =>
        structuredClone(store.batches.filter((batch) => batch.versionId === versionId)),
      ),
      getAllBatches: vi.fn(async () => structuredClone(store.batches)),
      getBatch: vi.fn(async () => undefined),
      getRecipe: vi.fn(async (id) => {
        const found = find(store.recipes, id);
        return found ? structuredClone(found) : undefined;
      }),
      listDrafts: held('listDrafts', () => [...store.drafts.values()].map((record) => structuredClone(record))),
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
      saveVersion: vi.fn(async () => {}),
      createVersion: vi.fn(async () => {}),
      saveBatch: vi.fn(async () => {}),
      saveRecipe: vi.fn(async () => {}),
    },
  };
});

import { repository } from '../store/repository.js';
import { RecipePage } from './RecipePage.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { createRecipe } from '../domain/newRecipe.js';
import { rowFromLibraryRecord } from '../domain/versionRow.js';
import { createBatch } from '../domain/batch.js';
import { buildDraftRecord } from '../domain/draft.js';
import { penDraftFromVersion } from '../domain/penDraft.js';
import { draftFromVersion } from '../domain/creationSave.js';
import { STYLE_ROWS } from '../data/styles.js';
import { library } from '../data/library.js';
import { SEED_CATALOG } from '../data/seed-catalog.js';
import { oliveOilVersion, oliveOilRecipe } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const RECIPE_ID = 'r-vanilla';
const VERSION_ID = 'v-vanilla';
const PAGE_PATH = `/notebook/${RECIPE_ID}/${VERSION_ID}`;
const EDIT_PATH = `${PAGE_PATH}/edit`;
const NOW = '2026-10-09T12:00:00.000Z';

let current = null;
let location = null;
let originalMatchMedia = null;

function Where() {
  location = useLocation();
  return null;
}

function Keyed() {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} />;
}

function installMatchMedia(width = 1280) {
  Element.prototype.scrollIntoView = vi.fn();
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => {
    const max = query.match(/max-width:\s*([\d.]+)px/);
    const min = query.match(/min-width:\s*([\d.]+)px/);
    let matches = false;
    if (max) matches = width <= Number(max[1]);
    else if (min) matches = width >= Number(min[1]);
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

async function mountAt(path, { state, width } = {}) {
  installMatchMedia(width);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <StrictMode>
        <CatalogFixture>
          <MemoryRouter initialEntries={[state ? { pathname: path, state } : path]}>
            <Where />
            <Routes>
              <Route path="/notebook/:recipeId/:versionId" element={<Keyed />} />
              <Route path="/notebook/:recipeId/:versionId/edit" element={<p>edit route</p>} />
            </Routes>
          </MemoryRouter>
        </CatalogFixture>
      </StrictMode>,
    );
  });
  await flush(() => root_().querySelector('.notebook-version') !== null);
  await flush();
  return current.container;
}

const root_ = () => current.container;
const buttonByText = (text) => [...root_().querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
const actsWords = () => [...root_().querySelectorAll('.notebook-version__acts > *')].map((node) => node.textContent.trim());

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  await flush();
}

afterEach(async () => {
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
  store.hold = {};
  vi.clearAllMocks();
});

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

// A saved Vanilla root, built the way Save builds one: library-linked rows, no
// parent, so it is a first version.
function seedVanilla() {
  const rows = [
    rowFromLibraryRecord({ id: 'wholeMilk', entry: library.wholeMilk }, { id: 'row-a', grams: 500 }),
    rowFromLibraryRecord({ id: 'sucrose', entry: library.sucrose }, { id: 'row-b', grams: 100 }),
  ];
  const { recipe, version } = createRecipe(
    { name: 'Vanilla', versionLabel: 'Version 1', rows },
    { recipeId: RECIPE_ID, versionId: VERSION_ID, now: NOW },
  );
  store.recipes = [recipe];
  store.versions = [version];
  return { recipe, version };
}

function aBatch(version, id = 'b-1') {
  return createBatch(version, { churnDate: '2026-10-09' }, null, { id, now: NOW, catalog: SEED_CATALOG });
}

function keptDraft(kind, payload) {
  return buildDraftRecord({ versionId: VERSION_ID, kind, payload, penOpenedAt: NOW, now: NOW });
}

// The edit record the editor keeps: the create shape of the saved version.
function keptEdit(version) {
  return buildDraftRecord({
    versionId: VERSION_ID,
    kind: 'edit',
    payload: draftFromVersion(version, store.recipes[0], STYLE_ROWS),
    now: NOW,
  });
}

describe('Edit on a saved first version (STRUCT-04)', () => {
  it('shows Edit after Next version, and pressing it goes to the edit address', async () => {
    seedVanilla();
    await mountAt(PAGE_PATH);

    expect(actsWords()).toEqual(['Next version', 'Edit', 'Print sheet']);
    expect(buttonByText('Edit').className).toBe('notebook-link');
    expect(buttonByText('Next version').className).toBe('notebook-action');

    await click(buttonByText('Edit'));
    expect(location.pathname).toBe(EDIT_PATH);
    expect(root_().textContent).toContain('edit route');
  });

  it('shows Edit at a narrow width too (research open question 5)', async () => {
    seedVanilla();
    await mountAt(PAGE_PATH, { width: 600 });
    expect(buttonByText('Edit')).not.toBeNull();
    expect(buttonByText('Edit').className).toBe('notebook-link');
  });

  it('shows no Edit on a root with a batch, and Next version stands alone with the print link', async () => {
    const { version } = seedVanilla();
    store.batches = [aBatch(version)];
    await mountAt(PAGE_PATH);

    expect(buttonByText('Edit')).toBeNull();
    expect(actsWords()).toEqual(['Next version', 'Print sheet']);
  });

  it('shows no Edit on a child version', async () => {
    const { version } = seedVanilla();
    store.versions.push({ ...structuredClone(version), id: 'v-child', parentVersionId: version.id, parentVersionLabel: version.versionLabel });
    await mountAt('/notebook/r-vanilla/v-child');
    expect(root_().querySelector('.notebook-version')).not.toBeNull();
    expect(buttonByText('Edit')).toBeNull();
  });

  it('shows no Edit on the root once it has a child', async () => {
    const { version } = seedVanilla();
    store.versions.push({ ...structuredClone(version), id: 'v-child', parentVersionId: version.id, parentVersionLabel: version.versionLabel });
    await mountAt(PAGE_PATH);
    expect(buttonByText('Edit')).toBeNull();
  });

  it('shows no Edit while a Next version pen is kept on it (RESEARCH G-1c)', async () => {
    const { version } = seedVanilla();
    store.drafts.set(VERSION_ID, keptDraft('plan', { ...penDraftFromVersion(version), versionLabel: 'less milk' }));
    await mountAt(PAGE_PATH);
    expect(buttonByText('Edit')).toBeNull();
    expect(buttonByText('Resume editing')).toBeNull();
  });

  it('leaves the seeded Olive Oil page as it was', async () => {
    store.recipes = [oliveOilRecipe];
    store.versions = [structuredClone(oliveOilVersion)];
    await mountAt(`/notebook/${oliveOilVersion.recipeId}/${oliveOilVersion.id}`);
    expect(buttonByText('Next version')).not.toBeNull();
    expect(buttonByText('Resume editing')).toBeNull();
  });
});

describe('Resume editing while an edit draft is kept (D-04, D-23)', () => {
  it('reads Resume editing in Edit’s place, with no Next version, no Record a batch and the draft kept', async () => {
    const { version } = seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit(version));
    await mountAt(PAGE_PATH);

    expect(actsWords()).toEqual(['Resume editing', 'Print sheet']);
    expect(buttonByText('Edit')).toBeNull();
    expect(buttonByText('Next version')).toBeNull();
    expect(buttonByText('Record a batch')).toBeNull();
    expect(repository.deleteDraft).not.toHaveBeenCalled();
    expect(store.drafts.get(VERSION_ID).kind).toBe('edit');

    await click(buttonByText('Resume editing'));
    expect(location.pathname).toBe(EDIT_PATH);
  });

  it('draws no Record a batch below 724 either, and the record act is gone from the acts row', async () => {
    const { version } = seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit(version));
    await mountAt(PAGE_PATH, { width: 600 });
    expect(actsWords()).toEqual(['Resume editing', 'Print sheet']);
    expect(buttonByText('Record a batch')).toBeNull();
  });

  it('opens no pen for a startNextVersion route intent', async () => {
    const { version } = seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit(version));
    await mountAt(PAGE_PATH, { state: { startNextVersion: true } });
    await flush();

    expect(root_().querySelector('form[aria-label="Next version"]')).toBeNull();
    expect(buttonByText('Resume editing')).not.toBeNull();
    expect(store.drafts.get(VERSION_ID).kind).toBe('edit');
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });

  it('reads Resume editing for a stale edit, a batch recorded since, and no Next version', async () => {
    const { version } = seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit(version));
    store.batches = [aBatch(version)];
    await mountAt(PAGE_PATH);

    expect(actsWords()).toEqual(['Resume editing', 'Print sheet']);
    expect(buttonByText('Next version')).toBeNull();
    expect(buttonByText('Record a batch')).toBeNull();
    expect(buttonByText('Record another')).toBeNull();
    expect(store.drafts.get(VERSION_ID).kind).toBe('edit');
  });

  it('is tied to the version: another recipe’s kept edit changes nothing here', async () => {
    seedVanilla();
    const other = { ...keptEdit(store.versions[0]), versionId: 'v-elsewhere' };
    store.drafts.set('v-elsewhere', other);
    await mountAt(PAGE_PATH);
    expect(actsWords()).toEqual(['Next version', 'Edit', 'Print sheet']);
  });
});

describe('nothing is offered while a read is out (T-11-56)', () => {
  it('draws no Edit until the version’s batches are read, and none at all when they hold a batch', async () => {
    const { version } = seedVanilla();
    store.batches = [aBatch(version)];
    const gate = deferred();
    store.hold.listBatchesForVersion = gate.promise;
    await mountAt(PAGE_PATH);
    await flush();

    expect(buttonByText('Edit')).toBeNull();
    expect(buttonByText('Resume editing')).toBeNull();

    await act(async () => {
      gate.resolve();
    });
    await flush();
    expect(buttonByText('Edit')).toBeNull();
    expect(actsWords()).toEqual(['Next version', 'Print sheet']);
  });

  it('draws Edit once the batches arrive empty', async () => {
    seedVanilla();
    const gate = deferred();
    store.hold.listBatchesForVersion = gate.promise;
    await mountAt(PAGE_PATH);
    await flush();
    expect(buttonByText('Edit')).toBeNull();

    await act(async () => {
      gate.resolve();
    });
    await flush(() => buttonByText('Edit') !== null);
    expect(buttonByText('Edit')).not.toBeNull();
  });

  it('draws neither Edit nor Resume editing until the drafts are read', async () => {
    const { version } = seedVanilla();
    store.drafts.set(VERSION_ID, keptEdit(version));
    const gate = deferred();
    store.hold.listDrafts = gate.promise;
    await mountAt(PAGE_PATH);
    await flush();

    expect(buttonByText('Edit')).toBeNull();
    expect(buttonByText('Resume editing')).toBeNull();

    await act(async () => {
      gate.resolve();
    });
    await flush(() => buttonByText('Resume editing') !== null);
    expect(buttonByText('Resume editing')).not.toBeNull();
    expect(buttonByText('Edit')).toBeNull();
  });

  it('draws no Edit until every version is read, and none when a child arrives', async () => {
    const { version } = seedVanilla();
    store.versions.push({ ...structuredClone(version), id: 'v-child', parentVersionId: version.id, parentVersionLabel: version.versionLabel });
    const gate = deferred();
    store.hold.listVersions = gate.promise;
    await mountAt(PAGE_PATH);
    await flush();
    expect(buttonByText('Edit')).toBeNull();

    await act(async () => {
      gate.resolve();
    });
    await flush();
    expect(buttonByText('Edit')).toBeNull();
  });
});
