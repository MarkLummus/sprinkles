# Phase 2: Record the first batch - Research

**Researched:** 2026-09-06
**Domain:** Client-only React + IndexedDB feature addition (batch recording) on an existing book-spread recipe UI
**Confidence:** HIGH

## Summary

Phase 2 adds a second stored record type (`batches`) and a writable "pen layer" to the existing `RecipePage`. No new runtime dependency is needed: React 19.2.8, react-router 8.3.1, and `idb` 8.0.3 are already installed and already the sole store path `[VERIFIED: app/src/store/repository.js:1-32]`. The work is almost entirely a continuation of patterns Phase 1 already established — a framework-free domain module for pure logic (mirroring `app/src/domain/composition.js` and `figures.js`), a thin repository seam extension, an IndexedDB version bump with an additive `upgrade()` branch, two new route entries resolving to the same `RecipePage` component, and explicit `aria-label`s for anything that must be provably in the accessible name.

The one substantive new mechanic is the churn-event-plus-tastings record shape (D-01 through D-09) and its "blank vs. absent vs. zero" discipline (D-11, D-18): every measured/as-made field must distinguish "not written" (`null`/absent) from a written `0`, and no field may ever inherit a value from the recipe. The other new mechanic is the "nine-stop labelled keyboard group" mark control (D-16): this is exactly native HTML radio-button-group behavior (arrow keys move selection, one click sets, group has one accessible name) and should not be hand-built with custom keydown handling.

**Primary recommendation:** Add a `app/src/domain/batch.js` pure module (create/snapshot/add-tasting/amend/sort-tastings functions, all taking `id`/`now` as parameters rather than calling `crypto.randomUUID()`/`new Date()` internally, so they stay unit-testable exactly like `figures.js`), bump `DB_VERSION` to 2 with an additive `batches` object store + `by-version` index, extend `repository.js` and `transfer.js` in place, add two router entries pointing at the existing `RecipePropage` component, and implement the axis-mark control as native grouped radio inputs inside a `<fieldset>`.

## User Constraints (from CONTEXT.md)

<user_constraints>

### Locked Decisions

- **D-01:** A batch is one churn event plus zero or more tastings. The churn event owns the churn date, the as-made amounts per row, the per-step strikes and changed lines, come-up time, draw temperature, overrun, and draw notes. A tasting owns its own date, the tasting temperature, the marks on the core and declared axes, the meltdown loss, the words, and the next-time note. — **Reversibility: costly.**
- **D-02:** A tasting saves with at least one of words or marks; nothing else is required.
- **D-03:** A tasting's date may be absent and then reads "date unknown" in ink. Tastings are ordered by date with undated ones last.
- **D-04:** A next-time note, labelled as intention, can be written on the churn section and on each tasting; not exclusive to tastings.
- **D-05:** "Not yet evaluated" means the batch has no tasting yet; the margin offers to add one. The "as expected, nothing to note" shortcut writes those words into the tasting's words field.
- **D-06:** Amendments are recorded as `recordedAt` plus a list of amendment dates on the batch; the page shows the latest beside the churn date. Prior field values are not kept. Adding a tasting is never an amendment. The snapshot is never retaken.
- **D-07:** Tasting temperature is recorded per tasting as a measured field, never taken from the version's serve target. Blank reads unknown like every other measured field.
- **D-08:** Meltdown belongs to the tasting event. Entered as one field, the loss in grams at 20 min.
- **D-09:** One optional free-text "ingredient notes" line on the batch holds untyped facts (oil bottle open date, cream butterfat).
- **D-10:** The 2 Aug working case transcription (churn date 2 Aug 2026; milk 370.4→383; cream 252.8→241; oil 40→45; step 8 blend 45s→60s; come-up 20 min; draw −6°C; overrun unmeasured; draw notes "Soft, not greasy"; tasting −12°C, oil character 4.5, bitterness 5, sweetness 4; meltdown 3g at 20 min) is confirmed, with the correction that step 9's annotation reads "Speed Δ @ 20 min" (machine speed changed at 20 min), not a setting named "Speed A".
- **D-11:** The lecithin was skipped: as-made 0 g, step 1 struck. 0 is a real as-made value, distinct from blank.
- **D-12:** "Actually 45 g" was captured during the churn, not an amendment. Amend is exercised in UAT via a deliberate later edit.
- **D-13:** Step 3 stays unmarked in the 2 Aug record; the as-made column alone carries 383 and 241. Method-step-amounts-as-ingredient-references is deferred to Phase 3.
- **D-14:** Each axis is 1–5 with half steps, behavioural anchor words at the ends, never adjectival. Four core axes: hardness, scoopability, smoothness, sweetness, using `old-sprinkles` `CORE_AXES` anchors. Signed scale rejected. No overall rating.
- **D-15:** Declared axes carry anchors authored on the version: `declaredAxes` becomes `{ name, low, high }`. Seed's two: olive oil character, bitterness. — **Reversibility: costly.**
- **D-16:** A mark is entered as a nine-stop labelled keyboard group (1, 1.5, …, 5); arrow keys move a half step, one click sets. A half step is a value, not a rounding. Any axis may stay unmarked.
- **D-17:** Overrun is a typed percentage, one field. Come-up is a plain number of minutes.
- **D-18:** Precision: come-up whole minutes; draw/tasting temperature to a half degree with a leading sign; overrun whole percent; meltdown loss whole grams. Anything typed finer is kept as typed, never rounded. Every measured field is a plain number or absent.
- **D-19:** A saved batch's URL is `/recipe/:id/batch/:batchId`; the page is the same recipe page with that batch's layer showing. No route for the recording state itself.
- **D-20:** A batch has an opaque generated id (`crypto.randomUUID()`); the churn date is its label. — **Reversibility: costly.**
- **D-21:** The version line under the recipe name carries the latest batch's churn date only, never a count and never the print date.
- **D-22:** The as-made column's arrival lands three carries together: numeric columns right-aligned and sized to content; a total row (plan total, and an as-made total summing as-made-where-written / plan-elsewhere); "trace" or a further decimal for rows under 0.05%.
- **D-23:** A blue "actual" beside each target chip is deferred to Phase 3.
- **D-24:** Leaving the page with unsaved ink uses the browser's own leave warning only. Draft persistence across reload is UX1-02, Phase 4.
- Carried from Phase 1 (D-05, D-06, D-14, D-15): versions embed their rows' coefficients; IndexedDB behind the repository seam is the only store path; routes are URL-addressable; Vitest with a node-environment domain suite.
- Outcome dimensions are four fixed core axes plus the version's declared axes.
- The confirmed brief `.impeccable/surfaces/route-recipe-batch.md` is the design contract (see Canonical References below) — its ceremony, states, anti-goals, and "must not be invented" list bind implementation.

### Claude's Discretion

- The store shape: a separate `batches` object store keyed by id with an index on the version id, the DB version bump and its upgrade path, and the batch record's field names and schema-version field. Export and import carry batches; the store file's `schemaVersion` moves to 2 and the validator covers batch records with the same refuse-whole-file rule as versions. Whether a `schemaVersion` 1 file still imports is Claude's call, stated in the plan.
- The repository seam's new methods, sized to Phases 2–4.
- The snapshot's exact contents beyond rows and coefficients (the brief says rows and coefficients; the coefficient set id is stable and must be cited).
- Component decomposition of the pen layer within the recipe page's regions; how the tab order follows the sheet's order; the wording of "recorded 4 Aug 2026 against 50 g oil · 800 g" and "date unknown" beyond what the brief fixes.
- The exact wording of the empty margin's "no batch yet" state and how a version with two batches lists them.
- How the seed carries the 2 Aug batch for the fixture and UAT (seeded like the version, or entered in UAT), provided the stored record is indistinguishable from one the maker typed.

### Deferred Ideas (OUT OF SCOPE)

- Structured machine settings on the version's equipment profile (Whynter: Fast, Soft, Prechill 15 min) — later, recipe side.
- The printed recipe shows no equipment details at all — Phase 4 print carry.
- Micro-ingredient handling below 1 g kitchen-scale resolution — Phase 3 (master-blend multiple) / Phase 4 (printed sheet).
- Method step amounts as references to ingredient rows (replacement macros) — Phase 3 editing; decision input recorded in D-13.
- A common library of declared dimensions with behavioural anchors — later phase, with the ingredient or recipe library.
- A blue "actual" beside each target chip — after the step-macro work (D-23).
- The batch's as-made value as a second tick on each graduated rule — deferred by the brief.
- Draft persistence of unsaved ink across reload — UX1-02, Phase 4 (D-24).

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BATCH1-01 | Maker can record a batch against the churned version with its churn date, an as-made amount per row where it differed from the plan, and process deviations (changed or skipped steps), kept separate from the recipe's planned values. | `domain/batch.js` snapshot pattern; as-made column pattern (`IngredientTable` extension); per-step strike/change line pattern (`Method` extension). See Architecture Patterns, Code Examples. |
| BATCH1-02 | Maker can record measured values (come-up time, draw temperature, overrun, meltdown); a field left blank stays unknown and is never filled from the recipe. | Blank-vs-zero-vs-absent discipline (Common Pitfalls #1); precision rules D-18; controlled-input pattern in Code Examples. |
| BATCH2-01 | A batch stores a snapshot of the recipe rows and the ingredient coefficients it was computed with; later edits to the recipe or ingredient data do not change what the batch shows. | `structuredClone` snapshot pattern already proven in `app/src/data/olive-oil.js:10-16`; Common Pitfall #4 (never re-derive from the live version). |
| BATCH2-02 | Maker can reopen a batch and see it together with the recipe version it used, its measured values, and its result. | Routing pattern (`/recipe/:id/batch/:batchId`); `RecipePage` reads the batch snapshot, not the live version, for batch-scoped fields. |
| OBS1-01 | Maker can record how the batch turned out in their own words, and optionally add structured dimensions, with no required field beyond the words. | Tasting save-gate `isTastingSaveable` (Code Examples); "as expected, nothing to note" shortcut; radio-group axis-mark pattern. |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Pen-layer UI (as-made column, step strikes/lines, churn/tasting forms) | Browser / Client | — | Pure React component state; no server tier exists in this app `[VERIFIED: app/src/router.jsx:1-17 — only client routes, no server code under app/src]` |
| Batch record shape, snapshot rules, tasting ordering, save-gate logic | Browser / Client (pure domain module) | — | Mirrors `app/src/domain/composition.js`/`figures.js`, which are explicitly framework-free and DOM-free `[VERIFIED: app/src/domain/composition.js:1-3]` |
| Batch persistence (`batches` store, snapshot storage) | Database / Storage (IndexedDB via `idb`) | Browser / Client (repository seam) | `app/src/store/db.js` is "the only module under app/src that touches the store library" `[VERIFIED: app/src/store/db.js:6-7]`; all reads/writes go through `repository.js` |
| Whole-store export/import including batches | Browser / Client (local file I/O) | Database / Storage | `transfer.js` already does whole-store JSON transfer with no network call `[VERIFIED: app/src/store/transfer.js:1-6]` |
| Routing for `/recipe/:id/batch/:batchId` | Browser / Client | — | `react-router`'s `createBrowserRouter`, client-side only `[VERIFIED: app/src/router.jsx:1-16]` |

**Note for the planner:** there is no "API / Backend" or "Frontend Server (SSR)" tier in this project — it is a Vite-bundled client SPA with a local IndexedDB store and no server component. Any plan step that introduces a server call, an API route, or SSR would be a scope violation of the ratified stack `[CITED: CLAUDE.md "React with JSX, bundled by Vite" / .claude/CLAUDE.md:29-31]`.

## Standard Stack

### Core

No new runtime package is required. All libraries this phase needs are already installed and already the ratified stack:

| Library | Version | Purpose | Why Standard (here) |
|---------|---------|---------|--------------|
| react / react-dom | 19.2.8 | UI | Already ratified `[VERIFIED: app/package.json]` |
| react-router | 8.3.1 | Client routing, incl. the new `/recipe/:id/batch/:batchId` route | Already the router; `createBrowserRouter`/`useParams`/`Link` already in use `[VERIFIED: app/src/router.jsx:1-16, app/src/ui/RecipeList.jsx:2]` |
| idb | 8.0.3 | Thin Promise wrapper over IndexedDB | Already the only store dependency `[VERIFIED: app/src/store/db.js:1]` |
| vitest | 5.0.0 | Domain unit tests | Already the test runner; domain suite runs `environment: 'node'` by default `[VERIFIED: app/vitest.config.js:1-8]` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | — | This phase adds no new dependency. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native radio-button group for the 9-stop mark control (D-16) | A custom `role="radiogroup"` div with hand-rolled `onKeyDown` arrow handling | Native `<input type="radio">` grouped by `name` gets arrow-key movement, Home/End, and a correct accessible name for free from every browser; a hand-rolled version duplicates behavior the platform already provides and is exactly the kind of "don't hand-roll" case CLAUDE.md's Simplicity First principle warns against. Only reach for the custom version if the visual "nine-stop" design (hairline ink, no native radio dot) cannot be achieved by restyling native radios — restyling (`appearance: none` + custom `:checked` rendering with existing ink/pen-blue tokens) is standard and keeps native keyboard semantics. |
| Storing `asMadeGrams` as a plain nullable number | Storing it as a string to "preserve exactly what was typed" | D-18 says a value is "a plain number or absent" and that un-rounded precision is "kept as typed" only via *not calling `toFixed`/`Math.round` on it* — storing a live JS number and never rounding it on read already satisfies this. A string would complicate the total-row arithmetic (D-22) for no benefit. |
| A single flat `batches` store record shape mixing churn + tastings inline | Splitting churn and tastings into two IndexedDB object stores | D-01 fixes the conceptual model (one churn event + N tastings) but does not require two stores. One `batches` record with a `tastings: []` array is simpler, matches how the brief describes reading "a batch...together with...its result" (BATCH2-02) as one page, and avoids a second index/join. Use a second store only if a future phase needs to query tastings independently of their batch — no such requirement exists yet. |

**Installation:** none — no `npm install` needed for this phase.

**Version verification:** No new packages recommended, so the install-verification step (`npm view … version`) does not apply. Existing versions were confirmed by reading `app/package.json` directly this session (react 19.2.8, react-dom 19.2.8, react-router 8.3.1, idb 8.0.3, vitest 5.0.0, vite 8.2.2, @vitejs/plugin-react 6.1.1) `[VERIFIED: app/package.json]`.

## Package Legitimacy Audit

**N/A — this phase introduces no new external package.** All work is additive code against already-installed, already-audited dependencies (react, react-dom, react-router, idb, vitest, vite — all approved in Phase 1). If the planner's task breakdown surfaces a need for a package not already installed (e.g., a DOM testing library — see Common Pitfalls #9), run the Package Legitimacy Gate protocol against that specific package before recommending it.

**One thing worth flagging to the planner, not a package decision:** `app/package-lock.json` lists `jsdom` and `happy-dom` only as **optional peer dependencies of `vitest`** — neither is actually installed (`ls app/node_modules` has no `jsdom`/`happy-dom` directory) `[VERIFIED: app/package-lock.json:1138-1176 — "peerDependenciesMeta": { "happy-dom": { "optional": true }, "jsdom": { "optional": true } }, confirmed absent from app/node_modules by directory listing]`. Phase 1 avoided needing a DOM environment by testing component output with `react-dom/server`'s `renderToStaticMarkup` (static markup assertions only) and deferring all interactive/keyboard/visual checks to end-of-phase human verification `[VERIFIED: .planning/phases/01-read-the-churned-recipe/01-04-SUMMARY.md — "renderToStaticMarkup(<IngredientTable .../>) inspected directly during execution"]`. Phase 2 has more interactive surface (typed fields, a keyboard mark group, save/amend flows); the planner should decide explicitly whether to (a) keep following Phase 1's pattern — pure-function unit tests for all business logic in `domain/batch.js`, `renderToStaticMarkup` for static markup shape, human verification for interaction — or (b) add `jsdom`/`happy-dom` + a DOM testing utility as a new dependency. Given `workflow.nyquist_validation: false` in `.planning/config.json` `[VERIFIED: .planning/config.json]` and CLAUDE.md's Simplicity First principle, (a) is the lower-risk default and needs no new package; call out (b) only if the plan finds specific interaction logic that cannot be tested as a pure function.

## Architecture Patterns

### System Architecture Diagram

```
Browser (single Vite-bundled SPA, no server tier)
│
├─ react-router (client-side)
│    "/"                          → RecipeList
│    "/recipe/:id"                → RecipePage (latest batch, if any, D-21)
│    "/recipe/:id/batch/:batchId" → RecipePage (that batch's layer, D-19)
│
├─ RecipePage (app/src/ui/RecipePage.jsx)
│    ├─ reads version  ──▶ repository.getVersion(id)
│    ├─ reads batch(es) ──▶ repository.listBatchesForVersion(id) / repository.getBatch(batchId)
│    ├─ IngredientTable  — plan grams (black) + as-made column (pen blue), D-22 total row
│    ├─ Method            — per-step strike / changed-line (pen blue), D-13
│    └─ Margin
│         ├─ "Record a batch" control → opens pen layer (churn section first, D-*)
│         ├─ Churn section  (date, come-up, draw temp, overrun, draw notes,
│         │                  ingredient notes, next-time note)
│         └─ Tasting section(s), one per tasting, ordered by date (undated last, D-03)
│              "Add a tasting" control → opens one more tasting section
│
├─ domain/batch.js (pure, no framework/DOM/store import — mirrors composition.js/figures.js)
│    createBatch(version, churnFields, { id, now })     → new batch, embeds structuredClone(version.rows)
│    addTasting(batch, tastingFields, { id, now })      → new batch with tasting appended
│    recordAmendment(batch, churnFields, now)           → new batch with amendmentDates + updated churn fields
│    isTastingSaveable(tasting)                         → boolean (D-02/OBS1-01 gate)
│    sortedTastings(batch)                              → tastings ordered by date, undated last (D-03)
│    hasTasting(batch)                                  → boolean ("not yet evaluated", D-05)
│
└─ store/ (the only path to IndexedDB)
     repository.js  — listVersions/getVersion/saveVersion (existing)
                       + listBatchesForVersion/getBatch/saveBatch (new, thin CRUD only)
     db.js          — DB_VERSION 2, 'versions' store (unchanged) + 'batches' store (new, keyPath 'id',
                       index 'by-version' on versionId)
     transfer.js    — exportStore/importStore/validateStoreFile extended to schemaVersion 2, carries
                       both versions[] and batches[]
```

Data flow for the primary use case (record the 2 Aug batch): maker clicks "Record a batch" in the margin → pen layer opens on `RecipePage`, focus lands on churn date → maker types into as-made column cells, strikes/changes method steps, fills the churn section → clicks "Save batch" → a click handler calls `batch.createBatch(version, formState, { id: crypto.randomUUID(), now: new Date().toISOString() })` → the resulting record is passed to `repository.saveBatch(record)` → on success, `history`/`navigate` moves the URL to `/recipe/:id/batch/:batchId` (D-19) and the page re-renders in reading state showing the saved batch.

### Recommended Project Structure

```
app/src/
├── domain/
│   ├── composition.js      (existing)
│   ├── figures.js          (existing)
│   ├── batch.js            (new — pure batch-shape logic: create/snapshot/addTasting/amend/sort/gates)
│   └── batch.test.js       (new — Vitest, environment: 'node', mirrors figures.test.js style)
├── store/
│   ├── db.js               (modified — DB_VERSION 2, 'batches' store + index)
│   ├── repository.js       (modified — new batch CRUD methods)
│   ├── transfer.js         (modified — schemaVersion 2, validateBatch)
│   └── seed.js             (possibly modified — seed the 2 Aug batch too, per Claude's Discretion)
├── ui/
│   ├── RecipePage.jsx      (modified — reads batch(es), holds pen-layer open/closed + form state)
│   ├── IngredientTable.jsx (modified — as-made column, total row, trace/decimal for <0.05%)
│   ├── Method.jsx          (modified — per-step strike + changed-line)
│   ├── BatchMargin.jsx     (new — "Record a batch" control, churn section, tasting section(s), states)
│   ├── AxisMark.jsx        (new — the 9-stop radio-group mark control, reusable across all axes)
│   └── ...
└── router.jsx              (modified — two route entries pointing at RecipePage, D-19)
```

### Pattern 1: Pure domain module for record shape, with injected id/time

**What:** Keep every rule about what a valid batch/tasting record looks like (snapshotting, ordering, the save-gate, amendment bookkeeping) in a plain function under `app/src/domain/`, never inline in a component. The function receives `id` and `now` as parameters instead of calling `crypto.randomUUID()`/`new Date()` itself.

**When to use:** Any time a rule from CONTEXT.md's Decisions section (D-01 through D-09, D-16, D-18) needs to be enforced — these are exactly the kind of business rules `composition.js`/`figures.js` already model as pure, framework-free functions `[VERIFIED: app/src/domain/composition.js:1-3, app/src/domain/figures.js:1-6]`.

**Example:**
```javascript
// app/src/domain/batch.js — pattern only; field names are the planner's/Claude's discretion call.
// Pure. No framework, no DOM, no store import — mirrors composition.js/figures.js.
import { structuredClone as clone } from 'node:structuredClone'; // not needed: structuredClone is a global

export function createBatch(version, churnFields, { id, now }) {
  return {
    id,
    versionId: version.id,
    recordedAt: now,
    amendmentDates: [],
    snapshot: {
      coefficientSetId: version.coefficientSetId,
      rows: structuredClone(version.rows), // BATCH2-01: never re-derived from the live version later
    },
    churn: { ...churnFields }, // churnDate, asMade: {rowId: number|null}, stepChanges: {...}, comeUpMin, drawTempC, overrunPercent, drawNotes, ingredientNotes, nextTimeNote
    tastings: [],
  };
}

export function addTasting(batch, tastingFields, { id }) {
  if (!isTastingSaveable(tastingFields)) throw new Error('a tasting needs words or marks');
  return { ...batch, tastings: [...batch.tastings, { id, ...tastingFields }] };
}

// OBS1-01 / D-02: "no required field beyond the words when words are given"
export function isTastingSaveable(tasting) {
  const hasWords = typeof tasting.words === 'string' && tasting.words.trim().length > 0;
  const hasMarks = Object.values(tasting.marks ?? {}).some((v) => v != null);
  return hasWords || hasMarks;
}

// D-06: amendments never retake the snapshot, never discard recordedAt
export function recordAmendment(batch, churnFields, amendedAt) {
  return { ...batch, churn: { ...churnFields }, amendmentDates: [...batch.amendmentDates, amendedAt] };
}

// D-03: ordered by date, undated ("date unknown") last
export function sortedTastings(batch) {
  return [...batch.tastings].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
}

// D-05: "not yet evaluated" means no tasting exists yet
export const hasTasting = (batch) => batch.tastings.length > 0;
```
This keeps `crypto.randomUUID()` and `new Date()` calls in the one UI event handler that calls `createBatch`/`addTasting`, making every domain function deterministic and unit-testable exactly like `describeDeviation`/`buildFigures` already are `[VERIFIED: app/src/domain/figures.js:51-79]`.

### Pattern 2: Blank vs. zero vs. plan — never coalesce

**What:** As-made grams and every measured field must distinguish three states: not written (store `null`/absent), written as zero (store `0`, a real value per D-11), and the recipe's own plan value (never copied in, per BATCH-01's anti-goal).

**When to use:** Every controlled `<input>` that maps to an as-made or measured field.

**Example:**
```jsx
// As-made cell: '' means not-yet-typed in the DOM; null is the stored "blank" state.
function AsMadeCell({ value, onChange }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className="as-made-input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      aria-label="As-made grams"
    />
  );
}
```
The pitfall this avoids: `if (!asMadeGrams)` is **wrong** here because it is also true when `asMadeGrams === 0` (the struck lecithin row, D-11). Always test `value == null` (or `!= null`) explicitly, never truthiness, for any field this phase introduces.

### Pattern 3: Native grouped radio buttons for the 9-stop axis mark (D-16)

**What:** Each axis (hardness, scoopability, smoothness, sweetness, plus declared axes) is a `<fieldset>` containing 9 `<input type="radio">`s sharing one `name`, labelled 1, 1.5, 2, …, 5, with the low/high anchor words at the ends. Native radio-group keyboard behavior (arrow keys move selection between radios in the same `name` group; one click/Enter/Space sets) already satisfies "arrow keys move a half step, one click sets" without any custom `onKeyDown` `[ASSUMED: standard, long-established HTML/ARIA native-widget behavior — grouped radio inputs receive roving-tabindex-equivalent arrow-key navigation from the browser itself, not from application code; this is platform behavior, not a library, so it has no version to verify against a registry]`.

**When to use:** The mark control for every axis (four core + 0–4 declared per version).

**Example:**
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
Any axis left with no radio checked stores `null`/absent for that axis (D-16: "any axis may stay unmarked") — do not default-select the middle stop.

### Pattern 4: IndexedDB additive schema upgrade

**What:** Bump `DB_VERSION` and add the new store inside the same `upgrade()` callback, guarding on `objectStoreNames.contains` so an existing (`DB_VERSION` 1) database upgrades cleanly and a fresh database also ends up correct.

**Example:**
```javascript
// app/src/store/db.js
import { openDB } from 'idb';

export const DB_NAME = 'sprinkles';
export const DB_VERSION = 2; // was 1 (app/src/store/db.js:4, read this session)

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
The existing store creation is exactly `db.createObjectStore('versions', { keyPath: 'id' });` with no guard today, because it is the only store `[VERIFIED: app/src/store/db.js:11]` — the guard becomes necessary the moment a second `DB_VERSION` exists, since `idb`'s `upgrade()` callback runs cumulatively from a client's actual stored version to the new one.

### Pattern 5: Route without a distinct "recording" URL

**What:** Two router entries resolve to the same `RecipePage` component; there is no third route for "currently recording" (brief §6: "no route for the recording state itself").

**Example:**
```jsx
// app/src/router.jsx
export const router = createBrowserRouter([
  { path: '/', Component: RecipeList },
  { path: '/recipe/:id', Component: RecipePage },
  { path: '/recipe/:id/batch/:batchId', Component: RecipePage }, // new — D-19
]);
```
This mirrors the existing two-entry array exactly `[VERIFIED: app/src/router.jsx:9-12]`; `RecipePage` reads `batchId` from `useParams()` (`undefined` on the first route) to decide which batch's layer to show, and falls back to the latest batch by churn date when `batchId` is absent (D-21).

### Anti-Patterns to Avoid

- **Re-deriving batch figures from the live version at read time:** BATCH2-01 and the PROJECT.md coefficient-drift hazard both require reading a batch's ingredient facts (rows, coefficients) from `batch.snapshot`, never from `repository.getVersion(batch.versionId)` — the whole point of the snapshot is to survive a later edit to the shared library or the version `[VERIFIED: .planning/PROJECT.md — "Prior evidence shows coefficient drift silently corrupted historical batches. Whatever dataset is chosen, a batch must snapshot the coefficients it was computed with"]`.
- **A colour or icon signalling a deviation, a blank, or an unmarked axis:** the No-Verdict Rule and this brief's own "must not be invented" list both forbid it explicitly `[CITED: .impeccable/surfaces/route-recipe-batch.md §7 "Must not be invented by a builder" / DESIGN.md "The No-Verdict Rule"]`.
- **A wizard/stepper/modal for recording:** the brief explicitly refuses this arrangement ("the recipe-app arrangement of a 'log a batch' wizard with steps and progress") `[CITED: .impeccable/surfaces/route-recipe-batch.md §3]`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Arrow-key-navigable, one-click-set control with 9 discrete stops | A custom keydown handler managing a focus index across 9 `<div>`s | Native `<input type="radio">` grouped by shared `name`, restyled | Browsers implement roving arrow-key focus, Home/End, and a correct accessible name for grouped radios natively; restyling with `appearance: none` plus the project's existing ink/pen-blue tokens keeps the "hairline ink field" look without reimplementing keyboard semantics `[ASSUMED — standard platform behavior]` |
| Deep-cloning a version's rows so a stored snapshot never moves when the shared data changes | A hand-written recursive copy function | `structuredClone()` (already the pattern for embedding ingredient records: `app/src/data/olive-oil.js:10-16` `embed()` calls `structuredClone(ingredient)`) | `structuredClone` is a global, available in this Node runtime (`v25.5.0`, confirmed via `node -e "console.log(typeof structuredClone)"` → `function`) and in every evergreen browser; it is already the project's established pattern for exactly this problem |
| Generating an unguessable, collision-free batch id | A counter, a timestamp string, or a small random-string library | `crypto.randomUUID()` per D-20 | Confirmed available as a global function in this Node runtime this session (`node -e "console.log(typeof crypto.randomUUID)"` → `function`) and standard in all evergreen browsers over a secure context (https or localhost) `[VERIFIED: node -e output, this session]` |
| Whole-store JSON export/import with field-by-field validation | A new validation library or schema framework | Extend the existing `validateStoreFile`/`validateVersion` pattern in `app/src/store/transfer.js` with a parallel `validateBatch` | The collect-all-errors, refuse-whole-file, prototype-pollution-guarding pattern already exists and is tested (15 cases in `transfer.test.js`); duplicating its shape for batches is strictly less risk than introducing a schema library for a single additional record type |

**Key insight:** almost nothing in this phase is a new *technical* problem — react-router routing, IndexedDB CRUD, JSON export/import validation, and grouped-keyboard-control semantics are all either already solved in this repo (Phase 1) or solved by the web platform itself. The actual work is faithfully encoding the *domain* rules (D-01 through D-24) as pure, testable functions and thin, unopinionated UI on top of them.

## Common Pitfalls

### Pitfall 1: Falsy-checking a measured/as-made value instead of null-checking it
**What goes wrong:** Code like `if (!batch.churn.overrunPercent)` or `asMade || plan` silently treats a real `0` (D-11's struck lecithin row) or a real `0%` overrun the same as "not written."
**Why it happens:** `0` is falsy in JavaScript; a naive default-fallback pattern (`value || fallback`) is a very common idiom that breaks exactly here.
**How to avoid:** Always test `value == null` (or `!= null`) explicitly for as-made grams, come-up, draw/tasting temperature, overrun, and meltdown loss. Never write `value || <recipe value>` for any batch-scoped field — the recipe's plan value must never be substituted in at all (BATCH-01's anti-goal), not even as a fallback for missing data.
**Warning signs:** Any `||` or `??`-with-a-non-null-default touching a batch field; any test fixture that never includes a written `0`.

### Pitfall 2: Rounding a measured value on display
**What goes wrong:** Calling `.toFixed(1)` or `Math.round()` on every measured value (mirroring how `figures.js`'s `describeDeviation` rounds balance figures) loses precision the maker actually typed, violating D-18 ("kept as typed, never rounded... the display shows what was entered").
**Why it happens:** The existing codebase already has a rounding convention for *computed* figures (`toFixed(decimals)` throughout `figures.js`/`GraduatedRule.jsx`), and it is tempting to reuse that convention for *measured* batch fields, which are a different kind of number with a different rule.
**How to avoid:** Store measured/as-made fields as plain (unrounded) numbers and render them with straightforward string conversion (e.g. template-literal interpolation), not `toFixed`. Only the recipe's own computed balance figures (PAC, POD, etc.) get the `toFixed(decimals)` treatment; batch-entered numbers do not.
**Warning signs:** A shared "format number" helper applied to both `figure.value` and `batch.churn.drawTempC`.

### Pitfall 3: Re-reading ingredient/version data at batch-render time instead of from the snapshot
**What goes wrong:** `RecipePage` (or a new component) calls `computeBalance(version.rows)` for a *reopened batch's* as-made figures instead of `computeBalance(batch.snapshot.rows)` — this is exactly the coefficient-drift bug PROJECT.md names as the reason BATCH2-01 exists.
**Why it happens:** `version.rows` is already in scope on `RecipePage` (it is the page's primary data), so it is the path of least resistance to reach for when a new figure is needed.
**How to avoid:** Any calculation done "as of the batch" must take `batch.snapshot.rows` and `batch.snapshot.coefficientSetId` as its input, never `version.rows`. Consider naming the snapshot fields distinctly from the live version's fields so a reviewer can `grep` for accidental reuse.
**Warning signs:** A component receiving both `version` and `batch` as props and using `version.rows` anywhere in a batch-scoped calculation.

### Pitfall 4: Forgetting the IndexedDB upgrade guard
**What goes wrong:** Bumping `DB_VERSION` without guarding `createObjectStore` calls with `objectStoreNames.contains(...)` throws `DOMException: ... object store 'versions' already exists` when the callback re-runs `createObjectStore('versions', ...)` for a client already on version 1 (the `upgrade()` callback receives every version transition, and if 'versions' creation isn't guarded, an existing client's upgrade path breaks).
**Why it happens:** In a fresh dev environment (empty IndexedDB) it is easy to test only the "install from scratch" path, where the bug does not manifest, and miss the "upgrade an existing browser profile" path.
**How to avoid:** Guard every `createObjectStore` call, even the pre-existing one, once a second `DB_VERSION` is introduced (Code Examples Pattern 4). Test manually by opening the app once at `DB_VERSION` 1 state (or checking out the pre-Phase-2 code), then upgrading to the new code without clearing storage.
**Warning signs:** A dev-only "clear site data" habit masking an upgrade bug that will hit any real returning user (in this project, Mark's own machine).

### Pitfall 5: Confusing "amend" with "add a tasting"
**What goes wrong:** Treating a second tasting as an amendment (adding it to `amendmentDates` instead of `tastings`), or treating an amendment to the churn section as creating a whole new batch record.
**Why it happens:** Both are "the maker comes back later and changes something," which reads as one mental model unless D-06's explicit split (amendments touch only the churn section's fields and append a date; a new tasting is always a distinct, dated, additive record) is encoded as two clearly separate functions.
**How to avoid:** Keep `addTasting` and `recordAmendment` as two distinct domain functions (Pattern 1) with distinct call sites in the UI ("Add a tasting" vs. "Amend"), and never let one function's code path do both.
**Warning signs:** A single `updateBatch(batch, patch)` catch-all function used for both tastings and amendments.

## Code Examples

Already covered under Architecture Patterns 1–4 above (in-repo verified conventions + one platform-standard pattern), which the format guide treats as equally authoritative sources for this phase since no new third-party API is introduced.

## State of the Art

| Old Approach (Phase 1 scope) | Current Approach (Phase 2 scope) | When Changed | Impact |
|--------------------------|------------------------------------|---------------|--------|
| Single `versions` IndexedDB store, `DB_VERSION` 1 | Add `batches` store, `DB_VERSION` 2, additive `upgrade()` guard | This phase | First time the upgrade callback must handle a real version transition, not just initial creation |
| `renderToStaticMarkup`-only component testing (no DOM env) | Same default recommended; DOM testing library only if a specific interaction can't be tested as a pure function | This phase (decision point) | See Package Legitimacy Audit note — `jsdom`/`happy-dom` remain uninstalled unless the plan finds a concrete need |
| Plain `versions[]` array in the store-transfer file | `schemaVersion` 2 file carrying `versions[]` and `batches[]` | This phase | `transfer.js`'s validator, exporter, and importer all need a matching `validateBatch`/batch-array branch |

**Deprecated/outdated:** nothing in the existing stack is deprecated; this phase is purely additive.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Native grouped `<input type="radio">` arrow-key navigation satisfies D-16's "arrow keys move a half step, one click sets" without custom keydown handling. | Architecture Patterns (Pattern 3), Don't Hand-Roll | Low — this is extremely well-established, cross-browser HTML behavior; if design QA finds a gap (e.g. a desired visual affordance native radios can't achieve even restyled), the fallback is a `role="radiogroup"` with a small custom keydown handler, which is a bounded, well-known pattern, not a rewrite. |
| A2 | A single `batches` object store (one record per batch, with `tastings: []` inline) is sufficient, rather than a separate `tastings` store. | Standard Stack (Alternatives Considered) | Low-Medium — if a later phase needs to query/list tastings independently of their parent batch (e.g., cross-batch tasting comparison in LEARN-01, explicitly out of scope for v1), the record would need restructuring; no v1 requirement demands this, and BATCH2-02's "reopen a batch and see it together with...its result" reads naturally as one record. |
| A3 | `crypto.randomUUID()` is available at the point this app runs in production (assumes it is served over `localhost` or `https`, a secure context), not opened directly via a `file://` URL. | Don't Hand-Roll | Low — `npm run dev`/`npm run preview` both serve over `http://localhost`, a secure context; only a risk if the built app is ever opened as a bare file from disk. |

**If this table is empty:** N/A — see above.

## Open Questions

1. **Exact wording for "recorded [date] against [version label]" and "date unknown."**
   - What we know: the brief gives one worked example verbatim ("recorded 4 Aug 2026 against 50 g oil · 800 g") and fixes "date unknown" as the literal phrase for an undated tasting.
   - What's unclear: the exact phrasing for every other state (amendment feedback, "no batch yet," a version with two batches listed).
   - Recommendation: this is explicitly Claude's Discretion per CONTEXT.md — the planner should propose concrete strings in the plan and flag them for the same kind of lightweight confirmation Phase 1 used for the "Data" column header naming (a documented, defensible choice, not a blocking question).

2. **Whether the seed carries the 2 Aug batch, or it's entered live during UAT.**
   - What we know: CONTEXT.md leaves this to Claude's Discretion, "provided the stored record is indistinguishable from one the maker typed."
   - What's unclear: nothing blocking — this is a planning-time call about test/demo setup, not a product behavior.
   - Recommendation: seed it the same way `seed.js` seeds the version today (`seedIfEmpty` pattern, `app/src/store/seed.js:1-11`), for the same "reload always shows a consistent state" benefit Phase 1 relied on for UAT; keep the same "seed-on-empty" idempotence test pattern (`seed.test.js`).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js runtime (for `npm --prefix app test`/`build`/`dev`) | Build/test tooling | ✓ | v25.5.0 `[VERIFIED: node --version, this session]` | — |
| Global `crypto.randomUUID()` | Batch id generation (D-20) | ✓ (Node this session; standard in evergreen browsers over a secure context) | Node v25.5.0 confirmed `[VERIFIED: node -e check, this session]` | If ever needed pre-secure-context, a UUID could be generated with `Math.random()`-based fallback, but this is not expected to be needed |
| Global `structuredClone()` | Batch snapshot deep-clone (BATCH2-01) | ✓ (Node this session; standard in evergreen browsers) | Node v25.5.0 confirmed `[VERIFIED: node -e check, this session]` | — |
| IndexedDB (via `idb`) | All persistence | ✓ (already relied on by Phase 1) | idb 8.0.3 `[VERIFIED: app/package.json]` | — |
| `jsdom`/`happy-dom` (DOM test environment) | Only if the plan chooses interactive component tests | ✗ — listed only as an uninstalled optional peer dep of vitest | — | Continue Phase 1's pattern: `renderToStaticMarkup` for markup shape, pure-function unit tests for logic, human verification for interaction (see Package Legitimacy Audit) |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** `jsdom`/`happy-dom` — fallback is the already-proven Phase 1 testing pattern (see above); only add the package if the plan identifies interaction logic that genuinely cannot be expressed as a pure function.

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` in `.planning/config.json` `[VERIFIED: .planning/config.json]`.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Single-user local app, no accounts (D16 storage/accounts explicitly deferred) |
| V3 Session Management | No | No sessions; no network requests exist under `app/src` `[VERIFIED: .planning/PROJECT.md — "No third-party origins: system font stacks, no fetched assets, no network API under app/src... verified by grep gates"]` |
| V4 Access Control | No | Single local user, single origin, no multi-tenant data |
| V5 Input Validation | Yes | Extend `transfer.js`'s existing collect-all-errors `validateVersion`-style function with a parallel `validateBatch` (typed field checks, non-empty-string ids, finite-number-or-absent measured fields) — same pattern, not a new library |
| V6 Cryptography | Marginal | `crypto.randomUUID()` is used only for opaque, non-secret identifiers (D-20), not for any security boundary — no cryptographic guarantee is being relied on, so no key management or secret-handling concern applies |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prototype pollution via a maliciously crafted import file | Tampering | `transfer.js` already scans for `__proto__`/`constructor`/`prototype` own-keys before any other processing `[VERIFIED: app/src/store/transfer.js:8, 25-38]`; extend the same `scanForUnsafeKeys` call to cover the new `batches` array — it already recurses generically through any plain-object/array structure, so no new scanning code should be needed, only a corresponding `validateBatch` field-shape check |
| XSS via maker-typed free text (draw notes, tasting words, next-time notes, ingredient notes) rendered unsafely | Tampering / Elevation of Privilege (stored XSS) | React's default text-node rendering (`{value}` in JSX) already escapes; the project convention explicitly forbids `dangerouslySetInnerHTML` anywhere under `app/src` `[VERIFIED: .claude/CLAUDE.md:43 — "Notes and prose render as text, never as markup — no dangerouslySetInnerHTML anywhere under app/src"]` — every new free-text field (draw notes, words, next-time note, ingredient notes) must render through plain JSX text interpolation, never through an HTML-injecting API |
| Partially-applied import corrupting the store on a malformed batches array | Tampering | Follow the existing "collect every error, write nothing on any failure" rule (`importStore` already refuses to call `putAll` unless `validateStoreFile` returns `ok: true`) `[VERIFIED: app/src/store/transfer.js:131-137]` — the new batch-array validation must participate in the same all-or-nothing gate, not a separate partial-write path |

## Sources

### Primary (HIGH confidence — read directly this session)
- `app/src/store/repository.js`, `db.js`, `transfer.js`, `seed.js` — the repository seam, its store contract, and its transfer/validation contract
- `app/src/domain/composition.js`, `figures.js` — the framework-free domain-module pattern this phase's `batch.js` should follow
- `app/src/ui/RecipePage.jsx`, `IngredientTable.jsx`, `Method.jsx`, `GraduatedRule.jsx`, `FormulationNote.jsx`, `Authored.jsx`, `BasisNote.jsx`, `RecipeList.jsx` — existing component patterns, accessible-name conventions, and CSS-token discipline
- `app/src/router.jsx`, `app/src/data/olive-oil.js`, `app/src/styles/tokens.css`, `app/src/styles/app.css` — routing, the seeded working case, and the token/CSS system
- `app/package.json`, `app/package-lock.json`, `app/vitest.config.js` — installed dependency versions and the DOM-environment (non-)availability finding
- `.impeccable/surfaces/route-recipe-batch.md` — the confirmed design brief and binding constraints for this surface
- `.planning/phases/02-record-the-first-batch/02-CONTEXT.md` — locked decisions D-01 through D-24
- `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/PROJECT.md`, `.planning/config.json` — requirement text, prior-phase carries, the coefficient-drift hazard, and workflow toggles (`nyquist_validation: false`, `security_enforcement: true`)
- `DESIGN.md`, `.impeccable/design.json` — the Formulation Cookbook's Two-Ink/No-Verdict/Bookcloth rules and current component states
- `.planning/phases/01-read-the-churned-recipe/01-04-SUMMARY.md`, `01-VERIFICATION.md`, `01-UAT.md` — Phase 1's testing pattern (renderToStaticMarkup + human verification) and TDD-gate convention
- `.claude/CLAUDE.md`, `CLAUDE.md` — ratified stack, conventions, and architecture as currently recorded
- Node runtime checks this session: `node --version` (v25.5.0), `node -e "typeof crypto.randomUUID"` (function), `node -e "typeof structuredClone"` (function)

### Secondary (MEDIUM confidence)
- `/Users/mark/Documents/projects/old-sprinkles/src/data/olive-oil.js` — `CORE_AXES` anchor words (read as evidence per CONTEXT.md's canonical refs, not imported)
- `/Users/mark/Documents/projects/old-sprinkles/.impeccable/surfaces/route-batch.md` — prior-attempt evidence for behavioural-anchor wording and the draw/from-freezer occasion split (superseded in most structural respects by the current brief and D-01)

### Tertiary (LOW confidence)
- Native HTML radio-group keyboard behavior (Pattern 3 / A1) — asserted from general web-platform knowledge, not verified against a specific browser this session; flagged in the Assumptions Log

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependency; every claim traces to a file read this session
- Architecture: HIGH — directly extends verified, already-shipped Phase 1 patterns
- Pitfalls: HIGH — each pitfall traces to a specific locked decision (D-06, D-11, D-18, BATCH2-01) and a specific existing code convention it could be violated against

**Research date:** 2026-09-06
**Valid until:** Stable for the life of this phase; re-check only if a new npm package is proposed mid-phase (run the Package Legitimacy Gate then) or if the DOM-testing decision (Package Legitimacy Audit) changes.
