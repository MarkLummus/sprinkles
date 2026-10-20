---
phase: 10-the-creation-editor-without-save
plan: 04
subsystem: ui
tags: [react, shell, import-guard, page-notice, creation-editor]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-11 PageNotice.jsx (PageNoticeContext, usePageNotice, PageNotice) and Cancel's route state { discarded, createKept }; 10-02 the /notebook/new route and NEW_RECIPE_PATH
provides:
  - Import refused on every route while a create draft is kept, before the file chooser opens (D-10)
  - the Shell's three-state knowledge of a kept creation (unknown, absent, present) at the click
  - an import past the chooser re-reads the drafts and refuses on a kept creation or a failed read
  - the Shell's fallback page notice and its PageNoticeContext provider; RecipePageForRoute's registration
affects: [10-03, 10-05, 10-12]

actuals:
  tokens: 14000
  tasks: 2
  commits: 2

plan_head_before: 496dee227c800e2d3226db4e09e7ef3beb155e29
commits: 2
plan_head_after: 647e93b9c149a8a4851e98f24c13e524ccb0cb00

tech-stack:
  added: []
  patterns:
    - "The Shell's creation state lives in a ref (no re-render) and is written at the route's commit from the address and the route state; only the newest drafts read counts, a rejected read leaves it as it was"
    - "A repository stub tells the Shell's own reads from a page's by the file in the call stack, so a case can defer one and not the other"

key-files:
  created:
    - app/src/ui/Shell.creationGuard.test.jsx
  modified:
    - app/src/ui/Shell.jsx
    - app/src/router.jsx
    - app/src/ui/Shell.flyout.test.jsx

key-decisions:
  - "A click refused as unknown says PAGE_LOAD_ERROR ('Could not open the local store. Try reloading.'), an existing line used in a new place"
  - "The creation refusal sentence is 'Cancel the new recipe draft before importing.' (Claude's wording, for Mark in chat)"
  - "Cancel's landing is read by createKept: true present, false absent, missing unknown; never absent on discarded alone"

patterns-established:
  - "Shell.creationGuard.test.jsx: Shell mounted whole over an in-memory repository with shellReads and pageReads hooks for deferring or rejecting reads"

requirements-completed: [MAKE-11]

duration: 25min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 04: Import refused while a creation is kept Summary

**Import opens no file chooser while a create draft is kept, on any route; the Shell knows the answer at the click from a three-state ref fed by the address, Cancel's route state and its own newest drafts read, and an import already reading its file re-reads the drafts before it commits.**

## Accomplishments

- `Shell.jsx` exports `CREATION_IMPORT_BLOCKED_STATUS` ('Cancel the new recipe draft before importing.'). `creationStateRef` holds `'unknown'`, `'absent'` or `'present'`. `readCreationState()` bumps a counter, reads the drafts through one helper (`readDrafts`, wrapped so a stub without `listDrafts` rejects rather than throws) and writes the state only if its read is the newest; a rejected read changes nothing.
- `creationStateFromRoute(pathname, state)`: `/notebook/new` is present; Cancel's landing is present when `createKept` is true, absent when false, unknown when left out; otherwise null. The new effect (keyed on `[pathname, location.state]`, beside the pinned `[pathname]` one) writes that word at the route's commit, bumping the counter so an older read cannot overwrite it, then starts a read. `chooseImportFile` takes the route's word for its own render before the ref, so it is never a commit late. It stays synchronous: present refuses with the creation sentence, unknown refuses with `PAGE_LOAD_ERROR` and starts a fresh read, only absent clicks the file input.
- `handleImportChange` re-reads the drafts after the file parses and before `importStore`: a kept creation (or a present state) refuses with the creation sentence, a rejected read refuses with `PAGE_LOAD_ERROR`; `importStore` is not called in either.
- The Shell provides `PageNoticeContext` around the Outlet (`registerPageNotice`, release clears only the same announcer) and draws its own `PageNotice` before the `ImportGuardContext` only while no routed page has registered, so each page holds exactly one `.page-status`. `RecipePageForRoute` registers `announcePageStatus` in one effect after its guardImport effect; the anchor, PageStatus and RecipePage keep their text and order.
- `Shell.flyout.test.jsx`: its repository mock gains `listDrafts: () => Promise.resolve([])`, nothing else changed.
- `Shell.creationGuard.test.jsx` (19 cases): header and More refusal, empty store, plan draft; cold boot deferred read; newest read wins; rejected boot read; creation started while the file was read; failed re-check; one `.page-status` on Home, /notebook, /notebook/new and the olive oil version route (the route's PageStatus, inside the anchor before `.notebook`); open-pen refusal unchanged; post-Cancel with one creation, two creations and Cancel's read failing; fast Start-and-leave. Mutation checks: dropping the re-check fails the in-flight case; mapping createKept true to absent and `/notebook/new` to no word fails the two-creation and Start-and-leave cases.

## Task Commits

1. **Task 1 (tracer): Import refused with a creation kept, recipe routes keep their notice** - `fea73668` (feat)
2. **Task 2: every route says it in its own notice, the Start and Cancel windows** - `647e93b9` (test)

## Verification Run

- `npm --prefix app test`: 117 files, 3570 tests, all green (before this plan: 116 files, 3551 tests).
- `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh`: `MATCH 94 snapshots`, run after each task. Tracer gate: Task 1's tests and walk were green before Task 2 began.
- Acceptance greps all at the plan's counts (CREATION_IMPORT_BLOCKED_STATUS 1, one listDrafts helper line 1, `useRef('unknown')` 1, PAGE_LOAD_ERROR 3, `async function chooseImportFile` 0, `}, [pathname, location.state]);` 1, `registerPageNotice(announcePageStatus)` 1, `catch(() => null)` 0, `<Link` in router.jsx 0).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink `app/node_modules` to the main checkout's (gitignored). No package installed.

None other: the plan executed as written.

## For Mark (in chat, not on Mark's List)

- New sentence: "Cancel the new recipe draft before importing." (Claude's wording, in the shape of "Close the open pen before importing.").
- A click on Import before the Shell knows (cold boot, or after a failed drafts read) now says "Could not open the local store. Try reloading." (the existing PAGE_LOAD_ERROR line, used in a new place).

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. The Shell's drafts read adds no network or file surface; route state is read as booleans only.

## Self-Check: PASSED

- Created and modified files exist (Shell.jsx, router.jsx, Shell.creationGuard.test.jsx, Shell.flyout.test.jsx, this file).
- Commits `fea73668` and `647e93b9` are ancestors of HEAD.
