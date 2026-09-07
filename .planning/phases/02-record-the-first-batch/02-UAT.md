---
status: complete
phase: 02-record-the-first-batch
source: [02-VERIFICATION.md]
started: 2026-09-07T00:23:01Z
updated: 2026-09-07T02:00:28Z
---

## Current Test

[testing complete]

## Tests

### 1. The new-batch door and the unknown-address wording
expected: On the churned recipe with the 2 Aug batch showing, the margin offers "Record another batch" after the batch list, worded so it cannot be read as a correction of the open batch, and clicking it opens the pen layer with an empty draft. Visiting /recipe/olive-oil-ice-cream-v1/batch/does-not-exist shows "No batch of this version has that address." rather than the zero-batch sentence.
result: pass
note: Single-batch version shows no batch list (list renders at 2+ batches by design); the open batch is not a link. Mark noted this; confirmed intentional.

### 2. The cancel door
expected: Open the pen layer via the new control and cancel it: the page returns to the reading state immediately with no dialog of the app's own and nothing written. Amend, change a value, cancel: the saved value is unchanged and no amendment date is added. Amend, cancel, then record a genuinely new later-dated batch: both batches persist independently, the batch list shows both, the version line moves to the newer date, and the older batch is unchanged when reopened by its own URL. The native leave-warning fires only while a draft is dirty and stops firing once cancelled.
result: pass

### 3. The struck-step label and the axis clear control
expected: On the 2 Aug batch, step 1 reads struck with "Skipped" beside it carrying no strike-through. In "Add a tasting" with no axis marked, no clear control appears and Save tasting is disabled with its hint. Marking one axis grows a Clear control on that axis only and enables Save tasting. Clicking Clear returns the axis, the save gate, and the hint to their exact pre-mark state. Marking three axes, clearing the middle one, and saving shows two marks and "unmarked" for the cleared axis. Tabbing through an axis, arrow keys/Home/End still move the mark, the focus outline is visible, and Clear takes its own tab stop with an accessible name naming its axis.
result: pass

## Summary

total: 3
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

## Notes

- G-02-4 is half closed by design: the cancel control shipped; "Save batch is hard to find" (button weight and margin position) remains open against Impeccable per plan 02-04 assumption A-3. It is design debt, not a test here.
- The BATCH2-01 / SC5 snapshot-scope question was deferred by Mark to Phase 3 planning during the prior UAT session and is not re-tested here.
- The prior UAT session (3 passed, 4 issues, 1 blocked, 1 deferred) is preserved in git history at commit 989e690.
