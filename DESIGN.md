---
name: Sprinkles
description: A recipe read as a recipe, with the formulation and the record in its margins.
colors:
  sheet-ground: "#f7f7f4"
  sheet-ink: "#141414"
  sheet-pen-blue: "#1f3d7a"
  sheet-bookcloth: "#33513b"
  app-notebook: "#FD5B57"
  app-notebook-text: "#EE0803"
  app-recipe-book: "#F18A36"
  app-recipe-book-text: "#BC5B0D"
  app-idea-log: "#FDC632"
  app-idea-log-text: "#976F01"
  app-pantry: "#76BD78"
  app-ingredients: "#388B57"
  app-ingredients-text: "#358452"
  app-kitchen: "#505DB5"
  app-blue: "#2081EA"
  app-blue-text: "#1576DE"
  app-background: "#FFFFFF"
  app-surface-subtle: "#F3F4F2"
  app-text: "#141414"
  app-text-secondary: "#595959"
  app-divider: "#D6DAD7"
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
    textColor: "{colors.sheet-bookcloth}"
    typography: "{typography.section}"
    padding: "0 0 6px"
  button:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-ink}"
    typography: "{typography.table}"
    padding: "7px"
  button-hover:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-ink}"
    padding: "6px"
  text-control:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-ink}"
    typography: "{typography.control}"
    padding: "0"
    height: "24px"
  text-control-touch:
    height: "44px"
  ink-field:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-pen-blue}"
    typography: "{typography.table}"
    padding: "2px 6px"
    height: "26px"
  ink-field-touch:
    typography: "{typography.note}"
    height: "44px"
  prose-field:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-pen-blue}"
    typography: "{typography.body}"
    lineHeight: 1.5
    padding: "2px 0"
    minHeight: "1.5em"
  prose-field-touch:
    typography: "{typography.note}"
    minHeight: "44px"
  pen-caption:
    textColor: "{colors.sheet-ink}"
    typography: "{typography.caption}"
    padding: "0 0 6px"
  pen-helper:
    textColor: "{colors.sheet-ink}"
    typography: "{typography.helper}"
    padding: "0"
  table-header:
    textColor: "{colors.sheet-ink}"
    typography: "{typography.label}"
    padding: "6px 6px"
  table-cell:
    textColor: "{colors.sheet-ink}"
    typography: "{typography.table}"
    padding: "6px 6px"
  target-chip:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-ink}"
    typography: "{typography.small-print}"
    padding: "0 6px"
  axis-stop:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-ink}"
    typography: "{typography.table}"
    width: "38px"
    height: "32px"
  axis-stop-picked:
    backgroundColor: "{colors.sheet-pen-blue}"
    textColor: "{colors.sheet-ground}"
  segmented-option:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-ink}"
    typography: "{typography.control}"
    padding: "5px 8px"
    height: "32px"
  segmented-option-picked:
    backgroundColor: "{colors.sheet-pen-blue}"
    textColor: "{colors.sheet-ground}"
  chip-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.sheet-ink}"
    typography: "{typography.control}"
    padding: "0"
    height: "32px"
  chip-toggle-mark-pressed:
    backgroundColor: "{colors.sheet-pen-blue}"
    size: "13px"
  figure-value:
    textColor: "{colors.sheet-ink}"
    typography: "{typography.figure}"
  recorded-value:
    textColor: "{colors.sheet-pen-blue}"
    typography: "{typography.note}"
  step-number:
    textColor: "{colors.sheet-ink}"
    typography: "{typography.figure}"
---

# Design System: Sprinkles

Merged 2026-09-20 from the implemented Sheet system and the approved product/surface direction. The frontmatter preserves the existing tokens and components from `app/src/styles/tokens.css`, `app/src/styles/app.css`, and `app/src/ui/`; these are implemented Sheet primitives, not an exhaustive palette or component contract for the future app interface. App palette amendment, approved 2026-09-21: Option B with the revised Ingredients green and the preview neutral set are now specified in frontmatter. These app tokens are approved design values, not a claim of implementation; existing Sheet tokens remain unchanged. The detailed implementation catalogue was last refreshed 2026-09-17; this merge verifies palette identity and changes scope, not every historical component assertion.

Product authority: `PRODUCT.md` and D17 in `product-requirements/03-decision-register.md`. The shell/Home direction is owned by `.impeccable/surfaces/route.md`; Recipe Sheet, record, and print behavior retain their respective surface briefs. Approved direction and implemented behavior are distinguished below.

## Overview

**Creative North Star: "The Formulation Cookbook"**

The cookbook remains the material reference for Recipe Sheets and batch/tasting logs. Around those Sheet surfaces, Sprinkles has a colorful app interface for navigation, recipe context, history, and supporting tools. The two contexts belong to one product: the Sheet supports reading, making, and recording; the app interface supports finding, choosing, and continuing work. The retired name “Sprinkles Jar” is not an interface label.

**The two contexts are named.** The **Sheet** is the Recipe Sheet, the batch and tasting log, and the print sheet. The **App** is Home, Notebook, Recipe Book, Idea log, Ingredients, and Kitchen. Every colour token carries its context as a prefix: `sheet-*` for the Sheet, `app-*` for the App. Earlier drafts of this document named the Sheet after its material.

**The Context Boundary Rule.** Apply Sheet rules to Recipe Sheets, batch/tasting logs, and print, not to every element on a recipe route. Recipe-level name and description, History, provenance, version selection, and navigation belong to app context. Sheet title, Sheet description, ingredients, Method, and Notes belong to the version's Recipe Sheet. Batch records keep the paper and pen treatment. A shared route does not imply a shared visual context.

| Context | Approved direction | Implementation status |
|---|---|---|
| App interface | Bright, colorful, approachable; the approved Option B destination palette and neutral set. Color identifies and guides, never judges a result. | Base palette and neutrals approved; interaction and feedback colors, derived states, type roles, shapes, depth, motion, and components remain unresolved. Existing Sheet-styled shell/history controls are transitional. |
| Recipe Sheet and batch/tasting log | Paper, ink, pen blue, restrained rules, readable prose and precise quantities. | Existing tokens and component catalogue below. Proposed highlighter role remains unresolved. |
| Print | Black on white, with room for handwritten records and a stable reference to the version. | Print behavior is owned by the print surface brief; screen paper color is not a requirement to print a background. |

Home composition belongs in its surface brief. Mockups are exploration evidence, not token specifications: photographs, handwriting, slogans, and exact component geometry are not approved merely because they appear in a preferred concept.

**Key Characteristics:**
- Two explicit visual contexts: the colorful app interface, and the Sheet (Recipe Sheets and records).
- Four implemented Sheet color roles, plus approved app destination colors and neutrals; no recipe-specific colors.
- Sheet prose uses the text face; measured quantities use the grotesk with tabular numerals.
- Sheet controls preserve the binder's ink outlines, pen-blue selection, and distinct focus indication.
- Across both contexts, color never carries a verdict; meaning and interaction state remain legible without color.
- Approved direction is distinct from shipped components and unresolved visual choices.

## Colors

### Scope and status

The four frontmatter roles below are the **implemented Sheet palette**. Their names and values are preserved. They are not a four-color limit on Sprinkles.

`app/src/styles/tokens.css` still declares these roles unprefixed (`--ground`, `--ink`, `--pen-blue`, `--bookcloth`, `--gap-*`, `--type-*`); the code rename is pending and rides with the tokens.css palette rework. The typography and spacing roles catalogued below are Sheet roles too, and take the `sheet-` prefix in the design system; this document's frontmatter `typography` and `spacing` keys stay as they are, because they are not colour aliases.

**App palette — approved 2026-09-21:** Option B (Bright accents), with the lighter Ingredients green, and the preview neutral set. The `app-*` frontmatter values are approved for the app interface; they do not replace Sheet tokens and are not yet a shipped CSS catalogue.

| Role | Approved token |
|---|---|
| Notebook · red | `{colors.app-notebook}` |
| Notebook text · 4.50:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-notebook-text}` |
| Recipe Book · orange | `{colors.app-recipe-book}` |
| Recipe Book text · 4.52:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-recipe-book-text}` |
| Idea log · yellow | `{colors.app-idea-log}` |
| Idea log text · 4.59:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-idea-log-text}` |
| Pantry · light green, reserved for later | `{colors.app-pantry}` |
| Ingredients · leaf green | `{colors.app-ingredients}` |
| Ingredients text · 4.60:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-ingredients-text}` |
| Kitchen · indigo | `{colors.app-kitchen}` |
| App blue · distinct from Sheet pen blue | `{colors.app-blue}` |
| App blue text · 4.51:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-blue-text}` |
| App background | `{colors.app-background}` |
| Subtle surface | `{colors.app-surface-subtle}` |
| Primary text | `{colors.app-text}` |
| Secondary text | `{colors.app-text-secondary}` |
| Dividers | `{colors.app-divider}` |

**Text companions, tentatively approved 2026-09-21.** A companion is the same hue darkened only until it clears 4.5:1 on the app background, for a destination name, a count, or a link set in its own colour. A companion is never a fill, and an accent is never text. Kitchen needs no companion: it already reads 5.88:1. Two companions carry a caveat. The Notebook companion is a pure red and must be watched against the No-Verdict Rule; the Idea log companion is an olive that no longer reads as the yellow. Either may fall back to the app's primary text colour.

Recipe-specific identity colors are retired. Destination colors identify workspaces, not individual recipes or outcomes. Pantry's reserved color does not add Pantry to the current feature scope.

**The filled action, tentatively approved 2026-09-21.** The primary action in the App is a filled control in the app blue's text companion (`{colors.app-blue-text}`) with a white label, 4.51:1; the secondary action is the same blue as outline and label on the app background. App blue itself under a white label reads 3.90:1 and is not used as a fill; a per-destination fill cannot be one rule because Ingredients and Kitchen fail under an ink label. Chosen on the canvas from six drawn alternatives.

**Still unresolved:** whether app blue is the shared link and focus color; feedback treatments; pale tints; hover, pressed, and disabled states. Preview-derived variants are experimental, not approved tokens. Contrast-test each foreground/background pairing before implementation; accent swatches are not automatically suitable for text or white button labels. The existing no-verdict rule remains binding until a feedback decision explicitly revises it. The Sheet highlighter's color and meaning remain unresolved. The five text companions above are tentatively approved 2026-09-21 and wait on Mark's confirmation.

The existing sidecar's tonal ramps are preview metadata, not additional approved UI colors. Approved app roles are specified above; derived ramps still require review before implementation.


### Primary
- **Print Ink** (`{colors.sheet-ink}`): everything the system prints. Type, table rules, graduations, the hatch of a target band, the tick at a value, every drawn control's border, the strike, focus outlines. Contrast on ground 17.16:1.

### Secondary
- **Pen Blue** (`{colors.sheet-pen-blue}`): everything the maker or the record contributes, and now also the fill that marks a picked control. An ink field's typed value and the record's saved text (`.ink-field`, `.prose-field`, `.prose-text`, `.ink-text`), the batch row's measured cells and date, a changed step's line, the fill of a picked stop, segment or defect square. The plan beside it stays black. On the printed sheet this layer is blank space for a real pen. Contrast on ground 9.75:1. In the App, pen blue has one use only: the maker's own words, set in the hand. This is the one sanctioned `sheet-` token in the App, chosen so the maker's words keep the Sheet's voice wherever they are quoted; recipe-level metadata, provenance, dates and standing are app text or secondary text in the App even when they describe a record.

### Tertiary
- **Bookcloth** (`{colors.sheet-bookcloth}`): a muted bottle green that identifies the book. Sheet region names and the hairline that separates the version row's full-width sub-rows — never a status, never a control, never a figure. A third hue so it is never mistaken for the pen. Contrast on ground 8.22:1.

### Neutral
- **Text Paper** (`{colors.sheet-ground}`): the page, and the text colour of any control the pen has filled. Cool off-white, deliberately not cream, so it reads as text paper rather than parchment. There is no sunk, hover, or divider grey; every rule and border is full ink at a thin weight.

### Named Rules
**The Two-Ink Rule.** Within the Sheet, printed matter is ink black; recorded matter is pen blue; the two never mix on one element. A value that is half plan and half record is two values. The record keeps its blue after saving — it is the maker's, and saving changes form, not ink.

**The No-Verdict Rule.** No colour anywhere carries pass, fail, warning, or uncertainty. A figure's standing against its band is stated in words beside the figure; estimated or unreviewed data says so as a word in the Data column; a malformed measurement is a sentence under the field and `aria-invalid`, never a red line. A picked control's pen-blue fill is not a verdict — it is the record's own ink saying *the maker chose this*.

**The Bookcloth Rule.** In the Sheet, bookcloth names regions or draws the existing band-sub-row hairline. This role does not constrain green or other identity colors in the app interface.

## Typography

**Scope:** the stacks and hierarchy below catalogue implemented Sheet typography and its current reuse in legacy app controls. App-interface typography remains to be specified; Sheet uppercase captions and serif/grotesk assignments are not automatic app-wide requirements. One handwriting face is approved for the App and reserved for the maker's own words; see the Hand role and the Hand Rule below. It is not a Sheet face: on a Recipe Sheet, in a batch record, and in print, the maker's words stay in the text face and pen blue. Units retain their correct case and quantities remain easy to scan in both contexts.

**Display Font:** Georgia (with Iowan Old Style, Times New Roman, serif)
**Body Font:** Georgia (same stack; the text face carries headnote, version line, method prose, authored notes, and the record's own words)
**Label/Figure Font:** the system grotesk (-apple-system, Segoe UI, Helvetica Neue, Helvetica, Arial), with `font-variant-numeric: tabular-nums` on every table cell, field, and figure

**Character:** a working text face for anything read as prose, with true italics for asides and purposes; a plain grotesk for anything counted. The two never swap jobs: a number in Georgia or a sentence of method in the grotesk is an error. Both are system stacks and no font file is fetched.

### Hierarchy
- **Display** (700, 2rem): the recipe name, once per page, in the headnote.
- **Headline** (400, 1.125rem): an authored version identity, e.g. `Version 2 · 50 g oil · 800 g`. Batch dates are compact metadata, never headlines. Units are never uppercased.
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
- **Hand** (400, 1.375rem, leading 1.25, sheet pen blue), *approved 2026-09-21, implementation pending*: the maker's own words in the App: a tasting, a Next time, a version's Why, a batch's note, an idea in the log. Never below 1.25rem, because a script face loses its letterforms before a text face does. Never uppercase, never bold, never a label. Under `forced-colors: active` and in print the role falls back to the text face in italic, so the words survive where the face does not. Face: Caveat (SIL Open Font License), shipped as a file in the repo and declared with one `@font-face`; no font is fetched from a network. Tokens: `--face-hand`, `--size-hand`, `--leading-hand`, `--size-hand-min`, to land with the tokens.css palette rework. The entry moves out of *pending* when those tokens exist and the fallback is verified in both modes.
- **Small print** (400, 0.75rem, tabular where numeric): target chips, basis notes, rule anchors, fat breakdown, plan sub-lines, cross-flags, version-strip meta, import errors.

### Named Rules
**The Counted-in-Grotesk Rule.** Any value that can be weighed, measured, or compared sits in the grotesk with tabular numerals. Prose sits in the text face. The step number is a figure, so it is grotesk.

**The Lowercase-Unit Rule.** Units keep their case everywhere, including inside uppercase running heads.

**The Placeholder Rule.** A placeholder is an example in ink small print, italic — never a default, never pen blue. A blank field still saves as blank.

**The Hand Rule.** In the App, what the maker observed is written in the hand, in sheet pen blue: a tasting, a Next time, a Why, a note on a batch, an idea. What the maker specified (ingredients, method, quantities, dates, names) is set in type, because a specification is not an observation. What the app writes is set in type, always, so the hand never speaks in the app's voice and a machine suggestion is never mistaken for the maker's judgement. A question the maker typed to an expert is set in type; it is the maker's, but it is not an observation. The hand is a face, not a colour rule: it is always pen blue, but pen blue is not always the hand.

**The Caption-and-Helper Rule.** A caption is uppercase and labels exactly one input. A sentence that explains rather than labels is a *helper*, sentence-cased, and it sits beside the caption as a sibling — never folded into it, where `text-transform` would shout it.

**The 16px Field Rule.** Wherever the pointer is coarse, `.ink-field` and `.prose-field` read at the note size (16px). Below 16px iOS Safari zooms the page on field focus, which moves the record under the maker's thumb; the app's earlier 13px touch size is retired.

## Layout

### Approved boundary; app layout unresolved

Keep recipe context visibly distinct from the Recipe Sheet. The desktop exploration places context in a left sidebar and the Sheet on the right; smaller-screen treatments must preserve that distinction and reading order. Exact widths, collapse behavior, and navigation patterns remain surface decisions, not new global breakpoints. Home strategy is defined in its owning brief, not by the recipe grid below.

### Existing Sheet-page implementation

The following grid and responsive catalogue describe the incumbent page, including legacy front matter that currently mixes app context with the Sheet. They are implementation evidence, not a requirement to preserve that placement when applying the new boundary.

The recipe page is a two-column grid at a 2:1 ratio. A **front-matter band** spans both columns above the spread: two stacked full-width rows — the version's row (recipe block at `1.6fr`, Version/Why/From batch metadata at a 300px floor, plus full-width sub-rows for the save ceremony and History disclosure, each opened by a bookcloth hairline), then the batch's row — closed by a baseline-weight rule. Below it, column one is the recipe as written in the sheet's page order, the ingredient table then the method; column two is a single region that flows on its own, the formulation note beside the table, then the margin. A **pen foot** appears across the full width only while a pen is open: a hairline rule, then the save ceremony right-aligned under the side column. Whichever column runs longer leaves its void at the bottom. Regions are separated by the large gap (32px) and the page carries the extra-large gap (48px) as its outer margin. The recipe list is a single column of links, each a flex row of name, version line, and batch mass.

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

**App interface:** the Sheet's prohibitions on second backgrounds, tonal layers, and shadows do not apply globally. The app background and subtle surface colors are approved; shadow values and further depth treatments remain unresolved. Maintain discernible focus and state without relying on color.

**The Sheet:** flat, and flat as a commitment rather than a default. There are no shadows, no tonal layers, no sunk or raised surfaces, and no second background colour — no Sheet shadow token is established. Depth is conveyed by rule weight alone: hairline graduations and state outlines (1px), the table's row rules, a rule's baseline and a text control's hovered underline (1.5px), every hover border and the focus ring (2px), and the tick at a figure's value (2.5px). The one heavy element per view is the heaviest stroke on it, not a box with a shadow.

Three weights, three meanings, and they are provably ordered: **1px** is the outline on content the page is pointing at (a marked table row, the open batch, the current version); **2px** is focus, and nothing else; the picked control's **fill** is a different sign entirely, so a picked thing and a focused thing never read as each other.

### Named Rules
**The Sheet-Is-Flat Rule.** Within a Recipe Sheet or batch/tasting log, nothing floats above the paper. If an element needs to stand apart, it gets a heavier rule, an ink outline, or the pen's fill — never a shadow.

**The Focus-Heavier-than-State Rule.** One focus rule at the browser's own `:focus-visible` boundary draws a 2px ink outline offset 2px — heavier than the 1px outline any pointed-at content carries, and a different sign from a pressed control's fill. A focused element that is also stateful reads both. There is exactly one documented exception: `.is-landing-focus:focus`, a plain `:focus` rule that makes the fork's landing focus visible after a mouse-driven Save, which Chrome's modality tracking would otherwise leave ringless.

**The Hover-Is-Weight Rule.** Hover thickens a border from 1px to a whole 2px and removes exactly that much padding, so the box never changes size — 1.5px renders as 1px at DPR 1, which is why hover needs its own token rather than borrowing the baseline. A joined control thickens in place and stacks above its neighbours. Weight, never position or hue.

## Shapes

**App interface:** plain, quiet, rounded controls are part of the approved direction, but no exact radius or component shape is established. The Sheet's square-edge and browser-chrome treatments do not bind the app interface.

**Implemented Sheet controls:** square. No radius token is established in the preserved catalogue. Borders are ink at hairline weight: buttons, fields, segmented options and axis stops carry a 1px border with no fill at rest; the table has a 1.5px rule under every row and header; the focus outline is 2px ink offset 2px outside the element, and it means focus only — an invalid field is a sentence beneath it, never a ring. The graduated rule is drawn in SVG as straight lines and a 45° hatch at 4px pitch with a 1.2px stroke.

Joined controls — the five stops of an axis, the three options of a segmented control — share one hairline through a negative margin rather than a gap, and the picked cell lifts above its neighbours so its pen-blue border is never hidden under theirs.

The component character Mark chose is **working binder**: warmer and hand-touched, with room for the pen's blue wherever the maker's hand appears. Softer edges are permitted for future controls but not yet realised: there is no radius token, so a builder who wants one adds it to `tokens.css` first and applies it only to interactive elements, never to tables, rules, chips, or anything that prints.

Browser chrome is redrawn, not accepted: the select's arrow is replaced by two CSS-drawn ink triangles, number spinners are stripped cross-browser, the date input's calendar icon is hidden in Chromium and WebKit, and a date field carries `appearance: none` so WebKit stops rendering it as a native control that ignores the author box model outright. Two named exceptions keep their browser drawing — the select's dropdown list and the date input's segment highlight — because no styling hook reaches them.

## Components

**Catalogue scope:** the descriptions and sidecar examples below preserve the implemented Sheet controls. Front matter, History, and navigation examples also document transitional reuse of these controls outside the Sheet; they do not define the future app component family. App components require their own approved states and tokens. Shared accessibility responsibilities include usable touch targets, keyboard access, explicit labels, visible focus distinct from selection, and feedback that survives the action it reports.

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
- **Prose field** (`.prose-field`): the maker's words editing in place as the printed paragraph — no border at rest, pen blue text in the text face at the paragraph's own inherited size, note leading, a 2px vertical inset, and a one-line minimum extent, growing with its text (`field-sizing: content`) with no resize grip. A blank named prose field carries a hairline baseline so the writable spot is findable. Narrow and coarse-pointer contexts raise it to the shared 44px touch floor and 16px text.
- **Prose text** (`.prose-text`): the record's saved words, the same text face and leading as the field it was typed in, still pen blue.
- **Field feedback** (`FieldFeedback.jsx`): the one line beneath an editable field. It shows quiet, visually-present `Required` guidance when requested; an actionable `.field-error` replaces that guidance after invalid submission. The input owns the error through `aria-describedby`, while native `required` semantics own the requirement. Version, Churn date, and every measured field share this component so their placement and priority cannot drift.
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
- **The band:** two stacked full-width rows above the spread, closed by a baseline rule. The version's row carries the recipe block and compact factual metadata (Written, From version, From batch) as a definition list. Why remains in that semantic list but spans both tracks and reads as authored prose at the note role; an absent reason stays quiet, in ink, at helper size. The save ceremony and History disclosure sit as full-width sub-rows beneath, each opened by a bookcloth hairline.
- **Batch row:** a region-name head line with the churned date in compact pen-blue metadata beside it, then a wrapping grid of measured cells (96px minimum) — label in the caption role, figure in pen blue at the note size and the prose weight, unit at the deviation size, plan sub-line in small print. An absent value reads "not measured" in **ink**, at the unit's size: an absence is not a record. Correct sits on the head line, right-aligned, as a text control; the Batches panel beneath uses a control-size grotesk date and small-print provenance rather than borrowing the version-name role.
- **Recipe history:** the Version row's `History (n versions)` disclosure opens one ruled development outline at the prose measure. Preserved versions follow their parent-child lineage, oldest root first; a branch nests beneath its actual parent rather than being flattened. Authored version identities use the serif version-line role; Why, tasting notes, and Next time use the shared serif prose role. Written/churn/tasted dates, counts, provenance, `In view`, and `Latest` stay in compact grotesk metadata. Batches nest directly beneath their version, newest attempt first, with a stable route and a control-size date; indentation and the smaller name role make them subordinate without shrinking authored outcomes. Versions remain plans and batches remain attempts.

### Shared history components
`app/src/ui/History.jsx` owns disclosure buttons, panels, lists, record state, markers, and provenance; `app/src/styles/history.css` owns their presentation using the existing tokens. Both recipe and batch histories consume them. Callers keep entity-specific ordering, routes, heading roles, content, and pen-lock navigation decisions.

- `HistoryDisclosure` takes `open`, `onToggle`, and `panelId`; pair it with `HistoryPanel` using the same `id` and `open`. The panel stays mounted and hidden when closed, with its content unmounted. Native buttons retain Enter/Space behavior, the global focus ring, hover underline, and coarse-pointer target sizing. Opening is expressed by the panel and `aria-expanded`, without restyling the word.
- `HistoryList` takes `ordered`, `label`, and optional `nested="records"` or `nested="branches"`. Lists keep explicit list semantics when their markers are suppressed. Both nested variants reduce indentation below 760px; authored text wraps.
- `HistoryItem` takes `current` and optional `as="article"` for a version sheet. Current records carry `aria-current`, an ink outline, and a bold identity; prose and provenance keep their normal weight. Child version branches sit outside the parent sheet so they do not inherit its current state. Record padding is `--gap-s` in both histories.
- `HistoryMarkers` takes independent `current` and `latest` booleans. Only callers determine which entity is latest. `HistoryProvenance` accepts text or links as children and optional layout classes; dates and state words share the small-print grotesk role.

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

### App marks (approved direction, 2026-09-21; not implemented)
Settled with Mark on the design canvas when the recipe hues were retired. Colour says where a thing lives, never which recipe it is and never how it went. A recipe has no colour; its name is its identity.

- **The rail.** Each row on a list keeps its 8px rail, now in the colour of the destination the row lives in: Notebook, Recipe book, Idea log. A citation of a Notebook batch inside another destination carries a Notebook rail. The rail stays on every list, single-destination lists included, so a row keeps one shape everywhere (Mark, 2026-09-21; rail-only-where-places-mix was considered and declined).
- **Tallies.** A version is a filled sprinkle, a batch is an open sprinkle with a 2px edge, both in the row's destination colour, always beside the words that state the count. Ideas have no batches.
- **Navigation.** The active place underlines in its own colour; Home, which is no destination, underlines in app blue. Tabs inside a recipe (History beside the Sheet) underline in the colour of the place the recipe is in. Standing words such as "In view" stay ink.
- **History.** On a timeline a version node and its batch rings take the colour of where that version lives now: a Notebook version red, the Recipe book version orange, an imported recipe orange, an idea yellow. Ink nodes were tried and rejected.
- **The brand mark.** The sprinkle rule under the word Sprinkles is the five destination colours in navigation order.
- **Filled action.** See Colors. Home as shipped, and the Sheet, keep their present treatment.

### Navigation (incumbent implementation; app redesign pending)
- The running head is the way home, in ink — never bookcloth, which names a block, not a link. The recipe list is plain links inheriting ink with the hairline underline every link carries, name in the text face, version and mass in the grotesk with tabular numerals, 12px between items. A "no recipe found" page carries the running head above it and a second link back to the list.

## Do's and Don'ts

### Do:
- **Do** establish whether an element belongs to app context, a Recipe Sheet, a batch/tasting log, or print before applying visual rules.
- **Do** preserve the implemented Sheet tokens; add app tokens only when their roles and values have been specified and implemented.
- **Do** keep recipe identity and app accents distinct from ink that communicates plan and actual records.
- **Do** keep keyboard focus discernible from selected state, preserve semantic controls, and make touch targets usable.
- **Do** state balance, uncertainty, errors, and provenance in words; color never supplies a verdict.
- **Do** keep units correctly cased, quantities legible, and required/error feedback attached to its control.
- **Do** use the Sheet catalogue for Sheet typography, outlines, pen selection, step order, and print behavior.
- **Do** distinguish approved direction, observed implementation, and unresolved design choices.
- **Do** keep page composition in surface briefs and reusable visual rules in this document.
- **Do** set the maker's observations in the hand and sheet pen blue in the App, at or above the hand's minimum size, with the text-face fallback in place for forced colours and print.

### Don't:
- **Don't** impose the Sheet palette's four colors on Home, navigation, recipe context, History, Ingredients, Kitchen, or consultations.
- **Don't** extend the Sheet's flatness, square corners, no-motion treatment, or image restrictions into app-wide bans.
- **Don't** add shadows, gradients, rounded cards, or animation inside the Sheet merely because the surrounding app can use a different treatment.
- **Don't** introduce app palette values, fonts, shadows, radii, or motion timings from exploratory mocks without a design decision.
- **Don't** treat sidecar tonal-ramp previews as approved additional colors.
- **Don't** use color to encode success, failure, warning, or uncertainty, or make interaction state depend on color alone.
- **Don't** paint recipe-level metadata as recorded pen content merely because it shares a route with the Sheet.
- **Don't** call the surrounding interface “Sprinkles Jar.” Use the approved section names and vocabulary.
- **Don't** put a specification, a label, a date, a heading, or anything the app wrote in the hand, and don't load the hand's file from a network.
- **Don't** give a recipe a colour of its own, and don't let a rail, a sprinkle, or an underline mean anything but the place a thing lives or the place you are.
