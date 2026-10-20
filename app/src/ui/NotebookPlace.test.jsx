// @vitest-environment jsdom
//
// The Notebook place (PLACE-02, sketch 012). NotebookList is presentational
// over plain props, so most of this renders it with renderToStaticMarkup
// (the harness RecipeList.test.jsx uses); one jsdom case mounts NotebookPlace
// to show a failed read ends in the one load-error line rather than a blank
// page that waits forever.
import { describe, it, expect, vi, afterEach } from 'vitest';
// NotebookPlace.jsx imports the repository, whose module opens the real
// IndexedDB at load. Stubbed at that one seam, as RecipePage.test.jsx does;
// the jsdom case below gives the stub the methods it calls.
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Outlet, Routes, Route } from 'react-router';
import { repository } from '../store/repository.js';
import { NotebookList, NotebookPlace } from './NotebookPlace.jsx';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { notebookPath } from './notebookPaths.js';
import { activeWork } from '../domain/lastEvent.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';

const recipes = seedRecipeGroups.map((group) => group.recipe);
const versions = seedRecipeGroups.flatMap((group) => group.versions);
const batches = seedRecipeGroups.flatMap((group) => group.batches);

function parse(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  return container;
}

function render(props) {
  return parse(
    renderToStaticMarkup(
      <MemoryRouter>
        <NotebookList {...props} />
      </MemoryRouter>,
    ),
  );
}

function makeVersion(id, recipeId, createdAt = '2026-01-01T00:00:00.000Z') {
  return { ...versions[0], id, recipeId, versionLabel: id, createdAt };
}

describe('NotebookList over the seed', () => {
  const page = render({ versions, batches, recipes });
  const rows = [...page.querySelectorAll('li.nb__row')];

  it('counts the recipes in words and lists one row each', () => {
    expect(page.querySelector('h1.place__title').textContent).toBe('Notebook');
    expect(page.querySelector('p.nb__count').textContent).toBe('8 recipes');
    expect(rows).toHaveLength(8);
  });

  it('lists the rows in the order activeWork gives Home', () => {
    const work = activeWork(versions, batches, recipes);
    const ids = rows.map((row) => decodeURIComponent(row.querySelector('.nb__name a').getAttribute('href').split('/')[2]));
    expect(ids).toEqual(work.map((entry) => entry.id));
    const hrefs = rows.map((row) => row.querySelector('.nb__name a').getAttribute('href'));
    expect(hrefs).toEqual(work.map((entry) => notebookPath(entry.id, entry.latestVersion.id)));
  });

  it('links each name to its latest version with tabindex 0', () => {
    for (const row of rows) {
      const link = row.querySelector('h2.nb__name > a');
      expect(link.getAttribute('href')).toMatch(/^\/notebook\/[^/]+\/[^/]+$/);
      expect(link.getAttribute('tabindex')).toBe('0');
    }
  });

  it('shows a rail on every row, hidden from assistive technology', () => {
    for (const row of rows) expect(row.querySelector('span.nb__rail').getAttribute('aria-hidden')).toBe('true');
  });

  it('shows Olive Oil’s description and no description on the others', () => {
    const olive = rows.find((row) => row.querySelector('.nb__name a').textContent.startsWith('Olive'));
    expect(olive.querySelector('p.nb__desc').textContent.length).toBeGreaterThan(0);
    expect(rows.filter((row) => row.querySelector('p.nb__desc'))).toHaveLength(1);
  });

  it('words Mexican Chocolate’s versions and batches', () => {
    const chocolate = rows.find((row) => row.querySelector('.nb__name a').textContent.startsWith('Mexican'));
    const spans = [...chocolate.querySelectorAll('p.nb__meta > span')].map((span) => span.textContent);
    expect(spans).toEqual(['4 versions', '·', '2 batches']);
    expect(chocolate.querySelector('.nb__dot').getAttribute('aria-hidden')).toBe('true');
  });

  it('says not yet made for a recipe with no batch', () => {
    expect(page.textContent).toContain('not yet made');
  });

  it('offers New recipe at the end of the title row and no Resume while nothing is kept', () => {
    const head = page.querySelector('div.nb__head');
    expect([...head.children].map((child) => child.tagName)).toEqual(['H1', 'BUTTON']);
    expect(head.querySelector('h1.place__title').textContent).toBe('Notebook');
    expect(head.querySelector('button').textContent).toBe('New recipe');
    expect(page.querySelectorAll('button')).toHaveLength(1);
    expect(page.textContent).not.toContain('Resume');
    expect(page.querySelector('form')).toBeNull();
  });
});

describe('NotebookList with a kept creation (sketch 013 nE1, nD2)', () => {
  const kept = (name) => ({ versionId: 'v-new', kind: 'create', payload: { recipeId: 'r-new', versionId: 'v-new', name } });

  it('draws the draft row above the count, not counted, with Resume and no New recipe', () => {
    const page = render({ versions, batches, recipes, draft: kept('Vanilla') });
    const list = page.querySelector('ul');
    expect(list.className).toBe('nb__drafts');
    const rows = list.querySelectorAll('li.nb__draft');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Vanilla');
    expect(rows[0].querySelector('span.nb__rail').getAttribute('aria-hidden')).toBe('true');
    expect(rows[0].querySelector('p.nb__meta > span').textContent).toBe('draft');
    expect([...rows[0].querySelectorAll('button')].map((button) => button.textContent)).toEqual(['Resume']);
    const count = page.querySelector('p.nb__count');
    expect(list.compareDocumentPosition(count) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(count.textContent).toBe('8 recipes');
    expect([...page.querySelectorAll('button')].map((button) => button.textContent)).not.toContain('New recipe');
  });

  it('draws the head, the draft row and No recipes yet. for a store with no recipes', () => {
    const page = render({ versions: [], batches: [], recipes: [], draft: kept('Vanilla') });
    expect(page.querySelector('div.nb__head h1').textContent).toBe('Notebook');
    expect(page.querySelectorAll('ul.nb__drafts > li.nb__draft')).toHaveLength(1);
    expect(page.querySelector('p.place__note').textContent).toBe('No recipes yet.');
    expect(page.querySelector('.nb__count')).toBeNull();
  });

  it('reads Untitled for a draft whose name is blank (D-08c)', () => {
    const page = render({ versions, batches, recipes, draft: kept('') });
    expect(page.querySelector('li.nb__draft .nb__name').textContent).toBe('Untitled');
    const spaces = render({ versions, batches, recipes, draft: kept('   ') });
    expect(spaces.querySelector('li.nb__draft .nb__name').textContent).toBe('Untitled');
  });

  it('renders a draft name holding angle brackets as text', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <NotebookList versions={[]} draft={kept('<b>Bold</b>')} />
      </MemoryRouter>,
    );
    expect(markup).toContain('&lt;b&gt;Bold&lt;/b&gt;');
    expect(markup).not.toContain('<b>');
  });
});

describe('NotebookList edges', () => {
  it('reads 1 recipe for one recipe', () => {
    const page = render({
      versions: [makeVersion('v1', 'r1')],
      batches: [],
      recipes: [{ id: 'r1', name: 'Only', description: '' }],
    });
    expect(page.querySelector('p.nb__count').textContent).toBe('1 recipe');
    expect(page.querySelector('.nb__meta').textContent).toBe('1 version·not yet made');
  });

  it('shows No recipes yet. and no list for none', () => {
    const page = render({ versions: [], batches: [], recipes: [] });
    expect(page.querySelector('p.place__note').textContent).toBe('No recipes yet.');
    expect(page.querySelector('ul')).toBeNull();
    expect(page.querySelector('.nb__count')).toBeNull();
  });

  it('lists two recipes sharing a name as two rows', () => {
    const page = render({
      versions: [makeVersion('v1', 'r1'), makeVersion('v2', 'r2', '2026-02-01T00:00:00.000Z')],
      batches: [],
      recipes: [
        { id: 'r1', name: 'Same' },
        { id: 'r2', name: 'Same' },
      ],
    });
    const hrefs = [...page.querySelectorAll('.nb__name a')].map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual([notebookPath('r2', 'v2'), notebookPath('r1', 'v1')]);
  });

  it('leaves out the description line for a blank or missing description', () => {
    const page = render({
      versions: [makeVersion('v1', 'r1'), makeVersion('v2', 'r2', '2026-02-01T00:00:00.000Z')],
      batches: [],
      recipes: [
        { id: 'r1', name: 'Blank', description: '   ' },
        { id: 'r2', name: 'Missing' },
      ],
    });
    expect(page.querySelector('.nb__desc')).toBeNull();
  });

  it('renders a name and a description holding angle brackets as text (T-09-06)', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <NotebookList
          versions={[makeVersion('v1', 'r1')]}
          batches={[]}
          recipes={[{ id: 'r1', name: '<i>Name</i>', description: '<b>bold</b>' }]}
        />
      </MemoryRouter>,
    );
    expect(markup).toContain('&lt;b&gt;bold&lt;/b&gt;');
    expect(markup).toContain('&lt;i&gt;Name&lt;/i&gt;');
    expect(markup).not.toContain('<b>');
  });
});

describe('NotebookPlace reading the store', () => {
  let mounted = null;

  afterEach(async () => {
    if (mounted) {
      await act(async () => mounted.root.unmount());
      mounted.container.remove();
      mounted = null;
    }
    for (const key of Object.keys(repository)) delete repository[key];
  });

  async function mount() {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    mounted = { container, root };
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/notebook']}>
          <Routes>
            <Route element={<Outlet context={0} />}>
              <Route path="/notebook" element={<NotebookPlace />} />
            </Route>
          </Routes>
        </MemoryRouter>,
      );
    });
    return container;
  }

  it('shows the one load-error line under the title when a read fails', async () => {
    repository.getAll = vi.fn().mockRejectedValue(new Error('read failed'));
    repository.getAllBatches = vi.fn().mockResolvedValue([]);
    repository.listRecipes = vi.fn().mockResolvedValue([]);
    const container = await mount();
    expect(container.querySelector('h1.place__title').textContent).toBe('Notebook');
    expect(container.querySelector('p.place__note').textContent).toBe(PAGE_LOAD_ERROR);
  });

  it('lists the recipes it reads through the repository', async () => {
    repository.getAll = vi.fn().mockResolvedValue(versions);
    repository.getAllBatches = vi.fn().mockResolvedValue(batches);
    repository.listRecipes = vi.fn().mockResolvedValue(recipes);
    const container = await mount();
    expect(container.querySelector('p.nb__count').textContent).toBe('8 recipes');
    expect(container.querySelectorAll('li.nb__row')).toHaveLength(8);
  });
});
