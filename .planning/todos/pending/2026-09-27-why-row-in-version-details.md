---
created: 2026-09-27T13:30:00.000Z
title: Look into the Why row in the version details
area: ui
severity: cosmetic
files:
  - app/src/ui/RecipeBand.jsx
  - app/src/styles/notebook.css
---

## Problem

Seen in the desktop-state study (2026-09-27, https://claude.ai/artifact/J7LiG5oEA8YeNjzH2Ugvbw, "1366 open" screenshot; also in the 1600 render): in the band's version details, WRITTEN sits with its value on the same line ("WRITTEN 1 Jul 2026"), but under WHY the value "no reason recorded" drops to the next line, indented about 58px past the label's left edge. The two rows don't share a layout. Mark, 2026-09-27: "add a note to look into the Why row."

## Solution

Compare with the version details on sketch 011's 1600 boards (the authority), read the board's CSS, and measure the built app's Why row with a saved Why and with none, at 1366 and 1600 (fine pointer) and 393 (coarse). Decide with Mark whether the Why value sits inline like Written or on its own line under the label; either way, its left edge lines up with the label or with Written's value, not a stray indent. The saved Why stays in the hand (decision 17).
