---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
reviewed: 2026-10-18T00:00:00Z
depth: standard
files_reviewed: 58
files_reviewed_list:
  - app/scripts/convert-ingredient-seed.mjs
  - app/src/data/batch-2026-08-02.js
  - app/src/data/coconut.js
  - app/src/data/core-problems.js
  - app/src/data/core-scales.js
  - app/src/data/library-decisions.js
  - app/src/data/library-embed.js
  - app/src/data/library-seed-db.js
  - app/src/data/library.js
  - app/src/data/machines.js
  - app/src/data/mexican-chocolate.js
  - app/src/data/mocha.js
  - app/src/data/olive-oil.js
  - app/src/data/pineapple.js
  - app/src/data/seed-catalog.js
  - app/src/data/seed-recipes.js
  - app/src/data/seed-sheet-codes.js
  - app/src/data/standard-base.js
  - app/src/data/strawberry.js
  - app/src/data/styles.js
  - app/src/data/underbelly-light-base.js
  - app/src/domain/axes.js
  - app/src/domain/batch.js
  - app/src/domain/battery.js
  - app/src/domain/catalog.js
  - app/src/domain/draft.js
  - app/src/domain/ingredientSearch.js
  - app/src/domain/lineage.js
  - app/src/domain/newRecipe.js
  - app/src/domain/sheetCode.js
  - app/src/domain/stages.js
  - app/src/domain/versionRow.js
  - app/src/main.jsx
  - app/src/router.jsx
  - app/src/store/catalog.js
  - app/src/store/db.js
  - app/src/store/repository.js
  - app/src/store/seed.js
  - app/src/store/seedTables.js
  - app/src/store/transfer.js
  - app/src/styles/shell.css
  - app/src/ui/AxisMark.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/CatalogContext.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientsPlace.jsx
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/PrintLogPages.jsx
  - app/src/ui/PrintSheet.jsx
  - app/src/ui/PrintSheetPages.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/SheetCodeSearch.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/countWords.js
  - app/src/ui/useBatchRecording.js
  - app/src/ui/useKeptDraft.js
  - app/src/ui/useVersionPen.js
findings:
  critical: 0
  warning: 2
  info: 5
  total: 7
status: issues_found
---

# Phase 9: Code Review Report

**Reviewed:** 2026-10-18
**Depth:** standard
**Files Reviewed:** 58
**Status:** issues_found

## Summary

Reviewed the Phase 9 diff (`b4691b33..HEAD`) across the converter, the seed data, the domain, the store layer, the two new places and the Shell import path. I also ran the shipped seed through the code itself, outside the test suite, to check the cross-file claims:

- The full seed (19 versions, 7 recipes, 111 library entries, 4 seed tables) passes `validateStoreFile` at schema 9.
- It produces no `catalogConflicts` and no `firstDamagedTable` result.
- Every `libraryId` resolves, and every row `ingredient` equals its library entry.
- Every seeded declared scale equals its row in the scales table.
- All 19 stored Sheet codes match the legacy `sheetCode()` derivation, and none clash.
- The 26 original library entries are unchanged apart from the six added coefficient keys. `titratableAcidity` is `msnf × 0.017` for every dairy entry and `null` otherwise.
- All 111 library records pass `validateLibraryRecord`.

Project conventions hold:
- Only `store/db.js` imports `idb`.
- No `dangerouslySetInnerHTML`.
- No literals in the new `shell.css` rules, and every `var(--…)` they use is defined.
- Every new link, button and select carries `tabIndex={0}`, directly or through `Button`.

The transactional work is sound. `putVersionChecked`, `importAll`, `seedTable` and `exportAll` all abort by hand and quiet the queued requests. The Sheet-code and catalog rules are checked twice, before and inside the transaction. The draft fit checks hold up. I found no security vulnerability and no data-loss defect beyond the reset the phase documents. There are two warnings, both in the import path, and five low-severity info items.

## Warnings

### WR-01: Import is not guarded against a throw from the validation gate, so a hostile or odd file fails silently

**File:** `app/src/ui/Shell.jsx:360` (the throw originates at `app/src/store/transfer.js:688`)
**Issue:** `handleImportChange` awaits `importStore(repository, parsed)` with no `try/catch`. `importStore` converts storage failures into `IMPORT_STORAGE_ERROR`, but `validateStoreFile` runs first and is documented as "never throws". `scanForUnsafeKeys` recurses without a depth bound, so a file with deep nesting parses but overflows the stack. I reproduced this:

```
JSON.parse('{"app":"sprinkles","schemaVersion":9,"x":' + '['.repeat(200000) + ']'.repeat(200000) + '}')
validateStoreFile(parsed)  // RangeError: Maximum call stack size exceeded
```

`handleImportChange` then rejects with an unhandled promise rejection. The Import panel shows nothing, so the maker gets no feedback and cannot tell whether anything happened. The scan predates Phase 9. This phase widened the unguarded path: five more validators, `catalogConflicts`, `sheetCodeMessages` and `mergeById` now run inside the same call. The "oversized file" threat T-09-24 is accepted, but this is a different failure, a silent no-feedback outcome, and it is cheap to close.

**Fix:**
```js
let result;
try {
  result = await importStore(repository, parsed);
} catch {
  setImportErrors(['$: the file could not be checked']);
  return;
}
if (!result.ok) { setImportErrors(result.errors); return; }
```
Optionally make `scanForUnsafeKeys` iterative, or bound its depth, so the gate itself never throws.

### WR-02: The Ingredients category filter goes stale after an import, so the select shows "All" while the list stays filtered

**File:** `app/src/ui/IngredientsPlace.jsx:158-165` and `205-222`
**Issue:** `IngredientsList` holds `category` in state and is rendered without a `key`. `IngredientsPlace` replaces `records` after an import (the `storeRevision` effect) but the filter state survives. `categories` is recomputed from the new records. If the import changes the only entry of the selected category to a different category, the selected word is no longer an `<option>`.
- A controlled `<select value={category}>` with no matching option displays the first option, "All".
- `filterLibrary(records, query, category)` still filters on the stale word, so the list is empty and the count reads "0 of N ingredients".
- The visible control contradicts the list. "Clear filters" does recover, because `filtered` is still true.

The import path allows this: `importAll` puts library rows by id (the file wins), and the library validator does not constrain `category`.

**Fix:** reset a category that no longer exists when the records change, for example:
```js
const effectiveCategory = category === ALL || categories.includes(category) ? category : ALL;
const shown = filterLibrary(records, query, effectiveCategory);
const filtered = query.trim() !== '' || effectiveCategory !== ALL;
// and pass effectiveCategory to the select's value
```

## Info

### IN-01: The generated library module's header is stale, and the header line can be broken by a U+2028 in the dataset version

**File:** `app/scripts/convert-ingredient-seed.mjs:694-695` (also `app/src/data/library-seed-db.js:4`)
**Issue:**
- Line 695 writes "the app does not import it yet", but `store/seed.js` now imports `librarySeedDb`. The comment is wrong in the generated file and in the generator that rewrites it.
- Line 694 interpolates the dataset's `meta.version` into a `//` comment. The `.replace(/[\r\n]/g, ' ')` is a no-op, because `JSON.stringify` already escapes `\r` and `\n`. It does not escape U+2028 or U+2029, which are JavaScript line terminators, so such a character ends the comment and the rest of the line is parsed as code. The input is Mark's own offline file, so the risk is low. The guard is ineffective all the same.

**Fix:** change the header to "Imported by store/seed.js.", regenerate, and strip carriage return, line feed, U+2028 and U+2029 in the header guard.

### IN-02: `seed-sheet-codes.js` ends with `,});`

**File:** `app/src/data/seed-sheet-codes.js:27`
**Issue:** The last entry is followed directly by `,});` on the same line, which looks like a generator or hand-edit artifact. It is valid JavaScript but inconsistent with the file's layout.
**Fix:** put `});` on its own line.

### IN-03: The Ingredients and Notebook places import `PAGE_LOAD_ERROR` from the whole RecipePage module

**File:** `app/src/ui/IngredientsPlace.jsx:9`, `app/src/ui/NotebookPlace.jsx:7`
**Issue:** Each place loads the large `RecipePage.jsx` module only to read one string constant. This couples two read-only list pages to the recipe page's import graph.
**Fix:** move `PAGE_LOAD_ERROR` to a small shared module, for example next to `countWords.js`, and re-export it from `RecipePage.jsx` if existing importers need it.

### IN-04: Library and version-row composition figures are only checked for finiteness

**File:** `app/src/store/seedTables.js:80-88`, `app/src/store/transfer.js:135-143`
**Issue:** `validateLibraryRecord` and `validateRow` accept any finite number for every composition field. A fraction field (`fat`, `msnf`, `sugar`, `other`, `emulsifier`, `stabilizer`) of 5 or -1 passes import and boot. Phase 10's picker will copy such an entry into a version row, and the balance math will then produce nonsense with no message. The shipped data is clean: only PAC and POD go negative, as flagged and reviewed in `ingredient-review.md`. This is a malformed-file concern only.
**Fix:** when the next phase wires the picker, add `0 <= value <= 1` for the six fraction fields, leaving `pac` and `pod` unbounded.

### IN-05: Dead ternary branch in the review renderer, and a dangling `aria-controls`

**File:** `app/scripts/convert-ingredient-seed.mjs:526`, `app/src/ui/IngredientsPlace.jsx:259`
**Issue:**
- In the converter, `appKey ? ... : 'an existing entry'` can never take the else branch, because `appKey` is always the non-empty `camelKey(id)`.
- In the place, the row head always sets `aria-controls={detailId}`, but the detail element exists only while the row is open. A closed row points at an id that is not in the DOM.

**Fix:** drop the ternary. Set `aria-controls` only when `isOpen`.

---

_Reviewed: 2026-10-18_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
