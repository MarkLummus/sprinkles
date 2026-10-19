// RED-phase stub (plan 09-09, Task 3): exports with the final names and no
// behaviour, so the target tests load and fail on their assertions. Replaced by
// the implementation in the GREEN commit.
export const UNSAFE_KEYS = new Set();
export function isPlainObject() {}
export function isFiniteNumber() {}
export function isNonEmptyString() {}
export function validateLibraryRecord() {}
export function validateMachineRow() {}
export function validateStyleRow() {}
export function validateScaleRow() {}
export function validateProblemRow() {}
export const SEED_TABLES = {};
export function catalogConflicts() {
  return [];
}
export function mergeById() {
  return [];
}
export class CatalogConflictError extends Error {}
