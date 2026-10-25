// @vitest-environment jsdom
//
// The creation flow end to end (Phase 10 plan 02, MAKE-04, MAKE-05, MAKE-11):
// the Notebook's New recipe, a name and Start open the creation editor at
// /notebook/new, the draft is kept as typed until Cancel, and Cancel discards
// it. The Notebook and the editor are mounted whole, under StrictMode, over an
// in-memory stand-in for the repository; every write that is not a drafts
// write is a spy the cases prove is never called.
import { StrictMode, act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';

const store = vi.hoisted(() => ({ drafts: new Map() }));

vi.mock('../store/repository.js', async () => {
  const { seedRecipeGroups } = await import('../data/seed-recipes.js');
  const { library } = await import('../data/library.js');
  const groups = seedRecipeGroups;
  return {
    repository: {
      getAll: vi.fn(async () => structuredClone(groups.flatMap((group) => group.versions))),
      getAllBatches: vi.fn(async () => structuredClone(groups.flatMap((group) => group.batches))),
      listRecipes: vi.fn(async () => structuredClone(groups.map((group) => group.recipe))),
      listLibrary: vi.fn(async () => Object.entries(library).map(([id, entry]) => ({ id, entry: structuredClone(entry) }))),
      listDrafts: vi.fn(async () => [...store.drafts.values()].map((record) => structuredClone(record))),
      getDraft: vi.fn(async (versionId) => {
        const found = store.drafts.get(versionId);
        return found ? structuredClone(found) : undefined;
      }),
      saveDraft: vi.fn(async (record) => {
        store.drafts.set(record.versionId, structuredClone(record));
      }),
      deleteDraft: vi.fn(async (versionId) => {
        store.drafts.delete(versionId);
      }),
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
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { NotebookPlace } from './NotebookPlace.jsx';
import { CreationRoute } from './CreationRoute.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';
import { blankCreateDraft, buildDraftRecord } from '../domain/draft.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const WRITE_SPIES = [
  'saveVersion',
  'createVersion',
  'putAll',
  'saveRecipe',
  'putAllRecipes',
  'saveBatch',
  'putAllBatches',
  'putAllLibrary',
  'importAll',
];

let current = null;
let location = null;
let navigateTo = null;
let originalMatchMedia = null;
// Every route state the page has been at, in order: the flags are read once and
// replaced with null, so the final state alone no longer shows them.
let stateTrail = [];

function Probe() {
  location = useLocation();
  stateTrail.push(location.state);
  navigateTo = useNavigate();
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
              </Route>
            </Routes>
          </MemoryRouter>
        </CatalogFixture>
      </StrictMode>,
    );
  });
  await flush();
  return container;
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
  stateTrail = [];
  vi.clearAllMocks();
});

const root = () => current.container;

function buttonByText(text) {
  return [...root().querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

function field(label) {
  return root().querySelector(`[aria-label="${label}"]`);
}

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

function createDraftRecord(name, ids = { recipeId: 'r-kept', versionId: 'v-kept' }) {
  return buildDraftRecord({
    versionId: ids.versionId,
    kind: 'create',
    payload: blankCreateDraft({ recipeId: ids.recipeId, versionId: ids.versionId, name }),
    now: '2026-10-20T08:00:00.000Z',
  });
}

async function startVanilla() {
  await mountAt('/notebook');
  await click(buttonByText('New recipe'));
  await type(field('Name'), 'Vanilla');
  await click(buttonByText('Start'));
  await flush(() => location.pathname === '/notebook/new' && field('Recipe name') !== null);
}

function expectNoRecordWrites() {
  for (const name of WRITE_SPIES) expect(repository[name]).not.toHaveBeenCalled();
}

describe('New recipe, a name and Start open the creation editor (MAKE-04)', () => {
  it('opens the entry with Name focused, and offers no New recipe while it is open', async () => {
    await mountAt('/notebook');
    expect(buttonByText('New recipe')).not.toBeNull();
    await click(buttonByText('New recipe'));
    const form = root().querySelector('form[aria-label="New recipe"]');
    expect(form).not.toBeNull();
    expect(document.activeElement).toBe(field('Name'));
    expect(buttonByText('New recipe')).toBeNull();
    expect([...form.querySelectorAll('button')].map((button) => button.textContent)).toEqual(['Cancel', 'Start']);
    expect(form.querySelector('button[type="submit"]').textContent).toBe('Start');
  });

  it('Cancel closes the entry and returns focus to New recipe', async () => {
    await mountAt('/notebook');
    await click(buttonByText('New recipe'));
    await type(field('Name'), 'Vanilla');
    await click(buttonByText('Cancel'));
    expect(root().querySelector('form[aria-label="New recipe"]')).toBeNull();
    expect(document.activeElement).toBe(buttonByText('New recipe'));
    await click(buttonByText('New recipe'));
    expect(field('Name').value).toBe('');
  });

  it('Start with a blank name does nothing', async () => {
    await mountAt('/notebook');
    await click(buttonByText('New recipe'));
    await type(field('Name'), '   ');
    await click(buttonByText('Start'));
    expect(repository.saveDraft).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/notebook');
  });

  it('Start writes one name-only create draft, then opens the editor with the name and Version 1', async () => {
    await startVanilla();

    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    const record = repository.saveDraft.mock.calls[0][0];
    expect(record.kind).toBe('create');
    expect(record.payload.name).toBe('Vanilla');
    expect(record.payload.versionLabel).toBe('Version 1');
    expect(record.payload.recipeId).not.toBe('');
    expect(record.payload.versionId).not.toBe('');
    expect(record.payload.recipeId).not.toBe(record.payload.versionId);
    expect(record.versionId).toBe(record.payload.versionId);

    expect(location.pathname).toBe('/notebook/new');
    expect(location.pathname).not.toContain(record.versionId);
    expect(stateTrail).toContainEqual({ started: true });
    expect(location.state).toBeNull();
    expect(field('Recipe name').value).toBe('Vanilla');
    expect(field('Version name').value).toBe('Version 1');
    expect(root().textContent).toContain('New recipe · draft');
    expect(buttonByText('Save')).toBeNull();
    expect(root().textContent).not.toContain('Sheet code');
    expect(buttonByText('Cancel')).not.toBeNull();
    expectNoRecordWrites();
  });

  it('Cancel deletes the draft and returns to the Notebook, which offers New recipe again', async () => {
    await startVanilla();
    const { versionId } = repository.saveDraft.mock.calls[0][0];

    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === '/notebook' && buttonByText('New recipe') !== null);

    expect(repository.deleteDraft).toHaveBeenCalledTimes(1);
    expect(repository.deleteDraft).toHaveBeenCalledWith(versionId);
    expect(store.drafts.size).toBe(0);
    expect(location.pathname).toBe('/notebook');
    expect(buttonByText('New recipe')).not.toBeNull();
    expectNoRecordWrites();
  });
});

describe('a creation is already kept (D-04b)', () => {
  it('Start writes nothing and draws the kept draft with Resume in place of the entry', async () => {
    await mountAt('/notebook');
    await click(buttonByText('New recipe'));
    // Another tab's Start, written after this tab's reads.
    store.drafts.set('v-kept', createDraftRecord('Lemon'));
    await type(field('Name'), 'Vanilla');
    await click(buttonByText('Start'));

    expect(repository.saveDraft).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/notebook');
    expect(root().querySelector('form[aria-label="New recipe"]')).toBeNull();
    expect(buttonByText('New recipe')).toBeNull();
    const row = root().querySelector('ul.nb__drafts > li.nb__draft');
    expect(row.textContent).toContain('Lemon');

    await click(buttonByText('Resume'));
    await flush(() => field('Recipe name') !== null);
    expect(location.pathname).toBe('/notebook/new');
    expect(field('Recipe name').value).toBe('Lemon');
    expectNoRecordWrites();
  });
});

describe('/notebook/new with nothing kept', () => {
  it('replaces itself with the Notebook, silently', async () => {
    await mountAt('/notebook/new');
    await flush(() => location.pathname === '/notebook');
    expect(location.pathname).toBe('/notebook');
    expect(root().querySelector('h1.place__title').textContent).toBe('Notebook');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    expectNoRecordWrites();
  });
});

async function advance(ms = 250) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
  await flush();
}

function deferred() {
  const handle = {};
  handle.promise = new Promise((resolve, reject) => {
    handle.resolve = resolve;
    handle.reject = reject;
  });
  return handle;
}

const heading = () => root().querySelector('.headnote h1');
const lastSaved = () => repository.saveDraft.mock.calls.at(-1)[0];

describe('the Sheet reads the creation (MAKE-05, D-08c)', () => {
  it('shows the recipe name as the Sheet heading and the one description as its prose', async () => {
    await startVanilla();
    expect(heading().textContent).toBe('Vanilla');
    await type(field('Recipe description'), 'Plain and cold.');
    expect(root().querySelector('.headnote__prose').textContent).toBe('Plain and cold.');
  });

  it('reads Untitled in the heading and the tab title while the name is blank', async () => {
    await startVanilla();
    expect(document.title).toBe('Vanilla · Sprinkles');
    await type(field('Recipe name'), '');
    expect(heading().textContent).toBe('Untitled');
    expect(document.title).toBe('Untitled · Sprinkles');
  });

  it('renders a name holding angle brackets as text, never markup', async () => {
    await mountAt('/notebook');
    await click(buttonByText('New recipe'));
    await type(field('Name'), '<b>Bold</b>');
    await click(buttonByText('Start'));
    await flush(() => field('Recipe name') !== null);
    expect(heading().textContent).toBe('<b>Bold</b>');
    expect(heading().querySelector('b')).toBeNull();
    expect(field('Recipe name').value).toBe('<b>Bold</b>');
  });

  it('keeps the name exactly as typed after Start, spaces included', async () => {
    await startVanilla();
    await type(field('Recipe name'), '  Vanilla  ');
    expect(field('Recipe name').value).toBe('  Vanilla  ');
    expect(heading().textContent).toBe('  Vanilla  ');
  });
});

describe('a creation stays kept until Cancel (D-04a, D-09, D-09a)', () => {
  it('writes the cleared name over the stored draft 250 ms after the change, and never deletes it', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    repository.saveDraft.mockClear();
    await type(field('Recipe name'), '');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    await advance();

    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    expect(lastSaved().payload.name).toBe('');
    expect(repository.deleteDraft).not.toHaveBeenCalled();
    expect(store.drafts.size).toBe(1);
  });

  it('keeps an emptied Version name in the draft with Required under the field', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await type(field('Version name'), '');
    expect(root().querySelector('.field-requirement').textContent).toBe('Required');
    await advance();
    expect(lastSaved().payload.versionLabel).toBe('');
  });

  it('writes the waiting edit when the maker leaves by a link or Back', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    repository.saveDraft.mockClear();
    await type(field('Recipe description'), 'Plain');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    await act(async () => {
      navigateTo('/notebook');
    });
    await flush();

    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    expect(lastSaved().payload.description).toBe('Plain');
    expect(store.drafts.get(lastSaved().versionId).payload.description).toBe('Plain');
  });

  it('registers no page-unload warning, asks nothing and offers no Undo', async () => {
    const added = vi.spyOn(window, 'addEventListener');
    const confirmSpy = vi.fn(() => true);
    vi.stubGlobal('confirm', confirmSpy);
    try {
      await startVanilla();
      await click(buttonByText('Cancel'));
      await flush(() => location.pathname === '/notebook');
      expect(added.mock.calls.map(([name]) => name)).not.toContain('beforeunload');
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(root().querySelector('[role="dialog"], dialog')).toBeNull();
      expect(root().textContent).not.toContain('Undo');
    } finally {
      added.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});

describe('Cancel waits for the delete (Pitfall 6, D-03)', () => {
  it('does not navigate before the delete resolves, then lands on the Notebook with { discarded: true }', async () => {
    await startVanilla();
    const gate = deferred();
    repository.deleteDraft.mockImplementationOnce(async (versionId) => {
      await gate.promise;
      store.drafts.delete(versionId);
    });
    await click(buttonByText('Cancel'));
    expect(location.pathname).toBe('/notebook/new');

    await act(async () => {
      gate.resolve();
    });
    await flush(() => location.pathname === '/notebook');
    expect(location.pathname).toBe('/notebook');
    expect(stateTrail).toContainEqual({ discarded: true, createKept: false });
    expect(store.drafts.size).toBe(0);
  });

  it('stays on /notebook/new with the draft still kept and no discarded state when the delete fails', async () => {
    await startVanilla();
    repository.deleteDraft.mockRejectedValueOnce(new Error('store gone'));
    await click(buttonByText('Cancel'));
    await flush();

    expect(location.pathname).toBe('/notebook/new');
    expect(stateTrail.some((state) => state?.discarded)).toBe(false);
    expect(store.drafts.size).toBe(1);
    expect(field('Recipe name').value).toBe('Vanilla');
  });

  it('failed Cancel, edit, debounce, leave, Resume: the edit is kept', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    repository.deleteDraft.mockRejectedValueOnce(new Error('store gone'));
    await click(buttonByText('Cancel'));
    await flush();
    expect(location.pathname).toBe('/notebook/new');

    await type(field('Recipe description'), ' Still kept.');
    await advance();
    expect(lastSaved().payload.description).toBe(' Still kept.');

    await act(async () => {
      navigateTo('/notebook');
    });
    await flush(() => buttonByText('Resume') !== null);
    expect(root().querySelector('li.nb__draft').textContent).toContain('Vanilla');
    await click(buttonByText('Resume'));
    await flush(() => field('Recipe description') !== null);
    expect(field('Recipe description').value).toBe(' Still kept.');
  });

  it('writes the ink waiting at Cancel at once when the delete fails', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    repository.saveDraft.mockClear();
    await type(field('Recipe name'), 'Lemon');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    repository.deleteDraft.mockRejectedValueOnce(new Error('store gone'));
    await click(buttonByText('Cancel'));
    await flush();

    expect(location.pathname).toBe('/notebook/new');
    expect([...store.drafts.values()][0].payload.name).toBe('Lemon');
  });
});

describe('what the editor opens over (T-10-09)', () => {
  it('opens a stored draft holding only recipeId, versionId and name, every other field blank', async () => {
    store.drafts.set(
      'v-min',
      buildDraftRecord({
        versionId: 'v-min',
        kind: 'create',
        payload: { recipeId: 'r-min', versionId: 'v-min', name: 'Minimal' },
        now: '2026-10-20T08:00:00.000Z',
      }),
    );
    await mountAt('/notebook/new');
    await flush(() => field('Recipe name') !== null);

    expect(location.pathname).toBe('/notebook/new');
    expect(field('Recipe name').value).toBe('Minimal');
    expect(field('Version name').value).toBe('Version 1');
    expect(field('Recipe description').value).toBe('');
    expect(heading().textContent).toBe('Minimal');
  });

  it('draws no field until the draft restore read has settled, then draws it', async () => {
    store.drafts.set('v-slow', createDraftRecord('Slow', { recipeId: 'r-slow', versionId: 'v-slow' }));
    const gate = deferred();
    repository.getDraft.mockImplementationOnce(async (versionId) => {
      await gate.promise;
      return structuredClone(store.drafts.get(versionId));
    });
    await mountAt('/notebook/new');
    await flush();
    expect(repository.getDraft).toHaveBeenCalledTimes(1);
    expect(field('Recipe name')).toBeNull();

    await act(async () => {
      gate.resolve();
    });
    await flush(() => field('Recipe name') !== null);
    expect(field('Recipe name').value).toBe('Slow');
  });
});

// Two create drafts: Vanilla older, Lemon newer.
function twoDrafts() {
  const make = (versionId, name, now) =>
    buildDraftRecord({
      versionId,
      kind: 'create',
      payload: blankCreateDraft({ recipeId: 'r-' + versionId, versionId, name }),
      now,
    });
  return {
    old: make('v-old', 'Vanilla', '2026-10-20T08:00:00.000Z'),
    newer: make('v-new', 'Lemon', '2026-10-20T09:00:00.000Z'),
  };
}

// Leave the page the way a maker does, then open the Notebook fresh.
async function closeAndOpen(path) {
  await act(async () => current.root.unmount());
  current.container.remove();
  current = null;
  return mountAt(path);
}

async function expectResumeKeepsDescription(description) {
  await closeAndOpen('/notebook');
  const row = root().querySelector('ul.nb__drafts > li.nb__draft');
  expect(row.textContent).toContain('Vanilla');
  expect([...row.querySelectorAll('button')].map((button) => button.textContent)).toEqual(['Resume']);
  await click(buttonByText('Resume'));
  await flush(() => field('Recipe description') !== null);
  expect(location.pathname).toBe('/notebook/new');
  expect(field('Recipe description').value).toBe(description);
}

describe('a creation survives a closed tab (MAKE-11, D-18)', () => {
  // jsdom proves the flush attempt: saveDraft is called at once. Whether
  // IndexedDB finishes during a real browser shutdown is best effort
  // (useKeptDraft.js, the pagehide effect).
  it('pagehide inside the debounce starts the waiting write at once', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    repository.saveDraft.mockClear();
    await type(field('Recipe description'), 'Plain and cold.');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    await act(async () => {
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    expect(lastSaved().payload.description).toBe('Plain and cold.');
    await flush();
    await expectResumeKeepsDescription('Plain and cold.');
    expect(repository.deleteDraft).not.toHaveBeenCalled();
    expectNoRecordWrites();
  });

  it('a tab turning hidden starts the waiting write at once', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    repository.saveDraft.mockClear();
    await type(field('Recipe description'), 'Plain and cold.');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    try {
      await act(async () => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(repository.saveDraft).toHaveBeenCalledTimes(1);
      expect(lastSaved().payload.description).toBe('Plain and cold.');
    } finally {
      delete document.visibilityState;
    }
    await flush();
    await expectResumeKeepsDescription('Plain and cold.');
    expectNoRecordWrites();
  });

  it('unmounting inside the debounce starts the waiting write at once', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    repository.saveDraft.mockClear();
    await type(field('Recipe description'), 'Plain and cold.');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    await act(async () => current.root.unmount());
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    expect(lastSaved().payload.description).toBe('Plain and cold.');
    current.container.remove();
    current = null;
    await mountAt('/notebook');
    await expectResumeKeepsDescription('Plain and cold.');
    expectNoRecordWrites();
  });

  it('leaving while the restore read is out writes and deletes nothing, and the stored draft is unchanged', async () => {
    store.drafts.set('v-kept', createDraftRecord('Vanilla'));
    const before = structuredClone(store.drafts.get('v-kept'));
    const gate = deferred();
    repository.getDraft.mockImplementationOnce(async (versionId) => {
      await gate.promise;
      return structuredClone(store.drafts.get(versionId));
    });
    await mountAt('/notebook/new');
    await flush();
    expect(field('Recipe name')).toBeNull();

    await act(async () => {
      navigateTo('/notebook');
    });
    await flush();
    expect(location.pathname).toBe('/notebook');
    await act(async () => {
      gate.resolve();
    });
    await flush();

    expect(repository.saveDraft).not.toHaveBeenCalled();
    expect(repository.deleteDraft).not.toHaveBeenCalled();
    expect(store.drafts.get('v-kept')).toEqual(before);
  });
});

describe('a kept creation shows on the Notebook at load (MAKE-11, D-04b)', () => {
  it('draws the kept draft with Resume and no New recipe, so no entry can be opened', async () => {
    store.drafts.set('v-kept', createDraftRecord('Lemon'));
    await mountAt('/notebook');
    const row = root().querySelector('ul.nb__drafts > li.nb__draft');
    expect(row.textContent).toContain('Lemon');
    expect(buttonByText('New recipe')).toBeNull();
    expect(root().querySelector('p.nb__count').textContent).toBe('8 recipes');
    await click(buttonByText('Resume'));
    await flush(() => field('Recipe name') !== null);
    expect(location.pathname).toBe('/notebook/new');
    expect(field('Recipe name').value).toBe('Lemon');
    expectNoRecordWrites();
  });

  // Defensive: the store can hold two create drafts when two Starts' writes
  // overlap (plan 10-04's accepted residual). The newest is on screen.
  it('with two create drafts stored the Notebook and /notebook/new take the newest; Cancel deletes only it', async () => {
    store.drafts.set('v-old', twoDrafts().old);
    store.drafts.set('v-new', twoDrafts().newer);
    await mountAt('/notebook');
    const rows = root().querySelectorAll('li.nb__draft');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Lemon');

    await click(buttonByText('Resume'));
    await flush(() => field('Recipe name') !== null);
    expect(field('Recipe name').value).toBe('Lemon');

    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === '/notebook' && root().querySelector('li.nb__draft') !== null);
    expect(repository.deleteDraft).toHaveBeenCalledTimes(1);
    expect(repository.deleteDraft).toHaveBeenCalledWith('v-new');
    expect([...store.drafts.keys()]).toEqual(['v-old']);
    const resurfaced = root().querySelectorAll('li.nb__draft');
    expect(resurfaced).toHaveLength(1);
    expect(resurfaced[0].textContent).toContain('Vanilla');
    expect(buttonByText('Resume')).not.toBeNull();
    expect(buttonByText('New recipe')).toBeNull();
  });
});

const statusTexts = () => [...root().querySelectorAll('.page-status')].map((node) => node.textContent);

describe('the page notices (D-10a, MAKE-11)', () => {
  it('Resume announces "Draft kept. Cancel discards it." once, in the one notice before the editor', async () => {
    store.drafts.set('v-kept', createDraftRecord('Vanilla'));
    await mountAt('/notebook');
    await click(buttonByText('Resume'));
    await flush(() => field('Recipe name') !== null);

    expect(location.pathname).toBe('/notebook/new');
    expect(repository.getDraft).toHaveBeenCalledTimes(1);
    expect(statusTexts()).toEqual(['Draft kept. Cancel discards it.']);
    const status = root().querySelector('.page-status');
    expect(status.getAttribute('role')).toBe('status');
    expect(status.getAttribute('aria-live')).toBe('polite');
    const anchor = status.parentElement;
    expect(anchor.className).toBe('page-status-anchor');
    expect(anchor.nextElementSibling.className).toBe('notebook mk-page');
  });

  it('a direct visit or reload at /notebook/new with a kept draft announces it too', async () => {
    store.drafts.set('v-kept', createDraftRecord('Vanilla'));
    await mountAt('/notebook/new');
    await flush(() => field('Recipe name') !== null);
    expect(statusTexts()).toEqual(['Draft kept. Cancel discards it.']);
  });

  it('right after Start the editor announces nothing, and the started flag is replaced with null', async () => {
    await startVanilla();
    expect(statusTexts()).toEqual(['']);
    expect(stateTrail).toContainEqual({ started: true });
    expect(location.state).toBeNull();
  });

  it('keeps the one notice in every branch of the Notebook', async () => {
    await mountAt('/notebook');
    expect(statusTexts()).toEqual(['']);
    const anchor = root().querySelector('.page-status-anchor');
    expect(anchor.nextElementSibling.className).toBe('list-page place nb');
  });

  it('Cancel lands on the Notebook, which announces "Draft discarded." once and offers New recipe', async () => {
    await startVanilla();
    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === '/notebook' && buttonByText('New recipe') !== null);

    expect(statusTexts()).toEqual(['Draft discarded.']);
    expect(root().querySelector('li.nb__draft')).toBeNull();
    expect(buttonByText('New recipe')).not.toBeNull();
    expect(stateTrail).toContainEqual({ discarded: true, createKept: false });
    // The flag is read once: the entry's state is replaced, so Back or a reload
    // never repeats the notice.
    expect(location.state).toBeNull();
    await closeAndOpen('/notebook');
    expect(statusTexts()).toEqual(['']);
  });

  it('clears "Draft discarded." after 5 s', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === '/notebook');
    expect(statusTexts()).toEqual(['Draft discarded.']);
    await advance(5000);
    expect(statusTexts()).toEqual(['']);
  });

  it('with two create drafts stored, Cancel lands with createKept true and the Notebook announces over the older row', async () => {
    store.drafts.set('v-old', twoDrafts().old);
    store.drafts.set('v-new', twoDrafts().newer);
    await mountAt('/notebook/new');
    await flush(() => field('Recipe name') !== null);
    expect(field('Recipe name').value).toBe('Lemon');
    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === '/notebook' && root().querySelector('li.nb__draft') !== null);

    expect(stateTrail).toContainEqual({ discarded: true, createKept: true });
    expect(statusTexts()).toEqual(['Draft discarded.']);
    expect(root().querySelector('li.nb__draft').textContent).toContain('Vanilla');
  });

  it('leaves createKept out when the drafts read after the delete fails, and still announces', async () => {
    await startVanilla();
    repository.listDrafts.mockRejectedValueOnce(new Error('store gone'));
    await click(buttonByText('Cancel'));
    await flush(() => location.pathname === '/notebook' && buttonByText('New recipe') !== null);

    expect(stateTrail).toContainEqual({ discarded: true });
    expect(stateTrail.some((state) => state && 'createKept' in state)).toBe(false);
    expect(statusTexts()).toEqual(['Draft discarded.']);
  });

  it('a delete that fails says so in the editor and never announces "Draft discarded."', async () => {
    await startVanilla();
    repository.deleteDraft.mockRejectedValueOnce(new Error('store gone'));
    await click(buttonByText('Cancel'));
    await flush();

    expect(location.pathname).toBe('/notebook/new');
    expect(statusTexts()).toEqual([PAGE_LOAD_ERROR]);
    expect(store.drafts.size).toBe(1);
  });

  it('carries no text from route state onto either notice', async () => {
    store.drafts.set('v-kept', createDraftRecord('Vanilla'));
    await mountAt('/notebook');
    await act(async () => {
      navigateTo('/notebook', { replace: true, state: { discarded: 'Attacker words', started: 'Attacker words' } });
    });
    await flush();
    expect(statusTexts()).toEqual(['']);
    await act(async () => {
      navigateTo('/notebook', { replace: true, state: { discarded: true, text: 'Attacker words' } });
    });
    await flush();
    expect(statusTexts()).toEqual(['Draft discarded.']);
    expect(root().textContent).not.toContain('Attacker words');
  });
});

describe('Before you start while creating (MAKE-08, decision 19, T-01)', () => {
  const noteField = (n) => field(`beforeYouStart note ${n}`);
  const noteTexts = () => [...root().querySelectorAll('.authored__notes textarea')].map((area) => area.value);
  const removeButtons = () => [...root().querySelectorAll('.authored__note-field button')];

  it('draws the heading and Add note alone on arrival, with no list', async () => {
    await startVanilla();
    const region = root().querySelector('section.before-region');
    expect(region.querySelector('h2.region-name').textContent).toBe('Before you start');
    expect(region.querySelector('.authored__notes')).toBeNull();
    const add = region.querySelector('p.mk-add-row > button.text-control.mk-add');
    expect(add.textContent).toBe('Add note');
    expect(add.getAttribute('tabindex')).toBe('0');
    expect(root().querySelector('.method-region')).toBeNull();
  });

  it('Add note puts focus in the new note; two notes keep their order; editing the second changes only the second', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await click(buttonByText('Add note'));
    expect(noteTexts()).toEqual(['']);
    expect(document.activeElement).toBe(noteField(1));

    await type(noteField(1), 'Chill the mix overnight before churning.');
    await click(buttonByText('Add note'));
    expect(noteTexts()).toEqual(['Chill the mix overnight before churning.', '']);
    expect(document.activeElement).toBe(noteField(2));

    repository.saveDraft.mockClear();
    await type(noteField(2), 'Keep the cream cold until it goes in.');
    expect(noteTexts()).toEqual(['Chill the mix overnight before churning.', 'Keep the cream cold until it goes in.']);
    await advance();
    expect(lastSaved().payload.beforeYouStart).toEqual([
      { text: 'Chill the mix overnight before churning.' },
      { text: 'Keep the cream cold until it goes in.' },
    ]);
    expectNoRecordWrites();
  });

  it('remove on note 1 deletes it outright, the second note becomes note 1, and focus goes to Add note', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await click(buttonByText('Add note'));
    await type(noteField(1), 'First.');
    await click(buttonByText('Add note'));
    await type(noteField(2), 'Second.');

    expect(removeButtons().map((button) => button.textContent)).toEqual(['remove', 'remove']);
    await click(removeButtons()[0]);
    expect(noteTexts()).toEqual(['Second.']);
    expect(noteField(2)).toBeNull();
    expect(document.activeElement).toBe(buttonByText('Add note'));

    await advance();
    expect(lastSaved().payload.beforeYouStart).toEqual([{ text: 'Second.' }]);

    await click(removeButtons()[0]);
    expect(root().querySelector('.authored__notes')).toBeNull();
    expect(document.activeElement).toBe(buttonByText('Add note'));
  });

  it('keeps an empty note in the draft', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await click(buttonByText('Add note'));
    await advance();
    expect(lastSaved().payload.beforeYouStart).toEqual([{ text: '' }]);
  });

  it('closing the tab inside the debounce, then Resume, brings the notes back', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await click(buttonByText('Add note'));
    await type(noteField(1), 'Chill the mix overnight before churning.');
    repository.saveDraft.mockClear();
    await click(buttonByText('Add note'));
    await type(noteField(2), 'Keep the cream cold until it goes in.');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    await act(async () => {
      window.dispatchEvent(new Event('pagehide'));
    });
    await flush();
    await closeAndOpen('/notebook');
    await click(buttonByText('Resume'));
    await flush(() => noteField(2) !== null);
    expect(noteTexts()).toEqual(['Chill the mix overnight before churning.', 'Keep the cream cold until it goes in.']);
  });

  it('shows a note holding angle brackets as text in its field, never as markup', async () => {
    await startVanilla();
    await click(buttonByText('Add note'));
    await type(noteField(1), '<b>Bold</b>');
    expect(noteField(1).value).toBe('<b>Bold</b>');
    expect(root().querySelector('.authored__notes b')).toBeNull();
    expect(root().querySelector('.before-region b')).toBeNull();
  });
});

describe('Add ingredient, pick, type grams (MAKE-06, D-07, D-08)', () => {
  const MILK = 'Whole milk, 3.5% fat';
  const CREAM = 'Heavy cream, 36% fat';
  const addButton = () => root().querySelector('.ingredient-table-region .mk-add');
  const pickerCancel = () => root().querySelector('.ingredient-table-region .pick__head button');
  const gramsField = (name) => field(`${name}, grams`);
  const tableNames = () =>
    [...root().querySelectorAll('.ingredient-table tbody td.ingredient-table__col-name')].map((cell) => cell.firstChild.textContent);
  const milkSolids = () => {
    const rule = [...root().querySelectorAll('.graduated-rule')].find(
      (node) => node.querySelector('.graduated-rule__label-word').textContent === 'Milk solids',
    );
    return rule ? rule.querySelector('.graduated-rule__value').textContent : null;
  };

  async function pick(name) {
    await click(addButton());
    const row = [...root().querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === name);
    await click(row);
  }

  it('Add ingredient opens the picker in its place, and a pick appends one row, closes the picker and focuses its empty grams field', async () => {
    await startVanilla();
    expect(addButton().textContent).toBe('Add ingredient');
    await click(addButton());
    const picker = root().querySelector('div.pick');
    expect(picker.getAttribute('role')).toBe('group');
    expect(picker.getAttribute('aria-label')).toBe('Add ingredient');
    expect(addButton()).toBeNull();
    const names = [...picker.querySelectorAll('.pick__name')].map((node) => node.textContent);
    expect(names).toContain('Sucrose');
    expect(names).toEqual([...names].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1)));

    await click([...picker.querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === 'Sucrose'));
    expect(root().querySelector('div.pick')).toBeNull();
    expect(tableNames()).toEqual(['Sucrose']);
    expect(gramsField('Sucrose').value).toBe('');
    expect(document.activeElement).toBe(gramsField('Sucrose'));
    expect(gramsField('Sucrose').classList.contains('mk-focus')).toBe(true);
    expect(addButton().textContent).toBe('Add ingredient');
  });

  it('typing grams draws the side-region with figures, and more rows move the Milk solids figure', async () => {
    await startVanilla();
    await pick('Sucrose');
    expect(root().querySelector('.side-region')).toBeNull();
    await type(gramsField('Sucrose'), '150');
    expect(root().querySelector('.side-region')).not.toBeNull();

    await pick(MILK);
    await type(gramsField(MILK), '600');
    const withMilk = milkSolids();
    expect(withMilk).not.toBeNull();
    await pick(CREAM);
    await type(gramsField(CREAM), '250');
    expect(tableNames()).toEqual(['Sucrose', MILK, CREAM]);
    expect(milkSolids()).not.toBeNull();
    expect(milkSolids()).not.toBe(withMilk);
    expect(root().querySelectorAll('.ingredient-table tbody').length).toBe(1);
    expect(root().querySelector('.ingredient-table__step-head')).toBeNull();
    expect(root().querySelector('.struck-value')).toBeNull();
    expect(root().querySelector('.method-region')).toBeNull();
    expect(root().querySelector('.ingredient-table').classList.contains('is-developing')).toBe(true);
  });

  it('keeps only the link and the typed grams on each saved row', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await pick('Sucrose');
    await type(gramsField('Sucrose'), '150');
    await advance();
    const rows = lastSaved().payload.rows;
    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0]).sort()).toEqual(['id', 'libraryId', 'portions']);
    expect(rows[0].libraryId).toBe('sucrose');
    expect(rows[0].portions).toEqual([{ step: 1, grams: '150' }]);
    expectNoRecordWrites();
  });

  it('Cancel on the picker closes it and puts focus on Add ingredient', async () => {
    await startVanilla();
    await click(addButton());
    await click(pickerCancel());
    expect(root().querySelector('div.pick')).toBeNull();
    expect(document.activeElement).toBe(addButton());
    expect(tableNames()).toEqual([]);
  });

  it('an entry already on the recipe reads Added in the picker, and pressing it adds nothing', async () => {
    await startVanilla();
    await pick('Sucrose');
    await click(addButton());
    const added = [...root().querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === 'Sucrose');
    expect(added.querySelector('.pick__act').textContent).toBe('Added');
    expect(added.getAttribute('aria-disabled')).toBe('true');
    await click(added);
    expect(tableNames()).toEqual(['Sucrose']);
    expect(root().querySelector('div.pick')).not.toBeNull();
    const other = [...root().querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === MILK);
    expect(other.querySelector('.pick__act').textContent).toBe('Add');
  });

  it('a 309-digit amount leaves the row on the table at 0 g and throws nothing', async () => {
    await startVanilla();
    await pick(MILK);
    await type(gramsField(MILK), '600');
    await pick('Sucrose');
    const before = root().querySelector('.side-region').textContent;
    await type(gramsField('Sucrose'), `1${'0'.repeat(309)}`);
    expect(tableNames()).toEqual([MILK, 'Sucrose']);
    expect(root().querySelector('.side-region').textContent).toBe(before);
    expect(root().querySelector('tr[aria-label^="Sucrose"]').getAttribute('aria-label')).toBe('Sucrose, 0 g');
    await type(gramsField('Sucrose'), '150');
    expect(root().querySelector('tr[aria-label^="Sucrose"]').getAttribute('aria-label')).toBe('Sucrose, 150 g');
  });

  it('opens a stored row with an empty portions array on the table with an empty grams field', async () => {
    const record = createDraftRecord('Vanilla');
    record.payload.rows = [{ id: 'row-x', libraryId: 'sucrose', portions: [] }];
    store.drafts.set(record.versionId, record);
    await mountAt('/notebook/new');
    await flush(() => field('Recipe name') !== null);
    expect(gramsField('Sucrose').value).toBe('');
  });

  it('with the library unreadable it shows PAGE_LOAD_ERROR with the band and a Cancel that discards', async () => {
    const original = repository.listLibrary.getMockImplementation();
    repository.listLibrary.mockRejectedValue(new Error('store gone'));
    try {
      await startVanilla();
      expect(field('Recipe name').value).toBe('Vanilla');
      expect(root().querySelector('.not-found p').textContent).toBe(PAGE_LOAD_ERROR);
      expect(root().querySelector('.ingredient-table-region')).toBeNull();
      expect(root().querySelector('aside.notebook-log')).toBeNull();
      await click(buttonByText('Cancel'));
      await flush(() => location.pathname === '/notebook');
      expect(repository.deleteDraft).toHaveBeenCalled();
      expect(location.pathname).toBe('/notebook');
    } finally {
      repository.listLibrary.mockImplementation(original);
    }
  });

  it('with the library unreadable and the delete failing once, the kept draft is live again and a second Cancel lands on /notebook', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const original = repository.listLibrary.getMockImplementation();
    repository.listLibrary.mockRejectedValue(new Error('store gone'));
    try {
      await startVanilla();
      repository.deleteDraft.mockRejectedValueOnce(new Error('store gone'));
      await click(buttonByText('Cancel'));
      await flush();
      expect(location.pathname).toBe('/notebook/new');
      expect(field('Recipe name')).not.toBeNull();

      await type(field('Recipe name'), 'Vanilla Two');
      await advance();
      expect(lastSaved().payload.name).toBe('Vanilla Two');

      await click(buttonByText('Cancel'));
      await flush(() => location.pathname === '/notebook');
      expect(location.pathname).toBe('/notebook');
    } finally {
      repository.listLibrary.mockImplementation(original);
    }
  });
});

describe('remove deletes a creation row outright (MAKE-06, decision 5, T-01)', () => {
  const MILK = 'Whole milk, 3.5% fat';
  const CREAM = 'Heavy cream, 36% fat';
  const addButton = () => root().querySelector('.ingredient-table-region .mk-add');
  const pickerCancel = () => root().querySelector('.ingredient-table-region .pick__head button');
  const gramsField = (name) => field(`${name}, grams`);
  const tableNames = () =>
    [...root().querySelectorAll('.ingredient-table tbody td.ingredient-table__col-name')].map((cell) => cell.firstChild.textContent);
  const removeOf = (name) => root().querySelector(`tr[aria-label^="${name},"] button.text-control`);
  const noStruckOrStepHeads = () => {
    expect(root().querySelectorAll('.ingredient-table tbody').length).toBeLessThanOrEqual(1);
    expect(root().querySelector('.ingredient-table__step-head')).toBeNull();
    expect(root().querySelector('.struck-value')).toBeNull();
  };

  async function pickAt(name, grams) {
    await click(addButton());
    const row = [...root().querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === name);
    await click(row);
    await type(gramsField(name), grams);
  }

  it('removes Heavy cream from the table and the saved draft, the figures follow, and focus is on Add ingredient', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await pickAt(MILK, '600');
    await pickAt(CREAM, '250');
    const withCream = root().querySelector('.side-region').textContent;
    noStruckOrStepHeads();

    expect(removeOf(CREAM).textContent).toBe('remove');
    await click(removeOf(CREAM));
    expect(tableNames()).toEqual([MILK]);
    expect(root().querySelector('.side-region').textContent).not.toBe(withCream);
    expect(document.activeElement).toBe(addButton());
    noStruckOrStepHeads();

    await advance();
    const rows = lastSaved().payload.rows;
    expect(rows).toHaveLength(1);
    expect(rows[0].libraryId).toBe('wholeMilk');
    for (const row of rows) {
      expect(Object.keys(row).sort()).toEqual(['id', 'libraryId', 'portions']);
      for (const portion of row.portions) expect(Object.keys(portion).sort()).toEqual(['grams', 'step']);
    }
    expectNoRecordWrites();
  });

  it('with the picker open, remove deletes the row, leaves the picker open and focuses its Cancel', async () => {
    await startVanilla();
    await pickAt(MILK, '600');
    await click(addButton());
    expect(root().querySelector('div.pick')).not.toBeNull();
    await click(removeOf(MILK));
    expect(tableNames()).toEqual([]);
    expect(root().querySelector('div.pick')).not.toBeNull();
    expect(document.activeElement).toBe(pickerCancel());
  });

  it('removing the last row with grams hides the side-region again', async () => {
    await startVanilla();
    await pickAt(MILK, '600');
    expect(root().querySelector('.side-region')).not.toBeNull();
    await click(removeOf(MILK));
    expect(root().querySelector('.side-region')).toBeNull();
    expect(root().querySelector('.ingredient-table-region p').textContent).toBe('This version has no ingredient rows.');
  });

  it('removes the row whose field has focus, and its control goes with it', async () => {
    await startVanilla();
    await click(addButton());
    await click([...root().querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === 'Sucrose'));
    expect(document.activeElement).toBe(gramsField('Sucrose'));
    await click(removeOf('Sucrose'));
    expect(tableNames()).toEqual([]);
    expect(removeOf('Sucrose')).toBeNull();
    expect(document.activeElement).toBe(addButton());
  });
});

describe('the Style region fills the bands and the temperature (MAKE-09, decisions 6, 9, 14, 17)', () => {
  const MILK = 'Whole milk, 3.5% fat';
  const addButton = () => root().querySelector('.ingredient-table-region .mk-add');
  const gramsField = (name) => field(`${name}, grams`);
  const menu = () => root().querySelector('select.mk-menu');
  const clearButton = () => root().querySelector('.mk-region .batch-row__head-acts button');
  const temperature = () => field('Serving temperature, degrees Celsius');
  const BANDS = ['Freezing · PAC', 'Sweetness · POD', 'Fat', 'Milk solids · MSNF', 'Sugar', 'Solids'];
  const ends = (label) => [field(`${label}, target low`).value, field(`${label}, target high`).value];
  const rule = (word) => root().querySelector(`.graduated-rule[aria-label^="${word},"]`);

  async function pickAt(name, grams) {
    await click(addButton());
    const row = [...root().querySelectorAll('.pick__row')].find((node) => node.querySelector('.pick__name').textContent === name);
    await click(row);
    await type(gramsField(name), grams);
  }

  async function chooseStyle(value) {
    await act(async () => {
      menu().value = value;
      menu().dispatchEvent(new Event('change', { bubbles: true }));
    });
    await flush();
  }

  it('opens with No style, an empty temperature, twelve blank band fields and no Clear', async () => {
    await startVanilla();
    expect(root().querySelectorAll('aside.notebook-log .mk-region')).toHaveLength(3);
    expect([...root().querySelectorAll('aside.notebook-log .mk-region')].map((node) => node.getAttribute('aria-label'))).toEqual(['Style', 'Scales', 'Problems']);
    expect(menu().value).toBe('');
    expect(menu().options[menu().selectedIndex].textContent).toBe('No style');
    expect(temperature().value).toBe('');
    for (const label of BANDS) expect(ends(label)).toEqual(['', '']);
    expect(clearButton()).toBeNull();
  });

  it('choosing Philadelphia fills the bands and -14, shows Clear, and the Balance reads a target on Sweetness only', async () => {
    await startVanilla();
    await pickAt(MILK, '600');
    await pickAt('Sucrose', '150');
    expect(rule('Sweetness · POD').getAttribute('aria-label')).toContain('no target set');
    await chooseStyle('philadelphia');
    expect(menu().value).toBe('philadelphia');
    expect(temperature().value).toBe('-14');
    expect(ends('Sweetness · POD')).toEqual(['14', '18']);
    expect(ends('Fat')).toEqual(['10', '18']);
    expect(ends('Milk solids · MSNF')).toEqual(['8', '12']);
    expect(ends('Solids')).toEqual(['36', '42']);
    expect(ends('Freezing · PAC')).toEqual(['', '']);
    expect(ends('Sugar')).toEqual(['', '']);
    expect(clearButton().textContent).toBe('Clear');
    expect(rule('Sweetness · POD').getAttribute('aria-label')).toContain('target 14–18');
    expect(rule('Freezing · PAC').getAttribute('aria-label')).toContain('no target set');
  });

  it('editing Fat keeps Philadelphia and -14; Clear keeps the bands and empties the temperature; Gelato then fills -12.5', async () => {
    await startVanilla();
    await chooseStyle('philadelphia');
    await type(field('Fat, target high'), '16');
    expect(menu().value).toBe('philadelphia');
    expect(temperature().value).toBe('-14');
    expect(ends('Fat')).toEqual(['10', '16']);
    await click(clearButton());
    expect(menu().value).toBe('');
    expect(temperature().value).toBe('');
    expect(ends('Fat')).toEqual(['10', '16']);
    expect(ends('Sweetness · POD')).toEqual(['14', '18']);
    expect(clearButton()).toBeNull();
    await chooseStyle('gelato');
    expect(temperature().value).toBe('-12.5');
    expect(ends('Fat')).toEqual(['4', '9']);
  });

  it('choosing No style leaves the bands and empties the temperature', async () => {
    await startVanilla();
    await chooseStyle('french');
    await chooseStyle('');
    expect(menu().value).toBe('');
    expect(temperature().value).toBe('');
    expect(ends('Fat')).toEqual(['10', '14']);
  });

  it('a band that does not read shows no error, and its figure reads no target set', async () => {
    await startVanilla();
    await pickAt(MILK, '600');
    await pickAt('Sucrose', '150');
    await type(field('Sweetness · POD, target low'), '20');
    await type(field('Sweetness · POD, target high'), '10');
    expect(rule('Sweetness · POD').getAttribute('aria-label')).toContain('no target set');
    expect(root().querySelector('aside.notebook-log [aria-invalid]')).toBeNull();
    expect(root().querySelector('aside.notebook-log .field-error')).toBeNull();
  });

  it('keeps the style, the bands and the temperature in the saved draft, and Resume brings them back', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await chooseStyle('gelato');
    await type(field('Sugar, target low'), '1.5');
    await advance();
    const saved = lastSaved().payload;
    expect(saved.style).toBe('gelato');
    expect(saved.serveTempC).toBe('-12.5');
    expect(saved.targets.fat).toEqual(['4', '9']);
    expect(saved.targets.sugar).toEqual(['1.5', '']);
    expectNoRecordWrites();

    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
    await mountAt('/notebook/new');
    await flush(() => field('Recipe name') !== null);
    expect(menu().value).toBe('gelato');
    expect(temperature().value).toBe('-12.5');
    expect(ends('Fat')).toEqual(['4', '9']);
    expect(ends('Sugar')).toEqual(['1.5', '']);
  });

  it('offers no field for equipment or process', async () => {
    await startVanilla();
    const text = root().querySelector('aside.notebook-log').textContent;
    expect(text).not.toMatch(/machine|equipment|pasteur|hold/i);
    expect(root().querySelectorAll('aside.notebook-log .mk-region')).toHaveLength(3);
  });

  it('two band edits in one React batch both land', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await chooseStyle('philadelphia');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    await act(async () => {
      const fatHigh = field('Fat, target high');
      setter.call(fatHigh, '16');
      fatHigh.dispatchEvent(new Event('input', { bubbles: true }));
      const msnfLow = field('Milk solids · MSNF, target low');
      setter.call(msnfLow, '9');
      msnfLow.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(field('Fat, target high').value).toBe('16');
    expect(field('Milk solids · MSNF, target low').value).toBe('9');
    await advance();
    const { targets } = lastSaved().payload;
    expect(targets.fat).toEqual(['10', '16']);
    expect(targets.msnf).toEqual(['9', '12']);
  });

  it('Clear and a temperature edit in one React batch both land', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await chooseStyle('philadelphia');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    await act(async () => {
      clearButton().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      setter.call(temperature(), '-16');
      temperature().dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(menu().value).toBe('');
    expect(temperature().value).toBe('-16');
    await advance();
    expect(lastSaved().payload.style).toBeNull();
    expect(lastSaved().payload.serveTempC).toBe('-16');
  });
});

describe('the recipe\'s own scales (TASTE-01, decision 12, T-04)', () => {
  const scalesRegion = () => root().querySelector('section[aria-label="Scales"]');
  const inScales = (label) => scalesRegion().querySelector(`[aria-label="${label}"]`);
  const addScaleButton = () => scalesRegion().querySelector('.mk-add');
  const kindRadio = (word) =>
    [...scalesRegion().querySelectorAll('.segmented__option')].find((option) => option.textContent === word).querySelector('input');
  const cueTexts = () => [...scalesRegion().querySelectorAll('.mk-cue')].map((node) => node.textContent);

  it('opens with Every recipe over the four core scales and only Add scale', async () => {
    await startVanilla();
    expect(cueTexts()).toEqual(['Every recipe']);
    expect(scalesRegion().querySelector('.mk-core').textContent).toBe('Hardness, Scoopability, Smoothness, Sweetness');
    expect(scalesRegion().querySelector('.mk-card')).toBeNull();
    expect(addScaleButton().textContent).toBe('Add scale');
  });

  it('Add scale draws This recipe only and Scale 1 with focus in its Name; typed words and a kind show the stops line', async () => {
    await startVanilla();
    await click(addScaleButton());
    expect(cueTexts()).toEqual(['Every recipe', 'This recipe only']);
    expect(scalesRegion().querySelector('.mk-card__head')).toBeNull();
    expect(scalesRegion().querySelector('.mk-card').getAttribute('aria-label')).toBe('Scale 1');
    expect(scalesRegion().querySelector('.mk-card').firstElementChild.className).toBe('mk-caprow');
    expect([...scalesRegion().querySelectorAll('.mk-cue')].map((node) => node.tagName)).toEqual(['H3', 'H3']);
    expect(document.activeElement).toBe(inScales('Name'));
    expect(scalesRegion().querySelector('.mk-stops')).toBeNull();
    await type(inScales('Name'), 'Creaminess');
    await type(inScales('Low end'), 'thin');
    await type(inScales('High end'), 'rich');
    expect(scalesRegion().querySelector('.mk-stops')).toBeNull();
    await click(kindRadio('Right in the middle'));
    expect(scalesRegion().querySelector('.mk-stops').textContent).toBe('thin · leaning thin · right · leaning rich · rich');
    expect(kindRadio('Right in the middle').checked).toBe(true);
  });

  it('keeps the scale in the saved draft, and closing the tab and Resume bring it back with the same key', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await startVanilla();
    await click(addScaleButton());
    await type(inScales('Name'), 'Creaminess');
    await type(inScales('Low end'), 'thin');
    await type(inScales('High end'), 'rich');
    await click(kindRadio('Right in the middle'));
    await advance();
    const [saved] = lastSaved().payload.scales;
    expect(saved).toEqual({ key: saved.key, name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'declared' });
    expect(saved.key.startsWith('scale-')).toBe(true);
    expectNoRecordWrites();

    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
    await mountAt('/notebook');
    await click(buttonByText('Resume'));
    await flush(() => field('Recipe name') !== null);
    expect(inScales('Name').value).toBe('Creaminess');
    expect(inScales('Low end').value).toBe('thin');
    expect(kindRadio('Right in the middle').checked).toBe(true);
    await advance();
    await click(addScaleButton());
    await advance();
    expect(lastSaved().payload.scales[0].key).toBe(saved.key);
  });
});
