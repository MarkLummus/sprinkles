# Requirements: Sprinkles

**Defined:** 2026-10-16
**Core Value:** Make something you like, understand how it turned out, and know what to keep or change next time. If everything else fails, a maker must still be able to develop a recipe, make it from a printed sheet, and get back a record of what happened that the next version can cite.

Requirement authority is `product-requirements/04-requirements.md` (packet IDs such as REC-01, ING-01). This file selects what milestone v2.0 needs and states it as testable criteria. Category IDs continue those of v1.1 (`EDIT`, `LIB`, `MAKE`); `PLACE`, `STRUCT`, `CODE`, `TASTE` and `PROOF` are new. Archived: `milestones/v1-REQUIREMENTS.md`, `milestones/v1.1-REQUIREMENTS.md`.

**ID note (decided 2026-10-16, Mark):** this milestone's tasting-scale requirements were SCALE-01 to SCALE-04 and are now TASTE-01 to TASTE-04, because the product requirement SCALE-01 means quantity scaling (crosswalk: SCALE-01 → TASTE-01, SCALE-02 → TASTE-02, SCALE-03 → TASTE-03, SCALE-04 → TASTE-04). REC-03 and REC-05 are not defined in `product-requirements/04-requirements.md`, so this file says "structure edits on later versions" in words instead.

## v2.0 Requirements — Recipe creation

### Editor split (continues EDIT-04)

- [ ] **EDIT-05**: `RecipePage` is cut along its separate jobs (announcer, record loading, sheet view, version pen, kept drafts, route intents) and the maker sees no change.
- [ ] **EDIT-06**: The shell test asserts the new modules positively, and the recorded WebKit walk of 94 snapshots still matches.

### Ingredient library (continues LIB-03)

- [ ] **LIB-04**: The library is seeded beyond the current 26 entries from the reviewed dataset, each entry with provenance.
- [ ] **LIB-05**: Every existing library entry keeps its current values, and each of the seven conflicts with the dataset (dextrose basis, salt, fructose POD, strawberries, skim milk powder, coconut milk, heavy cream) is recorded as decided: the app's value stays.
- [ ] **LIB-06**: A profile at database version 9 opens at version 10 with the larger library: the library is cleared and reseeded (amending Phase 6 D-05), the store resets to the new shapes, and the seeded recipes are rewritten in them. Nothing the maker made is lost, because none exists yet.
- [ ] **LIB-07**: Dairy rows from the dataset do not count lactose twice in PAC or POD.
- [ ] **LIB-08**: A row keeps a link to the library entry it was copied from, and its figures still do not move when the library changes.
- [ ] **LIB-09**: Every seed dataset is rows in a store table that an empty store is seeded with: the library, the machines (name, minimum fill, maximum fill), the ice cream styles (their balance bands, plus egg yolk, overrun, stabilizer and emulsifier ranges, default serve temperature, default equipment class and calibration family, stored and not read in v2.0), and the core scales and problems. No seed dataset is read from a code constant at run time, so a later version can let the maker add rows. Those tables travel in the store file with the library: the file validator checks them, the store file version changes, and an import into a fresh profile restores them.

### Places

- [ ] **PLACE-01**: The Ingredients place lists the library, with search by name and category, read-only.
- [ ] **PLACE-02**: The Notebook place lists the recipes.

### Creating a recipe (continues MAKE-03)

- [ ] **MAKE-04**: A maker can start a blank recipe from the Notebook, needing only a name. Two recipes may share a name; the Notebook warns when they do.
- [ ] **MAKE-05**: A maker can author the recipe's name, its description and its Version name. One description box fills both the recipe description and the Sheet description. The Version name starts as "Version 1", which the maker can change.
- [ ] **MAKE-06**: A maker can add ingredient rows from the library, enter grams, and see the balance figures update. A maker can also remove a row, which deletes it outright. An ingredient not in the library adds nothing: the picker says "Not in the library yet".
- [ ] **MAKE-07**: A maker can author Instructions steps (lead-in, text, targets) and say which rows each step uses and in what portions.
- [ ] **MAKE-08**: A maker can author Before you start notes.
- [ ] **MAKE-09**: A maker can choose an ice cream style, and the balance bands fill in from it; the maker can edit the bands or leave them blank. The styles are Philadelphia, French, gelato and sorbet; the bands are Mark's approved values, with PAC and sugar starting blank. The maker can then pick a conventional machine from a short list, which fills its minimum and maximum fill, and set the process (pasteurise temperature and hold time, as stored today), or leave both empty. (The machine table starts with Whynter at 700 g minimum and no maximum; Mark adds other machines and fills the maximum later.)
- [ ] **MAKE-10**: Saving creates the recipe and its first version in one step, lands on the new page, and a failed save leaves neither behind.
- [ ] **MAKE-11**: An unsaved creation survives a closed tab and offers Resume, and abandoning it leaves no records.
- [ ] **MAKE-12**: A created recipe prints as a bench sheet with its Sheet code (CODE-01), like the seeded ones, and typing that code finds it after any later edit.

### Structure on a first version

- [ ] **STRUCT-01**: A maker can add and remove steps and rows on a first version, while creating it and after Save until it has a batch or a child version. A removal deletes outright and cleans up anything that pointed at it, so no dangling reference is left.
- [ ] **STRUCT-02**: A maker can reorder steps, and rows within a step, with Move up and Move down buttons that work by touch and keyboard.
- [ ] **STRUCT-03**: A step's stored number and a row's id never change on reorder.
- [ ] **STRUCT-04**: Add, Remove and Move controls appear on a first version that has no batch and no child version, and on no other saved version. The version pen's remove and restore on later versions is unchanged.

### Sheet code

- [ ] **CODE-01**: A version's Sheet code is assigned when the version is created, a first version and every Next version alike, and is unique. It is stored with the version and never changes afterwards, whatever is edited: the recipe name, the Version name, the Sheet title or description, or any row, step or note.

### Custom scales and problems

- [ ] **TASTE-01**: A maker can define 0 to 2 scales for a recipe, each with a name, a label for each end, and its kind: goldilocks, with the fixed middle word "right", or plain magnitude.
- [ ] **TASTE-02**: A maker can define 0 to 2 problems for a recipe.
- [ ] **TASTE-03**: A batch snapshots the recipe's definitions, a scale's kind included, so a later change never moves a stored mark.
- [ ] **TASTE-04**: The record pen, the reading and the printed log show a recipe's own scales, each in its kind, and its problems, and "This recipe only" shows only when it has any.

### Proof

- [ ] **PROOF-01**: A recipe created in the app round-trips: print, record a batch with a custom scale, export, import.
- [ ] **PROOF-02**: Creation is checked on the iPad from the production build, including Move focus and keyboard reach.

## Future Requirements

Tracked, not in this roadmap.

- **Version evolution (later versions)**: structure edits on later versions, and batches recording reordered or new steps.
- **Show changes**: dropped, added and moved steps and rows.
- **Fill-limit advisory**: a Things to check advisory when a batch is under a machine's minimum fill or over its maximum fill. Both limits are stored from v2.0, and nothing reads them yet.
- **ING-01 (editing)**: creating and editing library ingredients, with provenance. `importAll` overwrite policy to be decided first.
- **ING-02**: bounded transformation calculations.
- **Storage upgrade path**: lift records instead of dropping stores, and storage failures shown in the UI.
- **Import hardening**: validator edge cases from the v1 audit.
- **Recipe book, Idea log, Kitchen places** and the Recipe book print format.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Structure edits on later versions | Mark, 2026-10-16: structure is edited only on a first version, while it has no batch and no child version |
| Show changes for dropped, added and moved steps | Follows from the above; a first version has no parent to compare with |
| Library create, edit, duplicate | Mark, 2026-10-16: the library is seeded, not edited; picking is enough |
| Auto-balance or Optimize | The D12 label is open and FORM-02 forbids silent replacement |
| Template, Base or Adapted-from at creation | Mark copies recipes into each other; seeded recipes stand alone |
| Drag-only reorder | Move buttons are the baseline for iPad, keyboard reach and the CSS-token rule |
| More than 2 custom scales or 2 custom problems | Sketch 010 D25 and D26 |
| A name-only row for an ingredient not in the library | Mark, 2026-10-16: the picker says "Not in the library yet" and adds nothing |
| Any import (URL, file, photo, pasted text) | D03 assigns import to a later milestone |
| Markdown, timers, cook mode, photos, stars, servings, nutrition, cost | Not part of the creation loop |
| Data migration | Reset-over-migration holds while there is no live data; the reset window closes when creation becomes saveable |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-05 | Phase 8 | Pending |
| EDIT-06 | Phase 8 | Pending |
| LIB-04 | Phase 9 | Pending |
| LIB-05 | Phase 9 | Pending |
| LIB-06 | Phase 9 | Pending |
| LIB-07 | Phase 9 | Pending |
| LIB-08 | Phase 9 | Pending |
| LIB-09 | Phase 9 | Pending |
| PLACE-01 | Phase 9 | Pending |
| PLACE-02 | Phase 9 | Pending |
| CODE-01 | Phase 9 | Pending |
| MAKE-04 | Phase 10 | Pending |
| MAKE-05 | Phase 10 | Pending |
| MAKE-06 | Phase 10 | Pending |
| MAKE-07 | Phase 11 | Pending |
| MAKE-08 | Phase 10 | Pending |
| MAKE-09 | Phase 10 | Pending |
| MAKE-10 | Phase 11 | Pending |
| MAKE-11 | Phase 10 | Pending |
| MAKE-12 | Phase 11 | Pending |
| STRUCT-01 | Phase 11 | Pending |
| STRUCT-02 | Phase 11 | Pending |
| STRUCT-03 | Phase 11 | Pending |
| STRUCT-04 | Phase 11 | Pending |
| TASTE-01 | Phase 10 | Pending |
| TASTE-02 | Phase 10 | Pending |
| TASTE-03 | Phase 9 | Pending |
| TASTE-04 | Phase 12 | Pending |
| PROOF-01 | Phase 12 | Pending |
| PROOF-02 | Phase 12 | Pending |

**Coverage:**
- v2.0 requirements: 30 total
- Mapped to phases: 30 (Phase 8: 2, Phase 9: 10, Phase 10: 8, Phase 11: 7, Phase 12: 3)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-16*
*Last updated: 2026-10-16 after Mark's decision that all seed data is rows in store tables (LIB-09), and after the Codex review and Mark's answers: MAKE-09, SCALE-01 and SCALE-02 moved to Phase 10; LIB-05, LIB-06, MAKE-04, MAKE-05, MAKE-06, MAKE-09, STRUCT-01, STRUCT-04, SCALE-01, SCALE-03 and SCALE-04 reworded*
