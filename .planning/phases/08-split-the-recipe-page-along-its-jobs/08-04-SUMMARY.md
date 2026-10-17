---
phase: 08-split-the-recipe-page-along-its-jobs
plan: 04
subsystem: ui
tags: [react, refactor, hooks, strictmode, kept-drafts, vitest, webkit-walk]

requires:
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: plan 03's RecipeSheet, and plans 01-02's announcer, record loading, sheetView and the shell test's job table
provides:
  - cut 5 of 6: useVersionPen.js (the version-pen job) and useDraftWriter in useKeptDraft.js (the effect-free draft writer)
  - cut 6 of 6: useKeptDraft in useKeptDraft.js (the restore, persist and pagehide effects)
  - useKeptDraft.test.jsx, two hook-level StrictMode tests with the mutation checks that prove they have teeth
  - the announce describe in RecipePage.test.jsx re-pointed to read RecipePage.jsx and useVersionPen.js together (D-11)
affects: [08-05, phase-09, phase-10]

actuals:
  tokens: 14000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "An effect-free writer (refs, flush, discard) is called before the pen hook, and the effectful hook is called after it and takes the pen's restore as a callback, so two mutually dependent jobs initialise acyclically"
    - "A StrictMode restore-once test is a hook-level mount with the records present at the first render and every record input passed explicitly, over a harness whose restore callback opens the pen the way the page does"

key-files:
  created:
    - app/src/ui/useVersionPen.js
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/RecipePage.shell.test.js

key-decisions:
  - "useDraftWriter(versionId) holds draftStoredRef, pendingDraftRef, draftTimerRef, flushPendingDraft and discardDraft and declares no effect; the shell calls it, then useVersionPen, then useKeptDraft, each above the early returns"
  - "useVersionPen returns restorePlan(payload, penOpenedAt), the five statements the restore effect's plan branch held; useKeptDraft receives it as onRestorePlan, and the record branch's two statements stay in the shell as an inline onRestoreRecord"
  - "VERSION_SAVED_STATUS, VERSION_SAVE_ERROR, VERSION_BLOCKED_STATUS and DRAFT_KEPT_STATUS stay importable from RecipePage.jsx through re-exports, so no test's import line changed"

patterns-established:
  - "Phase 9's create draft kind widens useKeptDraft's record branch; its arguments (writer, the record inputs, onRestorePlan, onRestoreRecord) are the contract"
  - "The shell test's JOBS entry for an effect hook sets hook: true with markers that count the repository calls and the guard line"

requirements-completed: []
requirements-advanced: [EDIT-05, EDIT-06]  # shared with plan 05; REQUIREMENTS.md deliberately not touched by this plan

duration: 5min
completed: 2026-10-17
status: complete
commits: 2
plan_head_before: 5094603a5adedf1ceac24157a21e72b279f2421e
plan_head_after: c5e6cc0f0b903b0a0af6c3922aa4b443b8716db8
---

# Phase 8 Plan 04: The version pen and the kept drafts as hooks Summary

**The version pen now lives in `useVersionPen` and the kept draft in an effect-free `useDraftWriter` plus an effectful `useKeptDraft`, wired in an acyclic order above the early returns; a hook-level StrictMode test proves the draft is read and restored once, and three recorded mutations turn it red.**

Base commit: 5094603a5adedf1ceac24157a21e72b279f2421e

## Performance

- **Duration:** about 5 min
- **Completed:** 2026-10-17
- **Tasks:** 2 (both `type="auto"`, no checkpoints)
- **Files:** 6 (3 created, 3 modified)

## Accomplishments

- `useVersionPen({ version, versions, batches, setMode, setVersion, setVersions, announce, onPageStatus, discardDraft, navigate })` wraps `usePenDraft()` and owns `versionSaveAction`, the save lock, `penOpenedAtRef`, start, cancel, the eleven edit handlers, both saves, and `restorePlan(payload, penOpenedAt)`. Handler bodies moved byte-identical; `announce` and `onPageStatus` keep those names.
- `useDraftWriter(versionId)` holds the three draft refs, `flushPendingDraft` and `discardDraft`, with no effect and no knowledge of pens (D-08). The shell test checks that with a failing fixture.
- `useKeptDraft({ writer, versionId, recipeId, batchId, version, batches, batchesLoaded, loadFailed, mode, amendingBatchId, penDraft, draft, amendBaseline, amendOpener, penOpenedAtRef, onRestorePlan, onRestoreRecord, onPageStatus, navigate })` owns `draftRestoreDone`, the started-ref guard, `modeRef` and the restore, persist and pagehide effects, with their dependency arrays verbatim and persist before pagehide. The restore keeps `if (draftRestoreStartedRef.current) return;`, has no cancellation cleanup, and the amend-redirect branch returns without `setDraftRestoreDone(true)`.
- `RecipePage.jsx` went from 1,351 to 992 lines. The hook calls above the early returns are now `useAnnouncer`, `useRecipeData`, `useRecordDraft`, `useDraftWriter`, `useVersionPen`, `useKeptDraft`, then `useBelowDesktop`, `useBelow724` and the Batch fold's `useFold(true)`. The two route-intent effects, the Escape effect and the Import-guard effect stay in the shell for plan 05.

## Cut record

| Cut | Commit | Walk check | Suite (files / tests) | RecipePage.jsx lines |
|-----|--------|------------|-----------------------|----------------------|
| Start (after plan 03) | 5094603 | MATCH 94 snapshots | 95 / 2973 | 1,351 |
| Cut 5, useVersionPen and useDraftWriter | `5dcf66a206e0a76ff45c385becea9a362f1b262d` | MATCH 94 snapshots | 95 / 2983 | 1,105 |
| Cut 6, useKeptDraft | `c5e6cc0f0b903b0a0af6c3922aa4b443b8716db8` | MATCH 94 snapshots | 96 / 2988 | 992 |

Cut 5 added 10 tests (the two new modules through `NEW_MODULES`' three `it.each` checks each, two JOBS cases, the `usePenDraft()` case and two writer cases, minus the removed `usePenDraft()` row of the hook `it.each`). Cut 6 added 5 (the `useKeptDraft` JOBS case, the D-10 and Pitfall 4 cases, the two hook tests). No test was deleted, skipped or weakened. After the final commit `git status --porcelain app/` prints nothing.

## The re-pointed describe (D-11)

| Describe | Old read target | New read target |
|----------|-----------------|-----------------|
| "RecipePage.jsx — the version pen's refusal and failure route through announce, never onPageStatus" | RecipePage.jsx | RecipePage.jsx and useVersionPen.js, joined with `'\n'`, page first |

The diff of cut 5 against `RecipePage.test.jsx` is one line: the `recipePageSource` read expression. It holds `readFileSync(`, `new URL(`, `fileURLToPath(` and `.join(`; no `expect(` line changed, and `callersOf` and every `it` are as they were. In `RecipePage.shell.test.js` the only removed lines are the old `HOOK_ORDER` constant, the retitled describe and the `it.each` list that dropped `'usePenDraft()'`; no `expect(` line was removed. The new titles are `'the draft hooks sit above the early returns'` and `'usePenDraft() is called once, inside useVersionPen.js, and the shell calls useVersionPen once above the early returns'`.

## Mutation checks (D-10, run after the cut 6 commit, never committed)

(a) Deleted `if (draftRestoreStartedRef.current) return;` from useKeptDraft.js.
- Hook test, first case: `useKeptDraft.test.jsx:149`, `expect(repo.getDraft).toHaveBeenCalledTimes(1)` -> `AssertionError: expected "vi.fn()" to be called 1 times, but got 2 times`. The second hook case failed the same way at line 178.
- Plan 01's Save over test: `RecipePage.strictMode.test.jsx:191`, `expect(store.getDraft).toHaveBeenCalledTimes(1)` -> `AssertionError: expected "vi.fn()" to be called 1 times, but got 2 times` (Save over re-triggers the restore effect through `setVersion`; the first assertion after mount still passed).

(b) Added a conventional cancellation (`let cancelled = false;`, checked at the top of the `.then`, set by a returned cleanup).
- Hook test, first case: `useKeptDraft.test.jsx:151`, `expect(restorePlanSpy).toHaveBeenCalledTimes(1)` -> `expected "vi.fn()" to be called 1 times, but got 0 times` (zero restores). The second case failed at line 180 (`navigate`, 0 calls).
- Shell test D-10 case: `RecipePage.shell.test.js:547`, `expect(hasCancellationFlag(useKeptDraft)).toBe(false)` -> `AssertionError: expected true to be false`.
- Plan 01's two page-level cases stayed green under (b), as research Pitfall 2 predicted: at page level the cleanup runs before the data arrives, so only the hook-level mount can tell.

(c) Changed `repository.getDraft(versionId)` to `repository.getDraft()`.
- Hook test, first case: `useKeptDraft.test.jsx:150`, `expect(repo.getDraft).toHaveBeenCalledWith(oliveOilVersion.id)` -> `AssertionError: expected "vi.fn()" to be called with arguments: [ 'olive-oil-ice-cream-v1' ]`, `Number of calls: 1`. The `toHaveBeenCalledTimes(1)` on line 149 passed first, and the mock still resolved the record, which is the review 08-04 MEDIUM case. The second hook case, the shell test's `useKeptDraft` JOBS marker and both plan 01 cases also went red.

## Deviations from Plan

None - plan executed exactly as written. Small wording choices inside moved comments: the kept-draft comment's `draftStoredRef` / `pendingDraftRef` / `draftTimerRef` bullet now says they are the writer's refs, and the writer's own header comment states D-08. No code changed from the plan's prescription.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. `useVersionPen.js` and `useKeptDraft.js` render nothing and import only `react`, the repository seam, `../domain/` modules, `./usePenDraft.js` and `./notebookPaths.js` (enforced by the `allow` lists). The draft is still read, written and deleted under the route's `versionId` (T-08-09), the guard and dependency arrays are pinned (T-08-10), the amend redirect still leaves `draftRestoreDone` unset (T-08-11), and `draftMatchesVersion` is unchanged and still the only gate (T-08-12). No package, network call, stored shape or database version changed.

## Issues Encountered

None.

## Next Phase Readiness

Plan 08-05 can start from `c5e6cc0`. For plan 05:

- `RecipePage.jsx` is 992 lines. The two route-intent effects (`startTastingConsumedRef` and `startNextVersionConsumedRef`, with their effects) still sit right after the `useKeptDraft` call and read `draftRestoreDone`, `mode`, `batches`, `versions`, `drafts`, `version`, `handleStartAmending` (hoisted) and `handleStartDeveloping` (now from `useVersionPen`).
- The Escape effect reads `penDraft`, `handleCancelDeveloping` (from `useVersionPen`) and `handleCancelRecording` (still in the shell); the Import-guard effect is untouched.
- `discardDraft` in the shell now comes from `const { discardDraft } = draftWriter;`; the batch save and cancel (still in the shell, D-01) use it.
- HOOK_ORDER in the shell test is `useAnnouncer()`, `useRecipeData(versionId)`, `useRecordDraft()`, `useDraftWriter(versionId)`, `useVersionPen(`, `useKeptDraft(`. Plan 05 appends `useRouteIntents(`.
- The test audit base stays `78e962d8c988d735cf5f3c505e049b480e77ad6b`. This plan's edits to existing test cases: the one `recipePageSource` read line in `RecipePage.test.jsx`, and in `RecipePage.shell.test.js` the retitled describe, the `it.each` list that dropped `'usePenDraft()'`, and the longer `HOOK_ORDER`. Added tests: `useKeptDraft.test.jsx`, the new JOBS entries, the usePenDraft case, the writer case, the D-10 and Pitfall 4 cases.
- EDIT-05 and EDIT-06 are not marked complete; plan 05 owns that.

## Self-Check: PASSED

- Files exist: `app/src/ui/useVersionPen.js`, `app/src/ui/useKeptDraft.js`, `app/src/ui/useKeptDraft.test.jsx`.
- Commits are ancestors of HEAD: 5dcf66a, c5e6cc0.
- `git rev-list --count 5094603..HEAD` was 2 before this summary commit, matching `commits: 2`.
- Full suite 96 files, 2988 tests, 0 failed; walk check ends `MATCH 94 snapshots` after each cut; `git status --porcelain app/` prints nothing.
