// @vitest-environment jsdom
//
// D-03a: the Shell reloads the catalog before it moves storeRevision; a failed
// reload after a committed import holds the routed page back (catalogStale); the
// last case runs the real CatalogProvider over a real fake-indexeddb repository.
//
// repository.js creates its connection when its module loads, so the fake must
// exist before any module that imports the repository: this import stays first
// (an import order a formatter could undo is a requirement, not an aside).
import 'fake-indexeddb/auto';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useNavigate, useOutletContext } from 'react-router';

// importStore accepts; a case may set `hooks.beforeResolve` to write to the store
// first, the way a real import's transaction would have.
const hooks = vi.hoisted(() => ({ beforeResolve: async () => {} }));
vi.mock('../store/transfer.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    importStore: vi.fn(async () => {
      await hooks.beforeResolve();
      return { ok: true };
    }),
  };
});

import { importStore, IMPORT_STORAGE_ERROR } from '../store/transfer.js';
import { repository } from '../store/repository.js';
import { seedIfEmpty } from '../store/seed.js';
import { loadCatalog } from '../store/catalog.js';
import { DB_NAME } from '../store/db.js';
import { Shell, IMPORT_RELOAD_LINE } from './Shell.jsx';
import { CatalogProvider, useCatalog } from './CatalogContext.jsx';
import { CatalogFixture } from './catalog.fixtures.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let current = null;

beforeEach(() => {
  hooks.beforeResolve = async () => {};
  importStore.mockClear();
});

afterEach(async () => {
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
});

async function mount(ui) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(ui);
  });
  return container;
}

async function chooseFile(content = '{}') {
  const input = current.container.querySelector('input.shell__file-input');
  Object.defineProperty(input, 'files', { value: [{ text: async () => content }], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

// A routed child that logs every revision it renders with and every mount.
function makeChild(log, name) {
  return function Child() {
    const revision = useOutletContext();
    log.push(`${name}:revision:${revision}`);
    // A mount is logged from an effect so a render React throws away does not count.
    useEffect(() => {
      log.push(`${name}:mount`);
    }, []);
    return <p>{name} page</p>;
  };
}

describe('the Shell reloads the catalog before the routed page sees the new store revision (D-03a)', () => {
  it('awaits reloadCatalog before storeRevision moves', async () => {
    const log = [];
    const reloadCatalog = vi.fn(async () => {
      log.push('reload:start');
      await new Promise((resolve) => setTimeout(resolve, 5));
      log.push('reload:done');
    });
    const Home = makeChild(log, 'home');
    await mount(
      <CatalogFixture reloadCatalog={reloadCatalog}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Home />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CatalogFixture>,
    );
    await chooseFile();
    expect(importStore).toHaveBeenCalledTimes(1);
    expect(reloadCatalog).toHaveBeenCalledTimes(1);
    expect(log).toContain('home:revision:1');
    expect(log.indexOf('reload:done')).toBeLessThan(log.indexOf('home:revision:1'));
    expect(log).not.toContain('home:revision:2');
  });

  it('does not reload when the import is refused', async () => {
    const reloadCatalog = vi.fn(async () => {});
    importStore.mockResolvedValueOnce({ ok: false, errors: ['$: nope'] });
    await mount(
      <CatalogFixture reloadCatalog={reloadCatalog}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<p>Home page</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CatalogFixture>,
    );
    await chooseFile();
    expect(reloadCatalog).not.toHaveBeenCalled();
    expect(current.container.querySelector('.shell__import-errors-title').textContent).toBe('This file can’t be imported');
  });
});

describe('a catalog reload that fails after a committed import (T-09-37)', () => {
  const VERSION_PATH = '/notebook/some-recipe/some-version';

  it('withholds every routed page, shows the recovery page and not the Import panel, and keeps doing so through navigation', async () => {
    const log = [];
    const reloadCatalog = vi.fn(async () => {
      throw new Error('could not read the tables');
    });
    const Home = makeChild(log, 'home');
    const Notebook = makeChild(log, 'notebook');
    const Version = makeChild(log, 'version');
    let navigate = null;
    function NavProbe() {
      navigate = useNavigate();
      return null;
    }
    await mount(
      <CatalogFixture reloadCatalog={reloadCatalog}>
        <MemoryRouter initialEntries={['/']}>
          <NavProbe />
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Home />} />
              <Route path="/notebook" element={<Notebook />} />
              <Route path="/notebook/:recipeId/:versionId" element={<Version />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CatalogFixture>,
    );
    expect(log).toEqual(['home:revision:0', 'home:mount']);

    await chooseFile();
    expect(importStore).toHaveBeenCalledTimes(1);
    expect(reloadCatalog).toHaveBeenCalledTimes(1);

    const main = () => current.container.querySelector('main.shell__main');
    const expectRecovery = () => {
      expect(main().querySelector('h1.place__title').textContent).toBe('Import');
      expect(main().querySelector('p.place__note').textContent).toBe(IMPORT_RELOAD_LINE);
      expect(main().textContent).not.toContain('page');
      expect(current.container.querySelector('.shell__import-errors')).toBeNull();
      expect(current.container.textContent).not.toContain('This file can’t be imported');
      expect(current.container.textContent).not.toContain(IMPORT_STORAGE_ERROR);
      expect(current.container.textContent).not.toContain('Nothing was changed');
    };
    expect(IMPORT_RELOAD_LINE).toBe('The file was imported. Reload the page to see it.');
    expectRecovery();
    // The home page unmounted having never seen a new store revision.
    expect(log).toEqual(['home:revision:0', 'home:mount']);

    // The rail still navigates; the page under it stays withheld.
    const railNotebook = current.container.querySelector('nav#places a[href="/notebook"]');
    expect(railNotebook).not.toBeNull();
    await click(railNotebook);
    expectRecovery();

    // So does the address.
    await act(async () => {
      navigate(VERSION_PATH);
    });
    expectRecovery();
    expect(log).toEqual(['home:revision:0', 'home:mount']);
  });
});

describe('the real provider over a real repository (D-03a, T-09-26)', () => {
  // Writes a row straight into the scales store, the way an import's transaction
  // would have: test code, never app code.
  function putScaleRow(row) {
    return new Promise((resolve, reject) => {
      const open = indexedDB.open(DB_NAME);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result;
        const transaction = db.transaction('scales', 'readwrite');
        transaction.objectStore('scales').put(row);
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  it('shows the routed page the new words at the first render that sees the new storeRevision', async () => {
    await seedIfEmpty(repository);
    const initialCatalog = await loadCatalog(repository);
    const hardness = initialCatalog.scales.find((row) => row.key === 'hardness');
    hooks.beforeResolve = () => putScaleRow({ ...hardness, low: 'mushy', high: 'rock' });

    const renders = [];
    function Child() {
      const revision = useOutletContext();
      const { catalog } = useCatalog();
      const low = catalog.scales.find((row) => row.key === 'hardness').low;
      renders.push({ revision, low });
      return <p>{low}</p>;
    }
    await mount(
      <CatalogProvider initialCatalog={initialCatalog}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Shell />}>
              <Route path="/" element={<Child />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CatalogProvider>,
    );
    expect(renders.at(-1)).toEqual({ revision: 0, low: 'soft' });

    await chooseFile();
    expect(importStore).toHaveBeenCalledTimes(1);
    const firstNew = renders.find((render) => render.revision === 1);
    expect(firstNew).toEqual({ revision: 1, low: 'mushy' });
    // No render ever paired the new revision with the old words, or the old
    // revision with the new words.
    expect(renders.filter((render) => render.revision === 1 && render.low !== 'mushy')).toEqual([]);
    expect(renders.filter((render) => render.revision === 0 && render.low !== 'soft')).toEqual([]);
    expect(current.container.querySelector('main.shell__main').textContent).toBe('mushy');
  });
});
