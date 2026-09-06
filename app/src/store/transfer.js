// Whole-store JSON transfer (D-06), behind the repository seam. Neither
// export nor import touches the store library — see repository.js for the
// only path to IndexedDB. validateStoreFile is the one gate before a write:
// a malformed file is refused with every error found, never half-applied
// (T-04-01) and never used to reach past an object's own properties into
// its prototype chain (T-04-02).

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
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

function validateRow(row, path, errors) {
  if (!isPlainObject(row)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(row.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (typeof row.ingredientName !== 'string') errors.push(`${path}.ingredientName: expected a string`);
  if (!isFiniteNumber(row.grams) || row.grams < 0) {
    errors.push(`${path}.grams: expected a finite number of at least zero, got ${JSON.stringify(row.grams)}`);
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
}

function isAbsentOrNull(value) {
  return value === undefined || value === null;
}

function validateTasting(tasting, path, errors) {
  if (!isPlainObject(tasting)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(tasting.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (!isAbsentOrNull(tasting.date) && typeof tasting.date !== 'string') {
    errors.push(`${path}.date: expected a string or null`);
  }
  for (const field of ['tastingTempC', 'meltdownLossG']) {
    const value = tasting[field];
    if (!isAbsentOrNull(value) && !isFiniteNumber(value)) {
      errors.push(`${path}.${field}: expected a finite number or absent, got ${JSON.stringify(value)}`);
    }
  }
  if (!isPlainObject(tasting.marks)) {
    errors.push(`${path}.marks: expected an object`);
  } else {
    for (const [axis, value] of Object.entries(tasting.marks)) {
      if (!isFiniteNumber(value)) {
        errors.push(`${path}.marks.${axis}: expected a finite number, got ${JSON.stringify(value)}`);
      }
    }
  }
  for (const field of ['words', 'nextTimeNote']) {
    const value = tasting[field];
    if (!isAbsentOrNull(value) && typeof value !== 'string') {
      errors.push(`${path}.${field}: expected a string or null`);
    }
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
  if (!Array.isArray(batch.amendedAt) || !batch.amendedAt.every(isNonEmptyString)) {
    errors.push(`${path}.amendedAt: expected an array of non-empty strings`);
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
    if (!Array.isArray(batch.snapshot.declaredAxes)) {
      errors.push(`${path}.snapshot.declaredAxes: expected an array`);
    }
  }

  if (!isPlainObject(batch.churn)) {
    errors.push(`${path}.churn: expected an object`);
  } else {
    const churn = batch.churn;
    if (!isPlainObject(churn.asMade)) {
      errors.push(`${path}.churn.asMade: expected an object`);
    } else {
      for (const [rowId, value] of Object.entries(churn.asMade)) {
        if (!isFiniteNumber(value)) {
          errors.push(`${path}.churn.asMade.${rowId}: expected a finite number, got ${JSON.stringify(value)}`);
        }
      }
    }
    if (!isPlainObject(churn.stepChanges)) {
      errors.push(`${path}.churn.stepChanges: expected an object`);
    }
    for (const field of ['comeUpMinutes', 'drawTempC', 'overrunPercent']) {
      const value = churn[field];
      if (!isAbsentOrNull(value) && !isFiniteNumber(value)) {
        errors.push(`${path}.churn.${field}: expected a finite number or null, got ${JSON.stringify(value)}`);
      }
    }
    for (const field of ['churnDate', 'drawNotes', 'ingredientNotes', 'nextTimeNote']) {
      const value = churn[field];
      if (!isAbsentOrNull(value) && typeof value !== 'string') {
        errors.push(`${path}.churn.${field}: expected a string or null, got ${JSON.stringify(value)}`);
      }
    }
  }

  if (!Array.isArray(batch.tastings)) {
    errors.push(`${path}.tastings: expected an array`);
  } else {
    batch.tastings.forEach((tasting, index) => validateTasting(tasting, `${path}.tastings[${index}]`, errors));
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
  }
  if (
    !isPlainObject(version.authored) ||
    !Array.isArray(version.authored.carriedForward) ||
    !Array.isArray(version.authored.beforeYouStart)
  ) {
    errors.push(`${path}.authored: expected { carriedForward: [], beforeYouStart: [] }`);
  }
}

/**
 * validateStoreFile(parsed) -> { ok, errors }. The only gate before a write.
 * Collects every error found — never stops at the first — and names the
 * offending path in each message so the maker can see what was wrong.
 *
 * Stated decision (Claude's discretion, 02-CONTEXT.md): a schemaVersion 1
 * file still imports, as a store with no batches. An export taken during
 * Phase 1 predates the batches store; the version 1 shape is a strict
 * subset of version 2, so accepting it costs one branch and refusing it
 * would destroy a file the app itself wrote. A version 1 file that
 * nonetheless carries a non-empty batches array is malformed rather than
 * old, and is refused. Export always writes 2 — there is no way to ask for
 * an older file, because a downgrade path would be a second format to keep
 * true.
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
  if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) {
    errors.push(`$.schemaVersion: expected 1 or 2, got ${JSON.stringify(parsed.schemaVersion)}`);
  }
  if (!Array.isArray(parsed.versions)) {
    errors.push('$.versions: expected an array');
  } else {
    parsed.versions.forEach((version, index) => validateVersion(version, `$.versions[${index}]`, errors));
  }

  if (parsed.schemaVersion === 2) {
    if (!Array.isArray(parsed.batches)) {
      errors.push('$.batches: expected an array');
    } else {
      parsed.batches.forEach((batch, index) => validateBatch(batch, `$.batches[${index}]`, errors));
    }
  } else if (parsed.schemaVersion === 1) {
    if (parsed.batches !== undefined && !(Array.isArray(parsed.batches) && parsed.batches.length === 0)) {
      errors.push(`$.batches: expected absent or empty under schemaVersion 1, got ${JSON.stringify(parsed.batches)}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/** exportStore(repository) -> the whole store as one JSON-serialisable object. */
export async function exportStore(repository) {
  const versions = await repository.getAll();
  const batches = await repository.getAllBatches();
  return {
    app: 'sprinkles',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    versions,
    batches,
  };
}

/**
 * importStore(repository, parsed) -> { ok, errors }. Validates first and
 * writes nothing on failure — a partially applied import is worse than a
 * refused one (see the threat register, T-04-01, T-02-08).
 */
export async function importStore(repository, parsed) {
  const { ok, errors } = validateStoreFile(parsed);
  if (!ok) return { ok: false, errors };

  await repository.putAll(parsed.versions);
  if (parsed.schemaVersion === 2) {
    await repository.putAllBatches(parsed.batches);
  }
  return { ok: true, errors: [] };
}
