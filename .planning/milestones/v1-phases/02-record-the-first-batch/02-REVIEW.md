---
phase: 02-record-the-first-batch
reviewed: 2026-09-07T00:21:40Z
depth: standard
files_reviewed: 12
files_reviewed_list:
  - app/src/domain/axes.js
  - app/src/domain/axes.test.js
  - app/src/domain/batch.js
  - app/src/domain/batch.test.js
  - app/src/styles/app.css
  - app/src/ui/AxisMark.jsx
  - app/src/ui/AxisMark.test.jsx
  - app/src/ui/BatchMargin.jsx
  - app/src/ui/BatchMargin.test.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/RecipePage.jsx
findings:
  critical: 1
  warning: 1
  info: 2
  total: 4
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-07T00:21:40Z
**Depth:** standard
**Files Reviewed:** 12
**Status:** issues_found

## Summary

This is an incremental review of gap-closure plans 02-04 (`Record another batch` / `Cancel`) and 02-05 (the struck-label fix and the per-axis `Clear` control), diffed against `520d880c` — the commit the prior `02-REVIEW.md` covered.

The previous review's two Critical findings are both resolved by this diff: `asMadeTotals` now coerces string input with `Number()`/`Number.isFinite` before summing (`domain/batch.js`), and `RecipePage.jsx`'s `handleSaveBatch` now drops unparsable as-made entries instead of persisting `NaN`, with new tests in `batch.test.js` exercising the string-typed path the live UI actually produces. The previous review's WR-01 (duplicated batch-sort comparator) is resolved by extracting `sortedBatches` into `domain/batch.js`, used by both `RecipePage.jsx` and `BatchMargin.jsx`. WR-02 (the string-input test gap) is resolved by the new `asMadeTotals`/`readMeasured`-adjacent tests. The struck-label fix (Method.jsx) and the `setMark`/`Clear` control (axes.js, AxisMark.jsx) are both implemented as specified, each backed by a new, well-targeted render/unit test, and both correctly avoid the CSS-decoration-propagation and marks-mutation pitfalls called out in the plan.

This pass found one new Critical defect introduced by plan 02-04's "Record another batch" control: an in-progress tasting draft is not cleared or scoped to the batch it was started against, so creating and saving a new batch while a tasting is being composed silently re-attaches that tasting to the new batch instead of the one the maker was actually describing. It also found one Warning: `setMark`'s write path does not carry the same prototype-safety property its own doc comment and the plan's T-02-32 threat-mitigation claim for it — verified by a runtime repro. Two pre-existing Info items are carried forward for completeness; neither was touched by this diff.

## Critical Issues

### CR-01: An in-progress tasting draft silently reattaches to the wrong batch after "Record another batch"

**File:** `app/src/ui/RecipePage.jsx:138-152` (`handleStartRecording`), `app/src/ui/RecipePage.jsx:264-272` (`handleSaveBatch`, create path), `app/src/ui/RecipePage.jsx:322-339` (`handleSaveTasting`)
**Issue:** `tastingDraft` is independent React state, not scoped to `openBatch.id`, and nothing in this diff resets it when the batch on screen changes. Plan 02-04's own threat model states this explicitly about the page's component state in general (02-04-PLAN.md: "Which save path runs — create or amend — is decided by one piece of component state that **survives across openings of the pen layer**") — the same survival applies to `tastingDraft`, which no handler added by 02-04/02-05 accounts for.

Sequence that reproduces it:
1. On batch A's page, click "Add a tasting" and mark an axis or type words — `tastingDraft` is now populated and rendered against `openBatch = A` (`axesForBatch(openBatch)` inside `BatchMargin.jsx`'s reading branch).
2. Without saving or discarding that tasting, click the new "Record another batch" control (`BatchMargin.jsx:300-302`). `handleStartRecording` sets `mode = 'recording'` and resets `draft`/`amendingBatchId`, but does not touch `tastingDraft` (`RecipePage.jsx:138-152`).
3. Fill in the new batch's churn fields and click "Save batch". `handleSaveBatch`'s create path (`RecipePage.jsx:264-272`) creates batch B, adds it to `batches`, and calls `navigate('/recipe/:id/batch/:B-id')`. Because both `/recipe/:id` route entries in `router.jsx` render the same `RecipePage` component, this is a param change on the same route, not a remount — `tastingDraft` (and every other `useState`) survives untouched.
4. `openBatch` now recomputes to batch B (`batchId` param now names B). The still-populated `tastingDraft` renders as if composed for B (`BatchMargin.jsx`'s `tastingDraft ? <TastingForm axes={axesForBatch(openBatch)} .../> : ...` — `openBatch` is B here).
5. Clicking "Save tasting" calls `addTasting(openBatch, tastingFields, ...)` (`RecipePage.jsx:333`) — `openBatch` is B. The tasting the maker composed while looking at batch A is persisted against batch B, with no warning, no confirmation, and no code path that ever mentions batch A again.

This is a genuine data-misattribution bug, not merely a UX rough edge: the record ends up asserting that a tasting happened for a churn event it was never actually about, which is exactly the connection ("what was actually done... how the result was experienced") this phase exists to keep truthful. No test exercises this interaction — `BatchMargin.test.jsx` always renders with `tastingDraft: null`, and there is no `RecipePage.test.jsx` at all, so nothing in the suite renders the sequence above.

**Fix:** Clear `tastingDraft` wherever the open batch is about to change out from under it — at minimum in `handleStartRecording` (mirroring the existing `setAmendingBatchId(null)` reset added by this same plan for the analogous stale-state hazard):
```js
function handleStartRecording() {
  setAmendingBatchId(null);
  setTastingDraft(null); // the tasting being composed belongs to the batch on screen now, not to whichever batch is open after this save
  setDraft({ ... });
  setMode('recording');
}
```
Consider also including `tastingDraft` in the dirty check that gates the "Record another batch"/"Amend" controls (or warning before discarding it), since this silently drops/misroutes maker-entered ink the same way an unguarded cancel would.

## Warnings

### WR-01: `setMark`'s write path does not have the prototype-chain safety its comment and the plan's threat mitigation (T-02-32) claim

**File:** `app/src/domain/axes.js:66-74`
**Issue:** The doc comment states the function is "built with object spread and delete, which write only the object's own properties, never through an assignment path that could walk a prototype chain reached by a hand-edited version's axis key (T-02-32)." That claim holds for the *delete* branch (`delete next[axisKey]`) but not for the *write* branch:
```js
export function setMark(marks, axisKey, stop) {
  const next = { ...marks };
  if (stop === null) {
    delete next[axisKey];
  } else {
    next[axisKey] = stop;   // <-- not spread; a plain bracket assignment
  }
  return next;
}
```
`next[axisKey] = stop` is a normal property assignment, not `CreateDataProperty` the way spread is. For `axisKey === '__proto__'` this invokes `Object.prototype`'s `__proto__` accessor rather than creating an own key. Verified directly:
```
$ node -e "
function setMark(marks, axisKey, stop) {
  const next = { ...marks };
  if (stop === null) delete next[axisKey]; else next[axisKey] = stop;
  return next;
}
const r = setMark({}, '__proto__', 4.5);
console.log(Object.keys(r), JSON.stringify(r));
"
[] {}
```
A mark placed on an axis whose declared name is literally `__proto__` (reachable via `markKeyFor` on a hand-edited version's `declaredAxes`, the exact scenario T-02-31/T-02-32 already flag as a going-in threat) silently vanishes — `setMark` reports success but the returned object has no own key for it, so `isTastingSaveable`/`TastingReading` will show the axis as unmarked even though the maker clicked a stop. This does not achieve broad prototype pollution (the object mutated is a fresh per-call clone whose own prototype is what changes, not `Object.prototype` itself, and `stop` is always a plain number in the app's own call sites, so the accessor's assignment is a no-op rather than actually swapping `next`'s prototype) — but the code's own claimed invariant ("write only the object's own properties") is false for this branch, and the practical effect is silent, undetected data loss for that one axis.
**Fix:** Make the write branch use the same own-property-only mechanism as the rest of the function, e.g.:
```js
Object.defineProperty(next, axisKey, { value: stop, writable: true, enumerable: true, configurable: true });
```
or reject/guard `axisKey === '__proto__'` explicitly, or switch the marks representation to a `Map` (already suggested as future-proofing by the presence-over-truthiness discipline elsewhere in this module).

## Info

### IN-01: Whitespace-only numeric input is silently treated as `0`, not as absent/unparsable

**File:** `app/src/domain/batch.js:169-182` (`asMadeTotals`), `app/src/ui/RecipePage.jsx:237, 323` (`toNumberOrNull`)
**Issue:** `Number(' ')` (and any whitespace-only string) evaluates to `0`, which is `Number.isFinite`-true, so both `asMadeTotals`'s coercion and `toNumberOrNull` treat a stray space the same as a deliberately typed `0` rather than as unparsable/absent ink — contradicting the stated contract ("a value that does not parse to a finite number... is treated the same as an absent key"). In practice this is not currently reachable through the app's own UI: every affected field (`comeUpMinutes`, `drawTempC`, `overrunPercent`, the as-made cells) is a `type="number"` input, and browsers normalize such an input's `.value` to either a parseable numeral or the empty string, never a bare space — so this is latent rather than an active bug today. Flagging it because both functions are exported/reused (`asMadeTotals` in particular is exercised in the domain suite with hand-built fixtures, not only through the UI), so a future caller feeding raw text (paste, a differently-typed input, an import path) would hit it silently.
**Fix:** If defending against this is worth the line, trim before the finiteness check (`Number(String(rawValue).trim())`), or note explicitly in the doc comment that only exactly `''` is treated as absent and any other unparsable string other than pure whitespace already falls back correctly — whichever is intended.

### IN-02: `AS_EXPECTED_WORDS` duplication (carried forward, pre-existing, not touched by this diff)

**File:** `app/src/ui/BatchMargin.jsx:6`, `app/src/ui/RecipePage.jsx:316`
**Issue:** Still present from the prior review (previously IN-01 in `02-REVIEW.md`): `BatchMargin.jsx` defines `const AS_EXPECTED_WORDS = 'As expected, nothing to note'` for the button's label, while `RecipePage.jsx`'s `handleUseAsExpectedShortcut` independently hardcodes the identical literal for the value actually written. Neither plan 02-04 nor 02-05 touched either line, so this is unchanged and still open; noted here only so it isn't lost between review passes.
**Fix:** Unchanged from before — export the constant from one module and import it in the other.

---

_Reviewed: 2026-09-07T00:21:40Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
