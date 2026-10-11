// @vitest-environment jsdom
//
// The print route (04-06; D-04, PRINT-03, PRINT-05). Mounted whole over an
// in-memory stand-in for the repository seam (the only path to the store),
// inside a MemoryRouter at the print path. The stand-in records every method
// the route calls, so "reads the saved version only" is a fact the tests
// read, not a promise.
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router';

const store = vi.hoisted(() => ({ versions: [], recipes: [], drafts: [], batches: [], calls: [] }));

vi.mock('../store/repository.js', () => ({
  repository: new Proxy(
    {},
    {
      get: (_, name) => async (...args) => {
        store.calls.push(name);
        if (name === 'getVersion') return store.versions.find((version) => version.id === args[0]);
        if (name === 'getRecipe') return store.recipes.find((recipe) => recipe.id === args[0]);
        if (name === 'listVersions') return store.versions;
        // Reachable only so a test can prove the route never asks for them: a
        // stored draft and the batches. Calling saveBatch would add a batch.
        if (name === 'getDraft') return store.drafts.find((draft) => draft.versionId === args[0]);
        if (name === 'saveBatch') {
          store.batches.push(args[0]);
          return undefined;
        }
        throw new Error(`the print route called repository.${String(name)}`);
      },
    },
  ),
}));

import { PrintSheetForRoute, PRINT_TOO_LONG_LINE } from './PrintSheet.jsx';
import { oliveOilRecipe, oliveOilVersion } from '../data/olive-oil.js';
import { sheetCode } from '../domain/sheetCode.js';
import { printPath } from './notebookPaths.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let host = null;
let root = null;
let bumpRevision = null;

// The print route is a child of the Shell layout route in the real router, and
// Shell hands its storeRevision down through the Outlet's context. This stands
// in for it: a revision from 0 that a test can bump, as a successful import does.
function RevisionOutlet() {
  const [revision, setRevision] = useState(0);
  bumpRevision = () => setRevision((current) => current + 1);
  return <Outlet context={revision} />;
}

async function mount(path, { versions = [oliveOilVersion], recipes = [oliveOilRecipe], drafts = [] } = {}) {
  store.versions = versions;
  store.recipes = recipes;
  store.drafts = drafts;
  store.batches = [];
  store.calls = [];
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<RevisionOutlet />}>
            <Route path="/notebook/:recipeId/:versionId/print" element={<PrintSheetForRoute />} />
            <Route path="/notebook/:recipeId/:versionId" element={<p>the version</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  });
}

async function unmount() {
  await act(async () => root?.unmount());
  host?.remove();
  host = null;
  root = null;
  bumpRevision = null;
}

const OLIVE_PATH = printPath(oliveOilVersion.recipeId, oliveOilVersion.id);

afterEach(unmount);

describe('PrintSheet — the route line (D-04)', () => {
  beforeEach(async () => mount(OLIVE_PATH));

  it('reads the caption Print sheet, then the Sheet title as a link back to the version', () => {
    expect(host.querySelector('.notebook-caption').textContent).toBe('Print sheet');
    const link = host.querySelector('.print-route__name');
    expect(link.tagName).toBe('A');
    expect(link.textContent).toBe('Olive Oil Ice Cream');
    expect(link.getAttribute('href')).toBe('/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1');
    expect(link.getAttribute('tabindex')).toBe('0');
  });

  it('reads the version line, the saved date and the Sheet code of the saved version', () => {
    const parts = [...host.querySelectorAll('.print-route__part')].map((part) => part.textContent);
    expect(parts[0]).toBe('Version 1 · 50 g oil · 800 g');
    expect(parts[1]).toBe(`Saved 1 Jul 2026 · Sheet code ${sheetCode(oliveOilVersion)}`);
    expect(host.querySelector('.print-route__code').textContent).toBe(sheetCode(oliveOilVersion));
  });

  it('marks the route ready once the version, the recipe and the versions have loaded', () => {
    expect(host.querySelector('.print-route').hasAttribute('data-print-ready')).toBe(true);
  });

  it('puts Print, a button, after the line, and calls window.print when pressed', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const button = [...host.querySelectorAll('button')].find((candidate) => candidate.textContent === 'Print');
    expect(button).toBeDefined();
    expect(button.className).toBe('notebook-action');
    expect(button.getAttribute('tabindex')).toBe('0');
    await act(async () => button.click());
    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });

  it('offers no format prop, toggle or mode: the only controls are the Sheet title link and Print (D-22)', () => {
    expect(host.querySelectorAll('button')).toHaveLength(1);
    expect(host.querySelectorAll('a')).toHaveLength(1);
    expect(host.querySelector('select, input, [role="tab"], [role="switch"]')).toBeNull();
  });
});

describe('PrintSheet — the pages as pictures', () => {
  beforeEach(async () => mount(OLIVE_PATH));

  it('shows the Batch log as a picture, role img, named Batch log', () => {
    const picture = host.querySelector('.print-route__picture[aria-label="Batch log"]');
    expect(picture).not.toBeNull();
    expect(picture.getAttribute('role')).toBe('img');
    expect(picture.querySelector('.print-page.print-page--log .lf')).not.toBeNull();
    expect(picture.querySelector('.lf-title').textContent).toBe('Batch log');
  });

  it('shows the Tasting log second, as a picture named Tasting log, after the Batch log (D-07a)', () => {
    const pictures = [...host.querySelectorAll('.print-route__picture')];
    // The Sheet's pages follow the two log pages (04-07); jsdom measures
    // nothing, so it lays the whole Sheet on one page.
    expect(pictures.map((picture) => picture.getAttribute('aria-label'))).toEqual(['Batch log', 'Tasting log', 'Sheet, page 1']);
    expect(pictures[1].getAttribute('role')).toBe('img');
    expect(pictures[1].querySelector('.lf-title').textContent).toBe('Tasting log');
    expect(pictures[1].querySelectorAll('.lf-srow')).toHaveLength(oliveOilVersion.declaredAxes.length + 4);
  });

  it('carries a foot on each page with the Sheet title, the version line, the code and the side', () => {
    const feet = [...host.querySelectorAll('.lf-foot')].map((foot) => foot.textContent);
    const line = `Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · ${sheetCode(oliveOilVersion)}`;
    expect(feet).toEqual([`${line} · Side 1 of 2`, `${line} · Side 2 of 2`]);
    for (const foot of feet) expect(foot).not.toMatch(/page \d+ of/i);
  });
});

describe('PrintSheet — a version that is not there', () => {
  it('renders the not-found page for a recipeId that differs from the version’s own (T-04-15)', async () => {
    await mount(printPath('another-recipe', oliveOilVersion.id));
    expect(host.textContent).toContain('No recipe found for this version.');
    expect(host.querySelector('.print-route')).toBeNull();
  });

  it('renders the not-found page for a version id the store does not hold', async () => {
    await mount(printPath(oliveOilVersion.recipeId, 'no-such-version'));
    expect(host.textContent).toContain('No recipe found for this version.');
  });
});

describe('PrintSheet — reads the saved record and writes nothing (PRINT-05, T-04-16)', () => {
  it('calls no repository method other than getVersion, getRecipe and listVersions', async () => {
    await mount(OLIVE_PATH);
    expect(new Set(store.calls)).toEqual(new Set(['getVersion', 'getRecipe', 'listVersions']));
  });

  it('calls only those three on a not-found route too', async () => {
    await mount(printPath('another-recipe', oliveOilVersion.id));
    for (const name of store.calls) expect(['getVersion', 'getRecipe', 'listVersions']).toContain(name);
  });
});

describe('PrintSheet — the tab title (D-20)', () => {
  it('leads with the recipe name while mounted and goes back to Sprinkles when unmounted', async () => {
    document.title = 'Sprinkles';
    await mount(OLIVE_PATH);
    expect(document.title).toBe(`${oliveOilRecipe.name} · Print sheet · Sprinkles`);
    await unmount();
    expect(document.title).toBe('Sprinkles');
  });

  it('leaves the title alone on a not-found route', async () => {
    document.title = 'Sprinkles';
    await mount(printPath('another-recipe', oliveOilVersion.id));
    expect(document.title).toBe('Sprinkles');
  });
});

describe('PrintSheet — the pictures take the scale the room allows', () => {
  it('sets --sheet-print-picture-scale on the pages container, 1 where nothing can be measured', async () => {
    await mount(OLIVE_PATH);
    expect(host.querySelector('.print-route__pages').style.getPropertyValue('--sheet-print-picture-scale')).toBe('1');
  });

  it('measures the container over the page and sets the ratio, never above 1', async () => {
    const observed = [];
    class FakeObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe(element) {
        observed.push(element);
      }
      disconnect() {}
    }
    const widths = { page: 816, room: 353 };
    vi.stubGlobal('ResizeObserver', FakeObserver);
    const pageWidth = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => widths.page);
    const roomWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => widths.room);
    try {
      await mount(OLIVE_PATH);
      const pages = host.querySelector('.print-route__pages');
      expect(observed).toEqual([pages]);
      expect(pages.style.getPropertyValue('--sheet-print-picture-scale')).toBe(String(Math.round((353 / 816) * 10000) / 10000));
      await unmount();
      widths.room = 1200;
      await mount(OLIVE_PATH);
      expect(host.querySelector('.print-route__pages').style.getPropertyValue('--sheet-print-picture-scale')).toBe('1');
    } finally {
      pageWidth.mockRestore();
      roomWidth.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});

// PRINT-05 edges: opening the route prints a saved version and never makes a
// batch, and nothing unsaved reaches the page.
describe('PrintSheet — [edge PRINT-05/idempotency] the same version twice', () => {
  it('shows the same Sheet code both times and the store gains no batch', async () => {
    await mount(OLIVE_PATH);
    const first = host.querySelector('.print-route__code').textContent;
    const firstFeet = [...host.querySelectorAll('.lf-foot')].map((foot) => foot.textContent);
    expect(store.batches).toHaveLength(0);
    await unmount();
    await mount(OLIVE_PATH);
    const second = host.querySelector('.print-route__code').textContent;
    expect(second).toBe(first);
    expect(second).toBe(sheetCode(oliveOilVersion));
    expect([...host.querySelectorAll('.lf-foot')].map((foot) => foot.textContent)).toEqual(firstFeet);
    expect(store.batches).toHaveLength(0);
    expect(store.calls).not.toContain('saveBatch');
  });
});

describe('PrintSheet — [edge PRINT-05/concurrency] a draft that changes the Sheet title', () => {
  it('shows the saved Sheet title and the saved content\'s code on the line and both feet, and never reads the draft', async () => {
    const draft = {
      versionId: oliveOilVersion.id,
      kind: 'plan',
      payload: { sheetTitle: 'A Draft Title That Is Not Saved', versionLabel: 'x' },
    };
    await mount(OLIVE_PATH, { drafts: [draft] });
    expect(host.querySelector('.print-route__name').textContent).toBe(oliveOilVersion.sheetTitle);
    expect(host.querySelector('.print-route__code').textContent).toBe(sheetCode(oliveOilVersion));
    const feet = [...host.querySelectorAll('.lf-foot')].map((foot) => foot.textContent);
    expect(feet).toHaveLength(2);
    for (const foot of feet) {
      expect(foot.startsWith(`${oliveOilVersion.sheetTitle} · `)).toBe(true);
      expect(foot).toContain(sheetCode(oliveOilVersion));
      expect(foot).not.toContain('Draft Title');
    }
    expect(host.textContent).not.toContain('A Draft Title That Is Not Saved');
    expect(store.calls).not.toContain('getDraft');
    expect(store.calls).not.toContain('listDrafts');
  });
});

// WR-06: Print before the Sheet's pages are laid would carry the two log pages
// only. jsdom has no document.fonts, so the test gives document one whose
// ready it holds, the way a slow font load holds useSheetPages.
describe("PrintSheet — Print waits for the Sheet's pages (WR-06)", () => {
  it('is off, and prints nothing, until the pages are laid; then one press prints once', async () => {
    let release;
    const ready = new Promise((resolve) => {
      release = resolve;
    });
    Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true });
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    try {
      await mount(OLIVE_PATH);
      const printButton = () => [...host.querySelectorAll('button')].find((candidate) => candidate.textContent === 'Print');
      expect(host.querySelector('.print-route').hasAttribute('data-print-ready')).toBe(false);
      expect(host.querySelector('[aria-label="Sheet, page 1"]')).toBeNull();
      expect(printButton().disabled).toBe(true);
      expect(printButton().getAttribute('tabindex')).toBe('0');
      expect(printButton().className).toBe('notebook-action');
      await act(async () => printButton().click());
      expect(print).not.toHaveBeenCalled();

      await act(async () => {
        release();
        await ready;
      });
      expect(host.querySelector('.print-route').getAttribute('data-print-ready')).toBe('true');
      expect(host.querySelector('[aria-label="Sheet, page 1"]')).not.toBeNull();
      expect(printButton().disabled).toBe(false);
      await act(async () => printButton().click());
      expect(print).toHaveBeenCalledTimes(1);
    } finally {
      delete document.fonts;
      print.mockRestore();
    }
  });
});

// Review 2026-10-11 P2, print part: a successful import increments the shell's
// storeRevision (Shell.jsx, through the Outlet context). The open print route
// used to keep the old version, Sheet code and laid pages, with Print on.
describe('PrintSheet — an import re-reads the open route (review 2026-10-11 P2)', () => {
  it('shows the imported title and code at once, keeps Print off until the new pages are laid, then prints once', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    try {
      await mount(OLIVE_PATH);
      const printButton = () => [...host.querySelectorAll('button')].find((candidate) => candidate.textContent === 'Print');
      expect(host.querySelector('.print-route__name').textContent).toBe('Olive Oil Ice Cream');
      expect(host.querySelector('.print-route__code').textContent).toBe(sheetCode(oliveOilVersion));
      expect(printButton().disabled).toBe(false);

      // What a successful import does: the stored version now carries another
      // Sheet title, then the shell's revision moves. The fonts are held so the
      // replacement's pages cannot be laid yet.
      const imported = { ...oliveOilVersion, sheetTitle: 'IMPORTED REVIEW TITLE' };
      const importedCode = sheetCode(imported);
      expect(importedCode).not.toBe(sheetCode(oliveOilVersion));
      store.versions = [imported];
      let release;
      const ready = new Promise((resolve) => {
        release = resolve;
      });
      Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true });
      store.calls = [];
      await act(async () => bumpRevision());

      expect(host.querySelector('.print-route__name').textContent).toBe('IMPORTED REVIEW TITLE');
      expect(host.querySelector('.print-route__code').textContent).toBe(importedCode);
      const feet = [...host.querySelectorAll('.lf-foot')].map((foot) => foot.textContent);
      expect(feet).toHaveLength(2);
      for (const foot of feet) {
        expect(foot.startsWith('IMPORTED REVIEW TITLE · ')).toBe(true);
        expect(foot).toContain(importedCode);
      }
      expect(host.querySelector('.print-route').hasAttribute('data-print-ready')).toBe(false);
      expect(host.querySelector('[aria-label="Sheet, page 1"]')).toBeNull();
      expect(printButton().disabled).toBe(true);
      expect(printButton().getAttribute('tabindex')).toBe('0');
      await act(async () => printButton().click());
      expect(print).not.toHaveBeenCalled();
      expect(new Set(store.calls)).toEqual(new Set(['getVersion', 'getRecipe', 'listVersions']));

      await act(async () => {
        release();
        await ready;
      });
      expect(host.querySelector('.print-route').getAttribute('data-print-ready')).toBe('true');
      const sheetFoot = host.querySelector('[aria-label="Sheet, page 1"] .mp-foot').textContent;
      expect(sheetFoot.startsWith('IMPORTED REVIEW TITLE · ')).toBe(true);
      expect(sheetFoot.endsWith(importedCode)).toBe(true);
      expect(printButton().disabled).toBe(false);
      await act(async () => printButton().click());
      expect(print).toHaveBeenCalledTimes(1);
    } finally {
      delete document.fonts;
      print.mockRestore();
    }
  });
});

// Review 2026-10-11 P2, decide-print-oversized-text-policy = visible state: a
// block too tall for one printed page turns Print off and says so in one short
// line; no Sheet page picture is drawn (it would clip). jsdom has no layout, so
// getBoundingClientRect answers by class: the measuring box is the Chrome
// content box (672 x 960) and Before you start is 24 px for every 80 characters
// of its note, so the height follows the note's length.
describe('PrintSheet — a block too tall for one page (review 2026-10-11 P2)', () => {
  const SENTENCE = 'Before starting, check the ingredients and equipment. ';
  const oversizeVersion = () => {
    const clone = structuredClone(oliveOilVersion);
    clone.authored.beforeYouStart = [{ text: SENTENCE.repeat(150), inheritedFrom: null }];
    return clone;
  };
  let originalRect = null;
  const rect = (width, height) => ({ top: 0, left: 0, bottom: height, right: width, x: 0, y: 0, width, height });

  beforeEach(() => {
    originalRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function answer() {
      if (this.classList.contains('ps-box')) return rect(672, 960);
      if (this.classList.contains('ps-before')) return rect(0, Math.ceil(this.textContent.length / 80) * 24);
      return rect(0, 0);
    };
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = originalRect;
  });

  const printButton = () => [...host.querySelectorAll('button')].find((candidate) => candidate.textContent === 'Print');

  it('turns Print off, shows the line under the route line, draws no Sheet picture and prints nothing', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    try {
      await mount(OLIVE_PATH, { versions: [oversizeVersion()] });
      const line = host.querySelector('.print-route__id p.print-route__line');
      expect(line).not.toBeNull();
      expect(line.textContent).toBe(PRINT_TOO_LONG_LINE);
      expect(printButton().disabled).toBe(true);
      expect(host.querySelector('.print-route').hasAttribute('data-print-ready')).toBe(false);
      expect(host.querySelector('[aria-label="Sheet, page 1"]')).toBeNull();
      expect(host.querySelector('[aria-label="Batch log"]')).not.toBeNull();
      expect(host.querySelector('[aria-label="Tasting log"]')).not.toBeNull();
      await act(async () => printButton().click());
      expect(print).not.toHaveBeenCalled();
    } finally {
      print.mockRestore();
    }
  });

  it('leaves Olive Oil v1 ready, with Print on and no line', async () => {
    await mount(OLIVE_PATH);
    expect(host.querySelector('.print-route').getAttribute('data-print-ready')).toBe('true');
    expect(printButton().disabled).toBe(false);
    expect(host.querySelector('[aria-label="Sheet, page 1"]')).not.toBeNull();
    expect(host.textContent).not.toContain(PRINT_TOO_LONG_LINE);
  });
});
