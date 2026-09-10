// Pure. No framework, no DOM, no store import. The one seam that keeps a
// removed row or step out of computeBalance, buildFigures, the totals, and
// the clean reading (RESEARCH.md Pitfall 2) — a removed row reaching
// computeBalance would silently corrupt every figure with no error.
// Accepts any object carrying rows/method, so a call site may adapt with a
// thin wrapper the way Method.jsx already builds batchLike.

/**
 * activeRows(version) -> version.rows with every removed row filtered
 * out. A row with no `removed` key is active. Never mutates or reorders
 * the array it is given.
 */
export function activeRows(version) {
  return version.rows.filter((row) => !row.removed);
}

/**
 * activeSteps(version) -> version.method with every removed step
 * filtered out. A step with no `removed` key is active. Never mutates or
 * reorders the array it is given.
 */
export function activeSteps(version) {
  return version.method.filter((step) => !step.removed);
}

/**
 * rowGrams(row) -> a row's total, as the sum of its `portions`' grams
 * (D-01). A row's total is derived from its portions and is never stored
 * — a stored total and a portion list are two places for one number and
 * they drift. An unsplit ingredient is a one-portion row, so this is the
 * one rule every reader takes for both cases. Never mutates or reorders
 * `row.portions`.
 */
export function rowGrams(row) {
  return row.portions.reduce((total, portion) => total + portion.grams, 0);
}
