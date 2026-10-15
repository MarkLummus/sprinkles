# Phase 7: Creation primitives - Research

**Researched:** 2026-10-14
**Domain:** framework-free JS domain functions (record construction, key allocation, row construction) over an existing store/validator shape; no new packages
**Confidence:** HIGH (every finding below was read in this session or run in a scratch probe; the three open design calls are flagged `[ASSUMED]` and listed in the Assumptions Log)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `createRecipe` follows `createChildVersion`'s pattern: pure, no `crypto`, no `new Date()`; the caller passes the recipe id, the version id and `now`. It takes a name, a version label and starting rows, and returns `{ recipe, version }`. The recipe is `{ id, name, description }` (description `''`; name trimmed as `renamedRecipe` trims it). The version has `parentVersionId`, `parentVersionLabel`, `reason` and `citedBatchId` all `null`, `recipeId` set to the recipe's id, and `createdAt` set to `now`. — **Reversibility:** reversible — a new function with no caller.
- **D-02:** The root version leaves out `equipment`, `process`, `iceEd` and `targets`: none is invented, which follows the seed's rule that an unknown slot stays null rather than taking a made-up midpoint (`olive-oil.js`, D-08). `domain/advisories.js` gets a small guard so `subScaleAdvisory` (reads `equipment.scaleResolutionG` and `.batchesAhead`) and `hydrationAdvisory` (reads `process.pasteuriseC` at its first line) return null when their block is absent; `buildFigures` already tolerates absent `targets`. The researcher finds every other unguarded read of these four fields (Sheet, print, batch snapshots, diff, export) and the plan guards or confirms each; existing tests stay green and a version built by `createRecipe` goes through `buildAdvisories`, `buildFigures` and the Sheet's page code without throwing. — **Reversibility:** reversible — the guards only add skips; a later screen can add the fields and the advisories fire again.
- **D-03:** The version label is a required argument: the maker's own line (like `50 g oil · 800 g`), which must be non-empty because the import check refuses a blank one. `sheetTitle` starts as the recipe name (trimmed), `sheetDescription` as `''`. `coefficientSetId` is `''` and there is no `coefficientSetName`. No figure reads either (each row carries its own coefficients), but both copy into child versions (`createChildVersion`) and the id into batch snapshots, and the import check requires the id to be a string, so `''` passes and propagates as `''`. — **Reversibility:** reversible.
- **D-04:** The remaining fields take their empty values: `method: []`, `authored: { beforeYouStart: [] }`, `declaredAxes: []`, `declaredFlaws: []`, `schemaVersion` the current `VERSION_SCHEMA_VERSION`. The proof for success criterion 1 wraps the result in a store file and runs it through `validateStoreFile` (`ok` true, no errors), and separately asserts the six figures compute for starting rows with weight; the import check alone does not guarantee figures (see D-07 on 0 g). — **Reversibility:** reversible.
- **D-05:** The allocator takes a `method` array and returns the highest `n` over every step in it, removed ones included, plus one; an empty `method` returns 1. It reads `n` by scanning the array, never by indexing with a stored key. It needs no stored counter and no schema change, because removal only sets `removed: true` (`penDraft.js`, the step-removal helper) and a child version copies the whole method. — **Reversibility:** costly — a stored counter later would mean a `VERSION_SCHEMA_VERSION` bump and a lift of every stored version.
- **D-05a:** D-05 holds only while no code removes a step from the array outright. A test pins that: removing a step in the pen's draft leaves it in `method` with `removed: true`, so removing the highest-numbered step does not free its key. The allocator does not read the parent chain and does not count the step numbers that rows' portions name.
- **D-06:** The builder takes a library record `{ id, entry }` (Phase 6 D-02) and clones `record.entry` with `structuredClone`, so the library record's `id` never enters `row.ingredient` and changing the library entry afterwards leaves the row unchanged. The row still has its own `id` (D-07), outside the embedded ingredient. A row built for an ingredient the olive oil seed uses, at the seeded amount, gives the same six balance figures as the seeded row (success criterion 3). — **Reversibility:** costly — v2's creation screen and every stored row read the shape.
- **D-07:** The row's id is an argument, as `createChildVersion` takes an id, so tests stay deterministic. `ingredientName` defaults to the entry's `name`, and an optional name argument overrides it (the seed's short `Graza Drizzle` against the entry's `Graza Drizzle extra virgin olive oil`). The row has `removed: false` and one portion `{ step, grams }` with no `removed` key, as the seed rows have. `step` is an argument that defaults to 1. A negative or non-finite amount is refused as the import check refuses it. An amount of 0 g is accepted, even when every starting row is 0 g (decided with Mark, 2026-10-14): the version then passes the import check but has no weight, so `computeBalance` returns `null` and `buildFigures` returns `[]`. Two tests pin both sides: a version with weight gives six figures, and an all-zero version gives no figures without throwing. The researcher checks that the page and `buildAdvisories` cope with a version that has no weight.
- **D-08:** `createRecipe` starts with `method: []` and its starting rows name step 1 by default, so the first step the maker adds gets key 1 from the allocator and picks up those rows. Until a step 1 exists the rows sit at a step that does not exist yet; whether v2 must create step 1 before it shows ingredients is a later design decision, not a Phase 7 requirement (Mark, 2026-10-14). The starting rows must be non-empty, because the import check refuses a version with none. — **Reversibility:** reversible.

### Claude's Discretion

- File and function names under `app/src/domain/` (one module or several), and where the `VERSION_SCHEMA_VERSION` constant is read from so `domain/` imports no store or framework module.
- Whether `createRecipe` takes the starting rows already built or builds them from `{ record, grams, id }` specs through the row builder; the first lets the row builder stand alone, the second is the shorter call.
- The allocator's supported range for `n`: the import check accepts any finite number, but at `2**53` `n + 1 === n`, so the key would be reused. The plan states the supported range (for example, safe integers) and what the allocator does outside it (throw), and tests the boundary.
- How `createRecipe` refuses a blank name, a blank label, no rows or duplicate row ids (return value or throw), matching the closest existing domain function.
- Plan and wave breakdown, keeping the suite green at every commit.

### Deferred Ideas (OUT OF SCOPE)

- A stored high-water counter for step keys — only if a step is ever dropped from the array outright (would need a schema bump and a lift).
- Equipment, process, targets and Ice Ed settings on a new recipe — v2's creation screen decides how the maker sets them.
- The creation screen itself, saving the new recipe through the repository, creating step 1 for the starting rows, and whether it must exist before ingredients are shown — v2.

Reviewed todos (not folded): Build the Recipe book print format; Consider a "Mise en Place" auto-generator; Write a product brief for phone-based jobs.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAKE-01 | A framework-free function creates a recipe with a root version (no parent) from a name and starting rows, without touching the store. | Exact version/recipe shape and every validator that runs on it (Q4); the four absent fields and every read of them (Q1); the no-weight and `method: []` behaviour (Q2); refusal convention (Q6). |
| MAKE-02 | A step-key allocator hands out step numbers that are never reused, including after a step is removed. | Removal never drops a step: `togglePenStepRemoved` (Q7); numeric boundary at `Number.MAX_SAFE_INTEGER` (Q5). |
| MAKE-03 | A row-from-ingredient builder makes a version row from a library ingredient, embedding a `structuredClone` of its coefficients and basis. | `row-03` deep-equals a built row (Q3); the library record shape `{ id, entry }`; the row validators (Q4). |
</phase_requirements>

## Summary

Phase 7 is three small pure functions plus one guard, all inside `app/src/domain/`. Nothing is installed; there is no screen, store, or network work. The research found that the whole existing app already copes with almost everything D-01 to D-08 produce. The seeded recipe **Standard Base v1** is already a version with `method: []`, every row at `step: 1`, and no `targets` key (`app/src/data/standard-base.js:30-62`), so the page, the table's "Unallocated" grouping, the Sheet, and the Sheet code already handle a method-less version.

The only code that breaks on the new shape is in **one file**: `domain/advisories.js`. Two functions dereference `version.equipment` (line 47) and `version.process` (line 119) with no guard, and `buildAdvisories` throws a `TypeError` the moment a version has weight but no `equipment` (reproduced in a scratch probe, below). Every other consumer of `equipment`, `process`, `iceEd`, `targets` and `coefficientSetName` either does not read them at all (all of `ui/`, `store/`, `batch.js` snapshots), tolerates absence already (`figures.js`, `diff.js`, `sheetCode.js`), or merely copies them (`lineage.js`). There is no unguarded read to fix beyond the two the CONTEXT already names.

Two things the CONTEXT does not say. First, **no function in `app/src/domain/` throws anywhere** (grep: zero `throw` in `domain/`); refusal is by returned value (`recipeNameMessage` returns a message or `null`). The CONTEXT's suggested "throw" for the allocator would be the first throw in the layer, and is still the better choice for these three constructors, for the reason given in Q6. Second, the criterion-1 `validateStoreFile` proof belongs in `app/src/store/`, not `app/src/domain/`, because domain test files declare they import no store (`lineage.test.js:1-3`).

**Primary recommendation:** Add three new domain modules (`stepKeys.js`, `versionRow.js`, `newRecipe.js`) with sibling `.test.js` files, take prebuilt rows in `createRecipe` so the three requirements are independent plans, add two unexported early-return guards to `advisories.js`, and put the `validateStoreFile` proof in a new `store/` test.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Build a recipe record + root version | Domain (`app/src/domain/`) | — | Pure, injected id/clock, no store (D-01); same tier as `createChildVersion` in `lineage.js`. |
| Allocate a step key | Domain | — | Reads only a `method` array (D-05); sits beside `stepNumbers.js`, which already documents key vs display number. |
| Build a row from a library record | Domain | — | Pure clone and shape; the library record is passed in, never fetched (D-06). |
| Validate the result as a store file | Store (`store/transfer.js`) | — | `validateStoreFile` is the only gate; it is called from a test, not from the new functions. |
| Skip advisories whose input block is absent | Domain (`advisories.js`) | — | The two reads live there (D-02). |
| Persist / screen / ids / clock | Out of scope (v2) | — | Deferred. The caller supplies `id`s (`domain/id.js` `freshId`) and `now`. |

## Standard Stack

No new libraries. The phase uses what the repo has.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vitest | 5.0.0 | Unit tests, `node` environment by default | `app/package.json` devDependency; `app/vitest.config.js` sets `environment: 'node'` [VERIFIED: app/package.json, app/vitest.config.js] |
| Node | v24.21.0 | Runs tests; provides global `structuredClone` | `node --version` this session [VERIFIED: shell] |

### Supporting
None. `structuredClone` is a platform global already used in `data/olive-oil.js:57`, `lineage.js:143`, `batch.js:187`.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New modules | Add to `rows.js` / `recipe.js` / `lineage.js` | Fewer files, but edits three existing hot modules and makes the three requirements share files (merge conflicts across parallel worktrees; `config.json` has `use_worktrees: true`). New files keep the diff additive. |
| Prebuilt rows into `createRecipe` | `{ record, grams, id }` specs built inside | Shorter call for v2, but couples MAKE-01 to MAKE-03 and forces wave order. Prebuilt keeps all three independent. |

**Installation:** none.

**Version verification:** no packages are added, so there is nothing to look up on a registry.

## Package Legitimacy Audit

Not applicable: this phase installs no external packages.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
caller (v2 creation screen, later)            tests (this phase)
   | supplies: recipeId, versionId, now,          |
   | name, versionLabel, library records          |
   v                                              v
 versionRow.js  ---- rowFromLibraryRecord(record, {id, grams, step?, ingredientName?})
   |  structuredClone(record.entry)  -> row { id, ingredientName, ingredient, portions:[{step,grams}], removed:false }
   v
 newRecipe.js   ---- createRecipe({name, versionLabel, rows}, {recipeId, versionId, now})
   |  refuses blank name / blank label / no rows / duplicate row ids
   v
 { recipe: {id,name,description}, version: {... method:[], no equipment/process/iceEd/targets ...} }
   |
   +--> stepKeys.js: nextStepKey(version.method) -> highest n over ALL steps (removed too) + 1   (1 when empty)
   |
   +--> existing readers, unchanged:
          buildFigures(version)   -> 6 figures with weight, [] with none
          buildAdvisories(version)-> [] with none; with weight needs the D-02 guards
          sheetCode(version)      -> 'XXXX-XXXX' (portion step reads null: no step 1 yet)
          validateStoreFile({app,schemaVersion,versions,batches,recipes,library}) -> {ok:true,errors:[]}
```

### Recommended Project Structure
```
app/src/domain/
├── stepKeys.js         # nextStepKey(method)            (MAKE-02)
├── stepKeys.test.js
├── versionRow.js       # rowFromLibraryRecord(...)      (MAKE-03)
├── versionRow.test.js
├── newRecipe.js        # createRecipe(...)              (MAKE-01)
├── newRecipe.test.js
├── advisories.js       # two guards (D-02)              (edited)
└── advisories.test.js  # absent-block tests             (edited)
app/src/store/
└── creation-roundtrip.test.js   # validateStoreFile proof for criterion 1 (new)
app/src/domain/penDraft.test.js  # D-05a pin, extend the togglePenStepRemoved describe (edited)
```
Names are the recommendation (the CONTEXT leaves names to Claude's discretion). Existing naming is camelCase `.js` with a sibling `.test.js` (`stepNumbers.js`, `lineage.js`, `recipe.js`) [VERIFIED: ls app/src/domain].

### Pattern 1: pure creator with injected id and clock
**What:** `createChildVersion(parent, penFields, { id, now })` returns a record and never reaches for `crypto` or `new Date()`.
**When to use:** `createRecipe`, and the row builder's `id`.
**Example:**
```javascript
// Source: app/src/domain/lineage.js:124-149 (read this session)
export function createChildVersion(parent, penFields, { id, now }) {
  return {
    schemaVersion: parent.schemaVersion,
    id,
    recipeId: parent.recipeId,
    parentVersionId: parent.id,
    parentVersionLabel: parent.versionLabel,
    createdAt: now,
    versionLabel: penFields.versionLabel,
    coefficientSetId: parent.coefficientSetId,
    coefficientSetName: parent.coefficientSetName,
    targets: parent.targets,
    equipment: parent.equipment,
    process: parent.process,
    iceEd: parent.iceEd,
    declaredAxes: parent.declaredAxes,
    declaredFlaws: parent.declaredFlaws,
    reason: penFields.reason,
    citedBatchId: penFields.citedBatchId,
    rows: structuredClone(penFields.rows),
    method: structuredClone(penFields.method),
    sheetTitle: penFields.sheetTitle,
    sheetDescription: penFields.sheetDescription,
    authored: structuredClone(penFields.authored),
  };
}
```

### Pattern 2: the seeded row and recipe shapes the new code must match
```javascript
// Source: app/src/data/olive-oil.js:44-49, 54-60, 62-72, 83 (read this session)
export const oliveOilRecipe = { id: 'olive-oil-ice-cream', name: '...', description: '...' };

function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}

// version head
  schemaVersion: VERSION_SCHEMA_VERSION,
  id: 'olive-oil-ice-cream-v1',
  recipeId: 'olive-oil-ice-cream',
  parentVersionId: null,
  parentVersionLabel: null,
  reason: null,
  citedBatchId: null,
  createdAt: SEED_CREATED_AT,
  versionLabel: '50 g oil · 800 g',
  coefficientSetId: '2026.1-slice-transcription',
  coefficientSetName: 'coefficient set 2026.1 (slice transcription)',

// row-03
  { id: 'row-03', ...embed('Graza Drizzle', library.oliveOil, { portions: [{ step: 8, grams: 40 }], removed: false }) },
```
The tail fields `declaredAxes: ['Body', 'Oil']`, `declaredFlaws: ['Bitter']`, `method: [ ... ]`, `authored` are at `olive-oil.js:120-121`, `125`. Standard Base v1 shows the empty forms the root version takes: `declaredAxes: []`, `declaredFlaws: []`, `method: []`, `authored: { beforeYouStart: [] }` (`standard-base.js:57-61`).

### Skeleton (illustrative, every field is in the quotes above or in Q4's validator quotes)
```javascript
// newRecipe.js  (shape only; refusal style per Q6)
export function createRecipe({ name, versionLabel, rows }, { recipeId, versionId, now }) {
  // refuse: name.trim()==='' ; versionLabel.trim()==='' ; rows empty ; duplicate row ids
  const recipeName = name.trim();
  return {
    recipe: { id: recipeId, name: recipeName, description: '' },
    version: {
      schemaVersion: SCHEMA, id: versionId, recipeId,
      parentVersionId: null, parentVersionLabel: null, reason: null, citedBatchId: null,
      createdAt: now, versionLabel,
      coefficientSetId: '',
      sheetTitle: recipeName, sheetDescription: '',
      rows: structuredClone(rows),
      method: [], authored: { beforeYouStart: [] },
      declaredAxes: [], declaredFlaws: [],
      // no equipment, process, iceEd, targets, coefficientSetName  (D-02, D-03)
    },
  };
}
```

### Anti-Patterns to Avoid
- **`method.length + 1` for the next key.** Steps 1, 2, 4 give length 3, so 4, which is already held. Use the highest `n`.
- **`Math.max(...method.map(s => s.n))`.** Spread breaks on very large arrays and returns `-Infinity` on `[]`. Scan with a loop starting from 0.
- **Reading `activeSteps(version)` in the allocator.** It filters `removed`, which frees the removed key (`rows.js:87`: `return version.method.filter((step) => !step.removed);`).
- **Indexing by a stored key.** D-05 says scan the array (the file's own discipline; `rows.js:14-19` `isStepRemoved` scans).
- **Exporting the new guards from `advisories.js`.** `advisories.test.js:37-40` asserts the module exports exactly `['buildAdvisories']`.
- **Putting the `validateStoreFile` proof in a `domain/` test.** Domain test files state they import no store (`lineage.test.js:1-3`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deep copy of a library entry | Field-by-field copy | `structuredClone(record.entry)` | Same call `embed()` uses (`olive-oil.js:57`); copies nested `composition`/`basis`/`source` so a later library edit cannot move the row. |
| Trimming a recipe name | New trim helper | `name.trim()` as `renamedRecipe` does (`recipe.js:25`) | One rule. |
| Blank-name message for v2's form | New message | `recipeNameMessage` (`recipe.js:13-15`) | Already returns `RECIPE_NAME_REQUIRED` or `null`; v2 calls it before `createRecipe`. |
| Import validity | A parallel validator in `domain/` | `validateStoreFile` called from a test | `transfer.js` is the one gate; do not copy its rules into the domain. |

**Key insight:** every one of these shapes already exists in seeded data and in `transfer.js`; the phase's value is reproducing them exactly, and a test that runs the real validator catches drift.

## Runtime State Inventory

Not a rename/refactor/migration phase. Omitted.

## Q1. Every read of `equipment`, `process`, `iceEd`, `targets`, `coefficientSetName`

Method: `grep -rnE "\b(equipment|iceEd|targets|coefficientSetName|coefficientSetId)\b"` and `grep -rnE "\bprocess\b"` over `app/src` `*.js`/`*.jsx`, excluding tests and `data/`, then each hit read in context. Also searched for `Object.keys/entries/values(version…)` and `JSON.stringify(version…)`: none outside `transfer.js` error messages [VERIFIED: grep].

### Reads of the version (the four fields)

| Field | File:line | What it does | Absent version | Guard needed |
|-------|-----------|--------------|----------------|--------------|
| `equipment` | `domain/advisories.js:177` call `subScaleAdvisory(rows, version.equipment)`; reads at `:47` `const under = rows.filter((row) => rowGrams(row) > 0 && rowGrams(row) < equipment.scaleResolutionG);`, `:53` `equipment.batchesAhead`, `:64` `equipment.scale`, `:68` `equipment.scale`, `equipment.scaleResolutionG` | Dereferences the block | **THROWS** `TypeError: Cannot read properties of undefined (reading 'scaleResolutionG')` when rows is non-empty (reproduced) | **Yes.** Early `if (!equipment) return null;` at the top of `subScaleAdvisory`. |
| `process` | `domain/advisories.js:179` call `hydrationAdvisory(rows, steps, version.process, stepNumbers)`; read at `:119` `const hold = process.pasteuriseC;` | First line of the function | **THROWS** on any version with weight | **Yes.** Early `if (!process) return null;` before line 119. |
| `targets` | `domain/advisories.js:180` `estimatedExposureAdvisory(rows, version.targets)` → `:147` `buildFigures({ rows, targets })` → `figures.js:144` `const targets = version.targets ?? {};` | Already tolerant | OK | None. |
| `targets` | `domain/diff.js:310` `targetsChanged: !bandsEqual(current.targets, baseline.targets)`; `bandsEqual` `:28-29` `const aTargets = a ?? {};` | Already tolerant | OK | None. |
| `targets` | `domain/lineage.js:135` `targets: parent.targets` | Copy only | Child gets an own key whose value is `undefined` | None (see note). |
| `equipment`, `process`, `iceEd` | `domain/lineage.js:136-138` | Copy only | Same | None. |
| `coefficientSetName` | `domain/lineage.js:134` | Copy only; the only read in `app/src` outside `data/` | Same | None. |
| `iceEd` | none other | No read anywhere in `app/src` outside `data/` and `lineage.js:138` | OK | None. |

`step.targets` hits (`Method.jsx`, `PrintSheetPages.jsx:215`, `sheetCode.js:71`, `diff.js`, `penDraft.js`, `draft.js:183`, `transfer.js:156`) read a **step's** `targets` array, not `version.targets`; unaffected by the root version's `method: []`.

**Note on the copy:** a child of a root version carries own keys `coefficientSetName`, `targets`, `equipment`, `process`, `iceEd` set to `undefined` (probe output: `createChild -> ["coefficientSetName","targets","equipment","process","iceEd"]`). IndexedDB structured-clone stores them; JSON export drops them; `validateVersion` does not look at them. Harmless, and the reason a later screen "adds the fields" cleanly.

### Reads of a batch's snapshot (distinct from the version)

`createBatch` builds the snapshot from exactly these version fields [VERIFIED: app/src/domain/batch.js:184-190]:
```javascript
    snapshot: {
      coefficientSetId: version.coefficientSetId,
      versionLabel: version.versionLabel,
      rows: structuredClone(version.rows),
      declaredAxes: structuredClone(version.declaredAxes),
      declaredFlaws: structuredClone(version.declaredFlaws ?? []),
    },
```
None of `equipment`, `process`, `iceEd`, `targets`, `coefficientSetName` enters a snapshot, so nothing downstream of a snapshot can read them. `coefficientSetId` is read here and must be a string (`transfer.js:413`: `if (typeof batch.snapshot.coefficientSetId !== 'string')`), so D-03's `''` passes and propagates. Probe: `createBatch` on a root-shaped version returns snapshot keys `["coefficientSetId","versionLabel","rows","declaredAxes","declaredFlaws"]`. `batch.js:277` mentions `version.targets, version.process, version.iceEd` only in a comment ("never").

### Other consumers confirmed clean
- `ui/` reads these `version.` properties only: `recipeId, id, sheetTitle, parentVersionId, rows, method, sheetDescription, citedBatchId, reason, parentVersionLabel, declaredFlaws, createdAt, authored, versionLabel, declaredAxes` (grep of `version.<prop>` over `ui/`, none of the four) [VERIFIED: grep].
- `store/` (`repository.js`, `db.js`, `seed.js`, `transfer.js`): the only hits are `coefficientSetId` checks in `transfer.js:413, 495` [VERIFIED: grep].
- `domain/sheetCode.js` header (`:26-31`) states the code excludes "the targets bands, equipment, process"; `printedContent` reads none of them.
- Export/import: `exportStore` / `importStore` pass versions through verbatim (`transfer.js:617-700`); no field-by-field copy.
- Print/Sheet: `PrintSheetPages.jsx` `sheetBlocks` reads `version.method`, `version.authored.beforeYouStart`, `version.sheetTitle` (`:41, :58, :84`), all present on a root version.

### Stale comment (do not edit; mention only)
`data/mexican-chocolate.js:39-44` says `advisories.js` "dereferences version.equipment unconditionally, so an absent value would throw". After D-02 that sentence is no longer true. Per CLAUDE.md "Surgical changes", leave it and flag it in the summary.

### Behaviour the guards must preserve
- `buildAdvisories` already returns `[]` **before** touching `equipment` when there is no weight (`advisories.js:171-172`: `const balance = computeBalance(rows); if (!balance) return [];`). So the guards matter only for a version with weight.
- With both blocks absent, the other two advisories still run: probe on an olive oil clone with all four fields deleted threw before the guards; with the guards the expected keys are `['ultra-pasteurised', 'estimated']` (the olive oil clone with all four present gives `["sub-scale","ultra-pasteurised","hydration","estimated"]`).
- Pre-existing edge, not in scope: `process: { pasteuriseC: null }` makes `hydrationC > null` true. Seeds use `{}` (undefined), which is safe. A guard of `process?.pasteuriseC == null` would also cover it; D-02 asks only for the absent block, so `if (!process) return null;` is the minimum.

## Q2. Does the page cope with no weight, and with `method: []` while rows name step 1?

### No weight (all starting rows 0 g)
Probe (scratch script in the session scratchpad importing the real domain modules):
```
zero computeBalance -> null
zero buildFigures -> []
zero buildAdvisories -> []
validate zero -> true      (validateStoreFile ok)
sheetCode zero -> "YK4E-8J7E"
```
| Consumer | Behaviour on no weight | Evidence |
|----------|-----------------------|----------|
| `computeBalance` | returns `null` when `mass === 0` | `composition.js:24` |
| `buildFigures` | returns `[]` | `figures.js:141-142`; probe |
| `buildAdvisories` | returns `[]` before reading equipment | `advisories.js:171-172`; probe |
| `FormulationNote` | `if (figures.length === 0) return null;` | `ui/FormulationNote.jsx:10` |
| `BasisNote` | `if (figures.length === 0) return null;` | `ui/BasisNote.jsx:17` |
| `DerivedAdvisories` | `if (advisories.length === 0) return null;` | `ui/DerivedAdvisories.jsx:27` |
| `RecipePage` | `figures.find(...) ?? null`; `markedRowIds = focusedFigure?.contributorRowIds ?? []` | `RecipePage.jsx:802-804` |
| `IngredientTable` | `baselineMass = baselineBalance ? baselineBalance.mass : 0`; shares through `formatShareOfBatch`, which returns `'—'` for `!(mass > 0)`; `formatGrams(0)` is `'0.0 g'` | `IngredientTable.jsx:490-491`; `composition.js:80-85` |
| `PrintSheetPages` | `totalText: formatGrams(mass)` with `mass = balance ? balance.mass : 0`; `wholePlan` sets `balance: blocks.figures.length > 0 ? {...} : null`; `layPages` with `gauges=[]` sets `hasBalance` false | `PrintSheetPages.jsx:49-50, 80, 329`; `sheetPages.js:67` |
| `buildDiff` | `activeMass` returns 0 for null balance; figures zip over `[]` | `diff.js:13-16, 282-293` |

Nothing throws. The page shows an empty Balance and a `0.0 g` total (not a finding to fix, only to know).

### `method: []` with rows naming step 1
The existing seed already does this: **Standard Base v1** has `method: []` and every row `portions: [{ step: 1, grams: ... }]` and no `targets` key (`standard-base.js:30-62`), and `RecipePage.beforeYouStart.test.jsx` mounts `standardBaseV2` (same shape) in jsdom [VERIFIED: grep]. Mechanism, read this session:
- `groupPortionsByStep` (`IngredientTable.jsx:36-79`): `isStepRemoved([], 1)` is false; `displayNumberOf(map, 1)` is `null`, so the entry goes to the trailing `unallocated` group; `step.leadIn` is only read when the step exists (`:46`).
- `showStepHeads = !(groups.length === 1 && groups[0].kind === 'unallocated')` (`:556`) hides the lone "Unallocated" head; `PrintSheetPages.jsx:54` does the same.
- `showsMethodRegion({ mode, steps })` returns `mode === 'developing' || steps.length > 0` (`Method.jsx:519-521`), so the Instructions section is hidden in reading mode with no steps.
- `sheetCode` / `printedContent`: `displayNumberOf(numbers, portion.step)` is `null`, so each portion prints `step: null`; probe: `"portions":[{"step":null,"grams":"40"}]`, code `98AV-FJQ4`, no throw (`sheetCode.js:61-64`).
- Pen: `penDraftFromVersion` → `penDraftVersion` → `isPenDraftDirty` → `buildDiff` ran in the probe without error (`[false, 6]`).
- `sheetPages.js` (`layPages`) takes only measured heights; it reads no version field.

**Caveat for v2 (not Phase 7):** once the maker adds a step through a future add-step control, `validateStep` requires a non-empty `leadIn` and `instruction` (`transfer.js:150-155`), so v2's add-step must supply both.

## Q3. The olive oil fixture for success criterion 3

Source rows [VERIFIED: app/src/data/olive-oil.js:83]:
`{ id: 'row-03', ...embed('Graza Drizzle', library.oliveOil, { portions: [{ step: 8, grams: 40 }], removed: false }) },`
Library entry [VERIFIED: app/src/data/library.js:30-37]: key `oliveOil`, `name: 'Graza Drizzle extra virgin olive oil'`, `category: 'fat'`, `composition: { fat: 1 }`, `basis: { fat: 'stated' }`, `source: { fat: 'label' }`, `note: 'Liquid at serving temperature, so it cannot join the fat crystal network that stabilises air cells.'`.

Library record shape [VERIFIED: .planning/phases/06-the-ingredient-library-in-the-store/06-CONTEXT.md D-02, `store/seed.js:22`]: `Object.entries(library).map(([id, entry]) => ({ id, entry }))`, so the fixture record is `{ id: 'oliveOil', entry: library.oliveOil }`.

**Probe result:** a row built as `{ id: 'row-03', ingredientName: 'Graza Drizzle', ingredient: structuredClone(library.oliveOil), portions: [{ step: 8, grams: 40 }], removed: false }` passes `assert.deepStrictEqual` against `oliveOilVersion.rows[2]`, and `buildFigures({ rows: [built] })` deep-equals `buildFigures({ rows: [oliveOilVersion.rows[2]] })` (values `pac 0, pod 0, fat 100, msnf 0, sugar 0, solids 100`).

So the strongest assertion is available and passes: **the built row `toEqual(oliveOilVersion.rows[2])`**. What the criterion needs, as three tests:
1. `expect(row).toEqual(oliveOilVersion.rows[2])` with `id: 'row-03'`, `ingredientName: 'Graza Drizzle'`, `step: 8`, `grams: 40`.
2. Figures: `buildFigures(versionWithBuiltRowSwappedIn)` `toEqual` `buildFigures(oliveOilVersion)` (swap into `structuredClone(oliveOilVersion)` at index 2), and the single-row form. Pass the same id `'row-03'`, because each figure carries `contributorRowIds` (`figures.js:163`) and the ids would otherwise differ.
3. Independence: build, then mutate `record.entry.composition.fat` and `record.entry.basis.fat`; the row's `ingredient.composition.fat` stays `1` and `basis.fat` stays `'stated'`. Also `expect(Object.hasOwn(row.ingredient, 'id')).toBe(false)` and `expect(row.ingredient).not.toBe(record.entry)`; and the record is unchanged after the call.

**Test shape conventions** [VERIFIED: read this session]:
- Default `environment: 'node'` (`app/vitest.config.js`); a domain test has no `@vitest-environment` docblock, and `RecipePage.shell.test.js:132-137` asserts that for `penDraft.test.js` and `recordDraft.test.js`.
- Imports: `import { describe, it, expect } from 'vitest';`, the module under test as `./x.js`, fixtures from `'../data/olive-oil.js'` and `'../data/library.js'` (`lineage.test.js:5-20`, `advisories.test.js:5-7`).
- Fixtures: `structuredClone(oliveOilVersion)` per test (`advisories.test.js:11-13`), edited in place; `lineage.test.js:22-29` builds small ad-hoc records with `makeVersion(overrides)`.
- Header comment names the suite and states "Runs under Vitest's default node environment — imports no store, no component, and no framework" (`lineage.test.js:1-3`, `advisories.test.js:1-4`).
- `penDraft.test.js` has a source-text purity check: `readFileSync(new URL('./penDraft.js', import.meta.url), 'utf8')` with comments stripped, then `expect(source).not.toMatch(/^(let|var) /m)` (`:583-591`). The same technique can pin that the three new modules import only sibling domain modules (the regex `^\.\/[\w.-]+\.js$` used at `RecipePage.shell.test.js:124-129`).

## Q4. How a store file is shaped, and which validators run

Store file [VERIFIED: app/src/store/transfer.js:28, 562-605]:
```javascript
export const STORE_SCHEMA_VERSION = 8;
...
  if (parsed.app !== 'sprinkles') {
...
  if (!Array.isArray(parsed.versions)) {
...
  if (!Array.isArray(parsed.batches)) {
...
  if (!Array.isArray(parsed.recipes)) {
...
  if (!Array.isArray(parsed.library)) {
```
So the wrapper is `{ app: 'sprinkles', schemaVersion: STORE_SCHEMA_VERSION, versions: [version], batches: [], recipes: [recipe], library: [] }`. `exportedAt` is written by `exportStore` (`:622`) but not checked. Import `STORE_SCHEMA_VERSION` from `transfer.js` rather than writing `8`. `transfer.test.js:170-210` `makeStoreFile` builds the same wrapper with `exportedAt` included; either is accepted. Probe: wrapping a root-shaped version gives `{"ok":true,"errors":[]}`.

`validateVersion` (`transfer.js:488-543`) checks exactly:
- `id`, `recipeId` non-empty strings (`:493-494`); `coefficientSetId` is a string (`:495`, `''` passes);
- `rows` a non-empty array, each through `validateRow` (`:496-500`);
- `method` an array, each element through `validateStep` (`:501-505`; `[]` runs no step checks);
- `authored` a plain object with `beforeYouStart` an array (`:506-512`);
- `parentVersionId`, `parentVersionLabel`, `reason`, `citedBatchId` each a string or `null` (`:517-521`);
- `createdAt` a non-empty string (`:522-524`);
- `declaredAxes` array (≤2, unique, names in the declared set), `declaredFlaws` array (≤2, unique, non-empty strings) (`:525-526`, `:342-382`);
- `versionLabel` non-empty string (`:534`); `sheetTitle`, `sheetDescription` strings (`:537-542`).

It does **not** check `schemaVersion`, `targets`, `equipment`, `process`, `iceEd`, `coefficientSetName`, row-id uniqueness, or step-`n` uniqueness. So absent equipment/process/iceEd/targets and `method: []` are all accepted. Corroboration: `transfer.test.js:297` asserts `validateStoreFile(makeStoreFile())` is `{ ok: true, errors: [] }` on a `makeVersion()` fixture (`:72-102`) that has none of the four fields and `method: []`.

`validateRow` (`transfer.js:97-124`): `id` non-empty string and not in `UNSAFE_KEYS` (`'__proto__'`, `'constructor'`, `'prototype'`, `:14`); `ingredientName` a string (empty is accepted); `portions` a non-empty array; `ingredient.composition` a plain object of finite numbers; `removed` a boolean.
`validatePortion` (`:80-95`): `grams` finite and `>= 0`; `step` finite; `removed` absent or boolean.
`validateRecipe` (`:192-204`): `id` non-empty string, `name` string, `description` string.

`importStore` also requires a version's `recipeId` to resolve to a recipe in the file or store (`:670-689`) and a non-null `parentVersionId` to resolve (`:661-667`); a root version has `parentVersionId: null`, so only the recipe gate applies, and the wrapper's `recipes: [recipe]` satisfies it when `version.recipeId === recipe.id` (assert that in the test).

**One gap between the app and the import check (matters for the blank-label refusal):** the import check accepts a whitespace-only `versionLabel` (`isNonEmptyString` tests `length > 0`, `:43-45`), but the app's own save gate refuses it: `lineage.js:262` `if (penFields.versionLabel.trim() === '') return 'Enter a version.';`. Refuse on `trim() === ''`, not on `length === 0`.

## Q5. The allocator's numeric boundary

`validateStep` accepts any finite `n` (`transfer.js:147-149`). Numbers verified in Node v24.21.0 this session:
```
MAX_SAFE_INTEGER = 9007199254740991
MAX_SAFE_INTEGER + 1 = 9007199254740992        (representable, distinct)
2**53 + 1 === 2**53                            true   (the reuse bug)
(MAX_SAFE_INTEGER + 1) === (MAX_SAFE_INTEGER + 2)  true
```
So `highest = 2**53 - 1` returns `2**53` (fine), but the **next** call sees `highest = 2**53` and returns `2**53` again: a reused key. The safe line is therefore: the result must itself be a safe integer.

**Recommendation:** supported range is "every step's `n` is a safe integer, and the result `highest + 1` is a safe integer" (i.e. `highest <= Number.MAX_SAFE_INTEGER - 1`). Outside it, **throw a `RangeError`** with a plain message. Tests at the boundary:
- `n = MAX_SAFE_INTEGER - 1` → returns `MAX_SAFE_INTEGER`;
- `n = MAX_SAFE_INTEGER` → throws (result would be `2**53`, the next call would repeat it);
- `n = 2**53` → throws;
- a fractional `n` (e.g. `2.5`) → throws (it is outside "safe integer"; seeded keys are integers `1..10`, `olive-oil.js:25-36`).
Start the running maximum at `0` so a method holding only `0` or negative keys still yields `1` (never reuses, and the first key is 1). `Infinity`/`NaN` cannot reach it from a validated store (`isFiniteNumber`), and fail the safe-integer check if hand-built.

Why throw here rather than return a value: see Q6. This is the case where a returned value would be wrong silently (a reused key corrupts diff pairing, `uses`, and `stepChanges`; `stepNumbers.js:1-12`), and the condition is unreachable in practice, so a loud failure costs nothing.

## Q6. How domain functions refuse input; where the schema constant lives

### Convention found
`grep -rn "throw \|new Error\|RangeError\|TypeError" domain/` returns **no hits** (the only repo hits are in `store/repository.js:119,150,178,206` rethrows and a comment in `data/mexican-chocolate.js:43`). Domain functions refuse by **returned value**, and construction is separated from the check:

| Function | Refusal | Evidence |
|----------|---------|----------|
| `recipeNameMessage(name)` | returns `RECIPE_NAME_REQUIRED` or `null` | `recipe.js:13-15` |
| `blockedSaveMessage(...)` | returns a message string or `null`, fixed order: blank label, collision, first blocked row | `lineage.js:261-268` |
| `parseGramsDraft(value)` | returns a number or `null` | `lineage.js:199-201` |
| `normaliseCode`, `codeProblem` | `null` / `{ reason }` | `sheetCode.js:139-182` |
| `displayNumberOf`, `asMadeForPortion` | `null` | `stepNumbers.js:45`, `batch.js:241` |
| `createChildVersion`, `createBatch`, `renamedRecipe` | **no validation at all**; the caller ran the gate first | `lineage.js:124`, `batch.js:177`, `recipe.js:24` |

### Recommendation (marked `[ASSUMED]`: a design call, no precedent either way)
Match the **split** the repo uses, and for the constructors' own backstop throw:
1. v2's form uses the existing message gates (`recipeNameMessage`; the `'Enter a version.'` rule) before it ever calls the new functions. No new maker-facing message is needed in this phase.
2. `createRecipe`, `rowFromLibraryRecord` and `nextStepKey` each **throw** on a contract violation: blank name or blank/whitespace label (use `trim() === ''`), an empty or non-array `rows`, a duplicate row `id`, a negative or non-finite amount, a non-finite `step`, a non-string/empty row `id`, and (allocator) an out-of-range key. A `null` return would be unsafe for a function whose normal return is a record or a key: `null` as a step `n` fails `isFiniteNumber` only at import, far from the cause.
3. State in the plan that this is the **first `throw` in `domain/`**, chosen because these are constructors with no caller yet, and that the alternative (return `null` or `{ error }`) is equally small to switch to while there is no caller (reversible).
4. Do not validate the caller-supplied `recipeId`, `versionId` or `now` (`createChildVersion` does not validate `id`/`now`, `lineage.js:124`); the `validateStoreFile` test proves a well-formed call is accepted.
5. Reserved row ids (`'__proto__'`, `'constructor'`, `'prototype'`): `transfer.js` does not export `UNSAFE_KEYS`, and `domain/` must not import `store/`. Ids will come from `freshId` (a UUID, `id.js`). Skip the check in the domain function; the import check is the backstop. (If the planner wants it, duplicate the three-name list locally and pin parity with a `validateStoreFile` test; `recordDraft.test.js:33` has a precedent for a local copy of that list in a test.)
6. `createRecipe` should refuse duplicate row ids even though `validateVersion` does not: row ids are object keys in the pen draft (`penDraftFromVersion` uses `Object.fromEntries`, `penDraft.js:182`) and in a batch's `asMade` map (`transfer.js:428-433`), so a duplicate silently merges two rows.

### Where `VERSION_SCHEMA_VERSION` can be read from
- It is defined at `app/src/data/olive-oil.js:14`: `export const VERSION_SCHEMA_VERSION = 6;`. It is imported by nothing else; `olive-oil.test.js:129-131` pins `oliveOilVersion.schemaVersion` to `6`. Seeds other than olive oil still carry literal `schemaVersion: 5` (and Mexican Chocolate its own constant), and `validateVersion` never checks the field, so "current" has exactly one source today.
- **No test forbids a domain module from importing `data/`.** The only enforced import purity is `RecipePage.shell.test.js:120-130` (`penDraft.js`, `recordDraft.js` import only sibling `./x.js`), and a grep shows no non-test `domain/` file imports `../data`, `../store` or `../ui` [VERIFIED: grep `from '\.\./(data|store|ui)'` over `domain/*.js` excluding tests]. `data/olive-oil.js` is a seed fixture (it imports `library.js`); importing it into a domain module would make the domain depend on seed data.
- Precedent for the domain owning its record-shape counter: `export const BATCH_SCHEMA_VERSION = 4;` at `domain/batch.js:20`.
- **Recommendation:** define a module-private `const VERSION_SCHEMA_VERSION = 6;` in `newRecipe.js` (no new export, so there are not two exports of one name), and pin parity with a test that imports the exported constant from `../data/olive-oil.js` and compares `createRecipe(...).version.schemaVersion` to it. A future bump in `olive-oil.js` then fails the test instead of silently diverging. This avoids editing `data/olive-oil.js` (CONTEXT: the one outside edit is `advisories.js`).

## Q7. Pinning D-05a

- Function: `togglePenStepRemoved(draft, stepN)` at `app/src/domain/penDraft.js:368-373`:
```javascript
export function togglePenStepRemoved(draft, stepN) {
  return {
    ...draft,
    method: draft.method.map((step) => (step.n === stepN ? { ...step, removed: !step.removed } : step)),
  };
}
```
  Its only caller is `ui/RecipePage.jsx:1430` `versionPen.edit(togglePenStepRemoved, stepN);`.
- Existing test to extend: `app/src/domain/penDraft.test.js:446-454`, `describe('togglePenStepRemoved', ...)`, which currently checks one step flips and the others keep identity. Add (a) the array length is unchanged and the step is still present with `removed === true`, for the **highest-numbered** step; (b) `nextStepKey(next.method)` is still `highest + 1` for that case (import `./stepKeys.js` in this test, or place the combined case in `stepKeys.test.js`; the latter keeps `penDraft.test.js` untouched by the new module).
- Probe confirmed: `togglePenStepRemoved({method:[1,2,3,4 each {n,removed:false}]}, 4)` → `[[1,false],[2,false],[3,false],[4,true]]`.
- No code path removes a step from the array outright [VERIFIED: grep of `method\.(filter|splice|slice|pop|shift)` and `method:` writes across non-test `app/src`]. The only `method.filter` is `activeSteps` (`rows.js:87`) and `uses.js:29`, both of which build a *view* and are never written back; `lineage.js:144,167` and `penDraft.js:201,239,270` copy or pass the whole method. A step can only be restored, never dropped (`restoreStepFromVersion`, `penDraft.js:154-160`, replaces a step by `n`).
- A source-text pin in the style of `penDraft.test.js:583-591` is available for extra safety: strip comments from `penDraft.js` and `lineage.js` and assert neither contains `method.filter(`, `method.splice(`, `.pop(`, `.shift(`. Optional; the behavioural test is the pin D-05a asks for. Use judgement: a source scan on two large files is brittle, so recommend the behavioural test only, with the scan as an option.
- **The CONTEXT's "steps 1-4 with step 3 removed → 5" example does not discriminate** between a flag and an outright drop: dropping step 3 leaves `[1,2,4]` whose highest is still 4, so the answer is 5 either way. The case that does discriminate is removing the **highest** step (step 4): flagged → 5; dropped → 4 reused. Test both, plus the gap case `[1,2,4]` → 5 (kills the `length + 1` bug, which would return 4).

## Common Pitfalls

### Pitfall 1: the guard changes the module's export list
**What goes wrong:** exporting the helpers or a new function makes `advisories.test.js:37-40` (`expect(Object.keys(Advisories)).toEqual(['buildAdvisories'])`) fail.
**How to avoid:** put `if (!equipment) return null;` and `if (!process) return null;` inside the existing unexported functions.
**Warning signs:** that one test red.

### Pitfall 2: `length + 1` or `activeSteps` in the allocator
**What goes wrong:** reuses a held key (gap case) or a removed key.
**How to avoid:** loop over the whole `method`, include removed steps, take the largest `n`, start at 0.

### Pitfall 3: figures compared with a different row id
**What goes wrong:** the criterion-3 figures comparison fails on `contributorRowIds` (`figures.js:163`).
**How to avoid:** build the row with `id: 'row-03'` for the comparison.

### Pitfall 4: the validator proof placed in `domain/`
**What goes wrong:** a domain test importing `store/transfer.js` contradicts the suite's own "imports no store" header (`lineage.test.js:1-3`).
**How to avoid:** put it in `app/src/store/creation-roundtrip.test.js`. `transfer.js` imports only `../domain/axes.js` and `../domain/battery.js` and no `idb`, so the file needs no `fake-indexeddb` setup; it still runs under the `node` environment.

### Pitfall 5: a blank label that passes import
**What goes wrong:** `'   '` passes `isNonEmptyString` but the app's own save gate refuses it (`lineage.js:262`).
**How to avoid:** refuse on `versionLabel.trim() === ''`.

### Pitfall 6: aliasing the caller's rows
**What goes wrong:** `createRecipe` that stores the passed `rows` array lets a later edit to the caller's array move the version.
**How to avoid:** `structuredClone(rows)` as `createChildVersion` does (`lineage.js:143`); test by mutating the input afterwards. Also do not mutate the `record` passed to the row builder.

### Pitfall 7: the all-zero case hides a figure bug
**What goes wrong:** only testing zero weight proves nothing about figures.
**How to avoid:** the two D-07 tests: starting rows with weight give six figures with the keys in `FIGURE_SPECS` order; all-zero gives `[]` and `computeBalance(...) === null` without throwing.

## Code Examples

### The guard (shape; the two edits)
```javascript
// Source: app/src/domain/advisories.js:46-47 and :118-119 as they stand (read this session)
function subScaleAdvisory(rows, equipment) {
  const under = rows.filter((row) => rowGrams(row) > 0 && rowGrams(row) < equipment.scaleResolutionG);
...
function hydrationAdvisory(rows, steps, process, stepNumbers) {
  const hold = process.pasteuriseC;
// Edit: add as the first statement of each:  if (!equipment) return null;   /   if (!process) return null;
```

### Allocator (shape)
```javascript
// stepKeys.js
export function nextStepKey(method) {
  let highest = 0;
  for (const step of method) {
    if (!Number.isSafeInteger(step.n)) throw new RangeError(`step key ${step.n} is not a safe integer`);
    if (step.n > highest) highest = step.n;
  }
  if (highest >= Number.MAX_SAFE_INTEGER) throw new RangeError('no step key left after the highest');
  return highest + 1;
}
```

### Row builder (shape)
```javascript
// versionRow.js
export function rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName }) {
  // refuse: id not a non-empty string; grams not finite or < 0; step not finite
  return {
    id,
    ingredientName: ingredientName ?? record.entry.name,
    ingredient: structuredClone(record.entry),
    portions: [{ step, grams }],
    removed: false,
  };
}
```
The returned keys equal the seeded row's keys (`id`, `ingredientName`, `ingredient`, `portions`, `removed`) per `olive-oil.js:54-60, 83`; the probe's `deepStrictEqual` against `row-03` passed with exactly this shape.

### Criterion-1 proof (store test)
```javascript
// app/src/store/creation-roundtrip.test.js  (node env, no docblock)
import { validateStoreFile, STORE_SCHEMA_VERSION } from './transfer.js';
const file = { app: 'sprinkles', schemaVersion: STORE_SCHEMA_VERSION, versions: [version], batches: [], recipes: [recipe], library: [] };
expect(validateStoreFile(file)).toEqual({ ok: true, errors: [] });
expect(version.recipeId).toBe(recipe.id);
expect(buildFigures(version).map((f) => f.key)).toEqual(['pac', 'pod', 'fat', 'msnf', 'sugar', 'solids']);
```
Figure key order is `FIGURE_SPECS` at `figures.js:17-72` (`pac, pod, fat, msnf, sugar, solids`). The same file should also run `buildAdvisories`, `sheetCode` and `createChildVersion` on the result without throwing (D-02), and `createBatch` on it to prove the snapshot carries `coefficientSetId: ''`.

## State of the Art

Not applicable (no external library or API). One in-repo point: the seeds are stale on `schemaVersion` (five of them carry `5`, olive oil `6`); the validator ignores the field, so the new root version carrying `6` is consistent with the one constant that is named.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The three constructors should **throw** on a contract violation (first `throw` in `domain/`), with v2 gating by message functions first. No precedent in `domain/`; the alternative is a `null`/`{ error }` return. | Q6 | Low and reversible: no caller exists yet. Mark may prefer the return-value style the layer uses everywhere else. |
| A2 | Three new modules (`stepKeys.js`, `versionRow.js`, `newRecipe.js`) and prebuilt rows into `createRecipe`. File names are free (CONTEXT discretion); the choice is for parallel-worktree independence. | Standard Stack, Structure | Low. Naming only. |
| A3 | A module-private `VERSION_SCHEMA_VERSION = 6` in `newRecipe.js`, pinned to `data/olive-oil.js`'s export by a test, rather than importing from `data/` or editing `olive-oil.js`. | Q6 | Low. If Mark wants one owner, move the constant into `domain/` and make `olive-oil.js` import it (a one-line edit outside the stated scope). |
| A4 | Skip reserved-name (`__proto__`, ...) refusal for row ids in the domain function; the import check is the backstop and ids come from `freshId`. | Q6 | Low. If wrong, add a local three-name list and a parity test. |
| A5 | `if (!process) return null;` is the minimum guard (D-02 says "block absent"); `process?.pasteuriseC == null` would additionally cover `{ pasteuriseC: null }`, a pre-existing edge no data file has. | Q1 | None for Phase 7. |

## Open Questions

1. **Throw versus return for the constructors' contract violations**
   - What we know: no domain function throws; message gates return strings; constructors do no validation.
   - What's unclear: whether Mark wants the first throw in the layer.
   - Recommendation: throw (A1); the CONTEXT already names "throw" for the allocator, so one style across the three keeps the plan simple.
2. **Stale comment at `data/mexican-chocolate.js:39-44`**
   - What we know: it claims `advisories.js` dereferences `version.equipment` unconditionally, untrue after D-02.
   - What's unclear: whether to correct it.
   - Recommendation: leave it (surgical-changes rule) and mention it in the phase summary.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | tests, `structuredClone` | ✓ | v24.21.0 | — |
| Vitest | tests | ✓ | 5.0.0 | — |
| `fake-indexeddb` | not needed (the proof uses `validateStoreFile` only) | ✓ (devDependency 6.2.5) | 6.2.5 | — |

**Baseline:** `npm --prefix app test` this session: **87 test files, 2794 tests, all passed**, 2.78 s. Single file: `npm --prefix app test -- src/domain/advisories.test.js` passes (20 tests). `git status` was clean at the end of research.

**Missing dependencies:** none.

## Validation Architecture

Skipped: `workflow.nyquist_validation` is `false` in `.planning/config.json`. Test conventions the plan needs are in Q3 and Q7; the commands are above.

## Security Domain

`security_enforcement` is on (ASVS level 1, block on high). This phase adds pure in-memory functions with no input channel, network call, storage or markup.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes (contract checks on name, label, rows, ids, grams, step) | argument checks in the constructors; `validateStoreFile` as the import backstop (test) |
| V6 Cryptography | no | none used; ids come from the caller (`freshId`), not from these functions |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prototype-polluting row id (`__proto__`) used as an object key downstream | Tampering | `validateRow` refuses it at import (`transfer.js:105`); ids are UUIDs from `freshId`; no bracket write with a maker-influenced key in the new code (the allocator scans, D-05) |
| Reused step key corrupting diff / `uses` / `stepChanges` pairing | Tampering (integrity) | max-over-all-steps allocator plus the `MAX_SAFE_INTEGER` throw (Q5) |
| Notes or names rendered as markup | Tampering / XSS | not touched; project rule is no `dangerouslySetInnerHTML` under `app/src` (CLAUDE.md) |

## Project Constraints (from CLAUDE.md)

From `./CLAUDE.md` and `./.claude/CLAUDE.md` [VERIFIED: read in the task context]:
- Domain math lives in framework-free modules under `app/src/domain/`: no framework, DOM or store import; the domain test suite runs under the `node` environment.
- Every store access goes through `app/src/store/repository.js`; no other module imports `idb`. (Not touched here.)
- No literal visual value outside `tokens.css`; no `dangerouslySetInnerHTML`. (No UI in this phase.)
- Agent-facing prose, git commit messages and test input values are English.
- TypeScript is not adopted; React + Vite stay. (Nothing to change.)
- Surgical changes: touch only what the phase needs; mention (do not delete) unrelated dead or stale code; every changed line traces to the request.
- Build incrementally; small reviewable steps; surface structural choices (this phase adds none: no routing, state, build or test-framework choice).
- GSD enforcement: edits go through a GSD command (`/gsd-execute-phase` for planned phase work).
- No project skills apply: `.claude/skills/` holds `gsd-ui-review`, `marks-list`, `sketch-findings-sprinkles`; this phase has no screen.
- Mark's List: this phase leaves Mark no decision, so no row is required by research; if the plan escalates A1 to Mark, it becomes a `decide` row with ids on every option.

## Sources

### Primary (HIGH confidence)
- In-repo files read this session, with line ranges cited inline: `app/src/store/transfer.js`, `app/src/domain/{advisories,lineage,figures,composition,rows,stepNumbers,sheetCode,sheetPages,diff,penDraft,recipe,batch,id}.js`, `app/src/data/{olive-oil,library,standard-base,mexican-chocolate}.js`, `app/src/ui/{IngredientTable,PrintSheetPages,FormulationNote,BasisNote,DerivedAdvisories,RecipePage,Method}.jsx`, `app/src/store/{transfer.test,pen-note-roundtrip.test,library.test}.js`, `app/src/domain/{advisories,lineage,penDraft}.test.js`, `app/src/ui/RecipePage.shell.test.js`, `app/vitest.config.js`, `app/package.json`, `.planning/config.json`.
- Scratch probe (outside the repo, session scratchpad `probe.mjs`) importing the real domain modules and `validateStoreFile`: results quoted in Q1, Q2, Q3, Q4, Q7.
- Test runs: full suite and `advisories.test.js` this session.

### Secondary / Tertiary
None. No web or Context7 lookups were needed: the phase has no external library or API.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, no external dependency; versions read from `package.json` and the shell.
- Architecture: HIGH, every reader of the four fields enumerated by grep and read; the two throws reproduced.
- Pitfalls: HIGH, each tied to a read line or a probe.
- Design calls (throw vs return, module layout, schema constant owner): MEDIUM, no precedent; logged as A1-A4.

**Research date:** 2026-10-14
**Valid until:** until `domain/advisories.js`, `store/transfer.js` or the seed shapes change (code-only phase; re-grep Q1 if a new reader of `equipment`/`process` lands first).
