---
phase: 03-develop-the-next-version
plan: 05
subsystem: recipe-versioning
tags: [advisories, derived-data, react, vitest]

# Dependency graph
requires:
  - phase: 03-04
    provides: liveVersion (the pen's draft while open, readingVersion otherwise, already filtered through activeRows/activeSteps) and the margin region's existing shape (BatchMargin, Authored) this plan slots between
provides:
  - domain/advisories.js (buildAdvisories) — the four FORM2-02 structural advisories, each carrying its own basis, reimplemented framework-free from the old-sprinkles slice's evidence
  - ui/DerivedAdvisories.jsx — the margin's derived block, filling the empty advisory-slot left since Phase 1
  - The last of Phase 3's requirements (FORM2-02); the phase's full requirement set (REC1-02 through REC1-05, FORM1-03, FORM2-01, FORM2-02) is now complete
affects: []

# Actuals (#2632)
actuals:
  tokens: 5321
  tasks: 2
  commits: 2
plan_head_before: 1e937230737dbb3e8a104201d3655956f77c9492

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "The estimated-exposure advisory restructures buildFigures' own per-figure estimatedRowNames rather than rescanning the ingredient library, so the advisory and the six figures can never disagree about which rows a figure rests on"
    - "A target's free-text value is read only when it is nothing but a leading decimal number followed by the Celsius mark (anchored regex, not a leading-substring match) — a range such as '80–85 °C' degrades to no match rather than a guessed number"
    - "A local two-decimal grams formatter (formatScaleGrams) is kept distinct from composition.js's one-decimal formatGrams — the sub-scale advisory's amounts are already-typed, two-decimal kitchen-scale readings, not a computed total"

key-files:
  created:
    - app/src/domain/advisories.js
    - app/src/domain/advisories.test.js
    - app/src/ui/DerivedAdvisories.jsx
    - app/src/ui/DerivedAdvisories.test.jsx
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/styles/app.css

key-decisions:
  - "Task 1's domain module and its test file landed in one `test(03-05)` commit rather than separate RED/GREEN/REFACTOR commits, matching this exact phase's own precedent for a new pure domain module under tdd=\"true\" (03-01 and 03-02's own first tasks, both committed the same way) — MVP mode is active for this phase (workflow.tdd_mode: false), so the strict per-phase TDD gate does not apply, and the established pattern was followed rather than improvised."
  - "DerivedAdvisories reads RecipePage's existing liveVersion rather than a new variable — liveVersion already implements exactly the required semantics (the pen's draft, filtered through activeRows/activeSteps, while open; readingVersion otherwise), and FormulationNote/BasisNote already read it for the identical reason."
  - "No new --size-advisory token was added: the plan's own instruction was to reuse --size-small-print if it already carries the block's small-print size, and it does (already used by .authored__legend and .formulation-note__fat-breakdown at that exact size)."

requirements-completed: [FORM2-02]

coverage:
  - id: D1
    description: "The margin shows four derived structural advisories for the churned olive oil version, between the batch record and the authored notes, under a legend reading 'derived' at right, parallel to the authored block's own legend (FORM2-02, D-05)."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — the churned version (returns four advisories in fixed order)"
        status: pass
      - kind: automated_ui
        ref: "app/src/ui/DerivedAdvisories.test.jsx#DerivedAdvisories — the churned version (legend renders 'derived', four basis: paragraphs)"
        status: pass
    human_judgment: true
    rationale: "The visual placement between BatchMargin and Authored, and the legend's parallel styling to the authored block's own, need a browser to observe. Deferred to end-of-phase UAT per Mark's standing preference (STATE.md carry, MEMORY.md), consistent with every prior plan in this phase."
  - id: D2
    description: "Sub-scale amounts: guar gum at 0.48 g and lambda carrageenan at 0.16 g are named as under the kitchen scale's resolution, with the master blend's parts and total (4.16 g, 1.92 g, 0.64 g, 6.72 g in all) and the take for this batch, 1.68 g."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — sub-scale amounts (3 tests: present, absent at finer resolution, never names a removed row)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Ultra-pasteurised mass: 623.2 g of the batch — whole milk 370.4 g and heavy cream 252.8 g — is named against the batch's own computed mass, 799.7 g."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — ultra-pasteurised mass (2 tests)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Gum hydration against the hold: locust bean gum's 82 °C is named against the 69 °C pasteurisation hold, and step 2 is named because its typed 85 °C target reaches it; a range the parser cannot read (e.g. '80–85 °C') degrades to no step clause rather than throwing or guessing."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — gum hydration against the hold (4 tests: present with step, no-step, unparseable target, absent)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Estimated-data exposure is derived from buildFigures' own estimatedRowNames rather than a second scan of the ingredient library, reporting four figures for the churned version — PAC, POD, MSNF and Total solids — never Total fat or Sugar solids."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — estimated-data exposure (2 tests)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Each advisory ends in a basis: line naming what it was computed from; an advisory cannot be built without one."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — the churned version (non-empty words/basis on every advisory)"
        status: pass
      - kind: automated_ui
        ref: "app/src/ui/DerivedAdvisories.test.jsx#DerivedAdvisories — the churned version (four basis: paragraphs)"
        status: pass
    human_judgment: false
  - id: D7
    description: "An advisory is present only when true of the version as it stands: each of the four disappears when its condition stops holding, and zero advisories renders no block at all."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js (four absence cases, one per advisory, plus the empty-version case)"
        status: pass
      - kind: automated_ui
        ref: "app/src/ui/DerivedAdvisories.test.jsx#DerivedAdvisories — no rows (renders nothing at all)"
        status: pass
    human_judgment: false
  - id: D8
    description: "The advisories recompute live from the pen's draft on every keystroke, the same way the six figures do, and removed rows and steps are excluded before they are computed."
    verification:
      - kind: other
        ref: "app/src/ui/RecipePage.jsx (source re-check: DerivedAdvisories reads liveVersion, the same already-filtered variable FormulationNote/BasisNote read)"
        status: pass
    human_judgment: true
    rationale: "The interactive flow — typing a grams value and watching an advisory appear or change, removing a row and watching the sub-scale/ultra-pasteurised advisories react — needs a browser to observe. Deferred to end-of-phase UAT per Mark's standing preference (STATE.md carry, MEMORY.md), consistent with every prior plan in this phase."
  - id: D9
    description: "No advisory blocks a save, colours anything, carries an icon or a badge, warns in the imperative, or predicts a sensory outcome; the save path contains no reference to the advisories module."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — no verdict"
        status: pass
      - kind: automated_ui
        ref: "app/src/ui/DerivedAdvisories.test.jsx#DerivedAdvisories — the churned version (never renders a verdict or a sensory word); grep gates (no colour/px literal, no arithmetic in the component, RecipePage.jsx does not import domain/advisories.js directly)"
        status: pass
    human_judgment: false
  - id: D10
    description: "Batch mass against the machine's minimum fill is not built: equipment.minFillG stays in the record unused by any advisory (D-05)."
    requirement: "FORM2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — the minimum fill is not built"
        status: pass
      - kind: other
        ref: "grep gate: no occurrence of minFillG outside comments in app/src/domain/advisories.js"
        status: pass
    human_judgment: false

# Metrics
duration: 31min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 5: The four FORM2-02 advisories and the margin's derived block Summary

**A framework-free `advisories.js` reimplementing the old-sprinkles slice's four structural advisories against this repo's own row shapes — extended to name a method step for the hydration advisory and to report per-figure for the estimated-exposure advisory — plus `DerivedAdvisories.jsx`, filling the margin's empty advisory slot left since Phase 1.**

## Performance

- **Duration:** 31 min
- **Started:** 2026-09-07T19:16:00Z
- **Completed:** 2026-09-07T19:47:22Z
- **Tasks:** 2 completed
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments

- `domain/advisories.js`: `buildAdvisories(version)` — the four FORM2-02 advisories in fixed order (`sub-scale`, `ultra-pasteurised`, `hydration`, `estimated`), each a `{ key, words, basis }` descriptor, filtered through `activeRows`/`activeSteps` before anything is computed
- The hydration advisory scans active method steps for the first one whose typed target (free text) reaches the conflicting gum's hydration temperature, via an anchored regex that treats a range such as `80–85 °C` as unparseable rather than guessing a number
- The estimated-exposure advisory restructures `buildFigures`' own per-figure `estimatedRowNames` rather than rescanning `library.js`, reporting four figures (PAC, POD, MSNF, Total solids) for the churned version, matching the brief's departure from its own illustrative three-figure wording
- `equipment.minFillG` is read by nothing in the module — the fifth advisory (batch mass against the machine's minimum fill) is deliberately not built (D-05, SCALE-01)
- `ui/DerivedAdvisories.jsx`: a pure render over `buildAdvisories`, modelled on `FormulationNote.jsx` — returns `null` for an empty result, so a version with nothing structural to say renders no block at all
- `RecipePage.jsx`: the empty `advisory-slot` placeholder is replaced with `DerivedAdvisories`, positioned between `BatchMargin` and `Authored`, reading the same `liveVersion` `FormulationNote`/`BasisNote` already read (the pen's draft while open, `readingVersion` otherwise)
- `app.css`: `.derived-advisories__legend`/`__item`, reusing the existing `--size-small-print` token per the plan's own instruction — no new token added

## Task Commits

Each task was committed atomically:

1. **Task 1: The four advisories, framework-free, each carrying its own basis** - `d5a7882` (test)
2. **Task 2: The derived block in the margin — small print in ink, after the batch record, before the authored notes** - `d9ea627` (feat)

**Plan metadata:** committed separately below.

## Files Created/Modified

- `app/src/domain/advisories.js` — `buildAdvisories`
- `app/src/domain/advisories.test.js` — 19 tests
- `app/src/ui/DerivedAdvisories.jsx` — `DerivedAdvisories`
- `app/src/ui/DerivedAdvisories.test.jsx` — 4 tests
- `app/src/ui/RecipePage.jsx` — import + placement of `DerivedAdvisories`, stale comment updated
- `app/src/styles/app.css` — `.derived-advisories__legend`, `.derived-advisories__item`

## Decisions Made

- Task 1's domain module and its test file landed in one `test(03-05)` commit rather than separate RED/GREEN/REFACTOR commits, matching this exact phase's own precedent (03-01/03-02's own first `tdd="true"` tasks) — MVP mode is active for this phase (`workflow.tdd_mode: false`), so the strict per-phase TDD gate does not apply.
- `DerivedAdvisories` reads `RecipePage`'s existing `liveVersion` rather than a new variable, since it already implements the required "pen's draft while open, `readingVersion` otherwise" semantics.
- No new `--size-advisory` token was added — `--size-small-print` already carries the block's small-print size (matching `.authored__legend` and `.formulation-note__fat-breakdown`).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3's full requirement set is now complete: REC1-02, REC1-03, REC1-04, REC1-05, FORM1-03, FORM2-01, FORM2-02.
- **Deferred to end-of-phase UAT** (per Mark's standing preference, MEMORY.md, and every prior plan in this phase): the interactive flow — opening the churned recipe and reading the four advisory paragraphs in the margin in a real browser, removing rows in the pen and watching the sub-scale/ultra-pasteurised advisories react live, and confirming the block's legend and small-print styling sit parallel to the authored block's own. All automated verification (build, test — 354 passing, up from 331 at the end of 03-04 — and every acceptance-criteria grep) has been run and passes; only the visual/interactive confirmation is deferred.
- No further plans are scoped in this phase; Phase 3 is ready for end-of-phase verification (`/gsd-verify-work`).

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED

- Key created files verified present on disk: `app/src/domain/advisories.js`, `app/src/domain/advisories.test.js`, `app/src/ui/DerivedAdvisories.jsx`, `app/src/ui/DerivedAdvisories.test.jsx`.
- Both task commits verified present in git log: `d5a7882`, `d9ea627`.
- `npm --prefix app test` re-run: 23 test files, 354 tests passed (baseline at the end of 03-04 was 331).
- `npm --prefix app run build` re-run: builds clean, no errors.
- All plan-level `<verify>` automated greps re-run and passed (see the two task sections above).
