// Pure. No framework, no DOM, no store import. Builds a version row from a
// library record { id, entry } (Phase 6 D-02) the way data/olive-oil.js
// embed() builds the seeded rows. The row embeds a structuredClone of the
// entry, so a later edit to the library never moves a stored version's
// figures (Phase 7 D-06). The record's id is the library's key and never
// enters the row.

/**
 * rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName }) ->
 * a version row { id, ingredientName, ingredient, portions, removed }.
 * ingredientName defaults to the entry's name; the amount is one portion at
 * `step`, with no removed key on the portion.
 */
export function rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName }) {
  return {
    id,
    ingredientName: ingredientName ?? record.entry.name,
    ingredient: structuredClone(record.entry),
    portions: [{ step, grams }],
    removed: false,
  };
}
