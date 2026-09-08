---
phase: 03-develop-the-next-version
reviewed: 2026-09-08T00:08:56Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - app/src/domain/advisories.js
  - app/src/domain/advisories.test.js
  - app/src/domain/diff.js
  - app/src/domain/diff.test.js
  - app/src/domain/stepNumbers.js
  - app/src/domain/stepNumbers.test.js
  - app/src/domain/uses.js
  - app/src/domain/uses.test.js
  - app/src/router.jsx
  - app/src/styles/app.css
  - app/src/styles/tokens.css
  - app/src/ui/BatchMargin.jsx
  - app/src/ui/BatchMargin.test.jsx
  - app/src/ui/Headnote.jsx
  - app/src/ui/Headnote.test.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
  - app/src/ui/VersionStrip.jsx
  - app/src/ui/VersionStrip.test.jsx
findings:
  critical: 0
  warning: 6
  info: 4
  total: 10
status: issues_found
---

# Phase 03: Code Review Report (gap-closure re-review, plans 03-06 through 03-10)

**Reviewed:** 2026-09-08T00:08:56Z
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

Scope is the fourteen commits since `85a02b5` (plans 03-06 to 03-10): the one-pen interlock (`derivePenState`, `openPen`/`penReason` threading, route-keyed `RecipePage`), the corrected dirty checks, per-field step-text flags with absent/empty normalisation, the D-UAT-3 coverage cue, the identity-based table column sizing, and the derived step-position module (`stepNumbers.js`) threaded through advisories, the table and the method. The full suite passes (25 files, 486 tests).

Convention checks: no `dangerouslySetInnerHTML` under `app/src`; no `idb` import outside `store/db.js`; no listed domain module imports React, the DOM or the store; every new stylesheet rule (`.pen-hint`, `.ingredient-table__col-*`, the select shrink pair) and the new `--col-step` token read through custom properties. Router keying and the pen-state derivation are sound, and the domain modules (`stepNumbers.js`, the `diff.js` and `uses.js` additions) are correct against the fixtures I traced.

The defects are all at the UI/domain seam. Two are new to this diff: the show-changes step cell now goes blank for a row still allocated to a step the child removed (where the reading state says "unallocated"), and both `Method` and `IngredientTable` default their step-number maps to `null` while their own contract comments say that is the expected value outside the pen, which silently renders every step reference as "unallocated" or a blank number. One is a contract gap: `diff.js` documents and tests a `textFrom: null` step descriptor that `Method.jsx` dereferences unguarded. Three are pre-existing defects in listed files that the new work touches or compounds (the `?changes` gate reading `showingChanges` rather than `changeDiff`, `buildPenFields` coercing a blank grams string to `0`, and the label-keyed target diff read by index in two consumers); each is labelled as such so the fixer can triage.

No security findings: all maker text renders as React text nodes, and the only impure calls (`crypto.randomUUID`, `new Date`) sit in the two save handlers as before.

## Warnings

### WR-01: `Method.jsx` dereferences `stepDiff.textFrom` where `diff.js` documents it as `null`

**File:** `app/src/ui/Method.jsx:141-142`, `178`, `315-316`, `342`
**Issue:** `buildStepDiff` returns `{ textFrom: null, leadInChanged: true, purposeChanged: true, ... }` for a step present in `current` but absent from `baseline` (`diff.js:101-116`), and `diff.test.js:315-335` pins that shape. Both `Method` branches then compute `stepDiff.purposeChanged && stepDiff.textFrom.purpose !== ''` and, when `leadInChanged` is true, render `stepDiff.textFrom.leadIn` — a `TypeError` on `null`. The pen never adds a step, so in-app authoring cannot produce this today; an imported store file or any future step-adding feature will, and the domain contract already says it may. A component that reads a documented shape must handle all of it.
**Fix:** Guard on `textFrom` once per branch, so an unmatched step renders its own prose with nothing struck beneath:
```jsx
const textFrom = stepDiff.textFrom;
const showStruckBeneath = textFrom != null && (stepDiff.leadInChanged || stepDiff.instructionChanged);
const showPurposeStruck = textFrom != null && stepDiff.purposeChanged && textFrom.purpose !== '';
const showAsideStruck = textFrom != null && stepDiff.asideChanged && textFrom.aside !== '';
```
Apply at both sites (pen: 140-142; show-changes: 314-316).

### WR-02: A `null` step-number map is documented as the normal outside-the-pen value, but rendering with it produces "unallocated" for every row and blank margin numbers

**File:** `app/src/ui/IngredientTable.jsx:374-380`, `519`; `app/src/ui/Method.jsx:83-89`, `105-109`, `118`, `442`
**Issue:** Both components default `currentStepNumbers = null` and their prop comments say "null wherever neither the pen nor show-changes applies". But the clean reading path *requires* the map: `formatStepReferences(null, null, row.step, row.splitStep)` returns `'unallocated'` for every row (line 41), `displayNumberFor(step)` returns `null` so the margin number renders empty (line 147/321/400), and the recording branch's `fieldLabel(step, false, ...)` yields `aria-label="Step null, what was done differently"` (line 118 with 442). `RecipePage` happens to always pass a non-null `currentStepNumbers` (line 469), so production is correct, but the contract is inverted: the safe default is the one that produces wrong output silently, and the existing reading-mode tests (`IngredientTable.test.jsx:135`, `Method.test.jsx:20`) already render that wrong output without asserting on it. A future caller (the Phase 4 print route, for instance) that follows the comment will ship a table reading "unallocated" throughout.
**Fix:** Either derive the map inside the component when the caller does not supply one, or make it required. The first keeps the caller surface small:
```jsx
// IngredientTable / Method, before use:
const currentMap = currentStepNumbers ?? displayNumbers(draftVersion ? draftVersion.method : stepsOrRowsSource);
```
For `Method` the source is `steps` (already the method being shown); for `IngredientTable` it would need the method passed in, so requiring the prop (and throwing or logging on `null` in dev) is the simpler honest option. In either case, correct the two prop comments to say the current map is required in every mode and only `baselineStepNumbers` may be `null`.

### WR-03: The `?changes` URL parameter switches the table and method to unfiltered rows/steps before, or without, a diff to render them with

**File:** `app/src/ui/RecipePage.jsx:989`, `1013`, `1023`
**Issue:** `rows`, `steps` and `staleFlagVisible` are gated on `showingChanges` (the raw search-param presence), while every consumer's show-changes branch is gated on `diff != null` / `changeDiff != null`. Whenever the two disagree — on every load of a child with `?changes` in the URL until the parent read resolves (`parentVersion` starts `null`, line 325), and permanently when the parent record cannot be read or the version has no parent — the components fall into their *reading* branches with unfiltered data: a removed row renders un-struck with a share computed against the active mass, and a removed step renders as an ordinary step with, since 03-10, an empty margin number and no "removed" label (its key is absent from `currentStepNumbers` and `baselineStepNumbers` is `null` at line 470). The gate itself predates this diff; the blank-number symptom is new.
**Fix:** Gate on the diff, which is the fact the consumers actually branch on:
```jsx
const isShowingChanges = changeDiff != null;
...
rows={mode === 'developing' || isShowingChanges ? version.rows : readingVersion.rows}
...
steps={mode === 'developing' || isShowingChanges ? version.method : readingVersion.method}
staleFlagVisible={mode === 'developing' || isShowingChanges}
```
and pass `showingChanges={isShowingChanges}` to `IngredientTable`/`Method`.

### WR-04: In show-changes, the step cell reads blank for a row still allocated to a step the child removed, while the same row reads "unallocated" in the clean reading — and the split step on the same cell uses the opposite numbering policy

**File:** `app/src/ui/IngredientTable.jsx:221-231`, `272-276`, `461-462`, `494`
**Issue:** `DiffStepCell` resolves `stepTo` through `safeDisplayNumberOf(currentStepNumbers, ...)` only (line 224). A row whose allocation did not change but whose step the child removed (the seed's four step-2 rows after removing step 2, say) has `stepChanged: false` and no current position, so the cell renders nothing and `rowDiffAccessibleLabel` adds no step phrase (line 272 requires `stepChanged`). The clean reading of the same version renders "unallocated" for that row (line 41). Two states of one page give a reader two different answers for the same fact. Meanwhile the `splitStep` on the same cell (line 461-462, 494) resolves through `resolveStepNumber` with the baseline fallback, so a removed split step prints the parent's number beside a blank primary — exactly the "blended" numbering the file's own comment at lines 20-24 says a show-changes site must never do.
**Fix:** Make the show-changes cell agree with the reading cell when the current side has no position, and make the split step follow the primary's policy:
```jsx
function DiffStepCell({ rowDiff, currentStepNumbers, baselineStepNumbers }) {
  const changed = rowDiff.removed || rowDiff.stepChanged;
  const stepFromDisplay = safeDisplayNumberOf(baselineStepNumbers, rowDiff.stepFrom);
  const stepToDisplay = safeDisplayNumberOf(currentStepNumbers, rowDiff.stepTo);
  return (
    <>
      {changed && stepFromDisplay != null && <span className="struck-value">{stepFromDisplay}</span>}
      {stepToDisplay ?? 'unallocated'}
    </>
  );
}
```
and at line 461-462 resolve `splitStepDisplay` with `safeDisplayNumberOf(currentStepNumbers, row.splitStep)` in the show-changes branch (dropping the reference when `null`, as `formatStepReferences` does), so the two references in one cell name the same side. Add the missing accessible phrase for the unallocated case in `rowDiffAccessibleLabel`.

### WR-05: `buildPenFields` coerces a blank or whitespace-only grams string to `0 g` on save, diverging from the pen's own live preview (pre-existing, outside the 03-06..03-10 hunks)

**File:** `app/src/ui/RecipePage.jsx:892-895` (compare `423`)
**Issue:** `draftVersion` keeps `row.grams` when `draftRow.grams === ''` (line 423), but `buildPenFields` tests only `Number.isFinite(parsed)` — and `Number('')`, `Number('  ')` are both `0`, finite. Two consequences: (a) a row the maker removed and then cleared (the grams field stays editable on a removed row, `GramsCell` comment lines 107-110) passes `blockedSaveMessage` (removed rows are skipped, `lineage.js:157`) and is saved with `grams: 0`, so the amount the pen previewed is lost the moment a later version restores that row; (b) a whitespace-only grams on an active row passes `blockedSaveMessage` (`'  ' !== ''`, `lineage.js:158`) and is saved as `0 g` with no message. The preview and the record disagree on the same keystroke.
**Fix:** Use the same predicate at both sites, and trim before the blank check in `blockedSaveMessage`:
```js
// RecipePage.jsx, buildPenFields:
const raw = draftRow.grams.trim();
const parsed = Number(raw);
grams: raw !== '' && Number.isFinite(parsed) ? parsed : row.grams,
```
```js
// lineage.js, blockedSaveMessage:
if (draftRow.grams === undefined || draftRow.grams.trim() === '') {
```

### WR-06: Target chips are diffed by label but consumed by index, so a label collision mid-edit strikes the wrong chip (pre-existing; now three sites disagree)

**File:** `app/src/domain/diff.js:84-99`; `app/src/ui/Method.jsx:186`, `349`; `app/src/ui/RecipePage.jsx:117-122`
**Issue:** `buildTargetDiff` keys on `label`, de-duplicates labels, and appends baseline-only labels at the end. `Method.jsx` reads `stepDiff.targets[index]` positionally against `draftStep.targets`/`step.targets`, and the 03-07 dirty check `targetsDiffer` compares by index, explicitly "matching handleChangePenStepTarget's own matching rule (by index, not by label)". `RecipePage.jsx:798-801` acknowledges that labels collide while the maker types. Trace the seed's step 8 (`temp 4 °C`, `blend 45 s`) with the maker retyping chip 0's label to `blend`: the diff collapses to `[{blend, from '45 s', to '45 s', changed false}, {temp, from '4 °C', to null, changed true}]`, so chip 0 (value `4 °C`, actually changed) gets no strike and chip 1 (unchanged) is struck with `temp 4 °C`. Deleting a chip has the same misalignment for every chip after it.
**Fix:** Diff targets by position, which is the identity every writer and reader already uses:
```js
function buildTargetDiff(currentTargets, baselineTargets) {
  const length = Math.max(currentTargets.length, baselineTargets.length);
  return Array.from({ length }, (_, index) => {
    const current = currentTargets[index] ?? null;
    const base = baselineTargets[index] ?? null;
    const from = base ? base.value : null;
    const to = current ? current.value : null;
    return {
      label: (current ?? base).label,
      labelFrom: base ? base.label : null,
      from,
      to,
      changed: from !== to || (base && current && base.label !== current.label),
    };
  });
}
```
Update `diff.test.js:338-361` accordingly (the "chip present on only one side" case becomes a length difference).

## Info

### IN-01: `.pen-hint` duplicates `.batch-margin__hint` declaration for declaration

**File:** `app/src/styles/app.css:869-873` (vs `857-861`)
**Issue:** The two rules are byte-identical (`font-family`, `font-size`, `margin`). The comment justifies a new name; it does not need a second copy of the values.
**Fix:** `.batch-margin__hint, .pen-hint { ... }` as one rule, or have `BatchMargin`'s tasting hint use `pen-hint` too.

### IN-02: `coverageSentence` is not null-safe on `currentStepNumbers`, unlike every other step-number read in the file

**File:** `app/src/ui/Method.jsx:22`, `31`
**Issue:** `displayNumberFor` guards `currentStepNumbers ? ... : null`; `coverageSentence` calls `displayNumberOf(currentStepNumbers, step.n)` directly and throws `Cannot read properties of null (reading 'has')` when the map is absent and a removed step has covered rows. The map is required in the pen (see WR-02), so this is a consistency gap rather than a reachable crash from `RecipePage`.
**Fix:** Route through the same guard (`displayNumberFor`-style) or resolve WR-02 by making the map required and drop the guard from `displayNumberFor` too, so the file has one policy.

### IN-03: The pen's step cell renders an empty `struck-value` span when the baseline has no position for the row's step

**File:** `app/src/ui/IngredientTable.jsx:145`, `150`
**Issue:** `baselineStepDisplay` is `null` when `row.step` names a step already removed in the record the pen opened on; reallocating that row then renders `<span class="struck-value"></span>` — an empty element with a strike margin and nothing struck.
**Fix:** `{changed && baselineStepDisplay != null && <span className="struck-value">{baselineStepDisplay}</span>}`, matching `DiffStepCell`'s guard.

### IN-04: Target chips keyed by `label` in the show-changes and reading branches collide when two chips share a label (pre-existing)

**File:** `app/src/ui/Method.jsx:351`, `420`
**Issue:** The pen branch keys by `index` (line 188) because labels are editable and may collide; the other two branches key by `target.label`, which produces React duplicate-key warnings and unstable reconciliation for a saved step carrying two same-labelled chips.
**Fix:** Key all three by `index` — the chips are a positional list (see WR-06).

---

_Reviewed: 2026-09-08T00:08:56Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
