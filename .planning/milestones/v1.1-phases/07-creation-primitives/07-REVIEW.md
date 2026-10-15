---
phase: 07-creation-primitives
reviewed: 2026-10-15T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - app/src/domain/newRecipe.js
  - app/src/domain/newRecipe.test.js
  - app/src/domain/versionRow.js
  - app/src/domain/versionRow.test.js
  - app/src/store/transfer.js
  - app/src/store/transfer.test.js
findings:
  critical: 0
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-10-15
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Incremental re-review of quick task 261015-8y9 (`git diff 747aa7a HEAD -- app/src`). I read the six files and probed the code with a throwaway Vitest file that I have since deleted. The full suite passes (91 files, 2913 tests).

**Resolved: WR-01, WR-03, WR-04. WR-02 is resolved for the three failures its text listed, and one related gap is left (new WR-01 below).**

- **WR-01 (`createRecipe` and ids or clock): resolved.** `recipeId`, `versionId` and `now` are checked first, each as a non-empty string. The second argument defaults to `{}`, so a missing argument gives `recipeId must be a non-empty string` instead of a bare destructure error. `null` for the second argument still gives the engine's destructure TypeError, which is still a caller bug and a TypeError. Equal `recipeId` and `versionId` are accepted on purpose: they key different object stores (`db.js` creates `recipes` and `versions` separately), and a test pins it.
- **WR-02 (`rowFromLibraryRecord` name and entry): resolved for its three listed failures.** A non-string name, a blank name (including the one inherited from the entry) and a missing, null, string or array `entry` now throw. I confirmed each by running it. One gap is left: the entry's `composition` is still not checked (new WR-01).
- **WR-03 (reserved row ids): resolved.** Both builders refuse the three names. `RESERVED_ROW_IDS` lives in the domain, so the domain does not import `store/`. `transfer.js` now exports `UNSAFE_KEYS`, and `transfer.test.js` pins the two sets equal and exercises each name at the builder and at the import check. Names that merely contain a reserved word are still accepted, matching the import check. `draft.js` keeps a third private copy, and its test pins the behaviour (not the set). That is acceptable.
- **WR-04 (`nextStepKey` against the import check): resolved.** `validateStep` now requires `Number.isSafeInteger(step.n)`, the same predicate `nextStepKey` uses. Of the two options the earlier review offered, this is the one that keeps the allocator strict. I imported `2.5` and `2**53` and both are refused with a message naming the path. The agreement test covers `2`, `0`, `2.5`, `2**53` and `'1'`. The fix did not break any seeded data or other test.

I found no new defects in the fix beyond the items below. The check order in `createRecipe` runs ids and clock, then name, then label, then rows, and the maker-facing messages are unchanged.

## Warnings

### WR-01: `rowFromLibraryRecord` still returns a row the import check refuses when the entry has no valid `composition`

**File:** `app/src/domain/versionRow.js:42-53`
**Issue:** The new guard requires `entry` to be a non-array object and the resolved name to be a non-blank string. `validateRow` (`store/transfer.js:113-121`) also requires `row.ingredient.composition` to be an object whose values are finite numbers. A probe shows `rowFromLibraryRecord({ id: 'x', entry: { name: 'Oil' } }, { id: 'r', grams: 1 })` returns a row with `ingredient: { name: 'Oil' }` and no throw. `{ composition: { fat: NaN } }` also returns, and `structuredClone` keeps the `NaN`. Both rows then fail at import with `rows[0].ingredient.composition: expected an object`, or a finite-number error, which is the failure the header says the throws exist to move to the cause. In practice library records pass `validateLibraryRecord` (which checks exactly this), so only a record that did not come through the library can trigger it, and the exposure is narrow. The earlier WR-02 named `composition` in its text, so the gap is left from that finding.
**Fix:** After the entry check, add:
```js
const composition = entry.composition;
if (composition === null || typeof composition !== 'object' || Array.isArray(composition)
    || !Object.values(composition).every(Number.isFinite)) {
  throw new TypeError('library record entry needs a composition of finite numbers');
}
```
Add refusal cases (missing `composition`, a `NaN` value) to the `versionRow.test.js` refusals block.

## Info

### IN-01: The WR-04 agreement test passes for step key `0` by coincidence, and negative keys are not covered

**File:** `app/src/store/transfer.test.js:1160-1167`
**Issue:** For an accepted key the test asserts `nextStepKey([{ n }])` equals `n + 1`. For `n = 0` the allocator returns `1` because its running maximum starts at 0, and `0 + 1` is also `1`, so the assertion holds by chance. The import check accepts any safe integer including negatives, for which `nextStepKey` returns `1` and not `n + 1`. A change in how the allocator treats keys of 0 or below could slip through, though the `stepKeys.js` header does say keys of 0 or below never yield a key below 1.
**Fix:** Use an explicit expected value per key, for example `it.each([[2, 3], [0, 1], [-3, 1]])`. Keep the rejected keys in a separate `it.each` that expects the `RangeError`.

---

_Reviewed: 2026-10-15_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
