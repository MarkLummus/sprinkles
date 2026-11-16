---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
verified: 2026-11-16T14:36:00Z
status: human_needed
score: 13/14 must-haves verified
covered_files:
  - ".planning/phases/11-steps-structure-save-and-print/11-walk-before.json"
  - ".planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh"
  - ".planning/phases/11-steps-structure-save-and-print/11-walk.mjs"
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
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-PLAN.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-SUMMARY.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-trace-check.mjs"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-walk-trace.md"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-print-check.mjs"
  - ".planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-roundtrip.mjs"
  - "app/src/domain/axes.js"
  - "app/src/domain/creation.js"
  - "app/src/domain/creationSave.js"
  - "app/src/styles/print.css"
  - "app/src/styles/tokens.css"
  - "app/src/ui/AxisMark.jsx"
  - "app/src/ui/BatchRow.jsx"
  - "app/src/ui/PrintLogPages.jsx"
covered_digest: "v4:sha256:bc2c7f27333edcd7b48c189eaf26f331989f3100f511fc8954eeb90a9a7238f7"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 12/14
  gaps_closed:
    - "12-05: on the final build the Phase 11 walk still ends MATCH 94 snapshots and 12-check.sh ends GATE1 PASS (closed by plan 12-08)"
  gaps_remaining: []
  regressions: []
gaps: []
deferred: []
human_verification:
  - test: "PROOF-02 and success criterion 3 (round two, not yet planned): on the iPad, from the production build (npm --prefix app run build && npm --prefix app run preview -- --host), create a recipe end to end with its scales, problems and targets, Tab through every creation control including each Move button, move a step and a row and check focus stays with the moved item, then print"
    expected: "Tab reaches every creation control, focus stays with the moved step or row, the recipe prints"
    why_human: "Device behaviour (Magic Keyboard Tab, touch, print) cannot be proven by Playwright WebKit, WKWebView or the iOS Simulator. By 12-CONTEXT D-06 and D-11 and the ROADMAP Plans line it runs after Design gate 2's work (entry points below 724, Preview step in the version pen, the creation editor's row controls) is drawn, planned and built; none of that exists yet"
  - test: "Clipboard paper check (Mark's List row adoajjb9sgzbezmyrt4s, stays open): print the Batch log and the Tasting log from the iPad and put them on the clipboard"
    expected: "Every printed line is clear of the clip, and each log is one sheet"
    why_human: "Only paper and the real print path show the clip clearance. The WebKit PDF (ink starts 109.0 pt down; 1.5 in is 108 pt) is device-unverified. Waits for the iPad rows (D-13)"
  - test: "G11 in 12-08-walk-trace.md, a confirmation for Mark: after Save over this version in the first-version editor, focus now rests on the Next version button where the old baseline had it on the version identity heading (commit c5373fb2, 2026-11-10, whose subject names Cancel)"
    expected: "Mark confirms focus after Save over should rest on Next version, or asks for a fix by a new quick task"
    why_human: "The baseline absorbed it under Mark's blanket rule of 2026-11-16 ('All pre-Phase-12 fixes'), but the summary itself marks it intended-yes with a wrinkle. A focus decision is a product call and a device check; not a Phase 12 change"
---

# Phase 12: Showing a recipe's own scales and problems, and the whole loop - Verification Report

**Phase Goal:** A batch recorded against a created recipe marks the recipe's own scales and problems, which the record pen, the reading and the printed log show, and a recipe created in the app survives the whole loop, checked on the iPad
**Verified:** 2026-11-16T14:36:00Z
**Status:** human_needed
**Re-verification:** Yes - after gap closure (plan 12-08); every must-have re-checked, not only the closed gap

## Scope of this report

Round one of Phase 12 (Design gate 1) is complete and verified. The phase as a whole is not complete: the ROADMAP entry states two design gates, and 12-CONTEXT D-06 puts Gate 2's work (entry points below 724, Preview step in the version pen, the creation editor's row controls) and PROOF-02's iPad check (success criterion 3, D-11) in a second planning round that has not been planned yet. ROADMAP's Phase 12 Plans line says so in so many words ("a second planning round adds Gate 2's plans and the iPad proof"). Success criterion 3 therefore stays open by design; it is not deferred to a later phase and it is not a failed round-one plan. The status is `human_needed` because the only remaining items are a device check (PROOF-02), a paper check and a focus confirmation, not a defect in what was built. Treat the phase as "round one verified, round two owed", not as done.

Nothing here is device-verified. Every automated result is Playwright WebKit, WKWebView or the iOS Simulator, not the iPad.

## What changed since the first report

- The one FAILED truth (12-05's regression gate) is closed. I ran `sh .planning/phases/12-.../12-check.sh` myself on HEAD 70da570a: exit 0, `Test Files 134 passed (134)`, `Tests 4425 passed (4425)`, no FAIL line, the walk step prints `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`, and the last line is `GATE1 PASS`.
- Quick tasks 261116-80u (word limits at Save) and 261116-80v (no numbers on a Low to high scale) landed after the first report and are now part of what is verified. 80u resolves the first report's Open Question 2 (long words spilling the Tasting log): Mark decided limits (`SCALE_WORD_LIMITS = { name: 16, low: 12, high: 12 }`, `PROBLEM_WORD_LIMIT = 40` in `creation.js:358-359`, enforced in `creationSave.js:219-231`). 80v amends D-01: a Low to high scale shows no numbers in the pen, the printed row or the editor's stops line.
- Code review WR-01 is now `fixed` (12-REVIEW-DISPOSITION); five lower findings stay `open` (see Anti-Patterns).

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
| -- | ----- | ------ | -------- |
| 1  | SC1: the record pen, the reading and the printed log show a recipe's own scales, each in its kind, and its problems, and "This recipe only" shows only for a recipe that has any | VERIFIED | `axes.js` readers `stopWordsFor`, `stopLabelFor`, `middleWordFor`, `readMarkText` branch on `isMagnitude(axis)` (`axes.js:28-69,125`); `AxisMark.jsx`, `BatchRow.jsx` and `PrintLogPages.jsx` call them. The cue is conditional: `BatchRow.jsx:211-258` (`hasDeclared`), `CreationSetup.jsx:243` (`createDraft.scales.length > 0`). Gate run: probe 26 PASS (pen, reading, editor), print 30 PASS, sim 7 PASS (`["faint","strong"]`, `2 of 5`, `heavy (4)`); my board check 1256 PASS, 0 FAIL |
| 2  | SC2: a recipe created in the app round-trips: prints, a batch marks a custom scale, after export and import it reopens with the same figures, Sheet code and marks | VERIFIED | `12-roundtrip.mjs` inside the gate run: 68 PASS, 0 FAIL, including `export the download is sprinkles-store.json`, `reading A` and `reading B` both `Coffee flavour reads 2 of 5` and `Body reads heavy (5)`, `print A` and `print B` both carry Sheet code `688G-HZQN`, and `search B: the Sheet code 688G-HZQN finds the made version`. (The first report also ran it twice for identical dumps; this round it ran once, inside the gate.) Driven through the heading controls only |
| 3  | SC3: on the iPad, from the production build, a maker creates a recipe end to end and prints it; Tab reaches every creation control, each Move button included; focus stays with the moved item | NOT ATTEMPTED (round two, by design) | D-06 and D-11: runs after Gate 2's control-order changes land. No Gate 2 board is approved, no round-two plan exists, and the needed controls (row control order, Add ingredient per row, Preview step in the pen) are not built. Needs a human on the device. Listed as human verification item 1 |
| 4  | 12-01: the kind branch lives only in `axes.js`; every kind but `magnitude`, a missing one included, reads as Right in the middle; a recorded batch reads its own snapshot (`axesForBatch`), not the live version; stored marks stay 1 to 5 | VERIFIED | `axes.js:28` `isMagnitude`; `AxisMark.jsx` and `BatchRow.jsx` contain no kind test; `BatchRow.jsx` reads `axesForBatch(batch)`. `git diff --name-only e37db11a HEAD -- app/src/store app/src/data app/package.json` prints nothing: no store shape, DB_VERSION or dependency change |
| 5  | 12-01 as amended by 261116-80v: the creation editor's Low to high stops line reads `faint to strong` (12-01's assumption A1, `faint · 2 · 3 · 4 · strong`, was reverted by 80v/9fdbd576 at Mark's word) | VERIFIED (supersedes the first report's truth 5) | `creation.js:305-311` `scaleStopsLine` returns `${scale.low} to ${scale.high}` for `magnitude`; gate run line `PASS editor .mk-stops reads "faint to strong"` and `PASS editor no word right outside a Kind option label`. The first report's `faint · 2 · 3 · 4 · strong` is out of date, not a regression |
| 6  | 12-02 as amended by 80v: a printed Low to high row has nothing under its ticks and no 1 and 5, and every scale row is 36 px | VERIFIED | `PrintLogPages.jsx` draws the middle word only when `middleWordFor` gives one; print check `rows`: all PASS including every scale row 36 px (within 0.5 px), also at the longest allowed words (`PASS worst ... every scale row is 36 px tall`) |
| 7  | 12-02: both log pages start 1.5 in down (144 px picture padding; 90 px WebKit and 96 px other engines in print); bench sheet pages keep 0.5 in; notes lines 13 and 4; the fullest normal recipe fits one page | VERIFIED | Gate run: print `fit` Batch log needs 790 of 810 (spare 20), Tasting log 767.9 of 810 (spare 42.1); WebKit PDF `page 1 ink starts 109.0 pt down`, `page 2 ... 109.0 pt down`, `first page after the logs ink starts 40.5 pt down (at most 54)`. The worst case no longer spills: with Mark's word limits the Tasting log at the longest allowed words needs 804.8 of 810 in Safari (spare 5.2 px, `PASS worst longest allowed words: ... fits one page`). The margin is thin but checked |
| 8  | 12-02: LOG-01 is in REQUIREMENTS.md and ROADMAP; the single design gate paragraph is restated as Gate 1 and Gate 2 | VERIFIED | `REQUIREMENTS.md:63` LOG-01, traceability row `LOG-01 \| Phase 12 \| Complete`; ROADMAP Phase 12 Requirements line `TASTE-04, PROOF-01, PROOF-02, LOG-01` |
| 9  | 12-03: PROOF-01 is proven by a scripted WebKit walk through the built app's own editor, Save, Export button and Import input, field by field, deterministic | VERIFIED | See truth 2. No store function is called by the walk; 68 PASS this round |
| 10 | 12-04: all drawn sketch-015 panels equal the build within 1 px in WebKit, and the checks can fail | VERIFIED | I ran `12-board-check.mjs` with the selftest, pen, reading, logs and (new since 80u) limits specs plus `--selftest` against the gate run's scratch build of HEAD: `1256 PASS, 0 FAIL`, exit 0 (the first report's 1090 PASS predates the 80u/80v boards) |
| 11 | 12-05: the logs print one page each through WebKit's PDF path; mobile Safari in the Simulator draws the Low to high pen and reading with no sideways scroll; all labelled device-unverified, no device row | VERIFIED (device-unverified) | Gate run: `pdf` 7 PASS, `sim` 7 PASS; no device row written |
| 12 | 12-05 (the gap): on the final build the Phase 11 walk ends 'MATCH 94 snapshots' and 12-check.sh ends 'GATE1 PASS' | VERIFIED (gap closed) | My own run: exit 0; `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`; last line `GATE1 PASS`. See "The re-baseline, examined" below |
| 13 | 12-06: the probe can fail; on a base build it exits 1 with FAIL for pen, reading and editor; the bug row's steps are reproduced | VERIFIED (from SUMMARY, structurally supported; not re-run) | I did not rebuild the base commit. The probe passes with 26 PASS on HEAD; the base-build FAIL lines are quoted in 12-06-SUMMARY and the base readers were kind-blind |
| 14 | 12-07: the board engine is `11-board-check.mjs` with four recorded changes; stand-ins pass and five refusals show; no build touched | VERIFIED | `PASS selftest ...` lines and the refusals ran inside my board check (truth 10) |

**Score:** 13/14 truths verified. The 14th is success criterion 3, deliberately not attempted in round one. 0 present-but-behavior-unverified.

### The re-baseline, examined (12-08)

Re-baselining a regression gate is the way a gate gets defeated, so I checked it directly rather than trusting the summary.

- **No app code touched.** `git log --name-only d7cd5341..HEAD -- app` prints nothing: 12-08 changed only `.planning/` harness files.
- **Walk not loosened.** Counts of `walk.step(` / `walk.expect(` / seed rules in `11-walk.mjs` are 69 / 141 / 37 at d7cd5341 (before the plan), at 8080e352 and at HEAD. The diff of `11-walk.mjs` outside selectors is the `--baseline` flag and a usage line; `compareResult`, `diffLeaves` and `takeSnapshot` are not in it.
- **The baseline is the pre-Phase-12 app.** `11-walk-before.json` was re-recorded from a detached worktree of e37db11a (the commit before Phase 12). The gate compares HEAD against it and prints MATCH on all 94 snapshots (text hash, method hash, focus, buttons, fields, store leaves). So Phase 12's app commits, and the 80u/80v commits after e37db11a, moved nothing the walk sees. That is independent of the summary: it is the result of my own gate run.
- **The drift is traced.** `12-08-walk-trace.md` attributes all 1870 changed leaves between the old baseline and e37db11a to eleven groups in nine named post-Phase-11 quick-fix commits (3e2eb6d4, dcafd03d, c1bf9258, 2d50ac10, 37a05413, 9ad146c4, d62d123d, 44c71a11, c5373fb2); none is a Phase 11 plan commit; the reproduction at 4d3b44f7 shows today's WebKit records what it recorded then. The trace rests on scratch recordings of 94 app trees that I could not re-derive here, and I did not rerun `12-08-trace-check.mjs` (its inputs live in the executor's scratch folder); it is evidence from the plan, not from me. The decision to absorb pre-Phase-12 fixes is Mark's (D-08-1, 2026-11-16, "All pre-Phase-12 fixes").
- **Three groups are flagged for Mark** (G8 innerText blank lines, G10 typed text now in textContent, G11 focus after Save over). G8 and G10 are how the walk reads a textarea, not what a maker sees. G11 is human verification item 3.

## Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `app/src/domain/axes.js` | kind-aware readers | VERIFIED | `isMagnitude` line 28; `stopLabelFor`, `middleWordFor`, `readMarkText` (125); wired from AxisMark, BatchRow, PrintLogPages, creation.js |
| `app/src/domain/creation.js` / `creationSave.js` | stops line in kind; word limits refused at Save | VERIFIED | `scaleStopsLine` 301-307; `SCALE_WORD_LIMITS` / `PROBLEM_WORD_LIMIT` 358-359 enforced `creationSave.js:219-231`; covered by the 4425-test suite |
| `app/src/ui/AxisMark.jsx`, `BatchRow.jsx`, `PrintLogPages.jsx` | kind-aware stops, reading, printed row | VERIFIED | see truth 1 and 6 |
| `app/src/styles/tokens.css` / `print.css` | clipboard drop tokens and rules | VERIFIED | drop PASS lines; bench pages 40.5 pt down |
| `12-check.sh` and its harnesses (`12-stops-probe`, `12-print-check`, `12-roundtrip`, `12-safari-check`, `12-wkprint.swift`, `12-board-*`) | one command to GATE1 PASS | VERIFIED | exit 0, last line `GATE1 PASS` on HEAD 70da570a |
| `11-walk.mjs`, `11-walk-record-base.sh`, `11-walk-before.json` | the Phase 11 regression gate on the current build | VERIFIED | runs all 17 scenarios; MATCH 94 snapshots; baseline at e37db11a |
| `12-08-walk-trace.md`, `12-08-trace-check.mjs` | traced drift | PRESENT (not re-run by me) | see "The re-baseline, examined" |

## Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| AxisMark.jsx | axes.js | `stopLabelFor`, `middleWordFor` | WIRED | |
| BatchRow.jsx | axes.js | `axesForBatch(batch)` then `readMarkText` | WIRED | |
| creation.js | axes.js | `stopWordsFor(scale)` in `scaleStopsLine` | WIRED | goldilocks branch |
| creationSave.js | creation.js | `SCALE_WORD_LIMITS`, `PROBLEM_WORD_LIMIT`, `wordLimitMessage` | WIRED | line 12 import, 219-231 use |
| PrintLogPages.jsx | axes.js | `middleWordFor(axis)` | WIRED | |
| PrintSheet.jsx | print.css | route class `print-pages--webkit` / `--other` picks the drop | WIRED | |
| 12-check.sh | 11-walk-check.sh | the walk as regression gate | WIRED, gate passes | `MATCH 94 snapshots` |
| 11-walk-record-base.sh | 11-walk-before.json | `BASE=e37db11a`, `--baseline` | WIRED | |

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| reading cell | `marks[axis.key]`, `axis.kind` | batch snapshot (`axesForBatch`) from the stored batch | Yes: round trip reads `2 of 5` in A and in B after import | FLOWING |
| record pen | `axis` definitions | `axesForVersion(version, catalog)` from the stored version's `declaredAxes` | Yes: probe and Simulator read the injected recipe's scales | FLOWING |
| printed Tasting log | scale rows, problems | `axesForVersion` and `version.declaredFlaws` | Yes: print check and round trip see the own scales after the four core scales | FLOWING |

## Behavioral Spot-Checks

All run by me on HEAD 70da570a, labelled device-unverified.

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Whole gate | `sh .planning/phases/12-.../12-check.sh` | exit 0, `GATE1 PASS` (suite 134 files / 4425 tests; probe 26, print 30, roundtrip 68, pdf 7, sim 7 PASS; walk `MATCH 94 snapshots`) | PASS |
| Board against build | `12-board-check.mjs` + selftest, pen, reading, logs, limits specs, `--selftest`, on the gate's scratch build | 1256 PASS, 0 FAIL | PASS |
| No stray build | `git status`; `app/dist` | gate wrote to a scratch dir; no tracked file changed; no worktree left (`git worktree list` shows main only) | PASS |

## Probe Execution

The phase's probes are the harness steps above; no `scripts/*/tests/probe-*.sh` is declared. All ran as part of the gate.

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| `12-stops-probe.mjs` | `check pen reading editor` | 26 PASS | PASS |
| `12-print-check.mjs` | `rows drop lines fit worst` | 30 PASS | PASS |
| `12-roundtrip.mjs` | full loop | 68 PASS | PASS |
| `12-safari-check.mjs` | `pdf` / `sim` | 7 / 7 PASS | PASS |

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| TASTE-04 | 12-01, 12-02, 12-04, 12-05, 12-06, 12-07, 12-08 | pen, reading and printed log show a recipe's own scales each in its kind, and its problems; "This recipe only" only when it has any | SATISFIED | Truths 1, 4, 5, 6, 10. REQUIREMENTS.md: `[x]`, Complete |
| PROOF-01 | 12-03, 12-05, 12-08 | a created recipe round-trips: print, record a batch with a custom scale, export, import | SATISFIED | Truths 2, 9. REQUIREMENTS.md: `[x]`, Complete |
| LOG-01 | 12-02, 12-04, 12-05, 12-07, 12-08 | log pages start about 1.5 in down, each still one page, room out of the ruled notes lines | SATISFIED in WebKit for the fullest normal recipe and the longest allowed words; the paper check is open | Truths 6, 7, 11. REQUIREMENTS.md: `[x]`, Complete. Paper check: human item 2 |
| PROOF-02 | none in round one | creation checked on the iPad from the production build, Move focus and keyboard reach | NOT YET (round two) | No plan covers it by design (D-06). REQUIREMENTS.md: `[ ]`, Pending, which is correct |

Cross-reference: the four IDs REQUIREMENTS.md maps to Phase 12 (TASTE-04, PROOF-01, PROOF-02, LOG-01) are the four on the ROADMAP line. Three appear in plan frontmatter; PROOF-02 appears in none, deliberately. No orphaned IDs. Round two will also write PHONE-01 and STRUCT-05 (D-04, D-05), which do not exist yet.

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| changed app files (`axes.js`, `creation.js`, `creationSave.js`, `print.css`, `tokens.css`, `AxisMark.jsx`, `BatchRow.jsx`, `PrintLogPages.jsx`) | - | TBD / FIXME / XXX / `dangerouslySetInnerHTML` scan | none | Zero matches |
| `app/src/styles/print.test.js` | 97-137 | Notes-line counts not tied to the drop by any Vitest gate (review WR-02, still `open`) | Warning | A later token change could overflow a log with the suite green; the real fit check is `12-print-check.mjs` inside `12-check.sh`, which now runs `worst` and passes (spare 5.2 px in Safari). Thin margin |
| `app/src/domain/axes.js` | 37-40, 100-104, 112-118 | `stopWordsFor` returns null entries; `readMarkWord` exported and kind-blind; strict vs coercing comparison (IN-01, IN-02, `open`) | Info | Trap for future callers, not reachable today |
| `12-REVIEW-DISPOSITION.md` | - | WR-02, IN-01 to IN-04 still `open` (5 of 6); WR-01 `fixed` | Warning | Untriaged, not a goal blocker |
| `12-SECURITY.md` T-12-09 | - | `--out` guard accepts any path under `$TMPDIR`; status `draft`, approval pending | Info | Medium, below the blocking threshold, one-line fix |
| `12-print-check` report | - | At the longest allowed words an end word (`overwhelming`) runs 8.4 px past its 76 px column | Info | Report-only; the row stays 36 px and the log stays one page |

No blocker anti-pattern in app code.

## Human Verification Required

### 1. PROOF-02: creation checked on the iPad (round two)

**Test:** After Gate 2's work lands, from `npm --prefix app run build && npm --prefix app run preview -- --host`, create a recipe end to end on the iPad with its scales, problems and targets, Tab through every creation control, press each Move button, check focus after each move, then print.
**Expected:** Tab reaches every creation control, each Move button included; focus stays with the moved step or row; the recipe prints.
**Why human:** Device Tab order, touch and print cannot be proven by Playwright WebKit, WKWebView or the Simulator. Also blocked on round two's design and build (D-06, D-11, D-13). The recipe is a real one Mark keeps (D-12), so the check rows name controls, never the recipe's words.

### 2. LOG-01 paper check (Mark's List row `adoajjb9sgzbezmyrt4s`, stays open)

**Test:** Print the Batch log and the Tasting log from the iPad and put them on the clipboard.
**Expected:** Every printed line is clear of the clip; each log is one sheet.
**Why human:** Paper and the real print path; the WebKit PDF (ink starts 109.0 pt down) is a stand-in. Safari's print differs from Chrome's (grid rows, thead), so only the iPad PDF is evidence.

### 3. G11: focus after Save over this version (a confirmation for Mark)

**Test:** In the first-version editor, Save over a version, then see where focus rests.
**Expected:** Mark confirms it should rest on Next version (it did, in the walk), or asks for a change by a quick task.
**Why human:** Re-baselined under D-08-1; the commit's subject names Cancel, the walk step is Save over.

## Gaps Summary

No gaps in round one. The one FAILED must-have from the first report (the Phase 11 walk gate) is closed and re-proven by my own run of `12-check.sh` to `GATE1 PASS`, and a check of the closure itself found no loosened walk, no app edit and no unexplained baseline move: the new baseline is the pre-Phase-12 app, HEAD matches it on all 94 snapshots, and the 1870 baseline differences are traced to named quick-fix commits under Mark's decision. Everything else re-held under re-check, including the two quick tasks that landed after the first report (word limits; no numbers on a Low to high scale), and the first report's Open Question 2 is answered by those word limits (worst case now fits one page in WebKit with 5.2 px to spare).

What stays owed, in order: round two (Gate 2's boards drawn and approved, PHONE-01 and STRUCT-05 written, plans built, 12-check.sh rerun, with `11-walk-record-base.sh` re-recorded through a trace if a walked screen changes); PROOF-02's iPad walk on the final control order; the clipboard paper check; Mark's confirmation of G11; and triage of the five open review findings (WR-02 bears on LOG-01's one-page guarantee). On Mark's List, `bug-p11-low-to-high-scale-centre-mark` waits on this real `GATE1 PASS` by the plans' own rule (the orchestrator closes it); `adoajjb9sgzbezmyrt4s` stays open for the paper check. REQUIREMENTS.md already shows TASTE-04, PROOF-01 and LOG-01 checked and PROOF-02 pending, which matches this report. Phase 12 should not be marked complete in the ROADMAP until round two and PROOF-02 close.

---

_Verified: 2026-11-16T14:36:00Z_
_Verifier: Claude (gsd-verifier)_
