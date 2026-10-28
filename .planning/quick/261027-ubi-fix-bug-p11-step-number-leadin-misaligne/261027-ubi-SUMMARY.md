---
phase: quick-261027-ubi
plan: 01
quick_id: 261027-ubi
subsystem: notebook-styles
tags: [css, creation-editor, baseline, bug-p11-step-number-leadin-misaligned]
requires: []
provides:
  - "open creation step: number sits on its lead-in's text baseline (WebKit and Chrome, fine and coarse, DPR 1 and 2)"
affects: [app/src/styles/notebook.css, app/src/styles/notebook.test.js]
key-files:
  created:
    - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
decisions:
  - "One rule, .notebook .mk-step { align-items: baseline }; no token, no literal, no nudge"
metrics:
  tasks: 2
  files: 3
status: complete
commits: 2
plan_head_before: c90b60657c3f4d1292582be186e92fe97ae62eb1
plan_head_after: 6fa632dfe8fbecbd232f7ca43fc88afddb1ace19
actuals:
  tasks: 2
  commits: 2
---

# Phase quick-261027-ubi Plan 01: Step number on the lead-in baseline Summary

Fixed bug-p11-step-number-leadin-misaligned with one CSS rule: the open creation step's grid (`.notebook .mk-step`) now aligns on first baselines, so the number lands on the lead-in's text line in WebKit and Chrome with fine and coarse pointers.

Base commit: `c90b6065`. Commits: `438dc880` (fix: notebook.css and the probe), `6fa632df` (test: notebook.test.js).

## The offset

Under a coarse pointer the number sat 8.53 px above the lead-in's text baseline in WebKit and 8.00 px in Chrome (the lead-in field is 44 px tall and centres its text). With a fine pointer it was within 1 px already (-0.58 WebKit, -1.00 Chrome, the number slightly below). After the fix the difference is 0.00 in all six runs.

Direction: the number moves down to meet the text under a coarse pointer; the field keeps its place. With a fine pointer the number keeps its place and the field moves down 0.58 (WebKit) or 1.00 (Chrome).

## Open creation step, base and after (1366x1024, page coordinates in px)

Number: 20px, -apple-system, line-height normal, padding 0, border 0 in every run. Lead-in: fine 15px Georgia 700, line-height 22.5px, padding 2/2, min-height 22.5px; coarse 16px, line-height 24px, padding 2/2, min-height 44px. Difference = lead-in baseline minus number baseline (positive: number above the text).

| Engine | Config | Build | Number top / height / baseline | Lead-in top / height / baseline | Difference |
| ------ | ------ | ----- | ------------------------------ | ------------------------------- | ---------- |
| WebKit | fine | base | 684.25 / 182.33 / 703.30 | 684.25 / 26.5 / 702.72 | -0.58 |
| WebKit | fine | after | 684.25 / 23 / 703.30 | 684.83 / 26.5 / 703.30 | 0.00 |
| WebKit | coarse | base | 690.00 / 277.33 / 709.05 | 690.00 / 44 / 717.58 | +8.53 |
| WebKit | coarse | after | 698.53 / 23 / 717.58 | 690.00 / 44 / 717.58 | 0.00 |
| WebKit | coarse DPR 2 | base | 690.50 / 277.33 / 709.55 | 690.50 / 44 / 718.08 | +8.53 |
| WebKit | coarse DPR 2 | after | 699.03 / 23 / 718.08 | 690.50 / 44 / 718.08 | 0.00 |
| Chrome | fine | base | 682.25 / 181 / 701.25 | 682.25 / 26.5 / 700.25 | -1.00 |
| Chrome | fine | after | 682.25 / 24 / 701.25 | 683.25 / 26.5 / 701.25 | 0.00 |
| Chrome | coarse | base | 688.00 / 276 / 707.00 | 688.00 / 44 / 715.00 | +8.00 |
| Chrome | coarse | after | 696.00 / 24 / 715.00 | 688.00 / 44 / 715.00 | 0.00 |
| Chrome | coarse DPR 2 | base | 688.00 / 276 / 707.00 | 688.00 / 44 / 715.00 | +8.00 |
| Chrome | coarse DPR 2 | after | 696.00 / 24 / 715.00 | 688.00 / 44 / 715.00 | 0.00 |

The number's box height drops from the row height (stretched) to its own line (23 to 24 px) because it no longer stretches; it is `aria-hidden` text with no border or background, so nothing visible changes except its position. The lead-in-bottom to instruction-top gap is 6 px before and after in every run.

## Unchanged areas

- Reading step (Olive Oil v1 step 1): number top, lead top and difference equal the base in all 6 runs. Tops aligned; the number's baseline sits 4 px below its lead's (-3.97 WebKit, -4.00 Chrome).
- Preview step inside the open creation step: (lead top minus number top) = 0 and difference -3.97 WebKit / -4.00 Chrome, equal to the base.
- Version pen (information only, not changed): coarse +8.53 WebKit and +8.00 Chrome, fine -0.58 / -1.00, identical before and after.
- quick 261025-rjq's probe, base vs after build: 48 PASS, 0 FAIL.
- Final probe check (this plan's): 36 PASS, 0 FAIL (U1 to U6 in 2 engines x 3 configs). The base check showed U1 failing in exactly the four coarse runs and everything else passing.

## Tests

- `npm --prefix app test -- src/styles/notebook.test.js`: 120 tests (118 at base).
- `npm --prefix app test`: 4235 tests in 130 files (4233 at base).
- No snapshot test changed (the suite has no snapshot tests).

## Process notes

- app/dist was not rebuilt and not written. Builds went to `$TMPDIR/sprinkles-ubi/base-dist` and `after-dist`; the probe served them from ephemeral 127.0.0.1 ports. Mark's `vite preview --host` on 4173 (pid 31386) was untouched and is the only Vite process.
- app.css, print.css and every file under app/src/ui are unchanged.
- The commit-guard check ran on `main`; `allow_default_branch_commits` is true in .planning/config.json and the orchestrator dispatched this as a sequential run on the main tree.

## Deviations from Plan

One probe-shape deviation (Rule 3, blocking). The first probe run drove the creation flow in the same browser context as the version pen it had just opened, and `New recipe` never appeared (the pen's unsaved state blocked the navigation). The probe now uses one fresh context per area (reading and pen, then creation and Preview). Measurements are unaffected and the base figures match the planning table.

Otherwise none: the plan executed as written.

## Known Stubs

None.

## Threat Flags

None. CSS keyword only; the probe aborts every non-127.0.0.1 request.

## For the orchestrator

1. Close bug-p11-step-number-leadin-misaligned on Mark's List: status done, resolvedAt from the clock, reply: "Number now on the lead-in's text baseline: coarse +8.53 (WebKit) / +8.00 (Chrome) before, 0.00 after; fine -0.58 / -1.00 before, 0.00 after. Commits 438dc880, 6fa632df. Device-unverified until you confirm on the iPad after a rebuild."
2. Mark's 4173 preview serves app/dist, which this task did not rebuild. The fix reaches his iPad only after `npm --prefix app run build` and a reload, and stays device-unverified until he confirms it on the iPad. Safe to push to dist: yes (CSS only, no store write).
3. The version pen's open step shows the same offset under a coarse pointer (+8.53 WebKit, +8.00 Chrome; tops aligned since quick 261025-rjq). Left alone as the bug text asked. Candidate bug for Mark to triage.
4. Sketch 014's board draws the open step with the number top level with the 44 px field's top (README line 112; P11_CSS in .planning/canvas-generators/p11.py sets no align-items on .mk-step). The app now differs from that figure by Mark's fix answer. Route the board and README update to Sid so the sketch stays the single authority.
5. The reading step aligns tops, and its number's baseline sits 4 px below its lead's. Outside this bug; reported only.

## Self-Check: PASSED

- notebook.css, notebook.test.js and the probe exist; `git merge-base --is-ancestor` finds 438dc880 and 6fa632df in HEAD.
- `grep -c '^\.notebook \.mk-step {' app/src/styles/notebook.css` prints 1.
- `git log -2 --name-only` lists exactly the probe, notebook.css and notebook.test.js.
