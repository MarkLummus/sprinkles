---
phase: quick-260918-mq0
plan: 01
subsystem: styles
tags: [history-register, type-roles, css-tokens]
status: complete
dependency-graph:
  requires: []
  provides: ["recipe-history__outcome.prose-text reads --type-note"]
  affects: ["app/src/ui/RecipeHistory.jsx (visual size only, no markup change)"]
tech-stack:
  added: []
  patterns: ["scoped compound selector supplies size only; .prose-text supplies face/leading/colour"]
key-files:
  created: []
  modified:
    - app/src/styles/history.css
    - app/src/styles/cross-cutting.test.js
decisions: []
actuals:
  tokens: 1300
  tasks: 1
  commits: 1
plan_head_before: 06fae6e48695f41f5eafa6148a5d1b7131c76c0e
metrics:
  duration: 10min
  completed: 2026-09-18
---

# Quick Task 260918-mq0: The recorded tasting note is the one prose paragraph not set to the prose role Summary

One line: added `.recipe-history__outcome.prose-text { font-size: var(--type-note); }` to `history.css` so the recorded tasting note renders at 16px/24 — the same size and leading as Why and Next time — and pinned all three prose sizes plus the small-print exclusion in a new `cross-cutting.test.js` test.

## What was built

`.recipe-history__outcome.prose-text` is a new top-level rule in `app/src/styles/history.css`, placed immediately after the shared `.recipe-history__outcome, .recipe-history__next` margin rule and before `.recipe-history__next`. It declares only `font-size: var(--type-note)` — face, leading and colour continue to arrive from `.prose-text` in `app.css`, exactly mirroring how `.recipe-history__reason .prose-text` (history.css) already handles the Why paragraph. The compound selector's specificity (0,2,0) outranks `.prose-text` alone, and `:not(.prose-text)` on the defect-words variant cannot match the same element, so the two variants stay mutually exclusive with no cascade ordering concern.

A new test, `"the History register's three prose paragraphs all read --type-note, and the non-prose variant does not"`, was added to the `describe('type roles — the four validated sizes mapped onto tokens', ...)` block in `cross-cutting.test.js`, immediately after the existing `.prose-text` test. It asserts:
- `.recipe-history__reason .prose-text` matches `font-size: var(--type-note)`
- `.recipe-history__outcome.prose-text` matches the same
- the exact-selector `.recipe-history__next` rule (found by exact selector equality, not the `historyRuleFor` helper, since that helper's first-match lookup would otherwise resolve to the shared margin rule which carries no size) matches both `font-size: var(--type-note)` and `line-height: var(--leading-note)`
- `.recipe-history__outcome:not(.prose-text)` still matches `font-size: var(--size-small-print)`

## Deviations from Plan

None — plan executed exactly as written.

## Verification

`npm --prefix app test -- --run` from the worktree root: 38 files, 1047 tests passed (1046 baseline + 1 new test), 0 failures.

The human-check (visual confirmation that the note, Why line and Next time line render at the same size/leading, and the defect-words variant stays small-print grotesk) is deferred to end-of-phase UAT per `human_verify_mode: end-of-phase` and Mark's away-status default (memory: defer checkpoints when away).

## Self-Check: PASSED

- FOUND: app/src/styles/history.css (modified, contains `.recipe-history__outcome.prose-text`)
- FOUND: app/src/styles/cross-cutting.test.js (modified, contains the new test)
- FOUND commit ccc2f44 on branch worktree-agent-a3b0a55a19d38e48b
