---
created: 2026-09-27T11:55:25.183Z
title: Show changes toggles to Hide changes by state
area: ui
severity: minor
files:
  - app/src/ui/VersionRow.jsx:346
  - app/src/ui/RecipePage.jsx:2017

resolves_phase: "03.5"
completed: 2026-10-02
status: completed
---

## Problem

Mark, 2026-09-27: "Show changes" has been on the recipe route for a while and always reads "Show changes", whatever its state. The newer below-desktop folds toggle their label by state, for example "Show balance and things to check" / "Hide balance and things to check" (RecipePage.jsx:2017). The two conventions are inconsistent, and a fixed label makes the current state less obvious.

## Solution

Make the control read "Show changes" when changes are hidden and "Hide changes" when they are shown, like the balance fold. Check the sketch 011 boards first (the sketch is the authority): if a board draws only one label, draw the other state onto the board before the app edit.
