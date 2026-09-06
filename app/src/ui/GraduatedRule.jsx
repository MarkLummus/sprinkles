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

export function GraduatedRule({ figure }) {
  const { key, label, value, unit, decimals, domain, band, deviation } = figure;
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
  const accessibleName = `${label}, ${value.toFixed(decimals)}${unit}, ${targetText}`;
  const hatchId = `hatch-${key}`;

  return (
    <div className="graduated-rule">
      <div className="graduated-rule__head">
        <span className="graduated-rule__label">{label}</span>
        <span className="graduated-rule__value">
          {value.toFixed(decimals)}
          {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label={accessibleName}>
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
      <div className="graduated-rule__anchors">
        <span>{lo}</span>
        <span className="graduated-rule__deviation">{deviation.words}</span>
        <span>{hi}</span>
      </div>
    </div>
  );
}
