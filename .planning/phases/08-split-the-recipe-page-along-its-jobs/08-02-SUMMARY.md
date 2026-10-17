---
phase: 08-split-the-recipe-page-along-its-jobs
plan: 02
subsystem: ui
tags: [react, hooks, refactor, pure-view-model, vitest, webkit-walk]

requires:
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: plan 01's walk check, the shell test's JOBS table and useAnnouncer (cut 1)
provides:
  - cut 2 of 6: useRecipeData.js, the eight repository reads and their state behind one hook, called once by RecipePage.jsx
  - cut 3 of 6: sheetView.js, the sheet's derived values as a pure function with a nullable baseline, plus markedFigure
  - sheetView.test.js, node tests for baseline null, baseline equals version, markedFigure and the openBatch order rule
affects: [08-03, 08-04, 08-05]

actuals:
  tokens: 6000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "A load hook returns its setters only where the page's own handlers still call them (setVersion, setVersions, setBatches, setRecipe)"
    - "A pure view model takes its comparison as an argument (baseline), so a caller with no stored version passes null and gets no diff"

key-files:
  created:
    - app/src/ui/useRecipeData.js
    - app/src/ui/sheetView.js
    - app/src/ui/sheetView.test.js
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.shell.test.js

key-decisions:
  - "useRecipeData returns exactly the sixteen names the plan lists; setCitedBatch, setParentVersion, setAllBatches, setBatchesLoaded, setDraftsLoaded, setVersionsLoaded and setLoadFailed stay private to the hook because the page never calls them"
  - "The useRecipeData call sits directly after useAnnouncer(), with a two-line comment, and the title effect stays in the shell ahead of the kept-draft block"
  - "sheetView's three baseline sites are the plan's: penDiff, penStaleSteps and the developing branch of baselineStepNumbers; the nested ternary got parentheses around the new inner one for readability, with the same result"

patterns-established:
  - "Phase 10's creation editor calls sheetView with baseline: null and gets penDiff null, penStaleSteps [], baselineStepNumbers null (D-09)"
  - "The shell test's JOBS entry for a pure module sets hook: false and allows only '../domain/'"

requirements-completed: []
requirements-advanced: [EDIT-05, EDIT-06]  # shared with plans 01, 03-05; REQUIREMENTS.md deliberately not touched by this plan

duration: 6min
completed: 2026-10-17
status: complete
commits: 2
plan_head_before: 20f56e7670acb29a68c38f3343cfc02f96c29271
plan_head_after: fa2f491044b1fada7a2761543f3c9c5aa0e7d40e
---

# Phase 8 Plan 02: Record loading and the pure sheet view Summary

**The eight store reads moved into `useRecipeData` and the sheet's derived values into a pure, node-tested `sheetView` whose baseline can be null; the walk still matches 94 snapshots after each cut.**

Base commit: 20f56e7670acb29a68c38f3343cfc02f96c29271

## Performance

- **Duration:** about 6 min
- **Completed:** 2026-10-17
- **Tasks:** 2 (both `type="auto"`, no checkpoints)
- **Files:** 5 (3 created, 2 modified)

## Accomplishments

- `useRecipeData(versionId)` owns the version, versions, batches, drafts, recipe, citedBatch, parentVersion and allBatches state, the four loaded flags and `loadFailed`, with the eight reads in source order, each keeping its `cancelled` flag, its `setLoadFailed(true)` catch and its dependency array. The shell calls it once, directly after `useAnnouncer()` and above `if (loadFailed) return`.
- `sheetView({ version, baseline, mode, penDraft, parentVersion, showingChanges, batches, batchId })` holds the old derivations; the editing page passes `baseline: version`, so every rendered value is what it was. With `baseline: null` it returns no pen diff, no stale steps and no baseline step numbers (D-09).
- `markedFigure(view, focusedFigureKey)` and `joinNames` moved beside it. `RecipePage.jsx` now declares only `PageLoadFailed`, `RecipeNotFound` and `RecipePage`, and dropped ten imports.
- The shell test names `useRecipeData` and `sheetView` positively, in `JOBS`, `NEW_MODULES` and (for the hook) `HOOK_ORDER`.

## Cut records

| Cut | Commit | Walk check | Suite (files / tests) | RecipePage.jsx lines |
|-----|--------|------------|-----------------------|----------------------|
| Start (after cut 1) | 87ed10e | MATCH 94 snapshots (plan 01) | 93 / 2949 | 1,781 |
| Cut 2, record loading | `1d2cad4381ad11e17655dd98b8031dc3a268bfbc` | MATCH 94 snapshots | 93 / 2953 | 1,596 |
| Cut 3, sheetView | `fa2f491044b1fada7a2761543f3c9c5aa0e7d40e` | MATCH 94 snapshots | 94 / 2963 | 1,505 |

Cut 2 added 4 cases (the new module through `NEW_MODULES`' three `it.each` checks and its `JOBS` case). Cut 3 added 10 (5 in `sheetView.test.js`, 4 through `NEW_MODULES` and `JOBS` for `sheetView.js`, 1 for the docblock check). Neither cut deleted, skipped or weakened a test.

`git show --stat` of cut 2 lists exactly `useRecipeData.js`, `RecipePage.jsx` and `RecipePage.shell.test.js`; cut 3 lists exactly `sheetView.js`, `sheetView.test.js`, `RecipePage.jsx` and `RecipePage.shell.test.js`.

## Test edits to existing shell-test cases

- "still loads its records through the repository seam" is retitled "still writes through the repository seam"; its assertion is unchanged (plan-prescribed).
- "declares no module-level function beyond joinNames, PageLoadFailed, RecipeNotFound and RecipePage" is retitled "declares no module-level function beyond PageLoadFailed, RecipeNotFound and RecipePage" and its expected list drops `'joinNames'` (plan-prescribed). This is the one removed `expect(` line plan 05's test audit allows.
- The "carries no jsdom docblock on its first line" list gained `./sheetView.test.js`.
- `HOOK_ORDER` became `['useAnnouncer()', 'useRecipeData(versionId)', 'useRecordDraft()']`.

## The `batches[0]` scratch check

Replacing `sortedBatches(batches)[0]` with `batches[0]` in `sheetView.js` turned the openBatch case red:

```
FAIL  src/ui/sheetView.test.js > sheetView openBatch > is the batch the address names, else the newest by the batch order rule
AssertionError: expected 'b-older' to be 'b-newest' // Object.is equality
 ❯ src/ui/sheetView.test.js:91:31
```

The frozen input `[older, newest, undated]` has the newest in the middle, so only the order rule finds it. The mutation was undone by hand (see Deviations), and the full suite and the walk ran afterwards on the restored file.

## Task Commits

1. **Task 1: cut 2, record loading moves into useRecipeData** - `1d2cad4381ad11e17655dd98b8031dc3a268bfbc` (refactor)
2. **Task 2: cut 3, the sheet derivations become the pure sheetView** - `fa2f491044b1fada7a2761543f3c9c5aa0e7d40e` (refactor)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The scratch-check restore command could not work on an untracked file**
- **Found during:** Task 2
- **Issue:** The plan restores the mutated file with `git checkout -- app/src/ui/sheetView.js`. At that point `sheetView.js` was not yet committed, so git answered `pathspec ... did not match any file(s) known to git` and left the mutation in place. The acceptance line "`git status --porcelain app/src/ui/sheetView.js` prints nothing" also cannot hold for a new file; it prints `??` until the commit.
- **Fix:** Restored the one line by hand (`sed`), confirmed with `grep` that `sortedBatches(batches)[0]` was back, and only then ran the full suite and the walk. The committed file contains no mutation.
- **Files modified:** `app/src/ui/sheetView.js` (restored before commit)
- **Commit:** fa2f491

**Total deviations:** 1 auto-fixed (blocking, in the scratch check procedure only). **Impact:** none on the committed code or behaviour.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. `useRecipeData.js` imports only `react` and `../store/repository.js` (T-08-04, pinned by the shell test's allow list); each of the eight reads keeps `setLoadFailed(true)`, asserted eight times (T-08-05); `sheetView.js` imports only `../domain/` and is node-tested (T-08-06). No package, network call, stored shape or database version changed.

## Issues Encountered

None.

## Next Phase Readiness

Plan 08-03 can start from `fa2f491`. For plans 03-05:

- `RecipePage.jsx` is 1,505 lines. The hook calls are `useAnnouncer()`, then `useRecipeData(versionId)`, then `useRecordDraft()`, all above `if (loadFailed) return`. The `sheetView({ version, baseline: version, … })` call and the `markedFigure(view, focusedFigureKey)` call sit directly after `waitingPlanDraft`.
- The shell destructures from `view` only: `hasRows`, `readingVersion`, `draftVersion`, `liveVersion`, `changeDiff`, `changeStaleSteps`, `penDiff`, `penStaleSteps`, `currentStepNumbers`, `baselineStepNumbers`, `openBatch`, `evidenceBatch`, `comparisonBatchLabel`. `figures` and `comparisonBatch` are returned by `sheetView` but the shell does not read them.
- `useRecipeData` hands back `setVersion`, `setVersions`, `setBatches` and `setRecipe`; the save handlers still call them from the shell. A later hook that needs those setters should take them as arguments.
- Base commit for the test audit stays `78e962d8c988d735cf5f3c505e049b480e77ad6b`. The two prescribed removals and retitles above are the only edits to existing shell-test cases in this plan.
- Walk check: `sh .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-check.sh`, no `08-walk-before.json` needed.

## Self-Check: PASSED

- Files exist: `app/src/ui/useRecipeData.js`, `app/src/ui/sheetView.js`, `app/src/ui/sheetView.test.js` (all present on disk).
- Commits are ancestors of HEAD: 1d2cad4, fa2f491.
- `git rev-list --count 20f56e7..fa2f491` is 2, matching `commits: 2`.
- Full suite 94 files, 2963 tests, 0 failed; walk check ends `MATCH 94 snapshots`.
