---
phase: 03-develop-the-next-version
reviewed: 2026-09-08T02:49:34Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - app/src/styles/app.css
  - app/src/styles/columns.test.js
  - app/src/styles/tokens.css
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
findings:
  critical: 1
  warning: 2
  info: 1
  total: 4
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-09-08T02:49:34Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

This is an incremental review of the two gap-closure plans just executed against `913ca055`: **03-11** (border-box column widths for the ingredient table, G-03-11) and the plan closing **G-03-14** (a removed step's number is empty in the pen and struck in show-changes). All 84 tests across the three touched test files pass (`columns.test.js`, `IngredientTable.test.jsx`, `Method.test.jsx`), and the CSS token arithmetic documented in `tokens.css`/`app.css` checks out against `columns.test.js`'s own recomputation at every UAT viewport width. No hardcoded secrets, no `dangerouslySetInnerHTML`, no literal colour/size/spacing values were introduced, and every new CSS declaration reads through a `tokens.css` custom property as the project convention requires.

However, tracing the G-03-14 fix's own logic against a case its test suite does not cover surfaced a real, reproduced defect: the fix closes the "duplicate step numeral" self-contradiction only for a row's **primary** step allocation when that step is removed, not for a row's **splitStep** reference when *that* step is the one removed. The mirror case reproduces the identical symptom the plan was written to eliminate (see CR-01 below, with a live repro). Two CSS/test-fragility warnings and one comment-staleness note round out the findings.

## Narrative Findings (AI reviewer)

### Critical Issues

#### CR-01: The "2 … + 2" self-contradiction is only closed for a removed primary step, not a removed splitStep

**File:** `app/src/ui/IngredientTable.jsx:156-157` (pen/developing `StepCell`) and `app/src/ui/IngredientTable.jsx:471-472, 504` (show-changes branch)

**Issue:** G-03-14's whole stated purpose (see the file's own top-of-file comment, lines 7-21, and the `StepCell`/`OrphanedRowFlag` comments) is that a removed step must never present a numeral that could be mistaken for a currently-live step's own numeral. The fix achieves this for a row's **primary** allocation (the `<select>`'s own option label omits the number entirely for a removed step, per `resolveStepNumber`'s baseline branch being retired from that call site). But the row's **splitStep** suffix — rendered via `resolveStepNumber(row.splitStep, currentStepNumbers, baselineStepNumbers)` in both the pen (`StepCell`, lines 156-157) and the show-changes branch (lines 471-472, 504) — still falls through to `resolveStepNumber`'s baseline fallback. If the step referenced by `splitStep` (not the row's primary step) is removed this session (pen) or in the version being diffed (show-changes), this fallback renders that step's **stale pre-removal position**, unmarked, with no "(removed)" qualifier — and that stale number can now collide with a different, currently-live step that renumbering has moved into the same position.

Reproduced directly against the current code (not a test file, verified interactively then discarded): a row with primary step 1 (live) and `splitStep: 2`, where step 2 ("Cool") is removed this session and step 3 ("Churn") consequently renumbers from position 3 to position 2, renders:
- The row's own step cell: `1. Warm` (select) `+ 2` (the split suffix, referencing the *removed* "Cool")
- The very same `<select>`'s live option for step 3: `2. Churn`

Both "2"s appear in the same row's step cell/dropdown context, naming two different steps — exactly the self-contradiction this plan's own commentary describes as "the '2 … + 2' self-contradiction" and claims to have closed. The top-of-file comment on `resolveStepNumber` (lines 13-16) even asserts the invariant that supposedly prevents this: "Still serves the split-step reference … both of which name a step that is currently live, or nothing at all, never a step this file is naming as removed" — this assertion is false; the reproduction above is exactly a split-step reference naming a step this file is elsewhere naming as removed.

**Fix:** Stop resolving `splitStepDisplay` through `resolveStepNumber`'s baseline fallback; a removed splitStep should render nothing (or an explicit "(removed)" qualifier), matching the treatment already given to a removed primary allocation:
```js
// StepCell (pen) — app/src/ui/IngredientTable.jsx:156-157
const splitStepDisplay =
  row.splitStep != null ? safeDisplayNumberOf(currentStepNumbers, row.splitStep) : null;

// isShowingChanges branch — app/src/ui/IngredientTable.jsx:471-472
const splitStepDisplay =
  row.splitStep != null ? safeDisplayNumberOf(currentStepNumbers, row.splitStep) : null;
```
and gate the rendered `+ ${splitStepDisplay}` suffix (both sites) on `splitStepDisplay != null`, the same way the primary allocation's option label now omits the number for a removed step. Add a test mirroring the existing "Whole milk's kind of case" test but with the roles reversed (primary live, splitStep removed).

## Warnings

### WR-01: `--col-data`'s slack against the unmeasured "unreviewed" flag word rests on an unreliable per-letter extrapolation

**File:** `app/src/styles/tokens.css:114-117`

**Issue:** `--col-data: 86px` is sized so its content (`86 - 12 = 74px`) clears both the measured `estimated` flag word (66.14px) and a *reasoned, unmeasured* estimate for `unreviewed` (~73.5px), leaving only ~0.5px of slack against that unmeasured word. The 73.5px figure is derived by dividing `estimated`'s measured width by its letter count (66.14 / 9 ≈ 7.35px/letter) and multiplying by `unreviewed`'s letter count (10). This assumes uniform per-letter width in a proportional font, which does not hold in general — `unreviewed` contains a `w`, a notably wide glyph absent from `estimated`, so the real rendered width is plausibly higher than the linear extrapolation predicts. With only 0.5px of margin, this is exactly the kind of unverified assumption that let G-03-11's original defect through undetected. No seed row currently produces `unreviewed`, so this has not been confirmed in a real browser.

**Fix:** Measure `unreviewed`'s actual rendered width in a real browser (the same methodology already used for every other minimum in this file) rather than relying on the letter-count extrapolation, and update the comment/token accordingly if the real figure differs from 73.5px.

### WR-02: `columns.test.js`'s CSS rule parser cannot handle nested at-rules, and will silently mis-partition rules if one is ever added

**File:** `app/src/styles/columns.test.js:101-110` (`readAllRules`), used by the "no clipping/stacking property" scan at lines 248-259 and the column-rule reader at lines 116-124

**Issue:** `readAllRules` extracts rules with `/([^{}]+)\{([^{}]*)\}/g` — a flat, non-nesting brace matcher. This works today only because `app.css` contains no `@media`, `@supports`, or `@keyframes` block. The moment one is added anywhere in the file (a near-certainty for a responsive layout project), this regex will treat the at-rule's own opening brace as a selector and everything up to the first *inner* rule's closing brace as its "declarations," silently misattributing declarations to the wrong selector for every rule inside and after the at-rule block. Since this file's entire "no clipping property" and column-width gate rests on this parser, a future contributor could add a `@media` block and have this suite continue to pass (or fail) for reasons unrelated to what it claims to test, with no signal that the parser itself broke.

**Fix:** Either strip `@`-prefixed blocks before parsing (with a comment noting the limitation), or add a guard that fails loudly if an `@`-rule is detected in the source, so a future change is forced to address the parser rather than silently trusting stale results.

## Info

### IN-01: `tokens.css`'s per-column comments hardcode derived arithmetic that will go stale if `--table-cell-pad-x` changes

**File:** `app/src/styles/tokens.css:105-120`

**Issue:** Each `--col-*` token's trailing comment states its resolved "content" width as a literal computation (e.g., `94 - 12 = 82px`, `78 - 12 = 66px`). These are correct today, but `12` here is `2 * --table-cell-pad-x`'s *current* value inlined as a number — if `--table-cell-pad-x` is ever retuned, `columns.test.js` will still correctly recompute the real content width and catch any resulting minimum-clearance regression, but these comments (which carry the plan's stated design reasoning for why each token holds the value it does) will silently no longer match reality, misleading whoever reads them next.

**Fix:** No action required for this phase; consider phrasing future token comments in terms of the padding token symbolically (e.g., "content: col − 2×pad") rather than its resolved number, or accept the staleness risk as documented technical debt.

---

_Reviewed: 2026-09-08T02:49:34Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
