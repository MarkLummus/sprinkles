---
status: complete
phase: 03-develop-the-next-version
source: [03-VERIFICATION.md]
started: 2026-09-07T20:01:13.243Z
updated: 2026-09-07T21:27:21.274Z
---

## Current Test

[testing complete]

## Tests

### 1. Open the churned olive oil version, click 'Develop the next version', type 48 over the oil row's 40 g, watch the parent's 40 struck in ink beside the new value, type a version line, click 'Save as a new version', and confirm landing on the child's own URL reading clean.
expected: The strike renders live, the six figures and basis note answer live against the typed grams, the save lands on a new URL, and the churned version and its 2 Aug batch are unchanged when reopened (REC1-02).
result: issue
reported: "pass with these observations: - the visual display of the ingredient table is broken: at a normal browser width, the step selector control is overlapping the Grams, As Made, and % of Batch column values. - when viewing the version (not a batch), the \"As Made\" column is visible in the ingredient table - should it be?"
severity: major

### 2. Reload the child version's URL in a fresh page load.
expected: The same twelve rows, grams, method text, and authored notes reappear (REC1-05).
result: pass

### 3. In the pen, remove a row and watch it render struck in place with the totals and six figures updating live; remove a method step that uses a still-active row and watch the row-side orphaned-row flag appear beside it; restore both and watch the flags clear.
expected: Struck rendering, live totals, and the two removal cross-flags behave exactly as described, with no cascade (REC1-03, D-10).
result: issue
reported: "when I removed the Soy Lecithin row, I see a note under the step 1 and a \"remove this step\" button. The free form text edit boxes for the Lead-in and Instruction are still shown with the original text and there is a strike-thru version beneath them, which looks odd. when I removed step 1, neither ingredient row is flagged (there are 2 ingredients checked). when I removed step 2, the flags appeared (with a remove this row button) in the ingredient column, but the step selector for the row now shows Step 1 as selected, which is wrong."
severity: major

### 4. Type a reason, tap a cited batch from the list, save, and read the child's lineage line ('from 50 g oil · 800 g, after the batch of 2 Aug 2026') with both parent and batch as live links; leave the reason blank and confirm it reads 'no reason recorded'.
expected: The ceremony behaves exactly as the brief and D-04 describe (REC1-04).
result: pass

### 5. Fork the same parent twice, then read the version strip's three entries (parent, child A, child B) in creation order, with the current version carried by weight and outline and the churned parent wearing 'churned'.
expected: Strip renders correctly per D-06/D-21 wording rules.
result: pass

### 6. On a saved child, press the show-changes toggle in the lineage line and confirm the URL gains '?changes', the marks appear (struck grams/share, hollow parent tick on the rules, struck-beneath method text), then press the browser's back button and confirm the clean reading returns; copy the URL with the parameter into a new tab.
expected: The addressable toggle behaves exactly as D-02 describes, with no new route (FORM2-01).
result: issue
reported: "when a step is removed, the step numbers don't renumber automatically. otherwise pass."
severity: minor

### 7. Read the four derived advisories in the margin for the churned olive oil version (sub-scale, ultra-pasteurised, hydration, estimated-exposure), confirming the block's 'derived' legend sits parallel to the authored block's own legend, then remove rows in the pen and watch advisories appear/disappear live.
expected: Four advisories render with correct wording and basis lines, positioned between BatchMargin and Authored, and react live to pen edits (FORM2-02).
result: pass

### 8. Click the running head 'Sprinkles' from several page states (reading, developing, not-found) and confirm it always returns to the recipe list; visit a version id that does not exist and confirm 'No recipe found' links back to the list.
expected: Navigation behaves as described in every state.
result: pass
note: "User: \"No recipe found\" is not a link; the Sprinkles running head and the Back to the recipe list link both work. The not-found state links back via its own link, which is what 03-03 built."

### 9. Confirm the plan's pen and the batch's pen cannot both be open: with the plan's pen open, the batch margin's 'Record a batch'/'Record another batch'/'Amend' controls are disabled with a stated reason in words; with the batch pen open, 'Develop the next version' is disabled.
expected: Mutual exclusivity holds and the reason is stated in words, never just visually implied (D-10).
result: issue
reported: "when developing, the batch controls are disabled, but the add tasting controls are not disabled. Develop button is disabled when Amending or Batch Recording, but not when Adding a tasting. Amend and Batch recording buttons are also enabled while adding a tasting. I was able to select another version while amending."
severity: major

## Summary

total: 9
passed: 5
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-03-1
  truth: "The pen flow saves a child at its own URL with the churned version untouched, and the ingredient table renders legibly while developing: the step selector sits in its own cell and never overlaps the Grams, As Made or % of batch values; the As Made column is shown only when a batch is in view."
  status: failed
  reason: "User reported: pass with these observations: - the visual display of the ingredient table is broken: at a normal browser width, the step selector control is overlapping the Grams, As Made, and % of Batch column values. - when viewing the version (not a batch), the \"As Made\" column is visible in the ingredient table - should it be?"
  severity: major
  test: 1
  artifacts: []  # Filled by diagnosis
  missing: []    # Filled by diagnosis

- gap_id: G-03-3
  truth: "Removing a row flags every step that still uses it and leaves that step editable in one form (no duplicated struck copy beneath live fields); removing a step flags every still-active row it used, regardless of which step it is; a flagged row keeps its own step allocation and never shows a different step as selected."
  status: failed
  reason: "User reported: when I removed the Soy Lecithin row, I see a note under the step 1 and a \"remove this step\" button. The free form text edit boxes for the Lead-in and Instruction are still shown with the original text and there is a strike-thru version beneath them, which looks odd. when I removed step 1, neither ingredient row is flagged (there are 2 ingredients checked). when I removed step 2, the flags appeared (with a remove this row button) in the ingredient column, but the step selector for the row now shows Step 1 as selected, which is wrong."
  severity: major
  test: 3
  artifacts: []  # Filled by diagnosis
  missing: []    # Filled by diagnosis

- gap_id: G-03-6
  truth: "When a step is removed, the remaining active steps renumber in sequence in the reading state and in the pen; in show-changes the struck step reads in place without the live steps skipping a number."
  status: failed
  reason: "User reported: when a step is removed, the step numbers don't renumber automatically. otherwise pass."
  severity: minor
  test: 6
  artifacts: []  # Filled by diagnosis
  missing: []    # Filled by diagnosis

- gap_id: G-03-9
  truth: "Exactly one pen is open at a time: while developing, every batch-side control (record, record another, amend, add a tasting) is disabled with a stated reason; while recording, amending, or adding a tasting, Develop the next version and the other batch-side openers are disabled with a stated reason; while any pen is open, the version strip and batch list do not navigate away from the unsaved ink without the leave warning."
  status: failed
  reason: "User reported: when developing, the batch controls are disabled, but the add tasting controls are not disabled. Develop button is disabled when Amending or Batch Recording, but not when Adding a tasting. Amend and Batch recording buttons are also enabled while adding a tasting. I was able to select another version while amending."
  severity: major
  test: 9
  artifacts: []  # Filled by diagnosis
  missing: []    # Filled by diagnosis

## Deferred Follow-Ups

- test: 2
  idea: "the URL for the child version could be a slug based on the version name. \"Increase Oil to 48g\" becomes recipe/increase-oil-to-48g, which is nicer than recipe/3f3690ea-9f89-4a45-b908-cffbd13573c3"
  deferred_at: 2026-09-07
- test: 2
  idea: "there is no pure version view when the version has batches, only a specific batch; e.g. on the \"50 g oil · 800 g · churned\" version (recipe/olive-oil-ice-cream-v1), I see the churn values for the Aug 2 batch. we may want to consider a tree view of recipe versions at top level of outline/tree and batches for version below."
  deferred_at: 2026-09-07
