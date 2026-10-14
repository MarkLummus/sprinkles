---
phase: 05-split-the-recipe-page
reviewed: 2026-10-14T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - app/src/domain/penDraft.js
  - app/src/domain/penDraft.test.js
  - app/src/domain/recordDraft.js
  - app/src/domain/recordDraft.test.js
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/RecipePage.drafts.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.shell.test.js
  - app/src/ui/RecipePage.test.jsx
  - app/src/ui/usePenDraft.js
  - app/src/ui/usePenDraft.test.jsx
  - app/src/ui/useRecordDraft.js
  - app/src/ui/useRecordDraft.test.jsx
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-10-14
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

This phase is a behaviour-preserving split of `RecipePage.jsx`. I compared every moved handler and
helper against `git show 4f1f98f:app/src/ui/RecipePage.jsx` (the pre-phase page, 2683 lines).

Behaviour is preserved:

- All 22 pen and record edit handlers apply the same state transitions as before.
- The reset sets match: the old `setBlockedMessage/Target(null)` pairs now go through `usePenDraft.clearBlock`, and the old `setBlockedDateMessage(null)` calls go through `useRecordDraft.clearDateBlock`.
- The save gate, the amend and record `close`, `cancel`, `restore` and `openNew` paths, the `restore` kind branching, and the pen save-block target shape (`kind`, `rowId`, `index`, `attempt`) all match the original.
- `draftVersion` (`penDraftVersion`) and `penFieldsFromDraft` share one `penDraftRows`, and it is identical to the two inline copies it replaced.

Project rules hold:

- The domain modules import only sibling `./*.js` files, with no React, DOM or store.
- No `dangerouslySetInnerHTML` appears in the reviewed files.
- The `Link` in `RecipePage.jsx` carries `tabIndex={0}`.
- `IngredientTable.jsx` still renders its buttons through `Button.jsx`.
- The full suite runs green: 84 files, 2672 tests.

No blockers. Two warnings: one is an unhardened `__proto__` write that the phase left behind, the other is a test helper that can hide a violation. Three info items follow.

## Warnings

### WR-01: `setAsMadePortion` writes through a stored row id with a bare bracket write, so a row id of `__proto__` loses the maker's typing

**File:** `app/src/domain/recordDraft.js:497-509` (also the false claim at `:248-251`)
**Issue:** `rowId` comes from a stored version row. An imported file can carry any string as a row id.
`store/transfer.js` rejects the key `__proto__` on objects but not the value `"__proto__"` as an id.
This phase hardened the pen side against exactly this input (`penDraftRow`, T-05-04, the comment at `penDraft.js:8-15`).
The record side still does `asMade[rowId] = next`, which for `'__proto__'` calls the prototype setter instead of creating a key.

I confirmed it under node:

```
setAsMadePortion({asMade:{}}, {rows:[{id:'__proto__', portions:[{}]}]}, '__proto__', 0, '12')
-> Object.keys(asMade) === []   and   Object.getPrototypeOf(asMade) is an Array
```

Consequences on that row:

- The as-made grams the maker types are silently dropped.
- `isDraftDirty` reads the pen as clean, so no kept draft is written and Escape closes the pen without warning.
- `buildChurnFieldsFromDraft` saves without the figure.
- The draft object's prototype is now an array.

The `draftFromBatch` comment at `recordDraft.js:248-251` says "never a computed-key write against a stored key (T-03-10)". Line 260 (`asMade[rowId] = values.map(...)`) is such a write. Imports reject an own `__proto__` key in `asMade`, so that line is not reachable today, but the comment is wrong as written.

This behaviour was inherited unchanged from the old `handleChangeAsMade`. The phase moved and documented the function, and made the inconsistency visible by fixing only the pen half.

**Fix:** Build the next map without a bracket write, keeping the domain-module convention:

```js
export function setAsMadePortion(draft, version, rowId, portionIndex, rawValue) {
  const row = version.rows.find((candidate) => candidate.id === rowId);
  const existing = Object.prototype.hasOwnProperty.call(draft.asMade, rowId) ? draft.asMade[rowId] : null;
  const next = existing ? [...existing] : new Array(row.portions.length).fill('');
  next[portionIndex] = rawValue;
  const kept = Object.entries(draft.asMade).filter(([key]) => key !== rowId);
  const asMade = Object.fromEntries(next.every((value) => value === '') ? kept : [...kept, [rowId, next]]);
  return { ...draft, asMade };
}
```

Note that moving an existing key to the end of the object changes the key order. If order matters to any reader, instead use `{ ...draft.asMade, [rowId]: next }` for the write and `Object.fromEntries(Object.entries(...).filter(...))` for the delete.
Add a `'__proto__'` case to `recordDraft.test.js` mirroring the one in `penDraft.test.js`. Correct the `draftFromBatch` comment, or build `asMade` with `Object.fromEntries` there too.

### WR-02: The shell test's `stripComments` can hide a draft setter that follows `//` inside a string, so the "no draft setter" proof is weaker than it reads

**File:** `app/src/ui/RecipePage.shell.test.js:15-17`, used by `:47-54` and `:72-76`
**Issue:** `source.replace(/\/\/.*$/gm, '')` removes everything after `//` on a line, including `//` that sits inside a string or URL literal. A line such as `const u = 'http://x'; setDraft(null);` would pass the "RecipePage.jsx holds no draft setter (D-12)" test, the one-place-reset counts, and the "no dangerouslySetInnerHTML" check.
Nothing in the pages today hits this. These tests are the only guard for the split's shape, because the page tests render static markup and never run effects. Their false negatives should be closed.
**Fix:** Strip only line comments that start a line or follow whitespace, and run the check before the block-comment pass:

```js
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}
```

Alternatively, add a case to the existing "the pattern is anchored" test that feeds a string containing `//` followed by a setter call.

## Info

### IN-01: `recordDraft.js` imports `usesListsDiffer` from `penDraft.js`, coupling the two peer draft modules

**File:** `app/src/domain/recordDraft.js:9`
**Issue:** The record pen's dirty check reuses a helper that lives in the version pen's module. This works, and there is no cycle today because `penDraft.js` imports nothing from `recordDraft.js`. But a future `penDraft.js` import of anything from `recordDraft.js` would make a cycle, and the dependency direction is arbitrary.
**Fix:** Move `usesListsDiffer` to a neutral sibling such as `domain/sets.js`, or to `rows.js`, and import it from both.

### IN-02: Stale comment in `RecipePage.jsx` about what `handleStartAmending` reads

**File:** `app/src/ui/RecipePage.jsx:622-624`
**Issue:** The comment says `handleStartAmending` "reads only refs, setters and module functions". It now also reads the `recordPen` hook value and calls `recordPen.openAmend`. The conclusion (safe to call from above the early returns, because `recordPen` is declared at line 197) still holds, but the stated reason no longer does.
**Fix:** Reword to "reads only refs, setters, the `recordPen` hook value and module functions".

### IN-03: `useRecordDraft.removeTasting` and `undoRemoveTasting` read render-time state, so they break the batch-safety the hook header promises

**File:** `app/src/ui/useRecordDraft.js:114-127`
**Issue:** `edit()` is documented as batch-safe ("two edits in one batch both land"). `removeTasting` computes `hasInk` and the undo payload from the closed-over `draft` but blanks the draft through `setDraft((prev) => ...)`. `undoRemoveTasting` restores from the closed-over `pendingUndo`. If an `edit()` were queued in the same React batch before `removeTasting`, the undo payload would miss that edit while the blanking would still erase it. The page calls these once per click, so this is latent only. It matches the pre-phase behaviour, but it is now a public hook method with a stricter-looking contract.
**Fix:** Either note in the hook comment that these two read render-time state and must be called alone in a batch, or compute the payload inside the functional update. The second option needs `pendingUndo` set from inside the updater, which is awkward, so the comment is the cheaper fix.

---

_Reviewed: 2026-10-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
