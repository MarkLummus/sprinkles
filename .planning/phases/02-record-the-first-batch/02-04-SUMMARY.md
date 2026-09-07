---
phase: 02-record-the-first-batch
plan: 04
subsystem: ui
tags: [react, vitest, react-dom-server, component-test, gap-closure]

# Dependency graph
requires:
  - phase: 02-record-the-first-batch
    provides: BatchMargin.jsx, RecipePage.jsx, and the batch/tasting domain built in plans 01-03
provides:
  - A new-batch entry point ("Record another batch") in the saved-batch reading state, worded distinctly from Amend
  - A cancel control in the recording state that discards the draft and amend target without writing
  - Truthful wording distinguishing "no batch at all" from "URL names a batch id this version does not have"
  - handleStartRecording clearing the amend target, so a recording started after an amendment always creates rather than overwrites
  - The repo's first component test (BatchMargin.test.jsx, react-dom/server, node environment, no new dependency)
affects: [02-05, phase-2-uat, phase-2-verification]

# Actuals (#2632)
actuals:
  tokens: 1960
  tasks: 2
  commits: 4

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Component tests render through renderToStaticMarkup (react-dom/server) in the existing node Vitest environment — no jsdom, no testing-library, no new dependency"

key-files:
  created:
    - app/src/ui/BatchMargin.test.jsx
  modified:
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/RecipePage.jsx

key-decisions:
  - "Record another batch is worded distinctly from Amend and placed after the batch list, before the tastings (A-2), so the margin reads: this batch, this version's batches, a way to add one, this batch's tastings."
  - "The zero-batch fallthrough branch now chooses its sentence from batches.length: unconditionally true for a version with none, and a different sentence — 'No batch of this version has that address.' — when the URL names a batch id this version does not have."
  - "Cancel discards immediately with no confirmation dialog (A-1); the native beforeunload warning is untouched and continues to guard tab close/reload for unsaved ink."
  - "No button token, no button style rule, and no layout change were added for the cancel control (A-3) — that half of G-02-4 (Save batch hard to find) stays open against Impeccable."

requirements-completed: [BATCH1-01, BATCH2-02]

coverage:
  - id: D1
    description: "The saved-batch reading state offers a way to record another batch, worded distinctly from Amend"
    requirement: BATCH1-01
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — saved-batch reading state > offers both a way to record another batch and a way to amend, worded differently"
        status: pass
    human_judgment: false
  - id: D2
    description: "A URL naming an unknown batch id states that fact, distinct from 'no batch recorded'"
    requirement: BATCH2-02
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — unknown-address state > says the address is not a batch of this version, not that the version has no batch"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the two entry states are distinguishable > renders different wording for zero-batch and unknown-address"
        status: pass
    human_judgment: false
  - id: D3
    description: "The recording state offers Cancel beside Save batch; the reading state offers neither"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — recording state offers a way out that does not save > offers both Save batch and Cancel, Cancel as a real button"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — reading state offers no way to abandon an edit that is not happening > does not render the cancel wording"
        status: pass
    human_judgment: false
  - id: D4
    description: "A recording started after an amendment creates a new batch and leaves the amended one alone (amend-target reset); Cancel writes nothing (no repository call, no batch list mutation, no amendment date)"
    verification:
      - kind: other
        ref: "grep gate: setAmendingBatchId(null) appears in >=2 non-comment places in RecipePage.jsx; handleCancelRecording body contains no repository/setBatches/date-construction call"
        status: pass
    human_judgment: true
    rationale: "The click-through sequence (amend, cancel, record another batch, verify the older batch is unchanged when reopened by its own URL) needs a DOM environment and click simulation, which A-4 explicitly leaves out of scope for this plan's render-only component gate. Covered by task 2's <human-check>, deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase."

duration: 15min
completed: 2026-09-07
status: complete
---

# Phase 2 Plan 4: Two doors for the pen layer — a way in with a batch already recorded, a way out that writes nothing Summary

**Added a `Record another batch` entry point reachable from the version's actual working state, and a `Cancel` control that abandons a recording or amendment without touching the store — closing G-02-1 fully and G-02-4's cancel half, plus the repo's first component test.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-09-06T23:47:00Z (approx.)
- **Completed:** 2026-09-07T00:02:00Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- The saved-batch reading state now offers `Record another batch` after the batch list, worded distinctly from `Amend` so it can never be mistaken for a correction (D-06) — this is the fix for G-02-1: the control that was previously unreachable on every real store (the seeded working case always has a batch, so the old code's only entry point, gated on `openBatch === null`, was dead).
- A URL naming a batch id the version does not have now says so ("No batch of this version has that address.") instead of falsely claiming the version has no batch recorded at all (T-02-25).
- `handleStartRecording` clears the amend target as its first act — closing a tampering threat (T-02-24) that task 1 itself created by making the new-batch entry reachable: without the reset, a recording started right after an amendment would silently overwrite the amended batch instead of creating a new one.
- The recording branch now offers `Cancel` beside `Save batch`; `handleCancelRecording` returns to reading, drops the draft, and clears the amend target — no repository call, no batch-list mutation, no amendment date (T-02-26). This closes the cancel half of G-02-4.
- Created `app/src/ui/BatchMargin.test.jsx`, the repo's first component test: renders `BatchMargin` through `renderToStaticMarkup` (react-dom/server) in the existing node Vitest environment, asserting on markup strings for four states — no jsdom, no testing-library, no new dependency (A-4).

## Task Commits

Each task followed its own RED → GREEN cycle:

1. **Task 1 RED: failing tests for new-batch entry and unknown-address wording** — `ad9f34a` (test)
2. **Task 1 GREEN: a door in when the version already has a batch** — `86bbe15` (feat)
3. **Task 2 RED: failing tests for the cancel control** — `ffa53d5` (test)
4. **Task 2 GREEN: a door out that does not write** — `01ba390` (feat)

No REFACTOR commit was needed — both GREEN implementations were already minimal.

## Files Created/Modified
- `app/src/ui/BatchMargin.test.jsx` - the repo's first component test; renders BatchMargin's reading, zero-batch, unknown-address, and recording states through `renderToStaticMarkup`
- `app/src/ui/BatchMargin.jsx` - added the `Record another batch` control, the address-aware fallthrough sentence, the `Cancel` control, and the `onCancelRecording` prop
- `app/src/ui/RecipePage.jsx` - `handleStartRecording` now clears `amendingBatchId`; added `handleCancelRecording` and wired it to the margin

## Decisions Made
- `Record another batch` sits after the batch list and before the tastings (A-2): the margin now reads this batch, this version's batches, a way to add to that list, then this batch's tastings.
- Cancel discards immediately with no confirmation dialog (A-1) — the brief forbids an invented dialog (D-24), and the native `beforeunload` warning still guards accidental loss on tab close/reload, keying off the same dirty-draft check.
- No button style, token, or layout change was invented for Cancel (A-3) — visual weight and findability for `Save batch` are Impeccable's decisions, tracked separately.

## Deviations from Plan

None - plan executed exactly as written, including both TDD cycles (RED confirmed failing on the target assertion before each GREEN implementation).

## Issues Encountered

None.

## Gap Closure Status

**G-02-1 is fully closed.** The `Record a batch` control is now reachable from every state a maker can actually reach: the zero-batch state (unchanged), and the saved-batch reading state (new, via `Record another batch`). A second batch dated later can now be recorded, appears in the margin's batch list, and the older batch is unaffected — unblocking UAT test 8's second-batch step.

**G-02-4 is only partly closed.** The cancel control is delivered in full: a maker who opens the pen layer by mistake, or starts an amendment and changes their mind, can leave in one click with the record untouched. The other half of G-02-4 — "Save batch is hard to find" — has two named causes per `.planning/debug/pen-layer-no-cancel-save-hard-to-find.md`: (a) no button token or control weight is defined anywhere in the direction contract (the brief's "binder's button style" is a dangling reference), and (b) the recording margin's foot-of-column position, roughly 1400px down the page's longest column. **Neither is addressed by this plan** (A-3) — both are design decisions that belong to Impeccable, already tracked under Phase 2's `## Deferred Follow-Ups` (test 4) and in the gap's own `missing` list. This plan invented no button style, no token, and no layout change.

## Human Verification Deferred

Task 2's `<human-check>` (five-step click-through: open pen layer via the new control and cancel it; amend, change a value, cancel, and confirm the saved value is unchanged; amend then cancel then record a genuinely new batch and confirm both batches persist independently; confirm the native leave warning still fires only while a draft is dirty; visit an unknown-batch URL) is deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase` (the project default). All automated verification for both tasks was re-run and passes:
- `npm --prefix app test` — 8 test files, 166 tests passed (up from 160 before this plan; the four new BatchMargin.test.jsx cases plus two more added in task 2)
- `npm --prefix app run build` — built in ~65-85ms, no resolution errors
- Dependency count unchanged at 7 (4 dependencies + 3 devDependencies)
- No browser network-API call site found under `app/src`
- `setAmendingBatchId(null)` appears in 2 non-comment places in RecipePage.jsx (handleSaveBatch's amend branch, handleStartRecording)
- `onCancelRecording` appears in 2 non-comment places in BatchMargin.jsx (prop declaration, onClick wiring)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- UAT test 8's blocked step (recording a second, later-dated batch) is now unblocked by automated evidence; full click-through confirmation is deferred to end-of-phase UAT above.
- UAT test 1's report ("nothing on the recipe page says to record a batch") is answered for every reachable state.
- The findability half of G-02-4 (button style/weight, layout position) remains open against Impeccable — not a blocker for this plan's own scope, but should be tracked before Phase 2 is considered fully closed.
- Plan 02-05 (if it targets remaining gaps G-02-3/G-02-6 per the gap-closure plan) can proceed independently — no shared files with this plan's scope beyond BatchMargin.jsx/RecipePage.jsx, which are now in their post-gap-closure state for G-02-1/G-02-4.

---
*Phase: 02-record-the-first-batch*
*Completed: 2026-09-07*

## Self-Check: PASSED

- FOUND: app/src/ui/BatchMargin.test.jsx
- FOUND: SUMMARY (this file)
- FOUND: ad9f34a, 86bbe15, ffa53d5, 01ba390 (all four task commits present in git log)
