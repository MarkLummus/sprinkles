// @vitest-environment jsdom
//
// bug-p11-pen-step-no-preview (Phase 12, plan 12-11; sketch 016 CONTRACT section 7, section 11
// number 6): the version pen's open step offers Preview step, which reads the step as it will read
// from what is typed, and Done and Cancel close the preview with the step. These cases press the
// controls, so they live in jsdom; Method.test.jsx stays the static-markup file in Vitest's node
// environment (renderToStaticMarkup cannot press a button). Method renders no links, so no router
// is needed. The Method here is held by a small stateful page, as RecipePage holds the pen's draft.
import { describe, it, expect, afterEach } from 'vitest';
import { useState } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Method } from './Method.jsx';
import { buildDiff } from '../domain/diff.js';
import { displayNumbers } from '../domain/stepNumbers.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const row = (id, ingredientName, grams) => ({
  id,
  ingredientName,
  portions: [{ step: 1, grams }],
  removed: false,
  ingredient: { composition: {} },
});

// The version the pen opened on: step 1 carries a target, a purpose and an aside; step 2 is plain; step 3
// is live here and removed in the draft the tests make.
function baselineVersion() {
  return {
    versionLabel: 'v1',
    sheetTitle: 'Coffee',
    sheetDescription: 'Strong and cold.',
    targets: {},
    rows: [row('row-a', 'Heavy cream', 400), row('row-b', 'Coffee beans', 40)],
    method: [
      {
        n: 1,
        leadIn: 'Steep',
        instruction: 'Warm the cream with the beans, then strain.',
        targets: [{ label: 'Heat to', value: '82 C' }],
        purpose: 'Pulls the coffee into the cream.',
        aside: 'Do not let it boil.',
        removed: false,
        uses: ['row-a', 'row-b'],
      },
      { n: 2, leadIn: 'Churn', instruction: 'Chill the base, then churn.', removed: false, uses: [] },
      { n: 3, leadIn: 'Serve', instruction: 'Scoop it.', removed: false, uses: [] },
    ],
  };
}

let current = null;

function mount({ removeStep3 = false, swapFirstTwo = false } = {}) {
  const baseline = baselineVersion();
  const initial = structuredClone(baseline);
  if (removeStep3) initial.method[2].removed = true;
  if (swapFirstTwo) initial.method = [initial.method[1], initial.method[0], initial.method[2]];

  function Page() {
    const [draft, setDraft] = useState(initial);
    const edit = (stepN, change) =>
      setDraft((previous) => ({
        ...previous,
        method: previous.method.map((step) => (step.n === stepN ? { ...step, ...change(step) } : step)),
      }));
    return (
      <Method
        steps={baseline.method}
        mode="developing"
        draftVersion={draft}
        baselineVersion={baseline}
        penDiff={buildDiff(draft, baseline)}
        rows={baseline.rows}
        currentStepNumbers={displayNumbers(draft.method)}
        baselineStepNumbers={displayNumbers(baseline.method)}
        onChangePenStepField={(stepN, field, value) => edit(stepN, () => ({ [field]: value }))}
        onChangePenStepTarget={(stepN, index, field, value) =>
          edit(stepN, (step) => ({
            targets: step.targets.map((target, i) => (i === index ? { ...target, [field]: value } : target)),
          }))
        }
        onRestorePenStep={(stepN) =>
          edit(stepN, () => structuredClone(baseline.method.find((step) => step.n === stepN)))
        }
      />
    );
  }

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  act(() => {
    root.render(<Page />);
  });
  return container;
}

const byLabel = (container, label) => container.querySelector(`[aria-label="${label}"]`);

function press(container, label) {
  const control = byLabel(container, label);
  expect(control, `a control named ${label}`).not.toBeNull();
  act(() => {
    control.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function pressWords(container, words) {
  const control = [...container.querySelectorAll('button')].find((button) => button.textContent === words);
  expect(control, `a button reading ${words}`).toBeDefined();
  act(() => {
    control.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function setText(el, text) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, text);
  act(() => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

// The one line that holds a button and no target field: the line Preview step lives on.
const previewLine = (container) =>
  [...container.querySelectorAll('p.method-step__targets')].find((line) => line.querySelector('button'));

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

describe('Method — Preview step on the version pen\'s open step (CONTRACT section 7)', () => {
  it('opens a step with Preview step and no preview block, the line holding that one button before the uses line', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    const line = previewLine(container);
    expect(line).toBeDefined();
    expect(line.querySelectorAll('button')).toHaveLength(1);
    expect(line.textContent).toBe('Preview step');
    expect(byLabel(container, 'Step 1, Preview step')).toBe(line.querySelector('button'));
    expect(container.querySelector('.mk-preview')).toBeNull();
    // Directly before the wrapper of the uses line, which stands after the written purpose and aside.
    expect(line.nextElementSibling.querySelector('p.method-step__uses-line')).not.toBeNull();
    expect(byLabel(container, 'Step 1, aside').compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('draws no Add target and no reorder control in the open step (CONTRACT section 7)', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    const words = [...container.querySelectorAll('button')].map((button) => button.textContent);
    expect(words.some((text) => /add target/i.test(text))).toBe(false);
    // The open step has no Move (sketch 017 README decision 7); the closed steps beside it keep theirs.
    expect(container.querySelector('#method-step-1 [aria-label*="move up" i], #method-step-1 [aria-label*="move down" i]')).toBeNull();
    expect(container.querySelector('#method-step-2 [aria-label="Step 2, move up"]')).not.toBeNull();
  });

  it('Tab order: the instruction, the purpose and aside fields, Preview step, then Change ingredients', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    const stops = [...container.querySelectorAll('textarea, button')].map((el) => el.getAttribute('aria-label') ?? el.textContent);
    const at = (name) => stops.indexOf(name);
    expect(at('Step 1, instruction')).toBeGreaterThan(-1);
    expect(at('Step 1, aside')).toBeGreaterThan(at('Step 1, purpose'));
    expect(at('Step 1, Preview step')).toBeGreaterThan(at('Step 1, aside'));
    expect(at('Step 1, change ingredients')).toBe(at('Step 1, Preview step') + 1);
  });

  it('pressed, it reads Hide preview and the preview block stands directly under its line, reading the typed step', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    press(container, 'Step 1, Preview step');
    const line = previewLine(container);
    expect(line.textContent).toBe('Hide preview');
    expect(byLabel(container, 'Step 1, Hide preview')).toBe(line.querySelector('button'));
    expect(byLabel(container, 'Step 1, Preview step')).toBeNull();

    const block = line.nextElementSibling;
    expect(block.classList.contains('mk-preview')).toBe(true);
    expect(block.getAttribute('role')).toBe('group');
    expect(block.getAttribute('aria-label')).toBe('Step 1, preview');
    expect(block.querySelector('p.mk-preview__cue').textContent).toBe('Preview');
    const reading = block.querySelector('ol.method-steps > li.method-step');
    expect(reading.querySelector('.method-step__n').textContent).toBe('1');
    expect(reading.querySelector('.method-step__lead').textContent).toBe('Steep. Warm the cream with the beans, then strain.');
    expect(reading.querySelector('.method-step__targets--tags').textContent).toContain('Heat to');
    expect(reading.querySelector('.method-step__targets--tags').textContent).toContain('82 C');
    expect(reading.querySelector('.method-step__purpose').textContent).toContain('Pulls the coffee into the cream.');
    expect(reading.querySelector('.method-step__aside').textContent).toBe('Do not let it boil.');
    // The uses line stands directly after the block.
    expect(block.nextElementSibling.querySelector('p.method-step__uses-line')).not.toBeNull();
  });

  it('reads what is typed as it is typed', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    press(container, 'Step 1, Preview step');
    setText(byLabel(container, 'Step 1, lead-in'), 'Infuse');
    expect(container.querySelector('.mk-preview .method-step__lead').textContent).toBe(
      'Infuse. Warm the cream with the beans, then strain.',
    );
  });

  it('Hide preview takes the block away and the control reads Preview step again', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    press(container, 'Step 1, Preview step');
    press(container, 'Step 1, Hide preview');
    expect(container.querySelector('.mk-preview')).toBeNull();
    expect(previewLine(container).textContent).toBe('Preview step');
  });

  it('Done closes the preview with the step: opened again, it reads Preview step and shows no block', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    press(container, 'Step 1, Preview step');
    expect(container.querySelector('.mk-preview')).not.toBeNull();
    pressWords(container, 'Done');
    expect(container.querySelector('.mk-preview')).toBeNull();
    expect(previewLine(container)).toBeUndefined();
    press(container, 'Step 1, edit this step');
    expect(previewLine(container).textContent).toBe('Preview step');
    expect(byLabel(container, 'Step 1, Hide preview')).toBeNull();
    expect(container.querySelector('.mk-preview')).toBeNull();
  });

  it('Cancel closes the preview with the step: opened again, it reads Preview step and shows no block', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    press(container, 'Step 1, Preview step');
    setText(byLabel(container, 'Step 1, lead-in'), 'Infuse');
    pressWords(container, 'Cancel');
    expect(container.querySelector('.mk-preview')).toBeNull();
    press(container, 'Step 1, edit this step');
    expect(previewLine(container).textContent).toBe('Preview step');
    expect(container.querySelector('.mk-preview')).toBeNull();
    // Cancel put the step back, so a fresh preview reads the restored words, never the cancelled ones.
    press(container, 'Step 1, Preview step');
    expect(container.querySelector('.mk-preview .method-step__lead').textContent).toBe(
      'Steep. Warm the cream with the beans, then strain.',
    );
  });

  it('Cancel still leaves focus on Edit this step: the Preview step line did not shift the open form off the closed form\'s child positions', () => {
    const container = mount();
    const edit = byLabel(container, 'Step 1, edit this step');
    act(() => edit.focus());
    press(container, 'Step 1, edit this step');
    const cancel = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Cancel');
    act(() => cancel.focus());
    pressWords(container, 'Cancel');
    expect(document.activeElement).toBe(byLabel(container, 'Step 1, edit this step'));
  });

  it('a step opened while another has its preview shown opens with its own Preview step (one step at a time)', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    press(container, 'Step 1, Preview step');
    press(container, 'Step 2, edit this step');
    expect(container.querySelector('.mk-preview')).toBeNull();
    expect(byLabel(container, 'Step 2, Preview step')).not.toBeNull();
    expect(byLabel(container, 'Step 1, Hide preview')).toBeNull();
  });

  it('a removed step opened in the pen draws no Preview step and no preview block (review item 13)', () => {
    const container = mount({ removeStep3: true });
    press(container, 'Removed step 3, edit this step');
    expect(byLabel(container, 'Removed step 3, lead-in')).not.toBeNull();
    expect(previewLine(container)).toBeUndefined();
    expect(container.textContent).not.toContain('Preview step');
    expect(container.textContent).not.toContain('Hide preview');
    expect(container.querySelector('.mk-preview')).toBeNull();
  });

  it('the preview of a live step after a step is removed carries that step\'s current number, not its baseline one', () => {
    const container = mount({ removeStep3: true });
    press(container, 'Step 2, edit this step');
    press(container, 'Step 2, Preview step');
    expect(container.querySelector('.mk-preview .method-step__n').textContent).toBe('2');
  });
});

// Sketch 017 CONTRACT section 5, choice A: the open step says "was step N" last in its fields, where
// " removed" stands, before the line of target chips (undrawn state 1: the board draws no step with
// targets), and Preview step, which reads the step as it will read, carries no mark.
describe("Method - the 'was step N' mark on the pen's open step (sketch 017 CONTRACT section 5)", () => {
  const SKIPPED = 'span.method-step__skipped-label';

  it('P1: an open step with targets says was step N after its fields and before the target chips', () => {
    const container = mount({ swapFirstTwo: true });
    press(container, 'Step 2, edit this step');
    const fields = container.querySelector('#method-step-1 .method-step__open-fields');
    const marks = fields.querySelectorAll(SKIPPED);
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe(' was step 1');
    const instruction = byLabel(container, 'Step 2, instruction').closest('label');
    const chips = fields.querySelector('p.method-step__targets');
    expect(chips.querySelector('.target-chip')).not.toBeNull();
    expect(instruction.compareDocumentPosition(marks[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(marks[0].compareDocumentPosition(chips) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector(`#method-step-2 p.method-step__lead ${SKIPPED}`).textContent).toBe(' was step 2');
  });

  it('P2: Preview step on that open step carries no mark', () => {
    const container = mount({ swapFirstTwo: true });
    press(container, 'Step 2, edit this step');
    press(container, 'Step 2, Preview step');
    const preview = container.querySelector('.mk-preview');
    expect(preview).not.toBeNull();
    expect(preview.textContent).not.toMatch(/was step/i);
  });

  it('P3: in the opened order, an open step draws no mark', () => {
    const container = mount();
    press(container, 'Step 1, edit this step');
    expect(container.querySelectorAll(SKIPPED)).toHaveLength(0);
  });
});
