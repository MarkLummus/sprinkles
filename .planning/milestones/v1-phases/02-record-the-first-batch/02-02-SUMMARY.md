---
phase: 02-record-the-first-batch
plan: 02
subsystem: recipe-batch-recording
tags: [react, idb, vitest, domain-modeling, form-controls]

# Dependency graph
requires:
  - phase: 02-record-the-first-batch
    provides: "02-01's domain/batch.js shape (churn object with stepChanges/comeUpMinutes/drawTempC/overrunPercent/drawNotes/ingredientNotes/nextTimeNote already present as null/{}), the batches IndexedDB store at DB_VERSION 2, the pen-layer draft/mode state on RecipePage, and the as-made column's blank/zero/absent discipline to mirror"
provides:
  - "Per-step strike and one changed line in the maker's words (Method.jsx), read through domain/batch.js's stepChangeFor/isStruck/changedLineFor — no reader has a \"done as written\" value"
  - "The churn section's full field set (come-up, draw temperature, overrun, draw notes, ingredient notes, next-time note), each measured value routed through readMeasured so a blank reads the word unknown"
  - "A beforeunload guard: the browser's own leave warning while recording holds a dirty draft, nothing else"
  - "The store file's schemaVersion 2 branch: validateBatch, getAllBatches/putAllBatches, and the schemaVersion-1-still-imports decision"
affects: [02-03-tastings-and-axes, phase-3-develop-a-recipe, phase-4-print]

# Actuals (#2632)
actuals:
  tokens: 12003
  tasks: 3
  commits: 6

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "A domain reader takes the record it operates over as its first argument (stepChangeFor(batch, n)), even when the caller only has a bare stepChanges map — the caller wraps it ({ churn: { stepChanges } }) rather than the reader growing a second signature"
    - "A measured field's UI round trip: the draft holds the raw typed string (matching the as-made column's established pattern), and the string -> number-or-null / string -> text-or-null conversion happens once, at save time, in the same handler that already does this for as-made values"
    - "A dirty-check for an unsaved-work guard is written as presence-over-truthiness against every field, not a single isDirty flag toggled by handlers — so a written 0 in a numeric field still counts as dirty, matching the same discipline the stored record applies"

key-files:
  created: []
  modified:
    - app/src/domain/batch.js
    - app/src/domain/batch.test.js
    - app/src/ui/Method.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchMargin.jsx
    - app/src/store/repository.js
    - app/src/store/transfer.js
    - app/src/store/transfer.test.js
    - app/src/styles/app.css

key-decisions:
  - "A schemaVersion 1 store file still imports, as a store with no batches; a schemaVersion 1 file that nonetheless carries a non-empty batches array is refused as malformed rather than accepted as old. Export always writes schemaVersion 2. Stated in a comment above validateStoreFile."
  - "app/src/styles/tokens.css needed no new custom property: every value the strike, changed line, recording controls, and churn section required already existed (--pen-blue, --gap-*, --size-*, --face-*). The plan's contingent --width-changed-line token was not needed."
  - "readMeasured and the six churn measurement/note fields on createBatch (Task 2's domain scope) were implemented alongside Task 1's stepChanges plumbing, in one coherent edit to the same churnFields object — see Deviations."

patterns-established:
  - "Pattern: a component that needs a tested domain reader but only holds a sub-object of the record (Method.jsx holding stepChanges, not a whole batch) constructs a minimal wrapper shaped like the reader's parameter, rather than the reader gaining an overload"

requirements-completed: [BATCH1-01, BATCH1-02, BATCH2-01]

coverage:
  - id: D1
    description: "The maker can strike a method step and write one changed line per step in their own words; an untouched step carries nothing and is never rendered as done as written"
    requirement: "BATCH1-01"
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#stepChangeFor / isStruck / changedLineFor"
        status: pass
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (changedLineFor-reader gate, target-chip second-value gate, colour/px literal gate on Method.jsx)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. Task 1's <human-check> (open the churned recipe, strike step 1, type step 8/9's lines, confirm step 3 stays unmarked, tab through with the keyboard) was deferred to end-of-phase UAT at the user's explicit instruction (away from the computer). All automated verification was run and passes."
  - id: D2
    description: "The churn section carries every measured value the sheet's batch-log page asks of the churn event, each with its unit on its label; a blank reads unknown in ink and nothing is filled in from the recipe; leaving with unsaved ink raises only the browser's own warning"
    requirement: "BATCH1-02"
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#readMeasured"
        status: pass
      - kind: unit
        ref: "app/src/domain/batch.test.js#the churn section round trip: unrounded, and overrunPercent stays null rather than 0"
        status: pass
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (readMeasured-reader gate, no-toFixed/Math.round/toLocale/Intl gate on batch.js, colour/px literal gate on BatchMargin.jsx)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. Task 2's <human-check> (read the empty churn section top to bottom, type 20/−6/blank overrun, save, confirm the reading state and the browser's own leave-warning behavior) was deferred to end-of-phase UAT at the user's explicit instruction. All automated verification was run and passes."
  - id: D3
    description: "A recorded batch survives an export and an import unchanged at schemaVersion 2; a malformed file (one bad batch beside a good one) writes nothing at all with every error named; a schemaVersion 1 file written by Phase 1 still imports"
    requirement: "BATCH2-01"
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#validateStoreFile (schemaVersion 2 acceptance, schemaVersion 1 no-batches acceptance, schemaVersion 1 non-empty-batches refusal, schemaVersion 3 refusal, written-0 as-made acceptance, string as-made refusal, three-errors-in-one-call, __proto__ refusal)"
        status: pass
      - kind: unit
        ref: "app/src/store/transfer.test.js#importStore (schemaVersion 1 and 2 writes, refuse-the-whole-file leaves both putAll and putAllBatches uncalled)"
        status: pass
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (validateBatch-defined gate, single-idb-importer gate, no-network-API gate, no-truthy-fallback gate)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. Task 3's <human-check> (record a batch, export, hand-edit a field to a bad value, re-import, confirm the store is untouched; import a Phase 1 file) was deferred to end-of-phase UAT at the user's explicit instruction. All automated verification was run and passes."

duration: 62min
completed: 2026-09-06
status: complete
---

# Phase 2 Plan 2: Method strikes, the churn section's measured values, and schemaVersion 2 batches

**Method.jsx renders a per-step strike (text label, prose intact) and one blue changed line via new domain/batch.js readers; BatchMargin.jsx's churn section gains come-up/draw-temperature/overrun/notes routed through a new readMeasured function that turns a blank into the word "unknown"; transfer.js's validateBatch extends the store file to schemaVersion 2, with a schemaVersion-1-still-imports compatibility decision.**

## Performance

- **Duration:** 62 min
- **Started:** 2026-09-06T15:35:00Z
- **Completed:** 2026-09-06T16:37:00Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Every method step can be struck (reads struck, prose intact, with a text label — never a line alone) and given one line in the maker's words; a step the maker did not touch says nothing at all, and no function in `domain/batch.js` has a "done as written" return value.
- The churn section holds every measured value and note the sheet's batch-log page asks of the churn event — come-up (min), draw temperature (°C, signed with the Unicode minus sign U+2212), overrun (%), draw notes, an optional ingredient-notes line, and a next-time note labelled as intention — each blank reading the word `unknown` in ink through the single `readMeasured` function, never a value read from the recipe.
- `readMeasured` and the churn measurement fields are never rounded: a value typed to a finer precision than the field's stated step survives unchanged, proven by a test asserting `6.25` stays `6.25`.
- Leaving the page with unsaved ink raises only the browser's own leave warning, registered while recording holds a dirty draft (tested by presence against every field, so a written `0` still counts) and removed otherwise.
- The store file grows to `schemaVersion` 2, carrying both `versions` and `batches`; a batch whose as-made map holds a written `0` validates, a string value is refused by path, three distinct faults in one batch collect as three errors, and a file with one good batch beside one malformed batch writes nothing at all — the repository double's `putAll` and `putAllBatches` are provably never called.
- A `schemaVersion` 1 file (a Phase 1 export) still imports as a store with no batches; a `schemaVersion` 1 file that nonetheless carries a non-empty `batches` array is refused as malformed rather than accepted as old.

## Task Commits

Each task followed RED → GREEN (TDD):

1. **Task 1: Method — strike or change, one line per step, in the maker's words**
   - `cd3b7c9` — test(02-02): add failing tests for per-step strike and changed-line readers (RED)
   - `ad7b348` — feat(02-02): method gains strike and one changed line per step (GREEN)
2. **Task 2: The churn section — measured values with a unit on every label, and unknown in words**
   - `106176d` — test(02-02): add tests for readMeasured and the churn round trip (test only — see Deviations; domain implementation landed in the prior commit)
   - `4143344` — feat(02-02): churn section carries every measured value, unknown in words (GREEN — the remaining UI/wiring work)
3. **Task 3: The store file carries batches — schemaVersion 2 and a validator that refuses the whole file**
   - `3042e31` — test(02-02): add failing tests for schemaVersion 2 and validateBatch (RED)
   - `8755a9c` — feat(02-02): the store file carries batches at schemaVersion 2 (GREEN)

_No REFACTOR commit was needed for any task — each GREEN implementation was minimal and left no follow-up cleanup._

**Plan metadata:** committed with this SUMMARY (see below).

## Files Created/Modified

- `app/src/domain/batch.js` — `stepChangeFor`, `isStruck`, `changedLineFor`, `readMeasured`; `createBatch` extended to accept `stepChanges` and the six churn measurement/note fields via the same explicit-presence discipline as `asMade`
- `app/src/domain/batch.test.js` — tests for the three step-change readers, `readMeasured`'s blank/zero/signed/unrounded contract, and the churn-field round trip
- `app/src/ui/Method.jsx` — per-step strike (text label + struck prose) and changed-line rendering in reading state; checkbox + ink field in recording state
- `app/src/ui/RecipePage.jsx` — `handleChangeStepChange` (delete-key-on-both-clear), `handleChangeChurnField`, the `beforeunload` effect and `isDraftDirty` helper, draft initialization for the six churn fields, save-handler conversion of raw strings to number-or-null/text-or-null
- `app/src/ui/BatchMargin.jsx` — the full churn section (come-up, draw temperature, overrun, draw notes, ingredient notes, next time) in both recording and reading states
- `app/src/store/repository.js` — `getAllBatches`, `putAllBatches`, mirroring `getAll`/`putAll`
- `app/src/store/transfer.js` — `validateBatch` and `validateTasting` (collect-all-errors, name-the-path); `validateStoreFile` accepts `schemaVersion` 1 or 2; `exportStore`/`importStore` carry batches
- `app/src/store/transfer.test.js` — batch/tasting fixtures, schemaVersion 2 acceptance and schemaVersion-1-compatibility tests, refuse-whole-file assertions using call-counting repository doubles
- `app/src/styles/app.css` — struck-step styling, the changed-line paragraph, the recording controls' layout, the churn section's measured-value row — all through existing tokens

## Decisions Made

- A `schemaVersion` 1 store file still imports, as a store with no batches; a `schemaVersion` 1 file that nonetheless carries a non-empty `batches` array is refused as malformed rather than accepted as old. Export always writes `schemaVersion` 2. Stated in a comment above `validateStoreFile`, per the plan's requirement to record this decision here.
- No new CSS custom property was needed. Every value the strike, changed line, recording controls, and churn section required already existed in `tokens.css` (`--pen-blue`, the `--gap-*`/`--size-*`/`--face-*` scales). The plan's contingent `--width-changed-line` token was not needed and was not added.

## Deviations from Plan

### Process note (not a Rule 1-4 fix)

**readMeasured and the six churn measurement/note fields on createBatch (Task 2's domain scope) were implemented in Task 1's GREEN commit.** Both extend the same `churnFields` object `createBatch` accepts (`stepChanges` for Task 1, `comeUpMinutes`/`drawTempC`/`overrunPercent`/`drawNotes`/`ingredientNotes`/`nextTimeNote` for Task 2), and both were written in one coherent edit to that function rather than two passes over the same code. Consequence: when Task 2's domain-level tests (`readMeasured`, the churn round trip) were added in commit `106176d`, they passed immediately rather than genuinely failing first — a real deviation from the RED→GREEN sequence, though not a bug, missing functionality, blocker, or architectural change (no Rule 1-4 applies). The tests remain permanent regression coverage for BATCH1-02's blank/zero/never-rounded contract; the actual behavior-adding work for Task 2 (the churn section's UI in `BatchMargin.jsx`, the `RecipePage.jsx` wiring, the `beforeunload` guard) was implemented and verified GREEN in the normal way in commit `4143344`.

None of the plan's other deviation rules (1-4) were triggered. Every acceptance criterion and grep-based gate in the plan passed as specified; no bug was found, no missing-critical-functionality gap was found, no blocking issue required a fix, and no architectural change was needed.

**Total deviations:** 0 Rule 1-4 auto-fixes. **Impact on plan:** none on correctness or scope; the process note above documents a TDD-sequencing artifact for transparency, not a functional gap.

## Issues Encountered

None.

## Deferred Human Verification

The following `<human-check>` steps from the plan were deferred to end-of-phase UAT at the user's explicit instruction (away from the computer during this session). All automated verification (`npm --prefix app run build`, `npm --prefix app test`, and every grep-based acceptance gate) was run for each task and passes.

**From Task 1 (Method strikes and changed lines):**
> Open the churned recipe and click `Record a batch`. Every one of the ten steps shows an empty strike control with a visible label and an empty line field; none is pre-filled and none says the step was done as written. Tick step 1's strike, type `blend 60 s` on step 8 and `Fast, Soft, Prechill 15 min. Speed Δ @ 20 min, really thick @ 24, full churn 30` on step 9, leave step 3 alone, and save. In the reading state: step 1's prose is struck and still legible with a text label beside it, steps 8 and 9 carry their blue lines, step 3 carries nothing, and no target chip has gained a second value. Tab through the whole method with the keyboard: every control has a visible label and a visible focus outline.

**From Task 2 (the churn section):**
> Open the churned recipe, click `Record a batch`, and read the churn section top to bottom: churn date, come-up (min), draw temperature (°C), overrun (%), draw notes, ingredient notes, next time. Every one is empty; none shows the recipe's own targets. Type 20, −6, leave overrun blank, write "Soft, not greasy", write "Oil bottle open date 24 Jul 2026", and save. The reading state shows `20`, `−6`, and the word `unknown` where overrun would be, with the notes in blue prose. Now click `Record a batch` again, type something, and try to close the tab: the browser's own leave warning appears — not a dialog the app drew. Cancel, then reload: the draft is gone, as this phase intends.

**From Task 3 (schemaVersion 2 export/import):**
> Record a batch, export the store to a file, and read the file: `schemaVersion` is 2 and it carries both `versions` and `batches`, with the batch's snapshot rows inside it. Hand-edit one batch's `drawTempC` to the word `cold` and import the file: the app names the error with its path and the store is unchanged — the good batch beside it was not written either. Import a file saved from a Phase 1 build: it is accepted, the recipe comes back, and no batch appears.

These should be run together at end-of-phase UAT, alongside 02-01's own deferred checks (already noted in `02-01-SUMMARY.md`).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02-03 (tastings and axes) attaches to the `tastings: []` array `createBatch` already shapes, the `validateTasting` function this plan wrote (used but not yet exercised by any UI), and the snapshot's `declaredAxes`.
- The store's `schemaVersion` 2 shape and `validateBatch`/`validateTasting` are ready to carry whatever 02-03 adds to a tasting record, without a further schema-version bump (tastings already live inside the batch record).
- The deferred human-check items above should be run together at end-of-phase UAT, alongside 02-01's and 02-03's own deferred checks, per `workflow.human_verify_mode: end-of-phase`.
- No blockers.

---
*Phase: 02-record-the-first-batch*
*Completed: 2026-09-06*

## Self-Check: PASSED

- All 9 modified source files plus this SUMMARY verified present on disk (`[ -f ]`).
- All 6 task commits (`cd3b7c9`, `ad7b348`, `106176d`, `4143344`, `3042e31`, `8755a9c`) verified present in `git log --oneline --all`.
- Re-ran every acceptance criterion and the plan-level `<verification>` block: `npm --prefix app run build` (exit 0), `npm --prefix app test` (121/121, up from the 02-01 baseline of 100), the changedLineFor-reader/readMeasured-reader/validateBatch-defined gates, the no-second-value-beside-target-chip check, the no-toFixed/Math.round/toLocale/Intl gate on `batch.js`, the colour/px literal gates on `Method.jsx` and `BatchMargin.jsx`, the single-idb-importer gate, the no-network-API gate, and the no-truthy-fallback (`isFiniteNumber(x) || !x`) check all pass.
- Confirmed no batch-scoped code reads `version.targets`, `version.process`, or `version.iceEd` (grep across `BatchMargin.jsx`, `Method.jsx`, `RecipePage.jsx`, `IngredientTable.jsx`).
- Confirmed the Unicode minus sign (U+2212) is the actual codepoint used in both `domain/batch.js`'s `readMeasured` and its test assertions, not an ASCII hyphen.
- No stub patterns (`TODO`, `FIXME`, placeholder text, hardcoded empty values feeding UI) found in any file this plan touched.
