import { useRef, useState } from 'react';
import {
  amendDraftFromBatch,
  blankRecordDraft,
  openTastingSection,
  recordFieldsFromDraft,
  removeTastingSection,
  restoreDraftFromUndo,
  tastingHasInk,
  tastingPayloadFromDraft,
  validateRecordDraft,
} from '../domain/recordDraft.js';

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
  // The save gate's two attempt counters (WR-01's pattern): each grows on every
  // blocked press and rides with the block it accompanies (D-09).
  const invalidFieldAttemptRef = useRef(0);
  const dateBlockedAttemptRef = useRef(0);

  // The churn-date block's one reset (D-06).
  function clearDateBlock() {
    setBlockedDateMessage(null);
  }

  // Every blocked-save state the pen holds, and the pending undo, cleared
  // together: opening a record, opening a correction and Cancel all start here.
  function resetBlocks() {
    setFieldErrors({});
    setInvalidFieldTarget(null);
    clearDateBlock();
    setBlockedDateAttempt(null);
    setPendingUndo(null);
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

  // Add tasting opens the section. It does not touch the churn-date block.
  function addTasting() {
    setDraft((prev) => openTastingSection(prev));
  }

  // Remove tasting (contract "Feedback and undo lifecycle"): a press with no
  // ink (tastingHasInk false) collapses the section and blanks the tasting
  // side with no undo; a press with ink does the same but captures the
  // tasting's own values in pendingUndo first (tastingPayloadFromDraft).
  // Returns whether there was ink, so the caller picks the sentence to
  // announce. It does not touch the churn-date block.
  function removeTasting() {
    const hasInk = tastingHasInk(draft);
    setPendingUndo(hasInk ? tastingPayloadFromDraft(draft) : null);
    setDraft((prev) => removeTastingSection(prev));
    return hasInk;
  }

  // The restore sequence: reopens the section and writes the payload back
  // field-by-field (restoreDraftFromUndo, T-03.3.1-10), then clears
  // pendingUndo. It does not touch the churn-date block.
  function undoRemoveTasting() {
    setDraft((prev) => restoreDraftFromUndo(prev, pendingUndo));
    setPendingUndo(null);
  }

  // Opening a new record. Clearing the amend target here is load-bearing, not
  // redundant: without it, a maker who amends and then starts a fresh recording
  // would leave amendingBatchId set from the earlier amendment, so the save
  // would take the amend path — overwriting the amended batch's record and
  // stamping a false changed date on it, while the new batch is never created
  // (T-02-24). amendOpener is left alone.
  function openNew() {
    setAmendingBatchId(null);
    setAmendBaseline(null);
    setDraft(blankRecordDraft());
    resetBlocks();
  }

  // "Correct" and the band's Record a tasting reopen the record pen with
  // everything the record holds in the fields — the churn side and, when the
  // batch carries one, the tasting side too (D-03) — pre-filled from the batch,
  // never from the version (draftFromBatch). The baseline isDraftDirty compares
  // against (03-07, T-03-43) is a separate clone, not the same object the
  // draft was just given, so a later edit to draft (always a new object) can
  // never be mistaken for a mutation of the baseline itself.
  function openAmend(batch, opener) {
    const filledDraft = amendDraftFromBatch(batch, opener);
    setDraft(filledDraft);
    setAmendBaseline(structuredClone(filledDraft));
    setAmendingBatchId(batch.id);
    setAmendOpener(opener);
    resetBlocks();
  }

  // The deliberate abandonment path (A-1): the draft goes, the amend target
  // with it, and every blocked and error state. amendOpener is left alone (it
  // is read as captured when the pen opened).
  function cancel() {
    setDraft(null);
    setAmendingBatchId(null);
    setAmendBaseline(null);
    resetBlocks();
  }

  // After a save: the draft and the amend target go. The blocks and the
  // pending undo stay as they were.
  function close() {
    setDraft(null);
    setAmendingBatchId(null);
    setAmendBaseline(null);
  }

  // A kept draft read back from the drafts store. The caller has already
  // checked it against the version and its batches (draftMatchesVersion,
  // T-05-09). The blocks are untouched.
  function restore(record) {
    setDraft(record.payload);
    if (record.kind === 'record') {
      setAmendingBatchId(null);
      setAmendBaseline(null);
    } else {
      setAmendBaseline(record.amendBaseline);
      setAmendingBatchId(record.amendingBatchId);
      setAmendOpener(record.amendOpener);
    }
  }

  // The one save gate (D-01/D-02/D-03/D-04): every battery measurement
  // validates first (RESEARCH.md Open Question 3), then the churn date (D-05).
  // Sets the field errors or the churn-date block, each with its own growing
  // attempt, and returns which gate fired: 'measurement', 'churnDate' or 'ok'
  // (with the parsed fields buildFields takes). The caller announces the
  // matching status and owns the save lock.
  function checkSave() {
    const { fieldErrors: errors, invalidFieldKey, blockedDateMessage: dateMessage, parsed } = validateRecordDraft(draft);

    if (invalidFieldKey !== null) {
      setFieldErrors(errors);
      invalidFieldAttemptRef.current += 1;
      setInvalidFieldTarget({ key: invalidFieldKey, attempt: invalidFieldAttemptRef.current });
      clearDateBlock();
      return { outcome: 'measurement', parsed: null };
    }
    setFieldErrors({});
    setInvalidFieldTarget(null);

    if (dateMessage) {
      dateBlockedAttemptRef.current += 1;
      setBlockedDateMessage(dateMessage);
      setBlockedDateAttempt(dateBlockedAttemptRef.current);
      return { outcome: 'churnDate', parsed: null };
    }
    clearDateBlock();
    return { outcome: 'ok', parsed };
  }

  // The churn fields and the tasting (or null) createBatch and completeRecord
  // take, built from the draft and the parsed fields checkSave returned.
  function buildFields(parsed) {
    return recordFieldsFromDraft(draft, parsed);
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
    addTasting,
    removeTasting,
    undoRemoveTasting,
    openNew,
    openAmend,
    cancel,
    close,
    restore,
    checkSave,
    buildFields,
  };
}
