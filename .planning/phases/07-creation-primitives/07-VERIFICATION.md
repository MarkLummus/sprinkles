---
phase: 07-creation-primitives
verified: 2026-10-15T12:00:00Z
status: passed
score: 4/4 must-haves verified
covered_files:
  - ".planning/phases/07-creation-primitives/07-01-PLAN.md"
  - ".planning/phases/07-creation-primitives/07-01-SUMMARY.md"
  - ".planning/phases/07-creation-primitives/07-02-PLAN.md"
  - ".planning/phases/07-creation-primitives/07-02-SUMMARY.md"
  - ".planning/phases/07-creation-primitives/07-03-PLAN.md"
  - ".planning/phases/07-creation-primitives/07-03-SUMMARY.md"
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
  - "app/src/ui/PrintSheetPages.test.jsx"
covered_digest: "v3:sha256:d628cd4debabd40245ec35f0fdc94ed18e2270679011eb637b1235d101d85e23"
behavior_unverified: 0
overrides_applied: 0
---

# Phase 7: Creation primitives Verification Report

**Phase Goal:** Code can build a new recipe from scratch without touching the store (a recipe with a root version, rows copied from library entries, step keys that are never reused), so v2's creation UI has its groundwork in place.
**Verified:** 2026-10-15
**Status:** passed
**Re-verification:** No, initial verification

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Given a name and starting rows, one function returns a recipe and its root version (no parent, version names the recipe) that the import validation accepts and whose six figures compute, no store call | VERIFIED | `createRecipe` in `app/src/domain/newRecipe.js` returns `{recipe, version}` with `parentVersionId: null`, `recipeId` equal to the recipe id. My own node probe: recipe `{id:'rec1', name:'Test', description:''}`, `parentVersionId` null, `buildFigures(version).length` 6. `app/src/store/creation-roundtrip.test.js` runs `validateStoreFile` on a store file wrapping the created recipe and version and expects `{ok:true, errors:[]}`; it passes in the full run. The module has no imports at all (no store call possible). |
| 2 | Step-key allocator never hands out a key a step holds or has held: steps 1-4 with 3 removed gives 5; removing the highest step does not free its key | VERIFIED | `nextStepKey` in `app/src/domain/stepKeys.js` scans every step (removed included) and returns the highest `n` + 1. Probe: `[1,2,3(removed),4]` gives 5, `[1,2,3,4(removed)]` gives 5, `[]` gives 1. `stepKeys.test.js` has named tests for each case. The D-05a invariant (a state/ordering invariant) has a passing behavioural test in `penDraft.test.js`: `togglePenStepRemoved` on the highest step keeps it in `method`, flagged, and `nextStepKey` stays `highest + 1`, also after restore. |
| 3 | Building a row from a library entry embeds a `structuredClone` of the entry: changing the entry afterwards leaves the row unchanged; a row for an olive oil seed ingredient at the seeded amount gives the same figures as the seeded row | VERIFIED | `rowFromLibraryRecord` in `app/src/domain/versionRow.js` returns `ingredient: structuredClone(record.entry)`. Probe: the built row for `{id:'row-03', grams:40, step:8, ingredientName:'Graza Drizzle'}` is JSON-identical to `oliveOilVersion.rows[2]`; after mutating the entry's `composition.fat`, the row's six figures are unchanged. `versionRow.test.js` pins both (toEqual on the seeded row, figures alone and swapped into the version, independence from the entry). |
| 4 | All three live under `app/src/domain/` with no framework, DOM or store import, tests run under node, existing suite stays green, no screen changed | VERIFIED | `grep` finds no `import` statement in `versionRow.js`, `stepKeys.js` or `newRecipe.js`. None of the new test files carries a `@vitest-environment` docblock (each pins that with a test). `git diff 7038ce9 HEAD -- app ':!*.test.*'` lists only `advisories.js` (+6), `newRecipe.js`, `stepKeys.js`, `versionRow.js`: nothing under `app/src/ui`, `store` or `data` outside test files. Full suite run by me: 91 files, 2875 tests, all passed (matches the expected 87/2794 baseline plus 4 files and 81 tests). |

**Score:** 4/4 truths verified (0 present, behaviour-unverified)

### Plan-level must-haves spot-checked

| Plan truth | Status | Evidence |
|---|---|---|
| 07-01: defaults (`ingredientName ?? entry.name`, `step = 1`), one portion `{step, grams}` with no `removed` key, `removed:false`, 0 g accepted, TypeError for bad id/grams/step | VERIFIED | `versionRow.js` lines 21-37 read directly; matches. |
| 07-02: RangeError outside safe-integer range; reads only the array; never mutates | VERIFIED | `stepKeys.js` read directly; test cases for 2**53, 2.5, NaN, Infinity, '3', undefined, `MAX_SAFE_INTEGER`. |
| 07-03: root version has no equipment/process/iceEd/targets/coefficientSetName, `coefficientSetId:''`, `method:[]`, `authored:{beforeYouStart:[]}`, schema 6, structuredClone of rows, four TypeError refusals | VERIFIED | `newRecipe.js` read directly; matches. |
| 07-03: `buildAdvisories` reads a root version (guards in `advisories.js`) | VERIFIED | Two early returns, `if (!equipment) return null;` and `if (!process) return null;`, are the whole change (6 lines added, none removed). `advisories.test.js` and the round-trip test pass. |
| 07-03: child, diff, batch and Sheet code read a root version; an all-zero recipe passes import | VERIFIED (by passing tests) | `creation-roundtrip.test.js` and `PrintSheetPages.test.jsx` additions pass in the full run. |

### Required Artifacts

| Artifact | Status | Details |
|---|---|---|
| `app/src/domain/versionRow.js` / `.test.js` | VERIFIED | Exists, substantive, exports `rowFromLibraryRecord`, used by `creation-roundtrip.test.js` and its own suite (no production caller by design). |
| `app/src/domain/stepKeys.js` / `.test.js` | VERIFIED | Exports `nextStepKey`; used by `penDraft.test.js` and the round-trip test. |
| `app/src/domain/newRecipe.js` / `.test.js` | VERIFIED | Exports `createRecipe`; used by the round-trip test. |
| `app/src/domain/advisories.js` | VERIFIED | Two guards present. |
| `app/src/store/creation-roundtrip.test.js`, `app/src/ui/PrintSheetPages.test.jsx`, `app/src/domain/penDraft.test.js` | VERIFIED | Additive test files present and passing. |

Wiring note: no production code calls the three functions. That is the roadmap's intent ("no creation UI calls them yet"), so ORPHANED does not apply here; the integration is proven by tests that compose them.

### Key Link Verification

| From | To | Status | Details |
|---|---|---|---|
| `creation-roundtrip.test.js` | `store/transfer.js` `validateStoreFile` | WIRED | Called on a store file wrapping the created recipe and version. |
| `creation-roundtrip.test.js` | `versionRow.js`, `stepKeys.js`, `newRecipe.js` | WIRED | Rows from `rowFromLibraryRecord` go into `createRecipe`; `nextStepKey(version.method)` is 1. |
| `penDraft.test.js` | `stepKeys.js` | WIRED | `nextStepKey(next.method)` read after `togglePenStepRemoved`. |
| `versionRow.test.js` | `data/olive-oil.js` | WIRED | `toEqual(oliveOilVersion.rows[2])`. |

### Data-Flow Trace (Level 4)

Not applicable: pure functions, no rendered dynamic data. The round-trip is covered by the Key Links above.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full suite | `npm --prefix app test -- --run` | 91 files, 2875 tests passed | PASS |
| Seeded row equality, entry independence, step-key cases, root version shape | node probe script (scratchpad) importing the three modules, `figures.js`, `library.js`, `olive-oil.js` | row equals seed true; figures unchanged after entry mutation; 5 / 5 / 1; recipe and root version as specified; 6 figures | PASS |

### Probe Execution

Step 7c: SKIPPED. The phase declares no probes (no `probe-*.sh` in the PLANs or SUMMARYs).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| MAKE-01 | 07-03 | Framework-free function creates a recipe with a root version (no parent) from a name and starting rows, without touching the store | SATISFIED | `createRecipe`; criterion 1 evidence. |
| MAKE-02 | 07-02 | Step-key allocator, never reused, including after removal | SATISFIED | `nextStepKey`; criterion 2 evidence. |
| MAKE-03 | 07-01 | Row-from-ingredient builder embedding a `structuredClone` of coefficients and basis | SATISFIED | `rowFromLibraryRecord`; criterion 3 evidence. |

All three IDs in the phase brief appear in a PLAN's `requirements:` frontmatter and in REQUIREMENTS.md. No orphaned requirement is mapped to Phase 7. Bookkeeping note for the orchestrator: REQUIREMENTS.md still shows MAKE-01..03 as unchecked and "Pending", and ROADMAP's progress table shows Phase 7 "In Progress"; both are expected to flip on phase completion.

### Anti-Patterns Found

None. No `TBD`, `FIXME`, `XXX`, `TODO` or `HACK` in any file changed by the phase. No stubs, no empty implementations.

### Code Review Findings That Bear on Must-Haves (advisory, recorded open)

None break a requirement or a roadmap criterion.

- WR-01 (`createRecipe` does not check `recipeId`, `versionId`, `now`): not required by MAKE-01 or any criterion; the plan states the caller supplies ids and clock. Hardening for v2's caller. Non-blocking.
- WR-02 (`rowFromLibraryRecord` does not validate `ingredientName` type or a missing `entry`): criterion 3 and MAKE-03 are met for valid library records; the plan restricts refusals to D-07's id, amount and step. Non-blocking.
- WR-03 (reserved row ids `__proto__`, `constructor`, `prototype` pass the builders but fail `validateRow` on import): this sits closest to criterion 1's "import validation accepts", but that criterion is stated for a normal name and rows, and v2's id source is a generated id. Non-blocking; worth fixing before v2 wires a caller.
- WR-04 (`nextStepKey` throws on a fractional step key the import check accepts): the allocator never reuses a key, so MAKE-02 holds; the throw is the plan's recorded safe-integer choice. Non-blocking, but the validator and allocator disagree.
- IN-01 to IN-03: no bearing on a must-have.

### Human Verification Required

None. Phase 7 delivers no UI; every criterion is checked by a node-environment test or a direct probe.

### Gaps Summary

No gaps. The three framework-free functions exist, are substantive, compose correctly end to end (rows from library records into a recipe that the import check accepts, six figures computing, first step key 1), and the full suite passes at the expected 91 files and 2875 tests with no screen or store change.

---

_Verified: 2026-10-15_
_Verifier: Claude (gsd-verifier)_
