---
phase: quick-261025-uge
plan: 01
quick_id: 261025-uge
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/tokens.css
  - app/src/styles/shell.css
  - app/src/styles/shell.test.js
  - .planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs
autonomous: true
requirements:
  - decide-ultrawide-frame
  - decide-ultrawide-lists

estimate:
  tokens: 90000
  raw_tokens: 90000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "At 393, 1366, 1600 and 1770 (WebKit and Google Chrome, fine pointer, 1000 tall, deviceScaleFactor 1), every box the probe measures on Home, the Notebook, Ingredients, Olive Oil v1, the creation editor and the print route, plus the Import error panel on Home, equals the base build to 0.1 px. Below 1770 nothing changes."
    - "At 2560 in both engines (sketch 011 decision 59's numbers): the block (.shell__body) runs 395 to 2165, the rail 395 to 619, the first nav link 415 to 598, the main area 619 to 2165, the wordmark 443 to 557, the tools 1749.5 to 2117, Home's lead block and first row 667 to 2117 (1450), Home's first tally at 1647.3; on Olive Oil v1 the band runs 651 to 2133, the Sheet 651 to 1751 and the log 1783 to 2133; the header bar runs 0 to 2560."
    - "At 1920, 2560 and 3440, every shell box (block, rail, first nav link, main, wordmark, tools) and every list-page box on Home, the Notebook and Ingredients is the base build's 1770 box moved right by (W - 1770) / 2 (75, 395, 835), and every .notebook, band, Sheet, log, print head and print page box on the recipe, creation and print routes equals the base build at the same width. At 1920: rail 75 to 299, wordmark at 123, tools ending at 1797, Home rows 347 to 1797. At 3440: rail 835 to 1059, wordmark at 883, tools ending at 2557, Home rows 1107 to 2557."
    - "The Import error panel's right edge equals the tools' right edge at every width from 1366 up, in both engines, so it stays under Import (sketch 011 decision 52 B) once the tools move to the block's edge."
    - "No horizontal overflow (scrollWidth - clientWidth <= 0) at any measured width on any measured route, in either engine; an overflow the base build already has at the same key is reported as a finding, not introduced here."
    - "tokens.css gains exactly one declaration, --app-frame-max: calc(var(--app-size-nav-w) + var(--app-notebook-content-max) + 2 * var(--app-notebook-gutter)), with a comment naming sketch 011 decision 59 and decide-ultrawide-frame; shell.css reads it in .shell__body, .shell__head and .shell__import-errors and in no @media block; shell.css keeps its five media conditions; notebook.css, app.css, home.css, print.css, app/src/ui, router.jsx, main.jsx and DESIGN.md are unchanged."
    - "npm --prefix app test passes at the base count plus the 5 new shell.test.js tests (3766 + 5 = 3771 at fba9974c); the strict walk prints MATCH 94 snapshots; app/dist and the 4173 preview are untouched."
  artifacts:
    - path: app/src/styles/tokens.css
      provides: "--app-frame-max, on the line after --app-size-nav-w, with a trailing comment naming sketch 011 decision 59 and decide-ultrawide-frame (centred, Mark 2026-10-26) and the sum 224 + 1482 + 2 x 32 = 1770"
      contains: "--app-frame-max: calc(var(--app-size-nav-w) + var(--app-notebook-content-max) + 2 * var(--app-notebook-gutter));"
    - path: app/src/styles/shell.css
      provides: ".shell__body capped at the frame and centred; .shell__head's padding-inline setting the wordmark and tools over the block's edges; .shell__import-errors' inset-inline-end on the same expression; the header comment's 1590 bullet extended for 1770"
      contains: "max-width: var(--app-frame-max);"
    - path: app/src/styles/shell.test.js
      provides: "One new describe block (5 tests) pinning the token text and its 1770 sum, .shell__body's exact declarations, the head's padding-inline after its shorthand, the panel and the head sharing one expression, and no media rule reading the token; the panel's exact declaration list updated"
      contains: "quick 261025-uge"
    - path: .planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs
      provides: "record and compare modes: measures the shell, the list pages, the notebook routes and the Import error panel on a scratch build (ephemeral 127.0.0.1 port, WebKit and Chrome), and gates no-change at 1770 and below, the shift above it, decision 59's 2560 numbers, the panel under the tools and no overflow; ends 'N PASS, M FAIL'"
  key_links:
    - from: ".shell__body (max-width: var(--app-frame-max); margin-inline: auto; width: 100%)"
      to: "--app-frame-max = --app-size-nav-w + --app-notebook-content-max + 2 x --app-notebook-gutter (1770)"
      via: "the block is the window below 1770 and stops at 1770 above it; .notebook's own cap (notebook.css, unchanged) is the same 1546 as the main area inside the block, so the recipe route's content does not move"
      pattern: "max-width:\\s*var\\(--app-frame-max\\)"
    - from: ".shell__head padding-inline"
      to: ".shell__import-errors inset-inline-end"
      via: "one string-equal expression, max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page))), so the tools and the panel under Import can never drift apart (shell.test.js pins the equality)"
      pattern: "calc\\(\\(100% - var\\(--app-frame-max\\)\\) / 2 \\+ var\\(--gap-page\\)\\)"
    - from: ".shell__body's three new declarations"
      to: "the sticky bar and the page notice's fixed anchor"
      via: "none of transform, filter, perspective, will-change, contain or overflow is added (shell.test.js's existing forbidden-property test stays green), so .shell__body never becomes a containing block"
      pattern: "margin-inline:\\s*auto"
---

<objective>
Build the ultra-wide frame Mark chose on 2026-10-26 (Mark's List decide-ultrawide-frame = centred, option A; decide-ultrawide-lists = fill), recorded as sketch 011 decision 59: from a 1770 window the rail and the page travel as one block, capped at one new token, --app-frame-max (224 + 1482 + 2 x 32 = 1770), and centred in the window. The header's wordmark and tools sit over the block's edges, while the bar's ground and hairline still span the window. The list pages fill the frame and get no rule of their own. notebook.css's cap stays. Below 1770 nothing changes.

One addition beyond the survey's two rules, called out for the orchestrator: the Import error panel is pinned "under Import, at the right gutter" (sketch 011 decision 52 B). With the tools moving to the block's edge, the panel would otherwise stay at the window's edge, about 400 px to the right of Import at 2560. Its inset-inline-end takes the same expression as the bar's padding, so it stays under Import. Below 1770 that value works out to the current --gap-page, so nothing changes there either. The 2560 boards do not draw the panel. Strike this one declaration (and its test line) before execution if it is not wanted.

Purpose: Home is "unusable" on Mark's ultra-wide monitor, and decision 16's centring left the rail pinned at the window's edge with 427 to 867 px of ground between the rail and the band.
Output: one token, three declarations, five pinned tests, a probe that measures the before and after builds, and one feat commit.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/notes/2026-10-26-ultra-wide-survey.md
@.planning/sketches/011-recipe-route-c/README.md
@app/src/styles/tokens.css
@app/src/styles/shell.css
@app/src/styles/shell.test.js
@app/src/styles/css-source.js
@.planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs
@.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs

<interfaces>
Observed live at planning time (HEAD fba9974c, 2026-10-25):

Tokens. Every name in the survey exists with the value the survey states, and no name differs:
- tokens.css line 399: `--app-size-nav-w: 224px;`
- line 429: `--app-notebook-gutter: var(--gap-l);` (32px)
- line 430: `--app-notebook-content-max: 1482px;`
- line 71: `--gap-page: var(--gap-xl);` (48px). app.css steps it to --gap-m (20) on :root below 724.
- `--app-frame-max` does not exist anywhere under app/src at HEAD.

shell.css:
- line 46: top-level `.shell__head` with `padding: var(--gap-xs) var(--gap-page);` (line 54). shell.test.js line 476 pins that shorthand by regex, so keep it.
- line 1069: inside `@media (max-width: 723.98px)`, `.shell__head { padding: var(--gap-s) var(--gap-page) }`. This comes later in the source, so below 724 it resets the inline padding. That is correct as built.
- line 214: top-level `.shell__import-errors` with `inset-inline-end: var(--gap-page);` (line 218). shell.test.js lines 716-735 pin it as an exact sorted declaration list, so that list must change in the same commit. The phone block's `.shell__import-errors` declares `inset-inline: var(--gap-page)`, which wins below 724, and it stays unchanged.
- line 265: `.shell__body { display: flex; flex: 1 1 auto; }`. It is a flex item of `.shell`, a column flex container. With `width: 100%` plus `margin-inline: auto` it centres once `max-width` bites, and stays full width below that.
- The five media conditions, the only ones in the file: (max-width: 1099.98px), (max-width: 759.98px), (pointer: coarse), (max-width: 1589.98px), (max-width: 723.98px).
- shell.test.js line 288 forbids transform, filter, perspective, will-change, contain, overflow, overflow-x and overflow-y on .shell, .shell__body and .shell__main. Line 50 forbids bare px values in any declaration.

shell.test.js imports `readAllRules, readCustomProperties` from './css-source.js'. It holds `tokens = readCustomProperties(tokens.css)` and `rules = readAllRules(shell.css)`; each rule is `{ selector, declarations, media }`, and top-level rules carry `media: undefined`. css-source.js also exports `resolveTokenPx(props, name)`, which follows one level of var(): resolveTokenPx(tokens, '--app-notebook-gutter') is 32.

Unchanged, and not to be touched:
- notebook.css line 36, `.notebook { max-width: calc(var(--app-notebook-content-max) + 2 * var(--app-notebook-gutter)); margin: 0 auto }`, pinned by notebook.test.js line 146.
- app.css `.list-page { padding: var(--gap-page) }`.
- print.css line 859: inside @media print, `.shell:has(.print-route) .shell__body { display: block; margin: 0; padding: 0 }`. It is more specific, so print layout keeps margin 0, and a printed page is never 1770 wide.
- DESIGN.md lines 451 and 473 already describe the top rung (commit fba9974c), as does sketch 011 README decision 59 (line 706).

Probe infrastructure:
- `startServers({ appRoot })` from `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs` serves the scratch dist with SPA fallback on an ephemeral 127.0.0.1 port and returns `{ appUrl, close }`.
- playwright-core 1.63.0 lives at `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`, with the PLAYWRIGHT_CORE override and the existence check exactly as in the elq probe. The WebKit build (webkit-2359) is installed, and Google Chrome is at /Applications/Google Chrome.app (`chromium.launch({ channel: 'chrome' })`).
- The 4173 `vite preview` is running (Mark's, PID 31386 at planning time) and serves app/dist (index.html mtime Oct 25 20:02). Never touch either.

Routes and selectors. A fresh context seeds the store on its first load.
- Home `/`: `.list-page`, the first `.home__lead`, the first `.home__row`, the first `.home__tally`.
- Notebook `/notebook`: `.list-page`, the first `.nb__row`.
- Ingredients `/ingredients`: `.list-page`, the first `.ing__row`.
- Recipe `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1`: `.notebook`, `.notebook-band`, `.recipe-page`, `.notebook-log`.
- Print `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/print`: `.notebook`, `.print-route__head`, the first `.print-page`.
- Creation editor: the address alone redirects. Go to `/notebook`, click the button named "New recipe", fill `input[aria-label="Name"]` with "Vanilla", click the button named "Start", then wait for the path `/notebook/new` and `.notebook.mk-page`. Measure `.notebook`, `.notebook-band`, `.recipe-page` and `.notebook-log`, recording null where an element is absent.
- Shell, every route: `.shell__head`, `.shell__brand`, `.shell__tools`, `.shell__body`, `.shell__rail`, `.shell__rail a` (the first), `.shell__main`, `.shell__tabs`.
- Import error panel: on Home, `page.setInputFiles('.shell__file-input', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('not json') })` shows `.shell__import-errors` (title "This file can’t be imported"; Shell.jsx line 457 sets '$: the file is not valid JSON').

Decision 59's measured numbers at 2560 (WebKit, fine pointer, 1000 tall): block 395 to 2165, rail 395 to 619, nav 415 to 598, main 619 to 2165, wordmark 443 to 557, tools 1749.5 to 2117, Home lead and rows 667 to 2117 (1450), tally 1647.3, band 651 to 2133, Sheet 651 to 1751, log 1783 to 2133.

Base: `npm --prefix app test` = 120 files and 3766 tests passing at fba9974c; `npm --prefix app test -- src/styles` = 8 files and 405 tests.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The block, end to end: the base measured, the token and the three rules pinned red then green, and the 2560 slice measured in WebKit</name>
  <files>app/src/styles/tokens.css, app/src/styles/shell.css, app/src/styles/shell.test.js, .planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs</files>
  <precondition>The playwright-core index.mjs named in interfaces exists (or PLAYWRIGHT_CORE points at one), and `git diff --quiet HEAD -- app/src` exits 0 before step 1 (the base build must be the unmodified tree).</precondition>
  <behavior>
    - shell.test.js, new describe "the ultra-wide frame: one block capped at --app-frame-max and centred (sketch 011 decision 59; decide-ultrawide-frame centred, Mark 2026-10-26; quick 261025-uge)", exactly 5 tests:
    - Test 1: tokens['--app-frame-max'] is the string calc(var(--app-size-nav-w) + var(--app-notebook-content-max) + 2 * var(--app-notebook-gutter)), and resolveTokenPx of --app-size-nav-w, plus resolveTokenPx of --app-notebook-content-max, plus 2 x resolveTokenPx of --app-notebook-gutter, is 1770.
    - Test 2: the top-level .shell__body's declarations, split on ';', trimmed and sorted, equal exactly ['display: flex', 'flex: 1 1 auto', 'margin-inline: auto', 'max-width: var(--app-frame-max)', 'width: 100%'].
    - Test 3: the top-level .shell__head declares padding-inline: max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page))), and that declaration's index in the rule's declaration list is after the index of its padding: shorthand (the shorthand would otherwise reset it).
    - Test 4: the top-level .shell__import-errors' inset-inline-end value is string-equal to the top-level .shell__head's padding-inline value (one expression, so the panel stays under Import, decision 52 B).
    - Test 5: no rule with a media condition in shell.css reads var(--app-frame-max), and the set of media conditions in shell.css is exactly the five listed in interfaces (the cap adds no breakpoint; below 1770 the max() and the cap reduce to today's values).
    - The existing test "the panel is fixed under the bar at the right gutter, over the page, on tokens only" changes one entry: 'inset-inline-end: var(--gap-page)' becomes 'inset-inline-end: max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page)))'. No other existing test changes.
  </behavior>
  <action>
Step 1, the base. Record `BASE=$(git rev-parse HEAD)` in the summary, and note app/dist/index.html's mtime with `stat -f %m app/dist/index.html`. Set `S="${TMPDIR:-/tmp}/sprinkles-uge"`. Before any edit under app/src, build the base with `npm --prefix app run build -- --outDir "$S/before" --emptyOutDir`. Never build into app/dist, never start a Vite dev or preview server, and never contact 4173.

Step 2, the probe. Write `.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs`. Its header comment, in the elq probe's style, gives the usage and the isolation: a scratch build only, an ephemeral 127.0.0.1 port, every other host aborted, no Vite, never 4173 or app/dist.

Import startServers from '../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs'. Load webkit and chromium from PLAYWRIGHT_CORE, with the elq probe's default path and its FAIL-and-exit check.

Mode `record <out.json>`:
- Needs PROBE_DIST, a directory holding index.html, the same check as the elq probe.
- Optional comma-list filters: PROBE_ENGINES (default webkit,chrome), PROBE_WIDTHS (default 393,1366,1600,1770,1920,2560,3440) and PROBE_ROUTES (default home,notebook,ingredients,recipe,print,creation).
- Chrome is `chromium.launch({ channel: 'chrome' })`. If it throws, print 'INFO chrome unavailable: <message>' and record webkit only.
- For each engine and width, open one fresh context: viewport { width: W, height: 1000 }, deviceScaleFactor 1, no hasTouch and no isMobile (fine pointer). Route every request whose hostname is not 127.0.0.1 to abort.
- Visit the routes in the order home, notebook, ingredients, recipe, print, creation, each by a full page.goto. Creation goes last, through the Notebook's New recipe entry described in interfaces, because it leaves a draft.
- After each route's root selector appears, await document.fonts.ready and wait 200 ms. Then read, for every selector in interfaces that applies to the route plus the shell selectors, the first match's getBoundingClientRect as { l, r, w }, each rounded to 0.1 (null when the element is absent). Also read `overflow = documentElement.scrollWidth - documentElement.clientWidth`. Store the result under the key '<engine>|<W>|<route>'.
- While on Home, after measuring, set the bad file on .shell__file-input as in interfaces, wait for .shell__import-errors, and store { panel, tools } boxes under 'panel|<engine>|<W>'. If the panel does not appear within 3 s, store null, which the compare gates as FAIL.
- Write { meta: { dist, engines, widths, routes, recordedAt }, records } to out.json and print one INFO line per record.

Mode `compare <before.json> <after.json>` evaluates only the keys present in after.json. A key missing from before.json is a FAIL. Each gate prints one PASS or FAIL line, and a FAIL names the first differing box and its two values. The gates:
- same: for W in 393, 1366, 1600 and 1770, every route record and every panel record in after deep-equals before.
- shift: for W above 1770, with L = (W - 1770) / 2, every shell box (body, rail, nav, main, brand, tools) equals before's '<engine>|1770|<same route>' box with l and r plus L and the same w. Every list box on home, notebook and ingredients (listPage, lead, row, tally) does the same. Every notebook box on recipe, print and creation (notebook, band, sheet, log, printHead, printPage) equals before at the same W. The head's l is 0 and its r is W. Tolerance is 0.15.
- target2560: the decision-59 numbers in interfaces, within 0.5, read from after's home and recipe records at 2560.
- panel: for every panel record with W of 1366 or more, panel.r equals tools.r within 0.5.
- overflow: every after record has overflow of 0 or less. The one exception is a key where before.json has the same positive overflow: print it as 'INFO pre-existing overflow <key> <px>' rather than FAIL, and name it in the summary as a finding for Mark, not to be fixed here. The survey saw none at 1366 to 3440; 393 was not surveyed.

End with the line 'N PASS, M FAIL', and exit 1 when M is above 0.

Step 3, the base record. Run `PROBE_DIST="$S/before" node <probe> record "$S/before.json"` over the full matrix, both engines. Then run `node <probe> compare "$S/before.json" "$S/before.json"`. It must print FAIL on the shift and target2560 gates, which proves those two gates bite on the as-built frame, and exit 1. Record its last line.

Step 4, red. Add the shell.test.js describe from behavior, and add resolveTokenPx to that file's import from './css-source.js'. Give the new describe its own local declarations helper, since the Import panel describe's helper is scoped to that block. Change the one entry in the panel's exact list. Run `npm --prefix app test -- src/styles/shell.test.js`; the 5 new tests and the edited panel test fail.

Step 5, green: tokens only, no literal (sketch 011 decision 59; decide-ultrawide-frame centred; decide-ultrawide-lists fill, so .list-page gets nothing).
- tokens.css: on the line after --app-size-nav-w, declare `--app-frame-max: calc(var(--app-size-nav-w) + var(--app-notebook-content-max) + 2 * var(--app-notebook-gutter));` with a trailing comment in the file's style. It names sketch 011 decision 59 and decide-ultrawide-frame (centred, Mark 2026-10-26): the rail and the page are one block, 224 + 1482 + 2 x 32 = 1770, centred in the window from a 1770 window; below it the block is the window; read by shell.css only. No comment line may start with a token name followed by a colon (Task 2's diff count reads such lines).
- shell.css .shell__body: after `flex: 1 1 auto;` add `width: 100%;`, `max-width: var(--app-frame-max);` and `margin-inline: auto;`, with a short comment above the rule naming decision 59. Add nothing else: none of the properties in the forbidden list, and no media rule.
- shell.css .shell__head: directly after the existing `padding: var(--gap-xs) var(--gap-page);` add `padding-inline: max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page)));`. Keep the shorthand. The bar keeps its background and border-bottom, so its ground and hairline span the window.
- shell.css .shell__import-errors: replace `inset-inline-end: var(--gap-page);` with `inset-inline-end: max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page)));`. For this fixed box the 100% is the viewport's width, which equals .shell's at every width the probe measures. Amend its comment: "at the bar's right gutter, which from 1770 is the block's (decision 59), so it stays under Import (decision 52 B)".
- shell.css header comment: extend the "From 1590" bullet with one sentence. From 1770 (decision 59), .shell__body stops at --app-frame-max and centres in the window, the rail inside it; the bar's padding sets the wordmark and the tools over the block's edges, and the Import error panel follows the tools. No media condition is added. The comment's "Three states, two media conditions" stays true.
- Do not touch notebook.css, app.css, home.css, print.css, app/src/ui, router.jsx, main.jsx or DESIGN.md (DESIGN.md already records the rung, fba9974c).

Run `npm --prefix app test -- src/styles` until it is green (405 + 5 = 410).

Step 6, the slice. Build after with `npm --prefix app run build -- --outDir "$S/after" --emptyOutDir`. Record WebKit only, at 1770 and 2560, on Home and the recipe route (plus the panel). Compare against before.json; it must end ', 0 FAIL'.

Step 7, the commit. Stage by path only, never -A or a directory. Check that `git diff --cached --name-only` lists nothing else, then run `git commit -m "<msg>" -- app/src/styles/tokens.css app/src/styles/shell.css app/src/styles/shell.test.js .planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs`. With paths given, git commits only those, even if another agent has staged files under .planning/. The message is 'feat(261025-uge): the rail and the page travel as one block, capped at 1770 and centred (sketch 011 decision 59; decide-ultrawide-frame, decide-ultrawide-lists)', followed by the attribution lines your session gives.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-uge"; P=.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs; npm --prefix app test -- src/styles && PROBE_ENGINES=webkit PROBE_WIDTHS=1770,2560 PROBE_ROUTES=home,recipe PROBE_DIST="$S/after" node "$P" record "$S/after-slice.json" && node "$P" compare "$S/before.json" "$S/after-slice.json" | tail -1 | grep ', 0 FAIL$'</automated>
  </verify>
  <done>
- The style suites pass at 410, and the 5 new tests were seen failing before step 5.
- `compare before before` exited 1 with FAIL on the shift and target2560 gates.
- The WebKit slice compare ends ', 0 FAIL', with the 2560 numbers matching decision 59 (rail 395 to 619, wordmark 443, tools ending at 2117, Home rows 667 to 2117, tally 1647.3, band 651 to 2133) and every 1770 box equal to base.
- One feat commit holding exactly the four files.
  </done>
</task>

<task type="auto">
  <name>Task 2: The full matrix in WebKit and Chrome, the full suite, the strict walk and the scope guards</name>
  <files>(none modified; reads the scratch builds, the probe and the walk)</files>
  <action>
1. Record the full matrix against the after build, both engines, every width from 393 to 3440 (1600 included), every route and the panel: `PROBE_DIST="$S/after" node <probe> record "$S/after.json"`. Run it with a 600000 ms timeout. Chrome is installed, so a chrome-unavailable INFO line is a FAIL of this task; report it, do not pass on WebKit alone.
2. Compare it against before.json. It must end ', 0 FAIL'. If a gate fails, fix the CSS (not the gate) and re-run Task 1's style suites and its commit rule. The one exception is a gate whose expectation contradicts decision 59's own numbers or the base record; report that one rather than editing it.
3. Run `npm --prefix app test`. It passes at the base count plus 5 (3771 when the base is 3766).
4. Run `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh`. It prints MATCH 94 snapshots. The walk runs at 1366 and records state, not geometry, and builds into its own scratch directory.
5. Scope guards against BASE from Task 1:
   - `git diff --quiet "$BASE" -- app/src/styles/notebook.css app/src/styles/app.css app/src/styles/home.css app/src/styles/print.css app/src/ui app/src/router.jsx app/src/main.jsx DESIGN.md` exits 0.
   - `git diff "$BASE" -- app/src/styles/tokens.css | grep -E '^\+\s*--app-[a-z-]+\s*:' | grep -c .` prints 1.
   - `git diff --name-only "$BASE"..HEAD` lists the four files of files_modified and nothing else. A commit by another agent in between shows up as extra .planning paths; name them in the summary as not this task's.
   - `stat -f %m app/dist/index.html` equals the value noted in Task 1.
   - `lsof -nP -iTCP:4173 -sTCP:LISTEN` still shows the same preview PID.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-uge"; P=.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs; PROBE_DIST="$S/after" node "$P" record "$S/after.json" && node "$P" compare "$S/before.json" "$S/after.json" | tail -1 | grep ', 0 FAIL$' && npm --prefix app test 2>&1 | grep -E "Tests +[0-9]+ passed" && sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh | tail -1 | grep 'MATCH 94 snapshots'</automated>
    <human-check>Deferred to Mark, in chat, not as a row (one check). On his ultra-wide monitor, in his own browser, served from the build: Home and Olive Oil v1 at full window width. Expect the rail and the page as one block centred in the window, the wordmark and the tools over the block's edges, the bar's ground and hairline across the window, and Home's rows 1450 wide. With a bad file, Import's error panel opens under Import.</human-check>
  </verify>
  <done>
- Both engines recorded at all seven widths on all six routes, plus the panel.
- The compare ends ', 0 FAIL', and the summary carries the 2560, 1920 and 3440 numbers and the 1770-and-below no-change count.
- The full suite passes at base + 5, and the walk prints MATCH 94 snapshots.
- Every scope guard holds.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe to network | The probe drives WebKit and Chrome against a local scratch build; any request to a host other than 127.0.0.1 is aborted |
| this task's commit vs the parallel agent's tree | Another agent edits .planning/ and leaves its changes uncommitted; this task commits by explicit path only |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-uge-01 | Information disclosure | 261025-uge-frame-probe.mjs | low | mitigate | Every context aborts non-127.0.0.1 requests; the scratch builds are served by 08-walk-server.mjs on an ephemeral loopback port, never on 4173, never with --host, never from app/dist |
| T-uge-02 | Tampering | git history (parallel agent's uncommitted .planning edits) | medium | mitigate | `git commit -- <four paths>` after checking `git diff --cached --name-only`; never -A or a directory; Task 2 checks the commit's name list against files_modified |
| T-uge-03 | Denial of service | the sticky bar and the page notice's fixed anchor | low | mitigate | .shell__body gains only width, max-width and margin-inline; shell.test.js's forbidden-property test keeps it from becoming a containing block; the probe gates horizontal overflow at every width |
| T-uge-04 | Tampering | tokens.css, shell.css | low | accept | Layout CSS reading existing tokens plus one composed token: no input, no markup, no dependency; shell.test.js keeps px and hex literals out |
| T-uge-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed: playwright-core is the npx cache copy the Phase 10 walk already uses, and Chrome is the installed Google Chrome |
</threat_model>

<verification>
From the repo root, after both tasks:
- `npm --prefix app test` passes at the base count + 5.
- The probe's full compare (both engines; 393, 1366, 1600, 1770, 1920, 2560 and 3440; six routes plus the panel) ends ', 0 FAIL', and `compare before before` fails the shift and target2560 gates.
- `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh` prints MATCH 94 snapshots.
- The scope guards in Task 2 step 5 all hold: only the four files changed, one token added, app/dist and the 4173 preview untouched.
</verification>

<success_criteria>
- From a 1770 window the rail and the page are one block, capped at --app-frame-max (1770) and centred. The wordmark and tools sit over the block's edges, the bar spans the window, and the lists fill the frame's 1450.
- At 2560 the boxes match decision 59's measured panel to 0.5 px in both engines.
- At 1770 and below (393, 1366, 1600, 1770), every measured box on all six routes, and the Import error panel, equals the base build.
- The Import error panel stays under Import at every width.
- No horizontal overflow anywhere.
- One token and three declarations, tokens only. notebook.css's cap and every other stylesheet are untouched.
- One feat commit of exactly four files.
</success_criteria>

<output>
Create `.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-SUMMARY.md` when done. Include:
- BASE, the base test count, and the final counts: styles 410; full suite at base + 5.
- The probe's `compare before before` last line, and the final compare's last line.
- A before-and-after table per engine at 1366, 1770, 1920, 2560 and 3440. Columns: rail l/r, first nav link l, main l/r, wordmark l, tools r, Home row l/r/w, tally l, the recipe route's band, Sheet and log l/r, overflow.
- The no-change count at 393, 1366, 1600 and 1770, by route.
- The walk's MATCH line.
- Under "For the orchestrator" (the executor writes no Mark's List row):
  - close decide-ultrawide-frame and decide-ultrawide-lists if either is still open;
  - give Mark the one device check in chat, the human-check above, since a single check takes no row;
  - name the Import error panel declaration as the one addition beyond the survey's two rules (decision 52 B). The 2560 boards do not draw the panel, so it is a follow-up for Sid: draw it on UW_Home if he wants it on the board, and DESIGN.md line 451's "at the right gutter" may say "the block's right gutter".
- Under Deferred Human Verification: measured in WebKit and Chrome on the dev machine only, not on Mark's ultra-wide monitor.
</output>
