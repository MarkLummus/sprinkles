// Pure. No framework, no DOM, no store import. The one place every
// Notebook address is built (03.5-CONTEXT.md D-14 to D-17) — every in-app
// link and redirect target reads through these functions rather than
// composing a template literal of its own, so the /notebook/… form can
// never drift between call sites.
import { sortedVersions, versionsForRecipe } from '../domain/lineage.js';

// The Notebook place and the creation editor's one fixed address: one creation
// is kept at a time, so the address carries no id (Phase 10 D-01, sketch 013
// decision 10).
export const NOTEBOOK_PLACE_PATH = '/notebook';
export const NEW_RECIPE_PATH = '/notebook/new';

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
 * printPath(recipeId, versionId) -> '/notebook/:recipeId/:versionId/print',
 * the print route under the Notebook form (04-RESEARCH.md C8; the print
 * brief's Assets and processes amendment). Built on notebookPath, so every
 * segment runs through encodeURIComponent and a stored id holding '/' or
 * '..' can never change the path's shape.
 */
export function printPath(recipeId, versionId) {
  return `${notebookPath(recipeId, versionId)}/print`;
}

/**
 * editPath(recipeId, versionId) -> '/notebook/:recipeId/:versionId/edit', the
 * edit route of a first version (Phase 11 D-01). Built on notebookPath, so
 * every segment runs through encodeURIComponent and a stored id holding '/' or
 * '..' can never change the path's shape.
 */
export function editPath(recipeId, versionId) {
  return `${notebookPath(recipeId, versionId)}/edit`;
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
