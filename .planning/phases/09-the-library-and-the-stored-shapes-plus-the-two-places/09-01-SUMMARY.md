---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 01
subsystem: data
tags: [converter, ingredient-library, mapping, stages, before-walk, vitest]
requires:
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: 08-walk.mjs and its server, the 94-snapshot walk this phase's before-walk copies
provides:
  - "Offline converter (app/scripts/convert-ingredient-seed.mjs) turning the 103-row ingredient dataset into the reviewed library module"
  - "app/src/data/library-seed-db.js: 85 new library entries, each owning the six D-20 keys, not yet imported by the app"
  - "app/scripts/ingredient-mapping.json: same/different/renamed calls, coefficients, existingCoefficients for the 26, approved by Mark"
  - "app/scripts/ingredient-seed-checks.json and ingredient-review.md for plan 09-07's gate"
  - "app/src/domain/stages.js: STAGE_IDS, the twelve fixed stage ids"
  - "09-walk-before.json: 94 snapshots recorded from a build of base commit 710a528, with 09-walk.mjs, 09-walk-check.sh and 09-walk-record-base.sh"
affects: [09-07, 09-09, 09-16, 09-17, phase-10]
requirements-completed: [LIB-04, LIB-05, LIB-07]
actuals:
  tokens: 98000
  tasks: 3
  commits: 3
plan_head_before: b4691b335a2cde3abccf5872603194d8968ec678
plan_head_after: e7335965
tech-stack:
  added: []
  patterns:
    - "Dataset strings reach generated code only through JSON.stringify of the whole entries object"
    - "Reviewed mapping file is the gate: approvedBy/approvedAt recorded in it before any plan seeds the library"
key-files:
  created:
    - app/scripts/convert-ingredient-seed.mjs
    - app/scripts/convert-ingredient-seed.test.mjs
    - app/scripts/ingredient-review.md
    - app/scripts/ingredient-seed-checks.json
    - app/src/data/library-seed-db.js
    - app/src/domain/stages.js
    - app/src/domain/stages.test.js
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-check.sh
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-record-base.sh
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-before.json
  modified:
    - app/scripts/ingredient-mapping.json
key-decisions:
  - "Mark approved the mapping as listed (look-p9-library-mapping: approved); no converter rule or mapping entry changed"
  - "Coconut milk is a different product (decide-p9-library-coconut-milk: different); the converter's proposal, coconutMilk208, stands"
  - "decide-p9-boot-check-scope answered keep and decide-p9-version-style answered style-copy, both the recommended options"
duration: continuation of two earlier task runs
completed: 2026-10-19
status: complete
---

# Phase 9 Plan 01: Ingredient converter, reviewed mapping and before-walk Summary

**An offline converter turns Mark's 103-row ingredient dataset into 85 reviewed library entries (each owning the six D-20 keys) plus a checks file and review list, the mapping is approved by Mark and recorded in ingredient-mapping.json, and the phase's 94-snapshot before-walk is recorded from a build of base commit 710a528.**

## Performance

- **Tasks:** 3 (Task 1 tracer, Task 2 before-walk and list rows, Task 3 Mark's approval)
- **Files modified in this continuation:** 1 (`app/scripts/ingredient-mapping.json`)
- **Completed:** 2026-10-19

## Accomplishments

- Converter, generated module, checks file and review list (Task 1): 103 dataset ingredients become 85 new entries (2 different products) and 18 same pairs; 13 flagged rows and 1 open call (coconut-milk). `STAGE_IDS` added in `app/src/domain/stages.js`.
- Before-walk (Task 2): `09-walk-before.json` recorded from a detached worktree build of 710a528; a second record compares MATCH 94 snapshots. The Mark's List rows were written by the orchestrator (see below).
- Approval (Task 3): Mark answered "approved" on look-p9-library-mapping and "different" on decide-p9-library-coconut-milk. `ingredient-mapping.json` now carries `"approvedBy": "Mark"` and `"approvedAt": "2026-10-19T00:43:37.000Z"` (read from the clock just before the write). Re-running the converter changed nothing else: `git status` showed only `ingredient-mapping.json` modified, so the module, the checks file and the review list are byte-identical.
- Full suite: `npm --prefix app test` passes, 104 files, 3224 tests (the baseline on this base, unchanged).

## Task Commits

1. **Task 1: Converter, mapping, review list, checks file, generated module, STAGE_IDS (tracer)** - `5897ec2a` (feat)
2. **Task 2: Before-walk at base 710a528** - `7fbc4f81` (test)
3. **Task 3: Mark approves the mapping, recorded in the mapping file** - `e7335965` (chore)

**Plan metadata:** this SUMMARY.md (docs commit follows).

## Files Created/Modified

- `app/scripts/convert-ingredient-seed.mjs` - the offline converter (pure rules plus `runConverter`)
- `app/scripts/convert-ingredient-seed.test.mjs` - converter tests (known answers, D-10a exceptions, edge cases)
- `app/scripts/ingredient-mapping.json` - reviewed same/different/renamed calls, coefficients, existingCoefficients; now with approvedBy and approvedAt
- `app/scripts/ingredient-review.md` - the list Mark reviewed (Counts, Same pairs, Different products, Near names, Flagged rows, Keys changed, Coefficients, Existing entries)
- `app/scripts/ingredient-seed-checks.json` - dataset figures, same pairs with differs, entries map and the existing-26 object for plan 09-07's gate
- `app/src/data/library-seed-db.js` - generated `librarySeedDb`, not yet imported
- `app/src/domain/stages.js`, `stages.test.js` - `STAGE_IDS`, frozen, pinned by test
- `.planning/phases/09-.../09-walk.mjs`, `09-walk-check.sh`, `09-walk-record-base.sh`, `09-walk-before.json` - the phase's walk and its baseline

## Mark's List rows (read back by the orchestrator)

ArtifactData is not among this executor's tools, so the executor did not touch the list. The orchestrator wrote the rows in Task 2, read the two below back with ArtifactData `get`, and quotes follow verbatim. **The orchestrator, not this executor, closes look-p9-library-mapping and decide-p9-library-coconut-milk** (status done, resolvedAt, reply), as Task 3's resume-signal asks; they are still open on the list as far as this plan knows.

### decide-p9-boot-check-scope (read back at version 1; Mark has since answered "keep")

detail: "D-17's scope (the library and the four tables checked at boot) and its damaged-entry wording were Claude's reading of 'refuse a bad row'; you may narrow it. Claude also added a rule: Sprinkles holds exactly four core scales (CORE_SCALE_COUNT in app/src/domain/catalog.js, plan 09-04). The boot check refuses a scales table without exactly four core scales (plan 09-11); an import is refused when its merged scales table would hold another number (plan 09-10); and a batch's snapshot carries the four, an imported batch whose snapshot holds another number being refused (plan 09-14). Why: the record pen's desktop grid has four places, one per core scale (plan 09-12), so another number would show different scales on a wide screen and a narrow one. It can be lifted later in code (the constant and the desktop grid in BatchRow.jsx), with no stored record changed. Those plans have not run when this row is written. The phase builds the recommended option, keep, whatever the row says; another answer is acted on after the phase, through /marks-list."

options:
- keep (recommended): As planned: the library and the four tables are checked at boot, a damaged row shows "Sprinkles can’t open: its list of <table> has a damaged entry.", and the four-core-scale rule stays
- tables-only: The library is not checked at boot; the four tables are, and the four-core-scale rule stays
- lift-core-count: The boot check, the import and batch snapshots accept any number of core scales; Sid first redraws the record pen's desktop grid, which has four places, and a quick task then builds it; the library stays checked at boot

### decide-p9-version-style (read back at version 1; Mark has since answered "style-copy")

options:
- style-copy (recommended): The version keeps a copy of the picked style's row as it was, as a version keeps its machine's figures (D-13), so a later edit to the styles table moves nothing stored and the v2.1 balance model reads the version's own equipment class and calibration family
- style-id: The version keeps only the style's id, so a later edit to that style row changes what the version says its style is
- figures-only: The version keeps the bands and serving temperature the style filled in, and which style was picked is not kept

Mark's answers (keep, style-copy) match the recommended options, so the phase builds as planned; style-copy is the shape for Phase 11's Save and is wanted before Phase 10 is planned.

### Other rows

- look-p9-library-mapping: answered "approved".
- decide-p9-library-coconut-milk: answered "different" (the app's coconut milk and the dataset's are different products; coconutMilk208 stands).

## Decisions Made

- No change to the mapping or converter rules: Mark approved the list as it stood, so the converter's proposals (whole milk 3.25% different, coconut milk different, solids-trusted reading of the two inconsistent rows, the D-20 coefficient readings, cultured dairy acidity null) are final.

## Deviations from Plan

None - plan executed exactly as written. The one difference of form: Task 3's resume-signal also asks the executor to close the two list rows, but ArtifactData is not available to this executor, so the orchestrator closes them (see above). Nothing was written to the list or claimed about it from here.

**Total deviations:** 0

## Issues Encountered

- The worktree had no `app/node_modules`; the main checkout's was symlinked (not staged, ignored by git). No package was installed.
- `commits:` in the frontmatter is 3, counted from `git log --grep='(09-01)'`. The per-plan HEAD ledger from protocol 0c belonged to the earlier executor runs and is not in this worktree, so `plan_head_before` is the parent of Task 1's commit and a `rev-list` range from it would also count other plans' merged commits.

## Known Stubs

None. `app/src/data/library-seed-db.js` is deliberately not imported until plan 09-07; that is the plan's design, not a stub.

## Threat Flags

None. No new network endpoint, auth path or trust-boundary surface beyond the plan's threat model (the converter is offline, Node built-ins only).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 09-07 and 09-09 may now seed the library: the mapping is approved and recorded (`approvedBy`, `approvedAt`).
- The orchestrator still owes the closing of look-p9-library-mapping and decide-p9-library-coconut-milk on Mark's List.
- The before-walk baseline is ready for plan 09-16's allow-list compare.

## Self-Check: PASSED

- `app/scripts/ingredient-mapping.json` carries approvedBy and approvedAt; FOUND
- Commits `5897ec2a`, `7fbc4f81`, `e7335965` are on this branch's history; FOUND
- Full suite: 3224 passed

---
*Phase: 09-the-library-and-the-stored-shapes-plus-the-two-places*
*Completed: 2026-10-19*
