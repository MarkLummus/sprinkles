---
phase: quick-261101-nri
plan: 01
quick_id: 261101-nri
type: execute
wave: 2
depends_on: ["261101-nrh"]
files_modified:
  - .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs
  - app/src/ui/RecipeBand.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Method.jsx
  - app/src/styles/notebook.css
  - app/src/ui/RecipeBand.test.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - app/src/ui/RecipePage.drafts.test.jsx
  - app/src/ui/RecipePage.strictMode.test.jsx
  - app/src/ui/RecipePage.beforeYouStart.test.jsx
  - app/src/ui/RecipePage.stalePen.test.jsx
autonomous: true
requirements:
  - bug-ipad-tab-lost-from-single-line-fields

must_haves:
  truths:
    - "On the recipe page (/notebook/:recipeId/:versionId) these six field elements at five sites are one-row textarea elements (rows '1', no type attribute): Rename's Recipe name (RecipeBand.jsx); the version pen's Version name (VersionRow.jsx); a row's grams in the version pen (IngredientTable.jsx GramsCell, the developing branch); a step's lead-in in the version pen (Method.jsx); a step's target label and value in the version pen (Method.jsx, also cols '20'). Each keeps its class, aria-label, value, aria-invalid and aria-describedby wiring and every other attribute it had: ref on Recipe name, Version name and grams; autoFocus on Recipe name and Version name; disabled on Recipe name and Version name; required and placeholder 'e.g. less oil' on Version name; inputMode 'decimal' on grams. None of the five sites carries autoCapitalize, autoComplete, spellCheck, enterKeyHint or onBlur today, and none gains one. Source: .impeccable/proposals/2026-11-01-one-line-fields.md sections 2 to 5 (table rows 6, 9, 10, 13, 14 and 15), DESIGN.md Fields 'One-line field'."
    - "Return in every switched field inserts nothing: an Enter keydown outside IME composition, with or without a modifier, has its default prevented (holdReturn from app/src/ui/oneLineField.js) and focus stays. Any LF or CR that arrives by paste or any other edit is removed before it reaches the pen draft or Rename's fields (stripNewlines). Return did nothing at any of these sites before: Version name sits in the ceremony form, whose submit is prevented and which has no submit button; the other five sit in no form."
    - "Every focus request still reaches its field: Rename opens with focus in Recipe name and a refused Rename (blank name) focuses it; the pen opens with focus in Version name and a blocked save focuses Version name or the blocked grams field. Proven by the existing RecipePage.perStep and RecipePage.drafts blocked-save tests passing after the selector sweep, and by new perStep tests."
    - "The fields look as they do at the base build. The 261101-nri probe compares an after build against a base build in Playwright WebKit and Chrome (channel 'chrome') at 1366x1024 fine, coarse and coarse DPR 2, and prints 0 FAIL: each field's box, its parent's, its grandparent's and each sibling's within 0.5 px against its anchor, as left by the flow, blank and filled; computed type, colour, padding, borders equal; text ink within 1 device px; :focus-visible and outline equal after a click; Tab lands on the same next control. The ruled differences (spec section 3), printed as INFO: the pen's target fields are 0 to 1 px narrower in WebKit and 0 to 4 px in Chrome (duty 4), with later boxes in the step's targets line compared after that shift; a value wider than its field shows up to 4 px more of itself on the cut side (the version pen's grams); Version name's placeholder ink sits within 2 CSS px in Chrome (duty 5's measured residual), within 1 device px in WebKit."
    - "No other field changes. Non-test .jsx under app/src counts 6 fewer input-element openings and 6 more textarea-element openings than at Step 0, and git shows no change under app/src since Step 0 outside this plan's four app files, nine test files and notebook.css. Out of machine, Temperature, Duration, Tempering, Melt test, as-made grams and Done differently belong to sibling 261101-nrj; the Notebook, Ingredients and Search fields to 261101-nrk."
    - "npm --prefix app test passes with Step 0's file count and at least Step 0's test count plus the new tests; no test is deleted."
    - "Device-verified only by Mark, deferred to the orchestrator: on his iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off) Tab leaves each switched field for the next control and Return inserts nothing."
  artifacts:
    - path: app/src/ui/RecipeBand.jsx
      provides: "Rename's Recipe name as a one-row textarea"
      contains: "onKeyDown={holdReturn}"
    - path: app/src/ui/VersionRow.jsx
      provides: "The version pen's Version name as a one-row textarea that keeps required, autoFocus, placeholder and its ref"
      contains: "onKeyDown={holdReturn}"
    - path: app/src/ui/IngredientTable.jsx
      provides: "The version pen's grams field (GramsCell, developing) as a one-row textarea with inputMode decimal"
      contains: "stripNewlines"
    - path: app/src/ui/Method.jsx
      provides: "The open pen step's lead-in, and its target label and value fields (20 columns), as one-row textareas"
      contains: "cols=\"20\""
    - path: app/src/styles/notebook.css
      provides: "Token-only duties 1 to 5 for these fields, written by widening the selector lists of 261101-lec's and 261101-nrh's rules, plus the placeholder line-height pair"
      contains: "textarea.ink-field::placeholder"
    - path: .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs
      provides: "Record and check of every switched field against a scratch base build, in WebKit and Chrome"
      contains: "record"
  key_links:
    - from: app/src/ui/VersionRow.jsx
      to: app/src/ui/oneLineField.js
      via: "onKeyDown={holdReturn}; onChange hands stripNewlines(event.target.value) to onChangePenField"
      pattern: "stripNewlines"
    - from: app/src/ui/Method.jsx
      to: app/src/ui/oneLineField.js
      via: "the lead-in and both target fields take onKeyDown={holdReturn}; onChangePenStepField and onChangePenStepTarget receive stripNewlines(event.target.value)"
      pattern: "stripNewlines"
    - from: app/src/styles/notebook.css
      to: app/src/styles/app.css
      via: "app.css's (pointer: coarse) floor gives .ink-field and .prose-field min-height --touch-min; notebook.css's coarse padding-block rules centre the textarea's one line in that floor, as the input centred its own"
      pattern: "\\.notebook \\.method-step__open-fields textarea"
    - from: app/src/styles/notebook.css
      to: app/src/ui/VersionRow.jsx
      via: "the ceremony's one-line textarea's ::placeholder takes the field's own line height, so 'e.g. less oil' sits on the field's line as the input's did"
      pattern: "textarea\\.ink-field::placeholder"
---

<objective>
Mark's answer on bug-ipad-tab-lost-from-single-line-fields ("fix": Sid rules on the field kind, then a quick-batch switches them) and on decide-one-line-fields (serving-only, 2026-11-01; the signed fields are not in this item). This item switches the recipe page's version pen and Rename one-line fields. Sibling 261101-nrh (the creation editor) runs first and lands its CSS rules; siblings 261101-nrj and -nrk follow with the record pen and the Notebook, Ingredients and Search fields.

Root cause, device-verified on Mark's iPad (.planning/debug/ipad-magic-keyboard-tab-create.md): iPadOS 27 Safari drops a hardware Tab from every input element and sends focus out of the page, while a one-row textarea takes it. Quick 261101-lec switched the creation lead-in and grams fields (helper app/src/ui/oneLineField.js, tokens-only CSS in notebook.css) and Mark passed them on the iPad. Sid's ruling (.impeccable/proposals/2026-11-01-one-line-fields.md) extends that to every remaining one-line field, with five CSS duties so each keeps its look.

The six field elements here, at HEAD 83a786b3 (261101-nrh does not touch these four files, so the lines hold):
- RecipeBand.jsx 76, Rename's Recipe name (spec row 9).
- VersionRow.jsx 215, the version pen's Version name (spec row 6), the one field with a placeholder.
- IngredientTable.jsx 186, a row's grams in the version pen (spec row 10).
- Method.jsx 156, the open pen step's lead-in (spec row 13).
- Method.jsx 195 and 202, the open pen step's target label and value (spec rows 14 and 15).

The CSS duties that touch these fields (spec section 3):
- Duty 1, one scrolled line: all six.
- Duty 2, the line centred in the coarse floor, in three families: the labelled-above notebook fields (Recipe name, Version name: 8 px padding, 1 px app rules); the 2 px-padded ink fields (targets; grams already has 261101-lec's rule); the prose field (lead-in, no rules).
- Duty 3, block parents: the pen's lead-in sits in a block label, so its label becomes 261101-lec's flex column. Grams needs nothing more (spec: it already takes 261101-lec's .notebook .ingredient-table rules).
- Duty 4, the width the input took: the pen's target fields (app.css width auto) take cols 20 and field-sizing fixed.
- Duty 5, the placeholder: Version name's ::placeholder takes the field's own line height.

Claude's discretion, recorded:
- Every duty is written by adding selectors to the selector lists of 261101-lec's and 261101-nrh's existing rules, as nrh's plan asked of its siblings; the only new rules are duty 5's pair (nrh has no placeholder). The new selectors reach this item's fields only: the band's two form scopes (.notebook-recipe__form and .notebook-ceremony, each also holding the creation editor's own field, which nrh's rule already covers with the same declarations) and the pen's .method-step__open-fields, which the creation editor does not render.
- Duty 5's line height is written as calc(var(--sheet-leading-field) * <the field's size token>) at a fine pointer and again inside the existing coarse block, mirroring the two .notebook-field font-size rules, because --sheet-leading-field is unitless and inside ::placeholder 1em is the small print. Chrome keeps a 1 to 2 px residual that Sid measured with this duty; WebKit (the iPad's engine) is gated at 1 device px.
- The tracer is Rename's Recipe name: the thinnest slice through JSX, CSS, tests and the probe. Version name and grams go together in Task 2 because RecipePage.perStep.test.jsx's helpers select both. The pen's step fields and the full proof are Task 3.
- New jsdom behaviour tests go in a new describe at the foot of RecipePage.perStep.test.jsx, which already mounts the whole RecipePage over Olive Oil v1 with the pen; RecipeBand.test.jsx, VersionRow.test.jsx, Method.test.jsx and IngredientTable.test.jsx run in node and render static markup, so they only take the selector and markup fixes.
- No aria-multiline, as 261101-lec decided.

Purpose: with the Magic Keyboard on the iPad, Tab moves on from every one-line field of the version pen and Rename. Nothing looks different.
Output: a probe with base/after evidence; six field elements as one-row textareas; token-only CSS added to existing rules; a test sweep with new tests; three commits, one per task; an uncommitted SUMMARY.
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
@app/src/ui/RecipeBand.jsx

Read whole (the model for the probe; it exists once 261101-nrh has landed):
- .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs
- .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-SUMMARY.md, if present (its deviations, especially any probe fix)

Read by range, not whole:
- .impeccable/proposals/2026-11-01-one-line-fields-probe.mjs lines 175-185: Sid's recipe-page flow (the path /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1, Rename, Cancel, Next version, "Step N, edit this step").
- app/src/ui/VersionRow.jsx lines 145-151 (the blocked-attempt focus effect) and 197-232 (the ceremony form, onSubmit prevented; label.notebook-field holding Version name, then p.notebook-helper and FieldFeedback with required).
- app/src/ui/IngredientTable.jsx lines 1-12 (holdReturn and stripNewlines already imported at line 12) and 162-205 (GramsCell; the developing branch's field at 186-199 inside span.ingredient-table__plan-grams, followed by the text ' g').
- app/src/ui/Method.jsx lines 1-8 (imports), 147-215 (the open step: div.method-step__open-fields > label.method-step__field > lead-in field at 155-163; p.method-step__targets > span.target-chip > struck value, label field 195-201, value field 202-208), 586-605 (one open step at a time, openStepN) and 632-636 (fieldLabel: "Step N, lead-in", "Step N, target K, label", "Step N, target K, value").
- app/src/ui/CreationSteps.jsx lines 84-96: 261101-lec's lead-in, the pattern to copy (rows "1", onChange through stripNewlines, onKeyDown={holdReturn}, no type).
- app/src/styles/notebook.css as 261101-nrh left it. Find by selector, not line (nrh moved lines):
  - 261101-lec's three top-level rules: `.notebook .mk-step .method-step__field:has(> textarea.prose-field--lead-in)` (flex column), `.notebook .mk-step textarea.prose-field--lead-in` (pre, hidden), `.notebook .ingredient-table__plan-grams:has(> textarea.ink-field)` and `.notebook .ingredient-table textarea.ink-field` (grams).
  - 261101-nrh's duty 1 rule `.notebook.mk-page textarea.ink-field` (pre, hidden), just after lec's grams rule.
  - 261101-nrh's duty 4 rule `.notebook .mk-step textarea:is(.target-chip__label-field, .target-chip__value-field)` (field-sizing fixed), after the creation chip grid.
  - Inside the one (pointer: coarse) block near the file's foot: lec's lead-in centring rule `.notebook .mk-step textarea.prose-field--lead-in`; lec's grams centring rule `.notebook .ingredient-table textarea.ink-field`, whose selector list nrh widened with `.notebook .mk-step textarea.ink-field` and `.notebook .mk-band__ends textarea.ink-field`; nrh's labelled-above rule `.notebook.mk-page .notebook-field textarea.ink-field`; and the `.notebook-field .ink-field, .notebook-field input, .notebook-field textarea` font-size rule.
  - 131-135 (.notebook-recipe__form, flex column), 743-761 (.notebook-field base rule: input and textarea alike), 860-905 (.notebook-ceremony and the Why).
- app/src/styles/notebook.test.js lines 24-55 (every rule's selector starts with .notebook, judged on a list's first selector; no bare px; no hex; exactly five @media conditions in order, so add no @media block), 80-115 and 700-710 (they pin the `.notebook-field .ink-field, .notebook-field input, .notebook-field textarea` rules: leave those untouched) and 959-965 (no ::placeholder rule declares a font-family).
- app/src/styles/app.css: 318-321 (global textarea: field-sizing content, resize none); 386-391 (global ::placeholder: ink, small print, italic); 982-992 (.ingredient-table__plan-grams and its field's width); 1162-1177 (.method-step__targets flex wrap; .target-chip inline-flex); 1228-1243 (.method-step__field display block; the open fields' first child; the target fields' width auto); 1318-1321 (.method-step__open-fields outline); 1522-1550 (.prose-field: padding --gap-hair 0, no border, line-height --sheet-leading-note; .prose-field--lead-in bold); 1554-1568 (.ink-field: padding --gap-hair/--gap-xs, border --rule-ink-field, line-height --sheet-leading-field, min-height --sheet-field-min-h); 2491-2550 (the coarse floor: .ink-field and .prose-field min-height --touch-min and font-size --sheet-type-note).
- Tests, by line at HEAD 83a786b3 (261101-nrh does not touch these files):
  - RecipeBand.test.jsx 36-63.
  - VersionRow.test.jsx 205-212 and 294-305.
  - IngredientTable.test.jsx 1080-1100, 1640-1690 and 1770-1785.
  - Method.test.jsx 1270-1312 (renderOpenStepPenBody and the opened-step test).
  - RecipePage.perStep.test.jsx 98-183 (flush, mountAt, buttonByText, buttonByLabel, click, setValue), 185-260, 310-335, 490-560, 587-750, 820-880 and 893-906.
  - RecipePage.drafts.test.jsx 200-232; RecipePage.strictMode.test.jsx 100-106; RecipePage.beforeYouStart.test.jsx 240-300; RecipePage.stalePen.test.jsx 100-155.
  - CreationSteps.test.jsx 428-440: the keydown helper to copy.

Checked at planning (HEAD 83a786b3, with 261101-nrh mid-execution):
- No non-test code under app/src selects any of these six fields by tag; the focus paths are refs (nameFieldRef, versionLineFieldRef, registerGramsInput).
- The only document-level keydown handlers on this page react to Escape (RecipePage.jsx 252-266, Shell.jsx). Button.jsx defaults to type 'button', so the ceremony form has no submit button and Return in Version name submitted the prevented form and did nothing.
- No rule in app.css, notebook.css or shell.css targets an untyped input element. The textarea-specific rules that reach these fields are app.css's global textarea rule, notebook.css's `.notebook-field textarea` (same declarations as for an input), and 261101-lec's grams rules, which already reach the developing grams field (RecipePage's root is `.notebook`).
- At a fine pointer every one of these fields is taller than its min-height, so no fine-pointer centring is needed.
</context>

<interfaces>
Helper, unchanged (app/src/ui/oneLineField.js):
- holdReturn(event) prevents the default of an Enter keydown unless an IME is composing (nativeEvent.isComposing, or keyCode 229). It never stops propagation.
- stripNewlines(text) removes every LF and CR.

The switched fields, by the tag-neutral selectors the probe and the new tests use (each finds the input in the base build and the textarea after), on /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1:
- rename (after pressing Rename, the button in `section[aria-label="Recipe"]`): `header.notebook-band [aria-label="Recipe name"]`; anchor `header.notebook-band`. Rename's Cancel is in `.notebook-recipe__form-actions`.
- ceremony (after pressing Next version): `form[aria-label="Next version"] [aria-label="Version name"]`; anchor `header.notebook-band`.
- grams (pen open, no step open): every `table.ingredient-table .ingredient-table__plan-grams .ink-field`, keyed by its aria-label ("Whole milk, grams, portion 1", "Heavy cream, grams", ...); anchor `table.ingredient-table`.
- steps (one open at a time, opened by the button `[aria-label="Step N, edit this step"]`, N = 1 to 10): `#method-step-N [aria-label="Step N, lead-in"]`, and for each target K `#method-step-N [aria-label="Step N, target K, label"]` and `... value"]`; anchor `#method-step-N`. Step 1 has one target, temp / room.

perStep test helpers (RecipePage.perStep.test.jsx): mountAt(VERSION_PATH) mounts Olive Oil v1 and returns the container; click(element); buttonByText(scope, text); buttonByLabel(label); setValue(element, value) sets the value through the prototype setter and dispatches input; current.container. Pen fields of Olive Oil v1: "Whole milk, grams, portion 1" and "portion 2" (the second holds 250.4, wider than its 52 px field at 16 px).
</interfaces>

<!-- planner-discipline-allow: .notebook .notebook-ceremony .notebook-field > textarea.ink-field -->
<!-- planner-discipline-allow: textarea.ink-field::placeholder -->

<tasks>

<task type="tracer">
  <name>Task 1: Rename's Recipe name as a one-row textarea, end to end, measured against the base build</name>
  <files>.planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs, app/src/ui/RecipeBand.jsx, app/src/styles/notebook.css, app/src/ui/RecipeBand.test.jsx, app/src/ui/RecipePage.perStep.test.jsx</files>
  <precondition>261101-nrh has landed on main: git status --porcelain app/src prints nothing, so the base build is HEAD; notebook.css contains nrh's rules `.notebook.mk-page .notebook-field textarea.ink-field` and `.notebook .mk-step textarea:is(.target-chip__label-field, .target-chip__value-field)`; nrh's probe file exists; /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs exists. If any of these fails, stop and report: this plan builds on nrh's rules and probe.</precondition>
  <action>
Step 0, before any edit under app/:
- Let S be /private/tmp/sprinkles-261101-nri. Create it.
- Write `git rev-parse HEAD` to S/head-before. This is the base: the tree after 261101-nrh, whatever its commit.
- Write the count of input-element openings in non-test .jsx under app/src to S/inputs-before, and the count of textarea-element openings to S/textareas-before, with the same grep -rho command Task 3's verify uses (include '*.jsx', exclude '*.test.jsx').
- Record the mtime of app/dist/index.html (stat -f %m) in S/dist-mtime.
- Record the full suite's totals from npm --prefix app test (files and tests, all passing).
- Never build into app/dist. Never contact ports 4173 or 8077 (Mark's preview serves app/dist; the sketch server). Never start vite dev or vite preview. The only Vite runs in this plan are builds into S, and each exits.

Step 1, write the probe at .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs by copying 261101-nrh's probe and changing only what this item needs. Keep its usage header shape, PLAYWRIGHT_CORE default and existence check, startServers from ../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs on ephemeral 127.0.0.1 ports with every other host aborted, clickUntil, focusByClick, execInsert, settle, ink (2 px inset), measureField (boxes relative to the anchor, the anchor's height), behave (K, N, R, P, L), one fresh context per config, record and check modes with PROBE_DIST, CONFIGS (1366x1024 fine, coarse, coarse DPR 2), engines webkit and chromium channel 'chrome' (a launch failure is a FAIL line), C1's rule that vertical padding is compared only at a fine pointer, and the PASS/FAIL/INFO output ending "N PASS, M FAIL" with exit 1 on any FAIL. Everything typed or printed is English. Changes:
- Header: this item's fields, groups and gates, as below.
- GROUPS: rename, ceremony, grams, steps. --field takes a comma list of them, or all (the default).
- ATTRS gains 'placeholder'.
- recordGroup records three passes, blurring document.activeElement and settling before each:
  - pass 1, as the flow leaves it: Recipe name holds the recipe's name; Version name is blank and shows its placeholder; every grams, lead-in and target field holds its seed value. Measure every field, with ink for every field showing text or a placeholder.
  - pass 2, blank: fill '' into every field of the group. Measure boxes, no ink.
  - pass 3, filled: a grams field takes '12.5', any other '12 Wq'. Measure with ink.
  - Also record per pass whether the field's value overflows it (scrollWidth greater than clientWidth plus 0.5).
  - Behaviour checks run only on fields flagged behave, each left holding its filled value and blurred.
- runConfig: go to /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 and wait for the h1 'Olive Oil Ice Cream, circulator'. Then:
  - rename: clickUntil Rename in `section[aria-label="Recipe"]` shows the Recipe name field; record the group (Recipe name, behave); clickUntil Cancel in `.notebook-recipe__form-actions` shows Rename again.
  - ceremony: clickUntil Next version shows `form[aria-label="Next version"]`; record the group (Version name, behave).
  - grams: enumerate the grams fields by aria-label in table order (throw if none); record the group with the first one flagged behave.
  - steps: count li.method-step (throw unless 10). For N = 1 to 10: clickUntil the "Step N, edit this step" button shows that step's lead-in; record the step's lead-in and every target field as part of one steps group, keyed "Step N lead-in", "Step N target K label" and "... value", anchored on #method-step-N; flag Step 1's lead-in, target 1 label and target 1 value behave.
  - A decimal field (grams) takes '1', LF, '2' in P and LONG_DIGITS in L; any other takes 'Probe', LF, 'text' and LONG_TEXT.
- check, after against base, per engine, config and field, each line printing both figures:
  - F0: after's tag is TEXTAREA with rows '1' and no type attribute; inputmode 'decimal' on grams, absent elsewhere; cols '20' on target fields, absent elsewhere; every other recorded attribute equals base's. Base's tag is printed as INFO.
  - F1: matchMedia('(pointer: coarse)') equals hasTouch. F2: the group's field keys are the same in both builds.
  - A1 (pass 1), E1 (pass 2) and B1 (pass 3): the field, parent, grandparent and sibling boxes, and the anchor height, within 0.5 px.
  - C1, I1 (passes 1 and 3), K1, N1 (next control's name also printed as INFO for the SUMMARY's device steps), R1, P1 and L1 as in nrh's probe.
- The ruled exceptions (spec section 3), each printed as INFO with both figures, and nothing else loosened:
  - Duty 4: a target field's width may be narrower than base's by 0 to 1 px in WebKit and 0 to 4 px in Chrome. The shifts list for a step holds every target field of that step, so inside the step's targets line (p.method-step__targets) a later box's left, and the width of a box holding a narrowed field, are compared after adding the accumulated difference back. Every vertical figure is gated as usual.
  - A value wider than its field: when after's field overflows in that pass, I1 compares the ink's top and bottom within 1 device px, and the ink's left and right may extend up to 4 CSS px further than base's on the cut side; more is a FAIL.
  - Version name's placeholder ink (pass 1): within 1 device px in WebKit; in Chrome the top and bottom within 2 CSS px and the left and right within 1 device px.
  - Long-text ink is never compared.

Step 2, record the base, still with no app/ edit:
- npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nri/base-dist --emptyOutDir
- PROBE_DIST=/private/tmp/sprinkles-261101-nri/base-dist node <probe> record /private/tmp/sprinkles-261101-nri/base.json
Both engines must record all three configs and all four groups. A record run can take several minutes: give it a 10-minute timeout or run it in the background. If a flow step fails at the base, fix the probe, not the app.

Step 3, RecipeBand.jsx (spec row 9):
- The Recipe name input element (line 76) becomes a textarea element. Drop type and add rows="1".
- Keep ref, className, autoFocus, disabled, value, aria-label, aria-invalid and aria-describedby exactly, in their order (RecipeBand.test.jsx line 61 reads aria-label before aria-invalid).
- onChange stores name: stripNewlines(event.target.value). Add onKeyDown={holdReturn}. Import both from './oneLineField.js'.
- Return did nothing here before (no form around it), so holding it keeps that (spec section 4).

Step 4, notebook.css, tokens only, every new selector beginning .notebook, one selector per line, no new @media block, and no selector written into a comment:
- Duty 1: add `.notebook .notebook-recipe__form .notebook-field > textarea.ink-field` to the selector list of nrh's `.notebook.mk-page textarea.ink-field` rule.
- Duty 2, labelled-above: add the same selector to the selector list of nrh's coarse `.notebook.mk-page .notebook-field textarea.ink-field` rule. Its padding-block formula (8 px padding, 1 px app rules, 16 px on the field line in the 44 px floor) is already this field's.
- Reword both rules' comments so they name the creation editor's and the recipe page's band fields, keeping bug-ipad-tab-lost-from-single-line-fields and the duty number.
These are the planning candidates; the probe is the acceptance. If a gate fails, adjust with tokens only and re-run. If no token-only rule passes a gate, stop: report the gate and its numbers in the SUMMARY, do not loosen a tolerance, and do not commit the failing state.

Step 5, tests:
- RecipeBand.test.jsx line 41: the name now renders as the textarea's text, so the regex reading it from a value attribute becomes `/<textarea[^>]*aria-label="Recipe name"[^>]*>Olive Oil Ice Cream, circulator<\/textarea>/`. Line 61 stays.
- RecipePage.perStep.test.jsx: setValue (line 165) picks the value setter by tag, as RecipePage.drafts.test.jsx line 225 does (the textarea's prototype for a TEXTAREA, the input's otherwise). Then, at the file's foot, add a describe naming bug-ipad-tab-lost-from-single-line-fields, with a keydown helper copied from CreationSteps.test.jsx lines 431-440, and tests per the behaviour below. Each test calls installMatchMedia and mountAt(VERSION_PATH), and opens Rename with click(buttonByText(section, 'Rename')) where section is `section[aria-label="Recipe"]`.
- Behaviour to prove (tests first, see them fail, then Step 3):
  - After Rename, the Recipe name field is a TEXTAREA with rows '1', no type attribute and class 'ink-field', and document.activeElement is that field (autoFocus kept).
  - A cancelable Enter keydown is default-prevented on it, and so is one with shiftKey; the value is unchanged.
  - setValue with 'Olive', LF, 'Oil', CR, LF leaves the field's value 'OliveOil'.
  - setValue '' then Save in the same section: the field is document.activeElement and has aria-invalid 'true' (the refusal's focus reaches the textarea).
- RecipePage.stalePen.test.jsx's Rename steps (lines 192-193) select by aria-label only and type through a tag-aware helper: they must keep passing unchanged.

Step 6, verify (see below), then commit. Use git add with the five explicit paths only, never -A: untracked .review-diagnostics, quick and quick-batches folders sit under .planning. The message is English: "fix: Rename's Recipe name is a one-row textarea, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2. Do not commit this PLAN or the SUMMARY.
  </action>
  <verify>
    <automated>npm --prefix app test -- RecipeBand RecipePage.perStep RecipePage.stalePen styles && test "$(grep -o '<input' app/src/ui/RecipeBand.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/RecipeBand.jsx | wc -l | tr -d ' ')" = 2 && test "$(grep -o 'onKeyDown={holdReturn}' app/src/ui/RecipeBand.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -cF 'value="Olive Oil Ice Cream, circulator"' app/src/ui/RecipeBand.test.jsx)" = 0 && test "$(grep -cF 'HTMLTextAreaElement.prototype' app/src/ui/RecipePage.perStep.test.jsx)" -ge 1 && test "$(grep -cF '.notebook .notebook-recipe__form .notebook-field > textarea.ink-field' app/src/styles/notebook.css)" -ge 2 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nri/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nri/after-dist node .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs record /private/tmp/sprinkles-261101-nri/after.json && node .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs check /private/tmp/sprinkles-261101-nri/after.json --base /private/tmp/sprinkles-261101-nri/base.json --field rename</automated>
  </verify>
  <done>
Baselines at HEAD 83a786b3, measured at planning:
- The probe's rename check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2.
- base.json holds all four groups in both engines and all three configs.
- RecipeBand.jsx: input openings 1 to 0; textarea openings 1 to 2.
- RecipeBand.test.jsx: the value-attribute read of the name 1 to 0.
- RecipePage.perStep.test.jsx: textarea prototype setter 0 to at least 1; four new tests.
- notebook.css: the Rename selector 0 to 2 (duty 1 and duty 2 lists).
- The targeted suites pass, including notebook.test.js and the stalePen Rename test.
- One commit holds the five files.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The version pen's Version name and grams fields as one-row textareas, with the placeholder duty and the RecipePage test sweep</name>
  <files>app/src/ui/VersionRow.jsx, app/src/ui/IngredientTable.jsx, app/src/styles/notebook.css, app/src/ui/VersionRow.test.jsx, app/src/ui/IngredientTable.test.jsx, app/src/ui/RecipePage.perStep.test.jsx, app/src/ui/RecipePage.drafts.test.jsx, app/src/ui/RecipePage.strictMode.test.jsx, app/src/ui/RecipePage.beforeYouStart.test.jsx, app/src/ui/RecipePage.stalePen.test.jsx</files>
  <behavior>
    - After Next version, Version name is a TEXTAREA with rows '1', no type attribute, class 'ink-field', required, placeholder 'e.g. less oil', and it is document.activeElement (autoFocus kept).
    - "Whole milk, grams, portion 1" is a TEXTAREA with rows '1', inputmode 'decimal', no type attribute and class 'ink-field'.
    - A cancelable Enter keydown, plain or with shiftKey, is default-prevented on Version name and on that grams field; the values are unchanged.
    - setValue on Version name with 'less', LF, 'milk', CR, LF leaves 'lessmilk'; setValue on the grams field with '1', LF, '00' leaves '100'.
    - The existing blocked-save tests keep passing after the sweep: a blank Version name is marked invalid and described; a blank Step 2 or Step 3 amount focuses and marks that grams field (RecipePage.perStep lines 625-747); the kept-draft tests read Version name and grams back (RecipePage.drafts, strictMode, stalePen).
    - VersionRow.test.jsx's static markup shows the textarea with the placeholder before the aria-label, and the textarea marked invalid and described by version-field-error.
    - IngredientTable.test.jsx's developing tbodies still hold exactly two grams fields each, now textareas, and the changed row's field holds 48 as its text.
  </behavior>
  <action>
This task touches ten files. Seven are test files whose selectors must land with the change, or the suite goes red between commits.

RED first.
- RecipePage.perStep.test.jsx: add the tests in the behaviour list above to Task 1's describe. Each mounts Olive Oil v1 and presses Next version with click(buttonByText(container, 'Next version')).
- Run them and see them fail against the input elements.

GREEN.
- VersionRow.jsx (spec row 6), lines 215-227: the Version name input element becomes a textarea element. Drop type and add rows="1". Keep ref, className, required, autoFocus, disabled, placeholder, value, aria-label, aria-invalid and aria-describedby exactly, in their order (VersionRow.test.jsx reads placeholder before aria-label). onChange calls onChangePenField('versionLabel', stripNewlines(event.target.value)). Add onKeyDown={holdReturn}, importing both from './oneLineField.js'. Return before submitted the ceremony form, whose submit is prevented and which has no submit button (Button defaults to type 'button'), so it did nothing; holding it keeps that.
- IngredientTable.jsx (spec row 10), GramsCell's developing branch, lines 186-198: the input element becomes a textarea element. Drop type and add rows="1". Keep ref (inputRef), inputMode, className, value, aria-label, aria-invalid and aria-describedby exactly. onChange calls onChangePenGrams(row.id, portionIndex, stripNewlines(event.target.value)). Add onKeyDown={holdReturn}; both are already imported at line 12. The as-made field at line 459 belongs to 261101-nrj: leave it.
- notebook.css, tokens only, with Task 1's rules (one selector per line, none in a comment, no new @media block):
  - Duty 1: add `.notebook .notebook-ceremony .notebook-field > textarea.ink-field` to nrh's `.notebook.mk-page textarea.ink-field` rule's list.
  - Duty 2: add the same selector to nrh's coarse labelled-above rule's list.
  - Duty 5 (spec section 3): after the duty 1 rule add a rule for `.notebook .notebook-ceremony .notebook-field > textarea.ink-field::placeholder` declaring line-height: calc(var(--sheet-leading-field) * var(--app-notebook-size-body)). Inside the existing (pointer: coarse) block, after nrh's labelled-above rule, add the same selector declaring line-height: calc(var(--sheet-leading-field) * var(--sheet-type-note)). Declare no font-family (notebook.test.js line 959). Comment: the global ::placeholder sets small print, which a textarea starts at the top of its line; the field's own line height puts 'e.g. less oil' back on the field's line, as the input drew it.
  - Grams takes 261101-lec's `.notebook .ingredient-table` rules as they stand (spec duty 3: it needs nothing more). Add nothing for it.
  - If WebKit's placeholder gate fails, or a token-only form brings Chrome closer (for example the textarea's line-height as calc(var(--sheet-leading-field) * 1em) with the placeholder inheriting it), keep whichever passes every other gate and record the choice in the SUMMARY.

Sweep the tests that name these two fields by the old tag. These are every hit at HEAD 83a786b3, by line; in each, only the tag changes (to textarea) unless said otherwise:
- RecipePage.perStep.test.jsx:
  - Version name selectors at 222, 251, 317, 497, 538, 630, 645, 668 and 764.
  - grams selectors at 329, 631 and 646.
  - the label helpers at 589, 659 and 825 (each serves only Version name and developing grams). The helper at 753 serves the as-made fields and stays for 261101-nrj.
  - line 742: the check that no grams field in the table is marked invalid would pass vacuously once the fields are textareas, so its selector names the textarea tag.
- RecipePage.drafts.test.jsx: versionNameField (207) and gramsField (211, used only for developing grams at 290, 291 and 391). churnDateField and measuredField (451, 455) are the record pen's and stay.
- RecipePage.strictMode.test.jsx: versionNameField (104).
- RecipePage.beforeYouStart.test.jsx: the Version name selector (273), and the first-ingredient-field selector (298), which in the pen finds the first grams field.
- RecipePage.stalePen.test.jsx: the grams selector in typeIntoPen (153).
- VersionRow.test.jsx: the two static-markup regexes at 210 and 302 open with the textarea tag; the rest of each regex stays.
- IngredientTable.test.jsx: the three counts of input tags in a developing tbody (1654, 1683, 1781) count textarea tags instead, still 2; line 1098, which read the value attribute 48, reads `>48</textarea>` instead.
The value setters in drafts, beforeYouStart and stalePen are already tag-aware, and perStep's became so in Task 1.

The probe is the acceptance, with the same stop rule as Task 1. If the probe needed a fix, add it to this commit by its path.

Commit with git add of the explicit paths only. The message is English: "fix: the version pen's Version name and grams fields are one-row textareas, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.
  </action>
  <verify>
    <automated>npm --prefix app test -- VersionRow IngredientTable RecipePage styles && test "$(grep -o '<input' app/src/ui/VersionRow.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/VersionRow.jsx | wc -l | tr -d ' ')" = 2 && test "$(grep -o '<input' app/src/ui/IngredientTable.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o '<textarea' app/src/ui/IngredientTable.jsx | wc -l | tr -d ' ')" = 2 && test "$(grep -o 'onKeyDown={holdReturn}' app/src/ui/IngredientTable.jsx | wc -l | tr -d ' ')" = 2 && test "$(cat app/src/ui/RecipePage.perStep.test.jsx app/src/ui/RecipePage.drafts.test.jsx app/src/ui/RecipePage.strictMode.test.jsx app/src/ui/RecipePage.beforeYouStart.test.jsx | grep -cF 'input[aria-label="Version name"]')" = 0 && test "$(grep -cF 'input[aria-label="Whole milk, grams' app/src/ui/RecipePage.perStep.test.jsx)" = 0 && test "$(grep -cF 'input[aria-label^="Whole milk"]' app/src/ui/RecipePage.stalePen.test.jsx)" = 0 && test "$(grep -cF 'input[aria-label="${label}"]' app/src/ui/RecipePage.perStep.test.jsx)" = 1 && test "$(grep -cF 'input[aria-label="${label}"]' app/src/ui/RecipePage.drafts.test.jsx)" = 0 && test "$(cat app/src/ui/RecipePage.perStep.test.jsx app/src/ui/RecipePage.beforeYouStart.test.jsx | grep -cF 'ingredient-table input')" = 0 && test "$(grep -cF '<input /g' app/src/ui/IngredientTable.test.jsx)" = 0 && test "$(grep -cF 'value="48"' app/src/ui/IngredientTable.test.jsx)" = 0 && test "$(grep -cF '/<input[^>]*placeholder=' app/src/ui/VersionRow.test.jsx)" = 0 && test "$(grep -cF '/<input[^>]*aria-invalid="true"' app/src/ui/VersionRow.test.jsx)" = 0 && test "$(grep -cF '.notebook .notebook-ceremony .notebook-field > textarea.ink-field' app/src/styles/notebook.css)" -ge 4 && test "$(grep -cF 'textarea.ink-field::placeholder' app/src/styles/notebook.css)" -ge 2 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nri/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nri/after-dist node .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs record /private/tmp/sprinkles-261101-nri/after.json && node .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs check /private/tmp/sprinkles-261101-nri/after.json --base /private/tmp/sprinkles-261101-nri/base.json --field rename,ceremony,grams</automated>
  </verify>
  <done>
Baselines at HEAD 83a786b3, measured at planning:
- The probe's rename, ceremony and grams check prints 0 FAIL for webkit and chrome at all three configs; the overflowing grams values and the Chrome placeholder residual are printed as INFO.
- VersionRow.jsx: input openings 1 to 0; textarea openings 1 to 2.
- IngredientTable.jsx: input openings 2 to 1 (the as-made field stays for 261101-nrj); textarea openings 1 to 2; holdReturn 1 to 2.
- Version name selected by the input tag in the four RecipePage test files: 12 to 0. Developing grams selected by the input tag: perStep 3 to 0, stalePen 1 to 0. The input-tag label helper: perStep 4 to 1 (the as-made one), drafts 1 to 0. The table-wide input selector in perStep and beforeYouStart: 2 to 0.
- IngredientTable.test.jsx: input-tag counts 3 to 0; the value-attribute read 1 to 0. VersionRow.test.jsx: the two input-tag regexes 2 to 0.
- notebook.css: the ceremony selector 0 to at least 4 (duty 1, duty 2, the two placeholder rules); the placeholder pseudo-element 0 to at least 2.
- One commit.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: The open pen step's lead-in and target fields as one-row textareas, and the full proof</name>
  <files>app/src/ui/Method.jsx, app/src/styles/notebook.css, app/src/ui/Method.test.jsx, app/src/ui/RecipePage.perStep.test.jsx</files>
  <behavior>
    - After Next version and the "Step 1, edit this step" button, "Step 1, lead-in" is a TEXTAREA with rows '1', no type attribute and class 'prose-field prose-field--lead-in'.
    - "Step 1, target 1, label" and "Step 1, target 1, value" are TEXTAREA with rows '1', cols '20', no type attribute, and classes 'ink-field target-chip__label-field' and 'ink-field target-chip__value-field'.
    - A cancelable Enter keydown, plain or with shiftKey, is default-prevented on all three; the values are unchanged.
    - setValue on the lead-in with 'Lecithin', LF, 'into the oil' leaves 'Lecithininto the oil'; setValue on the target label with 'te', LF, 'mp' leaves 'temp'.
    - Method.test.jsx's opened-step test (renderOpenStepPenBody(3)) finds the lead-in rendered as a textarea.
  </behavior>
  <action>
RED first.
- RecipePage.perStep.test.jsx: add the perStep tests in the behaviour list above to Task 1's describe. Open the step with click(buttonByLabel('Step 1, edit this step')), as the uses-line test at line 897 opens step 2.
- Method.test.jsx line 1307: the positive check for an input tag in the opened step becomes `expect(markup).toMatch(/<textarea[^>]*class="prose-field prose-field--lead-in"/)`. Nothing else in that test changes.
- Run them and see them fail.

GREEN.
- Method.jsx, import holdReturn and stripNewlines from './oneLineField.js'.
- The lead-in (spec row 13), lines 156-162: the input element becomes a textarea element. Drop type and add rows="1". Keep className, value and aria-label exactly. onChange calls onChangePenStepField(step.n, 'leadIn', stripNewlines(event.target.value)). Add onKeyDown={holdReturn}.
- The two target fields (spec rows 14 and 15), lines 195-208: both input elements become textarea elements. Drop type, add rows="1" and cols="20" (spec duty 4: the input took the browser's default width of 20 characters). Keep className, value and aria-label exactly. onChange calls onChangePenStepTarget(step.n, index, 'label' or 'value', stripNewlines(event.target.value)). Add onKeyDown={holdReturn}.
- Done differently (line 472) belongs to 261101-nrj: leave it. Return did nothing at these three fields before (no form on the page's Sheet), so holding it keeps that.
- notebook.css, tokens only (one selector per line, none in a comment, no new @media block). The pen's open fields sit in .method-step__open-fields, which only the version pen renders:
  - Duty 3, lead-in: add `.notebook .method-step__open-fields > .method-step__field:has(> textarea.prose-field--lead-in)` to the list of 261101-lec's `.notebook .mk-step .method-step__field:has(> textarea.prose-field--lead-in)` rule (flex column, which hands the step's grid the first line's text baseline, as the input's did).
  - Duty 1, lead-in: add `.notebook .method-step__open-fields textarea.prose-field--lead-in` to the list of lec's top-level `.notebook .mk-step textarea.prose-field--lead-in` rule.
  - Duty 2, lead-in: add the same selector to the list of lec's coarse `.notebook .mk-step textarea.prose-field--lead-in` rule. Its formula (the 1.5 note leading, no rules, in the 44 px floor) is the pen lead-in's: .prose-field in both.
  - Duty 1, targets: add `.notebook .method-step__open-fields textarea.ink-field` to the list of nrh's `.notebook.mk-page textarea.ink-field` rule.
  - Duty 2, targets: add the same selector to the list of lec's coarse grams centring rule (`.notebook .ingredient-table textarea.ink-field`, which nrh widened). Its formula (--gap-hair padding, two --rule-ink-field rules, the field leading) is the targets' family.
  - Duty 4, targets: add `.notebook .method-step__open-fields textarea:is(.target-chip__label-field, .target-chip__value-field)` to the list of nrh's field-sizing fixed rule.
  - Reword each widened rule's comment so it names the version pen's open step beside the creation editor, keeping its bug id and duty number.

Then run:
- the full suite;
- every count gate in verify;
- a fresh after build;
- the probe with --field all.

Commit the four files with git add of explicit paths only (plus the probe if it needed a fix). The message is English: "fix: the version pen's step lead-in and target fields are one-row textareas, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.

Write the SUMMARY at .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-SUMMARY.md. Leave it uncommitted. It records:
- the base commit (S/head-before) and the three commit hashes;
- the probe's tally per engine, config and group (PASS/FAIL counts), and the final "N PASS, M FAIL" line;
- the INFO lines for the target width differences, the overflowing grams values, Version name's placeholder ink in both engines, and the base paste values, and the N1 next-control names;
- the duty 5 form kept, if Task 2 changed it;
- the test totals before (Step 0) and after;
- whether app/dist/index.html's mtime still equals Step 0's. If it differs, say whether any command of this plan wrote there: Mark may rebuild by hand between waves.
- A "Deferred Human Verification" section for the orchestrator's iPad check (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off, build served by preview --host; the executor never builds app/dist). One numbered step per line, each with an "Expect:" where it has a result, naming the next control as the probe's N1 printed it:
  1. Open Olive Oil Ice Cream, circulator, Version 1.
  2. Tap Rename, then press Tab in Recipe name. Expect: focus moves to Recipe description, not out of the page.
  3. Press Return in Recipe name. Expect: nothing is inserted. Then Cancel.
  4. Tap Next version. Expect: 'e.g. less oil' sits in Version name where it sat on the previous build.
  5. Type a version name and press Tab. Expect: focus moves to Why.
  6. Tap a grams field in the table and press Tab. Expect: focus moves to the next control N1 named.
  7. Tap "edit this step" on Step 1, tap its lead-in and press Tab. Expect: focus moves to the instruction.
  8. Tap the target label and press Tab twice. Expect: focus moves to the value, then on.
  9. Press Return in a grams field, the lead-in and a target. Expect: nothing is inserted.
  10. Look at every switched field against the previous build. Expect: same size, same text position.
  There are no Mark's List writes in this plan: the executor has no ArtifactData.
- Notes for the orchestrator:
  - Sid's probe (.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs) selects by the input tag, so it no longer sees these fields. It was not edited.
  - RecipePage.perStep.test.jsx line 753's label helper and RecipePage.drafts.test.jsx's measuredField still select by the input tag: they serve the record pen's fields, which are 261101-nrj's.
  - No aria-multiline was added, as 261101-lec decided.
  - DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams". That line is Impeccable's to update after the batch.
  - The recipe page's duty selectors are in the same rules as the creation editor's (.notebook-recipe__form, .notebook-ceremony, .method-step__open-fields scopes); 261101-nrj can widen the same lists for the record pen.
  </action>
  <verify>
    <automated>npm --prefix app test && test "$(grep -o '<input' app/src/ui/Method.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o '<textarea' app/src/ui/Method.jsx | wc -l | tr -d ' ')" = 6 && test "$(grep -o 'cols="20"' app/src/ui/Method.jsx | wc -l | tr -d ' ')" = 2 && test "$(grep -o 'onKeyDown={holdReturn}' app/src/ui/Method.jsx | wc -l | tr -d ' ')" = 3 && test "$(grep -cF "expect(markup).toContain('<input');" app/src/ui/Method.test.jsx)" = 0 && test "$(grep -cF '.notebook .method-step__open-fields > .method-step__field:has(> textarea.prose-field--lead-in)' app/src/styles/notebook.css)" -ge 1 && test "$(grep -cF '.notebook .method-step__open-fields textarea.prose-field--lead-in' app/src/styles/notebook.css)" -ge 2 && test "$(grep -cF '.notebook .method-step__open-fields textarea.ink-field' app/src/styles/notebook.css)" -ge 2 && test "$(grep -cF '.notebook .method-step__open-fields textarea:is(.target-chip__label-field, .target-chip__value-field)' app/src/styles/notebook.css)" -ge 1 && test "$(grep -rho '<input' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nri/inputs-before) - 6 ))" && test "$(grep -rho '<textarea' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nri/textareas-before) + 6 ))" && CHANGED="$(git diff --name-only "$(cat /private/tmp/sprinkles-261101-nri/head-before)" HEAD -- app/src)" && test -z "$(printf '%s\n' "$CHANGED" | grep -vE '^app/src/(ui/(VersionRow|RecipeBand|IngredientTable|Method)\.jsx|ui/(VersionRow|RecipeBand|IngredientTable|Method|RecipePage\.(perStep|drafts|strictMode|beforeYouStart|stalePen))\.test\.jsx|styles/notebook\.css)$')" && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nri/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nri/after-dist node .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs record /private/tmp/sprinkles-261101-nri/after.json && node .planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-field-probe.mjs check /private/tmp/sprinkles-261101-nri/after.json --base /private/tmp/sprinkles-261101-nri/base.json --field all</automated>
  </verify>
  <done>
Baselines at HEAD 83a786b3, measured at planning:
- The full suite passes: Step 0's file count, and Step 0's test count plus the new ones; none deleted.
- Method.jsx: input openings 4 to 1 (Done differently stays for 261101-nrj); textarea openings 3 to 6; cols 20 written twice; holdReturn 0 to 3.
- Method.test.jsx: the positive input-tag check 1 to 0.
- notebook.css: the open-fields selectors 0 to at least 1 (duty 3), 2 (lead-in duties 1 and 2), 2 (targets duties 1 and 2) and 1 (duty 4).
- App-wide non-test .jsx: input openings Step 0 minus 6; textarea openings Step 0 plus 6.
- No file under app/src outside the fifteen named app and test files changed since Step 0.
- The probe's --field all check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2.
- Three commits on main, and the SUMMARY carries the evidence and the deferred device check.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker input to pen draft | Typed or pasted text in the six fields enters the pen draft, the kept draft in IndexedDB and the saved version (or the recipe record, for Rename) through the repository seam |
| scratch probe to network | The probe serves scratch builds on 127.0.0.1 and drives local browsers |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261101-nri-01 | Tampering | the six fields' onChange handlers | low | mitigate | stripNewlines removes every LF and CR before onChangePenField, onChangePenGrams, onChangePenStepField, onChangePenStepTarget or Rename's setFields see the value, so no multi-line name, amount, lead-in or target reaches the draft, the store, the Sheet or the print's one-line projections. Values still render as React text (no dangerouslySetInnerHTML, per project convention); the new perStep tests prove the stripping on each site |
| T-261101-nri-02 | Information disclosure | 261101-nri-field-probe.mjs | low | mitigate | It serves only scratch builds under /private/tmp on ephemeral 127.0.0.1 ports via 08-walk-server.mjs, aborts every request to another host, never binds 0.0.0.0, and never contacts Mark's preview on 4173 or the sketch server on 8077 |
| T-261101-nri-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. playwright-core is the existing npx cache at the path the probe names, and PNG decoding runs in the browser |
</threat_model>

<verification>
- The automated commands of Tasks 1, 2 and 3 pass as written.
- `git log -3 --format=%s` shows the three fix commits. `git show --stat` on each lists only the files named in its task (plus the probe where a task fixed it).
- No vite dev or vite preview process was started, and port 4173 still has only Mark's preview listening.
</verification>

<success_criteria>
- The version pen's Version name, grams, step lead-in and target label and value, and Rename's Recipe name, are one-row textareas that keep every attribute. Return and pasted line breaks leave each value on one line, and every focus request still lands.
- The probe proves box, neighbours, ink, placeholder, focus ring, Tab order, Return, paste and long text against the base build in WebKit and Chrome at 1366 fine, coarse and coarse DPR 2, with 0 FAIL. The only differences are the ruled ones: the pen's target widths, an overflowing value's extra 2 to 4 px, and Chrome's placeholder residual.
- Every duty rides an existing 261101-lec or 261101-nrh rule's selector list, except the placeholder pair.
- The full suite is green, and no other field in the app changed (count and diff gates).
- The iPad Tab check is handed to the orchestrator as deferred human verification.
</success_criteria>

<output>
Create `.planning/quick/261101-nri-version-pen-and-rename-one-line-fields-become-one-row-textar/261101-nri-SUMMARY.md` when done
</output>
