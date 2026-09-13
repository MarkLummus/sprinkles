// The battery's one 3-way segmented control (contract "Controls spec"): a
// role="radiogroup" of native radio inputs, restyled — the codebase's own
// established pattern for keyboard semantics it gets free (AxisMark.jsx's
// header comment). One home for all three uses (Exit consistency,
// Airiness (estimated), Melt style (optional)) rather than three
// near-duplicate renderings. Clicking the checked option again clears it
// (contract "Blank stays blank" — click-again clears): a native radio's
// onChange does not re-fire for a click that leaves its value unchanged,
// so the clear-on-reclick logic lives in onClick, with a no-op onChange to
// keep React's controlled-input contract happy. onChange is called with
// the picked option string, or null when the checked option is clicked
// again — the caller decides how a null is stored (03.3.1-02's own
// blank-is-absent discipline). No option is ever pre-picked: `value` is
// expected to be '' (or any string matching no option) for a fresh field.
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
            onClick={() => onChange(value === option ? null : option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}
