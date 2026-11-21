---
sketch: 016
name: entry-points-pen-preview-row-controls
question: "Below 724, what do the recipe head, the Notebook, Home and More look like without New recipe, Edit, Resume editing, Next version, Import and Export, and what does a hidden job's address show; where does Preview step stand on an open step in the version pen; and in what order do the creation editor's row controls stand, with Add ingredient on each ingredient row, so adding the next row is quick to reach by keyboard?"
winner: "Pending. Proposed 2026-11-21; nothing is built until Mark answers look-p12-phone-entry-points, decide-p12-desk-page-words, look-p12-pen-preview-step, look-p12-row-controls and decide-p12-add-step-place on Mark's List."
tags: [phone, entry-points, notebook, home, more, version-pen, preview-step, creation-editor, row-controls, tab-order, phase-12]
---

# 016 entry points below 724, Preview step in the version pen, row controls (Phase 12 Gate 2)

**Proposed, not approved.** These are the Design gate 2 boards ROADMAP's Phase 12 names (12-CONTEXT D-06). A second planning round plans the builds once Mark approves; the iPad Tab walk (D-11) runs once on the approved control order.

Authority once approved: these boards, CSS included. Conformance is the board and the built app side by side in a browser, never prose or a test count. A `CONTRACT.md` is written when Mark has answered.

## What is here

| File | Canvas board (page "Phase 12 entry points, pen preview and row controls (Gate 2)") | What it draws | Mark's List |
|------|-----------------------------------------------------------------------------------|---------------|-------------|
| `recipe-head-below-724.html` | `P12G2_Band` | The recipe page's head at 393: as built (tasted; a version that can be edited; an edit kept), then drawn: the three standings (Record another, Record tasting, Record batch, each followed by Print sheet), tasted again at 723, a version that can be edited (no Edit), an edit kept (no Resume editing, one line), a Next version draft kept (the pen shut, one line). | `look-p12-phone-entry-points` |
| `notebook-home-more-393.html` | `P12G2_Places` | The Notebook without New recipe; the Notebook with a kept draft, its row without Resume; Home, a tasted recipe's row without Next version; More open without Import and Export. | `look-p12-phone-entry-points` |
| `one-line-page.html` | `P12G2_DeskPage` | The page the New recipe and Edit addresses show below 724 (the built placeholder place: a title and one line), and three wordings A, B, C. | `look-p12-phone-entry-points`, `decide-p12-desk-page-words` |
| `pen-preview-step.html` | `P12G2_PenPreview` | 1366. The creation editor's Preview step as built; the version pen's open step as built; the pen drawn with Preview step, shut and open. | `look-p12-pen-preview-step` |
| `row-controls.html` | `P12G2_RowControls` | 1366. The creation editor's Ingredients and Instructions, as built (41 Tab stops) and drawn (45), the Tab order numbered; then Add ingredient on a row: the row, the picker, the landing in a step group, the landing under "Not in a step yet". | `look-p12-row-controls` |
| `add-step-place.html` | `P12G2_StepOrder` | 1366. Two places for a step's Add step: A leading its last line, B with the line moved up under the two fields. | `decide-p12-add-step-place` |

The example recipe Coffee (Heavy cream, Coffee beans, Dextrose, Fine sea salt; steps Steep and Churn) is Sid's, made through the built creation editor in a throwaway profile. The other recipes are the seed's.

## Decisions drawn (all proposed)

1. Below 724 the controls are left out of the markup, not greyed: New recipe, Edit, Resume editing, Next version (the band and Home's row), Import and Export. Print sheet stays. Rename, Go to batch, Show changes, the folds and the batch log's own controls do not change.
2. The recipe head below 724 reads: one filled control, the record act the version waits on, then Print sheet.
3. A kept new-recipe draft keeps its Notebook row (rail, name, "draft") without Resume. Its name is not a link, as built.
4. Home: a tasted recipe's row has no button; the lead block loses Next version the same way. Keep developing and Adapt only open the recipe page and stay as built. Home's own layout cut is 760; the controls are left out at 724 like everywhere else.
5. The New recipe and Edit addresses below 724 show the built placeholder place, a title naming the job and one line; the tabs are the way out. A kept draft is not touched. Wording: `decide-p12-desk-page-words` (A drawn: "Done at the desk or on the iPad.").
6. **Drawn in addition to the roadmap text.** A version with an edit kept shows one line under its identity ("Edit kept. Finish it at the desk or on the iPad."), in the built `notebook-version__draft` line's place and role. The build already leaves Record batch and Next version out while an edit is kept (D-24), so without the line the head would show Print sheet and no reason.
7. **Drawn in addition to the roadmap text.** A version with a Next version draft kept shows one line ("Draft: Version 2 · less cream. Finish it at the desk or on the iPad.") and the pen stays shut. Today the pen reopens there at 393 (measured). Next version has no address of its own, so the line stands in for the one-line page. The record act is drawn as staying; whether a batch may be recorded while that draft is held is for the plan to settle against the one-pen rule.
8. The version pen's open step gains Preview step on its own line under the two fields, before the uses line, and the creation editor's own preview block (`.mk-preview`) while pressed (Hide preview). The pen's open step has no Add target; that does not change. Reordering steps in the pen is not drawn (`bug-p11-pen-steps-no-reorder`, deferred by Mark).
9. Row controls, add first (D-08). An ingredient row: grams, Add ingredient, Add to step (only under "Not in a step yet"), Move up, Move down, Remove. A step's last line: Add step, Move up, Move down, Remove. Remove is last on both. A greyed Move button is still a Tab stop, as built.
10. Add ingredient on a row (D-09) opens the same picker in the same place; the pick lands right after that row, in the same step group and ticked in that step's Uses, or after it and unplaced under "Not in a step yet"; focus goes to the new row's grams, as the build does after any pick. The heading's Add ingredient stays.
11. Where a step's Add step line stands: `decide-p12-add-step-place` (A drawn on the row controls board; Sid recommends A).

## What this overrides once approved (leftovers below 724)

- Sketch 011 decision 30 (`011-recipe-route-c/393-phone-log.html`, `723-phone-log.html`): Next version as a text control in the band below 724. The filled record act stays as decided there.
- Sketch 013 decision 10 (`013-creation-editor/notebook-new-recipe.html`, its 393 panels): Resume standing in for New recipe; below 724 neither shows.
- Sketch 014 (`014-steps-structure-save/first-version.html`): Edit and Resume editing "at every width"; below 724 neither shows.
- Sketch 014 (`add-remove-move.html`, `instructions-steps.html`): the order Remove · Move up · Move down · Add step / Add to step, at every width.

Those snapshots are not edited; each README points here.

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
