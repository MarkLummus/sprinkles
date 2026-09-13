// Pure. No framework, no DOM, no store import. The battery's fixed
// six-axis table (sketch 007's settled AXES array), the five whole
// goldilocks stops, and the per-batch axis list built from the batch's
// own snapshot — see 03.3.1-CONTEXT.md D-07/D-10 and the structural
// contract's "Axes spec". Every axis is fixed now: there is no longer a
// free-form declared axis authored on the version, only a declared name
// naming one of these six rows (Pitfall 3).

/**
 * AXES: the six fixed axes, verbatim from the contract's "Axes spec",
 * in order. The first four (group 'core') are always present in every
 * tasting; the last two (group 'declared', Body and Oil) are the pair a
 * recipe may declare for itself. `low`/`high` are the two anchor words;
 * the middle anchor is the fixed word "right" for every axis, so it is
 * not stored per row.
 */
export const AXES = [
  { key: 'hardness', name: 'Hardness', low: 'soft', high: 'hard', group: 'core' },
  { key: 'scoopability', name: 'Scoopability', low: 'crumbly', high: 'gummy', group: 'core' },
  { key: 'smoothness', name: 'Smoothness', low: 'grainy', high: 'smooth', group: 'core' },
  { key: 'sweetness', name: 'Sweetness', low: 'less', high: 'more', group: 'core' },
  { key: 'body', name: 'Body', low: 'thin', high: 'heavy', group: 'declared' },
  { key: 'oil', name: 'Oil', low: 'faint', high: 'strong', group: 'declared' },
];

/** STOPS: the five whole stops a mark may take (D-07, sketch 007's goldilocks scale). */
export const STOPS = [1, 2, 3, 4, 5];

/** CORE_AXIS_COUNT: how many of AXES's leading rows are always present. */
export const CORE_AXIS_COUNT = 4;

/**
 * stopWordsFor(axis) -> the five stop words in order, per the contract:
 * the low anchor, "leaning {low}", "right", "leaning {high}", the high
 * anchor. e.g. for Hardness: soft, leaning soft, right, leaning hard, hard.
 */
export function stopWordsFor(axis) {
  return [axis.low, `leaning ${axis.low}`, 'right', `leaning ${axis.high}`, axis.high];
}

/**
 * axesForBatch(batch) -> the four core axes followed by the batch's
 * declared axes, resolved by name against AXES. Reads
 * batch.snapshot.declaredAxes only, and from nowhere else — the snapshot
 * is what protects a stored mark from a later change to the recipe's
 * declared pair, and reaching for a live version record here would be
 * exactly the drift this module exists to prevent.
 */
export function axesForBatch(batch) {
  const core = AXES.slice(0, CORE_AXIS_COUNT);
  const declared = batch.snapshot.declaredAxes
    .map((name) => AXES.find((axis) => axis.name === name))
    .filter((axis) => axis != null);
  return [...core, ...declared];
}

/** markKeyFor(axis) -> the axis's fixed key. Every axis is fixed now (D-07). */
export function markKeyFor(axis) {
  return axis.key;
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
