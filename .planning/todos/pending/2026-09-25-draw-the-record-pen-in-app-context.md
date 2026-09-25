---
created: 2026-09-25T00:00:00.000Z
title: Draw the App-context record pen (route-recipe-batch.md's 2026-09-23 amendment)
area: design
severity: minor
files:
  - .impeccable/surfaces/route-recipe-batch.md
  - .planning/sketches/011-recipe-route-c/
  - app/src/ui/BatchRow.jsx
  - app/src/styles/notebook.css
---

## Problem

`route-recipe-batch.md`'s 2026-09-23 amendment says the battery's visual treatment "moves to
App context and is drawn on the 03.5 canvas, not invented by a builder." Sketch 011 draws the
log's reading state at every width and never its recording state — 1600-pen.html shows the
version pen open, not the batch pen. Phase 03.5 plan 07 shipped the record pen inside the log
column (option A, Mark 2026-09-25: "open the record pen in the column using sketch 008's
approved narrow arrangement") so recording keeps working, but the battery still wears
sketch 007/008's Sheet-grammar CSS inside an App-context column — nothing was drawn for it.

## Next step

Draw the record pen's App-context treatment on the Claude Design canvas, snapshot it into
`.planning/sketches/011-recipe-route-c/` (or a successor numbered board), and build a
gap-closure plan against that drawing. At 1366 the column is 300px, tighter than the 353px
phone content the stacked arrangement was drawn for — measure for overflow against the real
column widths (340px desktop, 300px iPad landscape) when the drawing lands.
