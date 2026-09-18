---
phase: quick-260918-cdg
plan: 01
subsystem: recipe-history styling and history-review todos
tags: [rtl, css, guard-test, cleanup]
status: complete
dependency-graph:
  requires: []
  provides:
    - history.css nested-offset rules stated as logical properties (margin-block/margin-inline)
    - cross-cutting.test.js exhaustive narrow-block + logical-offset guard for history.css
  affects:
    - app/src/styles/history.css
    - app/src/styles/cross-cutting.test.js
    - app/src/ui/RecipeHistory.jsx
tech-stack:
  added: []
  patterns:
    - "margin-block + margin-inline as the two-value logical replacement for a four-value margin shorthand"
    - "select CSS rules by a margin-declaring filter, not a first-match selector lookup, when a selector is a member of more than one rule group"
key-files:
  created: []
  modified:
    - app/src/styles/history.css
    - app/src/styles/cross-cutting.test.js
    - app/src/ui/RecipeHistory.jsx
    - .planning/todos/pending/2026-09-18-recipe-history-batch-is-current-is-emitted-with-no-rule.md (moved to completed)
    - .planning/todos/pending/2026-09-18-the-standalone-batches-register-has-no-in-view-cue.md (moved to completed)
    - .planning/todos/pending/2026-09-18-history-register-comment-still-describes-margin-left.md (moved to completed)
decisions: []
metrics:
  duration: "~25 minutes"
  completed: 2026-09-18
actuals:
  tokens: 62000
  tasks: 4
  commits: 2
plan_head_before: e7d2a107e6ed1235316214bbf483c45d3b360a18
---

# Phase quick-260918-cdg Plan 01: Fix the RTL margin regression and media-block coverage hole Summary

Restored logical-property offsets in the extracted history stylesheet, closed the exhaustive-media-block coverage hole the extraction opened, dropped a dead state class, and closed the three todos the extraction resolved — all folded into the pre-existing shared-history extraction's own commit because no file-level split exists between them.

## What was verified

**Final test count: 1019 passed, 36 files** — matches the plan's arithmetic exactly (1018 baseline + 1 new test in Task 1).

**Task 1's guard failed against the unfixed stylesheet, as required.** Before Finding 1 was fixed, running the suite reported:

```
Test Files  1 failed | 35 passed (36)
     Tests  1 failed | 1018 passed (1019)

AssertionError: expected '\n  margin: var(--gap-hair) 0 0 var(-…' to match /margin-inline(?:-start)?:\s*var\(--ga…/

- Expected:
/margin-inline(?:-start)?:\s*var\(--gap-l\)/

+ Received:
"
  margin: var(--gap-hair) 0 0 var(--gap-l);
  overflow-wrap: anywhere;
"
```

This is the proof the guard bites: the first assertion in the loop (the missing logical `margin-inline` offset) failed, and the "Received" text it printed is the unfixed rule's own four-value shorthand (`margin: var(--gap-hair) 0 0 var(--gap-l)`) — the same string the `fourValueShorthands` helper is built to catch. The new Change C test (the exhaustive narrow-block assertion) passed on the unfixed tree in the same run, exactly as the plan predicted — that block was never the defect.

After Finding 1 and Finding 3 landed (Task 2), the suite reported **1019 passed, 36 files, zero failures**, and `npm --prefix app run build` succeeded.

## Declarations adopted for the two offset rules

```css
.recipe-history__outcome,
.recipe-history__next {
  margin-block: var(--gap-hair) 0;
  margin-inline: var(--gap-l) 0;
  overflow-wrap: anywhere;
}

.recipe-history__empty {
  margin-block: var(--gap-s) 0;
  margin-inline: var(--gap-l) 0;
}
```

Both keep their original token values; only the physical shorthand became the two logical longhands. The trailing zero in each pair keeps the block-end (and inline-end) zeroed — the reset these paragraphs used to get from a separate `app.css` `margin: 0` rule, which the extraction did not carry across and which neither stylesheet restates globally.

The narrow media block (`@media (max-width: 759.98px)`) was left byte-for-byte untouched; its `margin-inline-start: var(--gap-s)` override now applies to the correct edge in both text directions because the base rule is logical.

`RecipeHistory.jsx`'s version `<li>` now reads `<li className="recipe-history__version">` — the ternary that appended a dead `is-current` class is gone. `current={isInView}` still appears 4 times in the file (the article's own current flag and both `HistoryMarkers` calls, untouched).

## What verified each of the three todos

1. **"The nested batch in view carries a class no stylesheet answers."** Confirmed `RecipeHistory.jsx`'s `BatchAttempt` now renders `<HistoryItem className="recipe-history__batch" current={isInView}>` — no hand-written `is-current` class — and that `history.css` answers the resulting state twice: once with the shared outline (`.history-item.is-current { outline: ...; }`), and once with a weight scoped through a child-combinator chain (`.history-item.is-current > .recipe-history__batch-head > .recipe-history__batch-name { font-weight: 700; }`) that reaches only the batch head's name element, never the authored outcome/next-time prose beneath it.

2. **"The standalone Batches register's missing in-view cue."** Confirmed `BatchRow.jsx`'s `BatchHistoryPanel` (~line 337) now renders each entry through `<HistoryItem key={batch.id} current={isOpenBatch} className="history-register__item">`, and that the JSX's own element chain (`div.history-register__identity > p.history-register__name`) matches `history.css`'s child-combinator chain (`.history-item.is-current > .history-register__identity > .history-register__name { font-weight: 700; }`) exactly — the chain does not fail silently for a missing wrapper.

3. **"The stale margin-left comment."** Confirmed the whole `.history-register` block, including the comment that named a physical `margin-left`, left `app.css` entirely with the extraction: `grep -n '^\.history-register' app/src/styles/app.css` matches nothing, and the sentence `shared right edge at width AND the whole-block drop` no longer appears anywhere in the file. The remaining `margin-left` occurrences in `app.css` (lines 1665, 1671, 1777, 2030) belong to `.batch-row__correct` and `.tasting-head__remove` and are unrelated, untouched.

All three were verified against the code before being closed via `node .claude/gsd-core/bin/gsd-tools.cjs query todo complete <filename>` (run with `--dry-run` first to confirm the move/stamp), never edited by hand. `.planning/todos/pending/` carries no `2026-09-18-*` file; `.planning/todos/completed/` carries all three, each stamped `status: completed`.

## Commits

**`cbf8830` — `feat(recipe-history): extract shared history styles and correct the move`**

Carries the whole pre-existing shared-history extraction (the move of ~245 lines from `app.css` into the new `history.css`, plus `History.jsx`/`History.test.jsx`, plus the touched `DESIGN.md`, `main.jsx`, and the four `VersionRow`/`BatchRow` files) **together with** the three corrections from Tasks 1–2 (the logical-property offsets, the extended guard test in `cross-cutting.test.js`, and the dropped dead class in `RecipeHistory.jsx`).

These are folded into one commit deliberately, not for convenience: the corrections edit `history.css` and `cross-cutting.test.js`, the exact two files the extraction itself creates and rewrites, so there is no file-level split that leaves two self-consistent trees. Hunk-level staging was unavailable (`git add -p` is interactive; `git stash` is forbidden by this plan's execution constraints). Because no intermediate tree was checked out and independently re-tested, per-commit verification for this SHA was not run separately from the whole-tree run reported above — the whole-tree 1019-passed/build-succeeds result is what stands behind it.

**`c44e82b` — `docs(todos): close the three history-review findings the extraction resolved`**

Carries only the three todo moves from `.planning/todos/pending/` to `.planning/todos/completed/`, each stamped `completed: 2026-09-18` / `status: completed` by the GSD todo tool. Nothing else under `.planning/` is in this commit — the plan and this SUMMARY are committed separately by the quick-task workflow.

Both commits carry the required attribution trailers. Neither was pushed; `main` sits 2 commits ahead of `origin/main`, no branch was created (`git status -sb` reports `main...origin/main [ahead 2]`).

## Deferred to end-of-phase UAT (recorded in `.planning/WINDOWS.md`, entry 4, `unrun-verify`)

The RTL defect was originally measured in a live browser; none of the three style-contract suites (`binder.test.js`, `columns.test.js`, `cross-cutting.test.js`) has a layout engine, so this plan verifies the fix only as stylesheet text. Deferred item: with `dir="rtl"` applied to the live page at a narrow width, confirm the outcome, next-time and empty-state paragraphs take their indent from the right edge alone with a flush left edge, and confirm at LTR that nothing moved — in particular that no paragraph gained a bottom margin.

## Out-of-scope observations (named, not fixed — CLAUDE.md §3)

- **The Batches register no longer closes at the bottom.** The standalone register's row rule moved from a `border-bottom` on every row to the shared `border-top`, so the last row now has no rule beneath it (measured: last item `border-bottom: 0px none`, `border-top: 1px solid`). The deleted comment on the old rule said the bottom border existed so the block closes visually. This is a design call for Mark and was left untouched, with no code comment added about it, per the plan's explicit instruction.
- `app/src/styles/app.css` (~line 1677) has a comment telling the reader that the Batches panel's rows read the shared register family "above" — that family is now in `history.css`, so the direction is stale. Not one of the three findings this plan closes; left as-is per the surgical-change rule.

## Deviations from Plan

### Plan-arithmetic notes (not functional deviations)

1. **`grep -c "fourValueShorthands" app/src/styles/cross-cutting.test.js` returned 2, not the plan's stated 3.** Change B specifies a single `for (const rule of offsetRules)` loop with one `fourValueShorthands(...)` assertion in its body (plus the function's own definition line) — that is 2 distinct source lines. The plan's done-criteria text ("the definition and its two call sites in the loop body") appears to have conflated the loop's two *runtime* invocations (one per rule) with grep's *static line* count. Implementing the assertion as a loop — rather than unrolling it twice to force a textual count of 3 — is what Change B's own instruction ("for each rule in offsetRules, assert...") and CLAUDE.md §2 (no duplication for its own sake) both call for, so the loop form was kept.

2. **`grep -c 'margin-inline-start: var(--gap-s);' app/src/styles/history.css` returned 2, not the plan's stated 1.** Verified this is pre-existing and unrelated to Task 2's edit: `.history-list--branches` in the narrow media block independently declares `margin-inline-start: var(--gap-s);` on its own line, coincidentally sharing the same value as the narrow override on the three offset selectors. The narrow block itself is confirmed byte-for-byte unchanged (re-read after editing; no edit tool touched any line inside `@media (max-width: 759.98px) { ... }`).

None of the plan's functional gates — the 1019/1018/1 test-count arithmetic at each stage, the four-value-shorthand-in-history.css count (0), the structural-class count (1), the `current={isInView}` count (4), build success, or the todo-closure counts — drifted from their stated values.

### Auto-fixed Issues

None — plan executed exactly as written for all source-code changes; only the two plan-arithmetic notes above.

## Self-Check: PASSED

- `app/src/styles/history.css` — FOUND, edited as specified.
- `app/src/styles/cross-cutting.test.js` — FOUND, edited as specified.
- `app/src/ui/RecipeHistory.jsx` — FOUND, edited as specified.
- `.planning/todos/completed/2026-09-18-recipe-history-batch-is-current-is-emitted-with-no-rule.md` — FOUND.
- `.planning/todos/completed/2026-09-18-the-standalone-batches-register-has-no-in-view-cue.md` — FOUND.
- `.planning/todos/completed/2026-09-18-history-register-comment-still-describes-margin-left.md` — FOUND.
- Commit `cbf8830` — FOUND in `git log --oneline`.
- Commit `c44e82b` — FOUND in `git log --oneline`.
- `.planning/WINDOWS.md` entry 4 (`unrun-verify`, the deferred RTL UAT item) — FOUND (recorded via `gsd-tools windows append`).
