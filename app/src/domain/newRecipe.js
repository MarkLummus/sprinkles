// Pure. No framework, no DOM, no store import. Creates a recipe and its root
// version the way lineage.js createChildVersion creates a child: the caller
// supplies the ids and the clock, and this module reads neither a clock nor a
// random source (Phase 7 D-01). Given only a name, a label and rows, the root
// version leaves out equipment, process, iceEd and targets: none is invented,
// as the seed leaves an unknown slot null rather than a made-up value (D-02);
// there is no coefficientSetName and coefficientSetId is '' (D-03).
// serveTempC, the target serving temperature, is stored empty (null) unless
// one is given, and nothing is invented (D-19). The rows arrive already built
// by rowFromLibraryRecord and are copied (Phase 7, RESEARCH A2).
//
// The root may also carry what the creation editor authored (Phase 11
// MAKE-10, D-03): a description, a method, authored notes, declared scales and
// problems, targets, iceEd and a serving temperature. Each is optional, and
// the three-field call returns exactly what it always did.
//
// The refusals throw (with versionRow.js and stepKeys.js, the first throws in
// app/src/domain) because a constructor's normal return is a record; v2's form
// runs recipeNameMessage and the version-line gate first, so no maker-facing
// message is added here (RESEARCH A1, reversible).

import { RESERVED_ROW_IDS } from './versionRow.js';
import { codeFromVersionId } from './sheetCode.js';

// Mirrors data/olive-oil.js's constant of the same name, which newRecipe.test.js
// pins, so app/src/domain imports no seed module (RESEARCH A3).
const VERSION_SCHEMA_VERSION = 6;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * createRecipe({ name, versionLabel, rows, description, method, authored,
 * declaredAxes, declaredFlaws, targets, iceEd, serveTempC }, { recipeId,
 * versionId, now }) -> { recipe, version }. The recipe is { id, name
 * (trimmed), description }; the version is its root, with the label stored
 * trimmed as the name is: no parent, no reason, no cited batch, a sheetCode
 * derived once from its id (codeFromVersionId, D-04), and a copy of the
 * starting rows (structuredClone). description defaults to '' and fills both
 * the recipe and the Sheet description (one box fills both); method to [],
 * authored to { beforeYouStart: [] }, declaredAxes and declaredFlaws to [],
 * serveTempC to null; targets and iceEd are own keys only when given. A given
 * value is copied with structuredClone. undefined means absent.
 *
 * Refuses, with a TypeError, a blank name, a blank label (on its trimmed
 * value, as lineage.js blockedSaveMessage does), no rows, two rows with the
 * same id, a row id that is a reserved name, a recipeId, versionId or now that
 * is not a non-empty string, a description that is not a string, a method,
 * declaredAxes or declaredFlaws that is not an array, authored, targets or
 * iceEd that is not a plain object (null and an array are refused), or a
 * serveTempC that is neither a finite number nor null. recipeId and versionId
 * may be equal: recipes and versions are separate stores, each keyed by its
 * own id.
 */
export function createRecipe(
  {
    name,
    versionLabel,
    rows,
    description = '',
    method = [],
    authored = { beforeYouStart: [] },
    declaredAxes = [],
    declaredFlaws = [],
    targets,
    iceEd,
    serveTempC = null,
  },
  { recipeId, versionId, now } = {},
) {
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

  if (typeof description !== 'string') throw new TypeError('description must be a string');
  for (const [label, value] of [['method', method], ['declaredAxes', declaredAxes], ['declaredFlaws', declaredFlaws]]) {
    if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);
  }
  for (const [label, value] of [['authored', authored], ['targets', targets], ['iceEd', iceEd]]) {
    if (value !== undefined && !isPlainObject(value)) throw new TypeError(`${label} must be a plain object`);
  }
  if (serveTempC !== null && !Number.isFinite(serveTempC)) {
    throw new TypeError('serveTempC must be a finite number or null');
  }

  const recipeName = name.trim();

  const recipe = { id: recipeId, name: recipeName, description };

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
    sheetDescription: description,
    rows: structuredClone(rows),
    declaredAxes: structuredClone(declaredAxes),
    declaredFlaws: structuredClone(declaredFlaws),
    serveTempC,
    method: structuredClone(method),
    authored: structuredClone(authored),
    sheetCode: codeFromVersionId(versionId),
  };
  if (targets !== undefined) version.targets = structuredClone(targets);
  if (iceEd !== undefined) version.iceEd = structuredClone(iceEd);

  return { recipe, version };
}
