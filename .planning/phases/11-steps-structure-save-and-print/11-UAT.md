---
status: testing
phase: 11-steps-structure-save-and-print
source: [11-VERIFICATION.md]
started: 2026-10-27T04:32:50Z
updated: 2026-10-27T04:32:50Z
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

### 3. Mark decides the recorded board departures
expected: Decide rows on Mark's List answered for the after-Save identity line ("Version 1 · Version 1 · Latest" vs the board's "Version 1 · Latest"), a lone version's History ("Only this version so far" vs a one-node fold), the split line ("600.0 g" vs "600 g") and fC1's "Not yet churned" board slip; each answer either keeps the build, redraws the board, or changes the build.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
