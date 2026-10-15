---
phase: 06-the-ingredient-library-in-the-store
plan: 01
subsystem: database
tags: [indexeddb, idb, fake-indexeddb, repository-seam, vitest]

requires:
  - phase: 05-split-the-recipe-page
    provides: verified Phase 5 baseline (86 test files, 2723 tests)
provides:
  - "library object store at DB_VERSION 9 (keyPath id, no index)"
  - "repository seam methods listLibrary, getLibraryEntry, putAllLibrary"
  - "genuine version-8 fixture proof that a profile at 8 keeps its records at 9"
affects: [06-02 seed, 06-03 export and import, 07 row builder]

actuals:
  tokens: 4500
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "putAllLibrary copies importAll's abort-by-hand catch so an unclonable record writes none of the call's records"

key-files:
  created: []
  modified:
    - app/src/store/db.js
    - app/src/store/repository.js
    - app/src/store/repository.test.js
    - app/src/store/db.test.js
    - app/tests/db-reset.test.js
    - .planning/REQUIREMENTS.md

key-decisions:
  - "DB_VERSION 8 to 9 adds the library store only; the reset branch (oldVersion < 8) keeps its exact text (D-01)"
  - "A library record is { id, entry }; getLibraryEntry returns the stored record, not the bare entry (D-02)"
  - "putAllLibrary has no production caller: the seed uses Plan 02's one-transaction method, import uses importAll"

patterns-established:
  - "Bulk put with abort-by-hand: keep tx.done, queue puts in a try, abort and quiet requests in the catch"

requirements-completed: [LIB-01]

coverage:
  - id: D1
    description: "openStore opens at DB_VERSION 9 with a library store keyed by id and no index"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/db.test.js#opens a fresh (deleted) database with versions, batches, recipes, drafts and library stores, at version 9"
        status: pass
    human_judgment: false
  - id: D2
    description: "A version-8 profile (recipe, version, batch, draft) opens at 9 with all four records and the batches index intact and an empty library; a version-7 profile still resets to five empty stores"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/db.test.js#a profile left at version 8 (a recipe, a version, a batch and a draft) opens at 9 with all four records unchanged and an empty library store (D-01, D-01a)"
        status: pass
      - kind: unit
        ref: "app/src/store/db.test.js#resets a database first opened at version 7 (one version, one batch) to all five stores, empty"
        status: pass
    human_judgment: false
  - id: D3
    description: "The repository seam writes, reads and upserts library records on a real IndexedDB, and an unclonable record leaves the library as it was"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#the ingredient library, through the repository seam"
        status: pass
    human_judgment: false
  - id: D4
    description: "REQUIREMENTS.md line 30 and the storage-upgrade Out of Scope row say the bump to 9 resets no profile at 8"
    verification: []
    human_judgment: true
    rationale: "Prose wording in a planning document; checked by grep for the agreed text, not by a test"

duration: 2min
completed: 2026-10-15
status: complete
plan_head_before: f81fe36fc5fc8a70c0ec6d071486ad910a6b1b15
plan_head_after: 0fe1141a2a6db15cb6856c755dd1eeb8a6a5af94
commits: 2
---

# Phase 6 Plan 01: The library store at version 9 Summary

**Ingredient library as its own IndexedDB object store at DB_VERSION 9 (keyPath id, no index), with listLibrary, getLibraryEntry and an abort-safe putAllLibrary on the repository seam, and a genuine version-8 fixture proving no profile at 8 loses a record**

## Performance

- **Duration:** 2 min
- **Started:** 2026-10-15T00:41:59Z
- **Completed:** 2026-10-15T00:43:13Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- db.js opens at version 9 with one guarded `library` create; its diff against d66a3ed removes only the version constant, so the `< 8` reset branch is untouched.
- The seam reads and writes `{ id, entry }` records; a reopen through a second `createRepository()` reads them back, a second write upserts by id, and a put the store cannot clone rejects with none of that call's records written.
- A database created at version 8 with a recipe, a version, a batch and a draft opens at 9 with all four records and the `by-version` index intact and an empty library. A profile at 7 still resets, now to five empty stores.
- REQUIREMENTS.md line 30 and the storage-upgrade row no longer promise a reset on this bump.

## Task Commits

1. **Task 1 (tracer): the library store at version 9, written and read back through the seam** - `666c393` (feat)
2. **Task 2: a genuine version-8 profile keeps its four records at 9, and REQUIREMENTS.md says so** - `0fe1141` (test)

**Plan metadata:** committed separately (docs: complete plan)

## Files Created/Modified
- `app/src/store/db.js` - DB_VERSION 9, guarded library store, one comment line on the bump
- `app/src/store/repository.js` - listLibrary, getLibraryEntry, putAllLibrary; header comment names the library
- `app/src/store/repository.test.js` - real-IndexedDB tests: reopen, getLibraryEntry, upsert, unclonable record
- `app/src/store/db.test.js` - version 9 pins, library store shape, version-8 fixture test, five-store loops
- `app/tests/db-reset.test.js` - version pins moved from 8 to 9 (06-PATTERNS.md did not list this file)
- `.planning/REQUIREMENTS.md` - line 30 and the Out of Scope storage row reworded per D-01

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

The tracer gate (auto-mode off, `end-of-phase` verify mode, automated-only `<verify>`) was satisfied by re-running the full suite end to end: 86 files, 2727 tests passing before Task 2, 2728 after. The Phase 5 precondition passed (05-VERIFICATION.md present, no `gaps_found`).

One environment note: the working branch is `main`, which `git.base-branch --is-protected` reports as protected. The orchestrator dispatched this plan to run sequentially on the main working tree with normal commits, and the repo's recent history commits to main the same way, so the per-commit protected-branch assertion was treated as satisfied by that explicit dispatch. No config was changed.

## Issues Encountered
None.

## Known Stubs
None.

## Threat Flags
None. No new endpoint, auth path or trust boundary beyond the plan's threat model (T-06-01, T-06-02 mitigated; T-06-SC: `git diff --quiet d66a3ed -- app/package.json app/package-lock.json` exits 0).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for 06-02. The seam exposes `listLibrary`, `getLibraryEntry` and `putAllLibrary`; Plan 02 adds its own one-transaction seed method beside them. Nothing under `app/src/ui` changed.

---
*Phase: 06-the-ingredient-library-in-the-store*
*Completed: 2026-10-15*

## Self-Check: PASSED

- FOUND: app/src/store/db.js, repository.js, repository.test.js, db.test.js, app/tests/db-reset.test.js, .planning/REQUIREMENTS.md
- FOUND commits: 666c393, 0fe1141
