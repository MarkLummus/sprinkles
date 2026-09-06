# Requirements: Sprinkles

**Defined:** 2026-09-05
**Core Value:** Make something you like, understand how it turned out, and know what to keep or change next time.

Requirement authority is `product-requirements/04-requirements.md` (packet IDs such as REC-01, FORM-02, BATCH-01). This file selects what milestone 1 needs and states it as testable criteria. ID rule: `REC1-nn` are milestone criteria derived from packet REC-01, `FORM2-nn` from FORM-02, `BATCH2-nn` from BATCH-02, `OBS1-nn` from OBS-01, `UX1-nn` from UX-01; `PRINT-nn` derive from REC-01's review/print capability. Packet criteria not listed here remain draft and unselected, not rejected.

## v1 Requirements — Milestone 1: develop the next olive oil recipe (D14)

Working case: the olive oil recipe, 50 g oil, 800 g, churned 2 Aug 2026, with its first-batch notes. Batch size stays 800 g. Ingredient handling is limited to the recipe's existing twelve rows.

### Recipe and versions — from REC-01

- [x] **REC1-01**: Maker can open the churned olive oil recipe, loaded from the transcribed seed content, and see its ingredients with grams, % of batch, and step allocation, its method, its target bands, and its authored notes.
- [ ] **REC1-02**: Maker can create a new version from the churned version; the new version records its parent and the churned version is unchanged afterwards.
- [ ] **REC1-03**: Maker can edit the new version's ingredient amounts, remove or restore any of its twelve rows, and edit method steps and their targets.
- [ ] **REC1-04**: Maker can record why the version changed as free text that cites the batch that motivated it.
- [ ] **REC1-05**: A saved version reopens with the same values after the app is reloaded (provisional local store).

### Formulation — from FORM-01 and FORM-02

- [x] **FORM1-01**: For any version, maker sees PAC, POD, total fat with milkfat and added fat separately, MSNF, sugar solids, and total solids per 100 g, each against its target band, with the calculation basis stated.
- [x] **FORM1-02**: A figure that rests on estimated or unreviewed ingredient data is flagged where it is shown.
- [ ] **FORM1-03**: A version outside a target band can still be saved and printed, and no figure is labeled as guaranteeing success.
- [ ] **FORM2-01**: Maker can compare the new version with the churned version: per-row change in grams and in % of batch, and the change in each balance figure.
- [ ] **FORM2-02**: Derived structural advisories are shown with the basis they were computed from: sub-scale amounts with a master-blend multiple, ultra-pasteurised mass, gum hydration temperature versus the pasteurisation hold, and estimated-data exposure. None predicts a sensory outcome and none blocks saving or printing.

### Batch record — from BATCH-01, BATCH-02, and OBS-01

- [ ] **BATCH1-01**: Maker can record a batch against the churned version with its churn date, an as-made amount per row where it differed from the plan, and process deviations (changed or skipped steps), kept separate from the recipe's planned values.
- [x] **BATCH1-02**: Maker can record measured values (come-up time, draw temperature, overrun, meltdown); a field left blank stays unknown and is never filled from the recipe.
- [x] **BATCH2-01**: A batch stores a snapshot of the recipe rows and the ingredient coefficients it was computed with; later edits to the recipe or ingredient data do not change what the batch shows.
- [ ] **BATCH2-02**: Maker can reopen a batch and see it together with the recipe version it used, its measured values, and its result.
- [ ] **OBS1-01**: Maker can record how the batch turned out in their own words, and optionally add structured dimensions (for example oil character, bitterness, sweetness) and a next-time note, with no required field beyond the words. Any rating control is a design decision left open by D12.

### Review and print — from REC-01 (review/print capability)

- [ ] **PRINT-01**: Maker can print the new version as a bench sheet from the browser. The formula page shows ingredient, grams, % of batch, step allocation, a mise-en-place box, and a blank as-made column, and every printed value carries a unit.
- [ ] **PRINT-02**: The sheet includes the method with typed targets (temperature, time, amount) beside the prose instruction.
- [ ] **PRINT-03**: The sheet includes a blank batch-log page (churn date, measured fields, result, dimensions, next-time lines) so the next batch's notes have a home.
- [ ] **PRINT-04**: The sheet carries a human-readable short code identifying the printed version, and the app can match that code back to the version. No QR code.
- [ ] **PRINT-05**: The sheet prints a saved version, never unsaved edits, and printing does not create a batch record.

### Usability — from UX-01

- [ ] **UX1-01**: Recipe editing, batch recording, and printing are operable by keyboard, with visible labels and focus, and text contrast meets WCAG 2.2 AA.
- [ ] **UX1-02**: Entered data survives a recoverable failure such as a reload mid-edit.
- [ ] **UX1-03**: Uncertainty, estimated data, and errors are never conveyed by color alone.

## v2 Requirements

Deferred to later milestones. Tracked here so they are not lost; packet IDs are the reference.

### Import (D03)

- **IMP-01**, **IMP-02**, **IMP-03**: Pasted-text import with explicit unknowns — the accepted first import channel; not needed to develop the olive oil recipe.

### Ingredients (D09)

- **ING-01**: Library editing, adding ingredients from the seed dataset, per-field provenance editing.
- **ING-02**: Bounded transformation calculations.

### Recipe structure

- **REC-02**: Components (base, ripple, sauce, inclusion).
- **SCALE-01**: Change batch size with mix mass, yield, and capacity kept distinct.

### Learning (D07)

- **DIAG-01**, **DIAG-02**: Explain plausible causes; plan a manageable experiment.
- **LEARN-01**: Compare attempts across batches.

### Trust

- **TRUST-01**: Data-transfer, retention, and credential policy before any live external-model use.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Storage/sync architecture and provider choice | D16 keeps it open; milestone 1 uses a provisional local store behind a seam |
| URL and file import | D03 assigns to a later milestone; formats open |
| Photo import | D03 requires discovery first; the printout is source material, not a channel commitment |
| Customer-facing troubleshooting intake for external recipes | D02: discovery/evaluation only |
| Automated diagnosis in milestone 1 | D14: Mark interprets notes and chooses adjustments |
| QR codes and print-log nudge | Prior-work design; depends on open storage decision; not in D14's outcome |
| Live AI/LLM features | TRUST-01 policy required first |
| Final labels for stars, Optimize, Scale, Template | D12: open until design testing |
| New visual identity | D13: existing branding is incumbent evidence to confirm |
| Social, marketplace, hardware control | Product brief exclusions |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| REC1-01 | Phase 1 | Complete |
| REC1-02 | Phase 3 | Pending |
| REC1-03 | Phase 3 | Pending |
| REC1-04 | Phase 3 | Pending |
| REC1-05 | Phase 3 | Pending |
| FORM1-01 | Phase 1 | Complete |
| FORM1-02 | Phase 1 | Complete |
| FORM1-03 | Phase 3 | Pending |
| FORM2-01 | Phase 3 | Pending |
| FORM2-02 | Phase 3 | Pending |
| BATCH1-01 | Phase 2 | Pending |
| BATCH1-02 | Phase 2 | Complete |
| BATCH2-01 | Phase 2 | Complete |
| BATCH2-02 | Phase 2 | Pending |
| OBS1-01 | Phase 2 | Pending |
| PRINT-01 | Phase 4 | Pending |
| PRINT-02 | Phase 4 | Pending |
| PRINT-03 | Phase 4 | Pending |
| PRINT-04 | Phase 4 | Pending |
| PRINT-05 | Phase 4 | Pending |
| UX1-01 | Phase 4 | Pending |
| UX1-02 | Phase 4 | Pending |
| UX1-03 | Phase 4 | Pending |

**Coverage:**

- v1 requirements: 23 total
- Mapped to phases: 23 ✓
- Unmapped: 0

Per phase: Phase 1 — 3, Phase 2 — 5, Phase 3 — 7, Phase 4 — 8. Each requirement maps to exactly one phase.
UX1-01–UX1-03 are verified end-to-end in Phase 4 (first point where the whole loop exists) but are build constraints in every phase.

---
*Requirements defined: 2026-09-05*
*Last updated: 2026-09-05 after roadmap creation (traceability mapped)*
