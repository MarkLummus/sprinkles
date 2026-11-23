---
phase: quick-261123-iqe
plan: 01
type: execute
wave: 1
depends_on: ["261123-ghk"]
files_modified:
  - app/src/domain/stepNumbers.js
  - app/src/domain/stepNumbers.test.js
  - app/src/domain/diff.js
  - app/src/domain/diff.test.js
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/Method.preview.test.jsx
  - app/src/ui/RecipePage.stepOrder.test.jsx
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
  - .planning/quick/261123-iqe-next-version-pen-step-order-slice-2-a-mo/261123-iqe-SUMMARY.md
autonomous: true
requirements: [decide-p12-pen-order-mark, bug-p11-pen-steps-no-reorder, look-p12-pen-step-order]

estimate:
  tokens: 140000
  raw_tokens: 140000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "In the Next version pen, once the order of the steps live in both the draft and the opened version differs, every closed live step whose number differs from its number on the opened version reads ' was step N' (N that number) in a span.method-step__skipped-label, the last child of its p.method-step__lead, directly after the span holding the step's words. Moving the steps back clears every mark. A removal alone marks nothing new (sketch 017 CONTRACT section 5, choice A; README decision 9; decide-p12-pen-order-mark = A)"
    - "On an open step the same span stands inside div.method-step__open-fields where 'removed' stands on an open removed step: after the two fields (and after the parent's struck words when they show), before the line of target chips when the step has targets"
    - "Show changes on a saved version marks the same way against its parent: in so-a's state Sweeten reads ' was step 4', Strain ' was step 2', Churn ' was step 5', and Rest reads struck with its parent number 3 and ' removed', as built. The reading page with Show changes off, Preview step, the Ingredients table's step heads and the printed sheet carry no mark (CONTRACT sections 5 and 6)"
    - "movedFromNumbers and buildDiff's stepOrderChanged read the one rule keptOrderChanged already holds; buildDiff's step descriptors follow current.method's own order and its comments say so"
    - "No CSS rule, no token, no stored shape, no DB_VERSION, no DRAFT_SHAPE_VERSION and no draft shape change; no words beyond ' was step N'; the Phase 11 walk prints MATCH 94 snapshots against its baseline, which this plan does not touch"
    - "12-board-penpreview.mjs holds pm-once and pm-twice's leads and the panels pm-removed (less the removed step's number cell), pm-open, so-a, so-read and so-table in WebKit and Chrome; the full suite passes; 12-check.sh ends GATE2 PASS"
  artifacts:
    - path: app/src/domain/stepNumbers.js
      provides: "movedFromNumbers(method, baseMethod): each live step whose number differs from its parent number, mapped to that parent number, once keptOrderChanged is true"
    - path: app/src/domain/diff.js
      provides: "buildDiff's stepOrderChanged and each step descriptor's movedFrom (a number or null); the header and doc comment corrected to the method array's own order"
    - path: app/src/ui/Method.jsx
      provides: "The ' was step N' span on the pen's closed step, on the pen's open step and in Show changes"
    - path: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
      provides: "Sketch 017's marked panels held against the build: pm-once, pm-twice, pm-removed, pm-open (pen-step-order.html) and so-a, so-read, so-table (step-order-shown.html)"
  key_links:
    - from: app/src/domain/diff.js
      to: app/src/domain/stepNumbers.js
      via: "buildDiff calls keptOrderChanged for stepOrderChanged and movedFromNumbers once per call, read per step through displayNumberOf"
    - from: app/src/domain/stepNumbers.js
      to: app/src/domain/stepNumbers.js
      via: "movedFromNumbers returns an empty Map unless keptOrderChanged(method, baseMethod) is true: one rule for the pen's dirty check and the mark"
    - from: app/src/ui/Method.jsx
      to: app/src/domain/diff.js
      via: "stepDiff.movedFrom from penDiff (the pen) and changeDiff (Show changes), both computed once in app/src/ui/sheetView.js"
    - from: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
      to: .planning/sketches/017-pen-step-order/step-order-shown.html
      via: "a third spec: panels so-a, so-read and so-table"
---

<objective>
Build slice 2 of sketch 017 (the version pen: changing the order of steps): **the mark of a changed order, choice A, the words "was step N"**. Mark's answers of 2026-11-23 are recorded at the top of `.planning/sketches/017-pen-step-order/README.md` and `CONTRACT.md`: decide-p12-pen-order-mark = A; look-p12-pen-step-order = approved; decide-p12-pen-order-scope = order only. This slice closes bug-p11-pen-steps-no-reorder. Slice 1 (quick 261123-ghk: commits 77f51091 and 2e030ce6, gate c5de7f0a, walk baseline 82114a6d) moves the steps in the pen and saves the order.

Authority: the snapshots `pen-step-order.html` and `step-order-shown.html`, markup and inlined CSS. Then CONTRACT.md sections 5 and 6 and README decision 9. The targets are pm-once, pm-twice, pm-removed and pm-open on the pen board, and so-a, so-read and so-table on the Show changes board. pm-moves and pm-table are slice 1's and must still hold. so-built, so-b and so-c are not targets. Purple notes (`.dl-flag`) are not in the app.

The rule (CONTRACT section 5, one rule for the chosen mark):
- Compare the steps that are live in both the version (or the pen's draft) and its parent, each in its own order. That is `keptOrderChanged` in app/src/domain/stepNumbers.js, which slice 1 wrote for the pen's dirty check. When the two orders are the same, nothing is marked, as built. A removal alone marks only the removed step.
- When they differ, every live step whose number differs from its number on the parent is marked with that parent number. A removed step reads as built.
- In the pen the parent is the version the pen opened on (D-03: penDiff is buildDiff(draftVersion, baseline) in app/src/ui/sheetView.js). In Show changes it is the version's own parent (changeDiff, same file).

The mark (choice A): the words " was step N", with a leading space as " removed" has, in a `span.method-step__skipped-label`. It is the type of "removed": 12 px grotesk capitals, weight 500. There is no new CSS rule and no new token; app.css already styles the class. It goes in three places:
1. In the pen, on a closed live step: the last child of `p.method-step__lead`, a sibling after the span holding the step's words. This is where " removed" stands on a removed step.
2. In the pen, on an open step: inside `div.method-step__open-fields`, where " removed" stands on an open removed step.
3. In Show changes: the same place as 1.
There is no mark on the reading page with Show changes off, in Preview step, in the Ingredients table or on the printed sheet. The same words serve the eye and a screen reader: no aria-hidden and no visually-hidden copy.

Expected marks, from the boards (Version 1 reads Steep 1, Strain 2, Rest 3, Sweeten 4, Churn 5, stored keys [1, 2, 4, 3, 5]):
- pm-once, Sweeten up once: Steep, Strain, Sweeten " was step 4", Rest " was step 3", Churn.
- pm-twice, up again: Steep, Sweeten " was step 4", Strain " was step 2", Rest " was step 3", Churn.
- pm-removed, then Rest removed: Steep, Sweeten " was step 4", Strain " was step 2", Rest " removed" with no number, Churn " was step 5". Churn's number changed through the removal, but once the order differs every changed number is marked.
- pm-open, pm-twice with Sweeten open: " was step 4" last inside Sweeten's open fields, under the two fields. Strain and Rest are closed and marked as in pm-twice.
- so-a, the pm-removed state saved as a new version with Show changes on: Steep 1, Sweeten 2 " was step 4", Strain 3 " was step 2", Rest with a struck 3 and " removed", Churn 4 " was step 5".
- so-read, the same version with Show changes off: Steep, Sweeten, Strain, Churn numbered 1 to 4, no mark and no removed step.
- so-table, its Ingredients: step heads "Step 1 Steep" and "Step 2 Sweeten", no mark.

Checked at planning time (HEAD 65aac179, last app/ commit 2e030ce6):
- buildDiff (app/src/domain/diff.js) pairs steps by key and says nothing of place. Its header (line 9) and its doc comment (about line 261) both claim the steps are in ascending key order. Stored versions no longer are: a creation-editor move or a pen move saves the array out of key order.
- Only Method.jsx and app/src/domain/uses.js read buildDiff's step descriptors. uses.js reads them through a Map keyed by n, so a new field breaks no caller. No test deep-equals a whole step descriptor.
- None of the 11 seeded parent and child version pairs has a changed kept order (checked with keptOrderChanged over seed-recipes.js). So no seeded Show changes and no Phase 11 or Phase 12 seeded walk or board gains a mark.
- The pen does not open below 724 (sketch 016). Show changes exists at every width. From 724 up its control is in the band; below 724 it is in the Ingredients head (IngredientsHead in IngredientTable.jsx).
- The reading page passes activeSteps to Method. Show changes and the pen pass the whole method, removed steps included (RecipeSheet.jsx line 96).
- Preview step renders StepReading (app/src/ui/StepReading.jsx), which reads no diff. The printed sheet reads no comparison (PrintSheet.jsx, PrintSheetPages.jsx). Neither file changes.

States the boards do not draw, and what this plan builds in each. None is a new design. The SUMMARY lists them for the orchestrator.
1. An open step with targets. CONTRACT section 5 says the span "stands last inside div.method-step__open-fields, under the two fields: where 'removed' stands on an open removed step." With targets these two disagree: " removed" stands after the two fields and the parent's struck words, and before the line of target chips, which is also inside open-fields. Coffee has no targets, so the board cannot show which is meant. Built: where " removed" stands, the nearest precedent. It sits after the fields and any struck words and before the chips line. Listed for the orchestrator.
2. A moved step whose words also changed (README "Not settled"). Closed and in Show changes, the new words stand in the lead with " was step N" after them, and the parent's struck words stand beneath as built. Open, the span follows the struck words. Not drawn together.
3. A step live in the draft but removed in the parent (removed in the opened version, then restored in the pen), or a step the parent does not hold. It has no parent number, so it is never marked, even when the order changed.
4. A removal and a move whose effects cancel, so a step's number is the same as on the parent. Not marked: the rule marks a changed number.
5. The pen opened on a version whose own order differs from its parent's. The pen compares with the version it opened on, so nothing is marked until a move. Show changes on that version marks against its own parent.
6. Show changes below 724, down to 393. The same span is inline after the words and wraps with the line. The boards are 1366 only.
7. One live step, or every step removed: no order can differ, so there is no mark.
8. pm-removed draws the removed step's number cell 0 wide, before 261123-ghg (dc03ad5c) gave it one figure's width. In the app that cell is 12 x 23 in WebKit and 11.1 x 24 in Chrome. The removed step's body starts that much to the right. Its li is 4 px taller than the board draws (88, as a live step), so Churn under it sits 4 px lower. The gate allows exactly this and nothing else. The designer may redraw pm-removed from the built page.
If the executor finds the snapshots and the contract disagree anywhere else, or meets a state not listed here, it stops that point and reports it. It does not invent a design.

Out of scope, do not build: any CSS or token, choice B's struck margin number or its visually hidden copy, any mark in IngredientTable.jsx, StepReading.jsx or the print files, any change to the store, draft.js, penDraft.js or the walk baseline, the move keys in the pen, Add step in the pen, and any words other than " was step N".

Purpose: a maker who reorders a later version's steps sees, in the pen as they move and later in Show changes, which steps took new numbers and what each was called on the parent. A batch note or a printed sheet that says "step 4" can then still be followed.
Output: movedFromNumbers; buildDiff's stepOrderChanged and movedFrom; the span at three places in Method.jsx; tests first; the gate holding seven 017 panels; the SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/sketches/017-pen-step-order/README.md
@.planning/sketches/017-pen-step-order/CONTRACT.md
@.planning/quick/261123-ghk-step-order-in-the-next-version-pen-mark-answered-bug-p11-pen/261123-ghk-SUMMARY.md
@app/src/domain/stepNumbers.js
@app/src/domain/diff.js

Line numbers were read at HEAD 65aac179. Find each region by its content.

Read these ranges only:
- app/src/ui/Method.jsx: 226-282 (the open branch: the open fields, the struck words beneath, the " removed" span at about line 280, then the target chips line), 512-535 (the closed branch's lead, about line 526), 844-913 (the developing map: stepDiff from activeDiff), 915-968 (the Show changes branch's lead, about line 962), 993-1016 (the reading branch, which stays unmarked).
- app/src/domain/stepNumbers.test.js: 120-161 (the keptOrderChanged describe and its `method(...)` helper, where '4r' is key 4 removed).
- app/src/domain/diff.test.js: 1-35 (the olive oil fixture: clone, findStep; ten steps, keys 1 to 10 ascending) and 529-552 (the never-mutates describe).
- app/src/ui/RecipePage.stepOrder.test.jsx: 1-203 (the setup, helpers press, order, numbers, stepHeads, storeCoffee and openPen) and 302-330 (T5, the save and the child page).
- app/src/ui/Method.preview.test.jsx: 1-135 (the stateful mount, whose step 1 carries a target, and press).
- app/src/ui/Method.test.jsx: 1-20 (node environment, renderToStaticMarkup) and 1276-1330 (makeThreeStepVersion, renderOpenStepPenBody) and 551-575 (a Show changes case).
- app/src/ui/sheetView.js: 60-82 (changeDiff and penDiff).
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs: the whole file (329 lines; slice 1's 017 spec is lines 148-216 and 287-329).
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs: 52-110 (spec, panel, checks; `size` is width and height only, `text` is normalised textContent; a cropped panel needs an anchor matching once on each side).
- .planning/canvas-generators/p12pm-capture.mjs: lines 83-89 (Save as new version, waiting for the address to change, then Show changes and Hide changes in the band).
- The snapshots are long single lines. Read panel markup with a short script (python3 -I or node) that prints the text around `data-pid="..."`, never with Read. The panels are `.fp-win.g2w-1366[data-pid=...]`. Every target panel is a crop (no `.shell`): the pen and Show changes panels anchor on `.method-region`, and pm-table and so-table on `.ingredient-table-region`.

Interfaces this plan creates (the names and shapes are fixed):
- app/src/domain/stepNumbers.js: `export function movedFromNumbers(method, baseMethod)`. It returns a Map from a stored key n to that step's number on baseMethod. It holds only steps that are live in method, have a number in baseMethod, and have a number in method that differs from it. It returns an empty Map when keptOrderChanged(method, baseMethod) is false. Entries come in method's own order. The numbers come from displayNumbers on each array and are read through displayNumberOf. It never mutates or sorts either array.
- app/src/domain/diff.js: buildDiff's return gains `stepOrderChanged`, which is keptOrderChanged(current.method, baseline.method), beside `steps`. Every step descriptor, including the no-baseline-step shape, gains `movedFrom`: displayNumberOf(the Map, step.n), a number or null. The Map is built once per buildDiff call, not once per step. diff.js imports keptOrderChanged, movedFromNumbers and displayNumberOf from './stepNumbers.js', which imports nothing, so there is no cycle.
- app/src/ui/Method.jsx: when `stepDiff.movedFrom != null`, a `span` with className `method-step__skipped-label` and one text child, the template string of a space, the words was step, a space and the number. It renders as " was step 4". The `!= null` test keeps a hand-built stepDiff without the field (older tests) unmarked. Draw it through one small module-level function beside StepPenBody, used at the three places. That function is the only new helper.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The pen's closed steps say "was step N" as the maker moves them, end to end: movedFromNumbers, buildDiff, Method</name>
  <files>app/src/domain/stepNumbers.test.js, app/src/domain/diff.test.js, app/src/ui/RecipePage.stepOrder.test.jsx, app/src/domain/stepNumbers.js, app/src/domain/diff.js, app/src/ui/Method.jsx</files>
  <behavior>
    stepNumbers.test.js, a new describe 'movedFromNumbers (sketch 017 CONTRACT section 5)'. It defines the same one-line `method(...)` helper as the keptOrderChanged describe, where a string such as '4r' is that key removed. Each expectation is `Array.from(result.entries())`:
    - M1: equal arrays give [] (an empty Map). So does method(1, 2, 3, 5, '4r') against method(1, 2, 3, '4r', 5), a step removed in both, passed over and back.
    - M2, a removal alone: method(1, 2, '4r', 3, 5) against method(1, 2, 4, 3, 5) gives [], although Sweeten's and Churn's numbers changed.
    - M3, pm-once: method(1, 2, 3, 4, 5) against method(1, 2, 4, 3, 5) gives [[3, 4], [4, 3]].
    - M4, pm-twice: method(1, 3, 2, 4, 5) against method(1, 2, 4, 3, 5) gives [[3, 4], [2, 2], [4, 3]].
    - M5, pm-removed: method(1, 3, 2, '4r', 5) against method(1, 2, 4, 3, 5) gives [[3, 4], [2, 2], [5, 5]].
    - M6, a step live here and removed in the base has no parent number: method(3, 1, 2) against method(1, '2r', 3) gives [[3, 2], [1, 1]].
    - M7, a step the base does not hold: method(9, 2, 1) against method(1, 2) gives [[1, 1]].
    - M8: neither argument is mutated (structuredClone before, toEqual after).
    diff.test.js, a new describe 'buildDiff — step order (sketch 017 CONTRACT sections 5 and 7)', on the olive oil clone (keys 1 to 10 ascending). Use toBe(false), toBe(true) and toBeNull(), never a truthiness matcher, so the red run fails on the missing fields:
    - D1, identity: stepOrderChanged is false and every descriptor's movedFrom is null.
    - D2, swap the steps at indexes 3 and 4 of current.method (keys 4 and 5). stepOrderChanged is true. The descriptors' n read [1, 2, 3, 5, 4, 6, 7, 8, 9, 10] (current.method's own order). Key 5's movedFrom is 5 and key 4's is 4; every other is null. Every descriptor's textChanged, usesChanged and removedChanged is false, and every row descriptor is unchanged from identity (a move alone changes nothing else).
    - D3, a removal alone (key 3 removed): stepOrderChanged is false and every movedFrom is null, although keys 4 to 10 have new numbers.
    - D4, a removal and a move: key 3 removed and key 10 moved to the front. stepOrderChanged is true. movedFrom is 10 for key 10, 1 for key 1 and 2 for key 2. It is null for key 3 (removed) and for keys 4 to 9, whose numbers are unchanged because the removal and the move cancel.
    - D5: buildDiff with a moved current leaves both versions deep-equal to their clones.
    - The existing case in 'buildDiff — never mutates, never reorders' that asserts ascending n is left as it is: it holds for its own fixture. D2 pins the general rule.
    RecipePage.stepOrder.test.jsx, a new describe 'the pen marks a step whose number changed with its number on the opened version (sketch 017 CONTRACT section 5, slice 2)'. It uses slice 1's storeCoffee and openPen. A helper `marks(tab)` maps each `ol.method-steps > li` in DOM order to the joined textContent of its `.method-step__lead span.method-step__skipped-label` elements, or '' when there are none.
    - W1, the tracer: on the opened pen, `.method-region` holds no span.method-step__skipped-label. Pressing 'Step 4, move up' makes marks read ['', '', ' was step 4', ' was step 3', '']. In Sweeten's li the span is `p.method-step__lead`'s lastElementChild, and its previousElementSibling is the span holding `<b>Sweeten.</b>`. Pressing 'Step 3, move up' makes marks read ['', ' was step 4', ' was step 2', ' was step 3', '']. Pressing 'Step 2, move down' and then 'Step 3, move down' (the order is Version 1's again) leaves no span.method-step__skipped-label in the region.
    - W2, removal: (a) on a fresh pen, 'Step 3, remove' (Rest) makes marks read ['', '', ' removed', '', '']: a removal alone marks nothing new. (b) In a new pen, two presses ('Step 4, move up', 'Step 3, move up') and then 'Step 4, remove' (Rest) make marks read ['', ' was step 4', ' was step 2', ' removed', ' was step 5'], and numbers read ['1', '2', '3', '', '4']. Then Rest's Restore (the control whose aria-label ends ', restore' in Rest's li) brings back pm-twice's marks: ['', ' was step 4', ' was step 2', ' was step 3', ''].
    - Red before the change: M1 to M8 fail on the missing export, and D1 to D4 fail on the missing fields (D5 may pass as a bound). W1 and W2(b) fail. W2(a) passes as a bound.
  </behavior>
  <action>
Before anything, record BASE as `git rev-parse HEAD` (plan_head_before). Every git diff gate in this plan uses it.

RED. Write the cases of the behavior block: the stepNumbers.test.js describe (add movedFromNumbers to its import), the diff.test.js describe, and the RecipePage.stepOrder.test.jsx describe with its marks helper. The page file's header says the mark "is slice 2's and is not asserted here". Change that one sentence to say that slice 2's describe below asserts it. Each new describe's comment names sketch 017 and the CONTRACT section it pins. Run the three files and record what fails and what passes as a bound. Commit only the three test files, by explicit path: `test: the pen says what number a moved step had`.

GREEN, in this order.
1. app/src/domain/stepNumbers.js: add movedFromNumbers as the interface block gives it, with a doc comment. It is the CONTRACT section 5 rule: an empty Map unless keptOrderChanged is true, then every live step whose number differs from the one it holds on the base, mapped to that base number. A step with no base number is never in it. In keptOrderChanged's doc comment, rewrite the clause that names a future slice's mark so it names movedFromNumbers instead. Change nothing else in the file.
2. app/src/domain/diff.js: in buildDiff, compute `stepOrderChanged` and the Map once. Give every step descriptor `movedFrom`, either by passing the number into buildStepDiff for both of its return shapes or by adding it where buildDiff maps current.method. Choose one and keep both shapes carrying the field. Return `stepOrderChanged` beside `steps`. Correct both comments that claim the step descriptors come in ascending key order: the module header (line 9) and the buildDiff doc comment (about line 261). They now say the descriptors follow current.method's own order, which is the version's step order and need not follow the stored keys, since a step moved in the creation editor or the pen keeps its key (sketch 017 README question 4). Add `stepOrderChanged` and `movedFrom` to the doc comment's return list, one sentence each, citing CONTRACT section 5. Change no other descriptor and no row, figure or total logic.
3. app/src/ui/Method.jsx: add the small module-level function from the interface block beside StepPenBody. It takes the step's diff descriptor and returns the span, or null when movedFrom is null or absent. A short comment cites sketch 017 CONTRACT section 5, choice A (decide-p12-pen-order-mark): the type of "removed", no new rule, and the same words for the eye and a screen reader. In StepPenBody's closed branch, call it inside p.method-step__lead, directly after the line that draws " removed". The two never both render, because a removed step has no number. The open branch and the Show changes branch are Task 2's. Leave them, the reading branch, the margin and every other line as they stand.
Run the verify commands green, then the whole suite (`npm --prefix app test`; if npm hangs inside the worktree, `cd app && npx vitest run`). An existing test that fails only because a reordered fixture now carries the span is a deviation: name it, set its expectation to the approved board, and record it. Commit the three source files by explicit path: `feat: the pen says what number a moved step had`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/domain/stepNumbers.test.js src/domain/diff.test.js src/ui/RecipePage.stepOrder.test.jsx src/ui/Method.test.jsx src/ui/Method.preview.test.jsx src/domain/uses.test.js</automated>
    <automated>grep -c "export function movedFromNumbers" app/src/domain/stepNumbers.js # [HEAD=0 EXPECT==1 @65aac179]</automated>
    <automated>grep -c "movedFromNumbers" app/src/domain/diff.js # [HEAD=0 EXPECT>=2 @65aac179]</automated>
    <automated>grep -c "stepOrderChanged" app/src/domain/diff.js # [HEAD=0 EXPECT>=2 @65aac179]</automated>
    <automated>test "$(grep -c "already ascending" app/src/domain/diff.js)" -eq 0 # [HEAD=2 EXPECT==0 @65aac179]</automated>
    <automated>grep -c "movedFrom" app/src/ui/Method.jsx # [HEAD=0 EXPECT>=1 @65aac179]</automated>
    <automated>git diff --quiet "$BASE" HEAD -- app/src/store app/src/styles app/src/domain/draft.js app/src/domain/penDraft.js app/src/ui/StepReading.jsx app/src/ui/IngredientTable.jsx app/src/ui/PrintSheet.jsx app/src/ui/PrintSheetPages.jsx app/src/ui/PrintLogPages.jsx .planning/phases/11-steps-structure-save-and-print</automated>
  </verify>
  <done>M1 to M8, D1 to D4, W1 and W2(b) failed before the change and pass after it, and W2(a) holds as a bound. In the pen, a closed live step whose number changed with the order reads " was step N" after its words, moving back clears it, and a removal alone marks nothing new. buildDiff reports stepOrderChanged and movedFrom, and its comments describe the method's own order. No store, style, draft, print, reading or table file changed. Two commits, red then green, each staged by explicit path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The open step and Show changes carry the mark; the reading page, Preview step, the table and the moved-and-rewritten step read as drawn</name>
  <files>app/src/ui/RecipePage.stepOrder.test.jsx, app/src/ui/Method.preview.test.jsx, app/src/ui/Method.test.jsx, app/src/ui/Method.jsx</files>
  <behavior>
    RecipePage.stepOrder.test.jsx, in Task 1's describe:
    - W3, the open step (pm-open): two presses, then 'Step 2, edit this step' (Sweeten). Sweeten's li holds no p.method-step__lead. Its `.method-step__open-fields` lastElementChild is a span.method-step__skipped-label reading ' was step 4', and that span's previousElementSibling is the label holding the textarea named 'Step 2, instruction'. marks reads ['', '', ' was step 2', ' was step 3', ''] (Sweeten's mark is in its fields, not a lead). Pressing 'Step 2, Preview step' draws `.mk-preview`, whose textContent does not match /was step/i. Pressing the open step's Cancel (`.method-step__done-cancel` button reading Cancel) closes Sweeten at place 2, and marks reads pm-twice's ['', ' was step 4', ' was step 2', ' was step 3', ''].
    - W4, saved and Show changes (so-a, so-read, so-table): two presses, 'Step 4, remove', 'sweeten warm' typed into Version name, Save as new version, settle until the address changes and the pen is gone (T5's pattern). Show changes is off. order reads ['Steep', 'Sweeten', 'Strain', 'Churn'], numbers ['1', '2', '3', '4'], and the `.method-region` textContent does not match /was step/i. stepHeads reads ['Step 1Steep', 'Step 2Sweeten']. Press the button reading 'Show changes'. order reads ['Steep', 'Sweeten', 'Strain', 'Rest', 'Churn'], numbers ['1', '2', '3', '3', '4'], and Rest's `.method-step__n` carries method-step__n--struck. marks reads ['', ' was step 4', ' was step 2', ' removed', ' was step 5']. stepHeads is unchanged, and `.ingredient-table-region` holds no span.method-step__skipped-label. Press 'Hide changes', and the region's textContent again does not match /was step/i. Then Next version on this child opens a pen whose region holds no ' was step' span: the pen compares with the version it opened on (undrawn state 5).
    Method.preview.test.jsx (jsdom, its stateful mount):
    - P1, an open step with targets (undrawn state 1): mount gains one option, `swapFirstTwo`, which puts the initial draft's first two steps in the order [2, 1, 3]. With it, 'Step 2, edit this step' opens key 1, which carries the target 'Heat to 82 C'. Inside its `.method-step__open-fields` there is exactly one span.method-step__skipped-label, reading ' was step 1'. It comes after the label holding the textarea named 'Step 2, instruction' and before the `p.method-step__targets` that holds the `.target-chip`, compared with compareDocumentPosition. The closed key 2 at place 1 reads ' was step 2' in its lead.
    - P2: in the same state, pressing 'Step 2, Preview step' draws `.mk-preview`, whose textContent does not match /was step/i.
    - P3: without the option, opening 'Step 1, edit this step' draws no span.method-step__skipped-label in the container.
    Method.test.jsx (node, renderToStaticMarkup), a new describe "Method — the 'was step N' mark (sketch 017 CONTRACT section 5, choice A)", over makeThreeStepVersion. The child is a structuredClone with method reordered to keys [2, 1, 3] and key 2's instruction changed to 'Do two again.' (undrawn state 2):
    - S1, Show changes (mode 'reading', showingChanges, changeDiff = buildDiff(child, parent), steps = child.method, currentStepNumbers and baselineStepNumbers from displayNumbers of each). The markup contains, exactly, `<p class="method-step__lead"><span><b>Lead two.</b> Do two again.</span><span class="method-step__skipped-label"> was step 2</span></p><p class="prose-struck-beneath"><b>Lead two.</b> Do two.</p>`. Key 1's lead ends with `<span class="method-step__skipped-label"> was step 1</span></p>`. The markup contains ' was step' exactly twice. If renderToStaticMarkup's real output differs only by how React joins the text, match the real output and record it.
    - S2: the same child with showingChanges false (the reading state), and again in mode 'recording': neither markup contains 'was step'.
    - S3, the pen's closed step (mode 'developing', draftVersion = child, baselineVersion = parent, penDiff = buildDiff(child, parent), steps = parent.method): the same lead-then-struck-words sequence as S1 for key 2.
    - Red before the change: W3, W4, P1 and S1 fail. P2, P3, S2 and S3 pass: P2, P3 and S2 as bounds, and S3 as a pin of Task 1's closed branch.
  </behavior>
  <action>
RED. Add W3 and W4 to RecipePage.stepOrder.test.jsx, the `swapFirstTwo` mount option and P1 to P3 to Method.preview.test.jsx, and the S1 to S3 describe to Method.test.jsx, as the behavior block gives them. The mount option is the only change to that file's harness; every existing case keeps its own mount call. Run the three files and record what fails and what passes as a bound or a pin. Commit only those three test files, by explicit path: `test: the open step and Show changes say what number a moved step had`.

GREEN, in app/src/ui/Method.jsx only.
1. In StepPenBody's open branch, call Task 1's function inside div.method-step__open-fields, directly after the line that draws " removed" there. That puts it after the two fields and the parent's struck words, and before the target chips line. Add a comment citing CONTRACT section 5: under the two fields, where " removed" stands on an open removed step. With targets the span stands before the chips, which is the nearest precedent, because the board draws no step with targets (undrawn state 1; listed for the orchestrator).
2. In Method's Show changes branch, call it inside p.method-step__lead, directly after the line that draws " removed" there.
3. Nothing else changes. The reading branch, the batch pen, StepReading (Preview step), the margin, IngredientTable and the print files stay unmarked (CONTRACT sections 5 and 6).
Run the verify commands green, then the whole suite. Commit Method.jsx by explicit path: `feat: the open step and Show changes say what number a moved step had`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/RecipePage.stepOrder.test.jsx src/ui/Method.preview.test.jsx src/ui/Method.test.jsx src/ui/RecipeSheet.test.jsx src/ui/RecipePage.perStep.test.jsx src/ui/StepReading.test.jsx src/ui/PrintSheet.test.jsx src/ui/tabindex-scan.test.js</automated>
    <automated>grep -c "swapFirstTwo" app/src/ui/Method.preview.test.jsx # [HEAD=0 EXPECT>=2 @65aac179]</automated>
    <automated>grep -c "was step" app/src/ui/Method.test.jsx # [HEAD=0 EXPECT>=3 @65aac179]</automated>
    <automated>git diff --quiet "$BASE" HEAD -- app/src/store app/src/styles app/src/domain/draft.js app/src/domain/penDraft.js app/src/ui/StepReading.jsx app/src/ui/IngredientTable.jsx app/src/ui/PrintSheet.jsx app/src/ui/PrintSheetPages.jsx app/src/ui/PrintLogPages.jsx app/src/ui/RecipeSheet.jsx app/src/ui/sheetView.js .planning/phases/11-steps-structure-save-and-print</automated>
  </verify>
  <done>W3, W4, P1 and S1 failed before the change and pass after it. P2, P3 and S2 hold as bounds and S3 as a pin. The open step's " was step N" stands where " removed" stands, before any target chips. Show changes marks against the parent, with the removed step as built. The reading page, Preview step, the Ingredients table and a pen opened on the reordered child carry no mark. Two commits, red then green, each staged by explicit path.</done>
</task>

<task type="auto">
  <name>Task 3: The gate holds sketch 017's marked panels; side by side in WebKit and Chrome; the Phase 11 walk untouched; the full suite, GATE2 and the SUMMARY</name>
  <files>.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs, .planning/quick/261123-iqe-next-version-pen-step-order-slice-2-a-mo/261123-iqe-SUMMARY.md</files>
  <action>
PHASE12 is .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo, PHASE11 is .planning/phases/11-steps-structure-save-and-print, and S is "${TMPDIR:-/tmp}/sprinkles-iqe". Run the steps in this order. If any step finds an app defect, fix it with a test first, then redo every later step.

1. The full suite: `npm --prefix app test` (or `cd app && npx vitest run`). It must pass: 138 files and 4668 tests before this plan, plus this plan's new cases, in the same 138 files.

2. 12-board-penpreview.mjs (slice 1's spec shapes, helpers and flows kept as they are):
   - pm-once and pm-twice: the existing panels steporder-pm-once-focus and steporder-pm-twice-focus keep their labels and their focus element. Each gains `p.method-step__lead` (count, text, box, font) and `span.method-step__skipped-label` (count, text, box, font).
   - A new panel steporder-pm-removed (pid pm-removed), from stepOrderPressed('Step 4, move up', 'Step 3, move up', 'Step 4, remove'). Every text and attribute check is kept on every step. Box checks stand only on the three steps above the removed one, so the gate allows exactly undrawn state 8 and nothing more. Elements: `li.method-step` (count); `li.method-step:nth-child(-n+3)` (count, box); `.method-step__n` (count, text); `li.method-step:nth-child(-n+3) .method-step__n` (count, box); `p.method-step__lead` (count, text, font); `li.method-step:nth-child(-n+3) p.method-step__lead` (count, box); `span.method-step__skipped-label` (count, text, font, size); `p.method-step__acts button` (count, text, { attr: 'aria-label' }, { attr: 'aria-disabled' }); `li.method-step:nth-child(-n+3) p.method-step__acts button` (count, box). Absent: `[aria-keyshortcuts]`, `.mk-keys`. A comment states the allowance: the removed step's number cell, one figure wide since dc03ad5c (261123-ghg), where the board draws it 0 wide; its body 12 px right (11.1 in Chrome); its li 4 px taller, so Churn sits 4 px lower.
   - A new panel steporder-pm-open (pid pm-open), from stepOrderPressed('Step 4, move up', 'Step 3, move up', 'Step 2, edit this step'). If 300 ms is not enough, the flow also waits for `.method-step__open-fields`. Elements: `li.method-step` (count, box); `.method-step__n` (count, text, box); `p.method-step__lead` (count, text, box, font); `span.method-step__skipped-label` (count, text, box, font); `.method-step__open-fields textarea` (count, value, { attr: 'aria-label' }, box); `p.method-step__acts button` (count, text, { attr: 'aria-label' }, { attr: 'aria-disabled' }, box); `p.method-step__uses-line` (count, text, box); `p.method-step__done-cancel` (count, box). Absent: `[aria-keyshortcuts]`, `.mk-keys`, `.mk-preview`.
   - A third spec in the default export array, board '.planning/sketches/017-pen-step-order/step-order-shown.html' (a new STEP_ORDER_SHOWN_BOARD constant), through penPanel. Its flow `savedStepOrder(showChanges)` runs stepOrderPressed('Step 4, move up', 'Step 3, move up', 'Step 4, remove'). It notes the pathname, clicks `.notebook-ceremony__actions button` reading Save as new version, and waits until the pathname differs, `.notebook-version` is drawn and no `.notebook-ceremony` remains, then 900 ms. When showChanges is true, it clicks the first button reading Show changes and waits for `.method-step__n--struck` (p12pm-capture.mjs lines 85-88 are the model). Panels:
     - steporder-so-a (pid so-a, Show changes on, anchor '.method-region'): `li.method-step` (count, box); `.method-step__n` (count, text, { attr: 'class' }, box); `p.method-step__lead` (count, text, box, font); `span.method-step__skipped-label` (count, text, box, font); `.method-step__prose--struck` (count, text, box). Absent: `.method-step__n-from`, which is choice B's.
     - steporder-so-read (pid so-read, Show changes off, anchor '.method-region'): `li.method-step` (count, box); `.method-step__n` (count, text, box); `p.method-step__lead` (count, text, box, font). Absent: `.method-step__skipped-label`, `.method-step__prose--struck`, `.method-step__n-from`.
     - steporder-so-table (pid so-table, Show changes off, anchor '.ingredient-table-region'): `tr.ingredient-table__step-head` (count, text, box); `tbody tr[aria-label]` (count, { attr: 'aria-label' }, box). Absent: `.method-step__skipped-label`.
   - Update the header comment: slice 2 (quick 261123-iqe) holds the leads of pm-once and pm-twice, pm-removed with its stated allowance, pm-open, and step-order-shown.html's so-a, so-read and so-table, with every check kind kept. Rewrite the sentence that says pm-removed and pm-open are not held. Change nothing in the Preview step spec.

3. Scratch build and board runs. Build once with `npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir`. Never write app/dist, never start a dev or preview server, leave port 4173 alone, and never run two builds at once.
   - WebKit: `PROBE_DIST="$S/dist" node PHASE12/12-board-check.mjs PHASE12/12-board-penpreview.mjs --selftest --evidence "$S/evidence-webkit"`. Every panel must PASS, with its PASS selftest line.
   - Chrome: write "$S/chrome-shim.mjs". It imports playwright-core from 12-board-check.mjs's default PLAYWRIGHT_CORE path and exports `webkit` as an object whose launch(options) calls chromium.launch with those options plus executablePath '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' and headless true. Run the same command with PLAYWRIGHT_CORE="$S/chrome-shim.mjs" and --evidence "$S/evidence-chrome". If the engine will not run in Chrome, say why in the SUMMARY and hold the panels in the side-by-side script instead.

4. Side by side, scratch, never in the repo: "$S/side-by-side.mjs". It serves "$S/dist" through PHASE12/../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs startServers, imported by absolute path, and aborts every request off 127.0.0.1. In WebKit (coarse pointer, hasTouch) and in Chrome, at 1366 x 1024, it replays step 2's flows and reads pm-moves, pm-once, pm-twice, pm-removed, pm-open, pm-table, so-a, so-read and so-table. For each li, `.method-step__n`, `p.method-step__lead`, `span.method-step__skipped-label`, open-fields child and acts button, it prints x and y from the anchor's top-left, width, height, textContent, aria-label and class. It reads the same from the board's own panel (the snapshot opened as a file) and prints every difference above 1 px or in text. The expected differences are undrawn state 8 on pm-removed and the method region's own height (a stretched grid item, as slice 1 found). Anything else is a finding. It also:
   - checks the " was step 4" span on pm-once is near 80.8 x 14.1 and on the step's own line, and that pm-once's and pm-twice's li heights match pm-moves' (a marked step keeps its height);
   - checks the open Sweeten on pm-open is the board's height, since slice 1's 18 px (17 in Chrome) gap closes with the span;
   - checks scrollWidth is not above innerWidth on every panel;
   - presses 'Step 2, Preview step' in the pm-open state and confirms `.mk-preview`'s innerText does not match /was step/i (innerText applies the capitals, so match case-insensitively);
   - opens the saved child's print page (its address plus '/print') and confirms the steps in the saved order with no /was step/i anywhere in `#root`'s innerText.

5. The Phase 11 walk: `sh PHASE11/11-walk-check.sh`. It must print a line starting "MATCH 94 snapshots" against the baseline slice 1 set (BASE=2e030ce6). The walk never presses Move, so it must not change. If it does not match, stop here. Do not edit any walk file. Record its DIFF lines in the SUMMARY and report it as the result of this task.

6. The gate: run `sh PHASE12/12-check.sh` once, in the background, after step 5, and wait for it. It must end GATE2 PASS. If a step this plan does not touch fails (sim, pdf, print, roundtrip, stops, phone, band), record its output, rerun steps 3 and 5 on their own, report it, and do not edit that step.

7. Write the SUMMARY (frontmatter as slice 1's, with plan_head_before and plan_head_after) with:
   - what was built, the rule, and the marks per panel, word for word from this plan's objective;
   - red then green for Tasks 1 and 2, the bounds and the pin, and the suite counts before and after;
   - the gate changes and why, with PASS and FAIL counts per panel in WebKit and Chrome and the evidence folders;
   - the side-by-side table, board against app, in both engines, with the expected differences named;
   - the walk's MATCH line (baseline untouched) and the 12-check.sh result;
   - the undrawn states 1 to 8 and what the build does in each;
   - the line "Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad";
   - a "For the orchestrator" section. The executor has no ArtifactData. bug-p11-pen-steps-no-reorder and decide-p12-pen-order-mark are built and can be closed once this lands. Undrawn state 1 (the open step with targets) is built at the nearest precedent and is Sid's to draw or confirm, along with the stale pm-removed number cell (state 8). A dist built from these commits is safe to deploy once the suite and GATE2 pass: no store write and no shape change.
   Commit 12-board-penpreview.mjs by explicit path: `chore: the phase 12 gate holds the "was step" words against sketch 017`. Commit the SUMMARY last, by explicit path: `docs: summary for the "was step" words in the Next version pen`.

Executor rules for this whole plan:
- Tests come first: a failing test commit before each change commit. Bounds and pins are named as such.
- Stage explicit paths only. Never use `git add -A` or `git add .`. Never stage anything under .planning/sketches or .planning/canvas-generators.
- Never write app/dist, never start a second Vite process, and leave port 4173 alone.
- Do not touch .planning/state.json or .planning/STATE.md.
- Commit messages are plain English.
- Changes are surgical: no CSS, no token, no new words beyond " was step N", and nothing in the store, the draft shape, IngredientTable.jsx, StepReading.jsx, the print files or the Phase 11 walk files.
  </action>
  <verify>
    <automated>grep -c "017-pen-step-order/step-order-shown.html" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs # [HEAD=0 EXPECT==1 @65aac179]</automated>
    <automated>grep -c -E "steporder-(pm-removed|pm-open|so-a|so-read|so-table)'" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs # [HEAD=0 EXPECT==5 @65aac179]</automated>
    <automated>grep -c "span.method-step__skipped-label" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs # [HEAD=0 EXPECT>=5 @65aac179]</automated>
    <automated>git diff --quiet "$BASE" HEAD -- .planning/phases/11-steps-structure-save-and-print</automated>
    <automated>sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh</automated>
    <automated>npm --prefix app test</automated>
    <automated>sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh</automated>
    <automated>grep -c "Device-unverified" .planning/quick/261123-iqe-next-version-pen-step-order-slice-2-a-mo/261123-iqe-SUMMARY.md # [HEAD=error:2 EXPECT>=1 @65aac179]</automated>
  </verify>
  <done>The 017 spec holds pm-once and pm-twice's leads and pm-removed (with only the stated allowance), pm-open, so-a, so-read and so-table, with every check kind kept, in WebKit and Chrome, alongside pm-moves, the focus panels, pm-table and the Preview step spec. The side by side shows only the named differences. Preview step and the printed sheet carry no mark. 11-walk-check prints MATCH 94 snapshots with the walk files untouched. The full suite passes and 12-check.sh ends GATE2 PASS, or the SUMMARY names an untouched step that stopped it, with its output. The SUMMARY is committed last.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema is involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored or imported version to the page | a version's method (possibly from an imported backup or a kept pen draft) drives the numbers buildDiff compares and the words Method draws |
| gate to future plans | 12-board-penpreview.mjs and the Phase 11 walk are the regression proof for later work; an allowance that is too wide can hide a defect |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-iqe-01 | Spoofing (misleading words) | movedFromNumbers, buildDiff movedFrom, Method's span | medium | mitigate | One rule from keptOrderChanged. Domain cases M1 to M8 and D1 to D4 pin a removal alone, the cancelling case, a step with no parent number and the board's own four states. Page cases W1 to W4 pin the pen, the open step and Show changes against the boards' words |
| T-iqe-02 | Tampering (markup from stored data) | Method's span | low | mitigate | movedFrom is a number computed from array positions, never a stored string, and renders as one React text child. No dangerouslySetInnerHTML (project convention) |
| T-iqe-03 | Denial of service | buildDiff over an imported method | low | accept | displayNumbers and keptOrderChanged are linear and total over any array of steps. transfer.js already validates each step on import, and this plan changes no import path |
| T-iqe-04 | Tampering (gate) | 12-board-penpreview.mjs pm-removed allowance | medium | mitigate | Box checks are dropped only below the third step of pm-removed. Every count, text, font, aria and size check stays on every step. The SUMMARY's side by side names the only expected differences |
| T-iqe-05 | Tampering (gate) | Phase 11 walk baseline | high | mitigate | This plan never edits a walk file (git diff gate). 11-walk-check must print MATCH 94 snapshots against slice 1's baseline, or the executor stops and reports |
| T-iqe-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- Tasks 1 and 2 each land a failing test commit before their change commit. Bounds and the pin are named.
- `npm --prefix app test` passes: 138 files and 4668 tests before, plus this plan's cases.
- The board engine over 12-board-penpreview.mjs with --selftest passes in WebKit and in Chrome (the shim).
- 11-walk-check.sh prints MATCH 94 snapshots against the untouched baseline.
- 12-check.sh ends GATE2 PASS.
</verification>

<success_criteria>
- In the Next version pen, a closed or open step whose number changed with the order says " was step N" at once, in the type of "removed", and moving back clears it. A removal alone marks nothing new.
- Show changes on the saved version marks the same steps against its parent. The reading page, Preview step, the Ingredients table and the printed sheet carry no mark.
- buildDiff reports stepOrderChanged and each step's movedFrom from the one rule. No stored shape, DB_VERSION or draft shape change, no CSS or token, no words beyond " was step N".
- The gate holds the seven marked 017 panels in WebKit and Chrome, the walk still matches, and everything is recorded as device-unverified.
</success_criteria>

<output>
Create `.planning/quick/261123-iqe-next-version-pen-step-order-slice-2-a-mo/261123-iqe-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
