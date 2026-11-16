---
status: testing
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
source: [12-VERIFICATION.md]
started: 2026-11-16T14:37:28Z
updated: 2026-11-16T14:37:28Z
---

## Current Test

number: 1
name: PROOF-02 and success criterion 3: creation checked on the iPad (round two, not yet planned)
expected: |
  Tab reaches every creation control, focus stays with the moved step or row, the recipe prints
awaiting: user response

## Tests

### 1. PROOF-02 and success criterion 3: creation checked on the iPad (round two, not yet planned)
expected: After Design gate 2's work is built, from the production build (npm --prefix app run build && npm --prefix app run preview -- --host), create a recipe end to end on the iPad with its scales, problems and targets, Tab through every creation control including each Move button, move a step and a row, then print. Tab reaches every creation control, focus stays with the moved step or row, the recipe prints.
result: [pending]

### 2. Clipboard paper check (Mark's List row adoajjb9sgzbezmyrt4s)
expected: Print the Batch log and the Tasting log from the iPad and put them on the clipboard. Every printed line is clear of the clip, and each log is one sheet.
result: [pending]

### 3. G11: focus after Save over this version rests on Next version (commit c5373fb2)
expected: In the first-version editor, Save over a version and see where focus rests. Mark confirms focus should rest on Next version, or asks for a fix by a new quick task.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
