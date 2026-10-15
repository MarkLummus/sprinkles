---
phase: 07-creation-primitives
verified: 2026-10-15T14:00:00Z
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
  - ".planning/quick/261015-b90-phase-7-review-cleanup-re-review-wr-01-a/261015-b90-SUMMARY.md"
  - "app/src/domain/advisories.js"
  - "app/src/domain/advisories.test.js"
  - "app/src/domain/lineage.js"
  - "app/src/domain/lineage.test.js"
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
covered_digest: "v3:sha256:843980159386928f3d91ccdda5c88cc0e75051074dd67f65aa5e789e15514e48"
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
**Re-verification:** Yes. The previous report (2913 tests, commit 6626d13) went stale when quick task 261015-b90 changed nine files under `app/src` (`git diff 6626d13 HEAD -- app/src`: 124 insertions, 24 deletions). Every truth was re-checked against the current code.

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Given a name and starting rows, one function returns a recipe and its root version (no parent, version names the recipe) that the import validation accepts and whose six figures compute, no store call | VERIFIED | `createRecipe` in `app/src/domain/newRecipe.js` returns `{recipe, version}` with `parentVersionId: null` and `recipeId` equal to the recipe id. My probe (scratchpad, node): `createRecipe({name:' Test ', versionLabel:' v1 ', rows}, ...)` gives recipe `{"id":"rec1","name":"Test","description":""}`, `parentVersionId` null, `version.recipeId` `rec1`, `versionLabel` `"v1"` (now stored trimmed, the b90 change R-5), `buildFigures(version).length` 6. `app/src/store/creation-roundtrip.test.js` runs `validateStoreFile` on a store file wrapping the created pair and now also covers a child of the created root (b90 R-3); it passes in the full run. The only import in `newRecipe.js` is `./versionRow.js` (a sibling domain module), so no store call is possible. The b90 edit to this file is one line (`versionLabel: versionLabel.trim()`) plus a comment. |
| 2 | Step-key allocator never hands out a key a step holds or has held: steps 1-4 with 3 removed gives 5; removing the highest step does not free its key | VERIFIED | `stepKeys.js` is unchanged by b90 (`git diff 6626d13 HEAD` lists only `stepKeys.test.js`). Probe: `[1,2,3(removed),4]` gives 5, `[1,2,3,4(removed)]` gives 5, `[]` gives 1, `[{n:2.5}]` throws `RangeError: step key 2.5 is not a safe integer`. The D-05a invariant keeps its behavioural test in `penDraft.test.js` and passes. b90 R-2 replaced the coincidental agreement test in `transfer.test.js` with explicit expectations (2 gives 3, 0 gives 1, -3 gives 1; 2.5, 2**53 and '1' throw `RangeError`) and a pin that `validateStep` refuses the same refused keys; both pass. |
| 3 | Building a row from a library entry embeds a `structuredClone` of the entry: changing the entry afterwards leaves the row unchanged; a row for an olive oil seed ingredient at the seeded amount gives the same figures as the seeded row | VERIFIED | `rowFromLibraryRecord` returns `ingredient: structuredClone(entry)`. Probe: the row built for `oliveOilVersion.rows[2]`'s ingredient, id, portion grams and step, and name is JSON-identical to the seeded row (true); mutating the source entry's `composition.fat` afterwards leaves the row's value unchanged (true). `versionRow.test.js` pins both. The b90 change adds one guard before the name check: composition must be a non-null, non-array object of finite numbers (`{}` passes, as in the import check). Probe: composition `null`, `[]`, `{fat:NaN}`, `{fat:'1'}` and a missing composition each throw `TypeError: library record entry needs a composition of finite numbers`; `{}` does not. This closes re-review WR-01 and does not touch the cloned result. |
| 4 | All three live under `app/src/domain/` with no framework, DOM or store import, tests run under node, existing suite green, no screen changed | VERIFIED | Imports: `versionRow.js` none, `stepKeys.js` none, `newRecipe.js` only `import { RESERVED_ROW_IDS } from './versionRow.js'`. The purity-guard regexes in the three test files now accept either quote style (b90 R-4); the executor's mutation probe showed they now fail on a double-quoted `node:fs` import, and the three guards pass in the full run. No `@vitest-environment` docblock in the three test files. `git diff --name-only 7038ce9 HEAD -- app` lists 15 files: the 11 the plans name, `store/transfer.js` and `store/transfer.test.js` (quick 8y9), and `domain/lineage.js` and `domain/lineage.test.js` (b90). Nothing under `app/src/ui` changed except `PrintSheetPages.test.jsx` (a test); nothing under `data/`, `main.jsx` or `router.jsx`. `lineage.js` is a domain module (imports only `./batch.js` and `./rows.js`) and `createChildVersion`'s output differs only in that a child of a parent with no own `targets` (or equipment, process, iceEd, coefficientSetName) no longer owns that key set to `undefined`. I grepped `app/src` for `in` or `hasOwn` checks on those five keys: the only hit is `figures.js:155`, which tests the `targets` map's own keys, not the version's. No reader can see the difference, so no screen changes. Full suite run by me: 91 files, 2932 tests, all passed (matches the expected 91/2932). |

**Score:** 4/4 truths verified (0 present, behaviour-unverified)

### Plan-level must-haves (re-checked after b90)

| Plan truth | Status | Evidence |
|---|---|---|
| 07-01: defaults (`ingredientName ?? entry.name`, `step = 1`), one portion `{step, grams}` with no `removed` key, `removed:false`, 0 g accepted, TypeError for bad id/grams/step | VERIFIED | `versionRow.js` read directly (diff reviewed); b90 only inserted the composition guard. |
| 07-02: RangeError outside safe-integer range; reads only the array; never mutates | VERIFIED | `stepKeys.js` read directly and unchanged. |
| 07-03: root version shape (no equipment/process/iceEd/targets/coefficientSetName, `coefficientSetId:''`, `method:[]`, `authored:{beforeYouStart:[]}`, schema 6, `structuredClone` of rows), refusals for blank name, blank label, no rows, repeated row id, bad recipeId/versionId/now, reserved row id | VERIFIED | `newRecipe.js` read directly; all present. Label is stored trimmed. |
| 07-03: `buildAdvisories` reads a root version | VERIFIED | Two early-return guards in `advisories.js`, unchanged by b90. |
| Quick 8y9: the import check refuses what the builders refuse | VERIFIED | `UNSAFE_KEYS` exported from `transfer.js`, `validateStep` requires a safe integer, both unchanged by b90. b90 extends the agreement to composition: `transfer.test.js` pins builder and import check to the same verdict for nine compositions, each with an explicit expected result; it passes. |
| Quick b90: a child of a created root carries no own key holding `undefined` | VERIFIED | Probe: `createChildVersion(createdRoot, ...)` has none of `coefficientSetName`, `targets`, `equipment`, `process`, `iceEd` as an own key; `createChildVersion(oliveOilVersion, ...)` has all five, each equal by reference to the parent's. `lineage.test.js` pins both (19 added tests across the task, suite 2913 to 2932). |

### Required Artifacts

| Artifact | Status | Details |
|---|---|---|
| `app/src/domain/versionRow.js` / `.test.js` | VERIFIED | Exports `rowFromLibraryRecord` and `RESERVED_ROW_IDS`; used by `newRecipe.js` and the round-trip test. No production UI caller, by the roadmap's design. |
| `app/src/domain/stepKeys.js` / `.test.js` | VERIFIED | Exports `nextStepKey`; used by `penDraft.test.js`, the round-trip test and `transfer.test.js`. |
| `app/src/domain/newRecipe.js` / `.test.js` | VERIFIED | Exports `createRecipe`; used by the round-trip test. |
| `app/src/domain/lineage.js` / `.test.js` | VERIFIED | `createChildVersion` is called by the pen save path (`penDraft.js`) as before; its seeded-parent output is unchanged. |
| `app/src/domain/advisories.js` | VERIFIED | Two guards present. |
| `app/src/store/transfer.js` / `.test.js` | VERIFIED | Source unchanged by b90; test additions pass. |
| `app/src/store/creation-roundtrip.test.js`, `app/src/ui/PrintSheetPages.test.jsx`, `app/src/domain/penDraft.test.js` | VERIFIED | Additive tests present and passing. |

### Key Link Verification

| From | To | Status | Details |
|---|---|---|---|
| `creation-roundtrip.test.js` | `store/transfer.js` `validateStoreFile` | WIRED | Called on a store file wrapping the created recipe, its root and a child. |
| `creation-roundtrip.test.js` | `versionRow.js`, `stepKeys.js`, `newRecipe.js`, `lineage.js` | WIRED | Rows from `rowFromLibraryRecord` go into `createRecipe`; the root goes into `createChildVersion`; `nextStepKey(version.method)` is 1. |
| `newRecipe.js` | `versionRow.js` `RESERVED_ROW_IDS` | WIRED | Imported and used in the row-id loop. |
| `transfer.test.js` | `versionRow.js` `RESERVED_ROW_IDS`, `transfer.js` `UNSAFE_KEYS`, `stepKeys.js`, `draft.js` reserved names | WIRED | Pins the sets equal; checks `nextStepKey` and `rowFromLibraryRecord` against the import check. |
| `penDraft.test.js` | `stepKeys.js` | WIRED | `nextStepKey(next.method)` after `togglePenStepRemoved`. |
| `versionRow.test.js` | `data/olive-oil.js` | WIRED | `toEqual(oliveOilVersion.rows[2])`. |

### Data-Flow Trace (Level 4)

Not applicable: pure functions with no rendered dynamic data. The data flow (library record to row to recipe to import check to six figures to child version) is covered by the round-trip test and my probe.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full suite | `npm --prefix app test -- --run` | 91 files, 2932 tests passed | PASS |
| Seeded row equality, entry independence, step-key cases, root version shape, trimmed label, composition refusals, child own-key behaviour | node probe script (scratchpad) importing the four modules, `figures.js`, `olive-oil.js` | row equals seed true; independence true; keys 5 / 5 / 1 and RangeError for 2.5; 6 figures; label `"v1"`; five composition refusals throw, `{}` accepted; created-root child has no optional own keys; olive-oil child has all five by reference | PASS |

### Probe Execution

Step 7c: SKIPPED. The phase declares no probes (no `probe-*.sh` in any PLAN or SUMMARY).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| MAKE-01 | 07-03 | Framework-free function creates a recipe with a root version (no parent) from a name and starting rows, without touching the store | SATISFIED | `createRecipe`; criterion 1 evidence, still true after b90. |
| MAKE-02 | 07-02 | Step-key allocator, never reused, including after removal | SATISFIED | `nextStepKey`; criterion 2 evidence. |
| MAKE-03 | 07-01 | Row-from-ingredient builder embedding a `structuredClone` of coefficients and basis | SATISFIED | `rowFromLibraryRecord`; criterion 3 evidence. |

All three IDs appear in a PLAN's `requirements:` frontmatter and in REQUIREMENTS.md; no orphaned requirement is mapped to Phase 7.

### Anti-Patterns Found

None. No `TBD`, `FIXME`, `XXX`, `TODO` or `HACK` in `versionRow.js`, `newRecipe.js`, `stepKeys.js`, `advisories.js` or `lineage.js`. No stubs, no empty implementations.

### Code Review Findings

07-REVIEW-DISPOSITION.md marks every row fixed: first review WR-01 to WR-04 (quick 8y9) and IN-01 to IN-03, and re-review WR-01 and IN-01 (quick b90). I confirmed each b90 fix in code and by probe or test: IN-01 (lineage own keys), re-review WR-01 (composition guard), IN-03 (trimmed label), re-review IN-01 (explicit step-key expectations), IN-02 (both quote styles in the purity guards). None stays open. One note, not a finding: the pen's save path still stores a child's label as typed (recorded in the b90 SUMMARY R-5); uniqueness is unaffected because `versionLineUnique` trims both sides.

### Human Verification Required

None. Phase 7 delivers no UI; every criterion is checked by a node-environment test or a direct probe.

### Gaps Summary

No gaps. The three framework-free functions exist, are substantive, and compose end to end. The b90 cleanup tightened the row builder, the created label and the child-of-root shape without disturbing any earlier truth, left the domain free of framework, DOM and store imports, and changed no screen. The suite passes at 91 files and 2932 tests.

---

_Verified: 2026-10-15_
_Verifier: Claude (gsd-verifier)_
