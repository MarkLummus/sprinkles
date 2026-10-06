---
phase: quick-261006-1ys
plan: 01
subsystem: planning
tags: [03.7, sketch-011, placement-b, docs]
requires: []
provides:
  - 03.7-03-PLAN.md measuring against the placement B boards
  - 03.7-01-PLAN.md reading the placement B boards
affects: [03.7-01, 03.7-03]
key-files:
  modified:
    - .planning/phases/03.7-before-you-start-as-its-own-sheet-section/03.7-03-PLAN.md
    - .planning/phases/03.7-before-you-start-as-its-own-sheet-section/03.7-01-PLAN.md
decisions: []
metrics:
  tasks: 2
  files: 2
status: complete
actuals:
  tokens: 9000
  tasks: 2
  commits: 2
plan_head_before: f721f1b0fd87d597dcdcc315ee2a599dc2f26b56
plan_head_after: ed8136d6992ca4c42580dbf43bb41799634cb381
completed: 2026-10-06
---

# Quick 261006-1ys: 03.7 plans point at the placement B boards Summary

Plans 03.7-03 and 03.7-01 now read and measure against Sid's placement B boards (before-you-start-states-b.html, before-you-start-heading-b.html, before-you-start-pen-b.html), generator bysb.py and measurements bysb-measure.json; the old A-drawn boards, the accepted-with-cause disposition and the redraw question are gone.

## Commits

- SHA1 `ff0f591`: docs(03.7): point plan 03 at the placement B boards (only 03.7-03-PLAN.md)
- SHA2 `ed8136d`: docs(03.7): point plan 01 at the placement B boards (only 03.7-01-PLAN.md)

`git show --name-only --format= ff0f591 ed8136d` lists only the two plan files. Nothing pushed.

## What changed

- Plan 03: P3-1 to P3-15 applied verbatim. The case map names the fp-bs-*, fp-bh-h1-* and fp-bp-* panels; placement is compared on every top panel; positions below the Ingredients head are compared; the 8px shell offset at 1366 (page at 403, not 411) is stated with the rule to measure relative to the page or the band; the redraw row is gone, the P5 row is (4), and the acceptance criterion reads rows (1) to (3), and (4) when P5 was open.
- Plan 01: P1-1 to P1-12 applied. Boards cited for placement, heading, states and pen; bysb.py `propose` (lines 36 to 55) and `grid_css` (lines 36 to 73 read). Before P1-11 I checked bysb.py's `grid_css` by hand: its four wide area sets, four narrow area sets and four row sets equal the strings in plan 01's app.css paragraph ('auto auto auto 1fr auto', 'auto auto 1fr auto' twice, 'auto 1fr auto').

## Verification

- Leftover grep over both plans: prints nothing.
- Positive greps: POSITIVE-OK for each plan.
- frontmatter validate and verify plan-structure: valid for both plans (four valids).
- check verify-command-paths 03.7 and check verify-failure-directions 03.7: `ok flagged 0` each.
- git status over app/, .planning/sketches, .planning/canvas-generators, 03.7-02-PLAN.md and 03.7-04-PLAN.md: clean.

## Beyond the list

Edits the caller's list did not name, made because the caller's own grep or a now-false statement required them:

- P1-1 (plan 01 truth 1) and P1-2 (truth 2): their board citations were the old names the verification greps for.
- P1-3 (plan 01 truth 3) and P1-7 (decisions_recorded 2): both said the board keeps the older markup order; bysb.py's `propose` puts the section directly before the Ingredients, as plan 01 does.
- P3-9 (plan 03 decisions_recorded 6), P3-12 (Task 1's result-table sentence) and P3-13 (Task 1's first acceptance criterion): each still allowed an accepted disposition, which contradicts the rewritten second truth (a difference is fixed with a test or open for Mark).

Width convention: plan 01 keeps `*` and concrete widths (1366, 393), plan 03 uses W as defined in its decisions_recorded 1.

One wording fix of my own inside P1-7: the replacement made the sentence read ". the order"; I changed it to ", the order" so it parses.

## Deviations from Plan

None beyond the above wording fix. Plan executed as written. Commits were made on main as instructed (no worktree).

## Known Stubs

None.

## Self-Check: PASSED

- Both plan files exist and carry the edits (greps above).
- Commits ff0f591 and ed8136d exist on main; each touches one file.
