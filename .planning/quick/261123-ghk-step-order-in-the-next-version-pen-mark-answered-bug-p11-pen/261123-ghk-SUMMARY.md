---
phase: quick-261123-ghk
plan: 01
subsystem: ui
tags: [version-pen, step-order, sketch-017, shared-code, phase-11-walk]
requires:
  - phase: quick-261123-ghf
    provides: penDraft finite amount fallback
  - phase: quick-261123-ghg
    provides: the removed step's number cell is one figure wide
  - phase: quick-261123-ghh
    provides: the open step's target chip wiring
  - phase: quick-261123-ghi
    provides: the picker as a table row
provides:
  - "The Next version pen moves steps (Move up, Move down on each closed live step) and saves the order"
  - "One copy of the creation editor's Move buttons, words, focus rule and polite structure word (StepMoves.jsx, useStructureWord)"
  - "keptOrderChanged: the one rule for a changed order, read by the pen's dirty check and by slice 2's mark"
affects: [quick-slice-2-was-step-mark, phase-11-walk-baseline, phase-12-gate]
tech-stack:
  added: []
  patterns:
    - "A move request ref acted on by a dependency-free effect after the render that reordered the steps (CreationPage's pattern, now also Method's)"
key-files:
  created:
    - app/src/ui/StepMoves.jsx
    - app/src/ui/RecipePage.stepOrder.test.jsx
  modified:
    - app/src/domain/stepNumbers.js
    - app/src/domain/stepNumbers.test.js
    - app/src/domain/penDraft.js
    - app/src/domain/penDraft.test.js
    - app/src/store/pen-step-roundtrip.test.js
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/ui/Method.preview.test.jsx
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/useVersionPen.js
    - app/src/ui/useAnnouncer.js
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/CreationPage.jsx
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh
    - .planning/phases/11-steps-structure-save-and-print/11-walk-before.json
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
decisions:
  - "Slice 1 only: the pen moves steps and saves the order; the 'was step N' mark is slice 2"
  - "moveStep reused unchanged; no stored key, DB_VERSION or DRAFT_SHAPE_VERSION change"
  - "The pen's polite region is a div, not the creation editor's p, so the Phase 11 walk's innerText hash is unchanged"
  - "The Phase 11 walk baseline moved to 2e030ce6 under the 12-08 rule, after a start MATCH 94 and a trace that attributes every difference to the Move pairs"
metrics:
  duration: "about 2 hours"
  completed: 2026-11-23
status: complete
actuals:
  tokens: 18056
  tasks: 3
  commits: 6
plan_head_before: 0866a02e37196d01cd94b07e3c5f4e7746465d56
plan_head_after: 82114a6d64c76bd85510e6214ee50ded597e9d8d
---

# Phase quick-261123-ghk Plan 01: Step order in the Next version pen (slice 1) Summary

**The Next version pen moves steps and saves the order: Move up and Move down on each closed live step, with the creation editor's own words, grey ends, focus rule and "Step N of M" announcement, as one shared copy of the code.**

## Slice statement

This item does not fit one quick plan. It is split in two. This plan is slice 1. Slice 2 is a separate quick plan that depends on this one and builds the mark: `movedFromNumbers` in app/src/domain/stepNumbers.js, buildDiff in app/src/domain/diff.js reporting `stepOrderChanged` and each step's `movedFrom`, the span " was step N" in Method.jsx on the pen's closed and open steps and in Show changes, its tests, and the 017 panels that carry the words (pm-once, pm-twice, pm-removed and pm-open in full, so-a, so-read and so-table). Until slice 2 lands, a moved step carries no words, and Show changes on a reordered version reads as built.

## What was built

- Each closed live step of the pen reads Edit this step · Move up · Move down · Remove, named `Step N, move up` and so on, N the step's number in the draft's order. The first live step's Move up and the last live step's Move down are `mk-off` and `aria-disabled="true"`, stay Tab stops and do nothing. A removed step reads Edit this step · Restore. An open step ends Cancel · Done. The pen has no `aria-keyshortcuts` and no keys line.
- A press runs the creation editor's `moveStep` through `versionPen.edit`: the step moves one place among the live steps, passing a removed step in the same press, and no stored key changes. The pen draws `draftVersion.method` in the draft's order, so the margin numbers, every control's name and (through `IngredientTable.jsx`'s existing `stepsForGrouping`) the Ingredients table's step heads follow with no table change.
- Focus stays on the pressed Move button of the moved step, or goes to the step's other Move button when the pressed one turns grey. "Step N of M" is said in a polite region (a `div`, last in the Instructions section). A grey press moves nothing and says nothing.
- A changed order is unsaved work: `isPenDraftDirty` returns true when `keptOrderChanged(penDraft.method, version.method)`. The kept draft is written, Escape leaves the pen open, a kept draft with a new order restores on reload, moving the steps back leaves no change, and both saves store the method array in the new order.

## Designer findings, checked

| Finding | Result |
|---|---|
| Order is the method array's order and nothing stored changes | True. `displayNumbers` follows the array, `moveStep` keeps every `n`, `savedMethod` saves `penDraft.method` as it stands. Pinned in penDraft.test.js (every other key and every step deep-equal to the opened step) and in the round trip |
| Method maps the opened version's steps | True before this plan. Now the developing branch maps `draftVersion.method` |
| RecipeSheet hands the table `version.method` | True and harmless: in the pen the table groups through `draftVersion.method`. T2 pins the step heads moving from `Step 4Sweeten` to `Step 2Sweeten` |
| isPenDraftDirty misses order | True. Red case failed before `keptOrderChanged`; fixed |
| buildDiff pairs steps by key and says nothing of place | True. It lives in app/src/domain/diff.js, not lineage.js as the batch row says. Untouched: slice 2's |
| A kept draft with a new order restores; a backup imports | True. `draftMatchesVersion` and `validateStoreFile` pass; pinned in pen-step-roundtrip.test.js and T4 |

## The shared code

Moved out of CreationSteps.jsx and CreationPage.jsx into app/src/ui/StepMoves.jsx (`StepMoveButtons`, `stepMoveWord`, `moveFocusTarget`) and `useStructureWord` in app/src/ui/useAnnouncer.js. The creation editor's markup is byte for byte as before (`keys` passes its `aria-keyshortcuts`). `CreationSteps` reads `StepMoveButtons` with `keys`; `CreationPage` reads `stepMoveWord` in `handleMoveStep`, `moveFocusTarget` in its step-act focus branch and `useStructureWord` for every structure word.

Proof the creation editor held: CreationStructure.test.jsx, CreationSteps.test.jsx and CreationFlow.test.jsx (212 tests) pass unchanged, before and after, and none was edited. The 12-tab-probe (9 PASS) and 12-keys-probe `move keys lines` (101 PASS) pass in WebKit; the rowcontrols and keys boards pass in WebKit and Chrome. The side-by-side reads the creation editor's step 2 acts line as Add step · Move up · Move down · Remove, with `aria-keyshortcuts` Control+Meta+ArrowUp and ArrowDown, and "Step 2 of 3" with focus on Step 2, move up after pressing Step 3, move up, in both engines.

## Red then green, pins, suite counts

Task 1, red (commit c8ae8cf4): T1 to T5 failed (no Move buttons); stepNumbers.test.js failed on the missing `keptOrderChanged` (7 cases); the penDraft dirty case failed; the round trip case "a kept pen draft ... reads as unsaved work" failed on `isPenDraftDirty`. Passing as pins: the moveStep over a seeded draft, moveStep passing a removed step in one press, and the round trip export, check and import in both save kinds.

Task 1, green (77f51091): all of the above pass. Two existing Method tests changed (see Deviations).

Task 2, red (8262103f): F1 and F2 failed (no focus rule); F3 failed at the polite word and its no-Move and one-press assertions passed as bounds; F4 and F5 passed as bounds.

Task 2, green (2e030ce6): F1 to F5 pass; the creation editor's tests pass unchanged.

Suite: baseline 137 files, 4643 tests; now 138 files, 4668 tests, all passing (the gate's suite step reports the same).

## Gate changes

12-board-penpreview.mjs (c5de7f0a):
- The first PEN_ELEMENTS selector is scoped to `.method-steps > li:first-child .method-step__body button`, with the same four check kinds (count, text, aria-label, box). The Preview step board draws step 2 closed with Edit this step and Remove alone, so it could no longer hold the whole region.
- The default export is now an array of two specs. The second holds sketch 017's pen-step-order.html: `steporder-pm-moves` (123 PASS in WebKit), `steporder-pm-once-focus` (4), `steporder-pm-twice-focus` (4), `steporder-pm-table` (15), and each prints its `PASS selftest` line. The panel flow replays p12pm-capture.mjs steps 1 to 3.
- The creation helpers `label`, `pickRow`, `add` and `use` are lifted to module scope as `helpers(page)` with the same bodies; `openPen` reads them from it.
- Results with every check kind kept: the penpreview file alone, before the change 100 PASS 0 FAIL (the Preview step spec), after it 230 PASS 0 FAIL (the Preview step spec and the 017 spec). WebKit, all three board specs with `--selftest`: 2428 PASS, 0 FAIL (evidence in `${TMPDIR}/sprinkles-ghk/evidence-webkit`, here /private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/c53b815f-c9c0-4392-9afe-1d608eb4dfd9/scratchpad/ghk/evidence-webkit). Chrome through the shim, same command: 2428 PASS, 0 FAIL (evidence-chrome, same folder).
- pm-removed and pm-open are not held (slice 2 holds them).

## Side by side, board against app (1366 x 1024, coarse pointer in WebKit; scratch script, not in the repo)

pm-moves, pm-once, pm-twice, pm-table agree with the board in both engines: every li, margin number, lead, acts line and button within 1 px, the same texts, aria-labels and aria-disabled. 20 Tab stops in pm-moves, landing order is markup order, each acts line is one row of 44 px buttons ending at 332.7 (WebKit) and 326.4 (Chrome) from the region's left, which is the plan's 356.7 and 350.4 from the page, no sideways scroll. Focus after one press is on Step 3, move up with "Step 3 of 5"; after two it is on Step 2, move up with "Step 2 of 5". Save as new version from the pm-twice state: the saved page reads Steep, Sweeten, Strain, Rest, Churn numbered 1 to 5 with no Move button, and its print page lists them in that order with no "was step" text.

Expected differences, all named:

| Where | Difference | Whose |
|---|---|---|
| pm-once, pm-twice, pm-removed, pm-open | every `span.method-step__skipped-label` reading " was step N" is in the board and not in the app | slice 2 |
| pm-open | the open Sweeten step is 18 px (17 px in Chrome) shorter in the app, and everything under it is that much higher: the board's open step carries a " was step 4" line inside its fields | slice 2 |
| pm-removed | the removed step's number cell is 0 x 0 in the board and one figure wide (WebKit 12 x 23, Chrome 11.1 x 24) in the app, so its body starts 12 px (11.1 in Chrome) to the right and the li is 4 px taller (88, as a live step), which moves the removed step's lines by 4 px and the step under it by 4 px | 261123-ghg |
| every state | the `.method-region` section's own height differs (board 544.7, app 614.6 in WebKit): the app's section is a grid item stretched to its row; the `ol.method-steps` inside is the same height on both sides except as named above | layout, not a drawn thing |

Anything else: none. Nothing in the app differs from the board outside the table above.

## The Phase 11 walk

- Start compare: a build of the start commit 0866a02e recorded with `--keep-text`, `text` and `methodText` removed from each snapshot, compared with the e37db11a baseline: `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`. It printed MATCH 94 before anything moved.
- Trace (scratch script over the start and after recordings, 112 snapshots each): snapshots compared 112, snapshots changed 32, Move pairs inserted 320, `TRACE OK`. Every leaf other than buttons, methodHash and methodText is deep-equal, stores included; the after buttons equal the start buttons with Move up, Move down inserted after each Edit this step directly followed by Remove; the after methodText equals the start's with each `Edit this step·Remove` read as `Edit this step·Move up·Move down·Remove`; the method hash moves exactly where the text moves. The 32 changed snapshots are version-pen-kept-draft 3, version-pen-blocked 17 and version-pen-notice-edits 12, as the plan predicted. The polite region being a div left the innerText hash unchanged elsewhere.
- BASE moved from e37db11a to 2e030ce6, the last commit of this plan that touches app/ (`git log -1 --format=%h -- app/`). 11-walk-before.json was re-recorded by `11-walk-record-base.sh` from a detached build of BASE: its diff is exactly 320 "Move up", 320 "Move down" and 32 methodHash changes. 11-walk-check.sh then printed `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`.

## 12-check.sh

`GATE2 PASS`. Suite 138 files and 4668 tests; walk MATCH 94 snapshots; board step 4280 PASS 0 FAIL; tab probe 9 PASS; keys probe 101 PASS; no FAIL line anywhere in the run. The full run was made once, in the background, after the walk baseline moved.

## States the boards do not draw, and what the build does

- One live step: both Move buttons grey; a press does nothing and announces nothing (F5).
- Every step removed: no Move anywhere; Edit this step · Restore on each; Restore brings a step back live where it stands (F3, F5).
- A moved step whose words also changed: the words read as typed with the parent's struck words beneath, as built. Its "was step N" is slice 2's.
- Save over this version with a new order on a version with a batch: cannot happen (Save over is not drawn once a version has a batch, and the store refuses with VERSION_HAS_BATCH_STATUS). With no batch, Save over stores the new order; a sheet printed before keeps the old numbers. Save as new version from a version with a batch leaves the batch on the parent; its step notes are held by step key and read against the parent's order (README question 3).
- A step already removed when the pen opened, with a live step moved past it and back: `moveStep` puts the moved step at its live neighbour's place, so the struck step ends up after the moved one. The live order equals the opened version's, so the pen holds no change from order. The struck step's new place is stored only if the maker saves for another reason. No row recommended.
- A step open while another moves past it: it stays open with its words (F4).
- The board's Move buttons carry no `data-act`; the built ones carry `move-up` and `move-down`. Not visible.
- A refused Save names the first blank step field in the draft's order, the order the maker sees.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Existing expectation] Two Method tests counted the closed step's buttons**
- **Found during:** Task 1 (full suite)
- **Issue:** `Method.test.jsx` "a closed step in the plan pen renders its two buttons" expected 2 buttons; `Method.preview.test.jsx` "draws no Add target and no reorder control in the open step" looked for a Move control anywhere in the container, where the closed steps beside the open one now carry theirs. The plan named this as the one allowed kind of existing-test change.
- **Fix:** the first now expects the four buttons (edit this step, move up, move down, remove), each `tabindex="0"`, and is renamed; the second looks for Move inside the open step's own `li` only, and asserts a closed step 2 still has its Move up (README decision 7: an open step has no Move).
- **Files modified:** app/src/ui/Method.test.jsx, app/src/ui/Method.preview.test.jsx
- **Commit:** 77f51091

**2. [Rule 1 - Plan expectation] The round trip's "kept draft" case is red before the change, not a pin**
- **Found during:** Task 1 red
- **Issue:** the plan listed the three round trip cases as pins; the third asserts `isPenDraftDirty(...)` is true, which cannot pass before `keptOrderChanged`.
- **Fix:** none needed; recorded here. The two export, check and import cases are pins.

**3. [Rule 1 - Test expectation] `moveStep` puts the moved step at its live neighbour's place**
- **Found during:** Task 1 red
- **Issue:** my first pin expected a step moved past a removed one to land beside it; `moveStep` swaps with the live neighbour's place, as the plan's undrawn-states note says.
- **Fix:** the pin reads `[c, a, b]`.

**Plan and executor-context adjustments (not deviations of behaviour):**
- The plan's Task 3 builds the start commit in a detached worktree; the batch notes forbade nothing there but this worktree was already at the start commit, so the start walk was recorded from a build made before any change (the same tree). The detached build of BASE for the baseline used 11-walk-record-base.sh as written.
- `11-walk-record-base.sh` also gained a header paragraph for the move; NEUTRAL and every other line are unchanged.
- The executor context said to run the full 12-check.sh only if the plan changes what the Simulator, PDF or Phase 11 walk steps read. This plan changes the walk baseline, so the full run was made once and passed.

**Total deviations:** 1 test update the plan allowed, 2 notes about test expectations. **Impact:** none on the build.

## Known Stubs

None.

## Threat Flags

None. The change adds no endpoint, no auth path, no file access and no store shape.

## Auth gates

None.

## Device-unverified

Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad.

## Dist safety

A dist built from these commits is safe to deploy once the suite and GATE2 pass (both did): it adds no store write and no shape change, DB_VERSION and DRAFT_SHAPE_VERSION are untouched, and a saved reordered version is a normal version.

## For the orchestrator

- I have no ArtifactData; no Mark's List row was written or closed. Keep bug-p11-pen-steps-no-reorder open until slice 2 lands (the move works, but a moved step carries no "was step N" words and Show changes on a reordered version reads as built). decide-p12-pen-order-mark is built by slice 2.
- The Phase 11 walk baseline moved under the 12-08 rule (to 2e030ce6, 32 snapshots gaining the Move pairs); Mark may want to know.
- What slice 2 needs (all in this plan's code, none built): `movedFromNumbers` in app/src/domain/stepNumbers.js reading the same rule as `keptOrderChanged`; `buildDiff` in app/src/domain/diff.js (not lineage.js) reporting `stepOrderChanged` and each step's `movedFrom`; the span " was step N" in Method.jsx, which now draws the pen's `draftVersion.method` order, on the pen's closed step (inside `p.method-step__lead`, as the board's `method-step__skipped-label`), on the open step (inside `.method-step__open-fields`, after the instruction field: the board's open step is 18 px taller for it) and in Show changes; their tests; and the 017 panels that carry the words (pm-once, pm-twice, pm-removed and pm-open in full, so-a, so-read and so-table). The 12-board-penpreview.mjs 017 spec holds pm-moves, the two focus panels and pm-table now; pm-once and pm-twice would gain a `text` check on the lead, and pm-removed and pm-open are added then (pm-removed less the number cell that 261123-ghg changed: the removed step's li is 4 px taller than the board draws).
- A note for the designer: pm-removed draws the removed step's number cell 0 wide, before 261123-ghg gave it a figure's width; the board could be redrawn from the built page when slice 2 holds that panel.

## Self-Check: PASSED

- Created files exist: app/src/ui/StepMoves.jsx, app/src/ui/RecipePage.stepOrder.test.jsx.
- Commits exist: c8ae8cf4, 77f51091, 8262103f, 2e030ce6, c5de7f0a, 82114a6d (all ancestors of HEAD).
