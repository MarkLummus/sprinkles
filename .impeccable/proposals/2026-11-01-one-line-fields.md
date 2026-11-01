# One-line fields: which single-line inputs become one-row textareas

Sid, 2026-11-01. From Mark's List row `bug-ipad-tab-lost-from-single-line-fields` (Mark's answer `fix`: "Sid rules on the field kind for single-line fields, then a /gsd-quick-batch switches them"). Decision row: `decide-one-line-fields`. No board changes: every switched field keeps its look (section 3), so nothing is redrawn and the canvas is not republished.

## 1. Why

iPadOS 27 Safari (27.0.1, Magic Keyboard, Full Keyboard Access off) drops a hardware Tab from every `<input>` element tried: type text, search, number and tel, text with `inputmode=decimal`, inside a form, with `enterkeyhint=next`. No keydown reaches the page, the window blurs and focus leaves the page. A `<textarea rows=1>` and a contenteditable div take Tab and focus moves on; buttons with tabindex 0 take it normally. Verified on Mark's iPad in three rounds, the last on bare pages with no Sprinkles code (`.planning/debug/ipad-magic-keyboard-tab-create.md`, Evidence 2026-11-01T20:13 to 20:23, and Resolution). Nothing in the page can see or catch that Tab, so the only remedy is the field kind.

Quick 261101-lec (22ec33f5, ed93b024) switched the creation step's lead-in and the creating row's grams field to one-row textareas through `app/src/ui/oneLineField.js` (Return held, line breaks stripped) with tokens-only CSS in `notebook.css`; its probe showed both unchanged (132 PASS, WebKit and Chrome, 1366 fine, coarse and coarse DPR 2) and Mark passed them on the iPad. That is the pattern this ruling extends.

## 2. Every remaining single-line input, and the ruling

26 `<input` lines in non-test `.jsx` under `app/src`: two are `Checkbox.jsx` and `Radio.jsx` (not single-line), one is the Shell's hidden file input, two are dates, and 21 are text or number fields at 20 sites (one site, `BatchRow.jsx` 132, renders both a text and a number branch).

**Switch (20 sites):**

| # | File:line | On screen | Type, inputmode | Drawn on |
|---|---|---|---|---|
| 1 | `CreationPage.jsx` 657 | Recipe name (creation) | text | sketch 013 `creation-editor.html`, 014 `save.html`, `first-version.html` (P10_Editor, P11_Save, P11_FirstVersion) |
| 2 | `CreationPage.jsx` 690 | Version name (creation ceremony), required | text | 014 `save.html`, `first-version.html` (P11_Save, P11_FirstVersion) |
| 3, 4 | `CreationSteps.jsx` 123, 133 | a step's target, label and value (creation) | text | 014 `instructions-steps.html`, `add-remove-move.html` (P11_Steps, P11_Structure) |
| 5 | `BatchRow.jsx` 132, unsigned branch | Duration, Tempering, Melt test (record pen) | text, decimal | sketches 007 and 008; 011 `record-pen-app.html`; P10_Pen |
| 6 | `VersionRow.jsx` 215 | Version name (version pen), required, autofocus, placeholder "e.g. less oil" | text | 011 `1600-pen.html` |
| 7 | `NotebookPlace.jsx` 232 | Name (Notebook, New recipe) | text | 013 `notebook-new-recipe.html` (P10_Notebook) |
| 8 | `IngredientsPlace.jsx` 192 | Name filter (Ingredients) | text, enterkeyhint search | 012 `ingredients-place.html` (P9_Ingredients) |
| 9 | `RecipeBand.jsx` 76 | Recipe name (Rename) | text | not drawn open on any board; it shares `.notebook-recipe__form` with row 1's drawing |
| 10 | `IngredientTable.jsx` 186 | a row's grams (version pen) | text, decimal | 011 `1600-pen.html` |
| 11 | `IngredientTable.jsx` 459 | a row's as-made grams (record pen) | text, decimal | 011 `as-made-line-out.html`, `record-pen-app.html` |
| 12 | `SheetCodeSearch.jsx` 97 | Sheet code (Search) | text, autocapitalize characters, enterkeyhint go | not drawn (Search place, built 04-02); sketch 010 `screen-home.html` draws the link to it |
| 13 | `Method.jsx` 156 | a step's lead-in (version pen) | text | 011 `1600-pen.html` |
| 14, 15 | `Method.jsx` 195, 202 | a step's target, label and value (version pen) | text | 011 `1600-pen.html` |
| 16 | `Method.jsx` 472 | Done differently (record pen) | text | 011 `record-pen-app.html`, `350-pen-app.html`, `393-pen-app.html` |
| 17 | `CreationSetup.jsx` 47 | a scale's Name, Low end, High end; a problem's Name | text | 013 `scales-and-problems.html` (P10_Scales) |
| 18, 19 | `CreationSetup.jsx` 202, 213 | a style target's low and high end (12 fields) | text, decimal | 013 `style-menu-and-bands.html` (P10_Style) |
| 20 | `IngredientPicker.jsx` 60 | Name filter (picker) | text, enterkeyhint search | 013 `ingredient-picker.html` (P10_Picker) |

**Mark decides (1 site and 1 branch, 3 fields):** the signed temperature fields, `type=number` with `step=any` and no inputmode: Serving temperature (`CreationSetup.jsx` 176; 013 `style-menu-and-bands.html`, `creation-editor.html`) and Out of machine and Temperature (`BatchRow.jsx` 132, signed branch; 007, 008, P10_Pen). They are number inputs because the iPhone's decimal pad has no minus key and its text keyboard opens on letters, while WebKit opens a number input on the numbers layer with a minus (`BatchRow.jsx` comment above `MeasuredField`; Mark, 2026-09-30, after trying it on his iPhone). A textarea cannot open that layer: `inputmode` decimal and numeric have no minus on the iPhone, text opens on letters. So a switch costs the iPhone its minus key on these fields, and a keep costs the iPad its Tab there. My recommendation is to switch Serving temperature only: the creation editor is an iPad surface (Mark creates no recipes on an iPhone, 2026-10-18), and the creation flow is where the Tab bug was found. Out of machine and Temperature are batch-record fields that Mark has entered on the iPhone, so they keep the number input. Serving temperature then takes `inputmode=decimal`. Whether the iPad's on-screen keyboard shows a minus for it is not verified (with the Magic Keyboard attached no on-screen keyboard shows at all); the quick-batch's device check covers it, and if no minus shows, the field drops the inputmode and opens the full keyboard. The other options are on the row: keep all three, or switch all three.

**Keep (2 fields, plus 1 non-field):**

- Churned (`BatchRow.jsx` 819) and Tasted (`BatchRow.jsx` 973), `type=date`. A textarea would lose the native date picker, the date value format and the iOS calendar work of 261003-by3. Tab from a date input was not among the kinds tried on the iPad; it is expected to leave the page like every other input (device-unverified). No remedy short of replacing the native picker with a drawn one, which is a design change nobody asked for. Accepted: the maker taps the next field.
- The Shell's file input (`Shell.jsx` 601) is hidden, `tabIndex=-1` and `aria-hidden`; it is never focused and is not a field.

## 3. The look: unchanged, with five CSS duties

Measured, not read from the CSS: a scratch build of HEAD (`npm --prefix app run build -- --outDir <scratch>`), served on a throwaway 127.0.0.1 port by the Phase 8 walk server, Playwright WebKit 26 and Chrome, 1366 × 1024, fine and coarse pointer. For every visible field on each surface the probe (`2026-11-01-one-line-fields-probe.mjs`, beside this file) measures the input, swaps in a `<textarea rows=1>` with the same attributes and value, measures again and puts the input back: box, the box of its parent and grandparent, each sibling's box, the text's ink from a screenshot, and computed style.

**A bare textarea changes these, so each is a duty for the quick-batch (all in tokens, as 261101-lec did):**

1. **One line.** Without `white-space: pre` a value with a space wraps in the narrow fields: the style target ends and Duration, Tempering and Melt test grow 20.25 px at a fine pointer. Every switched field takes `white-space: pre; overflow: hidden` (one line scrolled to the caret, no scrollbar; `resize: none` is already global).
2. **The line centred in the touch floor.** An input centres its line in the 44 px coarse floor; a textarea starts it at the top. Measured at coarse without the duty: the text sits 2 px high in the labelled-above fields (Sheet code, the Names, Recipe name, Version name, Low end, High end, padding 8), 8 px high in the 2 px-padded ink fields (targets, style ends, measured fields, as-made, grams) and 8 px high in the prose fields (lead-in, Done differently). In the °C and min rows the unit beside the field followed the text up 8.2 px (the row aligns on the baseline). The duty is 261101-lec's `padding-block: max(var(--gap-hair), calc((var(--touch-min) - <line> - <rules>) / 2))`, written once per field family inside the existing `(pointer: coarse)` blocks, not once per field. With it the unit stays put too.
3. **Block parents.** The version pen's lead-in sits in a block label: without the duty it moves 3.58 px down and its row grows 3.33 px (WebKit; Chrome 3). It takes 261101-lec's flex-column label, whose rule today reaches only `.notebook .mk-step` (creation). The as-made field sits alone in a table cell: its row grows 3.33 px (WebKit) / 4 px (Chrome) unless the field is `display: block`. The version pen's grams field already takes 261101-lec's `.notebook .ingredient-table` rules and needs nothing more.
4. **Widths the input took from the browser.** The target fields have `width: auto`, so today they are the browser's default input width: 200.28 px at 15 px and 211.31 px at 16 px in WebKit, 180 / 187 px in Chrome. The global `textarea { field-sizing: content }` makes a textarea as wide as its text (58.88 px for a short value in the creation step; 126 to 156 px in the version pen's flex chip, which also lets it shrink). With `cols="20"` and `field-sizing: fixed` the textarea measures 199.64 / 210.66 px in WebKit (0.64 / 0.65 px narrower) and 177 / 183.5 px in Chrome (3 / 3.5 px narrower): no token, it follows the font size, and on the iPad the difference is under a pixel. Ruled acceptable. Serving temperature's 84 px comes from `.notebook .mk-field-row .ink-field[type='number']`, an input-only selector: if it switches, that rule moves to a class or the field falls back to 56 px.
5. **The placeholder.** Version name in the version pen is the one switched field with a placeholder. The placeholder sits 2 px (WebKit) / 3 px (Chrome) higher in a textarea, because the global `::placeholder` sets small print and the textarea starts that smaller line at the top. Giving the one-line textarea's `::placeholder` the field's own line height puts it back: WebKit pixel-identical at fine and coarse; Chrome 1 px high at fine, 2 px at coarse.

**With the five duties applied in the probe:** every switched field matches its input within 0.5 px (box, parent, grandparent, siblings) and 1 px (text ink) in WebKit and Chrome at fine and coarse. The as-made rows are pixel-identical, 14 of 14 in each of the four configurations; the version pen's grams rows 14 of 14 in Chrome fine and 12 of 14 elsewhere. The two that differ are the one remaining difference: **a value wider than its field shows 2 to 4 px more of itself before it is cut**, because a textarea clips at its padding edge and an input at its content edge (for example "250.4" in the 52 px grams field reads "250.4" where the input cut the 4). This is already true of the creation grams field Mark passed on 2026-11-01, and it shows only for a value that does not fit. Ruled acceptable.

## 4. Behaviour the switch keeps

- Return inserts nothing (`holdReturn`) and a pasted line break is removed (`stripNewlines`), as 261101-lec does. Where Return does something today it keeps doing it: in Sheet code it runs Find and in the Notebook's New recipe Name it starts the recipe (both are the only text field of a form whose submit acts); those two submit the form on Return instead of holding it. Everywhere else Return does nothing today (no form, or a form whose submit is prevented), so holding it changes nothing.
- Every attribute stays: `inputMode`, `autoCapitalize`, `autoComplete`, `spellCheck`, `enterKeyHint`, `required`, `placeholder`, `autoFocus`, refs, `onBlur` (Done differently closes when left empty).
- Code that finds these fields by tag moves to the textarea: `CreationPage.jsx` `findRefusedField` (`input[aria-label="Recipe name"]`, `"Version name"`, the picker's `.ing__filters input`, the scale and problem `input[aria-label=...]`) and `CreationSetup.jsx` line 78; tests that select `input` follow. A missed selector shows as a refused Save that no longer focuses its field.
- Tab order is DOM order and does not change. Screen readers may announce the fields as multi-line; no `aria-multiline`, as 261101-lec decided.

## 5. For the plan

One `/gsd-quick-batch`, grouped by surface (creation editor; version pen and Rename; record pen; Notebook, Ingredients, picker and Search). Each task proves its fields against a scratch build of the base the way 261101-lec's probe did (box, ink, neighbours, focus ring, Return, paste, long text), WebKit and Chrome, 1366 fine and coarse, and the device check walks Tab through one field of each surface on the iPad. The signed fields follow Mark's answer on `decide-one-line-fields`.

## Not verified

Everything above is Playwright WebKit and Chrome on the dev machine. The iPad (WebKit, 1366, coarse) is unchecked for every field except the two 261101-lec fields Mark passed. Tab from a date input on iPadOS 27 is untested. The iPad on-screen keyboard for a textarea with `inputmode=decimal` (whether it shows a minus) is untested.

## Mark's ruling on the target widths (2026-11-01)

Quick 261101-nrh measured the step target fields (rows 1, `cols="20"`, `field-sizing: fixed`) narrower than the inputs by more than section 3 predicted: WebKit 1.28 px at 15 px and 1.31 px at 16 px; Chrome 6 px fine and 7 px coarse. No column count or token expression matches the input in both engines. Mark accepted the narrowing as measured (asked in chat, answer "Accept the narrowing"), so the width tolerance for the target fields is WebKit ≤ 1.5 px and Chrome ≤ 7.5 px, in the creation editor and in the version pen.
