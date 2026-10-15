// Pure. No framework, no DOM, no store import. Creates a recipe and its root
// version the way lineage.js createChildVersion creates a child: the caller
// supplies the ids and the clock, and this module reads neither a clock nor a
// random source (Phase 7 D-01). The root version leaves out equipment,
// process, iceEd and targets: none is invented, as the seed leaves an unknown
// slot null rather than a made-up value (D-02); there is no coefficientSetName
// and coefficientSetId is '' (D-03). The rows arrive already built by
// rowFromLibraryRecord and are copied (Phase 7, RESEARCH A2).
//
// The refusals throw (with versionRow.js and stepKeys.js, the first throws in
// app/src/domain) because a constructor's normal return is a record; v2's form
// runs recipeNameMessage and the version-line gate first, so no maker-facing
// message is added here (RESEARCH A1, reversible).

import { RESERVED_ROW_IDS } from './versionRow.js';

// Mirrors data/olive-oil.js's constant of the same name, which newRecipe.test.js
// pins, so app/src/domain imports no seed module (RESEARCH A3).
const VERSION_SCHEMA_VERSION = 6;

/**
 * createRecipe({ name, versionLabel, rows }, { recipeId, versionId, now }) ->
 * { recipe, version }. The recipe is { id, name (trimmed), description: '' };
 * the version is its root, with the label stored trimmed as the name is: no parent, no reason, no cited batch, an empty
 * method, and a copy of the starting rows (structuredClone). Refuses, with a
 * TypeError, a blank name, a blank label (on its trimmed value, as lineage.js
 * blockedSaveMessage does), no rows, two rows with the same id, a row id that
 * is a reserved name, or a recipeId, versionId or now that is not a
 * non-empty string. recipeId and versionId may be equal: recipes and
 * versions are separate stores, each keyed by its own id.
 */
export function createRecipe({ name, versionLabel, rows }, { recipeId, versionId, now } = {}) {
  for (const [label, value] of [['recipeId', recipeId], ['versionId', versionId], ['now', now]]) {
    if (typeof value !== 'string' || value === '') {
      throw new TypeError(`${label} must be a non-empty string`);
    }
  }
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('recipe name must not be blank');
  }
  if (typeof versionLabel !== 'string' || versionLabel.trim() === '') {
    throw new TypeError('version label must not be blank');
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new TypeError('a new recipe needs at least one starting row');
  }
  const seen = new Set();
  for (const row of rows) {
    if (RESERVED_ROW_IDS.has(row.id)) {
      throw new TypeError(`row id ${JSON.stringify(row.id)} is reserved`);
    }
    if (seen.has(row.id)) {
      throw new TypeError(`row id ${JSON.stringify(row.id)} appears twice`);
    }
    seen.add(row.id);
  }

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
    versionLabel: versionLabel.trim(),
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
