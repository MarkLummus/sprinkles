// Pure. No framework, no DOM, no store import. The five whole goldilocks stops
// and the readers for a scale's marks and words. The scales themselves are not
// here: the core scales (and the declared pair Body and Oil) are rows of the
// scales table that the app reads at boot and passes in as a catalog (D-01,
// D-02), and a batch keeps its own copy of the definitions it was recorded with
// in its snapshot (D-03). STOPS, stopWordsFor, readMarkWord and setMark stay
// constants and functions because they are the battery's controls, not scales
// (D-03). See 03.3.1-CONTEXT.md D-07/D-10 and the structural contract's "Axes
// spec". A version and a batch snapshot store their declared scales as
// definitions { key, name, low, high, kind, group } (decision 3, TASTE-03); the
// readers below take them as stored and resolve no names.
//
// Storing a kind is not kind-aware presentation. Every scale definition now
// carries its kind, but stopWordsFor, readMarkWord and AxisMark still treat each
// scale as goldilocks, with "right" as the middle stop; no Phase 9 scale is a
// magnitude scale. How a magnitude scale reads (its stop words, its read-back
// word, its middle) is Phase 12's work (decision 3: Phase 9 the definition's
// shape, Phase 10 and Phase 12 the rest).
import { coreScaleDefinitions } from './catalog.js';

/** STOPS: the five whole stops a mark may take (D-07, sketch 007's goldilocks scale). */
export const STOPS = [1, 2, 3, 4, 5];

/**
 * stopWordsFor(axis) -> the five stop words in order, per the contract:
 * the low anchor, "leaning {low}", "right", "leaning {high}", the high
 * anchor. e.g. for Hardness: soft, leaning soft, right, leaning hard, hard.
 */
export function stopWordsFor(axis) {
  return [axis.low, `leaning ${axis.low}`, 'right', `leaning ${axis.high}`, axis.high];
}

/**
 * axesForBatch(batch) -> the core scale definitions the batch was recorded
 * with followed by its declared scale definitions, as stored and in the stored
 * order; no name is resolved. Reads batch.snapshot.coreScales and
 * batch.snapshot.declaredAxes only, and from nowhere else — the snapshot is
 * what protects a stored mark from a later change to the scales table or to
 * the recipe's declared scales, and reaching for a live version record or the
 * catalog here would be exactly the drift this module exists to prevent (D-03).
 */
export function axesForBatch(batch) {
  return [...batch.snapshot.coreScales, ...batch.snapshot.declaredAxes];
}

/**
 * axesForVersion(version, catalog) -> the catalog's core scale definitions
 * followed by the version's declared scale definitions, as stored and in the
 * version's own order. The catalog is an argument (D-02): the domain never
 * reads the store, and it keeps the order it is given, sorting nothing (the
 * catalog is sorted once, where it is built). The version-side twin of
 * axesForBatch: the blank Tasting log prints this list before any batch
 * exists, so it reads version.declaredAxes (the pen reads the same list to
 * open a new batch, and the batch then freezes it into its own snapshot).
 */
export function axesForVersion(version, catalog) {
  return [...coreScaleDefinitions(catalog.scales), ...(version.declaredAxes ?? [])];
}

/** markKeyFor(axis) -> the axis's fixed key. Every axis is fixed now (D-07). */
export function markKeyFor(axis) {
  return axis.key;
}

/**
 * readMarkWord(axis, stop) -> the word the read view prints beside a
 * marked axis's number (the brief's "Soft (2)" rule, § 3): the axis's low
 * anchor for stop 1 or 2, the fixed middle word "right" for stop 3, and
 * the high anchor for stop 4 or 5. RESEARCH.md Assumption A2, resolved
 * this way at planning — whether stops 2 and 4 should instead read their
 * own "leaning {low/high}" stop word is an open wording question flagged
 * for Mark's eyes at end-of-phase UAT, not reopened here.
 */
export function readMarkWord(axis, stop) {
  if (stop <= 2) return axis.low;
  if (stop >= 4) return axis.high;
  return 'right';
}

/**
 * setMark(marks, axisKey, stop) -> a new marks object, never mutating the
 * one it is given. A `stop` of `null` removes axisKey's own key; any other
 * value writes it. This is the one rule for both directions (G-02-6): a
 * marks object holds a key only for a marked axis, the same
 * presence-over-truthiness discipline domain/batch.js applies to the
 * stored record and handleChangeStepChange applies to the step strikes —
 * so an axis returned to unmarked is indistinguishable from one that was
 * never touched, which is what makes a misclick cost nothing. The result
 * is built with object spread and delete, which write only the object's
 * own properties, never through an assignment path that could walk a
 * prototype chain reached by a hand-edited version's axis key (T-02-32).
 */
export function setMark(marks, axisKey, stop) {
  const next = { ...marks };
  if (stop === null) {
    delete next[axisKey];
  } else {
    next[axisKey] = stop;
  }
  return next;
}
