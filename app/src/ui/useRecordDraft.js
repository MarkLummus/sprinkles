import { useState } from 'react';

// The record pen's draft (Phase 5, EDIT-03): recording a batch, correcting it
// and writing its tasting.
//
// D-06: the churn-date block's reset is written once, in clearDateBlock, and
// every way the draft changes reaches it. D-07: the hook stops at the draft.
// RecipePage keeps the save lock, the page status, the announcer, the focus
// landings for its own actions and the repository calls. D-09: the attempt
// counters that ride with a block live here with that block.
export function useRecordDraft() {
  const [draft, setDraft] = useState(null);
  // Non-null while the record pen is open means the pen layer is amending
  // this existing batch's record, rather than recording a new one
  // (task 3, D-06). Amending pre-fills the fields from the batch, never
  // from the version, and saving calls completeRecord, never createBatch.
  const [amendingBatchId, setAmendingBatchId] = useState(null);
  // The draft-shaped object handleStartAmending pre-filled `draft` from
  // (03-07, T-03-43) — the baseline isDraftDirty compares an amend draft
  // against, instead of blank. Cleared everywhere amendingBatchId is
  // cleared, for the same class of reason (T-02-24): a stale baseline left
  // over from a prior amendment would make a fresh recording's own dirty
  // check compare against the wrong record.
  const [amendBaseline, setAmendBaseline] = useState(null);
  // The record pen's own blocked-save state (D-05, contract "Controls
  // spec"): fieldErrors keys a battery field to its own contract sentence;
  // invalidFieldTarget names the first invalid field in BATTERY_FIELDS
  // order plus an attempt counter (WR-01's pattern) so a second
  // consecutive block on the same field still moves focus; blockedDate*
  // are the churn-date press-to-block's own message and attempt counter,
  // read by BOTH ceremonies (D-05: "a sentence beside both save sets").
  const [fieldErrors, setFieldErrors] = useState({});
  const [invalidFieldTarget, setInvalidFieldTarget] = useState(null);
  const [blockedDateMessage, setBlockedDateMessage] = useState(null);
  const [blockedDateAttempt, setBlockedDateAttempt] = useState(null);
  // Which control opened the amend pen: 'correct' (the log's Correct) or
  // 'record-a-tasting' (the band's, below 724; sketch 011 decision 30).
  // Every amend open overwrites it and nothing clears it: the two focus-
  // return effects (BatchRow's for Correct, VersionRow's for the band) read
  // it as captured when the pen opened, so the control that opened a pen is
  // the one that gets focus back when it closes.
  const [amendOpener, setAmendOpener] = useState('correct');
  // pendingUndo holds the removed tasting's own values as a plain object, or
  // null while no removal is pending — "an undo exists" is exactly
  // pendingUndo !== null.
  const [pendingUndo, setPendingUndo] = useState(null);

  // The churn-date block's one reset (D-06).
  function clearDateBlock() {
    setBlockedDateMessage(null);
  }

  // Clears the churn-date block, then applies a pure (draft, ...args) => draft
  // op through a functional update, so two edits in one batch both land.
  function edit(op, ...args) {
    clearDateBlock();
    setDraft((prev) => op(prev, ...args));
  }

  // Only this field's own entry clears (WR-03): a Save that reported two
  // malformed measurements must not have fixing one silently un-flag the
  // other, still-invalid one.
  function clearFieldError(field) {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // An edit inside the tasting body retires a pending undo; the caller decides
  // which edits those are (isTastingBodyField).
  function retireUndo() {
    setPendingUndo(null);
  }

  return {
    draft,
    amendingBatchId,
    amendBaseline,
    amendOpener,
    fieldErrors,
    invalidFieldTarget,
    blockedDateMessage,
    blockedDateAttempt,
    pendingUndo,
    edit,
    clearFieldError,
    retireUndo,
    setDraft,
    setAmendingBatchId,
    setAmendBaseline,
    setAmendOpener,
    setFieldErrors,
    setInvalidFieldTarget,
    setBlockedDateMessage,
    setBlockedDateAttempt,
    setPendingUndo,
  };
}
