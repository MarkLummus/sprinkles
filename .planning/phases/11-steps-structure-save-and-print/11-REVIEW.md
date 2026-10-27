---
phase: 11-steps-structure-save-and-print
reviewed: 2026-10-27T00:00:00Z
depth: standard
files_reviewed: 69
files_reviewed_list:
  - app/src/domain/creation.js
  - app/src/domain/creation.test.js
  - app/src/domain/creationSave.js
  - app/src/domain/creationSave.test.js
  - app/src/domain/creationSteps.js
  - app/src/domain/creationSteps.test.js
  - app/src/domain/diff.js
  - app/src/domain/diff.test.js
  - app/src/domain/draft.js
  - app/src/domain/draft.test.js
  - app/src/domain/firstVersion.js
  - app/src/domain/firstVersion.test.js
  - app/src/domain/lineage.js
  - app/src/domain/lineage.test.js
  - app/src/domain/newRecipe.js
  - app/src/domain/newRecipe.test.js
  - app/src/router.jsx
  - app/src/store/creation-roundtrip.test.js
  - app/src/store/repository.js
  - app/src/store/repository.test.js
  - app/src/store/sheet-code-created.test.js
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - app/src/styles/shell.css
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/CreationFlow.test.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/ui/CreationSetup.jsx
  - app/src/ui/CreationSetup.test.jsx
  - app/src/ui/CreationSteps.jsx
  - app/src/ui/CreationSteps.test.jsx
  - app/src/ui/CreationStructure.test.jsx
  - app/src/ui/EditFlow.test.jsx
  - app/src/ui/EditRoute.jsx
  - app/src/ui/IngredientPicker.jsx
  - app/src/ui/IngredientPicker.test.jsx
  - app/src/ui/IngredientTable.creating.test.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/notebookPaths.js
  - app/src/ui/notebookPaths.test.js
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/NotebookPlace.test.jsx
  - app/src/ui/PrintSheetPages.jsx
  - app/src/ui/PrintSheetPages.test.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipeList.test.jsx
  - app/src/ui/RecipePage.drafts.test.jsx
  - app/src/ui/RecipePage.edit.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - app/src/ui/RecipePage.shell.test.js
  - app/src/ui/RecipePage.stalePen.test.jsx
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/RecipeSheet.test.jsx
  - app/src/ui/Segmented.jsx
  - app/src/ui/Segmented.test.jsx
  - app/src/ui/Shell.creationGuard.test.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/StepReading.jsx
  - app/src/ui/StepReading.test.jsx
  - app/src/ui/useKeptDraft.js
  - app/src/ui/useKeptDraft.test.jsx
  - app/src/ui/useVersionPen.js
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
findings:
  critical: 0
  warning: 5
  info: 6
  total: 11
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-10-27
**Depth:** standard
**Files Reviewed:** 69
**Status:** issues_found

## Summary

Phase 11 adds Save (create and save-over), the edit route, family-guarded drafts, exact BigInt grams folding and per-step row order. The transactions themselves are sound. Every guarded write in `repository.js` (`putVersionChecked`, `createRecipeWithVersion`, `saveFirstVersionOver`, `saveDraft`, `deleteDraft`) reads and writes inside one transaction. Each aborts by hand on every failure path and quiets `done` and the queued requests. I found no path where a refusal commits a partial write. `addGrams` is correct on the cases I traced: leading zeros, a 309-digit side, a sum past the safe limit, a side that does not read, and a blank side. `creationSaveBlock` and `buildCreation` agree with `transfer.js`. The full Vitest suite passes (130 files, 4228 tests), so the findings below are behaviours the suite does not exercise.

The defects cluster in places where a second tab, or a record read later than the writer's, can make the guards in this phase pass when they should refuse:

- A create or edit draft can be written back after another tab has already committed the record it belongs to.
- A kept edit reopened after another tab changed the version silently overwrites that change.
- Save-over discards two fields the editor cannot represent.
- Cancel does not take the save lock.

None is a certain data-loss bug in the single-tab happy path, so there are no BLOCKER findings. WR-01 and WR-02 are the most serious. They are reachable with an ordinary "two tabs open on the same draft" sequence.

## Warnings

### WR-01: A create draft can be written back for a recipe another tab has already saved, leaving an unsaveable "ghost" draft that also hides Edit

**File:** `app/src/store/repository.js:459-483` (`saveDraft`), with `app/src/ui/CreationPage.jsx:629-641`, `app/src/ui/useKeptDraft.js:300-358`, `app/src/ui/CreationRoute.jsx:38-46`
**Issue:** `saveDraft` guards only against a record of another draft family. It never checks whether a version already exists under `record.versionId`. Two tabs can hold the same creation, for example through Resume in a second tab.

1. Tab A saves. `createRecipeWithVersion` stores the recipe and version and deletes the draft.
2. Tab B is still open. Any keystroke makes its persist effect call `saveDraft`. Nothing is stored under that key now, so the guard passes and the `create` record is written again.
3. Alternatively, B presses Save first. It gets `TypeError: version … already exists` and shows "Couldn't save the recipe. Try again". `handleSave`'s catch then calls `writer.resumeDraft()`, which writes the draft back.

The result is a `create` draft whose `versionId` is a stored version.

- `NotebookPlace` shows it as the one kept creation, and `CreationRoute` reopens it (it never compares against stored versions).
- Retrying Save fails forever with the same generic sentence.
- Import stays refused until the maker finds Cancel.
- `editStateFor` returns `null` when `kept.length > 0` and no record is an edit draft, so the saved version's Edit link disappears until the ghost is cancelled.
- Cancel works, but nothing tells the maker why.

**Fix:** Make the guard transactional, as the family guard already is. For `record.kind === 'create'`, have `saveDraft` open `['drafts', 'versions']` and resolve `false` when `versions.get(record.versionId)` exists. In `handleSave`, treat the `already exists` TypeError as "saved elsewhere": discard the draft and navigate to the recipe instead of resuming. As a cheap second line, filter `CreationRoute` and the Notebook's `draftMatchesCreate` on "no stored version has this id".

```js
const tx = db.transaction(['drafts', 'versions'], 'readwrite');
...
if (record.kind === 'create' && (await tx.objectStore('versions').get(record.versionId))) {
  done.catch(() => {});
  tx.abort();
  return false;
}
```

### WR-02: A kept edit draft reopened after another tab saved over the version silently overwrites that save (the "changed" guard is defeated because `expected` is re-read at open)

**File:** `app/src/ui/EditRoute.jsx:51-68`, `app/src/ui/CreationPage.jsx:601-604`, `app/src/store/repository.js:204-247`
**Issue:** `saveFirstVersionOver` protects against a concurrent change only relative to `expected`. `EditRoute` builds `expected` from the records it reads when the route opens, not from the records the edit draft was started against. The draft payload carries no base.

1. Tab A starts editing and types, so an `edit` draft is kept. A is then left.
2. Tab B opens the same version, restores A's kept edit, saves, and deletes the draft. Or B saves over through any other path.
3. Tab A, still open, types again. `saveDraft` finds nothing stored and writes the edit draft again (the same write-back as WR-01). The Notebook now offers "Resume editing" on an already-saved version.
4. Resuming reads the fresh version as `expected` and restores A's old payload. Save passes every check and replaces B's saved content with A's older text, with no warning.

The comment in `EditRoute` says a kept edit "stays reachable until Cancel (D-06)". But Save-over has no way to know that the draft and the stored version have diverged. The in-page `EDIT_CHANGED` path only covers a page that was already open when the other tab saved.

**Fix:** Record what the edit was started from. Keep a `baseFingerprint` (for example a hash of the `canonical()` string of the seed `draftFromVersion` produced) alongside the edit record. It cannot go in the create payload, because `CREATE_DRAFT_KEYS` is closed, so use an extra key on the record that `fitsCreationRecord` allows for the `edit` kind. On open, if the kept record's base differs from the fresh seed's, show `EDIT_CHANGED` (and refuse Save) instead of silently re-basing. The `saveDraft` family guard should also refuse an `edit` write when no version has that id, and ideally when the base no longer matches.

### WR-03: Save-over overwrites two stored iceEd fields the editor cannot represent (an unlisted style name and `servingTemperatureC` when `serveTempC` differs)

**File:** `app/src/domain/creationSave.js:327` (`draftFromVersion`), `:388` (`applyEditToVersion`)
**Issue:** `draftFromVersion` maps `version.iceEd.style` (a name) to a style id by looking it up in `styles`. A name with no match becomes `style: null`. `applyEditToVersion` then writes `iceEd.style: built.iceEd.style` (`null`) and `servingTemperatureC: built.iceEd.servingTemperatureC`, which is derived from `serveTempC`. Two consequences:

- Seeded versions carry `'Standard'` and `'Super-Premium'` (`data/standard-base.js:49`, `data/olive-oil.js`). Neither is in `STYLE_ROWS` (Philadelphia, French, Gelato, Sorbet). The same applies to any style name from an imported store file or an edited styles table. Opening such a first version and pressing Save, with no change to the style, replaces its style name with `null`. This is the "silently lost stored text" class the phase was meant to prevent. Today the seeded Standard and Super-Premium versions already have a batch or a child, so they are not editable. A user's imported equivalent would be.
- `iceEd.servingTemperatureC` is overwritten from `serveTempC`. If a stored version has `serveTempC: null` but `iceEd.servingTemperatureC` set, Save-over wipes it to `null`.

Both are written even when the maker touched neither field.

**Fix:** Overwrite these two fields only when the maker changed them. Compare `draft.style` and `draft.serveTempC` to the values `draftFromVersion` derived from the stored version:

```js
const unchangedStyle = draft.style === draftFromVersion(version, recipe, styles).style;
iceEd: {
  ...(version.iceEd ?? {}),
  style: unchangedStyle ? (version.iceEd?.style ?? null) : built.iceEd.style,
  ...
}
```

Do the same for `servingTemperatureC` and `serveTempC`.

### WR-04: Cancel does not take the save lock, so Save pressed while Cancel's delete is in flight can create the recipe the maker just cancelled

**File:** `app/src/ui/CreationPage.jsx:538-559` (`handleCancel`), `:581-591` (`handleSave`)
**Issue:** `handleSave` returns early on `savingRef.current`, and `handleCancel` returns early on it, but `handleCancel` never sets it. Cancel calls `writer.discardDraft({ final: true })` and awaits an IndexedDB delete. The Save button is not disabled while that is out.

1. Cancel is pressed.
2. Before the delete resolves, Save is pressed. The gate passes and `createRecipeWithVersion` runs.
3. Cancel then navigates to the Notebook with `{ discarded: true }`. The recipe is created anyway, the page is gone, and the Notebook announces a discard.

The mirror ordering (Save then Cancel) is protected. The window is short, but "Cancel ends the creation for good" is the documented contract, and the cost is a surprise stored recipe. The same applies to edit mode, where a Save-over can land after Cancel.

**Fix:** Take the same lock in `handleCancel` before the first await, and release it when the delete fails:

```js
async function handleCancel() {
  if (savingRef.current) return;
  savingRef.current = true;
  setSaving(true);
  try { await writer.discardDraft({ final: true }); }
  catch { savingRef.current = false; setSaving(false); announce(PAGE_LOAD_ERROR); return; }
  ...
}
```

### WR-05: A failed or refused Save is announced only through a status paragraph inserted already filled, while focus is moved to a Save button that does not describe it

**File:** `app/src/ui/CreationPage.jsx:572`, `:711-715`, `:613`, `:639`
**Issue:** After a failed or refused Save, `focusRequestRef.current = 'save'` moves focus to the Save button. The reason (`RECIPE_CREATE_ERROR`, `EDIT_HAS_BATCH`, `EDIT_CHANGED`, and so on) is in a `<p role="status">` that is mounted into the DOM with its text already inside. Screen readers commonly do not announce a live region that appears with content, and the Save button has no `aria-describedby` to the message. A keyboard or screen-reader maker hears the focus land on "Save", hears nothing about the failure, and cannot tell why a typed edit did not save.

**Fix:** Keep the status region mounted (empty) and set its text on failure, or give the message an id and describe the button by it:

```jsx
<Button ref={saveButtonRef} aria-describedby={underSave ? 'create-save-error' : undefined} ...>
...
{underSave && <p id="create-save-error" className="field-error" role="status">{underSave}</p>}
```

## Info

### IN-01: Structure controls stay live while a Save is out and announce changes that were dropped

**File:** `app/src/ui/CreationPage.jsx:404-413`, `:419-431`, `:435-440`, `:455-459`, `:473-480`, `:486-495`
**Issue:** `setCreateDraft` ignores updates while `savingRef` is set, but the row and step handlers (remove, move, place, add step, remove step) still run `announceStructure(...)` and set `focusRequestRef` unconditionally. Their buttons are not disabled when `saving` is true. Pressing "remove" on a row during the Saving… window announces "X removed" for a change that was discarded.
**Fix:** Early-return from these handlers on `savingRef.current`, or pass `disabled={saving}` through `creationRows` and `CreationSteps`.

### IN-02: Stored grams that do not round-trip through the draft grammar block an unchanged Save-over and read "not a number"

**File:** `app/src/domain/creationSave.js:287` (`String(portion.grams)`), `app/src/domain/lineage.js:196-199`
**Issue:** `parseGramsDraft` accepts only `\d+(\.\d{1,2})?`. `String(portion.grams)` for a stored amount with three or more decimals, or an exponent (`1e-7`, `1e+21`), yields text the gate rejects. The maker cannot save an otherwise unchanged first version until they retype the amount, and the message says "not a number" about a number they never typed. `transfer.js` accepts any finite number, so an imported version can carry one. The seed data checked is within two decimals.
**Fix:** In `draftFromVersion`, format with `toFixed(2)` stripped of trailing zeros when the stored value has more than two decimals, or mark that line with a distinct "rounded to 2 decimals" message.

### IN-03: A Sheet-code clash or any other permanent save failure reads as "Try again" forever

**File:** `app/src/ui/CreationPage.jsx:633-641`, `:105`, `:110`
**Issue:** The catch in `handleSave` maps every failure to one sentence. A `SheetCodeError` for a creation's code is derived from the fixed version id, so a retry can never succeed. The same holds for the "version already exists" TypeError (see WR-01). The maker is told to retry something that cannot work.
**Fix:** Distinguish `SheetCodeError` and the already-exists case in the catch, and show a sentence that points to Cancel (or, for "already exists", land on the saved recipe).

### IN-04: Save-over adds a partial `iceEd` to a version that had none

**File:** `app/src/domain/creationSave.js:388`
**Issue:** `iceEd: { ...(version.iceEd ?? {}), style, servingTemperatureC }` yields an object with two keys for a version whose stored `iceEd` was absent. A creation writes four keys (`hardness: null`, `overrunPercent: null`), so readers that destructure the other two see `undefined` where a creation's version has `null`.
**Fix:** Spread over `{ hardness: null, overrunPercent: null }` first.

### IN-05: Duplicated comment block in `StepReading.jsx`

**File:** `app/src/ui/StepReading.jsx:8-23`
**Issue:** The `targetDiffs` comment paragraph appears twice verbatim.
**Fix:** Delete one copy.

### IN-06: `leftUnreadable` is keyed by line and never pruned when a row changes lines

**File:** `app/src/ui/IngredientTable.jsx` (`handleCreatingGramsBlur` / `handleCreatingGramsChange`, `leftUnreadable` Set)
**Issue:** A blur on an empty grams field at `rowId:0` adds that key. Moving the row into a step (new key `rowId:n`) and back out re-shows the old message at once on the unfocused field, because the stale key is still in the Set. The message is accurate (the field is empty) but appears without the maker having left the field.
**Fix:** Remove a row's keys from the Set when its placement changes, or clear the Set entries whose key no longer matches a rendered line.

---

_Reviewed: 2026-10-27_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
