---
phase: quick-261122-tqm
plan: 01
subsystem: creation-editor
tags: [focus, ingredient-picker, cancel, bug-p12-picker-cancel-focus-heading]
status: complete
commits: 2
plan_head_before: 43bfdfd661c38ba046352d07d3755877bee33ebb
plan_head_after: b8b928c1
key-files:
  modified:
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
actuals:
  tasks: 3
  commits: 2
completed: 2026-11-22
---

# Quick 261122-tqm: Picker Cancel finds the opener row where it stands now

The ingredient picker's Cancel resolves the opener row's current line when Cancel is pressed, so focus returns to that row's Add ingredient (or grams) after the row moved, and the heading's Add ingredient takes focus only when the row is gone or the heading opened the picker.

## What changed

- `app/src/ui/CreationPage.jsx`: new module-level `openerLine(draft, rowId, group)` below `anchorHolds`. `handleCancelPicker` builds its `picker-opener` and `row-grams` requests from it against the committed `createDraft`. Two comments in the focus effect now read "row is gone" for "line is gone". No code line of the effect changed.
- `app/src/ui/CreationFlow.test.jsx`: six cases in a nested describe named for bug-p12-picker-cancel-focus-heading.

## Decisions

- The line is resolved at the press, against the committed draft (the one on screen).
- The pressed line is kept while it still stands, even if the row gained another line before it (case E).
- If the pressed line is gone but the row remains, the row's first line in method order is used (the rule `focusLine` already uses).
- A row that is gone returns the line as pressed, which is not drawn, so the effect's existing heading fallback takes it. The fallback stays in the effect, in one place. `openerLine` checks `draft.rows` before calling `rowLines`, which throws a RangeError for a missing row (T-tqm-01, case D runs that path).
- Consequence pinned by case F: when the opener row's step is removed while the picker is open, Cancel now lands on the row's Add ingredient. Before it landed on the heading's.

## Red evidence (at base, CreationPage.jsx unchanged)

Filtered run: `Tests 4 failed | 2 passed`. A, B, C and F each failed on `document.activeElement`, with focus on the heading's Add ingredient (`class="text-control mk-head-act"`, text "Add ingredient"):

- A: `expected <button …(2)> to be <button …(5)>` at `expect(document.activeElement).toBe(rowAdd(CREAM))` (expected aria-label "Add ingredient after Heavy cream, 36% fat").
- B: same message at `toBe(rowAdd(SUGAR))` (expected aria-label "Add ingredient after Sucrose").
- C: `expected <button …(2)> to be <textarea rows="1" …(3)>` at `toBe(gramsField(CREAM))`.
- F: same message as B at `toBe(rowAdd(SUGAR))`.

D (row removed, heading fallback) and E (line still stands) passed at the base, as guards.

## Green

- `CreationFlow.test.jsx` whole: 136 passed.
- Full suite: 136 files, 4544 tests passing. That is the batch baseline 4538 plus the six new cases; sibling 261122-tqj's cases were already in the base commit.
- Scratch build into `${TMPDIR}/sprinkles-tqm/dist` wrote index.html. `app/dist` and port 4173 untouched, no dev server started.
- Scope: only `CreationPage.jsx` and `CreationFlow.test.jsx` changed under `app/`. No changed code line mentions `querySelector`.

## Deviations from Plan

None. The plan's setup checks (groups, pickerName) matched the drawn state.

## Verification limits

No browser walk. The audit already reproduced the defect in Playwright WebKit and Chromium at 1366, and the jsdom cases assert `document.activeElement` through the same focus effect the browser runs. The fix changes only the line key that effect is given. Nothing here is device-verified.

## Known Stubs

None.

## Threat Flags

None.

## Deferred Human Verification

None.

## For the orchestrator

- The build is safe to deploy: no stored shape, DB_VERSION or wording changed.
- Mark's List: close the row for bug-p12-picker-cancel-focus-heading once the fix commit lands, with `resolvedAt` read from `date -u` and a one-line reply. The executor did not touch the list.

## Commits

- 261e580f: test(261122-tqm): Cancel cases for a picker whose opener row moved
- b8b928c1: fix(261122-tqm): the picker's Cancel finds the opener row where it stands now

## Self-Check: PASSED
