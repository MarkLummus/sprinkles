---
phase: 07-creation-primitives
verified: 2026-10-15T13:00:00Z
status: passed
score: 4/4 must-haves verified
covered_files:
  - ".planning/phases/07-creation-primitives/07-01-PLAN.md"
  - ".planning/phases/07-creation-primitives/07-01-SUMMARY.md"
  - ".planning/phases/07-creation-primitives/07-02-PLAN.md"
  - ".planning/phases/07-creation-primitives/07-02-SUMMARY.md"
  - ".planning/phases/07-creation-primitives/07-03-PLAN.md"
  - ".planning/phases/07-creation-primitives/07-03-SUMMARY.md"
  - ".planning/quick/261015-8y9-fix-phase-7-review-warnings-wr-01-to-wr-/261015-8y9-SUMMARY.md"
  - "app/src/domain/advisories.js"
  - "app/src/domain/advisories.test.js"
  - "app/src/domain/newRecipe.js"
  - "app/src/domain/newRecipe.test.js"
  - "app/src/domain/penDraft.test.js"
  - "app/src/domain/stepKeys.js"
  - "app/src/domain/stepKeys.test.js"
  - "app/src/domain/versionRow.js"
  - "app/src/domain/versionRow.test.js"
  - "app/src/store/creation-roundtrip.test.js"
  - "app/src/store/transfer.js"
  - "app/src/store/transfer.test.js"
  - "app/src/ui/PrintSheetPages.test.jsx"
covered_digest: "v3:sha256:5191ad31d54e5f2d2872ad94d3430d3b47a3df063a309f04f2de06aa75ff2275"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: passed
  previous_score: 4/4
  gaps_closed: []
  gaps_remaining: []
  regressions: []
---

# Phase 7: Creation primitives Verification Report

**Phase Goal:** Code can build a new recipe from scratch without touching the store (a recipe with a root version, rows copied from library entries, step keys that are never reused), so v2's creation UI has its groundwork in place
**Verified:** 2026-10-15
**Status:** passed
**Re-verification:** Yes. The first report (2875 tests) went stale when quick task 261015-8y9 changed `newRecipe.js`, `versionRow.js`, `store/transfer.js` and their tests. Every truth was re-checked against the current code.

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Given a name and starting rows, one function returns a recipe and its root version (no parent, version names the recipe) that the import validation accepts and whose six figures compute, no store call | VERIFIED | `createRecipe` in `app/src/domain/newRecipe.js` returns `{recipe, version}` with `parentVersionId: null` and `recipeId` equal to the recipe id. My probe (scratchpad, node): recipe `{"id":"rec1","name":"Test","description":""}` (name trimmed), `parentVersionId` null, `version.recipeId` `rec1`, `buildFigures(version).length` 6. `app/src/store/creation-roundtrip.test.js` runs `validateStoreFile` on a store file wrapping the created pair; it passes in the full run. The only import in `newRecipe.js` is `./versionRow.js` (a sibling domain module), so no store call is possible. The new throws (recipeId, versionId, now, reserved row ids) fire only on bad input; the valid path is unchanged. |
| 2 | Step-key allocator never hands out a key a step holds or has held: steps 1-4 with 3 removed gives 5; removing the highest step does not free its key | VERIFIED | `stepKeys.js` is unchanged by the quick task. Probe: `[1,2,3(removed),4]` gives 5, `[1,2,3,4(removed)]` gives 5, `[]` gives 1, `[{n:2.5}]` throws `RangeError`. The D-05a invariant (removal flags a step, never drops it) keeps its behavioural test in `penDraft.test.js` and it passes. `validateStep` in `store/transfer.js` now requires `Number.isSafeInteger(step.n)`, the allocator's own predicate, so the import check and the allocator agree (WR-04), and `transfer.test.js` pins that agreement. |
| 3 | Building a row from a library entry embeds a `structuredClone` of the entry: changing the entry afterwards leaves the row unchanged; a row for an olive oil seed ingredient at the seeded amount gives the same figures as the seeded row | VERIFIED | `rowFromLibraryRecord` returns `ingredient: structuredClone(entry)`. Probe: the row built for `oliveOilVersion.rows[2]`'s ingredient, id, amount, step and name is JSON-identical to the seeded row (true); mutating the source entry's `composition.fat` afterwards leaves the row's value unchanged (true). `versionRow.test.js` pins both. The quick task's new guards (reserved id, missing or non-object entry, blank resolved name) sit before the return and do not touch the cloned result. |
| 4 | All three live under `app/src/domain/` with no framework, DOM or store import, tests run under node, existing suite green, no screen changed | VERIFIED | Imports in the three modules: `versionRow.js` none, `stepKeys.js` none, `newRecipe.js` only `import { RESERVED_ROW_IDS } from './versionRow.js'` (sibling domain module; no react, DOM, `idb` or `store/` path). `RESERVED_ROW_IDS` is duplicated in the domain on purpose and pinned to `transfer.js` `UNSAFE_KEYS` by a test in `transfer.test.js`, so the domain still imports no store module. No `@vitest-environment` docblock in any of the three test files (each pins that with a test). `git diff --name-only 7038ce9 HEAD -- app` lists 13 files: the 11 the plans name plus `store/transfer.js` and `store/transfer.test.js`. Nothing under `app/src/ui` changed except `PrintSheetPages.test.jsx` (a test), none under `data/`, `main.jsx` or `router.jsx`. No non-test file outside `domain/` and `store/transfer.js` changed. Full suite run by me: 91 files, 2913 tests, all passed (matches the expected 91/2913). |

**Score:** 4/4 truths verified (0 present, behaviour-unverified)

### Plan-level must-haves (re-checked after the fix)

| Plan truth | Status | Evidence |
|---|---|---|
| 07-01: defaults (`ingredientName ?? entry.name`, `step = 1`), one portion `{step, grams}` with no `removed` key, `removed:false`, 0 g accepted, TypeError for bad id/grams/step | VERIFIED | `versionRow.js` read directly; the quick task added refusals but kept all of these. |
| 07-02: RangeError outside safe-integer range; reads only the array; never mutates | VERIFIED | `stepKeys.js` read directly and unchanged. |
| 07-03: root version shape (no equipment/process/iceEd/targets/coefficientSetName, `coefficientSetId:''`, `method:[]`, `authored:{beforeYouStart:[]}`, schema 6, `structuredClone` of rows), refusals for blank name, blank label, no rows, repeated row id | VERIFIED | `newRecipe.js` read directly; all present. New: `recipeId`, `versionId`, `now` must be non-empty strings (probe: each throws `TypeError: <label> must be a non-empty string`); a missing second argument defaults to `{}` and gives the recipeId message; a reserved row id (`constructor`) throws `row id "constructor" is reserved`. The quick task's own Q-1: equal `recipeId` and `versionId` stay accepted (separate stores). |
| 07-03: `buildAdvisories` reads a root version | VERIFIED | Two early-return guards in `advisories.js` (`if (!equipment) return null;`, `if (!process) return null;`), unchanged by the quick task. |
| Quick task: the import check refuses what the builders refuse | VERIFIED | `UNSAFE_KEYS` exported from `transfer.js`; the builder refuses the same three names; `validateStep` requires a safe integer. Probe: `rowFromLibraryRecord(..., {id:'__proto__'})` throws; a record with no `entry` throws `library record needs an entry`; a blank `ingredientName` throws `row ingredientName must not be blank`. |

### Required Artifacts

| Artifact | Status | Details |
|---|---|---|
| `app/src/domain/versionRow.js` / `.test.js` | VERIFIED | Exports `rowFromLibraryRecord` and `RESERVED_ROW_IDS`; used by `newRecipe.js` and the round-trip test. No production UI caller, by the roadmap's design. |
| `app/src/domain/stepKeys.js` / `.test.js` | VERIFIED | Exports `nextStepKey`; used by `penDraft.test.js`, the round-trip test and `transfer.test.js`. |
| `app/src/domain/newRecipe.js` / `.test.js` | VERIFIED | Exports `createRecipe`; used by the round-trip test. |
| `app/src/domain/advisories.js` | VERIFIED | Two guards present. |
| `app/src/store/transfer.js` / `.test.js` | VERIFIED | `UNSAFE_KEYS` exported, `validateStep` safe-integer check; tests pass. |
| `app/src/store/creation-roundtrip.test.js`, `app/src/ui/PrintSheetPages.test.jsx`, `app/src/domain/penDraft.test.js` | VERIFIED | Additive tests present and passing. |

### Key Link Verification

| From | To | Status | Details |
|---|---|---|---|
| `creation-roundtrip.test.js` | `store/transfer.js` `validateStoreFile` | WIRED | Called on a store file wrapping the created recipe and version. |
| `creation-roundtrip.test.js` | `versionRow.js`, `stepKeys.js`, `newRecipe.js` | WIRED | Rows from `rowFromLibraryRecord` go into `createRecipe`; `nextStepKey(version.method)` is 1. |
| `newRecipe.js` | `versionRow.js` `RESERVED_ROW_IDS` | WIRED | Imported and used in the row-id loop. |
| `transfer.test.js` | `versionRow.js` `RESERVED_ROW_IDS`, `transfer.js` `UNSAFE_KEYS`, `stepKeys.js` | WIRED | Pins the two sets equal; checks `nextStepKey` against `validateStep`. |
| `penDraft.test.js` | `stepKeys.js` | WIRED | `nextStepKey(next.method)` after `togglePenStepRemoved`. |
| `versionRow.test.js` | `data/olive-oil.js` | WIRED | `toEqual(oliveOilVersion.rows[2])`. |

### Data-Flow Trace (Level 4)

Not applicable: pure functions with no rendered dynamic data. The data flow (library record to row to recipe to import check to six figures) is covered by the round-trip test and my probe.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full suite | `npm --prefix app test -- --run` | 91 files, 2913 tests passed | PASS |
| Seeded row equality, entry independence, step-key cases, root version shape, new refusals | node probe script (scratchpad) importing the three modules, `figures.js`, `olive-oil.js` | row equals seed true; independence true; keys 5 / 5 / 1; 6 figures; every new throw fires with the expected TypeError or RangeError | PASS |

### Probe Execution

Step 7c: SKIPPED. The phase declares no probes (no `probe-*.sh` in any PLAN or SUMMARY).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| MAKE-01 | 07-03 | Framework-free function creates a recipe with a root version (no parent) from a name and starting rows, without touching the store | SATISFIED | `createRecipe`; criterion 1 evidence, still true after the fix. |
| MAKE-02 | 07-02 | Step-key allocator, never reused, including after removal | SATISFIED | `nextStepKey`; criterion 2 evidence. |
| MAKE-03 | 07-01 | Row-from-ingredient builder embedding a `structuredClone` of coefficients and basis | SATISFIED | `rowFromLibraryRecord`; criterion 3 evidence. |

All three IDs appear in a PLAN's `requirements:` frontmatter and in REQUIREMENTS.md; no orphaned requirement is mapped to Phase 7.

### Anti-Patterns Found

None. No `TBD`, `FIXME`, `XXX`, `TODO` or `HACK` in `versionRow.js`, `newRecipe.js`, `stepKeys.js` or `advisories.js`. No stubs, no empty implementations.

### Code Review Findings (advisory, recorded open)

07-REVIEW.md (re-review after the fix) and 07-REVIEW-DISPOSITION.md: the first review's WR-01 to WR-04 are fixed and I confirmed each in code and by probe. The two findings still open break no requirement or criterion:

- Re-review WR-01: `rowFromLibraryRecord` does not check that the entry has a valid `composition`, so a hand-made record such as `{ name: 'Oil' }` yields a row the import check refuses. Real library records pass `validateLibraryRecord`. MAKE-03 and criterion 3 hold for every real library record. Non-blocking.
- Re-review IN-01: the step-key agreement test passes for key `0` by coincidence and skips negative keys. A test-quality note only.
- First-review IN-01 to IN-03 stay open as recorded.

### Human Verification Required

None. Phase 7 delivers no UI; every criterion is checked by a node-environment test or a direct probe.

### Gaps Summary

No gaps. The three framework-free functions exist, are substantive, and compose end to end. The quick task's hardening kept every earlier truth intact, left the domain free of framework, DOM and store imports (the only new domain import is `newRecipe.js` from `versionRow.js`), and changed nothing under `app/src` beyond the files the plans list plus `store/transfer.js` and its test. The suite passes at 91 files and 2913 tests.

---

_Verified: 2026-10-15_
_Verifier: Claude (gsd-verifier)_
