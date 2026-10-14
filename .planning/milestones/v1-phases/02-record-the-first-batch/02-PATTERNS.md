# Phase 2: Record the first batch - Pattern Map

**Mapped:** 2026-09-06
**Files analyzed:** 12 (new + modified)
**Analogs found:** 12 / 12 (all existing files carried forward; 3 new files have no existing analog and use RESEARCH.md's patterns instead)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|---------------|
| `app/src/domain/batch.js` | model (pure domain logic) | transform | `app/src/domain/figures.js` | exact |
| `app/src/domain/batch.test.js` | test | transform | `app/src/domain/figures.test.js` | exact |
| `app/src/store/db.js` (modify) | config/store | CRUD | itself (`app/src/store/db.js`, current version) | exact |
| `app/src/store/repository.js` (modify) | service (repository seam) | CRUD | itself (`app/src/store/repository.js`, current methods) | exact |
| `app/src/store/transfer.js` (modify) | service (file I/O) | file-I/O | itself (`app/src/store/transfer.js`, `validateVersion`/`validateStoreFile`) | exact |
| `app/src/store/seed.js` (modify) | service | CRUD | itself (`app/src/store/seed.js`) | exact |
| `app/src/router.jsx` (modify) | route | request-response | itself (`app/src/router.jsx`) | exact |
| `app/src/ui/RecipePage.jsx` (modify) | component (page) | request-response | itself (`app/src/ui/RecipePage.jsx`) | exact |
| `app/src/ui/IngredientTable.jsx` (modify) | component | request-response | itself (`app/src/ui/IngredientTable.jsx`) | exact |
| `app/src/ui/Method.jsx` (modify) | component | request-response | itself (`app/src/ui/Method.jsx`) | exact |
| `app/src/ui/BatchMargin.jsx` (new) | component | request-response | `app/src/ui/Authored.jsx` (list/legend shape) + `app/src/ui/FormulationNote.jsx` (margin-region composition) | role-match |
| `app/src/ui/AxisMark.jsx` (new) | component (form control) | request-response | none in-repo — RESEARCH.md Pattern 3 (native radio group); nearest in-repo shape is `app/src/ui/Method.jsx`'s `target-chip` span-per-value rendering for markup style only | no analog (documented below) |

## Pattern Assignments

### `app/src/domain/batch.js` (model, transform)

**Analog:** `app/src/domain/figures.js` (and `app/src/domain/composition.js` for the pure-module header convention)

**Header/imports pattern** (figures.js lines 1-6):
```javascript
// Pure. No framework, no DOM, no store import. Assembles the six balance
// figures a maker reads against their authored bands — see
// 01-CONTEXT.md "Target bands" (D-09..D-12). Computes nothing
// computeBalance/weakestBasis already compute; only reads, ranks, and
// words their output.
import { computeBalance, weakestBasis } from './composition.js';
```
Copy this convention: a top-of-file comment stating "Pure. No framework, no DOM, no store import," citing the CONTEXT.md decision IDs it encodes (D-01, D-02, D-03, D-06, D-11, D-16, D-18 for `batch.js`).

**Core transform pattern — deterministic function taking injected id/time** (figures.js lines 87-89, `buildFigures(version)` signature; composition.js lines 21-23, `computeBalance(rows)` signature):
```javascript
export function buildFigures(version) {
  const balance = computeBalance(version.rows);
  if (!balance) return [];
  ...
```
`batch.js`'s functions should follow the same shape: a pure function of its inputs, with `id`/`now` passed in explicitly (never `crypto.randomUUID()` or `new Date()` called inside the domain module) — mirrors how `figures.js` never reaches for global/mutable state.

**Branch on presence, never on truthiness** (figures.js lines 100-102):
```javascript
// Branch on key presence, never on value truthiness — an authored band
// of [0, 0] and an absent band are different facts (D-10).
const band = Object.prototype.hasOwnProperty.call(targets, spec.targetKey) ? targets[spec.targetKey] : null;
```
This is the exact precedent for D-11 (0 g lecithin is a real value, distinct from absent) — `batch.js` must use `value != null` checks, never `value || fallback`, for every as-made/measured field.

**Snapshot pattern** (`app/src/data/olive-oil.js` lines 7-15, the `embed()` helper):
```javascript
// Deep-copy the ingredient record onto the row so a stored version is
// self-contained (D-05): a later edit to the shared `library` must never
// move a figure already computed from a version's own rows.
function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}
```
`createBatch`'s snapshot (BATCH2-01) should use `structuredClone(version.rows)` the same way — this is the established, already-proven precedent for "never let a later edit move an already-stored record's figures," now applied to a batch snapshotting a version instead of a version snapshotting the library.

**No error-handling/try-catch pattern exists in figures.js/composition.js** — they are total functions over well-formed input; `batch.js` should follow suit (e.g. `isTastingSaveable` returns a boolean gate rather than throwing; validation/refusal happens at the transfer.js layer, not in the domain module).

---

### `app/src/domain/batch.test.js` (test, transform)

**Analog:** `app/src/domain/figures.test.js`

**Imports and structure pattern** (lines 1-9):
```javascript
// Tolerance convention matches composition.test.js: D-02 asks for agreement
// within 0.1, asserted with Math.abs rather than toBeCloseTo.
import { describe, it, expect } from 'vitest';
import { buildFigures, describeDeviation, FIGURE_SPECS } from './figures.js';
import { oliveOilVersion } from '../data/olive-oil.js';

const closeTo = (actual, expected, tolerance = 0.1) => Math.abs(actual - expected) < tolerance;

describe('FIGURE_SPECS', () => {
  it('has six entries in fixed render order', () => { ... });
});
```
Copy this: `describe`/`it` blocks per exported function, importing the seeded fixture (`oliveOilVersion`) as real test data rather than ad hoc mocks. Domain tests run under Vitest's default `node` environment (no DOM import needed) — confirmed by RESEARCH.md `[VERIFIED: app/vitest.config.js:1-8]`.

---

### `app/src/store/db.js` (config, CRUD — modify in place)

**Analog:** itself, current state

**Full current file** (all 14 lines):
```javascript
import { openDB } from 'idb';

export const DB_NAME = 'sprinkles';
export const DB_VERSION = 1;

// The only module under app/src that touches the store library — every
// other module reaches the store through repository.js's seam (D-06).
export function openStore() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('versions', { keyPath: 'id' });
    },
  });
}
```
**Change required:** bump `DB_VERSION` to `2` and add a guarded `batches` store with a `by-version` index, guarding the pre-existing `versions` creation too (RESEARCH.md Pattern 4 / Common Pitfall #4 — an unguarded `createObjectStore` call throws on a real upgrade from a v1 database):
```javascript
upgrade(db) {
  if (!db.objectStoreNames.contains('versions')) {
    db.createObjectStore('versions', { keyPath: 'id' });
  }
  if (!db.objectStoreNames.contains('batches')) {
    const batches = db.createObjectStore('batches', { keyPath: 'id' });
    batches.createIndex('by-version', 'versionId');
  }
},
```
Keep the existing top comment's claim ("the only module under app/src that touches the store library") — it still holds after this change.

---

### `app/src/store/repository.js` (service, CRUD — modify in place)

**Analog:** itself, current state

**Full current pattern** (lines 1-32):
```javascript
import { openStore } from './db.js';

// The repository seam D-06 and D-16 depend on — the only path to the store.
// No component, no domain module, and no seed check may reach past it.
export function createRepository() {
  const dbPromise = openStore();

  return {
    async listVersions() {
      const db = await dbPromise;
      return db.getAll('versions');
    },
    async getVersion(id) {
      const db = await dbPromise;
      return db.get('versions', id);
    },
    async saveVersion(version) {
      const db = await dbPromise;
      return db.put('versions', version);
    },
    async getAll() {
      const db = await dbPromise;
      return db.getAll('versions');
    },
    async putAll(versions) {
      const db = await dbPromise;
      const tx = db.transaction('versions', 'readwrite');
      await Promise.all(versions.map((version) => tx.store.put(version)));
      return tx.done;
    },
  };
}

export const repository = createRepository();
```
**Change required:** add parallel batch methods inside the same returned object, following the exact `async () => { const db = await dbPromise; return db.<verb>('batches', ...); }` shape:
- `listBatchesForVersion(versionId)` → `db.getAllFromIndex('batches', 'by-version', versionId)`
- `getBatch(id)` → `db.get('batches', id)`
- `saveBatch(batch)` → `db.put('batches', batch)`
- extend `getAll()`/`putAll()` for export/import if a combined shape is chosen, or add `getAllBatches()`/`putAllBatches(batches)` mirroring the existing pair one-for-one.

No error handling exists in this file today (each method is a one-line pass-through) — new batch methods should match that minimalism; error handling for malformed data belongs in `transfer.js`'s validator, not here.

---

### `app/src/store/transfer.js` (service, file-I/O — modify in place)

**Analog:** itself, current state

**Imports/helpers pattern** (lines 8-20, reused as-is — no changes needed to these):
```javascript
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}
```

**Validation pattern to copy for `validateBatch`** (mirrors `validateVersion`, lines 61-84):
```javascript
function validateVersion(version, path, errors) {
  if (!isPlainObject(version)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(version.id)) errors.push(`${path}.id: expected a non-empty string`);
  if (typeof version.recipeName !== 'string') errors.push(`${path}.recipeName: expected a string`);
  ...
}
```
Write `validateBatch(batch, path, errors)` in the same collect-all-errors, name-the-path style — checking `id` (non-empty string), `versionId` (non-empty string), `snapshot.rows` (non-empty array via a reused `validateRow`-style check or a call to the existing `validateRow`), and each measured field with `isFiniteNumber(value) || value == null` (never `isFiniteNumber(value) || !value`, per D-11/D-18).

**Refuse-whole-file gate pattern** (lines 91-113, `validateStoreFile`):
```javascript
export function validateStoreFile(parsed) {
  const errors = [];
  scanForUnsafeKeys(parsed, '$', errors);

  if (!isPlainObject(parsed)) {
    errors.push('$: expected the store file to be an object');
    return { ok: false, errors };
  }

  if (parsed.app !== 'sprinkles') {
    errors.push(`$.app: expected "sprinkles", got ${JSON.stringify(parsed.app)}`);
  }
  if (parsed.schemaVersion !== 1) {
    errors.push(`$.schemaVersion: expected 1, got ${JSON.stringify(parsed.schemaVersion)}`);
  }
  if (!Array.isArray(parsed.versions)) {
    errors.push('$.versions: expected an array');
  } else {
    parsed.versions.forEach((version, index) => validateVersion(version, `$.versions[${index}]`, errors));
  }

  return { ok: errors.length === 0, errors };
}
```
Extend this exact function: bump the expected `schemaVersion` to `2` (Claude's discretion on whether `1` still imports, per CONTEXT.md), add a `parsed.batches` array branch calling `validateBatch` per element, in the same `errors.push` + `forEach` shape. `scanForUnsafeKeys` already recurses generically — no change needed there (RESEARCH.md, Known Threat Patterns table).

**Export/import pattern** (lines 116-137):
```javascript
export async function exportStore(repository) {
  const versions = await repository.getAll();
  return {
    app: 'sprinkles',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    versions,
  };
}

export async function importStore(repository, parsed) {
  const { ok, errors } = validateStoreFile(parsed);
  if (!ok) return { ok: false, errors };

  await repository.putAll(parsed.versions);
  return { ok: true, errors: [] };
}
```
Extend both the same way: `exportStore` also awaits a batches getter and includes `batches` in the returned object; `importStore` still validates first and writes nothing on failure, then calls both `putAll` (versions) and the new batch bulk-put method, preserving the "write nothing until validated" ordering.

---

### `app/src/store/seed.js` (service, CRUD — modify in place)

**Analog:** itself, current state

**Full current pattern** (lines 1-11):
```javascript
import { oliveOilVersion } from '../data/olive-oil.js';

// Seed-on-empty-store (D-07). The emptiness check goes through the
// repository seam, never a direct store probe, so the seam stays the
// single source of truth. After the first write, the seeded recipe is
// data like any other — saved through the same call every later write uses.
export async function seedIfEmpty(repository) {
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  await repository.saveVersion(oliveOilVersion);
}
```
If the plan seeds the 2 Aug batch (Claude's Discretion, RESEARCH.md Open Question #2), add it inside the same emptiness-gated block, using `repository.saveBatch(...)` after `saveVersion`, keeping the single `existing.length > 0` guard and the "seeded data is data like any other" comment convention.

---

### `app/src/router.jsx` (route, request-response — modify in place)

**Analog:** itself, current state

**Full current pattern** (lines 1-16):
```javascript
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { RecipeList } from './ui/RecipeList.jsx';
import { RecipePage } from './ui/RecipePage.jsx';

// D-14: URL-addressable routes for the list and the recipe page now, so
// Phase 2's batch route and Phase 4's print route are additions, not a
// retrofit.
export const router = createBrowserRouter([
  { path: '/', Component: RecipeList },
  { path: '/recipe/:id', Component: RecipePage },
]);
```
**Change required:** add one array entry, no new import (D-19: same `RecipePage` component, no separate recording route):
```javascript
{ path: '/recipe/:id/batch/:batchId', Component: RecipePage },
```

---

### `app/src/ui/RecipePage.jsx` (component, request-response — modify in place)

**Analog:** itself, current state

**Data-loading pattern** (lines 14-34, the `useParams` + `useEffect` + cancelled-flag load):
```javascript
export function RecipePage() {
  const { id } = useParams();
  const [version, setVersion] = useState(undefined);
  const [focusedFigureKey, setFocusedFigureKey] = useState(null);

  useEffect(() => {
    let cancelled = false;
    repository.getVersion(id).then((result) => {
      if (!cancelled) setVersion(result ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (version === undefined) return null;
  if (version === null) return <p>No recipe found for this version.</p>;
  ...
```
Copy this shape exactly for loading `batchId` from `useParams()` and fetching the batch (and/or the version's batch list) — same `undefined`-while-loading / `null`-if-not-found / cancelled-flag-on-unmount pattern, same `??` guard only for "was this ever attempted," never applied to a measured field's value.

**Region composition pattern** (lines 42-84, the `<article className="recipe-page">` region tree): the margin region (lines 77-81) is where `BatchMargin` attaches, above `advisory-slot`:
```jsx
<aside className="margin-region" aria-label="Margin">
  <p className="region-name">Margin</p>
  <Authored carriedForward={version.authored.carriedForward} beforeYouStart={version.authored.beforeYouStart} />
  <div className="advisory-slot" aria-label="Advisories" />
</aside>
```
Insert `<BatchMargin version={version} batch={batch} onSaveBatch={...} />` before `<Authored .../>` per CONTEXT.md's "margin region gains the batch-log block above the advisory slot and the authored notes, in the printed page's order" (code_context integration point). Follow the same `region-name` heading convention (`<p className="region-name">Margin</p>`) for any new sub-heading inside the batch block.

**Headnote pattern for the version-line change** (lines 44-49, D-21's "latest batch's churn date" addition):
```jsx
<header className="headnote">
  <p className="region-name">Headnote</p>
  <h1>{version.recipeName}</h1>
  <p className="headnote__version">{version.versionLabel}</p>
  <p className="headnote__prose">{version.headnote}</p>
</header>
```
Append the churn date to (or add a sibling `<p>` beside) `headnote__version`, computed from the latest batch by churn date, never a count (D-21).

---

### `app/src/ui/IngredientTable.jsx` (component, request-response — modify in place)

**Analog:** itself, current state

**Row-rendering + accessible-label pattern** (lines 26-31, 52-69):
```javascript
function rowAccessibleLabel(row, dataFlag, isMarked, markedFigureLabel) {
  const parts = [row.ingredientName, `${row.grams} g`];
  if (dataFlag) parts.push(dataFlag);
  if (isMarked) parts.push(`contributing to ${markedFigureLabel}`);
  return parts.join(', ');
}
```
```jsx
{rows.map((row) => {
  const dataFlag = dataFlagFor(row);
  const isMarked = markedRowIds.includes(row.id);
  return (
    <tr key={row.id} className={isMarked ? 'is-marked' : undefined} aria-label={rowAccessibleLabel(...)}>
      <td>{row.ingredientName}</td>
      <td>{row.grams} g</td>
      ...
```
For D-22's as-made column: add a new `<th scope="col">As made</th>` and a per-row `<td>` rendering an editable cell (RESEARCH.md Pattern 2's `AsMadeCell`) when in recording state, plain text when reading a saved batch — follow the existing `{value} g`-suffix convention for units, and extend `rowAccessibleLabel`'s array-join convention to name the as-made value when present, matching the existing "build the accessible name explicitly" project convention (`.claude/CLAUDE.md`).

**Total-row addition (D-22):** no existing total-row precedent in this file; the closest structural analog is `computeBalance`'s `mass` (composition.js line 22, `sumBy(rows, (r) => r.grams)`) — the plan-total and as-made-total should each be a `sumBy`-style reduction, not a new summation idiom.

---

### `app/src/ui/Method.jsx` (component, request-response — modify in place)

**Analog:** itself, current state

**Step-rendering pattern** (lines 6-37), particularly the target-chip precedent for a "changed" line's visual slot (lines 20-29):
```jsx
{step.targets?.length > 0 && (
  <p className="method-step__targets">
    {step.targets.map((target) => (
      <span className="target-chip" key={target.label}>
        <span className="target-chip__label">{target.label}</span>
        <span className="target-chip__value">{target.value}</span>
      </span>
    ))}
  </p>
)}
{step.purpose && <p className="method-step__purpose">{step.purpose}</p>}
{step.aside && <p className="method-step__aside">{step.aside}</p>}
```
Render-only-when-present is the established convention (`step.purpose &&`, `step.aside &&`) — the per-step strike and changed line (D-13) should follow the same pattern: `stepChange && <p className="method-step__changed">{stepChange}</p>`, plus a `struck` class toggle on the `<li>` (or the lead paragraph) driven by a boolean, never a colour (No-Verdict Rule, RESEARCH.md Anti-Patterns). The `id={`method-step-${step.n}`}` per-step anchor already exists — no new id scheme needed for D-13's per-step targeting.

---

### `app/src/ui/BatchMargin.jsx` (new component, request-response)

**Analog:** `app/src/ui/Authored.jsx` (list/legend shape) + `app/src/ui/FormulationNote.jsx` region-composition convention (not read in full this pass — referenced in RecipePage.jsx import; same `.jsx` component convention: default export function named for the file, props destructured in the signature, no local state beyond what's passed in)

**Legend/list pattern to copy from `Authored.jsx`** (full file, lines 1-28):
```jsx
export function Authored({ carriedForward, beforeYouStart }) {
  return (
    <div className="authored">
      <p className="authored__legend">
        <span>Carried forward</span>
        <span>authored</span>
      </p>
      <ul className="authored__notes">
        {carriedForward.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      ...
```
`BatchMargin` should follow this exact shape for its churn section and each tasting section: a labelled block (`<p className="batch-margin__legend">`) followed by the block's content, with no inline colour or icon distinguishing state (No-Verdict Rule) — "not yet evaluated" (D-05) and "date unknown" (D-03) are words in the same prose slot, not a visual treatment.

**No analog exists for:** the "Record a batch" / "Add a tasting" action controls, the save-state wording ("recorded 4 Aug 2026 against 50 g oil · 800 g"), or the amendment control — these are new interaction patterns with no in-repo precedent; RESEARCH.md Open Question #1 flags the exact wording as Claude's Discretion, to be proposed in the plan.

---

### `app/src/ui/AxisMark.jsx` (new component, request-response)

**No in-repo analog** — this is the first form-input component in the codebase; every existing `app/src/ui/*.jsx` file is read-only/display (props in, JSX out, no `onChange`/`useState` for user input). Use RESEARCH.md's Pattern 3 directly as the source pattern instead of an in-repo analog:

```jsx
const STOPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

function AxisMark({ axisKey, label, low, high, value, onChange }) {
  return (
    <fieldset className="axis-mark">
      <legend>{label}</legend>
      <div className="axis-mark__anchors" aria-hidden="true">
        <span>{low}</span><span>{high}</span>
      </div>
      <div className="axis-mark__stops" role="radiogroup" aria-label={`${label}, ${low} to ${high}`}>
        {STOPS.map((stop) => (
          <label key={stop}>
            <input
              type="radio"
              name={`axis-${axisKey}`}
              value={stop}
              checked={value === stop}
              onChange={() => onChange(stop)}
            />
            {stop}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
```
Do not hand-build arrow-key navigation — native grouped radios provide it (RESEARCH.md "Don't Hand-Roll" table, row 1). Leave `value` unset (`null`) rather than defaulting to a middle stop (D-16). Follow the project's explicit-`aria-label` convention already used elsewhere (e.g. `IngredientTable.jsx`'s `rowAccessibleLabel`) for the `radiogroup`'s accessible name.

---

## Shared Patterns

### Blank vs. zero vs. plan — never coalesce (applies to every batch-scoped field)
**Source:** `app/src/domain/figures.js` lines 100-102 (presence-check precedent) + RESEARCH.md Pitfall 1
**Apply to:** `batch.js`, `IngredientTable.jsx`'s as-made cells, `BatchMargin.jsx`'s churn/tasting fields
```javascript
// Branch on key presence, never on value truthiness
const band = Object.prototype.hasOwnProperty.call(targets, spec.targetKey) ? targets[spec.targetKey] : null;
```
Never write `value || fallback` for `asMadeGrams`, `comeUpMin`, `drawTempC`, `overrunPercent`, `meltdownLossG`, or any mark — always `value == null` / `value != null`.

### Structured-clone snapshot
**Source:** `app/src/data/olive-oil.js` lines 7-15 (`embed()`)
**Apply to:** `batch.js`'s `createBatch` (BATCH2-01's `snapshot.rows`)
```javascript
function embed(ingredientName, ingredient, fields) {
  return { ingredientName, ingredient: structuredClone(ingredient), ...fields };
}
```

### Collect-all-errors, refuse-whole-file validation
**Source:** `app/src/store/transfer.js` lines 61-113 (`validateVersion`, `validateStoreFile`)
**Apply to:** the new `validateBatch` function and its integration into `validateStoreFile`
```javascript
function validateVersion(version, path, errors) {
  if (!isPlainObject(version)) {
    errors.push(`${path}: expected an object`);
    return;
  }
  if (!isNonEmptyString(version.id)) errors.push(`${path}.id: expected a non-empty string`);
  ...
}
```

### Repository seam — thin async pass-through, no logic
**Source:** `app/src/store/repository.js` lines 8-31
**Apply to:** every new batch method (`listBatchesForVersion`, `getBatch`, `saveBatch`)
```javascript
async getVersion(id) {
  const db = await dbPromise;
  return db.get('versions', id);
},
```

### Explicit accessible names, no `dangerouslySetInnerHTML`
**Source:** `app/src/ui/IngredientTable.jsx` lines 26-31 (`rowAccessibleLabel`); `.claude/CLAUDE.md` conventions
**Apply to:** `BatchMargin.jsx`, `AxisMark.jsx`, and any new interactive control — build `aria-label` explicitly from component state; render all maker-typed free text (draw notes, tasting words, next-time note, ingredient notes) as plain JSX text interpolation, never through an HTML-injecting API.

### CSS tokens only, no literals
**Source:** `app/src/styles/tokens.css` lines 1-42
**Apply to:** any new stylesheet rules for the pen layer, the as-made column, and `AxisMark` — every colour/face/size/spacing/rule-weight value must read through an existing or newly-added custom property in `tokens.css` (`--pen-blue` is already defined and unused — this phase is its first paint).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `app/src/ui/AxisMark.jsx` | component (form control) | request-response | First user-input component in the codebase; every existing UI component is read-only/display. Use RESEARCH.md Pattern 3 (native grouped radios) as the source pattern instead of an in-repo analog. |
| `app/src/ui/BatchMargin.jsx` — action controls & save-state wording specifically | component | request-response | No prior "record/save/amend" interaction exists in the codebase; only the legend/list *display* shape is reusable from `Authored.jsx`. Wording is Claude's Discretion per CONTEXT.md, to be proposed in the plan. |

## Metadata

**Analog search scope:** `app/src/domain/`, `app/src/store/`, `app/src/ui/`, `app/src/data/`, `app/src/styles/tokens.css`, `app/src/router.jsx`
**Files scanned:** 18 (all non-test and test source files under `app/src`, plus `app/src/data/olive-oil.js` and `app/vitest.config.js`)
**Pattern extraction date:** 2026-09-06
