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

function Probe() {
  location = useLocation();
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
    expect(location.state).toEqual({ started: true });
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
    expect(location.state).toEqual({ discarded: true });
    expect(store.drafts.size).toBe(0);
  });

  it('stays on /notebook/new with the draft still kept and no discarded state when the delete fails', async () => {
    await startVanilla();
    repository.deleteDraft.mockRejectedValueOnce(new Error('store gone'));
    await click(buttonByText('Cancel'));
    await flush();

    expect(location.pathname).toBe('/notebook/new');
    expect(location.state).toEqual({ started: true });
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
    await flush(() => buttonByText('Resume') !== null || location.pathname === '/notebook');
    await act(async () => {
      navigateTo('/notebook/new');
    });
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
