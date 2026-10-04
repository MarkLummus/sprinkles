---
phase: quick-261004-ly7
plan: 01
subsystem: ui-styles
tags: [css, tokens, shell, radius, sketch-011, decision-38]
requires:
  - "261004-ly4, 261004-ly5, 261004-ly6 (landed first)"
provides:
  - "--app-radius-control: 10px, the one App-context control radius"
  - "10px radius on every rail, tab-row, More and tools place; the active rail place in weight 600"
affects: [app/src/styles/tokens.css, app/src/styles/shell.css, app/src/styles/home.css, app/src/styles/notebook.css]
tech-stack:
  added: []
  patterns: ["one radius token for App controls; marks keep their own radii"]
key-files:
  created:
    - .planning/quick/261004-ly7-app-radius-sketch-011-decision-38-readme-mark-s-answers-one/261004-ly7-probe.mjs
    - .planning/quick/261004-ly7-app-radius-sketch-011-decision-38-readme-mark-s-answers-one/261004-ly7-baseline.json
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/shell.css
    - app/src/styles/home.css
    - app/src/styles/notebook.css
    - app/src/styles/shell.test.js
    - app/src/styles/tokens.test.js
    - app/src/styles/home.test.js
    - app/src/styles/notebook.test.js
decisions:
  - "Weight 600 is scoped to the rail only; the active tab keeps its shipped weight 400 (Mark's answer 3 read literally)"
  - "The radius sits on the shared .shell__place base rule, so it also reaches More's summary and list items and the header's Search, Import and Export"
metrics:
  duration: "about 25 minutes"
  completed: "2026-10-04"
status: complete
commits: 4
plan_head_before: 100d82f3271c729ef313c2374ebc3da7b1bb6d8e
plan_head_after: 3692270f41a441594176607847d04c8c71839cbd
actuals:
  tokens: 9700
  tasks: 3
  commits: 4
---

# Phase quick-261004-ly7 Plan 01: App radius (sketch 011 decision 38 B) Summary

One 10px App control radius in a single token (`--app-radius-control`) now rounds every rail and tab-row place, the pen's fields and actions, every notebook and home action and Home's lead block. The active rail place also takes weight 600.

## What was built

**Change 1, the radius.**
- `tokens.css` declares `--app-radius-control: 10px` and no longer declares `--app-radius-action`, `--app-radius-lead` or `--app-notebook-field-radius`.
- `shell.css`: `border-radius: var(--app-radius-control)` on the `.shell__place` base rule.
- `home.css`: `.home__lead` and `.home__action` read the control token.
- `notebook.css`: the `.notebook-field` base rule, `.notebook-action` and `.notebook-action--outline` read the control token.
- The pen's fields went from 8 to 10. Everything else was 10 already and stayed 10 through the new token.

**Change 2, the weight.** `shell.css` has a new top-level rule `.shell__rail .shell__place[aria-current='page'] { font-weight: 600 }`, after the unchanged `.shell__place[aria-current='page']` surface rule. The comment above both rules is rewritten as the plan asked.

No JSX, no `app.css`, no `DESIGN.md`, nothing under `.planning/sketches` or `.planning/canvas-generators` changed.

## RED then GREEN

| Step | Commit | Evidence |
|------|--------|----------|
| Task 1 RED | be2ab8f | shell.test.js: Tests 1, 2 and 4 failed; Test 3 (the guard) and every other test passed |
| Task 1 GREEN | d07c96c | shell.test.js and tokens.test.js green; probe `rail` 1182 checks passed |
| Task 2 RED | 9b66ea1 | Tests A to D failed (7 test cases); every other test passed |
| Task 2 GREEN | 3692270 | styles suites green (258 tests); probe `rail,controls,board` 2572 checks passed |

**Re-grep of the old token names** (`app-radius-action|app-radius-lead|app-notebook-field-radius`) before GREEN: every hit was in the five rules and three declarations the task changed, or in tokens.test.js (a historical comment at line 95 and the new Test A's `RETIRED` list). No other hit, so no extra file was repointed. After GREEN the only hits are those two tokens.test.js lines.

## Measurements

Every reading below is Playwright WebKit and system Chrome against the built `app/dist`. It is not a reading from Mark's iPad or iPhone. The baseline (`261004-ly7-baseline.json`) came from a build of the unchanged source, and its as-shipped precondition passed in both engines (every place square, rail weight 400, ceremony fields 8px, actions and lead 10px, the focus pixel reading the ring).

Pointer: WebKit is coarse at 393, 744, 1024 and 1366 and fine at 1600; Chrome is always fine. Both engines gave identical numbers in every cell below, so each row stands for WebKit and Chrome.

| Width | Route | Rail radius (before to after) | Active rail weight (before to after) | Other rail weight | Tab radius (before to after) | Active tab surface / weight | Tools radius | Field | Actions | Lead / home actions | Focus pixel (before to after) | Overflow |
|-------|-------|------|------|------|------|------|------|------|------|------|------|------|
| 393 | home | none | none | none | 0 to 10 | #f3f4f2 / 400 (unchanged) | none | none | none | 10 / 10 | none | 0 |
| 393 | mex3 | none | none | none | 0 to 10 | #f3f4f2 / 400 (unchanged) | none | 8 to 10 | 10 | none | none | 0 |
| 744 | home | none | none | none | 0 to 10 | #f3f4f2 / 400 (unchanged) | none | none | none | 10 / 10 | none | 0 |
| 744 | mex3 | none | none | none | 0 to 10 | #f3f4f2 / 400 (unchanged) | none | 8 to 10 | 10 | none | none | 0 |
| 1024 | home | 0 to 10 | 400 to 600 | 400 | none | none | 0 to 10 | none | none | 10 / 10 | none | 0 |
| 1024 | mex3 | 0 to 10 | 400 to 600 | 400 | none | none | 0 to 10 | 8 to 10 | 10 | none | ring to ground | 0 |
| 1366 | home | 0 to 10 | 400 to 600 | 400 | none | none | 0 to 10 | none | none | 10 / 10 | none | 0 |
| 1366 | mex3 | 0 to 10 | 400 to 600 | 400 | none | none | 0 to 10 | 8 to 10 | 10 | none | ring to ground | 0 |
| 1600 | home | 0 to 10 | 400 to 600 | 400 | none | none | 0 to 10 | none | none | 10 / 10 | none | 0 |
| 1600 | mex3 | 0 to 10 | 400 to 600 | 400 | none | none | 0 to 10 | 8 to 10 | 10 | none | ring to ground | 0 |

("none" means the surface is not rendered in that cell: the rail is hidden below 984 and the tab row above it, the lead is on Home only, the pen and its fields on the recipe route only.)

Box equality: in every cell, every rail place, tab, tools place, reading-view action, ceremony field and action, lead block and home action has a box equal to the baseline within 0.5. Overflow equals the baseline's (0) in every cell. The active rail place's and active tab's backgrounds equal the baseline's.

**Board comparison at 1600 (app-radius.html, row B, weight and focus panels), WebKit and Chrome:**

| Reading | App | Board |
|---------|-----|-------|
| Rail place radius, all six places, Notebook active and Home active | 10px, 183 by 44 | 10px, 183 by 44 (row B) |
| Active place weight | 600 | 600 (fp-wt-pen-rail, fp-wt-home-rail) |
| Focus pixel at the ring's outer top-left corner, Recipe book | ground (255,255,255) | focus-all: ground; focus-one: ring (20,20,20), which is the control confirming the pixel frame |
| Ceremony field radius | 10px | 10px (fp-B-pen-cer) |
| Ceremony action radii | 10px | 10px |
| Lead block and its actions | 10px | 10px (fp-B-home-lead) |

The board draws no tab row. The tab row's radius rests on Mark's answer 3 alone.

Sizes of the ceremony field and the lead block are printed by the probe but not compared to the board. They differ by design of the board and have nothing to do with the radius: field 553.05 by 38.25 on the app against 44 on the board (the board draws the touch floor), and lead 1280 by 111 against 122 (Chrome 121) on the board (its own captured content). The plan asks for radii on those two panels and for width and height on the rail panels only. The first run of the probe compared sizes on all panels and failed on these four readings; the size check was narrowed to the rail places, where the plan names it, and the radii checks were not touched.

## Test count

Before: 59 files, 1602 tests. After: 59 files, 1612 tests (+10, none removed): shell.test.js +4, tokens.test.js +2, home.test.js +1 (and the existing lead pin moved to the control token), notebook.test.js +3. `npm --prefix app run build` succeeds.

## Consequences

- The radius in the `.shell__place` base rule also rounds More's summary and list items and the header's Search, Import and Export. It shows mostly in their focus rings and in /search's active surface.
- The Rename form's fields and actions share the ceremony's rules, so they moved from 8 to 10 too.
- The focus ring on a rail place used to be a square outline and is now a rounded one, in both engines. No engine painted a square ring over a 10px radius, so no stop was needed.

## Deviations from Plan

None to the CSS. One probe adjustment, described above: size comparison against the board limited to the rail places. One probe fix while building it: the board's focus panels carry both a rail and a hidden tab row, so the locator was scoped to `.shell__rail`.

## Notes for the orchestrator

- (a) Sid's generators read the retired token names: `pen.py` lines 30-37 and `radius.py` line 25 set `--app-radius-action`, `--app-radius-lead` and `--app-notebook-field-radius`. A board regenerated from the new `tokens.css` would draw those radii as 0 unless the generator reads `--app-radius-control`. Nothing under `.planning/canvas-generators` was touched.
- (b) For 261004-ly8: the weight rule is scoped to `.shell__rail`. If the fly-out reuses `.shell__place` outside a `.shell__rail` element, it needs the same weight. The new shell.test.js describe pins both rules.
- (c) The app half of todo `2026-09-22-settle-app-context-radius-then-revisit-rail-active-item.md` is built. Its DESIGN.md half is the `/impeccable document` pass. The todo file is left in place.

## For Mark's List

1. **Device check, deferred** (kind: check). Device UAT is served from the build, and Mark's running preview already serves the rebuilt `app/dist`, so a hard reload is enough.
   - iPad at 1366 landscape and 1024 portrait: the rail places are rounded and the current place is bold (Notebook on a recipe, Home on Home). Tap the page, then Tab with Full Keyboard Access off: the ring on a rail place is rounded. Next version: the fields and Cancel / Save are rounded alike. Home: the lead block is unchanged.
   - iPhone at 393: the active tab is a rounded subtle block at its old weight, and More's items are rounded when focused.
   - Device-verified only when Mark confirms.
2. **Decide: the tab row's active weight** (kind: decide). It is built at the shipped 400, reading Mark's answer 3 ("the shipped surface block, with the radius") and the board's rail-scoped weight rule. Options: keep 400 (recommended, the literal answer) or set 600 like the rail (one rule in the shell.css media block).
3. **DESIGN.md text** (kind: decide or todo). The text decision 38 proposes (README.md line 493: Shapes line 405, line 411, and Navigation line 495) is still an `/impeccable document` pass. DESIGN.md now disagrees with the build on the radius and on the active place.

The second recorded reading (the radius on the shared `.shell__place` base rule, so it also reaches More's items and the header tools) is in Consequences above; Mark's List can carry it as part of row 2 or on its own if Mark wants it.

## Threat Flags

None. Style-only change; no new endpoint, auth path or file access.

## Known Stubs

None.

## Self-Check: PASSED

- Files present: tokens.css, shell.css, home.css, notebook.css, the four test files, the probe and the baseline JSON.
- Commits present: be2ab8f, d07c96c, 9b66ea1, 3692270 (`git rev-list --count 100d82f..HEAD` is 4).
- Scope: under `app/`, the four 261004-ly7 code commits touch only the eight planned files; none touches DESIGN.md, `.planning/sketches` or `.planning/canvas-generators`. `git status --porcelain app/` is empty.
- Full suite 59 files / 1612 tests green; build succeeds; probe `rail,controls,board` exits 0 in WebKit and Chrome.
