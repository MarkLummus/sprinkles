---
phase: quick-261031-fdd
plan: 01
subsystem: styles
tags: [css, baseline, method-step, sketch-014-decision-10]
requires: [quick-261027-ubi]
provides: ["align-items: baseline on app.css .method-step for every step li"]
affects: [app/src/styles/app.css, app/src/styles/notebook.css]
key-files:
  modified:
    - app/src/styles/app.css
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/styles/cross-cutting.test.js
    - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
status: complete
commits: 2
plan_head_before: af1c937a6ff0c1765dd6f041af5367dc03186338
plan_head_after: cda2282b2bd47398c7e883842703ffb6785e3dda
actuals:
  tokens: 2400
  tasks: 2
  commits: 2
---

# Phase quick-261031-fdd Plan 01: Step numbers sit on their lead-in baseline Summary

One `align-items: baseline` declaration on app.css's `.method-step` grid puts every step's number on its lead's text baseline (reading, Preview, the version pen's open step), and the duplicate `.notebook .mk-step` rule from 261027-ubi is gone.

Base commit: af1c937a (HEAD at execution; the planning base 6c2beb74 plus docs-only commits). Commits: a9ea5e21 (app.css and the re-based probe), cda2282b (notebook.css rule dropped, test moved).

## Offsets, in words

- Reading step: the lead's baseline sat 3.97 px above the number's in WebKit, 4.00 in Chrome. Now 0: the lead moved 3.97 / 4.00 lower, the number did not move.
- Preview step: same, 3.97 / 4.00 above before, 0 now; the lead's top sits 3.97 / 4.00 below the number's top.
- Pen's open step, coarse pointer: the lead-in field's baseline sat 8.53 (WebKit) / 8.00 (Chrome) below the number's. Now 0: the field did not move, the number moved down 8.53 / 8.00.
- Pen's open step, fine pointer: the field sat 0.58 / 1.00 above the number's baseline. Now 0: the number did not move, the field moved down 0.58 / 1.00.
- Creation editor's open step: 0.00 before and after; no figure moved.

## Measurements (px, page coordinates; diff = lead baseline minus number baseline)

Reading step (Olive Oil v1, step 1)

| Engine | Config | Base number top / baseline | Base lead top / baseline | Base diff | After lead top / baseline | After diff |
| ------ | ------ | -------------------------- | ------------------------ | --------- | ------------------------- | ---------- |
| WebKit | fine, coarse | 1582.81 / 1601.86 | 1582.81 / 1597.89 | -3.97 | 1586.78 / 1601.86 | 0 |
| WebKit | coarse DPR 2 | 1593.31 / 1612.36 | 1593.31 / 1608.39 | -3.97 | 1597.28 / 1612.36 | 0 |
| Chrome | fine, coarse, coarse DPR 2 | 1579.44 / 1598.44 | 1579.44 / 1594.44 | -4.00 | 1583.44 / 1598.44 | 0 |

The number's top and baseline are unchanged after, in every run.

Preview step

| Engine | Config | Base number top / baseline | Base lead top / baseline | Base diff | After lead top / baseline | After diff |
| ------ | ------ | -------------------------- | ------------------------ | --------- | ------------------------- | ---------- |
| WebKit | fine | 825.16 / 844.20 | 825.16 / 840.23 | -3.97 | 829.13 / 844.20 | 0 |
| WebKit | coarse | 885.33 / 904.38 | 885.33 / 900.41 | -3.97 | 889.30 / 904.38 | 0 |
| WebKit | coarse DPR 2 | 885.83 / 904.88 | 885.83 / 900.91 | -3.97 | 889.80 / 904.88 | 0 |
| Chrome | fine | 822.25 / 841.25 | 822.25 / 837.25 | -4.00 | 826.25 / 841.25 | 0 |
| Chrome | coarse, coarse DPR 2 | 882 / 901 | 882 / 897 | -4.00 | 886 / 901 | 0 |

Version pen's open step 1 (number against the lead-in field)

| Engine | Config | Base number top / baseline | Base field top / baseline | Base diff | After number top / baseline | After field top / baseline | After diff |
| ------ | ------ | -------------------------- | ------------------------- | --------- | --------------------------- | -------------------------- | ---------- |
| WebKit | fine | 2012.64 / 2031.69 | 2012.64 / 2031.11 | -0.58 | 2012.64 / 2031.69 | 2013.22 / 2031.69 | 0 |
| WebKit | coarse | 2271.89 / 2290.94 | 2271.89 / 2299.47 | +8.53 | 2280.42 / 2299.47 | 2271.89 / 2299.47 | 0 |
| WebKit | coarse DPR 2 | 2282.39 / 2301.44 | 2282.39 / 2309.97 | +8.53 | 2290.92 / 2309.97 | 2282.39 / 2309.97 | 0 |
| Chrome | fine | 2009.31 / 2028.31 | 2009.31 / 2027.31 | -1.00 | 2009.31 / 2028.31 | 2010.31 / 2028.31 | 0 |
| Chrome | coarse, coarse DPR 2 | 2268.56 / 2287.56 | 2268.56 / 2295.56 | +8.00 | 2276.56 / 2295.56 | 2268.56 / 2295.56 | 0 |

Creation editor's open step (unchanged, base equals after)

| Engine | Config | Number top / baseline | Lead-in top / baseline | Diff |
| ------ | ------ | --------------------- | ---------------------- | ---- |
| WebKit | fine | 684.25 / 703.30 | 684.83 / 703.30 | 0 |
| WebKit | coarse | 698.53 / 717.58 | 690 / 717.58 | 0 |
| WebKit | coarse DPR 2 | 699.03 / 718.08 | 690.50 / 718.08 | 0 |
| Chrome | fine | 682.25 / 701.25 | 683.25 / 701.25 | 0 |
| Chrome | coarse, coarse DPR 2 | 696 / 715 | 688 / 715 | 0 |

## Probe results

- Re-based 261027-ubi probe, base checked against itself: 24 PASS, 18 FAIL (U2, U3, U7 fail in all six runs, as expected).
- After build against the base: 42 PASS, 0 FAIL, exit 0. Re-run after Task 2 (notebook.css rule dropped): 42 PASS, 0 FAIL again.

## Tests

- notebook.test.js 120 to 118, cross-cutting.test.js 91 to 93 (211 together).
- Full suite: 4235 tests in 130 files, passing, same as base.
- No snapshot test changed (the suite has no snapshot tests).
- app/dist was not rebuilt. Builds went to the scratchpad (`.../scratchpad/fdd/base-dist`, `after-dist`); Mark's 4173 preview (pid 31386) was untouched and is the only Vite process left.

## Deviations from Plan

None - plan executed exactly as written. The base commit is af1c937a rather than 6c2beb74 because docs-only commits landed after planning; base figures matched the planning tables exactly.

## Known Stubs

None.

## Self-Check: PASSED

Files and commits a9ea5e21, cda2282b exist on main; the two commits touch exactly the five planned paths; print.css and app/src/ui are untouched.

## For the orchestrator

1. Close bug-p11-pen-step-number-leadin-misaligned on Mark's List, and look-p11-reading-step-baseline if still open: status done, resolvedAt from the clock, one-line reply with the figures above and commits a9ea5e21, cda2282b. The executor has no ArtifactData and wrote no row.
2. Mark's 4173 preview serves app/dist, which was not rebuilt. The change reaches his iPad only after `npm --prefix app run build` and a reload, and stays device-unverified until he sees it there. Safe to push to dist: yes (CSS only, no store write).
3. Quick 261025-rjq's probe (`.planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs`) still encodes the superseded tops contract (G1, G3, G4, G5) and fails by design against a pre-fdd base. Left unedited; re-base or retire it.
4. Sketch 014 README decision 10 still ends "waits on look-p11-reading-step-baseline". Route the app-commit record (a9ea5e21, cda2282b) to Sid, as decision 9 records 438dc880. Sketch 011's pen boards still draw tops; Sid's call.
5. Not measured by the probe: the batch sheet's recording steps (same body grammar, lead first) and a browser print of a page other than the print route (app.css @media print keeps the grid). The print route renders no li.method-step and is unchanged.
