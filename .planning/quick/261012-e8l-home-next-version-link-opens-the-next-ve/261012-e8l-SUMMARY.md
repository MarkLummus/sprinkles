---
phase: quick-261012-e8l
plan: 01
subsystem: ui
tags: [react-router, route-state, drafts, webkit-probe]
requires:
  - phase: 04
    provides: draft keeping and the startTasting consume-once effect
provides:
  - Home's Next version link opens the Next version pen on arrival
affects: [RecipePage, RecipeList]
key-files:
  created:
    - app/src/ui/RecipeList.nextVersion.test.jsx
    - .planning/quick/261012-e8l-home-next-version-link-opens-the-next-ve/261012-e8l-probe.mjs
  modified:
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.drafts.test.jsx
key-decisions:
  - "Flag name startNextVersion, mirroring startTasting"
  - "Consume once: consumed ref plus navigate replace with state null, copied from the startTasting effect"
  - "Any kept draft on another version of the same recipe means no auto-open"
requirements-completed: [REC1-02, UX1-02]
status: complete
completed: 2026-10-12
commits: 3
plan_head_before: 0fb0858c905a41de36071a23f5d32ae0d3f8d270
plan_head_after: c9fa81620fa7662b7cc40d6827d3c75e804efd3b
actuals:
  tokens: 6500    # approx, chars/4 over the changed lines (code, tests, probe)
  tasks: 3
  commits: 3
---

# Quick 261012-e8l: Home's Next version link opens the Next version pen

One tap on a Tasted recipe's Next version link on Home now lands on its latest version page with the Next version pen already open. The pen is the button's own, with the Sheet title copied from the version and a blank version name.

## What changed

- `app/src/ui/RecipeList.jsx`: the TASTED branch's Next version Link passes `state={{ startNextVersion: true }}`. `to`, class, literal `tabIndex={0}` and text are unchanged. One sentence added to the RowActions comment.
- `app/src/ui/RecipePage.jsx`:
  - `startNextVersionOnMount` is read from `location.state`.
  - `draftsLoaded` and `versionsLoaded` flags mirror `batchesLoaded`.
  - A new effect sits after the startTasting effect. It waits for the draft restore and both reads, then consumes the request once. It replaces the history entry's state with null before the pen opens, and calls `handleStartDeveloping()` only when it is still in `reading` and no draft is kept on another version of this recipe.
- Tests: describe block A-G in `RecipePage.drafts.test.jsx`; new `RecipeList.nextVersion.test.jsx` (4 tests); WebKit probe in this directory.

## Decisions (Claude's discretion, per the plan)

1. Flag name `startNextVersion`, mirroring `startTasting`.
2. Consume once: `useRef(false)` guard plus `navigate({ pathname, search }, { replace: true, state: null })`, copied from the startTasting effect. The guard covers StrictMode's double effect. The replace means Back, Forward and reload carry no flag.
3. Kept-draft rules:
   - A draft kept on this version is decided by the existing restore. A fitting one reopens its own pen (mode is no longer `reading`, so nothing more opens). A stale one is deleted by the restore, and the flag then opens a fresh pen.
   - Any kept draft record, of any kind, on another version of the same recipe means no pen opens and the page shows as it does today (the band names the waiting draft). That draft is untouched.
   - A draft on another recipe's version does not count (test G).
4. HomeLead finding: HomeLead has no Next version link of its own. It renders `<RowActions entry={entry} />`, so when the lead is Tasted its Next version is the same link to the same destination and carries the same flag. Test 1 in `RecipeList.nextVersion.test.jsx` clicks both the row's and the lead's link and checks each. RecipeHistory, BatchRow and VersionRow have no Home link to change.

## Verification

- Tests, touched files: `RecipePage.drafts.test.jsx` + `RecipeList.test.jsx` + `tabindex-scan.test.js` = 117 passed (3 files). `RecipeList.nextVersion.test.jsx` + `RecipeList.test.jsx` = 49 passed (2 files).
- Full suite (`npm --prefix app test`): 79 files, 2523 tests, all passed.
- Test F (a draft on another version of the recipe) was seen failing before the guard, with the pen opening; the other six passed on the Task 1 code.
- WebKit probe, scratch builds only (never `app/dist`, never port 4173), against `PROBE_DIST` in the scratchpad.
  - RED, unchanged code:
    ```
    FAIL 1366 coarse: pen open after one tap
    FAIL 393 coarse: pen open after one tap
    261012-e8l probe: 2 failed
    ```
  - GREEN, final code:
    ```
    261012-e8l probe: 22 checks passed
    ```
- Recipe used: Olive Oil Ice Cream (circulator), read Tasted in the seed at both viewports, so the probe printed no recipe NOTE. The first tap landed at both viewports, so there was no tap-count NOTE.
- The probe checks at 1366x1024 and 393x852, both coarse: href is the latest version path; one tap lands there; exactly one pen; Sheet title non-empty; Version name blank; `history.state.usr` null; Back shows Home; Forward and reload show no pen after a 1000 ms settle; no dialog.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Probe selectors for Sheet title and Version name**
- **Found during:** Task 1, first GREEN run
- **Issue:** The probe looked for the Sheet title field inside the `form[aria-label="Next version"]`, but the Sheet title lives in the headnote outside that form, so the lookup timed out.
- **Fix:** Query `[aria-label="Sheet title"]` and `input[aria-label="Version name"]` on the page. The RED result was unaffected (it fails earlier, at the pen check).
- **Files modified:** 261012-e8l-probe.mjs
- **Commit:** 0f6fcb2 (fixed before the commit)

Otherwise: none. The plan was executed as written. The plan's Task 1 and 2 effects were written in two steps as planned (Task 1 without the other-version guard, Task 2 adds it).

## Known Stubs

None.

## Threat Flags

None. No new endpoint, store path or trust boundary. The state is read only as a Boolean, and the pen opens through the existing handler.

## Deferred Human Verification

Proposed iPad check for the orchestrator to put on Mark's List (an executor does not write to it). From the build served by `npm --prefix app run build && npm --prefix app run preview -- --host`: on Home, one tap on Olive Oil's Next version opens the Next version pen on the version page. Back returns to Home. Forward shows the version page without the pen.

## Self-Check: PASSED

- Files found: `app/src/ui/RecipeList.nextVersion.test.jsx`, the probe, `RecipeList.jsx`, `RecipePage.jsx`, `RecipePage.drafts.test.jsx`.
- Commits found: 0f6fcb2, 46b252c, c9fa816.
- Commits touch only the four planned files under `app/`.
