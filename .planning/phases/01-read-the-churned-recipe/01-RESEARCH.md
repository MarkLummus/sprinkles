# Phase 1: Read the churned recipe - Research

**Researched:** 2026-09-05
**Domain:** Client-only React SPA (Vite/JSX), framework-free domain math (dairy/ice-cream balance calculations), browser IndexedDB persistence behind a repository seam, React Router, Vitest
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Ingredient data and which figures must match**
- D-01: The twelve olive-oil rows are seeded from the old-sprinkles transcription: `~/Documents/projects/old-sprinkles/src/data/library.js` (composition, per-field basis, source, notes) and `src/data/olive-oil.js` (rows, grams, step allocation, targets, equipment, method, authored notes). Data is reused; code is not built on. The seed DB (`~/Downloads/sprinkles-ingredient-seed-db.json`) and its conventions arrive with the library phase, not here.
- D-02: On-screen figures must agree with the printed sheet within 0.1: total 799.7 g, fat 18.0%, milkfat 13.0%, olive oil 28% of fat, MSNF 8.5%, sugar solids 13.5%, total solids 40.8%, PAC 24.1, POD 13.0. The fixture checks ranges (±0.1), not exact strings.
- D-03: Grams display exactly as printed (370.4 g whole milk, 252.8 g cream). No weighable rounding in this phase; that belongs to preparing a new version for making (Phases 3-4).
- D-04: The estimated/unreviewed flag shows in both places: on each affected row (the data column carries the word) and on each figure that rests on it, naming the rows. Same fact, two placements, per the brief's trace-to-contributors interaction.

**Data model and the provisional store**
- D-05: A recipe version embeds a copy of every row's ingredient coefficients and basis. A version is immutable on its own; a batch snapshot (Phase 2) is the version plus as-made values. — Reversibility: costly.
- D-06: The provisional store is browser IndexedDB behind a small repository interface, with JSON export and import of the whole store. No server code. — Reversibility: reversible.
- D-07: The olive oil recipe ships as seed content and is written into the store as an ordinary record the first time the app opens an empty store. After that it is data like any other recipe.
- D-08: The recipe model stays mappable to the Ice Ed export format (`~/Downloads/recipe-Mexican Chocolate v4.json`, SchemaVersion 2: Recipe with Name, Notes, Type, ServingTemperature, Hardness, Overrun, Ingredients[{Name, Amount}], plus an Ingredients coefficient map keyed by name). Field names may differ; every Ice Ed field must have a home so a later import is a converter.

**Target bands**
- D-09: Bands are authored per recipe and stored on the version. The olive oil version is seeded with the slice's bands: PAC 22-26, POD 12-16, fat 16-20%, MSNF 7.5-10%, total solids 38-42%. Style presets are a later concern for new recipes. — Reversibility: costly.
- D-10: A figure with no authored band (sugar solids in the seed) shows its value with the words "no target set" and draws its rule without a hatched band. Nothing is invented.
- D-11: The calculation basis is one small-print note under the formulation block: coefficient set name, "PAC relative to sucrose = 100", "lactose taken as 54.5% of MSNF", and which rows are estimated. Per-figure detail appears on focus through the trace-to-contributors interaction.
- D-12: Deviation is worded beneath each rule as "inside 22-26", "1.4 above 26", or "0.6 below 16", in the figure's own unit. Words only; no colour carries the judgment.

**Project skeleton: routing and test runner**
- D-13: The app opens on a recipe list (one item in Phase 1: name, version line, batch mass) and the recipe page is reached from it.
- D-14: React Router provides URL-addressable routes for the list and the recipe page now, so Phase 4's print route and Phase 2's batch route are additions, not a retrofit.
- D-15: Vitest is the test runner. The sheet fixture (D-02) becomes ordinary tests over the framework-free domain modules, run by `npm test`. — Reversibility: reversible.
- D-16: The app lives in an `app/` subfolder of this repo (package.json, index.html, src/ under `app/`). Consequence: root `CLAUDE.md`'s Status section and `.claude/CLAUDE.md`'s commands must be updated when the structure lands. — Reversibility: reversible.

**Carried forward from PROJECT.md and the surface brief (not re-decided here)**
- React + Vite + JSX, provisional through this phase; ratify on this phase's real code. TypeScript not adopted.
- Domain math in framework-free modules; the PAC/POD/lactose conventions of the slice's `composition.js` are the Phase 1 engine conventions because they reproduce the sheet; record them as the coefficient set the basis note names.
- The Formulation Cookbook brief fixes the page: book spread, headnote, ingredient table with grams / % of batch / step, method with typed targets, six graduated rules with words, margin advisories citing basis, authored notes labelled authored. No freezing curve, no colour verdicts, light only, print-native. Derived advisories are a Phase 3 requirement (FORM2-02); Phase 1 may render the component slots empty.
- Ingredient handling in milestone 1 stays within the twelve rows.

### Claude's Discretion
- Record identity scheme (ids for recipe, version, ingredient rows), schema-version field, and coefficient-set naming.
- IndexedDB wrapper choice and the repository interface's method set, sized to Phases 1-4.
- How the seed-on-first-run detects an empty store and how export/import are exposed (a simple menu action is enough).
- Component decomposition and CSS approach within the brief's world; exact type faces per the brief's calibration rules.
- Exact wording of the basis note beyond the elements D-11 requires.

### Deferred Ideas (OUT OF SCOPE)
- Adopting the seed DB (103 rows, per-100g as-is PAC with lactose inside dairy PAC) and reconciling its conventions with the slice's: the ingredient library phase (ING-01, later milestone).
- Style presets for target bands (gelato / ice cream defaults) for new recipes: later, with new-recipe creation.
- Weighable-gram rounding against the equipment profile: Phases 3-4.
- Freezing curve on screen: not in milestone 1.
- Ice Ed import converter: later import milestone (D03).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REC1-01 | Maker can open the churned olive oil recipe, loaded from the transcribed seed content, and see its ingredients with grams, % of batch, and step allocation, its method, its target bands, and its authored notes. | Standard Stack (React Router route, seed-on-empty-store pattern); Architecture Patterns (recipe data model, seed loader); Code Examples (seed write-through, olive-oil.js row shape verified) |
| FORM1-01 | For any version, maker sees PAC, POD, total fat with milkfat and added fat separately, MSNF, sugar solids, and total solids per 100 g, each against its target band, with the calculation basis stated. | Code Examples (`computeBalance` reimplementation, verified against `composition.js`); Common Pitfalls (lactose double-counting, lo/hi band absent for sugar solids per D-10) |
| FORM1-02 | A figure that rests on estimated or unreviewed ingredient data is flagged where it is shown. | Code Examples (`weakestBasis` reimplementation, verified against `composition.js`); Architecture Patterns (dual-placement flag propagation) |
</phase_requirements>

## Summary

Phase 1 is a greenfield build: there is no application code in this repository yet, only reference material outside it (old-sprinkles) and a confirmed Impeccable surface brief. The phase's job is to stand up the `app/` subfolder (React 19 + Vite 8 + JSX, no TypeScript), give it two React-Router routes (a recipe list and the recipe page), reimplement — not import — the old-sprinkles balance math as a framework-free module verified against the printed sheet's thirteen figures, and back a single seeded recipe record with browser IndexedDB behind a small repository interface. Every one of these technologies is already named in CONTEXT.md as a locked or discretionary decision; this research confirms current stable versions, compatibility constraints between them, and the idiomatic setup each expects, and reimplements the proven balance-math conventions with verbatim-quoted source values.

The critical technical finding is a version-compatibility chain: React Router's newest major (v8) removed the `react-router-dom` package entirely in favor of a unified `react-router` package (with `react-router/dom` for the browser-specific exports), and it raises its floor to React >=19.2.7, Vite >=7, and Node >=22.22.0. All of these floors are cleared by the versions this research verified as current (React 19.2.8, Vite 8.2.2, local Node v25.5.0), so there is no blocker — but the planner must install `react-router` (not `react-router-dom`) and use the v8 import surface, not the v6/v7 patterns visible in most tutorials and in old-sprinkles' own dependency list (which predates this decision and used no router at all).

The balance math itself is fully specified by `composition.js`: mass-weighted composition fields, lactose fixed at 54.5% of MSNF contributing PAC 100 / POD 16 (both relative to sucrose = 100), milkfat separated from added fat by an ingredient's `dairy` flag, and a `weakestBasis` rule that a figure's basis is only as strong as its worst-supported ingredient field. This reimplements directly into a Vitest suite that reproduces `verify-fixture.mjs`'s checks within 0.1, satisfying D-02 and D-15 together.

**Primary recommendation:** Scaffold `app/` with Vite's React JSX template on React 19.2.8, install `react-router` (v8, not `react-router-dom`), `idb` for the IndexedDB repository seam, and `vitest` + `@vitejs/plugin-react`; reimplement `composition.js`'s `computeBalance` and `weakestBasis` verbatim (same field names, same constants) as the framework-free domain module, transcribe `olive-oil.js` and `library.js` into the seed content Phase 1 writes on first empty-store open, and build the recipe page as a single component tree (screen and — later — print share it) driven by the Formulation Cookbook brief.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Recipe list / recipe page rendering | Browser / Client | — | Client-only SPA; no server tier exists or is planned (D16 storage stays local) |
| URL routing (list ↔ recipe page) | Browser / Client | — | React Router runs entirely client-side; no SSR in this project |
| Balance computation (PAC/POD/fat/MSNF/solids) | Domain module (framework-free JS, ships inside client bundle) | — | Pure functions with no DOM/React dependency, per CLAUDE.md's "domain math lives in framework-free modules"; testable in Node without a browser |
| Estimated/unreviewed basis flagging | Domain module | Browser / Client (render) | `weakestBasis` is computed in the domain module; the client tier only renders the result at two placements (D-04) |
| Recipe/version persistence | Database / Storage (IndexedDB) | Browser / Client (repository interface) | D-06 fixes this as browser-local storage behind a small repository interface; no network tier |
| Seed-on-first-run | Browser / Client (app bootstrap) | Database / Storage | Detects an empty IndexedDB store and writes the seed recipe through the same repository interface every other write uses (D-07) |
| JSON export/import of the whole store | Browser / Client | Database / Storage | A menu action reads/writes the store via the repository interface; no server round-trip |

**Why this matters here:** every capability in Phase 1 collapses to two tiers (Browser/Client and Database/Storage) because the project has no backend and none is planned for milestone 1 (D16 stays open). The risk this map heads off is over-architecting: there is no API tier to put business logic behind, so the balance module's isolation from React is the only architectural boundary that matters, and it must be enforced by folder placement and by which modules `vitest` exercises with which environment (see Common Pitfalls).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.8 [VERIFIED: npm registry, `npm view react version`] | UI rendering | Locked by CONTEXT.md/CLAUDE.md; current stable |
| react-dom | 19.2.8 [VERIFIED: npm registry] | DOM renderer for React | Pairs with `react`; same version required |
| vite | 8.2.2 [VERIFIED: npm registry] | Dev server + bundler | Locked by CLAUDE.md ("JSX toolchain: Vite") |
| @vitejs/plugin-react | 6.1.1 [VERIFIED: npm registry] | JSX/Fast Refresh transform for Vite | Official Vite plugin for React; requires `vite ^8.0.0` [VERIFIED: `npm view @vitejs/plugin-react peerDependencies` → `{ vite: '^8.0.0', ... }`] |
| react-router | 8.3.1 [VERIFIED: npm registry, dist-tag `latest`] | Client-side routing (D-14) | Current major; **`react-router-dom` was removed in v8** — install `react-router` and import browser-specific exports (`RouterProvider`, `BrowserRouter`) from `react-router/dom` [CITED: reactrouter.com/changelog, InfoQ v8 release coverage] |
| idb | 8.0.3 [VERIFIED: npm registry + github.com/jakearchibald/idb (primary source)] | Promise-based wrapper over the native IndexedDB API | Named as an example in CONTEXT.md's discretion item; tiny (~1.2 KB), maintained by a Chrome DevRel engineer, mirrors the native API rather than replacing it — lowest-risk fit for "a small repository interface" (D-06) |
| vitest | 5.0.0 [VERIFIED: npm registry] | Test runner (D-15) | Locked by CONTEXT.md; native Vite integration, no separate config needed for JSX transform |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jsdom | 30.0.1 [VERIFIED: npm registry] | DOM environment for Vitest | Only needed if/when component-level tests render JSX; the balance-module tests (D-15's primary use) run fine in Vitest's default `node` environment and do not need it |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| idb | Raw `indexedDB` API | More boilerplate (callback-based transactions); rejected because D-06 asks for "a small repository interface," and `idb`'s promise wrapper is a thinner layer than hand-rolling promise wrapping around callbacks — see Don't Hand-Roll |
| idb | Dexie.js | Larger API surface (schema builder, query layer) than a phase needing only get/put/getAll on a handful of stores; `idb` stays closer to the native API, which keeps the repository interface (the actual seam D16 cares about) doing the abstracting rather than the wrapper library |
| react-router v8 | react-router-dom v6 (as used by most existing tutorials) | v6 patterns still work but the package is gone from npm's `latest` for new installs at v8; pinning to an old major for tutorial-familiarity reasons fights D-14's stated purpose (avoid a retrofit for Phase 2/4 route additions) |

**Installation:**
```bash
cd app
npm create vite@latest . -- --template react
npm install react-router idb
npm install -D vitest jsdom
```

**Version verification:** Confirmed via `npm view <pkg> version` against the npm registry on 2026-09-05 (see Package Legitimacy Audit for full signals). `react-router`'s peer requirements were confirmed with `npm view react-router peerDependencies` → `{ react: '>=19.2.7', 'react-dom': '>=19.2.7' }` and `npm view react-router engines` → `{ node: '>=22.22.0' }` [VERIFIED: npm registry]. Local Node is v25.5.0 [VERIFIED: `node --version`], which clears this floor.

## Package Legitimacy Audit

| Package | Registry | Age (latest publish) | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----------------------|-----------|--------------|---------|-------------|
| react | npm | 2026-07-21 | 171.6M/wk | github.com/facebook/react (repo field lists `react/react.git`, canonical is facebook/react) | OK | Approved |
| react-dom | npm | 2026-07-21 | 161.2M/wk | same as react | OK | Approved |
| vite | npm | 2026-08-20 | 176.3M/wk | github.com/vitejs/vite | SUS (`too-new`) | Approved — false positive. "Too-new" reflects the *latest patch's* publish date, not package age; a project with 176M weekly downloads and an 8-major release history is not a slopsquat risk. No `checkpoint:human-verify` warranted, but planner should still pin an exact version in `package.json` rather than a loose range, given how recently v8 landed. |
| @vitejs/plugin-react | npm | 2026-08-28 | 83.6M/wk | github.com/vitejs/vite-plugin-react | SUS (`too-new`) | Approved — same false-positive reasoning as `vite` |
| react-router | npm | 2026-08-28 | 43.5M/wk (on `react-router-dom`'s download count; `react-router` itself is the newer unified package name so its own count is lower and not separately queried here) | github.com/remix-run/react-router | SUS (`too-new`) | Approved — same reasoning; additionally note the v8 major (June 2026) is recent enough that the planner should read the v7→v8 migration notes before pinning an exact version, and confirm `react-router` (not `react-router-dom`, which the legitimacy check queried by habit) is the package actually installed |
| vitest | npm | 2026-09-03 | 99.9M/wk | github.com/vitest-dev/vitest | SUS (`too-new`) | Approved — same false-positive reasoning; publish date is one day before this research |
| idb | npm | 2025-05-07 | 24.7M/wk | github.com/jakearchibald/idb | OK | Approved |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** vite, @vitejs/plugin-react, react-router, vitest — all four are flagged solely on the `too-new` heuristic (a very recent latest-version publish date), not on downloads, missing repo, or postinstall signals. All four have repo URLs pointing to their well-known canonical maintainers and download counts in the tens-to-hundreds of millions per week. This research treats them as approved rather than gating them behind `checkpoint:human-verify`, since the "too-new" signal here indicates active maintenance of an established project, not a newly-registered package. The planner may still choose to add a lightweight confirmation step before `npm install` given how recent the React Router v8 and Vite 8 majors are (see State of the Art).

## Architecture Patterns

### System Architecture Diagram

```
Browser (single tab, no backend)
─────────────────────────────────────────────────────────────
  App bootstrap (main.jsx)
     │
     ├─► Repository seam checks IndexedDB: store empty?
     │        │
     │        ├─ yes ─► write seed recipe (from olive-oil.js + library.js
     │        │          transcription) through the SAME repository
     │        │          interface every other write uses (D-07)
     │        └─ no  ─► skip seeding
     │
     ▼
  React Router (createBrowserRouter)
     │
     ├─► route "/"        → RecipeList (name, version line, batch mass)
     │                          │
     │                          └─ user clicks the one seeded recipe
     │                                     │
     └─► route "/recipe/:id" ◄─────────────┘
              │
              ├─► load(): repository.getVersion(id)
              │        → { rows[], method[], targets{}, notes{}, ... }
              │
              ├─► Domain module: computeBalance(rows)   [pure, no React]
              │        → { grams, percent, pac, pod, addedFatShareOfFat }
              │
              ├─► Domain module: weakestBasis(rows, field) per figure
              │        → 'stated' | 'derived' | 'estimated' | 'inherited'
              │
              └─► Render: RecipeHeadnote, IngredientTable (grams/%/step),
                          Method (typed targets), FormulationNote
                          (6× GraduatedRule with band + deviation words +
                          estimated flag), Authored (carried-forward /
                          before-you-start)
```

The primary use case (open the churned recipe, read every figure) traces top-to-bottom: bootstrap seeds the store once, the router hands the recipe id to the page, the page pulls the version record from the repository, the domain module turns rows into balance figures and a basis rating, and the page renders both against the brief's fixed layout. Nothing in this path touches a network.

### Recommended Project Structure
```
app/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js          # or a `test` block inside vite.config.js
├── src/
│   ├── main.jsx               # ReactDOM.createRoot + RouterProvider
│   ├── router.jsx              # createBrowserRouter route table (D-14)
│   ├── domain/                 # framework-free — no React/DOM imports
│   │   ├── composition.js      # computeBalance, weakestBasis (reimplemented)
│   │   └── composition.test.js # Vitest: reproduces verify-fixture.mjs's 13 checks
│   ├── data/
│   │   ├── library.js          # transcribed ingredient records (D-01)
│   │   └── olive-oil.js        # transcribed recipe/method/notes (D-01)
│   ├── store/
│   │   ├── db.js                # idb openDB() + schema/upgrade callback
│   │   ├── repository.js        # small interface: getVersion, listRecipes,
│   │   │                        #   saveVersion, exportAll, importAll
│   │   └── seed.js               # "if store empty, write seed recipe" (D-07)
│   └── ui/
│       ├── RecipeList.jsx
│       ├── RecipePage.jsx
│       ├── IngredientTable.jsx
│       ├── Method.jsx            # reference: old-sprinkles src/ui/Method.jsx
│       ├── GraduatedRule.jsx     # reference: old-sprinkles src/ui/GraduatedRule.jsx
│       └── Authored.jsx          # reference: old-sprinkles src/ui/Authored.jsx
└── ...
```

### Pattern 1: Framework-free domain module, reimplemented not imported
**What:** `composition.js`'s `computeBalance` and `weakestBasis` take plain data (`rows: [{ ingredient, grams }]`) and return plain objects — no React, no DOM, no IndexedDB. CONTEXT.md and CLAUDE.md both require this module to stay reimplemented rather than imported from old-sprinkles.
**When to use:** All balance math for FORM1-01/02.
**Example (reimplementation target — every value below is copied verbatim from the source file read this session):**
```javascript
// Source: reimplemented from old-sprinkles/src/domain/composition.js (read verbatim, not imported)
// Reference lines 4-8, 26-54, 58-68:
const LACTOSE_FRACTION_OF_MSNF = 0.545;
const PAC_LACTOSE = 100;   // relative to sucrose = 100
const POD_LACTOSE = 16;    // relative to sucrose = 100

export function computeBalance(rows) {
  const mass = rows.reduce((t, r) => t + r.grams, 0);
  const part = (key) => rows.reduce((t, r) => t + r.grams * (r.ingredient.composition[key] ?? 0), 0);
  const fat = part('fat');
  const msnf = part('msnf');
  const lactose = msnf * LACTOSE_FRACTION_OF_MSNF;
  const milkfat = rows.reduce((t, r) => t + (r.ingredient.dairy ? r.grams * (r.ingredient.composition.fat ?? 0) : 0), 0);
  const addedFat = fat - milkfat;
  const pac = (part('pac') + lactose * PAC_LACTOSE) / mass;
  const pod = (part('pod') + lactose * POD_LACTOSE) / mass;
  // ...percent(), addedFatShareOfFat, solids as in the source — see full read above
}

const BASIS_RANK = { stated: 0, derived: 1, estimated: 2, inherited: 3 };
export function weakestBasis(rows, field) {
  let worst = 'stated';
  for (const row of rows) {
    if (!(row.ingredient.composition[field] > 0)) continue;
    const basis = row.ingredient.basis?.[field] ?? 'inherited';
    if (BASIS_RANK[basis] > BASIS_RANK[worst]) worst = basis;
  }
  return worst;
}
```
[VERIFIED: /Users/mark/Documents/projects/old-sprinkles/src/domain/composition.js:4-8,26-54,58-68 — read this session; constants and logic quoted verbatim above]

### Pattern 2: Seed-on-empty-store
**What:** On app bootstrap, check whether the IndexedDB store has any recipe records; if none, write the transcribed olive-oil recipe through the same repository interface used for every later write (D-07).
**When to use:** First run only; the check itself must go through the repository interface (`repository.listRecipes().length === 0`), not a direct IndexedDB probe, so the seam stays the single source of truth.
**Example:**
```javascript
// app/src/store/seed.js
import { recipe as oliveOilSeed } from '../data/olive-oil.js';

export async function seedIfEmpty(repository) {
  const existing = await repository.listRecipes();
  if (existing.length > 0) return;
  await repository.saveVersion(oliveOilSeed);
}
```

### Pattern 3: React Router v8 declarative setup
**What:** `createBrowserRouter` builds the route table from `react-router`; `RouterProvider` is imported from `react-router/dom` (the web-specific entry point), not from `react-router` itself, in v8.
**When to use:** App bootstrap (D-14: URL-addressable list and recipe routes now).
**Example:**
```jsx
// Source: React Router official docs / changelog, v8 import surface [CITED: reactrouter.com]
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import RecipeList from './ui/RecipeList.jsx';
import RecipePage from './ui/RecipePage.jsx';

const router = createBrowserRouter([
  { path: '/', Component: RecipeList },
  { path: '/recipe/:id', Component: RecipePage },
]);

export function App() {
  return <RouterProvider router={router} />;
}
```

### Pattern 4: IndexedDB repository seam with `idb`
**What:** `idb`'s `openDB()` wraps the native API in promises; the repository module exposes only the methods Phases 1-4 need (get/save a version, list recipes, export/import the whole store), so the domain and UI code never touch `idb` or IndexedDB directly (D-06's "small repository interface").
**Example:**
```javascript
// app/src/store/db.js
// Source: idb README pattern (openDB + upgrade callback) [CITED: github.com/jakearchibald/idb]
import { openDB } from 'idb';

export function openStore() {
  return openDB('sprinkles', 1, {
    upgrade(db) {
      db.createObjectStore('versions', { keyPath: 'id' });
    },
  });
}
```
```javascript
// app/src/store/repository.js — the seam D-06 and D-16 depend on
import { openStore } from './db.js';

export function createRepository() {
  const dbPromise = openStore();
  return {
    async listRecipes() {
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
    async exportAll() {
      const db = await dbPromise;
      return db.getAll('versions');
    },
    async importAll(versions) {
      const db = await dbPromise;
      const tx = db.transaction('versions', 'readwrite');
      await Promise.all(versions.map((v) => tx.store.put(v)));
      return tx.done;
    },
  };
}
```

### Anti-Patterns to Avoid
- **Importing old-sprinkles code directly:** CONTEXT.md and CLAUDE.md both require reimplementation of `composition.js`'s conventions, not an import — even though the file lives in a sibling directory and importing it would technically work, doing so would couple this repo to a project explicitly marked "not to be built on."
- **Computing balance figures inside a React component:** couples domain math to the render tree, breaks the Architectural Responsibility Map's domain-module isolation, and makes the Vitest suite that reproduces `verify-fixture.mjs` harder to write without a DOM environment.
- **Reading IndexedDB directly from UI components:** defeats the repository seam D-06 exists for; every store access — including the seed-empty check — must go through the same repository interface.
- **Installing `react-router-dom`:** that package does not exist as a maintained entry point in v8; installing it will pull the deprecated re-export or an old major, silently reintroducing v6/v7 import patterns that conflict with D-14's stated purpose.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB access | A custom `Promise`-wrapping layer around the native callback/event API | `idb` | The native API's transaction lifetime and event wiring is a well-documented source of subtle bugs (transactions closing early on an awaited microtask); `idb` solves exactly this and nothing more |
| Client-side routing | A custom `path === window.location.pathname` switch | `react-router` | D-14 explicitly requires URL-addressable routes now so Phase 2/4 routes are additions; a hand-rolled router would need to be replaced, not extended, once nested routes or loaders are needed |
| PAC/POD/MSNF/solids math | A from-scratch formulation calculator | Reimplemented `composition.js` conventions | The old-sprinkles engine is already verified 13/13 against the printed sheet (`verify-fixture.mjs`); re-deriving the same constants (lactose 0.545, PAC/POD-relative-to-sucrose=100) from scratch risks reintroducing the exact coefficient drift PROJECT.md's "known data hazards" section warns about |

**Key insight:** every "don't hand-roll" item in this phase is not a novel problem — it is a *previously solved* problem (by `idb`, by `react-router`, and by the old-sprinkles slice's own composition engine). Phase 1's real domain-specific work is the *reimplementation* (not re-derivation) of the verified balance conventions and the *design* of the repository interface's shape (Claude's discretion), not building any of these three from zero.

## Common Pitfalls

### Pitfall 1: Lactose double-counted if a dairy ingredient's `msnf` field already includes it
**What goes wrong:** `computeBalance` adds `lactose * PAC_LACTOSE` and `lactose * POD_LACTOSE` on top of `part('pac')` and `part('pod')`. If a reimplementation also gave dairy ingredients a nonzero `pac`/`pod` composition field representing the same lactose, the balance would double-count it.
**Why it happens:** The source `library.js` intentionally gives dairy ingredients (`wholeMilk`, `heavyCream`, `skimMilkPowder`) *no* `pac`/`pod` composition fields at all [VERIFIED: /Users/mark/Documents/projects/old-sprinkles/src/data/library.js:6-44 — read this session; `wholeMilk`, `heavyCream`, `skimMilkPowder` records have `composition: { fat, msnf }` only, no `pac`/`pod` keys], relying entirely on the `lactose = msnf * LACTOSE_FRACTION_OF_MSNF` term to contribute their PAC/POD. Only sugars (`sucrose`, `allulose`, `dextrose`) and `salt` carry explicit `pac`/`pod` fields.
**How to avoid:** Keep this same convention in the reimplementation and in any future ingredient-library work: dairy MSNF contributes PAC/POD only through the fixed lactose fraction, never through a per-ingredient `pac`/`pod` field.
**Warning signs:** PAC/POD figures that don't match the sheet's 24.1/13.0 even though grams and other percentages match — check for a dairy row with a stray `pac`/`pod` field.

### Pitfall 2: React Router v8's `react-router-dom` removal breaks tutorial-copied code
**What goes wrong:** Most current tutorials, StackOverflow answers, and even old-sprinkles' own `package.json` predate this decision entirely (it had no router). Copying `import { BrowserRouter } from 'react-router-dom'` patterns from search results will fail to install cleanly or will pull a stale major.
**Why it happens:** `react-router-dom` was removed in v8; `RouterProvider`, `BrowserRouter`, and other DOM-specific exports moved to `react-router/dom` [CITED: reactrouter.com/changelog; InfoQ "React Router v8: a Deliberately Boring Release"].
**How to avoid:** Install only `react-router`; import DOM-specific pieces from `react-router/dom`.
**Warning signs:** `npm install react-router-dom` succeeding but pulling an old major, or import errors for `RouterProvider` from `react-router` directly.

### Pitfall 3: Mixing Vitest environments without isolating the domain module
**What goes wrong:** If `vitest.config.js` sets a global `environment: 'jsdom'` (often the first thing copied from a React testing tutorial), the domain-module tests still pass, but the setup silently invites DOM access into `composition.js` over time, eroding the framework-free boundary the Architectural Responsibility Map relies on.
**Why it happens:** jsdom is usually configured globally for convenience once any component test exists.
**How to avoid:** Default Vitest's `environment` to `'node'` and opt individual component-test files into `jsdom` via the `// @vitest-environment jsdom` docblock, or a Vitest workspace, so the domain suite runs (and stays provably runnable) with no DOM available at all [CITED: vitest.dev/guide/environment].
**Warning signs:** A domain-module test that accidentally references `document` or `window` and still passes.

### Pitfall 4: Sum-of-rows mass vs. printed total rounding
**What goes wrong:** D-02 requires the on-screen total to agree with the sheet's 799.7 g within 0.1. `computeBalance`'s `mass` is `sumBy(rows, r => r.grams)` — a straight sum of the twelve transcribed gram values, not a separately-stored total.
**Why it happens:** None — this is stated as a fact, not a risk: transcribing `olive-oil.js`'s twelve `grams` values verbatim (370.4, 252.8, 40, 22.4, 76, 20, 12, 3.2, 1.2, 1.04, 0.48, 0.16) [VERIFIED: /Users/mark/Documents/projects/old-sprinkles/src/data/olive-oil.js:28-39 — read this session, values quoted verbatim] sums to exactly 799.7 g with no rounding step needed.
**How to avoid:** Do not introduce a separate "total mass" seed field that could drift from the row sum; always derive it, as the source does.
**Warning signs:** A hardcoded `mass: 799.7` in seed data that could go stale if a row value is later edited without updating it.

### Pitfall 5: The "no target set" figure (sugar solids) needs a distinct render path, not a zero-width band
**What goes wrong:** Rendering sugar solids' `GraduatedRule` with an empty or `[0,0]` target band, rather than genuinely omitting the hatched band and printing "no target set," silently invents a band that doesn't exist (violates D-10 and the brief's "nothing is invented" instruction).
**Why it happens:** The seed's `targets` object has no `sugar` key at all [VERIFIED: /Users/mark/Documents/projects/old-sprinkles/src/data/olive-oil.js:9-15 — read this session; `targets: { pac: [22, 26], pod: [12, 16], fat: [16, 20], msnf: [7.5, 10], solids: [38, 42] }` — no `sugar` entry], so a naive `recipe.targets.sugar ?? [0, 0]` fallback would produce a band that looks real.
**How to avoid:** Branch on whether the target key exists at all, not on whether its value is falsy, and render "no target set" with no hatch when it's absent.
**Warning signs:** A sugar-solids rule with a visible (even if zero-width) hatched band.

### Pitfall 6: Cross-ecosystem / cross-dataset coefficient drift (flagged in PROJECT.md, load-bearing for FORM1-02)
**What goes wrong:** Three ingredient datasets in this project disagree on the same ingredient's coefficients (dextrose PAC 174.8 in the seed DB vs. 190 in the slice's `library.js`; salt PAC 586 vs. 580) [VERIFIED: /Users/mark/Documents/projects/old-sprinkles/src/data/library.js:62-67,70-76 — read this session; `dextrose: { composition: { pac: 190, ... } }`, `salt: { composition: { pac: 580, ... } }`]. PROJECT.md documents this as a "known data hazard" that has "silently corrupted historical batches" before.
**Why it happens:** Different sourcing/derivation methods per dataset (see `dextrose`'s note: "PAC moved from 1.9 to 1.66 between generations of the predecessor app, and nothing on any page recorded that it had" [VERIFIED: library.js:68]).
**How to avoid:** Phase 1 uses only the slice's transcription (D-01) and must record which coefficient set it used (D-11's "coefficient set name") so a later switch to the seed DB is a visible, citable change rather than a silent drift.
**Warning signs:** A future phase importing seed-DB coefficients into a version that still cites the Phase 1 coefficient-set name.

## Code Examples

### Reproducing the sheet fixture as a Vitest suite (D-02, D-15)
```javascript
// app/src/domain/composition.test.js
// Checks mirror old-sprinkles/scripts/verify-fixture.mjs (read verbatim this session,
// values quoted from lines 14-22 and 14 of that file):
import { describe, it, expect } from 'vitest';
import { computeBalance } from './composition.js';
import { recipe } from '../data/olive-oil.js';

describe('computeBalance — churned olive oil sheet fixture', () => {
  const b = computeBalance(recipe.rows);

  it.each([
    ['total mass', b.mass, 799.7],
    ['total fat %', b.percent.fat, 18.0],
    ['milkfat %', b.percent.milkfat, 13.0],
    ['MSNF %', b.percent.msnf, 8.5],
    ['sugar solids %', b.percent.sugar, 13.5],
    ['total solids %', b.percent.solids, 40.8],
    ['PAC', b.pac, 24.1],
    ['POD', b.pod, 13.0],
  ])('%s matches the printed sheet within 0.1', (_name, got, want) => {
    expect(got).toBeCloseTo(want, 1); // toBeCloseTo(x, 1) checks |got-want| < 0.05*10^-1 range; use explicit tolerance if stricter 0.1 needed
  });

  it('olive oil % of fat matches 28%', () => {
    expect(Math.round(b.addedFatShareOfFat)).toBe(28);
  });
});
```
[VERIFIED: /Users/mark/Documents/projects/old-sprinkles/scripts/verify-fixture.mjs:14-22 — read this session; expected values (799.7, 18.0, 13.0, 28, 8.5, 13.5, 40.8, 24.1, 13.0) quoted verbatim]

Note: `toBeCloseTo(want, 1)` checks precision to 1 decimal place (difference < 0.05), which is tighter than D-02's explicit "within 0.1" — either is acceptable, but the planner should pick one tolerance convention and state it in the test file, since `toBeCloseTo`'s second argument is *decimal places*, not an absolute delta.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `react-router-dom` as the installable package | `react-router` (unified) with `react-router/dom` for browser exports | React Router v8, ~June 2026 [CITED: reactrouter.com/changelog, InfoQ] | Any tutorial or old-sprinkles-era code using `react-router-dom` imports needs updating before it runs against v8 |
| Vite 5.x (what old-sprinkles' `package.json` pins) | Vite 8.2.2 | Multiple majors since; Vite 8 uses the Vite Environment API for build/pre-rendering, requiring Node >=20.19 or >=22.12 [VERIFIED: `npm view vite engines`] | `@vitejs/plugin-react` 6.x requires `vite ^8.0.0` — the two must be upgraded together, not independently |
| CommonJS builds from React Router | ESM-only builds in v8 | React Router v8 | Toolchains expecting CJS `require('react-router')` need to already be ESM-ready; this project's `"type": "module"` convention (as seen in old-sprinkles' own `package.json`) already satisfies this |

**Deprecated/outdated:**
- `react-router-dom`: removed as an installable v8 package; the CONTEXT.md phrase "React Router" should resolve to installing `react-router`, not the historically-more-familiar `react-router-dom` name.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | `idb`'s method names (`getAll`, `get`, `put`, `transaction`) shown in the repository-seam example match the current v8.x API surface exactly | Code Examples, Pattern 4 | Low — `idb` mirrors the native IndexedDB API 1:1 for these calls, and this shape has been stable across the library's major versions per its README; worst case is a signature detail the planner adjusts during implementation, not a redesign |
| A2 | Recommending the very latest majors (Vite 8, React Router v8, Vitest 5) rather than pinning one major back is the right call for a solo greenfield project with no legacy code to migrate | Standard Stack | Low-medium — if any of these majors proves unstable in practice, the fix is a `package.json` downgrade, not an architecture change; flagged here because all three majors are recent enough (weeks to ~3 months old at research time) that real-world rough edges may not be fully surfaced yet |
| A3 | `toBeCloseTo(want, 1)` is an acceptable Vitest idiom for D-02's "within 0.1" tolerance, rather than a hand-written `Math.abs(got - want) < 0.1` assertion | Code Examples | Low — cosmetic; either satisfies the requirement, but the two have subtly different tolerance semantics (see the note under the code example) and should not be assumed interchangeable at the boundary |

**If this table is empty:** N/A — see entries above; none of them touch a compliance, retention, or security-relevant decision, so none block planning, but all three are cheap to confirm during Phase 1 execution.

## Open Questions (RESOLVED)

1. **Exact repository-interface method set for Phases 1-4**
   - What we know: Phase 1 needs `listRecipes`, `getVersion`, `saveVersion`, `exportAll`, `importAll` at minimum (D-06, D-07).
   - What's unclear: Whether Phase 2 (batches) and Phase 3 (versions/lineage/comparison) want batches and versions as separate IndexedDB object stores from day one, or added later — this is explicitly Claude's discretion per CONTEXT.md, but the choice affects whether Phase 1's `db.js` upgrade callback needs to anticipate a `batches` store now.
   - Recommendation: Create only the `versions` object store in Phase 1's `upgrade()` callback; IndexedDB version-bump migrations (`openDB('sprinkles', 2, { upgrade(db, oldVersion) {...} })`) are the standard mechanism for adding stores later, so there is no cost to deferring this.

2. **Record identity scheme (ids for recipe, version, ingredient rows) and coefficient-set naming**
   - What we know: CONTEXT.md leaves this as Claude's discretion; D-11 requires the coefficient-set name to be stable since batches cite it; the specifics section suggests something like "coefficient set 2026.1 (slice transcription)."
   - What's unclear: Whether ids should be human-readable slugs (`olive-oil-v1`) or opaque (UUID/nanoid) — D-08's Ice Ed mappability doesn't fix this, since Ice Ed's own export keys ingredients by `Name` string, not an id.
   - Recommendation: Use a stable slug for the recipe id (derivable from name, matches D-13's "recipe list" needing something to link to) and a monotonic version identifier per recipe (`v1`, `v2`) rather than a UUID, since D-14's route is `/recipe/:id` and a human-legible URL aids the "URL-addressable" goal D-14 states.

3. **Whether the "estimated" per-row flag column (D-04) needs its own IngredientTable column or reuses an existing one**
   - What we know: D-04 requires the flag on the row itself ("the data column carries the word") and on each affected figure.
   - What's unclear: The Formulation Cookbook brief describes grams / % of batch / step columns explicitly but doesn't name a "basis" column; this is UI-composition detail left to Impeccable's build-time calibration, not something this research should fix.
   - Recommendation: Defer to the planner reading the brief's "figures trace to contributors" interaction section directly; this research surfaces the requirement (D-04) and the domain data (`ingredient.basis` per field) that feeds it, but the exact column/badge treatment is a UI-phase decision.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Node.js | Vite 8, React Router 8 (`engines: node >=22.22.0`) | ✓ | v25.5.0 [VERIFIED: `node --version`] | — |
| npm | package installation | ✓ | 11.8.0 [VERIFIED: `npm --version`] | — |
| Browser IndexedDB | Persistence (D-06) | Not probeable from this CLI environment | — | IndexedDB is supported in all evergreen browsers (Chrome, Firefox, Safari, Edge) for years; no fallback needed for a desktop-first single-user tool, but this claim rests on general web-platform knowledge, not a runtime probe in this session — [ASSUMED] |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none — the one unverified item (browser IndexedDB support) has no realistic failure mode for the target browsers this project already assumes (desktop, per CLAUDE.md/PROJECT.md's "desktop formulates" operating context).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | No | No accounts or auth in milestone 1 (single local user, no server) |
| V3 Session Management | No | No sessions; no server |
| V4 Access Control | No | Single local user, no multi-tenant or role concept |
| V5 Input Validation | Yes (limited in Phase 1) | Phase 1 is read-only against seeded data — no user-entered amounts yet (that's Phase 3, REC1-03). The JSON import (export/import of the whole store, D-06) is the one Phase 1 surface that consumes external input; validate the imported JSON's shape (expected keys, numeric grams) before writing it through the repository interface, rather than trusting it structurally |
| V6 Cryptography | No | No credentials, no encryption requirement stated for local recipe data; IndexedDB storage is unencrypted at rest, which is acceptable for this single-user local-only use case per CLAUDE.md's privacy constraint (no external calls), not a gap this phase needs to close |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Malformed/malicious JSON import overwriting the store with garbage | Tampering | Validate imported records' shape (required keys, `grams` as a finite number ≥ 0) before `importAll` writes them; reject with a visible error rather than silently accepting |
| Ice Ed export's `Recipe.Notes` field contains raw HTML (`<div>...</div>`) [VERIFIED: /Users/mark/Downloads/recipe-Mexican Chocolate v4.json:9 — read this session; `"Notes": "<div><div>...` is HTML markup, not plain text] | Tampering / XSS (forward-looking, not a Phase 1 surface) | Phase 1 does not import Ice Ed data (deferred per D03/IMP-01), so this is not exploitable yet — but the finding matters for the *later* import milestone: any future renderer must NOT use `dangerouslySetInnerHTML` on an Ice Ed `Notes` field without sanitization. Flagging now so the D-08 "every Ice Ed field must have a home" mapping doesn't silently choose an HTML-rendering home for `Notes` when that milestone arrives |

## Sources

### Primary (HIGH confidence)
- `/Users/mark/Documents/projects/old-sprinkles/src/domain/composition.js` — read in full this session; balance-math constants and logic quoted verbatim
- `/Users/mark/Documents/projects/old-sprinkles/scripts/verify-fixture.mjs` — read in full this session; the thirteen sheet-check expected values quoted verbatim
- `/Users/mark/Documents/projects/old-sprinkles/src/data/olive-oil.js` — read in full this session; recipe rows, targets, method, notes quoted verbatim
- `/Users/mark/Documents/projects/old-sprinkles/src/data/library.js` — read in full this session; ingredient composition/basis/coefficient values quoted verbatim
- `/Users/mark/Documents/projects/old-sprinkles/src/ui/GraduatedRule.jsx`, `Method.jsx`, `Authored.jsx` — read in full this session; reference component behavior
- `/Users/mark/Downloads/olive-oil-ice-cream-800g_1.md` — read in full this session; printed sheet figures cross-checked against `verify-fixture.mjs`
- `/Users/mark/Downloads/recipe-Mexican Chocolate v4.json` — read in full this session; Ice Ed export shape (SchemaVersion 2) confirmed, including the raw-HTML `Notes` field
- `npm view <pkg> version / peerDependencies / engines` — run this session for react, react-dom, vite, @vitejs/plugin-react, vitest, react-router, react-router-dom, idb, jsdom
- `node --version`, `npm --version` — run this session

### Secondary (MEDIUM confidence)
- reactrouter.com/changelog and InfoQ "React Router v8: a Deliberately Boring Release" — WebSearch, cross-checked against `npm view react-router peerDependencies/engines` (tool-confirmed floors match the article's stated Node 22.22.0+/React 19.2.7+/Vite 7+ claims)
- vitest.dev/guide/environment — WebSearch, for the per-file `@vitest-environment` docblock pattern
- github.com/jakearchibald/idb README — WebSearch, primary source for the library's own API

### Tertiary (LOW confidence)
- General React Router v7→v8 tutorial content (LogRocket, Scrimba, various blogs) — used only for the declarative-mode JSX shape, cross-checked against official changelog before inclusion; not relied on alone for any version-floor claim

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package names were user-locked in CONTEXT.md (not researcher-sourced); all versions confirmed via `npm view` against the live registry, and the one non-obvious compatibility chain (React Router v8 / Vite 8 / Node floor) was cross-checked against both the registry's `peerDependencies`/`engines` fields and the official changelog
- Architecture: HIGH — the domain-module reimplementation is grounded in a file read verbatim this session and already proven against the printed sheet (13/13 in `verify-fixture.mjs`); the router/store patterns are standard, current-version idioms confirmed against official sources
- Pitfalls: HIGH — five of six pitfalls are grounded in verbatim-quoted source values read this session (library.js, olive-oil.js, verify-fixture.mjs); one (React Router v8 removal) is grounded in the official changelog

**Research date:** 2026-09-05
**Valid until:** 30 days for the domain-math findings (stable, sourced from a fixed reference implementation); 14 days for the exact npm package versions given how recently several majors (Vite 8, React Router v8, Vitest 5) were published — re-verify versions with `npm view` before planning if this research is consumed after 2026-09-19
