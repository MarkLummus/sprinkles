---
status: testing
phase: 11-steps-structure-save-and-print
source: [11-VERIFICATION.md]
started: 2026-10-27T04:32:50Z
updated: 2026-10-27T04:42:10Z
---

## Current Test

number: 1
name: The store is exported from the iPad before the first build that can save a recipe
expected: |
  Mark's List row check-p11-export-store-before-saving: on the iPad, Export from the build served today, the file lands in Files. Done before any Phase 11 build reaches the device (D-21, the reset window).
awaiting: user response

## Tests

### 1. The store is exported from the iPad before the first build that can save a recipe
expected: Mark's List row check-p11-export-store-before-saving passes: the exported store file is in Files on the iPad before the first Phase 11 build is served to it (D-21).
result: [pending]

### 2. A recipe made on the iPad with two steps saves, prints its Sheet code, and keeps that code after Edit
expected: Mark's List row check-p11-ipad-create-steps-save-print-edit passes, all fifteen steps as written: the split row, Move and remove by touch and by keyboard with focus staying on the moved item, Save with "Recipe saved.", the PDF's Sheet code, Search finding the recipe before and after Edit and Save-over (D-20). Walked in Playwright WebKit first (32 PASS), which is not the device.
result: [pending]

### 3. Mark decides the board departures the build kept
expected: decide-p11-default-version-name-repeats answered (the after-Save identity line "Version 1 · Version 1 · Latest"); the other three departures (a lone version's History "Only this version so far", the split line "600.0 g", fC1's "Not yet churned") are Sid's redraw of sketch 014 per 11-UI-REVIEW.md, no answer needed from Mark; decide-p11-struck-target-size and bug-p11-target-required-under-wrong-field answered.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
