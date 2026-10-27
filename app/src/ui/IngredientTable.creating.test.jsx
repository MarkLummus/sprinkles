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
import { creationSheetVersion, addRow, setRowGrams } from '../domain/creation.js';
import { blankCreateDraft } from '../domain/draft.js';
import { addStep, toggleStepUses } from '../domain/creationSteps.js';
import { library } from '../data/library.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const records = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));
const WHOLE_MILK = 'Whole milk, 3.5% fat';

function startingDraft() {
  let draft = blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });
  draft = addRow(draft, { rowId: 'sucrose-row', libraryId: 'sucrose' });
  draft = addRow(draft, { rowId: 'milk-row', libraryId: 'wholeMilk' });
  draft = setRowGrams(draft, 'sucrose-row', '');
  draft = setRowGrams(draft, 'milk-row', 'abc');
  return draft;
}

let current = null;

function mount(initial = startingDraft) {
  const onBlurGrams = vi.fn();
  function Harness() {
    const [draft, setDraft] = useState(initial);
    const version = creationSheetVersion(draft, records);
    const gramsByRow = new Map(draft.rows.map((row) => [row.id, row.portions[0]?.grams ?? '']));
    return (
      <IngredientTable
        rows={version.rows}
        mode="creating"
        steps={version.method}
        creationRows={{
          gramsByRow,
          focusRowId: null,
          onChangeGrams: (rowId, value) => setDraft((prev) => setRowGrams(prev, rowId, value)),
          onBlurGrams,
          onRemoveRow: () => {},
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
  current = { container, root, onBlurGrams };
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
    expect(current.onBlurGrams).toHaveBeenCalledWith('sucrose-row');
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
