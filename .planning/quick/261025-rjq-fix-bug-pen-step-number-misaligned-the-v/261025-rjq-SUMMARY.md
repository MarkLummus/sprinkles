---
phase: quick-261025-rjq
plan: 01
quick_id: 261025-rjq
subsystem: styles
tags: [css, pen, method-step, alignment]
status: complete
requirements-completed:
  - bug-pen-step-number-misaligned
key-files:
  modified:
    - app/src/styles/app.css
    - app/src/styles/binder.test.js
  created:
    - .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs
commits: 1
plan_head_before: aa25b4fdb76e809bbb74f4fadc05831f63005991
plan_head_after: 21878842b723ba952b2ff6f4225fe4d92309e69b
actuals:
  tokens: 6000
  tasks: 2
  commits: 1
---

# Phase quick-261025-rjq Plan 01: Pen step number alignment Summary

One CSS rule (`.method-step__open-fields > .method-step__field:first-child { margin-top: 0 }`) puts the open step's lead-in field level with its margin number, measured 6.0 to 0.0 in WebKit and Chrome at four configs.

Commit: 21878842 (fix(261025-rjq)), holding app.css, binder.test.js and the probe.

## Measurements (page coordinates, Olive Oil v1, step 1 open)

Base check (base build against itself): `32 PASS, 8 FAIL`. The eight FAILs are G1, drop 6 in every run; every other gate passed (G5 is skipped when the checked file is the base file, see Deviations).

After check: `48 PASS, 0 FAIL`, exit 0.

| Engine | Config | Number top | Lead-in top, base | Lead-in top, after | Field gap (base / after) |
| ------ | ------ | ---------- | ----------------- | ------------------ | ------------------------ |
| WebKit | 1366 fine | 2012.64 | 2018.64 | 2012.64 | 6 / 6 |
| WebKit | 1366 coarse | 2271.89 | 2277.89 | 2271.89 | 6 / 6 |
| WebKit | 984 fine | 1960.64 | 1966.64 | 1960.64 | 6 / 6 |
| WebKit | 984 coarse | 2219.89 | 2225.89 | 2219.89 | 6 / 6 |
| Chrome | 1366 fine | 2009.31 | 2015.31 | 2009.31 | 6 / 6 |
| Chrome | 1366 coarse | 2268.56 | 2274.56 | 2268.56 | 6 / 6 |
| Chrome | 984 fine | 1957.31 | 1963.31 | 1957.31 | 6 / 6 |
| Chrome | 984 coarse | 2216.56 | 2222.56 | 2216.56 | 6 / 6 |

Reading page and closed-pen tops (G3, G4) equal base; later steps in the open state sit 6.0 above base (G5); coarse matches hasTouch (G6).

## Tests and walk

- `npm --prefix app test`: 3766 passed in 120 files (base 3765 in 120).
- Strict walk (`10-walk-check.sh`): exits 1 with exactly one line, `FAIL correct-save: the page status starts with "changed " (Batch saved.)`, the same pre-existing failure as at 6e618a0b. `10-walk-before.json` has no diff. app/dist was not touched (the walk builds to its own scratch directory).

## Deviations from Plan

**1. [Rule 3 - Blocking] G5 skipped when the checked file is the base file.** The plan's base check ("check base.json against base.json, expect every other gate to PASS") would make G5 (later steps 6.0 above base) fail by construction, since the file is compared against itself. The probe prints `INFO G5 ... skipped` in that case only; the after check runs G5 in full and passes. No other deviation.

## For the orchestrator

- Close Mark's List row `bug-pen-step-number-misaligned` (status done, `resolvedAt` from the clock, reply: "Number and lead-in now share one top, 6.0 to 0.0 in WebKit and Chrome at 1366 and 984, fine and coarse; field gap stays 6; commit 21878842"). The executor wrote no row.
- The strict walk has been red since f58c861b (decide-notice-copy): its correct-save scenario still expects the page status to start with "changed ", and the app now says "Batch saved.". This task left it alone; it needs its own route (a bug row for Mark, or a /gsd-quick that updates the expectation and rebaselines the notice leaves).
- Mark's 4173 preview serves app/dist, which this task never rebuilt, so the fix shows on his iPad only after a rebuild (`npm --prefix app run build && npm --prefix app run preview -- --host`).

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- app/src/styles/app.css, app/src/styles/binder.test.js and the probe exist; commit 21878842 is on HEAD.
