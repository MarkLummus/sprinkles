# Phase 5: Split the recipe page - Pattern Map

**Mapped:** 2026-10-14
**Files analyzed:** 14 (4 new source, 4 new test, 2 modified source, 8 modified tests; the 8 are one group)
**Analogs found:** 14 / 14 (all paths verified git-tracked)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/src/domain/penDraft.js` (new) | utility (pure ops) | transform | `app/src/domain/draft.js` + the helpers being moved (`RecipePage.jsx` 301-363, 633) | exact |
| `app/src/domain/recordDraft.js` (new) | utility (pure ops) | transform | `app/src/domain/draft.js` + helpers in `RecipePage.jsx` 106-631 | exact |
| `app/src/domain/penDraft.test.js` (new) | test (node) | transform | `app/src/domain/diff.test.js`, `draft.test.js` | exact |
| `app/src/domain/recordDraft.test.js` (new) | test (node) | transform | `app/src/domain/diff.test.js`, `draft.test.js` | exact |
| `app/src/ui/usePenDraft.js` (new) | hook | event-driven (state + edit) | `app/src/ui/useBelowDesktop.js` (`useFold`, 105-112) | role-match |
| `app/src/ui/useRecordDraft.js` (new) | hook | event-driven | `app/src/ui/useBelowDesktop.js` (`useFold`) | role-match |
| `app/src/ui/usePenDraft.test.jsx`, `useRecordDraft.test.jsx` (new) | test (jsdom hook) | event-driven | `app/src/ui/useFold.reset.test.jsx` | exact |
| `app/src/ui/RecipePage.jsx` (modify) | component (route shell) | request-response + CRUD | itself (handlers 1517-2410) | n/a |
| `app/src/ui/IngredientTable.jsx` (modify, lines 145, 654) | component | transform | `RecipePage.jsx` 309 | n/a |
| 8 test files importing `./RecipePage.jsx` (modify) | test | n/a | n/a | n/a |

Extension: `.js` for hooks (like `useBelowDesktop.js`); the Harness test is `.jsx`.

## Pattern Assignments

### `app/src/domain/penDraft.js` and `recordDraft.js` (pure, node)

**Analog:** `app/src/domain/draft.js`

**Header and import convention** (draft.js 1-13): a leading `// Pure. No framework, no DOM, no store import.` comment, then relative imports with explicit `.js` extensions, named exports only.
```js
// Pure. No framework, no DOM, no store import. ...
import { AXES, STOPS, axesForVersion } from './axes.js';
import { SEGMENT_OPTIONS, MARK_ONE_OPTIONS, DEFECTS } from './battery.js';
export const DRAFT_SHAPE_VERSION = 1;
```
Moved helpers pull in `isLineRemoved` from `./rows.js`, `parseMeasuredDraft` and `BATTERY_FIELDS` from `./battery.js`, and `setMark` from `./axes.js` (all already in the `RecipePage.jsx` import block, lines 4-9). Do not import `react` or `../ui/*`.

**Own-property helper** (draft.js 105-107), the model for D-03 `penDraftRow(penDraft, rowId)`:
```js
function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}
```
Callers today: `RecipePage.jsx` 309, 1370, 2293; `IngredientTable.jsx` 145, 654. Each does `const draftRow = penDraft.rows[row.id];` then reads `draftRow.portions[i]`. Replace each with `penDraftRow(penDraft, row.id)`. Decide in the plan what it returns for a missing id (undefined, as `has` gives) and whether callers must tolerate that.

**Code to move verbatim (pen):** `isPenDraftDirty` (RecipePage.jsx 301-327, with private `normalizedText`, `usesListsDiffer`, `targetsDiffer`, `isStepDirty`, `isAuthoredListDirty` at 242-300), `toggleDraftRowLines` (333-339), `derivePenState` (352-363), `restoreStepFromVersion` (633). `derivePenState` is a deliberate if-chain (T-02-32); keep it.

**Code to move verbatim (record):** `isTastingBodyField`/`TASTING_BODY_FIELD_KEYS` (106-116), `asMadeMapsDiffer`, `marksDiffer`, `stepChangesDiffer`, `isDraftDirty` (126-183), `blankTastingFields`, `blankRecordDraft`, `draftFromBatch` (370-418), `tastingHasInk`, `tastingPayloadFromDraft`, `restoreDraftFromUndo` (457-503), `parseAllMeasuredFields`, `validateRecordDraft`, `buildChurnFieldsFromDraft`, `buildTastingFieldsFromDraft` (530-602), `batchSavedStatus` (621), plus `CHURN_DATE_BLOCKED_MESSAGE` (line 52, D-02).

**Edit op shape (D-04):** pen ops are `(draft, ...args) => draft`, copying the existing inline spread style (RecipePage.jsx 2096-2119):
```js
setPenDraft((prev) => ({ ...prev, [field]: value }));          // handleChangePenField
setPenDraft((prev) => ({
  ...prev,
  rows: { ...prev.rows, [rowId]: { ...prev.rows[rowId],
    portions: prev.rows[rowId].portions.map((portion, i) =>
      i === portionIndex ? { ...portion, grams: value } : portion) } },
}));                                                            // handleChangePenGrams
```
Extract the lambda body as an exported op (e.g. `setPenField(draft, field, value)`). There are 16 such handlers from line ~2096 to ~2410; read each when planning.

**Open op:** the draft built in `handleOpenDeveloping` (RecipePage.jsx ~2030-2054) is the body for `penDraftFromVersion(version)`; note it builds `rows` from `activeRows`-style mapping with `removed: isLineRemoved(row, portion)`.

**Drift warning:** `draft.js` line 17-19 and `RecipePage.drafts.test` pin `RECORD_DRAFT_KEYS` equal to `blankRecordDraft()`'s keys. Moving `blankRecordDraft` changes that test's import only; keep the pin and fix the stale "(RecipePage.jsx)" comment only if the plan owns it (draft.js is otherwise untouched, D-01).

---

### `app/src/domain/penDraft.test.js`, `recordDraft.test.js`

**Analog:** `app/src/domain/diff.test.js` (1-20) and `draft.test.js`

- No jsdom docblock (default node environment).
- Fixtures: `structuredClone(oliveOilVersion)` from `../data/olive-oil.js`, edited per test.
```js
import { describe, it, expect } from 'vitest';
import { oliveOilVersion } from '../data/olive-oil.js';
function clone() { return structuredClone(oliveOilVersion); }
```
- For `penDraftRow`: test own row, missing id, and prototype names (`'__proto__'`, `'constructor'`, `'toString'`) returning the missing result (closes T-03.6-02).
- Move, do not delete or weaken, the existing assertions that currently import these helpers from `./RecipePage.jsx` (D-02); change only the import path.

---

### `app/src/ui/usePenDraft.js`, `useRecordDraft.js`

**Analog:** `app/src/ui/useBelowDesktop.js`

Plain `.js` (no JSX), `import { useState } from 'react';` named exports, `useState` rather than `useReducer` (D-04). Return-shape precedent is `useFold` (105-112):
```js
export function useFold(openByDefault) {
  const [open, setOpen] = useState(openByDefault);
  useEffect(() => { setOpen(openByDefault); }, [openByDefault]);
  const toggle = () => setOpen((current) => !current);
  return [open, toggle];
}
```
For two-plus values return an object. Core wiring to build (D-04):
```js
const edit = (op, ...args) => {
  setBlockedMessage(null);
  setBlockedTarget(null);
  setPenDraft((prev) => op(prev, ...args));
};
```
Per D-05, `handleChangePenField` stays in the shell: it calls `onPageStatus('')`, `announce('')`, then `edit(...)` (current body at RecipePage.jsx 2096-2102). The other 15 handlers (e.g. 2107-2119) clear blocked state only. Lifecycle methods (D-12) mirror `handleOpenDeveloping` 2045-2056 and `handleCancelDeveloping` 2083-2094: the hook performs the `setPenDraft`/`setBlockedMessage`/`setBlockedTarget` parts; the shell keeps `discardDraft()`, `setMode`, `setVersionSaveAction`, `versionSaveLockRef`, `penOpenedAtRef`, `onPageStatus`, `announce`.

`useRecordDraft` (D-06, D-09): record handlers clear `blockedDateMessage` at 16 sites (RecipePage.jsx 1539, 1570, 1590 ... 1908) with differing extras. Example `open` reset block (1530-1550) shows what the shell keeps (`batchSaveLockRef`, `setBatchSaveAction`, `onPageStatus`, `setMode`, status strings) and what moves (`setAmendingBatchId`, `setAmendBaseline`, `setDraft`, `setFieldErrors`, `setBlockedDateMessage`, `setPendingUndo`). In `handleChangeRecordField` (~1560) keep per-handler differences exactly: `fieldErrors` entry for its own field only (1564), `formStatus`, `pendingUndo` retired only when `isTastingBodyField(field)`. Hook state: `draft`, `amendBaseline`, `amendOpener`, `amendingBatchId` (D-09 says the hook owns amend baseline and opener), `fieldErrors`, `blockedDateMessage`, `pendingUndo`.

Done check (D-12): `grep -nE "setPenDraft|setDraft\(|setBlockedMessage|setBlockedTarget|setBlockedDateMessage" app/src/ui/RecipePage.jsx` returns nothing; put it in the final plan as a test or acceptance grep. Beware `setDraft` also substring-matches `setDraftRestoreDone`-type names; anchor the pattern.

---

### `app/src/ui/usePenDraft.test.jsx`, `useRecordDraft.test.jsx`

**Analog:** `app/src/ui/useFold.reset.test.jsx` (whole file)

- First line `// @vitest-environment jsdom` docblock (line 1).
- Imports (26-29): `describe, it, expect` from vitest; `act` from `react`; `createRoot` from `react-dom/client`; hook from `./x.js`. No `@testing-library/react`.
- Harness captures hook returns into a plain `state` object, mounted in a detached container, `act()` around each render/call, cleanup in `finally` (41-92):
```jsx
const state = {};
function Harness(props) { const h = usePenDraft(props.version); state.h = h; return null; }
const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
try {
  act(() => { root.render(<Harness ... />); });
  act(() => { state.h.edit(op, ...args); });
  expect(state.h.blockedMessage).toBe(null);
} finally {
  act(() => { root.unmount(); });
  container.remove();
}
```
- Wiring only (D-10): `edit()` clears `blockedMessage` and `blockedTarget` together; `useRecordDraft` clears `blockedDateMessage` through one path. Logic coverage stays in the node tests.

---

### `app/src/ui/RecipePage.jsx` (modify)

Constraints found:
- Keep exported (D-02): `VERSION_SAVED_STATUS`, `DRAFT_KEPT_STATUS`, `BATCH_SAVE_ERROR` and the other status strings (lines 52-95) that the save/cancel flow alone uses. Moved to domain: `CHURN_DATE_BLOCKED_MESSAGE`. Check each remaining `export const` for helper users before deciding; `VERSION_BLOCKED_STATUS`, `MEASURED_INVALID_STATUS`, `TASTING_*_STATUS` are imported by tests from `./RecipePage.jsx` today.
- Source-reading tests: `RecipePage.test.jsx` lines 885, 931, 1001, 1140, 1153, 1220, 1250, 1290 `readFileSync` `RecipePage.jsx` and assert on its text (tabIndex scan, no `dangerouslySetInnerHTML`, instruction text and so on). After the move, run these early; any that grep for moved code need to point at the new file, not be dropped.
- Imports to add (style at lines 1-38): `import { usePenDraft } from './usePenDraft.js';` beside `useBelowDesktop.js`; domain imports with `.js` extensions. Remove imports left unused by the move (CLAUDE.md surgical-change rule).

### `app/src/ui/IngredientTable.jsx` (modify)

Lines 145 and 654 are `const draftRow = penDraft.rows[row.id];`. Add `import { penDraftRow } from '../domain/penDraft.js';` and replace with `penDraftRow(penDraft, row.id)`. Nothing else changes.

### 8 test files (modify imports only)

Files: `BatchRow.test.jsx` (31), `RecipePage.test.jsx` (~30-50, the multi-line import ending `toggleDraftRowLines } from './RecipePage.jsx'`), `RecipePage.drafts.test.jsx` (~60-91), `.a11y`, `.perStep` (60), `.beforeYouStart`, `.folds`, `.recordTasting`. Only names that moved (see D-01 and D-02 lists, e.g. `buildChurnFieldsFromDraft`, `buildTastingFieldsFromDraft`, `restoreStepFromVersion`, `toggleDraftRowLines`, `batchSavedStatus`, `TASTING_*` only if moved) change source to `../domain/penDraft.js` or `../domain/recordDraft.js`. Component imports (`RecipePage`) and kept strings stay. Pattern for a split import: keep a `./RecipePage.jsx` import for what stays and add a domain import next to the existing `import { isLineRemoved } from '../domain/rows.js';` (RecipePage.test.jsx 51).

## Shared Patterns

### Reset-on-edit (single place)
**Source:** `RecipePage.jsx` 2096-2119 (pen) and 1564-1570 (record), becoming `edit()` in each hook.
**Apply to:** `usePenDraft`, `useRecordDraft`. Behaviour must match line for line (D-05, D-06); WebKit before/after walk per D-11, D-13.

### Domain purity
**Source:** `.claude/CLAUDE.md` Conventions; `draft.js` header.
**Apply to:** both domain files. No react, DOM, store or `idb` import; tests under node.

### Visual and a11y rules still apply
Hooks and domain files carry no UI, so `tabIndex`/`Button` rules (enforced by `tabindex-scan.test.js`) and token rules only matter if JSX moves; none should.

## No Analog Found

| File | Reason |
|---|---|
| (none) | No existing hook owns draft state; `useFold` is the closest in shape only. The `edit(op, ...args)` wrapper has no precedent and comes from CONTEXT D-04. |

## Metadata

**Analog search scope:** `app/src/domain/`, `app/src/ui/`
**Files read:** CONTEXT.md, draft.js, useBelowDesktop.js, useFold.reset.test.jsx, diff.test.js (head), targeted ranges of RecipePage.jsx and IngredientTable.jsx
**Tracked check:** `git ls-files` confirmed `domain/draft.js`, `domain/draft.test.js`, `ui/useBelowDesktop.js`; no mirror paths used.
**Pattern extraction date:** 2026-10-14
