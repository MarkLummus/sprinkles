---
version: 1
slug: "route-recipe"
primary_target: "route:/recipe"
related_targets: ["route:/print/recipe-sheet"]
---

# Surface brief — Recipe and the bench sheet

**Mode:** Operate, both halves. **Status:** shaped 2026-09-05; confirmed by Mark 2026-09-05; revised 2026-09-07: the version-editing and comparison direction is superseded by `route-recipe-version.md` (confirmed by Mark 2026-09-07); revised 2026-09-08 after the whole-page critique (`.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md`): the imprint (a front-matter band beside the headnote that takes every control out of the spread, Mark's own direction in place of a column-two swap), the binder's controls, the date field, and the breakpoint reaffirmed; confirmed by Mark 2026-09-08 after two correction rounds (the imprint in place of the swap; the save pair repeated at the foot).; revised 2026-09-09 after sketch 003 (`.planning/sketches/003-front-matter-rows/`, variant B) and the whole-page critique (`.impeccable/critique/2026-09-09T11-54-37Z__app-src-ui-recipepage-jsx.md`): the imprint and the tray are both retired in favour of two front-matter rows across the page, the ingredient table reads in step order with portions, the pen's method opens read-only, and a blank prose line is ruled; confirmed by Mark 2026-09-09 (the ruled line carries no label); revised again 2026-09-09 to settle the one item that revision left open — the portion is the authored amount and the total derives, the portion count is fixed in milestone 1, and split-step prose stops carrying amounts; confirmed by Mark 2026-09-09; revised 2026-09-16 after the BatchRow critique (`.impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md`) and the `/impeccable shape` run that produced `route-print-recipe-sheet.md`: § 3 "The sheet" is superseded by that brief, which owns the printed surface from here — the step column is struck (§ 3's portions revision retired it) and the batch log prints two pages front and back on its own route; and § 7's open item "Where Print sits on the version row" is closed, Print sitting on the version row and leading to `/recipe/:id/sheet`, its label a language decision for the Phase 4 discussion.; revised 2026-09-17 by `/impeccable layout`: history controls became ruled reading structures and the version title became the only link; revised 2026-09-18 by `/impeccable clarify`: a version is identified one way wherever it is named — a derived ordinal in creation order, the authored name, then the state words — and History is the recipe-level outline while Batches remains the selected-version register (confirmed by Mark 2026-09-18). **Targets:** `route:/recipe` (review, version editing, comparison) and `route:/print/recipe-sheet` (the bench sheet). The batch-capture flow is a separate brief (GSD Phase 2). This brief feeds GSD Phases 1, 3, and 4. Revised 2026-09-23 for Phase 03.5 (`/impeccable shape`): the recipe record and the Sheet separate, the Sheet has a Notebook and a Recipe Book form, the on-screen batch record moves to App context, and Notebook routes replace `/recipe/:id` — see "03.5 revision" below; confirmed by Mark 2026-09-23.

Product truth: `PRODUCT.md` and `product-requirements/03-decision-register.md`. Requirement IDs: `.planning/REQUIREMENTS.md`.

## Vocabulary amendment — 2026-09-19

D17 and `product-requirements/05-domain-and-language.md` govern terminology over older wording below. **Recipe Sheet** and **Sheet** are synonymous, in reading, editing, and printing, including multiple printed pages. Recipe name and Recipe description belong to the enduring recipe; Sheet title and Sheet description belong to the saved version. Version name and Why identify and explain the revision. **Adapt** starts a distinct recipe from a specific version; **Next version** continues the same recipe; unsaved work is a Draft or Version draft. Recipe-level metadata and History are recipe context, outside the paper Sheet. This amendment records approved meaning; field separation and responsive layout implementation still require shaping and delivery planning.

## 03.5 revision — the recipe record and the Sheet separated (2026-09-23)

Shaped with Mark 2026-09-23 (`/impeccable shape`) for GSD Phase 03.5; confirmed by Mark 2026-09-23. This section governs over § 3's front-matter, tip, record-in-the-margin and batch-row bullets, § 6's hierarchy and topology bullets, and the Direction contract's region list wherever they place recipe-level or batch-record content on the Sheet. The Sheet's own grammar (step-order table, portions, the pen, tracked changes, graduated rules, binder controls) is unchanged.

**1. Job.** Mark, at the desk or on the iPad, develops a recipe version by version and rereads what a batch did (Operate). The on-screen Sheet becomes the printed page as nearly as the screen allows; the app layer around it carries everything else.

**2. The model.**
- **Resource and process** (Mark, 2026-09-23). The Sheet is a resource: the asset a maker keeps, reads, edits and prints, and it is paper. A batch and its tastings are a process: the record of one making attempt, App context on screen, printed blank on paper only so the pen can fill it. This distinction decides which side of the Context Boundary Rule any new element falls on.
- **Recipe record**, new in the store: `{ id, name, description }`. Renaming or redescribing it never forks a version and never rewrites a saved Sheet.
- **Sheet**, per version: Sheet title, Sheet description, ingredients by portion, Before you start, Instructions. Next version copies the parent's Sheet title and Sheet description.
- **Why the two names** (Mark, 2026-09-23). The Recipe name tells recipes apart in a list; the Sheet title is the name the recipe is served under. A maker may develop "Strawberry Gelato — everyday kitchen" with no special process (no immersion circulator), no specialty ingredients (gums, soy lecithin) and no specialty sweeteners (allulose), and another strawberry gelato that goes all the way with specialty equipment and ingredients. Each carries its own qualifier in its Recipe name so it can be picked from a list, and both print as "Strawberry Gelato". The Sheet title and Sheet description can also be tweaked version by version as the recipe is perfected. The printed sheet, and the Sheet on screen, show the Sheet title.
- **The Sheet has two forms.**
  - **Notebook form.** Printed: blank as-made fields and the blank batch and tasting log pages (Phase 4, `route-print-recipe-sheet.md`). On screen: the batch in view's as-made column and its Instructions changes — strikes, skips, edited step text — in pen blue against the black plan. Balance and Things to check belong to this form, on screen only.
  - **Recipe Book form.** No as-made, no log. Drawn on the canvas now; **not built** in 03.5.
- **Recipe context**, App context (D17 destination palette, Notebook red), outside the Sheet: Recipe name and description with rename; version identity and selection; History; provenance (From version, Why, From batch); Next version.
- **Batch and tasting log** for the batch in view, App context wherever it sits: the Batches (n) chooser, measured values, At the machine, How did it turn out?, tastings, Next time. The maker's own words stay in the hand (pen-blue Caveat, DESIGN.md).
- A version shows one batch in view, possibly none (`not yet churned`).
- **Instructions** (Mark, 2026-09-24). The Sheet's steps region is named Instructions: its heading, its accessible name, and its printed page. Older wording in this brief that names the region Method means Instructions. The rename is screen-only (Mark, 2026-09-24): code identifiers (`Method.jsx`, `version.method`, CSS classes) keep "method".
- **Carried forward notes are dropped** (Mark, 2026-09-24). The Sheet no longer carries a Carried forward block, and the folds drawn below desktop on the canvas lose their Carried forward fold. Before you start notes stay authored and inheritable; the inherited-note marker and its staleness reading (`route-recipe-version.md` § 3, "Inherited notes") keep their home on them. Proof-content counts elsewhere in the briefs that include three carried-forward notes describe the seed before this decision. **Phase consequence, 03.5 scope:** the code, seed and store lose `carriedForward`: the Carried forward block in `Authored.jsx`, its wiring and dirty check in `RecipePage.jsx`, the three notes in the `olive-oil.js` seed, the `transfer.js` validation, and their tests. `.impeccable/design.json`'s authored-notes sample follows the code. The three seeded notes' words are dropped, not moved (Mark, 2026-09-24). "Notes" leaves the Sheet's parts list: with Carried forward gone the Sheet has no Notes block.

**3. Routes (decision, Mark 2026-09-23).** The destination owns the form. Built: `/notebook/:recipeId/:versionId` and `/notebook/:recipeId/:versionId/batch/:batchId`; the old `/recipe/:id` and `/recipe/:id/batch/:batchId` redirect there. Reserved, not built: `/recipe-book/:recipeId` (the Recipe Book form of the selected version). Print sits at `…/print` under each (Notebook print is Phase 4; supersedes Phase 4 CONTEXT's `/recipe/:id/sheet` default). No form switcher.

**4. Layout, judged on the canvas.** Three component groups, placed independently per layout: *recipe and version* (recipe context), *the Sheet*, *batch and tasting log*. Multi-column layouts may put the log in the Sheet's space and the recipe and version fields in a sidebar or header band.
- **The ladder, desktop first, then one rung at a time.**

  | Rung | Drawn at | Columns |
  |---|---|---|
  | Desktop | 1600 | many |
  | iPad landscape | 1366 | 2 |
  | iPad portrait | 1024 | 1 |
  | Below iPad | 393 | 1 |

- **Desktop alternates.** A — sidebar: recipe and version left; Sheet and log share the main space. B — tabs: recipe and version in a header; tabs beneath. C — header band: recipe and version as App front matter; the Sheet with the log in a column beside it. Each drawn with no batch, with the 2 Aug batch in view, and with the pen open (Sheet fields beside rename), plus one reference board of the Recipe Book form on screen. Only the chosen layout is then drawn at 1366, 1024 and 393, on the existing Sprinkles canvas, and snapshotted into `.planning/sketches/` as the acceptance target.

**5. Scope.**
- **In:** the recipe record and the field split (`recipeName` and `headnote` leave the version; `sheetTitle`, `sheetDescription` arrive); rename; the Notebook routes and redirects; the chosen layout across the ladder; the batch record in App context; a realistic seed.
- **Seed.** Several recipes, two in active development: olive oil (as now) and Mexican Chocolate v1–v4, transcribed from Mark's binder sheets and the Ice Ed export (`~/Downloads/recipe-Mexican Chocolate v4.json`), with missing values left missing and the transcription reviewed by Mark. At least one single-version recipe. States covered: churned, not yet churned, not yet tasted. Reset over migration once no real records are confirmed.
- **Out:** building the Recipe Book form or route; print (Phase 4); Adapt; Recipe book selection; reordered and new steps in a batch (a later version-evolution phase).

**6. Open, not for a builder to invent.** Where the Batches (n) chooser sits (the canvas settles it). Settled: the desktop layout is C (Mark, 2026-09-24).

**7. Decided 2026-09-24 (Mark).**
- **Rename label:** the control beside the Recipe name reads "Rename".
- **Folds below desktop start closed on every visit.** Nothing remembers a fold being opened; no stored state.
- **Recipe Book form gets authored Yield and time fields**, as a printed recipe book carries Serves and times. They are Sheet fields on the version. Which time fields, and how they sit beside the derived Makes (row total) and step-target Age, Harden and Serve, is settled when the Recipe Book form is built; the form stays unbuilt in 03.5.
- **Open step buttons:** Done and Cancel. Done keeps the edit in the draft; Cancel restores the parent's step.

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
- **The front matter, two rows** (revised 2026-09-09 by Mark from sketch 003 variant B; history language revised 2026-09-18). A book's front matter carries its edition and its printings before the text begins, and this page does the same — but across the page, not beside the headnote. Two outer rows span both columns above the spread. The **version row** carries the recipe name, the version line and the headnote prose at the measure on the left, and on the right the version's own metadata (From version, Why, From batch) with its acts: Next version, Show changes, and the `History` disclosure beneath the row. The **batch row** carries the churn line and the maker's own words on the left, and the measured values as labelled cells at figure size on the right — Out of the machine, Air, Melt test, Time to temperature — with tasting marks as a second cell group and its acts: Record another, Add tasting, Correct, and the `Batches (n)` disclosure beneath the row. The two rows stay two because their acts differ: Next version and Record another act on the plan, Correct and Add tasting act on one churn. Putting them on one row is how the imprint got overloaded. A rule at baseline weight closes the front matter above Ingredients. The rows wear no running head (Mark, 2026-09-09): they are front matter, not regions of the recipe, and the version's name and the word `churned` identify them; bookcloth resumes at Ingredients. The **margin is retired as a region** — its content splits, the record upward into the batch row, Things to check and the carried-forward Notes downward under Balance in column two. Column two now holds Balance level with Ingredients, then Things to check, then Notes, and nothing sits above Balance.
- **The tip, and the lists.** The page holds the tip: the latest version and its latest batch. `History` opens the recipe's development outline beneath the version row; `Batches (n)` opens every attempt made from the version in view beneath the batch row. Neither is a second page or a tray. This follows the binder — 29 sheets, one line of work — and Mark's own account of how he works. Version and batch stay separate records (D04): the same plan churned twice is two batches of one version. A version with no attempts reads `not yet churned`; an attempt that exists without a tasting reads `not yet tasted`. Absence is stated by the guide's "Saying absence" rule.
- **The table in step order** (Mark, 2026-09-09; supersedes "the sheet's page order" above for the table). Mark weighs in step order and his sheet records a split ingredient as two portions, so step order is the table's order on screen and on the sheet, and the written order does not survive as a second view. The table groups by step with the step's lead-in as the group head; the Step column disappears. An **ingredient** is the formula's row — one total, one share of the batch, one coefficient snapshot. A **portion** is what is weighed for one step. A split ingredient appears once per step as a portion line, its own share in the column and `120 g of 370.4 g · 46.3% in all` beneath its name. As-made is recorded per portion and the total is derived. "Before you start" notes leave the headnote and head the Method, before step 1.
- **The portion is the authored amount** (Mark, 2026-09-09; completes "the table in step order" above, which named portions without saying where they live). A row's `portions` are what the maker authors — `[{ step: 2, grams: 120 }, { step: 3, grams: 250.4 }]` — and the row's total derives as their sum. An unsplit ingredient is a **one-portion row**: one field, exactly as an amount reads today, and no "in all" line beneath it, so one rule covers split and unsplit alike with no second case. The `step` / `splitStep` pair retires with the Step column that fed it. Reading, whole milk appears in step 2's group as `120 g` with `of 370.4 g · 46.3% in all` in small print beneath its name, and in step 3's group as `250.4 g` with `of 370.4 g · 53.7% in all`. In the pen each portion's grams is a field and the "in all" line is derived text, never a field; editing a portion strikes that portion's old grams in ink immediately before the blue field, and the derived total and both shares strike the same way in their own lines — the page's strike-and-beside grammar reused, with no new mark invented. Balance figures read the derived total, so a portion edit moves a rule exactly as a whole-row edit does; the coefficient snapshot stays per ingredient, never per portion. As-made is recorded per portion and its total derives the same way, which is what the sheet's `120 g + 263 g` already is on paper. **The portion count is fixed in milestone 1**: amounts edit, the split does not, matching the existing limit on adding and removing rows and keeping the pen's control count down. Splitting and unsplitting in the pen is milestone 2, recorded here rather than dropped.
- **Split-step prose carries no amounts** (Mark, 2026-09-09). Once a portion is an exact field, the method prose that currently reads "the remaining sucrose (~64 g)" and "the remaining milk (~250 g)" is a second copy of the same number and will drift from it. The instruction keeps its words and loses its split amounts — "Whisk the remaining sucrose, plus 22.4 g SMP, 12 g dextrose and 3.2 g salt, into the remaining milk and all 252.8 g of cream" — and the portion line is the one place the number lives. Amounts for ingredients that are *not* split stay in the prose as written; only the split ones move.
- **The pen's method reads** (Mark, 2026-09-09, answering the critique's question). By the binder's evidence a maker developing a version changes one or two amounts and occasionally a target, so the method opens read-only inside the pen with one `edit this step` text control per step; a step's own controls appear only after that press. Per-step and per-row controls are text controls, not the binder's bordered buttons — the button treatment was drawn for the front matter's openers and saves, and repeating it per step turns the recipe back into a form.
- **A blank line is ruled** (Mark, 2026-09-09, answering the critique's question). Where the maker is expected to write and has not yet — At the machine, How did it turn out?, Next time — the field carries a hairline ink baseline and nothing else — no label, no border — exactly as the printed batch-log page rules its lines; the rule goes once there is text. The screen answers the question the way the paper already answers it, and adds no chrome.
- **The record in the margin.** When the latest version has a batch, an as-made column appears beside grams in pen blue and the batch's dated result reads as a marginal note in the same blue. Plan stays black.
- **Versions.** Version 2 reads clean. Changes read as tracked changes: the parent's value struck in ink beside the current one, always visible while the pen is open and laid back on the page by one version-level "show changes" control after save; the translucent sheet is retired (Mark, 2026-09-07). Every version stays reachable in one strip under the headnote. The full direction is in `route-recipe-version.md`.
- **Focal moment.** The spread with the ingredient table and its formulation note: how the recipe reads and how far it sits from target, on one page.
- **Signature interaction, the pen.** Editing an amount turns it blue until it is saved as a version; saving is a ceremony that returns the page to black. Focusing any balance figure highlights the rows that carry it, so an assumption is one hover from the number it moves.
- **Raises carried from the round.** Overlay comparison (Exposure Record); figures trace to contributors (Force Diagram); every superseded version reachable in one strip (Cutting Bench); generous void, one heavy element per view (Console Fog); state changes weight and outline, never position (Telop Captions); every block wears its plain-language name (Quote Grammar).
- **The sheet.** The spread reflowed to letter portrait: formula page with the table, a mise-en-place box per row, ~~the step column,~~ and a blank as-made column; method page with the targets beside the prose; a blank batch-log page last with fixed geometry; a human-readable short code in the header of every page. The blue layer prints as blank space for a real pen. Balance rules and the freezing curve do not print. **Superseded 2026-09-16 by `route-print-recipe-sheet.md`**, which owns this surface from here: the step column is struck because § 3's portions revision (2026-09-09) retired it, so the sheet groups rows under step heads as the screen does and a split row prints one line per portion, each with its own tick box and as-made blank; the batch log is two pages printed front and back, not one; and printing moves to its own route rather than print CSS on this page.
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
| Portions per ingredient | 1–3, fixed per version in milestone 1; the working case splits whole milk and sucrose in two |
| Batches per version | 0–3 |
| Versions in an opened History outline | 1–6 in milestone 1 |
| Method steps | 3–10; the working case has 10 |
| Versions per recipe | 1–6 in milestone 1 |
| Batch mass | 800 g, fixed in milestone 1 |
| Balance figures | 6, always |
| Derived advisories | 0–6 |
| Sheet pages | 3 |
| Diff rows on the overlay | 0–12 |

**Material states:** no batch yet · latest version has a batch · newer version in progress with unsaved edits · saved version · comparison overlay open · a figure outside its band · a figure resting on estimated or unreviewed data · a row removed (struck, restorable) · a step with no targets · a version not yet churned · an attempt not yet tasted · History open under the version row · Batches open under the batch row · a step opened for editing inside the pen · a prose line still blank · print preview of a saved version · attempt to print with unsaved edits.

## 6. Interaction and layout

- **Hierarchy:** the version row; the batch row; the rule that closes the front matter; then the spread — column one the recipe (ingredient table, then method), column two what the sheet does not print (Balance level with Ingredients, then Things to check, then Notes). Reading order and tab order run version row, batch row, table, method, Balance, Things to check, Notes, and, while a pen is open, the repeated save and cancel pair at the foot of the page; the row's own ceremony comes first in that order and the foot's pair last, so Save is one Tab from the last field and one click from the top. A ceremony opens beneath the row whose act it belongs to and takes that row's metadata cell in place, so the ink it puts on the spread — the struck 40 beside the blue 48, the fat rule's strike — is on the same screen as the reason being typed.
- **Controls, the binder** (revised 2026-09-08; `DESIGN.md` § Buttons said no treatment existed and the critique found the browser's own chrome painting a fifth colour on every button, checkbox, focus ring and date field). Every control is drawn in ink at hairline weight with no fill, no radius and no icon, its label in the grotesk. A disabled control keeps its label and changes only its stroke, from solid to dashed, with its reason stated in words beside it, never dimmed to grey. A pressed or current state (the show-changes toggle, the current version in the strip, the open batch in its list, a marked row) is weight plus an outline at graduation weight; keyboard focus is an outline at baseline weight, offset the same, on every focusable element — heavier than state, so a focused pressed control reads as both, in place, with no colour. A checkbox is drawn as the marks control's stops already are: an ink square, filled ink when checked. A date field stays the browser's own date input for its validation and keyboard entry, with its calendar icon hidden; the browser's segment highlight while a part is selected is a named exception to the four-colour system (Mark, 2026-09-08). A prose field grows with its text and carries no resize grip. Adjacent controls are separated by the small gap, never by a space character. Every link on the page, the batch list included, is ink. (Added 2026-09-09.) The binder's bordered button is for the front matter's openers, saves and cancels only. Every per-step and per-row control — `edit this step`, `add purpose`, `add aside`, `change`, `remove`, `done differently` — is a text control: no border, no radius, a hairline underline, small print in the grotesk, sized to its words and never to its column, and absent from a step until the maker asks for it. A field inside a target chip is sized in `ch` to what it holds and never inherits the column's width. A prose field the maker has not yet written in carries a hairline ink baseline and no label, per § 3.
- **Topology:** one page per recipe, no tabs and no mode toggle; `History` and `Batches (n)` open in place beneath their own rows; the overlay for comparison; the browser's print for the sheet. Ingredient management and import are pages of their own, in the same material — not spreads, not trays.
- **History and Batches have different scopes** (revised 2026-09-18; `/impeccable clarify`). `History` is the recipe-level development outline and has no count: versions are its primary nodes and nested batches are their evidence, so a version-only count would name less than the outline holds. `Batches (n)` is the selected version's attempt register, and its count names every revealed batch, including the batch in view. The authoritative outline and its row grammar live in `route-recipe-version.md` § "History is the development outline". `In view` and `Latest` remain explicit words, never colour or weight alone. `Next version` and `Record another` are acts, not history.

- **One version identity, wherever a version is named** (Mark, 2026-09-18; `/impeccable clarify`). A version is identified the same way on its own row and in the history register: a **derived ordinal**, the **authored name**, then the state words. `Version 3 · 50 g oil · 800 g · Latest` on the row in view; `Version 3 · 50 g oil · 800 g · In view · Latest` in the register. Written, Why and From batch stay exactly where they are, as provenance beneath that identity. One pattern, two sites, so a maker never has to learn that the page names the same record two ways.

  **The ordinal is derived, and it is creation order, flat** (Mark, 2026-09-18). Version 1 is the recipe's oldest version; the newest wears the highest number. It counts printings of the book, not depth in the lineage — so a version and its sibling take consecutive numbers, and `Version 3` does not claim to descend from `Version 2`. The lineage answers that question and keeps answering it, one line below, in the provenance the ordinal sits above. The alternative considered was depth in the parent chain, which is truer to the tree but collides — two children of one parent both become `Version 2` — and a number that names two records cannot sit in an identity line.

  The ordinal reads off **the array the register already orders**, reversed: `sortedVersions` descending, so position `length - index`. That is `createdAt`'s order and no second key — deliberately the same discipline `Latest` took on 2026-09-17, where the marker is `ordered[0]` positionally so the marker and the order cannot disagree. `createdAt` is the only orderable key a version carries: the authored name is free text by D-01/D-04, and Save over never retakes the date, so a correction does not renumber the book. Appending a version only ever adds the highest number. A version with no `createdAt` sorts where `sortedVersions` already puts it and takes the lowest ordinals; it is not given a special word.

  **The identity line is the version row's heading, and the bare `Version` head retires.** A heading reading `Version` above a line reading `Version 3` says the word twice, which is what retired the `Later` lineage label in the bullet above; and § 3 has said since 2026-09-09 that the front-matter rows wear no running head, because "the version's name and the word `churned` identify them". The shipped `<h2>Version</h2>` was drawn against sketch 003 before that rule; the identity line replaces it as the row's own `h2`, in the text face at the version-line size with the state words in small print beside it. The heading outline keeps an entry for the row and it now names *which* version, not merely that a version is there.

  **The authored name leaves the headnote.** It cannot appear in both places: printing it under the recipe name and again in the row's identity is the same stutter, on one screen. The headnote keeps the recipe name and the authored prose. The landing focus that lands on a freshly forked child (D-27) moves with the name to the identity line, and its accessible name — already `Version {authored name}`, spoken but never shown — becomes the visible line, with the ordinal added. What a screen reader has been getting all along is what the page now prints.

  **The batch panel is not touched.** Batches have no ordinal and none is invented for them; a churn date already identifies a batch exactly.

  **The batch panel is the same object with one column used.** "Batches of this version" keeps its name, its chronological newest-first order and its `In view` marker; only its geometry changes, from a wrapping flex row where two batches sit side by side to the register's stacked rows. Its rows carry the churn date as the identity and its measured meta as the provenance line; the right column has nothing to say for a batch and stays empty. One row grammar serves both panels, so the two lists can no longer drift apart.

- **Editing:** amounts edit inline and turn blue while dirty; a split ingredient is edited by its portions and its total is derived, each portion a field and the "in all" line derived text (§ 3), with the portion count fixed in milestone 1; rows strike rather than vanish and can be restored; steps and targets edit in place once the step is opened. Save as version is explicit and asks for the reason, offering the recorded batch as the citation. An unchurned plan can be corrected without forking (Save over).
- **Printing:** prints the saved version. With unsaved edits, the maker chooses to save a version first or print the last saved one, and the page says which it printed.
- **Feedback:** figures recompute live and state their deviation in words; nothing moves on selection or hover; no entrance motion.
- **Responsiveness:** desktop leads at 1280 and wider as a spread; narrower widths stack table, formulation note, method, margin in one column; the phone gets the same page, read-only in feel, table first. (Reaffirmed 2026-09-08: no breakpoint has been built through Phase 3, the grid holds at every width and ingredient names wrap in the pen below about 1146px; the stack below 1280 is built in Phase 4 with UX1-01.) Revised 2026-09-09: the page stacks below 1100 with the front matter first, in the order version row, batch row, table, Balance, method, Things to check, Notes; the batch row's cell grid reflows rather than scrolls. Phase 4 owns the breakpoint.
- **Keyboard:** the table is navigable row by row; every control has a visible label and focus; the short code is selectable text. Escape closes a pen whose draft holds no ink and returns focus to the control that opened it; once anything is typed, Escape does nothing and Cancel is the one exit, so a stray key can never discard a sheet of transcription (Mark, 2026-09-08). Closing any pen, by save or by cancel, returns focus to the control that opened it. Region names are headings, so the outline reads Headnote, Version strip, Ingredient table, Formulation note, Method, Margin in the page's order.

## 7. Constraints and open decisions

**Binding**
- Platform web; React + Vite provisional (GSD PROJECT.md).
- Grams everywhere; a unit on every printed value.
- Printing captures a saved version and creates no batch.
- The batch-log page has fixed geometry; nothing above it may move it.
- Derived advice is structural only.
- Text contrast meets AA (UX1-01); the product-level standard is undecided.

**Follow-ups this revision creates (2026-09-08)**
- After the binder's controls land in code, re-run the documenter so `DESIGN.md` § Buttons, § Inputs and § Focus record what was built and the state-versus-focus outline weights.
- The pen's own revisions are in `route-recipe-version.md` (same date); the batch pen's in `route-recipe-batch.md` (same date).

**Dependencies this brief does not resolve**
- The batch record's own brief (Phase 2) owns what the batch-log page's result and dimension lines say.
- The ingredient seed dataset (Phase 1 planning) decides which coefficients the figures rest on and which are flagged estimated.

**Follow-ups this revision creates (2026-09-09)**
- After the rows and the text controls land in code, re-run the documenter: `DESIGN.md` § Layout still describes a headnote spanning a two-column grid with a margin region, § Components still names the version strip, and § Buttons has no text-control treatment.
- `tokens.css` still says pen blue is "unused on screen this phase"; it is not.
- **Portions need a lift, and the lift has a known blind spot.** Replacing a row's `step` / `splitStep` with `portions` changes a stored shape, so `liftVersionRecord` must map an old row to a one- or two-portion row (`splitStep == null` → one portion at `row.grams`; otherwise two, the first from the authored portion amount and the second the remainder) and `VERSION_SCHEMA_VERSION` and `DB_VERSION` must move in lockstep. The 2026-09-09 critique found `declaredAxes` shipped a string-to-object change with no lift entry and no schema bump, which renders two tasting axes as `undefined`; that is the same mistake this change is positioned to repeat. Lift `batch.snapshot` rows too — a batch's as-made is recorded per portion.
- The seed's split amounts must be authored as exact portions. Today they exist only as approximations inside the method prose (`~64 g`, `~250 g`) while Mark's sheet records `120 g + 263 g`; the phase that builds portions decides the authored plan figures with Mark, and does not infer them from the prose.

**Open, to decide during build, not to be invented silently**
- Whether authored notes copy into a child version by default or by explicit choice (the binder's Mexican Chocolate v3 shows the failure mode of silent copying) — decided in `route-recipe-version.md` (2026-09-07): they copy with a persistent "from …" marker until edited on the child.
- Exact type faces, within the direction's rules.
- ~~How a split ingredient is edited inside the pen~~ — settled 2026-09-09, see § 3 "The portion is the authored amount" and § 6 "Editing". Portions are the authored truth, the total derives, the portion count is fixed in milestone 1, and split-step prose stops carrying amounts.
- What an opened History outline does past four version nodes.
- ~~Where Print sits on the version row (Phase 4)~~ — settled 2026-09-16, see `route-print-recipe-sheet.md` § 4. Print sits on the version row and leads to `/recipe/:id/sheet`; its exact label is a language decision for the Phase 4 discussion, not a builder's.
- Whether pen blue is the right voice for a third kind of value — `unknown`, `unmarked`, a figure the system could not compute — which is neither printed plan nor the maker's own ink. Open since 2026-09-08.
- ~~Whether the version strip shows the batch count per version~~ — retired with the strip: History carries the recipe development outline and the batch row carries Batches (n).

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

**6. Plain-language block names.** Headnote. Ingredient table. Formulation note. Method. Margin. Each region wears its name as a visible running head in the block's own type scale role. (2026-09-08: the imprint joins them as the sixth region, beside the headnote; its label is settled in GSD discussion. The version strip, formerly its own full-width row, is part of the imprint.)

**8. Controls** (added 2026-09-08 from § 6 "Controls, the binder"; the values a builder reads, every one through a token). Button: border `--rule-ink-field` (1px) solid ink, no fill, no radius, label in the grotesk at `--size-table-body`, padding `--gap-hair` by `--gap-xs`; disabled: the same border dashed, label and colour unchanged. State outline (pressed, current, open, marked): `--rule-graduation` (1px) solid ink, offset `--focus-outline-offset` (2px), plus weight 700. Focus outline, `:focus-visible` on every focusable element: `--rule-baseline` (1.5px) solid ink, offset 2px — one new token, `--focus-outline-width`, moves from 1px to read `--rule-baseline`. Checkbox: `appearance: none`, a `--size-mark-stop` square with a `--rule-graduation` ink border, ink fill when checked, the marks control's own drawing. Date input: `type="date"`, calendar indicator hidden; segment highlight left to the browser (named exception). Prose fields: `field-sizing: content` where supported with a rows fallback, `resize: none`. Gap between adjacent controls: `--gap-s`.

**7. What stays open after this contract.** Whether authored notes copy into a child version by default or by explicit choice — Phase 3 decides, weighing the binder's Mexican Chocolate v3 failure mode of silent copying. Whether the version strip shows the batch count per version — Phase 2 decides. The product-level text-contrast standard above the AA floor UX1-01 already tests — undecided at the product level (PRODUCT.md).

## Labels (revised 2026-09-09)

Every label this brief names is superseded where `product-requirements/05-domain-and-language.md` § "Interface labels settled on the recipe page" says otherwise: Version line → Version; Reason → Why; Cites → From batch; Parent → From version; Develop → Next version; Amend → Correct; Come-up → Time to temperature; Draw → Out of the machine; Overrun → Air; Draw notes → At the machine; Words → How did it turn out?; Meltdown loss → Melt test; the rule heads read Freezing · PAC, Sweetness · POD, Fat, Milk solids · MSNF, Sugar, Solids; the Data column is Source; Advisories are Things to check; "headnote" is a name in this document only. Decided by Mark after the r/icecreamery vocabulary audit was reviewed against the page. The structural direction (imprint, tray, front matter) is under revision in `.planning/sketches/003-front-matter-rows/`; this section changes words only.
