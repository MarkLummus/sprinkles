// Pure. No framework, no DOM, no store import. Parent/child version
// construction and the version-line rules — see 03-CONTEXT.md D-01 (a
// version needs a name), D-04 (line uniqueness, exact comparison, no case
// folding), D-06 (parent id, parent line snapshot, a fresh creation date),
// and D-10 (a child shares no structure with its parent, and a churned
// version's record and its batches are never written when a child is
// saved).

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
