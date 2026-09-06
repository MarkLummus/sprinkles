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
  label:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.04em"
  table:
    fontFamily: "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
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
    typography: "{typography.label}"
    padding: "0 0 6px"
  table-header:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "6px 12px"
  table-cell:
    textColor: "{colors.ink}"
    typography: "{typography.table}"
    padding: "6px 12px"
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

Recorded from the shipped code in `app/src/styles/tokens.css`, `app/src/styles/app.css`, and `app/src/ui/`, after GSD Phase 1. The direction contract that decided these values is `.impeccable/surfaces/route-recipe.md`; this file describes what was built, not what was planned. The frontmatter is normative. The prose says where and why.

## Overview

**Creative North Star: "The Formulation Cookbook"**

A recipe reads as a recipe first. The formulation and the batch record are the same page's margins, never a dashboard laid over it. The page is a book spread: headnote top left, the ingredient table beneath it, the numbered method on the right, the formulation note under the table, and a margin for what the maker wrote. It refuses the recipe-app arrangement of hero photograph, rounded cards, and a green tick for balance, and it refuses the calculator's spreadsheet with coloured bars just as firmly. The mood is warm, precise, and welcoming: a well-set page on a kitchen table in the evening, next to a pen.

The world inherits three rules from the earlier Cupping Form attempt and keeps them binding. Everything the system prints is black. Everything the maker or the record contributes is one pen blue. Colour identifies and form carries state, so nothing on the page is ever coloured to mean good, bad, or uncertain. What the Cookbook adds is a text face with true italics for headnote and method prose, a grotesk with tabular numerals for every table and figure, and one bookcloth green that names the book's sections and does nothing else. Light only, because the scene forces it: the sheet that goes to the machine comes out of a black-only laser printer, and the screen is that sheet's sibling.

Density is generous. One heavy element per view, wide gutters between regions, and no motion on entrance. State changes weight and outline, never position and never hue.

**Key Characteristics:**
- Book-spread layout: headnote, ingredient table, formulation note, method, margin, each wearing its plain-language name as a running head.
- Four colour roles and nothing else: paper, ink, pen, bookcloth.
- Serif for prose, grotesk with tabular numerals for anything counted.
- Balance stated as a tick on a graduated rule and a deviation in words; no colour verdict.
- Print-native: what the screen shows is what the sheet prints, minus the instruments.
- Focus and marking change stroke weight and outline only; nothing moves.

## Colors

Four roles, each with one job, and no fifth colour anywhere in the system.

### Primary
- **Print Ink** (`{colors.ink}`): everything the system prints. Type, table rules, graduations, the hatch of a target band, the tick at a value, focus outlines. Contrast on ground 17.16:1.

### Secondary
- **Pen Blue** (`{colors.pen-blue}`): everything the maker or the record contributes. As-made grams beside the plan, a batch's dated result in the margin, an edited amount before it is saved as a version. Unused on screen after Phase 1; Phase 2 is the first to paint with it. On the printed sheet this layer is blank space for a real pen. Contrast on ground 9.75:1.

### Tertiary
- **Bookcloth** (`{colors.bookcloth}`): a muted bottle green that identifies the book. Running heads and region names only, never a status, never a control, never a figure. A third hue so it is never mistaken for the pen. Contrast on ground 8.22:1.

### Neutral
- **Text Paper** (`{colors.ground}`): the page. Cool off-white, deliberately not cream, so it reads as text paper rather than parchment. There is no sunk, hover, or divider grey; every rule and border is full ink at a thin weight.

### Named Rules
**The Two-Ink Rule.** Printed matter is ink black; recorded matter is pen blue; the two never mix on one element. A value that is half plan and half record is two values.

**The No-Verdict Rule.** No colour anywhere carries pass, fail, warning, or uncertainty. A figure's standing against its band is stated in words beside the figure, and estimated or unreviewed data says so as a word in the Data column.

**The Bookcloth Rule.** Bookcloth appears only on the running heads that name a region. If a new element wants green, it is either a region name or it is wrong.

## Typography

**Display Font:** Georgia (with Iowan Old Style, Times New Roman, serif)
**Body Font:** Georgia (same stack; the text face carries headnote, version line, method prose, and authored notes)
**Label/Figure Font:** the system grotesk (-apple-system, Segoe UI, Helvetica Neue, Helvetica, Arial), with `font-variant-numeric: tabular-nums` on every table cell and figure

**Character:** a working text face for anything read as prose, with true italics for asides and purposes; a plain grotesk for anything counted. The two never swap jobs: a number in Georgia or a sentence of method in the grotesk is an error. Both are system stacks and no font file is fetched.

### Hierarchy
- **Display** (700, 2rem): the recipe name, once per page, in the headnote.
- **Headline** (400, 1.125rem): the version line under the name, e.g. `50 g oil · 800 g`. Units are never uppercased.
- **Body** (400, 1rem): headnote prose, method instructions, authored notes. Method lead-ins are bold within the same size.
- **Table** (400, 0.9375rem, tabular): ingredient table body and the graduated rule's label. The page default.
- **Figure** (700, 1.25rem, tabular): the value beside each graduated rule, and the step number in the method's margin column.
- **Deviation** (400, 0.8125rem): the words under a rule (`inside 22–26`, `1.4 over target`) and, in italic text face, a step's purpose and aside.
- **Label** (400, 0.75rem, 0.04em tracking, uppercase): running heads, region names, table headers, the authored legend.
- **Small print** (400, 0.75rem, tabular where numeric): target chips, basis notes, rule anchors, fat breakdown, import errors.

### Named Rules
**The Counted-in-Grotesk Rule.** Any value that can be weighed, measured, or compared sits in the grotesk with tabular numerals. Prose sits in the text face. The step number is a figure, so it is grotesk.

**The Lowercase-Unit Rule.** Units keep their case everywhere, including inside uppercase running heads.

## Layout

The recipe page is a two-column grid at a 2:1 ratio with three named rows: the headnote spans both columns, the ingredient table sits left with the method right, and the formulation note sits left with the margin right. Regions are separated by the large gap (32px) and the page carries the extra-large gap (48px) as its outer margin. The recipe list is a single column of links, each a flex row of name, version line, and batch mass.

The spacing scale is six steps: hair (2px) for the gap inside a chip and under a rule; xs (6px) for cell padding and the space under a region name; s (12px) for cell horizontal padding, step gutters, and list rhythm; m (20px) between method steps, between graduated rules, and above the basis note; l (32px) between regions; xl (48px) for the page margin.

The method's step number sits in a fixed auto-width margin column so numbers stay put as prose reflows. The ingredient table is full width of its column and its rows are never sorted, grouped, or reordered from the authored order.

No breakpoint exists in code yet. The brief expects the spread at 1280 and wider, the table stacking over the method below that, and the phone receiving the same page read-only in feel, table first. Until a media query lands, the grid holds at every width.

## Elevation & Depth

Flat, and flat as a commitment rather than a default. There are no shadows, no tonal layers, no sunk or raised surfaces, and no second background colour. Depth is conveyed by rule weight alone: hairline graduations (1px), the table's row rules and a rule's baseline (1.5px), and the tick at a figure's value (2.5px). The one heavy element per view is the heaviest stroke on it, not a box with a shadow.

### Named Rules
**The Paper-Is-Flat Rule.** Nothing floats above the page. If an element needs to stand apart, it gets a heavier rule or an ink outline, never a shadow, never a fill.

## Shapes

Square everywhere. No radius token exists and no element carries a rounded corner. Borders are ink at hairline weight: the target chip has a 1px ink border with no fill, the table has a 1.5px rule under every row and header, and the focus outline is 1px ink offset 2px outside the element. The graduated rule is drawn in SVG as straight lines and a 45° hatch at 4px pitch with a 1.2px stroke.

The component character Mark chose is **working binder**: warmer and hand-touched, with room for the pen's blue wherever the maker's hand appears and for softer edges on interactive controls. The blue is already accounted for by the Two-Ink Rule. Softer edges are permitted for future controls but not yet realised: there is no radius token, so a builder who wants one adds it to `tokens.css` first and applies it only to interactive elements, never to tables, rules, chips, or anything that prints.

## Components

Components feel like a working binder: printed pages a person actually writes on. Every control today is drawn in ink at hairline weight with no fill, and state is a change of weight or an outline.

### Region name
- **Style:** the label role in bookcloth, uppercase, tracked 0.04em, with 6px beneath it. Every region (Headnote, Ingredient table, Formulation note, Method, Margin) wears one as its first child.
- **Rule:** the only place bookcloth appears.

### Ingredient table
- **Shape:** square, borderless container; a 1.5px ink rule under every header and row.
- **Type:** header in the label role uppercase; body in the table role with tabular numerals; left-aligned throughout.
- **Padding:** 6px vertical, 12px horizontal per cell.
- **Data column:** an exception-only word (`estimated`, `unreviewed`) in ink; blank when there is nothing to say.
- **Marked state:** when a figure is focused, its contributing rows take a 1px ink outline offset 2px and bold weight. Unmarked rows are untouched, never dimmed.

### Graduated rule (signature)
- **What it is:** one figure's assessment: label and value on a baseline, a 320×30 SVG scale with a 1.5px baseline and eleven 1px graduations, the authored target band as a hatched rectangle bracketed by 1px edges, and a 2.5px tick at the value. Beneath, the domain's two anchors and the deviation in words.
- **Basis line:** when a figure rests on estimated or unreviewed rows it says so in small print between the head and the scale, naming the rows.
- **Control:** the whole rule is a button whose accessible name is the full sentence. Focus draws a 1px ink outline offset 2px and marks the contributing table rows. Nothing moves and nothing changes colour.
- **Rule:** the deviation is words; the band is hatch; the value is a tick. No fill, no colour, no score.

### Target chip
- **Style:** inline, 1px ink border, no fill, 0 by 6px padding, small print in the grotesk with tabular numerals, a 2px gap between label and value.
- **State:** none. A chip is a typed target on a method step (`temp 85 °C`, `hold 2 min`), never a control.

### Method step
- **Style:** a two-column grid, step number in the figure role in the left column, body right. Lead-in bold in the text face, instruction in the same face, target chips beneath, then purpose and aside in italic deviation size.
- **Rhythm:** 20px between steps, 12px gutter between number and body.

### Authored block
- **Style:** a legend in small print uppercase, with the block's name at left and the word `authored` at right, then a bulleted list in the body role. Keeps the maker's judgement visibly apart from anything derived.

### Buttons
- **State of play:** the Export and Import buttons on the recipe list are unstyled browser defaults. No button treatment exists in the system yet. When one is drawn it follows the binder: ink border at hairline weight, no fill, label in the grotesk, focus by the shared 1px outline, and a radius only if a token is added first.

### Inputs / Fields
- Not yet built. The file input is hidden. Phase 2's batch capture is the first surface to need one; the Two-Ink Rule says a value the maker types is pen blue until saved.

### Navigation
- The recipe list is the only navigation: plain links inheriting ink, no underline, name in the text face, version and mass in the grotesk with tabular numerals, 12px between items.

## Do's and Don'ts

### Do:
- **Do** read every colour, face, size, gap, and rule weight through a custom property in `app/src/styles/tokens.css`. No literal anywhere else.
- **Do** put every number in the grotesk with tabular numerals and every sentence in the text face.
- **Do** give every region a running head in bookcloth naming it in plain language.
- **Do** state a figure's standing in words beside the figure (`inside 22–26`, `1.4 over target`) and its basis as a word (`estimated`, `unreviewed`).
- **Do** carry state by weight and outline: bold plus a 1px ink outline offset 2px, in place.
- **Do** keep ingredient rows in authored order; strike a removed row rather than deleting it.
- **Do** paint anything the maker recorded or is editing in pen blue, and return it to ink when it is saved as a version.

### Don't:
- **Don't** colour anything to mean pass, fail, warning, or uncertainty. No green tick, no red figure, no amber badge.
- **Don't** use bookcloth on anything but a region name.
- **Don't** add a fifth colour, a grey, a tint, a shadow, a gradient, or a second background.
- **Don't** round a corner without first adding a radius token, and never on a table, rule, chip, or anything that prints.
- **Don't** move an element on hover, focus, or selection, and don't animate an entrance.
- **Don't** put a hero image, a card, a gauge, a progress ring, a sparkline, or an icon on the page.
- **Don't** uppercase a unit or set a number in the text face.
