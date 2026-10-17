# Phase 8: Split the recipe page along its jobs - Research

**Researched:** 2026-10-17
**Domain:** Behaviour-preserving React refactor (hooks, a pure view function, one component) proven by a WebKit walk and a source-text shell test
**Confidence:** HIGH for structure, wiring, walk and tests (all read or run this session); MEDIUM for the exact prop shape of `RecipeSheet` (planner discretion)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scope of the split**
- **D-01:** The six jobs named in EDIT-05 are the required cuts. The record-pen and tasting handlers (about 400 lines, roughly lines 933 to 1330 of today's file, `useBatchRecording` in the research) are NOT required. They are extracted last, as a bonus, only if the six required cuts are done and the walk matches; otherwise they stay in the page and the phase still meets EDIT-05. Creation never touches the batch side. (Mark, 2026-10-17)
- **D-02:** Because the batch handlers may stay, the page after this phase is the route shell plus the batch side, not a bare shell. Success criterion 1 ("route shell only") is read as: the six named jobs each live in a module of their own; the shell test pins that and does not require the batch handlers to have moved.

**Order of the cuts and the stop rule**
- **D-03:** Cut in the research's order: `useAnnouncer`, then `useRecipeData` (record loading, the eight load effects, about 180 lines), then the pure `sheetView.js`, then the `RecipeSheet` component, then `useVersionPen`, then `useKeptDraft`, then `useRouteIntents`, then (bonus) `useBatchRecording`. Record loading moves second, so it is settled before the kept-draft restore that waits on `loadFailed`. (Mark, 2026-10-17)
- **D-04:** Each cut is its own commit and lands green (every existing test and the shell test passing) or is reverted and retried, in a follow-up plan if needed. The phase stays open until every one of the six required cuts has landed: Phase 8 is not done, and Phase 9 does not execute, until then, so EDIT-05 holds as written. The kept-draft cut is the likeliest to need a second attempt. The optional record-pen cut (D-01) is not affected and may stay in the page. (Mark, 2026-10-17, `decide-phase8-stop-rule`, replacing the earlier "drop a cut that cannot be made green")

**Sequencing with Phase 9**
- **D-05:** Phase 8 executes and merges before Phase 9 executes. The walk baseline stays valid (Phase 9's reset rewrites the seeded versions the walk dumps), and Phase 9's `create` draft kind builds on the finished kept-draft hook. Phase 9's planning, and Sid's two place boards, may proceed meanwhile. (Mark, 2026-10-17)

**Proof of no change**
- **D-06:** The walk cannot run from its archived location as it stands (Codex review, verified): `05-walk.mjs` imports its harness from `../../milestones/v1-phases/...`, which resolves to a path that does not exist, its repo root resolves to `.planning/` so the default build directory is `.planning/app/dist`, and its Playwright import points into an npx cache. The plan's first task repairs those paths (copying the walk into this phase's directory is fine) and proves it runs. Then, before any code moves, run the walk (`.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs`) at this phase's base commit and compare it with the old baseline `05-walk-before.json`. If it does not match, record a new before-walk at that base commit (as Phase 5 plan 01 did) and compare the finished split against it. The old baseline predates Phases 6 and 7 and later quick tasks. (Mark, 2026-10-17)
- **D-07:** No iPad device check for this phase: the WebKit walk and the tests are the evidence, and the iPad is checked once, in Phase 12, for the whole loop. No device row is added to Mark's List for Phase 8. (Mark, 2026-10-17)

**Wiring and contracts the plan must settle**
- **D-08:** The version pen and the kept drafts depend on each other. Version save and cancel call `discardDraft` (`RecipePage.jsx` about 1362-1368, 1497-1504, 1537-1543) and the record save and cancel need it too (about 1260-1320), while the draft restore resets the version pen's state, locks and timestamps (about 533-539). The plan states which hook owns what and how the callbacks are wired, so the hooks do not need each other to initialise, with every hook above the early returns and the callbacks safe while records are still loading.
- **D-09:** What Phase 8 delivers for Phase 10: the pure `sheetView` accepts `baseline = null`, and `RecipeSheet` renders with no stored version and no baseline (diff props nullable, no band, no batch aside). Phase 8 adds a node test for `sheetView` with a null baseline and a component test that mounts `RecipeSheet` without a stored version. Phase 10's new controls and its `creating` mode are not part of this phase.
- **D-10:** StrictMode: the restore-once effect (about 450-457) keeps its started-ref behaviour and gets no conventional cancellation cleanup, which would suppress the only permitted restore read. The plan adds a focused test that mounts the page under `React.StrictMode` and proves the draft is restored once, because the current draft tests have no StrictMode wrapper and the walk runs the built app.

### Claude's Discretion
- The names and homes of the new modules, within the existing patterns (hooks beside `usePenDraft.js` and `useRecordDraft.js` under `app/src/ui/`, pure functions under `app/src/domain/` or `ui/sheetView.js` as the research proposes).
- The exact props of `RecipeSheet` (the research: the derived view, the mode, handlers and diff props, all nullable; it does not include the band or the batch aside).
- What the rewritten shell test asserts beyond naming each module and checking that the shell imports it and the job lives there.

### Fixed by earlier decisions (carry forward)
- Existing tests change only their imports; none is deleted or weakened (ROADMAP Phase 8 criterion 4).
- The pen's state is pure operations in `domain/` behind a hook (Phase 5, `decide-pen-state-approach`, already shipped).
- Hook-order law: every hook sits above the early returns. A hook that moves behind a guard breaks on first load (`research/ARCHITECTURE.md`).
- The kept-draft restore is order-sensitive: it waits on version, batches and `loadFailed`, and the amend-redirect branch deliberately leaves `draftRestoreDone` false so the next page instance owns the draft. Extract it with its callbacks (`onRestorePlan`, `onRestoreRecord`) passed in.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.
Reviewed todos not folded: "Build the Recipe book print format", "Write a product brief for phone-based jobs", "Consider a Mise en Place auto-generator" (keyword matches only). `todo-split-recipepage` on Mark's List is this phase's own work; it closes when the phase is done.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EDIT-05 | `RecipePage` is cut along its separate jobs (announcer, record loading, sheet view, version pen, kept drafts, route intents) and the maker sees no change. | Cut table with current line ranges (Architecture Patterns); hook call order and callback wiring (D-08 section); walk repaired and MATCHing at base commit `e097454` (Walk section); per-cut green gate (Validation Architecture). |
| EDIT-06 | The shell test asserts the new modules positively, and the recorded WebKit walk of 94 snapshots still matches. | Shell test fate table and positive-assertion design (Shell Test section); walk run, compare and determinism proven (Walk section). |
</phase_requirements>

## Summary

`RecipePage.jsx` is 1,837 lines and byte-identical to the file the project research (`ARCHITECTURE.md`, commit `ad87a67`) read: `git diff --stat ad87a67 HEAD -- app/src/ui` is empty [VERIFIED: git diff run this session]. So the research's line numbers are current; Phases 6 and 7 changed `domain/` and `store/`, not the page. The six jobs map onto contiguous blocks (table below). The one real design problem is the cycle between the version pen (calls `discardDraft` on save and cancel) and the kept draft (calls the pen's `restore`, resets its lock, save action and `penOpenedAtRef`). The recommended break is a tiny effect-free hook `useDraftWriter(versionId)` that owns the three draft refs and `flushPendingDraft`/`discardDraft`, called before `useVersionPen`; `useKeptDraft` is then called after it and takes the pen's `restorePlan` as a callback. The call order is acyclic, needs no refs-of-callbacks, and every hook sits above the early returns.

The proof of no change already works. I built HEAD (`e097454`) to a scratch dir, ran the unmodified `05-walk.mjs` logic in WebKit (only the harness import path patched), and `compare` against `05-walk-before.json` printed `MATCH 94 snapshots`; two fresh runs also compare equal, so the walk is deterministic [VERIFIED: ran this session, 40 s per record]. So D-06's fallback (record a new before-walk) is not needed unless the base commit changes before execution. Copying the walk unchanged into this phase's directory repairs both the harness path and the repo root, because the file was written for a `.planning/phases/<phase>/` home [VERIFIED: path arithmetic and a no-argument run that reached the usage line].

Two findings change how the plan must be written. (1) Eight `describe` blocks in `RecipePage.test.jsx` read `RecipePage.jsx` as source text and will fail as JSX and handlers move; ROADMAP criterion 4 ("change only their imports") has to be read as allowing those tests to read the new file instead. (2) A page-level StrictMode mount cannot tell whether the restore-once guard is present, because at mount the data is not loaded and the restore effect returns early; I proved this by deleting the guard in a scratch copy and the StrictMode mount test still passed. The discriminating tests are a hook-level StrictMode test with data present at mount, and a page-level "Save over does not re-read the draft" assertion.

**Primary recommendation:** Cut in D-03 order, one commit each, extending the shell test and re-pointing the affected source-text pins in the same commit as the cut that breaks them; introduce `useDraftWriter` as the cycle-breaker; run the repaired walk after every cut (about 50 s).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Route identity, `?changes`, `location.state` flags | Browser / Client (react-router in the shell) | — | Stays in `RecipePage` (J1). |
| Record loading (8 reads, `loadFailed`) | Browser / Client hook | Database / Storage (IndexedDB via repository seam) | `useRecipeData` is the only caller of the seven read methods. |
| Kept-draft write/restore/persist | Browser / Client hook | Database / Storage (`drafts` store) | All draft IO through `repository.getDraft/saveDraft/deleteDraft/listDrafts`. |
| Sheet view model | Pure function (`ui/sheetView.js`, domain imports only) | — | Node-testable, no DOM. |
| Sheet rendering | Browser / Client component (`RecipeSheet.jsx`) | — | The article only; band and batch aside stay in the shell. |
| Version pen state, locks, saves | Browser / Client hook | Database / Storage (`saveVersion`) | Wraps the existing `usePenDraft`. |
| Announcer (3 live regions) | Browser / Client hook | — | Pure state and timers. |
| Route intents (consume-once openers) | Browser / Client hook | — | Depends on pen openers and `draftRestoreDone`. |

## Standard Stack

No new packages. The phase uses what is installed [VERIFIED: app/package.json].

| Library | Version | Purpose |
|---------|---------|---------|
| react / react-dom | 19.2.8 | Hooks, `StrictMode` |
| react-router | 8.3.1 | `useParams`, `useNavigate`, `useLocation`, `useSearchParams`, `MemoryRouter` in tests |
| vitest | 5.0.0 | Node environment by default; jsdom per file via `// @vitest-environment jsdom` docblock |
| jsdom | 30.1.1 | Mounting tests |
| Playwright WebKit (walk only) | playwright-core 1.63.0 in the npx cache, `webkit-2359` browser | The 94-snapshot walk |

**Installation:** none. **Version verification:** `node --version` v24.21.0, `npm --version` 11.19.0, `ls ~/Library/Caches/ms-playwright` shows `webkit-2359` [VERIFIED: commands run this session].

## Package Legitimacy Audit

None — this phase installs no external packages, so the legitimacy gate does not apply. No `[SUS]`/`[SLOP]` items.

## Architecture Patterns

### System Architecture Diagram (call order inside `RecipePage` after the six cuts)

```
route (router.jsx keys RecipePage by recipeId::versionId::batchId)
   |
   v
RecipePage (shell)
 params / search / location flags (J1) ---------------------------------+
   |                                                                    |
   v                                                                    |
 useAnnouncer()  --> announce, formStatus/tastingStatus/recordStatus    |
   |                                                                    |
 useRecipeData(versionId) --> version, versions, batches, drafts,       |
   |        (8 repository reads)   recipe, citedBatch, parentVersion,   |
   |                               allBatches, *Loaded, loadFailed      |
   v                                                                    |
 [mode state] + useRecordDraft() (+ batch-side state, stays: D-01/02)   |
   |                                                                    |
 useDraftWriter(versionId) --> refs + flushPendingDraft + discardDraft  |
   |            (no effects, no pen knowledge)                          |
   v                                                                    |
 useVersionPen({version, versions, batches, setMode, setVersion(s),     |
   |   announce, onPageStatus, discardDraft, navigate})                 |
   |   wraps usePenDraft; owns saveAction, lock, penOpenedAtRef,        |
   |   11 edit handlers, start/cancel, 2 saves, restorePlan             |
   v                                                                    |
 title effect (shell)                                                   |
   v                                                                    |
 useKeptDraft({writer, ids, version, batches, batchesLoaded,            |
   |   loadFailed, mode, penDraft, penOpenedAtRef, record-pen values,   |
   |   onRestorePlan: versionPen.restorePlan, onRestoreRecord, ...})    |
   |   restore-once, debounced persist, pagehide flush --> draftRestoreDone
   v                                                                    |
 useRouteIntents({draftRestoreDone, mode, batches, versions, drafts,    |
   |   version, onStartAmending, onStartDeveloping})  <-- location.state|
   v                                                                    |
 Escape effect, Import guard effect, useBelowDesktop/useBelow724/       |
 batch useFold (all stay above the early returns)                       |
   v                                                                    |
 early returns (loadFailed / loading / not found)                       |
   v                                                                    |
 sheetView({version, baseline, mode, penDraft, parentVersion,           |
   |   showingChanges, batches, batchId})  -- pure --> view             |
   v                                                                    |
 band JSX (RecipeBand, VersionRow, GoToBatch, RecipeHistory)            |
 <RecipeSheet view mode penDraft draft handlers foot={<PenFoot/>}/>     |
 <BatchRow .../> aside                                                  |
```

### Current structure of `RecipePage.jsx` and the cuts, in D-03 order

Line numbers are for the current file [VERIFIED: Read of app/src/ui/RecipePage.jsx 1-1837 this session]. 16 `useEffect`s: eight loads (262-275, 277-293, 295-311, 316-332, 342-359, 378-395, 405-422, 430-443), title 364-370, restore 500-551, persist 557-596, pagehide 603-614, startTasting 627-640, startNextVersion 650-659, Escape 675-690, Import guard 693-695. 37 `function handle*` declarations [VERIFIED: grep count].

| # | Cut | Current lines | Moves | Consumers left in the shell |
|---|-----|---------------|-------|-----------------------------|
| 1 | `useAnnouncer` | state + timer refs 214-215, 223-224, 231-232 (comments 216-230); `announce` 875-914 | `formStatus`, `tastingStatus`, `recordStatus`, three timer refs, `announce` (guarded 5 s clear, 3 channels). Return the three values, `announce`, and the three raw setters (`setFormStatus` ×17 mentions, `setTastingStatus` ×8, `setRecordStatus` ×8 in the batch handlers). | `announce(` ×26 mentions; props to `VersionRow`/`BatchRow`. |
| 2 | `useRecipeData(versionId)` | state 166-182 (version, versions, batches, batchesLoaded, drafts, draftsLoaded, versionsLoaded, loadFailed), 341 (recipe), 377 (citedBatch), 404 (parentVersion), 429 (allBatches); the eight effects above | All eight reads plus state. Return the values and the four setters the save handlers call: `setVersion`, `setVersions`, `setBatches`, `setRecipe` (`setBatches` ×3, `setVersions` ×3, `setVersion` ×2, `setRecipe` ×3 mentions). Keeps `loadFailed` semantics. | Guards 725-746. The title effect 361-370 stays in the shell (page chrome, not a load); keep it between `useRecipeData` and `useKeptDraft` to preserve effect order. |
| 3 | `sheetView.js` (pure) | `joinNames` 63-69; derivations 777-873 (`hasRows`, `readingVersion`, `draftVersion`, `liveVersion`, `figures`, marked-row trace 803-813, `changeDiff`/`changeStaleSteps` 821-823, `penDiff`/`penStaleSteps` 833-834, step-number maps 849-850, `openBatch` 855-860, `comparisonBatch`/`evidenceBatch`/label 866-873) | Add `baseline` (D-09). Export a second pure helper for the focus trace: `markedFigure(view, focusedFigureKey)` -> `{ markedRowIds, markedFigureLabel, markedAnnouncement }`. | `canSaveOver` 757, `waitingPlanDraft` 762-775 (band-level; stay), `openPen`/`penReason` 750. |
| 4 | `RecipeSheet.jsx` | region visibility + `sheetClassName` 1564-1577; article JSX 1641-1786; `focusedFigureKey` 183-187; Balance fold 715-716 and `useSheetTwoColumns` | The article only. Keep the `<div className="notebook-body__sheet">` wrapper (1640) in the shell. `PenFoot` (1777-1785) is batch-side: pass it as a `foot` slot node. | Band JSX 1581-1637, batch aside 1789-1833, `handleGoToBatch`, `handleToggleShowChanges`, `useBelow724`, `useBelowDesktop`, `batchOpen` fold. |
| 5 | `useVersionPen` | 253-260 (`usePenDraft`, `versionSaveAction`, lock, `penOpenedAtRef`); `handleStartDeveloping` 1329-1345; `handleCancelDeveloping` 1360-1371; 11 edit handlers 1373-1457; `buildPenFields` 1470-1475; `handleSaveAsNewVersion` 1480-1514; `handleSaveOverVersion` 1520-1552; `VERSION_*` constants 83-85 | Wraps `usePenDraft()`. Adds `restorePlan(payload, penOpenedAt)` (the 533-539 reset). | `handleToggleShowChanges` 1351-1358 (search params), `handleSaveRecipe` 1560-1562. |
| 6 | `useKeptDraft` (+ `useDraftWriter`) | refs 463-469; `flushPendingDraft` 473-481; `discardDraft` 486-492; restore 500-551; persist 557-596; pagehide 603-614; `DRAFT_KEPT_STATUS` 87-90 | Writer: refs + flush + discard (no effects). Kept draft: the three effects. | `onRestoreRecord` (inline: `recordPen.restore(record); setMode('recording')`). |
| 7 | `useRouteIntents` | refs 626, 649; effects 627-640, 650-659; `startTastingOnMount`/`startNextVersionOnMount` 153-156 | Reads `useLocation()`/`useNavigate()` itself. | `focusVersionOnMount`/`focusBatchOnMount` 148-149 (props for `VersionRow`/`BatchRow`). |
| 8 | bonus `useBatchRecording` | state 197-250 (record pen, attempts, lock), handlers 927-1327, constants 71-112 except `PAGE_LOAD_ERROR` | Optional (D-01). Breaks the most source-text pins (see table below). | `handleGoToBatch` 916-925 (needs `batchOpen`). |

After cuts 1 to 7 the page keeps roughly 750 to 800 lines, about 400 of them the batch handlers (D-02) [ASSUMED: arithmetic estimate].

### Pattern 1 (D-08): `useDraftWriter` breaks the pen/draft cycle

**What:** The cycle is real: `discardDraft` (needed by version save/cancel and record save/cancel) lives with the kept-draft refs, while the restore effect needs the version pen's `restore`, `penOpenedAtRef`, `setVersionSaveAction` and `versionSaveLockRef`. `discardDraft` and `flushPendingDraft` need only `versionId`, three refs and the repository, so they split off.

**Ownership:**

| Hook | Owns | Does not own |
|------|------|--------------|
| `useDraftWriter(versionId)` (exported from `useKeptDraft.js`) | `draftStoredRef`, `pendingDraftRef`, `draftTimerRef`, `flushPendingDraft`, `discardDraft`. **No effects**, so effect order is untouched. | Anything about pens. |
| `useVersionPen(args)` | `usePenDraft()`, `versionSaveAction`, `versionSaveLockRef`, `penOpenedAtRef`, start/cancel/edits/saves, and `restorePlan(payload, penOpenedAt)` doing exactly lines 534-539: `pen.restore(payload); penOpenedAtRef.current = penOpenedAt; setVersionSaveAction(null); versionSaveLockRef.current = false; setMode('developing')`. Receives `discardDraft` as an argument. | Any draft IO. |
| `useKeptDraft(args)` | `draftRestoreDone`, `draftRestoreStartedRef`, `modeRef`, the restore, persist and pagehide effects, `useNavigate()` for the amend redirect. Receives `writer`, `onRestorePlan`, `onRestoreRecord`, `onPageStatus`, the pen values. Returns `{ draftRestoreDone }`. | Pen state, locks. |

**Call order** (acyclic, all above the early returns): `useAnnouncer` -> `useRecipeData` -> `mode` state -> `useRecordDraft` -> `useDraftWriter` -> `useVersionPen` -> title effect -> `useKeptDraft` -> `useRouteIntents` -> Escape and Import-guard effects -> width/fold hooks -> early returns. This preserves the original effect order (loads, title, restore, persist, pagehide, startTasting, startNextVersion, Escape, Import guard) because the writer has no effects and the pagehide effect stays inside `useKeptDraft` after persist [VERIFIED against lines 262-695]. Unmount cleanup order matters here: today persist's cleanup (clear timer) runs before pagehide's cleanup (flush); keeping them in that order keeps the final write identical.

**Alternative rejected:** a ref bridge (`keptDraftRef.current.discardDraft()`) works but hides the dependency and makes the shell test unable to see it; a forward-referenced `const` closure reads as a use-before-define bug. Recommend `useDraftWriter`.

**Callbacks safe while records load:** nothing in a hook body may dereference `version`/`versions`/`batches` at hook top level (they are `undefined`/`[]` until loaded and the guards that protect the JSX sit below the hooks). Dereference only inside handlers and effects that already wait on `draftRestoreDone` or a pen being open. `discardDraft` uses only `versionId` (always defined from `useParams`) [VERIFIED: lines 486-492]. The restore callbacks run only after `version` and `batchesLoaded` are set (guard at line 502). `useVersionPen` handlers run from controls that exist only after the guards pass, plus two effect callers (Escape: registered only when a pen is open; startNextVersion: waits on `draftRestoreDone`).

**Rules that keep behaviour identical:**
- Keep each handler a plain function recreated every render. Do not wrap in `useCallback`/`useMemo` with partial deps: the effects at 627-659 and 675-690 deliberately capture the render's handlers and have incomplete dependency arrays [VERIFIED]. Copy the dependency arrays verbatim (restore `[version, batchesLoaded, loadFailed]`, persist `[draftRestoreDone, mode, amendingBatchId, penDraft, draft, amendBaseline, amendOpener, version]`, startTasting `[startTastingOnMount, mode, batchId, batches, draftRestoreDone]`, startNextVersion `[startNextVersionOnMount, mode, draftRestoreDone, versionsLoaded, draftsLoaded, versions, drafts, version]`). The project has no ESLint [VERIFIED: app/package.json devDependencies], so nothing will flag them; do not "fix" them.
- Name the hook parameters `announce` and `onPageStatus` and call them under those names. `RecipePage.test.jsx` finds callers by regex `(\w+)\(CONSTANT` and expects exactly `announce` for `VERSION_BLOCKED_STATUS`, `VERSION_SAVE_ERROR`, `BATCH_SAVE_ERROR` and exactly `onPageStatus` for `VERSION_SAVED_STATUS` [VERIFIED: RecipePage.test.jsx:883-923].
- Ids and instants stay in event handlers: `freshId()` at lines 1281 and 1490, `new Date().toISOString()` at 1240, 1338, 1490, 1530 and inside the persist effect (561-578). Never write `useState(freshId())`/`useRef(freshId())` (evaluates every render). The walk replaces `crypto.randomUUID` with a counter and fixes the clock, so an extra id call at render shifts every later id and the walk reports DIFF. In dev StrictMode a render-phase call would also run twice [CITED: react.dev/reference/react/StrictMode].

### Pattern 2 (D-09): `sheetView(baseline = null)` and `RecipeSheet` without a stored version

```js
// ui/sheetView.js - pure, imports only ../domain/*.js
export function sheetView({ version, baseline, mode, penDraft, parentVersion, showingChanges, batches, batchId }) {
  // today's page passes baseline: version. Creation passes baseline: null.
  const readingVersion = { ...version, rows: activeRows(version), method: activeSteps(version) };
  const draftVersion = mode === 'developing' && penDraft ? penDraftVersion(version, penDraft) : null;
  const liveVersion = draftVersion ? { ...draftVersion, rows: activeRows(draftVersion), method: activeSteps(draftVersion) } : readingVersion;
  const changeDiff = showingChanges && version.parentVersionId && parentVersion ? buildDiff(version, parentVersion) : null;
  const penDiff = draftVersion && baseline ? buildDiff(draftVersion, baseline) : null;           // null baseline: no diff
  const penStaleSteps = penDiff ? stepsWithStaleAmounts(draftVersion, baseline) : [];
  const baselineStepNumbers = mode === 'developing' ? (baseline ? displayNumbers(baseline.method) : null)
    : changeDiff ? displayNumbers(parentVersion.method) : null;
  // ...figures, step numbers, openBatch, comparisonBatch, evidenceBatch: copied from lines 777-873
}
```

Today `penDiff = buildDiff(draftVersion, version)` and `baselineStepNumbers = displayNumbers(version.method)` while developing (lines 833, 850), and `Method` gets `baselineVersion={version}` (1721); with `baseline = version` the output is identical. `RecipeSheet` passes `baselineVersion={baseline}` to `Method`.

**Verified rendering with no stored version:** I rendered `Headnote`, `IngredientsHead`, `FormulationNote`, `BasisNote`, `DerivedAdvisories`, `NoteList` and `Method` over `{ rows: [], method: [], authored: { beforeYouStart: [] }, declaredAxes: [] }` with `baseline`/`parentVersion` null, in both `reading` and `developing` (with a minimal pen draft): no throw [VERIFIED: scratch vitest probe this session]. `buildFigures({ rows: [] })` returns `[]` (`computeBalance` null) [VERIFIED: figures.js:140-142]. The page's own empty branch (`<p>This version has no ingredient rows.</p>`, line 1706) moves into the sheet unchanged. `IngredientTable` with a null `baselineVersion` while developing already happens for a root version (Phase 7, commit `1883c99`), so the "diff props nullable" claim holds today for the cases Phase 8 must cover; `IngredientTable`'s explicit no-baseline branch for added rows is Phase 10's.

**What `RecipeSheet` needs** (move the JSX verbatim, destructure props to the same local names the JSX already uses):
- Keep these lines textually in `RecipeSheet.jsx`, because eight source-text pins look for them (see test table): `methodSteps`, `beforeNotes`, `beforeRegionShown`, `methodRegionShown = showsMethodRegion({ mode, steps: methodSteps })`, `sheetClassName`, `<article className={sheetClassName}`, `<section className="method-region" aria-label="Instructions">`, `{beforeRegionShown && (<section className="before-region" …`, `<IngredientsHead` inside `<section className="ingredient-table-region"`, `steps={methodSteps}`. Region visibility is therefore view code in the component, not in `sheetView.js` (also avoids a pure module importing `Method.jsx`).
- Own `focusedFigureKey`, `useSheetTwoColumns()` and the Balance `useFold`. These hooks move into a child that mounts only after the guards pass; that is equivalent because `useFold`'s effect only calls `setOpen(openByDefault)` at mount (a no-op) and the page is keyed per route [VERIFIED: useBelowDesktop.js useFold]. `RecipePage.folds.test.jsx` and `RecipePage.a11y.test.jsx` cover both. Fallback if the planner prefers zero risk: leave them in the shell and pass down; Phase 10 then repeats them.
- Accept nullable record-side props (`draft`, `evidenceBatch`/`openBatch`, `comparisonBatchLabel`, `onChangeAsMade`, `onChangeStepChange`) because `IngredientTable` and `Method` take them in recording mode; creation passes `null`/no-ops. Do not include `BatchRow`, the band, or `PenFoot` (slot `foot`).
- Pass `onToggleShowChanges={handleToggleShowChanges}` from the shell under that prop name to both `VersionRow` and `RecipeSheet`, so the shell still contains the string twice (see test table).

**Tests to add** (D-09):
- `ui/sheetView.test.js` (node, no docblock): with `baseline: null` and an empty version-shaped object, `penDiff === null`, `penStaleSteps` `[]`, `baselineStepNumbers === null`, `changeDiff === null`, `figures` `[]`, `openBatch === null`, `evidenceBatch === null`; plus a case with a real version, `baseline: version`, developing, proving `penDiff` equals `buildDiff(draftVersion, version)`; plus `markedFigure` over a figure key.
- `ui/RecipeSheet.test.jsx` (`renderToStaticMarkup` in `MemoryRouter`, node env like `Method.test.jsx`, or jsdom if it needs a click): mount with the empty no-baseline version in `reading` and in `developing`; assert `article.recipe-page` carries `recipe-page--no-method` and `recipe-page--no-before` in reading, shows `This version has no ingredient rows.`, renders no `PenFoot` text when `foot` is null, no `batch` aside, and in developing shows the `Before you start` and `Instructions` sections.

### Pattern 3: re-export moved constants so tests keep their imports

Tests import `VERSION_BLOCKED_STATUS`, `DRAFT_KEPT_STATUS`, `PAGE_LOAD_ERROR`, `BATCH_SAVE_ERROR`, `MEASURED_INVALID_STATUS`, `CHURN_DATE_BLOCKED_STATUS`, `TASTING_*` from `./RecipePage.jsx` [VERIFIED: RecipePage.test.jsx:26-34, drafts.test.jsx:85-89, perStep.test.jsx:60]. Define each constant in the module that uses it (`VERSION_*` in `useVersionPen.js`, `DRAFT_KEPT_STATUS` in `useKeptDraft.js`; a hook importing back from `RecipePage.jsx` would be a cycle) and add `export { VERSION_SAVED_STATUS, VERSION_SAVE_ERROR, VERSION_BLOCKED_STATUS } from './useVersionPen.js';` (and the same for `DRAFT_KEPT_STATUS`) to `RecipePage.jsx`. The shell test regexes (`^export function`, `import {…} from`) do not count `export … from`. Zero test edits for these. `RecipeNotFound` stays exported from `RecipePage.jsx` (`NotebookRedirects.jsx` and `PrintSheet.jsx` import it) [VERIFIED].

### Recommended structure

```
app/src/ui/
├── RecipePage.jsx        # route shell (+ batch side while useBatchRecording is optional)
├── RecipeSheet.jsx       # the article: Headnote, Before you start, IngredientTable, Method, Balance fold, advisories, foot slot
├── sheetView.js          # pure: sheetView(), markedFigure(), joinNames
├── useAnnouncer.js       # react only
├── useRecipeData.js      # react + ../store/repository.js
├── useVersionPen.js      # react, ../domain, ./usePenDraft.js, repository, ./notebookPaths.js
├── useKeptDraft.js       # useDraftWriter + useKeptDraft: react, react-router, repository, ../domain, ./notebookPaths.js
├── useRouteIntents.js    # react, react-router, ../domain/lineage.js, ./notebookPaths.js
└── (usePenDraft.js, useRecordDraft.js unchanged: react + ../domain only, no repository)
```

### Anti-patterns to avoid
- **Wrapping handlers in `useCallback` with partial deps.** Freezes `version`/`batches` in effects that rely on re-created closures.
- **A "tidy" `finally { setDraftRestoreDone(true) }` or a `setDraftRestoreDone(true)` in the amend-redirect branch.** The branch at 529-532 returns without it on purpose: the persist effect must stay inert on an instance that is about to be replaced, or it deletes the draft the next instance reads. Test: `RecipePage.drafts.test.jsx:596-614` (expects `deleteDraft` not called, location `REPLACE`, one notice).
- **A cancellation cleanup on the restore effect** (D-10). Proven below.
- **Moving a hook behind the guards, or into a child that mounts after them** (except the three Sheet-local hooks decided above).
- **Pruning imports late.** The shell test's "imports nothing it does not use" fails the cut that leaves one behind; prune in the same commit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Draft state and dirtiness | New draft reducers | Existing `usePenDraft`, `useRecordDraft`, `domain/penDraft.js`, `recordDraft.js`, `draft.js` | Phase 5 shipped them; the new hooks wrap, never reimplement. |
| Walk harness | A new Playwright script | The existing `05-walk.mjs` copied unchanged into the phase dir | 94 snapshots, deterministic clock and id counter, store dumps. |
| Mount helper for page tests | A new test harness library | The `createRoot` + `act` + `MemoryRouter` + `vi.mock('../store/repository.js')` pattern the eight page tests already use | One style across the suite. |
| StrictMode simulation | Manual double-calling | `<StrictMode>` around the tree | The real thing. |

**Key insight:** this is a move, not a redesign. Every line that moves should be byte-identical except for the names it now receives as arguments.

## Runtime State Inventory

(Refactor phase: answered explicitly, nothing left blank.)

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | The IndexedDB `drafts` store (keyPath `versionId`, kinds `plan`, `record`, `amend`) is read and written by the same repository calls with the same record shapes; the walk dumps `versions`, `batches`, `recipes`, `drafts` and MATCHed. | None. Code edit only. |
| Live service config | None — no external service. | None. |
| OS-registered state | None. | None. |
| Secrets and env vars | None. `PROBE_DIST` is a walk-only variable. | None. |
| Build artifacts | `app/dist` (gitignored) is what Mark's `vite preview --host` serves; stale after a build. The walk must build to a scratch `--outDir`, never `app/dist`. | Build to scratch for the walk. |

## Common Pitfalls

### Pitfall 1: Source-text tests read `RecipePage.jsx` and fail as code moves
**What goes wrong:** `RecipePage.test.jsx` has eight `describe` blocks that `readFileSync` the page and regex it: announce-vs-`onPageStatus` callers (describe at 883), running head (925, vacuous after the split), single `Link` (999), `method-region`/Instructions (1138), empty-method region pins (1151), Go-to-batch placement (1218), below-724 wiring and `handleStartTasting` body (1248), the `handleToggleShowChanges` ×2 / `IngredientsHead` pin (1288) [VERIFIED: Read of the file this session]. `tabindex-scan.test.js` scans all `.jsx` under `src` generically and needs `ui/RecipePage.jsx` to exist [VERIFIED].
**How to avoid:** Re-point each pin to the file that now holds the code, assertions unchanged (below). Needs Mark's reading of criterion 4 (A1).
**Warning signs:** a pin that passes vacuously (`toBeNull()` on a pattern that no longer exists), like the running-head test.

Which cut breaks which pin (verified by reading the assertions against the planned homes):

| Cut | Pins that break | Re-point / keep-text rule |
|-----|-----------------|---------------------------|
| 1 `useAnnouncer` | none | Page keeps calling `announce(` under that name. |
| 2 `useRecipeData` | none (page still imports `repository` for `saveBatch`, `saveRecipe`) | Prune unused imports. |
| 3 `sheetView` | shell test: module-function list loses `joinNames` | Update list to `['PageLoadFailed','RecipeNotFound','RecipePage']`. |
| 4 `RecipeSheet` | `method-region`/Instructions, empty-method pins, `sheetClassName`, `IngredientsHead` inside `ingredient-table-region` | Read `RecipeSheet.jsx` for those describes. The `onToggleShowChanges={handleToggleShowChanges}` ×2 pin: the shell still has two (VersionRow and RecipeSheet) if the prop is named the same; the `function handleToggleShowChanges(` ×1 and `<IngredientsHead` ×1 parts read page and sheet respectively. |
| 5 `useVersionPen` | announce-callers describe (VERSION_* now in the hook file); shell test `usePenDraft()` once-in-page | Read page + `useVersionPen.js` text for the announce describe (callers set must stay exactly `{announce}` / `{onPageStatus}`); shell test asserts `usePenDraft()` once in `useVersionPen.js` and `useVersionPen(` once in the page. |
| 6 `useKeptDraft` | none textual | Add positive assertions. |
| 7 `useRouteIntents` | none textual | Add positive assertions. |
| 8 bonus `useBatchRecording` | `BATCH_SAVE_ERROR` callers, `onPageStatus(batchSavedStatus(record))` ×2, `handleStartTasting` body regex `/function handleStartTasting\(batch\)\s*\{([\s\S]*?)\n  \}/`, `useBelow724()` ordering | Re-point to the hook file; the `\n  }` regex needs the function at two-space indent, which a hook body also has. Keep the JSX tag text `onStartRecording={handleStartRecording}` / `onStartTasting={handleStartTasting}` by destructuring under the same names. |

### Pitfall 2: The StrictMode test must be the right shape (D-10)
**What goes wrong:** A page-level `<StrictMode>` mount "restores once" passes whether or not the guard exists. I removed `if (draftRestoreStartedRef.current) return;` in a scratch copy and the mount test still showed 1 read, 1 notice, pen open. At mount `version` is undefined, so the restore effect returns early on both StrictMode runs; the data arrives later in one pass [VERIFIED: scratch probes this session, with and without the guard].
**What discriminates:**
1. **Hook-level, data present at mount.** Mount a harness component calling `useKeptDraft(...)` with `version`, `batches`, `batchesLoaded: true`, `loadFailed: false` already set, under `<StrictMode>`, with `repository` mocked and `onRestorePlan` a spy. Assert exactly one `getDraft` call and one `onRestorePlan` call. In a minimal replica of the effect: guard only -> 1 read, 1 restore; guard plus a conventional `cancelled` cleanup -> 1 read, **0 restores** (the restore is dropped); cancel without guard -> 2 reads; neither -> 2 reads [VERIFIED: scratch mini-test]. Refs survive the StrictMode simulated remount, which is why the guard works (React's docs describe the extra setup+cleanup cycle but not ref preservation [CITED: react.dev/reference/react/StrictMode]; the behaviour is the empirical result above).
2. **Page-level re-run.** Mount the full page under `<StrictMode>` with a stored plan draft (restored: pen open, `Version name` holds the draft's text, exactly one `DRAFT_KEPT_STATUS`, `getDraft` once), then press `Save over this version`: `setVersion(updated)` re-triggers the restore effect's dependency, and `getDraft` must still have been called **zero** more times (guard present: 0; guard removed: 1) [VERIFIED: scratch probe, both variants].
**Where:** a new `RecipePage.strictMode.test.jsx` (jsdom) copying the small mount harness from `RecipePage.drafts.test.jsx:19-148` (mock only `getVersion`, `listVersions`, `listBatchesForVersion`, `getAllBatches`, `getBatch`, `getRecipe`, `getDraft`, `saveDraft`, `deleteDraft`, `listDrafts`, `saveVersion`, `saveBatch`, `saveRecipe`), and a hook-level test beside `useKeptDraft.js`. New files add coverage and edit no existing test.
**Mutation check for the plan:** temporarily delete the guard (and, separately, add a cancel cleanup) and show the new tests go red, then restore.

### Pitfall 3: Hook-order law and `undefined` while loading
Every new hook is called above `if (loadFailed) return` (line 725). Shell test: assert each hook call's index is below the first early return. Hook bodies must not read `version.*` (undefined until loaded) outside handlers/effects with their own guards.

### Pitfall 4: The amend-redirect branch
See Anti-patterns. The branch is `if (record.kind === 'amend' && batchId !== record.amendingBatchId) { navigate(…, { replace: true }); return; }` [VERIFIED: lines 529-532]. Keep `navigate` inside `useKeptDraft` (it calls `useNavigate()` itself).

### Pitfall 5: Coverage the walk and tests do not have
The walk has no Escape, no route intents (`startTasting`, `startNextVersion`), no amend redirect, no folds, no failed loads, no StrictMode (it runs the production build, where StrictMode checks do not run [CITED: react.dev/reference/react/StrictMode]). The jsdom tests cover route intents (`drafts.test.jsx:659`, `846-936`), the redirect (`596`), failed reads (`791`), Escape (`364`, `581-592`), Show changes (`perStep.test.jsx:312`, `489`). **Two behaviours have no test at all:** `onPenOpenChange` through `RecipePage` (only `router.jsx` and the page mention it; `Shell.importGuard.test.jsx` tests the Shell side) and the `document.title` effect on the page. Both effects stay in the shell, so risk is ordering only, but Phase 10 depends on the first. Recommend two small characterization tests in the first plan, before any cut (new file `RecipePage.shellEffects.test.jsx`, jsdom, same harness).

### Pitfall 6: Process
- `use_worktrees` is true. `app/node_modules` and `app/dist` are gitignored [VERIFIED: app/.gitignore:10-11], so a fresh worktree has no `node_modules`; the build and the tests need an `npm --prefix app ci` (or a symlink) first.
- The walk's Playwright import is an absolute npx-cache path `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs` in both the walk and the harness; it exists now (1.63.0). The cache can be garbage-collected. Plan 01 should have the walk check the file exists at start and fail with a clear line.
- Only one Vite process per workspace (project convention). `vite build` and `vitest run` are one-shot; the walk serves with its own Node static server on an ephemeral port, no Vite.
- Memory notes for execution: worktree record-agent file lists are whitespace-separated, and push `main` after each wave merge (harness forks from `origin/main`).

## Code Examples

### The walk: repaired, built, recorded, compared

```bash
# From the repo root. Copy unchanged; the walk was written for .planning/phases/<phase>/.
cp .planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs \
   .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs
SCRATCH="${TMPDIR:-/tmp}/sprinkles-08"
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir        # never app/dist
PROBE_DIST="$SCRATCH/dist" node .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs record "$SCRATCH/after.json"
node .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs compare \
   .planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk-before.json "$SCRATCH/after.json"
# -> "MATCH 94 snapshots" (exit 0) or DIFF lines (exit 1)
```

### The StrictMode hook-level harness (shape)

```jsx
// @vitest-environment jsdom
// vi.mock('../store/repository.js', …) with getDraft/deleteDraft/saveDraft as vi.fn
function Harness(props) { useKeptDraft(props); return null; }
await act(async () => {
  root.render(<StrictMode><Harness /* version, batches, batchesLoaded: true, loadFailed: false, writer, onRestorePlan: spy … */ /></StrictMode>);
});
await act(async () => { await Promise.resolve(); await Promise.resolve(); });
expect(repository.getDraft).toHaveBeenCalledTimes(1);
expect(onRestorePlan).toHaveBeenCalledTimes(1);
```

## State of the Art

| Old approach | Current approach | Impact |
|--------------|------------------|--------|
| One 1,837-line component | Hooks per job + pure view + shared Sheet component | Phase 10 mounts the same Sheet/pen/draft modules. |
| Shell test with negative assertions (code absent) | Positive assertions (module exists, shell imports it, job lives there) | A split can no longer pass vacuously (PITFALLS Pitfall 8). |

**Deprecated/outdated:** the `ARCHITECTURE.md` claim that line numbers predate Phases 6 and 7 for the page: the page did not change (verified above).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | ROADMAP criterion 4 / CONTEXT "tests whose code moved change only their imports" allows the source-text describes in `RecipePage.test.jsx` to read the new file path (same assertions, different `readFileSync` target, and in two places a read of two files). | Pitfall 1 | If Mark means literal import lines only, no cut that moves JSX or handlers is possible, since those pins read the page text. Confirm before planning; list every re-pointed describe in the plan. |
| A2 | The page keeps roughly 750 to 800 lines after cuts 1 to 7. | Cut table | Cosmetic. |
| A3 | `RecipeSheet` owning `focusedFigureKey`, `useSheetTwoColumns` and the Balance fold is behaviour-neutral. Reasoned from `useFold`'s code and covered by `folds`/`a11y` tests, not run. | Pattern 2 | If a test turns red, fall back to keeping them in the shell. |
| A4 | The walk plus tests are sufficient for the unexercised behaviours (Escape, Import guard, title) because those effects stay in the shell. | Pitfall 5 | A mis-ordered effect could go unnoticed; the two characterization tests mitigate. |

## Open Questions

1. **Does "change only their imports" include re-pointing `readFileSync` targets?** (A1) Recommendation: yes; it is the same kind of edit as an import and no assertion changes. Ask Mark in discuss or record in the plan.
2. **`useDraftWriter` as a second export of `useKeptDraft.js`, or its own file?** Recommend the same file (one module per job, D-03), shell test names both.
3. **Does the optional `useBatchRecording` run?** Decide after cut 7 and a MATCH; it breaks the most pins (table above).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests, walk | ✓ | v24.21.0 | — |
| npm | scripts | ✓ | 11.19.0 | — |
| `app/node_modules` (vite 8.2.2, vitest 5.0.0, jsdom 30.1.1) | build, tests | ✓ in the main checkout | per `package.json` | `npm --prefix app ci` in a fresh worktree |
| playwright-core (npx cache) | walk | ✓ | 1.63.0 at `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/` | `npx -y playwright-core@1.63.0 --version` re-fills the cache |
| WebKit browser | walk | ✓ | `webkit-2359` in `~/Library/Caches/ms-playwright` | `npx playwright-core install webkit` |
| Running Vite process | convention | ✓ none running at start and end of this research | — | kill duplicates |

**Missing dependencies with no fallback:** none.

## Validation Architecture

(`workflow.nyquist_validation` is `false` in `.planning/config.json`; this section is included because the caller asked for it.)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.0, default `node` env; jsdom per file by docblock |
| Config file | `app/vitest.config.js` |
| Quick run command | `npm --prefix app test -- RecipePage sheetView RecipeSheet useKeptDraft` (substring filters; `-- RecipePage` ran 9 files, 255 tests, 1.4 s) |
| Full suite command | `npm --prefix app test` (base `e097454`: 91 files, 2932 tests, about 3 s) [VERIFIED] |
| Walk (browser proof) | build + `record` + `compare` as in Code Examples, about 50 s |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-05 | Each of six jobs lives in its own module and the shell imports it | source-text (node) | `npm --prefix app test -- RecipePage.shell` | ✅ rewrite, Wave 0 |
| EDIT-05 | Maker sees no change | WebKit walk | walk `compare` -> `MATCH 94 snapshots` | ✅ copy, Wave 0 |
| EDIT-05 | All existing page behaviour | jsdom page tests (8 files, 255 tests) | `npm --prefix app test -- RecipePage` | ✅ |
| EDIT-06 | Positive module assertions | shell test | as above | ✅ rewrite |
| D-09 | `sheetView` null baseline | node unit | `npm --prefix app test -- sheetView` | ❌ Wave 0 |
| D-09 | `RecipeSheet` without a stored version | component | `npm --prefix app test -- RecipeSheet` | ❌ Wave 0 |
| D-10 | Restore once under StrictMode (hook + page + save-over re-read) | jsdom | `npm --prefix app test -- strictMode useKeptDraft` | ❌ Wave 0 |
| Gap | `onPenOpenChange`, `document.title` through the page | jsdom | `npm --prefix app test -- shellEffects` | ❌ Wave 0 (recommended) |

### Sampling Rate
- **Per task commit:** the quick command above plus the full suite (3 s, cheap enough to run every time).
- **Per cut (each commit, D-04):** full suite green AND the walk `compare` prints `MATCH 94 snapshots`. The walk is 50 s, so run it after every cut, at minimum after cuts 2, 5, 6, 7 and the last.
- **Phase gate:** full suite green; final walk MATCH against `05-walk-before.json` (or a new before-walk if the base commit moved); `git status` clean.

### Wave 0 Gaps
- [ ] Copy the walk to `.planning/phases/08-…/08-walk.mjs` unchanged. **Keep `walk: '05'` in its output object (line 810: `const output = { walk: '05', engine: 'webkit', width: WIDTH, scenarios };`)** — `compare` diffs the `walk`, `engine` and `width` keys, so renaming it makes every comparison against the old baseline report a DIFF.
- [ ] Re-run base-commit walk and record the MATCH in the plan summary (done once here at `e097454`; redo if `main` moves before execution).
- [ ] `sheetView.test.js`, `RecipeSheet.test.jsx`, `RecipePage.strictMode.test.jsx`, hook-level StrictMode test, `RecipePage.shellEffects.test.jsx`.
- [ ] Shell test rewrite, grown cut by cut (below).

### Shell test (item 6): what it asserts today and the rewrite

Today (195 lines) [VERIFIED: Read]: (a) `RecipePage.jsx` holds none of 12 draft setter names; (b) `stripComments` string-aware cases; (c) `usePenDraft()` and `useRecordDraft()` each called once, before `if (loadFailed) return`; (d) each reset written once in its hook; (e) `penDraft.js`/`recordDraft.js` import only sibling domain modules; (f) the two hooks import only `react` and `../domain/` and never mention `repository`; (g) module functions are exactly `['PageLoadFailed','RecipeNotFound','RecipePage','joinNames']`, exports `['RecipeNotFound','RecipePage']`, page still imports `repository`, and no import is unused; (h) no `dangerouslySetInnerHTML` in six files. Everything is negative or about shape except (c), (d), (g).

Rewrite, one block per cut, in the same commit as the cut:
- **Module table.** `const SIX = { useAnnouncer: 'useAnnouncer.js', useRecipeData: 'useRecipeData.js', sheetView: 'sheetView.js', RecipeSheet: 'RecipeSheet.jsx', useVersionPen: 'useVersionPen.js', useKeptDraft: 'useKeptDraft.js', useRouteIntents: 'useRouteIntents.js' }`. Per entry assert (1) the file exists; (2) it exports the named function; (3) the shell imports it by that specifier; (4) the shell calls it exactly once, before the first early return (for hooks) or renders it once (`<RecipeSheet`); (5) the job lives there, by a marker the shell no longer has.
- **Job markers (positive, then the complement in the shell):** `useRecipeData.js` contains the seven `repository.` read names (`getVersion` ×2, `listBatchesForVersion`, `listDrafts`, `listVersions`, `getRecipe`, `getBatch`, `getAllBatches`) and `setLoadFailed(true)` ×8; shell has none of those calls. `useKeptDraft.js` contains `repository.getDraft(`, `.saveDraft(`, `.deleteDraft(`, `draftMatchesVersion(`, `setTimeout(flushPendingDraft, 250)`, `draftRestoreStartedRef`, and **does not** contain a `return () =>` inside the restore effect (assert the started-ref line is present and a `cancelled` flag is absent from the file: D-10). `useVersionPen.js` contains `usePenDraft()` once, `repository.saveVersion(` ×2, `createChildVersion(`, `saveOverVersion(`. `useAnnouncer.js` contains `5000` ×3. `useRouteIntents.js` contains `startTasting` and `startNextVersion`. `RecipeSheet.jsx` contains `<article className={sheetClassName}`. `sheetView.js` exports `sheetView` and has no `react` import.
- **Import allow-lists (replaces (f)):** `usePenDraft.js`, `useRecordDraft.js` stay `react` + `../domain/` and repository-free; `useAnnouncer.js` `react` only; `sheetView.js` `../domain/` only; the repository may be imported only by `useRecipeData.js`, `useKeptDraft.js`, `useVersionPen.js` and the page (while batch handlers remain).
- **Keep** (a), (b), (d), (e), (g)'s unused-import check applied to every new file, and (h) extended to every new file. Update (g)'s function list to `['PageLoadFailed','RecipeNotFound','RecipePage']` in cut 3.
- A positive assertion must be able to fail: include one fixture case per marker (the file's own `stripComments` fixtures show the idiom).

## Security Domain

`security_enforcement` is enabled (absent or true) [VERIFIED: config.json `"security_enforcement": true`, ASVS level 1]. This phase moves code and adds no input surface, network call, dependency or store shape.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication / V3 Session | no | local app, no accounts |
| V4 Access Control | no | — |
| V5 Input Validation | yes (unchanged) | Notes render as text; no `dangerouslySetInnerHTML` (shell test extended to every new file); restored draft checked by `draftMatchesVersion`, prototype-key draft refused (`drafts.test.jsx:405`) |
| V6 Cryptography | no | — |
| V8 Data Protection / Privacy | yes (unchanged) | No network and no external model calls (TRUST-01); new hooks add none; the walk blocks every non-127.0.0.1 request |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Draft written under the wrong version id | Tampering | `versionId` from `useParams`, page keyed by route; `useDraftWriter(versionId)` closes over it; covered by `drafts.test.jsx` |
| Stale closure restoring a draft against stale data | Tampering | Dependency arrays copied verbatim; hook-level StrictMode test |
| Prototype-key payload in a restored draft | Tampering | unchanged `draftMatchesVersion`; existing test must stay green |

## Project Constraints (from CLAUDE.md)

- Domain math lives in framework-free modules under `app/src/domain/`; the domain suite runs under the `node` environment. `sheetView.js` lives in `ui/` and must import only `../domain/*` (asserted in the shell test); its test has no jsdom docblock.
- Every store access goes through `app/src/store/repository.js`; no other module under `app/src` imports `idb`. New hooks import the repository seam only.
- Every visual value reads a token; no literals in components. The moved JSX has none; do not add inline styles.
- No `dangerouslySetInnerHTML` under `app/src`.
- Every link carries literal `tabIndex={0}`; every button, checkbox, radio renders through `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` (`ui/tabindex-scan.test.js` scans every non-test `.jsx`, so `RecipeSheet.jsx` is covered automatically; `.js` hooks are not scanned and contain no JSX). `RecipeNotFound`'s single `<Link … tabIndex={0}>` must stay in `RecipePage.jsx` (pinned by `RecipePage.test.jsx:999-1010`).
- Agent-facing prose, commit messages and browser-test input are English.
- Device UAT only from `build && preview --host`; one Vite process per workspace; no iPad check this phase (D-07).
- Impeccable and GSD: every edit under `app/` goes through a GSD command; no UI-SPEC, no design gate.
- Small reviewable steps; surface structural choices (the plan states the hook wiring, D-08).
- Mark's List: this research could not read it (no ArtifactData tool in this agent). `todo-split-recipepage` closes when the phase is done.

## Sources

### Primary (HIGH confidence, read or run this session)
- `app/src/ui/RecipePage.jsx` (all 1,837 lines), `RecipePage.shell.test.js`, `usePenDraft.js`, `useRecordDraft.js`, `useBelowDesktop.js`, `PenFoot.jsx` (head), `tabindex-scan.test.js`, `RecipePage.test.jsx` (lines 20-60, 870-1304), `RecipePage.drafts.test.jsx` (1-300, 596-614), mount headers of the other six page tests, `vitest.config.js`, `package.json`
- `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs` and `05-walk-before.json`, `05-VERIFICATION.md`; `.planning/milestones/v1-phases/03.5-…/03.5-probe-harness.mjs`
- `.planning/research/ARCHITECTURE.md`, `PITFALLS.md` (Pitfall 8); `.planning/ROADMAP.md` Phase 8; `.planning/config.json`
- Commands: `git diff --stat ad87a67 HEAD -- app/src/ui` (empty); `npm --prefix app test` (91 files, 2932 tests pass); `npm --prefix app run build -- --outDir <scratch>`; walk `record` x2 at `e097454` and `compare` (MATCH 94, MATCH 94); scratch vitest probes for empty-version rendering, StrictMode page restore (with and without the guard), save-over re-read, and the minimal guard/cancel replica

### Secondary (MEDIUM)
- [CITED: react.dev/reference/react/StrictMode] extra setup+cleanup cycle per effect in development, double render, development-only; does not state ref preservation (that part is empirical)

### Tertiary (LOW)
- none

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, nothing new.
- Architecture (cut ranges, wiring): HIGH, read against the file; `useDraftWriter` is a recommendation, not the only possible break.
- Walk: HIGH, run twice and compared.
- Pitfalls: HIGH for source-text pins and StrictMode (both executed); MEDIUM for A3.

**Research date:** 2026-10-17
**Valid until:** until `main` changes `app/src/ui/RecipePage.jsx` or its tests, or Phase 9 merges (it rewrites the seeded versions the walk dumps).
