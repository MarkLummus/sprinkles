import { MARK_STOPS, markKeyFor } from '../domain/axes.js';

// The nine-stop keyboard mark group (D-16, 02-RESEARCH.md Pattern 3).
// Native grouped radios are the whole mechanism: the browser already gives
// the group arrow-key movement between stops, Home and End, one-click and
// Space setting, and a single accessible name. No keydown handler, no
// manual focus-index, and no hand-rolled radiogroup div — restyling the
// native inputs (tokens.css) gets the hairline-ink look without
// reimplementing keyboard semantics.
//
// No stop is checked by default: `value` is `undefined` for an unmarked
// axis, which matches no stop, so nothing renders checked (D-16 — a half
// step is a value, not a rounding, and an unmarked axis is not a three).
export function AxisMark({ axis, value, onChange }) {
  const groupName = `axis-${markKeyFor(axis)}`;
  return (
    <fieldset className="axis-mark">
      <legend className="axis-mark__legend">{axis.label}</legend>
      <div
        className="axis-mark__row"
        role="group"
        aria-label={`${axis.label}, ${axis.low} to ${axis.high}`}
      >
        <span className="axis-mark__anchor" aria-hidden="true">
          {axis.low}
        </span>
        {MARK_STOPS.map((stop) => (
          <label key={stop} className="axis-mark__stop">
            <input type="radio" name={groupName} value={stop} checked={value === stop} onChange={() => onChange(stop)} />
            <span className="axis-mark__stop-label">{stop}</span>
          </label>
        ))}
        <span className="axis-mark__anchor" aria-hidden="true">
          {axis.high}
        </span>
      </div>
    </fieldset>
  );
}
