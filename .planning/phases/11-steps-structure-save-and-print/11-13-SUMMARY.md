---
phase: 11-steps-structure-save-and-print
plan: 13
subsystem: testing
tags: [playwright, webkit, walk, board-conformance, print-check, device-steps, ipad]
status: checkpoint

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-01 walk and board engine; 11-04, 11-05, 11-07, 11-09, 11-10, 11-11, 11-12 the surfaces and their specs
provides:
  - "11-walk.mjs scenario edit-kept (the fifth new scenario), held to the seed rule"
  - "11-device-steps.mjs, the iPad check's steps walked in WebKit on the final build (32 PASS)"
  - "board engine fixes: anchored full pages lift every ancestor's clip and are re-measured; two panels writing one evidence file is a FAIL"
  - "the two folded todos moved from pending to completed"
affects: []

actuals:
  tokens: 21000
  tasks: 2
  commits: 2

plan_head_before: 73edf06f5e51f9a1e7a99b7bdc94131413c6d74b
commits: 2
plan_head_after: 049b34ff9709164ae7bbc714b8d6c40a7b6f66cb

key-files:
  created:
    - .planning/phases/11-steps-structure-save-and-print/11-device-steps.mjs
  modified:
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-board-reading.mjs

key-decisions:
  - "A board FAIL that traced to the engine (framing), not to the build, was fixed in the engine and a spec label; no app CSS or component changed"
  - "The summary keeps automated verification (passed) apart from iPad verification (pending, Mark's row)"

requirements-completed: []

duration: 25min
completed: 2026-10-27
---

# Phase 11 Plan 13: Final proof of the phase Summary (checkpoint)

**On the final build the walk matches 94 snapshots with all five new scenarios passing, every sketch 014 board passes side by side in WebKit (1092 PASS, 0 FAIL) with evidence pairs, the print check passes (32 PASS), and the iPad check's steps were walked in WebKit to their end state (32 PASS); Mark's iPad row is still to be written by the orchestrator.**

**Status: automated verification passed. iPad verification pending (Mark's row, Task 3).** Neither stands for the other.

## Accomplishments

- **Walk.** `sh 11-walk-check.sh` ends `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`. The twelve existing scenarios are untouched (the edit-kept block is a pure addition of 99 lines below the marker line). `edit-kept` makes Vanilla, edits its name, reloads, and records: `kept`, `resumed` (name reads Vanilla bean, notice "Draft kept. Cancel discards it."), `page` (Resume editing present, no Next version, no Record a batch), `import` (no file chooser; "Save or cancel your changes to Vanilla bean before importing."), `notebook` (Vanilla's row holds Resume editing, no draft row, New recipe offered, the drafts store holds one edit record). `walk.expectSeedKept` is called on every stores step (21 calls in the file).
- **Boards.** The five Phase 11 board specs, run in one command with `--selftest --evidence`: `1092 PASS, 0 FAIL` (pA1 to pE1, qA1 to qE1, vA1 to vC1, fA1 to fC1, the reading steps on vC1 and fA1, the closed pen and Show changes typography). Evidence README lists 25 board/app pairs, every size above 0.
- **Print check.** `11-print-check.mjs`: `32 PASS, 0 FAIL`.
- **Device steps.** `11-device-steps.mjs` printed `32 PASS, 0 FAIL` (twice, on the same build). Each step waits for its ready state, activates once, waits up to 5 s; no retry helper.
- **Todos.** Both folded todos `git mv`'d from `.planning/todos/pending` to `.planning/todos/completed`; neither remains in pending.

## Task Commits

1. **Task 1 (tracer): the final build matches every board; edit-kept walk scenario; engine fixes** - `c58c0380` (test)
2. **Task 2: the iPad check's steps walked in WebKit; todos moved to completed** - `049b34ff` (test)
3. **Task 3: checkpoint (the orchestrator writes Mark's List row)** - no commit

Tracer gate: `<verify>` is automated-only, so under `end-of-phase` it was run end to end on the final build (tests, boards, print check, walk) and passed before Task 2.

## Evidence pairs

Written to `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/sprinkles-11/evidence-11` (not committed). Final board line: `1092 PASS, 0 FAIL`. `save-vC1-app.png` is among them and pictures the card "Recipe saved." (looked at). The reading pictures (`save-vC1-reading-*`, `first-version-fA1-reading-*`) show the three steps from the Instructions caption down, below the board window's fold, on both sides.

| Board | Panel | Board picture | Sizes (board; app) |
| --- | --- | --- | --- |
| save.html | vC1-reading | save-vC1-reading-board.png | 528x752.3; 528x787.9 |
| first-version.html | fA1-reading | first-version-fA1-reading-board.png | 528x752.3; 528x787.9 |
| first-version.html | fA1-pen | first-version-fA1-pen-board.png | 528x752.3; 528x623.6 |
| first-version.html | fA1-changes | first-version-fA1-changes-board.png | 528x752.3; 528x787.9 |
| instructions-steps.html | pA1-before, pA1-ingredients, pA1-instructions, pA1-table, pB1, pB1-table, pC1-step2, pC1-table, pD1-table, pE1 | instructions-steps-*-board.png | equal on both sides in each |
| add-remove-move.html | qA1, qB1, qC1, qD1, qE1 | add-remove-move-*-board.png | equal on both sides in each |
| save.html | vA1, vB1, vC1 | save-*-board.png | 1366x900, 1366x900, 1366x1024 on both sides |
| first-version.html | fB1, fA1, fC1 | first-version-*-board.png | 1366x900, 1366x620, 1366x620 on both sides |

## Device steps walked (the PASS lines, quoted)

```
PASS the Notebook opens and the recipes, versions, batches and drafts stores are read first (8 recipes, 19 versions, 12 batches)
PASS New recipe opens the entry
PASS a name, Start, and /notebook/new opens
PASS Add ingredient, Whole milk, 3.5% fat, 600 g
PASS Add ingredient, Sucrose, 150 g
PASS Add ingredient, Vanilla extract, 5 g
PASS Add ingredient, Fine sea salt, 1 g
PASS Add step on the Instructions heading: Warm and its instruction
PASS Step 1, add a step after it: Chill and its instruction
PASS Add to step: Whole milk, 3.5% fat in step 1
PASS Add to step: Sucrose in step 2
PASS Step 2, change the ingredients: tick Whole milk, 3.5% fat, done, and the row is split into two lines
PASS the split row: 400 in "Whole milk, 3.5% fat, grams, portion 1" and 200 in "Whole milk, 3.5% fat, grams, portion 2"
PASS Step 2, add a step after it: Rest and its instruction
PASS Step 3, change the ingredients: tick Whole milk, 3.5% fat, done, and 100 in "Whole milk, 3.5% fat, grams, portion 3" (lines 400, 200, 100; Total 856.0 g)
PASS by tap Step 3, remove: the step goes, the row is back to two lines reading 500 and 200, and the Total stands (lines 500, 200; Total 856.0 g)
PASS by tap Step 1, move down: the steps swap and the numbers follow
PASS by keyboard: Tab to Step 2, move up from Chill, Enter: the steps swap back, focus on the moved step
PASS step 2's group reads Sucrose, then Whole milk, 3.5% fat's line; step 1's group reads Whole milk, 3.5% fat
PASS by keyboard: Tab to "Move Sucrose down", Enter: Sucrose goes below Whole milk, 3.5% fat's line, focus on its Move up, step 1's group as it was
PASS by tap Move Sucrose up: Sucrose is back above Whole milk, 3.5% fat's line
PASS by tap remove Vanilla extract: the row goes and focus stands on a neighbouring remove (focus on "remove Fine sea salt")
PASS by keyboard: Tab to "remove Fine sea salt", Enter: the row goes and focus stands on a neighbouring remove or Add ingredient (focus on "Add ingredient")
PASS Save: the recipe page opens with "Recipe saved."
PASS the stores hold one recipe more, one version with a stored Sheet code, the two steps and the two rows, and no draft (Sheet code 9ZVZ-ZQBG)
PASS Print sheet opens the print route
PASS the print route is laid and its foot carries the stored Sheet code (foot "Vanilla · Version 1 · Version 1 · 9ZVZ-ZQBG")
PASS Search opens, the code is typed, Find lands on that version
PASS Edit opens the editor reading "Version 1 · editing"
PASS by tap Step 1, move down, then Save: the page reads "Changes saved."
PASS Search again, the same code, Find lands on the same version id
PASS the stores end with one recipe more than at the start, the version's id and Sheet code unchanged by the edit, the steps swapped, and no draft
32 PASS, 0 FAIL
```

Facts the walk showed that the row's wording follows: the Move controls on a row read "Move Sucrose down in step 2" (the step is in the name); after "remove Vanilla extract" focus stands on "remove Fine sea salt", so the keyboard step starts from Fine sea salt's grams field and Tabs to its remove; after removing Fine sea salt focus lands on Add ingredient; the foot of the last Sheet page reads `<name> · <version line> · <code>`, the code being the last part, eight characters grouped four and four.

## Deviations from Plan

### Auto-fixed Issues

**1. [Classified engine/framing FAIL] An anchored full page on a tall board could not be pictured (save.html vC1 reading panel)**
- **Found during:** Task 1 (first combined board run: `FAIL save.html vC1 error: page.screenshot: Clipped area is either empty or outside the resulting image`; the five specs together were `1091 PASS, 1 FAIL`)
- **Classification:** neither a build departing from the board nor a fixture difference: the board's window sits in a fixed-height canvas (2160 px, `overflow:hidden`) that clips what runs past it, and the reading steps begin at page y 2301 inside a window that starts at 1136. Plan 11-01's lift removed the window's own clip only, and its clip was taken before the lift.
- **Fix (engine, never app CSS):** the lift now sets `overflow:visible` on every ancestor (a `data-evidence-lift` attribute, removed afterwards) and the scope is measured again inside the lifted layout before the board picture is taken.
- **Files modified:** 11-board-check.mjs
- **Verification:** the five specs together `1092 PASS, 0 FAIL`; the picture of save-vC1-reading shows the three steps on both sides.
- **Commit:** c58c0380

**2. [Rule 1 - Bug, found in my own review of the fix] Two panels write one evidence file**
- **Found during:** Task 1 (after fix 1: the reading spec's vC1 and the save spec's vC1, and the reading spec's fA1 and the first-version spec's fA1, both wrote `<board>-<id>-board.png` and `-app.png`, the later picture silently replacing the earlier; `save-vC1-app.png` would have held the reading crop, not "Recipe saved.")
- **Fix:** the reading spec's two panels carry the labels `vC1-reading` and `fA1-reading`; the engine now FAILs a repeated evidence name (`evidence: <name> is written by two panels; give one a distinct label`) so it cannot recur silently.
- **Files modified:** 11-board-check.mjs, 11-board-reading.mjs
- **Commit:** c58c0380

### Notes

- No `app/` file changed in this plan: no board FAIL traced to the build, so notebook.css and shell.css stand as they were (`@media` counts 5 and 5).
- The plan's `<verify>` command uses `$S` in the same shell call as `npm --prefix`; this worktree's tool guard refuses it, so the same steps ran as separate commands against `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/sprinkles-11/dist-13` (= `${TMPDIR}/sprinkles-11/dist-13`).
- The walk's scratch build is the one `11-walk-check.sh` makes under `walk-<checkout name>`; app/dist was never built or written.
- Plan 11-12's two standing board departures remain: "Version 1 · Version 1 · Latest" and "Only this version so far"; the walk shows the foot of the print route as `Vanilla · Version 1 · Version 1 · <code>` for the same reason (a first version left at its default name).

**Total deviations:** 2 auto-fixed (1 engine framing, 1 harness bug). **Impact:** harness only; the pictures are now what the plan says they are.

## Verification

- Full suite: baseline in this worktree 130 files, 4228 tests passed; after the plan 130 files, 4228 tests passed (no `app/` change).
- Acceptance greps: `'edit-kept'` 2; `expectSeedKept(` 21; `@media` in notebook.css 5 and shell.css 5; `from 'idb'` only app/src/store/db.js; `dangerouslySetInnerHTML=` outside tests 0; `first activation missed` 3; `127.0.0.1` 2; `data-print-ready="true"` 1; `Move Sucrose up` 2; `Step 3, remove` 2; neither todo left in pending.

## Known Stubs

None.

## Threat Flags

None: harness scripts and two moved todo files; no network, auth or schema surface added. T-11-38 (the row's first step is the production build and `preview --host`; the WebKit walk runs on a scratch build) and T-11-39 (every build here passes `--outDir` into the scratch directory; app/dist was not touched) are mitigated as planned.

## Checkpoint: Task 3 (human-action, blocking)

The executor has no ArtifactData tool. The orchestrator writes the row `check-p11-ipad-create-steps-save-print-edit` on Mark's List with the content returned in the checkpoint message, closes the two folded todos' rows if open, reads both back, and a continuation records the readback (id, status, version) here. **iPad verification pending.**

## Self-Check: PASSED

- Files found: 11-device-steps.mjs, 11-walk.mjs, 11-board-check.mjs, 11-board-reading.mjs (under `.planning/phases/11-steps-structure-save-and-print/`); both todo files under `.planning/todos/completed/`, neither under pending.
- Commits found: c58c0380, 049b34ff.
