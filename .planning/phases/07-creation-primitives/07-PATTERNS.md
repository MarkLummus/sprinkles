# Phase 7: Creation primitives - Pattern Map

**Mapped:** 2026-10-14
**Files analyzed:** 10 (6 new domain files, 1 new store test, 3 edits)
**Analogs found:** 10 / 10

All analogs below are git-tracked (checked with `git ls-files`). Line numbers for `lineage.js`, `olive-oil.js`, `advisories.js` and `transfer.js` come from 07-RESEARCH.md, which read them this session. Excerpts for `recipe.js`, test headers, `advisories.js` guard sites and `penDraft.test.js` were read directly while mapping.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `app/src/domain/newRecipe.js` | utility (pure creator) | transform | `app/src/domain/lineage.js` `createChildVersion` (124-149) | exact |
| `app/src/domain/newRecipe.test.js` | test | transform | `app/src/domain/lineage.test.js` | exact |
| `app/src/domain/versionRow.js` | utility (pure builder) | transform | `app/src/data/olive-oil.js` `embed()` (44-49, 83) | exact |
| `app/src/domain/versionRow.test.js` | test | transform | `app/src/domain/advisories.test.js` (clone-fixture style) | role-match |
| `app/src/domain/stepKeys.js` | utility | transform | `app/src/domain/stepNumbers.js` and `rows.js` (14-19, 87) | role-match |
| `app/src/domain/stepKeys.test.js` | test | transform | `app/src/domain/penDraft.test.js` (`togglePenStepRemoved`, 446-454) | role-match |
| `app/src/store/creation-roundtrip.test.js` | test | request-response (validator) | `app/src/store/transfer.test.js` (`makeStoreFile`, 170-210; 297) | exact |
| `app/src/domain/advisories.js` (edit, 2 guards) | utility | transform | its own early-return at 171-172 | exact |
| `app/src/domain/advisories.test.js` (edit) | test | transform | itself (`clone()` helper, 11-13) | exact |
| `app/src/domain/penDraft.test.js` (edit, optional) | test | transform | itself, `describe('togglePenStepRemoved')` 446-454 | exact |

## Pattern Assignments

### `app/src/domain/newRecipe.js` (utility, transform)

**Analog:** `app/src/domain/lineage.js` `createChildVersion`, 124-149. Name trimming from `app/src/domain/recipe.js`.

**Header comment (copy the style, `recipe.js` 1-3):**
```javascript
// Pure. No framework, no DOM, no store import. The recipe record's own
// rename rule (03.5-CONTEXT.md D-11, D-12): ...
```

**Core pattern (injected id and clock, `lineage.js` 124-149):**
```javascript
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
    ...
    rows: structuredClone(penFields.rows),
    method: structuredClone(penFields.method),
    sheetTitle: penFields.sheetTitle,
    sheetDescription: penFields.sheetDescription,
    authored: structuredClone(penFields.authored),
  };
}
```

**Name trimming (`recipe.js` 24-26):**
```javascript
export function renamedRecipe(recipe, { name, description }) {
  return { id: recipe.id, name: name.trim(), description };
}
```

**Target shape (RESEARCH skeleton):** `createRecipe({ name, versionLabel, rows }, { recipeId, versionId, now })` returns `{ recipe: { id, name: trimmed, description: '' }, version }`. The version carries the seed head fields from `olive-oil.js` (`parentVersionId`, `parentVersionLabel`, `reason`, `citedBatchId` all null; `createdAt: now`; `coefficientSetId: ''`; `sheetTitle` the trimmed name; `sheetDescription: ''`; `method: []`; `authored: { beforeYouStart: [] }`; `declaredAxes: []`; `declaredFlaws: []`). It has no `equipment`, `process`, `iceEd`, `targets` or `coefficientSetName`. `rows: structuredClone(rows)` (Pitfall 6).

**Seed empty-forms reference:** `app/src/data/standard-base.js` 57-61 (`declaredAxes: []`, `declaredFlaws: []`, `method: []`, `authored: { beforeYouStart: [] }`).

**Refusal:** `createChildVersion` and `renamedRecipe` validate nothing, and no `domain/` function throws. RESEARCH A1 recommends throwing for: blank name (`trim() === ''`), blank label (`trim() === ''`, matching the `lineage.js` 262 gate `'Enter a version.'`), empty or non-array `rows`, duplicate row ids. This is a design call (A1), so the planner should confirm it. Do not validate `recipeId`, `versionId` or `now`.

**Schema constant:** module-private `const VERSION_SCHEMA_VERSION = 6;`. The pattern is `domain/batch.js:20` (`export const BATCH_SCHEMA_VERSION = 4;`). Do not import `../data/` from the domain module. A parity test imports `VERSION_SCHEMA_VERSION` from `../data/olive-oil.js` (A3).

---

### `app/src/domain/versionRow.js` (utility, transform)

**Analog:** `app/src/data/olive-oil.js` `embed()` and row-03 (44-49, 83).

```javascript
function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}
// row-03
{ id: 'row-03', ...embed('Graza Drizzle', library.oliveOil, { portions: [{ step: 8, grams: 40 }], removed: false }) },
```

**Target shape (RESEARCH, probe-verified deep-equal to `oliveOilVersion.rows[2]`):**
```javascript
export function rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName }) {
  return {
    id,
    ingredientName: ingredientName ?? record.entry.name,
    ingredient: structuredClone(record.entry),
    portions: [{ step, grams }],
    removed: false,
  };
}
```
The record's `id` never enters `ingredient`. The portion has no `removed` key. Refusals (throw, per A1): `id` not a non-empty string, `grams` not finite or below 0 (0 accepted, D-07), `step` not finite. The import check for these is `transfer.js` `validateRow` (97-124) and `validatePortion` (80-95).

**Library record shape:** `store/seed.js:22`, `Object.entries(library).map(([id, entry]) => ({ id, entry }))`. Test fixture: `{ id: 'oliveOil', entry: library.oliveOil }` (`app/src/data/library.js` 30-37).

---

### `app/src/domain/stepKeys.js` (utility, transform)

**Analogs:** `app/src/domain/rows.js` 14-19 (`isStepRemoved` scans, never indexes) and `rows.js:87` (`activeSteps`, the anti-pattern: it filters out removed steps). Header style from `stepNumbers.js` 1-12, which documents that `n` is identity and the display number is derived.

**Pattern to copy (RESEARCH shape):**
```javascript
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
Avoid: `method.length + 1`, `Math.max(...spread)`, and `activeSteps`.

---

### Test files (`newRecipe.test.js`, `versionRow.test.js`, `stepKeys.test.js`)

**Analogs:** `app/src/domain/lineage.test.js` 1-30 and `app/src/domain/advisories.test.js` 1-13.

**Header and imports (`lineage.test.js` 1-5, 20):**
```javascript
// Domain suite for parent/child version construction ... Runs under Vitest's default
// node environment — imports no store, no component, and no framework.
import { describe, it, expect } from 'vitest';
...
import { oliveOilVersion } from '../data/olive-oil.js';
```

**Fixture style (`advisories.test.js` 11-13):**
```javascript
function clone() {
  return structuredClone(oliveOilVersion);
}
```
No `@vitest-environment` docblock (node is the default, `app/vitest.config.js`). `lineage.test.js` 22-29 shows ad-hoc `makeVersion(overrides)` fixtures.

**Tests to include:**
- `versionRow.test.js`: `expect(row).toEqual(oliveOilVersion.rows[2])` with id `'row-03'`, name `'Graza Drizzle'`, step 8, grams 40. Figures equal when swapped into `structuredClone(oliveOilVersion)` (same id, because of `contributorRowIds`). Independence: mutate `record.entry.composition.fat` afterwards. `Object.hasOwn(row.ingredient, 'id')` is false. `row.ingredient` is not `record.entry`.
- `stepKeys.test.js`: empty returns 1. A gap `[1,2,4]` returns 5. Highest removed, `[1,2,3,4{removed}]`, returns 5. Boundary: `MAX_SAFE_INTEGER - 1` returns `MAX_SAFE_INTEGER`; `MAX_SAFE_INTEGER`, `2**53` and `2.5` throw.
- `newRecipe.test.js`: schemaVersion parity with the `olive-oil.js` constant. Input rows are not aliased. The four absent keys are absent. Refusals.
- Optional module-purity pin: the `RecipePage.shell.test.js` 120-130 style (imports match `^\.\/[\w.-]+\.js$`), or the `penDraft.test.js` 583-591 source-text check.

---

### `app/src/store/creation-roundtrip.test.js` (test, validator proof for criterion 1)

**Analog:** `app/src/store/transfer.test.js`. Its `makeStoreFile` (170-210) builds the wrapper, and line 297 asserts the result.

```javascript
// transfer.test.js:297
expect(validateStoreFile(makeStoreFile())).toEqual({ ok: true, errors: [] });
```
```javascript
import { validateStoreFile, STORE_SCHEMA_VERSION } from './transfer.js';
const file = { app: 'sprinkles', schemaVersion: STORE_SCHEMA_VERSION, versions: [version], batches: [], recipes: [recipe], library: [] };
```
Do NOT copy `transfer.test.js` lines 1-4 (`fake-indexeddb/auto`, repository). This test needs no IndexedDB, because `transfer.js` imports only domain modules. Also assert `version.recipeId === recipe.id`, then that `buildFigures` gives keys `['pac','pod','fat','msnf','sugar','solids']`. The all-zero case gives `[]`, and `computeBalance` returns null. Run `buildAdvisories`, `sheetCode`, `createChildVersion` and `createBatch` (snapshot `coefficientSetId: ''`) without throwing.

---

### `app/src/domain/advisories.js` (edit: two guards)

**Analog:** the file's own early return (171-172) `const balance = computeBalance(rows); if (!balance) return [];`.

**Current code, read directly (44-48, 116-120):**
```javascript
function subScaleAdvisory(rows, equipment) {
  const under = rows.filter((row) => rowGrams(row) > 0 && rowGrams(row) < equipment.scaleResolutionG);
...
function hydrationAdvisory(rows, steps, process, stepNumbers) {
  const hold = process.pasteuriseC;
```
**Edit:** add `if (!equipment) return null;` as the first statement of `subScaleAdvisory`, and `if (!process) return null;` before `const hold` in `hydrationAdvisory`. Do not export anything. `advisories.test.js` 37-40 pins `Object.keys(Advisories)` to `['buildAdvisories']`. Leave the stale comment at `data/mexican-chocolate.js` 39-44 alone and mention it in the summary.

### `app/src/domain/advisories.test.js` (edit)
Add tests using `clone()` and deleting `equipment`, `process`, `iceEd` and `targets`. `buildAdvisories` must not throw and must give keys `['ultra-pasteurised','estimated']`, per RESEARCH Q1. The full olive oil clone gives `["sub-scale","ultra-pasteurised","hydration","estimated"]`.

### `app/src/domain/penDraft.test.js` (edit, or put the pin in `stepKeys.test.js`, which RESEARCH prefers)
**Existing block (446-454):**
```javascript
describe('togglePenStepRemoved', () => {
  it('flips one step', () => {
    const draft = cleanDraftFor(clone());
    const next = expectPure(togglePenStepRemoved, draft, 2);
    expect(next.method.find((step) => step.n === 2).removed).toBe(true);
```
D-05a pin: toggling the highest step leaves `method.length` unchanged with `removed === true`, and `nextStepKey(next.method)` is still highest + 1. The CONTEXT example "remove step 3 of 1 to 4 gives 5" does not discriminate between a flag and a drop. Use step 4.

---

## Shared Patterns

### Purity and test environment
**Source:** `.claude/CLAUDE.md` Conventions, `lineage.test.js` 1-3. **Apply to:** all new `domain/` files. Import only sibling `./x.js` modules. No `crypto`, no `new Date()`, no `idb`, no framework. Tests run under the node default.

### Embedded `structuredClone`
**Source:** `lineage.js` 143, `olive-oil.js` 57, `batch.js` 187. **Apply to:** `versionRow.js` (`record.entry`) and `newRecipe.js` (`rows`).

### Injected id and clock
**Source:** `createChildVersion(parent, penFields, { id, now })`, `lineage.js` 124. **Apply to:** `createRecipe` (`{ recipeId, versionId, now }`) and `rowFromLibraryRecord` (`id` argument). Ids come from `domain/id.js` `freshId` in the future caller only.

### Remove means flag, never drop
**Source:** `penDraft.js` 368-373 (`togglePenStepRemoved` sets `removed: !step.removed`). **Apply to:** `stepKeys.js` (count removed steps).

### Refusal style (open design call, A1)
No `domain/` function throws today. Message gates return `string | null` (`recipeNameMessage`, `recipe.js` 13-15; `blockedSaveMessage`, `lineage.js` 261-268). Constructors validate nothing. The research recommends throwing from the three new constructors as a backstop. The planner should confirm this with Mark or note it as reversible.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | | | The only novelty is the first `throw` in `domain/`. Use the RESEARCH A1 recommendation. |

## Metadata

**Analog search scope:** `app/src/domain/`, `app/src/store/`, `app/src/data/`
**Files read for excerpts:** `recipe.js`, `lineage.test.js`, `advisories.test.js`, `advisories.js` (guard sites), `penDraft.test.js` (block), `transfer.test.js` (header), `stepNumbers.js` (header). Other line numbers are taken from 07-RESEARCH.md.
**Pattern extraction date:** 2026-10-14
