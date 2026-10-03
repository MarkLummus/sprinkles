---
phase: quick-261002-wn1
plan: 01
quick_id: 261002-wn1
subsystem: recipe-band
tags: [notebook, band, ingredients-head, phone, sketch-011-decision-30]
status: complete
requires: [261002-wmy, 261002-wmz, 261002-wn0]
provides:
  - "IngredientsHead (IngredientTable.jsx): the plain Ingredients h2, or below 724 the board's head row holding the h2 and the Sheet's .text-control Show/Hide changes"
  - "the band's Show changes gated off below 724 (VersionRow.jsx)"
  - "the board's three head-row rules (top-level) and one print rule (app.css)"
key-files:
  created:
    - .planning/quick/261002-wn1-show-changes-moves-to-the-right-aligned-head-row-of-the-ingr/261002-wn1-probe.mjs
    - .planning/quick/261002-wn1-show-changes-moves-to-the-right-aligned-head-row-of-the-ingr/261002-wn1-baseline.json
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/VersionRow.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/styles/app.css
    - app/src/ui/IngredientTable.test.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/styles/cross-cutting.test.js
decisions:
  - "Case S: reused wmz's useBelow724 and the below724 prop; no second hook, no new prop, useBelowDesktop.js untouched"
  - "A width signal, not render-both-and-hide-with-CSS: exactly one Show changes button exists at any width"
  - "Two wmz assertions in VersionRow.test.jsx (Tests C and F) were updated to the new rule, not deleted"
commits: 5
plan_head_before: b403acc8b02c0ad80a3972e68ec3e08152b37f8b
plan_head_after: fb024fc04a4c818626c6eaf2ed70263f3f789351
metrics:
  tasks: 3
  files: 8
actuals:
  tasks: 3
  commits: 5
---

# Phase quick-261002-wn1 Plan 01: Show changes on the Ingredients row below 724 Summary

Below 724, Coconut v2's Show changes (Hide changes when shown) is now an ink, underlined `.text-control` at the right end of the Ingredients heading row. The band keeps Record a tasting and Next version on one line. From 724 up, nothing moved: the band carries Show changes and the heading is the plain h2. A first version, any open pen and print show no control at the heading.

All readings come from Playwright WebKit and system Chrome on this Mac, not from Mark's iPhone or iPad.

## The choice and the case

A width signal, not render-both-and-hide-with-CSS. `RecipePage` already read one below-724 boolean (`useBelow724()`, wmz) and passed it to `VersionRow` as `below724`. It now passes the same boolean to `IngredientsHead`. Exactly one Show changes button exists in the DOM at any width. The four reasons, as planned:
1. Nothing hidden is left for iPad WebKit's Tab order, VoiceOver's rotor or a role query to find, and print's narrow paper width cannot bring the band's copy back.
2. The band's other below-724 edits (wmy, wmz, wn0) already need JS, so there is one signal for all of them.
3. Node tests keep working: the components take the boolean as a prop, so both placements render with no matchMedia stub.
4. The head row exists only when its control does, so the heading's markup from 724 up and for a first version is as it was.

**Case S.** wmz had moved `useBelow724` and `BELOW_724_QUERY` to `useBelowDesktop.js` and `BatchRow.jsx` imports them. `grep` finds one non-test holder of the `723.98px` query literal. Nothing was added to `useBelowDesktop.js`.

Cost, unchanged from the plan: rotating across 724 unmounts one button and mounts the other, so a focused control loses focus (CSS display:none would too).

## What was built

- `IngredientsHead({ parentVersion, openPen, below724, showingChanges, onToggleShowChanges })`, exported from `IngredientTable.jsx`, hook-free. The control shows only when `below724`, `openPen === null` and `parentVersion` are all truthy. Button props are in the board's attribute order (type, className, tabIndex, onClick). No aria-pressed.
- `VersionRow.jsx`: the band's button is gated `parentVersion && !below724`. The acts-group comment says where Show changes lives on each side of 724.
- `RecipePage.jsx`: the Ingredients h2 became `<IngredientsHead ... onToggleShowChanges={handleToggleShowChanges} />`. `handleToggleShowChanges` and the `changes` search parameter are untouched.
- `app.css`: the board's three head rules at the top level, directly after `.region-name`, and one print rule (`.ingredient-table-region__head .text-control { display: none }`). Still seven top-level `@media` blocks; the phone-forms selector pin passes unchanged.

## RED then GREEN

- RED `892fa4d`: Tests A to F (IngredientsHead), G, I and J failed as planned. **Test H is a guard** (prop false equals prop omitted, band keeps Show changes) and passed before and after.
- GREEN `f86f72a`: the move, with the probe and the baseline.
- Print RED `1b25ba9` (Test K, the existing print test widened from three rules to four), GREEN `1c8300d`.
- Probe `fb024fc`: the matrix group.

## Task 2 audit

- (a) Non-test hits for `Show changes|Hide changes|onToggleShowChanges` are `VersionRow.jsx`, `IngredientTable.jsx` (IngredientsHead) and `RecipePage.jsx`. Two more files, `tokens.css` (lines 262, 282) and `app.css` (the new print comment), name it only in comments.
- (b) `ingredient-table-region__head` appears in `app.css` as three top-level rules (999, 1007, 1011) and one print rule (2741). The phone-forms pin (cross-cutting.test.js) passed unchanged.
- (c) Yes. IngredientsHead's Tests A to F and VersionRow's Tests G and H render both placements in the node environment with no matchMedia stub.
- (d) Full suite: **58 files, 1561 tests, all passing**. Execution-start baseline was 58 files and 1551 tests (wn0's count), so +10 tests, +0 files. The plan-time figure was 55 files and 1516 tests. No test was removed. **Two existing assertions changed** because the new gate contradicts them, the planner having expected none: wmz's Test C and Test F in `VersionRow.test.jsx` expected `Show changes` last in the band's row below 724. Test C now asserts the row is [Record another, Next version] below 724 and [Next version, Show changes] from 724 up, with the text-control class; Test F's with-parent case drops `Show changes` from its expected labels. Both carry a 261002-wn1 comment.
- (e) `npm --prefix app run build` succeeds.

## Measurements (probe `matrix`: 1191 checks passed with `tracer`, both engines, exit 0)

Baseline was captured from a build of the post-wn0 source before any app edit. Precondition asserted: at 393 coarse the band held exactly one Show changes, Record a tasting and Go to batch (188 checks). Tracer: 7 checks in WebKit.

Every cell below uses Coconut v2 unless noted. Both engines agree on everything in the table except widths and table tops by Chromium's different text metrics, shown as WebKit / Chrome where they differ.

| Width, pointer | Control (count, where) | Head height | Control w x h (WebKit / Chrome) | Acts height before to after | One line | tableDocTop before to after (WebKit / Chrome) | Struck (shown / after Hide) | Overflow |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 320, 375, 393 coarse | 1, head (band 0) | 44 | 88.02 x 44 / 85.95 x 44 | 98 to 44 | yes (was no) | 676.41 to 647.52 / 679.08 to 650.19 | 21 / 0 | 0 |
| 723 coarse | 1, head | 44 | 88.02 x 44 / 85.95 x 44 | 44 to 44 | yes | 622.41 to 647.52 / 625.08 to 650.19 | 21 / 0 | 0 |
| 723 fine | 1, head | 24 | 88.02 x 24 / 85.95 x 24 | 44 to 44 | yes | 595.08 to 600.19 / 598.08 to 603.19 | 21 / 0 | 0 |
| 724 fine and coarse, 1366 fine and coarse | 1, band (head none) | none | band control unchanged to 0.5px | 44 to 44 | yes | unchanged | 21 / 0 | 0 |

- Every `v2-reading` and `v2-show-changes` cell: DOM count equals role count (1). Every `v1-reading`, `v2-pen`, `v2-record` and `v2-tasting` cell, at all nine widths: 0 controls, no head. `v1-reading` equals the baseline in every field at every width. From 724 up, every case equals the baseline within 0.5px (controls, acts, heading, tableTop, overflow).
- Below 724: the control's right edge is on the head's right edge, the heading's left is 0, text-decoration includes underline, weight 400, tabindex 0, no aria-pressed. After Hide: label Show changes, `changes` out of the URL, struck 0.
- The wrap is gone: at 320, 375 and 393 coarse the acts row went from 98 (two rows, wrapped) to 44 (one row) in both engines.

### Boards (393-show-changes-head.html coarse, 723-show-changes-head.html fine; three regions each)

Compared from the region's top to the table's top edge (the boards predate the Unallocated-head removal).

| Element | Board | App | Difference |
| --- | --- | --- | --- |
| Panel 1, head height, 393 / 723 | 44 / 24 | 44 / 24 | 0 |
| Panel 1, heading rect | equal | equal | within 0.5 |
| Panel 1, control x, y, w, h (WebKit 393) | 264.98, 0, 88.02, 44 | same | 0 (Chrome 267.05, 0, 85.95, 44, also same) |
| Panel 1, control color, family, size, weight, decoration | equal strings | equal strings | none |
| Panel 1, head to table gap | 6 | 6 | 0 |
| Panel 2, label, control size, head height | Hide changes | Hide changes | 0 |
| Panel 3 (Coconut v1), heading rect, gap, no head | gap 6, no head | gap 6, no head | 0 |
| Band acts height, 393 coarse | 44 | 44 | 0; labels [Record a tasting, Next version] on one line in both |
| Band acts height, 723 fine | 41 | 44 | 3, the departure decision 30 already records: the board draws the filled primitive 41 tall and centres 17px text controls, the app uses the 44 `--touch-min` floor. Not asserted. Labels equal; one line by vertical centres. |

The only probe change made during the run: the board's "one line" test at 723 compares vertical centres, not tops, for that reason. The first matrix run failed those two checks for it (one per engine).

### Keyboard, crossing, print

- Keyboard (393 coarse and 723 fine, both engines): `focus()` then Enter gives Hide changes with focus still on the same element and struck above 0; Space gives Show changes, same element, struck 0.
- Crossing (fine, both engines): Show changes in the band at 724, viewport to 723, the head reads Hide changes, band has none, struck above 0; Hide there gives struck 0; back at 724 the band reads Show changes and the head is gone.
- Print (393 coarse, both engines): the control computes `display: none` in print, the Ingredients h2 does not; on screen the control is shown again.

## For Mark

### Focus ring clipping in the sideways-scrolling region (finding, no CSS changed)

Reached by keyboard (Shift+Tab, Tab), the control has a 2px solid outline with 2px offset and no box-shadow, in both engines. Its right edge is on the region's right edge (clearance 0), and the region is `overflow-x: auto` below 724 (also at 723 fine). A 2px outline at 2px offset reaches 4px past the control's edge. I screenshotted it in WebKit at 393: the ring's right side is clipped, and so is the top, because `overflow-x: auto` makes `overflow-y` auto too and the control sits at the head row's top edge. The left and bottom sides draw. Fixing it needs either a gutter inside the region or a different ring for this control; I changed nothing, as asked. iPad with a keyboard and a desktop narrow window are the places it shows.

### The duplicated hook

None remains. The plan expected BatchRow's private `useBelow724` to stay as a duplicate to fold, but wmz had already moved it into `useBelowDesktop.js` and BatchRow imports it. What is left is two stale comments in `BatchRow.jsx` (around lines 163 and 528) that still say "BatchRow's own useBelow724"; not mine to touch.

### Decision 30's awkward points, with this run's numbers

- **The version-with-parent table starts lower than the first version's.** At 393 coarse the table is now 25.11px lower than Coconut v1's in both engines (647.52 against 622.41 in WebKit; 650.19 against 625.08 in Chrome). Before this item it was 54px lower (the wrapped row), so it is better. At 723 fine it is 5.11px lower (600.19 against 595.08 in WebKit); before this item the two were level at 595.08, so this one is slightly worse. 724 up is unchanged.
- **The control sits one scroll below the band.** At 393 coarse the control's top is about 598px down the page in WebKit (its table top 647.52, less the 6px gap and its 44px height) and about 600px in Chrome. It falls under the band, the Go to batch row and History's disclosure. Whether it is on the first screen depends on the device's viewport; on the 852px-tall test viewport it was visible without scrolling, but I did not measure a real iPhone's.
- **The label reads as table-scoped while switching the whole version.** Unchanged: the control is on the Ingredients row and also strikes the figures elsewhere on the page (the method's stale-amount flags follow `changes` as well). Not a number; Mark's call.

## Deviations from Plan

**1. [Rule 1 - Test follows the rule] Two wmz assertions updated.** Tests C and F in `VersionRow.test.jsx` asserted Show changes in the band's row below 724. Updated, not removed, as the plan allows. Commit `f86f72a`.

**2. [Probe] The 723 board's band "one line" check uses vertical centres.** Reason in the Boards section. Commit `fb024fc`.

Otherwise the plan ran as written. Nothing touched `.planning/sketches`, `.planning/canvas-generators`, `.impeccable` or DESIGN.md. `git status --porcelain app/src` is empty.

## Known Stubs

None.

## Threat Flags

None. The new control is a screen-only button reading the existing `changes` parameter; print hides it (T-wn1-01, Test K plus the probe's print check). One handler and one DOM button at any width (T-wn1-02, Test I plus the crossing and count checks). The probe served only on ephemeral 127.0.0.1 ports and saved nothing (T-wn1-03).

## Deferred: Mark's device check (human-check, end-of-run UAT)

`app/dist` was rebuilt from the final code, so Mark's :4173 preview serves it. I did not start, stop or request it, and left :8011 alone. Mark reloads the tab on each device (a hard reload if it looks stale), then checks:
1. iPhone, portrait (393), Coconut v2: the band reads Record a tasting and Next version on one line, with no Show changes. Scroll to Ingredients: Show changes at the right end of the heading, underlined, in ink rather than blue. Tap it: Hide changes and the struck old figures. Tap again: they go.
2. The same phone in landscape, 724 or wider: Show changes is back in the band, nothing at the Ingredients heading.
3. iPad (1366): the band is unchanged and Show changes is in it.
4. Coconut v1, both devices: no Show changes anywhere.
5. iPhone with Next version open, then Record a tasting open: no Show changes at the Ingredients heading.
6. Optional: the iPhone's print preview of Coconut v2 shows no Show changes at the Ingredients heading.
7. With a keyboard on iPad, or a narrow desktop window: Tab to the control and see whether the ring's top and right edges are clipped (the finding above).

The change counts as device-verified only when Mark confirms.

## Self-Check: PASSED

- Probe, baseline JSON and every file in `files_modified` exist; `git log` shows 892fa4d, f86f72a, 1b25ba9, 1c8300d, fb024fc after b403acc.
- `npm --prefix app test`: 58 files, 1561 tests passing. Build succeeds. `git status --porcelain app/src` empty.
