# Sketch 017: structural contract

**Drawn, not approved.** Mark has not answered `decide-p12-pen-order-scope`, `decide-p12-pen-order-mark` or `look-p12-pen-step-order`. No plan builds from this until he does; his answers are then written into `README.md` and this file.

**APPROVED 2026-11-23** by Mark's answers: scope is order only (`decide-p12-pen-order-scope`), the mark is A, the words "was step 4" (`decide-p12-pen-order-mark`), and the pen board is approved (`look-p12-pen-step-order`). The move keys are not built. Where a section below says it waits on one of those rows, read the answer here.

Read with the files themselves. Their markup and inlined CSS are the authority; this note names what they hold so a planner, a checker and UAT cite one source.

Targets once approved: `pen-step-order.html`, its two "Drawn" rows; `step-order-shown.html`, the panel Mark picks and its second row. On each board the "As built" panels are for comparison and are not targets. Purple tags are notes, not in the app.

Figures are Playwright WebKit with a coarse pointer at 1366, checked in Chrome. Every panel is the built app's markup (a scratch build of main at 65678e4f) with only the changes below drawn over it, so anything not named here is as built (`canvas-generators/p12pm-measure.mjs` prints the figures).

## 1. Scope

- The Next version pen on any saved version, from 724 up (below 724 the pen does not open: sketch 016).
- Order only: a live step moves one place earlier or later. No step is added. No ingredient's amount changes step. Wider scope waits on `decide-p12-pen-order-scope`.
- Remove, Restore, Edit this step, the open step's fields, Change ingredients and Preview step are as built.

## 2. The closed step's line (`pen-step-order.html`)

- `p.method-step__acts` on a closed live step holds, in order: Edit this step · Move up · Move down · Remove. Four `button.text-control`, a middot between each as built.
- Names: `aria-label="Step N, move up"` and `"Step N, move down"`, N the step's number in the draft's order, as its other controls are named.
- A Move that cannot act carries `mk-off` and `aria-disabled="true"`, stays a Tab stop and does nothing: Move up on the first live step, Move down on the last live step. With one live step both are grey (stated, not drawn).
- One row: the line is 504 wide and the controls end at 356.7 (350.4 in Chrome); each control is 44 high. No sideways overflow.
- A removed step's line is as built: Edit this step · Restore. No Move.
- An open step ends with Cancel · Done as built. No Move.
- No `aria-keyshortcuts` and no keys line: the pen offers no move keys (README decision 11).

## 3. What a press does

- The step moves one place among the live steps; a removed step between is passed over in the same press (the rule of `creationSteps.js` `moveStep`). No stored step key changes. Removed steps keep their place in the array.
- Every number follows at once: the margin, each control's name, the Ingredients table's step heads, and every sentence that names a step by number.
- Focus stays on the pressed button of the moved step. When that button turns grey at an end, focus goes to the step's other Move button.
- A polite announcement reads the step's new place among the live steps, of their count: "Step 3 of 5".
- A grey Move pressed: nothing moves, nothing is announced.
- A step open elsewhere stays open. Cancel on an open step puts back its words and leaves its place.
- Restore returns a removed step live at the place it holds.

## 4. Unsaved work

- An order that differs from the opened version's is a change: the pen counts as holding unsaved work, the kept draft holds the order, and Save as new version (and Save over this version) saves it.
- Moving the steps back to the opened version's order leaves no change from the order.

## 5. The mark of a changed order (`step-order-shown.html`; waits on `decide-p12-pen-order-mark`)

One rule for whichever mark is chosen:

- Compare the steps that are live in both the version (or the pen's draft) and its parent, in each one's order. When the two orders are the same, nothing is marked, as built (a removal alone marks only the removed step).
- When they differ, every live step whose number differs from its number on the parent is marked with that parent number.
- A removed step reads as built in both places.
- The mark shows in the pen (live, as the maker moves) and in Show changes. It does not show on the reading page with Show changes off, nor on the printed sheet.

A, recommended, drawn on the pen board:

- The words "was step N" in a `span` of the removed label's type (`method-step__skipped-label`: 12 px grotesk capitals, weight 500), a sibling after the step's words inside `p.method-step__lead` on a read or closed step: where "removed" stands on a removed step.
- On an open step the same span stands last inside `div.method-step__open-fields`, under the two fields: where "removed" stands on an open removed step.
- 80.8 x 14.1 on the step's own line; the step keeps its height.
- No new CSS rule and no new token.

B, drawn for the choice:

- The parent number in `span.method-step__n-from` inside `span.method-step__n`, on its own line under the number, struck (`text-decoration: line-through; text-decoration-thickness: var(--rule-strike)`; `display: block`). Existing tokens only.
- "was step N" in a `span.visually-hidden` after the step's words, for a screen reader.
- A marked step is one line taller (46 against 23 in WebKit).

C, drawn for the choice: no mark.

## 6. The saved version

- Reading page: the steps in the saved order, numbered 1 up. The Ingredients table's step heads follow; no head carries a mark in any state.
- Printed sheet: the same order and numbers; no change marks, as built.

## 7. Stored shape

- None needed: no store change, no `DB_VERSION` change, no `DRAFT_SHAPE_VERSION` change, no migration (README, question 4). A version's order is its `method` array's order, which stored versions already hold out of key order.
- Code that must change, none of it a shape: the pen draws steps and table in the draft's order; `isPenDraftDirty` counts order; `buildDiff` reports each live step's parent number and whether the kept steps' order changed.
