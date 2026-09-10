# Roadmap: Sprinkles

## Overview

Milestone 1 delivers one outcome (D14): Mark can develop and prepare the next version of the olive oil recipe inside Sprinkles. The roadmap follows that working case in the order the maker lives it — read the churned recipe and its figures, record what actually happened in the 2 Aug batch, develop version 2 against that evidence, then take a bench sheet to the kitchen. Each phase is a vertical slice through seed data, domain math, storage seam, and screen; none is a technical layer. Storage stays a provisional local store behind a repository seam (D16 open), the ingredient seed dataset is chosen during phase planning, and the React + Vite + JSX stack is provisional until Phase 1 ships on real code.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Read the churned recipe** - The churned olive oil recipe and its balance figures are legible in the app instead of on paper (completed 2026-09-05)
- [x] **Phase 2: Record the first batch** - The 2 Aug batch enters Sprinkles as what actually happened, snapshotted against the version it used (completed 2026-09-06)
- [x] **Phase 3: Develop the next version** - Version 2 is created, adjusted, and compared against the churned version without disturbing it (completed 2026-09-08)
- [x] **Phase 03.1: The imprint and the binder** (INSERTED) - The recipe page gains its front-matter band and every control leaves the printed spread; the pen reads as the page; the binder replaces browser chrome (completed 2026-09-09)
- [x] **Phase 03.2: The portion and the reset** (INSERTED) - Portions become the authored amount and the total derives; `step`/`splitStep` retire; the store resets to the new shape and the seed is rewritten, rather than migrating (completed 2026-09-10)
- [ ] **Phase 03.3: The front-matter rows and the page in step order** (INSERTED) - The imprint and the tray retire into two front-matter rows; the table reads in step order; the pen's method opens read-only
- [ ] **Phase 4: Prepare the next version for making** - The new version prints as a bench sheet, matches back to its code, and the whole loop is usable and recoverable

## Phase Details

### Phase 1: Read the churned recipe

**Goal**: Maker can open the churned olive oil recipe in Sprinkles and read it whole — twelve ingredient rows, method, target bands, authored notes — with its balance figures and the basis they rest on
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: REC1-01, FORM1-01, FORM1-02
**Success Criteria** (what must be TRUE):

  1. Maker opens the churned olive oil recipe (50 g oil, 800 g) from the seeded transcription and sees all twelve ingredient rows with grams, % of batch, and step allocation, alongside its method, its target bands, and its authored notes.
  2. For that recipe the maker sees PAC, POD, total fat with milkfat and added fat separately, MSNF, sugar solids, and total solids per 100 g, each shown against its target band with the calculation basis stated.
  3. A figure resting on estimated or unreviewed ingredient data is flagged where the figure is shown, not only in a separate note.
  4. The figures on screen agree with the churned bench sheet's own figures for the same twelve rows, so the maker can work from the app instead of the printout.

**Plans**: 4/4 plans executed

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Walking skeleton: the churned recipe opens from IndexedDB through the repository seam and its twelve-row formula reads, with the printed-sheet fixture green

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — The Impeccable direction contract, the token layer, and the sheet's method and authored notes on the spread

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Six balance figures against their authored bands, deviation in words, with the calculation basis stated

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-04-PLAN.md — Estimated data flagged at the row and at the figure, contributor tracing, validated store export/import, and the landed structure recorded

**UI hint**: yes
**Prerequisite**: Impeccable brief approved for the recipe review surface (the first surface to shape; may be shaped together with the bench sheet)
**Phase notes**: Establishes the app shell, the framework-free balance module, the seeded recipe content, and the provisional local store behind a repository seam. Ratifies the provisional React + Vite + JSX stack on real code. The ingredient seed dataset is chosen in this phase's planning, after the recipe data model is designed; whichever is chosen, coefficients must be snapshottable (D04, D09).

### Phase 2: Record the first batch

**Goal**: Maker can record the 2 Aug batch against the churned version — what was actually done, what was measured, and how it turned out in their own words — and reopen it later unchanged
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: BATCH1-01, BATCH1-02, BATCH2-01, BATCH2-02, OBS1-01
**Success Criteria** (what must be TRUE):

  1. Maker records a batch against the churned version with its churn date, an as-made amount per row where it differed from the plan, and changed or skipped steps, all kept visibly separate from the recipe's planned values.
  2. Maker records come-up time, draw temperature, overrun, and meltdown; a field left blank stays visibly unknown and is never filled in from the recipe.
  3. Maker records how the batch turned out in their own words, optionally adding structured dimensions and a next-time note, and can save with nothing but the words.
  4. Maker reopens the batch and sees it together with the recipe version it used, its measured values, and its result.
  5. The batch holds the recipe rows and ingredient coefficients it was computed with; later edits to the recipe or to ingredient data do not change what the batch shows.

**Plans**: 5/5 plans executed (02-04 and 02-05 close UAT gaps)

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Tracer: the as-made column written, saved as a batch, and reopened by URL, with the snapshot proven not to move

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — The pen on the method and in the margin: per-step strike and changed line, the churn section's measured values with unknown in words, and the store file carrying batches

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — Tastings with words and marks, amendment, the margin's batch list, and the 2 Aug record seeded

**Gap closure wave 1** *(from 02-UAT.md; runs after Wave 3)*

- [x] 02-04-PLAN.md — The way in and the way out of the pen layer: record another batch when one exists, cancel a recording or amendment without writing (G-02-1, G-02-4)

**Gap closure wave 2** *(blocked on gap closure wave 1)*

- [x] 02-05-PLAN.md — Marks that can be read and taken back: the Skipped label clear of the strike, and a per-axis clear on a tasting mark (G-02-3, G-02-6)

**UI hint**: yes
**Prerequisite**: Impeccable brief approved for the batch record surface (BRIEF-02 seed is unapproved input, not authority)
**Phase notes**: Criterion 5 is the known data hazard from PROJECT.md — coefficient drift silently corrupted historical batches before. No automated diagnosis: Mark interprets the notes (D14).

### Phase 3: Develop the next version

**Goal**: Maker can create version 2 from the churned version, adjust it, and see exactly what changed and what it did to the balance — with the churned version and its recorded batch untouched
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: REC1-02, REC1-03, REC1-04, REC1-05, FORM1-03, FORM2-01, FORM2-02
**Success Criteria** (what must be TRUE):

  1. Maker creates a new version from the churned version; the new version records its parent, and the churned version and its recorded batch are unchanged afterwards.
  2. Maker edits the new version's ingredient amounts, removes or restores any of its twelve rows, and edits method steps and their targets.
  3. Maker records why the version changed as free text citing the batch that motivated it, and the saved version reopens with the same values after the app is reloaded.
  4. Maker sees the new version beside the churned one: per-row change in grams and in % of batch, and the change in each balance figure.
  5. Structural advisories show the basis they were computed from — sub-scale amounts with a master-blend multiple, ultra-pasteurised mass, gum hydration temperature versus the pasteurisation hold, estimated-data exposure — and a version outside a target band still saves; no figure predicts a sensory outcome or is labeled as guaranteeing success.

**Plans**: 12/12 plans executed (10/12 executed; 03-06 to 03-12 close UAT gaps)

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Tracer: the pen opens on the churned version, one changed gram saves as a child version at its own URL, and the store moves under it (database version 3, the shared lift, the store file, the seed's uses lists)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02-PLAN.md — The pen in full: the comparison and the uses cross-flags as domain modules, then every row's amount, allocation and presence and every step's words, targets, uses and presence, with the inherited-note marker

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03-03-PLAN.md — The ceremony in the headnote (version line, reason, citation, the two saves), the lineage line, the version strip, one row per recipe on the list, and the running head as the link home

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03-04-PLAN.md — Show changes: the addressable state, the live parent read, and the struck-beside grammar in the table, the rules with their hollow ticks, the method and the notes

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 03-05-PLAN.md — The four derived structural advisories with their basis lines, in the margin's block between the batch record and the authored notes

**Gap closure wave 1** *(from 03-UAT.md; runs after Wave 5)*

- [x] 03-06-PLAN.md — The one pen: one derivation of whether a pen is open, every opener disabled against it with its reason in words, and a route-keyed page so the pen cannot follow the maker to another version (G-03-9)
- [x] 03-09-PLAN.md — A step strikes what changed, marks removal without printing its own sentence twice, and says in words which step still covers its rows (G-03-3 S1, S2)

**Gap closure wave 2** *(blocked on gap closure wave 1)*

- [x] 03-07-PLAN.md — The version strip, the batch list and the lineage links state why they will not move while ink is wet, and both dirty checks tell the truth (G-03-9)
- [x] 03-08-PLAN.md — Columns sized by which column they are, a step selector that fits its cell, and an As made column only where there is an as-made layer (G-03-1)

**Gap closure wave 3** *(blocked on gap closure wave 2)*

- [x] 03-10-PLAN.md — The derived step number: the method renumbers itself, a struck step keeps the number it had, and a flagged row's selector shows its own allocation (G-03-6, G-03-3 S3)

**Gap closure wave 4** *(from the 03-UAT re-verification; blocked on gap closure wave 3)*

- [x] 03-11-PLAN.md — Honest column widths: border-box cells, a tighter cell padding, tokens and rules for Data and Remove, the name column as the single unsized one, and a test that computes the budget (G-03-11)

**Gap closure wave 5** *(blocked on gap closure wave 4)*

- [x] 03-12-PLAN.md — A removed step's number: empty in the pen, struck in show-changes, absent from the selector and the orphan flag, with the union of margin numbers asserted duplicate-free (G-03-14)

**UI hint**: yes
**Prerequisite**: Impeccable brief approved for the version editing and comparison surface
**Phase notes**: Balance is an assessment under assumptions, never a gate (D06). Batch size stays 800 g and ingredient handling stays within the recipe's existing twelve rows; scaling and library editing are later milestones.

### Phase 03.1: The imprint and the binder (INSERTED)

**Goal:** The recipe page gains its front-matter band and every control leaves the printed spread; the plan's pen reads as the page; the binder's control treatment replaces browser chrome; the pen's rules strike the parent figure; the table's columns hold in every state.
**Depends on:** Phase 3
**Requirements**: None new — builds the 2026-09-08 Impeccable revisions of the three surface briefs (`route-recipe.md` § 3 "The imprint" and § 6 "Controls, the binder"; `route-recipe-version.md` § 3 "The pen keeps the page", § 6 column arithmetic, and the three named build gaps; `route-recipe-batch.md` § 6 revision), confirmed by Mark 2026-09-08
**UI hint**: yes
**Prerequisite**: The three revised briefs are confirmed (2026-09-08); the whole-page critique snapshot `.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md` is the re-critique baseline
**Phase notes**: Inserted between Phase 3 and Phase 4 per the 260908-eil decision. The imprint's running-head label ("Imprint" or "Versions and batches") is settled in phase discussion. The third-voice colour question (system words like "unknown") stays open; the built colour stands. The sub-1280 stack remains Phase 4's (UX1-01).
**Plans:** 5/5 plans complete

Plans:
**Wave 1**

- [x] 03.1-01-PLAN.md — Tracer: the front-matter band end to end — Develop opens the plan's pen in a new Versions region beside the recipe block, the pair repeats at the foot, and the running heads lose their book vocabulary

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03.1-02-PLAN.md — Versions holds the version list, the labelled lineage, the batch list and all four ceremonies; the margin keeps the record's content and no control; focus returns to the opener and Escape closes only an untouched pen

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03.1-03-PLAN.md — The binder: the control treatment as global element rules, the focus-versus-state outline split, the drawn chevron, square, spinners and calendar icon, and the stylesheet's own contract suite

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03.1-04-PLAN.md — The pen keeps the page: prose edits as the printed paragraph, purpose and aside on demand, the uses line behind one control, the batch pen's per-step line on demand, and the step in every accessible name

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 03.1-05-PLAN.md — The three build gaps and the column arithmetic: the rules strike the parent figure and leave the tab path, a non-numeric grams field blocks the save, the total row prints its unit once, and both Two-Ink leaks read in ink

### Phase 03.2: The portion and the reset (INSERTED)

**Goal:** A row's portions become what the maker authors and its total derives as their sum; `step`/`splitStep` retire; and the store is reset to the new shape rather than migrated to it — the seed is rewritten, a returning profile reseeds clean, and the churned version and its 2 Aug batch reopen with every figure unmoved.
**Depends on:** Phase 03.1
**Requirements**: None new — builds `route-recipe.md` § 3 "The portion is the authored amount" and "Split-step prose carries no amounts", both confirmed by Mark 2026-09-09
**UI hint**: no — the existing table renders from the new shape; the arrangement is Phase 03.3's
**Prerequisite**: Settled with Mark 2026-09-09 — the seed's split amounts are authored, never inferred from the method prose. **Authored portions** (version 1): whole milk `120 + 250.4 = 370.4 g`; sucrose `12 + 64 = 76 g`. Both match their existing row totals exactly, so no balance figure moves. **As-made portions** (the 2 Aug batch): whole milk `120 + 263 = 383 g`, which is the sheet's own line and what `batch-2026-08-02.js:18` currently stores as a single 383; sucrose is not split in the record because it matched the plan. Note the trap this settles: `120 + 263` is the as-made, not the authored — writing it as the authored split would take whole milk to 383 g, batch mass to 812.6 g, and move every figure on the churned version.
**Phase notes**: Re-scoped 2026-09-09, second pass. The phase was written as a migration; Mark confirmed there is no stored data worth keeping — his profile holds the seed and throwaway test records only — so the store resets instead. That is the cheaper half of a choice, not a shortcut: the seed lives in `data/olive-oil.js` and `data/batch-2026-08-02.js` as hand-authored source, and rewriting those two files to the new shape was already the bulk of this phase under either approach. What the reset drops is compatibility with records held outside source — an older browser profile, an older export file — and that is worth nothing while no such record exists. The `declaredAxes` P0 goes with it: it was a *missing lift entry*, not a source defect — the seed already declares its axes in the object shape and `createBatch` clones them into the snapshot, so with no ladder there is nothing left to fix. Shape still lands before arrangement, because everything Phase 03.3 renders reads the new shape; layout first would build the step-order table against `step`/`splitStep` and then rebuild it against `portions`. The portion count is fixed in milestone 1 — amounts edit, the split does not; splitting in the pen is milestone 2. The migration discipline is not abandoned, only deferred: it starts paying at the first record Mark actually cares about, and the next shape change after this one is expected to lift rather than reset.

**Scope:**

- `portions` on a row (`[{step, grams}, …]`), the total derived as their sum; an unsplit ingredient is a one-portion row, so one rule covers split and unsplit with no second case
- `step` / `splitStep` retire; `stepNumbers.js` and `IngredientTable.jsx`'s references follow — 31 across four files
- Split-step prose loses its amounts — the number lives in one place; amounts for unsplit ingredients stay in the prose as written
- The store resets: `DB_VERSION` bumps and the upgrade drops and recreates both object stores, so a returning profile comes back empty and reseeds through the existing `seedIfEmpty` path. No cursor, no per-record rewrite
- `versionLift.js`'s ladder retires. Its seed facts (`SEED_USES`, `SEED_CREATED_AT`) belong with the seed and move there; `VERSION_SCHEMA_VERSION` survives as a constant
- `transfer.js` narrows to the new shape alone — export writes it, `validateStoreFile` accepts it and refuses 1, 2 and 3, and `importStore` loses its lift branch
- The seed's split amounts, authored above. **No `declaredAxes` work**: source already carries the object shape (`data/olive-oil.js:73`), `createBatch` clones it into the snapshot, and the P0 only ever affected records stored under the old string shape — the ones the reset discards. The six-axes clause in Done-when is a regression guard, not new work
- As-made recorded per portion, its total deriving the same way — the 2 Aug batch's lump `'row-01': 383` becomes `120 + 263`, matching the sheet line for line
- Balance reads the derived total; the coefficient snapshot stays per ingredient, never per portion

**Done when:** the churned olive oil version and its 2 Aug batch reopen with every figure unmoved — whole milk still 370.4 g, batch mass still 800 g; the batch's as-made whole milk reads `120 + 263` and still totals 383; the six tasting axes each take a mark independently; a profile carrying the old shape reseeds clean rather than throwing; and a store exported after the change imports after it.

**Plans:** 5/5 plans complete

Plans:
**Wave 1**

- [x] 03.2-01-PLAN.md — The portion, end to end: `portions` on every row, the derived total, the seed's authored split, the prose losing its amounts, and the store reset proven against a real IndexedDB

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03.2-02-PLAN.md — The ladder retires and the store file narrows: `transfer.js` accepts one schema, `versionLift.js` is deleted, and the surviving round trip is proven

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03.2-03-PLAN.md — The table and the pen read the portion: one amount field per portion, the step column joined, the show-changes state on the plural descriptors — the suite back to green

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03.2-04-PLAN.md — As made, per portion: the 2 Aug batch's `120 + 263`, and the phase's three regression guards

**Wave 5** *(gap closure — blocked on Wave 4 completion)*

- [x] 03.2-05-PLAN.md — The As-made reading, coherent for any recording pattern: both unfiltered joins fixed, and the test asserting the full rendered string

### Phase 03.3: The front-matter rows and the page in step order (INSERTED)

**Goal:** The imprint and the tray retire into two front-matter rows spanning the page; the margin retires as a region; the ingredient table reads in step order; the pen's method opens read-only; and a blank prose line is ruled.
**Depends on:** Phase 03.2
**Requirements**: None new — builds the 2026-09-09 Impeccable revision of `route-recipe.md` (sketch 003 variant B), confirmed by Mark 2026-09-09
**UI hint**: yes
**Prerequisite**: Phase 03.2's shape is landed — the table groups by step and reads portions. `.planning/sketches/003-front-matter-rows/` (variant B); re-critique baseline `.impeccable/critique/2026-09-10T00-26-25Z__app-src-ui-recipepage-jsx.md` (28/40)
**Phase notes**: Supersedes Phase 03.1's front-matter layout — the imprint and the tray are both retired. Carries the three overrides accepted at 03.1's close and the further items recorded in `.planning/phases/03.1-the-imprint-and-the-binder/03.1-VERIFICATION.md` § Overrides Accepted. The sub-1280 stack remains Phase 4's (UX1-01).

**Scope:**

- Two front-matter rows across the page — the version row (name, version line, headnote prose; From version, Why, From batch; Next version, Show changes, the later-versions count) and the batch row (churn line, the maker's words; the measured cells at figure size; tasting marks; Record another, Add tasting, Correct, the later-batches count). No running head on either
- The margin retires as a region: the record's content moves up into the batch row, Things to check and the carried-forward Notes move down under Balance. Column two becomes Balance, Things to check, Notes
- The table groups by step with the step's lead-in as the group head; the Step column disappears; a split ingredient appears once per step with `120 g of 370.4 g · 46.3% in all` beneath its name. "Before you start" notes leave the headnote and head the Method
- The pen's method opens read-only with one `edit this step` text control per step; per-step and per-row controls become text controls, not the binder's bordered buttons (03.1 Gap 1 override)
- A blank prose line carries a hairline ink baseline and no label — closes the three invisible batch fields (03.1 Gap 2 override)
- Save returns focus to its opener on every pen (03.1 Gap 3 override, D-27); the blocked-save focus effect fires on every press, not only the first (03.1 REVIEW.md WR-01)
- The thirteen labels Mark settled 2026-09-09 13:31
- Confirm the two behaviours 03.1 left unproven either way: the fork's landing focus, and the uses checklist's open/close with its scoped Escape
- Open, not necessarily closed here: the fifth loose grams reader (open decision, `6af7a6e`); the Firefox calendar icon (no CSS hook); the parent's version line printing twice

**Plans:** 4/4 plans executed; 3 gap-closure plans planned (05–07, from 03.3-UAT.md G-03.3-1..4)

Plans:
**Wave 1**

- [x] 03.3-01-PLAN.md — The tracer: `Versions.jsx` splits into `VersionRow.jsx` and `BatchRow.jsx`, `BatchMargin.jsx` retires, the front matter stacks into two full-width rows with no running head, column two becomes Balance → Things to check → Notes, "Before you start" heads the Method, the three blank prose fields rule a hairline baseline, focus-return relocates and WR-01's version-line half takes an attempt counter — the fork's landing focus deferred to human verify

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03.3-02-PLAN.md — The table in step order: portions grouped under each step's lead-in across all three states, the Step column gone, a split ingredient's `120 g of 370.4 g · 46.3% in all` sub-line from `formatPortionLine` in `composition.js`, the pen's step select removed (LD-02, a recorded regression), the `--col-step` tokens dropped, WR-01's table half fixed

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03.3-03-PLAN.md — The pen's method opens read-only: one `edit this step` text control per step on `useOnDemandField`, `.text-control` opts the named per-step and per-row controls out of the binder rule — the uses checklist's scoped Escape deferred to human verify

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03.3-04-PLAN.md — The thirteen labels verbatim across the rows, the advisories and the table head; `figures.js`'s label becomes a word + term pair rendered as two spans in `GraduatedRule.jsx`, with `figureLabelText` guarding its two hidden string consumers

**Gap closure** *(after UAT 2026-09-10; run with `--gaps-only`)*

**Gap wave 1**

- [ ] 03.3-05-PLAN.md — G-03.3-2: the uses checklist's Escape handler moves to a wrapper around the `change` control and the fieldset, gated on the checklist being open, so the first Escape closes only the checklist and the second reaches the pen
- [ ] 03.3-06-PLAN.md — G-03.3-1 + the version row of G-03.3-4: `descendantVersions` in `lineage.js`; the version row's right-hand stack (Version, Written, Why, From batch, Later) rebuilt against sketch 003 variant B; Record another moves into the version row; fork focus lands by a deterministic effect instead of `autoFocus`

**Gap wave 2** *(blocked on 03.3-06)*

- [ ] 03.3-07-PLAN.md — G-03.3-3 + the batch row of G-03.3-4: `targetValueFor` in `rows.js`; one head line, measured cells with plain-word labels, units beside figures and a plan sub-line, "not measured"; tasting shows marked axes only; Correct and Add tasting become text controls at the foot; the duplicate "no batch yet" paragraph goes

### Phase 4: Prepare the next version for making

**Goal**: Maker can print the new version as a bench sheet, carry it to the kitchen, and match the printed sheet back to its version — with the whole develop loop operable by keyboard and recoverable
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: PRINT-01, PRINT-02, PRINT-03, PRINT-04, PRINT-05, UX1-01, UX1-02, UX1-03
**Success Criteria** (what must be TRUE):

  1. Maker prints the new version from the browser as a formula page showing ingredient, grams, % of batch, step allocation, a mise-en-place box, and a blank as-made column, with a unit on every printed value.
  2. The printed sheet carries the method with typed targets (temperature, time, amount) beside each prose instruction, plus a blank batch-log page with churn date, measured fields, result, dimensions, and next-time lines.
  3. The sheet carries a human-readable short code for the printed version and the maker can use that code in the app to reach the same version; printing captures a saved version only, never unsaved edits, and never creates a batch record.
  4. Reviewing a recipe, editing a version, recording a batch, and printing are each operable by keyboard with visible labels and visible focus, and text contrast meets WCAG 2.2 AA.
  5. Entered data survives a recoverable failure such as a reload mid-edit, and uncertainty, estimated data, and errors are never conveyed by colour alone.

**Plans**: TBD
**UI hint**: yes
**Prerequisite**: Impeccable brief approved for the bench sheet (print) surface
**Phase notes**: No QR codes — a human-readable short code only (PRINT-04), and no print-log "did you churn it?" nudge; both prior designs depend on the open storage decision. UX1-01–UX1-03 are verified end-to-end here because this is the first point where the whole loop exists, but they are build constraints in every phase: each phase's plans apply keyboard operation, visible labels and focus, AA contrast, non-colour-only signalling, and edit recovery to the surfaces it creates.

## Milestone Constraints

These govern every phase and are not re-litigated during planning:

- **Storage stays open (D16).** Milestone 1 uses a provisional local store behind a small repository seam. No storage or backend phase exists, and no provider is named.
- **Design authority is Impeccable's.** Each UI-bearing phase requires its approved surface brief before execution. The seeds in `product-requirements/07-framework-handoffs.md` are unapproved input.
- **Stack is provisional through Phase 1.** React + Vite + JSX per `CLAUDE.md`, ratified on Phase 1's real code. TypeScript is not adopted; the testing-framework choice is surfaced in phase discussion, not decided here.
- **Ingredient seed dataset is chosen in Phase 1 planning**, after the recipe data model is designed. Three candidate datasets disagree on coefficients.
- **Reference, not foundation.** The old-sprinkles transcribed olive oil data is approved for reuse as seed content; its code is not built on. Codebase mapping is deferred until real code lands here.
- **Open labels stay open (D12).** Stars/ratings, Optimize, Scale, and Template labels are not fixed in code.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 3.1 → 3.2 → 3.3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Read the churned recipe | 4/4 | Complete    | 2026-09-05 |
| 2. Record the first batch | 5/5 | Complete    | 2026-09-06 |
| 3. Develop the next version | 12/12 | Complete    | 2026-09-08 |
| 3.1. The imprint and the binder | 5/5 | Complete    | 2026-09-09 |
| 3.2. The portion and the reset | 5/5 | Complete    | 2026-09-10 |
| 3.3. The front-matter rows and the page in step order | 4/4 | In Progress|  |
| 4. Prepare the next version for making | 0/TBD | Not started | - |

## Coverage

All 23 v1 requirements are mapped to exactly one phase.

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1 | REC1-01, FORM1-01, FORM1-02 | 3 |
| 2 | BATCH1-01, BATCH1-02, BATCH2-01, BATCH2-02, OBS1-01 | 5 |
| 3 | REC1-02, REC1-03, REC1-04, REC1-05, FORM1-03, FORM2-01, FORM2-02 | 7 |
| 4 | PRINT-01, PRINT-02, PRINT-03, PRINT-04, PRINT-05, UX1-01, UX1-02, UX1-03 | 8 |
| **Total** | | **23** |

No orphaned requirements. No requirement appears in two phases.

---
*Roadmap created: 2026-09-05*
