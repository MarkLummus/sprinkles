---
status: diagnosed
trigger: "G-03.5-6: mostly pass on 983/984 - one difference is in white space between batch measurements - sketch has more between than as-built."
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

bug_class: Bohrbug (deterministic CSS; reproduces at every load)
hypothesis: CONFIRMED — the App reading view's churn-cell grid keeps the Sheet-context track list `repeat(auto-fit, minmax(96px, max-content))` (app.css:1444); notebook.css:725-727 ports only the board's gap, never its `repeat(N, minmax(0,1fr))` track list. Max-content tracks size each measurement to its own label and pack them left, so the spare width the board spreads between measurements ends up trailing (983) or unevenly split (984).
test: inject the board's track list into the live app DOM at matched width and re-measure
expecting: horizontal geometry becomes identical to the board
next_action: return ROOT CAUSE FOUND (find_root_cause_only)

reasoning_checkpoint:
  hypothesis: "The churn cells sit 20px apart (983) / unevenly apart (984) because .notebook-log .batch-row__cells inherits grid-template-columns: repeat(auto-fit, minmax(96px, max-content)) from app.css:1444, whereas every board draws repeat(5, minmax(0,1fr)) at 724-1365 and repeat(2, minmax(0,1fr)) at <=723 and >=1366."
  confirming_evidence:
    - "983: app tracks 145.5/119.2/123.7/132.5/96 packed left, 206px trailing slack, label gaps 20/20/20/20; board 164.6 x5, label gaps 39-65"
    - "Injecting repeat(5,minmax(0,1fr)) into the live app makes gtc, pitch and every ink gap identical to the board at 983, 984 and 1024; repeat(2,...) does the same at 393/723/1366"
  falsification_test: "If injecting the board's track list had left any horizontal gap different from the board, the track list would not be the (whole) cause — it did not."
  fix_rationale: "Declare the board's track list (per rung) in the App scope, so free width is distributed as equal fractional tracks exactly as the board draws it."
  blind_spots: "Not checked on the real iPad/iPhone (WebKit); tasting-reading grids share .batch-row__cells and were not compared (fold closed at 983/984). Head height 24 vs 17 not investigated (separate element)."
  candidate_causes:
    - "code: notebook.css App scope ports gap only, not grid-template-columns (CONFIRMED)"
    - "code: cell inner gap / value line-height / plan margin / grid margin-top left at Sheet values (CONFIRMED, vertical, secondary)"
    - "data: different seed values changing max-content widths (ELIMINATED — value ink identical after injection)"
    - "environment: board measured at wrong viewport (ELIMINATED — measured at matched widths)"
  and_gate: "no for the reported horizontal gap (track list alone reproduces it); the vertical drift is an independent second rule set (cell gap/line-height/margins) that the same port missed"

## Symptoms

expected: At 983/984 the batch measurements (log churn cells: Time to draw temp., Out of machine, Churn duration, Exit consistency, Airiness) are spaced as the boards draw them.
actual: "mostly pass on 983/984 - one difference is in white space between batch measurements - sketch has more between than as-built."
errors: none (visual)
reproduction: Desktop browser at 983 and 984, /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 on built app (:4173) vs .planning/sketches/011-recipe-route-c/983-batch.html and 984-batch.html
started: Discovered during 03.5 UAT test 6. LADDER-CONFORMANCE 984 section had recorded "Log column box: board left=264 w=680 h=294 flex, gap 18px vs app left=256 w=696 h=432 block, gap normal" as accepted.

## Eliminated

- hypothesis: the gap token between cells differs (board 16/20 vs app something else)
  evidence: computed gap is 16px / 20px on both pages at every rung (notebook.css:725-727 already ports it); label-ink gaps equal exactly 20px in the app only because the tracks are max-content, not because of the gap value
  timestamp: 2026-09-29

- hypothesis: the difference is the conformance record's "app two-column vs board single-column" layout at 984
  evidence: measured — the board is 5 x minmax(0,1fr) at 983/984/1024 and 2 x minmax(0,1fr) at 393/723/1366/1600/1920; the app is 5 content-sized tracks at 723-1024 and 3 content-sized tracks at 350-353px. The conformance description was wrong on both sides.
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: knowledge base (.planning/debug/knowledge-base.md)
  found: no knowledge-base.md exists; no prior resolution for churn-cell spacing
  implication: no known-pattern candidate

- timestamp: 2026-09-29
  checked: board CSS for the churn cells in every sketch 011 board (inline styles)
  found: grid = `display:grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 16px 20px` on 983/984/1024 (log below the Sheet); `repeat(2, minmax(0,1fr))` on 393/723/1366/1600/1920. Cell = `display:flex; flex-direction:column; gap:2px; min-width:0`. Value span 20px/600, line-height normal.
  implication: the board's cells are EQUAL-WIDTH FRACTIONAL tracks that fill the log width; the white space between measurements is whatever each 1fr track leaves after its own content.

- timestamp: 2026-09-29
  checked: app CSS — app/src/styles/app.css:1442-1447 (.batch-row__cells), :1526-1530 (.batch-row__cell), :1546-1553 (.batch-row__cell-value), :1595-1599 (.batch-row__plan); app/src/styles/notebook.css:725-727 (.notebook-log .batch-row__cells gap override)
  found: app grid = `repeat(auto-fit, minmax(var(--sheet-col-batch-cell-min)=96px, max-content))`; notebook.css overrides only the gap (16px 20px — matches board). Cell gap var(--gap-xs)=6px (board 2px). Value line-height var(--sheet-leading-figure)=1.1. Plan margin-top var(--gap-hair)=2px. notebook.css never overrides grid-template-columns or the cell's own gap.
  implication: app tracks are sized to their CONTENT (max-content) and packed left; they never distribute the spare width. The 16/20 gap token matches but the track sizing function does not.

- timestamp: 2026-09-29
  checked: matched-width DOM measurement, 983 fine pointer, built app :4173 (/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1) vs 983-batch.html served on 127.0.0.1:8791 (headless Chrome, playwright-core)
  found: grid box identical (l=40 w=903). Board gtc = 164.6 x5, pitch 184.6, label-ink gaps 39.1/65.4/60.9/52.1, value-ink gaps 135.6/141.9/135.6/98.5, right slack 0. App gtc = "145.5 119.2 123.7 132.5 96 0 0" (auto-fit made 7 tracks, 2 collapsed), pitch 165.5/139.2/143.7/152.5, label-ink gaps 20/20/20/20, value-ink gaps 116.5/96.5/94.7/66.4, cells end at 737 -> 206.1px empty on the right. Cell height board 58 vs app 65.4.
  implication: at 983 the app bunches the five measurements to the left with exactly the 20px column gap between labels; the board spreads them across the full width with 39-65px between labels. This is the reported "sketch has more between than as-built".

- timestamp: 2026-09-29
  checked: same measurement at 984 fine pointer
  found: grid box identical (l=264 w=680). Board gtc 120 x5 (pitch 140; "Time to draw temp.", "Churn duration", "Exit consistency" wrap to 2 lines). App gtc "130.5 119.2 123.7 130.5 96 0" — max-contents overflow 680 so tracks are squeezed unevenly; pitches 150.5/139.3/143.7/150.5; label-ink gaps app 49.3/20/20/52.8 vs board 38.8/20.8/69.6/42.3; "Churn duration" stays 1 line in the app (2 on board). Cell height board 73 vs app 80.4.
  implication: at 984 the uneven content-sized tracks give an uneven rhythm (two 20px label gaps side by side) instead of the board's even 140px pitch; the horizontal difference is smaller than at 983 but still a different track function. Vertically every app cell is 7.4px taller.

- timestamp: 2026-09-29
  checked: other rungs, matched width (393 coarse, 723 fine, 1024 coarse, 1366 coarse, 1600 fine)
  found: 1024 board 5x128 (pitch 148) vs app content-sized, 20px label gaps, 23px trailing slack. 393/1366/1600 board 2 columns x 3 rows (165-166.5 each, pitch 185-186.5) vs app 3 columns x 2 rows (103.3 each) with every label but Airiness wrapping to 2 lines. 723 board 2 columns x 3 rows (331.5 each) vs app 5 columns x 1 row (Mark passed 723 at UAT).
  implication: same cause at every rung; the difference is a different column COUNT at 393/723/1366/1600 and a different track SIZING at 983/984/1024.

- timestamp: 2026-09-29
  checked: vertical metrics inside and around the cells (983, 984)
  found: label->value board 2 / app 6 (app.css:1529 .batch-row__cell gap var(--gap-xs)); value box board 25 (line-height normal) / app 22.4 (app.css:1549 line-height var(--sheet-leading-figure) 1.1); value->plan board 2 / app 8 (6 gap + app.css:1598 margin-top var(--gap-hair)); head->cells board 18 / app 32 (notebook.css:653-657 .batch-row flex gap var(--gap-m)=20 + app.css:1446 .batch-row__cells margin-top var(--gap-s)=12). cells->notes 18 on both.
  implication: vertically the app is LOOSER than the board (opposite direction to the report) — the reported difference is the horizontal one, but the same un-ported Sheet rules also drift the vertical rhythm.

- timestamp: 2026-09-29
  checked: falsification test — injected `.notebook-log .batch-row__cells{grid-template-columns:repeat(5,minmax(0,1fr))}` into the live app page at 983/984 (no app/ edit)
  found: app gtc, pitch, label-ink gaps and value-ink gaps become IDENTICAL to the board (983: 164.6x5, pitch 184.6, label gaps 39.1/65.4/60.9/52.1; 984: 120x5, pitch 140, 38.8/20.8/69.6/42.3). Adding `margin-top:0` on the grid, `gap:2px` on the cell, `line-height:normal` on the value and `margin-top:0` on the plan makes cell heights identical too (58/73). With repeat(2,...) at 393/723/1366 and repeat(5,...) at 1024 horizontals match exactly.
  implication: hypothesis confirmed — the track sizing function is the whole horizontal difference.

- timestamp: 2026-09-29
  checked: provenance — git blame and 03.5-07 plan
  found: app.css:1444 `repeat(auto-fit, minmax(var(--sheet-col-batch-cell-min), max-content))` is the Sheet-context rule (5a478c4 / 1ccffc7, 03.3/03.4). notebook.css:725-727 was added by 225275c feat(03.5-07) and ports only `gap`. 03.5-07-PLAN.md:98 explicitly asked for "the two-column cells grid at 16px 20px gaps" from 1600-batch.html. The 5-column form at 724-1365 is drawn only in the 983/984/1024 boards' inline styles. LADDER-CONFORMANCE.md:138-139, 181, 187, 212 and CONFORMANCE.md:62, 152, 170 marked the difference "accepted" under a description that does not match either page.
  implication: an incomplete port in 03.5-07, then waved through by conformance under a mistaken description; no probe field compared grid-template-columns or cell pitch.

- timestamp: 2026-09-29
  checked: remaining vertical detail at 2-column rungs after injection
  found: grid h app 174 vs board 165 at 393/723/1366 — board draws an absent value as a lone 14px span; the app nests the 14px "not measured" span (batch-row__unit--absent) inside the 20px .batch-row__cell-value (BatchRow.jsx:1020-1028), so the 20px strut keeps the line tall on the "not measured" rows.
  implication: secondary, only visible where cells stack in rows (not at 983/984's single row).

## Resolution

root_cause: The App reading view's churn-cell grid (.notebook-log .batch-row__cells, app/src/styles/notebook.css:725-727, added in 225275c 03.5-07) overrides only `gap`, so it inherits the Sheet-context track list `grid-template-columns: repeat(auto-fit, minmax(var(--sheet-col-batch-cell-min), max-content))` from app/src/styles/app.css:1444. Max-content tracks size each measurement to its own label and pack them to the start edge, so the width the boards distribute evenly with `repeat(5, minmax(0,1fr))` (724-1365) or `repeat(2, minmax(0,1fr))` (<=723, >=1366) is not placed between the measurements. Secondary, same incomplete port: cell gap 6 vs 2 (app.css:1529), value line-height 1.1 vs normal (app.css:1549), plan margin-top 2 vs 0 (app.css:1598), grid margin-top 12 (app.css:1446) + flex gap 20 (notebook.css:656) vs board 18 above the cells.
status_note: diagnosed
fix: (not applied — find_root_cause_only)
verification:
files_changed: []
