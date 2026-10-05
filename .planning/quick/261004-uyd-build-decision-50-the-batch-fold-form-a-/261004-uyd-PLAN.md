---
phase: quick-261004-uyd
plan: 01
quick_id: 261004-uyd
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/RecipePage.folds.test.jsx
  - app/src/ui/RecipePage.recordTasting.test.jsx
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs
  - .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-SUMMARY.md
autonomous: true
requirements: [BATCH2-02, UX1-01]

estimate:
  tokens: 100000
  raw_tokens: 100000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Decision 50 A: with no pen open and a batch in view, the Batch head is one fold row inside h2#batch, built like the Tasting head: BATCH, Hide or Show, a dot, then 'churned 2 Aug 2026'. The date is 12px secondary grey, the same computed size and colour as the Tasting row's date, with the same dot. The button's accessible name is 'Batch, Hide, churned 2 Aug 2026'."
    - "Decision 50 C1: the Batch fold is open on first load at every width (393, 744, 1024, 1366). Crossing 1366 either way does not open or close it. Hide hides the whole batch body (cells, notes, Tasting with its own fold, Next time, Recorded). The head stays, with Correct and Record another."
    - "Head height, coarse pointer, WebKit and Chrome: 88px at 393 and 1366, 44px at 724 and 1024. At 723 it is 88px, because the narrow rule uses the existing 723.98px breakpoint (the brief's container-query form read 44 there). The SUMMARY reports this plainly. Closed, the section is exactly the head's height."
    - "From 724 to 1365, Correct starts 32px after the date, on the fold row's line. At 393, 723 and 1366 the fold row takes the whole row, and Correct and Record another stand directly under it, with no gap."
    - "The record pen, the amend pen (Correct, Record a tasting), the plan pen and the no-batch state keep their head exactly as built. The record pen and no-batch show the heading alone. The amend and plan pens show the heading and the .batch-row__date span. None of them carries a fold row."
    - "Go to batch lands focus on h2#batch with the Batch fold open. The landing ring wraps the fold row's box and no ancestor clips it (393 and 1024)."
    - "Each test is committed before its code. `npm --prefix app test` passes. Every control keeps tabIndex={0}. No build and no Vite process. app/dist and :4173 are read only."
  artifacts:
    - path: app/src/ui/BatchRow.jsx
      provides: "the Batch fold: FoldRow in h2#batch where openPen === null and a batch is in view, useFold(true), and the batch body wrapped in div#fold-batch"
      contains: "controls=\"fold-batch\""
    - path: app/src/styles/notebook.css
      provides: "the fold head's layout rules, scoped with :has(.fold-row) so pen and no-batch heads keep their computed style"
      contains: ".notebook-log .batch-row__head:has(.fold-row)"
    - path: app/src/ui/BatchRow.test.jsx
      provides: "the Batch fold head markup, C1 at foldsOpen false, the body inside the fold, and the pen and no-batch heads unchanged"
      contains: "aria-controls=\"fold-batch\""
    - path: app/src/ui/RecipePage.folds.test.jsx
      provides: "C1 across widths, Hide hiding the body and keeping the head, and Go to batch landing on h2#batch"
      contains: "fold-batch"
    - path: app/src/styles/notebook.test.js
      provides: "the fold head's three top-level rules and the same three narrow rules in the 723.98px and 1366px blocks"
      contains: "batch-row__head:has(.fold-row)"
    - path: .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs
      provides: "a WebKit and Chrome probe on the existing build: the new markup set in the page, plus the rules read from the edited notebook.css"
  key_links:
    - from: app/src/ui/BatchRow.jsx
      to: app/src/ui/FoldRow.jsx
      via: "the head's h2#batch holds <FoldRow label=\"Batch\" controls=\"fold-batch\" count=...>, the same component the Tasting head uses"
      pattern: "label=\"Batch\""
    - from: app/src/ui/BatchRow.jsx
      to: app/src/ui/useBelowDesktop.js
      via: "useFold(true): the default never changes, so no width crossing resets it (C1)"
      pattern: "useFold\\(true\\)"
    - from: app/src/styles/notebook.css
      to: app/src/ui/BatchRow.jsx
      via: ":has(.fold-row) matches only the head that renders the fold row, so the pen and no-batch heads keep their rules"
      pattern: "batch-row__head:has\\(\\.fold-row\\)"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/BatchRow.jsx
      via: "handleGoToBatch raises focusBatchAttempt, and BatchRow's landing focuses h2#batch, which now holds the fold row"
      pattern: "focusBatchAttempt"
---

<objective>
Build sketch 011 decision 50, form A, with default C1. Mark chose both on 2026-10-05 (Mark's List rows decision-50-batch-fold-default, answer C1, and decision-50-build-yes, answer yes; the build row is build-batch-fold-decision-50).

- **Form A.** The Batch head becomes the same fold row as the Tasting head: the Batch heading, a Show or Hide control, a dot, and the date in 12px secondary grey. Show and Hide hide the whole batch body. Correct and Record another stay in the head and follow the date. Where they would wrap (393, and the 350px log column from 1366), the fold row takes the whole row and they stand under it.
- **C1.** The Batch fold is open on first load at every width, so Go to batch lands on an open batch.
- **One component.** The wide widths change too.

Where the README brief and the code disagree, this plan keeps what is built and the SUMMARY says so plainly:
1. **The pen heads.** The brief says that with a pen open "the head is the heading alone, as now". In the code, the amend pen (Correct, Record a tasting) and the plan pen show "Batch" and the `.batch-row__date` span today, and BatchRow.test.jsx pins this (the amend and plan tests). Nothing here is drawn, so those heads stay exactly as built. So the `.batch-row__date` rules in app.css and notebook.css stay in use. Do not delete them. (The brief expected them to be unused.)
2. **The 723 width.** The brief's measured edit used a container query on the log (under 447px). It names the media-query alternative and its cost. This plan uses the existing `(max-width: 723.98px)` and `(min-width: 1366px)` blocks, as the brief and the task allow. The parser in `css-source.js` throws on any at-rule other than `@media`, and notebook.test.js pins exactly six media steps. As a result, at 723 (and anywhere from about 487 to 723) the head is 88px, with Correct and Record another under the fold row. The brief's container form reads 44 there. The probe gates 88 at 723 and prints the brief's 44 beside it.
3. **Scoping (my choice).** The brief's rules are unscoped. Its narrow rule `.region-name { flex: 1 1 auto }` would push the amend pen's date span to the far right at 393 and 1366. So every new rule is scoped with `.notebook-log .batch-row__head:has(.fold-row)`. The markup stays exactly the board's (no new class). The codebase already uses `:has()` (notebook.css forced-colours block).

Purpose: the Batch head reads like the Tasting head, and the maker can fold the batch away, as Mark asked on the iPhone.

Output:
- edits to BatchRow.jsx and notebook.css, with their tests (BatchRow.test.jsx, RecipePage.folds.test.jsx, one line of RecipePage.recordTasting.test.jsx, notebook.test.js)
- a probe and a SUMMARY in this quick directory

Out of scope (do not touch): the one-line table head, the Sheet rows, the tab row ring, the record pen hairlines, More's Import and Export, the Import error list, the page notice. Never edit or stage `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/`, `.planning/STATE.md` or `.planning/todos/` (Sid is editing there). File no Mark's List rows.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read these sections, not whole files:
- `.planning/sketches/011-recipe-route-c/README.md` lines 605 to 612 (decision 50: the measured numbers, A, C1, the app change brief). Read only.
- The board `.planning/sketches/011-recipe-route-c/batch-head-show-hide.html` is 1.3 MB. Do not read it whole. Grep it, read only:
  - the open head: `grep -o '<h2 id="batch-fp-bh-open-393".\{0,700\}'`
  - the closed head: `grep -o '<h2 id="batch-fp-bh-closed-393".\{0,500\}'`
  - its rules: `grep -o 'batch-row__head[^{}]*{[^}]*}'`
  - Panel ids carry a `-fp-bh-<state>-<width>` suffix that the app does not.
- `.planning/canvas-generators/batchhead-probe.mjs` lines 9 to 23 (Sid's rule and DOM edit). Read only.
- `app/src/ui/FoldRow.jsx` (45 lines, whole).
- `app/src/ui/useBelowDesktop.js` lines 100 to 112 (`useFold`).
- `app/src/ui/BatchRow.jsx`:
  - lines 251 to 271 and 347 to 363: TastingReading's fold, the pattern to copy
  - lines 386 to 430: props, including `foldsOpen`
  - lines 562 to 673: the batch list fold, the head, and the `.batch-margin` opening tag
  - lines 1093 to 1097 and 1126 to 1158: the Tasting call, the no-batch state, and the end
- `app/src/ui/BatchRow.test.jsx`:
  - lines 60 to 219: the render helper and the head tests
  - lines 408 to 416: the landing test
  - lines 1568 to 1600: the Tasting fold markup tests, the pattern for the exact-string assertion
- `app/src/ui/RecipePage.folds.test.jsx` (206 lines, whole): the jsdom harness, `mountAt`, `setWidth`, `row`, `panel`, `isOpen`, `click`.
- `app/src/ui/RecipePage.recordTasting.test.jsx` lines 274 to 300.
- `app/src/ui/RecipePage.jsx` lines 1138 to 1145 (`handleGoToBatch`). Read only.
- `app/src/styles/notebook.css`:
  - lines 158 to 223: the `.notebook .fold-row` rules
  - lines 734 to 808: the batch head
  - the `@media (min-width: 1366px)` block from line 930 to its closing brace (find it with grep)
  - lines 1150 to 1189: the phone block
- `app/src/styles/notebook.test.js`:
  - lines 1 to 53: header, `rules`, the six-steps test
  - lines 455 to 496: the fold row and batch head tests, with the `top` helper
- `app/src/styles/app.css` lines 537 to 550 (`.is-landing-focus:focus`) and 1627 to 1648 (`.batch-row__head`, `.batch-row__date`). Read only. Do not edit app.css.
- Probe pattern, whole file: `.planning/quick/261004-uo6-fix-the-record-pen-black-hairline-and-th/261004-uo6-probe.mjs` (imports, `readAllRules`, `addTag`, `raf2`, `check`/`finish`). Also `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs` lines 1 to 150, which exports `APP_ROUTE` (Olive Oil v1's tasted batch), `startServers`, `launch` (system Chrome) and `openApp(browser, appUrl, route, { width, height, coarse })`. Copy from these; do not edit them.

Sid's measured numbers (WebKit with hasTouch, deviceScaleFactor 1; x is from the log's left edge; from `.planning/canvas-generators/batchhead-probe.json` and `-chromium.json`, read only):

| width | built head / section | open head (brief) | date ink left, open / closed | Correct ink left, open | fold row width, open |
|---|---|---|---|---|---|
| 393 | 78.22 / 556.22 | 88 | 139.66 / 144.82 | 20 | 353 |
| 723 | 44 / 522 | 44 (container form) | 139.66 / 144.82 | 287.52 (container form) | 235.52 (container form) |
| 724 | 44 / 431 | 44 | 127.66 / 132.82 | 275.52 | 235.52 |
| 1024 | 44 / 416 | 44 | 127.66 / 132.82 | 275.52 | 235.52 |
| 1366 | 78.22 / 874.72 | 88 | 119.66 / 124.82 | 0 | 350 |

More numbers:
- **Built date ink left:** 80.13 at 393 and 723, 68.13 at 724 and 1024, 60.13 at 1366. It is 15px and rgb(20, 20, 20), with no dot.
- **Tasting count:** 12px, rgb(89, 89, 89).
- **Chrome with a fine pointer (Sid):** open head 68 at 393 and 1366, 44 at 724 and 1024. Date ink left open: 137.8 (393), 125.8 (724, 1024), 117.8 (1366). Closed: 143.8, 131.8, 123.8.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The Batch head is a fold row that hides the whole batch, open at every width (tests, BatchRow.jsx)</name>
  <files>app/src/ui/BatchRow.test.jsx, app/src/ui/RecipePage.folds.test.jsx, app/src/ui/RecipePage.recordTasting.test.jsx, app/src/ui/BatchRow.jsx</files>
  <behavior>
    - Static (BatchRow.test.jsx). Setup: no pen, a batch in view (augustSecondBatch), with foldsOpen true and also foldsOpen false (C1). Expected: the markup contains exactly `<h2 id="batch" class="region-name"><button type="button" class="fold-row" aria-expanded="true" aria-controls="fold-batch" aria-label="Batch, Hide, churned 2 Aug 2026" tabindex="0"><span class="fold-row__head">Batch<span class="fold-row__control">Hide</span></span><span class="fold-row__count">churned 2 Aug 2026</span></button></h2>`. This is the board's own markup, without its panel suffix. With foldsOpen false, the Tasting row still reads aria-expanded="false".
    - Static: the head's class stays exactly `batch-row__head` (one batch) or `batch-row__head batch-row__head--after-list` (two batches). No new class.
    - Static: the read state renders no `batch-row__date`. The body sits in the fold: the markup contains `<div id="fold-batch"><div class="batch-margin">`. Correct and Record another come before `id="fold-batch"`. The churn cells, `id="fold-tasting"`, "Next time" and "Recorded" come after it.
    - Static: "Batch" prints once. With a batch in view, `<span class="fold-row__head">Batch<` appears once and `class="region-name">Batch<` does not appear.
    - Static, unchanged as built:
      - record pen: `<h2 id="batch" class="region-name"[^>]*>Batch</h2>` and no date span
      - amend pen and plan pen: that h2, plus `class="batch-row__date">churned 2 Aug 2026<`
      - no batch: that h2 and no date span
      - In all four, the head (from `class="batch-row__head` to `class="batch-row__head-acts"`) holds no `fold-row`.
      - In the pens, the body reads `<div id="fold-batch"><div class="batch-margin` with no hidden attribute.
    - Static landing (focusBatchOnMount, a batch in view): h2#batch carries tabindex="-1" and aria-label="Batch churned 2 Aug 2026" and holds the fold row button.
    - jsdom (RecipePage.folds.test.jsx, the batch route). On mount at 393, 744, 1024 and 1366, `isOpen('fold-batch')` is true (C1).
    - jsdom, at 1024: clicking the Batch row closes it.
      - `panel('fold-batch').hidden` is true, and it contains `.batch-margin`.
      - h2#batch, `.batch-row__correct` and `.batch-row__record` are rendered and are not inside the panel.
      - The row reads Show.
      - setWidth(1366), then setWidth(1024): still closed both times. Clicking again opens it.
    - jsdom, at 1024: clicking `.notebook-jump` (Go to batch) puts `document.activeElement` on h2#batch, with `isOpen('fold-batch')` true.
    - The existing F1 to F5 expectations (`states()`) are unchanged.
  </behavior>
  <action>
RED. Write the tests first.

In `app/src/ui/BatchRow.test.jsx`:
- Update the existing tests that pinned the old read-state head:
  - line 97, "prints the Batch heading exactly once"
  - line 105, "carries id=batch with a batch in view"
  - line 119, "renders churned date beside the Batch heading"
  - line 197, "reads Batch, the churned date, Correct, then Record another"
  - line 408, "makes the saved Batch heading a named programmatic landing"
  These now read the fold row form from the behavior list. Keep each test's intent and say in its title that the date is the fold row's count (sketch 011 decision 50 A).
- Add to the record (line 129), amend (line 145) and plan (line 211) tests the assertion that the head holds no `fold-row`.
- Add a describe titled "BatchRow — the Batch fold head (sketch 011 decision 50 A, C1; Mark 2026-10-05)". It holds the exact-string test (foldsOpen true and false), the body-inside-the-fold order test, and the no-batch head test.
- Copy the Tasting fold tests' exact-string style (lines 1568 to 1600).

In `app/src/ui/RecipePage.folds.test.jsx`, add a describe titled "The Batch fold opens open at every width (sketch 011 decision 50, C1)". It holds the three jsdom behaviors (it.each over 393, 744, 1024, 1366; the Hide-and-cross test; the Go to batch test). Use the file's own `mountAt`, `setWidth`, `row`, `panel`, `isOpen` and `click`. Do not change `states()` or F1 to F5.

In `app/src/ui/RecipePage.recordTasting.test.jsx` (line 286, the read state before the band is pressed), read the date from `.batch-row__head .fold-row__count` instead of `.batch-row__date`. Lines 197 and 294 are pen states and stay as they are.

Run `npm --prefix app test -- src/ui/BatchRow.test.jsx src/ui/RecipePage.folds.test.jsx src/ui/RecipePage.recordTasting.test.jsx`. Confirm the new and updated read-state tests fail because the fold row is missing, and the pen-state tests pass. Stage the three test files by explicit path, then check `git diff --cached --name-only`. Commit as `test(261004-uyd): pin the Batch head as a fold row, open at every width`. End the message with:
- `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`
- `Claude-Session: https://claude.ai/code/session_01DnSshE2JfScJcTaMMxNapN`

GREEN. In `app/src/ui/BatchRow.jsx`, near the batch list's `useFold(foldsOpen)`:
- Add `const [batchOpen, toggleBatch] = useFold(true);` with a short comment: decision 50 C1, Mark 2026-10-05. The Batch fold opens open at every width. Its default never changes, so no width crossing resets it. Nothing is stored. It does not read `foldsOpen`.
- Add `const batchFold = openPen === null && Boolean(openBatch);` (the brief's condition).

In the head:
- Keep h2#batch's attributes unchanged (id, ref, className, tabIndex, aria-label, onBlur).
- Its child becomes `<FoldRow label="Batch" open={batchOpen} onToggle={toggleBatch} controls="fold-batch" count={...} />` when `batchFold` is true, with the count the same `churned ${recordDateWords(openBatch.churn.churnDate)}` string the span uses. Otherwise the child is the text Batch, as now.
- The `.batch-row__date` span renders only when `!batchFold && openPen !== 'record' && openBatch`. That is the amend and plan pens, as built.
- Do not add a class to the head.

Wrap the existing `.batch-margin` div, unchanged, in `<div id="fold-batch" hidden={batchFold && !batchOpen}>`. It is rendered in every state, so opening a pen never remounts the body. Correct and Record another stay in `.batch-row__head-acts`, unchanged (decision 34).

Update the head's comment block (lines 603 to 609) in plain words:
- With no pen open and a batch in view, the lead is the Batch fold row, with the date as its count (decision 50 A). It folds the whole body.
- With a pen open or no batch in view, the head is as built.

Add no other change. No dangerouslySetInnerHTML. FoldRow already carries tabIndex={0}.

Run the three files, then the full `npm --prefix app test`. If another test fails only because it pinned the old read-state head (the h2's text "Batch" or the `.batch-row__date` span, with no pen open and a batch in view), update it to the fold row form. Name it in the SUMMARY. Any other failure: stop and report it; do not work around it.

Stage `app/src/ui/BatchRow.jsx` and any test so updated, by explicit path, then check `git diff --cached --name-only`. Commit as `feat(261004-uyd): the Batch head is a fold row that hides the whole batch, open at every width`, with the same two trailer lines.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/BatchRow.test.jsx src/ui/RecipePage.folds.test.jsx src/ui/RecipePage.recordTasting.test.jsx && SUBJECTS="$(git log --reverse --format=%s --grep='261004-uyd')" && printf '%s\n' "$SUBJECTS" | grep -E 'fold row' | head -1 | grep -q '^test(261004-uyd): pin the Batch head as a fold row' && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-uyd): the Batch head is a fold row'</automated>
  </verify>
  <done>The test commit comes before the feat commit. The three files and the full suite pass. On the batch route, the Batch fold is open at 393, 744, 1024 and 1366. Hide hides the whole body and keeps the head with Correct and Record another. Go to batch lands on h2#batch. The pen and no-batch heads render as before.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Lay the fold head out like the Tasting head, full row in the narrow log (tests, notebook.css)</name>
  <files>app/src/styles/notebook.test.js, app/src/styles/notebook.css</files>
  <behavior>
    - Three top-level rules (media undefined), with these exact selectors and declarations:
      - `.notebook-log .batch-row__head:has(.fold-row)` declares `row-gap: 0` and `align-items: center`, and nothing else.
      - `.notebook-log .batch-row__head:has(.fold-row) .region-name` declares `margin: 0` and `flex: 0 1 auto`.
      - `.notebook-log .batch-row__head:has(.fold-row) .fold-row` declares `width: auto`.
    - In `(max-width: 723.98px)` and in `(min-width: 1366px)`, the same three narrow rules, with identical declarations in both blocks:
      - `.notebook-log .batch-row__head:has(.fold-row) .batch-row__head-lead` declares `flex: 0 0 100%`.
      - `.notebook-log .batch-row__head:has(.fold-row) .region-name` declares `flex: 1 1 auto`.
      - `.notebook-log .batch-row__head:has(.fold-row) .fold-row` declares `width: 100%`.
    - Each narrow rule comes after its top-level twin in source order (`rules.indexOf`), so it wins at equal specificity.
    - No `:has(.fold-row)` rule sits under `(max-width: 1365.98px)`. From 724 to 1365 the top-level form holds.
    - Unchanged, and still passing: the six-steps test (no new media condition), "every rule is scoped under .notebook", "no bare px", and the decision 42 test. `.notebook-log .batch-row__head` keeps its 16px row-gap for the pen and no-batch heads, with no media twin.
  </behavior>
  <action>
RED. In `app/src/styles/notebook.test.js`, after the decision 42 test (about line 495), add a describe titled "the Batch fold head reads like the Tasting head (sketch 011 decision 50 A; Mark 2026-10-05)". It holds tests for the five behavior bullets. Use the file's `rules` and a local `top` helper as the neighbouring describes do. Compare selectors as exact strings. Above it, add a one-line comment:
- `:has(.fold-row)` scopes these to the head that renders the fold row.
- The pen and no-batch heads keep decision 42's rule.

Run `npm --prefix app test -- src/styles/notebook.test.js` and confirm the new tests fail because the rules are missing. Stage the test file by explicit path, then check `git diff --cached --name-only`. Commit as `test(261004-uyd): pin the Batch fold head's layout rules`, with the two trailer lines from Task 1.

GREEN. In `app/src/styles/notebook.css`:
- Directly after the `.notebook-log .batch-row__head-acts` rule (about line 784), add the three top-level rules. This must be before the 1366 block at line 930.
- Add the three narrow rules at the end of the existing `@media (min-width: 1366px)` block, and again at the end of the existing `@media (max-width: 723.98px)` block.
- Use the brief's declarations, as measured. Do not open a new media block.

Comment the top-level group in plain words:
- Sketch 011 decision 50 A (Mark 2026-10-05): the Batch head is the Tasting head's fold row.
- Correct and Record another follow the date 32px later, on the row's line.
- `:has(.fold-row)` keeps the pen and no-batch heads on decision 42's rule.

Comment each narrow group:
- In the 350px log column and on the phone, the actions would wrap. So the fold row takes the whole row, a 44px control like the other folds, and they stand under it with no gap. The head is 88px.
- The brief drew this as a container query (log under 447px). These two existing breakpoints stand in, so from about 487 to 723 the actions also stand under the fold row.

In the comment above `.notebook-log .batch-row__head` (lines 759 to 767), add one short sentence: with no pen open and a batch in view, the head is the fold row below (decision 50). Change nothing else there.

Do not touch `.notebook-log .batch-row__date`, app.css, tokens.css or any other rule. No new token: every value is a keyword, 0, auto or a percentage.

Run `npm --prefix app test` (full suite, green). Stage `app/src/styles/notebook.css` by explicit path. Commit as `feat(261004-uyd): lay the Batch fold head out as the Tasting head, full row in the narrow log`, with the trailer lines.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/notebook.test.js && SUBJECTS="$(git log --reverse --format=%s --grep='261004-uyd')" && printf '%s\n' "$SUBJECTS" | grep -E 'Batch fold head' | head -1 | grep -q "^test(261004-uyd): pin the Batch fold head's layout rules" && printf '%s\n' "$SUBJECTS" | grep -q '^feat(261004-uyd): lay the Batch fold head out'</automated>
  </verify>
  <done>The test commit comes before the feat commit. The notebook suite and the full suite pass. notebook.css carries the three top-level rules and the same three narrow rules in the 723.98px and 1366px blocks, all scoped by `:has(.fold-row)`. It still has six media steps, and the decision 42 rule is unchanged.</done>
</task>

<task type="auto">
  <name>Task 3: Measure the fold head in WebKit and Chrome on the existing build, then write the SUMMARY</name>
  <files>.planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs, .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-SUMMARY.md</files>
  <action>
Create `261004-uyd-probe.mjs` in this quick directory, modelled on the uo6 probe. Use the same imports:
- `webkit` from `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`
- the harness at `../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs` (`APP_ROUTE`, `startServers`, `launch`, `openApp`, `check`, `finish`)
- `readAllRules` from `../../../app/src/styles/css-source.js`

It serves the existing `app/dist` with `startServers()`, read only. No build, no Vite, never :4173, :5173 or :8011. The dist predates this quick, so the probe does two things in each page:
- It sets the new markup with a DOM edit. This mirrors Sid's `edit` in batchhead-probe.mjs and the exact string BatchRow.test.jsx pins. Replace h2#batch's children with the FoldRow button (Hide or Show, aria-expanded, aria-label "Batch, Hide|Show, <date>"), remove the `.batch-row__date` span, and wrap `.batch-margin` in `div#fold-batch`. For closed, set `hidden` on the wrapper, aria-expanded false and the control word Show.
- It adds the nine rules it reads from the edited `app/src/styles/notebook.css`: the three top-level `:has(.fold-row)` rules, then the three in `@media (min-width: 1366px)` and the three in `@media (max-width: 723.98px)`, each block wrapped back in its @media. Throw if any is missing.
Wait two animation frames after each change.

**Contexts.**
- WebKit (`webkit.launch()`) and system Chrome (harness `launch()`), both `openApp(..., APP_ROUTE, { coarse: true })`, at 393x852, 723x1000, 724x1000, 1024x1000 and 1366x1000.
- Chrome also `coarse: false` at 393x852, 1024x1000 and 1366x1000.

**States per context.** `built` (read, no change), `open` (edit plus rules, read), `closed` (switch to closed, read).

**The in-page reader.** x is measured from `.notebook-log`'s left edge, as Sid's was. It returns:
- the boxes of: the head, the lead, the fold row, the acts, `.batch-row__correct`, the section `.batch-row`
- the ink left and right (a Range over the node's contents) of: the head's date (`.fold-row__count` or `.batch-row__date`), Correct, Record another
- the date's computed font-size and colour, and the content of its `::before`
- the same three for the Tasting row's `.fold-row__count`, when rendered
- h2#batch's and the Tasting h2's computed font-size, font-weight, colour and text-transform
- whether `.batch-margin` has client rects
- the fold button's aria-label
- `document.documentElement.scrollHeight`

**Gates** (`check`, `finish`, so exit 1 lists every failure; tolerance 0.5px unless stated):
- **G0, built, WebKit.** Head 78.22 at 393 and 1366, 44 at 723, 724 and 1024. Date ink left 80.13 (393, 723), 68.13 (724, 1024), 60.13 (1366). The date is 15px with no `::before`. This confirms the build is the one the brief measured. In Chrome, print these values only.
- **G1, open head height.**
  - Coarse, both engines: 88 at 393 and 1366, 44 at 724 and 1024. At 723 it is 88 (the media form). Print "brief (container form): 44" beside it.
  - Chrome fine: 68 at 393 and 1366, 44 at 1024.
  - The fold row is 44 tall everywhere.
  - Width at 393, 723 and 1366: the fold row equals the lead's width (full row).
  - Width at 724 and 1024: the fold row's right edge equals the date's ink right (as wide as its words).
- **G2, the date like Tasting's (open).** The head date's font-size and colour equal the Tasting row's date. Both `::before` contents are the same dot. h2#batch's font-size, weight, colour and transform equal the Tasting h2's. The aria-label is "Batch, Hide, churned 2 Aug 2026".
- **G3, the actions (open).**
  - At 724 and 1024: Correct's ink left minus the date's ink right is 32. Correct's box centre lies within the fold row's box vertically.
  - At 393, 723 and 1366: Correct's ink left equals the fold row's left. The acts' top equals the fold row's bottom.
- **G4, closed.** The section's height equals the head's height. `.batch-margin` has no client rects. The head's height equals the open head's. Correct and Record another are rendered.
- **G5, body unchanged by the wrap (open).** (open section minus built section) minus (open head minus built head) is 0.
- **G6, the date's position, against Sid.**
  - WebKit: the open and closed date ink left equal Sid's numbers in the table (393, 724, 1024, 1366; at 723 equal to 393's).
  - Chrome (both pointers): equal Sid's Chrome numbers.
  - A miss prints both numbers. It is a failure, not loosened.
- **G7, landing, both engines, coarse, 393 and 1024.** On a fresh built page, click `.notebook-jump` (Go to batch). Wait until `document.activeElement.id === 'batch'`. Then apply the open edit and the rules. Read:
  - the active element is h2#batch, with class `is-landing-focus`
  - outline-style is solid, and outline-width equals `--focus-outline-width` (resolve it through a temporary element)
  - h2's box equals the fold row's box on all four sides
  - the ring box (h2's box grown by outline-offset plus outline-width) lies within 0 to innerWidth across, and inside, horizontally, every ancestor of h2 whose computed overflow-x or overflow-y is not visible
  - Print the ring's top and bottom against the window and the sticky bar's bottom.
- **G8, the pen wrap is neutral, WebKit coarse, 393 and 1366.** On a fresh built page, click `.batch-row__correct` and wait for `.batch-margin--pen`. Read `.batch-row`'s and the head's heights. Wrap `.batch-margin` in a plain `div#fold-batch` and add the rules. Read again.
  - Both heights are equal within 0.01, and the head holds no `.fold-row`.
  - Never save. The context is thrown away.

Print every reading in a table per engine and width. Run `node .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs`, then the full `npm --prefix app test`.

If G0 fails, the build differs from the one Sid measured. Report what was read plainly; do not guess at a cause. Never loosen a gate to pass, and never change the code to chase Sid's number without reporting it. Do not commit the probe or the SUMMARY. They go in the orchestrator's docs commit.

Write `261004-uyd-SUMMARY.md` in plain English and short sentences:
- **What changed.** The four commits; the tests added and updated (name any extra test updated in Task 1); the files.
- **What the brief said and the code does differently.**
  - The amend and plan pens keep "Batch" and the date span, as built, so the `.batch-row__date` rules are still used.
  - 723 reads 88, not the brief's 44, because the existing breakpoints stand in for the container query. State the 487 to 723 range.
  - The new rules are scoped with `:has(.fold-row)`, the markup is the board's, and no class was added.
- **Behaviour not drawn, observed in the code, not built (questions Mark may want to answer):**
  - The fold keeps its state while the page stays mounted. A Correct started from a closed fold returns to a closed fold after Save or Cancel, and the save's landing focuses the closed head.
  - Go to batch on a fold the maker closed lands on the head and leaves it closed. Under C1 nothing reopens it.
  - Moving to another batch, by the batch list or after Record another, remounts the page and opens it.
- **The readings per engine and width**, and each gate's result, with both numbers for any failure.
- **The method.** The existing build (app/dist, read only, ephemeral 127.0.0.1 ports) with the new markup set in the page and the edited source's own rules added. No build, no Vite, :4173 untouched. A DOM edit is not a build.
- **The consequence:** Mark's running preview does not show this until `npm --prefix app run build` runs.
- **Not verified:** two or more batches (the head after the batch list); the iPhone and iPad.
- **A `## Deferred Human Verification` section.** Suggested device checks, served from `npm --prefix app run build && npm --prefix app run preview -- --host`:
  - iPhone, Olive Oil v1's batch. The Batch head reads BATCH, Hide, a dot and the date in small grey, like Tasting's. Correct and Record another sit just under it. Hide folds the whole batch away, and Show brings it back.
  - iPad at 1024 (portrait). One line, with Correct and Record another after the date.
  - iPad at 1366 (landscape). The log column, two lines as on the phone.
  - Go to batch, on the iPhone and at 1024. It lands on the open batch, and the ring wraps the head.
  - VoiceOver reads "Batch, Hide, churned 2 Aug 2026".

The executor files no Mark's List rows; it lists the checks only. Do not touch or stage `.planning/sketches/`, `.planning/canvas-generators/`, `.impeccable/`, `.planning/STATE.md` or `.planning/todos/`. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test && node .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs && test -f .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-SUMMARY.md && grep -q "Deferred Human Verification" .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-SUMMARY.md && test -z "$(git status --porcelain app/)" && TOUCHED="$(git log --name-only --format= --grep='261004-uyd')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/ui/(BatchRow\.jsx|[A-Za-z.]+\.test\.jsx?)$|^app/src/styles/(notebook\.css|notebook\.test\.js)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/(sketches|canvas-generators|todos)/|^\.planning/STATE\.md$|^\.impeccable/'</automated>
  </verify>
  <done>The probe exits 0, or the SUMMARY lists every failing gate with both numbers. The full suite passes. The working tree under app/ is clean. The 261004-uyd commits touch only BatchRow.jsx, notebook.css and their test files. The SUMMARY carries:
- the disagreements with the brief
- the undrawn behaviours
- the readings and the method
- the no-build consequence
- the device checks</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| component to rendered page | One FoldRow in an existing h2, one wrapper div and six layout rules. No new input, no stored state (useFold is component state only), no markup from data: the date is the string the span already renders. |
| probe to local servers | The probe serves the existing app/dist on ephemeral 127.0.0.1 ports and drives throwaway browser contexts. It edits the page's DOM and CSS only. It opens the Correct pen once and never saves it. |
| executor to the shared working tree | Untracked critique and canvas-generator files are in the tree. Sid may be editing `.planning/sketches/` and `.planning/todos/`. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-uyd-01 | Denial of Service | Mark's :4173 preview, :5173, :8011, app/dist | low | mitigate | No build and no Vite process. The harness binds ephemeral 127.0.0.1 ports and aborts every other host. app/dist is served read only, and every change is made in the page, never on disk. |
| T-uyd-02 | Tampering | other agents' files in the shared tree | medium | mitigate | Commits by explicit path, never `git add -A`, with `git diff --cached --name-only` before each one. Task 3's verify fails if any 261004-uyd commit touches an app/ file outside BatchRow.jsx, notebook.css and their tests, or anything under `.planning/sketches`, `.planning/canvas-generators`, `.planning/todos`, `.planning/STATE.md` or `.impeccable`. |
| T-uyd-03 | Tampering | Mark's IndexedDB | low | mitigate | Every probe context is a throwaway Playwright context on an ephemeral origin, seeded by the build. The Correct pen in G8 is never saved, so nothing reaches Mark's store. |
| T-uyd-04 | Repudiation | measured numbers against the brief | low | mitigate | G0 calibrates against Sid's build readings first. Gates are never loosened. The 723 divergence, the pen-head divergence and the `:has()` scoping are named in the SUMMARY, not hidden. |
| T-uyd-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. The probe uses the Playwright already in the npx cache, which the uo6 and ubg probes used. |
</threat_model>

<verification>
- `npm --prefix app test` passes (full suite).
- `node .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs` exits 0, or its failures are listed in the SUMMARY with both numbers.
- `git log --format=%s --grep='261004-uyd'` shows two test commits, each before its feat commit.
- `git status --porcelain app/` is empty. No commit touches a file outside the allowed set.
</verification>

<success_criteria>
- **Decision 50 A:**
  - With no pen and a batch in view, the Batch head is the Tasting head's fold row: same markup, the date in 12px secondary grey with the dot, and the accessible name "Batch, Hide, churned 2 Aug 2026".
  - Hide hides the whole batch body. Correct and Record another stay in the head and follow the date.
- **C1:** open on first load at every width, unmoved by width crossings.
- **Layout (coarse, WebKit and Chrome):**
  - The head is 88 at 393 and 1366, 44 at 724 and 1024, and 88 at 723, reported against the brief's 44.
  - The closed section equals the head.
  - Go to batch lands on h2#batch with an unclipped ring around the fold row.
- **Unchanged:** the pen and no-batch heads, `.batch-row__date`, app.css, the six media steps.
- **Process:** test first for both code changes, the suite green, the commits scoped, no build, no push, no Mark's List rows.
</success_criteria>

<output>
Create `.planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-SUMMARY.md` when done.
</output>
