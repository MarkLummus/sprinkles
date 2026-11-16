---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 01
subsystem: ui
tags: [react, vitest, scales, low-to-high, presentation]
status: complete

requires:
  - phase: 09
    provides: scale definitions carrying a kind (goldilocks | magnitude)
provides:
  - "Kind-aware readers in app/src/domain/axes.js: stopWordsFor (null stops 2 to 4 for Low to high), stopLabelFor, middleWordFor, readMarkText"
  - "Record pen: a Low to high scale names only its two ends on the anchors line and in its stop names"
  - "Reading: a marked Low to high scale reads 'faint (1)', '2 of 5' to '4 of 5', 'strong (5)' from the batch's own snapshot"
  - "Creation editor: a Low to high stops line reads 'faint · 2 · 3 · 4 · strong'"
affects: [12-02 printed log (imports middleWordFor), 12-03, 12-04, 12-05, 12-06]

plan_head_before: e37db11a6f808f36d20c808a2812608557c22c28
plan_head_after: 2cbbdd3a8551cd9855f8032d97db047b8ad63a3d

actuals:
  tokens: 7000
  tasks: 3
  commits: 5

tech-stack:
  added: []
  patterns:
    - "The kind branch lives only in domain/axes.js; components call the readers and test no kind"
    - "Kind-keyed expected-output tables in axes.test.js whose keys must equal SCALE_KINDS, so a third kind fails the suite until decided"

key-files:
  created: []
  modified:
    - app/src/domain/axes.js
    - app/src/domain/axes.test.js
    - app/src/ui/AxisMark.jsx
    - app/src/ui/AxisMark.test.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/ui/CreationSetup.test.jsx

key-decisions:
  - "isMagnitude is true only for kind === 'magnitude'; every other kind, a missing one included, reads as Right in the middle (T-12-03)"
  - "scaleStopsLine has one path for both kinds: stopWordsFor with each null stop replaced by its number, so creation.js holds no stop numbering"
  - "Task 3 (flagged assumption A1) is one commit holding creation.js and its two test files, so a veto is a git revert of 2cbbdd3a"

requirements-completed: [TASTE-04]

duration: 25min
completed: 2026-11-16
---

# Phase 12 Plan 01: A Low to high scale reads in its kind Summary

**Low to high scales name only their ends on the record pen, read back as "faint (1)" / "2 of 5" / "strong (5)" from the batch snapshot, and show "faint · 2 · 3 · 4 · strong" in the creation editor, from four small kind-aware readers in axes.js.**

## Accomplishments

- Task 1 (tracer): `stopWordsFor` returns `[low, null, null, null, high]` for a magnitude definition; new `stopLabelFor` ('1: faint', '2', '3', '4', '5: strong') and `middleWordFor` (null for Low to high, 'right' otherwise). `AxisMark` names stops by `stopLabelFor` and draws a middle anchor span only when `middleWordFor` gives a word. No CSS change: the anchors row is flex space-between.
- Task 2: new `readMarkText`; `TastingReading` prints it from `axesForBatch(batch)` only, so a stored mark never reads from the live version.
- Task 3: `scaleStopsLine` maps null stops to their numbers; the four test strings moved to the numbered-ends form.
- "This recipe only" stays conditional, as built, and is now pinned for a version whose own scales include a Low to high one (pen stacked and row-major, reading, empty cases).
- Edge rows resolved in tests: adjacency (two Low to high scales, `aria-label="2"` twice page-wide, once inside each scale's group; Right in the middle keeps '2: leaning thin' and is tested apart), empty (no cue, Every recipe only), ordering (stacked and reading: core then own in stored order; desktop pen keeps its row-major order).

## RED / GREEN

- RED 1 (578b5d7c): 13 tests failed on the planned assertions (stopWordsFor returned the goldilocks five for a magnitude definition; anchors line had 'right'; stop names had 'leaning'; stopLabelFor not a function). Semantic assessment: the target tests ran and failed for the intended reason. GREEN 1: 3985dde0.
- RED 2 (6c013dcc): 10 tests failed (readMarkText not a function; the reading printed 'right (3)', 'strong (4)', 'faint (2)' for Low to high). Semantic assessment: intended failures. GREEN 2: 75efc237.
- Task 3: tests moved first and confirmed failing (4 failures on 'faint to strong' and 'thin to rich'), then committed together with the implementation in 2cbbdd3a on purpose, so the A1 veto is one `git revert`. The plan is `type: execute`, so the `tdd-red-evidence` classifier was not run.

## Commits

- 578b5d7c test(12-01): failing tests for a Low to high scale on the record pen
- 3985dde0 feat(12-01): a Low to high scale on the record pen names only its ends
- 6c013dcc test(12-01): failing tests for a Low to high scale on the reading
- 75efc237 feat(12-01): a marked Low to high scale reads back in its kind
- 2cbbdd3a feat(12-01): the creation editor's Low to high stops line names its ends and the numbers

## Verification

- `npx vitest run` in app/: 134 files, 4400 tests, all passing (base was 4360).
- Scratch build into `$TMPDIR/sprinkles-12/dist-01` succeeded (index.html present); app/dist untouched.
- All acceptance greps from the three tasks hold (no `axis.kind` outside comments in AxisMark.jsx or BatchRow.jsx; `axesForBatch(batch)` still the reading's only source).
- No commit of this plan touches app/src/store, app/src/data or app/src/styles (empty `git log` check).
- Note: `npm --prefix app test -- --run ...` hung in this worktree (the `--run` after `vitest run` plus the nvm shell); `npx vitest run <files>` from `app/` was used instead.

## Deviations from Plan

None - plan executed as written. The only departure from the letter of the TDD guide is that Task 3 has no separate RED commit, by the plan's own instruction to commit it alone.

## Known Stubs

None.

## Threat Flags

None. Maker words still render as React text children (pinned for a scale named with b and i tags on the pen and the reading, and the editor's stops line); the reading keeps `axesForBatch(batch)`; no store, DB_VERSION or store-file change.

## Notes for the orchestrator

- Do not close `bug-p11-low-to-high-scale-centre-mark` after this wave. This wave proves the change in unit tests; the final built-app probe is 12-05's 12-check.sh, after which the row closes (plan's "For the orchestrator").
- Tell Mark in chat, one item, no row: A1 (the editor's Low to high stops line is now 'faint · 2 · 3 · 4 · strong'; a veto is `git revert 2cbbdd3a` plus the items in the plan's "If Mark vetoes A1" that touch 12-06).
- Deploy after wave 1: safe. This wave changes no store shape, no DB_VERSION and no store-file version. One print state lasts until 12-02 lands, and only for a recipe that declares a Low to high scale: PrintLogPages.jsx line 148 reads this plan's `stopWordsFor`, which gives null at stop 3, so the printed Tasting log's Low to high row already prints nothing under its middle tick (the decided form), from an empty `span.lf-mid`, and that row is 25 px tall where every other row is 36 px (planner measured 2026-11-15 in Playwright WebKit under print media). The page only gets shorter, so each log stays one page. 12-02 removes the span and holds the row at 36 px.

## Self-Check: PASSED

All five commits are ancestors of HEAD; all nine files_modified paths exist and carry the changes; full suite green.
