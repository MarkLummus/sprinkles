# Phase 1: Read the churned recipe - Context

**Gathered:** 2026-09-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the app shell, the framework-free balance module, the seeded olive oil recipe, and the provisional store seam, so that the churned olive oil recipe (50 g oil, 800 g, churned 2 Aug 2026) reads whole on screen: twelve ingredient rows with grams, % of batch, and step allocation; the method; target bands; authored notes; and six balance figures against their bands with the calculation basis stated and estimated data flagged. Requirements REC1-01, FORM1-01, FORM1-02. Success criteria are in `.planning/ROADMAP.md` Phase 1.

Not in this phase: recording a batch (Phase 2), creating or editing versions and comparison (Phase 3), printing (Phase 4), the ingredient library, import, scaling, storage architecture beyond the provisional seam.

</domain>

<decisions>
## Implementation Decisions

### Ingredient data and which figures must match
- **D-01:** The twelve olive-oil rows are seeded from the old-sprinkles transcription: `~/Documents/projects/old-sprinkles/src/data/library.js` (composition, per-field basis, source, notes) and `src/data/olive-oil.js` (rows, grams, step allocation, targets, equipment, method, authored notes). Data is reused; code is not built on. The seed DB (`~/Downloads/sprinkles-ingredient-seed-db.json`) and its conventions arrive with the library phase, not here.
- **D-02:** On-screen figures must agree with the printed sheet within 0.1: total 799.7 g, fat 18.0%, milkfat 13.0%, olive oil 28% of fat, MSNF 8.5%, sugar solids 13.5%, total solids 40.8%, PAC 24.1, POD 13.0. The fixture checks ranges (±0.1), not exact strings.
- **D-03:** Grams display exactly as printed (370.4 g whole milk, 252.8 g cream). No weighable rounding in this phase; that belongs to preparing a new version for making (Phases 3–4).
- **D-04:** The estimated/unreviewed flag shows in both places: on each affected row (the data column carries the word) and on each figure that rests on it, naming the rows. Same fact, two placements, per the brief's trace-to-contributors interaction.

### Data model and the provisional store
- **D-05:** A recipe version embeds a copy of every row's ingredient coefficients and basis. A version is immutable on its own; a batch snapshot (Phase 2) is the version plus as-made values. — **Reversibility:** costly — moving to library references later means migrating every stored version and changing what "a version" guarantees under D04/D09.
- **D-06:** The provisional store is browser IndexedDB behind a small repository interface, with JSON export and import of the whole store. No server code. — **Reversibility:** reversible — the seam exists so D16's eventual backend replaces the adapter without touching the domain.
- **D-07:** The olive oil recipe ships as seed content and is written into the store as an ordinary record the first time the app opens an empty store. After that it is data like any other recipe.
- **D-08:** The recipe model stays mappable to the Ice Ed export format (`~/Downloads/recipe-Mexican Chocolate v4.json`, SchemaVersion 2: Recipe with Name, Notes, Type, ServingTemperature, Hardness, Overrun, Ingredients[{Name, Amount}], plus an Ingredients coefficient map keyed by name). Field names may differ; every Ice Ed field must have a home so a later import is a converter.

### Target bands
- **D-09:** Bands are authored per recipe and stored on the version. The olive oil version is seeded with the slice's bands: PAC 22–26, POD 12–16, fat 16–20%, MSNF 7.5–10%, total solids 38–42%. Style presets are a later concern for new recipes. — **Reversibility:** costly — moving bands off the version onto a style would migrate stored versions and change what a version records.
- **D-10:** A figure with no authored band (sugar solids in the seed) shows its value with the words "no target set" and draws its rule without a hatched band. Nothing is invented.
- **D-11:** The calculation basis is one small-print note under the formulation block: coefficient set name, "PAC relative to sucrose = 100", "lactose taken as 54.5% of MSNF", and which rows are estimated. Per-figure detail appears on focus through the trace-to-contributors interaction.
- **D-12:** Deviation is worded beneath each rule as "inside 22–26", "1.4 above 26", or "0.6 below 16", in the figure's own unit. Words only; no colour carries the judgment.

### Project skeleton: routing and test runner
- **D-13:** The app opens on a recipe list (one item in Phase 1: name, version line, batch mass) and the recipe page is reached from it. This is the brief's "departing from the list" arrival.
- **D-14:** React Router provides URL-addressable routes for the list and the recipe page now, so Phase 4's print route and Phase 2's batch route are additions, not a retrofit.
- **D-15:** Vitest is the test runner. The sheet fixture (D-02) becomes ordinary tests over the framework-free domain modules, run by `npm test`. — **Reversibility:** reversible.
- **D-16:** The app lives in an `app/` subfolder of this repo (package.json, index.html, src/ under `app/`), keeping code apart from the packet, mockups, and log photos at the root. Consequence: `CLAUDE.md`'s root-layout assumption and its Status section must be updated when the structure lands, and `.claude/CLAUDE.md`'s commands must point at `app/`. — **Reversibility:** reversible — a move plus path updates.

### Carried forward from PROJECT.md and the surface brief (not re-decided here)
- React + Vite + JSX, provisional through this phase; ratify on this phase's real code. TypeScript not adopted.
- Domain math in framework-free modules; the PAC/POD/lactose conventions of the slice's `composition.js` are the Phase 1 engine conventions because they reproduce the sheet; record them as the coefficient set the basis note names.
- The Formulation Cookbook brief fixes the page: book spread, headnote, ingredient table with grams / % of batch / step, method with typed targets, six graduated rules with words, margin advisories citing basis, authored notes labelled authored. No freezing curve, no colour verdicts, light only, print-native. Derived advisories are a Phase 3 requirement (FORM2-02); Phase 1 may render the component slots empty.
- Ingredient handling in milestone 1 stays within the twelve rows.

### Claude's Discretion
- Record identity scheme (ids for recipe, version, ingredient rows), schema-version field, and coefficient-set naming.
- IndexedDB wrapper choice and the repository interface's method set, sized to Phases 1–4.
- How the seed-on-first-run detects an empty store and how export/import are exposed (a simple menu action is enough).
- Component decomposition and CSS approach within the brief's world; exact type faces per the brief's calibration rules.
- Exact wording of the basis note beyond the elements D-11 requires.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product authority and language
- `product-requirements/README.md` — reading order and authority rules; research references on demand only.
- `product-requirements/03-decision-register.md` — accepted D01–D16; D04 (history preserved), D06 (balance is an assessment), D09 (provenance), D11 (language), D12 (open labels), D16 (storage open).
- `product-requirements/04-requirements.md` §REC-01, §FORM-01, §ING-01 — the packet criteria the phase's IDs derive from.
- `product-requirements/05-domain-and-language.md` — core records, data invariants, preferred vocabulary (PAC as freezing behaviour, MSNF wording, sweetness).
- `PRODUCT.md` — Impeccable product record: operating context, binding constraints, explicitly undecided items.

### Delivery record
- `.planning/PROJECT.md` — key decisions (provisional stack, provisional store, data reuse), inspected asset inventory, known data hazards.
- `.planning/REQUIREMENTS.md` — REC1-01, FORM1-01, FORM1-02 text.
- `.planning/ROADMAP.md` Phase 1 — success criteria and milestone constraints.

### Design authority
- `.impeccable/surfaces/route-recipe.md` — the confirmed surface brief: pinned world (black print / blue record), the Formulation Cookbook direction (seed d1a5d80a), page structure, states, interaction, anti-goals, and what a builder must not invent. The direction contract is written into this brief at build start per Impeccable's new-work flow; Phase 1 planning must schedule that.

### Working-case sources (outside the repo; read, do not copy code)
- `/Users/mark/Documents/projects/old-sprinkles/src/data/olive-oil.js` — recipe rows, grams, step allocation, targets, equipment, ten method steps with typed targets, carried-forward and before-you-start notes. Approved for reuse as data.
- `/Users/mark/Documents/projects/old-sprinkles/src/data/library.js` — twelve ingredient records with composition, per-field basis, source, notes. Approved for reuse as data.
- `/Users/mark/Documents/projects/old-sprinkles/src/domain/composition.js` — the engine conventions that reproduce the sheet (lactose 0.545 of MSNF, PAC/POD relative to sucrose 100, lactose PAC 100 and POD 16). Reference for the new framework-free module; reimplement, do not import.
- `/Users/mark/Documents/projects/old-sprinkles/scripts/verify-fixture.mjs` — the thirteen sheet checks; the Phase 1 fixture reproduces them within 0.1.
- `/Users/mark/Downloads/olive-oil-ice-cream-800g_1.md` — the churned version as printed: formula, balance, jar fill, master blend, process, carried-forward notes.
- `/Users/mark/Downloads/recipe-Mexican Chocolate v4.json` — Ice Ed export format the model stays mappable to (D-08).
- `/Users/mark/Downloads/balance_engine.py` and `/Users/mark/Downloads/sprinkles-ingredient-seed-db.json` — later library-phase conventions; read only to avoid designing the model into a corner.

</canonical_refs>

<code_context>
## Existing Code Insights

There is no application code in this repository. `design-explorations/` holds 26 JSX mockups that are design evidence, not implementation, and are not to be built on. Codebase mapping is deferred until real code lands.

### Reusable Assets
- old-sprinkles data files (`olive-oil.js`, `library.js`): the seed content, reused as data (D-01, D-07).
- old-sprinkles `composition.js` and `verify-fixture.mjs`: proven conventions and the check list for the balance module, to be reimplemented in `app/` with Vitest.
- old-sprinkles `src/ui/GraduatedRule.jsx`, `Method.jsx`, `Authored.jsx`: reference for component behaviour the brief keeps (graduated rule with tick and words, typed target chips, authored block). Reference only.

### Established Patterns
- None in this repo. The brief and PROJECT.md establish: framework-free domain modules; a repository seam in front of persistence; every stored record carries a schema version and its coefficient set.

### Integration Points
- New `app/` folder at the repo root with its own package.json (D-16). Root `CLAUDE.md` Status section and `.claude/CLAUDE.md` commands are updated in this phase when the structure lands.
- Phases 2–4 attach to the same store seam and router.

</code_context>

<specifics>
## Specific Ideas

- The screen for the churned recipe should be recognisable as the printed sheet's content: same twelve rows in the same order, the "120 g + 263 g" milk split expressed through the step-allocation column (step 2 + step 3), the ten steps with their targets (85 °C / 2 min gum slurry; 69 °C / 40 min circulator hold; 4 °C 12–24 h age; 25–30% overrun; serve at −11 to −12 °C).
- Version line reads like the sheet header: "50 g oil · 800 g", with the churn date shown once a batch exists (Phase 2), never the print date.
- Fat shows as total with milkfat and added fat beneath it and the added-fat share of fat (28%), as the sheet does.
- Authored notes ("carried forward", "before you start") render apart from anything derived and are labelled authored.
- The basis note names the coefficient set as something like "coefficient set 2026.1 (slice transcription)"; the Phase 1 name is Claude's discretion but must be stable, since batches will cite it.

</specifics>

<deferred>
## Deferred Ideas

- Adopting the seed DB (103 rows, per-100g as-is PAC with lactose inside dairy PAC) and reconciling its conventions with the slice's: the ingredient library phase (ING-01, later milestone).
- Style presets for target bands (gelato / ice cream defaults) for new recipes: later, with new-recipe creation.
- Weighable-gram rounding against the equipment profile: Phases 3–4 (preparing a version for making).
- Freezing curve on screen: not in milestone 1 (Mark left it out of FORM scope).
- Ice Ed import converter: later import milestone (D03).

</deferred>

---

*Phase: 01-read-the-churned-recipe*
*Context gathered: 2026-09-05*
