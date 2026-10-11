---
phase: 04-prepare-the-next-version-for-making
plan: 08
subsystem: ui, print
tags: [print-route, instructions, closing-foot, layPages, method-treatment, wkprint, d29, d-06b, safari-print]

requires:
  - phase: 04-07
    provides: "layPages and PAGE_GUARD_PX, the measuring pass, PrintIngredientTable, PrintBalance, SheetPage, useSheetPages, sheetBlocks, probe modes measure, sheet and sweep"
provides:
  - "layPages lays the Instructions (heading, whole steps, step gap) and the closing foot after the page row; one named branch, instructionsFollowRow, holds D-06b's rule"
  - "PrintInstructions and PrintClosingFoot (ui/PrintSheetPages.jsx): the mp-* method markup and the foot, every step and every word of the foot rendered as React text"
  - "the print method treatment in print.css (32 px number column, tag row with caps label and bold underlined value, why line, aside callout behind a 2.5 px ink rule, mp-foot), every value a token"
  - "tokens --sheet-print-step-n-col (32 px) and --sheet-print-tag-underline-offset (3 px)"
  - "probe mode check: logs, screen, sheet and sweep in one run; sweep also checks every seed version's Instructions and foot"
affects: [04-10]

actuals:
  tokens: 24000
  tasks: 3
  commits: 3
plan_head_before: 4f8c94342faa35e1471645d515f5fc3332779225
plan_head_after: 646d1525e7676b2f4c6f4bc48fded75cf907addd
commits: 3

tech-stack:
  added: []
  patterns:
    - "The Instructions are laid after the page row as chunks: one under the row's tail on the page where the row ends, the rest on pages of their own; the foot keeps with the last step and takes the heading with it when that step was the only one under the row"
    - "The decision about where the Instructions start lives in one function (instructionsFollowRow) so either answer is a one-line change"
    - "A shortened fixture (shortened() in sheetPages.test.js) builds the cases D29 does not draw from the heights it does measure"

key-files:
  created: []
  modified:
    - app/src/domain/sheetPages.js
    - app/src/domain/sheetPages.test.js
    - app/src/domain/sheetPages.fixtures.js
    - app/src/ui/PrintSheetPages.jsx
    - app/src/ui/PrintSheetPages.test.jsx
    - app/src/ui/PrintSheet.jsx
    - app/src/styles/print.css
    - app/src/styles/print.test.js
    - app/src/styles/tokens.css
    - .planning/phases/04-prepare-the-next-version-for-making/04-print-probe.mjs

key-decisions:
  - "The Instructions follow the page row's tail wherever the row ends, and open a page of their own only when both columns end on the formula page (Mark, 2026-10-11, decide-instructions-when-balance-continues: option-a). D-06b's 'when the table fits' reads as 'when the page row fits'; the rule is instructionsFollowRow in sheetPages.js and changes no code from Task 1."
  - "The closing foot is Sheet title, version line and sheetCode(version) joined by a middle dot, no side label, no page n of m, kept with the last step (sketch 010 D7, D28)."
  - "The sweep checks the foot comes after the last step, not that it is last in the page's text, because the extractor reads the foot's baseline among the last step's lines."

patterns-established:
  - "Printed step text is React text in mp-* elements: no em or i, no target chip class, the word why the only addition"

requirements-completed: [PRINT-02, PRINT-04]

coverage:
  - id: D1
    description: "layPages places the Instructions after the page row: 20 px under the row's tail on the page where the row ends, steps whole 20 px apart, the heading once with the first step, a step that does not fit opening the next page with no heading, the foot 32 px under the last step and kept with it (the last step, and the heading when it was alone, move with it); the Instructions open their own page only when both columns end on the formula page"
    requirement: PRINT-02
    verification:
      - kind: unit
        ref: "app/src/domain/sheetPages.test.js (D29 breaks at 630 x 900 and 672 x 960, heading with first step, foot with last step, exact usable height and one pixel more, 300 constructed Sheets, the table-fits-Balance-continues case for both engines, the method-page split 1 to 7 and 8 to 10)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Each step prints with the method treatment: the display number in a 32 px column, the bold lead-in and the instruction, typed targets as a tag row (caps label, bold underlined value, no box), Why as the word why, an em dash and the sentence, the aside as a callout behind a 2.5 px ink rule; upright; a step without targets, purpose or aside prints no tag row, no why line, no callout"
    requirement: PRINT-02
    verification:
      - kind: unit
        ref: "app/src/ui/PrintSheetPages.test.jsx#PrintInstructions (verbatim 69 °C, 10–12 min, −20 °C, 4+ h; no em or i, no target chip; empty-field cases), app/src/styles/print.test.js"
        status: pass
    human_judgment: false
  - id: D3
    description: "Portion grams print as stored (1.04 g, 0.16 g) and the Total through formatGrams' one decimal (799.7 g)"
    requirement: PRINT-02
    verification:
      - kind: unit
        ref: "app/src/ui/PrintSheetPages.test.jsx#PrintIngredientTable [edge PRINT-02/precision]"
        status: pass
    human_judgment: false
  - id: D4
    description: "Olive Oil v1 prints five pages in WebKit's print and Chrome's PDF: the two log sides, the formula page, the table's tail with steps 1 to 4 (WebKit) or 1 to 5 (Chrome), and the rest with the closing foot; on screen in WebKit the third Sheet picture's steps and foot match sheet-page-3-instructions-end.html"
    requirement: PRINT-02
    verification:
      - kind: other
        ref: "node 04-print-probe.mjs sheet (inside check: ALL MATCH, 0 DIFF or FAIL)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Every seed version (19) prints whole in both engines: every step on one page, the heading once on the first Instructions page, the closing foot once after the last step carrying the same code as the route's line and both log feet, no ink past the content box, the same at 1280 fine and 393 coarse"
    requirement: PRINT-04
    verification:
      - kind: other
        ref: "node 04-print-probe.mjs check (logs, screen, sheet, sweep: 1201 MATCH lines, ALL MATCH, exit 0) against a fresh scratch build"
        status: pass
    human_judgment: false
  - id: D6
    description: "On the iPad, Safari's own print of Olive Oil v1 gives five pages: Batch log, Tasting log, the formula page, the table's tail with Instructions 1 to 4, then 5 to 10 and the foot; the same code on the line, both log feet and the foot; nothing cut"
    requirement: PRINT-04
    verification: []
    human_judgment: true
    rationale: "The probe prints through WebKit's NSPrintOperation (macOS) and Chrome's PDF. WebKit's print reproduces Safari's 0.8 pt per px scaling and 630 x 900 content box, but neither proves the iPad's Safari print; the iPad PDF is the evidence (memory: safari-print-differs-from-chrome-print)."

duration: ~1h 40min across two agents (Task 3 about 20 min)
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 08: The Instructions and the closing foot, laid by measurement Summary

**A printed Olive Oil v1 is now the whole bench sheet: the Instructions print in sketch 010's method treatment 20 px under the table's tail, the Sheet ends with a foot carrying the Sheet code, and all 19 seed versions pass the WebKit and Chrome sweep.**

## Performance

- **Duration:** about 1h 40min in two sessions (Task 1 and its probe fix, then Task 2's recorded decision and Task 3)
- **Tasks:** 3 (1 tracer, 1 decision, 1 auto)
- **Files:** 0 created, 10 modified; 3 code commits (plus this summary)
- **Suite:** 76 files, 2429 passed, 0 failed (baseline 2424, 76 files). `npm --prefix app run build` exits 0. `04-print-probe.mjs check` prints ALL MATCH (1201 MATCH lines, no DIFF or FAIL) against a scratch build.

## Accomplishments

- **Tracer (Task 1).** `layPages` gains the Instructions and the foot; `PrintInstructions` and `PrintClosingFoot` render the mp-* markup; print.css carries the method treatment under `.print-page` with every value a token. Olive Oil v1 prints five pages in both engines, steps 1 to 4 on page 4 in WebKit and 1 to 5 in Chrome, the foot after the last step.
- **Decision (Task 2).** Mark answered option-a in the terminal: the Instructions follow the row. The rule `instructionsFollowRow` already returned `pages.length > 1`, so no code changed; the decision is recorded here and in STATE.
- **The fits case and the method pages (Task 3).** New tests lay a short table (Olive Oil v1's measured heights with two of its four groups) for both column outcomes. With the table ending but Balance continuing (Sugar, Solids, basis note on page 2), the Instructions start 20 px under Balance's tail on page 2 in both engines. With both columns ending on the formula page, the Instructions open page 2: steps 1 to 7 then 8 to 10 and the foot at 630 x 900 and at 672 x 960, the heading on the first only (CONTRACT § 6).
- **Edges.** A step landing on the usable height stays and one pixel more moves (tested with the heading, and with the foot); no tag row, no why and no aside for a step without them; 69 °C, 10–12 min, −20 °C, 4+ h verbatim; 1.04 g, 0.16 g and 799.7 g as stored.
- **Probe.** `check` runs logs, screen, sheet and sweep. The sweep reports where the Instructions begin for each version. In the seeds, Chrome's PDF of Pineapple v1 is the one case where both columns end on the formula page (Instructions on their own page 2); every other version, and Pineapple v1 in WebKit, has the Instructions under the row on page 2. Olive Oil v1 is the only version that needs three Sheet pages.

## Task Commits

1. **Task 1 (tracer): the Instructions follow the table's tail and the Sheet ends with its foot** - `df962fa` (feat)
2. **Task 1 follow-up: the sweep reads the foot after the last step, not last in the page's text** - `598ba38` (fix, probe)
3. **Task 2: decision recorded, option-a** - no commit (no code changed)
4. **Task 3: the fits case, the method-page split, the precision edges, probe `check`** - `646d152` (test)

## Files Created/Modified

- `app/src/domain/sheetPages.js` - `layInstructions`, `instructionsFollowRow`
- `app/src/domain/sheetPages.fixtures.js` - step, heading and foot heights at both widths
- `app/src/ui/PrintSheetPages.jsx` - `PrintInstructions`, `PrintClosingFoot`, the foot text, the measuring of steps and foot
- `app/src/ui/PrintSheet.jsx` - passes the version's identity through to the foot (not in the plan's file list)
- `app/src/styles/print.css`, `tokens.css`, `print.test.js` - the method rules and the two tokens
- `app/src/domain/sheetPages.test.js`, `app/src/ui/PrintSheetPages.test.jsx` - the layout, markup and edge tests
- `04-print-probe.mjs` - Instructions and foot in `sheet` and `sweep`, mode `check`

## Decisions Made

See key-decisions.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] PrintSheet.jsx needed an identity prop for the foot**
- **Found during:** Task 1
- **Issue:** The foot's words need the version line and Sheet code; PrintSheet.jsx was not in the plan's file list.
- **Fix:** It passes the identity through to the pages. **Commit:** `df962fa`

**2. [Rule 1 - Bug] The sweep demanded the foot be last in the page's text**
- **Found during:** Task 1 follow-up
- **Issue:** The text extractor orders by baseline, so the foot's line can sit among the last step's lines; "last in the text" failed on a correct page.
- **Fix:** The check is that the foot comes after the last step's lead-in. **Commit:** `598ba38`

**3. [Plan variation] Chrome's step end differs from CONTRACT's**
- D29 draws Chrome's steps 1 to 5 ending at 897.5 under WebKit's 216.3 px row; Chrome's own row is 195 px (its basis note is 84), so they end at 876.1. The test pins 876.1 for Chrome and 873.0 for WebKit; the breaks are the same as D29's.

**4. [Plan variation] formulaPart helper in sheetPages.test.js**
- The 04-07 formula tests lay the part without the Instructions, so Task 1 added a `formulaPart` helper (the measure with `steps: []` and `foot: 0`) rather than editing each assertion.

**5. [Plan variation] Two tokens added**
- `--sheet-print-step-n-col` (32 px) and `--sheet-print-tag-underline-offset` (3 px), as the plan asked.

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking), 3 plan variations. **Impact:** none on specified behaviour.

## Authentication Gates

None.

## Issues Encountered

- The commit guard reports `main` as protected; commits went on `main` as the orchestrator instructed, no config change.
- A first build in this session went to `app/dist`, which Mark's `vite preview --host` on :4173 serves (it only refreshed the build he serves); the probe then ran against a scratch `--outDir` through `PROBE_DIST`.
- Chrome PDF and WebKit's print do not prove Safari's own print on the iPad.

## Known Stubs

None.

## Threat Flags

None. Step text and the foot render as React text; no `dangerouslySetInnerHTML` was added (T-04-22). The sweep fails on any step spanning two pages or ink past a content box, in both engines, for every seed version (T-04-21).

## For Mark's List

- Existing row `look-print-instructions-page-olive-oil` covers the look; `decide-instructions-when-balance-continues` is answered (option-a) and closed.
- The iPad PDF of the bench sheet is the deferred human check below.

## Deferred Human Verification

human_judgment: true (D6). On the iPad, with the build served by `npm --prefix app run build && npm --prefix app run preview -- --host`: print Olive Oil v1 from its version row (Share, Print, Save to PDF or a printer) with the print dialog's headers and footers off. Expect five pages: Batch log, Tasting log, the formula page (Steps 2 and 3, four gauges), the table's tail with the header row again, Steps 6 and 8, the Total, Sugar and Solids and Instructions 1 to 4, then Instructions 5 to 10 and the foot; the same code on the line, both log feet and the foot; nothing cut. This PDF is the device proof (Safari print differs from Chrome's). Mark's List rows: `check-whole-loop-on-paper-after-phase-4` (existing) and the iPad PDF of the bench sheet.

## Self-Check: PASSED

- Commits `df962fa`, `598ba38`, `646d152` are ancestors of HEAD.
- The files listed under key-files exist; the full suite passes (76 files, 2429 tests); `04-print-probe.mjs check` prints ALL MATCH.
