---
created: 2026-09-27T11:55:25.183Z
title: Align the version section's Details link
area: ui
severity: cosmetic
files:
  - app/src/ui/VersionRow.jsx:272
  - app/src/styles/notebook.css

resolves_phase: "03.5"
completed: 2026-10-04
status: completed
---

## Problem

Mark, 2026-09-27: the Details link in the version section sits near the centre of its line. It is not aligned left, right, or to any other field.

## Solution

Investigate first: measure the rendered position against the sketch 011 boards at 1366, 1024, 983, 723 and 393, rather than reasoning from the CSS. Then align it to the edge or field the board draws. Likely the disclosure's grid cell or its flex alignment.

## Resolution

Closed 2026-10-04 by quick 261004-ly4. No app change was needed: the control was already built where sketch 011 draws it.

- Cause on 2026-09-27: the control was 03.5-08's below-desktop "Details" button (`HistoryDisclosure`, a `.text-control` button as a direct flex item of the column `section.notebook-version`). Nothing set its width or text-align, so it stretched to the column with its word in the middle. This was read from the CSS at 7fbef79, not re-measured.
- Fix that already shipped: 03.5-15 (commit 4f29572, 2026-09-28, sketch 011 decision 18) replaced it with `FoldRow`: the VERSION caption, then "Show details" or "Hide details" one 14px head gap after it, on the caption's baseline, at the section's left edge. details-fold.html, canvas version 250 and every width board draw exactly that.
- Measured by quick 261004-ly4 on the built app in Playwright WebKit (coarse pointer, up to 1366) and system Chrome (fine pointer), at 1366, 1024, 983, 723 and 393, on Mexican Chocolate v3 and Olive Oil v1, at the default fold state and after one activation (40 readings), against 1366-batch, 1024-batch, 983-batch, 723-batch, 393-batch and details-fold (12 board loads). 780 checks pass. In every reading the row starts at the section's left edge (0) and is as wide as the section; the VERSION caption starts at the row's left edge (0.01 in WebKit, 0 in Chrome); the word starts 14.01px (WebKit) or 14px (Chrome) after the caption ends; caption and word share a baseline (delta 0); the row is 44px tall. The word's left edge is 74.78 (Show) or 74.79 (Hide) in WebKit and 74.28 in Chrome, identical to the boards. The word sits 13% to 34% of the row's width left of the row's centre, so it is not centred. One activation swaps the word and leaves its left edge where it was. Readings are in `.planning/quick/261004-ly4-align-the-version-section-s-details-link-app-src-ui-versionr/261004-ly4-measure.json`; the probe that makes them is `261004-ly4-probe.mjs` in the same folder and re-runs with `node`.
- Device-unverified: every reading is from Playwright on the Mac. It counts as device-verified only when Mark confirms on the iPad and iPhone. If it still looks centred to him, reopen this todo.
