---
phase: quick-261001-eds
plan: 01
subsystem: ui
tags: [react, ingredient-table, as-made, batch, vitest, playwright-webkit]

requires:
  - phase: 03.5-separate-the-recipe-from-the-sheet
    provides: IngredientTable total row, asMadeTotals, the probe harness
provides:
  - "asMadeTotals returns anyWritten beside planTotal and asMadeTotal"
  - "The total row's As made cell renders nothing, and its aria-label drops the as-made clause, until a value is written for an active row"
affects: [ingredient-table, batch-record, sketch boards if Mark wants the blank state drawn]

actuals:
  tokens: 14000
  tasks: 3
  commits: 3
plan_head_before: b151597b974f091a988d6bf842cf0aaa16218e02
plan_head_after: 6d61a278f74aa3ebbfeb10d739e6a44aca86fb2d

tech-stack:
  added: []
  patterns:
    - "A figure that fills the plan in where nothing was written reports whether anything was, so the caller can leave it blank"

key-files:
  created:
    - .planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs
  modified:
    - app/src/domain/batch.js
    - app/src/domain/batch.test.js
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx

key-decisions:
  - "Written is the element test asMadeTotals already applied (not null, undefined or empty string, and Number() finite), never a difference from the plan"
  - "The tfoot cell stays and holds no child node when blank; no stylesheet, token, board or generator changed"
  - "Small-print line left alone: it still reads true where a total is shown"

requirements-completed: [BATCH1-01, BATCH1-02]

coverage:
  - id: D1
    description: "A saved batch with nothing written (Mocha version 3) shows an empty As made cell in the total row, Show changes on and off, with no as-made clause in the label"
    requirement: BATCH1-02
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx#reading a saved batch with nothing written: the As made cell stays, empty, and the label reads the plan alone"
        status: pass
      - kind: automated_ui
        ref: "node .planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs (v3 checks, WebKit and Chromium)"
        status: pass
    human_judgment: true
    rationale: "Nothing here ran on Mark's iPad; he checks the device"
  - id: D2
    description: "Where a value is written (Mocha version 2, 794.6 g) the total reads exactly as before, plan fill-ins included"
    requirement: BATCH1-01
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx#reading, one value written (45 on a 40 row)"
        status: pass
      - kind: automated_ui
        ref: "261001-eds-total-probe.mjs (v2 checks, both engines)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The recording pen's total starts empty, appears on the first typed value (a value equal to the plan included), and is empty again when cleared, without the As made or Ingredient head moving"
    requirement: BATCH1-02
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx#recording, an empty draft / one typed string / a typed string equal to the plan"
        status: pass
      - kind: automated_ui
        ref: "261001-eds-total-probe.mjs (pen checks, both engines)"
        status: pass
    human_judgment: true
    rationale: "Typing on the iPad's keyboard and layout is Mark's to confirm"
  - id: D4
    description: "anyWritten matrix: empty, all-null, all-blank, unparseable, written 0, equal-to-plan, partial, stale key, seeded batch"
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#anyWritten: what counts as written (quick 261001-eds)"
        status: pass
    human_judgment: false

duration: 20min
completed: 2026-10-01
status: complete
---

# Quick 261001-eds: Blank the As made total until a value is written Summary

**The ingredient table's As made total cell now renders nothing, and its aria-label drops the as-made clause, until the maker has written at least one value for an active row, decided by `asMadeTotals`'s new `anyWritten` flag.**

## Performance

- **Duration:** about 20 min
- **Started:** 2026-10-01T14:13Z (approx.)
- **Completed:** 2026-10-01T14:34Z
- **Tasks:** 3
- **Files modified:** 5 (4 modified, 1 created)

## Accomplishments

- `asMadeTotals` in `app/src/domain/batch.js` returns `anyWritten` next to its two unchanged totals. It is set in the one branch that already takes an as-made element over the plan.
- `IngredientTable.jsx` reads `anyWritten`. The tfoot As made `td` stays (with its live-total class while recording) but holds no child node until `anyWritten` is true. The total row's label adds ", as made X grams" only when an as-made layer is showing and `anyWritten` is true.
- Pinned on exact tfoot markup in reading, recording and show-changes, blank and filled, plus a framework-free domain matrix. Probed on the built app in WebKit and Chromium.

## Task Commits

1. **Task 1: blank total, end to end (tracer)** - `199b052` (fix)
2. **Task 2: every state pinned** - `eb0291e` (test)
3. **Task 3: probe** - `6d61a27` (docs). The SUMMARY itself is committed by the orchestrator, not by me.

## Files Created/Modified

- `app/src/domain/batch.js` - `anyWritten` returned by `asMadeTotals` (lines 273-320), doc comment updated
- `app/src/ui/IngredientTable.jsx` - blank cell (line 701), label clause (line 421), comment above `hasAsMadeLayer` amended
- `app/src/domain/batch.test.js` - 2 tests beside the existing totals, plus an 8-test `anyWritten` matrix
- `app/src/ui/IngredientTable.test.jsx` - 11 rendered-markup tests; one stale comment rewritten and one tfoot assertion added to "a row whose as-made key holds no written portion"
- `.planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs` - WebKit and Chromium probe of the build

## 1. How as-made source entries work

- An entry is a row-id key holding an array aligned index-for-index with that row's portions. Presence is an own-property check (`hasAsMade`, `batch.js`).
- While recording, `RecipePage.jsx` `handleChangeAsMade` (line 1272) seeds a row's array with empty strings on the first keystroke and deletes the key again when every portion is an empty string. On save, `buildChurnFieldsFromDraft` (line 534) parses each element through `parseGramsDraft` (`lineage.js` line 197) and drops a row whose elements are all null.
- A typed value equal to the plan is stored as the typed number under the same key, so it is a real entry and counts as written (D-02). A written 0 counts too.
- "Written" is the element test `asMadeTotals` already used: the element is not null, not undefined, not an empty string, and `Number()` of it is finite. So the cell is blank exactly when the total would be pure plan, and the flag cannot disagree with the total beside it. Only the rows passed in count, and the table passes active rows only, so a removed row's stale key never counts (pinned in the domain test).
- **Existing divergence, not fixed here:** the live total's `Number()` rule is looser than the save rule `parseGramsDraft` (`NUMERIC_GRAMS_PATTERN`). A stray space or a trailing dot counts in the live total and is dropped on save, so the pen could show a total for a value that would not be saved. It was already true of the figure itself; the blank rule inherits it.

## 2. The sketch finding (D-06)

- Read: every `011-recipe-route-c` and `011-options-counts` board, by the scan in Task 1's verify (no board draws an as-made total over an unwritten body), plus the generator reading in the plan. Sketches 007 and 008 draw controls only: no ingredient table, tfoot or total.
- The boards with an as-made total (1024, 1366, 1600, 1920, 393, 723, 983 and 984 batch boards, 1600-long-history, 1600-pen) all carry five written hand values in the body. The probe confirmed it in both engines for `1366-batch.html` and `1600-pen.html`: 5 hand values each, total 804.3 g, equal to the app's Olive Oil batch reading.
- No board draws a total with nothing written, and none draws the recording pen's as-made column. The blank state is undrawn on every board, so the sketches are silent on it rather than in conflict.
- No board, generator, canvas, token or stylesheet was touched, and no Sid task was added. Mark or Sid may want the blank state drawn; that was not done and not asked.

## 3. Small print (D-05)

"As made totals what was written; the plan fills in where nothing was." was checked and still reads true wherever a total is shown (the plan fills the rows that have no value). With nothing written there is no total and the sentence claims nothing false. Left alone, and the first new test pins it present.

## 4. Numbers

**Tests:** 1475 passing across 53 files (baseline 1454, +21, none removed). Diff of both test files: 165 additions, 0 deletions in the task 2 diff; task 1 rewrote one stale comment (7 lines to 4) and added one assertion.

**Build:** succeeded; `app/dist` rebuilt.

**Probe:** 52 counted checks passed (26 per engine), exit 0, WebKit 26.6 and Chromium, 1366 by 1024 touch.

| Reading | WebKit | Chromium |
|---|---|---|
| Mocha v3, Show changes off: total cells | `["793.9 g","Total","",""]`, As made cell empty, 0 children, aria `Total, plan 793.9 grams` | same |
| Mocha v3, Show changes on | plan cell struck `794.9` then `793.9 g`, As made cell empty, aria `Total, plan was 794.9 grams, now 793.9 grams` | same |
| Mocha v2, changes off and on | As made `794.6 g` in a hand-span, 2 hand-spans in the body, aria carries `as made 794.6 grams` | same |
| Pen on open | As made total empty, live-total class kept, aria `Total, plan 799.7 grams` | same |
| Pen, 45 typed on the first row (120 g plan) | `724.7 g` in a hand-span, aria `..., as made 724.7 grams` | same |
| Pen, cleared | empty again | empty again |
| Pen, 120 typed (equal to the plan) | `799.7 g`, equal to the plan total | same |
| Head positions across all four pen states | As made x 557.14, width 68; Ingredient x 304, width 253.14; unchanged | As made x 558.45, width 68; Ingredient x 304, width 254.45; unchanged |
| Boards 1366-batch and 1600-pen | 5 hand values, total 804.3 g | same |
| Olive Oil batch reading vs 1366 board | 804.3 g, 804.3 g | same |

**393 wide (report only, not counted):** Mocha v3's As made total cell computes `display: none` (the existing `td.ingredient-table__col-numeric:empty` rule), so the total row is one line shorter (row height 39 px WebKit, 38 px Chromium, against 60 and 59 px for v2 with `display: block` and `794.6 g`). That is expected and not fixed.

## Decisions Made

- Used the existing element test for `anyWritten`, so there is one definition of written, not two.
- The blank cell holds no node at all (`{anyWritten && <span ...>}`), which lets the existing `:empty` rules and the G-03.5-8a containment apply with no CSS change.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `assertCellCountsAgree` cannot take a two-row fixture**
- **Found during:** Task 1 (the plan's first test uses two rows and also asks for `assertCellCountsAgree`)
- **Issue:** the helper sums every body row's cells against the head, so it reads 8 against 4 for two rows. It is a limit of the helper, not of the code.
- **Fix:** added a local `assertHeadAndTotalAgree` (head cells against tfoot cells) in the new describe block and used it for the two-row tests. One-row show-changes tests use `assertCellCountsAgree` as planned. The existing helper is untouched.
- **Files modified:** `app/src/ui/IngredientTable.test.jsx`
- **Committed in:** `199b052`

**2. [Commit scope] SUMMARY not committed by me**
- The plan's Task 3 commits the probe and the SUMMARY together. Your constraints reserve docs artifacts for the orchestrator, so I committed the probe alone (`6d61a27`) and left this SUMMARY uncommitted. Not a content deviation.

---

**Total deviations:** 1 auto-fixed (1 blocking test-helper limit), 1 commit-scope note
**Impact on plan:** none on behaviour or coverage.

## Issues Encountered

None. Every counted check passed on the first probe run, and the Task 2 tests passed on first run because Task 1's code already covered every state.

## Known Stubs

None.

## Threat Flags

None. No new input path, endpoint or storage; the label says less than before.

## Device-unverified, and Mark's iPad checklist

Nothing here ran on Mark's iPad or iPhone. The WebKit and Chromium readings are engine evidence at 1366 touch and 393, not the device. The rebuild of `app/dist` means the preview on :4173 now serves this change; a tab that is already open needs a reload.

On the iPad:

1. Open Mocha version 3 with Show changes on, then off: the total row's As made cell is empty (no figure, no dash).
2. Open Mocha version 2: the As made total reads 794.6 g in the hand.
3. Start a batch record: the total is empty, appears on the first typed digit (also when the digit equals the plan), and goes away when every field is cleared. The As made and Ingredient heads do not shift while typing.

## Self-Check: PASSED

- Files exist: `batch.js`, `batch.test.js`, `IngredientTable.jsx`, `IngredientTable.test.jsx`, the probe (all FOUND).
- Commits exist: `199b052`, `eb0291e`, `6d61a27` (all on main, none pushed). `commits: 3` is measured from `b151597..HEAD`.
- Full suite 1475 passing, build succeeds, probe 52 of 52.
- Staged only by explicit path; the untracked `.impeccable/critique/*.md` files were not touched.

---
*Phase: quick-261001-eds*
*Completed: 2026-10-01*

## Device check

Mark confirmed all three iPad checks on 2026-10-01: Mocha v3 (Show changes off and on) has an empty As made total, Mocha v2 reads 794.6 g, and the batch pen total is empty on open, appears on the first typed digit, goes away when cleared, with the column heads steady. Device-verified by Mark, not by the WebKit probe.
