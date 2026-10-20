---
status: testing
phase: 10-the-creation-editor-without-save
source: [10-VERIFICATION.md]
started: 2026-10-20T16:55:50Z
updated: 2026-10-20T16:55:50Z
---

## Current Test

number: 1
name: A recipe started on the iPad comes back on Resume and leaves nothing after Cancel
expected: |
  On the iPad (Safari, landscape) from the production build, follow Mark's List row check-creation-editor-ipad: New recipe through a worked-on creation (rows, Philadelphia style, a scale, a problem), Import refused with a notice, close the tab, reopen /notebook, Resume brings everything back as left, Cancel says "Draft discarded." and the Notebook lists the same recipes as before.
awaiting: user response

## Tests

### 1. A recipe started on the iPad comes back on Resume and leaves nothing after Cancel
expected: The creation survives the closed tab, Resume brings it back as left, Import is refused while it is kept, and Cancel leaves the Notebook as before (Mark's List row check-creation-editor-ipad, status open, version 1).
result: [pending]

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
