# Phase 3: Develop the next version - Research

**Researched:** 2026-09-07
**Domain:** IndexedDB schema migration (idb 8.x) + framework-free diff/advisory domain modules + React 19 tracked-changes UI + react-router 8 search-params state, inside an already-ratified client-only Vite/React stack
**Confidence:** HIGH for the migration mechanics, the existing codebase's conventions, and the four advisories' math (all read from source this session). MEDIUM for react-router 8 API specifics (official docs fetched, not Context7-verified — no Context7 tool was available this session). LOW/ASSUMED for a few naming and default-value choices explicitly left to Claude's discretion by CONTEXT.md.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The headnote control that opens the pen reads **"Develop the next version"** on every version, churned or not. The save controls name the outcome at the end ("Save as a new version"; "Save over this version" on an unchurned version only).
- **D-02:** The show-changes state is URL-addressable by a **query parameter** (for example `?changes`) on the version's URL, so it composes with `/recipe/:id/batch/:batchId` without a new route. The toggle in the lineage line still carries `aria-pressed`; back returns to the clean reading; the Phase 4 print route ignores the parameter.
- **D-03:** While the pen is open, the struck baseline is **the record the pen opened on**. Forking the churned version compares against the churned version's values. Opening the pen on an unchurned child compares against that child's own saved values, not its parent's. After a save-over, show-changes still compares against the true parent; after a save-as-new, the new child compares against the version the pen was opened on.
- **D-04:** The version line is required and must be **unique within the recipe**. A duplicate is blocked in words beside the save controls, same as a blank.
- **D-05:** **Four advisories ship, not five.** Batch mass against the machine's minimum fill is held for SCALE-01. `equipment.minFillG` stays in the record, unused. The four: sub-scale amounts with the master-blend multiple; ultra-pasteurised mass; gum hydration against the hold (naming a step whose temperature target is at or above it); estimated-data exposure. Each ends in a "basis:" line; none blocks, colours, or predicts a sensory outcome.
- **D-06:** The version record's new shape (parent id, snapshot of the parent's version line, reason, cited batch id, creation date; a removed flag on rows and steps; a `uses` list of row ids per step; an inherited-from marker per authored note) arrives by a **one-time IndexedDB upgrade**: the DB version bumps, and the upgrade lifts every stored version to the new shape with empty defaults, and patches the seeded olive oil record (`olive-oil-ice-cream-v1`) with the seed file's authored `uses` lists. A test proves the churned version's six figures and its batch read identically before and after. — **Reversibility: costly.**
- **D-07:** A **schemaVersion 2 store file is accepted and lifted on import** with the same upgrade function the DB uses; export always writes the new file version. A schemaVersion 1 file keeps its Phase 2 treatment. The validator refuses the whole file on any error, as before.
- **D-08:** The seed's ten steps carry these authored `uses` lists: step 1 → soy lecithin, Graza Drizzle; step 2 → locust bean gum, guar gum, lambda carrageenan, sucrose, whole milk; step 3 → sucrose, skim milk powder, dextrose, fine sea salt, whole milk, heavy cream; step 6 → allulose; step 8 → Graza Drizzle, soy lecithin; steps 4, 5, 7, 9, 10 → none. Split rows (whole milk, sucrose) appear in both steps 2 and 3.
- **D-09:** An imported file carrying a child version whose parent is neither in the file nor already in the store is **refused whole**.
- **D-10 (carried):** Brief §3–§7 binding; tracked changes in the page's own structure, never an overlay; removal cross-flags through `uses`, never cascades; stale-amount flag confined to pen + show-changes; step amounts stay prose; save ceremony in the headnote; blank reason reads "no reason recorded"; no default reason/citation/version line; inherited notes wear "from <parent line>" until edited; batch results never copy; advisories after the batch record, before authored notes; the Strike Rule; a churned version's record and batches are never written when a child is saved; the child carries its own `structuredClone` of coefficients; show-changes reads the parent record live; the plan's pen and the batch's pen are never open together; cancel discards with no dialog and the browser's own leave warning fires while ink is unsaved; keyboard-operable, AA contrast; desktop only.
- **D-11:** Partly marked tastings not re-discussed; batch brief's valid-silence position stands unchanged (out of scope for this phase's code).

### Claude's Discretion

- The exact query parameter name/value for show-changes, and how it composes with the batch URL in lineage-line links.
- The DB version number, the store file's schemaVersion number, and whether the version record carries its own bumped `schemaVersion`; the upgrade function's shape, shared between `db.js`'s upgrade and `transfer.js`'s import.
- Field names for parent id, parent line snapshot, reason, cited batch id, creation date, removed flags, `uses`, inherited-from marker; how `removed` rows/steps are kept on the record and hidden from clean reading and `buildFigures`.
- How "each recipe once at its most recently created version" is derived on the list (a `recipeId` group and creation date already exist or arrive with D-06); no new index needed at 1–6 versions per recipe.
- Domain module boundaries for lineage, diff (per-row grams and share deltas, per-figure deltas), advisories, and the stale-amount/removal cross-flags; all framework-free under `app/src/domain/`.
- Component decomposition of the pen; focus management (Phase 2 precedent: focus first field on open, return to opener on close); exact wording of blocked-save messages, "no batch to cite," and the lineage line beyond what the brief fixes.
- Advisories' exact wording/number formatting within the brief's four definitions.
- How the fixture and UAT exercise the schema upgrade against a Phase 2 store and a Phase 2 export.

### Deferred Ideas (OUT OF SCOPE)

- Batch mass vs. machine minimum fill as a derived advisory (SCALE-01).
- Amending a saved tasting's marks after the fact (Phase 2 UI review) — batch brief's valid-silence position stands.
- Editing target bands; adding a step; adding a row from the seed library (held objections, next milestone).
- Step amounts as references to ingredient rows (replacement macros) — deferred beyond this milestone.
- Comparing siblings, or a version against a batch's as-made (LEARN-01).
- As-made ticks on the graduated rules and a blue "actual" per target chip.
- Draft persistence of unsaved ink across a reload (UX1-02, Phase 4).
- Deleting a version.
- Re-running `/impeccable document` after this phase (Impeccable-owned follow-up).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REC1-02 | Create a new version from the churned version; new version records its parent; churned version unchanged. | D-06's schema (`parentVersionId`, parent line snapshot); "Don't Hand-Roll" save-handler pattern (`structuredClone`, never write to parent); Architecture Patterns §"The save handler." |
| REC1-03 | Edit the new version's ingredient amounts, remove/restore any of twelve rows, edit method steps and targets. | IngredientTable.jsx/Method.jsx extension patterns below; `removed` flag filtering pattern; pen-mode field conventions (`.ink-field`, controlled inputs) already established in Phase 2. |
| REC1-04 | Record why the version changed as free text citing the motivating batch. | Headnote ceremony fields (reason, citation) — schema fields `reason`, `citedBatchId`; `sortedBatches` already exists for the citation picklist. |
| REC1-05 | Saved version reopens with the same values after reload. | `repository.saveVersion`/`getVersion` seam, unchanged; IndexedDB persistence already proven in Phase 1/2. |
| FORM1-03 | Version outside a target band still saves and prints; no figure guarantees success. | `describeDeviation` already never blocks (figures.js); save ceremony has no band-based gate — confirmed no new gate needed. |
| FORM2-01 | Compare new version with churned version: per-row grams/％ delta, per-figure delta. | Diff domain design (`domain/diff.js`) in Architecture Patterns; `buildFigures`/`computeBalance` reuse pattern. |
| FORM2-02 | Derived structural advisories with basis; none predicts sensory outcome, none blocks. | Old-sprinkles `advisories.js` read as evidence (Common Pitfalls "Don't copy the old advisories verbatim"); four advisories' exact math verified against `library.js`/`olive-oil.js` in this file's Code Examples. |
</phase_requirements>

## Summary

This phase adds one true structural change (a one-time IndexedDB schema migration) on top of a codebase whose conventions are already extremely well established from Phases 1–2: framework-free domain modules tested under Vitest's `node` environment, a single repository seam, `.ink-field`/`.ink-text`/strike CSS classes already built and ready to reuse, and a `RecipePage` mode state machine that a third mode slots into cleanly. The migration itself (`idb` 8.0.3's `upgrade` callback, cursor-iterating the `versions` store to lift every record to the new shape) is a known, documented pattern — the load-bearing gotcha is that only IndexedDB-native promises (`store.openCursor()`, `cursor.continue()`) may be awaited inside the upgrade transaction; anything else closes it early. No fake-indexeddb or similar test harness exists in this codebase yet (every existing store-adjacent test uses a hand-rolled in-memory object implementing the repository contract) — this phase is the first to need a harness that can exercise the *actual* migration mechanics, since a plain JS object cannot simulate a versionchange transaction's cursor semantics.

The four FORM2-02 advisories are not new math to invent: they exist, verified, in `old-sprinkles/src/domain/advisories.js`, and every number the brief cites (623.2 g ultra-pasteurised, 1.68 g stabiliser take, 82 °C vs. 69 °C hold) is independently reproducible from the seed data already in this repo (`app/src/data/library.js`, `app/src/data/olive-oil.js`). Two of the four need genuine rework, not a straight port: the hydration advisory must additionally name a method step whose typed target is at or above the hydration temperature (old-sprinkles' version doesn't check steps at all), and the estimated-exposure advisory must report *which figures* rest on estimated data through *which rows* (old-sprinkles' version is a flat ingredient list) — this second one is best built by reusing `figures.js`'s existing per-figure `estimatedRowNames`/`basis` output rather than re-deriving it.

The diff, removal cross-flag, and stale-amount logic are all new framework-free domain work with no existing precedent to reuse, but they compose cleanly with `buildFigures`/`computeBalance` provided removed rows/steps are filtered out *before* those functions see them — those two modules should not be touched at all.

**Primary recommendation:** Add one new devDependency (`fake-indexeddb`) to test the real migration; write the version-shape "lift" as one pure, exported function shared by `db.js`'s upgrade callback and `transfer.js`'s import path; keep `figures.js`/`composition.js` completely unmodified and filter `removed` rows/steps at the call site instead; do not use react-router's `useBlocker` anywhere — the brief is explicit that leaving with unsaved ink stays the browser's native warning only, exactly as Phase 2 built it.

## Architectural Responsibility Map

This is a client-only SPA with no server, API, or CDN tier (ratified constraint: "a local store behind a small repository seam"). Every capability below lives in the browser; the only internal tier boundary that matters is the repository seam separating UI/domain code from the IndexedDB store.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Pen-mode editing (grams, steps, targets, remove/restore) | Browser / Client (React) | — | Pure UI state (`draft`) mirroring Phase 2's `recording` mode; no persistence until save. |
| Diff computation (per-row, per-step, per-figure deltas) | Browser / Client (framework-free domain module) | — | Pure function of two in-memory version objects; never touches the store. |
| Advisories computation | Browser / Client (framework-free domain module) | — | Pure function of a version's rows/equipment/process; recomputed on every keystroke, same as `buildFigures`. |
| Schema migration (version record shape lift) | Database / Storage (IndexedDB, behind `db.js`) | Browser / Client (shared pure lift fn also used by `transfer.js`) | The DB-triggered lift runs inside a versionchange transaction; the *shape transform* itself is pure and reused by file import, which has no transaction at all. |
| Store file import/export | Browser / Client (File API) | Database / Storage (`repository.js`) | `transfer.js` never touches `idb` directly (existing rule); reads/writes go through the repository seam. |
| Show-changes URL state | Browser / Client (react-router `useSearchParams`) | — | Client-side routing only; no server round-trip exists in this app. |
| Version line uniqueness / save-blocking validation | Browser / Client (framework-free domain module + UI) | — | Business rule, not a security boundary; enforced in the save handler before `repository.saveVersion`. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `idb` | 8.0.3 (already installed; confirmed current — published 2025-05-07) `[VERIFIED: npm registry — npm view idb version/time.modified, this session]` | IndexedDB wrapper; `openDB`'s `upgrade` callback drives the schema migration. | Already ratified in this codebase (`app/src/store/db.js`); no alternative under consideration. |
| `react-router` | 8.3.1 (already installed, matches `package.json`) `[VERIFIED: app/package.json:15, this session]` | `useSearchParams` for the `?changes` state (D-02); `Link`/`useNavigate` for lineage-line and strip links. | Already ratified; `useSearchParams`/`useBlocker` API confirmed current against the official docs this session `[CITED: reactrouter.com/api/hooks/useSearchParams, reactrouter.com/api/hooks/useBlocker]`. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `fake-indexeddb` | 6.2.5 (current; published 2025-11-07) `[VERIFIED: npm registry — npm view fake-indexeddb version/time.modified, this session]` | In-memory IndexedDB polyfill for Node, so the D-06 migration test can exercise `db.js`'s real `openDB`/`upgrade`/cursor path instead of a hand-rolled object. New devDependency — not currently installed (`npm ls` shows no `fake-indexeddb` in `app/node_modules`). | Import `fake-indexeddb/auto` (or the named `indexedDB`/`IDBKeyRange` exports) at the top of the one test file that needs a *real* versionchange transaction; every other store-adjacent test keeps using the existing hand-rolled in-memory repository (Phase 1/2 convention — do not retrofit). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `fake-indexeddb` for the migration test | A hand-rolled fake mimicking `openDB`'s upgrade signature (matching Phase 1/2's existing `createInMemoryRepository` convention) | A hand-rolled fake cannot reproduce actual cursor/transaction semantics (auto-commit on a non-IDB await, cursor `continue()` ordering) — the one thing this test needs to prove is that the *real* upgrade path works, not just that a pure function is correct in isolation. Use both: a pure-function unit test in the existing hand-rolled style for the lift logic itself, plus one `fake-indexeddb`-backed test proving `db.js`'s actual `upgrade` callback invokes it correctly end-to-end. |
| React Router `useBlocker` for "leaving with unsaved ink" | Extending the existing `beforeunload` pattern from `RecipePage.jsx` | The brief is explicit and binding (D-10, brief §6 "Leaving with unsaved ink: the browser's own leave warning; no invented dialog") — `useBlocker` renders an in-app blocked state with `.proceed()`/`.reset()` controls, which *is* an invented dialog by the brief's own definition, and it does not intercept `beforeunload`/tab-close at all `[CITED: reactrouter.com/api/hooks/useBlocker]`, so it would need to run *alongside* `beforeunload`, not replace it. Do not introduce it. |

**Installation:**
```bash
npm --prefix app install --save-dev fake-indexeddb
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `fake-indexeddb` | npm | published 2025-11-07 (recent release, established package) | 5.28M/wk | github.com/dumbmatter/fakeIndexedDB | OK | Approved — new devDependency, install per above. |
| `idb` | npm | published 2025-05-07 | 22.3M/wk | github.com/jakearchibald/idb | OK | Already installed; no action. |
| `react-router` | npm | published 2026-08-28 (this exact 8.3.1 build) | 46.6M/wk | github.com/remix-run/react-router | SUS (`too-new`) | Already installed at this exact version (`app/package.json:15`) and ratified in Phase 1/2 — the "too-new" signal reflects this specific patch's publish recency, not a new-adoption risk. No action; not a new install. |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `react-router` — flagged only because 8.3.1 was published very recently; it is a pre-existing, already-installed, already-ratified dependency (not newly introduced by this phase's research), so no `checkpoint:human-verify` is warranted before an install that isn't happening. If the planner later needs to bump the pin, treat that bump as a fresh legitimacy check.

## Architecture Patterns

### System Architecture Diagram

```
                     ┌─────────────────────────────────────────┐
                     │   RecipePage.jsx (mode state machine)    │
                     │   'reading' | 'recording' | 'developing' │  ← new 3rd mode, exclusive
                     └───────────────┬───────────────────────────┘
                                     │ draft (pen state)
              ┌──────────────────────┼───────────────────────────┐
              ▼                      ▼                            ▼
   ┌─────────────────┐   ┌─────────────────────┐      ┌─────────────────────┐
   │ IngredientTable  │   │  Method (steps)      │      │  FormulationNote /   │
   │ (grams fields,   │   │  (text fields,       │      │  Margin (advisories) │
   │  remove/restore) │   │   targets, uses,     │      │  — recompute live    │
   └────────┬─────────┘   │   remove/restore)     │      └──────────┬───────────┘
            │             └──────────┬───────────┘                 │
            └──────────────┬─────────┴──────────────┬──────────────┘
                            ▼                        ▼
                 activeRows(draft) / activeSteps(draft)   ← filters removed:true
                            │                        │
                            ▼                        ▼
                  domain/composition.js      domain/figures.js      domain/advisories.js
                  (computeBalance — UNCHANGED)  (buildFigures — UNCHANGED)   (new, framework-free)
                            │                        │                       │
                            └───────────┬────────────┴───────────────────────┘
                                        ▼
                             domain/diff.js (new) — per-row/step/figure deltas
                             against the struck baseline chosen per D-03
                                        │
                                        ▼
                     Save handler (headnote ceremony, RecipePage.jsx)
                     — the only place crypto.randomUUID()/new Date() are called
                                        │
                        ┌───────────────┴────────────────┐
                        ▼                                 ▼
              repository.saveVersion(child)      (parent record: never written)
                        │
                        ▼
              app/src/store/db.js — IndexedDB (behind idb)
              DB_VERSION bump → upgrade() cursor-lifts every
              stored 'versions' record via the shared lift fn
                        ▲
                        │ same lift fn, no transaction
              app/src/store/transfer.js — importStore()
              (schemaVersion 2 file → lift → validateStoreFile → putAll)
```

### Recommended Project Structure

```
app/src/domain/
├── composition.js     # UNCHANGED — computeBalance, weakestBasis
├── figures.js          # UNCHANGED — buildFigures, describeDeviation
├── batch.js            # UNCHANGED (this phase doesn't touch batch shape)
├── axes.js              # UNCHANGED
├── rows.js              # NEW — activeRows(version), activeSteps(version):
│                         #        filters `removed` before figures/composition see them
├── lineage.js            # NEW — parent/child helpers: versionLineUnique(),
│                          #        childOf(), citableBatches() (wraps sortedBatches)
├── diff.js                # NEW — buildDiff(current, baseline): per-row grams/share
│                            #        delta, per-step text/target delta, per-figure delta
├── uses.js                  # NEW — stepsUsingRow(), rowsOrphanedByStepRemoval(),
│                             #        stepsWithStaleAmounts() (the "uses" cross-flags)
└── advisories.js             # NEW — the four FORM2-02 advisories, reimplemented
                               #        (not imported) from old-sprinkles' evidence

app/src/store/
├── db.js               # DB_VERSION bump; upgrade() gains a cursor-lift branch
├── versionLift.js       # NEW — the one shared pure lift fn (D-06/D-07's
│                         #        "upgrade function's shape, shared between
│                         #        db.js's upgrade and transfer.js's import")
├── transfer.js           # validateStoreFile extended for new version fields;
│                          #  importStore calls versionLift.js before validating
│                          #  a schemaVersion-2 file's version records
└── seed.js                # UNCHANGED (seedIfEmpty already writes the lifted shape
                            #  once olive-oil.js's data itself carries `uses`)

app/src/ui/
├── RecipePage.jsx        # mode gains 'developing'; headnote gains ceremony fields,
│                          #  lineage line, version strip; useSearchParams for ?changes
├── IngredientTable.jsx    # grams fields become editable in 'developing' mode;
│                           #  remove/restore control; struck-beside rendering
├── Method.jsx              # step text/targets/uses become editable; stale-amount
│                            #  flag; remove/restore control; struck-beneath rendering
├── VersionStrip.jsx          # NEW — every version of the recipe, in creation order
├── DerivedAdvisories.jsx      # NEW — margin block, "derived" legend, basis lines
└── (FormulationNote/GraduatedRule/BasisNote/Authored/BatchMargin — extended for
     struck-value rendering, not restructured)
```

### Pattern 1: The shared, pure schema-lift function

**What:** One function, `liftVersionRecord(raw)`, that takes a version object in *any* prior shape and returns one in the current shape with new fields defaulted (`parentVersionId: raw.parentVersionId ?? null`, `reason: null`, `citedBatchId: null`, `createdAt: raw.createdAt ?? <fixed default — see Open Questions>`, every row/step gaining `removed: false` if absent, every step gaining `uses: []` if absent, every authored note gaining `inheritedFrom: null` if absent). It must be idempotent (lifting an already-lifted record is a no-op) so `db.js`'s cumulative-guard convention (`if (oldVersion < N)`) and `transfer.js`'s "schemaVersion 2 or later" branch can both call it unconditionally.

**When to use:** Called from exactly two places — `db.js`'s `upgrade` callback (once per stored record, via cursor) and `transfer.js`'s `importStore` (once per version object in a schemaVersion-2 file, before `validateStoreFile`).

**Example (idb 8.x upgrade with cursor-based cumulative migration):**
```js
// Source: github.com/jakearchibald/idb README (fetched this session) — the
// TypeScript upgrade example, adapted to this project's existing cumulative
// oldVersion-guard style already used in db.js.
export function openStore() {
  return openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore('versions', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        const batches = db.createObjectStore('batches', { keyPath: 'id' });
        batches.createIndex('by-version', 'versionId');
      }
      if (oldVersion < 3) {
        // Cursor iteration INSIDE the versionchange transaction — every
        // await here resolves an IDB-native request (openCursor, continue),
        // never anything else (see the pitfall below).
        const store = transaction.objectStore('versions');
        let cursor = await store.openCursor();
        while (cursor) {
          cursor.update(liftVersionRecord(cursor.value));
          cursor = await cursor.continue();
        }
      }
    },
  });
}
```
`[CITED: github.com/jakearchibald/idb README, fetched this session — exact quotes: "for await (const cursor of index.iterate(...)) { ...; cursor.update(article); }" and the async-iteration form "let cursor = await store.openCursor(); while (cursor) { ...; cursor = await cursor.continue(); }"]`

### Pattern 2: Filter `removed` at the call site, never inside `figures.js`/`composition.js`

**What:** `buildFigures`/`computeBalance` stay byte-for-byte unchanged. A new `activeRows(version)`/`activeSteps(version)` pair (or an inline `.filter((r) => !r.removed)`) runs *before* any call into those modules, and before rendering the clean (non-show-changes) reading state.

**When to use:** Every call site that currently does `buildFigures(version)` or passes `version.rows` to `IngredientTable`/`Method` needs to decide: pen-mode draft (show everything, removed rows struck) vs. clean/figures reading (removed rows/steps absent entirely). This is the one seam that must be threaded through consistently — a removed row leaking into `computeBalance` silently corrupts every figure with no error.

```js
// app/src/domain/rows.js — new, framework-free
export function activeRows(version) {
  return version.rows.filter((row) => !row.removed);
}
export function activeSteps(version) {
  return version.method.filter((step) => !step.removed);
}
```
`[VERIFIED: app/src/domain/figures.js:87-89, app/src/domain/composition.js:21-24, read this session]` — `buildFigures` calls `computeBalance(version.rows)` directly and `computeBalance` returns `null` only when `mass === 0`; neither function has any concept of a `removed` flag today, confirming the filter must happen at the caller.

### Pattern 3: `?changes` via `useSearchParams`, composing across both routes

```js
// Source: reactrouter.com/api/hooks/useSearchParams (fetched this session)
const [searchParams, setSearchParams] = useSearchParams();
const showingChanges = searchParams.has('changes');

function toggleShowChanges() {
  setSearchParams((prev) => {
    const next = new URLSearchParams(prev);
    if (next.has('changes')) next.delete('changes');
    else next.set('changes', '');
    return next;
  });
}
```
Because `router.jsx` already registers both `/recipe/:id` and `/recipe/:id/batch/:batchId` as the same `RecipePage` component `[VERIFIED: app/src/router.jsx:9-13, read this session — routes array quoted: "{ path: '/recipe/:id', Component: RecipePage }, { path: '/recipe/:id/batch/:batchId', Component: RecipePage }"]`, `useSearchParams` composes with either path with zero routing changes — this is exactly D-02's rationale. `setSearchParams`'s default behaviour pushes a new history entry, which is what makes "back returns to clean reading" (D-02) work without extra code — no `{ replace: true }` needed.

### Pattern 4: Mode exclusivity — the pen and the batch pen never open together

`RecipePage`'s `mode` state is already a single string discriminant (`'reading' | 'recording'`) `[VERIFIED: app/src/ui/RecipePage.jsx:66, read this session — "const [mode, setMode] = useState('reading');"]`. Add a third value (e.g. `'developing'`) to the same variable rather than a second boolean flag — this is what makes "never open together" free: `BatchMargin`'s `onStartRecording`/`onStartAmending` handlers must be disabled (or hidden) whenever `mode === 'developing'`, and the pen's own open control must be disabled whenever `mode === 'recording'`.

### Anti-Patterns to Avoid

- **`useBlocker` for the leave-warning:** Renders an in-app blocked-navigation UI with `proceed()`/`reset()` — this is an invented dialog by the brief's own definition (D-10) and does not cover tab-close/`beforeunload` at all `[CITED: reactrouter.com/api/hooks/useBlocker]`. Extend the existing `beforeunload` effect in `RecipePage.jsx` (already parameterised by `isDraftDirty`/`isTastingDraftDirty`) with an `isPenDraftDirty(mode, penDraft)` check instead.
- **A second `schemaVersion`-shaped `if` ladder in `transfer.js`:** D-07 explicitly wants the *same* lift function the DB uses. Writing a second, transfer-specific lift invites the two to drift (exactly the coefficient-drift hazard already logged in PROJECT.md for a different subsystem).
- **Awaiting anything non-IDB inside `upgrade()`:** e.g. `await Promise.all(rows.map(async r => {...}))`, a `setTimeout` promise, or any awaited call into a pure JS function that itself awaits something else — all confirmed pitfalls that close the transaction early and throw `TransactionInactiveError` on the next request `[CITED: MDN IDBTransaction / community write-ups on IndexedDB auto-commit, fetched this session]`. The lift function itself must be fully synchronous.
- **Re-deriving estimated-exposure from scratch:** `figures.js` already computes, per figure, `estimatedRowNames` and a rolled-up `basis` `[VERIFIED: app/src/domain/figures.js:105-123, read this session]`. The FORM2-02 estimated-exposure advisory ("which figures rest on estimated data and through which rows") is a restructuring of that existing output, not new math — building it independently risks the two disagreeing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-tab/rename-safe IndexedDB versioning | A manual version-check-and-migrate routine on every `openStore()` call | `idb`'s `upgrade(db, oldVersion, newVersion, transaction)` callback, cumulative `if (oldVersion < N)` guards (already the codebase's own pattern) | `idb` already handles the `onupgradeneeded`/`onblocked` event wiring and promise-ification; the existing `db.js` guard style is proven safe for a returning browser profile at any prior version. |
| Simulating a real IndexedDB transaction in tests | A hand-rolled fake `openCursor`/`update`/`continue` mock | `fake-indexeddb` | Cursor semantics (ordering, transaction auto-commit timing) are exactly the thing a hand-rolled mock cannot faithfully reproduce, and this phase's one non-negotiable test (D-06: figures identical before/after) needs the *real* mechanics proven, not a stand-in. |
| Query-string state | Manual `URLSearchParams` parsing off `window.location.search` + manual `history.pushState` | `useSearchParams` (already a dependency) | Already ratified in the stack; hand-rolling would duplicate what react-router already does correctly, including sync with the router's own navigation. |
| Prototype-pollution-safe JSON validation | A second unsafe-key scanner for the new version fields | `transfer.js`'s existing `scanForUnsafeKeys` `[VERIFIED: app/src/store/transfer.js:25-38, read this session]` | It already recurses generically over every plain object/array reachable from the parsed root — new fields (`parentVersionId`, `uses`, etc.) are covered automatically as long as they appear in the parsed JSON; only `validateVersion`'s *type* checks need extending, not the unsafe-key scan. |

**Key insight:** almost everything this phase needs is either already built (the repository seam, the ink-field/strike CSS, the mode-state-machine pattern, the unsafe-key scanner) or already exists as reference math (`old-sprinkles/advisories.js`). The genuinely new work is narrow: one shared lift function, three new domain modules (diff, uses/cross-flags, advisories), and the pen-mode UI wiring.

## Runtime State Inventory

> Phase 3 is a one-time schema migration (D-06/D-07), so this section is in scope.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Mark's own browser's IndexedDB `sprinkles` database (`versions`, `batches` object stores) `[VERIFIED: app/src/store/db.js:3-24, read this session]` holds the seeded `olive-oil-ice-cream-v1` version and the 2 Aug batch, both written by `seedIfEmpty` the first time the app ran locally. These are "returning browser profile" state exactly as `db.js`'s existing comment anticipates. | The DB-version-bump upgrade path (Pattern 1) lifts these in place via cursor iteration; no separate data migration script. |
| Live service config | None — this is a fully local, browser-only app with no external service integrations (no n8n, no Datadog, no Cloudflare Tunnel, no third-party API). `[VERIFIED: no network calls found outside file/blob APIs in RecipeList.jsx, read this session]` | None. |
| OS-registered state | None — no scheduled tasks, no pm2/launchd/systemd units; the app is a Vite dev server / static build with no background process. | None. |
| Secrets/env vars | None — no `.env` file anywhere in the repo (`find . -iname "*.env*"` returned nothing this session); no credential or API-key configuration exists for this app. | None. |
| Build artifacts / installed packages | `app/node_modules` does not currently contain `fake-indexeddb` `[VERIFIED: npm ls fake-indexeddb — not found, and directory listing confirmed, this session]`. A separate, harder-to-enumerate artifact: any `sprinkles-store.json` file Mark has already exported via `RecipeList`'s Export button to his local disk, outside git, carrying the current `schemaVersion: 2` shape `[VERIFIED: app/src/store/transfer.js:252-258, read this session — exportStore always writes `schemaVersion: 2` today]`. Such a file is the real-world analogue of "live config not in git" for this app — it is a genuine artifact a returning user could re-import after this phase ships. | `npm install` picks up the new devDependency. The export file case is exactly what D-07 exists to handle — `importStore` must call the shared lift function on a schemaVersion-2 file's version records before validating/writing them; no manual file migration is possible or needed since the import path already handles it. |

## Common Pitfalls

### Pitfall 1: Awaiting a non-IDB promise inside the `upgrade` callback closes the transaction early

**What goes wrong:** Any `await` inside `upgrade()` that does not resolve a request made against the *same* versionchange transaction lets the browser (or the polyfill) consider the transaction idle and auto-commit it; the next `store.put`/`cursor.update` call then throws `TransactionInactiveError`.
**Why it happens:** IndexedDB transactions auto-commit as soon as the event loop sees no pending request on them — a design that predates Promises `[CITED: community write-ups on IndexedDB + async/await, fetched this session]`.
**How to avoid:** Keep the lift function itself fully synchronous (pure object transform, no I/O); the only awaited expressions inside `upgrade()` should be `store.openCursor()` and `cursor.continue()` (both official idb-wrapped IDB requests) `[CITED: github.com/jakearchibald/idb README]`.
**Warning signs:** A migration that works for the first record and throws on the second; intermittent `TransactionInactiveError` in the console during `openDB`.

### Pitfall 2: A `removed` row/step leaking into `computeBalance`/`buildFigures`

**What goes wrong:** If pen-mode drafts (which must keep removed rows in the array, struck, with a "restore" control) are passed directly to `buildFigures`, every balance figure silently includes ingredients the maker just removed.
**Why it happens:** `computeBalance` has no concept of "removed" and will happily sum every row it's given `[VERIFIED: app/src/domain/composition.js:21-25, read this session]`.
**How to avoid:** Filter with `activeRows`/`activeSteps` (Pattern 2) at every call site that computes figures, advisories, or the clean/print reading. The pen's own visible table still shows the removed row (struck).
**Warning signs:** A figure that doesn't move after removing a row that clearly contributes to it.

### Pitfall 3: Reusing `old-sprinkles/advisories.js`'s hydration/estimated functions verbatim

**What goes wrong:** The old-sprinkles `hydrationConflict` only lists gums whose hydration temperature exceeds the pasteurisation hold; it never looks at method steps at all. The old `estimatedExposure` returns a flat ingredient-name list with no per-figure breakdown. Both fall short of what D-05's four advisory definitions actually require.
**Why it happens:** The canonical refs explicitly frame this file as "evidence for the derived math, reimplemented framework-free, not imported" — it's a prior attempt at the same *concept*, not a finished spec for this phase's version of it.
**How to avoid:** Extend the hydration advisory to scan `version.method` for a step whose numeric temperature target (parsed from `step.targets[].value`, e.g. `"85 °C"`) is `>=` the conflicting ingredient's `hydrationC`, and name that step (brief: "step 2 targets 85 °C"). Build the estimated-exposure advisory from `buildFigures(version)`'s own `estimatedRowNames`/`key`/`label` output rather than re-scanning `library.js` bases directly.
**Warning signs:** An advisory that never names a step, or one that can't say which balance figure a piece of estimated data actually affects.

### Pitfall 4: Both pens open at once

**What goes wrong:** If `BatchMargin`'s "Record a batch"/"Amend"/"Add a tasting" controls stay active while `mode === 'developing'`, a maker could open the batch pen while the plan pen is open, directly violating a binding constraint (brief §3: "the plan's pen and the batch's pen are never open together").
**Why it happens:** `BatchMargin` currently derives its own three render branches purely from `mode`/`openBatch`/`tastingDraft` with no awareness of a hypothetical third page-level mode `[VERIFIED: app/src/ui/BatchMargin.jsx:183-352, read this session]` — adding `'developing'` to `mode` without threading a disabled/hidden state through `BatchMargin`'s batch-starting buttons would silently allow this.
**How to avoid:** Disable (or hide, with a stated reason) `BatchMargin`'s batch-starting controls whenever `mode === 'developing'`, mirroring how the six graduated rules already leave the tab path during `'recording'` (existing precedent, `FormulationNote.jsx:16`).
**Warning signs:** A UAT step where opening "Develop the next version" while a batch is being recorded (or vice versa) does not disable the other pen's entry point.

### Pitfall 5: Losing the maker's typed precision on grams fields

**What goes wrong:** Phase 2's `asMade` fields deliberately keep the typed string in the draft and only coerce with `Number()` at save time, never on keystroke, so a value typed finer than the display's rounding survives `[VERIFIED: app/src/ui/RecipePage.jsx:232-236, read this session]`. The pen's grams fields need the identical discipline (brief §6: "accepts two decimals and keeps what was typed").
**Why it happens:** It's tempting to bind a `<input type="number">` directly to a numeric domain value and re-render it rounded on every keystroke.
**How to avoid:** Store the pen's row/step grams edits as raw strings in the draft (same pattern as `draft.asMade`), coerce with `Number()` only in the save handler.
**Warning signs:** A maker typing "24.40" sees it snap to "24.4" or "24" mid-keystroke.

## Code Examples

### The four FORM2-02 advisories — verified math against this repo's own seed data

```js
// Source: /Users/mark/Documents/projects/old-sprinkles/src/domain/advisories.js,
// read this session (evidence, not imported) — reimplement framework-free.
// Verified against app/src/data/library.js and app/src/data/olive-oil.js,
// both read this session:
//
// subScaleBlend: stabilizer rows with grams > 0 are locustBeanGum (1.04 g),
//   guarGum (0.48 g), carrageenan (0.16 g) [VERIFIED: app/src/data/olive-oil.js:39-41]
//   → takeForThisBatch = 1.04 + 0.48 + 0.16 = 1.68 g, matching the brief's
//   "1.68 g" and matching equipment.batchesAhead = 4 [VERIFIED: olive-oil.js:55]
//   → blendTotal = 1.68 * 4 = 6.72 g. scaleResolutionG = 1 [VERIFIED: olive-oil.js:53].
//
// heatCarriedForward: wholeMilk.heatTreatment === 'ultra-pasteurised' (370.4 g)
//   + heavyCream.heatTreatment === 'ultra-pasteurised' (252.8 g)
//   [VERIFIED: app/src/data/library.js:12,23 and app/src/data/olive-oil.js:30-31]
//   → 370.4 + 252.8 = 623.2 g, matching the brief's "623.2 g of 800" exactly.
//
// hydrationConflict: locustBeanGum.hydrationC = 82 [VERIFIED: library.js:88]
//   vs. process.pasteuriseC = 69 [VERIFIED: olive-oil.js:59] → 82 > 69, conflict.
//   NEW for this phase: also scan version.method for a step whose target
//   value is >= 82 °C — step 2 targets '85 °C' [VERIFIED: olive-oil.js:89],
//   matching the brief's "step 2 targets 85 °C" naming requirement.
//
// estimatedExposure: rows with any composition-field basis === 'estimated'
//   and grams > 0: wholeMilk (msnf), heavyCream (msnf), allulose (pac, pod),
//   salt (pac) [VERIFIED: library.js:15,26,60,76]. NEW for this phase: report
//   per FIGURE (via buildFigures' own estimatedRowNames), not a flat list —
//   matching the brief's "which figures rest on estimated data and through
//   which rows" (PAC/POD through allulose+salt; MSNF, PAC, POD through
//   whole milk+heavy cream).
```

### D-08's seed `uses` lists, for the seed-patch branch of the lift function

```js
// Source: 03-CONTEXT.md D-08, confirmed by Mark — the exact per-step lists
// the lift function must write onto the seeded olive-oil-ice-cream-v1
// record's method steps (by step.n):
const SEED_USES = {
  1: ['row-09', 'row-03'],   // soy lecithin, Graza Drizzle
  2: ['row-10', 'row-11', 'row-12', 'row-05', 'row-01'], // gums, sucrose, whole milk
  3: ['row-05', 'row-04', 'row-07', 'row-08', 'row-01', 'row-02'],
  4: [], 5: [], 6: ['row-06'], 7: [], 8: ['row-03', 'row-09'], 9: [], 10: [],
};
// Row ids cross-checked against app/src/data/olive-oil.js:30-41 (read this
// session): row-01 wholeMilk, row-02 heavyCream, row-03 Graza Drizzle,
// row-04 skimMilkPowder, row-05 sucrose, row-06 allulose, row-07 dextrose,
// row-08 salt, row-09 lecithin, row-10 locustBeanGum, row-11 guarGum,
// row-12 carrageenan.
```

### fake-indexeddb setup for the one migration test

```js
// Source: raw.githubusercontent.com/dumbmatter/fakeIndexedDB README,
// fetched this session. Node's vitest environment already provides a
// native structuredClone (Node 25.5.0 confirmed this session), so the
// jsdom-only "fake-indexeddb dropped its structuredClone polyfill in v5"
// caveat does not apply here — this project's vitest.config.js defaults
// to environment: 'node', not jsdom.
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach } from 'vitest';

beforeEach(() => {
  // Fresh database state per test — fake-indexeddb's global indexedDB
  // persists across tests in the same file otherwise.
  globalThis.indexedDB = new IDBFactory();
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| React Router `usePrompt` (removed in v6) for unsaved-changes warnings | `useBlocker` (data routers only) or the browser's native `beforeunload` | react-router v6 removed `usePrompt`; `useBlocker` requires a data router (`createBrowserRouter`, which this app already uses) | Not directly relevant here — the brief explicitly rejects any in-app blocking dialog for this phase, so `useBlocker` is a documented option this project deliberately does not take. |

**Deprecated/outdated:** none identified that affect this phase's chosen stack — `idb` 8.0.3, `react-router` 8.3.1, and `fake-indexeddb` 6.2.5 are all current as of this session's registry checks.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The lifted version's default `createdAt` for the pre-existing seeded record needs a fixed, deterministic value (not `new Date()` at upgrade time) so the "each recipe once at its most recently created version" sort and any fixture/test stay stable across installs. Exact value is unspecified by CONTEXT.md (left to discretion). | Pattern 1 / Open Questions | If the upgrade stamps a *live* timestamp instead of a fixed one, two developers running the migration on different days get different `createdAt` values for the same seed record, which could make a snapshot-style test non-deterministic. |
| A2 | `version.schemaVersion` (a field that already exists on `oliveOilVersion`, currently `1` `[VERIFIED: app/src/data/olive-oil.js:19]`) should be bumped to `2` as part of the lift, mirroring how `batch.js` already tracks its own `BATCH_SCHEMA_VERSION` independent of the DB version and the file's top-level `schemaVersion`. CONTEXT.md explicitly leaves "whether the version record carries its own bumped schemaVersion" to discretion. | Pattern 1 | Low risk either way — this is an internal bookkeeping field with no consumer identified in this session's reading; skipping the bump costs nothing functionally, but the discrepancy (batches version themselves, versions historically don't) is worth flagging to the planner as a discretionary decision to make explicitly rather than by omission. |
| A3 | The hydration advisory's step-target parsing ("step 2 targets 85 °C") assumes a simple numeric-prefix regex against `target.value` strings like `'85 °C'`/`'room'`/`'2 min'` is sufficient — no formal grammar for `method[].targets[].value` exists in the codebase (it's free text, `{ label, value }` pairs `[VERIFIED: app/src/data/olive-oil.js:80-167, read this session — no schema beyond string label/value]`). | Common Pitfalls #3, Code Examples | If a maker later authors a target value in an unexpected format (e.g. a range "80–85 °C"), the parser could silently fail to match rather than erroring — should degrade to "advisory doesn't name a step" rather than throwing. |

**If this table is empty:** N/A — see above.

## Open Questions

1. **What fixed default `createdAt` should the lift assign to versions that predate the field (the seeded olive oil version)?**
   - What we know: the version needs *some* sortable creation date for "each recipe once at its most recently created version" (RecipeList) and for the version strip's creation-order listing.
   - What's unclear: whether to reuse the batch's `recordedAt` (`2026-08-04T00:00:00.000Z`, `[VERIFIED: app/src/data/batch-2026-08-02.js, read this session]`), a fixed epoch, or something else — CONTEXT.md leaves this to discretion.
   - Recommendation: use a fixed, explicit constant (not derived from any batch, since a version can exist with zero batches) — e.g. an explicit `SEED_CREATED_AT` constant colocated with the lift function, documented as "before this field existed" so it reads clearly in a strip listing a single seed version.

2. **Exact DB_VERSION / file schemaVersion numbers.**
   - What we know: `DB_VERSION` is currently `2` `[VERIFIED: app/src/store/db.js:4]`; store file `schemaVersion` is currently `1`or `2` `[VERIFIED: app/src/store/transfer.js:223-224]`.
   - What's unclear: CONTEXT.md explicitly leaves the new numbers to discretion.
   - Recommendation: bump both to `3` in lockstep (DB_VERSION 3, file schemaVersion 3) — keeps the two numbering schemes easy to reason about together even though they represent different things, matching the existing codebase's habit of keeping them at the same number today (both currently `2`).

3. **Does the pen's grams-field precision (two decimals, "kept as typed" per brief §3) need its own draft-string discipline distinct from the existing `asMade` string-draft pattern, or can it reuse the exact same helper?**
   - What we know: the `asMade` column already does exactly this (raw string in draft, `Number()` coercion only at save) `[VERIFIED: app/src/ui/RecipePage.jsx:185-195, 232-236]`.
   - What's unclear: whether row grams live in the same `draft` object shape as `asMade`/`stepChanges`, or a new top-level `draft.rows`/`draft.steps` structure — this is squarely the "component decomposition" discretion area.
   - Recommendation: mirror the existing `draft.asMade`-style keyed-by-row-id object for grams edits (`draft.rows[rowId].grams` as a string), for consistency with the established pattern the planner and any future reader already recognizes.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vitest, npm install | ✓ | v25.5.0 (has native `structuredClone`, `crypto.randomUUID()`) | — |
| npm | Package install | ✓ | 11.8.0 | — |
| `idb` | DB upgrade migration | ✓ (installed) | 8.0.3 | — |
| `react-router` | `useSearchParams`, routing | ✓ (installed) | 8.3.1 | — |
| `fake-indexeddb` | Migration test (D-06) | ✗ (not installed) | — | Install per Standard Stack; no viable fallback for testing real cursor/transaction semantics — a hand-rolled fake cannot substitute for what this test needs to prove. |
| Vitest / `vitest.config.js` `environment: 'node'` | All domain and migration tests | ✓ | 5.0.0, confirmed `environment: 'node'` `[VERIFIED: app/vitest.config.js, read this session]` | — |

**Missing dependencies with no fallback:** none — `fake-indexeddb` has a clear install path with no ambiguity.

**Missing dependencies with fallback:** none.

## Security Domain

`security_enforcement` is on (`security_asvs_level: 1`, `security_block_on: "high"` `[VERIFIED: .planning/config.json, read this session]`). This app has no authentication, session, or server-side access-control surface — V2/V3/V4 are not applicable to a client-only, single-user, local-storage app.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth surface exists in this app. |
| V3 Session Management | No | No sessions exist. |
| V4 Access Control | No | Single local user, no multi-tenant boundary. |
| V5 Input Validation | Yes | Extend `transfer.js`'s `validateVersion` for the new fields (`parentVersionId`, `reason`, `citedBatchId`, `createdAt`, `removed` on rows/steps, `uses` on steps, `inheritedFrom` on notes) — type-check each explicitly, same style as the existing checks `[VERIFIED: app/src/store/transfer.js:171-194]`. Also validate at the UI layer: version-line uniqueness (D-04) and the "whole milk needs an amount, or remove the row" blank-grams block (brief §6) are business-rule input validation, enforced before `repository.saveVersion`. |
| V6 Cryptography | No | Only `crypto.randomUUID()` for record ids (non-cryptographic use, opaque identifiers only) — no cryptographic security property is being relied on. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Prototype pollution via a crafted store-file import (`__proto__`/`constructor`/`prototype` keys reaching the new `parentVersionId`/`uses`/etc. fields) | Tampering | Already mitigated generically by `scanForUnsafeKeys`'s recursive scan over the whole parsed JSON tree `[VERIFIED: app/src/store/transfer.js:25-38]` — no new scanning code needed, only `validateVersion`'s type checks need extending to cover the new fields' *shape*. |
| A malformed/partial import (e.g. a child version whose parent id is neither in the file nor already in the store) silently corrupting lineage | Tampering / Repudiation | D-09: refuse the whole file — extend `validateStoreFile` to check every version's `parentVersionId` resolves to either another version in the same file or an id already known to exist (this needs the repository passed into or consulted by the validator, or the check performed in `importStore` before `putAll`, since `validateStoreFile` today is a pure function with no store access `[VERIFIED: app/src/store/transfer.js:211-245]` — the planner must decide which of these two shapes the D-09 check takes). |
| A stale in-memory `openStore()` promise reused across an upgrade boundary during dev (Vite HMR / hot module reload re-running `main.jsx`) | Denial of Service (self-inflicted, dev-only) | Not new to this phase — `repository.js`'s single module-level `dbPromise` already carries this risk; no change needed, but worth the planner's awareness since the migration is the first time `db.js`'s `upgrade` callback grows non-trivial logic that could throw. |
| T-02-32 (carried, non-blocking): `setMark`'s bracket-assignment write path | Tampering | Already logged in STATE.md as open, non-blocking; this phase's `uses`/`removed` write paths should be built with the same own-property-only discipline `setMark` was *supposed* to have (object spread + explicit key delete, never a bare `obj[key] =` against a maker-influenced key), even though closing T-02-32 itself is not in this phase's scope. |

## Sources

### Primary (HIGH confidence)
- `app/src/store/db.js`, `app/src/store/repository.js`, `app/src/store/transfer.js`, `app/src/store/seed.js` — read in full this session.
- `app/src/domain/figures.js`, `app/src/domain/composition.js`, `app/src/domain/batch.js`, `app/src/domain/axes.js` — read in full this session.
- `app/src/data/olive-oil.js`, `app/src/data/library.js`, `app/src/data/batch-2026-08-02.js` — read in full this session; every advisory number in this file was cross-checked against these.
- `app/src/ui/RecipePage.jsx`, `IngredientTable.jsx`, `Method.jsx`, `RecipeList.jsx`, `FormulationNote.jsx`, `BatchMargin.jsx`, `Authored.jsx`, `BasisNote.jsx`, `GraduatedRule.jsx`, `router.jsx` — read in full this session.
- `app/src/styles/tokens.css`, `app/src/styles/app.css` (grepped and spot-read) — confirmed `.ink-field`/`.ink-text`/`--pen-blue` already exist and are already wired to Phase 2's recording mode.
- `.impeccable/surfaces/route-recipe-version.md` — the confirmed design contract, read in full this session.
- `.planning/phases/03-develop-the-next-version/03-CONTEXT.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/config.json` — read in full this session.
- `/Users/mark/Documents/projects/old-sprinkles/src/domain/advisories.js` — read in full this session (evidence, not imported).
- `npm view idb version/time.modified`, `npm view fake-indexeddb version/time.modified`, `npm view react-router version`, `npm ls idb`, `node --version`, `npm --version` — run this session.
- `gsd_run query package-legitimacy check` — run this session against `fake-indexeddb`, `idb`, `react-router`.

### Secondary (MEDIUM confidence)
- github.com/jakearchibald/idb README (fetched via WebFetch this session) — upgrade callback signature, cursor-iteration example, and the explicit "do not await other things" warning, quoted verbatim above.
- raw.githubusercontent.com/dumbmatter/fakeIndexedDB README (fetched via WebFetch this session) — import patterns, structuredClone caveat (confirmed not applicable to this project's `node` test environment).
- reactrouter.com/api/hooks/useSearchParams, reactrouter.com/api/hooks/useBlocker (fetched via WebFetch this session) — official docs, current for the installed 8.3.1.

### Tertiary (LOW confidence)
- General WebSearch results on IndexedDB transaction auto-commit semantics (Dexie docs, browser-storage.com, various blog posts) — used only to corroborate the idb README's own explicit warning, not as a standalone source.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version number confirmed against the npm registry this session; no new production dependency introduced.
- Architecture: HIGH for the migration mechanics and filtering pattern (grounded in files read this session); MEDIUM for the exact domain-module boundaries and field names, since those are explicitly left to Claude's discretion by CONTEXT.md.
- Pitfalls: HIGH for the IndexedDB transaction pitfall (corroborated by the idb README's own explicit warning plus community sources) and the removed-row-filtering pitfall (directly verified against `figures.js`/`composition.js` source); MEDIUM for the target-string-parsing pitfall (no existing precedent in this codebase to verify against).

**Research date:** 2026-09-07
**Valid until:** 30 days (stable stack; no fast-moving dependency in this phase's scope) — re-verify `react-router`'s pinned version if the planner considers bumping past 8.3.1, since the legitimacy check flagged that exact publish as very recent.
