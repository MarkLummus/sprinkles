---
phase: quick-261123-ghh
plan: 01
quick_id: 261123-ghh
type: execute
wave: 2
depends_on: ["261123-ghg"]
files_modified:
  - app/src/ui/RecipePage.perStep.test.jsx
  - app/src/styles/notebook.test.js
  - app/src/ui/Method.jsx
  - app/src/styles/notebook.css
  - .planning/quick/261123-ghh-pen-refused-target-says-required-mark-approved-look-p12-pen/261123-ghh-SUMMARY.md
autonomous: true
requirements:
  - look-p12-pen-target-required
  - bug-pen-saves-blank-lead-in

estimate:
  tokens: 100000
  raw_tokens: 100000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "In Next version, a refused Save on a target with one side blank shows Required directly after the blank side's field, inside its .target-chip, as span#step-field-error.field-error. The blank field has aria-invalid=\"true\" and aria-describedby=\"step-field-error\". The other side has neither. Focus is in the blank field (CONTRACT section 13, README decision 42)."
    - "At 1366 the open step's chip is an inline grid whose columns follow the markup order. Row 1 holds the struck value (when drawn, centred), then the label field, then the value field. Row 2 holds Required, under the blank field. The built page matches the drawn panels pt-value and pt-label of pen-target-required.html within 1 px, in Playwright WebKit and in Chrome (decision 43)."
    - "A chip that is not refused has no second row. A changed value's struck value stays on one line, not squeezed to 34 px over three lines as built. The built page matches the panel pt-changed within 1 px in both engines (decision 44, approved by Mark with the board)."
    - "Required goes at the next edit anywhere in the pen. Typing in the blank field, or in Version name, removes Required, aria-invalid and aria-describedby. The next Save stores what was typed (decision 46)."
    - "A target with both sides blank is never refused. No Required is drawn, and Save stores the version without that target (CONTRACT section 13, 261123-bdk)."
    - "Two targets on one step with one refused (not drawn): on the wrapping targets line, each chip stands on its own line, as built. The refused chip's first row does not move. The other chip keeps its size. A chip after the refused one moves down by exactly the refused chip's growth. Measured in WebKit and Chrome."
    - "Nothing else moves. CreationSteps.jsx, the creation editor's chip rules, app/src/domain and app/src/store are unchanged. The full suite passes. 12-check.sh ends GATE2 PASS."
  artifacts:
    - path: app/src/ui/Method.jsx
      provides: "StepPenBody's open-step chips mark, describe and draw Required after a refused target side"
      contains: "valueError"
    - path: app/src/styles/notebook.css
      provides: "The pen's open-step chip as the snapshot's flowing inline grid, with .field-error on row 2"
      contains: ".notebook .method-step__open-fields .target-chip > .field-error"
    - path: app/src/ui/RecipePage.perStep.test.jsx
      provides: "U7 and U8 with the Required assertions; U9 to U12"
      contains: "look-p12-pen-target-required"
    - path: app/src/styles/notebook.test.js
      provides: "The four rules pinned to the snapshot's declarations"
      contains: "look-p12-pen-target-required"
  key_links:
    - from: "app/src/ui/Method.jsx"
      to: "app/src/ui/FieldFeedback.jsx"
      via: "each chip side renders FieldFeedback directly after its textarea. Its error is blockedMessage when blocked.kind is 'stepTarget' and blocked.index and blocked.side name this chip and side."
      pattern: "error=\\{valueError\\}"
    - from: "app/src/styles/notebook.css"
      to: "app/src/ui/Method.jsx"
      via: "grid-auto-flow column with every child on row 1 and .field-error on row 2. Auto-placement puts Required under the field it directly follows in the markup, so the markup order is the layout."
      pattern: "method-step__open-fields \\.target-chip > \\.field-error"
---

<!-- planner-discipline-allow: FAIL -->
<!-- FAIL is the board engine's and measure.mjs's own result word at the start of a log line. The gates read the scratch logs, never app code. -->

<objective>
Build sketch 016 CONTRACT section 13, "The pen's refused target", and its snapshot `.planning/sketches/016-entry-points-pen-preview-row-controls/pen-target-required.html` (board `P12R3_PenTarget`). Mark approved the board on 2026-11-23 (`look-p12-pen-target-required`, recorded in the sketch README under "Mark's answers on the round-three redraws"). His approval covers README decision 44 too: the grid applies to an open-step chip that is not refused, so a changed value's struck value keeps one line.

This item is the held Task 3 of quick 261122-tqn. Commit cad72d3f already built the refusal and the focus:
- penSaveBlock returns { kind: 'stepTarget', n, index, side } with the message Required.
- Method opens the named step.
- StepPenBody focuses the blank side through targetFieldsRef.

What a maker sees today: the cursor lands in an empty field, with no word and no aria wiring. Quick 261123-bdk added that a target with both sides blank is dropped at Save and is never refused.

What this plan builds:
- Method.jsx, StepPenBody's open-step chips: each side gets aria-invalid, aria-describedby and a FieldFeedback directly after its textarea. This is the creation editor's markup (CreationSteps.jsx) with the pen's one error id, 'step-field-error'.
- notebook.css: the snapshot's four drawn rules (its lines 13156 to 13159), moved from the board's `.r3-chip` scope to the app's `.notebook` scope. Every open-step chip becomes a flowing inline grid. The board puts the `r3-chip` class on the `.notebook` element, so the app's selector is `.notebook .method-step__open-fields .target-chip`.
- No new words. Required is the build's word (lineage.js REQUIRED, which reaches StepPenBody as blockedMessage).

Authority: the snapshot HTML and its CSS. Conformance is the board and the built page side by side in a browser. Neither prose nor a test count proves it. The Phase 12 board engine (`12-board-check.mjs`) does this comparison panel by panel within 1 px. Here it runs on a scratch spec held outside the repo, in WebKit, and in Chrome through the shim 261123-brl used.

Gate scripts: no Phase 12 gate file holds the pen's target chip.
- 12-board-penpreview.mjs's Coffee has no target, so its open step has no chip.
- 12-tab-probe.mjs reads the creation editor's chips (`li.mk-step`).
- 11-walk.mjs reads reading-chip text.
So no gate file changes. 12-check.sh must still end GATE2 PASS.

Undrawn states, and what the plan builds for each (all listed again in the SUMMARY for the orchestrator):
1. Two targets on one step with one refused. The orchestrator named this state; the README lists it under "Not settled by these boards". Build: nothing beyond the chip rule. The targets line (app.css `.method-step__targets`, flex with wrap) stays as built. Each pen chip is about 436 px wide in a step body under 528, so each stands on its own flex line. The refused chip grows its second row, the chip after it moves down by that growth, and the other chip's box keeps its size. This is the README's own reading ("the line wraps chips as built and a refused chip is taller than its neighbour"). Task 2 measures it on Olive Oil v1 Step 2 (temp 85 °C, hold 2 min). If the two chips share one flex line in either engine, flex would stretch the neighbour. In that case add no alignment rule: stop and report it as a state for Mark.
2. Both sides blank: never refused (decision 45, 261123-bdk). No Required is drawn and Save stores the version without that target. U11 guards it.
3. Required clears at the next edit anywhere in the pen, as built: usePenDraft.edit calls clearBlock for every pen change (decision 46). U9 covers the field and U10 covers Version name. No new clearing code.
4. A pen kept open while the window narrows below 724 (CONTRACT section 11, number 5b). Not drawn, and not measured. The rule has no media condition, so the chip reads the same there. The pen's desk widths all have a 528 region (README "Measured").
5. A fine pointer at the desk. The board is a coarse pointer. The rule has no pointer condition. Under a fine pointer the fields lose the touch floor's padding, so the chip's heights differ from the board's 46 and 65. Not drawn, and not measured.
6. What is announced. As built in 261122-tqn: a step block announces nothing, focus moves into the field, and Required describes it.

Also fixed: the README's "Noticed, as built, for triage". The pen's changed-value struck value is squeezed to 34 px over three lines. Decision 44 fixes it and Mark approved it.

Not in this plan: the pen's open step gets no Add target and no Remove for a target. Nothing on the creation editor changes. No stored shape changes and DB_VERSION does not change.

Purpose: the pen says why it refused a target, in the creation editor's word and place, and a changed target reads on one line.
Output:
- Two app commits: red tests, then the markup and the four rules.
- A CSS commit only if Task 2 finds a cascade difference (it then stops; see Task 2).
- A committed SUMMARY.
- Scratch evidence under the session's TMPDIR, not committed.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read by range or by search, not whole. Line numbers are at planning HEAD fa19967d. 261123-ghg lands first and edits Method.jsx and a stylesheet, so find every site by content.
- .planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md section 13, "The pen's refused target" (lines 159-165).
- .planning/sketches/016-entry-points-pen-preview-row-controls/README.md "Redraw 4: the pen's refused target says Required" (decisions 42-46, lines 246-254) and "Not settled by these boards" (lines 263-270).
- pen-target-required.html is 13,187 lines, almost all inlined CSS. Read only these ranges:
  - lines 13156-13159: the four drawn rules, the authority for notebook.css;
  - lines 13173-13175: the drawn panels pt-value, pt-label and pt-changed;
  - lines 13171-13172: the as-built panels, which are not targets.
- app/src/ui/Method.jsx:
  - 1-13: imports and STEP_FIELD_ERROR_ID;
  - 183-203: the focus effect, leadError, instructionError, registerTargetField;
  - 236-262: the lead-in and instruction with their FieldFeedback, the model for this plan;
  - 276-309: the open step's target chips.
- app/src/ui/CreationSteps.jsx 128-162: read only. The creation chip's markup, with FieldFeedback directly after each side.
- app/src/ui/FieldFeedback.jsx (14 lines): it returns span#errorId.field-error, or null.
- app/src/styles/notebook.css 312-366: the creation chip's grid, and the pen's open-step textarea rules.
- app/src/styles/app.css, read only: 928-932 (.struck-value), 1162-1177 (.method-step__targets, .target-chip) and 2258-2269 (.field-error).
- app/src/styles/notebook.test.js 1-25 (the rules reader) and 1217-1237 (the creation chip's placement describe, the model).
- app/src/ui/RecipePage.perStep.test.jsx:
  - 60-184: the repository mock `store`, VERSION_PATH (Olive Oil v1), installMatchMedia, flush, mountAt, buttonByText, buttonByLabel, click, setValue;
  - 1223-1385: the two bug-pen-saves-blank-lead-in describes, the models and the tests extended here.
- app/src/data/olive-oil.js 118-160: Step 1 has one target, temp / room. Step 2 has two targets, temp 85 °C and hold 2 min.
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs (192 lines, whole). The spec to copy: its openPen makes the board's Coffee, its penPanel holds the panel shape, and its PEN_ELEMENTS holds the check kinds.
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs 1-115: usage, panel shape, check kinds, PLAYWRIGHT_CORE, PROBE_DIST. The engine removes `.dl-flag` notes from the board before reading.
- .planning/canvas-generators/p12r2-capture.mjs 114-127: how the board's states were made (Step 1's target "Heat to" / "82 °C", Version name "hotter", then the value changed, cleared, and the label cleared).
- .planning/quick/261123-brl-desk-line-closing-words-in-a-wider-windo/261123-brl-SUMMARY.md, "Side by side, board against app": the method, and the Chrome shim.
</context>

<interfaces>
At planning HEAD fa19967d:
- StepPenBody({ ..., blocked = null, blockedMessage = null }):
  - blocked is the block when it names this step, else null. For a target it is { kind: 'stepTarget', n, index, side: 'label' | 'value', attempt }.
  - blockedMessage is 'Required'.
  - leadError and instructionError are derived beside registerTargetField(index, side, element).
- STEP_FIELD_ERROR_ID = 'step-field-error' (one blocked step field at a time).
- FieldFeedback({ error = null, errorId, required = false }) returns span with id errorId and class field-error, or null.
- The open step's chip markup, in order: span.target-chip > [span.struck-value when targetDiff.changed and targetDiff.from is not null] + textarea.ink-field.target-chip__label-field + textarea.ink-field.target-chip__value-field.
- Accessible names: 'Step N, target M, label' and 'Step N, target M, value' (fieldLabel). Steps: 'Step N, edit this step'. The pen's own field: 'Version name'. Buttons by text: 'Next version', 'Save as new version'.
- The struck value's text is `${targetDiff.label} ${targetDiff.from}`. For Olive Oil Step 1 with the value cleared it reads 'temp room'. With the label cleared, none is drawn: the diff pairs targets by label.
- notebook.test.js: the top-level `rules` is readAllRules(notebook.css). Each rule has selector (string), declarations (string) and media (undefined outside @media).
- usePenDraft.edit(op, ...args) calls clearBlock() before every pen change, Version name included (useVersionPen.js versionPen.edit(setPenField, ...)).
</interfaces>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer: Required under a refused target's blank side, red tests to the board's pt-value panel in WebKit</name>
  <files>app/src/ui/RecipePage.perStep.test.jsx, app/src/styles/notebook.test.js, app/src/ui/Method.jsx, app/src/styles/notebook.css</files>
  <precondition>261123-ghg has landed in this checkout (a 261123-ghg SUMMARY exists under .planning/quick/), and git status --porcelain app/src prints nothing.</precondition>
  <behavior>
    The jsdom tests are in RecipePage.perStep.test.jsx, in the existing describe 'bug-pen-saves-blank-lead-in: a target with one side blank'. Its comment says the held part is not asserted. Replace that comment: the part is now drawn and approved (pen-target-required.html, look-p12-pen-target-required), and the tests assert it.
    - U7, extended (a blank value on Olive Oil v1 Step 1). After the existing assertions:
      - the page holds exactly one .field-error, with text 'Required' and id 'step-field-error';
      - the value field has aria-invalid 'true' and aria-describedby 'step-field-error';
      - the error is the value field's nextElementSibling, and its parentElement is the value field's closest .target-chip;
      - the chip's children, in order, are span.struck-value (text 'temp room'), the label textarea, the value textarea, the .field-error;
      - the label field has neither aria-invalid nor aria-describedby.
    - U8, extended (a blank label), the same on the label side:
      - one .field-error 'Required' with id 'step-field-error', the label field's nextElementSibling, inside its chip;
      - the label field is aria-invalid and described by it;
      - the chip's children, in order, are the label textarea, the .field-error, the value textarea (no struck value);
      - the value field is neither invalid nor described.
    - U9: refuse as in U7, then set 'Step 1, target 1, value' to 'warm'.
      - No .field-error remains, and the value field has no aria-invalid and no aria-describedby.
      - Press Save as new version and flush until createVersion is called. It was called once, and the child's step with n 1 has targets [{ label: 'temp', value: 'warm' }].
    - U10: refuse as in U7, then set 'Version name' to 'v3'. No .field-error remains, and the value field has no aria-invalid. An edit anywhere in the pen clears the word (decision 46).
    - U11 (a bound):
      - Step 1 open, both 'Step 1, target 1, label' and 'Step 1, target 1, value' set to '', then press Save as new version;
      - right after the press the page holds no .field-error;
      - flush until createVersion is called: it was called once, and the child's step with n 1 has targets equal to [] (dropped, 261123-bdk).
    - U12 (two targets, one refused):
      - press 'Step 2, edit this step', set 'Step 2, target 2, value' to '', press Save as new version;
      - nothing is stored, and focus is in 'Step 2, target 2, value';
      - exactly one .field-error. Its parentElement is the second .target-chip of Step 2's open fields, and it is that chip's value field's nextElementSibling;
      - the first chip holds no .field-error, and neither of its textareas has aria-invalid.
    The CSS tests are in notebook.test.js: a new describe "the version pen's open-step chip is the creation editor's grid (look-p12-pen-target-required)", placed after the describe 'a target chip places its refused message under its own field'. It has four tests, each finding a rule with media undefined by exact selector:
    - '.notebook .method-step__open-fields .target-chip' declares display inline-grid, grid-auto-flow column, justify-content start and column-gap var(--gap-hair);
    - '.notebook .method-step__open-fields .target-chip > *' declares grid-row 1;
    - '.notebook .method-step__open-fields .target-chip > .struck-value' declares align-self center;
    - '.notebook .method-step__open-fields .target-chip > .field-error' declares grid-row 2.
    Red at the base: U7, U8, U9, U10, U12 and the four CSS tests fail. U7 and U8 fail at the first Required or aria-invalid assertion, U9, U10 and U12 at their Required count, and the CSS tests on a missing rule. U11 passes, as a bound.
  </behavior>
  <action>
Step 0, before any edit:
- Let S be "${TMPDIR%/}/sprinkles-261123-ghh". Create it.
- Write `git rev-parse HEAD` to S/head-before. Every diff gate in this plan reads it as BASE.
- Run npm --prefix app test and write its "Test Files" and "Tests" lines to S/suite-before. It must pass. If it does not, stop and report.
- This plan builds only into S/dist. It starts no Vite dev or preview server, never contacts port 4173, and never writes app/dist.

Red:
- Write the tests in the behavior block.
- Use only the file's own helpers: mountAt, installMatchMedia, buttonByText, buttonByLabel, click, setValue, flush, store.
- Use a local field(label) over textarea[aria-label], as the existing describe does.
- Comments say why in plain English and name the row look-p12-pen-target-required once per describe.
- Change no other test or helper.
- Run npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx src/styles/notebook.test.js -t 'one side blank|look-p12-pen-target-required'. It must exit non-zero with the failures and the one pass named in the behavior block. Every setup guard inside a failing test must pass; if a guard fails, the test is wrong, not the app.
- Copy the failing assertion lines into S/red.txt.
- Commit only the two test paths, with git add of the explicit paths, never -A: untracked .review-diagnostics and quick-batches folders sit under .planning. Message: "test: the version pen's refused target says Required under its blank side (look-p12-pen-target-required)", then a blank line and the two attribution lines, Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01VWwTRSNw8tGVgeHqypcMwH.

Green, Method.jsx: StepPenBody's open-step target chips (the draftStep.targets map inside div.method-step__open-fields), per CONTRACT section 13 and decision 42.
- Inside the map callback, before its return, derive labelError and valueError. Each is blockedMessage when blocked?.kind is 'stepTarget', blocked.index equals this index and blocked.side is 'label' (or 'value'); otherwise null.
- The label textarea gets aria-invalid 'true' and aria-describedby STEP_FIELD_ERROR_ID while labelError stands, else undefined. These are the lead-in's attributes a few lines above. Do the same for the value textarea and valueError.
- Render FieldFeedback with error labelError and errorId STEP_FIELD_ERROR_ID directly after the label textarea. Render one with valueError directly after the value textarea. These are CreationSteps.jsx's positions, with no required prop: the pen gives the refusal only, as for the lead-in.
- Render both unconditionally, so each textarea keeps its child position and the focused field is never remounted.
- Keep the struck value where it is, the chip's first child.
- Add one plain `//` comment in the callback body. It says Required stands directly after the blank side, inside the chip, because the chip's grid puts it on the second row under the field it follows (sketch 016 CONTRACT section 13). Comments you add do not name the identifiers FieldFeedback, STEP_FIELD_ERROR_ID or aria-invalid (count gates below).

Green, notebook.css:
- Place one rule block after the creation chip's last grid rule (the .mk-step chip's `> .text-control` rule) and before the "target fields are one-row textareas too" comment.
- Copy the four rules of pen-target-required.html lines 13156-13159 declaration for declaration, with `.r3-chip` replaced by `.notebook`, each on its own lines in the file's style:
  - '.notebook .method-step__open-fields .target-chip' with display inline-grid, grid-auto-flow column, justify-content start, column-gap var(--gap-hair);
  - '.notebook .method-step__open-fields .target-chip > *' with grid-row 1;
  - '.notebook .method-step__open-fields .target-chip > .struck-value' with align-self center;
  - '.notebook .method-step__open-fields .target-chip > .field-error' with grid-row 2.
- Write each selector on one line, starting at column 0.
- No other declaration. Tokens only (the file's guards already hold that).
- One comment above the block says:
  - the version pen's open-step chip is the creation editor's two-row grid (sketch 016 CONTRACT section 13, pen-target-required.html, approved by Mark 2026-11-23, look-p12-pen-target-required);
  - its columns flow in markup order, so the parent's struck value keeps its place before the label and stays on one line, and Required stands on the second row under the field it follows (Phase 11 D-10);
  - it applies to every open-step chip, refused or not (README decision 44).

Run npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx src/styles/notebook.test.js src/ui/Method.test.jsx. All must pass. Commit Method.jsx and notebook.css by explicit path. Message: "fix: the version pen stands Required under a refused target's blank side, in the creation editor's grid (look-p12-pen-target-required)", then a blank line and the same two attribution lines.

The tracer's far end: the built page against the board, one panel, WebKit.
- Build: npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir.
- Write S/pentarget-spec.mjs. It is scratch and not committed. Its default export is one spec whose board is '.planning/sketches/016-entry-points-pen-preview-row-controls/pen-target-required.html'. Copy from 12-board-penpreview.mjs: clickUntil, openPen and the penPanel helper (width 1366, route '/notebook', library 'current', ready '.nb__head', anchor '.method-region', panelSelector '.fp-win.g2w-1366[data-pid="<pid>"]', panelIndex 0).
- Change the copied openPen in three places, all from p12r2-capture.mjs:
  - after Egg yolk's Move up and its wait, and before the navigation to /notebook/new: press 'Step 1, Add target'; fill '.method-step[data-step="1"] .target-chip__label-field' with 'Heat to'; fill '.method-step[data-step="1"] .target-chip__value-field' with '82 °C'; wait 1500 ms so the kept draft holds it;
  - after Next version opens: fill 'Version name' with 'hotter';
  - press 'Step 1, edit this step' and wait for '.method-step__open-fields', as the original does.
- Export openPen as a named export too, so Task 2's readout can reuse it.
- One panel, 'pt-value'. Its steps: openPen; fill '.method-step__open-fields .target-chip__value-field' with ''; press the button 'Save as new version' (inside '.notebook-ceremony__actions'); wait for '.method-step__open-fields .field-error'; wait 300 ms.
- Its elements:
  - '.method-step__open-fields .target-chip' with count and box;
  - '.method-step__open-fields .target-chip > .struck-value' with count, text, font and box;
  - '.method-step__open-fields .target-chip > textarea' with count, value, { attr: 'aria-label' }, { attr: 'aria-invalid' } and box;
  - '.method-step__open-fields .target-chip > .field-error' with count, text, font and box;
  - '.method-step__open-fields textarea.prose-field' with count, value and box;
  - 'p.method-step__uses-line' with count and box;
  - '[aria-label="Step 1, target 1, value"]' with count, focus and box.
- Do not compare id or aria-describedby here. The board suffixes its ids per panel ('step-field-error-pt-value'); U7 pins the app's 'step-field-error'.
- Run: PROBE_DIST="$S/dist" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs "$S/pentarget-spec.mjs" > "$S/tracer-webkit.log" 2>&1. It must end "<n> PASS, 0 FAIL" with no line starting FAIL.
- If a box check fails, the cascade differs from the board's. Do not change a threshold and do not invent a rule. Compare the computed style of the failing element on both sides, write the differing property and rule into S/tracer-diff.txt, and stop and report.
  </action>
  <verify>
    <automated>S="${TMPDIR%/}/sprinkles-261123-ghh" && test -s "$S/head-before" && test -s "$S/suite-before" && test -s "$S/red.txt" && npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx src/styles/notebook.test.js src/ui/Method.test.jsx</automated>
    <automated>test "$(grep -c '^\.notebook \.method-step__open-fields \.target-chip' app/src/styles/notebook.css)" -ge 4 # [HEAD=0 EXPECT>=4 @fa19967d] (the Vitest describe pins the four rules exactly)</automated>
    <automated>BASE="$(cat "${TMPDIR%/}/sprinkles-261123-ghh/head-before")" && OLD="$(git show "$BASE":app/src/ui/Method.jsx)" && test "$(grep -v '^[[:space:]]*//' app/src/ui/Method.jsx | grep -c 'FieldFeedback')" -ge "$(( $(printf '%s\n' "$OLD" | grep -v '^[[:space:]]*//' | grep -c 'FieldFeedback') + 2 ))" # [HEAD=3 EXPECT>=5 @fa19967d] (the command reads base+2, so a 261123-ghg change cannot skew it)</automated>
    <automated>BASE="$(cat "${TMPDIR%/}/sprinkles-261123-ghh/head-before")" && OLD="$(git show "$BASE":app/src/ui/Method.jsx)" && test "$(grep -c 'aria-invalid' app/src/ui/Method.jsx)" -ge "$(( $(printf '%s\n' "$OLD" | grep -c 'aria-invalid') + 2 ))" # [HEAD=2 EXPECT>=4 @fa19967d] (base+2)</automated>
    <automated>BASE="$(cat "${TMPDIR%/}/sprinkles-261123-ghh/head-before")" && OLD="$(git show "$BASE":app/src/ui/Method.jsx)" && test "$(grep -c 'STEP_FIELD_ERROR_ID' app/src/ui/Method.jsx)" -ge "$(( $(printf '%s\n' "$OLD" | grep -c 'STEP_FIELD_ERROR_ID') + 4 ))" # [HEAD=5 EXPECT>=9 @fa19967d] (base+4)</automated>
    <automated>test "$(grep -c 'look-p12-pen-target-required' app/src/ui/RecipePage.perStep.test.jsx)" -ge 1 # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>test "$(grep -c 'look-p12-pen-target-required' app/src/styles/notebook.test.js)" -ge 1 # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>S="${TMPDIR%/}/sprinkles-261123-ghh" && npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir && PROBE_DIST="$S/dist" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs "$S/pentarget-spec.mjs" > "$S/tracer-webkit.log" 2>&1 && ! grep -q '^FAIL' "$S/tracer-webkit.log" && grep -Eq '^[1-9][0-9]* PASS, 0 FAIL$' "$S/tracer-webkit.log"</automated>
  </verify>
  <done>
- Two commits: red tests, then Method.jsx and notebook.css.
- S/red.txt holds the nine failing assertions. U11 passed at the base.
- The three test files pass.
- The built page's pt-value state matches the board panel pt-value within 1 px in WebKit: chip, struck value, both fields, Required, the fields above, the uses line, and focus in the value field.
- The count gates hold at their deltas from BASE.
  </done>
</task>

<task type="auto">
  <name>Task 2: Every drawn panel in WebKit and Chrome, and the undrawn two-target state</name>
  <files>app/src/styles/notebook.css</files>
  <action>
No app change is expected. notebook.css is listed only for the stop rule at the end.

Add two panels to S/pentarget-spec.mjs, on the same penPanel helper:
- 'pt-label':
  - steps: openPen; fill '.method-step__open-fields .target-chip__label-field' with ''; press Save as new version; wait for '.method-step__open-fields .field-error';
  - elements: pt-value's list, with '[aria-label="Step 1, target 1, label"]' (count, focus, box) in place of the value field's focus entry;
  - absent: ['.method-step__open-fields .target-chip > .struck-value'].
- 'pt-changed':
  - steps: openPen; fill '.method-step__open-fields .target-chip__value-field' with '85 °C'; wait 300 ms;
  - elements: pt-value's list without the focus entry and without the .field-error entry;
  - absent: ['.method-step__open-fields .target-chip > .field-error', '.method-step__open-fields [aria-invalid]'].
  - The struck value's box check is decision 44: one line, about 78 wide, against the board.

Run the three panels with --selftest in both engines:
- WebKit: PROBE_DIST="$S/dist" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs "$S/pentarget-spec.mjs" --selftest --evidence "$S/evidence-webkit" > "$S/board-webkit.log" 2>&1.
- Chrome: write S/chrome-shim.mjs, the shim 261123-brl used.
  - It imports '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs' and takes chromium from its default export or the module.
  - It exports a webkit object whose launch(options) returns chromium.launch with those options plus executablePath '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' and headless true.
  - Then run the same command with PLAYWRIGHT_CORE="$S/chrome-shim.mjs", --evidence "$S/evidence-chrome", into S/board-chrome.log.
- Both logs must end "<n> PASS, 0 FAIL", with no line starting FAIL and a "PASS selftest" line for each of the three panels.

Write S/measure.mjs (scratch, not committed). It runs as node "$S/measure.mjs" webkit and node "$S/measure.mjs" chrome.
- Engines: playwright-core from the npx path above; Chrome is chromium.launch with the executablePath above and headless true.
- Serve "$S/dist" with startServers({ appRoot }) from .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs. It returns { appUrl, close } on an ephemeral 127.0.0.1 port. Abort every request not to 127.0.0.1.
- Each case gets a fresh context at 1366 by 1024 with hasTouch true, so each starts from the seeded store.
- Readout of the drawn states:
  - import openPen from "$S/pentarget-spec.mjs";
  - for the value-blank, label-blank and changed states, print the chip's w and h, and each child's x, y, w and h from the chip's top-left;
  - print the struck value's line count (distinct rounded tops of a Range over its text);
  - these numbers are for the SUMMARY; the pass rule is the engine's.
- The two-target cases (undrawn state 1):
  - open /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1; press Next version with a retry until form[aria-label="Next version"] shows (the first click after a navigation can miss); fill 'Version name' with 'probe'; press 'Step 2, edit this step';
  - case A: fill 'Step 2, target 2, value' with ''. Read both chips' boxes and their children's boxes. Press Save as new version, wait for '.method-step__open-fields .field-error', and read again. Pass when:
    - chip 1's x, y, w and h moved by 0.5 px or less;
    - chip 2's x, y and w moved by 0.5 px or less, and its h grew;
    - each of chip 2's first-row children (the struck value, the label field, the value field) moved by 0.5 px or less;
    - the error's left is within 0.5 px of chip 2's value field's left, and its top is at or below that field's bottom minus 0.5;
    - focus is in 'Step 2, target 2, value';
    - chip 2's top is at or below chip 1's bottom, before and after.
  - case B, a fresh context: the same with 'Step 2, target 1, value'. Pass when:
    - chip 1's x, y and w held and its h grew by G;
    - chip 2's x, w and h held and its top moved down by G, within 0.5 px;
    - the error stands under chip 1's value field by the same rule as case A.
  - Print one line per case per engine, starting PASS or FAIL, then the numbers. Readout lines start with neither word, and no summary line repeats either word. Exit 1 on any failing case.
- If chip 2's top is above chip 1's bottom in either case or engine, the two chips share a flex line and flex would stretch the neighbour. Add no alignment rule. Record the numbers and stop: it is an undrawn state for Mark.

The stop rule for this task. If a panel fails in either engine, or a two-target case fails other than by sharing a line:
- do not loosen a threshold and do not add a rule that is not in the snapshot;
- write the failing element's computed style on both sides into S/board-diff.txt, and stop and report.
The four rules are the snapshot's own. A failure means the app's cascade differs from the board's 990076a0 stylesheets, and that is for the orchestrator, not a design for this item. If no stop happens, notebook.css is not touched in this task.
  </action>
  <verify>
    <automated>S="${TMPDIR%/}/sprinkles-261123-ghh" && for E in webkit chrome; do ! grep -q '^FAIL' "$S/board-$E.log" && grep -Eq '^[1-9][0-9]* PASS, 0 FAIL$' "$S/board-$E.log" && test "$(grep -c '^PASS selftest' "$S/board-$E.log")" -ge 3 || exit 1; done</automated>
    <automated>S="${TMPDIR%/}/sprinkles-261123-ghh" && node "$S/measure.mjs" webkit > "$S/measure-webkit.log" 2>&1 && node "$S/measure.mjs" chrome > "$S/measure-chrome.log" 2>&1 && ! grep -q '^FAIL' "$S/measure-webkit.log" "$S/measure-chrome.log" && test "$(grep -c '^PASS' "$S/measure-webkit.log")" -ge 2 && test "$(grep -c '^PASS' "$S/measure-chrome.log")" -ge 2</automated>
    <automated>BASE="$(cat "${TMPDIR%/}/sprinkles-261123-ghh/head-before")" && git diff --quiet "$BASE" HEAD -- app/src/ui/CreationSteps.jsx app/src/ui/FieldFeedback.jsx app/src/domain app/src/store .planning/phases</automated>
  </verify>
  <done>
- pt-value, pt-label and pt-changed each match the board within 1 px in WebKit and in Chrome, each with its selftest refusing.
- The two-target cases A and B pass in both engines: each chip on its own line, the other chip's size held, the first row unmoved, the chip after a refused one lowered by exactly the growth.
- The readout numbers are in S/measure-*.log.
- No app file changed in this task, and no gate file changed.
  </done>
</task>

<task type="auto">
  <name>Task 3: Full suite, GATE2 and the SUMMARY</name>
  <files>.planning/quick/261123-ghh-pen-refused-target-says-required-mark-approved-look-p12-pen/261123-ghh-SUMMARY.md</files>
  <action>
- Run npm --prefix app test. It must pass at S/suite-before's test count plus 8 (U9 to U12 and the four CSS tests; U7 and U8 were extended, not added), with the same number of test files.
- Run sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh once, into S/gate.log. It takes several minutes and builds into its own scratch folder. Run it in the background if the tool allows. It must end GATE2 PASS.
  - If it fails at a step this item could touch (suite, probe pen, board pen-preview, tabs), report the failing lines and stop.
  - Do not edit a gate file to make it pass.

Write the SUMMARY at .planning/quick/261123-ghh-pen-refused-target-says-required-mark-approved-look-p12-pen/261123-ghh-SUMMARY.md. It records:
- Authority: CONTRACT section 13, pen-target-required.html (P12R3_PenTarget), README decisions 42 to 46, and Mark's approval (look-p12-pen-target-required, 2026-11-23, decision 44 included).
- Red (S/red.txt) and green; the suite before and after; the commit hashes.
- What was built: the markup, and the four rules with the snapshot line numbers they copy.
- Side by side:
  - the PASS counts per panel per engine from S/board-webkit.log and S/board-chrome.log;
  - the readout table (chip w and h; field, struck value and Required boxes; the struck value's line count), set against the README's figures: Required 210 by 15; the chip 46 to 65 high in WebKit and 64 in Chrome; with no struck value the fields at 7 and 219 px, 210 wide; the struck value on one line, about 78 wide;
  - the two-target lines for both engines.
- Gate: the GATE2 PASS line and the steps it ran. No gate file was changed, because none holds the pen's target chip (the reasons in this plan's objective).
- Undrawn states and what the build does, numbered as in this plan's objective. The two-target state's measured numbers go with item 1.
- "Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad".
- For the orchestrator (the executor has no ArtifactData):
  - Close look-p12-pen-target-required: built as approved.
  - Close bug-pen-saves-blank-lead-in. 261122-tqn held it open because the target half refused without a word; it now says Required.
  - Check decide-p12-pen-target-required-place and close it if it is still open.
  - The README's "Noticed, as built, for triage" (the squeezed struck value) is fixed by decision 44 and needs no row.
  - The scratch spec S/pentarget-spec.mjs could be committed as a Phase 12 board spec and added to 12-check.sh's board step if the orchestrator wants the gate to hold this board. It was not, to keep the change to the item.
  - A dist built from this commit is safe to deploy: no store write, no stored shape change, DB_VERSION unchanged.
  - A device check is optional, and was walked in WebKit by measure.mjs's steps. One step per line:
    1. Open Olive Oil v1 in a wide window and press Next version.
    2. Type a Version name.
    3. On Step 1 press Edit this step and clear the target's value.
    4. Press Save as new version. Expect: Required under the empty value, inside the chip, and the cursor in it.
    5. Type a value. Expect: Required goes.
    6. Press Save as new version. Expect: Version saved.
  - The scratch folder path S, holding the logs and the evidence pictures.

Commit the SUMMARY by explicit path. Message: "docs: summary for the pen's refused target says Required (261123-ghh)", then a blank line and the same two attribution lines.
  </action>
  <verify>
    <automated>npm --prefix app test</automated>
    <automated>grep -q '^GATE2 PASS' "${TMPDIR%/}/sprinkles-261123-ghh/gate.log"</automated>
    <automated>BASE="$(cat "${TMPDIR%/}/sprinkles-261123-ghh/head-before")" && ADDED="$(git diff "$BASE" HEAD -- app/src)" && test "$(printf '%s\n' "$ADDED" | grep -c '^+.*dangerouslySetInnerHTML')" = 0 && CHANGED="$(git diff --name-only "$BASE" HEAD -- app/src)" && test -z "$(printf '%s\n' "$CHANGED" | grep -vE '^app/src/(ui/(Method\.jsx|RecipePage\.perStep\.test\.jsx)|styles/(notebook\.css|notebook\.test\.js))$' | grep -v '^$')" # [HEAD added=0 EXPECT==0; changed files EXPECT subset of the four]</automated>
    <automated>test "$(grep -c 'Device-unverified' .planning/quick/261123-ghh-pen-refused-target-says-required-mark-approved-look-p12-pen/261123-ghh-SUMMARY.md)" -ge 1 # [HEAD=absent EXPECT>=1 @fa19967d]</automated>
  </verify>
  <done>
- Full suite green at the starting count plus 8, with the same file count.
- 12-check.sh ended GATE2 PASS with no gate file changed.
- Only the four app files in files_modified changed under app/src, with no added markup-injection line.
- The SUMMARY is committed with the side-by-side numbers, the undrawn states, and the orchestrator notes.
  </done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema is involved, so the API-coverage and schema-push checkpoints do not apply.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker text to the screen | A target's label and value are typed text, drawn back in the pen's textareas and in the struck value. This plan adds only the constant word Required beside them. |
| maker text to the version record | Unchanged by this plan. The refusal (261122-tqn) and the both-blank drop (261123-bdk) are built. Nothing here touches app/src/domain or app/src/store. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261123-ghh-01 | Information disclosure / injection | FieldFeedback lines in StepPenBody's chips | low | mitigate | The new text is blockedMessage, the lineage.js REQUIRED constant, rendered as a React text child. Task 3 counts added markup-injection lines in the app diff [EXPECT==0]. |
| T-261123-ghh-02 | Tampering | the pen's save path | low | mitigate | No change to penSaveBlock, penFieldsFromDraft, the repository seam or the store. Task 2's diff gate shows app/src/domain and app/src/store unchanged since BASE. U9 and U11 prove the next Save stores what was typed, and that a both-blank target is dropped, not stored. |
| T-261123-ghh-03 | Denial of service | the refused chip's layout | low | mitigate | A wrong grid could hide a field or the word. The board engine holds the three drawn panels within 1 px in WebKit and Chrome, with a selftest that must refuse. measure.mjs holds the two-target state. |
| T-261123-ghh-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. The measurement uses the playwright-core copy already in the npx cache, which the Phase 12 gate uses, and the installed Google Chrome. Neither is added to app/package.json. |
</threat_model>

<verification>
- Each task's automated commands pass as written.
- git log shows the red test commit, the fix commit and the SUMMARY commit, each in English with the two attribution lines.
- git show --stat for the app commits lists only the four app files.
- No Vite dev or preview server was started, port 4173 was not contacted, and app/dist is untouched.
- Nothing under .planning/phases or .planning/sketches changed.
</verification>

<success_criteria>
- In Next version, a refused target says Required under its blank side, inside the chip, wired with aria-invalid and aria-describedby, with focus in the field, as the creation editor says it.
- Every open-step chip is the snapshot's flowing grid. A changed value's struck value keeps one line.
- The built page matches pen-target-required.html's three drawn panels within 1 px in WebKit and Chrome.
- The undrawn two-target state is measured and behaves as stated.
- Full suite green. GATE2 PASS. Nothing outside the item changed.
</success_criteria>

<output>
Create `.planning/quick/261123-ghh-pen-refused-target-says-required-mark-approved-look-p12-pen/261123-ghh-SUMMARY.md` when done, and commit it (Task 3).
</output>
