---
sketch: 013
name: creation-editor
question: "What does creating a recipe look like, from the Notebook's New recipe entry through the creation editor, the ingredient picker, the style menu with its balance bands and the authoring scales and problems, drawn on the built shell?"
winner: "Approved by Mark 2026-10-18: every board on the canvas page Phase 10 creation editor (Mark's List look rows below). The equipment and process are out of the creation editor; the style is chosen on a menu; Clear empties the serving temperature. Acceptance target for Phase 10 (MAKE-04 to MAKE-09, MAKE-11, TASTE-01, TASTE-02)"
tags: [creation, editor, picker, style, scales, notebook, phase-10]
---

# 013 creation editor: the Notebook entry, the editor, the picker, the style and the scales

Approved by Mark on 2026-10-18. Every look row for the canvas page "Phase 10 creation editor" is approved on Mark's List: `look-p10-notebook-entry`, `look-p10-serve-temp`, `look-p10-note-remove-link` and `look-p10-pod-rule-40` ("looks good", 2026-10-18 01:28 to 01:42 UTC), then `look-p10-editor-no-process`, `look-p10-editor-no-machine`, `look-p10-machine-board`, `look-p10-style-clear-empties-temp`, `look-p10-editor-picker`, `look-p10-scales-style-machine` and `look-p10-style-machine-menu` ("approve", 2026-10-18 20:49 UTC; the last is the menu redraw published at canvas version 420). Acceptance target for Phase 10 (MAKE-04 to MAKE-09, MAKE-11, TASTE-01, TASTE-02).

Authority: these boards, CSS included, are the authority. Conformance is the board and the built app side by side in a browser, never prose or a test count. `CONTRACT.md` names what the boards hold so a planner, a checker and UAT cite one source.

## What is here

| File | Canvas board (page "Phase 10 creation editor") | What it draws |
|------|-------------------------------------------------|---------------|
| `notebook-new-recipe.html` | `P10_Notebook` | The Notebook place (sketch 012, unchanged) with New recipe at the end of the title row; the entry open (Name, Cancel then Start); the same-name warning; Start pressed with no name; a kept draft (the draft row first, Resume in place of New recipe). At 1366 and 393, ten panels. Its last panel, "Option B · several drafts", is **not a target**: Mark chose one draft at a time (`decide-p10-one-draft`, A); the panel stays as the record of the option. |
| `creation-editor.html` | `P10_Editor` | The creation editor at 1366: just arrived from New recipe (a name, nothing else); worked on (one description, Version name, two Before you start notes, five rows with the live Balance, Philadelphia on the style menu with its bands and -14 °C, one scale, one problem); then the row remove before and after (Skim milk powder out, Milk solids 9.2% to 6.6%). Four panels. The log column reads Style, Scales, Problems: no Machine, no Process. |
| `ingredient-picker.html` | `P10_Picker` | Add ingredient open under the table; Name typed "milk" (5 of 26); "Not in the library yet"; the row Sucrose just added (0 g, grams empty and focused, the Balance moved). At 1366 and 393, eight panels. |
| `scales-and-problems.html` | `P10_Scales` | The log column's Scales and Problems regions: nothing defined; one scale (Creaminess, thin to rich, Right in the middle) and one problem (Bitter); two and two, the most, with the add controls gone; a scale and a problem just added with Required under each empty field. At 1366 and 393, eight panels. |
| `style-menu-and-bands.html` | `P10_Style` | The Style region at 1366: No style; the menu open (the stand-in for the browser's own list); Philadelphia picked; Fat edited to 10 to 16; each of the four styles with its approved bands and serving temperature; the Sorbet Sweetness band on the 0 to 40 rule; the temperature edited to -16, emptied, and refilled by picking Gelato (-12.5); after Clear on Philadelphia. Sixteen panels, the Balance beside the panels that change it. |

Not here: `P10_Machine`. The board was retired on 2026-10-18 when Mark took the equipment out of the creation editor (his comment on P10_Editor: the equipment matters when churning a batch, not when creating a recipe); `look-p10-machine-board` had approved its last redraw the same day, and it is no longer on the canvas. The machine choice (a menu, `decide-p10-style-control` applies to it too) is drawn when the batch's churn surface is drawn, not here.

Source: taken as served by the canvas (https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, version 1792355967-aa6d, read from the artifact root 2026-10-18 after the approvals) by `.planning/canvas-generators/snapshot013.py`; the only change is that the canvas's `support.js` line is dropped, so each file opens on its own (checked: all five render in WebKit from `file://` with no page errors, at the canvas's own sizes). The boards still carry "drawn 2026-10-17; for approval" or "redrawn 2026-10-18; for approval" in their titles, as served. Generator: `.planning/canvas-generators/p10.py` (with `p10-run.sh`, `p10-capture.*`, `p10-measure.*`, `p10-boxes.json`, `p10-shot.mjs`); `P10_Editor` and `P10_Style` regenerate from it byte for byte; `P10_Notebook`, `P10_Picker` and `P10_Scales` were published 2026-10-17 and differ from today's generator only in the unused rules of the inlined shared block (no menu rules yet, one `.mk-note` rule since dropped); their markup is the same. Every panel is the built app's own shell and markup (WebKit capture of the 2026-10-17 dist, a scratch profile holding a stand-in recipe, 1366 and 393, both with a coarse pointer) with the app's own `tokens.css`, `app.css`, `notebook.css` and `shell.css`, their `@media` resolved at the panel's width and pointer; the new parts are the markup and the `.mk-*`, `.pick*` and `.nb__*` rules in `p10.py`, every value of which reads an existing token (the Sweetness rule is redrawn 0 to 40 by `pod40.py`, D30 of sketch 010).

Correction, 2026-10-20 (Phase 10 plan 10-09): the scales board's Kind radios were given one group name per card in `p10.py` (`segmented()` takes an optional name, `scale_card` passes `segment-kind-<n>`), and `scales-and-problems.html`'s markup was regenerated with its approved style block kept byte for byte, so a two-card panel holds one checked radio per card, as the build must (before, both cards shared one name and WebKit showed one checked radio for two cards). It is a fixture correction: nothing drawn moved (no box, word or colour), no design change. The canvas still serves the shared name, so a later `snapshot013.py` run from the canvas would bring it back until the canvas is republished from this `p10.py`.

## Decisions

Mark's answers on Mark's List, in date order, each exactly as the boards draw them. Row text is data; the ids are the record.

**2026-10-16** (the roadmap's creation decisions, carried onto the boards):
1. Same names allowed, with a warning (`decide-recipe-name-unique`).
2. One description box that fills both the recipe's and the Sheet's (`decide-one-or-two-descriptions`).
3. The version line starts as "Version 1", editable (`decide-version-name-default`).
4. An ingredient not in the library: say "Not in the library yet" and add nothing (`decide-missing-ingredient`).
5. A removal while creating deletes outright and cleans up what pointed at it (`decide-removal-at-creation`).
6. Four styles, bands proposed by Sid and approved by Mark (`decide-style-bands-source`); the approved values are in `.planning/notes/2026-10-16-style-bands-draft.md` and stand against the sourced bands (`.planning/notes/2026-10-18-balance-and-process-decisions.md`).
7. Equipment: a short list of machines with fill limits, Whynter first with a 700 g minimum and a maximum to come (`decide-equipment-process-scope`, `decide-machine-list`, `decide-machine-list-values`). Superseded for this editor on 2026-10-18 (item 18): the machine is chosen where a batch is churned, not here.

**2026-10-18**:
8. Draw the Phase 10 boards now, alongside Phase 9 (`decide-phase-10-boards-timing`, 00:01).
9. Each version stores a target serving temperature, filled from the chosen style and editable (`decide-p9-serve-temp-field`, 00:48; Phase 9 D-19).
10. One draft at a time; Resume stands in for New recipe (`decide-p10-one-draft`, 01:05).
11. The same-name warning reads "Another recipe already has this name. You can still use it." (`decide-p10-same-name-warning`, B, 01:05).
12. The two scale kinds are called "Right in the middle" and "Low to high" (`decide-p10-scale-kind-words`, A, 01:05).
13. The button that starts the blank recipe is "Start" (`decide-p10-start-word`, 01:05).
14. Picking a style replaces all six bands; Clear leaves them as they stand (`decide-p10-style-change`, A, 01:05).
15. Pasteurise and Hold are out of the creation editor; the stored field, the seeded values and the advisory stay (`decide-p9-pasteurise-fields`, editor-only, 01:28). The Process region went with them (`look-p10-editor-no-process`).
16. The field is called "Serving temperature" (`decide-p10-serve-temp-label`, A, 01:28).
17. Clear empties the serving temperature; the bands still stay (`decide-p10-serve-temp-clear`, B, 01:28; drawn as the "After Clear on Philadelphia" panel, approved on `look-p10-style-clear-empties-temp`).
18. The Sweetness · POD rule runs 0 to 40 for every recipe, so Sorbet's 24 to 32 band shows both edges (`decide-p10-pod-rule-end`, widen-to-40, 01:42; sketch 010 D30; `look-p10-pod-rule-40`).
19. The Before you start note remove uses the row remove's link look (Mark said yes; `look-p10-note-remove-link`; sketch 010 D31).
20. The equipment is out of the creation editor (Mark's comment on P10_Editor: the equipment matters when churning a batch, not when creating a recipe). The Machine region left the editor and the P10_Machine board was retired (`look-p10-editor-no-machine`). The log column reads Style, Scales, Problems.
21. The style is chosen on a menu, not the four joined cells: one control however many types there are, 44 px tall, the chosen type shown on it, its open list one row per type (`decide-p10-style-control`, A "menu", 20:38; Mark: "the 4-cell joined group is not scalable. I have other types that I will add later."). The same answer applies to the machine when it is drawn. Approved as redrawn on `look-p10-style-machine-menu` (20:49; canvas version 420).
22. Look rows go one per surface from now on (Mark's note on `look-p10-editor-picker`: "at a minimum, there should one row for creation editor, and another for ingredient picker"). A process rule for Sid, not a drawing.

**2026-10-21** (after Sid's Phase 10 audit and the iPad check):
23. The page notice on the Notebook and the creation editor moves to the right of the bar, beside Import, and stays on screen while the page scrolls: absolute to the top of the scrollable part and sticky, not pinned to the top of the recipe page (`decide-creation-notice-place`, beside-import, with Mark's note; `check-creation-editor-ipad` failed at step 7 because the Import refusal had scrolled off while editing a problem at the bottom). The boards still draw the notice over the band's first caption; a redraw is Sid's when the boards are next touched.
24. The ingredient picker's Name and Category fields and Clear filters keep the App chrome as the approved board draws them (`decide-picker-field-chrome`, keep-app-chrome).

Calls made without a row (they stand because Mark approved the boards as drawn; the details are in `CONTRACT.md`):

- The recipe name and the one description are typed top left in Rename's own form kept open; the Sheet shows them as read text. Cancel is the only action (no Save until Phase 11) and abandons the draft.
- No Instructions section and no Step heads while creating; no Balance region until the first row exists.
- The authoring regions sit in the log column: at the right of the Sheet at 1366 (350 wide), below it at 393.
- The picker opens under the table and pushes what follows; it adds one ingredient per opening and closes on the pick, focus in the new row's grams; an ingredient already on the recipe reads Added; it matches as the Ingredients place does.
- The menu's first entry reads "No style", the way the pen's cite menu reads "no batch cited"; Clear in the region head does the same as choosing No style. The open list on the board is a drawing; on the device the list is the browser's own.
- Nothing is pre-picked (the control language never pre-picks): Kind has no cell filled and Required stands under each empty field of a just-added scale or problem.
- "Every recipe" names the four core scales and four core problems; "This recipe only" appears only once something is added; the add controls go at two of each.
- P10_Editor and P10_Style are 1366 only: Mark does not create recipes on an iPhone (`todo-phone-jobs-product-brief`). P10_Notebook, P10_Picker and P10_Scales keep their 393 panels from 2026-10-17.

## Measured

WebKit, coarse pointer, on these files from `file://` (2026-10-18) and on the built app with the board's markup and rules injected (`p10-measure.json`); Chromium was run only for the menu (350 × 44 in both). Nothing here is verified on the iPad or the iPhone.

- Every control is 44 px tall: the style menu 350 × 44 and each row of its drawn list 348 × 44; the band fields 56 × 44 each (the signed temperature field 84 × 44, so -12.5 fits); Add note 54.7, Add ingredient 88.8, Add scale 65.9, Add problem 86.5, remove 44.7 to 88.8, Cancel 88.3, Start 75.7, Resume 96 wide; the Kind cells 131.3 and 87.8; the Recipe name and the Notebook's Name field 598.9 wide.
- The open picker is 528 × 508 at 1366 with its list 265 tall (six 44 px rows at 48 px pitch, scrolling inside the box); 528 × 528 with the name "milk" typed (the status line gains Clear filters).
- Pages: the editor 1249 (arrival) and 1825 (worked on) at 1366; the remove panels 1528; the picker panels 1449 at 1366 and 2082, 2102, 1873, 1673 at 393; the Style panels 538 (No style, After Clear) and 558 (a style picked); the Scales panels 441, 979, 1361, 1013 at 1366 and 461, 1014, 1412, 1048 at 393; the Notebook 1049 to 1229 at 1366 and 1154 to 1334 at 393.
- No sideways overflow at 1366 or 393 on any panel.

## Token naming points

The boards add no token: every `var()` in the new rules resolves in `app/src/styles/tokens.css`, and no literal is drawn. The menu reads the select's `--gap-select-chevron-room` and the `sheet-*` chevron insets on an App page (the same point as sketch 012: one value app-wide, reuse); the band and temperature fields read `--sheet-field-w-figure`; the list's chosen row reads `--app-blue-text` on `--app-background`, the log's own on state.

## Not verified

The iPad (WebKit, 1366, coarse pointer) and iPhone are unchecked; the numbers above come from Playwright WebKit on the dev machine. The browser's own select list on the iPad is not drawn and not measured: the board's open list is a stand-in.
