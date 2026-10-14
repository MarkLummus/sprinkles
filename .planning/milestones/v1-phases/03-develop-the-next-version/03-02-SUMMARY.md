---
phase: 03-develop-the-next-version
plan: 02
subsystem: recipe-versioning
tags: [react, diff, cross-flags, tracked-changes, vitest]

# Dependency graph
requires:
  - phase: 03-01
    provides: the version record's new shape (removed flags, uses lists, inheritedFrom markers), the shared liftVersionRecord, DB_VERSION 3, and a working 'developing' mode with one proven grams field
provides:
  - domain/diff.js (buildDiff) — the one comparison of two versions, at display precision, never re-deriving figure math
  - domain/uses.js (stepsUsingRow, removedRowsUsedBy, orphanedRows, stepsWithStaleAmounts) — the two removal cross-flags and the stale-amount flag, all derived from each step's uses list, never from parsing prose
  - Every row's amount, step allocation and presence editable in the pen, with the orphaned-row flag
  - Every step's words, targets, uses list and presence editable in the pen, with the removed-row cross-flag and the stale-amount flag
  - Authored notes editable and removable per note, with the inherited-from marker cleared on edit
  - The headnote prose editable with the baseline struck beneath
affects: [03-03 (VersionStrip and the lineage line reuse buildDiff's shape), 03-04 (the ?changes state lays this plan's own tracked-changes grammar back on the page against the parent — draftVersion/buildDiff generalize directly), 03-05 (the four advisories read the same rows/method shape this plan edits)]

# Actuals (#2632)
actuals:
  tokens: 21722
  tasks: 3
  commits: 3
plan_head_before: 7ca461c166b2b4d0d6909be191c428657aefb3e3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "The draft version, built once per render in RecipePage (draftVersion) from the version the pen opened on with the draft's values applied — the single object the pen's own tables, the two cross-flag readers, and buildDiff all read, rather than three separate reassemblies"
    - "Removal is always a flag flip, never a cascade: handleTogglePenRowRemoved and handleTogglePenStepRemoved each touch exactly one boolean, and the two cross-flags (orphanedRows, removedRowsUsedBy) are recomputed live every render, so restoring clears a flag without any code ever having stored one"
    - "A forced-strike rendering for a removed row or step: GramsCell/StepCell (rows) and the struck-beneath block (steps) strike even when the underlying value is textually unchanged once removed=true, so the field stays present and editable (per the acceptance criteria's universal per-row/per-step field requirement) while still reading as struck in place"
    - "uses.js's stepsWithStaleAmounts reads buildDiff's row and step descriptors rather than recomputing a delta of its own, so the flag can never disagree with what a reader sees elsewhere on the page"

key-files:
  created:
    - app/src/domain/diff.js
    - app/src/domain/diff.test.js
    - app/src/domain/uses.js
    - app/src/domain/uses.test.js
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/ui/Authored.jsx
    - app/src/ui/Headnote.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/styles/tokens.css
    - app/src/styles/app.css

key-decisions:
  - "penDraft.rows changed shape from a bare grams string to { grams, step, removed } per row, and buildPenFields now validates grams only for rows the draft itself does not mark removed (not the baseline's own removed rows) — a row can be removed within the same pen session that opened it."
  - "A removed authored note is deleted outright from the draft's array, not flagged in place — unlike rows and steps, a note carries no uses-list cross-flag concern, so there is nothing for a struck-in-place treatment to protect."
  - "A note's inheritedFrom marker is recomputed eagerly in the one text-change handler (compared against version.authored's original text), not derived at render time — so Authored.jsx reads note.inheritedFrom directly in every mode, with no special-case comparison logic of its own."
  - "Target chips are matched by array index, not by label, when writing an edit — a label can be mid-edit, so index avoids two chips momentarily colliding on the same label while the maker types."
  - "A single shared .prose-struck-beneath CSS class serves both the changed-step-text strike and the changed-headnote-prose strike (the one place the Strike Rule sits below rather than beside a field), reusing --rule-strike rather than inventing a new stroke."

requirements-completed: [REC1-03]

coverage:
  - id: D1
    description: "buildDiff(current, baseline) computes per-row grams/share/step deltas, per-step text/target/uses deltas, per-figure deltas zipped from buildFigures, and the total — all at display precision, never mutating or reordering either version."
    requirement: "REC1-03"
    verification:
      - kind: unit
        ref: "app/src/domain/diff.test.js (23 tests: identity, grams, share-follows-grams, display-precision for share and figures, removed-row exclusion, the total, step text/targets/uses, removal, never-mutates/never-reorders, empty)"
        status: pass
    human_judgment: false
  - id: D2
    description: "uses.js derives the two removal cross-flags (stepsUsingRow/removedRowsUsedBy/orphanedRows) and the stale-amount flag (stepsWithStaleAmounts) from each step's uses list, never from parsing prose, and removal never cascades — no function assigns a removed flag."
    requirement: "REC1-03"
    verification:
      - kind: unit
        ref: "app/src/domain/uses.test.js (12 tests covering stepsUsingRow, removedRowsUsedBy, orphanedRows, and stepsWithStaleAmounts, including the removed-step and removed-row suppression cases)"
        status: pass
      - kind: automated_ui
        ref: "grep gate: no assignment to a `removed` property in app/src/domain/uses.js"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every row's amount, step allocation and presence is editable in the pen; a changed value shows the baseline value struck beside it (grams) or beneath it (n/a for rows); removing a row strikes it in place and flags every active step that still uses it, offering remove-this-step there."
    requirement: "REC1-03"
    verification:
      - kind: automated_ui
        ref: "npm --prefix app run build && npm --prefix app test (acceptance-criteria greps: orphanedRows read through the domain function, no filter dropping a removed row from the table's own rendering, no rounding call, no colour/px literal)"
        status: pass
    human_judgment: true
    rationale: "The interactive flow — typing a grams value and watching the strike, removing a row and watching the totals/six figures move and the cross-flag appear beneath the affected steps, restoring and watching it clear — needs a browser to observe. Deferred to end-of-phase UAT per Mark's standing preference (STATE.md carry, MEMORY.md), consistent with 03-01 Plan 1's own tracer feedback gate."
  - id: D4
    description: "Every step's words (lead-in, instruction, purpose, aside), target chips (label and value), uses list and presence is editable in the pen; a changed step shows the baseline text struck beneath the field, a changed chip shows the old chip struck before it; removing a step strikes it in place (word 'removed' as a sibling of the struck block, never nested) and flags every row it uses that no remaining step uses."
    requirement: "REC1-03"
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx (10 tests: 4 pre-existing plus 6 new developing-mode cases — struck-beneath text, struck target chip, removed-sibling markup, removed-row cross-flag, stale-flag visibility on/off, stale-flag suppressed by own-text edit)"
        status: pass
      - kind: automated_ui
        ref: "npm --prefix app run build && npm --prefix app test (acceptance-criteria greps: stepsWithStaleAmounts and removedRowsUsedBy read through the domain functions, no instruction-prose parsing, no dangerouslySetInnerHTML, no colour/px literal, Method.jsx imports only batch.js/uses.js/diff.js and no store)"
        status: pass
    human_judgment: true
    rationale: "The interactive flow — editing a step's text and targets, checking/unchecking uses rows, removing a step and watching the row-side flag appear, setting a row's grams and watching the stale-amount flag name it — needs a browser to observe. Deferred to end-of-phase UAT alongside D3."
  - id: D5
    description: "Authored notes are editable and removable per note; an inherited note wears its 'from <parent line>' marker until its text is edited on this version, and the marker clears the instant the text differs."
    requirement: "REC1-03"
    verification:
      - kind: automated_ui
        ref: "grep gate: inheritedFrom read directly in app/src/ui/Authored.jsx; npm --prefix app test (build/test pass with the new handler wired)"
        status: pass
    human_judgment: true
    rationale: "No automated test file was in this plan's scope for Authored.jsx (files_modified lists no *.test.jsx for it); the marker-clears-on-edit behavior is implemented in RecipePage's handleChangePenNoteText and is straightforward to verify by code inspection, but the interactive confirmation (edit a note, watch the marker vanish; type it back verbatim, watch it return) is deferred to end-of-phase UAT alongside D3/D4."
  - id: D6
    description: "The headnote prose is editable with the baseline's prose struck beneath it once it differs — the same treatment a step's text gets."
    verification: []
    human_judgment: true
    rationale: "A one-field UI change with no dedicated test in this plan's scope; build/test pass with it wired. Deferred to end-of-phase UAT alongside D3/D4."

# Metrics
duration: 20min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 2: Give the pen everything the plan can be changed by Summary

**Two new pure domain modules (`diff.js`'s `buildDiff` and `uses.js`'s removal cross-flags and stale-amount flag) plus the pen's row, step, note and headnote-prose controls, wired so a removal reports and offers but never cascades.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-09-07T18:20:49Z
- **Completed:** 2026-09-07T18:40:41Z
- **Tasks:** 3 completed
- **Files modified:** 12 (4 created, 8 modified)

## Accomplishments

- `domain/diff.js`: `buildDiff(current, baseline)` — per-row grams/share/step deltas, per-step text/target/uses deltas, per-figure deltas zipped from `buildFigures`, and the total, all compared at display precision so a change no reader can see is never reported as one; never mutates or reorders either version
- `domain/uses.js`: `stepsUsingRow`, `removedRowsUsedBy`, `orphanedRows`, `stepsWithStaleAmounts` — the two removal cross-flags and the stale-amount flag, all derived from each step's own `uses` list and never from parsing prose; removal never cascades, no function assigns a `removed` flag
- `RecipePage` builds one `draftVersion` per render — the pen's own tables, the cross-flags and `buildDiff` all read it, replacing the earlier ad hoc `liveVersion` reconstruction
- `IngredientTable`: every row gains a step-allocation `<select>` and a remove/restore control; a removed row renders in place with name, grams, share and step struck, contributing nothing to the totals; the `% of batch` cell strikes independently of the grams strike; the total row shows the struck baseline beside the live total; the orphaned-row flag names the removed step(s) by number and lead-in
- `Method`: every step gains editable lead-in/instruction/purpose/aside fields, editable target chips, a `uses` checkbox list over the twelve rows, and a remove/restore control; a changed step shows the baseline text struck beneath the field, a changed chip shows the old chip struck before it; the removed-row cross-flag and the stale-amount flag are read through the tested domain functions
- `Authored`: notes editable and removable per note; the inherited-from marker persists until the note's text is edited on this version, computed once in `RecipePage`'s handler
- `Headnote`: the prose becomes a text field with the baseline struck beneath once it differs

## Task Commits

1. **Task 1: The comparison and the cross-flags, as two pure domain modules** — `7a3bd44` (test)
2. **Task 2: The rows in the pen — amount, allocation, remove and restore, and the orphaned-row flag** — `3dc7812` (feat)
3. **Task 3: The steps and the notes in the pen — words, targets, uses, removal, the stale-amount flag, and the inherited marker** — `578f0b8` (feat)

**Plan metadata:** committed separately below.

## Files Created/Modified

- `app/src/domain/diff.js` — `buildDiff`
- `app/src/domain/diff.test.js` — 23 tests
- `app/src/domain/uses.js` — `stepsUsingRow`, `removedRowsUsedBy`, `orphanedRows`, `stepsWithStaleAmounts`
- `app/src/domain/uses.test.js` — 12 tests
- `app/src/ui/IngredientTable.jsx` — step-allocation select, remove/restore, orphaned-row flag, struck `% of batch` and total
- `app/src/ui/Method.jsx` — step text/target fields, uses checkboxes, remove/restore, removed-row flag, stale-amount flag
- `app/src/ui/Method.test.jsx` — 6 new developing-mode tests
- `app/src/ui/Authored.jsx` — per-note editing and removal, inherited-from marker
- `app/src/ui/Headnote.jsx` — editable headnote prose with struck baseline
- `app/src/ui/RecipePage.jsx` — `draftVersion`, new handlers for row step/removed, step fields/targets/uses/removed, note text/removal
- `app/src/styles/tokens.css` — `--size-cross-flag`, `--gap-uses-chip`
- `app/src/styles/app.css` — `.prose-struck-beneath` and the new field/flag classes

## Decisions Made

- `penDraft.rows` changed shape from a bare grams string to `{ grams, step, removed }` per row; `buildPenFields` validates grams only for rows the draft itself does not mark removed.
- A removed authored note is deleted outright from the draft's array, not struck in place — it carries no `uses`-list cross-flag concern.
- A note's `inheritedFrom` marker is recomputed eagerly in the text-change handler (compared against `version.authored`'s original text), so `Authored.jsx` reads it directly with no derivation logic of its own.
- Target chips are matched by array index, not by label, when writing an edit, since a label can itself be mid-edit.
- A single shared `.prose-struck-beneath` class serves both the changed-step-text strike and the changed-headnote-prose strike.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `diff.js` and `uses.js` are complete and proven; `03-03` (the version strip and lineage line) and `03-04` (the `?changes` show-changes state) can build directly on `buildDiff`'s shape and the `draftVersion` pattern this plan established.
- **Deferred to end-of-phase UAT** (per Mark's standing preference, MEMORY.md and the 03-01 Plan 1 precedent): every `<human-check>` in this plan's three tasks — the interactive row/step editing, removal and cross-flag flows, and the note/headnote-prose editing. All automated verification (build, test, and every acceptance-criteria grep) has been run and passes; only the visual/interactive confirmation is deferred, including the cross-task scenario (removing a method step to trigger the ingredient table's orphaned-row flag) that only becomes fully exercisable now that both Task 2 and Task 3 have landed.
- `03-03` through `03-05` still need: the version strip, the `?changes` URL state, and the four FORM2-02 advisories — none of these are in this plan's scope.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED
