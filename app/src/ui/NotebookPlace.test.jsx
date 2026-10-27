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
import { MemoryRouter, Outlet, Routes, Route, useLocation, useNavigate } from 'react-router';
import { repository } from '../store/repository.js';
import { NotebookList, NotebookPlace } from './NotebookPlace.jsx';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { notebookPath } from './notebookPaths.js';
import { activeWork } from '../domain/lastEvent.js';
import { seedRecipeGroups } from '../data/seed-recipes.js';
import { blankCreateDraft, buildDraftRecord } from '../domain/draft.js';
import { editPath } from './notebookPaths.js';

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

// Phase 11 plan 12 (D-05): a recipe holding a kept edit draft gains Resume
// editing on its own row; there is no separate draft row for it.
describe('NotebookList with a kept edit (D-05)', () => {
  const editing = new Map([['r-vanilla', 'v-vanilla']]);
  const vanilla = makeVersion('v-vanilla', 'r-vanilla', '2026-10-30T00:00:00.000Z');
  const vanillaRecipe = { id: 'r-vanilla', name: 'Vanilla', description: '' };
  const props = { versions: [...versions, vanilla], batches, recipes: [...recipes, vanillaRecipe], editing };

  it('adds Resume editing to that recipe’s row, inside the row, and to no other row', () => {
    const page = render(props);
    const rows = [...page.querySelectorAll('li.nb__row')];
    const resumeRows = rows.filter((row) => row.classList.contains('nb__row--resume'));
    expect(resumeRows).toHaveLength(1);
    expect(resumeRows[0].querySelector('.nb__name a').textContent).toBe('Vanilla');
    const act = resumeRows[0].querySelector('span.nb__row-act');
    expect([...act.querySelectorAll('button')].map((button) => button.textContent)).toEqual(['Resume editing']);
    expect(act.querySelector('button').className).toBe('notebook-action--outline');
    expect(page.querySelectorAll('span.nb__row-act')).toHaveLength(1);
  });

  it('draws no separate draft row, keeps New recipe and counts the recipe once', () => {
    const page = render(props);
    expect(page.querySelector('ul.nb__drafts')).toBeNull();
    expect(page.querySelector('li.nb__draft')).toBeNull();
    expect([...page.querySelectorAll('button')].map((button) => button.textContent)).toContain('New recipe');
    expect(page.querySelector('p.nb__count').textContent).toBe('9 recipes');
  });

  it('draws today’s rows when no edit is kept, with or without the prop', () => {
    const without = render({ versions, batches, recipes });
    const empty = render({ versions, batches, recipes, editing: new Map() });
    expect(empty.innerHTML).toBe(without.innerHTML);
    expect(without.querySelector('.nb__row-act')).toBeNull();
    expect(without.querySelector('.nb__row--resume')).toBeNull();
  });
});

describe('NotebookPlace reading the store', () => {
  let mounted = null;
  let where = null;
  function Where() {
    where = useLocation();
    return null;
  }

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
          <Where />
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
    repository.listDrafts = vi.fn().mockResolvedValue([]);
    const container = await mount();
    expect(container.querySelector('h1.place__title').textContent).toBe('Notebook');
    expect(container.querySelector('p.place__note').textContent).toBe(PAGE_LOAD_ERROR);
  });

  it('lists the recipes it reads through the repository', async () => {
    repository.getAll = vi.fn().mockResolvedValue(versions);
    repository.getAllBatches = vi.fn().mockResolvedValue(batches);
    repository.listRecipes = vi.fn().mockResolvedValue(recipes);
    repository.listDrafts = vi.fn().mockResolvedValue([]);
    const container = await mount();
    expect(container.querySelector('p.nb__count').textContent).toBe('8 recipes');
    expect(container.querySelectorAll('li.nb__row')).toHaveLength(8);
  });

  // A kept creation shows on every visit: the place itself reads the drafts at
  // load (MAKE-11), with no Start pressed.
  function stubStore({ withRecipes = true, drafts }) {
    repository.getAll = vi.fn().mockResolvedValue(withRecipes ? versions : []);
    repository.getAllBatches = vi.fn().mockResolvedValue(withRecipes ? batches : []);
    repository.listRecipes = vi.fn().mockResolvedValue(withRecipes ? recipes : []);
    repository.listDrafts = vi.fn().mockResolvedValue(drafts);
  }
  const keptRecord = (name, versionId = 'v-new') =>
    buildDraftRecord({
      versionId,
      kind: 'create',
      payload: blankCreateDraft({ recipeId: 'r-new', versionId, name }),
      now: '2026-10-20T08:00:00.000Z',
    });
  const buttonTexts = (container) => [...container.querySelectorAll('button')].map((button) => button.textContent);

  it('draws a kept creation as the draft row with Resume before the count, and offers no New recipe', async () => {
    stubStore({ drafts: [keptRecord('Vanilla')] });
    const container = await mount();
    const row = container.querySelector('ul.nb__drafts > li.nb__draft');
    expect(row.textContent).toContain('Vanilla');
    expect(buttonTexts(row)).toEqual(['Resume']);
    const count = container.querySelector('p.nb__count');
    expect(row.compareDocumentPosition(count) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(count.textContent).toBe('8 recipes');
    expect(buttonTexts(container)).not.toContain('New recipe');
  });

  it('renders a stored draft named with angle brackets as text', async () => {
    stubStore({ drafts: [keptRecord('<b>Vanilla</b>')] });
    const container = await mount();
    expect(container.querySelector('li.nb__draft .nb__name').textContent).toBe('<b>Vanilla</b>');
    expect(container.querySelector('li.nb__draft b')).toBeNull();
  });

  it('draws the head, the draft row and No recipes yet. when no recipe is stored', async () => {
    stubStore({ withRecipes: false, drafts: [keptRecord('Vanilla')] });
    const container = await mount();
    expect(container.querySelector('div.nb__head h1').textContent).toBe('Notebook');
    expect(container.querySelectorAll('li.nb__draft')).toHaveLength(1);
    expect(container.querySelector('p.place__note').textContent).toBe('No recipes yet.');
  });

  // D-10a: exactly one page notice, before the page's own root, in every branch.
  function expectOneNoticeBeforeRoot(container) {
    const notices = container.querySelectorAll('.page-status');
    expect(notices).toHaveLength(1);
    const anchor = notices[0].parentElement;
    expect(anchor.className).toBe('page-status-anchor');
    expect(anchor.nextElementSibling.className).toBe('list-page place nb');
  }

  it('renders one page notice before the root in the failed, loading, list and empty branches', async () => {
    stubStore({ drafts: [] });
    repository.getAll = vi.fn().mockRejectedValue(new Error('read failed'));
    expectOneNoticeBeforeRoot(await mount());
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;

    stubStore({ drafts: [] });
    repository.getAll = vi.fn(() => new Promise(() => {}));
    expectOneNoticeBeforeRoot(await mount());
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;

    stubStore({ drafts: [] });
    expectOneNoticeBeforeRoot(await mount());
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;

    stubStore({ withRecipes: false, drafts: [] });
    expectOneNoticeBeforeRoot(await mount());
  });

  it('shows no draft row and offers New recipe when the only draft is not a creation', async () => {
    stubStore({
      drafts: [
        buildDraftRecord({ versionId: 'v-plan', kind: 'plan', payload: {}, now: '2026-10-20T08:00:00.000Z' }),
      ],
    });
    const container = await mount();
    expect(container.querySelector('li.nb__draft')).toBeNull();
    expect(buttonTexts(container)).toContain('New recipe');
  });

  // Phase 11 plan 12 (D-05, D-06): the Notebook offers Resume editing for every
  // kept edit draft and deletes none.
  const vanillaVersion = makeVersion('v-vanilla', 'r-vanilla', '2026-10-30T00:00:00.000Z');
  const vanillaRecipe = { id: 'r-vanilla', name: 'Vanilla', description: '' };
  const keptEditRecord = () =>
    buildDraftRecord({
      versionId: 'v-vanilla',
      kind: 'edit',
      payload: blankCreateDraft({ recipeId: 'r-vanilla', versionId: 'v-vanilla', name: 'Vanilla' }),
      now: '2026-10-20T08:00:00.000Z',
    });
  function stubWithVanilla({ drafts, extraBatches = [] }) {
    repository.getAll = vi.fn().mockResolvedValue([...versions, vanillaVersion]);
    repository.getAllBatches = vi.fn().mockResolvedValue([...batches, ...extraBatches]);
    repository.listRecipes = vi.fn().mockResolvedValue([...recipes, vanillaRecipe]);
    repository.listDrafts = vi.fn().mockResolvedValue(drafts);
    repository.deleteDraft = vi.fn().mockResolvedValue(true);
  }

  it('gives a recipe holding a kept edit Resume editing on its row, which opens the edit route, with no draft row and New recipe offered', async () => {
    stubWithVanilla({ drafts: [keptEditRecord()] });
    const container = await mount();
    const row = [...container.querySelectorAll('li.nb__row')].find((candidate) => candidate.querySelector('.nb__name a').textContent === 'Vanilla');
    expect(buttonTexts(row)).toEqual(['Resume editing']);
    expect(container.querySelector('li.nb__draft')).toBeNull();
    expect(buttonTexts(container)).toContain('New recipe');
    expect(repository.deleteDraft).not.toHaveBeenCalled();

    await act(async () => {
      row.querySelector('button').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    expect(where.pathname).toBe(editPath('r-vanilla', 'v-vanilla'));
  });

  it('keeps a stale edit (its version has a batch now) and still offers Resume editing, deleting nothing', async () => {
    const staleBatch = { ...batches[0], id: 'b-stale', versionId: 'v-vanilla' };
    stubWithVanilla({ drafts: [keptEditRecord()], extraBatches: [staleBatch] });
    const container = await mount();
    const row = [...container.querySelectorAll('li.nb__row')].find((candidate) => candidate.querySelector('.nb__name a').textContent === 'Vanilla');
    expect(buttonTexts(row)).toEqual(['Resume editing']);
    expect(repository.deleteDraft).not.toHaveBeenCalled();
  });

  it('shows a creation draft row and an edit’s Resume editing together, each its own', async () => {
    stubWithVanilla({ drafts: [keptRecord('Chocolate'), keptEditRecord()] });
    const container = await mount();
    expect(buttonTexts(container.querySelector('li.nb__draft'))).toEqual(['Resume']);
    expect(container.querySelectorAll('li.nb__draft')).toHaveLength(1);
    expect(container.querySelectorAll('.nb__row-act')).toHaveLength(1);
  });

  it('ignores an edit draft whose version the Notebook does not hold', async () => {
    stubStore({ drafts: [keptEditRecord()] });
    const container = await mount();
    expect(container.querySelector('.nb__row-act')).toBeNull();
    expect(container.querySelector('li.nb__draft')).toBeNull();
  });

  it('renders the recipe name in a row with Resume editing as text', async () => {
    stubWithVanilla({ drafts: [keptEditRecord()] });
    repository.listRecipes = vi.fn().mockResolvedValue([...recipes, { ...vanillaRecipe, name: '<b>Vanilla</b>' }]);
    const container = await mount();
    const row = container.querySelector('li.nb__row--resume');
    expect(row.querySelector('.nb__name').textContent).toBe('<b>Vanilla</b>');
    expect(row.querySelector('b')).toBeNull();
  });
});

// Starting a recipe (Phase 10 plan 03, sketch 013 decisions 1, 11 and 13): the
// entry refuses a blank name with the app's own sentence, warns of a taken name
// without blocking it, writes one draft per Start, and never carries the maker
// into the editor after they cancelled the entry or left the place.
describe('NotebookPlace starting a recipe', () => {
  let mounted = null;
  let path = null;
  let go = null;

  function Probe() {
    path = useLocation().pathname;
    go = useNavigate();
    return null;
  }

  afterEach(async () => {
    if (mounted) {
      await act(async () => mounted.root.unmount());
      mounted.container.remove();
      mounted = null;
    }
    for (const key of Object.keys(repository)) delete repository[key];
  });

  async function mount({ drafts = [], stored = recipes } = {}) {
    repository.getAll = vi.fn().mockResolvedValue(versions);
    repository.getAllBatches = vi.fn().mockResolvedValue(batches);
    repository.listRecipes = vi.fn().mockResolvedValue(stored);
    repository.listDrafts = vi.fn().mockResolvedValue(drafts);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    mounted = { container, root };
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/notebook']}>
          <Probe />
          <Routes>
            <Route element={<Outlet context={0} />}>
              <Route path="/notebook" element={<NotebookPlace />} />
              <Route path="/notebook/new" element={<p className="marker">editor</p>} />
              <Route path="/" element={<p className="marker">home</p>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      );
    });
    return container;
  }

  const button = (container, text) => [...container.querySelectorAll('button')].find((el) => el.textContent === text);
  const buttonTexts = (container) => [...container.querySelectorAll('button')].map((el) => el.textContent);
  const nameField = (container) => container.querySelector('form.nb__new input');
  const line = (container) => container.querySelector('.nb__new .field-error');

  async function press(container, text) {
    await act(async () => button(container, text).click());
  }
  async function open(container) {
    await press(container, 'New recipe');
  }
  async function type(container, text) {
    const input = nameField(container);
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, text);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  async function submit(container) {
    await act(async () => {
      container.querySelector('form.nb__new').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  }
  function deferredSave() {
    let resolve;
    let reject;
    repository.saveDraft = vi.fn(
      () =>
        new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        }),
    );
    return {
      resolve: async () => act(async () => resolve()),
      reject: async () => act(async () => reject(new Error('write failed'))),
    };
  }

  it('refuses a blank name and a whitespace-only name, writing nothing', async () => {
    repository.saveDraft = vi.fn().mockResolvedValue(undefined);
    const container = await mount();
    await open(container);
    await press(container, 'Start');
    expect(line(container).textContent).toBe('Enter a recipe name.');
    await type(container, '   ');
    expect(line(container)).toBeNull();
    await press(container, 'Start');
    expect(line(container).textContent).toBe('Enter a recipe name.');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    expect(path).toBe('/notebook');
  });

  it('ties the required sentence to the field and clears it on the next keystroke', async () => {
    repository.saveDraft = vi.fn().mockResolvedValue(undefined);
    const container = await mount();
    await open(container);
    await press(container, 'Start');
    const input = nameField(container);
    const span = line(container);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(span.id).toBe('nb-new-name-error');
    expect(input.getAttribute('aria-describedby')).toBe(span.id);
    await type(container, 'V');
    expect(line(container)).toBeNull();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
  });

  it('warns of a taken name on every keystroke, still starts, and writes one draft', async () => {
    repository.saveDraft = vi.fn().mockResolvedValue(undefined);
    const taken = recipes[0].name;
    const container = await mount();
    await open(container);
    expect(line(container)).toBeNull();
    await type(container, `${taken.toUpperCase()} `);
    const span = line(container);
    expect(span.textContent).toBe('Another recipe already has this name. You can still use it.');
    const input = nameField(container);
    expect(input.getAttribute('aria-describedby')).toBe(span.id);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    await type(container, `${taken}x`);
    expect(line(container)).toBeNull();
    await type(container, taken);
    expect(line(container)).not.toBeNull();
    await press(container, 'Start');
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    expect(repository.saveDraft.mock.calls[0][0].payload.name).toBe(taken);
    expect(path).toBe('/notebook/new');
  });

  it('starts a one-letter name', async () => {
    repository.saveDraft = vi.fn().mockResolvedValue(undefined);
    const container = await mount();
    await open(container);
    await type(container, 'V');
    await press(container, 'Start');
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    expect(repository.saveDraft.mock.calls[0][0].payload.name).toBe('V');
  });

  it('writes one draft when Start is pressed twice before the write resolves', async () => {
    const save = deferredSave();
    const container = await mount();
    await open(container);
    await type(container, 'Vanilla');
    await press(container, 'Start');
    await press(container, 'Start');
    await submit(container);
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    await save.resolve();
    expect(path).toBe('/notebook/new');
  });

  it('takes a click on Start and the form submit Enter raises each as one start', async () => {
    repository.saveDraft = vi.fn().mockResolvedValue(undefined);
    const container = await mount();
    await open(container);
    expect(button(container, 'Start').type).toBe('submit');
    await type(container, 'Vanilla');
    await submit(container);
    expect(repository.saveDraft).toHaveBeenCalledTimes(1);
    expect(path).toBe('/notebook/new');
  });

  it('keeps the entry open and says the store sentence when the write fails', async () => {
    const save = deferredSave();
    const container = await mount();
    await open(container);
    await type(container, 'Vanilla');
    await press(container, 'Start');
    await save.reject();
    expect(container.querySelector('form.nb__new')).not.toBeNull();
    expect(container.querySelector('.page-status').textContent).toBe(PAGE_LOAD_ERROR);
    expect(path).toBe('/notebook');
    await press(container, 'Start');
    expect(repository.saveDraft).toHaveBeenCalledTimes(2);
  });

  it('writes nothing and draws the kept draft with Resume when one is already stored', async () => {
    repository.saveDraft = vi.fn().mockResolvedValue(undefined);
    const container = await mount();
    const kept = buildDraftRecord({
      versionId: 'v-other',
      kind: 'create',
      payload: blankCreateDraft({ recipeId: 'r-other', versionId: 'v-other', name: 'Other tab' }),
      now: '2026-10-20T08:00:00.000Z',
    });
    await open(container);
    await type(container, 'Vanilla');
    repository.listDrafts.mockResolvedValue([kept]);
    await press(container, 'Start');
    expect(repository.saveDraft).not.toHaveBeenCalled();
    expect(container.querySelector('li.nb__draft').textContent).toContain('Other tab');
    expect(buttonTexts(container)).toContain('Resume');
    expect(container.querySelector('form.nb__new')).toBeNull();
  });

  it('does not navigate when the entry is cancelled while the write is out, and shows the kept draft', async () => {
    const save = deferredSave();
    const container = await mount();
    await open(container);
    await type(container, 'Vanilla');
    await press(container, 'Start');
    await press(container, 'Cancel');
    await save.resolve();
    expect(path).toBe('/notebook');
    expect(container.querySelector('form.nb__new')).toBeNull();
    expect(container.querySelector('li.nb__draft').textContent).toContain('Vanilla');
    expect(buttonTexts(container)).toContain('Resume');
    expect(buttonTexts(container)).not.toContain('New recipe');
  });

  it('does not navigate when the place is left while the write is out, and shows the draft on the next visit', async () => {
    const save = deferredSave();
    const container = await mount();
    await open(container);
    await type(container, 'Vanilla');
    await press(container, 'Start');
    await act(async () => go('/'));
    expect(path).toBe('/');
    await save.resolve();
    expect(path).toBe('/');
    repository.listDrafts.mockResolvedValue([repository.saveDraft.mock.calls[0][0]]);
    await act(async () => go('/notebook'));
    expect(container.querySelector('li.nb__draft').textContent).toContain('Vanilla');
    expect(buttonTexts(container)).toContain('Resume');
  });

  it('says nothing about a failed write once the place has been left', async () => {
    const save = deferredSave();
    const container = await mount();
    await open(container);
    await type(container, 'Vanilla');
    await press(container, 'Start');
    await act(async () => go('/'));
    await save.reject();
    expect(path).toBe('/');
    expect(container.querySelector('.page-status')).toBeNull();
  });
});
