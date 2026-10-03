---
phase: quick-261002-sre
plan: 01
quick_id: 261002-sre
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/styles/tokens.css
  - app/src/styles/app.css
  - app/src/styles/columns.test.js
  - app/src/styles/cross-cutting.test.js
  - .planning/sketches/011-recipe-route-c/README.md
  - .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs
autonomous: true
requirements: [REC1-03]

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "In the Next version pen, a remove or restore link that stays on the line of the name, the estimated tag or the struck name stands 14px from the last mark before it (14.2 in system Chrome). This holds at every width 320 to 723, coarse and fine, in Playwright WebKit and system Chrome, on Mexican Chocolate v4 (12 links), Mocha v3 (14) and Strawberry v2.1 (11). Before the fix it was 0 (sketch 011 decision 26, Mark 2026-10-02: \"14px, fix it\")."
    - "A link that wraps sits flush at the start of its line (left offset 0 from the name cell below 724). In the orphaned-row state (step 1 removed) the row's link stands flush on its own line under the flag."
    - "The button box does not change (WebKit 44.7 x 44 coarse, Chrome 43.1 x 44). The name, amount and share tracks do not move at any row or width. Only rows whose link newly wraps grow. At 393 (WebKit, coarse, Mexican Chocolate v4) 5 of 12 links wrap instead of 3 (Cocoa Powder and Vanilla Extract newly wrap) and the table grows 36px, a cost Mark has accepted. Page overflow is 0."
    - "The app matches 393-pen-changes.html (coarse) and 723-pen-changes.html (fine) row for row: row, amount, name, share, field and link boxes all within 0.5px (0 mismatches), table height within 1px, in both engines."
    - "From 724 up (the table form) the same rule applies, as 1600-pen.html already draws it: the same-line gap is 14 (14.2 in Chrome), a wrapped link keeps its offset from before the fix, and the share column moves at most 0.5px."
    - "Out of scope, so unchanged: OrphanedRowFlag and its 'remove this row' button, the Method's step controls, the portionIndex === 0 guard, the Correct pen (it renders no remove link), every sketch board, the canvas generators, and 1600-pen.html."
    - "Sketch 011's README records decision 26 as approved by Mark on 2026-10-02 (\"14px, fix it\"). The rest of Sid's text is unchanged."
    - "The full suite passes: baseline 55 files / 1506 tests, plus the new test, none removed. src/ui/tabindex-scan.test.js passes."
  artifacts:
    - path: app/src/ui/IngredientTable.jsx
      provides: "RemoveRowControl returns a fragment: the gap span, then the unchanged text-control button"
      contains: "ingredient-table__remove-gap"
    - path: app/src/styles/tokens.css
      provides: "the --sheet-remove-gap token beside --sheet-flag-gap"
      contains: "--sheet-remove-gap: 10px"
    - path: app/src/styles/app.css
      provides: "the base-level word-spacing rule after .ingredient-table__flag"
      contains: ".ingredient-table__remove-gap"
    - path: app/src/ui/IngredientTable.test.jsx
      provides: "the Graza regex requires the gap span; one new test pins restore and exactly one gap span per link"
      contains: "ingredient-table__remove-gap"
    - path: app/src/styles/columns.test.js
      provides: "the token's literal value pinned in decision 15's literal-token test"
      contains: "--sheet-remove-gap"
    - path: app/src/styles/cross-cutting.test.js
      provides: "the rule's declaration pinned beside the .ingredient-table__flag check"
      contains: "--sheet-remove-gap"
    - path: .planning/sketches/011-recipe-route-c/README.md
      provides: "decision 26 marked approved"
      contains: "14px, fix it"
    - path: .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs
      provides: "measured conformance on the build: tracer, boards, states, sweep, sweep-fine and wide groups, WebKit and system Chrome"
  key_links:
    - from: "app/src/ui/IngredientTable.jsx RemoveRowControl"
      to: "app/src/styles/app.css .ingredient-table__remove-gap"
      via: "the span immediately before the button carries the class; its one collapsible space takes the extra word spacing"
      pattern: "ingredient-table__remove-gap"
    - from: "app/src/styles/app.css .ingredient-table__remove-gap"
      to: "app/src/styles/tokens.css --sheet-remove-gap"
      via: "word-spacing: var(--sheet-remove-gap), with no literal in app.css"
      pattern: "var\\(--sheet-remove-gap\\)"
---

<objective>
Give the Next version pen's remove and restore link a 14px gap from the name or the estimated tag, as sketch 011 decision 26 draws it. Mark approved it on 2026-10-02: "14px, fix it". The gap is 14px, and a wrapped link stays flush at the start of its line. Then measure the built app against 393-pen-changes.html and 723-pen-changes.html, and sweep 320 to 723 in Playwright WebKit and system Chrome.

Purpose: Mark reported this on his iPhone: "the remove link doesn't have enough white space to separate it from either ingredient name or estimated tag". Today the underlined word touches the mark before it ("Sucroseremove", "[estimated]remove"), 0px at every width. Correct renders no remove link, so nothing changes there.

Output: one span in RemoveRowControl, one token, one base-level rule, and four test pins (written test-first). Decision 26 is marked approved in the sketch README. The output also includes a measuring probe beside this plan and a SUMMARY with the measured numbers.
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
@app/src/styles/tokens.css
@app/src/styles/app.css
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs

Facts the planner established. The executor does not need to re-derive them.

- Sid's brief was already measured, and this plan follows it exactly. The boards are the authority, their CSS included. 393-pen-changes.html already carries `:root{--sheet-remove-gap:10px}`, `.ingredient-table__remove-gap{word-spacing:var(--sheet-remove-gap)}`, and `<span class="ingredient-table__remove-gap"> </span>` immediately before every `<button type="button" class="text-control" tabindex="0">remove</button>` and before Cinnamon's `restore`. That includes the case where the button follows the estimated chip, as in Cinnamon's row: struck name, chip, gap span, restore. Neither the boards nor the generator change.
- `RemoveRowControl` (app/src/ui/IngredientTable.jsx, about line 161) is rendered only in the developing branch (about line 610), behind `portionIndex === 0`. That is the last child of `td.ingredient-table__col-name`, after the name (or the struck name span), the estimated chip, the portion note (`display: block`) and `OrphanedRowFlag` (a `<p>`). After a block, the gap span starts a new line, where its collapsible space is dropped, so the link stays flush.
- In developing mode, a removed row comes from `penDraft.rows[id].removed` (`const removed = draftRow.removed`, about line 529). The test helper `onePortionDraftRow(step, grams, removed = false)` (IngredientTable.test.jsx, line 35) takes it as its third argument. A row with `ingredient: { composition: { fat: 1 }, basis: { fat: 'stated' } }` renders no estimated chip. The Graza Drizzle test (about line 965) relies on this.
- `renderToStaticMarkup` renders `<span className="ingredient-table__remove-gap">{' '}</span>` as `<span class="ingredient-table__remove-gap"> </span>`.
- Tests that pin remove or restore markup. IngredientTable.test.jsx line 945 (no name before the button, so it still passes) and line 985 (`/Graza Drizzle<button type="button" class="text-control"[^>]*>remove<\/button>/`, which fails once the span exists, and is meant to). The Method.test.jsx and Authored.test.jsx remove and restore assertions are on other components and are unaffected.
- In cross-cutting.test.js, `ruleFor(selector)` (line 59) finds a rule with that exact selector and no media, which is right for a base-level rule. Its list-form block test (the ordered selector list for `(max-width: 723.98px)`) is unaffected. In columns.test.js, the decision 15 literal-token test is at line 203. Its title ends "(64, 18, 8)".
- Seeded routes and the pen. Mexican Chocolate v4 is `/notebook/mexican-chocolate/mexican-chocolate-v4`, Mocha v3 is `/notebook/mocha/mocha-v3`, and Strawberry v2.1 is `/notebook/strawberry/strawberry-v2-1`. Open the pen with the first button named `Next version`. The board state is the one 261002-axn-probe.mjs's `openPen` and `editPen` produce: Whole Milk 3.3% 600, Sucrose 36, Cocoa Powder 45, and Cinnamon's `remove` clicked. In the orphaned-row state, click the first button inside `.method-region` whose text is exactly `remove` (step 1, on its closed step), then wait for a `p.ingredient-table__flag` inside the table.
- Sid's numbers, measured on the :4173 build with the rule injected in the page, and confirmed against the boards. Same-line gap: 14 in WebKit, 14.2 in Chrome. Wrapped offset: 0 below 724. Button: 44.7 x 44 coarse in WebKit, 43.1 x 44 in Chrome. Tracks moved at 0 row-widths. Overflow: 0. Newly wrapped row-widths over 404 widths, WebKit coarse: 130 (Mexican Chocolate v4), 130 (Mocha v3), 102 (Strawberry v2.1). Chrome: 127, 127, 99. Board against app at 393 and 723, both engines: 14 rows, 0 mismatches. Lesson from 261002-axn: where the app and a board agree but differ from a figure in this plan, the board governs and the difference is a finding.
- Playwright and servers. Import `webkit` and `devices` from `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`. The harness's `launch()` is system Chrome; Playwright's own Chromium is not installed. A coarse app context spreads `devices['iPhone 14']` with `viewport` and `screen` overridden (261002-axn-probe.mjs `openAppPage`). `page.setViewportSize` moves `innerWidth` exactly in both engines. `openBoard` opens a 393 board coarse and a 723 board fine. Only :5173 (dev) and :4173 (Mark's preview) listen. Start no third Vite process. The harness's `startServers()` serves app/dist and the repo on ephemeral 127.0.0.1 ports. `npm --prefix app run build` rewrites app/dist, and :4173 picks it up; this is allowed.
- Sid's scratch scripts are the measuring method to port (rmsweep.mjs, orph2.mjs, boardgap.mjs, sid/pen-conf-rm.mjs). They are in /private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/5770989c-728d-49aa-af07-986b91c2d74b/scratchpad/. The method is restated in Task 1 so the probe does not depend on them. Their in-page injection is replaced here by the built rule. The "before" baseline comes from an injected `.ingredient-table__remove-gap{display:none}` style tag. That reproduces today's markup exactly, with nothing between the last mark and the button, without mutating React's DOM.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Gap span, token and rule, test-first; prove one path: Mexican Chocolate v4's pen at 393 in WebKit, every same-line link 14px clear</name>
  <files>app/src/ui/IngredientTable.test.jsx, app/src/styles/columns.test.js, app/src/styles/cross-cutting.test.js, app/src/ui/IngredientTable.jsx, app/src/styles/tokens.css, app/src/styles/app.css, .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs</files>
  <behavior>
    - columns.test.js, decision 15 literal-token test: `resolveTokenPx(tokens, '--sheet-remove-gap')` is 10.
    - cross-cutting.test.js, beside the `.ingredient-table__flag` check: `ruleFor('.ingredient-table__remove-gap').declarations` matches `/word-spacing:\s*var\(--sheet-remove-gap\)/`.
    - IngredientTable.test.jsx, the Graza Drizzle test: the markup matches `Graza Drizzle`, then `<span class="ingredient-table__remove-gap"> </span>`, then the text-control button reading `remove`, with nothing else between.
    - IngredientTable.test.jsx, new test in the RemoveRowControl describe: Row A is active and Row B removed, both without a chip. The markup contains Row B's struck name, then the gap span, then the text-control button reading `restore`. The number of gap-span-then-button pairs equals the number of `class="ingredient-table__remove-gap"` occurrences and the number of text-control buttons reading remove or restore, and all three are 2. So every link has exactly one gap span immediately before it, and no stray span exists.
  </behavior>
  <action>
RED (decision 26). Write the four pins before any source change:
(a) In app/src/styles/columns.test.js, in the test at about line 203, add `expect(resolveTokenPx(tokens, '--sheet-remove-gap')).toBe(10);` after the `--sheet-flag-gap` line. Retitle the test so it stays true: "…the flag gap and the remove gap resolve to the board's literal px values (64, 18, 8, 10)".
(b) In app/src/styles/cross-cutting.test.js, directly after the line `expect(ruleFor('.ingredient-table__flag').declarations)…` (about line 682), add `expect(ruleFor('.ingredient-table__remove-gap').declarations).toMatch(/word-spacing:\s*var\(--sheet-remove-gap\)/);`. Put a one-line comment above it citing sketch 011 decision 26, in the style of the file's existing comments.
(c) In app/src/ui/IngredientTable.test.jsx, at about line 985, replace the Graza regex with `/Graza Drizzle<span class="ingredient-table__remove-gap"> <\/span><button type="button" class="text-control"[^>]*>remove<\/button>/`.
(d) In the same file, in the describe "the pen's remove/restore control carries .text-control" (about line 935), add one test whose title cites sketch 011 decision 26. Build it this way:
- two rows, `makeRow('a', 'Row A', 10, 1, CHIPLESS)` and `makeRow('b', 'Row B', 20, 1, CHIPLESS)`, where CHIPLESS is the Graza test's override `{ ingredient: { composition: { fat: 1 }, basis: { fat: 'stated' } } }`, written inline;
- `draftVersion = structuredClone(version)` with `draftVersion.rows[1].removed = true`;
- `penDraft = { rows: { a: onePortionDraftRow(1, '10'), b: onePortionDraftRow(1, '20', true) }, asMade: {} }`;
- render as the Graza test does (mode `developing`, `openBatch={null}`).
Assert:
- the markup matches `/<span class="struck-value">Row B<\/span><span class="ingredient-table__remove-gap"> <\/span><button type="button" class="text-control"[^>]*>restore<\/button>/`;
- the pair count (`/<span class="ingredient-table__remove-gap"> <\/span><button type="button" class="text-control"[^>]*>(remove|restore)<\/button>/g`), the span count (`/class="ingredient-table__remove-gap"/g`) and the link count (`/class="text-control"[^>]*>(remove|restore)<\/button>/g`) are all 2.
Run `npm --prefix app test -- src/styles/columns.test.js src/styles/cross-cutting.test.js src/ui/IngredientTable.test.jsx` and confirm that exactly these four pins fail (TypeError and undefined token count as failing). Commit the three test files by explicit path as `test(261002-sre): pin the remove link's gap span, token and rule (decision 26)`, ending with the trailer lines from the executing session's system reminder.

GREEN, exactly as Sid's brief (decision 26):
1. app/src/ui/IngredientTable.jsx, RemoveRowControl. Return a fragment: `<span className="ingredient-table__remove-gap">{' '}</span>` immediately before the existing `<button type="button" className="text-control" tabIndex={0} onClick={onToggle}>` element, which stays byte-for-byte as it is. One span serves both "remove" and "restore". Extend the comment above the function by one sentence: the span before the button carries the gap (sketch 011 decision 26), a collapsible word space widened by --sheet-remove-gap, so a link on the name's line stands 14px clear and a wrapped link stays flush. Leave OrphanedRowFlag, the Method controls and the `portionIndex === 0` guard alone.
2. app/src/styles/tokens.css. After the `--sheet-flag-gap` line (about line 451), add `--sheet-remove-gap: 10px;` with the brief's comment: added to the ~4px word space so the link stands 14px from the last mark, as on 1600-pen.html; the space collapses at line start, so a wrapped link stays flush; sketch 011 decision 26.
3. app/src/styles/app.css, at base level with no media block. After the `.ingredient-table__flag` rule's closing brace (about line 876) and before the plan-grams comment, add `.ingredient-table__remove-gap { word-spacing: var(--sheet-remove-gap); }` with a short comment above it in the file's style, citing decision 26 and the collapsing space. No literal, no `!important`, no other rule touched.
Run the same three test files until they pass, then commit the three source files by explicit path as `fix(261002-sre): give the pen's remove link a 14px gap from the name (sketch 011 decision 26)`, with the trailer lines.

TRACER PROBE. Create .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs as plain Node ESM, modelled on 261002-axn-probe.mjs, with the same imports and the same `countedCheck`/`finish` pattern. Import `startServers`, `launch`, `openBoard`, `check` and `finish` from `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`, unchanged. The first CLI argument is a comma list of groups, and no argument runs all of them. This task implements only `tracer`. Build the pieces Task 3 reuses:
- `openAppPage` (copy it from the axn probe: coarse means the iPhone 14 profile, every non-127.0.0.1 request is aborted, and it throws unless pointer and innerWidth match).
- `openPen(page)`: click the first `Next version`, then wait for the first `button.text-control` inside `td.ingredient-table__col-name`.
- `setBaseline(page, on)`: add or remove a `style#sre-baseline` holding `.ingredient-table__remove-gap{display:none}`.
- `readPen` (run through `page.evaluate`, so it reads the app and the board alike). Port rmsweep.mjs's in-page probe. For every tbody row whose name cell has a direct-child button reading exactly remove or restore:
  - collect the marks before the button: text nodes through a Range's client rects, element children's rects, and the text inside non-chip spans (the struck name), skipping the button and the gap span;
  - from the marks whose vertical span covers the button's vertical centre and whose right edge is at or before the button's left plus 0.5, take the largest right edge as the last mark;
  - record: `gap` (button left minus last mark, or null when no mark is on the line, which means wrapped); `off` (button left minus name cell left); the button's width and height; the name, amount and share cells' left and width (share is the row's last `td.ingredient-table__col-numeric`); the row height; the row's name (first line, 20 chars); whether the button's previous sibling node is a `span.ingredient-table__remove-gap` whose text is a single space; and the bounding rect of any `p.ingredient-table__flag` in the cell.
  - also return `innerWidth`, `overflow` (documentElement.scrollWidth minus innerWidth), the table height, and whether pointer is coarse.
- `gapFigure(engine)`: 14 for webkit, 14.2 for chrome.
Tracer group: WebKit only, 393 coarse, Mexican Chocolate v4, pen opened. Count these checks:
- 12 links;
- every link has its gap span (the previous-sibling check);
- every same-line gap is within 0.5 of 14;
- Sucrose's link is on the line, with gap 14 within 0.5;
- every wrapped link's `off` is within 0.5 of 0;
- overflow is at most 0.
Log one JSON line with the gaps, the wrapped rows' names and the table height. Close the servers and browser in `finally`, then call `finish`.
Rebuild, run the tracer, then commit the probe by explicit path as `test(261002-sre): probe the remove link's gap on the build (tracer)`, with the trailer lines. Never `git add -A` or `git add .`: the untracked .impeccable/critique files must stay out. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/columns.test.js src/styles/cross-cutting.test.js src/ui/IngredientTable.test.jsx && npm --prefix app run build && node .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs tracer</automated>
  </verify>
  <done>The four pins failed before the source change and pass after it. RemoveRowControl renders the gap span immediately before the unchanged button. tokens.css has `--sheet-remove-gap: 10px` after `--sheet-flag-gap`, and app.css has the base-level word-spacing rule after `.ingredient-table__flag`. The build succeeds. The tracer exits 0 in WebKit at 393 coarse: all 12 links carry the span, every same-line gap is 14 within 0.5 (Sucrose included), wrapped links sit at 0, and overflow is 0. There are three commits (test, fix, probe) on main, each by explicit path.</done>
</task>

<task type="auto">
  <name>Task 2: Record decision 26 as approved in sketch 011's README</name>
  <files>.planning/sketches/011-recipe-route-c/README.md</files>
  <action>
In .planning/sketches/011-recipe-route-c/README.md, item 26 (line 81) opens with the bold lead `**Drawn, awaiting Mark's look (Sid, 2026-10-02; proposed, not approved):**`. Replace only that bold lead with `**Approved by Mark (2026-10-02, "14px, fix it"; Sid proposed it the same day):**`. That mirrors decision 24's "**Approved by Mark (2026-10-02; Sid proposed it the same day):**".
Keep every other word of Sid's decision 26 text unchanged. Per the brief, this is the only sketch edit: no other README line, board, snapshot or generator changes.
Commit the README by explicit path as `docs(sketch-011): Mark approves decision 26, the remove link's 14px gap`, with the trailer lines. Do not push.
  </action>
  <verify>
    <automated>grep -c '^26\. \*\*Approved by Mark (2026-10-02, "14px, fix it"; Sid proposed it the same day):\*\* the pen.s remove and restore links stand clear of the name and the estimated tag\.' .planning/sketches/011-recipe-route-c/README.md</automated>
  </verify>
  <done>Decision 26's lead reads "Approved by Mark (2026-10-02, "14px, fix it"; Sid proposed it the same day)". The grep prints 1, which shows the new lead runs straight into Sid's unchanged first sentence. The rest of the paragraph is byte-identical. The README commit touches only that file, with 1 insertion and 1 deletion, checked against the commit's own sha.</done>
</task>

<task type="auto">
  <name>Task 3: Measured conformance on the build: both boards, restore and orphan states, the 320-723 sweep coarse and fine, 724 and 1366, both engines; full suite; SUMMARY with numbers</name>
  <files>.planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs</files>
  <action>
Extend the probe with these groups. Each engine is WebKit (`webkit.launch()`) and system Chrome (the harness's `launch()`). Output one compact JSON line per state, engine and pointer (counts, minimum and maximum), plus FAIL lines, not one line per width.

- `boards`. In each engine, open the pen on Mexican Chocolate v4 and apply the board edits (600, 36, 45, and Cinnamon's remove; port `editPen` from the axn probe). Compare at 393 coarse against 393-pen-changes.html and at 723 fine against 723-pen-changes.html (`openBoard` defaults). Port sid/pen-conf-rm.mjs's reader: for every tbody and tfoot row, rects for the row, the amount cell, the name cell, the share cell, the input, and the name cell's button. Rects are relative to the table, rounded to 0.5, with each y taken relative to its own row's top. Check the same row count (the board draws 14), every rect's x, width, height and row-relative y within 0.5 (0 mismatches), and table height within 1. Also read both pages with `readPen`. Each link's gap must match the board's link gap at the same index within 0.5. Cinnamon's `restore` must be on the line at 393, with gap within 0.5 of `gapFigure(engine)`.
- `states`. In each engine, at 320, 393 and 723, coarse and fine, on Mexican Chocolate v4:
  (1) Restore: Cinnamon's remove is clicked. If the restore link is on the line, its gap is within 0.5 of the figure. If it is wrapped, its off is within 0.5 of 0. Its previous sibling is the gap span.
  (2) Orphaned row: step 1 is removed, as in the context facts. At least one row has a `p.ingredient-table__flag`. On every such row, the link's off is within 0.5 of 0, its top is at or below the flag's bottom minus 0.5, and its gap is null (the link is on its own line).
- `sweep` (coarse) and `sweep-fine` (fine). In each engine there are three states, the pen opened with no edits on Mexican Chocolate v4, Mocha v3 and Strawberry v2.1. Each state uses one page opened at 393. For every integer width from 320 to 723: `page.setViewportSize({ width, height: 1100 })`, wait one animation frame, `setBaseline(page, true)` and `readPen`, then `setBaseline(page, false)` and `readPen`. Count these checks at every width:
  - innerWidth equals width;
  - the link count is 12, 14 or 11 per recipe, and every link has its gap span;
  - overflow is at most 0;
  - every same-line gap is within 0.5 of the figure;
  - every wrapped link's off is within 0.5 of 0;
  - every button's width and height equal the baseline's within 0.1, and on coarse the height is 44 within 0.5;
  - every row's name, amount and share cell left and width equal the baseline's within 0.1;
  - a row whose link is on the line in both reads, or wrapped in both, keeps the baseline height within 0.1;
  - no row is wrapped in the baseline but on the line after the fix.
  Count the newly wrapped row-widths per state, and print them beside Sid's figures as report-only: WebKit coarse 130, 130, 102; Chrome 127, 127, 99. At 393, WebKit coarse, Mexican Chocolate v4, also check that the baseline wraps 3 of 12 links and the fix wraps 5 of 12, that the newly wrapped rows are Cocoa Powder and Vanilla Extract, and that the table height grows 36 within 1.
- `wide`. In each engine, fine pointer, at 724 and 1366, with a fresh context per width since 1366 crosses the folds' cut. Open the pen on Mexican Chocolate v4, read with the baseline on and then off, and check:
  - every same-line gap is within 0.5 of the figure;
  - every wrapped link's off equals the baseline's within 0.5;
  - every share cell's left moves at most 0.5;
  - overflow is at most 0.

Run the verify chain. If a check fails, do not widen scope: no token value, track, board, generator or other markup change. Where the app and a board agree but differ from a figure in this plan, the board governs. Record the numbers in the SUMMARY as a finding for Mark, and adjust only the probe's expectation, saying why.

Write .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-SUMMARY.md. It records:
- the suite count against the 55 files / 1506 tests baseline;
- the 393 and 723 board comparisons per engine (rows, mismatches, table heights, restore gap);
- the restore and orphan readings;
- the sweep totals per state, engine and pointer: widths, links, gap minimum and maximum, wrapped offsets, newly wrapped row-widths against Sid's, maximum track movement, and overflow;
- the 393 wrap numbers (3 to 5 of 12, +36px);
- the wide result;
- a plain statement that this is device-unverified. Playwright WebKit is not Mark's iPhone, and the 4px word space follows the device's own font metrics, so Mark's iPhone check of the Next version pen is still owed.
Commit the probe and the SUMMARY by explicit path as `docs(261002-sre): measure the remove link's gap against sketch 011 boards`, with the trailer lines. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && npm --prefix app test -- src/ui/tabindex-scan.test.js && npm --prefix app run build && node .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs tracer,boards,states,wide && node .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs sweep && node .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs sweep-fine</automated>
  </verify>
  <done>The full suite passes (55 files / 1506 tests plus the new test, none removed), and so does the tabindex scan. The build succeeds. Every probe group exits 0 in WebKit and system Chrome:
- both pen boards match with 0 mismatches;
- restore is 14 clear, or 14.2 in Chrome;
- orphan rows' links are flush under the flag;
- all 404 widths, coarse and fine, on three recipes: same-line gap at the figure, wrapped links at 0, buttons and tracks unmoved, overflow 0;
- at 393, 3 to 5 of 12 links wrap and the table grows +36;
- from 724 up the gap holds and the share column is still.
The SUMMARY records every number and the device-unverified statement. The probe and SUMMARY are committed on main by explicit path, and nothing is pushed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| component to markup | RemoveRowControl renders a static span containing a single space, plus React text children. No markup API is used. |
| probe to local servers | The probe serves app/dist and the repo on ephemeral 127.0.0.1 ports and drives throwaway browser contexts. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-sre-01 | Tampering | RemoveRowControl's added span | low | accept | The span holds a fixed literal space and no user data. The button keeps `tabIndex={0}` and its own text, and no raw-HTML injection API is added (the project rule for app/src holds). |
| T-sre-02 | Denial of Service | the probe's servers and Mark's running Vite processes | low | mitigate | The harness binds only ephemeral 127.0.0.1 ports and aborts every request to another host. Servers and browsers close in `finally`. No Vite process is started, and :5173 and :4173 are never requested. The orphan and restore states stay in the probe's own throwaway context and are never saved. |
| T-sre-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. The probe uses the playwright-core module and WebKit build already on disk. If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- `npm --prefix app test -- --run` passes (55 files / 1506 tests plus the new test), and `src/ui/tabindex-scan.test.js` passes.
- `npm --prefix app run build` succeeds, and every probe group exits 0 in WebKit and system Chrome.
- `git diff --stat` across the commits shows only IngredientTable.jsx, IngredientTable.test.jsx, tokens.css, app.css, columns.test.js, cross-cutting.test.js, the sketch 011 README, the probe and the SUMMARY. Every board, `.planning/canvas-generators/`, CLAUDE.md and every other file are untouched.
- The untracked .impeccable/critique files are not staged, and nothing is pushed.
</verification>

<success_criteria>
- In the Next version pen, a remove or restore link that shares a line with the name or the estimated tag stands 14px clear (14.2 in Chrome). A wrapped link is flush at line start. The button, the tracks and the page width are unchanged. This holds at every width 320 to 723 in both engines and both pointers, and it matches 393-pen-changes.html and 723-pen-changes.html.
- Decision 26 reads approved by Mark in sketch 011's README.
- The SUMMARY carries the measured numbers and says plainly that this is device-unverified.
</success_criteria>

<output>
Create `.planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-SUMMARY.md` when done
</output>
