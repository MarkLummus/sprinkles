import { describe, expect, it, vi } from 'vitest';
import { editorKeyDown, keyIntent } from './editorKeys.js';

// STRUCT-05, CONTRACT section 6 and section 11 (numbers 8, 10, 11): plain event
// objects with a preventDefault spy, so the node environment holds the whole
// key table without a DOM.
function press(key, modifiers = {}, extra = {}) {
  return {
    key,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    keyCode: 0,
    preventDefault: vi.fn(),
    ...modifiers,
    ...extra,
  };
}

describe('keyIntent', () => {
  it('reads Cmd+Return and Ctrl+Return as add', () => {
    expect(keyIntent(press('Enter', { metaKey: true }))).toBe('add');
    expect(keyIntent(press('Enter', { ctrlKey: true }))).toBe('add');
  });

  it('ignores a held add (a repeat), for either key', () => {
    expect(keyIntent(press('Enter', { metaKey: true }, { repeat: true }))).toBe('ignore');
    expect(keyIntent(press('Enter', { ctrlKey: true }, { repeat: true }))).toBe('ignore');
  });

  it('reads Ctrl+Cmd+Up and Down as moves, a repeat included', () => {
    expect(keyIntent(press('ArrowUp', { ctrlKey: true, metaKey: true }))).toBe('move-up');
    expect(keyIntent(press('ArrowDown', { ctrlKey: true, metaKey: true }))).toBe('move-down');
    expect(keyIntent(press('ArrowDown', { ctrlKey: true, metaKey: true }, { repeat: true }))).toBe('move-down');
  });

  it('reads nothing with Shift or Option held', () => {
    for (const modifier of ['shiftKey', 'altKey']) {
      expect(keyIntent(press('Enter', { metaKey: true, [modifier]: true }))).toBeNull();
      expect(keyIntent(press('Enter', { ctrlKey: true, [modifier]: true }))).toBeNull();
      expect(keyIntent(press('ArrowUp', { ctrlKey: true, metaKey: true, [modifier]: true }))).toBeNull();
      expect(keyIntent(press('ArrowDown', { ctrlKey: true, metaKey: true, [modifier]: true }))).toBeNull();
    }
  });

  it('reads plain Enter, and Cmd+arrow or Ctrl+arrow alone, as nothing', () => {
    expect(keyIntent(press('Enter'))).toBeNull();
    expect(keyIntent(press('ArrowUp', { metaKey: true }))).toBeNull();
    expect(keyIntent(press('ArrowDown', { metaKey: true }))).toBeNull();
    expect(keyIntent(press('ArrowUp', { ctrlKey: true }))).toBeNull();
    expect(keyIntent(press('ArrowDown', { ctrlKey: true }))).toBeNull();
    expect(keyIntent(press('a', { ctrlKey: true, metaKey: true }))).toBeNull();
  });

  it('reads nothing while an IME composes', () => {
    expect(keyIntent(press('Enter', { metaKey: true }, { nativeEvent: { isComposing: true } }))).toBeNull();
    expect(keyIntent(press('Enter', { ctrlKey: true }, { keyCode: 229 }))).toBeNull();
    expect(keyIntent(press('ArrowUp', { ctrlKey: true, metaKey: true }, { keyCode: 229 }))).toBeNull();
  });

  it('gives Remove no key: Delete and Backspace with any modifiers read as nothing', () => {
    for (const key of ['Delete', 'Backspace']) {
      expect(keyIntent(press(key, { ctrlKey: true, metaKey: true }))).toBeNull();
      expect(keyIntent(press(key, { metaKey: true }))).toBeNull();
    }
  });
});

describe('editorKeyDown', () => {
  const calls = () => ({ onAdd: vi.fn(), onMove: vi.fn(), otherwise: vi.fn() });

  it('adds on Cmd+Return and on Ctrl+Return, prevented', () => {
    for (const modifier of ['metaKey', 'ctrlKey']) {
      const handlers = calls();
      const event = press('Enter', { [modifier]: true });
      editorKeyDown(event, handlers);
      expect(handlers.onAdd).toHaveBeenCalledTimes(1);
      expect(handlers.onMove).not.toHaveBeenCalled();
      expect(handlers.otherwise).not.toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    }
  });

  it('moves on Ctrl+Cmd+Up and Down with the direction, prevented', () => {
    const up = calls();
    const upEvent = press('ArrowUp', { ctrlKey: true, metaKey: true });
    editorKeyDown(upEvent, up);
    expect(up.onMove).toHaveBeenCalledWith('up');
    expect(up.onAdd).not.toHaveBeenCalled();
    expect(upEvent.preventDefault).toHaveBeenCalledTimes(1);

    const down = calls();
    const downEvent = press('ArrowDown', { ctrlKey: true, metaKey: true });
    editorKeyDown(downEvent, down);
    expect(down.onMove).toHaveBeenCalledWith('down');
    expect(downEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls nothing for a held add, and prevents it', () => {
    const handlers = calls();
    const event = press('Enter', { metaKey: true }, { repeat: true });
    editorKeyDown(event, handlers);
    expect(handlers.onAdd).not.toHaveBeenCalled();
    expect(handlers.onMove).not.toHaveBeenCalled();
    expect(handlers.otherwise).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('prevents a recognised key even when no handler is given for it', () => {
    const event = press('ArrowDown', { ctrlKey: true, metaKey: true });
    editorKeyDown(event, {});
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('hands every other key to otherwise and prevents nothing itself', () => {
    for (const event of [
      press('Enter'),
      press('Enter', { shiftKey: true }),
      press('Enter', { metaKey: true, altKey: true }),
      press('ArrowUp', { metaKey: true }),
      press('a'),
    ]) {
      const handlers = calls();
      editorKeyDown(event, handlers);
      expect(handlers.otherwise).toHaveBeenCalledWith(event);
      expect(handlers.onAdd).not.toHaveBeenCalled();
      expect(handlers.onMove).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    }
  });

  it('does not fail when no otherwise is given', () => {
    expect(() => editorKeyDown(press('Enter'), {})).not.toThrow();
  });

  it('hands an IME composition to otherwise', () => {
    const handlers = calls();
    const event = press('Enter', { metaKey: true }, { keyCode: 229 });
    editorKeyDown(event, handlers);
    expect(handlers.otherwise).toHaveBeenCalledWith(event);
    expect(handlers.onAdd).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
