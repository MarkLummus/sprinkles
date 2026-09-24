---
version: 1
slug: "route-print-recipe-sheet"
primary_target: "route:/print/recipe-sheet"
related_targets: ["route:/recipe","route:/recipe/version","route:/recipe/batch"]
---

# Surface brief — The bench sheet

**Mode:** Operate. **Status:** shaped 2026-09-16; confirmed by Mark 2026-09-16 (the blank log carries the whole battery split by moment and prints two pages front and back; the short code is derived from the version; printing moves to its own route because printing will later have modes). **Target:** `route:/print/recipe-sheet` — the printed bench sheet and the route that renders it. Related: `route:/recipe` (the surface that prints; its brief is `route-recipe.md`, whose § 5 "The sheet" paragraph this brief supersedes), `route:/recipe/version` (Phase 4 prints what that brief saves), and `route:/recipe/batch` (that brief owns what the batch-log page's fields *say*; this brief owns its geometry). This brief feeds GSD Phase 4 and satisfies its roadmap prerequisite.

Product truth: `PRODUCT.md` and `product-requirements/03-decision-register.md`. Requirement IDs: `.planning/REQUIREMENTS.md` (PRINT-01…05, UX1-01…03). Primary evidence: the five photographs of the 2 Aug 2026 sheet (`~/Downloads/IMG_2485–2489.HEIC`), the churn-log audit (`Ice Cream Log Pages/sprinkles-churn-log-binder-audit.md`), and the prior print prototype (`~/Documents/projects/old-sprinkles/src/` — `styles/print.css`, `ui/BatchLog.jsx`, `domain/sheet-codes.js`), reference only and stale in vocabulary and axis model.

## Vocabulary amendment — 2026-09-19

D17 and `product-requirements/05-domain-and-language.md` govern terminology over older wording below. **Recipe Sheet** and **Sheet** are synonymous, in reading, editing, and printing, including multiple printed pages. Recipe name and Recipe description belong to the enduring recipe; Sheet title and Sheet description belong to the saved version. Version name and Why identify and explain the revision. **Adapt** starts a distinct recipe from a specific version; **Next version** continues the same recipe; unsaved work is a Draft or Version draft. Recipe-level metadata and History are recipe context, outside the paper Sheet. This amendment records approved meaning; field separation and responsive layout implementation still require shaping and delivery planning. **Instructions** (Mark, 2026-09-24): the Sheet's steps region and its printed page are named Instructions; wording below that names either one method means Instructions.

## Assets and processes amendment — 2026-09-23

`route-recipe.md` § "03.5 revision" (Phase 03.5, confirmed by Mark 2026-09-23) and D18 (assets and processes, `product-requirements/03-decision-register.md`) govern over this brief where they differ. The Sheet has two forms. This brief's bench sheet is the **Notebook form** in print: the plan in black, blank as-made fields, and the blank batch and tasting log pages for the pen — a process printed as space for its record. The **Recipe Book form** prints no as-made and no log (Phase 4 D-22); it is designed now and built later. The printed log stays paper even though the on-screen record is App context. Routes: `/recipe/:id` and `/recipe/:id/batch/:batchId` become `/notebook/:recipeId/:versionId` and `/notebook/:recipeId/:versionId/batch/:batchId`, with the old paths redirecting; `/recipe-book/:recipeId` is reserved, not built; print sits at `…/print` under each, replacing `/recipe/:id/sheet`. The print route of the Notebook form is therefore `/notebook/:recipeId/:versionId/print`, superseding § 3's `/recipe/:id/sheet` and Phase 4 CONTEXT's default. The Sheet's printed header reads the **Sheet title**, not the Recipe name (the version owns it). Everything else in this brief stands.

## 1. Job and audience

Mark, at a desktop, with a saved version he intends to make. He prints, carries paper to the kitchen, and works from it at the machine — hands wet, scale beside him, app not present. Days pass. He returns to the app with the sheet, or a photo of it, and types in what happened.

The sheet's job is to be **the batch's first record** — not a reference copy of the screen, but the artifact that carries ink, whose ink is later transcribed. `PRODUCT.md`'s operating context is explicit: desktop formulates, paper works the kitchen, phone transcribes. The binder confirms the ritual: weigh with a mise-en-place tick per row, write over printed grams when reality differs, note process values sparsely, record a verdict about half the time (15 of 29 sheets), carry a "to fix" list forward by hand.

Success: he makes the batch without reaching for the app, and returns with a sheet whose every mark has a home in the app's record.

## 2. Outcome and proof

Primary task: print a saved version as a bench sheet, make from it, come back with it filled in. Secondary: reach a version from the code on a sheet in hand.

Success is PRINT-01…05 against real content — the olive oil working case: twelve rows (some split into portions), ten steps with typed targets, three carried-forward notes, two before-you-start notes, 800 g, two 16 oz jars, circulator bath, Whynter machine, 1 g kitchen scale plus 0.01 g precision scale.

The product-specific truth a generic recipe printout could not claim: **the sheet knows which version it is.** A short code ties the paper back to an exact formulation, so a record made in October attaches to the version it was actually made from, not to whatever that recipe has become since. This is the print-side expression of the product's central separation (D04) and of its promise that editing today never rewrites yesterday.

## 3. Selected direction

**Visual authority: the Cupping Form, unchanged.** This surface needs no new world and no world workshop — the world was designed for exactly this. Printed black, recorded ink blue, the two never mixing; colour identifies and form carries state; light only, forced by a kitchen table in the evening and a black-only laser printer; print-native throughout. For three phases the screen has been imitating the sheet. Here the sheet stops being a metaphor and becomes the thing itself, and the existing tokens, faces, rules, ticks and scales carry over without invention.

**Structural thesis: the blue layer prints as blank space.** Everything the system knows prints in black. Everywhere the maker will write, the sheet prints nothing but a rule, a box, or a scale — the exact geometry the app will later ask him to fill. Paper and screen are one form in two materials, and a real pen does on paper what pen blue does on screen. Nothing on the sheet is a second design of anything already designed.

**Sequence — the order of making, not the order of the screen:**

1. **Formula page.** The ingredient table in step order under its step-group heads, as the screen reads it. Per line: a mise-en-place tick box, the ingredient name, the portion's grams, its % of batch, and a blank as-made column ruled to be written over. A unit on every printed value (PRINT-01). The total row closes it above its rule. This is the weighing page, and the tick box is the binder's own ritual given a printed home.

2. **Instructions page.** The ten steps in page order: bold lead-in, prose instruction, typed target chips beside the prose (PRINT-02). "Before you start" heads the Instructions and is closed by a hairline rule, as on screen.

3. **Batch log — two pages, printed front and back of one sheet** (PRINT-03). The split is the app's own, not an imposed one: `BatchRow.jsx` already groups the battery into a churn section and a tasting section, and the sheet takes that seam.
   - **Side 1, "At the machine":** churn date; Time to draw temp. (min), Out of machine (°C), Churn duration (min) as ruled fields carrying their units; Exit consistency and Airiness as mark-one rows of their own option words; ruled lines for *At the machine* and *Ingredient notes*.
   - **Side 2, "When you taste it":** Tempering (min), Tasting temperature (°C), Melt test (g lost at 20 min) as ruled fields; Melt style as a mark-one row; the six axes — four core, two declared, under their own *Every recipe* and *This recipe only* heads — each a blank five-stop scale with its anchor words in italic; the four defects and the declared flaw as tick-and-word; ruled lines for *How did it turn out?* and *Next time*.

**Focal moment: the as-made column.** The printed gram sits in black; beside it, empty space the width of a written number. The sheet asks to be corrected, and that invitation is the product's whole thesis on paper — the plan is not the record, and what was actually done is worth its own column.

**Implementation consequence.** A route of its own, `/recipe/:id/sheet`, rendering from the saved version record. `router.jsx` already anticipates it ("Phase 2's batch route and Phase 4's print route are additions, not a retrofit"). Because the route reads the saved record and never the live page, printing unsaved edits becomes impossible by construction rather than guarded against — which retires the choose-then-print dialog `route-recipe.md` § 6 described. The route names the version and its code on screen, making "the page says which it printed" literal. Print CSS reflows this route's own tree to letter portrait; the batch log carries fixed geometry and its own page breaks. Sheet components reuse the recipe page's primitives wherever one exists, so the sheet cannot drift from the screen.

## 4. Scope and boundaries

**Fidelity:** production-ready. **Breadth:** the print route and the three-to-four-sheet document. **Interactivity:** print, and enter a code to reach a version.

**Touched elsewhere, minimally:** one Print control on the version row (closing `route-recipe.md` § 7's open item "Where Print sits on the version row"); one short-code entry on the recipe list beside the existing export and import controls, since that is where a maker arrives holding paper.

**Untouched:** the recipe page's reading and pen states, the batch record's own flow, the front-matter rows, the tasting battery on screen, the store's schema beyond what a derived code needs (which is nothing).

**Out, and named:** QR codes and the print-log "did you churn it?" nudge, both retired and not revived; a mode picker or toggle; publishing and sharing output; printing a batch record or a filled log; printing the show-changes state; scaling; UX1-02 draft persistence across a reload (in GSD Phase 4, but not this surface).

**Anti-goals:** no colour anywhere on the sheet; no pass/fail or score mark on a printed figure; no Balance rules, freezing curve, derived advisories, or anything else from column two; no strikes, removed rows, removed steps, or parent values — the sheet prints the clean reading (`route-recipe-version.md` § 6); no batch record created by printing (PRINT-05); no browser header or footer standing in for the sheet's own foot; no second design of a control that already exists on screen.

## 5. States and ranges

Twelve rows typical, one to about twenty-four plausible; a row carries one to three portions; ten steps typical, three to twenty plausible; two declared axes, zero to two; four defects plus zero or one declared flaw; targets on some steps and none on others; a method that runs to a second sheet.

**Material states:** a version never churned · a version already churned (the log still prints blank, because it is for the next batch) · a one-portion row · a row split across two steps · a step with no targets · a recipe with no declared axes (side 2's *This recipe only* group is absent, not an empty heading) · a method long enough to break across sheets · the route reached for a version with unsaved edits elsewhere (it prints the saved record and says so) · a code that matches no version · a code entered with or without its hyphen.

## 6. Interaction and layout

- **On screen.** The route states recipe, version line, saved date, and short code in one line, then renders the pages as they will print, then offers a Print control. Keyboard-operable with visible labels, visible focus and AA text contrast, like every other surface (UX1-01, UX1-03).
- **On paper.** Every page carries a foot: recipe · version line · short code · page *n* of *m*. Duplex sheets get separated in a binder, so the code is on both sides of the log, not the front alone.
- **The mise-en-place box** is the app's own drawn ink square, unfilled — the checkbox `DESIGN.md` already specifies, printed.
- **A blank scale** is the axis mark's five stops with none filled, anchors in italic beneath. Marking side 2 by hand and marking the app on return are then the same gesture on the same form.
- **A blank line** is a hairline ink baseline and nothing else — no label, no border — exactly as `route-recipe.md` § 3 already rules blank prose fields on screen.
- **A mark-one row** is the segmented control's option words, each preceded by its own tick box, since paper has no filled state.
- No motion, no hover, no interactive state in the sheet's own rendering; the world has no motion at all.

## 7. Constraints and open decisions

**Binding.** One component tree sharing the recipe page's primitives wherever one exists; every visual value read through a custom property in `app/src/styles/tokens.css`, with `@media print` blocks as top-level siblings and never nested; labels from `product-requirements/05-domain-and-language.md`, which retires the old prototype's *Come-up*, *Draw*, *Overrun* and *Meltdown* wholesale; notes and prose rendered as text, never markup.

**The short code.** Derived from the version id — the same version always prints the same code, reprints match, nothing is stored, and matching back is a lookup. Crockford base32 grouped `XXXX-XXXX` (from the prototype's `sheet-codes.js`) is a sound starting point **for the alphabet and the grouping only**; its per-print random nonce is deliberately not carried over. Accepted loss, stated plainly: two printings of one unchanged version are indistinguishable, and the app cannot tell Tuesday's sheet from Friday's. Accepted because the batch record is created when the batch is *recorded*, never when it is printed — settled product research, not an open question, and PRINT-05 already says so. A derived code also leaves D16 (storage) untouched, which an open decision deserves.

**Modes, recorded and not built.** Printing will later carry more than one mode: the bench sheet for recipe development, and a publishing or sharing output. Milestone 1 builds the bench sheet alone. This is the reason printing takes its own route rather than print CSS on the recipe page — the recipe page is already a complex surface and must not absorb a second job. The route must leave room for a mode without inventing one: no mode switcher, no toggle, and no abstraction built to serve a single case.

**A builder must not invent:** the code's alphabet, length or grouping; which fields appear on which side of the batch log; page-break positions within the batch log; any printed colour; any field on paper that the app has no home for on return.

**Superseding `route-recipe.md` § 5.** That paragraph says the formula page carries "the step column". The Step column was **retired** by the 2026-09-09 portions revision in § 3 of the same brief, which put rows into step-order groups instead. The sheet follows the screen: no step column, rows grouped under step heads, and a split row prints **one line per portion inside each step's group, each with its own tick box and its own as-made blank** — because the maker weighs each portion separately at the bench, and the sheet's `120 g + 263 g` is already what paper does. Confirmed by Mark 2026-09-16.

**Open, for GSD phase discussion and not for a builder:** the exact wording of the Print control on the version row; the exact wording of the code-entry field on the recipe list; whether that field accepts a code with or without its hyphen (both should work, but the prompt wording is a language decision); and whether the Instructions page's "Before you start" notes repeat on a second sheet when the method breaks.
