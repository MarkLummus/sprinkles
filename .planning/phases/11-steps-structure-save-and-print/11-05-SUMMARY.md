---
phase: 11-steps-structure-save-and-print
plan: 05
subsystem: print
tags: [print, sheet, react, webkit, sheet-code]
requires:
  - phase: 11-steps-structure-save-and-print
    provides: UNPLACED_STEP and the createRecipe optional fields (11-02, 11-03), createRecipeWithVersion and saveFirstVersionOver (11-03), the arrival pattern of 11-board-check.mjs (11-01)
provides:
  - "The printed unplaced head reads 'Not in a step yet' (D-12); a lone unplaced group is headed when the version has a live step and every line sits at UNPLACED_STEP (D-09)"
  - "Proof that a created recipe prints no empty heading and no blank band (D-13, D-27), in jsdom and in WebKit under print media"
  - "Proof that a created version's stored Sheet code finds it before and after a Save-over (MAKE-12, roadmap decision 19)"
affects: [11-13]
actuals:
  tokens: 21000
  tasks: 2
  commits: 2
plan_head_before: 619eba314d83e13a1c511aadb312ec0eee3e1767
plan_head_after: 9d79b2ace08251dfae02b9796c83a3002d8bb299
tech-stack:
  added: []
  patterns:
    - "A print check reads only the laid sheet: waits for data-print-ready, scopes to .print-route__pages .print-page--sheet, refuses any match under .ps-measure"
key-files:
  created:
    - app/src/store/sheet-code-created.test.js
    - .planning/phases/11-steps-structure-save-and-print/11-print-check.mjs
  modified:
    - app/src/ui/PrintSheetPages.jsx
    - app/src/ui/PrintSheetPages.test.jsx
key-decisions:
  - "The blank-band gap is measured net of the lower block's own top margin, because the closing foot stands 52 px below the Balance by design when no step precedes it"
requirements-completed: [MAKE-12]
status: complete
---

# Phase 11 Plan 05: Print and the Sheet code of a created recipe Summary

The built bench sheet already prints a created recipe; this plan renamed one head word to "Not in a step yet", let that head show over a lone unplaced group when the version has a live step, and proved in jsdom and in WebKit print media that missing notes, steps or targets leave nothing empty on paper.

## What changed

- `app/src/ui/PrintSheetPages.jsx`: the unplaced group's head reads "Not in a step yet" in place of "Unallocated". The lone-group rule gained one exception: the head shows when `activeSteps(version).length > 0` and every line of the group sits at `UNPLACED_STEP` (steps that use no row, D-09). An empty method, portions naming a step that does not exist, and a removed step still print a flat table (261002-wdn). print.css is untouched.
- `app/src/ui/PrintSheetPages.test.jsx`: seven `sheetBlocks` cases for created versions (Step 1 plus Not in a step yet, flat with no steps, headed when a step uses no row, and the three flat cases, plus the stored code in the foot) and five `useSheetPages` cases (no notes, no steps, no targets, no purpose or aside, every region heading followed by content). Red was seen before the change: the two head cases failed on the old code.
- `app/src/store/sheet-code-created.test.js`: a created recipe stored with `createRecipeWithVersion` is found by `findVersionsByCode`; after `saveFirstVersionOver` with steps and rows reversed and the recipe renamed, the same single version, id and stored code come back.
- `.planning/phases/11-steps-structure-save-and-print/11-print-check.mjs`: four seeded created recipes (no-notes-no-steps, steps-no-targets, steps-none-used, full) on the print route in WebKit at 1366 by 1024, under print media. 32 PASS, 0 FAIL on a scratch build.

## Verification

- Baseline in this worktree: 122 files, 3931 tests passing. After: 123 files, 3945 tests passing (14 added: 7 + 5 in PrintSheetPages, 2 in sheet-code-created).
- Task 1 verify (five test files): 141 passed. Task 2 verify: PrintSheetPages.test.jsx 89 passed; build to a scratch outDir; 11-print-check.mjs 32 PASS, 0 FAIL (the plan asked for at least 16).
- Acceptance greps: "Not in a step yet" 2, quoted 'Unallocated' outside comments 0, `entry.portion.step === UNPLACED_STEP` 1, print.css absent from the (11-05) commits.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The gap measure in the plan flags the closing foot's designed margin as a blank band**
- **Found during:** Task 2, first run of 11-print-check.mjs
- **Issue:** On a recipe with no steps the closing foot is a direct child of `.ps-page` (on the full recipe it sits inside `.ps-instructions`). It carries `margin-top: var(--gap-l)` above its ink rule, so the gap to the previous block read 52 px against the 21 px limit and the check failed on a correct sheet.
- **Fix:** the gap is measured less the lower block's own top margin (scaled as the page picture is), so it equals the page's row gap; all four recipes measure 20 px against a 21 px limit. The measure still catches an empty block or a section with a blank band, since either adds height beyond the row gap.
- **Files modified:** `.planning/phases/11-steps-structure-save-and-print/11-print-check.mjs`
- **Commit:** 9d79b2ac

**2. [Plan wording] Notes fixture shape**
- The plan did not name the shape of a Before you start note; the fixtures use `{ text }`, the shape `NoteList` reads. Test-only.

No other deviations. No files outside the plan's `files_modified` were touched; Method.jsx, StepReading.jsx, notebook.css and diff.js (plan 11-04) were not.

## Notes for Mark and Sid

The printed sheet of a first version with unplaced rows now reads "Not in a step yet" (D-12), also when its steps use no row at all (D-09); a version with no steps still prints a flat table (261002-wdn). No board draws the saved or printed case; Sid is told, no redraw. No PDF was made here (no Chromium); the iPad PDF is the print evidence (D-20, plan 11-13, which reruns 11-print-check.mjs on the final build).

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path or file access; the print check reaches 127.0.0.1 only and writes nothing under app/dist (T-11-17, T-11-50 mitigated as planned). T-11-16 is covered by sheet-code-created.test.js.

## Self-Check: PASSED

- FOUND: app/src/store/sheet-code-created.test.js
- FOUND: .planning/phases/11-steps-structure-save-and-print/11-print-check.mjs
- FOUND commits 1d95cedd and 9d79b2ac (ancestors of HEAD)
