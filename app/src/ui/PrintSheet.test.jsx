// @vitest-environment jsdom
//
// The print route (04-06; D-04, PRINT-03, PRINT-05). Mounted whole over an
// in-memory stand-in for the repository seam (the only path to the store),
// inside a MemoryRouter at the print path. The stand-in records every method
// the route calls, so "reads the saved version only" is a fact the tests
// read, not a promise.
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router';

const store = vi.hoisted(() => ({ versions: [], recipes: [], calls: [] }));

vi.mock('../store/repository.js', () => ({
  repository: new Proxy(
    {},
    {
      get: (_, name) => async (...args) => {
        store.calls.push(name);
        if (name === 'getVersion') return store.versions.find((version) => version.id === args[0]);
        if (name === 'getRecipe') return store.recipes.find((recipe) => recipe.id === args[0]);
        if (name === 'listVersions') return store.versions;
        throw new Error(`the print route called repository.${String(name)}`);
      },
    },
  ),
}));

import { PrintSheetForRoute } from './PrintSheet.jsx';
import { oliveOilRecipe, oliveOilVersion } from '../data/olive-oil.js';
import { sheetCode } from '../domain/sheetCode.js';
import { printPath } from './notebookPaths.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let host = null;
let root = null;

async function mount(path, { versions = [oliveOilVersion], recipes = [oliveOilRecipe] } = {}) {
  store.versions = versions;
  store.recipes = recipes;
  store.calls = [];
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/notebook/:recipeId/:versionId/print" element={<PrintSheetForRoute />} />
          <Route path="/notebook/:recipeId/:versionId" element={<p>the version</p>} />
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
    expect(pictures.map((picture) => picture.getAttribute('aria-label'))).toEqual(['Batch log', 'Tasting log']);
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
