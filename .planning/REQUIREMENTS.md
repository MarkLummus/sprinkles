# Requirements: Sprinkles

**Defined:** 2026-10-16
**Core Value:** Make something you like, understand how it turned out, and know what to keep or change next time. If everything else fails, a maker must still be able to develop a recipe, make it from a printed sheet, and get back a record of what happened that the next version can cite.

Requirement authority is `product-requirements/04-requirements.md` (packet IDs such as REC-01, REC-03, REC-05, ING-01). This file selects what milestone v2.0 needs and states it as testable criteria. Category IDs continue those of v1.1 (`EDIT`, `LIB`, `MAKE`); `PLACE`, `STRUCT`, `SCALE` and `PROOF` are new. Archived: `milestones/v1-REQUIREMENTS.md`, `milestones/v1.1-REQUIREMENTS.md`.

## v2.0 Requirements — Recipe creation

### Editor split (continues EDIT-04)

- [ ] **EDIT-05**: `RecipePage` is cut along its separate jobs (announcer, record loading, sheet view, version pen, kept drafts, route intents) and the maker sees no change.
- [ ] **EDIT-06**: The shell test asserts the new modules positively, and the recorded WebKit walk of 94 snapshots still matches.

### Ingredient library (continues LIB-03)

- [ ] **LIB-04**: The library is seeded beyond the current 26 entries from the reviewed dataset, each entry with provenance.
- [ ] **LIB-05**: Every existing library entry keeps its current values, and each conflict with the dataset has a recorded decision.
- [ ] **LIB-06**: A profile that already holds the older library receives the larger one (database version 10), with no recipe, version or batch touched.
- [ ] **LIB-07**: Dairy rows from the dataset do not count lactose twice in PAC or POD.
- [ ] **LIB-08**: A row keeps a link to the library entry it was copied from, and its figures still do not move when the library changes.

### Places

- [ ] **PLACE-01**: The Ingredients place lists the library, with search by name and category, read-only.
- [ ] **PLACE-02**: The Notebook place lists recipes and starts a new one.

### Creating a recipe (continues MAKE-03)

- [ ] **MAKE-04**: A maker can start a blank recipe from the Notebook, needing only a name.
- [ ] **MAKE-05**: A maker can author the recipe's name and description and its version line.
- [ ] **MAKE-06**: A maker can add ingredient rows from the library, enter grams, and see the balance figures update.
- [ ] **MAKE-07**: A maker can author Instructions steps (lead-in, text, targets) and say which rows each step uses and in what portions.
- [ ] **MAKE-08**: A maker can author Before you start notes.
- [ ] **MAKE-09**: A maker can author balance targets, equipment and process, or leave them empty.
- [ ] **MAKE-10**: Saving creates the recipe and its first version in one step, lands on the new page, and a failed save leaves neither behind.
- [ ] **MAKE-11**: An unsaved creation survives a closed tab and offers Resume, and abandoning it leaves no records.
- [ ] **MAKE-12**: A created recipe prints as a bench sheet with its Sheet code, like the seeded ones.

### Structure at creation

- [ ] **STRUCT-01**: A maker can add and remove steps and rows while creating a first version, and removing one leaves no dangling reference.
- [ ] **STRUCT-02**: A maker can reorder steps, and rows within a step, with Move up and Move down buttons that work by touch and keyboard.
- [ ] **STRUCT-03**: A step's stored number and a row's id never change on reorder.
- [ ] **STRUCT-04**: Saved versions show no Add, Remove or Move controls.

### Custom scales and problems

- [ ] **SCALE-01**: A maker can define 0 to 2 scales for a recipe, each with a name and a label for each end.
- [ ] **SCALE-02**: A maker can define 0 to 2 problems for a recipe.
- [ ] **SCALE-03**: A batch snapshots the recipe's definitions, so a later change never moves a stored mark.
- [ ] **SCALE-04**: The record pen, the reading and the printed log show a recipe's own scales and problems, and "This recipe only" shows only when it has any.

### Proof

- [ ] **PROOF-01**: A recipe created in the app round-trips: print, record a batch with a custom scale, export, import.
- [ ] **PROOF-02**: Creation is checked on the iPad from the production build, including Move focus and keyboard reach.

## Future Requirements

Tracked, not in this roadmap.

- **REC-03 / REC-05 (later versions)**: structure edits on later versions, and batches recording reordered or new steps.
- **Show changes**: dropped, added and moved steps and rows.
- **ING-01 (editing)**: creating and editing library ingredients, with provenance. `importAll` overwrite policy to be decided first.
- **ING-02**: bounded transformation calculations.
- **Storage upgrade path**: lift records instead of dropping stores, and storage failures shown in the UI.
- **Import hardening**: validator edge cases from the v1 audit.
- **Recipe book, Idea log, Kitchen places** and the Recipe book print format.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Structure edits on later versions | Mark, 2026-10-16: structure edits happen at creation of a first version only; saved versions show no structure controls |
| Show changes for dropped, added and moved steps | Follows from the above; a first version has no parent to compare with |
| Library create, edit, duplicate | Mark, 2026-10-16: the library is seeded, not edited; picking is enough |
| Auto-balance or Optimize | The D12 label is open and FORM-02 forbids silent replacement |
| Template, Base or Adapted-from at creation | Mark copies recipes into each other; seeded recipes stand alone |
| Drag-only reorder | Move buttons are the baseline for iPad, keyboard reach and the CSS-token rule |
| More than 2 custom scales or 2 custom problems | Sketch 010 D25 and D26 |
| Any import (URL, file, photo, pasted text) | D03 assigns import to a later milestone |
| Markdown, timers, cook mode, photos, stars, servings, nutrition, cost | Not part of the creation loop |
| Data migration | Reset-over-migration holds while there is no live data; the reset window closes when creation becomes saveable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-05 | — | Pending |
| EDIT-06 | — | Pending |
| LIB-04 | — | Pending |
| LIB-05 | — | Pending |
| LIB-06 | — | Pending |
| LIB-07 | — | Pending |
| LIB-08 | — | Pending |
| PLACE-01 | — | Pending |
| PLACE-02 | — | Pending |
| MAKE-04 | — | Pending |
| MAKE-05 | — | Pending |
| MAKE-06 | — | Pending |
| MAKE-07 | — | Pending |
| MAKE-08 | — | Pending |
| MAKE-09 | — | Pending |
| MAKE-10 | — | Pending |
| MAKE-11 | — | Pending |
| MAKE-12 | — | Pending |
| STRUCT-01 | — | Pending |
| STRUCT-02 | — | Pending |
| STRUCT-03 | — | Pending |
| STRUCT-04 | — | Pending |
| SCALE-01 | — | Pending |
| SCALE-02 | — | Pending |
| SCALE-03 | — | Pending |
| SCALE-04 | — | Pending |
| PROOF-01 | — | Pending |
| PROOF-02 | — | Pending |

**Coverage:**
- v2.0 requirements: 28 total
- Mapped to phases: 0
- Unmapped: 28 ⚠️

---
*Requirements defined: 2026-10-16*
*Last updated: 2026-10-16 after defining milestone v2.0*
