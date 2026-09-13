import { useRef } from 'react';
import { STOPS, stopWordsFor } from '../domain/axes.js';

// The five-stop goldilocks track (D-16, contract "Axes spec"; rebuilt in
// 03.3.1-03 Task 2 from the nine half-stop behavioural-anchor shape to the
// battery's fixed six-axis table). Native grouped radios do almost all of
// the mechanism: the browser already gives the group arrow-key movement
// between stops, one-click and Space setting, and a single accessible
// name. Chrome does not natively move a native radiogroup's focus on
// Home/End (verified live, 03.3.1-06 Task 3), so a minimal Home/End-only
// keydown handler below covers that one gap — it names no arrow key and
// holds no focus-index state, so Pitfall 5's "no hand-rolled radiogroup"
// line still holds (restyling the native inputs in tokens.css gets the
// hairline-ink look without reimplementing arrow-key semantics).
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
  const stopRefs = useRef([]);

  function handleStopClick(stop) {
    onChange(value === stop ? null : stop);
  }

  function handleClear() {
    onClear();
    firstStopRef.current?.focus();
  }

  // Home/End only — arrow-key movement is native. Focuses and selects the
  // first/last stop directly (never via .click(), which would run
  // handleStopClick's click-again-clears toggle — a move to an already-
  // checked end must always select it, never clear it, matching arrow-key
  // behavior).
  function handleStopsKeyDown(event) {
    if (event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const index = event.key === 'Home' ? 0 : STOPS.length - 1;
    stopRefs.current[index]?.focus();
    onChange(STOPS[index]);
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
      <div
        className="axis-mark__stops"
        role="group"
        aria-labelledby={nameId}
        onKeyDown={handleStopsKeyDown}
      >
        {STOPS.map((stop, index) => (
          <label key={stop} className="axis-mark__stop">
            <input
              type="radio"
              name={groupName}
              value={stop}
              checked={value === stop}
              ref={(el) => {
                stopRefs.current[index] = el;
                if (index === 0) firstStopRef.current = el;
              }}
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
