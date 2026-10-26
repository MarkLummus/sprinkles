---
phase: quick-261025-uge
plan: 01
subsystem: shell
tags: [ultra-wide, frame, shell, sketch-011-decision-59]
status: complete
requires: [decide-ultrawide-frame, decide-ultrawide-lists]
provides:
  - "--app-frame-max (1770) and the centred one-block shell from a 1770 window"
key-files:
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js
  created:
    - .planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs
decisions:
  - "Rail and page are one block capped at --app-frame-max (224 + 1482 + 2 x 32 = 1770) and centred; lists fill it; notebook.css's cap stays"
  - "The Import error panel's inset-inline-end shares the bar's padding-inline expression, so it stays under Import"
commits: 2
plan_head_before: a3c7413c282dcb7831cfc6ca9fc845aa93f73009
plan_head_after: 7816aa05b19a33faa339e0e9ff9d71acfcdf5a09
actuals:
  tasks: 2
  commits: 2
---

# Phase quick-261025-uge Plan 01: Ultra-wide frame Summary

From a 1770 window the rail and the page are one block, capped by one new token (`--app-frame-max`, 224 + 1482 + 2 x 32 = 1770) and centred; the wordmark and tools sit over the block's edges, the bar's ground spans the window, and the Import error panel follows the tools. Below 1770 nothing moves.

- BASE: a3c7413c (the plan named fba9974c; HEAD was a3c7413c, a docs-only commit on top, tree clean)
- Commits: cf64aa70 (feat: token, three declarations, 5 tests, probe) and 7816aa05 (fix: probe reads Chrome's own tools width for the 2560 left edge)
- Counts: styles 410 (405 + 5); full suite 120 files, 3771 tests (3766 + 5)
- Walk: `MATCH 94 snapshots`
- `compare before before` last line: `154 PASS, 38 FAIL` (exit 1; the 36 shift failures and the 2 Home target2560 failures prove those gates bite on the as-built frame)
- Final compare last line: `192 PASS, 0 FAIL` (98 records: 2 engines x 7 widths x (6 routes + the Import panel); no pre-existing overflow found)

## What changed

- tokens.css: `--app-frame-max` after `--app-size-nav-w`, with a trailing comment naming sketch 011 decision 59 and decide-ultrawide-frame.
- shell.css: `.shell__body` gains `width: 100%; max-width: var(--app-frame-max); margin-inline: auto`; `.shell__head` gains `padding-inline: max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page)))` after its shorthand; `.shell__import-errors` takes the same expression for `inset-inline-end`. Header comment extended. No media condition added; the five stay.
- shell.test.js: one new describe (5 tests) and the Import panel's exact declaration list updated.
- Nothing else touched (notebook.css, app.css, home.css, print.css, app/src/ui, router.jsx, main.jsx, DESIGN.md all unchanged against BASE).

## Measured (fine pointer, 1000 tall, DSF 1; l/r unless noted)

WebKit (Chrome differs only in text widths: tally l is x.1 instead of x.3; its tools are 364 wide, not 367.5):

| W | set | rail | nav l | main | wordmark l | tools r | Home row l/r/w | tally l | band | Sheet | log | overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1366 | before | 0/0 | 0 | 0/1366 | 92 | 1318 | 48/1318/1270 | 848.3 | 32/1334 | 32/952 | 984/1334 | 0 |
| 1366 | after | 0/0 | 0 | 0/1366 | 92 | 1318 | 48/1318/1270 | 848.3 | 32/1334 | 32/952 | 984/1334 | 0 |
| 1770 | before | 0/224 | 20 | 224/1770 | 48 | 1722 | 272/1722/1450 | 1252.3 | 256/1738 | 256/1356 | 1388/1738 | 0 |
| 1770 | after | 0/224 | 20 | 224/1770 | 48 | 1722 | 272/1722/1450 | 1252.3 | 256/1738 | 256/1356 | 1388/1738 | 0 |
| 1920 | before | 0/224 | 20 | 224/1920 | 48 | 1872 | 272/1872/1600 | 1402.3 | 331/1813 | 331/1431 | 1463/1813 | 0 |
| 1920 | after | 75/299 | 95 | 299/1845 | 123 | 1797 | 347/1797/1450 | 1327.3 | 331/1813 | 331/1431 | 1463/1813 | 0 |
| 2560 | before | 0/224 | 20 | 224/2560 | 48 | 2512 | 272/2512/2240 | 2042.3 | 651/2133 | 651/1751 | 1783/2133 | 0 |
| 2560 | after | 395/619 | 415 | 619/2165 | 443 | 2117 | 667/2117/1450 | 1647.3 | 651/2133 | 651/1751 | 1783/2133 | 0 |
| 3440 | before | 0/224 | 20 | 224/3440 | 48 | 3392 | 272/3392/3120 | 2922.3 | 1091/2573 | 1091/2191 | 2223/2573 | 0 |
| 3440 | after | 835/1059 | 855 | 1059/2605 | 883 | 2557 | 1107/2557/1450 | 2087.3 | 1091/2573 | 1091/2191 | 2223/2573 | 0 |

Chrome after, same rows: 1920 rail 75/299, wordmark 123, tools r 1797, rows 347/1797/1450; 2560 rail 395/619, main 619/2165, tools r 2117, rows 667/2117, tally 1647.1; 3440 rail 835/1059, wordmark 883, tools r 2557, rows 1107/2557.

No-change count at 393, 1366, 1600 and 1770: 56 of 56 records equal to base in both engines (6 routes x 4 widths x 2 engines = 48, plus 8 Import-panel records). Shift gate: all 36 above-1770 route records (3 widths x 6 routes x 2 engines) are the 1770 box moved by 75, 395 or 835; recipe, print and creation notebook boxes equal base at the same width. The panel's right edge equals the tools' right edge at every width from 1366 up.

## Deviations from Plan

**1. [Rule 1 - Bug in own gate] The 2560 `tools` left edge is WebKit-specific.** Decision 59's 1749.5 is WebKit's tools width (367.5). Chrome's tools are 364 wide in the base build too (1358 to 1722 at 1770), so its left edge is 1753. The probe now checks the left edge in WebKit only and the right edge (2117) in both; the CSS did not change. Fixed in 7816aa05.

**2. Red run:** of the 5 new tests, 4 failed before the CSS plus the edited panel test; test 5 (no media rule reads the token, the five conditions) passes trivially on the base because the behaviour it pins is "nothing added", so it could only fail after a wrong edit.

**3. Base commit:** the plan's BASE text named fba9974c; the real HEAD was a3c7413c (docs-only pre-dispatch artifacts). Same app tree. Committed on `main`, as dispatched for this sequential run.

Auth gates: none. Stubs: none. Threat flags: none.

## For the orchestrator

- Close decide-ultrawide-frame and decide-ultrawide-lists on Mark's List if either is still open (this executor has no ArtifactData and wrote no row).
- Give Mark the one device check in chat (one check, no row): on his ultra-wide monitor, in his own browser, served from the build, Home and Olive Oil v1 at full window width. Expect the rail and the page as one block centred in the window, the wordmark and tools over the block's edges, the bar's ground and hairline across the window, and Home's rows 1450 wide. With a bad file, Import's error panel opens under Import.
- The one addition beyond the survey's two rules is the Import error panel's `inset-inline-end` (sketch 011 decision 52 B). The 2560 boards do not draw the panel, so it is a follow-up for Sid: draw it on UW_Home if he wants it on the board, and DESIGN.md line 451's "at the right gutter" may say "the block's right gutter".
- Untracked `.review-diagnostics/` directories under phases 08, 09 and 10 pre-date this task and were not touched.
- Scratch builds and records are in `${TMPDIR}/sprinkles-uge` (before, after, before.json, after.json); app/dist (mtime 1792972947) and the 4173 preview (PID 31386) were untouched.

## Deferred Human Verification

Measured in WebKit and Chrome on the dev machine only, not on Mark's ultra-wide monitor.

## Self-Check: PASSED

cf64aa70 and 7816aa05 are on main; the four files exist; style suites 410 and full suite 3771 pass; walk MATCH 94 snapshots; scope guards held (only the four files changed, one token added, app/dist and the 4173 preview unchanged).
