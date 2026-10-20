---
status: complete
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
source: [09-VERIFICATION.md]
started: 2026-10-19T03:10:06Z
updated: 2026-10-20T02:38:24.760Z
---

## Current Test

[testing complete]

## Tests

### 1. Notebook and Ingredients places, and the reset store, on the iPad
expected: The row check-p9-places-and-reset-on-ipad passes step by step: version-10 profile with the larger library, the two places as sketch 012 draws them, the batch reads as before. Known, not defects: Milk Chocolate's closed row at 393 is 122 px (board 109); basis and source run together at 393 (board draws the same; decide-p9-393-source-own-line asks whether to redraw).
result: pass
note: Mark passed the row check-p9-places-and-reset-on-ipad on the iPad 2026-10-19. He named the basis-and-source run-together at 393 as a defect to fix; it was already decide-p9-393-source-own-line, redrawn by Sid (look-p9-012-redraw, approved) and built in quick batch 261019-arp (385c7bb6).

### 2. Lactose line on entries that are not dairy but hold milk solids
expected: Mark answers decide-p9-lactose-line-non-dairy (as-drawn, or any-milk-solids which Sid draws into sketch 012 before a quick task builds it). Today the line shows only where dairy === true.
result: pass
note: Mark chose any-milk-solids; Sid drew it into sketch 012 (decision 6) and the quick batch 261019-arp built it (55891a98).

### 3. New lines and a recovery page no board draws
expected: Mark approves look-p9-new-lines (the post-import recovery page titled 'Import' with 'The file was imported. Reload the page to see it.', and the Packed state facts line) or names a change; a shape change goes to Sid first.
result: pass
note: Mark asked to see it live (look-p9-new-lines), then approved both pieces as rendered on look-p9-new-lines-live; nothing to build.

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

(none yet)

## Related rows on Mark's List (from the Phase 9 UI review and code review; not UAT items)

- decide-p9-boot-word-problems, decide-p9-facts-line-shape, decide-p9-393-source-own-line (UI review findings 1 to 3)
- bug-home-record-tasting-opens-wrong-batch (a Phase 03.4 defect Sid saw in passing)
- Code review WR-01 and WR-02 and IN-01 to IN-05 are recorded open in 09-REVIEW-DISPOSITION.md and await triage.
