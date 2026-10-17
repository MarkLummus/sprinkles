---
phase: 08-split-the-recipe-page-along-its-jobs
plan: 06
subsystem: testing
tags: [react, vitest, source-text-pin, test-audit, gap-closure, wr-01, wr-02]

requires:
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: RecipeSheet.jsx and its test (08-03), the shell test and 08-test-audit.mjs (08-05), the verification gap and review findings
provides:
  - a source-text pin on the third Show changes hop (RecipeSheet to IngredientsHead), restoring ROADMAP criterion 4
  - RecipeSheet no longer throws on its own draft = null default in recording mode
  - 08-test-audit.mjs check (E) with a narrow additions-only allowance for RecipeSheet.test.jsx
  - 08-REVIEW-DISPOSITION.md with WR-01, WR-02, IN-01 fixed and IN-02, IN-03 deferred, open 0
affects: [phase-08-reverification, phase-10]

actuals:
  tokens: 2900
  tasks: 3
  commits: 4

plan_head_before: 545b7e8872c3e5b314d9c8576269df1cd755e5ad
plan_head_after: 6005c2753e8cadc42bcd6bf27b60c7efbcb3a040

tech-stack:
  added: []
  patterns:
    - "A pin the D-11 re-point cannot reach sits beside the moved component's own tests, in the comment-stripped source-text idiom"
    - "An audit allowance names one file and its creating commit: lines may be added, none lost, and the expect( count must grow"

key-files:
  created: []
  modified:
    - app/src/ui/RecipeSheet.test.jsx
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/useBatchRecording.js
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-test-audit.mjs
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-REVIEW-DISPOSITION.md

key-decisions:
  - "The WR-01 pin lives in RecipeSheet.test.jsx, not Test I: D-11 limits RecipePage.test.jsx to read-target edits and audit check (C) enforces it, so that file stays byte-identical to 1b0dcab"
  - "The WR-02 guard covers RecipeSheet's own read only; IngredientTable.jsx still reads the draft in recording mode and is left alone"

requirements-completed: [EDIT-05, EDIT-06]

coverage:
  - id: D1
    description: "RecipeSheet hands onToggleShowChanges to its one IngredientsHead tag, pinned by a source-text case that fails on a no-op prop"
    requirement: EDIT-06
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeSheet.test.jsx#passes onToggleShowChanges to its one IngredientsHead tag"
        status: pass
    human_judgment: false
  - id: D2
    description: "RecipeSheet in recording mode with no draft draws its Instructions with recording controls and no step changes instead of throwing"
    requirement: EDIT-05
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeSheet.test.jsx#steps and no rows: the Instructions draw the recording controls with no step changes"
        status: pass
    human_judgment: false
  - id: D3
    description: "08-test-audit.mjs still ends AUDIT OK, allows additions to RecipeSheet.test.jsx only, and fails on a removed line"
    verification:
      - kind: other
        ref: "node .planning/phases/08-split-the-recipe-page-along-its-jobs/08-test-audit.mjs 78e962d"
        status: pass
    human_judgment: false
  - id: D4
    description: "Review dispositions recorded: WR-01, WR-02, IN-01 fixed; IN-02, IN-03 deferred; open 0"
    verification: []
    human_judgment: true
    rationale: "A planning ledger; Mark may disagree with a deferral"

duration: 2min
completed: 2026-10-17
status: complete
---

# Phase 8 Plan 06: Gap closure for WR-01 and WR-02 Summary

**A source-text case pins RecipeSheet's third Show changes hop to IngredientsHead, RecipeSheet's recording read is guarded against a missing draft, and the review findings are dispositioned with open 0.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-10-17T18:03:27Z
- **Completed:** 2026-10-17T18:05:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- WR-01 closed (ROADMAP criterion 4): a new case in RecipeSheet.test.jsx fails if RecipeSheet.jsx stops handing `onToggleShowChanges={onToggleShowChanges}` to its one `<IngredientsHead>` tag. Test I in RecipePage.test.jsx still pins hops 1 and 2 in the shell, and RecipePage.test.jsx is byte-identical to 1b0dcab (D-11).
- WR-02 closed: `RecipeSheet.jsx` reads `(draft?.stepChanges ?? {})` in recording mode, test first. The maker sees no change, since the shell always passes `draft`.
- IN-01 closed: two stale comments reworded (ten changed lines, all comment lines).
- 08-test-audit.mjs gained one enumerated allowance for RecipeSheet.test.jsx and still fails on a removed line.
- 08-REVIEW-DISPOSITION.md: WR-01, WR-02, IN-01 fixed with commits; IN-02, IN-03 deferred with reasons; `open: 0`.

## Task Commits

1. **Task 1: pin the Show changes hop (WR-01), audit allowance** - `7367a56` (test)
2. **Task 2: guard the recording read of a missing draft (WR-02)** - `eb6a23d` (fix)
3. **Task 3a: reword two stale comments (IN-01)** - `db52d5a` (docs)
4. **Task 3b: record the review dispositions** - `6005c27` (docs)

**Plan metadata:** the docs(08-06) completion commit that follows this file.

## Evidence

**WR-01 mutation** (`onToggleShowChanges={onToggleShowChanges}` replaced by `onToggleShowChanges={() => {}}` in RecipeSheet.jsx, restored by `git checkout --`):

- `npm --prefix app test -- RecipeSheet`: 1 failed, 6 passed. The failing case is `passes onToggleShowChanges to its one IngredientsHead tag, the third hop after VersionRow and RecipeSheet in the shell (Test I)`.
- `npm --prefix app test -- RecipePage.test`: 111 passed, 0 failed. As expected, Test I alone cannot see the third hop, which is why the new case is what restores the protection.

**WR-02 red run** (before the guard, working tree only, not committed):

```
FAIL  src/ui/RecipeSheet.test.jsx > RecipeSheet in recording mode with no draft (WR-02) > steps and no rows: the Instructions draw the recording controls with no step changes
TypeError: Cannot read properties of null (reading 'stepChanges')
Tests  1 failed | 7 passed (8)
```

**Audit, `Gap-closure additions (08-06)` section** (run ends `AUDIT OK`):

```
Gap-closure additions (08-06)
  app/src/ui/RecipeSheet.test.jsx since b2264ca
    describe('RecipeSheet hands Show changes on to IngredientsHead (WR-01, 261002-wn1)', () => {
    it('passes onToggleShowChanges to its one IngredientsHead tag, the third hop after VersionRow and RecipeSheet in the shell (Test I)', () => {
```

(At Task 1 time the section listed these two lines. After Task 2 it also lists the WR-02 describe and it lines.)

**Teeth check** (the `Whole milk` expect line deleted from RecipeSheet.test.jsx after the Task 1 commit, audit run, file restored):

```
AUDIT FAIL phase test app/src/ui/RecipeSheet.test.jsx lost a line since b2264ca: -    expect(markup).toContain('Whole milk');
```

**Suite totals:** baseline 96 files, 2998 tests. After Task 1: 96 files, 2999 tests. After Task 2: 96 files, 3000 tests. After Task 3a: 96 files, 3000 tests. Task 3b touched a planning file only. The audit ended `AUDIT OK` after each task.

## Files Created/Modified

- `app/src/ui/RecipeSheet.test.jsx` - two imports, the `stepsOnly` fixture, the WR-01 describe and the WR-02 describe (additions only, no existing line changed)
- `app/src/ui/RecipeSheet.jsx` - one expression: the Method `stepChanges` prop's recording branch
- `app/src/ui/RecipePage.jsx`, `app/src/ui/useBatchRecording.js` - comment lines only (IN-01)
- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-test-audit.mjs` - `ADDITIONS_ONLY`, `parseDiff(file, from = base)`, the printed section
- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-REVIEW-DISPOSITION.md` - the five dispositions

## Decisions Made

- The pin sits beside RecipeSheet's tests rather than in Test I, because D-11 (and audit check C) forbid any assertion edit in RecipePage.test.jsx.
- IN-02 (third copy of `joinNames`) and IN-03 (literal counts in shell-test markers) are deferred, with the reasons recorded in the ledger.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Note for whoever next mounts a recording Sheet without a draft

IngredientTable.jsx still reads the draft's as-made values in recording mode (lines 342 and 525, behind IngredientTable's own `draft = null` default). A recording Sheet over a version WITH rows and no draft still throws from there. This is pre-existing code outside Phase 8's files and was not touched. The record pen always passes a draft, and creation never records (D-01). A comment beside the WR-02 case in RecipeSheet.test.jsx names the limit.

## Known Stubs

None.

## Threat Flags

None. No new input surface, store access, network call or trust boundary.

## Next Phase Readiness

- The VERIFICATION.md gap is closed in code and tests. Re-verification should set EDIT-05 and EDIT-06; REQUIREMENTS.md was not edited here.
- No Mark's List row: the plan has no device check (D-07) and left no decision.

## Self-Check: PASSED

- Commits `7367a56`, `eb6a23d`, `db52d5a`, `6005c27` are ancestors of HEAD.
- `app/src/ui/RecipePage.test.jsx` is identical to 1b0dcab; `git status --porcelain app/` prints nothing.
- Full suite 96 files, 3000 tests; audit ends `AUDIT OK`.

---
*Phase: 08-split-the-recipe-page-along-its-jobs*
*Completed: 2026-10-17*
