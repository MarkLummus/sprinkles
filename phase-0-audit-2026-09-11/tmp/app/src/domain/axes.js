// Pure. No framework, no DOM, no store import. The four core axes with
// their behavioural anchors, the nine mark stops, and the per-batch axis
// list built from the batch's own snapshot — see 02-CONTEXT.md D-14 (the
// anchors, behavioural, never adjectival), D-15 (declared axes carry
// anchors authored on the version), and D-16 (nine stops, arrow keys, any
// axis may stay unmarked).

/**
 * CORE_AXES: fixed order, always present in every tasting. Anchors are
 * transcribed verbatim from the earlier attempt's CORE_AXES
 * (old-sprinkles/src/data/olive-oil.js) — behavioural, describing what the
 * spoon does, never adjectival. That distinction is the whole reason the
 * signed scale centred on "Good" was rejected (D-14).
 */
export const CORE_AXES = [
  { key: 'hardness', label: 'Hardness', low: 'spoon sinks', high: "spoon won't enter" },
  { key: 'scoopability', label: 'Scoopability', low: 'crumbles', high: 'rolls clean' },
  { key: 'smoothness', label: 'Smoothness', low: 'grainy', high: 'no crystal felt' },
  { key: 'sweetness', label: 'Sweetness', low: 'flat', high: 'dominant' },
];

/** MARK_STOPS: the nine stops a mark may take, 1 to 5 by halves (D-16). */
export const MARK_STOPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/**
 * axesForBatch(batch) -> the four core axes followed by the batch's
 * declared axes, each in the same { key, label, low, high } shape. Reads
 * declaredAxes from batch.snapshot only, and from nowhere else: the
 * snapshot is what protects a stored mark from a later rename of the
 * version's axes (D-15). Reaching for a live version record here would be
 * exactly the drift this phase exists to prevent.
 */
export function axesForBatch(batch) {
  const declared = batch.snapshot.declaredAxes.map((axis) => ({
    key: axis.name,
    label: axis.name,
    low: axis.low,
    high: axis.high,
  }));
  return [...CORE_AXES, ...declared];
}

/**
 * markKeyFor(axis) -> the mark key: the fixed lowercase key for a core
 * axis, the name verbatim for a declared one, so the two namespaces
 * cannot collide — a version that declares an axis named "Hardness"
 * produces the key "Hardness", distinct from the core "hardness".
 */
export function markKeyFor(axis) {
  return axis.key !== undefined ? axis.key : axis.name;
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
