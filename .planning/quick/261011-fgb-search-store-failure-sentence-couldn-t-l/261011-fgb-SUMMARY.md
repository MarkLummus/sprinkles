---
phase: quick
plan: 261011-fgb
subsystem: ui
tags: [copy, search, error-message]
status: complete
key-files:
  modified:
    - app/src/ui/SheetCodeSearch.jsx
    - app/src/ui/SheetCodeSearch.test.jsx
decisions:
  - "Search store-failure sentence is 'Couldn’t look up that code. Try again.' (Mark: decide-sheet-code-store-error-wording-2 = look-up); main.jsx boot line unchanged"
commits: 1
plan_head_before: 683646bffecf58efa0c068e9d72d3b82cc143563
plan_head_after: 480f1987a037954ec1d8b6aaf895a2b14a6f0e5d
actuals:
  tasks: 1
  commits: 1
---

# Quick 261011-fgb: Search store-failure sentence Summary

The Search page's store-failure message now reads "Couldn’t look up that code. Try again." with no storage words.

## What changed

- `app/src/ui/SheetCodeSearch.jsx`: `SHEET_CODE_STORE_ERROR` set to the new sentence (typographic apostrophe U+2019). The comment above it said the constant reused the boot line's words, which is no longer true, so it was rewritten to match (my own change made it stale).
- `app/src/ui/SheetCodeSearch.test.jsx`: both pinned expectations (rendered status text and the exported constant) updated to the new sentence.

## TDD runs

- RED (test changed first): `npm --prefix app test -- src/ui/SheetCodeSearch.test.jsx` -> 1 failed, 11 passed. Expected "Couldn’t look up that code. Try again.", received "Could not open the local store. Try reloading."
- GREEN (constant changed): same command -> 12 passed (12).
- Full suite: `npm --prefix app test` -> 78 files, 2472 tests passed.
- `grep -rn "Could not open the local store" app/src` -> only `app/src/main.jsx:21` (the boot line, intentionally kept).

## Commit

- `480f198` fix(quick-261011-fgb): Search store-failure sentence says look up, not storage (two app files only; unrelated `.planning/state.json`, the 03.6 `.gitkeep` and the quick dir were not staged).

## Deviations from Plan

Minor: the comment above the constant was also updated (Rule 1, it would otherwise be false). Otherwise executed as written.

## Self-Check: PASSED

- Both app files exist and carry the new sentence; commit 480f198 is an ancestor of HEAD.
