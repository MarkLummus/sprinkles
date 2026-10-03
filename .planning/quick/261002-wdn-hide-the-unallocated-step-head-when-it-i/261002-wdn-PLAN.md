---
phase: quick-261002-wdn
plan: 01
quick_id: 261002-wdn
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs
  - .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-baseline.json
autonomous: true
requirements: [REC1-01]

estimate:
  tokens: 80000
  raw_tokens: 80000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "When every portion falls in the Unallocated group, so it is the only group, the ingredient table renders no step-head row. Coconut v1 and v2 assign every portion to step 1 but have an empty method, which produces exactly this case. It holds in reading, with a batch in view, while recording, in Show changes and in the pen. Every portion row and the Total row still render (Mark, 2026-10-02, option 1)."
    - "When at least one numbered group sits alongside Unallocated, both heads still render, so the safety label shows whenever some portions resolve and some do not. This holds in reading and in the pen's draft table."
    - "A table with only numbered groups is unchanged. Mexican Chocolate v4 measures identical to the pre-change baseline in Playwright WebKit and system Chrome, at 393 coarse and at 1920: same step heads, rows, cell boxes and Total."
    - "No layout shift beyond the removed row. On the built app, in both engines and at both widths, each Coconut table loses height equal to the baseline head row's height (within 1px). Every ingredient row's height, every cell box and the Total match the baseline within 0.5px. The first ingredient row starts where the head row used to start. Page horizontal overflow is unchanged."
    - "Show changes still marks struck figures (decision 24) and the pen still offers every grams field: the table's struck-value count and grams-input count equal the baseline's in every state."
    - "`npm --prefix app test` passes at 55 files. The baseline is 1511 tests; the new tests are added and none are removed. `npm --prefix app run build` succeeds."
    - "Under app/, this task's commits change only app/src/ui/IngredientTable.jsx and app/src/ui/IngredientTable.test.jsx. No stylesheet, token, sketch, canvas-generator or .impeccable file is touched."
  artifacts:
    - path: app/src/ui/IngredientTable.jsx
      provides: "the step-head row guarded by showStepHeads: false only when the groups array is one group whose displayNumber is null"
      contains: "showStepHeads"
    - path: app/src/ui/IngredientTable.test.jsx
      provides: "lone-Unallocated (reading, Show changes, pen), mixed and numbered-only cases"
      contains: "261002-wdn"
    - path: .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs
      provides: "baseline / tracer / matrix groups measuring the built app in WebKit and system Chrome"
    - path: .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-baseline.json
      provides: "the pre-change table geometry for every probe cell, captured from a build of the unchanged source"
  key_links:
    - from: app/src/ui/IngredientTable.jsx
      to: groupPortionsByStep
      via: "the groups array it returns decides showStepHeads; the grouping function itself is unchanged"
      pattern: "groupPortionsByStep\\(rows, stepsForGrouping, currentStepNumbers\\)"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/IngredientTable.jsx
      via: "the single consumer (~line 1951). Reading, batch, recording, Show changes, the pen and print all render this one component."
      pattern: "<IngredientTable"
---

<objective>
Hide the "Unallocated" step head in the ingredient table when it would be the only group. Keep it whenever a numbered group sits alongside it.

Purpose: Coconut v1 and v2 (app/src/data/coconut.js) assign every portion to step 1, but their method is empty. groupPortionsByStep therefore resolves no step and puts every row under one trailing "Unallocated" head. A lone head like that labels nothing and reads as an error. The label exists to separate resolved portions from unresolved ones, so it only earns its place when both kinds are present. Mark chose option 1 on 2026-10-02: "hide the head when it's the only group".

Output: a guarded step-head row in IngredientTable.jsx, written test-first. An audit of every place the step-head row is assumed. A probe that measures the built app before and after the change in WebKit and system Chrome. A SUMMARY with the numbers. Mark's device check is deferred to him.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/IngredientTable.jsx
@app/src/ui/IngredientTable.test.jsx
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs

<interfaces>
These are the facts the planner read at HEAD b1fa78f. Re-check them before relying on them.

- IngredientTable.jsx lines 20-43, `groupPortionsByStep(rows, steps, stepNumberMap)`: when a portion's step does not resolve through `displayNumberOf`, or the map is null, the portion goes into one `{ displayNumber: null, leadIn: null, entries }` group, pushed last. Numbered groups sort ascending.
- IngredientTable.jsx line 446: `const groups = groupPortionsByStep(rows, stepsForGrouping, currentStepNumbers);`. While developing, `stepsForGrouping` is `draftVersion.method`; otherwise it is the `steps` prop.
- IngredientTable.jsx lines 659-675: `<tbody>` maps `groups` to a `<Fragment key={group.displayNumber ?? 'unallocated'}>`. Each fragment holds one `<tr className="ingredient-table__step-head"><td colSpan={columnCount}>`, which reads either "Step N" plus a `.ingredient-table__step-head-lead` span or the word 'Unallocated', followed by `group.entries.map(renderEntry)`. renderEntry dispatches to the show-changes, developing or reading row.
- Seed routes. Coconut v1 is `/notebook/coconut/coconut-v1`, with batch `/notebook/coconut/coconut-v1/batch/coconut-v1-batch-01`: 11 rows, Total 1291.5 g. Coconut v2 is `/notebook/coconut/coconut-v2`, with batch `/notebook/coconut/coconut-v2/batch/coconut-v2-batch-01`: 10 rows, parent v1, so Show changes exists. Its Total is 800.5 g and its batch has an empty asMade. Every row in both versions has one portion, on step 1, and `method: []`. Mexican Chocolate v4 is `/notebook/mexican-chocolate/mexican-chocolate-v4`: numbered steps, and the parent is v3.
- Test helpers already in IngredientTable.test.jsx: `makeRow(id, name, grams, step, overrides)`, `makeVersion(rows)` (method []), `onePortionDraftRow(step, grams, removed)`, `sectionMarkup(markup, tag)`, `stripStepHeadRows`, `buildDiff`, `displayNumbers`. Renders go through `renderToStaticMarkup` in the node environment. Many existing tests render without `currentStepNumbers`. That is a null map, so before this change they rendered a lone Unallocated head.
- Probe building blocks: the 03.5 harness exports `startServers` (app/dist on ephemeral 127.0.0.1 ports with SPA fallback), `launch` (system Chrome, headless), `check` and `finish`. 261002-axn-probe.mjs has `openAppPage` (a coarse context built from `devices['iPhone 14']` with viewport and screen pinned, every non-127.0.0.1 request aborted), `showChanges` (clicks 'Show changes', waits for 'Hide changes') and `openPen` (clicks 'Next version'). It also has the playwright-core import line to copy, and the `[['webkit', () => webkit.launch()], ['chrome', () => launch()]]` engine pair.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Capture the baseline, then hide a lone Unallocated head (RED, then GREEN), proven on Coconut v2 in WebKit</name>
  <files>.planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs, .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-baseline.json, app/src/ui/IngredientTable.test.jsx, app/src/ui/IngredientTable.jsx</files>
  <read_first>app/src/ui/IngredientTable.jsx (lines 9-43 and 318-331 for the comments, 440-446, 640-676), app/src/ui/IngredientTable.test.jsx (lines 1-40 for the helpers, 128-170, 695-775, 840-870), .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs (lines 1-30, 100-150, 220-240), .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (lines 84-108, 248-262)</read_first>
  <behavior>
    - Test A, lone Unallocated in reading: two rows on step 1, method [], currentStepNumbers = displayNumbers([]). The markup has zero `class="ingredient-table__step-head"` matches and no 'Unallocated'. The tbody holds exactly two `<tr` and both names. The tfoot still reads "Total". The same holds when currentStepNumbers is omitted (null map).
    - Test B, lone Unallocated in Show changes: buildDiff(current, baseline) with one row's grams changed, method [] on both, showingChanges. There is no step head, and `struck-value` is still present (decision 24's struck figure still renders).
    - Test C, lone Unallocated in the pen: mode 'developing', with a draftVersion whose only step is removed (method [{ n: 1, ..., removed: true }]) and penDraft rows via onePortionDraftRow. There is no step head, and there is one grams input per portion.
    - Test D, mixed (guard): reading, and also the pen with draftVersion method steps 1 and 2 where step 2 is removed. A row is split across steps 1 and 2. Exactly two step-head rows render, 'Step 1' before 'Unallocated'.
    - Test E, numbered only (guard): portions on steps 1 and 2, both live. Exactly two step-head rows render, each with its lead-in span, and there is no 'Unallocated'.
    - Tests A, B and C fail before the change (RED). Tests D and E pass before and after; they are regression guards, so say so in the SUMMARY.
  </behavior>
  <action>
Order matters: steps 1 and 2 run before IngredientTable.jsx is edited.

Step 1, the probe. Write 261002-wdn-probe.mjs in the quick directory with three groups, `baseline`, `tracer` and `matrix`, chosen by a comma-list argument. Import `startServers`, `launch`, `check` and `finish` from the 03.5 harness by a relative path. Copy the playwright-core import line (`webkit`, `devices`) from 261002-axn-probe.mjs. Copy its `openAppPage`, `showChanges` and `openPen` helpers rather than importing that script.

Each cell is (engine, width, case). Engines are WebKit and system Chrome via the harness's `launch`. Widths are 393 coarse and 1920 fine. The nine cases are:
- coconut-v1 reading
- coconut-v1 batch
- coconut-v2 reading
- coconut-v2 batch
- coconut-v2 show-changes: the reading route, then showChanges
- coconut-v2 pen: the reading route, click 'Next version', wait for the field labelled 'Salt, grams' (exact)
- coconut-v2 recording: the batch route, click the first button named /^Record (another|a batch)$/, wait for `.ingredient-table__as-made-field`
- mexican-chocolate-v4 reading
- mexican-chocolate-v4 show-changes

Use the routes listed in `<interfaces>`. If a control sits in a closed fold at 393, open its FoldRow first and note it in a comment.

For each cell, capture the following. Use textContent, not innerText, because the head is uppercased by CSS.
- the step-head rows' textContent and height
- each non-head tbody row's normalized textContent and height, and every cell's left (relative to the table's left) and width
- the tfoot Total row's textContent and height
- the table's width and height
- the gap from the first tbody row's top to the thead's bottom. At 393 the thead is display:none, so measure to the table's top instead.
- the gap from the `h2.region-name` reading 'Ingredients' to the first tbody row
- the count of `.struck-value` in the table
- the count of grams inputs in the tbody
- document scrollWidth minus innerWidth

`baseline` captures every cell and writes 261002-wdn-baseline.json. It also asserts the precondition: every Coconut cell has exactly one step head, whose textContent is 'Unallocated', and no Mexican Chocolate cell has an 'Unallocated' head.

`tracer` compares the single cell (webkit, 1920, coconut-v2 reading). `matrix` compares every cell.

The comparison rules:
- A Coconut cell has zero `.ingredient-table__step-head` rows and no 'Unallocated' text.
- A Mexican Chocolate cell's step heads equal the baseline's in count, text and height (within 0.5).
- In every cell, the non-head rows match the baseline in count and text, and in height and cell boxes within 0.5.
- The Total text and height match within 0.5.
- The table width matches within 0.5.
- The table height equals the baseline height minus the sum of the baseline head heights, within 1.
- The first tbody row starts where the baseline's first tbody row (the head) started, within 0.5.
- The struck-value and input counts equal the baseline's.
- The overflow equals the baseline's within 0.5.
- In both Show changes cases the baseline struck count is above 0.

Print one line per cell, with the before and after numbers the SUMMARY needs: the head height removed, the table height before and after, and the heading-to-first-row gap before and after. Use `finish` so the exit code is non-zero on any failure.

The harness serves only on ephemeral 127.0.0.1 ports. Never request :4173, :5173 or :8011, and start no Vite process (CLAUDE.md: one Vite process per workspace). Nothing is saved: the pen and the record pen are opened and then the context is closed.

Step 2, the baseline. Run `npm --prefix app run build` on the unchanged source, then run `node <probe> baseline`. It must exit 0 and write the JSON. If the precondition fails, stop and report: the cause is not what the plan assumes.

Step 3, RED. Add a describe block 'IngredientTable — a lone Unallocated group renders no step head (261002-wdn)' to app/src/ui/IngredientTable.test.jsx with Tests A to E from `<behavior>`. Reuse the file's existing helpers. Count step-head rows by matching the exact `class="ingredient-table__step-head"` with its closing quote, so the `-lead` span is not counted. Run the file and confirm that A, B and C fail and D and E pass. Commit only that test file: `test(261002-wdn): ...`.

Step 4, GREEN. In app/src/ui/IngredientTable.jsx, just after the `groups` line, derive `showStepHeads`. It is false exactly when `groups.length === 1` and `groups[0].displayNumber == null`, and true otherwise. Render the step-head `<tr>` only when `showStepHeads` is true. Keep the Fragment, its key and the entries map as they are.

Do not change groupPortionsByStep, columnCount, any row renderer, the tfoot or any CSS. Add one sentence to the component comment above `export function IngredientTable` (the block that mentions the trailing "Unallocated" head) stating the rule and its reason, citing "Mark, 2026-10-02, option 1". The reason: a lone Unallocated head labels nothing, and the label stays whenever a numbered group is present.

Run the test file until it is green. Then rebuild (`npm --prefix app run build`) and run `node <probe> tracer`. Commit IngredientTable.jsx, the probe and the baseline JSON by explicit path: `fix(261002-wdn): hide the Unallocated step head when it is the only group`. Never use `git add -A`, and never stage anything under .planning/sketches, .planning/canvas-generators or .impeccable (Sid is working there).
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/IngredientTable.test.jsx && npm --prefix app run build && node .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs tracer && test -s .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-baseline.json && grep -q 'showStepHeads' app/src/ui/IngredientTable.jsx</automated>
  </verify>
  <done>
- The baseline JSON exists and was captured from a build of the unchanged source, with the precondition asserted.
- The RED commit holds Tests A to E, with A, B and C failing.
- The GREEN commit hides the head only for a lone Unallocated group.
- IngredientTable.test.jsx passes.
- The tracer cell (WebKit, 1920, Coconut v2 reading) shows no step head, 10 rows and a Total of 800.5 g, matching the baseline as the comparison rules require.
  </done>
</task>

<task type="auto">
  <name>Task 2: Audit every place the step-head row is assumed, then run the full suite and the build</name>
  <files>(none expected; any finding is recorded for the SUMMARY, not fixed outside IngredientTable.jsx and its test)</files>
  <read_first>app/src/styles/app.css (lines 896-935 and 2495-2595, plus the `@media print` block from ~2696), app/src/styles/notebook.css (grep only), app/src/styles/cross-cutting.test.js (lines 270-300), app/src/styles/tokens.css (lines 460-466), app/src/ui/RecipePage.jsx (lines 1945-1972)</read_first>
  <action>
Re-run the planner's audit at the current HEAD and write down each answer for the SUMMARY.

(a) Run `grep -rn "step-head" app/src` and `grep -rn "Unallocated" app/src`. At planning time these hit:
- IngredientTable.jsx: the render and comments
- IngredientTable.test.jsx: stripStepHeadRows at ~136, the numbered-head test at ~699, the mixed test at ~749, the numbered colSpan regex at ~869, and Task 1's block
- app.css: `.ingredient-table__step-head td` at ~905, `-lead` at ~914, and the phone list form's `tr.ingredient-table__step-head` at ~2529
- cross-cutting.test.js: the selector-order pin at ~289, which is unaffected because the CSS does not change
- tokens.css: `--sheet-narrow-step-pad-t/-b` at 464-465. These are still used by numbered tables, so they stay.

Name any new hit.

(b) Check that no row-position selector depends on the head row being the first tbody row. Run `grep -nE "ingredient-table[^{]*(:first|:last|:nth|:has|\+|~)" app/src/styles/app.css app/src/styles/notebook.css`. At planning time this found only the within-row cell rules `td.ingredient-table__col-numeric:nth-last-child(2)` and `:last-child` at ~2559 and ~2565. Those are cell positions inside a row, not row positions. Also confirm that the `@media print` block carries no ingredient-table rule.

(c) Confirm that IngredientTable has one consumer, RecipePage.jsx at ~1951, so the Sheet, print, Show changes, recording and the pen all render the same component and there is no second table to change. Confirm that the pen's draft table groups through `draftVersion.method` (Task 1's Tests C and D cover it).

(d) Run the full suite, `npm --prefix app test`. Many existing IngredientTable tests render without currentStepNumbers and used to carry a lone Unallocated head. If any of them asserted that head's presence, update that assertion to the new rule and name it in the SUMMARY; never delete a test. The planner found none: stripStepHeadRows and trContaining are indifferent to the head, and the ~869 regex renders a numbered group.

The suite must pass at 55 files, with 1511 tests plus Task 1's additions and none removed. Then run `npm --prefix app run build`.

If (a) or (b) turns up a CSS rule that depends on the head row being present or first, do not edit CSS in this run. Record it with the measured effect and leave it for Mark. It is a layout call, and this task changes no stylesheet.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && STATUS="$(git status --porcelain app/src)" && test -z "$STATUS" && TOUCHED="$(git log --name-only --format= --grep='261002-wdn')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/ui/IngredientTable\.(jsx|test\.jsx)$'</automated>
  </verify>
  <done>
- The four audit answers are written down, with any new hit named.
- No CSS position dependence is found, or one is recorded for Mark and left unfixed.
- The full suite passes at 55 files with the new tests counted.
- The build succeeds.
- This task's commits touch no file under app/ other than IngredientTable.jsx and its test.
  </done>
</task>

<task type="auto">
  <name>Task 3: Measure the full matrix in WebKit and system Chrome, and write the SUMMARY</name>
  <files>.planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-SUMMARY.md</files>
  <read_first>.planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs, .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-baseline.json</read_first>
  <action>
app/dist must be built from the final code; Task 2 left it so. Run `node <probe> matrix`: 2 engines × 2 widths × 9 cases. It must exit 0.

If a cell fails, find out why before changing anything. If the cause is in IngredientTable.jsx, fix it there, add a test first, re-run, and commit by explicit path. If the cause is CSS, record it for Mark and do not edit app/src/styles.

Write 261002-wdn-SUMMARY.md with:
- the rule as built, plus the RED-then-GREEN evidence, naming D and E as guards
- Task 2's four audit answers
- a table for each cell: engine, width, case, head height removed, table height before and after, rows, Total, struck-value count, input count, and overflow
- the 393 heading-to-first-row gap before and after for Coconut. This is the space the removed head's top padding used to give, so Mark can judge it on the phone.
- confirmation that Mexican Chocolate v4 is unchanged in every cell
- the test count, as 55 files and N tests, with the delta from 1511

State plainly that the readings come from Playwright WebKit and system Chrome, not from Mark's devices.

Rebuilding app/dist already updates what Mark's :4173 preview serves; `vite preview` needs no restart. Do not start, stop or request that preview, and leave :8011 alone.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && node .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs matrix && test -f .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-SUMMARY.md && TOUCHED="$(git log --name-only --format= --grep='261002-wdn')" && ! printf '%s\n' "$TOUCHED" | grep -E '^(\.planning/sketches/|\.planning/canvas-generators/|\.impeccable/|app/src/styles/|DESIGN\.md)'</automated>
    <human-check>Deferred to Mark (end-of-run UAT). Mark's :4173 preview serves the rebuilt app/dist. He reloads the tab on each device (a hard reload if it looks stale), then checks:
(1) iPad (1366, landscape): Coconut v2, then Coconut v1. No "UNALLOCATED" line above the ingredients; the rows and the Total read as before, and nothing else moves.
(2) iPhone (393): the same two recipes, plus whether the space between the Ingredients heading and the first row looks right now that the head's padding is gone (the SUMMARY gives the numbers).
(3) Coconut v2 with Show changes on: the struck old figures still show.
(4) Mexican Chocolate v4: its Step heads are still there.
The change counts as device-verified only when Mark confirms.</human-check>
  </verify>
  <done>
- The probe's matrix group exits 0 across both engines, both widths and all nine cases.
- The SUMMARY records every number, the audit answers and the 393 gap for Mark.
- No commit touches stylesheets, sketches, canvas-generators, .impeccable or DESIGN.md.
- Mark's device check is listed as deferred.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored version to rendered table | a version's rows and method, already in the local store, decide whether one row is rendered or not. No new input is accepted. |
| probe to local servers | the probe serves app/dist on ephemeral 127.0.0.1 ports and drives throwaway browser contexts |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-wdn-01 | Repudiation | a lone Unallocated head hidden while portions are unresolved | low | mitigate | The head is hidden only when no portion resolves, so nothing needs separating. Whenever any numbered group exists, the Unallocated head still renders (Test D, in reading and the pen), so a partly unresolved table always keeps its safety label. No row is ever dropped: Tests A to C assert every portion row still renders. |
| T-wdn-02 | Denial of Service | the probe's servers and Mark's running :4173 preview and Sid's :8011 | low | mitigate | The harness binds only ephemeral 127.0.0.1 ports, aborts every non-127.0.0.1 request, and closes its servers and browsers. No Vite process is started, and :4173, :5173 and :8011 are never requested. The pen and record pen are opened only in throwaway contexts, and nothing is saved. |
| T-wdn-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. The probe uses the playwright-core module and the WebKit build already on disk. If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- The baseline was captured from the unchanged source before any edit, with the precondition asserted: Coconut shows one 'Unallocated' head and Mexican Chocolate shows none.
- `npm --prefix app test` passes at 55 files, with 1511 tests plus the new ones and none removed. `npm --prefix app run build` succeeds.
- `node .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs tracer,matrix` exits 0 in WebKit and system Chrome at 393 coarse and 1920.
- Under app/, only IngredientTable.jsx and IngredientTable.test.jsx changed. No stylesheet or token changed.
</verification>

<success_criteria>
- Coconut v1 and v2 read without a lone "Unallocated" line in every state: reading, batch, recording, Show changes and the pen. Their rows and Total are unchanged.
- A table mixing numbered and unresolved portions still shows both heads.
- Numbered recipes are unchanged.
- The measured layout differs from the baseline only by the removed row.
</success_criteria>

<output>
Create `.planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-SUMMARY.md` when done (Task 3 writes it).
</output>
