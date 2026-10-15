// Pure. No framework, no DOM, no store import. Creates a recipe and its root
// version the way lineage.js createChildVersion creates a child: the caller
// supplies the ids and the clock, and this module reads neither a clock nor a
// random source (Phase 7 D-01). The root version leaves out equipment,
// process, iceEd and targets: none is invented, as the seed leaves an unknown
// slot null rather than a made-up value (D-02); there is no coefficientSetName
// and coefficientSetId is '' (D-03). The rows arrive already built by
// rowFromLibraryRecord and are copied (Phase 7, RESEARCH A2).

// Mirrors data/olive-oil.js's constant of the same name, which newRecipe.test.js
// pins, so app/src/domain imports no seed module (RESEARCH A3).
const VERSION_SCHEMA_VERSION = 6;

/**
 * createRecipe({ name, versionLabel, rows }, { recipeId, versionId, now }) ->
 * { recipe, version }. The recipe is { id, name (trimmed), description: '' };
 * the version is its root: no parent, no reason, no cited batch, an empty
 * method, and a copy of the starting rows (structuredClone).
 */
export function createRecipe({ name, versionLabel, rows }, { recipeId, versionId, now }) {
  const recipeName = name.trim();

  const recipe = { id: recipeId, name: recipeName, description: '' };

  const version = {
    schemaVersion: VERSION_SCHEMA_VERSION,
    id: versionId,
    recipeId,
    parentVersionId: null,
    parentVersionLabel: null,
    reason: null,
    citedBatchId: null,
    createdAt: now,
    versionLabel,
    coefficientSetId: '',
    sheetTitle: recipeName,
    sheetDescription: '',
    rows: structuredClone(rows),
    declaredAxes: [],
    declaredFlaws: [],
    method: [],
    authored: { beforeYouStart: [] },
  };

  return { recipe, version };
}
