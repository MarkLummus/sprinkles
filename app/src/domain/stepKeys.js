// Pure. No framework, no DOM, no store import. A step's stored key (n) is its
// identity (stepNumbers.js header): diff pairing, row portions, a batch's
// stepChanges and the uses lists all key on it, so a key handed out once is
// never handed out again. Removal only flags a step (penDraft.js
// togglePenStepRemoved) and a child version copies the whole method, so the
// array holds every key the version has used; this module reads the highest n
// over every step, removed ones included, and needs no stored counter
// (Phase 7 D-05, D-05a). It scans the array, never indexes by a stored key,
// and never counts the steps (a count hands out a held key once a gap
// exists). It reads no parent chain and no row's portions.

/**
 * nextStepKey(method) -> the next step key never used in this method: the
 * highest n over every step, removed steps included, plus one. An empty
 * method gives 1.
 */
export function nextStepKey(method) {
  let highest = 0;
  for (const step of method) {
    if (step.n > highest) highest = step.n;
  }
  return highest + 1;
}
