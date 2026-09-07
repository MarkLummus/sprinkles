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
- [ ] **Phase 3: Develop the next version** - Version 2 is created, adjusted, and compared against the churned version without disturbing it
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

**Plans**: 8/10 plans executed (03-06 to 03-10 close UAT gaps)

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
- [ ] 03-08-PLAN.md — Columns sized by which column they are, a step selector that fits its cell, and an As made column only where there is an as-made layer (G-03-1)

**Gap closure wave 3** *(blocked on gap closure wave 2)*

- [ ] 03-10-PLAN.md — The derived step number: the method renumbers itself, a struck step keeps the number it had, and a flagged row's selector shows its own allocation (G-03-6, G-03-3 S3)

**UI hint**: yes
**Prerequisite**: Impeccable brief approved for the version editing and comparison surface
**Phase notes**: Balance is an assessment under assumptions, never a gate (D06). Batch size stays 800 g and ingredient handling stays within the recipe's existing twelve rows; scaling and library editing are later milestones.

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
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Read the churned recipe | 4/4 | Complete    | 2026-09-05 |
| 2. Record the first batch | 5/5 | Complete    | 2026-09-06 |
| 3. Develop the next version | 8/10 | In Progress|  |
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
