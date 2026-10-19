---
status: testing
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
source: [09-VERIFICATION.md]
started: 2026-10-19T03:10:06Z
updated: 2026-10-19T03:10:06Z
---

## Current Test

number: 1
name: Notebook and Ingredients places, and the reset store, on the iPad (Mark's List row check-p9-places-and-reset-on-ipad)
expected: |
  Served from the production build and preview (never the dev server), the iPad's profile opens at
  database version 10 with 111 ingredients; Home and Notebook list the 8 recipes in the same order;
  Ingredients searches by name and category, Tab from Name reaches Category, and an open entry shows
  its figures with Basis and Source; the olive oil 2 Aug batch reads Sweetness 4 and Oil 4; neither
  place offers New recipe or any edit. The row's ten steps are the test.
awaiting: user response

## Tests

### 1. Notebook and Ingredients places, and the reset store, on the iPad
expected: The row check-p9-places-and-reset-on-ipad passes step by step: version-10 profile with the larger library, the two places as sketch 012 draws them, the batch reads as before. Known, not defects: Milk Chocolate's closed row at 393 is 122 px (board 109); basis and source run together at 393 (board draws the same; decide-p9-393-source-own-line asks whether to redraw).
result: [pending]

### 2. Lactose line on entries that are not dairy but hold milk solids
expected: Mark answers decide-p9-lactose-line-non-dairy (as-drawn, or any-milk-solids which Sid draws into sketch 012 before a quick task builds it). Today the line shows only where dairy === true.
result: [pending]

### 3. New lines and a recovery page no board draws
expected: Mark approves look-p9-new-lines (the post-import recovery page titled 'Import' with 'The file was imported. Reload the page to see it.', and the Packed state facts line) or names a change; a shape change goes to Sid first.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps

(none yet)

## Related rows on Mark's List (from the Phase 9 UI review and code review; not UAT items)

- decide-p9-boot-word-problems, decide-p9-facts-line-shape, decide-p9-393-source-own-line (UI review findings 1 to 3)
- bug-home-record-tasting-opens-wrong-batch (a Phase 03.4 defect Sid saw in passing)
- Code review WR-01 and WR-02 and IN-01 to IN-05 are recorded open in 09-REVIEW-DISPOSITION.md and await triage.
