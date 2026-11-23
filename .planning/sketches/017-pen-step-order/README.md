---
sketch: 017
name: pen-step-order
question: "In the Next version pen, how does a maker change the order of a later version's steps, what does a step look like after a move, with a removed step among moved ones and with a step open, and how does a changed order read against the parent in the pen, on the saved version's page, in Show changes and on paper?"
winner: "none yet: drawn 2026-11-23, not approved. Waits on Mark's List: decide-p12-pen-order-scope, decide-p12-pen-order-mark, look-p12-pen-step-order."
tags: [version-pen, steps, order, move, show-changes, phase-12]
---

# 017 the version pen: changing the order of steps

**Drawn, not approved.** Mark answered `bug-p11-pen-steps-no-reorder` on 2026-11-23 with "Fix it: plan reordering in the version pen (scope decision, Sid's drawing, then a build)". That settles one thing: a later version may change the order of its steps in the Next version pen. Everything below is drawn for him to answer; nothing is built and no plan cites this until he does.

Why a new sketch and not a section of 016: 016 answers three Gate 2 questions and has had three rounds; this is a new capability on later versions, against Phase 11's boundary (11-CONTEXT: "structure edits on any later version" out; STRUCT-04), with its own decisions and a build of its own that should cite one contract. 016's decision 8 ("Reordering steps in the pen is not drawn") points here.

Authority: these boards, CSS included. Conformance is the board and the built app side by side in a browser, never prose or a test count. `CONTRACT.md` names what the boards hold.

## What is here

Canvas page "Phase 12 version pen: step order" (canvas version 591, 1795441159-70cc). Made by `canvas-generators/p12pm.py` from `p12pm-capture.mjs`, measured by `p12pm-measure.mjs`; snapshot by `snapshot017.py`.

| File | Canvas board | What it draws | Mark's List |
|------|--------------|---------------|-------------|
| `pen-step-order.html` | `P12_PenStepOrder` | 1366. As built: the creation editor's step line with its Move buttons; the pen with no way to change the order. Drawn: the pen with Move up and Move down on each closed step; Move up pressed once and twice; a removed step among moved ones; a step open; the Ingredients table following the order. | `look-p12-pen-step-order`, `decide-p12-pen-order-scope` |
| `step-order-shown.html` | `P12_StepOrderShown` | 1366. Show changes on the saved version: as built (a removed step), then three ways to show a changed order (A the words "was step 4", B the old number struck under the new one, C no mark); the same version read plain, and its Ingredients. | `decide-p12-pen-order-mark` |

The example is Sid's Coffee, made through the built creation editor in a throwaway profile: Version 1 reads Steep, Strain, Rest, Sweeten, Churn. In the pen ("sweeten warm") Sweeten moves up twice and Rest is removed.

## The four questions

### 1. Order only, or wider? (Mark's to answer: `decide-p12-pen-order-scope`)

Drawn: order only. No step is added in the pen and no ingredient changes step. Mark answered about order; the wider cases are his. What each would take, so the choice is informed:

- Adding a step in the pen: a kept pen draft is checked as holding exactly the opened version's steps (`draft.js`, `fitsPlanShape`: the same count and keys), so that check changes; Show changes already reads an added step plain (11-CONTEXT D-26); the step key allocator exists (`stepKeys.js`). No board draws Add step in the pen.
- Moving an ingredient's amount to another step, or splitting it: the pen pairs each line with its parent's line by position and never changes a line's step (`diff.js`, `buildLineDiffs`; `penDraft.js`). That pairing, the struck values and the kept-draft check all change. This is the larger of the two.
- Today the pen's Change ingredients already ticks a row in or out of a step's "uses" list; it does not move the row's amount. That stays as built.

Sid recommends order only for this build.

### 2. How a changed order is shown

- In the pen: the steps stand in their new order and take new numbers at once. A step whose number differs from its number on the parent says so (the mark Mark picks, decision 9). Moving a step back clears it.
- On the saved version's page: the new order, numbered 1 up, no mark (as any version reads).
- In Show changes: the same mark as the pen.
- On paper: the sheet prints the version as it reads, in the new order, numbered 1 up. The printed sheet shows no changes today (captured: `PrintSheet*.jsx` reads no comparison) and that stays.

### 3. Step numbers that things refer to

- Every number the app writes is worked out from the order each time it is shown, so it follows a move with nothing to do: the margin numbers, the Ingredients table's step heads and a split row's line names, "still used by step 2", a target hint ("Step 2 targets 82 °C"), each field's spoken name, the printed step heads. Captured: the pen's table head for Sweeten reads "Step 4" on the parent; the drawn table reads "Step 2".
- Nothing stored points at a number. A row's amount, a step's uses list and a batch's step notes point at the step's stored key, which never changes (`stepNumbers.js`).
- Words the maker typed ("add the base from step 1") do not follow, and nothing can make them. No seeded recipe has such words (searched). Not drawn: a notice when a moved step, or a step naming it, holds "step" and a number. That would be new scope.
- A batch already recorded on the parent is untouched: it reads against its own version.

### 4. What the stored shape needs

Nothing. No store change, no `DB_VERSION` change, no draft shape change, no migration.

- A version's step order is the order of its `method` array; display numbers follow the array (`displayNumbers`). The array is already saved out of key order today: Version 1 in the capture, after one Move in the creation editor, is stored with step keys `[1, 2, 4, 3, 5]`, and reads, prints and opens in the pen in that order (WebKit and Chrome).
- The pen saves `penDraft.method` as it stands (`penDraft.js`, `savedMethod`), so a reordered draft array saves reordered.
- A kept pen draft with a new order still restores: `fitsPlanShape` asks for the same keys, in any order.
- A backup holding a reordered version imports: `transfer.js` checks each step, not their order.
- Whether the order changed is worked out by comparing the two versions' arrays, as every other change is; nothing is stored for it.

What the code must learn, none of it a shape: the pen draws its steps and its table in the draft's order (today `Method` maps the opened version's steps, and `RecipeSheet` hands the table `version.method`); `isPenDraftDirty` counts a changed order as a change; `buildDiff` reports the order (it pairs steps by key and says nothing of place; its header's "already ascending n" is no longer true of stored versions).

## Decisions drawn (not approved)

1. Order only (question 1). Waits on `decide-p12-pen-order-scope`.
2. The controls are the creation editor's: Move up and Move down, the same words, the same grey ends, the same focus rule and announcement (sketch 014 section 3, 11-CONTEXT D-16, sketch 016 decisions 13 and 15a).
3. They stand on the closed step's line, beside Remove, which sketch 011 put there: Edit this step · Move up · Move down · Remove. The step's own control first, then the three that act on the step among the steps, Remove last (016's two groups). No Add step.
4. The first live step's Move up and the last live step's Move down are grey (`mk-off`, `aria-disabled="true"`), stay Tab stops and do nothing.
5. A press moves the step one place among the live steps. Focus stays on the same button; when that button turns grey, focus goes to the step's other Move button. "Step 3 of 5" is announced politely: the place among the live steps, of their count.
6. A removed step keeps its place, struck, with no number, and offers Edit this step · Restore as built: no Move. A moved step passes over it in one press (the creation editor's rule for a removed step, `creationSteps.js` `moveStep`). Restore brings it back live where it stands; then it can be moved.
7. An open step ends with Cancel · Done as built and has no Move: Done first, then move. The other steps keep theirs and may move past it. Cancel on a step puts back its words, not its place (`restoreStepFromVersion` replaces the one step where it stands).
8. A changed order is a change like any other: the pen holds unsaved work, the draft is kept, Save as new version saves it. Moving the steps back to the parent's order leaves no change.
9. The mark, for Mark to choose (`decide-p12-pen-order-mark`). Whichever he picks, the rule is one: once the order of the steps both versions keep differs from the parent's, every live step whose number differs from its number on the parent is marked; when only a removal changed the numbers, nothing is marked, as built.
   - **A, recommended: the words "was step 4"** after the step's words, in the type of "removed" (`method-step__skipped-label`: 12 px grotesk capitals). On an open step they stand under its two fields, inside the outline, where "removed" stands on a removed step. No new rule, no added height; the same words for the eye and a screen reader.
   - B: the parent's number struck under the new one in the margin (proposed `method-step__n-from`). A step grows by a line (23 to 46 px in WebKit, 24 to 48 in Chrome), and in WebKit the stroke on a 4 falls on the digit's own bar, so it reads as a plain 4.
   - C: no mark. Show changes says nothing of the order.
   The pen board is drawn with A.
10. The Ingredients table's step heads follow and carry no mark in any state.
11. Not offered in the pen: the move keys (Ctrl+Cmd+Up and Down). The creation editor's keys work from a step's fields, and in the pen only an open step has fields, which has no Move. Named in `look-p12-pen-step-order` for Mark to say if he wants them.

## Measured

Captured from a scratch build of main at 65678e4f (last `app/` commit 6af1e7b6; never `app/dist`; no Vite process; port 4173 untouched), 1366 x 1024, in Playwright WebKit with a coarse pointer and in Chrome (`p12pm-capture.json`, `p12pm-capture-chromium.json`). Board panels measured in both (`p12pm-measure.json`, `p12pm-measure-chromium.json`).

As built:

- The creation editor's step line: Add step 54.1, Move up 51.7, Move down 69, Remove 48.2 wide, each 44 high, 8 px gaps (WebKit; Chrome 52.8, 50.8, 68.1, 47.9). After Move up on step 4, focus is on "Step 3, move up" and the live region reads "Step 3 of 5", in both engines. A grey Move up pressed: order and live region unchanged.
- The pen's closed step: 88 high, the number 12 wide (11.1 in Chrome), the body 504 wide; its line holds Edit this step (79 x 44) · Remove (48.2 x 44). 10 Tab stops in Instructions for five steps.
- The saved version stores its step keys as `[1, 2, 4, 3, 5]`.
- Show changes with a step removed: the removed step's number struck (20 px), "removed" after its struck words; each step 23 high (24 in Chrome).

Drawn (all 14 panels: no sideways overflow, both engines):

- The step line with four controls is one row: 504 wide, the controls end at 356.7 (350.4 in Chrome); every control 44 high. 20 Tab stops for five steps (18 with one removed). A real Tab walk on each panel lands on the controls in markup order, in both engines.
- "was step 4" is 80.8 x 14.1 at 12 px, on the step's own line; a marked step keeps its height (88 in the pen, 23 in Show changes).
- B's struck number: 12 x 23 under the number; the step is 46 high.

Device-unverified: all of it. This is Playwright WebKit and Chrome on a Mac, the built page for the as-built figures and board markup for the drawn ones. Nothing was seen on Mark's iPad.

## Not settled by these boards

- The three rows above.
- A recipe with one live step (both Move buttons grey) and a pen with every step removed are stated, not drawn.
- A moved step whose words also changed: A's words follow the step's words and the parent's struck words stand beneath, as built. Not drawn together.
- Save over this version with a new order, on a version that has a batch: the batch's step notes are held by step key and stay on their steps; a sheet printed before carries the old numbers. Not drawn, not decided.
- The move keys in the pen (decision 11).
- **Noticed, as built, for triage:** in the pen a removed step's number cell is empty and 0 wide, so its words start 12 px left of the other steps' (92 against 104; WebKit and Chrome). `Method.jsx` says the empty cell keeps the grid from shifting; it does not. The drawn panel shows it as built.
