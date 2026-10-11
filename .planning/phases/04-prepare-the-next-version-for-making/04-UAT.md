---
status: testing
phase: 04-prepare-the-next-version-for-making
source: [04-VERIFICATION.md]
started: 2026-10-11T11:26:19Z
updated: 2026-10-11T11:26:19Z
---

## Current Test

number: 1
name: Keyboard walk of the whole loop on desktop and the iPad
expected: |
  Every control reachable, focus always visible, labels visible; Tab past the last link hands focus to Safari's chrome (expected). Include the date fields' new ink ring. Mark's List row: check-keyboard-walk-loop.
awaiting: user response

## Tests

### 1. Keyboard walk of the whole loop on desktop and the iPad
expected: Safari 1366 landscape, tap then Tab, Full Keyboard Access OFF, built preview: review, Next version and save, record with a tasting and save, Correct, Print sheet then Print, a Sheet code on Search. Every control reachable, focus visible.
result: [pending]

### 2. VoiceOver on a balance rule
expected: The rule's name carries its deviation words after the target; the live region says "Contributing to {figure}: {row names}". Folded into check-keyboard-walk-loop.
result: [pending]

### 3. iPad Safari print of Olive Oil v1
expected: Five pages (Batch log, Tasting log, formula page, table tail with steps, rest with the closing foot); groups whole, header row repeated, Sheet code in every foot. Rows: check-ipad-pdf-bench-sheet-olive-oil, look-print-sheet-route-device, check-whole-loop-on-paper-after-phase-4.
result: [pending]

### 4. Closed-tab draft recovery and the 393 look on the device
expected: A pen reopens with its ink and "Draft kept. Cancel discards it."; Home and the band name the waiting draft; the 393 print route and Search stack as drawn. Rows: p4-draft-ipad-uat, p4-05-ipad-mark-one, look-sheet-code-search-ipad.
result: [pending]

### 5. Mark's List rows from plan 04-10 exist
expected: decide-three-pens-keep-drafts, look-aug-2-draw-temp-dropped, check-keyboard-walk-loop present and open; build-remove-draw-temp-data-element done.
result: pass (orchestrator read the list: all three open at version 1, the fourth done at version 2)

## Summary

total: 5
passed: 1
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
