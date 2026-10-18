---
phase: quick-261017-ttf
plan: 01
quick_id: 261017-ttf
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/domain/figures.js
  - app/src/domain/figures.test.js
  - app/src/ui/GraduatedRule.test.jsx
  - app/src/ui/PrintSheetPages.test.jsx
autonomous: true
requirements: [D30]

estimate:
  tokens: 50000
  raw_tokens: 50000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Every recipe's Sweetness · POD rule runs 0 to 40 (sketch 010 README D30, Mark 2026-10-18, decide-p10-pod-rule-end answered widen-to-40). This holds on screen (GraduatedRule, the Balance region) and on the printed Sheet (PrintBalance), and the right-hand anchor reads 40."
    - "Olive Oil v1's Sweetness gauge draws its 12–16 band from x 96 to x 128 (width 32) and its value tick at x 104.37, in the rule's 320-unit drawing. Its anchors read 0, inside 12–16, 40. This is sheet-page-1-formula.html and sheet-balance-col2.html, as retaken for D30."
    - "In the Next version pen with Whole milk portion 1 at 110 g (was 120), the Sweetness gauge draws the hollow was tick at rect x 103.12 (centre 104.37) and the value tick at x 105.61, with the struck head 13.0 → 13.2. This is screen-draft-kept.html and screen-draft-kept-words.html."
    - "Sorbet's approved Sweetness band, 24 to 32, draws both edges inside the rule, at x 192 and x 256 of 320. Neither edge sits on the rule's end. At 0 to 30 the 32 edge was clamped to 320, the end, so it could not be seen."
    - "Nothing else on the rule moves: the eleven graduations and the baseline stay where they were, and the other five scales are unchanged (Freezing · PAC 0 to 40, Fat 0 to 30, Milk solids 0 to 15, Sugar 0 to 25, Solids 25 to 55)."
    - "In Playwright WebKit, the built app's Sweetness gauge matches the sketch 010 boards within 1 px for the band's left and right edges, the value tick, the hollow was tick and the right-hand end number 40. That is the pen at 1280 against screen-draft-kept.html .p4d1 and screen-draft-kept-words.html .p4w1a and .p4w1b, and the print route's Sheet page 1 against sheet-page-1-formula.html and sheet-balance-col2.html."
    - "npm --prefix app test passes with 96 files and 3007 tests: the 3001 baseline plus six new D30 tests. No commit touches .planning/sketches or .planning/canvas-generators, and nothing is written into app/dist."
  artifacts:
    - path: app/src/domain/figures.js
      provides: "The pod spec's domain is [0, 40] (D30); the five other specs are unchanged"
      contains: "domain: [0, 40], // sketch 010 D30"
    - path: app/src/domain/figures.test.js
      provides: "Pins all six scales and Sorbet's 24–32 band inside the POD rule"
      contains: "D30"
    - path: app/src/ui/GraduatedRule.test.jsx
      provides: "Pins the board numbers for the Sweetness gauge: sheet state, pen state and Sorbet's band"
      contains: "D30"
    - path: app/src/ui/PrintSheetPages.test.jsx
      provides: "Pins the printed Sweetness gauge on 0 to 40"
      contains: "D30"
  key_links:
    - from: app/src/domain/figures.js
      to: app/src/ui/GraduatedRule.jsx
      via: "FIGURE_SPECS pod domain is copied by buildFigures (figure.domain), then read by RuleDrawing's toX and its two anchor spans"
      pattern: "const \\[lo, hi\\] = domain"
    - from: app/src/ui/GraduatedRule.jsx
      to: app/src/ui/PrintSheetPages.jsx
      via: "the printed Sheet draws the same RuleDrawing inside .ps-gauge, so one domain change moves screen and paper together"
      pattern: "<RuleDrawing figure={figure} />"
---

<objective>
Widen the Sweetness · POD Balance rule from 0 to 30 to 0 to 40 for every recipe, on screen and on the printed Sheet. This is sketch 010 README D30: Mark decided it on 2026-10-18 (Mark's List row `decide-p10-pod-rule-end`, option `widen-to-40`) and approved it as drawn (`look-p10-pod-rule-40`). Then measure the built app against the retaken sketch 010 boards in WebKit, and edit CSS or markup only if the numbers show the app is wrong.

Purpose: Sorbet's approved Sweetness band is 24 to 32. On a 0 to 30 rule its upper edge (32) is clamped to the rule's end, so it does not show. The PAC rule already runs 0 to 40, and POD now runs the same. The sketch HTML is the authority, so the app has to match the boards as measured.
Output: one value changed in `app/src/domain/figures.js`, six tests that pin the new scale and the board numbers, a WebKit measurement table in the SUMMARY, and a CSS or markup fix only if the measurement calls for one.

Planner contributions: the active plan:pre contributions (security, schema-gate, assumption-delta, ai-integration) do not apply to a Balance scale change. None apply.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/domain/figures.js
@app/src/ui/GraduatedRule.jsx

Facts the planner checked (2026-10-17, HEAD 74c971c):
- The POD scale is written in one place only: `FIGURE_SPECS` in `app/src/domain/figures.js`. The pod spec (key 'pod') has `domain: [0, 30],` at line 32. The fat spec's `domain: [0, 30],` at line 41 is a different rule and stays as it is. The PAC spec at line 23 is already `[0, 40]` and is the model.
- Every reader gets the scale through that spec. `buildFigures` copies `spec.domain` onto each figure (line 183). `RuleDrawing` in `app/src/ui/GraduatedRule.jsx` (lines 97-185) reads `const [lo, hi] = domain` and uses it for `toX`: the band rect, both band-edge lines, the value tick and the hollow was tick. It also renders `lo` and `hi` as the two anchor spans. The on-screen gauge (the `GraduatedRule` button, used by FormulationNote) and the printed gauge (`PrintSheetPages.jsx` line 176, `.ps-gauge`) both draw through `RuleDrawing`.
- The graduations do not read the domain. `GRADUATION_COUNT` = 10 spreads 11 evenly over WIDTH 320, so they do not move, which matches the boards ("graduations untouched").
- No CSS, token, other module or test restates the POD end. A grep of app/src for `0, 30]` finds only the fat spec and the fat fixture at `app/src/ui/GraduatedRule.test.jsx` line 16, which stays. No existing test pins POD geometry or a `<span>30</span>` anchor. Changing the value breaks no current test, so the new tests are what prove the change.
- Expected numbers on 0 to 40, computed with the app's own `buildFigures` and the same as the retaken boards (`git diff HEAD -- .planning/sketches/010-bench-sheet/sheet-balance-col2.html`):
  - Olive Oil v1 (`oliveOilVersion` from `app/src/data/olive-oil.js`): POD 13.046139…, band [12, 16]. Band rect x 96, width 32; edges x1 96 and 128; value tick x1 104.36911532613… (the board says …047, the app gives …045, so compare within 0.01). The old 0 to 30 values were 128, 42.67, 170.67 and 139.16.
  - The pen state: row `row-01` 'Whole milk' with portions[0].grams 120 changed to 110. POD becomes 13.201629986830108, value tick x1 105.61303989464086, and the hollow rect x = toX(13.046139…) − 1.25 = 103.11911532613….
  - Sorbet's band [24, 32] on 0 to 40 gives edges 192 and 256. On 0 to 30 it gave 256 and 320, with 32 clamped to the end.
  - The anchors markup the boards carry for Olive Oil v1 is, verbatim: `<div class="graduated-rule__anchors" aria-hidden="true"><span>0</span><span class="graduated-rule__deviation">inside 12–16</span><span>40</span></div>`.
- Test environments: `app/vitest.config.js` defaults to `node`. `GraduatedRule.test.jsx` renders with `renderToStaticMarkup` in node. `PrintSheetPages.test.jsx` has a `@vitest-environment jsdom` docblock and a `balance(props)` helper in its describe 'PrintBalance — Balance in column 2 (E3, E4)' (lines 133-176).
- Baselines: `npm --prefix app test -- src/domain/figures.test.js src/ui/GraduatedRule.test.jsx src/ui/PrintSheetPages.test.jsx` gives 3 files, 123 tests. `npm --prefix app test` gives 96 files, 3001 tests. Both pass.
- Boards (working tree, retaken for D30, uncommitted; read them from disk, never stash or check them out):
  - `screen-draft-kept.html`: `$preview` 2226×1638. Its one Sweetness gauge is in window `.p4d1` (1280). Its button aria-label is "Sweetness · POD, was 13.0, now 13.2, target 12–16, estimated: Whole milk, Heavy cream, and Allulose", and its pen field is `input[aria-label="Whole milk, grams, portion 1"]` with value 110.
  - `screen-draft-kept-words.html`: gauges in `.p4w1a` and `.p4w1b` (1280).
  - `sheet-page-1-formula.html`: 816×1056.
  - `sheet-balance-col2.html`: 816×2370. Each has one Sweetness gauge, at document level.
  - `screen-print-route-1280.html` holds Sheet page 1 only as a PNG picture, so it cannot be measured in the DOM. Its source is the sheet page 1 board, which is measured.
  - Board quirk, not a target: in `screen-draft-kept.html` the hatch pattern's id is `hatch-pod-p4` while the rect fills `url(#hatch-pod)`. That comes from how the canvas scopes ids. The app keeps `hatch-${key}`.
- Playwright WebKit: `import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'` (installed). The pattern to copy is `.planning/canvas-generators/p10-capture.mjs` lines 1-50. Read it only; it is untracked and not part of this task, so do not edit, stage or commit it. That pattern: a fresh context seeds the store at `/` (wait for `.home__lead`). Go to `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1` and wait for `.notebook-band`. Click `getByRole('button', { name: 'Next version' }).first()` and wait about 500 ms. Click a button named `/^Balance, Show/` if one exists. The vite binary is `app/node_modules/vite/bin/vite.js`.
- No Vite process was running at planning time. `app/dist` exists and is gitignored. Mark's own preview, when it runs, is on :4173. This task never uses that port or app/dist.
- The working tree already holds changes that are not part of this task: `.planning/sketches/010-bench-sheet/*`, `.planning/canvas-generators/*` (plus untracked files), `.planning/config.json`, `.planning/state.json`, and two `.review-diagnostics/` folders.
- Scratch directory for every temporary file (the session's temp dir; use it instead of /tmp, and never app/dist): `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/26fd9527-06c0-4bfa-b5b0-7a67f6edff73/scratchpad/261017-ttf/`. Below it is written SCR.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Pin the 0 to 40 Sweetness rule in tests, then widen the POD domain in figures.js (D30)</name>
  <files>app/src/domain/figures.js, app/src/domain/figures.test.js, app/src/ui/GraduatedRule.test.jsx, app/src/ui/PrintSheetPages.test.jsx</files>
  <read_first>
    - app/src/domain/figures.js (whole file, 200 lines; the pod spec is lines 27-35)
    - app/src/domain/figures.test.js lines 1-70 (imports, the FIGURE_SPECS describe, the oliveOilVersion describe)
    - app/src/ui/GraduatedRule.test.jsx (whole file; the fat fixture at lines 10-21 stays as it is)
    - app/src/ui/PrintSheetPages.test.jsx lines 1-40 and 133-176 (imports, fragment, blocks, the PrintBalance describe and its balance helper)
    - app/src/ui/GraduatedRule.jsx lines 97-185 (RuleDrawing: toX, band rect, edges, hollow rect, tick, anchors)
    - .planning/sketches/010-bench-sheet/README.md, the "## Decisions" section (D30), and CONTRACT.md section 5, the Balance sentence
  </read_first>
  <behavior>
    Six new tests. Each one fails on the current 0 to 30 domain and passes on 0 to 40:
    - figures.test.js, in describe 'FIGURE_SPECS': (1) the six scales in render order are pac [0, 40], pod [0, 40], fat [0, 30], msnf [0, 15], sugar [0, 25], solids [25, 55], and `buildFigures(oliveOilVersion)`'s pod figure carries domain [0, 40]. (2) Sorbet's approved Sweetness band, 24 to 32, sits inside the pod domain, short of both ends: lo < 24 and 32 < hi.
    - GraduatedRule.test.jsx, a new describe for the Sweetness · POD rule on 0 to 40 (sketch 010 D30): (3) `RuleDrawing` for Olive Oil v1's pod figure draws band rect x 96 and width 32, edge lines at 96 and 128, the value tick at 104.369, and the board's anchors markup verbatim, ending `<span>40</span></div>`. (4) The pen state (Whole milk portion 1 at 110 g, with a figureDelta from Olive Oil v1's POD) draws the hollow rect at x 103.119, the value tick at 105.613 and the struck head `<span class="struck-value">13.0</span>13.2`. (5) Sorbet's band [24, 32] (value 28) draws edges at 192 and 256, both below 319, and a band width of 64.
    - PrintSheetPages.test.jsx, in describe 'PrintBalance — Balance in column 2 (E3, E4)': (6) the printed Sweetness gauge's band rect has x 96 and width 32, its edge lines are at 96 and 128, and its anchor spans read '0', 'inside 12–16', '40'.
    - Every numeric attribute is parsed with Number() and compared within 0.01, using the file's Math.abs convention; the anchors string is compared exactly. All 123 existing tests in the three files pass unchanged.
  </behavior>
  <action>
    RED. Add the six tests in the Behavior block (per D30). Name each `it` so it cites sketch 010 D30.

    figures.test.js: add tests (1) and (2) at the end of describe 'FIGURE_SPECS'. The file already imports FIGURE_SPECS, buildFigures and oliveOilVersion.

    GraduatedRule.test.jsx: add imports for buildFigures and describeDeviation from '../domain/figures.js' and for oliveOilVersion from '../data/olive-oil.js'. Then add one new describe at the end of the file holding tests (3), (4) and (5).
    - Add a local helper that returns the pod figure from `buildFigures(version)`.
    - Read the attributes from `renderToStaticMarkup(<RuleDrawing ... />)` with regexes:
      - band rect: `<rect x="…" y="4" width="…"`
      - band edges: every `<line x1="…" y1="2"`
      - value tick: the `<line x1="…" y1="0"` that carries `stroke-width="2.5"`
      - hollow rect: the `<rect x="…" y="0" width="2.5"` that carries `fill="none"`
    - Test (4) builds the draft with `structuredClone(oliveOilVersion)`, finds the row whose ingredientName is 'Whole milk', and sets `portions[0].grams` to 110. Never mutate oliveOilVersion itself. Its figureDelta is `{ key: 'pod', label, unit: '', decimals: 1, from: <Olive Oil v1 POD value>, to: <draft POD value>, changed: true }`.
    - Test (5) spreads Olive Oil v1's pod figure with value 28, band [24, 32] and `deviation: describeDeviation(28, [24, 32], 1, '')`.
    - Leave the existing fat fixture (`domain: [0, 30]`, line 16) and every existing test as they are.

    PrintSheetPages.test.jsx: add test (6) at the end of the PrintBalance describe. Use the existing `balance()` helper. Find the `.formulation-note__rule .ps-gauge` whose `.graduated-rule__label-word` text is 'Sweetness'. In its svg, `querySelector('rect')` is the band, because the hatch pattern holds a line, not a rect. `querySelectorAll('line[y1="2"]')` gives the two edges. Read the spans under `.graduated-rule__anchors`.

    Run `npm --prefix app test -- src/domain/figures.test.js src/ui/GraduatedRule.test.jsx src/ui/PrintSheetPages.test.jsx`. Confirm that exactly the six new tests fail and the 123 existing ones pass. Copy the failing test names into the SUMMARY as the RED evidence.

    GREEN. In app/src/domain/figures.js, in the pod spec only (key 'pod', line 32, not the fat spec at line 41), change `domain: [0, 30],` to `domain: [0, 40], // sketch 010 D30 (Mark, 2026-10-18): 0 to 40 like PAC, so Sorbet's 24–32 band shows both edges`. Change nothing else in figures.js. Do not touch GraduatedRule.jsx, PrintSheetPages.jsx or any stylesheet in this task, because RuleDrawing already derives everything from the domain. Re-run the three files (all 129 pass), then the full suite.

    Then run `grep -rnE "0, ?30\]" app/src`. Expect exactly two lines: the fat spec in figures.js and the fat fixture in GraduatedRule.test.jsx. If a third line turns up that restates the POD end, fix it and name it in the SUMMARY.

    Do not edit anything under .planning/sketches or .planning/canvas-generators, and do not change any sketch 011 board.

    Commit only these four files, with explicit paths: `git add app/src/domain/figures.js app/src/domain/figures.test.js app/src/ui/GraduatedRule.test.jsx app/src/ui/PrintSheetPages.test.jsx`. Never use `git add -A`, `git add .` or `git commit -a`. Message: `feat(261017-ttf): widen the Sweetness · POD rule to 0 to 40 (D30)`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/domain/figures.test.js src/ui/GraduatedRule.test.jsx src/ui/PrintSheetPages.test.jsx</automated>
    <fails_when>Vitest reports any failed test in the three files, or the total is not 3 files and 129 tests (123 baseline plus the six D30 tests). It also fails if the six new tests passed in the RED run before the figures.js edit, because then they do not test the change.</fails_when>
    <automated>npm --prefix app test</automated>
    <fails_when>Any test file fails, or the summary is not "96 passed" files and "3007 passed" tests. A drop below 3007 means a test was lost. A failure in RecipePage.shell.test.js means figures.js gained an import, and the domain module must stay framework-free.</fails_when>
    <automated>C=$(git log -1 --format=%H --fixed-strings --grep='feat(261017-ttf): widen the Sweetness') && test -n "$C" && git diff --name-only "$C^" "$C" && D=$(git show "$C" -- app/src/domain/figures.js) && printf '%s\n' "$D" | grep -c '^[-+] *domain: \[0, [34]0\]'</automated>
    <fails_when>The command exits non-zero (there is no Task 1 commit with that message). It also fails if the name list is anything other than exactly app/src/domain/figures.js, app/src/domain/figures.test.js, app/src/ui/GraduatedRule.test.jsx and app/src/ui/PrintSheetPages.test.jsx, or if the final count is not 2 (one removed `domain: [0, 30]` line and one added `domain: [0, 40]` line; any other count means a second spec was touched).</fails_when>
  </verify>
  <done>The pod spec reads `domain: [0, 40]` with its D30 comment, and the other five specs are unchanged. The six D30 tests failed before the edit and pass after it. The full suite shows 96 files and 3007 tests passing. One commit holds exactly the four files.</done>
</task>

<task type="auto">
  <name>Task 2: Measure the built Sweetness gauge in WebKit against the retaken sketch 010 boards; edit only if the app is wrong</name>
  <files>(only if the measurement shows the app is wrong) app/src/ui/GraduatedRule.jsx, app/src/styles/app.css, app/src/styles/print.css</files>
  <precondition>`/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs` exists and `webkit.launch()` from it succeeds. If it does not, stop and report it; do not install anything.</precondition>
  <read_first>
    - .planning/canvas-generators/p10-capture.mjs lines 1-50 (the WebKit pattern; read only, never edit, stage or commit it)
    - app/src/ui/GraduatedRule.jsx lines 97-185 (the svg's children, to choose selectors)
    - app/src/ui/PrintSheet.jsx lines 25-60 and 150-180 (the print route's page pictures, the picture scale and the fit scale)
    - .planning/sketches/010-bench-sheet/CONTRACT.md section 5, the Balance sentence (D30), and line 148 (the draft-kept notice)
  </read_first>
  <action>
    Measure first, then edit. Measure the real DOM; never reason from the CSS source. Every temporary file goes under SCR (the absolute scratch path in the context section): never /tmp, never app/dist, never the repo.

    Step 1, one Vite process only. Run `pgrep -fl vite`. If a Vite process is already running for this workspace, stop it first, because the project allows one Vite process per workspace. Record in the SUMMARY that you stopped it and what it was.

    Step 2, build. Run `npm --prefix app run build -- --outDir <SCR>/dist --emptyOutDir`.

    Step 3, write `<SCR>/measure.mjs`. It is a self-contained script that cleans up after itself.
    - Startup:
      - It exits 2 with a message if `pgrep -f vite` lists any process.
      - It then spawns `node app/node_modules/vite/bin/vite.js preview --outDir <SCR>/dist --host 127.0.0.1 --port 4199 --strictPort` with cwd `app/` (absolute paths).
      - It waits until http://127.0.0.1:4199/ answers 200, and kills that child in a `finally` and on SIGINT and SIGTERM. It never binds 0.0.0.0, never uses :4173, and never leaves the preview running.
    - It imports webkit from the playwright-core path above.
    - Every context has deviceScaleFactor 1 and a fine pointer (no hasTouch). Its routes abort any request whose URL is neither `file:` nor host 127.0.0.1. Await `document.fonts.ready` before reading.
    - Gauge choice, the same for app and board: inside a root element, take the `.formulation-note__rule` whose `.graduated-rule__label-word` text is 'Sweetness'.
    - What it reads, in CSS px from getBoundingClientRect, as offsets from the gauge svg's left edge:
      - the svg's width
      - the band rect (the svg's child rect that is not fill="none"): left and right
      - the two band-edge lines (child lines with y1="2"): left
      - the value tick (child line with stroke-width="2.5"): left
      - the hollow was tick (child rect with fill="none", when present): left and its centre
      - the eleven graduation lines (child lines with y1="18" and x1 equal to x2): left
      - the right anchor (last span under `.graduated-rule__anchors`): its text, and its inset from the svg's right edge
      - the left anchor's text
      - the raw user-unit attributes (band x and width, edge x1, tick x1, hollow x)
      - the gauge button's aria-label, where there is one
    - It also reads the five other gauges (Freezing, Fat, Milk solids, Sugar, Solids): band left and right, value tick and right anchor text, as an untouched check.

    Sources:
    - (A) The app pen at 1280×1000.
      - Go to `http://127.0.0.1:4199/` and wait for `.home__lead`. Then go to `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1`, wait for `.notebook-band`, and wait 300 ms.
      - Click `getByRole('button', { name: 'Next version' }).first()` and wait 500 ms. Click a `/^Balance, Show/` button if one exists.
      - Fill the visible `input[aria-label="Whole milk, grams, portion 1"]` with 110, press Tab, and wait 300 ms.
      - The Sweetness gauge's aria-label must equal the board's verbatim: "Sweetness · POD, was 13.0, now 13.2, target 12–16, estimated: Whole milk, Heavy cream, and Allulose". If it does not, and a Show changes control exists, click it once and read again. If it still differs, FAIL with both strings: the state was not reproduced, and nothing is compared.
    - (B) Board `.planning/sketches/010-bench-sheet/screen-draft-kept.html`, window `.p4d1`.
    - (C) Board `screen-draft-kept-words.html`, windows `.p4w1a` and `.p4w1b`.
      - Open each board as `file://` plus its absolute path, in a viewport of the file's own `$preview` width and height (read from its data-props with the regex the 03.5 probe harness uses: `"$preview"` then width).
    - (D) The app print route at 1280×1000, in a fresh context.
      - Seed at `/` as in (A), then go to `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/print`.
      - Wait until a button whose text is 'Print' is not disabled (the pages are laid). Use the first `.ps-page`.
      - Record the `--sheet-print-picture-scale` on `.print-route__pages` and the computed transform of page 1's `.ps-fit`.
    - (E) Board `sheet-page-1-formula.html`, at document level.
    - (F) Board `sheet-balance-col2.html`, at document level.

    Pass rule:
    - Compare (A) with each gauge in (B) and (C), and (D) with (E) and (F). Each must match within 1 px for:
      - the svg width
      - the band's left and right
      - both edge lines
      - the value tick
      - the hollow tick's centre (pen only)
      - the right anchor's inset
      - all eleven graduations
      - the five other gauges' band edges and ticks
    - The anchor texts must be exactly '0' and '40', and the other gauges' right anchors must equal the board's.
    - The script writes everything to `<SCR>/measure.json`, prints a table, and exits 1 on any failure, 0 otherwise.

    Step 4, run `node <SCR>/measure.mjs`, then decide.
    - Exit 0: the app matches the boards. Edit nothing, and there is no second commit.
    - The user-unit attributes differ from the board's (for example, the tick is not at 104.369): the drawing itself is wrong. Find the cause in GraduatedRule.jsx's markup or in the domain, fix it there, and keep the Task 1 tests green.
    - The attributes match but the px differ, and the difference is shared by all six gauges (the svg width, or the print picture scale or fit scale is not 1): the cause is layout, not D30, and it is outside this task. Do not fix it. Report both widths and scales in the SUMMARY as a finding for Mark.
    - The attributes match and only the Sweetness gauge's px differ: fix with the smallest rule. It reads existing custom properties from app/src/styles/tokens.css only, with no px, number or colour literal. Put it next to the gauge's existing rules in app/src/styles/app.css (screen) or app/src/styles/print.css (paper), with a short comment citing sketch 010 D30 and the measured numbers.
    - After any fix, rebuild (Step 2), re-run the script, and repeat until it exits 0.
    - The board quirk named in the context (the `hatch-pod-p4` id) is not a difference to fix.

    Step 5, clean up. Confirm `pgrep -fl vite` lists nothing from this task. Leave SCR in place for the record.
    - If you changed a file under app/src, commit only those files, with explicit `git add <path>` and the message `fix(261017-ttf): seat the Sweetness gauge where sketch 010 draws it (D30)`.
    - Never stage anything under .planning/sketches or .planning/canvas-generators.

    Step 6, read-only finding. Run `grep -l "Sweetness · POD" .planning/sketches/011-recipe-route-c/*.html` and, for those files, count which ones still end the Sweetness rule at 30. Report the count and the names in the SUMMARY for the orchestrator. Do not edit them.

    In the SUMMARY:
    - The measurement table. Rows: A, B .p4d1, C .p4w1a, C .p4w1b, D, E, F. Columns: svg width, band left, band right, left edge, right edge, value tick, hollow centre, right anchor text, right anchor inset, plus the user-unit attributes.
    - The verdict.
    - The print picture scale and fit scale.
    - Any fix with its before and after values.
    - Whether you stopped a running Vite process.
  </action>
  <verify>
    <automated>npm --prefix app run build -- --outDir /private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/26fd9527-06c0-4bfa-b5b0-7a67f6edff73/scratchpad/261017-ttf/dist --emptyOutDir && node /private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/26fd9527-06c0-4bfa-b5b0-7a67f6edff73/scratchpad/261017-ttf/measure.mjs</automated>
    <fails_when>The build fails or the script exits non-zero. Exit 1 means the app's Sweetness gauge differs from a board by more than 1 px in the band edges, value tick, hollow tick, right-anchor inset, graduations or svg width; an anchor is not '0' or '40'; another gauge moved; or the pen state's aria-label did not match the board's. Exit 2 means another Vite process was running.</fails_when>
    <automated>npm --prefix app test</automated>
    <fails_when>Any test fails, or the count is not 96 files and 3007 tests. A failure in app/src/styles/tokens.test.js or cross-cutting.test.js means a new CSS rule carries a literal or broke a rule order.</fails_when>
    <automated>test -z "$(pgrep -f 261017-ttf/dist)" && test -z "$(git status --porcelain -- app/)" && test -z "$(git log --name-only --format= 74c971c..HEAD -- .planning/sketches .planning/canvas-generators)" && test -z "$(find app/dist -newer app/src/domain/figures.test.js -print -quit)"</automated>
    <fails_when>The command exits non-zero. One of these holds: this task's preview is still running; a file under app/ is uncommitted or stray; a commit since 74c971c touched .planning/sketches or .planning/canvas-generators; or something in the gitignored app/dist is newer than Task 1's test edit, which means a build wrote into app/dist instead of SCR.</fails_when>
  </verify>
  <done>measure.mjs exits 0. The SUMMARY holds the table for A to F, the verdict, the print scales and the sketch 011 finding. Any app fix is the smallest one, re-measured and committed on its own; otherwise only Task 1's commit exists. No Vite process from this task is left running, and nothing was written into app/dist or under .planning/sketches.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | One constant changes in a pure domain module. No new input, store access, network call or dependency. The measurement serves the build on loopback only, for the length of the script. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261017-03 | Tampering | git staging in a dirty working tree (uncommitted sketch 010, canvas-generator, config and state changes) | low | mitigate | Each commit stages explicit paths only. The Task 1 commit's file list is pinned by its message, and Task 2's gate checks `git status --porcelain -- app/` and that no commit since 74c971c touches .planning/sketches or .planning/canvas-generators. |
| T-261017-04 | Information Disclosure | the measurement's `vite preview` | low | mitigate | measure.mjs binds 127.0.0.1:4199 with --strictPort, never --host 0.0.0.0 and never :4173. It serves only SCR/dist, kills the child in `finally` and on signals, and its browser contexts abort every request that is not file: or 127.0.0.1. Task 2's gate checks that no preview of this task remains. |
| T-261017-SC | Tampering | npm/pip/cargo installs | low | accept | No package install. The measurement uses the playwright-core already in the npx cache and the vite already in app/node_modules. Nothing is added to app/package.json. |
</threat_model>

<verification>
- `npm --prefix app test -- src/domain/figures.test.js src/ui/GraduatedRule.test.jsx src/ui/PrintSheetPages.test.jsx` passes with 3 files and 129 tests. `npm --prefix app test` passes with 96 files and 3007 tests.
- `RuleDrawing` for Olive Oil v1 draws the Sweetness band at 96 to 128, the tick at 104.37, and the anchors `0 · inside 12–16 · 40`, the same as sketch 010 sheet-page-1-formula.html. Sorbet's 24–32 band draws edges at 192 and 256 of 320.
- WebKit: the built app's Sweetness gauge matches screen-draft-kept.html (.p4d1), screen-draft-kept-words.html (.p4w1a, .p4w1b), sheet-page-1-formula.html and sheet-balance-col2.html within 1 px. The numbers are in the SUMMARY.
- `git log --name-only --format= --fixed-strings --grep='(261017-ttf)' 74c971c..HEAD` lists only the four Task 1 files and any Task 2 fix files. Nothing under .planning/sketches or .planning/canvas-generators is committed.
</verification>

<success_criteria>
- D30 is implemented: the Sweetness · POD rule runs 0 to 40 for every recipe, on screen and on paper, and Sorbet's 24–32 band shows both edges.
- The other five rules, the graduations and the baseline are unchanged.
- The real app matches the retaken sketch 010 boards, as measured in WebKit.
- No literal in CSS. The domain module stays framework-free. No stray Vite process, nothing written into app/dist, and no sketch file changed.
</success_criteria>

<output>
Create `.planning/quick/261017-ttf-widen-the-sweetness-pod-balance-rule-fro/261017-ttf-SUMMARY.md` when done. Include:
- the RED evidence (the six failing test names before the edit)
- the measurement table and verdict, with the print scales
- any fix with its before and after values
- any width or scale finding for Mark
- the sketch 011 finding
- whether a running Vite process was stopped

The executor does not touch Mark's List; the orchestrator closes the D30 rows after the run.
</output>
