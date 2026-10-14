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
import { oliveOilVersion } from '../data/olive-oil.js';
import { penDraftFromVersion, setPenField } from '../domain/penDraft.js';

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

function version() {
  return structuredClone(oliveOilVersion);
}

// A blank version line blocks the save (blockedSaveMessage).
function blockedPen(state) {
  act(() => {
    state.hook.open(version());
  });
  act(() => {
    state.hook.checkSave(version(), []);
  });
  expect(state.hook.blockedMessage).toBe('Enter a version.');
}

describe('usePenDraft', () => {
  it('edit() clears the blocked message and target together, then applies the op', () => {
    const { state, unmount } = mount();
    try {
      blockedPen(state);
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
        state.hook.open(version());
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

  it('open(version) sets a draft and leaves no block', () => {
    const { state, unmount } = mount();
    try {
      expect(state.hook.penDraft).toBe(null);
      act(() => {
        state.hook.open(version());
      });
      expect(state.hook.penDraft).toEqual(penDraftFromVersion(version()));
      expect(state.hook.blockedMessage).toBe(null);
      expect(state.hook.blockedTarget).toBe(null);
    } finally {
      unmount();
    }
  });

  it('checkSave() on a blank version line sets the block, and a second blocked press grows the attempt', () => {
    const { state, unmount } = mount();
    try {
      blockedPen(state);
      expect(state.hook.blockedTarget).toEqual({ kind: 'versionLine', attempt: 1 });
      let result;
      act(() => {
        result = state.hook.checkSave(version(), []);
      });
      expect(result).toEqual({ blockedKind: 'versionLine', fields: null });
      expect(state.hook.blockedTarget).toEqual({ kind: 'versionLine', attempt: 2 });
    } finally {
      unmount();
    }
  });

  it('checkSave() on a clean draft returns the fields the domain constructors take and sets no block', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.open(version());
      });
      act(() => {
        state.hook.edit(setPenField, 'versionLabel', 'v-next');
      });
      let result;
      act(() => {
        result = state.hook.checkSave(version(), []);
      });
      expect(result.blockedKind).toBe(null);
      expect(result.fields.versionLabel).toBe('v-next');
      expect(result.fields.reason).toBe(null);
      expect(state.hook.blockedMessage).toBe(null);
      expect(state.hook.blockedTarget).toBe(null);
    } finally {
      unmount();
    }
  });

  it('close() clears the draft and the block', () => {
    const { state, unmount } = mount();
    try {
      blockedPen(state);
      act(() => {
        state.hook.close();
      });
      expect(state.hook.penDraft).toBe(null);
      expect(state.hook.blockedMessage).toBe(null);
      expect(state.hook.blockedTarget).toBe(null);
    } finally {
      unmount();
    }
  });

  it('restore(payload) sets the payload and clears the block', () => {
    const { state, unmount } = mount();
    try {
      blockedPen(state);
      const payload = penDraftFromVersion(version());
      payload.versionLabel = 'kept';
      act(() => {
        state.hook.restore(payload);
      });
      expect(state.hook.penDraft).toBe(payload);
      expect(state.hook.blockedMessage).toBe(null);
      expect(state.hook.blockedTarget).toBe(null);
    } finally {
      unmount();
    }
  });
});
