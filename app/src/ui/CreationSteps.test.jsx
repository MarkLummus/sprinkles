// @vitest-environment jsdom
//
// The creation editor's Instructions steps (Phase 11 plan 06, MAKE-07, sketch
// 014 instructions-steps.html): the heading row, the open step with its
// targets, purpose and aside, and Preview step. CreationSteps is held by a
// small state wrapper that applies the domain ops the way CreationPage does,
// over a draft that carries steps; the focus the page leaves after an add or a
// remove is proven in CreationFlow.test.jsx.
import { useState } from 'react';
import { act } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { CreationSteps } from './CreationSteps.jsx';
import { blankCreateDraft } from '../domain/draft.js';
import { addRow, creationSheetVersion } from '../domain/creation.js';
import { library } from '../data/library.js';
import { addStep, addTarget, removeTarget, setStepField, setTarget, toggleStepUses } from '../domain/creationSteps.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const records = new Map(Object.entries(library).map(([id, entry]) => [id, { id, entry }]));

const blank = () => blankCreateDraft({ recipeId: 'r1', versionId: 'v1', name: 'Vanilla' });

function withStep(draft, fields = {}, targets = []) {
  let next = addStep(draft, { afterN: null });
  const n = next.method[0].n;
  for (const [field, value] of Object.entries(fields)) next = setStepField(next, n, field, value);
  for (const [label, value] of targets) {
    next = addTarget(next, n);
    const index = next.method[0].targets.length - 1;
    next = setTarget(next, n, index, 'label', label);
    next = setTarget(next, n, index, 'value', value);
  }
  return next;
}

let current = null;
let held = null;

function Holder({ initial, spies, saveMessages = null }) {
  const [draft, setDraft] = useState(initial);
  held = draft;
  const version = creationSheetVersion(draft, records);
  return (
    <CreationSteps
      draft={draft}
      version={version}
      saveMessages={saveMessages}
      onAddStep={(afterN) => setDraft((prev) => addStep(prev, { afterN }))}
      onChangeStepField={(n, field, value) => setDraft((prev) => setStepField(prev, n, field, value))}
      onAddTarget={(n) => setDraft((prev) => addTarget(prev, n))}
      onChangeTarget={(n, index, side, value) => setDraft((prev) => setTarget(prev, n, index, side, value))}
      onRemoveTarget={(n, index) => {
        spies?.onRemoveTarget?.(n, index);
        setDraft((prev) => removeTarget(prev, n, index));
      }}
      onToggleUses={(n, rowId) => setDraft((prev) => toggleStepUses(prev, n, rowId))}
    />
  );
}

function mount(initial, spies, saveMessages = null) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  act(() => {
    root.render(<Holder initial={initial} spies={spies} saveMessages={saveMessages} />);
  });
  return container;
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
  held = null;
});

const q = (selector) => current.container.querySelector(selector);
const qa = (selector) => [...current.container.querySelectorAll(selector)];
const field = (label) => q(`[aria-label="${label}"]`);
const setter = (input) => Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;

function type(input, value) {
  act(() => {
    setter(input).call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function press(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

const targetsLine = () => q('p.method-step__targets');

describe('the heading row', () => {
  it('draws Instructions with Add step and no list while the draft holds no step', () => {
    mount(blank());
    const row = q('div.mk-head-row');
    expect(row.querySelector('h2.region-name').textContent).toBe('Instructions');
    expect(row.querySelector('button.text-control.mk-head-act').textContent).toBe('Add step');
    expect(q('ol.method-steps')).toBeNull();
  });
});

describe('the open step (sketch 014 pB1)', () => {
  it('names its two fields and stands Required under each while empty', () => {
    mount(withStep(blank()));
    expect(field('Step 1, lead-in').classList.contains('prose-field--lead-in')).toBe(true);
    expect(field('Step 1, instruction').getAttribute('rows')).toBe('2');
    expect(qa('.mk-step > .method-step__body > .method-step__field .field-requirement')).toHaveLength(2);
    type(field('Step 1, lead-in'), 'Warm the milk');
    expect(qa('.field-requirement')).toHaveLength(1);
    type(field('Step 1, instruction'), 'Heat it.');
    expect(qa('.field-requirement')).toHaveLength(0);
  });

  it('numbers each step by its place, and no box carries the step number to a screen reader', () => {
    const draft = addStep(withStep(blank(), { leadIn: 'Second', instruction: 'x' }), { afterN: null });
    mount(draft);
    expect(qa('li.mk-step > .method-step__n').map((node) => [node.textContent, node.getAttribute('aria-hidden')])).toEqual([
      ['1', 'true'],
      ['2', 'true'],
    ]);
    expect(field('Step 2, lead-in').value).toBe('Second');
  });

  it('the targets line of a step with no target holds Add target and Preview step', () => {
    mount(withStep(blank()));
    expect([...targetsLine().children].map((node) => node.textContent)).toEqual(['Add target', 'Preview step']);
    expect(targetsLine().querySelector('.target-chip')).toBeNull();
  });
});

describe('targets (D-10, D-22)', () => {
  it('a step with one target names its fields as the board does, a step with several by place', () => {
    mount(withStep(blank(), {}, [['temp', '85 °C']]));
    expect(field('Step 1, target label').value).toBe('temp');
    expect(field('Step 1, target value').value).toBe('85 °C');
    press(field('Step 1, add a target'));
    expect(field('Step 1, target 1 label').value).toBe('temp');
    expect(field('Step 1, target 2 label').value).toBe('');
    expect(field('Step 1, target 2 value')).not.toBeNull();
    expect(field('Step 1, target label')).toBeNull();
  });

  it('a one-sided target shows Required under its empty side, a target blank on both sides shows none', () => {
    mount(withStep(blank(), {}, [['', '']]));
    const chip = () => q('.target-chip');
    expect(chip().querySelectorAll('.field-requirement')).toHaveLength(0);
    type(field('Step 1, target label'), 'temp');
    expect(chip().querySelectorAll('.field-requirement')).toHaveLength(1);
    expect(chip().querySelector('.target-chip__value-field + .field-requirement')).not.toBeNull();
    type(field('Step 1, target value'), '85 °C');
    expect(chip().querySelectorAll('.field-requirement')).toHaveLength(0);
    type(field('Step 1, target label'), '');
    expect(chip().querySelector('.target-chip__label-field + .field-requirement')).not.toBeNull();
    expect(chip().querySelector('.target-chip__value-field + .field-requirement')).toBeNull();
  });

  it('the remove control sits inside its own chip, after the value field, and the line keeps Add target and Preview step as its direct controls', () => {
    const removed = vi.fn();
    mount(withStep(blank(), {}, [['temp', '85 °C'], ['hold', '5 min']]), { onRemoveTarget: removed });
    const chips = qa('p.method-step__targets > .target-chip');
    expect(chips).toHaveLength(2);
    const second = chips[1];
    const remove = second.querySelector('button');
    expect(remove.textContent).toBe('remove');
    expect(remove.getAttribute('aria-label')).toBe('Step 1, remove target 2');
    expect(remove.getAttribute('tabindex')).toBe('0');
    expect(remove.previousElementSibling).toBe(second.querySelector('.target-chip__value-field'));
    expect([...targetsLine().querySelectorAll(':scope > .text-control')].map((node) => node.textContent)).toEqual([
      'Add target',
      'Preview step',
    ]);
    press(remove);
    expect(removed).toHaveBeenCalledWith(held.method[0].n, 1);
    expect(held.method[0].targets).toEqual([{ label: 'temp', value: '85 °C' }]);
  });
});

describe('purpose and aside on demand', () => {
  it('offers add a purpose and add an aside while closed, a middot before each, and opens each into its field', () => {
    mount(withStep(blank()));
    const line = q('p.method-step__uses-line');
    expect(line.textContent).toContain('uses nothing yet');
    expect([...line.querySelectorAll('button')].map((node) => node.textContent)).toEqual([
      'change the ingredients',
      'add a purpose',
      'add an aside',
    ]);
    expect([...line.querySelectorAll('span[aria-hidden="true"]')].map((node) => node.textContent)).toEqual(['·', '·']);
    press(field('Step 1, add a purpose'));
    expect(field('Step 1, purpose').getAttribute('rows')).toBe('2');
    expect(field('Step 1, add a purpose')).toBeNull();
    expect(document.activeElement).toBe(field('Step 1, purpose'));
    expect(line.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(1);
    // An empty purpose closes when the maker leaves it (Method's own rule), so
    // the aside is opened after the purpose has words.
    type(field('Step 1, purpose'), 'Dissolves.');
    press(field('Step 1, add an aside'));
    expect(field('Step 1, aside')).not.toBeNull();
    expect([...line.querySelectorAll('button')].map((node) => node.textContent)).toEqual(['change the ingredients']);
    expect(line.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  it('draws the fields open for a step that already holds a purpose and an aside, and an empty blur closes one', () => {
    mount(withStep(blank(), { purpose: 'Dissolves.', aside: 'Whisk slowly.' }));
    expect(field('Step 1, purpose').value).toBe('Dissolves.');
    expect(field('Step 1, aside').value).toBe('Whisk slowly.');
    type(field('Step 1, aside'), '');
    act(() => {
      field('Step 1, aside').dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
      field('Step 1, aside').blur();
    });
    expect(held.method[0].aside).toBe('');
  });

  it("names the rows the step uses on the uses line, in the step's own order, not the table's", () => {
    let draft = withStep(blank());
    draft = addRow(draft, { rowId: 'row-cream', libraryId: 'heavyCream' });
    draft = addRow(draft, { rowId: 'row-milk', libraryId: 'wholeMilk' });
    const n = draft.method[0].n;
    draft = toggleStepUses(toggleStepUses(draft, n, 'row-milk'), n, 'row-cream');
    mount(draft);
    expect(q('p.method-step__uses-line').textContent.startsWith('uses Whole milk, 3.5% fat, Heavy cream, 36% fat')).toBe(true);
    // The checklist lists the rows as the table does, whatever the step's order.
    press(field('Step 1, change the ingredients'));
    expect(qa('label.method-step__uses-item span').map((node) => node.textContent)).toEqual([
      'Heavy cream, 36% fat',
      'Whole milk, 3.5% fat',
    ]);
  });
});

describe('the Uses checklist (sketch 014 pC1, CONTRACT section 2)', () => {
  const twoRows = () => {
    let draft = withStep(blank());
    draft = addRow(draft, { rowId: 'row-cream', libraryId: 'heavyCream' });
    draft = addRow(draft, { rowId: 'row-milk', libraryId: 'wholeMilk' });
    return draft;
  };

  it('reads change the ingredients while closed and done while open, and the checklist has the legend Uses', () => {
    mount(twoRows());
    const toggle = field('Step 1, change the ingredients');
    expect(toggle.textContent).toBe('change the ingredients');
    expect(q('fieldset.method-step__uses')).toBeNull();
    press(toggle);
    expect(field('Step 1, done').textContent).toBe('done');
    expect(field('Step 1, change the ingredients')).toBeNull();
    const fieldset = q('fieldset.method-step__uses');
    expect(fieldset.getAttribute('aria-label')).toBe('Step 1, uses');
    expect(fieldset.querySelector('legend').textContent).toBe('Uses');
    expect(qa('fieldset.method-step__uses input[type="checkbox"]')).toHaveLength(2);
    press(field('Step 1, done'));
    expect(q('fieldset.method-step__uses')).toBeNull();
  });

  it('ticking a row makes the step use it, joining the end of its uses, and unticking drops it', () => {
    mount(twoRows());
    press(field('Step 1, change the ingredients'));
    const [cream, milk] = qa('label.method-step__uses-item input');
    expect([cream.checked, milk.checked]).toEqual([false, false]);
    press(milk);
    press(cream);
    expect(held.method[0].uses).toEqual(['row-milk', 'row-cream']);
    expect(q('p.method-step__uses-line').textContent.startsWith('uses Whole milk, 3.5% fat, Heavy cream, 36% fat')).toBe(true);
    expect(qa('label.method-step__uses-item input').map((box) => box.checked)).toEqual([true, true]);
    press(qa('label.method-step__uses-item input')[0]);
    expect(held.method[0].uses).toEqual(['row-milk']);
    expect(q('p.method-step__uses-line').textContent.startsWith('uses Whole milk, 3.5% fat ')).toBe(true);
  });

  it('closes on Escape from the checklist or the uses line and returns focus to the toggle', () => {
    mount(twoRows());
    press(field('Step 1, change the ingredients'));
    const box = q('label.method-step__uses-item input');
    act(() => {
      box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(q('fieldset.method-step__uses')).toBeNull();
    expect(document.activeElement).toBe(field('Step 1, change the ingredients'));
    // A closed checklist lets Escape travel on.
    const seen = vi.fn();
    document.addEventListener('keydown', seen);
    act(() => {
      field('Step 1, change the ingredients').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    document.removeEventListener('keydown', seen);
    expect(seen).toHaveBeenCalledTimes(1);
  });
});

describe('Preview step (sketch 013 decision 34, decision 014 2)', () => {
  const full = () =>
    withStep(blank(), { leadIn: 'Warm the milk', instruction: 'Heat it.', purpose: 'Dissolves.', aside: 'Whisk slowly.' }, [['temp', '85 °C']]);

  it('reads Hide preview while open and draws the step as the Sheet shows it, after the aside field and before the uses line', () => {
    mount(full());
    expect(q('.mk-preview')).toBeNull();
    press(field('Step 1, preview the step'));
    expect(field('Step 1, hide the preview').textContent).toBe('Hide preview');
    expect([...targetsLine().querySelectorAll(':scope > .text-control')].map((node) => node.textContent)).toEqual([
      'Add target',
      'Hide preview',
    ]);
    const preview = q('.mk-preview');
    expect(preview.getAttribute('role')).toBe('group');
    expect(preview.getAttribute('aria-label')).toBe('Step 1, preview');
    expect(preview.querySelector('p.mk-preview__cue').textContent).toBe('Preview');
    const reading = preview.querySelector('ol.method-steps > li.method-step');
    expect(reading.querySelector('.method-step__lead').textContent).toBe('Warm the milk. Heat it.');
    expect([...reading.querySelectorAll('.target-chip > span')].map((node) => node.textContent)).toEqual(['temp', '85 °C']);
    expect(reading.querySelector('.method-step__purpose').textContent).toBe('why — Dissolves.');
    expect(reading.querySelector('.method-step__aside').textContent).toBe('Whisk slowly.');
    expect(preview.previousElementSibling).toBe(field('Step 1, aside').closest('label'));
    expect(preview.nextElementSibling).toBe(q('p.method-step__uses-line'));
    press(field('Step 1, hide the preview'));
    expect(q('.mk-preview')).toBeNull();
    expect(field('Step 1, preview the step').textContent).toBe('Preview step');
  });

  it('leaves a one-sided target out of the preview, as the Sheet does', () => {
    mount(withStep(blank(), { leadIn: 'Warm', instruction: 'Heat.' }, [['temp', '']]));
    press(field('Step 1, preview the step'));
    expect(q('.mk-preview .target-chip')).toBeNull();
  });

  it('renders typed markup as text, never as elements (T-11-18)', () => {
    mount(full());
    type(field('Step 1, lead-in'), '<b>&amp;');
    type(field('Step 1, aside'), '<i>x</i>');
    press(field('Step 1, preview the step'));
    const preview = q('.mk-preview');
    expect(preview.querySelector('.method-step__lead').textContent).toContain('<b>&amp;');
    expect(preview.querySelector('b b')).toBeNull();
    expect(preview.querySelector('.method-step__aside i')).toBeNull();
    expect(preview.querySelector('.method-step__aside').textContent).toBe('<i>x</i>');
  });
});

describe("a refused Save's messages (MAKE-10, D-10, D-11, T-11-32)", () => {
  it('puts Required as a field-error under the named fields, invalid and described by it, and leaves the others quiet', () => {
    const draft = withStep(blank(), { leadIn: '', instruction: '' }, [['temp', '']]);
    const messages = new Map([
      ['lead:1', 'Required'],
      ['target:1:0:value', 'Required'],
    ]);
    mount(draft, null, messages);

    const lead = field('Step 1, lead-in');
    expect(lead.getAttribute('aria-invalid')).toBe('true');
    expect(lead.getAttribute('aria-describedby')).toBe('create-step-1-lead-error');
    const leadMessage = q('#create-step-1-lead-error');
    expect(leadMessage.className).toBe('field-error');
    expect(leadMessage.textContent).toBe('Required');
    expect(lead.closest('label').contains(leadMessage)).toBe(true);

    const value = field('Step 1, target value');
    expect(value.getAttribute('aria-invalid')).toBe('true');
    expect(value.getAttribute('aria-describedby')).toBe('create-step-1-target-0-value-error');
    expect(q('#create-step-1-target-0-value-error').textContent).toBe('Required');

    // The instruction and the target label were not refused: no error, no
    // aria-invalid, and the quiet guidance is still the aria-hidden one.
    expect(field('Step 1, instruction').getAttribute('aria-invalid')).toBeNull();
    expect(field('Step 1, instruction').getAttribute('aria-describedby')).toBeNull();
    expect(q('#create-step-1-instruction-error')).toBeNull();
    expect(field('Step 1, target label').getAttribute('aria-invalid')).toBeNull();
    const quiet = qa('.field-requirement');
    expect(quiet.length).toBeGreaterThan(0);
    expect(quiet.every((node) => node.getAttribute('aria-hidden') === 'true')).toBe(true);
    // An error replaces the quiet Required in its place: never two lines.
    expect(lead.closest('label').querySelector('.field-requirement')).toBeNull();
  });

  it('a step with no message draws exactly what it drew before', () => {
    mount(withStep(blank()), null, new Map());
    expect(qa('.field-error')).toHaveLength(0);
    expect(qa('[aria-invalid]')).toHaveLength(0);
    expect(qa('.field-requirement')).toHaveLength(2);
  });

  it('names the instruction and the label side by their block ids', () => {
    mount(withStep(blank(), {}, [['', '85']]), null, new Map([['instruction:1', 'Required'], ['target:1:0:label', 'Required']]));
    expect(field('Step 1, instruction').getAttribute('aria-describedby')).toBe('create-step-1-instruction-error');
    expect(field('Step 1, target label').getAttribute('aria-describedby')).toBe('create-step-1-target-0-label-error');
    expect(q('#create-step-1-target-0-label-error').className).toBe('field-error');
  });
});
