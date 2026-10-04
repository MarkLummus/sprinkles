---
phase: quick-261004-ox4
plan: 01
quick_id: 261004-ox4
subsystem: record-pen-app-look
tags: [css, notebook, record-pen, sketch-011, decision-29, decision-40, forced-colors, touch]
requires: [261004-ox3]
provides:
  - the record pen's App skin in the batch log (decision 29 on decision 38's one 10px radius)
  - the group cues' own face and space (decision 40, option C)
  - Clear level with its axis name at the phone (decision 40, finding 1)
affects: [app/src/styles/notebook.css, app/src/styles/app.css, app/src/styles/tokens.css]
key-files:
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/styles/tokens.css
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
  created:
    - .planning/quick/261004-ox4-record-pen-look-sketch-011-decisions-29-and-40-readme-mark-s/261004-ox4-probe.mjs
    - .planning/quick/261004-ox4-record-pen-look-sketch-011-decisions-29-and-40-readme-mark-s/261004-ox4-baseline.json
decisions:
  - "Picked stop and segment fill app blue (--app-blue-text) with a white label in the log: sketch 011 decision 29"
  - "Group cue line height is a new App token, --app-notebook-pen-cue-line-h (20px), not the board's literal"
  - "Clear's word sits at the bottom of its 44px box (inline-flex, flex-end) in the touch union; M4 at the phone rejected"
status: complete
commits: 7
plan_head_before: 0fcc2c3f5826caac34c887b5b35a0491c43126d5
plan_head_after: 276e04d697e71bdf5554d0b5b577e2d091f3aa2f
---

# Phase quick-261004-ox4 Plan 01: Record pen App look Summary

The record pen's log wears decision 29's skin on the one 10px radius, the group cues read as headings in their own face and space (option C), and Clear sits on its axis name's line on the phone. All three match their boards element by element in WebKit, with no box moved except where decision 40 asks.

## What changed

- **notebook.css**
  - A skin section after the ceremony wrap rule, copied rule for rule from the board's `SKIN`: divider rule colour, secondary caption colour, 10px text fields, joined stops and segments with 10px outer corners only, the picked fill in app blue with a white label, 4px defect squares that fill app blue when pressed, and the log's own ceremony (Cancel outline, Save batch filled, both at 10px). The Sheet's foot ceremony (PenFoot) stays square.
  - A cue section after it: the cue face (14px, 600, sentence case, ink), the stacked grid's 32px gap, the first axis's top margin 0, the cue's bottom margin `calc(var(--gap-s) - var(--gap-m))`, and the defects head's margin scoped to `.axes-grid--stacked > .defects-head`.
  - `@media (max-width: 723.98px) and (pointer: coarse)` holding the phone cue margin, read from `--sheet-caption-line-h-touch` and `--sheet-caption-two-lines-abs`.
  - `@media (forced-colors: active)` at the file's foot, restating Highlight for the picked stop, segment and pressed defect square.
  - Two comment sentences amended that the skin made false (the reading-state comment and the `(min-width: 1366px)` frame comment).
- **tokens.css**: `--app-notebook-pen-cue-line-h: 20px`.
- **app.css**: one rule in the `(pointer: coarse)` touch union, `.axis-mark__head .text-control, .segmented-field__head .text-control { display: inline-flex; align-items: flex-end }`. No new block (binder.test.js still pins seven).
- **Tests**: notebook.test.js gains two describes and a seven-step media list; cross-cutting.test.js gains the Clear test and the touch union grows to seven. Suite 1655 -> 1666 passing, none removed. Build succeeds.

## Measurements (WebKit coarse; Chrome where noted; not Mark's devices)

Height is baseline -> now. Board mismatches are before the skin -> now, against record-pen-app.html (read, blank, filled) and, for C, record-pen-cues.html. Cue gaps are cue to first name / last item to next cue / "Any problems?" to cue / cue to chips. Clear d_bottom is the bottom of Clear's word minus the bottom of the axis name, first axis.

| Width | State | Height | Board mismatches | Cue gaps | Clear d_bottom (first axis) |
|---|---|---|---|---|---|
| 1366 | read | 898.7 -> 898.7 | 300 -> 0 | - | - |
| 1366 | blank | 767.3 -> 767.3 | 307 -> 0 | - | - |
| 1366 | filled | 2483.4 -> 2452.6 | 1218 -> 0 (skin; 0 against C) | 59.8/33/26/6 -> 25.8/45/12/6 | 0.2 -> 0.2 |
| 393 | read | 556.2 -> 556.2 | 300 -> 0 | - | - |
| 393 | blank | 789.7 -> 789.7 | 307 -> 0 | - | - |
| 393 | filled | 2612.2 -> 2557.4 | 1218 -> 0 (skin; 0 against C) | 75/33/26/6 -> 25.8/45/12/6 | -12.7 -> 0.2 |
| 1024 coarse (wide grid, undrawn) | filled | 1477.4 -> 1485.0 | none drawn | none (not stacked) | 0.2 -> 0.2 |

- Every Clear at 393 now equals its 1366 value (0.2 on segmented fields, -0.4 on axes; it was -12.7 and -13.3). Head and Clear box stay 44. 1366 and 1024 did not move.
- The 1024 defects head keeps its 6px bottom margin; overflow is 0 everywhere.
- Forced colours in system Chrome: the picked stop, segment and pressed defect square equal a `Highlight` reference element (built, skin, cues).
- System Chrome also reproduced the skin group: all eight board panels at 0 mismatches (coarse pointer emulated).
- Probe results: `skin` 37 checks passed (before the cues change), `cues,clear` 85 checks passed, `baseline` 43 checks passed.

## The four non-literal readings and the Clear alternatives

- The cue's 20px line height is a new App token, because notebook.css forbids bare px.
- The phone's extra cue margin reads two Sheet tokens (15.2px) instead of the board's rounded 15, under `(max-width: 723.98px) and (pointer: coarse)`. At a fine pointer below 724 the head is 24px, no extra margin applies, and the gap is 21px (undrawn).
- The defects head's margin is scoped to the stacked grid; unscoped, the wide grid's 20px row gap would bring it to 0.
- Forced colours: the board draws none; the block above keeps the system Highlight, which the skin alone broke (rgb(21, 118, 222) in place of Highlight).
- Clear: chosen is the word at the bottom of its own box. Rejected: M4 at the phone (head drops to 28.8px, every axis moves about 15px, breaks the approved 393 board and 007/008) and centre or baseline alignment of the head's items (lifts the name off its stops).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Probe compared boxes of `display: none` elements, and the boards' Caveat was blocked**
- **Found during:** Task 1, first `skin` run (read-393 showed 62 mismatches, read-1366 showed 3)
- **Issue:** The closed fold's content has no rendered box, so its 0,0 rect minus the log's page position only measured where the log sits. The boards link Caveat from Google Fonts, which the harness blocks, so the hand text ("Problems") rendered in a fallback face on the board only. Neither was a skin difference.
- **Fix:** The in-page reader reports `box: null` for an element with no client rects, and the comparison requires both sides to be unrendered. The board reader gives the page the app's own `caveat-regular.woff2` from the repo server. Nothing was loosened: tolerance stays 0.5 and every style string stays exact. The baseline was re-read on the unchanged source with the fixed probe (read-1366 303 -> 300, read-393 362 -> 300 before-mismatches).
- **Files modified:** 261004-ox4-probe.mjs, 261004-ox4-baseline.json
- **Commit:** ead2b9e

**2. [Plan wording] One new cue test already passed before the CSS**
- **Issue:** The plan says every new assertion fails in RED. The guard "no bare `.notebook-log .defects-head` rule" passes before and after, by design; the other four cue tests and the media test failed.

**3. [Expected] The `skin` group's filled-state checks are now superseded**
- The `skin` group compares the filled log with the pre-C boards (`cues-built`) and the baseline heights. After Task 2 those intentionally differ (heights 2452.6, 2557.4, 1485.0), so `skin` run today fails 13 checks, all on filled states and the 1024 height. It passed 37/37 at the Task 1 commit. The final gate is `cues,clear`, which passes 85/85 and covers read and blank against record-pen-app.html.

## Found

- DESIGN.md still lists the picked state's colour as unresolved; the build now uses app blue (decision 29). That is Impeccable's to record, not this item's.
- The 724 to 1365 arrangement (wide grid) and fine pointers below 724 are undrawn; their measured numbers are in the table above (1024: 1485.0, defects head 6px) and the 21px cue gap noted above.
- The todo `.planning/todos/pending/2026-09-25-draw-the-record-pen-in-app-context.md` is now built. The orchestrator closes it; this task did not move it.
- The picked-state skin applies to every `.notebook-log` pen. A pen outside the log keeps app.css's own rules; app.css's base and forced-colours rules were not edited.

## Known Stubs

None.

## Threat Flags

None. No new network surface, auth path or schema; the probe serves only ephemeral 127.0.0.1 ports and saves nothing.

## Deferred Human Verification

Served from `npm --prefix app run build && npm --prefix app run preview -- --host`, Olive Oil v1, Record another, Add tasting:

- iPhone (393): the rounded fields and joined stops, the app-blue picked fill with a white number, the cues as headings 26px above their first axis, and Clear level with each axis name.
- iPad (1366 landscape, the 350 log column, and 1024 portrait, the wide grid): the same skin and cue face.

## For Mark's List

The ArtifactData tool was not available in this run, so no row was written. Row for the orchestrator to add:

- slug: `record-pen-app-look-device-check`
- kind: `check`
- title: "Record pen in App look: skin, cues and Clear on the iPhone and iPad"
- where.label: "On the canvas, page Recipe route 03.5: boards R35C_RecordPenApp and R35C_RecordPenCues; in the app, Olive Oil v1, Record another, Add tasting"
- links: [{label: "Canvas", url: "https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq"}]
- addedBy: `claude`, status `open`, ISO createdAt and updatedAt

## Self-Check: PASSED

- Files exist: notebook.css, notebook.test.js, tokens.css, app.css, cross-cutting.test.js, probe, baseline JSON.
- Commits exist: d601457, fe20d5a, ead2b9e, 68a0a7a, f753ffd, a810406, 276e04d. Under app/ they touch only the five named files; none touches DESIGN.md, .planning/sketches, .planning/canvas-generators, .planning/todos or .impeccable.
- `npm --prefix app test` 1666 passed; `npm --prefix app run build` succeeds.
