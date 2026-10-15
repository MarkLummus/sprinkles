---
phase: 07-creation-primitives
reviewed: 2026-10-15T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - app/src/domain/advisories.js
  - app/src/domain/advisories.test.js
  - app/src/domain/newRecipe.js
  - app/src/domain/newRecipe.test.js
  - app/src/domain/penDraft.test.js
  - app/src/domain/stepKeys.js
  - app/src/domain/stepKeys.test.js
  - app/src/domain/versionRow.js
  - app/src/domain/versionRow.test.js
  - app/src/store/creation-roundtrip.test.js
  - app/src/ui/PrintSheetPages.test.jsx
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-10-15
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the three new domain constructors (`createRecipe`, `rowFromLibraryRecord`, `nextStepKey`), the two null guards added to `advisories.js`, and the tests that pin them. All 222 tests in the seven test files pass, and the guards in `advisories.js` are correct. The module headers state the reason for the throws: a constructor that returns a bad record fails only at import, far from the cause. The constructors do not fully deliver that. Each lets through some input that `validateStoreFile` later rejects, or, for `nextStepKey`, rejects input the validator accepts. I confirmed the four warnings below by running the code (probe script in the session scratchpad).

## Warnings

### WR-01: `createRecipe` validates the maker's inputs but not the caller's ids or clock

**File:** `app/src/domain/newRecipe.js:27`
**Issue:** Four refusals cover name, label, rows and duplicate row ids. `recipeId`, `versionId` and `now` are never checked. Calling `createRecipe({ name: 'x', versionLabel: 'y', rows }, {})` returns `recipe.id === undefined`, `version.id === undefined` and `version.createdAt === undefined`. No exception is thrown. This is the failure the file header says the throws exist to prevent. The second argument is destructured, so passing `undefined` for it throws a bare `TypeError` ("Cannot destructure"). A caller that forgets the id factory gets a half-built record that is rejected at import, or worse, written to the store with an `undefined` key. `recipeId === versionId` is also accepted.
**Fix:**
```js
for (const [label, value] of [['recipeId', recipeId], ['versionId', versionId], ['now', now]]) {
  if (typeof value !== 'string' || value === '') {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}
```
Add one refusal test per field.

### WR-02: `rowFromLibraryRecord` passes `ingredientName` and `record.entry` through unvalidated, and the import check requires both

**File:** `app/src/domain/versionRow.js:21-37`
**Issue:** The function checks `id`, `grams` and `step`, but `validateRow` (`store/transfer.js:96-108`) also requires `ingredientName` to be a string and `ingredient.composition` to be an object. The `??` default only substitutes for `null` and `undefined`:
- `ingredientName: 5` returns a row with a numeric name. The import check reports `rows[0].ingredientName: expected a string`.
- `ingredientName: ''` or `'   '` returns a row with a blank name. It passes the import check, but the Sheet and the advisories then print a nameless ingredient.
- A record with no `entry` and an explicit `ingredientName` returns `ingredient: undefined`, because `structuredClone(undefined)` returns `undefined`. The row fails at import, or crashes `row.ingredient.category` in `advisories.js` first.

**Fix:** After the existing checks:
```js
const name = ingredientName ?? record.entry?.name;
if (typeof name !== 'string' || name.trim() === '') {
  throw new TypeError('row ingredientName must be a non-empty string');
}
if (record.entry === null || typeof record.entry !== 'object') {
  throw new TypeError('library record needs an entry');
}
```
Add refusal cases for each to `versionRow.test.js`.

### WR-03: Reserved row ids are accepted by the builders and refused by the import check

**File:** `app/src/domain/versionRow.js:22`, `app/src/domain/newRecipe.js:38`
**Issue:** `validateRow` (`store/transfer.js:93`) rejects the ids `__proto__`, `constructor` and `prototype`, because row ids are used as object keys in the as-made map and the pen drafts. `rowFromLibraryRecord` accepts `id: '__proto__'` (confirmed), and `createRecipe` builds a version around it. Exporting such a store then re-importing it fails with `prototype-mutating id is not allowed`. The id is probably a UUID in practice, but these are the same constructors whose job is to refuse input the import check would refuse.
**Fix:** Share the reserved set with `transfer.js`, or duplicate the three-name set under the domain (the domain may not import `store/`). Throw in `rowFromLibraryRecord` when `id` is in it. Add a refusal row to the `it.each(['', undefined, null, 7])` list.

### WR-04: `nextStepKey` throws on step keys that the import check accepts

**File:** `app/src/domain/stepKeys.js:27`
**Issue:** `validateStep` (`store/transfer.js:154`) accepts any finite `n`, so `2.5` passes. I imported a method with a step at `n: 2.5` and `validateStoreFile` returned no errors. `nextStepKey` then throws `RangeError: step key 2.5 is not a safe integer`. An imported store can therefore hold a version in which adding a step always throws. The header says the throws are reversible (RESEARCH A1), but nothing tightens the validator, and the failure falls on whichever UI calls the allocator.
**Fix:** Either tighten `validateStep` to `Number.isSafeInteger(step.n)` so the two modules agree, or have the allocator skip non-integer keys the way it would skip a missing one. If the validator changes, add a transfer test for `n: 2.5`.

## Info

### IN-01: Child of a created root version carries own keys with `undefined` values

**File:** `app/src/store/creation-roundtrip.test.js:95-118`
**Issue:** `createChildVersion` (`domain/lineage.js:135-138`) copies `targets`, `equipment`, `process`, `iceEd` and `coefficientSetName` unconditionally from the parent. A child of the root version therefore has own keys set to `undefined`, while `newRecipe.test.js` pins the root as having none of those keys. The test only asserts that the import check passes, so it does not see this. IndexedDB stores the `undefined` values, while a JSON export drops them, so a store export and import changes the child's key set. This is not a correctness failure today.
**Fix:** In `createChildVersion`, copy a key only when the parent owns it. Alternatively, add `expect(Object.hasOwn(child, 'equipment'))` to the child test to pin whichever behaviour is intended.

### IN-02: The purity guards only see single-quoted imports, and are copy-pasted into three files

**File:** `app/src/domain/newRecipe.test.js:132-139`, `stepKeys.test.js:75-84`, `versionRow.test.js:113-122`
**Issue:** Each guard extracts specifiers with `/from\s+'([^']+)'/`. A double-quoted `import { openDB } from "idb"` is not matched, so the "imports only sibling domain modules" claim is not checked for it. The same 10-line block is repeated three times.
**Fix:** Use `/from\s+(['"])(.+?)\1/`, or move the guard into a shared test helper, for example `assertPureDomainModule(fileUrl)`.

### IN-03: Label is validated on its trimmed value but stored untrimmed

**File:** `app/src/domain/newRecipe.js:31`, `:58`
**Issue:** `'   first try  '` passes the blank check and is stored as written. The test `keeps the version label as the maker wrote it` pins this. `versionLineUnique` trims on comparison, but `versionIdentity` prints the raw label, so the padding reaches the screen. If the pen's save path already stores untrimmed labels, this matches and is only a note.
**Fix:** Either trim on store (`versionLabel: versionLabel.trim()`), or keep the current behaviour and note it in the header.

---

_Reviewed: 2026-10-15_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
