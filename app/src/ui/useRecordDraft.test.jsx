// @vitest-environment jsdom
//
// Wiring only (Phase 5, D-10): the record pen's logic is covered under node in
// domain/recordDraft.test.js. This file proves what only a mounted hook can:
// that edit() clears the churn-date block in one place, that only the edited
// field's own error clears, and that two edits in one React batch both land.
// Same Harness pattern as usePenDraft.test.jsx; no @testing-library/react.
import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useRecordDraft } from './useRecordDraft.js';
import { CHURN_DATE_BLOCKED_MESSAGE, blankRecordDraft, setRecordField } from '../domain/recordDraft.js';

function mount() {
  const state = {};
  function Harness() {
    state.hook = useRecordDraft();
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

describe('useRecordDraft', () => {
  it('edit() clears the churn-date block, then applies the op', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.setDraft(blankRecordDraft());
        state.hook.setBlockedDateMessage(CHURN_DATE_BLOCKED_MESSAGE);
      });
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);

      act(() => {
        state.hook.edit(setRecordField, 'churnDate', '2026-10-09');
      });
      expect(state.hook.blockedDateMessage).toBe(null);
      expect(state.hook.draft.churnDate).toBe('2026-10-09');
    } finally {
      unmount();
    }
  });

  it('clearFieldError() removes only the named field and leaves the others', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.setFieldErrors({ churnDurationMinutes: 'x', temperingMinutes: 'y' });
      });
      act(() => {
        state.hook.clearFieldError('churnDurationMinutes');
      });
      expect(state.hook.fieldErrors).toEqual({ temperingMinutes: 'y' });
    } finally {
      unmount();
    }
  });

  it('two edit() calls in one batch both land, in order', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.setDraft(blankRecordDraft());
      });
      act(() => {
        state.hook.edit(setRecordField, 'churnDate', '2026-10-09');
        state.hook.edit(setRecordField, 'note', 'smooth');
      });
      expect(state.hook.draft.churnDate).toBe('2026-10-09');
      expect(state.hook.draft.note).toBe('smooth');
    } finally {
      unmount();
    }
  });
});
