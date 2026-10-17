---
phase: 08-split-the-recipe-page-along-its-jobs
reviewed: 2026-10-17T12:40:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/sheetView.js
  - app/src/ui/useAnnouncer.js
  - app/src/ui/useBatchRecording.js
  - app/src/ui/useKeptDraft.js
  - app/src/ui/useRecipeData.js
  - app/src/ui/useRouteIntents.js
  - app/src/ui/useVersionPen.js
  - app/src/ui/RecipePage.shell.test.js
  - app/src/ui/RecipePage.shellEffects.test.jsx
  - app/src/ui/RecipePage.strictMode.test.jsx
  - app/src/ui/RecipeSheet.test.jsx
  - app/src/ui/sheetView.test.js
  - app/src/ui/useKeptDraft.test.jsx
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 8: Code Review Report

**Reviewed:** 2026-10-17T12:40:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

The split was reviewed against the base commit 78e962d by reading the base `RecipePage.jsx` in full and
tracing each moved block into its new module. I found no behaviour drift.

- **Effect order.** The data effects, title effect, restore, persist, pagehide, the two route intents, Escape
  and `onPenOpenChange` run in the base order. The title effect now runs after all the data effects instead
  of between the recipe and cited-batch reads. They are independent, so this is not observable.
- **Dependency arrays.** Every one is unchanged: restore `[version, batchesLoaded, loadFailed]`, persist
  with its eight dependencies, both route intents, Escape.
- **Cancellation flags.** The `cancelled` flags are intact in `useRecipeData`. The restore still has the
  started-ref guard and no cancellation flag.
- **Restore callbacks.** `restorePlan` and `restoreRecord` run the same statements in the same order as the
  inline base code.
- **Hook rules.** All hooks in `RecipePage` sit above the first early return. `RecipeSheet` has no early
  return.
- **Handlers.** Every moved handler is byte-equivalent apart from `openBatch`, which is now computed by
  `openBatchFor` (same rule as base) because the handler runs before the shell's early returns.
- **sheetView.** `sheetView` matches the base derivations. The added `&& baseline` guard on `penDiff`
  and the baseline-null branch of `baselineStepNumbers` are no-ops for the editing page, which passes `version`.
- **Conventions.** There is no `dangerouslySetInnerHTML`, no store import outside the repository seam, and no
  literal CSS value in any new module. The only link, in `RecipePage.jsx`, carries `tabIndex={0}`.
  `RecipeSheet.jsx` renders no raw link or button. `sheetView.js` imports only `../domain/`.
- **Tests.** The full suite passes (96 files, 2998 tests). I ran two mutations on a scratch copy:
  1. Removing the restore guard turns `useKeptDraft.test.jsx` (both cases) and the page-level strict test red.
  2. Breaking the `IngredientsHead` handler wiring turns three `RecipePage.perStep` tests red.

  So the new tests discriminate. The `RecipePage.shell.test.js` checks (JOBS, HOOK_ORDER, seven broken
  fixtures) were added, not removed. Two `RecipePage.test.jsx` source-text pins were repointed in a way that
  loses some precision (WR-01).

One latent defect in the new reusable `RecipeSheet` API (WR-02) and three smaller items follow.

## Warnings

### WR-01: Test I's source-text pin no longer proves what its name says after the move to RecipeSheet

**File:** `app/src/ui/RecipePage.test.jsx:1289-1304` (the 261002-wn1 describe, repointed in this phase)
**Issue:** The case is titled "handed to both VersionRow and IngredientsHead". It counts
`onToggleShowChanges={handleToggleShowChanges}` and expects 2. Before the split those two sites were
VersionRow and IngredientsHead. After the split `RecipePage.jsx` alone holds two such sites: VersionRow and
`<RecipeSheet onToggleShowChanges={handleToggleShowChanges}>`. IngredientsHead now receives
`onToggleShowChanges={onToggleShowChanges}` inside `RecipeSheet.jsx`, which the regex does not match. The
count is satisfied without IngredientsHead being wired, so the pin is weaker than before.

The "exactly one `function handleToggleShowChanges(`" half is also now only a statement about the shell.

I confirmed by mutation on a scratch copy that replacing the handler in `RecipeSheet.jsx` with a no-op leaves
this describe green. It is caught only by the behavioural `RecipePage.perStep` cases, which do not exercise
the below-724 heading control.

**Fix:** Pin the new three-hop wiring explicitly:
```js
expect(source.match(/onToggleShowChanges=\{handleToggleShowChanges\}/g)).toHaveLength(2); // VersionRow, RecipeSheet
expect(sheetSource).toMatch(/<IngredientsHead[^>]*onToggleShowChanges=\{onToggleShowChanges\}/);
```
where `sheetSource` is the comment-stripped text of `RecipeSheet.jsx` read on its own. Retitle the case to
"VersionRow and RecipeSheet, which hands it to IngredientsHead".

### WR-02: RecipeSheet advertises a nullable `draft` and then dereferences it unguarded

**File:** `app/src/ui/RecipeSheet.jsx:26,171`
**Issue:** The component header and prop defaults say a caller with no stored version and no baseline can
mount it (`draft = null`, `parentVersion = null`, ...). Line 171 reads
`mode === 'recording' ? draft.stepChanges : ...`. A caller that passes `mode="recording"` with the default
`draft` (null) throws a TypeError during render.

`RecipePage` always supplies `draft`, so nothing breaks today (the base had the same expression). But Phase
10's creation editor is the stated second consumer, and the default invites exactly that call.
`RecipeSheet.test.jsx` covers only `reading` and `developing`.

**Fix:** Guard the read and add a `recording` case to `RecipeSheet.test.jsx`:
```jsx
stepChanges={mode === 'recording' ? (draft?.stepChanges ?? {}) : evidenceBatch ? evidenceBatch.churn.stepChanges : {}}
```

## Info

### IN-01: Stale comments left behind by the move

**File:** `app/src/ui/useBatchRecording.js:319-321`, `app/src/ui/RecipePage.jsx:214-216`
**Issue:**
- `useBatchRecording.js`: `handleStartTasting` says openBatch is computed locally "because the shell computes
  its own only after its early returns". The shell no longer computes one; it reads `view.openBatch` from
  `sheetView`. The comment describes a state that no longer exists.
- `RecipePage.jsx`: the Escape effect comment says it reads "the same two dirty checks the draft persistence
  above reads" and refers to "isDraftDirty's own baseline/blank comparisons above". The persistence effect now
  lives in `useKeptDraft.js`, not above.

**Fix:** Reword the first to "the same rule sheetView uses, computed here because this handler runs outside
the sheet's render". Reword the second to point at `useKeptDraft`.

### IN-02: `joinNames` is now a third copy

**File:** `app/src/ui/sheetView.js:19-23`
**Issue:** The comment acknowledges that GraduatedRule and BasisNote each keep their own copy of this helper.
Pre-existing duplication, not introduced as a bug. The split is a natural moment to export one copy from a
shared module.
**Fix:** Export a single `joinNames` and import it in the three places, or leave a tracked follow-up.

### IN-03: Source-text markers in the shell test are tightly coupled to exact call counts

**File:** `app/src/ui/RecipePage.shell.test.js` (JOBS: `['5000', 3]`, `['setLoadFailed(true)', 8]`,
`['announce(BATCH_SAVE_ERROR)', 5]`, `['repository.deleteDraft(versionId)', 3]`)
**Issue:** These pin literal occurrence counts. Adding a ninth store read, a fourth announce timer, or a
sixth batch-save failure path turns a named case red even though nothing is wrong. That matches the house
style and is intentional per the file header, but the counts are not explained inline (for example, why
exactly 8 `setLoadFailed(true)` sites).
**Fix:** Add a one-line note beside each count naming the sites it counts, so a future editor knows whether a
red case is drift or an expected bump.

---

_Reviewed: 2026-10-17T12:40:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
