---
name: Sprinkles
description: A recipe read as a recipe, with the formulation and the record in its margins.
colors:
  ground: "#f7f7f4"
  ink: "#141414"
  pen-blue: "#1f3d7a"
  bookcloth: "#33513b"
typography:
  display:
    fontFamily: "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
    fontSize: "2rem"
    fontWeight: 700
  headline:
    fontFamily: "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
    fontSize: "1.125rem"
    fontWeight: 400
  body:
    fontFamily: "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
    fontSize: "1rem"
    fontWeight: 400
  section:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.04em"
    textTransform: "uppercase"
  label:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.04em"
  caption:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.04em"
    textTransform: "uppercase"
  control:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.3
  helper:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  table:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "tabular-nums"
  figure:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    fontFeature: "tabular-nums"
  deviation:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
  note:
    fontFamily: "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  small-print:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
spacing:
  hair: "2px"
  xs: "6px"
  s: "12px"
  m: "20px"
  l: "32px"
  xl: "48px"
components:
  region-name:
    textColor: "{colors.bookcloth}"
    typography: "{typography.section}"
    padding: "0 0 6px"
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    padding: "7px"
  button-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "6px"
  text-control:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    padding: "0"
    height: "24px"
  text-control-touch:
    height: "44px"
  ink-field:
    backgroundColor: "transparent"
    textColor: "{colors.pen-blue}"
    typography: "{typography.table}"
    padding: "2px 6px"
    height: "26px"
  ink-field-touch:
    typography: "{typography.note}"
    height: "44px"
  prose-field:
    backgroundColor: "transparent"
    textColor: "{colors.pen-blue}"
    typography: "{typography.body}"
    padding: "0"
  pen-caption:
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    padding: "0 0 6px"
  pen-helper:
    textColor: "{colors.ink}"
    typography: "{typography.helper}"
    padding: "0"
  table-header:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "6px 6px"
  table-cell:
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    padding: "6px 6px"
  target-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.small-print}"
    padding: "0 6px"
  axis-stop:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    width: "38px"
    height: "32px"
  axis-stop-picked:
    backgroundColor: "{colors.pen-blue}"
    textColor: "{colors.ground}"
  segmented-option:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    padding: "5px 8px"
    height: "32px"
  segmented-option-picked:
    backgroundColor: "{colors.pen-blue}"
    textColor: "{colors.ground}"
  chip-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    padding: "0"
    height: "32px"
  chip-toggle-mark-pressed:
    backgroundColor: "{colors.pen-blue}"
    size: "13px"
  figure-value:
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
  recorded-value:
    textColor: "{colors.pen-blue}"
    typography: "{typography.note}"
  step-number:
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
---

# Design System: Sprinkles

Recorded from the shipped code in `app/src/styles/tokens.css`, `app/src/styles/app.css`, and `app/src/ui/`, refreshed 2026-09-16 after Phases 2, 3, 03.1–03.3, 03.3.1 and 03.3.1.1, and the 260912-ti1, 260915-vvh, 260915-x6n and 260916-0d4 quick tasks. The direction contract that decided the world is `.impeccable/surfaces/route-recipe.md`; the record pen's own brief is `.impeccable/surfaces/route-recipe-batch.md`. This file describes what was built, not what was planned. The frontmatter is normative. The prose says where and why.

## Overview

**Creative North Star: "The Formulation Cookbook"**

A recipe reads as a recipe first. The formulation and the batch record are the same page's margins, never a dashboard laid over it. The page is a book spread opened by a front-matter band: two stacked rows — the version's row, then the batch's row — closed by a baseline rule, then the ingredient table with the formulation note beside it, the numbered method under the table, and a margin under the note for what the maker wrote. It refuses the recipe-app arrangement of hero photograph, rounded cards, and a green tick for balance, and it refuses the calculator's spreadsheet with coloured bars just as firmly. The mood is warm, precise, and welcoming: a well-set page on a kitchen table in the evening, next to a pen.

The world inherits three rules from the earlier Cupping Form attempt and keeps them binding. Everything the system prints is black. Everything the maker or the record contributes is one pen blue. Colour identifies and form carries state, so nothing on the page is ever coloured to mean good, bad, or uncertain. The text face carries true italics for headnote and method prose; the grotesk carries tabular numerals for every table and figure; one bookcloth green names the book's sections and does nothing else. Light only, because the scene forces it: the sheet that goes to the machine comes out of a black-only laser printer, and the screen is that sheet's sibling.

Since the contract was written the page has grown its instruments, and they all obey the binder: every control is drawn by the page — ink at hairline weight, no fill at rest, no radius, no icon — never inherited from the browser. State is carried three proven ways and no others. A picked or pressed thing **fills pen blue** with the paper's colour for its text (a marked stop, a chosen segment, a marked defect's square, a checked box) — the fill alone carries it, with no change of weight and no underline. A recorded thing turns **pen blue**. The maker's not-in-force things take **one ink strike**. Content the page is pointing at — a marked table row, the open batch, the current version — is the one thing still carried by bold plus a 1px ink outline, because it is content and not a control. Under `forced-colors: active` the fill survives as a fill, repainted in the system `Highlight`, so state and focus never collapse into the same outline.

Density is generous. One heavy element per view, wide gutters between regions, and no motion anywhere: the stylesheet contains no `transition`, no `animation`, no `@keyframes`, no shadow and no radius.

**Key Characteristics:**
- Book-spread layout behind a two-row front-matter band, each block wearing its plain-language name as a running head.
- Four colour roles and nothing else: paper, ink, pen, bookcloth.
- Serif for prose, grotesk with tabular numerals for anything counted.
- The binder: page-drawn controls, hairline ink, no fill at rest, no radius, no icon.
- A picked control fills pen blue; the record is pen blue; "not in force" is one strike; pointed-at content is bold plus a 1px outline.
- Balance stated as a tick on a graduated rule and a deviation in words; no colour verdict.
- Touch is a **capability**, not a width — the app asks `pointer: coarse` and grows its targets, at any viewport size.

*Not yet built:* the printed bench sheet. The world is print-native by intent and the screen is drawn as the sheet's sibling, but there is no `@media print` block in `app/src/styles/` and no print route in `app/src/router.jsx`; both arrive in a later phase. Nothing in this file has been verified on paper.

## Colors

Four roles, each with one job, and no fifth colour anywhere in the system.

### Primary
- **Print Ink** (`{colors.ink}`): everything the system prints. Type, table rules, graduations, the hatch of a target band, the tick at a value, every drawn control's border, the strike, focus outlines. Contrast on ground 17.16:1.

### Secondary
- **Pen Blue** (`{colors.pen-blue}`): everything the maker or the record contributes, and now also the fill that marks a picked control. An ink field's typed value and the record's saved text (`.ink-field`, `.prose-field`, `.prose-text`, `.ink-text`), the batch row's measured cells and date, a changed step's line, the fill of a picked stop, segment or defect square. The plan beside it stays black. On the printed sheet this layer is blank space for a real pen. Contrast on ground 9.75:1.

### Tertiary
- **Bookcloth** (`{colors.bookcloth}`): a muted bottle green that identifies the book. Region names, the list page's block names, and the hairline that separates the version row's full-width sub-rows — never a status, never a control, never a figure. A third hue so it is never mistaken for the pen. Contrast on ground 8.22:1.

### Neutral
- **Text Paper** (`{colors.ground}`): the page, and the text colour of any control the pen has filled. Cool off-white, deliberately not cream, so it reads as text paper rather than parchment. There is no sunk, hover, or divider grey; every rule and border is full ink at a thin weight.

### Named Rules
**The Two-Ink Rule.** Printed matter is ink black; recorded matter is pen blue; the two never mix on one element. A value that is half plan and half record is two values. The record keeps its blue after saving — it is the maker's, and saving changes form, not ink.

**The No-Verdict Rule.** No colour anywhere carries pass, fail, warning, or uncertainty. A figure's standing against its band is stated in words beside the figure; estimated or unreviewed data says so as a word in the Data column; a malformed measurement is a sentence under the field and `aria-invalid`, never a red line. A picked control's pen-blue fill is not a verdict — it is the record's own ink saying *the maker chose this*.

**The Bookcloth Rule.** Bookcloth appears only where a region is named. If a new element wants green, it is either a region name or it is wrong.

## Typography

**Display Font:** Georgia (with Iowan Old Style, Times New Roman, serif)
**Body Font:** Georgia (same stack; the text face carries headnote, version line, method prose, authored notes, and the record's own words)
**Label/Figure Font:** the system grotesk (-apple-system, Segoe UI, Helvetica Neue, Helvetica, Arial), with `font-variant-numeric: tabular-nums` on every table cell, field, and figure

**Character:** a working text face for anything read as prose, with true italics for asides and purposes; a plain grotesk for anything counted. The two never swap jobs: a number in Georgia or a sentence of method in the grotesk is an error. Both are system stacks and no font file is fetched.

### Hierarchy
- **Display** (700, 2rem): the recipe name, once per page, in the headnote.
- **Headline** (400, 1.125rem): the version line under the name, e.g. `50 g oil · 800 g`; also the batch's churned date and a later batch's date. Units are never uppercased.
- **Body** (400, 1rem): headnote prose, method instructions, authored notes. Method lead-ins are bold within the same size.
- **Section** (600, 0.875rem, leading 1.35, uppercase): region names and block legends — a region head is a true heading weight, not a label.
- **Caption** (500, 0.75rem, leading 1.35, 0.04em tracking, uppercase): every caption that labels an input — Version, Why, From batch, the batch row's cell labels, the record pen's field captions, axis names, segmented captions, the two group cues. Uppercase by `text-transform` so the source stays sentence case for screen readers.
- **Label** (400, 0.75rem, 0.04em tracking, uppercase): table headers and the running head. The plain, unweighted sibling of Caption.
- **Control** (400, 0.8125rem, leading 1.3): actionable choices, text controls, segmented options, hint and status sentences.
- **Helper** (400, 0.8125rem, leading 1.4): a helper sentence *beside* a caption, never inside it — "select all that apply". Always a sibling of the uppercase caption element, in plain sentence case.
- **Table** (400, 0.9375rem, tabular, leading 1.2): ingredient table body, the graduated rule's label, and every binder control's own text. The page default. The leading is fixed so a marked row's bold weight cannot change its height.
- **Figure** (700, 1.25rem, tabular): the value beside each graduated rule, and the step number in the method's margin column. The page's one heavy element, and it stays in ink.
- **Deviation** (400, 0.8125rem): the words under a rule (`inside 22–26`, `1.4 over target`), a measured cell's unit word, and, in italic text face, a step's purpose and aside.
- **Note** (400, 1rem, leading 1.5, at the 65ch measure): written notes, typed or saved. Also the size a **recorded figure** reads at — a measured value in the batch row takes the note size at the prose weight in pen blue (leading 1.1), not the balance figure's 1.25rem/700. The record reads at the weight of the maker's words.
- **Small print** (400, 0.75rem, tabular where numeric): target chips, basis notes, rule anchors, fat breakdown, plan sub-lines, cross-flags, version-strip meta, import errors.

### Named Rules
**The Counted-in-Grotesk Rule.** Any value that can be weighed, measured, or compared sits in the grotesk with tabular numerals. Prose sits in the text face. The step number is a figure, so it is grotesk.

**The Lowercase-Unit Rule.** Units keep their case everywhere, including inside uppercase running heads.

**The Placeholder Rule.** A placeholder is an example in ink small print, italic — never a default, never pen blue. A blank field still saves as blank.

**The Caption-and-Helper Rule.** A caption is uppercase and labels exactly one input. A sentence that explains rather than labels is a *helper*, sentence-cased, and it sits beside the caption as a sibling — never folded into it, where `text-transform` would shout it.

**The 16px Field Rule.** Wherever the pointer is coarse, `.ink-field` and `.prose-field` read at the note size (16px). Below 16px iOS Safari zooms the page on field focus, which moves the record under the maker's thumb; the app's earlier 13px touch size is retired.

## Layout

The recipe page is a two-column grid at a 2:1 ratio. A **front-matter band** spans both columns above the spread: two stacked full-width rows — the version's row (recipe block at `1.6fr`, Version/Why/From batch metadata at a 300px floor, plus full-width sub-rows for the save ceremony and the Later disclosure, each opened by a bookcloth hairline), then the batch's row — closed by a baseline-weight rule. Below it, column one is the recipe as written in the sheet's page order, the ingredient table then the method; column two is a single region that flows on its own, the formulation note beside the table, then the margin. A **pen foot** appears across the full width only while a pen is open: a hairline rule, then the save ceremony right-aligned under the side column. Whichever column runs longer leaves its void at the bottom. Regions are separated by the large gap (32px) and the page carries the extra-large gap (48px) as its outer margin. The recipe list is a single column of links, each a flex row of name, version line, and batch mass.

The spacing scale is six steps: hair (2px) for the gap inside a chip, between strike and value, and under a rule; xs (6px) for cell padding, the space under a caption, and every caption-to-content gap; s (12px) for step gutters and list rhythm (the ingredient table carries its own half-step `--table-cell-pad-x`, 6px); m (20px) between method steps, between graduated rules, between axes, and above basis notes; l (32px) between regions; xl (48px) for the page margin.

**The Caption Rule.** Every caption that sits atop its own content — field captions, axis names, segmented captions, group cues — carries one 6px gap (`--gap-xs`) to it, whatever it captions. One rule for every caption site.

Prose never runs past a 65ch measure: headnote prose, method instruction, purpose, aside, the basis note, written notes, the prose fields and the record's live region all read the one measure token. The method's step number sits in a fixed auto-width margin column so numbers stay put as prose reflows. The ingredient table is full width of its column, fixed-layout, border-box, and reads in **step order**: step-group rows name each step with its lead-in beside them, portions sit under their ingredient's name, and rows are never sorted, grouped, or reordered from the authored order. The name column is the single unsized column, absorbing what the five sized columns leave.

### The responsive ladder

The page answers **two independent questions** — how wide is the viewport, and how is it being pointed at — and it never confuses them. Five blocks, all top-level siblings, never nested:

- **`max-width: 1099.98px` — the spread collapses.** One column, in the order band, ingredients, side, method, foot: the side region comes *before* the method so the formulation note stays near its table. The page gap narrows to 20px; the pen foot collapses with it. The 48px page padding is untouched here.
- **`max-width: 759.98px, (pointer: coarse)` — the touch union.** Buttons, selects, ink fields, segmented options, defect toggles and text controls all take a 44px minimum height; an axis stop grows in **height only**, to 38 × 44; fields read at 16px. This arm is a union, not a replacement: a narrowed desktop window still exercises touch mode for testing, and a real touch device is caught however wide it is.
- **`max-width: 759.98px` — width only.** The version row collapses to one column, and the axis track takes its wider 216px geometry with 44 × 44 stops. Track geometry is deliberately *not* in the touch union: at 1366 the axes sit in three 213.3px columns, where a 216px track overflows into its neighbour.
- **`max-width: 600px`** — the page padding shrinks to 20px, the margin's own prose field drops to the control size, both save ceremonies may wrap, and the ingredient table scrolls inside its own region rather than overflowing the page.
- **`min-width: 760px and (pointer: coarse)` — the wide-touch case.** A tablet held in the hand at a desktop width. The axis and segmented caption lines reserve two lines of caption height so they sit level with the field captions beside them, and Clear takes its 44px target as an *overflowing hit area* (a `::after` pseudo-element) so the line box never grows.

Plus `forced-colors: active`, which repaints the picked fill rather than removing it.

**The Drawn-For Rule.** A rule governs only the case it was drawn for. The touch union also matches every narrow width, where a 44px caption line was drawn and verified; applying the wide-touch reserve across the union silently overwrote that drawing at 680, 580, 480 and 393. When a new case appears, it gets its own condition — never a widened old one.

**The Capability Rule.** Touch *sizes* read the pointer. Touch *layouts* read the width. A height can grow anywhere safely; a track width cannot, because no layout has been drawn for touch-sized stops at desktop widths.

Above 1100px the grid holds at every width; the brief expects the spread at 1280 and wider.

## Elevation & Depth

Flat, and flat as a commitment rather than a default. There are no shadows, no tonal layers, no sunk or raised surfaces, and no second background colour — the stylesheet contains no `box-shadow` at all. Depth is conveyed by rule weight alone: hairline graduations and state outlines (1px), the table's row rules, a rule's baseline and a text control's hovered underline (1.5px), every hover border and the focus ring (2px), and the tick at a figure's value (2.5px). The one heavy element per view is the heaviest stroke on it, not a box with a shadow.

Three weights, three meanings, and they are provably ordered: **1px** is the outline on content the page is pointing at (a marked table row, the open batch, the current version); **2px** is focus, and nothing else; the picked control's **fill** is a different sign entirely, so a picked thing and a focused thing never read as each other.

### Named Rules
**The Paper-Is-Flat Rule.** Nothing floats above the page. If an element needs to stand apart, it gets a heavier rule, an ink outline, or the pen's fill — never a shadow.

**The Focus-Heavier-than-State Rule.** One focus rule at the browser's own `:focus-visible` boundary draws a 2px ink outline offset 2px — heavier than the 1px outline any pointed-at content carries, and a different sign from a pressed control's fill. A focused element that is also stateful reads both. There is exactly one documented exception: `.is-landing-focus:focus`, a plain `:focus` rule that makes the fork's landing focus visible after a mouse-driven Save, which Chrome's modality tracking would otherwise leave ringless.

**The Hover-Is-Weight Rule.** Hover thickens a border from 1px to a whole 2px and removes exactly that much padding, so the box never changes size — 1.5px renders as 1px at DPR 1, which is why hover needs its own token rather than borrowing the baseline. A joined control thickens in place and stacks above its neighbours. Weight, never position or hue.

## Shapes

Square everywhere. No radius token exists and no element carries a rounded corner. Borders are ink at hairline weight: buttons, fields, segmented options and axis stops carry a 1px border with no fill at rest; the table has a 1.5px rule under every row and header; the focus outline is 2px ink offset 2px outside the element, and it means focus only — an invalid field is a sentence beneath it, never a ring. The graduated rule is drawn in SVG as straight lines and a 45° hatch at 4px pitch with a 1.2px stroke.

Joined controls — the five stops of an axis, the three options of a segmented control — share one hairline through a negative margin rather than a gap, and the picked cell lifts above its neighbours so its pen-blue border is never hidden under theirs.

The component character Mark chose is **working binder**: warmer and hand-touched, with room for the pen's blue wherever the maker's hand appears. Softer edges are permitted for future controls but not yet realised: there is no radius token, so a builder who wants one adds it to `tokens.css` first and applies it only to interactive elements, never to tables, rules, chips, or anything that prints.

Browser chrome is redrawn, not accepted: the select's arrow is replaced by two CSS-drawn ink triangles, number spinners are stripped cross-browser, the date input's calendar icon is hidden in Chromium and WebKit, and a date field carries `appearance: none` so WebKit stops rendering it as a native control that ignores the author box model outright. Two named exceptions keep their browser drawing — the select's dropdown list and the date input's segment highlight — because no styling hook reaches them.

## Components

Components feel like a working binder: printed pages a person actually writes on, with drawn controls in the margins. Every control is ink at hairline weight with no fill at rest; a picked or pressed control fills pen blue with paper-coloured text, and the record's own ink is pen blue.

### Region name
- **Style:** the section role in bookcloth, uppercase, tracked 0.04em, 6px beneath it. Every region (Headnote, Ingredients, Method, Balance, Batch, Tasting) wears one as its first child.
- **Rule:** the only place bookcloth appears on type.

### The binder (buttons, selects, checkboxes)
- **Shape:** square, 1px ink border, no fill at rest, no icon — drawn by the page, never inherited from the browser. Written as bare element rules so every control on every page inherits it without being designed.
- **Picked / pressed:** the box fills pen blue, border and all, and its text turns the paper's colour; nothing else changes — no bold, no underline. Adjacent options share one hairline and the picked one sits on top. Under `forced-colors: active` the fill is repainted in the system `Highlight`, keeping the same shape.
- **Hover:** the border thickens to 2px with compensating padding (7px at rest → 6px on hover), so the box never changes size. Joined boxes thicken in place and stack above their neighbours.
- **Disabled:** a dashed border, and a hint sentence in words beside the control stating why — a disabled control states its reason, never only appears dim.
- **Box or word:** a hairline box commits, discards, or starts a new record — it is the ceremony, and it stands apart (Save batch, Cancel, Next version, Record batch). An underlined word acts on what is already on the page, and stands beside the thing it acts on (Correct, Clear, Add tasting, Remove tasting, edit this step, add purpose, done differently). An underlined word that opens a panel beneath it is a disclosure: the panel is its open state, the word does not change, `aria-expanded` carries it. A **square and a word** records an independent yes or no — a leading 13px square before the word fills pen blue when on, the word itself never bolds or gains an outline (Show changes, `.text-toggle`).
- **Text control** (`.text-control`): no border, a 1px ink underline offset 2px that thickens to 1.5px on hover, the control role, 24px tall at desktop and 44px wherever the pointer is coarse. It sits at its own content width, never stretched by a column flex.
- **Select:** the binder box with a drawn two-triangle chevron; the dropdown list stays the browser's.
- **Checkbox:** a 13px ink square, filled pen blue when checked, like every other on state; its label names it ("Step 3, skipped").

### Fields
- **Ink field** (`.ink-field`): anything counted that the maker types. Hairline ink border, no fill, pen blue text in the grotesk with tabular numerals, its own leading (1.35) and a 26px floor so an empty date input cannot collapse on WebKit. Sized to what it holds — a date at 128px, a short figure at 56px with its unit word set beside the box as a sibling — never the column.
- **Field row** (`.field-row`): a wrapping flex row of labelled fields, bottom-aligned. Each caption reserves two lines of height so a short and a long caption in the same row keep their fields on one baseline. The melt row is the one row that top-aligns instead.
- **Prose field** (`.prose-field`): the maker's words editing in place as the printed paragraph — no border at rest, pen blue text in the text face at the paragraph's own inherited size, growing with its text (`field-sizing: content`), no resize grip. A blank named prose field carries a hairline baseline so the writable spot is findable.
- **Prose text** (`.prose-text`): the record's saved words, the same text face and leading as the field it was typed in, still pen blue.
- **Field error** (`.field-error`): the system's own sentence inside the field's label, wired by `aria-describedby`, in grotesk small print with no colour of its own.
- **Focus:** the one global `:focus-visible` rule — 2px ink outline, offset 2px. Nothing moves.

### Ingredient table
- **Shape:** square, borderless container; a 1.5px ink rule under every header and row, the total row's rule above it.
- **Type:** header in the label role uppercase; body in the table role with tabular numerals; left-aligned throughout, numeric columns right-aligned.
- **Padding:** 6px vertical, 6px horizontal per cell (`--table-cell-pad-x`), border-box, so a declared column width is the whole column.
- **Layout:** fixed table layout; the ingredient-name column is the single unsized column; the numeric (94px), Data (86px) and Remove (78px) columns carry their own tokens. Rows read in step order under step-group heads.
- **Marked state:** when a figure is focused, its contributing rows take a 1px ink outline offset 2px and bold weight. Unmarked rows are untouched, never dimmed.

### Graduated rule (signature)
- **What it is:** one figure's assessment, capped at the drawing's native 320px width so the anchors sit at the scale's ends: label and value on a baseline, a 320×30 SVG scale with a 1.5px baseline and eleven 1px graduations, the authored target band as a hatched rectangle bracketed by 1px edges, and a 2.5px tick at the value. A parent's value in show-changes reads as a hollow tick at graduation weight. Beneath, the domain's two anchors and the deviation in words.
- **Basis line:** when a figure rests on estimated or unreviewed rows it says so in small print between the head and the scale, naming the rows.
- **Control:** the whole rule is a button whose accessible name is the full sentence. Focus draws the shared outline and marks the contributing table rows. Nothing moves and nothing changes colour.
- **Rule:** the deviation is words; the band is hatch; the value is a tick. No fill, no colour, no score.

### Target chip
- **Style:** inline, 1px ink border, no fill, 0 by 6px padding, small print in the grotesk with tabular numerals, a 2px gap between label and value.
- **State:** none. A chip is a typed target on a method step (`temp 85 °C`, `hold 2 min`), never a control.

### Method step
- **Style:** a two-column grid, step number in the figure role in the left column, body right. Lead-in bold in the text face, instruction in the same face, target chips beneath, then purpose and aside in italic deviation size. "Before you start" heads the method at the prose measure, closed by a hairline rule.
- **Rhythm:** 20px between steps, 12px gutter between number and body.
- **Pen state:** the strike control, the changed line in pen blue, on-demand "add purpose / add aside / done differently" text controls, and the uses checkboxes all read in place; a struck step reads struck with its prose intact, the strike scoped to the prose span so the label beside it stays legible.

### Front matter and the batch row
- **The band:** two stacked full-width rows above the spread, closed by a baseline rule. The version's row carries the recipe block and the Version/Why/From batch metadata as a definition list, with the save ceremony and the Later disclosure as full-width sub-rows beneath, each opened by a bookcloth hairline.
- **Batch row:** a region-name head line with the churned date in pen blue beside it, then a wrapping grid of measured cells (96px minimum) — label in the caption role, figure in pen blue at the note size and the prose weight, unit at the deviation size, plan sub-line in small print. An absent value reads "not measured" in **ink**, at the unit's size: an absence is not a record. Correct sits on the head line, right-aligned, as a text control; earlier batches open as a hairline-ruled panel beneath.
- **Version strip:** the Later disclosure's card grid, auto-fill at 260px minimum, one card per descendant — version line in the text face, meta and batch lines in small print; the current version reads bold plus the 1px outline.

### The tasting battery (signature)
The record pen's own instrument, framed at 640px while recording and full width while reading.

- **Axes grid:** six axes in one grid — the four core axes every recipe has (Hardness, Scoopability, Smoothness, Sweetness) and the two a recipe declares for itself — laid out row-major in three columns at desktop, so a row reads core, core, declared, with an absolute 1px hairline at the two-thirds line separating core from declared, and 12px of clearance carried as the declared column's own padding rather than a column gap. Below 760px it becomes a genuinely different DOM shape: two stacked auto-fit groups, the declared one under its own rule. Two **cue rows** — "Every recipe", "This recipe only" — head the columns in the caption role; no axis carries a caption of its own.
- **Axis mark:** a caption line (axis name, inline state text, and a right-aligned Clear), then five joined stops on a 186px track, then three anchor words in italic. A stop is 38 × 32 at desktop, 38 × 44 wherever the pointer is coarse, and 44 × 44 below 760px. The drawn box is a `<label>` with an invisible native radio stretched over it, so the browser's own grouped-radio keyboard semantics do all the work. A picked stop fills pen blue. Picking is final: a joined group is a radio, and Clear is the only way back. The caption line reserves Clear's height marked or not, so picking moves nothing.
- **Segmented control** (`Segmented.jsx`): the same mechanism at three widths of word — a `role="radiogroup"` of native radios, adjacent options sharing one hairline, 5 by 8px padding, the control role, a 32px floor. Its caption line is the component's own head, with Clear as the last child. Never bold, never underlined; the fill carries it.
- **Defect toggle** (`.chip-toggle`): an independent on/off, so it is a **square and a word** rather than a filled box — a 13px ink square before the word, filled pen blue when pressed, `aria-pressed` carrying the fact. The button itself never changes colour. Defects are grid items of the axes' own grid, in two labelled groups, so the hairline spans them too.
- **Save ceremony** (`.save-ceremony`): one component mounted twice — at the end of the record body and in the pen foot — so the two can never drift. Right-aligned at every width, wrapping below 600px, with a removal toast pushed to the left by an auto margin.
- **Live regions:** `.form-status` above the ceremony announces what the record just did, at the prose measure; `.save-ceremony__status` carries removal toasts. Both are `role="status" aria-live="polite"`, in the grotesk at control size, with no colour of their own.

### Authored block
- **Style:** a legend in the section role (600 uppercase), with the block's name at left and the word `authored` at right, then a bulleted list in the body role at the note size. The derived-advisories block wears the parallel legend, and its items read as small print — no colour, no icon, no badge. Keeps the maker's judgement visibly apart from anything derived.

### Navigation
- The running head is the way home, in ink — never bookcloth, which names a block, not a link. The recipe list is plain links inheriting ink with the hairline underline every link carries, name in the text face, version and mass in the grotesk with tabular numerals, 12px between items. A "no recipe found" page carries the running head above it and a second link back to the list.

## Do's and Don'ts

### Do:
- **Do** read every colour, face, size, gap, and rule weight through a custom property in `app/src/styles/tokens.css`. No literal anywhere else; the only sanctioned exceptions are the breakpoint values in an `@media` prelude.
- **Do** put every number in the grotesk with tabular numerals and every sentence in the text face.
- **Do** give every region a running head in bookcloth naming it in plain language.
- **Do** state a figure's standing in words beside the figure (`inside 22–26`, `1.4 over target`) and its basis as a word (`estimated`, `unreviewed`).
- **Do** fill a picked or pressed control pen blue, edge to edge, with paper-coloured text — and nothing else: no bold, no underline, no outline of its own.
- **Do** carry open, current, and marked *content* by weight and outline: bold plus a 1px ink outline offset 2px, in place. Focus alone reads the 2px ring offset 2px.
- **Do** paint anything the maker records — typed or saved — in pen blue; only a value returning to the plan (a version edit saved as the plan) returns to ink. An absence is ink.
- **Do** strike with one ink stroke (1.2px) for every "not in force" meaning: a skipped step, a superseded value, a removed row or step. Never invent a second strike form.
- **Do** keep ingredient rows in step order under their step heads; strike a removed row rather than deleting it.
- **Do** fix a table's layout and leading before giving any row a heavier weight, so marking moves nothing.
- **Do** give every caption-with-inline-content the same 6px gap, and put any explaining sentence beside the caption as a helper sibling.
- **Do** ask the pointer, not the width, when the question is how big a target should be — and ask the width when the question is how a layout should sit.
- **Do** give a new device case its own media condition rather than widening an existing one.

### Don't:
- **Don't** colour anything to mean pass, fail, warning, or uncertainty. No green tick, no red figure, no amber badge, no red invalid ring.
- **Don't** use bookcloth on anything but a region name or the hairline that opens a band sub-row.
- **Don't** add a fifth colour, a grey, a tint, a shadow, a gradient, or a second background.
- **Don't** round a corner without first adding a radius token, and never on a table, rule, chip, or anything that prints.
- **Don't** move an element on hover, focus, or selection, and don't animate anything — there is no motion in this system at all.
- **Don't** put a hero image, a card, a gauge, a progress ring, a sparkline, or an icon on the page (the select's drawn chevron is closed-state chrome, not an icon).
- **Don't** accept browser chrome where the page can draw it — no spinners, no calendar icon, no default select arrow, no native date box. The dropdown list and date segments stay the browser's; those are the named exceptions.
- **Don't** pre-fill a default on any control; a placeholder is an italic ink example, never pen blue, never a value.
- **Don't** uppercase a unit or set a number in the text face.
- **Don't** let a field fall below 16px where the pointer is coarse.
- **Don't** nest a media block inside another; every one is a top-level sibling.
