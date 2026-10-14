---
phase: 03-develop-the-next-version
fixed_at: 2026-09-08T03:34:00Z
review_path: .planning/phases/03-develop-the-next-version/03-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 2
skipped: 1
status: partial
verification_env: isolated worktree (.claude/worktrees/rf-03-81898-1788838162), node_modules symlinked from the main checkout's app/node_modules; full `npm --prefix app test -- --run` suite (519 tests, 26 files) run there after each fix and again after all fixes
fixes:
  - id: CR-01
    title: The "2 … + 2" self-contradiction is only closed for a removed primary step, not a removed splitStep
    status: "fixed: requires human verification"
    commit: c9266bf
    files:
      - app/src/ui/IngredientTable.jsx
      - app/src/ui/IngredientTable.test.jsx
    reason: >-
      Logic fix (per verification_strategy, logic-classified findings are
      flagged for human confirmation even when tests pass). Both flagged
      sites (StepCell in the pen, and the isShowingChanges branch) now
      resolve splitStepDisplay through safeDisplayNumberOf(currentStepNumbers,
      row.splitStep) instead of resolveStepNumber's baseline fallback, and
      the "+ N" suffix is gated on splitStepDisplay != null instead of
      row.splitStep != null, so a removed splitStep renders no numeral —
      matching the treatment already given to a removed primary allocation.
      Added the mirror test the review asked for (primary live, splitStep
      removed) to app/src/ui/IngredientTable.test.jsx; it reproduces the
      review's exact repro shape and passes. Updated resolveStepNumber's
      top-of-file comment, which claimed a caller ("the split-step
      reference") this fix removes.
  - id: WR-01
    title: "--col-data's slack against the unmeasured \"unreviewed\" flag word rests on an unreliable per-letter extrapolation"
    status: skipped
    reason: >-
      Skipped per explicit instruction: this finding requires measuring the
      rendered width of the word "unreviewed" in a real browser (the same
      methodology tokens.css already uses for every other minimum in the
      file), which this agent cannot do from a headless/node-only
      environment. No token value or comment was changed — guessing a new
      number would repeat exactly the unverified-assumption failure mode
      WR-01 itself is about.
      What a human needs to do: open the recipe page in a real browser at
      each UAT viewport (1024, 1152, 1280, 1366, 1440), render a row whose
      Data column shows the flag word "unreviewed" in the table's actual
      flag-word face/size, measure its rendered content width (e.g. via
      DevTools' computed box model or getBoundingClientRect on the text
      span), and compare it against --col-data's 74px content width
      (app/src/styles/tokens.css:114-117, 86px token minus 2×
      --table-cell-pad-x). If the measured width exceeds 74px, raise
      --col-data (and update its comment) by enough to restore real slack;
      if it comes in under 73.5px, the current comment's reasoned estimate
      and 0.5px margin can be confirmed and cited as measured rather than
      reasoned.
  - id: WR-02
    title: columns.test.js's CSS rule parser cannot handle nested at-rules, and will silently mis-partition rules if one is ever added
    status: fixed
    commit: 960b856
    files:
      - app/src/styles/columns.test.js
    reason: >-
      app.css contains no @-rule today (confirmed via grep before fixing),
      so per instruction this used the loud-failure guard rather than a
      nested-at-rule parser: readAllRules now calls assertNoAtRules on the
      comment-stripped source before running its flat brace-matching regex,
      throwing a clear error naming the parser limitation and pointing back
      at this finding if @media/@supports/@keyframes/etc. ever appears in
      app.css. Verified the guard actually fires against a synthetic
      @media snippet before committing.
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-09-08T03:34:00Z
**Source review:** .planning/phases/03-develop-the-next-version/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3 (CR-01, WR-01, WR-02 — fix_scope is critical_warning; IN-01 was out of scope and untouched)
- Fixed: 2
- Skipped: 1

**Verification:** Both fixes were made and verified inside an isolated git worktree (`.claude/worktrees/rf-03-81898-1788838162`, branch `gsd-reviewfix/03-81898`), with `app/node_modules` symlinked from the main checkout so the project's real test toolchain could run there. `npm --prefix app test -- --run` (Vitest) was run after each individual fix and once more after both — 26 test files, 519 tests, all passing both times. These numbers are reproducible from the fast-forwarded `main` branch after this agent's cleanup tail runs; they are not reproducible from the now-removed worktree itself.

## Fixed Issues

### CR-01: The "2 … + 2" self-contradiction is only closed for a removed primary step, not a removed splitStep

**Files modified:** `app/src/ui/IngredientTable.jsx`, `app/src/ui/IngredientTable.test.jsx`
**Commit:** c9266bf
**Status:** fixed: requires human verification (logic fix — see verification_strategy)

**Applied fix:** In `StepCell` (the pen) and the `isShowingChanges` branch, `splitStepDisplay` now resolves via `safeDisplayNumberOf(currentStepNumbers, row.splitStep)` instead of `resolveStepNumber(row.splitStep, currentStepNumbers, baselineStepNumbers)`, so a removed splitStep resolves to `null` instead of falling back to its stale pre-removal position. The rendered `+ N` suffix at both sites is now gated on `splitStepDisplay != null` rather than `row.splitStep != null`, so nothing renders when the splitStep is removed — mirroring the treatment the selector's option label already gives a removed primary allocation. Added a new test, "renders no numeral for a splitStep referencing a removed step — the mirror of the primary case above (CR-01 gap closure)," using the exact repro shape from the review (primary step 1 live, splitStep 2 "Cool" removed, step 3 "Churn" renumbering into position 2) directly beside the existing "Whole milk" test it mirrors. Updated `resolveStepNumber`'s top-of-file comment, which asserted a now-false invariant ("Still serves the split-step reference ... never a step this file is naming as removed") — the comment now names only its actual remaining caller (`formatStepReferences`, the reading-state step column) and records the CR-01 closure.

## Skipped Issues

### WR-01: `--col-data`'s slack against the unmeasured "unreviewed" flag word rests on an unreliable per-letter extrapolation

**File:** `app/src/styles/tokens.css:114-117`
**Reason:** Requires a real-browser measurement this agent cannot perform. No token value was guessed or changed. See the `fixes:` entry above in the frontmatter for the exact steps a human needs to take to close this finding (measure "unreviewed" at each UAT viewport in the table's flag-word face, compare against the 74px content width of `--col-data`).
**Original issue:** `--col-data: 86px` is sized against a reasoned-but-unmeasured ~73.5px estimate for "unreviewed" (extrapolated from "estimated"'s measured 66.14px on a per-letter basis), leaving only ~0.5px of slack — an assumption of uniform per-letter width that does not generally hold in a proportional font, especially given "unreviewed" contains a wide `w` glyph absent from "estimated".

## Fixed Issues (WR-02)

### WR-02: `columns.test.js`'s CSS rule parser cannot handle nested at-rules, and will silently mis-partition rules if one is ever added

**Files modified:** `app/src/styles/columns.test.js`
**Commit:** 960b856
**Status:** fixed

**Applied fix:** `app.css` contains no `@`-rule today, so per instruction this used the loud-failure guard rather than writing a nested-at-rule parser. Added `assertNoAtRules(css)`, called at the top of `readAllRules` (the shared parser both the per-column rule reader and the "no clipping/stacking property" scan depend on), which throws a descriptive error naming the parser's flat, non-nesting limitation the moment `@media`, `@supports`, `@keyframes`, or any other known at-rule keyword appears in the comment-stripped source. Verified the regex actually fires against a synthetic `@media` snippet before committing.

---

_Fixed: 2026-09-08T03:34:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
