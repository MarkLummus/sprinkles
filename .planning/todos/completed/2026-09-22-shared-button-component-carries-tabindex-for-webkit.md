---
created: 2026-09-22T23:40:00.000Z
title: A shared Button component that always carries tabindex, so every button, checkbox and radio Tabs on iPadOS Safari with Full Keyboard Access off
area: ui
severity: major
gap: G-03.4-r5-2
debug_session: .planning/debug/ipad-recipe-page-tab-skips-controls.md
files:
  - app/src/ui/VersionRow.jsx
  - app/src/ui/History.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/FormulationNote.jsx
  - app/src/ui/GraduatedRule.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/PenFoot.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Authored.jsx
  - app/src/ui/Segmented.jsx
  - app/src/ui/AxisMark.jsx
---

## Problem

With Full Keyboard Access off (Mark's standing decision: FKA on locks the iPad keyboard
until a power cycle), WebKit skips any <button>, checkbox or radio that has no explicit
tabindex, the same gate that skipped links before 03.4-14 and 03.4-15. The recipe page's
reading view is all such buttons (History x2, Next version, Record, Correct, the six Balance
rules), so on the iPad Tab goes running head, then back to Safari. UAT round five test 2
(2026-09-22): "only link on the recipes page is Sprinkles link in the sheet header, then back
to Search". App-wide 38 sites lack the attribute (34 buttons, 2 checkboxes, 2 radios) across
the files above; the edit modes would skip Save/Cancel, the radio groups and the Skipped
checkbox the same way (from source, not seen on device).

## Mark's ruling (2026-09-22)

"defer this for now. I like the shared component idea the best, since we are using react."
So: not a 03.4 gap-closure plan. When picked up, build one shared Button component that
always sets tabIndex={0} (and the checkbox/radio equivalent), migrate the 34 buttons to it,
and pin on rendered markup per component as 03.4-14/15 did. FormulationNote reading mode
goes to 0, edit modes stay -1; the two h2 landing targets stay; summary, select, textarea and
text/date inputs need nothing; disabled buttons need no care; the named radio groups remain
one Tab stop each. Extend the .claude/CLAUDE.md convention from "every <a>" to every
non-text control when this lands.
