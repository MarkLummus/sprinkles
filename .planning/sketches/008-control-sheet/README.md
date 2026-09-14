---
sketch: 008
name: control-sheet
question: "Drawn from the amended DESIGN.md, does one sheet of every control in every state give one place to tweak the control language before it is applied app-wide — and does fill hold for inline text toggles (A) or only boxed controls (B)?"
winner: null
tags: [controls, states, design-system, tokens]
---

# Sketch 008: The control sheet

## Design Question
DESIGN.md was amended on 2026-09-14 (Phase 03.3.1.1, D-21): a picked or pressed control fills pen blue with the paper's colour for its text, with no change of weight and no underline, and under forced colours an ink outline stands in; measured fields are sized by their width tokens. The rule is app-wide, but it was decided on the record pen alone, and the recipe page's other pressed controls (Show changes, Table as written, the step's Skipped checkbox) follow in a quick-batch. This sheet draws every control in every state on one page so the control language can be tweaked once, before that batch runs — and asks the one question the rule leaves open: does a filled inline text toggle read as a button inside prose?

Built unattended on 2026-09-14 while phase planning ran, from DESIGN.md, `.impeccable/surfaces/route-recipe-batch.md`, sketch 007's live CSS (including its uncommitted D-22 revision), sketch 003's page shell, the sketch-findings skill, `app/src/styles/tokens.css` and `app.css`, and 03.3.1.1-CONTEXT.md D-04 to D-13.

## How to View
Served at http://127.0.0.1:8077/008-control-sheet/index.html (the static server on `.planning/sketches/`), or `open .planning/sketches/008-control-sheet/index.html`.

The first cell of every row is live — hover it, tab into it, click it. Every other cell is a drawing with its state forced by a class (`is-hover`, `is-focus`, `on`, `forced`), so the states sit side by side and can be compared without a mouse. "Annotate on hover" in the toolbar prints the hovered element's computed box, border, fill, ink, type, case, underline and outline — measure, then edit. The width buttons constrain the paper to 393, 768 and 1280.

## What is on the sheet
- **Controls:** the hairline button (`.btn`), the underlined text control, the inline text toggle, the 3-way segmented control (shared borders, `margin-right: −1px`), the five-stop goldilocks axis with its head (name, inline state, Clear) and anchors, the four defect chips with the declared toggle and its "· declared" helper as a sibling after the button, the step's Skipped checkbox.
- **Fields:** the date field at 128px, the numeric field at 48px with its unit word, the prose field, a field-row of three captions and fields that wraps, a field error, the status line.
- **Captions and type roles:** region name, `.lbl`, axis name, helper, deviation words, unit word, placeholder.
- **States:** rest (live), hover, focus-visible, picked or pressed, picked + focus, forced colours (simulated: fill stripped, a 2px outline stands in); invalid on the numeric field; for segment options and chips both "no hover rule (D-06)" and the binder's 1.5px thickening are drawn beside each other.
- **Below 760px:** a second block repeats the controls at touch sizes — 44px minimum height, 40×44 stops on a 216px track, fields at 1rem.

Every visual value reads a theme custom property. Tokens the theme lacks (type roles, field widths, stop geometry, control heights, the checkbox size, the forced-colours outline weight, touch sizes) are defined once on `.app`, each with a comment naming the app token or the 007 line it stands in for, so a tweak on the sheet maps onto one line of `tokens.css`.

## Variants
Both variants are one DOM; the `data-variant` attribute switches only the inline text toggle's pressed CSS, as 007 switched the note's position.

- **A: the D-21 rule as written** — every picked or pressed control fills, the inline text toggles included. A pressed Show changes fills pen blue with ground text and drops its underline; a hair (2px) of inline padding, offset by a negative margin, keeps the word from moving. Under forced colours the fill is stripped and the 2px outline stands in around the word.
- **B: fill on boxed controls only** — stops, segment options, chips, the declared toggle and the checkbox fill; a pressed inline text toggle stays ink and carries the tick weight (2.5px, `--rule-tick`) under it — the third underline weight after rest (1px) and hover (1.5px), all three already on the page. It reads as pressed inside prose without becoming a button, and needs no forced-colours fallback because text decoration survives forced colours. A labelled extra cell tries the alternative the brief named: a leading ink square, hollow at rest and filled when pressed, over a hairline underline.

## What to Look For
- **The text toggle row, A against B.** Does the filled word in A read as a pressed toggle, or as a button that has wandered into the acts row? Does B's 2.5px underline read as pressed, or as a heavier hover? Is the leading square honest (a text toggle is a checkbox) or a third control shape the page does not need?
- **Focus on a filled box** (the "picked + focus" cells): an ink ring 2px off a pen-blue box — does it read as focus, or as a second state?
- **Hover on segment options and chips**: D-06 gives them none; the binder gives every button 1.5px. Which should stand, now both are visible beside each other?
- **The forced-colours cells**: the outline sits on the border (no offset), as 007 draws it, while the focus ring is offset 2px. Should the fallback be offset too?
- **The checkbox fills pen blue** (DESIGN.md § Components) — the app fills it ink today. Which colour is the checkbox's?
- **The invalid cell**: 007 draws the invalid ring at the focus ring's exact weight and offset, so invalid and focus are indistinguishable. Keep, or give invalid the error sentence alone?
- **Captions at 0.04em** (brief, DESIGN.md) — 007's live CSS reads 0.025em on `.lbl` and axis names and 0.035em on region names. Which tracking is the caption's?
- **The field row's two-line caption reservation** (`min-height: 2.4em`, 007 line 39, D-03): the captions sit high above their fields when none wraps.
- Below 760px: 44px text controls (007) against the app's deliberate none — does an inline text control want height?
- **Does the 1.5px weight exist on your screen?** Measured in headless Chromium (Playwright, DPR 1 and emulated DPR 2): every 1.5px border and outline computes and lays out as **1px** — Chromium floors fractional border and outline widths to whole CSS pixels (1.5 → 1, 1.75 → 1, 2.5 → 2; the 1.5px underline is not floored and does render). So in that browser the hover thickening on buttons, stops and checkboxes never appears, the compensated hover box shrinks by 1px instead of holding, and the focus ring is 1px, no heavier than a pressed element's outline. Hover the "hover" cell with Annotate on: if the panel prints `border 1px` on your display too, the hover and focus language needs a whole-pixel weight or a different means. 007 and the app share the same tokens, so whatever this shows holds for them.

## Verified in a browser (2026-09-14, gsd-browser, headless Chromium)
Measured on the served page at 1920×1080 (frame 1280) and on an emulated iPad Mini (768, DPR 2): no console errors; 54 cells, 21 live; no horizontal overflow at either width; nothing in a static cell is tabbable or changes on click; the live stop, segment, chip and text-toggle cells toggle and clear, the axis head switching "(Not recorded)" to "(3)" in pen blue with Clear appearing. Stops 34×32 on a 186px track with matching anchors; the head 24px marked or not; caption-to-field gap 6px; date field 128px; figure field 48px with the unit 4px off it; checkbox 13×13 filling pen blue; chips 32px tall, the declared toggle 20px after them, its helper a lowercase 13px sibling; segment options −1px overlapped, the picked one filled pen blue with a pen-blue border on top; region names 6px above their helper, tracking 0.04em on captions and region names; the touch block at 40×44 stops on 216px, 44px buttons, text controls, options, chips and fields, fields at 16px. Variant B: pressed underline 2.5px, unchanged on hover, no fill, no forced-colours outline; the leading-square alternative shows only in B. Forced cells strip every fill and carry the 2px outline. Not measurable here: the 1.5px weights (see above).

## Choices made unattended (for Mark to confirm)
1. **Mood intake skipped.** The brief fixed the direction, so the workflow ran as `--quick`; no questions were asked.
2. **One sketch, not several.** The brief is one design question, so decomposition produced one row (this sheet) rather than splitting controls across sketches.
3. **One DOM, variant by attribute.** Both variants share the sheet; `data-variant` switches only the inline text toggle's pressed CSS (007's trick), so the rest of the sheet cannot drift between A and B.
4. **The cell set per row:** rest (live), hover, focus, picked, picked + focus, forced; invalid only on the numeric field; pressed + hover only on the text toggle row, where hover and pressed compete for the underline. **No disabled column** — the brief did not ask for one; DESIGN.md's dashed disabled border is drawn nowhere on the sheet.
5. **Hover on segment options and chips: both drawn, neither chosen.** D-06 (no rule) and the binder's 1.5px thickening sit side by side, each labelled.
6. **Forced colours simulated in ink**, not with the `Highlight` keyword, so no fifth colour appears on the paper; the real `@media (forced-colors: active)` rule using Highlight is in the file too. The simulated outline has no offset, as 007 line 141 draws it.
7. **B's pressed treatment is the tick-weight underline** (2.5px), chosen because the page already owns that weight and it survives forced colours; the leading-square alternative is drawn as a labelled extra cell rather than a third variant.
8. **A's filled text toggle takes 2px inline padding with a negative margin**, so the word does not move when it fills — DESIGN.md gives text controls padding 0, so this is an addition to confirm.
9. **Sketch-local tokens on `.app`, not in `themes/default.css`** — the shared theme was left untouched, as 007 did with its `--type-*` roles.
10. **Anchor words in the text face, italic** (007 line 81), not the app's grotesk italic.
11. **The prose field's baseline is the graduation weight** (DESIGN.md "a hairline baseline"; 003 line 41), not 007's literal 2px; its focus is the one ring, not 003's thickened baseline.
12. **Text controls take 44px in the touch block** (007 line 177) though the app deliberately gives them none (`app.css` 1878).
13. **Fields read 1rem in the touch block** (007's ≤600 rule, line 137) though the app drops them to 0.8125rem (`app.css` 1921).
14. **The invalid ring reads its own token** (`--rule-invalid`, pointing at the focus weight as 007 does) so it can be moved without touching focus.
15. **Caption tracking 0.04em** (brief, DESIGN.md), not 007's 0.025em/0.035em; **region-name gap 6px** beneath (DESIGN.md), not 007's 12px.
16. **The checkbox fills pen blue** (DESIGN.md § Components), not ink as the app draws it.
17. **"Table as written" is drawn as the brief names it** although no such control exists in `app/src/ui` today — only Show changes carries `aria-pressed`.
18. **Winner left `null`, no ★** — this is Mark's call; the MANIFEST row says pending.
19. **No `--wrap-up`; 007 and 003 untouched; only `008-control-sheet/**` and `MANIFEST.md` staged.**
20. **No arrow-key roving focus in the live cells** — click, hover and tab work; the radio-group keyboard mechanism is 007's and was not redrawn here.

## Where the sources disagree (listed, not resolved)
1. **DESIGN.md against itself.** § binder (line 132), § Shapes (221) and § Components (229, 237, 240, 242) say a picked control fills pen blue; § Elevation & Depth (212: "a pressed toggle all read bold plus a 1px ink outline offset 2px") and the Do's list (292: "carry picked, open, current, and marked states by weight and outline") still carry the retired rule. The D-21 amendment did not reach them.
2. **Checkbox fill colour.** DESIGN.md § Components: "filled pen blue when checked". `app.css` 150: `input[type='checkbox']:checked { background: var(--ink) }`. The brief (route-recipe-batch.md line 115): "an ink square filled when checked" — colour unnamed. DESIGN.md § Front matter "Axis mark" still describes nine stops "filled ink when checked".
3. **Field widths.** DESIGN.md § Fields: "the date-field width token (128px) … the numeric-field width token (48px)". `tokens.css` still holds `--field-w-date: 12ch` and `--field-w-figure: 6ch`. The sketch theme has no width token; 007 uses the literals 128px and 48px (lines 41, 43).
4. **Caption tracking.** Brief and DESIGN.md: 0.04em. 007's live CSS: 0.025em on `.lbl` and axis names (lines 153–154), 0.035em on region names (152). D-10 cites "0.04em as the sketch's `.lbl` (line 36)", but line 153 overrides line 36.
5. **Region-name gap.** DESIGN.md: 6px beneath. 007 line 31: `margin: 0 0 var(--gap-s)` (12px).
6. **Hover on segment options and chips.** DESIGN.md § binder: the border thickens on hover for buttons (chips and options are buttons). D-06: no hover rule for either.
7. **Text-control size.** DESIGN.md `text-control` typography = small print (0.75rem); `app.css` 72 reads `--size-small-print`. 007 line 163 sets `--type-control` (0.8125rem), and DESIGN.md's Control role (0.8125rem) is "actionable choices".
8. **Segment option and chip size.** 007: `--type-control` (0.8125rem). `app.css` 1698 and 1742: `--size-table-body` (0.9375rem).
9. **Prose-field baseline.** 007 line 33: `border-bottom: 2px solid` (a literal). 003 line 41 and DESIGN.md: hairline. 003 line 42 also thickens the baseline on focus with `outline: none`, against DESIGN.md's one focus ring.
10. **Invalid state.** 007 line 132 draws `[aria-invalid="true"]` at the focus ring's weight and offset — indistinguishable from focus. `app.css` 1787–1797 draws no ring ("the field's aria-invalid is the fact, not a red line"). DESIGN.md names no invalid state.
11. **Anchor-word face.** 007 line 81: text face, italic. `app.css` 1659: grotesk, italic.
12. **Text-control touch height.** 007 line 177: 44px. `app.css` 1878: deliberately none.
13. **Field size at ≤600px.** 007 line 137: grows to 1rem. `app.css` 1921: shrinks to `--type-control`.
14. **Status-line measure.** 007 line 169: 70ch. `tokens.css` reconciles the note role to `--measure-prose` (65ch).
15. **"Table as written."** Named by the brief and by 03.3.1.1-CONTEXT.md's deferred list, but no such control exists under `app/src/ui`; only Show changes (`VersionRow.jsx` 222) carries `aria-pressed`.
16. **Forced-colours outline offset.** 007 line 141: `outline: 2px solid Highlight` with no offset, while the focus ring is offset 2px. Nothing states which is intended.
17. **Filled text-control padding.** DESIGN.md § Components gives `text-control` padding 0; a fill with no padding hugs the glyphs. The sheet adds 2px (choice 8); no source decides it.
