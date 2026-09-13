import { useRef } from 'react';
import { STOPS, stopWordsFor } from '../domain/axes.js';

// The five-stop goldilocks track (D-16, contract "Axes spec"; rebuilt in
// 03.3.1-03 Task 2 from the nine half-stop behavioural-anchor shape to the
// battery's fixed six-axis table). Native grouped radios are the whole
// mechanism: the browser already gives the group arrow-key movement
// between stops, Home and End, one-click and Space setting, and a single
// accessible name. No keydown handler, no manual focus-index, and no
// hand-rolled radiogroup div — restyling the native inputs (tokens.css)
// gets the hairline-ink look without reimplementing keyboard semantics
// (Pitfall 5).
//
// `axis` is one row of domain/axes.js's AXES: { key, name, low, high,
// group }. `value` is the marked stop (1–5) or `undefined` for an
// unmarked axis — matching no stop, so nothing renders checked (D-16 — a
// half step is retired; an unmarked axis is not a three). `onChange(stop)`
// fires on a stop click: the same stop clicked again clears (click-again-
// clears, contract "Blank stays blank"). `onClear()` fires only from the
// explicit per-axis Clear control — the one path the contract's own
// "{Axis name} cleared." announcement is wired to, kept out of onChange so
// re-clicking a stop (a silent clear) can never also announce. Clear also
// returns focus to the scale's first stop, held locally since this
// component alone knows which DOM node that is.
export function AxisMark({ axis, value, onChange, onClear, declaredCaption = null }) {
  const nameId = `axis-name-${axis.key}`;
  const groupName = `axis-${axis.key}`;
  const words = stopWordsFor(axis);
  const isMarked = value !== undefined;
  const firstStopRef = useRef(null);

  function handleStopClick(stop) {
    onChange(value === stop ? null : stop);
  }

  function handleClear() {
    onClear();
    firstStopRef.current?.focus();
  }

  return (
    <div className="axis-mark">
      {declaredCaption && <p className="axes-declared-caption">{declaredCaption}</p>}
      <div className="axis-mark__head">
        <span id={nameId} className="axis-mark__name">
          {axis.name}
        </span>
        <span className="axis-mark__state">{isMarked ? `(${value})` : '(Not recorded)'}</span>
        {isMarked && (
          <button type="button" className="axis-mark__clear" aria-label={`Clear ${axis.name}`} onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      <div className="axis-mark__stops" role="group" aria-labelledby={nameId}>
        {STOPS.map((stop, index) => (
          <label key={stop} className="axis-mark__stop">
            <input
              type="radio"
              name={groupName}
              value={stop}
              checked={value === stop}
              ref={index === 0 ? firstStopRef : undefined}
              aria-label={`${stop}: ${words[index]}`}
              onChange={() => {}}
              onClick={() => handleStopClick(stop)}
            />
            <span aria-hidden="true">{stop}</span>
          </label>
        ))}
      </div>
      <div className="axis-mark__anchors" aria-hidden="true">
        <span>{axis.low}</span>
        <span>right</span>
        <span>{axis.high}</span>
      </div>
    </div>
  );
}
