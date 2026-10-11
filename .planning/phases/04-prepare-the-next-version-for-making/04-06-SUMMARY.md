---
phase: 04-prepare-the-next-version-for-making
plan: 06
subsystem: ui, print
tags: [print-route, batch-log, tasting-log, sheet-code, wkprint, print-css, d-04, d-07a, d22]

requires:
  - phase: 04-02
    provides: "sheetCode(version) for the route line and every foot"
  - phase: 04-03
    provides: "version.declaredFlaws, DEFECTS, PRINTED_MARK_ONE_OPTIONS"
provides:
  - "printPath and the /notebook/:recipeId/:versionId/print route (PrintSheetForRoute, PrintSheet); a Print sheet link in the version row's acts"
  - "BatchLogPage, TastingLogPage, logFootText: the blank log pages from the built pens' tables and the version's own declared lists"
  - "axesForVersion in axes.js"
  - "app/src/styles/print.css: the route's screen rules, the lf-* page rules, @page letter 0.5in 0.75in, the print block"
  - "the --sheet-print-* token family and the locally set --sheet-print-picture-scale"
  - "04-print-probe.mjs (modes logs, screen); WKP_READY in wkprint.swift; an ink mode in pdf-pages.swift"
affects: [04-07, 04-08]

actuals:
  tokens: 28000
  tasks: 3
  commits: 3
plan_head_before: 0f3e73226e077c71e81e6c2e5b11c314b2fdb852
plan_head_after: 43e46d07ea712e7cd88c61b0be7bc1982954f9aa
commits: 3

tech-stack:
  added: []
  patterns:
    - "Print rules live in print.css, read by print.test.js with an at-rule-aware reader; every visual value is a token, the @page descriptors are the only literals"
    - "Page pictures scale as a whole by one inline custom property measured in the component; the pages never reflow to the window"
    - "Print probe: async wkprint (a blocking exec starves the in-process static server), per-page visible ink measured from a raster of the PDF, element boxes compared with the sketch boards"

key-files:
  created:
    - app/src/ui/PrintSheet.jsx
    - app/src/ui/PrintSheet.test.jsx
    - app/src/ui/PrintLogPages.jsx
    - app/src/ui/PrintLogPages.test.jsx
    - app/src/styles/print.css
    - app/src/styles/print.test.js
    - .planning/phases/04-prepare-the-next-version-for-making/04-print-probe.mjs
  modified:
    - app/src/router.jsx
    - app/src/main.jsx
    - app/src/ui/notebookPaths.js
    - app/src/ui/notebookPaths.test.js
    - app/src/ui/VersionRow.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/domain/axes.js
    - app/src/domain/axes.test.js
    - app/src/styles/tokens.css
    - app/src/styles/tokens.test.js
    - .planning/canvas-generators/wkprint.swift
    - .planning/canvas-generators/pdf-pages.swift

key-decisions:
  - "The Print sheet control sits in the version row's acts after Next version and Show changes as an underlined text control (.notebook-link); sketch 010 draws no placement. Mark looks at this place."
  - "The route sets document.title to '{recipe name} · Print sheet · Sprinkles' (D-20) and restores 'Sprinkles' on unmount"
  - "The page picture's 1 px divider is an inset outline, so the picture is exactly the page's box at every scale"
  - "The print padding keeps only the 2 px right guard (D22); the paper's own margins give the rest"

patterns-established:
  - "A sketch board is checked element by element: the probe compares every element's box within its page against page-1-batch-log.html and page-2-tasting-log.html in WebKit and Chrome (0 differences)"

requirements-completed: [PRINT-01, PRINT-03, PRINT-04, PRINT-05, UX1-01, UX1-03]

coverage:
  - id: D1
    description: "The version row's Print sheet link leads to the print route, built by printPath with every segment encoded; the route renders the saved version only and calls no write method"
    requirement: PRINT-05
    verification:
      - kind: unit
        ref: "app/src/ui/PrintSheet.test.jsx (repository calls, idempotency and concurrency edges); app/src/ui/VersionRow.test.jsx#Print sheet; app/src/ui/notebookPaths.test.js#printPath"
        status: pass
    human_judgment: false
  - id: D2
    description: "Each seed version (19) prints exactly two pages, front and back, in WebKit's print and Chrome's PDF: Batch log with Side 1 of 2 then Tasting log with Side 2 of 2, each foot carrying the Sheet title, version line and that version's code; visible ink inside the content box"
    requirement: PRINT-03
    verification:
      - kind: other
        ref: "node .planning/phases/04-prepare-the-next-version-for-making/04-print-probe.mjs logs (ALL MATCH)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Page 2 names exactly the version's own declared scales and problems; page 1 is identical for every recipe but its foot"
    requirement: PRINT-03
    verification:
      - kind: unit
        ref: "app/src/ui/PrintLogPages.test.jsx (iterates seedRecipeGroups)"
        status: pass
      - kind: other
        ref: "04-print-probe.mjs logs (names its scales / names no other scale / problems)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The route matches screen-print-route-1280 and -393 (head, Print control, picture boxes, stack, no overflow, Tab order) and each log page matches its board element for element"
    requirement: PRINT-01
    verification:
      - kind: other
        ref: "node .planning/phases/04-prepare-the-next-version-for-making/04-print-probe.mjs screen (ALL MATCH)"
        status: pass
    human_judgment: false
  - id: D5
    description: "No page reads the window: a gate over app.css, notebook.css, shell.css and home.css finds no non-print @media selector that can match inside a page; print.css carries no literal outside @page"
    requirement: PRINT-01
    verification:
      - kind: unit
        ref: "app/src/styles/print.test.js"
        status: pass
    human_judgment: false
  - id: D6
    description: "On the iPad and iPhone the route reads well, Print opens the print sheet, and Safari's own print gives two pages with the foot on each"
    requirement: PRINT-04
    verification: []
    human_judgment: true
    rationale: "The probe prints through WebKit's NSPrintOperation and Chrome's PDF; Chrome PDF probes do not prove Safari print, and Mark's iPad PDF is the evidence the contract names"

duration: ~30min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 06: Print route and the blank log pages Summary

**A print route renders the saved version's Batch log and Tasting log as front and back of one sheet, each foot carrying the Sheet code, with only that version's declared scales and problems; both pages match sketch 010 element for element and print as exactly two pages in WebKit and Chrome for all 19 seed versions.**

## Performance

- **Duration:** ~30 min (about 06:38Z to 07:09Z)
- **Tasks:** 3 (1 tracer, 2 auto)
- **Files:** 7 created, 12 modified across three commits
- **Suite:** 72 files, 2266 passed, 0 failed (baseline 2163). `npm --prefix app run build` exits 0.

## Accomplishments

- **Tracer (Task 1).** Print sheet in the version row leads to `/notebook/:recipeId/:versionId/print`. `PrintSheet` loads `getVersion`, `getRecipe`, `listVersions` only and renders the route line (Sheet title link, version line, Saved date, Sheet code), the Print control and the Batch log picture with its foot. `print.css` holds the route's screen rules, the lf-* page rules, `@page { size: letter; margin: 0.5in 0.75in }` and the print block that hides the shell only while `.print-route` is present. Tracer gate: `<verify>` was automated-only and `human_verify_mode` is end-of-phase, so the targeted tests and the probe were re-run before expansion and passed (log: tracer verified end to end, expanding).
- **Tasting log (Task 2).** `axesForVersion`, `TastingLogPage` (four core scales then the version's declared ones, four core problems then its declared ones in one row, 5 lines, no cue). `PrintLogPages.test.jsx` iterates all seed versions; the probe prints all 19 through wkprint and Chrome's PDF.
- **Phone, keyboard, width-proofing (Task 3).** Below 724 the line stacks and Print fills the width; each picture scales by `--sheet-print-picture-scale` measured in `PrintSheet`; tab title; the width-proofing gate in `print.test.js` (two exempt selectors, both in notebook.css, logged on every run: `.notebook-log .batch-row__head:has(.fold-row) .region-name` at 1366 and at 723.98, since the route renders no `.notebook-log`); idempotency and concurrency edge tests.
- **Measured against the boards.** `screen` mode: head 66 / 172 px, Print 74.3 x 44 at the right edge and 353 x 44, pictures 816 x 1056 and 353 x 456.8, no overflow at 393, Tab from the Sheet title reaches Print, in WebKit and Chrome. All 64 (page 1) and 150 (page 2) elements of the log pages sit within 0.6 px of the board's.

## Task Commits

1. **Task 1 (tracer): Print sheet, the route, the Batch log on paper** - `6feed87` (feat)
2. **Task 2: the Tasting log per recipe, two printed pages for every seed version** - `fc1c249` (feat)
3. **Task 3: phone, keyboard, width-proof pages, tab title** - `43e46d0` (feat)

## Decisions Made

See key-decisions. Placement of Print sheet is a look row for Mark (below).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] VersionRow.test.jsx pinned the old link count and a "no v1" scan over markup**
- **Found during:** Task 1
- **Issue:** The new Print sheet link made the lineage test count 3 `<a>` tags instead of 2, and the print href (`...-v1/print`) tripped the "no anti-goal ordinal v1" check.
- **Fix:** Count is 3 (From version, From batch, Print sheet); the ordinal check strips `href` attributes first (visible text only).
- **Files:** `app/src/ui/VersionRow.test.jsx`. **Commit:** `6feed87`

**2. [Rule 3 - Blocking] Probe: wkprint must run asynchronously**
- **Found during:** Task 1
- **Issue:** `execFileSync` blocked Node's event loop, so the in-process static server could not answer wkprint's page load and wkprint hit its own 90 s timeout.
- **Fix:** `execFile` promisified. **Files:** `04-print-probe.mjs`. **Commit:** `6feed87`

**3. [Rule 3 - Blocking] pdf-pages.swift gained `bounds` and `ink` modes (file not in the plan's list)**
- **Found during:** Tasks 1 and 2
- **Issue:** Task 2 asks for "pdf-pages.swift extents" but the tool printed text only. Its first `bounds` mode (text lines) counted text a clip hides: WebKit emits the next page's first title line, clipped and invisible, inside page 1's bottom margin (y 6.8 to 37 pt), so it read as an overrun.
- **Fix:** Added the additive `ink` mode (box of every non-white pixel at 2 px per point, rules included) and made the probe use it. Default and `all` output unchanged. **Files:** `.planning/canvas-generators/pdf-pages.swift`. **Commits:** `6feed87`, `fc1c249`

**4. [Rule 3 - Blocking] Touch floor on the Sheet title link**
- **Found during:** Task 3
- **Issue:** The board's 393 head (172 px) holds a 44 px Sheet title link through the app's coarse-pointer floor (the board adds `display: inline-flex; min-height: var(--touch-min)` at a coarse pointer); without it the head measured 161.
- **Fix:** The same rule in print.css under `@media (pointer: coarse)`, before the stack rule. **Commit:** `43e46d0`

**5. [Plan variation] Page-position check holds the device pixel ratio constant**
- The plan's check "every element at the same page-relative position at 1280 fine and 393 coarse (+-0.5 px)" failed in WebKit by 0.66 px at 3x. Isolated: the same page at the same width differs by that much between a 1x and a 3x screen (WebKit snaps text metrics to device pixels), and 393 at 1x equals 1280 at 1x exactly. The probe now compares both widths at 1x (0.00 px) and reports the 3x difference as an INFO line. No CSS can read the ratio.

**Total deviations:** 4 blocking, 1 plan variation. **Impact:** none on specified behaviour.

## Issues Encountered

- The commit guard reports `main` as protected; commits went on `main` as the orchestrator instructed, no config change.
- Probe builds went to a scratch `--outDir` while iterating; the plan's own `npm --prefix app run build` (into app/dist) ran once at the end, then both probe modes against it: ALL MATCH.
- Chrome PDF and the macOS WKWebView print do not prove Safari's own print on the iPad. WebKit's `NSPrintOperation` reproduces Safari's 0.8 pt per px scaling (content box 630 x 900) and gave exactly two pages, but the iPad PDF remains the evidence.

## Known Stubs

None.

## Threat Flags

None. T-04-15 (a version under another recipe's address renders the not-found page; links built by printPath/notebookPath with encodeURIComponent), T-04-16 (the route never calls getDraft or any pen state; concurrency edge test), T-04-17 (no request to another host; the probe counts and fails on any, 0 observed), T-04-18 (stored text renders as React text; escape test; no dangerouslySetInnerHTML) are mitigated as planned. T-04-SC: no package installed.

## Deferred Human Verification

human_judgment: true (D6). Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

1. iPad and iPhone: open a version, tap Print sheet. At 393 the line stacks, Print fills the width, the two log pictures show with no sideways pan.
2. Tap Print, choose a printer or Save to PDF: two pages, Batch log then Tasting log, each with its foot and the same code as the line. Safari's own print is the evidence here (Chrome PDF does not prove it).

Rows for Mark's List (this executor has no ArtifactData tool; for the orchestrator to add):
- **look**, `owner: mark`, `needs: hands`, slug `look-print-sheet-route-device`: the two device steps above, `where`: iPad and iPhone, the print route of Olive Oil v1.
- **look**, `owner: mark`, `needs: answer`, slug `look-print-sheet-control-place`: "Print sheet sits in the version row after Next version and Show changes as an underlined text control (sketch 010 draws no placement). Keep it there, or have Sid draw it?" (a look row: approve or change; no options).

## Self-Check: PASSED

- Created files exist: PrintSheet.jsx, PrintSheet.test.jsx, PrintLogPages.jsx, PrintLogPages.test.jsx, print.css, print.test.js, 04-print-probe.mjs (FOUND)
- Commits `6feed87`, `fc1c249`, `43e46d0` are ancestors of HEAD; `git rev-list --count` from the recorded base is 3
- `npm --prefix app test -- --run`: 72 files, 2266 passed, 0 failed; `npm --prefix app run build` exits 0
- `04-print-probe.mjs logs` and `screen` against the build in app/dist: ALL MATCH, 0 off-host requests
- Acceptance: router.jsx holds the print path; `printPath` exported; VersionRow renders Print sheet through printPath with tabIndex 0; main.jsx imports print.css after notebook.css; tokens.test.js lists print.css and `--sheet-print-picture-scale`, no longer lists `--rule-tick` as unread; PrintLogPages.jsx imports no literal scale or problem name; the declared-literal word appears in PrintLogPages.test.jsx only in the Olive Oil v1 case
- Post-commit deletion check: no deletions
