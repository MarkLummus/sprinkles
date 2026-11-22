---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 13
subsystem: ui
tags: [react, creation-editor, keyboard, caret, aria-keyshortcuts, playwright-webkit, board-conformance]

requires:
  - phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
    provides: "12-12 (RowActs onAddAfter, creationRows.onAddRowAfter, picking { afterRowId, group, opener }, focus kinds picker-name and picker-opener, the step body's child order, 12-board-rowcontrols.mjs coffeeBase)"
provides:
  - "editorKeys.js: keyIntent(event) and editorKeyDown(event, { onAdd, onMove, otherwise })"
  - "Cmd+Return and Ctrl+Return add after, Ctrl+Cmd+Up and Down move, from every text field of a step and from a row's grams, caret kept"
  - "aria-keyshortcuts on a step's Add step, Move up, Move down and a row's Add ingredient, Move up, Move down"
  - "One p.mk-keys line under each region's heading row, from existing tokens only"
  - "12-keys-probe.mjs (modes move, keys, lines) and 12-board-keys.mjs (eight entries)"
affects: [12-14, creation-editor, PROOF-02]

actuals:
  tokens: 18072
  tasks: 3
  commits: 3
plan_head_before: 99cf4f6d803a4c5ee9be84175eb27f18965b6841
plan_head_after: 8f3ae335d59a41e73a8e71f69112ea7c423c5b7f

tech-stack:
  added: []
  patterns:
    - "A keyed move sets no focus request: React DOM's commit-phase selection restore keeps the field and its caret"
    - "A recognised key combination is always prevented (ends and repeats included); every other key falls through to the field's own handler"
    - "A third picker opener ('grams') with its own Cancel return, the 'row-grams' focus kind"

key-files:
  created:
    - app/src/ui/editorKeys.js
    - app/src/ui/editorKeys.test.js
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-keys-probe.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-keys.mjs
  modified:
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/CreationSteps.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.creating.test.jsx
    - app/src/ui/RecipeSheet.jsx
    - app/src/styles/notebook.css

key-decisions:
  - "Branch A: the WebKit move probe passed on the first run with the keyed path setting no focus request, so the caret fallback is not built and nothing in CreationPage.jsx names it"
  - "The Ingredients keys line is drawn by RecipeSheet (creating mode, hasRows) directly after its one IngredientsHead tag, so it follows the heading in both forms"
  - "12-board-keys.mjs re-implements the few flows it needs (addAfter, stepFull, pickerFromRow) beside coffeeBase instead of exporting more from 12-board-rowcontrols.mjs, which is outside this plan's files"

patterns-established:
  - "A probe mode starts in its own browser context, so a mode's stored drafts are its own"
  - "'Says nothing' is measured: a MutationObserver on the structure region counts writes and records every announcement"

requirements-completed: []

coverage:
  - id: D1
    description: "Ctrl+Cmd+Up and Down in any text field of a step (lead-in, instruction, purpose, aside, target label and value) move the step with the Move buttons' announcement; the same field of the moved step keeps focus and its caret or range; at the ends nothing moves and nothing is said"
    requirement: STRUCT-05
    verification:
      - kind: automated_ui
        ref: "node 12-keys-probe.mjs move keys: lead-in 16 lines, the other five fields collapsed and ranged, ends measured by writes to the structure region"
        status: pass
      - kind: unit
        ref: "app/src/ui/CreationSteps.test.jsx#the keys that add and move a step"
        status: pass
    human_judgment: false
  - id: D2
    description: "Cmd+Return and Ctrl+Return in those fields do what Add step does (a step after it, focus in its lead-in, nothing typed); a held Cmd+Return adds once; a plain Return still breaks the line in the prose fields and is held in the one-line fields"
    requirement: STRUCT-05
    verification:
      - kind: automated_ui
        ref: "node 12-keys-probe.mjs keys: 12 add lines (six fields, two combos), two held-repeat lines"
        status: pass
      - kind: unit
        ref: "app/src/ui/editorKeys.test.js and CreationSteps.test.jsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "In a row's grams Cmd+Return and Ctrl+Return open the picker (or move its landing and focus Name), Cancel returns to that grams, the pick lands right after the row; Ctrl+Cmd+Up and Down move the row within its own group with the Move buttons' announcement and the caret kept, for a row in a step, a row in no step and one line of a split row; a held move goes one place per repeat and stops at the end"
    requirement: STRUCT-05
    verification:
      - kind: automated_ui
        ref: "node 12-keys-probe.mjs keys: grams matrix (collapsed and ranged, Meta and Control, held run of five keydowns)"
        status: pass
      - kind: unit
        ref: "app/src/ui/IngredientTable.creating.test.jsx#the keys in a row's grams"
        status: pass
    human_judgment: false
  - id: D4
    description: "The recipe name, description, version name, the picker's Name and the serving temperature beside the Sheet get no key; Remove has no key"
    requirement: STRUCT-05
    verification:
      - kind: automated_ui
        ref: "node 12-keys-probe.mjs keys: the four combinations in five outside fields change no step and no row"
        status: pass
      - kind: unit
        ref: "editorKeys.test.js and CreationSteps.test.jsx (Delete and Backspace read as nothing)"
        status: pass
    human_judgment: false
  - id: D5
    description: "aria-keyshortcuts reads 'Meta+Enter Control+Enter' on Add step and Add ingredient, 'Control+Meta+ArrowUp' on Move up, 'Control+Meta+ArrowDown' on Move down, and nothing on the headings' controls or Remove"
    requirement: STRUCT-05
    verification:
      - kind: unit
        ref: "CreationSteps.test.jsx and IngredientTable.creating.test.jsx"
        status: pass
      - kind: automated_ui
        ref: "node 12-board-check.mjs 12-board-keys.mjs --selftest: attr checks on every step and row button and on the headings' controls, board against build"
        status: pass
    human_judgment: false
  - id: D6
    description: "One p.mk-keys line under each region's heading row with the board's words, only while the region has something to key, kept under the heading with the picker open, its rule from three tokens"
    requirement: STRUCT-05
    verification:
      - kind: automated_ui
        ref: "node 12-keys-probe.mjs lines: 8 PASS; node 12-board-check.mjs 12-board-keys.mjs --selftest: eight PASS selftest keys- lines"
        status: pass
    human_judgment: false
  - id: D7
    description: "The caret staying in place after a keyed move, and the Tab order and key behaviour, on Mark's iPad with the Magic Keyboard"
    requirement: STRUCT-05
    verification: []
    human_judgment: true
    rationale: "Everything here is Playwright WebKit on a Mac, device-unverified. The caret rests on React DOM's own selection restore; the iPad is PROOF-02's row 2 (D-11). The fallback is written down under Decisions below."

duration: 55min
completed: 2026-11-22
status: complete
---

# Phase 12 Plan 13: Keys that add and move a step or a row, and the line that teaches them Summary

**Cmd+Return and Ctrl+Return add, Ctrl+Cmd+Up and Down move, from every text field of a step and from a row's grams with the caret kept; a one-line hint under each region heading teaches them, and 101 WebKit probe lines prove them (device-unverified).**

## Performance

- **Duration:** about 55 min
- **Tasks:** 3 (one tracer, two auto)
- **Files modified:** 11 (4 created)

## Accomplishments

- `editorKeys.js` holds the whole key table. `keyIntent(event)` answers null while an IME composes or with Alt or Shift held, 'add' for Enter with Cmd or Ctrl ('ignore' on a repeat), 'move-up' and 'move-down' for Ctrl+Cmd with the arrows. `editorKeyDown` prevents every recognised combination, ends and repeats included, then calls `onAdd` or `onMove`; any other key goes to `otherwise`. Remove has no intent.
- Every text field of a step (lead-in, instruction, purpose, aside, a target's label and value) routes its keydown through `editorKeyDown`; the lead-in and the target fields keep `holdReturn` as `otherwise`, the instruction, purpose and aside take none, so a plain Return still breaks the line. A row's grams does the same with `otherwise: holdReturn`.
- `CreationPage`: `handleMoveStep` and `handleMoveRow` take `{ keyed }` and set no focus request when keyed; `handleAddRowAfter` takes `{ opener }` ('row' or 'grams'); Cancel after a 'grams' opener requests the new `'row-grams'` kind, which the focus effect resolves to the line's grams (the heading's Add ingredient if the line is gone).
- aria-keyshortcuts on a step's Add step, Move up, Move down and a row's Add ingredient, Move up, Move down, none elsewhere.
- `p.mk-keys` under Instructions (while a step exists) and under Ingredients (while a row exists, directly after the one IngredientsHead tag, so it stands under `h2.region-name` while the picker is open). The rule reads `--face-grotesk`, `--sheet-size-cross-flag` and `--gap-xs` only.

## Branch A: the caret fallback is not built (the plan's central question)

`node 12-keys-probe.mjs move` passed on its first run in Playwright WebKit at 1366 with a coarse pointer, with the keyed path setting no focus request: after Ctrl+Cmd+ArrowUp and ArrowDown from Step 2's lead-in the textarea relabelled by its new place holds focus with the moved step's words, selectionStart and selectionEnd as before (collapsed 2-2 and ranged 1-4), no Move button focused, the structure region reading 'Step 1 of 2' then 'Step 2 of 2'. The ends move nothing and write nothing to the region (a MutationObserver counted zero writes). The `keys` mode then repeated the caret assertions for the other five step fields (collapsed and ranged), for the grams of a row in a step, a row in no step and one line of a split row, for an empty purpose field and an empty grams field, with no case failing. So Branch B (the caret focus-request kind) is not built; `grep -cE "setSelectionRange|kind: 'caret'" app/src/ui/CreationPage.jsx` prints 0 and no comment names it.

**If PROOF-02's iPad row 2 shows the caret lost or moved after a keyed move** (the plan's recorded fallback): a /gsd-quick task adds a focus-request kind `{ kind: 'caret', n | line, field, start, end }` that the keyed path records before it moves (field by its step's n or the row line and its data-field or aria-label suffix, never the pre-move label, whose number changes when the step moves) and the focus effect resolves with `focus()` and `setSelectionRange(start, end)`; 12-keys-probe.mjs gains the same assertions on it.

## Verification

- `npx vitest run` (whole): 136 files, 4538 tests, all passing (baseline 135 files, 4511 tests; +27 tests, +1 file: editorKeys.test.js).
- `node 12-keys-probe.mjs move keys lines` on a scratch build: 101 PASS, 0 FAIL (move 16, keys 77 after the fix below, lines 8). Run as `move keys` and `lines` separately each mode also passes.
- `node 12-board-check.mjs 12-board-rowcontrols.mjs 12-board-keys.mjs --selftest`: 1532 PASS, 0 FAIL; eight `PASS selftest keys-` lines (rc-drawn's two, rc-full, ai-pick, kr-press, kr-added, kr-move, kr-moved) and the nine `PASS selftest rowcontrols-` lines. Run against an older build with no keys line, 12-board-keys.mjs prints 234 FAIL lines (missing line, wrong region height), so the spec can fail.
- `node 12-tab-probe.mjs`: 9 PASS, 0 FAIL; the Tab walk is still 45 stops.
- `sh 11-walk-check.sh`: "MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5", no DIFF.
- Acceptance greps all met (keyIntent and editorKeyDown once each; editorKeys.js has no react, document or window; `keyed` four times in CreationPage; no caret fallback; aria-keyshortcuts 3 and 3; editorKeyDown 6 and 1; no document-level keydown listener; both key lines once; `mk-keys` in notebook.css with no literal in its rule).
- No Vite or other process of mine was left running; builds went to `$TMPDIR/sprinkles-12/dist-13` and the walk's scratch folder; `app/dist` untouched.
- Every probe and board result is Playwright WebKit on a Mac: device-unverified.

## Commands for 12-14's `12-check.sh`

Run from the repo root after `npm --prefix app run build -- --outDir "$S/dist-13" --emptyOutDir`, with `S="${TMPDIR:-/tmp}/sprinkles-12"` and `P=.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo`:

- `PROBE_DIST="$S/dist-13" node $P/12-keys-probe.mjs move keys lines` (each mode starts its own browser context; expect 101 PASS, 0 FAIL)
- `PROBE_DIST="$S/dist-13" node $P/12-board-check.mjs $P/12-board-rowcontrols.mjs $P/12-board-keys.mjs --selftest [--evidence "$S/evidence-13"]` (expect eight `PASS selftest keys-` and nine `PASS selftest rowcontrols-` lines; the labels keep the two specs' evidence files apart)
- `PROBE_DIST="$S/dist-13" node $P/12-tab-probe.mjs` (45 stops, 9 PASS)

## Deviations from Plan

None in kind. Small notes:

- **The keys line has a unit test in CreationSteps.test.jsx** (Task 3's file list did not name it; the file is in the plan's files_modified through Task 2). RecipeSheet's line is proven in WebKit by the probe's `lines` mode and the board spec, not in jsdom.
- **12-board-keys.mjs re-implements three small flows** (addAfter, stepFull, pickerFromRow) beside the imported `coffeeBase`, because 12-board-rowcontrols.mjs exports only `coffeeBase` and is outside this plan's files.
- **Probe harness fix during Task 3:** the first `move keys` run failed in the second mode because `move` had left a kept Coffee draft in the shared browser context. Each mode now starts in its own context. The empty-grams case first compared the whole region's `.field-error` count to zero and failed on a message that a blur on the split row's new empty line had raised earlier; it now compares the count before and after the keyed move.
- **Both 12-board-keys.mjs's apostrophe and the probe's words are read from the board's markup** (`&#x27;`, the plain U+0027), as the plan's review item 9 asks; nothing typographic is in the app's line.

## Auth Gates

None.

## Known Stubs

None.

## Threat Flags

None. T-12-41: every recognised combination is prevented, ends and repeats included, and the probe asserts the field's value unchanged after each add and move. T-12-42: a repeat returns 'ignore' (unit test, and a dispatched repeat in the probe, and a real held key whose first keydown has `repeat` false and the next four true). T-12-43: handlers sit on the step fields and the grams only (no document-level listener, grep 0); the probe presses the four combinations in five outside fields and finds no change. T-12-44: every line here is labelled device-unverified and the fallback is written down.

## Left to the orchestrator (executors have no ArtifactData)

- Close Mark's List `todo-reorder-row-controls` (the approved redraw, order and keys, is built): read it for its version, read the clock with `date -u +%Y-%m-%dT%H:%M:%S.000Z` just before the write, status done, resolvedAt from that read, a one-line reply naming 12-12's commits (73f8c1dd, f6f961a8, a4f77c70) and this plan's (5d174a10, d6dfe10f, 8f3ae335). Its todo file moves to completed in 12-14.
- **STRUCT-05 in REQUIREMENTS.md:** the plan gives no instruction on its status and this worktree does not own shared files, so REQUIREMENTS.md, STATE.md and ROADMAP.md are untouched. 12-12 left STRUCT-05 unchecked and Pending because it is shared with this plan; both plans have now landed, so the orchestrator can mark it complete after the merge, pending PROOF-02's iPad rows for the device-only parts.
- Deploy: no store shape, DB_VERSION or store-file-version change; main is safe to deploy.
- For PROOF-02's iPad rows (Mark's checks, device-unverified here): Cmd+Return and Ctrl+Return add and open the picker from the fields; Ctrl+Cmd+Up and Down move and the caret stays put in each field (row 2); a keyboard with no Cmd key gets Ctrl+Return only.

## Self-Check: PASSED

- Created files present: editorKeys.js, editorKeys.test.js, 12-keys-probe.mjs, 12-board-keys.mjs.
- Commits 5d174a10, d6dfe10f, 8f3ae335 are ancestors of HEAD.
