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
    letterSpacing: "0.04em"
    textTransform: "uppercase"
  control:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
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
    padding: "6px"
  text-control:
    textColor: "{colors.ink}"
    typography: "{typography.small-print}"
    padding: "0"
  ink-field:
    backgroundColor: "transparent"
    textColor: "{colors.pen-blue}"
    typography: "{typography.table}"
    padding: "2px 6px"
  prose-field:
    backgroundColor: "transparent"
    textColor: "{colors.pen-blue}"
    typography: "{typography.body}"
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
  figure-value:
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
  step-number:
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
---

# Design System: Sprinkles

Recorded from the shipped code in `app/src/styles/tokens.css`, `app/src/styles/app.css`, and `app/src/ui/`, refreshed 2026-09-12 after Phases 2, 3, 03.1–03.3 and the 260912-ti1 quick task. The direction contract that decided the world is `.impeccable/surfaces/route-recipe.md`; this file describes what was built, not what was planned. The frontmatter is normative. The prose says where and why.

## Overview

**Creative North Star: "The Formulation Cookbook"**

A recipe reads as a recipe first. The formulation and the batch record are the same page's margins, never a dashboard laid over it. The page is a book spread opened by a front-matter band: two stacked rows — the version's row, then the batch's row — closed by a baseline rule, then the ingredient table with the formulation note beside it, the numbered method under the table, and a margin under the note for what the maker wrote. It refuses the recipe-app arrangement of hero photograph, rounded cards, and a green tick for balance, and it refuses the calculator's spreadsheet with coloured bars just as firmly. The mood is warm, precise, and welcoming: a well-set page on a kitchen table in the evening, next to a pen.

The world inherits three rules from the earlier Cupping Form attempt and keeps them binding. Everything the system prints is black. Everything the maker or the record contributes is one pen blue. Colour identifies and form carries state, so nothing on the page is ever coloured to mean good, bad, or uncertain. The text face carries true italics for headnote and method prose; the grotesk carries tabular numerals for every table and figure; one bookcloth green names the book's sections and does nothing else. Light only, because the scene forces it: the sheet that goes to the machine comes out of a black-only laser printer, and the screen is that sheet's sibling.

Since the contract was written, the page has grown its instruments and they all obey the binder: every control is drawn by the page — ink at hairline weight, no fill, no radius, no icon — never inherited from the browser. State is carried three proven ways and no others: a picked or open thing turns **weight and outline** (pressed, current, marked); a recorded thing turns **pen blue**; and the maker's not-in-force things take **one ink strike**. Below 760px the page's one media block grows interactive targets toward 44px; it changes nothing else.

Density is generous. One heavy element per view, wide gutters between regions, and no motion on entrance.

**Key Characteristics:**
- Book-spread layout behind a two-row front-matter band, each block wearing its plain-language name as a running head.
- Four colour roles and nothing else: paper, ink, pen, bookcloth.
- Serif for prose, grotesk with tabular numerals for anything counted.
- The binder: page-drawn controls, hairline ink, no fill, no radius, no icon.
- State is weight and outline; the record is pen blue; "not in force" is one strike.
- Balance stated as a tick on a graduated rule and a deviation in words; no colour verdict.
- Print-native: what the screen shows is what the sheet prints, minus the instruments.

## Colors

Four roles, each with one job, and no fifth colour anywhere in the system.

### Primary
- **Print Ink** (`{colors.ink}`): everything the system prints. Type, table rules, graduations, the hatch of a target band, the tick at a value, every drawn control's border, the strike, focus outlines. Contrast on ground 17.16:1.

### Secondary
- **Pen Blue** (`{colors.pen-blue}`): everything the maker or the record contributes. Painted since Phase 2: an ink field's typed value and the record's saved text (`.ink-field`, `.prose-field`, `.prose-text`, `.ink-text`), the batch row's measured cells and date, a changed step's line. The plan beside it stays black. On the printed sheet this layer is blank space for a real pen. Contrast on ground 9.75:1.

### Tertiary
- **Bookcloth** (`{colors.bookcloth}`): a muted bottle green that identifies the book. Region names and the list page's block names only, never a status, never a control, never a figure. A third hue so it is never mistaken for the pen. Contrast on ground 8.22:1.

### Neutral
- **Text Paper** (`{colors.ground}`): the page. Cool off-white, deliberately not cream, so it reads as text paper rather than parchment. There is no sunk, hover, or divider grey; every rule and border is full ink at a thin weight.

### Named Rules
**The Two-Ink Rule.** Printed matter is ink black; recorded matter is pen blue; the two never mix on one element. A value that is half plan and half record is two values. The record keeps its blue after saving — it is the maker's, and saving changes form, not ink.

**The No-Verdict Rule.** No colour anywhere carries pass, fail, warning, or uncertainty. A figure's standing against its band is stated in words beside the figure, and estimated or unreviewed data says so as a word in the Data column.

**The Bookcloth Rule.** Bookcloth appears only on the running heads that name a region. If a new element wants green, it is either a region name or it is wrong.

## Typography

**Display Font:** Georgia (with Iowan Old Style, Times New Roman, serif)
**Body Font:** Georgia (same stack; the text face carries headnote, version line, method prose, authored notes, and the record's own words)
**Label/Figure Font:** the system grotesk (-apple-system, Segoe UI, Helvetica Neue, Helvetica, Arial), with `font-variant-numeric: tabular-nums` on every table cell, field, and figure

**Character:** a working text face for anything read as prose, with true italics for asides and purposes; a plain grotesk for anything counted. The two never swap jobs: a number in Georgia or a sentence of method in the grotesk is an error. Both are system stacks and no font file is fetched.

### Hierarchy
- **Display** (700, 2rem): the recipe name, once per page, in the headnote.
- **Headline** (400, 1.125rem): the version line under the name, e.g. `50 g oil · 800 g`. Units are never uppercased.
- **Body** (400, 1rem): headnote prose, method instructions, authored notes. Method lead-ins are bold within the same size.
- **Section** (600, 0.875rem, leading 1.35, uppercase): region names and block legends. Superseded the old 0.75rem region name in the 260912-ti1 type-role pass — a region head is now a true heading weight, not a label.
- **Caption** (500, 0.75rem, 0.04em tracking, uppercase): compact field captions — Version, Why, From batch, the batch row's cell labels. Axis names carry it at 600. (The plain **Label** role, 400 at 0.75rem, survives as table headers and running heads.)
- **Control** (400, 0.8125rem): actionable choices, helper text, hint and status sentences.
- **Table** (400, 0.9375rem, tabular, leading 1.2): ingredient table body and the graduated rule's label. The page default. The leading is fixed so a marked row's bold weight cannot change its height.
- **Figure** (700, 1.25rem, tabular): the value beside each graduated rule, the step number in the method's margin column, the batch row's measured cells.
- **Deviation** (400, 0.8125rem): the words under a rule (`inside 22–26`, `1.4 over target`) and, in italic text face, a step's purpose and aside.
- **Note** (400, 1rem, leading 1.5, at the 65ch measure): written notes, typed or saved — the record's own voice reads at reading size, never small print.
- **Small print** (400, 0.75rem, tabular where numeric): target chips, basis notes, rule anchors, fat breakdown, plan sub-lines, import errors.

### Named Rules
**The Counted-in-Grotesk Rule.** Any value that can be weighed, measured, or compared sits in the grotesk with tabular numerals. Prose sits in the text face. The step number is a figure, so it is grotesk.

**The Lowercase-Unit Rule.** Units keep their case everywhere, including inside uppercase running heads.

**The Placeholder Rule.** A placeholder is an example in ink small print, italic — never a default, never pen blue. A blank field still saves as blank.

## Layout

The recipe page is a two-column grid at a 2:1 ratio. A **front-matter band** spans both columns above the spread: two stacked full-width rows — the version's row (recipe block at the prose measure, Version/Why/From batch metadata and the version acts at right), then the batch's row — closed by a baseline-weight rule. Below it, column one is the recipe as written in the sheet's page order, the ingredient table then the method; column two is a single region that flows on its own, the formulation note beside the table, then the margin. A **pen foot** appears across the full width only while a pen is open: a hairline rule, then Cancel | Save right-aligned under the side column with the blocked-save sentence beside it. Whichever column runs longer leaves its void at the bottom. Regions are separated by the large gap (32px) and the page carries the extra-large gap (48px) as its outer margin. The recipe list is a single column of links, each a flex row of name, version line, and batch mass.

The spacing scale is six steps: hair (2px) for the gap inside a chip, between strike and value, and under a rule; xs (6px) for cell padding, the space under a caption, and every caption-to-content gap; s (12px) for cell horizontal padding (the ingredient table carries its own half-step `--table-cell-pad-x`), step gutters, and list rhythm; m (20px) between method steps, between graduated rules, and above basis notes; l (32px) between regions; xl (48px) for the page margin.

**The Caption Rule.** Every caption that sits atop its own content — field captions, axis names, segmented captions — carries one 6px gap (`--gap-xs`) to it, whatever it captions. One rule for every caption site.

Prose never runs past a 65ch measure: headnote prose, method instruction, purpose, aside, the basis note, and written notes all read the one measure token. The method's step number sits in a fixed auto-width margin column so numbers stay put as prose reflows. The ingredient table is full width of its column, fixed-layout, and reads in **step order**: step-group rows name each step with its lead-in beside them, portions sit under their ingredient's name, and rows are never sorted, grouped, or reordered from the authored order.

**The one breakpoint.** `@media (max-width: 759.98px)` is the app's only media block: buttons, selects, and ink fields grow to a 44px minimum height (`--touch-min`), rating stops to a validated 40×44 box, and nothing else changes. Desktop stays compact; text controls stay inline and take no height. Above 760px the grid holds at every width; the brief expects the spread at 1280 and wider and the table stacking over the method below that, still unbuilt.

## Elevation & Depth

Flat, and flat as a commitment rather than a default. There are no shadows, no tonal layers, no sunk or raised surfaces, and no second background colour. Depth is conveyed by rule weight alone: hairline graduations (1px), the table's row rules and a rule's baseline (1.5px), and the tick at a figure's value (2.5px). The one heavy element per view is the heaviest stroke on it, not a box with a shadow.

The convention is now proven across the page: a marked table row, the open batch in the margin list, the current version in the version strip, and a pressed toggle all read **bold plus a 1px ink outline offset 2px**, in place.

### Named Rules
**The Paper-Is-Flat Rule.** Nothing floats above the page. If an element needs to stand apart, it gets a heavier rule or an ink outline, never a shadow, never a fill.

**The Focus-Heavier-than-State Rule.** One focus rule at the browser's own `:focus-visible` boundary draws a 1.5px ink outline offset 2px — provably heavier than the 1px outline any pressed, open, current, or marked element carries, so the two meanings never read as each other. A focused element that is also stateful reads both.

## Shapes

Square everywhere. No radius token exists and no element carries a rounded corner. Borders are ink at hairline weight: buttons and fields carry a 1px border with no fill, the table has a 1.5px rule under every row and header, the focus outline is 1.5px ink offset 2px outside the element. The graduated rule is drawn in SVG as straight lines and a 45° hatch at 4px pitch with a 1.2px stroke.

The component character Mark chose is **working binder**: warmer and hand-touched, with room for the pen's blue wherever the maker's hand appears. Softer edges are permitted for future controls but not yet realised: there is no radius token, so a builder who wants one adds it to `tokens.css` first and applies it only to interactive elements, never to tables, rules, chips, or anything that prints.

Browser chrome is redrawn, not accepted: the select's arrow is replaced by two CSS-drawn ink triangles, number spinners are stripped cross-browser, the date input's calendar icon is hidden in Chromium and WebKit. Two named exceptions keep their browser drawing — the select's dropdown list and the date input's segment highlight — because no styling hook reaches them.

## Components

Components feel like a working binder: printed pages a person actually writes on, with drawn controls in the margins. Every control is ink at hairline weight with no fill; state is a change of weight or an outline, and the record's own ink is pen blue.

### Region name
- **Style:** the section role in bookcloth, uppercase, tracked 0.04em, 6px beneath it. Every region (Headnote, Ingredients, Method, Balance, Batch) wears one as its first child.
- **Rule:** the only place bookcloth appears.

### The binder (buttons, selects, checkboxes)
- **Shape:** square, 1px ink border, no fill, no icon — drawn by the page, never inherited from the browser. Written as bare element rules so every control on every page inherits it without being designed.
- **Hover:** the border thickens to the baseline weight (1.5px) with compensating padding, so the box never changes size. Weight, never position or hue.
- **Disabled:** a dashed border, and a hint sentence in words beside the control stating why — a disabled control states its reason, never only appears dim.
- **Text control** (`.text-control`): the underline-only opt-out for named per-step and per-row controls — no border, a 1px ink underline that thickens to 1.5px on hover, small print. The pressed state of a text-control toggle is bold plus the 1px outline.
- **Select:** the binder box with a drawn two-triangle chevron; the dropdown list stays the browser's.
- **Checkbox:** a 13px ink square, filled ink when checked; its label names it ("Step 3, skipped").

### Fields
- **Ink field** (`.ink-field`): anything counted that the maker types. Hairline ink border, no fill, pen blue text in the grotesk with tabular numerals, sized to what it holds — a date at 12ch, a short figure at 6ch — never the column.
- **Prose field** (`.prose-field`): the maker's words editing in place as the printed paragraph — no border at rest, pen blue text in the text face at the paragraph's own size, growing with its text (`field-sizing: content`), no resize grip. A blank named prose field carries a hairline baseline so the writable spot is findable.
- **Prose text** (`.prose-text`): the record's saved words, the same text face and leading as the field it was typed in, still pen blue.
- **Focus:** the one global `:focus-visible` rule — 1.5px ink outline, offset 2px. Nothing moves.

### Ingredient table
- **Shape:** square, borderless container; a 1.5px ink rule under every header and row, the total row's rule above it.
- **Type:** header in the label role uppercase; body in the table role with tabular numerals; left-aligned throughout.
- **Padding:** 6px vertical, 6px horizontal per cell (`--table-cell-pad-x`).
- **Layout:** fixed table layout; the ingredient-name column is the single unsized column, absorbing whatever the sized columns leave; the numeric columns right-align and size to content once the as-made column arrives; the Data and Remove columns carry their own widths. Rows read in step order under step-group heads.
- **Marked state:** when a figure is focused, its contributing rows take a 1px ink outline offset 2px and bold weight. Unmarked rows are untouched, never dimmed.

### Graduated rule (signature)
- **What it is:** one figure's assessment, capped at the drawing's native 320px width so the anchors sit at the scale's ends: label and value on a baseline, a 320×30 SVG scale with a 1.5px baseline and eleven 1px graduations, the authored target band as a hatched rectangle bracketed by 1px edges, and a 2.5px tick at the value. Beneath, the domain's two anchors and the deviation in words.
- **Basis line:** when a figure rests on estimated or unreviewed rows it says so in small print between the head and the scale, naming the rows.
- **Control:** the whole rule is a button whose accessible name is the full sentence. Focus draws the shared outline and marks the contributing table rows. Nothing moves and nothing changes colour.
- **Rule:** the deviation is words; the band is hatch; the value is a tick. No fill, no colour, no score.

### Target chip
- **Style:** inline, 1px ink border, no fill, 0 by 6px padding, small print in the grotesk with tabular numerals, a 2px gap between label and value.
- **State:** none. A chip is a typed target on a method step (`temp 85 °C`, `hold 2 min`), never a control.

### Method step
- **Style:** a two-column grid, step number in the figure role in the left column, body right. Lead-in bold in the text face, instruction in the same face, target chips beneath, then purpose and aside in italic deviation size. "Before you start" heads the method at the prose measure, closed by a hairline rule.
- **Rhythm:** 20px between steps, 12px gutter between number and body.
- **Pen state:** the strike control, the changed line in pen blue, on-demand "add purpose / add aside" text controls, and the uses checkboxes all read in place; a struck step reads struck with its prose intact.

### Front matter and the batch row
- **The band:** two stacked full-width rows above the spread, closed by a baseline rule. The version's row carries the recipe block and the Version/Why/From batch metadata with its acts; the batch's row carries the open batch.
- **Batch row:** a region-name head line with the churned date in pen blue beside it, then a wrapping grid of measured cells — label in caption face, figure in pen blue at figure size, unit lighter, plan sub-line in small print. Correct/Add tasting sit at the foot as text controls; earlier batches open as a hairline-ruled panel beneath.
- **Axis mark:** the tasting's mark control — axis name in caption face at 600 with a 6px gap, then a wrapped row of nine labelled stops (an ink square, filled ink when checked) between anchor words, plus a per-axis clear text control.
- **Version strip:** the Later disclosure's card grid, auto-fill at 260px minimum, one card per descendant — version line in the text face, meta and batch lines in small print; the current version reads bold plus the 1px outline.
- **Pen foot:** while a pen is open, a hairline rule across the page and Cancel | Save right-aligned under the side column, the blocked-save sentence beside them.

### Authored block
- **Style:** a legend in the section role (600 uppercase), with the block's name at left and the word `authored` at right, then a bulleted list in the body role. Keeps the maker's judgement visibly apart from anything derived.

### Navigation
- The running head is the way home, in ink — never bookcloth, which names a block, not a link. The recipe list is plain links inheriting ink with the hairline underline every link carries, name in the text face, version and mass in the grotesk with tabular numerals, 12px between items.

## Do's and Don'ts

### Do:
- **Do** read every colour, face, size, gap, and rule weight through a custom property in `app/src/styles/tokens.css`. No literal anywhere else.
- **Do** put every number in the grotesk with tabular numerals and every sentence in the text face.
- **Do** give every region a running head in bookcloth naming it in plain language.
- **Do** state a figure's standing in words beside the figure (`inside 22–26`, `1.4 over target`) and its basis as a word (`estimated`, `unreviewed`).
- **Do** carry picked, open, current, and marked states by weight and outline: bold plus a 1px ink outline offset 2px, in place. Focus alone reads the heavier 1.5px.
- **Do** paint anything the maker records — typed or saved — in pen blue; only a value returning to the plan (a version edit saved as the plan) returns to ink.
- **Do** strike with one ink stroke (1.2px) for every "not in force" meaning: a skipped step, a superseded value, a removed row or step. Never invent a second strike form.
- **Do** keep ingredient rows in step order under their step heads; strike a removed row rather than deleting it.
- **Do** fix a table's layout and leading before giving any row a heavier weight, so marking moves nothing.
- **Do** give every caption-with-inline-content the same 6px gap.

### Don't:
- **Don't** colour anything to mean pass, fail, warning, or uncertainty. No green tick, no red figure, no amber badge.
- **Don't** use bookcloth on anything but a region name.
- **Don't** add a fifth colour, a grey, a tint, a shadow, a gradient, or a second background.
- **Don't** round a corner without first adding a radius token, and never on a table, rule, chip, or anything that prints.
- **Don't** move an element on hover, focus, or selection, and don't animate an entrance.
- **Don't** put a hero image, a card, a gauge, a progress ring, a sparkline, or an icon on the page (the select's drawn chevron is closed-state chrome, not an icon).
- **Don't** accept browser chrome where the page can draw it — no spinners, no calendar icon, no default select arrow. The dropdown list and date segments stay the browser's; those are the named exceptions.
- **Don't** pre-fill a default on any control; a placeholder is an italic ink example, never pen blue, never a value.
- **Don't** uppercase a unit or set a number in the text face.
