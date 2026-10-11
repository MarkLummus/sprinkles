---
phase: quick-261011-dz2
plan: 01
quick_id: 261011-dz2
subsystem: shell-import, print-route
tags: [import-guard, print-oversize, pen-state, paginator, probe]
requires:
  - 261011-b2k (print figures and import re-read of the open print route)
provides:
  - "Import refused with a page notice while any recipe pen is open (IMPORT_BLOCKED_STATUS)"
  - "pagesOverflow(pages, box) in the paginator; print route turns Print off with PRINT_TOO_LONG_LINE for a block too tall for one page"
  - "D-14 in 04-CONTEXT.md reads three pens"
affects:
  - app/src/ui/Shell.jsx
  - app/src/router.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/domain/sheetPages.js
  - app/src/ui/PrintSheetPages.jsx
  - app/src/ui/PrintSheet.jsx
tech-stack:
  added: []
  patterns:
    - "React context exported from Shell.jsx as a registrar the routed wrapper uses while a pen is open"
    - "Paginator reports the defect (pagesOverflow); the hook lays nothing for it; the route shows the state"
key-files:
  created:
    - app/src/ui/Shell.importGuard.test.jsx
    - .planning/phases/04-prepare-the-next-version-for-making/04-print-oversize-probe.mjs
  modified:
    - app/src/ui/Shell.jsx
    - app/src/router.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/domain/sheetPages.js
    - app/src/domain/sheetPages.test.js
    - app/src/ui/PrintSheetPages.jsx
    - app/src/ui/PrintSheet.jsx
    - app/src/ui/PrintSheet.test.jsx
    - .planning/phases/04-prepare-the-next-version-for-making/04-CONTEXT.md
decisions:
  - "Shell-to-pen signal is a context exported from Shell.jsx, provided around the Outlet (see Structural choice)"
  - "Both sentences are exported constants, one home each, awaiting Mark's wording approval"
requirements: [UX1-02, PRINT-01]
status: complete
duration: ~25 min
completed: 2026-10-11
commits: 3
plan_head_before: 18f9e1cd40cb5d2edce935e762ec14ab0163757e
plan_head_after: d0d9af7979b3be79ee146f9673624e222e2316ab
actuals:
  tokens: 21000
  tasks: 3
  commits: 3
---

# Phase quick-261011-dz2 Plan 01: Block Import while a pen is open; Print off for an over-long block Summary

Import is refused with a page notice while any of the three recipe pens is open, the print route shows Print off with one short line when a block cannot fit one printed page, and D-14 reads three pens.

## Copy constants (proposed wording, awaiting Mark's approval)

Each sentence lives in exactly one exported constant, so a wording change is a one-line edit.

| Constant | File | Text |
|----------|------|------|
| `IMPORT_BLOCKED_STATUS` | `app/src/ui/Shell.jsx` | Close the open pen before importing. |
| `PRINT_TOO_LONG_LINE` | `app/src/ui/PrintSheet.jsx` | This is too long to print on one page. |

Tests import the constants. The probe reads `PRINT_TOO_LONG_LINE` out of `PrintSheet.jsx` with a regular expression. No second copy of either sentence is typed anywhere.

## Structural choice: the Shell-to-pen signal

A React context, `ImportGuardContext`, exported from `Shell.jsx` and provided around the `Outlet`. Its value is a registrar `guardImport(announce)`. `RecipePage` reports only open or closed through one optional prop (`onPenOpenChange`), driven by one effect over `derivePenState(...).openPen !== null`. The routed wrapper `RecipePageForRoute` (now exported from `router.jsx`) holds `penOpen`, and while it is true registers its own `announcePageStatus` with the Shell and releases it on close or unmount. The Shell's `chooseImportFile` (used by both Import buttons) checks the registration: if set, it calls it with `IMPORT_BLOCKED_STATUS` and never opens the chooser; otherwise it clicks the one hidden file input as before. The notice goes through the existing page notice that `Version saved.` uses, so it clears after 5 s. The Outlet context is still the bare `storeRevision` number. No draft logic moved.

Alternatives not taken:
- Widen the Outlet context to an object: would edit RecipeList, SheetCodeSearch, PrintSheet and their tests.
- A module-level signal: global mutable state outside the React tree.
- A store field: excluded by the scope.

## Tasks

| Task | Commit | What |
|------|--------|------|
| A | ff07724 | Refuse Import while a recipe pen is open (Shell.jsx, router.jsx, RecipePage.jsx, new Shell.importGuard.test.jsx) |
| B | ee4987d | `pagesOverflow`, `useSheetPages` oversize, `PRINT_TOO_LONG_LINE` line, tests, real-browser probe |
| C | d0d9af7 | D-14 in 04-CONTEXT.md reads three pens (decide-three-pens-keep-drafts) |

## Red runs

- Task A, first run: all 6 cases failed because `RecipePageForRoute` was not exported ("Element type is invalid ... got: undefined"). After adding `export` to `RecipePageForRoute` only, the genuine red: 4 refusal cases failed on `expected "click" to not be called at all, but actually been called 1 times` (the chooser), while the after-Cancel and no-pen cases passed.
- Task B domain: 6 cases failed with `TypeError: pagesOverflow is not a function`. Component: the oversize case failed with `expected null not to be null` (the line absent); the Olive Oil v1 case passed.

All green after the implementation.

## Test counts

Baseline before Task A: 77 files, 2458 tests. After: 78 files, 2472 tests (the new file adds 6, `sheetPages.test.js` adds 6, `PrintSheet.test.jsx` adds 2). The tabindex scan, the golden Sheet code test (64JH-G408) and the cross-cutting token scan are green. `git diff --stat -- app/src/styles` is empty (no CSS change).

## Browser probe output

WebKit and Chrome, against a scratch build (`app/dist` and Mark's `vite preview` on :4173 untouched):

```
webkit: swept 19 seed versions
webkit: oversize before=2424.890625 box height=900
chrome: swept 19 seed versions
chrome: oversize before=2736.890625 box height=960
print-oversize-probe: 130 checks passed
```
Exit 0. Every seed version is ready with Print enabled, no line, and its Sheet code unchanged (Olive Oil v1 reads 64JH-G408). The oversize route (Before you start note of 'Before starting, check the ingredients and equipment. ' repeated 150 times) shows Print disabled, the line once, no `data-print-ready`, no 'Sheet, page 1' picture, and both log pictures drawn. Chrome's 2736.89 px matches the review's measurement.

Re-run from the repo root:

```
npm --prefix app run build -- --outDir "$SCRATCH/dz2-dist" --emptyOutDir
PROBE_DIST="$SCRATCH/dz2-dist" node .planning/phases/04-prepare-the-next-version-for-making/04-print-oversize-probe.mjs
```
with `SCRATCH` set to any scratch directory outside `app/`.

## Deviations from Plan

None - plan executed exactly as written. The `RecipePageForRoute` import into jsdom worked with no trouble, so it did not need to move.

## 04-CONTEXT.md mentions left unchanged

Per the scope, only the D-14 bullet (line 51) changed. Line 107 ("`isDraftDirty` and the four pens' draft state (D-14…D-17)") stays as written, as instructed. Line 66 ("How the four pens' existing `isDraftDirty` logic feeds persistence.") also still says four pens and was likewise left alone; flagging it in case Mark wants it brought in line.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path, file access or schema change. T-261011-dz2-01 and -02 are mitigated as planned; both sentences render as text with no `dangerouslySetInnerHTML`.

## Deferred Human Verification

Device UAT is served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

1. iPad, Import with a pen open then closed: open a version, tap Next version, tap the header Import. No file chooser opens, and the notice 'Close the open pen before importing.' shows and clears in about 5 s. Repeat with Record a batch and with Correct. Cancel, tap Import: the chooser opens and an export file imports. On the iPhone, the same through More, then Import.
2. iPad, print route with an over-long note: a version whose Before you start note is far taller than a page (for example the review's sentence repeated 150 times), saved through Next version. Its Print sheet shows Print off, the line 'This is too long to print on one page.' and no Sheet page pictures. Olive Oil v1's Print sheet still shows Print on.

Both sentences are also awaiting Mark's wording approval.

## Self-Check: PASSED

- FOUND: app/src/ui/Shell.importGuard.test.jsx, 04-print-oversize-probe.mjs
- FOUND commits ff07724, ee4987d, d0d9af7 on main (`git rev-list --count 18f9e1c..HEAD` is 3)
- `grep -c` checks: `IMPORT_BLOCKED_STATUS` export 1, `onClick={chooseImportFile}` 2, `fileInputRef.current?.click()` 1, `pagesOverflow` export 1, `PRINT_TOO_LONG_LINE` export 1 and its sentence 1
- Pre-existing `.planning/state.json` change and the 03.6 `.gitkeep` were never staged
