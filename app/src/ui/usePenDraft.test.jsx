// @vitest-environment jsdom
//
// Wiring only (Phase 5, D-10): the pen's logic is covered under node in
// domain/penDraft.test.js. This file proves what only a mounted hook can: that
// edit() clears the blocked state in one place and that two edits in one React
// batch both land. Same Harness pattern as useFold.reset.test.jsx; no
// @testing-library/react.
import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { usePenDraft } from './usePenDraft.js';
import { setPenField } from '../domain/penDraft.js';

function mount() {
  const state = {};
  function Harness() {
    state.hook = usePenDraft();
    return null;
  }
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Harness />);
  });
  function unmount() {
    act(() => {
      root.unmount();
    });
    container.remove();
  }
  return { state, unmount };
}

const fixture = { versionLabel: '', reason: '' };

describe('usePenDraft', () => {
  it('edit() clears the blocked message and target together, then applies the op', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.setPenDraft(fixture);
        state.hook.setBlockedMessage('Enter a version.');
        state.hook.setBlockedTarget({ kind: 'versionLine', attempt: 1 });
      });
      expect(state.hook.blockedMessage).toBe('Enter a version.');
      expect(state.hook.blockedTarget).toEqual({ kind: 'versionLine', attempt: 1 });

      act(() => {
        state.hook.edit(setPenField, 'versionLabel', 'x');
      });
      expect(state.hook.blockedMessage).toBe(null);
      expect(state.hook.blockedTarget).toBe(null);
      expect(state.hook.penDraft.versionLabel).toBe('x');
    } finally {
      unmount();
    }
  });

  it('two edit() calls in one batch both land, in order', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.setPenDraft(fixture);
      });
      act(() => {
        state.hook.edit(setPenField, 'versionLabel', 'x');
        state.hook.edit(setPenField, 'reason', 'y');
      });
      expect(state.hook.penDraft.versionLabel).toBe('x');
      expect(state.hook.penDraft.reason).toBe('y');
    } finally {
      unmount();
    }
  });
});
