# Phase 4: Prepare the next version for making - Pattern Map

**Mapped:** 2026-10-11
**Files analyzed:** 24 new/modified
**Analogs found:** 22 / 24
All analog paths are git-tracked under `app/src` or `.planning` (checked via `git ls-files`). Line numbers are as of this mapping; RESEARCH.md cites others, so re-grep before relying on a number.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `app/src/domain/sheetCode.js` (+ test) | utility (pure) | transform | `app/src/domain/id.js` (secure-context lesson) + `domain/rows.js` (clean reading) | role-match |
| `app/src/domain/draft.js` (`draftMatchesVersion`) (+ test) | utility (pure) | transform | `domain/lineage.js` pure validators; `isPenDraftDirty` in `RecipePage.jsx` | role-match |
| `app/src/domain/axes.js` (add `axesForVersion`) | utility | transform | `axesForBatch` in same file | exact |
| `app/src/store/db.js` (DB_VERSION 8, `drafts`) | config/migration | CRUD | itself (lines 1-47) | exact |
| `app/src/store/db.test.js` | test | CRUD | itself | exact |
| `app/src/store/repository.js` (get/save/delete/listDrafts) | service (seam) | CRUD | itself, `getBatch`/`saveBatch` | exact |
| `app/src/ui/RecipePage.jsx` (restore/persist/delete, drop beforeunload) | component | event-driven + CRUD | itself, lines 898-920 | exact |
| `app/src/router.jsx` (print route, Search route) | route | request-response | itself, lines 95-114 | exact |
| `app/src/ui/PrintSheet.jsx` (+ log pages, print table) | component | request-response (read-only) | `RecipePage.jsx` reading tree, `BatchRow.jsx`, `IngredientTable.jsx`, `Method.jsx` | role-match |
| `app/src/styles/print.css` | config (CSS) | transform | `@media print` block, `app.css:2829-2925` | role-match |
| `app/src/main.jsx` (import print.css) | config | - | itself, lines 3-8 | exact |
| `app/src/styles/tokens.test.js` (`CSS_FILE_NAMES`) | test | - | itself, line 19 | exact |
| `app/src/ui/SheetCodeSearch.jsx` (Search route body) | component | request-response | `ui/Placeholder.jsx` + `RecipeList.jsx` | role-match |
| `app/src/ui/RecipeList.jsx` (Home link + draft line) | component | CRUD read | `HomeLead` lines 106-135 | exact |
| `app/src/ui/VersionRow.jsx` ("Print sheet" Link) | component | request-response | `notebook-version__acts` block, lines 395-441 | exact |
| `app/src/ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` | component | - | `tabindex-scan.test.js` rule + `VersionRow.jsx` buttons | partial |
| `app/src/ui/tabindex-scan.test.js` | test | - | itself | exact |
| `GraduatedRule.jsx`, `Method.jsx`, `Segmented.jsx`, `AxisMark.jsx`, `BatchRow.jsx`, `Shell.jsx` etc. (migration) | component | - | scan counts: Authored 1, AxisMark 1, BatchRow 7, FoldRow 1, GraduatedRule 1, IngredientTable 3, Method 9, PenFoot 4, RecipeBand 3, Segmented 1, Shell 6, VersionRow 6; 3 checkbox; 2 radio | exact |
| D-20: `GraduatedRule.jsx`, `Method.jsx` list role, `document.title`, live region | component | - | `PageStatus` in `router.jsx:72` | partial |
| Print probe scripts (new `04-print-probe.mjs`) | test/tool | batch | `03.7-print-probe.mjs`, `wkprint.swift`, `pdf-pages.swift` | exact |
| `app/src/domain/blankLog.js` (optional) | utility | transform | `domain/battery.js`, `axes.js` | role-match |
| `notebookPaths.js` (add `printPath`) | utility | transform | `notebookPath`, lines 14-17 | exact |

## Pattern Assignments

### `app/src/store/db.js` (migration, CRUD) - analog: itself

Facts (RESEARCH C3): `DB_VERSION = 7` (CONTEXT says 5); the upgrade callback drops and recreates every store when `oldVersion > 0 && oldVersion < DB_VERSION`, so a bump is not additive today. Decide: reset (acceptable only if no real data) or guard to `oldVersion < 7`.

```js
// db.js:21-25 and 30-40
if (oldVersion > 0 && oldVersion < DB_VERSION) {
  if (db.objectStoreNames.contains('versions')) db.deleteObjectStore('versions');
  ...
}
if (!db.objectStoreNames.contains('recipes')) {
  db.createObjectStore('recipes', { keyPath: 'id' });
}
```
Copy: add `if (!db.objectStoreNames.contains('drafts')) db.createObjectStore('drafts', { keyPath: 'versionId' });` after the recipes guard. Keep the callback free of `async`/`await` (comment at lines 41-44). Update `store/db.test.js` (asserts version 7; fake-indexeddb with a fresh `IDBFactory` per test) and `app/tests/db-reset.test.js`.

### `app/src/store/repository.js` (service, CRUD) - analog: itself

```js
// repository.js:35-42 and 57-64
async getBatch(id) {
  const db = await dbPromise;
  return db.get('batches', id);
},
async saveBatch(batch) {
  const db = await dbPromise;
  return db.put('batches', batch);
},
```
Copy this shape for `getDraft(versionId)`, `saveDraft(record)`, `deleteDraft(versionId)` (`db.delete('drafts', id)`), `listDrafts()` (`db.getAll`). Only `db.js` imports `idb`. Drafts stay out of `transfer.js` (STORE_SCHEMA_VERSION 6 unchanged).

### `app/src/ui/RecipePage.jsx` (component, event-driven + CRUD) - analog: itself

Replace the leave warning (D-17), lines ~898-920:
```js
useEffect(() => {
  if (!isDraftDirty(mode, draft, amendBaseline) && !isPenDraftDirty(mode, penDraft, version)) return undefined;
  const handleBeforeUnload = (event) => { event.preventDefault(); };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [mode, draft, amendBaseline, penDraft, version]);
```
Reuse the same two dirty checks (`isDraftDirty` line 164, `isPenDraftDirty` line 278, both exported). State to persist: `mode`, `draft`, `penDraft`, `amendingBatchId`, `amendBaseline`, `amendOpener` (lines 661-701, 748). Three pen states, not four (`derivePenState` line 329: plan/record/amend; tasting is `draft.tastingOpen`).

Load pattern for the restore read (lines 771-781 style): `repository.getVersion(versionId).then((result) => ...)` with a cancelled flag. Gate persist/delete on a `draftRestoreDone` flag (RESEARCH Pitfall 5; StrictMode double-invokes effects in `main.jsx`).

Delete sites: cancel handlers, after `repository.saveBatch(record)` resolves (lines ~1577 and ~1607), after `saveVersion(child)` (line ~1969, delete the parent's draft before `navigate`) and after the save-over write (~2008).

Notice: call `onPageStatus('...', { persist: true })` (signature in `router.jsx:46`).

Open-draft entry in a fresh page: entry via `handleStartAmending` (line ~1385) sets `draft`, baseline clone and `amendOpener`; restore must set the same set of fields.

### `app/src/router.jsx` (route) - analog: itself

```jsx
// router.jsx:95-113
export const router = createBrowserRouter([
  { Component: Shell, children: [
      { path: '/notebook/:recipeId/:versionId', Component: RecipePageForRoute },
      { path: '/notebook/:recipeId/:versionId/batch/:batchId', Component: RecipePageForRoute },
      ...
      { path: '/search', element: <Placeholder name="Search" /> },
  ]},
]);
```
Add `{ path: '/notebook/:recipeId/:versionId/print', Component: PrintSheetForRoute }` (path settled by the brief's 2026-09-23 amendment, RESEARCH C8) and replace the Search placeholder with the code-entry page. Follow the `RecipePageForRoute` wrapper: `useParams`, key by route params (comment lines 10-30). `PageStatus` is exported from this file (line 72) for reuse. Whether print mounts inside `Shell` or outside it decides the `height: 100%` chain (Pattern 2); if inside, neutralise `.shell`, `.shell__body`, `.shell__main` in print.css.

### `app/src/ui/notebookPaths.js` (utility) - analog: itself

```js
export function notebookPath(recipeId, versionId, batchId = null) {
  const base = `/notebook/${encodeURIComponent(recipeId)}/${encodeURIComponent(versionId)}`;
  return batchId === null ? base : `${base}/batch/${encodeURIComponent(batchId)}`;
}
```
Add a `printPath` in the same style (every segment through `encodeURIComponent`, T-03.5-06). D-12 match lands on `notebookPath(version.recipeId, version.id)`, not the legacy `/recipe/:id`. Header comment states this file is the one place every address is built; no template literals in callers.

### `app/src/domain/sheetCode.js` (utility, transform) - analogs: `domain/id.js`, `domain/rows.js`

Pure, no imports of framework/DOM/store (CONVENTION; test runs in Vitest node). Secure-context lesson from `id.js:1-5`: do not use `crypto.subtle` (device UAT is plain HTTP over LAN); sync pure-JS hash. Clean reading: use `activeRows(version)` and `activeSteps(version)` from `rows.js:65-90` (the same filters `RecipePage` applies at `readingVersion`).

```js
// rows.js:65-86 (signature and contract)
export function activeRows(version) { ... }   // drops removed rows and removed portions; tags kept portions with `index`
export function activeSteps(version) { return version.method.filter((step) => !step.removed); }
```
Alphabet/grouping (Crockford, `XXXX-XXXX`) from RESEARCH "Code Examples"; reference only `~/Documents/projects/old-sprinkles/src/domain/sheet-codes.js` (alphabet, grouping; no nonce). Put one `printedContent(version)` here so the code and the paper share a source. Golden-vector test for Olive Oil v1 (one-way, D-08). Test file style: header-comment + `describe/it` like `store/*.test.js`; node environment.

### `app/src/domain/axes.js` + `blankLog.js` (utility, transform) - analog: `axesForBatch`

```js
// axes.js:44-50
export function axesForBatch(batch) {
  const core = AXES.slice(0, CORE_AXIS_COUNT);
  const declared = batch.snapshot.declaredAxes
    .map((name) => AXES.find((axis) => axis.name === name))
    .filter((axis) => axis != null);
  return [...core, ...declared];
}
```
Add `axesForVersion(version)` reading `version.declaredAxes` the same way. Blank log data: `BATTERY_FIELDS` (key, label, unit), `SEGMENT_OPTIONS`, `DEFECTS`, `DECLARED_FLAW` from `battery.js` (no imports in that file; keep that). `BatchRow.jsx:31-52` already filters churn vs tasting fields:
```js
const CHURN_MEASURED_FIELDS = BATTERY_FIELDS.filter(...)   // :31
const TASTING_MEASURED_FIELDS = BATTERY_FIELDS.filter(...) // :43
const MELT_TEST_FIELD = BATTERY_FIELDS.find((field) => field.key === 'meltTestG'); // :52
```
Log sides take this seam. Print captions differ from the pen (e.g. "Airiness" without "(estimated)" vs `BatchRow.jsx:767`), per the sketch.

### `app/src/ui/PrintSheet.jsx` (component, request-response) - analogs: RecipePage reading tree, `IngredientTable.jsx`, `Method.jsx`

Reuse primitives that RecipePage imports (lines 23-37): `IngredientTable`, `Method` (reading mode, defaults), `NoteList`, `FormulationNote`, `BasisNote`. Do not mount on `.recipe-page` (grid defeats breaks). Load via `repository.getVersion/getRecipe/listVersions` (saved record only, PRINT-05) with the `.then` pattern from RecipePage; not-found reuses the existing RecipeNotFound view. Own class names. Identity line: `versionIdentity(ordered, version)` from `lineage.js:57`. Contract: `.planning/sketches/010-bench-sheet/CONTRACT.md` and the HTML boards (`page-1-batch-log.html`, `page-2-tasting-log.html`, `sheet-balance-col2.html`, `sheet-page-1-formula.html`, `sheet-page-2-table-tail.html`, `sheet-page-3-instructions-end.html`, `screen-print-route-1280.html`, `screen-print-route-393.html`). Every literal in the boards must become a token.

### `app/src/styles/print.css` (CSS) - analog: `app.css:2829-2925` `@media print`

```css
/* app.css:2838-2845 and 2870-2894 */
@media print {
  .page-status { display: none; }
  .ingredient-table thead { display: table-header-group; }
  .ingredient-table tfoot { display: table-row-group; break-before: avoid; }
  .ingredient-table tbody:not(:only-of-type) { break-inside: avoid; }
  .region-name { break-after: avoid; }
  .method-step { break-inside: avoid; }
}
```
Rules: top-level `@media print` siblings, never nested; values via `var(--...)` from `tokens.css`. `@page` and `@supports` cannot live in `app.css` (`styles/css-source.js` `assertNoAtRules` throws; `cross-cutting.test.js` pins the count of `@media` blocks and print rules). So new `print.css`: import after `notebook.css` in `main.jsx:3-8`, add to `CSS_FILE_NAMES` in `tokens.test.js:19`, and write a `print.test.js` with a print-aware reader. Safari branch: `@supports (font: -apple-system-body)` (r8 in `.planning/debug/safari-print-ingredient-table.md`). Measurements to honour: WebKit prints 0.8pt/px so content box 675x900 px at 0.5in margins (Chrome 720x960). Fixed pages use `height: 100%` with `html, body { height: 100% }`, not `100vh`; `min-height: calc(100% - 2px)` on the formula section implements D-06b.

### `app/src/ui/SheetCodeSearch.jsx` (component, request-response) - analogs: `Placeholder.jsx`, `RecipeList.jsx`

```jsx
// Placeholder.jsx:5-12 (page wrapper classes and h1)
<div className="list-page place">
  <h1 className="place__title">{name}</h1>
  <p className="place__note">{name} is not built yet.</p>
</div>
```
Page frame from this plus `RecipeList.jsx:18-44` data load (`useEffect` with `cancelled` flag over `repository.listVersions()`). Label "Sheet code" (D-11); no-match line exactly "No version has this code." (D-13); navigate with `useNavigate` to `notebookPath(...)`. Use a `role="status"` line like `PageStatus`. Controls born on the shared Button.

### `app/src/ui/RecipeList.jsx` (Home) - analog: `HomeLead` (lines 106-135), `RowActions`

Add a short `<Link to="/search" tabIndex={0}>` (pattern: lines 68, 115, 161) and the open-draft line (D-18) reading `repository.listDrafts()` in the existing `Promise.all` load (lines 25-34). Amend drafts link to the batch route (Open Question 4).

### `app/src/ui/VersionRow.jsx` ("Print sheet") - analog: lines 395-441

The `notebook-version__acts` block renders only when `openPen === null`; add a `<Link tabIndex={0}>` styled like `notebook-link`/`notebook-action`, label "Print sheet" (D-05), beside "Next version":
```jsx
<button type="button" className={below724 ? 'notebook-link' : 'notebook-action'} tabIndex={0} onClick={onStartDeveloping}>Next version</button>
```

### Shared controls (`Button.jsx`, `Checkbox.jsx`, `Radio.jsx`) - analog: `tabindex-scan.test.js`

Scan reads every non-test `.jsx` under `app/src` as text (comments stripped), flags `a/Link/NavLink/button` and `input` with literal `radio|checkbox` type lacking a literal `tabIndex={0}`. One allowlist entry exists and a stale entry fails:
```js
// tabindex-scan.test.js:18-26
const ALLOWLIST = [{ file: 'ui/GraduatedRule.jsx', name: 'button',
  contains: 'tabIndex={tabIndex ?? 0}', reason: '...FormulationNote passes -1...' }];
```
After migration the raw tags appear only inside the shared components, each with literal `tabIndex={0}`; GraduatedRule stays the lone exemption or the Button takes an explicit override (RESEARCH Pitfall 8). Counts (RESEARCH C5): 43 buttons, 3 checkboxes (Method x2, VersionRow x1), 2 radios (AxisMark, Segmented), not CONTEXT's 34/2/2. Pin per-component exact counts on rendered markup as the existing per-component tests do. Update `.claude/CLAUDE.md` convention line.

### Print probes - analogs: `.planning/phases/03.7-before-you-start-as-its-own-sheet-section/03.7-print-probe.mjs`, `.planning/canvas-generators/wkprint.swift`, `pdf-pages.swift`

Probe header pattern (lines 1-33): usage block, `PROBE_DIST` env default `app/dist`, scratch `--outDir` builds so `:4173` is never touched, requests to other hosts aborted, harness imports `startServers, launch, openApp, openBoard, APP_ROUTE, REPO_ROOT` from `../03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`, playwright-core imported from the fragile npx cache path (`/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`). `wkprint.swift` prints WebKit to PDF; `pdf-pages.swift` dumps per-page text. Use these for log-page fit (Pitfall 3) and the Safari table sweep.

## Shared Patterns

### Seam and purity
Domain files: no imports of framework/DOM/store (`battery.js` has zero imports). Only `store/db.js` imports `idb`; everything else uses `repository`. Component loads: `repository.x().then(...)` with a cancelled flag (`RecipeList.jsx:25-39`).

### Addresses
All links via `notebookPath`/new `printPath` (`notebookPaths.js`); never a template literal.

### Tab stops
Every `<a>`, `Link`, `button`, radio, checkbox carries literal `tabIndex={0}` (`RecipeList.jsx:68`, `VersionRow.jsx`), enforced by `tabindex-scan.test.js`.

### Page notices
`onPageStatus(message, { persist })` from `router.jsx:46`; `PageStatus` is `role="status" aria-live="polite"` (`router.jsx:72-78`).

### Tokens
No visual literal outside `tokens.css`; `tokens.test.js` gate covers files in `CSS_FILE_NAMES` (add `print.css`). Text renders as text; no `dangerouslySetInnerHTML`.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| Crockford hash and code derivation | utility | transform | No hashing exists in the repo; copy alphabet/grouping from old-sprinkles reference only |
| `@page` / `@supports` print stylesheet with fixed pages | config | transform | Existing print layer is one 90-line block; no `@page` anywhere; needs its own file and test reader |
| Draft restore/persist effect | hook-in-component | event-driven | `beforeunload` effect is the structural analog only; no persistence code exists |

## Metadata

**Analog search scope:** `app/src/{domain,store,ui,styles}`, `app/tests`, `.planning/canvas-generators`, `.planning/phases/03.*` probes, `.planning/sketches/010-bench-sheet`
**Files scanned:** about 40 read or grepped
**Pattern extraction date:** 2026-10-11
**Open items for the planner (from RESEARCH, unresolved):** DB reset vs additive upgrade; foot and page numbers in Safari; log-page fit at WebKit's 900 px; unapproved on-screen surfaces (print route screen, Search, Home draft line); D6 gating; amend-draft route restore.
