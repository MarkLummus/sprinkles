---
sketch: 016
name: entry-points-pen-preview-row-controls
question: "Below 724, what do the recipe head, the Notebook, Home and More look like without New recipe, Edit, Resume editing, Next version, Import and Export, and what does a hidden job's address show; where does Preview step stand on an open step in the version pen; and in what order do the creation editor's row controls stand, with Add ingredient on each ingredient row, so adding the next row is quick to reach by keyboard?"
winner: "Approved by Mark 2026-11-21 on Mark's List: the entry points below 724 as drawn (look-p12-phone-entry-points); the one-line page reads 'Done at the desk or on the iPad.' (decide-p12-desk-page-words, A); Preview step in the version pen as drawn (look-p12-pen-preview-step); the row controls as redrawn, with its four points confirmed (look-p12-row-controls-r3); Add step on the step's last line (decide-p12-add-step-place, A)."
tags: [phone, entry-points, notebook, home, more, version-pen, preview-step, creation-editor, row-controls, tab-order, phase-12]
---

# 016 entry points below 724, Preview step in the version pen, row controls (Phase 12 Gate 2)

**Approved by Mark 2026-11-21.** These are the Design gate 2 boards ROADMAP's Phase 12 names (12-CONTEXT D-06). A second planning round plans the builds from them; the iPad Tab walk (D-11) runs once on the approved control order.

Authority: these boards, CSS included. Conformance is the board and the built app side by side in a browser, never prose or a test count. `CONTRACT.md` names what the boards hold so a planner, a checker and UAT cite one source.

> Round-two details (2026-11-21): `CONTRACT.md` section 11 holds the answers to ten gaps the Phase 12 research found; Mark approved them all (`look-p12-round-two-details`). Section 3's Home bullet was corrected to the approved board.

## Mark's answers (all 2026-11-21)

| Where | Answer |
|-------|--------|
| `look-p12-phone-entry-points` | "approve". `P12G2_Band`, `P12G2_Places` and `P12G2_DeskPage` are approved as drawn, the two lines the roadmap did not name included (decisions 6 and 7 below); he raised no objection to either. |
| `decide-p12-desk-page-words` | A: "Done at the desk or on the iPad." The title names the job. The same words end the two recipe-head lines. B and C not chosen. |
| `look-p12-pen-preview-step` | "approve". `P12G2_PenPreview` is approved as drawn. |
| `decide-p12-add-step-place` | A, the last line (answered in chat, closed by Sarge). |
| In chat | A step's operations are two groups, kept together; Cmd+Return adds a step; Ctrl+Cmd+Up and Ctrl+Cmd+Down move it. Every key combination he tested passed on his iPad on a probe page. |
| `look-p12-row-controls-r3` | "approve/confirm." The redrawn `P12G2_RowControls` is approved and its four points confirmed as drawn: (1) the keys shown as one line of small words under each heading, once; (2) the ingredient row in the same two groups (grams, Add to step when unplaced, then Add ingredient, Move up, Move down, Remove); (3) the same keys in a row's grams (Cmd+Return opens the picker to add after that row, Ctrl+Cmd+Up and Down move the row within its step group); (4) the picker stays where it is built, under the table's Total, also when opened from a row. |
| `decide-p12-record-with-draft-held` | B: "Leave Record out while a draft is kept. The head shows Print sheet and the Draft line only; no tasting on that version from the phone until the draft is finished or cancelled at the desk. The board is redrawn." `P12G2_Band`'s draft-kept panel is redrawn without the record act (canvas version 532); nothing else on the board changed. |
| `look-p12-round-two-details` | "approve". Numbers 2 and 4 to 11 of `CONTRACT.md` section 11 are approved as proposed, number 8 included (the keys work from every text field inside a step). |

`look-p12-row-controls` and `look-p12-row-controls-r2` were superseded by r3 before he answered.

## Mark's answers after the round-two build (2026-11-22)

| Where | Answer |
|-------|--------|
| `decide-p12-phone-focus-after-pen-close` | Leave as built: below 724, when a Next version pen closes, focus goes where the browser puts it. Not drawn. |
| `decide-p12-phone-two-kept-lines` | Leave as built: one line, the kept edit first. Not drawn. |
| `decide-p12-narrowing-closes-editor` | Leave as built: the editor is a desk job, and the draft is kept. Narrowing below 724 shows the one-line page. |
| `decide-p12-phone-home-held-draft` | Home follows the same rule as the version page. Sid draws Home with a held draft at 393; a `/gsd-quick` on `RecipeList.jsx` follows his approval. |
| `decide-p12-desk-line-words` | Sid proposes new words and draws two states (work kept, nothing kept); a `/gsd-quick` follows his approval. |
| `decide-p12-picker-says-where` | Sid draws the picker heading naming the landing place; a `/gsd-quick` follows his approval. |

## What is here

| File | Canvas board (page "Phase 12 entry points, pen preview and row controls (Gate 2)") | What it draws | Mark's List |
|------|-----------------------------------------------------------------------------------|---------------|-------------|
| `recipe-head-below-724.html` | `P12G2_Band` | The recipe page's head at 393: as built (tasted; a version that can be edited; an edit kept), then drawn: the three standings (Record another, Record tasting, Record batch, each followed by Print sheet), tasted again at 723, a version that can be edited (no Edit), an edit kept (no Resume editing, one line), a Next version draft kept (the pen shut, one line, no record act: redrawn 2026-11-21 for `decide-p12-record-with-draft-held`, B). | Approved (look-p12-phone-entry-points) |
| `notebook-home-more-393.html` | `P12G2_Places` | The Notebook without New recipe; the Notebook with a kept draft, its row without Resume; Home, a tasted recipe's row without Next version; More open without Import and Export. | Approved (look-p12-phone-entry-points) |
| `one-line-page.html` | `P12G2_DeskPage` | The page the New recipe and Edit addresses show below 724 (the built placeholder place: a title and one line), and three wordings A, B, C. | Approved (look-p12-phone-entry-points); wording A (decide-p12-desk-page-words), B and C marked Not chosen on the board |
| `pen-preview-step.html` | `P12G2_PenPreview` | 1366. The creation editor's Preview step as built; the version pen's open step as built; the pen drawn with Preview step, shut and open. | Approved (look-p12-pen-preview-step) |
| `row-controls.html` | `P12G2_RowControls` | 1366. **Redrawn 2026-11-21** (see "The redraw" below). The creation editor's Ingredients and Instructions as built (41 Tab stops) and drawn (45), and a step with a target, purpose and aside as built and drawn, the Tab order numbered; Cmd+Return in a step and where focus lands; Ctrl+Cmd+Down in a step and where the caret stays; Preview step pressed; Add ingredient on a row: the row, the picker in its built place, the two landings. | Approved, its four points confirmed (look-p12-row-controls-r3, which replaced look-p12-row-controls-r2 and look-p12-row-controls) |
| `add-step-place.html` | `P12G2_StepOrder` | 1366. Two places for a step's Add step: A leading its last line, B with the line moved up under the two fields. **Decided by Mark 2026-11-21: A.** Kept as the record of the choice, as first drawn; its step group order is the first drawing's, not the one to build from. | `decide-p12-add-step-place` (answered: last-line) |

The example recipe Coffee (Heavy cream, Coffee beans, Dextrose, Fine sea salt; steps Steep and Churn) is Sid's, made through the built creation editor in a throwaway profile. The other recipes are the seed's.

## Decisions drawn (approved 2026-11-21; see Mark's answers above)

1. Below 724 the controls are left out of the markup, not greyed: New recipe, Edit, Resume editing, Next version (the band and Home's row), Import and Export. Print sheet stays. Rename, Go to batch, Show changes, the folds and the batch log's own controls do not change.
2. The recipe head below 724 reads: one filled control, the record act the version waits on, then Print sheet.
3. A kept new-recipe draft keeps its Notebook row (rail, name, "draft") without Resume. Its name is not a link, as built.
4. Home: a tasted recipe's row has no button; the lead block loses Next version the same way. Keep developing and Adapt only open the recipe page and stay as built. Home's own layout cut is 760; the controls are left out at 724 like everywhere else.
5. The New recipe and Edit addresses below 724 show the built placeholder place, a title naming the job and one line; the tabs are the way out. A kept draft is not touched. Wording: A, "Done at the desk or on the iPad." (Mark, `decide-p12-desk-page-words`, 2026-11-21).
6. **Drawn in addition to the roadmap text; approved with the board (`look-p12-phone-entry-points`).** A version with an edit kept shows one line under its identity ("Edit kept. Finish it at the desk or on the iPad."), in the built `notebook-version__draft` line's place and role. The build already leaves Record batch and Next version out while an edit is kept (D-24), so without the line the head would show Print sheet and no reason.
7. **Drawn in addition to the roadmap text; approved with the board (`look-p12-phone-entry-points`).** A version with a Next version draft kept shows one line ("Draft: Version 2 · less cream. Finish it at the desk or on the iPad.") and the pen stays shut. Today the pen reopens there at 393 (measured). Next version has no address of its own, so the line stands in for the one-line page. The record act is left out while that draft is kept (Mark, `decide-p12-record-with-draft-held`, B): the head holds Print sheet and the line.
8. The version pen's open step gains Preview step on its own line under the two fields, before the uses line, and the creation editor's own preview block (`.mk-preview`) while pressed (Hide preview). The pen's open step has no Add target; that does not change. Reordering steps in the pen is not drawn (`bug-p11-pen-steps-no-reorder`, deferred by Mark).
9. *(First drawing; replaced by "The redraw" below.)* Row controls, add first (D-08). An ingredient row: grams, Add ingredient, Add to step (only under "Not in a step yet"), Move up, Move down, Remove. A step's last line: Add step, Move up, Move down, Remove. Remove is last on both. A greyed Move button is still a Tab stop, as built.
10. Add ingredient on a row (D-09) opens the same picker in the same place; the pick lands right after that row, in the same step group and ticked in that step's Uses, or after it and unplaced under "Not in a step yet"; focus goes to the new row's grams, as the build does after any pick. The heading's Add ingredient stays.
11. Where a step's Add step line stands: decided by Mark 2026-11-21, A, the last line (`decide-p12-add-step-place`).

## The redraw (2026-11-21, after Mark's decisions in chat; approved, `look-p12-row-controls-r3`)

Mark decided: a step's operations are two groups, kept together whatever the order. One acts on the step itself (lead-in, instruction, aside, targets, purpose, Change ingredients, Preview step); the other on the step among the steps (Add step, Move up, Move down, Remove). Add step stays on the last line. Cmd+Return in a step's field adds a step after it (he tested the key on the iPad with the Magic Keyboard on a probe page; Ctrl+Return too at the desk). His frequency ranking: Add step on nearly every step; aside and target sometimes; Preview step mostly with an aside or target; Move seldom; Remove rarely. The critique of `P12G2_StepOrder` (`.impeccable/critique/2026-11-21T13-42-15Z__generators-boards-p12g2-steporder-dc-html-7590d248.md`) adds: Remove stays the last stop; Preview step comes after both target and aside; show the picker in place.

12. Step, its own group, in Tab order: lead-in, instruction, target (its chips, then Add target), purpose (its field, or Add purpose), the uses line with Change ingredients, aside (its field, or Add aside), Preview step last.
13. Step, list group, on the last line: Add step, Move up, Move down, Remove.
14. What moves against the build to give that order: Add purpose leaves the uses line and stands beside Add target; the aside's field moves from above the uses line to below it; Add aside and Preview step make the step group's last line (Preview step leaves the target line); pressed, the preview block stands under that line, above the list line.
15. Cmd+Return in a step's lead-in or instruction does what its Add step does: a new step after it, focus in the new lead-in. Nothing is typed. Ctrl+Return too at the desk. The button carries `aria-keyshortcuts="Meta+Enter Control+Enter"`.
15a. Ctrl+Cmd+Up and Ctrl+Cmd+Down in a step's lead-in or instruction move the step up or down (Mark, later the same day). The caret stays where it was, in the same field of the moved step; this differs from the Move buttons, which keep focus on the button. The announcement is the Move buttons' own, as built: "Step 2 of 2" (the step's new place of the count; captured). At the ends (up on the first step, down on the last) the key does nothing and says nothing, as a greyed Move does in the build (captured: order and the live region unchanged). The Move buttons carry `aria-keyshortcuts="Control+Meta+ArrowUp"` and `"Control+Meta+ArrowDown"`.
15b. Remove has no key: it is rare and cannot be undone.
15c. Why Ctrl+Cmd and not Cmd alone: Mark's iPad probe (Magic Keyboard, multi-line textarea) passed all twelve cells, Cmd, Ctrl+Cmd, Option+Cmd, Shift+Cmd, Option and Ctrl, each with Up and Down: the keydown reaches the page and preventDefault holds the caret; all twelve also pass in Playwright WebKit. So availability on the iPad was not the constraint. The text-editing conflict was: Cmd+arrow, Option+arrow and Shift+Cmd+arrow are standard caret and selection keys in a text field and keep that work here. No precedent in another app is claimed.
15d. How the maker learns the three keys: one line of plain words under each region's heading, once, in the uses line's small grotesk (proposed class `mk-keys`, existing tokens only: `--face-grotesk`, `--sheet-size-cross-flag`, `--gap-xs`). Instructions: "In a step: Cmd+Return adds a step after it. Ctrl+Cmd+Up or Down moves it." Nothing is added to each step's lines. Confirmed by Mark (`look-p12-row-controls-r3`, point 1). (The first redraw put "Cmd+Return" beside every step's Add step; three keys there would weigh on every step.)
15e. Not drawn and not decided: the keys on a keyboard with no Cmd key, beyond Ctrl+Return for add.
16. Confirmed by Mark (`look-p12-row-controls-r3`, point 2). Ingredient row: grams, Add to step when the row is in no step, then Add ingredient, Move up, Move down, Remove.
17. Confirmed by Mark (`look-p12-row-controls-r3`, point 3). The same keys in a row's grams: Cmd+Return opens the picker to add an ingredient after that row; Ctrl+Cmd+Up and Ctrl+Cmd+Down move the row within its own step group, the Move buttons' limits as built, with their announcement (captured: "Heavy cream, 36% fat, row 2 of 2 in step 1"), the caret staying in the grams. The Ingredients heading carries its own line: "In a row's grams: Cmd+Return adds an ingredient after it. Ctrl+Cmd+Up or Down moves it." Words on each row do not fit the line of a row in no step (measured: the controls ran past the cell).
18. Confirmed by Mark (`look-p12-row-controls-r3`, point 4). The picker opens in its built place, under the table's Total, also when opened from a row; the heading's Add ingredient is away while it is open, as built. On a long table that is away from the row.

Tabs from a step's instruction (counted on the board markup; the Tab walk on it lands on the numbers in order in WebKit and in Chrome):

| To | New step, built | New step, drawn | Written step, built | Written step, drawn |
|----|----|----|----|----|
| target (Add target, or the target's label) | 1 | 1 | 1 | 1 |
| aside (Add aside, or its field) | 5 | 4 | 7 | 7 |
| Preview step | 2 | 5 | 5 | 8 |
| Add step | 9 | 6 | 12 | 9 |
| Remove | 6 | 9 | 9 | 12 |

From a row's grams to Add ingredient: 1 on a row in a step, 2 on a row in no step (Add to step first). The built app's Tab order with a written step was walked in WebKit (26 stops in Instructions) and equals its markup order.

## What this overrides (approved 2026-11-21; leftovers)

- Sketch 011 decision 30 (`011-recipe-route-c/393-phone-log.html`, `723-phone-log.html`): Next version as a text control in the band below 724. The filled record act stays as decided there.
- Sketch 013 decision 10 (`013-creation-editor/notebook-new-recipe.html`, its 393 panels): Resume standing in for New recipe; below 724 neither shows.
- Sketch 014 (`014-steps-structure-save/first-version.html`): Edit and Resume editing "at every width"; below 724 neither shows.
- Sketch 014 (`add-remove-move.html`, `instructions-steps.html`): the order Remove · Move up · Move down · Add step / Add to step, at every width.

Those snapshots are not edited; each README points here, and on the canvas the six boards' titles begin "Part leftover 2026-11-21 (sketch 016): …" (`R35C_393PhoneLog`, `R35C_723PhoneLog`, `P10_Notebook`, `P11_FirstVersion`, `P11_Steps`, `P11_Structure`; canvas version 530). Sketch 014's place for the open preview (under the step's last content field, before the uses line) is also overridden: it stands under Preview step, above the list line.

## Measured

Captured from `app/dist` (built 2026-11-16, after the last `app/` commit 7caf6c11) in Playwright WebKit with a coarse pointer, 393 x 852, 723 x 900 and 1366 x 1024 (`p12g2-capture.mjs`). Board panels measured in WebKit and in Chrome (`p12g2-measure.mjs`):

- Every 393 and 723 panel: no sideways overflow, in both engines. The one-line page's three wordings and "Edit kept. …" each fit one line at 393 (353 wide); the Draft line takes two.
- The left-out controls are absent from every drawn panel's visible controls (the measure script lists them).
- Ingredients and Instructions regions 528 wide on every desk panel, as built.
- As built, WebKit's Tab walked 41 stops through the two regions, in markup order (the board's as-built numbers are that walk). The drawn panel has 45; Tab walked on the board markup in WebKit and in Chrome lands on the numbers in order, on all four numbered panels.
- Tabs from a step's instruction to its Add step: 9 as built, 6 drawn (A), 1 in B. From a row's grams to Add ingredient: 1.
- Desk panel heights differ by 1 to 3 px between WebKit and Chrome (the boards use WebKit's).

Device-unverified: all of it. This is Playwright WebKit on a Mac, not Mark's iPad or iPhone; the Tab order on the iPad's hardware keyboard is what PROOF-02 checks after the build.

## Noticed, not drawn

- The version pen's open step ends with Cancel as a text control and Done as an unstyled button (`<button type="button">` with no class) in the build. Shown as built on the pen board.
- At 393 a kept edit draft's `/edit` address and `/notebook/new` open the full creation editor today.
