---
phase: quick-261101-nrh
plan: 01
quick_id: 261101-nrh
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs
  - app/src/ui/CreationPage.jsx
  - app/src/ui/CreationSteps.jsx
  - app/src/ui/CreationSetup.jsx
  - app/src/ui/IngredientPicker.jsx
  - app/src/styles/notebook.css
  - app/src/ui/CreationFlow.test.jsx
  - app/src/ui/CreationSetup.test.jsx
  - app/src/ui/CreationSteps.test.jsx
  - app/src/ui/EditFlow.test.jsx
  - app/src/ui/IngredientPicker.test.jsx
autonomous: true
requirements:
  - bug-ipad-tab-lost-from-single-line-fields

must_haves:
  truths:
    - "In the creation editor (/notebook/new, and Edit version, which renders the same CreationPage), these nine field sites are one-row textarea elements (rows '1'): Recipe name and Version name (CreationPage.jsx); a step's target label and value (CreationSteps.jsx, also cols '20'); a scale's Name, Low end and High end and a problem's Name (CreationSetup.jsx CardField); each style target's low and high end, 12 fields (CreationSetup.jsx, inputmode 'decimal'); Serving temperature (CreationSetup.jsx, inputmode 'decimal'); the picker's Name filter (IngredientPicker.jsx). Each keeps its class, aria-label, value, aria-invalid and aria-describedby wiring, and every other attribute it had: disabled on both band fields, required on Version name, inputMode on the ends, the ref, autoComplete off, spellCheck false and enterKeyHint search on the picker's Name. Source: .impeccable/proposals/2026-11-01-one-line-fields.md sections 2 to 5, DESIGN.md Fields 'One-line field'."
    - "Serving temperature follows Mark's answer on decide-one-line-fields (serving-only, 2026-11-01): a one-row textarea with inputmode decimal and class 'ink-field mk-signed-field', no type, no step, no wheel or input-event handling. It stores the typed text with line breaks removed (a lone minus is kept as typed), still shows a kept draft's unreadable-number constant as blank, and stays 84 px wide through a class rule in notebook.css. Out of machine and Temperature in BatchRow.jsx stay number inputs."
    - "Return in every switched field inserts nothing: an Enter keydown outside IME composition, with or without a modifier, has its default prevented (holdReturn from app/src/ui/oneLineField.js) and focus stays. Any LF or CR that arrives by paste or any other edit is removed before it reaches the draft (stripNewlines). Return did nothing at any of these sites before: Recipe name sits in no form, and Version name and the picker's Name sit in forms whose submit is prevented."
    - "Every focus request still reaches its field: a refused Save focuses Recipe name, Version name, the picker's Name (while the picker is open), a scale's Name, Low end or High end, or a problem's Name; Add scale and Add problem focus the new card's Name; opening the picker and Clear filters focus Name. Proven by the existing CreationFlow, EditFlow, CreationSetup and IngredientPicker focus tests passing after the selector sweep."
    - "The fields look as they do at the base build. The 261101-nrh probe compares an after build against a base build in Playwright WebKit and Chrome (channel 'chrome') at 1366x1024 fine, coarse and coarse DPR 2, and prints 0 FAIL: each field's box, its parent's, its grandparent's and each sibling's within 0.5 px against its region, empty and filled; computed type, colour, padding, borders equal; text ink within 1 device px; :focus-visible and outline equal after a click; Tab lands on the same next control. The one ruled difference is the two target fields' width (spec section 3 duty 4): 0 to 1 px narrower in WebKit and 0 to 4 px in Chrome, printed as INFO, with the chip's later boxes compared after that shift."
    - "No other field changes. Non-test .jsx under app/src counts 9 fewer input-element openings and 9 more textarea-element openings than at Step 0 (26 and 18 at planning HEAD 83a786b3, so 17 and 27), and git shows no change under app/src outside this plan's ten app files. The version pen, record pen, Rename, Notebook, Ingredients and Search fields belong to sibling items 261101-nri, -nrj and -nrk."
    - "npm --prefix app test passes. At planning HEAD 83a786b3: 4259 tests in 130 files. After: 130 files and at least 4259 tests; the two Serving temperature tests that pinned the number input are rewritten to the new behaviour, not deleted."
    - "Device-verified only by Mark, deferred to the orchestrator: on his iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off) Tab leaves each switched field for the next control, and Serving temperature's on-screen keyboard shows a minus key (spec section 2: if it does not, the field drops the inputmode)."
  artifacts:
    - path: app/src/ui/CreationPage.jsx
      provides: "Recipe name and Version name as one-row textareas; findRefusedField selects the textareas for recipeName, versionName, the picker fallback, scaleField name/low/high and problem"
      contains: "onKeyDown={holdReturn}"
    - path: app/src/ui/CreationSteps.jsx
      provides: "The open step's target label and value fields as one-row, 20-column textareas"
      contains: "cols=\"20\""
    - path: app/src/ui/CreationSetup.jsx
      provides: "CardField, Serving temperature and the twelve band ends as one-row textareas; the add-card focus effect selects the textarea"
      contains: "mk-signed-field"
    - path: app/src/ui/IngredientPicker.jsx
      provides: "The picker's Name filter as a one-row textarea"
      contains: "onKeyDown={holdReturn}"
    - path: app/src/styles/notebook.css
      provides: "Token-only duties 1, 2 and 4: one scrolled line, the line centred in the coarse floor per field family, the target fields' fixed sizing, and the signed field's width by class"
      contains: "mk-signed-field"
    - path: .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs
      provides: "Record and check of every switched field against a scratch base build, in WebKit and Chrome"
      contains: "record"
  key_links:
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/oneLineField.js
      via: "onKeyDown={holdReturn}; onChange hands stripNewlines(event.target.value) to setField"
      pattern: "stripNewlines"
    - from: app/src/ui/CreationSetup.jsx
      to: app/src/ui/oneLineField.js
      via: "CardField, the temperature and the ends take onKeyDown={holdReturn}; handleScaleField, handleProblemName, handleTemperature and handleBandEnd read stripNewlines(event.target.value)"
      pattern: "stripNewlines"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/CreationSetup.jsx
      via: "findRefusedField's scaleField and problem cases, and CreationSetup's own add-card focus effect, select the card fields as textareas by aria-label"
      pattern: "textarea\\[aria-label=\"Name\"\\]"
    - from: app/src/styles/notebook.css
      to: app/src/styles/app.css
      via: "app.css's (pointer: coarse) floor gives .ink-field min-height --touch-min and 16 px text; notebook.css's coarse padding-block rules centre the textarea's one line in that floor, as the input centred its own"
      pattern: "padding-block: max\\(var\\(--app-notebook-gap-tight\\)"
---

<objective>
Mark's answer on bug-ipad-tab-lost-from-single-line-fields ("fix": Sid rules on the field kind, then a quick-batch switches them) and on decide-one-line-fields (serving-only, 2026-11-01). This item switches the creation editor's remaining one-line fields. Siblings 261101-nri, -nrj and -nrk switch the version pen, the record pen, and the Notebook, Ingredients and Search fields.

Root cause, device-verified on Mark's iPad (.planning/debug/ipad-magic-keyboard-tab-create.md): iPadOS 27 Safari drops a hardware Tab from every input element and sends focus out of the page, while a one-row textarea takes it. Quick 261101-lec switched the creation lead-in and grams fields this way (helper app/src/ui/oneLineField.js, tokens-only CSS in notebook.css) and Mark passed them on the iPad. Sid's ruling (.impeccable/proposals/2026-11-01-one-line-fields.md) extends that to every remaining one-line field, with five CSS duties so each keeps its look.

The nine sites here, at HEAD 83a786b3:
- CreationPage.jsx 657 Recipe name, 690 Version name.
- CreationSteps.jsx 123 and 133, a step's target label and value.
- CreationSetup.jsx 47 CardField (a scale's Name, Low end, High end; a problem's Name), 176 Serving temperature, 202 and 213 each style target's low and high end.
- IngredientPicker.jsx 60, the picker's Name filter.

The CSS duties that touch these fields:
- Duty 1, one scrolled line, applies to all of them.
- Duty 2, the line centred in the coarse floor, applies in two families. The labelled-above notebook-field family: the band names, the card fields, the picker's Name and the temperature, 8 px padding with 1 px app rules. The 2 px-padded ink family: the targets and the style ends.
- Duty 4, the width the input took, applies to the targets (no CSS width, so they need cols 20 and fixed sizing) and to the temperature (its width rule keyed on the number type moves to a class).
- Duty 3, block parents, does not apply: every field here sits in a flex or grid parent. Duty 5, the placeholder, does not apply: no field here has one. The probe's parent and sibling gates prove both.

Claude's discretion, recorded:
- Serving temperature drops the onInput and onWheel handlers with type and step. Both existed only for the number input: React's onChange missed a lone minus, and a wheel changed the number. A textarea reports every keystroke and ignores the wheel. A lone minus is now stored as typed, and Save already saves null for any text that is not a finite number (servingTemperature in app/src/domain/creationSave.js). shownSignedValue stays on the value, so a kept draft holding the old unreadable-number constant still shows blank.
- The CSS duties are written per field family inside the creation page's own scope (.notebook.mk-page, .mk-step, .mk-band__ends). They reach exactly this item's fields and the creation editor's 261101-lec grams. Siblings can widen these selector lists rather than add parallel rules.
- No shared helper is added. oneLineField.js is reused as it is. The submit-on-Return variant for the Notebook's New recipe Name and Sheet code is 261101-nrk's own.

Purpose: with the Magic Keyboard on the iPad, Tab moves on from every one-line field of the creation editor. Nothing looks different.
Output: a probe and its base/after evidence; the nine sites as one-row textareas; four selector moves in CreationPage and one in CreationSetup; token-only CSS; a test sweep with new tests. There are three commits, one per task.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.impeccable/proposals/2026-11-01-one-line-fields.md
@.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs
@.planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs
@.planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-SUMMARY.md
@app/src/ui/oneLineField.js
@app/src/ui/IngredientPicker.jsx

Read by range, not whole:
- 261101-lec-PLAN.md in the same quick folder, the Task 1 action's Steps 0 to 2: the probe's shape, the scratch build commands and the stop rule.
- app/src/ui/CreationPage.jsx:
  - lines 55-100, findRefusedField. The cases to change are recipeName (62), versionName (64), the picker fallback in ingredients (69), the scaleField map's name, low and high (87-89; kind at 90 stays a radio), and problem (96). The line case at 72 and the step cases at 74-80 are already tag-neutral or textarea.
  - lines 650-705: the band's Recipe name label, and the ceremony form whose onSubmit is prevented, holding Version name.
- app/src/ui/CreationSteps.jsx lines 1-25 (imports, with holdReturn and stripNewlines already imported at line 7; targetFieldName) and 108-160 (the target chip: label field, its FieldFeedback, value field, its FieldFeedback, Remove; then Add target with aria-label `Step N, Add target`).
- app/src/ui/CreationSetup.jsx:
  - lines 1-58: imports, with readSignedInput and shownSignedValue at line 3, and CardField.
  - lines 61-80: the add-card focus effect, line 78.
  - lines 96-139: handleScaleField at 98, handleProblemName at 117, handleTemperature at 129-134 with its comment, handleBandEnd at 136.
  - lines 170-224: Serving temperature inside label.notebook-field > span.mk-field-row with span.mk-unit, then the twelve ends in span.mk-band__ends.
- app/src/styles/notebook.css:
  - 216-249: 261101-lec's rules. Its top-level grams one-line rule is at 245-248.
  - 260-292: the creation target chip grid.
  - 343-360: the picker's filters.
  - 500-520: .mk-field-row. Line 513 holds the signed field's width rule, an attribute selector on the number type.
  - 562-570: .mk-band__ends.
  - 747-762: the .notebook-field base rule, which applies to input and textarea alike.
  - 2034-2066: the (pointer: coarse) block. 261101-lec's grams centring rule is at 2048-2050, and the notebook-field font-size rule is at 2062-2066.
  - app/src/styles/notebook.test.js lines 24-55 hold its guards: every rule's selector starts with .notebook (a selector list passes if its first selector does); no bare px; no hex; exactly five @media conditions in order. So add no @media block.
- app/src/styles/app.css:
  - 314-321: the global textarea rule, field-sizing content and resize none.
  - 1169-1177 and 1240-1243: .target-chip, and the target fields' width auto.
  - 1554-1570: .ink-field, with padding --gap-hair/--gap-xs, border --rule-ink-field, line-height --sheet-leading-field and min-height --sheet-field-min-h.
  - 2491-2550: the coarse floor, which gives .ink-field min-height --touch-min and font-size --sheet-type-note.
  - 259-267: the number-input rules. They stay for BatchRow's two signed fields; binder.test.js line 254 pins them.
- Tests, by line (HEAD 83a786b3):
  - CreationFlow.test.jsx: 180-197 (field, and the type helper, which is already tag-aware), 1318-1330 (the Style describe and its temperature helper), 1443-1476, 1940-1990, 2036-2052 and 2186-2205.
  - CreationSetup.test.jsx: 60-75 (its type helper is tag-neutral) and 106-135, the two Serving temperature tests that pin the number input. Also 194-216 and 430-470.
  - CreationSteps.test.jsx: 82-92 (tag-neutral helpers), 140-190 (target tests; held.method[0].targets holds label/value objects) and 428-480 (261101-lec's one-row describe, with its keydown helper).
  - EditFlow.test.jsx: 688-740.
  - IngredientPicker.test.jsx: 40-50, 112-155 and 218-235.

Rules already checked at planning that reach the new textareas:
- notebook.css .notebook-field rules list input and textarea alike (base and coarse), so the labelled-above fields lose nothing.
- No rule in app.css, notebook.css or shell.css targets an untyped input element.
- The number-type rules in app.css only hide spin buttons and set the Firefox appearance.
- The global ::placeholder rule is irrelevant: no field here has a placeholder.
- The only textarea-specific rules that could reach these fields are app.css's global textarea rule (field-sizing content, resize none) and notebook.css's .notebook-field textarea. The fields with a CSS width (width 100% or a figure width) keep it under field-sizing content. The targets, which have width auto, need duty 4.
- .notebook-band__grid is minmax(0, fr) at 1366, so no column sizes to a field's content there.
</context>

<interfaces>
Helper, unchanged (app/src/ui/oneLineField.js):
- holdReturn(event) prevents the default of an Enter keydown unless an IME is composing (nativeEvent.isComposing, or keyCode 229). It never stops propagation.
- stripNewlines(text) removes every LF and CR.

Pattern, as 261101-lec wired it (CreationSteps.jsx lines 85-95, the lead-in): a textarea with rows="1", onKeyDown={holdReturn}, and onChange passing stripNewlines(event.target.value) on. Every other attribute is kept, and no type attribute is written.

The switched fields, by the selectors the probe and tests use. Every one is tag-neutral, so it finds the input in the base build and the textarea after:
- band:
  - `.notebook.mk-page [aria-label="Recipe name"]`
  - `.notebook.mk-page [aria-label="Version name"]`
  - anchor `header.notebook-band`
- targets (after Add step, then `Step 1, Add target`):
  - `[aria-label="Step 1, target label"]`
  - `[aria-label="Step 1, target value"]`
  - anchor `li.mk-step`
- style:
  - `[aria-label="Serving temperature, degrees Celsius"]`
  - the twelve `section[aria-label="Style"] .mk-band__ends .ink-field`, named `<figure label>, target low|high`
  - anchor `section[aria-label="Style"]`
- cards (after Add scale and Add problem):
  - `section[aria-label="Scales"] .mk-card[aria-label="Scale 1"] [aria-label="Name"]`, likewise `[aria-label="Low end"]` and `[aria-label="High end"]`
  - `section[aria-label="Problems"] .mk-card[aria-label="Problem 1"] [aria-label="Name"]`
  - anchors: the two sections
- picker (after Add ingredient, `.ingredient-table-region .mk-head-act`):
  - `.ingredient-table-region .pick .ing__field:not(.ing__field--category) .ink-field`
  - anchor `.pick`

Draft shapes the new tests assert on:
- CreationSetup.test.jsx: held.serveTempC is a string; held.targets[targetKey] is [low, high]; held.scales[0].name, .low and .high; held.problems is an array of strings.
- CreationSteps.test.jsx: held.method[0].targets is an array of { label, value }.
</interfaces>

<tasks>

<task type="tracer">
  <name>Task 1: Recipe name and Version name as one-row textareas, end to end, measured against the base build</name>
  <files>.planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs, app/src/ui/CreationPage.jsx, app/src/styles/notebook.css, app/src/ui/CreationFlow.test.jsx</files>
  <precondition>git status --porcelain app/src prints nothing, so the base build is HEAD; /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs exists (the probe checks it and fails loudly otherwise).</precondition>
  <action>
Step 0, before any edit under app/:
- Let S be /private/tmp/sprinkles-261101-nrh. Create it.
- Write `git rev-parse HEAD` to S/head-before.
- Write the count of input-element openings in non-test .jsx under app/src to S/inputs-before, and the count of textarea-element openings to S/textareas-before. Use the same grep -rho command as Task 3's verify, with include '*.jsx' and exclude '*.test.jsx'. At planning these were 26 and 18.
- Record the mtime of app/dist/index.html (stat -f %m; 1793568668 at planning).
- Record the full suite's totals from npm --prefix app test (4259 tests in 130 files at planning, all passing).
- Never build into app/dist. Never contact port 4173: Mark's vite preview (pid 31386 at planning) serves app/dist. Never start vite dev or vite preview. The only Vite runs in this plan are builds into S, and each exits.

Step 1, write the probe at .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs. Model it on 261101-lec's probe. Keep its:
- usage header listing every gate;
- PLAYWRIGHT_CORE default and existence check;
- startServers({ appRoot }) from ../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs on ephemeral 127.0.0.1 ports, with every request to another host aborted;
- clickUntil (Chrome's first click after a navigation often misses), focusByClick, execInsert (document.execCommand insertText, because Playwright's insertText presses Enter in WebKit), settle, and ink() with the 2 px inset for bordered fields;
- one fresh context per config;
- record and check modes, with PROBE_DIST naming the build.
Take Sid's measure from his probe: the field box, its parent's and grandparent's boxes, each sibling's box (element children, and non-blank text nodes through a Range), the padding box, and the computed style. Make two changes:
- Every box is relative to the field group's anchor element (the interfaces section), and the anchor's own height is recorded. A shift anywhere in the region then shows, whatever the scroll.
- Never pin a width or restyle anything. The probe compares two real builds.
Output is PASS, FAIL and INFO lines ending "N PASS, M FAIL", with exit 1 on any FAIL. Everything typed or printed is English.

Engines: webkit, and chromium with channel 'chrome'. Both are required: a launch failure is a FAIL line.

Configs, all gated: 1366x1024 fine; 1366x1024 coarse (hasTouch true); 1366x1024 coarse at DPR 2.

Flow per config:
- Go to /notebook, press New recipe, fill Name with 'Probe sorbet', press Start, and wait for .mk-page.
- Press the Instructions head's Add step, then `Step 1, Add target`, then Add scale, then Add problem.
- Blur document.activeElement.
- Pass 1, empty: measure every band, targets, style and cards field as the flow leaves it. Recipe name holds 'Probe sorbet', Version name holds 'Version 1', and the rest are blank, so Required lines stand where they stand.
- Fill every blank field:
  - a decimal field (an end): '12.5';
  - Serving temperature: '-12.5';
  - any other: '12 Wq'.
- Pass 2, filled: measure them again, with ink.
- Then, field by field, run the behaviour checks below, restoring each field's filled value after each check.
- Last, press Add ingredient. Measure the picker's Name empty and filled ('12 Wq') and run its checks.

Record per field, per pass:
- the tag;
- the attributes (rows, cols, type, inputmode, class, aria-label, aria-describedby, aria-invalid, required, disabled, autocomplete, spellcheck, enterkeyhint);
- the boxes as above;
- the computed font-family, font-size, font-weight, line-height, color, text-align, padding (all four), border widths, border-top-color, background-color, border-radius, resize and white-space;
- the scrollbar figures: offsetWidth minus clientWidth minus the side borders, and the same for height;
- pass 2 only: the text ink box within the padding box, in device px.

Behaviour checks per field:
- K: click into the field. Record matches(':focus-visible') and the computed outline-style, outline-width and outline-offset.
- N: with the field focused by click, press Tab. Record the newly focused element's aria-label, or else its trimmed text, or else its tag and class.
- R: focus the field, press Enter, then Shift+Enter. Record the value and whether the field still has focus.
- P: fill '' and execInsert a line feed between two parts. A decimal field or the temperature takes '1', LF, '2'. Any other takes 'Probe', LF, 'text'. Record the value.
- L: fill '', focus, and keyboard.type a long value. A decimal field or the temperature takes sixteen digits. Any other takes 'The long probe text keeps going past the right edge of this field'. Record the height, scrollLeft and the scrollbar figures.

check takes --base <base.json> and --field with a comma list of band, targets, style, cards and picker, or all (the default). Gates, after against base, per engine and config and field, each line printing both figures:
- F0: after's tag is TEXTAREA with rows '1' and no type attribute. inputmode is 'decimal' on the twelve ends and Serving temperature, and absent elsewhere. cols is '20' on the two target fields. Every other recorded attribute equals base's, except that Serving temperature's class gains mk-signed-field. Base's tag is printed as INFO.
- F1: matchMedia('(pointer: coarse)') equals hasTouch.
- E1 (pass 1) and B1 (pass 2): the field, parent, grandparent and sibling boxes, and the anchor height, within 0.5 px.
- C1: the computed list is equal. On after only: resize is none, white-space is pre, and both scrollbar figures are 0.
- I1: the ink box is within 1 device px.
- K1: equal.
- N1: the same next control. Print its name as INFO for the SUMMARY's device steps.
- R1: the value is unchanged and focus is kept, in both builds.
- P1: after's value is the two parts joined with nothing between them ('12' or 'Probetext'). Base's value is printed as INFO: the engines' inputs turn the LF into a space, as 261101-lec found.
- L1: on after, the height equals after's pass-2 height within 0.5 px, scrollLeft is greater than 0, and the scrollbars are 0. Base's scrollLeft is printed as INFO. WebKit inputs scroll internally and report 0.

The one ruled exception (spec section 3, duty 4, ruled acceptable by Sid) covers the two target fields:
- Each target field's width may be narrower than base's by 0 to 1 px in WebKit and 0 to 4 px in Chrome. Print the difference as INFO.
- Inside the chip, the later boxes may shift left by the accumulated difference, and the chip's own width may shrink by it. Their left and width are compared within 0.5 px after adding that accumulated difference back.
- Every vertical figure, and every other box, is gated as usual.
Long-text ink is never compared: a value wider than its box shows 2 to 4 px more of itself, which spec section 3 rules acceptable.

Step 2, record the base, still with no app/ edit:
- npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrh/base-dist --emptyOutDir
- PROBE_DIST=/private/tmp/sprinkles-261101-nrh/base-dist node <probe> record /private/tmp/sprinkles-261101-nrh/base.json
Both engines must record all three configs and all five groups. If a flow step fails at the base, fix the probe, not the app.

Step 3, CreationPage.jsx:
- Turn the Recipe name input element (line 657) and the Version name input element (line 690) into textarea elements. Drop type and add rows="1".
- Keep className, disabled, required (Version name), value, aria-label, aria-invalid and aria-describedby exactly.
- onChange passes stripNewlines(event.target.value) to setField. Add onKeyDown={holdReturn}. Import both from './oneLineField.js'.
- In findRefusedField, the recipeName and versionName cases select the textarea element with the same aria-label: swap the tag in those two selectors, nothing else.
- Return did nothing in either field before (no form around Recipe name; the ceremony form's submit is prevented), so holding it keeps that (spec section 4).

Step 4, notebook.css. Tokens only. Every new selector begins with .notebook. No new @media block.
- Duty 1. After 261101-lec's top-level grams one-line rule (lines 245-248), add a rule for `.notebook.mk-page textarea.ink-field` declaring white-space: pre and overflow: hidden. Every field this item switches carries ink-field and sits inside the creation page root (Edit version renders the same root), so this one rule serves Tasks 2 and 3 too.
- Duty 2, labelled-above family. Inside the existing (pointer: coarse) block, after 261101-lec's grams centring rule, add a rule for `.notebook.mk-page .notebook-field textarea.ink-field` declaring padding-block: max(var(--app-notebook-gap-tight), calc((var(--touch-min) - var(--sheet-leading-field) * 1em - 2 * var(--app-rule-row)) / 2)).
  - Why: at a coarse pointer these fields are 16 px on the 1.35 line, padded 8 px, with 1 px app rules, in the 44 px floor. The input centred its line (10.2 px each side). A textarea starts it at the top, 2 px high (spec duty 2).
  - This rule also serves the card fields, the temperature and the picker's Name in Tasks 2 and 3.
- Comment each rule briefly with bug-ipad-tab-lost-from-single-line-fields and its duty number.

These are the planning candidates. The probe is the acceptance. If a gate fails, adjust with tokens only and re-run. If no token-only rule passes a gate, stop: report the gate and its numbers in the SUMMARY, do not loosen a tolerance, and do not commit the failing state.

Step 5, CreationFlow.test.jsx. Add a describe naming bug-ipad-tab-lost-from-single-line-fields, using the file's startVanilla, field and type helpers and a keydown helper like CreationSteps.test.jsx's (lines 430-440):
- Recipe name and Version name each have tagName TEXTAREA, rows '1', no type attribute and class ink-field, and Version name keeps required.
- A cancelable Enter keydown is default-prevented on each, and so is one with shiftKey. The values are unchanged.
- type(field('Recipe name'), text holding a LF and a trailing CRLF) leaves the field's value with every line break removed, and the same holds for Version name.
- The existing refused-Save tests (about lines 1940-1972) and EditFlow.test.jsx line 708 must keep passing unchanged: they prove findRefusedField reaches the textareas.

Step 6, verify (see below), then commit. Use git add with the four explicit paths only, never -A: untracked .review-diagnostics and quick-batches folders sit under .planning. The message is English: "fix: the creation band's Recipe name and Version name are one-row textareas, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2. Do not commit this PLAN or the SUMMARY.
  </action>
  <verify>
    <automated>npm --prefix app test -- CreationFlow EditFlow Shell.creationGuard styles && test "$(grep -o '<input' app/src/ui/CreationPage.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/CreationPage.jsx | wc -l | tr -d ' ')" = 3 && test "$(grep -cE 'input\[aria-label="(Recipe name|Version name)"\]' app/src/ui/CreationPage.jsx)" = 0 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrh/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrh/after-dist node .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs record /private/tmp/sprinkles-261101-nrh/after.json && node .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs check /private/tmp/sprinkles-261101-nrh/after.json --base /private/tmp/sprinkles-261101-nrh/base.json --field band</automated>
  </verify>
  <done>
- The probe's band check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2.
- base.json holds all five groups in both engines.
- The targeted suites pass, including notebook.test.js.
- CreationPage.jsx counts 0 input openings (HEAD 2) and 3 textarea openings (HEAD 1).
- One commit holds the four files.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The step's targets and the Style region's fields (Serving temperature and the twelve ends) as one-row textareas</name>
  <files>app/src/ui/CreationSteps.jsx, app/src/ui/CreationSetup.jsx, app/src/styles/notebook.css, app/src/ui/CreationSteps.test.jsx, app/src/ui/CreationSetup.test.jsx, app/src/ui/CreationFlow.test.jsx</files>
  <behavior>
    - A step's target label and value fields are TEXTAREA with rows '1', cols '20', no type attribute, and classes 'ink-field target-chip__label-field' and 'ink-field target-chip__value-field'. They are found by their aria-labels ('Step 1, target label' when the step has one target).
    - Enter, plain or with Shift, is default-prevented on a target field. Typing 'te', LF, 'mp' leaves held.method[0].targets[0].label as 'temp'.
    - Serving temperature is a TEXTAREA with rows '1', inputmode 'decimal', no type or step attribute, and class 'ink-field mk-signed-field'.
    - A lone '-' typed into Serving temperature is stored and shown as '-'. '-16' then replaces it. '-1', LF, '6' stores '-16'.
    - A draft whose serveTempC is MALFORMED_NUMBER_ENTRY shows the field blank.
    - A wheel over the focused temperature field leaves it focused: the number input's wheel guard is gone with the number input.
    - Each of the twelve ends is a TEXTAREA with rows '1' and inputmode 'decimal'. Enter is default-prevented on an end. '1', LF, '2' stores '12' in that end of held.targets.
    - The existing tests pass after their setter fix: the Style region's "two band edits in one React batch both land" and "Clear and a temperature edit in one React batch both land" (CreationFlow), and every targets and Style test.
  </behavior>
  <action>
This task touches six files. Three are test files whose selector or setter changes must land in the same commit, or the suite goes red between commits.

RED first.
- CreationSteps.test.jsx: add tests for the target fields per the behaviour above, inside or beside 261101-lec's one-row describe (about line 428), using its keydown helper and the file's withStep(blank(), {}, [['', '']]) shape.
- CreationSetup.test.jsx:
  - Rewrite the two Serving temperature tests (about lines 108-134) to the behaviour above. Rewrite them; do not delete them. The lone-minus test becomes the textarea, lone-minus and kept-draft test, which keeps the MALFORMED_NUMBER_ENTRY import in use. The wheel test becomes "a wheel over the focused temperature field leaves it focused".
  - Add a describe for the ends.
- Run the tests and see them fail against the input elements.

GREEN.
- CreationSteps.jsx, lines 123-141: turn both target input elements into textarea elements.
  - Drop type. Add rows="1" and cols="20" (spec duty 4: the input took the browser's default width of 20 characters).
  - Keep className, value, aria-label, aria-invalid and aria-describedby exactly.
  - onChange passes stripNewlines(event.target.value) to onChangeTarget. Add onKeyDown={holdReturn}; both are already imported at line 7.
- CreationSetup.jsx: import holdReturn and stripNewlines from './oneLineField.js'.
  - Serving temperature, lines 174-187 (Mark's serving-only answer on decide-one-line-fields):
    - Make it a textarea with rows="1", inputMode="decimal" and className "ink-field mk-signed-field".
    - Drop the number type, step, onInput and onWheel.
    - Keep aria-label, and keep value={shownSignedValue(createDraft.serveTempC)}.
    - onChange={handleTemperature}, plus onKeyDown={holdReturn}.
  - handleTemperature (lines 129-134) reads stripNewlines(event.target.value) and stores it as serveTempC. Rewrite its comment. It now says the field is a one-row textarea for the iPad's Tab: it hands over every keystroke, a lone minus included, and Save reads the text, saving null for anything that is not a finite number.
  - Remove readSignedInput from the BatchRow.jsx import at line 3. This change leaves it unused here; BatchRow keeps it for its own signed fields.
  - The twelve ends, lines 202-219: textarea elements. Drop type, add rows="1", and keep inputMode="decimal", className, aria-label and value. Add onKeyDown={holdReturn}. handleBandEnd (line 136) reads stripNewlines(event.target.value).
- notebook.css, tokens only, with selectors beginning .notebook and no new @media block:
  - Duty 4, targets. After the creation chip grid rules (about line 292), add a rule for `.notebook .mk-step textarea:is(.target-chip__label-field, .target-chip__value-field)` declaring field-sizing: fixed. Comment: app.css gives these fields width auto, so the input took the browser's 20-character width. A fixed-size textarea of 20 columns keeps it, narrower by under 1 px in WebKit and 3 to 3.5 px in Chrome, which spec duty 4 rules acceptable.
  - Duty 4, temperature. In the signed field's width rule at line 513, replace the selector's attribute part with the class: the selector becomes `.notebook .mk-field-row .ink-field.mk-signed-field`. Its specificity is unchanged. Keep the declaration and the comment above it.
  - Duty 2, the 2 px-padded ink family. Inside the existing (pointer: coarse) block, add `.notebook .mk-step textarea.ink-field` and `.notebook .mk-band__ends textarea.ink-field` to the selector list of 261101-lec's grams centring rule (about lines 2046-2050). Its padding-block formula (--gap-hair padding, two --rule-ink-field rules) is already the family's. Reword that rule's comment to name the family and both bug ids.
  - The temperature takes Task 1's labelled-above rule (it sits in label.notebook-field), and duty 1 is Task 1's rule. Add nothing for those.
- CreationFlow.test.jsx, lines 1447 and 1468: both tests take the value setter from a prototype that matches the element. Use HTMLTextAreaElement's prototype, or the tag-aware choice the file's type helper makes at line 192. Nothing else in those tests changes.

The probe is the acceptance, with the same stop rule as Task 1. If the probe needed a fix, add it to this commit by its path.

Commit with git add of the explicit paths only. The message is English: "fix: the creation step's targets and the Style region's fields are one-row textareas, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.
  </action>
  <verify>
    <automated>npm --prefix app test -- CreationSetup CreationSteps CreationStructure CreationFlow EditFlow styles && test "$(grep -o '<input' app/src/ui/CreationSteps.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/CreationSteps.jsx | wc -l | tr -d ' ')" = 6 && test "$(grep -o 'cols="20"' app/src/ui/CreationSteps.jsx | wc -l | tr -d ' ')" = 2 && test "$(grep -o '<input' app/src/ui/CreationSetup.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o '<textarea' app/src/ui/CreationSetup.jsx | wc -l | tr -d ' ')" = 3 && test "$(grep -c 'type="number"' app/src/ui/CreationSetup.jsx)" = 0 && test "$(grep -c "type='number'" app/src/styles/notebook.css)" = 0 && test "$(grep -c 'mk-signed-field' app/src/styles/notebook.css)" -ge 1 && test "$(grep -o 'HTMLInputElement.prototype' app/src/ui/CreationFlow.test.jsx | wc -l | tr -d ' ')" = 1 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrh/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrh/after-dist node .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs record /private/tmp/sprinkles-261101-nrh/after.json && node .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs check /private/tmp/sprinkles-261101-nrh/after.json --base /private/tmp/sprinkles-261101-nrh/base.json --field band,targets,style</automated>
  </verify>
  <done>
Baselines at HEAD 83a786b3, measured at planning:
- The probe's band, targets and style check prints 0 FAIL for webkit and chrome at all three configs. The target width differences are printed as INFO.
- CreationSteps.jsx: input openings 2 to 0; textarea openings 4 to 6; cols 20 written twice.
- CreationSetup.jsx: input openings 4 to 1 (CardField remains for Task 3); textarea openings 0 to 3; the number type 1 to 0.
- notebook.css: the number-type attribute selector 1 to 0; mk-signed-field 0 to 1.
- CreationFlow.test.jsx: input-element prototype setters 3 to 1 (the tag-aware helper keeps one).
- The two Serving temperature tests are rewritten, not deleted.
- One commit.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: The Scales and Problems cards' fields and the picker's Name as one-row textareas, the selector sweep, and the full proof</name>
  <files>app/src/ui/CreationSetup.jsx, app/src/ui/IngredientPicker.jsx, app/src/ui/CreationPage.jsx, app/src/ui/CreationSetup.test.jsx, app/src/ui/IngredientPicker.test.jsx, app/src/ui/CreationFlow.test.jsx, app/src/ui/EditFlow.test.jsx</files>
  <behavior>
    - A scale card's Name, Low end and High end and a problem card's Name are TEXTAREA with rows '1', class ink-field and no type attribute.
    - Enter is default-prevented on them. 'Crea', LF, 'miness' typed into a scale's Name stores 'Creaminess' in held.scales[0].name, and 'Bit', LF, 'ter' in a problem's Name stores ['Bitter'] in held.problems.
    - Add scale and Add problem put focus in the new card's Name textarea (CreationSetup's focus effect).
    - The picker's Name is a TEXTAREA with rows '1', autocomplete 'off', spellcheck 'false' and enterkeyhint 'search'.
    - Opening the picker and Clear filters focus it.
    - A cancelable Enter on it is default-prevented and picks nothing. Typing 'mi', LF, 'lk' filters as 'milk'.
    - aria-describedby follows describedBy as before.
    - Every refused-Save focus test still passes: the scale fields, the problem Name, and the picker's Name while the picker is open (CreationFlow and EditFlow).
  </behavior>
  <action>
This task touches seven files. Four are test-selector sweeps at named lines that must land with the change.

RED first.
- CreationSetup.test.jsx: add a describe for the card fields with the behaviour above, using its mount, q, type and region helpers.
- IngredientPicker.test.jsx: first update its own helpers and selectors to the textarea tag:
  - typeName (lines 43-48) selects the textarea with class ink-field and takes the value setter from HTMLTextAreaElement's prototype.
  - Lines 122, 134, 137 and 151 select the textarea with class ink-field.
  - Lines 225 and 231 select the textarea inside the filters form.
  Then add tests for the picker's Name with the behaviour above.
- Run them and see them fail.

GREEN.
- CreationSetup.jsx:
  - CardField (lines 40-58): the input element becomes a textarea. Drop type, add rows="1" and onKeyDown={holdReturn}, and keep the rest exactly. In its comment, "the input named by it" becomes "the field named by it".
  - handleScaleField (line 98) and handleProblemName (line 117) read stripNewlines(event.target.value).
  - The add-card focus effect (line 78) selects the textarea with aria-label Name.
- IngredientPicker.jsx, lines 60-70:
  - The input element becomes a textarea. Drop type and add rows="1".
  - Keep ref, className, aria-describedby, value, autoComplete, spellCheck and enterKeyHint exactly.
  - onChange calls setQuery(stripNewlines(event.target.value)). Add onKeyDown={holdReturn}, importing both from './oneLineField.js'.
  - Reword the JSX comment above the form (lines 57-58), which this change makes wrong: Name is a one-row textarea whose Return is held, and the form's submit stays prevented so nothing can reload the page.
- CreationPage.jsx, findRefusedField. Swap the tag only, nothing else:
  - The ingredients case's picker fallback (line 69) selects the textarea inside the picker's filters.
  - The scaleField map's name, low and high entries (lines 87-89) select the textarea with each aria-label. kind stays the radio.
  - The problem case (line 96) selects the textarea with aria-label Name.
- No CSS is added. Task 1's two rules (duty 1, and the labelled-above coarse centring) already reach the card fields and the picker's Name: both sit in label.notebook-field inside the creation page root.

Sweep the remaining tests that name these fields by the old tag. These are every hit at HEAD 83a786b3, by line:
- CreationSetup.test.jsx: 434, 439 and 441 (Scale 1 Name, High end, Low end), and 462 and 463 (Problem 1 and 2 Name).
- CreationFlow.test.jsx: 1985 and 2191 (the picker's Name), 2042, 2045, 2047 and 2050 (problem Names), and 2200 (the problemName helper).
- EditFlow.test.jsx: 692 (the problemName helper) and 737 (the picker's Name).
In each, the selector names the textarea tag. Selectors for the Kind radios (input of type radio) and for the uses checkboxes stay.

Then run:
- the full suite;
- every count gate in verify;
- a fresh after build;
- the probe with --field all.
Commit the seven files with git add of explicit paths only (plus the probe if it needed a fix). The message is English: "fix: the creation editor's scale and problem fields and the picker's Name are one-row textareas, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.

Write the SUMMARY at .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-SUMMARY.md. Leave it uncommitted. It records:
- the probe's tally per engine, config and group (PASS/FAIL counts), and the final "N PASS, M FAIL" line;
- the INFO lines for the target width differences and the base paste values, and the N1 next-control names;
- the test totals before (Step 0) and after;
- the three commit hashes;
- whether app/dist/index.html's mtime still equals Step 0's. If it differs, say whether any command of this plan wrote there: Mark may rebuild by hand between waves.
- A "Deferred Human Verification" section for the orchestrator's iPad check (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off, build served by preview --host; the executor never builds app/dist). Each step names the next control as the probe's N1 printed it:
  - From Recipe name, Version name, a target label, Serving temperature, a style end, a scale's Name and the picker's Name, Tab moves to the next control and not out of the page.
  - Return in each inserts nothing.
  - With the on-screen keyboard (keyboard detached), tapping Serving temperature shows a minus key. If it does not, the field drops the inputmode (spec section 2), and that goes to Mark.
  - Every field looks as it did on the previous build.
  There are no Mark's List writes in this plan: the executor has no ArtifactData.
- Notes for the orchestrator:
  - Sid's probe (.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs) selects by the input tag, so it no longer sees these fields. It was not edited.
  - No aria-multiline was added, as 261101-lec decided.
  - DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams". That line is Impeccable's to update after the batch.
  - The duty rules are scoped to the creation page. Siblings can widen their selector lists instead of adding parallel rules.
  </action>
  <verify>
    <automated>npm --prefix app test && test "$(grep -o '<input' app/src/ui/CreationSetup.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/CreationSetup.jsx | wc -l | tr -d ' ')" = 4 && test "$(grep -o '<input' app/src/ui/IngredientPicker.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/IngredientPicker.jsx | wc -l | tr -d ' ')" = 1 && test "$(cat app/src/ui/CreationPage.jsx app/src/ui/CreationSetup.jsx app/src/ui/CreationFlow.test.jsx app/src/ui/CreationSetup.test.jsx app/src/ui/EditFlow.test.jsx app/src/ui/IngredientPicker.test.jsx | grep -cE 'input\[aria-label="(Name|Low end|High end|Recipe name|Version name)"\]|ing__filters input')" = 0 && test "$(grep -c 'input\.ink-field' app/src/ui/IngredientPicker.test.jsx)" = 0 && test "$(grep -c 'HTMLInputElement.prototype' app/src/ui/IngredientPicker.test.jsx)" = 0 && test "$(grep -rho '<input' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrh/inputs-before) - 9 ))" && test "$(grep -rho '<textarea' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrh/textareas-before) + 9 ))" && CHANGED="$(git diff --name-only "$(cat /private/tmp/sprinkles-261101-nrh/head-before)" HEAD -- app/src)" && test -z "$(printf '%s\n' "$CHANGED" | grep -vE '^app/src/(ui/(CreationPage|CreationSteps|CreationSetup|IngredientPicker)\.jsx|ui/(CreationFlow|CreationSetup|CreationSteps|EditFlow|IngredientPicker)\.test\.jsx|styles/notebook\.css)$')" && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrh/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrh/after-dist node .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs record /private/tmp/sprinkles-261101-nrh/after.json && node .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs check /private/tmp/sprinkles-261101-nrh/after.json --base /private/tmp/sprinkles-261101-nrh/base.json --field all</automated>
  </verify>
  <done>
Baselines at HEAD 83a786b3, measured at planning:
- The full suite passes: 130 files, at least 4259 tests (Step 0's count plus the new ones), none deleted.
- CreationSetup.jsx: input openings 4 to 0; textarea openings 0 to 4.
- IngredientPicker.jsx: input openings 1 to 0; textarea openings 0 to 1.
- Input-tag selectors naming these fields: CreationPage.jsx 7 to 0, CreationSetup.jsx 1 to 0, and in the four test files 16 to 0.
- IngredientPicker.test.jsx: the input-class selector 5 to 0; the input prototype setter 1 to 0.
- App-wide non-test .jsx: input openings Step 0 minus 9 (26 to 17); textarea openings Step 0 plus 9 (18 to 27).
- No file under app/src outside the ten named ones changed since Step 0.
- The probe's --field all check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2.
- Three commits on main, and the SUMMARY carries the evidence and the deferred device check.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker input to draft | Typed or pasted text in the nine fields enters the creation draft and the kept draft in IndexedDB through the repository seam |
| scratch probe to network | The probe serves scratch builds on 127.0.0.1 and drives local browsers |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261101-nrh-01 | Tampering | the nine fields' onChange handlers | low | mitigate | stripNewlines removes every LF and CR before setField, onChangeTarget, the CreationSetup handlers or setQuery see the value, so no multi-line name, target, end, temperature or filter reaches the draft, the store or the Sheet's one-line projections. Values still render as React text (no dangerouslySetInnerHTML, per project convention), and the existing markup-as-text tests (CreationSetup.test.jsx about line 407, IngredientPicker.test.jsx about line 218) keep passing |
| T-261101-nrh-02 | Tampering | Serving temperature without the number type | low | accept | Any text now reaches serveTempC, as it already did for the twelve decimal ends. Save's servingTemperature (creationSave.js) stores null for anything that is not a finite number, so nothing malformed is written |
| T-261101-nrh-03 | Information disclosure | 261101-nrh-field-probe.mjs | low | mitigate | It serves only scratch builds under /private/tmp on ephemeral 127.0.0.1 ports via 08-walk-server.mjs, aborts every request to another host, never binds 0.0.0.0, and never contacts Mark's preview on 4173 |
| T-261101-nrh-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. playwright-core is the existing npx cache at the path the probe names, and PNG decoding runs in the browser |
</threat_model>

<verification>
- The automated commands of Tasks 1, 2 and 3 pass as written.
- `git log -3 --format=%s` shows the three fix commits. `git show --stat` on each lists only the files named in its task (plus the probe where a task fixed it).
- No vite dev or vite preview process was started, and port 4173 still has only Mark's preview listening.
</verification>

<success_criteria>
- The creation editor's nine remaining one-line field sites are one-row textareas that keep every attribute. Return and pasted line breaks leave each value on one line, and every focus request still lands.
- Serving temperature follows Mark's serving-only answer: a textarea with inputmode decimal, 84 px wide through a class.
- The probe proves box, neighbours, ink, focus ring, Tab order, Return, paste and long text against the base build in WebKit and Chrome at 1366 fine, coarse and coarse DPR 2, with 0 FAIL. The only differences are the ruled target-width ones.
- The full suite is green, and no other field in the app changed (count and diff gates).
- The iPad Tab check and the Serving temperature minus-key check are handed to the orchestrator as deferred human verification.
</success_criteria>

<output>
Create `.planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-SUMMARY.md` when done
</output>
