---
phase: quick-261101-mbe
plan: 01
quick_id: 261101-mbe
subsystem: ui
tags: [notes, list-marker, webkit, ipad, forced-colors, accessibility]
requirements: [bug-p11-bys-note-dot-on-right]
key-files:
  modified:
    - app/src/ui/Authored.jsx
    - app/src/ui/Authored.test.jsx
    - app/src/styles/tokens.css
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
    - app/src/styles/print.test.js
  created:
    - .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs
decisions:
  - "Editing note dot is an aria-hidden span drawn by CSS in the ul's left padding; the editing li is display: block so no engine generates a ::marker"
  - "Editing ul carries role=list (WebKit exposes a markerless ul as a group)"
  - "Tokens calibrated by the probe: --sheet-note-bullet-size 5.5px, --sheet-note-bullet-rise 2px; first values passed every gate, no recalibration"
metrics:
  tasks: 2
  commits: 2
  files: 7
actuals:
  tasks: 2
  commits: 2
plan_head_before: 6e5cf2150750dc8dc119bf9a6aaf40eb82a5b2ac
plan_head_after: 9455f85f787c684d14bed2ff2ab4c0141dabaa3c
commits: 2
status: complete
completed: 2026-11-01
---

# Phase quick-261101-mbe Plan 01: The editing note's dot stands in the left margin Summary

The editing note list draws its own dot (an empty aria-hidden span in the ul's left padding, disc painted by `::before`) instead of relying on the engine's list marker, so Safari 27's marker placement inside the flex row can no longer move it; the reading list and print are byte-identical.

## Commits

- `c8c9d71a` fix: the editing note's dot is drawn in the left margin, not left to the list marker (Authored.jsx, Authored.test.jsx, tokens.css, app.css, the probe)
- `9455f85f` fix: the editing note's dot keeps CanvasText in forced colours (app.css, cross-cutting.test.js, print.test.js)

## What changed

- `NoteList` editable branch: ul class `authored__notes authored__notes--editing`, `role="list"`; each li opens with `<span class="authored__note-bullet" aria-hidden="true">` before `span.authored__note-field`. Reading branch untouched.
- app.css: `.authored__notes--editing > li` (display block, position relative); `.authored__note-bullet` (absolute, right 100%, top `--gap-hair`, margin-right `--gap-s`); `.authored__note-bullet::before` (inline-block disc from the two tokens, `--sheet-ink`, vertical-align rise); one rule in the existing forced-colors block (`forced-color-adjust: none`, `background-color: CanvasText`). No new @media block, no literal.
- tokens.css: `--sheet-note-bullet-size: 5.5px`, `--sheet-note-bullet-rise: 2px`.

## Probe verdict (261101-mbe-bullet-probe.mjs, base = scratch build of HEAD 6e5cf215, after = scratch build of the change)

`check --area all`: **206 PASS, 0 FAIL**. WebKit and Chrome, 1366 fine, 1366 coarse, 1366 coarse DPR 2; the 393 run is INFO only (0 gates differ there too).

| Area | Gates | WebKit | Chrome |
|---|---|---|---|
| reading | R1 ul outerHTML identical; R2 li and ul boxes within 0.5 px; R3 native marker ink within 1 device px; R4 list-item + disc | PASS all 3 configs | PASS all 3 configs |
| create | E1 structure; E2 li/textarea/Remove/note-field/ul boxes within 0.5 px; E3 dot within 1 CSS px of HEAD's native disc; E4 clear of box, ink on first line; E5 colour = HEAD li colour; E6 text ink within 1 device px, gap strip empty; E7 listitem count 2 | PASS all 3 configs | PASS all 3 configs; Chrome AX: ul is a list, 2 listitem nodes, bullet node ignored |
| pen (three-line first note included) | same as create | PASS all 3 configs | PASS all 3 configs; same AX result |
| forced | FC: really forced + ink within 1 CSS px of native disc | INFO only (see below) | PASS (forced for real; dot ink x -17..-12, y 12..17 vs native y 11..16) |

Dot ink against HEAD's native disc (CSS px, li-relative, 1366 fine, create): WebKit after x -17..-12, y 12..18; base x -17..-11, y 12..18. Chrome after x -17..-12, y 12..17; base x -17..-12, y 11..16 (1 px lower, the calibration favours WebKit as planned). At DPR 2 WebKit: after x -17.5..-12, y 12.5..18; base x -17..-11.5, y 12.5..18.5. All within 1 CSS px, as the gate requires. Bullet span rect: x -17.5..-12 against the li, wholly in the 20 px padding strip, clear of textarea and Remove.

WebKit forced colours (INFO): the media query matches but colours are not forced (probe background stays rgb(18, 52, 86), li colour rgb(20, 20, 20) before and after); bullet ink after x -17..-12, y 12..18 against base x -17..-11, y 12..18.

393 INFO figures: li and textarea boxes equal HEAD (create: 52 and 44 px li heights; pen: 124 and 76); WebKit dot x -17.5..-12, y 12.5..18 (create) against native x -17..-11.5, y 12.5..18.5; Chrome dot y 12..17 against native 11..16.

Calibrated tokens: `--sheet-note-bullet-size` 5.5px, `--sheet-note-bullet-rise` 2px; `--gap-s` (12px) and `--gap-hair` (2px) unchanged. The planning values passed every gate on the first run, so no recalibration was made.

## Test totals

Before: 4246 tests in 130 files (HEAD 04a616bd, as planned). After: **4259 passed in 130 files**, no test deleted (+13: 8 in Authored.test.jsx, 5 in cross-cutting.test.js; print.test.js gained assertions inside an existing test).

## Deviations from Plan

None to the app code or the gates. Two probe-internal notes:

1. The marker-strip clip stops 1 CSS px short of the li's left edge. In the first base record at DPR 2 the reading strip caught the first glyph/edge spill (ink right edge 0); the clip was shortened in both builds and the base re-recorded before any app edit. The gate compares like with like.
2. "Really forced" in the forced area is true when either the li colour changes under emulation or a probe div's background colour is repainted; the plan named only the li colour (Chrome's black-on-black-ish change is visible, but the probe div is a sharper test).

## Auth gates

None.

## Known Stubs

None.

## Threat Flags

None. The bullet is an empty span with no text and no handler; no dangerouslySetInnerHTML added.

## Deferred Human Verification

For the orchestrator, after a dist rebuild the executor never made (app/dist/index.html mtime unchanged, port 4173 and 8077 never contacted), on Mark's iPad (Safari 27.0.1):

1. Open a new recipe and add two notes under Before you start, one long enough to wrap.
2. Expect each dot in the left margin beside the box's first line, nothing inside the box, and no gap before Remove.
3. Open Next version on a recipe with notes and expect the same.
4. With VoiceOver, expect "list, 2 items" and no dot announced.

No Mark's List writes were made (the executor has no ArtifactData).

## Note for the orchestrator

Sketch 014's drawing is unchanged, but its markup still uses the native marker. Whether the sketch takes the same structure is the orchestrator's call; no app/ change depends on it.

## Self-Check: PASSED

- Files exist: the probe, Authored.jsx, Authored.test.jsx, tokens.css, app.css, cross-cutting.test.js, print.test.js.
- Commits c8c9d71a and 9455f85f are on main; `git rev-list --count` from the recorded base gives 2.
- Full suite: 4259 passed, 130 files. Probe: 206 PASS, 0 FAIL.
