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

## Mark's answers on the round-two redraws (2026-11-23)

| Where | Answer |
|-------|--------|
| `decide-p12-desk-line-closing-words` | B: the closing words are "in a wider window". No word against the Edit page naming its recipe as a link, so that stands as drawn. |
| `decide-p12-pen-target-required-place` | Sid draws the refused target chip; a `/gsd-quick` follows his approval. |
| `look-p12-home-held-draft` | Not approved yet. Mark's note: "1 & 2 - keep these open til I hear back on 3 & 4. 3. Opens version 4 for editing on the phone? 4. I want the sentence on the row too." |
| `look-p12-picker-says-where` | Not approved. Mark's note: "I wanna push back on this. Why are we pushing the row off the screen? Why not insert the ingredient picker after the row and shift the non-needed rows off screen?" |

## Mark's answers on the round-three redraws (2026-11-23)

| Where | Answer |
|-------|--------|
| `decide-p12-home-row-sentence` | Approved, and Keep developing is left out below 724 (the third panel of `home-held-draft-393.html`). |
| `look-p12-picker-after-row` | Approved (`picker-after-row.html`). |
| `look-p12-pen-target-required` | Approved (`pen-target-required.html`). |

`CONTRACT.md` section 13 is approved by these answers.

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
4. Home: a tasted recipe's row has no button; the lead block loses Next version the same way. Keep developing and Adapt only open the recipe page and stay as built. Home's own layout cut is 760; the controls are left out at 724 like everywhere else. (Keep developing: reversed below 724 by Mark's answer to decide-p12-home-row-sentence, 2026-11-23; it is left out of Home's lead there. Adapt stays.)
5. The New recipe and Edit addresses below 724 show the built placeholder place, a title naming the job and one line; the tabs are the way out. A kept draft is not touched. Wording: A, "Done at the desk or on the iPad." (Mark, `decide-p12-desk-page-words`, 2026-11-21).
6. **Drawn in addition to the roadmap text; approved with the board (`look-p12-phone-entry-points`).** A version with an edit kept shows one line under its identity ("Edit kept. Finish it at the desk or on the iPad."), in the built `notebook-version__draft` line's place and role. The build already leaves Record batch and Next version out while an edit is kept (D-24), so without the line the head would show Print sheet and no reason.
7. **Drawn in addition to the roadmap text; approved with the board (`look-p12-phone-entry-points`).** A version with a Next version draft kept shows one line ("Draft: Version 2 · less cream. Finish it at the desk or on the iPad.") and the pen stays shut. Today the pen reopens there at 393 (measured). Next version has no address of its own, so the line stands in for the one-line page. The record act is left out while that draft is kept (Mark, `decide-p12-record-with-draft-held`, B): the head holds Print sheet and the line.
8. The version pen's open step gains Preview step on its own line under the two fields, before the uses line, and the creation editor's own preview block (`.mk-preview`) while pressed (Hide preview). The pen's open step has no Add target; that does not change. Reordering steps in the pen is not drawn (`bug-p11-pen-steps-no-reorder`, deferred by Mark). (2026-11-23: Mark answered that row "fix"; it is drawn in sketch 017, `017-pen-step-order/`, not approved yet.)
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

## Round-two redraws (2026-11-22; the desk line decided 2026-11-23, the other two redrawn in round three)

Three decided redraws from Mark's answers of 2026-11-22 (section "Mark's answers after the round-two build"). Three new boards on the same canvas page, in a second row under the approved ones (canvas version 587, 1795401178-8f0f); the six approved boards and their snapshots are not touched. Made by `canvas-generators/p12r2.py` from `p12r2-capture.mjs` (WebKit, coarse, a scratch build of commit b06add6f, the round-two build), measured by `p12r2-measure.mjs` in WebKit and Chrome. `CONTRACT.md` section 12 holds the build rules. Status after Mark's answers of 2026-11-23: the desk line is decided and **approved by his answer** (redraw 2, redrawn with his words; the build follows); Home and the picker were not approved and are redrawn in "Round-three redraws" below.

| File | Canvas board | What it draws | Mark's List |
|------|--------------|---------------|-------------|
| `home-held-draft-393.html` | `P12R2_HomeDraft` | **Redrawn 2026-11-23 (round three, decisions 31 to 33).** Home at 393 with two Next version drafts kept (Mexican Chocolate Version 3, whose batch awaits a tasting; Underbelly Light Base Version 2, not yet churned): as built; drawn with the sentence on the row too; the same without Keep developing; the page Keep developing opens; the version that holds the draft. | `decide-p12-home-row-sentence` (from `look-p12-home-held-draft`, not approved) |
| `desk-line-words.html` | `P12R2_DeskLine` | **Redrawn 2026-11-23 with the decided words; approved by Mark's answer.** The one-line page as built (New recipe, Edit, Edit at 723); with nothing kept and with work kept, at 393 and 723; Edit naming its recipe as a link back; the same closing words on the two recipe-head lines and on Home's sentence. Every drawn panel reads "in a wider window"; the candidate row is gone. | Decided: `decide-p12-desk-line-closing-words` = B (from `decide-p12-desk-line-words`) |
| `picker-says-where.html` | `P12R2_PickerWhere` | **Not approved; replaced 2026-11-23 by `picker-after-row.html`** (round three, decisions 35 to 41). Kept as the record of what Mark pushed back on; its board's title on the canvas begins "Replaced". 1366. The picker in its built place: as built, then with one line under its heading naming where the pick lands. | `look-p12-picker-says-where` (not approved) |

### Redraw 1: Home follows the version page

19. Below 724, Home's lead reads the version page's own sentence in place of "Draft open on this version · Go to draft": "Draft: Version 5 · more cinnamon. Finish it at the desk or on the iPad.", plain text, no link (`p.home__lead-draft`). Two lines at 393 (327 wide, 14 px).
20. Below 724, an action whose version holds a kept Next version draft is left out of the markup: Record batch when the latest version holds it, Record tasting when the version of the batch awaiting its tasting holds it. In the lead the other action stays (Keep developing, which opens a version that holds no draft). A row loses its whole actions span, as a tasted row does. ~~A row gives no reason; the recipe page's head does.~~ Replaced by decision 31 (Mark, 2026-11-23: "I want the sentence on the row too"). Replaced below 724 by Mark's answer to decide-p12-home-row-sentence (2026-11-23): Keep developing is left out of the lead, so this lead holds no action.
21. From 724 up nothing changes. Decision B stands (no record act from the phone on the version that holds the draft).
22. The closing words are the decided ones, "in a wider window" (decision 23).

### Redraw 2: the desk line

23. **Decided by Mark 2026-11-23 (`decide-p12-desk-line-closing-words`, B): the closing words are "in a wider window".** One phrase, used in every sentence that sends work to the desk: the one-line page, the two recipe-head lines, Home's sentence (lead and row). The other two candidates (A "at the desk or on the iPad, in a wide window", C "at the desk, or on the iPad full screen") were not chosen and are no longer on the board.
24. Nothing kept: "Done in a wider window." under the title, for New recipe and for Edit.
25. Work kept: the page says so in the head's own sentences. Edit with an edit kept: "Edit kept. Finish it in a wider window." New recipe with a draft kept: "Draft: Coffee. Finish it in a wider window." (the head's Draft sentence, the name being the draft recipe's; plain text). The page reads the kept draft and never writes it.
26. Edit names what it would edit: one line under the title, the recipe's name and the version's identity ("Coffee · Version 1"), a link to that version's page, which works at this width (proposed class `place__for`, Home's own text link from existing tokens; 113 × 44). Mark raised nothing against it; it stands as drawn.
27. The recipe-head lines and Home's sentence take the same closing words: "Edit kept. Finish it in a wider window." and "Draft: <draft name>. Finish it in a wider window." Nothing else on those boards changes.

Measured at 393 with the decided words (WebKit; Chrome in brackets where it differs), lines of 14 px text:

| Sentence | Lines |
|----------|-------|
| "Done in a wider window." (page) | 1 |
| "Edit kept. Finish it in a wider window." (page and head) | 1 |
| "Draft: Coffee. Finish it in a wider window." (New recipe page) | 1 |
| "Draft: Version 2 · less cream. Finish it in a wider window." (head, 353 wide) | 2 (1) |
| "Draft: Version 5 · more cinnamon. Finish it in a wider window." (Home's lead, 327 wide; a row, 353 wide) | 2 |
| "Draft: Version 3 · less cream. Finish it in a wider window." (Home's row, 353 wide) | 2 (1) |

At 723 every sentence drawn is one line.

### Redraw 3: the picker says where (not approved; replaced by decisions 35 to 41)

28. One line under the picker's heading row (`div.pick__head`), before Name, names where the pick lands (proposed class `pick__where`: grotesk, the picker's own small size, existing tokens only; 14 px, one line, 502 wide):
    - from a row in a step: "After Heavy cream, 36% fat · in step 1" (the step by its number, as the build already says it aloud: "row 2 of 2 in step 1");
    - from a row in no step: "After Fine sea salt · not in a step yet" (the table's own words for that group);
    - from the heading's Add ingredient: "At the end · not in a step yet".
29. The heading stays "Add ingredient" (12 px capitals; the place in capitals beside Cancel was not drawn: an ingredient's name in capitals reads badly and a long one wraps). The picker group's accessible name carries the place too ("Add ingredient after Heavy cream, 36% fat, in step 1").
30. Pressing another row's Add ingredient while the picker is open changes the line. The picker stays where it is built.

### Measured (round two)

- All 27 panels: no sideways overflow, WebKit and Chrome.
- Home drawn at 393: the lead holds Keep developing alone (327 × 44); Mexican Chocolate's and Underbelly Light Base's rows have no action; Coconut's and Mocha's Record tasting are unchanged (353 × 44).
- As built, the picker opened from Heavy cream's row stands 373 px below the button on this four-row table (the review measured 483 on its own table) and focus is in Name.
- Device-unverified: all of it (Playwright WebKit and Chrome on a Mac).

### Not settled by these boards

- A recipe with no steps, and an empty table: the picker line is stated, not drawn. With no steps the table shows no "Not in a step yet" label, so the line would read "After Fine sea salt" or "At the end"; with no rows there is no line.
- Whether the picker line is announced when it changes (focus goes to Name each time) is for the plan.
- A kept record or Correct draft below 724: Home's "Draft open on this version · Go to draft" is assumed as built there (the pen reopens on the phone); not walked.
- A recipe with an edit kept: Home shows no action and no line at any width, as built. Not drawn.
- The approved boards no longer regenerate byte for byte from `p12g2.py`: the app's stylesheets changed with the round-two build (the inlined CSS differs from `boards/P12G2_*.dc.html`). The served boards and the snapshots are unchanged; regenerating them needs `SPRINKLES_STYLES` pointed at the stylesheets of 2026-11-21.

## Round-three redraws (2026-11-23; Home, the picker and the pen's target are drawn and wait on Mark; the desk line is decided)

Four redraws from Mark's answers of 2026-11-23 (section "Mark's answers on the round-two redraws"). Two boards redrawn in place and two new ones, all in the second row of the same canvas page (canvas version 590, 1795440296-854e). Made by `canvas-generators/p12r2.py` (edited for round three) from `p12r2-capture.mjs`, recaptured in WebKit with a coarse pointer from a scratch build of main at 990076a0 (seven fixes after b06add6f; never `app/dist`), measured by `p12r2-measure.mjs` in WebKit and Chrome; the picker was first measured on the built page by `p12r3-picker-probe.mjs`. `CONTRACT.md` section 13 holds the build rules.

| File | Canvas board | What it draws | Mark's List |
|------|--------------|---------------|-------------|
| `desk-line-words.html` | `P12R2_DeskLine` (redrawn) | The decided closing words on every panel (decisions 23 to 27 above, and 34). | Decided (`decide-p12-desk-line-closing-words`, B). **Approved by Mark's answer.** No new row. |
| `home-held-draft-393.html` | `P12R2_HomeDraft` (redrawn) | Home at 393 with two drafts kept: as built; drawn, the sentence on the row too; the same with Keep developing left out; as built, the page Keep developing opens; as built, the version that holds the draft. | `decide-p12-home-row-sentence` |
| `picker-after-row.html` | `P12R3_PickerAfterRow` (new; replaces `P12R2_PickerWhere`) | 1366. As built (the picker under the Total); drawn: the picker as a row of the table directly after the row that opened it; another row's Add ingredient pressed while it is open; Cancel; as built, the row a pick adds; from the heading's Add ingredient; from the heading with every row in a step. | `look-p12-picker-after-row` |
| `pen-target-required.html` | `P12R3_PenTarget` (new) | 1366. As built: the creation editor's refused target, the pen's refused target (no word), the pen's chip with a changed value; drawn: the value blank, the label blank, a changed value that is not refused. | `look-p12-pen-target-required` |

### Redraw 1: the sentence on the row too (not approved yet)

31. Below 724, a row whose action is left out (decision 20) reads the lead's sentence in the action's place: "Draft: <draft name>. Finish it in a wider window.", plain text, no link (proposed class `home__row-draft`: the lead's `home__lead-draft` type, in the row's `actions` area, existing tokens only). At 393 it is 353 wide, 14 px, two lines in WebKit ("Draft: Version 3 · less cream. …" is one line in Chrome). The lead keeps its own line (decision 19). Mark, 2026-11-23: "I want the sentence on the row too."
32. Keep developing, Mark's question ("Opens version 4 for editing on the phone?"): no. It is a plain link to the latest version's page and opens no pen (`RecipeList.jsx`, `RowActions`); below 724 that page has no Next version (captured: Record batch, Print sheet and the Draft line), so nothing is edited on the phone. It goes where the recipe's name already goes. Two panels: Keep developing kept in the lead, as approved on 2026-11-21 (decision 4), and left out below 724. **Mark picks** (`decide-p12-home-row-sentence`); Sid recommends leaving it out, because the label promises a desk job. A row never shows it below 760 (built). Adapt on a tasted lead is the same kind of link and is not drawn here.
33. From 724 up nothing changes. Decision B stands (no record act from the phone on the version that holds the draft).

### Redraw 2: the desk line (decided)

34. "in a wider window" (decisions 23 to 27, rewritten above with the decided words). Each sentence reads well with it; "Done in a wider window." sits under a title that names the job, as "Done at the desk or on the iPad." did. One thing the words cannot do, as the candidate board said: on a phone there is no wider window to make. Mark chose B knowing that; nothing is reworded.

### Redraw 3: the picker opens after the row (not approved yet)

Mark, 2026-11-23: "Why are we pushing the row off the screen? Why not insert the ingredient picker after the row and shift the non-needed rows off screen?" Measured first on the built page: nothing stands in the way, so it is drawn his way.

35. The picker is a row of the table: `tr.ingredient-table__pick` holding one `td` across the three columns (`colspan="3"`), which holds the built picker unchanged (`div.pick`, 528 wide, 507 high with its list). It stands directly after the row whose Add ingredient (or Cmd+Return in its grams) opened it, inside that row's group (`tbody`), 12 px under the row. The rows after it move down.
36. From the heading's Add ingredient it stands at the end of the table, above the Total: after the last row when that row is under "Not in a step yet" (or the recipe has no steps); in a group of its own under the table's "Not in a step yet" heading when every row is in a step, the heading showing while the picker is open, because that is the group the new row starts. An empty table: where it is built (stated, not drawn).
37. No line is added to the picker. Its place says where the pick lands, so round two's "After … · in step 1" line (decision 28) is not needed on screen. The picker group's accessible name still carries the place ("Add ingredient after Heavy cream, 36% fat, in step 1"; "Add ingredient at the end, not in a step yet"), because position alone says nothing to a screen reader.
38. Another row's Add ingredient pressed while it is open: the picker moves to stand after that row; one picker at a time. What was typed in Name and the chosen Category stay (the build keeps them today, because the picker does not move); focus goes to Name, as built.
39. Cancel: the picker's row leaves the table, the rows below move back up, and focus returns to what opened it, as built. A pick: the new row stands exactly where the picker stood and focus is in its grams, as built (captured).
40. Tab order (walked on the built page with the picker moved, WebKit and Chrome): the opener row's own controls, then the picker (Cancel, Name, Category, Clear filters when shown, the list), then the next row. Shift+Tab from Cancel is the opener row's Remove. The list is 112 stops unfiltered, as it is today between the table and Instructions.
41. The page scrolls only as far as the picker needs, and never moves the opener row out of the top: the row, the gap and the whole picker are 596 px of a 1024 window. Stated for the plan, not drawn.

Measured on the built page (`p12r3-picker-probe.mjs`, 1366 × 1024, WebKit; Chrome within 1 px unless said):

- The table is a real `table`; its bodies are blocks, a body row is a grid of three columns, and a group heading is already one row of one cell across the three (`tr.ingredient-table__step-head > td[colspan=3]`). The picker's row is the same kind of row, so a picker inside the table body is sound for the table.
- As built on the four-row Coffee, the picker opens 322 px under Heavy cream's row and its bottom is 351 px below the window's bottom edge; its list starts 73 px below that edge, so reaching the list means scrolling the row away. On a seven-row table it opens 532 px under the row.
- Moved into the table after the opener row: 12 px under the row, 528 wide (on the board), no sideways overflow, the next row directly under it.

### Redraw 4: the pen's refused target says Required (not approved yet)

Built in cad72d3f: Save as new version (and Save over this version) is refused when a target has one side blank; the step opens and focus goes to the blank side; nothing says why (captured: no word, no `aria-invalid`, an empty status line).

42. Required stands under the blank side, inside the chip, as in the creation editor: `span#step-field-error.field-error` directly after the blank field, which takes `aria-invalid="true"` and `aria-describedby="step-field-error"`, as the pen's refused lead-in does. 12 px grotesk, 210 × 15 under its field; the chip grows from 46 to 65 high (WebKit; 64 in Chrome), the creation editor's own figures.
43. The pen's open-step chip becomes the creation editor's two-row grid, with the columns flowing so the parent's struck value keeps its place before the label: struck value (when drawn), label, value on the first row; Required on the second, under its field. With no struck value the two fields stand exactly where they do today (7 and 219 px into the chip, 210 wide).
44. The same grid on a chip that is not refused, for Mark to confirm with the board: as built the struck value is squeezed to 34 px and breaks into three lines (32 px in Chrome), because the line has no room for it and two fields; in the grid it keeps one line (78 wide) and the fields give up 7 to 14 px.
45. The two cases: the value blank (a blank value differs from the parent's, so the struck value stands first, as built) and the label blank (no struck value at all, whether or not the value changed, because the pen pairs a target with its parent by label). A target with both sides blank is not refused and not drawn (`bug-pen-saves-step-backup-refuses`).
46. One word at a time, in the pen's order (Version name, an amount, then the first step field), as built. The word goes at the next edit anywhere in the pen, as the pen's other refusals do (`usePenDraft.js`, `edit` clears the block).

### Measured (round three)

- All 30 panels: no sideways overflow, WebKit and Chrome.
- Home drawn at 393: the lead holds Keep developing alone (327 × 44) or nothing; Mexican Chocolate's and Underbelly Light Base's rows hold the sentence and no action; Coconut's and Mocha's Record tasting are unchanged (353 × 44).
- The picker's and the chip's figures are in their sections above.
- Device-unverified: all of it (Playwright WebKit and Chrome on a Mac; board markup, and the built page for the probe). Nothing here was seen on Mark's iPad or iPhone.

### Not settled by these boards

- **Noticed, as built, for triage:** in the version pen a target whose value changed shows the parent's struck value squeezed to 34 px, in three lines (WebKit and Chrome, 1366). Decision 44 would fix it; it is a defect today whether or not Mark approves the board.
- Two targets on one step with one refused: the line wraps chips as built and a refused chip is taller than its neighbour. Not drawn.
- The picker with no steps and with an empty table is stated (decision 36), not drawn. Whether its move is announced is for the plan.
- The picker's Name and Category surviving a move (decision 38) needs the plan to keep that state when the picker's place in the markup changes.
- Adapt on a tasted lead below 724 is the same kind of link as Keep developing; not drawn, not raised on the row.
- As round two: a kept record or Correct draft below 724 and a recipe with an edit kept are not walked on Home.
