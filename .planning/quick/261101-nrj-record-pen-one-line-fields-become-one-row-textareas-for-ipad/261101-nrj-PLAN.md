---
phase: quick-261101-nrj
plan: 01
quick_id: 261101-nrj
type: execute
wave: 3
depends_on: ["261101-nrh", "261101-nri"]
files_modified:
  - .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs
  - app/src/ui/BatchRow.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Method.jsx
  - app/src/styles/notebook.css
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/BatchRow.signed.test.jsx
  - app/src/ui/RecipePage.recordTasting.test.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/IngredientTable.remove.test.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/Method.recording.test.jsx
autonomous: true
requirements:
  - bug-ipad-tab-lost-from-single-line-fields

must_haves:
  truths:
    - "In the record pen (Record batch, Record another and Correct on the recipe page), these three field sites are one-row textarea elements (rows '1', no type attribute): the unsigned measured fields Duration, Tempering and Melt test (BatchRow.jsx MeasuredField, inputmode 'decimal', class 'ink-field'); each row's as-made grams on the Sheet (IngredientTable.jsx AsMadeCell, inputmode 'decimal', class 'ink-field ingredient-table__as-made-field'); a step's Done differently line (Method.jsx StepRecordingControls, class 'prose-field'). Each keeps its aria-label, value, aria-invalid and aria-describedby wiring, its ref (the measured fields' fieldRefs callback, Done differently's line.fieldRef) and Done differently's onBlur. Source: .impeccable/proposals/2026-11-01-one-line-fields.md sections 2 to 5, DESIGN.md Fields 'One-line field'."
    - "Out of machine and Temperature stay number inputs exactly as they are (type number, step any, no inputmode, onChange plus onInput through readSignedInput, blur on wheel), per Mark's serving-only answer on decide-one-line-fields (2026-11-01): a textarea cannot open the iPhone's numbers layer with a minus. Churned and Tasted stay date inputs."
    - "Return in every switched field inserts nothing: an Enter keydown outside IME composition, with or without a modifier, has its default prevented (holdReturn, app/src/ui/oneLineField.js) and focus stays. Any LF or CR that arrives by paste or any other edit is removed before it reaches the record draft (stripNewlines). Return did nothing in these fields before: the record pen holds no form."
    - "Every focus path still reaches its field: a refused Save's first-invalid-measurement focus lands on the Duration, Tempering or Melt test textarea; Done differently's opener opens the line and focuses it; leaving the line empty on blur closes it back to its opener; leaving it with text keeps it open; Correct of a batch whose step holds a line opens that line with its text."
    - "The fields look and behave as at the base build. The 261101-nrj probe compares an after build against a base build of the Step 0 tree in Playwright WebKit and Chrome (channel 'chrome') at 1366x1024 fine, 1366x1024 coarse, 1366x1024 coarse DPR 2 and 393x852 coarse DPR 3, and prints 0 FAIL: each field's box, its parent's, its grandparent's, each sibling's and each row neighbour's box within 0.5 px against its region's anchor, and the anchor's height, empty and filled; computed type, colour, padding, borders and numerals equal; text ink within 1 device px; :focus-visible and outline equal after a click; Tab lands on the same next control; Return, a pasted line break and long text as the contract says; Done differently's open, close-on-empty-blur and stay-open-with-text equal in both builds; the signed and date fields still inputs."
    - "The iPhone keyboard of the decimal fields does not change: Duration, Tempering, Melt test and every as-made field keep inputmode 'decimal' (the probe's F0 gate and the unit tests pin it)."
    - "No other field changes. Against the Step 0 counts, non-test .jsx under app/src counts 2 fewer input-element openings and 3 more textarea-element openings; BatchRow.jsx keeps its input count (the signed branch and the two dates) and gains one textarea; IngredientTable.jsx and Method.jsx each lose one input and gain one textarea; git shows no change under app/src since Step 0 outside this plan's twelve app files."
    - "npm --prefix app test passes with at least Step 0's test count plus the new tests; every test that pinned the old input element is rewritten to the new element, not deleted, and every negative assertion that named the old tag is made tag-neutral, so it still means something."
    - "Device-verified only by Mark, deferred to the orchestrator: on his iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off) Tab leaves Duration, Tempering, Melt test, an as-made field and Done differently for the next control; on his iPhone the decimal pad still opens for Duration, Tempering, Melt test and an as-made field, and Out of machine and Temperature still open the numbers layer with a minus."
  artifacts:
    - path: app/src/ui/BatchRow.jsx
      provides: "MeasuredField renders the signed branch as the unchanged number input and the unsigned branch as a one-row decimal textarea"
      contains: "onKeyDown={holdReturn}"
    - path: app/src/ui/IngredientTable.jsx
      provides: "AsMadeCell's recording field as a one-row decimal textarea"
      contains: "ingredient-table__as-made-field"
    - path: app/src/ui/Method.jsx
      provides: "StepRecordingControls' Done differently line as a one-row textarea that still closes on an empty blur"
      contains: "onBlur={line.handleBlur}"
    - path: app/src/styles/notebook.css
      provides: "Token-only duties: one scrolled line and the coarse centring for the measured fields (ink family) and Done differently (prose family) by widening the existing family rules; the as-made field as a block on the cell's right edge"
      contains: "ingredient-table__as-made-field"
    - path: app/src/ui/Method.recording.test.jsx
      provides: "jsdom tests for Done differently: open, focus, Return held, line breaks stripped, close on empty blur, stay open with text, Amend opens with the line"
      contains: "done differently"
    - path: .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs
      provides: "Record and check of every switched record-pen field against a scratch base build, in WebKit and Chrome, at 1366 and 393"
      contains: "record"
  key_links:
    - from: app/src/ui/BatchRow.jsx
      to: app/src/ui/oneLineField.js
      via: "the unsigned textarea takes onKeyDown={holdReturn} and hands stripNewlines(event.target.value) to onChange(field.key, ...)"
      pattern: "stripNewlines"
    - from: app/src/ui/BatchRow.jsx
      to: "BatchRow's fieldRefs effect"
      via: "inputRef still lands on the textarea, so fieldRefs.current[invalidFieldTarget.key].focus() reaches it"
      pattern: "ref=\\{inputRef\\}"
    - from: app/src/ui/Method.jsx
      to: "useOnDemandField"
      via: "ref={line.fieldRef} and onBlur={line.handleBlur} stay on the textarea, so the opener focuses it and an empty blur collapses it"
      pattern: "line\\.fieldRef"
    - from: app/src/styles/notebook.css
      to: app/src/styles/app.css
      via: "app.css's (pointer: coarse) floor gives .ink-field and .prose-field min-height --touch-min and 16 px text; notebook.css's coarse padding-block family rules centre each textarea's one line in that floor, as the input centred its own"
      pattern: "\\.notebook-log \\.field-unit textarea\\.ink-field"
---

<objective>
Mark's answer on bug-ipad-tab-lost-from-single-line-fields ("fix": Sid rules on the field kind, then a quick-batch switches them) and on decide-one-line-fields (serving-only, 2026-11-01). This item switches the record pen's one-line fields. Siblings 261101-nrh (creation editor) and 261101-nri (version pen and Rename) land first on main; 261101-nrk (Notebook, Ingredients, Search) is independent.

Root cause, device-verified on Mark's iPad (.planning/debug/ipad-magic-keyboard-tab-create.md): iPadOS 27 Safari drops a hardware Tab from every input element and sends focus out of the page, while a one-row textarea takes it. Quick 261101-lec built the pattern (app/src/ui/oneLineField.js, tokens-only CSS in notebook.css), Mark passed it on the iPad, and Sid's ruling (.impeccable/proposals/2026-11-01-one-line-fields.md) extends it to every remaining one-line field with five CSS duties so each keeps its look.

The three sites here, at planning HEAD cfe405f9 (IngredientTable.jsx and Method.jsx lines move when 261101-nri lands; find those sites by content):
- BatchRow.jsx 132, MeasuredField's single input element, which today renders both branches. The unsigned branch (Duration, Tempering, Melt test) becomes a one-row textarea. The signed branch (Out of machine, Temperature) stays the number input it is.
- IngredientTable.jsx 459, AsMadeCell's recording field: a row's as-made grams on the Sheet.
- Method.jsx 472, StepRecordingControls' Done differently line.
Churned (BatchRow.jsx 819) and Tasted (973) stay date inputs (spec section 2, Keep).

The five CSS duties (spec section 3), as they touch these fields:
- Duty 1, one scrolled line: all three. The as-made field already takes 261101-lec's top-level .notebook .ingredient-table textarea.ink-field rule. The measured fields join that rule's selector list. Done differently joins the lead-in's one-line rule.
- Duty 2, the line centred in the coarse floor: the measured fields and the as-made field are the 2 px-padded ink family (the as-made field already takes lec's coarse rule; the measured fields join its selector list). Done differently is the prose family and joins the lead-in's coarse centring rule.
- Duty 3, block parents: the as-made field sits alone in a table cell, so it becomes display block (spec: its row grows 3.33 px in WebKit and 4 px in Chrome otherwise). The measured fields sit in the flex .field-unit and Done differently in the flex-column label.method-step__line-control, so neither needs it.
- Duty 4, widths: none here. The measured and as-made fields have the 56 px figure width and Done differently has width 100% from .prose-field.
- Duty 5, the placeholder: none here. No field here has one.

Claude's discretion, recorded:
- The as-made block field also takes an auto inline-start margin. Below 724 the list form puts the cell in a 64 px track and the 56 px inline input stood on its right edge by the cell's text-align, which a block ignores. From 724 the cell is the field's own 56 px, so the margin is 0. Sid measured duty 3 at 1366 only; the 393 gate proves this.
- MeasuredField keeps one component with two JSX branches. handleEdit now serves only the signed branch, so its ternary goes and it reads readSignedInput(event.target) alone. The unsigned branch drops type, onInput and onWheel, which it never used (both were undefined for it).
- BatchRow.test.jsx's "carries dir=auto on every textarea" test (contract "Textareas", the prose fields) is narrowed to the prose textareas. dir is not added to the measured fields: every attribute stays as it was, and a figure field is not a contract Textarea.
- Done differently's DOM behaviour gets a new jsdom sibling, Method.recording.test.jsx, because Method.test.jsx runs in the node environment.
- No aria-multiline, as 261101-lec decided. No new helper; oneLineField.js is reused as it is.
- The probe gates 393 coarse (lec printed it as INFO) because Mark records batches on his iPhone (sketches 007, 008).

Purpose: with the Magic Keyboard on the iPad, Tab moves on from every one-line field of the record pen, and nothing looks or types differently on the iPad or the iPhone.
Output: a probe and its base/after evidence; three field sites as one-row textareas; token-only CSS that widens the existing family rules; a test sweep with new tests. Three commits, one per task.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.impeccable/proposals/2026-11-01-one-line-fields.md
@app/src/ui/oneLineField.js

Read by range or by search, not whole:
- .impeccable/proposals/2026-11-01-one-line-fields-probe.mjs: lines 186-197, Sid's record-pen flow (recipe page, Record another, Add tasting, Step 1's Done differently opener). It is the start for this probe's flow.
- The sibling probes, whichever exists at Step 0: .planning/quick/261101-nri-*/261101-nri-field-probe.mjs (it already drives the recipe page) or else .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs (665 lines; its harness: CONFIGS, clickUntil, focusByClick, execInsert, settle, openPage, measureField, ink, behave, recordGroup, runConfig with its mk(group, name, selector, anchor) factory, boxMatches, regionMatches, and the check mode). If neither exists, use .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs.
- .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-PLAN.md, Task 1's action: the probe's gates F0 to L1 and the stop rule this plan reuses.
- .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-SUMMARY.md, Deviations 1 and 2: engine inputs turn a pasted LF into a space (print it as INFO); Playwright's insertText presses Enter in WebKit, so the paste check uses document.execCommand('insertText').
- app/src/ui/BatchRow.jsx (unchanged by both siblings, so these lines hold):
  - 72-96: MALFORMED_NUMBER_ENTRY, readSignedInput, shownSignedValue.
  - 98-147: the comment above MeasuredField and MeasuredField itself (the input at 132-145, handleEdit at 125-126, the unit span after it).
  - 641-648: fieldRefs and the first-invalid-measurement focus effect.
  - 843-853, 985-995, 1019-1027: the three MeasuredField mounts (churn row; tasting row; melt block).
- app/src/ui/IngredientTable.jsx: line 12 already imports holdReturn and stripNewlines. AsMadeCell (search "function AsMadeCell"; 443-475 at planning) and its three td call sites (search "<AsMadeCell"). The creating grams textarea (search "registerGramsInput(row.id") is 261101-lec's model for the attributes.
- app/src/ui/Method.jsx: useOnDemandField (search "export function useOnDemandField"; 52-75 at planning) and StepRecordingControls (search "function StepRecordingControls"; 441-493 at planning). Check its imports: 261101-nri may already import holdReturn and stripNewlines from './oneLineField.js'.
- app/src/styles/notebook.css, by search, since both siblings edit it:
  - the top-level rules commented with bug-p11-ipad-hardware-tab-skips-fields and bug-ipad-tab-lost-from-single-line-fields: the lead-in's one-line rule (selector list starting `.notebook .mk-step textarea.prose-field--lead-in`), and the ink one-line rule (starting `.notebook .ingredient-table textarea.ink-field`), plus whatever 261101-nrh and 261101-nri added beside them;
  - inside `@media (pointer: coarse)`: the prose centring rule (padding-block reading --sheet-leading-note) and the ink centring rule (padding-block reading --sheet-leading-field and 2 * --rule-ink-field), with the selectors the siblings added to their lists.
  - notebook.test.js lines 24-55 hold its guards: every rule's first selector starts with .notebook (`.notebook-log` passes); no bare px; no hex; exactly five @media conditions in order. So add no @media block.
- app/src/styles/app.css (read only): 314-321 the global textarea rule (field-sizing content, resize none); 891-903 the as-made field's 56 px width; 1351-1357 .method-step__line-control (flex column); 1522-1537 .prose-field; 1554-1568 .ink-field; 1854-1894 .field-row__label, .field-unit (flex, align-items baseline) and .field-unit .ink-field (56 px); 2491-2560 the coarse floor; 2663-2760 the phone list form (the as-made cell is grid column 1, the 64 px --sheet-plan-grams-w track, text-align right); 3000-3137 the 724-up grid (the as-made cell is the 56 px asm track).
- Tests, by line at planning HEAD (search by content where 261101-nri may have moved them):
  - BatchRow.test.jsx: 398-408 (the unit-sibling regex for Duration), 988-998 (the churn measured fields test), 1017-1030 (the unsigned decimal-pad test), 1056-1065 (Duration carries no aria-invalid), 1323-1329 (dir=auto on every textarea). 1000-1015 and 1081-1100 pin the signed inputs and stay as they are.
  - BatchRow.signed.test.jsx: 1-100 (the jsdom mount; it returns the Out of machine input) and 107-160 (the signed handler tests, which stay).
  - RecipePage.recordTasting.test.jsx: 163-170 (setValue, already tag-aware), 210, 248, 329.
  - IngredientTable.test.jsx: 2180-2192 and 2574-2585 (as-made markup). 1654, 1683 and 1781 count the version pen's grams fields and belong to 261101-nri.
  - IngredientTable.remove.test.jsx: 1-20 (jsdom harness) and 120-200 (the two as-made tests: selectors at 141, 188, 189; setters at 143 and 181).
  - RecipePage.perStep.test.jsx: 165-171 (setValue: if it still takes only the input prototype at Step 0, make it tag-aware like RecipePage.recordTasting.test.jsx's) and 749-812 (the decision-56 describe: its field helper at 753 and asMadeFieldsOf at 755-756 serve only the as-made fields; the date selectors stay).
  - Method.test.jsx: 70-97 (the Done differently SSR tests at 82 and 94).
</context>

<interfaces>
Helper, unchanged (app/src/ui/oneLineField.js):
- holdReturn(event) prevents the default of an Enter keydown unless an IME is composing (nativeEvent.isComposing, or keyCode 229). It never stops propagation.
- stripNewlines(text) removes every LF and CR.

Pattern (261101-lec, IngredientTable.jsx's creating grams textarea): a textarea with rows="1", onKeyDown={holdReturn}, and onChange passing stripNewlines(event.target.value) on. Every other attribute is kept, and no type attribute is written.

The fields and the selectors the probe and tests use. Every one is tag-neutral, so it finds the input in the base build and the textarea after:
- measured (after Record another or Record batch, then Add tasting):
  - `.notebook-log .batch-margin--pen [aria-label="Duration, minutes"]`
  - `.notebook-log .batch-margin--pen [aria-label="Tempering, minutes"]`
  - `.notebook-log .batch-margin--pen [aria-label="Melt test, g lost at 20 min"]`
  - anchor `.notebook-log .batch-margin--pen`; row neighbours: the children of the field's closest `.field-row`
- signed and dates (must stay inputs):
  - `[aria-label="Out of machine, degrees Celsius"]`, `[aria-label="Temperature, degrees Celsius"]`
  - the pen's two date fields, `.batch-margin--pen .field-row__label--date .ink-field`
- asmade (on the Sheet while recording):
  - `.ingredient-table .ingredient-table__as-made-field`, every one (aria-label "<name>, as made, grams" or "..., portion N")
  - anchor `table.ingredient-table`; row neighbours: the other cells of the field's closest `tr`
- done (after pressing the button `[aria-label="Step 1, done differently"]`):
  - `.method-step__line-control [aria-label="Step 1, done differently"]` (the opener shares the aria-label, so the label class is part of the selector)
  - anchor: the field's closest `ol`; row neighbours: the children of its closest `.method-step__recording`

Record draft shapes the new tests assert on:
- BatchRow's onChangeRecordField(key, value): key is a BATTERY_FIELDS key ('churnDurationMinutes', 'temperingMinutes', 'meltTestG').
- IngredientTable's onChangeAsMade(rowId, storedIndex, value).
- Method's onChangeStepChange(n, { struck, line }): line is null when the text is empty.
- BatchRow's invalidFieldTarget prop is an object with a key (a BATTERY_FIELDS key).
</interfaces>

<tasks>

<task type="tracer">
  <name>Task 1: Duration, Tempering and Melt test as one-row textareas, end to end, measured against the base build</name>
  <files>.planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs, app/src/ui/BatchRow.jsx, app/src/styles/notebook.css, app/src/ui/BatchRow.test.jsx, app/src/ui/BatchRow.signed.test.jsx, app/src/ui/RecipePage.recordTasting.test.jsx</files>
  <precondition>git status --porcelain app/src prints nothing; 261101-nrh and 261101-nri have landed on main, shown by IngredientTable.jsx and Method.jsx each counting exactly one input-element opening (the as-made field and Done differently); /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs exists. If either sibling has not landed, stop and report: this plan builds on their CSS and their edits to IngredientTable.jsx and Method.jsx.</precondition>
  <action>
Step 0, before any edit under app/:
- Let S be /private/tmp/sprinkles-261101-nrj. Create it.
- Write `git rev-parse HEAD` to S/head-before. The base is this tree, whatever its commit.
- Write these counts, each with grep -rho (app-wide, include '*.jsx', exclude '*.test.jsx') or grep -o on one file piped to wc -l: input-element openings and textarea-element openings app-wide (S/inputs-before, S/textareas-before), and the same two for BatchRow.jsx (S/br-inputs-before, S/br-textareas-before; 3 and 4 at planning), IngredientTable.jsx (S/it-inputs-before, S/it-textareas-before) and Method.jsx (S/m-inputs-before, S/m-textareas-before).
- Record the mtime of app/dist/index.html (stat -f %m) in S/dist-mtime-before.
- Run npm --prefix app test and record the totals in S/suite-before. It must pass; if it does not, stop and report (a dependency left it red).
- Never build into app/dist. Never contact port 4173: Mark's vite preview serves app/dist there. Never start vite dev or vite preview. The only Vite runs in this plan are builds into S, and each exits.

Step 1, write the probe at .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs. Copy the sibling probe named in the context (nri's, else nrh's, else lec's) and keep its harness: the usage header listing every gate; the PLAYWRIGHT_CORE default and existence check; startServers({ appRoot }) from ../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs on ephemeral 127.0.0.1 ports with every request to another host aborted; clickUntil (Chrome's first click after a navigation often misses), focusByClick, execInsert, settle, ink() with the 2 px inset for bordered fields; one fresh context per config; record and check modes with PROBE_DIST naming the build; boxes relative to each group's anchor with the anchor's height recorded; no pinned widths and no restyling (the probe compares two real builds). Output is PASS, FAIL and INFO lines ending "N PASS, M FAIL", exit 1 on any FAIL. Everything typed or printed is English.

Replace the flow and the field groups with the record pen's:
- Engines: webkit, and chromium with channel 'chrome'. Both are required: a launch failure is a FAIL line.
- Configs, all gated: 1366x1024 fine; 1366x1024 coarse (hasTouch true); 1366x1024 coarse at DPR 2; 393x852 coarse (hasTouch true) at DPR 3. The record pen is an iPhone surface (sketches 007, 008), so 393 is gated here.
- Flow per config, starting from Sid's (his probe's lines 186-197): go to /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1; press the record action ('Record another', or 'Record batch' when the version has no batch) and wait for .batch-margin--pen; press the first 'Add tasting'; press the button `[aria-label="Step 1, done differently"]`, type 'Cooled overnight' into the line it opens (an empty line would close on blur); blur document.activeElement. If a region the flow needs is folded at 393, open its fold. If a flow step fails at the base, fix the probe, not the app.
- Pass 1: measure every measured, asmade and done field as the flow leaves them (measured and as-made empty, Done differently holding 'Cooled overnight'), and the signed and date fields' tags and attributes.
- Fill every blank measured and as-made field with '12.5'. Pass 2: measure them all again, with ink.
- Behaviour checks, per field, restoring the filled value after each: on the three measured fields, on the first and the last as-made field, and on Done differently. Boxes, computed style and ink cover every as-made field.
  - K: click into the field; record matches(':focus-visible') and the computed outline-style, outline-width and outline-offset.
  - N: with the field focused by click, press Tab; record the newly focused element's aria-label, else its trimmed text, else its tag and class.
  - R: focus the field, press Enter, then Shift+Enter; record the value and whether the field still has focus.
  - P: fill '' and execInsert two parts joined by a line feed: a decimal field takes '1', LF, '2'; Done differently takes 'Probe', LF, 'text'. Record the value.
  - L: fill '', focus, and keyboard.type a long value: a decimal field takes '1234 5678 9012 3456' (a space included, since duty 1 is about a value with a space wrapping); Done differently takes a sentence of at least 160 characters. Record the height, scrollLeft and the scrollbar figures (offsetWidth minus clientWidth minus the side borders, and the same for height).
  - D (Done differently only, run last): fill '' and blur; record whether step 1's line field is gone and its opener is back. Press the opener; record whether the line field has focus. Type 'Cooled overnight' and blur; record whether the field is still there.
- Record per field, per pass: the tag; the attributes (rows, cols, type, step, inputmode, class, aria-label, aria-describedby, aria-invalid, required, autocomplete, spellcheck, enterkeyhint, dir); the field's, parent's and grandparent's boxes; each sibling's box (element children, and non-blank text nodes through a Range); each row neighbour's box; the anchor's height; the computed font-family, font-size, font-weight, font-variant-numeric, line-height, color, text-align, padding (all four), border widths, border-top-color, border-radius, background-color, display, resize and white-space; the scrollbar figures; pass 2 only: the text ink box within the padding box, in device px.

check takes --base <base.json> and --field with a comma list of measured, signed, asmade and done, or all (the default). Gates, after against base, per engine and config and field, each line printing both figures:
- F0: after's tag is TEXTAREA with rows '1' and no type or step attribute; inputmode is 'decimal' on the measured and as-made fields and absent on Done differently; every other recorded attribute equals base's. Base's tag is printed as INFO.
- S0 (the signed group): Out of machine and Temperature are INPUT with type 'number', step 'any' and no inputmode in both builds, and the two date fields are INPUT with type 'date' in both builds.
- F1: matchMedia('(pointer: coarse)') equals hasTouch.
- E1 (pass 1) and B1 (pass 2): the field, parent, grandparent, sibling and row-neighbour boxes, and the anchor height, within 0.5 px.
- C1: the computed list is equal. On after only: resize is none, white-space is pre, and both scrollbar figures are 0.
- I1: the ink box is within 1 device px.
- K1: equal.
- N1: the same next control. Print its name as INFO for the SUMMARY's device steps.
- R1: the value is unchanged and focus is kept, in both builds.
- P1: after's value is the two parts joined with nothing between ('12' or 'Probetext'). Base's value is printed as INFO (the engines' inputs turn the LF into a space).
- L1: on after, the height equals after's pass-2 height within 0.5 px, scrollLeft is greater than 0, and the scrollbars are 0. Base's scrollLeft is printed as INFO (WebKit inputs scroll internally and report 0).
- D1: gone-and-opener-back, focus-on-reopen and stays-open-with-text are true in both builds.
No ruled exception applies here (no field here took its width from the browser). Long-text ink is never compared: a value wider than its box shows 2 to 4 px more of itself, which spec section 3 rules acceptable.

Step 2, record the base, still with no app/ edit:
- npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrj/base-dist --emptyOutDir
- PROBE_DIST=/private/tmp/sprinkles-261101-nrj/base-dist node <probe> record /private/tmp/sprinkles-261101-nrj/base.json
Both engines must record all four configs and all four groups.

Step 3, BatchRow.jsx MeasuredField (lines 124-147):
- Render two branches inside the span.field-unit, before the unit span.
- The signed branch is today's input element with exactly today's rendered attributes and handlers: type 'number', step 'any', no inputMode, className, aria-label, aria-invalid, aria-describedby, value={shownSignedValue(value)}, ref={inputRef}, onChange and onInput through handleEdit, and the wheel blur. Write type="number" and step="any" literally. handleEdit now serves only this branch, so it calls onChange(field.key, readSignedInput(event.target)) with no ternary.
- The unsigned branch is a textarea with rows="1", inputMode="decimal", className="ink-field", the same aria-label, aria-invalid and aria-describedby, value={value}, ref={inputRef}, onKeyDown={holdReturn}, and onChange calling onChange(field.key, stripNewlines(event.target.value)). No type, step, onInput or onWheel.
- Import holdReturn and stripNewlines from './oneLineField.js'.
- Rewrite the comment above MeasuredField where this change makes it wrong. It now says: the unsigned fields are one-row textareas for the iPad's Tab (bug-ipad-tab-lost-from-single-line-fields; iPadOS 27 Safari drops a hardware Tab from every input element), keeping inputMode decimal so the iPhone still opens its decimal pad, with Return held and a pasted line break removed (oneLineField.js); the signed fields stay number inputs per Mark's serving-only answer on decide-one-line-fields (2026-11-01), since a textarea cannot open the iPhone's numbers layer with a minus. Keep the rest of the comment's history. No comment written in this plan contains a literal input-element or textarea-element opening tag: the count gates count those.

Step 4, notebook.css. Tokens only. Every new selector begins with .notebook. No new @media block. Widen the family rules; write no parallel rule with the same declarations.
- Duty 1. Add `.notebook-log .field-unit textarea.ink-field` to the selector list of the top-level ink one-line rule whose list starts `.notebook .ingredient-table textarea.ink-field` (261101-lec's; it declares white-space: pre and overflow: hidden, and already reaches the as-made field). Reword its comment to name the record pen's measured fields and bug-ipad-tab-lost-from-single-line-fields.
- Duty 2. Inside the existing (pointer: coarse) block, add `.notebook-log .field-unit textarea.ink-field` to the selector list of the ink centring rule (261101-lec's grams rule, which 261101-nrh widened with the creation targets and style ends). Its padding-block formula, max(var(--gap-hair), calc((var(--touch-min) - var(--sheet-leading-field) * 1em - 2 * var(--rule-ink-field)) / 2)), is already this family's: 16 px on the 1.35 line, 2 px padding, two 1 px rules, in the 44 px floor; the input centred its line (10.2 px each side), and a textarea starts it 8.2 px higher, taking the min unit with it (spec duty 2).
These are the planning candidates. The probe is the acceptance. If a gate fails, adjust with tokens only and re-run. If no token-only rule passes a gate, stop: report the gate and its numbers in the SUMMARY, do not loosen a tolerance, and do not commit the failing state.

Step 5, tests.
- BatchRow.test.jsx (node, SSR markup), rewrite, do not delete:
  - 398-408: the unit-sibling regex matches a textarea element carrying aria-label "Duration, minutes" and its closing tag, followed by the unit span.
  - 988-998: the churn measured fields test names Duration as a one-row textarea: tag textarea, rows="1", inputMode="decimal", class="ink-field", no type attribute. Its Time to draw temp check becomes tag-neutral (no aria-label starting "Time to draw temp" anywhere in the markup), so it still means something.
  - 1017-1030: the unsigned decimal-pad test matches each of the three names as a textarea and asserts rows="1", inputMode="decimal", no type, no step, no autoCorrect.
  - 1056-1065: the Duration match takes the textarea form.
  - 1323-1329: "carries dir=auto on every textarea" iterates the prose textareas only (class prose-field), the contract's Textareas; see the objective's discretion note.
- BatchRow.signed.test.jsx (jsdom): let mount take extra props for BatchRow. Add a describe naming bug-ipad-tab-lost-from-single-line-fields:
  - Duration (and, with tastingOpen true, Tempering and Melt test) is a TEXTAREA with rows '1', inputmode 'decimal', class 'ink-field', and no type or step attribute; Out of machine and Temperature are still INPUT of type number.
  - A cancelable Enter keydown on Duration is default-prevented, and so is one with shiftKey.
  - '3', LF, '0' set through HTMLTextAreaElement's value setter plus an input event calls onChangeRecordField exactly once with ('churnDurationMinutes', '30'); '2', CR, LF, '5' in Melt test gives ('meltTestG', '25').
  - invalidFieldTarget { key: 'churnDurationMinutes' } puts focus on the Duration textarea, and { key: 'meltTestG' } with tastingOpen true on Melt test.
  The existing signed tests stay as they are.
- RecipePage.recordTasting.test.jsx: line 248 selects the Tempering textarea by the same aria-label prefix. Lines 210 and 329 (FIELD_INPUT) become tag-neutral attribute selectors, so the absence checks still catch a field of any tag.

Step 6, verify (see below), then commit. Use git add with this task's explicit paths only, never -A: untracked .review-diagnostics and quick-batches folders sit under .planning. The message is English: "fix: the record pen's Duration, Tempering and Melt test are one-row textareas, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2. Do not commit this PLAN or the SUMMARY.
  </action>
  <verify>
    <automated>npm --prefix app test -- BatchRow RecipePage.recordTasting styles && test "$(grep -o '<input' app/src/ui/BatchRow.jsx | wc -l | tr -d ' ')" = "$(cat /private/tmp/sprinkles-261101-nrj/br-inputs-before | tr -d ' ')" && test "$(grep -o '<textarea' app/src/ui/BatchRow.jsx | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrj/br-textareas-before) + 1 ))" && test "$(grep -v '^ *[/*]' app/src/styles/notebook.css | grep -c 'notebook-log .field-unit textarea.ink-field')" -ge 2 && test "$(cat app/src/ui/BatchRow.test.jsx app/src/ui/RecipePage.recordTasting.test.jsx | grep -E 'Duration, minutes|Tempering|Melt test, g|Time to draw temp' | grep -cE '<input|input\[')" = 0 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrj/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrj/after-dist node .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs record /private/tmp/sprinkles-261101-nrj/after.json && node .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs check /private/tmp/sprinkles-261101-nrj/after.json --base /private/tmp/sprinkles-261101-nrj/base.json --field measured,signed</automated>
  </verify>
  <done>
Baselines at planning HEAD cfe405f9 (BatchRow.jsx is untouched by both siblings):
- The probe's measured and signed check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse, 1366 coarse DPR 2 and 393 coarse DPR 3.
- base.json holds all four groups in both engines and all four configs.
- The targeted suites pass, including notebook.test.js.
- BatchRow.jsx: input openings 3 to 3 (the signed branch and the two dates); textarea openings 4 to 5.
- notebook.css: the measured-field selector appears twice (duty 1 and duty 2), 0 at planning.
- The test sweep gate over BatchRow.test.jsx and RecipePage.recordTasting.test.jsx: 7 lines at planning to 0.
- One commit holds this task's files.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Each row's as-made grams as a one-row textarea, a block on the cell's right edge</name>
  <files>app/src/ui/IngredientTable.jsx, app/src/styles/notebook.css, app/src/ui/IngredientTable.test.jsx, app/src/ui/IngredientTable.remove.test.jsx, app/src/ui/RecipePage.perStep.test.jsx</files>
  <behavior>
    - While recording, each as-made field is a TEXTAREA with rows '1', inputmode 'decimal', class 'ink-field ingredient-table__as-made-field' and no type attribute; its aria-label is unchanged ('Whole milk, as made, grams', or '..., portion N' by the lines drawn).
    - A cancelable Enter keydown on it is default-prevented, plain or with Shift.
    - '24', LF, '5' set on the 'Whole milk, as made, grams' field calls onChangeAsMade with ('row-01', 1, '245') in the decision-56 harness.
    - The SSR markup holds the field's value as its text: a textarea with aria-label 'Whole milk, as made, grams' holding '250'; with two of three lines left, exactly two such fields, 'portion 1' holding '101' and 'portion 2' holding '249', never 'portion 3'.
    - The existing decision-56 tests pass after their selector and setter change (IngredientTable.remove.test.jsx), and so does the full-page record-save-correct flow (RecipePage.perStep.test.jsx).
  </behavior>
  <action>
RED first.
- IngredientTable.remove.test.jsx (jsdom): switch the two decision-56 tests to the textarea: selectors at 141, 188 and 189 name the textarea tag; the setters at 143 and 181 come from HTMLTextAreaElement's prototype. Add a describe naming bug-ipad-tab-lost-from-single-line-fields with the tag, attribute, Return and line-break behaviour above, using the file's own mount shape (the test at about line 120 renders IngredientTable in recording mode with draft asMade { 'row-01': ['', '250'] }). Find the field by its aria-label with no tag in the selector and assert its tagName: the sweep gate counts any line that names an as-made field beside the old tag.
- IngredientTable.test.jsx (node, SSR): 2186, 2579, 2581 and 2582 match a textarea carrying the aria-label and holding the value as its text, ending in its closing tag. 2579's count of two stays.
- Run them and see them fail against the input element.

GREEN.
- IngredientTable.jsx AsMadeCell, the recording branch: the input element becomes a textarea. Drop type, add rows="1", keep inputMode="decimal", className, value and aria-label exactly. Add onKeyDown={holdReturn}; onChange passes stripNewlines(event.target.value) to onChangeAsMade with the same row id and stored index. Both helpers are already imported at line 12.
- notebook.css, tokens only, selectors beginning .notebook, no new @media block:
  - Duties 1 and 2 already reach this field through 261101-lec's two `.notebook .ingredient-table textarea.ink-field` rules (top level and coarse). Add nothing for them.
  - Duty 3. After the top-level ink one-line rule, add a rule for `.notebook .ingredient-table textarea.ingredient-table__as-made-field` declaring display: block and margin-inline-start: auto. Comment it with bug-ipad-tab-lost-from-single-line-fields and duty 3: the field sits alone in its cell; an inline textarea's baseline is its bottom edge, which grew the row (3.33 px in WebKit, 4 px in Chrome); as a block it sets the cell's height as the input did. The auto start margin keeps it on the cell's right edge where the list form below 724 gives the cell the 64 px amount track and the input stood there by text-align; from 724 the cell is the field's own 56 px, so the margin is 0.
- RecipePage.perStep.test.jsx, the decision-56 describe (749-812 at planning): the field helper selects the textarea by aria-label, and asMadeFieldsOf collects the tbody textareas. If setValue (about line 165) still takes only the input prototype, make it tag-aware as RecipePage.recordTasting.test.jsx's is. The date selectors stay.

The probe is the acceptance, with Task 1's stop rule. If the probe needed a fix, add it to this commit by its path. The 393 gates prove the margin; if the as-made row still differs there, measure it and fix it with tokens only.

Commit with git add of the explicit paths only. The message is English: "fix: the record pen's as-made grams fields are one-row textareas, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.
  </action>
  <verify>
    <automated>npm --prefix app test -- IngredientTable RecipePage.perStep styles && test "$(grep -o '<input' app/src/ui/IngredientTable.jsx | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrj/it-inputs-before) - 1 ))" && test "$(grep -o '<textarea' app/src/ui/IngredientTable.jsx | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrj/it-textareas-before) + 1 ))" && test "$(grep -v '^ *[/*]' app/src/styles/notebook.css | grep -c 'textarea.ingredient-table__as-made-field')" -ge 1 && test "$(grep -c 'HTMLInputElement.prototype' app/src/ui/IngredientTable.remove.test.jsx)" = 0 && test "$(cat app/src/ui/IngredientTable.test.jsx app/src/ui/IngredientTable.remove.test.jsx app/src/ui/RecipePage.perStep.test.jsx | grep -E 'as made, grams' | grep -cE '<input|input\[')" = 0 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrj/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrj/after-dist node .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs record /private/tmp/sprinkles-261101-nrj/after.json && node .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs check /private/tmp/sprinkles-261101-nrj/after.json --base /private/tmp/sprinkles-261101-nrj/base.json --field measured,signed,asmade</automated>
  </verify>
  <done>
Baselines at planning HEAD cfe405f9, with 261101-nri's expected change noted:
- The probe's measured, signed and asmade check prints 0 FAIL for webkit and chrome at all four configs, every as-made row included.
- IngredientTable.jsx: input openings Step 0 minus 1 (2 at planning, 1 after nri, so 0); textarea openings Step 0 plus 1.
- notebook.css: the as-made block rule appears once, 0 at planning.
- IngredientTable.remove.test.jsx: input prototype setters 2 to 0.
- The as-made sweep gate over the three test files: 7 lines at planning to 0.
- The targeted suites pass; no test deleted.
- One commit.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Done differently as a one-row textarea that still closes on an empty blur, the sweep, and the full proof</name>
  <files>app/src/ui/Method.jsx, app/src/styles/notebook.css, app/src/ui/Method.test.jsx, app/src/ui/Method.recording.test.jsx</files>
  <behavior>
    - In recording mode with no line, the step shows the Done differently opener and no line field; pressing it renders a TEXTAREA with rows '1', class 'prose-field', no type attribute and aria-label '<Step N>, done differently', and focuses it.
    - A cancelable Enter keydown on the line is default-prevented, plain or with Shift; the value is unchanged.
    - 'Used', LF, ' vanilla' set through HTMLTextAreaElement's value setter plus an input event calls onChangeStepChange(n, { struck: false, line: 'Used vanilla' }).
    - Blurring the line while it is empty closes it: the textarea is gone, the opener is back, and the last onChangeStepChange call carries line null.
    - Blurring it while it holds text keeps it open.
    - A stepChanges entry that already holds a line (what Correct opens) renders the textarea holding that line, with no click; the SSR markup shows it as a textarea holding 'Used vanilla instead', and with no line, no field of any tag carries the done-differently aria-label.
  </behavior>
  <action>
RED first.
- Method.test.jsx (node, SSR): line 82's absence check becomes tag-neutral (no input or textarea element carrying an aria-label ending ", done differently"), so it still means something. Write the two tags as one non-capturing alternation after the angle bracket: the sweep gate looks for the old tag written out on lines that name these fields, and the alternation keeps it at 0. Line 94 matches a textarea carrying that aria-label and holding 'Used vanilla instead' as its text.
- Method.recording.test.jsx (new, jsdom docblock, modelled on IngredientTable.remove.test.jsx's createRoot and act harness; Method renders no links, so no router is needed): render Method in recording mode with one step through a small stateful wrapper that holds stepChanges and records each onChangeStepChange call in a spy, and add the behaviour above under a describe naming bug-ipad-tab-lost-from-single-line-fields. Find the opener and the field by their aria-label, which ends ", done differently" (the number is the displayed one). Blur with element.blur() inside act (jsdom fires focusout, which React's onBlur listens to).
- Run them and see them fail against the input element.

GREEN.
- Method.jsx StepRecordingControls: the line's input element becomes a textarea. Drop type, add rows="1", keep ref={line.fieldRef}, className="prose-field", value, aria-label and onBlur={line.handleBlur} exactly. Add onKeyDown={holdReturn}. handleChangeLine reads stripNewlines(event.target.value) and keeps its empty-to-null rule. Import holdReturn and stripNewlines from './oneLineField.js' unless 261101-nri already did.
- notebook.css, tokens only, no new @media block, widening the prose family rules:
  - Duty 1. Add `.notebook .method-step__line-control textarea.prose-field` to the selector list of the top-level lead-in one-line rule (its list starts `.notebook .mk-step textarea.prose-field--lead-in`; 261101-nri may have widened it to the version pen's lead-in). Reword its comment to name Done differently.
  - Duty 2. Inside the existing (pointer: coarse) block, add the same selector to the prose centring rule, padding-block: max(var(--gap-hair), calc((var(--touch-min) - var(--sheet-leading-note) * 1em) / 2)): 16 px on the 1.5 line, 2 px padding, no rule, in the 44 px floor; the input centred its line 8 px lower than a textarea starts it (spec duty 2).
  - Duties 3 to 5 do not apply: the label is a flex column (app.css .method-step__line-control), .prose-field gives width 100%, and there is no placeholder. The probe's parent and sibling gates prove it.
- The probe is the acceptance, with Task 1's stop rule.

Then run:
- the full suite;
- every count gate in verify;
- a fresh after build;
- the probe with --field all.
Commit the four files with git add of explicit paths only (plus the probe if it needed a fix). The message is English: "fix: the record pen's Done differently line is a one-row textarea, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.

Write the SUMMARY at .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-SUMMARY.md. Leave it uncommitted. It records:
- the probe's tally per engine, config and group (PASS/FAIL counts), and the final "N PASS, M FAIL" line;
- the INFO lines for the base paste values and base scrollLeft, and the N1 next-control names;
- the test totals at Step 0 and after;
- the three commit hashes;
- whether app/dist/index.html's mtime still equals Step 0's. If it differs, say whether any command of this plan wrote there: Mark may rebuild by hand between waves.
- A "Deferred Human Verification" section for the orchestrator's device checks, the build served by preview --host (the executor never builds app/dist), one numbered step per line, each with an "Expect:" result and the next control named as the probe's N1 printed it:
  - iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off): open a recipe version and press Record another or Record batch; type in Duration and press Tab; press Add tasting, type in Tempering and press Tab, then Melt test and Tab; type in an as-made field on the Sheet and press Tab; press Step 1's Done differently, type a few words and press Tab. Expect each Tab to move to the next control and not out of the page. Return in each inserts nothing. Every field looks as it did on the previous build.
  - iPhone (the record pen at phone width): tapping Duration, Tempering, Melt test and an as-made field opens the decimal pad as before; tapping Out of machine and Temperature still opens the numbers layer with a minus.
  There are no Mark's List writes in this plan: the executor has no ArtifactData.
- Notes for the orchestrator:
  - Sid's probe (.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs) selects by the input tag, so it no longer sees these fields. It was not edited.
  - No aria-multiline was added, as 261101-lec decided.
  - DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams". That line is Impeccable's to update after the batch.
  - The dir=auto test was narrowed to the prose textareas, and the measured fields carry no dir, as before.
  </action>
  <verify>
    <automated>npm --prefix app test && test "$(grep -o '<input' app/src/ui/Method.jsx | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrj/m-inputs-before) - 1 ))" && test "$(grep -o '<textarea' app/src/ui/Method.jsx | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrj/m-textareas-before) + 1 ))" && test "$(grep -v '^ *[/*]' app/src/styles/notebook.css | grep -c 'method-step__line-control textarea.prose-field')" -ge 2 && test "$(cat app/src/ui/BatchRow.test.jsx app/src/ui/RecipePage.recordTasting.test.jsx app/src/ui/IngredientTable.test.jsx app/src/ui/IngredientTable.remove.test.jsx app/src/ui/RecipePage.perStep.test.jsx app/src/ui/Method.test.jsx | grep -E 'Duration, minutes|Tempering|Melt test, g|as made, grams|done differently|Time to draw temp' | grep -cE '<input|input\[')" = 0 && test "$(grep -rho '<input' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrj/inputs-before) - 2 ))" && test "$(grep -rho '<textarea' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrj/textareas-before) + 3 ))" && CHANGED="$(git diff --name-only "$(cat /private/tmp/sprinkles-261101-nrj/head-before)" HEAD -- app/src)" && test -z "$(printf '%s\n' "$CHANGED" | grep -vE '^app/src/(ui/(BatchRow|IngredientTable|Method)\.jsx|ui/(BatchRow|BatchRow\.signed|RecipePage\.recordTasting|IngredientTable|IngredientTable\.remove|RecipePage\.perStep|Method|Method\.recording)\.test\.jsx|styles/notebook\.css)$' | grep -v '^$')" && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrj/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrj/after-dist node .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs record /private/tmp/sprinkles-261101-nrj/after.json && node .planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-field-probe.mjs check /private/tmp/sprinkles-261101-nrj/after.json --base /private/tmp/sprinkles-261101-nrj/base.json --field all</automated>
  </verify>
  <done>
Baselines at planning HEAD cfe405f9, with 261101-nri's expected change noted:
- The full suite passes: at least Step 0's file count plus one (Method.recording.test.jsx) and Step 0's test count plus the new tests, none deleted.
- Method.jsx: input openings Step 0 minus 1 (4 at planning, 1 after nri, so 0); textarea openings Step 0 plus 1.
- notebook.css: the Done differently selector appears twice (duty 1 and duty 2), 0 at planning.
- The full sweep gate over the six test files: 16 lines at planning to 0.
- App-wide non-test .jsx: input openings Step 0 minus 2; textarea openings Step 0 plus 3.
- No file under app/src outside the twelve named ones changed since Step 0.
- The probe's --field all check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse, 1366 coarse DPR 2 and 393 coarse DPR 3.
- Three commits on main, and the SUMMARY carries the evidence and the deferred device checks.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker input to record draft | Typed or pasted text in the five switched fields enters the record draft and, on Save batch, the batch record in IndexedDB through the repository seam |
| scratch probe to network | The probe serves scratch builds on 127.0.0.1 and drives local browsers |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261101-nrj-01 | Tampering | the measured, as-made and Done differently onChange handlers | low | mitigate | stripNewlines removes every LF and CR before onChangeRecordField, onChangeAsMade or onChangeStepChange see the value, so no multi-line figure or line reaches the draft, the batch record or the Sheet's one-line readings. The draft's existing number parsing and the one save gate still validate the figures as before. Values render as React text (no dangerouslySetInnerHTML, per project convention) |
| T-261101-nrj-02 | Tampering | the signed fields left as number inputs | low | accept | Out of machine and Temperature keep their number input, readSignedInput and MALFORMED_NUMBER_ENTRY handling unchanged (Mark's serving-only answer); the S0 gate and BatchRow.signed.test.jsx pin it |
| T-261101-nrj-03 | Information disclosure | 261101-nrj-field-probe.mjs | low | mitigate | It serves only scratch builds under /private/tmp on ephemeral 127.0.0.1 ports via 08-walk-server.mjs, aborts every request to another host, never binds 0.0.0.0, and never contacts Mark's preview on 4173 |
| T-261101-nrj-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. playwright-core is the existing npx cache at the path the probe names, and PNG decoding runs in the browser |
</threat_model>

<verification>
- The automated commands of Tasks 1, 2 and 3 pass as written.
- `git log -3 --format=%s` shows the three fix commits. `git show --stat` on each lists only the files named in its task (plus the probe where a task fixed it).
- No vite dev or vite preview process was started, nothing was built into app/dist, and port 4173 still has only Mark's preview listening.
</verification>

<success_criteria>
- The record pen's one-line fields (Duration, Tempering, Melt test, each as-made field, Done differently) are one-row textareas that keep every attribute, ref and handler, including Done differently's close-on-empty-blur. Return and pasted line breaks leave each value on one line, and every focus request still lands.
- Out of machine and Temperature stay number inputs, and Churned and Tasted stay date inputs, per Mark's serving-only answer.
- The probe proves box, neighbours, ink, focus ring, Tab order, Return, paste, long text and the Done differently open/close behaviour against the base build in WebKit and Chrome at 1366 fine, coarse and coarse DPR 2, and at 393 coarse DPR 3, with 0 FAIL.
- The full suite is green, and no other field in the app changed (count and diff gates).
- The iPad Tab check and the iPhone keyboard check are handed to the orchestrator as deferred human verification.
</success_criteria>

<output>
Create `.planning/quick/261101-nrj-record-pen-one-line-fields-become-one-row-textareas-for-ipad/261101-nrj-SUMMARY.md` when done
</output>
