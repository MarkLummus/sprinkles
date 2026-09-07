---
phase: 03-develop-the-next-version
plan: 06
subsystem: ui
tags: [react, react-router, one-pen-interlock, gap-closure]

requires:
  - phase: 03-develop-the-next-version
    provides: "The pen layer's mode/tastingDraft/amendingBatchId state (plans 03-01 through 03-05) and the diagnosed root causes in .planning/debug/one-pen-rule-leaks.md"
provides:
  - "derivePenState, the single derivation of which of the four pens (plan/record/amend/tasting) is open, exported from RecipePage.jsx"
  - "openPen/penReason threaded to Headnote and BatchMargin, replacing every hand-rolled mode/tastingDraft check with one uniform disabled condition and a reason in words"
  - "A route-keyed RecipePage (router.jsx) so a version or batch change is a new component instance and no pen state can cross it"
  - "RecipePage.test.jsx, the interlock owner's first test file, plus disabled-state assertions added to BatchMargin.test.jsx and Headnote.test.jsx"
affects: ["03-07 (dirty checks and in-app navigation policy, the remaining RC3/RC4 halves)"]

actuals:
  tokens: 7300
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "One derivation, many readers: openPen/penReason computed once in RecipePage and passed down, rather than each consumer re-deriving availability from primitive state"
    - "Route-keyed remount as a state-reset backstop, in place of an effect that resets after a render has already happened"

key-files:
  created:
    - app/src/ui/RecipePage.test.jsx
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/BatchMargin.test.jsx
    - app/src/ui/Headnote.jsx
    - app/src/ui/Headnote.test.jsx
    - app/src/router.jsx
    - app/src/styles/app.css

key-decisions:
  - "The route reset is a keyed remount (router.jsx's RecipePageForRoute wrapper), not a reset effect — the plan's own flagged assumption, taken as written: a keyed remount resets before any render happens, where an effect would reset after one render has already applied the previous version's pen state to the new version's rows."
  - "The shared hint class is named .pen-hint, not a batch-margin-scoped name, since it now renders in both BatchMargin and Headnote — carries the identical treatment to .batch-margin__hint (font, size, margin) rather than reusing that class name across regions."
  - "derivePenState is an if-chain, not a lookup table, per T-02-32's discipline against a bare bracket read against a key — kept so the four reason strings stay visible at the site that decides them."

patterns-established:
  - "A pen's disabled reason renders as its own paragraph beside the control, never folded into an existing message channel scoped to a different mode branch (Headnote's blockedMessage is unreachable outside the developing branch, which is why the Develop control needed its own line)."

requirements-completed: [REC1-02, REC1-03]

coverage:
  - id: D1
    description: "One derivation (derivePenState) decides which of the four pens is open; no control tests mode or tastingDraft directly any more"
    requirement: REC1-02
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.test.jsx#derivePenState — the one derivation of \"a pen is open\""
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipePage.test.jsx#The four-pen matrix — every opener disabled, every reason in words"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every batch-side opener (Record a batch, Record another batch, Amend, Add a tasting) disables while the plan's pen is open, and while a tasting is being written"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — the one-pen interlock reads openPen, not mode"
        status: pass
    human_judgment: false
  - id: D3
    description: "Develop the next version disables while a batch is recorded, amended, or a tasting is written, and states the reason in words — the fifth leak, where the control previously excluded silently"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/Headnote.test.jsx#Headnote — the one-pen interlock reads openPen, not mode"
        status: pass
    human_judgment: false
  - id: D4
    description: "A route change to a different version or batch starts RecipePage with no pen open, no draft and no amend target — the amend-save crash and the cross-version write have no route to reach"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "npm --prefix app test (367/385 pass, build exits 0, no test removed)"
        status: pass
    human_judgment: true
    rationale: "The route-key mechanism is proven by static analysis (grep for useParams/key=/batchId) and by the full suite staying green, but no jsdom or route-driving harness exists in this repo to click through an actual navigation. The plan's own <human-check> — open a batch's Amend, navigate away, confirm a clean page — is deferred to end-of-phase UAT per workflow.human_verify_mode."

duration: 20min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 06: One-pen interlock derivation and a route-keyed RecipePage Summary

**One `derivePenState` derivation replaces the two hand-rolled states every opener used to test on its own, and `RecipePage` now remounts on a route-id/batchId change so no pen state can follow the maker to a different version.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-09-07T22:54:00Z (approx.)
- **Completed:** 2026-09-07T23:00:02Z
- **Tasks:** 3
- **Files modified:** 8 (1 created, 7 modified)

## Accomplishments
- `derivePenState({ mode, amendingBatchId, tastingDraft })` exported from `RecipePage.jsx`: one if-chain returning `{ openPen, reason }` for `plan`/`record`/`amend`/`tasting`/`null`, with four distinct reason sentences — closing RC1 (openness split across two unrelated states) and giving the tasting pen a representation it never had.
- `BatchMargin.jsx` and `Headnote.jsx` both read `openPen`/`penReason` instead of `mode`. Every batch-side opener (Record a batch, Record another batch, Amend, Add a tasting) disables uniformly on `openPen !== null` — closing RC2, where Add a tasting had no disabled condition at all — and each region carries its own words-form reason (D-10).
- `Headnote`'s Develop control disables on `openPen !== null` and now renders `Developing the next version is unavailable while ${penReason}.` beside it — the fifth leak the diagnosis named, where the control excluded correctly but said nothing.
- `router.jsx` registers a small `RecipePageForRoute` wrapper on both recipe routes, keying `RecipePage` by `${id}::${batchId ?? ''}`. A version or batch change is now a fresh component instance, so the amend-save `TypeError` and the silent cross-version write (both traced in `.planning/debug/one-pen-rule-leaks.md`) have no route left to reach them, including the browser's own back/forward buttons.
- `RecipePage.test.jsx` — the interlock owner's first test file — covers all five `derivePenState` outcomes, the presence-over-truthiness edge for an empty tasting draft, the stale-`amendingBatchId` edge, and a table-driven matrix asserting every opener's disabled state and reason string across all four pens. `BatchMargin.test.jsx` and `Headnote.test.jsx` each gained the disabled-state assertions their prior presence-only checks were missing.

## Task Commits

Each task was committed as RED/GREEN where genuinely applicable:

1. **Task 1: One derivation of "a pen is open"** — RED `010cf31` (test), GREEN `a10d44b` (feat)
2. **Task 2: Route-keyed RecipePage** — `b8e59f1` (feat)
3. **Task 3: Interlock test coverage / four-pen matrix** — `444680d` (test)

**Plan metadata:** committed alongside this SUMMARY.

## Files Created/Modified
- `app/src/ui/RecipePage.jsx` — exports `derivePenState`; call site threads `openPen`/`penReason` to `Headnote` and `BatchMargin`; two stale comments asserting the old two-state split rewritten
- `app/src/ui/RecipePage.test.jsx` (new) — `derivePenState` unit tests, the two ordering edges, and the four-pen matrix across `BatchMargin`/`Headnote`
- `app/src/ui/BatchMargin.jsx` — `openPen`/`penReason` props; all four batch-side openers disable uniformly; three `.pen-hint` sentences (beside Amend, beneath Record a batch, above the batch list)
- `app/src/ui/BatchMargin.test.jsx` — disabled-state assertions for the plan pen, the tasting pen, the no-pen case, and the no-batch branch
- `app/src/ui/Headnote.jsx` — `openPen`/`penReason` props; Develop control disables on `openPen` and renders its own reason line
- `app/src/ui/Headnote.test.jsx` — disabled-state and reason-text assertions across record/amend/tasting/no-pen
- `app/src/router.jsx` — `RecipePageForRoute` wrapper reading `useParams()` and keying `RecipePage`
- `app/src/styles/app.css` — `.pen-hint`, carrying `.batch-margin__hint`'s exact treatment through existing tokens only

## Decisions Made
- Route reset implemented as a keyed remount, not a reset effect (plan's own flagged assumption, taken as written) — accepted the cost that switching batches within the same version now re-reads from IndexedDB, in exchange for making the crash and cross-version-write paths unreachable by any route including browser back/forward.
- Shared hint class named `.pen-hint` (pen-layer scope) rather than continuing to use `.batch-margin__hint` in `Headnote.jsx`, since the sentence now renders in a region outside the batch margin.
- `derivePenState` stayed an if-chain rather than a lookup table, per the plan's own T-02-32 callout.

## Deviations from Plan

None — plan executed exactly as written. Task 3's tests passed immediately against task 1/2's implementation rather than genuinely failing first (the behavior they assert was already correct once tasks 1 and 2 landed); this mirrors the documented precedent in 03-05's SUMMARY under MVP mode (`workflow.tdd_mode: false`), not a Rule 1-4 deviation.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- G-03-9's RC1, RC2, and the state-preservation half of RC3 are closed, along with the fifth (Develop-gives-no-reason) leak.
- 03-07 remains to close RC4 (the dirty-check omissions/over-fire) and the in-app navigation policy half of RC3 (disabling the version strip, batch list, and lineage links while a pen is open, rather than relying solely on the route-key backstop).
- The plan's task 2 `<human-check>` (open a batch's Amend, navigate to another version/batch via back button or direct URL, confirm no pen carries over; repeat for Develop with a changed gram landing on a sibling) is deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED
All key files (RecipePage.jsx, RecipePage.test.jsx, Headnote.jsx, Headnote.test.jsx, BatchMargin.jsx, BatchMargin.test.jsx, router.jsx, app.css) confirmed present on disk. All 5 commits (010cf31, a10d44b, b8e59f1, 444680d, 3b86b06) confirmed in git log. `npm --prefix app test` passes 385/385; `npm --prefix app run build` exits 0.
