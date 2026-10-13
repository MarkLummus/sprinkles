---
status: testing
phase: 04-prepare-the-next-version-for-making
source: [04-VERIFICATION.md]
started: 2026-10-11T11:26:19Z
updated: 2026-10-11T11:26:19Z
---

The pending device checks are tracked on Mark's List (https://claude.ai/artifact/BUn1EoVgfbMQ5dApdtBsBC); results are recorded here once they pass.

## Current Test

number: 4
name: Closed-tab draft recovery and the 393 look on the device
expected: |
  A pen reopens with its ink and "Draft kept. Cancel discards it."; Home and the band name the waiting draft; the 393 print route and Search stack as drawn. Rows: p4-draft-ipad-uat, p4-05-ipad-mark-one, look-sheet-code-search-ipad.
awaiting: user response

## Tests

### 1. Keyboard walk of the whole loop on desktop and the iPad
expected: Safari 1366 landscape, tap then Tab, Full Keyboard Access OFF, built preview: review, Next version and save, record with a tasting and save, Correct, Print sheet then Print, a Sheet code on Search. Every control reachable, focus visible.
result: pass (Mark, iPad, 2026-10-12: every stop shows a ring; the recipe-name links and Enter Sheet code had square rings, fixed in fca5b26; the churn date field shows its ring. Mark's List row check-keyboard-walk-loop closed.)

### 2. VoiceOver on a balance rule
expected: The rule's name carries its deviation words after the target; the live region says "Contributing to {figure}: {row names}". Folded into check-keyboard-walk-loop.
result: pass (Mark, iPad VoiceOver, 2026-10-12)

### 3. iPad Safari print of Olive Oil v1
expected: Five pages (Batch log, Tasting log, formula page, table tail with steps, rest with the closing foot); groups whole, header row repeated, Sheet code in every foot. Rows: check-ipad-pdf-bench-sheet-olive-oil, look-print-sheet-route-device, check-whole-loop-on-paper-after-phase-4.
result: pass (Mark, iPad, 2026-10-13, walked one step at a time in chat: Next version and save, Print sheet then Print on paper with five pages, groups whole, header row repeated and Sheet code in every foot, record a batch with a tasting, reload mid-edit kept the draft with "Draft kept. Cancel discards it.", Save batch, Sheet code Find landed on the version. Mark's List row check-whole-loop-on-paper-after-phase-4 closed.)

### 4. Closed-tab draft recovery and the 393 look on the device
expected: A pen reopens with its ink and "Draft kept. Cancel discards it."; Home and the band name the waiting draft; the 393 print route and Search stack as drawn. Rows: p4-draft-ipad-uat, p4-05-ipad-mark-one, look-sheet-code-search-ipad.
result: [pending]

### 5. Mark's List rows from plan 04-10 exist
expected: decide-three-pens-keep-drafts, look-aug-2-draw-temp-dropped, check-keyboard-walk-loop present and open; build-remove-draw-temp-data-element done.
result: pass (orchestrator read the list: all three open at version 1, the fourth done at version 2)

## Summary

total: 5
passed: 4
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
