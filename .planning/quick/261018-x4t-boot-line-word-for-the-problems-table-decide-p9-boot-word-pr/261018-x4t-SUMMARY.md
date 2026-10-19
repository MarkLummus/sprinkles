---
phase: quick-261018-x4t
plan: 01
subsystem: store
tags: [boot-line, copy, seed-tables]
status: complete
key-files:
  modified:
    - app/src/store/seedTables.js
    - app/src/store/seedTables.test.js
decisions:
  - "Boot word for the problems table is 'tasting problems' (decide-p9-boot-word-problems = tasting-problems)"
actuals:
  tokens: 1000
  tasks: 1
  commits: 1
plan_head_before: 79e540f5951b173fdf2034b8a1450468b8f9faa0
plan_head_after: 82730c29
---

# Quick 261018-x4t: Boot line word for the problems table Summary

A damaged problems table now makes the app show "Sprinkles can’t open: its list of tasting problems has a damaged entry." as one sentence, by changing `SEED_TABLES.problems.word` to 'tasting problems'.

## Tasks

1. Boot line names "tasting problems" (tracer, TDD) - commit 82730c29
   - RED: updated the five-word list test and the damaged-problems result test; added a test pinning the whole boot line. Exactly those 3 tests failed.
   - GREEN: changed the word on the problems line and the comment above SEED_TABLES. `main.jsx`, table keys, error lines and the console line are unchanged.

## Verification

- `npm --prefix app test -- seedTables`: 1 file, 48 tests passed (47 before, plus 1).
- `npm --prefix app test`: 113 files, 3468 tests passed.
- Commit touches exactly `app/src/store/seedTables.js` and `app/src/store/seedTables.test.js`; `app/src/main.jsx` untouched.

## Deviations from Plan

None - plan executed exactly as written. The PLAN.md was not present in the worktree (untracked in the main checkout), so it was read from the main checkout path.

## Self-Check: PASSED

- Commit 82730c29 exists on the worktree branch.
- Both files modified and committed; working tree clean.
