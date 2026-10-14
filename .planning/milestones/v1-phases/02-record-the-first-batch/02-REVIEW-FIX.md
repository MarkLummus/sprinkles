---
phase: 02-record-the-first-batch
fixed_at: 2026-09-06T20:30:00Z
review_path: .planning/phases/02-record-the-first-batch/02-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-09-06T20:30:00Z
**Source review:** .planning/phases/02-record-the-first-batch/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (CR-01, CR-02, WR-01, WR-02 — `fix_scope: critical_warning`; IN-01/IN-02 out of scope)
- Fixed: 4
- Skipped: 0

**Verification environment:** All fixes were applied, tested, and built inside an isolated git worktree (`.claude/worktrees/rf-02-32200-1788726100`, branch `gsd-reviewfix/02-32200`), then fast-forwarded onto `main`. `app/node_modules` was a symlink into the main checkout's `node_modules` (safe on this macOS/Darwin environment — no reparse-point risk); `npm --prefix app test` and `npm --prefix app run build` ran against that symlinked install. The numbers below are reproducible from `main` after the fast-forward.

## Fixed Issues

### CR-01: Recording a batch's as-made value crashes the ingredient table (string concatenation, not addition)

**Files modified:** `app/src/domain/batch.js`
**Commit:** `411cea0`
**Applied fix:** Adapted the review's suggested fix to the domain layer rather than the UI boundary, since the actual computation site is `asMadeTotals` and fixing it there makes the invariant directly testable with the project's existing domain-test conventions (no component test renderer exists — see WR-02). `asMadeTotals` now coerces a present as-made value with `Number(...)` before summing (fixing the `0 + "383"` → `"0383"` string-concatenation bug), and treats a value that fails to parse to a finite number the same as an absent key — falling back to the row's plan grams — so a garbage in-progress keystroke can never propagate `NaN` into the displayed total or crash `formatGrams`'s `toFixed(1)` call. Verified manually: `asMadeTotals(rows, { r1: '383', r2: 'garbage' })` now returns `{ planTotal: 300, asMadeTotal: 583 }` (a real `number`), not a crash.

### CR-02: As-made cell accepts free text with no validation, so `NaN` can be silently persisted to the stored batch record

**Files modified:** `app/src/ui/RecipePage.jsx`
**Commit:** `0941e98`
**Applied fix:** Chose "ignore" over "reject with a blocking error" (both permitted by the review) to stay within existing UI patterns and avoid introducing new error-surfacing UI that wasn't asked for. `handleSaveBatch` now parses each draft as-made entry and only writes it into the saved `asMade` object when `Number.isFinite(parsed)` is true; an entry that fails to parse is dropped entirely, treated the same as a row the maker never touched — a blank cell (or an unparseable one) still means "no entry," and nothing unparseable ever reaches `repository.saveBatch`.

### WR-01: "Most recent batch" ordering is duplicated verbatim in two files

**Files modified:** `app/src/domain/batch.js`, `app/src/ui/RecipePage.jsx`, `app/src/ui/BatchMargin.jsx`
**Commit:** `7005380`
**Applied fix:** Added `sortedBatches(batches)` to `domain/batch.js` alongside the existing `sortedTastings`, using the identical churn-date-descending/undated-last comparator both UI files had reinvented. `RecipePage.jsx`'s default-`openBatch` selection now calls `sortedBatches(batches)[0]` instead of inlining the sort. `BatchMargin.jsx`'s local variable (which was also named `sortedBatches`, colliding with the new import) was renamed to `orderedBatches` and now calls the imported function; all downstream references (`.length > 1`, `.map`) were updated to match.

### WR-02: `asMadeTotals` / `formatGrams` are exercised only with numeric fixtures; the string-valued path the UI actually uses is untested

**Files modified:** `app/src/domain/batch.test.js`
**Commit:** `5180763`
**Applied fix:** Added two cases to the existing `asMadeTotals` describe block: one reproducing the exact 2 Aug fixture with string-typed values (`'383'`, `'241'`, `'45'`, `'0'`), and one asserting that a non-numeric string (`'abc'`) is treated as absent (falls back to plan grams) rather than poisoning the total. Verified both explicitly against the pre-CR-01 `asMadeTotals` (temporarily restored, uncommitted, from `git show`) — they failed with `asMadeTotal` coming out as a concatenated string (e.g. `'0abc252.84...'`, not close to the expected number) — then confirmed both pass against the fixed version before committing. Full suite: 160/160 passing (158 pre-existing + 2 new).

## Skipped Issues

None — all in-scope findings were fixed.

---

_Fixed: 2026-09-06T20:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
