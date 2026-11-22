---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 14
subsystem: testing
tags: [verification-gate, playwright-webkit, ipad-proof, marks-list, device-steps]

requires:
  - phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
    provides: "Every round-two app plan (12-09 to 12-13, 12-15, 12-16) and round one's 12-check.sh, 12-board-*.mjs specs and probes"
provides:
  - "12-check.sh round two: one command, last line GATE2 PASS, GATE1 PASS before it, MATCH 94 snapshots from the Phase 11 walk"
  - "12-device-steps.mjs: every numbered step of the three iPad rows walked in WebKit on the final build, 26 PASS row lines and PASS rows match the walk"
  - "12-ipad-rows.md: the three check rows as walked, now on Mark's List"
  - "The two folded todo files moved from pending to completed"
affects: [PROOF-02, PHONE-01, STRUCT-05, LOG-01, verify-work, phase-12-verification]

actuals:
  tokens: 11754
  tasks: 3
  commits: 2
plan_head_before: 91d1ad8367fa7907bdc9789ff66bbc7db3054566
plan_head_after: 989c1b11479090c86a82ecfb78bd92aef347907d

tech-stack:
  added: []
  patterns:
    - "Device rows are walked in WebKit first, one PASS line per numbered step, and the walk's count is compared with the rows file's numbered lines"
    - "A step only paper or the device can show is walked to its last on-screen state and its PASS line says the paper is the device's"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-device-steps.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-ipad-rows.md
  modified:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh
    - .planning/todos/completed/2026-11-01-add-ingredient-on-each-ingredient-row-like-add-step.md
    - .planning/todos/completed/2026-11-01-reorder-row-controls-so-adding-the-next-row-comes-first.md

key-decisions:
  - "Four wording corrections to the plan's row text were forced by the walk (see Deviations); the rows on Mark's List carry the walked wording"
  - "PROOF-02 stays unchecked: it completes only when Mark passes the three rows"

patterns-established:
  - "The orchestrator writes check rows at a checkpoint and a continuation records the readback in the summary (gsd-executor has no ArtifactData)"

requirements-completed: []

coverage:
  - id: D1
    description: "12-check.sh on the final build runs round one unchanged (GATE1 PASS after MATCH 94 snapshots) then round two (board over eleven specs with --selftest, phone, band, tabs and keys probes) and ends GATE2 PASS"
    requirement: PROOF-02
    verification:
      - kind: automated_ui
        ref: "sh 12-check.sh: GATE1 PASS, then GATE2 PASS as the last line; no FAIL or DIFF line (first executor's measured result)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every numbered step of the three iPad rows was reached in Playwright WebKit at 1366 with a coarse pointer on the final build, each on its first activation"
    requirement: PROOF-02
    verification:
      - kind: automated_ui
        ref: "node 12-device-steps.mjs: 26 PASS row lines (10, 10, 6) and PASS rows match the walk (first executor's measured result)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Creation is usable on the iPad from the production build: Tab reach, focus after Move, the add and move keys with the caret kept, Add ingredient after a row, Save, print and the clipboard"
    requirement: PROOF-02
    verification: []
    human_judgment: true
    rationale: "Everything above is Playwright WebKit on a Mac, device-unverified. Mark's three rows on Mark's List are the proof; PROOF-02 completes only when he passes them."

duration: about 40min across the first executor and this continuation
completed: 2026-11-22
status: complete
---

# Phase 12 Plan 14: The round-two gate and the three iPad rows Summary

**One command (12-check.sh) now proves round one and round two on the final build to GATE2 PASS, every numbered step of the three iPad rows was walked in WebKit first, and the rows are on Mark's List open and read back. Automated verification passed; iPad verification is pending and nothing is device-verified.**

## Performance

- **Duration:** about 40 min across the first executor (Tasks 1 and 2) and this continuation (Task 3's record, SUMMARY, state)
- **Tasks:** 3 (one tracer, one auto, one checkpoint:human-action)
- **Files modified:** 5 (2 created, 1 edited, 2 moved)

## Automated verification passed (not the iPad)

The first executor's measured results, quoted as reported; this continuation re-ran nothing because both commits are on HEAD.

- `sh 12-check.sh` on the final build: last line `GATE2 PASS`, `GATE1 PASS` before it, no FAIL or DIFF line.
- Walk: `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`. No DIFF, so 11-walk-before.json was not touched (no 12-14 commit touches it or `app/`).
- Suite: 4538 passed (4538).
- Board step over round one's five specs and round two's six, with --selftest: `3302 PASS, 0 FAIL`, all 33 `PASS selftest` lines.
- Phone probe all PASS; band probe 9 PASS; tab probe 9 PASS; keys probe `101 PASS, 0 FAIL`.
- `12-device-steps.mjs`: 26 `PASS row <r> step <s>` lines (row 1: 10, row 2: 10, row 3: 6) and `PASS rows match the walk`.
- Every result above is Playwright WebKit (and the Simulator for the sim step) on a Mac. None of it is device-verified.

## iPad verification pending (Mark's three rows)

Nothing about the iPad is verified. The three rows below are open on Mark's List and are PROOF-02's proof. PROOF-02 stays unchecked in REQUIREMENTS.md until Mark passes all three.

The orchestrator queried Mark's List before writing (status ne done, then touched eq true). One touched row was waiting for `/marks-list` and was named, not handled: `xmbi8vzv6m91t5kf9t3p` ("remove balance table when printing recipe"). The three rows were then written at 2026-11-22T22:40:51.000Z (clock read just before the writes) and read back by query. Each row's detail is the text of 12-ipad-rows.md as walked.

| Row id | Status | Version | Owner | Needs |
| ------ | ------ | ------- | ----- | ----- |
| `check-p12-ipad-create-ingredients-scales` | open | 1 | mark | hands |
| `check-p12-ipad-steps-move-tab-keys` | open | 1 | mark | hands |
| `check-p12-ipad-save-print-clipboard` | open | 1 | mark | hands |

### Rows closed by the orchestrator in this run

Each set to status done with resolvedAt and a one-line reply:

| Row id | Built by | Version after closing |
| ------ | -------- | --------------------- |
| `bug-p11-pen-step-no-preview` | 12-11 | 12 |
| `todo-phone-hide-entry-points` | 12-09, 12-10, 12-15, 12-16 | 3 |
| `todo-add-ingredient-per-row` | 12-12 | 6 |
| `todo-reorder-row-controls` | 12-12, 12-13 | 6 |

### Rows left open on purpose, and rows added

- `adoajjb9sgzbezmyrt4s` (clipboard top margin on the printed logs): left open. It closes when Mark passes row 3's steps 5 and 6.
- Two decide rows were added from 12-16's notes for Sid: `decide-p12-phone-focus-after-pen-close` and `decide-p12-phone-two-kept-lines`, both open, version 1.
- No decide row was raised for 12-VERIFICATION.md's G11 (focus after Save over rests on Next version); Mark has not asked for one.
- `xmbi8vzv6m91t5kf9t3p` is touched and waits for `/marks-list`; not handled here.

## Accomplishments

- **12-check.sh round two (tracer, 3ec1afac).** Round one's eight steps and `GATE1 PASS` kept exactly; five round-two steps added on the same scratch build (board, phone, band, tabs, keys) and `GATE2 PASS` as the last line. Phase 11's board specs and device steps are not run because sketch 016 overrides their control order.
- **12-device-steps.mjs and 12-ipad-rows.md (989c1b11).** One WebKit context at 1366 by 1024 with touch, 127.0.0.1 only, a PROBE_DIST that resolves to app/dist refused, each step proven on its first activation after its ready state, selectors taken from the current build. Row 2's whole-page Tab step lifts the 40-press cap and compares the walk against the page's tabbable controls in DOM order.
- **Folded todos moved.** `2026-11-01-add-ingredient-on-each-ingredient-row-like-add-step.md` and `2026-11-01-reorder-row-controls-so-adding-the-next-row-comes-first.md` moved from `.planning/todos/pending` to `.planning/todos/completed` (built by 12-12 and 12-13).
- **Task 3 (checkpoint, satisfied).** The orchestrator wrote and read back the three rows and closed the four finished rows, recorded above. The executor made no ArtifactData call at any point.

## Deviations from Plan

### Wording corrections forced by the walk

Not auto-fix rules in the code sense: the plan's step text named things the build does not do, so the rows were corrected to what the build does. The rows on Mark's List carry the corrected text.

1. **Row 3 step 4.** The plan's Expect named a "This recipe only" cue; the build has no such cue. The Expect was rewritten to: the Tasting log lists the recipe's two scales after the four core ones, the Low to high scale with its two end words and no numbers, and the recipe's problem last under Any problems.
2. **Row 2 step 3.** The plan's "type grams in every grams field the table shows" was dropped; the rows' grams were already filled in row 1, so the step now ends at Done with "no grams field is empty" as its Expect.
3. **Row 2 step 7.** Reworded to press Ctrl+Cmd+Down once more after the up and down pair, with Expect "nothing moves, because it is the last step".
4. **Row 3 step 5.** Pages reworded to "pages 1 to 2 (the Batch log and the Tasting log)".

Row 3 step 3's "Under the version press Print sheet" and Row 1 step 6's "Under Style choose a style" are small wording choices from the build's own labels, in the same spirit.

### Auto-fixed Issues

None. No app file was edited; no round-one or round-two step failed.

**Total deviations:** 4 wording corrections to the plan's step text, no code deviation. **Impact:** none on scope; the rows are reachable as written.

## Auth Gates

None. Task 3 was a `checkpoint:human-action` for the orchestrator's Mark's List writes, which the orchestrator completed.

## Known Stubs

None.

## Threat Flags

None. T-12-45: no DIFF appeared, `11-walk-before.json` was not touched. T-12-46: the rows name controls only; the recipe's words and figures appear nowhere, and the grep for the example words found nothing. T-12-47: this summary keeps automated and iPad verification apart, and PROOF-02 stays pending. T-12-48: every build went to a scratch `--outDir`, no Vite server was started, no worktree was left behind.

## Deferred Human Verification

Three check rows on Mark's List, all open, all needing Mark's hands on the iPad (Safari, landscape, Magic Keyboard, Full Keyboard Access off), served from `npm --prefix app run build && npm --prefix app run preview -- --host`. Do them in order; they continue in one recipe.

1. `check-p12-ipad-create-ingredients-scales` (version 1): the editor adds ingredients after the row you press, and takes scales, targets, a style, a serving temperature and a problem.
2. `check-p12-ipad-steps-move-tab-keys` (version 1): Tab reaches every creation control (each Move button included, a grey one too), focus stays with the moved step or row after a Move by touch and by keyboard, Cmd+Return and Ctrl+Cmd+Up and Down keep the caret.
3. `check-p12-ipad-save-print-clipboard` (version 1): Save opens the recipe with "Recipe saved.", the print page shows its scales, and the Batch log and Tasting log print clear of the clipboard, each on one sheet. Its steps 5 and 6 also close `adoajjb9sgzbezmyrt4s`.

If row 2's caret step fails on the iPad, route 12-13's stated fallback (a 'caret' focus request) to `/gsd-quick`. If a Move or Tab step fails, it is a bug row for Mark to triage, not a fix before he answers.

## Left to the orchestrator and the verifier

- PROOF-02 in REQUIREMENTS.md stays unchecked until Mark passes the three rows. This plan marks no requirement complete. PHONE-01 and STRUCT-05 can be checked once the verifier confirms GATE2 PASS.
- Deploy: round two changed no store shape, DB_VERSION or store-file-version; main is safe to deploy.

## Self-Check: PASSED

- Created files present: 12-device-steps.mjs, 12-ipad-rows.md; 12-check.sh edited; both todo files in `.planning/todos/completed` and not in pending.
- Commits 3ec1afac and 989c1b11 are ancestors of HEAD.
- Measured commit count from the ledger: `git rev-list --count 91d1ad83..989c1b11` is 2.
