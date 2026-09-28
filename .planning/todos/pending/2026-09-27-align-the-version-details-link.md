---
created: 2026-09-27T11:55:25.183Z
title: Align the version section's Details link
area: ui
severity: cosmetic
files:
  - app/src/ui/VersionRow.jsx:272
  - app/src/styles/notebook.css
resolves_phase: "03.5"
---

## Problem

Mark, 2026-09-27: the Details link in the version section sits near the centre of its line. It is not aligned left, right, or to any other field.

## Solution

Investigate first: measure the rendered position against the sketch 011 boards at 1366, 1024, 983, 723 and 393, rather than reasoning from the CSS. Then align it to the edge or field the board draws. Likely the disclosure's grid cell or its flex alignment.
