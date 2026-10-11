// @vitest-environment jsdom
//
// 04-10 (D-20): what a screen reader hears on the recipe page. A balance
// rule's name carries its deviation words, and focusing a rule announces the
// rows it marks in a polite live region, in the words the rows already carry;
// blurring clears it.
//
// A sibling jsdom file, for the reason RecipePage.recordTasting.test.jsx
// gives: the behaviour is focus and the page's own state, which
// renderToStaticMarkup cannot show. RecipePage is mounted whole over an
// in-memory stand-in for the repository seam. With no window.matchMedia the
// page answers its desktop arrangement.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

vi.mock('../store/repository.js', async () => {
  const { oliveOilRecipe, oliveOilVersion } = await import('../data/olive-oil.js');
  return {
    repository: {
      getVersion: async (id) => (id === oliveOilVersion.id ? oliveOilVersion : undefined),
      listVersions: async () => [oliveOilVersion],
      listBatchesForVersion: async () => [],
      getAllBatches: async () => [],
      getBatch: async () => undefined,
      getRecipe: async () => oliveOilRecipe,
      saveBatch: vi.fn(async () => {}),
      saveVersion: vi.fn(async () => {}),
      saveRecipe: vi.fn(async () => {}),
      getDraft: async () => undefined,
      saveDraft: vi.fn(async () => {}),
      deleteDraft: vi.fn(async () => {}),
      listDrafts: async () => [],
    },
  };
});

import { RecipePage } from './RecipePage.jsx';
import { oliveOilRecipe, oliveOilVersion } from '../data/olive-oil.js';
import { buildFigures, figureLabelText } from '../domain/figures.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const PATH = `/notebook/${oliveOilVersion.recipeId}/${oliveOilVersion.id}`;

let current = null;

function Keyed() {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={() => {}} />;
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

async function mount() {
  Element.prototype.scrollIntoView = vi.fn();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[PATH]}>
        <Routes>
          <Route path="/notebook/:recipeId/:versionId" element={<Keyed />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await flush(() => container.querySelector('.graduated-rule') !== null);
  return container;
}

afterEach(async () => {
  if (current) {
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
  }
});

// The figure's own descriptor, read from buildFigures, never a literal guess.
const solids = buildFigures(oliveOilVersion).find((figure) => figure.key === 'solids');
const ruleByName = (container, figure) =>
  [...container.querySelectorAll('button.graduated-rule')].find((button) =>
    button.getAttribute('aria-label').startsWith(`${figureLabelText(figure.label)}, `),
  );
const liveRegion = (container) => container.querySelector('.formulation-note-region [role="status"]');

describe('RecipePage — a balance rule speaks its deviation and the rows it marks (D-20)', () => {
  it("names the Solids rule's deviation words after its target", async () => {
    const container = await mount();
    const rule = ruleByName(container, solids);
    expect(rule).not.toBeNull();
    const name = rule.getAttribute('aria-label');
    expect(name).toContain(`target ${solids.band[0]}–${solids.band[1]}${solids.unit}, ${solids.deviation.words}`);
  });

  it('fills the polite live region with the marked rows on focus and empties it on blur', async () => {
    const container = await mount();
    const region = liveRegion(container);
    expect(region).not.toBeNull();
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.classList.contains('visually-hidden')).toBe(true);
    expect(region.textContent).toBe('');

    const names = [
      ...new Set(
        oliveOilVersion.rows.filter((row) => solids.contributorRowIds.includes(row.id)).map((row) => row.ingredientName),
      ),
    ];
    expect(names.length).toBeGreaterThan(0);

    const rule = ruleByName(container, solids);
    await act(async () => rule.focus());
    const expectedNames =
      names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
    expect(region.textContent).toBe(`Contributing to ${figureLabelText(solids.label)}: ${expectedNames}`);

    await act(async () => rule.blur());
    expect(region.textContent).toBe('');
  });
});

describe('RecipePage — the region names are headings in reading (D-20, research C6)', () => {
  it('stands Before you start, Ingredients, Instructions, Balance and Watch for as h2 elements', async () => {
    const container = await mount();
    const h2s = [...container.querySelectorAll('h2')].map((h) => h.textContent.trim());
    // A folding region's h2 also holds its Hide or Show word.
    for (const name of ['Before you start', 'Ingredients', 'Instructions', 'Balance', 'Watch for']) {
      expect(
        h2s.some((text) => text.startsWith(name)),
        `${name} is an h2`,
      ).toBe(true);
    }
    // Each region's own section is named by that same word.
    for (const name of ['Before you start', 'Ingredients', 'Instructions', 'Balance']) {
      expect(container.querySelector(`section[aria-label="${name}"] > h2`)?.textContent.trim().startsWith(name)).toBe(true);
    }
  });
});

describe('RecipePage — the tab title leads with the recipe (D-20)', () => {
  it('reads "{recipe name} · Sprinkles" once the recipe loads and returns to Sprinkles on unmount', async () => {
    document.title = 'Sprinkles';
    await mount();
    await flush(() => document.title !== 'Sprinkles');
    expect(document.title).toBe(`${oliveOilRecipe.name} · Sprinkles`);
    await act(async () => current.root.unmount());
    current.container.remove();
    current = null;
    expect(document.title).toBe('Sprinkles');
  });
});
