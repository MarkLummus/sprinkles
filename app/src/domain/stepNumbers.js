// Pure. No framework, no DOM, no store import. The step's stored key (n)
// is its identity: diff.js's baselineStepByN pairs parent to child on it,
// RecipePage.jsx's four pen step handlers match on it, a row's own
// portions each name it, a batch's stepChanges keys on it, and the seed's
// per-step uses lists key on it — it must never move. The display number
// is a different fact: a step's position among the active
// steps, derived fresh on every read from whichever method array the
// caller is showing, never stored and never written back. Renumbering the
// stored key was tested directly and rejected: it makes eight of the nine
// survivors of a single removal read as rewritten
// (.planning/debug/steps-do-not-renumber-after-removal.md, Evidence 6).
// This module is the alternative, not a first guess.
//
// Which number a particular reader should show — the current version's,
// a baseline's, or none — is the caller's question: the answer differs by
// state and this module has no business knowing which state a page is in.

/**
 * displayNumbers(method) -> a Map from each non-removed step's stored key
 * (n) to its one-based position among the non-removed steps, in the
 * method array's own order. A removed step is simply absent from the map
 * — the absence is the fact that it has no number in this version. A step
 * with no `removed` key counts as active, the same doctrine activeSteps
 * (rows.js) applies. Never mutates, never reorders, never sorts the array
 * it is given.
 */
export function displayNumbers(method) {
  const map = new Map();
  let position = 0;
  for (const step of method) {
    if (step.removed) continue;
    position += 1;
    map.set(step.n, position);
  }
  return map;
}

/**
 * displayNumberOf(map, n) -> the position displayNumbers assigned to the
 * stored key n, or null when the map holds nothing for it (a removed
 * step, or a key of null/undefined). Read through the Map's own accessor,
 * never a bracket read against a maker-influenced key (domain/uses.js's
 * discipline).
 */
export function displayNumberOf(map, n) {
  return map.has(n) ? map.get(n) : null;
}
