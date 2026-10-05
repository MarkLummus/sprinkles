---
phase: quick-261004-vj2
plan: 01
subsystem: recipe-route-batch-log
tags: [batch-fold, go-to-batch, sketch-011-decision-50, lifted-state]
requires:
  - FoldRow, useFold (existing)
  - 261004-uyd (the Batch fold)
provides:
  - "Go to batch opens a closed Batch fold, then lands on h2#batch with the body already shown"
affects:
  - app/src/ui/RecipePage.jsx
  - app/src/ui/BatchRow.jsx
key-files:
  created: []
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/RecipePage.folds.test.jsx
    - app/src/ui/BatchRow.test.jsx
decisions:
  - "Decision 50 (Mark 2026-10-05): Go to batch opens a closed Batch fold"
  - "The Batch fold's useFold(true) moves from BatchRow to RecipePage, beside Balance's"
  - "A Correct from a closed fold returning closed is left as built, undecided"
metrics:
  tasks: 2
  files: 4
  completed: 2026-10-04
status: complete
commits: 3
plan_head_before: 531f244c1f99b286d1d8df4dca9d6c62caa01db9
plan_head_after: 4292fcc594dda2a051a140dbaf8493ae05ee2b97
actuals:
  tokens: 4500
  tasks: 2
  commits: 3
---

# Quick 261004-vj2: Go to batch opens a closed Batch fold

With the Batch fold closed by Hide, Go to batch now opens it and then lands focus on `h2#batch`. The body is shown at the moment of focus, so the browser scrolls on the open page.

## What changed

| Commit | Type | What |
| ------ | ---- | ---- |
| 224fbec | test | Pins Go to batch opening a closed fold (393 and 1024), and BatchRow folding by a `batchOpen` prop |
| 9a47493 | feat | Moves the fold state to RecipePage; `handleGoToBatch` opens it first; BatchRow takes `batchOpen` and `onToggleBatch` |
| 4292fcc | test | Guard: a Correct from a closed fold still returns closed after Save |

The test commit came before the feat commit. Before the feat commit, exactly the three new cases failed: both folds cases and the BatchRow closed-render case. Nothing else failed and no new case passed early. After the feat commit all three pass.

## Why the fold state moved to RecipePage

An effect in BatchRow that opens the fold would run in the same commit as the landing effect. Focus would then land while the body was still hidden, and the browser would scroll on a shorter page. Lifting the state lets `handleGoToBatch` open the fold and bump the landing attempt in one React update, so the body is shown before the heading is focused. Balance's fold already lives in RecipePage, so this follows an existing pattern.

The jsdom test records `#fold-batch`'s `hidden` at the moment `h2#batch.focus()` is called. It reads `[false]`.

## Tests

Full suite: `npm --prefix app test` passes, 62 files and 1713 tests. The five-file run before the feat commit passed too (294 tests). The tabindex scan is part of the full run and passes.

## Left as built

- A Correct started from a closed fold returns closed after Save, with focus on h2#batch. The guard test pins this. It passed with an untouched draft, so no field had to be set before Save.
- Moving to another batch remounts RecipePage (router.jsx keys it), so the fold opens again.
- The amend save's two landing lines are unchanged. Only `handleGoToBatch` opens the fold.

## Deviations from Plan

None. The plan was executed as written. One note: the commits are on `main`, because the orchestrator asked for the main tree with no worktree. The protected-branch assertion in the executor protocol would normally refuse this; I followed the orchestrator's instruction.

## Consequence: no build

Mark's preview does not show this until `npm --prefix app run build`. No build, Vite process, probe or :4173 server was started or touched. Only Vitest ran.

## Deferred Human Verification

Suggested device checks, served from `npm --prefix app run build && npm --prefix app run preview -- --host`. The executor filed no Mark's List rows (no ArtifactData tool); the orchestrator may add them.

- iPhone, Olive Oil v1's batch: Hide the Batch fold, scroll up, tap Go to batch. The fold opens, and the page lands with the Batch head just under the sticky bar and the ring whole.
- iPad at 1024 (portrait): the same.
- iPad at 1366 (landscape): the Go to batch row is not shown there, so there is nothing to check.
- VoiceOver after the jump reads the heading's landing name, "Batch churned 2 Aug 2026".

## Known Stubs

None.

## Threat Flags

None. No new input, stored state, markup or endpoint.

## Self-Check: PASSED

- Commits 224fbec, 9a47493 and 4292fcc exist, and `git rev-list --count` from plan_head_before reads 3.
- The three commits touch only the four app files named in the plan. Nothing under `.planning/` or `.impeccable/` was committed.
- `git status --porcelain app/` is clean.
- `useFold(true)` appears in RecipePage.jsx (line 960) and not in BatchRow.jsx. `if (!batchOpen) toggleBatch();` appears once, inside `handleGoToBatch`.
- Other agents' uncommitted files (`.planning/canvas-generators/*`, `.planning/sketches/011-recipe-route-c/README.md`) were left untouched.
