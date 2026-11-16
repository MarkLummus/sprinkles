---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 02
subsystem: ui
tags: [print, react, vitest, playwright-webkit, low-to-high, clipboard-margin]
status: complete

requires:
  - phase: 12-01
    provides: middleWordFor(axis) in app/src/domain/axes.js
  - phase: 12-06
    provides: 12-cases.mjs (CASES, arrive) shared by the Phase 12 harnesses
provides:
  - "Printed Tasting log: a Low to high scale row has no span.lf-mid (nothing under its ticks); every scale row is 36 px"
  - "Both log pages start 1.5 in from the top of the paper (picture 144 px top padding; print 90 px in WebKit, 96 px elsewhere), from two tokens and the route's engine class"
  - "Batch log 13 notes lines, Tasting log 4"
  - "12-print-check.mjs: facets rows, drop, lines, fit, worst on the built print route in WebKit"
  - "LOG-01 in REQUIREMENTS.md and ROADMAP; ROADMAP's Design gate restated as Gate 1 (met) and Gate 2 (not met)"
affects: [12-03, 12-04, 12-05]

plan_head_before: dfbf4d73bd87da495e3550231f73fa17b6122628
plan_head_after: 1e68dc233c2dfe5e3dd27fb3cab6cd43ddd12efe

actuals:
  tokens: 14000
  tasks: 3
  commits: 5

tech-stack:
  added: []
  patterns:
    - "The drop is in-flow padding chosen by the route's engine class (print-pages--webkit / print-pages--other), as the content-box pair is; no second @page, no named page"
    - "A print check measures each facet in its own browser context and restores inline style texts in a finally"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-print-check.mjs
  modified:
    - app/src/ui/PrintLogPages.jsx
    - app/src/ui/PrintLogPages.test.jsx
    - app/src/styles/print.css
    - app/src/styles/print.test.js
    - app/src/styles/tokens.css
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "The Low to high row's missing middle word is held at 36 px by one rule on .lf-sc (grid-template-rows: auto, then 12 px), not by a new class (CONTRACT section 3)"
  - "The bench sheet pages are untouched: only three rules read the drop tokens, pinned by a print.test.js case that lists them"

requirements-completed: [TASTE-04, LOG-01]

duration: 22min
completed: 2026-11-16
---

# Phase 12 Plan 02: The printed logs Summary

**A printed Low to high scale row has nothing under its ticks and stands 36 px like every row, and both log pages start 1.5 in down for the clipboard (90 px in WebKit print, 96 elsewhere) with 13 and 4 notes lines, each still one page; LOG-01 and the two design gates are written into REQUIREMENTS and the roadmap.**

## Accomplishments

- Task 1 (tracer): `LogScaleRow` takes its middle word from `middleWordFor(axis)` and draws the `lf-anchor lf-mid` span only when it is not null; `.lf-sc` gets `grid-template-rows: auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid))`. 12-print-check.mjs written with all five facets. Verified on a scratch build in Playwright WebKit under print media: Coffee flavour (Low to high) has no `.lf-mid`, faint / 1 / 5 / strong and five ticks; Body and the four core rows read "right"; every scale row is 36 px; the six problems; no "Every recipe" / "This recipe only". Tracer gate: `rows` passes, so expansion went ahead (end-of-phase mode, automated verify only).
- Task 2: tokens `--sheet-print-clipboard-drop: 96px` and `--sheet-print-clipboard-drop-webkit: 90px`; the picture rule pads `calc(48 + 96)` above; inside `@media print`, `.print-pages--webkit .print-page--log` and `.print-pages--other .print-page--log` set `padding-top`. Batch log 13 lines, Tasting log 4.
- Task 3: LOG-01 text under a new "Printed log" heading, its traceability row, coverage 31 (Phase 12: 4), and the roadmap's Requirements line; the one Design gate paragraph is now Gate 1 (MET 2026-11-15, sketch 015) and Gate 2 (Not met), every fact of the old paragraph kept (`todo-add-ingredient-per-row` still appears twice).

## RED / GREEN

- RED 1 (8746417e): 1 test failed on the planned assertion (`classCount(row, 'lf-mid')` was 1, expected 0; `stopWordsFor` gave an empty span). Semantic assessment: the target test ran and failed for the intended reason. The plan is `type: execute`, so the `tdd-red-evidence` classifier was not run. GREEN 1: f222415d.
- RED 2 (f1f31636): 42 tests failed (19 Batch-log and 19 Tasting-log line-count pins at 13 and 4; the drop rules, picture padding and reader-list cases in print.test.js missing). Intended failures. GREEN 2: 29f549ed.
- Check bites: with the `grid-template-rows` line removed from a scratch build, `rows` fails with `FAIL rows every scale row is 36 px tall (within 0.5 px): Coffee flavour 25`; restored before the commit.

## Fit numbers for Mark (case two: two own scales, two own problems; `fit` facet, screen media as p12-capture.mjs printFacts ran)

```
PASS fit Batch log at safari's 630 px fits one page: need 790 (body 752, gap 16, foot 22) of 810, spare 20
PASS fit Batch log at chrome's 672 px fits one page: need 790 (body 752, gap 16, foot 22) of 864, spare 74
PASS fit Tasting log at safari's 630 px fits one page: need 767.9 (body 729.9, gap 16, foot 22) of 810, spare 42.1
PASS fit Tasting log at chrome's 672 px fits one page: need 767.9 (body 729.9, gap 16, foot 22) of 864, spare 96.1
```

These equal sketch 015's README Measured (790 and 767.9). `drop`: screen log pages 144px and sheet pages 48px; print log pages 90px and sheet pages 0px, route class `print-pages--webkit`. `lines`: 13 and 4.

## Long-words report (case `worst`, REPORT only; Open Question 2: measured, not fixed)

Two own scales with long names and end words, two long problem words, in the Tasting log:

```
REPORT worst safari 630 px: need 827.8 (body 789.8, gap 16, foot 22) of 810, spare -17.8 (SPILLS onto a second sheet)
REPORT worst chrome 672 px: need 827.8 (body 789.8, gap 16, foot 22) of 864, spare 36.2
REPORT worst row heights (both): Hardness 36; Scoopability 36; Smoothness 36; Sweetness 36; Brown butter and toasted pecan depth 55; Ribbon of salted caramel through it 40; problems row 62.8
REPORT worst (both) Brown butter and toasted pecan depth low word "barely there at all": 104.1 px wide, its column 76 px, runs past by 28.1 px
REPORT worst (both) Brown butter and toasted pecan depth high word "overwhelmingly nutty": 129.9 px wide, its column 76 px, runs past by 53.9 px
REPORT worst (both) Ribbon of salted caramel through it low word "too thin and sparse": 112.1 px wide, its column 76 px, runs past by 36.1 px
REPORT worst (both) Ribbon of salted caramel through it high word "too thick and gluey": 111 px wide, its column 76 px, runs past by 35 px
```

For Mark: with those long words the Tasting log needs 17.8 px more than Safari's 810 px, so it would spill onto a second sheet in Safari (Chrome has 36.2 px to spare). Long scale names wrap (rows of 55 and 40 px against 36) and every long end word runs 28 to 54 px past its 76 px column. Words that long are not a limit anyone has decided; a fix (a shorter limit, wrapping end words, a smaller row) would be a decision of Mark's. 12-05's PDF is the print-engine count.

## Commits

- 8746417e test(12-02): failing test for a Low to high scale on the printed Tasting log
- f222415d feat(12-02): the printed Low to high scale row has nothing under its ticks, 36 px like every row
- f1f31636 test(12-02): failing tests for the clipboard drop and the 13 and 4 notes lines
- 29f549ed feat(12-02): both log pages start 1.5 in down for the clipboard, with 13 and 4 notes lines
- 1e68dc23 docs(12-02): LOG-01 in REQUIREMENTS and the roadmap, and the Design gate restated as two gates

## Verification

- `npx vitest run` in app/: 134 files, 4410 tests, all passing (base 4400; +10).
- Scratch build into `${TMPDIR}sprinkles-12/dist-02`; `node 12-print-check.mjs rows drop lines fit worst`: 23 PASS, 0 FAIL, the worst facet REPORT lines above. app/dist never touched; PROBE_DIST only read.
- Every acceptance grep of Tasks 1 to 3 holds (`print-page--sheet` count 2, `@page` count 4, `lines={13}`/`{4}` 1 each, `lines={14}`/`{5}` 0, DOCS PASS).
- `git log --name-only --grep='(12-02)' -- app/src/store app/src/data` prints nothing.
- Note: `npx vitest run <files>` from `app/` was used (as 12-01 found, `npm --prefix app test -- ...` hangs in a worktree). The plan commit ledger file in the shared `.git` could not be written (permission system); `commits:` above is measured with `git rev-list --count dfbf4d73..HEAD` against the base named in the dispatch (5, before this SUMMARY's own commit).

## Deviations from Plan

None - plan executed exactly as written. The `rows` facet's first check name reads "six scale rows..." but asserts only the last two names (Body then Coffee flavour) beside a separate count of six; no behaviour differs.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. Maker words still render as React text children (T-12-05 pinned for a Low to high scale named `<b>Coffee</b>` with ends `<i>faint` and `strong</i>`); the print check reaches only 127.0.0.1 and reads PROBE_DIST (T-12-06, T-12-07); no store, DB_VERSION or data change.

## For the orchestrator

- Do not close Mark's List row `adoajjb9sgzbezmyrt4s`: its paper check is round two's last iPad row (D-07, D-13). Do not close `bug-p11-low-to-high-scale-centre-mark` here either: it closes in 12-05's orchestrator step.
- Deploy after wave 2: safe. No store shape, no DB_VERSION. This plan ends wave 1's print state (the 25 px Low to high row with an empty middle span). The log pages now start 1.5 in down on paper, LOG-01's decided form.
- Tell Mark the long-words result above (Safari spill by 17.8 px; end words over their column); it is a decision of his, not fixed here.

## Self-Check: PASSED

12-print-check.mjs exists and all five task-1/2/3 commits (8746417e, f222415d, f1f31636, 29f549ed, 1e68dc23) are ancestors of HEAD; full suite green; docs verify prints DOCS PASS.
