# Phase 10: The creation editor, without Save - Pattern Map

**Mapped:** 2026-10-19
**Files analyzed:** 17 new or modified (plus tests)
**Analogs found:** 16 / 17 (the Shell creation-kept ref has only a partial analog)

All analog paths below were checked as git-tracked (`git ls-files`). Paths are relative to `/Users/mark/Documents/projects/sprinkles/app/src/` unless they start with `.planning/`. 10-RESEARCH.md already carries the pin tables and the Code Map with line numbers; this file adds the concrete excerpts to copy. Read RESEARCH "Pins" before writing any file here.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `domain/creation.js` (+ `.test.js`) | utility (pure domain) | transform | `domain/newRecipe.js`, `domain/draft.js` (`blankCreateDraft`), `domain/versionRow.js` | role-match |
| `ui/CreationRoute.jsx` | route wrapper | request-response (read, redirect) | `ui/NotebookRedirects.jsx` `NotebookLatestRedirect` | exact |
| `ui/CreationPage.jsx` | component (page) | CRUD + debounced event-driven writes | `ui/RecipePage.jsx` hook order, `ui/useKeptDraft.js` call shape | role-match |
| `ui/useCreation.js` (optional hook) | hook | event-driven | `ui/useKeptDraft.js` (`useDraftWriter`) | role-match |
| `ui/IngredientPicker.jsx` | component | request-response (filter) | `ui/IngredientsPlace.jsx` (`IngredientsList`) | exact |
| log-column components (`ui/CreationSetup.jsx` or three) | component | CRUD (controlled fields) | `ui/Segmented.jsx`, `ui/MarkOneField.jsx`, `ui/FieldFeedback.jsx` | role-match |
| `ui/NotebookPlace.jsx` (modify) | component | CRUD | itself; Start write analog is `useDraftWriter.flushPendingDraft` | exact |
| `ui/useKeptDraft.js` (modify, D-04a) | hook | event-driven | itself | exact |
| `ui/RecipeSheet.jsx`, `Headnote`, `Authored`, `FormulationNote`, `IngredientTable`, `Segmented` (modify) | component | transform | themselves (additive `creating` props) | exact |
| `ui/Shell.jsx` (modify) | component | event-driven | `importGuardRef` / `guardImport` / `chooseImportFile` in itself | partial |
| `router.jsx` (modify) | config | request-response | route table `router.jsx:110-133` | exact |
| `ui/notebookPaths.js` (modify) | utility | transform | itself | exact |
| `styles/notebook.css`, `styles/shell.css` (modify) | config (CSS) | none | existing rules in the same files | exact |
| `.planning/phases/10-.../10-walk.mjs` + `10-walk-check.sh` + `10-walk-record-base.sh` | test harness | batch | `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk*.{mjs,sh}` | exact |
| `ui/useKeptDraft.test.jsx` (modify) | test | event-driven | itself | exact |
| `ui/NotebookPlace.test.jsx` (modify) | test | request-response | itself | exact |
| new `*.test.jsx` / `*.test.js` beside each | test | - | `useKeptDraft.test.jsx`, `NotebookPlace.test.jsx`, `IngredientsPlace.test.jsx`, `domain/draft.test.js`, `RecipePage.shell.test.js` | exact |

## Pattern Assignments

### `ui/CreationRoute.jsx` (route wrapper, request-response)

**Analog:** `ui/NotebookRedirects.jsx` lines 1-5, 50-74. Copy the component-effect + `cancelled` flag + `{ replace: true }` shape. The `cancelled` pin applies only to `useKeptDraft.js` (RecipePage.shell.test.js:619-624), so it is allowed here.

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { repository } from '../store/repository.js';

export function NotebookLatestRedirect() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    repository.listVersions().then((versions) => {
      if (cancelled) return;
      const path = latestVersionPath(versions, recipeId);
      if (path) { navigate(path, { replace: true }); } else { setNotFound(true); }
    });
    return () => { cancelled = true; };
  }, [recipeId]);
  if (notFound) return <RecipeNotFound />;
  return null;
}
```

Adapt: `repository.listDrafts()` -> filter `draftMatchesCreate` -> `newestDraft`; none -> `navigate('/notebook', { replace: true })` and return null (silent, D-02); found -> `<CreationPage key={record.versionId} recipeId versionId initial={record.payload} />`. Keep only the `{ path: '/notebook/new', Component: ... }` object in `router.jsx`, placed before line 115 (`/notebook/:recipeId`); router.jsx may not gain `<Link` and may not put `className="page-status-anchor"`, `<PageStatus` or `<RecipePage` earlier in its text (RecipePage.test.jsx:926-954). Do not reformat the route lines pinned at RecipePage.test.jsx:961-993.

---

### `domain/creation.js` (pure utility, transform)

**Analogs:** `domain/newRecipe.js` (header comment style, throw on caller bugs, caller supplies ids and clock), `domain/draft.js:531-547` (`blankCreateDraft`), `domain/versionRow.js:34-79` (`rowFromLibraryRecord`).

Header convention to copy (newRecipe.js:1-15): "Pure. No framework, DOM, or store import." and "the caller supplies the ids and the clock; this module reads neither a clock nor a random source". Imports are relative `./x.js` only, so the domain suite stays provable in the node environment (project Convention).

Argument-guard style (newRecipe.js:36-40):
```js
for (const [label, value] of [['recipeId', recipeId], ['versionId', versionId], ['now', now]]) {
  if (typeof value !== 'string' || value === '') {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}
```

Blank payload to start from (draft.js:531-547): `{ recipeId, versionId, name, description: '', versionLabel: 'Version 1', beforeYouStart: [], rows: [], method: [], scales: [], problems: [], style: null, targets: {}, serveTempC: '' }`. A draft row is `{id, libraryId, portions:[{step:1, grams:string}]}` (`fitsCreateRow`, draft.js:412-427); `CREATE_DRAFT_KEYS` must not change.

Projection to copy (versionRow.js:34 and 71-78): `rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName })` takes a record `{id, entry}`, a finite non-negative `grams` number, and returns `{ id, ingredientName, ingredient: structuredClone(entry), libraryId, portions: [{step, grams}], removed: false }`. Per D-08, call it with `parseGramsDraft(raw) ?? 0` (`parseGramsDraft` from `./lineage.js`, regex `/^\d+(\.\d{1,2})?$/`). Guard a row whose `libraryId` is missing from the map (RESEARCH Pitfall 7): skip, never throw in render.

Start helper (D-04), pure so node tests can pin it, modelled on `createRecipe`'s `{ recipeId, versionId, now }` arguments plus `buildDraftRecord({ versionId, kind: 'create', payload, now })` (draft.js:67-84, structuredClones the payload). Scale mint: `{ key: mintScaleKey(freshId()), name: '', low: '', high: '', kind: '', group: 'declared' }` (`mintScaleKey` catalog.js:74; `freshId` domain/id.js:6), minted in the click handler, never in render. Same-name check: `recipeNameTaken(recipes, name)`, trim and case-insensitive; "Enter a recipe name." comes from `recipeNameMessage` (recipe.js:5, 13), not a new string.

Tests: copy the structure of `domain/draft.test.js` and `newRecipe.test.js` (node environment, no docblock).

---

### `ui/CreationPage.jsx` and optional `ui/useCreation.js` (hook order and kept draft)

**Analog:** `ui/useKeptDraft.js` (signature at 19-53 and 75+; creating branch at 96-99 in the restore effect and 199-206 in persist). Hook-order law: `useDraftWriter(versionId)` -> `useState(createDraft)` -> library and catalog reads -> `useKeptDraft({... creating: true, createDraft, onRestoreCreate})`, all above any early return. `versionId` is read from the first render only, hence `key={versionId}` from the wrapper.

```js
// useKeptDraft.js:19-53 (shape the page calls)
export function useDraftWriter(versionId) {
  const draftStoredRef = useRef(false);
  const pendingDraftRef = useRef(null);
  const draftTimerRef = useRef(null);
  function flushPendingDraft() { /* ... Promise.resolve().then(() => repository.saveDraft(record)).catch(() => {}); */ }
  function discardDraft() {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = null; pendingDraftRef.current = null; draftStoredRef.current = false;
    Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});
  }
  return { draftStoredRef, pendingDraftRef, draftTimerRef, flushPendingDraft, discardDraft };
}
```

Rules: `createDraft` is state, a new object per change, the same object across renders (identity rule, useKeptDraft.js header 65-74). Setter named `setCreateDraft`, never `setDraft` (banned word in NEW_MODULES). `DRAFT_KEPT_STATUS` (line 11) fires on every restore; the page chooses what `onPageStatus` does so a fresh Start does not announce it. `discardDraft()` returns nothing and the delete is not awaited (RESEARCH Pitfall 6): Cancel in the page must account for that before navigating. Do not add a second `function discardDraft(` anywhere that RecipePage.shell.test.js:252 counts.

### `ui/useKeptDraft.js` (modify, D-04a)

Change at lines 199-206 only: in the `creating` branch drop the `if (isCreateDraftDirty(createDraft))` so the record is always built.

```js
if (creating) {
  if (isCreateDraftDirty(createDraft)) {     // <- becomes unconditional
    record = buildDraftRecord({ versionId, kind: 'create', payload: createDraft, now: new Date().toISOString() });
  }
}
```

Then remove `isCreateDraftDirty` from the import on line 3 (`unusedImports` pin). Keep call-site counts (RecipePage.shell.test.js:258-293): `buildDraftRecord(` 3, `kind: 'create'` 1, `repository.deleteDraft(versionId)` 3, and no `cancelled` identifier. Do not delete `isCreateDraftDirty` from `domain/draft.js` (draft.test.js:728-738 still pins it).

---

### `ui/NotebookPlace.jsx` (modify: head, New recipe entry, Start, draft row, Resume)

**Analog:** itself. Imports (lines 1-7) and markup conventions to extend:

```jsx
import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { repository } from '../store/repository.js';
import { notebookPath } from './notebookPaths.js';
import { PAGE_LOAD_ERROR } from './RecipePage.jsx';
// effect: lines 19-32
Promise.all([repository.getAll(), repository.getAllBatches(), repository.listRecipes()])
  .then(([versions, batches, recipes]) => { if (!cancelled) setData({ versions, batches, recipes }); })
  .catch(() => { if (!cancelled) setFailed(true); });
```

Add `repository.listDrafts()` to that `Promise.all`; filter with `draftMatchesCreate` + `newestDraft`. The empty-list early return (lines 58-67) must still render the head, New recipe or Resume, and any draft row. Row markup to mirror for `li.nb__draft` (lines 77-91): `span.nb__rail aria-hidden`, `h2.nb__name` (no link for a draft), `p.nb__meta`. Board markup is in RESEARCH "Sketch 013" (`div.nb__head` > `h1.place__title` + `button.notebook-action`; `form.nb__new`; `ul.nb__drafts`). Every link keeps `tabIndex={0}`; buttons render through `ui/Button.jsx`; a Resume that navigates is `Button` + `useNavigate`. Names and descriptions are React text children, never markup.

Field message + label pattern from `ui/IngredientsPlace.jsx:190-201`: `label.notebook-field` > `span.notebook-caption` + `input.ink-field` with `autoComplete="off"`; message via `FieldFeedback` (below). Forms preventDefault on submit as `IngredientsList` does (`onSubmit={(event) => event.preventDefault()}`) unless Start handles the submit itself.

### `ui/FieldFeedback.jsx` (reuse for per-field messages, D-08)

```jsx
export function FieldFeedback({ error = null, errorId, required = false }) {
  if (error) return <span id={errorId} className="field-error">{error}</span>;
  if (required) return <span className="field-requirement" aria-hidden="true">Required</span>;
  return null;
}
```
Use a per-row `errorId` for creation rows; do not reuse `BLOCKED_ROW_ERROR_ID = 'ingredient-field-error'` (IngredientTable.jsx:14).

---

### `ui/IngredientPicker.jsx` (component, request-response)

**Analog:** `ui/IngredientsPlace.jsx` (`IngredientsList`, lines ~143-260). Filter state, `libraryCategories`, `filterLibrary` and the focus-return on clear:

```jsx
const [query, setQuery] = useState('');
const [category, setCategory] = useState(ALL);
const nameRef = useRef(null);
const categories = libraryCategories(records);
const shown = filterLibrary(records, query, category);
const filtered = query.trim() !== '' || category !== ALL;
// ... <label className="notebook-field ing__field"><span className="notebook-caption">Name</span>
//     <input ref={nameRef} className="ink-field" type="text" value={query} onChange={...} autoComplete="off" spellCheck={false} enterKeyHint="search" />
```
`records` are `{ id, entry }` as `repository.listLibrary()` returns. The library is loaded once on the page and shared between picker and Balance projection (D-07). Imports `filterLibrary`, `libraryCategories` from `../domain/ingredientSearch.js`; export `summaryText` (IngredientsPlace.jsx:91) and `capitalised` (:50), which are currently module-private (T-05). A `<select>` is not scanned by tabindex-scan: add `tabIndex={0}` by hand, as IngredientsPlace.jsx does at ~208-213. "Every recipe" cues come from `useCatalog()`, never an array literal (seed-data-scan). Count words: `ui/countWords.js` `ingredientCountWords(shown, total, filtered)`.

---

### Log-column components (Style select, Scales, Problems)

**Analogs:** `ui/Segmented.jsx` (joined radio group; its structure with `Radio` + no-op onChange + onClick), `ui/MarkOneField.jsx` (two-option group with a per-field `groupName`), `ui/FieldFeedback.jsx`.

```jsx
// Segmented.jsx:28-31 - the name is derived from the label, so two scale cards would collide (T-04)
const groupName = `segment-${groupLabel.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
const captionId = `${groupName}-caption`;
const picked = options.includes(value);
// ... {picked && <Button className="text-control segmented-field__clear" aria-label={`Clear ${groupLabel}`} onClick={handleClear}>Clear</Button>}
// ... <label key={option} className="segmented__option"><Radio name={groupName} value={option} ...
```
`MarkOneField.jsx:35-39` shows the keyed-name alternative: `const groupName = \`mo-${key}\`` with `captionId = \`${groupName}-caption\``. For scales, the Kind cells take a per-scale radio name keyed by `scale.key` and render no Clear (T-04). Either add a `name` and `showClear` prop to `Segmented` (additive) or write a small Kind control copying `MarkOneField`. Labels "Right in the middle" and "Low to high" map to `goldilocks` and `magnitude` (`SCALE_KINDS`, catalog.js:18; `''` is unpicked, never pre-picked). Every radio and button goes through `Radio.jsx` / `Button.jsx`.

---

### `ui/RecipeSheet.jsx` and children (additive `creating` props)

Pins (RESEARCH "Source-text pins") to honour: imports only `react` or `./` siblings; exactly one each of `<IngredientTable`, `<FormulationNote`, `<Method`; change only the definition at RecipeSheet.jsx:88 to `beforeRegionShown = mode === 'developing' || mode === 'creating' || beforeNotes.length > 0`; the Balance region condition is `(!creating || view.figures.length > 0)` so `RecipeSheet.test.jsx:68` still holds. `sheetView.js` needs no change: pass a synthetic version, `baseline: null`, mode `'creating'`. The flat table is automatic with `method: []` and `step: 1` portions.

---

### `ui/Shell.jsx` (modify: creation-kept ref, import refusal)

**Analog (partial):** `importGuardRef` (Shell.jsx:197), `guardImport` (322-327), `chooseImportFile` (332-338), `IMPORT_BLOCKED_STATUS` (24). The click handler is synchronous; keep the decision a ref read. Reading drafts at boot must tolerate the `repository: {}` stub that `Shell.test.jsx:15` and `Shell.flyout.test.jsx:17` install (`vi.mock('../store/repository.js', () => ({ repository: {} }))`), so wrap it in the codebase's own guard:

```js
Promise.resolve().then(() => repository.listDrafts()).catch(() => {});   // useKeptDraft.js:38 pattern
```
Test the refusal like `Shell.importGuard.test.jsx:170-177` (`notice()` reads the FIRST `.page-status`). `Shell.test.jsx:202-231` pins source text of Shell.jsx (`useLocation`, `<details className="shell__more"`, the `}, [pathname]);` effect, `<ul onClick={closeMore}>`): add effects and refs without disturbing those.

---

### `.planning/phases/10-.../10-walk.mjs`, `10-walk-check.sh`, `10-walk-record-base.sh` (strict walk)

**Analog:** `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs` (1543 lines), `09-walk-check.sh`, `09-walk-record-base.sh`.

`09-walk-check.sh` (copy, change PHASE and SCRATCH to Phase 10 names and baseline to `10-walk-before.json`):
```sh
BASELINE="$PHASE/09-walk-before.json"
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir
PROBE_DIST="$SCRATCH/dist" node "$PHASE/09-walk.mjs" record "$OUT"
node "$PHASE/09-walk.mjs" compare "$BASELINE" "$OUT"
```
`09-walk-record-base.sh` records from a temporary git worktree at BASE, refuses when a stranger commit touched `app/` (its `grep -Eiv '^[0-9a-f]+ [a-z]+\(09(-[0-9]+)?\):|merge executor worktree'` pattern becomes `10`), then `ln -s "$ROOT/app/node_modules"` and builds to `$SCRATCH/dist-base`. Pick the Phase 10 BASE as the last app-touching commit before any Phase 10 plan (HEAD `e461a7a1`'s app tree; confirm with `git log -- app/`).

Strict mode: the compare in `09-walk.mjs` allows store differences through `ALLOWED_STORE_PATHS` (defined ~line 997; consulted in `compareResult` at ~1229-1245, `if (match && entry.check(...)) passed = true`) and also runs `requiredStoreFields`. The Phase 10 copy keeps the walk body (record mode, 94 snapshots) and either empties `ALLOWED_STORE_PATHS`, drops the `expected` / `selftest` modes and `requiredStoreFields`, or gates them behind nothing, so any `stores.` leaf difference is emitted. Compare exits 1 on any diff and prints "MATCH 94 snapshots" otherwise. Record the before-walk before any `app/` edit (RESEARCH recommendation).

---

### Tests

**`ui/useKeptDraft.test.jsx`** harness to copy (lines 1-60): jsdom docblock, hoisted repo stub, `vi.mock('../store/repository.js', ...)` with `getDraft/saveDraft/deleteDraft`, `globalThis.IS_REACT_ACT_ENVIRONMENT = true`, `createRoot` + `act`. Cases that change (D-04a): `useKeptDraft.test.jsx:494-508` ("deletes the stored record when the draft is set back to blank", creating) and `564-587`; they become "overwrites the stored create draft; never deletes". The pen case at 290-301 stays:
```js
expect(repo.deleteDraft).toHaveBeenCalledTimes(1);
expect(repo.deleteDraft).toHaveBeenCalledWith(oliveOilVersion.id);
expect(repo.saveDraft).not.toHaveBeenCalled();
```

**`ui/NotebookPlace.test.jsx`** store stub (header + lines 185-210): `vi.mock('../store/repository.js', () => ({ repository: {} }))` then per-test assignment, and a `mount()` wrapped in `MemoryRouter`/`Routes`/`Route` with an `Outlet` context:
```js
repository.getAll = vi.fn().mockResolvedValue(versions);
repository.getAllBatches = vi.fn().mockResolvedValue(batches);
repository.listRecipes = vi.fn().mockResolvedValue(recipes);
// Phase 10 adds: repository.listDrafts = vi.fn().mockResolvedValue([]);
```
Replace the Phase 9 "offers nothing to start" pin (NotebookPlace.test.jsx:95-98, T-03). Presentational cases use `renderToStaticMarkup` inside `MemoryRouter` and a `parse(markup)` container helper (lines 25-45).

**`ui/Shell.test.jsx`**: `vi.mock('../store/repository.js', () => ({ repository: {} }))`, `renderToStaticMarkup`, `MemoryRouter` + `Routes` + `CatalogFixture` (lines 1-40); read Shell.jsx source with `readFileSync` for source pins.

**`ui/RecipePage.shell.test.js`** source-text pin style, node environment, no docblock: `raw(relative)`, `stripComments` (string-aware regex so `//` inside a string stays code), `count(source, needle)`, `specifiersOf(source)` for import allow-lists. New creation modules join the same checks: a pin that `CreationPage`/`useCreation` contain no banned setter names, no `dangerouslySetInnerHTML`, no `idb` import, and that new `ui` files import only the repository seam for the store.

**`ui/IngredientsPlace.test.jsx`** and **`domain/draft.test.js`**: copy for picker filter cases (records `{id, entry}`) and for pure-domain node tests (`draft.test.js:594` uses style id `philadelphia`).

---

## Shared Patterns

### Store access only through the repository seam
**Source:** `ui/useKeptDraft.js:2`, `ui/NotebookPlace.jsx:3`. `import { repository } from '../store/repository.js';` Apply to every new `ui` file that reads or writes. No module under `app/src` except the repository imports `idb`. Fire-and-forget writes use `Promise.resolve().then(() => repository.X()).catch(() => {})` (useKeptDraft.js:38, 49).

### Hook-order and effect/cancel pattern
**Source:** `ui/NotebookPlace.jsx:19-32`. `let cancelled = false; ... return () => { cancelled = true; };` with `.catch(() => { if (!cancelled) setFailed(true); })` and the single load-error line `PAGE_LOAD_ERROR` from `./RecipePage.jsx`. Apply to CreationRoute, CreationPage library load, NotebookPlace.

### Controls and tab order
**Source:** `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx`, tabindex-scan.test.js. Every button, checkbox and radio renders through these; every `a`, `Link`, `NavLink` carries literal `tabIndex={0}`; `select` gets `tabIndex={0}` by hand. Apply to all new JSX.

### Text, never markup
No `dangerouslySetInnerHTML` under `app/src`; stored names, descriptions and notes are React text children (NotebookPlace.jsx header comment, T-09-06).

### Tokens and CSS scope
Every visual value is a `var(--token)` from `styles/tokens.css`; no bare px or hex in notebook.css (notebook.test.js). `notebook.css`: every selector starts `.notebook`, `@media` list pinned (use `723.98px` and `(pointer: coarse)`, no new block). `shell.css`: every selector starts `.shell` or `.place`; entry and draft-row rules go inside the existing places `@media` blocks (shell.test.js:70-152); no new `border-radius` selector. `.pick__act`'s underline lives in notebook.css, not app.css. Rules and values come from the boards (`.planning/canvas-generators/p10.py` P10_CSS), rescoped.

### Validation message
**Source:** `domain/recipe.js:5, 13` (`recipeNameMessage`, "Enter a recipe name."); `lineage.js:212` (`parseGramsDraft`). Domain constructors throw on caller bugs, maker input becomes messages (memory: throw-for-caller-bugs-message-for-maker-input).

## No Analog Found

| File / need | Role | Data Flow | Reason |
|---|---|---|---|
| Shell-level "creation kept" ref and sync refusal on every route | component | event-driven | `importGuardRef` is set only by pen pages through `guardImport`; nothing in Shell reads the drafts store at boot yet. Partial analog only; see RESEARCH Open Question 1 and Pitfalls 3-4. |
| Per-row blur-timed grams message (several rows at once) | component | event-driven | The pen has one `blockedRowId` and one error id (IngredientTable.jsx:14); a per-row map keyed by row id is new. |
| Page-scoped `.page-status` on `/notebook` and `/notebook/new` | component | event-driven | `.page-status-anchor` and `<PageStatus>` exist only in `RecipePageForRoute` (router.jsx:35-84), pinned by RecipePage.test.jsx:926-954 (D-10a). Follow `Shell.importGuard.test.jsx:170-177` for the test. |

## Metadata

**Analog search scope:** `app/src/ui`, `app/src/domain`, `app/src/styles` (by RESEARCH references), `.planning/phases/09-...` walk files.
**Files read this pass:** useKeptDraft.js (1-80, 195-240), NotebookRedirects.jsx, NotebookPlace.jsx, newRecipe.js, draft.js (520-575), versionRow.js (25-80), FieldFeedback.jsx, Segmented.jsx (1-60), MarkOneField.jsx (1-40), IngredientsPlace.jsx (100-200), NotebookPlace.test.jsx, Shell.test.jsx, useKeptDraft.test.jsx, RecipePage.shell.test.js (1-60), 09-walk.mjs (headers, compare), 09-walk-check.sh, 09-walk-record-base.sh; 10-RESEARCH.md (lines 1-313 only; the remainder, pitfalls and walk-harness sections past line 313, was not read here).
**Pattern extraction date:** 2026-10-19
