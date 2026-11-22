---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 10
subsystem: ui
tags: [phone, below-724, kept-draft, restore, planGuard, playwright-webkit]
requires:
  - phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
    provides: "12-04, 12-05, 12-08 (board and check scaffolding); 12-09 (DeskOnly, Notebook and Home below 724, PHONE-01 text)"
provides:
  - "useKeptDraft keepPlanShut: below 724 a fitting plan record is left where it is; returns { draftRestoreDone, heldPlan, planGuard }"
  - "planGuard: the one source for 'plan held' (held, widening re-read out, or below 724 before the first read settles)"
  - "RecipePage openers (record, tasting, correct, Next version) refuse while planGuard; Next version also refuses below 724"
  - "BatchRow correctHeld: Correct hidden while a plan draft is held, apart from recordingLocked"
  - "Widening re-reads through the one restore path; a pen open when the window narrows stays open"
  - "12-band-probe.mjs (modes held, widen) in WebKit; the 393 suites that press Next version moved to 800"
affects: [12-14, 12-16]

tech-stack:
  added: []
  patterns:
    - "one source of truth for a guard: the restore read exposes heldPlan and planGuard, the page never derives it from its drafts list"
    - "a restore that leaves a record alone returns before draftStoredRef is set, as the foreign-family exit does"
    - "re-run the one restore effect with a round counter rather than add a second restore path"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs
  modified:
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.drafts.test.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
    - app/src/ui/RecipePage.beforeYouStart.test.jsx
    - app/src/ui/VersionRow.landing.test.jsx

key-decisions:
  - "heldPlan, planRestoring and restoreRound are the new restore state; the keepPlanShut ref is read when the read resolves, so the width then decides"
  - "planGuard = heldPlan set, or re-read out, or (keepPlanShut and first read not settled); a creation page passes no keepPlanShut so its guard is always false"
  - "Correct is gated on correctHeld alone, not joined to recordingLocked (Mark 2026-11-22): a kept edit with a batch keeps Correct at every width"
  - "No opener reads draftsLoaded; useRouteIntents.js is unchanged (review item 8 closed by construction)"

patterns-established:
  - "the 393 page suites mount at 800 by default (724 up, below the 984 two-column Sheet) when they press a desk control"

requirements-completed: []
requirements-partial: "PHONE-01 is shared with 12-15 and 12-16 (not yet landed); REQUIREMENTS.md is left unchecked by the orchestrator's instruction"

actuals:
  tokens: 14000
  tasks: 3
  commits: 3

duration: 55 min
completed: 2026-11-22
status: complete
commits: 3
plan_head_before: 875ef703710c1a01136029f37b0f69a2a407a7c4
plan_head_after: 23f199d90f5966104f9b8f14a6c06a8125646d5d
---

# Phase 12 Plan 10: A kept Next version draft stays shut on the phone and nothing opens over it Summary

**Below 724 a fitting Next version draft is left in the store untouched, `useKeptDraft` exposes one `planGuard` that every pen opener on the page refuses on, and widening re-reads the draft through the one restore path while every opener stays refused until the read settles.**

## Performance

- **Duration:** about 55 min
- **Tasks:** 3 of 3
- **Files:** 9 changed in three commits (995 insertions, 73 deletions)

## Accomplishments

- **The restore leaves the plan record alone below 724.** `useKeptDraft({ keepPlanShut })` runs the fit check first (a misfit is still deleted quietly), then for a fitting plan record read while the flag is true it sets `heldPlan` and `draftRestoreDone` in one update and returns before `draftStoredRef` is set. No restore, no notice, and the persist effect neither writes over nor deletes the record. 'record' and 'amend' records restore as built, at every width.
- **One source for "plan held".** `planGuard` is true while a plan is held, while the widening re-read is out, and below 724 until the first read has settled. `RecipePage` takes `planHeld` from it; no `kind === 'plan'` derivation is in the page (grep prints 0). The three single-call-site pins in `RecipePage.shell.test.js` hold unchanged.
- **Every opener refuses while held.** `handleStartRecording`, `handleStartTasting`, `handleStartAmending` (wrapped over `useBatchRecording`'s, destructured as `startTasting` and `startAmending`) and `handleStartDeveloping` refuse on `planHeld`; `handleStartDeveloping` also refuses below 724. The batch log draws no Record batch, Record another or Correct. Home's startTasting intent is consumed and opens nothing; `useRouteIntents.js` is unchanged.
- **Correct only while a plan is held.** `BatchRow` gets `correctHeld` (default false); `recordingLocked` is `editState === 'editing' || planHeld`. A kept edit on a version that has since gained a batch keeps Correct (asserted in `RecipePage.drafts.test.jsx`; `RecipePage.edit.test.jsx` is unchanged).
- **Widening.** When `keepPlanShut` turns false with a record held, an effect clears `heldPlan` and sets `planRestoring` in the same update, resets the started-ref and bumps `restoreRound`, which the one restore effect lists as a dependency. `planRestoring` goes false in the same update as every outcome of that read (restored, held again, nothing stored, foreign, misfit deleted, rejected). A held-read test proves no pen opens and the store is deep-equal while the read is out, for both a resolved and a rejected read. A pen open when the window narrows stays open.
- **Start-tasting intent not dropped by a read race.** At 393 with no plan held and `listDrafts` held open after `getDraft` resolves, the tasting pen opens (review item 8).
- **Narrow suites pre-migrated.** `RecipePage.perStep.test.jsx` and `RecipePage.beforeYouStart.test.jsx` take a width, default 800; `VersionRow.landing.test.jsx` Test B drops its below-724 row.

Below 724 the log's Record batch, Record another and Correct stay out on every version until the first draft read settles (useKeptDraft's one `getDraft`), since sketch 016 is silent on it.

## Task Commits

1. **Task 3 first (kept the history green): the 393 suites that press Next version mount at 800** - `338ee09a` (test)
2. **Task 1 (tracer) and the widening code of Task 2: shut draft, planGuard, guarded openers, correctHeld, drafts tests, probe** - `39cda698` (feat)
3. **Task 2: useKeptDraft keepPlanShut, held record and widening cases** - `23f199d9` (test)

Task 3's commit comes first because it passes before and after the code change; committing it first keeps every commit green. The widening code lives in `useKeptDraft.js`, which Task 1 had to edit anyway, so it landed with Task 1's commit; the widening and held-read tests for the page are in `RecipePage.drafts.test.jsx` (same commit) and the hook's in `useKeptDraft.test.jsx` (third commit).

## Verification Results

- Whole suite: **134 files, 4462 tests, all passing** (baseline 4440; +23 new, -1 dropped row).
- New tests: `RecipePage.drafts.test.jsx` +15 (11 below-724 cases, 3 held-read and narrowing cases, desk reopen and kept-edit Correct are inside the 11), `useKeptDraft.test.jsx` +8. A mutation check (`keepPlanShut: false`) failed 8 of the new page cases, so they bite.
- `12-band-probe.mjs held widen` on a scratch build (Playwright WebKit): 9 PASS lines, no FAIL, including "drafts dump identical after load and after 2 s" for both recipes, the band's record act and Next version opening no pen, Home's Record tasting at 393 opening no pen with the route state cleared and the plan draft byte-identical, widening opening the pen with the typed name, and narrowing leaving it open. `PROBE_DIST=app/dist` is refused with "FAIL PROBE_DIST resolves to app/dist".
- `11-walk-check.sh`: `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`.
- Acceptance greps: `keepPlanShut` 7, the three useKeptDraft call-site markers 1 each, `planRestoring` 2, `recordingLocked={editState === 'editing'}` 0, `keepPlanShut: below724` 1, `planGuard` in RecipePage 2, `kind === 'plan'` in RecipePage 0, BatchRow `!correctHeld` 1 and `!recordingLocked` 1. `git diff 875ef703..HEAD` over `app/src/store`, `app/src/domain/draft.js`, `app/src/ui/useRouteIntents.js` and `RecipePage.edit.test.jsx` is empty.
- Every result is Playwright WebKit or jsdom: **device-unverified**. No device row for PHONE-01.

### Task 3 case counts (before and after)

| File | Cases before | Cases after |
| --- | --- | --- |
| RecipePage.perStep.test.jsx | 44 | 44 |
| RecipePage.beforeYouStart.test.jsx | 12 | 12 |
| VersionRow.landing.test.jsx | 4 | 3 (Test B's below-724 row) |

Changed cases: every case in the two page suites moved from a fixed 393 window to 800 through the helper's new default (`installMatchMedia(width = 800)`), since each presses the band's Next version; no case needed a different width. One case changed its control: `RecipePage.perStep.test.jsx` "Recording reads like the Sheet when one line is left" and "the record pen draws its own steps whether or not Show changes was on" now press the log's Record batch (`.notebook-log`) in place of the band's record act, with the same asserted outcome (the helper keeps the name `band` and sits on the same line, so the line numbers plan 11-07 cites do not move). `RecipePage.recordTasting.test.jsx` and `RecipePage.undoRetire.test.jsx` ran unchanged and green.

## Deviations from Plan

### Auto-fixed Issues

None needed beyond the plan's own file list.

### Spec details

**1. Probe compares drafts ignoring `updatedAt` after a widening.** A restored pen is dirty, so the page rewrites its record after the debounce, as at any fresh desk load; the widen check compares everything but `updatedAt`. The held checks compare the whole dump byte for byte.

**2. Task 3 committed before Tasks 1 and 2.** See Task Commits.

**3. The plan commit ledger (protocol 0c) could not be written.** The environment denied writing under the worktree's `.git` directory, so `plan_head_before` is the base the orchestrator named (`875ef703...`) and the count was measured against it.

**Total deviations:** 0 auto-fixes, 3 notes. **Impact:** none on scope.

## Known Stubs

None.

## Threat Flags

None. T-12-30 to T-12-32, T-12-53 and T-12-54 are mitigated and tested as the plan's register says; no new endpoint, auth path or store shape.

## Issues Encountered

None open. `app/dist` was never written (builds used a scratch `--outDir`); no Vite process was started; Mark's `vite preview` was left alone.

## Left to the orchestrator

Executors have no ArtifactData, so the plan's orchestrator steps were not attempted:
- Mark's List `todo-phone-hide-entry-points` closes once 12-09, 12-10, 12-15 and 12-16 have all landed.
- Deploy: no store shape, DB_VERSION or store-file-version change; main is safe to deploy once 12-16 has also landed (until then the phone's head still shows Next version and Edit, and the held version's record act opens nothing).
- PHONE-01 stays Pending in REQUIREMENTS.md (shared with 12-15 and 12-16).
- `.planning/state-machines/INVENTORY.md` entry 11 (the kept draft restore) gains the outcome "held shut below 724" and the state "re-reading after widening" (parts: `heldPlan`, `planRestoring`, `restoreRound`, the keepPlanShut ref); the post-phase `gsd-state-machine-audit` owns that edit.

## Next Phase Readiness

12-16 draws the head from `heldPlan` and `planHeld`; 12-14 runs `12-band-probe.mjs` in `12-check.sh` round two.

## Self-Check: PASSED

Created and changed files exist; commits `338ee09a`, `39cda698` and `23f199d9` are on HEAD.
