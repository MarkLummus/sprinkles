---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 04
subsystem: testing
tags: [board-against-build, playwright-webkit, sketch-015, conformance, record-pen, reading, printed-logs]
status: complete

requires:
  - phase: 12-01
    provides: kind-aware pen anchors and stop names, the reading's Low to high text
  - phase: 12-02
    provides: printed row without .lf-mid, 36 px rows, 144 px drop, 13 and 4 notes lines
  - phase: 12-06
    provides: 12-cases.mjs (CASES, arrive)
  - phase: 12-07
    provides: 12-board-check.mjs engine and 12-board-selftest.mjs stand-ins
provides:
  - "12-board-pen.mjs: six pen panels (Coffee, Mint chip, Mexican Chocolate at 1366 and at 393)"
  - "12-board-reading.mjs: six reading panels, same recipes and widths"
  - "12-board-logs.mjs: the four drawn log pages (Batch log, three Tasting logs)"
affects: [12-05, phase verifier, round two (Gate 2 regression)]

tech-stack:
  added: []
  patterns:
    - "A panel factory per spec module: one function builds a panel from { caseKey, recipe, width, index }, so a 393 panel is its 1366 twin with overflow set"
    - "Absence declared by structure: a text cue cannot be an absent selector, so the none panels declare the declared-group classes (pen) and the sibling combinator .tasting-reading__group ~ .tasting-reading__group (reading)"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-pen.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-reading.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-logs.mjs
  modified: []

key-decisions:
  - "The specs call 12-cases.mjs's arrive from their steps hook (origin taken from page.url()), so the injection order is the one 12-cases.mjs documents; the print panels then navigate to the case's route plus /print"
  - ".lf-datebox (box) is measured beside .lf-title on every log page: it is the first thing on the page, so its box is the direct measure of the 144 px start"
  - "12-board-check.mjs was not edited; no fault in the engine showed, so 12-07's Task 2 verify did not need a rerun on this plan's account (its stand-ins ran inside the same command anyway)"

requirements-completed: [TASTE-04, LOG-01]

duration: 40min
completed: 2026-11-16
commits: 2
plan_head_before: 20779ebeb9bc4c79108c9bba177f25b5a0f85c11
plan_head_after: b26d3a571d6aaa75d92dd5bac41b4547c8289764

actuals:
  tokens: 3900
  tasks: 2
  commits: 2
---

# Phase 12 Plan 04: Board against build for sketch 015 Summary

**Sketch 015's sixteen drawn Gate 1 panels (six pens, six readings, four printed log pages) measure equal to the build in Playwright WebKit with a coarse pointer at 1 px: 1090 PASS, 0 FAIL, and the 1 px font run moves each of the sixteen.**

## What was done

- Task 1 (tracer): `12-board-pen.mjs` with Coffee at 1366 (record-pen.html, `.fp-win.p12w-1366` index 0, case two). Steps: `arrive` (inject case two, reload), Record another, Add tasting, Body 4 and Coffee flavour 2, ticks Bitter and Burnt taste. Anchor `.axes-grid` (scales and Any problems?). Elements: `.axis-mark` (count, box), `.axis-mark__name` (text, font), `.axis-mark__state` (count, text), `.axis-mark__anchors span` (count, text, box), `.axis-mark__stop` (count, box), the stops' radios (attr aria-label), the cues and `.chip-toggle` chips. 138 PASS, 0 FAIL and `PASS selftest pen-coffee-1366`. Tracer gate: automated verify only, so re-verified and expansion went ahead.
- Task 2: pen extended to six panels (Mint chip and Mexican Chocolate at 1366, all three at 393 with `overflow`); `12-board-reading.mjs` with six panels (Tasting fold opened when closed; group labels, cells, cell labels and values, problems text, font and colour); `12-board-logs.mjs` with the four drawn pages (`.dl-page` indexes 2 to 5; the two "As built today" pages are left out with a comment). Anchors `.print-page--log:not(:has(.lf-srow))` (Batch log) and `.print-page--log:has(.lf-srow)` (Tasting logs); `pageHeight` on all four; `appStyle` `.print-route__pages{--sheet-print-picture-scale:1 !important}`; the Batch log declares `.lf-srow`, `.lf-anchor`, `.lf-num` and `.lf-mid` absent (four PASS lines); the foot's box and face on every page, its words on the Mexican Chocolate page only, with the comment citing p12.py:32, 34 and 163 and CONTRACT section 3.

## Verification

Task 2's verify command, with the build made by `npx vite build --outDir ${TMPDIR}sprinkles-12/dist-04 --emptyOutDir` from `app/` (the plan's `npm --prefix app run build -- --outDir` form was not used; same build, no app/dist written) and `PROBE_DIST` pointing at it:

```
PROBE_DIST=$S/dist-04 node 12-board-check.mjs 12-board-selftest.mjs 12-board-pen.mjs 12-board-reading.mjs 12-board-logs.mjs --selftest --evidence $S/evidence-04
exit 0; 1090 PASS, 0 FAIL
FAIL lines: 0
"PASS selftest" lines without "refused:": 17 (read-self-1366, 6 pens, 6 readings, 4 logs)
"PASS selftest" lines with "refused:": 5 (selftest-blind, count, anchor, undeclared, value)
evidence folder: a board and app picture pair per panel (35 files with README.md)
```

Acceptance greps all hold: `record-pen.html` 3, `panelSelector` 1, `aria-label` 2, `12-cases.mjs` 3 (pen); `p12w-393` 1; `reading.html` 3; `printed-logs.html` 3; `pageHeight` 2; `overflow` in reading 1; `:has(.lf-srow)` 2; `--sheet-print-picture-scale:1 !important` 1; `p12.py` 3.

Plan-level: `git log --name-only --format= --grep='(12-04)' -- app` prints nothing. Neither `12-board-check.mjs` nor any file under `app/` was edited, so 12-07's Task 2 verify was not rerun for an edit; its five stand-ins and its self-held pass ran again in the same command above and passed.

Evidence that the checks bite, beyond `--selftest`:
- With `appStyle` set to a scale of 0.5 (a scratch copy of the logs spec, deleted), `pageHeight` fails on all four pages (`board 1056, app 528`), so the `!important` override reaches the inline style and `pageHeight` sees a scale other than 1. With `appStyle` empty all four pass (board 1056, app 1056): on screen at 1366 the app's own scale is already 1, so the override is a guard, not a repair.
- Spot-checked the evidence pictures: Coffee pen at 1366 (board and app identical), Coffee reading at 393, Coffee Tasting log (no "right" and no 2 3 4 under Coffee flavour, the four notes lines, the foot).

## Board against build differences

| Panel | Selector | Check | Board value | Build value | Owner | File |
|-------|----------|-------|-------------|-------------|-------|------|

Empty: no panel, selector or check differs. Every drawn Gate 1 surface equals the build within 1 px.

## Deviations from Plan

### Auto-fixed Issues

None - plan executed as written. Two small additions inside the plan's intent: `.axis-mark__state` (the "(4)", "(2)" read-out) is measured on the pen panels that carry marks and declared absent on the none panels; `.lf-datebox` (box) is measured on every log page (see key-decisions). The none reading panels also measure `.tasting-reading__group` (count) so the missing second group is a count as well as an absent line.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. The specs add no new network surface; the engine still loads board pages from `file:` only and the app from 127.0.0.1, with PROBE_DIST read only (a scratch build, never app/dist). The `T-12-19` mitigations hold: the foot's text check is left out on two pages only by a declared substitution with its comment, the Batch log's absent selectors each print a PASS line, `pageHeight` is on every log panel, and `--selftest` moved each of the sixteen drawn panels.

## Notes for the orchestrator

- No difference to route to `/gsd-plan-phase 12 --gaps`, Sid or Mark; no row held back on `bug-p11-low-to-high-scale-centre-mark` on this plan's account (12-05's built-app probe is still its own step).
- No Mark's List row (D-14). Deploy: no app file changes in this plan; safe.
- The stored Sheet code in a real foot is still 12-03's round-trip check; the Coffee and Mint chip feet's example words are the board's (p12.py:32, 34, 163), so only the Mexican Chocolate foot's words are compared (they match, `4144-RCQJ`).
- `.review-diagnostics/` was not touched. The worktree's `app/node_modules` is a symlink to the main checkout's copy (gitignored).

## Self-Check: PASSED

- 12-board-pen.mjs, 12-board-reading.mjs and 12-board-logs.mjs exist in the phase folder.
- Commits a44e58d7 (Task 1) and b26d3a57 (Task 2) are ancestors of HEAD; `git rev-list --count 20779ebe..HEAD` printed 2 before this SUMMARY's own commit.
