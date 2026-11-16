---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
verified: 2026-11-16T09:39:30Z
status: gaps_found
score: 12/14 must-haves verified
covered_files:
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-01-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-01-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-02-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-02-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-03-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-03-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-04-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-04-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-05-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-05-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-06-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-06-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-07-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-07-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-print-check.mjs"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-roundtrip.mjs"
  - "app/src/domain/axes.js"
  - "app/src/domain/creation.js"
  - "app/src/styles/print.css"
  - "app/src/styles/tokens.css"
  - "app/src/ui/AxisMark.jsx"
  - "app/src/ui/BatchRow.jsx"
  - "app/src/ui/PrintLogPages.jsx"
covered_digest: "v4:sha256:d6ffe9d6c0a0141c6df56e4324ab3842833583a04044c7d4e86270e99d2053da"
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "On the final build the Phase 11 walk still ends 'MATCH 94 snapshots' (no seeded or walked state moved) ... all from one command, 12-check.sh, which ends 'GATE1 PASS' (plan 12-05 must-have)"
    status: failed
    reason: "12-check.sh exits 1 on merged main. Every step before the last passes; the last step, the Phase 11 walk (11-walk-check.sh), fails 15 scenarios with selector timeouts and prints no 'MATCH 94 snapshots' line, so 'GATE1 PASS' is never printed. The failure predates Phase 12: the same 15 scenarios fail on e37db11a, the commit before Phase 12, and the failing set is identical. The cause is a stale walk script, not Phase 12's app code: 11-walk.mjs still drives input[aria-label=\"Version name\"] (11-walk.mjs:116, :1264) and .nb__new input, while the app has rendered those fields as one-row textareas since the 2026-11-01 quick fixes (app/src/ui/CreationPage.jsx:65 queries textarea[aria-label=\"Version name\"]). As a result the Phase 11 flows (create, edit first version, version pen, record pen, correction, tasting remove/restore) are not re-proven on the Phase 12 build, and the plan's regression gate cannot be satisfied as written."
    artifacts:
      - path: ".planning/phases/11-steps-structure-save-and-print/11-walk.mjs"
        issue: "Selectors stale against post-Phase-11 quick fixes (input[aria-label=\"Version name\"], input[aria-label=\"Duration...\"], .nb__new input, and the like); 15 scenarios time out on base and on main alike"
      - path: ".planning/phases/11-steps-structure-save-and-print/11-walk-before.json"
        issue: "Baseline may need re-recording once the selectors are repaired; not checked here"
      - path: ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh"
        issue: "Correctly refuses to print GATE1 PASS; no change needed except that it cannot pass until the walk is repaired"
    missing:
      - "Refresh 11-walk.mjs's selectors to the current build (tag-free [aria-label=...] and .nb__new textarea, as 12-roundtrip.mjs already uses) and rerun the walk on the pre-Phase-12 commit first, so any snapshot difference is traced to the app change that caused it"
      - "Re-baseline 11-walk-before.json only for differences traced to the 2026-11-01 quick fixes, never for a difference from Phase 12's change; Phase 12 changes no walked screen"
      - "Rerun 12-check.sh to a printed 'GATE1 PASS' (round two's gate needs it as well, because 12-check.sh is rerun after Gate 2 lands)"
deferred: []
human_verification:
  - test: "PROOF-02 and success criterion 3 (round two, not yet planned): on the iPad, from the production build, create a recipe end to end with its scales, problems and targets, Tab through every creation control including each Move button, move a step and a row and check focus stays with the moved item, then print"
    expected: "Tab reaches every creation control, focus stays with the moved step or row, the recipe prints"
    why_human: "Device behaviour (Magic Keyboard Tab, touch, print) cannot be proven by Playwright WebKit, WKWebView or the iOS Simulator; waits for Design gate 2's work (D-06, D-11, D-13)"
  - test: "Clipboard paper check (Mark's List row adoajjb9sgzbezmyrt4s, stays open): print the Batch log and the Tasting log from the iPad, put them on the clipboard"
    expected: "Every printed line is clear of the clip, and each log is one sheet"
    why_human: "Only paper and the real print path show the clip clearance; the WebKit PDF (ink starts 109.0 pt down, 1.5 in is 108 pt) is device-unverified"
  - test: "Open Question 2, a decision for Mark: long scale names, end words and problem words spill the Tasting log by 17.8 px in Safari ('Side 2 of 2' lands on page 3 over the first bench sheet page); end words run 28 to 54 px past their 76 px column"
    expected: "Mark decides whether to cap the words, wrap them, shrink the row, or contain the page"
    why_human: "Product decision; LOG-01 says each log 'still prints on one page' and the build does not guarantee it for unbounded maker text"
---

# Phase 12: Showing a recipe's own scales and problems, and the whole loop - Verification Report

**Phase Goal:** A batch recorded against a created recipe marks the recipe's own scales and problems, which the record pen, the reading and the printed log show, and a recipe created in the app survives the whole loop, checked on the iPad
**Verified:** 2026-11-16T09:39:30Z
**Status:** gaps_found
**Re-verification:** No - initial verification (round one of two; D-06)

## Scope of this report

This is round one of Phase 12 (Design gate 1 only). The ROADMAP entry states two design gates; Gate 2's work (entry points below 724, Preview step in the version pen, the creation editor's row controls) and PROOF-02's iPad check (success criterion 3) belong to a second planning round that is not planned yet (12-CONTEXT D-06). The phase goal as a whole therefore is not achieved: its iPad half is open by design. This report verifies the round-one must-haves and says plainly what round two and a human still owe.

Nothing here is device-verified. Playwright WebKit, WKWebView and the iOS Simulator are not the iPad.

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
| -- | ----- | ------ | -------- |
| 1  | SC1: the record pen, the reading and the printed log show a recipe's own scales, each in its kind, and its problems, and "This recipe only" shows only for a recipe that has any | VERIFIED | `axes.js` readers `stopWordsFor`, `stopLabelFor`, `middleWordFor`, `readMarkText` branch on `kind === 'magnitude'`; `AxisMark.jsx:40,105` and `PrintLogPages.jsx:150` call them; `BatchRow.jsx:310` prints `readMarkText`; the cue is conditional (`BatchRow.jsx:215,238,258`; `CreationSetup.jsx:243,311`). Independent: 513 tests pass across the seven touched test files; stops probe passed on merged main (pen, reading, editor: 9 PASS); board check 1090 PASS, 0 FAIL |
| 2  | SC2: a recipe created in the app round-trips: prints, a batch marks a custom scale, after export and import it reopens with the same figures, Sheet code and marks | VERIFIED | I reran `12-roundtrip-check.sh` on merged main with a scratch build: two runs, identical made records, `ROUNDTRIP PASS`. PASS lines cover all eight exported stores both ways, `buildFigures` deep-equal and the Balance text equal in A and B, reading `2 of 5` and `heavy (5)` in B, Sheet code `688G-HZQN` in the print foot and found by search in B |
| 3  | SC3: on the iPad, from the production build, a maker creates a recipe end to end and prints it; Tab reaches every creation control, each Move button included; focus stays with the moved item | NOT ATTEMPTED (round two) | D-06, D-11: runs after Gate 2's control-order changes land. No plan exists yet. Needs a human on the device |
| 4  | 12-01: the kind branch lives only in `axes.js`; every kind but `magnitude`, a missing one included, reads as Right in the middle; a recorded batch reads its own snapshot (`axesForBatch`), not the live version; stored marks stay 1 to 5 | VERIFIED | `axes.js:22-27` (`isMagnitude`), `AxisMark.jsx` and `BatchRow.jsx` contain no kind test; `BatchRow.jsx:292` reads `axesForBatch(batch)`; `git diff e37db11a..HEAD --name-only -- app/src/store app/src/data app/package.json` is empty (no store shape, DB_VERSION or dependency change). `creation.js` compares `kind` only to validate a draft, not to present |
| 5  | 12-01: the creation editor's Low to high stops line reads `faint · 2 · 3 · 4 · strong` (flagged assumption A1) | VERIFIED (assumption stands) | `creation.js:306-312` maps null stops to numbers; probe line `PASS editor .mk-stops reads "faint · 2 · 3 · 4 · strong"`. A1 is in one commit (2cbbdd3a) so a veto is a revert; Mark has not vetoed it |
| 6  | 12-02: a printed Low to high row has nothing under its ticks, and every scale row is 36 px | VERIFIED | `PrintLogPages.jsx:150,164` draws `.lf-mid` only when `middleWordFor` gives a word; `print.css:337` `grid-template-rows` holds the row; print check `rows`: 12 PASS including "every scale row is 36 px tall (within 0.5 px)" |
| 7  | 12-02: both log pages start 1.5 in down (144 px picture padding; 90 px WebKit and 96 px other engines in print); bench sheet pages keep 0.5 in; notes lines 13 and 4; the fullest normal recipe fits one page | VERIFIED (scoped to the fullest normal recipe) | `tokens.css:558-559`; `print.css:107-111,915-921`; `PrintLogPages.jsx:133,206`; print check `drop`/`lines`/`fit` PASS (Batch log needs 790 of 810, spare 20; Tasting log 767.9 of 810, spare 42.1); WebKit PDF: page 1 and 2 ink starts 109.0 pt down (window 100.8 to 115.2), first bench page 40.5 pt. Worst case does not fit (see Warnings) |
| 8  | 12-02: LOG-01 is in REQUIREMENTS.md and ROADMAP; the single design gate paragraph is restated as Gate 1 (met) and Gate 2 (not met) | VERIFIED | `REQUIREMENTS.md:63,135`; ROADMAP Phase 12 Requirements line reads "TASTE-04, PROOF-01, PROOF-02, LOG-01" and the Design gate 1 / Design gate 2 paragraphs are present |
| 9  | 12-03: PROOF-01 is proven by a scripted WebKit walk through the built app's own editor, Save, Export button and Import input, field by field, deterministic | VERIFIED | See truth 2. `12-roundtrip.mjs` drives only the heading controls; no store function is called; two runs byte-identical (my rerun) |
| 10 | 12-04: all sixteen drawn sketch-015 panels equal the build within 1 px in WebKit, and the checks can fail | VERIFIED | I reran `12-board-check.mjs` with 12-board-selftest, pen, reading and logs specs and `--selftest` against a scratch build of merged main: `1090 PASS, 0 FAIL`, exit 0, including the five engine refusals |
| 11 | 12-05: the logs print one page each through WebKit's PDF path; mobile Safari in the Simulator draws the Low to high pen and reading with no sideways scroll; all labelled device-unverified, no device row | VERIFIED (device-unverified) | `12-check.sh` output on merged main: `pdf` 5 PASS, `sim` 7 PASS (width 390, `["faint","strong"]`, `["1: faint","2","3","4","5: strong"]`, `2 of 5`, `heavy (4)`, scrollWidth 390). No device row written (orchestrator's note) |
| 12 | 12-05: on the final build the Phase 11 walk still ends 'MATCH 94 snapshots' and 12-check.sh ends 'GATE1 PASS' | FAILED | `12-check.sh` last line `FAIL walk exited non-zero`; 15 scenarios time out. Identical 15 fail on e37db11a (checked: same scenario set in `walk-base.txt` and `gate1-main.txt`). Cause: stale walk selectors (`11-walk.mjs:116` `input[aria-label="Version name"]` against `CreationPage.jsx:65` `textarea[aria-label="Version name"]`). Not Phase 12's app code, but the plan's gate is unmet and the Phase 11 flows are unproven on this build |
| 13 | 12-06: the probe can fail; on a base build it exits 1 with FAIL for pen, reading and editor; the bug row's steps are reproduced | VERIFIED (from SUMMARY, structurally supported) | `12-06-SUMMARY.md` quotes the four FAIL lines on base e37db11a and "what rendered right". I did not rebuild the base; the diff shows the base readers were kind-blind (`readMarkWord`, `stopWordsFor` returned goldilocks words for every kind), consistent with the quoted output. The probe passes on main (9 PASS) |
| 14 | 12-07: the board engine is `11-board-check.mjs` with four recorded changes; stand-ins pass and five refusals show; no build touched | VERIFIED | `12-board-selftest.mjs` ran inside my board check (see truth 10): `PASS selftest read-self-1366` and the five `refused:` lines; `11-board-check.mjs` is outside the Phase 12 diff |

**Score:** 12/14 truths verified (1 failed, 1 not attempted in round one by design). 0 present-but-behavior-unverified.

### Deferred Items

None. Success criterion 3 is not deferred to a later phase; it is the second round of this phase (D-06) and is listed as outstanding below.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `app/src/domain/axes.js` | kind-aware readers | VERIFIED | `readMarkText` at line 112, `stopLabelFor`, `middleWordFor`; wired from AxisMark, BatchRow, PrintLogPages, creation.js |
| `app/src/ui/AxisMark.jsx` | stops named by `stopLabelFor`; middle span only when a word exists | VERIFIED | lines 40, 105 |
| `app/src/ui/PrintLogPages.jsx` | row in its kind; 13 and 4 notes lines | VERIFIED | lines 133, 150, 164, 206 |
| `app/src/styles/tokens.css` / `print.css` | clipboard drop tokens and rules | VERIFIED | `--sheet-print-clipboard-drop` and `-webkit`; only three rules read them; `.print-page--sheet` untouched |
| `12-print-check.mjs`, `12-roundtrip.mjs`, `12-roundtrip-check.sh`, `12-stops-probe.mjs`, `12-cases.mjs`, `12-board-*.mjs`, `12-safari-check.mjs`, `12-wkprint.swift`, `12-check.sh` | harnesses | VERIFIED | all present; all but the final walk step of `12-check.sh` pass on merged main |
| `11-walk.mjs` (Phase 11) | regression gate for 12-check.sh | STALE | see Gap 1 |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| AxisMark.jsx | axes.js | `stopLabelFor(axis, stop)`, `middleWordFor(axis)` | WIRED | lines 2, 40, 105 |
| BatchRow.jsx | axes.js | `axesForBatch(batch)` then `readMarkText(axis, marks[axis.key])` | WIRED | lines 292, 310 |
| creation.js | axes.js | `stopWordsFor(scale)` in `scaleStopsLine` | WIRED | line 309 |
| PrintLogPages.jsx | axes.js | `middleWordFor(axis)` | WIRED | line 150 |
| PrintSheet.jsx | print.css | route class `print-pages--webkit` / `--other` picks the drop | WIRED | `PrintSheet.jsx:134`; `print.css:915-921` |
| 12-check.sh | 11-walk-check.sh | the Phase 11 walk as regression gate | WIRED but the gate fails | Gap 1 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| reading cell | `marks[axis.key]`, `axis.kind` | batch snapshot (`axesForBatch`) from the stored batch | Yes: roundtrip reads `2 of 5` in A and in B after import | FLOWING |
| record pen | `axis` definitions | `axesForVersion(version, catalog)` from the stored version's `declaredAxes` | Yes: probe and Simulator read the injected recipe's scales | FLOWING |
| printed Tasting log | scale rows, problems | `axesForVersion` and `version.declaredFlaws` | Yes: print check and roundtrip see Body then Coffee flavour after the four core scales | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Seven touched test files | `npx vitest run` on axes, AxisMark, PrintLogPages, print, creation, CreationSetup, BatchRow tests | 7 files, 513 tests passed | PASS |
| Whole loop in WebKit, twice | `sh 12-roundtrip-check.sh` (scratch build) | `ROUNDTRIP PASS`, identical dumps | PASS |
| Board against build | `12-board-check.mjs` + 4 specs `--selftest` | 1090 PASS, 0 FAIL | PASS |
| Whole suite, probe, print, pdf, sim | orchestrator's `12-check.sh` run on merged main (output read, not rerun) | 4410 tests pass; 112 PASS lines; no FAIL before the walk | PASS (reported) |
| Phase 11 walk | last step of `12-check.sh` | 15 scenarios FAIL | FAIL (pre-existing) |

### Probe Execution

The phase's probes are the harness steps above (`12-stops-probe.mjs`, `12-print-check.mjs`, `12-roundtrip.mjs`, `12-safari-check.mjs`). No `scripts/*/tests/probe-*.sh` is declared. The first three plus the board check were run or read on merged main as shown; no missing probe.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| TASTE-04 | 12-01, 12-02, 12-04, 12-05, 12-06, 12-07 | the pen, the reading and the printed log show a recipe's own scales each in its kind, and its problems; "This recipe only" only when it has any | SATISFIED (round one) | Truths 1, 4, 5, 6, 10. REQUIREMENTS.md still shows `[ ]` and "Pending"; tracking is for the orchestrator to update |
| PROOF-01 | 12-03, 12-05 | a created recipe round-trips: print, record a batch with a custom scale, export, import | SATISFIED | Truths 2, 9 (my own rerun) |
| LOG-01 | 12-02, 12-04, 12-05, 12-07 | log pages start about 1.5 in down, each still on one page, room out of the ruled notes lines | SATISFIED for the fullest normal recipe; paper check and long-words case open | Truths 6, 7, 11; the clipboard check is a human item |
| PROOF-02 | none in round one | creation checked on the iPad from the production build, Move focus and keyboard reach | NOT YET (round two) | No plan covers it; D-06 |

All four IDs REQUIREMENTS.md maps to Phase 12 appear in at least one plan's `requirements` field except PROOF-02, which is deliberately left to round two. No orphaned IDs beyond that.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (changed app files and Phase 12 scripts) | - | TBD / FIXME / XXX scan | none | No debt markers in the Phase 12 diff; no `dangerouslySetInnerHTML` added |
| `app/src/styles/print.css` / `PrintLogPages.jsx` | 915-921, 133, 206 | Log pages carry little slack; Tasting log spills with long maker words (code review WR-01) | Warning | Safari print of a recipe with long scale names/ends/problem words overprints the first bench page by 17.8 px; unbounded input, no guard; decision with Mark |
| `app/src/styles/print.test.js` | 97-137 | Notes-line counts not tied to the drop by any gate in the Vitest run (code review WR-02) | Warning | A later token change could overflow a log with all tests green; the real fit check is `12-print-check.mjs`, outside Vitest |
| `app/src/domain/axes.js` | 37-40, 100-104, 112-118 | `stopWordsFor` returns null entries; `readMarkWord` exported and kind-blind; strict vs coercing comparison (IN-01, IN-02) | Info | Trap for future callers, not reachable today |
| `.planning/phases/12-*/12-REVIEW-DISPOSITION.md` | - | All six review findings sit at `open` (untriaged) | Warning | Not triaged to fixed, skipped or deferred before the phase proceeds |
| `12-SECURITY.md` T-12-09 | - | `--out` guard accepts any path under `$TMPDIR` (medium, below the blocking threshold) | Info | One-line fix; non-blocking; `status: verified` not yet set in 12-SECURITY.md |

No blocker anti-pattern in app code.

### Human Verification Required

#### 1. PROOF-02: creation checked on the iPad (round two)

**Test:** After Gate 2's work lands, from `npm --prefix app run build && npm --prefix app run preview -- --host`, create a recipe end to end on the iPad with its scales, problems and targets, Tab through every creation control, press each Move button, check focus after each move, then print.
**Expected:** Tab reaches every creation control, each Move button included; focus stays with the moved step or row; the recipe prints.
**Why human:** Device Tab order, touch and print cannot be proven by Playwright WebKit, WKWebView or the Simulator.

#### 2. LOG-01 paper check (Mark's List row `adoajjb9sgzbezmyrt4s`, still open)

**Test:** Print the Batch log and the Tasting log from the iPad and put them on the clipboard.
**Expected:** Every printed line is clear of the clip; each log is one sheet.
**Why human:** Paper and the real print path; the WebKit PDF (ink starts 109.0 pt down) is a stand-in.

#### 3. Open Question 2: long words spill the Tasting log (a decision for Mark)

**Test:** Review the REPORT numbers (17.8 px spill in Safari, end words 28 to 54 px past their 76 px column) and decide whether to cap, wrap, shrink or contain.
**Expected:** A decision; any fix is a new plan with the fit check as its gate.
**Why human:** Product decision. LOG-01's "each still prints on one page" is not guaranteed for unbounded maker text.

### Gaps Summary

One must-have is FAILED: plan 12-05's regression gate. `12-check.sh` does not reach `GATE1 PASS` on merged main because its last step, the Phase 11 walk, fails 15 scenarios and prints no `MATCH 94 snapshots` line. I checked the claim that Phase 12 did not cause it: the failing scenario set on the pre-Phase-12 commit e37db11a is identical to the set on merged main, and the cause is visible in the files (the walk drives `input[aria-label="Version name"]`; the app renders a `textarea` since the 2026-11-01 quick fixes). So the app code is not at fault, but the gate the plan wrote is unmet, and the Phase 11 create, edit, version-pen, record-pen, correction and tasting flows are not re-proven on this build by anything. This is a gap for a closure plan (repair the walk's selectors, rerun on the pre-Phase-12 commit first, re-baseline only for differences the quick fixes caused), not something to wave through, and round two needs it because `12-check.sh` is rerun after Gate 2.

Everything else in round one holds up under independent check: the kind-aware readers, the pen, the reading, the printed row and the clipboard drop, the full create-print-batch-export-import loop (rerun by me, two identical runs), and board against build (rerun by me, 1090 PASS, 0 FAIL).

Still owed after this gap closes: round two (Gate 2 boards, their plans, and PROOF-02's iPad walk on the final control order), the clipboard paper check, Mark's decision on long words, and triage of the six open code review findings (WR-01 and WR-02 bear on LOG-01's one-page guarantee). Mark's List row `bug-p11-low-to-high-scale-centre-mark` waits on a real `GATE1 PASS` by the plans' own rule; `adoajjb9sgzbezmyrt4s` waits on round two's paper check. The REQUIREMENTS.md checkboxes for TASTE-04, PROOF-01 and LOG-01 are still unchecked and are for the orchestrator to update once the gap closes.

---

_Verified: 2026-11-16T09:39:30Z_
_Verifier: Claude (gsd-verifier)_
