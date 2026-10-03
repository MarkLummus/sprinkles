---
created: 2026-09-27T11:55:25.183Z
title: Version Details control reads Show details / Hide details
area: ui
severity: minor
files:
  - app/src/ui/VersionRow.jsx:272

resolves_phase: "03.5"
completed: 2026-10-02
status: completed
---

## Problem

Mark, 2026-09-27: below desktop, the version section's fold control reads "Details" in both states (VersionRow.jsx:272, the 03.5-08 fold). The other folds toggle by state ("Show balance and things to check" / "Hide …"). This is related to 03.5-CONFORMANCE.md "Open for Mark" #9 (the fold labels).

## Solution

Relabel it "Show details" / "Hide details" by state, and draw it into sketch 011 first. Do it together with the Show/Hide changes todo so the labels change in one pass.
