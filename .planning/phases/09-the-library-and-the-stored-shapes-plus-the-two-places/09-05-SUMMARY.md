---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 05
subsystem: database
tags: [indexeddb, store-file, validation, seed, library-link, vitest]

requires:
  - phase: 06
    provides: the ingredient library store and data/library.js keys
provides:
  - embedFromLibrary, the one seed embed helper (row copy plus its libraryId)
  - libraryId on every seeded row, every batch snapshot row, and every row rowFromLibraryRecord builds
  - maxFillG null beside minFillG on every seeded equipment block
  - serveTempC on all 19 seeded versions, copied from each version's iceEd servingTemperatureC
  - validateRow requires libraryId; validateVersion checks equipment limits and serveTempC when present
affects: [09-07, 09-08, 09-09, 09-10, 09-16, 09-17, phase-10]

plan_head_before: b4691b335a2cde3abccf5872603194d8968ec678
plan_head_after: 913152076875015a9a474e36af79324ff7c12d1b

actuals:
  tokens: 55000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "A stored row carries a link to the library entry its copy came from; the link is never read to compute a figure"
    - "Seed files embed through one helper that throws on an unknown library key"

key-files:
  created:
    - app/src/data/library-embed.js
    - app/src/data/library-embed.test.js
    - app/src/store/library-link.test.js
  modified:
    - app/src/domain/versionRow.js
    - app/src/domain/versionRow.test.js
    - app/src/data/olive-oil.js
    - app/src/data/pineapple.js
    - app/src/data/coconut.js
    - app/src/data/strawberry.js
    - app/src/data/standard-base.js
    - app/src/data/mocha.js
    - app/src/data/mexican-chocolate.js
    - app/src/data/underbelly-light-base.js
    - app/src/store/transfer.js
    - app/src/store/transfer.test.js
    - app/src/store/library.test.js

key-decisions:
  - "The strawberry recipe's two own fruit definitions link to null and own the six D-20 keys at null (no titratableAcidity basis or source)"
  - "serveTempC is copied once as a plain literal beside each iceEd line; the iceEd block is untouched and nothing reads it after the copy"
  - "equipment limits are required own keys (null when unknown) whenever a version carries equipment; absent equipment stays valid"

patterns-established:
  - "embedFromLibrary(name, libraryKey, fields): the seed's only way to build a library-linked row"
  - "validateRow requires libraryId (null or a non-reserved non-empty string); a dangling link still validates"

requirements-completed: [LIB-08, LIB-06]

coverage:
  - id: D1
    description: "Every seeded row and every row rowFromLibraryRecord builds carries libraryId naming its library entry, null only on the strawberry recipe's two own definitions"
    requirement: LIB-08
    verification:
      - kind: unit
        ref: "app/src/data/library-embed.test.js#the seeded rows keep their library link (LIB-08)"
        status: pass
      - kind: unit
        ref: "app/src/domain/versionRow.test.js#links the row to the library record it was copied from"
        status: pass
    human_judgment: false
  - id: D2
    description: "A row keeps its libraryId through saveVersion, exportStore and importStore, and changing the library entry afterwards moves no stored figure"
    requirement: LIB-08
    verification:
      - kind: integration
        ref: "app/src/store/library-link.test.js#a row keeps its library link (LIB-08)"
        status: pass
    human_judgment: false
  - id: D3
    description: "validateRow requires libraryId and validateVersion checks equipment limits and serveTempC, each with a path-named error"
    requirement: LIB-06
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#a row's library link (LIB-08, T-09-10)"
        status: pass
      - kind: unit
        ref: "app/src/store/transfer.test.js#a version's equipment and serveTempC (D-13, D-19, T-09-42)"
        status: pass
    human_judgment: false
  - id: D4
    description: "All 19 seeded versions store serveTempC equal to their own iceEd servingTemperatureC (17 numbers, 2 nulls) and maxFillG null"
    requirement: LIB-06
    verification:
      - kind: unit
        ref: "app/src/data/library-embed.test.js#the seeded versions store maxFillG and serveTempC (D-13, D-19)"
        status: pass
    human_judgment: false

duration: 11min
completed: 2026-10-18
status: complete
---

# Phase 9 Plan 05: Library link, maxFillG and serveTempC Summary

**Every stored row now names the library entry it was copied from (libraryId), every seeded equipment block stores maxFillG, and all 19 seeded versions store serveTempC copied from their own Ice Ed figure, with the store-file validator checking all three.**

## Performance

- **Duration:** about 11 min
- **Started:** 2026-10-19T00:17:00Z
- **Completed:** 2026-10-19T00:28:00Z
- **Tasks:** 3
- **Files modified:** 16 (3 created, 13 modified)

## Accomplishments

- `embedFromLibrary` replaced the eight per-file `embed` copies; it throws a TypeError for a key the library does not hold. `rowFromLibraryRecord` now sets `libraryId: record.id` and refuses a record id that is empty, non-string or reserved.
- The strawberry recipe's two own definitions (`STRAWBERRIES_V1_V2_IER`, `DRIED_STRAWBERRY_V2_IER`, now exported) link to null through a local `embedOwn` and each own the six D-20 keys at null.
- `validateRow` requires `libraryId`; `validateVersion` checks equipment (`machine` string or null, `minFillG` and `maxFillG` own keys, null or finite and at least 0) and `serveTempC` (null or finite, no range check) whenever present.
- `library-link.test.js` proves the link survives save, export and import into a fresh profile, and that changing the library entry afterwards moves no computed figure.

## Task Commits

1. **Task 1 (tracer): olive oil's rows keep their library link through save, export and import** - `88dc12f8` (feat)
2. **Task 2: four more seed recipes embed through the helper** - `417ee4ce` (feat)
3. **Task 3: the last three seed recipes embed; every version stores maxFillG and serveTempC** - `91315207` (feat)

The tracer gate re-ran Task 1's automated verify (green at commit) and the full suite after each later task before expanding.

## Files Created/Modified

- `app/src/data/library-embed.js` - embedFromLibrary
- `app/src/data/library-embed.test.js` - seed-wide link, strawberry exception, maxFillG and serveTempC invariants
- `app/src/store/library-link.test.js` - LIB-08 proof through the repository, export and import
- `app/src/domain/versionRow.js` / `.test.js` - libraryId on built rows; id refusal
- `app/src/data/{olive-oil,pineapple,coconut,strawberry,standard-base,mocha,mexican-chocolate,underbelly-light-base}.js` - helper, serveTempC, maxFillG
- `app/src/store/transfer.js` / `.test.js` - validator changes; refusal cases; seeded-export round trip compares with the source's own library
- `app/src/store/library.test.js` - importer case names data/library-embed.js

## Decisions Made

None beyond the plan. The plan's assumptions stand: serveTempC has no range check, and a dangling libraryId still validates (both pinned by tests).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Linked app/node_modules into the worktree**
- **Found during:** Task 1 (first test run, `vitest: command not found`)
- **Issue:** the fresh worktree has no `app/node_modules`
- **Fix:** symlinked `app/node_modules` to the main checkout's installed copy; no package was installed. The symlink is gitignored and untracked.
- **Files modified:** none tracked

**2. [Rule 1 - Orphan cleanup] Removed a comment my change orphaned**
- **Found during:** Task 3
- **Issue:** mexican-chocolate.js kept a "Deep-copy the ingredient record onto the row" comment that described the removed local `embed`
- **Fix:** deleted that comment only
- **Files modified:** app/src/data/mexican-chocolate.js

**Total deviations:** 2 (one blocking environment fix, one orphan cleanup). **Impact:** none on scope.

## Issues Encountered

- The per-plan commit ledger (`gsd-plan-head-before-09-05`) was not written: the worktree sandbox refuses compound git commands and the ledger lives outside the worktree. The base was the worktree's spawn HEAD `b4691b33`, recorded in the frontmatter, and `commits: 3` was measured with `git rev-list --count b4691b33..HEAD` before this SUMMARY's own docs commit.
- Plan text says the run baseline is 3009 tests; the base measured 3009 earlier in the plan's notes and this worktree's Task 1 run reached 3020 after the first commit's new tests.

## Known Stubs

None.

## Threat Flags

None. No new network, auth or file surface; T-09-10, T-09-11 and T-09-42 are mitigated and tested.

## Verification

- Full suite: `npm --prefix app test` passes, 98 files, 3060 tests (base 3009).
- Acceptance greps from the plan all return the expected counts (no `function embed(` left; 12 `embedFromLibrary(` in olive-oil.js; `serveTempC` value lines 1, 2, 3, 2, 4, 4, 2, 1 equal to each file's `iceEd:` count; nulls only on olive oil v1 and Underbelly Light Base v1).
- Fixture sweep: only `store/transfer.test.js` hand-built rows; every other suite passed unedited.

## Next Phase Readiness

Ready for plan 09-07 (writes the six D-20 keys on the library entries and checks every seeded row's embedded ingredient owns them), 09-08 (createRecipe's `serveTempC`), and 09-10 (makes `serveTempC` required on import and updates `library-link.test.js`'s hand-built source profile).

## Self-Check: PASSED

- FOUND: app/src/data/library-embed.js, app/src/data/library-embed.test.js, app/src/store/library-link.test.js
- FOUND commits: 88dc12f8, 417ee4ce, 91315207 (ancestors of HEAD)

---
*Phase: 09-the-library-and-the-stored-shapes-plus-the-two-places*
*Completed: 2026-10-18*
