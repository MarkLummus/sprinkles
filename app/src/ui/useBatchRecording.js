import { useRef, useState } from 'react';
import { repository } from '../store/repository.js';
import { createBatch, completeRecord } from '../domain/batch.js';
import { freshId } from '../domain/id.js';
import {
  batchSavedStatus,
  isTastingBodyField,
  setAsMadePortion,
  setRecordField,
  setRecordMark,
  setStepChange,
  toggleDeclaredDefect,
  toggleDefect,
} from '../domain/recordDraft.js';
import { notebookPath } from './notebookPaths.js';
import { useRecordDraft } from './useRecordDraft.js';
import { openBatchFor } from './sheetView.js';

// The contract's verbatim form-status sentence for a malformed measurement
// ("Controls spec"), read from handleSaveBatch's own announce() call.
export const MEASURED_INVALID_STATUS = 'Check the marked measurements. Your entries have been kept.';

// The churn date's own form-scoped summary, the sibling of
// MEASURED_INVALID_STATUS above: the field says its own sentence (in its
// label, D-05), the form says this summary, and a form-scoped announcement
// never repeats a field-scoped one — .form-status is a visible paragraph,
// so announcing CHURN_DATE_BLOCKED_MESSAGE here would print a second
// visible copy of the field's own sentence.
export const CHURN_DATE_BLOCKED_STATUS = 'Check the churn date. Your entries have been kept.';
export const BATCH_SAVE_ERROR = 'Couldn’t save the batch. Try again.';

// The contract's verbatim record-status sentences for the record pen's own
// two hidden-mode removal paths (contract "Feedback and undo lifecycle",
// the removal path matrix — Pitfall 6: the always-visible mode's two rows
// ("Nothing recorded to clear.", "Tasting cleared. You can undo this.")
// are never built). Written to the end-of-record ceremony's own
// record-status region, not formStatus (the ninth round; 007 @ 109733d
// lines 303, 543, 561 — the toast lives where the action was). Each
// written once, read from handleRemoveTasting below and from tests
// directly, so neither can drift from the other.
export const TASTING_REMOVED_EMPTY_STATUS = 'Tasting removed.';
export const TASTING_REMOVED_DATA_STATUS = 'Tasting removed. You can restore it.';

// The contract's verbatim tasting-status sentence after a restore (Task 2,
// contract "Feedback and undo lifecycle") — the one announcement this
// build ever writes to tasting-status (Pitfall 6: the always-visible
// mode's own two tasting-status strings are never built).
export const TASTING_RESTORED_STATUS = 'Tasting restored.';

// The record pen and tasting job (Phase 8, bonus cut, D-01): the record pen's
// draft, the attempt counters its focus landings read, the batch save and its
// lock, and the nineteen handlers that open, edit, save and cancel a batch
// record. The page keeps the mode, the Batch fold and the early returns; it
// passes the setters this job writes through and takes back the values and
// handlers its JSX reads. Handlers keep their own freshId() and
// new Date().toISOString() calls, so nothing impure runs at render.
export function useBatchRecording({
  version,
  batches,
  batchId,
  setBatches,
  setMode,
  announce,
  setFormStatus,
  setTastingStatus,
  setRecordStatus,
  onPageStatus,
  discardDraft,
  navigate,
}) {
  // The record pen's draft, its amend target, baseline and opener, its
  // blocked-save state (field errors, the churn-date block) and the pending
  // undo (useRecordDraft owns all of them); formStatus, which useAnnouncer owns, is
  // the open pen's own form-status live region text, whichever pen is open.
  const recordPen = useRecordDraft();
  const {
    draft,
    amendingBatchId,
    amendBaseline,
    amendOpener,
    fieldErrors,
    invalidFieldTarget,
    blockedDateMessage,
    blockedDateAttempt,
    pendingUndo,
  } = recordPen;
  // Add tasting's own attempt counter (D-01, contract "Focus landings"):
  // the same WR-01 pattern as blockedDateAttempt above, so BatchRow's own
  // focus effect re-fires even on a second press.
  const [addTastingAttempt, setAddTastingAttempt] = useState(null);
  const addTastingAttemptRef = useRef(0);
  // Remove tasting's own focus landing (D-01, contract "Focus landings";
  // the ninth round, Pitfall 8): both hidden-mode removal paths move
  // focus — the same WR-01 attempt-counter pattern as addTastingAttempt
  // above, consumed by BatchRow's own focus effect, which reads
  // pendingUndo to choose the end-of-record Add tasting (an empty
  // removal) or Restore tasting (a data removal).
  const [removeTastingAttempt, setRemoveTastingAttempt] = useState(null);
  const removeTastingAttemptRef = useRef(0);
  // The restore sequence's own focus landing (contract "Focus landings":
  // "undo after restore → the Clear/Remove control") — the same
  // attempt-counter pattern, consumed by BatchRow's own focus effect on
  // the Remove tasting control.
  const [restoreAttempt, setRestoreAttempt] = useState(null);
  const restoreAttemptRef = useRef(0);
  const [batchSaveAction, setBatchSaveAction] = useState(null);
  const batchSaveLockRef = useRef(false);
  const [focusBatchAttempt, setFocusBatchAttempt] = useState(null);
  const focusBatchAttemptRef = useRef(0);

  // Clearing the amend target here is load-bearing, not redundant: without
  // it, a maker who amends and then starts a fresh recording would leave
  // amendingBatchId set from the earlier amendment, so handleSaveBatch
  // would take the amend path — overwriting the amended batch's record and
  // stamping a false changed date on it, while the new batch is never
  // created (T-02-24).
  function handleStartRecording() {
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    recordPen.openNew();
    setAddTastingAttempt(null);
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
    setMode('recording');
  }

  // The one generic setter for every raw-text/date/tasting field the
  // record pen holds (03.3.1-02 artifacts: handleChangeRecordField):
  // stores the raw string the maker typed, exactly as the as-made column
  // already does, so typed precision is never lost to an early Number()
  // coercion — the conversion happens once, at save time
  // (buildChurnFieldsFromDraft/buildTastingFieldsFromDraft). Clears the
  // blocked-date sentence and every field error first (the 888-892
  // pattern) — the record the maker is now editing may no longer be the
  // one either sentence described.
  function handleChangeRecordField(field, value) {
    // Only this field's own entry clears (WR-03): a Save that reported two
    // malformed measurements must not have fixing one silently un-flag the
    // other, still-invalid one.
    recordPen.clearFieldError(field);
    recordPen.edit(setRecordField, field, value);
    setFormStatus('');
    // The retirement scope (contract "Feedback and undo lifecycle"): this
    // generic setter serves both churn fields and tasting-body fields, so
    // it only retires a pending undo when the field it was just given is
    // one of the tasting-body's own (isTastingBodyField, Task 2).
    if (isTastingBodyField(field)) recordPen.retireUndo();
  }

  // The three segmented controls (exit consistency, airiness, melt style)
  // share one handler: a joined group is a radio (007 @ 2a212be line
  // 362) — picking is final, so this always stores the clicked option.
  // BatchRow calls this from each option's onClick, never onChange, since
  // a native radio's onChange does not re-fire on a click that leaves its
  // value unchanged.
  function handleChangeSegment(field, value) {
    // No BATTERY_FIELDS entry is ever keyed by a segment field (WR-03) —
    // nothing of this field's own to clear, and clearing the whole map
    // would silently un-flag an unrelated still-invalid measurement.
    recordPen.edit(setRecordField, field, value);
    setFormStatus('');
    // Same retirement boundary as handleChangeRecordField above: only
    // Melt style is a tasting-body field among the three this handler
    // shares (Exit consistency and Airiness are churn-section fields).
    if (isTastingBodyField(field)) recordPen.retireUndo();
  }

  // An axis stop click (contract "Axes spec"; 007 line 362): a joined
  // group is a radio — this handler always stores the clicked stop and
  // never announces (only the per-axis Clear control announces, below).
  // Every axis lives inside the tasting body, so a mark change always
  // retires a pending undo (Task 2's retirement scope) — unconditionally,
  // unlike the two generic setters above.
  function handleChangeRecordMark(axisKey, stop) {
    // An axis key is never a BATTERY_FIELDS key (WR-03) — nothing of
    // this field's own to clear.
    recordPen.edit(setRecordMark, axisKey, stop);
    setFormStatus('');
    recordPen.retireUndo();
  }

  // The per-axis Clear control (contract "Axes spec", "Feedback and undo
  // lifecycle"): clears the mark and announces "{Axis name} cleared." to
  // form-status — the one path that writes this specific announcement.
  // Focus return to the axis's first stop is AxisMark's own concern (it
  // holds the DOM ref and gates the move on a keyboard activation); this
  // handler owns only state and the announcement. Retires a pending undo
  // unconditionally, same as every other tasting-body edit (Task 2).
  function handleClearAxisMark(axisKey, axisName) {
    recordPen.edit(setRecordMark, axisKey, null);
    recordPen.retireUndo();
    announce(`${axisName} cleared.`);
  }

  // The per-segment Clear control (007 lines 220, 228, 289, 375-381; Plan
  // 04 wires it): the same shape as handleClearAxisMark above — clears
  // the field and announces "{caption} cleared." to form-status. Same
  // retirement boundary as handleChangeSegment (only Melt style is a
  // tasting-body field among the three).
  function handleClearSegment(field, label) {
    recordPen.edit(setRecordField, field, '');
    if (isTastingBodyField(field)) recordPen.retireUndo();
    announce(`${label} cleared.`);
  }

  // The two mark-one controls (At draw on the batch, From freezer on the
  // tasting; sketch 010 D6 to D14) share one pair of handlers, the shape of
  // handleChangeSegment and handleClearSegment above. A pick is final until
  // Clear (a radio), and BatchRow only offers a pick while its group holds no
  // mark, so the draft never holds a pick beside a mark. From freezer is a
  // tasting-body field (it retires a pending undo); At draw is a churn field.
  function handleChangeMarkOne(field, value) {
    recordPen.edit(setRecordField, field, value);
    setFormStatus('');
    if (isTastingBodyField(field)) recordPen.retireUndo();
  }

  function handleClearMarkOne(field, label) {
    recordPen.edit(setRecordField, field, '');
    if (isTastingBodyField(field)) recordPen.retireUndo();
    announce(`${label} cleared.`);
  }

  // A defect chip's own toggle (contract "Controls spec"): a picked chip
  // joins the draft's defects list, an unpicked one leaves it — no
  // default ever; a defect is an independent on/off (007 line 428), so a
  // second click on the same chip clears it, unlike a stop or segmented
  // option. The defects row is inside the tasting body, so a toggle
  // always retires a pending undo (Task 2).
  function handleChangeDefect(defect) {
    recordPen.edit(toggleDefect, defect);
    setFormStatus('');
    recordPen.retireUndo();
  }

  // A declared problem's toggle (contract "Controls spec"; sketch 010 D26):
  // a recipe's own problem word is a presence toggle, not a goldilocks
  // axis — membership in the draft's declaredDefects list, flipped the way
  // handleChangeDefect flips a defect chip. Inside the tasting body, so it
  // always retires a pending undo (Task 2).
  function handleToggleDeclaredDefect(word) {
    recordPen.edit(toggleDeclaredDefect, word);
    setFormStatus('');
    recordPen.retireUndo();
  }

  // Clearing both the strike and the line for a step removes that step's
  // key from the draft entirely (D-13/BATCH1-01): an untouched step must
  // never rest at { struck: false, line: null }, which would be
  // indistinguishable from a step the maker deliberately marked as
  // unchanged — a fact this record never states.
  function handleChangeStepChange(stepNumber, patch) {
    // A step-change key is never a BATTERY_FIELDS key (WR-03) — nothing
    // of this field's own to clear.
    recordPen.edit(setStepChange, stepNumber, patch);
    setFormStatus('');
  }

  // Writes one portion's raw string (D-10). A row with no key yet is
  // seeded with an array of empty strings the length of that row's own
  // portions first, so the array is always aligned with row.portions —
  // the same alignment contract asMadeForPortion reads. Once every
  // portion of a row is back to an empty string, the row's key is deleted
  // entirely — the existing "an empty field means nothing was written"
  // rule (D-13/BATCH1-01), applied at the row level as it is today.
  function handleChangeAsMade(rowId, portionIndex, rawValue) {
    // An as-made row key is never a BATTERY_FIELDS key (WR-03) — nothing
    // of this field's own to clear.
    recordPen.edit(setAsMadePortion, version, rowId, portionIndex, rawValue);
    setFormStatus('');
  }

  // "Correct" reopens the record pen with everything the record holds in
  // the fields — the churn side and, when the batch carries one, the
  // tasting side too (D-03) — pre-filled from the batch, never from the
  // version (task 3, draftFromBatch above).
  //
  // The band's Record a tasting (below 724) opens the same pen through the
  // 'record-a-tasting' opener (sketch 011 decision 30, Mark 2026-10-02,
  // answer 1; route-recipe-batch.md sections 1 and 6): the Tasting section
  // is already open, as if Add tasting had just been pressed, and the Tasted
  // date takes focus through the same attempt counter Add tasting uses. The
  // pre-filled draft and its baseline both carry tastingOpen true, so an
  // untouched pen is clean (Escape closes it, no leave warning) until the
  // maker types. The pen's head is the one Correct's pen shows ("Batch" and
  // "churned {date}"); no board draws another, and the word Correct is only
  // the log head's opener, unmounted while any pen is open.
  function handleStartAmending(batch, { opener = 'correct' } = {}) {
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    recordPen.openAmend(batch, opener);
    if (opener === 'record-a-tasting') {
      addTastingAttemptRef.current += 1;
      setAddTastingAttempt(addTastingAttemptRef.current);
    } else {
      setAddTastingAttempt(null);
    }
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
    setMode('recording');
  }

  // The recipe band's Record a tasting (sketch 011 decision 30, answer 1;
  // below 724, VersionRow.jsx) hands over the batch its label rule read
  // (the version's latest). The pen opens in place only when that batch is
  // the batch in view, so the head, the axes snapshot and the amend save
  // always name the same batch (T-wn0-01). On an older batch's address the
  // band moves to the awaiting batch's own address and the pen opens there
  // (startTastingOnMount, in useRouteIntents). openBatch is the batch in view,
  // computed here by openBatchFor, the rule sheetView uses, because the shell
  // builds its view only below its early returns, after this hook is called.
  function handleStartTasting(batch) {
    const openBatch = openBatchFor(batches, batchId);
    if (openBatch && openBatch.id === batch.id) {
      handleStartAmending(batch, { opener: 'record-a-tasting' });
    } else {
      navigate(notebookPath(version.recipeId, version.id, batch.id), { state: { startTasting: true } });
    }
  }

  // Add tasting (D-01, contract "Focus landings"): opens the tasting
  // section and moves focus to the Tasted date — the section opening and
  // the focus landing are themselves the evidence (contract "Feedback and
  // undo lifecycle": "Adding a tasting writes no announcement at all"), so
  // only the status line is cleared here, never written to.
  function handleAddTasting() {
    setFormStatus('');
    // A stale "Tasting restored." announcement must never linger beside a
    // freshly reopened section (Rule 2): tastingStatus is React state, not
    // tied to the tasting body's own mount/unmount, so it would otherwise
    // survive from an earlier restore into this unrelated reopen.
    setTastingStatus('');
    setRecordStatus('');
    addTastingAttemptRef.current += 1;
    setAddTastingAttempt(addTastingAttemptRef.current);
    recordPen.addTasting();
  }

  // The two hidden-mode removal paths (contract "Feedback and undo
  // lifecycle", the removal path matrix — Pitfall 6: the always-visible
  // mode's two rows are never built): a Remove press with no ink
  // (tastingHasInk false) collapses the section, blanks the tasting side,
  // writes the empty-removal sentence with no undo; a Remove press with
  // ink does the same but captures the tasting's own values in
  // pendingUndo first (tastingPayloadFromDraft, Task 2's restore reads
  // it) and writes the data-removal sentence with its undo clause. Both
  // sentences write to record-status, the end-of-record ceremony's own
  // region (the ninth round, 007 lines 543, 561 — the toast lives where
  // the action was, not formStatus), self-clear after five seconds
  // (plan 02's guarded announce helper), and move focus to the end-of-
  // record ceremony's own Add tasting on the empty path or Restore
  // tasting on the data path — BatchRow's own focus effect (007 lines
  // 542, 560).
  function handleRemoveTasting() {
    setTastingStatus('');
    setRecordStatus('');
    const hasInk = recordPen.removeTasting();
    announce(hasInk ? TASTING_REMOVED_DATA_STATUS : TASTING_REMOVED_EMPTY_STATUS, { selfClear: true, target: 'record' });
    removeTastingAttemptRef.current += 1;
    setRemoveTastingAttempt(removeTastingAttemptRef.current);
  }

  // The restore sequence (contract "Feedback and undo lifecycle"):
  // reopens the section and writes the payload back field-by-field
  // (restoreDraftFromUndo, T-03.3.1-10), clears pendingUndo, focuses the
  // Remove control, and announces "Tasting restored." to tasting-status —
  // the one path that writes to that channel in this build (Pitfall 6:
  // the always-visible mode's own tasting-status announcements are never
  // built). The restore toast self-clears after five seconds, the same
  // guarded five-second clear the removal toasts already carry.
  function handleUndoRemove() {
    recordPen.undoRemoveTasting();
    announce(TASTING_RESTORED_STATUS, { selfClear: true, target: 'tasting' });
    restoreAttemptRef.current += 1;
    setRestoreAttempt(restoreAttemptRef.current);
  }

  // The one save (D-01/D-02/D-03/D-04): every battery measurement
  // validates first (RESEARCH.md Open Question 3), then the churn date
  // (D-05) — Save stays enabled until a valid attempt begins; the two
  // ceremonies then lock together for the persistence boundary so repeat
  // activation cannot write two records. validateRecordDraft is the one
  // traversal both validation blocks flow through. Only once the draft is
  // clean do the two impure calls (a fresh id,
  // the current instant) run, here, in the one save handler — createBatch
  // and completeRecord stay deterministic. Amending (amendingBatchId set)
  // calls completeRecord on the batch being amended instead of createBatch
  // — a correction is never a new event and never retakes the snapshot
  // (BATCH2-01), and every completing save stamps `changed` (D-04). A
  // tasting object is assembled only when the section is open and holds
  // ink (D-02); a null tasting on completeRecord removes a stored one
  // (RESEARCH.md Assumption A3 — surfaced in this plan's SUMMARY for
  // end-of-phase UAT).
  function handleSaveBatch() {
    if (batchSaveLockRef.current) return;
    const check = recordPen.checkSave();

    if (check.outcome === 'measurement') {
      announce(MEASURED_INVALID_STATUS);
      return;
    }

    if (check.outcome === 'churnDate') {
      announce(CHURN_DATE_BLOCKED_STATUS);
      return;
    }

    batchSaveLockRef.current = true;
    const saveAction = amendingBatchId ? 'amend' : 'new';
    setBatchSaveAction(saveAction);
    announce('');

    let now;
    let churnFields;
    let tasting;
    try {
      now = new Date().toISOString();
      ({ churnFields, tasting } = recordPen.buildFields(check.parsed));
    } catch {
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      announce(BATCH_SAVE_ERROR);
      return;
    }

    if (amendingBatchId) {
      let record;
      try {
        const batchBeingAmended = batches.find((batch) => batch.id === amendingBatchId);
        record = completeRecord(batchBeingAmended, churnFields, tasting, { now });
      } catch {
        batchSaveLockRef.current = false;
        setBatchSaveAction(null);
        announce(BATCH_SAVE_ERROR);
        return;
      }
      Promise.resolve().then(() => repository.saveBatch(record)).then(() => {
        discardDraft();
        setBatches((prev) => prev.map((batch) => (batch.id === record.id ? record : batch)));
        setMode('reading');
        recordPen.close();
        setFormStatus('');
        batchSaveLockRef.current = false;
        setBatchSaveAction(null);
        onPageStatus(batchSavedStatus(record));
        focusBatchAttemptRef.current += 1;
        setFocusBatchAttempt(focusBatchAttemptRef.current);
      }).catch(() => {
        batchSaveLockRef.current = false;
        setBatchSaveAction(null);
        announce(BATCH_SAVE_ERROR);
      });
      return;
    }

    let record;
    try {
      record = createBatch(version, churnFields, tasting, { id: freshId(), now });
    } catch {
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      announce(BATCH_SAVE_ERROR);
      return;
    }

    Promise.resolve().then(() => repository.saveBatch(record)).then(() => {
      discardDraft();
      setBatches((prev) => [...prev, record]);
      setMode('reading');
      recordPen.close();
      setFormStatus('');
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      onPageStatus(batchSavedStatus(record));
      navigate(notebookPath(version.recipeId, version.id, record.id), { state: { focusBatch: true } });
    }).catch(() => {
      batchSaveLockRef.current = false;
      setBatchSaveAction(null);
      announce(BATCH_SAVE_ERROR);
    });
  }

  // The deliberate, in-app abandonment path (A-1): returns to reading,
  // drops the draft, and clears the amend target and every blocked/error
  // state, writing nothing, and deletes the kept draft (D-16). Nothing needs
  // to navigate:
  // the batch on screen is derived from the URL and the loaded batch list,
  // never from the draft, so the page already shows the right thing once
  // mode returns to reading.
  function handleCancelRecording() {
    discardDraft();
    batchSaveLockRef.current = false;
    setBatchSaveAction(null);
    setFocusBatchAttempt(null);
    onPageStatus('');
    setMode('reading');
    recordPen.cancel();
    setAddTastingAttempt(null);
    setTastingStatus('');
    setRecordStatus('');
    setRemoveTastingAttempt(null);
    setRestoreAttempt(null);
    setFormStatus('');
  }

  // The band's Go to batch row lands focus on the Batch heading through this
  // counter: the same two lines an amendment save runs.
  function focusBatch() {
    focusBatchAttemptRef.current += 1;
    setFocusBatchAttempt(focusBatchAttemptRef.current);
  }

  // The kept record draft's restore (useKeptDraft's onRestoreRecord): the pen
  // takes the record and the page enters recording.
  function restoreRecord(record) {
    recordPen.restore(record);
    setMode('recording');
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
    addTastingAttempt,
    removeTastingAttempt,
    restoreAttempt,
    batchSaveAction,
    focusBatchAttempt,
    focusBatch,
    restoreRecord,
    handleStartRecording,
    handleChangeRecordField,
    handleChangeSegment,
    handleChangeRecordMark,
    handleClearAxisMark,
    handleClearSegment,
    handleChangeMarkOne,
    handleClearMarkOne,
    handleChangeDefect,
    handleToggleDeclaredDefect,
    handleChangeStepChange,
    handleChangeAsMade,
    handleStartAmending,
    handleStartTasting,
    handleAddTasting,
    handleRemoveTasting,
    handleUndoRemove,
    handleSaveBatch,
    handleCancelRecording,
  };
}
