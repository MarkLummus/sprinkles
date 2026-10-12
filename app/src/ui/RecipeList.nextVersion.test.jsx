// @vitest-environment jsdom
//
// Quick 261012-e8l: Home's Next version carries the route state RecipePage
// uses once to open its Next version pen. HomeBody is mounted in a
// MemoryRouter, a link is clicked, and the landed location is read. The
// other Home links must land with no state.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router';

// RecipeList.jsx opens IndexedDB at import time through the repository seam;
// stubbed here as RecipeList.test.jsx does.
vi.mock('../store/repository.js', () => ({ repository: {} }));

import { HomeBody } from './RecipeList.jsx';
import { oliveOilVersion } from '../data/olive-oil.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function makeVersion(overrides = {}) {
  return {
    ...oliveOilVersion,
    id: 'v1',
    recipeId: 'r1',
    versionLabel: 'line',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeBatch(overrides = {}) {
  return {
    id: 'b1',
    versionId: 'v1',
    recordedAt: '2026-01-01T00:00:00.000Z',
    changed: null,
    churn: { churnDate: '2026-01-01', atTheMachine: null },
    tasting: null,
    ...overrides,
  };
}

const TASTED = [makeBatch({ tasting: { tastedDate: '2026-01-02' } })];
const AWAITING = [makeBatch({ tasting: null })];

let container = null;
let root = null;
let landed = null;

function Where() {
  landed = useLocation();
  return null;
}

async function mount(batches) {
  landed = null;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/']}>
        <Where />
        <Routes>
          <Route path="/" element={<HomeBody versions={[makeVersion()]} batches={batches} recipes={[]} />} />
          <Route path="/notebook/:recipeId/:versionId" element={null} />
          <Route path="/notebook/:recipeId/:versionId/batch/:batchId" element={null} />
        </Routes>
      </MemoryRouter>,
    );
  });
}

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  container = null;
  root = null;
});

function linksNamed(scope, text) {
  return [...container.querySelectorAll(`${scope} a`)].filter((link) => link.textContent === text);
}

async function click(link) {
  await act(async () => {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

describe('Home’s Next version asks the recipe page to open its pen (quick 261012-e8l)', () => {
  it('1: the row’s and the lead’s Next version are literal-tabIndex links to the latest version, and each lands with the flag', async () => {
    await mount(TASTED);
    // HomeLead has no Next version link of its own: it renders RowActions, so
    // the lead carries the same link as the row.
    expect(linksNamed('section.home__lead', 'Next version')).toHaveLength(1);
    expect(linksNamed('li.home__row', 'Next version')).toHaveLength(1);
    for (const scope of ['section.home__lead', 'li.home__row']) {
      const [link] = linksNamed(scope, 'Next version');
      expect(link.getAttribute('tabindex')).toBe('0');
      expect(link.getAttribute('href')).toBe('/notebook/r1/v1');
    }

    await click(linksNamed('li.home__row', 'Next version')[0]);
    expect(landed.pathname).toBe('/notebook/r1/v1');
    expect(landed.state).toEqual({ startNextVersion: true });

    await act(async () => root.unmount());
    container.remove();
    await mount(TASTED);
    await click(linksNamed('section.home__lead', 'Next version')[0]);
    expect(landed.pathname).toBe('/notebook/r1/v1');
    expect(landed.state).toEqual({ startNextVersion: true });
  });

  it('2: Adapt lands on the latest version with no state', async () => {
    await mount(TASTED);
    await click(linksNamed('li.home__row', 'Adapt')[0]);
    expect(landed.pathname).toBe('/notebook/r1/v1');
    expect(landed.state).toBeNull();
  });

  it('3: Record a tasting and Keep developing land with no state', async () => {
    await mount(AWAITING);
    await click(linksNamed('li.home__row', 'Record a tasting')[0]);
    expect(landed.pathname).toBe('/notebook/r1/v1/batch/b1');
    expect(landed.state).toBeNull();

    await act(async () => root.unmount());
    container.remove();
    await mount(AWAITING);
    await click(linksNamed('li.home__row', 'Keep developing')[0]);
    expect(landed.pathname).toBe('/notebook/r1/v1');
    expect(landed.state).toBeNull();
  });

  it('4: Record a batch lands with no state', async () => {
    await mount([]);
    await click(linksNamed('li.home__row', 'Record a batch')[0]);
    expect(landed.pathname).toBe('/notebook/r1/v1');
    expect(landed.state).toBeNull();
  });
});
