---
phase: quick-261122-tqj
plan: 01
subsystem: ui
tags: [react, accessibility, aria-label, ingredient-table]
requires: []
provides:
  - "Each line of a split row names its Add ingredient by step ('Add ingredient after <name> in step N')"
affects: [IngredientTable creating mode]
actuals:
  tokens: 900
  tasks: 2
  commits: 2
plan_head_before: 8374320f5e844fb2276c748f246b70d2eada6725
plan_head_after: fd95ddcc2cfcf5263428bb67bcc2b74fb8268986
tech-stack:
  added: []
  patterns: ["Per-line controls share the inStep suffix so no two have the same accessible name"]
key-files:
  created: []
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.creating.test.jsx
key-decisions:
  - "Reused the existing inStep const in RowActs; no new prop or helper"
requirements-completed: []
duration: 6min
completed: 2026-11-22
status: complete
---

# Quick 261122-tqj: Add ingredient on a split line is named by its step

**A row split across steps now gives each line's Add ingredient button its own accessible name ("... in step 1", "... in step 2"), as its Move buttons already had.**

## What changed

- `app/src/ui/IngredientTable.jsx`: the Add ingredient `aria-label` in `RowActs` is now `Add ingredient after ${name}${inStep}`. The comment above `RowActs` now says the line names its Add ingredient and Move controls by step. Nothing else changed (visible word, `aria-keyshortcuts`, `onClick`, Remove, Add to step names are untouched).
- `app/src/ui/IngredientTable.creating.test.jsx`: the Add ingredient test now expects the step-1 and step-2 names and the plain name on the one-line cream row. The no-shared-name test now includes Add ingredient (12 controls, all distinct).

## Test counts

- Red (after Task 1, before the fix): the creating-table file read 2 failed, 35 passed (37). The failures were the Set size (11 of 12) and the step-1 name.
- Green: the creating-table file reads 37 passed (37).
- Full suite: 136 files, 4538 tests passed, no failures. `tabindex-scan.test.js` passes.

## Commits

- 2f4aee3f: test(261122-tqj): red
- fd95ddcc: fix(261122-tqj): green
- the SUMMARY commit (last)

## Deviations from Plan

None - plan executed exactly as written.

## Verification not done

No VoiceOver or Voice Control run, and no browser run. Nothing here is device-verified.

## For the orchestrator

- Mark's List: close `bug-p12-add-ingredient-same-name` after the merge (`status: "done"`, `resolvedAt` from `date -u`, reply such as "Each line's Add ingredient now says its step, as Move does; not checked with VoiceOver.", `if_version` from a read).
- 12-REVIEW-DISPOSITION.md: WR-01 can move from `open` to `fixed`; this item left the file alone. The anti-pattern row for IngredientTable.jsx:309-316 in 12-VERIFICATION.md is now stale.
- Deploy after this item: safe. Only an accessible name changed; no store shape or DB_VERSION change.

## Self-Check: PASSED

- app/src/ui/IngredientTable.jsx and app/src/ui/IngredientTable.creating.test.jsx are the only app files changed since the base commit.
- Commits 2f4aee3f and fd95ddcc exist on this branch.
