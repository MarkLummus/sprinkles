// The foot band (route-recipe.md § 3 "The imprint"; D-26): shown only
// while a pen is open — a hairline ink rule across the whole page, then
// the same Cancel/Save pair the open pen's ceremony shows, right-aligned
// under the Notes column, with the blocked-save sentence beside it. It
// computes nothing and holds no state: the handler references it is given
// are the same ones the ceremony calls, so there is one save path per
// pen, never a second copy (RESEARCH.md Pattern 2, T-03.1-03).
//
// This plan only wires the plan's own pen (`openPen === 'plan'`) — the
// record's and tasting's pens, and their own handler references, arrive
// in plan 02. Gating on the exact pen this component has handlers for
// (rather than any non-null openPen) keeps a stray Save press during a
// batch pen from calling a plan handler it was never given real state
// for.
export function PenFoot({
  openPen,
  canSaveOver,
  blockedMessage,
  onCancelDeveloping,
  onSaveAsNewVersion,
  onSaveOverVersion,
}) {
  if (openPen !== 'plan') return null;

  return (
    <footer className="pen-foot">
      <hr className="pen-foot__rule" aria-hidden="true" />
      <div className="pen-foot__controls">
        {blockedMessage && <p className="pen-foot__blocked">{blockedMessage}</p>}
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
      </div>
    </footer>
  );
}
