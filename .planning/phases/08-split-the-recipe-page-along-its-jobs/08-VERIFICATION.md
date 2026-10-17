---
phase: 08-split-the-recipe-page-along-its-jobs
verified: 2026-10-17T16:38:16Z
status: gaps_found
score: 3/4 must-haves verified
covered_files:
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-01-PLAN.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-01-SUMMARY.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-02-PLAN.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-02-SUMMARY.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-03-PLAN.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-03-SUMMARY.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-04-PLAN.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-04-SUMMARY.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-05-PLAN.md"
  - ".planning/phases/08-split-the-recipe-page-along-its-jobs/08-05-SUMMARY.md"
  - "app/src/ui/RecipePage.jsx"
  - "app/src/ui/RecipePage.shell.test.js"
  - "app/src/ui/RecipePage.shellEffects.test.jsx"
  - "app/src/ui/RecipePage.strictMode.test.jsx"
  - "app/src/ui/RecipePage.test.jsx"
  - "app/src/ui/RecipeSheet.jsx"
  - "app/src/ui/RecipeSheet.test.jsx"
  - "app/src/ui/sheetView.js"
  - "app/src/ui/sheetView.test.js"
  - "app/src/ui/useAnnouncer.js"
  - "app/src/ui/useBatchRecording.js"
  - "app/src/ui/useKeptDraft.js"
  - "app/src/ui/useKeptDraft.test.jsx"
  - "app/src/ui/useRecipeData.js"
  - "app/src/ui/useRouteIntents.js"
  - "app/src/ui/useVersionPen.js"
covered_digest: "v3:sha256:e13d42c25375ec06a67caa5d4a17579c2fa482843b0b3fe424f81575310fe612"
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "Every existing test passes; tests whose code moved change only their imports, and none is deleted or weakened (ROADMAP criterion 4)"
    status: partial
    reason: "One source-text pin lost power in the D-11 re-point. RecipePage.test.jsx 'Test I' (261002-wn1) counts onToggleShowChanges={handleToggleShowChanges} and expects 2. Before the split the two sites were VersionRow and IngredientsHead. After the split RecipePage.jsx alone holds two (VersionRow and <RecipeSheet>), and the IngredientsHead hop is written onToggleShowChanges={onToggleShowChanges} inside RecipeSheet.jsx, which the regex does not match. The count is met without the IngredientsHead hop being wired. No other test covers it: the walk records at width 1366, where the below-724 heading control does not render, and no RecipePage-level jsdom test clicks that control. The wiring is present in the code today (read in RecipePage.jsx 419-458 and RecipeSheet.jsx 126-132); the protection against it breaking is what was weakened. 08-test-audit.mjs reports AUDIT OK because it looks at changed expect lines, and this change altered no expect line. This is review finding WR-01."
    artifacts:
      - path: "app/src/ui/RecipePage.test.jsx"
        issue: "Test I (lines ~1289-1304) is satisfied by VersionRow plus RecipeSheet in the shell, so it no longer fails if RecipeSheet stops passing the handler to IngredientsHead"
    missing:
      - "Pin the three-hop wiring: keep the shell count at 2 (VersionRow, RecipeSheet) and add an assertion on the comment-stripped RecipeSheet.jsx that <IngredientsHead ... onToggleShowChanges={onToggleShowChanges}> is present; retitle the case to name VersionRow and RecipeSheet, which hands it to IngredientsHead"
human_verification:
  - test: "In WebKit at a 393-wide coarse window, open a version that has a parent, with no pen open. In the Ingredients heading press Show changes, then Hide changes."
    expected: "The heading control toggles the changes view and the URL gains and loses the `changes` key, exactly as at the base commit. The band carries no second Show changes control at this width."
    why_human: "The recorded walk is at width 1366, where IngredientsHead draws no control, and no RecipePage-level test clicks it, so the RecipeSheet-to-IngredientsHead hop is exercised by nothing automated (WR-01). Also confirms the maker sees no change at a narrow width, which the walk does not cover."
---

# Phase 8: Split the recipe page along its jobs Verification Report

**Phase Goal:** `RecipePage` is cut along its separate jobs, so the creation editor in Phase 10 can mount the same Sheet and pen modules that editing uses, and the maker sees no change
**Verified:** 2026-10-17T16:38:16Z
**Status:** gaps_found
**Re-verification:** No, initial verification

## Goal Achievement

The split itself is real and the maker-facing behavior matches the baseline. One narrow gap remains against ROADMAP criterion 4: a source-text test pin was weakened in the re-point. It is a two-line test fix and does not touch behavior.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `RecipePage.jsx` is the route shell only: the announcer, record loading, the sheet view, the version pen, kept drafts and route intents each live in a module of their own, and the Sheet renders through one component the creation editor can mount | VERIFIED | Each module exists and is substantive: `useAnnouncer.js` (73 lines), `useRecipeData.js` (222), `sheetView.js` (152, imports only `../domain/`), `RecipeSheet.jsx` (235), `useVersionPen.js` (290), `useKeptDraft.js` (222, holds `useDraftWriter` and `useKeptDraft`), `useRouteIntents.js` (75), plus the bonus `useBatchRecording.js` (567). `RecipePage.jsx` went from 1,837 to 509 lines and calls all of them above its first early return (read in full). It declares only `PageLoadFailed`, `RecipeNotFound` and `RecipePage`. It makes no store read and has no draft setter. Its remaining inline logic is route identity, the mode, the title effect, Escape, the waiting-draft lookup and the band and Batch aside markup. `RecipeSheet.jsx` imports no store module and takes `view`, `version`, `mode` and `foot`. `RecipeSheet.test.jsx` mounts it with no stored version and `baseline: null`, empty and populated, and `sheetView.test.js` covers the null baseline. |
| 2 | In the built app the maker sees no change: the recorded WebKit walk of 94 snapshots compares MATCH with its baseline | VERIFIED | Ran `sh 08-walk-check.sh`: it built into a scratch directory under `$TMPDIR` and printed `RECORDED ... 94 snapshots` then `MATCH 94 snapshots`. `08-walk-after.json` is committed. Scope limit: the walk runs at width 1366 only (`08-walk.mjs` line 70), so narrow-width behavior is not covered by it (see Human Verification). |
| 3 | The shell test names each new module and asserts that the shell imports it and that its job lives there, not only that code is gone from `RecipePage.jsx` | VERIFIED | `RecipePage.shell.test.js` holds a `JOBS` table of nine entries (useAnnouncer, useRecipeData, sheetView, RecipeSheet, useVersionPen, useDraftWriter, useKeptDraft, useBatchRecording, useRouteIntents). `jobProblems` checks the export, the shell's import from the specifier, exactly one call, hook order above the early return, per-module marker counts, `shellLacks` and an import allow-list. A `HOOK_ORDER` case, a completeness case, seven broken fixtures proving each check can fail, and `NEW_MODULES` setter, unused-import and `dangerouslySetInnerHTML` cases are also present. It ran green in the full suite. |
| 4 | Every existing test passes; tests whose code moved change only their imports, and none is deleted or weakened | FAILED (partial) | Passing: full suite `Test Files 96 passed (96)`, `Tests 2998 passed (2998)` (base was 91 files, 2932 tests). `08-test-audit.mjs 78e962d` printed `AUDIT OK`. Failing: the audit cannot see one weakening, WR-01 above. Test I in `RecipePage.test.jsx` (the 261002-wn1 describe) is met by the VersionRow and RecipeSheet sites in the shell, so the IngredientsHead hop is no longer pinned and no other test covers it. The `removed:` lines the audit lists for the shell test are legitimate: they are the assertions that moved with `usePenDraft`/`useRecordDraft` into `useVersionPen`/`useBatchRecording`, replaced by narrower checks that the shell calls the owning hook once above the early returns and that the draft hooks are called once inside the modules. |

**Score:** 3/4 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/ui/useAnnouncer.js` | three live regions, guarded 5 s clear | VERIFIED | Real timers and `announce`; imported and called by the shell |
| `app/src/ui/useRecipeData.js` | the eight record reads with cancellation flags | VERIFIED | Called as `useRecipeData(versionId)`; reads through `../store/repository.js` |
| `app/src/ui/sheetView.js` | pure derived view, nullable baseline, `markedFigure`, `openBatchFor` | VERIFIED | Domain imports only; shell and `RecipeSheet` use it |
| `app/src/ui/RecipeSheet.jsx` | one Sheet component with `foot` slot | VERIFIED | Mounted by the shell; mounted with no store by `RecipeSheet.test.jsx` |
| `app/src/ui/useVersionPen.js` | version pen with `usePenDraft` inside | VERIFIED | Called once above the early returns |
| `app/src/ui/useKeptDraft.js` | `useDraftWriter` (no effect) and `useKeptDraft` | VERIFIED | StrictMode guard kept; hook-level and page-level StrictMode tests present |
| `app/src/ui/useRouteIntents.js` | two consume-once openers waiting on `draftRestoreDone` | VERIFIED | Read in full; dependency arrays as in the base per the review |
| `app/src/ui/useBatchRecording.js` | bonus cut: record pen and tasting | VERIFIED | Landed after the D-01 gate; shell test pins it |
| `08-walk.mjs`, `08-walk-server.mjs`, `08-walk-check.sh`, `08-walk-after.json`, `08-test-audit.mjs` | walk and audit tooling | VERIFIED | Ran both; `08-walk-after.json` committed |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `RecipePage.jsx` | each job module | import + one call above the first early return | WIRED | Pinned by `HOOK_ORDER` and `JOBS`; read in the source |
| `RecipePage.jsx` | `RecipeSheet` | `<RecipeSheet view=... foot={<PenFoot .../>} .../>` | WIRED | `view` from `sheetView({... baseline: version ...})` |
| `RecipeSheet.jsx` | `IngredientsHead` | `onToggleShowChanges={onToggleShowChanges}` | WIRED, UNPINNED | Present in code; no test fails if it is removed (WR-01) |
| `useRouteIntents` | `useBatchRecording` / `useVersionPen` | `onStartAmending`, `onStartDeveloping` | WIRED | Shell passes `handleStartAmending` and `handleStartDeveloping` |
| `useKeptDraft` | pens | `onRestorePlan`, `onRestoreRecord` | WIRED | Shell passes `restorePlan` and `restoreRecord` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `RecipeSheet` | `view`, `version` | `useRecipeData` store reads, `sheetView` | Yes | FLOWING |
| `RecipePage` | `batches`, `drafts`, `versions` | `useRecipeData` | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite | `npm --prefix app test -- --run` | 96 files, 2998 tests passed, exit 0 | PASS |
| Base-to-result test audit | `node 08-test-audit.mjs 78e962d` | `AUDIT OK` | PASS (but see WR-01) |
| Walk against baseline | `sh 08-walk-check.sh` | `MATCH 94 snapshots` | PASS |

The state-transition and cancellation invariants in this phase (the restore guard, the consume-once refs) are covered by named tests that ran in the suite: `useKeptDraft.test.jsx`, `RecipePage.strictMode.test.jsx`, `RecipePage.shellEffects.test.jsx`. The reviewer's mutation (removing the restore guard) turned those red, so I did not mark any truth PRESENT_BEHAVIOR_UNVERIFIED.

### Probe Execution

SKIPPED: the phase declares no `probe-*.sh` probes.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| EDIT-05 | 08-01 to 08-05 (all five declare it) | `RecipePage` is cut along its separate jobs (announcer, record loading, sheet view, version pen, kept drafts, route intents) and the maker sees no change | SATISFIED | All six named jobs and the bonus record pen live in their own modules; walk MATCH 94 |
| EDIT-06 | 08-01 to 08-05 | The shell test asserts the new modules positively, and the recorded WebKit walk of 94 snapshots still matches | SATISFIED | `JOBS` table and `HOOK_ORDER` in the shell test; `MATCH 94 snapshots` re-run by the verifier |

No orphans: REQUIREMENTS.md maps only EDIT-05 and EDIT-06 to Phase 8 (rows 101-102), and both appear in every plan's `requirements`. The Complete marks that plan 08-05 wrote are supported by the code. The one qualifier is the WR-01 pin, which falls under ROADMAP criterion 4, not under either requirement's text.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (all nine new or changed source files) | - | TBD/FIXME/XXX/TODO/HACK scan | none | Clean |
| `app/src/ui/RecipePage.test.jsx` | ~1289-1304 | Weakened source-text pin (WR-01) | Blocker for criterion 4 | See gap |
| `app/src/ui/RecipeSheet.jsx` | 171 | `draft.stepChanges` read unguarded, though `draft` defaults to `null` (WR-02) | Warning | No effect today: the shell always passes `draft`, the record pen is not part of creation, and `RecipeSheet.test.jsx` covers `reading` and `developing` only. A Phase 10 caller passing `mode="recording"` without `draft` would throw |
| `useBatchRecording.js` 319-321, `RecipePage.jsx` 214-216 | - | Stale comments (IN-01) | Info | Comments only |
| `sheetView.js` | 19-23 | Third `joinNames` copy (IN-02) | Info | Pre-existing duplication |
| `RecipePage.shell.test.js` | JOBS markers | Literal occurrence counts unexplained (IN-03) | Info | Maintenance cost only |

Store and convention checks: no file under `app/src` other than the store imports `idb`; no `dangerouslySetInnerHTML` in any new module. Every changed file in `78e962d..HEAD` is under `app/src/ui/`; no domain, store or CSS file changed.

### Review Findings Judged

- WR-01: confirmed by my own reading of the diff and the regex, and it is the gap above. It affects ROADMAP criterion 4, not the goal's behavior.
- WR-02: does not affect goal achievement. It is a latent trap for Phase 10 if its caller uses the record pen mode, and the plan keeps the record pen with the notebook page. Worth fixing with WR-01.
- IN-01, IN-02, IN-03: no effect on the goal.
- Known Phase 10 limitation, recorded in `RecipeSheet.test.jsx`: with `baseline: null` in `developing` mode the steps stay read-only (`Method` needs a baseline). This is documented there and assigned to Phase 10, so it is not a Phase 8 gap.

### Human Verification Required

#### 1. Show changes from the Ingredients heading at a narrow width

**Test:** In WebKit at a 393-wide coarse window, open a version that has a parent, with no pen open. In the Ingredients heading press Show changes, then Hide changes.
**Expected:** The heading control toggles the changes view and the URL gains and loses the `changes` key, exactly as at the base commit. No second Show changes control appears in the band at this width.
**Why human:** The walk is at 1366, where the heading draws no control, and no automated test presses it through the page. This is the one hop WR-01 leaves unpinned. It also confirms the maker sees no change at a narrow width. No iPad check is required (D-07).

### Gaps Summary

The phase delivers its goal in substance. The page is cut into eight modules, the shell imports and calls each in order, the Sheet renders through one component that mounts with no store and no baseline, the full suite is green at 96 files and 2998 tests, the walk matches 94 snapshots, and the shell test names every module and fails if a job is dropped.

The single gap is ROADMAP criterion 4: "none is deleted or weakened". When `RecipePage.test.jsx` Test I was re-pointed to read `RecipeSheet.jsx` as well, its count of 2 became satisfiable by the shell's VersionRow and RecipeSheet sites, so it no longer fails if the IngredientsHead hop breaks. The hop is wired correctly today, and `08-test-audit.mjs` cannot see this kind of change. The closure is small: add an assertion on `RecipeSheet.jsx` that `IngredientsHead` receives `onToggleShowChanges={onToggleShowChanges}`, and retitle the case. Fixing WR-02 (`draft?.stepChanges ?? {}` plus a `recording` case in `RecipeSheet.test.jsx`) at the same time is cheap and protects Phase 10.

---

_Verified: 2026-10-17T16:38:16Z_
_Verifier: Claude (gsd-verifier)_
