import { useRef, useState } from 'react';

// The page's three live regions (Phase 8, EDIT-05, cut 1).
//
// This hook owns the text of the form, tasting and record status regions, the
// three timer refs behind them, and announce with its guarded five-second
// clear. It does not own which words are said or when: every caller in
// RecipePage.jsx still passes its own message, and the status constants stay
// with the code that announces them.
export function useAnnouncer() {
  const [formStatus, setFormStatus] = useState('');
  const formStatusTimerRef = useRef(null);
  // The tasting-status channel (contract "Feedback and undo lifecycle"):
  // in this build the only announcement it ever carries is "Tasting
  // restored." (Task 2's handleUndoRemove) — the always-visible mode's own
  // two tasting-status strings are never built (Pitfall 6). pendingUndo
  // holds the removed tasting's own values as a plain object (Task 2's
  // restore reads it), or null while no removal is pending — "an undo
  // exists" is exactly pendingUndo !== null.
  const [tastingStatus, setTastingStatus] = useState('');
  const tastingStatusTimerRef = useRef(null);
  // The end-of-record ceremony's own live region (007 @ 109733d line 303;
  // the ninth round, Pattern 5) — the removal toasts' channel, since the
  // toast lives where the action was: TASTING_REMOVED_EMPTY_STATUS and
  // TASTING_REMOVED_DATA_STATUS both write here now, never to formStatus.
  // formStatus stays the open pen's own save/validation channel (line
  // 309), whichever pen is open.
  const [recordStatus, setRecordStatus] = useState('');
  const recordStatusTimerRef = useRef(null);

  // announce(message, { selfClear, target }) -> writes one of the three
  // live regions' text (contract "Feedback and undo lifecycle"): form
  // (the default), tasting — the channel handleUndoRemove's own restore
  // announcement writes to — or record — the end-of-record ceremony's own
  // region, the removal toasts' channel (the ninth round, Pattern 5).
  // Validation and block statuses never self-clear; the tasting/record
  // removal/undo toasts pass selfClear: true and get the guarded
  // five-second clear — it clears only if the text on screen is still the
  // message it wrote, so a newer message is never wiped (RESEARCH.md Code
  // Example 5). All three channels share the one guard shape, each
  // against its own timer ref.
  function announce(message, { selfClear = false, target = 'form' } = {}) {
    if (target === 'tasting') {
      setTastingStatus(message);
      if (tastingStatusTimerRef.current) clearTimeout(tastingStatusTimerRef.current);
      if (selfClear) {
        tastingStatusTimerRef.current = setTimeout(() => {
          setTastingStatus((current) => (current === message ? '' : current));
        }, 5000);
      }
      return;
    }
    if (target === 'record') {
      setRecordStatus(message);
      if (recordStatusTimerRef.current) clearTimeout(recordStatusTimerRef.current);
      if (selfClear) {
        recordStatusTimerRef.current = setTimeout(() => {
          setRecordStatus((current) => (current === message ? '' : current));
        }, 5000);
      }
      return;
    }
    setFormStatus(message);
    if (formStatusTimerRef.current) clearTimeout(formStatusTimerRef.current);
    if (selfClear) {
      formStatusTimerRef.current = setTimeout(() => {
        setFormStatus((current) => (current === message ? '' : current));
      }, 5000);
    }
  }

  return { formStatus, setFormStatus, tastingStatus, setTastingStatus, recordStatus, setRecordStatus, announce };
}
