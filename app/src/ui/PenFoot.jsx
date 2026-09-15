import { useEffect, useRef } from 'react';

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
// disabled here — the tasting completeness gate this ceremony's ancestor
// once carried is retired with D-02; the only block either mount can show
// is the hint text beside it.
export function SaveCeremony({
  onCancel,
  onSave,
  hint,
  onAddTasting = null,
  addTastingRef = null,
  onRestore = null,
  restoreRef = null,
}) {
  return (
    <div className="save-ceremony">
      {hint && <p className="save-ceremony__hint">{hint}</p>}
      {onRestore && (
        <button type="button" className="text-control undo-control" ref={restoreRef} onClick={onRestore}>Restore tasting</button>
      )}
      {onAddTasting && (
        <button type="button" className="text-control save-ceremony__add-tasting" ref={addTastingRef} onClick={onAddTasting}>Add tasting</button>
      )}
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" onClick={onSave}>
        Save batch
      </button>
    </div>
  );
}

// The foot band (route-recipe.md § 3 "The imprint"; D-26): shown only
// while a pen is open — a hairline ink rule across the whole page, then
// the open pen's own Cancel/Save. The plan pen keeps its own markup
// (Save/Save as, gated by canSaveOver); the record and amend pens share
// the one SaveCeremony component with BatchRow's own end-of-record mount
// (D-01) — the tasting pen's own branch retires with 03.3.1-02 (D-01/D-03:
// the tasting section folds into the record pen, never a fourth pen).
// It computes nothing and holds no state: the handler references it is
// given are the same ones the ceremony calls, and penHint is the page's
// own one derivation (RecipePage, beside canSaveOver) — so there is one
// save path and one save hint per pen, never a second copy (RESEARCH.md
// Pattern 2, T-03.1-03). Add tasting (D-01, 03.3.1-03; reordered first by
// the ninth round's D-14) mounts inside the ceremony itself, exactly while
// `tastingOpen` and `pendingUndo` are both false — the foot renders no
// restore slot at all (007 lines 310-314; that control lives only on
// ceremony A's own mount, BatchRow.jsx).
export function PenFoot({
  openPen,
  canSaveOver,
  penHint,
  tastingOpen,
  removeTastingAttempt = null,
  pendingUndo = null,
  onCancelDeveloping,
  onSaveAsNewVersion,
  onSaveOverVersion,
  onCancelRecording,
  onSaveBatch,
  onAddTasting,
  onUndoRemove,
}) {
  // Remove tasting's own focus landing (D-01, contract "Focus landings":
  // both hidden-mode removal paths move focus to Add tasting) — the same
  // WR-01 attempt-counter pattern as BatchRow's own churnDateRef/
  // tastedDateRef effects, so a second consecutive removal still re-fires
  // even though Add tasting was already on screen. Must sit above the
  // early return below — hooks cannot be called conditionally.
  const addTastingRef = useRef(null);
  useEffect(() => {
    if (removeTastingAttempt != null) addTastingRef.current?.focus();
  }, [removeTastingAttempt]);

  if (openPen === null) return null;

  return (
    <footer className="pen-foot">
      <hr className="pen-foot__rule" aria-hidden="true" />
      <div className="pen-foot__controls">
        {openPen === 'plan' && (
          <>
            {penHint && <p className="pen-foot__blocked">{penHint}</p>}
            <button type="button" onClick={onCancelDeveloping}>
              Cancel
            </button>
            {canSaveOver ? (
              <>
                <button type="button" onClick={onSaveAsNewVersion}>
                  Save as
                </button>
                <button type="button" onClick={onSaveOverVersion}>
                  Save
                </button>
              </>
            ) : (
              <button type="button" onClick={onSaveAsNewVersion}>
                Save
              </button>
            )}
          </>
        )}
        {(openPen === 'record' || openPen === 'amend') && (
          <SaveCeremony
            onCancel={onCancelRecording}
            onSave={onSaveBatch}
            hint={penHint}
            onAddTasting={!tastingOpen && !pendingUndo ? onAddTasting : null}
            addTastingRef={addTastingRef}
          />
        )}
      </div>
    </footer>
  );
}
