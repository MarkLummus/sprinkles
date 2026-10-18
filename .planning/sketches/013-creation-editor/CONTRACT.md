# Sketch 013: structural contract

Read with the files themselves. Their markup and inlined CSS are the authority; this note names what they hold so a planner, a checker and UAT cite one source. Mark approved every board on 2026-10-18 (the look rows in `README.md`). The values below are the boards' own, measured on these files in WebKit (Playwright, coarse pointer) on 2026-10-18. "Token" means a custom property in `app/src/styles/tokens.css`; the boards draw no literal. Nothing is verified on the iPad or the iPhone.

Targets: `notebook-new-recipe.html` (except its last panel, "Option B · several drafts", the rejected option), `creation-editor.html`, `ingredient-picker.html`, `scales-and-problems.html`, `style-menu-and-bands.html`. Not a target: the P10_Machine board, retired and not here.

## 1. The Notebook's entry (`notebook-new-recipe.html`; MAKE-04)

- The Notebook place is sketch 012's, unchanged: the same rows, order and count. New recipe is the filled action (`.notebook-action`) at the end of the title row (`.nb__head`), on the title's own row at 393 too.
- Pressing it replaces the action with the entry (`form.nb__new`, "New recipe"): one field, caption Name (`.ink-field`, 598.9 wide, 44 tall, `autocomplete="off"`), then the actions Cancel (outline) first, then Start (filled). The action goes while the entry is open. The entry sits above the count line.
- Same name: the line "Another recipe already has this name. You can still use it." under the field as `.field-error`, `aria-describedby` on the field; Start still works (decision 11).
- Start with no name: "Enter a recipe name." in the same place (the app's own sentence, as Rename says it). Nothing starts.
- A kept draft: one at a time (decision 10). The draft row (`li.nb__draft`: rail, the name as `h2.nb__name`, meta "draft", Resume as an outline action, 96 × 44) stands first, above the count, in its own list; it is not counted as a recipe. Resume replaces New recipe while a draft exists.
- Words: New recipe, Name, Cancel, Start, draft, Resume, the two sentences above. Count line as sketch 012.

## 2. The creation editor (`creation-editor.html`; MAKE-04, MAKE-05, MAKE-06, MAKE-08)

- The page is the recipe route's `.notebook` with class `mk-page`, 1366 only: the band (`header.notebook-band`), the Sheet (`.notebook-body__sheet`) and the log column (`aside.notebook-log`, aria-label Setup) at its right, 350 wide.
- The band: the recipe's fields at the left in Rename's form kept open (`.notebook-recipe__form`, max width the prose measure): Recipe name (`.ink-field`, 598.9 × 44) and Recipe description (`textarea.prose-field`, 3 rows; one box fills both descriptions, decision 2). At the right the ceremony without Save (`form.notebook-ceremony`, "New recipe"): caption "New recipe · draft", Version name (`.ink-field`, required, starts "Version 1", decision 3) with "Required" under it, and one action, Cancel (outline, 88.3 × 44). Cancel abandons the draft. No Save until Phase 11.
- The Sheet (`article.recipe-page.recipe-page--no-method`): the headnote shows the name and the description as read text; Before you start (`section.before-region`) with its notes as `textarea.prose-field` each followed by remove (`button.text-control`, 44 tall; the row remove's look, decision 19) and "Add note" (`.text-control.mk-add`, 54.7 × 44) under the list; the Ingredients table as the app draws it, flat (no Step heads, no Instructions section), each row with grams and remove; "Add ingredient" (88.8 × 44) under the table; the Balance (`.side-region`) only once a row exists, the Sweetness rule 0 to 40 (decision 18), Watch for the app's own.
- Remove (decision 5): the row is deleted outright; every figure follows and the Balance reads the new standing (Skim milk powder out: Milk solids 9.2% to 6.6%, 1.4% below the 8% band edge).
- The log column holds three regions (`section.batch-row.mk-region`, a `region-name` head each, 44 px head row): Style (section 4), Scales, Problems (section 5). No Machine, no Process (decisions 15 and 20).
- Just arrived (a name, nothing else): the headnote is the name alone; no notes, no rows, no Balance; Style reads No style with the temperature empty and the six bands blank; Scales and Problems show only "Every recipe" and their add controls.

## 3. The ingredient picker (`ingredient-picker.html`; MAKE-06)

- "Add ingredient" opens the picker (`div.pick`, role group "Add ingredient") under the table, in place of the add control, and pushes what follows (the Balance moves down at 393). It is 528 × 508 at 1366.
- Head: caption "Add ingredient" and Cancel (`.text-control`, 44 tall). Then the Ingredients place's own filters (Name field, Category select with All first), the status line ("26 ingredients"; "5 of 26 ingredients" with a filter on; `role=status`, polite) and Clear filters while a filter is on.
- The list (`ul.pick__list`, 265 tall, scrolls inside the box): one `button.pick__row` per library entry (48 px pitch, 44 min), name, then category and the place's summary, then the action word "Add". An entry already on the recipe reads "Added", `aria-disabled`, and does nothing. Rows run A to Z; a name matches when it contains the typed letters in any case; the category matches exactly (sketch 012's rule).
- No match: the list is replaced by "Not in the library yet" (`p.pick__none`, role status), the count "0 of 26 ingredients"; nothing is added and nothing can be typed in as a row (decision 4); Clear filters is the way back.
- Picking: the picker closes, the row lands last at 0 g with its grams field empty and holding focus (`.mk-focus`: the focus outline tokens), and the Balance has moved. One ingredient per opening.
- Words: Add ingredient, Cancel, Name, Category, All, Clear filters, Add, Added, Not in the library yet, "N ingredients", "N of 26 ingredients".

## 4. The style, its bands and the serving temperature (`style-menu-and-bands.html`; MAKE-09)

- The Style region: head "Style" with Clear (`.text-control`, aria-label "Clear Style") at its right only while a style is picked; then the menu; then the Serving temperature field; then the caption "Targets" and six band rows.
- The menu (decision 21): the app's own `select.ink-field.mk-menu` (appearance none, the D-17 chevron, `--gap-select-chevron-room` at the right), in the log's field chrome (`--app-rule-row` divider border, `--app-radius-control`, `--app-notebook-size-body` text), full width: 350 × 44. Its first option is "No style" (selected when nothing is picked), then Philadelphia, French, Gelato, Sorbet. A type added later is one more option. The drawn open list (`ul.mk-list`, role listbox, 348 × 44 a row, the chosen row `--app-blue-text` on `--app-background`) is a stand-in for the browser's own list; the build renders the select and nothing for the list.
- Clear does the same as choosing No style: the menu reads No style, the bands stay as they stand (decision 14), the serving temperature is emptied (decision 17).
- Picking a style replaces all six bands (decision 14) and the serving temperature (decision 9) with the style's own. Editing a band or the temperature leaves the style picked.
- Serving temperature (decisions 9, 16, 17): caption "Serving temperature", a signed number field (`input[type=number][step=any]`, 84 × 44) and the unit "°C" beside it; may stand empty. Style defaults: Philadelphia -14, French -14, Gelato -12.5, Sorbet -14.
- Targets: one `.mk-band` row per figure (350 × 45: a top rule, 44 min), label at the left, two 56 × 44 fields joined by "–" and the unit at the right. Rows in order: Freezing · PAC, Sweetness · POD, Fat %, Milk solids · MSNF %, Sugar %, Solids %. Approved bands (decision 6): Philadelphia POD 14–18, Fat 10–18, MSNF 8–12, Solids 36–42; French 14–18, 10–14, 8–11, 38–42; Gelato 16–22, 4–9, 8–12, 32–42; Sorbet POD 24–32, Solids 26–36, Fat and MSNF blank. PAC and Sugar blank for all four. A blank band reads "no target set" on the Balance.
- The Sheet's Balance reads the bands live: a figure with a band is drawn against it; Sorbet's 24 to 32 shows both edges on the 0 to 40 rule (decision 18).

## 5. Scales and problems (`scales-and-problems.html`; TASTE-01, TASTE-02)

- Scales region: cue "Every recipe" (`.pen-caption.mk-cue`) over "Hardness, Scoopability, Smoothness, Sweetness" (`.mk-core`); cue "This recipe only" only once a scale exists; then the cards; then "Add scale" (65.9 × 44), gone at two scales.
- A scale card (`.mk-card`): head "Scale n" with remove at the right; Name; Low end and High end side by side (`.mk-pair`); Kind as the app's joined two-cell group ("Right in the middle" 131.3 × 44, "Low to high" 87.8 × 44; decision 12), nothing pre-picked; under it the stops it will draw (`.mk-stops`, meta size, secondary text): for Right in the middle "thin · leaning thin · right · leaning rich · rich" from the two words typed; for Low to high "faint to strong". No stops line until both ends are typed.
- Problems region: cue "Every recipe" over "Coarse, icy · Sandy, gritty · Gummy, elastic · Greasy film"; "This recipe only" once a problem exists; a problem card is "Problem n", remove, and Name; "Add problem" (86.5 × 44), gone at two problems.
- Just added: Required stands under each empty field (`.field-requirement`), Kind has no cell filled. 0 to 2 of each (sketch 010 D26 carries the same limit on the printed pages).
- Words: Scales, Problems, Every recipe, This recipe only, Scale 1, Scale 2, Problem 1, Problem 2, Name, Low end, High end, Kind, Right in the middle, Low to high, Add scale, Add problem, remove, Required.

## 6. Rules for every panel

- Every control is 44 px tall under the coarse pointer (`--touch-min`): fields, cells, menu, list rows, links and add controls. Nothing moves on hover or focus.
- The log column's regions are separated by `--app-rule-row` in `--app-divider`; the first has no top rule.
- No new token. The `mk-*`, `pick*` and `nb__*` rules in `p10.py` read existing tokens only; the build keeps that.
- 1366 (the iPad) is the creation width. P10_Editor and P10_Style are drawn at 1366 only; the 393 panels on P10_Notebook, P10_Picker and P10_Scales are the phone's share of those surfaces (the Notebook, the picker inside a 393 page, the log column stacked below the Sheet).

## Decision map

Decisions 1 to 7 (2026-10-16, the roadmap) set the words and rules; 8 to 22 (2026-10-18) are the boards' own. 7 (the machine list) is superseded for this editor by 20 (the machine is chosen where a batch is churned). 14 (Clear leaves the bands) and 17 (Clear empties the temperature) are both drawn in the "After Clear on Philadelphia" panel. 21 (the menu) replaced the four-cell group drawn on 2026-10-17 and approved in principle on `look-p10-scales-style-machine`; the menu redraw is the approved shape. The numbers are `README.md`'s Decisions list.
