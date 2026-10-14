---
phase: 03-develop-the-next-version
plan: 03
subsystem: recipe-versioning
tags: [react, react-router, lineage, save-ceremony, version-strip, recipe-list]

# Dependency graph
requires:
  - phase: 03-02
    provides: the version record's new shape, draftVersion, buildDiff and the two removal cross-flags, and a working 'developing' mode with every row/step/note editable
provides:
  - domain/lineage.js gains blockedSaveMessage (the one fixed-order block message: blank/whitespace version line, duplicate line, then the first active row with an empty grams field) and citableBatches (the citation list's order)
  - Headnote.jsx's reading-mode headnote carries the lineage line ("from <parent link>, after the batch of <date link>") and the reason as a headnote paragraph, or "no reason recorded"
  - RecipePage.jsx's two save handlers are wired through blockedSaveMessage, scoped to the recipe, with a re-check that Save over this version never writes to a churned version
  - VersionStrip.jsx — every version of the recipe, in creation order, one link away, the current one by weight and outline, a churned one wearing the word "churned"
  - RecipeList.jsx groups to one row per recipe at its most recently created version (RecipeRows, a presentational sub-component)
  - The running head "Sprinkles" as the link home in every state, and a real "No recipe found" that links back to the list
affects: [03-04 (the show-changes toggle joins the lineage line this plan builds), 03-05 (the four advisories render in the same margin region, after BatchMargin and before Authored)]

# Actuals (#2632)
actuals:
  tokens: 12718
  tasks: 3
  commits: 3
plan_head_before: f08359c9f155c60c685ca3af7ed1d4b84b4aa9c0

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "citableBatches/blockedSaveMessage centralize the ceremony's ordering and blocking rules in the domain, so the same sentence and the same batch order can never drift between the two save controls or between Save as new and Save over"
    - "A presentational list-of-links component (VersionStrip, and RecipeList's extracted RecipeRows) takes its array as a plain prop and is tested directly, independent of whichever effect loads that array — RecipeRows mirrors VersionStrip's own shape"

key-files:
  created:
    - app/src/ui/Headnote.test.jsx
    - app/src/ui/VersionStrip.jsx
    - app/src/ui/VersionStrip.test.jsx
    - app/src/ui/RecipeList.test.jsx
  modified:
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js
    - app/src/ui/Headnote.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/styles/tokens.css
    - app/src/styles/app.css

key-decisions:
  - "blockedSaveMessage(penFields, version, versions) takes versions already scoped by the caller (recipe-filtered, and self-excluded for a save-over) rather than taking an excludeId of its own — RecipePage computes the correct scope once per call, so the domain function's uniqueness check never special-cases which save path called it."
  - "RecipeList.jsx's row rendering is split into an exported RecipeRows presentational component (mirroring VersionStrip.jsx's shape) so it is testable without driving RecipeList's own repository fetch effect; RecipeList.test.jsx stubs the repository module via vi.mock, since merely importing RecipeList.jsx otherwise opens a real IndexedDB at module load (repository.js's singleton is created eagerly)."
  - "The cited batch's churn date is read via one repository.getBatch(citedBatchId) call in a cancelled-flag effect keyed on the version, since citedBatchId is an id only — the batch itself lives on the parent and is never copied onto the child."
  - "A reason of nothing but whitespace is trimmed to null at save time (RecipePage.jsx's buildPenFields), the same treatment an empty reason already got — the maker's non-blank content is never trimmed, only the blank/non-blank decision is whitespace-aware."

requirements-completed: [REC1-02, REC1-04, FORM1-03]

coverage:
  - id: D1
    description: "The maker records why the version changed as free text in the headnote, citing the parent's batch by churn date chosen with one tap from a list with none chosen by default; the parent's batches list reads 'no batch to cite' when empty (REC1-04)."
    requirement: "REC1-04"
    verification:
      - kind: unit
        ref: "app/src/domain/lineage.test.js#citableBatches (2 tests)"
        status: pass
      - kind: automated_ui
        ref: "app/src/ui/Headnote.test.jsx#Headnote — the ceremony renders nothing pre-filled (2 tests)"
        status: pass
    human_judgment: true
    rationale: "The interactive flow — typing a reason, tapping a citation, saving, and reading the child's lineage line back — needs a browser to observe. Deferred to end-of-phase UAT per Mark's standing preference (STATE.md carry, MEMORY.md), consistent with 03-01/03-02's own tracer feedback gates."
  - id: D2
    description: "A blank version line and a duplicate version line each block the save in words beside the control, and an active row with an empty grams field blocks it with '<ingredient> needs an amount, or remove the row'; nothing is written while a block stands; version-line uniqueness compares trimmed strings with ===, with no Unicode normalisation or case-folding (D-04)."
    requirement: "REC1-04"
    verification:
      - kind: unit
        ref: "app/src/domain/lineage.test.js#blockedSaveMessage (8 tests)"
        status: pass
      - kind: unit
        ref: "app/src/domain/lineage.test.js#versionLineUnique (6 tests, including the accented-character and emoji cases)"
        status: pass
      - kind: automated_ui
        ref: "app/src/ui/Headnote.test.jsx#Headnote — a blocked save is stated in words beside the controls (2 tests)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Save over this version is offered only on a version with no batch recorded against it, and Save as a new version is offered on every version; a churned version's record is never written to (D-01, D04)."
    verification:
      - kind: automated_ui
        ref: "app/src/ui/Headnote.test.jsx#Headnote — the two save controls, gated by whether the version has a batch (2 tests)"
        status: pass
      - kind: other
        ref: "app/src/ui/RecipePage.jsx#handleSaveOverVersion (source re-check: `if (batches.length > 0) return;` before buildPenFields/saveOverVersion)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A version outside any target band saves with no extra step, no confirmation and no acknowledgement: the save path contains no reference to a band, a deviation or an advisory (FORM1-03)."
    requirement: "FORM1-03"
    verification:
      - kind: other
        ref: "grep: no band|deviation|advisor outside comments in app/src/domain/lineage.js and app/src/ui/Headnote.jsx"
        status: pass
      - kind: automated_ui
        ref: "app/src/ui/Headnote.test.jsx#Headnote — a figure outside its band changes nothing about the ceremony"
        status: pass
    human_judgment: false
  - id: D5
    description: "A saved child's headnote carries a lineage line naming its parent and its cited batch as links, followed by the reason as a headnote paragraph or 'no reason recorded'; a version with no parent carries no lineage line (REC1-02)."
    requirement: "REC1-02"
    verification:
      - kind: automated_ui
        ref: "app/src/ui/Headnote.test.jsx#Headnote — the saved child reads its lineage (4 tests)"
        status: pass
    human_judgment: true
    rationale: "The end-to-end flow — saving a child version in a real browser and reading its lineage line's live links — needs a browser to observe. Deferred to end-of-phase UAT."
  - id: D6
    description: "A version strip beneath the headnote lists every version of the recipe in creation order by its version line, each a link, the current one carried by weight and outline, and a churned version wearing the word 'churned' in small print with no count."
    verification:
      - kind: unit
        ref: "app/src/ui/VersionStrip.test.jsx (5 tests)"
        status: pass
    human_judgment: true
    rationale: "The interactive flow — forking a version twice and reading the strip's three entries in a real browser — needs a browser to observe. Deferred to end-of-phase UAT."
  - id: D7
    description: "The recipe list shows each recipe once, at its most recently created version, and every superseded version stays reachable through the strip on the recipe page."
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeList.test.jsx (5 tests)"
        status: pass
    human_judgment: false
  - id: D8
    description: "The running head Sprinkles is a link home in ink on the recipe page in every state, and No recipe found is no longer a dead end — it links back to the list."
    verification:
      - kind: other
        ref: "grep: exactly one 'to=\"/\"' and one occurrence of 'No recipe found' in app/src/ui/RecipePage.jsx"
        status: pass
    human_judgment: true
    rationale: "The interactive navigation — clicking the running head home, visiting a mistyped version id, tabbing through the not-found state — needs a browser to observe. Deferred to end-of-phase UAT."

# Metrics
duration: 40min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 3: The ceremony, the strip, and the way home Summary

**The save ceremony's blocked-save rules and citation order moved into the domain (blockedSaveMessage, citableBatches), the saved child's lineage line and a new version strip in Headnote/VersionStrip, and the recipe list grouped to one row per recipe with a running head that finally links home.**

## Performance

- **Duration:** 40 min
- **Started:** 2026-09-07T18:45:00Z
- **Completed:** 2026-09-07T19:25:00Z
- **Tasks:** 3 completed
- **Files modified:** 11 (4 created, 7 modified)

## Accomplishments

- `domain/lineage.js` gains `blockedSaveMessage` (the one fixed-order block message — blank/whitespace version line, duplicate line, then the first active row with an empty grams field) and `citableBatches` (a thin wrapper over `sortedBatches` for the citation list); neither looks at a band, a deviation or an advisory
- `Headnote.jsx`'s reading-mode headnote now carries the lineage line ("from `<parent link>`, after the batch of `<date link>`") and the reason as a headnote paragraph, or "no reason recorded" when blank — rendered only when the version has a parent
- `RecipePage.jsx` wires `blockedSaveMessage` into both save handlers, scopes the uniqueness check to the recipe, trims a whitespace-only reason to null, loads the cited batch for the lineage line, and re-checks the batch list is empty before `Save over this version` writes
- New `VersionStrip.jsx`: every version of the recipe in creation order, one link away, the current one by weight and outline, a churned one wearing the word "churned" with no count; renders nothing for a single version
- `RecipeList.jsx` groups to one row per recipe at its most recently created version via `latestVersionPerRecipe`, with the row rendering split into an exported `RecipeRows` presentational component
- `RecipePage.jsx` renders a running head ("Sprinkles", linking to `/`) in every state — reading, developing, and the not-found state — and replaces the dead-end "No recipe found for this version." with the running head plus a link back to the list

## Task Commits

1. **Task 1: The ceremony in the headnote — the version line, the reason, the citation, and the two saves** - `5eb5647` (feat)
2. **Task 2: The strip — every version of the recipe, in creation order, one link away** - `5d88dc5` (feat)
3. **Task 3: The way in and the way home — one row per recipe, the running head, and a No recipe found that goes somewhere** - `88b41f1` (feat)

**Plan metadata:** committed separately below.

## Files Created/Modified

- `app/src/domain/lineage.js` — `blockedSaveMessage`, `citableBatches`
- `app/src/domain/lineage.test.js` — 20 new tests across both functions plus `versionLineUnique`'s accented/emoji cases and `createChildVersion`'s round-trip case
- `app/src/ui/Headnote.jsx` — citation reads `citableBatches`; reading-mode lineage line and reason paragraph; `citedBatch` prop
- `app/src/ui/Headnote.test.jsx` — 11 tests covering the ceremony, the blocked-save messages, the lineage line, and the band-independence of the controls
- `app/src/ui/RecipePage.jsx` — `blockedSaveMessage`/`versionsForRecipe` wiring, the cited-batch effect, the save-over re-check, the running head, the real not-found state, `VersionStrip` and `versionIdsWithBatches`
- `app/src/ui/VersionStrip.jsx` — `VersionStrip`
- `app/src/ui/VersionStrip.test.jsx` — 5 tests
- `app/src/ui/RecipeList.jsx` — `RecipeRows` (extracted, exported)
- `app/src/ui/RecipeList.test.jsx` — 5 tests
- `app/src/styles/tokens.css` — `--size-strip-line`, `--gap-strip`
- `app/src/styles/app.css` — the lineage line, the reason field's text face, the strip, the running head, and the not-found state

## Decisions Made

- `blockedSaveMessage(penFields, version, versions)` takes `versions` already scoped by the caller (recipe-filtered, self-excluded for a save-over) rather than an `excludeId` of its own.
- `RecipeList.jsx`'s row rendering is split into an exported `RecipeRows` presentational component (mirroring `VersionStrip.jsx`'s shape), tested with the repository module stubbed via `vi.mock` since importing `RecipeList.jsx` otherwise opens a real IndexedDB at module load.
- The cited batch's churn date is read via one `repository.getBatch(citedBatchId)` call in a cancelled-flag effect keyed on the version.
- A reason of nothing but whitespace is trimmed to `null` at save time, the same treatment an empty reason already got.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical] `handleSaveOverVersion` did not re-check the batch list before writing**
- **Found during:** Task 1
- **Issue:** The plan's own action text requires the save-over handler to "re-check that before writing — the control's absence is the design, the re-check is the guarantee, because a churned version's record is never written to (D04)." The prior code (from 03-01) called `buildPenFields`/`saveOverVersion` unconditionally, with no guard against a version that had since gained a batch.
- **Fix:** Added `if (batches.length > 0) return;` at the top of `handleSaveOverVersion`.
- **Files modified:** `app/src/ui/RecipePage.jsx`
- **Verification:** `npm --prefix app test` passes; matches the acceptance criterion's "source assertion on the handler."
- **Committed in:** `5eb5647` (Task 1 commit)

**2. [Rule 1 - Bug] The lineage line's links had no colour override**
- **Found during:** Task 3 (caught while adding the running head's own link styling)
- **Issue:** `.headnote__lineage`'s two `<Link>`s (added in Task 1) had no CSS rule setting their colour, so they would render in the browser's default link blue rather than ink — violating the Two-Ink Rule (ink and pen blue only) and the brief's "the strip and the lineage links are focusable in ink" requirement.
- **Fix:** Added `.headnote__lineage a { color: inherit; }`.
- **Files modified:** `app/src/styles/app.css`
- **Verification:** Visual inspection of the rule; the colour-literal grep gate on `Headnote.jsx` was unaffected (the fix lives in CSS, not a literal in the component).
- **Committed in:** `88b41f1` (Task 3 commit)

**3. [Rule 1 - Bug] `versionLineUnique` was checked against every stored version, not just the recipe's own**
- **Found during:** Task 1
- **Issue:** 03-01's original `buildPenFields` called `versionLineUnique(versions, ...)` with the full, unscoped `versions` state (every version of every recipe), even though `versionLineUnique`'s own doc comment states "The caller scopes `versions` to one recipe; this function does not filter by recipeId itself." With only one recipe seeded this was invisible, but it would have produced false collisions across recipes once a second recipe existed.
- **Fix:** `buildPenFields` now scopes with `versionsForRecipe(versions, version.recipeId)` before filtering out the excluded id and calling `blockedSaveMessage`.
- **Files modified:** `app/src/ui/RecipePage.jsx`
- **Verification:** `npm --prefix app test` passes; no regression in existing behaviour (still one recipe in the seed data).
- **Committed in:** `5eb5647` (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (1 missing critical, 2 bugs). **Impact on plan:** All three were required for correctness against the plan's own stated rules (D04, the Two-Ink Rule, and `versionLineUnique`'s own scoping contract). No scope creep.

## Issues Encountered

None beyond the deviations above. `renderToStaticMarkup` never runs `useEffect`, so testing `RecipeList.jsx`'s data-loaded state directly was not possible without either extracting a presentational component or refactoring the fetch; the `RecipeRows` extraction (see Decisions Made) resolved this without changing `RecipeList`'s public shape or its use in `router.jsx`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The ceremony, the lineage line, the strip, and the recipe list are complete and proven at the domain and component level; `03-04` (the `?changes` show-changes state) extends the same lineage line with its toggle, and `03-05`'s four advisories render in the same margin region this plan left untouched (`advisory-slot`).
- **Deferred to end-of-phase UAT** (per Mark's standing preference, MEMORY.md and the 03-01/03-02 precedent): every `<human-check>` in this plan's three tasks — the full ceremony flow (blank-line/duplicate-line/empty-grams blocks, citing a batch, saving, reading the lineage line), the strip's three-entry listing after forking twice, and the running head/not-found navigation. All automated verification (build, test, and every acceptance-criteria grep) has been run and passes; only the visual/interactive confirmation is deferred.
- `03-04` and `03-05` still need: the `?changes` URL state and its tracked-changes rendering on a saved version, and the four FORM2-02 advisories — neither is in this plan's scope.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED

- Key created/modified files verified present on disk: `app/src/domain/lineage.js`, `app/src/domain/lineage.test.js`, `app/src/ui/Headnote.jsx`, `app/src/ui/Headnote.test.jsx`, `app/src/ui/VersionStrip.jsx`, `app/src/ui/VersionStrip.test.jsx`, `app/src/ui/RecipeList.jsx`, `app/src/ui/RecipeList.test.jsx`, `app/src/ui/RecipePage.jsx`, `app/src/styles/tokens.css`, `app/src/styles/app.css`.
- All three task commits verified present in git log: `5eb5647`, `5d88dc5`, `88b41f1`.
- `npm --prefix app test` re-run: 19 test files, 315 tests passed (baseline at the end of 03-02 was 281).
- `npm --prefix app run build` re-run: builds clean, no errors.
- All plan-level `<verify>` automated greps re-run and passed (see the three task sections above).
