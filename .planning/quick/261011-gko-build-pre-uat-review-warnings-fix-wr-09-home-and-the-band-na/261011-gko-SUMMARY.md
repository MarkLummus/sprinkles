---
phase: quick-261011-gko
plan: 01
quick_id: 261011-gko
subsystem: drafts, recipe page, store boot
tags: [WR-04, WR-05, WR-08, WR-09, drafts, indexeddb]
requires: []
provides:
  - draftMatchesVersion checks values as well as shape
  - Home, the band and the History rail name only a draft that will reopen
  - a failed store read on the recipe page shows one line and starts no restore
  - a blocked database upgrade shows what to do; this build steps aside for a newer one
affects: [app/src/domain/draft.js, app/src/ui/RecipeList.jsx, app/src/ui/RecipePage.jsx, app/src/store, app/src/main.jsx]
key-files:
  created:
    - .planning/phases/04-prepare-the-next-version-for-making/04-boot-blocked-probe.mjs
  modified:
    - app/src/domain/draft.js
    - app/src/domain/draft.test.js
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipeList.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.drafts.test.jsx
    - app/src/ui/Shell.jsx
    - app/src/ui/PrintSheet.jsx
    - app/src/store/db.js
    - app/src/store/repository.js
    - app/src/main.jsx
    - app/src/store/db.test.js
    - app/src/store/repository.test.js
    - app/src/styles/binder.test.js
decisions:
  - payload-only value checks; the amend baseline stays shape-only
  - Home and the band filter with draftMatchesVersion rather than importAll deleting drafts (WR-03)
  - a failed read replaces the page rather than continuing with empty batches
  - repository.onBlocked is sticky (flag plus one listener slot)
  - blocking closes the connection first, then reloads
requirements: [UX1-02]
status: complete
actuals:
  tokens: 60000
  tasks: 3
  commits: 4
plan_head_before: 723cac0bfa97a516c6280451b097ba162175a27d
plan_head_after: 416501bc7b6eba0962d6e85db9d8920ae0a75bb4
commits: 4
completed: 2026-10-11
---

# Phase quick-261011-gko Plan 01: Pre-UAT review warnings Summary

Four Phase 04 review warnings fixed: a restored draft can no longer save a batch the import check rejects (WR-04), Home, the band and the rail name only drafts that reopen (WR-09), a failed recipe-page read says so and starts no restore (WR-05), and a blocked database upgrade tells the maker to close other tabs and finishes by itself (WR-08, proved in WebKit and Chrome).

## Commits

| Commit | Message |
| ------ | ------- |
| 0fde5c8 | docs: record Mark's approval of the import-block and too-long wording (Shell.jsx, PrintSheet.jsx, comments only) |
| 5583e07 | fix: a draft fits only when its values could be saved, and Home names only a draft that fits (WR-04, WR-09 Home) |
| 9b661db | fix: the band names only a draft that fits, and a failed read on the recipe page says so (WR-09 band, WR-05) |
| 416501b | fix: a blocked upgrade says what to do, and this build steps aside for the next one (WR-08) |

The comments-only commit went first, as the orchestrator asked, so it is `HEAD~3` rather than the plan's `HEAD~1`.

## Test counts

- Baseline at base 723cac0: 78 files, 2472 tests, all passing.
- Final: 78 files, 2493 tests, all passing (tabindex scan and cross-cutting token scan included). `npm --prefix app run build` to a scratch directory succeeds. No CSS file changed. Only `app/src/store/db.js` imports `idb`.

### Red runs (new cases failing before the code)

- Task 1: `draft.test.js` 6 new cases failing (29 tests, 6 failed); `RecipeList.test.jsx` 4 failing (45 tests, 4 failed; the flipped Correct-draft case among them). Both pass after the change (74 tests).
- Task 2: `RecipePage.drafts.test.jsx` 7 failing (34 tests: 2 band cases, 5 failed-read cases) plus an unhandled rejection from the unguarded stale-draft delete. All pass after; the five-file verify run is 204 tests.
- Task 3: `db.test.js` 2 failing, `repository.test.js` 1 failing (onBlocked not a function); all pass after (20 tests with `tests/db-reset.test.js`).

## Probe

Commands (from the repo root; `SCRATCH` is any scratch directory, not `app/dist`, no port 4173 or 8077):

```
npm --prefix app run build -- --outDir "$SCRATCH/gko-dist" --emptyOutDir
PROBE_DIST="$SCRATCH/gko-dist" node .planning/phases/04-prepare-the-next-version-for-making/04-boot-blocked-probe.mjs
```

Output (exit 0):

```
webkit: control and blocked cases done
chrome: control and blocked cases done
boot-blocked-probe: 10 checks passed
```

Per engine: control (no held connection) boots to Home with the blocked line never shown; a same-origin page holding `sprinkles` at version 7 makes the boot paragraph read the blocked line with no Home; closing that connection brings Home's title and removes the boot paragraph. Chrome and Playwright's WebKit do not prove Mobile Safari; the iPad check is already on Mark's List.

## Structural choices

- **Payload-only value checks, baseline shape-only.** `fitsRecordValues` runs on the record or Correct payload. The Correct draft's `amendBaseline` keeps the shape check only: it is the comparison the dirty check reads and is never written. A record draft reads the version's declared problems and axes; a Correct draft reads the corrected batch's snapshot (absent snapshot gives no declared problems, core axes only, and never throws).
- **Filter with `draftMatchesVersion`, not `importAll` deleting drafts.** Home and the band run the same check the restore runs, so a named draft always reopens. Deleting drafts inside import belongs with WR-03.
- **A failed read replaces the page.** Continuing with empty batches would offer Save over on a churned version and would let the restore delete a kept Correct draft. The page shows PAGE_LOAD_ERROR (the boot failure's own sentence) in the existing `not-found` container, no link, no new class; the restore does not start while `loadFailed` is set.
- **Sticky `repository.onBlocked`.** A flag plus one listener slot, so boot can register after the event already fired and main.jsx never imports db.js.
- **`blocking` closes, then reloads.** The connection closes first so the other tab is never left waiting; up to the last 250 ms of typing can be lost to the reload (the bound RecipePage's pagehide comment already accepts).

## Pending wording

New words awaiting Mark's approval: `Close other Sprinkles tabs to finish updating.` (`STORE_BLOCKED_LINE`, `app/src/main.jsx`, WR-08 boot line). The recipe page's failure line reuses the existing boot failure sentence, so it adds no new words.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] binder.test.js pins the count of `app-boot` in main.jsx at 2**
- **Found during:** Task 3 full-suite run
- **Issue:** The new blocked line adds a third use of the class in `main.jsx`, so `src/styles/binder.test.js` ("main.jsx carries the app-boot class exactly twice") failed.
- **Fix:** Updated that test to expect three (boot line, blocked line, failure message) and renamed it. No behaviour change.
- **Files modified:** app/src/styles/binder.test.js (a seventh path in the Task 3 commit)
- **Commit:** 416501b

**2. Commit order.** Per the orchestrator, the comments-only commit was made first (before Task 1), not inside Task 2 after the Task 2 tests.

**3. Dependencies.** The worktree had no `app/node_modules`; `npm --prefix app ci` installed from the existing lockfile. No package was added or changed.

## Known Stubs

None.

## Threat Flags

None. The new `blocking` handler reloads the tab only in response to a version-change event from the same origin's own database.

## Deferred Human Verification

None added. The device checks for this item are already on Mark's List; no row was written (the executor has no ArtifactData tool).

## Self-Check: PASSED

- 0fde5c8, 5583e07, 9b661db, 416501b all ancestors of HEAD; `git rev-list --count 723cac0..HEAD` is 4.
- `04-boot-blocked-probe.mjs` exists; grep checks from the plan hold (PAGE_LOAD_ERROR exported once, 8 non-comment `setLoadFailed(true)`, no bare `repository.deleteDraft(versionId);`, `blocking(` once in db.js, `repository.onBlocked(` once in main.jsx and before `await seedIfEmpty`, `from './battery.js'` once in draft.js).
- Working tree clean after the four commits.
