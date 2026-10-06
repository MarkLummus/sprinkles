---
sketch: 010
name: bench-sheet
question: "Starting from the Sheet exactly as the app prints it (Phase 4 D-00), what does the printed bench sheet change: the Sheet's printed pages and the blank batch log that prints in front of them?"
winner: "Approved by Mark 2026-10-06 (\"approved, snapshot 010 and update the brief\"): the Sheet with Balance in column 2 (sheet-balance-col2.html) and the two blank log pages (page-1-batch-log.html, page-2-tasting-log.html)"
tags: [print, bench-sheet, batch-log, phase-04]
---

# Sketch 010: The bench sheet

## Acceptance target (Phase 4 D-02)

Mark approved the canvas page "Print formats" on 2026-10-06 (https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, version 338). These files are that page **as the canvas served it at approval**. The planner, the checker, the executors and UAT read these files and `CONTRACT.md` as a structural contract (elements, placement, states, text, CSS), never a prose paraphrase of them, as with sketches 007 and 008.

| File | Role |
|---|---|
| `page-1-batch-log.html` | **Target.** Printed page 1: the batch log's front, "At the machine", plus the recipe's own Next time. Letter, 816 × 1056. |
| `page-2-tasting-log.html` | **Target.** Printed page 2: the batch log's back, "When you taste it". Letter, 816 × 1056. |
| `sheet-balance-col2.html` | **Target.** The Sheet's printed pages: Ingredients with Balance beside it in column 2, then the Instructions. Letter width 816, a flowing page (the page breaks are the browser's, under the rules in `CONTRACT.md`). |
| `as-built-sheet-letter.html` | **The starting point**, the delta's left side: the Sheet exactly as the app printed it on 2026-10-06 (Olive Oil v1, no batch, the build's own markup and stylesheets resolved for print at 816, the page white as both browsers print it). The approved Sheet is this plus E1 to E8 below and nothing else. |
| `reference-sheet-not-chosen.html` | **Reference only.** The same edits without Balance. Mark did not choose it. Not a target. |
| `as-built-recipe-page-1280.html` | **Reference only.** The recipe page on screen at 1280, as built, no batch. Not a target. |
| `measurements.json` | The measurements behind the numbers here: each board against the live build (WebKit and Chromium), the table's columns, the log pages' fit. |

Order on paper (D-07a): page 1, page 2 (one sheet, front and back), then the Sheet's pages. Letter portrait only (D-07).

How the files were made: `.planning/canvas-generators/` holds the capture (`printstart-capture.mjs`), the edits (`sheetedits.py`), the log pages (`logforms.py`), the boards (`printstart.py`), the measurement (`printstart-measure.mjs`) and this snapshot (`snapshot010.py`). Each file opens on its own: the canvas's `support.js` line is dropped and the hand's font points at `app/public/fonts/`. Nothing else differs from what the canvas served.

## The Sheet: the delta from as built (E1 to E8)

Every change below is Phase 4's to build. None is in the app on 2026-10-06. Mark's words are quoted where he gave them; the rest is Sid's drawing of his instruction.

- **E1, As made first, no tick box** (Mark, 2026-10-06: "The As made entry field is the FIRST column of the printed Ingredients table"; revised the same day: "the As made line and the tick box duplicate each other", so the tick box goes). Each portion line has a blank ruled As made cell, 72 px wide, empty, under the header "As made". The Total row's As made cell is empty, with no line. The mise-en-place tick box of the print brief (§ 3 item 1, § 6) is retired.
- **E2, no "% of batch"** (Mark). The header cell and every row's share cell are gone.
- **E3, no Watch for** (Mark).
- **E4, Balance in column 2** (Mark chose this alternative, 2026-10-06). Balance sits beside the Ingredients table without its Hide control, because paper has no controls. This overrides the brief's former § 4 anti-goal ("no Balance … from column two").
- **E5, headings in ink** (Mark: "black-only"). As built, the section headings print bookcloth green (#33513b), the only colour measured on the printed Sheet.
- **E6, As made | Grams | Ingredient** (Mark, 2026-10-06). The plan amount sits between the As made line and the name. The header is the build's own: "As made", then "Ingredient" over the grams and the name. Every figure keeps its unit.
- **E7, a heavier rule above each step group** (Mark asked for more emphasis on the step separators; Sid picked one treatment). The step head's top border is `--rule-tick` (2.5 px, ink). Its type, size and spacing are unchanged. Chromium draws 2.5 px as 2 px (sketch 008's finding on fractional borders), which is still heavier than the 1.5 → 1 px rules elsewhere.
- **E8, no rules between ingredient rows** (Mark: "either lighten the lines between ingredients or drop the line"; dropped). The step rule carries the grouping. Kept: each row's As made line, the header row's rule, the step head's rules, and the Total's top rule. Measured: in all 14 rows, each As made line sits 4 to 5 px under its grams baseline.

Not a change: **the white page.** Chrome's print and WebKit's print both drop the Sheet's ground (#f7f7f4), because the app sets no `print-color-adjust`. The boards are white to match the real print.

## The log pages: decisions (D1 to D5, Mark, 2026-10-06)

The fields, labels, units, option words, axis names, anchors and group captions are the built record pens' own (`app/src/domain/battery.js`, `axes.js`, BatchRow.jsx's captions, and 03.3.1-06-SUMMARY.md's field list for Phase 4). Which field sits on which side, the side names and the geometry are the print brief's (§ 3 item 3, § 6), amended by:

- **D1:** numeric fields stay ruled lines carrying their units, not boxes.
- **D2:** both pages carry a date: Churn date on page 1, Tasted on page 2. The brief's side 2 gains the date.
- **D3:** the printed caption is "Airiness", without "(estimated)". The pen keeps its own caption.
- **D4:** the defects keep the built caption, "Any problems?" with "select all that apply". Checked: it prints in Chrome's PDF and in WebKit's print.
- **D5:** Next time evaluates the recipe, not the batch or the tasting. It moves to page 1 under its own heading, where there was room.

Writing lines at the same type size: page 1 has At the machine 5, Ingredient notes 5 and Next time 4. Page 2 has How did it turn out? 7. Both pages fit inside the 48 / 56 / 40 margins with the foot on the page. Smallest type is 12 px; black only.

## Open for Phase 4

- **Foot placeholders.** The foot reads "Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · [short code] · Page n of [m]". The short code (derived from the version id, brief § 7) and the page count are placeholders, not designs. The Sheet's own pages are drawn without a foot; the brief's § 6 puts one on every page.
- **Safari and the iPad are unverified.** Everything here was measured in Chromium and in Playwright WebKit, plus one WebKit print through `wkprint.swift`. Safari's print cuts table rows and never repeats a table header (Mark's List row `phase-04-safari-print-approach`, the debug record `.planning/debug/safari-print-ingredient-table.md`). Device proof is Mark's iPad PDF.
- **The `@page` margin against the 724 px rule.** The app sets no `@page` margin. The printed Sheet's one-column layout comes from the `max-width: 983.98px` rules, and the phone rules start below 724 px. Chrome's default 0.4 in margins leave about 739 px; a wider margin would drop under 724 px. Phase 4 must pin the page margin. The column-2 layout here is drawn at 816 with the Sheet's own 48 px padding.
- **Page breaks** within the Sheet (D-06a, D-06b) and the Instructions opening their own page when the table fits are Phase 4's, built with the fixed page. These boards flow and do not draw them.
- **Tokens.** The log pages and the table edits use some literal sizes, recorded in `CONTRACT.md` (the 32 px writing line, the 96 px figure line, the 72 px As made line, the 14 and 22 px boxes, the page margins). The app requires every value to come through `tokens.css`, so Phase 4 adds tokens for these.
