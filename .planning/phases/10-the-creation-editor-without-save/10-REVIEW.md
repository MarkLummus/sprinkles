---
phase: 10-the-creation-editor-without-save
reviewed: 2026-10-20T00:00:00Z
depth: standard
files_reviewed: 37
files_reviewed_list:
  - app/src/domain/creation.js
  - app/src/domain/creation.test.js
  - app/src/domain/lineage.js
  - app/src/domain/lineage.test.js
  - app/src/domain/recipe.js
  - app/src/domain/recipe.test.js
  - app/src/router.jsx
  - app/src/styles/notebook.css
  - app/src/styles/shell.css
  - app/src/ui/Authored.jsx
  - app/src/ui/CreationFlow.test.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/ui/CreationRoute.jsx
  - app/src/ui/CreationSetup.jsx
  - app/src/ui/CreationSetup.test.jsx
  - app/src/ui/FormulationNote.jsx
  - app/src/ui/Headnote.jsx
  - app/src/ui/IngredientPicker.jsx
  - app/src/ui/IngredientPicker.test.jsx
  - app/src/ui/IngredientsPlace.jsx
  - app/src/ui/IngredientTable.creating.test.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/notebookPaths.js
  - app/src/ui/notebookPaths.test.js
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/NotebookPlace.test.jsx
  - app/src/ui/PageNotice.jsx
  - app/src/ui/PageNotice.test.jsx
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/RecipeSheet.test.jsx
  - app/src/ui/Segmented.jsx
  - app/src/ui/Segmented.test.jsx
  - app/src/ui/Shell.creationGuard.test.jsx
  - app/src/ui/Shell.flyout.test.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/useKeptDraft.js
  - app/src/ui/useKeptDraft.test.jsx
findings:
  critical: 0
  warning: 3
  info: 8
  total: 11
status: issues_found
---

# Phase 10: Code Review Report

**Reviewed:** 2026-10-20
**Depth:** standard
**Files Reviewed:** 37
**Status:** issues_found

## Summary

Phase 10 adds the creation editor (`/notebook/new`), the Notebook's New recipe entry and draft row, the ingredient picker, the Style/Scales/Problems setup column, the kept-draft "final discard" path, and an Import refusal while a creation is kept. The full Vitest suite passes (120 files, 3728 tests). Project conventions hold on everything I checked: `domain/creation.js` imports only domain modules, every store access goes through `repository`, no `dangerouslySetInnerHTML` was added, every new `Link`/`select` carries `tabIndex={0}`, every new button goes through `Button`, and every CSS `var(--...)` the diff introduces is defined in `tokens.css`.

I found no crash, data-loss or security defect. The final-discard logic in `useKeptDraft.js` (`endedRef`, the failed-delete restore of persistence) traces correctly through Cancel success, Cancel failure, a late edit during the delete, and unmount. The three warnings are robustness gaps in the new Import refusal, the Notebook's new dependency on the drafts store, and silent target-band rejection. The info items are stale or dead code and small accessibility and naming points.

## Warnings

### WR-01: Import refusal trusts a possibly stale "present" and never refreshes it

**File:** `app/src/ui/Shell.jsx:427` and `app/src/ui/Shell.jsx:470`
**Issue:** `creationStateRef` is refreshed only on a pathname or route-state change and after a `'unknown'` refusal. Once it reads `'present'`, `chooseImportFile` refuses at line 427 without re-reading the drafts. If the creation was cancelled in another tab or window (the code itself names "another tab" as a case it handles), this tab keeps refusing Import with "Cancel the new recipe draft before importing." until the maker navigates. Line 470 has the same weakness: `creationStateRef.current === 'present' || records.some(...)` lets a stale ref veto an import even though `records` was just read fresh, which contradicts the comment above it that says an older sight cannot be trusted over a fresh read.
**Fix:** Treat the fresh read as authoritative in `handleImportChange`, and re-read after a `'present'` refusal so the next click sees the truth.
```js
// handleImportChange
if (records.some(draftMatchesCreate)) {
  refuseImport(CREATION_IMPORT_BLOCKED_STATUS);
  return;
}

// chooseImportFile
if (creationState === 'present') {
  refuseImport(CREATION_IMPORT_BLOCKED_STATUS);
  readCreationState(); // the next click sees the store, not this click's belief
  return;
}
```
Skip the re-read when `creationStateFromRoute` supplied the word (the `/notebook/new` pathname or the Cancel landing), since the route is then the better source.

### WR-02: Notebook place now fails entirely when the drafts read fails

**File:** `app/src/ui/NotebookPlace.jsx:52`
**Issue:** `repository.listDrafts()` was added to the same `Promise.all` as `getAll`, `getAllBatches` and `listRecipes`. Before Phase 10 the Notebook did not touch drafts. Now any rejection from the drafts store sets `failed` and replaces the whole recipe list with "Could not open the local store. Try reloading.", even though the recipes themselves read fine. The draft row is an optional extra, so its failure should not take the place down.
**Fix:** Degrade the drafts read on its own so the list still draws.
```js
Promise.all([
  repository.getAll(),
  repository.getAllBatches(),
  repository.listRecipes(),
  Promise.resolve().then(() => repository.listDrafts()).catch(() => []),
])
```
`handleStart` already re-reads the drafts and announces on failure, so offering New recipe in this state is safe.

### WR-03: Target-band fields silently reject input the maker can plausibly type

**File:** `app/src/domain/creation.js:180-191` (reads `lineage.js:201`), `app/src/ui/CreationSetup.jsx:193-211`
**Issue:** `creationTargets` parses each band end with `parseGramsDraft`, whose pattern is `/^\d+(\.\d{1,2})?$/`: digits with at most two decimals, no surrounding whitespace, no comma. A band end of `12.345`, `10,5` (a comma decimal pad, with `inputMode="decimal"`) or `10 ` (trailing space) fails the pattern, so the whole band is dropped from the Sheet's targets and its figure reads "no target set". The band inputs have no `FieldFeedback`, so nothing tells the maker why. The grams fields in the same editor do show an error line for the same kind of fault. A style's own bands go through `String(band[0])`, so a seeded band with more than two decimals, or one that stringifies in exponent form, would be dropped the same way. The grams pattern was designed for grams, not for balance bands.
**Fix:** Either give the band ends a short "not a number" line, as the grams fields have, or parse them with a band-appropriate rule (trim, accept a comma). If the grams parser is deliberately shared, say so in the doc comment and add the feedback line.

## Info

### IN-01: Stale comment says a cleared creation is deleted

**File:** `app/src/ui/useKeptDraft.js:192-196`
**Issue:** The comment says that when the maker clears the draft back to blank, the persist effect "deletes it". Phase 10 changed this (lines 238-246, D-04a): a creation is overwritten, never deleted, by an edit. The `!record` branch at line 266 is now unreachable for `creating`.
**Fix:** Reword to "the persist effect writes the typed draft over it", and drop the blank-draft clause.

### IN-02: `isCreateDraftDirty` is dead in production code

**File:** `app/src/domain/draft.js:558-577`
**Issue:** `useKeptDraft.js` no longer imports `isCreateDraftDirty`, and nothing under `app/src` outside tests calls it (verified by grep). Phase 10 orphaned it. Its doc ("A blank draft is not kept") now contradicts the shipped behaviour.
**Fix:** Remove it and its tests, or note in its header that it is kept for a named later phase.

### IN-03: A failed Cancel announces a message about opening the store

**File:** `app/src/ui/CreationPage.jsx:232`
**Issue:** When the delete fails, the notice reads "Could not open the local store. Try reloading." The failure was a delete, and a reload would reopen the draft the maker tried to discard. `PAGE_LOAD_ERROR` is also imported from `RecipePage.jsx`, which pulls the whole recipe page module into this file for one string.
**Fix:** Use a message that names the action (for example "Could not discard the draft. Try again."), kept in the domain or as a local constant.

### IN-04: Cancel has no re-entry guard

**File:** `app/src/ui/CreationPage.jsx:228-243`
**Issue:** Pressing Cancel twice before the first delete resolves runs `discardDraft({ final: true })` twice and navigates twice. Both runs delete the same key and `navigate(..., { replace: true })` is idempotent, so nothing breaks today. The second call's `held` is already null, and if the first delete failed the two failure handlers interleave.
**Fix:** Add a `cancellingRef` (as `NotebookPlace` does with `startingRef`) and return early while it is set; clear it on failure.

### IN-05: Picker repeats a landmark name and speaks twice on an empty result

**File:** `app/src/ui/IngredientPicker.jsx:57` and `app/src/ui/IngredientPicker.jsx:87,97`
**Issue:** The picker's `<form role="search" aria-label="Ingredients">` sits inside the Sheet's `<section aria-label="Ingredients">`, so two landmarks share one name. When nothing matches, the polite count (`role="status"`) and "Not in the library yet" (`role="status"`) both announce at once.
**Fix:** Label the search form "Find an ingredient". Drop `role="status"` from the "Not in the library yet" line, or fold its words into the count.

### IN-06: `record` shadows the component prop in two places

**File:** `app/src/ui/CreationPage.jsx:107` and `app/src/ui/CreationPage.jsx:187`
**Issue:** The component takes a `record` prop (the stored draft). `libraryById` maps `(record) => ...` over library records, and `handlePick = (record) => ...` takes a library record. Both are correct today, but a later edit that wants the prop inside either closure would silently read the wrong object.
**Fix:** Rename the inner ones to `libraryRecord`.

### IN-07: Every creation row's remove control has the same accessible name

**File:** `app/src/ui/IngredientTable.jsx:683`
**Issue:** `RemoveRowControl` is rendered without `lineName`, so each row's button is named just "remove". A screen-reader user tabbing the table hears "remove" repeatedly. The `<tr>` carries an `aria-label`, but a button in a rotor or controls list does not.
**Fix:** Pass `lineName={row.ingredientName}` so the name reads "remove Whole milk". This changes only the creation branch.

### IN-08: Style menu shows "No style" for a kept style id the catalog does not hold

**File:** `app/src/ui/CreationSetup.jsx:149-162`
**Issue:** `value={createDraft.style ?? ''}` with no matching `<option>` makes the browser show the first option, "No style", while `createDraft.style` is non-null, the Clear control is drawn, and the bands from that style remain. `draftMatchesCreate` accepts any non-empty style id, so a kept draft can reach this state if the catalog's styles ever change under it.
**Fix:** When `catalog.styles` does not contain `createDraft.style`, render a disabled option for it, or call `clearStyle` on restore.

---

_Reviewed: 2026-10-20_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
