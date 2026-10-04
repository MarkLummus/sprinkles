---
phase: quick-261004-igr
plan: 01
quick_id: 261004-igr
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - app/src/ui/Headnote.jsx
  - app/src/ui/Headnote.test.jsx
  - app/src/styles/app.css
  - app/src/styles/tokens.css
  - app/src/styles/cross-cutting.test.js
  - .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs
  - .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-labels-baseline.json
  - .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-title-baseline.json
  - .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-SUMMARY.md
autonomous: true
requirements: [REC1-02, BATCH2-02, UX1-01]

estimate:
  tokens: 90000
  raw_tokens: 90000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "From 724 up (decision 34 A, Mark 2026-10-04), every recipe-route fold row that carries a count or date (History, Tasting, Batches) reads from the left: label, control word, a dot, then the count or date. The gap from the control word's text to the count's text is 32px (within 1) at 744, 1024, 1366, 1600 and 1920 in Playwright WebKit and system Chrome, and within 0.5 of row A of info-labels-bands.html / info-labels-log.html read in the same engine and pointer. Each row is still one button, 44 tall, with the same x and width as before. FoldRow's markup and accessible names do not change."
    - "From 724 up, the log's batch head runs the date, then Correct and Record another 32px later on the same line (744, 1024). In the 350px log column (1366 and up) the actions wrap under the date 32px below it, as row A of info-labels-log.html draws: the head is 16px taller than before, and everything under it in the log moves down by exactly that amount."
    - "From 724 up, `.notebook-jump` computes justify-content flex-start and its status carries the same dot (decision 33 answer: the Go to batch row follows decision 34). The row stays hidden from 724, because showing it there is brief task 3, not this task. Below 724 Go to batch is unchanged."
    - "Below 724 (393 and 723) every fold row, the Go to batch row and the batch head measure the same as the pre-change baseline, within 0.5, in both engines. The phone does not change."
    - "In the Next version pen the Sheet title appears once (decision 35 A, Mark 2026-10-04). The pen renders no h1 in the Sheet, only the 'Sheet title' caption over one textarea set in the heading face: text face, 2rem, bold, pen blue, leading 1.15 through a token, and no box at rest. The old title is struck beneath only when the draft differs. In the same engine and pointer, the headnote's height is within 1px of row A of sheet-title-pen.html at 393, 1366 and 1600, both unchanged and changed. With the title unchanged it is about 61px shorter than the baseline in WebKit."
    - "The title field is never clipped. A 64-character title wraps (four lines at 393 in WebKit, matching the board) with scrollHeight no more than clientHeight + 1. The field is at least 44 tall. Enter adds no line, and a pasted newline becomes a space. The reading view and print still show the h1, unchanged."
    - "`npm --prefix app test` passes at 59 files with 1588 tests plus the new ones, none removed. `npm --prefix app run build` succeeds. Under app/, the 261004-igr commits touch only the seven files in files_modified. No commit touches .planning/sketches or .planning/canvas-generators."
  artifacts:
    - path: app/src/styles/notebook.css
      provides: "a (min-width: 724px) block, placed after the (max-width: 723.98px) block: fold row and jump start-aligned, the dot before the count and the jump status, the log's batch head start-aligned with --gap-l"
      contains: "@media (min-width: 724px)"
    - path: app/src/ui/Headnote.jsx
      provides: "developing mode without the h1; the Sheet title as a prose-field textarea with an Enter guard and newline stripping"
      contains: "headnote__sheet-title-field"
    - path: app/src/styles/app.css
      provides: "the .headnote__sheet-title-field .prose-field rule (board row A), replacing the .ink-field rule"
      contains: ".headnote__sheet-title-field .prose-field"
    - path: app/src/styles/tokens.css
      provides: "--sheet-leading-title: 1.15"
      contains: "--sheet-leading-title"
    - path: .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs
      provides: "labels-baseline / labels / labels-board / title-baseline / title / title-board groups against the built app and the three boards, in WebKit and system Chrome"
  key_links:
    - from: app/src/styles/notebook.css
      to: app/src/ui/FoldRow.jsx
      via: "the ::before dot on .fold-row__count is CSS, so FoldRow's markup and aria-label are untouched"
      pattern: "fold-row__count::before"
    - from: app/src/ui/Headnote.jsx
      to: app/src/ui/RecipePage.jsx
      via: "onChangePenField('sheetTitle', …) — the one consumer (~line 2028) passes handleChangePenField; the draft key is unchanged"
      pattern: "onChangePenField\\('sheetTitle'"
    - from: app/src/styles/app.css
      to: app/src/styles/tokens.css
      via: "line-height reads --sheet-leading-title (no literal leading in app.css)"
      pattern: "var\\(--sheet-leading-title\\)"
---

<objective>
Build sketch 011 brief tasks 9 and 10 from decision 33's app change brief. Mark approved decisions 34 and 35 on 2026-10-04.

Task 9, decision 34 A: from 724 up, the small info labels read from the left. That means label, control word, a dot, then the count, state or date, with the batch head's Correct and Record another following the date. Task 10, decision 35 A: in the Next version pen the Sheet title is one field that replaces the heading, with no box at rest and the "Sheet title" caption kept.

Authority: rows A of `.planning/sketches/011-recipe-route-c/info-labels-bands.html`, `info-labels-log.html` and `sheet-title-pen.html`, including their CSS. The generator source of row A's CSS is `.planning/canvas-generators/final.py`: lines 248-254 for decision 34 and 303-306 and 314-317 for decision 35. The spec is README.md lines 383-384 (the brief's items 9 and 10) and the decision 34 and 35 entries from line 402, with Mark's answers at lines 434 and 444.

Scope note (orchestrator's reading, recorded here so nobody re-decides it silently): Mark's answer (4) to decision 34 reads "Every width, not only from 724". The orchestrator read it as every width where the rule applies, with nothing changing below 724, which is the brief's acceptance. This plan builds that reading. No board draws option A at 393 or 723, and the sketch must be drawn before the app changes (sketch-first rule). So the phone is left as is, and the SUMMARY lists the question for Mark's List. A separate decision for the band's title-to-Version gap at 1366 and up is not part of this task.

Purpose: the small labels stop drifting 514 to 1,321px away from their row's label on wide windows, and the pen stops showing the Sheet title three times.

Output: one notebook.css media block, the Headnote pen change with its app.css rule and one token, tests written first, a probe that measures the build against a pre-change baseline and the three boards in WebKit and Chrome, and a SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md
@app/src/ui/Headnote.jsx
@app/src/ui/FoldRow.jsx
@app/src/ui/GoToBatch.jsx
@.planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs

<interfaces>
These are the facts the planner read at HEAD 361e127. Re-check them before relying on them.

Decision 34, the boards' row A CSS (final.py 248-254). The board applies it unscoped at each drawn width. The app scopes it to `(min-width: 724px)`.
- `.notebook .fold-row` gets justify-content flex-start.
- `.fold-row__count::before` gets content `"\00b7"` and margin-right `var(--app-notebook-recipe-rail-gap)` (14px).
- `.notebook-jump` gets justify-content flex-start.
- `.notebook-jump__status::before` gets the same dot and margin.
- `.notebook-log .batch-row__head` gets justify-content flex-start and gap `var(--gap-l)` (32px). This is `gap`, so both row-gap and column-gap.

Decision 34, the planner's WebKit readings of the boards (hasTouch, 7200 viewport; `.fp-info-R35C_InfoBands-A-0..4` = 744, 1024, 1366, 1600, 1920 and `.fp-info-R35C_InfoLog-A-0..2` = 744, 1024, 1366):
- Every fold row in row A computes flex-start. The count's ::before computes content `"·"`, margin-right 14px. Rows are 44 tall.
- History and Tasting gaps are 32 in every A panel. Today's panels read History 514 / 794 / 1141 / 1151 / 1321 and Tasting 439 / 719 / 130 (info-measure.json).
- Batch head A at 744 and 1024: one line, lead-to-acts 32, row-gap and column-gap 32px, height 44. At 1366 (the 350 column): wrapped, acts 32 below the lead, head 94.22 tall. Today's panel there reads 16 below, 78.22 tall.
- Go to batch on the boards shows at 744 and 1024 only because the board carries brief task 3's JUMP rule. A computes flex-start and the dot.
- The gap is Sid's measure (`.planning/canvas-generators/info-measure.mjs` line 9 onward): a Range over the count's contents (which excludes ::before), its left minus the Range-right of `.fold-row__control`. For the head it is the lead's last element child and the acts group.

Decision 34, the app:
- notebook.css 162-180, `.notebook .fold-row`: flex, width 100%, min-height `var(--touch-min)`, justify-content space-between, gap `var(--app-notebook-recipe-rail-gap)`.
- notebook.css 200-208 types `.notebook .fold-row__count, .notebook .notebook-jump__status`.
- notebook.css 212-214: `.notebook-jump { display: none }`. The `(max-width: 723.98px)` block (969-1021) shows it at 995-1004 with space-between.
- notebook.css 721-724, `.notebook-log .batch-row__head`: space-between, gap `var(--app-notebook-log-head-outer-gap)` (16px).
- Media blocks in file order: `(min-width: 1366px)` 880, `(max-width: 1365.98px)` 913, `(max-width: 723.98px)` 969, `(pointer: coarse)` 1032. The coarse block must stay at the file's foot (its comment says why).
- FoldRow.jsx renders `button.fold-row > span.fold-row__head (label, span.fold-row__control) + span.fold-row__count`, with a comma-joined aria-label. GoToBatch.jsx renders `a.notebook-jump` with `.notebook-jump__control` and `.notebook-jump__status` and an aria-label. Neither file changes: the dot is CSS.
- Brief tasks 1 to 6 are NOT built (only task 7 is, quick 261004-eoi). So from 724 the app has no sticky header, no D3 grid and no Go to batch row. Compare row-internal geometry only, never absolute page positions against a board.

Decision 34, the tests:
- notebook.test.js 40-48 pins exactly four media conditions in file order. The new block makes five: `(min-width: 1366px)`, `(max-width: 1365.98px)`, `(max-width: 723.98px)`, `(min-width: 724px)`, `(pointer: coarse)`.
- notebook.test.js 22-38: no hex and no bare px in notebook.css, and every selector starts with `.notebook`.
- notebook.test.js 392-427 pins the jump rules. Line 421-426 uses `rules.find` on selectors that include `.notebook .fold-row__count`, which returns the first match. The base rule at line 200 precedes the new block, so it still wins.
- `readAllRules` (app/src/styles/css-source.js line 93) collapses whitespace in a selector to one space, so a selector list reads `a, b`.

Decision 35, the board's row A (final.py 303-306, 314-317):
- The pen's h1 is removed. The `<input>` inside `label.headnote__sheet-title-field` becomes `<textarea class="prose-field" rows="1" aria-label="Sheet title">` holding the draft.
- CSS: `.headnote__sheet-title-field { margin-top: 0 }`, and `.headnote__sheet-title-field .prose-field` gets display block, font-family `var(--face-text)`, font-size `var(--sheet-size-recipe-name)`, font-weight 700, line-height 1.15, resize none, overflow hidden.
- Board headnote heights (title-measure.json, rects `a_0`..`a_6` = 393 same, 393 short, 393 long, 1366 same, 1366 short, 1600 same, 1600 short) are 254, 309, 382, 212, 233, 212, 233. As built ('today') they are 315, 336, 336, 273, 294, 273, 294.
- Panel class `.fp-tt-a-{0..6}`. Sid captured with `hasTouch: W <= 1366`, so 393 and 1366 are coarse and 1600 is fine. SHORT = 'Olive Oil Ice Cream, lighter', LONG = 'Olive Oil Ice Cream with a much longer title that goes on and on' (title-capture.mjs line 7).

Decision 35, the app:
- Headnote.jsx line 23 renders `<h1>` in every mode. Lines 30-62 hold the developing fragment: the title label (32-42) with `<input type="text" className="ink-field" disabled value aria-label="Sheet title" onChange>`, the struck title (43-45), the description label and textarea (46-57, prop order className, rows, disabled, placeholder, value, aria-label, onChange), the struck description (58-60) and the helper (61). The reading branch is line 64. The component has no hooks.
- app.css 476-480 `.headnote h1`. 496-499 `.headnote__sheet-title-field { display: block; margin-top: var(--gap-m) }`. 501-505 `.headnote__sheet-title-field .ink-field { font-family; font-size var(--sheet-size-recipe-name); font-weight 700 }`. 296-299: every textarea gets `field-sizing: content; resize: none`. 1407-1421 `.prose-field`: pen blue, no border, padding `var(--gap-hair) 0`, min-height `calc(var(--sheet-leading-note) * 1em)`, max-width `var(--measure-prose)`. Under `(pointer: coarse)` (~2400, ~2431), `.prose-field` gets min-height `--touch-min` and `.ink-field, .prose-field` font-size `--sheet-type-note`. Both are single-class rules, so the two-class title rule outranks them.
- No sheet-context 1.15 leading token exists. `--app-notebook-name-leading` is 1.15 but App context, and the two contexts keep prefixed tokens. tokens.test.js fails on any declared-but-unread token and on any token without a `--sheet-`/`--app-` prefix (shared list excepted). A new `--sheet-leading-title` read by app.css passes both.
- Tests pinning the old pen markup: Headnote.test.jsx line 81-84 (the `<input …>` regex) and 165-169 (`<input[^>]*disabled=""`). Line 34 and 52 pin the reading h1 and stay. RecipePage.test.jsx pins no h1 (line 233 is a dirty-check test). tabindex-scan.test.js exempts textareas. cross-cutting.test.js has `ruleFor(selector)` and `tokensSource`.
- Headnote is not inside a form (VersionRow's band form is separate), so Enter in the old input did nothing either.

Probe building blocks:
- The 03.5 harness exports `startServers`, `launch` (system Chrome), `openBoard(browser, repoUrl, file, { width, coarse })` (it resolves `file` in sketch 011 and asserts the pointer), `APP_ROUTE` (Olive Oil v1's batch), `recordAnotherBatch(page, isoDate)`, `check` and `finish`.
- Copy the playwright-core `webkit` import line from 261004-eoi-probe.mjs line 22 and its contexts: `viewport { width, height: 1000 }`, `hasTouch: coarse`, `isMobile: false`, `deviceScaleFactor: 1`, abort every non-127.0.0.1 request, and assert matchMedia pointer and innerWidth.
- Mexican Chocolate v3's batch route is `/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01` (final-capture.mjs line 11). It carries History with a count, Go to batch and a batch head.
- Suite baseline: 59 files, 1588 tests, all passing (261004-eoi SUMMARY).
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Brief task 9 (decision 34 A): baseline the rows, pin the start-aligned rule (RED), add the 724-up block (GREEN), measure the build against the baseline and the two info-label boards</name>
  <files>.planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs, .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-labels-baseline.json, app/src/styles/notebook.test.js, app/src/styles/notebook.css</files>
  <precondition>playwright-core's WebKit at the npx path in 261004-eoi-probe.mjs line 22 and system Chrome both run (261004-eoi used them on 2026-10-04); `npm --prefix app test` is green at 59 files / 1588 tests.</precondition>
  <read_first>app/src/styles/notebook.css (lines 154-214, 716-736, 965-1038), app/src/styles/notebook.test.js (lines 1-50, 388-427), app/src/styles/css-source.js (lines 80-112), .planning/canvas-generators/final.py (lines 243-290; read only), .planning/canvas-generators/info-measure.mjs (read only), .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs (lines 1-60 and its context and finish handling), .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (lines 84-125, 181-260), .planning/sketches/011-recipe-route-c/README.md (lines 383, 402-434; read only)</read_first>
  <behavior>
    - Test 1 (update): the media-steps test in notebook.test.js expects five conditions in file order: (min-width: 1366px), (max-width: 1365.98px), (max-width: 723.98px), (min-width: 724px), (pointer: coarse). Its title names the new step as "the small info labels start-aligned, sketch 011 decision 34". RED before.
    - Test 2: the rule `.notebook .fold-row` under (min-width: 724px) declares justify-content flex-start. The top-level `.notebook .fold-row` still declares space-between. RED before.
    - Test 3: one rule under (min-width: 724px) with the selector `.notebook .fold-row__count::before, .notebook .notebook-jump__status::before` declares content `"\00b7"` and margin-right `var(--app-notebook-recipe-rail-gap)`. No other rule in the file mentions `::before` on either class. RED before.
    - Test 4: `.notebook-jump` under (min-width: 724px) declares justify-content flex-start and no display. Showing the row from 724 is brief task 3. RED before.
    - Test 5: `.notebook-log .batch-row__head` under (min-width: 724px) declares justify-content flex-start and gap `var(--gap-l)`. The top-level rule still declares space-between and `var(--app-notebook-log-head-outer-gap)`. RED before.
    - Existing tests 392-427 (the jump rules below 724, the shared typography) pass before and after, unchanged.
  </behavior>
  <action>
Run steps 1 to 3 before notebook.css is edited.

Step 1, the suite baseline. Run `npm --prefix app test` and write down the counts (59 files and 1588 tests expected). If the suite is not green, stop and report.

Step 2, the probe. Write 261004-igr-probe.mjs in the quick directory. It takes a comma list of groups. This task writes `labels-baseline`, `labels` and `labels-board`, and Task 2 adds the title groups. Set it up the way 261004-eoi-probe.mjs is: the harness import by relative path `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs`, the same webkit import line, one fresh context per cell with eoi's options, non-127.0.0.1 requests aborted, the pointer and innerWidth asserted, wait for `.notebook` and `document.fonts.ready`, and end with `finish`. Do not import or edit anything under .planning/canvas-generators or .planning/sketches.
- Cells: WebKit at 393, 723, 744, 1024 and 1366 with coarse true, and at 1600 and 1920 with coarse false (Sid's convention). System Chrome via `launch()` at all seven widths with coarse false. Two routes: 'mex3' (the Mexican Chocolate v3 batch route) and 'olive1' (APP_ROUTE). Plus 'olive1-two', in WebKit at 393 and 1024 only: APP_ROUTE, then `recordAnotherBatch(page, '2026-09-01')` in the throwaway context, so a Batches fold row with a count exists.
- In-page reader:
  - `folds`: for every `.notebook .fold-row`, record its label (the head's text before Show or Hide), rect {x, y, w, h}, computed justifyContent, `gap` (Sid's Range measure, null with no count) and `before` {content, marginRight} from `getComputedStyle(count, '::before')`.
  - `jump`: display, justifyContent, the status' `before`, the rect, and the gap when displayed.
  - `head`: for `.notebook-log .batch-row__head`, the rect, `wrapped` (acts top at or below lead bottom), `hgap` (one line: acts left minus the lead's last child right), `vgap` (wrapped: acts top minus lead bottom), rowGap, columnGap, justifyContent, and the acts' left minus the lead's left. Also the y of every `.notebook-log .fold-row` and of the tasting section's heading, for the shift check.
  - `overflow`: scrollWidth minus innerWidth.
- `labels-baseline` reads every cell and writes 261004-igr-labels-baseline.json, but only when this precondition holds: at 744 and up the History gap and the Tasting gap exceed 100 (the far end), the head is one line at 744 and 1024 and wrapped at 1366 and up, the jump shows at 393 and 723 and computes display none at 744 and up, and no count has a ::before. If it fails, stop and report: the cause is not what the plan assumes.
- `labels` compares every cell against the baseline:
  - Below 724: every reading equals the baseline within 0.5, overflow included.
  - From 724, every fold row with a count: justifyContent flex-start, before content `"·"` and marginRight 14px, |gap − 32| ≤ 1, and x, w and h equal the baseline's, with h ≥ 44.
  - From 724, a fold row without a count: its rect equals the baseline's, apart from the log shift below.
  - From 724, the jump: display equals the baseline's (none), justifyContent flex-start, the status' before is `"·"` at 14px, and |gap − 32| ≤ 1 only if it is displayed.
  - From 724, the head: justifyContent flex-start, rowGap and columnGap 32px.
    - One line: |hgap − 32| ≤ 0.5 and the height equals the baseline's.
    - Wrapped: |vgap − 32| ≤ 0.5, height = baseline + 16 ± 0.5, and the acts' left equals the lead's left.
  - Every band element's y equals the baseline's. Every log element under the head moves by exactly the head's height change, within 0.5.
  - Overflow equals the baseline's.
- `labels-board` opens info-labels-bands.html and info-labels-log.html with `openBoard(browser, servers.repoUrl, file, { coarse })`, in WebKit (coarse true and false) and in Chrome (coarse false). It reads the row A panels with the same reader scoped to each `.fp-win`: `.fp-info-R35C_InfoBands-A-{0..4}` = 744, 1024, 1366, 1600, 1920 and `.fp-info-R35C_InfoLog-A-{0..2}` = 744, 1024, 1366.
  - Compare each app cell with the board panel at the same width, in the same engine and pointer. The History gap (mex3), the Tasting gap (olive1), the head's hgap or vgap and row height (olive1, log panels) must match within 0.5, and the before content and justifyContent must be equal.
  - Go to batch: compare only the computed justifyContent and before, since the app hides the row from 724.
- Print one JSON line per cell with the numbers the SUMMARY needs. Bind only ephemeral 127.0.0.1 ports through the harness. Never request :4173, :5173 or :8011, and start no Vite process.

Step 3, the baseline. Run `npm --prefix app run build` on the unchanged source, then run the probe's `labels-baseline` group. It must exit 0 and write the JSON.

Step 4, RED. Write Tests 1 to 5 from `<behavior>` in app/src/styles/notebook.test.js. Put Tests 2 to 5 in a new describe block named 'small info labels start-aligned from 724 (sketch 011 decision 34 A, Mark 2026-10-04; quick 261004-igr)', using the file's `rules` and a `rule.media === '(min-width: 724px)'` filter. Run `npm --prefix app test -- src/styles/notebook.test.js` and confirm Tests 1 to 5 fail and every other test passes. Commit only that file by explicit path: `test(261004-igr): pin the start-aligned info labels from 724 (sketch 011 decision 34)`.

Step 5, GREEN. In app/src/styles/notebook.css, add one `@media (min-width: 724px)` block after the `(max-width: 723.98px)` block and before the `(pointer: coarse)` block, which stays last. It holds four rules, each the board's row A declaration for declaration (per decision 34 A and decision 33's answer for Go to batch):
- `.notebook .fold-row` with justify-content flex-start.
- `.notebook .fold-row__count::before, .notebook .notebook-jump__status::before` with content `"\00b7"` and margin-right `var(--app-notebook-recipe-rail-gap)`.
- `.notebook-jump` with justify-content flex-start only.
- `.notebook-log .batch-row__head` with justify-content flex-start and gap `var(--gap-l)`.

Above the block, write a comment that cites sketch 011 decision 34 A (Mark 2026-10-04), the boards info-labels-bands.html and info-labels-log.html row A, and the 32px result. The comment should also say:
- the dot is CSS so the accessible names are unchanged
- the jump rule waits for brief task 3 to show the row from 724
- in the 350px log column the wrapped actions sit 32px under the date, as the board draws
- below 724 nothing changes (the orchestrator's reading of Mark's answer 4)

Do not touch FoldRow.jsx, GoToBatch.jsx, any other rule, token or file. Run the test file until it is green. Rebuild, run the probe's `labels,labels-board` groups and get exit 0.

Commit notebook.css, the probe and the baseline JSON by explicit path: `fix(261004-igr): start-align the small info labels from 724 with a dot separator (sketch 011 decision 34, brief task 9)`. Never use `git add -A`. Never stage anything under .planning/sketches, .planning/canvas-generators or .impeccable: README.md there carries the orchestrator's uncommitted record of Mark's answers, and the untracked critique files are Sid's.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/notebook.test.js && npm --prefix app run build && node .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs labels,labels-board && test -s .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-labels-baseline.json && SUBJECTS="$(git log --format=%s --grep='261004-igr')" && printf '%s\n' "$SUBJECTS" | grep -qF 'test(261004-igr): pin the start-aligned info labels' && printf '%s\n' "$SUBJECTS" | grep -qF 'fix(261004-igr): start-align the small info labels'</automated>
  </verify>
  <done>
- The baseline JSON was captured from a build of the unchanged source, and its precondition passed.
- The RED commit fails Tests 1 to 5 before the change.
- The GREEN commit adds only the one media block and its comment.
- The probe's labels groups pass in both engines: the gap is 32 at 744 to 1920 and matches row A, rows are unchanged in box, the head runs date then actions, and nothing changes below 724.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Brief task 10 (decision 35 A): baseline the pen's Sheet front matter, pin one title field (RED), replace the pen's h1 and input with a heading-faced textarea (GREEN), measure against sheet-title-pen.html row A</name>
  <files>.planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs, .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-title-baseline.json, app/src/ui/Headnote.test.jsx, app/src/styles/cross-cutting.test.js, app/src/ui/Headnote.jsx, app/src/styles/app.css, app/src/styles/tokens.css</files>
  <read_first>app/src/ui/Headnote.jsx (whole file), app/src/ui/Headnote.test.jsx (whole file), app/src/styles/app.css (lines 292-299, 470-530, 850-862, 1400-1430, 2390-2435), app/src/styles/tokens.css (lines 30-45), app/src/styles/cross-cutting.test.js (lines 30-60 for the helpers, 525-545, 605-615), app/src/styles/tokens.test.js (lines 71-130), .planning/canvas-generators/final.py (lines 293-346; read only), .planning/canvas-generators/title-capture.mjs and title-measure.json (read only), .planning/sketches/011-recipe-route-c/README.md (lines 384, 436-444; read only)</read_first>
  <behavior>
    - Test A (new, Headnote.test.jsx): the developing markup contains no `<h1` and no `<input`, and starts with `<header class="headnote"><label class="headnote__sheet-title-field"><span class="pen-caption">Sheet title</span><textarea`. RED before.
    - Test B (replaces the case at line 81): the title field matches `<label class="headnote__sheet-title-field"><span class="pen-caption">Sheet title</span><textarea class="prose-field" rows="1" aria-label="Sheet title">` followed by the draft title (Olive Oil v1's sheetTitle) and `</textarea></label>`. RED before.
    - Test C (replaces the case at line 165): with isSaving true, exactly two `<textarea[^>]*disabled=""` matches (title and description). RED before.
    - Test D (new): call `Headnote({...props, mode: 'developing', penDraft, onChangePenField: spy})` directly (the component has no hooks) and walk the returned element tree, through props.children arrays and fragments, to the element whose props['aria-label'] is 'Sheet title'. Then:
      - onKeyDown({ key: 'Enter', preventDefault }) calls preventDefault once
      - onKeyDown({ key: 'a', preventDefault }) does not call it
      - onChange({ target: { value: 'Line one\r\nLine two\nend' } }) calls onChangePenField with ('sheetTitle', 'Line one Line two end')
      - RED before
    - Test E (new, cross-cutting.test.js, describe 'the Sheet title field in the pen (sketch 011 decision 35 A; quick 261004-igr)'):
      - `ruleFor('.headnote__sheet-title-field .prose-field')` declares display block, font-family var(--face-text), font-size var(--sheet-size-recipe-name), font-weight 700, line-height var(--sheet-leading-title), resize none and overflow hidden
      - no rule has the selector `.headnote__sheet-title-field .ink-field`
      - the `.headnote__sheet-title-field` rule declares no margin-top
      - tokensSource declares `--sheet-leading-title: 1.15`
      - RED before
    - Guards that pass before and after: the reading tests at lines 32-55 (the h1 and the exact reading markup), the struck-title case at 148, the description cases, and 'carries the printed-paragraph treatment'.
  </behavior>
  <action>
Run steps 1 and 2 before Headnote.jsx, app.css or tokens.css is edited.

Step 1, the probe. Add three groups to 261004-igr-probe.mjs: `title-baseline`, `title` and `title-board`.
- Cells: WebKit at 393 and 1366 with coarse true and at 1600 with coarse false (Sid's capture convention). System Chrome at 393, 1366 and 1600 with coarse false.
- Each cell runs states 'same', 'short' (SHORT) and 'long' (LONG) on APP_ROUTE, each in a fresh context.
- Per state:
  - First read the reading view: the `.headnote h1` text and rect, and the `.headnote` rect.
  - Click the first button named 'Next version' and wait for `getByLabel('Sheet title', { exact: true })`. For 'short' and 'long', fill that field, then wait 150ms.
  - Read:
    - the `.headnote` rect
    - the number of h1 inside `.headnote`
    - the title field's tagName, rect, clientHeight, scrollHeight, clientWidth and scrollWidth
    - its computed font-size, font-weight, line-height, paddings, border-top-width and border-bottom-width, and color
    - the description textarea's color
    - the caption `.headnote__sheet-title-field .pen-caption` rect
    - whether `.prose-struck-beneath` holds the old title
    - the line count, round((clientHeight − vertical padding) / line-height in px)
    - overflow
  - In 'same' only:
    - Click the field, press End, press Enter, and read the value and the headnote height.
    - Fill 'Line one\nLine two' and read the value.
    - Click the first button named exactly 'Cancel', wait for `.headnote h1`, and read its rect.
    - Run `page.emulateMedia({ media: 'print' })` and read the h1's computed display and height. Return to screen.
  - Nothing is saved: the context is thrown away.
- `title-baseline` writes 261004-igr-title-baseline.json, but only when this precondition holds in every cell: the pen shows 1 h1 and an INPUT for Sheet title, and the 'long' input overflows (scrollWidth > clientWidth). Otherwise stop and report.
- `title` checks, in every cell:
  - 0 h1 in the pen, and a TEXTAREA with class prose-field
  - font-size 32px and weight 700, border-top and border-bottom 0px, and color equal to the description's
  - the caption's bottom at or above the field's top, and the field at least 44 tall
  - scrollHeight ≤ clientHeight + 1 in every state (never clipped)
  - the struck title present exactly when the state is not 'same'
  - Enter leaves the value and the headnote height unchanged, and the paste gives 'Line one Line two'
  - the reading-view h1 rect equals the baseline's before the pen opens and after Cancel, and print shows it (display not none, height above 0)
  - overflow equals the baseline's
  - Print each cell's headnote height beside the baseline's and the difference. Expect about −61 for 'same' in WebKit.
- `title-board` opens sheet-title-pen.html with `openBoard(browser, servers.repoUrl, 'sheet-title-pen.html', { coarse })`, in WebKit (coarse true and false) and in Chrome (coarse false). It reads `.fp-tt-a-{0..6} .headnote` heights and the title textarea's line count. The panel order is 393 same, 393 short, 393 long, 1366 same, 1366 short, 1600 same, 1600 short.
  - Each app cell that has a panel must match the board read in the same engine and pointer: headnote height within 1, and for 393 long the same line count (4 in WebKit at plan time).
  - The 1366 and 1600 'long' cells have no panel. Only the clipping check applies to them.

Step 2, the baseline. Run `npm --prefix app run build` (Task 1's CSS is in it, and the headnote is untouched), then the `title-baseline` group. It must exit 0.

Step 3, RED. Write Tests A to D in app/src/ui/Headnote.test.jsx: replace the cases at lines 81 and 165 with B and C, and add A and D. Write Test E in app/src/styles/cross-cutting.test.js. Run `npm --prefix app test -- src/ui/Headnote.test.jsx src/styles/cross-cutting.test.js` and confirm A to E fail and the guards pass. Re-grep `grep -rn "Sheet title\|<h1\|sheet-title-field" app/src --include='*.test.*'` for any other pin of the pen's h1 and input pair. Update one if found (the planner found none) and name it in the SUMMARY. Commit only the test files by explicit path: `test(261004-igr): pin the Sheet title as one field in the pen (sketch 011 decision 35)`.

Step 4, GREEN (per decision 35 A: one field replaces the heading, no box at rest, the caption kept).
- app/src/ui/Headnote.jsx:
  - Render the h1 only outside the developing mode. The reading branch becomes the h1 then the existing `headnote__prose` paragraph, so the reading markup stays byte-identical.
  - In the developing fragment, replace the input with a textarea, props in this order: className 'prose-field', rows "1", disabled {isSaving}, value {penDraft.sheetTitle}, aria-label "Sheet title", onKeyDown and onChange.
    - onKeyDown calls preventDefault when event.key is 'Enter'.
    - onChange passes event.target.value with every run of CR or LF characters replaced by one space to `onChangePenField('sheetTitle', …)`.
  - Keep the caption span, the struck title, the description, its struck line and the helper exactly as they are.
  - Do not add tabIndex: the scan exempts textareas, and the description textarea carries none.
  - Do not add the `prose-field--empty` class: the board draws no empty title.
  - Update the file's header comment and the inner JSX comment. In the pen the title field replaces the heading (sketch 011 decision 35 A, Mark 2026-10-04, sheet-title-pen.html row A), and the h1 stays in the reading view and print.
- app/src/styles/app.css:
  - In `.headnote__sheet-title-field`, delete the margin-top declaration (the label is now the block's first child; the board sets it to 0).
  - Replace the `.headnote__sheet-title-field .ink-field` rule with `.headnote__sheet-title-field .prose-field`. Its declarations are display block, font-family var(--face-text), font-size var(--sheet-size-recipe-name), font-weight 700, line-height var(--sheet-leading-title), resize none and overflow hidden.
  - Rewrite that rule's comment: board row A; two classes so it outranks the single-class coarse font-size and min-height rules; field-sizing: content (the textarea rule above) makes it grow; no box at rest, the global :focus-visible ring is the focus cue.
- app/src/styles/tokens.css: add `--sheet-leading-title: 1.15;` beside the other `--sheet-leading-*` tokens, with a comment naming sheet-title-pen.html row A (decision 35) as its source.

Change nothing else: not the reading or print markup, RecipePage.jsx, the draft key, the save path, or any other rule or token.

Run the two test files until green, plus `npm --prefix app test -- src/styles/tokens.test.js`. Rebuild and run the probe's `title,title-board` groups to exit 0.

If a WebKit or Chrome cell shows the title clipped (no field-sizing support), record the engine and numbers and stop for the orchestrator. Do not add a JS autosize.

Commit Headnote.jsx, app.css, tokens.css, the probe and the title baseline JSON by explicit path: `fix(261004-igr): the Sheet title is one field in the Next version pen (sketch 011 decision 35, brief task 10)`. Same staging rules as Task 1.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/Headnote.test.jsx src/styles/cross-cutting.test.js src/styles/tokens.test.js && npm --prefix app run build && node .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs title,title-board && test -s .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-title-baseline.json && SUBJECTS="$(git log --format=%s --grep='261004-igr')" && printf '%s\n' "$SUBJECTS" | grep -qF 'test(261004-igr): pin the Sheet title as one field' && printf '%s\n' "$SUBJECTS" | grep -qF 'fix(261004-igr): the Sheet title is one field'</automated>
  </verify>
  <done>
- The title baseline was captured before the edit, and its precondition passed.
- Tests A to E were RED, then GREEN, and the reading and description guards pass throughout.
- The pen shows the title once, in a heading-faced, unboxed, growing textarea under its caption.
- The headnote matches sheet-title-pen.html row A within 1px wherever a panel exists, about 61px shorter unchanged.
- The long title wraps unclipped, Enter and pasted newlines add no line, and the reading view and print keep the h1.
  </done>
</task>

<task type="auto">
  <name>Task 3: Re-run every probe group, the full suite and the build, check the scope, and write the SUMMARY</name>
  <files>.planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-SUMMARY.md</files>
  <read_first>.planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs, both baseline JSONs, .planning/canvas-generators/info-measure.json and title-probe.json (Sid's before-readings; read only)</read_first>
  <action>
app/dist must be built from the final code. Run the probe with `labels,labels-board,title,title-board`. It must exit 0. If a cell fails, find the cause before changing anything:
- In Headnote.jsx or notebook.css: add a test first, fix it, and commit by explicit path.
- A difference from a board that the board's own CSS explains (for example a pointer-dependent size): record it with the numbers for Mark and do not change the CSS.

Run `npm --prefix app test`. It must pass at 59 files, with 1588 tests plus Tasks 1 and 2's new ones, none removed. Then run `npm --prefix app run build`. Then run the scope check in `<verify>`.

Write 261004-igr-SUMMARY.md with:
- The two changes as built, the RED-then-GREEN evidence for each, and the re-grep results.
- A labels table, one row per cell (engine, pointer, width, route): the History, Tasting and Batches gaps before and after, the head's hgap or vgap and height before and after, the log shift, and overflow. Add the row A board readings beside the app's.
- A title table, one row per cell and state: the headnote height before and after and the difference, the board's row A height, the field's height, its lines, scrollHeight minus clientHeight, and the Enter, paste, reading and print results.
- Sid's before-readings beside the probe baselines.
- The test count as 59 files and N tests, with the delta from 1588.
- A "For Mark's List" section. The orchestrator writes the rows, so the executor does not. It holds:
  - (1) A device check, deferred, both changes: on the iPad at 1366 and 1024, History and Tasting read label, Show or Hide, dot, count or date, and the batch head runs the date then Correct and Record another. On the iPhone at 393 nothing changed. In Next version the title is one field under its caption: tap it, type, press return (no new line), Cancel. Note that field-sizing in Mobile Safari is unverified.
  - (2) Decision 34 at the phone. Mark's answer (4) reads "Every width, not only from 724". This run left below 724 unchanged on the orchestrator's reading, and no board draws A at 393 or 723.
  - (3) An observation. Row A's `gap` puts the 350px log column's wrapped actions 32px under the date, not 16, which makes the head 16px taller at 1366 and up. The decision 34 entry says heights do not change.
  - (4) Go to batch's dot from 724 is in the CSS but not yet visible, until brief task 3 shows the row there.

State plainly that every reading comes from Playwright WebKit and system Chrome, not from Mark's devices. Rebuilding app/dist already updates what Mark's :4173 preview serves. Do not start, stop or request that preview, and leave :5173 and :8011 alone.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && node .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs labels,labels-board,title,title-board && test -f .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-SUMMARY.md && test -z "$(git status --porcelain app/)" && TOUCHED="$(git log --name-only --format= --grep='261004-igr')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/styles/(notebook\.css|notebook\.test\.js|app\.css|tokens\.css|cross-cutting\.test\.js)$|^app/src/ui/Headnote\.(jsx|test\.jsx)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/(sketches|canvas-generators)/'</automated>
    <human-check>Deferred to Mark (end-of-run UAT, a row on Mark's List). Device UAT is served from the build. His running preview already serves the rebuilt app/dist, so a hard reload is enough.
(1) iPad at 1366 landscape and 1024 portrait, Mexican Chocolate v3 and Olive Oil v1: History reads "History  Hide · 4 versions" from the left, Tasting reads "Tasting  Show · tasted date unknown", and the batch head reads the date, then Correct and Record another. Each row is still one tap.
(2) iPhone at 393: those rows look as they did before.
(3) Next version on both devices: the Sheet title shows once, as a large field under "Sheet title". Type a long title and it wraps. Return adds no line. Cancel, and the heading is back.
The change counts as device-verified only when Mark confirms.</human-check>
  </verify>
  <done>
- Every probe group exits 0 in both engines.
- The full suite passes with the new tests counted, and the build succeeds.
- Under app/, the commits touch only the seven planned files. Nothing touches .planning/sketches or .planning/canvas-generators.
- The SUMMARY records every number and lists the four items for Mark's List.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker input to the pen's draft | the Sheet title textarea takes typed or pasted text into penDraft.sheetTitle. It renders as text, never markup. |
| probe to local servers | the probe serves app/dist and the repo tree on ephemeral 127.0.0.1 ports and drives throwaway browser contexts |
| executor to shared working tree | Sid works in .planning/sketches and .planning/canvas-generators. The orchestrator's uncommitted README.md edit and untracked .impeccable critique files sit in the tree. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-igr-01 | Tampering | Headnote.jsx Sheet title textarea | low | mitigate | The value stays a React-controlled text value (no dangerouslySetInnerHTML). onChange only replaces CR and LF runs with a space before the existing onChangePenField. The save path, the draft key and the store are untouched, and Test D pins the guard. |
| T-igr-02 | Denial of Service | the probe against Mark's :4173 preview, the :5173 dev port and Sid's :8011 | low | mitigate | The harness binds only ephemeral 127.0.0.1 ports, aborts every non-127.0.0.1 request, and closes its servers and browsers. No Vite process starts. recordAnotherBatch and the pen run in throwaway contexts, and nothing reaches Mark's IndexedDB. |
| T-igr-03 | Tampering | other agents' files in the shared tree | medium | mitigate | Commits are made by explicit path, never `git add -A`. Task 3's verify fails if a 261004-igr commit touches .planning/sketches or .planning/canvas-generators, or an app/ file outside the seven planned. README.md's uncommitted answers are never staged. |
| T-igr-04 | Repudiation | a count or status whose dot reads as part of its text | low | accept | The dot is CSS ::before. FoldRow and GoToBatch keep their aria-label, so the accessible names ('History, Hide, 4 versions') are unchanged, and FoldRow.test.jsx and GoToBatch.test.jsx keep passing. |
| T-igr-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. The probe uses the playwright-core and WebKit already on disk and system Chrome. If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- Both baselines were captured from builds before their own edits, each with its precondition asserted.
- `npm --prefix app test` passes at 59 files, with 1588 tests plus the new ones, none removed. `npm --prefix app run build` succeeds.
- `node .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs labels,labels-board,title,title-board` exits 0 in WebKit and system Chrome.
- Under app/, only notebook.css, notebook.test.js, Headnote.jsx, Headnote.test.jsx, app.css, tokens.css and cross-cutting.test.js changed.
</verification>

<success_criteria>
- From 724 up, History, Tasting and Batches read label, Show or Hide, dot, count or date from the left, 32px from the control word, matching the info-label boards' row A. The batch head runs the date, then Correct and Record another. Each row is still one full-width 44px target. The phone is unchanged.
- In the Next version pen the Sheet title is one unboxed, heading-faced field under its "Sheet title" caption, matching sheet-title-pen.html row A within 1px and about 61px shorter. It wraps instead of clipping and never takes a newline. The reading view and print keep the h1.
</success_criteria>

<output>
Create `.planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-SUMMARY.md` when done (Task 3 writes it).
</output>
