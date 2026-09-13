---
target: batch-record-pen-and-read-view (phase 03.3.1)
total_score: 15
max_score: 20
p0_count: 0
p1_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx"
target_fingerprint: "sha256:dd1a08de9141e064d36908b3d95af7d3967c906ad352016fe7ea3bdebcf6e91d"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx
timestamp: 2026-09-13T18-22-51Z
slug: app-src-ui-batchrow-jsx
---
Method: single-agent technical audit (orchestrator), grounded in live-browser measurements from the phase's own Task 3 conformance pass plus a targeted code-review cycle (03.3.1-REVIEW.md). No `impeccable detect` run — the detector is confirmed blind to JSX for this project (prior finding); measurements below are real DOM reads at real window widths (1280/768/700px; true 393px could not be forced in this session's browser environment, capped at ~500px).

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Native radiogroup semantics, aria-invalid/describedby, live regions all verified live; Home/End gap found and fixed mid-audit; contrast not independently re-measured (inherited pen-blue 9.75:1 token, prior-verified) |
| 2 | Performance | 3 | Single node-guarded matchMedia listener, no obvious re-render storms; not formally profiled |
| 3 | Responsive Design | 3 | 44px targets and the two-arrangement grid verified live at three real widths; a stop box-sizing bug found and fixed; true 393px unverified (environment limit ~500px), and horizontal overflow at that width traces to a pre-existing page-shell issue, not this surface |
| 4 | Theming | 4 | Every new dimension is a named custom property (`--pen-w`, `--track-stop`, `--stop-w/-h/-gap`, etc.); zero bare px outside documented breakpoint preludes; light-only by product decision (print-native), not a dark-mode gap |
| 5 | Implementation Integrity | 2 | One real correctness bug found and fixed per finding below (a CR-level claim from static code review that turned out to be a false positive on live verification — the actual bugs were four Warning-level state-hygiene issues, all fixed) |
| **Total** | | **15/20** | **Good (address weak dimensions)** |

## Implementation Integrity Verdict

**Pass, with fixes landed during this audit.** The record pen expresses Sprinkles' own system coherently: the goldilocks stops read their words from `domain/axes.js`'s single source of truth, controls carry the binder's hairline/no-fill/no-radius vocabulary, and the Two-Ink/No-Verdict rules hold (picked states are bold+underline+outline, never a fill or colour-alone signal — verified via `getComputedStyle` on a checked stop). A companion code review (`03.3.1-REVIEW.md`) found and this audit's author fixed four real state-hygiene bugs (WR-01 through WR-04: an incomplete import validator, a discarded save timestamp, an over-broad field-error reset, and a live-version read where the batch's own snapshot was owed) plus two live-browser-only gaps this static review couldn't have caught by construction (AxisMark's missing Home/End handling, and a `box-sizing` miss that rendered touch targets 2px tall of spec). All are fixed and tested (895/895 passing). Deducted a point for the surface not yet having a formal accessibility contrast re-audit and for the one still-outstanding structural carry below (`--pen-w` unconsumed).

## Executive Summary

- Audit Health Score: **15/20** (Good)
- Issues found: 0 P0, 1 P1, 2 P2, 1 P3 (below) — all from this audit's own live verification; the code-review's own findings are tracked separately in `03.3.1-REVIEW.md` and already resolved
- Top issues: the pen's un-capped width (P1), unverified true-393px conformance (P2), the pre-existing page-shell overflow this surface does not own but inherits visually (P2), a still-unstyled handful of contract-adjacent elements (P3)
- Recommended next: a small `/gsd-quick` follow-up to cap the pen width with a mode-scoped class, then a human UAT pass at a genuine 393px device

## Detailed Findings by Severity

**[P1] The record pen renders at its container's full width, not the contract's 640px**
- **Location**: `app/src/ui/BatchRow.jsx` (`.batch-margin`, shared by the pen and the read view), `app/src/styles/tokens.css` (`--pen-w`, declared but unconsumed)
- **Category**: Implementation Integrity / Theming
- **Impact**: The pen reads noticeably wider than the verified sketch at desktop widths — measured live at 1013px against a 1280px viewport, not 640px. The battery's own internal geometry (axes track, stops) is correct; only the outer frame is not capped, so the pen currently reads more like a whole-page form than the contract's Cupping-Form-styled 640px column.
- **WCAG/Standard**: N/A — design-contract conformance ("Responsive ladder," `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md`), not accessibility.
- **Recommendation**: Add a recording-mode class to `.batch-margin` (or a wrapping element) that applies `max-width: var(--pen-w)` only while a pen is open, leaving the already-shipped full-width read view untouched.
- **Suggested command**: `/impeccable layout` (or a `/gsd-quick` task, since the fix needs a JSX class, not CSS alone)

**[P2] True 393px conformance not directly measured**
- **Location**: N/A (environment limitation)
- **Category**: Responsive Design
- **Impact**: This session's browser window could not be forced below ~500px (a window-manager floor on this machine), so the contract's literal "zero overflow at 393px" claim rests on the ~500px measurement plus the responsive formula's own arithmetic (`auto-fit, minmax(min(100%, 280px), 1fr)`), not a direct read.
- **Recommendation**: A human UAT pass on a real phone or a genuinely resizable window should confirm.
- **Suggested command**: none — human verification, tracked in `03.3.1-06-SUMMARY.md`'s "Next Phase Readiness"

**[P2] Horizontal overflow at ~500px traces to a pre-existing page-shell issue, not this surface**
- **Location**: `.recipe-band` / `.vmeta` (the version front-matter band), not any file this phase touched
- **Category**: Responsive Design
- **Impact**: Confirmed live: every battery element (`.axis-mark`, `.axes-grid`, `.segmented`, `.save-ceremony`) fills its parent's width exactly rather than independently overflowing — the overflow's true source is the version band, already tracked in `STATE.md`'s Blockers/Concerns and `.claude/skills/sketch-findings-sprinkles/references/page-shell-front-matter.md`.
- **Recommendation**: No action from this phase; the page-shell ladder fix already has an owner.
- **Suggested command**: none (tracked separately)

**[P3] A handful of contract-named elements remain unstyled**
- **Location**: `.defects-row__caption`, `.tasting-head`, `.note-block`, `.melt-block` (`app/src/ui/BatchRow.jsx`)
- **Category**: Theming
- **Impact**: Render as plain, unstyled text/containers today — not broken, just not yet given their own type role, consistent with this phase's established "unstyled until named" precedent (03.3.1-05-SUMMARY.md flagged the same pattern for the read view).
- **Recommendation**: Fold into a future `/impeccable typeset` or `/impeccable layout` pass once the phase's UAT settles remaining wording questions.
- **Suggested command**: `/impeccable typeset`

## Patterns & Systemic Issues

None systemic — the two live-only bugs (Home/End, box-sizing) are isolated to `AxisMark.jsx`/`app.css`'s newest rules, not a repeated pattern across the phase's other new components (`Segmented.jsx`, `PenFoot.jsx`'s `SaveCeremony` show no equivalent gaps on inspection).

## Positive Findings

- Every new geometry value is a named token (`--pen-w`, `--track-stop`, `--track-stop-narrow`, `--stop-w/-h/-gap`) — zero bare px outside documented breakpoint preludes, verified by grep and live `getComputedStyle` reads.
- The picked-state affordance (bold + underline + outline, never colour alone) is real on screen, not just declared — confirmed via `getComputedStyle` on both a checked stop and a filled (non-picked) input, showing the carried P3 underline drop holds by construction.
- The removal/undo lifecycle speaks the contract's exact words to the correct live region on every path tested live (empty removal, data removal, undo restore), and a `pendingUndo` payload genuinely survives the 760px arrangement crossing (React state, not a captured DOM reference) — closing a carried edge (Assumption A4) that could easily have regressed.
- The store's whole-file `scanForUnsafeKeys` recursive scan provides real defense-in-depth for a computed-key write this audit's companion security review flagged and then confirmed already covered (T-03.3.1-04) — the layered design held under scrutiny rather than needing a patch.

## Recommended Actions

1. **[P1] `/gsd-quick`**: Cap the record pen to `--pen-w` (640px) via a recording-mode class on `.batch-margin`, without touching the read view's own full-width rendering.
2. **[P3] `/impeccable typeset`**: Give the still-unstyled tasting-head/note-block/melt-block/defects-caption elements their own type roles once UAT settles remaining wording.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `/impeccable audit` after fixes to see your score improve.
