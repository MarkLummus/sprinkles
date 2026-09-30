---
status: diagnosed
trigger: "G-03.5-8b: Batch save ceremony buttons are wrapping starting at 984, but not below 984"
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED. From 984 up, app.css:690-711 puts the foot band's ceremony (PenFoot, mount B) in the right third of a 2fr/1fr grid. At a 696 Sheet that third is 189px (203 at 1024), below the ceremony's natural 245px, so the non-wrapping .save-ceremony flex row shrinks its buttons and "Add tasting" and "Save batch" break onto two lines.
bug_class: Bohrbug (deterministic, width-driven layout)
test: done (threshold prediction, falsification by injected one-column foot, tasting-open control, amend pen)
expecting: n/a
next_action: return ROOT CAUSE FOUND (goal find_root_cause_only; no fix)
candidate_causes:
  - "code: .pen-foot 2fr 1fr + .pen-foot__controls grid-column 2 (app.css:690-711) CONFIRMED"
  - "code: .save-ceremony has no flex-wrap outside .notebook-log/<724 and its buttons may shrink below their label width (flex 0 1 auto, min-width auto = longest word) CONTRIBUTING (why it shows as broken labels rather than an overflow or a clean row wrap)"
  - "data/state: Add tasting present (tastingOpen false, no pendingUndo) CONTRIBUTING (without it the pair fits)"
  - "environment/config: viewport width in 984-1150 or 1366-1532 (iPad 1024 and 1366 inside) TRIGGER"
  - "ceremony A in the log ELIMINATED (never shrinks; 640/350 wide against 245 content)"
and_gate: "yes. Needs the two-column foot regime (vw >= 984), a Sheet narrow enough that its third is < 245px (984-1150, 1366-1532), and Add tasting in the ceremony."

## Symptoms

expected: The record pen's closing controls (Cancel / Save batch or equivalent) sit on one line at 984 and above.
actual: "Batch save ceremony buttons are wrapping starting at 984, but not below 984" (Mark, UAT test 8, item 3)
errors: none (layout)
reproduction: open the record pen (Record a batch, or Correct) at 984, 1024, 1366, 1600 and at 983 and below; look at the ceremony buttons
started: discovered during 03.5 UAT

## Eliminated

- hypothesis: ceremony A (BatchRow's end-of-record SaveCeremony in aside.notebook-log) wraps from 984
  evidence: measured 640 wide below 1366 and 350 wide from 1366 against 245 content, with natural button widths at every width, fine and coarse. The log has no 984 rule (notebook.css cuts are 1365.98 and 723.98 only).
  timestamp: 2026-09-29

- hypothesis: the 760 record-pen cut or the touch block causes the wrap
  evidence: the wrap reproduces at a fine pointer (touch block not applied) and switches at exactly 983/984, which only the app.css 983.98 block does. Touch changes heights (44) but not the natural widths (67/63/92).
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: app/src/ui/PenFoot.jsx + RecipePage.jsx:2038 + BatchRow.jsx:956
  found: two mounts of the one SaveCeremony — A (end of record, inside aside.notebook-log via BatchRow) and B (PenFoot, the foot band inside the Sheet's article.recipe-page). Buttons in DOM order Add tasting | Cancel | Save batch.
  implication: "the ceremony" can be either mount; must measure both.

- timestamp: 2026-09-29
  checked: app/src/styles/app.css:690-711 (.pen-foot, .pen-foot__controls) and app.css:2253-2277 (@media max-width 983.98px)
  found: from 984 up .pen-foot is grid-template-columns 2fr 1fr and .pen-foot__controls sits in grid-column 2 (one third of the foot). Below 984 the block collapses .pen-foot to 1fr and controls to grid-column 1 (full width). notebook.css has no 984 rule. The 984 switch is the only rule for either ceremony that changes at exactly 984.
  implication: prime suspect — the controls' column narrows by ~2/3 at exactly 984.

- timestamp: 2026-09-29
  checked: Playwright (headless Chromium 1234, fine pointer) on the built app :4173 (dist 12:20, newer than the last app/src commit at 12:19), /notebook/mexican-chocolate, Record a batch clicked
  found: |
    983: B pen-foot 823 one column; controls 823; ceremony 245 natural; Add tasting 67w 1 line, Save batch 92w h33 (1 line). No wrap.
    984: B pen-foot 600 = 378.656 + 189.328 cols; controls 189; ceremony squeezed to 189; Add tasting 41w h34 (2 lines), Save batch 62w h50 (2 lines). WRAPS.
    1024: col 203; Add tasting 47w 2 lines, Save batch 69w h50. WRAPS.
    1365: col 316 >= 245; no wrap.
    1366: Sheet back to 696 (log beside at 350); col 189 again; same wrap as 984.
    1600: col 267 >= 245; no wrap.
    Mount A (log) never wraps at fine pointer: 640 wide below 1366, 350 wide from 1366, content 245.
  implication: the wrap is mount B only, and it is the button labels breaking inside shrunken flex items (min-width:auto = longest word), not the row wrapping.

- timestamp: 2026-09-29
  checked: same probe with hasTouch (matchMedia pointer:coarse = true) at 984, 1024, 1366, 1600
  found: B at 984/1366 Add tasting 41w, Save batch 62x50; 1024 Add tasting 47w, Save batch 69x50; 1600 natural (67/63/92, 44 tall). A (log) natural at all four widths.
  implication: same on the iPad (1024 portrait, 1366 landscape), both inside the failing bands.

- timestamp: 2026-09-29
  checked: screenshots of .pen-foot at 983 / 984 / 1366-touch
  found: 983 = "Add tasting  [Cancel]  [Save batch]" one line; 984 and 1366 = "Add / tasting" and "Save / batch" each on two lines.
  implication: matches Mark's "wrapping starting at 984, but not below".

- timestamp: 2026-09-29
  checked: predicted thresholds from col2 = (foot width - 32)/3 vs the ceremony's natural 245 (67 + 12 + 63 + 12 + 92). Foot = vw - 384 (984-1365), vw - 766 (1366 up, log beside at 350)
  found: 1150 wraps / 1151 does not; 1532 wraps / 1533 does not; 1770 does not. Exactly as predicted.
  implication: failing bands (fine and coarse, same natural widths) are 984-1150 and 1366-1532. Above 1532 the one-third column is wide enough, which is why 1600 looks fine.

- timestamp: 2026-09-29
  checked: falsification test. Injected '.pen-foot{grid-template-columns:1fr}.pen-foot__controls{grid-column:1}' at 984 fine, 1024 coarse, 1366 coarse
  found: controls go 189/203/189 -> 600/640/600 and every button returns to natural size on one line (Save batch 92x33 / 92x44).
  implication: the one-third grid column alone causes it. Confirmed.

- timestamp: 2026-09-29
  checked: clicked Add tasting in the foot (tastingOpen true, so Add tasting leaves the ceremony)
  found: Cancel 63 + Save batch 92 + 12 gap = 167 < 189, so no wrap at 984/1024/1366.
  implication: AND-gate. The wrap needs the narrow column AND Add tasting present (the tasting section not yet opened).

- timestamp: 2026-09-29
  checked: Correct (amend pen) on /notebook/coconut and /notebook/mocha at 1024 coarse
  found: same B wrap (Add tasting 47w, Save batch 69x50).
  implication: both openers named in the reproduction are affected; PenFoot renders for 'record' and 'amend' alike (PenFoot.jsx:79).

- timestamp: 2026-09-29
  checked: sketch 011 boards (984-batch, 1024-batch, 1366-batch, 1600-pen and the rest)
  found: every board inlines the .pen-foot CSS (2fr 1fr, controls grid-column 2) but none renders a footer.pen-foot, a .save-ceremony element, "Add tasting" or "Save batch". The record/amend pen foot is drawn on no 011 board.
  implication: nothing in the board conformance probes could have caught it. The foot band's placement in layout C is an undrawn app-side choice.

- timestamp: 2026-09-29
  checked: git log -S "max-width: 983.98px" app.css; git log for .pen-foot 2fr 1fr
  found: .pen-foot 2fr 1fr + controls in column 2 dates from 03.1-01 (49c3556, "the pair right-aligned under the Notes column", when the Sheet spanned the full main width). 03.5-10 (2c130d4) moved the Sheet's one-column collapse from 1100 to 984 (Sheet = 696 at 984). 03.5-04/07 put the log beside the Sheet at 350 from 1366, bringing the Sheet back to 696 there.
  implication: the foot's one-third column now bottoms out at 189px on two bands that include both iPad orientations.

## Resolution

root_cause: "From 984 up, the foot band's copy of the save ceremony (PenFoot mount B, RecipePage.jsx:2038) sits in grid column 2 of .pen-foot's 2fr/1fr grid (app/src/styles/app.css:690-711), which is one third of the Sheet's foot. With the Sheet at 696 (984 and 1366) that column is 189px, and 203px at 1024, less than the ceremony's natural 245px (Add tasting 67 + Cancel 63 + Save batch 92 + 2x12 gaps). .save-ceremony (app.css:2079) does not wrap at those widths and its buttons are shrinkable flex items, so 'Add tasting' and 'Save batch' shrink to the width of their longest word and break onto two lines. Below 984 the app.css:2253-2271 block collapses .pen-foot to 1fr and the controls take the full foot width (823 at 983), so nothing wraps. Failing bands: 984-1150 and 1366-1532, which include both iPad orientations. Only when Add tasting is present (tasting section not open)."
fix: (not applied; find_root_cause_only)
verification:
files_changed: []
