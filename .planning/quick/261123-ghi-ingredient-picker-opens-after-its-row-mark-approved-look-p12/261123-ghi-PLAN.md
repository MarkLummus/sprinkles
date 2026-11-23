---
phase: quick-261123-ghi
plan: 01
type: execute
wave: 3
depends_on: ["261123-ghh"]
files_modified:
  - app/src/ui/CreationFlow.test.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientPicker.jsx
  - app/src/ui/IngredientPicker.test.jsx
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-keys.mjs
  - .planning/quick/261123-ghi-ingredient-picker-opens-after-its-row-mark-approved-look-p12/261123-ghi-SUMMARY.md
autonomous: true
requirements: [look-p12-picker-after-row]

must_haves:
  truths:
    - "At 1366 in the creation editor (New recipe and the first version's Edit, one component), a row's Add ingredient, or Cmd+Return or Ctrl+Return in its grams, opens the picker as tr.ingredient-table__pick > td[colspan=3] > div.pick directly after that row's line, inside that line's tbody; the rows after it move down; nothing stands under the Total"
    - "The heading's Add ingredient opens it before tfoot: as the last row of the last tbody when that tbody is 'Not in a step yet' or the recipe has no step; when every row is in a step, in a tbody of its own holding a 'Not in a step yet' head row and then the picker row, both present only while the picker is open; with no row at all it stands where it is built"
    - "div.pick is the built picker word for word, with no line added; its aria-label is 'Add ingredient after <row>, in step <n>', 'Add ingredient after <row>, not in a step yet' or 'Add ingredient at the end, not in a step yet' (no step words when the recipe has no step; 'Add ingredient' with no row)"
    - "Another row's Add ingredient while the picker is open moves the picker to stand after that row, one picker at a time, keeping Name's text and the chosen Category, with focus in Name; Cancel removes the picker's row and returns focus to what opened it (b8b928c1 still holds); a pick lands exactly where the picker stood, focus in the new row's grams"
    - "Opening or moving the picker scrolls the page only as far as the picker needs and never moves the row directly above it under the sticky header"
    - "The picker never takes focus by itself: when it moves because its row left its group (unticked, Add to step, removed, step removed) focus stays where the maker is working"
    - "The version pen, the reading page, the record pen, Show changes and print draw no picker row: only the creation editor passes a picker to the table"
    - "The full suite passes (137 files and 4596 tests before this plan, plus the new cases), including IngredientTable.creating.test.jsx (fd95ddcc) and the Cancel cases in CreationFlow.test.jsx (b8b928c1); 12-check.sh ends GATE2 PASS with the picker held against picker-after-row.html; the side by side in WebKit and Chrome is in the SUMMARY, named device-unverified"
  artifacts:
    - path: app/src/ui/IngredientTable.jsx
      provides: "The picker's row: after the line creationRows.picker names, or at the end of the table, in a 'Not in a step yet' body of its own when the last body is a step's"
    - path: app/src/ui/CreationPage.jsx
      provides: "picking with its filters; the picker's place and accessible name; focus to Name on open and move with the scroll rule"
    - path: app/src/ui/IngredientPicker.jsx
      provides: "The built picker, controlled (filters, onChangeFilters), named by its label, taking no focus on mount"
    - path: app/src/styles/notebook.css
      provides: "The picker row's two board rules, scoped under .notebook, and the fields' built start alignment"
    - path: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs
      provides: "A second spec holding the editor against picker-after-row.html (pa-step, pa-other, pa-cancel, pa-picked, pa-heading, pa-allplaced)"
  key_links:
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/IngredientTable.jsx
      via: "creationRows.picker = { line, element }: the line key the picker stands after, null for the end"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/IngredientPicker.jsx
      via: "label (the place), filters and onChangeFilters, held in picking so a picker drawn anew keeps them"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/domain/creationSteps.js
      via: "anchorHolds (groupRows, liveSteps): the same rule decides where the picker stands and where handlePick lands"
    - from: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs
      to: .planning/sketches/016-entry-points-pen-preview-row-controls/picker-after-row.html
      via: "panels pa-step, pa-other, pa-cancel, pa-picked, pa-heading, pa-allplaced"
---

<objective>
Build the approved picker place (Mark's answer on Mark's List row look-p12-picker-after-row: approved, 2026-11-23). Authority: sketch 016 CONTRACT.md section 13, the part headed "The picker stands after its row"; the snapshot picker-after-row.html in .planning/sketches/016-entry-points-pen-preview-row-controls/, its markup and its CSS; README decisions 35 to 41. At 1366, in the creation editor only:

1. The picker is a row of the ingredient table directly after the row that opened it (the row's Add ingredient, or Cmd+Return or Ctrl+Return in its grams), inside that row's body. From the heading's Add ingredient it stands at the end, before the Total; when every row is in a step it stands in a body of its own under a "Not in a step yet" head row.
2. The picker is the built one word for word. Its accessible name names the place: "Add ingredient after <row>, in step <n>", "Add ingredient after <row>, not in a step yet", "Add ingredient at the end, not in a step yet". These are the contract's words, said to a screen reader only; no word is added on screen, and round two's line under the picker's heading is not built (CONTRACT section 12: not approved).
3. Another row's Add ingredient while it is open moves the picker after that row, keeping Name's text and the Category, focus in Name. Cancel removes the row and returns focus to the opener. A pick lands where the picker stood. All three are as built apart from the place.
4. The opener row stays in view: the page scrolls only as far as the picker needs.

Structure note (the designer's point for the plan): the picker's place in the markup changes, so React draws it anew when it moves into another body. Name's text and the Category are therefore held in CreationPage's picking state, above the picker's place, and the picker takes no focus by itself; CreationPage puts focus in Name when it opens or moves the picker.

Where else the picker or the table is drawn (checked at planning time): IngredientPicker is imported only by CreationPage.jsx. CreationPage serves /notebook/new and a first version's Edit address (mode 'edit'), both behind DeskOnly, so both get this change and below 724 neither shows the editor. The version pen (RecipePage, mode 'developing'), the reading page, the record pen and Show changes render IngredientTable through RecipeSheet with creationRows null: no picker and no row Add ingredient, so nothing changes there. Print uses groupPortionsByStep, not the table.

States the snapshot does not draw, or where the snapshot and the contract disagree, and what this plan builds in each (each from a built or stated precedent; the SUMMARY lists them for the orchestrator):
- A recipe with no step: the table is one body with no head. From a row the picker follows it, named "Add ingredient after <row>"; from the heading it is that body's last row, named "Add ingredient at the end". Precedent: README "Not settled" (round two) states the no-step words as "After Fine sea salt" or "At the end", and handleMoveRow's spoken place leaves the step words out when there is no step.
- An empty table: the built place, after "This version has no ingredient rows.", named "Add ingredient" as built (decision 36: "An empty table: where it is built").
- The opener's row leaves its group while the picker is open (unticked, Add to step, removed, its step removed): the picker stands at the end, named as from the heading, because handlePick then lands the pick there (as built), so the picker stands where the pick will land. Focus stays where the maker is.
- The scroll rule from the heading and with an empty table: the same rule as from a row, the row or line directly above the picker taking the opener row's place.
- The move is announced by no new words: focus goes to Name inside the group whose name now names the place.
- After a move the list's own scroll starts at its top, and the caret is where the engine puts it on focus (measured and recorded in Task 3).
- A window shorter than the row, the gap and the picker (596 px drawn, under the 57 px sticky header): the row stops at the top and the picker's foot runs below the window, because the row never leaves the top.
- Board against prose, text-align: on the drawn board the table's grams rule `.ingredient-table .ink-field { text-align: right }` reaches the picker's Name and Category (measured in WebKit and Chrome: computed right, against start as built), and the drawn Category's "All" stands against its chevron. The contract says the picker is the built one, so the build keeps the built start alignment with one scoped rule, and the SUMMARY names the difference.
- Board against build, line height: inside the table the picker inherits the cell's line height (18 px), making it 507 high in WebKit against 508 as built (507 in Chrome both ways). That is the board's own drawing and Sid's figure ("507 high"), so it is kept.

If the executor finds the snapshot and the contract disagree anywhere else, or meets a state not listed here, it stops that point and reports it; it does not invent a design.

Purpose: the maker adding an ingredient after a row sees the picker where the row is, without losing the row off the top of the window.
Output: the picker's place in the table, its name, its kept filters and focus rule, its scroll rule, two board CSS rules and one alignment rule, tests, the phase 12 gate held against the approved board, and the SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/IngredientPicker.jsx

Read these ranges only:
- .planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md lines 117-119 (section 11, numbers 7 to 9) and 144-165 (section 13)
- .planning/sketches/016-entry-points-pen-preview-row-controls/README.md lines 228-241 (decisions 35 to 41) and 263-270 (not settled)
- .planning/sketches/016-entry-points-pen-preview-row-controls/picker-after-row.html lines 13154-13155 (the board's two picker-row rules). Each panel is one long line, 13170 to 13176, with data-pid pa-built, pa-step, pa-other, pa-cancel, pa-picked, pa-heading, pa-allplaced. Read panel markup with a short script (node, or python3 -I) that prints the table part of a line with the picker's list collapsed, never with Read.
- app/src/ui/CreationPage.jsx lines 53-72 (anchorHolds, openerLine), 225-230 (picking), 320-392 (the focus effect), 429-473 (handlePick, handleAddRowAfter, handleCancelPicker, rowName), 608-615 and 840-891 (the RecipeSheet props)
- app/src/ui/IngredientTable.jsx lines 553-615 (props and the creationRows comment), 706-777 (modes, columnCount, groups, showStepHeads), 834-918 (renderCreatingEntry), 1125-1175 (the bodies)
- app/src/ui/RecipeSheet.jsx lines 141-193 (the Ingredients region: the table only while there are rows, then ingredientsFoot)
- app/src/ui/IngredientPicker.test.jsx lines 19-70 and 127-152
- app/src/ui/CreationFlow.test.jsx lines 102-220 (the harness and helpers), 1061-1113 and 2702-2974 (the D-09 describe this plan extends)
- app/src/styles/notebook.css lines 388-403 (.mk-focus, .notebook .pick); app/src/styles/app.css lines 885-889 (the grams alignment) and 3000-3041 (the desk table rows)
- app/src/styles/notebook.test.js lines 1-53
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs (all), 12-board-keys.mjs lines 1-60 and 95-180, 12-board-check.mjs lines 52-110
- .planning/quick/261123-brl-desk-line-closing-words-in-a-wider-windo/261123-brl-SUMMARY.md lines 83-130 (how the gate was pointed at a decided board, the Chrome shim, the side-by-side table)

Facts checked at planning time (HEAD fa19967d):
- Baseline suite: 137 files, 4596 tests. 12-check.sh ends GATE2 PASS today.
- The snapshot's drawn picker row, measured with a scratch script over the snapshot in Playwright WebKit and Chrome: tr display block, padding 0 0 12 px, a 1 px bottom rule mid-table and none as the last row of the last body (the app's own `tbody:last-of-type tr:last-child` rule); td block, no padding, no border, line-height 18 px; div.pick 528 x 507 in both engines (as built 528 x 508 in WebKit, 507 in Chrome). Name and Category compute text-align right on the drawn panels and start on the as-built panel.
- The picker's list has max-height calc(var(--touch-min) * 6) (notebook.css line 471), so the board's 11 rows and the app's whole library both fill it, and the rows below the picker stand at the same place on both sides.
- html carries scroll-padding-top var(--app-size-header-h) from 724 (shell.css line 70), the sticky header's height (57); jsdom computes no value for it.
- The gate holds the picker in its superseded place twice: 12-board-rowcontrols.mjs (entry for panel ai-pick, `rowcontrols-ai-pick-ing`) and 12-board-keys.mjs (`keys-ai-pick-ing`), both against row-controls.html, whose ai-pick panel draws it under the Total. Their tr[data-line] and .pick__head boxes fail once the picker stands after its row. 12-check.sh already runs both spec files, and 12-board-check.mjs accepts a default export that is an array of specs (12-board-band.mjs since 261123-brl). 12-check.sh itself needs no change.
- Other gate scripts open the picker only from the heading and pick at once (11-walk.mjs, 12-roundtrip.mjs, 12-board-band.mjs, 12-board-penpreview.mjs, 12-phone-probe.mjs, 12-band-probe.mjs); 12-keys-probe.mjs reads only whether the picker is open, how many there are and whether Name holds focus. None reads the picker's place.
- One test pins the old rule that the picker stays where it is built while another row's Add ingredient is pressed: CreationFlow.test.jsx line 2807 (the same element before and after). CONTRACT section 13 supersedes section 11 number 9b's "the picker stays open" only in its place; the rest of 9b holds.
- CreationFlow.test.jsx, CreationStructure.test.jsx, EditFlow.test.jsx, CreationPage.twoTabs.test.jsx and Shell.creationGuard.test.jsx mock Element.prototype.scrollIntoView; jsdom's window.scrollBy logs "not implemented" if it is called, and every rect is 0 there.
- The test library (app/src/data/library.js) holds Sucrose and Dextrose in category 'sugar', Whole milk and Heavy cream in 'dairy', Fine sea salt in 'other'.
- Sibling overlap: 261123-ghh edits the notebook stylesheet (the pen's target chip), so this plan depends on it and runs after it; 261123-ghg edits app.css, which this plan does not touch.
- estimate-calibration not run: quick-batch items carry no estimate block.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: From a row, the picker opens as the next row of the table, named by its place, and a pick lands where it stood</name>
  <files>app/src/ui/CreationFlow.test.jsx, app/src/ui/CreationPage.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/IngredientPicker.jsx</files>
  <behavior>
    All cases are in CreationFlow.test.jsx's describe "Add ingredient on a row lands the pick right after it (STRUCT-05, D-09, CONTRACT section 5 and 11 number 9)", over its seed (Sucrose and Whole milk in Step 1; Heavy cream and Fine sea salt under Not in a step yet). Add helpers there: rowOf(name), the first tr whose aria-label starts with `${name},`; pickRow(), the one tr.ingredient-table__pick.
    - R1 (extends the step-row case, line 2752): after Sucrose's Add ingredient, rowOf(SUGAR).nextElementSibling is pickRow(); pickRow() is inside Step 1's tbody, has one child, a td with colSpan 3, whose one child is div.pick; pickRow().nextElementSibling is rowOf(MILK); the page holds one .pick and `.ingredient-table-region > .pick` is null; div.pick's aria-label is 'Add ingredient after Sucrose, in step 1'; div.pick's children are exactly .pick__head, form.ing__filters, .ing__status and ul.pick__list; focus is in Name. The pick then lands as the case already asserts.
    - R2 (extends the unplaced case, line 2778): after Heavy cream's Add ingredient the picker row follows Heavy cream's row and precedes Fine sea salt's, in the 'Not in a step yet' tbody; aria-label 'Add ingredient after Heavy cream, 36% fat, not in a step yet'.
    - R3 (new, a split line, fd95ddcc's case): after seed(), add a second step with 'Step 1, Add step after it' and tick Sucrose in step 2's Uses. Sucrose's step-2 line's Add ingredient (aria-label 'Add ingredient after Sucrose in step 2') opens the picker after that line, inside Step 2's tbody, named 'Add ingredient after Sucrose, in step 2'. Picking Dextrose lands it right after Sucrose in Step 2.
    - R4 (new, no step): startVanilla, then Sucrose and Whole milk from the heading. Sucrose's Add ingredient opens the picker after Sucrose's row and before Whole milk's, in the only tbody, which has no step head; aria-label 'Add ingredient after Sucrose'. Picking Dextrose gives Sucrose, Dextrose, Whole milk.
    - R5 (rewrites the move case, line 2799): drop its assertion that the .pick element is the same one before and after (the superseded "stays where it is built"). After Heavy cream's Add ingredient is pressed with the picker open after Sucrose: one .pick on the page; rowOf(CREAM).nextElementSibling is pickRow(); rowOf(SUGAR).nextElementSibling is rowOf(MILK); aria-label 'Add ingredient after Heavy cream, 36% fat, not in a step yet'; focus in Name; the pick lands as the case already asserts.
    - R6 (extends the Cancel case, line 2816): after Cancel no tr.ingredient-table__pick remains and groups() equals the seed's.
    - R7 (extends the Cmd+Return case, line 2922): right after the key, rowOf(CREAM).nextElementSibling is pickRow().
    - Red before the change: R1 to R5 and R7 fail on the picker's place or name; R6 passes as a bound.
  </behavior>
  <action>
RED. Write R1 to R7 as the behavior block says, in CreationFlow.test.jsx only. Run the file and record which cases fail. Commit only that file, by explicit path: `test: the ingredient picker opens as the row after the one that opened it`.

GREEN, in three files (sketch 016 CONTRACT section 13; README decisions 35 to 39).
- app/src/ui/IngredientPicker.jsx: add a `label` prop and give div.pick `aria-label={label}` in place of the fixed name. Change nothing else in this task. In the head comment, say in one sentence that the page names the group by where the picker stands.
- app/src/ui/CreationPage.jsx:
  - After addedIds (line 611), compute the picker's place from the anchor: when picking is open and anchorHolds(createDraft, picking.afterRowId, picking.group), the line is `${picking.afterRowId}:${picking.group}`; otherwise there is no line. This is the rule handlePick lands by, so the picker stands where the pick will land.
  - Compute the picker's name. With a line: 'Add ingredient after ' + rowName(picking.afterRowId), then ', in step ' + displayNumbers(createDraft.method).get(picking.group) for a step's line, or ', not in a step yet' for an UNPLACED_STEP line while liveSteps(createDraft) holds a step, or nothing when the recipe has no step. Without a line: 'Add ingredient', the built name (Task 2 adds the end's words).
  - Build the IngredientPicker element once, when picking is open, with the label and its existing props. Pass it in creationRows as `picker: { line, element }` when there is a line, else picker null. Pass it as ingredientsFoot only when there is no line, so the heading's picker and a picker whose row left its group stay in the built place until Task 2.
  - Rewrite the picking comment (lines 225-229) in plain sentences: the picker stands after the line it names, or in its built place.
- app/src/ui/IngredientTable.jsx:
  - Add `picker` to the creationRows comment (lines 590-595): { line, element } or null, the line key the picker stands after and the picker to draw there (sketch 016 CONTRACT section 13).
  - In the bodies (line 1170), and only when isCreating, draw the picker's row right after the entry whose `${row.id}:${portion.step}` equals picker.line: a tr with key "pick" and className "ingredient-table__pick", holding one td with colSpan={columnCount} that holds picker.element. Every other mode, and creating with picker null, draws exactly what it draws today.
  - The row's CSS is Task 3's, together with its board check, so in a browser the row reads unstyled until then; jsdom tests see no CSS.
Run the verify command green. Commit the three files by explicit path: `feat: the ingredient picker opens as the row after the one that opened it`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/CreationFlow.test.jsx src/ui/IngredientTable.creating.test.jsx src/ui/IngredientTable.test.jsx src/ui/IngredientPicker.test.jsx src/ui/CreationStructure.test.jsx src/ui/EditFlow.test.jsx src/ui/CreationPage.twoTabs.test.jsx src/ui/RecipeSheet.test.jsx</automated>
    <automated>grep -c 'ingredient-table__pick' app/src/ui/IngredientTable.jsx # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>grep -c 'aria-label={label}' app/src/ui/IngredientPicker.jsx # [HEAD=0 EXPECT==1 @fa19967d]</automated>
  </verify>
  <done>R1 to R5 and R7 failed before the change and pass after it; R6 holds. Opened from a row, a split row's line, a key in a row's grams, or another row while open, the picker is the row right after that line, named by its place, and the pick lands there. The heading's picker is still in the built place. Two commits, red then green, staged by explicit path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The moved picker keeps Name and Category and takes no focus by itself; from the heading it stands at the end; the opener row stays in view</name>
  <files>app/src/ui/IngredientPicker.test.jsx, app/src/ui/CreationFlow.test.jsx, app/src/ui/IngredientPicker.jsx, app/src/ui/CreationPage.jsx, app/src/ui/IngredientTable.jsx</files>
  <behavior>
    IngredientPicker.test.jsx (its mount renders a small harness holding the filters in state, starting from NO_FILTERS, passing filters and an onChangeFilters spy that also sets the state, with label 'Add ingredient' among the default props; every existing case keeps its assertions):
    - P1: mounting the picker moves no focus: document.activeElement is document.body. This replaces "opening the picker focuses Name".
    - P2: div.pick's aria-label is the label given ('Add ingredient after Sucrose, in step 1').
    - P3: typing 'milk' calls onChangeFilters with { query: 'milk', category: 'All' }; then choosing 'dairy' calls it with { query: 'milk', category: 'dairy' }. Clear filters calls it with NO_FILTERS and focuses Name (the existing case).
    CreationFlow.test.jsx, in the same describe:
    - E1 (the heading, rows under Not in a step yet; extends line 2789): the picker row is the last row of the last tbody (the 'Not in a step yet' one) and that tbody is followed by tfoot; aria-label 'Add ingredient at the end, not in a step yet'; focus in Name; the pick lands as the case asserts.
    - E2 (the heading, every row in a step): after seed(), place Heavy cream and Fine sea salt into Step 1 with Add to step. The heading's Add ingredient adds a tbody of its own after Step 1's, holding a tr.ingredient-table__step-head reading 'Not in a step yet' and then the picker row; aria-label 'Add ingredient at the end, not in a step yet'. Cancel removes both, so no 'Not in a step yet' head remains. Opening again and picking Dextrose makes 'Not in a step yet' the table's last group holding Dextrose alone, focus in its grams.
    - E3 (the heading, no step): startVanilla, Sucrose and Whole milk from the heading, then the heading's Add ingredient: the picker row is the only tbody's last row, no step head; aria-label 'Add ingredient at the end'.
    - E4 (an empty table; a bound): the picker is `.ingredient-table-region > .pick`, aria-label 'Add ingredient' (line 1100 holds this).
    - E5 (the move keeps Name and Category): with the picker open after Sucrose, type 'dex' into Name and choose 'sugar'. Pressing Heavy cream's Add ingredient leaves Name 'dex', the Category 'sugar' and Dextrose in the list, focus in Name, the picker after Heavy cream. Cancel, then Heavy cream's Add ingredient again: Name '' and the Category 'All'.
    - E6 (no focus taken): with the picker open after Sucrose, open Step 1's Change ingredients, focus Sucrose's Uses box and click it. The picker now stands as the last row of the 'Not in a step yet' tbody, named 'Add ingredient at the end, not in a step yet', and document.activeElement is still that Uses box.
    - E7 (the scroll rule; stubs restored inside the case): stub Element.prototype.getBoundingClientRect so the picker row and the row before it return the rects below and every other element zeros; set window.innerHeight to 1024; replace window.scrollBy with a spy. Then open the picker from Sucrose's row.
      (a) the row before it at top 811, the picker row's bottom at 1427: scrollBy(0, 403).
      (b) the row at top 200, the picker's bottom at 1500: scrollBy(0, 200), stopping with the row at the top.
      (c) the picker's bottom at 1000: scrollBy is not called.
      (d) the row at top -20, the picker's bottom at 600: scrollBy(0, -20).
      (e) the same rule on a move: with the picker open, Heavy cream's Add ingredient under (a)'s rects gives scrollBy(0, 403).
    - Red before the change: P1, P2, P3, E1, E2, E3, E5, E6 and E7 fail. E4 passes as a bound.
  </behavior>
  <action>
RED. Write P1 to P3 in IngredientPicker.test.jsx and E1 to E7 in CreationFlow.test.jsx, as the behavior block says. Run both files and record which cases fail. Commit only those two files, by explicit path: `test: the picker keeps its filters when it moves, stands at the end from the heading, and keeps its opener row in view`.

GREEN, in three files (sketch 016 CONTRACT section 13; README decisions 36, 38 and 41).
- app/src/ui/IngredientPicker.jsx:
  - Export NO_FILTERS, { query: '', category: ALL }.
  - Replace the two state hooks with the props `filters` and `onChangeFilters`. Name's change calls onChangeFilters({ ...filters, query: stripNewlines(value) }); the select's change calls onChangeFilters({ ...filters, category: value }); Clear filters calls onChangeFilters(NO_FILTERS), then focuses Name as built. `shown` and `filtered` read filters.query and filters.category.
  - Remove the mount effect that focuses Name, with its comment, and the imports that leave unused. RecipePage.shell.test.js checks for unused imports.
  - Head comment, in plain sentences: the page holds the filters, so a picker drawn anew in another row keeps them; the page, not the picker, puts focus in Name when it opens or moves the picker.
- app/src/ui/CreationPage.jsx:
  - picking gains `filters`. The heading's Add ingredient calls a handler that opens with { afterRowId: null, group: null, opener: 'heading', filters: NO_FILTERS } and leaves the focus request 'picker-place'.
  - handleAddRowAfter sets picking with a functional update that keeps prev's filters, else NO_FILTERS, and always leaves the request 'picker-place'. This replaces the request it left before only when the picker was open, and the branch that read it (line 381) becomes the 'picker-place' branch below.
  - The picker element takes filters={picking.filters} and an onChangeFilters that writes them into picking when it is open.
  - Place: while picking is open and view.hasRows, pass creationRows.picker as { line, element } with the line from Task 1, or line null when the anchor does not hold. With no row, pass the element as ingredientsFoot, its built place. Otherwise both are null.
  - Name without a line and with rows: 'Add ingredient at the end', then ', not in a step yet' while liveSteps(createDraft) holds a step. With no row: 'Add ingredient'.
  - The 'picker-place' branch of the focus effect:
    - Find Name, `.ingredient-table-region .pick .ing__filters textarea`, and focus it with { preventScroll: true }.
    - The place is Name's closest tr.ingredient-table__pick, else its closest .pick. The element above it is the place's previousElementSibling: the opener row, the last row, the 'Not in a step yet' head row, or the line above the built place.
    - The top is parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop), or 0 when that reads no number; it is the sticky header's height from 724.
    - by = Math.min(Math.max(0, place bottom - window.innerHeight), above's top - top). When by is not 0, call window.scrollBy(0, by).
    - Comment it in plain sentences: the page scrolls only as far as the picker needs and never moves the row above it out of the top (CONTRACT section 13; README decision 41).
- app/src/ui/IngredientTable.jsx: when isCreating and picker.line is null, draw the picker's row as the last row of the last tbody when that group is the unallocated one; otherwise, as one more tbody after the groups, with key "pick", holding a tr.ingredient-table__step-head whose one td (colSpan={columnCount}) reads 'Not in a step yet', and then the picker's row. The comment cites CONTRACT section 13 and says the head is present only while the picker is open, because that is the group the new row starts.
Run the verify commands green. Commit the three files by explicit path: `feat: the picker keeps its filters when it moves, stands at the end from the heading, and keeps its opener row in view`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/IngredientPicker.test.jsx src/ui/CreationFlow.test.jsx src/ui/IngredientTable.creating.test.jsx src/ui/IngredientTable.test.jsx src/ui/CreationStructure.test.jsx src/ui/EditFlow.test.jsx src/ui/CreationPage.twoTabs.test.jsx src/ui/Shell.creationGuard.test.jsx src/ui/RecipePage.shell.test.js src/ui/tabindex-scan.test.js</automated>
    <automated>grep -v '^\s*//' app/src/ui/IngredientPicker.jsx | grep -c 'useEffect' # [HEAD=2 EXPECT==0 @fa19967d]</automated>
    <automated>grep -c '^export const NO_FILTERS' app/src/ui/IngredientPicker.jsx # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "'picker-place'" app/src/ui/CreationPage.jsx # [HEAD=0 EXPECT>=3 @fa19967d]</automated>
    <automated>grep -c 'preventScroll: true' app/src/ui/CreationPage.jsx # [HEAD=0 EXPECT==1 @fa19967d]</automated>
  </verify>
  <done>P1 to P3, E1 to E3 and E5 to E7 failed before the change and pass after it; E4 holds. The picker stands at the end from the heading, in a 'Not in a step yet' body of its own when every row is in a step, and in its built place with no row. It keeps Name and Category when it moves, takes no focus by itself, and opening or moving it scrolls by the rule. Two commits, red then green, staged by explicit path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: The picker's row looks like the board: CSS, the gate held against picker-after-row.html, side by side in WebKit and Chrome, GATE2, the SUMMARY</name>
  <files>app/src/styles/notebook.test.js, app/src/styles/notebook.css, .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs, .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-keys.mjs, .planning/quick/261123-ghi-ingredient-picker-opens-after-its-row-mark-approved-look-p12/261123-ghi-SUMMARY.md</files>
  <behavior>
    - S1 (notebook.test.js, read as text like its other cases): the top-level rule `.notebook .ingredient-table tr.ingredient-table__pick` declares display block and padding 0 0 var(--gap-s); `.notebook .ingredient-table tr.ingredient-table__pick > td` declares display block, padding 0 and border 0; `.notebook .ingredient-table__pick .ink-field` declares text-align start. Each sits outside every @media block.
    - S2 (the board engine, WebKit, --selftest): every entry of the new picker-after-row.html spec passes, and the row-controls and keys specs pass without their ai-pick entries.
    - Red before the CSS: S1 fails, and the new spec's pa-step, pa-other, pa-heading and pa-allplaced entries fail on tr.ingredient-table__pick and the boxes below it.
  </behavior>
  <action>
PHASE below is .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo. S is "${TMPDIR:-/tmp}/sprinkles-ghi".

1. RED, the gate specs. Keep every check kind each entry had, and remove no check except the two superseded entries named here.
- PHASE/12-board-rowcontrols.mjs:
  - Remove the entry for panel ai-pick: its board draws the picker under the Total, superseded by CONTRACT section 13. Keep pickerFromRow and coffeeBase exported as they are; 12-tab-probe.mjs imports coffeeBase.
  - The default export becomes an array of two specs: the row-controls spec with its other entries unchanged, and a spec on '.planning/sketches/016-entry-points-pen-preview-row-controls/picker-after-row.html'.
  - The second spec's entries: id and label `picker-<pid>`, width 1366, panelSelector `.fp-win.g2w-1366[data-pid="<pid>"]`, panelIndex 0, route '/notebook', library 'current', ready '.nb__head', anchor and scope '.ingredient-table-region'.
  - Every entry checks h2.region-name (count, text, box), p.mk-keys (count, text, font, box), `.mk-row-acts button` (count, text, box, attr aria-label, attr data-act, attr aria-keyshortcuts), tr[data-line] (count, box), .ingredient-table__col-name (text) and tr.ingredient-table__step-head (count, text, box).
  - The four open panels add tr.ingredient-table__pick (count, box), .pick (count, attr aria-label), .pick__head (text, box), `.pick .ing__filters` (box) and `.pick__list > li:nth-child(-n+11) > .pick__row` (count, text, box). They take absent ['.mk-head-row', '.mk-head-act'] and no pageHeight (the board lists 11 picker rows, the app the library; the old specs' reason).
  - The two closed panels add .mk-head-row (count, box) and .mk-head-act (count, text, box), absent ['.pick', 'tr.ingredient-table__pick'], and pageHeight true.
  - Steps:
    - pa-step: pickerFromRow, focus cleared before reading (the spec's settle).
    - pa-other: pickerFromRow, then the button labelled 'Add ingredient after Dextrose', 300 ms. Focus kept, with `.pick .ing__filters textarea` (count, focus).
    - pa-cancel: pickerFromRow, then the picker's Cancel (`.pick__head button`), waiting for .pick to detach. Focus kept, with `[aria-label="Add ingredient after Heavy cream, 36% fat"]` (count, focus).
    - pa-picked: pickerFromRow, then the pick row named 'Egg yolk (fresh)', waiting for .pick to detach. Focus kept, with `[aria-label="Egg yolk (fresh), grams"]` (count, focus) and textarea.mk-focus (count).
    - pa-heading: coffeeBase, then the heading's Add ingredient until .pick stands; settle.
    - pa-allplaced: coffeeBase, then 'Add to step, Fine sea salt', then the chooser's 'Step 2, Churn: add Fine sea salt', then the heading's Add ingredient until .pick stands; settle.
  - Update the header comment: which board each spec holds, and why ai-pick left.
- PHASE/12-board-keys.mjs: remove its entry for panel ai-pick (its checks now live in the picker-after-row spec's pa-step entry: the region name, the keys line with its font, the row buttons' aria-keyshortcuts, no head row). Remove pickerFromRow and any import or helper that leaves unused. Update the header comment.
- PHASE/12-check.sh is not changed.
- Build once: `npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir`. Then run, in WebKit, `PROBE_DIST="$S/dist" node PHASE/12-board-check.mjs PHASE/12-board-rowcontrols.mjs PHASE/12-board-keys.mjs --selftest --evidence "$S/evidence-red"`.
- S1 RED: add S1 to app/src/styles/notebook.test.js and run it.
- Record the failures. Commit notebook.test.js and the two spec files by explicit path: `test: the phase 12 gate holds the ingredient picker against the approved picker-after-row board`.

2. GREEN, the CSS. In app/src/styles/notebook.css, directly after the `.notebook .pick` rule (line 399), add three top-level rules in the file's multi-line style, under one comment citing sketch 016 CONTRACT section 13 and picker-after-row.html:
- `.notebook .ingredient-table tr.ingredient-table__pick` with display block and padding 0 0 var(--gap-s);
- `.notebook .ingredient-table tr.ingredient-table__pick > td` with display block, padding 0 and border 0 (the board's two rules, line 13154-13155, with .notebook in place of the board's .fp-win);
- `.notebook .ingredient-table__pick .ink-field` with text-align start.
The comment says why the third exists: the table's grams rule right-aligns every .ink-field in the table, the board shows it on the Category's "All", and the contract keeps the built picker. Add no value that is not a token or a keyword. Rebuild into "$S/dist" and rerun the board command with --evidence "$S/evidence-webkit". Run notebook.test.js. Commit notebook.css by explicit path: `feat: the ingredient picker's row is drawn as the approved board draws it`.

3. Side by side, never in the repo. Run the same board command in Chrome through a scratch "$S/chrome-shim.mjs", as 261123-brl did. It imports playwright-core from PLAYWRIGHT_CORE's default path and exports `webkit` whose launch(options) calls chromium.launch with the options, executablePath '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' and headless true. Pass PLAYWRIGHT_CORE="$S/chrome-shim.mjs" and --evidence "$S/evidence-chrome".
Then write a scratch script under $S. It serves "$S/dist" through PHASE/../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs startServers, imported by absolute path, and aborts every request off 127.0.0.1. It runs at 1366 x 1024 with hasTouch, in WebKit and in Chrome. It makes Coffee with eight rows as .planning/canvas-generators/p12r3-picker-probe.mjs does: Heavy cream and Coffee beans in Step 1, Steep. It prints:
- (a) The scroll rule.
  - Scroll so Heavy cream's row top is near 800, press its Add ingredient, and read scrollY before and after, the row's top, the picker row's bottom and the sticky header's bottom (.shell__head). Expect the row's top at or below the header's bottom, and the picker's bottom at 1024 within 1 px or the row at the header's bottom within 1 px.
  - With the row near the top and the picker fitting, scrollY is unchanged.
  - The same reading for a move to Dextrose's row.
- (b) Tab from Heavy cream's Add ingredient with the picker after it. Expect Move up, Move down, Remove, Cancel, Name, Category, then the list. Shift+Tab from Cancel lands on Heavy cream's Remove. Focusing the last list row and pressing Tab lands on Coffee beans' grams. With 'dex' typed, Clear filters stands after Category.
- (c) The move keeps the filters: type 'dex', choose 'sugar', press Dextrose's Add ingredient. Expect Name 'dex', the Category 'sugar', focus in Name, one .pick, after Dextrose's row. Record where the caret is in Name and the list's scrollTop.
- (d) Cmd+Return in Coffee beans' grams opens the picker after that row; Cancel returns focus to that grams field.
- (e) The computed text-align of Name and the Category in the picker's new place (expect start) and on the snapshot's drawn panel (right), with scrollWidth against innerWidth (no sideways overflow).
Every failure is a finding: report it, and do not loosen a check to pass it.

4. The full suite: `npm --prefix app test` (if npm hangs inside the worktree, `cd app && npx vitest run`, as 12-check.sh notes). It must pass with 137 files and 4596 tests plus the new cases. An existing test failing on the picker's old place, beyond those Tasks 1 and 2 named, is a deviation: name it, update its expectation to the approved place, and record it.

5. The gate: after step 3 finishes, run `sh PHASE/12-check.sh` once, in the background, and wait for it. It must end GATE2 PASS. If a step that reads the picker's place does not fail but another step does (sim, pdf, walk, print, roundtrip, stops, tabs, keys), record its output, rerun this plan's board command on its own, and report it; do not edit that step. If the Phase 11 walk stops matching 94 snapshots, stop and report it: its baseline moves only on Mark's word (STATE.md, D-08-1).

6. Write the SUMMARY with:
- what was built, by file;
- red then green for each task, and the suite counts;
- the gate changes, file by file, and why: the ai-pick entries held the superseded place, and their checks moved to the approved board;
- the engine's PASS and FAIL counts per new entry in WebKit and Chrome, with the evidence folders;
- the scroll, Tab, move and key readings from step 3, as a table, WebKit and Chrome;
- the 12-check.sh result;
- the undrawn states and the two board points (text-align built as the built picker, line height kept as drawn), from the objective;
- what other screens do: the pen, the reading page, the record pen, Show changes and print draw no picker row; the Edit editor is the same component and gets the change;
- the line "Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad";
- a "For the orchestrator" section:
  - The executor has no ArtifactData, so the orchestrator closes look-p12-picker-after-row and decides whether the undrawn states or the text-align point need a row.
  - A dist built from this commit is safe to deploy once the suite and GATE2 pass: no store shape or DB_VERSION change.
  - This item depended on 261123-ghh only for the shared notebook stylesheet.
Commit the SUMMARY last, by explicit path: `docs: summary for the ingredient picker after its row`.

Executor rules for this whole plan:
- Tests come first: a failing test commit before each change commit.
- Stage explicit paths only. Never use `git add -A` or `git add .`. A designer commits sketch files on main at the same time, so never stage anything under .planning/sketches or .planning/canvas-generators.
- Never write app/dist, never start a dev or preview server or a second Vite process, leave port 4173 alone, and run no build while another runs.
- Do not touch .planning/state.json, .planning/STATE.md or .planning/ROADMAP.md.
- Commit messages, comments and test input are plain English.
- Changes are surgical: nothing in RecipeSheet.jsx, the pen, Method.jsx, the store or the domain; no new on-screen word; every button through Button.jsx; no stored shape or DB_VERSION change.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/notebook.test.js src/styles/cross-cutting.test.js src/styles/tokens.test.js</automated>
    <automated>grep -c 'ingredient-table__pick' app/src/styles/notebook.css # [HEAD=0 EXPECT>=3 @fa19967d]</automated>
    <automated>grep -c 'picker-after-row.html' .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>grep -c "pid: 'ai-pick'" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs # [HEAD=1 EXPECT==0 @fa19967d]</automated>
    <automated>grep -c "pid: 'ai-pick'" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-keys.mjs # [HEAD=1 EXPECT==0 @fa19967d]</automated>
    <automated>npm --prefix app test</automated>
    <automated>sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh</automated>
    <automated>grep -c "Device-unverified" .planning/quick/261123-ghi-ingredient-picker-opens-after-its-row-mark-approved-look-p12/261123-ghi-SUMMARY.md # [HEAD=error:2 EXPECT>=1 @fa19967d]</automated>
  </verify>
  <done>S1 and the new board entries failed before the CSS and pass after it, in WebKit and in Chrome through the shim. The gate holds the picker against picker-after-row.html in six panels, and neither spec holds the superseded ai-pick panel. The scroll, Tab, move and key readings are in the SUMMARY for both engines. The full suite passes, and 12-check.sh ends GATE2 PASS, or the SUMMARY names the unrelated step that stopped it, with its output. The SUMMARY is committed last.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema are involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed. Security enforcement: ASVS level 1, block on high; no threat here is high.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| library to page | stored ingredient names (seeded or imported) become the picker group's accessible name |
| maker's draft | where a pick lands writes the creation draft the maker will save |
| page focus | the picker's place changes while the maker works elsewhere on the page |
| gate | the phase 12 board specs decide whether the build matches the approved board |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ghi-01 | Tampering | IngredientPicker.jsx aria-label built from a stored ingredient name | low | mitigate | React sets the name as an attribute value, never markup; no dangerouslySetInnerHTML under app/src (RecipePage.shell.test.js and the project rule) |
| T-ghi-02 | Tampering (draft integrity) | CreationPage.jsx: the picker's place against handlePick's landing | medium | mitigate | One rule decides both: anchorHolds over the same draft puts the picker after the anchor line, else at the end, which is where handlePick lands. R1 to R5 and E1 to E2 assert that the new row stands exactly where the picker stood; the existing anchor-lost cases (CreationFlow lines 2837-2883) keep passing |
| T-ghi-03 | Denial of service (focus lost) | IngredientPicker.jsx drawn anew in another body | medium | mitigate | The picker takes no focus on mount; CreationPage focuses Name only on an open or a row's move. E6 proves that unticking the anchor row keeps focus on the Uses box; P1 proves the mount takes none |
| T-ghi-04 | Tampering (gate) | 12-board-rowcontrols.mjs, 12-board-keys.mjs | low | mitigate | Only the two entries holding the superseded panel ai-pick are removed. Their checks move to entries on the approved picker-after-row.html with at least the same check kinds, --selftest still runs over them, and the SUMMARY lists each change |
| T-ghi-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- Each task lands a failing test commit before its change commit.
- In the creation editor at 1366 the picker stands after its row, or at the end from the heading, named by its place, as picker-after-row.html draws it; held by the board engine in WebKit and Chrome.
- `npm --prefix app test` passes: 137 files and 4596 tests before, plus the new cases; IngredientTable.creating.test.jsx and the Cancel cases in CreationFlow.test.jsx included.
- 12-check.sh ends GATE2 PASS.
</verification>

<success_criteria>
- A row's Add ingredient, or Cmd+Return in its grams, opens the picker directly after that row; the heading's opens it at the end; another row's moves it, keeping Name and Category; Cancel and a pick behave as built at the new place.
- The picker's group names its place; no word is added on screen.
- Opening or moving the picker never pushes the opener row out from under the sticky header, and scrolls no further than the picker needs.
- The pen and every other screen are unchanged. The side by side holds in WebKit and Chrome and is recorded as device-unverified. The full suite and GATE2 pass.
</success_criteria>

<output>
Create `.planning/quick/261123-ghi-ingredient-picker-opens-after-its-row-mark-approved-look-p12/261123-ghi-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
