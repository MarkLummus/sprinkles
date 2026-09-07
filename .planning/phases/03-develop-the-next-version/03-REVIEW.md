---
phase: 03-develop-the-next-version
reviewed: 2026-09-07T19:55:59Z
depth: standard
files_reviewed: 40
files_reviewed_list:
  - app/package-lock.json
  - app/package.json
  - app/src/data/olive-oil.js
  - app/src/data/olive-oil.test.js
  - app/src/domain/advisories.js
  - app/src/domain/advisories.test.js
  - app/src/domain/axes.test.js
  - app/src/domain/diff.js
  - app/src/domain/diff.test.js
  - app/src/domain/lineage.js
  - app/src/domain/lineage.test.js
  - app/src/domain/rows.js
  - app/src/domain/rows.test.js
  - app/src/domain/uses.js
  - app/src/domain/uses.test.js
  - app/src/store/db.js
  - app/src/store/transfer.js
  - app/src/store/transfer.test.js
  - app/src/store/versionLift.js
  - app/src/styles/app.css
  - app/src/styles/tokens.css
  - app/src/ui/Authored.jsx
  - app/src/ui/BatchMargin.jsx
  - app/src/ui/DerivedAdvisories.jsx
  - app/src/ui/DerivedAdvisories.test.jsx
  - app/src/ui/FormulationNote.jsx
  - app/src/ui/GraduatedRule.jsx
  - app/src/ui/GraduatedRule.test.jsx
  - app/src/ui/Headnote.jsx
  - app/src/ui/Headnote.test.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipeList.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/VersionStrip.jsx
  - app/src/ui/VersionStrip.test.jsx
  - app/tests/db-migration.test.js
findings:
  critical: 1
  warning: 2
  info: 1
  total: 4
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-09-07T19:55:59Z
**Depth:** standard
**Files Reviewed:** 40
**Status:** issues_found

## Summary

Reviewed the phase's domain modules (`advisories`, `diff`, `lineage`, `rows`, `uses`), the store's migration/transfer layer (`db.js`, `versionLift.js`, `transfer.js`), the seeded data fixture, and the UI layer (`Authored`, `BatchMargin`, `DerivedAdvisories`, `FormulationNote`, `GraduatedRule`, `Headnote`, `IngredientTable`, `Method`, `RecipeList`, `RecipePage`, `VersionStrip`), plus the two stylesheets and the lockfile/manifest.

The domain layer is careful and well-tested: 354 tests pass, the `activeRows`/`activeSteps` removal seam is applied consistently, `buildDiff`/`buildAdvisories`/`uses.js` never mutate their inputs, and the project's structural conventions hold under inspection — no module outside `db.js` imports `idb`, no domain module imports the store or DOM, and there is no `dangerouslySetInnerHTML` anywhere under `app/src`.

One real defect was found and confirmed by direct reproduction: `importStore`'s pre-validation lift step (`transfer.js` calling `liftVersionRecord`) crashes with an uncaught `TypeError` on a schemaVersion 1/2 file whose version record is missing (or has a non-array) `rows` — exactly the kind of malformed, hand-edited, or truncated file `validateStoreFile` exists to catch gracefully. The crash happens *before* validation runs, and the only caller (`RecipeList.jsx`'s `handleImportChange`) has no try/catch around the `importStore` call, so this surfaces to the user as an unhandled promise rejection rather than the module's own designed "collect every error, refuse the whole file" behavior. Two lower-severity issues (a silently-discarded invalid grams edit, and a defensive-check gap in `blockedSaveMessage`) and one minor styling convention lapse round out the findings.

## Critical Issues

### CR-01: `importStore` crashes on a malformed schemaVersion 1/2 file instead of returning a validation error

**File:** `app/src/store/transfer.js:347-354` (calling into `app/src/store/versionLift.js:63-92`)

**Issue:** `importStore` lifts every version record of a schemaVersion 1 or 2 file with `liftVersionRecord` *before* `validateStoreFile` runs (by design, per the file's own header comment: "so `validateStoreFile` always checks the current shape"). But `liftVersionRecord` reads `raw.rows.map(...)` unconditionally, with no `??` fallback — unlike every other field it lifts (`method`, `authored`, `parentVersionId`, etc., which are all defaulted with `??`). A version object that is missing `rows` (or has `rows: null`), which is exactly the kind of malformed/hand-edited/truncated file this whole module exists to catch, throws an uncaught `TypeError: Cannot read properties of undefined (reading 'map')` instead of being reported as a validation error.

This defeats the module's own stated guarantee ("a malformed file is refused with every error found, never half-applied", `transfer.js:3-5`) — the crash happens before that gate is even reached. Worse, the only production call site, `handleImportChange` in `app/src/ui/RecipeList.jsx:44-64`, wraps only the `JSON.parse` in a try/catch; the `await importStore(repository, parsed)` call below it is unguarded, so this exception becomes an unhandled promise rejection in the click handler rather than the friendly `importErrors` list the UI is built to show.

Confirmed by direct reproduction:
```
$ node -e "import('./src/store/transfer.js').then(async ({importStore}) => {
  const repo = { getAll: async()=>[], putAll: async()=>{}, getAllBatches: async()=>[], putAllBatches: async()=>{} };
  const parsed = { app:'sprinkles', schemaVersion:1, versions:[{ id:'v1', recipeName:'x', coefficientSetId:'c' }] };
  try { console.log(await importStore(repo, parsed)); } catch (e) { console.log('THREW:', e.message); }
})"
THREW: Cannot read properties of undefined (reading 'map')
```

**Fix:** Default `rows` the same way every other field in `liftVersionRecord` already is, and let `validateStoreFile`'s existing `!Array.isArray(version.rows) || version.rows.length === 0` check do its job:
```js
// app/src/store/versionLift.js
rows: (raw.rows ?? []).map((row) => ({ ...row, removed: row.removed ?? false })),
```
As a defense-in-depth backstop (since the same lift path also feeds `db.js`'s migration, where a stored record's shape is trusted more), consider also guarding `importStore`'s lift step itself so a thrown error from a per-item `isPlainObject(version) ? liftVersionRecord(version) : version` map still degrades to a validation error rather than propagating.

## Warnings

### WR-01: An unparseable grams edit is silently discarded at save with no feedback to the maker

**File:** `app/src/domain/lineage.js:150-162` (`blockedSaveMessage`) and `app/src/ui/RecipePage.jsx:711-719` (`buildPenFields`)

**Issue:** `blockedSaveMessage` only blocks a save when a row's draft grams field is `undefined` or `''` (line 158: `draftRow.grams === undefined || draftRow.grams === ''`). It does not check that the string actually parses as a number. If a maker types something non-numeric (e.g. a stray letter, or edits `"40"` into `"4o"` by mistake), the save proceeds unblocked. Then in `buildPenFields` (`RecipePage.jsx:711-719`):
```js
const parsed = Number(draftRow.grams);
return { ...row, grams: Number.isFinite(parsed) ? parsed : row.grams, ... };
```
the unparseable value is silently replaced with the row's *original* grams — the maker's edit is discarded with no error message, no visual indication, and no console warning. They believe they changed an amount; the save reports success; nothing changed. This is inconsistent with the project's own stated discipline elsewhere (e.g. `handleSaveBatch`'s as-made parsing, which is also silently-drop-on-parse-failure, but for a field that is optional and blank-by-default rather than a required ingredient amount central to the recipe's balance).

**Fix:** Either have `blockedSaveMessage` also reject a non-empty, non-numeric grams string (extending the existing `row.ingredientName} needs an amount, or remove the row` message, or a new one), or have `buildPenFields` flag/report when it falls back to the original value rather than silently substituting it.

### WR-02: `blockedSaveMessage` assumes every row has a matching draft entry with no defensive check

**File:** `app/src/domain/lineage.js:155-160`

**Issue:**
```js
for (const row of version.rows) {
  const draftRow = penFields.rows[row.id];
  if (draftRow.removed) continue;
  ...
```
If `penFields.rows` is ever missing an entry for one of `version.rows` (e.g. a future caller that doesn't seed the draft as exhaustively as `handleStartDeveloping` currently does, or a version whose `rows` array is mutated between draft-seed time and save time), `draftRow` is `undefined` and `draftRow.removed` throws a `TypeError` from inside a pure domain function, with no named error message — a much worse failure mode than the "needs an amount" message this function exists to produce. All current call sites happen to satisfy the invariant, but the function has no guard and no test exercises the missing-entry case.

**Fix:** Add a defensive check (`if (!draftRow) return \`${row.ingredientName} needs an amount, or remove the row\`;` or similar), or, if the invariant is meant to be enforced entirely by the caller, document that requirement explicitly in the docstring (currently the docstring describes the shape of `penFields.rows` but not what happens if an entry is absent).

## Info

### IN-01: New `letter-spacing: 0.04em` literals continue a pre-existing token gap

**File:** `app/src/styles/app.css:20, 142, 418, 448` (new in this phase's diff) and elsewhere

**Issue:** The project convention (`.claude/CLAUDE.md`) states "every visual value (colour, face, size, spacing, rule weight) reads through a CSS custom property defined in `app/src/styles/tokens.css`; no component or stylesheet carries a literal." `letter-spacing: 0.04em` appears as a bare literal five times in the pre-phase file and is joined by at least four more instances added in this phase's diff (`.running-head`, `.headnote__version-field span`, and others), still with no `--letter-spacing-caps`-style token in `tokens.css`. This is a pre-existing gap this phase's code perpetuates rather than introduces; flagged for visibility rather than as a regression.

**Fix:** When convenient, introduce a `--letter-spacing-caps: 0.04em` token in `tokens.css` and replace all nine literal occurrences (five pre-existing, four new) at once, so the convention is exact going forward.

---

_Reviewed: 2026-09-07T19:55:59Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
