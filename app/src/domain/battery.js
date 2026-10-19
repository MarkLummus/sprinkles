// Pure. No imports at all — not even from axes.js or batch.js. The
// battery's measured-field table, its segmented-control options, its
// defect chips, the declared problems, and the numeric draft parser, all
// verbatim from the structural contract's "Controls spec" (sketch 007).
// See 03.3.1-CONTEXT.md D-07, D-09, D-10.

/**
 * BATTERY_FIELDS: the five numeric fields the battery carries, one entry
 * per field: key (the stored field name), label (visible), unit, signed
 * (true only for the two °C fields — Out of machine, Tasting
 * temperature), and error (the contract's verbatim sentence for a
 * malformed value on this field).
 */
const TEMPERATURE_ERROR = 'Enter a temperature, such as −6, or leave blank.';
const NON_NEGATIVE_ERROR = 'Enter zero or a positive number, or leave blank.';

export const BATTERY_FIELDS = [
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

/**
 * MARK_ONE_OPTIONS: the two words the pen offers for At draw and From
 * freezer, the "mark one" of a group that holds no other mark (sketch 010
 * D6b). PRINTED_MARK_ONE_OPTIONS: the printed log's three, which keeps
 * See below beside them — the pen has no See below, since the pen's own
 * marks are what that word points to on paper.
 */
export const MARK_ONE_OPTIONS = ['Nothing to note', 'Not evaluated'];
export const PRINTED_MARK_ONE_OPTIONS = ['Nothing to note', 'Not evaluated', 'See below'];

/** DEFECTS: the four defect chips, verbatim (comma-worded per the contract). */
export const DEFECTS = ['Coarse, icy', 'Sandy, gritty', 'Gummy, elastic', 'Greasy film'];

/**
 * declaredProblemsForBatch(batch) -> the declared problems (0 to 2 words)
 * the batch's own snapshot holds, a copy. The declared-problem twin of
 * axesForBatch (axes.js): it reads batch.snapshot.declaredFlaws only, so a
 * later change to the recipe's declared problems never moves a stored batch.
 */
export function declaredProblemsForBatch(batch) {
  return [...(batch.snapshot.declaredFlaws ?? [])];
}

/**
 * coreProblemsForBatch(batch) -> the core problem words the batch's own
 * snapshot holds, a copy. The core-problem twin of declaredProblemsForBatch:
 * it reads batch.snapshot.coreProblems only, so a later edit to the problems
 * table never changes the words a stored batch shows (D-03).
 */
export function coreProblemsForBatch(batch) {
  return [...batch.snapshot.coreProblems];
}

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
