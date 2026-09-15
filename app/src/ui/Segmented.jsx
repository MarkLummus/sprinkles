import { useRef } from 'react';

// The battery's one 3-way segmented control (contract "Controls spec"): a
// role="radiogroup" of native radio inputs, restyled — the codebase's own
// established pattern for keyboard semantics it gets free (AxisMark.jsx's
// header comment). One home for all three uses (Exit consistency,
// Airiness (estimated), Melt style) rather than three near-duplicate
// renderings — now including the caption line and its Clear (007 @
// 2a212be lines 220, 228, 289, 350, 375-381): the caption line is this
// component's own head, with Clear as its last child, right-aligned once
// something is picked. A joined group is a radio (007 line 362): picking
// is final — a second click on the picked option changes nothing. Clear
// is the only way back, and — mirroring AxisMark.jsx's own handleClear —
// it moves focus to the first option only on a keyboard activation (the
// click-count guard the sketch names at line 379); a mouse Clear leaves
// the tab position on Clear so the next Tab still reaches the first
// option with its ring.
// The click stays on onClick, with a no-op onChange to keep React's
// controlled-input contract happy: a native radio's onChange does not
// re-fire for a click that leaves its value unchanged, so onClick is the
// one path that always fires. No option is ever pre-picked: `value` is
// expected to be '' (or any string matching no option) for a fresh field.
export function Segmented({ groupLabel, options, value, onChange, onClear }) {
  const groupName = `segment-${groupLabel.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  const captionId = `${groupName}-caption`;
  const picked = options.includes(value);
  const firstOptionRef = useRef(null);

  function handleClear(event) {
    onClear();
    if (event.detail === 0) firstOptionRef.current?.focus();
  }

  return (
    <div className="segmented-field">
      <div className="segmented-field__head">
        <span className="segmented-field__caption pen-caption" id={captionId}>
          {groupLabel}
        </span>
        {picked && (
          <button
            type="button"
            className="text-control segmented-field__clear"
            aria-label={`Clear ${groupLabel}`}
            onClick={handleClear}
          >
            Clear
          </button>
        )}
      </div>
      <div className="segmented" role="radiogroup" aria-label={groupLabel}>
        {options.map((option, index) => (
          <label key={option} className="segmented__option">
            <input
              type="radio"
              name={groupName}
              value={option}
              checked={value === option}
              ref={index === 0 ? firstOptionRef : undefined}
              onChange={() => {}}
              onClick={() => onChange(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
