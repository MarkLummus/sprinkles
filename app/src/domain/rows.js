// Pure. No framework, no DOM, no store import. The one seam that keeps a
// removed row or step out of computeBalance, buildFigures, the totals, and
// the clean reading (RESEARCH.md Pitfall 2) — a removed row reaching
// computeBalance would silently corrupt every figure with no error.
// Accepts any object carrying rows/method, so a call site may adapt with a
// thin wrapper the way Method.jsx already builds batchLike.

/**
 * isLineRemoved(row, portion) -> true when one line (a portion) of a row is
 * out: its own `removed` is exactly true, or the row's older whole-row flag
 * is exactly true, which reads as every line out. Strict on purpose — an
 * absent, string or numeric flag reads as in (T-03.6-01).
 */
export function isLineRemoved(row, portion) {
  return portion.removed === true || row.removed === true;
}

/**
 * isRowRemoved(row) -> true when the row's older whole-row flag is exactly
 * true or every one of its lines is out. A row with no portions (or no
 * portions array) is not removed by this rule. A split row with one line
 * out is not removed.
 */
export function isRowRemoved(row) {
  if (row.removed === true) return true;
  const portions = row.portions ?? [];
  return portions.length > 0 && portions.every((portion) => portion.removed === true);
}

/**
 * activeRows(version) -> version.rows reduced to the lines still in, in the
 * row's own order. A row with every line in comes back as the very same
 * object; a row with some lines out comes back as a copy with a shorter
 * `portions` array; a row with no line in is dropped.
 * Never mutates or reorders the array it is given.
 */
export function activeRows(version) {
  const result = [];
  for (const row of version.rows) {
    if (row.removed === true) continue;
    const kept = row.portions.filter((portion) => !isLineRemoved(row, portion));
    if (kept.length === row.portions.length) result.push(row);
    else if (kept.length > 0) result.push({ ...row, portions: kept });
  }
  return result;
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

/**
 * targetValueFor(version, label) -> the value of the first active step's
 * target whose label strictly equals the given label, or null when no
 * active step carries one (03.3-07, G-03.3-4's batch-row plan sub-line).
 * Built on activeSteps, so a removed step's own targets are never read —
 * the same removal discipline activeRows/activeSteps already keep.
 */
export function targetValueFor(version, label) {
  for (const step of activeSteps(version)) {
    for (const target of step.targets || []) {
      if (target.label === label) return target.value;
    }
  }
  return null;
}
