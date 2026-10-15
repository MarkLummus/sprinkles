# Requirements: Sprinkles

**Defined:** 2026-10-14
**Milestone:** v1.1 Groundwork for creation
**Core Value:** Make something you like, understand how it turned out, and know what to keep or change next time.

## v1.1 Requirements

Groundwork for recipe creation, which is the next milestone (v2). The groundwork changes no screen: each requirement is checked by tests and by the existing screens reading as before. Each maps to a roadmap phase.

### Editor refactor

- [x] **EDIT-01**: The pure helpers `RecipePage.jsx` exports (`isDraftDirty`, `restoreStepFromVersion`, `blankRecordDraft`, `buildChurnFieldsFromDraft` and the others) live in `domain/`, with no framework, DOM or store import, and their tests run under node.
- [x] **EDIT-02**: The pen's changes to a draft are pure operations in `domain/`, driven through a `usePenDraft` hook, so the pen handlers stop repeating the clear-blocked-state lines.
- [x] **EDIT-03**: The recording and tasting workflow is extracted the same way (pure operations plus a hook).
- [x] **EDIT-04**: `RecipePage` is left as the route shell, and the maker sees no change: the existing suite passes and the pen, record and tasting views read as before.

### Creation primitives

- [ ] **MAKE-01**: A framework-free function creates a recipe with a root version (no parent) from a name and starting rows, without touching the store.
- [ ] **MAKE-02**: A step-key allocator hands out step numbers that are never reused, including after a step is removed.
- [ ] **MAKE-03**: A row-from-ingredient builder makes a version row from a library ingredient, embedding a `structuredClone` of its coefficients and basis.

### Ingredient library

- [x] **LIB-01**: The ingredient library is an object store behind the repository seam, seeded on an empty database from `data/library.js`, which is then read only as the seed.
- [ ] **LIB-02**: A change to a library entry never moves a stored version's or batch's figures (proven by test, as in Phase 1).
- [ ] **LIB-03**: Export and import carry the library with the other stores in the same one-transaction commit.

The database version bumps from 8 to 9 for the new store. The bump only adds the store and resets no profile at 8: recipes, versions, batches and drafts stay (Phase 6 D-01). A profile below 8 still resets, and the reset on a version bump otherwise stays until a recipe can be created from scratch.

## v2 Requirements

Recipe creation, the next milestone. Not scoped yet.

### Recipe creation

- **REC-03**: Version evolution (the former Phase 5): add, remove and reorder of steps and ingredients, and Before you start, in the pen and for a new recipe.
- **REC-04**: Custom scales and problems for a new recipe (SEED-261001-iq4, G-03.5-2b).
- **REC-05**: Show changes draws the steps and rows a version dropped, and marks an added step.

### Carried over from v1

- **ING-01**: Library editing, adding ingredients from the seed dataset, per-field provenance editing (the store ships here; the editing UI does not).
- **ING-02**: Bounded transformation calculations.
- **IMP-01**, **IMP-02**, **IMP-03**: Pasted-text import with explicit unknowns.
- **REC-02**: Components (base, ripple, sauce, inclusion).
- **SCALE-01**: Change batch size with mix mass, yield, and capacity kept distinct.
- **DIAG-01**, **DIAG-02**, **LEARN-01**: Explain causes, plan an experiment, compare attempts.
- **TRUST-01**: Data-transfer, retention, and credential policy before any live external-model use.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Creation UI, add/remove/reorder in the pen | Next milestone (v2); this one only lays the groundwork (Mark, 2026-10-14) |
| Custom scales and problems (SEED-261001-iq4) | Belongs with recipe creation; seed stays dormant |
| Storage upgrade path and storage-failure UI | The reset on a version bump stays until a recipe can be created from scratch; the Phase 6 bump (8 to 9) only adds the library store and resets no profile at 8 |
| Import hardening, line-out polish, sub-scale advisory per portion | Backlog (Mark's List, parked) |
| Ingredients, Kitchen, Idea log, Recipe book places | Placeholders stay; each needs discovery before it enters a milestone |
| Storage/sync architecture and provider choice | D16 keeps it open |
| Live AI/LLM features | TRUST-01 policy required first |
| Social, marketplace, hardware control | Product brief exclusions |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-01 | Phase 5 | Complete |
| EDIT-02 | Phase 5 | Complete |
| EDIT-03 | Phase 5 | Complete |
| EDIT-04 | Phase 5 | Complete |
| MAKE-01 | Phase 7 | Pending |
| MAKE-02 | Phase 7 | Pending |
| MAKE-03 | Phase 7 | Pending |
| LIB-01 | Phase 6 | Complete |
| LIB-02 | Phase 6 | Pending |
| LIB-03 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-14*
*Last updated: 2026-10-14 after the v1.1 roadmap mapped every requirement to a phase*
