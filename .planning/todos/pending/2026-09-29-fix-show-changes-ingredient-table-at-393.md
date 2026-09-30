---
created: 2026-09-29T22:20:00Z
title: Fix Show changes ingredient table at 393
area: ui
severity: major
files:
  - app/src/ui/IngredientTable.jsx
  - app/src/styles/app.css
---

## Problem

On iPhone (393), Show changes messes up the ingredients table: the struck parent amounts
push the new amount into the ingredient name column. Reported by Mark on 2026-09-29 while
03.5 gap-closure plans 19-25 were executing. Distinct from G-03.5-2b (steps and rows the
child dropped) and from plan 22 (the recording as-made field width).

## Solution

TBD. Measure the real DOM at 393 with Show changes on, in a version whose amounts changed
against its parent, before editing. Build and preview, not the dev server; verify on the device.
