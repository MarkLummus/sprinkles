---
created: 2026-09-22T17:20:00.000Z
title: Shorten "Continue developing" to "Keep developing" in boards and app
area: ui
severity: cosmetic
files:
  - app/src/ui/RecipeList.jsx:181-183
  - app/src/ui/RecipeList.test.jsx:127-133
  - app/src/ui/RecipeList.test.jsx:289-296
  - .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/boards/project/Phone390Tabs.dc.html:32
  - .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/boards/project/AltResumeSideNav.dc.html:73
  - .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/boards/project/AltResumeSideNav.dc.html:101
---

## Problem

The secondary Home action on an awaiting-tasting recipe reads "Continue developing". At phone width the label is long enough that the button wraps its text onto two lines (Mark, 2026-09-22, seen in phone rows). Mark wants something shorter such as "Keep developing", applied in the artboards and the app together so the sketch stays the authority and the app matches it.

## Solution

- Change the label in the two boards (Phone390Tabs and AltResumeSideNav) first, then in `RecipeList.jsx` and its two test assertions, in one quick task. No other wording changes.
- Note: after 03.4-12 the row's secondary action is hidden at phone width (`.home__row .home__action--secondary { display: none }`), so at 393px the wrap now shows on the lead block, which keeps both actions per board 171. Confirm on the device that the shorter label fits the lead's two-up actions at 393px before closing.
- Plain words, short labels (D-11): "Keep developing" is Mark's suggestion; pick it unless the boards argue for another.
