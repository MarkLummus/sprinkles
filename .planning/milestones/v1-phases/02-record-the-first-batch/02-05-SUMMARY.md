---
phase: 02-record-the-first-batch
plan: 05
subsystem: ui
tags: [react, css, text-decoration, vitest, react-dom-server, component-test, gap-closure]

# Dependency graph
requires:
  - phase: 02-record-the-first-batch
    provides: Method.jsx (02-02), AxisMark.jsx and domain/axes.js (02-03), the component-test pattern established in BatchMargin.test.jsx (02-04)
provides:
  - The struck-step "Skipped" label rendered outside the decorated element, so a propagated text-decoration cannot strike it
  - setMark(marks, axisKey, stop), the one pure rule for writing and clearing a mark
  - A per-axis Clear control on AxisMark, rendered only while that axis carries a mark
  - Two more component-test files (Method.test.jsx, AxisMark.test.jsx) following the renderToStaticMarkup pattern
affects: [phase-2-uat, phase-2-verification]

# Actuals (#2632)
actuals:
  tokens: 4255
  tasks: 2
  commits: 4

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "A block-level text-decoration is scoped to an inner span wrapping only the decorated content, so a sibling label placed after that span is never struck by CSS propagation (CSS Text Decoration L3)"
    - "A reversible control that shares its setter's onChange, passing null to mean clear, keeps one code path for both directions instead of adding a parallel delete handler"

key-files:
  created:
    - app/src/ui/Method.test.jsx
    - app/src/ui/AxisMark.test.jsx
  modified:
    - app/src/ui/Method.jsx
    - app/src/styles/app.css
    - app/src/domain/axes.js
    - app/src/domain/axes.test.js
    - app/src/ui/AxisMark.jsx
    - app/src/ui/RecipePage.jsx

key-decisions:
  - "The strike is scoped to an inner prose span (A-1) rather than moving the label out of the paragraph — the smaller diff, and the only one that keeps the label on the same line beside the prose."
  - "Clearing a mark is a small per-axis text control reading 'Clear', rendered only while that axis carries a mark (A-2) — the native radio group is unchanged: nine stops, arrow keys, one click sets, no tenth 'unmarked' stop."
  - "The clear rule lives in the domain as setMark, not inline in the page handler (A-3), so the delete path is provable in the node suite the way handleChangeStepChange's inline delete-on-empty rule is not."
  - "The click-through verification (misclick recovery, tab order, the struck step reading clean) is deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase (A-4: component gates render through react-dom/server, not a DOM environment, so the click path itself is out of this plan's automated scope)."

requirements-completed: [BATCH1-01, OBS1-01]

coverage:
  - id: D1
    description: "A struck method step shows a Skipped label that is itself legible — the strike is drawn through the step's prose only, never through the label"
    requirement: BATCH1-01
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — a struck step > closes the struck element before the Skipped label opens — the label is outside what was struck"
        status: pass
    human_judgment: false
  - id: D2
    description: "The strike still reads as a strike: the step's prose is struck and fully readable"
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — a struck step > keeps the step's prose inside the decorated element — the strike is scoped, not removed"
        status: pass
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — an unstruck step > renders neither the struck modifier class nor the Skipped label"
        status: pass
    human_judgment: false
  - id: D3
    description: "While composing a tasting, an axis that carries a mark offers a way to clear it; an axis with no mark offers nothing to clear"
    requirement: OBS1-01
    verification:
      - kind: unit
        ref: "app/src/ui/AxisMark.test.jsx#AxisMark — an unmarked axis > renders no clear control and checks no stop"
        status: pass
      - kind: unit
        ref: "app/src/ui/AxisMark.test.jsx#AxisMark — a marked axis > renders the clear control, and checks the input whose value is the mark"
        status: pass
    human_judgment: false
  - id: D4
    description: "Clearing the last mark returns the draft to its pre-mark state: the save control is disabled again and the hint returns"
    requirement: OBS1-01
    verification:
      - kind: unit
        ref: "app/src/domain/axes.test.js#setMark > clearing the last mark returns isTastingSaveable to false, asserted across the two pure modules"
        status: pass
    human_judgment: false
  - id: D5
    description: "setMark sets, replaces, clears, and never mutates the marks object it is given"
    verification:
      - kind: unit
        ref: "app/src/domain/axes.test.js#setMark (all cases)"
        status: pass
    human_judgment: false
  - id: D6
    description: "The mark control stays a native grouped radio set — nine stops, arrow keys, one click sets — with no tenth stop and no hand-rolled radiogroup"
    verification:
      - kind: unit
        ref: "app/src/domain/axes.test.js#MARK_STOPS > is exactly the nine stops from 1 to 5 by halves, including 4.5"
        status: pass
      - kind: other
        ref: "grep gate: AxisMark.jsx still renders exactly the MARK_STOPS radio inputs, no keydown handler, no manual focus-index (unchanged by this plan's diff)"
        status: pass
    human_judgment: false
  - id: D7
    description: "The click-through recovery from a misclick, and the struck step reading clean in the real UI, are confirmed end to end"
    verification: []
    human_judgment: true
    rationale: "Task 2's <human-check> (a five-step click-through covering clear/re-mark, tab order and focus visibility, and a visual check of the struck step) needs a DOM environment and click simulation, which A-4 explicitly leaves out of this plan's render-only component gate. Deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase."

duration: 15min
completed: 2026-09-07
status: complete
---

# Phase 2 Plan 5: A strike that draws through prose only, and a mark that can be taken back Summary

**Scoped the method-step strike to an inner prose span so the "Skipped" label reads legible beside it (not through it), and added `setMark` plus a per-axis `Clear` control so a placed tasting mark can be removed before the tasting is saved.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-09-06T20:00:00-04:00 (approx.)
- **Completed:** 2026-09-06T20:12:16-04:00
- **Tasks:** 2
- **Files modified:** 8 (2 created, 6 modified)

## Accomplishments
- `Method.jsx`'s struck-step label no longer inherits the strike: the lead-in and instruction are now wrapped in an inner `<span className="method-step__prose--struck">`, and the `Skipped` label sits after it as a sibling, not a descendant — the decoration set on `.method-step__prose--struck` in `app.css` (renamed from the old paragraph-level modifier) can no longer propagate onto the label, per CSS Text Decoration L3 (G-02-3).
- `Method.test.jsx` — the repo's second component test — proves the structural invariant the old string-presence gate could never make: the decorated element's own closing `</span>` appears before the label's opening tag in the rendered markup.
- `domain/axes.js` gained `setMark(marks, axisKey, stop)`: pure, framework-free, sets a stop or (with `stop === null`) removes the axis's own key, never mutating its argument. Built with object spread and delete to write only own properties (T-02-32).
- `AxisMark.jsx` now renders a `Clear` button — class `axis-mark__clear`, accessible name `Clear {axis label} mark` — only while that axis carries a mark, requesting the clear through the same `onChange` the stops already use, carrying `null`. The nine-stop native radio group, its keyboard semantics, and its "no default checked" behavior are all untouched.
- `RecipePage.jsx`'s `handleChangeTastingMark` now writes through `setMark` instead of a raw spread-and-assign, so the same handler gained a delete path without gaining a branch — closing G-02-6, the pen layer's only previously one-way control.
- `AxisMark.test.jsx` proves the clear control's conditional presence and that its accessible name carries the axis label, so six of them on one tasting form are distinguishable.

## Task Commits

Each task followed its own RED → GREEN cycle:

1. **Task 1 RED: failing test for the Skipped label rendering outside the strike** — `1b94b68` (test)
2. **Task 1 GREEN: scope the strike to the step's prose** — `2098520` (feat)
3. **Task 2 RED: failing tests for a mark that can be cleared** — `307cb7a` (test)
4. **Task 2 GREEN: a mark that can be taken back** — `13e3287` (feat)

No REFACTOR commit was needed — both GREEN implementations were already minimal.

## Files Created/Modified
- `app/src/ui/Method.test.jsx` - asserts the struck element closes before the label opens, the prose stays inside the decorated element, an unstruck step carries neither class, and a changed line still renders
- `app/src/ui/Method.jsx` - wraps the lead-in and instruction in a `method-step__prose--struck` span; the label is now a sibling
- `app/src/styles/app.css` - renamed `.method-step__lead--struck` to `.method-step__prose--struck` (selector rename, values unchanged); added `.batch-margin .axis-mark__clear` (existing tokens only, zero top margin)
- `app/src/domain/axes.js` - added `setMark`
- `app/src/domain/axes.test.js` - extended with `setMark`'s set/replace/clear/never-mutate cases and the cross-module `isTastingSaveable` assertion
- `app/src/ui/AxisMark.jsx` - added the conditional `Clear` control
- `app/src/ui/AxisMark.test.jsx` - asserts the clear control's conditional presence, the checked stop, and the accessible name
- `app/src/ui/RecipePage.jsx` - `handleChangeTastingMark` now calls `setMark`

## Decisions Made
- A-1: the strike moves onto an inner prose span rather than moving the label out of the paragraph — smaller diff, keeps the label on the same line.
- A-2: the clear affordance is a small text control beside the native radio group, not a tenth stop or a rewritten `role="radiogroup"`.
- A-3: the clear/set rule lives in the domain (`setMark`) rather than inline in the page handler, so it is provable in the node suite the way the page's other inline delete-on-empty rules are not.
- A-4: the click-through path (actually clicking Clear and watching the draft return to unmarked) needs a DOM environment this plan does not add; deferred to end-of-phase UAT, matching plan 02-04's precedent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed a test-only attribute-order assumption in AxisMark.test.jsx during GREEN**
- **Found during:** Task 2 GREEN verification (`npm --prefix app test`)
- **Issue:** The RED-phase test sliced from the `value="4.5"` substring forward to the next `/>`, assuming `checked` would appear after `value` in the serialized markup. `react-dom/server` actually orders `checked` before `value` in its output, so the slice missed the `checked` attribute even though the correct stop was in fact checked.
- **Fix:** Changed the slice to start from the enclosing `<input` tag's own start (`lastIndexOf('<input', stopIndex)`) rather than from the `value` substring, so the whole tag is inspected regardless of attribute order.
- **Files modified:** `app/src/ui/AxisMark.test.jsx`
- **Verification:** `npm --prefix app test` — all 180 tests pass
- **Committed in:** `13e3287` (part of Task 2 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 bug, test-only)
**Impact on plan:** No production code was affected; the fix corrects a test assertion's assumption about serialization order. No scope creep.

## Issues Encountered

None.

## Gap Closure Status

**G-02-3 is fully closed.** The `Skipped` label is now structurally outside the struck element in every render — proved by `Method.test.jsx`, which is the exact kind of structural assertion the original string-presence gate could not make. The strike itself is unmoved: it still reads through weight and a drawn line, scoped to the step's prose, never removed.

**G-02-6 is fully closed at the domain and control level.** `setMark`'s delete path is proved pure and non-mutating in the node suite, and the same function now backs the page's only write path to `tastingDraft.marks`, so `AxisMark`'s new `Clear` control and the save gate it feeds (`isTastingSaveable`) are both provably correct without a DOM. The remaining click-through confirmation (actually clicking `Clear` in a running app and watching the save gate and hint return) is deferred to end-of-phase UAT (A-4), matching the precedent set in plan 02-04's own human-check deferral.

## Human Verification Deferred

Task 2's `<human-check>` (six-step check: no axis marked shows no clear control and a disabled `Save tasting` with its hint; marking one axis shows only that axis's `Clear` and enables save; clicking `Clear` returns the form exactly to its pre-mark state; marking three axes and clearing the middle one saves correctly with the cleared axis reading "unmarked"; tab order and focus visibility across the stops and the clear control; and a visual confirmation that the 2 Aug batch's step 1 still reads struck with `Skipped` unstruck beside it) is deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase` (the project default), exactly as plan 02-04's own human-check was deferred. All automated verification for both tasks was re-run and passes:
- `npm --prefix app test` — 10 test files, 180 tests passed (up from 166 before this plan; 4 new in Method.test.jsx, 7 new in axes.test.js, 3 new in AxisMark.test.jsx)
- `npm --prefix app run build` — built in ~60-75ms, no resolution errors
- `grep -c 'method-step__prose--struck' app/src/styles/app.css` — 1 (the renamed selector)
- `grep -rIl 'dangerouslySetInnerHTML' app/src` — 0 matches
- `grep -v '^[[:space:]]*//' app/src/ui/AxisMark.jsx | grep -c 'onChange(null)'` — 1
- `grep -v '^[[:space:]]*//' app/src/ui/RecipePage.jsx | grep -c 'setMark('` — 1
- `grep -v '^[[:space:]]*[/*]' app/src/domain/axes.js | grep -cE "from '(react|react-dom|react-router)'|require\(|document\.|window\."` — 0
- Dependency count — 7 (4 dependencies + 3 devDependencies, unchanged)
- `app/src/ui/BatchMargin.jsx` — confirmed unchanged by this plan (`git diff --stat` across this plan's commit range shows no entry for it)
- `app/src/styles/tokens.css` — confirmed unchanged (no new token added)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both UAT reports this plan targets (test 3's struck label, test 6's unremovable mark) now have automated evidence; full click-through confirmation is deferred to end-of-phase UAT above.
- The pen layer no longer contains a one-way control against gap G-02-6's scope: every mark on the tasting form can be scratched out before it is saved.
- The findability half of G-02-4 (button style/weight, layout position — noted in 02-04-SUMMARY.md) remains open against Impeccable; unrelated to this plan's scope.
- This was the last plan of Phase 2's gap-closure wave (02-04, 02-05); Phase 2 verification and end-of-phase UAT can proceed next.

---
*Phase: 02-record-the-first-batch*
*Completed: 2026-09-07*

## Self-Check: PASSED

- FOUND: app/src/ui/Method.test.jsx
- FOUND: app/src/ui/AxisMark.test.jsx
- FOUND: SUMMARY (this file)
- FOUND: 1b94b68, 2098520, 307cb7a, 13e3287 (all four task commits present in git log)
