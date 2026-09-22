---
phase: quick-260922-d2y
plan: 01
subsystem: ui
tags: [css, box-sizing, style-contract, shell, home]

requires: []
provides:
  - ".shell__tabs .shell__place and .home__action both size border-box, so their own height/min-height claims include their own padding and border"
affects: [shell-tab-row, home-actions]

actuals:
  tokens: 650
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "A box whose height/min-height is meant to include its own padding and border must declare box-sizing: border-box itself — the project carries no global reset, so each such box says so per-selector (existing precedent: app.css's nine per-selector declarations, shell.css's .shell__tabs)."

key-files:
  created: []
  modified:
    - app/src/styles/shell.css
    - app/src/styles/home.css
    - app/src/styles/shell.test.js
    - app/src/styles/home.test.js

key-decisions:
  - "Implemented exactly as specified: box-sizing: border-box added as the first declaration in each rule, immediately above display, with no other declaration touched in either stylesheet and no token introduced."

requirements-completed: []

coverage:
  - id: T1
    description: "A tab in the fixed bottom tab row fits inside the bar: height: 100% plus vertical padding resolves to the bar's own height."
    verification:
      - kind: unit
        ref: "npm --prefix app test — shell.test.js 'each tab reads icon over label, not beside it (board 171, Mark 2026-09-22)' now also asserts box-sizing: border-box on the media-scoped .shell__tabs .shell__place rule"
        status: pass
      - kind: other
        ref: "grep -cE '^[[:space:]]*box-sizing: border-box;' app/src/styles/shell.css -> 2 (the pre-existing .shell__tabs bar declaration plus the new .shell__place one)"
        status: pass
      - kind: human
        ref: "At 393px: each of the five bottom-bar tabs sits inside the bar with icon over label, nothing clipped or spilling past the bar's top edge."
        status: deferred
    human_judgment: true
    rationale: "Automated coverage (test assertion, grep count, build) confirms the declaration lands exactly where the plan specifies and changes nothing else. The rendered-pixel confirmation at 393px is a human-check with no browser session in this non-interactive dispatch; deferred to end-of-phase UAT per project precedent (e.g. 260909-oov SUMMARY)."
  - id: T2
    description: "A home action's rendered box is exactly the touch minimum tall, padding and border included; below 760px two actions in a row divide the row's width evenly."
    verification:
      - kind: unit
        ref: "npm --prefix app test — home.test.js 'the filled and secondary actions each carry a single-class selector...' now also asserts box-sizing: border-box on the top-level .home__action rule"
        status: pass
      - kind: other
        ref: "grep -cE '^[[:space:]]*box-sizing: border-box;' app/src/styles/home.css -> 1 (the new .home__action declaration; home.css carried none before)"
        status: pass
      - kind: human
        ref: "On the home route: a filled action measures 44px tall; two actions in a row below 760px share the row's width evenly with no overflow."
        status: deferred
    human_judgment: true
    rationale: "Same as T1 — automated coverage confirms the declaration is correctly scoped and isolated; the rendered-pixel confirmation is deferred to end-of-phase UAT."

duration: ~10min
completed: 2026-09-22
status: complete
---

# Phase quick-260922-d2y: Border-box on shell tabs' places and home actions Summary

**Added `box-sizing: border-box;` to `.shell__tabs .shell__place` (shell.css) and `.home__action` (home.css) so each box's own height/min-height claim includes its own padding and border, pinned by one new assertion per style-contract test.**

## Performance

- **Duration:** ~10 min
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- `app/src/styles/shell.css` — `.shell__tabs .shell__place` (the media-scoped rule at `@media (max-width: 759.98px)`) gained `box-sizing: border-box;` as its first declaration. The bar it sits in (`.shell__tabs`) is already `height: var(--app-size-tab-h)` with `box-sizing: border-box`; the child's `height: 100%` plus `padding: var(--gap-xs) 0` now resolves inside that fixed height instead of adding the padding outside it.
- `app/src/styles/home.css` — `.home__action` (top-level rule) gained `box-sizing: border-box;` as its first declaration. `min-height: var(--touch-min)` now includes the rule's own `padding: var(--gap-s) var(--gap-m)` and `var(--app-rule-row)` border, and the below-760px `flex: 1 1 0` share (home.css:329-331) now divides the row evenly including each action's own padding and border.
- `app/src/styles/shell.test.js` — extended the existing `each tab reads icon over label, not beside it (board 171, Mark 2026-09-22)` test with one assertion pinning `box-sizing: border-box` on the same rule it already resolves.
- `app/src/styles/home.test.js` — extended the existing `the filled and secondary actions each carry a single-class selector that can outrank the rewritten visited rule (gap 4)` test with one assertion pinning `box-sizing: border-box` on `actionRule` (`.home__action`), already bound in that test.
- No token was introduced; no other declaration in either stylesheet changed; no `.jsx` file touched.

## Task Commits

Each task was committed atomically:

1. **Task 1: Border-box on the tab row's places and on the home actions** - `63c38e1` (fix)

**Plan metadata:** (this commit, made by the orchestrator after this SUMMARY)

## Files Created/Modified
- `app/src/styles/shell.css` - added `box-sizing: border-box;` to the media-scoped `.shell__tabs .shell__place` rule.
- `app/src/styles/home.css` - added `box-sizing: border-box;` to the top-level `.home__action` rule.
- `app/src/styles/shell.test.js` - added one assertion to the existing icon-over-label test pinning the new declaration.
- `app/src/styles/home.test.js` - added one assertion to the existing filled/secondary action test pinning the new declaration.

## Decisions Made
None beyond the plan's own specification — implemented exactly as directed: two declarations, two assertions, nothing else changed.

## Deviations from Plan

None — plan executed exactly as written. `git diff --stat` confirms exactly 1 insertion in each of `shell.css` and `home.css`; the full diff across all four files totals four added lines (two declarations, two assertions), matching the plan's `<done>` criteria and `<verification>` section exactly.

## Verification Results

- `npm --prefix app test` — 41 test files, 1119 tests, all passing (including both new assertions).
- `grep -cE '^[[:space:]]*box-sizing: border-box;' app/src/styles/shell.css` → 2 (the pre-existing `.shell__tabs` bar declaration at line 266, plus the new `.shell__place` declaration).
- `grep -cE '^[[:space:]]*box-sizing: border-box;' app/src/styles/home.css` → 1 (the new `.home__action` declaration; home.css carried none before).
- `git diff --stat -- app/src/styles/shell.css app/src/styles/home.css` → 1 insertion, 0 deletions in each file.
- `npm --prefix app run build` — succeeded (126 modules transformed, built in 85ms).
- The plan's two `<human-check>` items (rendered-pixel confirmation at 393px for the tab row, and 44px/even-share confirmation for home actions) were not run in this environment — this is a non-interactive quick-task dispatch with no browser session opened for this run. Deferred to end-of-phase UAT per project precedent (e.g. `260909-oov-SUMMARY.md`). The underlying CSS change is small, isolated to a single new declaration per rule, and fully pinned by the automated style-contract assertions and the `box-sizing` count/diff-stat checks above, so the deferral carries low risk.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Both boxes now size border-box exactly as their own height/min-height declarations already claimed. The two `<human-check>` items are the only open items, deferred to end-of-phase UAT; no other follow-on work is implied by this task.

---
*Phase: quick-260922-d2y*
*Completed: 2026-09-22*

## Self-Check: PASSED

- FOUND: app/src/styles/shell.css
- FOUND: app/src/styles/home.css
- FOUND: app/src/styles/shell.test.js
- FOUND: app/src/styles/home.test.js
- FOUND: 63c38e1 (task commit)
- FOUND: .planning/quick/260922-d2y-border-box-on-shell-tabs-shell-place-and/260922-d2y-SUMMARY.md
