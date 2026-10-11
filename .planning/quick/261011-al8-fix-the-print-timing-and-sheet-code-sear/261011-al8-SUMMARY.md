---
phase: quick-261011-al8
plan: 01
quick_id: 261011-al8
subsystem: ui
tags: [print, search, accessibility, review-findings]
requires: []
provides:
  - "Print disabled until the Sheet's pages are laid (WR-06)"
  - "Sheet code search: Find held until versions load, store-failure line, re-announced status, malformed-code line (WR-07)"
affects: [app/src/ui/PrintSheet.jsx, app/src/ui/SheetCodeSearch.jsx]
tech-stack:
  added: []
  patterns: ["empty a polite live region, then set the line on the next animation frame so a repeat is read again"]
key-files:
  created: []
  modified:
    - app/src/ui/PrintSheet.jsx
    - app/src/ui/PrintSheet.test.jsx
    - app/src/ui/SheetCodeSearch.jsx
    - app/src/ui/SheetCodeSearch.test.jsx
    - .planning/phases/04-prepare-the-next-version-for-making/04-REVIEW-DISPOSITION.md
decisions:
  - "The store-failure line reuses main.jsx's boot sentence verbatim, as a local constant in SheetCodeSearch.jsx; main.jsx is untouched"
  - "The repeat re-announce waits one requestAnimationFrame; a microtask runs before the page renders and would never show the empty region"
metrics:
  duration: ~10 min
  completed: 2026-10-11
status: complete
actuals:
  tokens: 9000
  tasks: 3
  commits: 3
plan_head_before: cde4253ece3fddde7b65d4451e8eb0cfe1dc4439
plan_head_after: 1fbefe2
---

# Phase quick-261011-al8 Plan 01: Print timing and Sheet code search Summary

Review findings WR-06 and WR-07 closed: Print waits for the Sheet's pages, and the Sheet code lookup waits for the versions, reports a failed read in words, re-announces a repeated line, and tells a malformed code from a missing sheet.

## Commits

| Task | Commit | Files |
| ---- | ------ | ----- |
| 1 (tracer) Print waits for the pages (WR-06) | d087031 | PrintSheet.jsx, PrintSheet.test.jsx |
| 2 Find waits for versions; failed read says so (WR-07 items 1, 2) | aab4027 | SheetCodeSearch.jsx, SheetCodeSearch.test.jsx |
| 3 Repeat re-announced; malformed code told apart (WR-07 items 3, 4) | 1fbefe2 | SheetCodeSearch.jsx, SheetCodeSearch.test.jsx |

Each new test was seen failing before its fix. The full suite passes (77 files, 2443 tests), the tabindex scan included. No build was run, nothing pushed.

## Changed existing assertion

In `SheetCodeSearch.test.jsx`, `'hello'` moved from the D-13 line ("No version has this code.") to the malformed line. The empty/blank test was renamed "reads the same line for an empty and a blank submit" and now loops over `''` and `'   '` only. `typeAndSubmit` was split into `type`, `submit` and `nextFrame` helpers; `typeAndSubmit` still does all three, so every other assertion reads the status after the frame.

## Copy awaiting Mark

1. New: "Check the code: it has eight letters and numbers." (`SHEET_CODE_MALFORMED`, the review's wording, shown for a malformed code). For a Mark's List decide row, keep-as-is recommended.
2. Reused, not new: "Could not open the local store. Try reloading." (`SHEET_CODE_STORE_ERROR`, main.jsx's boot line verbatim) for a failed read on the Search page. The alternative Mark may prefer is a sentence in the save-failure voice, "Couldn’t read your versions. Try reloading.".

## Deferred Human Verification

Served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

1. iPad VoiceOver on Search: type 0000-0000 and press Find twice, and the line is spoken both times; type K7QM-2X9U, and the check sentence is spoken.
2. iPad print route over the LAN: Print shows the dashed off look until the Sheet's pages appear, then fills, and a press prints the two log pages and the Sheet's pages.

## Deviations from Plan

None - plan executed exactly as written.

The disposition rows were set to fixed (WR-06 d087031; WR-07 aab4027, 1fbefe2) and left uncommitted for the orchestrator. Line 3 of 04-REVIEW-DISPOSITION.md ("nothing has been fixed or skipped yet") was left as the orchestrator wrote it.

## Known Stubs

None.

## Threat Flags

None. The status region renders only module constants, never the typed code.

## Self-Check: PASSED

- d087031, aab4027, 1fbefe2 are ancestors of HEAD; each commit lists exactly its component and test file.
- `git status --porcelain` shows only the disposition file modified besides the pre-existing state.json and .gitkeep, both untouched; `app/` is clean.
