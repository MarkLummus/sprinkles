// Pure. No framework, no DOM, no store import. Builds a version row from a
// library record { id, entry } (Phase 6 D-02) the way data/olive-oil.js
// embed() builds the seeded rows. The row embeds a structuredClone of the
// entry, so a later edit to the library never moves a stored version's
// figures (Phase 7 D-06). The record's id is the library's key and never
// enters the row.
//
// The refusals throw. This is the first throw in app/src/domain: a
// constructor's normal return is a record, so a null would travel on and
// fail only at import, far from the cause. A caller's form gates the maker's
// input before calling (Phase 7, RESEARCH A1; reversible, no caller yet).

// A row id is used as an object key downstream (a batch's as-made map, the
// pens' drafts). These are the names store/transfer.js refuses as a row id.
// The set is duplicated because app/src/domain imports no store module;
// store/transfer.test.js pins the two sets equal.
export const RESERVED_ROW_IDS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName }) ->
 * a version row { id, ingredientName, ingredient, portions, removed }.
 * ingredientName defaults to the entry's name; the amount is one portion at
 * `step`, with no removed key on the portion. Throws a TypeError for an id
 * that is not a non-empty string or is a reserved name, an amount that is not a finite number of
 * at least zero (0 g is accepted), or a step that is not finite (D-07).
 */
export function rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName }) {
  if (typeof id !== 'string' || id === '') {
    throw new TypeError('row id must be a non-empty string');
  }
  if (RESERVED_ROW_IDS.has(id)) {
    throw new TypeError(`row id ${JSON.stringify(id)} is reserved`);
  }
  if (!Number.isFinite(grams) || grams < 0) {
    throw new TypeError('row grams must be a finite number of at least zero');
  }
  if (!Number.isFinite(step)) {
    throw new TypeError('row step must be a finite number');
  }
  return {
    id,
    ingredientName: ingredientName ?? record.entry.name,
    ingredient: structuredClone(record.entry),
    portions: [{ step, grams }],
    removed: false,
  };
}
