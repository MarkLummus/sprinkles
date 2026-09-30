---
status: diagnosed
trigger: "G-03.5-5 (UAT test 5): multiple Versions pass. But, the gray line draws over the circles."
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

bug_class: Bohrbug (deterministic CSS geometry and painting order; it reproduces on every upright rail with 2+ rows)
hypothesis: CONFIRMED. The upright rail's connector (li::after) is a later-positioned sibling of the positioned link, so it paints over that row's own mark. Its offsets also assume the mark sits at the top of the row, but align-items:center puts the mark in the middle of the 44px row. So the line runs through every circle except the last, pokes 10px above the first circle, and stops 10px short of the last.
reasoning_checkpoint:
  hypothesis: "notebook.css:576-584 draws the connector from row top+6px to next row top+6px as li::after (position:absolute, painted after the position:relative .notebook-upright__link at :586-587). The link's align-items:center (:591) with min-height 44px puts the 12px mark at row top+16..28. So the line crosses the row's own mark and paints over it."
  confirming_evidence:
    - "Measured (built app :4173, Chromium): at every width (1024 History, 393 History, 1366 Batches), each non-last row's line spans row.t+6 to next row.t+6. The mark spans row.t+16..28, so lineOverlapsOwnMark=true on every non-last row, the line starts 10px above the first mark, and it ends 10px above the last mark's top."
    - "Screenshots: the gray line bisects the hollow (white) circles and the in-view ring. Injecting .notebook-upright__link{z-index:1} hides the line inside every circle, which shows the paint-order cause. The stub above the first node and the gap above the last node remain."
    - "Injecting the board's geometry (align-items:start; mark margin-top 4px; ::after top 18px, bottom -12px) reproduces upright-393.html exactly: the line runs only between circles."
    - "Board upright-393.html, measured: mark at row+4..16, line row+18 to next row top (2px below one circle, 4px above the next). It never touches a circle."
  falsification_test: "If raising the link above ::after had NOT hidden the line inside the hollow circles, the mark fill would be transparent or wrong and paint order would not be the cause. It did hide the line, so paint order is confirmed. If the ::after geometry had matched the mark (line.t >= mark.b), there would be no overlap. The measured overlap is on every non-last row."
  fix_rationale: "Draw the connector the way the board does: mark top-aligned in a title-line-height box, and the line from just under this mark to the next row's top. Then the geometry never meets a circle and paint order stops mattering. Optionally also make the marks paint above the line (as 03.5-12 did for the horizontal rail) as a belt-and-braces measure."
  blind_spots: "WebKit (iPad/iPhone) was not run. The cause is CSS 2.1 Appendix E painting order plus pure box geometry, which WebKit follows, and Mark's device report matches the Chromium render. Mark did not say which form he saw; the horizontal rail was measured clean for circles."
  candidate_causes:
    - "code: notebook.css connector geometry and paint order (CONFIRMED)"
    - "config/tokens: --app-background not white or mark fill transparent (ELIMINATED: mark bg rgb(255,255,255) = --app-background #fff = shell bg)"
    - "environment: a stale build on the device (ELIMINATED: the served index-t2lBO6PC.css carries the same rules as the source at HEAD)"
  and_gate: "yes. Two conditions together make the visible defect: (1) the geometry puts the line across the row's own mark (align-items:center vs offsets that assume a top-aligned mark), AND (2) paint order puts ::after above the positioned link. Fixing (2) alone hides the line inside the circles but leaves the stub above the first circle and the gap above the last. Fixing (1) alone makes (2) moot."
next_action: return ROOT CAUSE FOUND to the caller

## Symptoms

expected: The History rail's line runs between the version nodes and never draws over the circles. Mark (test 6): the open circle fills with the app background colour to hide the gray line; the gray line connects nodes only.
actual: "multiple Versions pass. But, the gray line draws over the circles."
errors: none (visual)
reproduction: UAT test 5, on a recipe with several versions (/notebook/mexican-chocolate, /notebook/mocha). The horizontal rail shows from 1366; UprightRail shows below 1366 and for the Batches list.
started: discovered during 03.5 UAT

## Eliminated

- hypothesis: The horizontal History rail's track paints over its marks (the 03.5-12 regression came back).
  evidence: At 1366 on mocha, the served CSS has .notebook-history__nodes{position:relative} after the absolute track. elementFromPoint at each mark centre and at the track's y returns the mark, and the screenshot shows the hollow v1 circle hiding the line.
  timestamp: 2026-09-29
- hypothesis: The hollow mark has a transparent fill, or --app-background differs from the surface behind it.
  evidence: The computed mark background is rgb(255,255,255). --app-background is #fff, and .shell and body are rgb(255,255,255).
  timestamp: 2026-09-29
- hypothesis: The device ran a stale build.
  evidence: :4173 serves index-t2lBO6PC.css, built 2026-09-28 12:20. Its .notebook-upright__row:not(:last-child):after, .notebook-upright__link and .notebook-history__* rules match source at HEAD bb8d8db.
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: app/src/ui/RecipeHistory.jsx, app/src/ui/UprightRail.jsx, app/src/styles/notebook.css:431-645
  found: The horizontal rail is an absolute .notebook-history__track (left:0; right:0; top:27px; 1px; --app-divider) followed by the position:relative ol.notebook-history__nodes. In the upright rail, each non-last li.notebook-upright__row draws ::after (position:absolute, top: mark/2 = 6px, bottom: -(gap-s + mark/2)). Its own a/span.notebook-upright__link is position:relative and comes before ::after in tree order. The link has align-items:center and min-height 44px, so the mark sits in the middle of the row, not at top 6px.
  implication: The row's own ::after paints over that row's mark, and its geometry is not mark-centre to mark-centre as the comment at :567-575 claims.
- timestamp: 2026-09-29
  checked: Built app :4173, Chromium via playwright (DPR 2, touch). mocha at 1024 with History unfolded; mexican-chocolate at 393; mocha at 1366 with 2 extra batches cloned into IndexedDB (Batches list open).
  found: All three show the same result. Rows are 44px tall with a 12px gap. The mark sits at row.t+16..28. The ::after line runs row.t+6 to row.b+18 (= next row.t+6). Every non-last row has lineOverlapsOwnMark=true, the line starts 10px above the first mark, and the last row has no line, so the previous line ends 10px above the last mark. Screenshots show the line bisecting hollow circles, filled circles and the in-view ring.
  implication: The defect is in UprightRail CSS and hits History below 1366 and Batches at every width.
- timestamp: 2026-09-29
  checked: Board .planning/sketches/011-options-counts/upright-393.html (and generators counts.py vnode/vver, gen.py history_upright)
  found: The board puts the mark in a 20px-tall flex box (align-items:center) at the top of the grid cell, at row+4..16, level with the title line. The line is a span inside the <a> at left 5.5px, top 18px, bottom -12px, running from row+18 to the next row's top. It never meets a circle: 2px clear below one, 4px clear above the next.
  implication: The app changed two things when it moved to CSS. It dropped the 20px wrapper and used align-items:center on the whole row, which centres the mark in 44px. And it re-derived the connector as mark-centre to mark-centre for a top-aligned mark it no longer has.
- timestamp: 2026-09-29
  checked: Experiment A, inject .notebook-upright__link{z-index:1}
  found: The line is hidden inside every circle and the ring. The stub above the top circle and the gap above the bottom circle remain.
  implication: Paint order is a real contributing cause, but fixing it alone does not meet "connects nodes only".
- timestamp: 2026-09-29
  checked: Experiment B, inject the board geometry (.notebook-upright__link{align-items:start}; .notebook-upright__mark{margin-top:4px}; ::after{top:18px;bottom:-12px})
  found: The render matches the board. The line runs only between circles, with no stub and no gap, and no circle is crossed.
  implication: Fixing the geometry alone removes the defect.
- timestamp: 2026-09-29
  checked: Horizontal rail at 1366 (mocha): rects, elementFromPoint, screenshot
  found: The marks paint above the track, so no circle is crossed. The track spans the whole rail (256 to 1334) while marks span 262 to 850, so the line runs 6px before the first node and 484px past the last. The board (gen.py history_rail; 1366-batch.html) draws the same full-width line (left:0; right:0).
  implication: The horizontal rail does not draw over circles. Mark's "connects nodes only" would be a change to the horizontal board if he means that form too; it is not an app-vs-board drift.
- timestamp: 2026-09-29
  checked: Tests (UprightRail.test.jsx, notebook.test.js) and git history (013448a added the connector)
  found: No test pins the connector's geometry or paint order. The CSS comment at :573-575 says only the connector's WIDTH was measured and compared, and that the vertical offsets are "this file's own reasonable placement, not board-measured pixels".
  implication: This is why no gate caught it.

## Resolution

root_cause: "app/src/styles/notebook.css:576-584 draws UprightRail's connector as li.notebook-upright__row::after from row top + 6px to the next row's top + 6px. That geometry assumes the mark sits at the top of the row, but .notebook-upright__link (:586-595) has align-items:center with min-height 44px, so the mark sits at row top + 16..28. The line therefore crosses the row's own mark, sticks 10px above the first mark, and stops 10px short of the last one. Because the ::after is a later positioned sibling of the position:relative link (:587), CSS painting order puts it on top of the link, so it paints over the mark's white fill and the in-view ring. This hits History below 1366 and the Batches list at every width. The horizontal rail (from 1366) does not cross circles."
fix: (not applied; diagnose-only)
verification: (not applied)
files_changed: []
