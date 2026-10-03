---
phase: quick-261002-wmy
plan: 01
quick_id: 261002-wmy
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/GoToBatch.jsx
  - app/src/ui/GoToBatch.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/domain/lastEvent.js
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs
  - .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-baseline.json
autonomous: true

must_haves:
  truths:
    - "Below 724 the recipe band shows one Go to batch row after the Version block and before History (sketch 011 decision 30, 393-phone-log.html and 723-phone-log.html). The row is built in History's row grammar: 'Go to batch' as the underlined control word on the left, a 12px status at the row's right end, and the whole row is one link at least 44px tall at every pointer."
    - "The status uses Home's own words, read from the one shared map. It says 'Tasted' when the newest batch of the version in view has a tasting, 'Awaiting tasting' when that batch has none, and 'Not yet churned' when the version has no batch. sortedBatches decides which batch is newest, not array order. Measured: Olive Oil v1 reads Tasted, Coconut v2 reads Awaiting tasting, Underbelly Light Base v2 reads Not yet churned."
    - "Tapping, clicking or pressing Enter on the row moves focus to the batch log's 'Batch' heading (h2 id 'batch'), which carries the landing ring and sits fully visible above the tab row. The URL and history length do not change. With no batch, the log's 'Not yet churned. Print the sheet, make it, then record what happened.' and its Record a batch are visible after the jump."
    - "From 724 up the band is unchanged. At 724 fine, 744 coarse and 1366 fine the row has computed display none, and the band height, History top and page height equal the pre-change baseline within 0.5px."
    - "Below 724 the change adds exactly the row and one gap. The band, History top and page height each grow by 64px (44 + 20) within 0.5px of the baseline at 320, 375, 393 and 428 coarse and at 723 fine and coarse, in WebKit and system Chrome. The page never scrolls sideways."
    - "The row matches the boards in the same engine within 0.5px: its x and width against the band, its 44px height, the 20px gaps above and below, the control word's and status's offsets, widths and vertical centres, and their font size, weight, colour and underline. That holds for panels p0, p1 and p2 of 393-phone-log.html (coarse) against the app at 393 coarse, and of 723-phone-log.html (fine) against the app at 723 fine."
    - "`npm --prefix app test` passes at 56 files: the baseline is 55 files and 1516 tests, plus the new ones, and none are removed. `npm --prefix app run build` succeeds."
  artifacts:
    - path: app/src/ui/GoToBatch.jsx
      provides: "the Go to batch link: href #batch, tabIndex 0, comma-joined aria-label, control word and status spans, preventDefault then onGo()"
      contains: "notebook-jump"
    - path: app/src/domain/lastEvent.js
      provides: "STANDING_WORDS, Home's three standing words, moved here from RecipeList.jsx so Home and the band read one map"
      contains: "STANDING_WORDS"
    - path: app/src/ui/RecipePage.jsx
      provides: "GoToBatch as the last child of .notebook-band__grid after VersionRow; handleGoToBatch bumps the existing focusBatchAttempt counter"
      contains: "handleGoToBatch"
    - path: app/src/ui/BatchRow.jsx
      provides: "id 'batch' on the log's Batch heading, the link's target"
      contains: "id=\"batch\""
    - path: app/src/styles/notebook.css
      provides: "a base .notebook-jump display none rule, the row's box inside the existing (max-width: 723.98px) block, and the spans added to the fold-row control and count selector lists"
      contains: "notebook-jump"
    - path: .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs
      provides: "the baseline, tracer and matrix groups that measure the built app and the two boards in WebKit and system Chrome"
    - path: .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-baseline.json
      provides: "pre-change band geometry for every probe cell, captured from a build of the unchanged source"
  key_links:
    - from: app/src/ui/GoToBatch.jsx
      to: app/src/domain/lastEvent.js
      via: "STANDING_WORDS[standingFor(batches)]. The same map RecipeList.jsx renders on Home."
      pattern: "STANDING_WORDS\\[standingFor\\(batches\\)\\]"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/BatchRow.jsx
      via: "handleGoToBatch increments focusBatchAttemptRef and calls setFocusBatchAttempt. BatchRow's existing effect (lines 499-506) focuses the Batch heading and sets is-landing-focus."
      pattern: "setFocusBatchAttempt\\(focusBatchAttemptRef\\.current\\)"
    - from: app/src/ui/GoToBatch.jsx
      to: "BatchRow's h2"
      via: "href '#batch' names the heading's id 'batch'"
      pattern: "href=\"#batch\""
---

<objective>
Add a "Go to batch" row to the recipe band below 724, after the Version block and before History. It is built like History's row, and its status reads Tasted, Awaiting tasting or Not yet churned in Home's own words. Activating it moves focus to the batch log's heading. From 724 up nothing changes.

Purpose: at phone width the batch log starts about 3.4 screens below the band (sketch 011 decision 30, the 393 critique's P0). Mark chose option C on 2026-10-02 (the phone transcribes) and approved the phone-logging boards, which put this one-tap jump in the band. This is item 1 of batch 261002-wmx. Item 2 (261002-wmz, the filled action rule) edits the same band and runs after this one.

Output:
- a GoToBatch component, written test-first
- Home's standing words moved into lastEvent.js so the band and Home share them
- the row wired into RecipePage's band grid, with the log heading as its target
- CSS that shows the row only below 724
- a probe that measures the built app against both boards in WebKit and system Chrome, before and after the change
- a SUMMARY, with Mark's device check deferred to him
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/sketches/011-recipe-route-c/README.md
@app/src/ui/FoldRow.jsx
@app/src/ui/RecipeHistory.jsx
@app/src/domain/lastEvent.js
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs

The authority is the boards' markup and CSS, not prose. The sketch-findings-sprinkles skill applies to this UI work. Plain words; every visual value goes through a token; tabIndex={0} on every link and button; no raw-HTML injection; commit by explicit path only, never git add -A.

<interfaces>
These facts were read at HEAD 4faea98 (quick 261002-wdn has landed). Re-check them before relying on them.

The board (393-phone-log.html; 723-phone-log.html is the same markup at 723)
- Four panels, each with its own `.shell`. Panel i's row is `a[href="#batch-p{i}"]` with tabindex 0. At 393 the rows are on lines 302 (p0), 346 (p1), 388 (p2) and 418 (p3).
- The row's inline style is display flex; width 100%; min-height 44px; align-items center; justify-content space-between; gap 14px; text-decoration none; color inherit.
- The row holds two spans:
  - the control word "Go to batch": font var(--face-grotesk), size var(--sheet-type-control), weight 400, letter-spacing normal, text-transform none, colour var(--sheet-ink), underline, underline offset 3px
  - the status: the system stack (the same stack as --face-grotesk), 12px, weight 400, colour #595959
- Panel statuses: p0 Tasted (Olive Oil v1), p1 Awaiting tasting, p2 Not yet churned (no batch), p3 Not yet churned (the band alone, a version with a parent).
- The row is the last child of the band's `div` (display flex, column, gap 20px), right after the version block `div` (gap 12px). The History block is that column's next sibling.
- The board's version block also draws decision 19's Draft line and item 2's filled action, which the app does not have yet. So compare geometry relative to the row's neighbours, never absolute y.

The app (current)
- The band is RecipePage.jsx lines 1889-1933: `header.notebook-band` > `div.notebook-band__grid` holding `<RecipeBand>` and `<VersionRow>`, closed at line 1918, then `<RecipeHistory>` as the header's next child. VersionRow renders `section.notebook-version` while reading (or the Next version form while developing). RecipeHistory renders `section.notebook-history`.
- The `batches` state holds the version in view's batches (loaded at lines 747-755) and is what BatchRow receives (line 2054).
- Focus landing already exists:
  - RecipePage line 706 holds `const [focusBatchAttempt, setFocusBatchAttempt] = useState(null)` and line 707 holds `focusBatchAttemptRef`.
  - An amendment save bumps it with the two lines at 1463-1464. Pens set it to null on open and cancel (lines 1106, 1299 and 1512).
  - BatchRow.jsx lines 499-506 focus `batchHeadingRef` and set `landingFocusVisible` whenever `focusBatchAttempt` changes to non-null. Lines 621-633 give the Batch h2 tabIndex -1 while an attempt is set, and an aria-label of "Batch churned <date>" when a batch is in view.
- The h2 renders in every state, the no-batch state included. That state (BatchRow lines 1126-1138) renders NO_BATCH_PROSE and, with no pen open, a `.notebook-action` "Record a batch".
- Home's words: RecipeList.jsx lines 152-164 hold a module-private `STANDING_WORDS` map keyed by NOT_YET_CHURNED, AWAITING_TASTING and TASTED ('Not yet churned', 'Awaiting tasting', 'Tasted'). It is used once, at line 236. Line 5 imports the three constants from '../domain/lastEvent.js'.
- lastEvent.js lines 51-65 hold the three constants and `standingFor(batches)`. standingFor returns NOT_YET_CHURNED for [], and otherwise reads the newest batch by sortedBatches and returns TASTED if it has a tasting, AWAITING_TASTING if not. RecipeList.jsx cannot be imported by a band component because it reads the repository at module load.
- The fold-row typography lives at notebook.css lines 188-206: `.notebook .fold-row__control` (13px control word, sheet ink, underline, offset token) and `.notebook .fold-row__count` (12px, app-text-secondary). The phone forms are the `(max-width: 723.98px)` block at lines 961-1000. Below 724, `.notebook-band__grid` is a flex column with gap var(--gap-m), and `.notebook-band`'s gap is var(--gap-m) (the 1365.98px block).
- FoldRow.jsx sets the comma-joined aria-label rule (G-03.5-7): visible pieces are joined with ", " so VoiceOver pauses.

Tokens (tokens.css)
- --touch-min 44px; --app-notebook-recipe-rail-gap 14px; --sheet-type-control 13px; --app-size-label 12px; --app-text-secondary #595959; --app-notebook-link-underline-offset 3px; --gap-m 20px; --sheet-ink #141414; --face-grotesk is the system stack.

Test contracts that constrain the CSS
- notebook.test.js line 30: every rule's selector must start with '.notebook'.
- notebook.test.js line 40: exactly four @media conditions, in order: '(min-width: 1366px)', '(max-width: 1365.98px)', '(max-width: 723.98px)', '(pointer: coarse)'. So no new @media block is allowed, including no `@media print`.
- No hex and no bare px in a declaration.
- tabindex-scan.test.js: every `<a` needs a literal tabIndex={0}.
- BatchRow.test.jsx lines 95, 100, 188 and 264 match the substring `class="region-name">Batch<`. An id placed as the h2's first attribute keeps them matching.

Seed routes
- Olive Oil v1, `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1`: one batch (2 Aug), tasted.
- Coconut v2, `/notebook/coconut/coconut-v2`: parent v1; one batch, coconut-v2-batch-01, tasting null, so awaiting tasting.
- Underbelly Light Base v2, `/notebook/underbelly-light-base/underbelly-light-base-v2`: parent v1, no batches.

Probe building blocks
- The 03.5 harness exports `startServers` (app/dist and the repo root on ephemeral 127.0.0.1 ports, with SPA fallback), `launch` (system Chrome by executablePath, headless), `openBoard(browser, repoUrl, file)` (opens at the board's $preview width; coarse exactly when the name holds 393), `check(failures, cond, label)` and `finish(failures, count, name)`.
- 261002-wdn-probe.mjs has the playwright-core import line (`webkit`, `devices` from /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs, verified present), its `openAppPage` (a coarse context from devices['iPhone 14'] with viewport and screen pinned, and every non-127.0.0.1 request aborted), and the engine pair `[['webkit', () => webkit.launch()], ['chrome', () => launch()]]`.
- Test baseline at plan time: 55 files, 1516 tests (`npm --prefix app test`).
- Mark's preview is on :4173 and Sid's sketch server on :8011. The probe never requests either and starts no Vite process.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Capture the baseline, then build the Go to batch row test-first (RED, then GREEN), proven end to end on Coconut v2 at 393 in WebKit</name>
  <files>.planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs, .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-baseline.json, app/src/ui/GoToBatch.test.jsx, app/src/ui/BatchRow.test.jsx, app/src/ui/RecipePage.test.jsx, app/src/styles/notebook.test.js, app/src/ui/GoToBatch.jsx, app/src/domain/lastEvent.js, app/src/ui/RecipeList.jsx, app/src/ui/RecipePage.jsx, app/src/ui/BatchRow.jsx, app/src/styles/notebook.css</files>
  <precondition>app/src is clean in git (`git status --porcelain app/src` is empty) and `npm --prefix app run build` succeeds on the unchanged source before any edit, so the baseline is the pre-change app.</precondition>
  <read_first>app/src/ui/RecipePage.jsx (lines 25-40, 700-710, 737-755, 1455-1470, 1885-1935), app/src/ui/BatchRow.jsx (lines 495-506, 615-640, 1123-1140), app/src/ui/RecipeList.jsx (lines 1-6, 148-166, 230-240), app/src/domain/lastEvent.js (lines 44-65), app/src/styles/notebook.css (lines 154-206, 957-1000), app/src/styles/notebook.test.js (lines 1-47, 365-390), app/src/styles/css-source.js (readAllRules, to see how a selector list appears in rule.selector), app/src/ui/BatchRow.test.jsx (lines 1-30, 60-105), app/src/ui/RecipePage.test.jsx (lines 1-30, 860-890), app/src/domain/lastEvent.test.js (lines 1-27, 81-104, for the makeBatch shape), app/src/ui/tabindex-scan.test.js (lines 1-60), .planning/sketches/011-recipe-route-c/393-phone-log.html (lines 294-303 and 346; read the markup itself), .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs (lines 1-30, 85-150, 240-275)</read_first>
  <behavior>
    - GoToBatch, no batches: the markup is exactly one `<a` and no `<button`. It has class "notebook-jump", href "#batch", tabindex "0" and aria-label "Go to batch, Not yet churned". It holds `<span class="notebook-jump__control">Go to batch</span>` followed by `<span class="notebook-jump__status">Not yet churned</span>`, in that order.
    - GoToBatch, one batch with tasting null: the status and the aria-label say "Awaiting tasting".
    - GoToBatch, one batch with a tasting object: "Tasted".
    - GoToBatch, newest decided by sortedBatches, not array order: [newer untasted, older tasted] gives "Awaiting tasting", and [older untasted, newer tasted] gives "Tasted". Build the batches with the makeBatch shape from lastEvent.test.js, churn dates a month apart, and put the newer batch second in the array in one of the two cases.
    - The words are Home's: STANDING_WORDS imported from '../domain/lastEvent.js' deep-equals { [NOT_YET_CHURNED]: 'Not yet churned', [AWAITING_TASTING]: 'Awaiting tasting', [TASTED]: 'Tasted' }. RecipeList.test.jsx keeps passing unchanged, which proves Home renders the same map.
    - BatchRow: rendered reading with augustSecondBatch in view, and again with batches [] and openBatch null, the markup matches `/<h2 id="batch" class="region-name"[^>]*>Batch<\/h2>/`, and `id="batch"` occurs exactly once. The existing `class="region-name">Batch<` tests stay green.
    - RecipePage.jsx source text, in the file's existing readFileSync idiom: there is exactly one `<GoToBatch`. It comes after `<VersionRow` and before the `</div>` that closes `.notebook-band__grid`, and so before `<RecipeHistory`. It passes `batches={batches}` and `onGo={handleGoToBatch}`. The source holds `function handleGoToBatch(`.
    - notebook.css, via readAllRules:
      - A top-level rule (media undefined) whose selector is `.notebook-jump` declares `display: none`.
      - A `.notebook-jump` rule under '(max-width: 723.98px)' declares display flex, width 100%, min-height var(--touch-min), align-items center, justify-content space-between, gap var(--app-notebook-recipe-rail-gap), text-decoration none and color inherit.
      - No `.notebook-jump` rule exists under '(min-width: 1366px)' or '(max-width: 1365.98px)'.
      - The rule whose selector includes `.notebook .fold-row__control` also includes `.notebook .notebook-jump__control`.
      - The rule whose selector includes `.notebook .fold-row__count` also includes `.notebook .notebook-jump__status`.
    - RED: every new assertion above fails before the source edits; GoToBatch.test.jsx fails on the missing module. GREEN: all pass, and so does every pre-existing test in the five touched suites.
  </behavior>
  <action>
Run steps 1 and 2 before any file under app/src is edited.

Step 1, the probe and baseline.
Write 261002-wmy-probe.mjs in the quick directory, with groups `baseline`, `tracer` and `matrix` chosen by a comma-list argument. Import `startServers`, `launch`, `openBoard`, `check` and `finish` from the 03.5 harness by relative path (../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs). Copy the playwright-core import line and `openAppPage` from 261002-wdn-probe.mjs. Give openAppPage a height parameter, and make it wait for `.notebook-band` and `h2.notebook-version__identity` instead of `.ingredient-table`. Fine contexts get only the viewport; coarse contexts get devices['iPhone 14'] with viewport and screen pinned. Abort every non-127.0.0.1 request. Never request :4173, :5173 or :8011.

The cells are (engine × width-and-pointer × recipe):
- engines: WebKit and system Chrome
- recipes: OLIVE (tasted), COCONUT_V2 (awaiting tasting), UNDERBELLY_V2 (no batch), at the routes in `<interfaces>`
- phone widths: 320×568, 375×667, 393×852 and 428×926 coarse; 723×1024 coarse and fine
- guard widths: 724×1024 fine, 744×1024 coarse (iPad mini portrait) and 1366×1024 fine

The `baseline` group runs every cell and writes 261002-wmy-baseline.json, keyed engine/width/pointer/recipe. For each cell it records:
- `.notebook-band`'s height
- `section.notebook-history`'s document top (rect top + scrollY)
- documentElement.scrollHeight
- page overflow (scrollWidth − innerWidth)
- the count of `.notebook-band__grid` children whose computed display is not none

It asserts the precondition that no `a.notebook-jump` exists yet.

Build the unchanged source with `npm --prefix app run build`, run `node <probe> baseline`, and commit the probe and the JSON by path: chore(261002-wmy): add the Go to batch probe and its pre-change baseline.

Step 2, RED.
Write the tests in `<behavior>`:
- a new app/src/ui/GoToBatch.test.jsx: node environment, renderToStaticMarkup, no MemoryRouter needed because the component is a plain anchor
- one new describe in BatchRow.test.jsx, reusing its render helper
- one source-text describe in RecipePage.test.jsx
- one describe in notebook.test.js

Run them, confirm the new assertions fail for the stated reasons, and commit by path: test(261002-wmy): pin the Go to batch row, its words, its target and its below-724 CSS.

Step 3, GREEN. Make these edits, all per decision 30.

lastEvent.js:
- Add `export const STANDING_WORDS`, moved verbatim from RecipeList.jsx with its comment, below the three constants.

RecipeList.jsx:
- Delete the local map and its comment.
- Add STANDING_WORDS to the existing lastEvent.js import on line 5.
- Change nothing else.

New GoToBatch.jsx exports `GoToBatch({ batches, onGo })`:
- The words are `STANDING_WORDS[standingFor(batches)]`.
- It renders one `<a className="notebook-jump" href="#batch" tabIndex={0}>` with aria-label `Go to batch, ${words}` (FoldRow's comma rule, G-03.5-7), holding the `notebook-jump__control` span ("Go to batch") and then the `notebook-jump__status` span (the words).
- Its onClick calls event.preventDefault() and then onGo(). The browser's fragment navigation is not used because it neither reliably moves focus to a tabindex -1 heading in WebKit or Chrome nor leaves react-router's history alone. The page's existing landing does the focusing.
- A header comment cites decision 30 and the two boards. It explains that the status reads the log's own batches, so the band and the log cannot disagree, and that the CSS (not a media hook) hides the row from 724 up.

RecipePage.jsx:
- Import GoToBatch.
- Add `function handleGoToBatch()` beside handleStartRecording. It runs the same two lines the amendment save uses: increment focusBatchAttemptRef.current, then call setFocusBatchAttempt with it.
- Render `<GoToBatch batches={batches} onGo={handleGoToBatch} />` as the last child of `.notebook-band__grid`, directly after `<VersionRow ... />`. That matches the board, where the row closes the band's column, and gives the 20px gap above and the band's 20px gap to History below.
- Render the row in every mode. It is an in-page jump that leaves no page and loses no draft, so it is not one of D-UAT-2's suppressed navigation links, and hiding it when a pen opens would shift the log 64px under the maker. Record this as a judgement call for Mark.

BatchRow.jsx:
- Add `id="batch"` as the Batch h2's first prop. Nothing else in the file changes.

notebook.css:
- (a) After the fold-row rules, add a top-level `.notebook-jump { display: none; }`. Its comment says "below 724 only (sketch 011 decision 30); from 724 up the band is as built".
- (b) Extend the `.notebook .fold-row__control` selector with `.notebook .notebook-jump__control`, and the `.notebook .fold-row__count` selector with `.notebook .notebook-jump__status`, so one rule serves both rows.
- (c) Inside the existing (max-width: 723.98px) block, add a `.notebook-jump` rule with the board's row box. Every value is a token: display flex; width 100%; min-height var(--touch-min); align-items center; justify-content space-between; gap var(--app-notebook-recipe-rail-gap); text-decoration none; color inherit.
- Add no new @media block, no print rule (Phase 4 owns print; the band has none today), no new token and no literal.

Run the five touched suites green, then run the full suite.

Step 4, the tracer cell.
Add the `tracer` group: WebKit, 393×852 coarse, COCONUT_V2.
- On the app, the row is displayed. Its previous element sibling is `section.notebook-version` and its parent is `.notebook-band__grid`. Its status text is "Awaiting tasting" and its aria-label is "Go to batch, Awaiting tasting". Its height is 44, and its left and width equal the grid's.
- The gap above (row top − version section bottom) and the gap below (History top − row bottom) are each 20 within 0.5px.
- Band height, History top and scrollHeight are each the baseline plus 64 within 0.5px, and overflow equals the baseline.
- `locator.tap()` on the row, then waitForFunction until document.activeElement.id is 'batch'. Then:
  - the heading's text is 'Batch' and it has the class is-landing-focus
  - its rect top ≥ 0 and its bottom ≤ the top of `.shell__tabs`
  - location.href and history.length are unchanged
- Open 393-phone-log.html with openBoard in WebKit and read panel p1's row, `a[href="#batch-p1"]`, with x measured from its `.shell`, its previous sibling and its parent's next sibling. It matches the app's row within 0.5px on: x from the shell, width, height, gap above, gap below, the control span's left offset, width and vertical centre offset, and the status span's right offset, width and vertical centre offset. Computed font-size, font-weight, color, text-decoration-line and text-underline-offset of both spans are equal, and so is the status text.

Run `npm --prefix app run build`, then `node <probe> tracer`, and commit by path: feat(261002-wmy): add the Go to batch row to the band below 724. The commit holds the six source files and the probe if it changed.

If the board comparison fails on a span's height or centre because the inherited line-height differs, the one allowed fix is a line-height declaration on the `.notebook-jump` rule that reads an existing token. Record it as a deviation. Any other board mismatch is a stop: report it with the numbers, and do not patch neighbouring rules.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/GoToBatch.test.jsx src/ui/BatchRow.test.jsx src/ui/RecipePage.test.jsx src/ui/RecipeList.test.jsx src/styles/notebook.test.js src/ui/tabindex-scan.test.js && npm --prefix app run build && node .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs tracer && test -s .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-baseline.json && grep -q 'STANDING_WORDS\[standingFor(batches)\]' app/src/ui/GoToBatch.jsx && grep -q 'id="batch"' app/src/ui/BatchRow.jsx</automated>
  </verify>
  <done>
- The baseline JSON exists and was captured from the unchanged build.
- The RED commit precedes the GREEN commit, and the new tests failed in RED for the stated reasons.
- The five touched suites and the tabindex scan pass.
- On Coconut v2 at 393 coarse in WebKit, the row reads "Go to batch … Awaiting tasting" and adds exactly 64px. A tap lands focus on the visible Batch heading without touching the URL, and panel p1 of 393-phone-log.html matches within 0.5px.
  </done>
</task>

<task type="auto">
  <name>Task 2: Measure the full matrix in WebKit and system Chrome against both boards, the baseline and the jump</name>
  <files>.planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs, app/src/styles/notebook.css</files>
  <read_first>.planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs (the whole file as Task 1 left it), .planning/sketches/011-recipe-route-c/723-phone-log.html (the four `a[href="#batch-p…"]` rows and their parents), app/src/ui/BatchRow.jsx (lines 1126-1138, the no-batch state)</read_first>
  <action>
Add the `matrix` group to the probe, reusing Task 1's readers. Count every check, and finish with the harness's `finish`.

1. Phone cells. In both engines, for every phone width/pointer and every recipe (36 cells):
- The row is displayed, sits inside `.notebook-band__grid` right after `section.notebook-version`, and its status equals Tasted, Awaiting tasting or Not yet churned for OLIVE, COCONUT_V2 or UNDERBELLY_V2, with the matching comma-joined aria-label.
- Its height is 44 within 0.5px at both pointers, and its left and width equal the grid's.
- Both gaps are 20 within 0.5px.
- It stays on one line: each span's height is under 1.5 times its computed line-height, and each span's vertical centre is within 1px of the row's.
- The status's right edge equals the row's right edge within 0.5px.
- Five hit points (the four corners inset 2px, and the centre) each resolve through document.elementFromPoint to the row via closest('a.notebook-jump').
- Band height, History top and scrollHeight are each baseline + 64 within 0.5px, and overflow equals the baseline (0).
- Activate the row with tap() on coarse cells and click() on fine ones, then wait for activeElement.id to be 'batch'. Assert:
  - the Batch h2 has is-landing-focus
  - it is fully visible between 0 and the top of `.shell__tabs` (or innerHeight if the tabs are not displayed)
  - location.href and history.length are unchanged
- For UNDERBELLY_V2, the `.notebook-log` paragraph whose text is "Not yet churned. Print the sheet, make it, then record what happened." and the `.notebook-log` button named "Record a batch" are also fully visible after the jump.

2. Keyboard. In both engines at 393×852 coarse and 723×1024 fine, for each recipe, on a fresh page:
- focus the last button inside `.notebook-version__acts` and press Tab: activeElement is the row
- press Tab again: activeElement is inside `section.notebook-history`, or is the next focusable element after it when History is one plain line
- on a reloaded page, focus the row and press Enter: activeElement.id is 'batch'

3. Boards. In each engine:
- open 393-phone-log.html (coarse) and compare panels p0, p1 and p2 with OLIVE, COCONUT_V2 and UNDERBELLY_V2 at 393×852 coarse
- open 723-phone-log.html (fine) and compare the same panels with the app at 723×1024 fine
- use the Task 1 comparison set, within 0.5px, with style strings and status text exactly equal

The board's p3 has no app counterpart and is read only for its status text, "Not yet churned".

4. Guards. In both engines at 724 fine, 744 coarse and 1366 fine, for each recipe:
- `a.notebook-jump` exists, has computed display none and a 0×0 rect, and is not reachable by Tab (Tab from the last button in `.notebook-version__acts` does not land on it)
- band height, History top, scrollHeight, overflow and the count of displayed grid children all equal the baseline (within 0.5px where a length)

Build with `npm --prefix app run build`, then run `node <probe> tracer,matrix` until it exits 0.

If a phone or board check fails:
- If the cause is in the row's own `.notebook-jump` rule (the same line-height case as Task 1), fix only that rule with an existing token, re-run the notebook suite and the probe, and record the fix as a deviation.
- If a guard check fails, or any failure has its cause outside that rule, stop and report the cell, the numbers and both engines' readings. Do not edit any other rule or component.

Commit by path: chore(261002-wmy): measure the Go to batch row against the boards in WebKit and Chrome. If notebook.css changed, it goes in a separate fix(261002-wmy) commit.
  </action>
  <verify>
    <automated>npm --prefix app run build && node .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs tracer,matrix</automated>
  </verify>
  <done>The probe exits 0 with every check counted. That covers 36 phone cells and 18 guard cells in two engines, the keyboard order, and three panels on each of the two boards in each engine. Any notebook.css fix is limited to the `.notebook-jump` rule and recorded.</done>
</task>

<task type="auto">
  <name>Task 3: Run the full suite and the build, audit scope, and write the SUMMARY</name>
  <files>.planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-SUMMARY.md</files>
  <read_first>.planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-SUMMARY.md (the shape of a quick SUMMARY in this repo)</read_first>
  <action>
Run `npm --prefix app test` and record the file and test counts against the 55-file, 1516-test baseline. Expect 56 files: the new GoToBatch.test.jsx, with no test removed. Then run `npm --prefix app run build`.

Audit scope with `git log --name-only --grep='261002-wmy'`. Under app/ only these may appear:
- GoToBatch.jsx and GoToBatch.test.jsx
- RecipePage.jsx and RecipePage.test.jsx
- BatchRow.jsx and BatchRow.test.jsx
- RecipeList.jsx
- domain/lastEvent.js
- styles/notebook.css and styles/notebook.test.js

Nothing may appear under .planning/sketches/, .planning/canvas-generators/ or .impeccable/, and neither DESIGN.md, app/src/styles/tokens.css, app/src/ui/IngredientTable.jsx nor app/src/ui/VersionRow.jsx may appear (items 2 and 4 own the last two).

Write 261002-wmy-SUMMARY.md with:
- what changed
- the test counts
- the probe's check counts by group, with the measured row, gaps and +64 deltas in both engines
- the board comparison results
- these judgement calls for Mark:
  - (1) the status reads the version in view's batches (the log's own), not Home's recipe-wide standing, so the jump and its target always agree
  - (2) the jump calls preventDefault and lands through the existing focus landing with its ring, rather than browser fragment navigation; the URL gets no #batch and history gains no entry
  - (3) the row shows in every mode, including with a pen open
  - (4) no print rule was added
  - (5) the status shows "Not yet churned" until the batches load, as the log's own no-batch prose already does
- any deviation
- the deferred device check below

Commit the SUMMARY by path: docs(261002-wmy): summarize the Go to batch row.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && test -z "$(git status --porcelain app/src)" && TOUCHED="$(git log --name-only --format= --grep='261002-wmy')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/(ui/(GoToBatch|GoToBatch\.test|RecipePage|RecipePage\.test|BatchRow|BatchRow\.test|RecipeList)\.jsx|domain/lastEvent\.js|styles/notebook\.css|styles/notebook\.test\.js)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^(\.planning/sketches/|\.planning/canvas-generators/|\.impeccable/|DESIGN\.md$|app/src/styles/tokens\.css$|app/src/ui/IngredientTable\.jsx$|app/src/ui/VersionRow\.jsx$)' && test -f .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-SUMMARY.md</automated>
    <human-check>Deferred to Mark (end-of-batch UAT). Run `npm --prefix app run build && npm --prefix app run preview -- --host` (or use the running :4173 preview, which serves the rebuilt app/dist), and hard-reload on each device.
- On the iPhone, in portrait:
  - Olive Oil v1's band shows "Go to batch" underlined with "Tasted" at the row's right end, between the Version block and History.
  - Tapping anywhere on that row lands on the log's Batch heading with its ring.
  - Coconut v2 reads "Awaiting tasting".
  - Underbelly Light Base v2 reads "Not yet churned". After the jump, the "Not yet churned. Print the sheet…" line and the log's Record a batch are on screen.
  - With VoiceOver on, the row reads "Go to batch, Tasted, link".
- On the iPad, in either orientation: no Go to batch row, and the band looks as before.</human-check>
  </verify>
  <done>The full suite passes at 56 files and the build succeeds. Every commit stays inside the declared paths. The SUMMARY records the measurements, the five judgement calls and the deferred device check.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored batches to the rendered status | the version's stored batches, already in the local store, decide one of three fixed words. No new input is accepted and nothing is written. |
| band link to the page | a constant in-page fragment (#batch). No stored or maker text reaches the href, and the handler only moves focus. |
| probe to local servers | the probe serves app/dist and the repo on ephemeral 127.0.0.1 ports and drives throwaway browser contexts |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-wmy-01 | Tampering | GoToBatch status words | low | mitigate | The words come only from the STANDING_WORDS map keyed by standingFor's three constants. No stored string is rendered into the row, so an imported batch cannot inject text or markup. React renders text only, and the href is a literal. |
| T-wmy-02 | Repudiation | the status disagreeing with the log it jumps to | low | mitigate | The status reads the same `batches` state BatchRow receives, through the domain's standingFor (newest by sortedBatches). GoToBatch.test.jsx pins the ordering case, and the matrix checks all three seeded standings in both engines. |
| T-wmy-03 | Denial of Service | the probe's servers, Mark's :4173 preview and Sid's :8011 | low | mitigate | The harness binds only ephemeral 127.0.0.1 ports, aborts every non-127.0.0.1 request, and closes its servers and browsers. It starts no Vite process and never requests :4173, :5173 or :8011. Nothing is saved; the jump only moves focus. |
| T-wmy-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. The probe uses the playwright-core module and the WebKit build already on disk. If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- The baseline was captured from the unchanged build before any app/src edit, and the precondition held: no row existed.
- `npm --prefix app test` passes at 56 files: the baseline's 1516 tests plus the new ones, none removed. `npm --prefix app run build` succeeds.
- `node .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs tracer,matrix` exits 0. It covers WebKit and system Chrome at 320, 375, 393 and 428 coarse, 723 fine and coarse, and the 724, 744 and 1366 guards.
- Commits touch only the declared paths, each staged by explicit path.
</verification>

<success_criteria>
- Below 724 the maker sees how the version's latest batch stands and reaches the batch log in one tap, landing on its heading, with or without a batch.
- From 724 up the band is exactly as built.
- The row matches 393-phone-log.html and 723-phone-log.html in both engines.
</success_criteria>

<output>
Create `.planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-SUMMARY.md` when done (Task 3 writes it).
</output>
