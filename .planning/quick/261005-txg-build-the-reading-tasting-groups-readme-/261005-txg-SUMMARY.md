---
phase: quick-261005-txg
plan: 01
quick_id: 261005-txg
subsystem: ui
tags: [batch-reading, tasting, group-names, cue-face, sketch-011-decision-58]
requires: []
provides:
  - "The reading's measured grid holds Tempering, Tasting temperature, Melt test and Melt style; the Melt group is gone"
  - "The marked axes stand under Every recipe and This recipe only; the picked problems under Any problems? in two blocks named the same way"
  - "The four names take the pen's cue face through .notebook-log .batch-row__group-label--cue"
affects: [app/src/ui/BatchRow.jsx, app/src/styles/notebook.css]
tech-stack:
  added: []
  patterns: ["modifier-scoped face rule placed after the base label rule at equal specificity", "sibling rule puts the block gap on whichever block follows another"]
key-files:
  created: []
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/styles/notebook.css
    - app/src/ui/BatchRow.test.jsx
    - app/src/styles/notebook.test.js
key-decisions:
  - "Sketch 011 README decision 58, Mark's answers B (melt) and B2 (names), 2026-10-06, built as briefed; options A and C not built"
requirements-completed: [BATCH2-02, OBS1-01]
metrics:
  duration: "about 25 minutes"
  completed: 2026-10-05
status: complete
commits: 2
plan_head_before: 4abf5a26684d3357bf5ad80ce45044ae8da42664
plan_head_after: 643923cce6f17ed6ddc00451b0fc073d77988157
actuals:
  tokens: 4700
  tasks: 3
  commits: 2
---

# Phase quick-261005-txg Plan 01: The reading's tasting groups under the pen's names Summary

In a batch's reading, the Tasting fold now shows Tempering, Tasting temperature, Melt test and Melt style as one measured grid. The marks stand under "Every recipe" and "This recipe only", and the picked problems stand under "Any problems?" in two blocks with the same names. The four names read in the pen's 14px dark sentence-case cue face. "Any problems?" and Next time keep the small grey capitals.

## What changed

`app/src/ui/BatchRow.jsx`, `TastingReading`:

- The Melt test and Melt style cells moved, markup unchanged, into the `tasting-reading__conditions` grid after Tasting temperature. The Melt group (wrapper, h4, its own grid) is deleted. A blank value still reads "not measured".
- The Observations group is gone. `markedAxes` is split by `axis.group` into core and declared. Each is drawn as a `div.tasting-reading__group` with an h4 of class `batch-row__group-label batch-row__group-label--cue` ("Every recipe", then "This recipe only"), only when it holds a mark.
- The Problems group is now "Any problems?" (h4, class `batch-row__group-label` only, so it keeps Next time's face). Under it, one `div.tasting-reading__subgroup` per non-empty list, core first: an h5 with the cue classes, then `span.app-hand.tasting-reading__problems` with the words joined by " · ". `batch.tasting.defects` is the Every recipe block. `bitterDeclared` (shown as `DECLARED_FLAW`, "Bitter") is the This recipe only block. With nothing picked the group is left out.
- No inline style anywhere; the spacing is CSS. Every word renders as a React text child.
- The TastingReading comment lost the old parenthetical about Bitter and the classification not being repeated. It now cites decision 58 and says what the reading heads with which names. The old Problems JSX comment is a one-line Any problems? comment citing decision 58.

`app/src/styles/notebook.css`, directly after `.notebook-log .tasting-reading > .region-name`:

- `.notebook-log .batch-row__group-label--cue` carries decision 40's `.axes-cue` face: font-size `var(--app-size-meta)`, weight 600, text-transform none, letter-spacing 0, line-height `var(--app-notebook-pen-cue-line-h)`, color `var(--app-text)`. It has the same two-class specificity as the base grouped label rule above it; its place after that rule makes it win, and the comment says so.
- `.notebook-log .tasting-reading__subgroup + .tasting-reading__subgroup` has margin-top `var(--gap-l)` (the 32px between blocks).
- `.notebook-log .tasting-reading__subgroup > .tasting-reading__problems` has margin-top 0 (the board's inline zero).
- No new token, no literal other than 600, 0 and none.

## Choices at my discretion

- Modifier name `batch-row__group-label--cue`, as the plan said.
- The gap is a sibling rule, so it falls on whichever block follows another. A lone "This recipe only" block (the seeded batch) gets no top margin, as on the board.
- The zero top margin on the problems line is kept from the board, so a name sits its own 6px label margin above its words.
- Two small local helpers inside `TastingReading`, `markGroup(name, axes)` and `problemBlock(name, words)`. Each is used twice, so the two groups and two blocks cannot drift apart.
- `notebook.test.js` (the plan's approved extra file) is the home of the CSS pins, since it already pins decision 40's face.

## Commits

- 9cb65a1 `test(261005-txg)`: R1 to R5, G1 to G9, N1 to N3 (BatchRow.test.jsx and notebook.test.js only)
- 643923c `feat(261005-txg)`: the component and the stylesheet (BatchRow.jsx and notebook.css only)

The test commit comes before the feat commit. No fix commit was needed. Nothing pushed. The commit count (2) is measured from `git rev-list --count 4abf5a2..HEAD`.

## Test cases and their RED results

RED run before the component change: 14 failed, 243 passed in the two files (257 tests). Every guard and every pre-existing case passed. After the change all 257 pass.

| Case | Result before the change | Note |
| ---- | ------------------------ | ---- |
| R1 (Melt test cell follows the Tasting temperature cell) | failed | regex did not match: the Melt test cell was in the Melt group |
| R2 (seeded: Any problems?, This recipe only block, Bitter; no ">Problems</h4>") | failed | markup lacked the Any problems? group |
| R3 (defects plus Bitter in two blocks; no "Greasy film · Bitter") | failed | markup lacked the two blocks |
| R4 (nothing picked: no Any problems?, subgroup or problems span) | passed | guard |
| R5 (order: conditions, Melt test, note, Every recipe, This recipe only, Any problems?; no ">Melt</h4>") | failed | `expected -1 to be greater than -1` (no Every recipe h4) |
| G1 (marks in two groups, no Observations) | failed | markup lacked the two groups |
| G2 (all six marked: Hardness, Scoopability, Smoothness, Sweetness; then Body, Oil) | failed | `expected -1 to be greater than -1` |
| G3 (core marks only: Every recipe h4, no This recipe only h4, h5 present) | failed | markup lacked the cue h4 |
| G4 (declared marks only: This recipe only over Oil) | failed | regex did not match |
| G5 (nothing marked: no mark names, no axes grid) | passed | guard |
| G6 (core defects only: Every recipe block alone) | failed | markup lacked the block |
| G7 (the exact four-cell conditions grid) | failed | grid held two cells |
| G8 (no Melt h4, no `tasting-reading__melt`) | failed | the Melt group was still drawn |
| G9 (no marks, no problems: no group; four cell labels) | failed | the Melt group was still drawn (`not to contain 'tasting-reading__group'`) |
| N1 (cue face rule and its source order) | failed | `a rule for the declaration font-size: expected undefined to be defined` |
| N2 (second-block gap, zero line margin) | failed | `a rule for the declaration margin-top: expected undefined to be defined` |
| N3 (base label rule keeps uppercase and grey) | passed | guard |

R1 to R5 amend existing cases in place in the read-view describe. G1 to G9 are the new describe after it. N1 to N3 are the new describe at the end of notebook.test.js. Each carries a comment naming decision 58.

## Verification

- `npm --prefix app test -- BatchRow.test notebook.test`: 2 files, 257 tests, exit 0.
- `npm --prefix app test` (full, tabindex-scan included): 63 files, 1878 tests, exit 0.
- `npm --prefix app run build`: exit 0.
- Acceptance greps: the cue class string in BatchRow.jsx 2; `>Observations<` 0; `read view does not` 0; `dangerouslySetInnerHTML` outside comments 0; `^.notebook-log .batch-row__group-label--cue {` in notebook.css 1; "decision 58" present in all four files.
- Scope: `git status --porcelain -- app/` empty; `git diff --name-only 4abf5a2..HEAD -- app/` lists only the four planned files; nothing changed in tokens.css, app.css, domain or store. `git show --name-only` on both commits lists only their own paths. Nothing under `.planning/canvas-generators` or `.planning/sketches` changed.

## Board against build

Command shape: `node <scratchpad>/txg-conform.mjs <scratchpad>/txg-dist 1366,393 webkit,chrome`. `txg-dist` is a `cp -R` of the new `app/dist`. `txg-conform.mjs` is a scratchpad copy of `tgroups-conform.mjs` with:

- absolute imports for the probe harness and `tgroups-page.mjs`;
- PANELS reduced to the three B2 panels (`b2`, `seed-b2`, `sparse-b2`), all driven with overlay `none`;
- a `faces` read per heading (trimmed text, font-size, line-height, font-weight, text-transform, letter-spacing, colour) and one added faces-equal check per panel.

It served the copy on throwaway 127.0.0.1 ports. No :4173 or :8077 process was touched and no Vite was started.

Result: exit 0, 122 checks passed, 0 off, in Playwright WebKit and system Chrome at 1366 and 393, for all three B2 panels. Heading faces matched on every panel, and so did section size, group tops and heights, measured cells, Next time's top and (in WebKit) the section's words. Section sizes: full 350x691 (WebKit) and 350x701 (Chrome) at 1366; seeded 350x479.5 and 350x487.5; sparse 350x305.5 in both. At 393 the width is 353 and the heights are the same.

## Deviations from Plan

None - plan executed exactly as written. One note on process: the executor protocol's pre-commit assertion would refuse a commit on `main`; the orchestrator's instruction for this run was explicit that it runs sequentially on `main` with pathspec commits, so that instruction was followed. The tree held other agents' uncommitted files throughout; none were staged.

## Notes

- The batch brief `.impeccable/surfaces/route-recipe-batch.md` still says the recipe-specific classification "is not repeated as a suffix in reading". Decision 58 routes that amendment to the /impeccable document pass (Mark's List row run-impeccable-surface-removal). The twenty-five boards that draw the reading with the old names are retaken by Sid after this build (decision 58 (c), `redraw.sh`). This quick edited neither the brief, nor the README, nor any board.
- No stubs added. No new threat surface: every word renders as a React text child (T-261005-txg-01); the split reads the fields the pen writes, and G2, G3, G4, G6 and R3 pin each side (T-261005-txg-02); the new rules are scoped under `.notebook-log` and a modifier (T-261005-txg-03).

## Not verified

- iPad and iPhone: not checked on a device. Only static-markup tests and the scratch Playwright WebKit and Chrome comparison ran.
- VoiceOver's heading navigation over the new h4 and h5 names.
- Widths 724 to 1365 with the tasting open (no board draws it; the four-across grid applies there).

## Deferred Human Verification

Suggested checks for decision 58. Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

On the iPad (1366, the 350px log column) and the iPhone (393), open Olive Oil v1's seeded batch with Tasting open:

1. Tempering, Tasting temperature, Melt test and Melt style stand at the top, two rows of two, and no Melt heading is drawn.
2. Every recipe (Sweetness) and This recipe only (Oil) read in 14px dark sentence case, the pen's cue face.
3. Any problems? reads in the small grey capitals Next time has; under it stand This recipe only and Bitter in the hand.
4. Record a batch with every mark and all five problems: both mark groups appear, and under Any problems? the Every recipe block (four words), then 32px lower the This recipe only block (Bitter).
5. Record one with only Hardness and Smoothness: only Every recipe is drawn, and there is no Any problems? group.

No Mark's List rows filed; the orchestrator does that.

## Self-Check: PASSED

- 9cb65a1 and 643923c exist in `git log`.
- BatchRow.jsx, notebook.css, BatchRow.test.jsx and notebook.test.js exist and are committed; SUMMARY exists at the path above.
