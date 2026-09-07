---
status: testing
phase: 03-develop-the-next-version
source: [03-VERIFICATION.md]
started: 2026-09-07T20:01:13.243Z
updated: 2026-09-07T20:01:13.243Z
---

## Current Test

number: 1
name: Open the churned olive oil version, click 'Develop the next version', type 48 over the oil row's 40 g, watch the parent's 40 struck in ink beside the new value, type a version line, click 'Save as a new version', and confirm landing on the child's own URL reading clean.
expected: |
  The strike renders live, the six figures and basis note answer live against the typed grams, the save lands on a new URL, and the churned version and its 2 Aug batch are unchanged when reopened (REC1-02).
awaiting: user response

## Tests

### 1. Open the churned olive oil version, click 'Develop the next version', type 48 over the oil row's 40 g, watch the parent's 40 struck in ink beside the new value, type a version line, click 'Save as a new version', and confirm landing on the child's own URL reading clean.
expected: The strike renders live, the six figures and basis note answer live against the typed grams, the save lands on a new URL, and the churned version and its 2 Aug batch are unchanged when reopened (REC1-02).
result: [pending]

### 2. Reload the child version's URL in a fresh page load.
expected: The same twelve rows, grams, method text, and authored notes reappear (REC1-05).
result: [pending]

### 3. In the pen, remove a row and watch it render struck in place with the totals and six figures updating live; remove a method step that uses a still-active row and watch the row-side orphaned-row flag appear beside it; restore both and watch the flags clear.
expected: Struck rendering, live totals, and the two removal cross-flags behave exactly as described, with no cascade (REC1-03, D-10).
result: [pending]

### 4. Type a reason, tap a cited batch from the list, save, and read the child's lineage line ('from 50 g oil · 800 g, after the batch of 2 Aug 2026') with both parent and batch as live links; leave the reason blank and confirm it reads 'no reason recorded'.
expected: The ceremony behaves exactly as the brief and D-04 describe (REC1-04).
result: [pending]

### 5. Fork the same parent twice, then read the version strip's three entries (parent, child A, child B) in creation order, with the current version carried by weight and outline and the churned parent wearing 'churned'.
expected: Strip renders correctly per D-06/D-21 wording rules.
result: [pending]

### 6. On a saved child, press the show-changes toggle in the lineage line and confirm the URL gains '?changes', the marks appear (struck grams/share, hollow parent tick on the rules, struck-beneath method text), then press the browser's back button and confirm the clean reading returns; copy the URL with the parameter into a new tab.
expected: The addressable toggle behaves exactly as D-02 describes, with no new route (FORM2-01).
result: [pending]

### 7. Read the four derived advisories in the margin for the churned olive oil version (sub-scale, ultra-pasteurised, hydration, estimated-exposure), confirming the block's 'derived' legend sits parallel to the authored block's own legend, then remove rows in the pen and watch advisories appear/disappear live.
expected: Four advisories render with correct wording and basis lines, positioned between BatchMargin and Authored, and react live to pen edits (FORM2-02).
result: [pending]

### 8. Click the running head 'Sprinkles' from several page states (reading, developing, not-found) and confirm it always returns to the recipe list; visit a version id that does not exist and confirm 'No recipe found' links back to the list.
expected: Navigation behaves as described in every state.
result: [pending]

### 9. Confirm the plan's pen and the batch's pen cannot both be open: with the plan's pen open, the batch margin's 'Record a batch'/'Record another batch'/'Amend' controls are disabled with a stated reason in words; with the batch pen open, 'Develop the next version' is disabled.
expected: Mutual exclusivity holds and the reason is stated in words, never just visually implied (D-10).
result: [pending]

## Summary

total: 9
passed: 0
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps
