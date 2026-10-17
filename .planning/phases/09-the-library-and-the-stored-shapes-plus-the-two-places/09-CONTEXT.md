# Phase 9: The library and the stored shapes, plus the two places - Context

**Gathered:** 2026-10-17
**Status:** Ready for planning

<domain>
## Phase Boundary

While a reset is still free, every shape creation will store is settled, in v2.0's one database bump (`DB_VERSION` 9 to 10): the reviewed ingredient library with provenance reaches every profile; every seed dataset (library, machines, styles with bands and fields, core scales and problems) is rows in a store table that travels in the store file; a recipe's own scale definitions carry their kind; a version stores a fixed Sheet code; the drafts store keeps a `create` kind. Beside that, the Ingredients place (read-only) and the Notebook place (the recipe list) open, as sketch 012 draws them. Requirements: LIB-04 to LIB-09, CODE-01, TASTE-03, PLACE-01, PLACE-02. Phase 8 executes and merges first (Phase 8 CONTEXT D-05).

</domain>

<decisions>
## Implementation Decisions

### Core scales and problems are rows (decision 18)
- **D-01:** The six scales (Hardness, Scoopability, Smoothness, Sweetness, and the declarable Body and Oil: name, low and high word, kind, core or declared) and the four core problem chips are seeded rows in store tables, as Mark said "all seed data is rows". The record pen, the reading and the printed log read them from there. (Mark, 2026-10-17)
- **D-02:** The app reads the tables once when it opens and passes the lists into the domain functions as an argument. `domain/axes.js` and `domain/battery.js` stay pure: no store, no framework, tests pass lists in directly. A table edit shows after a reload. (Mark, 2026-10-17)
- **D-03:** A batch copies the scale and problem definitions it used into its snapshot (SCALE-03, now TASTE-03), core ones included, so a later table edit never moves a stored mark. The battery's measured fields and segmented-control options stay constants; they are not scales or problems.

### The Sheet code is stored (decision 19, CODE-01)
- **D-04:** At creation the code is derived once from the version's id (the existing Crockford alphabet, `XXXX-XXXX` grouping), checked against the codes already stored, and stored on the version. The same id gives the same code on any device. It never changes afterwards, whatever is edited. A clash on the check is a creation error, not a silent re-draw. (Mark, 2026-10-17)
- **D-05:** The seeded versions get the code each prints today: the converter computes each seeded version's current content-derived code once (the existing `SHEET_CODE_DERIVATION` tag) and stores it, so every sheet already in the binder still finds its version. Olive oil v1 keeps its pinned golden-vector code. (Mark, 2026-10-17)
- **D-06:** The Enter Sheet code search (`SheetCodeSearch.jsx`) looks up the stored code on each version. No hashing at search time and no separate index. (Mark, 2026-10-17)
- **D-07:** This amends Phase 4 D-08 and D-09 (the code was computed and never stored). `sheetCode.js` keeps the old derivation only to compute the seeded versions' codes once; the print routes (`PrintSheet.jsx`, `PrintSheetPages.jsx`) print the stored field. Import validation requires the field.

### The library
- **D-08:** All 103 ingredients in `~/Downloads/sprinkles-ingredient-seed-db.json` become library entries, merged with the existing 26: where a dataset ingredient is the same ingredient as one of the 26, the app's values stay and the case is recorded as decided (LIB-05). The 26 keep their keys. A converter flags any ingredient it cannot map cleanly, for Mark's review. (Mark, 2026-10-17)
- **D-09:** New entries are keyed by the dataset's own id, camelCased in the style of today's keys (`sucrose`, `skimMilkPowder`). A test fails on a clash with any of the 26 keys. (Mark, 2026-10-17)
- **D-10:** Each new entry carries source text and a basis per figure, as the existing 26 do: the dataset's `sources` list and its PAC note become the source text, and each figure's basis (stated, derived, estimated) is set from the dataset. An entry the dataset does not source says "not recorded". Dairy rows do not count lactose twice in PAC or POD (LIB-07). (Mark, 2026-10-17)

### Places, styles and machines
- **D-11:** Ingredient search is as sketch 012 draws it: the name contains the typed letters in any case, the category is exact, results stay A to Z (`filterLibrary(records, query, category)`, reused by Phase 10's picker). Anything smarter (folding accents, matching every word, ranking a prefix first) goes back to Sid as a design change. (Mark, 2026-10-17)
- **D-12:** A style row stores, beside its six balance bands, the other fields of Mark's balance research (egg yolk, overrun, stabilizer and emulsifier ranges, default serve temperature) and its default equipment class and calibration family as plain text ids. There are no equipment-class or calibration-family tables yet; nothing reads them, and they arrive with the balance-model feature as a reseed of the styles table. The values are in `.planning/notes/2026-10-16-style-bands-draft.md`. PAC and sugar bands are blank. (Mark, 2026-10-17)
- **D-13:** A version records its machine as a copy of the row's values (name, minimum fill, maximum fill), taken when the maker picks it, as a row copies an ingredient's figures, so a later edit to the machines table never moves a stored version. `maxFillG` is a new stored field; Whynter seeds with 700 g minimum and no maximum. (Mark, 2026-10-17)

### Fixed by earlier decisions (carry forward)
- Library: keep the app's values for all seven conflicts (LIB-05); clear and reseed on the bump, amending Phase 6 D-05 (LIB-06); the 26 keys never change; a row keeps a `libraryId` link and its figures do not move when the library changes (LIB-08).
- Seed tables travel in the store file (LIB-09, decision 20): the file validator checks them, the store file version (8) changes, and an import into a fresh profile restores them.
- A scale is a definition carrying its kind, goldilocks or plain magnitude; olive oil's Body and Oil become definitions in the seeded versions; the 2 Aug batch reads as before (decisions 3 and 5).
- The `create` draft kind has its own fit check, and a test fails if any later upgrade deletes a store for a profile at version 10 or above. This is the milestone's only `DB_VERSION` change; from Phase 11 on a shape change lifts records.
- The places replace the placeholders at `/notebook` and `/ingredients`, start nothing, and write no library entry. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token.

### Claude's Discretion
- Table and store names, the in-memory catalog's shape, and how it reaches the components.
- The converter's mapping from the dataset's fields to the app's entry shape, within D-08 to D-10.
- How the 9-to-10 upgrade is proven from a stored version-9 profile in a real IndexedDB, and the field names of the scale definition (`{key, name, low, high, kind}` per the research).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` Phase 9 (goal, success criteria 1 to 8, Notes), "Before planning" (the reset window, decisions 1 to 21).
- `.planning/REQUIREMENTS.md` LIB-04 to LIB-09, CODE-01, TASTE-03, PLACE-01, PLACE-02.
- `product-requirements/03-decision-register.md` D19 (supported equipment).

### Seed content (approved)
- `.planning/notes/2026-10-16-style-bands-draft.md` - the four styles' bands and fields, approved by Mark 2026-10-17.
- Mark's balance research (outside the repo): `~/Downloads/Balance Bands/balance-model-reference.md`, `balance-seed.json`.
- `~/Downloads/sprinkles-ingredient-seed-db.json` - the 103-ingredient dataset (converter input; never read at runtime).

### Design
- `.planning/sketches/012-places/` (README `## Decisions`, the three boards) - the approved Notebook and Ingredients places.
- `DESIGN.md` - the Notebook and Ingredients places paragraph, and "The rail".

### How to build
- `.planning/research/SUMMARY.md`, `ARCHITECTURE.md`, `PITFALLS.md`, `STACK.md` - converter, conflict-gate test, scale definitions, `create` draft kind, places.
- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-CONTEXT.md` - the page split this phase builds on (kept-draft hook).

### Conventions
- `.claude/CLAUDE.md` Conventions (domain modules framework-free; all store access through `app/src/store/repository.js`; tokens; `tabIndex={0}`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/store/db.js` (`DB_VERSION` 9; guarded creates; reset branch for profiles below 8) - the upgrade to extend.
- `app/src/store/seed.js` (`seedIfEmpty`, `seedLibraryIfEmpty`) and `app/src/data/library.js` (26 entries: `{name, category, dairy, heatTreatment, densityGPerMl, composition, basis, source, note}`).
- `app/src/store/transfer.js` (`STORE_SCHEMA_VERSION` 8, `validateLibraryRecord`, export and import of recipes, versions, batches, library).
- `app/src/domain/axes.js` (`AXES`, `axesForBatch`, `axesForVersion`) and `battery.js` (`DEFECTS`, `declaredProblemsForBatch`); consumers: `PrintLogPages.jsx`, `BatchRow.jsx`, `AxisMark.jsx`, `draft.js`, `transfer.js`, `data/olive-oil.js`.
- `app/src/domain/sheetCode.js` (content-derived code, `SHEET_CODE_DERIVATION`, a pinned golden vector) and its users `PrintSheet.jsx`, `PrintSheetPages.jsx`, `SheetCodeSearch.jsx`.
- `app/src/domain/draft.js` (draft kinds `plan`, `record`, `amend`) and `newRecipe.js`, `versionRow.js`.

### Established Patterns
- Seed-on-empty through the repository seam; import commits in one transaction; a version embeds a `structuredClone` of its ingredient figures.

### Integration Points
- Phase 8's kept-draft hook accepts the `create` kind added here. Phase 10 reuses `filterLibrary`, the style and machine tables, and the scale definition shape; Phase 11's Save stores the fixed Sheet code.

</code_context>

<specifics>
## Specific Ideas

Sketch 012 is the authority for both places; the 103-entry board is the stand-in for "a few hundred".

</specifics>

<deferred>
## Deferred Ideas

- Equipment-class and calibration-family tables, the balance-model feature, and the serving-equipment decision (Mark's `decision-xx-serving-equipment.md`, not adopted, written for a different stack).
- A smarter ingredient search (accent folding, all-words matching, prefix ranking), if ever wanted, via Sid.
- Letting the maker add machines, styles, scales and problems (todos `todo-custom-machine`, `todo-custom-ice-cream-type`).

### Reviewed Todos (not folded)
- "Build the Recipe book print format", "Write a product brief for phone-based jobs", "Consider a Mise en Place auto-generator": keyword matches only.
- `todo-place-ingredients` and `todo-place-notebook-rail-link` on Mark's List are this phase's own work and close when it is done.

</deferred>

---

*Phase: 9-The library and the stored shapes, plus the two places*
*Context gathered: 2026-10-17*
