# Phase 8: Split the recipe page along its jobs - Pattern Map

**Mapped:** 2026-10-17
**Files analyzed:** 17 (9 new source, 2 modified source, 6 test/script)
**Analogs found:** 16 / 17 (all tracked; verified with git ls-files for usePenDraft.js, useRecordDraft.js, 05-walk.mjs)

This is a move, not a redesign. 08-RESEARCH.md holds the cut table with line numbers of `RecipePage.jsx` (unchanged since `ad87a67`). This file only names the analog per new file.

## File Classification

| New/Modified File (under `app/src/ui/` unless stated) | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `useAnnouncer.js` | hook | event-driven (timers) | `usePenDraft.js` | role-match |
| `useRecipeData.js` | hook | CRUD read (8 repository reads) | `RecipePage.jsx` 262-443 (source of the move); shape from `usePenDraft.js` | role-match |
| `sheetView.js` | utility (pure) | transform | `../domain/penDraft.js` (pure, domain imports only); source: `RecipePage.jsx` 63-69, 777-873 | role-match |
| `RecipeSheet.jsx` | component | request-response (render) | `Method.jsx` / `Headnote.jsx` (props-in component); source: `RecipePage.jsx` 1564-1786 | role-match |
| `useVersionPen.js` | hook | CRUD write | `usePenDraft.js` (wrapped, called once) | exact |
| `useKeptDraft.js` (`useKeptDraft` + `useDraftWriter`) | hook | event-driven + file-I/O (drafts store) | `useRecordDraft.js` for hook style; source `RecipePage.jsx` 463-614 | role-match |
| `useRouteIntents.js` | hook | event-driven | `RecipePage.jsx` 626-659 (source) | role-match |
| `RecipePage.jsx` (modify) | component (shell) | request-response | itself; re-exports per Pattern 3 | n/a |
| `RecipePage.shell.test.js` (rewrite) | test (source-text) | batch | itself, lines 14-107 | exact |
| `RecipePage.test.jsx` (re-point `readFileSync` of 8 describes) | test | transform | itself (lines 883, 925, 999, 1138, 1151, 1218, 1248, 1288) | exact |
| `sheetView.test.js` | test (node) | transform | `Method.test.jsx` (node env, no docblock) | role-match |
| `RecipeSheet.test.jsx` | test | request-response | `Method.test.jsx` (`renderToStaticMarkup`) plus `MemoryRouter` | exact |
| `RecipePage.strictMode.test.jsx` | test (jsdom page) | event-driven | `RecipePage.drafts.test.jsx` 1-150 | exact |
| `useKeptDraft.test.jsx` (hook-level StrictMode) | test (jsdom) | event-driven | `usePenDraft.test.jsx` plus the drafts harness | role-match |
| `RecipePage.shellEffects.test.jsx` | test (jsdom page) | event-driven | `RecipePage.drafts.test.jsx` | exact |
| `.planning/phases/08-.../08-walk.mjs` | script | batch | `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs` (copy unchanged; keep `walk: '05'`) | exact |
| `useBatchRecording.js` (bonus, D-01) | hook | CRUD | `useRecordDraft.js` | role-match |

## Pattern Assignments

### New hooks (all): copy the `usePenDraft.js` discipline

**Analog:** `app/src/ui/usePenDraft.js` (94 lines). Excerpts, lines 1-11:
```js
import { useRef, useState } from 'react';
import { penDraftFromVersion, penFieldsFromDraft, penSaveBlock } from '../domain/penDraft.js';

// The version pen's draft (Phase 5, EDIT-02).
// D-04: plain useState, no useReducer. ...
// D-07: the hook stops at the draft. RecipePage keeps the save locks, the
// page status, the announcer and the repository calls; ...
export function usePenDraft() {
  const [penDraft, setPenDraft] = useState(null);
```
Rules to copy: plain `useState`/`useRef`, a named export, a header comment stating which decision and what the hook does not own, plain function handlers (no `useCallback`), dependency arrays verbatim. `usePenDraft.js` and `useRecordDraft.js` import only `react` and `../domain/`, never the repository; the new hooks that touch the store (`useRecipeData`, `useKeptDraft`, `useVersionPen`) import `../store/repository.js` only.

`useVersionPen` is called once, wraps `usePenDraft()` (the shell test pins `usePenDraft()` once, now in `useVersionPen.js`). Hook parameters must be named `announce` and `onPageStatus`; `RecipePage.test.jsx:883-923` finds callers by regex.

Call order (acyclic, from RESEARCH Pattern 1): `useAnnouncer` -> `useRecipeData` -> mode state -> `useRecordDraft` -> `useDraftWriter` -> `useVersionPen` -> title effect -> `useKeptDraft` -> `useRouteIntents` -> Escape/Import-guard effects -> width/fold hooks -> early returns (`if (loadFailed) return`, line 725). All above the early returns.

Ids and instants stay in handlers: `freshId()` and `new Date().toISOString()` never at render.

### `RecipePage.shell.test.js` (rewrite)

**Analog:** itself. Reuse its helpers (lines 14-31): `raw(relative)` via `readFileSync(fileURLToPath(new URL(relative, import.meta.url)))`, `stripComments` (string-aware `STRING_OR_COMMENT` regex), `count`, `specifiersOf`. Reuse the hook-order idiom (lines 96-107):
```js
const earlyReturn = recipePage.indexOf('if (loadFailed) return');
it.each(['usePenDraft()', 'useRecordDraft()'])('%s is called exactly once, before the early returns', (call) => {
  expect(count(recipePage, call)).toBe(1);
  expect(recipePage.indexOf(call)).toBeLessThan(earlyReturn);
});
```
Extend as an `it.each` over a module table (`useAnnouncer.js`, `useRecipeData.js`, `sheetView.js`, `RecipeSheet.jsx`, `useVersionPen.js`, `useKeptDraft.js`, `useRouteIntents.js`): file exists, exports the name, shell imports it, shell calls it once before the first early return, marker present in the module. Keep the fixture idiom (lines 71-94) so each positive marker can fail. Keep (a), (b), (d), (e), (g) unused-import check applied to each new file, and (h) no `dangerouslySetInnerHTML` for each new file. Update the module-function list to `['PageLoadFailed','RecipeNotFound','RecipePage']` at cut 3.

### `RecipePage.test.jsx` pins

Re-point only the `readFileSync` target (page to the file now holding the code, Decision D-11). Regexes unchanged. Table of which cut breaks which describe: RESEARCH Pitfall 1.

### `RecipeSheet.test.jsx` and `sheetView.test.js`

**Analog:** `Method.test.jsx` lines 1-14: node env, no docblock, `renderToStaticMarkup` from `react-dom/server`, imports from `./X.jsx` and `../domain/*.js`, fixtures from `../data/*.js`. Wrap `RecipeSheet` in `MemoryRouter` (it renders links). `sheetView.test.js` imports `buildDiff` from `../domain/diff.js` for the baseline-equals-version case.

### Page-mounting jsdom tests (strictMode, shellEffects, useKeptDraft)

**Analog:** `RecipePage.drafts.test.jsx` lines 1-150. Copy:
- docblock `// @vitest-environment jsdom`; `act` from `react`, `createRoot` from `react-dom/client`, `MemoryRouter, Routes, Route, useParams` from `react-router`; `globalThis.IS_REACT_ACT_ENVIRONMENT = true`.
- `vi.hoisted` store plus `vi.mock('../store/repository.js', async () => {...})` returning `repository` with `getVersion, listVersions, listBatchesForVersion, getAllBatches, getBatch, getRecipe, saveBatch, saveVersion, saveRecipe, getDraft, saveDraft, deleteDraft, listDrafts` (lines 22-82).
- `Keyed` wrapper keying `RecipePage` by `${recipeId}::${versionId}::${batchId ?? ''}` (lines 112-115); `installMatchMedia()` (125-136); `flush(until)` loop of `await act(async () => { await Promise.resolve(); })` (138-146).
- Wrap the tree in `<StrictMode>` for the new test. The discriminating shape (hook-level with data present at mount, plus page-level Save over with zero extra `getDraft`) is in RESEARCH Pitfall 2.

### `08-walk.mjs`

Copy `05-walk.mjs` unchanged into the phase directory (the file was written for `.planning/phases/<phase>/`, so both the harness path and repo root resolve). Keep `walk: '05'`. Build to a scratch `--outDir` and set `PROBE_DIST`; commands in RESEARCH "Code Examples". Compare against `05-walk-before.json`.

## Shared Patterns

- **Repository seam:** only `useRecipeData.js`, `useKeptDraft.js`, `useVersionPen.js` and the page (while batch handlers stay) import `../store/repository.js`. No `idb`.
- **Re-exports** (RESEARCH Pattern 3): in `RecipePage.jsx`, `export { VERSION_SAVED_STATUS, VERSION_SAVE_ERROR, VERSION_BLOCKED_STATUS } from './useVersionPen.js';` and the same for `DRAFT_KEPT_STATUS` from `useKeptDraft.js`. `RecipeNotFound` stays exported from the page.
- **Tab stops:** `tabindex-scan.test.js` scans every non-test `.jsx`; `RecipeSheet.jsx` must route buttons through `Button.jsx`/`Checkbox.jsx`/`Radio.jsx` and carry `tabIndex={0}` on links. Moved JSX already complies.
- **Restore-once effect:** keep the started-ref guard, no cancellation cleanup (D-10); amend-redirect branch returns without `setDraftRestoreDone(true)`.
- **Dependency arrays verbatim** (listed in RESEARCH Pattern 1); there is no ESLint.

## No Analog Found

| File | Reason |
|---|---|
| `useKeptDraft.js` StrictMode hook harness | No existing StrictMode test in the suite; shape is given in RESEARCH Code Examples |

## Metadata

**Analog search scope:** `app/src/ui/`, `.planning/milestones/v1.1-phases/05-split-the-recipe-page/`
**Pattern extraction date:** 2026-10-17
