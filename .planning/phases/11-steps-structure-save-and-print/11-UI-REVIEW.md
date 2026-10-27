# Phase 11 UI review

Impeccable audit of the changed surface (project override of the generic 6-pillar audit). Advisory; does not block verify. Source of truth: `.impeccable/critique/2026-10-27T04-35-13Z__app-src-ui-creationsteps-jsx.md`.

## Verdict

**Ships, with revisions. 35/40.** One P1 new to this phase and local to one stylesheet rule (after a refused Save, a one-sided target's Required stands under the filled field, not the empty one), one P2 that is a decision for Mark (a first version left at its default name reads "Version 1 · Version 1" on the page, Home and the print foot), three P3 notes (a struck target value at the label's size; the off Move control's App colour on the Sheet, as drawn; the Style menu at 15 px). Blank stays blank and no colour carries state both pass. The printed treatment is one treatment on four surfaces at the board's own figures; every control is 44 or more at 1366, 744 and 393; nothing overflows at any audited width with the preview, the checklist and the chooser open; focus is visible on every new control; the step grammar is the pen's. No token was added and no literal entered the stylesheets.

Method: HEAD 98fe7a9d built to a scratch `--outDir "$TMPDIR/sprinkles-11/dist-audit"` (app/dist and Mark's `vite preview` untouched; no Vite dev server), served on an ephemeral 127.0.0.1 port by `08-walk-server.mjs`, driven in Playwright WebKit 2359 and Chromium (system Chrome) with a coarse pointer at 1366 (every state), 744 and 393 (the saved page, the version page while editing, the Notebook row; creation and editing are 1366-only by decision), and 816 × 1056 under print media. A fresh profile per state: the app seeds its own store, then the state's records go into `recipes`, `versions` and `drafts` as `11-board-check.mjs` writes them (create drafts keyed `vanilla-v1` of kind `create`, with five rows, Whole milk split 400/200 across steps 1 and 2, Vanilla extract unplaced, and a refusal draft with a blank name and Version name, a blank and an unreadable grams, an empty step, a one-sided target, a blank scale and two "Bitter" problems; a saved Vanilla root built with `createRecipe` and `rowFromLibraryRecord` for the reading, edit, Notebook and print states; the edit draft made by typing on the edit route and waiting past the 250 ms debounce; Mexican Chocolate v2, seeded, for Show changes). Real DOM only (`getBoundingClientRect`, `getComputedStyle`, `:focus-visible`, `activeElement`, `scrollWidth`). Board conformance was not redone (plan 11-13: 1092 PASS, 0 FAIL). Chromium agrees with WebKit on every colour, size, weight, radius, height and overflow figure; its differences are `ch`-sized widths (chip fields 187 against 211.3, the name field 542.1 against 598.9, text controls 1 to 7 px narrower) and the native checkbox's font. Not verified on the iPad: Mark's device check row (D-20) stands.

## Findings, most severe first

### 1. P1 — After a refused Save, a one-sided target's Required stands under the wrong field

- **Where:** `CreationSteps.jsx`'s target chip with `notebook.css` 243 to 255, on `/notebook/new` and the edit route, 1366.
- **Measured (WebKit 1366; Chromium the same at its widths):** a target with label "temp" and an empty value draws Required at x 324, y 964, 211.3 × 15, under the value field, while it is the standing `.field-requirement`. Press Save: the same word is rendered as `.field-error` and moves to x 111, under the filled "temp" field; nothing stands under the empty value field. A target with an empty label and "4 °C" reads right in both forms (x 111), but only because column 1 is the grid's default.
- **Violates:** D-10 ("Required under the empty field"); the Caption-and-Helper Rule's premise that a message belongs to exactly one input. Cause, from the DOM and the stylesheet: the three rules that place the chip's message (`.target-chip__label-field + .field-requirement` in column 1, `.target-chip__value-field + .field-requirement` in column 2, `.field-requirement` in row 2) name the standing class only; the refused press renders the message with `field-error`, as every refused message does, so it takes the grid's first free cell.
- **Sketch status:** not drawn (no board draws a one-sided target; 11-06 SUMMARY). No redraw.
- **Fix:** `/gsd-fast`: the three selectors in `notebook.css` read `:is(.field-requirement, .field-error)`; then re-run `11-board-steps.mjs` (pB1) and look at the chip after a refused press in WebKit.

### 2. P2 — "Version 1 · Version 1 · Latest": a default-named first version says its name twice

- **Where:** `VersionRow.jsx`'s identity line, Home's lead block (`RecipeList.jsx`), the print foot (`PrintSheetPages.jsx`), all through `versionIdentity` (`lineage.js` 58 to 62) with `blankCreateDraft`'s default Version name "Version 1" (`draft.js` 575).
- **Measured (WebKit):** the page's identity 18/600 "Version 1 · Version 1 · Latest" at 1366, 744 and 393; Home "Vanilla / Version 1 · Version 1"; the print foot "Vanilla · Version 1 · Version 1 · DNZV-BEFJ" (12 px, 0.02em, under a 1 px rule). The edit ceremony's caption reads "Version 1 · editing" once.
- **Violates:** the plain-words rule and the Headline role's own example (`Version 2 · 50 g oil · 800 g`): the authored name says what the ordinal does not. Already recorded by plans 11-01, 11-09, 11-12 and 11-13; the board draws "Version 1 · Latest".
- **Sketch status:** a conformance gap the specs dropped by rule; the board is internally consistent with the plain-words intent and inconsistent with the identity rule.
- **Fix:** Mark decides. (a) `/gsd-quick` in `lineage.js`: when the trimmed label equals the ordinal's own words, `versionIdentity` prints it once (one condition, a test, the walk's print-foot snapshot re-recorded); the stored label is untouched. (b) Sketch first: redraw the board's identity and foot to the repeated form. (c) A different default Version name in `blankCreateDraft` (a `CREATE_DRAFT_KEYS` neighbour; Mark's decision per Phase 10). Recommended: (a).

### 3. P3 — In Show changes, the struck old value reads at the label's size

- **Where:** `StepReading.jsx` `StepTargets` with `targetDiffs`, on a later version's page with Show changes pressed.
- **Measured (WebKit 1366, Mexican Chocolate v2):** "hold" 12/500 caps · "45 min" struck 12/400 (line-through 1.2 px ink, `--rule-strike`) · "60 min" 14/700 underlined; in the table the struck "500 g" is 15 px, the live figure's own size.
- **Violates:** D-18 in spirit (the old value struck, the new bold and underlined, in one row): colour, order and strike hold; the old value is smaller than the one that replaced it, so it reads as a second label.
- **Sketch status:** not drawn (README "For the plan" 8 leaves the struck form to the plan).
- **Fix:** sketch first (Sid draws one changed target on `first-version.html`'s reading panel), then `/gsd-fast`: `.notebook .method-step__targets--tags .struck-value { font-size: var(--sheet-type-section); }` (14 px, weight 400, struck).

### 4. P3 — The off Move control reads an App colour on the Sheet (tension, no change proposed)

- **Where:** `.mk-off` on every step's and row's Move up / Move down at an end of its list.
- **Measured (WebKit 1366):** rgb(89, 89, 89) (`--app-text-secondary`), no underline, default cursor, `aria-disabled="true"`, 44 tall. The Sheet's own colours are four (`--sheet-ground`, `--sheet-ink`, `--sheet-pen-blue`, `--sheet-bookcloth`); there is no `--sheet-*` secondary.
- **Tension with:** the two contexts (`sheet-*` on paper) against sketch 014 CONTRACT section 2, which names the App token, and section 6, no new token. Mark approved the board; recorded, not proposed. The state is also told without colour (the underline goes, the cursor changes, AT hears disabled). If Mark wants paper to stay four colours: ink with no underline, board first, then `/gsd-fast`.

### 5. P3 — The Style menu is the one 15 px control under a coarse pointer (aside)

- **Where:** `CreationSetup.jsx`'s `select.ink-field.mk-menu`, `notebook.css` 497 to 507 (`--app-notebook-size-body`).
- **Measured (both engines, 1366):** 350 × 44 at 15 px; the other 33 fields and controls on the editor read 16 px.
- **Tension with:** the 16px Field Rule (`.ink-field` and `.prose-field` at the note size wherever the pointer is coarse). Phase 10's component, touched by 11-11 only for its messages. iPadOS does not zoom a focused select as iPhone Safari does; device-unverified. `/gsd-fast` if Mark wants every control at 16; otherwise nothing.

## What passed (measured)

- **The heading rows:** Before you start, Ingredients and Instructions each a 528 × 44 row at x 80 with the region name (14/600 uppercase bookcloth) and its add control 13/400 ink underlined at the right: Add note 54.7 × 44, Add ingredient 88.8, Add step 54.1 (Chromium 53.2, 85, 52.8), the board's figures. Add step on the heading adds at the beginning; each step's acts row has its own Add step 54.1.
- **The open step:** no box; the number 12 wide, 20 px grotesk tabular at x 80, top-aligned with the lead-in (both y 1328.4); lead-in 504 × 44 Georgia 16/700 pen blue in the prose-field role; instruction 504 × 52; target label and value 211.3 × 44 each (1 px ink, no radius, no fill, 16 px grotesk tabular, pen blue ink); the target's remove 44.7 × 44 after the value; Add target 64 × 44 then Preview step 77.5 × 44; purpose and aside 504 × 44 prose fields once added; the uses line "uses Whole milk, 3.5% fat, Skim milk powder, Sucrose · change the ingredients" (controls 139, 87.1, 76.9 × 44), "uses nothing yet" on a step with no rows; the acts row remove 44.7 · Move up 51.7 · Move down 69 · Add step 54.1, each 44 tall, the first step's Move up and the last's Move down off.
- **The step grammar matches the pen's open step:** both bodies read lead-in, instruction, targets, purpose, aside, uses line, in that order, with the same 16 px binder fields for a target; the editor adds Preview step and the acts row, the pen adds done and Cancel; the pen's closed steps read the printed treatment with "edit this step" 78.7 and "remove" 44.7.
- **Preview step:** reads Hide preview while open; the preview 504 × 136.4 (the board's figure) between the aside field and the uses line, behind a 1 px ink left rule with 12 px padding; the cue "Preview" 12/500 uppercase; the step as the Sheet shows it: "Warm the milk." 16/700 then the instruction in Georgia 16, the tag row 17 tall ("temp" 35.3, "85 °C" 38.8), why 18.2, the aside 18.2 behind the 2 px rule.
- **The Uses checklist:** legend "Uses" 12/500 uppercase; five rows as 44-tall labels with 13 × 13 binder boxes, the ticked ones filled pen blue; "change the ingredients" reads "done" while open.
- **The table under step heads:** "Step 1 / Warm the milk" and "Step 2 / Finish cold" (lead in Georgia 13), then "Not in a step yet" 131.9 × 32.4; the split row as two lines, 400 and 200 in their own 52 × 44 grams fields, each with "… of 600.0 g · 58.0% in all" at 12 px; each line's acts remove 44.7 · Move up 51.7 · Move down 69, named by step ("Move Whole milk, 3.5% fat up in step 1"); the unplaced row's line ends · Add to step 69.9.
- **Add to step:** pressed, the line reads Cancel 41.6 · Step 1, Warm the milk 133.5 · Step 2, Finish cold 112 · Step 3, Churn 83.9 (wrapping to 88 tall inside the name cell), focus on Cancel; Escape returns focus to Add to step; choosing step 3 moves the row under its head, drops the "Not in a step yet" head, puts focus on "remove Vanilla extract" and announces "Vanilla extract added to step 3".
- **Off controls:** `.mk-off` stays in the tab order, draws the focus ring, carries `aria-disabled="true"` and does nothing.
- **The refused Save:** 12 messages at once, every one 12/400 ink ("Enter a recipe name." under the name, Required under Version name, "Whole milk, 3.5% fat needs an amount, or remove it" and "Sucrose's amount is not a number" in their 1 px-outlined bold rows, Required under the empty lead-in and instruction, under the one-sided target, under the blank scale's Name, Low end, High end and Kind, "This problem is already listed." under the second Bitter), `aria-invalid` on each of the 12 fields, focus on Recipe name, the URL unchanged; with no rows, "Add at least one ingredient." 6 px under the Ingredients heading row and focus on Add ingredient.
- **Save and the landing:** one press lands on `/notebook/<id>/<id>` with "Recipe saved." as the ink card 142.6 × 50 (Chromium 143.4), radius 10, centred, 20 px above the window's foot; "no reason recorded"; Next version 126.3 × 44 filled, Edit 26.3 × 44 underlined, Print sheet 73.6 × 44; History one line; the Batch margin "Not yet churned."; the Instructions as the printed treatment (step to step 20, lead to tags 6, tags to why 6, why to aside 12); the table under "Step 1", "Step 2" and "Not in a step yet".
- **744 and 393:** at 744 Next version filled, Edit, Print sheet on one 44 px line; at 393 Record a batch filled 143.5, Next version underlined 84.3, Edit 26.3, Print sheet on a second line (the acts box 353 × 98); the tag row, why and aside at 329 wide; no field under 16 px, no control under 44, `scrollWidth` 393 and 744.
- **The edit route:** "Version 1 · editing" 12/600 uppercase secondary over Version name (548.7 × 44, the App's field), Cancel 88.3 × 44 outline then Save 74.4 × 44 filled (the board's figures); the band's name and description in Rename's form; the saved rows under their heads; no draft until the first change (drafts empty on arrival, `edit:vanilla-v1` 500 ms after typing); the version page then reads Resume editing 104.4 × 44 and Print sheet with no Next version and no Record a batch, at 1366, 744 and 393; the Notebook row gains Resume editing as a 146.4 × 44 outline button in the row's `act` area at the right at 1366 and below the counts at 744 and 393 (6 px under them, no second draft row); Home's lead block for Vanilla carries no shortcut; Import answers "Save or cancel your changes to Vanilla before importing." as the 448.6 × 50 card with no file chooser.
- **Print (WebKit, print media, 816 × 1056):** two sheet pages; the headings Ingredients, Balance and Instructions in 14 px ink, no Before you start heading when the recipe has none; "Not in a step yet" as a `tr.ps-step-head` like "Step 1" (12/400 uppercase over a 2 px ink rule); `.mp-n` 14, `.mp-lead` 16, tags 12/500 and 14/700 underlined, why 13 upright, the aside behind the 2 px rule; the foot ends with the Sheet code; "Unallocated" nowhere; no block of zero height.
- **Tokens:** the Phase 11 diff of `notebook.css`, `shell.css`, `app.css` and `print.css` adds no `px`, `rem`, `em` or `%` literal outside `var()` and no token; the reading step reads `--sheet-type-label`, `--sheet-type-section`, `--sheet-print-weight-cue` and `-title`, `--sheet-print-tracking-caps`, `--rule-ink-field`, `--sheet-print-tag-underline-offset`, `--sheet-size-deviation-words`, `--sheet-leading-helper`, `--rule-tick`, `--gap-xs`, `--gap-s`, `--gap-l`, all resolved on the page.
- **The hand:** nothing on these surfaces is set in Caveat; the lead-in, instruction, purpose and aside are typed in the prose-field role and shown in the text face in ink.
- **Blank stays blank:** "uses nothing yet"; no purpose or aside field until its control is pressed; no "Not in a step yet" head once every row is placed; a lone History as one line; the Batch margin "no batch yet"; an empty Before you start omitted from the print with its heading.
- **No colour carries state:** Required and every refusal in ink at 12/400 in both forms; the off control told by the lost underline, the cursor and `aria-disabled`; the ticked checkbox a filled box with a tick; the struck value a stroke, not a tint.

## Asides (not Phase 11 findings)

- `.method-step__n` reads 20 px / 400 on screen (app.css 1130, since Phase 1) where the Figure role says 700; sketch 014 section 7 takes it "as built"; the print's `.mp-n` is 14 / 600.
- The head rows' add controls underline at 3 px offset (the fold head's link offset) and every other Sheet text control at 2 px: the board's own split.
- The pen names a target's fields "Step 1, target 1, label" and the editor "Step 1, target 1 label": a comma apart.
- Note for Sid `2026-10-01-for-sid-section-rhythm.md` (not promoted) is untouched by this phase: no new group cue was drawn, and the log column's cues were settled by the Phase 10 follow-up.

## Board matters for Sid (sketch 014 redraw, no build change)

Draw the build's settled decisions back into the boards so the sketch stays the single authority, then one look row for Mark:

- the target chip's remove after the value (D-22);
- the page's Resume editing (Edit's underlined word) and the Notebook row's outline Resume editing, at 1366 and below the counts under 760 (D-04, D-05);
- Print sheet after Save beside Edit;
- the lone version's History as the one line "Only this version so far" (03.5-18);
- the split line's "600.0 g" (the Sheet's one-decimal totals, `formatGrams`);
- fC1's Batch margin "Churned 22 Oct 2026, not tasted yet" in place of "Not yet churned";
- one changed target in the tag row for finding 3 (label once, the old value struck at the value's size, the new bold and underlined).

## For Mark's List

Nothing was written to Mark's List by this audit. Rows for Sarge to add:

1. **decide** `decide-p11-default-version-name-repeats` — "A first version named 'Version 1' reads 'Version 1 · Version 1 · Latest' (page, Home, print foot)". Options: `build-once` (recommended) the identity prints the label once when it equals the ordinal's words, `/gsd-quick` in `lineage.js`; `redraw` the board and the print foot take the repeated form; `default-name` a different default Version name in the create draft. Where: the canvas page Phase 11 steps, structure and save, board P11_Save (after Save), and `/notebook/<new recipe>` after Save.
2. **decide** `decide-p11-struck-target-size` — "In Show changes a struck old target value reads at 12 px beside the 14 px new value". Options: `value-size` (recommended) the struck value at the value's size, `/gsd-fast` after Sid draws it; `as-built` leave it. Where: `/notebook/mexican-chocolate/mexican-chocolate-v2` with Show changes pressed.
3. **look** `look-p11-sketch-014-build-decisions` — after Sid's redraw above: P11_Steps, P11_Save and P11_FirstVersion beside the built pages at 1366. Where: the canvas page Phase 11 steps, structure and save.

Finding 1 needs no row: its cause is clear and it goes to `/gsd-fast`. Findings 4 and 5 are recorded tensions; Mark raises them if he wants them changed.
