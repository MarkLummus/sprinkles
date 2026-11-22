---
status: testing
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
source: [12-VERIFICATION.md]
started: 2026-11-16T14:37:28Z
updated: 2026-11-22T23:14:54Z
---

## Current Test

number: 1
name: PROOF-02 and success criterion 3: creation checked on the iPad (round two, not yet planned)
expected: |
  Tab reaches every creation control, focus stays with the moved step or row, the recipe prints
awaiting: user response

## Tests

### 1. PROOF-02 and success criterion 3: creation checked on the iPad (round two, not yet planned)
expected: After Design gate 2's work is built, from the production build (npm --prefix app run build && npm --prefix app run preview -- --host), create a recipe end to end on the iPad with its scales, problems and targets, Tab through every creation control including each Move button, move a step and a row, then print. Tab reaches every creation control, focus stays with the moved step or row, the recipe prints.
result: [pending]

### 2. Clipboard paper check (Mark's List row adoajjb9sgzbezmyrt4s)
expected: Print the Batch log and the Tasting log from the iPad and put them on the clipboard. Every printed line is clear of the clip, and each log is one sheet.
result: [pending]

### 3. G11: focus after Save over this version rests on Next version (commit c5373fb2)
expected: In the first-version editor, Save over a version and see where focus rests. Mark confirms focus should rest on Next version, or asks for a fix by a new quick task.
result: [pending]

### 4. PROOF-02 row 1: the editor adds ingredients after the row you press and takes scales and targets (Mark's List check-p12-ipad-create-ingredients-scales; with tests 5 and 6 this is the built form of test 1)
expected: On the iPad (Safari, landscape, Magic Keyboard, Full Keyboard Access off), from the production build, the ten numbered steps of the row read as written. Each pick lands right after the row whose Add ingredient was pressed, or after the row whose grams held the caret; the caret is in the new row's grams; a Low to high scale's stops line reads its two end words joined by "to". Full steps: 12-ipad-rows.md, row 1.
result: [pending]

### 5. PROOF-02 row 2: Tab reaches every creation control, Move keeps its place, and the add and move keys work (Mark's List check-p12-ipad-steps-move-tab-keys)
expected: In the same recipe, the ten numbered steps of the row read as written. Tab reaches every creation control, each Move button included and a grey one too; after a Move, focus stays with the moved step or row; Cmd+Return and Ctrl+Cmd+Up and Down act with the caret kept in the same field. If the caret step fails, 12-13's written fallback goes to /gsd-quick. Full steps: 12-ipad-rows.md, row 2.
result: [pending]

### 6. PROOF-02 row 3: Save opens the recipe, the print page shows its scales, and the logs print clear of the clipboard (Mark's List check-p12-ipad-save-print-clipboard; steps 5 and 6 are the built form of test 2 and close Mark's List row adoajjb9sgzbezmyrt4s)
expected: The six numbered steps of the row read as written. "Recipe saved." on the new page; the Tasting log lists the recipe's two scales after the four core ones, the Low to high one with no numbers, and its problem under Any problems; every printed line is clear of the clip and each log is one sheet. Full steps: 12-ipad-rows.md, row 3.
result: [pending]

### 7. Decision: below 724 with a Next version draft kept, Home still offers Go to draft, Record batch and Record tasting on the version whose page refuses them (UI-REVIEW round two, finding 1; code review IN-02)
expected: Mark answers whether decision B (no record act on the version holding the kept draft) extends to Home below 724. If yes, Sid draws Home's lead and row for that state, then a /gsd-quick on RecipeList.jsx. On Mark's List as a decide row.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps
