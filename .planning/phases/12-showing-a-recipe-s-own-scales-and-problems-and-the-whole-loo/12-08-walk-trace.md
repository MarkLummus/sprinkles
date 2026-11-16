# 12-08 walk trace: the Phase 11 walk baseline moves from cf64aa70 to e37db11a

Every result below is Playwright WebKit (playwright-core 1.63.0), device-unverified. No iPad, no device row.

The Phase 11 walk (`11-walk.mjs`) is the regression gate in `12-check.sh`. It failed 15 scenarios on e37db11a (the commit before Phase 12) and on main alike, because its selectors were stale. This file records the repair, proves the baseline can be reproduced, proves Phase 12 moved nothing the walk sees, and traces every difference between the committed baseline and e37db11a to the app commit that made it. `12-08-trace-check.mjs` checks the trace by command.

## 1. Selectors and expectations changed in `11-walk.mjs`

Only the way a control is found changed. No step, `walk.expect`, scenario or seed rule was removed; `compareResult`, `diffLeaves`, `takeSnapshot` and `ALLOWED_NEW_SCENARIOS` are byte-unchanged (their hashes are pinned in the plan's acceptance criteria). No `walk.expect` line changed (none failed once the selectors were repaired).

| Old selector (cf64aa70 form) | New selector (as at e37db11a) | Commit (date) |
| --- | --- | --- |
| `input[aria-label="Version name"]` (NAME_FIELD, creation band) | `[aria-label="Version name"]` | 37a05413, 09a95c30 (2026-11-01) |
| `input[aria-label="Recipe name"]` (creation band, Rename) | `[aria-label="Recipe name"]` | 09a95c30, 1c8fcf03 (2026-11-01) |
| `input[aria-label="Whole milk, grams, portion 1"]` (MILK_FIELD) | `[aria-label="Whole milk, grams, portion 1"]` | 37a05413 (2026-11-01) |
| `input[aria-label="Sucrose, grams, portion 1"]` (SUCROSE_FIELD) | `[aria-label="Sucrose, grams, portion 1"]` | 37a05413 (2026-11-01) |
| `${PEN} input[aria-label^="Out of machine"]`, `^="Duration"`, `^="Tempering"` | the same with the tag dropped, prefix match kept | d62d123d (2026-11-01) |
| `input[aria-label="Whole milk, as made, grams, portion 1"]` | `[aria-label="Whole milk, as made, grams, portion 1"]` | 9ad146c4 (2026-11-01) |
| `input[aria-label="${name}, grams"]`, `input[aria-label="${MILK_NAME}, grams, portion 1"]`, `... portion 2"]` (makeVanilla) | tag dropped | ed93b024 (2026-11-01) |
| `input[aria-label="Step 1, lead-in"]`, `input[aria-label="Step 2, lead-in"]` | tag dropped | 22ec33f5 (2026-11-01) |
| `.nb__new input` (New recipe entry, four places) | `.nb__new textarea` | 30423924 (2026-11-01) |
| `Step 1, add a step after it` | `Step 1, Add step after it` | d3b52474 (2026-10-31) |
| `Step 2, change the ingredients` | `Step 2, change ingredients` | 79fdd1d9 (2026-10-28) |
| `Add ${NAME} to a step` (the chooser opener) | `Add to step, ${NAME}` | 26eabd80 (2026-10-31) |
| `Add ${NAME} to step N` (a step's choice) | `Step N, <lead-in>: add ${NAME}` (`Step 1, Warm the milk: add ...`, `Step 2, Churn: add ...`) | 62833ee1 (2026-10-31) |

Left as they were: the churn and tasted date fields under `.field-row__label--date` (still `input type="date"`), the Skipped checkbox (`input[aria-label="Step 1, skipped"]`), the axis and segmented radios.

Result: all 17 scenarios record on a build of e37db11a (112 snapshots) and on a build of main (112 snapshots) with no FAIL line.

## 2. The reproduction: today's WebKit records what it recorded on 2026-10-26

`git log -1 --format=%h -- .planning/phases/11-steps-structure-save-and-print/11-walk-before.json` names 4d3b44f7 (11-07, 2026-10-26), the commit that recorded the committed baseline. A detached worktree at 4d3b44f7 ran its own record script (the walk and the script as they stood then, cf64aa70 with `11-walk-order.patch`):

```
WALK_OUT=R3.json WALK_KEEP_TEXT=1 sh .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh
RECORDED R3.json 94 snapshots
node 11-walk.mjs compare 11-walk-before.json R3-plain.json      (text and methodText keys stripped from R3)
MATCH 94 snapshots
```

So the engine and the environment did not move; every difference below is the app's.

## 3. Phase 12 neutrality: nothing after e37db11a moved a walked state

Task 1 recorded the repaired walk with `--keep-text` on a build of e37db11a and on a build of main at HEAD d7cd5341e204e62d63edde7e7dc58256afecaaf8 (both into scratch folders; app/dist untouched), then compared the two recordings, page text and method text included:

```
node 11-walk.mjs compare R1.json R2.json
MATCH 112 snapshots
```

No DIFF and no NEW (both hold all 17 scenarios: the twelve baseline scenarios and the five Phase 11 scenarios). So Phase 12's commits and the quick tasks after e37db11a moved no walked page text, method text, field, focus, status, button or stored record on any of the 17 scenarios.

The app commits after e37db11a that are neither a Phase 12 plan commit nor an executor worktree merge, all covered by that MATCH (`git log --format='%h %s' e37db11a..HEAD -- app/`):

- 1200f350 test(quick-261116-80u): over-long own scale words and problems are refused at Save
- 1acb082b feat(quick-261116-80u): refuse over-long own scale words and problems at Save
- 6b07e2d0 test(261116-80v): a Low to high scale's pen stops draw no number
- f3b9b384 feat(261116-80v): a Low to high scale's pen stops draw no number
- 9fdbd576 revert(261116-80v): the creation editor's Low to high stops line reads faint to strong again
- aa94c98d test(261116-80v): a printed Low to high row prints no 1 and 5
- 7caf6c11 feat(261116-80v): a printed Low to high row prints no 1 and 5

`git diff --stat af101f6e e37db11a -- app/` is empty: e37db11a's app tree is the newest app commit before Phase 12's.

## 4. The drift: 1870 differences, eleven changes, nine commits

The committed baseline (cf64aa70 plus the order of 11-07) against the e37db11a recording, text keys stripped (`node 11-walk.mjs compare 11-walk-before.json R1-plain.json`), prints 1870 `DIFF` lines. All are leaf lines of one of eight paths: `snapshot.buttons[*]`, `snapshot.focus.tag`, `snapshot.focus.text`, `snapshot.textHash`, `snapshot.methodHash`. No store leaf, URL, status, field, invalid list or pen count differs.

How each line was traced. The walk was recorded (twelve baseline scenarios, text kept) on all 94 distinct app trees that `git log cf64aa70..e37db11a -- app/` and their parents reach, with the repaired selectors (the Save button is found by `/^Save as (a )?new version$/` on builds older than 2d50ac10; that scratch copy of the walk differs from the committed one in nothing else but a scenario filter). For each DIFF line, the commit that moves that leaf from a value other than its e37db11a value to the e37db11a value, by comparing each commit's tree with its parent's, is exactly one non-merge commit for all 1870 lines (merge 7910eb48 only carries c5373fb2). The ledger of those results: 3e2eb6d4 512 lines, dcafd03d 672, 2d50ac10 565, 37a05413 42, 9ad146c4 50, d62d123d 14, 44c71a11 9, c1bf9258 4, c5373fb2 2.

A hash line (`textHash`, `methodHash`) is attributed to the commit whose change is the last to move that step's hash into its e37db11a value. Every commit that moves such a hash is itself a group below: for the 32 steps whose text hash ends at 2d50ac10 the earlier mover is 3e2eb6d4 (G1), for the 9 method hashes ending at 44c71a11 the earlier mover is 2d50ac10 (G5). The only other mover is 4d3b44f7 (the row order of 11-07, which the baseline already holds: in all 162 hash steps the recording at 4d3b44f7 equals the committed baseline). Class A is the 2026-11-01 one-row-textarea fixes (bug-ipad-tab-lost-from-single-line-fields); class B is every other post-Phase-11 quick fix. Both are re-baselined (Mark, 2026-11-16: "All pre-Phase-12 fixes").

| Group | What changed (old to new) | DIFF lines / steps | Commit, date, subject | Class | Intended | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | row button `remove` to `Remove` | 512 / 32 | 3e2eb6d4, 2026-10-28, Remove and Restore read sentence case on rows, notes, scales and problems | B | yes | `IngredientTable.jsx:233` `{removed ? 'Restore' : 'Remove'}`, and the row's `remove` to `Remove` in the same file (hunk of 3e2eb6d4) |
| G2 | step buttons `edit this step` to `Edit this step`, `remove` to `Remove`; method text `edit`/`remove` to `Edit`/`Remove` | 672 / 32 | dcafd03d, 2026-10-28, the version pen's step controls read sentence case, names without articles | B | yes | `Method.jsx` `Edit this step` and `{draftStep.removed ? 'Restore' : 'Remove'}` (hunk of dcafd03d) |
| G3 | button `Record a batch` to `Record batch`; text line likewise | 4 / 2 | c1bf9258, 2026-10-31, the record act reads Record batch at Home, on the band and in the Batch margin | B | yes | `BatchRow.jsx` `Record batch` (hunk of c1bf9258; `BatchRow.jsx:530` still reads it) |
| G4 | button `Save as a new version` to `Save as new version`; text line likewise | 64 / 32 | 2d50ac10, 2026-10-31, the pen labels read Save as new version, Remove this row and Done differently | B | yes | `VersionRow.jsx:316` `'Save as new version'}` |
| G5 | button `done differently` to `Done differently`; method text `Skippeddone` to `SkippedDone` | 501 / 48 | 2d50ac10, 2026-10-31, same commit | B | yes | `Method.jsx` `Done differently` (hunk of 2d50ac10) |
| G6 | focused field tag `input` to `textarea`; focused text `""` to the typed value (the walk reads a textarea's textContent) | 42 / 26 | 37a05413, 2026-11-01, the version pen's Version name and grams fields are one-row textareas | A | yes | `IngredientTable.jsx:197` `onChangePenGrams(...stripNewlines(...))` |
| G7 | focused as-made grams field `input` to `textarea`, text `""` to `100` | 2 / 1 | 9ad146c4, 2026-11-01, the record pen's as-made grams fields are one-row textareas | A | yes | `IngredientTable.jsx:473` `onChangeAsMade(...stripNewlines(...))` |
| G8 | page text: a blank innerText line per as-made grams row (14 per record-pen step) is gone | 48 / 48 | 9ad146c4, 2026-11-01, same commit | A | no | `notebook.css:266` `textarea.ingredient-table__as-made-field {`; measured: 9ad146c4's parent `281` lines, 9ad146c4 `267` lines on `record-pen-edit-handlers` / `set-up` |
| G9 | focused field tag `input` to `textarea`, text `""` to the typed value (Duration, Tempering, Melt test) | 14 / 7 | d62d123d, 2026-11-01, the record pen's Duration, Tempering and Melt test are one-row textareas | A | yes | `BatchRow.jsx:16` `import { holdReturn, stripNewlines } from './oneLineField.js';` |
| G10 | method text: the typed Done differently line now appears (`blend 60 s ...`); the walk reads a textarea's textContent, an input's value is not in it | 9 / 9 | 44c71a11, 2026-11-01, the record pen's Done differently line is a one-row textarea | A | no | `Method.jsx:489` `const value = stripNewlines(event.target.value);` |
| G11 | focus after Save over this version: `h2` (`Version 2 · walk child · Latest`) to the `Next version` button | 2 / 1 | c5373fb2, 2026-11-10, the version row lands on its identity once per arrival, so Cancel returns focus to Next version | B | yes | `VersionRow.jsx:155` `landingPendingRef.current = false;` |

Notes on "Intended". G8 and G10 are side effects of how the walk reads a textarea, not changes a maker sees: their commits' subjects say nothing about page text, and they are re-baselined under Mark's rule and listed for him. G11 is the Save-over path of the mechanism the subject names (the landing on the identity heading is spent once per arrival, later pen closes leave focus to the opener); the subject names Cancel, the walk's step is Save over, so Mark may want to confirm that focus after Save over should rest on Next version.

The group lines the checker reads:

```
group G1 commit 3e2eb6d4 class B intended yes evidence {removed ? 'Restore' : 'Remove'}
group G2 commit dcafd03d class B intended yes evidence Edit this step
group G3 commit c1bf9258 class B intended yes evidence Record batch
group G4 commit 2d50ac10 class B intended yes evidence 'Save as new version'}
group G5 commit 2d50ac10 class B intended yes evidence Done differently
group G6 commit 37a05413 class A intended yes evidence onChangePenGrams(row.id, portionIndex, stripNewlines(event.target.value))
group G7 commit 9ad146c4 class A intended yes evidence onChangeAsMade(row.id, portionIndex, stripNewlines(event.target.value))
group G8 commit 9ad146c4 class A intended no evidence textarea.ingredient-table__as-made-field {
group G9 commit d62d123d class A intended yes evidence import { holdReturn, stripNewlines } from './oneLineField.js';
group G10 commit 44c71a11 class A intended no evidence const value = stripNewlines(event.target.value);
group G11 commit c5373fb2 class B intended yes evidence landingPendingRef.current = false;
```

## 5. The checker's last line

`node 12-08-trace-check.mjs --selftest drift-plain.txt attribution.tsv 12-08-walk-trace.md` prints six `PASS selftest ... refused` lines and ends:

DIFF lines: 1870; attributed: 1870; unattributed: 0

## 6. The rule

The baseline moves from cf64aa70 to e37db11a, the commit before Phase 12, because the cf64aa70 recording went stale against post-Phase-11 quick fixes that never re-recorded it. Mark decided on 2026-11-16 that every pre-Phase-12 fix is re-baselined, the 2026-11-01 one-row-textarea fixes (class A) and the other quick fixes of 2026-10-27 to 2026-11-15 (class B). Each difference above is attributed by a command to an app commit in `git log cf64aa70..e37db11a -- app/` that is not a Phase 11 plan commit, with evidence that commit added.

Nothing between e37db11a and HEAD is absorbed: the baseline is recorded from a detached worktree build of e37db11a, never from the working tree; section 3's MATCH is what lets the seven neutral quick-task commits stay out of the baseline, and `11-walk-record-base.sh` refuses any other app commit after BASE that is not a Phase 12 plan commit or an executor worktree merge. Round two's plans that change a walked screen move BASE the same way, with the same trace.
