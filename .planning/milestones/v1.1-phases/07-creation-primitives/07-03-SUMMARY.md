---
phase: 07-creation-primitives
plan: 03
subsystem: domain
tags: [new-recipe, root-version, advisories, import-check, vitest, pure-domain]
status: complete

requires:
  - phase: 07-01
    provides: rowFromLibraryRecord (library record to version row)
  - phase: 07-02
    provides: nextStepKey (never-reused step key)
provides:
  - "createRecipe({ name, versionLabel, rows }, { recipeId, versionId, now }) -> { recipe, version }: pure, id and clock injected, 17-key root version with no equipment, process, iceEd, targets or coefficientSetName"
  - "advisories.js early returns: subScaleAdvisory with no equipment, hydrationAdvisory with no process"
  - "Criterion-1 proof: library records to rows to a recipe whose store file passes validateStoreFile, computes six figures, starts at step key 1"
affects: [v2 creation screen]

actuals:
  tokens: 5800
  tasks: 3
  commits: 4
plan_head_before: 1a2c220e61cd35507c7b43686c75d39a8d01df55
plan_head_after: 1883c99316a04eb272b47a94a6547de48270825d

tech-stack:
  added: []
  patterns:
    - "Constructors in app/src/domain throw TypeError on bad input (with versionRow.js and stepKeys.js)"
    - "Module-private schema constant pinned to the seed's by a parity test, no seed import in domain"

key-files:
  created:
    - app/src/domain/newRecipe.js
    - app/src/domain/newRecipe.test.js
    - app/src/store/creation-roundtrip.test.js
  modified:
    - app/src/domain/advisories.js
    - app/src/domain/advisories.test.js
    - app/src/ui/PrintSheetPages.test.jsx

key-decisions:
  - "createRecipe throws TypeError for a blank name, a blank label (on its trimmed value), empty or non-array rows, and a repeated row id; the throws sit with those of versionRow.js and stepKeys.js as the first in app/src/domain. Reversible: no caller exists. v2's form runs the existing message gates first."
  - "VERSION_SCHEMA_VERSION (6) is duplicated module-privately in newRecipe.js and pinned to data/olive-oil.js by a test. If Mark wants one owner, moving it into app/src/domain and having olive-oil.js import it is a one-line follow-up."
  - "createRecipe takes rows already built by rowFromLibraryRecord, not row specs, so the row builder stands alone."

requirements-completed: [MAKE-01]

coverage:
  - id: D1
    description: "createRecipe returns the recipe and a 17-key root version with the caller's ids and clock, trimmed name as Sheet title, schema pinned to the seed, rows copied"
    requirement: MAKE-01
    verification:
      - kind: unit
        ref: "app/src/domain/newRecipe.test.js#createRecipe — the root version (D-01 to D-04)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The four refusals throw TypeError with fixed messages; newRecipe.js imports nothing outside the domain and reads no clock or random source"
    requirement: MAKE-01
    verification:
      - kind: unit
        ref: "app/src/domain/newRecipe.test.js#createRecipe — refusals (D-03, D-08)"
        status: pass
      - kind: unit
        ref: "app/src/domain/newRecipe.test.js#newRecipe.js stays pure (criterion 4)"
        status: pass
    human_judgment: false
  - id: D3
    description: "A created recipe passes validateStoreFile, computes six figures in FIGURE_SPECS order, reads through buildAdvisories, and has first step key 1"
    requirement: MAKE-01
    verification:
      - kind: unit
        ref: "app/src/store/creation-roundtrip.test.js#a recipe created from library records (criterion 1, MAKE-01)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A root version with weight and all-zero goes through advisories, child creation, diff, batch (snapshot deep-equal and unchanged after a later edit), Sheet code and sheetBlocks without throwing"
    requirement: MAKE-01
    verification:
      - kind: unit
        ref: "app/src/store/creation-roundtrip.test.js#a recipe created from library records — the rest of the app reads it (D-02, D-03, D-07)"
        status: pass
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — absent equipment or process (Phase 7 D-02)"
        status: pass
      - kind: unit
        ref: "app/src/ui/PrintSheetPages.test.jsx#sheetBlocks — a recipe created from library records (Phase 7 D-02, D-07)"
        status: pass
    human_judgment: false
---

# Phase 7 Plan 03: createRecipe and the root version Summary

**Pure `createRecipe` builds a recipe and a 17-key root version from library-record rows; the version passes the store file import check, computes six figures, and every reader (advisories, child, diff, batch, Sheet) handles its missing equipment, process, iceEd and targets blocks.**

## Performance

- **Tasks:** 3 of 3 complete
- **Tests:** 91 files, 2875 tests, all passing (baseline after Wave 1: 89 files, 2837)

## Accomplishments

- `app/src/domain/newRecipe.js`: `createRecipe` returns `{ recipe, version }`; the version has exactly seventeen keys, `coefficientSetId` '', empty method, `authored { beforeYouStart: [] }`, rows copied with `structuredClone`.
- `app/src/domain/advisories.js`: two early returns (`if (!equipment) return null;`, `if (!process) return null;`) plus one JSDoc line each; additive only, still one export.
- `app/src/store/creation-roundtrip.test.js`: criterion-1 proof via the pure `validateStoreFile` (no IndexedDB), plus the all-zero twin and, under `describe.each` for weighted and all-zero amounts, a child with diff, a batch (snapshot rows deep-equal the version's and stay unchanged when the version's rows are later edited) and the Sheet code.
- `app/src/ui/PrintSheetPages.test.jsx`: `sheetBlocks` on a created root version, weighted and all-zero.

## Task Commits

1. Task 1 (tracer): `9de3cf1` feat, createRecipe happy path, advisories guards, round-trip proof
2. Task 2 (TDD): `fe17c8c` test (RED, 12 failing refusal cases), `044a5e3` feat (GREEN, four TypeError refusals)
3. Task 3: `1883c99` test, root version read by advisories, child, diff, batch, Sheet code and Sheet blocks

The tracer gate: the Task 1 `<verify>` (round-trip and advisories tests) was re-run end to end before expanding and passed.

## Deviations from Plan

None - plan executed exactly as written. Task 2 was committed as a RED test commit followed by a GREEN feature commit, as its `tdd="true"` attribute asks.

## Notes for Mark

- The throws in the three constructors (`versionRow.js`, `stepKeys.js`, `newRecipe.js`) are the first in app/src/domain. Reversible; no caller yet.
- `VERSION_SCHEMA_VERSION` is duplicated module-privately in `newRecipe.js` and pinned to `data/olive-oil.js` by a test. Moving it into app/src/domain with `olive-oil.js` importing it is a one-line follow-up if one owner is wanted.
- Not edited, as the plan requires: the comment at `app/src/data/mexican-chocolate.js` lines 39-44 (advisories.js "dereferences version.equipment unconditionally") is no longer true after the D-02 guard.

## Known Stubs

None.

## Threat Flags

None. No new endpoints, auth paths, file access or schema changes at a trust boundary. Threat register T-07-06 to T-07-09 mitigated as planned; no package installed beyond `npm ci` of the existing lockfile (package.json and package-lock.json unchanged).

## Self-Check: PASSED

- Files found: newRecipe.js, newRecipe.test.js, creation-roundtrip.test.js
- Commits found: 9de3cf1, fe17c8c, 044a5e3, 1883c99
- Full suite: 2875 tests passing
