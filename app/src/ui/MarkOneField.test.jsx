// @vitest-environment jsdom
//
// MarkOneField — the pen's two-option "mark one" control (sketch 010 D6 to
// D14; CONTRACT section 7): At draw and From freezer. jsdom, mounted through
// React's real render cycle like controls.test.jsx, since the keyboard Clear
// moves focus.
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MarkOneField, MARK_ONE_OFF_REASON } from './MarkOneField.jsx';
import { MARK_ONE_OPTIONS } from '../domain/battery.js';

function mount(element) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return {
    container,
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

const radios = (container) => [...container.querySelectorAll('input[type="radio"]')];

describe('MarkOneField', () => {
  it('words the reason exactly as the sketch draws it', () => {
    expect(MARK_ONE_OFF_REASON).toBe('Clear marks below to choose.');
  });

  it('blank: two enabled radios in Mark\'s words, none checked, no Clear, no reason', () => {
    const { container, unmount } = mount(
      <MarkOneField field="atDraw" label="At draw" value="" onChange={() => {}} onClear={() => {}} />,
    );
    const inputs = radios(container);
    expect(inputs.map((input) => input.value)).toEqual(MARK_ONE_OPTIONS);
    expect(inputs.map((input) => input.value)).toEqual(['Nothing to note', 'Not evaluated']);
    expect(inputs.every((input) => !input.checked && !input.disabled)).toBe(true);
    expect(container.querySelector('.segmented-field__clear')).toBeNull();
    expect(container.querySelector('.mo-hint')).toBeNull();
    expect(container.querySelector('.is-off')).toBeNull();
    unmount();
  });

  it('heads the group with its name in the group-cue face and labels the radiogroup by it', () => {
    const { container, unmount } = mount(
      <MarkOneField field="fromFreezer" label="From freezer" value="" onChange={() => {}} onClear={() => {}} />,
    );
    const group = container.querySelector('.mo-group');
    expect(group.getAttribute('data-mo')).toBe('fromfreezer');
    const caption = container.querySelector('.segmented-field__caption');
    expect(caption.tagName).toBe('H3');
    expect(caption.className).toBe('segmented-field__caption pen-caption axes-cue');
    expect(caption.textContent).toBe('From freezer');
    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup.getAttribute('aria-labelledby')).toBe(caption.id);
    unmount();
  });

  it('a value: that option is checked and Clear shows with its own aria-label', () => {
    const { container, unmount } = mount(
      <MarkOneField field="atDraw" label="At draw" value="Not evaluated" onChange={() => {}} onClear={() => {}} />,
    );
    expect(radios(container).map((input) => input.checked)).toEqual([false, true]);
    const clear = container.querySelector('.segmented-field__clear');
    expect(clear.textContent).toBe('Clear');
    expect(clear.getAttribute('aria-label')).toBe('Clear At draw');
    unmount();
  });

  it('a tap calls onChange with the option, including the already picked one (the parent keeps it)', () => {
    const onChange = vi.fn();
    const { container, unmount } = mount(
      <MarkOneField field="atDraw" label="At draw" value="Not evaluated" onChange={onChange} onClear={() => {}} />,
    );
    const [first, second] = radios(container);
    act(() => first.click());
    expect(onChange).toHaveBeenLastCalledWith('Nothing to note');
    act(() => second.click());
    expect(onChange).toHaveBeenLastCalledWith('Not evaluated');
    unmount();
  });

  it('off: two disabled radios, none checked, the is-off class, and exactly the reason beside the name; no Clear', () => {
    const { container, unmount } = mount(
      <MarkOneField field="atDraw" label="At draw" value="" off onChange={() => {}} onClear={() => {}} />,
    );
    const inputs = radios(container);
    expect(inputs).toHaveLength(2);
    expect(inputs.every((input) => input.disabled && !input.checked)).toBe(true);
    expect(container.querySelectorAll('.segmented__option.is-off')).toHaveLength(2);
    const hint = container.querySelector('.mo-hint');
    expect(hint.textContent).toBe('Clear marks below to choose.');
    expect(container.querySelector('.segmented-field__head').contains(hint)).toBe(true);
    expect(container.querySelector('.segmented-field__clear')).toBeNull();
    unmount();
  });

  it('off wins over a stray value: nothing is checked and there is no Clear (a pick never sits beside a mark)', () => {
    const { container, unmount } = mount(
      <MarkOneField field="fromFreezer" label="From freezer" value="Nothing to note" off onChange={() => {}} onClear={() => {}} />,
    );
    expect(radios(container).some((input) => input.checked)).toBe(false);
    expect(container.querySelector('.segmented-field__clear')).toBeNull();
    unmount();
  });

  it('off options carry tabindex 0 through the shared Radio, and are out of the Tab order by being disabled', () => {
    const { container, unmount } = mount(
      <MarkOneField field="atDraw" label="At draw" value="" off onChange={() => {}} onClear={() => {}} />,
    );
    for (const input of radios(container)) {
      expect(input.getAttribute('tabindex')).toBe('0');
      expect(input.disabled).toBe(true);
    }
    unmount();
  });

  it('a keyboard Clear (event.detail 0) calls onClear and focuses the first option; a mouse Clear leaves focus', () => {
    const onClear = vi.fn();
    const { container, unmount } = mount(
      <MarkOneField field="atDraw" label="At draw" value="Not evaluated" onChange={() => {}} onClear={onClear} />,
    );
    const clear = container.querySelector('.segmented-field__clear');
    const first = radios(container)[0];

    act(() => {
      clear.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    });
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(first);

    act(() => {
      clear.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    });
    expect(onClear).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(first);
    unmount();
  });
});
