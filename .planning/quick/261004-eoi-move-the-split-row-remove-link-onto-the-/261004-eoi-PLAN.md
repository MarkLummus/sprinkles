---
phase: quick-261004-eoi
plan: 01
quick_id: 261004-eoi
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.test.jsx
  - .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs
  - .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-baseline.json
  - .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-SUMMARY.md
autonomous: true
requirements: [REC1-03]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "In the Next version pen, the name cell of a split ingredient's first portion renders in this DOM order: the name (struck when removed), the estimated tag when present, the orphan flag when present, the gap span and the remove or restore link, then the portion line. Only the order changes. Tokens, tabIndex={0}, every label and every handler stay as they are (sketch 011 decision 26 and the decision 33 addendum 'The split row's remove link', approved by Mark 2026-10-04)."
    - "On Olive Oil v1 with the pen open, the built app measures as follows in Playwright WebKit with a coarse pointer and in system Chrome with a mouse, at 393, 723, 744, 984, 1024, 1366 and 1600. The Whole milk and Sucrose links sit on the name's line, 14px from the last mark of the name or tag (within 0.5). The portion line starts at or below the link's bottom, at the same left as before. Each split row is 15 to 25px shorter than its baseline, the two split rows are the same height, and page overflow is unchanged."
    - "At 1600 the app's split rows match the proposed panel of .planning/sketches/011-recipe-route-c/1600-remove-link.html. The link is on the name's line and the gap is within 0.5 of the board's, in both engines. In WebKit with a coarse pointer, where the board and the app both draw a 44px link, the row height is within 1px of the board's (71.72 at plan time)."
    - "Nothing else moves. Non-split rows, the second-portion rows, every column's left and width, every button's size, and Mexican Chocolate v4's pen (which has no portion lines) all match the pre-change baseline within 0.5 in every cell. The reading and Show changes markup is unchanged, which the existing tests prove."
    - "`npm --prefix app test` passes at 59 files with 1584 tests plus the new ones, and none are removed. `npm --prefix app run build` succeeds."
    - "Under app/, this task's commits change only app/src/ui/IngredientTable.jsx and app/src/ui/IngredientTable.test.jsx (and app/src/styles/cross-cutting.test.js only if it turns out to pin the old order; at plan time it does not). No commit touches .planning/sketches, .planning/canvas-generators, a stylesheet or a token."
  artifacts:
    - path: app/src/ui/IngredientTable.jsx
      provides: "renderDevelopingEntry's name cell with the portion-line span after RemoveRowControl"
      contains: "ingredient-table__portion-note"
    - path: app/src/ui/IngredientTable.test.jsx
      provides: "split-row remove, restore and orphan order tests, plus a non-split guard"
      contains: "261004-eoi"
    - path: .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs
      provides: "baseline / tracer / matrix / board groups measuring the built app in WebKit (coarse) and system Chrome (mouse)"
    - path: .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-baseline.json
      provides: "pen geometry for every probe cell, captured from a build of the unchanged source"
  key_links:
    - from: app/src/ui/IngredientTable.jsx
      to: RemoveRowControl
      via: "renderDevelopingEntry renders it on portion 0 only, now before the isSplit portion-line span"
      pattern: "portionIndex === 0 && <RemoveRowControl"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/IngredientTable.jsx
      via: "the single consumer (~line 2046); the pen at every width renders this one component"
      pattern: "<IngredientTable"
---

<objective>
Move the split row's remove link onto the name's line in the Next version pen. This is sketch 011 decision 33 task 7, an addendum to decisions 26 and 33, approved by Mark on 2026-10-04: "I approve the remove-link fix."

Purpose: on a split ingredient row (Olive Oil v1's Whole milk, 120 + 250.4 g, and Sucrose, 12 + 64 g), renderDevelopingEntry prints the name, the estimated tag, the portion line and then RemoveRowControl. The portion line (`.ingredient-table__portion-note`) is `display: block`, so the link starts a new line under it, at every width. Decision 26 places the link on the name's line, 14px clear of the last mark (a word space plus `--sheet-remove-gap` 10px; a wrapped link stays flush). The proposed panel of 1600-remove-link.html draws the fix: the link after the name and tag, with the portion line under both.

Output: the reordered name cell in IngredientTable.jsx, written test-first. A probe that measures the built app before and after the change in WebKit (coarse) and system Chrome (mouse) at seven widths and checks it against the board. A SUMMARY with the numbers. Mark's device check is deferred to him.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md
@app/src/ui/IngredientTable.jsx
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs
@.planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs

<interfaces>
These are the facts the planner read at HEAD eb517bb. Re-check them before relying on them.

- IngredientTable.jsx lines 159-173: `RemoveRowControl({ removed, onToggle })` renders `<span className="ingredient-table__remove-gap">{' '}</span>` followed by `<button type="button" className="text-control" tabIndex={0}>` reading 'remove' or 'restore'.
- IngredientTable.jsx lines 265-282: `OrphanedRowFlag` returns a block `<p className="ingredient-table__flag">` holding 'used by …, which is removed' and its own 'remove this row' button (tabIndex={0}).
- IngredientTable.jsx lines 622-642, the developing name cell, in this order: the name (or `<span className="struck-value">` when removed), the `dataFlag` chip (`target-chip ingredient-table__flag`), the `{isSplit && …portion-note…}` span (lines 629-633, text from `formatPortionLine(livePortionGrams, rowGrams(row), currentMass)`), the `{portionIndex === 0 && flagged && <OrphanedRowFlag …/>}` (634-636), the JSX comment (637-640: "after the name and after the orphan flag when present, mirroring the sketch's own tail-of-cell placement"), and then `{portionIndex === 0 && <RemoveRowControl …/>}` (641). renderReadingEntry (491-503) and renderShowChangesEntry (533-545) render no remove control and are not touched.
- No stylesheet rule depends on the name cell's child order. `grep -nE "portion-note|remove-gap|col-name[^{]*(button|\+|~|:last|:first|:nth)" app/src/styles/*.css` finds only `.ingredient-table__remove-gap` (app.css ~884) and `.ingredient-table__portion-note { display: block }` (~940).
- Tests that mention the portion line (`grep -rn "portion-note" app/src`): IngredientTable.test.jsx ~326, ~349, ~742-747 and ~843. All of them render mode "reading", so none pins the pen's order. cross-cutting.test.js pins only the `.ingredient-table__remove-gap` word-spacing rule (~704), not the order. The pen's remove tests at ~932-973 (decision 26 gap span), ~991-1014 (Graza Drizzle) and ~1055-1099 (tabindex, orphan) use single-portion rows.
- Test helpers in IngredientTable.test.jsx: `makeRow(id, name, grams, step, overrides)`, where `overrides.portions` replaces the single portion and the default ingredient has no chip. `makeVersion(rows)` has method []. `onePortionDraftRow(step, grams, removed)`. An estimated chip comes from `ingredient: { composition: { fat: 1 }, basis: { fat: 'estimated' } }`. The reading fixture at ~805-820 (Whole milk split 120 + 250.4 and estimated, Heavy cream 429.28 on step 3, method steps 1-3) prints the portion line '120 g of 370.4 g · 46.3% in all'.
- Seed: Olive Oil v1 has 12 rows. Its split rows are Whole milk (120 + 250.4, estimated tag) and Sucrose (12 + 64, no tag), and it has no Salt row. Mexican Chocolate v4 (`/notebook/mexican-chocolate/mexican-chocolate-v4`) has 12 rows and no split row. The harness exports `APP_ROUTE`, Olive Oil v1's batch route, which is the route Sid's probe opens the pen from.
- Probe building blocks:
  - The 03.5 harness exports `startServers` (app/dist plus the repo tree on ephemeral 127.0.0.1 ports), `launch` (system Chrome, headless), `openBoard(browser, repoUrl, file, { width, coarse })`, `APP_ROUTE`, `check` and `finish`.
  - 261002-sre-probe.mjs `readPen` (lines 38-105) is the decision 26 link reader. Its gap is the button's left minus the rightmost mark on the button's vertical centre line, left of the button. It is null when no mark shares that line, meaning the link sits on a line of its own.
  - 261002-wdn-probe.mjs `readTable`'s `rowRecord` (lines 52-62) records each row's text, height and cell boxes. Its `sameRow` (163-179) is the 0.5px comparison, which skips y on display:none cells.
  - Copy the playwright-core import line from either probe.
  - Sid's .planning/canvas-generators/remove-link-probe.mjs is read-only evidence. Its context options `{ viewport: { width, height: 1000 }, hasTouch: coarse, isMobile: false, deviceScaleFactor: 1 }` produced his recorded readings.
- Planner's readings, all read-only, from the Oct 3 build of the current source:
  - Board, proposed panel (`table.ingredient-table` index 1; index 0 is today's), read the same way. WebKit coarse: Whole milk and Sucrose rows 71.72, gaps 13.98 and 13.97, the link 44 tall with the portion line starting at its bottom. Today's panel reads 91.63 and 89.72. Chrome fine: rows 71.39, gap 14.17, but the board's link is still 44 tall with a mouse.
  - App, with the button and gap span moved before the portion line in-page (a DOM experiment, not the edit). WebKit coarse: on the line at every width, gap 13.98 and 13.97. Rows go from 91.3 and 89.39 to 71.39 at 744 and up, and from 95.3 and 93.39 to 75.39 at 393 and 723. Chrome mouse: gap 14.17, the link 24 tall. Rows go from 70.7 and 69.39 to 51.39 at 744 and up, and from 74.7 and 73.39 to 55.39 at 393 and 723.
  - Overflow is 0 everywhere, and no split link wraps at any of the seven widths.
- Suite baseline at plan time: 59 files, 1584 tests, all passing.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Capture the baseline, then put the split row's link before its portion line (RED, then GREEN), proven on Olive Oil v1 at 1600 in WebKit</name>
  <files>.planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs, .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-baseline.json, app/src/ui/IngredientTable.test.jsx, app/src/ui/IngredientTable.jsx</files>
  <read_first>app/src/ui/IngredientTable.jsx (lines 159-173, 256-282, 558-657), app/src/ui/IngredientTable.test.jsx (lines 1-40, 800-850, 932-1014, 1050-1100), .planning/quick/261002-sre-give-the-next-version-pen-s-remove-link-/261002-sre-probe.mjs (lines 1-105, 141-172), .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs (lines 15-62, 158-208, 264-275), .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (lines 20-30, 84-108, 154-204, 248-262), .planning/sketches/011-recipe-route-c/README.md (line 107, decision 26, and line 395, the split row's remove-link addendum; read only)</read_first>
  <behavior>
    - Test A, a split row in the pen: Whole milk is split 120 + 250.4 and estimated, Heavy cream is 429.28 on step 3, and the method has steps 1-3. penDraft row a has portions '120' and '250.4' and removed false; row b is onePortionDraftRow(3, '429.28'). Render mode 'developing' with currentStepNumbers = displayNumbers(draftVersion.method).
      - The first Whole milk name cell is exactly: `<td class="ingredient-table__col-name">Whole milk`, the estimated chip span, `<span class="ingredient-table__remove-gap"> </span><button type="button" class="text-control" tabindex="0">remove</button>`, `<span class="ingredient-table__portion-note">120 g of 370.4 g · 46.3% in all</span></td>`.
      - The second Whole milk cell is the name, the chip and its own portion-note span, with no gap span and no button.
      - The markup holds exactly two `remove` links and two gap spans.
      - RED before the change.
    - Test B, a split row removed (restore): the same fixture with draftVersion.rows[0].removed = true and penDraft row a removed true. The first cell runs, in order: `<span class="struck-value">Whole milk</span>`, the chip, the gap span, the `restore` text-control button, a `<span class="ingredient-table__portion-note">` and then `</td>`. Use a regex for the portion line's text. RED before.
    - Test C, an orphaned split row: the same rows. The method gives step 1 `uses: ['a']` and keeps the portions on steps 2 and 3. In draftVersion step 1 is removed. Inside the first Whole milk cell, the order of first appearance is: the name, the chip, `<p class="ingredient-table__flag">`, the gap span, `class="text-control" tabindex="0">remove</button>`, and the portion-note span. The cell ends with the portion line's `</span></td>`. RED before.
    - Test D, guard: a non-split row with an estimated chip, 'Row C' at 64 g on step 3. Its cell is exactly the name, the chip, the gap span, the remove button and `</td>`, with no portion-note span. This passes before and after; say so in the SUMMARY.
  </behavior>
  <action>
Order matters: steps 1 to 3 run before IngredientTable.jsx is edited.

Step 1, the suite baseline. Run `npm --prefix app test` and write down the file and test counts. At plan time this was 59 files and 1584 tests. If it is not green, stop and report.

Step 2, the probe. Write 261004-eoi-probe.mjs in the quick directory. It takes a comma list of groups: `baseline`, `tracer`, `matrix`, `board`.
- Imports: import `startServers`, `launch`, `openBoard`, `APP_ROUTE`, `check` and `finish` from the 03.5 harness by the relative path `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`, and copy the playwright-core import line (`webkit`) from 261002-sre-probe.mjs. Do not import or edit anything under .planning/canvas-generators or .planning/sketches.
- Contexts: one fresh context per cell, with Sid's options (`viewport { width, height: 1000 }`, `hasTouch: coarse`, `isMobile: false`, `deviceScaleFactor: 1`). Abort every request whose host is not 127.0.0.1. Go to `appUrl + route` with networkidle, then wait for `.ingredient-table`. Throw unless `matchMedia('(pointer: coarse)').matches` equals `coarse` and `innerWidth` equals the width, as wdn's openAppPage does.
- Opening the pen: click the first button named 'Next version', then wait for `.ingredient-table.is-developing` and for `td.ingredient-table__col-name > button.text-control`. Olive Oil v1 has no Salt row, so do not wait on 'Salt, grams'.
- Engines: WebKit with coarse true, and system Chrome through the harness's `launch()` with coarse false (a mouse).
- Widths: 393, 723, 744, 984, 1024, 1366 and 1600.
- Cases:
  - 'olive-v1 pen': APP_ROUTE, then open the pen.
  - 'mex4 pen': `/notebook/mexican-chocolate/mexican-chocolate-v4`, then open the pen.
  - 'olive-v1 restore', at 393 and 1600 only: open the pen, click the first 'remove' button inside the tbody rows that contain 'Whole milk', and wait for its 'restore'. This runs in a throwaway context and nothing is saved.

The in-page reader takes a table index: 0 for the app, 1 for the board's proposed panel. It awaits `document.fonts.ready` and one animation frame, then returns:
- `links`: sre's readPen records, with these changes:
  - `name` is the name cell's first child's textContent, trimmed.
  - `note` is the cell's `.ingredient-table__portion-note` rect relative to the name cell's top and left (top, bottom, left), or null.
  - `noteAfterButton` comes from `button.compareDocumentPosition(note)`.
  - `btnTop` and `btnBottom` are relative to the name cell's top.
  - Keep sre's `gap`, `off`, `btn`, `rowHeight` and `gapSpan`.
- `rows`: wdn's rowRecord for every tbody row that is not a step head, plus `textNoLink`: the normalized textContent of a clone with the gap span and the name cell's direct-child button removed.
- `table` (width and height), `overflow` (scrollWidth minus innerWidth), and `notes` (the number of portion-note spans in the table).

`baseline` reads every cell, asserts the precondition and writes 261004-eoi-baseline.json, but only if every check passed. The precondition:
- Every olive-v1 pen and restore cell has 4 portion notes and 12 links.
- The two links that have a note are Whole milk and Sucrose. Each has `gap === null`, `noteAfterButton === false` and `note.bottom <= btnTop + 0.5`, so the link sits under the portion line.
- Every mex4 pen cell has 0 portion notes and at least one link.
- If the precondition fails, stop and report: the cause is not what the plan assumes.

`tracer` compares the single cell (webkit, coarse, 1600, 'olive-v1 pen') against the baseline. `matrix` compares every cell. The comparison rules, all within 0.5 unless stated:
- olive-v1 pen and restore, the split links (those with a note):
  - gap is non-null and |gap − 14| ≤ 0.5 (decision 26)
  - gapSpan is true and noteAfterButton is true
  - note.top ≥ btnBottom − 0.5
  - note.left equals the baseline's
  - btn width and height equal the baseline's
  - rowHeight is between 15 and 25 below the baseline's
  - the two split rows are equal in height
- olive-v1 pen and restore, everything else:
  - the link count and the name+label sequence equal the baseline's
  - every other link's gap (null or number), off, btn and rowHeight equal the baseline's
  - row count and every row's textNoLink equal the baseline's, and every cell's x and width in every row equal the baseline's
  - every row other than the two split first-portion rows also matches the baseline's height and each cell's y and height, skipping y for display:none cells as sameRow does
  - table width equals the baseline's, and table height equals the baseline's minus the two split rows' height drops, within 1
  - overflow equals the baseline's
- mex4 pen: 0 portion notes, every link field equals the baseline's, every row passes wdn's sameRow against the baseline, table width and height equal the baseline's, and overflow equals the baseline's.

`board` runs only at 1600, in WebKit with coarse true and in Chrome with coarse false:
- Open .planning/sketches/011-recipe-route-c/1600-remove-link.html through `openBoard(browser, servers.repoUrl, '1600-remove-link.html', { coarse })` and read table index 1. Open the app's olive-v1 pen in the same engine and pointer and read table index 0.
- For Whole milk and Sucrose:
  - both gaps are non-null and within 0.5 of each other
  - both have noteAfterButton
  - both have note.top ≥ btnBottom − 0.5
- Compare row heights within 1 only where the app's and the board's button heights agree within 0.5 (WebKit coarse; plan-time board reading 71.72). Where they differ (Chrome with a mouse: the board's link is 44 tall, the app's 24), print both heights and both button heights. That is not a failure.

Output and rules for the probe:
- Print one JSON line per cell with what the SUMMARY needs: the split rows' heights before and after, their gaps, note.top minus btnBottom, overflow, and the table height before and after.
- End with `finish` so any failure gives a non-zero exit.
- The harness binds only ephemeral 127.0.0.1 ports. Never request :4173, :5173 or :8011, and start no Vite process.

Step 3, the baseline. Run `npm --prefix app run build` on the unchanged source, then `node .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs baseline`. It must exit 0 and write the JSON.

Step 4, RED. Add a describe block 'IngredientTable — a split row's remove link sits on the name's line, before its portion line (261004-eoi; sketch 011 decision 26, decision 33 addendum)' to app/src/ui/IngredientTable.test.jsx, with Tests A to D from `<behavior>`. Reuse the file's helpers. Slice each name cell from `<td class="ingredient-table__col-name">` to the next `</td>`; the orphan flag is a `<p>` inside the cell, so the slice holds it. Run `npm --prefix app test -- src/ui/IngredientTable.test.jsx` and confirm that A, B and C fail and D passes.

Then re-grep for any other test that pins the pen's old order: run `grep -rn "portion-note" app/src` and grep for the remove-gap span in app/src/styles/cross-cutting.test.js. If one exists, update it to the new order rather than deleting it, and name it in the SUMMARY. The planner found none.

Commit only the test file by explicit path: `test(261004-eoi): pin the split row's remove link before its portion line`.

Step 5, GREEN. In renderDevelopingEntry in app/src/ui/IngredientTable.jsx, move the `{isSplit && (<span className="ingredient-table__portion-note">…)}` block from before the orphan flag to just after the `{portionIndex === 0 && <RemoveRowControl … />}` line. The cell then reads: name, chip, orphan flag, RemoveRowControl, portion line (per decision 26 and the decision 33 addendum).
- Replace the JSX comment above RemoveRowControl with one that says the link sits on the name's line after the name, the estimated tag and the orphan flag when present, and before a split row's portion line, citing "sketch 011 decision 26; decision 33 addendum, Mark 2026-10-04".
- Change nothing else: not the reading or Show changes branches, not RemoveRowControl, OrphanedRowFlag, the labels, the handlers, tabIndex, any class name, or any CSS or token.
- Run the test file until it is green.
- Rebuild with `npm --prefix app run build` and run `node .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs tracer`.
- Commit IngredientTable.jsx, the probe and the baseline JSON by explicit path: `fix(261004-eoi): put the split row's remove link on the name's line in the pen (sketch 011 decision 26, decision 33 task 7)`.
- Never use `git add -A`. Never stage anything under .planning/sketches, .planning/canvas-generators or .impeccable; Sid works there, and the untracked critique files are his.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/IngredientTable.test.jsx && npm --prefix app run build && node .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs tracer && test -s .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-baseline.json && SUBJECTS="$(git log --format=%s --grep='261004-eoi')" && printf '%s\n' "$SUBJECTS" | grep -q '^test(261004-eoi)' && printf '%s\n' "$SUBJECTS" | grep -q '^fix(261004-eoi)'</automated>
  </verify>
  <done>
- The baseline JSON exists. It was captured from a build of the unchanged source, with the precondition asserted (both split links under their portion lines in every cell).
- The RED commit holds Tests A to D, with A, B and C failing before the change.
- The GREEN commit moves only the portion-line span in the pen's name cell and updates its comment.
- IngredientTable.test.jsx passes.
- The tracer cell (WebKit, coarse, 1600, Olive Oil v1 pen) shows both split links on the name's line about 14px from the tag or name, with the portion line under them and each split row 15-25px shorter (about 71.4 expected). Everything else matches the baseline.
  </done>
</task>

<task type="auto">
  <name>Task 2: Measure the full matrix and the board in WebKit and system Chrome, run the full suite and build, check the scope, and write the SUMMARY</name>
  <files>.planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-SUMMARY.md</files>
  <read_first>.planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs, .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-baseline.json, .planning/canvas-generators/remove-link-probe-webkit.json and remove-link-probe-chrome.json (Sid's before-readings; read only)</read_first>
  <action>
app/dist must be built from the final code; Task 1 left it so. Run `node .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs matrix,board`. That is 2 engines × 7 widths × 2 pen cases, plus the 4 restore cells and the 2 board cells. It must exit 0.

If a cell fails, find the cause before changing anything:
- If the cause is in IngredientTable.jsx, add a test first, fix it there, re-run, and commit by explicit path.
- If a split link wraps at some width, which is decision 26's wrapped case (flush, now above the portion line), record the width and numbers for Mark and stop for the orchestrator. Do not change CSS. The planner measured no wrap at any of the seven widths.
- If the cause is CSS, record it with the measured effect for Mark and do not edit app/src/styles. The decision is that only the order changes.

Run the full suite, `npm --prefix app test`. It must pass at 59 files, with 1584 tests plus Task 1's four and none removed. Then run `npm --prefix app run build`.

Run the scope check in `<verify>`. Under app/, this task's commits may touch only IngredientTable.jsx and IngredientTable.test.jsx, plus cross-cutting.test.js only if Task 1 found it pinning the old order. No commit may touch .planning/sketches or .planning/canvas-generators.

Write 261004-eoi-SUMMARY.md with:
- the order as built, plus the RED-then-GREEN evidence, naming Test D as a guard
- the result of the re-grep for order pins
- one table row per cell: engine, pointer, width, case, the Whole milk and Sucrose row heights before and after, their gaps, note.top minus btnBottom, table height before and after, and overflow
- a statement that every non-split row and Mexican Chocolate v4's pen are unchanged in every cell
- the board comparison at 1600 in both engines, including the Chrome-with-a-mouse note: the board draws a 44px link at every pointer, so the app's split rows there are about 51px, not the board's 71, and the gap and placement match
- Sid's recorded before-readings beside the probe's baseline
- the test count as 59 files and N tests, with the delta from 1584

State plainly that the readings come from Playwright WebKit and system Chrome, not from Mark's devices. Rebuilding app/dist already updates what Mark's :4173 preview serves, and `vite preview` needs no restart. Do not start, stop or request that preview, and leave :5173 and :8011 alone.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && node .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs matrix,board && test -f .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-SUMMARY.md && test -z "$(git status --porcelain app/)" && TOUCHED="$(git log --name-only --format= --grep='261004-eoi')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/ui/IngredientTable\.(jsx|test\.jsx)$|^app/src/styles/cross-cutting\.test\.js$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/(sketches|canvas-generators)/'</automated>
    <human-check>Deferred to Mark (end-of-run UAT). Device UAT is served from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`; his running preview already serves the rebuilt app/dist, so a hard reload is enough). On each device he opens Olive Oil v1 and taps Next version.
(1) iPhone (393): Whole milk's remove link sits on the name's line, after "estimated", with clear space before it, and the "120 g of 370.4 g …" line sits under both. Sucrose's link sits after its name in the same way. Every other row's remove link is where it was.
(2) iPad (1366 landscape, and portrait): the same two rows read the same way, and the table is otherwise unchanged.
(3) Tap remove on Whole milk: "restore" takes the same place, on the struck name's line, above the portion line. Cancel the pen without saving.
The change counts as device-verified only when Mark confirms.</human-check>
  </verify>
  <done>
- The probe's matrix and board groups exit 0 across both engines, all seven widths, both pen cases, the restore cells and the board cells.
- The full suite passes at 59 files with the new tests counted, and the build succeeds.
- Under app/, the commits touch only IngredientTable.jsx and its test, and nothing touches .planning/sketches or .planning/canvas-generators.
- The SUMMARY records every number, the board comparison and the Chrome-with-a-mouse height note.
- Mark's device check is listed as deferred.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored version to rendered pen | a version's rows, already in the local store, decide the order of nodes in one table cell. No new input is accepted and nothing renders as markup. |
| probe to local servers | the probe serves app/dist and the repo tree on ephemeral 127.0.0.1 ports and drives throwaway browser contexts |
| executor to shared working tree | Sid works in .planning/sketches and .planning/canvas-generators, and untracked .impeccable critique files sit in the tree |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-eoi-01 | Denial of Service | the probe against Mark's :4173 preview, the :5173 dev port and Sid's :8011 | low | mitigate | The harness binds only ephemeral 127.0.0.1 ports, aborts every non-127.0.0.1 request, and closes its servers and browsers. No Vite process is started, and :4173, :5173 and :8011 are never requested. The pen and its remove click run in throwaway contexts, and nothing is saved. |
| T-eoi-02 | Tampering | other agents' files in the shared tree | medium | mitigate | Commits are made by explicit path, never `git add -A`. Task 2's verify fails if any 261004-eoi commit touches .planning/sketches or .planning/canvas-generators, or any app/ file other than IngredientTable.jsx and its test (plus cross-cutting.test.js only if it pinned the order). Sid's probe and its JSON are read, never written. |
| T-eoi-03 | Repudiation | a remove or restore link that moves without notice | low | mitigate | The link keeps its label, handler, tabIndex={0} and gap span, and only its position in the cell changes. Tests A to C pin the new order for remove, restore and the orphan flag, and Test D pins non-split rows as unchanged. |
| T-eoi-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. The probe uses the playwright-core module and WebKit build already on disk, and system Chrome. If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- The baseline was captured from the unchanged source before any edit, with the precondition asserted: both split links sat under their portion lines.
- `npm --prefix app test` passes at 59 files, with 1584 tests plus the new ones and none removed. `npm --prefix app run build` succeeds.
- `node .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs tracer,matrix,board` exits 0 in WebKit (coarse) and system Chrome (mouse) at 393, 723, 744, 984, 1024, 1366 and 1600.
- Under app/, only IngredientTable.jsx and IngredientTable.test.jsx changed. No stylesheet, token, sketch or canvas-generator file changed.
</verification>

<success_criteria>
- In the Next version pen, a split row's remove (or restore) link sits on the name's line, 14px clear of the name or the estimated tag, with the portion line under both, at every width, the phone included.
- Each split row is about 20px shorter. At 1600 in WebKit with a coarse pointer it matches the 1600-remove-link proposed panel (about 71px).
- Every other row, and every recipe without a split row, is unchanged.
</success_criteria>

<output>
Create `.planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-SUMMARY.md` when done (Task 2 writes it).
</output>
