---
sketch: 014
name: steps-structure-save
question: "What do the creation editor's Instructions steps look like, with the rows each uses and in what portions; how are steps and rows added, removed and moved; what does Save refuse and where does it land; and how is the saved first version reshaped until it has a batch or a child version, drawn on sketch 013's creation editor at 1366?"
winner: "Approved by Mark 2026-10-25: the four boards on the canvas page Phase 11 steps, structure and save (P11_Save on look-p11-save-r2; P11_Steps, P11_Structure and P11_FirstVersion on look-p11-steps-r3, with decisions 32 to 34 of sketch 013's list drawn on all four). Acceptance target for Phase 11 (MAKE-07, MAKE-10, STRUCT-01 to STRUCT-04); print (MAKE-12) is not drawn here"
tags: [creation, steps, structure, save, first-version, phase-11]
---

# 014 steps, structure and save: the Instructions while creating, the moves, Save and the first version

Approved by Mark on 2026-10-25. `look-p11-save-r2` ("approve", 23:02 UTC: P11_Save with 'Recipe saved.' as the built page notice card) and `look-p11-steps-r3` ("approve", 23:58 UTC: P11_Steps, P11_Structure, P11_Save and P11_FirstVersion with Add ingredient on the Ingredients heading's row, after the three rows of the same evening were decided: `decide-open-step-box` drop, `decide-add-step-per-step` both, `look-p11-preview-step` approve). P11_Structure and P11_FirstVersion were approved as drawn on 2026-10-25 and republished with those answers. Acceptance target for Phase 11 (MAKE-07, MAKE-10, STRUCT-01 to STRUCT-04).

Redrawn 2026-10-26 (Mark: "redraw it now"): `P11_Structure`'s "After remove on step 2" panel now follows roadmap decision 24 (`decide-p11-step-removal-split-portion`, grams-fold-back): Whole milk reads 600 g, 58.0%, with no portion line, and the caption says the Balance stands. Canvas version 469; `add-remove-move.html` re-snapshotted from the served board; the redraw waits on `look-p11-structure-r2`.

Authority: these boards, CSS included, are the authority. Conformance is the board and the built app side by side in a browser, never prose or a test count. `CONTRACT.md` names what the boards hold so a planner, a checker and UAT cite one source.

A new sketch number, not a sixth file in 013: sketch 013's question and `CONTRACT.md` are Phase 10's (MAKE-04 to MAKE-09, MAKE-11, TASTE-01, TASTE-02; its targets are its five files), and these four boards answer Phase 11's design gate (the roadmap: "the creation editor's Instructions steps with their uses and portions, and the Add, Remove, Move up and Move down controls for steps and rows, both while creating and on a saved first version") from their own generator (`p11.py`) on their own canvas page. What they share with 013 is the editor they are drawn on, so this README cites 013's decisions by number instead of copying them; the running list of creation-editor decisions stays in 013 (its 29 to 34 are the Phase 11 answers of 2026-10-25, numbered there because 29 and 31 redrew 013's own boards).

## What is here

| File | Canvas board (page "Phase 11 steps, structure and save") | What it draws |
|------|-----------------------------------------------------------|---------------|
| `instructions-steps.html` | `P11_Steps` | The Sheet column of the creation editor at 1366 (the log column off the crop): no step yet (Add step on the Instructions heading's row, the flat table with its row moves); a step just added (the pen's open step kept open, Required under its two empty fields, the table headed "Not in a step yet"); two steps worked on (a target and a purpose on step 1, step 2's Uses checklist open, the table under step heads); a row in two steps (Whole milk split into one line per step, each with its grams field and the portion line); Preview step open on step 1. Five panels. |
| `add-remove-move.html` | `P11_Structure` | Three steps with remove · Move up · Move down · Add step under each and the same three moves under every row; after Move down on step 1 (the numbers follow the order); after remove on step 2 (deleted outright, its rows back under "Not in a step yet"; the removed step's 200 g of Whole milk fold back into its step 1 line, 600 g, no portion line, the Balance stands: roadmap 24); after Move down on Whole milk (a row moves within its step only). Four panels. |
| `save.html` | `P11_Save` | The whole editor at 1366: ready to save (the ceremony reads New recipe · draft, Version name, Cancel then Save); Save refused ("Enter a recipe name." under the empty name, Required under the empty version name); after Save, the new recipe's page in a 1366 × 1024 window with "Recipe saved." as the ink card at the window's foot. Three panels. |
| `first-version.html` | `P11_FirstVersion` | The saved first version's page with Edit beside Next version; Edit reopening the creation editor on the saved version (the ceremony reads Version 1 · editing, Cancel and Save); once a batch exists, Next version alone. Three panels. |

Not here: print (MAKE-12, Phase 11's criterion 5). No board draws it; sketch 010's bench sheet and the built print are its authority, with the Sheet code fixed at creation (roadmap decision 19). The log column (Style, Scales, Problems) is sketch 013's and is drawn on `P11_Save` and `P11_FirstVersion` unchanged; the P11_Steps and P11_Structure panels are 1000 wide crops of the 1366 page that leave it out.

Source: taken as served by the canvas (https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, version 1792972438-f009, canvas version 468 of 2026-10-25, read 2026-10-26 UTC after the approvals) by `.planning/canvas-generators/snapshot014.py`; the only change is that the canvas's `support.js` line is dropped, so each file opens on its own (checked: all four render in WebKit and Chrome from `file://` with no page errors). The boards carry "(drawn 2026-10-21; redrawn 2026-10-25: Add step and Add ingredient on their heading's row, then the open step without the pen's box, Add step on each step's row, Preview step; decisions 32 to 34)" in their titles, as served. Generator: `.planning/canvas-generators/p11.py` (with `p11-measure.mjs`, `p11-measure.json`, `p11-boxes.json`), on top of `p10.py`: every panel is sketch 013's creation editor (the built shell and Sheet of the 2026-10-17 WebKit capture at 1366 with a coarse pointer, the app's own `tokens.css`, `app.css`, `notebook.css` and `shell.css` resolved at that width) with the steps, the table's step heads, the moves, Save and the after-Save page added as markup and the `P11_CSS` rules, every value of which reads an existing token. The after-Save page is the built reading page of a version with no batch (`bys-capture.json` base2_1366) re-worded for the new recipe, and the Batch margin on the last P11_FirstVersion panel is the built margin of a version with one untasted batch (`empty-capture.json` closed_1366). `boards/P11_*.dc.html` in the generators folder match the served files byte for byte (sha256, 2026-10-26).

## Decisions

The answers these boards draw, each exactly as drawn. Row text on Mark's List is data; the ids are the record. Numbers in brackets are where the decision is written down: "roadmap N" is the table under Before planning in `.planning/ROADMAP.md`; "013 N" is the Decisions list in `.planning/sketches/013-creation-editor/README.md`.

**The roadmap's Phase 11 decisions** (2026-10-16, Mark's answers to the research):

- Rows move up and down within their step; STRUCT-02 stands (roadmap 9). Drawn on `P11_Structure`, "After Move down on Whole milk".
- Removing a row or a step at creation deletes it outright and cleans up what pointed at it (roadmap 10; 013 5 for a row). Drawn on `P11_Structure`, "After remove on step 2": no strike, no restore.
- Removing a step that holds one line of a row used by two steps folds that line's grams back into the row's remaining line (roadmap 24; `decide-p11-step-removal-split-portion`, grams-fold-back, 2026-10-25). Drawn on `P11_Structure`, "After remove on step 2" (redrawn 2026-10-26): Whole milk 600 g, 58.0%, no portion line; the Balance stands.
- The first version stays editable (add, remove, reorder) until it has a batch or a child version (roadmap 12, STRUCT-04). Drawn on `P11_FirstVersion`.

**2026-10-25, morning** (the four decide rows drawn with the boards on 2026-10-21; Mark's answers recorded as roadmap 22 to 25 in commit 80cfaeac):

- Edit beside Next version reopens the creation editor on the saved version, its steps, rows, style, scales and problems as saved, with the same controls as while creating; Save writes over the version, Cancel keeps it; the pen is untouched (`decide-p11-first-version-editor`, A; roadmap 22). Drawn on `P11_FirstVersion`.
- The grams of a row used by two steps are typed in the table: one line per step under each step's head, each with its own grams field and the build's portion line "400 g of 600 g · 58.0% in all"; the step only names the rows (`decide-p11-portion-grams-place`, table; roadmap 23). Drawn on `P11_Steps`, "A row in two steps".
- Removing a step that holds one line of a row used by two steps: the grams fold back into the row's remaining line, Whole milk reads 600 g in step 1 and the Balance stands (`decide-p11-step-removal-split-portion`, grams-fold-back; roadmap 24). **Not what the board draws**: see "For the plan" below.
- The head over rows no step uses yet reads "Not in a step yet" (`decide-p11-unplaced-rows-word`; roadmap 25). Drawn on `P11_Steps` and `P11_Structure`.

**2026-10-25, evening** (Mark's looks and the rows they raised; recorded as 013 29 to 34):

- Add note and Add step sit on their heading's row, in the Show/Hide control's look, not under the list (`look-p11-steps`, Mark's note: "on the row next to the heading, similar to how we place the hide/show link"; 013 29). Drawn on every panel that draws the editor.
- 'Recipe saved.' is the built page notice card at the window's foot, not a line under the bar (`look-p11-save`, "fail. the Notification is wrong in the canvas (superseded by card notifications)"; `look-p11-save-r2`, approve; 013 30; `decide-page-notice-shape` and `decide-notice-card-palette`, which superseded 013 23). Drawn on `P11_Save`, "After Save".
- Add ingredient sits on the Ingredients heading's row like Add step and Add note, gone while the picker is open (Mark's todo, approved; `look-p11-steps-r3`, approve; 013 31). Drawn on every editor panel; the reading page after Save keeps the plain heading.
- No box around an open step in the creation editor and no first-field margin: the number and the lead-in share one top (`decide-open-step-box`, drop; 013 32). The version pen keeps its own box (`app.css .method-step__open-fields`); its first-field margin was the bug `bug-pen-step-number-misaligned`, fixed in quick 261025-rjq (commit 21878842).
- Add step in both places: on the heading's row, adding at the **beginning** of the list, and as the last word of every step's acts row, adding right after that step; focus goes to the new step's lead-in either way; the heading's control is the only one while there is no step (`decide-add-step-per-step`, Mark: "both: Add step on the heading's row (adds at the beginning) and on each step's row (adds right after that step)"; 013 33). The row's recommended option had said the heading's adds at the end; Mark's words win and the boards draw them.
- Preview step at the end of the targets line after Add target; pressed, it reads Hide preview and the step is rendered under its last field, before the uses line, as the Sheet prints it, set off by the Sheet's hairline at the left under a Preview cue (`look-p11-preview-step`, approve; Mark's todo: "some of the actions may not be understandable without seeing the preview. example: Add a target"; 013 34). Drawn open on `P11_Steps`, "Preview step on step 1", closed on every other open step.

Calls made without a row (they stand because Mark approved the boards as drawn; the details are in `CONTRACT.md`):

- The step grammar is the version pen's own open step (sketch 011 decisions 2 and 5: lead-in, text, targets, the uses line, the Uses checklist, add a purpose, add an aside) kept open, as the creation editor keeps every field open (013: Rename's form kept open, the notes as fields). Required stands under an empty lead-in and an empty instruction, as under an empty scale field; a step with Required standing refuses Save as the Version name does.
- Each step's acts row reads "remove · Move up · Move down · Add step"; each row's "remove · Move up · Move down" on the name cell's own line. A move that cannot act (the first step's Move up, the last's Move down, the same within a step's rows) reads as the picker's Added: secondary text, no underline, `aria-disabled`.
- The table's step heads, portion lines and grouping are the build's own (`IngredientTable.jsx groupPortionsByStep`); a step that uses nothing has no head; the numbers follow the order on screen (STRUCT-03: the stored number never changes).
- Save is the filled action after Cancel in the ceremony; the ceremony's caption reads "New recipe · draft" while creating and "Version 1 · editing" (form label "Edit version") on a saved first version. The after-Save page is the seeded recipes' reading page: Version 1 · Latest, no From version on a root, "no reason recorded", History with one node, the Batch margin not churned; the notice clears after 5 s as the others do.
- Edit is an underlined word (the acts row's own link look) beside the filled Next version, only while the version has no batch and no child; Show changes is absent on a root; once a batch exists the acts row reads Next version alone and the version pen's own remove and restore apply to its children.
- 1366 only: Mark does not create recipes on an iPhone (`todo-phone-jobs-product-brief`).

## For the plan

What Phase 11 planning must know, where a board, a decision and the built app do not say the same thing.

1. Resolved 2026-10-26: `P11_Structure`'s "After remove on step 2" panel was drawn on 2026-10-21 with the recommended split (Whole milk 400 g, "the Balance has moved") and contradicted roadmap decision 24 (`grams-fold-back`, Mark 2026-10-25). Mark said "redraw it now"; the panel now draws Whole milk at 600 g, 58.0%, no portion line, the Balance standing (canvas version 469, snapshot refreshed). The plan follows decision 24 as the board now does; `look-p11-structure-r2` asks Mark to look.
2. The built creation editor still puts Add note and Add ingredient under their lists (`CreationPage.jsx` `beforeFoot`, `notebook.css` `.mk-add-row`); the boards put them, and Add step, on the heading's row (013 29, 31, 33). Add scale and Add problem stay under their lists (the log column's regions have no fold head).
3. The build's word for rows no step uses is "Unallocated" (`PrintSheetPages.jsx`; `IngredientTable.jsx` draws no head for a lone unallocated group). The boards read "Not in a step yet" and draw the head as soon as a step exists, even when that step uses nothing and every row is unplaced (`P11_Steps`, "A step just added"); with no step the table stays flat (Phase 10's). What the printed sheet of a saved first version with unplaced rows says is not drawn: "Unallocated" there is the plan's call, with Sid if it changes.
4. The creation step draws no `.method-step__open-fields` box (013 32); the version pen keeps it. The pen's first-field margin is already gone (21878842), so the one difference between the two open steps is the box.
5. The heading's Add step adds at the beginning (013 33), the per-step Add step right after its step; the decide row's option label said "end" and the note says "beginning". Build the note.
6. Decision 013 23 (the notice beside Import) is superseded; 'Recipe saved.' is the built card (`app.css .page-status`), so Save needs no new notice work beyond the words.
7. Print (MAKE-12) has no board here: build it from the rendered app sheet and sketch 010, as the print rule says, and check the iPad PDF.

## Measured

WebKit and Chrome (Playwright, coarse pointer, 1500 × 1000 viewport) on these files from `file://`, 2026-10-26; Chrome's text widths differ by a pixel or two and are given second where they do. Nothing here is verified on the iPad.

- No page errors in either engine. Every panel's page is 1366 wide with its Sheet 920 wide, no element past 1366; the P11_Steps and P11_Structure windows are 1000 wide crops of that page (the log column off the right edge), the P11_Save and P11_FirstVersion windows the full 1366.
- Heading rows: Before you start, Ingredients and Instructions each a 44 row; Add note 54.7 × 44 (53.2), Add ingredient 88.8 × 44 (85), Add step 54.1 × 44 (52.8), the control 14 after the heading.
- The open step: number top and lead-in top equal on every step of every panel (0 px apart in both engines; e.g. pB1 880.6 / 880.6 WebKit, 879.4 / 879.4 Chrome), no `.method-step__open-fields` in any panel's markup (the class survives only as a rule in the inlined CSS). The lead-in field 44 tall. Required twice on the just-added step, nowhere else.
- Step acts: remove 44.7 × 44 (43.1), Move up 51.7 (50.8), Move down 69 (68.1), Add step 54.1 (52.8), all 44 tall; the first step's Move up and the last's Move down carry `.mk-off` and `aria-disabled="true"` with no underline. Row acts the same three words at the same sizes.
- Targets line: Add target 64 × 44 (61), Preview step 77.5 × 44 (74.6), Hide preview 78.8 (75.6). The open preview on pE1: 504 × 103 (504.9 × 102), its left rule 1px solid rgb(20,20,20), its cue 15 tall in the 12 px / 500 grotesk, 12 under the aside line.
- The redrawn "After remove on step 2" panel (WebKit, 2026-10-26, same harness; Chromium not re-run, its headless shell is not installed for this Playwright): still 1754 tall, nothing past 1366, Sheet 920; Whole milk's row 600 / 58.0%, 76.9 tall, no `.ingredient-table__portion-note` anywhere in the panel; heads Step 1 and Not in a step yet; the two steps read 1 and 2; every control 44 tall (remove 44.7, Move up 51.7, Move down 69, Add step 54.1, Add ingredient 88.8, Add note 54.7); the Balance region unchanged (the same `phil` capture).
- Panel heights (WebKit, as `p11-measure.json`): P11_Steps 1528, 1528, 1876, 1792, 1922; P11_Structure 2089, 2089, 1754, 2089; P11_Save 900, 900 (max) and the 1024 window; P11_FirstVersion 620, 900, 620 (max).
- The ceremony: Cancel 88.3 × 44 then Save 74.4 × 44 (88.4, 74.5), on one row; "Enter a recipe name." as `.field-error` on the refused panel; Required under the version name on every editor panel.
- The notice: 'Recipe saved.' 142.6 × 50 (143.4), centred to the pixel, 20 above the window's foot, 16 on 24, rgb(20,20,20) on white text, radius 10, padding 12 / 20; the anchor spans the window's width at its foot.
- The version acts: Next version 126.3 × 44 (125.5) filled, Edit 26.3 × 44 (26.2) underlined, 10 apart; "Version 1 · Latest", History "1 version". On the once-a-batch-exists panel Next version alone.

## Token naming points

The boards add no token: every `var()` in `P11_CSS` resolves in `app/src/styles/tokens.css`, and no literal is drawn. `.mk-preview` reads `--gap-s`, `--gap-xs`, `--rule-graduation`, `--sheet-ink`, `--sheet-type-label` and `--face-grotesk`; `.mk-off` reads `--app-text-secondary`; the notice anchor reads `--app-z-notice`. The heading rows are `p10.py`'s (`--app-notebook-recipe-rail-gap`, `--touch-min`, `--gap-xs`, `--app-notebook-link-underline-offset`).

## Not verified

The iPad (WebKit, 1366, coarse pointer) is unchecked; the numbers above come from Playwright WebKit and Chrome on the dev machine. The move controls' keyboard focus on iPad WebKit is the roadmap's medium-confidence item and is probed on the device from the production build. The Uses checklist, the targets' fields and the preview are drawn, not operated: nothing on a board responds to a press.
