---
created: 2026-09-26T00:00:00.000Z
title: Measure the record pen's own width limits, then re-derive its cut
area: design
severity: minor
files:
  - app/src/styles/app.css
  - app/src/ui/BatchRow.jsx
  - DESIGN.md
---

## Problem

Phase 03.5 plan 13 closed gap item 3 (touch sizing keyed to the pointer alone) but left the
record pen's own remaining width cut — the width-only block's 216px track and 44 × 44 stop, the
wide-touch block's caption reserve, and `BatchRow.jsx`'s `useBelow760` — at 760px, per Mark's
2026-09-27 checkpoint answer ("Record pen cut: 760"). DESIGN.md's sentence at line 368 ("The 760
width block and the wide-touch block still govern the record surfaces, which have not been
measured yet") remains true: no board draws the battery's recording state at every width (sketch
011 decision 14 deferred phone logging; plan 07's own 1600-pen.html shows the version pen, not
the batch pen), so the Derived-Cut Rule's own requirement — measure each part's content limits,
set a value, rank it, and let the cut fall out as a sum — was never applied to this cut. It is
the route's one width change that reads only the record pen's battery, which the ladder's
Grouping Rule would otherwise fold onto 724 with the phone forms if the measured values allow.

## Next step

Measure the battery's own wide (row-major, 186px track) and stacked (core-then-declared, 216px
track) arrangement limits in the full-width log — the same measurement route-recipe-batch.md's
2026-09-23 amendment already calls for when the App-context battery is drawn (see the sibling
todo, `.planning/todos/pending/2026-09-25-draw-the-record-pen-in-app-context.md`). Once measured:
derive the cut as a sum of the measured values, following the Derived-Cut Rule, and check whether
it lands on the ladder's existing 724 rung (the Grouping Rule) or needs its own. Then revisit
DESIGN.md's line 368 sentence — hand it to `/impeccable document` once the cut is settled, per
this plan's own prohibition against a code plan editing DESIGN.md directly.
