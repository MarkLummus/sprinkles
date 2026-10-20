---
phase: 10-the-creation-editor-without-save
plan: 11
subsystem: ui
tags: [react, creation-editor, notebook, kept-draft, page-notice]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-02 the creation editor spine (CreationRoute, CreationPage), the draft row and Resume, Cancel's final discard
provides:
  - the Notebook reads the drafts at load, so a kept creation shows as the draft row with Resume on every visit
  - ui/PageNotice.jsx (PageNoticeContext, usePageNotice, PageNotice) for the routes other than the recipe route
  - "Draft kept. Cancel discards it." on Resume, a reload or a direct visit, never right after Start
  - "Draft discarded." on the Notebook after Cancel, and Cancel's route state { discarded: true, createKept }
affects: [10-03, 10-04, 10-12]

actuals:
  tokens: 11000
  tasks: 2
  commits: 2

plan_head_before: 3f0b6263d33b019e75936247a5866112a1e567db
commits: 2
plan_head_after: 6a03af16f8d7a6a4eb69a93ff709d7252154e9b4

tech-stack:
  added: []
  patterns:
    - "Route state carries booleans only (started, discarded, createKept); each page prints its own constant and replaces the state with null once read"
    - "usePageNotice registers its announcer with a context registrar (default does nothing) so the Shell can provide one in plan 10-04"

key-files:
  created:
    - app/src/ui/PageNotice.jsx
    - app/src/ui/PageNotice.test.jsx
  modified:
    - app/src/ui/NotebookPlace.jsx
    - app/src/ui/NotebookPlace.test.jsx
    - app/src/ui/CreationRoute.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx

key-decisions:
  - "Cancel's remaining-drafts flag is computed from a second listDrafts read after the delete succeeds, and left out when that read fails"
  - "A failed Cancel announces PAGE_LOAD_ERROR with the default 5 s clear (the plan names no persist)"

patterns-established:
  - "CreationFlow.test.jsx: a Probe-fed stateTrail records every route state visited, since flags are replaced with null once read"

requirements-completed: [MAKE-11]

duration: 20min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 11: Draft row at load, closed-tab survival and the two page notices Summary

**The Notebook reads the drafts at load and shows a kept creation as the draft row with Resume on every visit; Resume announces "Draft kept. Cancel discards it.", Start announces nothing, and Cancel lands on the Notebook with "Draft discarded." and a createKept flag.**

## Performance

- **Duration:** about 20 min
- **Completed:** 2026-10-20
- **Tasks:** 2 (one tracer, one auto)
- **Files:** 2 created, 5 modified, all under app/src/ui

## Accomplishments

- `NotebookPlace` adds `repository.listDrafts()` to its Promise.all and sets the draft state to `newestDraft(drafts.filter(draftMatchesCreate))`. The draft row plan 10-02 draws, and the missing New recipe, now show on every visit in the list and empty branches. A plan draft shows no row.
- `PageNotice.jsx`: `PageNoticeContext` (default registrar does nothing), `usePageNotice()` returning `[message, announce]` (5 s clear only if still the same message, timer cleared on unmount, announcer registered and released through the context), and `PageNotice` rendering the existing `div.page-status-anchor > p.page-status` (role status, aria-live polite). It imports react only. `router.jsx` is not touched.
- `NotebookPlace` renders one notice before its root in the failed, loading, list and empty branches, exports `DRAFT_DISCARDED_STATUS`, and announces it from the route state `{ discarded: true }`, then replaces the state with null.
- `CreationRoute` reads `location.state.started` once, passes `justStarted` to `CreationPage`, and replaces the state with null in a mount effect. Its listDrafts effect keeps its empty dependency list.
- `CreationPage` renders one notice before `div.notebook.mk-page` (and alone while the restore read is out), suppresses `DRAFT_KEPT_STATUS` while `justStarted`, announces `PAGE_LOAD_ERROR` when Cancel's delete fails, and after a successful delete reads the drafts once more and lands on `/notebook` with `{ discarded: true, createKept }` (booleans only; `createKept` left out when that read fails).
- Tests: closed-tab flush attempts (pagehide, visibilitychange to hidden, unmount) followed by a fresh Notebook with the draft row and Resume restoring the typed description; leaving while the restore read is out writes and deletes nothing; a creation kept at load; two stored drafts (newest on screen, Cancel deletes only it, the older resurfaces with Resume and createKept true); createKept false, true and left out on a failed read; a failed Cancel and its edit coming back through the draft row; text in route state never reaches a notice.

## Task Commits

1. **Task 1 (tracer): a kept creation shows on the Notebook at load, and survives a closed tab** - `c0605fd7` (feat)
2. **Task 2: the two page notices** - `6a03af16` (feat)

## Verification Run

- `npm --prefix app test`: 116 files, 3551 tests, all green (before this plan: 115 files, 3526 tests).
- `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh`: `MATCH 94 snapshots`.
- Task 1 verify (NotebookPlace, CreationFlow, tabindex-scan): 81 passed. Tracer gate: Task 1's verify was green before Task 2 began.
- Acceptance greps: `repository.listDrafts()` in NotebookPlace.jsx 2; `DRAFT_DISCARDED_STATUS` export 1; `usePageNotice` export 1; `PAGE_LOAD_ERROR` in CreationPage.jsx 2; `createKept` in CreationPage.jsx 2; `from 'react'` in PageNotice.jsx 1; relative `../` imports in PageNotice.jsx 0. RecipePage.test.jsx passes unchanged.
- The pagehide, visibilitychange and unmount cases prove the flush attempt (saveDraft called at once). Whether IndexedDB finishes during a real browser shutdown is best effort (useKeptDraft.js).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink `app/node_modules` to the main checkout's (gitignored). No package installed.

### Notes

- **No consumed ref on the discarded effect.** The plan says the effect is "guarded by a consumed ref". It is not: the effect depends on `location.state` alone and returns at once when the flag is absent, and the state is replaced with null as soon as it is read, so the ref had nothing to guard. It would also have swallowed the second pass of React StrictMode's effect cycle and left the 5 s timer cleared by the simulated unmount, so the notice would never clear in development. Behaviour is the one the plan specifies (read once, replaced with null, Back or a reload never repeats it; tested).
- **Added `PageNotice.test.jsx`.** Not in the plan's files list; covers the 5 s clear, "same message only", persist, and the registrar's register and release, which the Notebook and editor tests only reach indirectly.
- **Existing CreationFlow assertions changed.** Plan 10-02's cases read `location.state` equal to `{ started: true }` and `{ discarded: true }` on the final route. Both flags are now consumed, so those cases read a `stateTrail` (every state the Probe saw) and the final state is null.
- **The editor draws no notice during CreationRoute's own listDrafts read** (the route returns null until a draft is found or it redirects). The plan places the notice in CreationPage's branches, which hold from the first CreationPage render.
- The draft row, New recipe entry and these notices still have no CSS rules for `nb__*` and the editor band; plans 10-03 and 10-05 own them. `.page-status` and its anchor reuse the existing rules unchanged.

## Authentication Gates

None.

## Known Stubs

None added by this plan. The empty `aside.notebook-log` and the empty Sheet rows noted in 10-02's SUMMARY remain for plans 10-06 and 10-08.

## Threat Flags

None. Route state carries three booleans only (T-10-05); the draft row's name is a React text child and is tested with angle brackets (T-10-27).

## Self-Check: PASSED

- Created files exist: PageNotice.jsx, PageNotice.test.jsx, this file.
- Commits `c0605fd7` and `6a03af16` are ancestors of HEAD.
