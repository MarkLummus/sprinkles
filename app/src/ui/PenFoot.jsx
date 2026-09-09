// The foot band (route-recipe.md § 3 "The imprint"; D-26): shown only
// while a pen is open — a hairline ink rule across the whole page, then
// the same Cancel/Save pair the open pen's ceremony shows, right-aligned
// under the Notes column, with penHint's sentence beside it. It computes
// nothing and holds no state: the handler references it is given are the
// same ones the ceremony calls, and penSaveDisabled/penHint are the
// page's own one derivation (RecipePage, beside canSaveOver) — so there
// is one save path and one save gate per pen, never a second copy
// (RESEARCH.md Pattern 2, T-03.1-03, T-03.1-08).
export function PenFoot({
  openPen,
  canSaveOver,
  penSaveDisabled,
  penHint,
  onCancelDeveloping,
  onSaveAsNewVersion,
  onSaveOverVersion,
  onCancelRecording,
  onSaveBatch,
  onCancelTasting,
  onSaveTasting,
}) {
  if (openPen === null) return null;

  return (
    <footer className="pen-foot">
      <hr className="pen-foot__rule" aria-hidden="true" />
      <div className="pen-foot__controls">
        {penHint && <p className="pen-foot__blocked">{penHint}</p>}
        {openPen === 'plan' && (
          <>
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
            <button type="button" onClick={onCancelRecording}>
              Cancel
            </button>
            <button type="button" onClick={onSaveBatch} disabled={penSaveDisabled}>
              Save
            </button>
          </>
        )}
        {openPen === 'tasting' && (
          <>
            <button type="button" onClick={onCancelTasting}>
              Cancel
            </button>
            <button type="button" onClick={onSaveTasting} disabled={penSaveDisabled}>
              Save
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
