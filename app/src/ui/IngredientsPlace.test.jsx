// @vitest-environment jsdom
//
// The Ingredients place (PLACE-01, sketch 012): the library read-only, with
// search by name and category and a fold that opens an entry in place. The
// static cases render IngredientsList with renderToStaticMarkup; the jsdom
// cases drive the filters and the fold, as Shell.flyout.test.jsx drives the
// fly-out, and mount IngredientsPlace over a stubbed repository.
import { describe, it, expect, vi, afterEach } from 'vitest';
// IngredientsPlace.jsx and RecipePage.jsx (which it reads PAGE_LOAD_ERROR
// from) both import the repository, whose module opens the real IndexedDB at
// load. Stubbed at that one seam; the cases that mount the place give the
// stub the methods they call.
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Outlet, Routes, Route } from 'react-router';
import { repository } from '../store/repository.js';
import { IngredientsList, IngredientsPlace } from './IngredientsPlace.jsx';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
import { library } from '../data/library.js';

const records = Object.entries(library).map(([id, entry]) => ({ id, entry }));

const WRITE_METHODS = [
  'saveVersion',
  'putAll',
  'saveBatch',
  'putAllBatches',
  'saveRecipe',
  'putAllRecipes',
  'putAllLibrary',
  'seedLibraryIfEmpty',
  'importAll',
  'saveDraft',
  'deleteDraft',
];

function parse(markup) {
  const container = document.createElement('div');
  container.innerHTML = markup;
  return container;
}

let mounted = null;

async function mountList(list) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted = { container, root };
  await act(async () => {
    root.render(<IngredientsList records={list} />);
  });
  return container;
}

async function mountPlace() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted = { container, root };
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/ingredients']}>
        <Routes>
          <Route element={<Outlet context={0} />}>
            <Route path="/ingredients" element={<IngredientsPlace />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  });
  return container;
}

afterEach(async () => {
  if (mounted) {
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;
  }
  for (const key of Object.keys(repository)) delete repository[key];
});

async function typeName(container, value) {
  const input = container.querySelector('input.ink-field');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function chooseCategory(container, value) {
  const select = container.querySelector('select');
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

const rowNamed = (container, name) =>
  [...container.querySelectorAll('li.ing__row')].find((row) => row.querySelector('.ing__name').textContent === name);
const count = (container) => container.querySelector('p.ing__count').textContent;
const rowNames = (container) => [...container.querySelectorAll('.ing__name')].map((node) => node.textContent);
const clearButton = (container) =>
  [...container.querySelectorAll('button')].find((button) => button.textContent === 'Clear filters');

describe('IngredientsList as the board draws it', () => {
  const page = parse(renderToStaticMarkup(<IngredientsList records={records} />));

  it('shows the title, a Name field and a Category select with All first and the held categories A to Z', () => {
    expect(page.querySelector('h1.place__title').textContent).toBe('Ingredients');
    expect(page.querySelector('form.ing__filters').getAttribute('role')).toBe('search');
    const captions = [...page.querySelectorAll('.ing__field .notebook-caption')].map((node) => node.textContent);
    expect(captions).toEqual(['Name', 'Category']);
    const options = [...page.querySelectorAll('select option')].map((option) => option.textContent);
    expect(options[0]).toBe('All');
    const held = [...new Set(records.map((record) => record.entry.category))].sort();
    expect(options.slice(1)).toEqual(held.map((word) => word[0].toUpperCase() + word.slice(1)));
  });

  it('gives the Category select tabindex 0', () => {
    expect(page.querySelector('select').getAttribute('tabindex')).toBe('0');
  });

  it('lists the 26 entries A to Z with the count in words and no Clear filters', () => {
    const names = [...page.querySelectorAll('.ing__name')].map((node) => node.textContent);
    expect(names).toHaveLength(26);
    expect(names).toEqual([...names].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1)));
    const count = page.querySelector('p.ing__count');
    expect(count.textContent).toBe('26 ingredients');
    expect(count.getAttribute('role')).toBe('status');
    expect(count.getAttribute('aria-live')).toBe('polite');
    expect(page.textContent).not.toContain('Clear filters');
  });

  it('makes each row head a closed fold button with aria-expanded and aria-controls', () => {
    const heads = [...page.querySelectorAll('li.ing__row > button.ing__head')];
    expect(heads).toHaveLength(26);
    for (const head of heads) {
      expect(head.getAttribute('aria-expanded')).toBe('false');
      expect(head.getAttribute('aria-controls')).toBeTruthy();
      expect(head.getAttribute('tabindex')).toBe('0');
      expect(head.querySelector('.ing__control').textContent).toBe('Show');
    }
    expect(page.querySelector('.ing__detail')).toBeNull();
  });

  it('summarises the figures an entry holds on its closed row', () => {
    const sucrose = [...page.querySelectorAll('li.ing__row')].find((row) => row.textContent.startsWith('Sucrose'));
    expect(sucrose.querySelector('.ing__cat').textContent).toBe('Sugar');
    expect(sucrose.querySelector('.ing__sum').textContent).toBe('Sugar 100% · Freezing 100 · Sweetness 100');
  });

  it('draws the rail on every row and writes nothing with a button but the heads', () => {
    expect(page.querySelectorAll('li.ing__row > span.ing__rail[aria-hidden="true"]')).toHaveLength(26);
    expect(page.querySelectorAll('button')).toHaveLength(26);
  });
});

describe('the filters', () => {
  it('typing milk gives 5 of 26 ingredients and shows Clear filters', async () => {
    const container = await mountList(records);
    await typeName(container, 'milk');
    expect(count(container)).toBe('5 of 26 ingredients');
    expect(container.querySelectorAll('li.ing__row')).toHaveLength(5);
    expect(clearButton(container)).toBeTruthy();
  });

  it('choosing Sugar gives four rows', async () => {
    const container = await mountList(records);
    await chooseCategory(container, 'sugar');
    expect(container.querySelectorAll('li.ing__row')).toHaveLength(4);
    expect(count(container)).toBe('4 of 26 ingredients');
  });

  it('a name and a category combine', async () => {
    const container = await mountList(records);
    await typeName(container, 'milk');
    await chooseCategory(container, 'dairy');
    const dairyMilk = rowNames(container);
    expect(dairyMilk.length).toBeGreaterThan(0);
    expect(dairyMilk.length).toBeLessThanOrEqual(5);
    await chooseCategory(container, 'sugar');
    expect(container.querySelector('.ing__none').textContent).toBe('No ingredient matches. Try another name or category.');
    expect(count(container)).toBe('0 of 26 ingredients');
  });

  it('shows the no-match words and no list when nothing matches', async () => {
    const container = await mountList(records);
    await typeName(container, 'zzzz');
    expect(container.querySelector('.place__note').textContent).toBe('No ingredient matches. Try another name or category.');
    expect(container.querySelector('ul')).toBeNull();
  });

  it('treats a whitespace-only name as no filter', async () => {
    const container = await mountList(records);
    await typeName(container, '   ');
    expect(count(container)).toBe('26 ingredients');
    expect(clearButton(container)).toBeUndefined();
  });

  it('Clear filters empties both filters and puts focus on Name', async () => {
    const container = await mountList(records);
    await typeName(container, 'milk');
    await chooseCategory(container, 'dairy');
    await click(clearButton(container));
    expect(container.querySelector('input.ink-field').value).toBe('');
    expect(container.querySelector('select').value).toBe('All');
    expect(count(container)).toBe('26 ingredients');
    expect(clearButton(container)).toBeUndefined();
    expect(document.activeElement).toBe(container.querySelector('input.ink-field'));
  });

  it('Enter in Name submits nothing: the submit is default-prevented and the filters stay', async () => {
    const container = await mountList(records);
    await typeName(container, 'milk');
    const form = container.querySelector('form.ing__filters');
    const submit = new Event('submit', { bubbles: true, cancelable: true });
    await act(async () => {
      form.dispatchEvent(submit);
    });
    expect(submit.defaultPrevented).toBe(true);
    expect(count(container)).toBe('5 of 26 ingredients');
    expect(container.querySelector('input.ink-field').value).toBe('milk');
  });
});

describe('opening an entry', () => {
  it('toggles the fold: aria-expanded, Show and Hide, and the detail with the id the head controls', async () => {
    const container = await mountList(records);
    const row = rowNamed(container, 'Heavy cream, 36% fat');
    const head = row.querySelector('button.ing__head');
    await click(head);
    expect(head.getAttribute('aria-expanded')).toBe('true');
    expect(head.querySelector('.ing__control').textContent).toBe('Hide');
    const detail = row.querySelector('.ing__detail');
    expect(detail.id).toBe(head.getAttribute('aria-controls'));
    await click(head);
    expect(head.getAttribute('aria-expanded')).toBe('false');
    expect(row.querySelector('.ing__detail')).toBeNull();
  });

  it('Heavy cream: Fat 36% derived with its source, Milk solids · MSNF 5.4% estimated with not recorded, the facts and the lactose line', async () => {
    const container = await mountList(records);
    const row = rowNamed(container, 'Heavy cream, 36% fat');
    await click(row.querySelector('button.ing__head'));
    const heads = [...row.querySelectorAll('thead th')].map((th) => th.textContent);
    expect(heads).toEqual(['Figure', 'Amount', 'Basis', 'Source']);
    const cells = [...row.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((cell) => cell.textContent));
    expect(cells).toEqual([
      ['Fat', '36%', 'derived', 'panel reconciled three ways against a 36% regulatory floor'],
      ['Milk solids · MSNF', '5.4%', 'estimated', 'not recorded'],
    ]);
    expect(row.querySelector('tbody tr:nth-child(2) .ing__source').classList.contains('ing__unsaid')).toBe(true);
    expect(row.querySelector('.ing__facts').textContent).toBe('Density 0.994 g/ml · Ultra-pasteurised');
    expect(row.querySelector('.ing__helper').textContent).toBe(
      'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.',
    );
    expect(row.querySelector('.ing__note-cap').textContent).toBe('Note');
    expect(row.querySelector('.ing__note').textContent).toContain('Panel implied 40%');
  });

  it('Locust bean gum: not recorded, the hydration facts line, no lactose line and no Note', async () => {
    const container = await mountList(records);
    const row = rowNamed(container, 'Locust bean gum');
    await click(row.querySelector('button.ing__head'));
    const cells = [...row.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((cell) => cell.textContent));
    expect(cells).toEqual([['Stabilizer', '100%', 'stated', 'not recorded']]);
    expect(row.querySelector('.ing__facts').textContent).toBe('Hydrates at 82 °C');
    expect(row.querySelector('.ing__helper')).toBeNull();
    expect(row.querySelector('.ing__note')).toBeNull();
    expect(row.querySelector('.ing__note-cap')).toBeNull();
  });

  it('shows the lactose line on an entry that holds milk solids but is not dairy', async () => {
    const list = [
      {
        id: 'milkChocolate',
        entry: {
          name: 'Milk Chocolate',
          category: 'flavor',
          composition: { fat: 0.2966, msnf: 0.16, sugar: 0.4278, other: 0.1006, pac: 4.78, pod: 51.6048 },
        },
      },
    ];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    expect(container.querySelector('.ing__helper').textContent).toBe(
      'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.',
    );
  });

  it('leaves the lactose line out of an entry that is not dairy and holds no milk solids', async () => {
    const list = [
      {
        id: 'dark',
        entry: { name: 'Dark chocolate', category: 'flavor', dairy: false, composition: { fat: 0.42, sugar: 0.29, other: 0.29 } },
      },
    ];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    expect(container.querySelector('.ing__helper')).toBeNull();
  });

  it('still shows the lactose line on a dairy entry with no milk solids figure', async () => {
    const list = [
      { id: 'butter', entry: { name: 'Butter', category: 'dairy', dairy: true, composition: { fat: 0.82 } } },
    ];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    expect(container.querySelector('.ing__helper').textContent).toBe(
      'Lactose counts as 54.5% of milk solids in Freezing and Sweetness.',
    );
  });

  it('Sucrose: density and packed state share one facts line, and PAC and POD read as plain numbers', async () => {
    const container = await mountList(records);
    const row = rowNamed(container, 'Sucrose');
    await click(row.querySelector('button.ing__head'));
    expect(row.querySelector('.ing__facts').textContent).toBe('Density 0.85 g/ml · Granulated, loose');
    const cells = [...row.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((cell) => cell.textContent));
    expect(cells).toEqual([
      ['Sugar', '100%', 'stated', 'not recorded'],
      ['Freezing · PAC', '100', 'stated', 'reference basis — sucrose defines 100'],
      ['Sweetness · POD', '100', 'stated', 'not recorded'],
    ]);
  });

  it('reads an entry with no density, heat treatment or note with those lines left out, never a dash', async () => {
    const container = await mountList(records);
    const row = rowNamed(container, 'Allulose');
    await click(row.querySelector('button.ing__head'));
    expect(row.querySelector('.ing__facts')).toBeNull();
    expect(row.textContent).not.toMatch(/—|\bnone\b/i);
  });

  it('reads a hydration temperature with no source text as the number and °C', async () => {
    const list = [
      { id: 'gum', entry: { name: 'Plain gum', category: 'stabilizer', hydrationC: 82, composition: { stabilizer: 1 } } },
    ];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    expect(container.querySelector('.ing__facts').textContent).toBe('Hydrates at 82 °C');
  });

  it('reads all four facts value-first in their order, with the stored hydration figure and not its source prose', async () => {
    const list = [
      {
        id: 'every',
        entry: {
          name: 'Every fact',
          category: 'other',
          densityGPerMl: 0.994,
          heatTreatment: 'ultra-pasteurised',
          packedState: 'granulated, loose',
          hydrationC: 82,
          composition: { other: 1 },
          source: { hydrationC: 'commonly cited 80–85 °C, varies by grade' },
        },
      },
    ];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    expect(container.querySelector('.ing__facts').textContent).toBe(
      'Density 0.994 g/ml · Ultra-pasteurised · Granulated, loose · Hydrates at 82 °C',
    );
  });

  it('reads a basis the entry never states as unreviewed, the Sheet’s word for inherited', async () => {
    const list = [{ id: 'seed', entry: { name: 'Seeded', category: 'other', composition: { other: 1 }, basis: { other: 'inherited' } } },
      { id: 'bare', entry: { name: 'Unstated', category: 'other', composition: { other: 1 } } }];
    const container = await mountList(list);
    for (const name of ['Seeded', 'Unstated']) {
      const row = rowNamed(container, name);
      await click(row.querySelector('button.ing__head'));
      expect(row.querySelector('.ing__basis').textContent).toBe('unreviewed');
    }
  });

  it('renders a negative figure with a true minus and at most two decimals', async () => {
    const list = [
      { id: 'neg', entry: { name: 'Negative', category: 'other', composition: { pac: -160, pod: 0.456 } } },
    ];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    const amounts = [...container.querySelectorAll('tbody .ing__amount')].map((cell) => cell.textContent);
    expect(amounts).toEqual(['−160', '0.46']);
  });
});

describe('an imported entry the validator accepts but the place does not trust (T-09-34)', () => {
  const odd = {
    id: 'odd',
    entry: {
      name: 'Odd entry',
      category: { x: 1 },
      composition: { fat: 0.1 },
      basis: { fat: 'guessed' },
      source: { fat: { a: 1 } },
      note: 42,
      densityGPerMl: 'heavy',
    },
  };

  it('renders without throwing, with those fields left out', async () => {
    const container = await mountList([...records, odd]);
    const row = rowNamed(container, 'Odd entry');
    expect(row.querySelector('.ing__cat').textContent).toBe('');
    await click(row.querySelector('button.ing__head'));
    const cells = [...row.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((cell) => cell.textContent));
    expect(cells).toEqual([['Fat', '10%', 'not recorded', 'not recorded']]);
    expect(row.querySelector('.ing__facts')).toBeNull();
    expect(row.querySelector('.ing__note')).toBeNull();
    expect(row.querySelector('.ing__note-cap')).toBeNull();
  });

  it('lists the other categories and not the object, and the object entry shows under All only', async () => {
    const container = await mountList([...records, odd]);
    const options = [...container.querySelectorAll('select option')].map((option) => option.value);
    expect(options).toEqual(['All', ...[...new Set(records.map((record) => record.entry.category))].sort()]);
    await chooseCategory(container, 'sugar');
    expect(rowNames(container)).not.toContain('Odd entry');
  });

  it('renders a basis and source that are not objects as absent', async () => {
    const list = [{ id: 'x', entry: { name: 'Strings', category: 'other', composition: { other: 1 }, basis: 'stated', source: ['a'] } }];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    expect(container.querySelector('.ing__basis').textContent).toBe('unreviewed');
    expect(container.querySelector('.ing__source').textContent).toBe('not recorded');
  });
});

describe('stored text renders as text (T-09-06)', () => {
  it('escapes an angle-bracket note, source, name and facts', () => {
    const list = [
      {
        id: 'x',
        entry: {
          name: '<i>Name</i>',
          category: 'other',
          heatTreatment: '<u>hot</u>',
          composition: { other: 1 },
          source: { other: '<s>src</s>' },
          note: 'a <b>bold</b> note',
        },
      },
    ];
    // The static markup of an open entry cannot be reached without a click, so
    // drive the open fold through the DOM in the jsdom case below; here only
    // the closed row's name is escaped.
    const markup = renderToStaticMarkup(<IngredientsList records={list} />);
    expect(markup).toContain('&lt;i&gt;Name&lt;/i&gt;');
    expect(markup).not.toContain('<i>');
  });

  it('escapes an open entry’s note, source and heat treatment', async () => {
    const list = [
      {
        id: 'x',
        entry: {
          name: 'Plain',
          category: 'other',
          heatTreatment: '<u>hot</u>',
          composition: { other: 1 },
          source: { other: '<s>src</s>' },
          note: 'a <b>bold</b> note',
        },
      },
    ];
    const container = await mountList(list);
    await click(container.querySelector('button.ing__head'));
    expect(container.querySelector('.ing__note').innerHTML).toBe('a &lt;b&gt;bold&lt;/b&gt; note');
    expect(container.querySelector('.ing__source').innerHTML).toBe('&lt;s&gt;src&lt;/s&gt;');
    expect(container.querySelector('.ing__facts').innerHTML).toBe('&lt;u&gt;hot&lt;/u&gt;');
    expect(container.querySelector('b, s, u')).toBeNull();
  });
});

describe('IngredientsPlace reading the store', () => {
  it('lists the library it reads through listLibrary and calls no write method', async () => {
    const writes = Object.fromEntries(WRITE_METHODS.map((name) => [name, vi.fn()]));
    Object.assign(repository, writes, { listLibrary: vi.fn().mockResolvedValue(records) });
    const container = await mountPlace();
    expect(repository.listLibrary).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('li.ing__row')).toHaveLength(26);
    await typeName(container, 'milk');
    await click(container.querySelector('button.ing__head'));
    await chooseCategory(container, 'dairy');
    await click(clearButton(container));
    for (const name of WRITE_METHODS) expect(repository[name], name).not.toHaveBeenCalled();
  });

  it('shows the one load-error line under the title when the read fails', async () => {
    repository.listLibrary = vi.fn().mockRejectedValue(new Error('read failed'));
    const container = await mountPlace();
    expect(container.querySelector('h1.place__title').textContent).toBe('Ingredients');
    expect(container.querySelector('p.place__note').textContent).toBe(PAGE_LOAD_ERROR);
    expect(container.querySelector('ul')).toBeNull();
  });
});
