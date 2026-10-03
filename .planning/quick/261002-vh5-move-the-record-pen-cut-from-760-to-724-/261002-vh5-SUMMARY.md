---
phase: quick-261002-vh5
plan: 01
subsystem: ui
tags: [css, responsive, record-pen, sketch-011, decision-28, playwright-probe]
requires:
  - phase: 03.5-separate-the-recipe-from-the-sheet
    provides: the 03.5 probe harness, the width ladder, the 009 wide-touch block
provides:
  - "the record pen's wide-to-stacked cut at 724 (CSS width-only block, CSS wide-touch block, useBelow724)"
  - "a WebKit + Chrome probe that measures the cut against the three range boards"
affects: [recipe route record pen, DESIGN.md width ladder]
tech-stack:
  added: []
  patterns: ["one cut pixel shared by a CSS prelude pair and a matchMedia hook, pinned by tests and a build probe"]
key-files:
  created:
    - .planning/quick/261002-vh5-move-the-record-pen-cut-from-760-to-724-/261002-vh5-probe.mjs
  modified:
    - app/src/styles/app.css
    - app/src/styles/tokens.css
    - app/src/ui/BatchRow.jsx
    - app/src/ui/useBelowDesktop.js
    - app/src/styles/cross-cutting.test.js
    - app/src/styles/binder.test.js
    - app/src/ui/BatchRow.test.jsx
key-decisions:
  - "Cut the pen at 724 in all three literals (width-only block 723.98px, wide-touch block 724px, useBelow724 723.98px), per sketch 011 decision 28."
  - "Kept the width-only block and the phone-forms block as two blocks that now share (max-width: 723.98px); merging is Mark's structural call."
  - "The probe's frame-overflow measure counts real element boxes; the raw scrollWidth reading is logged and compared with the board, because Clear's ::after hit area adds 6px to it by design."
requirements-completed: [OBS1-01]
duration: ~15 min
completed: 2026-10-02
status: complete
commits: 4
plan_head_before: 92d5c00b15de2781f57d2617d6eeb4b950709467
plan_head_after: 7b661cb148e0c4af41559dbee00ec881904ee739
actuals:
  tokens: 11000
  tasks: 3
  commits: 4
---

# Phase quick-261002-vh5 Plan 01: Move the record pen's cut from 760 to 724 Summary

**The record pen's tasting battery now reads in three columns from 724 up instead of 760, in the CSS and in the DOM, and matches the three range boards' `v-cut724` panels to 0px in WebKit and system Chrome.**

## Performance

- Duration: about 15 minutes
- Tasks: 3 of 3
- Commits: 4 (measured from the ledger, `92d5c00..7b661cb`)
- Files: 7 app/src files modified, 1 probe created

## Accomplishments

- Three literals moved: the width-only block is `@media (max-width: 723.98px)`, the wide-touch block is `@media (min-width: 724px) and (pointer: coarse)`, and `useBelow760` is now `useBelow724` reading `(max-width: 723.98px)`. The hook and the stylesheet cut at the same pixel.
- Pins updated first (RED), then the literals (GREEN). The suite went from 55 files / 1507 tests to 55 files / 1511 tests (four new BatchRow cases, none removed). The build succeeds.
- The pen-cut comments in app.css, tokens.css, BatchRow.jsx and useBelowDesktop.js now cite sketch 011 decision 28 and say 724. Touch-floor and history comments are untouched.
- A probe (`261002-vh5-probe.mjs`) measures the built app in WebKit and system Chrome: 1,050 checks, exit 0 (tracer, matrix, resize).

## Task Commits

1. Task 1 RED (pins + probe tracer): `40e6f7f` test(261002-vh5): pin the record pen's cut at 724 and probe it on the build
2. Task 1 GREEN (three literals + rename): `27fbf6e` fix(261002-vh5): move the record pen's wide-to-stacked cut to 724
3. Task 2 (comments): `54e6442` docs(261002-vh5): the pen-cut comments name 724 and decision 28
4. Task 3 (matrix + resize groups): `7b661cb` docs(261002-vh5): measure the pen cut at 724 against the range boards

SUMMARY.md is left for the orchestrator's docs commit.

## RED evidence (Task 1)

Baseline: `npm --prefix app test` = 55 files, 1507 tests, all passing.

After the pins were written (before any app change), the three test files showed 10 failures: binder's allowed-media test; cross-cutting's `.axis-mark__stop` width-only test, the track test, the touch-union-versus-width-only test, both M4 tests, and the conditions test; and BatchRow's 724, 740 and 759 cases. The 723 case passed.

Probe tracer on the old build exited 1 with 45 failures. At 740 in WebKit with a mouse the pen was stacked, track 216, stop 44 x 44, frame height 1,469.16 against the board's 1,208.78 (largest board difference 426.66). Representative lines:

```
FAIL webkit 740 mouse: three columns (rule false, stacked true)
FAIL webkit 740 mouse: every track 186 (216,216,216,216,216,216)
FAIL webkit 740 mouse vs 740-pen-range.html v-cut724-mouse: frame height 1469.15625 vs board 1208.78125
```

The 723 checks passed on the old build. GREEN: the tracer exited 0 (72 checks), 740 matching the board with a 0px difference.

## Classification as applied

Final `grep -rnE '760|759\.98' app/src`, excluding home.css and home.test.js (Home's own 760 cut, out of scope):

| Line | Verdict |
| --- | --- |
| app.css:92 (`44px below 760px, the 759.98px block`) | leave: touch floor; its parenthetical was already stale (see Noticed) |
| app.css:1176 (`760.9px column`) | leave: a measurement |
| app.css:1900 (`40x44 below 760px`) | leave: 03.3.1-06 history |
| app.css:2325 (`759.98px width arm`) | leave: the retired union arm is history; tail reworded (Task 2) |
| app.css:2452 (`moved here from the width-only 759.98px block`) | leave: history; tail reworded (Task 2) |
| tokens.css:40 (`44px below 760px rides --touch-min`) | leave: touch floor |
| tokens.css:273 (`line 180 — 44px below 760px`) | leave: quotes sketch 007 line 180 |
| cross-cutting.test.js:14 (`44px-class targets below 760px`) | leave: touch floor |
| cross-cutting.test.js:273 (`width-only (max-width: 759.98px) block wholesale`) | leave: history |
| shell.test.js:33, notebook.css:20 and 43, css-source.js:83 | leave: not this task's (shell history, notebook's own retired step, a doc-comment example) |

Counts match the plan: app.css 5, tokens.css 2, cross-cutting.test.js 2, and 0 in BatchRow.jsx, BatchRow.test.jsx, useBelowDesktop.js and binder.test.js. No code-side 760 or 759.98 remains in app.css or tokens.css (checked on comment-stripped source).

## Measured results (build, WebKit and system Chrome)

`node 261002-vh5-probe.mjs tracer,matrix,resize` exits 0: 1,050 checks passed. The coarse WebKit context reported the requested `innerWidth` at every width, so the iPhone-profile fallback was not used.

Matrix (32 cases = 16 per engine). Track, stop and frame width are as read. "Board diff" is the largest difference across frame size, grid, each axis box, track, head, first stop. Overflow columns: frame (real-box overhang), track past axis, axis overlap, page; all 0 or slack (a track past axis of -15.3 / -94 means that much room left).

| Engine | Width | Pointer | Arrangement | Track | Stop | Frame W | Frame H | Board H | Board diff | Addendum H | vs addendum | Head H | Clear ::after | Overflow (frame / track / overlap / page) | Raw scroll |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| webkit | 723 | mouse | stacked | 216 | 44x44 | 640 | 1460.16 | n/a | n/a | n/a | n/a | n/a | auto | 0 / -94 / 0 / 0 | 0 |
| webkit | 723 | touch | stacked | 216 | 44x44 | 640 | 1763.61 | n/a | n/a | n/a | n/a | 44 | auto | 0 / -94 / 0 / 0 | 0 |
| webkit | 724 | mouse | 3 columns | 186 | 38x32 | 640 | 1208.78 | 1208.78 | 0 | 1209 | -0.22 | n/a | auto | 0 / -15.3 / 0 / 0 | 0 |
| webkit | 724 | touch | 3 columns | 186 | 38x44 | 640 | 1443.22 | 1443.22 | 0 | 1443 | +0.22 | 28.8 | 44px | 0 / -15.3 / 0 / 0 | 6 |
| webkit | 740 | mouse | 3 columns | 186 | 38x32 | 640 | 1208.78 | 1208.78 | 0 | 1209 | -0.22 | n/a | auto | 0 / -15.3 / 0 / 0 | 0 |
| webkit | 740 | touch | 3 columns | 186 | 38x44 | 640 | 1443.22 | 1443.22 | 0 | 1443 | +0.22 | 28.8 | 44px | 0 / -15.3 / 0 / 0 | 6 |
| webkit | 759 | mouse | 3 columns | 186 | 38x32 | 640 | 1208.78 | 1208.78 | 0 | 1209 | -0.22 | n/a | auto | 0 / -15.3 / 0 / 0 | 0 |
| webkit | 759 | touch | 3 columns | 186 | 38x44 | 640 | 1443.22 | 1443.22 | 0 | 1443 | +0.22 | 28.8 | 44px | 0 / -15.3 / 0 / 0 | 6 |
| chrome | 723 | mouse | stacked | 216 | 44x44 | 640 | 1450.83 | n/a | n/a | n/a | n/a | n/a | auto | 0 / -94 / 0 / 0 | 0 |
| chrome | 723 | touch | stacked | 216 | 44x44 | 640 | 1759.28 | n/a | n/a | n/a | n/a | 44 | auto | 0 / -94 / 0 / 0 | 0 |
| chrome | 724 | mouse | 3 columns | 186 | 38x32 | 640 | 1200.45 | 1200.45 | 0 | 1200 | +0.45 | n/a | auto | 0 / -15.3 / 0 / 0 | 0 |
| chrome | 724 | touch | 3 columns | 186 | 38x44 | 640 | 1439.89 | 1439.89 | 0 | 1440 | -0.11 | 28.8 | 44px | 0 / -15.3 / 0 / 0 | 6 |
| chrome | 740 | mouse | 3 columns | 186 | 38x32 | 640 | 1200.45 | 1200.45 | 0 | 1200 | +0.45 | n/a | auto | 0 / -15.3 / 0 / 0 | 0 |
| chrome | 740 | touch | 3 columns | 186 | 38x44 | 640 | 1439.89 | 1439.89 | 0 | 1440 | -0.11 | 28.8 | 44px | 0 / -15.3 / 0 / 0 | 6 |
| chrome | 759 | mouse | 3 columns | 186 | 38x32 | 640 | 1200.45 | 1200.45 | 0 | 1200 | +0.45 | n/a | auto | 0 / -15.3 / 0 / 0 | 0 |
| chrome | 759 | touch | 3 columns | 186 | 38x44 | 640 | 1439.89 | 1439.89 | 0 | 1440 | -0.11 | 28.8 | 44px | 0 / -15.3 / 0 / 0 | 6 |

- Every 724 to 759 frame height is within 0.5px of the addendum's figure (no case near the 15px reporting threshold) and equals the matching board's `v-cut724` panel exactly.
- With a coarse pointer from 724 to 759: every caption line is 28.8px, Clear's `::after` is 44px, and picking stops leaves the `.axes-grid` height unchanged. At 723 coarse the caption line is 44px.
- Live resize, both engines, mouse: 740 (three columns, 186 track) to 723 (stacked, 216 track, `.axes-grid--stacked` appears) to 724 (three columns, 186 track, `.axes-rule` appears). The hook and the stylesheet switch together on both sides of the cut.
- Other per-case readings for the 723 stacked pen: frame 1,460.16 (WebKit) and 1,450.83 (Chrome) on a mouse, against 1,208.78 and 1,200.45 at 724. The 724 to 759 mouse pen is about 251 to 252px shorter; on touch 1,763.61 to 1,443.22 (about 320px shorter) in WebKit and 1,759.28 to 1,439.89 (about 319px) in Chrome.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug in the plan's measurement] Frame overflow measure read Clear's hit area as overflow**
- **Found during:** Task 3 (first full matrix run: 6 failures, "frame overflow 6", at 724, 740 and 759 with a coarse pointer, in both engines)
- **Issue:** The plan defines frame overflow as the frame's `scrollWidth - clientWidth`. Under the wide-touch block (M4, sketch 009), Clear's `::after` hit area is drawn at `right: -6px`, 44px wide, by design ("an overflowing hit area"). The scroll width counts it, so the reading is 6 with a coarse pointer. Checked against the evidence: the board's own `v-cut724-touch` panel reads 6 too (the `v-today-touch` panel reads 0 only because today it is stacked); the app reads 6 at 760, 900 and 1000 coarse already, on the code before this change; the page's horizontal overflow is 0 throughout; and no real element box overhangs the frame. This is not a disagreement with the boards, so I did not touch app code.
- **Fix:** In the probe only. `frameOverflow` now measures how far any real element's box overhangs the frame's side edges (gate: at most 0.5px, passes at 0). The raw `scrollOverflow` is still read, must be at most 0.5 wherever the wide-touch block does not apply, and must equal the board's reading everywhere a board exists (the compare step now checks it). The "frame overflow is 0" truth in the plan therefore holds for real boxes, and the 6px hit-area reading is reported here rather than hidden.
- **Files modified:** `261002-vh5-probe.mjs`
- **Commit:** `7b661cb`

Otherwise the plan executed as written. The BatchRow stub test needed no fallback (`PEN_STACKED_QUERY` was not exported); rendering worked with the `window.matchMedia` stub. Task 1's tracer ran and passed before Task 2's comments, as ordered.

## Noticed, not fixed

- app.css:92's parenthetical ("44px below 760px, the 759.98px block") names the width-only block although the 44px text-control floor lives in the touch union. It was already stale before this task (the union's width arm was retired in 03.5-13); left as the plan directed.
- tokens.css still mentions a retired 600px prelude (the `(723.98px, 600px)` comment). Pre-existing; left.
- Two app.css blocks now share `(max-width: 723.98px)`: the pen's width-only block and the phone-forms block. Merging them is a separate structural choice for Mark; the pins tell them apart by selector.
- `.planning/todos/pending/2026-09-26-measure-the-record-pen-width-limits.md` is answered by decision 28 and this task, so it is ready to close. I did not move it.
- Raw `scrollWidth - clientWidth` on the pen frame reads 6 with a coarse pointer from 724 up (and from 760 up before this change): Clear's invisible hit area, see the deviation. The board draws the same.

## Known Stubs

None.

## Threat Flags

None. No new network, auth, file or schema surface. The probe serves only on ephemeral 127.0.0.1 ports and never requested :4173, :5173 or :8011. No package was added.

## Pending: Mark's device check (end-of-run UAT, not blocking)

Mark's `:4173` preview serves `app/dist`, which was rebuilt from the final code (`vite preview` serves dist with no restart needed). He reloads the tab on each device, then opens Olive Oil v1, Record another, Add tasting:

1. iPad full screen, landscape (1366): the battery is stacked in the log column beside the Sheet, as before.
2. iPad portrait (1024): three columns, as before.
3. iPhone (393): stacked, as before.
4. Any window between 724 and 759 wide, if he has one (an iPad Stage Manager window, or an iPad mini in portrait at 744): three columns, nothing overlapping, and Clear easy to hit with a finger.

The cut counts as device-verified only when Mark confirms. Two engines on this Mac are evidence, not the device.

## Self-Check: PASSED

- Files: the probe, app.css, tokens.css, BatchRow.jsx, useBelowDesktop.js, cross-cutting.test.js, binder.test.js and BatchRow.test.jsx all exist and are committed.
- Commits found: `40e6f7f`, `27fbf6e`, `54e6442`, `7b661cb`.
- Full suite 55 files / 1511 tests passing; build succeeds; probe `tracer,matrix,resize` exits 0 with 1,050 checks.
- No commit touches DESIGN.md, home.css, home.test.js, notebook.css, the canvas-generators files or the critique files.
