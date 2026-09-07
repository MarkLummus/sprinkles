---
version: 1
slug: "route-recipe"
primary_target: "route:/recipe"
related_targets: ["route:/print/recipe-sheet"]
---

# Surface brief — Recipe and the bench sheet

**Mode:** Operate, both halves. **Status:** shaped 2026-09-05; confirmed by Mark 2026-09-05; revised 2026-09-07: the version-editing and comparison direction is superseded by `route-recipe-version.md` (confirmed by Mark 2026-09-07). **Targets:** `route:/recipe` (review, version editing, comparison) and `route:/print/recipe-sheet` (the bench sheet). The batch-capture flow is a separate brief (GSD Phase 2). This brief feeds GSD Phases 1, 3, and 4.

Product truth: `PRODUCT.md` and `product-requirements/03-decision-register.md`. Requirement IDs: `.planning/REQUIREMENTS.md`.

## 1. Job and audience

The serious enthusiast, Mark first, arriving five ways:

- **Reading** a recipe he has already made (the churned olive oil version) to work from the app instead of the printout. Phase 1.
- **Reading plan and reality together** once the 2 Aug batch is recorded: as-made grams and the own-words result beside the plan. After Phase 2.
- **Developing** version 2 from the churned version and seeing what changed and what it did to the balance. Phase 3.
- **Departing** for the kitchen with a printed sheet. Phase 4.
- **At the machine**, reading the sheet with a pen in hand. The only arrival not on a screen, and the one the product is judged by.

Desktop formulates. Paper works the kitchen. The phone reads and transcribes; it does not formulate in milestone 1.

## 2. Outcome and proof

Two primary tasks: read a recipe as a recipe, and turn a copy of it into the next version with its consequences visible. A third closes the loop: print a sheet that is the same object on paper.

Success is the roadmap's criteria: REC1-01..05, FORM1-01..03, FORM2-01..02, PRINT-01..05, UX1-01..03. Proof content is real: the olive oil recipe (twelve rows, ten steps, targets, three carried-forward notes, two before-you-start notes), its batch of 2 Aug 2026 (as-made cream 241 g, milk 383 g, oil 45 g, lecithin step struck; draw −6 °C; "soft, not greasy"; oil character 4.5, bitterness 5, sweetness 4), and a version 2 in progress.

Product-specific truth the surface must show, not claim: plan, actual, and result are three visibly different layers of one page; balance figures are stated in words against their bands and never coloured as a verdict; a figure resting on estimated or unreviewed data says so where the figure is.

## 3. Selected direction

**Visual authority:** expand the Cupping Form. Pinned from it: everything the system prints is black, everything recorded is one pen blue, the two never mix; colour identifies and form carries state; print-native; no colour-coded status. Open for this surface: palette beyond those roles, type, component grammar.

**Direction:** The Formulation Cookbook. Grounded candidate 5 of 7, assigned by seed `d1a5d80a` on 2026-09-05, chosen by Mark over the pick (The Revision Drawing) and two competitive challengers (Exposure Record, Force Diagram). Build path: code-led (no image generation in this harness).

- **Thesis.** A recipe reads as a recipe first; the formulation and the record are the same page's margins, never a dashboard laid over it. It refuses the recipe-app arrangement (hero photo, cards, gauge) and the calculator grid (a spreadsheet with coloured bars) alike.
- **World.** Cool text-paper ground, print ink, pen blue for everything recorded, one bookcloth colour that identifies the book (running heads, section tabs) and never carries state. Light only, forced by the scene: a kitchen table in the evening and a black-only laser printer. Type: a working text face with true italics for headnote and method prose, a grotesk with tabular numerals for tables and figures; exact faces chosen at build under the calibration rules, never the bookish defaults.
- **Structural thesis.** One surface for developing; making is a departure to paper. The page is a book spread: headnote (name, version line, authored notes) top left; the ingredient table beneath it with grams, % of batch, and the step each row goes into; the numbered method beneath the table, in the sheet's page order, with bold lead-ins, prose instructions, and typed targets (temperature, time, amount) as small chips in the margin. Balance figures sit beside the table as a formulation note in the right-hand column, so the six rules share the table's viewport and focusing one marks its rows in view: six graduated rules (PAC, POD, fat with milkfat and added fat, MSNF, sugar solids, total solids) with a tick and the deviation in words. (Revised 2026-09-06 by Mark after the first critique; the note was originally under the table with the method on the right.) Derived advisories are margin small-print, each citing its basis; authored notes sit apart, labelled as authored.
- **The record in the margin.** When the latest version has a batch, an as-made column appears beside grams in pen blue and the batch's dated result reads as a marginal note in the same blue. Plan stays black.
- **Versions.** Version 2 reads clean. Changes read as tracked changes: the parent's value struck in ink beside the current one, always visible while the pen is open and laid back on the page by one version-level "show changes" control after save; the translucent sheet is retired (Mark, 2026-09-07). Every version stays reachable in one strip under the headnote. The full direction is in `route-recipe-version.md`.
- **Focal moment.** The spread with the ingredient table and its formulation note: how the recipe reads and how far it sits from target, on one page.
- **Signature interaction, the pen.** Editing an amount turns it blue until it is saved as a version; saving is a ceremony that returns the page to black. Focusing any balance figure highlights the rows that carry it, so an assumption is one hover from the number it moves.
- **Raises carried from the round.** Overlay comparison (Exposure Record); figures trace to contributors (Force Diagram); every superseded version reachable in one strip (Cutting Bench); generous void, one heavy element per view (Console Fog); state changes weight and outline, never position (Telop Captions); every block wears its plain-language name (Quote Grammar).
- **The sheet.** The spread reflowed to letter portrait: formula page with the table, a mise-en-place box per row, the step column, and a blank as-made column; method page with the targets beside the prose; a blank batch-log page last with fixed geometry; a human-readable short code in the header of every page. The blue layer prints as blank space for a real pen. Balance rules and the freezing curve do not print.
- **Implementation consequence.** Screen and sheet render from one component tree with print CSS reflowing the spread; no component may carry status by colour; show-changes is a state of the same page, not a route; printing captures a saved version and never the live DOM.

## 4. Scope and boundaries

**Fidelity:** production-ready. **Breadth:** the whole recipe surface and its sheet. **Interactivity:** full flow (read, edit, save version, compare, print).

**In:** recipe review; create version from a version; edit amounts, remove and restore rows, edit steps and targets; change reason citing a batch; the comparison overlay; balance figures and structural advisories; the bench sheet's formula, method, and batch-log pages; the short code and its lookup.

**Out, and named:** the batch-capture flow and its interaction (own brief); the ingredient library and record; import; scaling; home and the recipe list beyond the entry into this surface; QR codes and the print-log nudge; storage.

**Anti-goals:** no pass/fail colour or score on a figure; no screen that differs from the sheet in kind; no sensory prediction in derived advice; no mode toggle between developing and making; no advisory that blocks saving or printing; no printing of unsaved edits.

## 5. States and ranges

| | Realistic range |
|---|---|
| Ingredient rows | 5–15; the working case has 12 |
| Method steps | 3–10; the working case has 10 |
| Versions per recipe | 1–6 in milestone 1 |
| Batch mass | 800 g, fixed in milestone 1 |
| Balance figures | 6, always |
| Derived advisories | 0–6 |
| Sheet pages | 3 |
| Diff rows on the overlay | 0–12 |

**Material states:** no batch yet · latest version has a batch · newer version in progress with unsaved edits · saved version · comparison overlay open · a figure outside its band · a figure resting on estimated or unreviewed data · a row removed (struck, restorable) · a step with no targets · print preview of a saved version · attempt to print with unsaved edits.

## 6. Interaction and layout

- **Hierarchy:** name and version line; ingredient table; formulation note; method; margin (record, advisories, authored notes). Column one is the recipe as written (table, then method); column two is what the sheet does not print (formulation note, then margin).
- **Topology:** one page per recipe, no tabs and no mode toggle; a version strip under the headnote; the overlay for comparison; the browser's print for the sheet.
- **Editing:** amounts edit inline and turn blue while dirty; rows strike rather than vanish and can be restored; steps and targets edit in place. Save as version is explicit and asks for the reason, offering the recorded batch as the citation.
- **Printing:** prints the saved version. With unsaved edits, the maker chooses to save a version first or print the last saved one, and the page says which it printed.
- **Feedback:** figures recompute live and state their deviation in words; nothing moves on selection or hover; no entrance motion.
- **Responsiveness:** desktop leads at 1280 and wider as a spread; narrower widths stack table, formulation note, method, margin in one column; the phone gets the same page, read-only in feel, table first.
- **Keyboard:** the table is navigable row by row; every control has a visible label and focus; the short code is selectable text.

## 7. Constraints and open decisions

**Binding**
- Platform web; React + Vite provisional (GSD PROJECT.md).
- Grams everywhere; a unit on every printed value.
- Printing captures a saved version and creates no batch.
- The batch-log page has fixed geometry; nothing above it may move it.
- Derived advice is structural only.
- Text contrast meets AA (UX1-01); the product-level standard is undecided.

**Dependencies this brief does not resolve**
- The batch record's own brief (Phase 2) owns what the batch-log page's result and dimension lines say.
- The ingredient seed dataset (Phase 1 planning) decides which coefficients the figures rest on and which are flagged estimated.

**Open, to decide during build, not to be invented silently**
- Whether authored notes copy into a child version by default or by explicit choice (the binder's Mexican Chocolate v3 shows the failure mode of silent copying) — decided in `route-recipe-version.md` (2026-09-07): they copy with a persistent "from …" marker until edited on the child.
- Exact type faces, within the direction's rules.
- Whether the version strip shows the batch count per version.

**Must not be invented by a builder**
- Labels for stars, Optimize, Scale, Template (D12).
- A rating control.
- Any sensory claim in derived advice.
- A colour that carries state.

## Direction contract

Written at build start, before any visual token exists in code, per Impeccable's new-work flow. Converts § 3's confirmed direction into the values a builder implements. Ink and pen blue reuse the pinned Cupping Form roles § 3 names as visual authority (D13 incumbent evidence); everything else below is new to this surface.

**1. Type.** Text face (headnote, method prose — true italics for emphasis and asides): `Georgia, 'Iowan Old Style', 'Times New Roman', serif`. Grotesk (ingredient table, every figure — tabular numerals on): `-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif`, with `font-variant-numeric: tabular-nums` applied wherever it renders a table cell or a figure value. Both are system stacks; no font file is fetched. Type scale (grotesk unless noted):
| Role | Size | Face |
|---|---|---|
| Running head | 0.75rem, uppercase, tracked | grotesk |
| Recipe name | 2rem | text face |
| Version line | 1.125rem | text face |
| Headnote prose | 1rem | text face |
| Table body | 0.9375rem, tabular | grotesk |
| Figure value | 1.25rem, tabular, bold | grotesk |
| Deviation words | 0.8125rem | grotesk |
| Small print | 0.75rem | grotesk |

**2. Colour, four roles only.** Ground `#F7F7F4` (cool text-paper). Ink `#141414` (print black). Pen blue `#1F3D7A` (everything recorded; unused on screen in this phase — Phase 2 is the first to paint with it). Bookcloth `#33513B` (a muted bottle green, the book's identifying colour in running heads and section tabs; a third hue so it is never mistaken for the pen). No fifth colour is defined. The scheme is light only because the scene forces it: a kitchen table in the evening and a black-only laser printer. Colour never signals status, verdict, or uncertainty anywhere on this surface — a figure's standing against its band is stated in words, never in hue.

**3. Spacing scale.** `--gap-hair: 2px`, `--gap-xs: 6px`, `--gap-s: 12px`, `--gap-m: 20px`, `--gap-l: 32px`, `--gap-xl: 48px`. `--gap-l` separates the spread's regions (headnote from the table, the table from the method beneath it, the table column from the formulation note, the note from the margin); `--gap-xl` is the page's outer margin.

**4. Rule drawing.** Graduated rule baseline: 1.5px, ink. Graduations (the tick marks along the rule): 1px, ink. Band edges (the authored target band's two boundary lines): 1px, ink. The tick (the computed value's mark): 2.5px, ink. Hatch (fills an authored target band): 45°, 4px pitch, 1.2px stroke, ink.

**5. Focus treatment.** Focusing a balance figure and its contributing ingredient rows changes only stroke weight (heavier) and adds an outline (1px, ink, offset 2px) to the focused elements. Nothing changes position and nothing changes colour; hover and selection never move an element, per the brief's carried raise.

**6. Plain-language block names.** Headnote. Ingredient table. Formulation note. Method. Margin. Each region wears its name as a visible running head in the block's own type scale role.

**7. What stays open after this contract.** Whether authored notes copy into a child version by default or by explicit choice — Phase 3 decides, weighing the binder's Mexican Chocolate v3 failure mode of silent copying. Whether the version strip shows the batch count per version — Phase 2 decides. The product-level text-contrast standard above the AA floor UX1-01 already tests — undecided at the product level (PRODUCT.md).
