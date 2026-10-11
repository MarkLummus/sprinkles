// @vitest-environment jsdom
//
// The three shared controls (D-19): Button, Checkbox and Radio each render one
// native element that is always an explicit Tab stop, whatever a caller passes.
// jsdom, mounted through React's real render cycle, like useFold.reset.test.jsx.
import { describe, it, expect } from 'vitest';
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './Button.jsx';
import { Checkbox } from './Checkbox.jsx';
import { Radio } from './Radio.jsx';

function mount(element) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return {
    node: container.firstElementChild,
    unmount() {
      act(() => root.unmount());
      container.remove();
    },
  };
}

describe('Button', () => {
  it('renders one button with tabindex="0" and type="button" by default', () => {
    const { node, unmount } = mount(<Button>Go</Button>);
    expect(node.tagName).toBe('BUTTON');
    expect(node.getAttribute('tabindex')).toBe('0');
    expect(node.getAttribute('type')).toBe('button');
    expect(node.textContent).toBe('Go');
    unmount();
  });

  it('keeps tabindex="0" when a caller passes tabIndex={-1}', () => {
    const { node, unmount } = mount(<Button tabIndex={-1}>Go</Button>);
    expect(node.outerHTML).toContain('tabindex="0"');
    expect(node.getAttribute('tabindex')).toBe('0');
    unmount();
  });

  it('honours type="submit"', () => {
    const { node, unmount } = mount(<Button type="submit">Go</Button>);
    expect(node.getAttribute('type')).toBe('submit');
    unmount();
  });

  it('passes disabled, className, aria-label and aria-pressed through', () => {
    const { node, unmount } = mount(
      <Button disabled className="notebook-action" aria-label="Clear Body" aria-pressed="true">
        Clear
      </Button>,
    );
    expect(node.disabled).toBe(true);
    expect(node.className).toBe('notebook-action');
    expect(node.getAttribute('aria-label')).toBe('Clear Body');
    expect(node.getAttribute('aria-pressed')).toBe('true');
    unmount();
  });

  it('hands an object ref to the native button', () => {
    const ref = createRef();
    const { node, unmount } = mount(<Button ref={ref}>Go</Button>);
    expect(ref.current).toBe(node);
    unmount();
  });

  it('calls onClick', () => {
    let clicks = 0;
    const { node, unmount } = mount(<Button onClick={() => (clicks += 1)}>Go</Button>);
    act(() => node.click());
    expect(clicks).toBe(1);
    unmount();
  });
});

describe('Checkbox', () => {
  it('renders one checkbox input with tabindex="0"', () => {
    const { node, unmount } = mount(<Checkbox checked={false} onChange={() => {}} />);
    expect(node.tagName).toBe('INPUT');
    expect(node.getAttribute('type')).toBe('checkbox');
    expect(node.getAttribute('tabindex')).toBe('0');
    unmount();
  });

  it('keeps tabindex="0" when a caller passes tabIndex={-1}', () => {
    const { node, unmount } = mount(<Checkbox tabIndex={-1} checked={false} onChange={() => {}} />);
    expect(node.getAttribute('tabindex')).toBe('0');
    unmount();
  });

  it('passes checked, disabled, name, value and aria-label through', () => {
    const { node, unmount } = mount(
      <Checkbox checked disabled name="uses" value="a" aria-label="Uses a" onChange={() => {}} />,
    );
    expect(node.checked).toBe(true);
    expect(node.disabled).toBe(true);
    expect(node.getAttribute('name')).toBe('uses');
    expect(node.getAttribute('value')).toBe('a');
    expect(node.getAttribute('aria-label')).toBe('Uses a');
    unmount();
  });

  it('hands an object ref to the native input', () => {
    const ref = createRef();
    const { node, unmount } = mount(<Checkbox ref={ref} checked={false} onChange={() => {}} />);
    expect(ref.current).toBe(node);
    unmount();
  });
});

describe('Radio', () => {
  it('renders one radio input with tabindex="0"', () => {
    const { node, unmount } = mount(<Radio name="g" value="a" checked={false} onChange={() => {}} />);
    expect(node.tagName).toBe('INPUT');
    expect(node.getAttribute('type')).toBe('radio');
    expect(node.getAttribute('tabindex')).toBe('0');
    unmount();
  });

  it('keeps tabindex="0" when a caller passes tabIndex={-1}', () => {
    const { node, unmount } = mount(<Radio tabIndex={-1} name="g" value="a" checked={false} onChange={() => {}} />);
    expect(node.getAttribute('tabindex')).toBe('0');
    unmount();
  });

  it('passes checked, disabled, name, value and aria-label through', () => {
    const { node, unmount } = mount(
      <Radio checked disabled name="g" value="b" aria-label="Pick b" onChange={() => {}} />,
    );
    expect(node.checked).toBe(true);
    expect(node.disabled).toBe(true);
    expect(node.getAttribute('name')).toBe('g');
    expect(node.getAttribute('value')).toBe('b');
    expect(node.getAttribute('aria-label')).toBe('Pick b');
    unmount();
  });

  it('hands an object ref and a callback ref to the native input', () => {
    const ref = createRef();
    const first = mount(<Radio ref={ref} name="g" value="a" checked={false} onChange={() => {}} />);
    expect(ref.current).toBe(first.node);
    first.unmount();

    let seen = null;
    const second = mount(
      <Radio ref={(el) => (seen = el)} name="g" value="a" checked={false} onChange={() => {}} />,
    );
    expect(seen).toBe(second.node);
    second.unmount();
  });
});
