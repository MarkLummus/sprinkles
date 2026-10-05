---
created: 2026-09-22T15:18:35.000Z
title: Settle the App-context radius in DESIGN.md, then revisit the rail's active item
area: design
severity: minor
files:
  - DESIGN.md
  - app/src/styles/shell.css
  - .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/boards/project/AltResumeSideNav.dc.html
---

## Problem

Board 170's active rail item is a rounded pill (8px radius, bold). The app's active place is
a square subtle-surface block with no radius or weight rule. Mark ruled at 03.4 UAT
(2026-09-22, test 7 finding 2): keep as shipped for now, because the design system has
settled radius only for the Sheet context, not the App context. Once an App-context radius
is decided in DESIGN.md, revisit the rail's active-item treatment against board 170.
