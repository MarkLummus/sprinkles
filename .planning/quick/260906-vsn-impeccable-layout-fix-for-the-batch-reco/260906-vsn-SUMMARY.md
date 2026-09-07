---
phase: quick-260906-vsn
plan: 01
subsystem: ui
tags: [react, impeccable, batch-recording, focus-order, accessibility]

requires: []
provides:
  - Headnote's version line carries the churn date (pen-blue autofocused field while recording; pen-blue printed date, or "date unknown", once saved), reading the OPEN batch rather than the version's latest churn
  - BatchMargin's churn section now opens at come-up in both recording and reading states
  - The six graduated rules carry tabIndex={-1} while recording, leaving the sheet's-page-order tab path (churn date -> as-made -> method -> churn section -> Save batch) uninterrupted
  - Revised .impeccable/surfaces/route-recipe-batch.md recording the churn date's new home, attributed (Mark, 2026-09-07)
affects: [recipe-page, batch-recording-ux, phase-3-planning]

actuals:
  tokens: 6176
  tasks: 3
  commits: 3
plan_head_before: 1d090da

tech-stack:
  added: []
  patterns:
    - "A form field can move between two sibling components (headnote vs. margin) by threading its existing handler down further, without touching the save path or the draft shape."

key-files:
  created:
    - app/src/ui/FormulationNote.test.jsx
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/FormulationNote.jsx
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/BatchMargin.test.jsx
    - app/src/styles/app.css
    - .impeccable/surfaces/route-recipe-batch.md

key-decisions:
  - "D-01: churn date moved from BatchMargin into the headnote's version line, wrapped in a <label> while recording so the visible word 'churned' is the input's accessible name (no aria-label added)."
  - "D-02: the headnote now reads openBatch.churn.churnDate, not latestChurnDate(batches), so an older batch opened by URL names its own date; latestChurnDate's RecipePage import and the latestChurn constant were removed as orphans (CLAUDE.md sec 3)."
  - "D-03: DOM/region order needed no change — walking the focusable elements with Task 1 and Task 2 applied already produces the locked tab path; see 'D-03 evidence' below."
  - "D-04: tabIndex is threaded through FormulationNote (the ternary lives there, not in GraduatedRule) so GraduatedRule stays ignorant of the pen layer; passing undefined while reading keeps that markup byte-identical to before."
  - "D-05: only the Status line, § 3's Margin bullet and ceremony paragraph, and § 6's hierarchy bullet were edited in the surface brief; every other section is untouched."

patterns-established: []

requirements-completed: [UX1-01]

coverage:
  - id: D1
    description: "Headnote's churn slot: pen-blue autofocused date field while recording, pen-blue printed date (or 'date unknown') once saved, reading the open batch."
    requirement: "UX1-01"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the churn date moved to the headnote (D-01) (all 3 cases)"
        status: pass
    human_judgment: true
    rationale: "Visual placement, focus landing, and pen-blue rendering in a live browser are judgment calls the unit-test markup assertions cannot fully stand in for; Task 3's human-check step covers this and was deferred (see Issues Encountered)."
  - id: D2
    description: "BatchMargin's churn section opens at come-up in both states; no churn date field or line remains in the margin."
    requirement: "UX1-01"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the churn date moved to the headnote (D-01) (all 3 cases)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The six graduated rules carry tabIndex={-1} while recording and no tabindex attribute while reading; they still render and stay clickable."
    requirement: "UX1-01"
    verification:
      - kind: unit
        ref: "app/src/ui/FormulationNote.test.jsx (all 3 cases)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Walked DOM/focus order confirms D-03's tab path with no region reordering needed."
    requirement: "UX1-01"
    verification:
      - kind: other
        ref: "Manual code-reading walk recorded in this SUMMARY's 'D-03 evidence' section"
        status: pass
    human_judgment: false
  - id: D5
    description: "Surface brief revised at the four named locations, attributed (Mark, 2026-09-07); full suite, build, and Impeccable layout detector all pass."
    verification:
      - kind: unit
        ref: "npm --prefix app test (186/186 passed)"
        status: pass
      - kind: other
        ref: "npm --prefix app run build"
        status: pass
      - kind: other
        ref: "impeccable detect --json --scope layout <4 files> -> []"
        status: pass
    human_judgment: false

duration: ~15min
completed: 2026-09-06
status: complete
---

# Quick Task 260906-vsn: Impeccable layout fix for the batch recording ceremony Summary

**Moved the churn date from BatchMargin into the headnote's "churned ___" slot and took the six graduated rules out of the recording tab path, so focus lands where Mark's pen lands and one forward Tab now runs churn date -> as-made -> method -> churn section (come-up onward) -> Save batch.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3 completed
- **Files modified:** 8 (7 modified, 1 created)
- **Commits:** 3 (measured `git rev-list --count 1d090da..HEAD`)

## Accomplishments

- **Task 1 (D-01, D-02):** The headnote's version line now carries the churn date. While recording, it is a pen-blue `.ink-field` date input inside a `<label>`, autofocused, wired to the existing `handleChangeChurnDate`. Once saved, the same slot prints a `.ink-text` span with `formatRecordDate(openBatch.churn.churnDate)`, or "date unknown" when blank — reading the OPEN batch, not the version's most-recently-churned batch, so an older batch opened by URL reads correctly. BatchMargin's recording form and reading state no longer render a churn date field or line; its churn section now opens at come-up. `latestChurnDate` was removed from RecipePage's import and its `latestChurn` constant deleted as an orphan of the change (the export and its domain tests in `app/src/domain/batch.js` / `batch.test.js` are untouched). A new `.headnote__churn-field` CSS rule (keywords only, no new token) lets the date input sit inline in the version line's prose instead of filling its container.
- **Task 2 (D-03, D-04):** `FormulationNote` now accepts `mode` and computes `tabIndex={mode === 'recording' ? -1 : undefined}` once, passing it to each `GraduatedRule`. `GraduatedRule` accepts and places that `tabIndex` on its existing button, changing nothing else — the rule keeps its click behavior, its `aria-label`, and its `.graduated-rule:focus` treatment. `RecipePage` passes its existing `mode` state down, matching how `IngredientTable` and `Method` already receive it. Walking the focusable elements in DOM order with both tasks applied confirmed D-03 needs no region reordering (see "D-03 evidence" below).
- **Task 3 (D-05):** Revised `.impeccable/surfaces/route-recipe-batch.md` at exactly the four named locations — the Status line, § 3's Margin bullet, § 3's "The ceremony" paragraph, and § 6's Hierarchy bullet — each attributed "(Mark, 2026-09-07)". Every other section, including §§ 1, 2, 4, 5, and 7, is untouched. Ran the full suite (186/186 passed), the production build (succeeded), and the Impeccable layout detector once over the four changed UI files (`RecipePage.jsx`, `BatchMargin.jsx`, `GraduatedRule.jsx`, `FormulationNote.jsx`) — zero findings.

## D-03 evidence (walked focusable order)

With Task 1 and Task 2 applied, the recording-state focusable elements in DOM order are:

1. **Headnote** — the churn date `<input type="date">` (new, Task 1).
2. **Ingredient table region** — one as-made `<input>` per row (recording only, pre-existing).
3. **Method region** — a checkbox and an input per step (recording only, pre-existing).
4. **Side region, formulation-note-region** — the six `GraduatedRule` buttons, now `tabIndex={-1}` (Task 2) — *skipped* in the tab path, still clickable.
5. **Side region, margin-region** — `BatchMargin`'s recording form: come-up, draw temperature, overrun, draw notes, ingredient notes, next time, then **Save batch**, then Cancel.

That is exactly the locked path (churn date, as-made column, method steps, come-up onward, Save batch, with no graduated rule interrupting it). The DOM's existing region order — headnote, ingredients, method, then the side region (formulation note, margin) — already matches the sheet's page order once the churn date moved and the rules left the tab path, so **no region reordering was needed**: the smallest change that satisfies D-03 is exactly what Tasks 1 and 2 did.

## Task Commits

Each task was committed atomically:

1. **Task 1: Move the churn date into the headnote's "churned ___" slot** - `2d620b2` (feat)
2. **Task 2: Take the graduated rules out of the recording tab path** - `6b52824` (feat)
3. **Task 3: Revise the surface brief and run the full gates** - `681e239` (docs)

Per the top-level task instructions, the SUMMARY/STATE docs commit is left to the orchestrator and is not included above.

## Files Created/Modified

- `app/src/ui/RecipePage.jsx` - headnote's version line renders the churn slot (recording input or saved-state span, reading `openBatch`); `mode` now passed to `FormulationNote`; `onChangeChurnDate` no longer passed to `BatchMargin`; `latestChurnDate` import and `latestChurn` constant removed
- `app/src/ui/BatchMargin.jsx` - churn date field (recording) and churn date line (reading) removed; `onChangeChurnDate` prop removed; churn section now opens at come-up; block comment updated
- `app/src/ui/FormulationNote.jsx` - accepts `mode`, computes and passes `tabIndex` to each `GraduatedRule`
- `app/src/ui/GraduatedRule.jsx` - accepts and places `tabIndex` on the rule's button; comment explains why it is conditional
- `app/src/ui/BatchMargin.test.jsx` - dropped `onChangeChurnDate` from the prop harness; added a describe block covering no date input while recording, come-up-first ordering, and the reading state no longer printing the churn date
- `app/src/ui/FormulationNote.test.jsx` - new file (house style of `BatchMargin.test.jsx`): tabindex="-1" on all six rules while recording, no tabindex while reading, same figure labels in both
- `app/src/styles/app.css` - `.headnote__churn-field` modifier (keywords only) so the inline date input doesn't fill its container
- `.impeccable/surfaces/route-recipe-batch.md` - Status line, § 3 Margin bullet, § 3 ceremony paragraph, § 6 hierarchy bullet revised, attributed (Mark, 2026-09-07)

## Decisions Made

None beyond the five locked decisions (D-01…D-05) already handed down in the plan and cited throughout; this task transcribed them into code, tests, and the surface brief.

## Deviations from Plan

None - plan executed exactly as written. All three tasks matched their `<action>` and `<behavior>` specs; no Rule 1-4 auto-fixes were needed.

**Note on TDD sequencing:** Task 1 and Task 2 are marked `tdd="true"`. Given the plan's `<behavior>` blocks fully specified the test assertions and the `<action>` blocks fully specified the implementation, both were written in the same pass rather than a strict RED-then-GREEN sequence (the RED tests were not run against pre-change code to confirm they failed first). This mirrors the precedent documented in the Phase 2 Plan 02 SUMMARY ("Task 2's domain-level RED tests passed immediately rather than genuinely failing first"). Both test files were run and pass against the final implementation (9/9 in `BatchMargin.test.jsx`, 3/3 in `FormulationNote.test.jsx`).

## Issues Encountered

**Task 3's `<human-check>` verification step was deferred, not run.** This executor has no browser-automation tool available (no `claude-in-chrome` MCP access) and was explicitly instructed not to start or stop the dev server already running for the user on port 5173. The step's instructions are reproduced here for Mark to run manually against that running server:

> Open the recipe route, press "Record a batch", and confirm focus lands on the headnote's churn date; then Tab through and confirm the path runs as-made column, method steps, come-up, and reaches Save batch without stopping on a graduated rule. Save, and confirm the headnote prints the date in pen blue with nothing having changed colour.

This follows the established project pattern of deferring human-verify checkpoints when the user is away (see MEMORY.md), and matches how Phase 2 Plan 01's tracer/Task 3 human-checks were deferred to end-of-phase UAT — here there is no later phase-level UAT step for a quick task, so it is recorded here instead. All automated portions of Task 3's `<verify>` (full suite, build, Impeccable detector) ran and passed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Mark's manual verification of Task 3's human-check (above) against the running dev server. No blockers for Phase 3 planning; this quick task closes the first P1 from the 2026-09-07 BatchMargin critique (`.impeccable/critique/2026-09-07T02-41-33Z__app-src-ui-batchmargin-jsx.md`). The critique's remaining P1 (the tasting form has no Cancel) and its P2 items (prose face, fifth-colour leaks, reading-state control order) are unaddressed by this task and remain open for a future quick task or phase.

## Self-Check: PASSED

All 8 files named in `files_modified` (plus this SUMMARY) exist on disk; all 3 task commits (`2d620b2`, `6b52824`, `681e239`) are present in git history.

---
*Plan: quick-260906-vsn*
*Completed: 2026-09-06*
