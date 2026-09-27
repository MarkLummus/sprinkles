---
created: 2026-09-27T11:55:25.183Z
title: Recipe band buttons narrow on hover or click
area: ui
severity: cosmetic
files:
  - app/src/styles/notebook.css
  - app/src/styles/app.css
---

## Problem

Mark, 2026-09-27: the buttons in the recipe band (Rename, Next version and their neighbours) get narrower when hovered or clicked.

## Solution

Measure in a real render: the button's box before, on hover, on :active and on :focus-visible, at a fine and a coarse pointer. Find which state changes the width. Likely a padding, border or font-weight change in a state rule, or the notebook-action's invisible 1px border, which 03.5-CONFORMANCE.md Open for Mark #4 mentions. Fix it so every state keeps the resting width.
