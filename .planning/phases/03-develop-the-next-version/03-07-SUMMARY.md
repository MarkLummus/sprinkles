---
phase: 03-develop-the-next-version
plan: 07
subsystem: ui
tags: [react, react-router, one-pen-interlock, unsaved-ink, gap-closure]

requires:
  - phase: 03-develop-the-next-version
    provides: "derivePenState and the route-keyed RecipePage backstop (03-06); the per-field step diff and absent-vs-empty normalisation (03-09)"
provides:
  - "VersionStrip, BatchMargin's batch list, and Headnote's lineage line each suppress their Link elements while openPen is set, rendering the same label as text plus a pen-hint sentence naming the reason"
  - "isPenDraftDirty extended to method (four text fields, removed, uses, targets), headnote, and both authored lists, exported from RecipePage.jsx"
  - "isDraftDirty(mode, draft, baseline) — an optional baseline argument compared field-by-field instead of against blank, closing the amend-reads-dirty-on-open defect"
  - "RecipePage's amendBaseline state, set alongside amendingBatchId in handleStartAmending and cleared in the same three places amendingBatchId already is"
affects: []

actuals:
  tokens: 9500
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "A suppressed navigation renders the same label as plain text rather than a disabled/href-less anchor — the absence of the <a> element is the disabling, a sibling sentence in the shared .pen-hint class is what makes it legible"
    - "A dirty check's baseline is a second, independently-cloned copy of the same seed the draft itself was built from, so a later edit to the draft (always a new object via its own setter) can never be read as a mutation of the baseline"

key-files:
  created: []
  modified:
    - app/src/ui/VersionStrip.jsx
    - app/src/ui/VersionStrip.test.jsx
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/BatchMargin.test.jsx
    - app/src/ui/Headnote.jsx
    - app/src/ui/Headnote.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx

key-decisions:
  - "Task 1's <behavior> prose describes the no-pen case as \"two anchor elements ... for the two versions that are not current\"; the actual current-and-prior behaviour (confirmed by the pre-existing VersionStrip.test.jsx and this plan's own overriding acceptance criterion, \"render exactly the anchors they render today\") is that the current version is also a Link, to itself — three anchors for three versions. Implemented to preserve that exact today-behaviour for the no-pen case and treated the prose as an imprecise paraphrase, not an instruction to remove the current version's self-link; the enforceable acceptance criteria and verify gates all passed against this reading."
  - "The batch list's 03-06-authored reason sentence (\"Another batch cannot be opened while ...\") already existed above the list; task 1 only needed to suppress the per-entry Link, not add a second sentence."
  - "Headnote's lineage-line suppression reads openPen only, not mode — matching the same D-UAT-1 discipline the fifth-leak fix already established for the Develop button, so a tasting or a record/amend pen also removes these two links, not only the plan pen."

patterns-established: []

requirements-completed: [REC1-02, REC1-03]

coverage:
  - id: D1
    description: "VersionStrip, BatchMargin's batch list, and Headnote's lineage line each render zero anchor elements while any pen is open, still read their own labels in words, and each carries a sentence naming the pen holding them; with no pen open all three render exactly the anchors they render today; the show-changes toggle and the running head are unaffected in every state; no useBlocker/usePrompt/window.confirm exists anywhere under app/src"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/VersionStrip.test.jsx#VersionStrip — disabled while a pen is open (D-UAT-2)"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the batch list is not a way off the page while a pen is open (D-UAT-2)"
        status: pass
      - kind: unit
        ref: "app/src/ui/Headnote.test.jsx#Headnote — the lineage line is not a way off the page while a pen is open (D-UAT-2)"
        status: pass
    human_judgment: false
  - id: D2
    description: "isPenDraftDirty reports dirty for an edit to a step's lead-in, instruction, purpose, aside, target label, target value, uses list, or removed flag; the headnote prose; an authored note's text; an authored note's removal — each asserted clean again when typed back; an absent purpose/aside compares equal to an empty string"
    requirement: REC1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.test.jsx#isPenDraftDirty — the pen check, over what it actually edits (T-03-42)"
        status: pass
    human_judgment: false
  - id: D3
    description: "isDraftDirty reports an untouched amend draft as clean against its baseline and dirty on any single change, including a cleared field and a written zero; a fresh recording draft's existing blank-comparison behaviour is unchanged"
    requirement: REC1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.test.jsx#isDraftDirty — the churn check, against what it was filled from (T-03-43)"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 07: Navigation suppression and truthful dirty checks Summary

**Three regions (version strip, batch list, lineage line) drop their Link elements while any pen is open and say why in words instead; both dirty checks now compare against the record they actually edit or were filled from, instead of an incomplete field list or blank.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-09-07T19:18:00Z (approx.)
- **Completed:** 2026-09-07T19:43:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- `VersionStrip.jsx` renders each version's label as plain text instead of a `Link` while `openPen` is set, keeping the current-version class and the "churned" word untouched, and adds one `.pen-hint` sentence beneath the list naming the pen. `RecipePage.jsx` threads `openPen`/`penReason` to it (it did not receive them before this plan).
- `BatchMargin.jsx`'s batch list (rendered only when a version has more than one batch) suppresses its per-entry `Link` the same way, keeping the `is-open` marker on the batch already showing; the reason sentence above the list already existed from 03-06 and needed no change.
- `Headnote.jsx`'s lineage line suppresses both its links — the parent version and the cited batch — while a pen is open, rendering the same words in the same sentence (`from <parent line>, after the batch of <date>`) with a new sentence beneath naming the reason. The show-changes toggle beside it is untouched, since it changes a query parameter on the same page rather than navigating away.
- `isPenDraftDirty` (RecipePage.jsx) extended from four checks (version line, reason, citation, rows) to also cover the headnote and, per method step, its lead-in, instruction, purpose, aside, removed flag, uses list, and targets — the omission (T-03-42) that let a rewritten step or authored note vanish on reload with no warning. Small named helpers (`normalizedText`, `usesListsDiffer`, `targetsDiffer`, `isStepDirty`, `isAuthoredListDirty`) read as a list of what counts as ink, per the plan's own instruction.
- `isDraftDirty` now takes an optional `baseline` argument. With none, it compares against blank exactly as before (a fresh recording). With one — the draft-shaped object `handleStartAmending` pre-filled `draft` from — it compares the seven scalar fields, the as-made map, and the step-changes map against it instead, closing T-03-43 (the leave warning firing the instant Amend opened, before any keystroke). `RecipePage.jsx` gained an `amendBaseline` state, set from an independently `structuredClone`d copy of the same values `draft` was seeded with, and cleared in the same three places `amendingBatchId` already is (`handleStartRecording`, `handleCancelRecording`, both exits of `handleSaveBatch`).
- Both checks exported and exercised directly (no rendering) against small hand-written fixtures in `RecipePage.test.jsx`, matching this file's own established style.

## Task Commits

Each task was committed atomically (MVP mode is active, `workflow.tdd_mode: false`, consistent with this phase's precedent):

1. **Task 1: The three ways off the page state why they will not move while a pen is open** — `954af91` (feat)
2. **Task 2: Both dirty checks tell the truth** — `41a70d8` (fix)

**Plan metadata:** committed alongside this SUMMARY.

## Files Created/Modified
- `app/src/ui/VersionStrip.jsx` — `openPen`/`penReason` props; per-version `Link` suppressed to text while a pen is open; `.pen-hint` sentence beneath the list
- `app/src/ui/VersionStrip.test.jsx` — no-pen/pen-open/single-version/current-version-class assertions
- `app/src/ui/BatchMargin.jsx` — batch-list entries suppress their `Link` to text while a pen is open, `is-open` marker unchanged
- `app/src/ui/BatchMargin.test.jsx` — a second batch fixture (`secondBatch`) to exercise the >1-batch list branch; pen-open/pen-closed assertions
- `app/src/ui/Headnote.jsx` — lineage line's two links suppressed to text while a pen is open; new `.pen-hint` sentence; show-changes toggle untouched
- `app/src/ui/Headnote.test.jsx` — lineage-line pen-open/pen-closed/show-changes-still-works assertions
- `app/src/ui/RecipePage.jsx` — `VersionStrip` now receives `openPen`/`penReason`; `isPenDraftDirty` extended and exported; `isDraftDirty` gains the `baseline` parameter and is exported; `amendBaseline` state threaded through `handleStartAmending`/`handleStartRecording`/`handleCancelRecording`/`handleSaveBatch` and the `beforeunload` effect's dependency list
- `app/src/ui/RecipePage.test.jsx` — `isPenDraftDirty` and `isDraftDirty` unit tests against hand-written fixtures, covering every field each check was missing plus the typed-back-to-clean and written-zero edges

## Decisions Made
- Task 1's own `<behavior>` prose states the no-pen case renders "two anchor elements ... for the two versions that are not current." The pre-existing `VersionStrip.test.jsx` (predating this plan) and this plan's own acceptance criterion ("With no pen open, all three render exactly the anchors they render today") both establish that the current version has always also rendered as a `Link` to itself — three anchors for three versions, not two. Read the prose as an imprecise paraphrase and preserved today's exact behaviour for the no-pen case; every verify gate and acceptance criterion passed against this reading, and changing the current-version's own no-pen behaviour was outside this task's stated scope (suppress while a pen is open, not restructure the baseline).
- Headnote's lineage-line suppression reads `openPen` (not `mode`), so any of the four pens (plan/record/amend/tasting) suppresses the links — matching the same D-UAT-1 discipline 03-06 already established for the Develop button's disabled condition, rather than scoping this new suppression to only the plan pen.

## Deviations from Plan

None — plan executed exactly as written, aside from the interpretive note above on Task 1's behavior-prose vs. its own acceptance criteria (not a Rule 1-4 deviation; both readings were reconciled by favoring the plan's own enforceable acceptance criteria and verify gates, which fully specify and test the required outcome).

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- G-03-9 is now fully closed: 03-06 closed RC1, RC2, and the state-preservation half of RC3, plus the fifth (Develop-gives-no-reason) leak; this plan closes RC3's remaining in-app navigation-policy half and RC4 (both dirty-check directions).
- D-UAT-2 holds in full: the three ways off the page are disabled with a stated reason, with no dialog, and the route-key backstop (03-06) stands behind them for the browser's back/forward and any URL a maker might type directly.
- Every kind of ink the plan's pen can hold (rows, method, headnote, authored notes, version line, reason, citation) and the churn draft (fresh or amending) is now protected by the browser's own leave warning, and only that warning — no invented dialog anywhere under `app/src`.
- No human-check items were deferred from this plan; every `<verify>` in both tasks was fully automated (build/test/greps) and all passed.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED
All key files (VersionStrip.jsx, VersionStrip.test.jsx, BatchMargin.jsx, BatchMargin.test.jsx, Headnote.jsx, Headnote.test.jsx, RecipePage.jsx, RecipePage.test.jsx) confirmed present on disk. Both commits (954af91, 41a70d8) confirmed in `git log`. `npm --prefix app test` passes 449/449 (up from 417 at plan start); `npm --prefix app run build` exits 0; every plan-specified grep gate passed.
