# Architecture Research: v2.0 Recipe creation

**Domain:** Local-first recipe app (React 19 + Vite + JSX, react-router 8, idb over IndexedDB, Vitest). Subsequent milestone on an existing codebase.
**Researched:** 2026-10-15
**Confidence:** HIGH on integration points, seams and store mechanics (read from the code). MEDIUM on the creation-editor shape (it depends on a surface Mark and Impeccable have not drawn). MEDIUM on the library dataset mapping (the converter rules are inferred from one candidate file and 26 app entries).

Scope: only what the seven v2.0 features need. Libraries are not re-researched. Every claim below was read in `app/src/`; file and line references are to the tree at commit `ad87a67`.

## Headline findings

1. **The pen's whole visual grammar is "baseline vs draft".** `IngredientTable`, `Method`, `Headnote` and `VersionRow` only draw edits (struck old value beside new) when `mode === 'developing'` and a baseline exists. A creation editor cannot be "the pen over an empty version": it would strike a placeholder `0 g` beside every amount. It needs a fourth state (`'creating'`) in which the same components render the draft with **no baseline**. About 8 `'developing'` checks in the children need a one-line change; this is the real cost of "share one editor", more than the page split itself.
2. **The pen cannot add or remove anything today.** `penDraft.rows` is a map keyed by existing row ids with a fixed `portions` length, and `penDraft.method` is a clone of the version's steps. Adding, removing and reordering rows and steps are new pure operations. At creation they are **hard deletes**, not `removed` flags, which means they must prune the references the flag model leaves alone (step `uses` lists naming a deleted row, portion `step` keys naming a deleted step).
3. **Seeding more library entries never reaches an existing profile.** `store/seed.js` calls `seedLibraryIfEmpty`, which writes only into an empty library (Phase 6 D-05, "never topped up"). Mark's browsers hold the 26-entry library. Reaching them needs a `DB_VERSION` bump that clears the library store (library-only, no user data lost) or a deliberate top-up.
4. **The candidate seed database double counts lactose if imported as-is.** It states `pac_includes_lactose: true` (whole milk `pac: 4.6`). `domain/composition.js` `computeBalance` already adds lactose PAC and POD from `msnf` (lactose is 54.5% of MSNF). A verbatim import would inflate PAC on every dairy row. The converter must zero `pac`/`pod` on dairy rows (and drop lactose from `sugar`); the engine must not change, because stored versions embed coefficients and their figures must not move.
5. **SEED-261001-iq4 is smaller than it reads.** Its "bug today" is already fixed (`BatchRow.jsx` hides "This recipe only" when nothing is declared, `AxesGrid` line 189). Declared **problems are already free-text words** (`declaredFlaws`, 0 to 2, validated as non-empty unique strings; Bitter is just olive oil's value). Only **scales** are catalog-bound: `declaredAxes` is a list of names resolved against the fixed `AXES` table in `domain/axes.js`. Custom scales are a data-shape change; custom problems are only an authoring control. The seed's breadcrumbs (`bitterDeclared`, `onToggleBitter`) are stale.
6. **Resets are free only until creation ships.** The milestone keeps "database reset on a version bump" until a recipe can be created from scratch. So every shape-changing store decision must land before the creation UI is usable, in one bump. After v2.0 the next shape change needs a lift.

## System overview (target, v2.0)

```
 ROUTES (router.jsx)
 /                  RecipeList (Home)                 unchanged
 /notebook          NotebookPlace   NEW  (list + "New recipe" + kept create-draft)
 /notebook/new      RecipeCreatePage NEW  (static segment outranks /notebook/:recipeId)
 /notebook/:r/:v[/batch/:b]  RecipePageForRoute -> RecipePage (shrinks to a shell)
 /ingredients       IngredientsPlace NEW  (read-only)
┌──────────────────────────────────────────────────────────────────────────────┐
│ UI  app/src/ui                                                                │
│  RecipePage (shell)         RecipeCreatePage (shell)       NotebookPlace      │
│    │  hooks: useRecipeData,     │  hooks: useRecipeCreation,   IngredientsPlace│
│    │  useKeptDraft, useAnnouncer│  useLibrary, useAnnouncer,        │          │
│    │  useVersionPen, useBatch-  │  useKeptDraft('create')           │          │
│    │  Recording, useRouteIntents│                                    │          │
│    └────────────┬───────────────┴──────────────┐                    │          │
│                 ▼                              ▼                    ▼          │
│        RecipeSheet (EXTRACTED article: Headnote, Before you start,             │
│        IngredientTable, Method, Balance fold, advisories)                      │
│        mode: reading | recording | developing | creating                      │
│        + create-only: IngredientPicker, row/step structure controls,         │
│          ScalesAndProblems, TargetsEquipmentProcess                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ DOMAIN  app/src/domain  (framework-free, node-testable)                       │
│  creationDraft.js NEW (structure ops, save block, fields)                     │
│  newRecipe.js MOD (createRecipe takes the authored sections)                  │
│  penDraft.js, draft.js, axes.js, lineage.js MOD (small)                       │
│  versionRow.js, stepKeys.js, composition.js, figures.js  unchanged            │
├──────────────────────────────────────────────────────────────────────────────┤
│ STORE  repository.js (sole idb path) -> db.js                                 │
│  + createRecipeWithVersion (one tx over recipes+versions)                     │
│  db.js DB_VERSION 9 -> 10 (clear library store only)                          │
│  seed.js (same logic, larger data/library merge)                              │
│  transfer.js MOD (declaredAxes accepts the object shape)                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

## What RecipePage is today (the separate jobs, from reading the 1,837 lines)

The file holds one component, `RecipePage`, plus `joinNames`, `PageLoadFailed`, `RecipeNotFound`, 12 exported status strings. `RecipePage.shell.test.js` pins that module shape (see Pitfall 1). The jobs, with line ranges:

| # | Job | Lines | What it owns | Creation needs it? |
|---|-----|-------|--------------|--------------------|
| J1 | Route identity and signals | 143-165 | `useParams`, `useSearchParams` (`?changes`), `location.state` flags `focusVersion`, `focusBatch`, `startTasting`, `startNextVersion` | No (own route; reuses the post-save `focusVersion` landing) |
| J2 | Record loading | 166-182, 262-443 | Eight read effects: version, batches, drafts, versions, recipe, citedBatch, parentVersion, allBatches; `loadFailed`; tab title; not-found guards (725-746) | No (nothing loaded). Library load is new and separate |
| J3 | Kept-draft persistence | 445-614 | Restore-once effect, 250 ms debounced persist, `flushPendingDraft`/`discardDraft`, pagehide and visibility flush, refs `draftStoredRef`, `pendingDraftRef`, `draftTimerRef` | **Yes, a variant** (a create draft has no version to read; see Draft persistence) |
| J4 | Route-state openers | 616-659 | Consume-once effects that open the record pen (Record a tasting) or the Next version pen (Home action) | No |
| J5 | Pen mode and guards | 192, 661-695, 750 | `mode`, `derivePenState`, Escape-closes-clean-pen, `onPenOpenChange` (Shell Import guard) | **Yes** (a 'create' pen state) |
| J6 | Announcer | 214-247, 886-914 | Three live regions (`formStatus`, `tastingStatus`, `recordStatus`) and their guarded 5 s clears | **Yes** (formStatus only) |
| J7 | Record-pen controller | 197-247, 933-1327 | `useRecordDraft` plus ~16 handlers, attempt counters, batch save lock, `handleSaveBatch`, `handleCancelRecording`; 35-prop hand-off to `BatchRow` | No |
| J8 | Version-pen controller | 253-260, 1334-1552 | `usePenDraft` plus 11 edit handlers, `buildPenFields`, `handleSaveAsNewVersion`, `handleSaveOverVersion`, save lock, `penOpenedAtRef` | **Yes** (the edit handlers are the creation handlers; the save is replaced) |
| J9 | Derived view model | 777-873 | `readingVersion`, `draftVersion`, `liveVersion`, `buildFigures`, focused-figure trace, `changeDiff`, `penDiff`, stale steps, step-number maps, `openBatch`, `comparisonBatch`, `waitingPlanDraft`, region visibility, `sheetClassName` | **Yes** (a no-baseline variant) |
| J10 | Layout | 1579-1836 | Band (RecipeBand, VersionRow, GoToBatch, RecipeHistory), Sheet article (Headnote, Before you start, IngredientTable, Method, Balance fold, DerivedAdvisories, PenFoot), batch aside (BatchRow) | **The Sheet article, yes. The rest, no** |
| J11 | Page-local fold and media state | 710-723 | `useBelowDesktop`, `useBelow724`, `useSheetTwoColumns`, `balanceOpen`, `batchOpen`, `focusedFigureKey` | Balance and width reads, yes |

### Recommended cuts (extraction targets)

Cut along the jobs, in this order. Each cut is internal, so the ten existing `RecipePage.*.test.jsx` files (they mount the page) stay as the no-visible-change net, plus the Phase 5 94-snapshot WebKit walk as the final proof.

| Order | New unit | Absorbs | Why this order |
|-------|----------|---------|----------------|
| 1 | `useAnnouncer()` (hook) | J6 | Smallest, pure state and timers; creation needs it |
| 2 | `useRecipeData(recipeId, versionId, batchId)` (hook; imports `repository`) | J2 | Removes ~180 lines of effects; mechanical. Keeps `loadFailed` semantics (the restore waits on it) |
| 3 | `sheetView.js` (pure function) | J9 | Pure; unit-testable in node; takes `{version, mode, penDraft, parentVersion, showingChanges, ...}` returns the derived object. Takes `baseline = null` so the same function serves creation |
| 4 | `RecipeSheet` (component) | J10 article part, J11 | The shared editor surface. Props in: derived view, mode, handlers, diff props (all nullable). Do **not** include the band or the batch aside |
| 5 | `useVersionPen()` (hook) | J8 | Wraps `usePenDraft` plus the save locks and the two save handlers. Creation does not reuse the saves, but extracting makes the revise/create fork explicit |
| 6 | `useKeptDraft(...)` (hook) | J3 | Highest risk (restore ordering, StrictMode double-run, the amend-redirect that deliberately leaves `draftRestoreDone` unset). Do after the simpler cuts and with its callbacks (`onRestorePlan`, `onRestoreRecord`) passed in |
| 7 | `useRouteIntents(...)` (hook) | J4 | Depends on 5 and 6 |
| 8 | `useBatchRecording()` (hook) | J7 | **Largest and least needed by creation.** Do last, and treat as droppable from the critical path: creation does not touch the batch side |

After the cuts `RecipePage` is: params, `useRecipeData`, the hooks, the guards, `NotebookBand` markup, `<RecipeSheet/>`, `<BatchRow/>`. The existing `RecipePage.shell.test.js` ("declares no module-level function beyond joinNames, PageLoadFailed, RecipeNotFound and RecipePage", "loads its records through the repository seam", "hooks above the early returns, once") must be **rewritten to pin the new shape**, in the same plan as the cut that breaks it. The `hooks stop at the draft (D-07)` test forbids `repository` in `usePenDraft.js` and `useRecordDraft.js`; the new data and kept-draft hooks will import the repository, so keep them in separate files and have the test name which hooks may.

## Sharing the editor without a loaded version

### Recommended: `mode === 'creating'` over a base-plus-pen draft, no baseline

State (new hook `useRecipeCreation`, same discipline as `usePenDraft`: plain `useState`, a single `clearBlock`, stops at the draft, imports only react and the domain):

```
creationDraft = {
  recipeId, versionId,            // minted once, in useState initialiser (not an effect: StrictMode)
  recipe:  { name, description },
  base:    version-shaped structure under construction:
           rows[]   (id, ingredientName, ingredient = structuredClone of library entry at ADD time,
                     portions [{step, grams: 0 placeholder}], removed:false)
           method[] (n, leadIn, instruction, targets, purpose?, aside?, uses, removed:false)
           targets?, equipment?, process?, declaredAxes[], declaredFlaws[]
  pen:     the existing penDraft shape (raw typed grams strings, versionLabel, sheetTitle,
           sheetDescription, authored.beforeYouStart, method clone)  <- all existing pen ops apply unchanged
}
```

- Every existing pure pen op (`setPenGrams`, `setPenStepField`, `setPenStepTarget`, `togglePenStepUses`, `setPenNoteText`, `removePenNote`, `setPenField`) keeps working on `.pen`.
- `penDraftVersion(base, pen)` builds the live version for the table, Balance fold, advisories and `blockedSaveMessage`. Figures answer live as the maker adds rows (`buildFigures` returns `[]` for no rows, `computeBalance` returns null at mass 0, so the empty start is safe).
- New structure ops (pure, in `domain/creationDraft.js`) update `base` and `pen` together in one call so the two cannot disagree: `addRowFromLibrary(record, ids)` (uses `rowFromLibraryRecord`, then seeds `pen.rows[id]` with `grams: ''`), `removeRow`, `moveRow`, `addStep` (uses `nextStepKey`), `removeStep`, `moveStep`, `setPortionStep`, plus scale, problem, target, equipment and process setters.
- **Hard delete with reference pruning.** `removeStep(n)` must also drop `n` from every row's portions' `step` (reassign or leave unallocated; the table already has an "Unallocated" group for a portion whose step does not resolve, `IngredientTable.groupPortionsByStep`) and `removeRow(id)` must drop `id` from every step's `uses`. Without this, a saved version carries dangling references the `removed`-flag model never needed to handle.
- Reorder is array order only. A step's `n` is identity and display numbers derive from position (`stepNumbers.displayNumbers`), so moving a step needs no renumbering. Row order is the group-internal order in the step-grouped table, so "move row" changes position among its fellow entries within each step group; the Impeccable brief must pin that meaning.
- A step key may be reused after a hard delete within the unsaved draft; that is harmless once pruning is in place and the saved first version contains no `removed` steps.

Child components: add a `creating` state next to `developing`. The checks to change (counted): `Authored.jsx` 1, `FormulationNote.jsx` 1, `Headnote.jsx` 2, `IngredientTable.jsx` 2, `Method.jsx` 2, `VersionRow.jsx` 1, `RecipePage.jsx` 17 (the page checks shrink with the cuts). Introduce one tiny helper (`isPenMode(mode)` = developing or creating) and a rule that strike/diff rendering keys off `baselineVersion != null`, not off mode. `Method` already gates its pen path on `baselineVersion != null`; `IngredientTable` does not (its `rows` prop doubles as the baseline, so it needs an explicit "no baseline" branch).

Create-only UI (new components, rendered only when `mode === 'creating'`): `IngredientPicker`, row structure controls (add, remove, move up, move down), step structure controls, `ScalesAndProblems`, `TargetsEquipmentProcess`, a `NewRecipeBand` (name, description; `RecipeBand` is an inline rename with its own save and is the wrong tool), and a slim version-line field (the revise `VersionRow` also carries Why, cited batch, Save over, Save as new, history).

### Alternatives rejected

| Option | Why not |
|--------|---------|
| Fork `RecipePage` into a copy for creation | Duplicates 1,700 lines and every future fix; contradicts the milestone goal |
| Persist an empty "draft version" in the `versions` store and open the pen on it | An abandoned creation leaves a ghost version in Home (`activeWork` reads versions); breaks "a recipe exists only on Save"; rows could not be added anyway |
| `mode='developing'` over a synthetic empty baseline | Every field strikes `0 g` or empty beside the new value and every row reads as added; the diff grammar becomes noise |
| Add structure ops to `penDraft.js` | `penDraft.js` is pinned pure and the whole revise path would gain add/remove it must refuse after v2.0 (structure edits on later versions are out of scope). Keep creation ops in their own module so the revise pen provably cannot restructure |

## Save path

- Extend `createRecipe` (`domain/newRecipe.js`) with **optional** inputs `{ description, sheetDescription, method, authored, declaredAxes, declaredFlaws, targets, equipment, process }`. Keep the three-field call behaving as today (Phase 7 tests pin it). It currently hard-codes `description: ''`, `method: []`, `declaredAxes: []`, and omits `targets`/`equipment`/`process` (the child copy rule `KEYS_COPIED_WHEN_OWNED` in `lineage.js` already copies them only when the parent owns them, so a created root with them flows into later versions with no change).
- Save gate: `creationSaveBlock(draft)` composes what already exists: `recipeNameMessage` (name), `blockedSaveMessage(pen, base, [])` (version line, blank or non-numeric amounts), plus new rules that mirror `store/transfer.js` so a created version can always be exported and re-imported: at least one row (`validateVersion`: non-empty rows), every step has non-empty `leadIn` and `instruction` (`validateStep`), every step has `uses` (array) and `removed` (boolean), `targets` pairs non-empty, at most 2 scales and 2 problems, unique.
- **Add `repository.createRecipeWithVersion({ recipe, version })`**: one readwrite transaction over `['recipes','versions']`, written like `importAll` (abort by hand on a failed put). Two separate `saveRecipe` then `saveVersion` calls can leave a recipe with no version after a failure; one transaction cannot. The seed's "versions written last" trick is not needed once it is atomic.
- After the write: `navigate(notebookPath(recipe.id, version.id), { replace: true, state: { focusVersion: true } })`. `RecipePageForRoute` keys the page by route, so the new page mounts fresh. `Home` and `activeWork` pick the recipe up from the stores with no change.
- Ids and clock stay in the one save handler (`freshId()`, `new Date().toISOString()`), as `handleSaveAsNewVersion` does; `createRecipe` stays deterministic.

## Draft persistence for a create

The `drafts` store is keyed by `versionId`, and `draftMatchesVersion(record, version, batches)` needs a version to compare against. A recipe that exists nowhere until Save has neither. Options:

1. **Recommended: pre-mint `versionId` (and `recipeId`) when the maker presses New recipe, use `versionId` as the draft key, add `kind: 'create'` to `draft.js` with its own shape check that takes no version.** No `DB_VERSION` bump (same key path; drafts are device-only and never exported). Consumers that call `draftMatchesVersion` after `versions.find(...)` (`RecipeList.jsx` lines 94-101, `RecipePage` `waitingPlanDraft`) already skip a record with no matching version, so they ignore create drafts without change. `NotebookPlace` finds them by `kind === 'create'` and offers Resume. Restore reads `recipeId`/`versionId` from the record, not a fresh mint.
2. No persistence in v2.0, rely on the native leave-warning. Cheaper, but creation is the heaviest ink the app has ever asked for and v1's UX1-02 ("entered data surviving a closed tab") is a shipped requirement. This is a **decision for Mark**, not a technical constraint. Recommend (1), scheduled as the last slice of the editor so it cannot block the rest.

Note the `Escape` rule and dirty check for creation: `isPenDraftDirty` compares against a baseline version, so creation needs its own `isCreationDirty` (any ink beyond the blank draft).

## Library: seeding, store and `/ingredients`

### Mechanics found in the code

- `data/library.js`: 26 hand-authored entries, camelCase keys (`wholeMilk`, `oliveOil`, ...). The seeded recipe files import entries **by key** (`library.wholeMilk` in `data/olive-oil.js` and the other seed files), so existing keys must not change.
- Entry shape (what the engine and the validators read): `{ name, category, dairy?, composition: { fat, msnf, sugar, other, emulsifier, stabilizer, pac, pod }, basis: {field -> stated|derived|estimated|inherited}, source: {field -> text}, note?, heatTreatment?, densityGPerMl?, packedState? }`. `PAC`/`POD` are per 100 g as weighed (sucrose = 100), the same convention as the candidate file. `validateLibraryRecord` checks only `id`, `entry.name` and a numeric `composition`, so richer entries import fine.
- `store/seed.js`: `seedLibraryIfEmpty(records)` is one transaction (count, then puts). It returns false for a non-empty library. **A larger `data/library.js` reaches only brand-new profiles.**
- `db.js` is at version 9; the library store has `keyPath: 'id'`, records `{ id, entry }`, no index.
- A row embeds `structuredClone(entry)` and never the library id (`versionRow.js`). So changing or replacing library records can never move a stored version's figures. This is what makes the library safe to reseed.
- `importAll` replaces a local library record with the imported one silently (PROJECT.md "decide before library editing"). With a read-only library this stays harmless, which is a reason to keep `/ingredients` read-only and not add library editing in v2.0.

### The candidate dataset (`~/Downloads/sprinkles-ingredient-seed-db.json`)

103 rows (58 science, 45 legacy-imported from Ice Ed), percent fields (`fat_pct`, `msnf_pct`, `sugars_pct`, `solids_pct`), `pac` and `pod` per 100 g as-is, `pac_provenance` string, `sources[]`, `notes`. No per-field `basis`, no `dairy` flag. Compared by name with the 26 app entries: 23 match, 3 have no match (Graza olive oil, two coconut entries). Differences found:

| Entry | App | Candidate | Note |
|-------|-----|-----------|------|
| dextrose | PAC 190, POD 70 | PAC 174.8, POD 74 | the known hazard |
| salt | PAC 580 | 586 | the known hazard |
| fructose | POD 170 | POD 173 | |
| strawberries | PAC 8.5, POD 6.1 | 10.06, 9.8 | |
| coconutMilk | fat 16.9%, PAC 2.23 | fat 2.08%, PAC 4.6 | possibly a different product, not a conflict |
| skimMilkPowder | MSNF 97% | 96.3% | |
| heavyCream | fat 36% | row is 40% cream | different product |
| every dairy row | no `pac`/`pod` (engine derives lactose) | `pac` and `pod` include lactose | **double count if copied** |

### Recommended approach

- **Merge, do not replace.** New module `data/library-seed-db.js` (converter output, committed and reviewed) merged as `{ ...seedDbEntries, ...library }` in `seed.js` so an existing key always wins. The 26 app values (dextrose 190, salt 580) stay authoritative until Mark decides otherwise per ingredient.
- **Conflict gate.** A test (`library-conflicts.test.js`) enumerates every same-ingredient pair whose coefficients differ beyond a tolerance and fails unless the pair is on a recorded-decision list. That makes "settle the coefficient conflicts first" mechanical, not a memory. This list is a **decide row** set for Mark (memory: decisions are radio-button rows, not looks) and is the long pole: raise it at milestone start so it clears while the page split runs.
- **Converter rules** (an offline script, e.g. `app/scripts/`, not shipped): `fat = fat_pct/100`, `msnf = msnf_pct/100`; `sugar = sugars_pct/100` except dairy (lactose is already in MSNF, set `sugar` 0 for rows with `msnf > 0`); `other = solids - fat - msnf - sugar - emulsifier - stabilizer` (never negative); `emulsifier`/`stabilizer` from category; `dairy: true` for category `dairy`; **dairy `pac` and `pod` = 0 or omitted** (the lactose double-count); negative PAC rows (cocoa, nuts, "hardening") copy as-is, flagged for validation (the file itself says "starting points to validate"). `basis`: legacy-imported rows `inherited`, science rows `derived` for calculated PAC and `stated` for label values; `source` from `pac_provenance` and `sources[]`. This gives "with provenance" using fields the engine and `weakestBasis` already read, so estimated-data flags at row and figure keep working with no change.
- **Reach existing profiles:** bump `DB_VERSION` to 10 and in `upgrade` run the library clear, guarded `oldVersion > 0 && oldVersion < 10 && db.objectStoreNames.contains('library')`, using `transaction.objectStore('library').clear()` (synchronous request, no `async` in the callback, which `db.js` documents as load-bearing). Boot's `seedIfEmpty` then reseeds the bigger merged set. This deletes no recipe, version or batch, so it is **not a reset**. Alternative: a put-if-absent top-up by id. Rejected because it contradicts Phase 6 D-05 and leaves no path to correct a seeded coefficient later; the clear-on-bump is the same cost each time the dataset changes and the library holds nothing a maker authored. Update the `db.js` comment that says a bump to 9 "needs neither a reset nor a lift".
- `/ingredients` and the picker both read `repository.listLibrary()` (already exists; `{id, entry}` records). Share one `useLibrary()` hook and one entry-summary component (name, category, composition, basis flags, source, note). 103 rows grouped by category with a name filter is enough; no new repository method, no virtualisation. Filtering is a pure function (`domain/ingredientSearch.js`).
- The picker is a v2.0 consumer of the library only through `rowFromLibraryRecord`, so the "row embeds a clone at authoring time" invariant holds by construction. Test it the way `store/creation-roundtrip.test.js` already does (edit the library after authoring, assert the saved version's figures do not move).

## Custom scales and problems (SEED-261001-iq4)

### State of the code the seed predates

- Problems: `declaredFlaws` is already a list of 0 to 2 free-text words on the version and the batch snapshot (`createBatch` clones it; `declaredProblemsForBatch` reads the snapshot; `BatchRow` renders one chip per word, and the group is absent for none; the print log prints `[...DEFECTS, ...(version.declaredFlaws ?? [])]`). **Authoring them needs no data change**, only the creation control.
- Scales: `declaredAxes` is a list of **names** resolved against `AXES` (`axesForBatch`, `axesForVersion`). The seed's "free-text measures" needs entries that carry their own `{ key, name, low, high }`. The comment above `validateDeclaredAxes` records that this object shape existed before the Phase 03.3.1 reset and was deliberately removed; this reintroduces it.
- A mark is stored by `axis.key` (`markKeyFor`), so a custom scale needs a stable key.

### Recommended model (decision for Mark; the seed lists it as open questions 1 to 5)

- Keep definitions **per version** (as `declaredAxes` is today), copied to children by `createChildVersion`, snapshotted into each batch by `createBatch` (already `structuredClone`, so objects need no change there). Do not add a recipe-level store; that would break the snapshot invariant the seed itself says to keep.
- Entry shape `{ key, name, low, high }` where `key` is minted once at creation (not derived from an editable name) and copied forward unchanged, so "Heat" in version 1 and version 2 share one mark key.
- **Accept both shapes** in readers and validators (a legacy name resolves through `AXES`; an object is used as is). Then olive oil's seeded `['Body','Oil']`, the 2 Aug batch snapshot and every stored profile keep working with no bump and no lift, and no reset is needed for this feature. The alternative (objects only, reset) is cleaner code but spends the last free reset, and it requires checking Mark's devices for real batches first (memory: no-live-data-prefer-reset). Dual-shape costs one small resolver in `axes.js`.
- Consumers to change (complete list from grep): `domain/axes.js` (`axesForBatch`, `axesForVersion` resolve both shapes; custom entries get `group: 'declared'`), `domain/draft.js` line 146 (`fitsRecordShape` checks mark keys against the global `AXES`; must check against the version's or snapshot's own axis keys, as `fitsRecordValues` already does via `declaredOf`), `store/transfer.js` (`DECLARED_AXIS_NAMES` and `validateDeclaredAxes`: accept name or `{key,name,low,high}`, still at most 2, unique by key), `domain/lineage.js` line 141 (`declaredAxes: parent.declaredAxes` shares the array by reference; `structuredClone` it, as is done for rows and method), optionally `VERSION_SCHEMA_VERSION` 6 to 7 and `BATCH_SCHEMA_VERSION` 4 to 5 as hygiene (not validated at import). `BatchRow`, `AxisMark`, `PrintLogPages` already read through `axesForBatch`/`axesForVersion`, so they should need no change if the resolved object keeps `{key, name, low, high, group}`. `sheetCode.js` excludes `declaredAxes` and `declaredFlaws`, so printed Sheet codes do not move.
- Bitter: it is only olive oil's `declaredFlaws` value; nothing hard-coded remains in `BatchRow`. The open **Bitter bug row on Mark's List must be answered before this slice is planned**; do not touch Bitter until he does.
- Authoring surface: in v2.0 only at creation (`ScalesAndProblems` fold in the creation editor). Editing them on a later version is not drawn and is out of v2.0 scope; children inherit.
- Gate: the seed requires a Claude Design canvas for the new controls before building.

## Store, DB-version and reset implications (summary)

| Change | `DB_VERSION` | Reset? | `STORE_SCHEMA_VERSION` | Notes |
|--------|--------------|--------|------------------------|-------|
| Larger library seed | 9 to 10, clear `library` only | No (library holds no maker data) | unchanged (file shape unchanged) | Do it once, with the final dataset; every later dataset change needs another bump |
| Create-draft kind | none | No | none (drafts are never exported) | `DRAFT_SHAPE_VERSION` stays 1 |
| `createRecipeWithVersion` | none | No | none | New repository method only |
| Custom scales (dual-shape) | none | No | optional 8 to 9 hygiene bump | A file with object scales is refused by an older build with a path error; acceptable |
| Custom scales (objects only) | 10 with versions, batches, recipes, drafts dropped (the `<8` branch pattern) | **Yes** | 9 | Only if a check of Mark's devices finds no real records; the last chance before creation ships |

Rule to state in the milestone: **all shape and seed changes land in the same early phase, before the creation UI is reachable.** After that, a maker's created recipes are real data and the next shape change must lift.

## Build order

Dependencies drive it. Letters are suggested phase groupings, not final phase numbers.

```
decide rows to Mark at milestone start (long poles, no code)
   ├── library coefficient conflicts (per ingredient)         ──► B1
   ├── Bitter bug row + iq4 open questions 1-5                 ──► E
   └── Claude Design canvas: create editor, structure controls,
       picker, scales/problems, targets/equipment/process,
       Notebook place, Ingredients place                       ──► C, D, E

A  Page split (no visible change)     B  Data foundation        (A and B are independent;
   A1 useAnnouncer                       B1 converter + merged     B can run beside A)
   A2 useRecipeData                         library + conflict test
   A3 sheetView.js (pure)                B2 db 9->10 library clear + seed
   A4 RecipeSheet                        B3 axes dual-shape + validators + draft.js
   A5 useVersionPen                         + lineage clone
   A6 useKeptDraft, A7 useRouteIntents   B4 createRecipe extension +
   A8 useBatchRecording (droppable)         repository.createRecipeWithVersion +
   rewrite RecipePage.shell.test.js         creationDraft.js (pure ops + save block)
        │                                      │
        └────────────────┬─────────────────────┘
                         ▼
C  Places (low risk, first visible value)
   C1 /ingredients read-only   (needs B1, B2)
   C2 /notebook place with "New recipe"   (needs only router; Resume wired in D4)
                         ▼
D  Creation editor on RecipeSheet   (needs A4, A5, B4, C2, the canvas)
   D1 'creating' mode: isPenMode + no-baseline branches in the 8 child checks;
      /notebook/new route; name, description, version line, Before you start,
      step text (reuses existing pen ops)
   D2 IngredientPicker + row add/remove/move + live Balance
   D3 step add/remove/move + portion-to-step allocation + uses
   D4 targets, equipment, process authoring; create-draft kind + Resume
   D5 save: creationSaveBlock, createRecipeWithVersion, landing on the new page
                         ▼
E  Custom scales and problems authoring  (needs B3, D1, Mark's answers, canvas)
F  Roundtrip proof: create -> print Sheet -> Sheet code -> record batch with a
   custom scale -> export -> import; WebKit/iPad walk from the production build
```

Rationale:

- **A first (as stated)**, but B is independent of it (pure domain and data) and has the human long pole (the conflict decisions), so start B1's decisions at once.
- **B before any UI that creates data**, because B2/B3 are the store-shape changes that must precede real created recipes.
- **C before D** because the Ingredients place proves the seeded library in the browser and the shared `useLibrary` hook and entry component are reused by the picker; the Notebook place is the entry point D needs.
- **D2 before D3** is natural, but D3's allocation (`setPortionStep`) is what makes added rows land in a step; until D3 they sit in "Unallocated", which the table already draws.
- **E last in the editor** because it is the only slice with open product questions and is separable: the creation editor is complete and shippable with `declaredAxes: []` and `declaredFlaws: []`.
- **A8 (batch-recording controller) is the one cut creation does not need.** If the page split overruns, ship A1 to A7 and leave `useRecordDraft`'s handlers in `RecipePage`; creation is unaffected.

## Components: new versus modified

### New

| Unit | Kind | Notes |
|------|------|-------|
| `domain/creationDraft.js` | pure | structure ops, scale/problem/target ops, `creationSaveBlock`, `creationFieldsFromDraft`, `isCreationDirty` |
| `domain/ingredientSearch.js` | pure | name and category filter for picker and `/ingredients` |
| `data/library-seed-db.js` + converter script + `library-conflicts.test.js` | data | converter output committed; conflict gate |
| `ui/useRecipeCreation.js` | hook | draft state only; imports react and domain |
| `ui/useLibrary.js` | hook | `repository.listLibrary()`; may import the repository (not a draft hook) |
| `ui/useAnnouncer.js`, `useRecipeData.js`, `useKeptDraft.js`, `useRouteIntents.js`, `useVersionPen.js`, `useBatchRecording.js` | hooks | the page split |
| `ui/sheetView.js` | pure | derived view model |
| `ui/RecipeSheet.jsx` | component | extracted Sheet article, shared |
| `ui/RecipeCreatePage.jsx` | route component | mints ids, owns save, navigates |
| `ui/NotebookPlace.jsx`, `ui/IngredientsPlace.jsx` | route components | replace two `Placeholder` routes |
| `ui/IngredientPicker.jsx`, row/step structure controls, `ScalesAndProblems.jsx`, `TargetsEquipmentProcess.jsx`, `NewRecipeBand.jsx` | components | create-only; every button through `ui/Button.jsx`, every link with `tabIndex={0}`, all values via `tokens.css` custom properties |

### Modified

| Unit | Change |
|------|--------|
| `router.jsx` | routes for `/notebook`, `/notebook/new`, `/ingredients`; the page-status and Import-guard wrapper in `RecipePageForRoute` becomes reusable so the create route gets the same `PageStatus` host |
| `ui/RecipePage.jsx` | shrinks to a shell (the cuts) |
| `ui/RecipePage.shell.test.js` | rewritten to pin the new shell shape |
| `domain/penDraft.js` | `derivePenState` gains a create state; pen ops unchanged |
| `ui/Headnote.jsx`, `Method.jsx`, `IngredientTable.jsx`, `Authored.jsx`, `FormulationNote.jsx`, `VersionRow.jsx` | `isPenMode`; no-baseline rendering (no strikes, no "Show changes", no parent compare); structure-control slots |
| `domain/newRecipe.js` | optional authored sections |
| `domain/draft.js` | `kind: 'create'` and its shape check; mark keys against the version's own axes |
| `domain/axes.js`, `store/transfer.js`, `domain/lineage.js` | dual-shape scales; clone `declaredAxes` in the child |
| `store/repository.js` | `createRecipeWithVersion` |
| `store/db.js` | `DB_VERSION` 10, library clear; update the comments |
| `store/seed.js`, `data/library.js` | merged library |
| `ui/RecipeList.jsx` | none required (create drafts are already ignored); optionally a "New recipe" entry |

### Unchanged on purpose

`domain/composition.js` and `figures.js` (stored figures must not move), `versionRow.js`, `stepKeys.js`, `batch.js` `createBatch`, `sheetCode.js`, `BatchRow.jsx`, `AxisMark.jsx`, `PrintLogPages.jsx` (provided custom axes resolve to the same shape), the version-pen ops in `penDraft.js`.

## Data flow

```
Notebook "New recipe"
  -> RecipeCreatePage: mint {recipeId, versionId} once (useState initialiser)
  -> useLibrary()  <- repository.listLibrary()  [{id, entry}]
  -> useRecipeCreation: creationDraft {recipe, base, pen}
       pick ingredient  -> rowFromLibraryRecord(record, {id: freshId(), grams: 0})   (clone taken HERE)
                         -> addRowFromLibrary: base.rows + pen.rows[id] = {portions:[{step, grams:''}]}
       type grams       -> setPenGrams (raw string, parsed at save only)
       add/move/remove  -> creationDraft ops (prune uses and portion steps on delete)
  -> sheetView(base+pen, baseline=null) -> RecipeSheet (table, Balance, advisories live)
  -> [250 ms debounce] repository.saveDraft({kind:'create', versionId, ...})   (optional slice D4)
  -> Save: creationSaveBlock -> createRecipe(fields, {recipeId, versionId, now}) ->
       repository.createRecipeWithVersion({recipe, version})  (one tx) ->
       deleteDraft(versionId) -> navigate(notebookPath(...), {replace, state:{focusVersion}})
  -> RecipePage mounts fresh (key = recipeId::versionId::) and reads the stores as for any recipe
```

Custom scale flow: `ScalesAndProblems` -> `declaredAxes: [{key, name, low, high}]` on the version -> child copies it (cloned) -> `createBatch` snapshots it -> `axesForBatch` returns core axes plus the snapshot's scales -> `BatchRow`/print log unchanged.

## Anti-patterns to avoid

- **Reading the library at render time into a row or figure.** Rows clone the entry when added. Anything that resolves a library id later reintroduces coefficient drift (the invariant D04/D09 exists for).
- **Changing `computeBalance` to absorb the seed database's lactose convention.** It moves stored versions' figures. Convert the data instead.
- **Silently letting a seed-DB value overwrite an app value** (or the reverse) without a recorded decision.
- **A recipe-level scales store.** Breaks the batch snapshot invariant.
- **Growing `penDraft.js` with add/remove ops.** The revise pen must stay unable to restructure.
- **Persisting anything to `versions`/`recipes` before Save.**
- **Minting ids inside an effect.** StrictMode runs effects twice in development and the kept draft would hold different ids than the page.

## Pitfalls specific to this milestone

1. **`RecipePage.shell.test.js` will fail the moment a cut lands.** It pins the module-level function list, the repository import in the page, and that `usePenDraft()`/`useRecordDraft()` are called once above the early returns. Rewrite it in the same plan as each cut, not afterwards.
2. **Hook-order law.** Every hook sits above the early returns (`if (loadFailed) return`). A hook that moves behind a guard during extraction breaks on the first load.
3. **The kept-draft restore is order-sensitive.** It waits on version, batches and `loadFailed`; the amend-redirect branch deliberately leaves `draftRestoreDone` false so the next page instance owns the draft. Extract it with its callbacks and keep the existing `RecipePage.drafts.test.jsx` untouched as the guard.
4. **Tab-stop and token gates are tests.** `ui/tabindex-scan.test.js` fails any raw `button`/`input` radio/checkbox outside `Button`/`Radio`/`Checkbox` and any link without literal `tabIndex={0}`; the token rule forbids literals in CSS or components; `dangerouslySetInnerHTML` is forbidden. All new create controls inherit these.
5. **One-pen rule and the Import guard.** The create route must report its pen as open (`onPenOpenChange`) so Shell still refuses Import, and Escape must close only a clean pen.
6. **`/notebook/new` against `/notebook/:recipeId`.** React Router ranks the static segment higher, so the route works, but `NotebookLatestRedirect` would treat a recipe whose id is literally `new` as a missing recipe. Ids are UUIDs (`freshId`), so this cannot occur from the app; state it in a test.
7. **Validators must admit what the editor can produce.** `validateVersion` requires non-empty rows; `validateStep` requires non-empty `leadIn` and `instruction`, a `uses` array and a boolean `removed`. A created recipe that the app cannot export and re-import is a defect; test the create to export to import roundtrip (extend `store/creation-roundtrip.test.js`).
8. **Save-over is the only fix for a structure mistake.** After the first version is saved, v2.0 allows no structure edits (out of scope), yet `canSaveOver` lets the maker save over a zero-batch version, amounts and text only. A maker who mis-ordered steps cannot repair it until a later milestone. Surface to Mark; the structure ops being separate from `penDraft.js` keeps the option open later.
9. **Two descriptions.** `createRecipe` writes `recipe.description ''` and `sheetDescription ''`; the recipe record and the Sheet each have one. Creation needs to know whether it asks for one or two (product copy, Impeccable).
10. **Row "move" semantics.** The table is grouped by step, so a row's order is its position inside each step group. Moving a split row moves it in every group it appears in. Pin this in the brief.
11. **Device-only defects.** Chromium passes do not prove the iPad (WebKit, 1366, coarse pointer). Add the new create route to the production-build WebKit walk; Playwright WebKit is installed for reproduction, and device-verified only when Mark confirms. Keep dev-server runs to one Vite process.
12. **Design is a gate, not a side effect.** The create editor, picker, structure controls, scales/problems and the two places are undrawn. Per project rules, Impeccable owns the briefs and the Claude Design canvas holds the approved snapshots; plans consume them. A plan written before the boards invites the 03.3.1 → 18-gap failure the memory notes record.

## Scaling

Not a concern: a single user, a local store. The only size-sensitive point is the picker over 103 entries (a filtered list, no virtualisation) and `computeBalance` per keystroke over tens of rows (already the pen's behaviour).

## Sources

All read from the repository at commit `ad87a67` unless noted.

- `app/src/ui/RecipePage.jsx` (all 1,837 lines), `app/src/ui/RecipePage.shell.test.js`, `app/src/router.jsx`
- `app/src/ui/usePenDraft.js`, `useRecordDraft.js`, `IngredientTable.jsx` (lines 20-84, 410-530), `Method.jsx` (519-640), `Headnote.jsx`, `RecipeList.jsx`, `NotebookRedirects.jsx`, `Placeholder.jsx`
- `app/src/domain/newRecipe.js`, `versionRow.js`, `stepKeys.js`, `penDraft.js`, `draft.js`, `lineage.js`, `axes.js`, `battery.js`, `rows.js`, `stepNumbers.js`, `composition.js`, `figures.js`, `advisories.js`, `sheetCode.js`, `recipe.js`, `id.js`
- `app/src/store/db.js`, `repository.js`, `seed.js`, `transfer.js` (validators, lines 75-175, 221-260, 337-392, 491-612, 647-703)
- `app/src/data/library.js`, `olive-oil.js`, `seed-recipes.js`
- `.planning/PROJECT.md`, `.planning/seeds/SEED-261001-iq4-recipe-specific-tasting-measures-and-failures.md`, `.planning/ROADMAP.md`, `.planning/notes/2026-10-01-engineering-notes.md`, `CLAUDE.md`, `.claude/CLAUDE.md`
- `~/Downloads/sprinkles-ingredient-seed-db.json` (`meta.conventions`, `provenance_note`, 103 rows), compared with `data/library.js` by a throwaway script in the session scratchpad
- Confidence: HIGH for everything attributed to a file above; MEDIUM for the converter rules and the recommended editor shape, which are proposals to be confirmed against Mark's decisions and the canvas.

---
*Architecture research for: Sprinkles v2.0 Recipe creation*
*Researched: 2026-10-15*
