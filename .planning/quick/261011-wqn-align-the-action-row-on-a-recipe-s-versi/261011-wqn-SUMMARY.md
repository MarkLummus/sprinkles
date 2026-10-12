---
phase: quick-261011-wqn
plan: 01
quick_id: 261011-wqn
subsystem: notebook-version-details
tags: [css, alignment, print-sheet, webkit, probe]
requires: []
provides:
  - "Print sheet's text sits on the same line as Next version and Show changes on a recipe's version details"
affects: [app/src/styles/notebook.css, app/src/styles/notebook.test.js]
key-files:
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
  created:
    - .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs
    - .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-before.json
decisions:
  - "Keep the row's flex stretch and centre the anchor's text inside its own stretched box (inline-flex + align-items center), so no box and no 44px touch target changes"
  - "P2 probe check relaxed (orchestrator decision): a wrapped lone anchor line is informational, not a departure"
metrics:
  duration: "~25 min"
  completed: 2026-10-11
status: complete
requirements: [PRINT-01]
estimate:
  tokens: 70000
actuals:
  tokens: 14800   # chars/4 over the whole diff, baseline JSON (about 1360 lines) included
  tasks: 2
  commits: 3
plan_head_before: 9cacf2889bbf830b076b80a302af4bf976229335
plan_head_after: 1b41e28bf53713a9dfa3eb2a16c2ae7516d88fb2
---

# Phase quick-261011-wqn Plan 01: Align the action row on a recipe's version details Summary

Print sheet's link now centres its text in its stretched 44px box (one scoped `inline-flex` rule), so it sits on the same text line as Next version and Show changes in WebKit and Chrome with no box moved.

## Measured cause

Measured on a build of the unchanged source (`261011-wqn-before.json`, nine cells), not from CSS reading:

- The row `.notebook-version__acts` computes `align-items: normal` (stretch). On every line, every control is as tall as the line's tallest box: 44px (--touch-min).
- A stretched `<button>` centres its text in that box. The Print sheet `<a>` computes `display: block`, so its text starts at the top of the 44px box.
- WebKit 1366 coarse (Mark's iPad): box tops all 265.19, heights 44; Next version and Show changes text 278.94 to 295.43, Print sheet text 265.44 to 281.93. Print sheet's text is 13.5px higher.
- Same offset in WebKit 1024 coarse (162.26 vs 175.76), 1366 fine, and in Chrome 1024 and 1366 (266.19 vs 279.69). At 393 the record act and Next version sit at 284.94 and Print sheet at 271.44.
- All gaps equal --app-notebook-acts-gap (10px) and the first control starts at the row's left edge. "Further right" is simply the row's order, not an extra offset. Room between Print sheet's right edge and the section's right edge: 231px at 1366, 85.78 at 1024, 31.7 at 393.
- The prediction held in all nine cells. The only departure was in the probe's P2 check, not the cause: at 724 Print sheet wraps to its own line, where nothing stretches it. See "Out of scope" below.

## Fix

One top-level rule in `app/src/styles/notebook.css`, directly after `.notebook-version__acts`:

```css
.notebook-version__acts > a.notebook-link {
  display: inline-flex;
  align-items: center;
}
```

Keyword values only; no literal, no new token. `.notebook-version__acts` still declares no `align-items`, so the stretch and the 44px hit area stay. The `.notebook-link` base rule, `app.css`, `tokens.css` and `VersionRow.jsx` are untouched.

## Before and after

Each control's box (y, h) and text top/bottom, WebKit and Chrome; gaps are 10px in every cell, before and after. The probe's A2 check holds every box within 0.5px of the baseline.

| Cell | Control | Box y, h | Text top/bottom before | Text top/bottom after |
|---|---|---|---|---|
| webkit 393 coarse | Record a batch, Next version | 271.19, 44 | 284.94 / 301.43 | 284.94 / 301.43 |
| webkit 393 coarse | Print sheet | 271.19, 44 | 271.44 / 287.93 | 284.94 / 301.43 |
| webkit 724 coarse | Next version, Show changes | 162, 44 | 175.76 / 192.24 | unchanged |
| webkit 724 coarse | Print sheet (own line) | 216, 17 | 216.26 / 232.74 | unchanged |
| webkit 1024 coarse | Next version, Show changes | 162, 44 | 175.76 / 192.24 | unchanged |
| webkit 1024 coarse | Print sheet | 162, 44 | 162.26 / 178.74 | 175.76 / 192.24 |
| webkit 1366 coarse and fine | Next version, Show changes | 265.19, 44 | 278.94 / 295.43 | unchanged |
| webkit 1366 coarse and fine | Print sheet | 265.19, 44 | 265.44 / 281.93 | 278.94 / 295.43 |
| chrome 393 fine | Record a batch, Next version | 247.19, 44 | 260.69 / 277.69 | unchanged |
| chrome 393 fine | Print sheet | 247.19, 44 | 247.19 / 264.19 | 260.69 / 277.69 |
| chrome 724 fine | Next version, Show changes | 164, 44 | 177.5 / 194.5 | unchanged |
| chrome 724 fine | Print sheet (own line) | 218, 17 | 218 / 235 | unchanged |
| chrome 1024 fine | Next version, Show changes | 164, 44 | 177.5 / 194.5 | unchanged |
| chrome 1024 fine | Print sheet | 164, 44 | 164 / 181 | 177.5 / 194.5 |
| chrome 1366 fine | Next version, Show changes | 266.19, 44 | 279.69 / 296.69 | unchanged |
| chrome 1366 fine | Print sheet | 266.19, 44 | 266.19 / 283.19 | 279.69 / 296.69 |

Room to the right edge (Print sheet to section): 31.7 (393), 199.47 (724 coarse), 85.78 (1024 coarse), 231 (1366) in WebKit; 32.98, 200.7, 87.63, 232.84 in Chrome. Unchanged after.

## Verification

- `node 261011-wqn-probe.mjs before`: prediction true in 9 cells, with two informational P2 lines (724).
- `node 261011-wqn-probe.mjs after`: 127 checks passed. A1 one baseline per line (and same face, size, weight), A2 row and every control rect within 0.5px of the baseline, A3 every other `.notebook-band` a and button rect within 0.5px, A4 Print sheet keeps its underline.
- `npm --prefix app test`: 78 files, 2496 tests passed. The new notebook.test.js block adds three tests (RED: tests 1 and 3 failed before the rule; green after) and none were removed.
- Screenshots (WebKit 1366 coarse, 1024 coarse, 393 coarse, Chrome 1366): the three words share one line of text, Print sheet keeps its underline. The before shot of WebKit 1366 coarse showed Print sheet visibly above the other two. Screenshots are in the OS temp folder, not committed.
- Under app/, the commits touch only `notebook.css` and `notebook.test.js`.

## Deviations from Plan

**1. [Probe correction, orchestrator decision] P2 relaxed for a wrapped lone anchor**
- **Found during:** Task 1 (first baseline run reported 2 DEPARTS: webkit 724 coarse and chrome 724 fine, "Print sheet height 17 below --touch-min 44").
- **Issue:** at 724 Print sheet wraps to its own flex line. An `<a>` has no 44px floor (`app.css` gives that floor only to `<button>`), so nothing stretches it. P2 assumed every line holds a 44px control.
- **Fix:** the probe reports a line holding only the anchor as an informational finding; every other P2 condition stays strict. The baseline was re-run (prediction true) and my own first commit amended to carry the corrected probe and baseline.
- **Files modified:** the probe and before.json (both under .planning/quick).

Otherwise: plan executed as written. The worktree had no `app/node_modules`; a symlink to the main checkout's installed modules was added (ignored by `app/.gitignore`, untracked, nothing installed).

## Out of scope

At 724, a wrapped lone Print sheet is a 17px-tall touch target on a coarse pointer, because an anchor has no 44px floor (webkit 724 coarse: box y 216, h 17). Not fixed here; this rule neither causes nor changes it. Candidate for a follow-up quick task.

## Deferred Human Verification

Suggested Mark's List row (the orchestrator adds it; nothing was written to the list):
- id: `check-version-row-print-sheet-baseline`
- kind: `check`, owner `mark`, needs `hands`
- title: "Print sheet sits on the same line as Next version and Show changes"
- check: Mark opens Version 4 of Mexican Chocolate on the iPad, served from `npm --prefix app run build && npm --prefix app run preview -- --host` (never the dev server), and confirms the three words line up on one line and that tapping Print sheet opens the print route. Playwright WebKit is evidence, not the device.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- FOUND: app/src/styles/notebook.css, app/src/styles/notebook.test.js, the probe and before.json.
- FOUND commits: 18096da, 552aabd, 1b41e28 (all ancestors of HEAD).
