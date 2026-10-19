---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 06
subsystem: store
tags: [sheet-code, indexeddb, repository, transaction, uniqueness, vitest]

requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-02: the stored Sheet code and codeFromVersionId; 09-04: the create draft kind"
provides:
  - "sheetCodeProblems and SheetCodeError: the pure uniqueness and immutability check and the error the store throws"
  - "repository.createVersion and a code-checking repository.saveVersion, each one readwrite transaction"
  - "Save as a new version stores the child through createVersion; a clash reads as a failed save and keeps the pen"
  - "a committed colliding pair of version ids (COLLIDING_ID_A, COLLIDING_ID_B)"
affects: [09-10 (import calls sheetCodeProblems inside importStore and importAll), Phase 11 (Save stores its first version through the same rule)]

actuals:
  tokens: 8900
  tasks: 3
  commits: 4
plan_head_before: 6988235379874d72667c3ed24518f621ba2675a8
plan_head_after: 84d576eedc6d7ff7f328c4ce937c23178e705f2b

tech-stack:
  added: []
  patterns:
    - "A uniqueness rule that spans records is checked by the read, the pure check and the put sharing one readwrite transaction (putVersionChecked), aborted by hand on a problem as importAll does"
    - "Throw TypeError for a caller bug (a version with no canonical code) before the transaction opens; throw SheetCodeError, carrying the problems, for a clash"

key-files:
  created: []
  modified:
    - app/src/domain/sheetCode.js
    - app/src/domain/sheetCode.test.js
    - app/src/store/repository.js
    - app/src/store/repository.test.js
    - app/src/ui/useVersionPen.js
    - app/src/ui/RecipePage.shell.test.js
    - app/src/ui/RecipePage.perStep.test.jsx
    - app/src/ui/RecipePage.beforeYouStart.test.jsx
    - app/src/ui/RecipePage.drafts.test.jsx

key-decisions:
  - "createVersion and saveVersion share one module-level helper (putVersionChecked) rather than two copies of the transaction"
  - "The colliding id pair lives in sheetCode.test.js and is repeated in repository.test.js, because a test file cannot be imported without re-registering its tests"
  - "No production change was needed for the refused-save UI case: the existing catch in handleSaveAsNewVersion already keeps the pen and announces VERSION_SAVE_ERROR"

requirements-completed: [CODE-01]

coverage:
  - id: D1
    description: "sheetCodeProblems reports clashes (each pair once, stable order) and changed codes over the store as it would stand after the incoming versions replace stored ones"
    requirement: CODE-01
    verification:
      - kind: unit
        ref: "app/src/domain/sheetCode.test.js#sheetCodeProblems (uniqueness and immutability, D-04a, D-04b)"
        status: pass
    human_judgment: false
  - id: D2
    description: "repository.createVersion refuses a clashing code with a SheetCodeError and writes nothing; a missing or non-canonical code is a TypeError before the transaction opens"
    requirement: CODE-01
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#createVersion, through the repository seam (CODE-01, D-04, D-04a)"
        status: pass
    human_judgment: false
  - id: D3
    description: "repository.saveVersion refuses a changed code or a code another version holds, never counts a version's own code as a clash, and stores an id with no stored record"
    requirement: CODE-01
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#saveVersion, through the repository seam (CODE-01, D-04b)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Two repositories over one database creating a committed colliding pair store exactly one"
    requirement: CODE-01
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#two tabs creating at once (D-04a)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Save as a new version stores the child through createVersion; a refused creation announces the save error, keeps the pen with the typed Version name and amount, stores nothing, and a second press stores them"
    requirement: CODE-01
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.perStep.test.jsx#a refused save keeps the pen and everything typed in it (CODE-01, D-04)"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipePage.shell.test.js (useVersionPen job: saveVersion( at 1, createVersion( at 1)"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-10-19
status: complete
---

# Phase 09 Plan 06: Sheet code uniqueness inside the write transaction Summary

**A new or corrected version is stored by one readwrite transaction that reads every stored version, runs the pure sheetCodeProblems check and only then puts, so a clashing or changed Sheet code is refused with a SheetCodeError and never re-drawn.**

## Performance

- **Duration:** about 6 min
- **Started:** 2026-10-19T00:44Z
- **Completed:** 2026-10-19T00:51Z
- **Tasks:** 3 of 3
- **Files modified:** 9

## Accomplishments

- `sheetCodeProblems(stored, incoming)` and `SheetCodeError` in the domain: clash (each pair once, in code then id order) and changed (stored record of the same id has a different code), a version never a clash with itself, a code-less version in no clash.
- `repository.createVersion` (TypeError before the transaction for a missing or non-canonical code, SheetCodeError for a clash) and a code-checking `repository.saveVersion`, both through one helper in one readwrite transaction. Two repositories over one database creating the committed colliding pair store exactly one.
- Save as a new version now stores the child through `createVersion`; the existing catch announces `VERSION_SAVE_ERROR`, keeps the pen with everything typed, and a second press stores it. Save over still uses `saveVersion`.
- The page's tests moved onto the new write: createVersion mocks in perStep, beforeYouStart and drafts; the shell source contract pins one `saveVersion(` and one `createVersion(` in useVersionPen.

## Task Commits

1. **Task 1 (tracer): a new version is stored through one transaction that refuses a clashing code** - `044446cb` (feat)
2. **Task 2: save over keeps its own code, and two tabs creating at once store one version** (TDD)
   - RED `c9e3325d` (test), GREEN `9e7f135b` (feat); no refactor commit needed
3. **Task 3: a refused save keeps the pen and everything typed in it** - `84d576ee` (test)

**Plan metadata:** the commit that adds this file (docs).

## TDD Gate Compliance

- **Task 2 RED:** `c9e3325d` added the saveVersion cases and the two-tabs case. The run (vitest, `src/store/repository.test.js`) failed 2 of 30: "refuses a version whose stored record has a different code" and "refuses a version whose code is another stored version's code", each on `expect(error).toBeInstanceOf(SheetCodeError)` receiving the version id that `db.put` resolved with. Semantic assessment: the targets ran and failed on the planned assertion for the intended reason (saveVersion did no check). The same-code and new-id cases and the two-tabs case passed already, correctly: the first two describe behaviour the old put already had, and the two-tabs case is covered by createVersion from Task 1. The RED evidence was inspected by hand; the `check tdd-red-evidence` classifier was not run.
- **Task 2 GREEN:** `9e7f135b`; repository tests 335 passed.
- **Task 3 (tdd="true") had no failing RED.** Its behaviour (pen kept, text kept, retry stores) already holds because `handleSaveAsNewVersion`'s catch keeps the pen; the plan anticipated this ("it should not" need a production change). It is a single test commit, an unexpected-green by design, so no `feat` commit exists for it.

## Files Created/Modified

- `app/src/domain/sheetCode.js` - sheetCodeProblems, SheetCodeError
- `app/src/domain/sheetCode.test.js` - the colliding id pair and the sheetCodeProblems cases
- `app/src/store/repository.js` - putVersionChecked; createVersion; saveVersion now checks
- `app/src/store/repository.test.js` - createVersion, saveVersion and two-tabs cases
- `app/src/ui/useVersionPen.js` - the child is stored through createVersion; comment updated
- `app/src/ui/RecipePage.shell.test.js` - useVersionPen markers: saveVersion( at 1, createVersion( at 1; shellLacks gains createVersion
- `app/src/ui/RecipePage.perStep.test.jsx`, `RecipePage.beforeYouStart.test.jsx` - createVersion mock; saves of a new version wait on it; perStep gains the refused-save case
- `app/src/ui/RecipePage.drafts.test.jsx` - createVersion mock; both restore cases assert neither write happened

## Decisions Made

- One shared helper for the checked write instead of two transaction copies (see deviation 1).
- The colliding ids `collide-1avm4ex8s` and `collide-1p5a0rvy0` (both code `XSRT-M4HJ`) were found by a throwaway birthday search (not committed). Sequential suffixes (`collide-<n>`) never collided in 5 million tries: FNV-1a's top 40 bits stay distinct when only trailing bytes change, so the search varied the whole tail.
- `createVersion` and the repository seam import `normaliseCode`, `sheetCodeProblems` and `SheetCodeError` from the domain; the domain still imports no store.

## Deviations from Plan

### Auto-fixed Issues

None needed fixing. One acceptance criterion is met in spirit, not letter:

**1. [Deviation - acceptance criterion] `grep -c "sheetCodeProblems(" app/src/store/repository.js` returns 1, not 2 or more**
- **Found during:** Task 2
- **Issue:** the criterion expected one call in createVersion and one in saveVersion. Both now go through `putVersionChecked`, which holds the single call; duplicating the transaction in each method to satisfy a grep would be the larger, worse code.
- **Verification:** both paths are proven by tests (createVersion clash and TypeError cases, saveVersion changed and clash cases, the two-tabs case).
- **Commit:** `9e7f135b`

**Total deviations:** 1 (a grep count that proxied for "both write paths check"; behaviour fully covered).

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None. T-09-12, T-09-13 and T-09-35 are mitigated as the plan's register says, and each is proven by a test above.

## Test Count

`npm --prefix app test`: 104 files, 3245 tests passing (baseline 3224, +21).

## Self-Check: PASSED

- Files modified exist and are committed; commits `044446cb`, `c9e3325d`, `9e7f135b`, `84d576ee` are ancestors of HEAD.
- All Task 1 and Task 3 acceptance greps pass; Task 2's grep count differs as noted in deviation 1.
