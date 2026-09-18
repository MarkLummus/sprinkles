---
phase: quick-260918-mpz
plan: 01
subsystem: ui
tags: [react, jsx, accessibility, history]

# Dependency graph
requires: []
provides:
  - BatchHistoryPanel's register renders as an <ol>, matching the newest-first order of its content
affects: [batch-row, history]

# Actuals (#2632)
actuals:
  tokens: 420
  tasks: 1
  commits: 1
plan_head_before: 06fae6e48695f41f5eafa6148a5d1b7131c76c0e

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx

key-decisions:
  - "None - followed plan as specified"

patterns-established: []

requirements-completed: [MPZ-01]

coverage:
  - id: D1
    description: "BatchHistoryPanel's Batches register renders as an <ol role=\"list\" aria-label=\"Batches of this version\">, matching its newest-first content and the twin History panel's nested batch list."
    requirement: "MPZ-01"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#BatchHistoryPanel — the revealed Batches register > reveals exactly the complete batch count, newest first, with the older batch in view"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-09-18
status: complete
---

# Phase quick-260918-mpz Plan 01: The Batches panel declares its register ordered Summary

**Added the `ordered` prop to `BatchHistoryPanel`'s `HistoryList` call so its register renders `<ol>` instead of `<ul>`, agreeing with the History panel's twin nested batch list and the newest-first content both already render.**

## Performance

- **Duration:** 5min
- **Started:** 2026-09-18T20:25:00Z
- **Completed:** 2026-09-18T20:30:42Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- `BatchHistoryPanel` (app/src/ui/BatchRow.jsx:331) now passes `ordered` to `HistoryList`, so History.jsx's `List = ordered ? 'ol' : 'ul'` branch emits `<ol>` for the Batches register — matching the twin call site at RecipeHistory.jsx:152.
- Tightened the BatchRow test's class-substring assertion to pin the full element, attributes and classes React emits (`<ol role="list" aria-label="Batches of this version" class="history-register history-list">`), so a future regression back to `<ul>` fails the test instead of passing silently.
- No visible change: `.history-list` still sets `list-style: none`.

## Task Commits

Each task was committed atomically:

1. **Task 1: The Batches panel's register declares itself ordered** - `8d41ff8` (fix)

_Note: RED failure was confirmed before the GREEN fix (test-first, per plan); both landed in one commit since the plan's tdd="true" task specifies a single fix, not a phase-level strict RED/GREEN/REFACTOR gate (MVP mode)._

## Files Created/Modified
- `app/src/ui/BatchRow.jsx` - Added `ordered` prop to the `HistoryList` call inside `BatchHistoryPanel`
- `app/src/ui/BatchRow.test.jsx` - Tightened the register markup assertion from a class substring to the full `<ol ...>` tag

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
Both batch registers (the Batches panel's and the History panel's nested one) are `<ol>` in the rendered DOM. No blockers. Full suite green at 38 files / 1046 tests, matching the pre-existing baseline exactly (no count regression).

---
*Phase: quick-260918-mpz*
*Completed: 2026-09-18*
