// The battery's one 3-way segmented control (contract "Controls spec"): a
// role="radiogroup" of native radio inputs, restyled — the codebase's own
// established pattern for keyboard semantics it gets free (AxisMark.jsx's
// header comment). One home for all three uses (Exit consistency,
// Airiness (estimated), Melt style (optional)) rather than three
// near-duplicate renderings. A joined group is a radio (007 @ 2a212be
// line 362): picking is final — a second click on the picked option
// changes nothing. Clear, in the control's own caption line (Plan 04
// adds it), is the way back. The click stays on onClick, with a no-op
// onChange to keep React's controlled-input contract happy: a native
// radio's onChange does not re-fire for a click that leaves its value
// unchanged, so onClick is the one path that always fires. No option is
// ever pre-picked: `value` is expected to be '' (or any string matching
// no option) for a fresh field.
export function Segmented({ groupLabel, options, value, onChange }) {
  const groupName = `segment-${groupLabel.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
  return (
    <div className="segmented" role="radiogroup" aria-label={groupLabel}>
      {options.map((option) => (
        <label key={option} className="segmented__option">
          <input
            type="radio"
            name={groupName}
            value={option}
            checked={value === option}
            onChange={() => {}}
            onClick={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
