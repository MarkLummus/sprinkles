---
phase: quick-261123-ghk
plan: 01
type: execute
wave: 3
depends_on: ["261123-ghf", "261123-ghg", "261123-ghh", "261123-ghi"]
files_modified:
  - app/src/ui/StepMoves.jsx
  - app/src/ui/useAnnouncer.js
  - app/src/ui/Method.jsx
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/useVersionPen.js
  - app/src/ui/CreationSteps.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/domain/stepNumbers.js
  - app/src/domain/stepNumbers.test.js
  - app/src/domain/penDraft.js
  - app/src/domain/penDraft.test.js
  - app/src/store/pen-step-roundtrip.test.js
  - app/src/ui/RecipePage.stepOrder.test.jsx
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
  - .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh
  - .planning/phases/11-steps-structure-save-and-print/11-walk-before.json
  - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
  - .planning/quick/261123-ghk-step-order-in-the-next-version-pen-mark-answered-bug-p11-pen/261123-ghk-SUMMARY.md
autonomous: true
requirements: [bug-p11-pen-steps-no-reorder, decide-p12-pen-order-scope, look-p12-pen-step-order]

must_haves:
  truths:
    - "In the Next version pen at 724 and up, every closed live step's p.method-step__acts reads Edit this step · Move up · Move down · Remove, named 'Step N, edit this step', 'Step N, move up', 'Step N, move down', 'Step N, remove' with N the step's number in the draft's order; the first live step's Move up and the last live step's Move down carry mk-off and aria-disabled='true', stay Tab stops and do nothing; a removed step reads Edit this step · Restore; an open step ends Cancel · Done; the pen carries no aria-keyshortcuts and no keys line (sketch 017 CONTRACT section 2, README decisions 2 to 7 and 11)"
    - "A press moves the step one place among the live steps, passing a removed step in the same press; no stored step key changes; the margin numbers, every control's name and the Ingredients table's step heads follow at once (CONTRACT section 3)"
    - "Focus stays on the pressed Move button of the moved step, or goes to that step's other Move button when the pressed one turns grey; 'Step N of M' (the place among the live steps, of their count) is announced in a polite region; a grey press moves nothing and announces nothing (CONTRACT section 3, README decision 5)"
    - "A changed order is unsaved work: the kept draft is written and Escape leaves the pen open; moving the steps back to the opened version's order leaves no change; a kept draft with a new order restores on reload; Save as new version and Save over this version store the method array in the new order; a backup holding it exports, passes validateStoreFile and imports (CONTRACT sections 4 and 7)"
    - "The creation editor's Move buttons, focus rule, announcement and announced words are one copy the pen also uses (app/src/ui/StepMoves.jsx, useStructureWord in app/src/ui/useAnnouncer.js), and the creation editor behaves exactly as before"
    - "No stored shape change, no DB_VERSION change, no DRAFT_SHAPE_VERSION change, no new on-screen words beyond the creation editor's own, every button through Button.jsx; the full suite passes; 12-check.sh ends GATE2 PASS with the Phase 11 walk baseline moved only by the traced Move up and Move down pairs"
  artifacts:
    - path: app/src/ui/StepMoves.jsx
      provides: "StepMoveButtons, stepMoveWord and moveFocusTarget: the creation editor's Move buttons, announced words and focus rule, shared by the creation editor and the pen"
    - path: app/src/ui/useAnnouncer.js
      provides: "useStructureWord: the creation editor's polite structure word (emptied, then written on the next frame), shared"
    - path: app/src/domain/stepNumbers.js
      provides: "keptOrderChanged(method, baseMethod): whether the steps live in both stand in a different order (CONTRACT section 5's comparison)"
    - path: app/src/ui/Method.jsx
      provides: "The pen draws its steps in the draft's order, with Move up and Move down on each closed live step, the focus rule and the polite region"
    - path: app/src/ui/RecipePage.stepOrder.test.jsx
      provides: "The pen's step order end to end over a real fake-indexeddb store: draw, press, focus, word, kept draft, restore, save"
  key_links:
    - from: app/src/ui/Method.jsx
      to: app/src/ui/StepMoves.jsx
      via: "StepMoveButtons on the closed live step; stepMoveWord as the press guard and the announced words; moveFocusTarget after the render that reordered the steps"
    - from: app/src/ui/CreationSteps.jsx
      to: app/src/ui/StepMoves.jsx
      via: "StepMoveButtons with the move keys, replacing its own two Move buttons"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/StepMoves.jsx
      via: "stepMoveWord in handleMoveStep, moveFocusTarget in the step-act focus branch, useStructureWord for every structure word"
    - from: app/src/ui/useVersionPen.js
      to: app/src/domain/creationSteps.js
      via: "handleMovePenStep runs moveStep through versionPen.edit"
    - from: app/src/domain/penDraft.js
      to: app/src/domain/stepNumbers.js
      via: "isPenDraftDirty returns true when keptOrderChanged(penDraft.method, version.method)"
    - from: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
      to: .planning/sketches/017-pen-step-order/pen-step-order.html
      via: "panels pm-moves, pm-once (focus), pm-twice (focus) and pm-table"
---

<objective>
Build the first slice of sketch 017 (the version pen: changing the order of steps): **the Next version pen moves steps and saves the order**. Mark's answers, 2026-11-23, recorded at the top of `.planning/sketches/017-pen-step-order/README.md` and `CONTRACT.md`: bug-p11-pen-steps-no-reorder = fix; decide-p12-pen-order-scope = order only (no Add step, no ingredient changes step); look-p12-pen-step-order = approved, no move keys in the pen; decide-p12-pen-order-mark = A, the words "was step N". Authority: the snapshots `pen-step-order.html` and `step-order-shown.html`, markup and CSS, then CONTRACT.md sections 1 to 7; README decisions 1 to 11 (approved by those answers; lines that still say "not approved" predate them).

**This item does not fit one quick plan.** It is split in two. This plan is slice 1. Slice 2 is a separate quick plan that depends on this one and builds the mark: `movedFromNumbers` in app/src/domain/stepNumbers.js, buildDiff in app/src/domain/diff.js reporting `stepOrderChanged` and each step's `movedFrom`, the span " was step N" in Method.jsx on the pen's closed and open steps and in Show changes, its tests, and the 017 panels that carry the words (pm-once, pm-twice, pm-removed and pm-open in full, so-a, so-read and so-table). Until slice 2 lands, a moved step carries no words, and Show changes on a reordered version reads as built. Why the split: moving the buttons into the pen moves 32 of the 94 Phase 11 walk baseline snapshots and the Preview step board panel. Re-tracing the walk baseline and re-pointing that panel are the third task here. The domain diff, the three placements of the words and seven board panels do not fit beside them in one plan's three tasks.

What slice 1 builds (CONTRACT sections 1 to 4 and 6 and 7):
1. On each closed live step of the pen, the creation editor's Move up and Move down stand between Edit this step and Remove (README decision 3). They use the same words, the same grey ends (mk-off, aria-disabled, still a Tab stop), the same focus rule and the same announcement, "Step N of M" (README decisions 2, 4 and 5). A removed step offers Edit this step · Restore and no Move. An open step ends Cancel · Done and has no Move (decisions 6 and 7). There are no move keys, no aria-keyshortcuts and no keys line in the pen (decision 11).
2. A press moves the step one place among the live steps, passing a removed step in one press. This is creationSteps.js moveStep, reused unchanged. No stored key changes. The pen draws its steps in the draft's order, so the margin numbers, the controls' names and every sentence that names a step follow (CONTRACT section 3). The Ingredients table already groups the pen's lines through draftVersion.method and sorts them by the draft's numbers (IngredientTable.jsx `stepsForGrouping`), so its step heads follow with no change to IngredientTable.jsx. A test pins it.
3. A changed order is unsaved work (CONTRACT section 4 and README decision 8). The rule is the one CONTRACT section 5 gives for the mark: compare the steps live in both the draft and the opened version, each in its own order. That rule is keptOrderChanged in stepNumbers.js, so slice 2's mark reads the same rule. The kept draft holds the order and restores (draft.js fitsPlanShape asks for the same keys in any order). Both saves store the order (penDraft.js savedMethod maps penDraft.method as it stands). A backup with the new order imports (transfer.js validates each step, not their order).
4. One copy of the logic. The Move buttons, the announced words, the focus rule and the polite structure word move out of CreationSteps.jsx and CreationPage.jsx into app/src/ui/StepMoves.jsx and useStructureWord in app/src/ui/useAnnouncer.js. The pen and the creation editor both read them, and the creation editor's markup and behaviour stay the same.

Designer findings, checked at planning time and not taken on trust:
- Order is the method array's order and nothing stored changes: true. displayNumbers follows the array, moveStep keeps every n, savedMethod saves penDraft.method as it stands, and lineage.js clones penFields.method.
- "Method maps the opened version's steps": true. RecipeSheet passes `version.method` as `steps` while developing, and Method maps `steps`. "RecipeSheet hands the table version.method": true but harmless. In the pen the table groups through `draftVersion.method` and uses `steps` only for the opened version's active rows. No table change.
- isPenDraftDirty misses order: true. It finds each draft step by key and never compares places.
- buildDiff pairs steps by key and says nothing of place: true. It lives in app/src/domain/diff.js, not lineage.js as the batch row says. It is slice 2's.
- A kept draft with a new order restores and a backup imports: true by reading fitsPlanShape and transfer.js. This plan pins both with tests.

States the boards do not draw, and what this plan builds in each (the SUMMARY lists them; none is a new design):
- One live step: both Move buttons are grey (CONTRACT section 2 states it). A press does nothing and announces nothing.
- Every step removed: no Move anywhere. Each step offers Edit this step · Restore, and Restore brings it back live where it stands.
- A moved step whose words also changed: the words read as typed, with the parent's struck words beneath, as built. Its "was step N" is slice 2's.
- Save over this version with a new order, on a version that has a batch: this cannot happen. Save over is not drawn once a version has a batch, handleSaveOverVersion returns, and the store refuses it with VERSION_HAS_BATCH_STATUS. On a version with no batch, Save over stores the new order, and a sheet printed before carries the old numbers (paper cannot change). Save as new version from a version with a batch leaves the batch on the parent. Its step notes are held by step key and read against the parent's order (README question 3).
- A step already removed when the pen opened, with a live step moved past it and back: moveStep puts a moved step at its live neighbour's place, so the struck step ends up after the moved one and not before it. The live order is the opened version's again, so the pen holds no change from the order (the CONTRACT section 5 comparison). The struck step's new place is stored only if the maker saves for another reason. Recommend no row.
- A step open while another step moves past it: it stays open with its words (CONTRACT section 3 states it).
- The board's Move buttons carry no data-act. The built ones carry data-act="move-up" and "move-down" from the shared component, which the shared focus rule reads. This is not visible.
- The pen's polite region is not drawn (it is visually hidden). It stands last in the Instructions section, after the list.
- The removed step's number cell: the 017 board draws it as built, 0 wide. Sibling 261123-ghg (Mark answered Fix it on bug-pen-removed-step-words-shift-left) gives it the number column's width, so a removed step's line sits 12 px right of the board's. The gate does not hold pm-removed (slice 2 holds it, less that cell). The side by side lists the difference.
- A refused Save names the first blank step field in the draft's order (lineage.js walks penFields.method in array order): the order the maker sees, top down.
If the executor finds the snapshots and the contract disagree anywhere else, or meets a state not listed here, it stops that point and reports it. It does not invent a design.

Out of scope, do not build: the "was step N" mark and anything in diff.js (slice 2), Add step in the pen, moving an ingredient's amount to another step, the move keys in the pen, any CSS or token change, any change to IngredientTable.jsx, draft.js, transfer.js, db.js or the store.

Purpose: a maker developing a later version can put its steps in a better order, keep that unsaved work across a reload, and save it, with the same controls they already know from creating a recipe.
Output: the shared StepMoves.jsx and useStructureWord, the pen's Move controls, draft-order drawing and dirty check, plumbing through useVersionPen, RecipePage and RecipeSheet, tests, the gate held against sketch 017, the Phase 11 walk baseline moved with its trace, and the SUMMARY.
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
@app/src/domain/stepNumbers.js
@app/src/store/pen-step-roundtrip.test.js
@app/src/ui/useAnnouncer.js

Line numbers below were read at HEAD fa19967d, before siblings 261123-ghf (penDraft.js parseGramsDraft and penDraftRows), 261123-ghg (Method.jsx's removed-step number cell and its CSS), 261123-ghh (Method.jsx's open-step target chip and the notebook CSS) and 261123-ghi (CreationPage.jsx and IngredientTable.jsx picker). This plan applies on top of all four. Find each region by its content, and keep whatever those siblings wrote there.

Read these ranges only:
- app/src/ui/Method.jsx: 93-130 (StepPenBody's props), 495-563 (the closed branch and its acts line), 641-669 (Method's doc comment), 670-790 (Method's props, state and fieldLabel), 796-847 (the developing branch of the steps map).
- app/src/ui/CreationSteps.jsx: 259-300 (the acts line with its two Move buttons) and 306-356 (CreationSteps: liveSteps, isFirst and isLast).
- app/src/ui/CreationPage.jsx: 212-220 (focusRequestRef, structureWord, structureFrameRef), 317-345 (the frame cleanup and the step-act focus branch), 543-563 (announceStructure, handleMoveStep), 759-765 (the polite region).
- app/src/domain/creationSteps.js: 30-33 (liveSteps) and 250-271 (moveStep).
- app/src/domain/penDraft.js: 77-117 (isPenDraftDirty) and 155-167 (restoreStepFromVersion).
- app/src/ui/useVersionPen.js: 1-20 (imports), 132-147 (handleTogglePenStepRemoved, handleRestorePenStep), 283-306 (the return).
- app/src/ui/RecipeSheet.jsx: 21-56 (props) and 197-226 (Method's props).
- app/src/ui/RecipePage.jsx: 168-190 (useVersionPen's handlers) and 530-544 (RecipeSheet's handlers).
- app/src/ui/IngredientTable.jsx: 41-95 (groupPortionsByStep) and 753-761 (stepsForGrouping is draftVersion.method in the pen).
- app/src/ui/useKeptDraft.js: 350-414 (the plan draft is written 250 ms after a dirty change and deleted when clean).
- app/src/domain/draft.js: 72-90 (buildDraftRecord) and 247-281 (fitsPlanShape).
- app/src/ui/RecipePage.stalePen.test.jsx: 1-176. This is the pattern for a page test over one real fake-indexeddb store: the first import, settle, openTab with StrictMode, CatalogProvider, MemoryRouter and RecipePageForRoute, installMatchMedia at 1280, and a recipe stored through createRecipe and repository.createRecipeWithVersion.
- app/src/ui/CreationStructure.test.jsx: 58-77 (the requestAnimationFrame spy), 195-205 (nextFrames, the announcer), 228-317 (the creation editor's Move cases, the regression net for the shared code).
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs: the whole file (about 190 lines).
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs: 52-110 (spec and panel format).
- .planning/canvas-generators/p12pm-capture.mjs: lines 48-76. This is the flow that made the board's example: Coffee, four ingredients, five steps, Rest moved up once in the editor, Save, Next version, Version name "sweeten warm".
- .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh: the whole file. Also 11-walk.mjs lines 1-60 and 197-274 (what a snapshot holds: buttons, methodHash, and text and methodText under --keep-text).
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-walk-trace.md: sections 4 to 6 (the precedent for moving the walk baseline with a trace).
- The snapshots are long single lines. Read panel markup with a short script (python3 -I or node) that prints the text around `data-pid="pm-moves"` and the other panel ids, never with Read. The panel ids in pen-step-order.html are pm-create, pm-built, pm-moves, pm-once, pm-twice, pm-removed, pm-open, pm-table. The targets are pm-moves to pm-table; pm-create and pm-built are "as built" and are not targets.

Interfaces this plan creates (signatures are fixed, names are fixed):
- app/src/ui/StepMoves.jsx: `export function StepMoveButtons({ number, isFirst, isLast, keys = false, onMove })` returns a fragment of exactly the creation editor's two Move buttons with the middot span between them: Button(Move up) · Button(Move down). Each Button has, in this order: className 'text-control' (with ' mk-off' when it cannot act), data-act 'move-up' or 'move-down', aria-label `Step ${number}, move up` or `Step ${number}, move down`, aria-keyshortcuts 'Control+Meta+ArrowUp' or 'Control+Meta+ArrowDown' only when keys is true, aria-disabled 'true' only when off, and onClick undefined when off, else `() => onMove('up')` or `() => onMove('down')`.
- `export function stepMoveWord(draft, n, direction)` returns `Step ${place} of ${count}`: the live step n's place among liveSteps(draft) after the move, of their count. It returns null when n is not a live step or the move would pass an end. It reads only draft.method, so a create draft, a pen draft and a draft version all work.
- `export function moveFocusTarget(acts, act)` takes a step's acts element and 'move-up' or 'move-down'. It returns that act's button, or the step's other Move button when that one carries aria-disabled="true", or null when acts is null.
- app/src/ui/useAnnouncer.js: `export function useStructureWord()` returns `{ structureWord, announceStructure }`. It holds the state and the frame ref, cancels a pending frame on unmount, and announceStructure(sentence) cancels the pending frame, empties the word, and writes the sentence on the next requestAnimationFrame. This is CreationPage's code moved, not rewritten.
- app/src/domain/stepNumbers.js: `export function keptOrderChanged(method, baseMethod)` is true when the steps that are live in both arrays (not removed in either) stand in a different order in each. Each array is read in its own order. It never mutates or sorts.
- app/src/ui/useVersionPen.js: `handleMovePenStep(stepN, direction)` calls `versionPen.edit(moveStep, stepN, direction)`, with moveStep imported from app/src/domain/creationSteps.js. It is returned beside the other handlers.
- The prop `onMovePenStep` goes from RecipePage to RecipeSheet to Method, defaulting to `() => {}` in Method as its siblings do. StepPenBody gains `moves = null`. For a live step it is `{ isFirst, isLast, onMove }`, and it is null for a removed step.

Facts checked at planning time (HEAD fa19967d):
- The Phase 11 walk (`11-walk.mjs`, run by 12-check.sh's walk step, which must print a line starting "MATCH 94 snapshots") snapshots every `.notebook button` text while a pen is open, and hashes the method region's textContent. 32 of the 94 baseline snapshots hold the version pen's closed steps: version-pen-kept-draft 3, version-pen-blocked 17, version-pen-notice-edits 12. Every one moves when Move up and Move down join each closed live step. The walk presses no Move in the pen. In those snapshots the buttons list gains 'Move up', 'Move down' after each 'Edit this step' that is followed by 'Remove', and the method text gains 'Move up·Move down·' after each 'Edit this step·' that is followed by 'Remove'. Nothing else should move. The baseline is moved the 12-08 way: start MATCH, a trace of every difference, BASE moved, the baseline re-recorded from a detached build.
- 12-board-penpreview.mjs holds `.method-step__body button` (count, text, aria-label, box) over the whole method region against pen-preview-step.html. That board draws step 2 closed with Edit this step · Remove. With the Move buttons, step 2 gains two buttons and its Remove moves right, so the panels pv-pen and pv-pen-on would fail. The Preview step board's subject is the open step 1. This plan scopes that one selector to the first step, and holds the closed step line against sketch 017's approved board instead.
- `.notebook .mk-off` (app/src/styles/notebook.css line 194) styles the grey end on the recipe page, so the pen needs no CSS. In the board, `.dl-flag` (the purple note inside the pressed button) is position:absolute, so it does not move the button's box, but it is in the button's text.
- The 017 board's li ids are `method-step-<n>-<pid>`. The app's are `method-step-<n>`. Version 1 of the example stores step keys [1, 2, 4, 3, 5] (Steep, Strain, Rest, Sweeten, Churn): Rest is key 4 and Sweeten key 3.
- Grep baselines at HEAD: StepMoveButtons 0 in CreationSteps.jsx and Method.jsx; handleMovePenStep 0 in useVersionPen.js; onMovePenStep 0 in RecipeSheet.jsx; keptOrderChanged 0 in stepNumbers.js and penDraft.js; useStructureWord 0 in useAnnouncer.js, CreationPage.jsx and Method.jsx; moveFocusTarget 0 in CreationPage.jsx and Method.jsx; stepMoveWord 0 in CreationPage.jsx; `li:first-child` and `017-pen-step-order` 0 in 12-board-penpreview.mjs; 11-walk-record-base.sh holds BASE=e37db11a.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Move up and Move down on the pen's closed steps, end to end: the draft's order is drawn, counts as a change, is kept, restores and is saved</name>
  <files>app/src/ui/RecipePage.stepOrder.test.jsx, app/src/domain/stepNumbers.test.js, app/src/domain/penDraft.test.js, app/src/store/pen-step-roundtrip.test.js, app/src/ui/StepMoves.jsx, app/src/ui/Method.jsx, app/src/ui/RecipeSheet.jsx, app/src/ui/RecipePage.jsx, app/src/ui/useVersionPen.js, app/src/domain/stepNumbers.js, app/src/domain/penDraft.js</files>
  <behavior>
    The fixture for every RecipePage case below is a recipe "Coffee" whose Version 1 is stored through createRecipe and repository.createRecipeWithVersion, under ids of the case's own (stalePen's caseNumber pattern). It has no batch and no child. Its method is the board's: keys [1, 2, 4, 3, 5] with lead-ins Steep, Strain, Rest, Sweeten, Churn, each with an instruction of its own. Its rows are Heavy cream, 36% fat (row-cream) and Coffee beans (row-beans) with their one portion at step 1, and Dextrose (row-dex) at step 3. Build each with rowFromLibraryRecord from library.heavyCream, library.coffeeBeans and library.dextrose, then set its portions. Step 1 uses [row-cream, row-beans] and step 3 (Sweeten) uses [row-dex]. "The order" means the lead-ins of `.method-region ol.method-steps > li` in DOM order. "The numbers" means their `.method-step__n` texts.
    - T1, drawn (RecipePage.stepOrder.test.jsx): after Next version, each of the five p.method-step__acts holds four buttons. Their texts are [Edit this step, Move up, Move down, Remove] and their aria-labels are [Step N, edit this step; Step N, move up; Step N, move down; Step N, remove], N being 1 to 5 in order. 'Step 1, move up' and 'Step 5, move down' carry mk-off, aria-disabled 'true' and tabindex '0'. The other eight Move buttons carry neither mk-off nor aria-disabled. `.method-region` holds 20 buttons, no element with aria-keyshortcuts and no .mk-keys.
    - T2, a press reorders: pressing 'Step 4, move up' (Sweeten) makes the order Steep, Strain, Sweeten, Rest, Churn. The numbers read 1 to 5, and the li ids read method-step-1, -2, -3, -4, -5 (no key changed). 'Step 3, edit this step' is in Sweeten's li. Pressing 'Step 3, move up' makes the order Steep, Sweeten, Strain, Rest, Churn. The Ingredients table's `tr.ingredient-table__step-head` textContents read ['Step 1Steep', 'Step 2Sweeten'], where before any press they read ['Step 1Steep', 'Step 4Sweeten'].
    - T3, unsaved work: after the two presses and a settle past 250 ms, repository.getDraft(versionId) holds a kind 'plan' record whose payload.method keys read [1, 3, 2, 4, 5]. An Escape keydown on document leaves form[aria-label="Next version"] open. Then 'Step 2, move down' and 'Step 3, move down' bring back Steep, Strain, Rest, Sweeten, Churn. After a settle, getDraft returns no plan record, and Escape closes the pen.
    - T4, the kept draft restores: after the two presses and the settle, unmount the tab and open the same address in a new tab. The pen opens by itself (the kept draft's restore) with the order Steep, Sweeten, Strain, Rest, Churn.
    - T5, saved: after the two presses, type 'sweeten warm' into Version name and press Save as new version. The child's stored method keys read [1, 3, 2, 4, 5], every child step's leadIn and instruction equal Version 1's step with the same key, and Version 1 is unchanged. The child's page (the address the save navigates to) reads the order Steep, Sweeten, Strain, Rest, Churn numbered 1 to 5, with no Move button.
    - stepNumbers.test.js, keptOrderChanged: false for two equal arrays; true for [1,2,3,4,5] against [1,2,4,3,5]; false for a removal alone ([1,2,4r,3,5] against [1,2,4,3,5]); true for a live step moved past a step removed in the first array ([1,3,2,4r,5] against [1,2,4,3,5]); false for a step removed in both and passed over and back ([1,2,3,5,4r] against [1,2,3,4r,5]); false when a step live in the first array is removed in the second and nothing else moved; neither argument is mutated. (4r is key 4 with removed: true.)
    - penDraft.test.js: isPenDraftDirty('developing', penDraft, version) is true for a draft whose only change is moveStep(draft, n, 'up') and false again after the matching 'down'. moveStep over penDraftFromVersion(version) keeps every other draft key deep-equal and every step deep-equal to the opened step with the same key, and passes a removed step in one press. These two are pins: they pass as soon as keptOrderChanged exists.
    - pen-step-roundtrip.test.js (pins: the domain already holds; a failure is a finding), in a describe 'a step order changed through the pen', for each of SAVES: (a) moveStep(draft, 3, 'up') saved, exported, checked and imported, where the imported method's keys equal the draft's and each imported step deep-equals the saved fields' step with the same key; (b) togglePenStepRemoved(draft, 2) then moveStep(draft, 3, 'up'), where the imported keys read the draft's order with step 2 removed: true; (c) a kept pen draft with the moved order, built with buildDraftRecord({ versionId: opened.id, kind: 'plan', payload, penOpenedAt: NOW, now: NOW }), stored with repository.saveDraft and read back with getDraft, passes draftMatchesVersion(read, opened, [], null), and isPenDraftDirty('developing', read.payload, opened) is true.
    - Red before the change: T1 to T5 fail, and stepNumbers.test.js fails to import keptOrderChanged. The penDraft dirty case fails. The moveStep pins and the round trip pass.
  </behavior>
  <action>
RED. Write app/src/ui/RecipePage.stepOrder.test.jsx (jsdom, `// @vitest-environment jsdom`, `import 'fake-indexeddb/auto'` first) on RecipePage.stalePen.test.jsx's setup: settle, openTab, field, buttonByText, click and type, installMatchMedia at 1280, seedIfEmpty and loadCatalog in beforeEach, the afterEach unmount, and a case-numbered recipe id per case. Add a press helper that clicks the control with the given aria-label inside act. Write T1 to T5 as the behavior block gives them. Add the keptOrderChanged cases to app/src/domain/stepNumbers.test.js, the two penDraft cases to app/src/domain/penDraft.test.js (import moveStep from './creationSteps.js'), and the three round trip cases to app/src/store/pen-step-roundtrip.test.js, reusing its savedThroughPen, roundTrip, setUp and SAVES. Each new describe names sketch 017 and the CONTRACT section it pins. Run the four files and record what fails and what passes as a pin. Commit only those four test files by explicit path: `test: the Next version pen moves a step and keeps the order`.

GREEN, in this order.
1. app/src/domain/stepNumbers.js: add keptOrderChanged as the interface block gives it, with a doc comment. The rule is sketch 017 CONTRACT section 5's comparison: the steps live in both, each array in its own order. A removal alone is no order change. The pen's dirty check and slice 2's mark read this one rule.
2. app/src/domain/penDraft.js: import keptOrderChanged and, in isPenDraftDirty right after the methodDirty check, return true when keptOrderChanged(penDraft.method, version.method). Add one sentence to the function's comment citing sketch 017 CONTRACT section 4: an order that differs is ink, and moving back is not. Leave the rest of the file as sibling 261123-ghf left it.
3. app/src/ui/StepMoves.jsx (new): StepMoveButtons and stepMoveWord as the interface block gives them, imported from Button.jsx and from ../domain/creationSteps.js liveSteps. Copy the two Move Buttons from CreationSteps.jsx (lines 275-295 at HEAD) prop for prop, in the same order, so Task 2 can switch the creation editor to them with its markup unchanged. A head comment cites sketch 017 README decision 2 and CONTRACT section 2: the creation editor's buttons, shared. It also says the pen passes no keys (decision 11). Nothing else goes in this file in this task.
4. app/src/ui/Method.jsx:
   - In the steps map, the developing branch iterates the draft's method: map `isDeveloping ? draftVersion.method : steps`. Every other branch keeps `steps`.
   - Compute the draft's live steps once with liveSteps from ../domain/creationSteps.js. For each live step, pass StepPenBody `moves={{ isFirst, isLast, onMove: (direction) => handleMoveStep(step.n, direction) }}`, where isFirst and isLast are the step's place among the live steps. Pass null for a removed step.
   - handleMoveStep(stepN, direction) calls onMovePenStep(stepN, direction) only when stepMoveWord(draftVersion, stepN, direction) is not null. A stale press does nothing, so moveStep never throws inside a state update.
   - In StepPenBody's closed branch, put the moves inside p.method-step__acts, after Edit this step's middot and before Remove: StepMoveButtons with number, isFirst, isLast and onMove, followed by its own `<span aria-hidden="true">·</span>`, drawn only when moves is not null. No keys prop. The line then reads Edit this step · Move up · Move down · Remove. Edit this step stays the line's first child, so its node is still reused as the open step's Cancel (bug-edit-this-step-focus-on-cancel). The open branch is unchanged: it has no Move.
   - Add the onMovePenStep prop with its comment beside onRestorePenStep.
   - Rewrite the sentences these changes make false. Method's doc comment says the pen draws `steps` in the baseline's place. It now draws the draft's order, sketch 017 CONTRACT section 3. StepPenBody's comment says it is called "in the same order every render". Each step's li is keyed by its stored key, so its state moves with it when the order changes.
   - Leave the removed step's number cell as 261123-ghg left it, and the open step's target chips as 261123-ghh left them.
5. app/src/ui/useVersionPen.js: import moveStep from '../domain/creationSteps.js'. Add handleMovePenStep after handleTogglePenStepRemoved, with a comment: sketch 017 CONTRACT section 3, the creation editor's own moveStep, which reads and writes the draft's method only, so no stored key changes. Return it.
6. app/src/ui/RecipeSheet.jsx: accept onMovePenStep and pass it to Method beside onTogglePenStepRemoved. app/src/ui/RecipePage.jsx: take handleMovePenStep from useVersionPen and pass onMovePenStep={handleMovePenStep} to RecipeSheet.
Run the verify commands green, with BASE set to the commit this plan started from (plan_head_before). Then run the whole suite. An existing test that fails only because the pen's closed line now holds the two Move buttons is a deviation: name it, update its expectation to the approved board (pen-step-order.html), and record it. Commit the seven source files by explicit path: `feat: the Next version pen moves a step and keeps the order`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/RecipePage.stepOrder.test.jsx src/domain/stepNumbers.test.js src/domain/penDraft.test.js src/store/pen-step-roundtrip.test.js src/ui/Method.test.jsx src/ui/Method.preview.test.jsx src/ui/RecipeSheet.test.jsx src/ui/RecipePage.perStep.test.jsx src/ui/tabindex-scan.test.js</automated>
    <automated>grep -c "export function keptOrderChanged" app/src/domain/stepNumbers.js # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "keptOrderChanged" app/src/domain/penDraft.js # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "handleMovePenStep" app/src/ui/useVersionPen.js # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "onMovePenStep" app/src/ui/RecipeSheet.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "StepMoveButtons" app/src/ui/Method.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>git diff --quiet "$BASE" HEAD -- app/src/store/db.js app/src/store/transfer.js app/src/store/repository.js app/src/domain/draft.js app/src/domain/creationSteps.js app/src/domain/diff.js app/src/ui/IngredientTable.jsx app/src/styles</automated>
  </verify>
  <done>T1 to T5, keptOrderChanged and the penDraft dirty case failed before the change and pass after it. The moveStep and round trip pins pass. In the pen, every closed live step offers Move up and Move down between Edit this step and Remove, with grey ends. A press reorders the draft with no key changed. The pen and the table follow, the order is kept and restores, and Save as new version stores it. No store, draft-shape, diff, table or style file changed. Two commits, red then green, each staged by explicit path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The pen's moves keep focus and say where the step went, with the creation editor's own code; removed, open and one-live-step cases</name>
  <files>app/src/ui/RecipePage.stepOrder.test.jsx, app/src/ui/StepMoves.jsx, app/src/ui/useAnnouncer.js, app/src/ui/Method.jsx, app/src/ui/CreationSteps.jsx, app/src/ui/CreationPage.jsx</files>
  <behavior>
    These are new cases in RecipePage.stepOrder.test.jsx over Task 1's fixture. requestAnimationFrame and cancelAnimationFrame are spied as in CreationStructure.test.jsx lines 58-77, with a nextFrames helper. "The word" is the textContent of `.method-region .visually-hidden[role="status"][aria-live="polite"]`, which must match exactly one element.
    - F1, focus and word: pressing 'Step 4, move up' leaves document.activeElement on 'Step 3, move up', and Sweeten's li is the one holding it. The word is '' at the press and 'Step 3 of 5' after nextFrames. Pressing 'Step 3, move up' empties the word, focus is on 'Step 2, move up', and the word reads 'Step 2 of 5' after the frame.
    - F2, the grey end: pressing 'Step 2, move up' again puts Sweeten first. Its Move up turns mk-off, focus is on 'Step 1, move down', and the word reads 'Step 1 of 5'. Pressing the grey 'Step 1, move up' leaves the order, the focus and the word as they were, and requests no frame. Then pressing 'Step 4, move down' (Rest) makes Rest last: its Move down turns grey and focus goes to 'Step 5, move up', with the word 'Step 5 of 5'.
    - F3, a removed step: pressing 'Step 3, remove' (Rest) leaves Rest's line reading [Edit this step, Restore] with no Move button. 'Step 2, move down' is not grey. `.method-region` holds 18 buttons. Pressing 'Step 3, move up' (Sweeten, now third among the live steps) passes Rest in one press, so the order is Steep, Sweeten, Strain, Rest, Churn, the numbers are 1, 2, 3, (empty), 4, and the word reads 'Step 2 of 4'. Restore on Rest makes it live where it stands, numbered 4, with Move up and Move down.
    - F4, an open step: pressing 'Step 2, edit this step' opens Strain. Its body holds no button named ', move up' or ', move down', and its last line is p.method-step__done-cancel. Every closed live step keeps its Moves. Pressing 'Step 4, move up' (Sweeten) moves Sweeten past nothing open and leaves Strain open with its lead-in field. Pressing 'Step 3, move up' moves Sweeten past the open Strain, and Strain stays open. Typing into Strain's lead-in and pressing its Cancel puts back 'Strain', and Strain stays at place 3.
    - F5, one live step and none: after removing four of the five steps, the one live step's 'Step 1, move up' and 'Step 1, move down' both carry mk-off and aria-disabled 'true'. Pressing either changes nothing and requests no frame. After removing the fifth, `.method-region` holds no button whose aria-label ends ', move up' or ', move down'.
    - The creation editor: CreationStructure.test.jsx's 'Move on a step' describe, CreationSteps.test.jsx and CreationFlow.test.jsx pass unchanged before and after. This is the regression net for moving its code; they are not edited.
    - Red before the change: F1 and F2 fail (no focus rule, no word). F3's word fails, while its no-Move and one-press assertions pass as bounds. F4 and F5 pass as bounds.
  </behavior>
  <action>
RED. Add F1 to F5 to app/src/ui/RecipePage.stepOrder.test.jsx with the frame spy and nextFrames. Run the file and record which cases fail and which pass as bounds. Run CreationStructure.test.jsx, CreationSteps.test.jsx and CreationFlow.test.jsx and record that they pass. Commit only RecipePage.stepOrder.test.jsx by explicit path: `test: the pen's moves keep focus and say where the step went`.

GREEN.
1. app/src/ui/useAnnouncer.js: add useStructureWord as the interface block gives it. Move CreationPage's words and behaviour into it, not new ones: the word state, the frame ref, the unmount cleanup that cancels a pending frame, and announceStructure's cancel, empty and next-frame write. Carry CreationPage's comment ("every structure change is heard, a repeat included…", D-14 to D-16) onto it. useAnnouncer is unchanged.
2. app/src/ui/StepMoves.jsx: add moveFocusTarget as the interface block gives it. Copy the rule from CreationPage's step-act branch (lines 332-341 at HEAD): the act's button, or the other Move button when it is aria-disabled. The act is always one of the two literal names, never built from a stored value.
3. app/src/ui/Method.jsx:
   - Call useStructureWord unconditionally with the other hooks.
   - Hold a list ref on the ol and a move request ref.
   - handleMoveStep keeps Task 1's guard. It takes the word from stepMoveWord before calling onMovePenStep, then sets the request { n, act: 'move-up' | 'move-down' } and calls announceStructure(word).
   - An effect with no dependency list (CreationPage's own pattern) acts on a pending request after the render that reordered the steps and clears it. It finds the li whose id is `method-step-${n}` among the list's own children, by comparing ids rather than building a selector from a stored key. It then focuses moveFocusTarget(that li's `:scope > .method-step__body > .method-step__acts`, act).
   - While isDeveloping, render `<div className="visually-hidden" role="status" aria-live="polite">{structureWord}</div>` after the ol. Cite CONTRACT section 3 in the comment: the place among the live steps, of their count. It is a div, not the creation editor's p, because an empty p adds a paragraph break to the page's innerText. The Phase 11 walk hashes that text, and the region must leave it unchanged. Task 3's trace proves it.
4. app/src/ui/CreationSteps.jsx: replace the two Move Buttons and the middot between them with `<StepMoveButtons number={number} isFirst={isFirst} isLast={isLast} keys onMove={(direction) => onMoveStep(step.n, direction)} />`. Add Steps' own Add step, the middots before and after, and Remove stay as they are. The comment above the line stays. The rendered markup is byte for byte as before.
5. app/src/ui/CreationPage.jsx, on top of 261123-ghi's picker changes and touching nothing of them:
   - Replace the structure word's state, its frame ref, the frame-cleanup effect and the announceStructure definition with `const { structureWord, announceStructure } = useStructureWord();` where the state stood, keeping its comment. Every caller of announceStructure is unchanged.
   - handleMoveStep takes `const word = stepMoveWord(createDraft, n, direction)`, returns when it is null, and announces word. Its keyed path still asks for no focus.
   - The step-act focus branch becomes moveFocusTarget over the step's acts, found as before by `li.mk-step[data-step=…]` and `:scope > .method-step__body > .method-step__acts`.
   - Remove only the imports this leaves unused. liveSteps and displayNumbers are still read elsewhere, so check before removing anything.
Run the verify commands green, and then the whole suite. Commit the five source files by explicit path: `feat: the pen's moves keep focus and say where the step went, with the creation editor's own code`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/RecipePage.stepOrder.test.jsx src/ui/CreationStructure.test.jsx src/ui/CreationSteps.test.jsx src/ui/CreationFlow.test.jsx src/ui/CreationPage.twoTabs.test.jsx src/ui/Method.test.jsx src/ui/Method.preview.test.jsx src/ui/tabindex-scan.test.js</automated>
    <automated>grep -c "export function useStructureWord" app/src/ui/useAnnouncer.js # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "useStructureWord" app/src/ui/CreationPage.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "useStructureWord" app/src/ui/Method.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "moveFocusTarget" app/src/ui/CreationPage.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "moveFocusTarget" app/src/ui/Method.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "stepMoveWord" app/src/ui/CreationPage.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
    <automated>grep -c "StepMoveButtons" app/src/ui/CreationSteps.jsx # [HEAD=0 EXPECT>=2 @fa19967d]</automated>
  </verify>
  <done>F1 and F2 and F3's word failed before the change and pass after it, and F3's other assertions, F4 and F5 hold as bounds. The pen keeps focus on the moved step's Move button (the other one at an end) and announces 'Step N of M' politely. The creation editor reads the same StepMoveButtons, stepMoveWord, moveFocusTarget and useStructureWord, and its own tests pass unchanged. Two commits, red then green, staged by explicit path.</done>
</task>

<task type="auto">
  <name>Task 3: The gate holds the pen's step line against sketch 017; side by side in WebKit and Chrome; the Phase 11 walk baseline moved with its trace; the full suite, GATE2 and the SUMMARY</name>
  <files>.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs, .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh, .planning/phases/11-steps-structure-save-and-print/11-walk-before.json, .planning/phases/11-steps-structure-save-and-print/11-walk.mjs, .planning/quick/261123-ghk-step-order-in-the-next-version-pen-mark-answered-bug-p11-pen/261123-ghk-SUMMARY.md</files>
  <action>
PHASE12 is .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo. PHASE11 is .planning/phases/11-steps-structure-save-and-print. S is "${TMPDIR:-/tmp}/sprinkles-ghk". START is plan_head_before. Run the steps in this order. Steps 4 to 6 need the final app tree: if any step finds an app defect, fix it with a test first, then redo steps 2 to 6.

1. The full suite: `npm --prefix app test` (if npm hangs inside the worktree, `cd app && npx vitest run`, as 12-check.sh notes). It must pass, with the baseline before this batch (137 files, 4596 tests), the siblings' cases and this plan's new ones.

2. 12-board-penpreview.mjs.
   - In PEN_ELEMENTS, the first selector becomes `.method-steps > li:first-child .method-step__body button`, with the same checks. The Preview step board's subject is the open step 1. Its closed step 2 was drawn before Move up and Move down, and is held by the 017 spec below instead.
   - The default export becomes an array of two specs. The first is the existing pen-preview-step.html spec, otherwise unchanged. The second has board '.planning/sketches/017-pen-step-order/pen-step-order.html' and four panels at 1366: route '/notebook', library 'current', ready '.nb__head'. Their steps come from a flow that replays p12pm-capture.mjs steps 1 and 3 with the board's words: Coffee with Heavy cream, 36% fat 400, Coffee beans 40, Dextrose 120 and Fine sea salt 1; Steep, Strain, Sweeten, Rest and Churn; Step 1 uses cream and beans, and Step 3 uses dextrose and salt; Rest moved up once with its Move up focused and Enter; Save; Next version; Version name 'sweeten warm'. Reuse this file's clickUntil, pickRow and add helper shapes as they stand after 261123-ghi, lifting them to module scope without changing what they do. Copy nothing from p12pm-capture.mjs that this file already has.
   - Panel `steporder-pm-moves` (pid pm-moves, anchor '.method-region'). Elements: `li.method-step` (count, box); `.method-step__n` (count, text, box); `p.method-step__lead` (count, text, box, font); `p.method-step__acts` (count, box); `p.method-step__acts button` (count, text, { attr: 'aria-label' }, { attr: 'aria-disabled' }, box). absent: `[aria-keyshortcuts]`, `.mk-keys`.
   - Panels `steporder-pm-once-focus` (pid pm-once, after a click on 'Step 4, move up') and `steporder-pm-twice-focus` (pid pm-twice, after a second click, on 'Step 3, move up'). Anchor '.method-region'. One element each, `[aria-label="Step 3, move up"]` and `[aria-label="Step 2, move up"]`, with checks count, focus and box. Not text: the board's purple note sits inside that button. Its lead's "was step" words are slice 2's, and a marked step keeps its height, so the box holds now.
   - Panel `steporder-pm-table` (pid pm-table, the same two clicks, anchor '.ingredient-table-region'). Elements: `tr.ingredient-table__step-head` (count, text, box); `tbody tr[aria-label]` (count, { attr: 'aria-label' }, box).
   - pm-removed and pm-open are not held here. Their leads carry the words, the open step's words may change its height, and pm-removed's removed step is drawn before 261123-ghg's fix. Slice 2 holds them.
   - Update the header comment: which board each spec holds, why the first selector is scoped, and that every check kind is kept.

3. Scratch build and board runs. Build once with `npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir`. Never write app/dist, never start a dev or preview server, leave port 4173 alone, and run no build while another is running.
   - WebKit: `PROBE_DIST="$S/dist" node PHASE12/12-board-check.mjs PHASE12/12-board-penpreview.mjs PHASE12/12-board-rowcontrols.mjs PHASE12/12-board-keys.mjs --selftest --evidence "$S/evidence-webkit"`. Then `PROBE_DIST="$S/dist" node PHASE12/12-tab-probe.mjs` and `PROBE_DIST="$S/dist" node PHASE12/12-keys-probe.mjs move keys lines`. The last three hold the creation editor, whose code Task 2 moved, and must pass unchanged.
   - Chrome: write "$S/chrome-shim.mjs". It imports playwright-core from 12-board-check.mjs's default PLAYWRIGHT_CORE path and exports `webkit` as an object whose launch(options) calls chromium.launch with those options plus executablePath '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' and headless true. Run the same board command with PLAYWRIGHT_CORE="$S/chrome-shim.mjs" and --evidence "$S/evidence-chrome". If the engine will not run in Chrome, say why in the SUMMARY and hold the panels in the scratch script below.

4. Side by side, scratch, never in the repo. Write "$S/side-by-side.mjs". It serves "$S/dist" through PHASE12/../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs startServers, imported by absolute path, and aborts every request off 127.0.0.1. In WebKit (coarse pointer, hasTouch) and in Chrome, at 1366 x 1024, in one throwaway context, it replays step 2's flow and reads the six drawn targets: pm-moves, pm-once (one press), pm-twice (two), pm-removed (two presses, then 'Step 4, remove' on Rest), pm-open (two presses, then 'Step 2, edit this step' on Sweeten), and pm-table. For each li, .method-step__n, p.method-step__lead and p.method-step__acts with its buttons, it prints x and y from .method-region's top-left (the table region's for pm-table), width, height, text, aria-label and aria-disabled. It also prints the active element's label and the pen's polite word after each press. It reads the same from the board's own panels (the snapshot opened as a file, panel `.fp-win.g2w-1366[data-pid=…]`) and prints every difference above 1 px or in text. The expected differences, each to be named in the SUMMARY: every `span.method-step__skipped-label` reading " was step N" (slice 2), and on pm-removed the removed step's number cell and its body's x (261123-ghg). Anything else is a finding. It also:
   - counts Tab stops in .method-region for pm-moves (20) and pm-removed (18), and walks Tab through pm-moves to check the landing order is markup order;
   - checks no scrollWidth above innerWidth, and that the acts line is one row (the controls end near 356.7 in WebKit and 350.4 in Chrome, each 44 high);
   - after Save as new version from the pm-twice state, reads the saved version's page (order Steep, Sweeten, Strain, Rest, Churn, numbered 1 to 5) and its print page (printPath; the step heads in that order, no change mark);
   - reads the creation editor's acts line once (Add step · Move up · Move down · Remove, 'Step 3 of 5' after a press) to show it is unchanged.

5. The Phase 11 walk baseline (the 12-08 rule: a plan that changes a walked screen moves BASE with a trace).
   a. Start: `git worktree add --detach "$S/start" START`, `ln -s "$(pwd)/app/node_modules" "$S/start/app/node_modules"`, build it with `npm --prefix "$S/start/app" run build -- --outDir "$S/dist-start" --emptyOutDir`, then `PROBE_DIST="$S/dist-start" node PHASE11/11-walk.mjs record "$S/walk-start.json" --keep-text`. Write a copy with every snapshot's text and methodText keys removed ("$S/walk-start-plain.json") and run `node PHASE11/11-walk.mjs compare PHASE11/11-walk-before.json "$S/walk-start-plain.json"`. It must print a line starting "MATCH 94 snapshots". If it does not, a sibling moved the walk: stop this step, leave the walk files untouched, record that compare's DIFF lines in the SUMMARY, and report it. Remove the start worktree when done.
   b. After: `PROBE_DIST="$S/dist" node PHASE11/11-walk.mjs record "$S/walk-after.json" --keep-text`.
   c. Trace: write "$S/walk-trace.mjs". It reads both recordings and, for every scenario and step (same names, same count), checks three things. Every leaf other than snapshot.buttons, snapshot.methodHash and snapshot.methodText must be deep-equal, stores included. The after buttons must equal the start buttons with 'Move up', 'Move down' inserted right after every 'Edit this step' that is directly followed by 'Remove'. The after methodText must equal the start methodText with every 'Edit this step·Remove' read as 'Edit this step·Move up·Move down·Remove'. The middot is U+00B7. It prints a FAIL line for any other difference, and ends with the counts: snapshots compared, snapshots changed, and Move pairs inserted. Every difference must be explained. Do not loosen the script to pass a difference it finds; report it.
   d. Move BASE. In PHASE11/11-walk-record-base.sh set BASE to `git log -1 --format=%h -- app/` (the last commit of this plan that touches app/). Add a paragraph to its header: the baseline moves to that commit because the pen's closed steps gained Move up and Move down (quick 261123-ghk, sketch 017). The start compare proved every app commit between the old BASE and START walk-neutral. The trace in the quick SUMMARY attributes every difference to the Move pairs. NEUTRAL and every other line stay as they are. In PHASE11/11-walk.mjs, extend the header's third line with the new BASE and this quick id, and change nothing else. Then run `sh PHASE11/11-walk-record-base.sh`, which writes PHASE11/11-walk-before.json from a detached build of BASE, then `sh PHASE11/11-walk-check.sh`. It must print a line starting "MATCH 94 snapshots".

6. The gate: run `sh PHASE12/12-check.sh` once, in the background, and wait for it. It must end GATE2 PASS. If a step that this plan does not touch fails (sim, pdf, print, roundtrip, stops, phone, band), record its output, run the steps this plan touches on their own (step 3's commands and 11-walk-check.sh), report it, and do not edit that step.

7. Write the SUMMARY with:
   - the slice statement and slice 2's scope, word for word from this plan's objective;
   - the designer findings and what each check found;
   - the shared code: what moved out of CreationSteps.jsx and CreationPage.jsx, and the proof its behaviour held (the creation tests, the tab and keys probes, rowcontrols and keys boards);
   - red then green for Tasks 1 and 2, the pins, and the suite counts;
   - the gate changes file by file and why: penpreview's scoped selector and the 017 spec, with PASS and FAIL counts per panel in WebKit and Chrome and the evidence folders;
   - the side-by-side table, board against app, in both engines, with the expected differences named;
   - the walk: the start MATCH line, the trace's counts, the old and new BASE, and 11-walk-check's MATCH line;
   - the 12-check.sh result;
   - the undrawn states and what the build does in each, from the objective;
   - the line "Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad";
   - a "For the orchestrator" section. The executor has no ArtifactData. Keep bug-p11-pen-steps-no-reorder open until slice 2 lands. decide-p12-pen-order-mark is built by slice 2. The walk baseline moved under the 12-08 rule, so Mark may want to know. A dist built from this commit is safe to deploy once the suite and GATE2 pass: it adds no store write and no shape change.
   Commit 12-board-penpreview.mjs by explicit path: `chore: the phase 12 gate holds the pen's step line against sketch 017`. Then commit the three walk files by explicit path: `chore: the Phase 11 walk baseline moves to the pen's Move up and Move down`. Commit the SUMMARY last, by explicit path: `docs: summary for step order in the Next version pen`.

Executor rules for this whole plan:
- Tests come first: a failing test commit before each change commit. The pins and the creation editor's tests are named as such.
- Stage explicit paths only. Never use `git add -A` or `git add .`. Never stage anything under .planning/sketches or .planning/canvas-generators.
- Never write app/dist, never start a second Vite process, and leave port 4173 alone.
- Do not touch .planning/state.json or .planning/STATE.md.
- Commit messages are plain English.
- Changes are surgical: no CSS, no token, no new on-screen words, nothing in the store, draft shape, diff.js or IngredientTable.jsx.
  </action>
  <verify>
    <automated>grep -c "017-pen-step-order/pen-step-order.html" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "li:first-child" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>test "$(sed -n 's/^BASE=//p' .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh)" = "$(git log -1 --format=%h -- app/)"</automated>
    <automated>sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh</automated>
    <automated>npm --prefix app test</automated>
    <automated>sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh</automated>
    <automated>grep -c "Device-unverified" .planning/quick/261123-ghk-step-order-in-the-next-version-pen-mark-answered-bug-p11-pen/261123-ghk-SUMMARY.md # [HEAD=error:2 EXPECT>=1 @fa19967d]</automated>
  </verify>
  <done>The Preview step panels hold their open step, and sketch 017's pm-moves, the two focus panels and pm-table hold the pen in WebKit and Chrome with every check kind kept. The side by side is recorded with only the named differences. The walk's start compare matched, and the trace attributes every difference to the Move pairs. BASE moved to this plan's last app commit, and 11-walk-check prints MATCH 94 snapshots. The full suite passes. 12-check.sh ends GATE2 PASS, or the SUMMARY names an untouched step that stopped it, with its output. The SUMMARY is committed last.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema are involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| kept draft to pen | a stored plan draft (possibly carried in an imported backup) is restored into the pen and drives what is drawn and saved |
| pen to store | the reordered method is saved into a version and carried in a backup |
| gate baseline | the Phase 11 walk baseline is the regression proof for every later change; moving it can hide one |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ghk-01 | Tampering (data loss) | penDraft.js isPenDraftDirty, useKeptDraft | high | mitigate | A changed order counts as ink (keptOrderChanged), so the kept draft is written and Escape keeps the pen. T3 and T4 pin the write and the restore after a reload, and the round trip pins draftMatchesVersion on a stored reordered draft |
| T-ghk-02 | Tampering | moveStep through useVersionPen; savedMethod | medium | mitigate | moveStep never changes a step key or another draft field (penDraft.test.js pin). The round trip exports, passes validateStoreFile and imports a reordered version, each step equal by key. db.js, transfer.js and draft.js are unchanged (Task 1's git diff gate) |
| T-ghk-03 | Denial of service | Method handleMoveStep | medium | mitigate | A stale press past an end would make moveStep throw inside a state update. stepMoveWord guards every press before onMovePenStep, and grey buttons have no onClick (F2, F5) |
| T-ghk-04 | Tampering (selector built from stored data) | Method's focus effect | low | mitigate | The moved step's li is found by comparing ids among the list's own children. No selector is built from a stored key, and the act is one of two literal names |
| T-ghk-05 | Tampering (gate) | 11-walk-before.json, 11-walk-record-base.sh, 12-board-penpreview.mjs | high | mitigate | The start compare must MATCH 94 before anything moves, so no sibling's change is absorbed. The scratch trace attributes every difference to the inserted Move pairs and fails on anything else. The baseline is recorded from a detached build of BASE, not the working tree. The penpreview scope is narrowed only for the closed step that sketch 017's spec now holds, and the SUMMARY lists each change |
| T-ghk-06 | Spoofing (misleading words) | the pen's polite region | low | mitigate | The announced words are the creation editor's own, from one function (stepMoveWord), and are rendered as a React text child (F1 to F3) |
| T-ghk-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- Tasks 1 and 2 each land a failing test commit before their change commit. The pins and the creation editor's tests are named.
- `npm --prefix app test` passes: 137 files and 4596 tests before the batch, plus the siblings' and this plan's cases.
- The board engine over 12-board-penpreview.mjs, 12-board-rowcontrols.mjs and 12-board-keys.mjs passes in WebKit and in Chrome (the shim). 12-tab-probe.mjs and 12-keys-probe.mjs pass.
- The walk's start compare prints MATCH 94 snapshots, the trace finds only the Move pairs, and after BASE moves 11-walk-check.sh prints MATCH 94 snapshots.
- 12-check.sh ends GATE2 PASS.
</verification>

<success_criteria>
- In the Next version pen, every closed live step offers Move up and Move down with the creation editor's words, grey ends, focus rule and announcement. A removed step and an open step offer none, and the pen has no move keys.
- The pen and its Ingredients table draw the draft's order. A changed order is unsaved work, is kept and restored, and both saves store it with no stored shape change.
- The creation editor and the pen share one copy of the move controls and their logic, and the creation editor is unchanged to the maker.
- The gate holds the pen's step line against sketch 017 in WebKit and Chrome, and the walk baseline moved only by traced Move pairs. Everything is recorded as device-unverified.
- Slice 2 (the "was step N" mark) is named precisely and is not built here.
</success_criteria>

<output>
Create `.planning/quick/261123-ghk-step-order-in-the-next-version-pen-mark-answered-bug-p11-pen/261123-ghk-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
