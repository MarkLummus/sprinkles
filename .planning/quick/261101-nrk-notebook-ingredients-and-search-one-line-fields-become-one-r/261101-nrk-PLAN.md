---
phase: quick-261101-nrk
plan: 01
quick_id: 261101-nrk
type: execute
wave: 2
depends_on: ["261101-nrh"]
files_modified:
  - .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs
  - app/src/ui/oneLineField.js
  - app/src/ui/SheetCodeSearch.jsx
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/IngredientsPlace.jsx
  - app/src/styles/shell.css
  - app/src/styles/shell.test.js
  - app/src/ui/SheetCodeSearch.test.jsx
  - app/src/ui/NotebookPlace.test.jsx
  - app/src/ui/Shell.creationGuard.test.jsx
  - app/src/ui/IngredientsPlace.test.jsx
autonomous: true
requirements:
  - bug-ipad-tab-lost-from-single-line-fields

must_haves:
  truths:
    - "The three place fields are one-row textarea elements (rows '1', no type attribute) that keep every attribute they had. Sheet code (SheetCodeSearch.jsx) keeps ref, class ink-field, autocomplete off, autocapitalize characters, spellcheck false and enterkeyhint go, and adds cols '20'. The Notebook's New recipe Name (NotebookPlace.jsx) keeps ref, class ink-field, autocomplete off, aria-label Name, and its aria-invalid and aria-describedby wiring. The Ingredients Name filter (IngredientsPlace.jsx) keeps ref, class ink-field, autocomplete off, spellcheck false and enterkeyhint search. Source: .impeccable/proposals/2026-11-01-one-line-fields.md sections 2 to 5, DESIGN.md Fields 'One-line field'."
    - "Return in Sheet code and in New recipe Name submits the form exactly as the input's implicit submission did. Enter and Shift+Enter click the form's default button once, so the form's onSubmit runs once: Find runs, or the recipe starts. Nothing happens while that button is disabled (Find before the versions load). Control, Alt or Meta with Enter submits nothing, as both engines' inputs did when measured at planning. No key ever inserts a line break. While an IME composes, Return is left alone and submits nothing."
    - "Return in the Ingredients Name filter inserts nothing and submits nothing (holdReturn), with or without a modifier. Before, its implicit submission reached an onSubmit that only prevented the default, so nothing changes on the page (spec section 4)."
    - "A line break that arrives by paste or any other edit never reaches the code, the name or the filter (stripNewlines)."
    - "The fields look as they did at the Step 0 base build. The 261101-nrk probe compares an after build against a base build. It runs in Playwright WebKit and Chrome (channel 'chrome') at 1366x1024 fine, 1366x1024 coarse, 1366x1024 coarse DPR 2 and 393x852 coarse DPR 3, and prints 0 FAIL. Boxes within 0.5 px: the field, its label, caption, form and named neighbours, and the place root's height. This holds empty, filled, refused (Notebook) and with long text, so Find never drops below the field. Text ink within 1 device px. Computed type, colour, horizontal padding and borders equal. :focus-visible and outline equal after a click. Tab lands on the same next control. Return and paste behave as the truths above say."
    - "Every CSS duty is tokens-only and lives in shell.css under .place, where the place forms are styled. Duty 1: one scrolled line, for all three fields. Duty 2: the line centred in the coarse floor, all three. Duty 4: Sheet code keeps the input's width through field-sizing fixed. shell.test.js's place-condition guard admits the Search form's search__ class beside nb__ and ing__."
    - "No other field changes. Non-test .jsx under app/src counts 3 fewer input-element openings and 3 more textarea-element openings than at Step 0. Since Step 0, git shows no change under app/src outside this plan's ten app files."
    - "npm --prefix app test passes with at least Step 0's test count plus the new tests, in the same number of files; no test is deleted."
    - "Device-verified only by Mark, deferred to the orchestrator. On his iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off), Tab leaves each of the three fields for the next control. Return runs Find and starts the recipe. On the iPhone, the Sheet code field looks as before and Go runs Find."
  artifacts:
    - path: app/src/ui/oneLineField.js
      provides: "submitOnReturn beside holdReturn and stripNewlines: Return clicks the form's default button (implicit submission), modifiers and IME composition excluded"
      contains: "export function submitOnReturn"
    - path: app/src/ui/SheetCodeSearch.jsx
      provides: "Sheet code as a one-row, 20-column textarea whose Return runs Find"
      contains: "onKeyDown={submitOnReturn}"
    - path: app/src/ui/NotebookPlace.jsx
      provides: "New recipe Name as a one-row textarea whose Return starts the recipe"
      contains: "onKeyDown={submitOnReturn}"
    - path: app/src/ui/IngredientsPlace.jsx
      provides: "The Name filter as a one-row textarea whose Return is held"
      contains: "onKeyDown={holdReturn}"
    - path: app/src/styles/shell.css
      provides: "Token-only duties 1, 2 and 4 for the three place fields"
      contains: "field-sizing: fixed"
    - path: .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs
      provides: "Record and check of the three place fields against a scratch base build, in WebKit and Chrome"
      contains: "record"
  key_links:
    - from: app/src/ui/SheetCodeSearch.jsx
      to: app/src/ui/oneLineField.js
      via: "onKeyDown={submitOnReturn}; onChange hands stripNewlines(event.target.value) to setCode"
      pattern: "submitOnReturn"
    - from: app/src/ui/NotebookPlace.jsx
      to: app/src/ui/oneLineField.js
      via: "onKeyDown={submitOnReturn}; onChange hands stripNewlines(event.target.value) to setName"
      pattern: "submitOnReturn"
    - from: app/src/ui/IngredientsPlace.jsx
      to: app/src/ui/oneLineField.js
      via: "onKeyDown={holdReturn}; onChange hands stripNewlines(event.target.value) to setQuery"
      pattern: "holdReturn"
    - from: app/src/styles/shell.css
      to: app/src/styles/notebook.css
      via: "notebook.css's .notebook-field .ink-field rule gives these fields 8 px block padding and 1 px app rules. Its coarse rule gives them 16 px text, and app.css gives them the 44 px floor. shell.css's coarse padding-block centres the textarea's one line in that floor, as the input centred its own."
      pattern: "padding-block: max\\(var\\(--app-notebook-gap-tight\\)"
    - from: app/src/styles/shell.test.js
      to: app/src/styles/shell.css
      via: "the guard over the places' three media conditions admits a selector naming nb__, ing__ or search__, so the Search form's coarse rule passes"
      pattern: "\\(nb\\|ing\\|search\\)__"
---

<objective>
Mark's answer on bug-ipad-tab-lost-from-single-line-fields ("fix": Sid rules on the field kind, then a quick-batch switches them) and on decide-one-line-fields (serving-only, 2026-11-01; no signed field is in this item). This item switches the three one-line fields outside the creation editor and the pens. Siblings 261101-nrh, -nri and -nrj switch the creation editor, the version pen and Rename, and the record pen.

Root cause, device-verified on Mark's iPad (.planning/debug/ipad-magic-keyboard-tab-create.md): iPadOS 27 Safari drops a hardware Tab from every input element and sends focus out of the page, while a one-row textarea takes it. Quick 261101-lec built the pattern: app/src/ui/oneLineField.js holdReturn and stripNewlines, with tokens-only CSS. Mark passed it on the iPad. Sid's ruling (.impeccable/proposals/2026-11-01-one-line-fields.md) extends it to every remaining one-line field. Section 4 adds that where Return does something today, it keeps doing it.

The three sites (line numbers at planning, HEAD 83a786b3; no sibling touches these files):
- SheetCodeSearch.jsx 97, Sheet code on the Search place. It is the only text field of a form whose submit runs Find, so Return keeps submitting the form.
- NotebookPlace.jsx 232, Name in the Notebook's New recipe entry. It is the only text field of a form whose submit starts the recipe, so Return keeps submitting the form.
- IngredientsPlace.jsx 192, the Name filter on the Ingredients place. Its form's submit is prevented, so Return did nothing and is held.

Measured at planning, on a scratch build of the base (Playwright WebKit and Chrome; 1366 fine, 1366 coarse, 1366 coarse DPR 2 and 393 coarse DPR 3):
- Implicit submission. In all three fields, both engines' inputs submit the form once on Enter and once on Shift+Enter. On Control+Enter, Alt+Enter and Meta+Enter they submit nothing.
- With duty 1 (white-space pre, overflow hidden) and duty 2 (nrh's labelled-above formula, coarse only), a swapped one-row textarea matches the input in each field. Box and text ink are identical, pixel for pixel, in every config and both engines. The vertical padding is 10.2 px against 8 px at coarse; that is the duty.
- Sheet code needs duty 4. Its label is a flex item (flex 1 1 auto) sized from its content, so a content-sized textarea grows with long text: the Find button wraps under the field (form 63 to 119 px high at 1366 coarse; the same at 393). With field-sizing fixed, every box matches the input, empty and with long text. The Ingredients Name (fixed flex basis) and New recipe Name (column flex) do not need it.
- Duty 3 (block parents) does not apply: each field sits in label.notebook-field, a flex column. Duty 5 (placeholder) does not apply: none of the three has one.

Claude's discretion, recorded:
- The duty rules go in shell.css under .place, not in 261101-nrh's notebook.css rules. notebook.css is scoped to the .notebook root (notebook.test.js), and these fields live in the .place pages that shell.css styles (.place .search__form, .place .nb__new, .place .ing__filters). The declarations are the same tokens and formula nrh uses for the creation editor's labelled-above fields.
- shell.css's guard over the places' three media conditions (shell.test.js) admits only selectors naming nb__ or ing__ classes. The Search form's coarse rule names search__, so the guard's pattern widens by that one class. Search is a place, and the guard's purpose holds: no shell chrome rule sits under a place condition.
- submitOnReturn clicks the form's default button rather than calling form.requestSubmit(). HTML defines implicit submission as exactly that click. It submits once, and it does nothing while the button is disabled: Find is disabled until the versions load, and requestSubmit would still fire the submit event. Both submit handlers already guard that state, but the click is the exact equivalent the item asks for.
- oneLineField.js's header comment still describes only 261101-lec's two fields. This plan adds its own comment above submitOnReturn and does not rewrite the header (surgical; a sibling may also touch it).
- No aria-multiline, as 261101-lec decided.

Purpose: with the Magic Keyboard on the iPad, Tab moves on from Sheet code, New recipe Name and the Ingredients filter. Return still runs Find and still starts a recipe. Nothing looks different on the iPad or the iPhone.
Output:
- a probe, with its base and after evidence;
- submitOnReturn in oneLineField.js;
- the three sites as one-row textareas;
- token-only CSS in shell.css and the guard widened in shell.test.js;
- a test sweep with new tests.
Three commits, one per task.
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
@app/src/ui/oneLineField.js
@app/src/ui/SheetCodeSearch.jsx

Read by range, not whole:
- .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-PLAN.md. Read its Task 1 action, Steps 0 to 2: the probe's shape, the gate names, the scratch build commands and the stop rule.
- 261101-nrh's probe, .planning/quick/261101-nrh-creation-editor-one-line-fields-become-one-row-textareas-for/261101-nrh-field-probe.mjs. It exists once 261101-nrh has landed. Read its helpers and its record/check skeleton.
- If nrh's probe is absent, read 261101-lec's instead: .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs, lines 1-140 (usage header, PLAYWRIGHT_CORE check, clickUntil, focusByClick, execInsert, settle, openPage).
- app/src/ui/NotebookPlace.jsx:
  - lines 1-14, the imports;
  - lines 170-259, NotebookHead: its comment at 170-174 ("Start is the form's submit button, so a click and Enter take the one path", which stays true), handleSubmit at 201-208, the Name field at 232-245, then FieldFeedback and the Cancel/Start actions.
- app/src/ui/IngredientsPlace.jsx:
  - lines 1-9, the imports;
  - lines 154-180, state and clearFilters, which focuses nameRef;
  - lines 182-222, the form: the JSX comment at 185-188, the Name field at 192-201, then the Category select.
- app/src/styles/shell.css:
  - 352-368, the Search form and its label (flex 1 1 auto);
  - 478-498, the New recipe form;
  - 539-569, the Ingredients filters;
  - 876-894, the places' (pointer: coarse) block.
  - The file header, lines 21-24: two roots only, .shell and .place.
- app/src/styles/shell.test.js:
  - 36-47, the media constants and the comment over the places' three;
  - 49-58, no hex or bare px;
  - 96-112, the guard this plan widens;
  - 141-152, exactly five @media blocks. Add no @media block.
- app/src/styles/notebook.css:
  - 743-760, the .notebook-field base rule, which reaches the place fields;
  - the (pointer: coarse) block's .notebook-field font-size rule, about line 2061 at planning;
  - nrh's coarse rule commented "The labelled-above fields (bug-ipad-tab-lost-from-single-line-fields, duty 2)". It is the formula's source. Read it; do not edit notebook.css.
- app/src/styles/app.css:
  - 314-321, the global textarea rule: field-sizing content, resize none;
  - 1554-1568, .ink-field: line-height --sheet-leading-field, min-height --sheet-field-min-h;
  - 2491-2504 and 2541-2547, the coarse floor: min-height --touch-min, 16 px text.
- Tests, by line at planning:
  - SheetCodeSearch.test.jsx 1-100: the store mock with store.load, mount, and the type, submit, nextFrame and typeAndSubmit helpers. Its first field test pins the old element type. 170-235: the focus assertions after Find. 284-306: the pending-load test.
  - NotebookPlace.test.jsx 495-545: mount with path tracking, the nameField, line, press, open, type, submit and deferredSave helpers. 547-650: the entry tests.
  - IngredientsPlace.test.jsx 86-91 (typeName) and 205-234 (Clear filters, and the Enter-submits-nothing test).
  - Shell.creationGuard.test.jsx 402-410 (its type helper) and 545-560 (the one test that types into the Notebook's Name).
  - CreationSteps.test.jsx 428-441: 261101-lec's keydown helper, with the keyCode defineProperty trick.
  - CreationFlow.test.jsx 179-217: field and type helpers, both already tag-neutral, and startVanilla, which walks New recipe, Name and Start. It is 261101-nrh's file; this plan only runs it.
</context>

<interfaces>
Helpers in app/src/ui/oneLineField.js (holdReturn and stripNewlines unchanged):
- holdReturn(event) prevents the default of an Enter keydown unless an IME is composing (nativeEvent.isComposing true, or keyCode 229). It never stops propagation.
- stripNewlines(text) removes every LF and CR.
- New: submitOnReturn(event), for a one-line field that is the only text field of a form whose submit acts. It returns at once unless event.key is 'Enter'. It returns at once while an IME composes (the same two tests as holdReturn). Otherwise it prevents the default. Then, unless event.ctrlKey, event.altKey or event.metaKey is set, it clicks the form's default button: the first entry of event.currentTarget.form.elements whose type is 'submit'.

Pattern, as 261101-lec and 261101-nrh wire it: a textarea with rows="1", onKeyDown set to the helper, and onChange passing stripNewlines(event.target.value) on. Every other attribute is kept and no type attribute is written.

The fields, by tag-neutral selectors (the same selector finds the input at the base and the textarea after):
- search: route /search. Field `.search__form .ink-field`. Neighbours: `form.search__form`, `.search__form .notebook-field` (label), `.search__form .notebook-caption`, `.search__form button` (Find), `#sheet-code-result`.
- notebook: route /notebook, then press New recipe (clickUntil `form.nb__new`). Field `form.nb__new .ink-field`. Neighbours: `form.nb__new`, `form.nb__new .notebook-field`, `form.nb__new .notebook-caption`, `form.nb__new .field-error` (when present), `.nb__new-actions` and its two buttons, `.nb__count`, the first `li.nb__row`.
- ingredients: route /ingredients. Field `.ing__filters .ing__field:not(.ing__field--category) .ink-field`. Neighbours: `form.ing__filters`, that field's label and caption, `.ing__field--category` and its select, `.ing__status`, the first `li.ing__row` or else `.ing__none`.
- Anchor for every group: `.list-page.place`. All boxes are relative to it, and its height is recorded.

Store shapes the tests assert on: repository.saveDraft's first call's first argument has payload.name (NotebookPlace.test.jsx). SheetCodeSearch.test.jsx lands on `[data-testid="landed"]`, whose text is recipeId/versionId. oliveOilVersion.sheetCode is the stored code.
</interfaces>

<tasks>

<task type="tracer">
  <name>Task 1: Sheet code as a one-row textarea whose Return still runs Find, end to end, measured against the base build</name>
  <files>.planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs, app/src/ui/oneLineField.js, app/src/ui/SheetCodeSearch.jsx, app/src/styles/shell.css, app/src/styles/shell.test.js, app/src/ui/SheetCodeSearch.test.jsx</files>
  <precondition>261101-nrh's commits are on main. git status --porcelain app/src prints nothing, so the base build is the Step 0 tree. /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs exists (the probe checks it and fails loudly otherwise).</precondition>
  <action>
This tracer touches six files: the probe, the helper, the component, its stylesheet, that stylesheet's guard test and the component's test. Each app edit is small, and the guard and test edits must land with the change or the suite goes red.

Step 0, before any edit under app/:
- Let S be /private/tmp/sprinkles-261101-nrk. Create it.
- Write `git rev-parse HEAD` to S/head-before.
- Write the count of input-element openings in non-test .jsx under app/src to S/inputs-before, and the count of textarea-element openings to S/textareas-before. Use the same grep -rho command as Task 3's verify, with include '*.jsx' and exclude '*.test.jsx'.
- Record the mtime of app/dist/index.html (stat -f %m).
- Record the full suite's totals from npm --prefix app test (tests and files, all passing).
- Never build into app/dist. Never contact port 4173, where Mark's vite preview serves app/dist. Never start vite dev or vite preview. The only Vite runs in this plan are builds into S, and each exits.

Step 1, write the probe at .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs.
Start from a copy of 261101-nrh's probe and keep its skeleton:
- the usage header listing every gate;
- the PLAYWRIGHT_CORE default and its existence check;
- startServers({ appRoot }) from ../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs on ephemeral 127.0.0.1 ports, aborting every request to another host;
- clickUntil, focusByClick, execInsert (document.execCommand insertText), settle, and ink() with the 2 px inset;
- one fresh context per config;
- record and check modes, with PROBE_DIST naming the build.
If nrh's probe is absent, build the same skeleton from 261101-lec's probe, and take the measure from Sid's: the field box, its parent's and grandparent's boxes, each sibling's box (element children, and non-blank text nodes through a Range), the padding box and the computed style.
Replace nrh's creation flows and groups with the three groups in the interfaces section. Measure every named neighbour and the anchor's height. Never pin a width or restyle anything: the probe compares two real builds. Output is PASS, FAIL and INFO lines ending "N PASS, M FAIL", with exit 1 on any FAIL. Everything typed or printed is English.

Engines: webkit, and chromium with channel 'chrome'. Both are required: a launch failure is a FAIL line.

Configs, all gated:
- 1366x1024 fine;
- 1366x1024 coarse (hasTouch true);
- 1366x1024 coarse at DPR 2;
- 393x852 coarse at DPR 3. The Search, Notebook and Ingredients places all serve the phone.

Flow per config, in one context, in this order: /search, then /ingredients, then /notebook last, because the Notebook's final Return starts a recipe. Wait for networkidle and fonts, then settle. Per group:
- E, empty: blur, then measure the field as the page leaves it.
- F, filled: focus by click, keyboard.type the value, blur, measure, and take the ink. Values: search 'K7QM 2X9D'; notebook 'Probe sorbet'; ingredients 'Whole milk'.
- K: click into the field. Record matches(':focus-visible') and the computed outline-style, outline-width and outline-offset.
- N: with the field focused by click, press Tab. Record the new active element's aria-label, or else the caption text of its closest label, or else its trimmed text, or else its tag and class.
- P: fill '', then execInsert two parts joined by a line feed: search 'K7QM', LF, '2X9D'; notebook 'Probe', LF, 'sorbet'; ingredients 'Whole', LF, 'milk'. Record the value. Also record the submit events counted meanwhile by a capturing submit listener the probe puts on the field's form.
- L: fill '', focus by click, and keyboard.type 'The long probe text keeps going past the right edge of this field'. Blur, then record every box, the anchor height, the field height, scrollLeft (read before the blur), and the two scrollbar figures (offsetWidth minus clientWidth minus the side borders, and the same for height).
- R, the Return checks:
  - search: fill '' and type 'K7QM2X9'. With the field focused by click, press Enter, Shift+Enter, Control+Enter, Alt+Enter and Meta+Enter in turn. After each: wait 150 ms, then record the submit count since the last press, the value, whether the field has focus, the text of #sheet-code-result and location.pathname. Then fill '', type '00000000', press Enter, wait 150 ms, and record the same.
  - notebook: fill '' (a blank name), then the same five presses with the same records, plus the text of the field's .field-error and its aria-invalid. Then measure the refused state's boxes. Last, type 'Probe sorbet' and press Enter. Wait for `.notebook.mk-page`, then record location.pathname and the value of `.notebook.mk-page [aria-label="Recipe name"]`.
  - ingredients: fill '' and type 'milk', then the same five presses with the same records, plus the text of `.ing__count` and the first `.ing__name`.

Record per field, per pass:
- the tag;
- the attributes: rows, cols, type, inputmode, class, aria-label, aria-describedby, aria-invalid, required, placeholder, autocomplete, autocapitalize, spellcheck, enterkeyhint;
- the boxes;
- the computed font-family, font-size, font-weight, line-height, letter-spacing, color, text-align, padding (all four), border widths (all four), border-top-color, background-color, border-radius, min-height, box-sizing, resize, white-space, overflow-x, overflow-y and field-sizing;
- the scrollbar figures;
- pass F only: the text ink box within the padding box, in device px.

check takes --base <base.json> and --field with a comma list of search, notebook and ingredients, or all (the default). Gates, after against base, per engine, config and field; each line prints both figures:
- F0: after's tag is TEXTAREA with rows '1' and no type attribute. cols is '20' on search and absent on the other two. Every other recorded attribute equals base's. Base's tag is printed as INFO.
- F1: matchMedia('(pointer: coarse)') equals hasTouch.
- E1 (pass E) and B1 (pass F): every recorded box and the anchor height, within 0.5 px.
- C1: font, size, weight, line-height, letter-spacing, colour, text-align, horizontal padding, border widths, border colour, background, radius, min-height and box-sizing are equal. On after only: resize is none, white-space is pre, both overflow axes are hidden, and both scrollbar figures are 0.
- C2: at fine, the vertical padding equals base's. At coarse, after's top and bottom padding are equal within 0.01 px. Both builds' vertical padding is printed as INFO. Search's field-sizing is printed as INFO: 'fixed' after.
- I1: the ink box is within 1 device px.
- K1: equal.
- N1: the same next control. Its name is printed as INFO for the SUMMARY's device steps.
- P1: after's value is the two parts joined with nothing between them: 'K7QM2X9D', 'Probesorbet' or 'Wholemilk'. After's submit count is 0. Base's value and count are printed as INFO.
- L1: on after, the height equals after's pass-F height within 0.5 px, scrollLeft is greater than 0, and both scrollbar figures are 0. Base's scrollLeft is printed as INFO.
- L2: every recorded box and the anchor height in pass L are within 0.5 px of base's pass L. This is the duty-4 proof: Find stays beside Sheet code.
- R1: for each of the five presses, the value is unchanged with no line break, focus is kept, and location.pathname, the status or line text and aria-invalid all equal base's. For search and notebook, the submit count also equals base's; at planning that was 1, 1, 0, 0, 0 in both engines. For ingredients, after's submit count is 0 for every press, and base's counts are printed as INFO: its submit only prevented the default.
- R2: search's well-formed unknown code leaves '/search' and the line 'No version has this code.' in both builds. Notebook's refused-state boxes are within 0.5 px.
- R3: notebook's last Return lands on '/notebook/new' with Recipe name 'Probe sorbet', in both builds.
Long-text ink is never compared: a value wider than its box shows 2 to 4 px more of itself, which spec section 3 rules acceptable.

Step 2, record the base, still with no app/ edit:
- npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrk/base-dist --emptyOutDir
- PROBE_DIST=/private/tmp/sprinkles-261101-nrk/base-dist node <probe> record /private/tmp/sprinkles-261101-nrk/base.json
Both engines must record all four configs and all three groups. If a flow step fails at the base, fix the probe, not the app.

Step 3, oneLineField.js. Add the exported submitOnReturn below holdReturn, as the interfaces section defines it. Leave holdReturn, stripNewlines and the file header unchanged. Its comment names bug-ipad-tab-lost-from-single-line-fields and spec section 4, and says:
- It is for a one-line field that is the only text field of a form whose submit acts.
- A textarea does not submit on Return, so this does what the input's implicit submission did: Enter or Shift+Enter clicks the default button once.
- Control, Alt and Meta with Enter submit nothing, as both engines' inputs did when measured (2026-11-01).
- No key ever inserts a line break, and an IME composing is left alone.
- It clicks the button rather than calling requestSubmit because HTML defines implicit submission as that click, which does nothing while the button is disabled.
Both callers sit in a form with a default button. Use optional chaining on the find result and write no other guard.

Step 4, SheetCodeSearch.jsx, lines 97-107:
- Turn the input element into a textarea element. Drop type. Add rows="1" and cols="20". The cols is duty 4: the label is a flex item sized from its content, so the field keeps the input's 20-character width.
- Keep ref, className, value, autoComplete, autoCapitalize, spellCheck and enterKeyHint exactly.
- onChange calls setCode(stripNewlines(event.target.value)). Add onKeyDown={submitOnReturn}. Import both from './oneLineField.js'.
- handleSubmit is untouched. Its fieldRef focus works on the textarea.

Step 5, shell.css. Tokens only. Every selector begins with .place. No new @media block.
- After the `.place .search__form .notebook-field` rule (about line 368), add two rules, each with a short comment naming bug-ipad-tab-lost-from-single-line-fields and its duty number:
  - `.place .notebook-field textarea.ink-field`, declaring white-space: pre and overflow: hidden (duty 1). All three place fields sit in label.notebook-field, so this one rule also serves Tasks 2 and 3.
  - `.place .search__form textarea.ink-field`, declaring field-sizing: fixed (duty 4).
- Inside the places' existing (pointer: coarse) block (about lines 880-894), after the `.place .ing__status` rule, add a rule for `.place .search__form textarea.ink-field` declaring padding-block: max(var(--app-notebook-gap-tight), calc((var(--touch-min) - var(--sheet-leading-field) * 1em - 2 * var(--app-rule-row)) / 2)).
  - Comment it: duty 2; app.css's coarse floor centres an input's line in 44 px but starts a textarea's at the top, and this padding centres it. The formula is the one 261101-nrh wrote for the creation editor's labelled-above fields: 16 px on the field line, 8 px padding, 1 px app rules.
  - Tasks 2 and 3 add their selectors to this rule's list.

Step 6, shell.test.js, the guard at lines 96-112. Widen its class pattern from nb__ and ing__ to nb__, ing__ and search__, in the regular expression, the assertion message and the test title alike. In the comment over the places' constants (lines 41-45), add one clause: under the touch floor, the Search place's search__ form joins them (bug-ipad-tab-lost-from-single-line-fields). Change nothing else in the file.

These CSS rules are the planning candidates, already measured identical in a swap at planning. The probe is the acceptance. If a gate fails, adjust with tokens only and re-run. If no token-only rule passes a gate, stop: report the gate and its numbers in the SUMMARY, do not loosen a tolerance, and do not commit the failing state.

Step 7, SheetCodeSearch.test.jsx:
- Every selector that finds the field by the input tag names the textarea tag. These are the type helper and the focus and attribute assertions: 10 lines at planning.
- The type helper takes the value setter from HTMLTextAreaElement's prototype.
- Rewrite the first field test (about line 98) so it asserts what the field is now: tagName TEXTAREA, rows '1', cols '20', no type attribute, class ink-field, autocomplete off, autocapitalize characters, spellcheck false, enterkeyhint go. Keep its label assertion.
- Add a describe naming bug-ipad-tab-lost-from-single-line-fields. Use a keydown helper like CreationSteps.test.jsx's (lines 430-440), but async and wrapped in act. Count submit events with a listener on the form. It covers:
  - Return on '0000-0000': default prevented, one submit, after nextFrame the status reads 'No version has this code.', and focus is in the field.
  - Return on oliveOilVersion.sheetCode lands on olive-oil-ice-cream/olive-oil-ice-cream-v1.
  - Shift+Return submits once. Return with Control, Alt or Meta is default-prevented and submits nothing.
  - Return while an IME composes (isComposing true, and separately keyCode 229) is not prevented and submits nothing.
  - Before the versions load (store.load pending, Find disabled), Return is prevented, submits nothing and writes no line. After release, Return lands.
  - type with 'K7QM', LF, '2X9D', CRLF leaves the value 'K7QM2X9D'.

Step 8, verify (below), then commit. Use git add with the six explicit paths only, never -A: untracked .review-diagnostics and quick-batches folders sit under .planning. The message is English: "fix: the Search place's Sheet code is a one-row textarea and Return still runs Find, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)". Then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2. Do not commit this PLAN or the SUMMARY.
  </action>
  <verify>
    <automated>npm --prefix app test -- SheetCodeSearch styles && test "$(grep -o '<input' app/src/ui/SheetCodeSearch.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/SheetCodeSearch.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o 'cols="20"' app/src/ui/SheetCodeSearch.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o 'onKeyDown={submitOnReturn}' app/src/ui/SheetCodeSearch.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o '^export function submitOnReturn' app/src/ui/oneLineField.js | wc -l | tr -d ' ')" = 1 && test "$(grep -o '^export function' app/src/ui/oneLineField.js | wc -l | tr -d ' ')" = 3 && test "$(grep -c "querySelector('input')" app/src/ui/SheetCodeSearch.test.jsx)" = 0 && test "$(grep -c 'HTMLInputElement.prototype' app/src/ui/SheetCodeSearch.test.jsx)" = 0 && test "$(grep -c "toBe('text')" app/src/ui/SheetCodeSearch.test.jsx)" = 0 && test "$(grep -o 'field-sizing: fixed' app/src/styles/shell.css | wc -l | tr -d ' ')" = 1 && test "$(grep -c 'textarea\.ink-field' app/src/styles/shell.css)" -ge 3 && test "$(grep -o '(nb|ing|search)__' app/src/styles/shell.test.js | wc -l | tr -d ' ')" = 1 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrk/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrk/after-dist node .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs record /private/tmp/sprinkles-261101-nrk/after.json && node .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs check /private/tmp/sprinkles-261101-nrk/after.json --base /private/tmp/sprinkles-261101-nrk/base.json --field search</automated>
  </verify>
  <done>
Baselines measured at planning:
- The probe's search check prints 0 FAIL for webkit and chrome at all four configs. base.json holds all three groups in both engines.
- SheetCodeSearch.test.jsx and the styles suites pass, including shell.test.js and notebook.test.js.
- SheetCodeSearch.jsx: input openings 1 to 0; textarea openings 0 to 1.
- oneLineField.js: exports 2 to 3.
- SheetCodeSearch.test.jsx: input-tag selectors 10 to 0; the input prototype setter 1 to 0; the old element-type assertion 1 to 0.
- shell.css: textarea.ink-field rules 0 to 3; field-sizing 0 to 1.
- shell.test.js: the widened pattern 0 to 1.
- One commit holds the six files.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The Notebook's New recipe Name as a one-row textarea whose Return still starts the recipe</name>
  <files>app/src/ui/NotebookPlace.jsx, app/src/styles/shell.css, app/src/ui/NotebookPlace.test.jsx, app/src/ui/Shell.creationGuard.test.jsx</files>
  <behavior>
    - The open entry's Name is a TEXTAREA with rows '1', no type attribute, class ink-field, autocomplete 'off' and aria-label 'Name'. It has focus when the entry opens.
    - A cancelable Enter keydown on a typed name 'Vanilla' is default-prevented. It writes exactly one draft whose payload.name is 'Vanilla', and the path becomes '/notebook/new'.
    - Shift+Enter starts it the same way. Enter with Control, Alt or Meta is default-prevented and writes nothing.
    - Enter over a blank name refuses as Start does: the line reads 'Enter a recipe name.', aria-invalid is 'true', nothing is written, and the path stays '/notebook'.
    - Enter while an IME composes (isComposing true; separately keyCode 229) is not prevented and writes nothing.
    - Two Returns before the write resolves write one draft, the same guard two Start presses meet.
    - Typing 'Va', LF, 'nil', CRLF, 'la' leaves the field 'Vanilla', and Start writes payload.name 'Vanilla'.
    - Every existing entry test passes after the selector and setter sweep, and so do Shell.creationGuard's fast Start-and-leave test and CreationFlow's New recipe tests.
  </behavior>
  <action>
RED first. NotebookPlace.test.jsx:
- The nameField helper (about line 515) selects the textarea inside the New recipe form.
- The type helper (about lines 524-530) takes the value setter from HTMLTextAreaElement's prototype.
- Add a describe naming bug-ipad-tab-lost-from-single-line-fields beside the entry tests. Cover the behaviour above with the file's mount, open, press, line, deferredSave and path helpers, and an async keydown helper wrapped in act, modelled on CreationSteps.test.jsx lines 430-440.
- Run the tests and see them fail against the input element.

GREEN.
- NotebookPlace.jsx, lines 232-245:
  - Turn the Name input element into a textarea element. Drop type. Add rows="1".
  - Keep ref, className, autoComplete, value, aria-label, aria-invalid and aria-describedby exactly.
  - onChange calls setName(stripNewlines(event.target.value)), then setRequired(false) as now.
  - Add onKeyDown={submitOnReturn}. Import both from './oneLineField.js'.
  - handleSubmit, handleCancel and the focus effect are untouched. The NotebookHead comment, "Start is the form's submit button, so a click and Enter take the one path", stays true: Return clicks Start.
- shell.css: inside the places' (pointer: coarse) block, add `.place .nb__new textarea.ink-field` to the selector list of Task 1's duty-2 rule. Duty 1 is already served by Task 1's top-level rule. Duty 4 does not apply here: the New recipe form is a column flex, and the field is measured identical with long text.
- Shell.creationGuard.test.jsx, the type helper at lines 402-408: take the setter from the prototype that matches the element, as CreationFlow.test.jsx's type helper does at about line 191. Its one caller types into the Notebook's Name. Nothing else in the file changes.
- CreationFlow.test.jsx needs no edit (its field and type helpers are already tag-neutral), but its New recipe tests must pass.

The probe is the acceptance, with Task 1's stop rule. If the probe needed a fix, add it to this commit by its path.

Commit with git add of the explicit paths only. The message is English: "fix: the Notebook's New recipe Name is a one-row textarea and Return still starts the recipe, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)". Then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.
  </action>
  <verify>
    <automated>npm --prefix app test -- NotebookPlace Shell.creationGuard CreationFlow styles && test "$(grep -o '<input' app/src/ui/NotebookPlace.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/NotebookPlace.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o 'onKeyDown={submitOnReturn}' app/src/ui/NotebookPlace.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -c 'nb__new input' app/src/ui/NotebookPlace.test.jsx)" = 0 && test "$(grep -c 'HTMLInputElement.prototype' app/src/ui/NotebookPlace.test.jsx)" = 0 && test "$(grep -c 'HTMLTextAreaElement' app/src/ui/Shell.creationGuard.test.jsx)" -ge 1 && test "$(grep -o '\.place \.nb__new textarea\.ink-field' app/src/styles/shell.css | wc -l | tr -d ' ')" = 1 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrk/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrk/after-dist node .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs record /private/tmp/sprinkles-261101-nrk/after.json && node .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs check /private/tmp/sprinkles-261101-nrk/after.json --base /private/tmp/sprinkles-261101-nrk/base.json --field search,notebook</automated>
  </verify>
  <done>
Baselines measured at planning:
- The probe's search and notebook check prints 0 FAIL for webkit and chrome at all four configs, including R3: Return in Name lands on /notebook/new with the typed Recipe name in both builds.
- NotebookPlace.jsx: input openings 1 to 0; textarea openings 0 to 1.
- NotebookPlace.test.jsx: the input-tag Name selector 1 to 0; the input prototype setter 1 to 0.
- Shell.creationGuard.test.jsx: textarea prototype reads 0 to at least 1.
- shell.css: the nb__new textarea selector 0 to 1.
- One commit.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: The Ingredients Name filter as a one-row textarea whose Return is held, and the full proof</name>
  <files>app/src/ui/IngredientsPlace.jsx, app/src/styles/shell.css, app/src/ui/IngredientsPlace.test.jsx</files>
  <behavior>
    - The Name filter is a TEXTAREA with rows '1', no type attribute, class ink-field, autocomplete 'off', spellcheck 'false' and enterkeyhint 'search'.
    - With 'milk' typed, a cancelable Enter keydown, plain or with Shift, Alt, Control or Meta, is default-prevented. No submit event reaches the form. The value stays 'milk' and the count stays '5 of 26 ingredients'.
    - Enter while an IME composes (isComposing true; separately keyCode 229) is not prevented.
    - Typing 'mi', LF, 'lk' leaves the field 'milk' and filters as 'milk' ('5 of 26 ingredients').
    - Clear filters still empties Name and puts focus on it. The existing test that dispatches a submit event on the form still finds it default-prevented.
  </behavior>
  <action>
RED first. IngredientsPlace.test.jsx:
- typeName (lines 86-91) selects the Name field as the textarea with class ink-field, and takes the value setter from HTMLTextAreaElement's prototype.
- The other three selectors that name the field by the input tag (about lines 215, 219 and 232) name the textarea tag.
- Add a describe naming bug-ipad-tab-lost-from-single-line-fields. It covers the behaviour above, using mountList, count, clearButton and a keydown helper like CreationSteps.test.jsx's (lines 430-440), and a submit listener on form.ing__filters.
- Run the tests and see them fail.

GREEN.
- IngredientsPlace.jsx, lines 192-201:
  - Turn the Name input element into a textarea element. Drop type. Add rows="1".
  - Keep ref, className, value, autoComplete, spellCheck and enterKeyHint exactly.
  - onChange calls setQuery(stripNewlines(event.target.value)). Add onKeyDown={holdReturn}. Import both from './oneLineField.js'.
  - Reword the JSX comment above the form (lines 185-188), which this change makes wrong. The new comment says: Name is a one-row textarea for the iPad's Tab (bug-ipad-tab-lost-from-single-line-fields), and its Return is held, so it inserts nothing and submits nothing. The filters apply as they are typed, and the form's submit stays default-prevented so nothing can reload the page.
- shell.css: inside the places' (pointer: coarse) block, add `.place .ing__filters textarea.ink-field` to the selector list of Task 1's duty-2 rule. Duty 4 does not apply here: the field's flex basis is a token, not its content, and it is measured identical with long text.

Then run:
- the full suite;
- every count and diff gate in verify;
- a fresh after build;
- the probe with --field all.
Commit the three files with git add of explicit paths only, plus the probe if it needed a fix. The message is English: "fix: the Ingredients place's Name filter is a one-row textarea, so iPad Tab moves on (bug-ipad-tab-lost-from-single-line-fields)". Then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.

Write the SUMMARY at .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-SUMMARY.md. Leave it uncommitted. It records:
- the probe's tally per engine, config and group, and the final "N PASS, M FAIL" line;
- the INFO lines: base paste values and counts, Ingredients' base submit counts, both builds' vertical padding, Search's field-sizing, and the N1 next-control names;
- the test totals at Step 0 and after;
- the three commit hashes;
- whether app/dist/index.html's mtime still equals Step 0's. If it differs, say whether any command of this plan wrote there: Mark may rebuild by hand between waves.

The SUMMARY's "Deferred Human Verification" section is for the orchestrator's device check. Each step names the next control as the probe's N1 printed it. The build is served by preview --host; the executor never builds app/dist.
- On the iPad (iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off):
  - From Sheet code, New recipe Name and the Ingredients Name, Tab moves to the next control and not out of the page.
  - Return in Sheet code on a code nothing has reads "No version has this code." and keeps focus there.
  - Return in New recipe Name, with a name typed, opens the creation editor with that name.
  - Return in the Ingredients Name inserts nothing, and the list stays filtered.
  - Each field looks as it did on the previous build.
- On the iPhone (393): Sheet code looks as before, Find stays beside it with a long entry, and the keyboard's Go runs Find. The Ingredients Name's search key inserts nothing.
There are no Mark's List writes in this plan: the executor has no ArtifactData.

Notes for the orchestrator:
- Sid's probe (.impeccable/proposals/2026-11-01-one-line-fields-probe.mjs) selects by the input tag, so it no longer sees these fields. It was not edited.
- shell.test.js's place-condition guard now admits search__.
- submitOnReturn clicks the default button rather than calling requestSubmit, for the disabled-Find case.
- DESIGN.md's One-line field entry still says "Built so far for the creation lead-in and grams". That line is Impeccable's to update after the batch.
- oneLineField.js's header comment still names only 261101-lec's fields.
- No aria-multiline was added.
  </action>
  <verify>
    <automated>npm --prefix app test && test "$(grep -o '<input' app/src/ui/IngredientsPlace.jsx | wc -l | tr -d ' ')" = 0 && test "$(grep -o '<textarea' app/src/ui/IngredientsPlace.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -o 'onKeyDown={holdReturn}' app/src/ui/IngredientsPlace.jsx | wc -l | tr -d ' ')" = 1 && test "$(grep -c 'input\.ink-field' app/src/ui/IngredientsPlace.test.jsx)" = 0 && test "$(grep -c 'HTMLInputElement.prototype' app/src/ui/IngredientsPlace.test.jsx)" = 0 && test "$(grep -o '\.place \.ing__filters textarea\.ink-field' app/src/styles/shell.css | wc -l | tr -d ' ')" = 1 && test "$(grep -rho '<input' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrk/inputs-before) - 3 ))" && test "$(grep -rho '<textarea' app/src --include='*.jsx' --exclude='*.test.jsx' | wc -l | tr -d ' ')" = "$(( $(cat /private/tmp/sprinkles-261101-nrk/textareas-before) + 3 ))" && CHANGED="$(git diff --name-only "$(cat /private/tmp/sprinkles-261101-nrk/head-before)" HEAD -- app/src)" && test -z "$(printf '%s\n' "$CHANGED" | grep -vE '^app/src/(ui/(SheetCodeSearch|NotebookPlace|IngredientsPlace)\.jsx|ui/oneLineField\.js|ui/(SheetCodeSearch|NotebookPlace|IngredientsPlace|Shell\.creationGuard)\.test\.jsx|styles/shell\.(css|test\.js))$')" && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-nrk/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-nrk/after-dist node .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs record /private/tmp/sprinkles-261101-nrk/after.json && node .planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-field-probe.mjs check /private/tmp/sprinkles-261101-nrk/after.json --base /private/tmp/sprinkles-261101-nrk/base.json --field all</automated>
  </verify>
  <done>
Baselines measured at planning:
- The full suite passes, in the same number of files as Step 0 and with at least Step 0's test count plus the new tests. No test is deleted.
- IngredientsPlace.jsx: input openings 1 to 0; textarea openings 0 to 1.
- IngredientsPlace.test.jsx: the input-tag ink-field selector 4 to 0; the input prototype setter 1 to 0.
- shell.css: the ing__filters textarea selector 0 to 1.
- App-wide non-test .jsx: input openings Step 0 minus 3; textarea openings Step 0 plus 3.
- No file under app/src outside the ten named ones changed since Step 0.
- The probe's --field all check prints 0 FAIL for webkit and chrome at all four configs.
- Three commits on main. The SUMMARY carries the evidence and the deferred device check.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker input to page | Typed or pasted text in Sheet code, New recipe Name and the Ingredients filter enters React state. The Notebook's Name then reaches a create draft in IndexedDB through the repository seam. |
| maker input to navigation | Sheet code's submit navigates to a stored version's page |
| scratch probe to network | The probe serves scratch builds on 127.0.0.1 and drives local browsers |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261101-nrk-01 | Tampering | the three fields' onChange handlers | low | mitigate | stripNewlines removes every LF and CR before setCode, setName or setQuery sees the value, so no multi-line code, recipe name or filter reaches state, the draft or the store. Names still render as React text children; there is no dangerouslySetInnerHTML, per project convention. |
| T-261101-nrk-02 | Spoofing | Sheet code's Return path | low | mitigate | submitOnReturn only clicks the form's own default button. The landing path stays built by notebookPath from the stored version's ids, never from the typed text (T-04-03, unchanged handleSubmit). |
| T-261101-nrk-03 | Denial of service | Return on a disabled Find | low | mitigate | The click on a disabled default button does nothing, as implicit submission does. handleSubmit's own guard on unloaded versions stays. This is proven by the pending-load test. |
| T-261101-nrk-04 | Information disclosure | 261101-nrk-field-probe.mjs | low | mitigate | It serves only scratch builds under /private/tmp, on ephemeral 127.0.0.1 ports via 08-walk-server.mjs. It aborts every request to another host, never binds 0.0.0.0, and never contacts Mark's preview on 4173. |
| T-261101-nrk-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. playwright-core is the existing npx cache at the path the probe names, and PNG decoding runs in the browser. |
</threat_model>

<verification>
- The automated commands of Tasks 1, 2 and 3 pass as written.
- `git log -3 --format=%s` shows the three fix commits. `git show --stat` on each lists only the files named in its task, plus the probe where a task fixed it.
- No vite dev or vite preview process was started, and port 4173 still has only Mark's preview listening.
</verification>

<success_criteria>
- Sheet code, New recipe Name and the Ingredients Name filter are one-row textareas that keep every attribute.
- Return still runs Find and still starts a recipe, once per press, exactly where an input's implicit submission did: Enter and Shift+Enter, never with Control, Alt or Meta, nothing while Find is disabled, and nothing during IME composition.
- Return in the filter inserts nothing. Pasted line breaks never reach any of the three.
- The probe proves box, neighbours (Find stays beside the code with long text), ink, focus ring, Tab order, Return, paste and long text against the base build, in WebKit and Chrome at 1366 fine, coarse, coarse DPR 2 and 393 coarse, with 0 FAIL.
- The full suite is green, and no other field in the app changed (count and diff gates).
- The iPad Tab and Return checks and the iPhone Search check are handed to the orchestrator as deferred human verification.
</success_criteria>

<output>
Create `.planning/quick/261101-nrk-notebook-ingredients-and-search-one-line-fields-become-one-r/261101-nrk-SUMMARY.md` when done
</output>
