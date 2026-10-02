---
phase: quick-261002-axn
plan: 01
quick_id: 261002-axn
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs
autonomous: true
requirements: [FORM2-01]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Below 724, with Show changes on, a changed row's struck old amount sits on its own line above the current amount, right-aligned in the same 64px amount track, and the struck old share sits above the current share in the share track (sketch 011 decision 24, option 1b). At every width 320 to 723, for Mexican Chocolate v4, Mocha v3 and Strawberry v2.1, in WebKit and system Chrome, no struck figure, amount, as-made hand or share overlaps the name, and the page has zero horizontal overflow."
    - "Turning Show changes on leaves the name track at its reading-view width for Mexican Chocolate v4 (223px at 393, 150px at 320). A row with nothing struck keeps its reading-view height (one line). A changed row grows one line (38px to 56px at 393). With a batch in view (Strawberry v2.1) a changed row is three lines (78px at 393), as 393-show-changes-cases.html draws (decision 24)."
    - "In the pen below 724, a changed row's struck parent amount stacks above the grams field, right-aligned in the amount track. The field stays 52px wide (44px tall on a coarse pointer) and clear of the name. At 393 coarse: changed row 81px, share-only row 63px, Total 56.3px (decision 25)."
    - "A removed row under Show changes prints one struck old amount and no current amount after it. Its amount slot's markup is exactly <span class=\"ingredient-table__plan-grams\"><span class=\"struck-value\">20 g</span></span> in the unit test, and on the saved child in the built app (decision 24, Mark's answer 2)."
    - "At 393 (coarse) and 723 (fine) the app matches 393-show-changes.html, 723-show-changes.html, 393-pen-changes.html and 723-pen-changes.html row for row within 1px (row height, amount, struck, field, name and share boxes, table height), in both engines."
    - "Out of scope, so unchanged: from 724 up every struck figure stays inline with its 2px --gap-strike margin; the Total row's markup and unitless struck total (decision 24, Mark's answer 4); the removed row's aria-label ('was 20 g, now 20 g, removed'); tokens.css; every sketch board and canvas generator."
    - "The full suite passes (baseline 55 files / 1505 tests, plus the new assertions, none removed), including src/ui/tabindex-scan.test.js."
  artifacts:
    - path: app/src/styles/app.css
      provides: "three stacking rules inside @media (max-width: 723.98px), after the col-numeric:empty rule"
      contains: ".ingredient-table td.ingredient-table__col-grams > .struck-value"
    - path: app/src/styles/cross-cutting.test.js
      provides: "the phone-forms block's ordered selector list extended by the three rules, and their declarations pinned"
      contains: ".ingredient-table__plan-grams > .struck-value"
    - path: app/src/ui/IngredientTable.jsx
      provides: "DiffGramsCell prints no current amount on a removed row"
      contains: "!rowDiff.removed"
    - path: app/src/ui/IngredientTable.test.jsx
      provides: "the removed row's amount slot pinned exactly in the never-reorders test"
      contains: "<span class=\"ingredient-table__plan-grams\"><span class=\"struck-value\">20 g</span></span>"
    - path: .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs
      provides: "measured conformance against the five boards and the 320-723 sweep, WebKit and system Chrome"
  key_links:
    - from: "app/src/ui/IngredientTable.jsx DiffGramsCell"
      to: "app.css .ingredient-table__plan-grams > .struck-value"
      via: "the struck amount is a direct child of the plan-grams slot in Show changes and in the Total row"
      pattern: "ingredient-table__plan-grams"
    - from: "app/src/ui/IngredientTable.jsx GramsCell (developing)"
      to: "app.css .ingredient-table td.ingredient-table__col-grams > .struck-value"
      via: "the pen's struck parent is a sibling before the slot, a direct child of the amount td"
      pattern: "ingredient-table__col-grams"
    - from: "app/src/ui/IngredientTable.jsx ShareCell / DiffShareCell"
      to: "app.css .ingredient-table td.ingredient-table__col-numeric > .struck-value"
      via: "the struck share is a direct child of the share td"
      pattern: "ingredient-table__col-numeric"
---

<objective>
Below 724, stack the struck old figure above the new one in Show changes and in the pen, as sketch 011 decisions 24 and 25 draw it. A removed row prints one struck amount only. The result is measured side by side with the five boards in Playwright WebKit and system Chrome.

Purpose: today the struck and current amounts sit side by side, 83 to 104px wide in a 64px track, and overlap the name (Mexican Chocolate v4: 13 of 13 rows, at every width 320 to 723). Mark approved option 1b, the removed-row fix, the pen, and leaving the Total row as it is (2026-10-02, "1b, fix the removed row, include the pen, leave the Total").

Output: three CSS rules in the existing list-form block with their test pin, a one-line DiffGramsCell change with its unit-test pin, a measuring probe, and a SUMMARY with the measured numbers.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/sketches/011-recipe-route-c/README.md
@app/src/ui/IngredientTable.jsx
@app/src/ui/IngredientTable.test.jsx
@app/src/styles/app.css
@app/src/styles/cross-cutting.test.js
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/quick/261001-eds-blank-the-as-made-total-in-the-ingredien/261001-eds-total-probe.mjs

Facts the planner established. The executor does not need to re-derive them.

- The boards are the authority, CSS included. Every board's inlined stylesheet carries `.ingredient-table__plan-grams>.struck-value{display:block;margin-right:0}` and `.ingredient-table td.ingredient-table__col-numeric>.struck-value{display:block;margin-right:0}`. The two pen boards also carry `.ingredient-table td.ingredient-table__col-grams>.struck-value{display:block;margin-right:0}`. The base rule `.struck-value` (app.css ~line 842) keeps `margin-right: var(--gap-strike)`, which governs from 724 up.
- Markup the selectors hit. DiffGramsCell nests the struck amount inside `span.ingredient-table__plan-grams`, and so does the Total row (tfoot, ~line 684). GramsCell in the pen (mode `developing`) renders the struck parent as a sibling before the slot, so it is a direct child of `td.ingredient-table__col-grams`. ShareCell, DiffShareCell and the removed-row share render the struck share directly inside `td.ingredient-table__col-numeric`. A removed row's struck name sits in `td.ingredient-table__col-name` and no new selector touches it.
- `app/src/styles/cross-cutting.test.js` (lines 274-294) pins the exact ordered selector list of the `(max-width: 723.98px)` rules with `toEqual`. Adding rules fails that test unless the list is extended. That is why this test file is in scope. `css-source.js` emits a selector trimmed, with whitespace collapsed to single spaces (line 93).
- Seeded routes. Mexican Chocolate v4 is `/notebook/mexican-chocolate/mexican-chocolate-v4` and has no batch. Mocha v3 is `/notebook/mocha/mocha-v3`. Strawberry v2.1 with its batch in view is `/notebook/strawberry/strawberry-v2-1/batch/strawberry-v2-1-batch-01`. The Mexican Chocolate v4 pen labels are `Whole Milk 3.3%, grams`, `Sucrose, grams` and `Cocoa Powder, grams`. The pen's remove control is the button named `remove` inside the Cinnamon row's name cell. Seeded amounts: Whole Milk 563, Sucrose 33.4, Cocoa Powder 40.8, Cinnamon 2.77.
- Playwright facts, checked by the planner on this machine. `devices` is exported from `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`, and `devices['iPhone 14']` gives isMobile, hasTouch and deviceScaleFactor 3. With that profile, `page.setViewportSize` moves `innerWidth` exactly (320, 500 and 723 were checked) and `(pointer: coarse)` matches in both WebKit and system Chrome. The harness's `openBoard` context (hasTouch, isMobile false) also reports coarse in both engines, so `openBoard` works for the 393 boards with a WebKit browser. Boards must not be opened with isMobile true: a board without a viewport meta would get a 980px layout viewport.
- Running servers. Only :5173 (dev) and :4173 (Mark's preview) are listening. Start no third Vite process. The harness's `startServers()` serves `app/dist` with SPA fallback and the repo root on ephemeral 127.0.0.1 ports. Its `launch()` is system Chrome (equivalent to `channel: 'chrome'`). Launch WebKit with `webkit.launch()`. Playwright's own Chromium is not installed.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Stack the struck figure below 724 (three rules), pin them, and prove one path: Mexican Chocolate v4 Show changes at 393 in WebKit against its board</name>
  <files>app/src/styles/app.css, app/src/styles/cross-cutting.test.js, .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs</files>
  <action>
1. app.css (decisions 24 and 25). Inside the existing `@media (max-width: 723.98px)` block, directly after the `.ingredient-table td.ingredient-table__col-numeric:empty { display: none; }` rule and before the block's closing brace, append three separate rules in this order. Each declares exactly `display: block;` and `margin-right: 0;`:
   (a) `.ingredient-table__plan-grams > .struck-value`, for Show changes' struck amount and the Total's struck figure, both nested in the plan-grams slot;
   (b) `.ingredient-table td.ingredient-table__col-numeric > .struck-value`, for the struck share in Show changes and in the pen;
   (c) `.ingredient-table td.ingredient-table__col-grams > .struck-value`, for the pen's struck parent amount, a direct child of the amount cell (decision 25).
   Put one short comment above them in the file's existing style. It should say that below 724 the struck old figure stands above the current one, right-aligned in the same track (sketch 011 decisions 24 and 25; 393-show-changes.html, 393-pen-changes.html), and that from 724 the base `.struck-value` rule keeps the figures side by side.
   No token, no `!important`, no markup change, no other rule touched. A bare `0` follows this block's existing zero convention (`padding: 0`, `border: 0`). The Total row stacks through (a), which is what decision 24's answer 4 draws ("the struck total without a unit, stacked, right-aligned at the number"). Its markup and unit stay as they are.
2. cross-cutting.test.js. In the test "the phone-forms block appends the list-form rules, in the board's own order…", append the three selectors, exactly as written in step 1 with single spaces around `>`, to the end of the expected `toEqual` array. Rename the test only if its title would become false. Add one test to the same describe ('the 723.98px block — the phone forms…'). It finds each of the three rules by selector with `r.media === '(max-width: 723.98px)'`, and asserts its declarations match `display:\s*block` and `margin-right:\s*0`. Cite decisions 24 and 25 in its title. Use the file's existing `rules` array and `rules.find` precedent.
3. Probe. Create `.planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs` as plain Node ESM, modelled on `261001-eds-total-probe.mjs`. Import `webkit` and `devices` from the absolute playwright-core path. Import `startServers`, `launch`, `openBoard`, `check` and `finish` from `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`, unchanged. The first CLI argument selects groups; Task 1 implements only `tracer`. Build three pieces that Task 3 reuses:
   - `openAppPage(browser, appUrl, route, { width, coarse })`. A coarse context spreads `devices['iPhone 14']` and overrides `viewport` and `screen` to `{ width, height: 1100 }`. A fine context is `{ viewport: { width, height: 1100 } }`. Either way, abort every request whose hostname is not 127.0.0.1, go to the route with `waitUntil: 'networkidle'`, wait for `.ingredient-table` and `h2.notebook-version__identity`, and throw unless `matchMedia('(pointer: coarse)').matches === coarse` and `innerWidth === width`.
   - `showChanges(page)`: click the first button named `Show changes`, then wait for a button named `Hide changes`.
   - `readTable` (passed to `page.evaluate`, so it is identical on app and board). It takes a table element, by default the document's first `.ingredient-table`. It returns `{ innerWidth, overflow: documentElement.scrollWidth - innerWidth, table: rect, rows }`, where rows are every `tr` in tbody and tfoot except `tr.ingredient-table__step-head`. Each row records: its name (the name cell's trimmed text, first 40 chars) and height; the amount, name and share cell rects (the share cell is the row's last td, the as-made cell the col-numeric td before it when present); and each cell's content rect, the bounding rect of a Range over the cell's contents, so overflowing text counts. It also records the rects and computed display of the `.struck-value` elements in the amount and share cells, the rect of the current figure (the input in the amount cell, otherwise the trailing text node of the plan-grams slot or of the share cell, read through a Range), and the as-made hand's rect. Every x and y is relative to the table's left and top.
   Tracer group: launch WebKit, open the app at 393 coarse on Mexican Chocolate v4 and turn Show changes on. Open `393-show-changes.html` through the harness's `openBoard` with the WebKit browser. Count these checks:
   - same row count, with names in the same order (the board draws 14 rows, Total included);
   - every row's height, amount and name cell left and width, share content right, and struck top and right within 1px of the board's;
   - table height within 1px (the board draws 750);
   - every name cell 223px wide within 0.5;
   - in every row with a struck figure, the struck bottom is at or above the current figure's top plus 0.5, and its right edge is within 0.5 of the current figure's right;
   - overflow at most 0.
   Log the 393 numbers (row heights, name track, table height). Close servers and browsers in `finally`, then call `finish`.
4. Commit by explicit path: app/src/styles/app.css, app/src/styles/cross-cutting.test.js and the probe, with the message `fix(261002-axn): stack the struck old figure above the new one below 724`. End it with the attribution trailer lines the executing session's system reminder gives. Never `git add -A` or `git add .`, because the untracked `.impeccable/critique/` files must stay out. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/cross-cutting.test.js && npm --prefix app run build && node .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs tracer</automated>
  </verify>
  <done>The three rules sit inside the 723.98px block after the col-numeric:empty rule, each with only `display: block` and `margin-right: 0`. cross-cutting.test.js passes with the extended list and the new declarations test. The build succeeds. The tracer probe exits 0 in WebKit at 393 coarse: Mexican Chocolate v4 Show changes matches 393-show-changes.html row for row within 1px, the table is 750px within 1px, the name track is 223px, the struck figures stand above the current ones, right-aligned, and overflow is 0. Committed on main by explicit path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: A removed row prints one struck old amount (DiffGramsCell), pinned in the never-reorders test</name>
  <files>app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx</files>
  <behavior>
    - In the existing test 'never reorders: a removed row reappears struck at its original index…' (~line 40), Row B is removed at 20 g. The rendered markup contains exactly `<span class="ingredient-table__plan-grams"><span class="struck-value">20 g</span></span>`: one struck amount, nothing after it inside the slot. This fails before the fix, because the slot today renders the struck 20 g followed by a plain 20 g.
    - Every other show-changes assertion keeps passing unchanged. That includes the changed-row slot at ~line 1013 (struck 40 g, then 48 g) and the Total row's unitless struck figure.
  </behavior>
  <action>
RED: add the one `expect(markup).toContain(...)` assertion for the exact slot markup above, after the test's existing `struck-value">Row B` assertion. Use the literal string; do not build it. Run `npm --prefix app test -- src/ui/IngredientTable.test.jsx` and confirm that this assertion is the one that fails. Commit the test file by explicit path as `test(261002-axn): pin a removed row's single struck amount`, with the session's attribution trailer lines.

GREEN (decision 24, Mark's answer 2: "the removed row is approved as drawn on 393-show-changes-cases.html, one struck amount on one line with no unchanged number after it"): in DiffGramsCell (~line 182), change the slot's second child from the unconditional template literal for `rowDiff.gramsTo` to `{!rowDiff.removed && \`${rowDiff.gramsTo} g\`}`. Leave the struck child as it is. In the comment above DiffGramsCell, rewrite only the sentence about a removed row so it says that a removed row prints its struck old amount alone, with no current amount after it (decision 24). Change nothing else:
- rowDiffAccessibleLabel keeps "was 20 g, now 20 g, removed", which is out of scope;
- DiffShareCell, GramsCell and ShareCell stay as they are;
- the Total row stays as it is;
- no class or wrapper is added.
Run the file's tests until they pass, then commit IngredientTable.jsx by explicit path as `fix(261002-axn): a removed row prints one struck amount in Show changes`, with the trailer lines.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/IngredientTable.test.jsx</automated>
  </verify>
  <done>The new assertion failed before the JSX change and passes after it. Every test in IngredientTable.test.jsx passes. The diff to IngredientTable.jsx is the one expression plus the one comment sentence. Two commits (test, then fix) are on main, made by explicit path.</done>
</task>

<task type="auto">
  <name>Task 3: Measured conformance on the build — all five boards, the pen, the batch case, the removed row, and the 320-723 sweep in both engines; full suite; SUMMARY with numbers</name>
  <files>.planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs</files>
  <action>
Rebuild first with `npm --prefix app run build` so app/dist carries Tasks 1 and 2. Then extend the probe with these groups. Each engine is WebKit (`webkit.launch()`) and system Chrome (the harness's `launch()`). Running with no argument runs every group. Keep the output to one compact line per state, engine and pointer (counts, min and max) plus any FAIL lines, not one line per width.

- `boards`. In each engine, compare the app with each board using the Task 1 comparison: rows and names in order; per-row height; amount, name and share boxes; struck boxes; table height; all within 1px. In the pen, also compare the field's width and height within 1px. The 393 boards open coarse, the 723 boards fine, as `openBoard` already decides from the file name, and the app context matches each board's pointer.
  (1) Mexican Chocolate v4 with Show changes on, at 393 coarse against 393-show-changes.html and at 723 fine against 723-show-changes.html.
  (2) The pen at 393 coarse against 393-pen-changes.html and at 723 fine against 723-pen-changes.html. Open the pen on Mexican Chocolate v4 with the first button named `Next version`. Fill `Whole Milk 3.3%, grams` with 600, `Sucrose, grams` with 36 and `Cocoa Powder, grams` with 45, and click `remove` in the Cinnamon row. At 393 coarse, also check against the drawn numbers, each within 1px of the board's own reading: changed row 81, share-only row 63, Total 56.3, and the field 52 x 44.
  (3) Strawberry v2.1 with its batch in view and Show changes on, at 393 coarse. Read the batch panel of 393-show-changes-cases.html: find the panel's table whose rows carry an as-made hand, and match rows by name. Each matched row's height and box positions must be within 1px. A changed row with a hand reads 78 within 1px. Its hand's top is at or below the current amount's bottom minus 0.5, with right edges within 0.5.
  (4) The removed row, live. From the pen state in (2), fill `Version name` with `stack check` and click `Save as a new version`. Wait for the URL to change and for `h2.notebook-version__identity`, as the harness's `saveNextVersion` does, then turn Show changes on. The Cinnamon row's plan-grams slot `innerHTML` is exactly `<span class="struck-value">2.77 g</span>`. Its height is within 1px of the removed row on 393-show-changes-cases.html (the row whose name cell carries a `.struck-value`) and within 0.5 of a one-line row. Run this at 393 coarse in each engine. The save happens in the probe's own throwaway context; nothing touches Mark's browser or :4173.
- `sweep` (coarse) and `sweep-fine` (fine). In each engine there are four states: Mexican Chocolate v4 Show changes, Mocha v3 Show changes, Strawberry v2.1 batch Show changes, and the Mexican Chocolate v4 pen with the four edits. For each state, open one page at 393, sweep every integer width from 320 to 723 in the off state (Show changes off, or the reading view before Next version), then switch the state on and sweep again. Use `page.setViewportSize({ width, height: 1100 })`, wait one animation frame, and read `readTable`. At every on-state width, count these:
  - `innerWidth === width`;
  - overflow at most 0;
  - collisions equal 0, where a collision is any overlap of more than 0.5px on both axes between the name cell's content rect and the amount, share or as-made content rect of the same row;
  - every row with no struck figure in its amount or share cell, and not removed, has its off-state height within 0.5 (an unchanged row stays one line);
  - for Mexican Chocolate v4 Show changes, every name cell's width equals its off-state width within 0.5;
  - in the pen, the narrowest name track at 320 is at least 149.5.
  For Mocha v3, Strawberry v2.1 and the pen, record the maximum name-track difference from the off state as report-only. Decision 24 states the name-track property for Mexican Chocolate v4 only.
- `wide`. In each engine, at 724 and at 1366 (fine, a fresh context per width, since 1366 crosses the folds' cut), open Mexican Chocolate v4 and turn Show changes on. Every `.struck-value` inside the table's amount and share cells has computed `display` `inline` and `margin-right` `2px`. This confirms nothing changed from 724 up.

Run the full suite, the tabindex scan and the probe groups (see verify). If a check fails, do not widen scope: no token, track, board, generator or other markup change. Record the failing numbers in the SUMMARY and report them as a finding for Mark.

Write `.planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-SUMMARY.md`. It records:
- the suite count against the 55 files / 1505 tests baseline;
- the 393 numbers, measured against each board's, in both engines: Mexican Chocolate v4 table height, name track, and unchanged and changed row heights (38 and 56); pen changed, share-only and Total rows (81, 63, 56.3) and the field (52 x 44); Strawberry three-line row (78); removed row height and slot markup;
- the 723 comparisons;
- sweep totals per state, engine and pointer: widths read, collisions, overflow, the narrowest name track, and the max name-track difference;
- the wide-group result;
- the cross-cutting.test.js extension, and why it was needed;
- a plain statement that this is device-unverified: Playwright WebKit is not Mark's iPhone, and neither engine reproduces the device's text rendering, so Mark's iPhone check of 393 Show changes and the pen is still owed. Decision 25's boards were awaiting Mark's look when this ran.
Commit the probe and the SUMMARY by explicit path as `docs(261002-axn): measure stacked struck figures against sketch 011 boards`, with the trailer lines. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && npm --prefix app test -- src/ui/tabindex-scan.test.js && npm --prefix app run build && node .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs tracer,boards,wide && node .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs sweep && node .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs sweep-fine</automated>
  </verify>
  <done>The full suite passes (55 files / 1505 tests plus the new assertions, none removed), and so does the tabindex scan. The build succeeds. Every probe group exits 0 in WebKit and system Chrome:
- the four boards match row for row within 1px at 393 coarse and 723 fine;
- the Strawberry batch row reads three lines (78px) against the cases board;
- the live removed row's slot is exactly one struck 2.77 g and it is one line;
- all 404 widths, 320 to 723, have zero collisions and zero overflow for the four states, coarse and fine;
- unchanged rows keep their height, and Mexican Chocolate v4's name track never moves;
- from 724 up the struck figures stay inline with a 2px margin.
The SUMMARY records every number and the device-unverified statement. The probe and SUMMARY are committed on main by explicit path, and nothing is pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored version rows to the table | rowDiff values are rendered as React text children; no markup API is used |
| probe to local servers | the probe serves app/dist and the repo on ephemeral 127.0.0.1 ports and drives throwaway browser contexts |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-axn-01 | Tampering | DiffGramsCell rendering rowDiff | low | accept | The change removes one text child behind a boolean. Values stay React text, and no markup injection API is added (the project rule against raw HTML under app/src holds). |
| T-axn-02 | Information Disclosure | the removed row's aria-label | low | accept | Unchanged by scope ("was N g, now N g, removed"). The visible cell now says less, never more. |
| T-axn-03 | Denial of Service | the probe's servers and Mark's running Vite processes | low | mitigate | The harness binds 127.0.0.1 ephemeral ports only, aborts every non-127.0.0.1 request (the boards' Google Fonts link included), and closes servers and browsers in `finally`. No `vite preview` or dev server is started, and :5173 and :4173 are never touched. The live-save check writes only to the probe's throwaway context's IndexedDB. |
| T-axn-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. The probe uses the playwright-core module and the WebKit build already on disk. If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- `npm --prefix app test -- --run` passes: 55 files / 1505 tests plus the new assertions, none removed or weakened. `src/ui/tabindex-scan.test.js` passes.
- `npm --prefix app run build` succeeds, and every probe group exits 0 in WebKit and system Chrome.
- `git diff --stat` across the commits shows only app.css, cross-cutting.test.js, IngredientTable.jsx, IngredientTable.test.jsx, the probe and the SUMMARY. tokens.css, the sketch boards, `.planning/canvas-generators/`, CLAUDE.md and every other file are untouched.
- The untracked `.impeccable/critique/` files are not staged, and nothing is pushed.
</verification>

<success_criteria>
- Below 724, Show changes and the pen draw the struck old figure above the current one, right-aligned in the same tracks, matching decisions 24 and 25 and the five boards in the real DOM.
- No collision with the name and no page overflow at any width from 320 to 723 for Mexican Chocolate v4, Mocha v3 and Strawberry v2.1, in WebKit and system Chrome.
- A removed row shows one struck amount. The Total row, the removed row's aria-label, the 724+ layout, tokens, boards and generators are unchanged.
- The SUMMARY carries the measured numbers and says plainly that this is device-unverified.
</success_criteria>

<output>
Create `.planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-SUMMARY.md` when done
</output>
