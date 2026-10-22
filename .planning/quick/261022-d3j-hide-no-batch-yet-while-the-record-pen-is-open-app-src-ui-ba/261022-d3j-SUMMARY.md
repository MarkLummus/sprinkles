---
phase: quick-261022-d3j
plan: 01
quick_id: 261022-d3j
status: complete
subsystem: ui
tags: [batch-route, log-column, placeholder]
key-files:
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
commits: 2
plan_head_before: 358b3ecea8286cde01c3ca11e06c8c699f736d03
plan_head_after: ac2ff0ff
---

# Quick 261022-d3j: hide "no batch yet" while a pen is open

The zero-batch placeholder list in the log column now renders only when `batches.length === 0 && openPen === null`, so "no batch yet" no longer sits under Save batch while the first batch is recorded (critique P3, Mark 2026-10-22).

## Commits

- 9ea79c6e test(261022-d3j): the no-batch placeholder is absent while a pen is open
- ac2ff0ff fix(261022-d3j): hide "no batch yet" while a pen is open

## Verification

- RED: the two new "empty-list placeholder" tests failed (2 failed) against unchanged BatchRow.jsx.
- GREEN: the filtered run is 2 passed.
- Full suite: 3730 passed in 120 files (base 3728 in 120). BatchRow.test.jsx: 243 before, 245 after.
- Strict walk (10-walk-check.sh): `MATCH 94 snapshots`. 10-walk-before.json unchanged; no snapshot updated.

## Interpretation for Mark

The condition is `openPen === null`, following the item text ("only when no pen is open") and the sibling Record a batch button. This hides the placeholder under the Next version pen (openPen 'plan') as well. The alternative, `openPen !== 'record'`, would keep it there, matching `showBatchList`'s decision 19. The version-pen test pins the current choice; flipping it is a one-condition change plus that test.

## Deviations from Plan

None. The plan executed as written.

## Known Stubs

None.
