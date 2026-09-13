// Whole-store JSON transfer (D-08), behind the repository seam. Neither
// export nor import touches the store library — see repository.js for the
// only path to IndexedDB. validateStoreFile is the one gate before a
// write: a malformed file is refused with every error found, never
// half-applied (T-04-01) and never used to reach past an object's own
// properties into its prototype chain (T-04-02). It now knows exactly one
// shape — schemaVersion 5, the battery's stored shape
// (03.3.1-CONTEXT.md D-09) — and refuses 1 through 4 rather than lifting
// them; there is no ladder here anymore.
import { AXES } from '../domain/axes.js';
import { SEGMENT_OPTIONS, DEFECTS } from '../domain/battery.js';

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const DECLARED_AXIS_NAMES = AXES.filter((axis) => axis.group === 'declared').map((axis) => axis.name);

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
 * number of at least zero, and step must be a finite number.
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
}

function validateRow(row, path, errors) {
  if (!isPlainObject(row)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(row.id)) errors.push(`${path}.id: expected a non-empty string`);
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
  if (!isFiniteNumber(step.n)) {
    errors.push(`${path}.n: expected a finite number, got ${JSON.stringify(step.n)}`);
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
function validateTasting(tasting, path, errors) {
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
  if (tasting.bitterDeclared !== true && tasting.bitterDeclared !== null) {
    errors.push(`${path}.bitterDeclared: expected true or null, got ${JSON.stringify(tasting.bitterDeclared)}`);
  }
  if (!isEnumOrNull(tasting.meltStyle, SEGMENT_OPTIONS.meltStyle)) {
    errors.push(
      `${path}.meltStyle: expected one of ${JSON.stringify(SEGMENT_OPTIONS.meltStyle)} or null, got ${JSON.stringify(tasting.meltStyle)}`,
    );
  }
}

/**
 * validateDeclaredAxes(declaredAxes, path, errors) -> void, in the same
 * collect-all-errors, name-the-path style as validateRow. Each entry is a
 * non-empty string naming one of the battery's declared-pair axes
 * (domain/axes.js's AXES, group 'declared') — refuses the pre-reset
 * `{ name, low, high }` object shape, which would otherwise reach
 * axesForBatch as a name that resolves to nothing.
 */
function validateDeclaredAxes(declaredAxes, path, errors) {
  if (!Array.isArray(declaredAxes)) {
    errors.push(`${path}: expected an array`);
    return;
  }
  declaredAxes.forEach((name, index) => {
    if (!isNonEmptyString(name) || !DECLARED_AXIS_NAMES.includes(name)) {
      errors.push(`${path}[${index}]: expected one of ${JSON.stringify(DECLARED_AXIS_NAMES)}, got ${JSON.stringify(name)}`);
    }
  });
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
    validateDeclaredAxes(batch.snapshot.declaredAxes, `${path}.snapshot.declaredAxes`, errors);
    if (!isAbsentOrNull(batch.snapshot.declaredFlaw) && typeof batch.snapshot.declaredFlaw !== 'string') {
      errors.push(`${path}.snapshot.declaredFlaw: expected a string or null, got ${JSON.stringify(batch.snapshot.declaredFlaw)}`);
    }
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
    for (const field of ['timeToDrawTempMinutes', 'outOfMachineTempC', 'churnDurationMinutes']) {
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
    for (const field of ['churnDate', 'atTheMachine', 'ingredientNotes', 'nextTimeNote']) {
      const value = churn[field];
      if (!isAbsentOrNull(value) && typeof value !== 'string') {
        errors.push(`${path}.churn.${field}: expected a string or null, got ${JSON.stringify(value)}`);
      }
    }
  }

  if (!isAbsentOrNull(batch.tasting)) {
    validateTasting(batch.tasting, `${path}.tasting`, errors);
  }
}

function validateVersion(version, path, errors) {
  if (!isPlainObject(version)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(version.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (typeof version.recipeName !== 'string') errors.push(`${path}.recipeName: expected a string`);
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
  if (
    !isPlainObject(version.authored) ||
    !Array.isArray(version.authored.carriedForward) ||
    !Array.isArray(version.authored.beforeYouStart)
  ) {
    errors.push(`${path}.authored: expected { carriedForward: [], beforeYouStart: [] }`);
  } else {
    version.authored.carriedForward.forEach((note, index) =>
      validateAuthoredNote(note, `${path}.authored.carriedForward[${index}]`, errors),
    );
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
  validateDeclaredAxes(version.declaredAxes, `${path}.declaredAxes`, errors);
  if (!isAbsentOrNull(version.declaredFlaw) && typeof version.declaredFlaw !== 'string') {
    errors.push(`${path}.declaredFlaw: expected a string or null, got ${JSON.stringify(version.declaredFlaw)}`);
  }
  // WR-01 (code review): both fields are read directly by the UI (the
  // version-line uniqueness check, the headnote's own rendering) but were
  // never checked here. versionLabel must be non-empty — the app's own
  // save gate (lineage.js blockedSaveMessage) never lets a blank one
  // through — while headnote is legitimately blank prose (an authored
  // version can have none), so only its type is checked.
  if (!isNonEmptyString(version.versionLabel)) {
    errors.push(`${path}.versionLabel: expected a non-empty string, got ${JSON.stringify(version.versionLabel)}`);
  }
  if (typeof version.headnote !== 'string') {
    errors.push(`${path}.headnote: expected a string, got ${JSON.stringify(version.headnote)}`);
  }
}

/**
 * validateStoreFile(parsed) -> { ok, errors }. The only gate before a write.
 * Collects every error found — never stops at the first — and names the
 * offending path in each message so the maker can see what was wrong.
 * Pure: it has no repository parameter and makes no store call — the D-09
 * parent-resolves check, which needs to know what the store already
 * holds, lives in importStore below, after this gate and before any write.
 *
 * D-09 (03.3.1-CONTEXT.md): the accepted schema is the single value 5, the
 * battery's stored shape. A store exported after this change imports
 * after it; a store exported before it — schemaVersion 1 through 4 — is
 * refused as old rather than silently read as current. Reinstating that
 * older promise means restoring one lift branch in importStore alone,
 * never a second live-database ladder (CONTEXT.md Deferred Ideas).
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
  if (parsed.schemaVersion !== 5) {
    errors.push(`$.schemaVersion: expected 5, got ${JSON.stringify(parsed.schemaVersion)}`);
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

  return { ok: errors.length === 0, errors };
}

/** exportStore(repository) -> the whole store as one JSON-serialisable object. */
export async function exportStore(repository) {
  const versions = await repository.getAll();
  const batches = await repository.getAllBatches();
  return {
    app: 'sprinkles',
    schemaVersion: 5,
    exportedAt: new Date().toISOString(),
    versions,
    batches,
  };
}

/**
 * importStore(repository, parsed) -> { ok, errors }. Validates parsed
 * directly — schemaVersion 5 is the only shape this function ever sees,
 * so there is no lift to run first. Writes nothing on failure — a
 * partially applied import is worse than a refused one (T-04-01, T-02-08).
 * The D-09 parent-resolves gate runs after validation and before any
 * write, in the same two-step "validate then write" shape: a version
 * whose parentVersionId does not resolve to another version in this file
 * or an id already in the store refuses the whole import.
 */
export async function importStore(repository, parsed) {
  const { ok, errors } = validateStoreFile(parsed);
  if (!ok) return { ok: false, errors };

  const fileIds = new Set(parsed.versions.map((version) => version.id));
  const storeVersions = await repository.getAll();
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

  await repository.putAll(parsed.versions);
  await repository.putAllBatches(parsed.batches);
  return { ok: true, errors: [] };
}
