// Pure. No framework, DOM, or store import. The creation editor's helpers
// (Phase 10, MAKE-05): the title a nameless creation wears, a stored create
// payload laid over the blank one, and the version-shaped view of a draft the
// shared Sheet reads. The draft is never changed here: every function returns
// new values and copies what it takes from its arguments.

import { blankCreateDraft } from './draft.js';
import { parseGramsDraft } from './lineage.js';
import { rowFromLibraryRecord } from './versionRow.js';

export const UNTITLED = 'Untitled';

/**
 * creationTitle(name) -> UNTITLED when the trimmed name is empty, otherwise
 * the name exactly as typed (D-08c): the Sheet heading, the tab title and the
 * Notebook's draft row all read it.
 */
export function creationTitle(name) {
  return name.trim() === '' ? UNTITLED : name;
}

/**
 * normalizeCreateDraft(payload) -> a new payload: blankCreateDraft's fields
 * with the stored ones laid over them. A stored create draft need only hold
 * recipeId, versionId and name (draftMatchesCreate accepts it), so the editor
 * never reads a payload as it was stored. A row with an empty portions array
 * gets one portion, { step: 1, grams: '' }, the shape the editor writes; every
 * other field and row stays as stored.
 */
export function normalizeCreateDraft(payload) {
  const merged = {
    ...blankCreateDraft({ recipeId: payload.recipeId, versionId: payload.versionId, name: payload.name }),
    ...payload,
  };
  return {
    ...merged,
    rows: merged.rows.map((row) =>
      row.portions.length === 0 ? { ...row, portions: [{ step: 1, grams: '' }] } : { ...row },
    ),
  };
}

/**
 * creationSheetVersion(draft, libraryById = new Map()) -> the version-shaped
 * object the Sheet reads. One description box fills both descriptions (the
 * Sheet's prose and the recipe's), the method is empty until Phase 11 (D-05),
 * and targets are empty until the bands are drawn (D-08b). A row is projected
 * through rowFromLibraryRecord from its first portion, its grams parsed with
 * parseGramsDraft and read as 0 g when they do not parse (D-08), so a row the
 * maker is still typing stays on the Sheet. A row whose library entry is gone
 * is left out rather than thrown over (the map holds { id, entry } records).
 */
export function creationSheetVersion(draft, libraryById = new Map()) {
  const rows = [];
  for (const row of draft.rows) {
    const record = libraryById.get(row.libraryId);
    if (!record) continue;
    const portion = row.portions[0];
    rows.push(
      rowFromLibraryRecord(record, {
        id: row.id,
        grams: portion ? (parseGramsDraft(portion.grams) ?? 0) : 0,
        step: portion ? portion.step : 1,
      }),
    );
  }
  return {
    id: draft.versionId,
    recipeId: draft.recipeId,
    sheetTitle: creationTitle(draft.name),
    sheetDescription: draft.description,
    rows,
    method: [],
    authored: { beforeYouStart: draft.beforeYouStart },
    targets: {},
  };
}
