---
phase: quick-261005-wgz
plan: 01
quick_id: 261005-wgz
subsystem: ui
tags: [contrast, wcag, hand, tasting-note, filled-action, font-weight]
requires: []
provides:
  - "--app-blue-text and --app-notebook-text each clear 4.5:1 on --app-background, one hex step per channel darker than approved"
  - "The saved tasting note in the read view renders in the hand (.app-hand), like a saved Why and Next time"
  - "The Notebook's filled action .notebook-action is weight 600, equal to Home's .home__action, pinned equal by a test"
affects: [app/src/styles/tokens.css, app/src/ui/BatchRow.jsx, app/src/styles/app.css, app/src/styles/notebook.css]
tech-stack:
  added: []
  patterns: ["WCAG ratio computed in the test, not copied from a note", "probe measures a reference .app-hand element against the real element"]
key-files:
  created:
    - .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/tokens.test.js
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
key-decisions:
  - "D-01 (Mark 2026-10-05, decide-companion-contrast-under-4-5): fix it with a 1 step darken"
  - "D-02 (Mark 2026-10-05, decide-tasting-note-in-the-hand): the saved note reads in the hand; the pen's field stays prose-field"
  - "D-03 (Mark 2026-10-05, decide-filled-action-weight): the filled action is weight 600 on Home and in the Notebook"
requirements-completed: [UX1-01, OBS1-01]
metrics:
  duration: "about 25 minutes"
  completed: 2026-10-05
status: complete
commits: 3
plan_head_before: 4e20f112f2372f58070a9ce1ed3c491308a231fe
plan_head_after: 6f89f628f7411afea3f8f7a7a03b3034d0067b03
actuals:
  tokens: 4500
  tasks: 3
  commits: 3
---

# Phase quick-261005-wgz Plan 01: Three decided app fixes Summary

Two text colours one step darker so they clear 4.5:1, the saved tasting note in the hand in both WebKit and Chromium, and one filled-action weight (600) on Home and in the Notebook.

## Commits

| Task | Commit | Paths |
| ---- | ------ | ----- |
| 1 contrast | 9aa8963 | app/src/styles/tokens.css, app/src/styles/tokens.test.js |
| 2 tasting note | 4a49877 | app/src/ui/BatchRow.jsx, app/src/ui/BatchRow.test.jsx, app/src/styles/app.css, app/src/styles/cross-cutting.test.js, .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs |
| 3 weight | 6f89f62 | app/src/styles/notebook.css, app/src/styles/notebook.test.js |

Nothing pushed. All three on `main`, as the orchestrator instructed.

## Task 1: contrast, one step darker (D-01)

New hexes and measured WCAG 2 ratios on `--app-background` (#ffffff), computed by the test's own helper:

| Token | Approved | Now | Ratio before | Ratio now |
| ----- | -------- | --- | ------------ | --------- |
| --app-blue-text | #1576de | #1475dd | 4.489 | 4.547 |
| --app-notebook-text | #ee0803 | #ed0702 | 4.495 | 4.534 |

One hex step per channel was enough for both; no larger step was needed. The white label on the blue fill is the same ratio as the blue on white (4.547).

The other three companions pass already and are byte-identical: --app-recipe-book-text #bc5b0d 4.525, --app-idea-log-text #976f01 4.575, --app-ingredients-text #358452 4.591.

Red run (3 failures, all expected; guards and every existing test passed):

- `--app-blue-text #1576de measures 4.489:1 on #ffffff`
- `--app-notebook-text #ee0803 measures 4.495:1 on #ffffff` (same shape)
- `label on fill measures 4.489:1`

Green: tokens.test.js 14 of 14. Full suite 1888 passed, build exit 0.

Did any other test pin an old value? None. A grep over `app/src` and `app/tests` for both old hexes and their rgb forms found only the two tokens.css declarations. A new guard test also pins that no stylesheet or ui source carries a literal copy of either companion.

A sentence was added to the palette comment in tokens.css recording the step and the new figures. DESIGN.md and .impeccable/ were not touched (Sid's); until Sid updates them, tokens.css and DESIGN.md disagree on two hexes and one weight, as expected.

## Task 2: the saved tasting note in the hand (D-02)

Is the recording form a different component from the reading? Same file, `BatchRow.jsx`, two branches: `TastingReading` draws the saved note (display), and the recording branch draws the pen's textarea (entry, `aria-label="How did it turn out?"`, class `prose-field`). Only the display paragraph changed: its class went from `prose-text tasting-reading__note` to `app-hand tasting-reading__note`. The textarea is untouched, and a new guard test pins that it carries `prose-field` and never `app-hand`, blank or filled.

In app.css the `.tasting-reading__note` rule gained `overflow-wrap: anywhere` (a long word still wraps, as `.version-row__reason` does, since `prose-text` no longer supplies it) and a comment. No rule on the class sets a face, size, leading or colour; a test pins that across app.css and notebook.css. notebook.css and the three `.prose-text` rules are unchanged.

Red run (2 failures, as planned):

- BatchRow.test.jsx, "renders the saved note in the hand when written...": `expected '<section class="batch-row" aria-label…' to match /<p class="app-hand tasting-reading_…/p>`
- cross-cutting.test.js, ".tasting-reading__note keeps the prose measure and a long word wrapping": `expected '\n  max-width: var(--measure-prose);\…' to match /overflow-wrap:\s*anywhere/`

Green: both files pass; full suite 1891 passed; build exit 0; probe exit 0.

Probe: the harness serves the same built `app/dist` on free loopback ports (127.0.0.1, ephemeral) and starts no Vite process, so the one-Vite-process rule holds and Mark's :4173 preview was never requested. Every case ran in a fresh throwaway context. Caveat was loaded in every case (`document.fonts.check('22px Caveat')` true).

Computed font-family of the saved note, before (pre-fix build) and after:

| Engine | Width | Before | After |
| ------ | ----- | ------ | ----- |
| WebKit | 1600, 1366, 393 | `-apple-system, Segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif` (15px / 22.5px, rgb(89, 89, 89)) | `Caveat, Georgia, Iowan Old Style, Times New Roman, serif` (22px / 27.5px, rgb(31, 61, 122)) |
| Chromium (system Chrome) | 1600, 1366, 393 | `-apple-system, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif` (15px / 22.5px, rgb(89, 89, 89)) | `Caveat, Georgia, "Iowan Old Style", "Times New Roman", serif` (22px / 27.5px, rgb(31, 61, 122)) |

After the fix the note's family, size, leading, colour and style equal the reference `.app-hand` element's in all six cases, weight 400. Before the fix: 6 FAIL lines (3 widths x 2 engines), each reading the grotesk. The pen's textarea reads `Georgia, Iowan Old Style, Times New Roman, serif` (the prose-field role) in all six cases, before and after.

After: `261005-wgz-probe: 6 checks passed`.

The probe needed one fix on its first runs: below the desktop width the Tasting fold in the read view starts closed, so the first version timed out at 393. It now opens the fold if `aria-expanded` is false before reading the note, as the plan said to.

## Task 3: the filled action at weight 600 (D-03)

`.notebook-action` in notebook.css went from `font-weight: 700` to `600`, a bare number as every other weight in the stylesheets; no token was added. `.notebook-action--outline`, `.notebook-link`, `.notebook-recipe__name` and the pen's Save rule are unchanged. notebook.test.js pins `.notebook-action` and `.home__action` equal at 600.

Red run (2 failures):

- `.notebook-action font-weight: expected '700' to be '600'`
- `.notebook-action (700) against .home__action (600): expected '700' to be '600'`

Computed font-weight from the probe at 1366 (INFO lines), before (Task 2 pre-fix and Task 2 post-fix runs, both 700) and after:

| Engine | Home's filled action | Notebook's filled action, before | Notebook's filled action, after | Pen's filled Save |
| ------ | -------------------- | -------------------------------- | ------------------------------- | ----------------- |
| WebKit | 600 | 700 | 600 | 400 |
| Chromium | 600 | 700 | 600 | 400 |

Green: notebook.test.js passes; full suite 1893 passed; build exit 0; probe exit 0.

## Deviations from Plan

None. The plan was executed as written. Two small notes:

- The executor protocol's "HEAD is not the default branch" assertion would refuse commits on `main`; the orchestrator's instruction for this run was explicit (sequential on the main checkout), so that was followed, as in 261005-db4.
- No worktree plan-head ledger file was created; `plan_head_before` above is the start HEAD 4e20f11 and `commits` is `git rev-list --count 4e20f11..HEAD` = 3.

## Observed, not changed

- **The pen's filled Save weight is 400** in WebKit and Chromium (`.notebook-log .save-ceremony button:last-of-type`). It sets a fill and a colour and declares no weight of its own, and the base button rule sets none, so it falls to the engine's button default. It is therefore lighter than the other filled actions (600). Left for Mark to decide.
- **The five companions on `--app-surface-subtle` (#f3f4f2)**, the current rail place, all read about 4.1:1, a pairing Mark's decision did not name. Ratios with the new values: --app-blue-text 4.121, --app-notebook-text 4.109, --app-recipe-book-text 4.102, --app-idea-log-text 4.147, --app-ingredients-text 4.161 (before: blue 4.069, Notebook 4.074). Nothing changed.
- **`prose-text` is now unused.** No JSX element carries the class any more. Its three rules (app.css `.prose-text`, `.batch-row__conclusion .prose-text`, notebook.css `.notebook-log .prose-text`) and the cross-cutting.test.js tests that pin it are left as they were; retiring them is a follow-up for Mark to decide.
- DESIGN.md (line 609 records weights 600 and 700 as built, and the two old hexes) and its sidecar are out of date until Sid updates them.

## Known Stubs

None.

## Threat Flags

None. The saved note still reaches the DOM as a React text child of one paragraph; no `dangerouslySetInnerHTML` was added.

## Not verified

- Mark's own iPad (WebKit on a touch screen, Caveat on the device) and iPhone.
- Mark's desktop Safari and Chrome.
- The probe is evidence about Playwright's WebKit and system Chrome at 1600, 1366 and 393 with a fine pointer, not about a device.

## Deferred Human Verification

On the build served by `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server:

1. Open a batch with a saved tasting note (open its Tasting fold) and see the note in the hand, like Why and Next time. Open the pen with Correct and see the note field still in the text face.
2. Look at the Home and Notebook filled actions side by side for weight and colour, and at the Home and Notebook words in the rail and tab row.

No Mark's List rows were filed or closed; the orchestrator closes decide-companion-contrast-under-4-5, decide-tasting-note-in-the-hand (with todo arrebtzlmiqhd8mq9haq) and decide-filled-action-weight.

## Self-Check: PASSED

- 9aa8963, 4a49877 and 6f89f62 are in `git log 4e20f11..HEAD`, in task order, each listing only its own paths.
- `git diff 4e20f11..HEAD --name-only -- app/` lists exactly the eight planned app paths.
- The probe, this SUMMARY, and the eight modified files exist.
