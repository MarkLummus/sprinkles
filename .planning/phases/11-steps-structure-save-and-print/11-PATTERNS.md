# Phase 11: Steps, structure, save and print - Pattern Map

**Mapped:** 2026-10-26
**Files analyzed:** 30 new or modified (plus tests)
**Analogs found:** 28 / 30 (the Add to step chooser and the focus-after-move effect have only partial analogs)

All analog paths were checked as git-tracked (`git ls-files`). Paths are relative to `/Users/mark/Documents/projects/sprinkles/app/src/` unless they start with `.planning/`. 11-RESEARCH.md carries the findings G-1 to G-13, the pin table ("Source-text and CSS pins") and the slice order; this file adds the excerpts to copy. Read RESEARCH "Findings that change the plan" before writing any file here. Excerpts below are cited by file and line from this session's reads.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `domain/creationSteps.js` (+test) NEW | utility (pure domain) | transform | `domain/creation.js` (`addRow`, `removeRow`, `assertRowId`) + `domain/penDraft.js` (`setPenStepField`, `setPenStepTarget`) + `domain/stepKeys.js` | exact |
| `domain/creation.js` (modify: `creationSheetVersion`, `removeRow` prunes uses) | utility | transform | itself (lines 65-91, 164-167) | exact |
| `domain/creationSave.js` (+test) NEW | utility (gate + builder) | transform | `domain/newRecipe.js` (`createRecipe`) + `domain/penDraft.js` (`penSaveBlock`) | role-match |
| `domain/newRecipe.js` (modify: optional fields) | utility | transform | itself (lines 36-88) | exact |
| `domain/draft.js` (modify: kind `'edit'`, `draftMatchesEdit`) | utility | transform | itself (`KINDS` line 53, `draftMatchesVersion` line ~309, create payload check) | exact |
| `store/repository.js` (modify: `createRecipeWithVersion`, `saveFirstVersionOver`) | store | CRUD, one transaction | `importAll` (lines 240-285) + `putVersionChecked` (lines 9-27) | exact |
| `store/repository.test.js` (modify: forced-failure Save tests) | test | request-response | its own `importAll` rollback test (lines 139-153) | exact |
| `store/creation-roundtrip.test.js` (modify) | test | transform | itself | exact |
| `ui/EditRoute.jsx` NEW | route wrapper | request-response (read, redirect) | `ui/CreationRoute.jsx` (+ `ui/NotebookRedirects.jsx`) | exact |
| `ui/CreationPage.jsx` (modify: mode, Save/Cancel, handlers, focus) | component (page) | CRUD + debounced writes | itself (`focusRequestRef` effect lines 140-153, `mk-add-row` lines 319-335) | exact |
| `ui/CreationSteps.jsx` NEW (Instructions region in `creating`) | component | CRUD (controlled fields) | `ui/Method.jsx` `StepPenBody` (open step) + `useOnDemandField` (line 51) | role-match |
| `ui/StepReading.jsx` NEW | component | transform (render) | `ui/PrintSheetPages.jsx` `PrintInstructions` (lines 205-232) | exact (on screen classes) |
| `ui/Method.jsx` (modify: `showsMethodRegion`, three read-only branches, export `useOnDemandField`) | component | transform | itself | exact |
| `ui/IngredientTable.jsx` (modify: lines, heads, chooser, row acts, "Not in a step yet") | component | CRUD | itself (`groupPortionsByStep` line 36, `showStepHeads` line 597, `renderCreatingEntry`) | exact |
| `ui/RecipeSheet.jsx` (modify: heading rows) | component | transform | itself (line 91-92) | exact |
| `ui/useKeptDraft.js` (modify: `creationKind`, restore guard, `endDraft`, `cleanPayload`) | hook | event-driven | itself (`useDraftWriter` lines 28-85, restore lines 168-192) | exact |
| `ui/notebookPaths.js` (modify: `editPath`) | utility | transform | itself (`notebookPath`, `printPath`) | exact |
| `router.jsx` (modify: edit route, `saved` notice) | config | request-response | itself (`RecipePageForRoute` lines 37-92; route table) | exact |
| `ui/VersionRow.jsx` (modify: Edit / Resume editing; hide Next version) | component | request-response | itself (acts block ~line 423) | exact |
| `ui/BatchRow.jsx`, `ui/RecipeList.jsx`, `ui/useRouteIntents.js`, `ui/RecipePage.jsx` (modify: D-04 / D-24 openers) | component | request-response | themselves (grep sites in RESEARCH G-8) | exact |
| `ui/NotebookPlace.jsx` (modify: Resume editing on recipe row, orphan cleanup) | component | CRUD | itself (`NotebookDraftRow` lines 252-263, `draftMatchesCreate` filter lines 57, 114) | exact |
| `ui/Shell.jsx` (modify: import guard for edit) | component | event-driven | itself (`draftMatchesCreate` at lines 8, 272, 472; `creationStateFromRoute` line 44) | exact |
| `ui/PrintSheetPages.jsx` (modify: "Not in a step yet") | component | transform | itself (lines 52, 62) | exact |
| `styles/notebook.css`, `styles/app.css` (modify) | config (CSS) | none | existing `mk-*` rules under `.notebook`; `.method-step__*` rules in `app.css` | exact |
| `.planning/phases/11-.../11-walk.mjs`, `11-walk-check.sh`, `11-walk-record-base.sh`, `11-walk-before.json` NEW | test harness | batch | `.planning/phases/10-the-creation-editor-without-save/10-walk.mjs`, `10-walk-check.sh`, `10-walk-record-base.sh` | exact |
| `.planning/phases/11-.../11-board-check.mjs`, `11-board-{steps,structure,save,first-version,reading}.mjs` NEW | test harness | batch | `10-board-check.mjs` + `10-board-editor.mjs` | exact |
| Tests: `ui/CreationStructure.test.jsx` NEW, `ui/CreationFlow.test.jsx`, `ui/NotebookPlace.test.jsx`, `ui/Method.test.jsx`, `ui/RecipePage.shell.test.js`, `domain/*.test.js` | test | - | the neighbour test of each module | exact |
| Add to step chooser (inside `IngredientTable.jsx`) | component | event-driven | none whole; `ui/IngredientPicker.jsx` open/Cancel shape (partial) | partial |
| Focus-after-move / remove effect + polite announcement | hook/effect | event-driven | `CreationPage.jsx` `focusRequestRef` effect (partial) | partial |

## Pattern Assignments

### `domain/creationSteps.js` (pure utility, transform)

**Analogs:** `domain/creation.js` (functional ops returning a new draft, throw on caller bugs), `domain/penDraft.js` lines 327-347 (step field and target ops), `domain/stepKeys.js` lines 24-36 (`nextStepKey` counts tombstones).

Header convention (copy from `domain/newRecipe.js` lines 1-15): "Pure. No framework, DOM, or store import." Imports are relative `./x.js` only, so the domain suite stays provable under the `node` environment.

**Row op shape** (`domain/creation.js` lines 134-143, 164-167): validate, throw a typed error on a caller bug, return `{ ...draft, rows: ... }`.
```js
export function addRow(draft, { rowId, libraryId }) {
  if (typeof rowId !== 'string' || rowId === '') throw new TypeError('row id must be a non-empty string');
  ...
  if (draft.rows.some((row) => row.id === rowId)) throw new RangeError(`row ${rowId} is already on the draft`);
  return { ...draft, rows: [...draft.rows, { id: rowId, libraryId, portions: [{ step: 1, grams: '' }] }] };
}
function assertRowId(draft, rowId) {
  if (!draft.rows.some((row) => row.id === rowId)) throw new RangeError(`no row ${rowId} on the draft`);
}
export function removeRow(draft, rowId) {
  assertRowId(draft, rowId);
  return { ...draft, rows: draft.rows.filter((row) => row.id !== rowId) };
}
```
`removeRow` here must also prune the id from every step's `uses` (G-2, STRUCT-01); change it in `creation.js` and keep the throw.

**Step field and target ops** (`domain/penDraft.js` lines 327-347): mirror these (do NOT call `togglePenStepUses`, which also moves portions, G-2). Target edit by index, not by label:
```js
export function setPenStepField(draft, stepN, field, value) {
  return { ...draft, method: draft.method.map((step) => (step.n === stepN ? { ...step, [field]: value } : step)) };
}
export function setPenStepTarget(draft, stepN, targetIndex, field, value) {
  return {
    ...draft,
    method: draft.method.map((step) => {
      if (step.n !== stepN) return step;
      const targets = step.targets.map((target, index) => (index === targetIndex ? { ...target, [field]: value } : target));
      return { ...step, targets };
    }),
  };
}
```

**Step key** (`domain/stepKeys.js` lines 24-36): `addStep` uses `nextStepKey(draft.method)` over the whole array, tombstones included; `removeStep` blanks the step to `{n, leadIn:'', instruction:'', uses:[], targets:[], removed:true}` (G-3) and folds grams per RESEARCH Pattern 1 (lines 324-355). Moves splice the array only and never touch `n` or `id` (STRUCT-03). `UNPLACED_STEP = 0` exported here (G-2). Add `checkAllocation(draft)` and call it in every op's test plus a random-op-sequence test.

**Test analog:** `domain/creation.test.js` (neighbour) and `domain/stepKeys.test.js`; STRUCT-03 is a property test (stored `n` and row `id` unchanged after any Move).

---

### `domain/creation.js` (modify `creationSheetVersion`)

**Analog:** itself, lines 65-91. Today it takes `row.portions[0]` only and returns `method: []`:
```js
const portion = row.portions[0];
rows.push(rowFromLibraryRecord(record, { id: row.id, grams: portion ? finiteGrams(portion.grams) : 0, step: portion ? portion.step : 1 }));
...
method: [],
```
Change: build one `rowFromLibraryRecord` entry carrying all portions (one per live step in `uses`, `UNPLACED_STEP` for an unplaced row), `method` = live steps only (tombstones dropped). Keep the `if (!record) continue;` drop for the live Sheet only; Save must not drop silently (G-6, `creationSaveBlock` refuses). Keep the 'finiteGrams' read-as-0 rule for the live Sheet (the Save gate, not this projection, refuses blank grams).

---

### `domain/newRecipe.js` (modify `createRecipe`)

**Analog:** itself, lines 36-88. Extend the second-argument-free three-field call with optional `method`, `authored`, `scales`, `problems`, `targets`, `iceEd`, `serveTempC`, `description`; keep the `TypeError` throws on caller bugs (project memory: throw for caller bugs, messages for maker input) and the caller-supplies-ids-and-clock rule (lines 36-41). Shape to extend:
```js
const version = {
  schemaVersion: VERSION_SCHEMA_VERSION, id: versionId, recipeId, parentVersionId: null, ...
  rows: structuredClone(rows), declaredAxes: [], declaredFlaws: [], serveTempC: null,
  method: [], authored: { beforeYouStart: [] }, sheetCode: codeFromVersionId(versionId),
};
```
Defaults must leave the existing three-field output unchanged (newRecipe.test.js pins it). Save-over (D-03) keeps `id`, `sheetCode`, `createdAt`; build it in `creationSave.js` (`applyEditToVersion`), not here.

---

### `domain/creationSave.js` (gate + builder + edit helpers)

**Analogs:** `domain/penDraft.js` `penSaveBlock` (line 252) and `domain/lineage.js` `blockedSaveMessage` / `gramsDraftMessage` / `parseGramsDraft` for sentences; `domain/recipe.js` `recipeNameMessage` ("Enter a recipe name."). RESEARCH "Code Examples: Save gate" (lines 454-477) is the shape: an ordered list of `{ id, message, target }` covering every refusal at once, in page order. Rules the gate must mirror from `store/transfer.js` (G-6): steps carry `removed:false` and `uses`, no half-empty target, notes `{text, inheritedFrom: null}` with empty notes dropped, unique problems (D-25), `serveTempC` number or null, `iceEd.style` a style name. `buildCreation(draft, library, styles, ids, now)` returns `{recipe, version}` and runs `createRecipe` for the identity fields. Test with `validateStoreFile` as `store/creation-roundtrip.test.js` does.

---

### `domain/draft.js` (modify: kind `'edit'`, `draftMatchesEdit`)

**Analog:** itself. `KINDS` at line 53 (`const KINDS = ['plan', 'record', 'amend', 'create'];`), the create fit check, and line 309 (`if (record.kind === 'create') return false;` in `draftMatchesVersion`). Add `'edit'` to `KINDS`, add `draftMatchesEdit(record)` that runs the same payload check and requires `record.kind === 'edit'`. Leave `CREATE_DRAFT_KEYS` and `draftMatchesCreate` untouched (they already ignore other kinds). `draftMatchesVersion` must return false for `'edit'` as it does for `'create'`.

---

### `store/repository.js` (modify: `createRecipeWithVersion`, `saveFirstVersionOver`)

**Analog:** `importAll` (lines 240-285) and `putVersionChecked` (lines 9-27). Copy the whole skeleton: one `db.transaction([...], 'readwrite')`, `const done = tx.done`, a `queued` list, pure `sheetCodeProblems` check inside the transaction, hand abort in the catch, and quiet the queued rejections.
```js
const tx = db.transaction(FILE_STORES, 'readwrite');
const done = tx.done;
const queued = [];
try {
  const [storedVersions, ...] = await Promise.all([tx.objectStore('versions').getAll(), ...]);
  const codeProblems = sheetCodeProblems(storedVersions, versions);
  if (codeProblems.length > 0) throw new SheetCodeError(codeProblems);
  for (const name of FILE_STORES) for (const row of incoming[name]) queued.push(tx.objectStore(name).put(row));
  await Promise.all([...queued, done]);
} catch (error) {
  try { tx.abort(); } catch { /* The transaction already finished or aborted itself. */ }
  for (const request of [...queued, done]) request.catch(() => {});
  throw error;
}
```
Stores for `createRecipeWithVersion`: `['recipes','versions','drafts']`, plus `queued.push(tx.objectStore('drafts').delete(version.id))`. `saveFirstVersionOver` adds `'batches'` and reads the `by-version` index (db.js:52) for the D-06 check; a business refusal (`has-batch`, `has-child`, `gone`) aborts and RESOLVES `{ saved:false, reason }`. Use the existing object-method style in the `createRepository` object (e.g. `async saveVersion(version)` at line 98). RESEARCH Pattern 2 (lines 357-381) is the worked version.

**Test analog:** `store/repository.test.js` lines 139-153 (the rollback test; unclonable `notClonable: () => {}` makes the put throw `DataCloneError` after earlier puts queued, then `expect(await everything(repository)).toEqual(before)`). Add the Save equivalents: forced failure leaves no recipe, no version, draft kept; a colliding code throws `SheetCodeError`; Save-over after a batch resolves `{saved:false,reason:'has-batch'}`. Fixture for collisions at `repository.test.js:362`.

---

### `ui/EditRoute.jsx` (route wrapper, request-response)

**Analog:** `ui/CreationRoute.jsx` (lines 1-55; component-effect read, `useNavigate`, `{ replace: true }`, mounts the page keyed by the record) and `ui/NotebookRedirects.jsx` lines 42-58 (`cancelled` flag, `RecipeNotFound`).
```jsx
export function NotebookLatestRedirect() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    let cancelled = false;
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
Adapt: read recipe, version, versions, the version's batches and `getDraft(versionId)` once; redirect to `notebookPath(recipeId, versionId)` when `!isEditableFirstVersion(...)` or when the kept draft is not kind `'edit'` (G-1d); quietly delete an orphaned edit draft on redirect (G-12); seed = the kept edit draft's payload, else `draftFromVersion(version, recipe)`; mount `<CreationPage key={versionId} mode="edit" ... />`. Hooks above every early return. Note the `cancelled` pin applies only to `useKeptDraft.js` (RecipePage.shell.test.js), so it is allowed here. Route entry in `router.jsx` goes beside the page and print routes (`router.jsx:123-130`); `router.jsx` may not gain `<Link`, nor put `className="page-status-anchor"`, `<PageStatus` or `<RecipePage` earlier in its text (RecipePage.test.jsx:926-954).

---

### `ui/CreationPage.jsx` (modify)

**Analog:** itself. Focus-request effect (lines 140-153) is the pattern for D-14 to D-17 focus after add/remove/move (G-13): a ref set by the handler, acted on after the render that drew the target.
```jsx
focusRequestRef.current = null;
let target;
if (request === 'new-note') {
  target = page.querySelector(`textarea[aria-label="beforeYouStart note ${createDraft.beforeYouStart.length}"]`);
} else if (request === 'add-note') {
  target = page.querySelector('.before-region .mk-add');
} else {
  target = page.querySelector('.ingredient-table-region .mk-add') ?? page.querySelector('.ingredient-table-region .pick__head button');
}
target?.focus();
```
Selectors `.mk-add` become `.mk-head-act` when Add note and Add ingredient move to the heading rows (G-11); `beforeFoot` and `<p className="mk-add-row">` (lines 319-335, `Button className="text-control mk-add"`) are removed. Target the controls by their own `aria-label` ("Step 2, move down", "Whole milk, move up"). Save uses a lock ref and `disabled={saving}` (RESEARCH Pitfall 3), calls `writer.endDraft()` before `navigate(..., { replace: true, state: { focusVersion: true, saved } })` (G-10, Pattern 5).

---

### `ui/CreationSteps.jsx` (NEW) and `ui/StepReading.jsx` (NEW)

**Analog for `StepReading.jsx`:** `ui/PrintSheetPages.jsx` lines 205-232 (the grammar the screen adopts), on the screen classes `method-step__*`:
```jsx
<li key={step.n} className="mp-step">
  <span className="mp-n">{displayNumberOf(numbers, step.n)}</span>
  <div className="mp-body">
    <p className="mp-lead"><b>{step.leadIn}.</b> {step.instruction}</p>
    {step.targets?.length > 0 && (
      <p className="mp-tags">
        {step.targets.map((target, index) => (
          <span className="mp-tag" key={index}>
            <span className="mp-tag__label">{target.label}</span>
            <span className="mp-tag__value">{target.value}</span>
          </span>))}
      </p>)}
    {step.purpose && (<p className="mp-why"><span className="mp-why__label">why</span> — {step.purpose}</p>)}
    {step.aside && <p className="mp-aside">{step.aside}</p>}
  </div>
</li>
```
Screen markup per RESEARCH "Reading step, one component" (lines 491-505): `method-step__targets--tags` modifier (not `:not(.mk-step)`, G-11), `target-chip__label` / `target-chip__value` classes kept, purpose with `<span className="method-step__purpose-label">why</span> — `. Render targets from `stepDiff.targets` in Show changes (G-9, D-26).

**Analog for `CreationSteps.jsx`:** `ui/Method.jsx` `StepPenBody` (open-step markup: `input.prose-field.prose-field--lead-in`, `textarea.prose-field`, chips of two `input.ink-field`, `fieldset.method-step__uses`) and `useOnDemandField` (Method.jsx line 51; export it, do not copy, RESEARCH Pitfall 7):
```jsx
function useOnDemandField(initialOpen, onCollapse) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const fieldRef = useRef(null);
  const openedByUser = useRef(false);
  function openField() { openedByUser.current = true; setIsOpen(true); }
  useEffect(() => { if (isOpen && openedByUser.current) fieldRef.current?.focus(); }, [isOpen]);
```
Required line under empty fields: `ui/CreationSetup.jsx` line 47, `<FieldFeedback required={isBlank(value)} />` (import at line 5); a refused Save swaps in the error text through `FieldFeedback`'s `error` prop (Pitfall 2). Every button through `ui/Button.jsx`, `Checkbox.jsx`; open step has no box in creation (013 decision 32).

---

### `ui/Method.jsx` (modify)

**Analog:** itself. `showsMethodRegion({ mode, steps })` (line ~519-521, `return mode === 'developing' || steps.length > 0;`): add `|| mode === 'creating'` inside the function (G-11; `RecipePage.test.jsx:1167` pins the call expression, so do not change the call site). Three read-only branches (pen closed, Show changes, reading) all move to `StepReading`; `Method.test.jsx:734-735` pin `'<p class="method-step__purpose">Original purpose.</p>'` changes with the "why" label span, name it in the plan.

---

### `ui/IngredientTable.jsx` (modify)

**Analog:** itself. Keep `groupPortionsByStep(rows, steps, stepNumberMap, keepOutLines)` (line 36) unchanged: a portion with step `0` (`UNPLACED_STEP`) does not resolve and joins the trailing unallocated group. Edits:
- Rename the three "Unallocated" sites: line 850 (`lineName` ... `'Unallocated'`), line 930 (head), plus `PrintSheetPages.jsx:62`, and comments at lines 26-27 and 406-408 stay prose. Also `IngredientTable.test.jsx`.
- `showStepHeads` (line 597): `const showStepHeads = !(groups.length === 1 && groups[0].kind === 'unallocated');` becomes true when `isCreating` and at least one live step exists.
- `renderCreatingEntry` keys raw grams, the focus registry and the unreadable set by `${row.id}:${portionIndex}` for split rows; label multi-line fields `${name}, grams, portion n` as `GramsCell` does; add `formatPortionLine` for multi-line rows.
- Row acts (`remove · Move up · Move down · Add to step`) use `Button` with `.mk-off` + `aria-disabled="true"` for off Move buttons, kept in tab order and doing nothing on press (D-16).

---

### `ui/RecipeSheet.jsx` (modify heading rows)

**Analog:** itself, lines 91-92:
```jsx
const beforeRegionShown = mode === 'developing' || mode === 'creating' || beforeNotes.length > 0;
```
Replace the bare `<h2 className="region-name">` in Before you start, `IngredientsHead` and the Instructions heading with `div.mk-head-row` holding `h2.region-name` and a `Button className="text-control mk-head-act"`. Keep the one `<IngredientsHead` tag carrying `onToggleShowChanges={onToggleShowChanges}` (RecipeSheet.test.jsx:103-112); add an `addAct` prop.

---

### `ui/useKeptDraft.js` (modify)

**Analog:** itself.
- Restore guard (lines 168-192): the line to extend is
  `if (!(creating ? draftMatchesCreate(record) : draftMatchesVersion(record, version, batches, catalog))) { Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {}); ...`
  Before that test, when `!creating` and `record.kind === 'edit'`, `setDraftRestoreDone(true); return;` without setting `draftStoredRef` (G-1b). Add a hook parameter `creationKind = 'create'`, replace the `kind: 'create'` literal in persist, and keep `draftMatchesCreate(record)` / `repository.deleteDraft(versionId)` marker counts per the pin list in RESEARCH (RecipePage.shell.test.js:258-293).
- `endDraft()` (G-10) added to `useDraftWriter` (lines 28-85) beside `discardDraft`; mirrors `discardDraft({ final: true })`: clear the timer, null `pendingDraftRef`, set `endedRef.current = true`, but do not delete:
```js
function discardDraft({ final = false } = {}) {
  const held = pendingDraftRef.current;
  if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
  draftTimerRef.current = null;
  pendingDraftRef.current = null;
  draftStoredRef.current = false;
  if (final) endedRef.current = true;
  ...
```
`function flushPendingDraft(` and `function discardDraft(` stay at count 1 each; add `function endDraft(`. Optional `cleanPayload` deep-equality skips the write while untouched (D-23).

---

### `ui/VersionRow.jsx`, `ui/NotebookPlace.jsx`, `ui/Shell.jsx` (modify)

- **VersionRow.jsx:** the acts block (`openPen === null && (<div className="notebook-version__acts">` ~line 423). Add Edit as an underlined `Button className="notebook-link"` (not a bare link: `tabindex-scan.test.js`) after the filled Next version when `isEditableFirstVersion`; with a kept edit, Resume editing replaces Edit and Next version / Record a batch are not drawn (D-04). The existing `className={below724 ? 'notebook-link' : 'notebook-action'}` shows the underlined/filled pair.
- **NotebookPlace.jsx:** `NotebookDraftRow` (lines 252-263) is the Resume button shape; the filters at lines 57 and 114 (`drafts.filter(draftMatchesCreate)`) stay create-only (an edit draft must not match, D-02). Add Resume editing on the recipe's own row, navigating to `editPath`; delete orphaned edit drafts quietly on load (G-12). Pins `NotebookPlace.test.jsx:96,110` stay true.
- **Shell.jsx:** `draftMatchesCreate` at lines 8, 272, 472 and `creationStateFromRoute` (line 44): extend to "create or edit"; refusal for an edit names the recipe from the draft payload `name` rendered as text; keep `chooseImportFile` synchronous (line 428) with a ref beside `creationStateRef`.

---

### `router.jsx` and `ui/notebookPaths.js` (modify)

**Analog:** themselves. `RecipePageForRoute` (router.jsx lines 37-92) owns `announcePageStatus` and `.page-status-anchor`:
```jsx
const announcePageStatus = useCallback((message, { persist = false } = {}) => {
  if (pageStatusTimerRef.current) clearTimeout(pageStatusTimerRef.current);
  setPageStatus(message);
  if (message && !persist) {
    pageStatusTimerRef.current = setTimeout(() => { setPageStatus((current) => (current === message ? '' : current)); }, ...);
```
Read `location.state?.saved` once ('created' -> "Recipe saved.", 'edited' -> "Changes saved."), constants only, then replace state with `{ focusVersion: true }` (the page reads `focusVersion` at first render, RecipePage.jsx:81). Keep `/<RecipePage\s+key=/` and the anchor-before-page order (RecipePage.test.jsx:945). `editPath(recipeId, versionId)` is built on `notebookPath` with `encodeURIComponent` per segment; add cases to `notebookPaths.test.js`.

---

### `ui/PrintSheetPages.jsx` (modify)

**Analog:** itself. Line 62: `label: group.kind === 'unallocated' ? 'Unallocated' : group.kind === 'removed' ? 'Removed' : \`Step ${group.displayNumber}\``. Change the word to "Not in a step yet" (D-12); line 52 comment. Empty-section omission already exists in `wholePlan` (`before: blocks.notes.length > 0`, `instructions: blocks.steps.length > 0 ? {...} : null`); build only a test over `sheetBlocks` / `SheetPage` and one WebKit print check (D-27). Test analogs: `ui/PrintSheetPages.test.jsx`, `ui/PrintSheet.test.jsx`, `store/sheet-code-import.test.js`.

---

### CSS: `styles/notebook.css`, `styles/app.css`

**Analog:** existing rules in each file. New `mk-*` editor rules go under `.notebook` with no new `@media` condition (`notebook.test.js:37-53`; use `723.98px` or `(pointer: coarse)`); `.mk-off` needs `text-decoration: none` and a secondary colour (read `cross-cutting.test.js:101-137` and `binder.test.js:308-315` first). Keep the base rule `.method-step__purpose, .method-step__aside` (`font-style: italic`, `font-family: var(--face-text)`, pinned `cross-cutting.test.js:769`) and override with a more specific selector. Add nothing to the `(pointer: coarse)` block selector list. Every value reads a token; the boards add none.

---

### Harness: `11-walk.mjs`, `11-walk-check.sh`, `11-walk-record-base.sh`

**Analog:** `.planning/phases/10-the-creation-editor-without-save/10-walk.mjs`, `10-walk-check.sh`, `10-walk-record-base.sh` (copy and extend).
- `snapshot()` (10-walk.mjs ~line 178-182) hashes `.notebook` innerText: `text: document.querySelector('.notebook')?.innerText ?? ''` and `textHash: createHash('sha256').update(text).digest('hex')`. Split into `textHash` (without `.method-region`) and `methodHash` (G-4).
- `compareResult(a, b)` (line 883) and `diffLeaves` (line 862) print `DIFF scenario / step / path: before=.. after=..`; add `ALLOWED_NEW_SCENARIOS` so a scenario present only after is allowed and everything else stays strict. `selftest` (line 1007) loops `DOCTORINGS`; add doctorings (changed `methodHash`, a removed step, a changed leaf in an existing scenario must still be refused). `const SCENARIOS = [];` at line 312 is where scenarios are registered.
- `10-walk-check.sh`: build to `"${TMPDIR:-/tmp}/sprinkles-10/walk-$(basename "$(pwd)")/dist"` never `app/dist`, then `PROBE_DIST=... node walk.mjs record` and `compare`. Copy with `PHASE=.planning/phases/11-steps-structure-save-and-print`, scratch `sprinkles-11`, baseline `11-walk-before.json`.
- `10-walk-record-base.sh`: `BASE=...` newest commit touching `app/` before the first Phase 11 plan (RESEARCH says `cf64aa70`; re-run `git log --format='%h %s' -3 -- app/` at plan time), stranger-commit regex `grep -Eiv '^[0-9a-f]+ [a-z]+\(11(-[0-9]+)?\):|merge executor worktree'`, records from a temporary git worktree at BASE.

### Harness: `11-board-check.mjs` and `11-board-*.mjs`

**Analog:** `.planning/phases/10-the-creation-editor-without-save/10-board-check.mjs` (engine; compares a built route to a sketch panel at 1366 and coarse pointer, tolerance 1 px) and `10-board-editor.mjs` (a module: header comment with the build-and-run command, a `const EDITOR = '.planning/sketches/...html'` constant and `const READY = '.notebook.mk-page'`). Copy per surface: `11-board-steps.mjs` (pA1-pE1), `11-board-structure.mjs` (qA1-qE1), `11-board-save.mjs` (vA1-vC1), `11-board-first-version.mjs` (fA1-fC1), `11-board-reading.mjs`. Add the `seed` option for recipes, versions and an `edit`-kind draft. Run each module with `--selftest` once. Header run command shape:
```
S="${TMPDIR:-/tmp}/sprinkles-11"
npm --prefix app run build -- --outDir "$S/dist-05" --emptyOutDir
PROBE_DIST="$S/dist-05" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs .planning/phases/11-steps-structure-save-and-print/11-board-steps.mjs
```

## Shared Patterns

### One transaction, hand abort
**Source:** `store/repository.js` `importAll` lines 240-285 (above). **Apply to:** `createRecipeWithVersion`, `saveFirstVersionOver`. Business refusals resolve a value; storage and code collisions throw.

### Pure domain, caller supplies ids and clock
**Source:** `domain/newRecipe.js` lines 1-15 and 36-41. **Apply to:** `creationSteps.js`, `creationSave.js`. No React, DOM, `idb` or clock/random read; throw `TypeError`/`RangeError` on caller bugs, return messages for maker input.

### Functional draft updates, new object per change
**Source:** `domain/creation.js` ops; `useKeptDraft` header (lines ~100-107): "a new object on every change and the same object across renders when nothing changed". **Apply to:** every UI handler, via `setCreateDraft((prev) => op(prev, ...))`.

### Hook order and StrictMode restore
**Source:** `ui/CreationRoute.jsx`, `useKeptDraft.js` `draftRestoreStartedRef` guard (lines 168-170). **Apply to:** `EditRoute.jsx`, `CreationPage.jsx` (every hook above early returns).

### Field feedback: Required quiet guidance, error text on a refused press
**Source:** `ui/FieldFeedback.jsx`, used at `ui/CreationSetup.jsx:47` (`<FieldFeedback required={isBlank(value)} />`). **Apply to:** step lead-in / instruction, target sides, name, version name. Move focus to the first refused field in page order; set `aria-invalid`.

### Shared controls and tokens
**Source:** `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` (enforced by `ui/tabindex-scan.test.js`); tokens in `styles/tokens.css`. **Apply to:** every new button/checkbox/radio and every new CSS value.

### Unsafe keys
**Source:** `RESERVED_ROW_IDS` in `domain/versionRow.js`, `carriesUnsafeKey` in `domain/draft.js`; use `Map`s or array scans for stored ids. **Apply to:** `creationSteps.js` row-id lookups.

### Source-text pins
**Source:** `ui/RecipePage.shell.test.js:245, 258-293` (useDraftWriter / useKeptDraft markers), `RecipePage.test.jsx:926-993, 1167-1192`, `RecipeSheet.test.jsx:103-112`, `Method.test.jsx:734-735, 1486-1510`, `cross-cutting.test.js:96-137, 769`, `notebook.test.js:37-53`. **Apply to:** each plan names the pins it changes (RESEARCH "Source-text and CSS pins" table).

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Add to step chooser (in `IngredientTable.jsx`) | component | event-driven | No existing in-row chooser with Cancel-first focus, Escape and one-open-at-a-time. Partial: `ui/IngredientPicker.jsx` Cancel head and the `CreationPage` focus effect. Use CONTEXT D-17 and `CONTRACT.md` section 3. |
| Move up / Move down with focus retention and position announcement | effect | event-driven | No existing reorder control or polite live announcement for reorder. Partial: the `focusRequestRef` effect. Use D-14 to D-16 and RESEARCH G-13 / "Focus request after a move" (lines 481-489). |
| Edit-draft quiet orphan cleanup | store read | batch | No existing cleanup of a draft whose version has a batch or child; use `useKeptDraft`'s "no longer fits" delete as the shape (G-12). |

## Metadata

**Analog search scope:** `app/src/domain`, `app/src/store`, `app/src/ui`, `app/src/router.jsx`, `.planning/phases/10-the-creation-editor-without-save/` harnesses, `.planning/phases/09-*/` and `10-*/` PATTERNS.md.
**Files scanned:** about 30 (targeted greps and ranges; large files read by range only).
**Pattern extraction date:** 2026-10-26
