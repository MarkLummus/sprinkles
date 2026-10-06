// @vitest-environment jsdom
//
// Phase 03.7 (sketch 011 decision 36, Mark's answers of 2026-10-04: placement B, heading H1,
// pen E2, and the Instructions heading leaves the reading view when there are no steps): "Before
// you start" stands as its own Sheet section between the band and the Ingredients. This is the
// end-to-end path over the whole RecipePage, mounted over an in-memory stand-in for the
// repository seam (the only path to the store), with no batches: the reading order and the four
// states over Olive Oil v1, Mexican Chocolate v3, Standard Base v2 and a constructed notes-only
// version, then the pen.
//
// A sibling jsdom file, for the same reason as RecipePage.perStep.test.jsx: the behaviour is
// click and the page's own state, which renderToStaticMarkup cannot show, and RecipePage.test.jsx
// must keep running with no window in scope.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useParams } from 'react-router';

const store = vi.hoisted(() => ({ versions: [], recipes: [], saveVersion: null }));

vi.mock('../store/repository.js', async () => {
  store.saveVersion = vi.fn(async (record) => {
    const at = store.versions.findIndex((version) => version.id === record.id);
    if (at >= 0) store.versions[at] = structuredClone(record);
    else store.versions.push(structuredClone(record));
  });
  return {
    repository: {
      getVersion: async (id) => {
        const found = store.versions.find((version) => version.id === id);
        return found ? structuredClone(found) : undefined;
      },
      listVersions: async () => store.versions.map((version) => structuredClone(version)),
      listBatchesForVersion: async () => [],
      getAllBatches: async () => [],
      getBatch: async () => undefined,
      getRecipe: async (id) => {
        const found = store.recipes.find((recipe) => recipe.id === id);
        return found ? structuredClone(found) : undefined;
      },
      saveBatch: vi.fn(async () => {}),
      saveVersion: store.saveVersion,
      saveRecipe: vi.fn(async () => {}),
    },
  };
});

import { RecipePage } from './RecipePage.jsx';
import { oliveOilVersion, oliveOilRecipe } from '../data/olive-oil.js';
import { mexicanChocolateV3, mexicanChocolateRecipe } from '../data/mexican-chocolate.js';
import { standardBaseV2, standardBaseRecipe } from '../data/standard-base.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const NOTES_ONLY_ID = 'olive-oil-notes-only';
const notesOnlyVersion = { ...structuredClone(oliveOilVersion), id: NOTES_ONLY_ID, method: [] };

const MARKUP_ID = 'olive-oil-markup-note';
const markupVersion = structuredClone(oliveOilVersion);
markupVersion.id = MARKUP_ID;
markupVersion.authored.beforeYouStart[0].text = '<img src=x onerror=alert(1)>';

const MARKER_ID = 'olive-oil-marker-note';
const markerVersion = structuredClone(oliveOilVersion);
markerVersion.id = MARKER_ID;
markerVersion.authored.beforeYouStart[0].inheritedFrom = '50 g oil · 800 g';

let current = null;
let originalMatchMedia = null;

// router.jsx keys RecipePage by its route parameters; this wrapper does the same.
function Keyed() {
  const { recipeId, versionId, batchId } = useParams();
  return <RecipePage key={`${recipeId}::${versionId}::${batchId ?? ''}`} onPageStatus={() => {}} />;
}

// A fixed 393 coarse window, as RecipePage.perStep.test.jsx does.
function installMatchMedia() {
  Element.prototype.scrollIntoView = vi.fn();
  originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => {
    const max = query.match(/max-width:\s*([\d.]+)px/);
    const min = query.match(/min-width:\s*([\d.]+)px/);
    let matches = false;
    if (max) matches = 393 <= Number(max[1]);
    else if (min) matches = 393 >= Number(min[1]);
    else if (query.includes('pointer: coarse')) matches = true;
    return { matches, media: query, addEventListener() {}, removeEventListener() {} };
  };
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

async function mountVersion(version) {
  installMatchMedia();
  store.versions = [
    structuredClone(oliveOilVersion),
    structuredClone(mexicanChocolateV3),
    structuredClone(standardBaseV2),
    structuredClone(notesOnlyVersion),
    structuredClone(markupVersion),
    structuredClone(markerVersion),
  ];
  store.recipes = [oliveOilRecipe, mexicanChocolateRecipe, standardBaseRecipe];
  store.saveVersion.mockClear();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[`/notebook/${version.recipeId}/${version.id}`]}>
        <Routes>
          <Route path="/notebook/:recipeId/:versionId" element={<Keyed />} />
        </Routes>
      </MemoryRouter>,
    );
  });
  await flush(() => container.querySelector('article.recipe-page') !== null);
  return container.querySelector('article.recipe-page');
}

function buttonByText(scope, text) {
  return [...scope.querySelectorAll('button')].find((button) => button.textContent.trim() === text) ?? null;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
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
});

describe('reading: Before you start is its own section above the Ingredients (decision 36, placement B)', () => {
  it('(a) Olive Oil v1: band, before, ingredients, instructions, side, in that order; Instructions holds steps alone', async () => {
    const article = await mountVersion(oliveOilVersion);

    const order = [...article.children].map((child) => child.className);
    expect(order.slice(0, 5)).toEqual([
      'recipe-band',
      'before-region',
      'ingredient-table-region',
      'method-region',
      'side-region',
    ]);

    const before = article.querySelector('section.before-region');
    expect(before.tagName).toBe('SECTION');
    expect(before.getAttribute('aria-label')).toBe('Before you start');
    const heading = before.firstElementChild;
    expect(heading.tagName).toBe('H2');
    expect(heading.classList.contains('region-name')).toBe(true);
    expect(heading.textContent).toBe('Before you start');
    const lists = before.querySelectorAll('ul.authored__notes');
    expect(lists).toHaveLength(1);
    expect([...lists[0].querySelectorAll('li')].map((li) => li.textContent)).toEqual(
      oliveOilVersion.authored.beforeYouStart.map((note) => note.text),
    );

    const method = article.querySelector('section.method-region');
    expect(method.textContent).not.toContain('Before you start');
    expect(method.querySelector('ul.authored__notes')).toBeNull();
    expect(method.firstElementChild.tagName).toBe('H2');
    expect(method.firstElementChild.textContent).toBe('Instructions');
    expect(method.children[1].tagName).toBe('OL');
    expect(method.children[1].classList.contains('method-steps')).toBe(true);

    expect(article.className).toBe('recipe-page');
  });

  it('(b) Mexican Chocolate v3 (steps, no notes): no section, no words, no empty list', async () => {
    const article = await mountVersion(mexicanChocolateV3);
    expect(article.querySelector('section.before-region')).toBeNull();
    expect(article.textContent).not.toContain('Before you start');
    expect(article.querySelector('ul.authored__notes')).toBeNull();
    expect(article.className).toBe('recipe-page recipe-page--no-before');
  });

  it('(c) Standard Base v2 (no steps, no notes): neither section', async () => {
    const article = await mountVersion(standardBaseV2);
    expect(article.querySelector('section.before-region')).toBeNull();
    expect(article.querySelector('section.method-region')).toBeNull();
    expect(article.className).toBe('recipe-page recipe-page--no-before recipe-page--no-method');
  });

  it('(d) a version with notes and no steps: Before you start, and no Instructions', async () => {
    const article = await mountVersion(notesOnlyVersion);
    const before = article.querySelector('section.before-region');
    expect(before).not.toBeNull();
    expect(before.querySelectorAll('li')).toHaveLength(2);
    expect(article.querySelector('section.method-region')).toBeNull();
    expect(article.className).toBe('recipe-page recipe-page--no-method');
  });

  it('(e) T-03.7-01: a markup-like note renders as text, creating no element', async () => {
    const article = await mountVersion(markupVersion);
    const before = article.querySelector('section.before-region');
    expect(before.querySelector('li').textContent).toBe('<img src=x onerror=alert(1)>');
    expect(before.querySelector('img')).toBeNull();
  });

  it("(f) the inherited-note marker keeps its home on the note, after its text (decision 10)", async () => {
    const article = await mountVersion(markerVersion);
    const item = article.querySelector('section.before-region li');
    const marker = item.querySelector('span.authored__inherited');
    expect(marker).not.toBeNull();
    expect(marker.textContent).toBe(' from 50 g oil · 800 g');
    expect(item.textContent.indexOf(marker.textContent)).toBeGreaterThan(0);
    expect(item.lastElementChild).toBe(marker);
  });
});

async function setField(element, value) {
  const proto = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('the Next version pen: the section is always drawn, and its notes are edited from there (decision 36, pen E2)', () => {
  it('Olive Oil v1: both notes are fields with a remove control inside the section, none inside the Instructions', async () => {
    const article = await mountVersion(oliveOilVersion);
    await click(buttonByText(current.container, 'Next version'));

    const before = article.querySelector('section.before-region');
    const fields = [...before.querySelectorAll('textarea.prose-field')];
    expect(fields.map((field) => field.getAttribute('aria-label'))).toEqual(['beforeYouStart note 1', 'beforeYouStart note 2']);
    const removes = [...before.querySelectorAll('button')].filter((button) => button.textContent.trim() === 'remove');
    expect(removes).toHaveLength(2);
    for (const button of removes) expect(button.tabIndex).toBe(0);
    expect(article.querySelector('section.method-region').querySelector('textarea[aria-label^="beforeYouStart"]')).toBeNull();
  });

  it('Olive Oil v1: an edited note reaches saveVersion, and a removed note leaves one field', async () => {
    await mountVersion(oliveOilVersion);
    const container = current.container;
    const article = () => container.querySelector('article.recipe-page');
    await click(buttonByText(current.container, 'Next version'));

    await setField(article().querySelector('textarea[aria-label="beforeYouStart note 1"]'), 'Taste the Graza first.');
    await setField(container.querySelector('input[aria-label="Version name"]'), 'taste first');
    await click(buttonByText(container, 'Save as a new version'));
    await flush(() => store.saveVersion.mock.calls.length > 0);

    expect(store.saveVersion).toHaveBeenCalledTimes(1);
    const saved = store.saveVersion.mock.calls[0][0];
    expect(saved.authored.beforeYouStart[0].text).toBe('Taste the Graza first.');
  });

  it('Olive Oil v1: pressing the second note\'s remove leaves one field in the section', async () => {
    const article = await mountVersion(oliveOilVersion);
    await click(buttonByText(current.container, 'Next version'));
    const before = article.querySelector('section.before-region');
    const removes = [...before.querySelectorAll('button')].filter((button) => button.textContent.trim() === 'remove');
    await click(removes[1]);
    expect(before.querySelectorAll('textarea.prose-field')).toHaveLength(1);
  });

  it('Olive Oil v1: Tab order by document order puts the notes after the Sheet title and description and before the first ingredient input', async () => {
    const article = await mountVersion(oliveOilVersion);
    await click(buttonByText(current.container, 'Next version'));
    const follows = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    const title = article.querySelector('[aria-label="Sheet title"]');
    const description = article.querySelector('[aria-label="Sheet description"]');
    const notes = [...article.querySelectorAll('section.before-region textarea')];
    const firstIngredientInput = article.querySelector('.ingredient-table input');
    expect(notes).toHaveLength(2);
    expect(firstIngredientInput).not.toBeNull();
    for (const note of notes) {
      expect(follows(title, note)).toBe(true);
      expect(follows(description, note)).toBe(true);
      expect(follows(note, firstIngredientInput)).toBe(true);
    }
  });

  it('Mexican Chocolate v3 (no notes, E2): the heading stands alone, the Instructions heading stays, and Cancel returns to reading without the section', async () => {
    const article = await mountVersion(mexicanChocolateV3);
    await click(buttonByText(current.container, 'Next version'));

    const before = article.querySelector('section.before-region');
    expect(before).not.toBeNull();
    expect([...before.children].map((child) => child.tagName)).toEqual(['H2']);
    expect(before.firstElementChild.textContent).toBe('Before you start');
    expect(before.querySelector('ul')).toBeNull();
    expect(article.querySelector('section.method-region h2').textContent).toBe('Instructions');
    expect(article.className).toBe('recipe-page');

    await click(buttonByText(current.container, 'Cancel'));
    expect(article.querySelector('section.before-region')).toBeNull();
    expect(article.className).toBe('recipe-page recipe-page--no-before');
  });

  it('Standard Base v2 (no notes, no steps): Before you start precedes Instructions in the pen', async () => {
    const article = await mountVersion(standardBaseV2);
    await click(buttonByText(current.container, 'Next version'));
    const headings = [...article.querySelectorAll('h2.region-name')].map((heading) => heading.textContent);
    expect(headings.indexOf('Before you start')).toBeGreaterThan(-1);
    expect(headings.indexOf('Instructions')).toBeGreaterThan(headings.indexOf('Before you start'));
    expect(article.className).toBe('recipe-page');
  });
});
