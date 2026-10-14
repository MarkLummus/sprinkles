---
phase: 03-develop-the-next-version
plan: 10
subsystem: ui
tags: [react, domain, step-numbering, accessibility, gap-closure]

requires:
  - phase: 03-develop-the-next-version
    provides: "derivePenState and the route-keyed RecipePage backstop (03-06); navigation suppression and truthful dirty checks (03-07); buildStepDiff's per-field flags and coveredRowsFor (03-09)"
provides:
  - "domain/stepNumbers.js: displayNumbers(method) and displayNumberOf(map, n), the derived one-based position of each active step, computed fresh from any method array and never written back to the stored key"
  - "RecipePage.jsx computes currentStepNumbers/baselineStepNumbers once, beside changeDiff, and threads both to Method and IngredientTable — the same one-comparison-computed-once shape the page already uses"
  - "Method.jsx's margin numbers (all three branches), field labels, and the D-UAT-3 coverage cue all read the derived position, with a removed step's margin showing its pre-removal number and its field labels naming it as removed instead"
  - "IngredientTable.jsx's step selector option list now spans every step of the draft version (not only the active ones), giving a row allocated to a removed step a matching option — disabled, marked removed — so the control can never silently display step 1 (G-03-3 S3)"
  - "The step column, the struck baseline, the show-changes from-and-to, both accessible-name builders, and the orphaned-row flag all resolve through the same two maps; a row whose only step reference is removed reads unallocated"
  - "advisories.js's hydration advisory names its matched step by the number the reader sees, not the stored key"
affects: []

actuals:
  tokens: 15900
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "A derived display value (position among the active steps) computed fresh on every read from a stored identity (the step's own key), never cached and never written back — the same split rows.js's activeRows/activeSteps already draws between identity and inclusion"
    - "Two maps (current, baseline) computed once at the page level and threaded to every consumer, extending the one-buildDiff-computed-once shape already established for changeDiff"
    - "A resolution helper with an explicit fallback order (current, else baseline, else none) reused verbatim in both Method.jsx and IngredientTable.jsx, plus a baseline-only/current-only accessor for sites that must name exactly one side of a comparison and must never blend the two"

key-files:
  created:
    - app/src/domain/stepNumbers.js
    - app/src/domain/stepNumbers.test.js
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
    - app/src/domain/advisories.js
    - app/src/domain/advisories.test.js

key-decisions:
  - "The step's stored key (n) is left untouched everywhere it is an identity — buildDiff's baselineStepByN, the pen's four step handlers, a row's step/splitStep reference, a batch's stepChanges keys, the seed's uses lists, and every anchor id (method-step-{n}) and React key — confirmed by grep and by leaving versionLift.js, diff.js, batch.js, and lineage.js untouched, exactly as the plan required."
  - "A removed step's margin number (Method.jsx) shows the number it had before removal (current-else-baseline fallback), but its field labels say 'Removed step, ...' instead of claiming that number — two different sites with two different rules, since the margin already carries a separate 'removed' label while a field's accessible name has nowhere else to say so."
  - "A struck-baseline or show-changes 'from' value is resolved through the baseline map ONLY (never falling back to current), and a 'to'/live value through the current map ONLY — the general current-else-baseline fallback is reserved for sites naming a step that might be either currently active or currently removed (the selector's own option list, the orphaned-row flag), never for a 'was X, now Y' pair, which would otherwise blend two different reference frames."

patterns-established:
  - "resolveStepNumber(n, currentMap, baselineMap) / safeDisplayNumberOf(map, n): the same two-function pair appears verbatim in Method.jsx (as displayNumberFor/fieldLabel) and IngredientTable.jsx, so a future step-numbering consumer has a template rather than inventing its own fallback order."

requirements-completed: [FORM2-01, REC1-03]

coverage:
  - id: D1
    description: "domain/stepNumbers.js exports displayNumbers/displayNumberOf: a removed step is absent from the map, survivors read 1..N with no gap or repeat in the method's own order, the lookup returns null (never undefined/throw) for an absent/null/undefined key, and the builder never mutates or reorders its input"
    requirement: FORM2-01
    verification:
      - kind: unit
        ref: "app/src/domain/stepNumbers.test.js — 13 tests (no-removal, single/double removal, first/last-step removal, all-removed, empty method, absent-key-is-active, lookup null semantics, non-mutation, non-contiguous keys)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Method.jsx renumbers the clean reading and the pen's live steps with no gap after a removal, and in show-changes the struck step reads the number it had in the parent (D-UAT-4); field labels name the same position the margin prints, and a removed step's labels say so in words instead of claiming a position"
    requirement: FORM2-01
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — step display numbers (03-10, G-03-6, D-UAT-4) — 10 tests"
        status: pass
    human_judgment: false
  - id: D3
    description: "A flagged row's step selector keeps the removed step's own option — disabled, carrying its pre-removal number, marked removed in words — so the bound value always matches an option and the control can never silently display step 1 (G-03-3 S3); option values remain the stored keys in every case"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx#IngredientTable — the selector keeps a removed step in its list (G-03-3 S3, 03-10) — 3 tests"
        status: pass
    human_judgment: true
    rationale: "The plan's own task 3 <human-check> (open the pen on the churned olive oil version, remove step 2, confirm the three gum rows' selectors each still show their own allocation rather than step 1; save and read the child; press show changes) needs a real browser and a real select-element interaction that jsdom-free Vitest cannot exercise. Deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase, this phase's standing precedent (03-01, 03-06 through 03-09). All automated verification (build, full suite, every plan-specified grep gate) passed."
  - id: D4
    description: "The step column resolves a row's one or two step references through the maps (unallocated when none resolve, the surviving one alone, or both joined), the struck baseline and show-changes from-and-to read the map matching the side they name, the orphaned-row flag names a removed step by its pre-removal number, and the hydration advisory follows a step's new position after an earlier removal"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx#IngredientTable — the step column resolves references through the maps (03-10) — 3 tests; #IngredientTable — the orphaned-row flag names a removed step by its pre-removal number (03-10) — 1 test"
        status: pass
      - kind: unit
        ref: "app/src/domain/advisories.test.js#buildAdvisories — gum hydration against the hold — names the same step at its new position when an earlier step is removed"
        status: pass
    human_judgment: true
    rationale: "Covered by the same task 3 <human-check> as D3 (the flag/selector/table/advisory behaviour is exercised together on one real page). Deferred to end-of-phase UAT for the same reason; all automated verification passed."

duration: ~30min
completed: 2026-09-08
status: complete
---

# Phase 3 Plan 10: Derived step numbering Summary

**A new framework-free `stepNumbers.js` module derives each step's one-based display position from a method array; `Method.jsx` and `IngredientTable.jsx` both thread the same current/baseline maps so the margin, the field labels, the selector, the step column, the flags, and the hydration advisory all name a step by the same number — closing G-03-6 in full and G-03-3's third symptom.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-09-07 (see task commits below for exact timestamps)
- **Completed:** 2026-09-08T00:00:18Z
- **Tasks:** 3
- **Files modified:** 9 (2 created, 7 modified)

## Accomplishments
- `domain/stepNumbers.js` (new): `displayNumbers(method)` builds a Map from each non-removed step's stored key to its one-based position, in the method's own order; `displayNumberOf(map, n)` looks it up, returning `null` (never `undefined`) for an absent, `null`, or `undefined` key. Pure, framework-free, never mutates or reorders its input, never writes the stored key.
- `RecipePage.jsx` computes `currentStepNumbers`/`baselineStepNumbers` once, beside `changeDiff` — current from the method the page is showing (the draft's while developing, the version's own otherwise), baseline from the record a struck or removed step's number comes from (the pen's own baseline while developing, the live parent while showing changes, `null` wherever neither applies) — and threads both to `Method` and `IngredientTable`.
- `Method.jsx`: one `displayNumberFor(step)` helper (current-else-baseline-else-none) drives the margin number in all three branches, replacing the old `stepDisplayNumber(step) { return step.n }` stand-in. A removed step's margin still shows the number it had before removal (D-UAT-4); a step with no position in either version renders no number at all, never the stored key. Field labels (`Step N, lead-in`, etc.) now name the same position, and a removed step's labels read `Removed step, ...` instead of claiming a position. The coverage cue names its covering step by the same derived number.
- `IngredientTable.jsx`: the step selector's option list is now built from **every** step of the draft version, not only the active ones (G-03-3 S3) — a removed step's own option stays present, `disabled`, carrying its pre-removal number and the word "removed", so a row still allocated to it always has a matching option and React can no longer fall back to selecting the first non-disabled option (step 1). Option values remain the stored keys throughout. The step column resolves a row's one or two step references through the maps (`unallocated` when neither resolves, the surviving reference alone, or both joined) — the remap-on-read the assumed reading calls for; no stored record is rewritten. The struck baseline, the show-changes from-and-to, both accessible-name builders, and the orphaned-row flag all read display numbers from the map matching the side they name.
- `advisories.js`'s `hydrationAdvisory` now takes the version's own `displayNumbers` map and names its matched step by position, closing the fourth (and only non-component) site that printed a stored key.
- 28 new tests across `stepNumbers.test.js` (13), `Method.test.jsx` (10), `IngredientTable.test.jsx` (14, across 3 new describe blocks), and `advisories.test.js` (1) — full suite: 486/486 passing, up from 455 at phase start.

## Task Commits

Each task was committed atomically (MVP mode is active, `workflow.tdd_mode: false`, consistent with this phase's precedent):

1. **Task 1: The derived step number, as a framework-free module that never writes back** — `64184d0` (feat)
2. **Task 2: The method reads 1, 2, 3 again — and a struck step keeps the number it had** — `93c5720` (feat)
3. **Task 3: The table and the margin speak the same numbering — and the selector stops showing a step the row is not in** — `f36b383` (feat)

**Plan metadata:** committed alongside this SUMMARY.

## Files Created/Modified
- `app/src/domain/stepNumbers.js` (new) — `displayNumbers`/`displayNumberOf`
- `app/src/domain/stepNumbers.test.js` (new) — 13 unit tests
- `app/src/ui/RecipePage.jsx` — computes and threads `currentStepNumbers`/`baselineStepNumbers` to `Method` and `IngredientTable`
- `app/src/ui/Method.jsx` — `displayNumberFor`/`fieldLabel` helpers; `coverageSentence` takes the current map; every margin number and field label reads through them
- `app/src/ui/Method.test.jsx` — 10 new tests; one existing coverage-cue test updated to supply the now-required maps and to reflect the corrected derived position (see Deviations)
- `app/src/ui/IngredientTable.jsx` — `resolveStepNumber`/`safeDisplayNumberOf`/`formatStepReferences`; `StepCell`'s option list spans every step; `DiffStepCell`, `rowDiffAccessibleLabel`, `OrphanedRowFlag`, and the step column all resolve through the maps
- `app/src/ui/IngredientTable.test.jsx` — 14 new tests across 3 new describe blocks
- `app/src/domain/advisories.js` — `hydrationAdvisory` takes and reads a `stepNumbers` map
- `app/src/domain/advisories.test.js` — 1 new test (step position follows an earlier removal)

## Decisions Made
- Kept the stored key (`n`) as the sole identity everywhere it is one — `versionLift.js`, `diff.js`, `batch.js`, `lineage.js`, and the pen's four step handlers are untouched, confirmed by `git diff --stat` against the plan's base.
- A removed step's margin number falls back to its pre-removal position (current-else-baseline), but its field labels say "Removed step, ..." instead — two different sites, two different rules, since the margin already carries a separate "removed" label.
- A "was X, now Y" or struck-baseline site resolves through exactly one side's map (baseline-only for "was"/struck, current-only for "now") — never the general fallback, which is reserved for sites naming a step that might be either currently active or currently removed (the selector's options, the orphaned-row flag).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed a crash in an existing coverage-cue test once `coverageSentence` required the current map**
- **Found during:** Task 2, running the full suite after wiring `Method.jsx`'s `coverageSentence` to take `currentStepNumbers`
- **Issue:** The pre-existing test "renders a coverage cue naming the covered rows and the covering step..." (D-UAT-3, from 03-09) rendered `<Method>` with no `currentStepNumbers` prop. `coverageSentence` called `displayNumberOf(null, step.n)`, which throws (`Cannot read properties of null (reading 'has')`) rather than returning `null`, since `displayNumberOf` is documented to receive a Map, not an absent one.
- **Fix:** Updated the test to pass `currentStepNumbers`/`baselineStepNumbers` computed the same way `RecipePage.jsx` computes them, matching real call-site usage. This also corrected the test's own expected text: the fixture's covering step (stored key 2) becomes the version's only remaining active step once step 1 is removed, so its derived position is 1, not 2 — the assertion `'still used by step 2'` was pinning the pre-fix stand-in (`stepDisplayNumber(step) { return step.n }`), not the real position. Updated to `'still used by step 1'` with a comment explaining why.
- **Files modified:** `app/src/ui/Method.test.jsx`
- **Verification:** Full suite passes (478/478 at that point); the corrected assertion demonstrates the exact renumbering behaviour this plan implements.
- **Committed in:** `93c5720` (Task 2 commit)

### Noted, Not Fixed

**2. [Verify-gate imprecision] Task 2's Method.jsx grep gate cannot reach 0 while anchor ids and React keys stay on the stored key**
- **Found during:** Task 2's verification pass
- **Issue:** The plan's task 2 verify gate `grep -cE '\{step\.n\}|Step \$\{step\.n\}'` counts matching **lines**, and the literal 8-character substring `{step.n}` is unavoidably present in any line reading `<li key={step.n} id={\`method-step-${step.n}\`}>` — the exact anchor/key form the same plan requires ("Leave the anchor ids on the stored key", confirmed by a companion gate requiring `method-step-` to appear at least 3 times). The count is 3, not 0, from these 3 `<li>` header lines alone; no margin number or field label contributes to the count (confirmed by manual review and by the dedicated field-label/margin tests this plan added).
- **Why not fixed:** The only way to drive the count to 0 while keeping anchors and keys on the stored key would be an unmotivated code change (e.g. `key={String(step.n)}`, `id={'method-step-' + step.n}`) made solely to evade an overly broad grep pattern — contradicting the project's Simplicity First principle (CLAUDE.md) and touching code the plan itself says must stay untouched.
- **Verification:** All other automated gates for tasks 2 and 3 pass; the qualitative acceptance criteria this gate exists to enforce ("No margin number or field label reads the stored key; every anchor id still does") are independently confirmed by the new tests and by manual `grep` inspection excluding the 3 anchor/key lines.

---

**Total deviations:** 1 auto-fixed (1 bug), 1 noted verify-gate imprecision (not a code defect).
**Impact on plan:** The auto-fix was necessary for test correctness and demonstrates the plan's own intended behavior. The noted gate imprecision does not indicate any unmet acceptance criterion — it is a false positive in one specific grep pattern that also flags code the plan explicitly requires to keep.

## Issues Encountered
None beyond the deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- G-03-6 is closed in full: the clean reading, the pen, and show-changes all renumber the remaining active steps in sequence with no gap; a struck step in show-changes reads the number it had in the parent (D-UAT-4).
- G-03-3's symptom 3 is closed: a flagged row's step selector always shows its own allocation, with the removed step present, disabled, and marked in words — the control can no longer silently display step 1.
- The dangling step reference already sitting in a saved child (five rows in the churned olive oil example, per the plan's own note) now reads `unallocated` rather than a stale number, on read only — no stored record was migrated.
- The stored step key remains the one identity every other module keys on: `versionLift.js`, `diff.js`, `batch.js`, `lineage.js`, and the pen's four step handlers are untouched.
- This was the last gap-closure plan (`gap_closure: true`) in Phase 3. With this SUMMARY written, the shared requirement IDs across 03-06 through 03-10 (FORM2-01, REC1-03) were checked via `requirements.ready-ids` and found already marked complete by earlier sibling plans in this phase — no further action needed.
- The task 3 human-check (real-browser selector/table/advisory behaviour on the churned olive oil version) is deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`, this phase's standing precedent. All automated verification (`npm --prefix app test`: 486/486 pass, up from 455 at phase start; `npm --prefix app run build`: exits 0; every plan-specified grep gate except the noted imprecision) passed.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-08*

## Self-Check: PASSED
