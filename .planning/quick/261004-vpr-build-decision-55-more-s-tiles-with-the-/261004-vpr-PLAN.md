---
phase: quick-261004-vpr
plan: 01
quick_id: 261004-vpr
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/Shell.jsx
  - app/src/ui/Shell.test.jsx
  - app/src/ui/Shell.flyout.test.jsx
  - app/src/styles/shell.css
  - app/src/styles/shell.test.js
  - .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs
  - .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-SUMMARY.md
autonomous: true
requirements: [UX1-01]

estimate:
  tokens: 90000
  raw_tokens: 90000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Decision 55 (Mark, 2026-10-05: 'they should look like Tiles from the Tab Bar, as in B, but I like the hairline to separate places and actions'): below 724, More's open panel shows five tiles of one width (icon over a 12px word). Import and Export have no border and are as wide as the other tiles."
    - "Between Search and Import, a hairline runs the full width of the tiles: the rail's own hr.shell__divider, 1px in --app-divider, 6px above and below, with no side margin, inside an aria-hidden li. A tap on it closes More, as any tap in the list does."
    - "Measured in WebKit (coarse) at 393 and 723: the panel is 101.5 x 284 (105.2 x 284 on /ingredients), the tiles 75.5 x 49 (79.2 wide on /ingredients), the rule as wide as the tiles. Import's focus ring clears the rule by 2px. In Chrome: 97.6 x 279 (102.4 x 280), tiles 71.6 wide (76.4). Under hover, More's Import and Export keep border 0 and their boxes do not move."
    - "A place that is a button carries no border wherever it sits: one top-level rule, button.shell__place, replaces the tools row's own button reset. The header's Import and Export keep border 0 from 724 up. Their hover size is exactly as before (the hover shrink is a separate open todo, not fixed here)."
    - "The tab row's own tiles, the rail, the fly-out, the Import error list, the page notice, the Batch fold and the Sheet are unchanged. Every link and button keeps tabIndex={0}. Each test is committed before its code, and `npm --prefix app test` passes. No build, no Vite process; app/dist and :4173 are read only."
  artifacts:
    - path: app/src/ui/Shell.jsx
      provides: "the separator li between Search's item and Import's item in More's list"
      contains: "<li className=\"shell__more-sep\" aria-hidden=\"true\">"
    - path: app/src/styles/shell.css
      provides: "the top-level button.shell__place reset, and four phone-block rules: the button width, the tiles' side padding, the separator's height and the divider's side margin"
      contains: "button.shell__place {"
    - path: app/src/styles/shell.test.js
      provides: "pins on the reset, the removal of the old tools-row reset, the four phone rules, and the one named root-scope exception"
      contains: "button.shell__place"
    - path: app/src/ui/Shell.test.jsx
      provides: "the separator's exact markup and place in More (after Search, before Import)"
      contains: "shell__more-sep"
    - path: app/src/ui/Shell.flyout.test.jsx
      provides: "jsdom: a click on the rule closes More and returns focus to its summary"
      contains: "shell__more-sep"
    - path: .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs
      provides: "a WebKit and Chrome probe on the existing build, with the separator set in the page and the edited shell.css rules added"
  key_links:
    - from: app/src/ui/Shell.jsx
      to: app/src/styles/shell.css
      via: "li.shell__more-sep holds hr.shell__divider; the phone block's .shell__more li.shell__more-sep (min-height 0) and its .shell__divider (margin-inline 0) style it"
      pattern: "shell__more-sep"
    - from: app/src/ui/Shell.jsx
      to: "closeMore"
      via: "the separator sits inside <ul onClick={closeMore}>, so a tap on it bubbles to the list's handler"
      pattern: "<ul onClick=\\{closeMore\\}>"
    - from: app/src/styles/shell.css
      to: app/src/styles/app.css
      via: "button.shell__place is (0,1,1), the same as app.css's button:hover; shell.css loads after app.css (main.jsx), so border none wins"
      pattern: "button\\.shell__place"
---

<objective>
Build sketch 011 decision 55: More's tiles with a hairline between the places and the actions. Mark answered decision 54 on 2026-10-05 ("they should look like Tiles from the Tab Bar, as in B, but I like the hairline to separate places and actions"). Sid drew the combination as decision 55 (board `more-tiles-hairline.html`). The Mark's List rows are build-more-tiles-hairline and decision-54-more-items.

Three changes, all from the README's decision 55 brief and the board's own CSS (`more-candidates.css` sections TILESRESET, TILESPHONE, HAIR):
1. **The reset.** In `shell.css`, at the top level, `button.shell__place { appearance: none; border: none; background: none; color: inherit; cursor: pointer; }` replaces the tools row's own button reset. A place that is a button then carries no border wherever it sits: the header's Import and Export, More's, and later decision 52's Close.
2. **The tiles (phone block).** Each button is as wide as its list item, and every item in More's list has 6px side padding (`--gap-xs`).
3. **The hairline.** An `aria-hidden` li holding the rail's `hr.shell__divider`, placed between Search and Import in `Shell.jsx`. Two phone-block rules style it: the item is not a 44px target, and the rule has no side margin.

**One known clash between the brief and the code; this plan resolves it and the SUMMARY reports it.** `shell.test.js` pins every selector in shell.css to start with `.shell` or `.place`; `html` is the one exception. The brief's `button.shell__place` starts with `button`. The selector is the brief's on purpose: at (0,1,1) it ties app.css's `button:hover` and wins by load order. So the root-scope test admits this one exact selector as a second named exception, and a new test pins it. Nothing else is widened.

Purpose: on the iPhone, More's Import and Export stop looking like small dark-bordered buttons. They become tiles like the rest, and a hairline separates going somewhere from doing something.

Output:
- edits to Shell.jsx and shell.css, with their tests (Shell.test.jsx, Shell.flyout.test.jsx, shell.test.js)
- a probe and a SUMMARY in this quick directory

Out of scope (do not touch): the header's hover shrink (an open todo row; the reset sets no padding), the Import error list and its panel, the notice stacking (the next quick), the tab row's ring, the Batch fold, anything in the Sheet, app.css, tokens.css. Never edit or stage `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/`, `.planning/STATE.md` or `.planning/todos/`; Sid is editing there and the tree has his uncommitted files. File no Mark's List rows.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read these, not whole large files:
- `.planning/sketches/011-recipe-route-c/README.md` line 655 (decision 54's brief: the specificity reasoning) and lines 660 to 666 (decision 55: what is drawn, the measured numbers, the app change brief). Read only.
- `.planning/canvas-generators/more-candidates.css` lines 11 to 18 (TILESRESET, TILESPHONE, HAIR: the rules to copy). Read only.
- The board `.planning/sketches/011-recipe-route-c/more-tiles-hairline.html` is 15,940 lines. Do not read it whole. Read lines 2843 to 2851 (one window's added rules, scoped `.fp-mt-393-rest`), and the More markup with `sed -n '15924p' <board> | grep -o '<details class="shell__more.*</details>'`. The windows are `.fp-mt-{393,723}-{rest,cur,ring}`. Read only.
- `app/src/ui/Shell.jsx` lines 386 to 429 (the tab row and More's list).
- `app/src/styles/shell.css` (573 lines): lines 1 to 30 (the header comment), 178 to 192 (the tools row and its button reset), 350 to 356 (`.shell__divider`), 454 to 573 (the phone block).
- `app/src/styles/shell.test.js` lines 1 to 80 (the helpers, `rules`, `PHONE_MEDIA`, the root-scope test at 57) and 314 to 335 (the exact-declarations style: `split(';').map(trim).filter(Boolean)` then `toEqual`).
- `app/src/ui/Shell.test.jsx` lines 1 to 63 (the `renderAt` harness) and 131 to 157 (the More tests).
- `app/src/ui/Shell.flyout.test.jsx` lines 1 to 143 (the jsdom harness: `mountAt`, `click`, `current`) and 265 to 278.
- `app/src/styles/app.css` lines 52 to 75 (`button, select` and `button:hover, select:hover`). Read only. Do not edit app.css.
- Probe pattern: `.planning/quick/261004-uo6-fix-the-record-pen-black-hairline-and-th/261004-uo6-probe.mjs` (whole; imports, `readAllRules`, `addTag`, `raf2`, `ck`, the ring reader), and `.planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs` lines 1 to 30 and 55 to 75 (the markup set by a DOM edit). The harness `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs` exports `startServers`, `launch` (system Chrome), `openApp(browser, appUrl, route, { width, height, coarse })`, `openBoard(browser, repoUrl, file, { width, height, coarse })`, `check` and `finish`. Copy from these; do not edit them.
- Sid's readings, for the gates: `.planning/canvas-generators/moretiles-measure.mjs` (49 lines; how he read the ring, the gaps and the hover) and `moretiles-measure.json` / `moretiles-measure-chromium.json` (keys `A_393_notebook` as built, `T_<393|723>_<notebook|ingredients>` with the tiles and the hairline, `header1366`). Read only.

Facts the planner checked:
- jsdom in app/ is 30.1.1. A click on a summary opens its details, and the `toggle` event fires one task later.
- The current `app/dist` CSS (`assets/index-BTq3BI6l.css`, modified 2026-10-04 22:52:50) has the tools row's reset `.shell__tools button{...}` and no `shell__more-sep`. Sid measured a dist modified at 22:36:51.
- Sid measured with `hasTouch: true, deviceScaleFactor: 2` at W x 852. The harness's `openApp` coarse uses `isMobile: true, deviceScaleFactor: 3`. G0 below checks that the two agree.

Sid's numbers (Playwright; WebKit coarse and system Chrome):

| state | engine | panel W x H | tiles W x H | Import / Export |
|---|---|---|---|---|
| as built, 393, Notebook page | WebKit | 89.5 x 275 | links 63.5 x 49 | 39.1 x 51 / 38.9 x 51, 1px solid; hover 2px, 41.1 x 53 |
| as built, 393, Notebook page | Chrome | 85.6 x 270 | links 59.6 x 48 | 37.1 x 50 / 37.3 x 50, 1px solid; hover 2px, 39.1 x 52 |
| tiles + hairline, 393 and 723, Notebook page | WebKit | 101.5 x 284 | 75.5 x 49 | 75.5 x 49, border 0 |
| tiles + hairline, 393 and 723, /ingredients | WebKit | 105.2 x 284 | 79.2 x 49 | 79.2 x 49, border 0 |
| tiles + hairline, 393 and 723, Notebook page | Chrome | 97.6 x 279 | 71.6 x 48 | 71.6 x 48, border 0 |
| tiles + hairline, 393 and 723, /ingredients | Chrome | 102.4 x 280 | 76.4 wide; Ingredients 49 tall, the rest 48 | 76.4 x 48, border 0 |

More numbers, both engines, tiles plus hairline:
- The rule is as wide as the tiles, 1px, `1px solid rgb(214, 218, 215)`, margin `6px 0px`, 6px below Search and 6px above Import.
- The panel's right edge is the window's; its foot sits 1px into the tab row (as built).
- Import focused: 2px solid, offset 2px. The ring's top is 2px below the rule's bottom. Its right edge is 8px inside the panel's inner right edge (the panel's right minus its 1px border).
- On /ingredients, the current tile's word is 6px from each edge of its surface, in weight 600.
- Header at 1366, fine pointer: Import 108.4 x 44, and 80.4 x 32 under hover (Chrome 107.0 x 44 and 79.0 x 32). Border 0 both ways.

Routes: the Notebook page is `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1` (Olive Oil v1); `/ingredients` makes Ingredients the current place.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The hairline between More's places and actions, end to end (tests, Shell.jsx, shell.css)</name>
  <files>app/src/ui/Shell.test.jsx, app/src/ui/Shell.flyout.test.jsx, app/src/styles/shell.test.js, app/src/ui/Shell.jsx, app/src/styles/shell.css</files>
  <behavior>
    - Static (Shell.test.jsx, `renderAt('/')`): More's markup (the `details.shell__more` match) contains exactly `Search</a></li><li class="shell__more-sep" aria-hidden="true"><hr class="shell__divider"/></li><li><button`. This is the board's markup. It sits right after Search's item and right before Import's item.
    - Static: `shell__more-sep` occurs exactly once in the whole markup. `class="shell__divider"` occurs exactly three times: the rail's two plus More's one. The rail's two still read `<hr class="shell__divider" aria-hidden="true"/>`.
    - Static, unchanged: still exactly 19 `shell__place` stops, each with tabindex="0". `tabindex="-1"` is still only on the file input. The separator adds no stop.
    - jsdom (Shell.flyout.test.jsx, `mountAt(393)`): click More's summary and let the toggle event land. The details is open, and `li.shell__more-sep > hr.shell__divider` is inside its list. Click that hr. The details is closed and `document.activeElement` is the summary. Before the code, this fails because the hr is missing.
    - CSS (shell.test.js): in the phone block, `.shell__more li.shell__more-sep` declares exactly `min-height: 0`. `.shell__more li.shell__more-sep .shell__divider` declares exactly `margin-inline: 0`. Neither has a top-level twin.
    - CSS: the top-level `.shell__divider` rule is unchanged (border-top `var(--app-rule-row) solid var(--app-divider)`, margin `var(--gap-xs) var(--gap-m)`), so the rail keeps its 20px side margins.
    - Unchanged and still passing: the phone-block selector allowlist (both new selectors start with `.shell__more`), no bare px, the two-media-blocks test, tabindex-scan.test.js.
  </behavior>
  <action>
RED. Write the tests first.

In `app/src/ui/Shell.test.jsx`, add a describe titled "Shell — More's hairline between places and actions (sketch 011 decision 55, Mark 2026-10-05)". It holds the two static behaviours: the exact adjacency string, and the counts of the separator and the dividers. Reuse `renderAt` and the `details.shell__more` match from the More tests at line 144. Keep the existing 19-stop and tabindex="-1" tests as they are.

In `app/src/ui/Shell.flyout.test.jsx`, add a describe at the end titled "More's hairline below 724 (sketch 011 decision 55)", using the file's `mountAt` and `click`. The steps:
- Find `details.shell__more` and its summary in `current.container`.
- `click(summary)`. Then, so the toggle event lands inside act, run `await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); })`.
- Expect `details.open` true. Expect the hr (`li.shell__more-sep > hr.shell__divider` inside the details) to be truthy.
- `click(hr)`, then the same tick.
- Expect `details.open` false and `document.activeElement` to be the summary.
Add one line to the file's header comment: it also holds More's hairline tap below 724 (decision 55).

In `app/src/styles/shell.test.js`, add a describe titled "More's tiles and the hairline (sketch 011 decision 55; Mark 2026-10-05)". For each of the two phone-block rules, find it by exact selector with `media === PHONE_MEDIA`. Compare its declarations with the exact-declarations style used at line 332. Check that no rule with the same selector has `media === undefined`. Add the `.shell__divider` unchanged test. Task 2 adds more tests to this describe.

Run `npm --prefix app test -- src/ui/Shell.test.jsx src/ui/Shell.flyout.test.jsx src/styles/shell.test.js`. Confirm the new tests fail because the separator and its rules are missing, and that every older test passes. Stage the three test files by explicit path, then check `git diff --cached --name-only`. Commit as `test(261004-vpr): pin the More hairline between places and actions`. End the message with:
- `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
- `Claude-Session: https://claude.ai/code/session_01DnSshE2JfScJcTaMMxNapN`

GREEN. In `app/src/ui/Shell.jsx`, in More's list, between Search's `li` and Import's `li`, add `<li className="shell__more-sep" aria-hidden="true"><hr className="shell__divider" /></li>`. Keep this attribute order: React emits the attributes in the order written, and the test pins the string. Above it, add a short JSX comment in plain words: the hairline between the places (Ingredients, Kitchen, Search) and the actions (Import, Export), sketch 011 decision 55. It is the rail's own divider, hidden from assistive tech. A tap on it closes More like any tap in the list. Change nothing else; `<ul onClick={closeMore}>` stays exactly as written.

In `app/src/styles/shell.css`, in the phone block, directly after the touch rule `.shell__tabs .shell__place, .shell__more li { min-height: var(--touch-min); }`, add `.shell__more li.shell__more-sep { min-height: 0; }` and `.shell__more li.shell__more-sep .shell__divider { margin-inline: 0; }`. Write each declaration as `property: value;` on its own line, as the file does. Put one comment above the pair in plain words: the hairline's item is not a 44px target, and its rule runs the tiles' full width, because the rail's 20px side margins would leave a short dash in a 75px column (sketch 011 decision 55). No new token; `0` is a keyword-like zero, as elsewhere in the file.

Run the three files, then the full `npm --prefix app test`, including `src/ui/tabindex-scan.test.js`. If another test fails only because it counted More's list items or the dividers, update it to the new count and name it in the SUMMARY. Any other failure: stop and report it; do not work around it.

Stage `app/src/ui/Shell.jsx` and `app/src/styles/shell.css` (and any test so updated) by explicit path, then check `git diff --cached --name-only`. Commit as `feat(261004-vpr): the More hairline between places and actions`, with the same two trailer lines.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/Shell.test.jsx src/ui/Shell.flyout.test.jsx src/styles/shell.test.js src/ui/tabindex-scan.test.js && SUBJECTS="$(git log --reverse --format=%s --grep='261004-vpr')" && printf '%s\n' "$SUBJECTS" | grep -E 'More hairline' | head -1 | grep -q '^test(261004-vpr): pin the More hairline' && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-vpr): the More hairline'</automated>
  </verify>
  <done>The test commit comes before the feat commit. The three files, the tabindex scan and the full suite pass. More's list renders the separator li between Search and Import, with the board's exact markup. A click on its rule closes More and focuses the summary. The phone block carries the separator's two rules, and the rail's divider is unchanged.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: More's tiles, and a place that is a button carries no border (tests, shell.css)</name>
  <files>app/src/styles/shell.test.js, app/src/styles/shell.css</files>
  <behavior>
    - Exactly one rule in shell.css has the selector `button.shell__place`. It is top-level (`media === undefined`), and its declarations, sorted, equal exactly `['appearance: none', 'background: none', 'border: none', 'color: inherit', 'cursor: pointer']`.
    - No rule in shell.css (read through `rules`, which holds rules, not comments) has a selector that includes `.shell__tools button`, the tools row's old reset.
    - Phone block: `.shell__more li > button` declares exactly `width: 100%`.
    - Phone block: `.shell__tabs .shell__more li .shell__place` declares exactly `padding-inline: var(--gap-xs)`.
    - The root-scope test ("every rule is scoped under the .shell or .place root") admits exactly two named exceptions: `html` (as now) and `button.shell__place`. Its comment says why: decision 55's reset is reset by what it is, wherever it sits, and its (0,1,1) ties app.css's `button:hover`.
    - Unchanged and still passing: the phone-block allowlist, the radius test (no new radius), the focus-rule list, the 19 stops, the header tests.
  </behavior>
  <action>
RED. In `app/src/styles/shell.test.js`, add four tests to the describe from Task 1: the reset rule, the old reset gone, and the two phone tile rules (the behaviour list). Amend the root-scope test at line 57. Its predicate also accepts `rule.selector === 'button.shell__place'`, and the failure message names it. Update the comment above it (lines 52 to 56): it names the two exceptions, the html root rule and the one element-qualified place reset (sketch 011 decision 55). Nothing else in the file changes.

Run `npm --prefix app test -- src/styles/shell.test.js`. Confirm the four new tests fail and every other test passes. Stage the test file by explicit path, then check `git diff --cached --name-only`. Commit as `test(261004-vpr): pin the More tiles and the reset on a place that is a button`, with the two trailer lines from Task 1.

GREEN. In `app/src/styles/shell.css`:
- Replace the tools row's button reset (lines 186 to 192) in place with `button.shell__place { appearance: none; border: none; background: none; color: inherit; cursor: pointer; }`, one declaration per line. Above it, add a plain-words comment:
  - A place that is a button carries no border wherever it sits: the header's Import and Export, More's, and the Import error panel's Close when it lands (sketch 011 decisions 54 and 55; Mark 2026-10-05).
  - Its weight (0,1,1) ties app.css's `button` and `button:hover`, and this file loads after app.css, so border none wins at rest and under hover.
  - It sets no padding, so the header's hover shrink, an open todo, is unchanged here.
- In the phone block, directly after the `.shell__tabs .shell__place` rule (the icon-over-label rule), add `.shell__more li > button { width: 100%; }` and `.shell__tabs .shell__more li .shell__place { padding-inline: var(--gap-xs); }`. One plain-words comment above the pair: More's items are the tab row's tiles (sketch 011 decision 55, Mark: "as in B"). A button is as wide as its list item, as a link already is. The 6px side padding gives the current place's surface room around its word. The tab row's own tiles are untouched, because these selectors reach only More's list.
- In the header comment (lines 17 to 20), the sentence about shell.test.js pinning every selector to one of the two roots now names its two exceptions: the one html rule and the one `button.shell__place` reset.

Do not touch app.css, tokens.css, the focus rules, the tab row's rules or any other rule. Every value is a token, a keyword, 0 or a percentage.

Run `npm --prefix app test` (the full suite, green). Stage `app/src/styles/shell.css` by explicit path, then check `git diff --cached --name-only`. Commit as `feat(261004-vpr): More tiles, and a place that is a button carries no border`, with the trailer lines.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/shell.test.js && SUBJECTS="$(git log --reverse --format=%s --grep='261004-vpr')" && printf '%s\n' "$SUBJECTS" | grep -E 'More tiles' | head -1 | grep -q '^test(261004-vpr): pin the More tiles' && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-vpr): More tiles'</automated>
  </verify>
  <done>The test commit comes before the feat commit. The shell suite and the full suite pass. shell.css has the one top-level `button.shell__place` reset where the tools row's reset was, and the two tile rules in the phone block. The root-scope test names its two exceptions, and nothing else is widened.</done>
</task>

<task type="auto">
  <name>Task 3: Measure the tiles and the hairline in WebKit and Chrome on the existing build, then write the SUMMARY</name>
  <files>.planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs, .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-SUMMARY.md</files>
  <precondition>app/dist exists and predates this quick: its CSS has the tools row's `.shell__tools button` reset and no `shell__more-sep` (the probe's G-pre asserts it and stops if not).</precondition>
  <action>
Create `261004-vpr-probe.mjs` in this quick directory, modelled on the uo6 probe. Same imports:
- `webkit` from `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`
- from `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`: `startServers`, `launch`, `openApp`, `openBoard`, `check`, `finish`
- `readAllRules` from `../../../app/src/styles/css-source.js`

It serves the existing `app/dist` with `startServers()`, read only. No build, no Vite, never :4173, :5173 or :8011. The dist predates this quick, so the "fix" state is made in each page in three steps (wait two animation frames after them):
1. **Delete** the dist's top-level CSSOM rule whose `selectorText` is the tools row's old reset (`.shell__tools button`). Walk `document.styleSheets`. Exactly one must be deleted.
2. **Insert** the separator. Find Search's `li` in `.shell__more > ul` (its child is `a[href="/search"]`) and call `insertAdjacentHTML('afterend', ...)` with the markup Shell.test.jsx pins (`<li class="shell__more-sep" aria-hidden="true"><hr class="shell__divider"></li>`). Exactly one `.shell__more-sep` must exist afterwards.
3. **Add** the edited shell.css's rules with `addStyleTag`. Read them with `readAllRules` from `app/src/styles/shell.css`:
   - the top-level `button.shell__place`
   - the phone-block `.shell__more li > button`, `.shell__tabs .shell__more li .shell__place`, `.shell__more li.shell__more-sep` and `.shell__more li.shell__more-sep .shell__divider`, wrapped back in `@media (max-width: 723.98px)`
   Throw if any is missing, or if any rule in the edited file still has the old reset's selector.

React does not reconcile the list's children when More opens or closes, so the inserted li stays. Its clicks bubble to the list's React handler.

**Pages.** Both engines: WebKit (`webkit.launch()`) and system Chrome (harness `launch()`).
- L (layout, coarse): `openApp(..., { coarse: true })` at 393x852 and 723x852, on the Notebook page and on `/ingredients`. Wait for `document.fonts.ready`, then 300ms.
- H (hover, fine): `coarse: false` at 393x852 and 723x852, on the Notebook page.
- T (header, fine): `coarse: false` at 724x900 and 1366x900, on the Notebook page.
- B (board): `openBoard(browser, servers.repoUrl, 'more-tiles-hairline.html', { height: 1708 })`.

**What each page reads.** In L, H and T: the base reading first (the dist as is), then the fix reading. Open More with a tap in L and a click in H; wait for `.shell__more[open]`; blur the active element. Close it again before applying the fix. The in-page reader returns:
- the panel `.shell__more > ul`: its box, border, padding, and the tab row's top
- each item (`li > a, li > button`): text, tag, box, `border-top-width` and style, padding-left and right, background, font-weight
- the separator li's box, its `aria-hidden`, and whether it holds any `a, button, input, [tabindex]`
- the hr's box, its border-top width, style and colour, and its four margins
- the resolved `--gap-xs`, `--app-divider`, `--app-surface-subtle`, `--focus-outline-width` and `--focus-outline-offset` (through a temporary element, as uo6 does)
- the five tab row stops' boxes, with More closed
- on `/ingredients`: the current tile's ink left and right insets, using a Range over its contents and taking the line rects wider than 20 and shorter than 30, as Sid did
- with Import focused by `el.focus()`: outline style, width and offset, and the ring box (the box grown by width plus offset)
- in H and T: for Import and Export, `matches(':hover')`, `border-top-width` and the box, at rest and after `locator.hover()`. Move the mouse to (5, 5) between buttons.

Print every reading as a table per engine, width and route.

**Gates.** Use `ck`/`finish`, so exit 1 lists every failure. Tolerance is 0.1 against Sid's one-decimal numbers and 0.01 for relations, unless stated. A miss prints both numbers. It is a failure, never loosened.
- **G-pre (every page).**
  - Exactly one old-reset rule was deleted.
  - No sheet had a `button.shell__place` rule before the fix.
  - No `.shell__more-sep` existed before the insert, and exactly one exists after it.
- **G0, calibration (L, 393, Notebook page, base).** Sid's as-built numbers from the table, in both engines: panel, the three links, and Import and Export with border 1px solid. If G0 fails, the build or the context differs from Sid's. Report what was read plainly; do not chase it.
- **G1, panel (L, fix).**
  - Size per the table (engine, route; the same at 393 and 723).
  - Its right edge equals `innerWidth`.
  - (Tab row top minus panel bottom) equals its base value.
  - Border `1px solid` in `--app-divider`; padding 12px.
- **G2, tiles (L, fix).**
  - All five items have the same width, equal to the panel's width minus 26 (two 1px borders and 12px padding each side).
  - Widths and heights per the table.
  - Every item's `border-top-width` is 0px.
  - Padding-left and padding-right equal `--gap-xs`.
  - Import and Export are `button`s with Search's width.
- **G3, the current place (L, /ingredients, fix).** Ingredients has `aria-current="page"`, its background is `--app-surface-subtle`, its weight is 600, and its ink insets are 6 on each side (tolerance 0.1).
- **G4, the rule (L, fix).**
  - The li: `aria-hidden="true"`, 1px tall, holding no control.
  - The hr: as wide as the tiles, 1px tall, border-top 1px solid in `--app-divider`. Margins: top and bottom equal `--gap-xs`, left and right 0.
  - Search's bottom to the hr's top is 6. The hr's bottom to Import's top is 6.
- **G5, the ring (L, fix, Import focused).**
  - The outline is solid; its width and offset equal the two focus tokens.
  - Ring top minus hr bottom is 2.
  - (Panel right minus 1) minus ring right is 8. Ring left minus (panel left plus 1) is 8.
  - The ring bottom is at or above (panel bottom minus 1).
- **G-tabs (L, fix).** The five tab row stops' boxes equal base. The tab row is untouched.
- **G6, More's hover (H).**
  - Base control: Import `matches(':hover')` is true and its border goes from 1px to 2px. This proves hover was entered.
  - Fix: for Import and Export, `matches(':hover')` is true, the border is 0px at rest and under hover, and the box under hover equals the box at rest.
- **G7, the header (T).**
  - Base: Import and Export have border 0 at rest and under hover.
  - Control, after step 1 only (rule deleted, no fix added): Import's `border-top-width` is greater than 0. This proves the new rule, not the old one, holds border 0.
  - Fix (steps 2 and 3 added): border 0 at rest and under hover. The rest box equals the base rest box, and the hover box equals the base hover box. The hover shrink is unchanged; print it beside Sid's 1366 numbers.
- **G8, taps (L, Notebook page, fix, 393 and 723).** Open More by a tap before each step, and after each tap wait up to 2s for the details to close.
  - A tap at the hr's centre closes More.
  - Import: a `filechooser` event fires, More closes, and exactly one `input[type=file]` exists.
  - Export: a `download` event fires and More closes.
  - Kitchen, then Ingredients, then Search last: each closes More.
- **G9, the board beside the build (B, same engine).** Read each window `.fp-mt-<393|723>-<rest|cur|ring>`: the panel's box, the five items' boxes, the hr's box, and the two 6px gaps. They must equal the fix readings at the same width: rest and ring against the Notebook page, cur against /ingredients. Tolerance 0.1.

Save crops (the window's bottom 360px) of the fix state, at rest, on Ingredients and with Import focused, at 393 and 723 per engine, and the board's matching windows, to `os.tmpdir()` as `vpr-*.png`. Print their paths.

Run `node .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs`, then the full `npm --prefix app test`. Never change the code to chase Sid's number without reporting it. Do not commit the probe or the SUMMARY; they go in the orchestrator's docs commit.

Write `261004-vpr-SUMMARY.md` in plain English and short sentences:
- **What changed.** The four commits; the tests added and amended; the files.
- **Where the brief and the code disagreed.**
  - The root-scope test admitted only `.shell`, `.place` and `html`. It now names `button.shell__place` as its one other exception, because the brief's selector and its (0,1,1) tie with `button:hover` are the point.
  - Any reading that differs from Sid's or from the board, with both numbers. If none, say so.
- **The readings** per engine, width and route, and each gate's result.
- **The method.** The existing build (app/dist, read only, ephemeral 127.0.0.1 ports). In each page the old rule was deleted from the CSSOM, the separator was set by a DOM edit, and the edited source's own rules were added. No build, no Vite, :4173 untouched. A DOM edit is not a build.
- **The consequence:** Mark's running preview does not show this until `npm --prefix app run build` runs.
- **Still open, not touched:** the header's hover shrink (its todo row); the Import error list and panel (decision 52); the notice stacking (decision 53, the next quick).
- **Not verified:** the iPhone and the iPad; the sticky hover after a tap on iOS; VoiceOver.
- **A `## Deferred Human Verification` section.** Suggested device checks, served from `npm --prefix app run build && npm --prefix app run preview -- --host`:
  - iPhone, a Notebook page, More open: five tiles of one width with the icon over the word. Import and Export have no dark border. A light hairline sits between Search and Import.
  - iPhone, on Ingredients: the current tile's grey surface has room around the word.
  - iPhone: tap Import (the file picker opens), tap Export (the file is offered), tap the hairline (More closes).
  - iPhone with VoiceOver: More's list reads five items, and the hairline is not announced.
  - iPad from 724 and the Mac: the header's Import and Export look as before, with no border.

The executor files no Mark's List rows; it lists the checks only. Do not touch or stage `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/`, `.planning/STATE.md` or `.planning/todos/`. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test && node .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs && test -f .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-SUMMARY.md && grep -q "Deferred Human Verification" .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-SUMMARY.md && test -z "$(git status --porcelain app/)" && TOUCHED="$(git log --name-only --format= --grep='261004-vpr')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/ui/(Shell\.jsx|Shell\.test\.jsx|Shell\.flyout\.test\.jsx)$|^app/src/styles/(shell\.css|shell\.test\.js)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/(sketches|canvas-generators|todos)/|^\.planning/STATE\.md$|^\.impeccable/'</automated>
  </verify>
  <done>The probe exits 0, or the SUMMARY lists every failing gate with both numbers. The full suite passes. The working tree under app/ is clean. The 261004-vpr commits touch only Shell.jsx, shell.css and their three test files. The SUMMARY carries:
- the root-scope exception
- the readings and the method
- the no-build consequence
- what stays open
- the device checks</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| component to rendered page | One static, aria-hidden li with an hr, and five CSS rules. No new input, no stored state, no markup from data. |
| probe to local servers | The probe serves the existing app/dist on ephemeral 127.0.0.1 ports and drives throwaway contexts. It edits the page's DOM and CSSOM only. Import opens a file chooser that is never answered. Export downloads into Playwright's temporary folder. |
| executor to the shared working tree | Sid's uncommitted files are in the tree (`.planning/canvas-generators`, `.planning/sketches`, `.impeccable`). |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-vpr-01 | Denial of Service | Mark's :4173 preview, :5173, :8011, app/dist | low | mitigate | No build and no Vite process. The harness binds ephemeral 127.0.0.1 ports and aborts every other host. app/dist is served read only, and every change is made in the page, never on disk. |
| T-vpr-02 | Tampering | other agents' files in the shared tree | medium | mitigate | Commits by explicit path, never `git add -A`, with `git diff --cached --name-only` before each one. Task 3's verify fails if any 261004-vpr commit touches an app/ file outside Shell.jsx, shell.css and their three tests, or anything under `.planning/sketches`, `.planning/canvas-generators`, `.planning/todos`, `.planning/STATE.md` or `.impeccable`. |
| T-vpr-03 | Tampering | Mark's IndexedDB | low | mitigate | Every probe context is a throwaway Playwright context on an ephemeral origin, seeded by the build. Export only reads the store. Import's chooser is never given a file. |
| T-vpr-04 | Information Disclosure | Export in the probe | low | accept | The exported file holds only the build's seed data, in a throwaway context, and lands in Playwright's temporary download folder. |
| T-vpr-05 | Repudiation | measured numbers against the brief | low | mitigate | G0 checks against Sid's as-built readings first. G9 checks the build against the board. Gates are never loosened. The root-scope exception is named in the SUMMARY. |
| T-vpr-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. The probe uses the Playwright already in the npx cache, which the uo6 and uyd probes used. |
</threat_model>

<verification>
- `npm --prefix app test` passes (full suite, including tabindex-scan).
- `node .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs` exits 0, or its failures are listed in the SUMMARY with both numbers.
- `git log --format=%s --grep='261004-vpr'` shows two test commits, each before its feat commit.
- `git status --porcelain app/` is empty. No commit touches a file outside the allowed set.
</verification>

<success_criteria>
- **Decision 55:**
  - Below 724, More's five items are the tab row's tiles at one width, with 6px side padding.
  - Import and Export are borderless and as wide as the rest.
  - A full-width hairline separates Search from Import. A tap on it closes More.
- **The reset:** `button.shell__place` replaces the tools row's reset. The header's Import and Export keep border 0, and their hover size is unchanged.
- **Measured:**
  - WebKit coarse at 393 and 723: panel 101.5 x 284 (105.2 on /ingredients), tiles 75.5 x 49 (79.2), the rule 6px from each tile.
  - Import's ring clears the rule by 2px.
  - Hover moves nothing.
  - Chrome per Sid's numbers. The board matches the build.
- **Unchanged:** the tab row's tiles and ring, the rail and its dividers, the fly-out, app.css, tokens.css, the Import error list, the notice.
- **Process:** test first for both changes, the suite green, the commits scoped, no build, no push, no Mark's List rows.
</success_criteria>

<output>
Create `.planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-SUMMARY.md` when done.
</output>
