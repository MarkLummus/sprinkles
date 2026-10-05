---
phase: quick-261004-ubg
plan: 01
quick_id: 261004-ubg
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/app.css
  - app/src/styles/columns.test.js
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/binder.test.js
  - .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs
  - .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-SUMMARY.md
autonomous: true
requirements: [REC1-01]

estimate:
  tokens: 90000
  raw_tokens: 90000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Decision 48 A: from 724 up, on screen, with a batch in view (the As made column), the ingredient table's head reads on one line. The three head cells share one top (within 0.5px), each is 14.39px tall, and the head row is 21.39px tall (52.17 before). The As made head's box is 59.45px wide (0.55 before), and its right edge is the right edge of the As made figures under it. Ingredient stays where it stands: its left edge is unchanged."
    - "Decision 48 A: with no batch (Standard Base v2) and in the Next version pen, the head is unchanged at 21.39px. Print is untouched, because the rules live in the screen-only D3 block."
    - "Decision 48 A: with a batch, everything under the head moves up 30.78px (within 1). Olive Oil v1's page is 31px shorter at every width from 724 to 1920. Mexican Chocolate v3's page is 31px shorter below 984 and unchanged from 984, where the side column sets the page height."
    - "Decision 49 A: from 984 up, on Mexican Chocolate v3's batch (Show changes off, as the app opens), the Instructions start 49px (within 1) under the table at 984, 1024, 1366 and 1600 in WebKit and in Chrome. The page height and the side column's height do not change."
    - "Decision 49 A: Olive Oil v1 and Standard Base v2 (no Instructions) read as before at every width, and below 984 (744, 983) nothing changes."
    - "`npm --prefix app test` passes. The 261004-ox8 test that pinned the wrapping As made head is rewritten to decision 48's contract, not deleted."
    - "No build and no Vite process. app/dist and Mark's :4173 preview are read only, never written. The probe serves the existing build on ephemeral 127.0.0.1 ports and adds exactly the rules it reads from the edited app.css."
  artifacts:
    - path: app/src/styles/app.css
      provides: "Two decision 48 A rules in the `screen and (min-width: 724px)` D3 block, and a new `screen and (min-width: 984px)` block that sets the Sheet's grid rows (decision 49 A)"
      contains: "grid-template-rows: auto auto 1fr auto"
    - path: app/src/styles/columns.test.js
      provides: "D3 tests pinning the one-line head and As made standing on its column's right edge; the ox8 nowrap test rewritten to decision 48"
      contains: "decision 48"
    - path: app/src/styles/cross-cutting.test.js
      provides: "a describe for the 984 rows block (rows only, screen only, 1fr on the method row) and the media-condition list with the new condition"
      contains: "screen and (min-width: 984px)"
    - path: app/src/styles/binder.test.js
      provides: "the at-rule gate counting nine top-level @media blocks and allowing the new condition"
      contains: "screen and (min-width: 984px)"
    - path: .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs
      provides: "a WebKit and Chrome probe: the existing build plus the rules read from the edited app.css, measured against the README's numbers (modes: tracer, all)"
  key_links:
    - from: app/src/styles/app.css
      to: app/src/ui/IngredientTable.jsx
      via: "the three thead th cells (ingredient-table__col-name, then As made and % of batch with ingredient-table__col-numeric) and the table's ingredient-table--as-made class"
      pattern: "ingredient-table--as-made thead th\\.ingredient-table__col-numeric:not\\(:last-child\\)"
    - from: app/src/styles/app.css
      to: app/src/ui/RecipePage.jsx
      via: "className recipe-page, or recipe-page recipe-page--no-method when the Instructions are not rendered"
      pattern: "recipe-page--no-method"
    - from: .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs
      to: app/src/styles/css-source.js
      via: "readAllRules(app.css source) picks out the new rules, so the CSS the probe adds is the edited source's own text"
      pattern: "readAllRules"
---

<objective>
Build two style changes Mark decided on 2026-10-05, both in `app/src/styles/app.css`, test first, in one quick:

- **Decision 48 A.** The ingredient table's head reads on one line from 724, and Ingredient stays where it stands.
- **Decision 49 A.** From 984, the Instructions' row takes the side column's extra height, so the Instructions follow the table and the empty space moves to the foot of the left column.

Purpose: Mark saw both on the iPad ("As Made is wrapped and starts at left edge of the table"; the empty space under Mexican Chocolate v3's table: "it bothers me"). He chose A on each in sketch 011's README, decisions 48 and 49.

Output: four edited files under `app/src/styles/` (app.css and three test files), a probe, and a SUMMARY in this quick directory.

The authority is the sketch. The README entries for decisions 48 and 49 (`.planning/sketches/011-recipe-route-c/README.md`, the lines starting `48.` and `49.`) hold the app change briefs and the measured numbers. The boards are `table-head-one-line.html`, `empty-space-under-table.html` and the redrawn 744 to 1920 batch boards. Read those two README entries only. Never edit or stage anything under `.planning/sketches/`.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read these sections, not whole files:
- `.planning/sketches/011-recipe-route-c/README.md`: grep `^48\.` and `^49\.` and read each entry to the blank line after it (about 8 lines each). Do not edit; Sid's uncommitted edit is in that file.
- `app/src/styles/app.css`: lines 424 to 447 (the base `.recipe-page` and `.recipe-page--no-method`), 2345 to 2366 (the `(max-width: 983.98px)` block), and 2834 to the end (the D3 block, `@media screen and (min-width: 724px)`, the last block in the file).
- `app/src/styles/columns.test.js`: lines 166 to 190 (the nowrap tests) and 224 to 292 (the `D3 grid from 724` describe and its `rule()` helper).
- `app/src/styles/binder.test.js`: lines 353 to 388 (the at-rule gate: `toHaveLength(8)` and `allowedMedia`).
- `app/src/styles/cross-cutting.test.js`: lines 55 to 66 (`ruleFor` and `mediaRuleFor`), 392 to 404 (the media-condition list), and 406 to 440 (the 983.98px describe, the pattern for the new describe).
- `app/src/styles/css-source.js`: `readAllRules` and `stripCssComments` (pure, no imports, importable from node).
- `app/src/ui/IngredientTable.jsx`: lines 689 to 702 (the thead: Ingredient with colSpan 2, then As made only with the batch layer, then % of batch).
- Probe pattern: `.planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs`, lines 1 to 120 (imports, `readScope`, `openRecipe`, WebKit launch), and `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs` (exports `startServers`, `launch` (system Chrome), `openApp(browser, appUrl, route, { width, height, coarse })`, `check`, `finish`). Copy from these; do not edit them.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Decision 48 A end to end: the one-line head (test, app.css, WebKit tracer)</name>
  <files>app/src/styles/columns.test.js, app/src/styles/app.css, .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs</files>
  <behavior>
    - In the `D3 grid from 724` describe, `rule('.ingredient-table thead th')` exists in the `screen and (min-width: 724px)` block and declares `grid-row: 1`, `white-space: nowrap` and `width: auto`.
    - `rule('.ingredient-table--as-made thead th.ingredient-table__col-numeric:not(:last-child)')` exists in the same block and declares `justify-self: end`.
    - The rewritten ox8 test: across all rules, those whose selector contains `thead th` and declare `white-space: nowrap` are exactly `[['screen and (min-width: 724px)', '.ingredient-table thead th']]`. One rule makes every head cell one line from 724; the % of batch head's own nowrap is gone because the new rule makes it redundant.
    - The test at line 166 still passes unchanged: no top-level th rule forces nowrap, so print and the list form still wrap.
    - The `% of batch` rule still declares `text-align: right` and `grid-column: -2 / -1`.
  </behavior>
  <action>
RED. In `app/src/styles/columns.test.js`, inside the `D3 grid from 724 (sketch 011 decisions 31, 32 (5), 33 brief (c))` describe, add one test for decision 48 A covering the first two behavior bullets, using the existing `rule()` helper. Name the test with "sketch 011 decision 48 A, one head line". Rewrite the test at lines 182 to 190 as the third bullet: new title, new filter `/\bthead th\b/` on the selector plus `/white-space:\s*nowrap/` on the declarations, and the expected list. Its comment says decision 48 A replaces 261004-ox8's "As made keeps wrapping". Run `npm --prefix app test -- src/styles/columns.test.js` and confirm the new and rewritten tests fail for the expected reason: the rule is missing, and the list still names the `:last-child` rule. Stage by explicit path, check `git diff --cached --name-only`, and commit as `test(261004-ubg): pin the one-line ingredient head from 724 (sketch 011 decision 48 A)`.

GREEN. In `app/src/styles/app.css`, inside the existing `@media screen and (min-width: 724px)` D3 block, directly after the `.ingredient-table thead th.ingredient-table__col-numeric:not(:last-child)` rule, add the brief's two rules verbatim, per decision 48 A:
- `.ingredient-table thead th` with `grid-row: 1; white-space: nowrap; width: auto;`
- `.ingredient-table--as-made thead th.ingredient-table__col-numeric:not(:last-child)` with `justify-self: end;`

Add a short comment above them. Cite sketch 011 decision 48 A ("one head line", Mark 2026-10-05), and say why: the three cells take row 1 and their words' width, `width: auto` undoes the old table layout's `width: 1%` that squeezed As made to 0.55px, and "AS MADE" (59.45px) stands on its 56px column's right edge. Also say that Ingredient stays where it stands (A, not B).

Then delete the `white-space: nowrap;` line from the `.ingredient-table thead th.ingredient-table__col-numeric:last-child` rule, and keep its `text-align` and `grid-column`. The brief calls it redundant once the new rule lands, and the rewritten test pins nowrap through the one rule. Record this choice in the SUMMARY. Do not touch print, the top-level column rules, the `(max-width: 723.98px)` list form, or any token. Every value here is a keyword or a grid line, so no literal is needed. Run `npm --prefix app test` (full suite, green). Stage `app/src/styles/app.css` by explicit path and commit as `feat(261004-ubg): the ingredient head reads on one line from 724, Ingredient where it stands (sketch 011 decision 48 A)`.

TRACER PROBE. Create `261004-ubg-probe.mjs` in this quick directory, modelled on the oxa probe. Import `webkit` from `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`. Import the harness by its relative path `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`, and `readAllRules` from `../../../app/src/styles/css-source.js`.

The probe reads `app/src/styles/app.css` as text and builds the CSS it adds to the page:
- ONEHEAD: the two decision 48 rules found by exact selector among the rules whose `media` is `screen and (min-width: 724px)`, wrapped back in `@media screen and (min-width: 724px) { ... }`.
- If either rule is missing from the source, the probe throws.

It serves the existing build with `startServers()`, which serves app/dist read-only on ephemeral 127.0.0.1 ports. No build, no Vite, never :4173, :5173 or :8011. It opens a route with `openApp(..., { width, height: 1000, coarse: true })`, waits for `.fold-row` and 150ms, and reads the page in state `base`. Then it adds ONEHEAD with `page.addStyleTag`, waits two animation frames, and reads again in state `+48`. Routes are the oxa and ox8 constants: `olive1` (Olive Oil v1's batch), `mex3` (Mexican Chocolate v3's batch, Show changes NOT clicked), and `base2` (`/notebook/standard-base/standard-base-v2`).

The in-page reader returns rounded boxes for:
- `.ingredient-table thead tr` (the head row)
- each `.ingredient-table thead th`
- the first non-empty `.ingredient-table tbody td.ingredient-table__col-numeric:nth-last-child(2)` (an As made figure)
- `.ingredient-table`, `.ingredient-table-region`, `.side-region` and `.method-region`
- `document.documentElement.scrollHeight`

It defines `gap` as the `.method-region` top minus the `.ingredient-table` bottom.

Mode `tracer` covers WebKit, coarse, olive1 at 1366, and gates on:
- (G0) base head row 52.17 within 0.5.
- (G48) in +48: the head row 21.39 within 0.5; the three th tops equal within 0.5; each th 14.39 tall within 0.5; the As made th 59.45 wide within 0.5, with its right edge on the As made figure's right edge within 0.5; the Ingredient th left edge equal to base within 0.5.

Print every reading. Use `check` and `finish` from the harness, so exit 1 lists each failure. Do not loosen a gate to pass. A gate that disagrees with the brief is reported, not edited away. Do not commit the probe; this quick directory goes in the orchestrator's docs commit.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/columns.test.js && node .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs tracer && SUBJECTS="$(git log --reverse --format=%s --grep='261004-ubg')" && printf '%s\n' "$SUBJECTS" | grep -m1 -E '^(test|feat)\(261004-ubg\)' | grep -q '^test(261004-ubg): pin the one-line ingredient head' && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-ubg): the ingredient head reads on one line'</automated>
  </verify>
  <done>The test commit comes before the feat commit. The columns suite and the full suite pass. In the existing build plus the source's own two rules, Olive Oil v1 at 1366 in WebKit reads a one-line head: head row 21.39, three cells on one top, As made 59.45 wide on its figures' right edge, Ingredient unmoved. Any gate that fails is listed, not loosened.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Decision 49 A: the Sheet's rows from 984, the extra height under the Instructions (test, app.css)</name>
  <files>app/src/styles/cross-cutting.test.js, app/src/styles/binder.test.js, app/src/styles/app.css</files>
  <behavior>
    - The rules with media `screen and (min-width: 984px)` are exactly `['.recipe-page', '.recipe-page--no-method']`, in that order.
    - `.recipe-page` there declares `grid-template-rows: auto auto 1fr auto` and no other property: no areas, gap or padding override, so the 983.98 block and the gutter tests stay the only owners of those.
    - `.recipe-page--no-method` there declares `grid-template-rows: auto 1fr auto` and no other property, and it comes after the block's `.recipe-page` rule. Both are (0,1,0), so source order decides.
    - Arithmetic against the top-level areas: the base `.recipe-page` `grid-template-areas` has 4 quoted rows, and the rows list has 4 tracks with `1fr` at the index of `'method side'`. The base `.recipe-page--no-method` areas have 3 rows, and its rows list has 3 tracks with `1fr` at the index of `'ingredients side'`. This pins "the Instructions' row takes the surplus".
    - The condition starts with `screen and `, so print is untouched (Phase 04 owns print).
    - The cross-cutting media-condition list gains `'screen and (min-width: 984px)'` (8 conditions). The binder gate counts 9 `@media` blocks and its `allowedMedia` gains the same string.
  </behavior>
  <action>
RED. In `app/src/styles/cross-cutting.test.js`, add a describe after the 983.98px describe, titled for sketch 011 decision 49 A: "the Sheet's rows from 984: the side column's surplus goes under the Instructions". Its tests cover the behavior bullets. Read the base rules with the file's own `ruleFor` (top-level only). Take the quoted area rows from the declarations with a `'[^']+'` match. Split the rows value on whitespace to count tracks and find `1fr`.

Update the test at line 392: append `'screen and (min-width: 984px)'` to the sorted list, and change the title from eight blocks and seven conditions to nine and eight, adding "261004-ubg the Sheet's rows from 984 (decision 49 A)" to its parenthetical. In `app/src/styles/binder.test.js` (lines 353 to 388), change `toHaveLength(8)` to `toHaveLength(9)`, add the condition to `allowedMedia`, and update the title and the comment's block list in the same words.

Run `npm --prefix app test -- src/styles/cross-cutting.test.js src/styles/binder.test.js` and confirm the failures are the expected ones (no block, a count of 8, no condition). Stage the two test files by explicit path, check `git diff --cached --name-only`, and commit as `test(261004-ubg): pin the Sheet's rows from 984, the surplus to the Instructions (sketch 011 decision 49 A)`.

GREEN. In `app/src/styles/app.css`, after the closing brace of the D3 block, as the new last block in the file, add `@media screen and (min-width: 984px)` holding the brief's two rules verbatim, per decision 49 A:
- `.recipe-page` with `grid-template-rows: auto auto 1fr auto;`
- then `.recipe-page--no-method` with `grid-template-rows: auto 1fr auto;`

The block goes at the end of the file, after every top-level rule, for two reasons: the binder suite's `ruleFor` returns the first match regardless of media, and `mediaRuleFor` must keep finding the 983.98 rules first.

Add a short comment above the block. Cite sketch 011 decision 49 A (Mark 2026-10-05: the surplus goes to the Instructions' row, not AB, not leave). Explain the mechanism: from 984 the side column spans the ingredients and method rows, and with every row auto the grid shared its surplus equally, leaving about 367px empty under Mexican Chocolate v3's table. With `1fr` on the method row (on the ingredients row when there are no Instructions), the Instructions follow the table and the empty space moves to the column's foot. Note that it is screen-only because Phase 04 owns print, and that below 984 the one-column areas of the 983.98px block apply and this block does not.

Do not edit the 983.98px block's comment. Its "one sanctioned breakpoint literal" line was already stale before this quick (the 724px blocks); mention it in the SUMMARY as noticed and leave it. Run `npm --prefix app test` (full suite, green). Stage `app/src/styles/app.css` by explicit path and commit as `feat(261004-ubg): the Instructions follow the table from 984, the side column's surplus under them (sketch 011 decision 49 A)`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/cross-cutting.test.js src/styles/binder.test.js src/styles/columns.test.js && grep -q "grid-template-rows: auto auto 1fr auto" app/src/styles/app.css && SUBJECTS="$(git log --format=%s --grep='261004-ubg')" && printf '%s\n' "$SUBJECTS" | grep -q "^test(261004-ubg): pin the Sheet's rows from 984" && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-ubg): the Instructions follow the table from 984'</automated>
  </verify>
  <done>Both new commits exist, test before feat. The style suites and the full suite pass. app.css carries nine top-level @media blocks, the ninth being the screen-only 984 rows block with exactly the two rules the brief names.</done>
</task>

<task type="auto">
  <name>Task 3: Measure both decisions in WebKit and Chrome against the README, and write the SUMMARY</name>
  <files>.planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs, .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-SUMMARY.md</files>
  <action>
PROBE `all`. Extend the probe with a second CSS set, EMPTY: every rule whose media is `screen and (min-width: 984px)`, wrapped back in that `@media`. The probe throws if the set is empty.

Before measuring, the probe asserts that `app/src/styles/notebook.css`, `shell.css` and `home.css` (comment-stripped) carry no `thead` rule and no `.recipe-page` rule declaring `grid-template-rows`. With that true, adding the CSS after the bundle cascades the same as its place in app.css. If the assertion fails, say so in the output and the SUMMARY.

Each page is read in four states, in this order: `base`, `+48` (ONEHEAD only), `+49` (EMPTY only, with ONEHEAD's style tag removed), and `both`. Engines: WebKit coarse, and system Chrome coarse through the harness `launch()`. Widths: 724, 744, 983, 984, 1024, 1366, 1600 and 1920. Recipes: olive1, mex3 and base2, plus olive1 at 1600 with the Next version pen open (click `Next version`, wait for `.ingredient-table.is-developing`, and read that table's head).

Gates, in WebKit and Chrome unless noted:
- (G0, WebKit only, base: is the build the one Sid measured, and is `gap` the README's measure?) olive1 head row 52.17 within 0.5 at 1366. olive1 gap 49 within 1 at 984, 1024, 1366 and 1600. mex3 gap 399 within 2 at 984 and 1366, 352 within 2 at 1024, and 360 within 2 at 1600.
- (G48, in +48 and both, olive1 and mex3 at every width) Head row 21.39 within 0.5. Three th tops equal within 0.5. Each th 14.39 within 0.5. Ingredient th left equal to base within 0.5. On olive1, and on mex3 only where a non-empty As made figure exists: As made th 59.45 wide within 0.5, with its right edge on the figure's within 0.5.
- (G48 no batch and pen, every state) base2 at every width and the olive1 pen at 1600: head row 21.39 within 0.5, and equal to base within 0.1.
- (G48 height) olive1: base scrollHeight minus +48 scrollHeight is 30.78 within 1 at every width. mex3: the same at 724, 744 and 983, and 0 within 1 from 984.
- (G49, in +49 and both) mex3 gap 49 within 1 at 984, 1024, 1366 and 1600. mex3 scrollHeight and `.side-region` height are equal to the matching state without EMPTY within 1: +49 against base, and both against +48.
- (G49 unchanged) olive1 and base2 at every width, and mex3 at 724, 744 and 983: the +49 boxes (ingredient region, side region, method region where present) and the scrollHeight equal base within 0.5.

Also print these readings, ungated: Chrome's base gaps (the README says about 40px less); mex3's foot space under +49 (the `.side-region` bottom minus the `.method-region` bottom; the README says 732 at 984 and 1366 and 702 at 1024); and the mex3 +48 gap at 984 (the README says 383).

If G0 fails, the served build is not the one the README measured, or `gap` is a different pair of boxes. Find the pair that reads olive1 at 49 and mex3 at the README's base numbers, record which pair, and if none fits, stop and report. Never loosen a tolerance to pass, and never change app.css to chase a number the brief did not name. Where the real DOM and a brief disagree, the SUMMARY says so plainly with both numbers.

Run `node .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs all`, then the full `npm --prefix app test`.

SUMMARY. Write `261004-ubg-SUMMARY.md` in this quick directory, in plain English and short sentences. Include:
- The two rules and the block added, and the removed redundant nowrap with its reason.
- The commits.
- The test changes: the ox8 test rewritten (say what it now pins), and the media counts going from 8 to 9 blocks and from 7 to 8 conditions.
- A readings table per engine at each width (head row, As made width, gap, page and side heights per state).
- Each gate's result, any disagreement with the README stated plainly, and the noticed stale "one sanctioned breakpoint literal" comment, which was left alone.
- The method of measurement: the existing build (app/dist, read only, ephemeral 127.0.0.1 ports) plus the edited source's own rules added in the page. There was no build and no Vite process, and :4173 was untouched.
- The consequence: Mark's running preview does NOT show these changes until `npm --prefix app run build` runs.
- A `## Deferred Human Verification` section with suggested device checks, served from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`). On the iPad at 1024 and 1366, and in Mac Safari at 1600: Olive Oil v1's batch, the head reads "AS MADE INGREDIENT ... % OF BATCH" on one line with As made over its figures. Mexican Chocolate v3's batch: the Instructions sit right under the table, and the empty space is now at the foot of the left column beside Watch for. Standard Base v2 is unchanged. On the iPhone at 393: nothing changes.

The executor files no Mark's List rows. List the checks only. Do not touch or stage `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/`, `.planning/STATE.md` or `.planning/todos/`. The probe and the SUMMARY stay uncommitted for the orchestrator's docs commit. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test && node .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs all && test -f .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-SUMMARY.md && grep -q "Deferred Human Verification" .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-SUMMARY.md && test -z "$(git status --porcelain app/)" && TOUCHED="$(git log --name-only --format= --grep='261004-ubg')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/styles/(app\.css|columns\.test\.js|binder\.test\.js|cross-cutting\.test\.js)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/(sketches|canvas-generators|todos)/|^\.planning/STATE\.md$|^\.impeccable/'</automated>
  </verify>
  <done>The probe's `all` mode exits 0, or every failing gate is listed in the SUMMARY with both numbers and nothing loosened. The full suite passes. The working tree under app/ is clean. The 261004-ubg commits touch only the four named app files. The SUMMARY carries the readings, the method, the no-build consequence and the suggested device checks.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stylesheet to rendered Sheet | Two layout rules and one rows block. No new input, no markup, no script. |
| probe to local servers | The probe serves the existing app/dist and the repo tree on ephemeral 127.0.0.1 ports, drives throwaway browser contexts, and adds CSS to the page only. Nothing is saved to the store. |
| executor to the shared working tree | Sid is editing `.planning/sketches/` and `.planning/canvas-generators/`. The sketch README has an uncommitted edit, and untracked critique and todo files are in the tree. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ubg-01 | Denial of Service | Mark's :4173 preview, the :5173 dev port, Sid's :8011, and app/dist | low | mitigate | No build and no Vite process. The harness binds ephemeral 127.0.0.1 ports only and aborts every other host. app/dist is served read only, and the probe adds CSS in the page, never on disk. |
| T-ubg-02 | Tampering | other agents' files in the shared tree | medium | mitigate | Commits by explicit path, never `git add -A`, with `git diff --cached --name-only` before each one. Task 3's verify fails if any 261004-ubg commit touches an app/ file outside the four named, or anything under `.planning/sketches`, `.planning/canvas-generators`, `.planning/todos`, `.planning/STATE.md` or `.impeccable`. |
| T-ubg-03 | Repudiation | measured numbers against the brief | low | mitigate | Gates are never loosened. A disagreement is reported in the SUMMARY with both numbers, and the CSS the probe adds is read from the committed source, so the measurement is of the source's own text. |
| T-ubg-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. The probe uses the Playwright already in the npx cache, which the 261004-ox8 and 261004-oxa probes also used. |
</threat_model>

<verification>
- `npm --prefix app test` passes (full suite).
- `node .planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs all` exits 0, or its failures are reported in the SUMMARY.
- `git log --format=%s --grep='261004-ubg'` shows two test commits, each before its feat commit.
- `git status --porcelain app/` is empty, and nothing outside the four app files is committed.
</verification>

<success_criteria>
- Decision 48 A, from 724 with a batch: the head is one 21.39px line; As made is 59.45px wide on its figures' right edge; Ingredient is unmoved; no batch and the pen are unchanged; print is untouched.
- Decision 49 A, from 984: on Mexican Chocolate v3's batch the Instructions start 49px (within 1) under the table at 984, 1024, 1366 and 1600. Page and side heights are unchanged. Olive Oil v1 and Standard Base v2 are as before, and nothing changes below 984.
- Test first for each decision. The suite is green, the commits are scoped, there is no build and no push.
</success_criteria>

<output>
Create `.planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-SUMMARY.md` when done.
</output>
