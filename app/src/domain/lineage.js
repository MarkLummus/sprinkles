// Pure. No framework, no DOM, no store import. Parent/child version
// construction and the version-line rules — see 03-CONTEXT.md D-01 (a
// version needs a name), D-04 (line uniqueness, exact comparison, no case
// folding), D-06 (parent id, parent line snapshot, a fresh creation date),
// and D-10 (a child shares no structure with its parent, and a churned
// version's record and its batches are never written when a child is
// saved).

import { sortedBatches } from './batch.js';

/**
 * sortedVersions(versions) -> a new array ordered by createdAt, most
 * recent first, with a null createdAt last — the same tie-break shape
 * domain/batch.js's sortedBatches applies to a version's batches, applied
 * here to a recipe's versions. Never sorts in place.
 */
export function sortedVersions(versions) {
  return [...versions].sort((a, b) => {
    const aDate = a.createdAt;
    const bDate = b.createdAt;
    if (aDate === bDate) return 0;
    if (aDate === null) return 1;
    if (bDate === null) return -1;
    return aDate < bDate ? 1 : -1;
  });
}

/** versionsForRecipe(versions, recipeId) -> versions filtered to one recipeId. */
export function versionsForRecipe(versions, recipeId) {
  return versions.filter((version) => version.recipeId === recipeId);
}

/**
 * latestVersionPerRecipe(versions) -> one version per recipeId, the
 * greatest createdAt for that recipe; on a tie keeps the first version
 * encountered, so the result is stable. The assumption-delta invariant
 * this phase introduces (03-CONTEXT.md): for any number of versions of
 * one recipe, this returns exactly one version per recipeId.
 */
export function latestVersionPerRecipe(versions) {
  const byRecipe = new Map();
  for (const version of versions) {
    const current = byRecipe.get(version.recipeId);
    if (!current || (version.createdAt ?? '') > (current.createdAt ?? '')) {
      byRecipe.set(version.recipeId, version);
    }
  }
  return [...byRecipe.values()];
}

/**
 * versionLineUnique(versions, candidateLine, excludeId) -> whether
 * candidateLine (trimmed) is not already used by any version in the given
 * list other than excludeId (D-04). Trims both sides before comparing —
 * so surrounding whitespace never manufactures a false uniqueness — but
 * never case-folds: two lines differing only in case are distinct. The
 * caller scopes `versions` to one recipe; this function does not filter
 * by recipeId itself.
 */
export function versionLineUnique(versions, candidateLine, excludeId) {
  const trimmed = candidateLine.trim();
  return !versions.some((version) => version.id !== excludeId && version.versionLabel.trim() === trimmed);
}

/**
 * createChildVersion(parent, penFields, { id, now }) -> a new version
 * record carrying the supplied id, the parent's identity as
 * parentVersionId/parentVersionLabel, and a fresh createdAt (D-06). Every
 * structural field the pen edits — rows, method, headnote, authored — is
 * deep-copied with structuredClone, so the child shares no structure with
 * its parent (D-10, D-04): mutating a value reached through the parent
 * afterwards never moves the child. Pure: id and now are supplied by the
 * caller, exactly as domain/batch.js's createBatch takes them — this
 * function never reaches for crypto.randomUUID() or new Date() itself,
 * and it never writes to the parent (T-03-03).
 */
export function createChildVersion(parent, penFields, { id, now }) {
  return {
    schemaVersion: parent.schemaVersion,
    id,
    recipeId: parent.recipeId,
    parentVersionId: parent.id,
    parentVersionLabel: parent.versionLabel,
    createdAt: now,
    recipeName: parent.recipeName,
    versionLabel: penFields.versionLabel,
    coefficientSetId: parent.coefficientSetId,
    coefficientSetName: parent.coefficientSetName,
    targets: parent.targets,
    equipment: parent.equipment,
    process: parent.process,
    iceEd: parent.iceEd,
    declaredAxes: parent.declaredAxes,
    reason: penFields.reason,
    citedBatchId: penFields.citedBatchId,
    rows: structuredClone(penFields.rows),
    method: structuredClone(penFields.method),
    headnote: penFields.headnote,
    authored: structuredClone(penFields.authored),
  };
}

/**
 * saveOverVersion(version, penFields) -> a new record with the same id,
 * parentVersionId, parentVersionLabel and createdAt, and the pen's edited
 * content in their place — a correction, never a new event, mirroring
 * domain/batch.js's recordAmendment. Callers may pass a third { now }
 * argument for signature symmetry with createChildVersion; this record's
 * own createdAt is never retaken, so it is unused here.
 */
export function saveOverVersion(version, penFields) {
  return {
    ...version,
    versionLabel: penFields.versionLabel,
    reason: penFields.reason,
    citedBatchId: penFields.citedBatchId,
    rows: structuredClone(penFields.rows),
    method: structuredClone(penFields.method),
    headnote: penFields.headnote,
    authored: structuredClone(penFields.authored),
  };
}

/**
 * citableBatches(batches) -> the parent's batches, most-recent-first, for
 * the ceremony's citation list (route-recipe-version.md § 3) — a thin
 * wrapper over domain/batch.js's sortedBatches, so the component never
 * chooses an order of its own.
 */
export function citableBatches(batches) {
  return sortedBatches(batches);
}

// A non-negative number with up to two decimals, kept exactly as typed
// (critique P1 #3, D-21): no leading minus, no stray letter, no
// surrounding whitespace, no exponent — anchored at both ends so a value
// like "4o" or "1.234" fails outright rather than partially matching.
const NUMERIC_GRAMS_PATTERN = /^\d+(\.\d{1,2})?$/;

/**
 * parseGramsDraft(value) -> the number a draft grams field holds, or
 * `null` when it does not hold one — the one rule every draft-grams
 * reader takes, so the figure on screen and the sentence that blocks the
 * save can never disagree (260909-oow). Built on NUMERIC_GRAMS_PATTERN,
 * this predicate's only reader: a non-negative number with up to two
 * decimals, kept exactly as typed. `''` and `undefined` reach `null`
 * through the pattern itself, needing no branch of their own.
 */
export function parseGramsDraft(value) {
  return NUMERIC_GRAMS_PATTERN.test(value) ? Number(value) : null;
}

/**
 * findBlockedRow(penFields, version) -> { row, message } for the first
 * active row (in the version's own authored order) whose grams field
 * blocks the save, or `null` when no row does. Checked one row at a
 * time, walking the row's own portions in order, blank before
 * non-numeric within each portion, so within a single row the maker is
 * told about one thing at a time; the first blocking portion of the
 * first blocking row wins, and the walk then moves to the next row. The
 * one traversal both blockedSaveMessage and blockedSaveRowId read, so
 * the sentence on screen and the row it names can never disagree
 * (T-03.1-21).
 */
function findBlockedRow(penFields, version) {
  for (const row of version.rows) {
    const draftRow = penFields.rows[row.id];
    if (draftRow.removed) continue;
    for (const draftPortion of draftRow.portions) {
      if (draftPortion.grams === undefined || draftPortion.grams === '') {
        return { row, message: `${row.ingredientName} needs an amount, or remove the row` };
      }
      if (parseGramsDraft(draftPortion.grams) === null) {
        return { row, message: `${row.ingredientName}'s amount is not a number` };
      }
    }
  }
  return null;
}

/**
 * blockedSaveMessage(penFields, version, versions) -> the one message
 * that blocks the save, or `null` when nothing does, checked in a fixed
 * order so the maker is told about one thing at a time
 * (route-recipe-version.md § 3, § 6, D-04, D-21): a blank or
 * whitespace-only version line; a line that collides through
 * versionLineUnique; then, for the first active row (in the version's own
 * authored order) that blocks — a blank grams field, or a grams field
 * holding anything that is not a non-negative number with up to two
 * decimals (critique P1 #3). `penFields` carries `versionLabel` (a
 * string) and `rows` (a map keyed by row id holding { portions, removed }
 * — the pen draft's own shape, `portions` an array of { grams } parallel
 * to the stored row's own portions); a row the draft marks removed needs
 * no amount. `versions` is the list to check uniqueness against, already
 * scoped by the caller to the recipe and to exclude the version being
 * saved over when that applies, so this function never takes an
 * excludeId of its own. Never looks at a band, a deviation or an
 * advisory — FORM1-03 is discharged by that absence, not by a rule that
 * permits it.
 */
export function blockedSaveMessage(penFields, version, versions) {
  if (penFields.versionLabel.trim() === '') return 'a version needs a line';
  if (!versionLineUnique(versions, penFields.versionLabel, null)) {
    return 'another version already has this line';
  }
  const blocked = findBlockedRow(penFields, version);
  return blocked ? blocked.message : null;
}

/**
 * blockedSaveRowId(penFields, version, versions) -> the id of the row
 * blockedSaveMessage's own sentence names, or `null` when nothing blocks
 * or when the block is the version line's own (blank or colliding) — the
 * page reads this to mark and focus the offending row. Reads the same
 * findBlockedRow traversal blockedSaveMessage does, so the row this names
 * can never disagree with the message it names alongside (T-03.1-21).
 */
export function blockedSaveRowId(penFields, version, versions) {
  if (penFields.versionLabel.trim() === '') return null;
  if (!versionLineUnique(versions, penFields.versionLabel, null)) return null;
  const blocked = findBlockedRow(penFields, version);
  return blocked ? blocked.row.id : null;
}
