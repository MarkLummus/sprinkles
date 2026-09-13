import { useEffect, useRef } from 'react';

// The one save ceremony (D-01, 03.3.1-02): Cancel | Save batch, same
// markup and same label wherever it mounts — the record pen's foot
// (this file's own PenFoot below) and the end of the record (BatchRow,
// ceremony A) both render this exact component, differing only in
// placement. hint is the record pen's own blocked-date sentence (D-05),
// read from the one RecipePage state both mounts share, so the two can
// never disagree. Save is never disabled here — the tasting completeness
// gate this ceremony's ancestor once carried is retired with D-02; the
// only block either mount can show is the hint text beside it.
export function SaveCeremony({ onCancel, onSave, hint }) {
  return (
    <div className="save-ceremony">
      {hint && <p className="save-ceremony__hint">{hint}</p>}
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
// Pattern 2, T-03.1-03). Add tasting (D-01, 03.3.1-03) mounts beside this
// ceremony, in the same controls block, exactly while `tastingOpen` is
// false — the contract's own footer order ("Cancel | Save batch | Add
// tasting"); it hides itself the instant the section opens, since the
// record then already offers the section it names.
export function PenFoot({
  openPen,
  canSaveOver,
  penHint,
  tastingOpen,
  removeTastingAttempt = null,
  onCancelDeveloping,
  onSaveAsNewVersion,
  onSaveOverVersion,
  onCancelRecording,
  onSaveBatch,
  onAddTasting,
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
          <>
            <SaveCeremony onCancel={onCancelRecording} onSave={onSaveBatch} hint={penHint} />
            {!tastingOpen && (
              <button type="button" className="text-control" ref={addTastingRef} onClick={onAddTasting}>
                Add tasting
              </button>
            )}
          </>
        )}
      </div>
    </footer>
  );
}
