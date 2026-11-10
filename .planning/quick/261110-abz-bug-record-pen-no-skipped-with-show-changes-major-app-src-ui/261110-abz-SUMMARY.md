---
phase: quick-261110-abz
plan: 01
quick_id: 261110-abz
status: complete
subsystem: record pen over Show changes
requirements: [bug-record-pen-no-skipped-with-show-changes]
commits: 2
plan_head_before: 4e678dfaf834b88eebd21555a498c805125dc5b8
plan_head_after: f0d2416817edede52cbd229705234e848e1f112c
tasks_complete: 1 of 1
actuals:
  tasks: 1
  commits: 2
---

# Phase quick-261110-abz Plan 01: Record pen over Show changes Summary

While any pen is open the Sheet ignores Show changes, so Record batch (and Correct) draws its own steps with Skipped and Done differently, the table draws no Removed group, and Balance strikes nothing. `?changes` stays in the address, so the change view comes back when the pen closes.

Written by the batch coordinator from the executor's hand-back: the executor's own SUMMARY was written inside its worktree and went with it at merge.

## Commits

Base: 4e678dfa.

- e7d21f81: test, `app/src/ui/RecipePage.perStep.test.jsx`. One end-to-end test appended at the end of the file (Olive Oil v1, Next version, remove Step 2, save, Show changes, Record batch).
- f0d24168: fix, `app/src/ui/RecipePage.jsx`. `const sheetShowsChanges = showingChanges && openPen === null;` is passed to `sheetView` and to the `RecipeSheet` mount; `VersionRow` keeps the raw value for its toggle.

## Evidence

- Red run on the test commit, page unfixed: RecipePage.perStep 1 failed, 37 passed, at the Step 1 Skipped assertion.
- After the fix: full suite 131 files, 4317 tests, all passing (baseline 4316).

## Deviations from Plan

- `npm --prefix app ci` was run in the worktree (no node_modules there).
- `app/dist/index.html` mtime was not recorded; nothing in the run writes there.

## Known gaps, not fixed

- Reading view, no pen open: a hand-typed `?changes` on a parentless version that holds a removed step still hands Method the unfiltered method (`RecipeSheet.jsx:92`) and may print "Step null". Unverified; reachable only by typing the address.
- The Correct pen is covered by the same condition, but the new test drives Record batch only.

## Deferred Human Verification

Optional iPad look: on a saved child version, turn Show changes on, then Record batch. Expect Skipped and Done differently on every step.
