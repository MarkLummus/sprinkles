---
created: 2026-09-27T12:30:00.000Z
title: Keep the side nav's options on screen while the page scrolls
area: ui
severity: minor
files:
  - app/src/styles/shell.css
  - .planning/sketches/011-recipe-route-c/README.md
---

## Problem

Mark, 2026-09-27: "make the side-nav sticky so that when shown, the nav options don't scroll off the screen." At widths where the side nav shows (984 and up on the ladder), scrolling a long page carries the nav options up and off the screen.

## Solution

Draw it into sketch 011 first, since the sketch is the single authority. Then, through GSD, make the side nav's options sticky (for example `position: sticky; top: 0` with a height of at most the viewport, so a tall nav scrolls itself) within the shell grid in shell.css. Measure in a real render at 984, 1366 and 1920 on a long recipe page: the options stay in view, the running head is not covered, and the page itself doesn't scroll sideways. Check that it doesn't interfere with the log column beside the Sheet from 1366 up.
