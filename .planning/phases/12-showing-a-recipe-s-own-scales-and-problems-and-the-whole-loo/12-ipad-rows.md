# Phase 12 iPad check rows (12-14, D-13)

Three check rows for Mark's List, in D-13's order. The orchestrator writes them one at a time (it holds
ArtifactData; the executor does not), reading every timestamp from the clock just before each write, and
reads each back. Row text is data. Every numbered step below was walked in Playwright WebKit at 1366 with a
coarse pointer on the final build by `12-device-steps.mjs` before hand-over; a WebKit walk is not the iPad,
and nothing here is device-verified until Mark passes the rows. The recipe Mark makes is real and stays
(D-12), so no row names the recipe's words or figures.

Fields common to all three rows: kind `check`, owner `mark`, needs `hands`, status `open`, addedBy `claude`,
phase `12`, where `{ label: "Sprinkles on the iPad (Safari, landscape), served from the production build" }`.
Mark's List adoajjb9sgzbezmyrt4s (clipboard top margin on the printed logs, built in 12-02) closes when row 3's
paper step passes.

## Row 1

- id: check-p12-ipad-create-ingredients-scales
- kind: check
- owner: mark
- needs: hands
- status: open
- addedBy: claude
- phase: "12"
- title: The editor adds ingredients after the row you press and takes scales and targets
- where: { label: "Sprinkles on the iPad (Safari, landscape), served from the production build" }
- source: check-p12-ipad-steps-move-tab-keys and check-p12-ipad-save-print-clipboard (rows 2 and 3 of this check, to be done in order); PROOF-02; 12-CONTEXT D-11 to D-13
- detail:

```
On the Mac, in the repo, run `npm --prefix app run build && npm --prefix app run preview -- --host`, and open the address it prints with /notebook added in Safari on the iPad, in landscape.
The Magic Keyboard is attached. Full Keyboard Access stays off: tap a field first, then use Tab.
This is a recipe you keep. Rows 2 and 3 continue in the same recipe.
1. On the Notebook press New recipe, type the recipe's name and press Start. Expect: the editor opens with the name in Recipe name.
2. Press Add ingredient on the Ingredients heading, pick an ingredient and type its grams. Expect: right after the pick the caret is in the new row's grams.
3. In that row's grams press Cmd+Return, pick a second ingredient and type its grams. Expect: it stands right after the first row, the caret in its grams.
4. Press Add ingredient on the first row, pick a third ingredient and type its grams. Expect: it lands right after the first row.
5. Tap the last row's grams and press Tab once. Expect: that row's Add ingredient is outlined (there is no step yet, so the row has no Add to step).
6. Under Style choose a style. Expect: the target bands fill in. Change one band end.
7. Type a serving temperature.
8. Press Add scale, type its name (16 characters at most) and both ends (12 characters at most), and choose Right in the middle. Expect: its stops line reads five words.
9. Press Add scale again, type its name and both ends, and choose Low to high. Expect: its stops line reads its two end words joined by "to".
10. Press Add problem and type it (40 characters at most).
Pass: every step reads as written. On a fail, say which step and what you saw.
```

## Row 2

- id: check-p12-ipad-steps-move-tab-keys
- kind: check
- owner: mark
- needs: hands
- status: open
- addedBy: claude
- phase: "12"
- title: Tab reaches every creation control, Move keeps its place, and the add and move keys work
- where: { label: "Sprinkles on the iPad (Safari, landscape), served from the production build" }
- source: check-p12-ipad-create-ingredients-scales and check-p12-ipad-save-print-clipboard (rows 1 and 3 of this check, to be done in order); PROOF-02; 12-CONTEXT D-11 to D-13
- detail:

```
Continue in the same recipe, before Save. The Magic Keyboard is attached and Full Keyboard Access stays off: tap a field first, then use Tab.
1. Press Add step on the Instructions heading and type a lead-in and an instruction.
2. In that instruction press Cmd+Return. Expect: a second step stands after it, the caret in its lead-in, and the first instruction gained no new line. Type the new step's lead-in and instruction.
3. In each step press Change ingredients, tick the rows that step uses (two in step 1, the third in step 2) and press Done. Expect: the rows stand under their steps and no grams field is empty.
4. In step 1 press Add target and type both sides, then Add purpose and Add aside, and type each.
5. Tap step 1's instruction and press Tab. Expect: Preview step is outlined at the 8th Tab, Add step at the 9th and Remove at the 12th.
6. Tap Recipe name and press Tab through the whole page: past Save, down through Ingredients and Instructions, and through Setup to the last control under Problems. Expect: every control is outlined in turn, each Move button included, a grey one too; none is skipped.
7. In step 2's lead-in press Ctrl+Cmd+Up, then Ctrl+Cmd+Down. Expect: it becomes step 1, then step 2 again, the caret where it was each time. Press Ctrl+Cmd+Down once more. Expect: nothing moves, because it is the last step.
8. Tap step 1's instruction, press Tab 11 times to its Move down and press Return. Expect: the steps swap and the outline stands on the moved step's Move up, because its Move down is now grey. Press Return again. Expect: they swap back and the outline moves to its Move down.
9. By touch press Move down on step 1, then Move up on the step that moved. Expect: the steps swap, then swap back.
10. In the grams of step 1's second row press Ctrl+Cmd+Up. Expect: it becomes step 1's first row, the caret still in its grams. Press Tab 3 times to its Move down and press Return. Expect: it moves back down and the outline moves to its Move up, because its Move down is now grey.
Pass: every step reads as written. On a fail, say which step and what you saw.
```

## Row 3

- id: check-p12-ipad-save-print-clipboard
- kind: check
- owner: mark
- needs: hands
- status: open
- addedBy: claude
- phase: "12"
- title: Save opens the recipe, the print page shows its scales, and the logs print clear of the clipboard
- where: { label: "Sprinkles on the iPad (Safari, landscape), served from the production build" }
- source: check-p12-ipad-create-ingredients-scales and check-p12-ipad-steps-move-tab-keys (rows 1 and 2 of this check, to be done in order); PROOF-02; 12-CONTEXT D-11 to D-13; Mark's List adoajjb9sgzbezmyrt4s (closes when step 5 and step 6 pass)
- detail:

```
Continue with the recipe from rows 1 and 2, every field filled and not yet saved. Have paper and the clipboard to hand.
1. Tap step 1's instruction, press Tab 8 times to Preview step and press Return. Expect: the preview under it reads the step with its target, purpose and aside. Press Return again to hide it.
2. Press Save in the band at the top of the editor. Expect: the recipe's page opens with "Recipe saved."
3. Under the version press Print sheet, then save it as a PDF: Share, Print, pinch out the preview, save it to Files. Expect: the Sheet code at the foot of the last Sheet page.
4. On the print page find the Batch log and the Tasting log. Expect: the Tasting log lists the recipe's two scales after the four core ones, the Low to high scale with its two end words and no numbers, and the recipe's problem last under Any problems.
5. Press Print, choose pages 1 to 2 (the Batch log and the Tasting log) and print them to paper.
6. Put both sheets on the clipboard. Expect: every printed line is clear of the clip, and each log is one sheet.
Pass: every step reads as written. On a fail, say which step and what you saw.
```
