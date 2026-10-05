---
phase: quick-261004-wib
plan: 01
subsystem: shell
tags: [import-error-panel, z-order, more-hairline, sketch-011, decisions-52-53-55]
requires: []
provides:
  - the Import error panel (decision 52 B), fixed under Import, over the page
  - the page notice under the scrim (decision 53 B), --app-z-notice 3
  - Search below the More hairline (decision 55, Mark's answer)
affects: [app/src/ui/Shell.jsx, app/src/styles/shell.css, app/src/styles/tokens.css]
key-files:
  created:
    - .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-probe.mjs
  modified:
    - app/src/ui/Shell.jsx
    - app/src/styles/shell.css
    - app/src/styles/tokens.css
    - app/src/ui/Shell.test.jsx
    - app/src/ui/Shell.flyout.test.jsx
    - app/src/styles/shell.test.js
    - app/src/styles/cross-cutting.test.js
decisions:
  - "Decision 52 B: a failed import shows a panel over the page, not a list in the bar. Closes on Close, Escape (fly-out closed), a good import or a page change."
  - "Decision 53 B: --app-z-notice 10 to 3. The stack is stated once in tokens.css and pinned in shell.test.js."
  - "Decision 55: the separator moves before Search. Only the rule moves; the panel keeps its size."
metrics:
  duration: one session
  completed: 2026-10-04
status: complete
commits: 4
plan_head_before: 2cbb41679b8b464641c46d6645c063ab5a055a04
plan_head_after: a7fc97215b3d76503652ee4ab29b13593bc68a04
actuals:
  tokens: 22000
  tasks: 3
  commits: 4
---

# Phase quick-261004-wib Plan 01: the Import error panel, the notice under the scrim, Search below the hairline

A failed import now shows a fixed panel under Import (above the tab row on a phone) and the bar stays 57px. The page notice sits under the scrim. More lists Search below the hairline. All three are measured in WebKit and Chrome on the existing build, and the boards match.

## What changed

Four commits, each test before its code. No push.

| Commit | Message | Files |
| ------ | ------- | ----- |
| 7ba298d | test(261004-wib): pin the Import error panel and the notice under the scrim | Shell.flyout.test.jsx, shell.test.js, cross-cutting.test.js |
| 7ca9342 | feat(261004-wib): the Import error panel under Import, and the notice under the scrim | Shell.jsx, shell.css, tokens.css |
| 8f4c8f8 | test(261004-wib): pin Search below the More hairline | Shell.test.jsx |
| a7fc972 | feat(261004-wib): Search below the More hairline | Shell.jsx |

Tests added:
- Shell.flyout.test.jsx (jsdom, 11 tests): the panel's place (the header's next sibling, never inside the bar), its title, count and lines verbatim, the Close, focus return, Escape alone and with the fly-out open, a page change, a good import, repeated lines and markup text (`<b>tag</b>` stays text, no duplicate-key warning).
- shell.test.js (5 tests): the panel's exact declarations, the phone rule, the head, title, count and list rules, no `flex-basis`, no Close-only selector, the three tokens.
- Shell.test.jsx: 1 test amended and 1 added for the order Ingredients, Kitchen, separator, Search, Import, Export.

Tests amended: the phone-block allowlist admits `.shell__import-errors`; the tools-row phone test now says the panel's phone rule places it above the tab row and hides nothing; the radius list gains `.shell__import-errors`; the notice token test expects 3; the z-order test is retitled for decision 53 and asserts the new chain. cross-cutting.test.js got one comment line (the "(10)" would have gone stale). No other test needed a change. The full suite passes: 62 files, 1739 tests.

Files touched under `app/`: exactly the seven above. `git status --porcelain app/` is empty. app.css, the header's hover shrink, the Sheet, the Batch fold, the tab ring and the tiles' sizes are unchanged. No CSS changed for decision 55.

## The stacking order, exactly

Old: page 1, 2 < scrim 4 < fly-out 5 < notice 10 < bar 11
New: page 1, 2 < notice 3 < scrim 4 < fly-out 5 < Import error panel 6 < bar 11

tokens.css states it in one comment above the five z tokens. shell.test.js pins the chain and the values 3 and 6.

## Choices this plan made that no board draws

- Singular count: "1 problem found" for one line. The board draws only plural counts.
- Focus after Close: only when focus was inside the panel, it goes to the header's Import button from 724, or to More's summary below 724. If focus was elsewhere (for example on body), Close leaves it alone.
- Focus after Escape: Escape goes through the same close, so focus returns the same way when it was inside the panel. A keyboard user who pressed Escape with focus elsewhere sees focus unmoved. The README does not say where focus goes. This is the plan's choice, following closeMore and closePlaces.
- Escape closes only the panel. With the fly-out open, the first Escape closes the fly-out, the second closes the panel, the third reaches the page. The panel's listener exists only while errors show and the fly-out is closed, because two capture listeners on `document` both run despite `stopPropagation`.
- Tokens for the panel's width (`--app-size-import-errors-w`, 480px) and the two leadings (`--app-import-errors-title-leading` 1.3, `--app-import-errors-leading` 1.5), because the token rule allows no literal.
- Keys on the panel's lines are the index, so repeated validator lines are safe.

## Where the README and the build disagree

None on the three decisions' own numbers. Every board reading equals the build within 0.1 in both engines (G-A7, G-C7).

Coordinator's correction, confirmed: the More panel does not grow by a tile. The list is five tiles before and after, and only the rule moved. Measured panel sizes, the same before and after the move:
- WebKit: 101.5 x 284 on the Notebook page, 105.2 x 284 on /ingredients.
- Chrome: 97.6 x 279 on the Notebook page, 102.4 x 280 on /ingredients.
- Tiles 75.5 x 49 (79.2 on /ingredients) in WebKit and 71.6 x 48 (76.4) in Chrome. The rule is 6px under Kitchen and 6px over Search.

Findings, none drawn and none fixed:
- **Panel covering More's items at 393 (R-A8).** With the Import error panel showing and More open, the panel covers Search, Import and Export. The tab row has no z-index, so the panel (z 6) paints over More's open list. WebKit: More's list spans x 291.5 to 393, y 513 to 797; the panel (3 lines) spans x 20 to 373, y 642 to 790. The centres of Search (304,624), Import (304,686) and Export (304,735) all hit the panel. Chrome gives the same result (list x 295.4 to 393, y 518 to 797; Search, Import, Export hit the panel). A decide row for Mark could ask whether this matters.
- **Close under a mouse hover.** The Close is a `button.shell__place`, so it carries the header's open hover-shrink (todo fix-header-import-export-hover-shrink). Fine pointer at 1366, the 3-line file: WebKit rest 76.4 x 41, hover 48.4 x 29; Chrome rest 75.8 x 40, hover 47.8 x 28. Border is 0 at rest and under hover in both. Not fixed here, as the plan says.
- **44px Close only with a touch pointer.** app.css gives every `button` a `--touch-min` floor under `(pointer: coarse)`. Coarse: the Close is 44 tall and the 3-line panel is 130 (WebKit and Chrome). Fine pointer: the Close is 41 (WebKit) or 40 (Chrome) and the panel is 127 or 126. Sid's numbers are the coarse ones.
- Chrome's bar at 393 reads 63, not 62. See Probe failures.

## The readings and every gate's result

Method: 2 engines (WebKit, system Chrome), 4 widths for Part A (1366, 1024, 724, 393), 3 files, plus a fine-pointer page, plus the boards. Probe: `261004-wib-probe.mjs`, final run: 3 failed of the checks, all one gate in one engine (below). Everything else passed.

Part A, the panel (coarse, both engines unless noted):
- Calibration G-A0 passed: line counts 1, 3 and 49; base bar heights equal Sid's within 1px (WebKit older 64, 79, 169, 128 at 1366, 1024, 724, 393; WebKit wrong-shaped 754, 1024, 1384, 1133; Chrome wrong-shaped 705 at 1366 and 1321 at 724).
- G-A1: bar and first heading equal the no-errors base with 1, 3 and 49 lines at every width. Bar 57 from 724. At 393: WebKit 62 (passed); Chrome 63 (failed the "62" literal, see below).
- G-A2, from 724: width 480, top is the bar's bottom plus 6 (63), right is the window less 48, z-index 6, role alert. Heights: 94 (1 line), 130 (3 lines), 184 (49 lines) in both engines; WebKit matches Sid's 130 and 184.
- G-A3: the list is 108 tall (6 x 18) with 49 lines, overflow-y auto, scrollHeight above it (WebKit 918, Chrome 882 at 724 and up). The 3-line list does not scroll at 1366. The li texts equal the base texts. Title and count are as specified.
- G-A4: Close border 0, 44 tall, tabindex 0, type button (coarse). Fine pointer in the Close paragraph above.
- G-A5, at 393: left 20, right is the window less 20, width 353, bottom is the tab row's top less 6. Heights 94, 148 and 184 in both engines (WebKit matches Sid's 148 and 184). After `scrollTo(0, 400)` the page scrolled and the rect did not move.
- G-A6: at 724, the point 14px inside the fly-out's right edge at the panel's mid-height hits the panel. At 1366 with the fly-out open the panel's centre hits the panel, not the scrim. With the fly-out open its z is 5 and the panel's 6, below the bar's 11.
- G-A7: the board's `.imp-panel`, list and Close boxes equal the build in all five B windows, both engines, within 0.1. The 393 older window equals the scrolled reading.

Part B, the notice (Version saved. raised by Sid's flow, read about 0.8 s after the save, well inside 5 s):
- G-B0, base: notice z 10; its centre hits the notice. Both widths, both engines.
- G-B1, fix: z notice 3, scrim 4, fly-out 5. The notice's centre hits the Home link inside `nav#places`, and Home is the active element. Both widths, both engines.
- G-B2, fix, long notice: the point 10px right of the fly-out hits `.shell__scrim`. In base it hits the notice.
- G-B3, fix: with the fly-out closed, the notice's centre hits the notice and its text is still there.

Part C, Search below the hairline (393 and 723, Notebook and /ingredients, both engines):
- G-C-pre: before the move the separator's previous sibling holds Search; after it holds Kitchen and its next holds Search.
- G-C1: panel size equals the base reading and Sid's numbers (above). Right gap equals base: WebKit 0.031, Chrome 0 (the pre-existing 0.031px WebKit gap vpr recorded; this move does not touch it). Tab row top minus panel bottom equals base.
- G-C2, G-C3: tiles and rule as above; 6px and 6px.
- G-C4: with Search focused, ring top minus hr bottom is 2, and the ring is 8 inside both panel edges. With Import focused, the ring reaches 4 into Search's tile (Sid: 4).
- G-C5 (fine pointer): Search and Import have border 0 at rest and under hover, and the box does not move.
- G-C6: a tap on the rule closes More. Import opens the file chooser, Export downloads, Kitchen and Ingredients go there, Search goes to /search, and More closes each time.
- G-C7: the board `more-tiles-hairline.html` equals the build (panel, five tiles, hr and both 6px gaps) in all six windows per engine, within 0.1.

Crops are saved to the temp folder as `wib-*.png` (70 files). Two examples: `wib-webkit-1366-older.png` (the panel at 1366), `wib-webkit-393-more-over-panel.png` (the finding).

## Probe failures

Three failures, one gate, one engine.

- `G-A1 chrome@393 notjson`, `chrome@393 older`, `chrome@393 many`: "the bar is 62 at 393 (read 63)". The plan states 62, which is Sid's WebKit number. Chrome's bar is 63 at 393 in the no-errors base too (heading top 79, not 78). The panel did not change the bar: it equals the no-errors base in both engines (the other half of G-A1 passed). This is an engine difference at 393 (the cause was not investigated), not something the panel introduced. The gate is left as written and fails.

One probe bug, fixed and not a loosening: the first G-A6 check read the fly-out's computed z-index with the fly-out closed, where it is `auto`, and failed in every page. The fly-out's z-index applies only while it is open (`.shell__rail--open`). The check now reads it with the fly-out open, in the stack step, and still requires fly-out below panel below bar.

## The method

The existing build, `app/dist` (modified 2026-10-04 23:13, read only), served on ephemeral 127.0.0.1 ports by the 03.5 harness. The dist predates this quick, so each page got the fix state in the page: for the panel, a CSSOM delete of the old `.shell__import-errors` rule, the old list hidden, the panel markup built with `createElement` and `textContent`, and the edited tokens and rules from tokens.css and shell.css added with `addStyleTag`; for the notice, the edited tokens only; for More, one DOM move of the separator. The probe also asserts the dist still carries the old rule (with `flex-basis`), `--app-z-notice` 10 and `button.shell__place`, and that Shell.jsx still carries the five class names. No build, no Vite process, :4173 untouched. A DOM edit is not a build.

Commits were made on `main`, as the orchestrator directed (a main-tree run, not a worktree). The pre-commit protected-branch assertion would have refused this under the default config. Each commit used explicit paths with `git commit -- <paths>`, so the staged todo renames were never included.

## The consequence

Mark's running preview does not show any of this until `npm --prefix app run build` runs.

## Still open, not touched

- The header's hover shrink (fix-header-import-export-hover-shrink). The panel's Close inherits it.
- The notice scrolling away with the page (decision 53's side finding).
- The validator's lines in plain words (decision 52 question 3, unanswered). They show exactly as the validator words them.
- More open over the panel at the phone (the finding above), not drawn.

## Not verified

The iPhone, the iPad, VoiceOver's reading of the alert (`role="alert"` is on the panel), and the sticky hover after a tap on iOS. Two engines on a Mac are evidence, not Mark's devices.

## Deviations from Plan

- **[Rule 1 - probe bug]** The G-A6 z-index comparison, described under Probe failures. The probe is not committed, so no code commit.
- **Describe retitle.** Shell.test.jsx's describe for More's hairline was retitled to say "between the places and Search, Import, Export", so the title matches the new order. No test pinned the old title.
- Otherwise the plan ran as written. The tracer gate re-ran the suite end to end after the panel commit and it passed.

## Deferred Human Verification

Suggested device checks. The orchestrator files each as a Mark's List row with the `closes` link named. Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`.

For todo `build-import-panel-and-notice`:
- iPad at 1366: import a wrong file (for example an older export). The panel shows under Import, the bar does not grow, six lines then a scroll, and Close closes it.
- iPad: Escape and a page change also close the panel.
- iPhone, with the page scrolled down: the panel shows above the tab row.
- iPad: save a version, then open the menu within 5 seconds. Home is clear and the notice is dimmed. Close the menu and the notice is bright.
- Decide row, if Mark wants it: More open over the Import error panel at the phone covers Search, Import and Export. Options: leave it, or ask Sid to draw the layering.

For todo `build-more-search-below-hairline`:
- iPhone: More reads Ingredients, Kitchen, the hairline, then Search, Import, Export.
- iPhone: tap Search, and tap the hairline. Search goes to /search and More closes; the hairline closes More.

## Self-Check: PASSED

- Seven app files modified, all present; `git status --porcelain app/` empty.
- Commits 7ba298d, 7ca9342, 8f4c8f8, a7fc972 exist; test commits precede their feat commits.
- `commits: 4` measured with `git rev-list --count 2cbb416..HEAD`.
- Full suite: 62 files, 1739 tests passed.
- Nothing staged by this task outside the seven paths; the three staged todo renames, `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/` and STATE.md were not touched.
