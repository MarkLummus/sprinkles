---
phase: quick-261001-eds
plan: 01
quick_id: 261001-eds
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/domain/batch.js
  - app/src/domain/batch.test.js
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - .planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs
autonomous: true
requirements: [BATCH1-01, BATCH1-02]

estimate:
  tokens: 85000
  raw_tokens: 85000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Reading Mocha version 3's saved batch (its as-made source is empty), the ingredient table's total row still carries the As made cell, and the cell is empty: no text, no stand-in, no dash, not even an empty span. Show changes on and off read the same. The row's aria-label carries no ', as made' clause (D-01, D-03)."
    - "Reading Mocha version 2's saved batch (as made 794.6 g, values written) the total still reads 794.6 g in the hand, with its aria clause, exactly as today, fill-ins from the plan included (D-04)."
    - "While recording, the as-made total starts empty, appears as soon as one value is typed into any active row (a typed value equal to the plan counts), and is empty again if every value is cleared (D-01, D-02)."
    - "'Written' is decided from the as-made source's own entries for the active rows the table passes in, never from a numeric difference from the plan: a row key whose element parses counts, a typed value equal to the plan counts, a written 0 counts; a key whose elements are all null, blank or unparseable does not. asMadeTotals reports this beside its two unchanged totals (D-02)."
    - "The As made and Ingredient column heads do not move between the empty and filled states of the recording pen, measured in WebKit and Chromium at 1366 (D-03)."
    - "The small-print line, every stylesheet, every token, every board and every canvas are untouched. The sketch boards draw the as-made total only where values are written, so no board is edited and no Sid task exists (D-05, D-06)."
    - "The SUMMARY states plainly what is device-unverified (Mark checks the iPad) and confirms, with the code locations, how as-made source entries work (D-07, D-09)."
  artifacts:
    - path: app/src/domain/batch.js
      provides: "asMadeTotals returns anyWritten beside planTotal and asMadeTotal, decided by the same element test the total already uses"
      contains: "anyWritten"
    - path: app/src/ui/IngredientTable.jsx
      provides: "the tfoot as-made cell renders nothing, and the row's aria-label drops the as-made clause, until a value is written"
      contains: "anyWritten"
    - path: app/src/domain/batch.test.js
      provides: "the written-or-not matrix for asMadeTotals"
      contains: "anyWritten"
    - path: app/src/ui/IngredientTable.test.jsx
      provides: "rendered-markup pins for the blank and filled total cell in reading, recording and show-changes"
      contains: "blank until a value is written"
    - path: .planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs
      provides: "the WebKit and Chromium probe of the built app: Mocha version 3 and version 2 readings, the recording pen, the board side-by-side"
      contains: "webkit"
  key_links:
    - from: app/src/ui/IngredientTable.jsx
      to: app/src/domain/batch.js
      via: "asMadeTotals(activeRowsOnly, asMadeSource) supplies both the total and the written flag"
      pattern: "asMadeTotals"
    - from: .planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs
      to: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
      via: "imports startServers, launch, openBoard, check, finish and APP_ROUTE; the harness serves the checkout's app/dist on ephemeral 127.0.0.1 ports"
      pattern: "03.5-probe-harness.mjs"
    - from: app/src/ui/IngredientTable.test.jsx
      to: app/src/ui/IngredientTable.jsx
      via: "renderToStaticMarkup of the tfoot, exact markup for the blank and the filled cell"
      pattern: "ingredient-table__live-total"
---

<objective>
Blank the As made total in the ingredient table's total row until at least one as-made value has been written for an active row (Mark, 2026-10-01, UAT note on Mocha version 3 with Show changes on).

Today the total row's as-made cell prints the plan total again whenever an as-made layer exists, because asMadeTotals fills the plan in where nothing was written. Mocha version 3's batch has an empty as-made source, so Home reads plan 793.9 and the as-made column reads 793.9 too; with Show changes on the plan cell reads struck 794.9 then 793.9. Reproduced identically in Playwright WebKit and Chromium at 1366.

## Decisions

Every decision below is Mark's, from the brief (2026-10-01).

- **D-01** The As made total is blank (not visible) unless at least one as-made value has been written for an active row. It applies to a saved batch reading and to the pen while recording, where the total appears once the first value is typed.
- **D-02** "Written" means a real entry in the as-made source for an active row. A value the maker typed that equals the plan still counts as written: the decision comes from the as-made source's own entries, not from a numeric difference.
- **D-03** The total cell stays in the table so the column structure and alignment do not move, but it renders nothing: no text, no stand-in, no dash. The row's aria-label drops its ", as made X grams" clause when the cell is blank.
- **D-04** Where any as-made value exists, the total reads exactly as it does today; fill-ins from the plan still count toward that total.
- **D-05** The small-print line is unchanged unless it becomes untrue. Check whether "As made totals what was written; the plan fills in where nothing was." still reads true, and leave it unless it is wrong.
- **D-06** The sketch is the single authority. Before editing, read what sketches 007, 008 and 011 draw for the as-made total with nothing written. If a board draws that state, do not hand-edit boards: report which boards and generator lines, and add the generator edit, regeneration and snapshot only as a clearly separated final task for Sid to confirm. If no board draws it, say so and touch no board. Publish no canvas. Push nothing.
- **D-07** Pin it: a rendered-markup test in IngredientTable.test.jsx for the blank cell (no as-made values) and the filled case (some value), in both reading and recording modes, plus a framework-free domain test if batch.js gains a helper. Verify on the built app with a probe in WebKit and Chromium: Mocha version 3's total row shows an empty as-made cell with Show changes on and off, Mocha version 2 (as made 794.6, values written) still shows the as-made total, and the pen while recording starts blank and fills once a value is typed.
- **D-08** Existing tests that assert the old fill-in total change; update them and weaken nothing.
- **D-09** Conventions: both CLAUDE.md files; every visual value through tokens; the explicit tabIndex rule untouched. Tests `npm --prefix app test -- --run` (baseline 1454 passing); build `npm --prefix app run build`; probes against the build through the harness. A Vite dev server (pid 11248) and a preview server (pid 68288, port 4173) are running and are not yours: start no second Vite process. Commit on main, in English, each message ending with the two trailer lines Co-Authored-By: Claude Sonnet 5.5 and Claude-Session (the exact text is in the commit-trailer block under Task 1). Do not push. The SUMMARY states plainly what is device-unverified; Mark checks the iPad.

## Planner's readings (taken 2026-10-01, before any edit)

- **How as-made source entries work (confirming D-02).** An entry is a row-id key holding an array aligned index-for-index with that row's portions. Presence is tested by own-property check (batch.js hasAsMade). The pen's draft and a saved batch both honour it: RecipePage.jsx handleChangeAsMade (lines 1272-1290) seeds a row's array with empty strings on the first keystroke and deletes the key again when every portion is back to an empty string; buildChurnFieldsFromDraft (lines 534-539) parses each element through parseGramsDraft and drops a row whose every element is null. A typed value equal to the plan is stored as the typed number under the same key, so a typed-equals-plan value is a real entry. Refinement the code forces: a present key is not enough on its own. A saved record can carry a key with only null elements (the existing test "a row whose as-made key holds no written portion" builds one), and the live draft holds raw strings, some of which do not parse (a lone "-", letters). So "written" is the element test asMadeTotals already applies when it takes the as-made element over the plan: the element is not null, not undefined, not an empty string, and Number() of it is finite. The cell is therefore blank exactly when the total would be pure plan, and the flag cannot disagree with the total beside it. Limits inherited unchanged, not fixed here: the live total's Number() rule is looser than the save rule parseGramsDraft (a stray space or a trailing dot counts in the live total and is dropped on save). Report it in the SUMMARY as an existing divergence.
- **Active rows only.** IngredientTable passes activeRowsOnly to asMadeTotals, and asMadeTotals iterates only the rows it is given, so a key belonging to a removed row never counts. No new code is needed for that; the domain test pins it.
- **The sketch finding (D-06), read before planning.** gen.py's sheet_for rewrites the as-built tfoot into the boards; it draws the as-made total only when a batch is in view, and every board that carries an as-made total (011-recipe-route-c: 1024-batch, 1366-batch, 1600-batch, 1600-long-history, 1600-pen, 1920-batch, 393-batch, 723-batch, 983-batch, 984-batch) also carries five written hand values in its body (the 2 Aug Olive Oil batch: 799.7 g plan, 804.3 g as made). The boards without a batch (1600-no-batch, 393-all-folded, details-fold) have no As made column. The five 011-options-counts boards have no As made column. Sketches 007 and 008 draw controls only: no ingredient table, no tfoot, no total. counts.py and the other generators draw no as-made total; no board draws the recording pen's as-made column or its total (nothing in the sketches or generators carries the live-total or as-made-field classes). So no board draws a total with nothing written: no board is edited, no Sid task is added. The blank state is undrawn, so the sketches are silent on it rather than in conflict; the SUMMARY says so. Task 1's verify re-runs the scan so a later regeneration cannot invalidate this finding unnoticed, and Task 3's probe reads boards in a browser beside the app.
- **Small print (D-05).** "As made totals what was written; the plan fills in where nothing was." describes the total's rule where a total is shown, and stays true: where values exist the plan fills the rows that have none. With nothing written there is no total, and the sentence claims nothing false. It is left alone. Phase 2's D-22 ("the plan where nothing was") is narrowed only for the all-empty case, by Mark's decision; the line still describes the shown case.
- **Layout.** The total cell must contain no child nodes at all when blank. Two existing rules then apply with no CSS change: app.css's list form below 724 hides an empty numeric cell (`td.ingredient-table__col-numeric:empty` is display none, the same rule the body's blank as-made cells already use), and while recording at 724 and up the live total is already inline-size contained (G-03.5-8a) so it never sizes the column, which is why typing the first value cannot move the heads. Reading mode's total does size its column as a nowrap cell, so a batch with nothing written has a column as wide as its head and an empty cell; that is the same page in one state, not a shift between two. At narrow widths the empty cell leaves the grid, so the total row is one line shorter until a value is typed; that is expected and is read, not fixed, in Task 3.
- **Existing tests.** Only one test mentions the total row's as-made clause in a blank state, and only in a comment: IngredientTable.test.jsx lines 357-363 say the total row "legitimately carries its own 'as made X grams' phrase whenever an as-made layer is showing at all", which becomes untrue; the assertion beneath it is scoped to the tbody and still holds. The recording-hook test (lines 201-210) asserts the live-total td class on an empty draft and still passes because the cell stays. Every other as-made total assertion (lines 406-415, 872-886) has a written value and is unchanged. batch.test.js asserts asMadeTotal numbers only; those stay true because the domain keeps filling plan into the number.
- **Not changed.** No stylesheet, token, board, canvas, generator, link, button or input: the explicit tabIndex rule is untouched. IngredientTable's three body branches and AsMadeCell are untouched.

## Coverage audit

- GOAL: the As made total reads blank until a value is written, in the saved reading and the pen. Task 1 (code, one path), Task 2 (every state pinned), Task 3 (built app, both engines).
- REQ: BATCH1-01 (as-made amounts kept separate from the plan) and BATCH1-02 (blank stays unknown, never filled from the recipe), Tasks 1 and 2.
- RESEARCH: none for a quick task.
- CONTEXT: D-01 Tasks 1-3; D-02 Tasks 1-2 and the SUMMARY; D-03 Tasks 1-3; D-04 Tasks 1-3; D-05 Task 1 (decision recorded) and the SUMMARY; D-06 Task 1 verify, Task 3 board reading, SUMMARY; D-07 Tasks 2-3; D-08 Tasks 1-2; D-09 every task's commit, Task 3's SUMMARY.

Purpose: a maker who has written nothing is not shown a figure the plan alone produced; the column reads as unknown until they write something, as BATCH1-02 asks of every other as-made field.

Output: a domain flag and its matrix of tests, the blank cell and aria change in IngredientTable with rendered-markup pins in every mode, a WebKit and Chromium probe of the built app, a rebuilt app/dist for Mark's iPad check, and a SUMMARY that is honest about what is and is not verified.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./.claude/CLAUDE.md
@.planning/STATE.md
@app/src/ui/IngredientTable.jsx
@app/src/ui/IngredientTable.test.jsx
@app/src/domain/batch.js
@app/src/domain/batch.test.js
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs

<environment>
- Node is on PATH. Tests: `npm --prefix app test -- --run`, baseline 1454 passing. Build: `npm --prefix app run build` (a one-shot `vite build`, not a server). Run every command from the checkout root.
- The harness (03.5-probe-harness.mjs) serves the checkout's own app/dist and the repo tree on ephemeral 127.0.0.1 ports and closes them itself. Reuse it unchanged. Never start `vite`, `vite dev` or `vite preview`. The dev server (pid 11248) and the preview server (pid 68288, port 4173) are not yours: do not stop, restart or probe them. The preview serves app/dist from disk, so the rebuild in Task 3 is how this change reaches Mark's iPad (a page he already has open needs a reload).
- WebKit is Playwright's own: `webkit.launch()` with no executablePath, imported from the same playwright-core module the harness and 261001-doi-tab-probe.mjs import chromium and webkit from. If it will not launch, STOP and report; install nothing.
- Commit-trailer block. Every commit message in this plan is English and ends with a blank line, then these two lines exactly: "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>" and "Claude-Session: https://claude.ai/code/session_01WeaQszVGJ9FPrW4pPwpmYE". Commit on main. Do not push.
</environment>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Reading a saved batch with nothing written: the As made total cell is blank, end to end</name>
  <files>app/src/domain/batch.js, app/src/domain/batch.test.js, app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx</files>
  <behavior>
    - A saved batch whose as-made source is empty, rendered in reading mode: the tfoot row is Total, then an empty As made cell, then the empty share cell, with the same cell count as the head and body; the row's aria-label reads the plan alone.
    - asMadeTotals({}) reports anyWritten false next to unchanged totals; a written entry reports true.
  </behavior>
  <action>
One path through every layer, production quality: a saved batch with an empty as-made source, in reading mode, from the domain flag to the rendered cell (D-01, D-03). The same code serves recording, show-changes and the pen with a cited batch, so Task 2 pins those states rather than adding code.

Before any edit, read the boards: the scan in this task's verify must pass, and the planner's sketch finding must still hold in the files as they stand (D-06). If the scan reports a board that draws the blank state, STOP and report the board and the generator lines to the orchestrator: edit no board, and add a clearly separated final task for Sid only after the orchestrator confirms.

RED first (D-07). In IngredientTable.test.jsx add a describe block titled "IngredientTable: the As made total is blank until a value is written (quick 261001-eds)". Its first test renders one reading table (two rows, plan 40 and 20, so the plan total reads 60.0 g) with makeBatch({}) as the open batch and asserts, on the tfoot slice: the name cell "Total" is followed directly by two empty numeric cells, the first of which is the As made cell, as exact markup with no child node in it; the tfoot row's aria-label is exactly the plan clause (Total, plan 60.0 grams) with no as-made clause; the tfoot carries no hand-span; assertCellCountsAgree still holds; and the small-print line is still present (D-05, left unchanged). Add the domain case to batch.test.js's asMadeTotals describe: an empty source reports anyWritten false while planTotal and asMadeTotal are unchanged (the existing "plan-equals-as-made" numbers stay true). Run both files and watch them fail.

GREEN. In batch.js, asMadeTotals gains a third returned field named anyWritten. It is set true in the one branch where the as-made element is taken over the plan (the existing `Number.isFinite(value)` branch), so it is decided by exactly the element test the total already uses (D-02): never from a difference against the plan, and a written 0 counts. planTotal and asMadeTotal are computed exactly as before, plan fill-ins included (D-04). Update the function's doc comment: the new return shape, and one sentence saying anyWritten is true when at least one element of a passed row was taken over the plan's number, so a caller can tell a total built from what was written from one that is the plan alone. Keep the module framework-free: no new import. In IngredientTable.jsx, read the field from the existing asMadeTotals call, then (a) render the tfoot as-made cell's content only when it is true, so a blank cell holds no node at all (no span, no text, no dash; the td and its existing className logic, including the live-total hook in recording, stay); (b) in totalAriaLabel, add the as-made clause only when an as-made layer is showing and anyWritten is true, so a blank cell reads the plan alone, while the show-changes branch is left as it is; (c) amend the comment above hasAsMadeLayer (it says the total appears while a layer is showing; it also now needs a written value) so it stays true. Touch nothing else in the file: AsMadeCell, the three body branches, the header and the small-print paragraph stay as they are. No stylesheet change and no literal anywhere.

Amend the now-untrue comment in IngredientTable.test.jsx beside the test "a row whose as-made key holds no written portion reads as no as-made at all": the total row no longer carries an as-made clause in that state, so rewrite the comment to say the assertion stays scoped to the tbody because the cell under test is a body cell, and add one assertion to that test that its tfoot has no hand-span either. Keep every existing assertion.

Commit: `fix(261001-eds): blank the As made total until a value is written`, with the commit-trailer block from the environment section.
  </action>
  <verify>
    <automated>! { for f in .planning/sketches/011-recipe-route-c/*.html .planning/sketches/011-options-counts/*.html; do if grep -o 'tfoot>.*/tfoot' "$f" | grep -q 'as made'; then [ "$(grep -o 'tbody>.*/tbody' "$f" | grep -o 'Caveat[^>]*>[0-9.]* g' | wc -l)" -gt 0 ] || echo "BLANK-STATE TOTAL DRAWN: $f"; fi; done; } | grep -q 'BLANK-STATE TOTAL DRAWN' && npm --prefix app test -- --run src/domain/batch.test.js src/ui/IngredientTable.test.jsx</automated>
  </verify>
  <done>No board draws an as-made total over an unwritten body (scan clean). A saved batch with an empty as-made source renders the tfoot as Total plus two empty numeric cells with a plan-only aria-label; asMadeTotals reports anyWritten false there and true with a written entry; both test files pass with the new tests and every earlier assertion intact; one commit on main with the two trailer lines.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Pin every state: filled, typed-equals-plan, recording, show-changes, and the domain matrix</name>
  <files>app/src/ui/IngredientTable.test.jsx, app/src/domain/batch.test.js</files>
  <behavior>
    - Reading, a value written (45 on a 40 row): the total shows the as-made figure (65.0 g, the other row filling from the plan) in the hand, aria clause present.
    - Reading, a value written that equals the plan (40 on the 40 row): the total shows 60.0 g and the aria clause is present: presence decides, not difference (D-02).
    - Reading, the key present with only null elements: blank.
    - Recording, empty draft: the live-total cell is empty and the aria reads plan alone; recording with one typed string: the live-total cell holds the hand-span and the clause; recording with a typed string equal to the plan: shown; recording with only an unparseable string: blank.
    - Show-changes (parent 40, current 48), batch with an empty source: the plan cell is struck then current and the as-made cell is empty; with a written value: the as-made cell shows it.
    - Domain: the matrix of what counts as written.
  </behavior>
  <action>
Expansion from the proven slice: pin every state that reaches the code Task 1 changed, so no mode can drift back to filling the plan into the cell (D-01 to D-04, D-07). Tests only: no production file is touched in this task. If a new test fails for a reason Task 1's code cannot explain, report the number and the markup; do not edit the code to fit the test.

In the describe block Task 1 opened in IngredientTable.test.jsx, add rendered-markup tests with the file's own renderToStaticMarkup, makeRow, makeBatch and sectionMarkup helpers, each asserting the exact tfoot cell markup rather than a loose substring. Reading mode: one written value (45 on a 40 row, a 20 row beside it) shows the hand-span 65.0 g in the As made cell, with the aria-label carrying both the plan and the as-made clause; one written value equal to the plan (40 on the 40 row) shows 60.0 g and keeps the clause; a key holding only null elements reads blank. Recording mode, using draft objects shaped as the pen's draft is (asMade keyed by row id, strings as typed): an empty draft leaves the live-total cell empty (the td keeps both classes, no child) with a plan-only aria-label; a typed string shows the hand-span inside the live-total cell with the clause; a typed string equal to the plan shows; a lone unparseable string leaves it blank. Show-changes mode, built with buildDiff exactly as the file's existing show-changes tests do (parent row 40, current row 48): an open batch with an empty source gives a struck-then-current plan cell and an empty As made cell; an open batch with a written value shows it. In each blank and filled test also call assertCellCountsAgree, so head, body and total keep the same cell count. Do not change the existing live-total hook test or any other existing test.

In batch.test.js's asMadeTotals describe, add a matrix for anyWritten, with rows built the way the existing split-row tests build them (an id and a portions array; no fixture import needed beyond what the file already has): an empty source is false; a key with only nulls is false; a key with only empty strings is false; a key with only an unparseable string is false; a written 0, as the number and as the typed string, is true; a written value equal to the plan is true and asMadeTotal equals planTotal there (presence, not difference); one written portion beside one null portion is true; a key that belongs to no row in the rows passed (the caller passes active rows only, so a removed row's stale key) is false; the seeded 2 Aug batch's own as-made source over the Olive Oil rows is true. Keep the file framework-free and in the node environment it already runs under.

Weaken nothing (D-08): after the edits, `git diff` of the two test files shows additions only, apart from Task 1's single comment rewrite. Commit: `test(261001-eds): pin the blank and filled As made total in every mode`, with the commit-trailer block from the environment section.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/domain/batch.test.js src/ui/IngredientTable.test.jsx</automated>
  </verify>
  <done>Reading, recording and show-changes each have a blank-cell test and a filled-cell test on exact markup; the typed-equals-plan and written-0 cases are pinned in the UI and the domain; the domain matrix covers empty, all-null, all-blank, unparseable, written 0, equal-to-plan, partial, stale key and the seeded batch; both files pass; the diff adds tests and weakens none; one commit on main with the two trailer lines.</done>
</task>

<task type="auto">
  <name>Task 3: Prove it on the built app in WebKit and Chromium, and write the SUMMARY</name>
  <files>.planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs</files>
  <action>
Write one probe that reads the built app's total row in both engines (D-07). It takes no arguments: `node .planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs`. Model it on 261001-doi-tab-probe.mjs: import startServers, launch, openBoard, check, finish and APP_ROUTE from the harness by relative path; import webkit from the same playwright-core module path that probe imports it from; wrap check in a counting helper; serve the build through startServers and close it in a finally block; make a context directly per engine (1366 by 1024, touch, mobile, device scale 2, every non-127.0.0.1 request aborted), since openApp is written against Chromium. Chromium launches through the harness's launch(), WebKit through webkit.launch() with no executablePath. Print one JSON line per reading so the SUMMARY can quote numbers.

A reading helper, run in the page, returns the tfoot row's aria-label and, for its four cells (plan grams, Total, As made, share), the text, the child-element count and the struck-value presence of the plan cell; and the table head's As made presence and the tbody's hand-span count. Per engine, counted checks:
- Mocha version 3 (route /notebook/mocha/mocha-v3), Show changes off: the head carries As made; the tbody holds no hand-span (the fixture really has nothing written); the tfoot has four cells; the As made cell has empty text and no child element; the aria-label has no ", as made" clause; the plan cell reads 793.9 g.
- Same route after clicking the Show changes button and waiting until the plan cell holds a struck value: the As made cell is still empty and the aria-label still has no as-made clause.
- Mocha version 2 (route /notebook/mocha/mocha-v2), Show changes off and on: the As made cell reads 794.6 g in a hand-span, the tbody holds hand-spans, and with changes off the aria-label carries "as made 794.6 grams".
- The recording pen on the harness's APP_ROUTE (the Olive Oil batch route; click the button named Record another, as 261001-doi-tab-probe.mjs does): on opening, the As made total cell is empty with no child element, carries the live-total class, and the aria-label has no as-made clause; record the x position and width of the As made head and of the Ingredient head; fill the first as-made field (the first element with the ingredient-table__as-made-field class) with 45: the cell now reads a figure in grams inside a hand-span and the aria-label carries the clause, and both heads' x and width are unchanged within 0.5 px (the column does not move); fill that field with an empty string: the cell is empty again; fill it with the number read from that row's own plan-grams span: the cell shows a figure equal to the plan total cell's text, since a typed value equal to the plan counts and the second portion fills from the plan.
- The boards beside the app (D-06): through openBoard, read 1366-batch.html and 1600-pen.html. In each, the body holds written hand values and the as-made total cell shows a figure, so the boards draw the total only over written values; and the app's own Olive Oil batch reading (APP_ROUTE, not recording) shows the same as-made total text as the 1366 board's cell. If this parity check fails on a number drift unrelated to this change, report the two figures in the SUMMARY; do not edit a board.

A report-only reading, printed and not counted as a check: at a 393 wide context, Mocha version 3 and Mocha version 2, the As made total cell's computed display and text, so the SUMMARY can state what the existing empty-cell rule does to the total row in the list form.

Then run the whole sequence. If any counted check fails for a reason the code or tests cannot explain, STOP and report the engine, the reading and the numbers; do not iterate blindly and do not add CSS to make a probe pass. Run: the full test suite, the build, the probe. Then write 261001-eds-SUMMARY.md in this quick directory (the standard summary template) and make sure it says, in plain words: (1) how as-made source entries work, with the code locations from the planner's readings, that a typed value equal to the plan counts as written, and that the decision is the element test asMadeTotals uses, plus the pre-existing divergence between that Number() rule and the save rule; (2) the sketch finding, naming the boards read, that none draws a total over nothing written, that no board, generator, canvas or token was touched, and that the blank state is undrawn on every board so Mark or Sid may want one drawn (not done, not asked); (3) that the small-print line was checked and still reads true, and left alone; (4) the test count against the baseline of 1454 and the probe's numbers per engine, including the 393 reading; (5) what is device-unverified: nothing here ran on Mark's iPad or iPhone; the WebKit and Chromium readings are engine evidence at 1366 touch and 393, not the device; the app/dist rebuild means the preview on :4173 now serves this change and an open tab needs a reload; and Mark's checklist: on the iPad open Mocha version 3 (Show changes on and off) and see an empty As made cell in the total row, open Mocha version 2 and see 794.6 g, start a batch record and see the total appear on the first typed digit and go away when cleared. Commit the probe and the SUMMARY: `docs(261001-eds): probe the blank As made total in WebKit and Chromium, and the summary`, with the commit-trailer block from the environment section. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && npm --prefix app run build && node .planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs</automated>
  </verify>
  <done>The full suite passes (baseline 1454 plus the new tests, none removed); the build succeeds; the probe exits 0 reporting every counted check passed in both engines: Mocha version 3's As made total cell empty with Show changes on and off, Mocha version 2 still reading 794.6 g, the recording pen empty on open, shown after a typed digit and after a typed value equal to the plan, empty again when cleared, the As made and Ingredient heads unmoved, and the boards agreeing with the app where values are written; the SUMMARY covers its five points and states what is device-unverified; the probe and SUMMARY are committed on main with the two trailer lines and nothing is pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker's keystrokes to the pen's draft | untrusted strings reach asMadeTotals, which reads them with Number() and never as markup |
| IndexedDB to the table | stored as-made arrays reach the same function; the repository seam is unchanged |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-eds-01 | Tampering | asMadeTotals reading a draft string or a stored element | low | accept | No new input path: the flag is set by the branch that already tests Number.isFinite on the element; a non-numeric or empty element sets nothing. The cell renders a number the code formatted, never the typed string, so nothing typed reaches the DOM as markup (no markup injection API is added or used). |
| T-eds-02 | Information Disclosure | the empty cell's aria-label | low | accept | The label now says less (no as-made clause when nothing is written); it adds no data. |
| T-eds-03 | Denial of Service | the probe's local servers | low | mitigate | The harness binds ephemeral 127.0.0.1 ports only, aborts every non-127.0.0.1 request, and closes its servers in a finally block; the plan never touches the preview on :4173 or the dev server and starts no second Vite process (a second one's optimised-deps cache would invalidate the first's). |
| T-eds-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed by this plan; the probe uses the playwright-core module already on disk. If a task ever needs an install, stop and raise a blocking human checkpoint before it. |
</threat_model>

<verification>
- `npm --prefix app test -- --run` passes: 1454 plus the new tests, none removed or weakened; `git diff` of the two test files shows additions apart from one comment rewrite.
- `npm --prefix app run build` succeeds.
- The probe exits 0 in WebKit and Chromium (Mocha version 3 empty with Show changes on and off; version 2 reads 794.6 g; recording empty, filled, empty again; heads unmoved; boards agree).
- `git diff --stat` for the three commits shows only: batch.js, batch.test.js, IngredientTable.jsx, IngredientTable.test.jsx, the probe, and the SUMMARY. No stylesheet, board, canvas, generator, CLAUDE.md or token file.
- No `git push`; the working tree's untracked .impeccable files are not staged.
</verification>

<success_criteria>
- The As made total is empty (no text, no stand-in, no dash, no node) until a value is written for an active row, in the saved reading (Show changes on and off) and in the recording pen; it reads exactly as today wherever a value exists, plan fill-ins included.
- Written is decided from the as-made source's entries, a typed value equal to the plan counts, and the SUMMARY says how entries work.
- The tfoot cell stays, the aria clause drops when blank, the heads do not move, the small print is untouched, no board was edited and none draws the blank state.
- Everything is pinned in rendered markup (reading, recording, show-changes) and in a framework-free domain matrix, and verified on the build in both engines.
- The SUMMARY states plainly what is device-unverified, for Mark's iPad check.
</success_criteria>

<output>
Create `.planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-SUMMARY.md` when done
</output>
