---
phase: quick-261110-aby
plan: 01
quick_id: 261110-aby
status: complete
subsystem: History rail
requirements: [bug-history-rail-draft-link]
commits: 2
plan_head_before: 4e678dfaf834b88eebd21555a498c805125dc5b8
plan_head_after: a3bf381b57f3f8bc4eda5434c2b9e7eda5512d17
tasks_complete: 1 of 1
actuals:
  tasks: 1
  commits: 2
---

# Phase quick-261110-aby Plan 01: History rail draft link Summary

The wide (1366 and up) History rail draws a waiting Next version draft as plain text, not a link to `/notebook/<recipe>/draft`, matching the upright list.

Written by the batch coordinator from the executor's hand-back: the executor's own SUMMARY was written inside its worktree and went with it at merge.

## Commits

Base: 4e678dfa.

- 409752b2: test, `app/src/ui/RecipeHistory.test.jsx`. The vacuous waiting-draft test is rewritten to count links on the wide rail and then the narrow one.
- a3bf381b: fix, `app/src/ui/RecipeHistory.jsx`. The wide branch reads `entry.inView || entry.isDraft || openPen`.

## Evidence

- Red run on the test commit, component unfixed: RecipeHistory 1 failed, 18 passed (`expected [ …(2) ] to have a length of 1 but got 2`, wide arrangement).
- After the fix: RecipeHistory 19 of 19; full suite 131 files, 4316 tests, all passing (baseline unchanged, one test rewritten).

## Deviations from Plan

- Commit trailers name Claude Sonnet 5.5, the model that ran the executor.
- `npm --prefix app ci` was run in the worktree (no node_modules there).

## Deferred Human Verification

None needed: markup only. Optional iPad look: with a Next version draft waiting on another version, the rail's draft node does not respond to a tap.
