---
phase: quick-261004-oxa
plan: 01
quick_id: 261004-oxa
type: execute
wave: 1  # recomputed by quick-batch update from depends_on
depends_on: []
files_modified:
  - app/src/ui/useBelowDesktop.js
  - app/src/ui/useBelowDesktop.test.js
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.folds.test.jsx
  - app/src/ui/DerivedAdvisories.jsx
  - .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs
  - .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-baseline.json
  - .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-SUMMARY.md
autonomous: true
requirements: [FORM1-01, FORM2-02]

must_haves:
  truths:
    - "At 984 and 1024 (and every width from 984 to 1365), the recipe route opens with Balance and Watch for open: each fold row reads aria-expanded true and its panel (#fold-balance, #fold-check) is shown, beside the ingredients. Version details, History, Tasting and the batch list stay closed there. This is what 984-batch and 1024-batch draw (sketch 011 decision 33, brief (b) and task 4: 'Balance folds open', decided)."
    - "Below 984 (744, 983), Balance and Watch for open closed, as 983-batch and 744-batch draw, and the page at 744 and 983 reads exactly as the pre-change baseline."
    - "From 1366 every fold opens by default as before (decision 18); the page at 1366 reads exactly as the baseline."
    - "Each fold resets to its own width default when the window crosses its own cut: Balance and Watch for at 984, Version details, History, Tasting and the batch list at 1366. A maker's Hide on Balance at 1024 survives a rotation to 1366. Nothing is stored."
    - "Static renders under Vitest's node environment are unchanged: with no window the new hook answers true (two columns), so Balance and Watch for render open there as they do today."
    - "`npm --prefix app test` passes with no test removed, and `npm --prefix app run build` succeeds."
  artifacts:
    - path: app/src/ui/useBelowDesktop.js
      provides: "SHEET_TWO_COLUMNS_QUERY '(min-width: 984px)' and useSheetTwoColumns, node-guarded (true with no window)"
      contains: "useSheetTwoColumns"
    - path: app/src/ui/RecipePage.jsx
      provides: "one useSheetTwoColumns read above the early returns; Balance's useFold and DerivedAdvisories' foldsOpen read it; VersionRow, RecipeHistory and BatchRow keep the 1366 read"
      contains: "foldsOpen={sheetTwoColumns}"
    - path: app/src/ui/RecipePage.folds.test.jsx
      provides: "jsdom tests mounting RecipePage at 744, 983, 984, 1024 and 1366 behind a mutable matchMedia, plus the 984 and 1366 crossings"
    - path: .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs
      provides: "before/after measurement of the built app in WebKit (and Chrome) against 744-batch, 983-batch, 984-batch and 1024-batch"
  key_links:
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/useBelowDesktop.js
      via: "const sheetTwoColumns = useSheetTwoColumns(); above the first early return"
      pattern: "useSheetTwoColumns\\(\\)"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/DerivedAdvisories.jsx
      via: "<DerivedAdvisories version={liveVersion} foldsOpen={sheetTwoColumns} />"
      pattern: "foldsOpen=\\{sheetTwoColumns\\}"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/useBelowDesktop.js
      via: "Balance's fold: useFold(sheetTwoColumns)"
      pattern: "useFold\\(sheetTwoColumns\\)"
---

<objective>
Build sketch 011 decision 33's brief task 4: Balance and Watch for open by default wherever the Sheet is two columns, from 984, instead of from 1366. Version details, History, Tasting and the batch list keep their 1366 default (decision 18, unchanged).

What is decided and by whom (README decision 33, read 2026-10-04):
- Mark's rule, decided: "Balance and Watch for open wherever the Balance column is beside the ingredients ('Balance folds open', decided)". The Balance column is beside the ingredients from 984 (app.css's one-column block is `(max-width: 983.98px)`).
- The brief, (b): "Balance (`RecipePage.jsx`, `useFold(!belowDesktop)`) and Watch for (`DerivedAdvisories.jsx`) open by default wherever the Sheet is two columns: a new hook for `(min-width: 984px)`, node-guarded as `useBelowDesktop` is; Details, History, Tasting and the batch list keep `!belowDesktop` (1366)."
- The README names the consequence plainly in decision 33's finding (5): "Two cuts. Balance and Watch for open from 984, the band's Details, History and the log's Tasting open from 1366 (decision 18, unchanged): at 984 to 1365 the Sheet is open and the band is closed. That is Mark's rule."
- Acceptance boards: 984-batch and 1024-batch (Balance and Watch for open), 983-batch and 744-batch (closed). All four are "drawn, awaiting Mark's look". This plan builds to them as drawn, and the SUMMARY says so, so Mark's look covers the built app.

Checked at plan time (2026-10-04, after quick 261004-ly8): none of this exists in the build. `useBelowDesktop.js` holds BELOW_DESKTOP_QUERY (1365.98), BELOW_724_QUERY, BELOW_RAIL_QUERY (1589.98, added by ly8) and LOG_BESIDE_SHEET_QUERY (min 1366). No 984 query exists in any JS module. RecipePage passes `!belowDesktop` to Balance's useFold, to DerivedAdvisories, to VersionRow and to BatchRow. No CSS rule targets the Balance or Watch for regions by width, so this is a JS-only change.

Choices made here (Claude's discretion; recorded):
- Hook name `useSheetTwoColumns`, query constant `SHEET_TWO_COLUMNS_QUERY`. It reads what the brief says ("wherever the Sheet is two columns") and pairs with `useLogBesideSheet`, the other min-width hook. It is a fifth copy of the file's existing node-guarded hook shape. Do not refactor the four existing hooks into a shared helper: nothing asked for it.
- With no window, the hook answers `true`: the desktop arrangement, as useBelowDesktop's own no-window answer is. Every static render (DerivedAdvisories' default `foldsOpen = true` included) stays as it is.
- DerivedAdvisories keeps its `foldsOpen` prop. RecipePage passes the new value, so the page keeps one media read per cut and DerivedAdvisories' static tests stay valid. Its only edit is the comment that would become false ("the same negated-belowDesktop value RecipePage passes to every other fold").
- `DerivedAdvisories.test.jsx` is not edited. The item description names "their tests", but the component's prop contract does not change, and its open and closed cases still hold. The width wiring is proven by the new jsdom page test.
- `RecipePage.test.jsx` is not edited either. It never renders RecipePage, and the jsdom file proves the wiring by behaviour, not by source text.

Not in this plan: DESIGN.md's "Balance folds open from 984" line and the surface briefs (brief (f), after Mark's approval); the table, Go to batch and the shell (brief tasks 1, 2, 3, 5 and 6); print.

Dependencies: none. No sibling in batch 261004-ox1 names useBelowDesktop.js, RecipePage.jsx, DerivedAdvisories.jsx or their tests. ox6 and ox8 work in IngredientTable.jsx; the others work in CSS. If a sibling lands first, re-read these four files before editing. The probe gates fold states and the side column's position, not the table or the band, so it holds whichever siblings land first.

Purpose: on an iPad in portrait (1024) and any window from 984, the balance figures and what to watch for are on the first read beside the ingredients, where there is room for them, with no tap.
Output: one new hook, the page's two fold reads switched to it, a jsdom page test, a before/after probe against the four boards, and the SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md
@app/src/ui/useBelowDesktop.js
@app/src/ui/useBelowDesktop.test.js
@app/src/ui/DerivedAdvisories.jsx
@app/src/ui/RecipePage.recordTasting.test.jsx
@app/src/ui/Shell.flyout.test.jsx
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs

<interfaces>
From app/src/ui/useBelowDesktop.js (current):
- `BELOW_DESKTOP_QUERY = '(max-width: 1365.98px)'`, `useBelowDesktop()`. Node-guarded: with no window, or no window.matchMedia, it answers false (not below, the desktop arrangement) and builds no listener.
- `BELOW_724_QUERY`, `useBelow724()`; `BELOW_RAIL_QUERY = '(max-width: 1589.98px)'`, `useBelowRail()`; `LOG_BESIDE_SHEET_QUERY = '(min-width: 1366px)'`, `useLogBesideSheet()`. All have the same shape: a useState initialiser reading `window.matchMedia(Q).matches`, and a useEffect adding and removing a 'change' listener.
- `useFold(openByDefault)` returns `[open, toggle]`. It resets `open` to `openByDefault` whenever that value changes, and stores nothing.

From app/src/ui/RecipePage.jsx (current, line numbers at plan time):
- 37: `import { useBelow724, useBelowDesktop, useFold } from './useBelowDesktop.js';`
- 936-951: the fold comment block, then `const belowDesktop = useBelowDesktop();`, `const below724 = useBelow724();` and `const [balanceOpen, toggleBalance] = useFold(!belowDesktop);`, all above `if (version === undefined) return null;` (953).
- 2005: VersionRow `foldsOpen={!belowDesktop}` (stays). 2026: RecipeHistory `belowDesktop={belowDesktop}` (stays). 2193: BatchRow `foldsOpen={!belowDesktop}` (stays).
- 2112-2119: a JSX comment stating "they simply never hide anything from 1366 up (useFold's own default)". It becomes false.
- 2120-2135: `<section className="formulation-note-region" aria-label="Balance">`, `<h2 className="region-name"><FoldRow label="Balance" ... controls="fold-balance" /></h2>`, `<div id="fold-balance" hidden={!balanceOpen}>`.
- 2138: `<DerivedAdvisories version={liveVersion} foldsOpen={!belowDesktop} />` (changes).

From app/src/ui/DerivedAdvisories.jsx: `DerivedAdvisories({ version, foldsOpen = true })`, `useFold(foldsOpen)`, FoldRow `controls="fold-check"`, `<div id="fold-check" hidden={!open}>`. It returns null when buildAdvisories gives nothing. Olive Oil v1 gives 4 advisories.

Fold ids in the app: fold-version (VersionRow), fold-history (RecipeHistory, only with two or more versions), fold-balance, fold-check, fold-tasting (BatchRow TastingReading, only with a tasted batch in view), fold-batches (BatchRow, only with two or more batches). FoldRow renders `<button type="button" class="fold-row" aria-expanded aria-controls={id} tabindex="0">`.

The boards (`.planning/sketches/011-recipe-route-c/{744,983,984,1024}-batch.html`): two panels each, `div.fp-win.fp-mex3-{W}` (Mexican Chocolate v3, Show changes on, awaiting its tasting) and `div.fp-win.fp-olive1-{W}` (Olive Oil v1, tasted), each W px wide. The app's own markup carries ids suffixed `-fp-{state}-{W}` (for example `aria-controls="fold-balance-fp-mex3-984"`). A closed fold's panel is left out of the board's markup, not drawn with `hidden`. The boards carry no @media rules; they were captured in WebKit with a coarse pointer at a 1000 window height, with Balance and Watch for clicked open from 984 to 1365 (`.planning/canvas-generators/final-capture.mjs`; read only). Fold states read from the files at plan time:
- 984 and 1024, both panels: fold-balance true and fold-check true; fold-version false. fold-history false (mex3 only); fold-tasting false (olive1 only).
- 983 and 744, both panels: every fold false.

App routes: mex3 = `/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01`; olive1 = the harness's `APP_ROUTE` (`/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89`).

Harness (`.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`): `startServers()` returns { appUrl, repoUrl, close } on ephemeral 127.0.0.1 ports, serving app/dist and the repo. `launch()` is system Chrome. `openApp(browser, appUrl, route, { width, height, coarse })`. `openBoard(browser, repoUrl, file, { width?, height?, coarse? })` opens at the board's own $preview width. `check(failures, cond, label)` and `finish(failures, count, name)`. WebKit is imported from `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`, as `.planning/quick/261004-ly8-sticky-header-then-fly-out-and-rail-sketch-011-decision-33-a/261004-ly8-probe.mjs` does (read it as the analog; do not edit it).
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Baseline, then Balance and Watch for open from 984, end to end (hook, page, DOM), measured before and after against the four boards</name>
  <files>.planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs, .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-baseline.json, app/src/ui/useBelowDesktop.test.js, app/src/ui/RecipePage.folds.test.jsx, app/src/ui/useBelowDesktop.js, app/src/ui/RecipePage.jsx, app/src/ui/DerivedAdvisories.jsx</files>
  <read_first>app/src/ui/useBelowDesktop.js, app/src/ui/useBelowDesktop.test.js, app/src/ui/RecipePage.jsx (lines 30-40, 930-955 and 1990-2200), app/src/ui/DerivedAdvisories.jsx, app/src/ui/RecipePage.recordTasting.test.jsx (lines 1-175, the repository mock and mount harness), app/src/ui/Shell.flyout.test.jsx (lines 1-120, the mutable-width matchMedia), .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs, .planning/quick/261004-ly8-sticky-header-then-fly-out-and-rail-sketch-011-decision-33-a/261004-ly8-probe.mjs (lines 1-60 and the board group near 870; read only), .planning/canvas-generators/final-capture.mjs (read only), .planning/sketches/011-recipe-route-c/README.md lines 365-391 (decision 33's table, finding (5), brief (b) and task 4; read only)</read_first>
  <behavior>
    - useBelowDesktop.test.js, new describe "the Sheet's two-column cut (decision 33, brief task 4)":
      - S1: SHEET_TWO_COLUMNS_QUERY is exactly '(min-width: 984px)' and useSheetTwoColumns is a function. RED before.
      - S2: under the node environment (no window), a component calling useSheetTwoColumns renders 'true'. Use createElement and renderToStaticMarkup, since the file is .js. RED before.
    - RecipePage.folds.test.jsx (new, jsdom). RecipePage is mounted on Olive Oil v1's batch route with the seeded 2 Aug batch (tasted), behind a mutable-width window.matchMedia. Folds are read by `.fold-row[aria-controls=ID]`'s aria-expanded and by `#ID`'s hidden.
      - F1, at 744 and at 983: fold-balance and fold-check closed (aria-expanded "false", panel hidden); fold-version and fold-tasting closed. Passes before (guard).
      - F2, at 984 and at 1024: fold-balance and fold-check open (aria-expanded "true", panel not hidden); fold-version and fold-tasting closed. RED before.
      - F3, at 1366: fold-balance, fold-check, fold-version and fold-tasting all open. Passes before (guard).
      - F4: mount at 983, then cross to 984: Balance and Watch for open, Version details and Tasting still closed. Cross back to 983: Balance and Watch for closed. RED before.
      - F5: mount at 1024 and click Balance's fold row (Hide): Balance closed, Watch for open. Cross to 1366: Balance still closed (its cut was not crossed), and Watch for, Version details and Tasting open. Cross back to 1024: Balance still closed, Version details and Tasting closed. RED before (at 1024 Balance starts closed).
  </behavior>
  <action>
Per sketch 011 decision 33, brief (b) and task 4 ("Balance folds open", Mark's decided rule), with decision 18's other folds unchanged.

Step 0. Re-read the files in read_first; a sibling item may have landed first. Run `npm --prefix app test` and record the starting file and test counts for the SUMMARY.

Step 1, the probe and the baseline, on the unchanged source. Write `.planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs` as plain Node ESM. Import startServers, launch, openApp, openBoard, check and finish from `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`, and `webkit` from the playwright-core path in the interfaces. It takes one argument, `before` or `after`.

The app cells:
- WebKit with a coarse pointer, via `openApp(..., { width: W, height: 1000, coarse: true })`, at W = 744, 983, 984, 1024 and 1366, on both routes, mex3 and olive1.
- On mex3, click the first button named "Show changes" and wait for "Hide changes", as final-capture.mjs did, so Balance reads the same diff the board draws.
- The in-page reader returns:
  - every `.fold-row`'s aria-controls and aria-expanded, and whether its panel element is hidden or absent;
  - document-coordinate boxes {x, y, w, h}, rounded to 0.01, for `.ingredient-table-region`, `.side-region`, `#fold-balance`, `#fold-check` and `.method-region`;
  - `document.documentElement.scrollHeight`, and the overflow (scrollWidth less clientWidth).

The board cells:
- Open 744-batch, 983-batch, 984-batch and 1024-batch with `openBoard` on the WebKit browser.
- For each panel `.fp-win.fp-{state}-{W}`, read the same things inside the panel. Strip the `-fp-{state}-{W}` suffix from the ids. Take boxes relative to the panel's own top-left.
- A fold whose panel is absent on the board counts as closed.

`before` mode:
- Assert the plan-time facts:
  - App, at 744, 983, 984 and 1024: fold-balance and fold-check closed. At 1366: open.
  - Boards, at 984 and 1024: fold-balance and fold-check open. At 744 and 983: closed. On every board, fold-version, fold-history and fold-tasting are closed.
- Print the board-against-app fold mismatches. Expected: fold-balance and fold-check, at 984 and 1024, on both panels; 8 in all.
- Write every app and board reading to `261004-oxa-baseline.json` beside the probe.

`after` mode, gates:
- (a) Fold states. In every WebKit cell at 744, 983, 984 and 1024, the app's set of fold ids and each one's aria-expanded equal the board panel's.
- (b) The side column. At 984 and 1024, `.side-region` is beside the ingredients: its x is at least the ingredients region's right edge, and its top is above the ingredients region's bottom. Its x and width are within 0.5 of the board's. At 744 and 983 it is below: its top is at or below the ingredients region's bottom.
- (c) No change where none was asked. At 744, 983 and 1366, every reading equals the baseline (folds exactly; boxes and scrollHeight within 0.5). At 984 and 1024, fold-version, fold-history, fold-tasting and fold-batches equal the baseline, and so do the `.ingredient-table-region` box and the `.side-region` x and width.
- (d) Crossings, in WebKit with a fine pointer, on olive1, using `page.setViewportSize`:
  - 983 to 984: Balance and Watch for open, Version details and Tasting closed.
  - Back to 983: Balance and Watch for closed.
  - At 1024, click Balance's fold row, then go to 1366: Balance closed, Watch for and Version details open.
- (e) System Chrome with a fine pointer (`launch()`), olive1, at 983 and 984: the same fold states as WebKit at those widths.
- Also print, without gating: for #fold-balance and #fold-check at 984 and 1024, the app-minus-board deltas of x, y, w and h, and the scrollHeight change from the baseline at 984 and 1024. The panels' y depends on the band and the table, which sibling items (Go to batch, D3) may change.
- Exit with finish(). Never request :4173, :5173 or :8011, start no Vite process, and save nothing.

Run `npm --prefix app run build`, then `node .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs before`. It must exit 0 and write the baseline.

Step 2, RED.
- In `app/src/ui/useBelowDesktop.test.js`, add S1 and S2 as a new describe at the end, with a one-line comment naming decision 33's brief task 4. Import the two new names.
- Create `app/src/ui/RecipePage.folds.test.jsx` with F1 to F5:
  - A `// @vitest-environment jsdom` docblock, and a header comment saying why it is a sibling jsdom file (the same reason RecipePage.recordTasting.test.jsx gives).
  - The repository mock and the Keyed and mount harness from RecipePage.recordTasting.test.jsx, with the mutable-width matchMedia and setWidth from Shell.flyout.test.jsx: queries keep their 'change' listeners, and setWidth fires 'change' on the ones whose answer flipped, inside act.
  - Mount at `/notebook/{recipeId}/{versionId}/batch/{augustSecondBatch.id}` with `[augustSecondBatch]`, and flush until `.fold-row[aria-controls="fold-balance"]` exists.
  - Stub Element.prototype.scrollIntoView only if the mount needs it.
  - Restore matchMedia and unmount in afterEach.
- Run `npm --prefix app test -- useBelowDesktop RecipePage.folds`. Confirm S1, S2, F2, F4 and F5 fail, and F1 and F3 pass. Record which tests failed for the SUMMARY.
- Commit by explicit path: the two test files, the probe and the baseline JSON. Message: `test(261004-oxa): pin Balance and Watch for open from 984`.

Step 3, GREEN.
- `app/src/ui/useBelowDesktop.js`:
  - Add `export const SHEET_TWO_COLUMNS_QUERY = '(min-width: 984px)'` and `export function useSheetTwoColumns()`, beside useLogBesideSheet and with the same shape. With no window, or no window.matchMedia, the useState initialiser answers true.
  - Its comment names decision 33's brief (b): Balance and Watch for open by default wherever the Sheet is two columns; 984 = 2 x 32 + 920; the complement of app.css's one-column block at 983.98. It is node-guarded, with the same critical note as useBelowDesktop.
  - In the top comment over BELOW_DESKTOP_QUERY, which says it is every below-desktop fold's query, add that Balance and Watch for read SHEET_TWO_COLUMNS_QUERY instead (decision 33).
- `app/src/ui/RecipePage.jsx`:
  - Add useSheetTwoColumns to the import from './useBelowDesktop.js'.
  - Above the first early return, beside `const belowDesktop = useBelowDesktop();`, add `const sheetTwoColumns = useSheetTwoColumns();`.
  - Balance's fold becomes `useFold(sheetTwoColumns)`.
  - DerivedAdvisories receives `foldsOpen={sheetTwoColumns}`.
  - Leave VersionRow's foldsOpen, RecipeHistory's belowDesktop and BatchRow's foldsOpen exactly as they are.
  - Rewrite the two comments that become false: the block above the hooks, so it names both cuts (984 for Balance and Watch for, 1366 for the rest; each fold resets when its own cut is crossed), and the JSX comment above the Balance section, so it says the panels are open by default from 984.
- `app/src/ui/DerivedAdvisories.jsx`: comment only. `foldsOpen` defaults to true, the two-column answer, and RecipePage now passes its 984 read (decision 33), not the 1366 one. Change no code there.
- Run the two test files, then `npm --prefix app test`. Every test must pass, with none removed.
- Commit the three source files by explicit path. Message: `feat(261004-oxa): Balance and Watch for open by default from 984 (sketch 011 decision 33, brief task 4)`.

Step 4, after.
- Run `npm --prefix app run build`, then `node .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs after`. It must exit 0.
- If a gate fails, find the cause before changing anything:
  - If the cause is in this task's files, add or adjust a test first, fix, re-run, and commit by explicit path.
  - If it is anywhere else (a stylesheet, another component, a sibling item's change), record the measured effect for Mark. Do not edit it.
- If the probe changed, commit it by explicit path: `test(261004-oxa): probe gates after the change`.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && node .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs after && test -s .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-baseline.json && grep -q "useFold(sheetTwoColumns)" app/src/ui/RecipePage.jsx && grep -q "foldsOpen={sheetTwoColumns}" app/src/ui/RecipePage.jsx && grep -q "(min-width: 984px)" app/src/ui/useBelowDesktop.js && SUBJECTS="$(git log --reverse --format=%s --grep='261004-oxa')" && FIRST="$(printf '%s\n' "$SUBJECTS" | grep -m1 -E '^(test|feat)\(261004-oxa\)')" && printf '%s\n' "$FIRST" | grep -q '^test(261004-oxa): pin Balance and Watch for open from 984' && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-oxa): Balance and Watch for open by default from 984'</automated>
  </verify>
  <done>
- From 984 to 1365, Balance and Watch for open by default beside the ingredients. Version details, History and Tasting stay closed until 1366. Below 984 nothing changes, and from 1366 nothing changes.
- The fold states match 984-batch, 1024-batch, 983-batch and 744-batch on both recipes in WebKit. At 984 and 1024 the side column's x and width match the boards within 0.5. Chrome agrees at 983 and 984.
- The baseline was captured from the unchanged build before any edit. 744, 983 and 1366 read exactly as the baseline after the change.
- Crossing 984 resets Balance and Watch for. Crossing 1366 does not.
- The test commit precedes the feat commit. The suite passes with no test removed, and the build succeeds.
  </done>
</task>

<task type="auto">
  <name>Task 2: SUMMARY with the before and after numbers, the findings for Mark, the deferred device check, and the scope check</name>
  <files>.planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-SUMMARY.md</files>
  <read_first>.planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-baseline.json, the output of the Task 1 probe's `after` run, .planning/quick/261004-ly8-sticky-header-then-fly-out-and-rail-sketch-011-decision-33-a/261004-ly8-SUMMARY.md (read only, as the form to follow)</read_first>
  <action>
Write `.planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-SUMMARY.md` with:
- What was built (sketch 011 decision 33, brief task 4): the hook, the two reads switched, and the comments. The commit list. The RED-then-GREEN evidence: which tests failed before and which passed before as guards.
- The choices recorded in this plan's objective: the hook's name, its no-window answer, the prop kept on DerivedAdvisories, and why DerivedAdvisories.test.jsx and RecipePage.test.jsx were not edited.
- One table row per probe cell (engine, pointer, width, recipe). Columns: each fold's state before and after, and the board's state; the side column's x and width, against the board; and scrollHeight before and after.
- The ungated deltas of the open panels (#fold-balance, #fold-check) against 984-batch and 1024-batch, in px, each with its cause when it is over 0.5.
- The suite count as files and tests, with the delta from Task 1's starting count. The build result.
- Findings for Mark, each said plainly:
  1. The two fold cuts. From 984 to 1365 the Sheet is open and the band and log are closed; that is Mark's rule, and README finding (5).
  2. A consequence of each fold resetting at its own cut. On the 12.9in iPad, a Balance or Watch for closed in portrait (1024) stays closed after a rotation to landscape (1366), while Version details, History and Tasting reset to open. Before this change a rotation reset all of them. If Mark wants rotation to reset Balance too, that is a one-line change and his call.
  3. The page is longer at 984 to 1365 by the open panels: give the scrollHeight change at 984 and 1024 for both recipes.
  4. The four acceptance boards were drawn and awaiting Mark's look when this was built.
  5. Anything in the probe's ungated deltas that traces outside this task.
- A "Deferred Human Verification" section, served from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`; Mark's running preview already serves the rebuilt app/dist, so a hard reload is enough):
  1. On the iPad at 1024 portrait, Olive Oil v1 and Mexican Chocolate v3: Balance and Watch for open beside the ingredients, and Version details and Tasting closed.
  2. Rotate to 1366: everything open.
  3. Hide Balance at 1024 and rotate: Balance stays hidden (finding 2).
  4. On an iPad mini (744), if he has one: all closed.
- State plainly that every reading comes from Playwright WebKit and system Chrome, not from Mark's devices. If the ArtifactData tool is available, add one row to Mark's List for these device checks with:
  - slug `oxa-balance-open-984-device-check` as the doc id;
  - kind check, addedBy claude, status open, ISO createdAt and updatedAt;
  - `where.label` naming the recipe route at 1024 portrait and 1366 landscape on the iPad;
  - finding 2 in the title or body as the one thing to look for.
  Name the row in the SUMMARY. If the tool is not available, name the section for the orchestrator to file.

Then the scope check:
- `git status --porcelain app/` must be empty.
- Under app/, the commits with 261004-oxa in the message touch only the five listed app files.
- No commit touches .planning/sketches, .planning/canvas-generators, DESIGN.md or .impeccable.
- The uncommitted sketch README and the untracked files stay as they were.

Commit the SUMMARY by explicit path: `docs(261004-oxa): summary of Balance and Watch for open from 984`. Do not start, stop or request :4173, and leave :5173 and :8011 alone.
  </action>
  <verify>
    <automated>test -f .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-SUMMARY.md && grep -q "Deferred Human Verification" .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-SUMMARY.md && test -z "$(git status --porcelain app/)" && TOUCHED="$(git log --name-only --format= --grep='261004-oxa')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/ui/(useBelowDesktop\.js|useBelowDesktop\.test\.js|RecipePage\.jsx|RecipePage\.folds\.test\.jsx|DerivedAdvisories\.jsx)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/(sketches|canvas-generators)/|^DESIGN\.md$|^\.impeccable/'</automated>
  </verify>
  <done>
- The SUMMARY records every probe number before and after, the board comparisons, the findings for Mark and the deferred device check. The Mark's List row is named, or handed to the orchestrator.
- Under app/, the commits touch only the five listed files. Nothing under .planning/sketches, .planning/canvas-generators, DESIGN.md or .impeccable changed.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| window size to fold state | matchMedia answers decide each fold's default. No data is read or written by it. |
| probe to local servers | the probe serves app/dist and the repo tree on ephemeral 127.0.0.1 ports and drives throwaway browser contexts. |
| executor to shared working tree | Sid works in .planning/sketches and .planning/canvas-generators. The sketch README is uncommitted, and untracked critique and todo files sit in the tree. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-oxa-01 | Tampering | fold state persisted or carried across visits | low | mitigate | useFold stays component state only, with no storage (T-03.5-37 unchanged). F4 and F5 assert each fold returns to its width's default at its own cut. |
| T-oxa-02 | Denial of Service | a hook called below RecipePage's early return, breaking the page on load | medium | mitigate | useSheetTwoColumns is called beside useBelowDesktop, above `if (version === undefined) return null;`. The jsdom mount (F1 to F5) renders through the loading state into the loaded page, and would throw on a hook-order change. |
| T-oxa-03 | Denial of Service | a crash in static renders under node, where no window exists | medium | mitigate | The hook is node-guarded and answers true with no window. S2 renders it under the node environment, and the whole suite's static-markup tests still run. |
| T-oxa-04 | Denial of Service | the probe against Mark's :4173 preview, :5173 and Sid's :8011 | low | mitigate | The harness binds only ephemeral 127.0.0.1 ports and aborts every other host. No Vite process is started, and nothing is saved. |
| T-oxa-05 | Tampering | other agents' files in the shared tree | medium | mitigate | Commits are made by explicit path, never `git add -A`. Task 2's verify fails if any 261004-oxa commit touches .planning/sketches, .planning/canvas-generators, DESIGN.md, .impeccable or an app/ file outside the five listed. |
| T-oxa-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. jsdom is already a devDependency, and the probe uses the playwright-core module, WebKit build and system Chrome already on disk. If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- The baseline was captured from a build of the unchanged source before any edit, with the plan-time facts asserted.
- `npm --prefix app test` passes with no test removed, and `npm --prefix app run build` succeeds.
- `node .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs after` exits 0: fold states equal 744-batch, 983-batch, 984-batch and 1024-batch on both recipes in WebKit, the side column matches at 984 and 1024, 744, 983 and 1366 are unchanged from the baseline, the crossings hold, and Chrome agrees.
- The commits are test-first: `test(261004-oxa)` before `feat(261004-oxa)`.
- Under app/, only the five listed files changed. Nothing under .planning/sketches, .planning/canvas-generators, DESIGN.md or .impeccable changed.
</verification>

<success_criteria>
- Wherever the Balance column stands beside the ingredients (984 and up), Balance and Watch for are open on arrival. Below 984 they are closed, and the band's and log's folds keep their 1366 default.
- The four named boards match the build's fold states in WebKit, and the side column's position at 984 and 1024.
- The device check and the rotation finding are listed for Mark.
</success_criteria>

<output>
Create `.planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-SUMMARY.md` when done (Task 2).
</output>
