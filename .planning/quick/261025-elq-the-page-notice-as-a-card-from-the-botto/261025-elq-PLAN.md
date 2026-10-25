---
phase: quick-261025-elq
plan: 01
quick_id: 261025-elq
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/tokens.css
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs
  - DESIGN.md
  - .planning/sketches/013-creation-editor/README.md
autonomous: true
requirements:
  - decide-page-notice-shape
  - look-page-notice-card-page-styling
  - bug-save-notice-covers-title-393

estimate:
  tokens: 80000
  raw_tokens: 80000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "In Playwright WebKit (hasTouch, deviceScaleFactor 1) at 1366x1024 and 393x852, after Save batch on /notebook/mexican-chocolate/mexican-chocolate-v1 and on /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1, the notice reads 'recorded D Mon YYYY' in a card whose box, font, line height, padding, background, text colour, border, radius and shadow equal noticeshape-measure.json's BS_1366 and BS_393 records: 1366 [581.1, 954, 203.7 x 50], 393 [94.6, 726, 203.7 x 50]; 16px on 24px; 12px 20px; rgb(255, 255, 255) on rgb(20, 20, 20); 1px rgb(214, 218, 215); 10px; rgba(20, 20, 20, 0.18) 0px 4px 16px 0px."
    - "After an Import refusal (the record pen open on Mexican Chocolate v1 at both widths, 'Close the open pen before importing.'; the creation editor at 1366, 'Cancel the new recipe draft before importing.') the card stands in the same place as after the save: the same y and height, centred on the window, the same skin. One place for every trigger."
    - "The card overlaps neither the bar, nor the tab row, nor the recipe name, nor the focused element, at the scroll the trigger leaves and with the page scrolled to the top; at 393 the recipe name is clear (the bug as filed). On Olive Oil v1 it covers exactly the elements the board recorded for BS (tag and class, landing and at the top)."
    - "An empty or cleared notice is a 0 x 0 box with no border and box-shadow none; the anchor is a fixed, zero-height box at the window's foot (planning: [0, 1024, 1366, 0] and [0, 852, 393, 0])."
    - "Every new value in app.css reads a token; tokens.css gains exactly one token, --app-shadow-notice: 0 4px 16px rgba(20, 20, 20, 0.18), beside --app-shadow-flyout with the proposal's comment; --app-z-notice and the print rule are unchanged; no JSX, router.jsx or shell.css change."
    - "npm --prefix app test passes with the base count unchanged (3734 at 80cfaeac; no test added or removed, five cross-cutting.test.js tests rewritten, one loosened by a filter); the strict walk prints MATCH 94 snapshots with 10-walk-before.json untouched, or with only notice-landing leaves updated under Task 2's rule."
    - "DESIGN.md's page notice entry and Elevation & Depth describe the card (App skin, --app-shadow-notice, the second shadowed floater); sketch 013 README decision 23 ends with a supersession sentence; both files keep their line counts (688 and 96)."
  artifacts:
    - path: app/src/styles/tokens.css
      provides: "--app-shadow-notice on the line after --app-shadow-flyout, with the proposal's comment; the --gap-page comment no longer calls the notice an end inset under the bar"
      contains: "--app-shadow-notice: 0 4px 16px rgba(20, 20, 20, 0.18);"
    - path: app/src/styles/app.css
      provides: "The notice's three rules rewritten per the proposal's revised items 2 to 4 (the anchor fixed at the foot, the card centred in the App skin, the phone-forms rule above the tab row), :empty without a shadow, comments citing the proposal section; the print rule unchanged"
      contains: "box-shadow: var(--app-shadow-notice);"
    - path: app/src/styles/cross-cutting.test.js
      provides: "The page notice describe block, the phone-forms rule list and the 13px helper test pinned to the new rules"
      contains: "quick 261025-elq"
    - path: .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs
      provides: "WebKit probe on a scratch build, ephemeral 127.0.0.1 port; compares against noticeshape-measure.json BS; prints PASS, FAIL and INFO lines and ends 'N PASS, M FAIL'"
    - path: DESIGN.md
      provides: "The page notice bullet rewritten; Elevation & Depth's App paragraph and the Sheet-Is-Flat Rule's parenthetical name the notice as the second shadowed floater"
      contains: "--app-shadow-notice"
    - path: .planning/sketches/013-creation-editor/README.md
      provides: "Decision 23 marked superseded on its own line"
      contains: "decide-page-notice-shape"
  key_links:
    - from: ".page-status-anchor (position: fixed; inset-block: auto 0; inset-inline: 0)"
      to: ".page-status (position: absolute; inset-block-end: var(--gap-m); inset-inline: 0; margin: 0 auto; width: max-content)"
      via: "the anchor is the card's containing block; it holds only while .shell, .shell__body and .shell__main declare no transform, filter, perspective, will-change, contain or overflow (shell.test.js pins that, unchanged)"
      pattern: "position:\\s*fixed"
    - from: "the phone-forms .page-status rule"
      to: "--app-size-tab-h (56px, the fixed tab row below 724)"
      via: "inset-block-end: calc(var(--app-size-tab-h) + var(--gap-m)) puts the card 20 above the tab row"
      pattern: "calc\\(var\\(--app-size-tab-h\\) \\+ var\\(--gap-m\\)\\)"
    - from: ".page-status box-shadow"
      to: "tokens.css --app-shadow-notice"
      via: "var() read; .page-status:empty sets box-shadow: none so an empty notice draws nothing"
      pattern: "box-shadow:\\s*var\\(--app-shadow-notice\\)"
---

<objective>
Build Mark's approved page notice: the card rising from the bottom edge, centred, 16px, in the App context's skin with a shadow (BS). Mark chose B on decide-page-notice-shape (2026-10-24: "not styled like the Sheet") and wrote "Approve BS" on look-page-notice-card-page-styling (2026-10-25). The change set is `.impeccable/proposals/2026-10-23-page-notice-shape.md`, section "Mark's answer (2026-10-24): B, styled as the Page", items 1 to 7, which replace § 3's B items 1 to 4. Build them exactly. This quick closes bug-save-notice-covers-title-393: at 393 the notice sticks to the window's top and covers the recipe name, and at 1366 it covers the Version fold control.

Purpose: one place for every trigger, at a size a coarse pointer reads, never over the bar, the recipe name or the focused heading. The card stands off both grounds by its shadow; the App ground alone measures 1.07:1 against the Sheet and 1.00:1 against the App ground.

Output: one token in tokens.css; the notice's rules in app.css; cross-cutting.test.js pinned to them; a committed WebKit probe that compares the built card with the board's BS measurement; DESIGN.md's two entries; sketch 013 decision 23 marked superseded.

Scope, stated so nothing is added: app.css, one token line (plus a comment-only correction to the --gap-page comment, see choice 2), the tests, the probe, DESIGN.md's page notice entry and Elevation & Depth, and the sketch README. No JSX, no router.jsx, no shell.css, no Notebook or creation board, no Mark's List row (the executor has no ArtifactData; the orchestrator writes and closes rows).

Interpretation choices, made at planning:
(1) Item 7's "nothing covered that was not covered on the board" becomes two probe gates. First, the card never overlaps the bar, the tab row, the recipe name or the focused element, for every trigger and both scrolls. Second, on Olive Oil v1, the board's own recipe, the covered elements equal the board's BS record. On Mexican Chocolate, the task's recipe, the covered elements are INFO only, since the board drew no Mexican Chocolate state.
(2) Item 5 has the comments name the new place. tokens.css's --gap-page comment (lines 52-69) says the notice is an inset that anchors under the bar, which this change makes false. Its notice clause is corrected, comment only. No value or other token moves.
(3) No test is added. Five existing assertions in cross-cutting.test.js are rewritten and one is loosened by a filter, the same shape as quick 261021-07s. The new token's value is pinned inside the rewritten skin test. The suite count therefore stays at the base count.
(4) The creation editor's refusal is probed at 1366 only, because no recipe is created on a phone (Mark, 2026-10-18). It exercises PageNotice.jsx's anchor, while the recipe route exercises router.jsx's.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.impeccable/proposals/2026-10-23-page-notice-shape.md

<interfaces>
The rules as they stand at 80cfaeac (origin/main), app/src/styles/app.css:
- Lines 325-334: the comment above `.page-status` (history 260917-ewf, 03.5-02 Task 3, decide-creation-notice-place, quick 261021-07s, sketch 013 decision 23; describes the old anchor under the bar and the end-gutter inset). Lines 335-349: `.page-status` declares position absolute; z-index var(--app-z-notice); inset-block-start 0; inset-inline-end var(--gap-page); max-width min(var(--measure-prose), calc(100vw - var(--gap-page) - var(--gap-m))); margin 0; margin-block-start var(--gap-xs); padding var(--gap-xs) var(--gap-s); border var(--rule-baseline) solid var(--sheet-ink); background var(--sheet-ground); color var(--sheet-ink); font-family var(--face-grotesk); font-size var(--sheet-type-control). Lines 351-354: `.page-status:empty` sets padding 0 and border 0.
- Lines 377-386: the comment above `.page-status-anchor` (says it is made sticky and stuck under the bar). Lines 387-391: `.page-status-anchor` declares position sticky; inset-block-start var(--app-size-header-h); z-index var(--app-z-notice).
- Lines 2568-2571: the phone-forms block's header comment ends with two sentences saying the notice's anchor rule closes the block and sticks to the window's top below 724. Line 2572 opens `@media (max-width: 723.98px) {`. Lines 2604-2608: its last rule, a two-line comment and `.page-status-anchor { inset-block-start: 0; }`. Line 2609 closes the block.
- Lines 2858-2871: the print layer comment and `@media print { .page-status { display: none; } ...`. These stay as they are.
- shell.css lines 304-309 and router.jsx lines 80-88 describe the anchor as a containing block found by position. That stays true for a fixed box, so neither file changes.

tokens.css: line 411 is `--app-shadow-flyout: 4px 0 16px rgba(20, 20, 20, 0.18); /* the panel's edge shadow (decision 33, GO) */`. Lines 52-69 hold the --gap-page comment. Its clause "and the right inset of the notice that anchors under the bar (.page-status), which reads the same gutter from the right" sits at lines 56-58. Every token the card reads already exists: --app-background #ffffff (323), --app-text #141414 (325), --app-divider #d6dad7 (327), --app-radius-control 10px (378), --app-rule-row = --rule-graduation 1px (383), --app-size-tab-h 56px (395), --app-z-notice 3 (402), --gap-s 12px (48), --gap-m 20px (49), --gap-page (70; 48, and 20 below 724 through app.css's :root), --sheet-type-note 1rem (41), --sheet-leading-note 1.5 (42), --measure-prose 65ch (85).

Tests that read these rules (app/src/styles/cross-cutting.test.js, 91 tests passing at base; ruleFor(selector) returns the TOP-LEVEL rule, `rules` holds every rule with `.media`, `tokens` is readCustomProperties of tokens.css, `appCssSource` is the RAW app.css text):
- Line 287: 'the phone-forms block keeps its five rules ...' expects the selectors of `r.media === '(max-width: 723.98px)' && !r.selector.startsWith('.axis-mark')` to equal [':root', '.field-row__label', '.batch-margin__field', '.save-ceremony, .pen-foot__controls', '.page-status-anchor']. Its comment (lines 288-290) says the anchor joined the block.
- Line 655: HELPER_STATUS_SELECTORS = ['.page-status', '.form-status', '.save-ceremony__hint', '.pen-helper']. Line 657, 'the four helper and status sentences read the control role (13px)', asserts --sheet-type-control on each. The next test, grotesk with no transform, iterates the same list and stays as it is, because .page-status keeps font-family var(--face-grotesk).
- Lines 864-917: describe 'the page notice anchors above the keyed page, out of flow ...' with five tests: the end-gutter test (865), the anchor test (875), the four-boxes test (889), the skin test (896), and the no-transition test (914). The no-transition test reads the RAW source, so the word "transition" must not appear anywhere in app.css, comments included.
- Lines 919+: the print block's nine rules. Unchanged.
- binder.test.js line 347 scans the RAW app.css for a colon followed by a hex colour, comments included. Lines 350-354 forbid a bare px value in any declaration. So: no "#" and no colour value in any app.css comment.
- shell.test.js lines 279-292 (no containing block on .shell, .shell__body, .shell__main) and 508-514 / 576-584 (the z order; .page-status reads var(--app-z-notice)) are all still true. Leave them alone.
- tokens.test.js line 202: every border-radius in app.css reads an allowed radius, and var(--app-radius-control) is allowed. The unread-token test (lines 95-135) is satisfied because app.css reads the new token.
- app/src/ui/*.test.jsx (CreationFlow, NotebookPlace, Shell.creationGuard, Shell.importGuard, PageNotice, RecipePage) assert DOM structure and text only. No CSS. Unchanged.

The probe's sources (copy, never import, because they run on import):
- .planning/quick/261021-07s-move-the-page-notice-on-the-notebook-and/261021-07s-notice-probe.mjs. Lines 1-48 hold the header, PLAYWRIGHT_CORE load and FAIL guard, startServers import from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs', and the pass/fail counters. Lines 50-96 hold until, readyFor, press, type, notice, pathOf and pressImport: the bar's Import from 724, and More's summary then More's Import below 724. Lines 166-173 are the creation editor's opening: /notebook, '.nb__count', '.nb__head .notebook-action', '.nb__new input', Start, '/notebook/new', '.notebook.mk-page'.
- .planning/quick/261022-d3i-log-column-prose-fields-type-in-the-grotesk-the-batch-pen-s/261022-d3i-face-probe.mjs lines 29-32: the PROBE_DIST guard that refuses to run without a scratch build. Lines 46-58: clickUntil.
- .planning/canvas-generators/noticeshape-measure.mjs lines 17-33: the measure function the board used: notice box, font, lh, pad, colours with border as borderTopWidth + ' ' + borderTopColor, and covers over '.shell__main *' with its leaf filter. Lines 38-45: the save flow: Record, 'Churn date' fill, '.pen-foot .save-ceremony button' "Save batch", scrollIntoViewIfNeeded, click, then wait for the URL change and 'h2.region-name:has-text("Batch")', then 400 ms and fonts.ready. Its contexts are { viewport, hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 }, and the probe uses the same so the boxes compare.
- .planning/canvas-generators/noticeshape-measure.json keys BS_1366 and BS_393: notice {x,y,w,h}, font, lh, pad, colours {background, color, border, radius, shadow}, covers [{tag, cls, text, ov}], scrollY, toViewportBottom, toTabs, atTop {notice, covers, name}.

Planning measurements: WebKit, scratch build of 80cfaeac, the proposal's BS rules injected as a style tag on load (noticeshape-options.json "BS"). Boxes are [x, y, w, h].
- Empty, on load, both widths: notice 0 x 0 at [683, 1004] and [196.5, 776]. Anchor fixed [0, 1024, 1366, 0] and [0, 852, 393, 0]. (The injected rules lacked the :empty shadow reset, so the computed shadow was set. The real change sets none.)
- Save, Mexican Chocolate v1. 1366: "recorded 25 Oct 2026", [581.1, 954, 203.7, 50], scrollY 0. It covers ingredient-table numeric cells and the Sweetness POD and Fat .graduated-rule figures. 393: [94.6, 726, 203.7, 50], scrollY 1142. It covers only the log's own DD "25 Oct 2026". At the top it covers the Sucrose and Dextrose name cells. The recipe name, bar, tab row and focused Batch heading are clear at both widths.
- Save, Olive Oil v1. Both widths give the JSON's BS box, skin, scrollY (0 / 2886) and covers exactly (tag, class and text, landing and at the top).
- Refusal, Mexican Chocolate v1, record pen open, page at top. 1366: "Close the open pen before importing.", [527.1, 954, 311.8, 50]. It covers table cells and the Fat figure. 393 (More, then Import): [40.6, 726, 311.8, 50]. It covers the Cocoa Powder and Sucrose rows, including one as-made INPUT.ink-field at 43.4 x 26.7, which goes in the SUMMARY's For Mark list. Name, bar and tab row are clear.
- Skin in every shown state: 16px / 24px, padding 12px 20px, background rgb(255, 255, 255), color rgb(20, 20, 20), border 1px solid rgb(214, 218, 215), radius 10px, shadow rgba(20, 20, 20, 0.18) 0px 4px 16px 0px.
- Not measured at planning: the creation editor's refusal. It uses the same rules, and its anchor is .shell__main's first child (Shell.creationGuard.test.jsx:419-437).
- At base, with nothing injected, the notice sits under the bar: Olive Oil v1 1366 [1157, 63, 161, 30] in the Sheet skin, and at 393 at the top [212, 68, 161, 30], over the recipe name by 161 x 20.

Baselines measured at planning: full suite 3734 tests in 120 files; cross-cutting.test.js 91; DESIGN.md 688 lines; sketch 013 README 96 lines. These counts are 0 at base: "app-shadow-notice" in tokens.css, app.css and DESIGN.md; "decide-page-notice-shape" in the README and DESIGN.md; "built flat apart from the fly-out and the page notice" in DESIGN.md. The phrase the Task 1 and Task 2 negative gates read counts 1 in app.css (line 330) and 1 in DESIGN.md (line 655) at base.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The notice is a card at the bottom edge in the App's skin with a shadow, pinned by cross-cutting.test.js and measured in WebKit against the board's BS record (probe and tests red first)</name>
  <files>app/src/styles/cross-cutting.test.js, app/src/styles/tokens.css, app/src/styles/app.css, .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs</files>
  <precondition>.planning/canvas-generators/noticeshape-measure.json holds the keys BS_1366 and BS_393 (committed on origin/main at 80cfaeac).</precondition>
  <read_first>
    - .impeccable/proposals/2026-10-23-page-notice-shape.md lines 80-103 (the revised change set and Mark's approval)
    - app/src/styles/app.css lines 320-392, 2555-2612 and 2855-2872
    - app/src/styles/tokens.css lines 50-70 and 395-412
    - app/src/styles/cross-cutting.test.js lines 40-62, 280-300, 645-690 and 860-920
    - .planning/quick/261021-07s-move-the-page-notice-on-the-notebook-and/261021-07s-notice-probe.mjs lines 1-100 and 160-175
    - .planning/canvas-generators/noticeshape-measure.mjs (whole file, 49 lines)
  </read_first>
  <behavior>
    - Phone-forms list test (line 287): the last selector is '.page-status', not '.page-status-anchor'. FAILS at base.
    - Placement test (was 865): .page-status declares position absolute (and no position fixed), inset-block-start auto, inset-block-end var(--gap-m), inset-inline 0, width max-content and margin 0 auto, and has no inset-inline-end and no inset-inline-start. FAILS at base.
    - Anchor test (was 875): .page-status-anchor declares position fixed, inset-block auto 0, inset-inline 0 and z-index var(--app-z-notice); it does not match position sticky or inset-block-start. No phone-forms .page-status-anchor rule exists. The phone-forms .page-status rule's only declaration is inset-block-end: calc(var(--app-size-tab-h) + var(--gap-m)). FAILS at base.
    - Four-boxes test (was 889): .page-status's max-width is min(var(--measure-prose), calc(100vw - 2 * var(--gap-page))). The .not-found, .recipe-page and .list-page assertions stay as they are. FAILS at base.
    - Skin test (was 896). .page-status declares: z-index var(--app-z-notice); the max-width above; margin 0 auto; box-sizing border-box; padding var(--gap-s) var(--gap-m); border var(--app-rule-row) solid var(--app-divider); border-radius var(--app-radius-control); background var(--app-background); color var(--app-text); box-shadow var(--app-shadow-notice); font-family var(--face-grotesk); font-size var(--sheet-type-note); line-height var(--sheet-leading-note). It reads none of --sheet-ink, --sheet-ground, --sheet-type-control, and has no margin-block-start. tokens['--app-shadow-notice'] is exactly '0 4px 16px rgba(20, 20, 20, 0.18)'. .page-status:empty declares padding 0, border 0 and box-shadow none. FAILS at base.
    - 13px helper test (line 657): it iterates HELPER_STATUS_SELECTORS without '.page-status'. Passes at base and after. The grotesk test and the no-transition test are unchanged.
    - The probe ends with M above 0 at base, and '0 FAIL' after the change.
    - cross-cutting.test.js still holds 91 tests.
  </behavior>
  <action>
    Step 0 (worktree setup, all paths from the checkout root). Record `BASE=$(git rev-parse HEAD)`. If app/node_modules is missing, create an untracked symlink to the main checkout's copy: `MAIN=$(git worktree list --porcelain | sed -n '1s/^worktree //p')`, then `ln -s "$MAIN/app/node_modules" app/node_modules`. Never commit it. Create .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/ if the worktree lacks it. Run `npm --prefix app test` once and record the base test count (3734 at 80cfaeac; a sibling quick that landed first changes it). Never touch the 4173 preview or any running Vite process. Never build into app/dist. Stage every commit by explicit path, never `git add -A` or `git add .`, and read `git diff --cached --name-only` before each commit.

    Step 1 (RED, the probe). Write .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs as an ES module, copying the scaffolding named in the interfaces.
    - Header comment: what it proves (decide-page-notice-shape BS; the card's box and skin against noticeshape-measure.json), how to run it (this task's verify command), and that it never contacts 4173 or 8077.
    - Guards: the PLAYWRIGHT_CORE guard, and the PROBE_DIST guard from the d3i probe; a scratch build is required.
    - Serving: the build is served through 08-walk-server.mjs's startServers({ appRoot }) on an ephemeral 127.0.0.1 port. Each context aborts every request whose host is not 127.0.0.1.
    - Expected values: read with fs from path.join(HERE, '..', '..', 'canvas-generators', 'noticeshape-measure.json'), keys BS_1366 and BS_393. The probe writes no design value of its own.
    - Configurations: 1366x1024 and 393x852, each a fresh context per scenario, { hasTouch: true, isMobile: W < 724, deviceScaleFactor: 1 }.
    - measure: copy noticeshape-measure.mjs's measure, keeping the colours and covers shapes. Add: the anchor's computed position and box; the overlap of the card with .shell__head (only while its bottom is above 0), with .shell__tabs (only while displayed), with .notebook-recipe__name (when present) and with document.activeElement (when it is not body); and window.innerWidth.
    - Shown-state gates, for every scenario below:
      - the text equals the scenario's words;
      - font, lh and pad equal the expected record's;
      - colours.background, color, border, radius and shadow equal the expected record's;
      - notice.y and notice.h are within 0.5 of the expected record's;
      - |x + w/2 - innerWidth/2| is at most 0.5;
      - the anchor's computed position is 'fixed' and its height is 0;
      - the four overlaps are null.
      After scrolling to (0, 0) and waiting 200 ms, measure again and gate the y, the centre and the four overlaps again.
    - Scenarios:
      - E, both widths, on Mexican Chocolate v1 on load. The notice is empty, 0 x 0, border-top-width '0px', box-shadow 'none'. The anchor is fixed, height 0, and its bottom equals innerHeight.
      - S-mc and S-oo, both widths: Save batch on /notebook/mexican-chocolate/mexican-chocolate-v1 and on /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1. Use clickUntil on '.batch-row__record' (first) until '.batch-margin--pen'; then the board's save flow. The words match /^recorded \d{1,2} [A-Z][a-z]{2} \d{4}$/.
        - When the words are 20 characters long (the board's length), x and w are also within 1.5 of the expected record's.
        - For S-oo only: scrollY equals the expected record's scrollY, and the covers' tag-and-class sequence, landing and at the top, equals the record's covers and atTop.covers, compared by tag and class only, because the DD date text moves with the day.
        - Then wait until the notice is empty (at most 6.5 s after the save) and gate the E shape again: 0 x 0, no border, box-shadow none.
      - R-mc, both widths: on Mexican Chocolate v1, open the record pen as above, scroll to the top, and press Import through pressImport (the bar from 724, More below), waiting for "Close the open pen before importing.".
      - R-new, 1366 only: the creation editor's opening from the 07s probe with the name 'Probe notice', then press Import at the page top, waiting for "Cancel the new recipe draft before importing.". The expected record is BS_1366's y, h, skin and centre.
    - INFO lines: every box, the scrollY, the focused element's text, and every covered element (tag.class "text" overlap) per scenario and scroll.
    - Output: PASS or FAIL lines naming width, scenario and gate; the last line is 'N PASS, M FAIL'. Close every context, the browser and the servers. Exit 1 on any FAIL.
    Build the base to scratch and run it with the verify command's two build-and-run halves. Confirm it ends with M above 0, and record M in the SUMMARY.

    Step 2 (RED, the tests). In app/src/styles/cross-cutting.test.js, rewrite the tests named in the behavior block in place, keeping each test's position.
    - Each rewritten title cites decide-page-notice-shape BS and quick 261025-elq.
    - The describe title gains "; a card from the bottom edge in the App's skin (decide-page-notice-shape BS, quick 261025-elq)".
    - The phone-forms test's inner comment says the notice's own rule now closes the block, lifting the card above the tab row.
    - The 13px test: iterate `HELPER_STATUS_SELECTORS.filter((selector) => selector !== '.page-status')`, and retitle it "the three helper and status sentences read the control role (13px); the page notice reads the note role, pinned below (decide-page-notice-shape, quick 261025-elq)". Leave the array itself alone.
    - Use the file's own regex style, for example /inset-block:\s*auto 0/ and /box-shadow:\s*none/. Add no import and no test.
    Run `npm --prefix app test -- src/styles/cross-cutting.test.js`. Exactly five tests fail: the phone-forms list, placement, anchor, four-boxes and skin tests.

    Step 3 (GREEN), per decide-page-notice-shape B and look-page-notice-card-page-styling BS, the proposal's revised items 1 to 5:
    - tokens.css. On the line after --app-shadow-flyout, add `--app-shadow-notice: 0 4px 16px rgba(20, 20, 20, 0.18); /* the page notice's shadow: the fly-out's blur and alpha cast downward (decide-page-notice-shape, Mark 2026-10-24) */` (item 1, the proposal's comment verbatim). In the --gap-page comment, replace only the notice clause (lines 56-58) so it says the page notice (.page-status) keeps the same gutter on both sides of the window through its max-width (decide-page-notice-shape, quick 261025-elq). "Four boxes, one gutter" stands. No value changes.
    - app.css `.page-status-anchor` (item 2): position: fixed; inset-block: auto 0; inset-inline: 0; z-index: var(--app-z-notice). No inset-block-start.
    - app.css `.page-status` (item 3), in this order: position: absolute; z-index: var(--app-z-notice); inset-block-start: auto; inset-block-end: var(--gap-m); inset-inline: 0; width: max-content; max-width: min(var(--measure-prose), calc(100vw - 2 * var(--gap-page))); box-sizing: border-box; margin: 0 auto; padding: var(--gap-s) var(--gap-m); border: var(--app-rule-row) solid var(--app-divider); border-radius: var(--app-radius-control); background: var(--app-background); color: var(--app-text); box-shadow: var(--app-shadow-notice); font-family: var(--face-grotesk); font-size: var(--sheet-type-note); line-height: var(--sheet-leading-note). The declarations the proposal replaces go: the end inset, margin-block-start, the old padding, the Sheet ink border, the Sheet ground and ink colours, and the control font size. `.page-status:empty` keeps padding: 0 and border: 0 and gains box-shadow: none.
    - The phone-forms block (item 4): its last rule, the anchor override and its two-line comment, becomes `.page-status { inset-block-end: calc(var(--app-size-tab-h) + var(--gap-m)); }` with a one-line comment saying that below 724 the card rises above the fixed tab row. It still closes the block.
    - Comments (item 5). Rewrite the comment above `.page-status`, the comment above `.page-status-anchor`, and the last two sentences of the phone-forms block's header comment (lines 2569-2571). Each names the new place and skin and cites `.impeccable/proposals/2026-10-23-page-notice-shape.md`, "Mark's answer (2026-10-24): B, styled as the Page", decide-page-notice-shape BS (Mark 2026-10-24/25), quick 261025-elq, and says sketch 013 decision 23's place under the bar is superseded. Keep each comment's history list and add the new step to it. Say:
      - "nothing moves" still holds;
      - the anchor is a zero-height fixed box at the window's foot, so the card stays on screen at every scroll and in one place for every trigger;
      - the card is centred by inset-inline 0, margin auto and max-content, with the gutter kept on both sides;
      - the skin is the App's (ground, text, the row hairline in the divider colour, the control radius, --app-shadow-notice), because the Sheet's ground lost the card against the Sheet;
      - 16px is the Field Rule's coarse-pointer size;
      - the anchor still carries the notice's layer, and the stacking order of sketch 011 decision 53 is unchanged.
      Write no "#", no colour value and the word "transition" nowhere in app.css. The print block's comment and rule stay byte-identical.
    Touch nothing else under app/src. Run `npm --prefix app test -- src/styles/` and confirm cross-cutting.test.js passes all 91 tests and every other styles suite is green.

    Step 4 (the slice, end to end). Rebuild to scratch and run the probe with the verify command. Planning measured the values in the interfaces; if a gate fails, report the measured value rather than loosen the gate. Commit tokens.css, app.css, cross-cutting.test.js and the probe, by explicit path, as `fix(261025-elq): the page notice is a card from the bottom edge in the App's skin with a shadow (decide-page-notice-shape BS; closes bug-save-notice-covers-title-393)`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/cross-cutting.test.js && test "$(grep -c -- '--app-shadow-notice: 0 4px 16px rgba(20, 20, 20, 0.18);' app/src/styles/tokens.css)" = 1 && test "$(grep -c 'zero-height sticky box' app/src/styles/app.css)" = 0 && npm --prefix app run build -- --outDir "${TMPDIR:-/tmp}/sprinkles-elq/dist" --emptyOutDir && PROBE_DIST="${TMPDIR:-/tmp}/sprinkles-elq/dist" node .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs</automated>
  </verify>
  <done>
    - cross-cutting.test.js passes 91 of 91. The five rewritten tests were seen failing at base, and every styles suite is green.
    - The token grep prints 1 (baseline 0) and the phrase grep on app.css prints 0 (baseline 1).
    - The probe ended with M above 0 at base and ends '0 FAIL' now. The S, R and E scenarios pass at both widths (R-new at 1366), and on Olive Oil v1 the covers equal the board's BS record.
    - `git diff --quiet "$BASE" -- app/src/ui app/src/router.jsx app/src/main.jsx app/src/styles/shell.css` exits 0.
    - One fix(261025-elq) commit holds exactly the four files.
  </done>
</task>

<task type="auto">
  <name>Task 2: DESIGN.md's page notice entry and Elevation & Depth, sketch 013 decision 23 superseded, then the full suite and the strict walk</name>
  <files>DESIGN.md, .planning/sketches/013-creation-editor/README.md</files>
  <read_first>
    - DESIGN.md lines 521-531 (## Elevation & Depth, through the Sheet-Is-Flat Rule) and lines 650-656 (the shell components list)
    - .planning/sketches/013-creation-editor/README.md lines 31-34 and 60-63
  </read_first>
  <action>
    Item 6 of the proposal's revised change set. Use scoped Edit replacements only, never a whole-file Write. Keep both files' line counts: every change replaces text within an existing line.
    - DESIGN.md line 655, the bullet that opens "- **The page notice** (`.page-status`): a one-line status in the Sheet". Replace the whole line with one bullet saying:
      - the page notice is a one-line card that rises from the bottom edge of the window, centred, announced politely, hidden in print, in one place for every trigger (a saved batch or version, a kept or discarded draft, an Import refusal, a store that cannot open);
      - App context: the App's ground and text (`--app-background`, `--app-text`), the row hairline in the divider colour, the control radius (10px) and `--app-shadow-notice` (`0 4px 16px rgba(20, 20, 20, 0.18)`, the fly-out's blur and alpha cast downward);
      - 16px (`--sheet-type-note`, the Field Rule's coarse-pointer size), padding 12 / 20;
      - 20px above the window's foot, and below 724 20px above the tab row, anchored to a zero-height fixed box at the foot, so it stays on screen at every scroll;
      - it never covers the bar, the recipe name or the focused heading; at 1366 it sits over the Sheet's last Balance figures and at 393 over the log's own Recorded line for its five seconds;
      - cite `decide-page-notice-shape` B (Mark 2026-10-24, "Approve BS" on `look-page-notice-card-page-styling` 2026-10-25), `.impeccable/proposals/2026-10-23-page-notice-shape.md`, built in quick 261025-elq, superseding sketch 013 decision 23;
      - "Out of flow, so nothing moves.";
      - the Notebook and creation boards that still draw it under the bar are redrawn when next touched.
    - DESIGN.md line 523 (Elevation & Depth, App interface). Replace only the sentence that begins "Two things float, and only they carry a shadow or a veil:". It becomes a sentence in which the page notice joins the fly-out as the second floater that casts a shadow: the fly-out panel (its shadow and token as written now) over a scrim (as written now), and the page notice's card at the window's foot (`0 4px 16px rgba(20, 20, 20, 0.18)`, `--app-shadow-notice`; decide-page-notice-shape BS, Mark 2026-10-24/25). Adjust the count word to match. Leave the rest of the line as it is.
    - DESIGN.md line 530 (the Sheet-Is-Flat Rule, within the same ## section). Change only the parenthetical's ending, "which is built flat apart from the fly-out)", to "which is built flat apart from the fly-out and the page notice)".
    - .planning/sketches/013-creation-editor/README.md line 62 (decision 23). Append one sentence to the same line, in the style of decision 7's supersession: "Superseded on 2026-10-25 by `decide-page-notice-shape` (Mark: B, the card from the bottom edge, centred, 16px, in the App's skin with a shadow, BS; `.impeccable/proposals/2026-10-23-page-notice-shape.md`; built in quick 261025-elq): the notice no longer sits under the bar on any route."
    Edit no other line. The orchestrator scoped DESIGN.md to these two entries, so leave line 472 (the page gutter paragraph still says "the save notice's left edge") and line 540 (the App radius list does not name the notice), and list both in the SUMMARY as follow-ups for /impeccable document.

    Then, from the worktree root:
    1. Run `npm --prefix app test`. The count must equal Step 0's base count (no test added or removed).
    2. Run `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh`. The walk runs at 1366 and records page text, fields, focus, statuses and stores, not geometry. The card sits centred at the foot, clear of the log column the walk clicks in, so it should print MATCH 94 snapshots with 10-walk-before.json unchanged.
    3. If it prints DIFF lines, a leaf may be updated only where the notice lands: a `pageStatus` leaf, or a leaf of the step taken right after a click that the card was covering. Update 10-walk-before.json by a scoped edit at exactly the scenario, step and path each DIFF names, never by re-recording the file. Re-run until MATCH, and name every updated leaf and its reason in the SUMMARY. A DIFF under `stores.`, `url`, `fields`, `invalid` or `pens`, or at a step where no notice was showing, is a regression: stop, leave the baseline alone, and report the DIFF lines.
    Commit DESIGN.md and the README by explicit path, plus 10-walk-before.json only if step 3 updated it, as `docs(261025-elq): DESIGN.md's page notice and Elevation & Depth name the card from the bottom edge; sketch 013 decision 23 superseded (decide-page-notice-shape BS)`.
  </action>
  <verify>
    <automated>test "$(grep -c 'zero-height sticky box' DESIGN.md)" = 0 && test "$(grep -c -- '--app-shadow-notice' DESIGN.md)" -ge 2 && test "$(grep -c 'built flat apart from the fly-out and the page notice' DESIGN.md)" = 1 && test "$(grep -c '^23\. .*Superseded on 2026-10-25 by `decide-page-notice-shape`' .planning/sketches/013-creation-editor/README.md)" = 1 && test "$(wc -l < DESIGN.md | tr -d ' ')" = 688 && test "$(wc -l < .planning/sketches/013-creation-editor/README.md | tr -d ' ')" = 96 && npm --prefix app test && sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh</automated>
  </verify>
  <done>
    - The four greps hold: the old phrase 0 in DESIGN.md (baseline 1); the token at least 2 (baseline 0); the Sheet-Is-Flat parenthetical 1 (baseline 0); decision 23's supersession 1 (baseline 0). DESIGN.md is still 688 lines and the README still 96.
    - The full suite passes with the base count (3734 at 80cfaeac).
    - The walk prints MATCH 94 snapshots. Either `git diff --quiet "$BASE" -- .planning/phases/10-the-creation-editor-without-save/10-walk-before.json` exits 0, or every changed leaf is a notice-landing leaf named in the SUMMARY.
    - One docs(261025-elq) commit holds DESIGN.md and the README, plus the baseline only under step 3.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe to network | The probe drives WebKit against a local scratch build; any request to a host other than 127.0.0.1 is aborted |
| notice text to page | The notice renders words as React text children (unchanged); no markup path is added |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-elq-01 | Information disclosure | 261025-elq-notice-probe.mjs | low | mitigate | Every context aborts non-127.0.0.1 requests, as 10-walk.mjs and the 07s probe do. The build is served by 08-walk-server.mjs on an ephemeral loopback port, never on 4173 and never with --host |
| T-elq-02 | Tampering | app/src/styles/app.css, tokens.css | low | accept | CSS reading existing tokens plus one new shadow token: no input, no markup, no dependency. binder.test.js keeps hex and px literals out |
| T-elq-03 | Denial of service | the card over page content for 5 s | low | accept | It is not interactive, and a tap on it does nothing until it clears. The proposal § 2 states this cost and Mark approved BS. The 393 refusal case over an as-made field is reported for Mark |
| T-elq-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed: playwright-core is the npx cache copy the Phase 10 walk already uses |
</threat_model>

<verification>
From the worktree root, after both tasks:
- `npm --prefix app test` passes with the base count.
- The probe, Task 1's verify, ends '0 FAIL'.
- `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh` prints MATCH 94 snapshots.
- `git diff --quiet "$BASE" -- app/src/ui app/src/router.jsx app/src/main.jsx app/src/styles/shell.css app/src/styles/print.css` exits 0.
- `git diff "$BASE" -- app/src/styles/tokens.css | grep -c '^+ *--app-'` prints 1: one token added.
- `git diff --name-only "$BASE"..HEAD` lists exactly the six files in files_modified, plus 10-walk-before.json only under Task 2's step 3.
</verification>

<success_criteria>
- In WebKit at 1366 and 393, after Save batch on Mexican Chocolate v1 and Olive Oil v1 and after an Import refusal, the notice is the BS card. Its box, colours and shadow equal noticeshape-measure.json, and it overlaps neither the bar, nor the tab row, nor the recipe name, nor the focused element. At 393 the recipe name is clear.
- app.css reads tokens only, and tokens.css has one new token with the proposal's comment.
- The full suite is green at the base count, and the strict walk prints MATCH 94.
- DESIGN.md's two entries and sketch 013 decision 23 record the change.
- Two commits: fix(261025-elq) and docs(261025-elq).
</success_criteria>

<output>
Create `.planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-SUMMARY.md` when done. Include:
- the probe's base FAIL count and its final line, with every measured box per width and scenario (landing and at the top), and the covered elements per scenario;
- the test counts (cross-cutting 91; full suite at the base count), and the walk's MATCH line with whether 10-walk-before.json changed (each changed leaf and its reason, if any);
- under "For the orchestrator" (the executor writes no Mark's List row):
  - close bug-save-notice-covers-title-393 and look-page-notice-card-page-styling, and decide-page-notice-shape if it is still open;
  - the device check for Mark, iPad at 1366 coarse and iPhone at 393, using the steps the probe walked (Save batch on Mexican Chocolate v1; Import with the record pen open, through More on the iPhone). The two things to look at are the card 20px above the tab row on the iPhone and the fixed card while the iOS keyboard is up;
- under "For Mark":
  - at 393, the Import refusal with the record pen open puts the card over part of an as-made field for its five seconds (measured overlap);
  - the 5 s hold is unchanged, as the change set keeps it, and the proposal's question of 6 s got no answer;
- follow-ups for /impeccable document: DESIGN.md line 472 (the page gutter paragraph's "save notice's left edge") and line 540 (the App radius list does not name the notice); and for Sid, the Notebook and creation boards that still draw the notice under the bar;
- under Deferred Human Verification: verified in WebKit on the Mac only, not on Mark's iPad or iPhone.
</output>
