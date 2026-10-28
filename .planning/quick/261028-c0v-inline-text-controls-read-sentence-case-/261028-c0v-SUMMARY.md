---
phase: quick-261028-c0v
plan: 01
subsystem: ui
tags: [copy, sentence-case, text-control, label-in-name]
requires: []
provides:
  - "Inline .text-control labels in sentence case without articles, in the creation editor and the version pen"
affects: [app/src/ui]
key-files:
  modified:
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/Authored.jsx
    - app/src/ui/CreationSetup.jsx
    - app/src/ui/Method.jsx
decisions:
  - "aria-labels for the uses toggle and the two openers drop their articles so the visible label stays inside the accessible name (WCAG 2.5.3)"
status: complete
commits: 3
plan_head_before: bc8052c69b7843f468a9190c0494dde5b5ecf659
plan_head_after: dcafd03d7693d4b9a4b78012457e132583fefa7a
actuals:
  tokens: 9000
  tasks: 3
  commits: 3
completed: 2026-10-28
---

# Phase quick-261028-c0v Plan 01: Inline text controls read sentence case Summary

Every `.text-control` label now reads Remove, Restore, Done, Change ingredients, Add purpose, Add aside or Edit this step, and the six aria-labels on the uses toggle and the two openers lost their articles to keep Label in Name.

## Commits

- 79fdd1d9: creation step controls (CreationSteps.jsx and its tests, CreationFlow lookups)
- 3e2eb6d4: Remove/Restore on rows, notes, scales, problems (IngredientTable, Authored, CreationSetup and tests)
- dcafd03d: version pen (Method.jsx and tests)

## Verification

- `npm --prefix app test`: 4235 tests in 130 files pass (same as base).
- Old-word child lines 0; new-word child lines 16; test old-word markup, textContent and toContain gates 0; article-phrase gate 0 over app/src.
- Source diff from c6d9b6e8: only the six intended aria-label lines changed, className changed only on the two opener lines, `word` constant in IngredientTable untouched. The diff names exactly the 15 planned files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test expectations the plan did not list**
- **Found during:** Task 2
- **Issue:** IngredientTable.creating.test.jsx lines 372-374 and 386 (`'remove · Move up · Move down'` acts text) and IngredientTable.test.jsx lines 1055 and 1057 (regexes `(remove|restore)`) asserted the old visible words and failed.
- **Fix:** Capitalized the visible words in those expectations. Test titles left as the plan said (e.g. IngredientTable.creating.test.jsx 370 still reads "reads remove, Move up, ...").
- **Files modified:** app/src/ui/IngredientTable.creating.test.jsx, app/src/ui/IngredientTable.test.jsx
- **Commit:** 3e2eb6d4

Otherwise, plan executed as written. Nothing under .planning/ was staged or committed.

## Known Stubs

None.

## Self-Check: PASSED

Commits 79fdd1d9, 3e2eb6d4, dcafd03d are on main; 15 app/src files changed as planned.
