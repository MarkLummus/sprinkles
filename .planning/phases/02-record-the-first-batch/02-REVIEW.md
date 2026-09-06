---
phase: 02-record-the-first-batch
reviewed: 2026-09-06T00:00:00Z
depth: standard
files_reviewed: 22
files_reviewed_list:
  - app/src/data/batch-2026-08-02.js
  - app/src/data/olive-oil.js
  - app/src/data/olive-oil.test.js
  - app/src/domain/axes.js
  - app/src/domain/axes.test.js
  - app/src/domain/batch.js
  - app/src/domain/batch.test.js
  - app/src/domain/composition.js
  - app/src/domain/composition.test.js
  - app/src/router.jsx
  - app/src/store/db.js
  - app/src/store/repository.js
  - app/src/store/seed.js
  - app/src/store/seed.test.js
  - app/src/store/transfer.js
  - app/src/store/transfer.test.js
  - app/src/styles/app.css
  - app/src/styles/tokens.css
  - app/src/ui/AxisMark.jsx
  - app/src/ui/BatchMargin.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/RecipePage.jsx
findings:
  critical: 2
  warning: 2
  info: 2
  total: 6
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-06T00:00:00Z
**Depth:** standard
**Files Reviewed:** 22
**Status:** issues_found

## Summary

The domain layer (`domain/batch.js`, `domain/axes.js`, `domain/composition.js`) is careful and well-tested against the presence-vs-truthiness discipline the phase set out to build (blank vs. zero, plan-never-leaks, snapshot immutability). Its unit tests are thorough and pass strings of numeric fixtures exactly matching the invariants documented in the code comments.

The defect is at the seam between that domain layer and the new UI code in `IngredientTable.jsx`/`RecipePage.jsx`: the as-made draft is stored and passed around as raw strings (exactly as the code comments say it should be, to preserve typed precision until save), but `IngredientTable` feeds that raw-string draft directly into `asMadeTotals`/`formatGrams`, which assume numeric input. This is a real, easily reproduced crash in the batch-recording feature this phase delivers — see CR-01. It is compounded by a second gap (CR-02): the as-made input is unconstrained free text with no validation before it is coerced with `Number()` at save time, so garbage input becomes a silently-persisted `NaN` in a record that IndexedDB will happily store and no export/import path guards against until an import attempt on a different machine refuses the file.

Neither of the two domain-test suites (`batch.test.js`, `composition.test.js`) ever exercises `asMadeTotals`/`formatGrams` with the string-typed values the live recording UI actually produces — every fixture passes numbers — which is why this went uncaught. No component-level tests exist for the new UI files at all (no test renderer is even installed in `app/package.json`).

## Critical Issues

### CR-01: Recording a batch's as-made value crashes the ingredient table (string concatenation, not addition)

**File:** `app/src/ui/IngredientTable.jsx:78-82`
**Issue:**
```js
const asMadeSource = mode === 'recording' ? draft.asMade : openBatch ? openBatch.churn.asMade : {};
const { planTotal, asMadeTotal } = asMadeTotals(rows, asMadeSource);
const planTotalText = formatGrams(planTotal);
const asMadeTotalText = formatGrams(asMadeTotal);
```
While `mode === 'recording'`, `asMadeSource` is `draft.asMade` — and every value in `draft.asMade` is a **string**, exactly as designed in `RecipePage.jsx`'s `handleChangeAsMade` (`asMade[rowId] = rawValue` where `rawValue` is `event.target.value`) and in `handleStartAmending` (`asMade[rowId] = String(value)`). `domain/batch.js`'s `asMadeTotals` does:
```js
asMadeTotal += Object.prototype.hasOwnProperty.call(asMade, row.id) ? asMade[row.id] : row.grams;
```
`asMadeTotal` starts as the number `0`. As soon as one row has a string in `asMade`, `+=` performs **string concatenation**, not numeric addition (`0 + "383"` → `"0383"`), and every subsequent `+=` in the loop (numeric or not) concatenates onto that string. `asMadeTotal` ends up a string. `formatGrams` then calls `grams.toFixed(1)` on it — `String.prototype.toFixed` does not exist, so this throws `TypeError: grams.toFixed is not a function` during render.

This is not an edge case: the seeded 2 Aug 2026 batch (`data/batch-2026-08-02.js`) already has four as-made entries. Clicking **Amend** on that batch calls `handleStartAmending`, which populates `draft.asMade` with those four values as strings *before the maker types anything*, and the table crashes immediately on the next render. Recording a brand-new batch crashes as soon as the maker types a single character into any as-made cell.

**Fix:** Coerce the recording-mode source to numbers before summing (and decide how to treat unparsable/blank entries, see CR-02):
```js
const asMadeSource =
  mode === 'recording'
    ? Object.fromEntries(Object.entries(draft.asMade).map(([id, raw]) => [id, Number(raw)]))
    : openBatch
      ? openBatch.churn.asMade
      : {};
```

### CR-02: As-made cell accepts free text with no validation, so `NaN` can be silently persisted to the stored batch record

**File:** `app/src/ui/IngredientTable.jsx:44-52` (the input), `app/src/ui/RecipePage.jsx:229-232` (the save conversion)
**Issue:** `AsMadeCell`'s input is `type="text"` (not `type="number"` like every other numeric field in this phase — come-up minutes, draw temperature, overrun percent, tasting temperature, meltdown loss all use `type="number"`), so the browser applies no numeric constraint:
```jsx
<input type="text" inputMode="decimal" className="ink-field" value={draftValue} ... />
```
At save time, `RecipePage.jsx`'s `handleSaveBatch` converts every entry unconditionally:
```js
for (const [rowId, rawValue] of Object.entries(draft.asMade)) {
  asMade[rowId] = Number(rawValue);
}
```
If the maker types anything non-numeric ("abc", "1,234", or even a lone space, which `Number()` coerces to `0` unnoticed), the row either silently becomes `0` or becomes `NaN`. A `NaN` written this way passes straight into `createBatch`/`recordAmendment` and gets persisted via `repository.saveBatch` — there is no write-time gate (the only numeric validation in the codebase, `store/transfer.js`'s `validateStoreFile`, only runs on **import**, not on save). Once persisted, `readMeasured`/`asMadeFor` render it as the literal string `"NaN"` to the maker, `asMadeTotals` propagates it into the batch total (and, via CR-01's coercion fix, would poison the numeric total the moment one row is `NaN`), and a later export → import round trip of that record would be silently refused (`isFiniteNumber(NaN)` is `false` in `validateRow`), destroying the ability to move that batch between installs.

**Fix:** Either constrain the input the same way the other numeric churn fields are constrained (`type="number"`), or validate before conversion and refuse to save (or drop the offending entry) when `Number.isFinite(Number(rawValue))` is false, e.g.:
```js
for (const [rowId, rawValue] of Object.entries(draft.asMade)) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) { /* surface an error and stop the save */ }
  asMade[rowId] = parsed;
}
```

## Warnings

### WR-01: "Most recent batch" ordering is duplicated verbatim in two files

**File:** `app/src/ui/RecipePage.jsx:127-136` and `app/src/ui/BatchMargin.jsx:249-257`
**Issue:** Both files independently implement the same batch comparator (churn date descending, undated last):
```js
const sorted = [...batches].sort((a, b) => {
  const aDate = a.churn.churnDate;
  const bDate = b.churn.churnDate;
  if (aDate === bDate) return 0;
  if (aDate === null) return 1;
  if (bDate === null) return -1;
  return aDate < bDate ? 1 : -1;
});
```
`RecipePage.jsx` uses it to pick the default `openBatch`; `BatchMargin.jsx` uses it (independently) to render the batch list. `domain/batch.js` already has a `sortedTastings` helper for the analogous tastings-ordering problem, but no equivalent for batches, so this logic was reinvented twice instead of factored into the domain module. A future change to the tie-break rule (e.g., "undated first" instead of "undated last") would need to be made in both places and could silently drift.
**Fix:** Add a `sortedBatches(batches)` export to `domain/batch.js` alongside `sortedTastings`, and have both UI call sites use it.

### WR-02: `asMadeTotals` / `formatGrams` are exercised only with numeric fixtures; the string-valued path the UI actually uses is untested

**File:** `app/src/domain/batch.test.js:298-317`, `app/src/domain/composition.test.js:114-119`
**Issue:** Every `asMadeTotals` test in `batch.test.js` passes an `asMade` object whose values are already numbers (e.g. `{ 'row-01': 383, ... }`), and `formatGrams` is only ever tested with numeric literals. The actual production caller, `IngredientTable.jsx` in recording mode, passes `draft.asMade`, whose values are strings by design (see CR-01). No test in the suite reproduces that shape, which is exactly why CR-01 was not caught before merge.
**Fix:** Add a test that calls `asMadeTotals`/`formatGrams` (or an integration-level check on `IngredientTable`) with string-typed as-made values, asserting either a numeric result or an explicit, intentional rejection — whichever the fix for CR-01/CR-02 settles on.

## Info

### IN-01: The "as expected" tasting shortcut text is duplicated as a literal in two files

**File:** `app/src/ui/BatchMargin.jsx:6`, `app/src/ui/RecipePage.jsx:296`
**Issue:** `BatchMargin.jsx` defines `const AS_EXPECTED_WORDS = 'As expected, nothing to note';` for the button's label, but `RecipePage.jsx`'s `handleUseAsExpectedShortcut` independently hardcodes the identical string for the value actually written to the tasting. The constant is not exported, so the two copies can only be kept in sync by a human noticing both spots exist.
**Fix:** Export `AS_EXPECTED_WORDS` from `BatchMargin.jsx` (or move it to a shared module) and have `RecipePage.jsx` import it instead of restating the string.

### IN-02: `tokens.css`'s `--pen-blue` comment is now stale

**File:** `app/src/styles/tokens.css:8`
**Issue:** The token is defined with the comment `/* everything recorded — unused on screen this phase */`, but this very phase's diff adds `.ink-field`/`.ink-text` in `app.css`, both of which paint `--pen-blue` on screen (and the same file's own new comment at line 49 says "pen blue was defined above and unpainted **until now**" — i.e., acknowledging it is now painted). The original comment on line 8 was not updated and now contradicts the code beneath it.
**Fix:** Update or remove the "unused on screen this phase" clause on line 8.

---

_Reviewed: 2026-09-06T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
