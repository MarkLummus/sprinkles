---
phase: quick-261019-arr
plan: 01
quick_id: 261019-arr
subsystem: ui
tags: [css, places, ingredients, responsive]
requirements: [PLACE-01]
key-files:
  modified:
    - app/src/styles/shell.css
decisions:
  - "Below 760, the Ingredients figures row is three lines: figure+amount, basis, source (left-aligned) (sketch 012 decision 5)"
status: complete
commits: 1
plan_head_before: 5b09c58a1245ebb22b733e6d367aac6302b88ea4
plan_head_after: 385c7bb633289e5e9807254541b73c595bc6a986
actuals:
  tasks: 1
  commits: 1
---

# Quick 261019-arr: Ingredients place, source on its own line below 760

Inside the `@media (max-width: 759.98px)` block of `app/src/styles/shell.css`, the `.place .ing__figures tr` grid areas became `'fig amt' 'basis basis' 'src src'`, and `.place .ing__figures .ing__source` now has `text-align: left`. The block's lead comment now describes the three-line layout (sketch 012 decision 5). Nothing at 760 and wider changed; no token or rule added.

## Commit

- 385c7bb6 `style(places): source on its own line below 760 (decide-p9-393-source-own-line)` — holds exactly `app/src/styles/shell.css` (5 insertions, 4 deletions).

## Verification

- Parsed-rules node gate (readAllRules): "decision 5 rules present".
- `grep -c "'basis src'" app/src/styles/shell.css`: 0.
- `npm --prefix app test`: 113 files, 3471 tests, all pass (equals base; no test added).
- `npm --prefix app run build`: succeeds (chunk-size warning is pre-existing).

## Deviations from Plan

None in the code. Process note: the harness refused a Write to the main-checkout SUMMARY path, so this file was written at the same relative path inside the worktree, uncommitted.

## Deferred Human Verification

The rendered layout is not proven by a text-level gate. Decision 5's WebKit measurements came from the 2026-10-19 build with these rules injected, not from this commit. Look at 393 in WebKit, or on the iPhone from `npm --prefix app run build && npm --prefix app run preview -- --host`: with Heavy cream open, the Fat row reads figure and amount, then the basis word, then the source left-aligned on its own line, with no horizontal scroll. At 1366 the four columns are unchanged.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- app/src/styles/shell.css modified: FOUND
- Commit 385c7bb6: FOUND
