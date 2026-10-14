---
created: 2026-10-14T00:29:58.266Z
title: Carry declared defects into a new version
area: ui
severity: major
files:
  - app/src/domain/lineage.js:123
  - app/src/ui/BatchRow.jsx:625
  - app/src/ui/PrintLogPages.jsx:195
---

## Problem

Mark, on the iPad (2026-10-13): on Olive Oil v1 the Bitter defect is available in the record pen's tasting, but on a v2 made with Next version it is gone. He expects a new version to keep it.

Reproduced in WebKit: v1's record pen shows Bitter; the record pen of a v2 saved from v1 does not.

Likely cause, read from the code and not yet fixed: `createChildVersion` in `app/src/domain/lineage.js:123` copies `declaredAxes` from the parent but not `declaredFlaws`, so a child version has none. The pen reads `version.declaredFlaws` (`BatchRow.jsx:625`) and the printed log reads it too (`PrintLogPages.jsx:195`), so the defect also drops off v2's printed Tasting log.

## Solution

Route: `/gsd-quick`. Copy `declaredFlaws` in `createChildVersion`. Check the other parent-copied fields (targets, equipment, process, iceEd) for the same gap. Add a domain test that a child keeps `declaredFlaws`. Check the Rename/correct path (`saveOverVersion`) keeps it too.
