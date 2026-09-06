---
phase: 02-record-the-first-batch
plan: 01
subsystem: recipe-batch-recording
tags: [react, react-router, idb, indexeddb, vitest, domain-modeling]

# Dependency graph
requires:
  - phase: 01-develop-a-recipe
    provides: the version-embedded ingredient row model, the repository seam, IndexedDB store at version 1, tokens.css and app.css conventions, the pure-domain-module pattern
provides:
  - A framework-free batch record module (domain/batch.js) owning the record's shape, its once-taken snapshot, and the blank/zero/absent as-made discipline
  - The batches object store at IndexedDB version 2 with a by-version index, and three repository seam methods (listBatchesForVersion, getBatch, saveBatch)
  - A second route, /recipe/:id/batch/:batchId, resolving to RecipePage with a saved batch's layer
  - The pen layer's UI (BatchMargin.jsx, the as-made column in IngredientTable.jsx) writable from the recipe page's own state
  - formatShareOfBatch and formatGrams in domain/composition.js — the tested homes for the printed share (trace below 0.05%) and computed grams totals
  - A total row (plan total, and an as-made total while an as-made layer is showing) and right-aligned, content-sized numeric columns on the ingredient table
affects: [02-02-batch-method-and-churn-section, 02-03-tastings-and-axes, phase-4-print]

# Actuals (#2632)
actuals:
  tokens: 9781
  tasks: 3
  commits: 6

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Presence over truthiness: every optional numeric field (as-made, measured) is tested with Object.prototype.hasOwnProperty.call, never ||/?? or a falsy check, so a written 0 stays a real value"
    - "Snapshot-once: createBatch takes a structuredClone of the version's rows/declaredAxes/coefficientSetId/versionLabel exactly once; nothing in domain/batch.js ever retakes it"
    - "Computed figures route through a single tested formatter (formatShareOfBatch, formatGrams) rather than an inline toFixed/rounding expression in a component"
    - "The pen layer is a state of the existing recipe page (mode, draft), not a second route or a modal; only the save handler's event callback touches crypto.randomUUID()/new Date()"

key-files:
  created:
    - app/src/domain/batch.js
    - app/src/domain/batch.test.js
    - app/src/ui/BatchMargin.jsx
  modified:
    - app/src/data/olive-oil.js
    - app/src/store/db.js
    - app/src/store/repository.js
    - app/src/router.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/styles/tokens.css
    - app/src/styles/app.css
    - app/src/domain/composition.js
    - app/src/domain/composition.test.js

key-decisions:
  - "Added formatGrams(grams) to domain/composition.js, alongside formatShareOfBatch, to satisfy the plan's own gate forbidding a literal toFixed(1) in IngredientTable.jsx for the total row's grams figures — not in the plan's stated composition.js export list; documented as a Rule 3 deviation below."
  - "The tracer feedback gate's human-check (Task 1) and Task 3's human-check are deferred to end-of-phase UAT at the user's explicit request (away from the computer when the checkpoint was reached); all automated verification for both was re-run and passes."

patterns-established:
  - "Pattern 1: a computed total or share is always formatted through a named, tested function — never an inline toFixed/rounding call in a component — so the rounding boundary is provable in one place"
  - "Pattern 2: a maker-typed value's presence in a record is decided by hasOwnProperty, and the same discipline extends to the as-made cell's controlled-input value (empty string when absent, delete-the-key on clear)"

requirements-completed: [BATCH1-01, BATCH2-01, BATCH2-02]

coverage:
  - id: D1
    description: "End-to-end tracer — an as-made amount typed on the churned recipe is saved as a batch and reopens at its own URL, in a fresh tab and after reload, with the ink unchanged"
    requirement: "BATCH1-01"
    verification:
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (idb-importer, by-version index, router route, dependency-list, colour-literal, and dangerouslySetInnerHTML gates)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. Tracer visual check deferred at the checkpoint by the user (away from computer); to be run in end-of-phase UAT. The negative/structural gates above are proven automated, but the actual click-through (open margin, type date and 383, Save batch, URL changes, reopen in a fresh tab) has not been watched by a human."
  - id: D2
    description: "A written 0 is a distinguishable stored value from an absent as-made entry, the plan's own grams never leaks into the as-made reading, and a batch's snapshot survives a later edit to the version it was made against"
    requirement: "BATCH1-01"
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#the blank/zero/plan-never-leaks discipline"
        status: pass
      - kind: unit
        ref: "app/src/domain/batch.test.js#asMadeTotals"
        status: pass
    human_judgment: false
  - id: D3
    description: "A row's share of batch reads trace strictly below 0.05%, one decimal at and above the threshold, and a computed grams total formats to one decimal with a unit"
    verification:
      - kind: unit
        ref: "app/src/domain/composition.test.js#formatShareOfBatch"
        status: pass
      - kind: unit
        ref: "app/src/domain/composition.test.js#formatGrams"
        status: pass
    human_judgment: false
  - id: D4
    description: "The ingredient table's three numeric columns render right-aligned and sized to --col-numeric rather than stretching to fill, and the total row / as-made small-print line appear correctly in the browser, live-updating as the maker types"
    requirement: "BATCH2-02"
    verification: []
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. Task 3's human-check step is deferred at the checkpoint by the user alongside the Task 1 tracer check; to be run in end-of-phase UAT."

duration: 62min
completed: 2026-09-06
status: complete
---

# Phase 2 Plan 1: End-to-end batch recording, blank/zero discipline, and table carries Summary

**A framework-free `domain/batch.js` owning the batch record's once-taken snapshot, a second `batches` IndexedDB store wired through the repository seam, a URL-addressable saved batch, and the total-row/trace/right-alignment carries the as-made column brings to the ingredient table.**

## Performance

- **Duration:** 62 min (across two executor sessions, separated by a deferred tracer checkpoint)
- **Started:** 2026-09-06T18:44:09Z (Task 1, prior session)
- **Completed:** 2026-09-06T15:24:00Z (this session, wall-clock UTC equivalent)
- **Tasks:** 3
- **Files modified:** 14 (3 created, 11 modified)

## Accomplishments

- The maker can open the pen layer from the margin, type a churn date and an as-made amount, save, and land on `/recipe/olive-oil-ice-cream-v1/batch/{batchId}` with the ink in place — the tracer slice proven end to end at the structural/build level (visual click-through deferred to UAT).
- `createBatch` snapshots a version's rows, `declaredAxes`, `coefficientSetId`, and `versionLabel` via `structuredClone`, taken once and proven immune to a later edit of the live version — the regression test for the drift PROJECT.md records as having silently corrupted historical batches.
- Blank, zero, and the plan are three provably distinct facts: `hasAsMade`/`asMadeFor` use an own-property check everywhere, so an untouched cell reads blank, a written `0` reads `0`, and the plan's own grams never leak into the as-made reading.
- `asMadeTotals` sums a plan total and an as-made total (a written `0` contributes zero; an absent entry contributes the plan), and the ingredient table now states both in a `tfoot` row plus a small-print line, closing the two Phase 1 critique carries recorded in STATE.md.
- `formatShareOfBatch` reads a row's share as `trace` strictly below 0.05% of batch and to one decimal above it; the three numeric columns (Grams, As made, % of batch) are right-aligned and sized via `--col-numeric` instead of stretching to fill.
- This phase installs no npm package: the dependency list gate confirms `app/package.json` is unchanged from Phase 1.

## Task Commits

Each task followed RED → GREEN (TDD):

1. **Task 1: End-to-end — an as-made amount is written on the churned recipe, saved as a batch, and reopens by URL**
   - `85e7bce` — test(02-01): add failing tests for the batch record's creation and round trip (RED)
   - `398d822` — feat(02-01): wire an as-made amount from typed input to a stored, reopenable batch (GREEN)
2. **Task 2: Blank, zero, and the snapshot that does not move**
   - `9ce2fb2` — test(02-01): add failing tests for blank/zero/snapshot-immunity and asMadeTotals (RED)
   - `117c06d` — feat(02-01): implement asMadeTotals and the blank/zero/snapshot precision contract (GREEN)
3. **Task 3: The three carries the as-made column brings with it**
   - `9824e6e` — test(02-01): add failing tests for formatShareOfBatch (RED)
   - `299a13a` — feat(02-01): sized right-aligned numeric columns, a total row, and trace below 0.05% (GREEN)

_No REFACTOR commit was needed for any task — each GREEN implementation was minimal and left no follow-up cleanup._

**Plan metadata:** committed with this SUMMARY (see below).

## Files Created/Modified

- `app/src/domain/batch.js` — the batch record's shape and rules: `createBatch`, `hasAsMade`, `asMadeFor`, `asMadeTotals`, `formatRecordDate`, `BATCH_SCHEMA_VERSION`
- `app/src/domain/batch.test.js` — the record's rules under test, including the snapshot-does-not-move and blank/zero/absent invariants
- `app/src/ui/BatchMargin.jsx` — the margin's batch-log block: no-batch, recording, and saved-batch reading states
- `app/src/data/olive-oil.js` — `declaredAxes` now a two-element `{ name, low, high }` list
- `app/src/store/db.js` — `DB_VERSION = 2`; guarded `versions` and new `batches` (keyPath `id`, `by-version` index) stores
- `app/src/store/repository.js` — `listBatchesForVersion`, `getBatch`, `saveBatch` added to the seam
- `app/src/router.jsx` — `/recipe/:id/batch/:batchId` route added
- `app/src/ui/RecipePage.jsx` — `batchId` param, `openBatch` derivation, `mode`/`draft` state, save handler
- `app/src/ui/IngredientTable.jsx` — as-made column, `tfoot` total row, small-print line, sized/right-aligned numeric columns, `formatShareOfBatch` wired in
- `app/src/styles/tokens.css` — `--rule-ink-field`, `--size-ink-field`, `--col-numeric`
- `app/src/styles/app.css` — pen layer styling, numeric column sizing/alignment, total-row rule, small-print style
- `app/src/domain/composition.js` — `formatShareOfBatch`, `formatGrams` added
- `app/src/domain/composition.test.js` — `formatShareOfBatch` and `formatGrams` test coverage

## Decisions Made

- Added `formatGrams(grams)` to `domain/composition.js` — not in the plan's stated `composition.js` export list — because the plan's own Task 3 acceptance gate forbids a literal `toFixed(1)` anywhere in `IngredientTable.jsx`, and the total row needed a one-decimal grams figure formatted somewhere. Routing it through a tested formatter (the same pattern as `formatShareOfBatch`) satisfies the gate without an inline rounding call in the component. See Deviations below.
- The tracer feedback gate (Task 1) and Task 3's `<human-check>` were both deferred to end-of-phase UAT at the user's explicit instruction, given mid-session unavailability. All automated verification for both tasks was re-run before continuing and passes; see `## Deferred Human Verification` below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `formatGrams` to `domain/composition.js`, not in the plan's stated exports**
- **Found during:** Task 3 (sized numerics, total row, trace)
- **Issue:** The plan's own acceptance gate (`grep -cE 'toFixed\(1\)'` over `IngredientTable.jsx` must be `0`) blocks any inline one-decimal formatting in the component, but the total row's plan/as-made grams figures need one-decimal-with-unit formatting (`799.7 g`, `804.3 g`). The plan's `composition.js` export list (`computeBalance`, `weakestBasis`, `COEFFICIENT_SET`, `formatShareOfBatch`) did not anticipate this second formatter.
- **Fix:** Added `formatGrams(grams)` beside `formatShareOfBatch` in `domain/composition.js`, with its own test coverage, and used it for both the visible total-row cells and (with a `' g'` → `' grams'` substitution) the row's accessible name — so no literal `toFixed(1)` remains in `IngredientTable.jsx`.
- **Files modified:** `app/src/domain/composition.js`, `app/src/domain/composition.test.js`, `app/src/ui/IngredientTable.jsx`
- **Verification:** `grep -vE '^[[:space:]]*(//|\*|/\*)' app/src/ui/IngredientTable.jsx | grep -cE 'toFixed\(1\)'` returns `0`; full test suite passes (100/100)
- **Committed in:** `299a13a` (Task 3 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to satisfy the plan's own gate; no scope creep — the new export follows the exact pattern (`formatShareOfBatch`) the plan already specified for the sibling formatter.

## Issues Encountered

None beyond the deviation above.

## Deferred Human Verification

The following `<human-check>` steps from the plan were deferred to end-of-phase UAT at the user's explicit request (away from the computer when the tracer feedback checkpoint was reached after Task 1). All automated verification (`npm --prefix app run build`, `npm --prefix app test`, and every grep-based acceptance gate) was re-run before continuing past the checkpoint and again after Tasks 2 and 3, and passes. These steps still require a human to watch the actual browser behavior:

**From Task 1 (tracer):**
> Run `npm --prefix app run dev` and open the churned recipe. The margin says the version has no batch recorded and offers `Record a batch`. Click it: the as-made column appears beside Grams, the churn date field is focused, and nothing anywhere is pre-filled. Type 2 August 2026 and 383 beside whole milk's 370.4 g, leave every other cell empty, and click `Save batch`. The URL becomes `/recipe/olive-oil-ice-cream-v1/batch/…`, the fields become plain blue text, and the margin reads "recorded {today} against 50 g oil · 800 g". Copy that URL into a new tab: the same page, the same 383, the same empty cells. Reload: unchanged.

**From Task 3 (sized numerics, total row, trace):**
> Open the churned recipe. The three numeric columns are right-aligned and no wider than their contents; the ingredient names have not moved. Lambda carrageenan's share reads `trace`, guar gum reads `0.1%`. A total row states `799.7 g` with no as-made figure. Now click `Record a batch` and type 383, 241, 45 and 0 on whole milk, heavy cream, Graza Drizzle and soy lecithin: the as-made total reads `804.3 g` beside the plan's `799.7 g`, with the small-print line beneath saying what the as-made total is made of. Clear the 0 on the lecithin row: the as-made total rises to `805.5 g`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02-02 (method strikes, churn section, measured values) attaches directly to the `churn` object's remaining `null`/`{}` fields this plan created (`stepChanges`, `comeUpMinutes`, `drawTempC`, `overrunPercent`, `drawNotes`, `ingredientNotes`, `nextTimeNote`) and to the `getAllBatches`/`putAllBatches` seam methods it still needs to add.
- Plan 02-03 (tastings and axes) attaches to the `tastings: []` array and the snapshot's `declaredAxes`, both already shaped and proven immune to a later version edit.
- The deferred human-check items above should be run together at end-of-phase UAT, alongside 02-02's and 02-03's own deferred checks, per `workflow.human_verify_mode: end-of-phase`.
- No blockers.

---
*Phase: 02-record-the-first-batch*
*Completed: 2026-09-06*

## Self-Check: PASSED

- All 13 key files verified present on disk (`[ -f ]`).
- All 6 task commits (`85e7bce`, `398d822`, `9ce2fb2`, `117c06d`, `9824e6e`, `299a13a`) verified present in `git log --oneline --all`.
- Re-ran every acceptance criterion and the plan-level `<verification>` block: `npm --prefix app run build` (exit 0), `npm --prefix app test` (100/100, up from the Phase 1 baseline of 76), the idb-importer/by-version-index/router-route/dependency-list/hasOwnProperty/no-rounding/no-toFixed(1)/no-dangerouslySetInnerHTML gates all pass.
- **Caveat:** the literal `test "$(grep -rIcE '#[0-9a-fA-F]{3,8}' <file> | tr -d ' ')" = 0` colour-literal gates for `BatchMargin.jsx` and `IngredientTable.jsx` fail as *literally written* on this machine's BSD/ugrep-wrapped `grep`, which prints a `path:0` filename prefix for `-r` against a single named file (unlike GNU grep, which the command was apparently authored against). The underlying invariant — zero colour literals in either file — is confirmed via the equivalent non-`-r` form (`grep -cE '#[0-9a-fA-F]{3,8}' <file>` returns bare `0` for both), so this is a shell/grep portability quirk in the gate's exact invocation, not a defect in the code.
