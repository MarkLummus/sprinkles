// Pure. No imports at all — not even from axes.js or batch.js. The
// battery's measured-field table, its segmented-control options, its
// defect chips, the declared flaw, and the numeric draft parser, all
// verbatim from the structural contract's "Controls spec" (sketch 007).
// See 03.3.1-CONTEXT.md D-07, D-09, D-10.

/**
 * BATTERY_FIELDS: the six numeric fields the battery carries, one entry
 * per field: key (the stored field name), label (visible), unit, signed
 * (true only for the two °C fields — Out of machine, Tasting
 * temperature), and error (the contract's verbatim sentence for a
 * malformed value on this field).
 */
const TEMPERATURE_ERROR = 'Enter a temperature, such as −6, or leave blank.';
const NON_NEGATIVE_ERROR = 'Enter zero or a positive number, or leave blank.';

export const BATTERY_FIELDS = [
  { key: 'timeToDrawTempMinutes', label: 'Time to draw temp.', unit: 'min', signed: false, error: NON_NEGATIVE_ERROR },
  { key: 'outOfMachineTempC', label: 'Out of machine', unit: '°C', signed: true, error: TEMPERATURE_ERROR },
  { key: 'churnDurationMinutes', label: 'Churn duration', unit: 'min', signed: false, error: NON_NEGATIVE_ERROR },
  { key: 'temperingMinutes', label: 'Tempering', unit: 'min', signed: false, error: NON_NEGATIVE_ERROR },
  { key: 'tastingTempC', label: 'Tasting temperature', unit: '°C', signed: true, error: TEMPERATURE_ERROR },
  { key: 'meltTestG', label: 'Melt test', unit: 'g lost at 20 min', signed: false, error: NON_NEGATIVE_ERROR },
];

/**
 * SEGMENT_OPTIONS: the three segmented controls' option strings, verbatim
 * from the contract's "Controls spec".
 */
export const SEGMENT_OPTIONS = {
  exitConsistency: ['Smooth ribbon', 'Wet, soupy', 'Chunky, separated'],
  airiness: ['Low, dense', 'Medium, standard', 'High, airy'],
  meltStyle: ['Watery, weeping', 'Creamy puddle', 'Stable foam'],
};

/** DEFECTS: the four defect chips, verbatim (comma-worded per the contract). */
export const DEFECTS = ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film'];

/** DECLARED_FLAW: the one declared-flaw chip this battery carries. */
export const DECLARED_FLAW = 'Bitter';

/**
 * parseMeasuredDraft(raw, { signed }) -> { ok, value }. Per the contract's
 * "Controls spec": blank is always allowed; a Unicode minus is normalized
 * to ASCII; a decimal comma is accepted alongside a decimal point; a value
 * malformed in any way returns not-ok, never a silently coerced null
 * (Pitfall 4); negatives are rejected unless `signed`.
 */
export function parseMeasuredDraft(raw, { signed = false } = {}) {
  if (raw == null || raw === '') return { ok: true, value: null };
  const normalized = raw.replace(/−/g, '-').replace(/,/g, '.').trim();
  if (!/^-?\d*\.?\d*$/.test(normalized) || normalized === '' || normalized === '-') {
    return { ok: false, value: null };
  }
  const value = Number(normalized);
  if (!Number.isFinite(value)) return { ok: false, value: null };
  if (!signed && value < 0) return { ok: false, value: null };
  return { ok: true, value };
}
