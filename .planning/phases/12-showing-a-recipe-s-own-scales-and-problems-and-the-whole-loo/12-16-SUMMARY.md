---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 16
subsystem: ui
tags: [phone, below-724, recipe-band, kept-draft, playwright-webkit, sketch-016]
requires:
  - phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
    provides: "12-10: useKeptDraft heldPlan and planGuard (the page's planHeld); 12-09 and 12-15 (the rest of PHONE-01)"
provides:
  - "VersionRow below 724: acts row of the record act and Print sheet; no Next version, Edit or Resume editing"
  - "ownDraft and planHeld props on VersionRow, fed by RecipePage from heldPlan and planGuard"
  - "the Edit kept and Draft lines, one p.notebook-version__draft, each sentence a named constant"
  - "12-board-band.mjs: seven sketch 016 band panels held against the build at 393 and 723"
affects: [12-14]

tech-stack:
  added: []
  patterns:
    - "a board spec for state the route cannot name ahead: route '/', the steps make the state at 1366 and reload the saved address at the panel's width"
    - "the own draft's line takes its own prop beside the History rail's waitingPlanDraft, so the rail draws no node for it"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs
  modified:
    - app/src/ui/VersionRow.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/ui/VersionRow.record.test.jsx
    - app/src/ui/RecipePage.edit.test.jsx
    - app/src/ui/RecipePage.drafts.test.jsx

key-decisions:
  - "The record act is drawn below 724 only when editState is not 'editing' and planHeld is false; planHeld is true until useKeptDraft's one getDraft settles, so the act stays out on every version until the first draft read settles (sketch 016 is silent on it; same call as 12-10's log)"
  - "One draft line, in the order: a kept edit, this version's own held draft, another version's waiting draft. The Edit kept and own-draft lines are drawn below 724 only"
  - "Next version's className is always notebook-action; the width ternary is gone"

requirements-completed: []
requirements-partial: "PHONE-01: all four plans (12-09, 12-10, 12-15, 12-16) have now landed; REQUIREMENTS.md left alone, as the plan names no edit to it"

actuals:
  tokens: 21000
  tasks: 2
  commits: 2

duration: 45 min
completed: 2026-11-22
status: complete
commits: 2
plan_head_before: 016ca8fb85dadb1c110a6404d478bf29c4382508
plan_head_after: 3309a4a38dba53272abe073ae85db15aa4f2d25d
---

# Phase 12 Plan 16: The recipe page's head below 724 Summary

**Below 724 the band's acts row is the record act the version waits on and Print sheet; Next version, Edit and Resume editing are left to the desk and the iPad, and a kept edit or a kept Next version draft says in one line where it is finished.**

## Performance

- **Duration:** about 45 min
- **Tasks:** 2 of 2
- **Files:** 7 (6 in Task 1, 1 new in Task 2)

## Accomplishments

- **The phone head.** `VersionRow` takes `ownDraft` (this version's own held Next version draft, `heldPlan`) and `planHeld` beside `draft`. Below 724 with no pen open, the acts row holds the filled record act (Record another, Record tasting or Record batch, by the standing) and Print sheet. The record act is drawn only while `editState !== 'editing' && !planHeld`. Next version, Edit and Resume editing are left out of the markup below 724. From 724 up the row is as built, and Next version's class is always `notebook-action` (the width ternary is removed).
- **The lines.** One `p.notebook-version__draft` right after the identity heading, in this order: "Edit kept. Finish it at the desk or on the iPad." for a kept edit; "Draft: Version N · name. Finish it at the desk or on the iPad." for this version's own held draft, in plain text with no link (the name built by the same rule as the waiting name: the next ordinal, the typed name, the middot left out while the name is blank); and for another version's waiting draft the as-built link followed by ". Finish it at the desk or on the iPad." below 724. From 724 up the waiting draft's line is as built, without the sentence. Every name is a React text child.
- **RecipePage.** `ownDraft={openPen === null ? heldPlan : null}` and `planHeld={planHeld}` are new props. `draft` (waitingPlanDraft), `below724`, `onStartRecording`, `onStartTasting` and RecipeHistory's `waitingDraft` are unchanged, so the History rail draws no node for the own held draft (Pitfall 6; a test asserts the lone-version line "Only this version so far" still reads).
- **The pins.** `VersionRow.test.jsx`'s below-724 cases were rewritten to the board: `[Record another, Print sheet]`, `[Record tasting, Print sheet]`, `[Record batch, Print sheet]`, an editable version with no Edit, a kept edit `[Print sheet]` plus the Edit kept line, an own draft with `planHeld` `[Print sheet]` plus the Draft line (no link, name as text, hostile markup stays text), `planHeld` with no own draft yet, and another version's waiting draft keeping its record act with the linked sentence. A 24-arrangement matrix (three standings, four edit states, planHeld on and off) proves no Next version, Edit or Resume editing in any below-724 arrangement. The case that pinned Next version as a text control below 724 is gone. `VersionRow.record.test.jsx`'s below-724 cases follow (Test I now asserts Next version is not drawn; a new case asserts no record act under `planHeld`). `RecipePage.edit.test.jsx`'s two cases at 600 follow the plan's wording; the stale-edit case at 1280 is byte-identical.
- **The boards.** `12-board-band.mjs` holds the seven sketch 016 "Drawn" band panels (band-tasted, band-awaiting, band-none, band-tasted-723, band-editable, band-editing, band-draft) against the build in Playwright WebKit with a coarse pointer. The anchor is `.notebook-band`; elements are the identity heading, the draft line (measured where the board draws one, declared absent where not) and `.notebook-version__acts > *` (count, text, font, box); absences are `.notebook-version__acts button.notebook-link` on every panel and `.notebook-version__acts button` on band-editing and band-draft. The three kept-work panels are made through the built editor at 1366 (Coffee, "Strong and cold."; Edit with a description typed; Next version with the name "less cream"), then the saved address is loaded again at 393, so RecipePage mounts below 724 with the draft in the store.

## Task Commits

1. **Task 1 (tracer): the band's head below 724 and every pin it breaks** - `18b07213` (feat)
2. **Task 2: the band boards side by side in WebKit** - `3309a4a3` (test)

## Verification Results

- Whole suite: **135 files, 4490 tests, all passing** (baseline 135 files, 4477 tests; +13 net).
- Task 1's automated run (VersionRow, VersionRow.record, VersionRow.landing, RecipePage, RecipePage.drafts, RecipePage.edit, tabindex-scan): passes. Acceptance greps: the width ternary 0, "Edit kept. Finish it at the desk or on the iPad." 1, ". Finish it at the desk or on the iPad." 2, `ownDraft={openPen === null ? heldPlan : null}` 1, `draft={openPen === null ? waitingPlanDraft : null}` 1 (the guard).
- `12-board-check.mjs 12-board-band.mjs` on a scratch build (`--outDir` in the scratchpad, never `app/dist`): **99 PASS, 0 FAIL** without `--selftest`; with `--selftest`: **106 PASS, 0 FAIL**, seven lines "PASS selftest band-..." (band-tasted, band-awaiting, band-none, band-tasted-723, band-editable, band-editing, band-draft). Every 393 panel also passes "overflow" and "overflow at 723"; band-tasted-723 passes "overflow" at its own width.
- `12-band-probe.mjs held widen` on the same build: all 9 checks PASS (it still passes with no band record act, because it presses the act only when one is drawn).
- `11-walk-check.sh`: `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5` (the walk runs at 1366, where the band is as built).
- Every result is Playwright WebKit or jsdom: **device-unverified**. No device row for PHONE-01.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 12-10's three held-draft cases in `RecipePage.drafts.test.jsx` pinned the band's old record act and Next version below 724**
- **Found during:** Task 1, whole-suite run.
- **Issue:** three cases from 12-10 pressed the band's record act and Next version on a version holding a plan draft ("until 12-16 takes it out", its own comment). With 12-16 the act and Next version are not drawn, so they failed on `null`. The file is outside `files_modified`.
- **Fix:** the three cases now assert what the board draws instead: no band record act, no Next version, the acts reading `[Print sheet]`, the Draft line "Draft: Version 2 · less milk. Finish it at the desk or on the iPad.", the History rail's lone-version line, no pen open and the store untouched. The case "draws no record act until the first draft read has settled" now asserts the band's act is absent until the read settles and reads "Record another" after. The route-intent and opener-refusal cases are unchanged.
- **Files modified:** `app/src/ui/RecipePage.drafts.test.jsx`
- **Commit:** `18b07213`

### Spec details

**2. The kept-work board panels use route `/`.** The saved version's address is known only once the editor has saved it, and the engine lands each panel on its `route` before the steps run. The three kept-work panels name route `/` and `ready: '.shell'`, and their steps make the state at 1366 and load the saved address at the arrival width (393, or 723 for the extra-width run). No change to `12-board-check.mjs`.

**3. The plan commit ledger (protocol 0c) was not written to the git directory.** The plan base the orchestrator named (`016ca8fb...`) is used as `plan_head_before`, and `commits: 2` is measured against it before the SUMMARY commit.

**Total deviations:** 1 auto-fixed (blocking pin outside the file list), 2 notes. **Impact:** none on scope.

## Known Stubs

None.

## Threat Flags

None. T-12-33 (a draft's typed name drawn as markup): the name is a React text child, and a test hands `<b>x</b>` and asserts it renders escaped. T-12-51: `planHeld` comes from RecipePage's `planGuard`; the below-724 cases cover `planHeld` with and without a held record. T-12-52: every line above is labelled device-unverified. No new endpoint, auth path or store shape.

## Notes for Sid and the orchestrator

- **The band's record act below 724 stays out on every version until the first draft read settles.** `planHeld` is true until `useKeptDraft`'s one `getDraft` settles, so the act is absent in that moment on every version, as 12-10 records for the log's Record batch, Record another and Correct; sketch 016 is silent on it.
- **A pen closed below 724 has no Next version to return focus to** (the control is not drawn there), so focus is left where the browser puts it. Not drawn; for Sid.
- **Kept edit with another version's waiting draft:** below 724 the one draft line is the Edit kept line, so another version's waiting draft is not named beside it. Sketch 016 draws one line on each panel and no combination; flagged for Sid.
- **PHONE-01 edge row** is unclassified and stays unresolved as an edge class; its cut (723 phone, 724 desk) is pinned by `extraWidths` and the band-tasted-723 panel.
- **Left to the orchestrator** (executors have no ArtifactData): Mark's List `todo-phone-hide-entry-points` closes now that 12-09, 12-10, 12-15 and 12-16 have all landed. No store shape, DB_VERSION or store-file-version change: with this plan landed the phone arrangement is complete, and main is safe to deploy. `REQUIREMENTS.md` was left alone (the plan names no edit to it); PHONE-01's checkbox is the orchestrator's.
- `.planning/state-machines/INVENTORY.md` entry 11 (the kept draft restore) is for the post-phase `gsd-state-machine-audit`; this plan adds no state to it (VersionRow takes two props).

## Next Phase Readiness

12-14 runs `12-board-band.mjs` in `12-check.sh` round two.

## Self-Check: PASSED

Created and changed files exist (`VersionRow.jsx`, `RecipePage.jsx`, the four test files, `12-board-band.mjs`); commits `18b07213` and `3309a4a3` are on HEAD.
