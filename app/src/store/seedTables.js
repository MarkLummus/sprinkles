// Pure validators for the ingredient library and the four seed tables
// (machines, styles, scales, problems), shared by import and by boot so the two
// can never drift apart (D-17, LIB-09, D-20), and the one collection check every
// later gate shares (catalogConflicts). Every validator is in the
// collect-every-error, path-named, never-throw idiom: it pushes a message that
// names the offending field's path onto `errors` and returns nothing. No store,
// no DOM, no import from transfer.js (transfer.js imports this file).
import { SCALE_KINDS, SCALE_GROUPS, CORE_SCALE_COUNT, isScaleDefinition, scaleDefinition } from '../domain/catalog.js';
import { STAGE_IDS } from '../domain/stages.js';

// domain/versionRow.js RESERVED_ROW_IDS mirrors this set; transfer.test.js pins the two.
export const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

// A row's id is an object key downstream, so a name the key scan refuses as a
// key is refused here as an id too (as validateRow does for row ids).
function checkId(row, path, errors) {
  if (!isNonEmptyString(row.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (UNSAFE_KEYS.has(row.id)) errors.push(`${path}.id: prototype-mutating id is not allowed, got ${JSON.stringify(row.id)}`);
}

function checkName(row, field, path, errors) {
  if (!isNonEmptyString(row[field])) errors.push(`${path}.${field}: expected a non-empty string, got ${JSON.stringify(row[field])}`);
}

function checkOrder(row, path, errors) {
  if (!isFiniteNumber(row.order)) errors.push(`${path}.order: expected a finite number, got ${JSON.stringify(row.order)}`);
}

// The six coefficient keys every library entry owns (D-20), in the order their
// errors are reported. Each is an own key, null when unknown.
const COEFFICIENT_CHECKS = [
  ['fatStructural', (value) => value === null || typeof value === 'boolean', 'null or a boolean'],
  ['ownEmulsifier', (value) => value === null || typeof value === 'boolean', 'null or a boolean'],
  ['titratableAcidity', (value) => value === null || (isFiniteNumber(value) && value >= 0), 'null or a finite number of at least 0'],
  ['defaultStage', (value) => value === null || STAGE_IDS.includes(value), `null or one of ${STAGE_IDS.join(', ')}`],
  ['prepNote', (value) => value === null || typeof value === 'string', 'null or a string'],
  ['requiresHeat', (value) => value === null || typeof value === 'boolean', 'null or a boolean'],
];

/**
 * validateLibraryRecord(record, path, errors) -> void, in validateRecipe's
 * own collect-all-errors, name-the-path style. It checks the { id, entry }
 * wrapper and the six D-20 coefficient keys, and no further (06-CONTEXT.md
 * D-08): the id, the entry as an object, a non-empty name, a composition of
 * finite numbers, and each of fatStructural, ownEmulsifier, titratableAcidity,
 * defaultStage, prepNote and requiresHeat as an own key holding null or a
 * value of its type. The basis, source, density, category and note of an entry
 * are not checked. Unsafe keys inside a record are already refused by
 * scanForUnsafeKeys over the whole payload. A reserved name is refused as an
 * id's value too, as validateRow does for row ids, because a library id is an
 * object key in data/library.js and may key a map later (D-08 as amended,
 * 2026-10-14). Never throws.
 */
export function validateLibraryRecord(record, path, errors) {
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
  for (const [key, isValid, expected] of COEFFICIENT_CHECKS) {
    if (!Object.hasOwn(record.entry, key)) {
      errors.push(`${path}.entry.${key}: expected an own key, null when unknown`);
    } else if (!isValid(record.entry[key])) {
      errors.push(`${path}.entry.${key}: expected ${expected}, got ${JSON.stringify(record.entry[key])}`);
    }
  }
}

/**
 * validateMachineRow(row, path, errors) -> void. A machine is { id, name,
 * minFillG, maxFillG, order }: minFillG a finite number of at least 0, maxFillG
 * null (Mark fills it in later) or a finite number of at least minFillG.
 */
export function validateMachineRow(row, path, errors) {
  if (!isPlainObject(row)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  checkId(row, path, errors);
  checkName(row, 'name', path, errors);
  checkOrder(row, path, errors);
  const minOk = isFiniteNumber(row.minFillG) && row.minFillG >= 0;
  if (!minOk) errors.push(`${path}.minFillG: expected a finite number of at least zero, got ${JSON.stringify(row.minFillG)}`);
  if (row.maxFillG !== null) {
    const floor = minOk ? row.minFillG : 0;
    if (!isFiniteNumber(row.maxFillG) || row.maxFillG < floor) {
      errors.push(`${path}.maxFillG: expected null or a finite number of at least ${floor}, got ${JSON.stringify(row.maxFillG)}`);
    }
  }
}

// The six balance figures a style may band. A blank band is an absent key.
const BAND_KEYS = ['pac', 'pod', 'fat', 'msnf', 'sugar', 'solids'];
// The four extra ranges a style carries, each { min, max } with max null when open.
const RANGE_FIELDS = ['eggYolkPct', 'overrunPct', 'stabilizerPct', 'emulsifierPct'];

function checkBand(band, path, errors) {
  if (!Array.isArray(band) || band.length !== 2 || !band.every(isFiniteNumber) || band[0] > band[1]) {
    errors.push(`${path}: expected [low, high] as two finite numbers with low at most high, got ${JSON.stringify(band)}`);
  }
}

function checkRange(range, path, errors) {
  if (!isPlainObject(range)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isFiniteNumber(range.min)) errors.push(`${path}.min: expected a finite number, got ${JSON.stringify(range.min)}`);
  if (range.max !== null && (!isFiniteNumber(range.max) || (isFiniteNumber(range.min) && range.max < range.min))) {
    errors.push(`${path}.max: expected null or a finite number of at least min, got ${JSON.stringify(range.max)}`);
  }
  for (const field of ['typicalMin', 'typicalMax']) {
    if (range[field] !== undefined && !isFiniteNumber(range[field])) {
      errors.push(`${path}.${field}: expected a finite number when present, got ${JSON.stringify(range[field])}`);
    }
  }
}

function checkServeTemp(serveTempC, path, errors) {
  if (!isPlainObject(serveTempC)) {
    errors.push(`${path}: expected { default, min, max }`);
    return;
  }
  for (const field of ['default', 'min', 'max']) {
    if (!isFiniteNumber(serveTempC[field])) {
      errors.push(`${path}.${field}: expected a finite number, got ${JSON.stringify(serveTempC[field])}`);
    }
  }
  const { default: fallback, min, max } = serveTempC;
  if (isFiniteNumber(min) && isFiniteNumber(max) && min > max) {
    errors.push(`${path}.min: expected min at most max, got ${JSON.stringify(min)} and ${JSON.stringify(max)}`);
  }
  // A version's serveTempC is filled from this default (D-19), so it must lie in its own range.
  if (isFiniteNumber(fallback) && ((isFiniteNumber(min) && fallback < min) || (isFiniteNumber(max) && fallback > max))) {
    errors.push(`${path}.default: expected a number from min to max, got ${JSON.stringify(fallback)}`);
  }
}

/**
 * validateStyleRow(row, path, errors) -> void. A style is { id, name, order,
 * bands, eggYolkPct, overrunPct, stabilizerPct, emulsifierPct, serveTempC,
 * equipmentClass, calibrationFamily }: bands keyed by pac, pod, fat, msnf,
 * sugar or solids, each [low, high] with low at most high (a blank band is an
 * absent key); the four ranges { min, max }; serveTempC { default, min, max }
 * as three finite numbers with min at most default at most max (D-19); the
 * class and family plain ids.
 */
export function validateStyleRow(row, path, errors) {
  if (!isPlainObject(row)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  checkId(row, path, errors);
  checkName(row, 'name', path, errors);
  checkOrder(row, path, errors);
  if (!isPlainObject(row.bands)) {
    errors.push(`${path}.bands: expected an object`);
  } else {
    for (const [key, band] of Object.entries(row.bands)) {
      if (!BAND_KEYS.includes(key)) {
        errors.push(`${path}.bands.${key}: expected one of ${BAND_KEYS.join(', ')}`);
      } else {
        checkBand(band, `${path}.bands.${key}`, errors);
      }
    }
  }
  for (const field of RANGE_FIELDS) checkRange(row[field], `${path}.${field}`, errors);
  checkServeTemp(row.serveTempC, `${path}.serveTempC`, errors);
  checkName(row, 'equipmentClass', path, errors);
  checkName(row, 'calibrationFamily', path, errors);
}

/**
 * validateScaleRow(row, path, errors) -> void. A scale row is the definition
 * { key, name, low, high, kind, group } plus id (equal to key) and order
 * (domain/catalog.js).
 */
export function validateScaleRow(row, path, errors) {
  if (!isPlainObject(row)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  const before = errors.length;
  checkId(row, path, errors);
  if (!isNonEmptyString(row.key)) errors.push(`${path}.key: expected a non-empty string, got ${JSON.stringify(row.key)}`);
  if (UNSAFE_KEYS.has(row.key)) errors.push(`${path}.key: prototype-mutating key is not allowed, got ${JSON.stringify(row.key)}`);
  if (isNonEmptyString(row.id) && isNonEmptyString(row.key) && row.id !== row.key) {
    errors.push(`${path}.id: expected the id to equal the key ${JSON.stringify(row.key)}, got ${JSON.stringify(row.id)}`);
  }
  for (const field of ['name', 'low', 'high']) checkName(row, field, path, errors);
  if (!SCALE_KINDS.includes(row.kind)) {
    errors.push(`${path}.kind: expected one of ${SCALE_KINDS.join(', ')}, got ${JSON.stringify(row.kind)}`);
  }
  if (!SCALE_GROUPS.includes(row.group)) {
    errors.push(`${path}.group: expected one of ${SCALE_GROUPS.join(', ')}, got ${JSON.stringify(row.group)}`);
  }
  checkOrder(row, path, errors);
  // Every field above is sound, so the definition the batch will copy must be one.
  if (errors.length === before && !isScaleDefinition(scaleDefinition(row))) {
    errors.push(`${path}: expected a scale definition`);
  }
}

/**
 * validateProblemRow(row, path, errors) -> void. A problem stays a word
 * (09-RESEARCH A1): { id, name, order }.
 */
export function validateProblemRow(row, path, errors) {
  if (!isPlainObject(row)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  checkId(row, path, errors);
  checkName(row, 'name', path, errors);
  checkOrder(row, path, errors);
}

// The five seed tables: the validator for a row and the plain word a maker
// reads for the table (ingredients, machines, ice cream styles, scales, problems).
export const SEED_TABLES = {
  library: { validate: validateLibraryRecord, word: 'ingredients' },
  machines: { validate: validateMachineRow, word: 'machines' },
  styles: { validate: validateStyleRow, word: 'ice cream styles' },
  scales: { validate: validateScaleRow, word: 'scales' },
  problems: { validate: validateProblemRow, word: 'problems' },
};

/**
 * catalogConflicts({ scales, problems, versions = [] }) -> the ways the lists,
 * taken together, would make a newly recorded batch's snapshot invalid by plan
 * 09-14's rules, in this order:
 *   { kind: 'core-count', count }              the rows with group 'core' are not CORE_SCALE_COUNT;
 *   { kind: 'declared-core-key', versionId, key }  a version declares a scale whose key is a core row's key;
 *   { kind: 'problem-name', name, ids }        two or more problem rows hold one name (exact comparison,
 *                                              the way a tasting names a problem).
 * Valid rows one at a time are not a valid catalog, so import, the import
 * transaction and the boot check all share this one rule. Pure, and never
 * throws on a malformed list: a list that is not an array counts as empty, a
 * row that is not a plain object or lacks a string key, group or name is
 * skipped, and a version whose declaredAxes is not an array declares nothing.
 */
export function catalogConflicts({ scales, problems, versions = [] } = {}) {
  const conflicts = [];
  const scaleRows = Array.isArray(scales) ? scales.filter((row) => isPlainObject(row) && typeof row.key === 'string' && typeof row.group === 'string') : [];
  const coreRows = scaleRows.filter((row) => row.group === 'core');
  const coreKeys = new Set(coreRows.map((row) => row.key));
  if (coreRows.length !== CORE_SCALE_COUNT) conflicts.push({ kind: 'core-count', count: coreRows.length });
  for (const version of Array.isArray(versions) ? versions : []) {
    if (!isPlainObject(version) || !Array.isArray(version.declaredAxes)) continue;
    for (const axis of version.declaredAxes) {
      if (isPlainObject(axis) && typeof axis.key === 'string' && coreKeys.has(axis.key)) {
        conflicts.push({ kind: 'declared-core-key', versionId: version.id, key: axis.key });
      }
    }
  }
  const idsByName = new Map();
  for (const row of Array.isArray(problems) ? problems : []) {
    if (!isPlainObject(row) || typeof row.name !== 'string') continue;
    if (!idsByName.has(row.name)) idsByName.set(row.name, []);
    idsByName.get(row.name).push(row.id);
  }
  for (const [name, ids] of idsByName) {
    if (ids.length >= 2) conflicts.push({ kind: 'problem-name', name, ids });
  }
  return conflicts;
}

// The tables the boot check reads, in the order it checks them. The library
// goes through SEED_TABLES.library.validate exactly, the store file's own
// validator and nothing stricter: boot is as strict as import on an entry's
// structure and as tolerant as the Ingredients place on its display fields, so
// a store an import accepted or the seed wrote always opens (see
// firstDamagedTable below).
const BOOT_TABLES = ['library', 'machines', 'styles', 'scales', 'problems'];

// The words boot gives for the table-level conflicts catalogConflicts reports;
// a conflict kind not named here (declared-core-key) needs versions, which boot
// does not read: only an import could make a version declare a core key, and
// plan 09-10 refuses that import.
function bootConflictLine(conflict) {
  if (conflict.kind === 'core-count') {
    return { table: 'scales', line: `scales: expected exactly ${CORE_SCALE_COUNT} core scales, found ${conflict.count}` };
  }
  if (conflict.kind === 'problem-name') {
    return { table: 'problems', line: `problems: ${JSON.stringify(conflict.name)} names more than one problem (${conflict.ids.join(', ')})` };
  }
  return null;
}

/**
 * firstDamagedTable({ library, machines, styles, scales, problems }) -> the
 * first table, in that order, with a row that fails its validator or with a
 * table-level conflict, as { table, word, errors }; or null when every table
 * is sound (D-17). `word` is the plain word a maker reads for the table. An
 * empty list holds no bad row, so the library, machines, styles and problems
 * lists may be empty; an empty scales list holds no core scale and is reported
 * by the core-count rule (boot never meets one: seedIfEmpty refills an empty
 * table first).
 *
 * The table-level errors come from catalogConflicts, the check import shares
 * (plan 09-10), so boot and import hold one rule: the scales table must hold
 * exactly CORE_SCALE_COUNT core rows (the record pen's desktop grid places
 * four; a design choice of this phase, not a CONTEXT decision, shown to Mark on
 * decide-p9-boot-check-scope, whose lift-core-count option removes it), and no
 * two problem rows may share a name (a batch would copy the word twice and its
 * export would be refused).
 *
 * Boot holds the library to exactly SEED_TABLES.library.validate, the store
 * file's own validator, and no stricter check (decide-p9-boot-check-scope =
 * keep): it is as strict as import on an entry's structure (id, name, a
 * composition of finite numbers, which the balance needs, and the six D-20
 * coefficient keys) and as tolerant as the Ingredients place on its display
 * fields, so a store an import accepted or the seed wrote always opens. A later
 * tightening of validateLibraryRecord tightens boot too.
 */
export function firstDamagedTable(lists) {
  const conflicts = catalogConflicts({ scales: lists.scales, problems: lists.problems }).map(bootConflictLine).filter(Boolean);
  for (const table of BOOT_TABLES) {
    const errors = [];
    const rows = Array.isArray(lists[table]) ? lists[table] : [];
    rows.forEach((row, index) => SEED_TABLES[table].validate(row, `${table}[${index}]`, errors));
    for (const conflict of conflicts) if (conflict.table === table) errors.push(conflict.line);
    if (errors.length > 0) return { table, word: SEED_TABLES[table].word, errors };
  }
  return null;
}

/** bootDamagedLine(word) -> the one line the app shows in place of itself (D-17). */
export function bootDamagedLine(word) {
  return `Sprinkles can’t open: its list of ${word} has a damaged entry.`;
}

/**
 * mergeById(stored, incoming) -> the table an import would leave: an incoming
 * row replacing a stored row of the same id, stored rows the incoming list
 * lacks staying, stored order first and new rows after, in incoming order. A
 * list that is not an array counts as empty; a row that is not a plain object
 * is skipped.
 */
export function mergeById(stored, incoming) {
  const merged = new Map();
  for (const row of Array.isArray(stored) ? stored : []) {
    if (isPlainObject(row)) merged.set(row.id, row);
  }
  for (const row of Array.isArray(incoming) ? incoming : []) {
    if (isPlainObject(row)) merged.set(row.id, row);
  }
  return [...merged.values()];
}

function describeConflict(conflict) {
  if (conflict?.kind === 'core-count') return `${conflict.count} core scales instead of ${CORE_SCALE_COUNT}`;
  if (conflict?.kind === 'declared-core-key') return `version ${conflict.versionId} declares the core scale ${conflict.key}`;
  if (conflict?.kind === 'problem-name') return `the problem ${JSON.stringify(conflict.name)} is held by ${conflict.ids.length} rows`;
  return 'an unknown conflict';
}

// What repository.importAll throws (plan 09-10) when the merged tables would
// make a batch's snapshot invalid. It lives here, not in repository.js, so
// transfer.js can recognise it with instanceof through the module it already
// imports (the Shell tests mock repository.js, which transfer.js must not import).
export class CatalogConflictError extends Error {
  constructor(conflicts) {
    super(`The scales and problems would not work together: ${conflicts.map(describeConflict).join('; ')}`);
    this.name = 'CatalogConflictError';
    this.conflicts = conflicts;
  }
}
