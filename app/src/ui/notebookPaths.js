// Pure. No framework, no DOM, no store import. The one place every
// Notebook address is built (03.5-CONTEXT.md D-14 to D-17) — every in-app
// link and redirect target reads through these three functions rather than
// composing a template literal of its own, so the /notebook/… form can
// never drift between call sites.
import { sortedVersions, versionsForRecipe } from '../domain/lineage.js';

/**
 * notebookPath(recipeId, versionId, batchId = null) -> '/notebook/:recipeId/:versionId'
 * or, when batchId is given, '/notebook/:recipeId/:versionId/batch/:batchId'.
 * Every segment runs through encodeURIComponent (T-03.5-06): a stored id
 * holding '/' or '..' can never change the path's shape.
 */
export function notebookPath(recipeId, versionId, batchId = null) {
  const base = `/notebook/${encodeURIComponent(recipeId)}/${encodeURIComponent(versionId)}`;
  return batchId === null ? base : `${base}/batch/${encodeURIComponent(batchId)}`;
}

/**
 * legacyRecipePath(version, batchId) -> the Notebook address a /recipe/:id
 * (or /recipe/:id/batch/:batchId) redirect resolves to (D-16), or null when
 * version is missing (undefined or null) rather than throwing.
 */
export function legacyRecipePath(version, batchId) {
  if (!version) return null;
  return notebookPath(version.recipeId, version.id, batchId);
}

/**
 * latestVersionPath(versions, recipeId) -> the Notebook address of the
 * newest version for that recipeId (D-14's replace-redirect target), or
 * null when the recipe has no versions. Reads the same ordering
 * sortedVersions/versionsForRecipe already establish for every other
 * "newest version" reader — no second opinion about order.
 */
export function latestVersionPath(versions, recipeId) {
  const [latest] = sortedVersions(versionsForRecipe(versions, recipeId));
  return latest ? notebookPath(latest.recipeId, latest.id) : null;
}
