---
phase: quick-260906-w9g
plan: 01
subsystem: ui
tags: [react, jsx, focus-management, accessibility, batch-margin]

# Dependency graph
requires:
  - phase: 02-record-the-first-batch
    provides: BatchMargin's tasting recording flow (TastingForm, tastingDraft, onSaveTasting)
provides:
  - "TastingForm Cancel button, discarding the draft silently"
  - "Tasting legend heading the open form the way a read tasting is headed"
  - "Autofocused tasting date field on open"
  - "Focus-return effect moving focus to Add a tasting on close (cancel or save)"
affects: [batch-margin, recipe-page]

# Actuals (#2632)
actuals:
  tokens: 1744
  tasks: 2
  commits: 1

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Focus-return effect keyed on a draft-going-null transition, gated by a was-open ref so it never fires on first mount"

key-files:
  created: []
  modified:
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchMargin.test.jsx

key-decisions:
  - "D-1 through D-5 locked by the plan — Cancel mirrors the churn form's Cancel exactly, legend reuses batch-margin__legend, autoFocus mirrors the churn date field, focus-return implemented with two refs above BatchMargin's first conditional return, and nothing else touched."

patterns-established:
  - "Focus-return on form close: a useRef flag tracking 'was this open last render' plus a useEffect keyed on the draft value, so the effect only fires on the true open-to-closed transition and never on mount."

requirements-completed: [CRITIQUE-2026-09-07-P1-2]

coverage:
  - id: D1
    description: "TastingForm gains a Tasting legend as its first child"
    requirement: "CRITIQUE-2026-09-07-P1-2"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the tasting form can be abandoned (D-1 through D-4) > heads the open form the way a read tasting is headed"
        status: pass
    human_judgment: false
  - id: D2
    description: "Tasting date field is autofocused when the form opens"
    requirement: "CRITIQUE-2026-09-07-P1-2"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the tasting form can be abandoned (D-1 through D-4) > lands the caret in the tasting date field without a click"
        status: pass
    human_judgment: false
  - id: D3
    description: "TastingForm offers a Cancel button beside Save tasting"
    requirement: "CRITIQUE-2026-09-07-P1-2"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the tasting form can be abandoned (D-1 through D-4) > offers both a way to save and a way to leave without writing"
        status: pass
    human_judgment: false
  - id: D4
    description: "Cancel discards the draft silently via handleCancelTasting, wired as onCancelTasting"
    requirement: "CRITIQUE-2026-09-07-P1-2"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the tasting form can be abandoned (D-1 through D-4) > offers the way back in once the form is closed"
        status: pass
    human_judgment: false
  - id: D5
    description: "Closing the tasting form (cancel or save) returns focus to the re-rendered Add a tasting button, via a tastingDraft-keyed effect gated so it never fires on first mount"
    requirement: "CRITIQUE-2026-09-07-P1-2"
    verification: []
    human_judgment: true
    rationale: "renderToStaticMarkup runs no effects (fact 3), so the focus-return behavior itself cannot be proven by the static-markup test suite this repo uses — only the presence of the ref and the gated effect (verified by the Task 1 verify gate's grep checks) and manual/browser confirmation can establish it fires correctly."

duration: ~15min
completed: 2026-09-06
status: complete
---

# Quick Task 260906-w9g: Give the tasting form an exit, a head, and a focus path — Summary

**TastingForm gains a Cancel button, a Tasting legend, and an autofocused date field; BatchMargin gains a `tastingDraft`-keyed focus-return effect that lands focus back on `Add a tasting` when the form closes.**

## Performance

- **Started:** 2026-09-06T23:19:00-04:00 (approx, plan directory creation time)
- **Completed:** 2026-09-06T23:22:56Z
- **Tasks:** 2 completed
- **Files modified:** 3

## Accomplishments
- `TastingForm` now has a `Cancel` button after `Save tasting`, wired to a new `handleCancelTasting` in `RecipePage` that sets `tastingDraft` to `null` — discarding silently, no invented dialog.
- The open tasting form is headed `<p className="batch-margin__legend">Tasting</p>`, the same legend style the reading state uses for a tasting's date words.
- The tasting date input carries `autoFocus`, the same bare-prop mechanism the churn date field uses in `RecipePage.jsx`.
- `BatchMargin` gained a `useRef`/`useEffect` pair (`addTastingButtonRef`, `tastingWasOpenRef`) placed above its first conditional return, keyed on `[tastingDraft]`, that moves focus to the `Add a tasting` button on the true open-to-closed transition and is a no-op on first mount.
- Four new test cases added to `BatchMargin.test.jsx`, alongside the nine pre-existing cases, all thirteen green.
- Full suite (190 tests across 11 files) and the production build both pass; the Impeccable detector returns `[]` for both edited files, matching the pre-change baseline.

## Task Commits

Each task was committed atomically:

1. **Task 1: Give the tasting form an exit, a head, and a focus path** - `0ad36e8` (feat)
2. **Task 2: Prove the whole app still holds, and record the detector result** - no code changes; all verification gates passed on the first run, so no commit was needed (verification-only task).

**Plan metadata:** committed separately by the orchestrator per plan constraints (this executor does not commit GSD docs artifacts).

## Files Created/Modified
- `app/src/ui/BatchMargin.jsx` - `TastingForm` gains `onCancelTasting`, a `Tasting` legend, `autoFocus` on the date field, and a `Cancel` button; `BatchMargin` gains the `react` hooks import, `onCancelTasting` prop pass-through, `addTastingButtonRef`/`tastingWasOpenRef`, the focus-return effect, and the ref attached to the `Add a tasting` button.
- `app/src/ui/RecipePage.jsx` - `handleCancelTasting` added beside `handleStartTasting`, wired as `onCancelTasting` into `<BatchMargin>`.
- `app/src/ui/BatchMargin.test.jsx` - `onCancelTasting={noop}` added to `renderMargin`'s default props; new describe block with 4 cases covering the legend, the autofocus attribute, both buttons, and the closed-form fallback.

## Decisions Made
None — all four decisions (D-1 through D-5) were locked by the plan; this execution implemented them as specified without deviation.

## Deviations from Plan

None - plan executed exactly as written.

## Detector

Baseline (pre-change, fact 11): `[]`

Post-change (`/Users/mark/.claude/skills/impeccable/scripts/impeccable detect --json app/src/ui/BatchMargin.jsx app/src/ui/RecipePage.jsx`):
```json
[]
```

No regression — the detector result is unchanged.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The second P1 of the 2026-09-07 BatchMargin critique is closed. The remaining critique items (if any) are tracked in the critique snapshot, unaffected by this change (D-5: nothing else touched).
- No blockers.

---
*Phase: quick-260906-w9g*
*Completed: 2026-09-06*

## Self-Check: PASSED

All created/modified files confirmed present on disk; commit `0ad36e8` confirmed present in `git log`.
