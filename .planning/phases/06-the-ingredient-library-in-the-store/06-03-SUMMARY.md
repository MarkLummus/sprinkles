---
phase: 06-the-ingredient-library-in-the-store
plan: 03
subsystem: database
tags: [indexeddb, idb, fake-indexeddb, repository-seam, export-import, store-file, vitest]

requires:
  - phase: 06-the-ingredient-library-in-the-store
    provides: "library store at DB_VERSION 9, listLibrary/getLibraryEntry/putAllLibrary (plan 01); seedLibraryIfEmpty, holdAfterLibraryStep and the LIB-02 describe in library.test.js (plan 02)"
provides:
  - "repository.exportAll(): recipes, versions, batches and library read in one readonly transaction; drafts never read"
  - "repository.importAll({ recipes, versions, batches, library }): one readwrite transaction over four stores, upserts by id, abort-by-hand catch kept"
  - "STORE_SCHEMA_VERSION 8: the store file carries a library array; older files are refused"
  - "validateLibraryRecord (private): the { id, entry } wrapper checked, a reserved name refused as an id's value"
  - "real-IndexedDB proofs: LIB-02 through a whole export and import, D-04a refill, import upsert, held seed against a real importStore"
affects: [07 row builder, ING-01 entry shape, any later schema bump]

actuals:
  tokens: 11900
  tasks: 3
  commits: 3
plan_head_before: edac94a549418021d01985e9c371525f584dc18b
plan_head_after: 03121695ecf401b48ef080d8b031c24fe0ae1529
commits: 3

tech-stack:
  added: []
  patterns:
    - "One transaction per direction: export reads every store it carries in one readonly transaction, import writes them in one readwrite transaction"
    - "Schema bump, validator and every store-file fixture land in one commit, so no commit writes an unchecked record from a file"

key-files:
  created: []
  modified:
    - app/src/store/repository.js
    - app/src/store/repository.test.js
    - app/src/store/transfer.js
    - app/src/store/transfer.test.js
    - app/src/store/library.test.js
    - app/src/store/seed-coverage.test.js
    - app/src/data/seed-recipes.test.js
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/Shell.flyout.test.jsx

key-decisions:
  - "exportStore makes exactly one repository call, exportAll(), so a second tab writing mid-export cannot give a backup built from two moments (D-07a)"
  - "Task 1 widened only the seam and left the file at schema 7 with importStore passing an empty library list; Task 2 is the one commit that brings schema 8, validateLibraryRecord and library: parsed.library (review item 2)"
  - "Library validation checks the wrapper only (id, entry name, composition of finite numbers); a reserved name is refused as an id's value with validateRow's message (D-08 as amended)"
  - "The validator's error order is unchanged: a well-formed older file (it has app) leads with OLDER_EXPORT_MESSAGE, a file without app leads with its $.app line (review item 5)"

patterns-established:
  - "In-memory seam fakes (transfer.test.js, BatchRow.test.jsx) mirror exportAll and importAll over four stores"

requirements-completed: [LIB-03, LIB-02]

coverage:
  - id: D1
    description: "exportAll reads recipes, versions, batches and library in one readonly transaction and never the drafts; importAll writes the same four stores in one readwrite transaction, and an unclonable library record leaves all four stores as they were"
    requirement: LIB-03
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#exportAll, through the repository seam (D-07a)"
        status: pass
      - kind: unit
        ref: "app/src/store/repository.test.js#importAll, through the repository seam"
        status: pass
    human_judgment: false
  - id: D2
    description: "The store file is schema 8 and carries the library; each record's wrapper is validated, reserved ids are refused, an older file is refused, and a cloneable malformed record such as { id: sucrose, entry: null } leaves a real store empty"
    requirement: LIB-03
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#validateLibraryRecord / $.library (D-08)"
        status: pass
      - kind: unit
        ref: "app/src/store/transfer.test.js#importStore"
        status: pass
      - kind: unit
        ref: "app/src/store/transfer.test.js#exportStore, drafts stay on the device (T-04-12)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The import panel shows four lines for an older file with no app, and the plain older-version sentence first for a well-formed older file"
    requirement: LIB-03
    verification:
      - kind: unit
        ref: "app/src/ui/Shell.flyout.test.jsx#The Import error panel"
        status: pass
    human_judgment: false
  - id: D4
    description: "A changed library record survives a whole seed, export, validate and import into a fresh store, and every stored version figure and batch snapshot equals its value from before the change"
    requirement: LIB-02
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#the change survives export and import into a fresh store, and still moves no figure (LIB-02, LIB-03)"
        status: pass
    human_judgment: false
  - id: D5
    description: "An empty imported library is refilled at the next boot without adding a seed recipe, an import replaces only the library records it names, and a seed held after its library step does not overwrite a record a real import changed"
    requirement: LIB-03
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#export and import carry the library (LIB-03, D-04a, D-07)"
        status: pass
    human_judgment: false

duration: 3min
completed: 2026-10-15
status: complete
---

# Phase 6 Plan 03: Export and import carry the library Summary

**Export reads and import writes recipes, versions, batches and the ingredient library in one transaction each; the store file moves to schema 8 with a wrapper validator for library records; a library change is proven to move no figure through a whole export and import.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-10-15T00:47:54Z
- **Completed:** 2026-10-15T00:50:40Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- `repository.exportAll()` reads the four stores in one readonly transaction (a spy sees one call over `['recipes', 'versions', 'batches', 'library']`); `importAll` writes the same four in one readwrite transaction with the abort-by-hand catch kept, and an unclonable library record leaves all four stores unchanged.
- The store file is schema 8 and carries `library`. `validateLibraryRecord` checks the `{ id, entry }` wrapper only (D-08) and refuses `__proto__`, `constructor` and `prototype` as an id's value, with the same message validateRow gives row ids. A cloneable malformed record (`{ id: 'sucrose', entry: null }`) is refused and a real store stays empty.
- LIB-02 holds through a whole export and import: the target store's version balances, six figures and batch snapshots equal the source's values from before the change, and the changed sucrose record arrives changed.
- An empty imported library is refilled at the next boot (D-04a) and adds no seed recipe; an import upserts only the library records it names (D-07); a seed held after its library step leaves the PAC a real `importStore` gave sucrose meanwhile (review item 1, import leg).

## Import panel note

The import panel now shows a fourth line (`$.library: expected an array`) for any older file. A well-formed older file (one that carries `app`) still shows the plain older-version sentence first; a file without `app`, such as the Shell's OLDER_EXPORT fixture, leads with its `$.app` line, as before. The validator's error order did not change.

## Task Commits

1. **Task 1 (tracer): a backup is read in one transaction and restored in one transaction over the four stores** - `0d7aa09` (feat). Ran after Phase 5's verification (05-VERIFICATION.md status passed).
2. **Task 2: the file carries the library at schema 8, with its validator and every fixture in the same commit** - `b6350cf` (feat). This one commit brought `STORE_SCHEMA_VERSION = 8`, `validateLibraryRecord` and `library: parsed.library` into importAll (checked with `git log -G` for all three).
3. **Task 3: round-trip, refill, upsert and held-seed proofs** - `0312169` (test)

**Plan metadata:** the docs commit that follows this file.

## Files Created/Modified
- `app/src/store/repository.js` - `exportAll()`; `importAll` over four stores
- `app/src/store/transfer.js` - schema 8, `validateLibraryRecord`, required `$.library`, `exportStore` through `exportAll`, `library: parsed.library`
- `app/src/store/repository.test.js` - four-store importAll tests, unclonable library record, exportAll spy test
- `app/src/store/transfer.test.js` - fake with `exportAll` and `library`, `makeLibraryRecord`, schema 8 moves, `validateLibraryRecord / $.library (D-08)`, four new importStore tests
- `app/src/store/library.test.js` - `changeSucrose`, the LIB-02 round-trip test, describe 'export and import carry the library'
- `app/src/store/seed-coverage.test.js`, `app/src/data/seed-recipes.test.js` - seed payload carries `library`
- `app/src/ui/BatchRow.test.jsx` - `memoryRepository` serves `exportAll` and a library list (fixture only)
- `app/src/ui/Shell.flyout.test.jsx` - older-export test reads four lines; one new test for a well-formed older export; `OLDER_EXPORT_MESSAGE` added to one import

Only test files changed under `app/src/ui`; no component, hook or stylesheet changed.

## Decisions Made
None beyond the plan; the decisions above are the plan's, carried out as written.

## Deviations from Plan

None - plan executed exactly as written.

Two process notes, neither a deviation from the result: Task 2's new tests and its fixture moves were written together with the transfer.js change and run once green, rather than run red first (the plan's work order); the red run was not committed either way. The suite grew from 2744 to 2785 tests across 87 files.

## Issues Encountered
None.

## Known Stubs
None.

## Threat Flags
None. The new surface (library list in the file) is covered by T-06-06 to T-06-15 in the plan's threat model.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 6 plans are all built: the library is stored, seeded, exported and imported, and Phase 7 can build rows from `listLibrary()` records.
- `.planning/state.json` was modified before this plan began and was not touched or committed.

## Self-Check: PASSED

---
*Phase: 06-the-ingredient-library-in-the-store*
*Completed: 2026-10-15*
