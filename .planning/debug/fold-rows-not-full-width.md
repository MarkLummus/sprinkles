---
status: diagnosed
trigger: "G-03.5-4: At 393 every fold head (Version, History, Balance, Watch for, Tasting) should be one full-row 44px button (393-batch.html, decision 19 addendum). Mark: 'Is the Show button supposed to be full width of screen or width of visible text? If full width, then fail. Tasting button stops at tasted date unknown.'"
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

bug_class: Bohrbug (deterministic CSS layout)
hypothesis: CONFIRMED — two container defects (band grid align-items:start carried into the <=723.98 flex column; Tasting's h3 is a content-sized item of a flex row at every width)
test: live-page CSS injection at 393 (done; confirmed)
expecting: n/a
next_action: return ROOT CAUSE FOUND to orchestrator (diagnose-only)
reasoning_checkpoint:
  hypothesis: "Version fold is 281/234 because .notebook-band__grid's align-items:start (notebook.css:58) survives into its <=723.98 flex-column override (892-896) and stops the version section stretching; Tasting fold is 232 because its h3.region-name is a non-growing flex item of the flex-row .tasting-reading__head (app.css:1459-1464)."
  confirming_evidence:
    - "Computed style on the live page: grid display=flex dir=column align-items=start; tasting head display=flex dir=row; h3 232 wide inside a 353 head"
    - "Injecting align-items:stretch and flex:1 1 auto alone makes both 353x44 and puts the date at the row end"
  falsification_test: "If the buttons stayed narrow after the injection, or Balance/Watch for (same FoldRow, block parents) were also narrow, the cause would be FoldRow itself — they are 353 and the injection fixes both."
  fix_rationale: "Restoring stretch/fill on the containers lets FoldRow's existing width:100% reach the row width, as the board's flex-column wrappers do."
  blind_spots: "Side effects of stretching the band grid's other child (.notebook-recipe) and the pen form (.notebook-ceremony) at <=723.98 not checked visually; Batches fold (>=2 batches) not measured, only reasoned from computed container styles (flex column, ai=normal)."
  candidate_causes:
    - "code/CSS: container alignment and flex sizing (confirmed)"
    - "environment: stale dist build on :4173 (eliminated — build 12:20 postdates last app/src commit 12:19)"
    - "code/component: FoldRow width rule (eliminated — Balance/Watch for 353 with the same rule)"
  and_gate: "no — the two causes are independent (each explains one fold); neither needs the other"

## Symptoms

expected: At 393 coarse, every fold head (Version, History, Balance, Watch for, Tasting) is one full-row 44px-tall button (board 393-batch.html: left=20 width=353 h=44); label then Show/Hide; any count/date at the row's end (Tasting's date at the end).
actual: Balance/Watch for 353 (match). Version fold button.fold-row 281px (Olive Oil v1) and 234px (Mexican Chocolate v4) — shares a row with band/identity grid. Tasting fold 232px; spans "TastingShow@20+105, tasted date unknown@139+113" — date directly after Show, button hugs content.
errors: none (layout defect)
reproduction: UAT test 4 — built app on :4173, iPhone 15 emulation (393, coarse), /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 and Mexican Chocolate v4; compare with .planning/sketches/011-recipe-route-c/393-batch.html
started: discovered during 03.5 UAT

## Eliminated

- hypothesis: FoldRow's own rule lacks width:100% / has content-sizing
  evidence: notebook.css:162-180 `.notebook .fold-row` is display:flex; width:100%; justify-content:space-between; min-height:var(--touch-min). Balance/Watch for use the same component and measure 353. The rule is correct; the containing block is what differs.
  timestamp: 2026-09-29
- hypothesis: stale dist build on :4173
  evidence: dist/assets built 2026-09-28 12:20; last app/src commit ee68729 at 12:19. Build matches HEAD source.
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: real DOM, gsd-browser session dbg-g4, iPhone 15 emulation (393, coarse, max-width:723.98 matches), /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1
  found: |
    Version fold 20+281x44; parent section.notebook-version 20+281 (flex column); grandparent div.notebook-band__grid computed display=flex dir=column align-items=START, 20+353.
    Balance/Watch for 20+353x44 (parents: block h2.region-name 353).
    Tasting fold 20+232x44, spans head@20+105, count@139+113; parent h3.region-name display=block 20+232; grandparent div.tasting-reading__head display=flex dir=row align-items=baseline 20+353.
  implication: Two independent containing-block causes. (1) band grid's base align-items:start (notebook.css:58) persists into the <=723.98 flex-column override (notebook.css:892-896), so the version section is not stretched and shrinks to max-content. (2) Tasting's h3 is a non-growing flex item in a flex row, so it is max-content wide; the button's width:100% resolves against that, leaving zero free space for space-between, so the date sits one gap after Show.

- timestamp: 2026-09-29
  checked: Mexican Chocolate v4 at 393 (same session)
  found: fold-version 20+234 (section 234, grid ai=start 353); fold-history 20+353 (section.notebook-history is a child of header.notebook-band, a flex column with ai=normal); balance/check 353.
  implication: Version width tracks the section's widest child (identity line), so it varies per recipe (281 vs 234). History is unaffected because it sits outside the band grid.

- timestamp: 2026-09-29
  checked: Olive Oil v1 at 723, 724, 983, 1024, 1366 (coarse)
  found: |
    723: grid flex/column/ai=start; version 281 of 683; tasting 232 of 683 (count@139).
    724: grid display=grid; version 273 = its full grid column (fine); tasting 232 of 644.
    983: version 386 (full column); tasting 232 of 903.
    1024: version 306 (full column); tasting 232 of 720.
    1366: version 451 (full column); tasting 226 of 350 (log beside).
  implication: Version defect is confined to <=723.98 (flex-column override). Tasting defect is present at EVERY width, because .tasting-reading__head is a flex row at all widths.

- timestamp: 2026-09-29
  checked: boards 393/723/983/984/1024/1366/1600-batch.html, the Tasting and Version fold markup
  found: Every board draws the Tasting fold button as a direct child of `div style="display:flex;flex-direction:column;gap:12px;padding-top:14px;border-top..."` — no heading wrapper, no flex row. The 393 board's band container is `display:flex;flex-direction:column;gap:20px` with default align-items (stretch); the Version button sits in `display:flex;flex-direction:column;gap:12px`. Button style: display:flex;width:100%;min-height:44px;justify-content:space-between;gap:14px.
  implication: The board is full-row at every width; the app diverges on the containers, not on the button.

- timestamp: 2026-09-29
  checked: falsification by intervention — injected <style> into the live built page at 393 (no source edit): `@media (max-width:723.98px){.notebook-band__grid{align-items:stretch}} .tasting-reading__head .region-name{flex:1 1 auto}`
  found: BEFORE version 20+281, tasting 20+232 count@139+113. AFTER version 20+353x44, tasting 20+353x44 count@260+113 (right edge 373 = row end). Balance/Watch for unchanged at 353.
  implication: Root cause confirmed: those two container properties alone account for both symptoms.

- timestamp: 2026-09-29
  checked: provenance (git blame) and the conformance probe
  found: |
    notebook.css:58 align-items:start and :892-896 flex-column override both from 715de20 (2026-09-25). app.css:1459-1464 .tasting-reading__head flex row from 31ef311 (2026-09-17), when it held the h3 AND a separate date paragraph. 7df2032 (03.5-16 Task 2, 2026-09-28) moved the date into FoldRow's count and wrapped FoldRow in h3.region-name inside that same flex row — leaving the flex row vestigial (one child).
    03.5-band-probe.mjs:601-604 asserts "control width within 1px of its PARENT" and :615-618 "count's right edge at the CONTROL's own right". Both parents shrink-wrap the button and the button shrink-wraps its count, so both checks pass tautologically; no check compares against the column width or the board's 353.
    Same bug class was already found once: notebook.css:856-871 (03.5-17 Rule 1 fix) — .notebook-body's align-items:flex-start carried into its column override and shrank .notebook-log; the band grid's identical override was not swept.
  implication: Why not caught: the probe's width oracle is relative to the immediate parent, not to the row/board.

## Resolution

root_cause: "Two container defects, not a FoldRow defect (FoldRow's own rule, notebook.css:162-180, is width:100% + space-between and is correct). (1) Version: notebook.css:58 gives .notebook-band__grid `align-items: start` (harmless in the >=724 grid, where it acts on the block axis); the <=723.98 override at notebook.css:892-896 turns the grid into a flex column without resetting align-items, so `start` now acts on the inline axis and section.notebook-version shrinks to its widest child (281 Olive Oil, 234 Mexican Chocolate). Only <=723.98 is affected. (2) Tasting: BatchRow.jsx:335-343 wraps FoldRow in h3.region-name inside div.tasting-reading__head, which app.css:1459-1464 makes a flex ROW (align-items:baseline) at every width; the h3 is a non-growing flex item sized to max-content (232), the button's width:100% resolves to 232, space-between has no free space, so the date sits one 14px gap after Show. Affects every width (232 at 723-1024, 226 in the 350 log at 1366)."
fix: (not applied — find_root_cause_only)
verification: "Intervention at 393 on the built app: injecting only `.notebook-band__grid{align-items:stretch}` (<=723.98) and `.tasting-reading__head .region-name{flex:1 1 auto}` moved Version 281->353 and Tasting 232->353 (both 44 tall, left 20) and the date to the row end (count right 373)."
files_changed: []
why_not_caught: "03.5-band-probe.mjs:601-604 and :615-618 compare the button to its immediate parent and the count to the button's own right edge; both parents shrink-wrap, so the checks are tautological. No check compares against the column/board width (353)."
