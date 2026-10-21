---
status: complete
phase: 10-the-creation-editor-without-save
source: [10-VERIFICATION.md]
started: 2026-10-20T16:55:50Z
updated: 2026-10-21T11:10:51.038Z
---

## Current Test

[testing complete]

## Tests

### 1. A recipe started on the iPad comes back on Resume and leaves nothing after Cancel
expected: The creation survives the closed tab, Resume brings it back as left, Import is refused while it is kept, and Cancel leaves the Notebook as before (Mark's List row check-creation-editor-ipad, status open, version 1).
result: pass
evidence: Mark's List check-creation-editor-ipad (done 2026-10-21, steps 1-6 passed, step 7 failed: notice scrolled off; fixed by quick 261021-07s, commit 61d2fe9c) and check-creation-editor-ipad-2 (done 2026-10-21, note "Pass": Import notice sticky beside Import, Resume and Cancel as expected)

## Summary

total: 1
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
