# 012 places: the Notebook place and the Ingredients place

Approved by Mark on 2026-10-17 (Mark's List: `look-p9-place-boards` "approved", `decide-p9-category-filter` A, `decide-p9-notebook-order` A, `decide-p9-provenance-words` A). Acceptance target for Phase 9's two places (PLACE-01, PLACE-02). Phase 10's picker reuses the Ingredients list; the picker is not drawn here.

Authority: these boards, CSS included, are the authority. Conformance is the board and the built app side by side in a browser, never prose or a test count.

## What is here

| File | Canvas board (page "Phase 9 places") | What it draws |
|------|--------------------------------------|---------------|
| `notebook-place.html` | `P9_Notebook` | The Notebook place at 1366 and 393 (both a coarse pointer): the eight seeded recipes, one recipe, none; the 393 page scrolled to its end |
| `ingredients-place.html` | `P9_Ingredients` | The Ingredients place at 1366 and 393: the 26 library entries A to Z with Heavy cream open, three more open entries (Cocoa powder: five figures, all estimated, a long source; Locust bean gum: no source recorded; Milk Chocolate: not dairy, 16% milk solids, every basis unreviewed), name typed (milk), category chosen (Sugar), no match. Redrawn 2026-10-19 (decisions 5 to 7 below); the other two files are the 2026-10-17 boards |
| `ingredients-place-103-entries.html` | `P9_IngredientsMany` | The same page at the reviewed seed dataset's 103 names, a stand-in for "a few hundred"; Category chosen: Fruit |

Not here: `P9_CategoryOptions` (the select against chips). Option B, chips, was rejected and is recorded under Decisions below, not kept as a live board. `.planning/canvas-generators/places.py` still draws it if ever needed.

Source: taken as served by the canvas (https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, version 1792211169-a33d, read from the artifact root 2026-10-17; `ingredients-place.html` from version 1792382308-1af5, read 2026-10-19) by `.planning/canvas-generators/snapshot012.py`; the only change is that the canvas's `support.js` line is dropped, so each file opens on its own (checked: all three render in WebKit from `file://`). The boards still carry "drawn 2026-10-17; for approval" in their titles, as served. Generator: `.planning/canvas-generators/places.py` (with `places-capture.*`, `places-data.*`, `places-measure.*`). Each panel is the built app's shell (WebKit capture of the 2026-10-17 dist) with the app's own `tokens.css`, `app.css`, `notebook.css` and `shell.css`, their `@media` resolved at the panel's width and a coarse pointer.

## Decisions

Four answers from Mark, 2026-10-17, each exactly as the boards draw them:

1. **Category filter: A, a select, not chips** (`decide-p9-category-filter`). One field the width of its longest word (120 px at 1366, 44 px tall), All first, the eleven categories in one list. Option B (one radio chip per category, wrapping, 44 px each) was rejected: it shows every category and picks in one tap, but the line grows with the library (77 px more at 1366: 461 against 384 px page; 102 px more at 393: 566 against 464) and Phase 10's picker has less room than this page. B used only existing tokens (App radius, divider edge, subtle surface for the picked chip, weight 600).
2. **Notebook order: A, most recently touched first, the same order as Home** (`decide-p9-notebook-order`). The board's order is Home's own (`activeWork()`), not a sort of its own.
3. **Provenance words: A, "Basis | Source"** (`decide-p9-provenance-words`). The last two columns of an open entry's figures say Basis (stated, derived, estimated, unreviewed: the app's own words) and Source (the entry's own text for that figure, or "not recorded"). The word Source then also appears on the Sheet's ingredient table, where it carries the basis word; Mark accepted that overlap. B, "Basis | Where from", was not chosen.
4. **Every new word, approved as drawn** (`look-p9-place-boards`): Name, Category, All, Show, Hide, Basis, Source, not recorded, Other solids, Emulsifier, Stabilizer, Clear filters, "No recipes yet.", "No ingredient matches. Try another name or category."

Calls made without a row (they stand because Mark approved the boards as drawn):

- **The rail stays on every Notebook row at 393.** Home drops its rail below 760 (DESIGN.md, Mark 2026-09-22); the Notebook place keeps it, because a row there has no action button to crowd it. This is the one exception to Home's behaviour and the only place the two lists differ in their mark.
- **Counts in words only.** "1 recipe", "8 recipes"; a row reads "1 version", "3 batches", "not yet made" (Home's own words). No tally sprinkles: the marks add noise to a list whose job is finding.
- **Filters are not sticky.** They scroll away with the page. At 393 they take 140 px of 852; Phase 10's picker has its own scroll area where its search stays put.
- **Ingredient rows run A to Z by name**, case-insensitive ("Whole Milk 3.3%" before "Whole milk, 3.5% fat"). No ranking and no grouping by category.
- **A detail line is omitted when an entry lacks the field.** Density, heat treatment, packed state and hydration temperature each appear only where the entry has them; the lactose line for any entry holding milk solids (decision 6; it was dairy only until 2026-10-19); the Note only where the entry has one; a figure row only for a figure the entry holds. Nothing is shown as a dash or "none". A figure with no source text says "not recorded".
- The rest of the drawing follows from these: the Notebook starts nothing (no New recipe, no Resume, no gap held for them); the Ingredients place is read-only (nothing adds, edits, duplicates or deletes); a row is the fold, so an entry opens in place and the page has no new route; the count line is a polite live region; Clear filters appears only while a filter is on; the count reads "N ingredients" and, with a filter on, "N of 26 ingredients".

### Redrawn 2026-10-19

Three answers from Mark on the built place (Phase 9 UI review), drawn into `P9_Ingredients` only; `P9_Notebook` and `P9_IngredientsMany` are unchanged:

5. **Below the 760 cut, the source sits on its own line under the basis** (`decide-p9-393-source-own-line`, redraw). In an open entry's figure row the list reads figure and amount on one line, then the basis word, then the source text left-aligned on a line of its own, so a long source (Heavy cream's Fat: "panel reconciled three ways against a 36% regulatory floor") wraps under the basis instead of running into it. At 1366 nothing changes: the four columns stay. **The rule the build needs** (`app/src/styles/shell.css`, inside its `@media (max-width: 759.98px)` block): `.place .ing__figures tr { grid-template-areas: 'fig amt' 'basis basis' 'src src'; }` in place of `'fig amt' 'basis src'`, and `.place .ing__figures .ing__source { text-align: left; }` in place of `right`. Nothing else moves; no new token. Measured in WebKit on the 2026-10-19 build with the rules injected: Heavy cream open at 393 is 498 px (was 481); Cocoa powder 550.5 (unchanged: its sources already wrapped onto their own lines); Milk Chocolate 587; no horizontal overflow at 393.
6. **The lactose line shows for any entry with milk solids** (`decide-p9-lactose-line-non-dairy`, any-milk-solids). "Lactose counts as 54.5% of milk solids in Freezing and Sweetness." appears under the facts line whenever the entry holds a Milk solids figure, dairy or not (built in 55891a98: `IngredientsPlace.jsx` shows it when the entry is dairy or holds a Milk solids figure). Drawn on the new Milk Chocolate crop (flavor, 16% milk solids, from the reviewed dataset the store merges under the 26, so `places-data.json` now carries `seedDb`): every basis unreviewed, no facts line because the entry has none of the four fields, the line under the figures.
7. **The facts line is value-first** (`decide-p9-facts-line-shape`, value-first): no labels, each value sentence-cased, joined by the middle dot in the same order as before. Heavy cream reads "Density 0.994 g/ml · Ultra-pasteurised"; Sucrose will read "Density 0.85 g/ml · Granulated, loose"; Locust bean gum reads "Hydrates at 82 °C", the entry's stored `hydrationC`, with the source's prose ("commonly cited 80–85 °C, varies by grade") kept off the line. Mark's option label gave "Hydrates at 80–85 °C" as its example; the entry stores 82, and the board draws the stored number. If he wants the source's range on the line instead, that is a change to bring back here.

Also in the redraw, without a decision: the 1366 crops of Cocoa powder, Locust bean gum and Milk Chocolate now start at the row (the measure script's `crop1366.y0` was unset before, so those windows began at the page top); the Ingredients board is 6052 px tall (was 5283).

## Measured

WebKit, coarse pointer, on the built app with the board's markup and rules injected (`places-measure.json`); the boards match it to the pixel. Chromium was not run. Nothing here is verified on the iPad or the iPhone.

Notebook place (8 recipes, 1 recipe, none):
- Row height 97 to 136 px at 1366 and 108 to 159 px at 393 (the 393 row stacks name, description, then counts in words on one line). Page 1079 px at 1366, 1184 at 393; one recipe 400 and 428; none 270 and 275.
- Name link 44 px tall at both widths; the count line is 17 px. The description shows only where the recipe has one (Olive Oil has the only one), cut at two lines.
- No horizontal overflow at 393, 724, 834, 1024, 1100, 1366 or 1590. The row has one cut, 760 (Home's own): below it the counts move under the description.

Ingredients place (26 entries):
- Closed row 69 px at 1366, 88 to 105 at 393. Heavy cream open 342.5 px at 1366, 481 at 393; Cocoa powder open 337 and 550.5; Locust bean gum open 156 and 194.
- Whole page 2452 px at 1366, 3340 at 393. Name typed "milk": 5 rows, page 729 and 921. Category Sugar: 4 rows, 660 and 816. No match: 415 and 517.
- Every row head, the Name field and the Category select are 44 px tall (the touch floor); the Name field is 598.9 px wide and Category 120 px at 1366; Clear filters is 78.6 by 44. No horizontal overflow from 393 to 1590. Cuts: 1100 (the row's category moves above the name) and 760 (the fields stack; the figures table reads as a list, figure and amount then basis and source, as the ingredient table does below 724).

At the reviewed dataset's size (103 names):
- 7491 px tall at 1366 (69 px a row) and 9930 at 393 (71 to 109 px a row). Fruit: 21 of 103, 1833 and 2652 px. At 300 entries that is about 20,700 px at 1366 and about 26,000 at 393.

## Token naming points

The boards add no token: every `var()` in the new rules (37 of them) resolves in `app/src/styles/tokens.css`, and no literal is drawn. Three names that read oddly on these pages, for the build to keep as they are or to rename on purpose:

1. **The select chevron is `sheet-*` on an App page.** The Category select reads `--sheet-size-select-chevron`, `--sheet-inset-select-chevron-x` and `--sheet-inset-select-chevron-y` (and the unprefixed `--gap-select-chevron-room`). One value app-wide (house rule): reuse them; do not copy them into `app-*` unless a named exception needs a different value.
2. **`--app-notebook-size-body`, `--app-notebook-desc-leading` and `--app-notebook-identity-size` are read by the Ingredients place too** (the figures table and note at 15px, the entry name at 18px), and the first two by the Notebook place's description. They are named for the recipe route's band; the values are the right ones. Reuse; renaming to a place-neutral name is optional and belongs in its own change.
3. **`--app-col-standing` (120px) and `--app-col-tally` (132px) are Home's row columns**, named for the standing word and the tally marks. Here the first sets the Category select's minimum width and the second sets the Notebook row's counts column, where no mark is drawn. Same value, a different job; reuse.

(The place colours are the existing `--app-notebook` and `--app-ingredients`; the rail mark is `--app-radius-rail`, 4px, 8px wide.)

## The search the board assumes

The board's search is `filterLibrary(records, query, category)` kept as simple as the board draws it: **a name matches when it contains the typed letters, in any case; the category matches exactly** ("All" matches every category); the rows that match keep the A to Z order. "milk" finds five of the 26 entries. This is narrower than the research draft (`.planning/research/SUMMARY.md`: folds diacritics, matches all tokens, ranks name-prefix first). If the build adds any of that, the board's order and counts change for some queries, and that is a design change to bring back, not a build detail.

## Not verified

The iPad (WebKit, 1366, coarse pointer) and iPhone are unchecked; the numbers above come from Playwright WebKit on the dev machine. Chromium was not measured.
