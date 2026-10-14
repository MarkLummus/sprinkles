# Phase 3: Develop the next version - Pattern Map

**Mapped:** 2026-09-07
**Files analyzed:** 17 (new + modified)
**Analogs found:** 17 / 17

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/src/domain/rows.js` (new) | utility (domain) | transform | `app/src/domain/composition.js` | role-match |
| `app/src/domain/lineage.js` (new) | utility (domain) | transform | `app/src/domain/batch.js` (`sortedBatches`, `latestChurnDate`) | exact |
| `app/src/domain/diff.js` (new) | utility (domain) | transform | `app/src/domain/figures.js` (`buildFigures`) | role-match |
| `app/src/domain/uses.js` (new) | utility (domain) | transform | `app/src/domain/batch.js` (`stepChangeFor`/`isStruck`, own-key presence style) | role-match |
| `app/src/domain/advisories.js` (new) | utility (domain) | transform | `app/src/domain/figures.js` (`buildFigures`) + old-sprinkles `advisories.js` (evidence only) | role-match |
| `app/src/store/versionLift.js` (new) | utility (store, migration) | batch/transform | `app/src/store/transfer.js` (`validateStoreFile`, pure collect-style function) | role-match |
| `app/src/store/db.js` (modified) | config/migration | event-driven (IDB upgrade) | itself (Phase 1/2 `upgrade` cumulative-guard style) | exact |
| `app/src/store/transfer.js` (modified) | service | file-I/O | itself (`validateVersion`, `importStore`) | exact |
| `app/src/store/repository.js` | service (seam) | CRUD | itself — unmodified unless new store methods needed | exact |
| `app/src/ui/RecipePage.jsx` (modified) | component (page/controller) | request-response + event-driven | itself (`'recording'` mode, draft/save/cancel handlers) | exact |
| `app/src/ui/IngredientTable.jsx` (modified) | component | request-response | itself (`AsMadeCell`, mode-gated cell rendering) | exact |
| `app/src/ui/Method.jsx` (modified) | component | request-response | itself (`stepChangeFor`-driven strike rendering, recording-mode controls) | exact |
| `app/src/ui/VersionStrip.jsx` (new) | component | request-response | `app/src/ui/RecipeList.jsx` (list of `Link`s over an array) | role-match |
| `app/src/ui/DerivedAdvisories.jsx` (new) | component | request-response | `app/src/ui/FormulationNote.jsx` (pure render over a domain array, `region-name` heading) | exact |
| `app/src/ui/BatchMargin.jsx` (modified) | component | request-response | itself (mode-branch rendering, tasting form/reading split) | exact |
| `app/src/ui/Authored.jsx` (modified) | component | request-response | itself (`authored__legend` note-list rendering) | exact |
| `app/src/data/olive-oil.js` (modified) | config/fixture (seed data) | batch | itself | exact |
| `app/src/router.jsx` | route config | request-response | itself — unmodified (D-02: no new route) | exact |

## Pattern Assignments

### `app/src/domain/rows.js` (new — utility, transform)

**Analog:** `app/src/domain/composition.js`

**Header comment convention** (composition.js lines 1-3):
```js
// Pure. No framework, no DOM, no store import. Reimplemented (not imported)
// from the old-sprinkles slice's composition.js — verified against the
// printed sheet: Olive Oil Ice Cream, 800 g, churned 2 Aug 2026.
```
Follow this exact opening-comment convention: state "Pure. No framework, no DOM, no store import." first line, every domain module.

**Filter pattern to write** (research-specified, matching existing filter style in `figures.js` lines 107-118 which iterates `version.rows` and tests `row.ingredient.composition[field]`):
```js
export function activeRows(version) {
  return version.rows.filter((row) => !row.removed);
}
export function activeSteps(version) {
  return version.method.filter((step) => !step.removed);
}
```
Call sites: everywhere `buildFigures(version)` or `computeBalance(version.rows)` is currently called directly with `version.rows}` (`FormulationNote.jsx:8`, `RecipePage.jsx:117`, `RecipeList.jsx:94`, `IngredientTable.jsx:73`) must pass `activeRows(version)`-filtered rows for the *clean* reading and figures; the pen's own draft table still renders every row (struck).

---

### `app/src/domain/lineage.js` (new — utility, transform)

**Analog:** `app/src/domain/batch.js` — `sortedBatches`, `latestChurnDate`, `formatRecordDate`

**Sort-without-mutating pattern** (`batch.js` lines 229-238):
```js
export function sortedBatches(batches) {
  return [...batches].sort((a, b) => {
    const aDate = a.churn.churnDate;
    const bDate = b.churn.churnDate;
    if (aDate === bDate) return 0;
    if (aDate === null) return 1;
    if (bDate === null) return -1;
    return aDate < bDate ? 1 : -1;
  });
}
```
Reuse this exact "never sorts in place, undated last" shape for a `sortedVersions(versions)` helper (creation order, most-recent-first, for the version strip and RecipeList's "most recently created version" grouping) — same tie-break discipline (`===` first, explicit null branches, never falsy comparisons).

**Presence-over-truthiness pattern** (`batch.js` lines 95-97, `hasAsMade`):
```js
export function hasAsMade(batch, rowId) {
  return Object.prototype.hasOwnProperty.call(batch.churn.asMade, rowId);
}
```
Apply the identical own-property-check style to `versionLineUnique(versions, candidateLine, excludeId)` and any presence test the lineage module needs — never `Boolean(x)`.

**Doc-comment convention for exported functions** (`batch.js` lines 33-40, `246-255`): a `/** functionName(args) -> return shape. Prose explaining the decision and which anti-pattern it avoids, citing a decision id (D-xx) or requirement id. */` block above every exported function. Match this exactly in `lineage.js`, `diff.js`, `uses.js`, `advisories.js` (cite D-01 through D-11 as appropriate).

---

### `app/src/domain/diff.js` (new — utility, transform)

**Analog:** `app/src/domain/figures.js` — `buildFigures`

**Core "assemble a described-value array" pattern** (`figures.js` lines 87-147): iterate a fixed spec list, compute a value, compute contributor rows, return one descriptor object per item — reuse this shape for `buildDiff(current, baseline)` producing one delta descriptor per row/step/figure rather than an ad hoc object.

```js
export function buildFigures(version) {
  const balance = computeBalance(version.rows);
  if (!balance) return [];
  const targets = version.targets ?? {};
  return FIGURE_SPECS.map((spec) => {
    const value = valueFor(spec);
    const band = Object.prototype.hasOwnProperty.call(targets, spec.targetKey) ? targets[spec.targetKey] : null;
    const deviation = describeDeviation(value, band, spec.decimals, spec.unit);
    // ...
    return { key: spec.key, label: spec.label, /* ... */ };
  });
}
```
`diff.js` should call `buildFigures(current)` and `buildFigures(baseline)` (both already filtered through `activeRows`/`activeSteps` per D-03's chosen baseline) and zip them by `key` to get per-figure deltas — never re-derive figure math independently (Pitfall 3 in RESEARCH.md warns against exactly this kind of drift).

**"Never mutates, never sorts" guarantee comment** (`figures.js` lines 82-85):
```js
/**
 * buildFigures(version) -> the six figure descriptors, in FIGURE_SPECS
 * order. Returns [] when the version has no rows... Never mutates the
 * version, its rows, or their embedded ingredient records, and never sorts
 * the rows.
 */
```
State the same guarantee explicitly for `buildDiff`.

---

### `app/src/domain/uses.js` (new — utility, transform)

**Analog:** `app/src/domain/batch.js` — `stepChangeFor`/`isStruck`/`changedLineFor` (own-key-map-keyed-by-string pattern)

```js
export function stepChangeFor(batch, n) {
  const key = String(n);
  return Object.prototype.hasOwnProperty.call(batch.churn.stepChanges, key) ? batch.churn.stepChanges[key] : null;
}
export function isStruck(batch, n) {
  const entry = stepChangeFor(batch, n);
  return entry ? entry.struck : false;
}
```
Model `stepsUsingRow(version, rowId)` / `rowsOrphanedByStepRemoval(version, stepN)` on this same "look up by string key, return null/false when absent, never throw" style — `uses` lists live on each step object per D-06/D-08, so this module reads `step.uses` (an array of row ids) directly rather than needing its own keyed-map lookup, but the "absence is a fact, not an error" doctrine from `batch.js` still governs: a step with no `uses` key must read as `[]`, never `undefined`.

**Stale-amount flag**: derive by comparing a row's current `grams` against the same row id's `grams` in the struck baseline (D-03's chosen comparison target, supplied by the caller) — this is `diff.js`'s row-delta output re-read for the specific rows named in a step's `uses`, not new math; `uses.js` should import from `diff.js`, not recompute deltas itself.

---

### `app/src/domain/advisories.js` (new — utility, transform)

**Analog (in-repo):** `app/src/domain/figures.js` — reuse `estimatedRowNames`/`basis` output directly (Pitfall 3, RESEARCH.md); do not rescan `library.js` independently for the estimated-exposure advisory.

**Analog (evidence only, do not copy code, working-case source outside repo):** `/Users/mark/Documents/projects/old-sprinkles/src/domain/advisories.js` — read for the four advisories' math shape (`subScaleBlend`, `heatCarriedForward`, `hydrationConflict`, `estimatedExposure`); reimplement framework-free against this repo's own row/library shapes, per D-05. Verified numbers to reproduce (RESEARCH.md Code Examples, cross-checked against `app/src/data/olive-oil.js` and `app/src/data/library.js` read this session):
- sub-scale: stabiliser rows (locustBeanGum 1.04 g, guarGum 0.48 g, carrageenan 0.16 g) × `equipment.batchesAhead` (4) = 6.72 g at `equipment.scaleResolutionG` (1 g).
- ultra-pasteurised mass: rows where `library[x].heatTreatment === 'ultra-pasteurised'` (wholeMilk 370.4 g + heavyCream 252.8 g = 623.2 g).
- hydration: `library[x].hydrationC` (locustBeanGum 82) vs `version.process.pasteuriseC` (69); NEW this phase — also scan `version.method` (post-`activeSteps` filter) for a step whose numeric `target.value` prefix is `>=` the conflicting temperature, naming that step (`step 2 targets '85 °C'`, `app/src/data/olive-oil.js` step 2).
- estimated exposure: build from `buildFigures(version)`'s `estimatedRowNames`/`key` output, not a fresh scan.

**Each advisory ends in a "basis:" line** — mirror `describeDeviation`'s `words` field style (`figures.js` lines 68-78: a short human sentence assembled from computed parts, never a template with raw numbers pasted in without labels).

---

### `app/src/store/versionLift.js` (new — utility, migration)

**Analog:** `app/src/store/transfer.js` — `validateStoreFile`'s pure, no-I/O, collect-and-return style; and `db.js`'s existing cumulative-guard comment convention.

**Idempotent pure-transform pattern to write** (per RESEARCH.md Pattern 1, matching this repo's `??`-default style already used throughout, e.g. `transfer.js` line 224's `parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2`):
```js
export function liftVersionRecord(raw) {
  return {
    ...raw,
    parentVersionId: raw.parentVersionId ?? null,
    parentVersionLabel: raw.parentVersionLabel ?? null,
    reason: raw.reason ?? null,
    citedBatchId: raw.citedBatchId ?? null,
    createdAt: raw.createdAt ?? SEED_CREATED_AT,
    rows: raw.rows.map((row) => ({ ...row, removed: row.removed ?? false })),
    method: (raw.method ?? []).map((step) => ({ ...step, removed: step.removed ?? false, uses: step.uses ?? [] })),
    authored: {
      carriedForward: raw.authored?.carriedForward ?? [],
      beforeYouStart: raw.authored?.beforeYouStart ?? [],
    },
  };
}
```
Must be synchronous (no `await` inside) — Pitfall 1 in RESEARCH.md — and idempotent, since both `db.js`'s cursor-lift and `transfer.js`'s import call it unconditionally per D-06/D-07.

**File-header comment convention** (`transfer.js` lines 1-6):
```js
// Whole-store JSON transfer (D-06), behind the repository seam. Neither
// export nor import touches the store library — see repository.js for the
// only path to IndexedDB.
```
Open `versionLift.js` with an equivalent one-paragraph comment naming D-06/D-07 and stating it is the one function shared by both call sites (no second lift ladder — RESEARCH.md's explicit anti-pattern).

---

### `app/src/store/db.js` (modified)

**Analog:** itself — the existing cumulative-guard `upgrade` callback.

**Current pattern** (full file, lines 8-24):
```js
export function openStore() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('versions')) {
        db.createObjectStore('versions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('batches')) {
        const batches = db.createObjectStore('batches', { keyPath: 'id' });
        batches.createIndex('by-version', 'versionId');
      }
    },
  });
}
```
This file currently guards by `objectStoreNames.contains` rather than `oldVersion` — the new branch must add an `oldVersion`-guarded cursor-lift (RESEARCH.md Pattern 1) *alongside* the existing containment checks, not replace them, and must accept the callback's `oldVersion`/`transaction` parameters that the current signature doesn't use:
```js
upgrade(db, oldVersion, newVersion, transaction) {
  if (!db.objectStoreNames.contains('versions')) { /* unchanged */ }
  if (!db.objectStoreNames.contains('batches')) { /* unchanged */ }
  if (oldVersion < 3) {
    // cursor-lift every stored version via liftVersionRecord — see
    // versionLift.js; only openCursor()/continue() may be awaited here.
  }
}
```
Bump `DB_VERSION` from `2` to `3` (RESEARCH.md Open Question 2 recommends bumping DB_VERSION and file `schemaVersion` in lockstep).

---

### `app/src/store/transfer.js` (modified)

**Analog:** itself — `validateVersion`, `importStore`.

**Extend `validateVersion`** (lines 171-194) with the same per-field `isFiniteNumber`/`isNonEmptyString`/`isAbsentOrNull` checks already used for every other field, for: `parentVersionId` (string or null), `reason` (string or null), `citedBatchId` (string or null), `createdAt` (non-empty string), each row's `removed` (boolean), each step's `removed` (boolean) and `uses` (array of strings). Follow the exact `errors.push(...)` message shape: `` `${path}.field: expected X, got ${JSON.stringify(value)}` ``.

**D-09 parent-resolves check**: add to `validateStoreFile` (lines 211-245) in the same "collect all errors, never stop at first" style — check every version's `parentVersionId` resolves to another version in the same file or (per RESEARCH.md Security Domain note) an id already in the store; this needs either `importStore` to run the check before `putAll` (since `validateStoreFile` is currently a pure function with no repository access — `transfer.js` lines 211-245) or a repository argument threaded through. Prefer keeping `validateStoreFile` pure and adding the store-existence check as a second gate inside `importStore` (lines 265-274), mirroring the existing two-step "validate then write" shape:
```js
export async function importStore(repository, parsed) {
  const { ok, errors } = validateStoreFile(parsed);
  if (!ok) return { ok: false, errors };
  // NEW: lift schemaVersion-2 version records, then D-09's parent-resolves check
  await repository.putAll(parsed.versions);
  if (parsed.schemaVersion === 2) {
    await repository.putAllBatches(parsed.batches);
  }
  return { ok: true, errors: [] };
}
```
**`exportStore`** (lines 247-258) always writes `schemaVersion: 2` today — bump to match the new file schemaVersion number chosen for `versionLift.js`/D-07 (kept in lockstep with `DB_VERSION`, RESEARCH.md Open Question 2).

---

### `app/src/ui/RecipePage.jsx` (modified — component, request-response + event-driven)

**Analog:** itself — the existing `mode`/`draft` state machine.

**Mode-as-single-discriminant pattern** (line 66):
```js
const [mode, setMode] = useState('reading');
```
Add `'developing'` as a third value, never a second boolean — RESEARCH.md Pattern 4 and Pitfall 4 both require this for "the two pens never open together": every place `mode === 'recording'` gates a control today must gain a parallel `mode === 'developing'` check (BatchMargin's start-recording/start-amending controls disabled while developing; the pen's own open control disabled while `mode === 'recording'`).

**Draft-dirty presence check pattern** (lines 19-32, `isDraftDirty`):
```js
function isDraftDirty(mode, draft) {
  if (mode !== 'recording' || !draft) return false;
  return (
    draft.churnDate !== '' ||
    Object.keys(draft.asMade).length > 0 ||
    // ...
  );
}
```
Write an equivalent `isPenDraftDirty(mode, penDraft)` testing every pen-draft field against `''`/`{}` (never truthiness), and extend the `beforeunload` effect (lines 102-111) to also key off it — do not introduce `useBlocker` (RESEARCH.md Anti-Pattern, explicitly rejected by D-10).

**Save-handler impurity-isolation pattern** (lines 228-272, `handleSaveBatch`): `crypto.randomUUID()`/`new Date()` called only inside the one save handler, never in a domain function — the new "save as new version" / "save over this version" handler must follow this exactly, calling a pure domain constructor (analogous to `createBatch`) with `{ id, now }` supplied from the handler.

**Cancel-discards-silently pattern** (lines 274-286, `handleCancelRecording`):
```js
function handleCancelRecording() {
  setMode('reading');
  setDraft(null);
  setAmendingBatchId(null);
}
```
Mirror exactly for the pen's cancel — no dialog (D-10).

**Region wiring** (lines 350-452): the pen's fields slot into `IngredientTable`/`Method`/margin exactly as `mode`/`draft` already thread through those three components' props today — add `?changes` via `useSearchParams` (RESEARCH.md Pattern 3) read once at the top of the component, next to `useParams()`.

---

### `app/src/ui/IngredientTable.jsx` (modified — component, request-response)

**Analog:** itself.

**Mode-gated editable-cell pattern** (`AsMadeCell`, lines 40-58): the grams cell in `'developing'` mode should follow this identical branch-by-mode shape — a controlled `<input>` bound to the draft's raw string while `mode === 'developing'`, an `ink-text` span otherwise, with the same `aria-label` composition style (line 49) and the same never-round-mid-keystroke discipline (RESEARCH.md Pitfall 5, `asMade` precedent at lines 42-52).

**Never-sort/never-reorder discipline** (comment, lines 60-63): "The twelve rows in the version's authored order... Never sort, never re-order, never group." — removed rows must render struck in place, never filtered out of the pen's own table (only the clean/figures reads filter via `activeRows`).

---

### `app/src/ui/Method.jsx` (modified — component, request-response)

**Analog:** itself.

**Struck-with-sibling-label pattern** (lines 42-55) — load-bearing accessibility detail:
```jsx
<span className={struck ? 'method-step__prose--struck' : undefined}>
  <b>{step.leadIn}.</b> {step.instruction}
</span>
{struck && <span className="method-step__skipped-label"> Skipped</span>}
```
Comment explains why (lines 46-53): a CSS text-decoration cannot be switched off by a descendant, so the "Skipped"/"removed" label must be a **sibling**, not nested inside the struck span. Apply identically to step/row removal labels ("uses soy lecithin, which is removed").

**Thin-wrapper-around-batch-shaped-object pattern** (line 16): `const batchLike = { churn: { stepChanges } };` — `Method` never imports a batch record itself, only reads through tested functions against an object shaped like what those functions expect. The pen's `uses`/stale-amount rendering should follow the same "adapt to the existing domain function's expected shape at the call site" discipline rather than teaching `Method` new domain imports beyond `uses.js`/`diff.js`.

---

### `app/src/ui/VersionStrip.jsx` (new — component, request-response)

**Analog:** `app/src/ui/RecipeList.jsx`

**List-of-links-over-array pattern** (lines 92-105):
```jsx
<ul className="recipe-list">
  {versions.map((version) => (
    <li key={version.id}>
      <Link to={`/recipe/${version.id}`}>
        <span className="recipe-list__name">{version.recipeName}</span>
        <span className="recipe-list__version">{version.versionLabel}</span>
      </Link>
    </li>
  ))}
</ul>
```
Model the version strip on this identical shape: one `<li>` per version (sorted via `lineage.js`'s `sortedVersions`), a `Link` to `/recipe/:id`, `versionLabel` as the visible text — creation order per D-06's `createdAt`.

---

### `app/src/ui/DerivedAdvisories.jsx` (new — component, request-response)

**Analog:** `app/src/ui/FormulationNote.jsx`

**Pure-render-over-domain-array pattern** (full file, lines 1-34):
```jsx
export function FormulationNote({ version, mode, onFocusFigure, onBlurFigure }) {
  const figures = buildFigures(version);
  if (figures.length === 0) return null;
  return (
    <div className="formulation-note">
      <h2 className="region-name">Formulation note</h2>
      {figures.map((figure) => ( /* ... */ ))}
    </div>
  );
}
```
`DerivedAdvisories` should call `buildAdvisories(version)` from the new `advisories.js`, return `null` when the array is empty, and render a `region-name`-headed block the same way — placed in `RecipePage.jsx` "after the batch record and before the authored notes" (D-10), i.e. between `BatchMargin` and `Authored`, replacing the empty `<div className="advisory-slot" ... />` placeholder (line 447).

---

### `app/src/ui/BatchMargin.jsx` (modified — component, request-response)

**Analog:** itself.

Mode-branch rendering (component reads `mode`/`openBatch`/`tastingDraft` to pick one of three render branches — read in full this session, lines 1-352) must gain a fourth check: whenever `mode === 'developing'`, the batch-starting controls (`onStartRecording`/`onStartAmending` buttons) must be disabled or hidden, mirroring how `FormulationNote.jsx` already disables tab stops during `'recording'` (`tabIndex = mode === 'recording' ? -1 : undefined`, `FormulationNote.jsx` line 16) — same "derive a disabled/hidden state from mode, don't add a second flag" discipline.

---

### `app/src/ui/Authored.jsx` (modified — component, request-response)

**Analog:** itself.

**Legend-plus-list pattern** (full file): each note list is headed by a `<p className="...__legend">` naming the block and a qualifier span ("authored"). The inherited-note marker ("from <parent line>") should render as an equivalent trailing qualifier on the individual `<li>` rather than a new list-level legend, keeping the "kept visibly apart from anything the app derives" comment's intent (lines 1-3) — an inherited note is still authored prose, just carrying provenance.

---

### `app/src/data/olive-oil.js` (modified — fixture/config, batch)

**Analog:** itself.

**`embed()` deep-copy pattern** (lines 8-15):
```js
function embed(ingredientName, ingredient, fields) {
  return {
    ingredientName,
    ingredient: structuredClone(ingredient),
    ...fields,
  };
}
```
Comment (lines 7-9) states why: "a stored version is self-contained... a later edit to the shared `library` must never move a figure already computed from a version's own rows." D-08's `uses` lists are added as a new field on each `method` step object (not on rows), following the same "spread extra fields into the embedded/authored record" convention already used for `step`/`splitStep` on rows.

## Shared Patterns

### Pure domain module header + doc-comment convention
**Source:** `app/src/domain/composition.js` lines 1-3; `app/src/domain/batch.js` lines 33-40 (per-function doc blocks)
**Apply to:** `rows.js`, `lineage.js`, `diff.js`, `uses.js`, `advisories.js` — every new domain module.
```js
// Pure. No framework, no DOM, no store import.
/**
 * functionName(args) -> return shape. Prose explaining the rule and which
 * decision id (D-xx) or anti-pattern it settles.
 */
```

### Presence-over-truthiness (own-property checks, never `||`/`Boolean()`)
**Source:** `app/src/domain/batch.js` lines 95-97 (`hasAsMade`), `app/src/domain/figures.js` line 102 (band lookup)
**Apply to:** `removed` flags, `uses` lists, `reason`/`citedBatchId` fields — anywhere "was this ever set" must be distinguished from "is this falsy" (a version legitimately removed with reason `''`/no reason must still read distinctly from a version whose reason field is simply absent from an old record).

### Impure calls isolated to the one save handler
**Source:** `app/src/ui/RecipePage.jsx` line 264 (`handleSaveBatch`)
**Apply to:** the new "save as new version"/"save over this version" handler — `crypto.randomUUID()`/`new Date()` called only there; `lineage.js`/`diff.js` functions take `{ id, now }` as parameters, never call these themselves.

### Mode-as-single-discriminant state machine
**Source:** `app/src/ui/RecipePage.jsx` line 66
**Apply to:** adding `'developing'` alongside `'reading'`/`'recording'` — never a second independent boolean flag, so mutual exclusivity (D-10: "the plan's pen and the batch's pen are never open together") is structurally free rather than separately enforced.

### Struck-value-with-sibling-label rendering (the Strike Rule)
**Source:** `app/src/ui/Method.jsx` lines 42-55
**Apply to:** every place D-10's "strike-and-beside" tracked-changes rendering appears — `IngredientTable.jsx` row cells, `Method.jsx` step prose, `FormulationNote.jsx`/`GraduatedRule.jsx` figure heads (per the focal-moment description in CONTEXT.md `<specifics>`).

### Validate-then-write, collect-all-errors, never partial-apply
**Source:** `app/src/store/transfer.js` lines 211-274 (`validateStoreFile`, `importStore`)
**Apply to:** the D-09 parent-resolves check and any new version-field validation — extend the existing error-collecting style, never throw early or write before validation completes.

## No Analog Found

None — every file in this phase's scope has a strong in-repo analog (all "exact" or "role-match"); the only *evidence-only, do-not-copy* source is `old-sprinkles/src/domain/advisories.js`, explicitly not to be imported (D-05, CONTEXT.md canonical refs).

## Metadata

**Analog search scope:** `app/src/domain/`, `app/src/store/`, `app/src/ui/`, `app/src/data/`, `app/src/router.jsx` (full repo scope for this Vite workspace; no directories excluded).
**Files scanned:** 15 read in full this session (`RecipePage.jsx`, `IngredientTable.jsx`, `Method.jsx`, `db.js`, `transfer.js`, `repository.js`, `figures.js`, `composition.js`, `batch.js`, `router.jsx`, `RecipeList.jsx`, `BatchMargin.jsx` (partial), `FormulationNote.jsx`, `Authored.jsx`, `olive-oil.js`/`library.js` (partial)); all are git-tracked source under `app/src/`, none under a gitignored mirror.
**Pattern extraction date:** 2026-09-07
