---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 02
subsystem: domain
tags: [sheet-code, fnv1a, crockford, seed-data, print, search]

requires:
  - phase: 04-print
    provides: legacy sheetCode(version) content derivation and its golden vector 64JH-G408
provides:
  - SEED_SHEET_CODES, the 19 codes the seeded versions print today
  - codeFromVersionId and SHEET_CODE_ID_DERIVATION, the one-time id derivation for new versions
  - seedRecipeGroups stamps a stored sheetCode on every version (copies; data exports stay unstamped)
  - print route, printed pages and Enter Sheet code read version.sheetCode
  - createChildVersion and createRecipe store an id-derived sheetCode; saveOverVersion keeps it
affects: [09-06 write-transaction uniqueness, 09-09 DB_VERSION bump and reset, 09-10 import validation and persistence fixtures, 09-16 walk allow-list]

actuals:
  tokens: 10700
  tasks: 2
  commits: 3
plan_head_before: b4691b335a2cde3abccf5872603194d8968ec678
plan_head_after: 63300a04ed64b1d8f8a8fe52c30d7f9ddd6cfa58

tech-stack:
  added: []
  patterns:
    - "A stored, derived-once identifier: derive at creation, store on the record, read the field everywhere, never recompute"
    - "A new derivation is a new tag, never an edit of the old one"

key-files:
  created:
    - app/src/data/seed-sheet-codes.js
  modified:
    - app/src/data/seed-recipes.js
    - app/src/data/seed-recipes.test.js
    - app/src/domain/sheetCode.js
    - app/src/domain/sheetCode.test.js
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js
    - app/src/domain/newRecipe.js
    - app/src/domain/newRecipe.test.js
    - app/src/ui/PrintSheet.jsx
    - app/src/ui/PrintSheet.test.jsx
    - app/src/ui/PrintSheetPages.jsx
    - app/src/ui/PrintSheetPages.test.jsx
    - app/src/ui/SheetCodeSearch.jsx
    - app/src/ui/SheetCodeSearch.test.jsx

key-decisions:
  - "Stamp the stored code in seedRecipeGroups on copies, so the data modules' own exports stay unstamped and unmutated"
  - "No fallback to the content derivation in search: a version with no stored code is never found (plan 09-09's reset reseeds)"
  - "codeFromVersionId golden vectors were computed with an independent reference script before being pinned"

patterns-established:
  - "Print and search fixtures read a stamped seed version (seedRecipeGroups[0].versions[0]) and prove the field is read by storing a code that differs from sheetCode(version)"

requirements-completed: [CODE-01]

duration: 40min
completed: 2026-10-18
status: complete
---

# Phase 9 Plan 02: The stored Sheet code Summary

**Every version now stores its Sheet code: the 19 seeded versions keep the codes they print today (Olive Oil v1 stays 64JH-G408), a new child or created root gets a code derived once from its id, and print and Enter Sheet code read the stored field.**

## Performance

- **Duration:** about 40 min
- **Tasks:** 2 (Task 1 tracer, Task 2 TDD)
- **Files modified:** 15 (1 created, 14 modified)
- **Test suite:** 3030 passing (baseline 3009)

## Accomplishments

- `SEED_SHEET_CODES` is a frozen literal of the 19 printed codes, pinned by a test against the legacy `sheetCode()` over the seed as it stands, with a sorted-keys-equal-sorted-ids check so an orphan key fails (checked once by hand with a twentieth key, then removed).
- `seedRecipeGroups` stamps copies with `sheetCode`; a seeded id with no entry throws a `TypeError` at load. `oliveOilVersion` and the transcribed versions imported directly keep no `sheetCode`, proven by a test.
- `findVersionsByCode`, `PrintSheet.jsx` and `PrintSheetPages.jsx` read `version.sheetCode`. Tests store a code that differs from `sheetCode(version)` and show the stored one is found and printed.
- `codeFromVersionId(id)` hashes `sprinkles-sheet-code-id:1:<id>` through the shared FNV-1a 64 and Crockford step (factored into a private `codeFromBytes`); the legacy `sheetCode()` and its golden vector are unchanged.
- `createChildVersion` and `createRecipe` store `codeFromVersionId(id)`; `saveOverVersion` keeps the version's own code whatever the correction edits (tested with a new Version name, Sheet title, description, rows, steps and notes).

## Task Commits

1. **Task 1 (tracer): stored code on seeded versions; print and search read it** - `9baf6080` (feat)
2. **Task 2 RED: failing tests for id-derived codes** - `3edfad89` (test)
3. **Task 2 GREEN: child and created root store an id-derived code** - `63300a04` (feat)

**Plan metadata:** this SUMMARY's docs commit follows.

## Golden vectors pinned

| Input | Code |
|-------|------|
| `codeFromVersionId('olive-oil-ice-cream-v1')` | `8MDQ-VWFY` |
| `codeFromVersionId('00000000-0000-4000-8000-000000000001')` (the walk's first child id) | `688G-BZQN` |
| `codeFromVersionId('v2')` (pinned in lineage.test.js) | `527P-MK7B` |
| `codeFromVersionId('version-plain-1')` | `DC9F-J1R9` |

Plan 09-16's walk allow-list can expect `688G-BZQN` for the first saved-as-new child.

## TDD Gate Compliance

- RED (`3edfad89`): 8 target tests failed on missing `codeFromVersionId` or the missing `sheetCode` key, the planned assertions. Semantic assessment: the failures are the planned behaviour (missing symbol, 17 keys not 18, no stored code), not setup or syntax faults. One case (the TypeError check) first passed vacuously, because calling an undefined function also throws a TypeError, so it was tightened to assert the message before the RED commit. The formal `tdd-red-evidence` classifier was not run: the plan is `type: execute`, not a `type: tdd` plan.
- GREEN (`63300a04`): all target tests and the full suite pass. No REFACTOR commit.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] PrintSheetPages.jsx foot text moved from Task 2 into Task 1**
- **Found during:** Task 1 verify
- **Issue:** Task 1's verify runs PrintSheet.test.jsx, whose "an import re-reads the open route" case expects the imported version's stored code in the Sheet page's foot. That foot comes from `PrintSheetPages.jsx` (`sheetBlocks`), which the plan assigns to Task 2, so Task 1 could not pass its own verify.
- **Fix:** Changed `sheetBlocks`'s `footText` to `version.sheetCode` and updated PrintSheetPages.test.jsx's fixtures (stamped olive oil version, the stored-code-differs case) in the Task 1 commit. Task 2 then moved the `createdVersion` case onto the code `createRecipe` stored.
- **Files modified:** app/src/ui/PrintSheetPages.jsx, app/src/ui/PrintSheetPages.test.jsx
- **Committed in:** `9baf6080`

**2. [Rule 3 - Blocking] node_modules symlinked into the worktree**
- **Found during:** Task 1 verify
- **Issue:** `vitest: command not found` in the fresh worktree (no `app/node_modules`).
- **Fix:** `app/node_modules` symlinked to the main checkout's (gitignored, not staged). No package installed, `package.json` unchanged.

---

**Total deviations:** 2 auto-fixed (both Rule 3, no scope change)
**Impact on plan:** Rearranged which task commit carries one file; every file stays inside the plan's `files_modified`.

## Issues Encountered

None beyond the above. The build (`vite build` into a scratch outDir) succeeds.

## Known Stubs

None.

## Threat Flags

None. T-09-04 (seed codes pinned by test) and T-09-05 (exact compare against the stored field) are mitigated as planned.

## Next Phase Readiness

- Plan 09-06 can add `sheetCodeProblems` and write-transaction uniqueness over the stored field.
- Plan 09-10 stamps the persistence fixtures that carry a direct export (`data/seed-recipes.test.js` flatten cases, `store/library.test.js`, `ui/BatchRow.test.jsx`'s export case) and makes import require the field.
- Until plan 09-09's reset, a profile at DB_VERSION 9 holds versions without `sheetCode`, so Enter Sheet code finds nothing there; no fallback was added, as the plan states.

## Self-Check: PASSED

- FOUND: app/src/data/seed-sheet-codes.js
- FOUND commits: 9baf6080, 3edfad89, 63300a04 (reachable from HEAD)
- Full suite 3030 passing; build into a scratch directory succeeds.
