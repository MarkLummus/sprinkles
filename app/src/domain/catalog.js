// Pure. No framework, no DOM, no store import. The scale and problem
// definition contract (Phase 9, decision 3, D-03b, TASTE-03), fixed once so
// every later plan and Phase 10 build on the same shape.
//
// The stored scale definition is { key, name, low, high, kind, group }:
//  - key: the scale's stable identity; a mark is written under it. Never one
//    of '__proto__', 'constructor' or 'prototype'.
//  - name, low, high: the scale's words, each non-blank.
//  - kind: 'goldilocks' (the middle is right) or 'magnitude' (more is more).
//  - group: 'core' (the battery's own scales) or 'declared' (a recipe's own).
// A table row is the definition plus id (equal to key) and order; a version
// and a batch snapshot keep the bare definition (scaleDefinition below). The
// shape is Claude's discretion per 09-CONTEXT, RESEARCH Assumption A7.
//
// Problems stay words (RESEARCH Assumption A1, Open Question 1 resolved): a
// problem row is { id, name, order } and a batch keeps the words.

export const SCALE_KINDS = ['goldilocks', 'magnitude'];
export const SCALE_GROUPS = ['core', 'declared'];

// A recipe declares at most two scales and two problems of its own.
export const MAX_RECIPE_SCALES = 2;
export const MAX_RECIPE_PROBLEMS = 2;

// The battery's four core places, every recipe's column in the record pen's
// desktop grid. It is the one supported number of core scales, which the boot
// check, the import and a batch snapshot are held to in later plans (09-10 to
// 09-12 and 09-14); shown to Mark on decide-p9-boot-check-scope (plan 09-01).
// Letting a maker add core scales is deferred (09-CONTEXT Deferred Ideas).
export const CORE_SCALE_COUNT = 4;

const DEFINITION_KEYS = ['key', 'name', 'low', 'high', 'kind', 'group'];
const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value !== '';
}

/**
 * isScaleDefinition(value) -> true only for a plain object whose own keys are
 * exactly key, name, low, high, kind and group, where key, name, low and high
 * are non-empty strings, key is not an unsafe name, kind is one of
 * SCALE_KINDS and group is one of SCALE_GROUPS. This is a saved record's
 * check; a half-made draft is held to the looser one in draft.js.
 */
export function isScaleDefinition(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  if (keys.length !== DEFINITION_KEYS.length) return false;
  if (!DEFINITION_KEYS.every((key) => Object.prototype.hasOwnProperty.call(value, key))) return false;
  if (![value.key, value.name, value.low, value.high].every(isNonEmptyString)) return false;
  if (UNSAFE_KEYS.includes(value.key)) return false;
  return SCALE_KINDS.includes(value.kind) && SCALE_GROUPS.includes(value.group);
}

/**
 * scaleDefinition(row) -> a new { key, name, low, high, kind, group } copied
 * from a table row (which also holds id and order). A version and a batch
 * snapshot keep this bare definition.
 */
export function scaleDefinition(row) {
  const { key, name, low, high, kind, group } = row;
  return { key, name, low, high, kind, group };
}

/**
 * mintScaleKey(id) -> 'scale-' + id (D-03b). A recipe's own scale key is
 * minted once at creation, survives renames and child versions, and never
 * equals a core key (hardness, scoopability, smoothness, sweetness, body,
 * oil) or an unsafe name, because the prefix is on every minted key. Phase 10
 * mints with freshId(). Throws a TypeError for anything but a non-empty
 * string.
 */
export function mintScaleKey(id) {
  if (!isNonEmptyString(id)) throw new TypeError('scale key id must be a non-empty string');
  return `scale-${id}`;
}
