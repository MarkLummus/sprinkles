import { useRef } from 'react';
import { repository } from '../store/repository.js';

// The kept draft's writer (Phase 8 cut 5, D-08). It owns the three refs the
// draft effects share and the two functions that write or end a draft, and it
// declares no effect and knows nothing about pens. That is what lets both pen
// hooks take discardDraft without needing each other to initialise: the shell
// calls this first, then useVersionPen with discardDraft, then useKeptDraft
// with the writer and the version pen's restorePlan.
export function useDraftWriter(versionId) {
  //  - draftStoredRef: whether a record may be sitting in the store for this
  //    version, so a pen that goes clean deletes it and a pen that was never
  //    dirty writes nothing at all.
  //  - pendingDraftRef / draftTimerRef: the record waiting out the 250 ms
  //    debounce, and its timer.
  const draftStoredRef = useRef(false);
  const pendingDraftRef = useRef(null);
  const draftTimerRef = useRef(null);

  // Writes the record waiting out the debounce at once. Reads refs only, so
  // the listener below can hold the first render's copy for the page's life.
  function flushPendingDraft() {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = null;
    const record = pendingDraftRef.current;
    if (!record) return;
    pendingDraftRef.current = null;
    draftStoredRef.current = true;
    Promise.resolve().then(() => repository.saveDraft(record)).catch(() => {});
  }

  // Save and Cancel end a draft: drop whatever is waiting to be written, so a
  // keystroke typed just before Save cannot write the draft back after it
  // was deleted, then delete the stored record.
  function discardDraft() {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = null;
    pendingDraftRef.current = null;
    draftStoredRef.current = false;
    Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});
  }

  return { draftStoredRef, pendingDraftRef, draftTimerRef, flushPendingDraft, discardDraft };
}
