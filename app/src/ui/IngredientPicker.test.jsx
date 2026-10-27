// @vitest-environment jsdom
//
// The ingredient picker (Phase 10, MAKE-06, sketch 013 ingredient-picker.html):
// it finds as the Ingredients place does, shows each entry's category and
// summary, reads Added for an entry already on the recipe, and reads "Not in
// the library yet" and adds nothing for a name the library does not hold
// (decisions 4 and 7, T-10-19, T-10-28).
import { describe, it, expect, vi, afterEach } from 'vitest';
// IngredientPicker.jsx reads the place's words from IngredientsPlace.jsx, which
// imports the repository, whose module opens the real IndexedDB at load.
vi.mock('../store/repository.js', () => ({ repository: {} }));
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { IngredientPicker } from './IngredientPicker.jsx';
import { library } from '../data/library.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const records = Object.entries(library).map(([id, entry]) => ({ id, entry }));

let mounted = null;

async function mount(props) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted = { container, root };
  const merged = { records, addedIds: new Set(), onPick: vi.fn(), onCancel: vi.fn(), ...props };
  await act(async () => {
    root.render(<IngredientPicker {...merged} />);
  });
  return { container, props: merged };
}

afterEach(async () => {
  if (mounted) {
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;
  }
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

const count = (container) => container.querySelector('p.ing__count').textContent;
const rowNames = (container) => [...container.querySelectorAll('.pick__name')].map((node) => node.textContent);
const rowNamed = (container, name) =>
  [...container.querySelectorAll('.pick__row')].find((row) => row.querySelector('.pick__name').textContent === name);
const clearButton = (container) => [...container.querySelectorAll('button')].find((button) => button.textContent === 'Clear filters');

describe('IngredientPicker filters as the Ingredients place does (decision 4, D-11)', () => {
  it('lists the 26 entries A to Z with the count in words and no Clear filters', async () => {
    const { container } = await mount();
    const names = rowNames(container);
    expect(names).toHaveLength(26);
    expect(names).toEqual([...names].sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1)));
    expect(count(container)).toBe('26 ingredients');
    expect(container.querySelector('p.ing__count').getAttribute('role')).toBe('status');
    expect(container.querySelector('p.ing__count').getAttribute('aria-live')).toBe('polite');
    expect(clearButton(container)).toBeUndefined();
    expect(container.querySelector('.pick__none')).toBeNull();
  });

  it('has Name and Category fields, with All first and a literal tabindex on the select', async () => {
    const { container } = await mount();
    const form = container.querySelector('form.ing__filters');
    expect(form.getAttribute('role')).toBe('search');
    expect(form.getAttribute('aria-label')).toBe('Ingredients');
    expect([...form.querySelectorAll('.notebook-caption')].map((node) => node.textContent)).toEqual(['Name', 'Category']);
    const options = [...container.querySelectorAll('select option')].map((option) => option.textContent);
    expect(options[0]).toBe('All');
    expect(options).toContain('Sugar');
    expect(container.querySelector('select').getAttribute('tabindex')).toBe('0');
  });

  it("'milk' gives 5 of 26 ingredients, five rows and Clear filters", async () => {
    const { container } = await mount();
    await typeName(container, 'milk');
    expect(count(container)).toBe('5 of 26 ingredients');
    expect(rowNames(container)).toHaveLength(5);
    expect(clearButton(container)).toBeDefined();
  });

  it('Category Sugar gives four rows', async () => {
    const { container } = await mount();
    await chooseCategory(container, 'sugar');
    expect(rowNames(container)).toHaveLength(4);
    expect(count(container)).toBe('4 of 26 ingredients');
  });

  it("a name matching nothing reads 'Not in the library yet', counts 0 of 26 and draws no list", async () => {
    const { container, props } = await mount();
    await typeName(container, 'zzz no such thing');
    const none = container.querySelector('p.pick__none');
    expect(none.textContent).toBe('Not in the library yet');
    expect(none.getAttribute('role')).toBe('status');
    expect(count(container)).toBe('0 of 26 ingredients');
    expect(container.querySelector('.pick__list')).toBeNull();
    expect(container.querySelector('.pick__row')).toBeNull();
    // Nothing the maker typed can become a row: Enter in the field adds nothing.
    await act(async () => {
      container.querySelector('input.ink-field').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    expect(props.onPick).not.toHaveBeenCalled();
  });

  it('Clear filters restores 26 and focuses Name', async () => {
    const { container } = await mount();
    await typeName(container, 'milk');
    await chooseCategory(container, 'dairy');
    await click(clearButton(container));
    expect(count(container)).toBe('26 ingredients');
    expect(rowNames(container)).toHaveLength(26);
    expect(container.querySelector('input.ink-field').value).toBe('');
    expect(container.querySelector('select').value).toBe('All');
    expect(clearButton(container)).toBeUndefined();
    expect(document.activeElement).toBe(container.querySelector('input.ink-field'));
  });

  it('a submit on the form is default-prevented', async () => {
    const { container } = await mount();
    const event = new Event('submit', { bubbles: true, cancelable: true });
    await act(async () => {
      container.querySelector('form.ing__filters').dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
  });

  it('opening the picker focuses Name', async () => {
    const { container } = await mount();
    expect(document.activeElement).toBe(container.querySelector('input.ink-field'));
  });
});

describe('IngredientPicker rows (decisions 4 and 7, T-10-19, T-10-28)', () => {
  it("shows Allulose's category and the place's summary, as the board draws it", async () => {
    const { container } = await mount();
    const row = rowNamed(container, 'Allulose');
    expect(row.querySelector('.pick__sum').textContent).toBe('Sugar · Sugar 100% · Freezing 190 · Sweetness 70');
    expect(row.querySelector('.pick__act').textContent).toBe('Add');
  });

  it('a row for an entry already on the recipe reads Added, is aria-disabled and does nothing when pressed', async () => {
    const { container, props } = await mount({ addedIds: new Set(['allulose']) });
    const added = rowNamed(container, 'Allulose');
    expect(added.classList.contains('pick__row--added')).toBe(true);
    expect(added.getAttribute('aria-disabled')).toBe('true');
    expect(added.querySelector('.pick__act').textContent).toBe('Added');
    await click(added);
    expect(props.onPick).not.toHaveBeenCalled();
    expect(container.querySelectorAll('.pick__row--added')).toHaveLength(1);
  });

  it("any other row's click calls onPick once with that record", async () => {
    const { container, props } = await mount({ addedIds: new Set(['allulose']) });
    const row = rowNamed(container, 'Dextrose');
    expect(row.getAttribute('aria-disabled')).toBeNull();
    await click(row);
    expect(props.onPick).toHaveBeenCalledTimes(1);
    expect(props.onPick.mock.calls[0][0]).toEqual(records.find((record) => record.entry.name === 'Dextrose'));
  });

  it('Cancel calls onCancel', async () => {
    const { container, props } = await mount();
    await click(container.querySelector('.pick__head button'));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it('an entry whose category is an object renders with no category word and does not throw', async () => {
    const odd = {
      id: 'oddity',
      entry: { name: 'Oddity', category: { not: 'a string' }, composition: { fat: 0.5, sugar: 0.25 } },
    };
    const { container } = await mount({ records: [odd, ...records] });
    const row = rowNamed(container, 'Oddity');
    expect(row.querySelector('.pick__sum').textContent).toBe('Fat 50% · Sugar 25%');
    expect(count(container)).toBe('27 ingredients');
    const options = [...container.querySelectorAll('select option')].map((option) => option.textContent);
    expect(options).toHaveLength(1 + new Set(records.map((record) => record.entry.category)).size);
  });

  it('an entry whose composition figures are all zero reads its category alone, with no separator at its end', async () => {
    const plain = { id: 'plain', entry: { name: 'Plain water', category: 'other', composition: { fat: 0, sugar: 0 } } };
    const { container } = await mount({ records: [plain] });
    const text = rowNamed(container, 'Plain water').querySelector('.pick__sum').textContent;
    expect(text).toBe('Other');
    expect(text.endsWith(' · ')).toBe(false);
  });

  it('an entry with neither a category nor a figure reads an empty summary, never a lone separator', async () => {
    const bare = { id: 'bare', entry: { name: 'Bare', category: 3, composition: { fat: 0 } } };
    const { container } = await mount({ records: [bare] });
    expect(rowNamed(container, 'Bare').querySelector('.pick__sum').textContent).toBe('');
  });

  it('draws a name that looks like markup as text', async () => {
    const markup = { id: 'markup', entry: { name: '<b>Bold</b>', category: 'other', composition: { fat: 0.1 } } };
    const { container } = await mount({ records: [markup] });
    expect(container.querySelector('.pick__name').textContent).toBe('<b>Bold</b>');
    expect(container.querySelector('.pick__name b')).toBeNull();
  });

  it("describes the Name field by the given message id, and by nothing when none is given (a refused Save with no ingredient)", async () => {
    const withIt = await mount({ describedBy: 'create-no-rows-error' });
    expect(withIt.container.querySelector('.ing__filters input').getAttribute('aria-describedby')).toBe('create-no-rows-error');
    await act(async () => mounted.root.unmount());
    mounted.container.remove();
    mounted = null;

    const without = await mount();
    expect(without.container.querySelector('.ing__filters input').hasAttribute('aria-describedby')).toBe(false);
  });
});
