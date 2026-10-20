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
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useOutletContext } from 'react-router';

const store = vi.hoisted(() => ({
  drafts: new Map(),
  // When set, the Shell's own drafts reads go through this instead of the map.
  shellReads: null,
}));

vi.mock('../store/repository.js', async () => {
  return {
    repository: {
      listDrafts: vi.fn(() => {
        const fromShell = new Error('read').stack.includes('/ui/Shell.jsx');
        if (fromShell && store.shellReads) return store.shellReads();
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
import { Shell, CREATION_IMPORT_BLOCKED_STATUS } from './Shell.jsx';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { blankCreateDraft, buildDraftRecord } from '../domain/draft.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let current = null;
let revisionNow = null;
let originalMatchMedia = null;
let chooserClick = null;

function Home() {
  revisionNow = useOutletContext();
  return <p>Home stand-in</p>;
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

async function mountAt(path = '/') {
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
              <Route path="/" element={<Home />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CatalogFixture>,
    );
  });
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
  store.shellReads = null;
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

function createDraftRecord(name = 'Lemon', ids = { recipeId: 'r-kept', versionId: 'v-kept' }) {
  return buildDraftRecord({
    versionId: ids.versionId,
    kind: 'create',
    payload: blankCreateDraft({ recipeId: ids.recipeId, versionId: ids.versionId, name }),
    now: '2026-10-20T08:00:00.000Z',
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
