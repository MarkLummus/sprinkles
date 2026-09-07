// One graduated rule for one figure descriptor from buildFigures — a
// printed scale, the authored band (if any) as a hatch, a tick at the
// value's position, and the deviation stated in words. Nothing here
// computes a figure; it only draws the one it is given.
//
// Stroke weights mirror the direction contract's rule-drawing tokens
// (route-recipe.md § 4 / tokens.css --rule-*), expressed as plain numbers
// because SVG presentation attributes read user-space units, not CSS
// lengths. Colour is never a literal — every stroke reads var(--ink).
const WIDTH = 320;
const HEIGHT = 30;
const GRADUATION_COUNT = 10;
const RULE_BASELINE = 1.5;
const RULE_GRADUATION = 1;
const RULE_BAND_EDGE = 1;
const RULE_TICK = 2.5;
const HATCH_STROKE = 1.2;

const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));

// "a, b, and c" — same joining rule BasisNote uses for its own estimated-rows
// clause; duplicated locally rather than imported, since BasisNote is a
// component, not a shared utility module.
function joinNames(names) {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

export function GraduatedRule({ figure, tabIndex, onFocusFigure, onBlurFigure }) {
  const { key, label, value, unit, decimals, domain, band, deviation, basis, estimatedRowNames } = figure;
  const [lo, hi] = domain;
  const toX = (v) => ((clamp(v, lo, hi) - lo) / (hi - lo)) * WIDTH;

  const graduations = [];
  for (let i = 0; i <= GRADUATION_COUNT; i += 1) {
    const gx = (i / GRADUATION_COUNT) * WIDTH;
    graduations.push(
      <line
        key={i}
        x1={gx}
        y1={18}
        x2={gx}
        y2={i % 5 === 0 ? 24 : 21}
        stroke="var(--ink)"
        strokeWidth={RULE_GRADUATION}
      />,
    );
  }

  const targetText = band ? `target ${band[0]}–${band[1]}${unit}` : 'no target set';
  // A figure resting on estimated or unreviewed data says so beside itself
  // (D-04), naming the rows it rests on — never as a colour, only as text,
  // in the rendering and in the accessible name alike.
  const basisWord = basis === 'estimated' ? 'estimated' : basis === 'inherited' ? 'unreviewed' : null;
  const basisText = basisWord ? `${basisWord}: ${joinNames(estimatedRowNames)}` : null;
  const accessibleName = basisText
    ? `${label}, ${value.toFixed(decimals)}${unit}, ${targetText}, ${basisText}`
    : `${label}, ${value.toFixed(decimals)}${unit}, ${targetText}`;
  const hatchId = `hatch-${key}`;

  return (
    // A focusable control, not a decoration: focusing it (keyboard or
    // pointer) is the brief's signature trace, marking the ingredient rows
    // this figure rests on (route-recipe.md § 3, § 5). The whole sentence —
    // label, value, target, basis and its rows — is this button's one
    // accessible name; its children are presentation only. tabIndex is
    // conditional (route-recipe-batch.md § 6, revised 2026-09-07): while
    // recording, the sheet's page order skips these six rules, but they
    // stay clickable and keep this focus treatment.
    <button
      type="button"
      className="graduated-rule"
      aria-label={accessibleName}
      tabIndex={tabIndex}
      onFocus={() => onFocusFigure?.(key)}
      onBlur={() => onBlurFigure?.()}
    >
      <div className="graduated-rule__head" aria-hidden="true">
        <span className="graduated-rule__label">{label}</span>
        <span className="graduated-rule__value">
          {value.toFixed(decimals)}
          {unit}
        </span>
      </div>
      {basisText && (
        <p className="graduated-rule__basis" aria-hidden="true">
          {basisText}
        </p>
      )}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} aria-hidden="true">
        {band && (
          <>
            <defs>
              <pattern id={hatchId} width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="4" stroke="var(--ink)" strokeWidth={HATCH_STROKE} />
              </pattern>
            </defs>
            <rect
              x={toX(band[0])}
              y={4}
              width={Math.max(1, toX(band[1]) - toX(band[0]))}
              height={14}
              fill={`url(#${hatchId})`}
            />
            <line x1={toX(band[0])} y1={2} x2={toX(band[0])} y2={20} stroke="var(--ink)" strokeWidth={RULE_BAND_EDGE} />
            <line x1={toX(band[1])} y1={2} x2={toX(band[1])} y2={20} stroke="var(--ink)" strokeWidth={RULE_BAND_EDGE} />
          </>
        )}
        <line x1="0" y1={18} x2={WIDTH} y2={18} stroke="var(--ink)" strokeWidth={RULE_BASELINE} />
        {graduations}
        <line x1={toX(value)} y1={0} x2={toX(value)} y2={22} stroke="var(--ink)" strokeWidth={RULE_TICK} />
      </svg>
      <div className="graduated-rule__anchors" aria-hidden="true">
        <span>{lo}</span>
        <span className="graduated-rule__deviation">{deviation.words}</span>
        <span>{hi}</span>
      </div>
    </button>
  );
}
