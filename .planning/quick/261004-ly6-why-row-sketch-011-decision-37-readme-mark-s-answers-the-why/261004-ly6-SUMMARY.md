---
phase: quick-261004-ly6
plan: 01
subsystem: ui
tags: [version-details, why-row, hand, sketch-011, decision-37]
requires:
  - phase: quick-261004-ly4
    provides: Version details alignment (landed before)
  - phase: quick-261004-ly5
    provides: band buttons (landed before)
provides:
  - "The Why value in the version details sits on its own line, flush with its WHY label"
  - "A saved Why is written in the hand (.app-hand), as decision 17 and DESIGN.md's Hand entry say"
affects: [version-row, app.css]
tech-stack:
  added: []
  patterns: ["probe against a sketch board's panels, read in the same engine"]
key-files:
  created:
    - .planning/quick/261004-ly6-why-row-sketch-011-decision-37-readme-mark-s-answers-the-why/261004-ly6-probe.mjs
  modified:
    - app/src/ui/VersionRow.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
key-decisions:
  - "Removed the dead font-size on .version-row__reason instead of adding the brief's .version-row__reason.app-hand override"
  - "Kept overflow-wrap: anywhere on .version-row__reason, taken over from the role the saved Why leaves"
status: complete
commits: 3
plan_head_before: abd833c2513282c97c4d8a528c154c21994787ef
plan_head_after: 100d82f3271c729ef313c2374ebc3da7b1bb6d8e
actuals:
  tokens: 9000
  tasks: 2
  commits: 3
completed: 2026-10-04
---

# Phase quick-261004-ly6 Plan 01: The Why row, flush and in the hand Summary

**The version details' Why value now starts at its WHY label's left edge (it started 40px right, the browser's default dd margin), and a saved Why is set in the hand (Caveat 22px, leading 27.5px, pen blue) instead of Georgia 16px; 'no reason recorded' keeps its small grotesk.**

Built from sketch 011 decision 37 as Mark answered it on 2026-10-04 (answer 1: option B; answer 2: the hand, decision 17). Every reading below is from Playwright WebKit and system Chrome, not from Mark's iPad or iPhone.

## What changed

- `app/src/ui/VersionRow.jsx`: the saved Why's dd class is `version-row__reason app-hand` (was `... prose-text`). The empty branch and the text child are unchanged.
- `app/src/styles/app.css`, `.version-row__reason`: added `margin-inline-start: 0` and `overflow-wrap: anywhere`; removed `font-size: var(--sheet-type-note)`; kept `max-width`. The comment above the shared rule now says what is true.
- Tests: the child-version VersionRow test now expects `class="version-row__reason app-hand"` and not the old class (edited in place); one new test in `cross-cutting.test.js` (describe 'the Why row (sketch 011 decision 37 B ...)').

## Commits

| Step | Hash | Message |
|------|------|---------|
| RED | 2d5abf5 | test(261004-ly6): pin the Why row flush with its label and a saved Why in the hand |
| GREEN | 63e9c54 | fix(261004-ly6): set the Why value flush with its label and a saved Why in the hand |
| probe fix | 100d82f | test(261004-ly6): give the probe's board panel the app's Caveat file |

RED evidence: at 2d5abf5, exactly two tests failed (the edited VersionRow test and the new rule test), 142 passed in those two files. GREEN: full suite passes.

## Test count

Before: 59 files, 1601 tests. After: 59 files, 1602 tests. Delta +1 (the new rule test), none removed.

## Choices made

1. **Dead `font-size` removed, no override rule.** The brief adds `.version-row__reason.app-hand` so the hand's size beats `.version-row__reason`'s own `font-size`. Once the saved dd takes `.app-hand`, that declaration reaches no rendered state (the empty value is already overridden by `--empty`), so it was dead code. Removing it lets `.app-hand`'s size and leading reach the saved Why directly. The probe shows the result equals the board's B panels (which were drawn with the override): saved Why computed font-family, size 22px, line-height 27.5px, weight, style and colour equal the board's in all 18 cells in both engines.
2. **`overflow-wrap: anywhere` kept.** It came from `.prose-text`, which the saved Why leaves. Stress check (200 unbroken characters in the saved Why at 393, throwaway page): before the change page overflow 0, dd right 373 = list right 373 (WebKit and Chrome); after the change page overflow 0, dd right 373 = list right 373 (WebKit and Chrome). The 393 column does not scroll sideways.

## Deviations from Plan

**1. [Rule 3 - Blocking] The board has no `data-pid` attributes.**
- **Found during:** Task 1, writing the probe.
- **Issue:** The plan says panels are read by `data-pid`. why-row.html as committed carries none (the canvas wrapper is gone); panels are `.fp-win.fp-{state}-{variant}-{W}`, each still holding the `[data-m]` markers.
- **Fix:** The probe selects `.fp-win.fp-{pid}`. Same panels, same ids.

**2. [Rule 3 - Blocking] The board's Caveat never loaded in the probe.**
- **Found during:** Task 1 Step 6 (first `after` run: 2 failures, WebKit and Chrome at 393 saved, value h 110 vs board 137.5, list widths equal at 353).
- **Cause:** The board reaches Caveat through a Google Fonts link. The 03.5 harness aborts every non-127.0.0.1 request, and the board has no `@font-face`, so the board's hand fell back to Georgia and wrapped to 5 lines. Sid's reading (110 tall at 393, in `why-measure.json`) was taken with network access. The app was not wrong: it read 110, equal to Sid's number. (At 1600 and 1366 Georgia happens to wrap to 3 lines too, so those matched either way.)
- **Fix (probe only, no threshold loosened):** after opening the board, the probe declares `@font-face` for Caveat from the app's own `app/public/fonts/caveat-regular.woff2` (served by the repo server), the way `fonts.css` declares it, and asserts the face is loaded. Then the 393 saved value reads 110 on the board and in the app, in both engines. The board file itself is untouched. The `premise` group ran before this change; it compares offsets, which the font does not affect, and it was not re-run because the source it measured has changed.

No app-code deviations; the plan's CSS and JSX changes were made as written.

## Probe results (all cells exit 0: `premise` 190 checks, `after` 294 checks)

Offsets and gaps are relative to the list's own box. "Board" is the same-engine panel (built for premise, B for after). Height is px; lines = height / computed line-height. Sid's readings (`why-measure.json`, WebKit, relative to the panel's shell, whyv.x - whyl.x): built 40 and B 0 everywhere; saved B height 82.5 at 1600 and 1366, 110 at 393; empty 18.2; label-to-value gap 4; Written value 111 with a From row, 72.2 without.

| Engine / pointer / width / state | flush before | flush after | Written x (app = board) | gap | height after (board) | lines | list w app / board | size / leading after | overflow |
|---|---|---|---|---|---|---|---|---|---|
| WebKit fine 1600 saved | 40 | 0 | 111.0 | 4 | 82.5 (82.5) | 3 | 553.0 / 553.0 | 22px / 27.5px | 0 |
| WebKit fine 1600 none | 40 | 0 | 111.0 | 4 | 18.19 (18.19) | 1 | 553.0 / 553.0 | 13px / 18.2px | 0 |
| WebKit fine 1600 first | 40 | 0 | 72.2 | 4 | 18.19 (18.19) | 1 | 553.0 / 553.0 | 13px / 18.2px | 0 |
| WebKit coarse 1366 saved | 40 | 0 | 111.0 | 4 | 82.5 (82.5) | 3 | 451.3 / 548.7 | 22px / 27.5px | 0 |
| WebKit coarse 1366 none | 40 | 0 | 111.0 | 4 | 18.19 (18.19) | 1 | 451.3 / 548.7 | 13px / 18.2px | 0 |
| WebKit coarse 1366 first | 40 | 0 | 72.2 | 4 | 18.19 (18.19) | 1 | 451.3 / 548.7 | 13px / 18.2px | 0 |
| WebKit coarse 393 saved | 40 | 0 | 111.0 | 4 | 110 (110) | 4 | 353 / 353 | 22px / 27.5px | 0 |
| WebKit coarse 393 none | 40 | 0 | 111.0 | 4 | 18.19 (18.19) | 1 | 353 / 353 | 13px / 18.2px | 0 |
| WebKit coarse 393 first | 40 | 0 | 72.2 | 4 | 18.19 (18.19) | 1 | 353 / 353 | 13px / 18.2px | 0 |
| Chrome fine 1600 saved | 40 | 0 | 110.7 | 4 | 82.5 (82.5) | 3 | 553.0 / 553.0 | 22px / 27.5px | 0 |
| Chrome fine 1600 none | 40 | 0 | 110.7 | 4 | 18.19 (18.19) | 1 | 553.0 / 553.0 | 13px / 18.2px | 0 |
| Chrome fine 1600 first | 40 | 0 | 70.9 | 4 | 18.19 (18.19) | 1 | 553.0 / 553.0 | 13px / 18.2px | 0 |
| Chrome fine 1366 saved | 40 | 0 | 110.7 | 4 | 82.5 (82.5) | 3 | 451.3 / 548.7 | 22px / 27.5px | 0 |
| Chrome fine 1366 none | 40 | 0 | 110.7 | 4 | 18.19 (18.19) | 1 | 451.3 / 548.7 | 13px / 18.2px | 0 |
| Chrome fine 1366 first | 40 | 0 | 70.9 | 4 | 18.19 (18.19) | 1 | 451.3 / 548.7 | 13px / 18.2px | 0 |
| Chrome fine 393 saved | 40 | 0 | 110.7 | 4 | 110 (110) | 4 | 353 / 353 | 22px / 27.5px | 0 |
| Chrome fine 393 none | 40 | 0 | 110.7 | 4 | 18.19 (18.19) | 1 | 353 / 353 | 13px / 18.2px | 0 |
| Chrome fine 393 first | 40 | 0 | 70.9 | 4 | 18.19 (18.19) | 1 | 353 / 353 | 13px / 18.2px | 0 |

Notes on the table:
- Before the change, saved cells read 16px / 24px in the text face at heights 72 (1600, 1366) and 96 (393); the board's B panels read 82.5 and 110 after.
- At 1366 the live app's list is 451.3 wide against the board's 548.7 (README decision 37, "Found while drawing" 2, the live band is narrower). Heights are not compared as equal there by the plan's rule, only as whole lines; they happen to read 82.5 (3 lines) in both.
- Label x/y, Written x/y and gap equal the board's panel within 0.5 in every cell (the numbers are in the probe's per-cell JSON). WebKit and Chrome differ by about 0.3px in Written's x (111.0 vs 110.7) from font metrics, as in Sid's own captures.
- Saved cells' class is exactly `version-row__reason app-hand`; empty cells' is exactly `version-row__reason version-row__reason--empty`; overflow-wrap reads `anywhere` on the saved value.

## Known Stubs

None.

## Threat Flags

None. The reason stays a React text child; only the dd's class string changed. No dangerouslySetInnerHTML added.

## For Mark's List

(The orchestrator writes the rows.)

1. **Device check, deferred.** On the iPad at 1366 landscape and on the iPhone at 393, served from the build (a hard reload of Mark's running preview is enough; `app/dist` was rebuilt), open the version details:
   - Mexican Chocolate v3: the Why sits on its own line, starting right under the W of WHY, written in the hand in pen blue.
   - Mexican Chocolate v2 and Olive Oil v1: 'no reason recorded' starts at the same edge, in small type.
   - The change counts as device-verified only when Mark confirms. The todo `.planning/todos/pending/2026-09-27-why-row-in-version-details.md` stays pending until then.
2. **Wording note for the next /impeccable document pass** (not edited here): DESIGN.md's band entry says the Why "reads as authored prose at the note role". It is now in the hand, as DESIGN.md's Hand entry, its Hand Rule and decision 17 say.

## Verification

- `npm --prefix app test`: 59 files, 1602 tests, pass.
- `npm --prefix app run build`: succeeds; `app/dist` is from the final app code (last app commit 63e9c54).
- `node .../261004-ly6-probe.mjs after`: exit 0, 294 checks.
- Scope: the 261004-ly6 commits touch under `app/` only VersionRow.jsx, VersionRow.test.jsx, app.css and cross-cutting.test.js; nothing under `.planning/sketches`, `.planning/canvas-generators` or DESIGN.md. `git status --porcelain app/` is empty.
- No Vite process started; only the harness's ephemeral 127.0.0.1 servers were used; :4173, :5173 and :8011 were not requested.

## Self-Check: PASSED

Files found: the probe, VersionRow.jsx, VersionRow.test.jsx, app.css, cross-cutting.test.js. Commits 2d5abf5, 63e9c54 and 100d82f exist on main.
