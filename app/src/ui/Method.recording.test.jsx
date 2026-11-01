// @vitest-environment jsdom
//
// bug-ipad-tab-lost-from-single-line-fields: a step's Done differently line, in the batch
// pen, is a one-row textarea (iPadOS 27 Safari drops a hardware Tab from every input element),
// with Return held and a pasted line break removed before the record draft sees the value. It
// still opens from its opener, focuses on open, and closes back to the opener on an empty blur.
// jsdom, because renderToStaticMarkup drops handlers and focus; a sibling of Method.test.jsx,
// which runs in the node environment. Method renders no links, so no router is needed.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useState } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Method } from './Method.jsx';
import { displayNumbers } from '../domain/stepNumbers.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const step = { n: 1, leadIn: 'Chill', instruction: 'Cool the base overnight.' };
const LABEL = 'Step 1, done differently';

let current = null;

// A small stateful wrapper: holds stepChanges as RecipePage's draft does, and records each call.
function mount(initialChanges = {}) {
  const spy = vi.fn();
  function Harness() {
    const [stepChanges, setStepChanges] = useState(initialChanges);
    return (
      <Method
        steps={[step]}
        stepChanges={stepChanges}
        currentStepNumbers={displayNumbers([step])}
        mode="recording"
        onChangeStepChange={(n, change) => {
          spy(n, change);
          setStepChanges((previous) => ({ ...previous, [n]: change }));
        }}
      />
    );
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  current = { container, root };
  act(() => {
    root.render(<Harness />);
  });
  return { container, spy };
}

const opener = (container) => container.querySelector(`button[aria-label="${LABEL}"]`);
const line = (container) => container.querySelector(`.method-step__line-control [aria-label="${LABEL}"]`);

function setText(el, text) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, text);
  act(() => {
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function open(container) {
  act(() => {
    opener(container).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
  return line(container);
}

afterEach(() => {
  if (!current) return;
  act(() => current.root.unmount());
  current.container.remove();
  current = null;
});

describe('Method — Done differently is a one-row textarea (bug-ipad-tab-lost-from-single-line-fields)', () => {
  it('shows the opener and no line field with no line; pressing the opener renders a TEXTAREA with rows 1, class prose-field and no type, and focuses it', () => {
    const { container } = mount();
    expect(opener(container)).not.toBeNull();
    expect(line(container)).toBeNull();
    const field = open(container);
    expect(field.tagName).toBe('TEXTAREA');
    expect(field.getAttribute('rows')).toBe('1');
    expect(field.getAttribute('class')).toBe('prose-field');
    expect(field.hasAttribute('type')).toBe(false);
    expect(document.activeElement).toBe(field);
  });

  it('holds Return: a cancelable Enter keydown is default-prevented, with or without Shift, and the value is unchanged', () => {
    const { container } = mount({ 1: { struck: false, line: 'Cooled overnight' } });
    const field = line(container);
    for (const shiftKey of [false, true]) {
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey, bubbles: true, cancelable: true });
      act(() => {
        field.dispatchEvent(event);
      });
      expect(event.defaultPrevented).toBe(true);
    }
    expect(field.value).toBe('Cooled overnight');
  });

  it("strips a pasted line break before the draft sees the line: 'Used', LF, ' vanilla' is 'Used vanilla'", () => {
    const { container, spy } = mount();
    const field = open(container);
    setText(field, 'Used\n vanilla');
    expect(spy).toHaveBeenLastCalledWith(1, { struck: false, line: 'Used vanilla' });
  });

  it('closes back to its opener on an empty blur, and the draft line is null', () => {
    const { container, spy } = mount();
    open(container);
    act(() => {
      line(container).blur();
    });
    expect(line(container)).toBeNull();
    expect(opener(container)).not.toBeNull();
    expect(spy).toHaveBeenLastCalledWith(1, { struck: false, line: null });
  });

  it('stays open on a blur while it holds text', () => {
    const { container } = mount();
    const field = open(container);
    setText(field, 'Cooled overnight');
    act(() => {
      field.blur();
    });
    expect(line(container)).not.toBeNull();
    expect(opener(container)).toBeNull();
  });

  it('opens with the line, with no click, when the step already holds one (what Correct opens)', () => {
    const { container } = mount({ 1: { struck: false, line: 'Used vanilla instead' } });
    const field = line(container);
    expect(field.tagName).toBe('TEXTAREA');
    expect(field.value).toBe('Used vanilla instead');
    expect(opener(container)).toBeNull();
  });
});
