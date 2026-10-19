---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 16
subsystem: testing
tags: [walk, allow-list, webkit, playwright, places, sketch-012, evidence]
status: complete
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-01 09-walk.mjs, 09-walk-check.sh and the 94-snapshot before-walk; 09-03 09-places-check.mjs and the two places; 09-15 the final stored shapes; 09-02/05/07/08/09/13/14 what every seeded row now carries"
provides:
  - "09-walk.mjs: ALLOWED_STORE_PATHS (25 narrow paths, each checking its exact expected value from the seed modules), REQUIRED_STORE_FIELDS, compareResult, the selftest mode (seven doctored files) and the expected mode (checks a to d)"
  - "09-walk-after.json: the phase result's walk, MATCH 94 snapshots with 55312 allowed store differences and 55312 required additions present"
  - "09-places-check.mjs with a required --library original|current and --evidence <dir>"
  - "09-places-evidence/: seven app and board PNG pairs (all byte-identical) with a README and a verdict per pair"
affects: [09-17]
requirements-completed: [LIB-06, PLACE-01, PLACE-02]
actuals:
  tokens: 13000
  tasks: 2
  commits: 2
plan_head_before: 745a61497a880a097adfe3615dae25fb237bd640
plan_head_after: 6855104a7599288aaa07de3b3f876169f08faa70
tech-stack:
  added: []
  patterns:
    - "one definition of each expected value, called by the allow-list, the required-additions pass and the expected mode"
    - "a negative case is refused only when a DIFF or FAIL line names the very path that was doctored"
    - "the places check holds the two library datasets in separate branches and reads every count from the stored library"
key-files:
  created:
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-after.json
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-places-evidence/README.md
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-places-evidence/ (14 PNGs)
  modified:
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-places-check.mjs
key-decisions:
  - "The original-library mode holds closed rows at 393 to 88 to 126, not the plan's 88 to 105: the boards draw 126 for two of the 26 names (plan 09-03 found this; the README prose is the thing that is off)"
  - "The current-library mode splits the 393 row heights three ways (new entries 71 to 109, new entries whose summary wraps to more lines than the 103-name board's tallest held to the 126 ceiling and named, the original 26 at 88 to 126) because the stand-in board's figures are not the real entries'"
  - "No expected function was changed to fit a stored value, and the allow-list was not widened: the first compare of the real result had no DIFF"
coverage:
  - id: D1
    description: "The result's walk matches the before-walk on 94 snapshots; every store difference is on the allow-list with its expected value checked, and every required addition is present"
    requirement: LIB-06
    verification:
      - kind: command
        ref: "node 09-walk.mjs expected 09-walk-before.json (PASS a, b, c, d)"
        status: pass
      - kind: command
        ref: "sh 09-walk-check.sh 09-walk-after.json (ALLOWED 55312, REQUIRED 55312, MATCH 94 snapshots)"
        status: pass
      - kind: command
        ref: "node 09-walk.mjs selftest 09-walk-before.json 09-walk-after.json (PASS name, nulllink, code, nocode, servetemp, wrongcoef, nocoef, real)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Both places measure as drawn at the original 26 and at the seeded 111-entry library, in WebKit at 1366 and 393"
    requirement: PLACE-01
    verification:
      - kind: command
        ref: "09-places-check.mjs --library original --evidence (48 PASS, 0 FAIL)"
        status: pass
      - kind: command
        ref: "09-places-check.mjs --library current (48 PASS, 0 FAIL)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Side-by-side pictures of each built place and its board panel at the same width, after visiting every linked route"
    requirement: PLACE-02
    verification:
      - kind: automated_ui
        ref: "09-places-evidence/ (seven pairs, cmp reports each pair identical)"
        status: pass
    human_judgment: true
    rationale: "The pictures are Playwright WebKit on the dev machine; the iPad and iPhone are Mark's device check (plan 09-17)"
duration: about 20 min
completed: 2026-10-19
---

# Phase 9 Plan 16: The walk's allow-list compare and the two-mode places check Summary

**The result's WebKit walk matches the before-walk on all 94 snapshots with every one of 55312 store differences allow-listed and its expected value checked, the expected values are proven against the seed first, and both places measure as drawn at the 26-entry and the 111-entry library with seven byte-identical app and board picture pairs on file.**

## Performance

- **Duration:** about 20 min
- **Tasks:** 2 (Task 1 tracer, Task 2 auto)
- **Files:** 2 modified (09-walk.mjs, 09-places-check.mjs), 16 created (09-walk-after.json, 14 PNGs, the evidence README)
- **Suite:** `npm --prefix app test`, 113 files, 3467 tests passing (the base's count; no app file changed)

## Accomplishments

- **Allow-list compare (Task 1, tracer):** `compare` is now `compareResult(before, after)` (prints nothing, returns `{ diffs, fails, allowed, required, count }`) plus a thin `compare(pathA, pathB)`. `record` is byte-identical to 08-walk.mjs's (checked by slicing from `const FIXED_ISO` to the compare section), so the before-walk stays valid. `ALLOWED_STORE_PATHS` holds 25 entries (7 on versions and snapshots, 9 each under version rows and snapshot rows), each a narrow regular expression over diffLeaves' path with a check that the before value is absent (a name string for a declared scale) and the after value is the expected one: `versions[i].sheetCode`, `.serveTempC`, `.equipment.maxFillG`, `.declaredAxes[k]`, `batches[i].snapshot.declaredAxes[k]`, `.coreScales`, `.coreProblems`, and for both version rows and snapshot rows `libraryId`, the six D-20 keys and `ingredient.basis.titratableAcidity` and `.source.titratableAcidity`. No whole ingredient object is allowed; a changed composition figure, note or existing basis or source still fails.
- **One definition of each expected value:** `expectedSheetCode` (the seed code for a seeded id, else `codeFromVersionId` of the dumped record's own id), `expectedServeTempC` (the seeded version's own figure, a walk child's its parent's), `expectedLibraryId` (the seeded row's, null for the strawberry recipe's two own definitions, by version or parent and row id, a batch through its versionId), `expectedCoefficient` and `expectedAcidityProvenance` (data/library.js's entry for that id, null and absence for a null link), `expectedDefinitionForName` and `...ForKey` (the scales table's row through `scaleDefinition`). The allow-list, `REQUIRED_STORE_FIELDS` and the expected mode all call these; none reads an expected value from the after-file or through a row's own dumped libraryId.
- **Required additions:** `requiredStoreFields` asserts, on every after-dump, an own `sheetCode` and `serveTempC` per version, an own `maxFillG` on each equipment, own `coreScales` and `coreProblems` per snapshot, a definition at every `declaredAxes` element, and per row an own `libraryId`, the six keys and the acidity provenance exactly where the library entry holds one, each equal to its expected value.
- **Expected mode, run first:** `PASS (a) 28`, `(b) 90`, `(c) 391`, `(d) 2830` checks, no FAIL: every seeded declared definition equals the scales table's for its name, every declared name in the before-walk resolves, every expected code, serving temperature (17 numbers, 2 nulls, each also equal to `iceEd.servingTemperatureC`) and link is defined and equals the seed's own, and every seeded row's six coefficients and acidity provenance equal data/library.js's (the two strawberry definitions own the six at null).
- **The real result:** `09-walk-check.sh` ends `ALLOWED 55312 store differences, each checked`, `REQUIRED 55312 additions present`, `MATCH 94 snapshots`. Before the allow-list existed, the plain compare of the same recording produced 55312 DIFF lines, every one under `stores.` and every one on a path in the list (counted by path with indexes stripped); nothing outside `stores.` differed, so no allow-list path was added after seeing the result.
- **Selftest:** seven doctored copies of the after-file are each refused by a line that names the path that was doctored (`name` at `stores.recipes[0].name`, `nulllink` at a strawberry row's `libraryId` set to `'strawberries'`, `code`, `nocode`, `servetemp` (a seeded version's number plus one), `wrongcoef` (an acidity plus 0.001), `nocoef` (a `defaultStage` key deleted)); a doctoring that finds nothing is itself a FAIL; the real pair passes, null strawberry links and coefficients included.
- **Two-mode places check (Task 2):** `--library` is required (a run without it prints a usage line and exits 1). Original mode clears the page's library store, puts data/library.js's 26 `{ id, entry }` records in one transaction, reloads, and checks the 26-entry numbers; current mode measures the seeded library (111 entries, read from the store) and reads every count from it (milk gives 17 of 111, Fruit gives 22 of 111). Both keep every plan 09-03 check and add the count line, a category choice (Sugar gives 4 in original, Fruit the stored fruit entries in current) and, with `--evidence`, a per-name comparison of the 25 closed rows against the board.
- **Evidence:** seven pairs, written after visiting the 15 routes the places link to in the same context: notebook list at 1366 and 393, Ingredients with Heavy cream open at 1366, the 393 first screen, Heavy cream open at 393 (scrolled to where the board draws it) and "milk" typed at both widths. `cmp` reports every app PNG identical to its board PNG, and each was looked at (see verdicts).

## Verdicts per pair

| Pair | Verdict |
| --- | --- |
| notebook-list-1366 (pn1) | matches: identical bytes; rail, type, spacing and counts in words as drawn |
| notebook-list-393 (pn2) | matches: identical bytes; the counts move under the description, the tab row sits at the foot |
| ingredients-open-1366 (pi1) | matches: identical bytes; the 26 rows, Heavy cream's table, facts, lactose line and Note as drawn |
| ingredients-top-393 (pi2) | matches: identical bytes (Heavy cream is open on this panel, below the fold) |
| ingredients-open-393 (pi3) | matches: identical bytes at the same scroll position |
| ingredients-milk-1366 (pi7) | matches: identical bytes; 5 of 26, Clear filters, the list as drawn |
| ingredients-milk-393 (pi8) | matches: identical bytes |

No gap against the boards. One thing visible in both (so the board has it too, not a conformance gap): in the open entry at 393 the basis and the source run together with no space between them ("derivedpanel reconciled three ways against a 36% regulatory floor" on Heavy cream's Fat). It is recorded here and in the evidence README for plan 09-17 to name in the device row.

## Task Commits

1. **Task 1 (tracer): the result's walk matches the before-walk, each store difference allow-listed and checked** - `a1df0365` (test)
2. **Task 2: the two places measure as drawn at both library sizes, with side-by-side evidence** - `6855104a` (test)

The tracer gate re-ran Task 1's three automated steps (expected, the real compare, selftest) before Task 2 started; all passed, so expansion went ahead.

## Decisions Made

- No expected function was changed to match a stored value, and the allow-list was not widened: the first compare of the real recording had no DIFF outside the 25 paths.
- `ALLOWED` and `REQUIRED` both read 55312. That is not a copy: every difference is an addition, and each addition is counted once per dump step in both passes; the doctored files show the two passes catch different faults (a deleted field gives only a FAIL, a wrong value gives a DIFF and a FAIL).
- The scales table's declared definitions are looked up by name for a before-walk string and by key for an after element, so a definition that is not the table's row for its own key fails the required pass even when its name resolves.

## Deviations from Plan

**1. [Rule 1 - plan vs board] Original mode holds closed rows at 393 to 88 to 126, not 88 to 105**
- **Found during:** Task 2, reading 09-places-check.mjs as plan 09-03 left it
- **Issue:** The plan and the sketch README's "Measured" say 88 to 105; plan 09-03 already found that the boards themselves draw 126 for "Coconut, Shredded (unsweetened)" and 109 for the olive oil entry, and the built page matches the board row for row. The new per-name check (`--evidence`) confirms it: all 25 closed rows have the board's height by name.
- **Fix:** the script keeps 88 to 126 for the 26-entry dataset, with the reason in its header. The README prose is the number that is off; I did not edit it (a sketch file).
- **Files modified:** 09-places-check.mjs
- **Commit:** 6855104a

**2. [Rule 1 - measured data differs from the board's stand-in] Current mode: one new entry is taller than the 103-name board's 109**
- **Found during:** Task 2, first run of `--library current` (1 FAIL)
- **Issue:** Milk Chocolate's closed row is 122 at 393. Its summary line ("Fat 29.66% · Milk solids 16% · Sugar 42.78% · Other solids 10.06% · Freezing 4.78 · Sweetness 51.6") wraps to three lines; the 103-name board's stand-in Milk Chocolate has no "Other solids" and draws 105. The rules are the board's; the real entry's content is longer. The seeded library also holds the original 26, whose two wrapping names run to 126, so one 71 to 109 range cannot hold for all 111 rows.
- **Fix:** the 393 row heights are checked in three groups: the original 26 at 88 to 126; new entries at 71 to 109; and a new entry whose summary wraps to more lines than the board's tallest summary (the tallest is read from the board file, 34 px) held to the 126 ceiling, with its name and height printed in the detail. Today that group is Milk Chocolate at 122 and the other groups hold the original 26 rows and 84 new ones. This is a gap against the stand-in board for plan 09-17 to name, not a rule edited here.
- **Files modified:** 09-places-check.mjs
- **Commit:** 6855104a

**3. [Rule 3 - plan vs board] The 393 "closed" board panel draws Heavy cream open**
- **Found during:** Task 2, first evidence run (the pair differed because the built page was scrolled to the opened entry)
- **Issue:** The plan lists "closed, Heavy cream open, milk typed" as the states; board panel `pi2` (the 393 first screen) already has Heavy cream open below the fold, so there is no all-closed 393 panel to pair with.
- **Fix:** the pair is named `ingredients-top-393` (Heavy cream open, scrolled to the top), and 1366 `pi1` is the matching full page. Seven pairs in all. Two capture details follow the board: a 1366 picture is taken in a window as tall as the panel so a short page is not padded, and the Name field is blurred before the "milk" shot because the boards draw the field at rest.
- **Files modified:** 09-places-check.mjs
- **Commit:** 6855104a

**4. [Process] Commit attribution**
- The dispatch notes asked for `Co-Authored-By: Claude Fable 5.1`; the harness's attribution reminder names Claude Sonnet 5.5, the model that wrote the commits (plan 09-03 did the same), so both commits carry Sonnet 5.5.

**Additions beyond the plan's wording (small, in the places check):** the unfiltered count line is checked in both modes, a category choice is checked in both modes (the plan names Sugar for original and Fruit for current), and `--evidence` is refused outside original mode because the boards draw 26 entries.

**Total deviations:** 3 auto-fixed (2 rule 1, 1 rule 3) plus one process note. **Impact:** none on scope; every deviation is a number or a state the board contradicts, and none relaxes a check without a named reason.

## Issues Encountered

- The worktree had no `app/node_modules`; the main checkout's was symlinked (untracked, ignored). No package was installed.
- `09-walk-check.sh` builds to `${TMPDIR:-/tmp}/sprinkles-09`; it was run with `TMPDIR` pointed at the session scratchpad, so the build went there and `app/dist` was never written. `09-dist-guard.sh scan` prints `SCAN OK 10 build commands, each with --outDir` and `check` prints `DIST UNCHANGED`.
- The plan's verify chains the walk-check and the selftest in one `&&` line; the shell tool refuses a line that mixes a variable path with those commands, so the three steps were run as separate commands with the literal paths, each with the plan's arguments.

## Known Stubs

None.

## Threat Flags

None. T-09-31 (the walk allow-list) is mitigated as planned: each path checks its exact expected value, nothing outside `stores.` is allowed, the required-additions pass fails on a field missing from both files, selftest proves a wrong value at a permitted path and a missing addition each still fail, and the expected mode checks the expected values against the seed first with the same functions.

## Deferred Human Verification

The side-by-side pictures are Playwright WebKit on the dev machine. The iPad and iPhone device check, the two questions plan 09-03 left for Mark (Packed state wording, lactose rows), the basis-and-source spacing at 393 and the Milk Chocolate row at 122 are for plan 09-17's rows.

## Next Phase Readiness

Plan 09-17 can walk the device row's steps with `09-places-check.mjs --library current`, name the Milk Chocolate gap and the basis and source spacing in the device row's detail, and run the WebKit 9-to-10 reset.

## Self-Check: PASSED

- Files exist: 09-walk.mjs, 09-walk-after.json, 09-places-check.mjs, 09-places-evidence/README.md and 14 PNGs; FOUND
- Commits `a1df0365` and `6855104a` are ancestors of HEAD; FOUND
- Acceptance: expected mode PASS a, b, c, d; compare ALLOWED, REQUIRED, MATCH 94; selftest PASS x8; 0 dumped rows lacking a D-20 key and 0 versions lacking an own serveTempC in 09-walk-after.json (7120 rows, 382 versions); `titratableAcidity` appears 16 times and `serveTempC` 11 times in 09-walk.mjs; the record body equals 08-walk.mjs's; `'expected'` is in the mode switch and calls the same functions the allow-list uses
- Places: original with --evidence 48 PASS 0 FAIL, current 48 PASS 0 FAIL, a run without --library refused; 14 PNGs
- Full suite: 113 files, 3467 passed
