---
phase: quick-261101-lec
plan: 01
quick_id: 261101-lec
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs
  - app/src/ui/oneLineField.js
  - app/src/ui/CreationSteps.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/styles/notebook.css
  - app/src/ui/CreationSteps.test.jsx
  - app/src/ui/CreationStructure.test.jsx
  - app/src/ui/IngredientTable.creating.test.jsx
  - app/src/ui/CreationFlow.test.jsx
  - app/src/ui/EditFlow.test.jsx
  - app/src/ui/RecipeSheet.test.jsx
autonomous: true
requirements:
  - bug-p11-ipad-hardware-tab-skips-fields

estimate:
  tokens: 110000
  raw_tokens: 110000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "In the creation editor (/notebook/new, and Edit version, which renders the same CreationPage), each step's lead-in is a textarea element with rows=1, class 'prose-field prose-field--lead-in', data-field='lead-in' and aria-label 'Step N, lead-in'. Each creating row line's grams field is a textarea element with rows=1, inputmode='decimal', class 'ink-field' (plus 'mk-focus' on the line just picked) and aria-label '<name>, grams' (', portion k' on a split row). Both keep role textbox, their aria-invalid and aria-describedby wiring, their value, onChange and onBlur behaviour. Mark chose this scope on 2026-11-01 (bug-p11-ipad-hardware-tab-skips-fields)."
    - "No other input element changes. Non-test .jsx under app/src counts 28 input-element openings and 16 textarea-element openings at HEAD e0015f23; after, 26 and 18. Method.jsx keeps its 4 input openings, so the version pen's lead-in stays an input. The pen's grams field and the as-made field in IngredientTable.jsx also stay inputs (3 input openings there before, 2 after). The target-chip fields in CreationSteps.jsx stay inputs (3 before, 2 after)."
    - "Return in either field inserts nothing. Every Enter keydown outside IME composition, with or without modifier keys, has its default prevented: the value is unchanged and focus stays. An Enter during composition (nativeEvent.isComposing, or keyCode 229) is left alone. No form wraps either field, so before this change Return did nothing there, and preventing it keeps that. Any LF or CR that arrives by paste, insertText or any other edit is removed before it reaches the draft. This is HTML's own strip-newlines rule for a single-line input: removed, not replaced by a space."
    - "The two fields look as they do at HEAD. The 261101-lec probe compares the after build against the HEAD build in Playwright WebKit and Chrome (channel 'chrome') at 1366x1024 with a fine pointer, a coarse pointer, and a coarse pointer at DPR 2. In every run it prints 0 FAIL on these gates: each field's box (top and left against its step li or row tr, width, height) within 0.5 px; font family, size, weight, line-height, colour, text-align, horizontal padding and border widths equal; resize none; no scrollbar on either axis; the field's text ink bounding box within 1 device px; the step number's box within 0.5 px, and the gap between its ink bottom and the lead-in text's ink bottom within 1 device px; the instruction field's top, the Required line's box, the li height, the tr height, the ' g' text box and the name text's top within 0.5 px; focus outline and :focus-visible equal; text longer than the field stays on one line at the same height and scrolls to the caret. The 393x852 coarse run is recorded and reported, not gated."
    - "Focus requests still reach the fields. Add step, and Add step after a step, put focus in the new step's lead-in. A refused Save focuses a blank lead-in, or an empty or unreadable grams line. A row just picked takes focus in its grams field, which carries mk-focus. This is proven by the existing CreationFlow, CreationStructure and EditFlow focus tests passing after the selector updates, and by the probe's G5 gate."
    - "npm --prefix app test passes with no failure. At HEAD e0015f23: 4238 tests in 130 files. After: 130 files and 4238 plus the new tests, with no existing test deleted. tabindex-scan.test.js (D-19) passes unchanged: its scan reports buttons, links, radios and checkboxes only, and never a textarea or a text input, so this change cannot affect it."
    - "Device-verified only by Mark, deferred to the orchestrator's device check: on his iPad (iPadOS 27.0.1 Safari, Magic Keyboard, Full Keyboard Access off), Tab from a step's lead-in moves to that step's instruction, Tab from a row's grams field moves to the row's next control, and both fields look as before. Desktop engines cannot prove this."
  artifacts:
    - path: app/src/ui/oneLineField.js
      provides: "holdReturn(event): prevents the default of an Enter keydown outside IME composition. stripNewlines(text): removes every LF and CR"
      contains: "export function holdReturn"
    - path: app/src/ui/CreationSteps.jsx
      provides: "The open step's lead-in as a one-row textarea, with holdReturn and stripNewlines wired"
      contains: "rows=\"1\""
    - path: app/src/ui/IngredientTable.jsx
      provides: "The creating row line's grams field as a one-row textarea, with holdReturn and stripNewlines wired; the pen and as-made inputs untouched"
      contains: "rows=\"1\""
    - path: app/src/ui/CreationPage.jsx
      provides: "The 'lead-in' focus request and the refused-Save 'line' target select the textarea"
      contains: "textarea[aria-label=\"Step "
    - path: app/src/styles/notebook.css
      provides: "Token-only rules that keep the two textareas' box, text position and baseline equal to the inputs they replace"
      contains: "textarea.prose-field--lead-in"
    - path: .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs
      provides: "Record and check of both fields against a scratch HEAD build, in WebKit and Chrome"
      contains: "record"
  key_links:
    - from: app/src/ui/CreationSteps.jsx
      to: app/src/ui/oneLineField.js
      via: "onKeyDown={holdReturn}; onChange passes stripNewlines(event.target.value) to onChangeStepField"
      pattern: "holdReturn"
    - from: app/src/ui/IngredientTable.jsx
      to: app/src/ui/oneLineField.js
      via: "onKeyDown={holdReturn}; onChange passes stripNewlines(event.target.value) to handleCreatingGramsChange; the ref callback registerGramsInput still fills gramsInputsRef, which the creationFocusLine effect focuses"
      pattern: "stripNewlines"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/CreationSteps.jsx
      via: "focus effect request kind 'lead-in' (line 301) and findRefusedField case 'line' (line 72) select the new textareas; 'step-field' (line 313) and 'stepLeadIn' (line 74) already select by data-field"
      pattern: "textarea\\[aria-label=\"Step"
    - from: app/src/styles/notebook.css
      to: app/src/styles/app.css
      via: "app.css's .method-step grid aligns the number on its body's first baseline (quick 261031-fdd). The lead-in label as a flex column hands that grid the textarea's first-line text baseline, as the input's own baseline did. The grams wrapper as an inline-flex row aligns ' g' on the textarea's text baseline"
      pattern: "method-step__field:has"
---

<objective>
Mark's decision on bug-p11-ipad-hardware-tab-skips-fields (2026-11-01): fix the creation editor's step lead-in and its ingredient-row grams field only.

Root cause (.planning/debug/ipad-magic-keyboard-tab-create.md, Resolution and the Evidence for rounds 2b and 3, device-verified on Mark's iPad, Safari 27.0.1): iPadOS 27 Safari drops a Magic Keyboard Tab from every input element. That held for every type tried (text, search, number, tel, inputmode=decimal, inside a form, enterkeyhint): no keydown arrives, the window blurs, and focus leaves the page. A one-row textarea and a contenteditable div do receive keydown Tab, and focus moves on.

The change: both fields become one-row textarea elements. Each keeps its class, aria-label, value/onChange/onBlur and data attributes; grams also keeps inputMode="decimal", a global attribute. Return inserts no newline, and any newline is stripped on change. They must look exactly as they do now. Every other input element in the app stays as it is. A scope widening to the other single-line inputs is not part of this plan.

Planner's reading of "Enter without modifiers": a textarea inserts a newline for Shift+Return and Alt+Return as well, and the inputs inserted none for any Return. So holdReturn prevents every Enter keydown outside IME composition. If only the unmodified Enter were prevented, the onChange strip would still remove the newline, but React writing back the stripped value moves the caret to the end of the field. This keeps "whatever Return did before" exactly.

Planning measurements (synthetic pages, Playwright WebKit 26.6 and Chrome, 2026-11-01). They name the CSS candidate. They do not replace the probe on the real app.
- A textarea's inline baseline in WebKit is its bottom margin edge, not its text. Left inline, the grams field drops ' g' and grows the row by 3.3 px, and the lead-in adds a strut gap under itself. baseline-source: first changes nothing in WebKit. vertical-align: middle is about 2 px off. vertical-align: top moves the step number by 2 px at a fine pointer and 10 px at a coarse one, because app.css's .method-step grid aligns the number on the body's first baseline (quick 261031-fdd).
- What matched within 0.01 px in WebKit and Chrome, fine and coarse: the lead-in's label as a flex column, and the grams wrapper span as an inline-flex row with align-items: baseline and white-space: pre. In both, a flex container takes the textarea's first-line text baseline. white-space: pre keeps the space in ' g'.
- At a coarse pointer the 44 px floor (app.css (pointer: coarse), .ink-field and .prose-field) centres an input's one line, but a textarea starts its text at the top. Centring padding-block, built from tokens, matched exactly. For the lead-in: max(--gap-hair, (--touch-min minus --sheet-leading-note times 1em) divided by 2). For grams: the same with --sheet-leading-field, less two --rule-ink-field.
- white-space: pre plus overflow: hidden keeps one line at the input's height, with no scrollbar. Typing past the width scrolls to the caret in both engines.
- :focus-visible matches a clicked textarea and a script-focused one exactly as it matches an input, in both engines.
- Playwright WebKit with hasTouch: true matches (pointer: coarse).

Purpose: with the Magic Keyboard on the iPad, Tab leaves the lead-in for the instruction and leaves grams for the row's next control. Nothing else changes.
Output: a two-function helper, the two fields as textareas, two selector updates in CreationPage, token-only CSS in notebook.css, updated and new tests, and a committed probe with its before/after evidence.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/debug/ipad-magic-keyboard-tab-create.md
@.planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
@.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs
@app/src/ui/CreationSteps.jsx
@app/src/ui/FieldFeedback.jsx

Read by range, not whole:
- app/src/ui/IngredientTable.jsx lines 600-665: gramsInputsRef, registerGramsInput, the creationFocusLine effect, handleCreatingGramsBlur and handleCreatingGramsChange. Lines 805-890: renderCreatingEntry; the field is at 833-845. The pen grams input (about 185) and the as-made input (about 458) stay as they are.
- app/src/ui/CreationPage.jsx lines 55-100 (findRefusedField; case 'line' at 72, case 'stepLeadIn' at 74) and lines 286-344 (the focus-request effect; kind 'lead-in' at 301, kind 'step-field' at 313).
- app/src/styles/notebook.css lines 204-216 (the .mk-step field rules, where the lead-in rules go), 278-290 (.notebook .mk-focus) and 2002-2038 (the (pointer: coarse) block). Lines 1-60 of app/src/styles/notebook.test.js hold its guards: every selector starts with .notebook; no bare px; no hex; exactly five @media conditions in order, so add no new @media block.
- app/src/styles/app.css lines 314-321 (the global textarea rule: field-sizing content, resize none), 1119-1135 (.method-step grid, align-items baseline), 1226-1238 (.method-step__field), 1495-1540 (.prose-field, .prose-field--lead-in, .ink-field), 885-891 and 974-993 (.ingredient-table .ink-field text-align, .ingredient-table__plan-grams and its .ink-field width with flex: none), 2236-2242 (.field-requirement display block), 2464-2530 (the coarse floor: min-height --touch-min and font-size --sheet-type-note on .ink-field, .prose-field).

These rules reach the new textareas through element selectors. Every one was checked at planning:
- app.css top-level `textarea { field-sizing: content; resize: none; }` applies to both. That is wanted: no grip, and the height follows one line.
- `.authored__note-field textarea.prose-field` (app.css 1397) and `.notebook-field textarea` (notebook.css 717-719 and 2016-2018) do not apply. Neither field sits in .authored__note-field or .notebook-field.
- No rule in app.css, notebook.css, shell.css or print.css targets these fields as input elements, and print.css has no input or textarea rule at all. Every input rule is for checkbox, radio, number, date or file types, or for .notebook-field or .notebook-ceremony__batch-option, so the two fields lose no input rule.
- The class rules apply equally to both elements: .prose-field, .prose-field--lead-in, .ink-field, `.notebook .mk-step .prose-field--lead-in`, `.ingredient-table .ink-field`, `.ingredient-table__plan-grams .ink-field`, `.notebook .mk-focus`, the coarse floor, and :focus-visible.

The instruction field's rows=2 is a JSX attribute, not a CSS rule. Nothing in CSS keys on rows.
</context>

<interfaces>
The helper to create, app/src/ui/oneLineField.js (plain module, no React import):
- export function holdReturn(event): for a React keydown event. When event.key is 'Enter', and neither event.nativeEvent.isComposing is true nor event.keyCode is 229, it calls event.preventDefault(). It never calls stopPropagation and never acts on any other key.
- export function stripNewlines(text): returns text with every U+000A and U+000D removed. This is HTML's strip-newlines rule for a single-line input's value.

Current call sites (HEAD e0015f23):
- CreationSteps.jsx lines 83-95: label.method-step__field, holding the lead-in input element (type text, className 'prose-field prose-field--lead-in', data-field 'lead-in', value step.leadIn, aria-label `Step ${number}, lead-in`, aria-invalid and aria-describedby from leadError, onChange calling onChangeStepField(step.n, 'leadIn', event.target.value)), then FieldFeedback.
- IngredientTable.jsx lines 833-845: the creating grams input element. It has ref={(element) => registerGramsInput(row.id, portion.step, element)}, type text, inputMode 'decimal', className 'ink-field' plus ' mk-focus' when lineKey equals creationRows.focusLine, value raw, aria-label as above, aria-invalid and aria-describedby from messageId, onChange calling handleCreatingGramsChange(row, portion, event.target.value), and onBlur calling handleCreatingGramsBlur(row, portion, raw). The text ' g' follows it inside span.ingredient-table__plan-grams.
- CreationPage.jsx line 72: page.querySelector of the tr whose data-line is `${rowId}:${step}`, then its descendant input element. Line 301: page.querySelector of the input element whose aria-label is `Step ${request.position}, lead-in`.
</interfaces>

<tasks>

<task type="tracer">
  <name>Task 1: The lead-in as a one-row textarea, end to end, measured against the HEAD build</name>
  <files>.planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs, app/src/ui/oneLineField.js, app/src/ui/CreationSteps.jsx, app/src/ui/CreationPage.jsx, app/src/styles/notebook.css, app/src/ui/CreationSteps.test.jsx, app/src/ui/CreationStructure.test.jsx</files>
  <precondition>git status --porcelain app/src prints nothing, so the base build is HEAD; /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs exists (the probe checks it and fails loudly otherwise).</precondition>
  <action>
This task touches seven files. The count is over the five-file rule of thumb because two of the seven are one-line test-selector swaps. Moving those swaps to another commit would leave a red suite between commits.

Step 0, before any edit under app/. Record the mtime of app/dist/index.html with stat -f %m and keep it for Task 2's last check. Mark's preview on 4173 (vite preview, pid 31386 at planning) serves app/dist: never build into it, never contact port 4173, and never start vite dev or vite preview. The only Vite processes this plan runs are the two builds below, each of which exits.

Step 1, write the probe at .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs. Model it on 261027-ubi-baseline-probe.mjs. Keep its usage header, the PLAYWRIGHT_CORE default and existence check, and startServers({ appRoot }) from 08-walk-server.mjs on ephemeral 127.0.0.1 ports. Abort every request to any other host. Keep clickUntil (Chrome's first click after navigation often misses), settle (document.fonts.ready plus a short wait), and one fresh context per area so an open draft never reaches the next run. Keep the record and check modes. Output is PASS, FAIL and INFO lines ending "N PASS, M FAIL", with exit 1 on any FAIL. All typed and printed text is English.

check takes --base <base.json> and --field lead-in|grams|all, default all.

Engines: webkit, and chromium with channel 'chrome'. If Chrome does not launch, print INFO and skip it.

Configs: 1366x1024 fine; 1366x1024 coarse (hasTouch true); 1366x1024 coarse at DPR 2; 393x852 coarse. The 393 run is recorded and printed as INFO only, never gated.

Flow per config: go to /notebook, press New recipe, fill Name with 'Probe sorbet', press Start, wait for .mk-page. Press the Instructions head's Add step and wait for `li.mk-step [data-field="lead-in"]`. Press Add ingredient (the `.ingredient-table-region .mk-head-act`) and press the first .pick__row that is not .pick__row--added. Record its .pick__name text, which must be equal in both builds. Select each field without naming its tag: the lead-in by `li.mk-step [data-field="lead-in"]`, grams by `td.ingredient-table__col-grams .ink-field`.

Record these per config:
- F0: each field's tagName, and its rows and inputmode attributes.
- F1: whether matchMedia('(pointer: coarse)') matches.
- G5 (measure first, while the picked row's grams field holds focus): document.activeElement is that field, it has class mk-focus, and its computed outline-style, outline-width and outline-offset.
- L6 (lead-in empty, blurred): the field box and the box of the lead-in label's .field-requirement, both against the li.
- L7: click into the lead-in. Record matches(':focus-visible') and the computed outline-style, outline-width and outline-offset.
- L1 to L5 (fill 'Warm the milk', blur with document.activeElement.blur()):
  - Field box: top and left against the li, width, height.
  - Computed font-family, font-size, font-weight, line-height, color, text-align, padding-left, padding-right, the four border widths, resize.
  - Scrollbars: offsetWidth minus clientWidth minus the left and right borders, and offsetHeight minus clientHeight minus the top and bottom borders.
  - The .method-step__n box against the li.
  - The instruction field's top against the li (`li.mk-step [aria-label$=", instruction"]`), and the li height.
  - Ink bounding boxes, in device px relative to their own clip, from a page.screenshot clipped to:
    - the field's padding box (its rect inset by its border widths);
    - the number's rect.
    Ink means pixels whose any channel differs from the clip's top-left pixel by more than 48. Decode the PNG inside a page, through an Image drawn to a canvas, so no npm package is needed.
- L8: focus the lead-in, press Enter, then Shift+Enter. Record the value and whether it still has focus.
- L9: fill '' and run page.keyboard.insertText with 'Warm', a LF, then 'the milk'. Record the value, then fill 'Warm the milk' again.
- L10: fill a 160-character English sentence and press End. Record the height, scrollLeft (gate: greater than 0) and the scrollbar figures. Then restore.
- G1 to G4 (grams: fill '150', blur):
  - Field box against the tr.
  - The same computed list as the lead-in.
  - Scrollbar figures.
  - The tr height.
  - The rect of the ' g' text node (a Range over the field's next sibling text node) against the tr.
  - The top of the first text node of the row's td.ingredient-table__col-name against the tr.
  - The field-text ink bounding box.
- G6: Enter, then Shift+Enter, on grams. Record the value and focus.
- G7: fill '' and insertText '15', a LF, '0'. Record the value, then restore '150'.
- G8: fill 13 digits and press End. Record the height and scrollLeft. Then restore.

check gates, after against base, per engine and per gated config, each line printing both figures:
- F0: after's lead-in is TEXTAREA with rows 1. For --field grams or all, after's grams is TEXTAREA with rows 1 and inputmode decimal. Print base's tags as INFO.
- F1: coarse equals hasTouch.
- L1, G1: boxes within 0.5 px.
- L2, G2: computed values equal. resize is none and both scrollbar figures are 0, after only.
- L3, G3: ink boxes within 1 device px.
- L4: the number box within 0.5 px. The number's ink bottom minus the field text's ink bottom, converted to page px, is within 1 device px of base's.
- L5: instruction top and li height within 0.5 px.
- L6: the empty field box and the Required box within 0.5 px.
- L7: equal.
- L8, G6: the value equals the filled value in both builds, and focus is kept.
- L9, G7: after's value equals base's, which is 'Warmthe milk' and '150'.
- L10, G8: after's height equals after's filled height within 0.5 px, scrollLeft is greater than 0, and the scrollbar figures are 0. Print the scroll offset as INFO.
- G4: within 0.5 px.
- G5: equal, and the field is focused with mk-focus.
--field lead-in runs F0 (lead-in part), F1 and L1 to L10. grams runs F0 (grams part), F1 and G1 to G8.

Step 2, base record, still with no app/ edit:
- npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-lec/base-dist --emptyOutDir
- PROBE_DIST=/private/tmp/sprinkles-261101-lec/base-dist node <probe> record /private/tmp/sprinkles-261101-lec/base.json
Both engines must record all four configs. If a flow step fails at HEAD, fix the probe, not the app.

Step 3, create app/src/ui/oneLineField.js as in the interfaces section. Give it a short header comment naming bug-p11-ipad-hardware-tab-skips-fields and the root cause in one sentence: iPadOS 27 Safari drops a hardware Tab from every input element, and a textarea takes it. No comment you add in any file may spell an element name with an opening angle bracket in front of it. The count gates in Task 2 read those spellings.

Step 4, CreationSteps.jsx. Turn the lead-in input element into a textarea element. Drop the type attribute and add rows="1", matching the instruction field's string style. Keep className, data-field, value, aria-label, aria-invalid and aria-describedby exactly. onChange passes stripNewlines(event.target.value). Add onKeyDown={holdReturn}. Import both from './oneLineField.js'. Leave the two target-chip input elements as they are.

Step 5, CreationPage.jsx line 301. The 'lead-in' focus request selects the textarea with aria-label `Step ${request.position}, lead-in`: swap the tag in that selector, nothing else. Line 74 (stepLeadIn) and line 313 (step-field) already select by data-field: leave them.

Step 6, notebook.css, token-only. Every selector begins with .notebook, and no new @media block is added.
- After the `.notebook .mk-step .prose-field--lead-in` rule (line 214), add a rule for `.notebook .mk-step .method-step__field:has(> textarea.prose-field--lead-in)` declaring display: flex and flex-direction: column. It hands the step grid the textarea's first-line baseline, and Required stays under the field.
- Add a rule for `.notebook .mk-step textarea.prose-field--lead-in` declaring white-space: pre and overflow: hidden. This gives one line, scrolled to the caret, with no scrollbar.
- Inside the existing (pointer: coarse) block, add `.notebook .mk-step textarea.prose-field--lead-in` with padding-block: max(var(--gap-hair), calc((var(--touch-min) - var(--sheet-leading-note) * 1em) / 2)). This centres the one line in the 44 px floor as the input did.
- Comment each rule briefly with the bug id and its reason.
These are the planning candidates. The probe is the acceptance. If a gate fails, adjust with tokens only and re-run. If no token-only rule passes a gate, stop: report the gate and its numbers in the SUMMARY, do not loosen a tolerance, and do not commit the failing state.

Step 7, tests.
- CreationSteps.test.jsx: add a describe naming bug-p11-ipad-hardware-tab-skips-fields, using the file's mount, field, type, held and withStep helpers:
  - the lead-in's tagName is TEXTAREA, rows is '1', it has no type attribute, it has prose-field--lead-in and data-field lead-in, and it is still found by its aria-label;
  - a keydown Enter (bubbles, cancelable), dispatched with dispatchEvent, returns false. So do Enter with shiftKey, altKey, ctrlKey and metaKey, and the value is unchanged;
  - an Enter with isComposing true returns true, and so does an Enter whose keyCode is 229. If jsdom drops keyCode from the init dictionary, set it with Object.defineProperty on the event before dispatching;
  - type(field('Step 1, lead-in'), text with a LF and a trailing CRLF) leaves the field's value and held.method[0].leadIn with every newline removed.
- CreationStructure.test.jsx: lines 225 and 266 select the lead-in by data-field through its old input tag name. Make them select the textarea tag. Nothing else in that file changes in this task.

Step 8, verify, then commit. Use git add with the seven explicit paths only, never -A: untracked .review-diagnostics directories sit under .planning/phases. The message is English: "fix: the creation step's lead-in is a one-row textarea, so iPad Tab reaches the instruction (bug-p11-ipad-hardware-tab-skips-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.
  </action>
  <verify>
    <automated>npm --prefix app test -- CreationSteps CreationStructure CreationFlow EditFlow Shell.creationGuard styles && test "$(grep -o '<textarea' app/src/ui/CreationSteps.jsx | wc -l | tr -d ' ')" = 4 && test "$(grep -o '<input' app/src/ui/CreationSteps.jsx | wc -l | tr -d ' ')" = 2 && ! grep -qF 'input[data-field="lead-in"]' app/src/ui/CreationStructure.test.jsx && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-lec/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-lec/after-dist node .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs record /private/tmp/sprinkles-261101-lec/after.json && node .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs check /private/tmp/sprinkles-261101-lec/after.json --base /private/tmp/sprinkles-261101-lec/base.json --field lead-in</automated>
  </verify>
  <done>
- The probe's lead-in check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2. The 393 INFO lines are copied into the SUMMARY.
- The targeted suites pass, including notebook.test.js and cross-cutting.test.js.
- CreationSteps.jsx counts 4 textarea openings (HEAD 3) and 2 input openings (HEAD 3).
- CreationStructure.test.jsx has no lead-in selector naming the input tag (HEAD 2).
- One commit holds the seven files, and app/dist/index.html's mtime equals Step 0's.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The creating row's grams field as a one-row textarea, the test sweep, and the full proof</name>
  <files>app/src/ui/IngredientTable.jsx, app/src/ui/CreationPage.jsx, app/src/styles/notebook.css, app/src/ui/IngredientTable.creating.test.jsx, app/src/ui/CreationStructure.test.jsx, app/src/ui/CreationFlow.test.jsx, app/src/ui/EditFlow.test.jsx, app/src/ui/RecipeSheet.test.jsx</files>
  <behavior>
    - The creating line's grams field is a TEXTAREA with rows '1', inputmode 'decimal', class ink-field and no type attribute, found by its aria-label '<name>, grams' or '<name>, grams, portion k'.
    - Enter, plain or with a modifier, is default-prevented on it. Enter while composing (isComposing, or keyCode 229) is not.
    - Typing '15', a LF, then '0' leaves the field reading '150'. Leaving it then raises no message, because '150' is readable.
    - Every existing behaviour still passes: the per-line blur message and its aria wiring, the split row's lines, the refused Save's focus to grams portion 2, and the picked row's focus in its grams field.
  </behavior>
  <action>
This task touches eight files, again over the five-file rule of thumb. Six of the eight are test-selector swaps at named lines, which must land in the same commit as the change so the suite stays green.

RED first. In IngredientTable.creating.test.jsx, add a describe naming bug-p11-ipad-hardware-tab-skips-fields, with the behaviour above. Use the file's mount, its Harness with real draft state, and the creating helpers. Update the file's own helpers to the new tag:
- field(name), line 101, selects the textarea by aria-label.
- type(name, value), lines 108-115, and the inline setter at line 306 take the value setter from HTMLTextAreaElement.prototype.
- The two group assertions at lines 217-218 select the textarea.
- lineField, line 245, selects the row line's textarea.
Run it and see the new tests fail against the input element.

GREEN.
- IngredientTable.jsx, renderCreatingEntry, lines 833-845. Turn the grams input element into a textarea element. Drop type and add rows="1". Keep exactly the ref callback (registerGramsInput), inputMode="decimal", the className expression with mk-focus, value raw, aria-label, aria-invalid, aria-describedby, and the onBlur arrow. onChange passes stripNewlines(event.target.value) into handleCreatingGramsChange. Add onKeyDown={holdReturn}, importing both from './oneLineField.js'. Keep ' g' after it. Leave the pen grams input (about line 185), the as-made input (about line 458), gramsInputsRef and both focus effects unchanged; they hold any element.
- CreationPage.jsx line 72, findRefusedField case 'line': the row line's descendant is the textarea. Swap the tag in that selector only.
- notebook.css, token-only, with selectors beginning .notebook and no new @media block:
  - a rule for `.notebook .ingredient-table__plan-grams:has(> textarea.ink-field)` declaring display: inline-flex, align-items: baseline and white-space: pre. ' g' then sits on the textarea's text baseline, and pre keeps its leading space;
  - a rule for `.notebook .ingredient-table textarea.ink-field` declaring white-space: pre and overflow: hidden;
  - inside the existing (pointer: coarse) block, `.notebook .ingredient-table textarea.ink-field` with padding-block: max(var(--gap-hair), calc((var(--touch-min) - var(--sheet-leading-field) * 1em - 2 * var(--rule-ink-field)) / 2)).
  Comment each rule briefly with the bug id. No added comment spells an element name behind an opening angle bracket. The same stop rule as Task 1 applies if a probe gate cannot pass with tokens only.

Sweep the remaining tests that name the grams field by its old tag. These are every hit at HEAD, by line:
- CreationFlow.test.jsx line 1649: the count of grams fields for MILK selects textareas.
- EditFlow.test.jsx line 280: the split milk row's grams fields select textareas.
- CreationStructure.test.jsx line 467: the after-remove check that no MILK field remains selects textareas. Left on the old tag, it would pass without testing anything.
- RecipeSheet.test.jsx lines 232, 233 and 243: three markup regexes match the grams field as an input element. React's static markup renders a textarea's value as its text content, not as a value attribute. The count regex matches a textarea opening tag with that aria-label. The value regex matches that opening tag followed directly by 60 and the closing tag. The empty regex matches the opening tag followed directly by the closing tag.
- Leave the pen and as-made tests (RecipePage.perStep.test.jsx, IngredientTable.remove.test.jsx) unchanged: those fields stay inputs.

Run the full suite, rebuild after-dist and run the probe for all fields (see verify). Then commit the eight files with git add of explicit paths only. The message is English: "fix: the creation row's grams field is a one-row textarea, so iPad Tab leaves it (bug-p11-ipad-hardware-tab-skips-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.

The SUMMARY records:
- the probe's full check output, as a table per engine and config, with base against after for each gate;
- the 393 INFO figures;
- the test totals, before (4238 in 130 files) and after;
- a "Deferred Human Verification" section for the orchestrator's iPad check: Tab from the lead-in to the instruction; Tab from grams to the row's next control; Return inserts nothing; both fields look unchanged against the previous build. The orchestrator rebuilds app/dist for it; the executor never does. There are no Mark's List writes in this plan, because the executor has no ArtifactData;
- a note that quick 261027-ubi's probe gates U1, U4 and U5 select the creation lead-in by its old tag and will no longer find it. This plan's L1, L4 and L5 cover the same ground against base. The old probe is not edited;
- a note for the orchestrator: screen readers now meet two textareas, so the fields may be announced as multi-line. This plan adds no aria-multiline. The choice is Mark's.
  </action>
  <verify>
    <automated>npm --prefix app test && test "$(grep -o '<textarea' app/src/ui/IngredientTable.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o '<input' app/src/ui/IngredientTable.jsx | wc -l | tr -d ' ')" = 2 && test "$(grep -o '<input' app/src/ui/Method.jsx | wc -l | tr -d ' ')" = 4 && test "$(grep -rho '<input' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = 26 && test "$(grep -rho '<textarea' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = 18 && ! grep -qE 'input\[[^]]*(lead-in|grams)' app/src/ui/CreationSteps.test.jsx app/src/ui/CreationStructure.test.jsx app/src/ui/IngredientTable.creating.test.jsx app/src/ui/CreationFlow.test.jsx app/src/ui/EditFlow.test.jsx && ! grep -qF '<input[^>]*aria-label="Whole milk, 3.5% fat, grams"' app/src/ui/RecipeSheet.test.jsx && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-lec/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-lec/after-dist node .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs record /private/tmp/sprinkles-261101-lec/after.json && node .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs check /private/tmp/sprinkles-261101-lec/after.json --base /private/tmp/sprinkles-261101-lec/base.json --field all</automated>
  </verify>
  <done>
Baselines at HEAD e0015f23, measured at planning:
- The full suite passes: 130 files, 4238 plus the new tests, none deleted.
- IngredientTable.jsx: textarea openings 0 to 1; input openings 3 to 2.
- Method.jsx: 4 input openings, unchanged.
- App-wide non-test .jsx: input openings 28 to 26; textarea openings 16 to 18.
- The five creation test files: input-tag selectors naming lead-in or grams, 7 hits to 0.
- RecipeSheet.test.jsx: input-tag grams regexes, 3 to 0.
- The probe's --field all check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2.
- app/dist/index.html's mtime equals Task 1 Step 0's.
- Two commits on main, and the SUMMARY carries the evidence and the deferred device check.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker input to draft | Typed or pasted text in the lead-in and grams fields enters the creation draft and the kept draft in IndexedDB through the repository seam |
| scratch probe to network | The probe serves a scratch build on 127.0.0.1 and drives local browsers |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261101-lec-01 | Tampering | lead-in and grams onChange | low | mitigate | stripNewlines removes every LF and CR before the draft sees the value, so no multi-line lead-in or grams string reaches the store or the Sheet's one-line projections. The text still renders as a React text child (no dangerouslySetInnerHTML, per project convention), and CreationSteps.test.jsx keeps its markup-as-text test |
| T-261101-lec-02 | Information disclosure | 261101-lec-field-probe.mjs | low | mitigate | It serves only the scratch build on ephemeral 127.0.0.1 ports via 08-walk-server.mjs, aborts every request to another host, never binds 0.0.0.0, and never contacts Mark's preview on 4173 |
| T-261101-lec-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. playwright-core is the existing npx cache at the path named in the probe, and the PNG decoding runs in the browser |
</threat_model>

<verification>
- Task 1 and Task 2 automated commands pass as written.
- `git log -2 --format=%s` shows the two fix commits. `git show --stat HEAD~1 HEAD` lists only the files named in each task.
- No vite dev or vite preview process was started. Port 4173 still has only Mark's preview listening, and app/dist/index.html's mtime is unchanged.
</verification>

<success_criteria>
- Both creation fields are one-row textareas that keep every attribute and behaviour the inputs had, and Return and pasted newlines leave the value single-line.
- The probe proves visual and focus parity with the HEAD build in WebKit and Chrome, fine and coarse, with 0 FAIL.
- The full suite is green, and every other input in the app is untouched (count gates).
- The iPad Tab check is handed to the orchestrator as deferred human verification.
</success_criteria>

<output>
Create `.planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-SUMMARY.md` when done
</output>
