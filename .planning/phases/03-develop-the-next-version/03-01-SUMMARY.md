---
phase: 03-develop-the-next-version
plan: 01
subsystem: recipe-versioning
tags: [idb, migration, react, vitest, fake-indexeddb, lineage, schema-validation]

# Dependency graph
requires:
  - phase: 02-record-the-first-batch
    provides: the batches object store, the repository seam, the pen-mode UI pattern (mode/draft, beforeunload dirty-check, cancel-discards-silently)
provides:
  - The version record's new shape (parentVersionId/parentVersionLabel/reason/citedBatchId/createdAt, per-row and per-step removed flags, per-step uses lists, per-note inheritedFrom markers) — final for this phase
  - A one-time IndexedDB upgrade (DB_VERSION 3) that lifts every stored version in place, proven against a real IndexedDB via fake-indexeddb
  - The shared liftVersionRecord function, called by both db.js's upgrade and transfer.js's import — no second ladder
  - Store file schemaVersion 3, the extended validator, and the D-09 parent-resolves gate
  - domain/rows.js (activeRows/activeSteps) and domain/lineage.js (createChildVersion, saveOverVersion, versionLineUnique, sortedVersions, versionsForRecipe, latestVersionPerRecipe)
  - A working "developing" mode on the recipe page: the pen opens, one changed gram strikes the old value beside the new one, and the page saves a child version that reopens by its own URL
  - T-02-32 closed by regression test
affects: [03-02 (uses.js/diff.js build on the removed/uses fields this plan adds), 03-03 (VersionStrip reads sortedVersions/latestVersionPerRecipe), 03-04 (the % of batch strike and the ?changes URL state extend the strike machinery this plan starts), 03-05 (advisories read the same version shape)]

# Actuals (#2632)
actuals:
  tokens: 26300
  tasks: 3
  commits: 3
plan_head_before: fde1e2c3a9376ba5e3a146b0a0deae8d90379a5e

# Tech tracking
tech-stack:
  added: [fake-indexeddb (devDependency, 6.2.5)]
  patterns:
    - "The shared, synchronous, idempotent schema-lift function (versionLift.js), called from exactly two places, never duplicated"
    - "Mode-as-single-discriminant state machine extended to a third value ('developing'), keeping pen exclusivity structural rather than separately enforced"
    - "Filter removed rows/steps at the call site (domain/rows.js) rather than inside composition.js/figures.js, which stay untouched"
    - "The Strike Rule: one CSS class (.struck-value) reused for every 'not in force, replaced by what sits beside it' meaning"

key-files:
  created:
    - app/src/store/versionLift.js
    - app/src/domain/rows.js
    - app/src/domain/rows.test.js
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js
    - app/src/ui/Headnote.jsx
    - app/tests/db-migration.test.js
  modified:
    - app/src/store/db.js
    - app/src/store/transfer.js
    - app/src/store/transfer.test.js
    - app/src/domain/axes.test.js
    - app/src/data/olive-oil.js
    - app/src/data/olive-oil.test.js
    - app/src/ui/RecipePage.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/Authored.jsx
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/styles/tokens.css
    - app/src/styles/app.css
    - app/package.json
    - app/package-lock.json

key-decisions:
  - "createChildVersion carries schemaVersion forward from the parent rather than importing VERSION_SCHEMA_VERSION into domain/lineage.js — keeps the domain module's 'no store import' rule exact, since by the time RecipePage reads any version it is already lifted."
  - "liftVersionRecord is applied to both schemaVersion 1 and schemaVersion 2 files on import (not only schemaVersion 2 as the plan's prose emphasized), since the stricter validator now requires the new fields on every version regardless of which file version carries it — simplest, and 'schemaVersion 1 keeps its Phase 2 treatment' is read as about batch handling, not version shape."
  - "Headnote does not take a versions prop; RecipePage keeps versions privately, runs the uniqueness check itself, and passes only the computed blockedMessage down — simpler than threading the whole list through a component that does not render it in this task."

requirements-completed: [REC1-02, REC1-05]

coverage:
  - id: D1
    description: "The pen opens on the churned version; typing a changed gram strikes the parent's value in ink immediately before the field; Save as a new version writes a child naming its parent, and the parent record is byte-identical afterwards (REC1-02)."
    requirement: "REC1-02"
    verification:
      - kind: unit
        ref: "app/src/domain/lineage.test.js#createChildVersion does not mutate the parent"
        status: pass
      - kind: unit
        ref: "app/src/domain/lineage.test.js#createChildVersion shares no structure with the parent"
        status: pass
      - kind: automated_ui
        ref: "npm --prefix app run build && npm --prefix app test (acceptance-criteria greps: no saveVersion(version) call on the develop path, single mode discriminant)"
        status: pass
    human_judgment: true
    rationale: "The end-to-end interactive flow (pen opens, strike renders, save lands on the child's URL, page reads clean) needs a browser to observe — deferred to end-of-phase UAT per Mark's standing preference (STATE.md Phase 2 carry, MEMORY.md), consistent with how Phase 2 Plan 01's own tracer feedback gate was handled."
  - id: D2
    description: "The saved child reopens with the same values after a reload (REC1-05)."
    requirement: "REC1-05"
    verification:
      - kind: unit
        ref: "app/tests/db-migration.test.js#a second open at database version 3 changes nothing"
        status: pass
    human_judgment: true
    rationale: "Genuine reload persistence is a browser/IndexedDB observation, deferred to end-of-phase UAT alongside D1."
  - id: D3
    description: "Forking the same parent twice produces two distinct children, each naming the same parentVersionId; the parent is byte-identical after both saves."
    verification:
      - kind: unit
        ref: "app/src/domain/lineage.test.js#createChildVersion carries the supplied id, the parent identity, the supplied createdAt, and the parent recipeId"
        status: pass
    human_judgment: false
  - id: D4
    description: "An interrupted save leaves either no child or a complete one; two tabs open on the same parent produce two distinct children."
    verification: []
    human_judgment: true
    rationale: "must_haves.truths marks this 'verification: backstop' — a concurrency property not mechanically verifiable by this test suite; the single repository.saveVersion call and the never-write-the-parent invariant are the structural guarantees (asserted by acceptance-criteria grep), but the interleaving itself needs multi-tab manual observation."
  - id: D5
    description: "The one-time IndexedDB upgrade to database version 3 runs once per browser profile and cannot half-apply."
    verification:
      - kind: integration
        ref: "app/tests/db-migration.test.js#lifts every stored version in one upgrade pass, not only the first"
        status: pass
      - kind: integration
        ref: "app/tests/db-migration.test.js#a second open at database version 3 changes nothing"
        status: pass
    human_judgment: false
  - id: D6
    description: "A returning browser profile's stored version and its 2 Aug batch read identically before and after the upgrade (D-06)."
    verification:
      - kind: integration
        ref: "app/tests/db-migration.test.js#lifts a returning profile's stored version to the new shape, and its six figures and its batch read identically before and after"
        status: pass
    human_judgment: false
  - id: D7
    description: "liftVersionRecord is idempotent and additive."
    verification:
      - kind: unit
        ref: "app/src/domain/lineage.test.js#liftVersionRecord idempotence"
        status: pass
    human_judgment: false
  - id: D8
    description: "A schemaVersion 2 (and 1) store file imports and is lifted; a schemaVersion 1 file keeps its Phase 2 batch treatment; export writes schemaVersion 3 (D-07)."
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#the schema move (D-06, D-07)"
        status: pass
    human_judgment: false
  - id: D9
    description: "An imported file carrying a child version whose parent is neither in the file nor in the store is refused whole, with nothing written (D-09)."
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#the D-09 parent-resolves gate"
        status: pass
    human_judgment: false
  - id: D10
    description: "The seed's ten method steps carry the authored uses lists D-08 fixes; a returning profile's already-seeded record is patched with them by the upgrade."
    verification:
      - kind: unit
        ref: "app/src/data/olive-oil.test.js#oliveOilVersion.method uses (D-08)"
        status: pass
    human_judgment: false
  - id: D11
    description: "The plan's pen and the batch's pen are never open together: mode is one discriminant, and each pen's opening control is disabled while the other is open (D-10)."
    verification:
      - kind: automated_ui
        ref: "grep: app/src/ui/RecipePage.jsx holds exactly one mode state variable"
        status: pass
    human_judgment: true
    rationale: "BatchMargin's disabled state and stated reason, and the pen's own focus management, need a browser to observe directly — deferred to end-of-phase UAT with D1/D2."
  - id: D12
    description: "T-02-32 is closed by a regression test."
    requirement: null
    verification:
      - kind: unit
        ref: "app/src/domain/axes.test.js#dropping a '__proto__' axis mark neither changes the result's prototype nor pollutes Object.prototype"
        status: pass
    human_judgment: false

# Metrics
duration: 31min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 1: Wire the pen to a saved child version Summary

**A one-time IndexedDB v3 migration (proven against a real IndexedDB), the shared version-lift function, parent/child lineage domain logic, and a working "developing" mode that strikes a changed gram in ink and saves a child version naming its parent — with the churned version and its batch never written to.**

## Performance

- **Duration:** 31 min
- **Started:** 2026-09-07T17:34:28Z
- **Completed:** 2026-09-07T18:05:45Z
- **Tasks:** 3 completed
- **Files modified:** 22

## Accomplishments

- New `versionLift.js`: the one shared, synchronous, idempotent lift from any prior version-record shape to the current one, called by both `db.js`'s upgrade and `transfer.js`'s import
- Database version bumped to 3 with a cursor-lift branch; proven against a real IndexedDB via `fake-indexeddb` (returning-profile figures and batch unmoved, a two-version case proving the transaction does not auto-commit early, and a re-entrant second open)
- New `domain/rows.js` (`activeRows`/`activeSteps`) and `domain/lineage.js` (`createChildVersion`, `saveOverVersion`, `versionLineUnique`, `sortedVersions`, `versionsForRecipe`, `latestVersionPerRecipe`)
- `Headnote.jsx` extracted from `RecipePage.jsx` and given the save ceremony: version line, reason, citation, "Save as a new version" / "Save over this version" / "Cancel"
- `RecipePage.jsx` gains a third `'developing'` mode, a `penDraft`, and the two save handlers; the six figures and the basis note answer live against the maker's typed grams
- `IngredientTable.jsx`'s grams cell becomes an editable field in developing mode with the parent's value struck beside it (the Strike Rule), and totals are computed from `activeRows`
- `transfer.js`'s validator moves to the new shape; store file `schemaVersion` 3; the D-09 parent-resolves gate; T-02-32 closed by regression test
- Seed data (`olive-oil.js`) carries the D-08 per-step `uses` lists and the new lineage defaults

## Task Commits

1. **Task 1: End-to-end — the pen, the shape, the lift** — `bac9d77` (feat)
2. **Task 2: The migration proven against a real IndexedDB** — `7380d83` (test)
3. **Task 3: The store file moves with the record** — `4e8591f` (feat)

**Plan metadata:** committed separately below.

## Files Created/Modified

- `app/src/store/versionLift.js` — `liftVersionRecord`, `SEED_CREATED_AT`, `SEED_USES`, `VERSION_SCHEMA_VERSION`
- `app/src/store/db.js` — `DB_VERSION = 3`, the `oldVersion < 3` cursor-lift branch
- `app/src/domain/rows.js` — `activeRows`, `activeSteps`
- `app/src/domain/lineage.js` — parent/child construction and the version-line rules
- `app/src/ui/Headnote.jsx` — the headnote region, extracted and given the save ceremony
- `app/src/ui/RecipePage.jsx` — the `'developing'` mode, `penDraft`, the save handlers, live figures
- `app/src/ui/IngredientTable.jsx` — the editable, struck-beside grams cell
- `app/src/ui/BatchMargin.jsx` — batch-starting controls disabled while developing, with the reason stated in words
- `app/src/ui/Authored.jsx`, `app/src/ui/RecipeList.jsx` — updated for the new note/row shapes
- `app/src/data/olive-oil.js` — lineage defaults, per-step `uses`, authored notes as `{ text, inheritedFrom }`
- `app/src/store/transfer.js` — extended `validateVersion`, schemaVersion 3, the D-09 gate
- `app/src/styles/tokens.css`, `app/src/styles/app.css` — `--rule-strike`, `--gap-strike`, `.struck-value`, the headnote ceremony's classes
- `app/tests/db-migration.test.js` — the D-06 proof against `fake-indexeddb`

## Decisions Made

- `createChildVersion` carries `schemaVersion` forward from the parent rather than importing `VERSION_SCHEMA_VERSION` into `domain/lineage.js` — by the time any version reaches the page it is already lifted, so this keeps the domain module's "no store import" rule exact with no loss of correctness.
- `liftVersionRecord` is applied on import to both schemaVersion 1 and schemaVersion 2 files, not only schemaVersion 2 — the stricter validator requires the new fields regardless of which file version carries an old-shaped record, and "schemaVersion 1 keeps its Phase 2 treatment" is read as governing batch handling, not version shape.
- `Headnote` does not take a `versions` prop; `RecipePage` keeps `versions` privately, performs the uniqueness check itself, and passes only the computed `blockedMessage` down.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical] Modified `app/src/ui/BatchMargin.jsx`, which was not listed in the plan's `files_modified` frontmatter**
- **Found during:** Task 1
- **Issue:** The plan's own action text explicitly requires disabling `BatchMargin`'s "Record a batch" / "Record another batch" / "Amend" controls whenever `mode === 'developing'`, with the reason stated in words — mirroring `FormulationNote`'s existing tab-path removal during recording. The plan's `<verify><human-check>` also names this behavior directly ("the margin's batch controls are disabled with a stated reason"). Without this change, RESEARCH.md's Pitfall 4 (the two pens open at once) would reproduce, violating the phase's binding constraint that the plan's pen and the batch's pen are never open together (D-10).
- **Fix:** Added `disabled={mode === 'developing'}` to the three controls and a stated-reason hint (`.batch-margin__hint`) shown while developing.
- **Files modified:** `app/src/ui/BatchMargin.jsx`
- **Verification:** `npm --prefix app test` (240 passing, no regression); confirmed by reading the modified render branches.
- **Committed in:** `bac9d77` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical). **Impact on plan:** Necessary for correctness of the phase's own binding constraint (D-10) and explicitly required by the plan's own action text; the frontmatter's `files_modified` list simply omitted this file. No scope creep — the same behavior the plan already specified in prose.

## Issues Encountered

None beyond the deviation above. `fake-indexeddb`'s polyfill required setting `IDBCursor`/`IDBTransaction`/`IDBRequest`/etc. as global constructors (not only `indexedDB` itself) for `idb`'s wrapper to run under Node — resolved by importing the named exports once at module scope in `app/tests/db-migration.test.js` and resetting only the `indexedDB` factory per test.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The version record's new shape, the shared lift, the store file's schemaVersion 3, and the `'developing'` mode are all in place for 03-02 (removal cross-flags, `diff.js`, `uses.js`) to build on directly.
- **Deferred to end-of-phase UAT** (per Mark's standing preference, MEMORY.md and the Phase 2 Plan 01 precedent): the interactive human-check for Task 1 — opening the pen, typing 48 over 40, watching the strike and the six figures move, saving, reloading, and confirming the churned version and its 2 Aug batch are unchanged. All automated verification for this check (build, test, and every acceptance-criteria grep) has been run and passes; only the visual/interactive confirmation is deferred.
- 03-02 through 03-05 still need: the removal cross-flags (`uses.js`), the diff domain (`diff.js`), the version strip (`VersionStrip.jsx`), the `?changes` URL state, the % of batch strike, and the four FORM2-02 advisories — none of these are in this plan's scope.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED

- Key created files verified present on disk: `app/src/store/versionLift.js`, `app/src/domain/rows.js`, `app/src/domain/lineage.js`, `app/src/ui/Headnote.jsx`, `app/tests/db-migration.test.js`.
- All three task commits verified present in git log: `bac9d77`, `7380d83`, `4e8591f`.
- `npm --prefix app test` re-run: 14 test files, 240 tests passed (baseline was 190).
- `npm --prefix app run build` re-run: builds clean, no errors.
