// The one fold head every below-desktop fold in the recipe route uses
// (sketch 011 decisions 18/19, gen.py's own fold_row; 03.5-15 Task 1): a
// full-row button holding the label, then Show or Hide (plus an optional
// word), and an optional count or date at the row's end. The class is
// `fold-row` only — not `text-control` or `history-disclosure`
// (decisions_recorded 3) — so neither the log's/version column's blue
// `.text-control` scope nor the touch union's `.text-control` rule
// reaches it; its own CSS rule (notebook.css) carries fold_row's inline
// resets and the 44px touch floor at every pointer.
export function FoldRow({ label, open, onToggle, controls, what, count }) {
  const controlWord = (open ? 'Hide' : 'Show') + (what ? ` ${what}` : '');
  return (
    <button type="button" className="fold-row" aria-expanded={open} aria-controls={controls} onClick={onToggle}>
      <span className="fold-row__head">
        {label}
        <span className="fold-row__control">{controlWord}</span>
      </span>
      {count ? <span className="fold-row__count">{count}</span> : null}
    </button>
  );
}
