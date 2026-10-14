// @vitest-environment jsdom
//
// Wiring only (Phase 5, D-10): the record pen's logic is covered under node in
// domain/recordDraft.test.js. This file proves what only a mounted hook can:
// that edit() clears the churn-date block in one place, that only the edited
// field's own error clears, that two edits in one React batch both land, and
// that the lifecycle methods reset what they should. Same Harness pattern as
// usePenDraft.test.jsx; no @testing-library/react.
import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useRecordDraft } from './useRecordDraft.js';
import { augustSecondBatch } from '../data/batch-2026-08-02.js';
import { CHURN_DATE_BLOCKED_MESSAGE, draftFromBatch, setRecordField } from '../domain/recordDraft.js';

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

function batch() {
  return structuredClone(augustSecondBatch);
}

// A new record whose churn date is blank, so the second gate blocks the save.
function blockedDatePen(state) {
  act(() => {
    state.hook.openNew();
  });
  act(() => {
    state.hook.checkSave();
  });
  expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
}

describe('useRecordDraft', () => {
  it('edit() clears the churn-date block, then applies the op', () => {
    const { state, unmount } = mount();
    try {
      blockedDatePen(state);

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
        state.hook.openNew();
      });
      act(() => {
        state.hook.edit(setRecordField, 'churnDurationMinutes', 'x');
        state.hook.edit(setRecordField, 'temperingMinutes', 'y');
      });
      act(() => {
        state.hook.checkSave();
      });
      expect(Object.keys(state.hook.fieldErrors)).toEqual(['churnDurationMinutes', 'temperingMinutes']);
      act(() => {
        state.hook.clearFieldError('churnDurationMinutes');
      });
      expect(Object.keys(state.hook.fieldErrors)).toEqual(['temperingMinutes']);
    } finally {
      unmount();
    }
  });

  it('two edit() calls in one batch both land, in order', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.openNew();
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

  it('checkSave() on a blank churn date blocks, and a second press grows the attempt', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.openNew();
      });
      let result;
      act(() => {
        result = state.hook.checkSave();
      });
      expect(result).toEqual({ outcome: 'churnDate', parsed: null });
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
      expect(state.hook.blockedDateAttempt).toBe(1);
      act(() => {
        state.hook.checkSave();
      });
      expect(state.hook.blockedDateAttempt).toBe(2);
    } finally {
      unmount();
    }
  });

  it('two malformed measurements give the measurement outcome, both errors, the first as target and no date block', () => {
    const { state, unmount } = mount();
    try {
      blockedDatePen(state);
      act(() => {
        state.hook.edit(setRecordField, 'churnDurationMinutes', 'x');
        state.hook.edit(setRecordField, 'temperingMinutes', 'y');
      });
      let result;
      act(() => {
        result = state.hook.checkSave();
      });
      expect(result).toEqual({ outcome: 'measurement', parsed: null });
      expect(Object.keys(state.hook.fieldErrors)).toEqual(['churnDurationMinutes', 'temperingMinutes']);
      expect(state.hook.invalidFieldTarget).toEqual({ key: 'churnDurationMinutes', attempt: 1 });
      expect(state.hook.blockedDateMessage).toBe(null);
    } finally {
      unmount();
    }
  });

  it('checkSave() on a clean draft returns ok with the parsed fields, and buildFields() builds from them', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.openNew();
      });
      act(() => {
        state.hook.edit(setRecordField, 'churnDate', '2026-10-09');
      });
      let result;
      act(() => {
        result = state.hook.checkSave();
      });
      expect(result.outcome).toBe('ok');
      expect(state.hook.fieldErrors).toEqual({});
      expect(state.hook.blockedDateMessage).toBe(null);
      const built = state.hook.buildFields(result.parsed);
      expect(built.churnFields.churnDate).toBe('2026-10-09');
      expect(built.tasting).toBe(null);
    } finally {
      unmount();
    }
  });

  it('removeTasting() on a draft with ink returns true and sets pendingUndo; undoRemoveTasting() restores it', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.openNew();
      });
      act(() => {
        state.hook.addTasting();
        state.hook.edit(setRecordField, 'note', 'firm');
      });
      expect(state.hook.draft.tastingOpen).toBe(true);
      let hadInk;
      act(() => {
        hadInk = state.hook.removeTasting();
      });
      expect(hadInk).toBe(true);
      expect(state.hook.pendingUndo.note).toBe('firm');
      expect(state.hook.draft.note).toBe('');
      expect(state.hook.draft.tastingOpen).toBe(false);

      act(() => {
        state.hook.undoRemoveTasting();
      });
      expect(state.hook.draft.note).toBe('firm');
      expect(state.hook.draft.tastingOpen).toBe(true);
      expect(state.hook.pendingUndo).toBe(null);
    } finally {
      unmount();
    }
  });

  it('removeTasting() on a draft with no ink returns false and leaves no undo', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.openNew();
      });
      act(() => {
        state.hook.addTasting();
      });
      let hadInk;
      act(() => {
        hadInk = state.hook.removeTasting();
      });
      expect(hadInk).toBe(false);
      expect(state.hook.pendingUndo).toBe(null);
    } finally {
      unmount();
    }
  });

  it('add, remove and restore tasting leave the churn-date block alone; edit() leaves the undo; retireUndo() clears it', () => {
    const { state, unmount } = mount();
    try {
      blockedDatePen(state);
      act(() => {
        state.hook.addTasting();
      });
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
      act(() => {
        state.hook.edit(setRecordField, 'note', 'firm');
      });
      expect(state.hook.blockedDateMessage).toBe(null);
      act(() => {
        state.hook.checkSave();
      });
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);

      act(() => {
        state.hook.removeTasting();
      });
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
      expect(state.hook.pendingUndo).not.toBe(null);
      act(() => {
        state.hook.undoRemoveTasting();
      });
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);

      act(() => {
        state.hook.removeTasting();
      });
      expect(state.hook.pendingUndo).not.toBe(null);
      act(() => {
        state.hook.edit(setRecordField, 'churnDate', '2026-10-09');
      });
      expect(state.hook.pendingUndo).not.toBe(null);
      act(() => {
        state.hook.retireUndo();
      });
      expect(state.hook.pendingUndo).toBe(null);
      expect(state.hook.draft.churnDate).toBe('2026-10-09');
    } finally {
      unmount();
    }
  });

  it('openAmend(batch, "record-a-tasting") opens the tasting, with a baseline equal to the draft but not the same object', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.openAmend(batch(), 'record-a-tasting');
      });
      expect(state.hook.draft.tastingOpen).toBe(true);
      expect(state.hook.amendingBatchId).toBe(augustSecondBatch.id);
      expect(state.hook.amendOpener).toBe('record-a-tasting');
      expect(state.hook.amendBaseline).toEqual(state.hook.draft);
      expect(state.hook.amendBaseline).not.toBe(state.hook.draft);
    } finally {
      unmount();
    }
  });

  it('openNew() after a correction drops the amend target and baseline but keeps the opener', () => {
    const { state, unmount } = mount();
    try {
      act(() => {
        state.hook.openAmend(batch(), 'record-a-tasting');
      });
      act(() => {
        state.hook.openNew();
      });
      expect(state.hook.amendingBatchId).toBe(null);
      expect(state.hook.amendBaseline).toBe(null);
      expect(state.hook.amendOpener).toBe('record-a-tasting');
      expect(state.hook.draft.churnDate).toBe('');
    } finally {
      unmount();
    }
  });

  it('cancel() after a block resets the draft, the errors, the date block, its attempt and the undo', () => {
    const { state, unmount } = mount();
    try {
      blockedDatePen(state);
      act(() => {
        state.hook.addTasting();
        state.hook.edit(setRecordField, 'note', 'firm');
      });
      act(() => {
        state.hook.removeTasting();
      });
      act(() => {
        state.hook.checkSave();
      });
      expect(state.hook.blockedDateAttempt).toBe(2);
      expect(state.hook.pendingUndo).not.toBe(null);
      act(() => {
        state.hook.cancel();
      });
      expect(state.hook.draft).toBe(null);
      expect(state.hook.amendingBatchId).toBe(null);
      expect(state.hook.amendBaseline).toBe(null);
      expect(state.hook.fieldErrors).toEqual({});
      expect(state.hook.invalidFieldTarget).toBe(null);
      expect(state.hook.blockedDateMessage).toBe(null);
      expect(state.hook.blockedDateAttempt).toBe(null);
      expect(state.hook.pendingUndo).toBe(null);
    } finally {
      unmount();
    }
  });

  it('close() drops the draft and the amend target and leaves the blocks', () => {
    const { state, unmount } = mount();
    try {
      blockedDatePen(state);
      act(() => {
        state.hook.close();
      });
      expect(state.hook.draft).toBe(null);
      expect(state.hook.amendingBatchId).toBe(null);
      expect(state.hook.amendBaseline).toBe(null);
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);
    } finally {
      unmount();
    }
  });

  it('restore() reopens a kept new record or a kept correction and leaves the blocks', () => {
    const { state, unmount } = mount();
    try {
      blockedDatePen(state);
      const payload = draftFromBatch(batch());
      act(() => {
        state.hook.restore({ kind: 'record', payload });
      });
      expect(state.hook.draft).toBe(payload);
      expect(state.hook.amendingBatchId).toBe(null);
      expect(state.hook.blockedDateMessage).toBe(CHURN_DATE_BLOCKED_MESSAGE);

      const baseline = draftFromBatch(batch());
      act(() => {
        state.hook.restore({
          kind: 'amend',
          payload,
          amendBaseline: baseline,
          amendingBatchId: 'b-1',
          amendOpener: 'record-a-tasting',
        });
      });
      expect(state.hook.amendBaseline).toBe(baseline);
      expect(state.hook.amendingBatchId).toBe('b-1');
      expect(state.hook.amendOpener).toBe('record-a-tasting');
    } finally {
      unmount();
    }
  });

  it('returns the nine values and the thirteen methods, and no raw setter', () => {
    const { state, unmount } = mount();
    try {
      expect(Object.keys(state.hook).sort()).toEqual(
        [
          'draft',
          'amendingBatchId',
          'amendBaseline',
          'amendOpener',
          'fieldErrors',
          'invalidFieldTarget',
          'blockedDateMessage',
          'blockedDateAttempt',
          'pendingUndo',
          'edit',
          'clearFieldError',
          'retireUndo',
          'addTasting',
          'removeTasting',
          'undoRemoveTasting',
          'openNew',
          'openAmend',
          'cancel',
          'close',
          'restore',
          'checkSave',
          'buildFields',
        ].sort(),
      );
    } finally {
      unmount();
    }
  });
});
