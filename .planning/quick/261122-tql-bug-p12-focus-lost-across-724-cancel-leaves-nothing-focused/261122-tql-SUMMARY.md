---
phase: quick-261122-tql
plan: 01
subsystem: ui
tags: [focus, batch-row, cancel, width-rule, 724, notebook]
requires:
  - phase: quick-261122-tqk
    provides: the Notebook's New recipe entry is not drawn below 724, so its Cancel cannot drop focus there
provides:
  - "Cancel on a pen the band opened returns focus to the batch log's own opener from 724 up (Record batch, Record another, Correct)"
  - "Six jsdom cases (W1 to W4, G1, G2) and two Notebook guards (C1, C2) that pin it"
affects: [recipe page focus returns, decide-p12-phone-focus-after-pen-close]
status: complete
commits: 2
plan_head_before: 8ea2ad71b1ace40543d7bd1017bf547c0d422a0e
plan_head_after: c7e9d3e56de2a07fe07bd91b9d4b595f7a6b69fa
actuals:
  tokens: 3000
  tasks: 3
  commits: 2
tech-stack:
  added: []
  patterns:
    - "A focus return latches the opener when the pen opens and decides the target at close from the width at that moment"
key-files:
  created: []
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx
    - app/src/ui/NotebookPlace.test.jsx
key-decisions:
  - "The target when the band's record act is not drawn is the log's own opener for the same pen (Record batch or Record another; Correct for the tasting pen). Next version was rejected."
  - "The choice is made at Cancel from the current width, not at open"
  - "BatchRow.jsx alone changes; VersionRow.jsx, RecipePage.jsx and NotebookPlace.jsx are untouched"
requirements-completed: [bug-p12-focus-lost-across-724]
duration: 30min
completed: 2026-11-22
---

# Phase quick-261122-tql Plan 01: Cancel across 724 leaves a control focused Summary

Cancel on a pen the recipe band opened now puts focus on the batch log's own opener from 724 up, where the band draws no record act, instead of dropping it to the page body. The choice is made at Cancel from the current width, in `BatchRow.jsx` only.

## What changed

`app/src/ui/BatchRow.jsx`: the Correct and Record focus-return effects replaced their boolean refs (`wasAmendingRef`, `wasRecordingRef`) with `amendOpenedByRef` and `recordOpenedByRef`, which hold the opener latched when the pen opened. At close:

- the Correct return focuses Correct when the opener was `correct`, or `record-a-tasting` and the window is 724 or more;
- the Record return focuses the log's Record batch or Record another when the opener was `log`, or `band` and the window is 724 or more.

The `useBelow724()` read (with its comment, extended by one sentence) moved above the two effects so its value is in scope. The two comments above the effects were rewritten. No button, no render condition, no word and no landing effect changed.

Tests: `RecipePage.recordTasting.test.jsx` got a resizable `matchMedia` stub (`resizeTo`, in the shape of `RecipePage.drafts.test.jsx`) and a describe "Cancel after the window crosses 724 returns focus to a control drawn at that width (bug-p12-focus-lost-across-724)" with W1 to W4 (red at the base) and G1, G2 (guards). `NotebookPlace.test.jsx` got C1 and C2 nested in tqk's width describe. Both Notebook guards pass at the base and after.

## Decisions

- **Target:** the log's own opener for the same pen takes the return. Each one opens that pen on that batch at this width, it sits beside the pen just closed, and Record batch and Record another carry the same words the maker pressed.
- **Rejected, for Mark to overrule:** the band's Next version (the first control where the record act stood). It names a different act and pulls the page back up to the band. It would be a one-file change in `VersionRow.jsx`, and it would also cover the residual below.
- **When:** at Cancel, from the width at that moment. Widen and narrow again before Cancel and focus still goes to the band, as built (G1).
- **Where:** `BatchRow.jsx` only. VersionRow's own return already does nothing while its button is not drawn, and its button is drawn exactly while `below724` is true, so the two returns never both act.
- **Home at a desk width (found by reading, proved by W4):** Home draws Record tasting at every width. On the batch page its route state opens the tasting pen with the `record-a-tasting` opener, and Cancel found no band button. W4 failed at the base on this, and the same fix covers it. A kept tasting draft restored at a desk width carries the same opener.

## Evidence

### RED at the base (8ea2ad71)

jsdom, filtered run: `Tests  4 failed | 2 passed | 24 skipped (30)`. W1 to W4 each fail on their `document.activeElement` expectation with focus on the body: `AssertionError: expected <body><div>…(1)</div></body> to be <button type="button" …(2)></button>` at `RecipePage.recordTasting.test.jsx` lines 466 (W1), 480 (W2), 494 (W3) and 507 (W4). G1 and G2 pass. `NotebookPlace.test.jsx` whole: 60 passed, C1 and C2 included.

Probe, base build, WebKit (`base-webkit.txt`) and Chromium (`base-chromium.txt`, installed Chrome via `channel: 'chrome'`) give the same lines:

```
PASS narrow-control-band BUTTON.notebook-action "Record batch" log=false acts=true inViewport=true
FAIL widen-record-batch focus is BODY.- "" log=false acts=false inViewport=false
FAIL cut-record-batch focus is BODY.- "" log=false acts=false inViewport=false
FAIL widen-record-tasting focus is BODY.- "" log=false acts=false inViewport=false
FAIL desk-home-record-tasting focus is BODY.- "" log=false acts=false inViewport=false
PASS one-no-cancel-below-724 no .nb__new and no Cancel button at 393
PASS one-round-trip entry cancelled, focus BUTTON.notebook-action "New recipe" log=false acts=false inViewport=true
INFO tab-after-cancel BUTTON.notebook-action "Record batch" log=true acts=false inViewport=true
INFO desk-correct-control BUTTON.text-control batch-row__correct "Correct" log=true acts=false inViewport=true
```

Exactly four FAIL ids (widen-record-batch, cut-record-batch, widen-record-tasting, desk-home-record-tasting) and three PASS ids in each engine.

### GREEN at c7e9d3e5

- Touched suites (`RecipePage.recordTasting`, `BatchRow*`, `VersionRow*`, `RecipePage.drafts`): 8 files, 475 tests passed.
- Full suite: 136 files, 4549 tests passed, zero failures. The batch baseline was 136 files and 4538 tests; sibling tqk's cases brought it to 4541 on this item's base, and this item adds eight (W1 to W4, G1, G2, C1, C2).
- Fixed build in scratch (`dist-fix`), probe in both engines, exit 0, seven PASS lines and no FAIL in each:

```
WebKit
PASS narrow-control-band BUTTON.notebook-action "Record batch" log=false acts=true inViewport=true
PASS widen-record-batch BUTTON.notebook-action "Record batch" log=true acts=false inViewport=true
PASS cut-record-batch BUTTON.notebook-action "Record batch" log=true acts=false inViewport=true
PASS widen-record-tasting BUTTON.text-control batch-row__correct "Correct" log=true acts=false inViewport=false
PASS desk-home-record-tasting BUTTON.text-control batch-row__correct "Correct" log=true acts=false inViewport=false
PASS one-no-cancel-below-724 no .nb__new and no Cancel button at 393
PASS one-round-trip entry cancelled, focus BUTTON.notebook-action "New recipe" log=false acts=false inViewport=true
INFO tab-after-cancel BODY.- "" log=false acts=false inViewport=false
INFO desk-correct-control BUTTON.text-control batch-row__correct "Correct" log=true acts=false inViewport=true

Chromium
(the same seven PASS lines; both Correct lines read inViewport=true)
INFO tab-after-cancel BODY.- "" log=false acts=false inViewport=false
INFO desk-correct-control BUTTON.text-control batch-row__correct "Correct" log=true acts=false inViewport=true
```

Scope gates: under `app/` against the base only `BatchRow.jsx`, `NotebookPlace.test.jsx` and `RecipePage.recordTasting.test.jsx` differ. `VersionRow.jsx`, `RecipePage.jsx`, `useBatchRecording.js`, `useRouteIntents.js`, `NotebookPlace.jsx`, `domain`, `store`, `styles` and `app/dist` show no diff. Both builds went to `${TMPDIR}/sprinkles-tql`; port 4173 and `app/dist` were not touched. The probe stays in scratch (`${TMPDIR}/sprinkles-tql/probe-tql.mjs`).

Every probe result is Playwright WebKit or Chromium on a Mac. Nothing here is device-verified.

## Viewport finding for the orchestrator

After widening, the returned Correct sat outside the viewport in WebKit (`inViewport=false` for widen-record-tasting and desk-home-record-tasting) and inside it in Chromium. Record batch sat inside it in both engines. Correct in the desk-correct-control run (pressed first, so scrolled to) is in the viewport in both. This item adds no scrolling, as the plan says. Whether Correct should be scrolled into view after a band-opened pen is cancelled is for Mark to decide, and the iPad check below shows it.

## What remains of case one after 261122-tqk

- Below 724 the New recipe entry, its Cancel included, is not drawn (probe one-no-cancel-below-724 passes in both engines).
- The round trip is pinned by C2 (and by probe one-round-trip): narrow, widen, Cancel returns focus to New recipe, as built. C1 pins the plain desk return. `NotebookPlace.jsx` is not changed.
- tqk brings a narrowing with focus inside the entry that drops focus to the body at the narrowing, not at Cancel. It has the same shape as the editor's own narrowing, which Mark left as built (decide-p12-narrowing-closes-editor). Not fixed here.
- Two paths not width-related, seen by reading only, are outside this item and not fixed: (a) Cancel pressed while Start's write is still out; (b) Start pressed while a draft is kept elsewhere. Both end with the draft row replacing the head's controls, and focus then drops to the body.

## Residual, not covered

An address naming no batch of the version (a hand-typed address only, test O3). From 724 up that address draws no record opener in the log at all, so a band pen opened at 393, widened and cancelled still leaves focus on the body. The audit leaves hand-typed-only paths unfiled. A change to the band's Next version as the target would cover it; see "Rejected" above.

## Deviations from Plan

None. The plan executed as written. The base probe and base jsdom runs came out exactly as the plan expected, so no setup line needed correcting.

## Deferred Human Verification

For the orchestrator to put on Mark's List if it wants one (a check row, `needs: "hands"`, title the result Mark will see). One iPad Split View check:

1. Open the app on the iPad in Split View with the window narrower than 724, on a recipe version that has no batch.
2. Press Record batch in the recipe band. Expect: the record pen opens.
3. Widen the window to 724 or more. Expect: the pen stays open and the band's Record batch is no longer drawn.
4. Press Cancel in the pen. Expect: the pen closes and the batch log's own Record batch is focused (ring visible).
5. Repeat on a version whose batch awaits tasting, with Record tasting. Expect: Cancel focuses Correct. It may sit off screen on the iPad (WebKit probe: not in the viewport).
6. Press Tab once after step 4. Expect: none, not legible by hand (the probe's Tab left the page for the browser chrome in both engines).

## Notes for the orchestrator

- Mark's List row `bug-p12-focus-lost-across-724` is for the orchestrator to close once this lands, with `resolvedAt` read from `date -u` and a one-line reply. The executor did not touch the list.
- The build is safe to deploy: no stored shape, DB_VERSION or wording changed.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- `app/src/ui/BatchRow.jsx`, `app/src/ui/RecipePage.recordTasting.test.jsx`, `app/src/ui/NotebookPlace.test.jsx`: present and modified.
- Commits d5d56389 (test) and c7e9d3e5 (fix) are on the branch.
