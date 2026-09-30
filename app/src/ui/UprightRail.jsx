import { Link } from 'react-router';

// UprightRail: the vertical list row drawn by counts.py's vnode/vrail_
// (batches, sketch 011 decision 19) and reused by gen.py's history_upright
// (versions, plan 18) — one component for both, since the row's shape (a
// 12px mark, a 14px gap, a row at least 44px tall, a title over a 12px meta
// line, and a 1px connector down to the next row) is identical either way
// (decisions_recorded 1, 03.5-17). The mark sits in a box as tall as the
// title line, as upright-393.html draws it (G-03.5-5, 03.5-24); the
// connector is the row's ::before in notebook.css, ahead of the link.
//
// entry: { key, title, meta, filled, inView, to, state }. The row in view
// is never a link (decisions_recorded 2) — it renders as a span, bold ink,
// no underline, whether or not it carries a `to` (an in-view entry's `to`,
// if given, is simply not used as a link). An entry with no `to` and not in
// view also renders as a span — the caller sets `to` to null while any pen
// is open (D-UAT-1/2's link suppression), so the row still reads but is not
// a link.
export function UprightRail({ id, label, entries, hidden }) {
  return (
    <ol id={id} className="notebook-upright" aria-label={label} hidden={hidden}>
      {entries.map((entry) => {
        const markClassName = [
          'notebook-upright__mark',
          entry.filled ? 'notebook-upright__mark--filled' : null,
          entry.inView ? 'notebook-upright__mark--in-view' : null,
        ]
          .filter(Boolean)
          .join(' ');
        const inner = (
          <>
            <span className="notebook-upright__mark-box">
              <span aria-hidden="true" className={markClassName} />
            </span>
            <span className="notebook-upright__text">
              <span className="notebook-upright__title">{entry.title}</span>
              <span className="notebook-upright__meta">{entry.meta}</span>
            </span>
          </>
        );
        return (
          <li key={entry.key} className="notebook-upright__row">
            {entry.to && !entry.inView ? (
              <Link to={entry.to} state={entry.state} tabIndex={0} className="notebook-upright__link">
                {inner}
              </Link>
            ) : (
              <span className="notebook-upright__link" aria-current={entry.inView ? 'page' : undefined}>
                {inner}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
