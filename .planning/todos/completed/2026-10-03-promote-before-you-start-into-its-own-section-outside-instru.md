---
created: 2026-10-03T11:17:25.000Z
title: Promote "Before you start" into its own section outside Instructions
area: design
severity: minor
files:
  - app/src/ui/Method.jsx
  - app/src/ui/RecipePage.jsx
  - .impeccable/surfaces/route-print-recipe-sheet.md:48
  - .impeccable/surfaces/route-recipe.md:27
  - .impeccable/surfaces/route-recipe-version.md:63
  - DESIGN.md:213
  - DESIGN.md:461
---

## Problem

Mark, 2026-10-03: promote "Before you start" into a separate section, outside Instructions. Today every document treats it as part of Instructions: the print brief says it heads the Instructions and is closed by a hairline rule, as on screen (route-print-recipe-sheet.md line 48); route-recipe.md lists the Sheet's parts as Sheet title, Sheet description, ingredients, Before you start, Instructions (line 27); DESIGN.md says the same (lines 213 and 461). The app renders it inside Method.jsx under the Instructions heading, so quick 261003-9bz (hide the empty Instructions section, docs 1322957) keys the section on steps OR notes.

## Solution

Promoting it reverses that decision, so it needs a sketch first: draw it on a sketch 011 board (reading, pen, print), update the briefs and DESIGN.md, then make the app change through a GSD command.

Things it would settle:
- A version with notes but no steps would show Before you start but no Instructions.
- The empty "Before you start" subhead and rule that still render on versions with steps but no notes (Strawberry v1, Mexican Chocolate) go away or move.
- `showsMethodRegion` in Method.jsx and the `recipe-page--no-method` grid class change.
- Print's "Instructions page" opener.
- The notes' inherited-note marker and staleness reading (route-recipe-version.md line 63) are unaffected but must be rechecked.

Not part of the add-step work that arrives with creating: Mark keeps the pen's empty Instructions heading until then (2026-10-03).
