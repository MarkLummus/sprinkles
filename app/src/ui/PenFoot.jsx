// The one save ceremony (D-01, 03.3.1-02; the ninth round, D-14 — the
// contract's footer order reversed): both mounts — the record pen's foot
// (this file's own PenFoot below) and the end of the record (BatchRow,
// ceremony A) — render this exact component and read, in DOM order, Add
// tasting | Cancel | Save batch, right-aligned at every width (007 @
// 109733d lines 55, 301-306, 310-314, 484). Restore tasting stands in the
// opener's own place while a restore is pending (lines 245, 303, 505-510)
// — the foot has no restore slot at all (lines 310-314), so only
// ceremony A's own mount is ever given onRestore. hint is the record
// pen's own blocked-date sentence (D-05), read from the one RecipePage
// state both mounts share, so the two can never disagree. Save is never
// disabled for completeness — the tasting completeness gate this
// ceremony's ancestor once carried is retired with D-02 — but every
// action locks during persistence so a double press cannot create two
// records. status is ceremony A's own live region —
// the removal toasts' home (007 line 304; the ninth round, Pattern 5) —
// rendered FIRST so it reads before the hint or any control; the foot's
// own mount passes no status, so it renders no region at all.
export function SaveCeremony({
  onCancel,
  onSave,
  hint,
  status,
  saveAction = null,
  onAddTasting = null,
  addTastingRef = null,
  onRestore = null,
  restoreRef = null,
}) {
  return (
    <div className="save-ceremony">
      {typeof status === 'string' && (
        <p className="save-ceremony__status pen-helper" role="status" aria-live="polite">
          {status}
        </p>
      )}
      {hint && <p className="save-ceremony__hint">{hint}</p>}
      {onRestore && (
        <button type="button" disabled={saveAction !== null} className="text-control undo-control" ref={restoreRef} onClick={onRestore}>Restore tasting</button>
      )}
      {onAddTasting && (
        <button type="button" disabled={saveAction !== null} className="text-control save-ceremony__add-tasting" ref={addTastingRef} onClick={onAddTasting}>Add tasting</button>
      )}
      <button type="button" disabled={saveAction !== null} onClick={onCancel}>
        Cancel
      </button>
      <button type="button" disabled={saveAction !== null} onClick={onSave}>
        {saveAction === 'amend' ? 'Saving changes…' : saveAction === 'new' ? 'Saving batch…' : 'Save batch'}
      </button>
    </div>
  );
}

// The foot band (route-recipe.md § 3 "The imprint"; D-26): shown only
// while a pen is open — a hairline ink rule across the whole page, then
// the open pen's own Cancel/Save. The version pen saves only from the
// band now (03.5-04 Task 3: 1600-pen.html draws no foot pair for it —
// its ceremony lives whole in VersionRow.jsx); this foot renders nothing
// for openPen 'plan'. The record and amend pens still share the one
// SaveCeremony component with BatchRow's own end-of-record mount (D-01)
// — the tasting pen's own branch retired with 03.3.1-02 (D-01/D-03: the
// tasting section folds into the record pen, never a fourth pen). It
// computes nothing and holds no state: the handler references it is
// given are the same ones the ceremony calls. Add tasting (D-01,
// 03.3.1-03; reordered first by the ninth round's D-14) mounts inside the
// ceremony itself, exactly while `tastingOpen` and `pendingUndo` are both
// false — the foot renders no restore slot at all (007 lines 310-314;
// that control lives only on ceremony A's own mount, BatchRow.jsx).
export function PenFoot({
  openPen,
  penHint,
  batchSaveAction = null,
  tastingOpen,
  pendingUndo = null,
  onCancelRecording,
  onSaveBatch,
  onAddTasting,
}) {
  if (openPen === null || openPen === 'plan') return null;

  return (
    <footer className="pen-foot">
      <hr className="pen-foot__rule" aria-hidden="true" />
      <div className="pen-foot__controls">
        <SaveCeremony
          onCancel={onCancelRecording}
          onSave={onSaveBatch}
          hint={penHint}
          saveAction={batchSaveAction}
          onAddTasting={!tastingOpen && !pendingUndo ? onAddTasting : null}
        />
      </div>
    </footer>
  );
}
