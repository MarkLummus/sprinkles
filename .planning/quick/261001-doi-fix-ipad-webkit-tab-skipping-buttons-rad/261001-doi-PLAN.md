---
phase: quick-261001-doi
plan: 01
quick_id: 261001-doi
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/Segmented.jsx
  - app/src/ui/Segmented.test.jsx
  - app/src/ui/PenFoot.jsx
  - app/src/ui/PenFoot.test.jsx
  - app/src/ui/AxisMark.jsx
  - app/src/ui/AxisMark.test.jsx
  - app/src/ui/Authored.jsx
  - app/src/ui/Authored.test.jsx
  - app/src/ui/GraduatedRule.jsx
  - app/src/ui/GraduatedRule.test.jsx
  - app/src/ui/FormulationNote.test.jsx
  - app/src/ui/FoldRow.jsx
  - app/src/ui/FoldRow.test.jsx
  - app/src/ui/DerivedAdvisories.test.jsx
  - app/src/ui/RecipeBand.jsx
  - app/src/ui/RecipeBand.test.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs
  - .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs
autonomous: true
requirements: [UX1-01]

estimate:
  tokens: 110000
  raw_tokens: 110000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "In WebKit (Playwright's own WebKit, 1366 wide, touch), Tab from Churn duration reaches, in this order: the Exit consistency radio group, the Airiness radio group, At the machine, Ingredient notes, Next time, Add tasting, Cancel, Save batch. Chromium reaches the same eight. The probe pins both engines (D-04)."
    - "Every <button>, radio input and checkbox input rendered under app/src/ui carries an explicit tabIndex: the 39 button sites (the 4 in Shell.jsx already do, 35 are added), the radio inputs in Segmented.jsx and AxisMark.jsx, the checkbox inputs in Method.jsx (2) and VersionRow.jsx (1). Select, textarea, text inputs and summary are untouched; every label, aria attribute, handler and disabled prop is unchanged (D-01)."
    - "GraduatedRule keeps tabindex -1 while the sheet is recording or developing (its recorded design: the page order skips the six rules there) and now reads tabindex 0 in every other state, so a keyboard user on the iPad can reach the six rules when reading (D-01)."
    - "Each touched component's own test pins the exact number of tags carrying tabindex=0 on rendered markup, in the way the link rule is pinned; a site the node harness cannot render is pinned on comment-stripped source text. Segmented.test.jsx's radio test states what holds (one shared name, an explicit tabindex) and makes no claim about Tab stops (D-02)."
    - "Arrow keys still change the radio selection in WebKit and Chromium, for a Segmented group and for an AxisMark group. Tab stops per radio group, picked and unpicked, are measured in both engines and reported as numbers (D-04)."
    - "When the tasting is entered, the first Every recipe cue of the axes grid sits the board's distance below the note field: sketch 007 measured in a browser at 393 coarse, 1366 coarse and 1366 fine, and the app within the pinned tolerance of it. The change is one rule on .note-block in app.css, tokens only, no literal, and nothing else in the spacing moves (D-05)."
    - "No CLAUDE.md is edited. The SUMMARY says the link convention now has a sibling rule for buttons, radios and checkboxes and leaves recording it to Mark (D-03). The SUMMARY says plainly that the iPad result is device-unverified and gives Mark's checklist (D-07)."
  artifacts:
    - path: app/src/ui/Segmented.jsx
      provides: "explicit tabIndex on the Clear button and on every radio input"
      contains: "tabIndex={0}"
    - path: app/src/ui/PenFoot.jsx
      provides: "explicit tabIndex on Restore tasting, Add tasting, Cancel and Save batch"
      contains: "tabIndex={0}"
    - path: app/src/ui/GraduatedRule.jsx
      provides: "tabIndex that keeps the caller's -1 and otherwise reads 0"
      contains: "tabIndex ?? 0"
    - path: app/src/ui/Segmented.test.jsx
      provides: "radio tags counted with tabindex 0, shared name pinned, claim reworded"
      contains: "explicit tabindex"
    - path: .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs
      provides: "the WebKit and Chromium Tab-order, Tab-stop-count and arrow-key probe"
      contains: "webkit"
    - path: app/src/styles/app.css
      provides: "the .note-block rule: the board's space below the note, from tokens"
      contains: ".note-block"
    - path: app/src/styles/cross-cutting.test.js
      provides: "the .note-block rule pinned by token"
      contains: ".note-block"
    - path: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs
      provides: "the notegap group: app against sketch 007 at 393 coarse, 1366 coarse, 1366 fine"
      contains: "notegap"
  key_links:
    - from: .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs
      to: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
      via: "imports startServers, launch, check, finish and APP_ROUTE; the harness serves the checkout's app/dist on ephemeral 127.0.0.1 ports"
      pattern: "03.5-probe-harness.mjs"
    - from: app/src/ui/Segmented.jsx
      to: app/src/ui/Segmented.test.jsx
      via: "radio and Clear tags counted on rendered markup, each carrying tabindex=0"
      pattern: "tabindex=\"0\""
    - from: app/src/styles/app.css
      to: app/src/styles/cross-cutting.test.js
      via: "ruleFor('.note-block') pins margin-bottom and padding-bottom to the spacing tokens"
      pattern: "note-block"
    - from: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs
      to: .planning/sketches/007-full-battery/index.html
      via: "the notegap group opens the board through openBoard and measures the note field to the Every recipe cue"
      pattern: "007-full-battery"
---

<objective>
Fix two defects Mark found on the iPad in the batch record pen, both reproduced in Playwright WebKit 26.6 by the orchestrator.

**Defect 1, Tab skips controls (UX1-01).** In WebKit, with keyboard focus on Churn duration, Tab goes to At the machine, Ingredient notes, Next time and then out to Safari's chrome. It skips the Exit consistency and Airiness radio groups and the Add tasting, Cancel and Save batch buttons. Chromium reaches all of them. Cause: WebKit without Safari's tab-to-highlight preference only Tabs into text entry and into controls that carry an explicit tabindex, the same rule the project already records for every link (G-03.4-r3-3, G-03.4-r4-1). Shell.jsx already sets tabIndex={0} on its buttons. Of the 39 button sites under app/src/ui only those 4 do, and no radio or checkbox input does.

**Defect 2, the note sits too close to the axes (D-05).** Entering a tasting, the first Every recipe cue of the axes grid sits 3px below the How did it turn out? textarea and 0px below the note block's box, because no CSS rule gives .note-block any space. Sketch 007 draws that space.

## Decisions

Every decision below comes from the orchestrator's brief (2026-10-01).

- **D-01** Add tabIndex={0} to every <button>, radio input and checkbox input rendered under app/src/ui. Not select, textarea, text inputs, or the summary in Shell.jsx (already tagged). Keep native radio-group keyboard behaviour (arrow keys) and keep every existing label, aria attribute and handler.
- **D-02** Pin it the way the link rule is pinned: each touched component's own test asserts the exact count of tabindex=0 on rendered markup for its buttons, radios and checkboxes. Reword Segmented.test.jsx's single-tab-stop title and assertion so it states what now holds (shared name, explicit tabindex), not a claim WebKit may not honour.
- **D-03** Do not edit .claude/CLAUDE.md or any CLAUDE.md. The SUMMARY says the link convention now has a sibling rule for buttons, radios and checkboxes, and lets Mark decide whether to record it.
- **D-04** Verify in WebKit with a Tab probe after the fix. From Churn duration the order must reach the Exit consistency radio, the Airiness radio, At the machine, Ingredient notes, Next time, Add tasting, Cancel, Save batch, in that order. Confirm in WebKit and Chromium that arrow keys still change the radio selection, and report how many Tab stops each radio group has in each engine. If WebKit makes each radio a stop, report it and keep it unless it breaks arrow-key selection. If the WebKit order is still wrong after the fix, STOP and report numbers; do not iterate blindly.
- **D-05** Gap: read sketch 007 (and 008) including their CSS, measure the space below the note block on the boards in a browser before editing, then give .note-block the matching bottom space through the existing tokens in app/src/styles/app.css (no literal), only if the boards agree. Pin it with a CSS test in the style tests' existing pattern and a probe reading, through the batches probe's box checks, that the cue sits the board's distance below the textarea at 393 coarse, 1366 coarse and 1366 fine. Surgical: no other spacing changes.
- **D-06** Test command `npm --prefix app test -- --run` (baseline 1421). Build `npm --prefix app run build`. Probes run against the build through the harness. Commit on main, English, with the two trailer lines, and do not push. Start no second Vite process.
- **D-07** The iPad result is device-unverified until Mark checks it. WebKit-engine readings are evidence, not the device. The SUMMARY says so plainly and carries Mark's iPad checklist.

## Planner's readings (taken 2026-10-01, before any edit)

- **The scan.** A source scan of app/src/ui (comments stripped, brace-aware tag extraction) finds exactly 39 opening tags that need a tabIndex and lack one: 34 buttons, 2 radio inputs, 3 checkbox inputs. GraduatedRule's button is the 35th button site; it passes the scan only because it already forwards a tabIndex prop that is undefined unless the sheet is recording or developing. Task 2 ends with the same scan reading none.
- **GraduatedRule.** FormulationNote.jsx passes tabIndex -1 while recording or developing (D-03/D-04 of the sheet's own recording design: those two modes keep the six rules off the tab path, still clickable) and nothing otherwise. Left as it is, the six rules stay unreachable by keyboard in WebKit when reading, which is the defect this plan fixes. So GraduatedRule reads `tabIndex ?? 0`: the caller's -1 survives, the default becomes 0. FormulationNote.test.jsx's reading-state test says there is no tabindex attribute at all; it must change with the markup.
- **Method's uses checkboxes.** The uses fieldset renders only after `usesOpen` flips, and renderToStaticMarkup runs no event handlers, so the checkbox at Method.jsx:317 cannot be rendered by the node harness. The Skipped checkbox (line 481) can. The unreachable site is pinned on comment-stripped source text, the way RecipePage.test.jsx pins the not-found link.
- **The board's space below the note, measured in a browser** (Chromium through the harness's openBoard, sketch 007 with `setTastingMode('visible')`, variant A, 3 columns): at 1366 coarse, 1366 fine and 393 coarse the readings are identical. Note-block bottom to the Every recipe cue is exactly 20px (line 96's margin-bottom, var(--gap-m)). But the textarea's bottom edge is 17.3px above the note-block's bottom edge, because the board's note field is a label and the board's base rule (line 34, `label { display: block; margin: 0 0 var(--gap-s) }`) gives that label 12px below it, plus 5.3px of inline-block baseline strut. Textarea bottom to cue top on the board is therefore 37.3px, not 20.
- **The app's note block has no label.** BatchRow.jsx:847 renders `.note-block` as a paragraph eyebrow plus the textarea, so the board's 12px label margin did not travel with the markup. The app reads 3px from textarea to cue today (the app's own strut). Giving .note-block only the 20px of line 96 lands at 23px, 14.3px short of the board. Matching what the board draws takes both the label's 12px (inside the block, as padding) and line 96's 20px (outside, as margin): about 35px, leaving 2.3px that is the two engines' differing strut under an inline-block textarea (the board's label line box is 15px type at 20.25px leading; the app's is its own) and is not touched here, since no other spacing may move. This reading differs from the brief's one-token description; Task 3 re-measures before any edit and stops if its numbers disagree with these.
- **.note-block has no rule anywhere in app/src/styles** (checked by grep, tests included) and is used once, at BatchRow.jsx:847. The first Every recipe cue is found by its id, `axes-core-cue`, on both the below-760 and wide arrangements of AxesGrid (lines 234 and 253).
- **Sketch 008 draws no .note-block** (grep over every sketch finds the class only in 007), so it cannot disagree with 007; Task 3 states that in the SUMMARY after reading both.
- **The harness serves app/dist.** The preview on :4173 serves the same directory, so the last build of this plan is how both fixes reach Mark's iPad. The harness's openApp asserts `(pointer: coarse)` and is written against Chromium; WebKit is driven with a context created directly, as the orchestrator's repro does.

## Coverage audit

- GOAL: Tab reaches every control on the iPad's batch record pen, and the tasting note keeps the board's space above the axes. Tasks 1 and 2 (Tab), Task 3 (gap), Task 3's SUMMARY (device-unverified statement).
- REQ: UX1-01 (recipe editing and batch recording operable by keyboard), Tasks 1 and 2. The gap carries no requirement id; it is the brief's D-05.
- RESEARCH: none for a quick task.
- CONTEXT: D-01 Tasks 1 and 2; D-02 Tasks 1 and 2; D-03 Task 3's SUMMARY and the diff scope in Verification; D-04 Tasks 1 and 2; D-05 Task 3; D-06 every task's commit step and the environment block; D-07 Task 3's SUMMARY.

Purpose: a maker on the iPad can keyboard through the whole record pen, and a tasting note no longer touches the axes it leads into.

Output: tabIndex on every button, radio and checkbox, their per-component pins, a WebKit and Chromium Tab probe, the .note-block rule with its CSS pin and board-comparison probe group, a rebuilt app/dist for Mark's iPad check, and a SUMMARY that is honest about what is and is not verified.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./.claude/CLAUDE.md
@.planning/STATE.md
@app/src/ui/Shell.jsx
@app/src/ui/Segmented.jsx
@app/src/ui/PenFoot.jsx
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs

<environment>
- Node is already on PATH. Tests: `npm --prefix app test -- --run`, baseline 1421 passing. Build: `npm --prefix app run build` (a one-shot `vite build`, not a server).
- The harness (03.5-probe-harness.mjs) serves the checkout's own app/dist and the repo tree on ephemeral 127.0.0.1 ports and closes them itself. Reuse it unchanged. Never start `vite`, `vite dev` or `vite preview`. A dev server (pid 11248) and a preview server (pid 68288, port 4173) are already running and are not yours: do not stop, restart or probe them. The preview serves app/dist from disk, so a rebuild here is how the fix reaches Mark's iPad.
- WebKit is Playwright's own (`webkit.launch()` with no executablePath, the same module the harness imports chromium from). If it will not launch, STOP and report; install nothing.
- Probe commands, from the checkout root: `node .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs` (no arguments) and `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs <groups> <widths>`.
- Run this in the main checkout and commit on main, one commit per task, tests and source together once green (the RED run is observed and recorded in the SUMMARY, not committed, so no commit on main is red). Stage only the files each task names, by path: the untracked `.impeccable/critique/` files in the working tree are not part of this work. Every commit message is English and ends with these two lines: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01WeaQszVGJ9FPrW4pPwpmYE`. Do not push.
- If this turns out to be a worktree rather than the main checkout, say so in the SUMMARY's first lines: after merging, the orchestrator must run `npm --prefix app run build` in the main checkout, because the preview serves the main checkout's app/dist.
- Do not read whole test files over a few hundred lines (BatchRow.test.jsx, Method.test.jsx, VersionRow.test.jsx, IngredientTable.test.jsx). Grep for the render helper and the existing assertions on the control you are pinning, then read only that range.
</environment>

<interfaces>
Every site, as of planning (line numbers drift as you edit; trust the scan, not the numbers). Rule for every edit: insert `tabIndex={0}` immediately before the element's first on* handler prop (or before `ref`, or at the end of the props when it has no handler), after every prop that renders an attribute, so the rendered tag always ends with `tabindex="0"` and each exact-markup test changes by appending that one attribute.

Buttons (35 to tag): Segmented.jsx 41 (Clear). PenFoot.jsx 39 (Restore tasting), 42 (Add tasting), 44 (Cancel), 47 (Save batch). AxisMark.jsx 76 (Clear). Authored.jsx 34 (remove). GraduatedRule.jsx 85 (already `tabIndex={tabIndex}`; becomes `tabIndex={tabIndex ?? 0}`). FoldRow.jsx 28. RecipeBand.jsx 104 (Cancel), 107 (Save), 119 (Rename). IngredientTable.jsx 163 (RemoveRowControl), 270 (remove this row). Method.jsx 276, 288, 301, 343, 368, 371, 436, 445, 503. VersionRow.jsx 218, 221, 225, 339, 353. BatchRow.jsx 650 (Correct), 665 (Record another), 808 (Restore tasting), 810 (Remove tasting), 910 (the four defect chips, one site inside a map), 933 (Bitter), 1134 (Record a batch). Shell.jsx 231, 235, 318, 324 already carry tabIndex={0}: leave them.

Radio inputs (2 sites): Segmented.jsx 54 (three per group), AxisMark.jsx 94 (five per axis).
Checkbox inputs (3 sites): Method.jsx 317 (the uses list, not renderable by the node harness), Method.jsx 481 (Skipped), VersionRow.jsx 178 (the single citable batch).
Not touched: the one <select> (VersionRow.jsx 189, rendered only with two or more citable batches), every textarea, text, number and date input, the hidden file input in Shell.jsx (tabIndex -1 on purpose), the <summary> in Shell.jsx.

The pin pattern, for every touched test (the link rule's pin in Shell.test.jsx 186-212 is the model): render the component, collect opening tags from the rendered markup with a regular expression on `<button\b[^>]*>` and on `<input\b[^>]*>` filtered to type radio or type checkbox (rendered attribute values escape the angle bracket, so the simple expression is safe on markup), assert the exact tag count for that state, and assert every collected tag contains `tabindex="0"`. Derive each expected count from the component's source (list the controls that state renders and add them up) and write it as a literal, so a mismatch fails and the observed number is not simply copied. Where a state cannot be rendered by renderToStaticMarkup, pin that site on the source text with comments stripped, using a brace-aware tag expression (an arrow function inside a handler contains a closing angle bracket, so a plain `[^>]*` would stop early; the expression `(?:[^>{]|\{[^}]*\})*` skips one level of braces).

The harness exports (03.5-probe-harness.mjs): `startServers()` returns `{ appUrl, repoUrl, close }`; `launch()` returns Chromium on the installed Chrome; `openApp(browser, appUrl, route, { width, height, coarse })` opens the app and asserts the pointer mode; `openBoard(browser, repoUrl, file, { width, height, coarse })` opens a board (an explicit width skips its $preview lookup, so `'../007-full-battery/index.html'` works with `{ width, coarse }`); `check(failures, condition, label)` and `finish(failures, count, name)`; `APP_ROUTE`. The batches probe's own helpers: `assertSeed(page)`, `countedCheck(condition, label)`, and the keypad group's structure (a `for (const width of widths)` loop with a coarse context per width, then a separate 1366 fine context).
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer: Tab from Churn duration to Save batch in WebKit, through a radio group and the save ceremony (D-01, D-02, D-04, D-06)</name>
  <files>.planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs, app/src/ui/Segmented.test.jsx, app/src/ui/Segmented.jsx, app/src/ui/PenFoot.test.jsx, app/src/ui/PenFoot.jsx</files>
  <read_first>.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (the exports and the first import line, which names the playwright-core module), .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs (lines 1-67 for the house style and assertSeed, lines 610-640 for how a group opens Record another and Add tasting), app/src/ui/Segmented.jsx, app/src/ui/Segmented.test.jsx, app/src/ui/PenFoot.jsx, app/src/ui/PenFoot.test.jsx, app/src/ui/Shell.jsx (lines 229-236, a button that already carries tabIndex), app/src/ui/Shell.test.jsx (lines 186-212, the link rule's pin on rendered markup)</read_first>
  <precondition>Playwright's WebKit starts through the harness's playwright-core module (`webkit.launch()` returns a browser); if it does not, STOP and report, install nothing.</precondition>
  <behavior>
    - Segmented, nothing picked, onClear given: the markup holds 0 button tags and 3 radio tags, each radio carrying tabindex="0", all three sharing one name.
    - Segmented, one option picked: 1 button tag (the Clear, exact markup now ending tabindex="0") and the same 3 radios, each carrying tabindex="0".
    - PenFoot, openPen record, tastingOpen false: exactly 3 button tags in this order, Add tasting, Cancel, Save batch, each carrying tabindex="0". tastingOpen true: exactly 2 (Cancel, Save batch). openPen null or plan: renders nothing, as today.
    - SaveCeremony with onRestore and no onAddTasting: exactly 3 buttons (Restore tasting, Cancel, Save batch), each tabindex="0". SaveCeremony locked (saveAction set, onAddTasting given): 3 buttons, each carrying both disabled="" and tabindex="0", so the tabindex does not unlock a control that is persisting (T-261001-doi-02).
    - The probe, in each of WebKit and Chromium at 1366 x 1024 touch: from Churn duration, Tab reaches Exit consistency, Airiness, At the machine, Ingredient notes, Next time, Add tasting, Cancel, Save batch in that order (radio runs collapsed by group name); arrow keys change a Segmented group's selection with the selection following focus; the per-group Tab-stop count is printed for the unpicked and the picked state.
  </behavior>
  <action>
    Work from the checkout root.

    Step 0, pin the starting point. Run `git rev-parse HEAD` before any edit and write the sha down as PRE (for the SUMMARY's working notes). The RED notes, the diff-scope checks in Verification and the final SUMMARY use it.

    Step 1, write the probe (per D-04). Create `.planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs`, plain Node ESM, with a header comment in the harness's voice: it is quick task 261001-doi's probe; it reads the Tab order, the Tab stops per radio group and the arrow-key behaviour of the batch record pen in WebKit and in Chromium against the checkout's app/dist; it takes no arguments; a WebKit reading is evidence about the engine, not the iPad. Import `webkit` from the same module specifier the harness's own first import line uses (copy it verbatim), and `startServers`, `launch`, `check`, `finish`, `APP_ROUTE` from the harness by relative path. For each engine (WebKit through `webkit.launch()` with no executablePath, Chromium through the harness's `launch()`), create the context directly: viewport 1366 x 1024, hasTouch true, isMobile true, deviceScaleFactor 2, and a route that aborts every request whose host is not 127.0.0.1 (the harness's own blocker is not exported; write the same three lines). Do not call openApp for WebKit, which asserts a pointer mode WebKit may not report.

    Reading A, the brief's order. Open APP_ROUTE, activate the first Record another button, focus the input labelled Churn duration, minutes, then press Tab until a button named Save batch is the active element or 30 presses have passed. Record each stop as its aria-label, else its name, else its trimmed text, with its tag and input type. Collapse consecutive radio stops that share a name into one entry carrying a stop count. The expected collapsed list is: a radio named from Exit consistency, a radio named from Airiness, At the machine, Ingredient notes, Next time, Add tasting, Cancel, Save batch (match the two groups by their name prefixes, segment-exit-consistency and segment-airiness; Segmented.jsx derives the name from the group label). Assert it with check in both engines, labelled with the engine and the list actually read.

    Reading B, Tab stops per radio group. From Reading A's stop counts, print for each engine the number of stops on the Exit consistency group and on the Airiness group with nothing picked. Then, in a fresh page, click the option labelled Wet, soupy, focus Churn duration again, Tab through the same span, and print the stop count again for the picked state (the Clear button appears in the group's head, before its radios; list it separately from the radio count). Assert that in Chromium the Exit consistency group reads exactly 1 radio stop unpicked and picked, and the Airiness group exactly 1 unpicked (a native radio group is one stop; Chromium must not be made worse). For WebKit assert nothing about the count: print it.

    Reading C, arrow keys. In a fresh page, focus Churn duration and Tab until the active element is a radio named from Exit consistency (at most 6 presses; if it is not reached, record a failed check and skip the rest of this reading for that engine). Press ArrowRight, ArrowRight, ArrowLeft; after each press read the checked radio's value and the focused radio's value in that group. Assert after every press that exactly one radio is checked, that it is the focused one, and that it differs from the previous reading (the first press differs from none).

    Print one JSON line per reading, each carrying the engine. Collect failures with `check`, count them, and end with `finish(failures, count, '261001-doi tab probe')`. Close contexts, browsers and the servers in finally blocks.

    Step 2, RED on the pre-fix build. Run `npm --prefix app run build`, then the probe. It MUST exit 1 with the WebKit order check failing, and the printed WebKit order must match the orchestrator's finding (after Churn duration: At the machine, Ingredient notes, Next time, then out of the page, with both radio groups and the three buttons absent). Chromium's order check must pass. Record both printed lists as RED in the SUMMARY. If WebKit already passes, or Chromium fails, or WebKit does not launch, STOP and report the numbers: the premise of this plan is not reproduced.

    Step 3, RED tests. In app/src/ui/Segmented.test.jsx, rework the radio-name test: it must state in its title what holds, one native radio per option, all sharing one name, each carrying an explicit tabindex, with no claim about Tab stops; assert the 3 radio tags each contain tabindex="0" in addition to the existing one-shared-name assertions. Add the picked-state case (1 button, 3 radios, every tag tabindex="0") and change the exact Clear-button expectation to end in tabindex="0". Above the new assertions add a short comment in the file's voice naming the cause (WebKit without the tab-to-highlight preference Tabs only into text entry and into controls with an explicit tabindex; the same rule as every link, recorded in .claude/CLAUDE.md; quick task 261001-doi) and saying the pin is on rendered markup because the attribute's whole effect is in the DOM WebKit reads. In app/src/ui/PenFoot.test.jsx add a describe block for this quick task holding the PenFoot and SaveCeremony cases from the behavior block, using the file's own renderPenFoot and renderCeremony helpers. Run `npm --prefix app test -- --run src/ui/Segmented.test.jsx src/ui/PenFoot.test.jsx`: the new and changed tests MUST fail. Record the failing names as RED.

    Step 4, GREEN (per D-01, D-02). In app/src/ui/Segmented.jsx add tabIndex={0} to the Clear button and to the radio input, by the insertion rule in the interfaces block; leave the group name, the controlled checked prop, the no-op onChange and the onClick as they are, and add one sentence to the file's header comment saying why every control here carries an explicit tabindex (same cause as above). In app/src/ui/PenFoot.jsx add tabIndex={0} to the four buttons of SaveCeremony; leave disabled, refs, handlers and labels as they are. Change nothing else in either file and add no comment to PenFoot.jsx.

    Step 5, prove it. Run the two touched test files (green), then the full suite. If the full suite shows an exact-markup assertion in another test file broken only by these two components, update that assertion by appending tabindex="0" and weaken nothing. Then `npm --prefix app run build` and the probe. It MUST exit 0: WebKit reaches the eight in order, Chromium too, arrows change the selection in both, Chromium reads 1 stop per group in both states. Print and record WebKit's stop counts. If the WebKit order is still wrong after the fix, STOP and report the printed numbers and do not iterate (D-04). If WebKit reads more than one stop per radio group, report it, keep it, and continue only because arrow-key selection still passes; if it breaks arrow-key selection, STOP and report. Commit with a `fix(261001-doi): ...` message ending with the two trailer lines, staging the five files named in this task (plus any test file Step 5 had to touch) by path.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && npm --prefix app run build && node .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs</automated>
  </verify>
  <acceptance_criteria>
    - Before the source change, the probe exits 1 on the WebKit order check and the touched tests fail (RED, recorded for the SUMMARY); afterwards the full suite passes with no test removed, so the total is 1421 plus the new tests.
    - The probe exits 0 against the fresh build: the collapsed order is the brief's eight in WebKit and in Chromium, arrow keys change the selection in both, Chromium reads one stop for the Exit consistency group unpicked and picked and for the Airiness group unpicked, and WebKit's per-group stop counts are printed.
    - `grep -c "explicit tabindex" app/src/ui/Segmented.test.jsx` prints at least 1, and `grep -c "tabIndex={0}" app/src/ui/Segmented.jsx` prints at least 2, and the same grep on app/src/ui/PenFoot.jsx prints 4.
    - `git diff --name-only PRE..HEAD -- app` lists only app/src/ui files named in this task or test files the full suite forced.
  </acceptance_criteria>
  <done>In a real render of the rebuilt app, WebKit and Chromium both Tab from Churn duration through the Exit consistency and Airiness radios, At the machine, Ingredient notes, Next time, Add tasting, Cancel and Save batch, in that order. Arrow keys still change a radio group's selection in both engines, the per-group Tab-stop counts are on record, the radios, Clear button and ceremony buttons are pinned on rendered markup, and the commit is on main.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Every remaining button, radio and checkbox carries tabIndex, and the tasting-open WebKit order matches Chromium's (D-01, D-02, D-04, D-06)</name>
  <files>app/src/ui/AxisMark.test.jsx, app/src/ui/Authored.test.jsx, app/src/ui/GraduatedRule.test.jsx, app/src/ui/FormulationNote.test.jsx, app/src/ui/FoldRow.test.jsx, app/src/ui/DerivedAdvisories.test.jsx, app/src/ui/RecipeBand.test.jsx, app/src/ui/IngredientTable.test.jsx, app/src/ui/Method.test.jsx, app/src/ui/VersionRow.test.jsx, app/src/ui/BatchRow.test.jsx, app/src/ui/AxisMark.jsx, app/src/ui/Authored.jsx, app/src/ui/GraduatedRule.jsx, app/src/ui/FoldRow.jsx, app/src/ui/RecipeBand.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/Method.jsx, app/src/ui/VersionRow.jsx, app/src/ui/BatchRow.jsx, .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs</files>
  <read_first>app/src/ui/AxisMark.jsx and AxisMark.test.jsx (the stops test at lines 20-35), app/src/ui/Authored.jsx and Authored.test.jsx (lines 25-70), app/src/ui/GraduatedRule.jsx (lines 76-92), app/src/ui/FormulationNote.test.jsx (lines 36-80, the tabindex tests), app/src/ui/FoldRow.test.jsx, app/src/ui/RecipeBand.jsx and RecipeBand.test.jsx, app/src/ui/IngredientTable.test.jsx (around lines 944 and 984, the remove-control tests), app/src/ui/Method.test.jsx (the helpers and the tests at lines 78-100, 480 and 1351, by grep), app/src/ui/VersionRow.test.jsx (lines 150-300, 480-500, 617-635), app/src/ui/BatchRow.test.jsx (the render helper, lines 170-240, 330-345, 735-785, 1510-1530, 1575-1585, by grep), app/src/ui/RecipePage.test.jsx (lines 861-882, the source-text pin), .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs (Task 1's probe)</read_first>
  <behavior>
    - AxisMark, value undefined: 5 radio tags, 0 buttons, every radio tabindex="0". value 3: 5 radios plus 1 button (the Clear), all tabindex="0".
    - Authored, developing, N notes (N from the fixture the existing remove-control test uses): exactly N button tags, each tabindex="0". Reading: 0 buttons.
    - GraduatedRule alone: with no tabIndex prop, 1 button tag with tabindex="0"; with tabIndex -1, tabindex="-1" and no tabindex="0". FormulationNote, reading: 6 tabindex="0" and no tabindex="-1"; recording and developing: 6 tabindex="-1" and no tabindex="0" (those two tests are unchanged).
    - FoldRow: 1 button tag, tabindex="0"; its exact-markup expectations end in tabindex="0".
    - RecipeBand, reading: 1 button (Rename). initiallyRenaming: 2 buttons (Cancel, Save). Every tag tabindex="0".
    - IngredientTable: every remove and restore control and every remove-this-row control in the existing fixtures carries tabindex="0", counted exactly.
    - Method: a closed step renders 2 buttons (edit this step, remove or restore); StepPenBody renders its toggle, add a purpose, add an aside, Cancel and Done (plus remove this step when a removed row is still used); the Skipped checkbox and the done differently button carry tabindex="0"; the uses-list checkbox, which the node harness cannot render, is pinned on comment-stripped source text: Method.jsx holds exactly 2 checkbox input tags and 9 button tags, each containing tabIndex={0}.
    - VersionRow, developing with exactly one citable batch: 1 checkbox plus Cancel and Save as a new version (plus Save over this version when offered), each tabindex="0", and the locked variant keeps disabled="" beside it; reading: Next version, Show changes and the FoldRow button, each tabindex="0", counted exactly.
    - BatchRow: in each of the reading, no-batch, recording-with-tasting and amend states the fixtures already render, every button and radio tag carries tabindex="0", with exact counts derived from the source (reading: Correct, Record another and the fold rows; recording with the tasting open: Remove tasting, the 4 defect chips, Bitter, the 3 Segmented groups' radios, 5 radios per axis shown, and the ceremony's buttons).
    - The probe's second scenario (tasting open), in each engine: WebKit's list of button and radio-group stops from Churn duration to the first Save batch equals Chromium's; per-group Tab stops on one AxisMark group are printed unpicked and picked; arrow keys change an AxisMark group's selection in both engines.
  </behavior>
  <action>
    Work from the checkout root. Task 1's commit is the base; the full suite is green on entry.

    Step 1, RED tests (per D-02). Add the pins in the behavior block to each component's own test file, using the pin pattern in the interfaces block, one describe block per file naming quick task 261001-doi and carrying the same cause comment Segmented.test.jsx now has (shortened to a pointer to it where a file already sits near a link-rule pin). In FormulationNote.test.jsx replace the reading-state test that asserts there is no tabindex attribute at all: retitle it to say each rule now reads tabindex 0 while reading, assert 6 tabindex="0" and no tabindex="-1", and keep its loop that checks every figure label is still drawn. In BatchRow.test.jsx retitle the test that says no element in the record pen carries a tabIndex override, so it says DOM order is tab order because every stop carries tabindex 0 and none carries a positive one; keep its three index comparisons and add the assertion that the markup has no tabindex with a positive value. In Method.test.jsx add the source-text pin for the 2 checkbox tags and 9 button tags, reading Method.jsx the way RecipePage.test.jsx reads RecipePage.jsx (readFileSync on a URL-resolved path, comments stripped) and using the brace-aware tag expression. Run the touched test files: the new and changed tests MUST fail. Record the failing names as RED.

    Step 2, GREEN (per D-01). Apply `tabIndex={0}` to every site listed in the interfaces block for AxisMark.jsx, Authored.jsx, FoldRow.jsx, RecipeBand.jsx, IngredientTable.jsx, Method.jsx, VersionRow.jsx and BatchRow.jsx, by the insertion rule. In GraduatedRule.jsx change the one existing prop to `tabIndex={tabIndex ?? 0}` and extend the comment above it by a sentence: the caller's -1 (recording, developing) still takes the six rules off the tab path, and every other state now gives them an explicit tabindex for WebKit. Change no label, aria attribute, handler, ref, disabled prop, class or DOM order; add no comments to any other source file. Do not touch Shell.jsx, any select, textarea, text input, the hidden file input or the summary.

    Step 3, exact-markup tests. Update every existing assertion that pins a button or radio tag's exact markup by appending tabindex="0" as the new last attribute; weaken nothing. Known sites at planning time: BatchRow.test.jsx (the three Bitter chip strings and the two fold-row strings), FoldRow.test.jsx (two), DerivedAdvisories.test.jsx (two; it renders FoldRow, so its expected strings change though DerivedAdvisories.jsx does not), VersionRow.test.jsx (the two Saving-state strings and the two fold-row regular expressions). The full suite will reveal any others.

    Step 4, extend the probe with its second scenario (per D-04). Reading D: in a fresh page in each engine, open the pen (Record another), activate Add tasting, focus Churn duration, and press Tab until the first Save batch button is active or 150 presses have passed. Reduce each engine's list to its button and radio stops only (text inputs and textareas dropped), collapse radio runs by name, and assert WebKit's reduced list equals Chromium's reduced list and ends at Save batch; print both. Reading E, one AxisMark group (Hardness, input name axis-hardness): with nothing picked and then with the 3 stop picked by click, count the Tab stops that land on radios named axis-hardness from the field before the axes grid, in each engine (print them; assert that Chromium reads 1 in both states). Reading F: from the unpicked state Tab into the Hardness group and press ArrowRight, ArrowRight, ArrowLeft, asserting as in Reading C that exactly one radio is checked, that it is the focused one and that it changes each press, in both engines. Reuse Task 1's helpers rather than copying them. Label every check with its engine and the list read.

    Step 5, prove it. Run the touched test files (green), then the full suite. Run the completeness scan from the verify command: it prints `all tagged` and exits 0 (it read 39 offenders before Task 1 and 33 before this task; GraduatedRule passes it because it forwards a prop, so Step 2's `?? 0` is pinned by its own test, not by the scan). Then `npm --prefix app run build` and the probe: exit 0. If WebKit's reduced list differs from Chromium's, STOP and report both lists; do not iterate. Report WebKit's AxisMark stop counts as numbers. Commit with a `fix(261001-doi): ...` message ending with the two trailer lines, staging the files named in this task (plus any other test file the suite forced) by path.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && node -e "const fs=require('fs');const dir='app/src/ui/';const bad=[];for(const f of fs.readdirSync(dir)){if(!/\.jsx$/.test(f)||/\.test\./.test(f))continue;const raw=fs.readFileSync(dir+f,'utf8');const s=raw.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')).replace(/\/\/.*$/gm,m=>' '.repeat(m.length));for(const m of s.matchAll(/\x3c(button|input)\b/g)){let i=m.index+m[0].length,d=0;for(;i<s.length;i++){const c=s[i];if(c==='{')d++;else if(c==='}')d--;else if(c==='\x3e'&&d===0)break}const tag=s.slice(m.index,i+1);if((m[1]==='button'||/type=.(radio|checkbox)/.test(tag))&&!/tabIndex=\{/.test(tag))bad.push(f+':'+raw.slice(0,m.index).split('\n').length)}}console.log(bad.length?bad.join(' '):'all tagged');process.exit(bad.length?1:0)" && npm --prefix app run build && node .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs</automated>
  </verify>
  <acceptance_criteria>
    - Before the source change the new and changed tests fail (RED, recorded); afterwards the full suite passes with no test removed.
    - The completeness scan prints `all tagged` and exits 0, so every button opening tag and every radio and checkbox input tag under app/src/ui carries a tabIndex.
    - `grep -c "tabIndex ?? 0" app/src/ui/GraduatedRule.jsx` prints at least 1; FormulationNote.test.jsx's recording and developing tests still assert 6 tabindex="-1".
    - The probe exits 0 against the fresh build: the tasting-open button and radio-group order in WebKit equals Chromium's and ends at Save batch, arrow keys change an AxisMark group's selection in both engines, Chromium reads one stop per axis group in both states, and WebKit's counts are printed.
    - `git diff --name-only PRE..HEAD -- app` lists only app/src/ui files named in Tasks 1 and 2 or test files the full suite forced, and no file under app/src/styles.
  </acceptance_criteria>
  <done>Every button, radio and checkbox under app/src/ui is an explicit Tab stop, each component's own test pins the count on rendered markup (source text for the one site the harness cannot render), the six graduated rules keep their recording-mode exemption, and a WebKit Tab through the tasting-open pen visits the same buttons and radio groups, in the same order, as Chromium.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: The note keeps the board's space above the axes, pinned by test and by a board-comparison probe, then the SUMMARY (D-03, D-05, D-06, D-07)</name>
  <files>app/src/styles/cross-cutting.test.js, app/src/styles/app.css, .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs</files>
  <read_first>.planning/sketches/007-full-battery/index.html (line 34 the label rule, lines 93-106 the tasting-body rules, lines 249-262 the markup), .planning/sketches/008-control-sheet/index.html (a grep for note-block, tasting-body and axes-cue only; its README states what the sheet draws), app/src/ui/BatchRow.jsx (lines 209-260 the AxesGrid and its cue ids, lines 845-860 the note block), app/src/styles/app.css (lines 2150-2200, the axes-grid rules and the comment style above them), app/src/styles/cross-cutting.test.js (lines 24-60 the helpers, lines 630-660 an axes rule's pin), app/src/styles/css-source.js (readAllRules, resolveTokenPx), .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs (lines 27-67 and 538-640, the keypad group's structure and boxChecks), .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (openBoard, lines 140-200)</read_first>
  <behavior>
    - cross-cutting.test.js: the top-level `.note-block` rule exists; its declarations contain `margin-bottom: var(--gap-m)` and `padding-bottom: var(--gap-s)`, contain nothing else, and contain no px literal; `--gap-m` resolves to 20 and `--gap-s` to 12 through resolveTokenPx, so the board's numbers are token arithmetic.
    - The notegap probe group at 393 coarse, 1366 coarse and 1366 fine, in each context after Record another and Add tasting: the app's note-block bottom to the axes-core cue top is within 1px of the same reading on sketch 007; the app's textarea bottom to cue top is no more than 1px above and no more than 3px below the board's (the 3px is the measured strut residual the plan names); both readings and their board counterparts are printed.
    - The keypad group still passes at 393 and 1366.
  </behavior>
  <action>
    Work from the checkout root. Tasks 1 and 2 are committed; app/dist is current from Task 2's build.

    Step 1, measure the boards and the app before any edit (per D-05). Read sketch 007's CSS and markup at the lines named in read_first and run a grep of sketch 008 for note-block, tasting-body and axes-cue; say in the SUMMARY that 008 draws no note block (if the grep finds one, measure it the same way and require it to agree with 007). With a throwaway script kept outside the repo, open sketch 007 through the harness's openBoard with an explicit width and pointer (1366 coarse, 1366 fine, 393 coarse), call the board's own `setTastingMode('visible')`, and read three numbers from the rendered boxes: the note-block bottom to the `#axes .axes-cue--core` top, the textarea bottom (`#tasting-body .note-block textarea`) to the note-block bottom, and the textarea bottom to the cue top. Read the app the same way against the build (openApp, Record another, Add tasting, the textarea labelled How did it turn out?, its closest .note-block, the cue by id axes-core-cue). The planner measured the board at 20, 17.3 and 37.3 at all three combinations, and the app at 3px textarea to cue with the note block's bottom 3px below the textarea. If your board numbers differ from those by more than 1px at any combination, or the three combinations disagree with each other, or the app's note block has gained a margin or padding, STOP and report your numbers: the rule below is then unsupported. Record all of them in the SUMMARY.

    Step 2, RED. In app/src/styles/cross-cutting.test.js add a describe block named for this quick task and sketch 007 (lines 34 and 96), holding the pins in the behavior block, in the file's own style (ruleFor('.note-block'), the declarations tested by regular expression, the tokens read through resolveTokenPx). In the batches probe add the `notegap` group beside `keypad`: a helper that reads the three numbers from the app, a helper that opens sketch 007 through openBoard (explicit width and coarse, since the file carries no $preview), drives `setTastingMode('visible')` and reads the same three numbers, and a loop that, for each requested width in 393 and 1366, opens a coarse context, and, when 1366 was requested, a separate fine context. Select the cue by id on the app and by `#axes .axes-cue--core` on the board. Run the CSS test (it MUST fail) and the probe's notegap group against the current build (it MUST fail on the note-block-to-cue check: about 0 against 20). Add `notegap` to the header comment's usage lines, naming 261001-doi and what the group guards. Record both failures as RED.

    Step 3, GREEN. In app/src/styles/app.css add one rule, `.note-block`, immediately above the axes-grid comment block it leads into, with `padding-bottom: var(--gap-s)` and `margin-bottom: var(--gap-m)` and no other declaration, and a comment in the file's voice: the space the board draws below the tasting note before the axes (sketch 007 line 96, margin-bottom var(--gap-m), outside the block, and line 34's label margin, var(--gap-s), inside it, which the app's paragraph eyebrow and textarea lost when the label became a paragraph); tokens only; quick task 261001-doi (Mark's iPad, 2026-10-01: the Every recipe cue sat 3px under the note). Touch no other rule, no token and no markup.

    Step 4, prove it. Run the CSS test (green), the full suite (green), `npm --prefix app run build` (the final app/dist must be built from the fixed source: it is what Mark's iPad reads from the :4173 preview), then `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs notegap,keypad 393,1366`: exit 0. A keypad failure is reported in the SUMMARY, not fixed here, after confirming it also fails on the build from PRE. Also re-run the Task 1 and Task 2 probe against this final build: exit 0. Commit the three files with a `fix(261001-doi): ...` message ending with the two trailer lines, staging them by path.

    Step 5, the SUMMARY (per D-03, D-07). Write `.planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-SUMMARY.md` and leave it uncommitted for the quick workflow's own docs commit. It carries, in this order: a short section near the top stating plainly that the iPad result is device-unverified, that WebKit-engine readings (Playwright WebKit 26.6 at 1366 touch) are evidence about the engine and not about Mark's iPad, and that Chromium passed Reading A before the fix only because it Tabs to every control unaided; the RED and GREEN probe output for Tasks 1 and 2 (the WebKit order before and after, the per-group Tab-stop counts for Exit consistency, Airiness and Hardness in each engine, picked and unpicked, and whether WebKit counts each radio as a stop); the arrow-key results; the board and app gap readings from Step 1 and Step 4 at the three combinations, naming the 2.3px strut residual and stating that 008 draws no note block; the full-suite count (1421 plus the new tests); the check count of the notegap and keypad run; the GraduatedRule decision (reading mode is now a Tab stop, recording and developing keep -1); the sites not covered (the one select in VersionRow.jsx, rendered only with two or more citable batches, was assumed to Tab natively per the brief and not exercised); a note that .claude/CLAUDE.md was not edited, that its link convention now has a sibling rule for buttons, radios and checkboxes, and that Mark decides whether to record it; and Mark's iPad checklist: hard-reload the :4173 preview first (it serves the rebuilt app/dist), leave Full Keyboard Access off (turning it on has locked the keyboard until a power cycle), open a recipe's batch, tap Record another, tap Churn duration, press Tab and confirm the focus ring visits Exit consistency, Airiness, At the machine, Ingredient notes, Next time, Add tasting, Cancel and Save batch in that order; use the arrow keys on an Exit consistency group and confirm the selection moves and Tab leaves the group; tap Add tasting and confirm the Every recipe cue sits a clear space below the note field, as on sketch 007 (quote the measured app and board numbers from Step 4); confirm the Tab path through the axes reaches each axis and each defect chip. If any of that fails on the device, say so with the failing step; the next move is to measure the real app on the device through the proxy method, not another guess.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && npm --prefix app run build && node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs notegap,keypad 393,1366 && node .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs</automated>
  </verify>
  <acceptance_criteria>
    - Before the CSS change the cross-cutting test and the notegap group fail (RED, recorded); afterwards the full suite passes with no test removed.
    - `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs notegap,keypad 393,1366` exits 0, with the notegap checks present for 393 coarse, 1366 coarse and 1366 fine.
    - `git diff PRE..HEAD --numstat -- app/src/styles/app.css` reports zero deleted lines (the new rule and its comment are the only change to that file), and `git diff PRE..HEAD --stat -- app/src/styles/tokens.css` is empty.
    - `git diff --name-only PRE..HEAD` lists only paths named in this plan's files_modified; the SUMMARY exists, is uncommitted, and carries the device-unverified section, the CLAUDE.md note and Mark's checklist.
  </acceptance_criteria>
  <done>When a tasting is entered at 393 coarse, 1366 coarse and 1366 fine, the Every recipe cue sits the same distance below the note block as on sketch 007 and within the named strut residual below the textarea, from one token-only rule that is pinned by a CSS test and by a board-comparison probe group. app/dist is rebuilt from the final source, and the SUMMARY states plainly what is and is not verified and what Mark checks on the iPad.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe process to app/dist and the repo tree | The harness serves local files on ephemeral 127.0.0.1 ports; browsers it drives load only those origins |
| keyboard focus to controls | An explicit tabindex changes which controls a keyboard user reaches; it adds no new action and no new input |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261001-doi-01 | Information disclosure | probe servers and the WebKit and Chromium contexts | low | accept | Existing harness posture (T-03.5-69, T-03.5-70): servers bind 127.0.0.1 on ephemeral ports and close themselves, and every context aborts any request whose host is not 127.0.0.1. The new probe creates its WebKit and Chromium contexts with the same blocker. Nothing leaves the machine. |
| T-261001-doi-02 | Tampering | locked controls during a save (PenFoot, VersionRow, RecipeBand) | low | mitigate | Every control that locks while a write is in flight keeps its disabled prop; a disabled element is not focusable whatever its tabindex, so a double press still cannot create two records. Task 1's locked-ceremony test asserts disabled="" and tabindex="0" on the same three buttons, and the existing disabled assertions in PenFoot.test.jsx and VersionRow.test.jsx stay. |
| T-261001-doi-03 | Elevation of privilege | notes and prose rendering | low | accept | The change adds a numeric tabindex attribute and one CSS rule. No markup is injected and no dangerouslySetInnerHTML is introduced; the project rule (notes render as text) is untouched. |
| T-261001-doi-SC | Tampering | npm/pip/cargo installs | high | mitigate | This plan installs no package. The probes use the playwright-core module and WebKit build already present for the existing harness; if WebKit will not launch the executor STOPs and reports rather than installing anything. |
</threat_model>

<verification>
- `npm --prefix app test -- --run` passes (1421 baseline plus the new pins, none removed), and `npm --prefix app run build` succeeds.
- The completeness scan in Task 2's verify command prints `all tagged`.
- `node .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs` exits 0: WebKit and Chromium reach the brief's eight in order from Churn duration, the tasting-open button and radio order matches between engines, arrow keys change radio selection in both, and Chromium reads one Tab stop per radio group.
- `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs notegap,keypad 393,1366` exits 0.
- Diff scope: `git diff --name-only PRE..HEAD` lists only paths named in files_modified; no CLAUDE.md, tokens.css or Shell.jsx among them. PRE is the sha Task 1's Step 0 recorded.
- The SUMMARY exists, is uncommitted, and states that the iPad result is device-unverified.
</verification>

<success_criteria>
- From Churn duration in WebKit, Tab reaches the Exit consistency and Airiness radio groups, At the machine, Ingredient notes, Next time, Add tasting, Cancel and Save batch in order, and a tasting-open Tab path through the axes and defect chips matches Chromium's.
- All 35 untagged button sites, the 2 radio input sites and the 3 checkbox input sites carry tabIndex={0}; the six graduated rules keep -1 while recording and developing and read 0 otherwise.
- Every touched component's test pins its tabindex counts on rendered markup (source text for the one unrenderable site); Segmented.test.jsx makes no claim WebKit may not honour.
- Arrow-key selection still works in a Segmented group and an AxisMark group in both engines, and the Tab-stop counts per radio group are on record for both.
- The Every recipe cue sits the board's distance below the tasting note at 393 coarse, 1366 coarse and 1366 fine, from one token-only .note-block rule, pinned by a CSS test and a board-comparison probe group.
- The SUMMARY says the iPad result is device-unverified, records the CLAUDE.md sibling-rule note without editing any CLAUDE.md, and gives Mark's iPad checklist.
</success_criteria>

<output>
Create `.planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-SUMMARY.md` when done
</output>
