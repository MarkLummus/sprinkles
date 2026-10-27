// @vitest-environment jsdom
//
// Phase 10 plan 04 (MAKE-11, D-10, D-10a): while a create draft is kept, pressing
// Import in the header or in More's list opens no file chooser, reads no file,
// calls importStore not at all and leaves storeRevision where it was; the page
// notice says CREATION_IMPORT_BLOCKED_STATUS. The Shell knows at the click, without
// awaiting, which of three states holds (unknown, absent, present), so a cold-boot
// click, a failed read and the moments after Start and Cancel are cases of their
// own. Shell is mounted whole over an in-memory repository stand-in; the reads the
// Shell itself makes can be deferred or rejected by a case, told apart from the
// pages' own reads by the file in the call stack.
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate, useOutletContext } from 'react-router';

const store = vi.hoisted(() => ({
  drafts: new Map(),
  batches: [],
  // When set, the Shell's own drafts reads go through this instead of the map;
  // pageReads does the same for every other caller (a page's own read).
  shellReads: null,
  pageReads: null,
}));

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe, oliveOilVersion } = await import('../data/olive-oil.js');
  const { seedRecipeGroups } = await import('../data/seed-recipes.js');
  const { library } = await import('../data/library.js');
  const groups = seedRecipeGroups;
  return {
    repository: {
      // The Notebook's and the editor's reads.
      getAll: vi.fn(async () => structuredClone(groups.flatMap((group) => group.versions))),
      getAllBatches: vi.fn(async () => structuredClone(groups.flatMap((group) => group.batches))),
      listRecipes: vi.fn(async () => structuredClone(groups.map((group) => group.recipe))),
      listLibrary: vi.fn(async () => Object.entries(library).map(([id, entry]) => ({ id, entry: structuredClone(entry) }))),
      saveDraft: vi.fn(async (record) => {
        store.drafts.set(record.versionId, structuredClone(record));
      }),
      deleteDraft: vi.fn(async (versionId) => {
        store.drafts.delete(versionId);
      }),
      getDraft: async (versionId) => {
        const found = store.drafts.get(versionId);
        return found ? structuredClone(found) : undefined;
      },
      // The version route's reads, as Shell.importGuard.test.jsx has them.
      getVersion: async (id) => (id === oliveOilVersion.id ? structuredClone(oliveOilVersion) : undefined),
      listVersions: async () => [structuredClone(oliveOilVersion)],
      listBatchesForVersion: async () => store.batches.map((batch) => structuredClone(batch)),
      getBatch: async (id) => {
        const found = store.batches.find((batch) => batch.id === id);
        return found ? structuredClone(found) : undefined;
      },
      getRecipe: async () => oliveOilRecipe,
      saveBatch: vi.fn(async () => {}),
      saveVersion: vi.fn(async () => {}),
      saveRecipe: vi.fn(async () => {}),
      listDrafts: vi.fn(() => {
        const fromShell = new Error('read').stack.includes('/ui/Shell.jsx');
        if (fromShell && store.shellReads) return store.shellReads();
        if (!fromShell && store.pageReads) return store.pageReads();
        return Promise.resolve([...store.drafts.values()].map((record) => structuredClone(record)));
      }),
    },
  };
});
// importStore is a stand-in that accepts; restoreAllMocks does not reset a
// factory vi.fn, so mount() clears it.
vi.mock('../store/transfer.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, importStore: vi.fn(async () => ({ ok: true })) };
});

import { repository } from '../store/repository.js';
import { importStore } from '../store/transfer.js';
import { Shell, CREATION_IMPORT_BLOCKED_STATUS, IMPORT_BLOCKED_STATUS, editImportBlockedStatus } from './Shell.jsx';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { Button } from './Button.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { blankCreateDraft, buildDraftRecord } from '../domain/draft.js';
import { NotebookPlace } from './NotebookPlace.jsx';
import { CreationRoute } from './CreationRoute.jsx';
import { RecipePageForRoute } from '../router.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let current = null;
let revisionNow = null;
let originalMatchMedia = null;
let chooserClick = null;

// Every routed page is wrapped so the Outlet's revision (storeRevision) is read.
function Revision({ children }) {
  revisionNow = useOutletContext();
  return children;
}

function Home() {
  return <p>Home stand-in</p>;
}

// Phase 11 plan 12: a stand-in for the edit route (the guard reads only its
// address), and a page whose one button lands elsewhere with the route state a
// Save writes, so a case can press Import in the first tick after that landing.
function EditStandIn() {
  return <p>Edit stand-in</p>;
}

let leaveWith = { to: '/', state: null };

function Leave() {
  const navigate = useNavigate();
  return (
    <Button onClick={() => navigate(leaveWith.to, { replace: true, state: leaveWith.state })}>Land</Button>
  );
}

const VERSION_PATH = `/notebook/${oliveOilVersion.recipeId}/${oliveOilVersion.id}`;

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

async function mountAt(path = '/', until = () => false) {
  installMatchMedia();
  importStore.mockClear();
  repository.listDrafts.mockClear();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <CatalogFixture>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Revision><Home /></Revision>} />
              <Route path="/notebook" element={<Revision><NotebookPlace /></Revision>} />
              <Route path="/notebook/new" element={<Revision><CreationRoute /></Revision>} />
              <Route path="/notebook/:recipeId/:versionId" element={<Revision><RecipePageForRoute /></Revision>} />
              <Route path="/notebook/:recipeId/:versionId/edit" element={<Revision><EditStandIn /></Revision>} />
              <Route path="/leave" element={<Revision><Leave /></Revision>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CatalogFixture>,
    );
  });
  await flush(until);
  await flush();
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
  store.shellReads = null;
  store.pageReads = null;
  leaveWith = { to: '/', state: null };
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

function deferred() {
  const handle = {};
  handle.promise = new Promise((resolve, reject) => {
    handle.resolve = resolve;
    handle.reject = reject;
  });
  return handle;
}

// A file whose text() the case resolves later; the change event is dispatched as
// Shell.flyout.test.jsx's chooseFile does, without waiting for the read.
async function chooseDeferredFile() {
  const text = deferred();
  const input = current.container.querySelector('input.shell__file-input');
  Object.defineProperty(input, 'files', { value: [{ text: () => text.promise }], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  return text;
}

async function settleImport(text, content) {
  await act(async () => {
    text.resolve(content);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  await flush();
}

const headerImport = () => buttonByText('Import', current.container.querySelector('.shell__tools'));
const moreImport = () => buttonByText('Import', current.container.querySelector('.shell__more'));
const notices = () => [...current.container.querySelectorAll('.page-status')];
const notice = () => notices()[0].textContent;

function createDraftRecord(name = 'Lemon', ids = { recipeId: 'r-kept', versionId: 'v-kept' }, now = '2026-10-20T08:00:00.000Z') {
  return buildDraftRecord({
    versionId: ids.versionId,
    kind: 'create',
    payload: blankCreateDraft({ recipeId: ids.recipeId, versionId: ids.versionId, name }),
    now,
  });
}

function expectRefused(message) {
  expect(chooserClick).not.toHaveBeenCalled();
  expect(importStore).not.toHaveBeenCalled();
  expect(revisionNow).toBe(0);
  expect(notices()).toHaveLength(1);
  expect(notice()).toBe(message);
}

describe('Import is refused while a create draft is kept (D-10, decide-import-refreshes-open-recipe-pens = refuse)', () => {
  it('the header Import opens no chooser, reads nothing, and the one notice says why', async () => {
    store.drafts.set('v-kept', createDraftRecord());
    await mountAt('/');
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('More’s Import is refused the same way', async () => {
    store.drafts.set('v-kept', createDraftRecord());
    await mountAt('/');
    await click(moreImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('with the store empty, Import opens the chooser and the notice is empty', async () => {
    await mountAt('/');
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(notices()).toHaveLength(1);
    expect(notice()).toBe('');
    await click(moreImport());
    expect(chooserClick).toHaveBeenCalledTimes(2);
  });

  it('a plan draft for a stored version is not a kept creation: Import opens the chooser', async () => {
    store.drafts.set(
      'v-stored',
      buildDraftRecord({ versionId: 'v-stored', kind: 'plan', payload: {}, now: '2026-10-20T08:00:00.000Z' }),
    );
    await mountAt('/');
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(notice()).toBe('');
  });
});

describe('the Shell knows at the click, without awaiting (D-10a, RESEARCH Pitfall 3)', () => {
  it('cold boot: a press before the first read settles opens no chooser and says the store sentence; once the read settles the next press opens it', async () => {
    const pending = [];
    store.shellReads = vi.fn(() => {
      const handle = deferred();
      pending.push(handle);
      return handle.promise;
    });
    await mountAt('/');
    expect(pending).toHaveLength(1);

    await click(headerImport());
    expectRefused(PAGE_LOAD_ERROR);
    // The refused click started a fresh read.
    expect(pending).toHaveLength(2);

    await act(async () => {
      pending[1].resolve([]);
    });
    await flush();
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
  });

  it('only the newest read counts: an older read settling late cannot overwrite a newer one', async () => {
    const pending = [];
    store.shellReads = vi.fn(() => {
      const handle = deferred();
      pending.push(handle);
      return handle.promise;
    });
    await mountAt('/');
    await click(headerImport());
    expect(pending).toHaveLength(2);
    await act(async () => {
      pending[1].resolve([]);
    });
    await flush();
    await act(async () => {
      pending[0].resolve([createDraftRecord()]);
    });
    await flush();
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
  });

  it('a boot read that rejects: a press opens no chooser, says the store sentence and reads again; once that read settles with nothing kept the next press opens the chooser', async () => {
    let calls = 0;
    store.shellReads = vi.fn(() => {
      calls += 1;
      return calls === 1 ? Promise.reject(new Error('store')) : Promise.resolve([]);
    });
    await mountAt('/');
    expect(calls).toBe(1);

    await click(headerImport());
    expectRefused(PAGE_LOAD_ERROR);
    expect(calls).toBe(2);

    await flush();
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
  });
});

describe('an import already past the chooser checks again before it commits (T-10-12, T-10-32)', () => {
  it('a creation started while the file was read: importStore is not called, the revision stays 0, the notice says why', async () => {
    await mountAt('/');
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);

    const text = await chooseDeferredFile();
    // Start's write, after the chooser opened.
    store.drafts.set('v-kept', createDraftRecord());
    await settleImport(text, '{}');

    expect(importStore).not.toHaveBeenCalled();
    expect(revisionNow).toBe(0);
    expect(notices()).toHaveLength(1);
    expect(notice()).toBe(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('a re-check read that fails refuses with the store sentence and never calls importStore', async () => {
    await mountAt('/');
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);

    const text = await chooseDeferredFile();
    store.shellReads = () => Promise.reject(new Error('store'));
    await settleImport(text, '{}');

    expect(importStore).not.toHaveBeenCalled();
    expect(revisionNow).toBe(0);
    expect(notice()).toBe(PAGE_LOAD_ERROR);
  });

  it('with nothing kept the re-check lets the import through', async () => {
    await mountAt('/');
    await click(headerImport());
    const text = await chooseDeferredFile();
    await settleImport(text, '{}');
    expect(importStore).toHaveBeenCalledTimes(1);
    expect(revisionNow).toBe(1);
  });
});

async function type(element, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const field = (label) => current.container.querySelector(`[aria-label="${label}"]`);

// Every Shell read after the starting point waits for the case, so what the
// click finds can only have come from the route (D-10a).
function deferShellReads() {
  const pending = [];
  store.shellReads = vi.fn(() => {
    const handle = deferred();
    pending.push(handle);
    return handle.promise;
  });
  return pending;
}

describe('every route says it in its own notice (D-10a)', () => {
  beforeEach(() => {
    store.drafts.set('v-kept', createDraftRecord());
  });

  it('Home, which registers nothing: the Shell’s own notice, and exactly one .page-status', async () => {
    await mountAt('/');
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('/notebook: the refusal reads in the Notebook’s notice, the only .page-status', async () => {
    await mountAt('/notebook', () => current.container.querySelector('.nb__drafts') !== null);
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
    expect(current.container.querySelector('.shell__main').firstElementChild.className).toBe('page-status-anchor');
  });

  it('/notebook/new: the refusal reads in the editor’s notice, the only .page-status', async () => {
    await mountAt('/notebook/new', () => field('Recipe name') !== null);
    expect(field('Recipe name')).not.toBeNull();
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('the olive oil version route: the refusal reads in the route’s PageStatus, inside the anchor that precedes .notebook', async () => {
    await mountAt(VERSION_PATH, () => buttonByText('Next version') !== null);
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
    const status = notices()[0];
    const anchor = status.closest('.page-status-anchor');
    expect(anchor).not.toBeNull();
    expect(anchor.nextElementSibling.classList.contains('notebook')).toBe(true);
    expect(current.container.querySelector('.page-status')).toBe(status);
  });

  it('the version route with no draft kept: Import opens the chooser, and the open-pen refusal is unchanged', async () => {
    store.drafts.clear();
    await mountAt(VERSION_PATH, () => buttonByText('Next version') !== null);
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(notice()).toBe('');

    await click(buttonByText('Next version'));
    await flush(() => current.container.querySelector('form[aria-label="Next version"]') !== null);
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(importStore).not.toHaveBeenCalled();
    expect(notice()).toBe(IMPORT_BLOCKED_STATUS);
  });
});

describe('Start and Cancel reach the Shell in the render that carries them (orchestrator ruling 5)', () => {
  const OLDER = createDraftRecord('Older', { recipeId: 'r-old', versionId: 'v-old' }, '2026-10-19T08:00:00.000Z');
  const NEWER = createDraftRecord('Newer', { recipeId: 'r-new', versionId: 'v-new' }, '2026-10-20T08:00:00.000Z');

  async function cancelOnEditor() {
    await mountAt('/notebook/new', () => field('Recipe name') !== null);
    expect(field('Recipe name')).not.toBeNull();
    return deferShellReads();
  }

  it('post-Cancel tick, one creation: Cancel lands with createKept false and Import pressed at once opens the chooser', async () => {
    store.drafts.set(NEWER.versionId, structuredClone(NEWER));
    const pending = await cancelOnEditor();
    await click(buttonByText('Cancel'));
    await flush(() => store.drafts.size === 0);
    await flush();

    // The Shell's reads are still out.
    expect(pending.length).toBeGreaterThan(0);
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(notice()).not.toBe(CREATION_IMPORT_BLOCKED_STATUS);
    expect(notice()).not.toBe(PAGE_LOAD_ERROR);
  });

  it('post-Cancel tick, two creations: Cancel lands with createKept true and Import pressed at once opens no chooser', async () => {
    store.drafts.set(NEWER.versionId, structuredClone(NEWER));
    store.drafts.set(OLDER.versionId, structuredClone(OLDER));
    const pending = await cancelOnEditor();
    expect(field('Recipe name').value).toBe('Newer');
    await click(buttonByText('Cancel'));
    await flush(() => store.drafts.size === 1);
    await flush();

    expect([...store.drafts.keys()]).toEqual([OLDER.versionId]);
    expect(pending.length).toBeGreaterThan(0);
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('post-Cancel tick, Cancel’s own read failing: Import pressed at once opens no chooser and says the store sentence; once the next read settles with nothing kept the next press opens it', async () => {
    store.drafts.set(NEWER.versionId, structuredClone(NEWER));
    const pending = await cancelOnEditor();
    // Cancel's read is the first page read after the delete; the Notebook's own
    // load after the landing reads normally again.
    let pageCalls = 0;
    store.pageReads = () => {
      pageCalls += 1;
      return pageCalls === 1
        ? Promise.reject(new Error('store'))
        : Promise.resolve([...store.drafts.values()].map((record) => structuredClone(record)));
    };
    await click(buttonByText('Cancel'));
    await flush(() => store.drafts.size === 0 && pageCalls >= 1);
    await flush();

    expect(store.drafts.size).toBe(0);
    const before = pending.length;
    await click(headerImport());
    expectRefused(PAGE_LOAD_ERROR);
    // The refused click started a fresh read; it settles with nothing kept.
    expect(pending.length).toBeGreaterThan(before);
    await act(async () => {
      pending.at(-1).resolve([]);
    });
    await flush();
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
  });

  it('fast Start-and-leave: Start, the editor, Home at once, and Import there opens no chooser', async () => {
    await mountAt('/notebook', () => buttonByText('New recipe') !== null);
    // The starting point: the boot read settled, nothing is kept.
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    chooserClick.mockClear();
    const pending = deferShellReads();

    await click(buttonByText('New recipe'));
    await type(field('Name'), 'Vanilla');
    await click(buttonByText('Start'));
    await flush(() => field('Recipe name') !== null);
    expect(field('Recipe name').value).toBe('Vanilla');

    await click(current.container.querySelector('.shell__rail a[href="/"]'));
    await flush();
    expect(current.container.textContent).toContain('Home stand-in');
    // Every Shell read since Start is still out.
    expect(pending.length).toBeGreaterThan(0);

    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });
});

// Phase 11 plan 12 (STRUCT-04, D-04, D-23; T-11-35, T-11-36, T-11-57): an edit
// draft kept on a saved first version refuses Import on every route and names
// the recipe; the open edit route with nothing kept refuses with the open-form
// sentence and never the creation's; the order is open pen, kept creation, kept
// edit, the edit address, an unknown read; and the route words of a landing
// settle the Shell at the route's commit.
function editDraftRecord(name = 'Vanilla', ids = { recipeId: 'r-vanilla', versionId: 'v-vanilla' }) {
  return buildDraftRecord({
    versionId: ids.versionId,
    kind: 'edit',
    payload: blankCreateDraft({ recipeId: ids.recipeId, versionId: ids.versionId, name }),
    now: '2026-10-21T08:00:00.000Z',
  });
}

const EDIT_STATUS = 'Save or cancel your changes to Vanilla before importing.';

describe('Import is refused while an edit draft is kept, naming the recipe (D-04)', () => {
  beforeEach(() => {
    store.drafts.set('v-vanilla', editDraftRecord());
  });

  it('words the sentence from the recipe’s name', () => {
    expect(editImportBlockedStatus('Vanilla')).toBe(EDIT_STATUS);
    expect(editImportBlockedStatus('')).toBe('Save or cancel your changes to Untitled before importing.');
  });

  it('refuses the header and More’s Import on Home, with no chooser and no import', async () => {
    await mountAt('/');
    await click(headerImport());
    expectRefused(EDIT_STATUS);
    await click(moreImport());
    expectRefused(EDIT_STATUS);
  });

  it('refuses on /notebook, which has no draft row for it', async () => {
    await mountAt('/notebook', () => current.container.querySelector('.nb__count') !== null);
    expect(current.container.querySelector('li.nb__draft')).toBeNull();
    await click(headerImport());
    expectRefused(EDIT_STATUS);
  });

  it('refuses on a recipe page', async () => {
    await mountAt(VERSION_PATH, () => buttonByText('Next version') !== null);
    await click(headerImport());
    expectRefused(EDIT_STATUS);
  });

  it('refuses with the creation sentence when a creation is kept as well', async () => {
    store.drafts.set('v-kept', createDraftRecord());
    await mountAt('/');
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('refuses on the edit address with the edit sentence while the edit is kept', async () => {
    await mountAt('/notebook/r-vanilla/v-vanilla/edit', () => current.container.textContent.includes('Edit stand-in'));
    await click(headerImport());
    expectRefused(EDIT_STATUS);
  });

  it('renders a recipe name holding angle brackets as text in the notice', async () => {
    store.drafts.set('v-vanilla', editDraftRecord('<b>Vanilla</b>'));
    await mountAt('/');
    await click(headerImport());
    expectRefused('Save or cancel your changes to <b>Vanilla</b> before importing.');
    expect(notices()[0].querySelector('b')).toBeNull();
  });
});

describe('the open edit route with nothing kept yet (D-23)', () => {
  it('refuses with the open-form sentence, not the creation’s, and opens no chooser', async () => {
    await mountAt('/notebook/r-vanilla/v-vanilla/edit', () => current.container.textContent.includes('Edit stand-in'));
    await click(headerImport());
    expectRefused(IMPORT_BLOCKED_STATUS);
    expect(notice()).not.toBe(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('refuses before an unknown read is reported: the open form wins over the store sentence', async () => {
    store.shellReads = () => Promise.reject(new Error('store'));
    await mountAt('/notebook/r-vanilla/v-vanilla/edit', () => current.container.textContent.includes('Edit stand-in'));
    await click(headerImport());
    expectRefused(IMPORT_BLOCKED_STATUS);
  });

  it('opens the chooser again on the page once the edit has ended', async () => {
    await mountAt(VERSION_PATH, () => buttonByText('Next version') !== null);
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
  });
});

describe('the route words of a landing settle the Shell at the route’s commit (T-11-57)', () => {
  async function landAfterKeeping(record, state) {
    store.drafts.set(record.versionId, structuredClone(record));
    await mountAt('/leave', () => buttonByText('Land') !== null);
    // The Shell has read the kept draft; Save deletes it in its own transaction.
    store.drafts.delete(record.versionId);
    const pending = deferShellReads();
    leaveWith = { to: '/', state };
    await click(buttonByText('Land'));
    await flush(() => current.container.textContent.includes('Home stand-in'));
    expect(pending.length).toBeGreaterThan(0);
    return pending;
  }

  it('without a word, a stale sight of a kept creation refuses', async () => {
    await landAfterKeeping(createDraftRecord(), { focusVersion: true });
    await click(headerImport());
    expectRefused(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('saved created: no kept creation, so Import pressed in the first tick opens the chooser', async () => {
    await landAfterKeeping(createDraftRecord(), { focusVersion: true, saved: 'created' });
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(notice()).not.toBe(CREATION_IMPORT_BLOCKED_STATUS);
  });

  it('without a word, a stale sight of a kept edit refuses', async () => {
    await landAfterKeeping(editDraftRecord(), { focusVersion: true });
    await click(headerImport());
    expectRefused(EDIT_STATUS);
  });

  it('saved edited: no kept edit, so Import pressed in the first tick opens the chooser', async () => {
    await landAfterKeeping(editDraftRecord(), { focusVersion: true, saved: 'edited' });
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);
    expect(notice()).not.toBe(EDIT_STATUS);
  });
});

describe('an import already past the chooser checks again for a kept edit (T-11-57)', () => {
  it('a kept edit that appeared after the Shell’s last read: importStore is not called and the edit sentence is said', async () => {
    await mountAt('/');
    await click(headerImport());
    expect(chooserClick).toHaveBeenCalledTimes(1);

    const text = await chooseDeferredFile();
    store.drafts.set('v-vanilla', editDraftRecord());
    await settleImport(text, '{}');

    expect(importStore).not.toHaveBeenCalled();
    expect(revisionNow).toBe(0);
    expect(notices()).toHaveLength(1);
    expect(notice()).toBe(EDIT_STATUS);
  });

  it('with no draft kept the re-check lets the import through', async () => {
    await mountAt('/');
    await click(headerImport());
    const text = await chooseDeferredFile();
    await settleImport(text, '{}');
    expect(importStore).toHaveBeenCalledTimes(1);
  });
});
