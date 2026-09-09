---
phase: quick-260909-oov
plan: 01
subsystem: ui
tags: [react, hooks, focus-management, jsx]

requires:
  - phase: 03.1-04
    provides: useOnDemandField hook (Method.jsx) shared by purpose, aside, and the batch pen's per-step line
provides:
  - useOnDemandField's focus effect now guarded by an openedByUser ref, firing only when the maker's own press opened the field
affects: [recipe-page, method-pen, batch-pen]

actuals:
  tokens: 500
  tasks: 1
  commits: 1

tech-stack:
  added: []
  patterns:
    - "A hook that seeds open state from existing data (initialOpen) tracks a second ref for whether the open was user-initiated, so a mount-time open and a press-time open can be told apart before deciding to steal focus."

key-files:
  created: []
  modified:
    - app/src/ui/Method.jsx

key-decisions:
  - "Guarded the effect and reset point exactly as specified: openedByUser set true in openField (before setIsOpen), consulted in the effect condition alongside isOpen, reset false in handleBlur's empty-value branch alongside the existing setIsOpen(false)/onCollapse() call. No other file touched — fixing the hook once fixes all three call sites (purpose, aside, batch pen's line)."

requirements-completed: [CRITIQUE-2026-09-09-P0]

coverage:
  - id: D1
    description: "Pressing Develop on a version whose steps already carry purpose/aside text no longer moves focus or scroll away from the version-line input — useOnDemandField's focus effect fires only when the maker's own press opened the field, not on mount."
    requirement: "CRITIQUE-2026-09-09-P0"
    verification:
      - kind: unit
        ref: "npm --prefix app test (30 files, 618 tests, all passing, no test file changed)"
        status: pass
      - kind: other
        ref: "structural gate: node -e '...' (checks openedByUser ref declared, set true in openField, set false in handleBlur, consulted inside the effect, with comments stripped before matching) -> GATE PASS"
        status: pass
    human_judgment: true
    rationale: "The suite runs under Vitest's node environment via renderToStaticMarkup with no jsdom and no testing-library (project has ruled both out), so no automated test can assert document.activeElement or window.scrollY. The plan's own human-check (browser: press Develop, confirm focus/scroll; press an opener, confirm focus lands and returns on re-open; check the batch pen's line) was deferred to end-of-phase UAT per project convention (see Deviations)."

duration: 6min
completed: 2026-09-09
status: complete
---

# Phase quick-260909-oov: Stop the on-demand Method field stealing Develop's focus Summary

**Guarded `useOnDemandField`'s focus effect with an `openedByUser` ref so an already-texted purpose/aside/batch-line field no longer steals focus from the version line on mount.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-09-09T22:22:00Z
- **Completed:** 2026-09-09T22:28:21Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- `useOnDemandField` (`app/src/ui/Method.jsx`) now tracks a second ref, `openedByUser`, set `true` only inside `openField()` (before `setIsOpen(true)`) and reset `false` only inside `handleBlur`'s empty-value collapse branch (alongside the existing `setIsOpen(false)` / `onCollapse()` call).
- The focus effect's condition narrowed from `if (isOpen)` to `if (isOpen && openedByUser.current)`, with the `[isOpen]` dependency list left exactly as it was.
- `initialOpen` still seeds `isOpen` unchanged, so a step whose purpose, aside, or batch line already carries text still renders that field open with no opener beside it (D-23, D-25 preserved) — only where focus goes changed, never what renders.
- One sentence added to the existing comment above the hook, naming why the effect is guarded (the version line's `autoFocus` must win on mount); no other prose in that comment block was rewritten.

## Task Commits

Each task was committed atomically:

1. **Task 1: Focus follows the maker's press, not the mount** - `7f50ae9` (fix)

**Plan metadata:** (this commit, made by the orchestrator after this SUMMARY)

## Files Created/Modified
- `app/src/ui/Method.jsx` - `useOnDemandField`: added `openedByUser` ref, set on `openField()`, consulted in the focus effect, reset on `handleBlur`'s empty-value collapse; one comment sentence added.

## Decisions Made
None beyond the plan's own specification — implemented exactly as directed: guard the effect, set the flag on press, reset it on collapse, touch no call site, no test file, and no other file.

## Deviations from Plan

None — plan executed exactly as written. `app/src/ui/Method.jsx` is the only file changed, and the diff is confined to `useOnDemandField`'s body plus one comment sentence, matching the plan's own `<done>` criteria.

The plan's human-check (browser verification of `document.activeElement`/`window.scrollY` after Develop, and the opener/re-open/batch-pen-line focus checks) could not be run in this environment — this dispatch is a non-interactive execution round with no browser session, and the plan itself records that the automated suite cannot prove focus (no jsdom, no testing-library, both ruled out by the project). Per the constraint given for this dispatch and prior project precedent for deferring human-verify checkpoints, this human-check is deferred to end-of-phase UAT rather than dropped. All automated verification (full suite green at 30/618, structural gate GATE PASS, single-file diff confirmed) passed.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The on-demand field focus bug (2026-09-09 recipe-page critique P0) is closed at the hook level, covering all three call sites (purpose, aside, batch pen's "done differently" line) with one fix. The browser human-check (Develop focus/scroll, opener press/re-open, batch pen line) remains open for end-of-phase UAT — carry it forward rather than treating this quick task as having proven it.

---
*Phase: quick-260909-oov*
*Completed: 2026-09-09*

## Self-Check: PASSED

- FOUND: app/src/ui/Method.jsx
- FOUND: 7f50ae9 (task commit)
- FOUND: .planning/quick/260909-oov-stop-the-on-demand-method-field-stealing/260909-oov-SUMMARY.md
