---
phase: quick-261011-b2k
plan: 01
subsystem: print
tags: [print, sheet, balance, import, review-fix]
requires: []
provides:
  - "Printed Balance (gauges and basis note) reads the active formula"
  - "Open print route re-reads after an import"
affects: [app/src/ui/PrintSheetPages.jsx, app/src/ui/PrintSheet.jsx]
tech-stack:
  added: []
  patterns: ["inline active reading spread { ...version, rows: activeRows, method: activeSteps }", "route keyed on the shell's storeRevision"]
key-files:
  created: []
  modified:
    - app/src/ui/PrintSheetPages.jsx
    - app/src/ui/PrintSheetPages.test.jsx
    - app/src/ui/PrintSheet.jsx
    - app/src/ui/PrintSheet.test.jsx
key-decisions:
  - "P1 uses the inline spread RecipePage.jsx and domain/diff.js already use; no new domain helper"
  - "P1 also fixes the basis note by passing the active reading to PrintBalance"
  - "P2 remounts the route (key includes storeRevision) rather than re-running the loads, so Print stays off until the replacement's pages are laid"
requirements-completed: [PRINT-01, PRINT-04, PRINT-05]
status: complete
commits: 2
plan_head_before: 82e43aeb276847d3d373bb018d17ecbbca8d21b2
plan_head_after: 2f5e3379f57e6ef8488928cd9fed1eb911e65f74
actuals:
  tokens: 9000
  tasks: 2
  commits: 2
completed: 2026-10-11
---

# Phase quick-261011-b2k Plan 01: Print figures from active rows, and refresh after import Summary

The printed Balance now reads the same active formula as the table beside it, and an import while the print route is open remounts the route on the imported content.

## Commits

- `70491c0` fix(261011-b2k): The printed Balance reads the active formula, not removed lines (review P1)
- `2f5e337` fix(261011-b2k): An import re-reads the open print route, Print off until the new pages are laid (review P2)

## What changed

**P1 (Task 1, tracer).** `sheetBlocks` builds one `readingVersion` (the stored version with `rows` set to `activeRows` and `method` set to `activeSteps`), calls `buildFigures` on it, and returns it beside the stored `version`. `SheetPage` hands `blocks.readingVersion` to `PrintBalance`, so the basis note reads the same rows as the gauges. The band, the groups and the Sheet code still read the stored version; the golden 64JH-G408 test is unchanged and green. Olive Oil v1 with Graza Drizzle removed now prints PAC 25.3, POD 13.7, fat 13.7%, MSNF 8.9%, sugar 14.2%, solids 37.7% (before: 24.1, 13.0, 18.0, 8.5, 13.5, 40.8). With step 6 removed the printed basis note no longer names Allulose.

**P2, print part (Task 2).** `PrintSheetForRoute` reads `useOutletContext()` (the shell's `storeRevision`) and adds it to the key. An import remounts the route: it re-reads the saved version, shows the imported title and recomputed Sheet code, and keeps Print off (no `data-print-ready`) until the replacement's pages are laid. The route still calls only `getVersion`, `getRecipe` and `listVersions`. For a moment after an import the route renders nothing while its reads run, then the imported Sheet; no new copy.

## Tests seen failing before each fix

- Task 1 (10 failed, 63 passed before the fix; 73 pass after): for each of the four removal fixtures (removed only-line, removed whole row, one removed line of a split row, removed step 6) both "the figures are the active reading's, and not the stored rows'" and "the printed Balance, gauges and basis note, is the active one and not the stored one"; "prints the review's numbers for Graza Drizzle removed"; "does not name Allulose in the printed basis note once its only step is removed". The identity guard ("the band, the groups and the Sheet code still read the stored version") passed before and after, by design.
- Task 2: "shows the imported title and code at once, keeps Print off until the new pages are laid, then prints once" failed on the title (`Olive Oil Ice Cream` received, `IMPORTED REVIEW TITLE` expected). All 19 existing tests passed under the new RevisionOutlet harness before the fix. After the fix all 20 pass; the full suite is 77 files, 2458 tests, all green (tabindex scan and golden sheetCode test included).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Left alone: the recipe editor's refresh after an import

P2's recipe-editor half was not touched: `RecipePage.jsx` and its open pens are unchanged, and so are `Shell.jsx` and every other file under `app/` outside the four files above. The review asks for it to be treated separately so a refresh does not silently discard open ink, and that is a decision for Mark. P2 also independently reproduces the print portion of WR-03 in `04-REVIEW.md`; `04-REVIEW-DISPOSITION.md` was not edited.

## Deferred Human Verification

Serve from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

1. **iPad print of a version with a removed row.** Remove Graza Drizzle from Olive Oil in the editor and save, then open that saved version's print route. The printed gauges match the recipe page's Balance for the same version, and the table leaves Graza out. If nothing else changed, that reads PAC 25.3, POD 13.7, fat 13.7%, MSNF 8.9%, sugar 14.2%, solids 37.7%, with a Total of 759.7 g.
2. **Import while the print route is open, then Print.** Open Olive Oil v1's print route, import a store file whose same version has a changed Sheet title, and see the new title and a new Sheet code on the line. Print shows the dashed off look until the Sheet's pages appear. A press prints the new title and code on the feet, and Search finds that code.

No Mark's List row was written; the orchestrator turns these checks and the editor decision into rows.

## Threat Flags

None. No new endpoint, auth path or schema change; the route reads the same three repository methods.

## Self-Check: PASSED

- FOUND: app/src/ui/PrintSheetPages.jsx, PrintSheetPages.test.jsx, PrintSheet.jsx, PrintSheet.test.jsx
- FOUND commits: 70491c0, 2f5e337 (`git diff --name-only 82e43ae..HEAD -- app/` lists exactly the four files)
