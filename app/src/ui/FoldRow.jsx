// The one fold head every below-desktop fold in the recipe route uses
// (sketch 011 decisions 18/19, gen.py's own fold_row; 03.5-15 Task 1): a
// full-row button holding the label, then Show or Hide (plus an optional
// word), and an optional count or date at the row's end. The class is
// `fold-row` only — not `text-control` or `history-disclosure`
// (decisions_recorded 3) — so neither the log's/version column's blue
// `.text-control` scope nor the touch union's `.text-control` rule
// reaches it; its own CSS rule (notebook.css) carries fold_row's inline
// resets and the 44px touch floor at every pointer.
// labelText: the label's own plain-string form for the accessible name
// below (WR-01, 03.5 review) — most callers' label IS already that string;
// callers whose label is a caption element (VersionRow, BatchRow's batch
// list, RecipeHistory) pass it separately, since aria-label cannot read a
// React element. The visible markup below is untouched — label, control
// word and count stay three adjacent DOM text nodes exactly as before, so
// no layout gap changes; only the button's computed accessible name gains
// real word boundaries. WR-01's boundary was a space, which gave separate
// words but no pause; a comma is what VoiceOver pauses on, so the label,
// the control word and any count are comma-joined (G-03.5-7).
export function FoldRow({ label, labelText, open, onToggle, controls, what, count }) {
  const controlWord = (open ? 'Hide' : 'Show') + (what ? ` ${what}` : '');
  const name = typeof label === 'string' ? label : labelText;
  if (typeof name !== 'string' && import.meta.env?.DEV) {
    throw new Error('FoldRow needs a string label or a string labelText');
  }
  const accessibleName = `${name}, ${controlWord}${count ? `, ${count}` : ''}`;
  return (
    <button
      type="button"
      className="fold-row"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={accessibleName}
      onClick={onToggle}
    >
      <span className="fold-row__head">
        {label}
        <span className="fold-row__control">{controlWord}</span>
      </span>
      {count ? <span className="fold-row__count">{count}</span> : null}
    </button>
  );
}
