// @vitest-environment jsdom
//
// The creating table's per-row grams message (Phase 10 plan 07, MAKE-06, D-08).
// A stateful harness holds the draft and changes it only through the field's own
// input events and blurs, so the clear-on-type rule is proven through the events
// that drive it, never by re-rendering props alone.
import { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { IngredientTable } from './IngredientTable.jsx';
import { creationSheetVersion, addRow, removeRow } from '../domain/creation.js';
import { blankCreateDraft } from '../domain/draft.js';
import {
  addStep,
  moveRow,
  placeRow,
  rowLines,
  setLineGrams,
  setStepField,
  toggleStepUses,
  UNPLACED_STEP,
} from '../domain/creationSteps.js';
import { library } from '../data/library.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const records = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));
const WHOLE_MILK = 'Whole milk, 3.5% fat';

function startingDraft() {
  let draft = blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });
  draft = addRow(draft, { rowId: 'sucrose-row', libraryId: 'sucrose' });
  draft = addRow(draft, { rowId: 'milk-row', libraryId: 'wholeMilk' });
  draft = setLineGrams(draft, 'sucrose-row', UNPLACED_STEP, '');
  draft = setLineGrams(draft, 'milk-row', UNPLACED_STEP, 'abc');
  return draft;
}

let current = null;

let setDraftRef = null;

function mount(initial = startingDraft, lineMessages = null) {
  const onBlurGrams = vi.fn();
  const onRemoveRow = vi.fn();
  const onMoveRow = vi.fn();
  const onPlaceRow = vi.fn();
  function Harness() {
    const [draft, setDraft] = useState(initial);
    setDraftRef = setDraft;
    const version = creationSheetVersion(draft, records);
    const gramsByLine = new Map(
      draft.rows.flatMap((row) => rowLines(draft, row.id).map((line) => [`${row.id}:${line.step}`, line.grams])),
    );
    return (
      <IngredientTable
        rows={version.rows}
        mode="creating"
        steps={version.method}
        creationRows={{
          gramsByLine,
          focusLine: null,
          lineMessages,
          onChangeGrams: (rowId, step, value) => setDraft((prev) => setLineGrams(prev, rowId, step, value)),
          onBlurGrams,
          onRemoveRow: (rowId, group) => {
            onRemoveRow(rowId, group);
            setDraft((prev) => removeRow(prev, rowId));
          },
          onMoveRow: (rowId, group, direction) => {
            onMoveRow(rowId, group, direction);
            setDraft((prev) => moveRow(prev, rowId, group, direction));
          },
          onPlaceRow: (rowId, n) => {
            onPlaceRow(rowId, n);
            setDraft((prev) => placeRow(prev, rowId, n));
          },
        }}
      />
    );
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Harness />);
  });
  current = { container, root, onBlurGrams, onRemoveRow, onMoveRow, onPlaceRow };
  return current;
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

function field(name) {
  return current.container.querySelector(`input[aria-label="${name}, grams"]`);
}

function rowOf(name) {
  return field(name).closest('tr');
}

function type(name, value) {
  const input = field(name);
  act(() => {
    input.focus();
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function leave(name) {
  const input = field(name);
  act(() => {
    input.focus();
    input.blur();
  });
}

function lineIn(name) {
  return rowOf(name).querySelector('.field-error');
}

describe('IngredientTable, creating: the per-row grams message', () => {
  it('shows no line before any field is left', () => {
    mount();
    expect(current.container.querySelector('.field-error')).toBeNull();
  });

  it('shows the pen sentence under an empty row once focus leaves it', () => {
    mount();
    leave('Sucrose');
    const line = lineIn('Sucrose');
    expect(line.textContent).toBe('Sucrose needs an amount, or remove it');
    const input = field('Sucrose');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(line.id);
    expect(rowOf('Sucrose').classList.contains('is-marked')).toBe(true);
    expect(current.onBlurGrams).toHaveBeenCalledWith('sucrose-row', UNPLACED_STEP);
  });

  it("shows each row's own line, side by side", () => {
    mount();
    leave('Sucrose');
    leave(WHOLE_MILK);
    expect(lineIn(WHOLE_MILK).textContent).toBe(`${WHOLE_MILK}'s amount is not a number`);
    expect(lineIn('Sucrose').textContent).toBe('Sucrose needs an amount, or remove it');
    expect(lineIn(WHOLE_MILK).id).not.toBe(lineIn('Sucrose').id);
    expect(current.container.querySelector('#ingredient-field-error')).toBeNull();
  });

  it('clears the line on the next readable value and leaves the other row alone', () => {
    mount();
    leave('Sucrose');
    leave(WHOLE_MILK);
    type('Sucrose', '150');
    expect(lineIn('Sucrose')).toBeNull();
    expect(field('Sucrose').getAttribute('aria-invalid')).toBeNull();
    expect(rowOf('Sucrose').classList.contains('is-marked')).toBe(false);
    expect(lineIn(WHOLE_MILK)).not.toBeNull();
  });

  it('never raises a line while typing, and raises it again only on the next blur', () => {
    mount();
    leave('Sucrose');
    type('Sucrose', '150');
    leave('Sucrose');
    expect(lineIn('Sucrose')).toBeNull();
    type('Sucrose', 'x');
    expect(lineIn('Sucrose')).toBeNull();
    leave('Sucrose');
    expect(lineIn('Sucrose').textContent).toBe("Sucrose's amount is not a number");
  });

  it('keeps an unreadable value silent while typing before any blur', () => {
    mount();
    type('Sucrose', 'x');
    expect(lineIn('Sucrose')).toBeNull();
  });

  it('strikes nothing and keeps an empty row on the table at 0 g, the shares and total reading the projection', () => {
    mount();
    type('Sucrose', '150');
    leave(WHOLE_MILK);
    const rows = current.container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(current.container.querySelector('.struck-value')).toBeNull();
    for (const row of rows) expect(row.getAttribute('aria-label') ?? '').not.toContain('was ');
    const share = (name) => rowOf(name).querySelector('.ingredient-table__col-numeric').textContent;
    expect(share('Sucrose')).toBe('100.0%');
    expect(share(WHOLE_MILK)).toBe('trace');
    const total = current.container.querySelector('tfoot tr').textContent;
    expect(total).toContain('150');
  });
});

describe('IngredientTable, creating: step heads', () => {
  // Phase 11 plan 07: the table mounted alone, with no currentStepNumbers,
  // still groups its lines under their heads (it reads the numbers off the
  // steps it is given).
  it('with one step using one row, draws that step head over the row and Not in a step yet over the other', () => {
    mount(() => {
      const draft = addStep(startingDraft(), { afterN: null });
      return toggleStepUses(draft, draft.method[0].n, 'milk-row');
    });
    const bodies = [...current.container.querySelectorAll('tbody')];
    expect(bodies.map((body) => body.querySelector('tr.ingredient-table__step-head').textContent)).toEqual([
      'Step 1',
      'Not in a step yet',
    ]);
    expect(bodies[0].querySelector(`input[aria-label="${WHOLE_MILK}, grams"]`)).not.toBeNull();
    expect(bodies[1].querySelector('input[aria-label="Sucrose, grams"]')).not.toBeNull();
  });

  it('with no step the table stays flat: one group and no head', () => {
    mount();
    expect(current.container.querySelectorAll('tr.ingredient-table__step-head')).toHaveLength(0);
    expect(current.container.querySelectorAll('tbody')).toHaveLength(1);
  });
});

describe('IngredientTable, creating: a row in two steps reads one line per step', () => {
  // Milk 600 g split 400 + 200 over two steps, sucrose 434 g unplaced: the batch
  // is 1034 g, so milk is 58.0% in all.
  function splitDraft() {
    let draft = blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });
    draft = addRow(draft, { rowId: 'milk-row', libraryId: 'wholeMilk' });
    draft = addRow(draft, { rowId: 'sucrose-row', libraryId: 'sucrose' });
    draft = setLineGrams(draft, 'sucrose-row', UNPLACED_STEP, '434');
    draft = setLineGrams(draft, 'milk-row', UNPLACED_STEP, '600');
    draft = addStep(addStep(draft, { afterN: null }), { afterN: 1 });
    draft = toggleStepUses(draft, 1, 'milk-row');
    draft = toggleStepUses(draft, 2, 'milk-row');
    draft = setLineGrams(draft, 'milk-row', 1, '400');
    return setLineGrams(draft, 'milk-row', 2, '200');
  }

  const line = (key) => current.container.querySelector(`tr[data-line="${key}"]`);
  const lineField = (key) => line(key).querySelector('input');

  it('draws each line under its own step head, with its own grams field, key and label', () => {
    mount(splitDraft);
    const bodies = [...current.container.querySelectorAll('tbody')];
    expect(bodies.map((body) => body.querySelector('tr.ingredient-table__step-head').textContent)).toEqual([
      'Step 1',
      'Step 2',
      'Not in a step yet',
    ]);
    expect(bodies[0].querySelector('tr').nextElementSibling.getAttribute('data-line')).toBe('milk-row:1');
    expect(bodies[1].querySelector('tr').nextElementSibling.getAttribute('data-line')).toBe('milk-row:2');
    expect(lineField('milk-row:1').value).toBe('400');
    expect(lineField('milk-row:2').value).toBe('200');
    expect(lineField('milk-row:1').getAttribute('aria-label')).toBe(`${WHOLE_MILK}, grams, portion 1`);
    expect(lineField('milk-row:2').getAttribute('aria-label')).toBe(`${WHOLE_MILK}, grams, portion 2`);
    expect(lineField('sucrose-row:0').getAttribute('aria-label')).toBe('Sucrose, grams');
  });

  it('says what each line is of the row and of the batch', () => {
    mount(splitDraft);
    const note = (key) => line(key).querySelector('.ingredient-table__portion-note')?.textContent ?? null;
    expect(note('milk-row:1')).toBe('400 g of 600.0 g · 58.0% in all');
    expect(note('milk-row:2')).toBe('200 g of 600.0 g · 58.0% in all');
    expect(note('sucrose-row:0')).toBeNull();
  });

  it("names each line's Move controls and grams field by its step, so no two share a name", () => {
    mount(splitDraft);
    const move = (key, direction) => line(key).querySelector(`[data-act="move-${direction}"]`).getAttribute('aria-label');
    expect(move('milk-row:1', 'up')).toBe(`Move ${WHOLE_MILK} up in step 1`);
    expect(move('milk-row:2', 'down')).toBe(`Move ${WHOLE_MILK} down in step 2`);
    // A row with one line keeps the board's plain name.
    expect(move('sucrose-row:0', 'up')).toBe('Move Sucrose up');
    // Every line-specific control on the table has a name of its own: each Move
    // button and each grams field. The removes are left out: each removes the row.
    const names = [...current.container.querySelectorAll('tbody [data-act^="move-"], tbody input')].map((control) =>
      control.getAttribute('aria-label'),
    );
    expect(names).toHaveLength(3 * 2 + 3);
    expect(new Set(names).size).toBe(names.length);
  });

  it('both lines of a split row carry remove for the row, and a press on either removes the whole row', () => {
    mount(splitDraft);
    for (const key of ['milk-row:1', 'milk-row:2']) {
      const remove = line(key).querySelector('[data-act="remove"]');
      expect(remove.getAttribute('aria-label')).toBe(`remove ${WHOLE_MILK}`);
      expect(remove.textContent).toBe('Remove');
    }
    act(() => line('milk-row:2').querySelector('[data-act="remove"]').click());
    expect(current.onRemoveRow).toHaveBeenCalledWith('milk-row', 2);
    expect(line('milk-row:1')).toBeNull();
    expect(line('milk-row:2')).toBeNull();
    expect(line('sucrose-row:0')).not.toBeNull();
  });

  it("shows each line's message on its own blur and leaves its sibling line alone", () => {
    mount(splitDraft);
    const second = lineField('milk-row:2');
    act(() => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      second.focus();
      setter.call(second, '');
      second.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => second.blur());
    expect(line('milk-row:2').querySelector('.field-error').textContent).toBe(`${WHOLE_MILK} needs an amount, or remove it`);
    expect(line('milk-row:1').querySelector('.field-error')).toBeNull();
    expect(lineField('milk-row:2').getAttribute('aria-describedby')).toBe(line('milk-row:2').querySelector('.field-error').id);
    expect(current.onBlurGrams).toHaveBeenCalledWith('milk-row', 2);
  });

  it("shows a refused Save's sentence on a split row's last line only, marked, invalid and described by it (T-11-65)", () => {
    const sentence = `${WHOLE_MILK}'s amount is not a number`;
    mount(splitDraft, new Map([['milk-row:2', sentence]]));
    const last = line('milk-row:2');
    const message = last.querySelector('.field-error');
    expect(message.textContent).toBe(sentence);
    expect(last.classList.contains('is-marked')).toBe(true);
    expect(lineField('milk-row:2').getAttribute('aria-invalid')).toBe('true');
    expect(lineField('milk-row:2').getAttribute('aria-describedby')).toBe(message.id);
    expect(line('milk-row:1').querySelector('.field-error')).toBeNull();
    expect(line('milk-row:1').classList.contains('is-marked')).toBe(false);
    expect(lineField('milk-row:1').getAttribute('aria-invalid')).toBeNull();
  });

  it("lets a refused Save's sentence stand over a blur message, with no blur at all", () => {
    mount(splitDraft, new Map([['milk-row:1', 'Enter an amount.']]));
    expect(line('milk-row:1').querySelector('.field-error').textContent).toBe('Enter an amount.');
    expect(line('milk-row:2').querySelector('.field-error')).toBeNull();
  });

  it('a split row with one line left reads as a one-line row with no portion line and the plain label', () => {
    mount(splitDraft);
    act(() => setDraftRef((prev) => toggleStepUses(prev, 2, 'milk-row')));
    expect(line('milk-row:2')).toBeNull();
    expect(lineField('milk-row:1').value).toBe('600');
    expect(lineField('milk-row:1').getAttribute('aria-label')).toBe(`${WHOLE_MILK}, grams`);
    expect(current.container.querySelector('.ingredient-table__portion-note')).toBeNull();
  });
});

describe('IngredientTable, creating: the acts line (STRUCT-01 to STRUCT-03, D-15 to D-17)', () => {
  // Two steps, Warm (milk, sucrose) and Churn (no lead-in, no rows), plus a
  // cream row that no step uses.
  function threeRows() {
    let draft = blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });
    draft = addRow(draft, { rowId: 'milk-row', libraryId: 'wholeMilk' });
    draft = addRow(draft, { rowId: 'sucrose-row', libraryId: 'sucrose' });
    draft = addRow(draft, { rowId: 'cream-row', libraryId: 'heavyCream' });
    for (const id of ['milk-row', 'sucrose-row', 'cream-row']) draft = setLineGrams(draft, id, UNPLACED_STEP, '100');
    draft = addStep(addStep(draft, { afterN: null }), { afterN: 1 });
    draft = setStepField(draft, 1, 'leadIn', 'Warm');
    draft = toggleStepUses(draft, 1, 'milk-row');
    return toggleStepUses(draft, 1, 'sucrose-row');
  }

  const line = (key) => current.container.querySelector(`tr[data-line="${key}"]`);
  const control = (key, name) => line(key).querySelector(`[data-act="${name}"]`);
  const actsText = (key) => line(key).querySelector('.mk-row-acts').textContent;
  const press = (element) => act(() => element.click());
  const firstGroup = () =>
    [...current.container.querySelector('tbody').querySelectorAll('tr[data-line]')].map((row) => row.getAttribute('data-line'));

  it('reads remove, Move up, Move down on each row, and Add to step on a row no step uses once a step exists', () => {
    mount(threeRows);
    expect(actsText('milk-row:1')).toBe('Remove · Move up · Move down');
    expect(actsText('sucrose-row:1')).toBe('Remove · Move up · Move down');
    expect(actsText('cream-row:0')).toBe('Remove · Move up · Move down · Add to step');
    expect(control('cream-row:0', 'add-to-step').getAttribute('aria-label')).toBe('Add Heavy cream, 36% fat to a step');
    expect(line('milk-row:1').querySelector('.ingredient-table__remove-gap')).not.toBeNull();
    for (const button of current.container.querySelectorAll('.mk-row-acts button')) expect(button.getAttribute('tabindex')).toBe('0');
    // The names the board gives.
    expect(control('milk-row:1', 'remove').getAttribute('aria-label')).toBe(`remove ${WHOLE_MILK}`);
    expect(control('milk-row:1', 'move-down').getAttribute('aria-label')).toBe(`Move ${WHOLE_MILK} down`);
  });

  it('offers no Add to step while no step exists', () => {
    mount();
    expect(current.container.querySelector('[data-act="add-to-step"]')).toBeNull();
    expect(actsText('sucrose-row:0')).toBe('Remove · Move up · Move down');
  });

  it("marks the group's first Move up and last Move down off, focusable, and doing nothing", () => {
    mount(threeRows);
    for (const [key, name] of [
      ['milk-row:1', 'move-up'],
      ['sucrose-row:1', 'move-down'],
      ['cream-row:0', 'move-up'],
      ['cream-row:0', 'move-down'],
    ]) {
      const button = control(key, name);
      expect(button.classList.contains('mk-off')).toBe(true);
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.getAttribute('tabindex')).toBe('0');
      press(button);
    }
    expect(current.onMoveRow).not.toHaveBeenCalled();
    // The others in their groups stay on.
    expect(control('milk-row:1', 'move-down').classList.contains('mk-off')).toBe(false);
    expect(control('sucrose-row:1', 'move-up').hasAttribute('aria-disabled')).toBe(false);
  });

  it('a Move asks for its own group and direction, and the table reads the new order', () => {
    mount(threeRows);
    press(control('milk-row:1', 'move-down'));
    expect(current.onMoveRow).toHaveBeenCalledWith('milk-row', 1, 'down');
    expect(firstGroup()).toEqual(['sucrose-row:1', 'milk-row:1']);
  });

  it('the chooser reads Cancel, then one control per step by number and lead-in, Step n alone with no lead-in', () => {
    mount(threeRows);
    press(control('cream-row:0', 'add-to-step'));
    const acts = line('cream-row:0').querySelector('.mk-row-acts');
    expect(acts.classList.contains('mk-row-acts--choosing')).toBe(true);
    expect([...acts.querySelectorAll('button')].map((button) => button.textContent)).toEqual(['Cancel', 'Step 1, Warm', 'Step 2']);
    expect([...acts.querySelectorAll('button')].map((button) => button.getAttribute('aria-label'))).toEqual([
      'Heavy cream, 36% fat, cancel',
      'Add Heavy cream, 36% fat to step 1',
      'Add Heavy cream, 36% fat to step 2',
    ]);
    expect(acts.textContent).toBe('Cancel · Step 1, Warm · Step 2');
    // Opening puts focus on Cancel, after the render that drew it.
    expect(document.activeElement).toBe(control('cream-row:0', 'cancel'));
  });

  it('Cancel and Escape close it and return focus to Add to step; one chooser is open at a time', () => {
    mount(() => {
      const draft = addRow(threeRows(), { rowId: 'salt-row', libraryId: 'salt' });
      return setLineGrams(draft, 'salt-row', UNPLACED_STEP, '2');
    });
    press(control('cream-row:0', 'add-to-step'));
    press(control('salt-row:0', 'add-to-step'));
    expect(current.container.querySelectorAll('.mk-row-acts--choosing')).toHaveLength(1);
    expect(line('salt-row:0').querySelector('.mk-row-acts--choosing')).not.toBeNull();
    expect(line('cream-row:0').querySelector('.mk-row-acts--choosing')).toBeNull();

    press(control('salt-row:0', 'cancel'));
    expect(current.container.querySelector('.mk-row-acts--choosing')).toBeNull();
    expect(document.activeElement).toBe(control('salt-row:0', 'add-to-step'));

    press(control('salt-row:0', 'add-to-step'));
    expect(document.activeElement).toBe(control('salt-row:0', 'cancel'));
    act(() => {
      control('salt-row:0', 'cancel').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(current.container.querySelector('.mk-row-acts--choosing')).toBeNull();
    expect(document.activeElement).toBe(control('salt-row:0', 'add-to-step'));
  });

  it('draws no move, remove or Add to step control on a table that is not the creation editor (STRUCT-04)', () => {
    const version = creationSheetVersion(threeRows(), records);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<IngredientTable rows={version.rows} mode="reading" steps={version.method} />);
    });
    expect(container.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    expect(container.querySelector('.mk-row-acts')).toBeNull();
    expect(container.querySelector('[data-act]')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    act(() => root.unmount());
    container.remove();
  });

  it("choosing a step places the row as that step's last row and closes the chooser", () => {
    mount(threeRows);
    press(control('cream-row:0', 'add-to-step'));
    press(control('cream-row:0', 'choose-1'));
    expect(current.onPlaceRow).toHaveBeenCalledWith('cream-row', 1);
    expect(current.container.querySelector('.mk-row-acts--choosing')).toBeNull();
    expect(firstGroup()).toEqual(['milk-row:1', 'sucrose-row:1', 'cream-row:1']);
  });
});
