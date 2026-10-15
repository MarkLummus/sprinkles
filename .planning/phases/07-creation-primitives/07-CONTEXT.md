# Phase 7: Creation primitives - Context

**Gathered:** 2026-10-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Three framework-free functions under `app/src/domain/`, so v2's creation screen has its groundwork: create a recipe with a root version from a name and starting rows (MAKE-01), allocate step keys that are never reused (MAKE-02), and build a version row from a library record (MAKE-03). None touches the store, and no screen calls them yet, so the maker sees no change. The one edit outside the new modules is a guard in `domain/advisories.js` (D-02), so a version with no equipment or process can be shown. The creation UI, the Ingredients place and anything that saves the result are later work.

</domain>

<decisions>
## Implementation Decisions

### The root version
- **D-01:** `createRecipe` follows `createChildVersion`'s pattern: pure, no `crypto`, no `new Date()`; the caller passes the recipe id, the version id and `now`. It takes a name, a version label and starting rows, and returns `{ recipe, version }`. The recipe is `{ id, name, description }` (description `''`; name trimmed as `renamedRecipe` trims it). The version has `parentVersionId`, `parentVersionLabel`, `reason` and `citedBatchId` all `null`, `recipeId` set to the recipe's id, and `createdAt` set to `now`. — **Reversibility:** reversible — a new function with no caller.
- **D-02:** The root version leaves out `equipment`, `process`, `iceEd` and `targets`: none is invented, which follows the seed's rule that an unknown slot stays null rather than taking a made-up midpoint (`olive-oil.js`, D-08). `domain/advisories.js` gets a small guard so `subScaleAdvisory` (reads `equipment.scaleResolutionG` and `.batchesAhead`) and `hydrationAdvisory` (reads `process.pasteuriseC` at its first line) return null when their block is absent; `buildFigures` already tolerates absent `targets`. The researcher finds every other unguarded read of these four fields (Sheet, print, batch snapshots, diff, export) and the plan guards or confirms each; existing tests stay green and a version built by `createRecipe` goes through `buildAdvisories`, `buildFigures` and the Sheet's page code without throwing. — **Reversibility:** reversible — the guards only add skips; a later screen can add the fields and the advisories fire again.
- **D-03:** The version label is a required argument: the maker's own line (like `50 g oil · 800 g`), which must be non-empty because the import check refuses a blank one. `sheetTitle` starts as the recipe name (trimmed), `sheetDescription` as `''`. `coefficientSetId` is `''` and there is no `coefficientSetName`. No figure reads either (each row carries its own coefficients), but both copy into child versions (`createChildVersion`) and the id into batch snapshots, and the import check requires the id to be a string, so `''` passes and propagates as `''`. — **Reversibility:** reversible.
- **D-04:** The remaining fields take their empty values: `method: []`, `authored: { beforeYouStart: [] }`, `declaredAxes: []`, `declaredFlaws: []`, `schemaVersion` the current `VERSION_SCHEMA_VERSION`. The proof for success criterion 1 wraps the result in a store file and runs it through `validateStoreFile` (`ok` true, no errors), and separately asserts the six figures compute for starting rows with weight; the import check alone does not guarantee figures (see D-07 on 0 g). — **Reversibility:** reversible.

### Step keys
- **D-05:** The allocator takes a `method` array and returns the highest `n` over every step in it, removed ones included, plus one; an empty `method` returns 1. It reads `n` by scanning the array, never by indexing with a stored key. It needs no stored counter and no schema change, because removal only sets `removed: true` (`penDraft.js`, the step-removal helper) and a child version copies the whole method. — **Reversibility:** costly — a stored counter later would mean a `VERSION_SCHEMA_VERSION` bump and a lift of every stored version.
- **D-05a:** D-05 holds only while no code removes a step from the array outright. A test pins that: removing a step in the pen's draft leaves it in `method` with `removed: true`, so removing the highest-numbered step does not free its key. The allocator does not read the parent chain and does not count the step numbers that rows' portions name.

### The row builder
- **D-06:** The builder takes a library record `{ id, entry }` (Phase 6 D-02) and clones `record.entry` with `structuredClone`, so the library record's `id` never enters `row.ingredient` and changing the library entry afterwards leaves the row unchanged. The row still has its own `id` (D-07), outside the embedded ingredient. A row built for an ingredient the olive oil seed uses, at the seeded amount, gives the same six balance figures as the seeded row (success criterion 3). — **Reversibility:** costly — v2's creation screen and every stored row read the shape.
- **D-07:** The row's id is an argument, as `createChildVersion` takes an id, so tests stay deterministic. `ingredientName` defaults to the entry's `name`, and an optional name argument overrides it (the seed's short `Graza Drizzle` against the entry's `Graza Drizzle extra virgin olive oil`). The row has `removed: false` and one portion `{ step, grams }` with no `removed` key, as the seed rows have. `step` is an argument that defaults to 1. A negative or non-finite amount is refused as the import check refuses it. An amount of 0 g is accepted, even when every starting row is 0 g (decided with Mark, 2026-10-14): the version then passes the import check but has no weight, so `computeBalance` returns `null` and `buildFigures` returns `[]`. Two tests pin both sides: a version with weight gives six figures, and an all-zero version gives no figures without throwing. The researcher checks that the page and `buildAdvisories` cope with a version that has no weight.
- **D-08:** `createRecipe` starts with `method: []` and its starting rows name step 1 by default, so the first step the maker adds gets key 1 from the allocator and picks up those rows. Until a step 1 exists the rows sit at a step that does not exist yet; whether v2 must create step 1 before it shows ingredients is a later design decision, not a Phase 7 requirement (Mark, 2026-10-14). The starting rows must be non-empty, because the import check refuses a version with none. — **Reversibility:** reversible.

### Claude's Discretion
- File and function names under `app/src/domain/` (one module or several), and where the `VERSION_SCHEMA_VERSION` constant is read from so `domain/` imports no store or framework module.
- Whether `createRecipe` takes the starting rows already built or builds them from `{ record, grams, id }` specs through the row builder; the first lets the row builder stand alone, the second is the shorter call.
- The allocator's supported range for `n`: the import check accepts any finite number, but at `2**53` `n + 1 === n`, so the key would be reused. The plan states the supported range (for example, safe integers) and what the allocator does outside it (throw), and tests the boundary.
- How `createRecipe` refuses a blank name, a blank label, no rows or duplicate row ids (return value or throw), matching the closest existing domain function.
- Plan and wave breakdown, keeping the suite green at every commit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` § Phase 7 — goal and four success criteria
- `.planning/REQUIREMENTS.md` § Creation primitives — MAKE-01 to MAKE-03; § Ingredient library — LIB-01 to LIB-03 (done; the library record shape)
- `.planning/phases/06-the-ingredient-library-in-the-store/06-CONTEXT.md` — D-02, the `{ id, entry }` record the row builder reads

### The shapes these functions must satisfy
- `app/src/store/transfer.js` — `validateStoreFile`, `validateVersion`, `validateRow`, `validatePortion`, `validateStep`: what the import check requires of a version (non-empty `rows`, `portions` with a finite `step`, non-empty `versionLabel`, `method` an array, `authored.beforeYouStart` an array, `declaredAxes` and `declaredFlaws` arrays)
- `app/src/data/olive-oil.js` — `oliveOilVersion`, `oliveOilRecipe`, `embed()`, `VERSION_SCHEMA_VERSION`: the shape a seeded version has, and the seeded row the figures must match
- `app/src/domain/lineage.js` — `createChildVersion` (the `{ id, now }` pattern) and `versionLineUnique`
- `app/src/domain/recipe.js` — `renamedRecipe` (name trimming), `recipeNameMessage`
- `app/src/domain/penDraft.js` — step removal sets `removed: true` and never drops the step (D-05a)
- `app/src/domain/rows.js`, `stepNumbers.js` — `activeSteps`, `activeRows`, `displayNumbers`: the stored step key `n` is its identity
- `app/src/domain/advisories.js` — `buildAdvisories`, `subScaleAdvisory`, `hydrationAdvisory`: the unguarded reads D-02 guards
- `app/src/domain/figures.js`, `composition.js` — `buildFigures`, `computeBalance`: the six figures success criterion 1 and 3 compute

### Conventions
- `.claude/CLAUDE.md` § Conventions — domain modules import no framework, DOM or store; tests run under node
- `.planning/codebase/CONVENTIONS.md`

No external specs beyond the above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createChildVersion(parent, penFields, { id, now })` — the shape of a pure creator with injected id and clock.
- `renamedRecipe` and `recipeNameMessage` — name trimming and the blank-name message.
- `validateStoreFile` — the proof for success criterion 1, called on a store file built around the result.
- `data/olive-oil.js` `oliveOilVersion.rows` and `library` — the fixture for success criterion 3 (olive oil, 40 g, step 8, against `row-03`).
- `domain/id.js` `freshId` — what the caller (v2) will use for ids; the domain functions do not call it.

### Established Patterns
- A step's `n` is its identity (diff pairing, portions, batch `stepChanges`, `uses` lists), and the display number is derived and never stored.
- Rows embed a `structuredClone` of the library entry at authoring time, so a library edit never moves a stored version.
- A removed row, line or step stays in the array with a `removed` flag and is filtered by `activeRows` and `activeSteps`.

### Integration Points
- None yet: v2's creation screen is the first caller. `store/seed.js` and `main.jsx` do not change.
- `domain/advisories.js` is the one existing module this phase edits (D-02).

</code_context>

<specifics>
## Specific Ideas

- The row for success criterion 3 uses the olive oil entry at 40 g and compares against `oliveOilVersion` row `row-03`.
- Step 3 removed from steps 1 to 4 gives 5; removing step 4 instead also gives 5 on the next call, since the removed step stays in the array.

</specifics>

<deferred>
## Deferred Ideas

- A stored high-water counter for step keys — only if a step is ever dropped from the array outright (would need a schema bump and a lift).
- Equipment, process, targets and Ice Ed settings on a new recipe — v2's creation screen decides how the maker sets them.
- The creation screen itself, saving the new recipe through the repository, creating step 1 for the starting rows, and whether it must exist before ingredients are shown — v2.

### Reviewed Todos (not folded)
- Build the Recipe book print format — keyword match only; a new surface, not groundwork.
- Consider a "Mise en Place" auto-generator — new capability, not in this phase.
- Write a product brief for phone-based jobs — design brief, not in this phase.

</deferred>

---

*Phase: 7-Creation primitives*
*Context gathered: 2026-10-14*
