---
phase: quick-260925-re3
plan: 01
subsystem: data
tags: [seed-data, ice-ed, transcription, review-doc]

# Dependency graph
requires:
  - phase: quick-260925-lpd
    provides: Standard Base, Underbelly Light Base, Strawberry and Mocha seeded from Ice Ed exports, binder photos and the comparisons workbook
provides:
  - Every transcribed batch keeping only what its binder page itself marks, for every recipe
  - Underbelly Light Base with no batch at all; Mocha v1 citing Mocha v0's batch with reason null
  - Each Strawberry version embedding its own .ier's strawberry definitions
  - One shared Whole Milk 3.5% ingredient (olive oil's wholeMilk), unedited
  - 03.5-SEED-REVIEW.md, the sidecar, plan 03.5-09 and D-05 amended to match
affects: [03.5-09-checkpoint, seed-review]

# Actuals (#2632)
actuals:
  tokens: 28000
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Module-private ingredient definitions (strawberry.js's STRAWBERRIES_V1_V2_IER / DRIED_STRAWBERRY_V2_IER) embedded via the module's existing embed(), for a source-specific block a shared library entry cannot honestly hold"

key-files:
  created: []
  modified:
    - app/src/data/mocha.js
    - app/src/data/strawberry.js
    - app/src/data/underbelly-light-base.js
    - app/src/data/seed-recipes.js
    - app/src/data/library.js
    - app/src/data/seed-recipes.test.js
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md
    - Ice Cream Log Pages/seed-transcription-sidecar.json

key-decisions:
  - "Strawberry V1/V2's strawberry definitions live in strawberry.js as module-private constants (STRAWBERRIES_V1_V2_IER, DRIED_STRAWBERRY_V2_IER), not new library entries — a library entry named \"Strawberry (dried)\" holding V2.ier's fresh-fruit data would mislead any future picker; V2.1 keeps embedding the shared library entries"
  - "Strawberry V2's base-only ink lines join churn.atTheMachine after \"Age Overnight\", not a tasting — no new field invented"
  - "Whole Milk 3.5% merges into olive oil's existing wholeMilk entry, left unedited; the separate wholeMilk35 entry is deleted; the earlier 'kept apart per Mark' library note is corrected as the orchestrator's own wording, not Mark's"
  - "Mocha v1's reason stays null — its typed guar line does not describe its own rows (guar stays 0.5, coffee 30->15), so no reason is set (judgement call 36)"

patterns-established: []

requirements-completed: [D-03, D-04, D-05, D-06, D-07]

coverage:
  - id: D1
    description: "No transcribed batch carries a comparisons-workbook line or mark; Underbelly Light Base v1 has no batch; Strawberry V2 and Mocha v2 read Awaiting tasting; Mocha v1 cites mocha-v0-batch-01 with reason null"
    requirement: "D-06"
    verification:
      - kind: unit
        ref: "app/src/data/seed-recipes.test.js#no tasting carries a comparisons-workbook verdict (Mark 2026-09-25, open question 10)"
        status: pass
      - kind: unit
        ref: "app/src/data/seed-recipes.test.js#has exactly one batch per version with the approved fields, page-only content (Mark 2026-09-25)"
        status: pass
      - kind: unit
        ref: "app/src/data/seed-recipes.test.js#Underbelly Light Base has no batch (Mark 2026-09-25): both versions read not yet churned"
        status: pass
      - kind: unit
        ref: "app/src/data/seed-recipes.test.js#standings across Mocha versions cover TASTED, NOT_YET_CHURNED, AWAITING_TASTING and AWAITING_TASTING (Mark 2026-09-25)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Each Strawberry version's strawberry rows embed its own .ier's definitions, rounding to its printed page's sugar/PAC/POD; Whole Milk 3.5% rows across Strawberry and Mocha embed the unedited library.wholeMilk"
    requirement: "D-03"
    verification:
      - kind: unit
        ref: "app/src/data/seed-recipes.test.js#each strawberry row's grams x sugar, PAC and POD rounds to its printed page's figure"
        status: pass
      - kind: unit
        ref: "app/src/data/seed-recipes.test.js#library has no separate 3.5% entry; every \"Whole Milk 3.5%\" row embeds the unedited wholeMilk"
        status: pass
    human_judgment: false
  - id: D3
    description: "03.5-SEED-REVIEW.md, the sidecar, plan 03.5-09 and D-05 record Mark's 2026-09-25 answers in his own words, with the whole-milk figure-shift tables and the corrected lpd attribution"
    verification: []
    human_judgment: true
    rationale: "Documentation-accuracy and prose-fidelity checks (does the review read as Mark's own words, is nothing overstated) are a human editorial judgment, not something a unit test can certify — the automated gates in this plan check structural markers (row text, judgement-call numbering, sidecar keys) but not prose quality."

duration: 14min
completed: 2026-09-25
status: complete
---

# Quick Task 260925-re3: Apply Mark's Answers to Seed Open Questions Summary

**Every transcribed batch now carries only what its own binder page marks — Underbelly Light Base has no batch, Mocha v1 cites Mocha v0's batch, each Strawberry version embeds its own .ier's strawberry coefficients, and Whole Milk 3.5% is one shared library entry.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-09-25T20:07:47-04:00
- **Completed:** 2026-09-25T20:21:58-04:00
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Removed every comparisons-workbook line and mark from transcribed batch tastings (Mocha v0/v2, Strawberry V1/V2/V2.1), applying Mark's "if not marked, then ignore" rule to every recipe, not just Mocha
- Moved Strawberry V2's base-only ink lines ("Good Flavor in Sweet Cream" / "Sweet cream is thick") onto `churn.atTheMachine` instead of reading them as a tasting; V2's batch now has `tasting: null` and reads Awaiting tasting
- Deleted Underbelly Light Base v1's batch entirely (no page, no process value, no tasting); both its versions now read Not yet churned
- Set Mocha v1's `citedBatchId` to `mocha-v0-batch-01` (v1 was re-saved after v0's churned batch, IMG_2464) with `reason` left null
- Added module-private `STRAWBERRIES_V1_V2_IER` and `DRIED_STRAWBERRY_V2_IER` definitions in strawberry.js so Strawberry V1's and V2's strawberry rows compute to their printed pages' exact sugar/PAC/POD figures; V2.1 keeps embedding the shared library entries
- Merged Whole Milk 3.5% into olive oil's existing `wholeMilk` library entry (left unedited); deleted the separate `wholeMilk35` entry and corrected its "kept apart per Mark" note, which was the orchestrator's wording, not Mark's
- Amended 03.5-SEED-REVIEW.md (judgement calls 53-57, the Comparisons workbook table, seven version sections, and seven States-coverage rows), the transcription sidecar (verdictsStatus flags, ingredientDefinitions, two batchFlags), plan 03.5-09's checkpoint context line, and 03.5-CONTEXT.md's D-05 amendment

## Task Commits

Each task was committed atomically:

1. **Task 1: Mark's batch rulings end to end** - `f629638` (fix)
2. **Task 2: Ingredient definitions** - `f41cd8d` (fix)
3. **Task 3: Review, sidecar, plan 03.5-09 and D-05** - `ab4c924` (docs)

**Plan metadata:** not committed separately (see Deviations)

_Note: all three tasks landed cleanly without RED-attempt churn beyond the plan's own described RED/GREEN sequence._

## Files Created/Modified
- `app/src/data/mocha.js` - v0's tasting narrowed to page-only marks/note; v1 cites v0's batch, reason stays null; v2's tasting deleted (createBatch's third arg now `null`); row-01 embeds `library.wholeMilk` on v0/v1/v2
- `app/src/data/strawberry.js` - V1's note trimmed to its own lines; V2's atTheMachine gains the base-only lines, tasting deleted; V2.1's marks/note trimmed; new `STRAWBERRIES_V1_V2_IER`/`DRIED_STRAWBERRY_V2_IER` constants; row-01 embeds `library.wholeMilk` on all three versions
- `app/src/data/underbelly-light-base.js` - v1's batch (ID, churn fields, tasting fields, `createBatch` export and its now-unused import) deleted entirely
- `app/src/data/seed-recipes.js` - Underbelly Light Base group's `batches` set to `[]`; the removed batch's import dropped
- `app/src/data/library.js` - `wholeMilk35` entry deleted (comment only in its place); `wholeMilk37`, `strawberries` and `driedStrawberry` notes corrected; no new data line added
- `app/src/data/seed-recipes.test.js` - new no-workbook-tasting invariant, page-only batch expectations, Mocha v1's citation, per-version strawberry-definition tests (with the printed-figure check), the whole-milk merge test; existing Strawberry/Mocha/Underbelly tests rewritten to the new standings
- `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md` - judgement calls 31-37 amended, calls 53-57 added, Comparisons workbook table/conflicts updated, seven version sections revised, seven States-coverage rows replaced, six open questions answered
- `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md` - one sentence added to the checkpoint's context line
- `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md` - one nested bullet added under D-05's 260925-lpd amendment
- `Ice Cream Log Pages/seed-transcription-sidecar.json` - six `verdictsStatus` flags, three `ingredientDefinitions` blocks (plus one `ingredientDefinitionsFlag`), and two `batchFlag`s (mocha-v1, underbelly-light-base-v1)

## Decisions Made
- Followed the plan's own recorded planner decisions exactly (strawberry definitions module-private, V2's base lines to `atTheMachine`, milk rows keep their printed name, `wholeMilk` stays unedited, `wholeMilk37`'s note drops "and 3.5%", Mocha v1's reason stays null, plan 03.5-09 needs only the one context-line edit, D-05 gets a nested amendment) — no departures from what Mark and the planner already settled.
- Where the plan's Task 3 instructions named a single table cell to edit but left an adjacent cell referencing since-removed content (e.g. Strawberry V2's "Strawberry (dried)" ingredient-mapping row still naming `driedStrawberry` as its Library key after Task 2 moved it to a module-private constant), updated the adjacent cell too for internal consistency — the review's job is to describe exactly what the code now holds.

## Deviations from Plan

None (Rules 1-4) — plan executed as written. One process note: the general orchestrator constraint "Do NOT commit docs artifacts (PLAN.md)" was read as governing this quick task's own tracking files (260925-re3-PLAN.md/SUMMARY.md/STATE.md), not `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md`, which Task 3 explicitly names as an edit-and-commit target with its own verify gate checking the git diff. Committed it per the plan's explicit instruction; flagging the ambiguity here for visibility.

## Evidence re-measured (not copied from the plan)

Per the dispatch's evidence-discipline instruction, independently re-verified rather than trusting the plan's stated numbers:
- Read `Strawberry V1.ier`, `Strawberry V2.ier` and `Strawberry V2.1.ier` directly (`~/Desktop/Ice Cream/`) — all raw Water/Sugar/Solids/PAC/POD/kcal/Fat values matched the plan's stated blocks exactly, including the unrounded PAC `0.10055716666666667`.
- Converted the three binder photos (IMG_2455, IMG_2456, IMG_2457) from HEIC to JPEG and read them directly — every printed Sugar/PAC/POD figure the plan cited (27.7/52.1/50.8; 2.99/5.66/5.49; 5.34/10.1/9.8; 12.3/21.4/15.3; 5.19/9.01/6.47) matched the photographed page exactly, as did the churn/tasting ink lines used in Task 1.
- Independently computed `rowGrams(row) x composition.{sugar,pac,pod}` for all five affected rows against the embedded definitions and confirmed each rounds to its printed string.
- Read `Strawberry V1.ier`'s and `Mocha.ier`'s own "Whole Milk 3.5%" blocks and confirmed msnf 0.087 (vs. `library.wholeMilk`'s 0.088) and the domain's lactose formula (54.5% of MSNF, PAC 100, POD 16 in `composition.js`) match what the review's judgement call 57 states.

No disagreement was found between any re-measured value and the plan's stated figures — no source-wins deviation was needed.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- The transcribed seed (`app/src/data/`) now reflects Mark's 2026-09-25 rulings end to end; nothing is wired into `store/seed.js` (D-07 still holds — this remains a review artifact).
- Plan 03.5-09's D-07 approval checkpoint is unaffected structurally (only its context line gained one sentence); Mark's approval of the (now-updated) review is still the gate before the seed is wired in.
- **Flag for whoever next touches `.claude/CLAUDE.md` or `app/src/data/`:** its Architecture section states a version row embeds "a `structuredClone` of the shared library entry". Strawberry V1's and V2's `Strawberries`/`Strawberry (dried)` rows now `structuredClone` a module-private definition in `strawberry.js` instead, for two of the module's ingredient rows — a narrow, deliberate exception (judgement call 54), but the `.claude/CLAUDE.md` sentence is now imprecise for those two rows. Not edited here per this task's explicit constraint to report rather than fix it.

---
*Phase: quick-260925-re3*
*Completed: 2026-09-25*

## Self-Check: PASSED

All three task commits (`f629638`, `f41cd8d`, `ab4c924`) found in `git log`. All ten modified files and this SUMMARY.md confirmed present on disk.
