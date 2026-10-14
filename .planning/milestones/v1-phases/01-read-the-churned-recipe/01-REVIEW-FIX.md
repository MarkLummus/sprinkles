---
phase: 01-read-the-churned-recipe
fixed_at: 2026-09-06T03:00:55Z
review_path: .planning/phases/01-read-the-churned-recipe/01-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-09-06T03:00:55Z
**Source review:** .planning/phases/01-read-the-churned-recipe/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (CR-01, WR-01, WR-02, WR-03; IN-01..IN-04 excluded by fix_scope)
- Fixed: 4
- Skipped: 0

**Verification:** `npm --prefix app test` (76/76 passing, up from 72 baseline) and `npm --prefix app run build` were run after each individual fix, inside an isolated git worktree (branch `gsd-reviewfix/01-67082`, created from `main` and fast-forwarded back onto it) with its own `npm ci` install. Results are reproducible from the main checkout now that the worktree's commits have landed on `main`.

## Fixed Issues

### CR-01: Import validator omits `method` and `authored`, which `RecipePage` dereferences unconditionally

**Files modified:** `app/src/store/transfer.js`, `app/src/store/transfer.test.js`
**Commit:** 82c5f2b
**Applied fix:** Added checks to `validateVersion` requiring `version.method` to be an array and `version.authored` to be a plain object with `carriedForward` and `beforeYouStart` arrays, matching the fix suggestion exactly (the validator-side fix, preferred over the render-site guard since it preserves the "one gate" contract in the module's own doc comment). Updated `transfer.test.js`'s `makeVersion` helper to include valid `method`/`authored` fields (previously well-formed test fixtures no longer satisfy the stricter validator without this), and added three new tests covering: missing `method`, missing `authored`, and an `authored` object missing one of its two required arrays.

### WR-01: `weakestBasis` ignores `grams`, unlike `buildFigures`' own contributor gate

**Files modified:** `app/src/domain/composition.js`, `app/src/domain/composition.test.js`
**Commit:** 2b394d5
**Applied fix:** Changed `weakestBasis`'s contributor check from `row.ingredient.composition[field] > 0` to `(row.ingredient.composition[field] ?? 0) * row.grams > 0`, matching `buildFigures`' gate exactly. Added a test with a synthetic 0-gram row carrying an `'inherited'`-basis coefficient, confirming it no longer wins the worst-basis rank once its mass contribution is zero. No existing seed data exercises this path (all seeded rows have positive grams), so this is a regression guard for Phase 3's struck-row feature, not a change in current rendered output.

### WR-02: Export button revokes its Blob URL synchronously and never attaches the anchor to the DOM

**Files modified:** `app/src/ui/RecipeList.jsx`
**Commit:** ce1cda3
**Applied fix:** Applied the fix exactly as suggested — append the anchor to `document.body` before `.click()`, `.remove()` it afterward, and defer `URL.revokeObjectURL` to the next tick via `setTimeout(..., 0)`. No test added: there is no jsdom/component-test infrastructure in this project yet (`vitest.config.js` is `node`-only by design, per its own comment, until a future component test opts into jsdom), and standing that up was out of scope for a targeted DOM-timing fix.

### WR-03: No error handling around store startup

**Files modified:** `app/src/main.jsx`
**Commit:** a11a509
**Applied fix:** Wrapped `await seedIfEmpty(repository)` in try/catch; on rejection, sets `#root`'s text to a visible fallback message before rethrowing, exactly as the fix suggestion specified. Did not touch `db.js`'s `openStore()` (mentioned in the Issue text as contributing context but not part of the prescribed Fix block) — out of scope for this finding's suggested change.

## Skipped Issues

None — all in-scope findings were fixed.

---

_Fixed: 2026-09-06T03:00:55Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
