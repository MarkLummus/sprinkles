// The one embed every seed file uses. A stored version is self-contained
// (D-05): the row carries a deep copy of the library entry, so a later edit to
// the shared `library` never moves a figure already computed from a version's
// own rows. The libraryId records which entry the copy came from; it is a
// link for later readers and is never read to compute a figure (LIB-08).
import { library } from './library.js';

export function embedFromLibrary(ingredientName, libraryId, fields) {
  if (!Object.hasOwn(library, libraryId)) {
    throw new TypeError(`no library entry named ${JSON.stringify(libraryId)}`);
  }
  return {
    ingredientName,
    ingredient: structuredClone(library[libraryId]),
    libraryId,
    ...fields,
  };
}
