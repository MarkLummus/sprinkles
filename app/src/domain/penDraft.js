// Pure. No framework, no DOM, no store import.
// The version pen's draft, read and changed by pure functions, which
// RecipePage drives through usePenDraft (Phase 5, D-01).

// A draft row, found by its row id (D-03; closes T-03.6-02). Row ids come
// from stored versions, and an imported file can carry any string, so the
// lookup answers only for an own key of penDraft.rows: an id such as
// '__proto__', 'constructor' or 'toString' is never resolved against
// Object.prototype. Callers add no guard for undefined: penDraft.rows is
// built by Object.fromEntries over the same version.rows every caller
// iterates, and a restored draft must pass draftMatchesVersion, which
// requires an own key for every version row, so an undefined result is
// unreachable through the app.
export function penDraftRow(penDraft, rowId) {
  return Object.prototype.hasOwnProperty.call(penDraft.rows, rowId) ? penDraft.rows[rowId] : undefined;
}
