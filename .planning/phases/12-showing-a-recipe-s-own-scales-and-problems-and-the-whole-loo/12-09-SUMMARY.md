---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 09
subsystem: ui
tags: [phone, below-724, route-wrapper, desk-only, playwright-webkit, board-conformance]
requires:
  - phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
    provides: "12-04 (board engine spec shape), 12-05 (12-check.sh), 12-08 (walk baseline); useBelow724 from the recipe-page work"
provides:
  - "DeskOnly route wrapper: below 724 the New recipe and Edit addresses show the placeholder place reading 'Done at the desk or on the iPad.'; from 724 up the editor"
  - "Placeholder takes an optional note (default sentence unchanged)"
  - "Notebook below 724: no New recipe, no Resume on a kept draft's row, no Resume editing or nb__row--resume"
  - "Home below 724: a tasted row has no actions span, a tasted lead holds Adapt alone"
  - "12-phone-probe.mjs page (WebKit 393/723/724/1366) and 12-board-places.mjs (five panels on the 12-07 engine)"
  - "PHONE-01 in REQUIREMENTS.md (text, traceability row, coverage 32) and in ROADMAP's Phase 12 Requirements line"
affects: [12-10, 12-14, 12-15, 12-16]

tech-stack:
  added: []
  patterns:
    - "render gate, not CSS: fetching components own useBelow724, presentational ones take a below724 prop defaulting to the desk arrangement"
    - "route wrapper on the route element (not inside the route component) so nothing under it mounts and no effect of the wrapped route runs"

key-files:
  created:
    - app/src/ui/DeskOnly.jsx
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
  modified:
    - app/src/ui/Placeholder.jsx
    - app/src/router.jsx
    - app/src/ui/NotebookPlace.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/NotebookPlace.test.jsx
    - app/src/ui/RecipeList.test.jsx
    - app/src/ui/notebookPaths.test.js
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "The entry form already open when the window narrows stays open; only the New recipe button is gated (plan's recorded decision)"
  - "desk-edit's board panel uses a fixed address with ids that name no stored version: DeskOnly mounts nothing under it below 724, so a saved version behind it changes no pixel; the probe walks the real saved version's address"
  - "A hidden Keep developing (display: none at Home's 760 cut) has no box on either side, so the board spec boxes only the rows' filled actions"

patterns-established:
  - "A device-unverified probe prints 'NOTE device-unverified' first and exits 1 on any FAIL; PROBE_DIST resolving to app/dist is refused before anything is served"

requirements-completed: []
requirements-partial: "PHONE-01 is shared with 12-10, 12-15 and 12-16 (not yet executed); REQUIREMENTS.md keeps it unchecked/Pending by the plan's own instruction"

actuals:
  tokens: 15800
  tasks: 3
  commits: 4

duration: 15 min
completed: 2026-11-22
status: complete
commits: 4
plan_head_before: 989f866adba00633adb19c533a920ef047b3a44a
plan_head_after: 4a2a149cc97da5d6f7e35fd88fb57b9b86a151a4
---

# Phase 12 Plan 09: Below 724 the desk's jobs leave the Notebook and Home Summary

**Below 724 the New recipe and Edit addresses show one line, "Done at the desk or on the iPad.", through a route wrapper that mounts no editor and touches no kept draft; the Notebook and Home drop New recipe, Resume, Resume editing and Next version; PHONE-01 is written into the requirements.**

## Performance

- **Duration:** about 15 min
- **Tasks:** 3 of 3
- **Files:** 13 changed in four code commits (857 insertions, 38 deletions)

## Accomplishments

- **The one-line page.** `DeskOnly({ title, children })` sits on the route element for `/notebook/new` (title "New recipe") and the edit address (title "Edit"). Below 724 it returns the built placeholder place with the desk line, so `CreationRoute` and `EditRoute` never mount and none of their `listDrafts`, `getDraft`, `saveDraft`, `deleteDraft` calls or redirects run. From 724 up it returns its children.
- **Nothing typed is lost across the cut.** Narrowing an open editor unmounts it and the existing `useKeptDraft` unmount flush writes what was typed. Proved in jsdom for the New recipe address (the stand-in's `saveDraft` awaited, stored name equals the typed text, field holds it again on widening) and in WebKit for both addresses (narrowed 24 ms after typing; stored; back in the field).
- **Notebook below 724:** `div.nb__head` holds the title alone; a kept new-recipe draft's row has rail, name as text and "draft" with no `span.nb__draft-act`; a recipe with a kept edit takes class exactly `nb__row` with no `span.nb__row-act`. The empty Notebook is covered at both `NotebookList` call sites.
- **Home below 724:** a tasted row has no `span.home__actions`; a tasted lead holds Adapt alone; Record batch and Record tasting with Keep developing rows and leads are as built. From 724 up everything is as built.
- **Boards held in WebKit.** 12-board-places.mjs holds nb, nb-draft, home (notebook-home-more-393.html) and desk-new, desk-edit (one-line-page.html) at 393 within 1 px, with the tasted rows' actions absent by position (rows 2, 3 and 8), and 723 overflow checks. 283 PASS, 0 FAIL, and `PASS selftest places-<pid>` for all five panels.
- **PHONE-01** is in REQUIREMENTS.md (new "On the phone" heading, unchecked item, traceability row Pending, coverage 32 and Phase 12: 5, last-updated line) and in ROADMAP's Phase 12 Requirements line.

## Task Commits

1. **Task 1 (tracer): the one-line page at the two editor addresses** - `6424651f` (feat)
2. **Task 2: the Notebook and Home below 724** - `88cf647b` (feat)
3. **Task 3: board spec and PHONE-01** - `81568e0d` (feat)
4. **Deviation fix: router source pin** - `4a2a149c` (fix)

## Verification Results

- Task 1 tracer: `CreationFlow.test.jsx`, `Shell.test.jsx`, `RecipePage.test.jsx` pass (252); scratch build; `12-phone-probe.mjs page` printed 14 PASS lines and no FAIL (cold visit at 393 on both addresses with the drafts dump identical; editor at 724 and 1366 on both; New recipe and Edit crossings; no overflow at 393 and 723). Tracer verified end to end before expanding.
- `PROBE_DIST=app/dist node 12-phone-probe.mjs page` exits 1 with "FAIL PROBE_DIST resolves to app/dist".
- Task 2: `NotebookPlace.test.jsx`, `RecipeList.test.jsx`, `RecipeList.nextVersion.test.jsx` pass (121); the `useBelow724()` grep count is 1 and the `below724` count is 12 in each of the two files.
- Task 3: `12-board-check.mjs 12-board-places.mjs --selftest` on the scratch build: 283 PASS, 0 FAIL; DOCS PASS; the other grep criteria (PHONE-01 once, "On the phone" once, "31 total" zero, no `more` panel, anchor present) hold.
- Whole suite: **134 files, 4440 tests, all passing** (baseline 4425; +15).
- `11-walk-check.sh`: `MATCH 94 snapshots` (plus the five NEW scenarios round one already added). No walked screen changed.
- Every result is Playwright WebKit or jsdom: **device-unverified**. No device row is written for PHONE-01.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] A source-text pin on router.jsx named the old route declaration**
- **Found during:** whole-suite run after Task 3
- **Issue:** `app/src/ui/notebookPaths.test.js` located the `/notebook/new` route by the literal `{ path: '/notebook/new', Component: CreationRoute }`; wrapping the route in DeskOnly (the plan's own change) made `indexOf` return -1. The file is not in the plan's `files_modified`.
- **Fix:** the pin now looks for `{ path: '/notebook/new', element: <DeskOnly title="New recipe"><CreationRoute /></DeskOnly> }`; its assertion (declared before `/notebook/:recipeId`) is unchanged.
- **Files modified:** `app/src/ui/notebookPaths.test.js`
- **Commit:** `4a2a149c`

**2. [Rule 3 - Spec detail] Board spec boxes the rows' filled actions, not every action**
- **Found during:** Task 3's first board run (3 FAIL on `.home__row .home__action[1|4|6] box`)
- **Issue:** each awaiting-tasting row's Keep developing is `display: none` at Home's 760 cut on both sides, so its box is 0x0 at unrelated page offsets; the comparison was meaningless, not a build difference.
- **Fix:** `.home__row .home__action` keeps count, text and font; boxes are checked on `.home__row .home__action:not(.home__action--secondary)`.
- **Files modified:** `12-board-places.mjs` (committed in Task 3, so no separate commit)

**3. [Spec detail] desk-edit panel address**
- The plan asked for the edit address of a first version made and saved through the editor at 1366. The board panel's route must be known before the page loads, and below 724 DeskOnly mounts nothing under the address, so the panel uses a fixed address with ids that name no stored version. The real saved version's address is walked by 12-phone-probe.mjs.

**Total deviations:** 3 (1 auto-fixed bug, 2 spec details). **Impact:** none on scope; every plan truth holds.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path or store shape; T-12-25 (no kept draft touched from a cold visit), T-12-26 (typed text survives a crossing) and T-12-29 (no write to app/dist, probe refuses it) are mitigated and tested as the plan's register says.

## Issues Encountered

None open. `app/dist` was never written (every build passed a scratch `--outDir`); no Vite process was started; Mark's own `vite preview` was left alone.

## Left to the orchestrator

Executors have no ArtifactData, so the plan's "For the orchestrator after this plan's SUMMARY" steps were not attempted:
- Mark's List `todo-phone-hide-entry-points` closes only when 12-09, 12-10, 12-15 (wave 4) and 12-16 (wave 5) have all landed (read the row for its version and the clock before writing).
- Deploy: no store shape, DB_VERSION or store-file-version change; main is safe to deploy once 12-10, 12-15 and 12-16 have also landed (until then the phone still offers some of the left-out controls).

## Next Phase Readiness

Ready for 12-10, 12-11 and 12-15 (wave 4). 12-14 runs `12-phone-probe.mjs page` and `12-board-places.mjs` in 12-check.sh round two; 12-16 builds the recipe head's part of PHONE-01. PHONE-01 stays Pending in REQUIREMENTS.md until all four plans have landed.

## Self-Check: PASSED

Created files and the four code commits plus the SUMMARY commit exist on HEAD.
