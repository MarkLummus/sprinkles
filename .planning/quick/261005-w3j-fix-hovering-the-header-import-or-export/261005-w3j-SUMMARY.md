---
phase: quick-261005-w3j
plan: 01
quick_id: 261005-w3j
subsystem: ui
tags: [shell, hover, cascade, sketch-011-decision-54]
requires: []
provides:
  - "Hovering the header's Import or Export, or the Import error panel's Close, with a pointer no longer changes its box"
affects: [app/src/styles/shell.css, app/src/styles/shell.test.js]
tech-stack:
  added: []
  patterns: ["state the element's own padding on the rule that already ties app.css's button:hover"]
key-files:
  created:
    - .planning/quick/261005-w3j-fix-hovering-the-header-import-or-export/261005-w3j-probe.mjs
  modified:
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js
key-decisions:
  - "Sketch 011 README decision 54; Mark's List row fix-header-import-export-hover-shrink (found by Sid). The padding sits on button.shell__place (0,1,1), not in a hover rule."
requirements-completed: [UX1-01]
metrics:
  duration: "about 20 minutes"
  completed: 2026-10-05
status: complete
commits: 3
plan_head_before: 9db2127ebe30053fce966d830b79a0e80a5f650f
plan_head_after: dbc1a86ff402bfd3d7fb882707c73de61592de45
actuals:
  tokens: 5000
  tasks: 3
  commits: 3
---

# Phase quick-261005-w3j Plan 01: Header Import and Export keep their box under hover Summary

One declaration, `padding: var(--gap-s) var(--gap-m)`, on the existing `button.shell__place` rule stops the header's Import, Export and the error panel's Close from shrinking under a pointer, in WebKit and Chromium.

## Cause

app.css's `button:hover` (0,1,1) sets `padding: var(--gap-xs)` (6px) on every button, and `.shell__place` (0,1,0) carries the place's padding of 12px 20px, so on hover the lower-weight padding lost: 28px of width and 12px of height went, and the neighbours slid. `button.shell__place` already tied `button:hover` and won the border by load order, but never stated the padding; its comment called the shrink "an open todo".

## What changed

- `app/src/styles/shell.css`: the one top-level `button.shell__place` rule gains `padding: var(--gap-s) var(--gap-m);` (the same value `.shell__place` declares), and its comment is rewritten to say so and to drop the "open todo". No other rule, selector, token or file changed.
- Why not a `:hover` rule: a hover rule at (0,2,x) would outrank the phone block's tile padding (0,2,0) and (0,3,0) and change More's tiles under the pointer. At (0,1,1) the declaration ties `button:hover` and wins by order on the header and Close, and loses to the phone rules, which is the wanted split.
- `app/src/styles/shell.test.js`: the test that pinned "declares no padding" now pins the padding as the sixth declaration; a new describe asserts `button.shell__place`'s padding is non-empty and equals `.shell__place`'s, so the two cannot drift.
- `261005-w3j-probe.mjs`: measures rest and hover boxes in WebKit and system Chrome on the built app, at 1600, 1366, 744 and 393.

Commits: `75b19ea` test (pin, red), `5c5f7b5` test (probe, red on the pre-fix build), `dbc1a86` fix.

## Red (before)

Task 1, `npm --prefix app test -- src/styles/shell.test.js`: `Tests  2 failed | 65 passed (67)`.
- `exactly one top-level button.shell__place rule resets the button and states the place's padding`: `AssertionError: expected [ 'appearance: none', …(4) ] to deeply equal [ 'appearance: none', …(5) ]`
- `button.shell__place states the same padding as .shell__place, so button:hover's 6px cannot shrink it`: `AssertionError: expected button.shell__place to state a padding: expected '' not to be ''`

Task 2, probe on the pre-fix build: exit 1, 14 FAIL lines (7 per engine: header Import and Export at 1600, 1366, 744, and Close at 1600). No FAIL for Search, More's summary or a More tile.

## Hover boxes, before and after (width x height in px, rest then hover)

| Engine | Target | Width | Before: rest -> hover | After: rest -> hover |
|--------|--------|-------|-----------------------|----------------------|
| WebKit | Import | 1600, 1366, 744 | 108.41x44 -> 80.41x32 | 108.41x44 -> 108.41x44 |
| WebKit | Export | 1600, 1366, 744 | 108.16x44 -> 80.16x32 | 108.16x44 -> 108.16x44 |
| WebKit | Close | 1600 | 76.42x41 -> 48.42x29 | 76.42x41 -> 76.42x41 |
| Chromium | Import | 1600, 1366, 744 | 106.98x44 -> 78.98x32 | 106.98x44 -> 106.98x44 |
| Chromium | Export | 1600, 1366, 744 | 107.22x44 -> 79.22x32 | 107.22x44 -> 107.22x44 |
| Chromium | Close | 1600 | 75.78x40 -> 47.78x28 | 75.78x40 -> 75.78x40 |

The 1366 readings match Sid's (WebKit Import 108.4 x 44 -> 80.4 x 32; Chromium 107.0 x 44 -> 79.0 x 32). Left, top and the computed padding string also equal their rest values after the fix.

## Controls (unchanged before and after, rest equals hover)

| Target | WebKit | Chromium |
|--------|--------|----------|
| Header Search (1600, 1366, 744) | 110.95x44 | 109.83x44 |
| More's summary (393) | 78.59x55 | 78.59x55 |
| More's Import, Export, Search tiles (393) | 75.5x49 | 71.58x48 |

Every REST box in the after run is identical to the before run (diffed line by line): nothing moves at rest.

## Verification

- `npm --prefix app test -- src/styles/shell.test.js`: `Tests  67 passed (67)`.
- `npm --prefix app test` (full): 63 files, 1879 tests passed.
- `npm --prefix app run build`: exit 0.
- Probe after the fix: exit 0, `261005-w3j-probe: 28 checks passed`.
- `git diff 9db2127..HEAD --name-only -- app/` lists only `app/src/styles/shell.css` and `app/src/styles/shell.test.js`; app.css and tokens.css are untouched.

## Notes

- The error panel's Close is a `button.shell__place`, so the same rule covers it; it was measured at 1600 in both engines.
- More's summary is a `<summary>`, which `button:hover` never matches, so it needed no change. More's tiles are held by the phone block's (0,2,0) and (0,3,0) padding and measured unchanged under hover.
- The plan's base was 547ecc3; HEAD at start was 9db2127 (a docs-only commit later), so the ledger base is 9db2127.

## Deviations from Plan

None - plan executed exactly as written.

## Not verified

Mark's own desktop Safari and Chrome, and the iPad and iPhone. A touch screen has no hover; a tap that also leaves `:hover` set is the only touch path, and the same rule covers it.

## Deferred Human Verification

On the build served by `npm --prefix app run build && npm --prefix app run preview -- --host` (never the dev server), hover Import and Export in the header on a desktop browser at 1600 and 1366 and watch that the words and the page beside them do not move. The Mark's List row fix-header-import-export-hover-shrink is for the orchestrator to close.

## Self-Check: PASSED

- FOUND: app/src/styles/shell.css, app/src/styles/shell.test.js, 261005-w3j-probe.mjs
- FOUND: 75b19ea, 5c5f7b5, dbc1a86 (all ancestors of HEAD)
