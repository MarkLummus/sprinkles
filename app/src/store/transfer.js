// Whole-store JSON transfer (D-08), behind the repository seam. Neither
// export nor import touches idb — see repository.js for the
// only path to IndexedDB. validateStoreFile is the one gate before a
// write: a malformed file is refused with every error found, never
// half-applied (T-04-01) and never used to reach past an object's own
// properties into its prototype chain (T-04-02). It now knows exactly one
// shape — schemaVersion 8, carrying recipes and the ingredient library
// beside versions and batches (03.5-CONTEXT.md D-10, D-11; 06-CONTEXT.md
// D-06) — and refuses everything older rather than lifting it; there is
// no ladder here.
import { AXES } from '../domain/axes.js';
import { isScaleDefinition, MAX_RECIPE_SCALES } from '../domain/catalog.js';
import { SEGMENT_OPTIONS, DEFECTS, MARK_ONE_OPTIONS } from '../domain/battery.js';

// domain/versionRow.js RESERVED_ROW_IDS mirrors this set; transfer.test.js pins the two.
export const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
// The core scale keys a declared scale's key may not equal. Plan 09-10 replaces
// this source with the file's own scales table (D-03a).
const CORE_AXIS_KEYS = AXES.filter((axis) => axis.group === 'core').map((axis) => axis.key);
// A version declares up to two problems (sketch 010 D26); its scales are bounded
// by MAX_RECIPE_SCALES.
const MAX_DECLARED = 2;

// The store file's own bookkeeping number (D-10) — distinct from
// DB_VERSION (db.js) and VERSION_SCHEMA_VERSION (olive-oil.js): three
// separate counters, each incrementing only its own prior value. Bumped
// to 6 in phase 03.5 because the file gained a `recipes` array and the
// version shape lost `recipeName`/`headnote` (D-11). Bumped to 7 in phase
// 04 because declared problems became lists of 0 to 2 (`declaredFlaws`,
// `declaredDefects`) and a batch gained At draw / From freezer picks.
// Bumped to 8 in phase 06 because the file gained a `library` array
// (06-CONTEXT.md D-06).
export const STORE_SCHEMA_VERSION = 8;

// D-10: a plain sentence a maker can read, pushed first — before the
// path-named `$.schemaVersion` error — whenever the file is from a
// version of Sprinkles older than this one.
export const OLDER_EXPORT_MESSAGE = 'This file is from an older version of Sprinkles and can’t be imported.';

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isStringOrNull(value) {
  return value === null || typeof value === 'string';
}

function isEnumOrNull(value, options) {
  return value === null || (typeof value === 'string' && options.includes(value));
}

// Reads only — never assigns through a key, so an own "__proto__" property
// from JSON.parse is inspected, never acted on. Skips recursing into a
// flagged branch; the payload is already refused.
function scanForUnsafeKeys(value, path, errors) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForUnsafeKeys(item, `${path}[${index}]`, errors));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEYS.has(key)) {
      errors.push(`${path}.${key}: prototype-mutating key is not allowed`);
    } else {
      scanForUnsafeKeys(value[key], `${path}.${key}`, errors);
    }
  }
}

/**
 * validatePortion(portion, path, errors) -> void, in the same
 * collect-all-errors, name-the-path style as validateRow. A portion is an
 * amount at a step, never a stored total (D-01): grams must be a finite
 * number of at least zero, and step must be a finite number. `removed` is
 * optional: absent or a boolean (a line taken out, sketch 011 decision 51).
 */
function validatePortion(portion, path, errors) {
  if (!isPlainObject(portion)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isFiniteNumber(portion.grams) || portion.grams < 0) {
    errors.push(`${path}.grams: expected a finite number of at least zero, got ${JSON.stringify(portion.grams)}`);
  }
  if (!isFiniteNumber(portion.step)) {
    errors.push(`${path}.step: expected a finite number, got ${JSON.stringify(portion.step)}`);
  }
  // Optional: absent or a boolean, never null or any third spelling (T-03.6-05).
  if (portion.removed !== undefined && typeof portion.removed !== 'boolean') {
    errors.push(`${path}.removed: expected a boolean when present, got ${JSON.stringify(portion.removed)}`);
  }
}

function validateRow(row, path, errors) {
  if (!isPlainObject(row)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(row.id)) errors.push(`${path}.id: expected a non-empty string`);
  // A row id is used as an object key downstream (the batch's as-made map, the pens' drafts), so a name the key scan
  // refuses as a key is refused here as a row id too (WR-01); this covers version rows and batch snapshot rows.
  if (UNSAFE_KEYS.has(row.id)) errors.push(`${path}.id: prototype-mutating id is not allowed, got ${JSON.stringify(row.id)}`);
  if (typeof row.ingredientName !== 'string') errors.push(`${path}.ingredientName: expected a string`);
  if (!Array.isArray(row.portions) || row.portions.length === 0) {
    errors.push(`${path}.portions: expected a non-empty array, got ${JSON.stringify(row.portions)}`);
  } else {
    row.portions.forEach((portion, index) => validatePortion(portion, `${path}.portions[${index}]`, errors));
  }
  if (!isPlainObject(row.ingredient) || !isPlainObject(row.ingredient.composition)) {
    errors.push(`${path}.ingredient.composition: expected an object`);
  } else {
    for (const [field, value] of Object.entries(row.ingredient.composition)) {
      if (!isFiniteNumber(value)) {
        errors.push(`${path}.ingredient.composition.${field}: expected a finite number, got ${JSON.stringify(value)}`);
      }
    }
  }
  if (typeof row.removed !== 'boolean') {
    errors.push(`${path}.removed: expected a boolean, got ${JSON.stringify(row.removed)}`);
  }
  // The link to the library entry the row's copy came from (LIB-08): required,
  // null or a key that can never reach a prototype. Nothing reads a figure
  // through it.
  const link = row.libraryId;
  if (!Object.hasOwn(row, 'libraryId') || (link !== null && (!isNonEmptyString(link) || UNSAFE_KEYS.has(link)))) {
    errors.push(`${path}.libraryId: expected null or a non-empty string that is not a reserved name, got ${JSON.stringify(link)}`);
  }
}

/**
 * validateStep(step, path, errors) -> void, in the same collect-all-errors,
 * name-the-path style as validateRow. `uses` is checked as an array of
 * non-empty strings — the row ids a step "uses" (D-06, D-08) — never as a
 * scan over the prose, matching the removal cross-flags' own derivation
 * rule.
 */
function validateStep(step, path, errors) {
  if (!isPlainObject(step)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (typeof step.removed !== 'boolean') {
    errors.push(`${path}.removed: expected a boolean, got ${JSON.stringify(step.removed)}`);
  }
  if (!Array.isArray(step.uses) || !step.uses.every(isNonEmptyString)) {
    errors.push(`${path}.uses: expected an array of non-empty strings, got ${JSON.stringify(step.uses)}`);
  }
  // WR-01 (code review): a step is a UI-facing record (its number, lead-in
  // and instruction render directly), same as a row — check them with the
  // same thoroughness validateRow already gives every ingredient field.
  // A step key is a safe integer so that domain/stepKeys.js nextStepKey, which
  // hands out the next key, can read every key the import check lets in (WR-04).
  if (!Number.isSafeInteger(step.n)) {
    errors.push(`${path}.n: expected a safe integer, got ${JSON.stringify(step.n)}`);
  }
  if (!isNonEmptyString(step.leadIn)) {
    errors.push(`${path}.leadIn: expected a non-empty string, got ${JSON.stringify(step.leadIn)}`);
  }
  if (!isNonEmptyString(step.instruction)) {
    errors.push(`${path}.instruction: expected a non-empty string, got ${JSON.stringify(step.instruction)}`);
  }
  if (!Array.isArray(step.targets)) {
    errors.push(`${path}.targets: expected an array, got ${JSON.stringify(step.targets)}`);
  } else {
    step.targets.forEach((target, index) => {
      const targetPath = `${path}.targets[${index}]`;
      if (!isPlainObject(target) || !isNonEmptyString(target.label) || !isNonEmptyString(target.value)) {
        errors.push(`${targetPath}: expected { label: non-empty string, value: non-empty string }, got ${JSON.stringify(target)}`);
      }
    });
  }
}

/**
 * validateAuthoredNote(note, path, errors) -> void. D-06's note shape:
 * { text, inheritedFrom }, inheritedFrom a string (the parent's version
 * line) or null.
 */
function validateAuthoredNote(note, path, errors) {
  if (!isPlainObject(note)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (typeof note.text !== 'string') {
    errors.push(`${path}.text: expected a string, got ${JSON.stringify(note.text)}`);
  }
  if (!isStringOrNull(note.inheritedFrom)) {
    errors.push(`${path}.inheritedFrom: expected a string or null, got ${JSON.stringify(note.inheritedFrom)}`);
  }
}

/**
 * validateRecipe(recipe, path, errors) -> void, in validateAuthoredNote's
 * own collect-all-errors, name-the-path style: object check, id a
 * non-empty string, name and description each a string (D-11's { id,
 * name, description } shape). Never throws.
 */
function validateRecipe(recipe, path, errors) {
  if (!isPlainObject(recipe)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(recipe.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (typeof recipe.name !== 'string') {
    errors.push(`${path}.name: expected a string, got ${JSON.stringify(recipe.name)}`);
  }
  if (typeof recipe.description !== 'string') {
    errors.push(`${path}.description: expected a string, got ${JSON.stringify(recipe.description)}`);
  }
}

/**
 * validateLibraryRecord(record, path, errors) -> void, in validateRecipe's
 * own collect-all-errors, name-the-path style. It checks the { id, entry }
 * wrapper and no further (06-CONTEXT.md D-08), because ING-01 will change
 * the entry's shape: the id, the entry as an object, a non-empty name, and
 * a composition of finite numbers. The basis, source, density, category and
 * note of an entry are not checked. Unsafe keys inside a record are already
 * refused by scanForUnsafeKeys over the whole payload. A reserved name is
 * refused as an id's value too, as validateRow does for row ids, because a
 * library id is an object key in data/library.js and may key a map later
 * (D-08 as amended, 2026-10-14). Never throws.
 */
function validateLibraryRecord(record, path, errors) {
  if (!isPlainObject(record)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(record.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (UNSAFE_KEYS.has(record.id)) errors.push(`${path}.id: prototype-mutating id is not allowed, got ${JSON.stringify(record.id)}`);
  if (!isPlainObject(record.entry)) {
    errors.push(`${path}.entry: expected an object`);
    return;
  }
  if (!isNonEmptyString(record.entry.name)) {
    errors.push(`${path}.entry.name: expected a non-empty string, got ${JSON.stringify(record.entry.name)}`);
  }
  if (!isPlainObject(record.entry.composition)) {
    errors.push(`${path}.entry.composition: expected an object`);
  } else {
    for (const [field, value] of Object.entries(record.entry.composition)) {
      if (!isFiniteNumber(value)) {
        errors.push(`${path}.entry.composition.${field}: expected a finite number, got ${JSON.stringify(value)}`);
      }
    }
  }
}

function isAbsentOrNull(value) {
  return value === undefined || value === null;
}

/**
 * validateMarks(marks, path, errors) -> void. Every own value is a 1–5
 * integer — never 0, never a half — an unmarked axis holds no key at all
 * (D-10).
 */
function validateMarks(marks, path, errors) {
  if (!isPlainObject(marks)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  for (const [axis, value] of Object.entries(marks)) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      errors.push(`${path}.${axis}: expected an integer from 1 to 5, got ${JSON.stringify(value)}`);
    }
  }
}

/**
 * validateTasting(tasting, path, errors) -> void, in the same
 * collect-all-errors, name-the-path style as validateBatch. A batch
 * carries zero or one tasting (D-03); this validates the one object a
 * batch may hold at $.tasting.
 */
function validateTasting(tasting, snapshot, path, errors) {
  if (!isPlainObject(tasting)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isAbsentOrNull(tasting.tastedDate) && typeof tasting.tastedDate !== 'string') {
    errors.push(`${path}.tastedDate: expected a string or null`);
  }
  for (const field of ['temperingMinutes', 'tastingTempC', 'meltTestG']) {
    const value = tasting[field];
    if (!isAbsentOrNull(value) && !isFiniteNumber(value)) {
      errors.push(`${path}.${field}: expected a finite number or null, got ${JSON.stringify(value)}`);
    }
  }
  if (!isPlainObject(tasting.marks)) {
    errors.push(`${path}.marks: expected an object`);
  } else {
    validateMarks(tasting.marks, `${path}.marks`, errors);
  }
  if (!isAbsentOrNull(tasting.note) && typeof tasting.note !== 'string') {
    errors.push(`${path}.note: expected a string or null`);
  }
  if (!isAbsentOrNull(tasting.defects) && (!Array.isArray(tasting.defects) || !tasting.defects.every((chip) => DEFECTS.includes(chip)))) {
    errors.push(`${path}.defects: expected an array of known defect chips or null, got ${JSON.stringify(tasting.defects)}`);
  }
  if (!isAbsentOrNull(tasting.declaredDefects)) {
    const declared = isPlainObject(snapshot) && Array.isArray(snapshot.declaredFlaws) ? snapshot.declaredFlaws : [];
    const ticks = tasting.declaredDefects;
    if (!Array.isArray(ticks) || !ticks.every((word) => isNonEmptyString(word) && declared.includes(word))) {
      errors.push(
        `${path}.declaredDefects: expected null or an array of words from this batch's snapshot.declaredFlaws ${JSON.stringify(declared)}, got ${JSON.stringify(ticks)}`,
      );
    } else if (new Set(ticks).size !== ticks.length) {
      errors.push(`${path}.declaredDefects: expected unique words, got ${JSON.stringify(ticks)}`);
    }
  }
  // From freezer (sketch 010 D6, D6b): absent, null, or one of the pen's two
  // words, and never stored beside a scale mark, a defect or a declared
  // defect (T-04-08).
  if (!isAbsentOrNull(tasting.fromFreezer)) {
    if (!MARK_ONE_OPTIONS.includes(tasting.fromFreezer)) {
      errors.push(
        `${path}.fromFreezer: expected one of ${JSON.stringify(MARK_ONE_OPTIONS)} or null, got ${JSON.stringify(tasting.fromFreezer)}`,
      );
    } else {
      const hasMark =
        (isPlainObject(tasting.marks) && Object.keys(tasting.marks).length > 0) ||
        (Array.isArray(tasting.defects) && tasting.defects.length > 0) ||
        (Array.isArray(tasting.declaredDefects) && tasting.declaredDefects.length > 0);
      if (hasMark) {
        errors.push(
          `${path}.fromFreezer: expected null while a scale mark, a defect or a declared defect is set, got ${JSON.stringify(tasting.fromFreezer)}`,
        );
      }
    }
  }
  if (!isEnumOrNull(tasting.meltStyle, SEGMENT_OPTIONS.meltStyle)) {
    errors.push(
      `${path}.meltStyle: expected one of ${JSON.stringify(SEGMENT_OPTIONS.meltStyle)} or null, got ${JSON.stringify(tasting.meltStyle)}`,
    );
  }
}

/**
 * validateDeclaredAxes(declaredAxes, path, errors, coreKeys) -> void, in the
 * same collect-all-errors, name-the-path style as validateRow. Each entry is
 * a declared scale definition { key, name, low, high, kind, group } (decision
 * 3, TASTE-03): isScaleDefinition with group 'declared' and a key that is
 * none of coreKeys, so a mark written under it can neither reach a prototype
 * nor overwrite a core mark (T-09-16). Refuses the name strings of the earlier
 * shape. A recipe declares at most MAX_RECIPE_SCALES scales, each key once.
 */
function validateDeclaredAxes(declaredAxes, path, errors, coreKeys) {
  if (!Array.isArray(declaredAxes)) {
    errors.push(`${path}: expected an array`);
    return;
  }
  declaredAxes.forEach((scale, index) => {
    if (!isScaleDefinition(scale) || scale.group !== 'declared') {
      errors.push(`${path}[${index}]: expected a declared scale definition { key, name, low, high, kind, group }`);
    } else if (coreKeys.includes(scale.key)) {
      errors.push(`${path}[${index}].key: expected a key that is not a core scale key, got ${JSON.stringify(scale.key)}`);
    }
  });
  if (declaredAxes.length > MAX_RECIPE_SCALES) {
    errors.push(`${path}: expected at most ${MAX_RECIPE_SCALES} declared scales, got ${declaredAxes.length}`);
  }
  const keys = declaredAxes.map((scale) => scale?.key);
  if (new Set(keys).size !== keys.length) {
    errors.push(`${path}: expected each declared scale once, got ${JSON.stringify(keys)}`);
  }
}

/**
 * validateDeclaredFlaws(declaredFlaws, path, errors) -> void. The declared
 * problems a version (or a batch's snapshot) names: an array of at most two
 * unique non-empty words (sketch 010 D26). T-04-07: a bounded list of plain
 * strings, nothing a later tick can widen.
 */
function validateDeclaredFlaws(declaredFlaws, path, errors) {
  if (!Array.isArray(declaredFlaws)) {
    errors.push(`${path}: expected an array`);
    return;
  }
  declaredFlaws.forEach((word, index) => {
    if (!isNonEmptyString(word)) {
      errors.push(`${path}[${index}]: expected a non-empty string, got ${JSON.stringify(word)}`);
    }
  });
  if (declaredFlaws.length > MAX_DECLARED) {
    errors.push(`${path}: expected at most ${MAX_DECLARED} declared problems, got ${declaredFlaws.length}`);
  }
  if (new Set(declaredFlaws).size !== declaredFlaws.length) {
    errors.push(`${path}: expected each declared problem once, got ${JSON.stringify(declaredFlaws)}`);
  }
}

/**
 * validateBatch(batch, path, errors) -> void, in the same collect-all-errors,
 * name-the-path style as validateVersion. Every absent-or-null check is
 * written as an explicit null test followed by isFiniteNumber, never as a
 * finite check falling back to truthiness (T-02-10) — a batch whose
 * skipped-row as-made is 0 and whose overrun is 0% must both pass, and both
 * are falsy.
 */
function validateBatch(batch, path, errors) {
  if (!isPlainObject(batch)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(batch.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (!isNonEmptyString(batch.versionId)) errors.push(`${path}.versionId: expected a non-empty string`);
  if (!isFiniteNumber(batch.schemaVersion)) errors.push(`${path}.schemaVersion: expected a finite number`);
  if (!isNonEmptyString(batch.recordedAt)) errors.push(`${path}.recordedAt: expected a non-empty string`);
  if (!isAbsentOrNull(batch.changed) && typeof batch.changed !== 'string') {
    errors.push(`${path}.changed: expected a string or null, got ${JSON.stringify(batch.changed)}`);
  }

  if (!isPlainObject(batch.snapshot)) {
    errors.push(`${path}.snapshot: expected an object`);
  } else {
    if (!Array.isArray(batch.snapshot.rows) || batch.snapshot.rows.length === 0) {
      errors.push(`${path}.snapshot.rows: expected a non-empty array`);
    } else {
      batch.snapshot.rows.forEach((row, index) => validateRow(row, `${path}.snapshot.rows[${index}]`, errors));
    }
    if (typeof batch.snapshot.coefficientSetId !== 'string') {
      errors.push(`${path}.snapshot.coefficientSetId: expected a string`);
    }
    validateDeclaredAxes(batch.snapshot.declaredAxes, `${path}.snapshot.declaredAxes`, errors, CORE_AXIS_KEYS);
    validateDeclaredFlaws(batch.snapshot.declaredFlaws, `${path}.snapshot.declaredFlaws`, errors);
  }

  if (!isPlainObject(batch.churn)) {
    errors.push(`${path}.churn: expected an object`);
  } else {
    const churn = batch.churn;
    // D-10: a row's as-made value is an array aligned index-for-index with
    // that row's portions, each element a finite number or null (never a
    // stored total). A scalar value here is refused at the row's own path,
    // never coerced — the shape a pre-reset record could carry.
    if (!isPlainObject(churn.asMade)) {
      errors.push(`${path}.churn.asMade: expected an object`);
    } else {
      for (const [rowId, values] of Object.entries(churn.asMade)) {
        if (!Array.isArray(values)) {
          errors.push(`${path}.churn.asMade.${rowId}: expected an array, got ${JSON.stringify(values)}`);
        } else {
          values.forEach((value, index) => {
            if (value !== null && !isFiniteNumber(value)) {
              errors.push(
                `${path}.churn.asMade.${rowId}[${index}]: expected a finite number or null, got ${JSON.stringify(value)}`,
              );
            }
          });
        }
      }
    }
    if (!isPlainObject(churn.stepChanges)) {
      errors.push(`${path}.churn.stepChanges: expected an object`);
    }
    for (const field of ['outOfMachineTempC', 'churnDurationMinutes']) {
      const value = churn[field];
      if (!isAbsentOrNull(value) && !isFiniteNumber(value)) {
        errors.push(`${path}.churn.${field}: expected a finite number or null, got ${JSON.stringify(value)}`);
      }
    }
    if (!isEnumOrNull(churn.exitConsistency, SEGMENT_OPTIONS.exitConsistency)) {
      errors.push(
        `${path}.churn.exitConsistency: expected one of ${JSON.stringify(SEGMENT_OPTIONS.exitConsistency)} or null, got ${JSON.stringify(churn.exitConsistency)}`,
      );
    }
    if (!isEnumOrNull(churn.airiness, SEGMENT_OPTIONS.airiness)) {
      errors.push(
        `${path}.churn.airiness: expected one of ${JSON.stringify(SEGMENT_OPTIONS.airiness)} or null, got ${JSON.stringify(churn.airiness)}`,
      );
    }
    // At draw (sketch 010 D6, D6b): absent, null, or one of the pen's two
    // words, and never stored beside a mark in its own group (T-04-08).
    if (!isAbsentOrNull(churn.atDraw)) {
      if (!MARK_ONE_OPTIONS.includes(churn.atDraw)) {
        errors.push(
          `${path}.churn.atDraw: expected one of ${JSON.stringify(MARK_ONE_OPTIONS)} or null, got ${JSON.stringify(churn.atDraw)}`,
        );
      } else if (!isAbsentOrNull(churn.exitConsistency) || !isAbsentOrNull(churn.airiness)) {
        errors.push(`${path}.churn.atDraw: expected null while Exit consistency or Airiness is set, got ${JSON.stringify(churn.atDraw)}`);
      }
    }
    for (const field of ['churnDate', 'atTheMachine', 'ingredientNotes', 'nextTimeNote']) {
      const value = churn[field];
      if (!isAbsentOrNull(value) && typeof value !== 'string') {
        errors.push(`${path}.churn.${field}: expected a string or null, got ${JSON.stringify(value)}`);
      }
    }
  }

  if (!isAbsentOrNull(batch.tasting)) {
    validateTasting(batch.tasting, batch.snapshot, `${path}.tasting`, errors);
  }
}

function validateVersion(version, path, errors) {
  if (!isPlainObject(version)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(version.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (!isNonEmptyString(version.recipeId)) errors.push(`${path}.recipeId: expected a non-empty string`);
  if (typeof version.coefficientSetId !== 'string') errors.push(`${path}.coefficientSetId: expected a string`);
  if (!Array.isArray(version.rows) || version.rows.length === 0) {
    errors.push(`${path}.rows: expected a non-empty array`);
  } else {
    version.rows.forEach((row, index) => validateRow(row, `${path}.rows[${index}]`, errors));
  }
  if (!Array.isArray(version.method)) {
    errors.push(`${path}.method: expected an array`);
  } else {
    version.method.forEach((step, index) => validateStep(step, `${path}.method[${index}]`, errors));
  }
  if (!isPlainObject(version.authored) || !Array.isArray(version.authored.beforeYouStart)) {
    errors.push(`${path}.authored: expected { beforeYouStart: [] }`);
  } else {
    version.authored.beforeYouStart.forEach((note, index) =>
      validateAuthoredNote(note, `${path}.authored.beforeYouStart[${index}]`, errors),
    );
  }

  // D-06's lineage fields — every one a string or null, never required to
  // be present as a truthy value (a blank reason and an unforked version's
  // parentVersionId are both legitimately null).
  for (const field of ['parentVersionId', 'parentVersionLabel', 'reason', 'citedBatchId']) {
    if (!isStringOrNull(version[field])) {
      errors.push(`${path}.${field}: expected a string or null, got ${JSON.stringify(version[field])}`);
    }
  }
  if (!isNonEmptyString(version.createdAt)) {
    errors.push(`${path}.createdAt: expected a non-empty string, got ${JSON.stringify(version.createdAt)}`);
  }
  validateDeclaredAxes(version.declaredAxes, `${path}.declaredAxes`, errors, CORE_AXIS_KEYS);
  validateDeclaredFlaws(version.declaredFlaws, `${path}.declaredFlaws`, errors);
  // WR-01 (code review): all three fields are read directly by the UI
  // (the version-line uniqueness check, the Sheet title/description's own
  // rendering) but were never checked here. versionLabel must be
  // non-empty — the app's own save gate (lineage.js blockedSaveMessage)
  // never lets a blank one through — while sheetTitle and sheetDescription
  // are legitimately blank prose (an authored version can have none), so
  // only their type is checked.
  if (!isNonEmptyString(version.versionLabel)) {
    errors.push(`${path}.versionLabel: expected a non-empty string, got ${JSON.stringify(version.versionLabel)}`);
  }
  if (typeof version.sheetTitle !== 'string') {
    errors.push(`${path}.sheetTitle: expected a string, got ${JSON.stringify(version.sheetTitle)}`);
  }
  if (typeof version.sheetDescription !== 'string') {
    errors.push(`${path}.sheetDescription: expected a string, got ${JSON.stringify(version.sheetDescription)}`);
  }
  // D-13: a version that carries equipment stores the machine's name and both
  // fill limits; a limit not yet known is null, never absent.
  if (version.equipment !== undefined) {
    const equipment = version.equipment;
    if (!isPlainObject(equipment)) {
      errors.push(`${path}.equipment: expected an object, got ${JSON.stringify(equipment)}`);
    } else {
      if (!isStringOrNull(equipment.machine)) {
        errors.push(`${path}.equipment.machine: expected a string or null, got ${JSON.stringify(equipment.machine)}`);
      }
      for (const field of ['minFillG', 'maxFillG']) {
        const grams = equipment[field];
        if (!Object.hasOwn(equipment, field) || (grams !== null && (!isFiniteNumber(grams) || grams < 0))) {
          errors.push(`${path}.equipment.${field}: expected null or a finite number of at least zero, got ${JSON.stringify(grams)}`);
        }
      }
    }
  }
  // D-19: the target serving temperature in degrees C. Checked whenever the
  // version owns the key; plan 09-10 makes the key required. No range check:
  // the creation editor owns any message about an unlikely value.
  if (Object.hasOwn(version, 'serveTempC') && version.serveTempC !== null && !isFiniteNumber(version.serveTempC)) {
    errors.push(`${path}.serveTempC: expected null or a finite number, got ${JSON.stringify(version.serveTempC)}`);
  }
}

/**
 * validateStoreFile(parsed) -> { ok, errors }. The only gate before a write.
 * Collects every error found — never stops at the first — and names the
 * offending path in each message so the maker can see what was wrong.
 * Pure: it has no repository parameter and makes no store call — the D-09
 * parent-resolves check and the D-11 recipe-resolves check, which need to
 * know what the store already holds, live in importStore below, after
 * this gate and before any write.
 *
 * D-10, D-11 (03.5-CONTEXT.md), D-06 (06-CONTEXT.md): the accepted schema
 * is the single value STORE_SCHEMA_VERSION (8), carrying a `recipes` array
 * and a `library` array beside versions and batches. A store exported after this change imports after it; a
 * store exported before it is refused as old — with OLDER_EXPORT_MESSAGE
 * first, a plain sentence a maker can read — rather than silently read as
 * current or lifted. The store resets rather than migrates (D-10): there
 * is no lift branch here.
 */
export function validateStoreFile(parsed) {
  const errors = [];
  scanForUnsafeKeys(parsed, '$', errors);

  if (!isPlainObject(parsed)) {
    errors.push('$: expected the store file to be an object');
    return { ok: false, errors };
  }

  if (parsed.app !== 'sprinkles') {
    errors.push(`$.app: expected "sprinkles", got ${JSON.stringify(parsed.app)}`);
  }
  if (typeof parsed.schemaVersion === 'number' && parsed.schemaVersion < STORE_SCHEMA_VERSION) {
    errors.push(OLDER_EXPORT_MESSAGE);
  }
  if (parsed.schemaVersion !== STORE_SCHEMA_VERSION) {
    errors.push(`$.schemaVersion: expected ${STORE_SCHEMA_VERSION}, got ${JSON.stringify(parsed.schemaVersion)}`);
  }
  if (!Array.isArray(parsed.versions)) {
    errors.push('$.versions: expected an array');
  } else {
    parsed.versions.forEach((version, index) => validateVersion(version, `$.versions[${index}]`, errors));
  }

  if (!Array.isArray(parsed.batches)) {
    errors.push('$.batches: expected an array');
  } else {
    parsed.batches.forEach((batch, index) => validateBatch(batch, `$.batches[${index}]`, errors));
  }

  if (!Array.isArray(parsed.recipes)) {
    errors.push('$.recipes: expected an array');
  } else {
    parsed.recipes.forEach((recipe, index) => validateRecipe(recipe, `$.recipes[${index}]`, errors));
  }

  if (!Array.isArray(parsed.library)) {
    errors.push('$.library: expected an array');
  } else {
    parsed.library.forEach((record, index) => validateLibraryRecord(record, `$.library[${index}]`, errors));
  }

  return { ok: errors.length === 0, errors };
}

// The one sentence a storage failure during an import shows in the import
// panel (the app's own save-failure voice, as RecipePage's BATCH_SAVE_ERROR
// and VERSION_SAVE_ERROR). Shell renders it as it renders every refusal.
export const IMPORT_STORAGE_ERROR = 'Couldn’t save this file. Nothing was changed.';

/**
 * exportStore(repository) -> the whole store as one JSON-serialisable object.
 * It reads the stores it carries in one transaction, so a backup is never
 * built from two moments (06-CONTEXT.md D-07a).
 */
export async function exportStore(repository) {
  const { recipes, versions, batches, library } = await repository.exportAll();
  return {
    app: 'sprinkles',
    schemaVersion: STORE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    versions,
    batches,
    recipes,
    library,
  };
}

/**
 * importStore(repository, parsed) -> { ok, errors }. Validates parsed
 * directly — STORE_SCHEMA_VERSION is the only shape this function ever
 * sees, so there is no lift to run first. Writes nothing on failure — a
 * partially applied import is worse than a refused one (T-04-01, T-02-08):
 * the write is one repository.importAll transaction, and a storage failure
 * on any store call returns IMPORT_STORAGE_ERROR instead of throwing.
 * The D-09 parent-resolves gate and the D-11 recipe-resolves gate run
 * after validation and before any write, in the same two-step "validate
 * then write" shape: a version whose parentVersionId does not resolve to
 * another version in this file or an id already in the store, or whose
 * recipeId does not resolve to a recipe in this file or the store,
 * refuses the whole import.
 */
export async function importStore(repository, parsed) {
  const { ok, errors } = validateStoreFile(parsed);
  if (!ok) return { ok: false, errors };

  // A storage failure on any store call returns the one sentence rather
  // than throwing, so the import panel always has something to show.
  const storageFailure = { ok: false, errors: [IMPORT_STORAGE_ERROR] };

  const fileIds = new Set(parsed.versions.map((version) => version.id));
  let storeVersions;
  try {
    storeVersions = await repository.getAll();
  } catch {
    return storageFailure;
  }
  const storeIds = new Set(storeVersions.map((version) => version.id));
  const parentErrors = [];
  parsed.versions.forEach((version, index) => {
    if (version.parentVersionId !== null && !fileIds.has(version.parentVersionId) && !storeIds.has(version.parentVersionId)) {
      parentErrors.push(
        `$.versions[${index}].parentVersionId: refers to a version not present in this file or the store, ${JSON.stringify(version.parentVersionId)}`,
      );
    }
  });
  if (parentErrors.length > 0) return { ok: false, errors: parentErrors };

  // D-11: a version whose recipeId names no recipe, in this file or
  // already in the store, refuses the whole import — the same shape as
  // the parent-resolves gate above.
  const fileRecipeIds = new Set(parsed.recipes.map((recipe) => recipe.id));
  let storeRecipes;
  try {
    storeRecipes = await repository.listRecipes();
  } catch {
    return storageFailure;
  }
  const storeRecipeIds = new Set(storeRecipes.map((recipe) => recipe.id));
  const recipeErrors = [];
  parsed.versions.forEach((version, index) => {
    if (!fileRecipeIds.has(version.recipeId) && !storeRecipeIds.has(version.recipeId)) {
      recipeErrors.push(
        `$.versions[${index}].recipeId: refers to a recipe not present in this file or the store, ${JSON.stringify(version.recipeId)}`,
      );
    }
  });
  if (recipeErrors.length > 0) return { ok: false, errors: recipeErrors };

  // One transaction over recipes, versions, batches and library: all four
  // land or none does (Mark, 2026-10-11; 06-CONTEXT.md D-07). The file's
  // library is checked above with the rest (D-08).
  try {
    await repository.importAll({ recipes: parsed.recipes, versions: parsed.versions, batches: parsed.batches, library: parsed.library });
  } catch {
    return storageFailure;
  }
  return { ok: true, errors: [] };
}
