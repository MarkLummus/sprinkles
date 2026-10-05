---
phase: quick-261004-wib
plan: 01
quick_id: 261004-wib
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/Shell.jsx
  - app/src/ui/Shell.test.jsx
  - app/src/ui/Shell.flyout.test.jsx
  - app/src/styles/shell.css
  - app/src/styles/shell.test.js
  - app/src/styles/tokens.css
  - app/src/styles/cross-cutting.test.js
  - .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-probe.mjs
  - .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md
autonomous: true
requirements: [UX1-01, UX1-03]

estimate:
  tokens: 110000
  raw_tokens: 110000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Decision 52 B (Mark, 2026-10-05): a failed import shows a panel over the page, not a list inside the bar. From 724 it is fixed 6px under the bar at the right gutter, 480px wide, under Import. The sticky bar stays 57px with 1, 3 or 49 lines, and the page does not move. Below 724 it is fixed above the tab row at the page gutters (353px wide at 393) and stays in view wherever the page is scrolled."
    - "The panel reads: the title 'This file can’t be imported', a count ('3 problems found'; '1 problem found' for one line), the validator's lines exactly as worded, and a Close button. Six lines show, then the list scrolls inside the panel. WebKit coarse: 130px high with 3 lines and 184 with 49 from 724; 148 and 184 at 393."
    - "Decision 52, Mark's answer (2): the panel goes on Close, on Escape (when the fly-out is not open), on a successful import, or on a page change. Nothing else closes it."
    - "Decision 53 B (Mark, 2026-10-05): the page notice moves under the scrim and the panels. --app-z-notice goes from 10 to 3. The stack is page 1, 2 < notice 3 < scrim 4 < fly-out 5 < Import error panel 6 < bar 11. tokens.css states it in one comment, and shell.test.js pins it. With the fly-out open, Home and its focus ring are clear, the notice is dimmed beside the panel, and it shows bright again once the panel closes."
    - "Decision 55, Mark's answer: More's list reads Ingredients, Kitchen, the hairline, Search, Import, Export. Only the rule moves. The panel keeps its size: WebKit 101.5 x 284 (105.2 x 284 on /ingredients), Chrome 97.6 x 279 (102.4 x 280). Tiles stay 75.5 x 49, with the rule 6px under Kitchen and 6px over Search."
    - "Every link and button keeps tabIndex={0}. No dangerouslySetInnerHTML. Every visual value reads a token. The header's hover shrink, the Sheet, the Batch fold, the tab ring and the tiles' sizes are unchanged. Each test is committed before its code, and `npm --prefix app test` passes. No build, no Vite process. app/dist and :4173 are read only."
  artifacts:
    - path: app/src/ui/Shell.jsx
      provides: "the Import error panel rendered after the header (title, count, Close, list), its four ways to close, and the More separator moved before Search"
      contains: "className=\"shell__import-errors\" role=\"alert\""
    - path: app/src/styles/shell.css
      provides: "the panel's top-level rules (panel, head, title, count, list) and its phone-block placement; the stale tools-row comment rewritten"
      contains: ".shell__import-errors-list {"
    - path: app/src/styles/tokens.css
      provides: "the one stacking-order comment; --app-z-notice 3; --app-z-import-errors 6; the panel's width and two leadings"
      contains: "--app-z-import-errors: 6;"
    - path: app/src/styles/shell.test.js
      provides: "the new z order, the notice at 3, the panel's rules and tokens, the amended phone allowlist and radius list"
      contains: "--app-z-import-errors"
    - path: app/src/ui/Shell.flyout.test.jsx
      provides: "jsdom: the panel's place and words, verbatim lines, Close (with focus return), Escape (alone and with the fly-out), a route change, a good import"
      contains: "shell__import-errors"
    - path: app/src/ui/Shell.test.jsx
      provides: "the separator after Kitchen and before Search"
      contains: "Kitchen</a></li><li class=\"shell__more-sep\""
    - path: .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-probe.mjs
      provides: "the WebKit and Chrome probe on the existing build: in-page rules, tokens and DOM edits; no build"
  key_links:
    - from: app/src/ui/Shell.jsx
      to: app/src/styles/shell.css
      via: "div.shell__import-errors (head, title, count, list) carries the classes the new rules style; the Close is a button.shell__place, reset by the existing top-level rule"
      pattern: "shell__import-errors"
    - from: app/src/styles/shell.css
      to: app/src/styles/tokens.css
      via: "the panel reads --app-z-import-errors, --app-size-import-errors-w, --app-import-errors-title-leading and --app-import-errors-leading; .page-status (app.css) reads --app-z-notice, now 3"
      pattern: "--app-z-import-errors"
    - from: app/src/ui/Shell.jsx
      to: "the fly-out's capture-phase Escape listener"
      via: "the panel's Escape listener is registered only while errors show and the fly-out is closed, because two capture listeners on document both run despite stopPropagation"
      pattern: "importErrors"
---

<objective>
One quick, three parts. Mark decided all three on 2026-10-05, on Mark's List rows build-import-panel-and-notice and build-more-search-below-hairline. They come from sketch 011 README decisions 52, 53 and 55.

1. **Decision 52 B, the Import error panel.** Today the list sits inside the sticky bar and grows it: 754px at 1366 with 49 lines, and nothing dismisses it. The list moves out of the bar into a panel fixed under Import, over the page. The panel has a plain title, a count, six visible lines and then a scroll, and a Close button. From 724 it sits under the bar at the right gutter. Below 724 it sits above the tab row. Mark's answer (2) is that the panel also goes on a page change. It goes on Close, Escape, a good import or a page change. In the stack it sits between the fly-out and the bar.
2. **Decision 53 B, the notice under the scrim.** `--app-z-notice` goes from 10 to 3. The old stack was page 1, 2 < scrim 4 < fly-out 5 < notice 10 < bar 11. The new stack is page 1, 2 < notice 3 < scrim 4 < fly-out 5 < Import error panel 6 < bar 11. tokens.css states it once, and shell.test.js pins it.
3. **Decision 55, Mark's answer: Search below the hairline.** In More's list, the aria-hidden separator `li` moves from before Import to before Search. The coordinator's correction applies. The panel does NOT grow by a tile: the list is five tiles before and after, and only the rule moves. Sid's README decision 55 and the updated board `more-tiles-hairline.html` carry the separator before Search and the unchanged numbers.

tokens.css is in scope even though the brief says "shell only". Decision 53's brief names it, and the panel's z token, width and leadings must live there by the token rule. cross-cutting.test.js gets one comment line, because its comment says "(10)" and would go stale.

Purpose: an import that fails explains itself without burying the page, and it can be dismissed. The page notice stops painting over the open fly-out. More groups Search with Import and Export, as the header does.

Output: edits to Shell.jsx, shell.css and tokens.css, with their tests; a probe and a SUMMARY in this quick directory.

Out of scope (do not touch):
- the header's hover shrink (open row fix-header-import-export-hover-shrink; the `button.shell__place` reset keeps exactly its five declarations)
- the Sheet, the Batch fold, the tab row's ring, and the tiles' own sizes
- app.css
- any rewording of the validator's lines (Mark was not asked)

Never edit or stage `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/`, `.planning/STATE.md` or `.planning/todos/`. Sid works there, and the tree has his uncommitted files. File no Mark's List rows.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read these ranges, not whole large files:
- `.planning/sketches/011-recipe-route-c/README.md`, read only:
  - line 631 (52: what the build does, measured)
  - lines 632 to 637 (52: what is drawn, the brief, Mark's answers)
  - lines 640 to 646 (53)
  - lines 661 to 665 (55: the measured numbers and the brief)
- `app/src/ui/Shell.jsx`: lines 168 to 237 (state and effects, the fly-out's Escape and Tab listener), 256 to 371 (import handler, header, tools, body) and 399 to 431 (More's list).
- `app/src/styles/shell.css`: lines 1 to 30, 178 to 210 (the tools row, the reset, the old `.shell__import-errors` rule), 286 to 354 (the place rules and the ring), 460 to 604 (the phone block).
- `app/src/styles/shell.test.js`:
  - lines 1 to 40 (helpers, `rules`, `tokens`, `appRules`, `PHONE_MEDIA`)
  - 138 to 156 (the phone allowlist)
  - 231 to 240 (the tools-row phone test)
  - 376 to 388 (the radius list)
  - 451 to 461 (the notice token test)
  - 522 to 533 (the z order)
  - 568 to 627 (the exact-declarations style: `declarationsOf`)
- `app/src/styles/tokens.css` lines 370 to 386 (the z tokens), and `app/src/styles/cross-cutting.test.js` lines 842 to 846.
- `app/src/ui/Shell.flyout.test.jsx` (whole, 302 lines: `installMatchMedia`, `mountAt`, `click`, `press`, `EscapeProbe`, `escapeCount`, `header()`, `menu()`).
- `app/src/ui/Shell.test.jsx`: lines 1 to 63 (`renderAt`) and 142 to 175 (More and the separator tests).
- `app/src/styles/app.css`: lines 52 to 75 (`button` and `button:hover`) and 2407 to 2421 (the coarse `button` min-height floor). Read only.
- Probe pattern: `.planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs` (the More readers, gates G1 to G9, hover, taps, board; copy from it) and its SUMMARY (G1's pre-existing 0.031px WebKit right-edge gap). The harness is `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`. It exports `startServers`, `launch` (system Chrome), `openApp(browser, appUrl, route, { width, height, coarse })`, `openBoard(browser, repoUrl, file, { width, height, coarse })`, `check` and `finish`. Copy from these; do not edit them.
- Sid's save-a-version flow for the notice: `.planning/canvas-generators/notice-capture.mjs` lines 9 to 15. Read only.

Facts the planner checked:
- **The dist.** `app/dist` (modified 2026-10-04 23:13, CSS `assets/index-DFWKXtbR.css`) already carries quick vpr:
  - `button.shell__place{...}`
  - one `shell__more-sep` (after Search, before Import)
  - the old rule `.shell__import-errors{margin:...;padding-left:...;...;flex-basis:100%}`
  - `--app-z-notice:10`
- **The gutter.** `--gap-page` is 48px from 724 to 1366 and 20px at 393 (Sid's numbers; the probe reads the token). At 724, the panel spans x 196 to 676, and the open fly-out spans x 0 to 224. They overlap at x 196 to 224.
- **The Close button's height.** Under `(pointer: coarse)`, app.css gives every `button` `min-height: var(--touch-min)`. So the Close (a word with no icon) is 44px tall with a coarse pointer and about 41px with a fine one. Sid's 130 (3 lines) and 184 (49 lines) both come to 2 + 24 + 44 + 6 + list, so he measured coarse. The probe measures coarse, and the board is opened coarse too.
- **Hover.** app.css `button:hover` sets `padding: var(--gap-xs)` at (0,1,1). That beats `.shell__place`'s padding, so under a mouse hover the Close shrinks the way the header's Import does. That is the open todo, and it is not fixed here. The reset keeps border 0.
- **The board's B panel** (`import-errors-placement.html`, scoped `.imp-panel`, the authority for these values):
  - panel: `box-sizing: border-box; background: var(--app-background); border: var(--app-rule-row) solid var(--app-divider); border-radius: var(--app-radius-control); padding: var(--gap-s) var(--gap-s) var(--gap-s) var(--gap-m); font-family: var(--face-grotesk); color: var(--app-text); display: flex; flex-direction: column; gap: var(--gap-xs)`
  - head: `display: flex; align-items: center; justify-content: space-between; gap: var(--gap-s)`
  - title: `margin: 0; font-size: var(--app-size-meta); font-weight: 600; line-height: 1.3`
  - count: `margin: 0; color: var(--app-text-secondary); font-size: var(--app-size-label); line-height: 1.5`
  - list: `margin: 0; padding-left: var(--gap-s); font-size: var(--app-size-label); line-height: 1.5; overflow-y: auto; overflow-wrap: anywhere` and inline `max-height: 9em`
  - placement, inline: from 724 `top: var(--app-size-header-h); right: var(--gap-page); width: 480px; margin-top: var(--gap-xs)`; at 393 `left: var(--gap-page); right: var(--gap-page); bottom: calc(var(--app-size-tab-h) + var(--gap-xs))`
  - Close: `.imp-panel .shell__place { background: none; border: none; color: inherit; cursor: pointer }`. The app's `button.shell__place` reset already covers this.
- **The board's B markup.** `div.imp-panel[role=alert] > div.imp-panel__head > (div > p.imp-panel__title + p.imp-panel__sub) + button.shell__place[type=button][tabindex=0]{Close}`, then `ul.imp-panel__list > li*`. The title is `This file can’t be imported`, with U+2019, as the app's own OLDER_EXPORT_MESSAGE uses. The counts drawn are "3 problems found" and "49 problems found"; the board draws no one-line case. The B windows are `.fp-B-older-1366`, `.fp-B-many-1366`, `.fp-B-older-724`, `.fp-B-older-393` (the page scrolled 400px) and `.fp-B-many-393`. The board's preview is 4482 x 3670.
- **Sid's import files** (`.planning/canvas-generators/`, read only; embed their text in the probe):
  - `imp-older.json` is `{"schemaVersion": 3, "recipes": [], "versions": [], "batches": []}` (3 lines)
  - `imp-many.json` is `{"schemaVersion": 6, "recipes": [{}, {"id": "r1"}], "versions": [{"id": "v1", "rows": [{"id": "x", "ingredientName": 3, "portions": [], "ingredient": {}, "removed": "no"}], "method": [{"n": "a", "uses": 3, "targets": 1}]}, {}], "batches": [{}]}` (49 lines)
- **The validator.** `validateStoreFile` is exported from `app/src/store/transfer.js`. `importStore` validates before it makes any repository call, so an invalid file never reaches the mocked `repository: {}`.
- **Escape with two capture listeners.** The fly-out's Escape listener is capture-phase on `document` and calls `stopPropagation`. A second capture listener on `document` would still run (same node). So the panel's listener must not exist while the fly-out is open.
- **More and the panel at 393 (not drawn).** More's open list spans about x 291.5 to 393 and y 513 to 797. The panel (3 lines) spans x 20 to 373 and y 642 to 790. The tab row has no z-index, so the panel (z 6) covers Search, Import and Export when both are open. The probe reads it, and the SUMMARY reports it. Nothing here fixes it.
- **The routes.** The Notebook page is `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1`. `/ingredients` makes Ingredients current.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The Import error panel (decision 52) and the notice under the scrim (decision 53), end to end</name>
  <files>app/src/ui/Shell.flyout.test.jsx, app/src/styles/shell.test.js, app/src/styles/cross-cutting.test.js, app/src/ui/Shell.jsx, app/src/styles/shell.css, app/src/styles/tokens.css</files>
  <behavior>
    jsdom (Shell.flyout.test.jsx). A failed import is driven by giving `input.shell__file-input` a `files` property via `Object.defineProperty` (one object whose async `text()` returns the content). Dispatch a bubbling `change`, then flush a tick inside `act`.
    - At rest no `.shell__import-errors` exists.
    - **At 1024, a file that is not JSON:**
      - `div.shell__import-errors` with `role="alert"` is `header.shell__head`'s next element sibling. The header holds no `.shell__import-errors` and no `ul`.
      - The title `p.shell__import-errors-title` reads exactly `This file can’t be imported`. The count `p.shell__import-errors-count` reads `1 problem found`.
      - `ul.shell__import-errors-list` holds one li, `$: the file is not valid JSON`.
      - The Close is a `button.shell__place`, type button, tabindex "0", text `Close`.
      - No element in the panel has a `style` attribute.
    - **Sid's older-export content (3 lines):** the count reads `3 problems found`. The li texts equal `validateStoreFile(JSON.parse(content)).errors`, in order and verbatim.
    - **Repeated lines and markup text** (importStore mocked once to fail with `['Same line', 'Same line', '<b>tag</b>']`):
      - three li
      - the third li's textContent is `<b>tag</b>`, and no `b` element exists
      - `console.error` saw no duplicate-key warning
    - **Close moves focus back** when focus was on it:
      - at 1024: the panel goes, and focus moves to the header's Import button
      - at 393: the panel goes, and focus moves to More's summary
      - a Close clicked while focus is on `body`: the panel goes, and focus stays on `body`
    - **Escape** at 1024 with the fly-out closed: the panel goes, and EscapeProbe's count stays 0. The next Escape reaches the probe (1).
    - **Escape with the fly-out open and the panel showing:**
      - the first Escape closes only the fly-out (the panel stays, focus moves to the menu button)
      - the second Escape closes the panel
      - the probe count stays 0 until a third Escape (1)
    - **A route change:** mount at /notebook, fail an import, click the wordmark (`.shell__brand a`). The page goes to /, and the panel goes.
    - **A good import after a failure** (importStore mocked once to `{ ok: true }`): the panel goes.
    CSS and tokens (shell.test.js; exact declarations with `declarationsOf`, sorted where a rule holds many):
    - The top-level `.shell__import-errors` declares exactly:
      - `position: fixed`, `z-index: var(--app-z-import-errors)`
      - `inset-block-start: var(--app-size-header-h)`, `inset-inline-end: var(--gap-page)`
      - `width: var(--app-size-import-errors-w)`, `margin-block-start: var(--gap-xs)`
      - `box-sizing: border-box`, `display: flex`, `flex-direction: column`, `gap: var(--gap-xs)`
      - `padding: var(--gap-s) var(--gap-s) var(--gap-s) var(--gap-m)`
      - `background: var(--app-background)`, `border: var(--app-rule-row) solid var(--app-divider)`, `border-radius: var(--app-radius-control)`
      - `font-family: var(--face-grotesk)`, `color: var(--app-text)`
    - The phone-block `.shell__import-errors` declares exactly `inset-block-start: auto`, `inset-block-end: calc(var(--app-size-tab-h) + var(--gap-xs))`, `inset-inline: var(--gap-page)`, `width: auto` and `margin-block-start: 0`.
    - `.shell__import-errors-head` has the board's head values.
    - `.shell__import-errors-title` declares `margin: 0`, `font-size: var(--app-size-meta)`, `font-weight: 600` and `line-height: var(--app-import-errors-title-leading)`.
    - `.shell__import-errors-count` declares `margin: 0`, `color: var(--app-text-secondary)`, `font-size: var(--app-size-label)` and `line-height: var(--app-import-errors-leading)`.
    - `.shell__import-errors-list` declares `margin: 0`, `padding-left: var(--gap-s)`, `font-size: var(--app-size-label)`, `line-height: var(--app-import-errors-leading)`, `max-height: calc(6 * var(--app-import-errors-leading) * 1em)`, `overflow-y: auto` and `overflow-wrap: anywhere`.
    - No rule declares `flex-basis` on any `.shell__import-errors` selector.
    - No rule targets the Close by itself. No selector combines `.shell__import-errors` with `button` or `.shell__place`.
    - The tokens: `--app-size-import-errors-w` is `480px`, `--app-import-errors-title-leading` is `1.3` and `--app-import-errors-leading` is `1.5`.
    - The z order (title names decision 53): every literal z-index in app.css < `--app-z-notice` < `--app-z-scrim` < `--app-z-flyout` < `--app-z-import-errors` < `--app-z-header`. `--app-z-notice` is `3` and `--app-z-import-errors` is `6`.
    - Amended:
      - the notice test expects `3` and still finds `.page-status` reading the token
      - the phone allowlist admits the exact selector `.shell__import-errors`
      - the tools-row phone test now says the panel's phone rule places it above the tab row and hides nothing (no `display: none`); `.shell__tools` and `.shell__file-input` still have no phone rule
      - the radius list becomes `['.shell__brand a', '.shell__import-errors', '.shell__menu', '.shell__place', '.shell__sprinkle']`, and the panel reads `--app-radius-control`
    - Unchanged and passing: the reset's five declarations, the three focus rules, no bare px, the two media blocks, tokens.test.js (every new token is read), tabindex-scan.test.js, and the 19-stop count in Shell.test.jsx (the panel is not rendered at rest).
  </behavior>
  <action>
**RED. Write the tests first.**

In `app/src/ui/Shell.flyout.test.jsx`:
- Add one line to the header comment: the file also holds the Import error panel's behaviour (sketch 011 decision 52 B, Mark 2026-10-05).
- Mock `../store/transfer.js` file-wide with `importOriginal`: spread the real module and replace `importStore` with `vi.fn(actual.importStore)`, so it calls through by default. The fly-out tests never import, so they are unaffected. Import `importStore` and `validateStoreFile` from the module. Tests that need a set result use `vi.mocked(importStore).mockResolvedValueOnce(...)`.
- Add a helper that fails an import as the behavior block says. Reuse `mountAt`, `click`, `press`, `header()`, `menu()`, `EscapeProbe` and `escapeCount`.
- Add a describe titled "The Import error panel (sketch 011 decision 52 B; Mark 2026-10-05)" with the jsdom behaviours above. For the duplicate-key check, spy on `console.error` with `vi.spyOn` and restore it.

In `app/src/styles/shell.test.js`:
- Add a describe titled "The Import error panel (sketch 011 decision 52 B; Mark 2026-10-05)" with the CSS and token tests.
- Amend the four existing tests named in the behavior block.
- Retitle the z-order test to "the z order (decision 53): every literal z-index in app.css < notice < scrim < fly-out < Import error panel < bar" and assert that chain.

In `app/src/styles/cross-cutting.test.js`, change only the comment at line 844: `.page-status` reads `--app-z-notice` (3), a layer of the page under the scrim and the fly-out (sketch 011 decision 53); shell.test.js pins the 3 and the order. No assertion changes.

Run `npm --prefix app test -- src/ui/Shell.flyout.test.jsx src/styles/shell.test.js src/styles/cross-cutting.test.js`. Confirm the new and amended tests fail for the right reason: no panel, the old rule, notice 10, no new tokens. Confirm every older test passes. Stage the three test files by explicit path, then check `git diff --cached --name-only`. Commit as `test(261004-wib): pin the Import error panel and the notice under the scrim`. End the message with these two lines:
- `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
- `Claude-Session: https://claude.ai/code/session_01DnSshE2JfScJcTaMMxNapN`

**GREEN.**

`app/src/styles/tokens.css`, the z block at lines 380 to 383:
- Put one block comment above the z tokens that states the whole stack once, lowest first: the page's own literals 1 and 2 (app.css), the page notice 3, the fly-out's scrim 4, the fly-out 5, the Import error panel 6, the sticky bar 11. Cite sketch 011 decisions 33, 52 and 53 (Mark, 2026-10-05) and say that shell.test.js pins the order.
- Declare the five tokens in that order. Each has a short trailing comment naming only what it is, without restating the order:
  - `--app-z-notice: 3` (the page notice, .page-status: a layer of the page)
  - `--app-z-scrim: 4`
  - `--app-z-flyout: 5`
  - `--app-z-import-errors: 6` (the Import error panel)
  - `--app-z-header: 11`
- Beside them, add these, each with a comment citing the board `import-errors-placement.html` B:
  - `--app-size-import-errors-w: 480px` (the panel's width from 724)
  - `--app-import-errors-title-leading: 1.3`
  - `--app-import-errors-leading: 1.5` (the count and the lines)

`app/src/ui/Shell.jsx`:
- Remove the `ul.shell__import-errors` from `.shell__tools`. The file input stays where it is.
- Between `</header>` and `<div className="shell__body">`, render the panel only while `importErrors.length > 0`:
  - a `div` with `className="shell__import-errors"`, `role="alert"` and a ref (for example `importErrorsRef`)
  - holding `div.shell__import-errors-head`, which holds a plain `div` with `p.shell__import-errors-title` (`This file can’t be imported`, U+2019) and `p.shell__import-errors-count`
  - then the Close: `<button type="button" className="shell__place" tabIndex={0} onClick={closeImportErrors}>Close</button>`, no icon, as the board draws it
  - then `ul.shell__import-errors-list` with one li per line, `key` the index (decision 52's brief: repeated lines stay safe), and the line as a text child
- The count reads `${n} problems found`, or `1 problem found` for one line. The board draws only plural counts. The singular is this plan's grammar, and the SUMMARY names it.
- Above the panel, a short JSX comment in plain words:
  - the Import error panel (sketch 011 decision 52 B, Mark 2026-10-05), fixed under Import from 724 and above the tab row below it, over the page, so the bar never grows
  - it stays until Close, Escape, a good import or a page change
  - its place in the stack is in tokens.css
- Add `const importRef = useRef(null)` on the header's Import button (`ref={importRef}`) and the panel's ref.
- `closeImportErrors()` mirrors `closeMore` and `closePlaces`. It reads whether `document.activeElement` is inside the panel, calls `setImportErrors([])`, and only then, if focus was inside, focuses `moreSummaryRef` below 724 (`below724`) or `importRef` from 724. This follows the file's own two precedents. The README does not say where focus goes, and the SUMMARY names this as the plan's choice.
- Add `setImportErrors([])` to the existing `[pathname]` effect (Mark's answer 2: the panel goes on a page change). Keep that effect's shape, because Shell.test.jsx pins `useEffect(() => {...}, [pathname]);`.
- Add one effect for Escape, registered only while errors show AND the fly-out is not open (deps: whether errors show, `open`, `below724`). Use a capture-phase `keydown` listener on `document`. On Escape it calls `stopPropagation`, then `closeImportErrors()`.
  - Why the guard: the fly-out's capture listener is also on `document`, and `stopPropagation` does not stop a second listener on the same node. Without the guard, one Escape would close both.
- Update the import handler's comment, "the errors render as text", to say they render in the Import error panel.
- Change nothing else: the fly-out, More, Export and the tab row stay as they are.

`app/src/styles/shell.css`:
- Replace the old top-level `.shell__import-errors` rule in place (after `.shell__file-input`) with the five top-level rules in the behavior block: panel, head, title, count, list.
- Put one comment above them: the Import error panel (sketch 011 decision 52 B, Mark 2026-10-05; the board `import-errors-placement.html` B), fixed 6px under the bar at the right gutter, under Import, over the page, so the bar stays 57px.
- Comment on the list rule: six lines at the list's own leading, then it scrolls.
- The Close has no rule of its own. It is a place, and `button.shell__place` resets it.
- In the phone block, next to the tools-row rule, add the phone `.shell__import-errors` rule with a comment: below 724 it is fixed above the tab row at the page gutters, so it shows wherever the page is scrolled.
- Rewrite the tools-row comment above `.shell__tools > .shell__place` so it no longer says the errors list lives there. The row stays because the shared hidden file input lives in it. Its rule is unchanged.
- Write every declaration as `property: value;` on its own line, as the file does.

Run the three test files, then `src/styles/tokens.test.js`, `src/ui/Shell.test.jsx` and `src/ui/tabindex-scan.test.js`, then the full `npm --prefix app test`.
- If another test fails only because it pinned the notice's 10 or the old list's place, update it and name it in the SUMMARY.
- Any other failure: stop and report it; do not work around it.

Stage `app/src/ui/Shell.jsx`, `app/src/styles/shell.css` and `app/src/styles/tokens.css` (and any test so updated) by explicit path. Check `git diff --cached --name-only`. Commit as `feat(261004-wib): the Import error panel under Import, and the notice under the scrim`, with the same two trailer lines.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/Shell.flyout.test.jsx src/ui/Shell.test.jsx src/styles/shell.test.js src/styles/tokens.test.js src/styles/cross-cutting.test.js src/ui/tabindex-scan.test.js && SUBJECTS="$(git log --reverse --format=%s --grep='261004-wib')" && printf '%s\n' "$SUBJECTS" | grep -E 'Import error panel' | head -1 | grep -q '^test(261004-wib): pin the Import error panel' && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-wib): the Import error panel under Import'</automated>
  </verify>
  <done>
- The test commit comes before the feat commit. The six named test files and the full suite pass.
- A failed import renders the panel as the header's next sibling, never inside the bar, with the title, the count, the lines verbatim and a Close.
- The panel goes on Close (focus returns to the opener when it was inside), on Escape (only when the fly-out is closed), on a route change and on a good import.
- tokens.css states the stack once (notice 3, scrim 4, fly-out 5, Import error panel 6, bar 11), and shell.test.js pins it.
- The panel reads only tokens. The old list rule and its flex-basis are gone. The stale tools-row comment is rewritten.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Search below the hairline in More (decision 55, Mark's answer)</name>
  <files>app/src/ui/Shell.test.jsx, app/src/ui/Shell.jsx</files>
  <behavior>
    - Static (Shell.test.jsx, `renderAt('/')`, the `details.shell__more` match):
      - the More markup contains `Kitchen</a></li><li class="shell__more-sep" aria-hidden="true"><hr class="shell__divider"/></li><li><a `
      - the first `<a ...>` tag after the separator carries `href="/search"`
      - the markup does not contain `Search</a></li><li class="shell__more-sep"`
    - Static: inside More's markup the order is Ingredients, Kitchen, `shell__more-sep`, Search, Import, Export (by index).
    - Unchanged and passing:
      - one `shell__more-sep`, and three `class="shell__divider"`, the rail's two still aria-hidden
      - 19 `shell__place` stops, each with tabindex="0", and `tabindex="-1"` only on the file input
      - the jsdom tap on the rule closes More (Shell.flyout.test.jsx)
      - shell.test.js (it pins the separator's rules, not its place; confirm with a grep and change nothing there)
  </behavior>
  <action>
**RED.** In `app/src/ui/Shell.test.jsx`, change the test at line 160 ("puts the separator item right after Search and right before Import...") to the behaviour above. Retitle it "puts the separator item right after Kitchen and right before Search, with the board's exact markup (decision 55, Mark: Search below the hairline)". Add the order test to the same describe. Grep `app/src/styles/shell.test.js` and `app/src/ui/Shell.flyout.test.jsx` for any pin of the separator's place beside Search or Import. There should be none; if there is one, change it in this commit and name it in the SUMMARY.

Run `npm --prefix app test -- src/ui/Shell.test.jsx` and confirm the changed test fails because the separator still follows Search. Stage the test file by explicit path, check `git diff --cached --name-only`, and commit as `test(261004-wib): pin Search below the More hairline`, with the same two trailer lines.

**GREEN.** In `app/src/ui/Shell.jsx`, move the separator `li` and the JSX comment above it from between Search's `li` and Import's `li` to between Kitchen's `li` and Search's `li`. The list now reads Ingredients, Kitchen, separator, Search, Import, Export. Keep the separator's markup and attribute order exactly. Reword the comment in plain words: the hairline between the places (Ingredients, Kitchen) and Search, Import and Export, grouped as the header groups them (sketch 011 decision 55; Mark 2026-10-05, Search below the hairline). It is the rail's own divider, hidden from assistive tech, and a tap on it closes More like any tap in the list. Search stays the same `NavLink` with `tabIndex={0}`. No CSS changes: the README measured that the panel keeps its size, because only the rule moves (coordinator's correction).

Run `src/ui/Shell.test.jsx`, `src/ui/Shell.flyout.test.jsx`, `src/styles/shell.test.js` and `src/ui/tabindex-scan.test.js`, then the full `npm --prefix app test`. Stage `app/src/ui/Shell.jsx` by explicit path, check `git diff --cached --name-only`, and commit as `feat(261004-wib): Search below the More hairline`, with the same two trailer lines.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/Shell.test.jsx src/ui/Shell.flyout.test.jsx src/styles/shell.test.js src/ui/tabindex-scan.test.js && SUBJECTS="$(git log --reverse --format=%s --grep='261004-wib')" && printf '%s\n' "$SUBJECTS" | grep -E 'Search below the More hairline' | head -1 | grep -q '^test(261004-wib): pin Search below the More hairline' && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-wib): Search below the More hairline'</automated>
  </verify>
  <done>The test commit comes before the feat commit. More's list renders Ingredients, Kitchen, the separator, Search, Import, Export, with the separator's markup unchanged. The suite passes, and no CSS changed.</done>
</task>

<task type="auto">
  <name>Task 3: Measure all three in WebKit and Chrome on the existing build, then write the SUMMARY</name>
  <files>.planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-probe.mjs, .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md</files>
  <precondition>app/dist is the 2026-10-04 23:13 build that predates this quick. Its CSS has `.shell__import-errors{...flex-basis:100%}`, `--app-z-notice:10`, `button.shell__place{...}`, and no `shell__import-errors-list`. Its More list has one `.shell__more-sep` right after Search's item. The probe's G-pre asserts all of it and stops if not.</precondition>
  <action>
Create `261004-wib-probe.mjs` in this quick directory, modelled on the vpr probe. Same imports:
- `webkit` from `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`
- from the 03.5 harness: `startServers`, `launch`, `openApp`, `openBoard`, `check`, `finish`
- `readAllRules` and `readCustomProperties` from `../../../app/src/styles/css-source.js`

It serves the existing `app/dist` read only with `startServers()`. No build, no Vite, never :4173, :5173 or :8011. Run both engines: WebKit (`webkit.launch()`) and system Chrome (harness `launch()`). Pages are coarse unless stated, at 900 high, or 852 at 393 (Sid's windows). Wait for `document.fonts.ready` and 300ms before reading.

The dist predates this quick, so the fix state is made in each page. Wait two animation frames after each step.

**Fix inputs, read from the edited source.** Throw on anything missing.
- TOKENS: a `:root` style with the edited tokens.css values for the five z tokens, `--app-size-import-errors-w` and the two leadings (via `readCustomProperties`).
- PANEL_CSS: every rule in the edited shell.css whose selector starts with `.shell__import-errors`, top-level and phone. Wrap the phone rules back in `@media (max-width: 723.98px)`.
- Also assert that `Shell.jsx`'s source contains each `className` the probe builds (`shell__import-errors`, `-head`, `-title`, `-count`, `-list`), so a rename fails loudly.

**Part A, the Import error panel (decision 52).** Notebook page, at 1366, 1024, 724 and 393. Use three files with `setInputFiles('.shell__file-input', { name, mimeType: 'application/json', buffer })`: a text that is not JSON (1 line), Sid's older-export text (3 lines) and Sid's wrong-shaped text (49 lines). Read the no-errors base first in each page.

Base, the dist as is: read the bar's height, the top of the first heading in `main.shell__main`, and the old list's li count and texts.

Fix steps, in each page:
1. Delete the dist's CSSOM rule whose `selectorText` is `.shell__import-errors`; exactly one.
2. Neutralise the old `ul`: remove its class attribute and set `hidden`. Do not remove the node; React still holds it.
3. Insert, after `header.shell__head`, the panel markup Shell.jsx renders, built with `createElement` and `textContent`, never innerHTML. Its lines are the old list's li texts, and its count uses the same grammar.
4. Add TOKENS and PANEL_CSS with `addStyleTag`.

Gates (`ck`/`finish`; a miss prints both numbers and is a failure, never loosened):
- **G-pre.** The precondition above, per page.
- **G-A0, calibration (base, WebKit).** The line counts are 1, 3 and 49. The bar heights are Sid's, within 1px:
  - older file: 64 at 1366, 79 at 1024, 169 at 724, 128 at 393
  - wrong-shaped file: 754 at 1366, 1024 at 1024, 1384 at 724, 1133 at 393
  - Chrome, wrong-shaped file: 705 at 1366 and 1321 at 724
  - If G-A0 fails, report the context difference plainly; do not chase it.
- **G-A1, the bar (fix).** With every file, the bar's height and the first heading's top equal the no-errors base: 57 from 724, 62 at 393.
- **G-A2, from 724 (fix).**
  - The panel's width is 480.
  - Its top is the bar's bottom plus 6.
  - Its right is `innerWidth` minus the resolved `--gap-page`.
  - Its computed z-index is 6, and it has `role="alert"`.
  - WebKit: 130 high with the older file and 184 with the wrong-shaped one, within 0.5.
- **G-A3, the list (fix).** Its `clientHeight` is 6 times its computed line-height (108).
  - Wrong-shaped file: `scrollHeight > clientHeight`, `overflow-y` auto.
  - Older file at 1366: no scroll.
  - The li texts equal the base texts, in order.
  - The title and count text are as specified.
- **G-A4, Close (fix).**
  - Coarse: border-top-width 0, height 44, tabindex 0, type button.
  - Fine pointer, separate context at 1366: border 0 at rest and after `locator.hover()`, with `matches(':hover')` true.
  - Print the rest and hover boxes as a reading for the open hover-shrink todo, not as a gate.
- **G-A5, at 393 (fix).**
  - The panel's left is `--gap-page` (20), its right is `innerWidth` minus 20, and its width is 353.
  - Its bottom is the tab row's top minus 6.
  - WebKit: 148 high (older) and 184 (wrong-shaped), within 0.5.
  - After `scrollTo(0, 400)`, its rect is unchanged.
- **G-A6, the stack (fix).**
  - At 724, open the fly-out with the menu button. Hit-test the point (fly-out right minus 14, the panel's mid-height). It is inside the panel.
  - At 1366 with the fly-out open, the panel's centre hit-tests inside the panel, not the scrim.
  - The panel's computed z-index is above the fly-out's and below the bar's.
- **G-A7, the board beside the build (same engine).** `openBoard(browser, repoUrl, 'import-errors-placement.html', { coarse: true, height: 3670 })`. In each B window (`.fp-B-older-1366`, `.fp-B-many-1366`, `.fp-B-older-724`, `.fp-B-older-393`, `.fp-B-many-393`), read the `.imp-panel` box, its list box and its Close box relative to the window's rect. They must equal the build's fix readings at the same width and file, within 0.1. Use the 393 scrolled reading for `fp-B-older-393`.
- **Reading R-A8 (not a gate).** At 393 with the older file's panel showing, open More with a tap. Hit-test the centres of Search, Import and Export, and print which element each hits. This is the More-over-panel finding.

**Part B, the notice (decision 53).** The Notebook page, at 724 and 1366, in base and in fix (fix adds TOKENS only).
- Raise "Version saved." with Sid's real flow (notice-capture.mjs lines 10 and 11, English values). Within 5 seconds, press the Places menu button.
- For each hit-test, lift `inert` from `main.shell__main`, read `elementFromPoint`, then restore `inert` at once. Record the time since the save. A reading after 5s is reported as not measured, never as a pass.
- **G-B0 (base).** The notice's computed z-index is 10. Its centre hits the notice (A, as Sid found).
- **G-B1 (fix).**
  - The computed z-indexes are notice 3, scrim 4, fly-out 5.
  - The notice's centre hits the Home link inside `nav#places`, and Home is `document.activeElement`.
- **G-B2 (fix, the long notice).** Set `.page-status`'s `textContent` to `Tasting removed. You can restore it.`, as Sid did. The point (fly-out right plus 10, the notice's mid-height) hits `.shell__scrim`. In base it hits the notice.
- **G-B3 (fix).** Close the fly-out with the menu button within the 5 seconds. The notice's centre hits the notice, and its text is still there.

**Part C, Search below the hairline (decision 55).** The fix is one DOM move. Move the existing `li.shell__more-sep` to just before Search's `li` (`searchLi.before(sep)`).
- G-C-pre: before the move its previous sibling holds Search, and after it its previous sibling holds Kitchen and its next holds Search.
- Copy vpr's L, H and B pages, readers and gates G1 to G9, at 393 and 723, on the Notebook page and /ingredients. Make these changes:
  - **G-C1.** The panel's size equals the base reading and Sid's numbers (WebKit 101.5 x 284 and 105.2 x 284; Chrome 97.6 x 279 and 102.4 x 280; within 0.1). Its right edge equals the base right edge within 0.01 (vpr's SUMMARY records the pre-existing 0.031px WebKit gap; this move does not touch it).
  - **G-C2.** The tiles are 75.5 x 49 (79.2 on /ingredients) in WebKit and 71.6 x 48 (76.4) in Chrome.
  - **G-C3.** The rule is as wide as the tiles and 1 tall. Kitchen's bottom to the hr's top is 6, and the hr's bottom to Search's top is 6.
  - **G-C4.** With Search focused: ring top minus hr bottom is 2, and the ring is 8 inside both of the panel's inner edges. With Import focused, print how far the ring reaches into Search's tile (Sid: 4).
  - **G-C5 (fine pointer).** Hover on Search and on Import: border 0, box unmoved.
  - **G-C6.** A tap on Search goes to /search and closes More. A tap on the rule closes More.
  - **G-C7.** In the board `more-tiles-hairline.html` (`openBoard(..., { height: 1708 })`, windows `.fp-mt-<393|723>-<rest|cur|ring>`), the panel, the five tiles, the hr and the two 6px gaps equal the build's fix readings within 0.1. Rest and ring are compared against the Notebook page, cur against /ingredients.

Save crops of every fix state and the matching board windows to `os.tmpdir()` as `wib-*.png`, and print their paths. Print every reading as a table per engine, width, file and route.

Run `node .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-probe.mjs`, then the full `npm --prefix app test`.
- Never change the code to chase a number without reporting it.
- If the README and the real DOM disagree, report both plainly; do not invent.
- Do not commit the probe or the SUMMARY; the orchestrator's docs commit takes them.

Write `261004-wib-SUMMARY.md` in plain English and short sentences:
- **What changed.** The four commits, the tests added and amended, and the files.
- **The stacking order, exactly.** Two lines, verbatim:
  - `Old: page 1, 2 < scrim 4 < fly-out 5 < notice 10 < bar 11`
  - `New: page 1, 2 < notice 3 < scrim 4 < fly-out 5 < Import error panel 6 < bar 11`
- **Choices this plan made that no board draws:**
  - "1 problem found" for one line
  - Close returns focus to the header's Import from 724, or to More's summary below it, only when focus was inside the panel
  - Escape stops at the panel, as it does at the fly-out
  - tokens for the width and the two leadings
- **Where the README and the build disagree,** with both numbers, or "none".
  - Include the coordinator's correction: the More panel does not grow by a tile, because only the rule moves. Give the measured sizes.
  - Include the More-over-panel finding at 393 (R-A8): the panel covers Search, Import and Export in an open More, because the tab row has no z-index; not drawn, not fixed.
  - Include Close under a mouse hover (the open hover-shrink todo, with the readings) and Close's fine-pointer height.
- **The readings and every gate's result.** If any gate failed, add a `## Probe failures` section listing each failure with both numbers.
- **The method.** The existing build (app/dist, read only, ephemeral 127.0.0.1 ports); in-page rule deletes, token and rule tags, and DOM edits; no build, no Vite, :4173 untouched. A DOM edit is not a build.
- **The consequence.** Mark's running preview does not show any of this until `npm --prefix app run build` runs.
- **Still open, not touched.** The header's hover shrink (fix-header-import-export-hover-shrink); the notice scrolling away with the page (decision 53's side finding); the validator's lines in plain words (decision 52 question 3, unanswered).
- **Not verified.** The iPhone, the iPad, VoiceOver's reading of the alert, and the sticky hover after a tap on iOS.
- **`## Deferred Human Verification`.** Suggested device checks, each naming the todo it verifies, served from `npm --prefix app run build && npm --prefix app run preview -- --host`:
  - build-import-panel-and-notice:
    - iPad at 1366: import a wrong file. The panel shows under Import, the bar does not grow, six lines then a scroll, and Close closes it.
    - iPad: Escape and a page change also close it.
    - iPhone, scrolled down: the panel shows above the tab row.
    - iPad: save a version, then open the menu within 5 seconds. Home is clear and the notice is dimmed. Close the menu and the notice is bright.
  - build-more-search-below-hairline:
    - iPhone: More reads Ingredients, Kitchen, the hairline, then Search, Import, Export.
    - iPhone: tap Search and the hairline.
  - A decide row, if Mark wants it: More open over the Import error panel at the phone.

The executor files no Mark's List rows; it lists the checks only. Do not touch or stage `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/`, `.planning/STATE.md` or `.planning/todos/`. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test && { node .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-probe.mjs || grep -q '^## Probe failures' .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md; } && test -f .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md && grep -q 'Deferred Human Verification' .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md && grep -qF 'Old: page 1, 2 < scrim 4 < fly-out 5 < notice 10 < bar 11' .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md && grep -qF 'New: page 1, 2 < notice 3 < scrim 4 < fly-out 5 < Import error panel 6 < bar 11' .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md && test -z "$(git status --porcelain app/)" && TOUCHED="$(git log --name-only --format= --grep='261004-wib')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/ui/(Shell\.jsx|Shell\.test\.jsx|Shell\.flyout\.test\.jsx)$|^app/src/styles/(shell\.css|shell\.test\.js|tokens\.css|cross-cutting\.test\.js)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/(sketches|canvas-generators|todos)/|^\.planning/STATE\.md$|^\.impeccable/'</automated>
  </verify>
  <done>
- The probe exits 0, or the SUMMARY's `## Probe failures` lists every failing gate with both numbers.
- The full suite passes, and the tree under app/ is clean.
- The 261004-wib commits touch only the seven allowed app files.
- The SUMMARY carries the exact old and new stacking order, the choices no board draws, the README-versus-build differences (the no-new-tile correction and the More-over-panel finding included), the readings, the method, the no-build consequence, what stays open, and the device checks named by todo.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| chosen file to the page | The validator's lines can quote values from the file the maker chose (for example `got "no"`). They render in the panel. |
| component to rendered page | One conditional panel, one button, two keyboard listeners, and one moved static li. No stored state, no network. |
| probe to local servers | The probe serves the existing app/dist on ephemeral 127.0.0.1 ports in throwaway contexts. It edits the page's DOM, CSSOM and its own IndexedDB (one saved version) only. |
| executor to the shared working tree | Sid's uncommitted files are in the tree (`.planning/canvas-generators`, `.planning/sketches`, `.impeccable`). |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-wib-01 | Tampering | the panel's lines (file text into the DOM) | medium | mitigate | Each line is a React text child, never markup. No dangerouslySetInnerHTML. A jsdom test renders a line `<b>tag</b>` and asserts textContent and no `b` element. Keys are the index, so repeated lines cannot collide. |
| T-wib-02 | Denial of Service | keyboard: Escape between the panel, the fly-out and the pen | low | mitigate | The panel's capture listener exists only while errors show and the fly-out is closed, and it stops propagation. jsdom tests pin one Escape closing one layer and the page listener staying untouched. |
| T-wib-03 | Denial of Service | Mark's :4173 preview, :5173, :8011, app/dist | low | mitigate | No build and no Vite. The harness binds ephemeral 127.0.0.1 ports and aborts other hosts. app/dist is read only, and every change is made in the page. |
| T-wib-04 | Tampering | other agents' files in the shared tree | medium | mitigate | Commits by explicit path with `git diff --cached --name-only` first. Task 3's verify fails if any 261004-wib commit touches an app/ file outside the seven allowed, or anything under `.planning/sketches`, `.planning/canvas-generators`, `.planning/todos`, `.planning/STATE.md` or `.impeccable`. |
| T-wib-05 | Tampering | IndexedDB in the probe | low | mitigate | The save-a-version flow runs in a throwaway Playwright context on an ephemeral origin, seeded by the build. Mark's own browser profile is never touched. |
| T-wib-06 | Information Disclosure | the panel shows file values back | low | accept | Only the maker's own chosen file, shown to the maker, locally. No upload, no network (D-15). |
| T-wib-07 | Repudiation | measured numbers against the brief | low | mitigate | G-A0 and the vpr-derived checks calibrate against Sid's as-built numbers. G-A7 and G-C7 compare the build with the boards. Gates are never loosened, and differences go in the SUMMARY with both numbers. |
| T-wib-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. The probe uses the Playwright already in the npx cache, as the uo6, uyd and vpr probes did. |
</threat_model>

<verification>
- `npm --prefix app test` passes (full suite, including tabindex-scan, tokens.test.js and cross-cutting.test.js).
- `node .planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-probe.mjs` exits 0, or the SUMMARY's `## Probe failures` lists every failure with both numbers.
- `git log --format=%s --grep='261004-wib'` shows two test commits, each before its feat commit.
- `git status --porcelain app/` is empty. No commit touches a file outside the allowed set.
</verification>

<success_criteria>
- **Decision 52 B:**
  - A failed import shows a panel under Import from 724, and above the tab row below 724. The bar stays 57px.
  - The title, the count and the validator's lines show verbatim. Six lines show, then it scrolls.
  - It goes on Close, Escape, a good import or a page change.
- **Decision 53 B:** the notice is 3. With the fly-out open, Home is clear and the notice is dimmed. The stack is stated once and pinned.
- **Decision 55, Search below the hairline:** Ingredients, Kitchen, rule, Search, Import, Export. The panel keeps its measured size.
- **Measured:** WebKit and Chrome on the existing build, with the boards side by side, the readings in the SUMMARY, and gates never loosened.
- **Unchanged:** app.css, the hover shrink, the Sheet, the Batch fold, the tab ring and the tiles' sizes.
- **Process:** test first for both changes, the suite green, the commits scoped, no build, no push, no Mark's List rows.
</success_criteria>

<output>
Create `.planning/quick/261004-wib-build-decisions-52-53-and-the-search-mov/261004-wib-SUMMARY.md` when done.
</output>
