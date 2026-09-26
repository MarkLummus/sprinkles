---
phase: quick-260925-u3r
plan: 01
subsystem: ui
tags: [react, css, batch-log, notebook, sketch-011]

requires:
  - phase: 03.5
    provides: the App-context notebook.css world and BatchRow.jsx's reading-state markup
provides:
  - Each stored batch note (at the machine, ingredient notes) renders as its own paragraph in one flex-column notes block, 18px below the measured cells and 4px apart
affects: [03.5, recipe-route, batch-log]

actuals:
  tokens: 10600
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "A re-runnable Playwright-via-Chrome probe (260925-u3r-probe.mjs) taking real-browser geometry readings at five widths, with a before/after regression check built into the same script"

key-files:
  created:
    - .planning/quick/260925-u3r-separate-the-batch-notes-and-fix-the-rec/260925-u3r-probe.mjs
    - .planning/quick/260925-u3r-separate-the-batch-notes-and-fix-the-rec/260925-u3r-readings-before.json
    - .planning/quick/260925-u3r-separate-the-batch-notes-and-fix-the-rec/260925-u3r-readings-after.json
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/styles/tokens.css

key-decisions:
  - "Each note is a p.batch-row__note.app-hand inside one div.batch-row__notes, matching the plan's exact behavior spec (paragraphs, not the sketch's raw spans) — screen-reader and DOM-order reasons per the plan's own <behavior> block."
  - "A new token, --app-notebook-log-group-gap (18px), names the log section's own gap between its measured cells and the notes, kept separate from --app-notebook-log-head-gap (18px, a different role: the head's control-group gap) per the plan's explicit instruction not to reuse it."
  - "--app-notebook-gap-hairline (4px) is reused between the two notes, extending its existing role as a field's label-to-control gap."

patterns-established: []

requirements-completed: [BATCH2-02]

coverage:
  - id: D1
    description: "Each of the maker's two batch notes renders as its own line — a p.batch-row__note.app-hand inside one div.batch-row__notes — 18px below the measured cells and 4px apart, at all five measured widths"
    requirement: BATCH2-02
    verification:
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx — 6 new tests (exact markup, exact counts, DOM order, one-note/no-note cases, HTML-escaping, old shared-line shape gone)"
        status: pass
      - kind: unit
        ref: "app/src/styles/notebook.test.js — the log's batch notes (260925-u3r, sketch 011)"
        status: pass
      - kind: other
        ref: "260925-u3r-probe.mjs run against http://localhost:5173, beforeJson set — prints 'checks passed' at 393/760/1024/1100/1366"
        status: pass
    human_judgment: false
  - id: D2
    description: "No other measured geometry (grid tracks, Sheet regions, log position/width, header rects, name-cell height, portion sub-line line count, the cells rect, scrollWidth) moved at any of the five widths"
    requirement: BATCH2-02
    verification:
      - kind: other
        ref: "260925-u3r-readings-before.json vs 260925-u3r-readings-after.json, diffed by the probe's regression check — all fields equal within 0.5px"
        status: pass
    human_judgment: false

duration: ~15min
completed: 2026-09-26
status: complete
---

# Quick Task 260925-u3r: Separate the batch notes Summary

**BatchRow.jsx's two batch notes moved from sibling inline `<span class="app-hand">` elements sharing one line to their own `<p class="batch-row__note app-hand">` paragraphs inside a `div.batch-row__notes` flex column, 18px below the measured cells and 4px apart, with no other measured geometry moving at any of five widths (393–1366).**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-09-26
- **Tasks:** 2/2
- **Files modified:** 5 app files (BatchRow.jsx, BatchRow.test.jsx, notebook.css, notebook.test.js, tokens.css); 3 quick-directory artifacts (probe, before/after readings)

## Accomplishments

- Fixed the defect at all five measured widths: "Soft, not greasy" and "oil bottle opened 24 Jul" used to render on one run-on line (`sameLine: true`, `gapCellsToFirst: -1`, `gapBetween: -28` in every before reading); they now render as two separate paragraphs (`sameLine: false`, `gapCellsToFirst: 18`, `gapBetween: 4` in every after reading).
- Built a re-runnable, real-Chrome probe (`260925-u3r-probe.mjs`) that takes the notes and a fixed regression set (grid tracks, Sheet regions, log position/width, header rects, tallest name cell, portion sub-line line count, the cells rect, scrollWidth) at 393, 760, 1024, 1100 and 1366, and self-checks a before/after pair.
- Proved, at all five widths, that nothing else on the page moved: `gtc`, every region's `{top, left, width, height}`, the log's `{top, left, width}`, every header's text/left/right, `maxNameCellH`, and `portionLines` are all byte-identical between the before and after readings.
- Left the deferred 1025–1365 band untouched by design — its headers-overlap defect (measured again in this task's own readings, e.g. 1100's header columns at 234.7px/117.3px with the name column crushed) is visible unchanged in both before and after screenshots.

## Before/After readings, per width

All figures in CSS px, rounded to 0.1; gaps are `item.top - referenceBottom`.

### 393
| | Before | After |
|---|---|---|
| Note 1 top / bottom | 3917.2 / 3945.2 | 3936.2 / 3963.7 |
| Note 2 top / bottom | 3917.2 / 3945.2 (same line as note 1) | 3967.7 / 3995.2 |
| gapCellsToFirst | -1 | 18 |
| gapBetween | -28 | 4 |
| gtc | 353px | 353px (unchanged) |
| Sheet/ingredient/method/side regions | unchanged | unchanged |
| Header rects | unchanged | unchanged |
| maxNameCellH | 33.7 | 33.7 |
| portionLines | 1 | 1 |

### 760
| | Before | After |
|---|---|---|
| Note 1 top / bottom | 3572.4 / 3600.4 | 3591.4 / 3618.9 |
| Note 2 top / bottom | 3572.4 / 3600.4 (same line) | 3622.9 / 3650.4 |
| gapCellsToFirst | -1 | 18 |
| gapBetween | -28 | 4 |
| gtc | 376px | 376px (unchanged) |
| Sheet/ingredient/method/side regions | unchanged | unchanged |
| Header rects | unchanged | unchanged |
| maxNameCellH | 79.1 | 79.1 |
| portionLines | 2 | 2 |

### 1024
| | Before | After |
|---|---|---|
| Note 1 top / bottom | 2988.8 / 3016.8 | 3007.8 / 3035.3 |
| Note 2 top / bottom | 2988.8 / 3016.8 (same line) | 3039.3 / 3066.8 |
| gapCellsToFirst | -1 | 18 |
| gapBetween | -28 | 4 |
| gtc | 640px | 640px (unchanged) |
| Sheet/ingredient/method/side regions | unchanged | unchanged |
| Header rects | unchanged | unchanged |
| maxNameCellH | 46.7 | 46.7 |
| portionLines | 1 | 1 |

### 1100 (deferred band — headers overlap in both before and after, untouched)
| | Before | After |
|---|---|---|
| Note 1 top / bottom | 707.2 / 735.2 | 726.2 / 753.7 |
| Note 2 top / bottom | 707.2 / 735.2 (same line) | 757.7 / 785.2 |
| gapCellsToFirst | -1 | 18 |
| gapBetween | -28 | 4 |
| gtc | 234.656px 117.344px | 234.656px 117.344px (unchanged) |
| Sheet/ingredient/method/side regions | unchanged | unchanged |
| Header rects (Ingredient col) | left 304, right 350.7 | left 304, right 350.7 (unchanged; still overlapping the name column — deferred defect) |
| maxNameCellH | 215.8 | 215.8 |
| portionLines | 9 | 9 |

### 1366
| | Before | After |
|---|---|---|
| Note 1 top / bottom | 707.2 / 735.2 | 726.2 / 753.7 |
| Note 2 top / bottom | 707.2 / 735.2 (same line) | 757.7 / 785.2 |
| gapCellsToFirst | -1 | 18 |
| gapBetween | -28 | 4 |
| gtc | 412px 206px | 412px 206px (unchanged) |
| Sheet/ingredient/method/side regions | unchanged | unchanged |
| Header rects | unchanged | unchanged |
| maxNameCellH | 79.1 | 79.1 |
| portionLines | 2 | 2 |

## Screenshots

Before: `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/ef22d0f1-0260-420e-b417-596f1df98440/scratchpad/260925-u3r/before/`
Live check (after GREEN, before Task 2's committed after-run): `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/ef22d0f1-0260-420e-b417-596f1df98440/scratchpad/260925-u3r/notes/`
After (Task 2's committed comparison run): `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/ef22d0f1-0260-420e-b417-596f1df98440/scratchpad/260925-u3r/after/`

Each folder holds `{width}-log.png` (the batch row alone) and `{width}-page.png` (full viewport at scroll 0) for 393, 760, 1024, 1100 and 1366.

## Task Commits

Each task was committed atomically:

1. **Task 1: Batch notes end to end** — `37422e3` (fix) — RED tests added (BatchRow.test.jsx: 6 new tests; notebook.test.js: 2 new tests), confirmed failing; GREEN implementation (BatchRow.jsx's notes block, notebook.css's two new rules, tokens.css's new `--app-notebook-log-group-gap` token); before readings taken and committed.
2. **Task 2: After readings and regression proof** — `6d3f763` (test) — after readings committed; probe's regression check passed at all five widths; dev server stopped, 4173 preview and app/dist confirmed untouched.

## Deviations from Plan

None — plan executed exactly as written. The behavior spec's exact markup (`<p class="batch-row__note app-hand">`), the exact two notebook.css rules, and the exact token name/comment placement were all followed literally.

## Regression guard (verification's own check, re-run here)

- `git diff --name-only 9880b0f -- app/src/styles/app.css app/src/ui/useBelowDesktop.js app/src/ui/useBelowDesktop.test.js app/src/ui/IngredientTable.jsx app/src/ui/Shell.jsx app/src/styles/shell.css app/src/styles/home.css DESIGN.md .planning/sketches .impeccable` — empty (nothing changed).
- `git diff 9880b0f -- app/src/styles/notebook.css` — no removed lines (`^-[^-]` grep is empty); notebook.css only gained the two new rules and their comment.
- `npm --prefix app test` — 1308/1308 tests pass, both before and after Task 2's after-reading run.

## Noticed but not fixed

- **The 1025–1365 band, deferred to a constraints study (Mark, 2026-09-25).** At 1100 the Sheet beside the log is 480px wide. Its 2fr/1fr spread measures 234.656px/117.344px, the name column is 47px, the headers overlap, and the '12 g of 76.0 g · 9.5% in all' sub-line wraps one word per line (`portionLines: 9` at 1100, confirmed in this task's own readings); at 1200 the name column is 113px. Mark rejected both proposed cuts on 2026-09-25: log below with the Sheet in one column below 1366, and log below with the Sheet keeping two columns from 1100. The band's breakpoints will be derived from measured content constraints once the table redesign is drawn: the Sheet's one-column minimum and maximum, its two-column minimum and maximum, the log's minimum and the 224px nav, with Mark's precedence rules.
- **The log's other spacing doesn't follow the boards' 18px rhythm.** The section gap in `.notebook-log .batch-row` is 20px (`--gap-m`), the tasting sits 20px plus 12px below, and Next time and provenance each sit 32px down. Only the notes' own spacing (this task's scope) reads the boards' 18px/4px figures exactly.
- **columns.test.js's width model is stale.** It has ignored the shell's nav and the log column since 03.5, so its figures overstate the real table width: about 825px at 1366, against 412px real (confirmed again in this task's 1366 reading: `.ingredient-table-region` width 412px).
- **The stacked log at 1024 is narrower than drawn.** It is 498.9px wide against the board's 720px, already accepted in 03.5-08's conformance record (confirmed again: this task's 1024 reading shows `log.width: 498.9`).

## Self-Check: PASSED

- `app/src/ui/BatchRow.jsx` — FOUND
- `app/src/ui/BatchRow.test.jsx` — FOUND
- `app/src/styles/notebook.css` — FOUND
- `app/src/styles/notebook.test.js` — FOUND
- `app/src/styles/tokens.css` — FOUND
- `.planning/quick/260925-u3r-separate-the-batch-notes-and-fix-the-rec/260925-u3r-probe.mjs` — FOUND
- `.planning/quick/260925-u3r-separate-the-batch-notes-and-fix-the-rec/260925-u3r-readings-before.json` — FOUND
- `.planning/quick/260925-u3r-separate-the-batch-notes-and-fix-the-rec/260925-u3r-readings-after.json` — FOUND
- commit `37422e3` — FOUND (`git log --oneline --all | grep 37422e3`)
- commit `6d3f763` — FOUND (`git log --oneline --all | grep 6d3f763`)
