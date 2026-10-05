---
phase: quick-261004-ta2
plan: 01
quick_id: 261004-ta2
subsystem: shell-css, test-helpers
tags: [focus-ring, stale-comments, probe]
requirements-completed: [tidy-stale-test-helpers]
key-files:
  modified:
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js
    - app/src/styles/notebook.css
    - app/src/styles/app.css
    - .planning/quick/261002-wn0-record-a-tasting-opens-the-amend-pen-on-add-tasting-without/261002-wn0-probe.mjs
decisions:
  - "The menu button's ring sits at :focus-visible, not plain :focus (see Item 3)."
metrics:
  completed: 2026-10-05
  tasks: 3
  commits: 4
plan_head_before: 016765fd70b370c90f4f6eefacb78d45a4cf56c5
plan_head_after: 56dd7434b6704360fb51ac77415781a3e6deff63
actuals:
  tokens: 3100
  tasks: 3
  commits: 4
status: complete
---

# Quick 261004-ta2: tidy leftovers (probe regex, stale nav comments, menu and wordmark ring) Summary

The menu button and the Sprinkles wordmark link now carry the 10px control radius, so their focus rings follow it. The menu button also has a focus-visible ring of its own. Two stale nav-arithmetic comment blocks and one stale probe regex are corrected.

Full suite: 62 files, 1680 tests, all passing (baseline 1679 plus the one new menu-ring test; no test removed).

## Done

### Item 1: the wn0 probe regex

- `261002-wn0-probe.mjs`, matrixA case (a): `/^recorded .* against /` is now `/^changed \d{1,2} [A-Z][a-z]{2} \d{4}$/`, with a two-line comment above it. Case (a) is an amend save, so the status is "changed <D Mon YYYY>" with no version suffix since quick 261004-ly3.
- The probe was NOT run. It measures `app/dist`, the build is stale, and building was forbidden. `node --check` passes.
- Commit 56dd743.

### Item 2: stale nav sums (comment-only, commit fb046a0)

Checked by stripping comments and comparing before and after: both files are identical, so no declaration, selector or media prelude changed.

- notebook.css header: "centred from a 1770px window ... the side nav and the Sheet's second column go together at 984" became "centred once the main area reaches 1546 ... the Sheet's second column goes at 984 (app.css). The side nav is in none of these sums from 724 to 1589 ...; from 1590 the 224 rail sits beside the main area."
- notebook.css content cap: "from a 1770px window" became "once the main area reaches 1546 (1482 + 2 x 32) ...: from a 1546px window while the nav is the fly-out (1546 to 1589) and from a 1770px window with the 224 rail (1770 = 224 + 1546)".
- notebook.css record pen frame: "1366 = 224 + 3 x 32 + 696 + 350" became "1366 = 3 x 32 + 920 + 350, the main area being the whole window below 1590".
- notebook.css band rhythm: "1366 = the side nav's 224 + 3 x 32 gutters + 696 + 350" became "1366 = 3 x 32 gutters + the Sheet's minimum 920 + the log's own 350; the side nav is in none of the sum below 1590 ... that rung is 984, app.css."
- app.css 984 step: "984 = the side nav's 224 + 2 x 32 + 696 ... go together" became "984 = 2 x 32 gutters + the Sheet's two-column minimum 920: the side nav is in none of the sum from 724 to 1589 ..., so the Sheet's second column goes here on its own."

### Item 3 (c): the menu button and the wordmark ring

RED (commit a8266b0, shell.test.js only). Exactly three tests failed:

1. Focus-selector test: `expected [ '.shell__place:focus' ] to deeply equal [ '.shell__menu:focus-visible', ...(1) ]`
2. Radius test: `expected [ '.shell__place', '.shell__sprinkle' ] to deeply equal [ '.shell__brand a', ...(3) ]`
3. New menu-ring test: `expected a top-level .shell__menu:focus-visible rule: expected undefined to be truthy`

GREEN (commit 867c764, shell.css only):

- `.shell__menu` and `.shell__brand a` gain `border-radius: var(--app-radius-control)`. The wordmark's display is unchanged.
- New top-level `.shell__menu:focus-visible`: `outline: var(--focus-outline-width) solid var(--app-text)` and `outline-offset: var(--focus-outline-offset)`.
- Passing afterwards: shell.test.js, tokens.test.js and binder.test.js (103 tests); the tabindex scan, Shell.test.jsx and Shell.flyout.test.jsx (55 tests).

Choice: `:focus-visible` rather than plain `:focus`. Plain `:focus`, joining `.shell__place:focus`, was the alternative. It changes when the ring shows. closePlaces hands focus back to the menu by script after a tap, and a plain `:focus` rule would draw a ring then, which nobody asked for. At `:focus-visible` the ring appears exactly when the global ring did, and only its shape and colour token change.

## Left, needs Mark, not touched

- (a) The Import error list renders inside `.shell__tools` in the sticky bar (Shell.jsx ~337-343; shell.css `.shell__import-errors`). From 724 the bar is a single no-wrap row, so the bar grows past 57 while the list shows. No board draws where the list goes. Sketch 011 README line 406 notes the bar could hold a notice, but that is not drawn.
- (b) `.page-status` paints above the open fly-out because tokens.css orders scrim 4 < fly-out 5 < notice 10 < header 11. That is the decision 33 brief's own order, pinned by shell.test.js, so changing how the notice stacks reverses a briefed order.

## Noticed, not touched

- notebook.css's content-cap comment and tokens.css ~396 say "1482 = 696 + 32 + 350", which is 1078. The cap is 1100 + 32 + 350. It was wrong before ly8 and is not nav arithmetic. I kept it in the notebook.css cap comment as the plan directed.
- app.css ~703's "189px at 984 and 1366" is a historical rationale, left alone.
- DESIGN.md arithmetic was not checked.
- Decision 47 (8)'s iPhone half (More's Import and Export borders, the More tab's clipped ring) remains for another quick.

## Deferred human verification (needs a rebuild first, not done here)

- On the iPad, tap then Tab with Full Keyboard Access off. The menu button's ring and the Sprinkles wordmark's ring follow the 10px radius.
- Closing the fly-out with a tap leaves no new ring on the menu button.

## Mark's List rows for the orchestrator (no ArtifactData tool here; each addedBy claude, status open)

- `ta2-import-errors-in-bar`, kind decide. Title: where the Import error list goes from 724. Options: "Sid draws where the list goes from 724" (recommended) or "leave it in the bar, which grows while it shows".
- `ta2-notice-over-flyout`, kind decide. Title: how the page notice stacks with the open fly-out. Options: "Sid draws how the notice stacks with the open fly-out" (recommended) or "leave the brief's order".
- `ta2-menu-wordmark-ring-check`, kind check. Title: iPad ring on the menu button and wordmark. The device check above; it needs a rebuild and `preview --host` first.

## Deviations from Plan

None in what was built. Two small notes on how it went:

- The plan's verify line `grep -n "/^changed "` finds nothing under macOS grep, because BSD grep treats `^` as an anchor even mid-pattern. The text is in the probe (line 306); `grep -F "/^changed "` finds it. Nothing to fix in the probe.
- The work ran on `main` as instructed (no worktree); the pre-commit protected-branch assertion was skipped on that basis.

No stubs, no new network or auth surface, no package installs. No build, no Vite process started by me (one Vite process was already running, not mine), nothing under app/dist, .planning/canvas-generators/, .planning/sketches/ or .impeccable/ touched. The four commits (a8266b0, 867c764, fb046a0, 56dd743) name only the five work paths; `git status` still shows Sid's, Mark's and the untracked files as they were.

## Self-Check: PASSED

All five work files exist and are committed (a8266b0, 867c764, fb046a0, 56dd743); the full suite passes with 62 files and 1680 tests.
