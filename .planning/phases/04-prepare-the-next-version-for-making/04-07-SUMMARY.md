---
phase: 04-prepare-the-next-version-for-making
plan: 07
subsystem: ui, print
tags: [print-route, sheet-pages, pagination, layPages, balance, wkprint, d29, d-06a, safari-print]

requires:
  - phase: 04-06
    provides: "the print route, the page pictures, print.css and its width-proofing gate, the --sheet-print-* tokens, 04-print-probe.mjs and the wkprint and pdf-pages tools"
provides:
  - "layPages(measure, box) and PAGE_GUARD_PX = 8 (domain/sheetPages.js): the Sheet's formula part laid onto the fixed letter page from measured heights alone"
  - "PrintIngredientTable, PrintBalance, SheetPage, useSheetPages, sheetBlocks, readSheet, printEngine (ui/PrintSheetPages.jsx)"
  - "RuleDrawing exported from GraduatedRule.jsx (the button wraps it unchanged; the printed gauge draws it static)"
  - "groupPortionsByStep and dataFlagFor exported from IngredientTable.jsx"
  - "the route's Sheet pictures after the two logs, one per laid page, aria-label 'Sheet, page n'"
  - "tokens --sheet-print-content-w/h and -webkit, --sheet-print-asmade-col/w/h; locally set --sheet-print-fit-scale"
  - "probe modes measure, sheet and sweep; PROBE_SEED for a seed module with stress versions"
affects: [04-08, 04-09, 04-10]

actuals:
  tokens: 26700
  tasks: 3
  commits: 3
plan_head_before: efb08a3960edc0c26107ca91ab0b782281c46a08
plan_head_after: 0854f47ec11f823c9354f7cc0c7faf37fa78391e
commits: 3

tech-stack:
  added: []
  patterns:
    - "Pages are laid by measurement, not by the printer: a hidden box at the engine's own content box (630 x 900 in WebKit, 672 x 960 elsewhere, both read from tokens through a sized element) is measured once after document.fonts.ready, a pure layPages assigns blocks to pages, every page is its own box"
    - "A slice of the table takes the three column widths measured on the whole table (table-layout fixed over a colgroup), so a page lays exactly as it was measured"
    - "The route leaves its measurement on the hidden box as data-ps-measure, so the probe and the fixtures read what layPages was given"
    - "The probe checks the paper against the laid pages (the DOM), never a second reading of the same page"

key-files:
  created:
    - app/src/domain/sheetPages.js
    - app/src/domain/sheetPages.test.js
    - app/src/domain/sheetPages.fixtures.js
    - app/src/ui/PrintSheetPages.jsx
    - app/src/ui/PrintSheetPages.test.jsx
  modified:
    - app/src/ui/PrintSheet.jsx
    - app/src/ui/PrintSheet.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/GraduatedRule.test.jsx
    - app/src/styles/print.css
    - app/src/styles/print.test.js
    - app/src/styles/tokens.css
    - app/src/styles/tokens.test.js
    - .planning/phases/04-prepare-the-next-version-for-making/04-print-probe.mjs

key-decisions:
  - "The Sheet is laid by measurement in every engine, so Safari keeps the repeated header row exactly as Chrome does (sketch 010 D29). This supersedes option C's accepted 'no repeated header in Safari' (Mark, 2026-10-07); the CSS-only Safari table rule (debug record r8) is not needed, because no table is ever split by a printer."
  - "A group that splits between rows (a one-group table, or a group taller than a page) keeps its step head with its first line and prints no step head on the continuation page; no 'continued' word is printed anywhere."
  - "The row begins on the first page where the Ingredients heading, the header row, a step head and a first line fit under the band and Before you start; otherwise it begins on the next page, Balance with it."
  - "Balance is omitted when a version has no figures (the heading never stands alone); the Total rides with the last line, so it never stands alone under a repeated header."
  - "Column widths of a slice are pinned from the whole table's measured widths; the table keeps the app's own auto layout in the measuring box."

patterns-established:
  - "layPages inputs are measured heights in CSS px; the fixtures hold Olive Oil v1's measured values (the probe's measure mode writes them) and the tests read nothing else"
  - "jsdom has no layout: useSheetPages takes the measuring step as a parameter, and a measured height of 0 lays the whole Sheet on one page"

requirements-completed: [PRINT-01, UX1-03]

coverage:
  - id: D1
    description: "layPages assigns the band, Before you start, the table's step groups and lines, the Total and Balance's gauges and basis note to pages by measured heights, with an 8 px guard: a group stays whole, moves whole, or (one-group table, group taller than a page) splits between rows with its head kept with its first line; the header row repeats alone; the Total rides with the last line; Balance breaks between gauges only, basis note last"
    requirement: PRINT-01
    verification:
      - kind: unit
        ref: "app/src/domain/sheetPages.test.js (D29 breaks at 630 x 900 and 672 x 960, adjacency at the guard, one group, tall group, Total, Balance, 300 constructed tables)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The print table reads As made | Grams | Ingredient per line (a blank 72 x 24 line in an 84 px cell, the stored grams with its unit, the name with the estimated flag as a word and a split row's portion line), one tbody per step group under an ink tick rule, no rule between lines, no tick box, no % column, the Total once with an empty As made cell"
    requirement: PRINT-01
    verification:
      - kind: unit
        ref: "app/src/ui/PrintSheetPages.test.jsx#PrintIngredientTable"
        status: pass
      - kind: other
        ref: "node 04-print-probe.mjs sheet (webkit 1280 screen: band, title, prose, before, notes, headings, header row, 13 + 5 table rows, Total row, 4 + 2 gauges, basis note all 0.00 px from sheet-page-1-formula.html and sheet-page-2-table-tail.html)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Olive Oil v1's formula pages break where sketch 010 D29 draws them: in WebKit's print Steps 2 and 3 with Freezing to Milk solids on the formula page, the header row, Steps 6 and 8, the Total, Sugar, Solids and the basis note on the next; in Chrome's PDF Steps 2, 3 and 6 with five gauges, then the header row, Step 8, the Total, Solids and the basis note"
    requirement: PRINT-01
    verification:
      - kind: other
        ref: "node 04-print-probe.mjs sheet (ALL MATCH: 129 checks, both engines)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Balance prints in column 2 with the plain heading Balance, static gauges (no button), the fat breakdown line, the basis note last, on the page its gauges fall on; every heading and rule prints in ink and the estimated flag is a word"
    requirement: UX1-03
    verification:
      - kind: unit
        ref: "app/src/ui/PrintSheetPages.test.jsx#PrintBalance, app/src/ui/GraduatedRule.test.jsx#RuleDrawing, app/src/ui/tabindex-scan.test.js"
        status: pass
    human_judgment: false
  - id: D5
    description: "Every seed version's formula pages (19) print whole in WebKit's print and Chrome's PDF: every step group's head and lines on one page, the header row opening every table page, the Total once, every gauge once, Before you start on the formula page only when the version has notes, ink inside the content box; and the pages are the same at 1280 fine and 393 coarse"
    requirement: PRINT-01
    verification:
      - kind: other
        ref: "node 04-print-probe.mjs sweep (38 lines, ALL MATCH); with PROBE_SEED stress versions (one 48-line group, a Step 3 taller than a page, Before you start six notes long) all MATCH in both engines"
        status: pass
      - kind: unit
        ref: "app/src/ui/PrintSheetPages.test.jsx (iterates seedRecipeGroups), app/src/styles/print.test.js (width-proofing gate over the Sheet pages' rendered classes)"
        status: pass
    human_judgment: false
  - id: D6
    description: "On the iPad, Safari's own print of Olive Oil v1's sheet gives two log pages then two Sheet pages that break as D29 draws them (header row repeated on the second)"
    requirement: PRINT-01
    verification: []
    human_judgment: true
    rationale: "The probe prints through WebKit's NSPrintOperation (macOS) and Chrome's PDF. WebKit's print reproduces Safari's 0.8 pt per px scaling and its 630 x 900 content box, but Chrome PDF probes do not prove Safari print, and the iPad PDF is the evidence the contract names"

duration: ~45min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 07: The Sheet's formula pages, laid by measurement Summary

**The Sheet's band, Before you start, Ingredients table (As made | Grams | Ingredient) and Balance now print after the log as pages the route lays itself from measured heights, so WebKit repeats the header row and keeps every step group and gauge whole exactly as sketch 010 D29 draws it, in both engines, for all 19 seed versions.**

## Performance

- **Duration:** ~45 min (about 03:10 to 03:55 local; started time was not captured at the start, estimated from the commits)
- **Tasks:** 3 (1 tracer, 2 auto)
- **Files:** 5 created, 10 modified across three commits (plus this summary)
- **Suite:** 74 files, 2335 passed, 0 failed (baseline 2266, 72 files). `npm --prefix app run build` exits 0. Probe modes `logs`, `screen`, `measure`, `sheet`, `sweep` all ALL MATCH against the build in app/dist.

## Accomplishments

- **Tracer (Task 1).** `layPages` (pure, imports nothing) and the measuring pass: the Sheet's blocks render once in a hidden box at the engine's content box (630 x 900 in WebKit, 672 x 960 elsewhere, from tokens, never a literal), heights are read after `document.fonts.ready`, and the route draws one picture per laid page after the two logs. The measured heights agree with CONTRACT section 5 (table 755.1 px, header row 27.4, Step 6 group 73.6, Step 8 group 109.6, Total 31). Tracer gate: `<verify>` is automated-only and `human_verify_mode` is end-of-phase, so the targeted tests and the probe were re-run before expansion and passed (log: tracer verified end to end, expanding).
- **Balance (Task 2).** `RuleDrawing` moves out of `GraduatedRule` (the button's markup is byte-identical, `GraduatedRule.test.jsx` and `FormulationNote.test.jsx` pass with no edit; one test added). `PrintBalance` draws the plain heading, static gauges, the fat breakdown and the basis note last, no button. The gauge split matches D29: Safari four gauges then Sugar, Solids and the basis note; Chrome five then Solids and the basis note.
- **Every seed version (Task 3).** The width-proofing gate now collects the Sheet pages' rendered classes; the test iterates all seed versions; the probe's `sweep` prints each one through WebKit's print and Chrome's PDF and checks the paper against the laid pages.
- **Measured against the boards.** On screen in WebKit at 1280, every band, heading, notes, header row, table row, Total row, gauge and basis note box on both Sheet pictures sits 0.00 px from `sheet-page-1-formula.html` and `sheet-page-2-table-tail.html` in the Sheet's own coordinates (the rules were transcribed from the boards' resolved CSS).
- **Beyond the seeds.** Only Olive Oil v1 has more than one step group, and no seed table is long, so the split path was exercised with three throwaway stress versions built into a scratch copy of the app (one 48-line group, a Step 3 taller than a page, Before you start six notes long so the table begins on the next page). All three print as laid in WebKit and Chrome. The scratch app is not committed; `PROBE_SEED` lets anyone repeat it.

## Task Commits

1. **Task 1 (tracer): the Ingredients table prints across measured pages, header repeated, groups whole** - `e090ac4` (feat)
2. **Task 2: Balance in column 2, static gauges breaking between gauges beside the table's tail** - `56c8df5` (feat)
3. **Task 3: every seed version's formula pages print whole in both engines and read no window width** - `0854f47` (feat)

## Files Created/Modified

- `app/src/domain/sheetPages.js` - `layPages`, `PAGE_GUARD_PX`; pure
- `app/src/domain/sheetPages.fixtures.js` - Olive Oil v1's measured blocks at 630 x 900 (Safari) and 672 x 960 (Chrome)
- `app/src/ui/PrintSheetPages.jsx` - the print table, `PrintBalance`, `SheetPage`, `useSheetPages`, `readSheet`
- `app/src/ui/PrintSheet.jsx` - the Sheet pictures, the engine class, `data-print-ready` only once laid
- `app/src/ui/GraduatedRule.jsx`, `IngredientTable.jsx` - `RuleDrawing`; `groupPortionsByStep` and `dataFlagFor` exported
- `app/src/styles/print.css`, `tokens.css` - the Sheet pages' rules (every value a token) and the new tokens
- `04-print-probe.mjs` - `measure`, `sheet`, `sweep`; `logs` and `screen` now expect the Sheet's pages after the logs

## Decisions Made

See key-decisions. Placement and look questions for Mark are under "For Mark's List" below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The tracer commit dropped the probe's `measure` mode**
- **Found during:** Task 2
- **Issue:** A scripted replacement of `runSheet` in the probe removed the `measure` block inserted beside it; the dispatch still named it, so `measure` threw `runMeasure is not defined`. The tracer's own verification (`sheet`) did not touch it.
- **Fix:** Restored in the Task 2 commit.
- **Files modified:** `04-print-probe.mjs`. **Commit:** `56c8df5`

**2. [Rule 3 - Blocking] `PrintSheet.test.jsx` pinned the picture list to the two logs**
- **Found during:** Task 1 (file not in the plan's list; the plan's own verify command runs it)
- **Fix:** The list is now the two logs then `Sheet, page 1` (jsdom measures nothing, so the whole Sheet lies on one page). **Commit:** `e090ac4`

**3. [Rule 3 - Blocking] The 04-06 probe modes asserted exactly two pages and two pictures**
- **Found during:** Task 3 (`logs` and `screen` reported DIFF once the Sheet's pages followed the logs)
- **Fix:** They now require the two log pages first, every picture a letter page, 20 px between neighbours; the Sheet's pages are the `sheet` and `sweep` modes' to check. **Commit:** `0854f47`

**4. [Rule 3 - Blocking] The gate's class reader loses a className with a template literal**
- **Found during:** Task 1 (`print.test.js` lost `notebook` from the route's classes)
- **Fix:** `PrintSheet.jsx` picks the engine class with a ternary of two plain strings, which the reader reads. **Commit:** `e090ac4`

**5. [Plan variation] `layPages` carries its Balance logic from Task 1**
- The file was written once, whole; Task 1 left the Balance fields empty (as the plan says) and Task 2 added `PrintBalance`, `RuleDrawing`, the Balance fixtures and every Balance test. The Task 1 commit therefore holds code Task 2 first tests.

**6. [Plan variation] No print.css or layPages rule was exposed by the sweep**
- The plan says to record each rule the sweep exposes with the version that exposed it. None did. The sweep exposed two faults in the probe's text matching, both fixed there: Chrome's PDF text carries f-ligatures as single characters (U+FB00, U+FB03; Mocha v0 to v3, "Coffee Beans"), so text is NFKC-normalised before it is compared; and the text extractor reads a vertically centred amount apart from a name that wraps, or after it (WebKit: Mexican Chocolate v1 to v4, Pineapple v1, Coconut v1, Strawberry v1), so a line whose amount and name did not come out adjacent must instead have both on its page as often as the laid lines call for. The step and its lead-in are likewise checked as two runs.

**Total deviations:** 4 auto-fixed (1 bug, 3 blocking), 2 plan variations. **Impact:** none on specified behaviour.

## Issues Encountered

- The commit guard reports `main` as protected; commits went on `main` as the orchestrator instructed, no config change.
- `vite build` writes `app/dist`, which Mark's own `vite preview --host` on :4173 serves; iterations used a scratch `--outDir` through `PROBE_DIST`, and the plan's own build ran at the end of each task.
- Chrome PDF and the macOS WKWebView print do not prove Safari's own print on the iPad. WebKit's `NSPrintOperation` reproduces Safari's 0.8 pt per px scaling and its 630 x 900 content box, and the sweep passes in it, but the iPad PDF remains the evidence.
- **A page can hold only the tail of Balance.** Most one-group seed versions fit their table on the formula page and carry Sugar, Solids or just the basis note onto a second Sheet page in column 2 (Mocha v0 to v3 in Chrome: the basis note alone, ink x 373 to 558). The rules (Balance breaks between gauges, basis note last, `decide-balance-break` = continue) allow it; 04-08 puts the Instructions under the row on that same page (D-06b), which is where those pages fill. Mark meets it first at 04-08's UAT.

## Known Stubs

None.

## Threat Flags

None. T-04-19 (lost ink) is mitigated as planned: an 8 px guard below the usable height, and the probe's `sweep` fails on any ink past a page's content box in WebKit's print or Chrome's PDF for every seed version (0 found). T-04-20 (markup injection): every stored string renders as React text (`PrintSheetPages.test.jsx` feeds a hostile Sheet title and description); `RuleDrawing` draws SVG from numbers only. T-04-SC: no package installed. The hidden box carries `data-ps-measure` (block heights and column widths, numbers only), no new network surface.

## Deferred Human Verification

human_judgment: true (D6). Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

1. On the iPad, open Olive Oil v1, tap Print sheet, then Print, and save to PDF from Safari's own print. Expect four pages: the Batch log, the Tasting log, then two of the Sheet. Sheet page 1: the band, Before you start, Ingredients with Steps 2 and 3, Balance with Freezing, Sweetness, Fat and Milk solids. Sheet page 2: the header row (As made, Ingredient) alone, Steps 6 and 8, the Total once, Sugar, Solids and the basis note. No "continued", no step cut in half. (The Instructions and the closing foot arrive with 04-08.)

## For Mark's List

This executor has no ArtifactData tool; rows for the orchestrator to add:

- **look**, `owner: mark`, `needs: answer`, slug `look-sheet-laid-by-measurement`: "The Sheet's pages are now laid by measurement, so Safari prints the repeated header row as sketch 010 D29 draws it. This supersedes option C's accepted 'no repeated header in Safari' (2026-10-07). Keep?" (a look row: approve or change; no options). `where`: Print route of Olive Oil v1, Sheet pages 1 and 2.
- **look**, `owner: mark`, `needs: hands`, slug `look-sheet-pages-ipad-print`: the device step above, iPad Safari's own print to PDF of Olive Oil v1. `where`: iPad, the print route.
- **look**, `owner: mark`, `needs: answer`, slug `look-sheet-balance-tail-alone`: "A second Sheet page can hold only the tail of Balance (the basis note alone for Mocha in Chrome) until 04-08 puts the Instructions under it. Fine, or should the basis note ride under the table instead?" (a look row; the rules as approved allow it).

## Self-Check: PASSED

- Created files exist: `sheetPages.js`, `sheetPages.test.js`, `sheetPages.fixtures.js`, `PrintSheetPages.jsx`, `PrintSheetPages.test.jsx` (FOUND)
- Commits `e090ac4`, `56c8df5`, `0854f47` are ancestors of HEAD; `git rev-list --count` from the recorded base is 3
- `sheetPages.js` imports nothing and exports `layPages` and `PAGE_GUARD_PX = 8`; the px-literal check on `PrintSheetPages.jsx` exits 0; `RuleDrawing` is exported; `GraduatedRule.test.jsx` and `FormulationNote.test.jsx` held no edit but one added test; `IngredientTable.test.jsx` untouched and passing; the tab-stop scan's allowlist is still the one `GraduatedRule` entry and passes
- `npm --prefix app test`: 74 files, 2335 passed, 0 failed; `npm --prefix app run build` exits 0
- `04-print-probe.mjs` `sheet` (ALL MATCH), `sweep` (38 lines, ALL MATCH), `logs` and `screen` (ALL MATCH) against app/dist; 0 off-host requests
- Post-commit deletion check: no deletions
