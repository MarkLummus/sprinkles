---
phase: 06-the-ingredient-library-in-the-store
plan: 02
subsystem: database
tags: [indexeddb, idb, fake-indexeddb, repository-seam, seed, vitest]

requires:
  - phase: 06-the-ingredient-library-in-the-store
    provides: "library store at DB_VERSION 9; listLibrary, getLibraryEntry, putAllLibrary on the seam (plan 01)"
provides:
  - "repository.seedLibraryIfEmpty(records): one readwrite transaction that counts the library and puts every record only when it is empty"
  - "seedIfEmpty with a second, independent library guard run first"
  - "real-IndexedDB proofs: seeded library, seed twice, parallel boot, held seed, version-8 profile, import scan, LIB-02 store leg"
  - "holdAfterLibraryStep(repository) test helper that plan 03 reuses"
affects: [06-03 export and import, 07 row builder]

actuals:
  tokens: 12000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Check and write in one transaction: await only the count request, then queue puts, with importAll's abort-by-hand catch"
    - "In-memory seam fake whose writers upsert by id, as the store's puts do"

key-files:
  created:
    - app/src/store/library.test.js
  modified:
    - app/src/store/repository.js
    - app/src/store/repository.test.js
    - app/src/store/seed.js
    - app/src/store/seed.test.js

key-decisions:
  - "The library seed is one repository call (seedLibraryIfEmpty), never a separate read and write, so a delayed second tab cannot write the seed over a record an import changed (D-04 as amended)"
  - "The library step runs before the versions guard and the two guards are independent (D-04a, D-05: empty library refilled, filled library never topped up)"

patterns-established:
  - "Held-seed test: wrap the three library methods so a seed pauses where its library step hands back, then change a record and resume"

requirements-completed: [LIB-01, LIB-02]

coverage:
  - id: D1
    description: "seedLibraryIfEmpty counts and writes in one readwrite transaction: empty library gets every record (true), filled library gets nothing (false), two connections at once give one writer, an unclonable record leaves the library empty and the next call seeds it"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#seedLibraryIfEmpty, one transaction for the check and the write (D-04)"
        status: pass
    human_judgment: false
  - id: D2
    description: "On an empty database the seed writes every data/library.js entry as { id, entry } with no other field and no id in the entry, read back through a fresh connection; seeding twice and in parallel leaves one record per seed id"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#the library store, seeded on an empty database (LIB-01)"
        status: pass
      - kind: unit
        ref: "app/src/store/library.test.js#seeding twice and in parallel (LIB-01 edges)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The two seed guards work in all four combinations, and an interrupted seed repeats only the missing part with every store holding each seed record once"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/seed.test.js#seedIfEmpty, the two independent guards (D-04)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A seed held after its library step does not overwrite a sucrose record changed meanwhile"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#a seed held after its library step does not overwrite a library record changed meanwhile (D-04; review item 1)"
        status: pass
    human_judgment: false
  - id: D5
    description: "A version-8 profile opens at 9 through the seed with its recipe, version, batch and draft unchanged, Olive Oil's figures and balances equal, and the full library"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#a profile left at version 8, through the seed (D-01, D-01a, success criterion 2)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Only store/seed.js and files directly under data/ import data/library.js, and only store/db.js imports idb"
    requirement: LIB-01
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#who reads data/library.js, and who imports idb (success criterion 1, D-05)"
        status: pass
    human_judgment: false
  - id: D7
    description: "LIB-02 store leg: changing sucrose in a real IndexedDB moves no stored version balance, six figures or batch snapshot"
    requirement: LIB-02
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#a change to a library entry moves no stored figure (LIB-02, success criterion 3)"
        status: pass
    human_judgment: false
  - id: D8
    description: "Mark's iPad, holding a version-8 profile, opens the built app with every recipe, version and batch it held, and Olive Oil's figures read as before"
    verification: []
    human_judgment: true
    rationale: "A real WebKit device upgrade of a real profile; fake-indexeddb cannot prove it. Nothing on screen shows the library."

duration: 2min
completed: 2026-10-15
status: complete
plan_head_before: b46772999a2d01b801bb0114c194313e85daba47
plan_head_after: e1ad1cb1862b49872af732fdc1055fe1a8e286a4
commits: 3
---

# Phase 6 Plan 02: The seed fills the library Summary

**seedLibraryIfEmpty counts and writes the library in one IndexedDB transaction, seedIfEmpty runs it first as a second independent guard, and real-IndexedDB tests prove a held seed cannot overwrite a changed record, a version-8 profile keeps its figures, and a library change moves no stored figure**

## Performance

- **Duration:** 2 min
- **Started:** 2026-10-15T00:44:26Z
- **Completed:** 2026-10-15T00:46:33Z
- **Tasks:** 3
- **Files modified:** 5 (one created)

## Accomplishments
- `seedLibraryIfEmpty(records)` awaits only the count request between its check and its puts, resolves true when it wrote and false otherwise, and aborts by hand on an unclonable record (importAll's catch), so a failed seed leaves the library empty.
- `seedIfEmpty` calls it first with `Object.entries(library)` mapped to `{ id, entry }`. No existing code line of seed.js changed; the versions guard and the recipes, batches, versions order are intact.
- The seed fake now upserts by id and models `seedLibraryIfEmpty`, so the interrupted-seed test asserts each store's final contents (each seed record once, in seed order).
- The held-seed test pauses one seed where its library step hands back, lets a second seed and a sucrose PAC change complete, then resumes; the changed record survives. I confirmed it bites: with seed.js temporarily reverted to a separate `listLibrary` then `putAllLibrary`, that test failed. seed.js was restored and is unchanged from the task 1 commit.
- A raw version-8 profile (recipe, version, batch, draft) opens at 9 through the seed with all four records and Olive Oil's figures unchanged and the full library added.
- LIB-02 store leg: doubling sucrose's pac in the real store, read back through fresh connections, leaves every version's balance and six figures and every batch snapshot equal; the change landed and swapping it into Olive Oil v1's rows would move PAC.
- A scan pins that only `store/seed.js` and files directly under `data/` import the library data, and only `store/db.js` imports `idb`.

## Task Commits

1. **Task 1 (tracer): the seed fills the library through one check-and-write transaction** - `53ea329` (feat)
2. **Task 2: guards in four combinations, interrupted seed, parallel and held seeds, version-8 profile, import scan** - `aaa0b72` (test)
3. **Task 3: a changed library record moves no stored figure (LIB-02)** - `e1ad1cb` (test)

**Plan metadata:** committed separately (docs: complete plan)

## Files Created/Modified
- `app/src/store/repository.js` - `seedLibraryIfEmpty(records)`
- `app/src/store/repository.test.js` - four real-IndexedDB tests of the method
- `app/src/store/seed.js` - library step first, rewritten comment block
- `app/src/store/seed.test.js` - upserting fake with `seedLibraryIfEmpty`, four guard combinations, interrupted seed
- `app/src/store/library.test.js` - new: seeded library, twice and parallel, held seed, version-8 profile, import scan, LIB-02

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

The tracer gate (auto-mode off, `end-of-phase` verify mode, automated-only `<verify>`) was satisfied by re-running the full suite end to end after Task 1: 87 files, 2733 tests passing. The Phase 5 precondition passed. As in plan 01, commits went on `main` by the orchestrator's explicit sequential dispatch; no config was changed.

## Issues Encountered
None.

## Known Stubs
None.

## Threat Flags
None. T-06-03, T-06-04, T-06-05 and T-06-13 are mitigated by the tests above. T-06-SC: `git diff --quiet d66a3ed -- app/package.json app/package-lock.json` exits 0.

## User Setup Required
None - no external service configuration required.

## Deferred Human Verification

One end-of-phase device check: on Mark's iPad, which holds a version-8 profile, the built app (`npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server) opens with every recipe, version and batch it held, and Olive Oil's figures read as before. Nothing on screen shows the library, so the library half stays proven by the version-8 test in `library.test.js`.

## Next Phase Readiness
Ready for 06-03. `holdAfterLibraryStep(repository)` in `library.test.js` is the helper plan 03's Task 3 repeats the held-seed test with; the describe 'a change to a library entry moves no stored figure' is left open to its export and import leg. LIB-01 is complete; LIB-02 stays open until plan 03 (it also declares it). Suite: 87 files, 2744 tests passing; the build succeeds to a scratch outDir. Nothing under `app/src/ui`, `domain` or `data` changed.

---
*Phase: 06-the-ingredient-library-in-the-store*
*Completed: 2026-10-15*

## Self-Check: PASSED

- FOUND: app/src/store/repository.js, repository.test.js, seed.js, seed.test.js, library.test.js
- FOUND commits: 53ea329, aaa0b72, e1ad1cb
