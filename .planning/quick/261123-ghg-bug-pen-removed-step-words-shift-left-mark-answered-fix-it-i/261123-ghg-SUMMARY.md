---
phase: quick-261123-ghg
plan: 01
subsystem: ui
tags: [css, method, pen, removed-step, number-column]
status: complete
requires: []
provides:
  - "a removed step's words in the Next version pen start where the live steps' words start"
affects: [app/src/styles/app.css, app/src/ui/Method.jsx]
tech-stack:
  added: []
  patterns: ["an :empty rule that generates one hidden figure, so an auto grid column keeps a figure's width"]
key-files:
  created: []
  modified:
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
key-decisions:
  - "One CSS rule, .method-step__n:empty::before { content: \"0\"; visibility: hidden }; no token, no markup change"
requirements-completed: [bug-pen-removed-step-words-shift-left]
plan_head_before: 27a9f61f96495dc82782a93ce63c14c8443f393b
plan_head_after: dc03ad5c03e8d456f280e91b5e166000248e336b
commits: 2
actuals:
  tokens: 6000
  tasks: 3
  commits: 2
---

# Phase quick-261123-ghg Plan 01: A removed step's words line up in the pen Summary

**An empty number cell in the pen now holds one hidden figure (`.method-step__n:empty::before`), so a removed step's words start at the live steps' x in WebKit and Chrome, closed, open, and removed before the pen opened.**

`commits: 2` is measured over the two code commits (`27a9f61f..dc03ad5c`). This SUMMARY is the third commit and is not counted in it.

## The cause, as measured (before, at 27a9f61f)

Task 1 built the tree at BASE to a scratch outDir and ran a scratch copy of Sid's `p12pm-capture.mjs` (with a `gtc` read per li and an added open-removed-step state) in Playwright WebKit and in Chrome at 1366 x 1024. The cause check (`summarize.mjs cause before`) passed in both engines, in all three removed-step states: 30 of 30 PASS.

Removed step (li `method-step-4`, "Rest", shown as step 3 in the pen), against a live step, before:

| engine | state | li | number words | number w | body x | body w | li h | body top minus li top | first grid track |
|---|---|---|---|---|---|---|---|---|---|
| WebKit | pen_removed | removed | '' | 0 | 92 | 516 | 84 | 0 | 0px |
| WebKit | pen_removed | live | digit | 12 | 104 | 504 | 88 | 4 | 12.03px |
| WebKit | pen_removed_open | removed, open | '' | 0 | 92 | 516 | 234.3 | 0 | 0px |
| WebKit | pen2 | removed | '' | 0 | 92 | 516 | 84 | 0 | 0px |
| WebKit | pen2 | live | digit | 12 | 104 | 504 | 88 | 4 | 12.03px |
| Chrome | pen_removed | removed | '' | 0 | 92 | 516 | 84 | 0 | 0px |
| Chrome | pen_removed | live | digit | 11.1 | 103.1 | 504.9 | 88 | 4 | 11.125px |
| Chrome | pen_removed_open | removed, open | '' | 0 | 92 | 516 | 233 | 0 | 0px |
| Chrome | pen2 | removed | '' | 0 | 92 | 516 | 84 | 0 | 0px |
| Chrome | pen2 | live | digit | 11.1 | 103.1 | 504.9 | 88 | 4 | 11.125px |

The pen state (nothing removed) and the two reading states had every li at 88 (pen) or 23/24 (Show changes and reading), number 12 (WebKit) or 11.1 (Chrome) wide, body x 104 or 103.1. The removed step's body starts exactly one number width (L) left of the live steps': 92 = 104 - 12 in WebKit, and 92 against 103.1 - 11.1 = 92.0 in Chrome. Each li is its own grid, so the empty first cell sizes its auto track to 0px. The objective's cause held; no re-plan was needed.

## The fix

- `app/src/styles/app.css`: after `.method-step__n--struck`, one rule with a comment, `.method-step__n:empty::before { content: "0"; visibility: hidden; }`. The hidden figure is set in the cell's own face, size and tabular figures, so the auto track gets a live number's width and the cell a live number's baseline. It is never shown or read (hidden, and the cell is `aria-hidden`; textContent stays '' in every state, checked). No token added; the `.method-step` rule is unchanged.
- `app/src/ui/Method.jsx`: only the pen branch's margin comment changed (the sentence claiming the empty span kept the grid from shifting now names the `:empty` rule). Zero code lines changed (checked: the diff has no non-comment line).
- Not taken: a `min-width` on `.method-step__n` (needs a size token or a `ch` literal, `ch` need not equal the tabular figure in either engine, and the 4 px vertical difference stays); rendering the removed step's old number hidden in JSX (a step removed before the pen opened has no number, and the existing margin tests read the cell as empty).

## Red, then green

- RED (`fa07bcfa`): the stylesheet case failed ("expected a top-level .method-step__n:empty::before rule"); the Method markup bound passed at BASE, as planned. 1 failed, 187 passed.
- GREEN (`dc03ad5c`): both pass. `src/styles` plus the two files: 9 files, 516 tests passing.
- Full suite: 137 files, 4598 tests passing (4596 before, plus the 2 new cases).

## After (dc03ad5c), WebKit and Chrome

`summarize.mjs fix before after`: every check PASS, exit 0, in both engines. `board.mjs after`: every check PASS, exit 0.

Removed step, after:

| engine | state | number words | number w | first track | body x | body w | li h | body top minus li top |
|---|---|---|---|---|---|---|---|---|
| WebKit | pen_removed | '' | 12 | 12.03px | 104 | 504 | 88 | 3.9 |
| WebKit | pen_removed_open | '' | 12 | 12.03px | 104 | 504 | 234.3 | 0 (number 8.5 below li top) |
| WebKit | pen2 | '' | 12 | 12.03px | 104 | 504 | 88 | 3.9 |
| Chrome | pen_removed | '' | 11.1 | 11.125px | 103.1 | 504.9 | 88 | 4 |
| Chrome | pen_removed_open | '' | 11.1 | 11.125px | 103.1 | 504.9 | 233 | 0 (number 8 below li top) |
| Chrome | pen2 | '' | 11.1 | 11.125px | 103.1 | 504.9 | 88 | 4 |

- The removed step's words now start at the live steps' x and width (104 and 504 in WebKit, 103.1 and 504.9 in Chrome), in all three states. Its number cell is still empty (D-UAT-5) and one figure wide (12, 11.1).
- Nothing else moved sideways: in all six states, every live li's number x/w and body x/w equal the before run within 0.1 px; v2_changes and v2_reading keep every li, number and body box (x, y, w, h).
- Vertical consequence, as the plan predicted: the removed step's row takes a live step's height, 84 to 88 (both engines), and its body sits 4 px below the li top, where it sat at 0. The steps after it move 4 px down: WebKit method-step-3 1735.1 to 1739 and method-step-5 1843 to 1847 (pen_removed); Chrome 1731.8 to 1735.8 and 1839.8 to 1843.8. That is the live steps' own layout, not a new one.
- The open removed step: its number offset (8.5 WebKit, 8 Chrome) equals the open live step's in pen_open (8.6, 8). The open li's height is unchanged against before (234.3 and 233).
- Board P12_PenStepOrder panel `pm-removed` (WebKit; Chrome in parentheses): the board's live steps read number 12 (11.1), body offset 24 (23.1), li 88 high. The app's live and removed steps, in pen_removed and pen2, read the same figures. The board's removed step is drawn as built: number 0, body offset 12, 84 high. It now differs from the app by one figure's width, which is the fix.

Full per-li tables for all six states in both engines, before and after, are in the scratch folder named under "For the orchestrator" (not in the repo).

## 12-check.sh

Not run, per the item notes: no gate script measures a removed step in the pen (planning checked this). The orchestrator runs the full gate on main after the merge.

## Undrawn states and what the build does

No board draws the fixed state. Each is built from the live step's number column:

- the removed step, closed: number column one figure wide, words at the live x, li 88 high;
- the removed step opened with Edit this step: same column, words at the live x (open li height unchanged);
- a step removed before the pen opened (pen2): same as the first.

## Deviations from Plan

None - plan executed as written. The scratch capture copy needed no selector change; the added open-removed-step flow used the plan's labels ("Removed step 3, edit this step", the Done button) and worked at this HEAD.

## Noticed, not built

Each li sizes its own number column, so from step 10 a two-figure number's words start one figure further right than steps 1 to 9 do, and a removed step among them gets one figure. This is as built and was not changed.

## Known Stubs

None.

## Threat Flags

None. T-ghg-01: the generated figure is `visibility: hidden` inside an `aria-hidden` cell, and the cell's textContent stayed '' in every state in both engines. T-ghg-02: only a scratch copy of the capture script ran; `.planning/canvas-generators` and `.planning/sketches` are unchanged.

Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad

## For the orchestrator

- This executor has no ArtifactData: please close `bug-pen-removed-step-words-shift-left` (answered Fix it, 2026-11-23) on Mark's List once this merges.
- Board P12_PenStepOrder's `pm-removed` panel still draws the removed step as built (number 0 wide, words 12 px left, 84 high). A board spec that 261123-ghk writes over `pm-removed` must not hold the removed step's number or body box against it, unless Sid first redraws the panel to the fixed state. (The same panel's removed step is also 4 px shorter than the app's now.)
- A dist built from these commits is safe to deploy once the suite and GATE2 pass on main. There is no store change, no DB_VERSION change and no export-first need.
- The scratch evidence (dist-before, dist-after, before and after JSON for both engines, `capture.mjs`, `summarize.mjs`, `board.mjs`) is under `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/sprinkles-ghg`, not in the repo.
- The impeccable design hook flagged `design-system-font` on pre-existing lines of `cross-cutting.test.js` (669, 771, 913, 949, 954 and 5 more). None are in lines this item added; left standing, no ignore added.

## Self-Check: PASSED

- app/src/styles/app.css holds the rule (grep count 1); Method.jsx diff is comment-only; tokens.css, store, domain, CreationSteps.jsx and StepReading.jsx are unchanged.
- Commits fa07bcfa (test) and dc03ad5c (fix) are on this branch.
