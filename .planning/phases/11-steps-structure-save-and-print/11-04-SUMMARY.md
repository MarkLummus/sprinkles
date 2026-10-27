---
phase: 11-steps-structure-save-and-print
plan: 04
subsystem: ui
tags: [react, steps, print-treatment, diff, webkit, board-conformance]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-01 walk (MATCH 94 snapshots, normtest) and board engine
provides:
  - StepReading.jsx (StepTargets, StepPurpose, StepAside, StepReading), the read-only step in the printed treatment on the screen classes
  - buildTargetDiff pairing repeated labels by occurrence
  - notebook.css tag row, why label and aside callout rules
  - 11-board-reading.mjs, the reading page, closed pen and Show changes measured against vC1 and fA1 in WebKit
affects: [11-06]

actuals:
  tokens: 7200
  tasks: 2
  commits: 2

plan_head_before: 619eba314d83e13a1c511aadb312ec0eee3e1767
commits: 2
plan_head_after: a39e5f2cad580ec38852503372f19af5488f2269

tech-stack:
  added: []
  patterns:
    - "One component set draws every read-only step branch (reading page, closed pen, Show changes, and 11-06's Preview)"
    - "StepTargets decides on the list it draws (targetDiffs ?? targets), never on the step's own targets length"
    - "Tag-row rules scoped by the --tags modifier and by direct children of .method-step__body, so the table's estimate flag and the open pen step's chips of fields keep their box"

key-files:
  created:
    - app/src/ui/StepReading.jsx
    - app/src/ui/StepReading.test.jsx
    - .planning/phases/11-steps-structure-save-and-print/11-board-reading.mjs
  modified:
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/domain/diff.js
    - app/src/domain/diff.test.js
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js

key-decisions:
  - "A changed target reads its label once, the old value struck, then the new value bold and underlined; a removed target is one struck tag; an added target reads plain (D-18, D-26). This is the plan's call, not drawn in a sketch (README 'For the plan' 8): Sid is told, no redraw."
  - "buildTargetDiff pairs the k-th occurrence of a label in the current step with the k-th in the baseline, then lists unpaired baseline occurrences; the descriptor shape is unchanged"

patterns-established:
  - "A board panel for a branch the reading page does not reach (closed pen, Show changes) names the same board panel (fA1) and a `steps` function that opens the state"

requirements-completed: [MAKE-07]

duration: 35min
completed: 2026-10-26
status: complete
---

# Phase 11 Plan 04: Steps in the printed treatment on screen Summary

**The reading page, the version pen's closed steps and Show changes draw a step's targets as a boxless tag row, its purpose as the caps word "why", and its aside as a callout, through one StepReading component set, measured against sketch 014's vC1 and fA1 in WebKit.**

## Performance

- **Tasks:** 2 (Task 1 tracer, Task 2 auto)
- **Files:** 9 changed (3 created)

## Accomplishments

- `StepReading.jsx` exports `StepTargets`, `StepPurpose`, `StepAside` and `StepReading`; every stored string is a React text child (T-11-13: a test renders `<b>&amp;` in a target, purpose and aside and finds escaped text, no element).
- `Method.jsx`'s three read-only branches (reading, closed pen, Show changes) render through them. The `targets?.length > 0` guards on those branches are gone; the one left is the open pen step's chips of fields.
- `notebook.css` gains the tag row, the why label, the upright purpose and aside and the aside callout, all `var()` reads, no new token, no new `@media` (still five). The open pen step and the table's estimate flag keep their box.
- `diff.js` `buildTargetDiff` matches repeated labels by occurrence, so two `temp` targets on a step read as two tags on all three branches (T-11-49).
- A step whose only target was removed still reads that target as one struck tag in Show changes and the closed pen (T-11-49).
- `11-board-reading.mjs`: vC1, fA1, fA1-pen and fA1-changes, 98 PASS, 0 FAIL, each with `--selftest` PASS.

## Task Commits

1. **Task 1 (tracer): the reading page in the printed treatment, matched to vC1 in WebKit** - `b5574c8b` (feat)
2. **Task 2: closed pen and Show changes in the tag row, struck/removed/added targets, repeated labels** - `a39e5f2c` (feat)

Tracer gate: Task 1's `<verify>` is automated-only, so under `end-of-phase` it was re-run end to end (unit tests, build, board run `78 PASS, 0 FAIL`) before Task 2.

## Verification

- Full suite: baseline in this worktree 122 files, 3931 tests passed; after this plan 123 files, 3956 tests passed (25 added).
- Board: `11-board-check.mjs 11-board-reading.mjs --selftest` ends `98 PASS, 0 FAIL`, with `PASS selftest vC1`, `fA1`, `fA1-pen`, `fA1-changes`. Everything matched on the first measurement; no CSS value needed adjusting.
- Walk: `11-walk-check.sh` ends `MATCH 94 snapshots`.
- normtest on this build: nine PASS lines including `PASS normtest struck-real` and `PASS normtest struck-real-value` (Mexican Chocolate v2's Show changes reads `["temp",null,"75 °C"]` and `["hold","45 min","60 min"]` through the new label-first markup).
- Acceptance greps: `method-step__purpose-label` in StepReading.jsx 1; `StepTargets` in Method.jsx 2; `text-underline-offset: var(--sheet-print-tag-underline-offset)` in notebook.css 1; `@media` in notebook.css 5; `text-decoration: underline` in app.css 2; `targetDiffs` in Method.jsx 2; `targets?.length > 0 && (` in Method.jsx 1; `'temp 10 C'` in Method.test.jsx 0; PrintSheetPages.jsx, print.css and 11-walk.mjs are in neither commit.

## Pins moved (Method.test.jsx)

- `'temp 10 C'` inside the struck value became `<span class="target-chip__label">temp</span><span class="struck-value">10 C</span>` (the label reads once).
- The closed pen's purpose string gained the why label span: `<p class="method-step__purpose"><span class="method-step__purpose-label">why</span> — Original purpose.</p>`; the aside string is unchanged.
- Pins kept: cross-cutting.test.js:769 (app.css base rule untouched), binder.test.js underline scope (underline lives in notebook.css), notebook.test.js (all rules under `.notebook`, five media conditions), PrintSheetPages.test.jsx:317.

## Deviations from Plan

None - plan executed as written, with one ordering note: the walk and normtest scratch builds go to the session scratchpad rather than `$TMPDIR/sprinkles-11` (the per-checkout scratch the scripts key by directory name is unchanged in behaviour).

## Issues Encountered

None. The notebook.test.js selector lookup collapses whitespace (css-source.js), so the multi-selector rule is found by its single-space form.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path, file access or schema surface.

## Notes for Mark and Sid

How a struck value reads in the tag row (label once, old value struck, new value bold and underlined; a removed target one struck tag; an added one plain) is the plan's call, not drawn (README "For the plan" 8). Sid is told; no redraw.

## Next Phase Readiness

11-06's Preview step can render `StepReading` inside `.mk-preview`. 11-06 also edits Method.jsx and notebook.css; this plan kept its edits to the three read-only branches and one block appended at the end of notebook.css.

## Self-Check: PASSED

- Files found: app/src/ui/StepReading.jsx, app/src/ui/StepReading.test.jsx, 11-board-reading.mjs.
- Commits found: b5574c8b, a39e5f2c.
