---
phase: quick-261002-wmz
plan: 01
quick_id: 261002-wmz
type: execute
wave: 2
depends_on: ["261002-wmy"]
files_modified:
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/VersionRow.record.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
  - app/src/ui/useBelowDesktop.js
  - app/src/ui/useBelowDesktop.test.js
  - app/src/ui/BatchRow.jsx
  - .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs
  - .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-baseline.json
autonomous: true
requirements: [BATCH1-01, UX1-01]

must_haves:
  truths:
    - "Below 724 (a window of 723.98px or less), with no pen open, the band's acts row leads with exactly one filled control (.notebook-action). Its label comes from the version's latest batch through lastEvent.js standingFor, Home's own rule: Record a tasting when that batch awaits tasting, Record another when it is tasted, Record a batch when the version has none (sketch 011 decision 30, answers 1 and 4)."
    - "Below 724, Next version is the underlined text control (.notebook-link) right after the filled action, 10px from it. It still opens the plan's pen and still takes focus back when that pen closes. Show changes still follows it when the version has a parent. It stays in the band until 261002-wn1 moves it, so a wrap at 393 is recorded and left as it is."
    - "Record a batch and Record another in the band call RecipePage's handleStartRecording, the handler the log's own Record another and Record a batch already call. The record pen opens in the log with the Churn date field focused and inside the viewport. Cancel closes it and stays put, so focus returns to the log's own opener (decision 30's least). Save lands on the saved batch's heading."
    - "Record a tasting calls RecipePage's handleRecordTasting. This is the seam marked SEAM(261002-wn0). Today it opens the amend pen on the latest batch through the log's own Correct path, handleStartAmending(sortedBatches(batches)[0]), and Add tasting is one tap inside that pen. 261002-wn0 replaces only this function's body."
    - "When there is no batch, below 724 the page carries two filled Record a batch buttons, the band's and the log's (decision 30, answer 4: \"2 buttons\"). From 724 up there is only the log's."
    - "From 724 up the band is unchanged. In WebKit and system Chrome, at 724 fine, 724 coarse and 1366 fine, for all six cases, the acts row's labels, classes and boxes and the band's height equal the pre-change baseline within 0.5px."
    - "Compared with 393-phone-log.html (393 coarse) and 723-phone-log.html (723 fine), panel by panel and in both engines, these match: labels, order, which control is filled, the fill and label colours, underlines, the filled control's x, the 10px gaps and the row count. The app's filled control is 0 to 4.5px wider than the board's (the generator's filled primitive, recorded in decision 30). At 723 fine the heights differ as decision 30 records (app 44 against board 41 and 17). Page horizontal overflow is 0 at every measured width."
    - "`npm --prefix app test` and `npm --prefix app run build` pass. This item's commits change no stylesheet, token, sketch, canvas generator, .impeccable file, DESIGN.md or IngredientTable.jsx."
  artifacts:
    - path: app/src/ui/VersionRow.jsx
      provides: "the band's filled record action below 724, labelled from standingFor(batches), and Next version as a text control below 724"
      contains: "standingFor"
    - path: app/src/ui/RecipePage.jsx
      provides: "the below-724 read passed to VersionRow, onStartRecording wired to handleStartRecording, and handleRecordTasting behind the SEAM(261002-wn0) marker"
      contains: "SEAM(261002-wn0)"
    - path: app/src/ui/VersionRow.record.test.jsx
      provides: "jsdom click tests: each band control calls the right RecipePage handler"
      contains: "@vitest-environment jsdom"
    - path: .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs
      provides: "baseline / tracer / matrix / behaviour / boards groups over the built app and the two phone-log boards, in WebKit and system Chrome"
    - path: .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-baseline.json
      provides: "the band's acts row and band height for all six cases at every width, captured from a build of the post-wmy, pre-wmz source"
  key_links:
    - from: app/src/ui/VersionRow.jsx
      to: app/src/domain/lastEvent.js
      via: "standingFor(batches) picks the label and the handler. It is the same function Home's RowActions (RecipeList.jsx) and the Go to batch status read, so the band, Home and the jump cannot disagree."
      pattern: "standingFor\\(batches\\)"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/VersionRow.jsx
      via: "<VersionRow ... onStartRecording={handleStartRecording} onRecordTasting={handleRecordTasting} plus the below-724 boolean>"
      pattern: "onRecordTasting=\\{handleRecordTasting\\}"
    - from: app/src/ui/RecipePage.jsx handleRecordTasting
      to: app/src/ui/RecipePage.jsx handleStartAmending
      via: "the seam's body: handleStartAmending(sortedBatches(batches)[0]). 261002-wn0 replaces this body."
      pattern: "handleStartAmending\\(sortedBatches\\(batches\\)\\[0\\]\\)"
---

<objective>
Below 724, give the recipe band one filled action: the record act the version is waiting on. Make Next version the underlined text control beside it. From 724 up, the band stays as built.

Purpose: Sketch 011 decision 30 (approved by Mark 2026-10-02, "approve the phone-logging boards") answers the 393 critique's P1: on the phone, the band's only filled action used to be Next version, and the batch log was 3.4 screens down. The rule is:
- Record a tasting when the latest batch awaits its tasting (answer 1).
- Record another when it is tasted.
- Record a batch when there is none. In that case the log keeps its own filled Record a batch too (answer 4).
- The change stops at 724 (answer 3).

Next version becomes an underlined word, per DESIGN.md's "Box or word" line as amended in ec50634.

Scope against the sibling items. 261002-wmy has already added the Go to batch row to the same band. This item does not touch that row. 261002-wn0 owns what Record a tasting opens: the pen on Add tasting with no Correct. Here, Record a tasting calls a clearly marked seam, handleRecordTasting in RecipePage.jsx. Today the seam opens the amend pen on the latest batch through the log's existing Correct path, and wn0 replaces only its body. 261002-wn1 moves Show changes to the Ingredients row below 724. Here Show changes stays where it is, and the three-control wrap at 393 is measured and recorded, not fixed.

Output:
- the band's filled record action and the text-control Next version below 724, written test-first
- the wiring and the seam in RecipePage.jsx
- a probe measuring the built app in WebKit and system Chrome against a pre-change baseline and against both phone-log boards
- a SUMMARY with the numbers and the findings for wn0
- Mark's device check, deferred to him
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/sketches/011-recipe-route-c/README.md
@app/src/ui/VersionRow.jsx
@app/src/ui/useBelowDesktop.js
@app/src/domain/lastEvent.js
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
@.planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs

<interfaces>
The planner read these facts at HEAD 4faea98, after 261002-wdn and before 261002-wmy. 261002-wmy lands first and edits the same band, so re-check every line number before relying on it.

Authority. Decision 30 is README.md line 101. Read it in full, then read the band markup of every panel on .planning/sketches/011-recipe-route-c/393-phone-log.html and 723-phone-log.html (the boards' markup and CSS, not the prose). The briefs say the same thing: .impeccable/surfaces/route-recipe-batch.md lines 34 and 131, route-recipe.md line 162, and DESIGN.md line 430 ("Box or word").

What the boards draw. On every panel, the band's acts row is one flex row with a 10px gap and wrap allowed. The filled button comes first, at x 20, background rgb(21, 118, 222) with a white label. Next version follows as an underlined text control, and Show changes comes after it on the "Version with a parent" panel. The Go to batch row starts 20px under the acts row. The planner measured the boards with openBoard:
- 393 board, Chrome: Record another 144 x 44, Record a tasting 150.2, Record a batch 142.2, Next version 83.5 x 44 starting 10px after the filled control, Show changes 98 at x 265.7. One row on all four panels.
- 393 board, WebKit: 146.2, 152.4, 143.4, Next version 84.3, Show changes 97.9 at x 267.6.
- 723 board, fine pointer: the same widths, but the filled control is 41 tall and the text controls are 17 tall at y 12, centred in the row.
- Panel titles, in order: "Tasted batch", "Batch awaiting tasting", "No batch yet", "Version with a parent".
- Decision 30 measured the app's own controls with the edit injected. Chrome: Record another 146 x 44, Record a tasting 152.2, Record a batch 144.2, Next version as text 83.5 x 44, Show changes 98 x 44. WebKit: 148.2, 154.4, 145.4, 84.3. The 2px difference from the board is the app's 1px .notebook-action border on each side.

VersionRow.jsx at 4faea98:
- The props block is lines 17-52.
- The acts group is lines 332-365. It renders only while `openPen === null`, as a `div.notebook-version__acts` holding Next version (`className="notebook-action"`, `ref={developButtonRef}`, `onClick={onStartDeveloping}`, `tabIndex={0}`), then Show changes (`className="notebook-link"`) when `parentVersion` is set.
- The developButtonRef focus-return effect is lines 57-68.
- The `batches` prop is this version's own batches.
- The header comment is lines 10-16 and the acts-group comment is lines 332-337. Both say the record acts live in BatchRow.jsx.

RecipePage.jsx at 4faea98:
- `const belowDesktop = useBelowDesktop();` is at line 910, above the early returns at 913+. Hooks must stay above them.
- handleStartRecording is at 1103.
- handleStartAmending(batch) is at 1296. Its draft is pre-filled from the batch and it sets `amendingBatchId`.
- handleAddTasting is at 1328.
- `<VersionRow ... />` is at 1893-1917.
- `<BatchRow ... onStartAmending={handleStartAmending} ... onStartRecording={handleStartRecording} />` is at 2051-2089.
- `sortedBatches` is already imported from '../domain/batch.js' (line 5), and `openBatch = sortedBatches(batches)[0]` is at line 1040 when no batch is named in the URL.

BatchRow.jsx at 4faea98:
- A local, unexported `function useBelow724()` is at lines 171-182. It is node-guarded and its query is '(max-width: 723.98px)'.
- It is called at line 552.
- The record and amend focus returns are at 461-493. On closing, they focus the log's own Correct (`.batch-row__correct`) or Record another (`.batch-row__record`), or the no-batch Record a batch (`.notebook-log .notebook-action`, line 1135).
- The pen's Churn date input carries `autoFocus` (line 705). It is the same input in the record pen and the amend pen.
- While amending, the head keeps `.batch-row__date`. The record pen hides it (line 634).
- BatchRow.test.jsx lines 733-760 stub `globalThis.window.matchMedia` to drive the hook through rendering.

useBelowDesktop.js exports BELOW_DESKTOP_QUERY, useBelowDesktop, useFold, LOG_BESIDE_SHEET_QUERY and useLogBesideSheet. useBelowDesktop.test.js is its exports-only contract test.

lastEvent.js exports NOT_YET_CHURNED, AWAITING_TASTING, TASTED and `standingFor(batches)`, which reads the newest batch by sortedBatches. RecipeList.jsx lines 160-205 map the same constants to Home's words and actions ("Record a batch", "Record a tasting").

Test house style:
- renderToStaticMarkup in the node environment (VersionRow.test.jsx lines 1-50: `renderVersionRow(props)` inside a MemoryRouter; fixtures `oliveOilVersion`, `augustSecondBatch` (tasted), and `childVersion` at about line 55).
- Click tests opt into jsdom per file with a `// @vitest-environment jsdom` docblock. See BatchRow.signed.test.jsx (`globalThis.IS_REACT_ACT_ENVIRONMENT = true`, `act`, `createRoot`, MemoryRouter) and useFold.reset.test.jsx.
- RecipePage wiring is tested by source scan, with comments stripped (RecipePage.test.jsx lines 754-788).
- app/src/ui/tabindex-scan.test.js fails any button without a literal `tabIndex={0}`.

Seeded cases (store seeded on an empty database; each Playwright context has its own IndexedDB):

| key | route | parent | latest batch |
|---|---|---|---|
| tasted-first | /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 | none | tasted |
| tasted-parent | /notebook/strawberry/strawberry-v2-1 | strawberry-v2 | tasted |
| awaiting-first | /notebook/standard-base/standard-base-v1 | none | no seeded batch: the probe records one first (see Task 1) |
| awaiting-parent | /notebook/coconut/coconut-v2 | coconut-v1 | awaiting tasting |
| none-first | /notebook/standard-base/standard-base-v1 | none | none |
| none-parent | /notebook/mexican-chocolate/mexican-chocolate-v4 | mexican-chocolate-v3 | none |

No seeded first version awaits tasting, so awaiting-first is made in the throwaway context: a saved batch with no tasting.

Probe building blocks:
- The 03.5 harness exports `startServers` (app/dist and the repo on ephemeral 127.0.0.1 ports), `launch` (system Chrome, headless), `openBoard` (a board at its `$preview` width; coarse when the file name carries 393; isMobile false), `recordAnotherBatch(page, isoDate)` (clicks the first button named /^Record (another|a batch)$/, fills Churn date, clicks the first Save batch, waits for the URL to change), `check` and `finish`.
- 261002-axn-probe.mjs has the playwright-core import line (`webkit`, `devices`) at line 15, `openAppPage` at lines 114-130 (a coarse context from `devices['iPhone 14']` with viewport and screen pinned, every non-127.0.0.1 request aborted, innerWidth asserted), and the engine pair at lines 227-230.
- 261002-vh5-probe.mjs lines 69-87 name the pen container `.batch-margin--pen`, the log's Add tasting `button.save-ceremony__add-tasting`, and the tasting stops `.axis-mark__stops`.

Baseline counts at plan time (4faea98): `npm --prefix app test` gives 55 files and 1516 tests, all passing, and the build succeeds. 261002-wmy adds tests before this item runs, so re-record the counts at the start of Task 1.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Baseline, then below 724 the band's filled Record another or Record a batch and a text-control Next version (RED, then GREEN), proven on Olive Oil v1 at 393 in WebKit</name>
  <files>.planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs, .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-baseline.json, app/src/ui/VersionRow.test.jsx, app/src/ui/VersionRow.record.test.jsx, app/src/ui/RecipePage.test.jsx, app/src/ui/VersionRow.jsx, app/src/ui/RecipePage.jsx, and only when 261002-wmy left the 724 hook local to BatchRow.jsx: app/src/ui/useBelowDesktop.js, app/src/ui/useBelowDesktop.test.js, app/src/ui/BatchRow.jsx</files>
  <precondition>261002-wmy has landed on main: `git log --oneline --grep=261002-wmy` lists its commits, and .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-SUMMARY.md exists.</precondition>
  <read_first>.planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-SUMMARY.md and `git show --stat` of each 261002-wmy commit; app/src/ui/VersionRow.jsx (whole file, as wmy left it); app/src/ui/RecipePage.jsx (around the useBelowDesktop call near line 910, handleStartRecording near 1103, handleStartAmending near 1296, the VersionRow element near 1893, the BatchRow element near 2051); app/src/ui/BatchRow.jsx (lines 155-182, 461-506, 546-560, 612-674, 695-710, 1123-1140); app/src/ui/VersionRow.test.jsx (lines 1-75, 420-470, 534-575, 650-706); app/src/ui/BatchRow.signed.test.jsx (lines 1-60); app/src/ui/RecipePage.test.jsx (lines 1-56, 754-788); app/src/ui/useBelowDesktop.test.js; .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs (lines 1-30, 110-135, 220-235, 450-476); .planning/quick/261002-vh5-move-the-record-pen-cut-from-760-to-724-/261002-vh5-probe.mjs (lines 60-90); .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (lines 84-260); .planning/sketches/011-recipe-route-c/README.md line 101 (decision 30, in full)</read_first>
  <behavior>
    - Test A (VersionRow.test.jsx, static): the below-724 prop is true, batches is [augustSecondBatch], so the batch is tasted. Within the acts group's markup, the first button is `class="notebook-action"` with tabindex="0" and reads "Record another". The next button reads "Next version" with `class="notebook-link"`. The acts group holds exactly one `notebook-action`.
    - Test B (static): the below-724 prop is true and batches is []. The first button is the filled "Record a batch", then Next version as notebook-link.
    - Test C (static): the below-724 prop is true, version is childVersion, parentVersion is oliveOilVersion, and batches is tasted. The order is Record another, Next version, Show changes. Show changes keeps `class="notebook-link"`.
    - Test D (static, guard): the below-724 prop is false or omitted, for batches [], [augustSecondBatch] and [{ ...augustSecondBatch, tasting: null }]. The acts group has no button reading Record a batch, Record another or Record a tasting, and Next version keeps `class="notebook-action"`. This passes before and after the change.
    - Test E (static, guard): the below-724 prop is true with openPen 'record', 'amend' and 'plan'. No acts group and no Record label render in VersionRow's markup. This passes before and after.
    - Test G (VersionRow.record.test.jsx, jsdom): the below-724 prop is true and the batch is tasted. Clicking "Record another" calls onStartRecording once and calls neither onStartDeveloping nor onRecordTasting.
    - Test H (jsdom): the below-724 prop is true and there are no batches. Clicking "Record a batch" calls onStartRecording once.
    - Test I (jsdom): the below-724 prop is true. Clicking the text-control "Next version" calls onStartDeveloping once and calls nothing else.
    - Test K (RecipePage.test.jsx, source scan with comments stripped): RecipePage calls the below-724 hook exactly once, before the first `if (version === undefined) return null;`. The VersionRow element passes that boolean and `onStartRecording={handleStartRecording}`.
    - Test M (useBelowDesktop.test.js; only when the hook moves in this task): BELOW_724_QUERY equals '(max-width: 723.98px)' and useBelow724 is a function. BatchRow.jsx no longer declares its own `function useBelow724` and imports it from './useBelowDesktop.js'.
    - Tests A, B, C, G, H, I, K (and M, if the hook moves) fail before the change (RED). D and E are guards. Say so in the SUMMARY.
  </behavior>
  <action>
Steps 1 and 2 run before any file under app/src is edited.

Step 0: re-read the state after 261002-wmy. Record the suite counts (`npm --prefix app test`: files and tests) as this item's baseline. Then answer three questions from wmy's SUMMARY and diff, and write the answers down for the SUMMARY:
- (a) Did wmy add a JS below-724 signal? If so, name the hook, where it is exported from, and the prop it threads into the band.
- (b) Where does wmy compute the latest batch's standing for the Go to batch status? Name the function and variable.
- (c) Where does the Go to batch row render: inside VersionRow, or in RecipePage between the band grid and RecipeHistory?

Reuse whatever wmy built. Never add a second matchMedia hook for the same query, and never add a second standing computation where wmy already holds one. The default names in this plan are `useBelow724`, `BELOW_724_QUERY` and the prop `below724`. Use wmy's names wherever they exist.

If wmy added no exported below-724 hook (for example, its row is gated by CSS alone):
- Move BatchRow.jsx's local `useBelow724` into useBelowDesktop.js unchanged in behaviour. Export it, with the query as an exported constant `BELOW_724_QUERY = '(max-width: 723.98px)'`. Carry over its node-guard comment in the file's own style.
- In BatchRow.jsx, delete the local definition and import the hook. Leave its call site and every comment that names it unchanged, apart from the definition comment that moves.
- BatchRow.test.jsx's window stub keeps working, because the hook still reads window.matchMedia in its useState initializer.

After this step, exactly one non-test module under app/src/ui holds the '(max-width: 723.98px)' query literal. If wmy added its own hook under another name beside BatchRow's local one, point BatchRow.jsx at wmy's hook and delete the local copy.

Step 1: write the probe, 261002-wmz-probe.mjs, in the quick directory. Groups are chosen by a comma-list argument: `baseline`, `tracer`, `matrix`, `behaviour` and `boards`. With no argument, run every group except `baseline`.

Imports and contexts:
- Copy the playwright-core import line (webkit, devices) from 261002-axn-probe.mjs.
- Import startServers, launch, openBoard, recordAnotherBatch, check and finish from the 03.5 harness by relative path.
- Copy axn's openAppPage. Change its waits to `.notebook` and `h2.notebook-version__identity` in place of `.ingredient-table`, and keep its innerWidth and pointer assertion.
- Engines are WebKit and system Chrome, using axn's engine pair.
- Use the six cases from `<interfaces>`. For awaiting-first, open standard-base-v1, call `recordAnotherBatch(page, '2026-10-02')`, then scroll to the top and continue on the saved batch's route. The save stays in the throwaway context's own IndexedDB.
- Before reading, wait until the log has settled for the case: `.batch-row__date` for a batch case, or the log's "Not yet churned." prose for a none case.

The in-page reader `readBand` returns:
- the acts row (`.notebook-band .notebook-version__acts`; assert there is exactly one): its width and height, and its row count (the number of distinct rounded child tops)
- per child: trimmed textContent, className, the tabindex attribute, left relative to the viewport, top relative to the acts row, width, height, computed backgroundColor, color and textDecorationLine
- the `.notebook-band` height
- the gap from the acts row's bottom to the top of the element in `.notebook-band` whose text starts with "Go to batch" (null when absent)
- the number of buttons reading exactly "Record a batch" with class notebook-action, split between those in `.notebook-band` and those in `.notebook-log`
- documentElement.scrollWidth minus innerWidth

Widths:
- below 724: 320, 375, 393 and 428 coarse; 723 fine; 723 coarse
- from 724 up: 724 fine, 724 coarse, 1366 fine

`baseline` reads every case, at every width, in both engines, and writes 261002-wmz-baseline.json. It also asserts the precondition: no acts row anywhere contains a button labelled /^Record/, and Next version is notebook-action everywhere. If that fails, stop and report.

`tracer` is one cell: WebKit, 393 coarse, tasted-first.
- The acts row reads ["Record another", "Next version"], with the first notebook-action and the second notebook-link.
- Clicking the band's Record another (scoped to `.notebook-band`) opens `.batch-margin--pen`.
- The focused element is the Churn date input. Its rectangle lies within 0 and innerHeight, and its value is empty.
- The band's acts row is gone.
- Clicking the first Cancel scoped to `.notebook-log` closes the pen. Focus is on `.notebook-log .batch-row__record`, and the band's filled Record another is back.
- Log scrollY at click, after open and after Cancel.

`matrix`, below 724 (6 cases x 6 widths x 2 engines):
- The labels are [label, "Next version"], plus "Show changes" for a parent case. The label is Record another for tasted, Record a tasting for awaiting and Record a batch for none.
- The first child is notebook-action and the others are notebook-link. The band holds exactly one notebook-action, and every child has tabindex 0.
- The first child's left is 20 ± 0.5 and its height is 44 ± 0.5.
- Next version's left equals the filled control's right + 10 ± 0.5.
- Next version's height equals the filled control's height ± 0.5 when they share a row.
- The row count is 1 for every no-parent case at every width, and 1 for every case at 428 and 723. For the parent cases at 320, 375 and 393, record the count and the controls' summed widths plus gaps against the row width. Do not assert those.
- The Record a batch counts are band 1 and log 1 for the none cases, and 0 in both otherwise.
- Overflow is ≤ 0.5.
- Report, per cell, the band height and the Go to batch gap against the baseline. Assert that the band height delta equals the acts row's height delta ± 0.5, so nothing else in the band moved.

`matrix`, from 724 up (6 cases x 3 widths x 2 engines): labels, classNames, child boxes, row count and band height equal the baseline within 0.5. No child label matches /^Record/. The log's Record a batch count is 1 for the none cases.

`behaviour` (393 coarse and 723 fine, both engines):
- B1, tasted-first: the tracer's sequence.
- B2, none-first: the same sequence with the band's Record a batch. Before the click, the counts are band 1 and log 1. After Cancel, focus is on `.notebook-log .notebook-action`.
- B3, awaiting-parent: the band's Record a tasting opens `.batch-margin--pen`. The Churn date is focused and in view. `.batch-row__date` is present, which marks the amend pen. Exactly one `.batch-margin--pen button.save-ceremony__add-tasting` exists, and `.batch-margin--pen .axis-mark__stops` count is 0, so tasting is not yet open. That is the seam's behaviour today; 261002-wn0 changes it. Cancel puts focus on `.notebook-log .batch-row__correct`.
- B4, tasted-first: the band's Next version focuses the field labelled "Version name". Cancel inside `form[aria-label="Next version"]` puts focus on a `.notebook-band` button reading Next version, whose class is notebook-link below 724.
- B5, awaiting-first: after the setup save made through the band's Record a batch at 393, the URL is a /batch/ route and focus is on the log's `h2.region-name` reading "Batch".
- Log scrollY at each step.

B3 will fail until Task 2. The no-argument run in this task's verify does not include it.

`boards`: open 393-phone-log.html (openBoard defaults: its $preview width, coarse) and 723-phone-log.html (fine), in both engines.
- Find each panel by its title paragraph. Take the frame, the panel's first div child, as the x origin.
- The acts row is the parent of the button reading "Next version". Read it with the same fields as readBand.
- Pair each panel with the app at 393 coarse or 723 fine in the same engine: Tasted batch with tasted-first, Batch awaiting tasting with awaiting-first, No batch yet with none-first, Version with a parent with none-parent.
- Assert:
  - labels and order are equal
  - exactly one non-transparent background, on the first control, and the app's backgroundColor and color equal the board's
  - the text controls are transparent, underlined, and their colour equals the board's
  - the filled control's left is 20 ± 0.5 in both
  - the app's filled width minus the board's is between 0 and 4.5
  - each text control's width is within 1 of the board's
  - both 10px gaps hold within 0.5 in both
  - the row counts are equal
  - at 393, every height is 44 ± 0.5 in both
- At 723 fine, record the heights and do not fail on them. Name the two departures decision 30 records: the board's 41-tall filled primitive against the app's 44 (`.notebook-action`'s --touch-min floor), and the 17-tall centred text controls against the app's 44 stretched ones ("the same to the eye").
- Record the board's and the app's Go to batch gaps.

Use `finish` so any failure exits non-zero. The harness binds only ephemeral 127.0.0.1 ports. Never request :4173, :5173 or :8011, and start no Vite process (CLAUDE.md: one Vite process per workspace). All input values are English.

Step 2: run `npm --prefix app run build` on the post-wmy source, unchanged by this item. Then run `node <probe> baseline`. It must exit 0 and write the JSON.

Step 3, RED. Write the tests from `<behavior>`:
- In VersionRow.test.jsx, add the describe block "VersionRow — below 724 the band's one filled action is the record act (sketch 011 decision 30, 261002-wmz)". Scope every assertion to the acts group's markup, from `class="notebook-version__acts"` to its closing `</div>`, so wmy's Go to batch row can never satisfy or break one.
- Create app/src/ui/VersionRow.record.test.jsx with the jsdom docblock and the BatchRow.signed.test.jsx mount pattern (MemoryRouter, vi.fn spies, `act(() => button.click())`).
- Add Test K to RecipePage.test.jsx, and Test M to useBelowDesktop.test.js if the hook moved in Step 0.

Run the touched test files and confirm the RED and guard split from `<behavior>`. Commit only the test files by explicit path: `test(261002-wmz): band's filled record action below 724 (RED)`.

Step 4, GREEN.

In VersionRow.jsx:
- Import standingFor, NOT_YET_CHURNED, AWAITING_TASTING and TASTED from '../domain/lastEvent.js'.
- Add a module-level map from the three constants to "Record a batch", "Record a tasting" and "Record another", in the style of RecipeList.jsx's STANDING_WORDS.
- Add the props `below724 = false` (or wmy's prop), `onStartRecording = () => {}` and `onRecordTasting = () => {}`.
- Compute `standingFor(batches)` once, or reuse wmy's variable.
- In the acts group, before Next version and only when below724 is true, render one `<button type="button" className="notebook-action" tabIndex={0}>` with the mapped label. Its onClick is an arrow that calls `onRecordTasting()` when the standing is AWAITING_TASTING and `onStartRecording()` otherwise. In this task the AWAITING_TASTING branch is wired but tested only in Task 2.
- Next version keeps its ref, onClick and tabIndex. Its className becomes 'notebook-link' when below724 is true and stays 'notebook-action' otherwise.
- Show changes is untouched.
- Update the acts-group comment and the header comment's sentence about where the record acts live. Cite sketch 011 decision 30 (Mark, 2026-10-02) and say that from 724 up the band is as built.
- Add no CSS. The existing `.notebook-version__acts` (flex, wrap, the 10px --app-notebook-acts-gap) already draws the board's row. Its default stretch makes the text controls 44 tall, which decision 30 recorded as the same to the eye.

In RecipePage.jsx:
- Read the below-724 hook once, beside `useBelowDesktop()` and above the early returns, or reuse wmy's read.
- Pass the boolean and `onStartRecording={handleStartRecording}` to VersionRow.
- Leave the BatchRow element unchanged.

Return path: change nothing. Cancel closing a pen opened from the band uses BatchRow's existing focus returns, so it stays put in the log (decision 30's least). Save uses the existing focus landing on the saved batch's heading.

Run the touched test files until green. Rebuild with `npm --prefix app run build` and run `node <probe> tracer`.

If the Churn date is focused but outside the viewport in WebKit, the assumption that autoFocus brings the pen into view is wrong. Stop and report it. Do not add scroll code; where to add it (BatchRow or RecipePage) is a decision for Mark.

Commit the source files, the probe and the baseline JSON by explicit path: `feat(261002-wmz): below 724 the band's filled action is the record act; Next version a text control`. Never use `git add -A`. Never stage anything under .planning/sketches, .planning/canvas-generators or .impeccable, including the untracked critique snapshots already in the tree.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/VersionRow.test.jsx src/ui/VersionRow.record.test.jsx src/ui/RecipePage.test.jsx src/ui/useBelowDesktop.test.js src/ui/BatchRow.test.jsx src/ui/tabindex-scan.test.js && npm --prefix app run build && node .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs tracer && test -s .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-baseline.json && grep -q 'standingFor(batches)' app/src/ui/VersionRow.jsx && test "$(grep -l "723.98px)'" app/src/ui/*.js app/src/ui/*.jsx | grep -v '\.test\.' | wc -l | tr -d ' ')" = "1"</automated>
  </verify>
  <done>
- The baseline JSON exists, was captured from the post-wmy build before any app/src edit, and its precondition held.
- The RED commit holds the tests, and the RED and guard split matches `<behavior>`.
- The GREEN commit makes them pass.
- Below 724, Olive Oil v1's band reads Record another (filled), then Next version (text). The tracer opens the record pen from the band with the Churn date focused and in view, and Cancel returns focus to the log's own Record another.
- Exactly one non-test module under app/src/ui holds the 723.98px query literal.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Record a tasting through the SEAM(261002-wn0) handler (RED, then GREEN), then the full suite and the build</name>
  <files>app/src/ui/VersionRow.test.jsx, app/src/ui/VersionRow.record.test.jsx, app/src/ui/RecipePage.test.jsx, app/src/ui/VersionRow.jsx, app/src/ui/RecipePage.jsx</files>
  <read_first>app/src/ui/RecipePage.jsx (handleStartAmending and handleAddTasting, near lines 1292-1339 at 4faea98; the VersionRow element); app/src/ui/VersionRow.jsx (the acts group as Task 1 left it); app/src/ui/RecipePage.test.jsx (lines 754-788, the comment-stripping scan); .planning/quick-batches/261002-wmx/BATCH.json (items[2], 261002-wn0's description, so the seam fits what wn0 will replace)</read_first>
  <behavior>
    - Test F (VersionRow.test.jsx, static): the below-724 prop is true and batches is [{ ...augustSecondBatch, tasting: null }]. The acts group's first button is the filled "Record a tasting", followed by the notebook-link Next version. With childVersion and parentVersion set, the order is Record a tasting, Next version, Show changes.
    - Test J (VersionRow.record.test.jsx, jsdom): the below-724 prop is true and the batch awaits tasting. Clicking "Record a tasting" calls onRecordTasting once with no argument, and onStartRecording is never called.
    - Test L (RecipePage.test.jsx, source scan with comments stripped): `function handleRecordTasting()` exists. Its body is a single statement, `handleStartAmending(sortedBatches(batches)[0]);`. The VersionRow element passes `onRecordTasting={handleRecordTasting}`. A second assertion reads the raw, unstripped source and finds the marker `SEAM(261002-wn0)` in the comment block immediately above `function handleRecordTasting`.
    - F, J and L fail before this task's source edit (RED).
  </behavior>
  <action>
RED: add Tests F, J and L to the three files named in `<behavior>`. Confirm that they fail and that every Task 1 test still passes. Commit only those test files by explicit path: `test(261002-wmz): Record a tasting calls the wn0 seam (RED)`.

GREEN, in RecipePage.jsx: add `function handleRecordTasting()` right after handleStartAmending. Its whole body calls `handleStartAmending(sortedBatches(batches)[0])`. The latest batch is the one standingFor read for the label, so the label and the act name the same batch. The button only renders for AWAITING_TASTING, so batches is never empty there.

Above it, write a comment block whose first line carries the marker SEAM(261002-wn0), stating:
- the band's Record a tasting (sketch 011 decision 30, answer 1) calls this function
- for now it opens the amend pen on the latest batch by the log's own Correct path, with Add tasting one tap inside the pen
- 261002-wn0 replaces only this body with the amend pen opened with the tasting step already open and no Correct
- the return path stays BatchRow's (Cancel focuses the log's Correct)

Pass `onRecordTasting={handleRecordTasting}` to VersionRow. The arrow and branch Task 1 wrote in VersionRow.jsx need no change unless Test J shows otherwise.

Write down for the SUMMARY, as findings for wn0, and do not fix them here:
- (1) When the URL names an older batch, openBatch is not the latest. The amend pen then corrects the latest batch while the log's head names the batch in view, and BatchRow assumes "amend corrects the very batch in view".
- (2) This item returns by staying put in the log. 261002-wn0's description asks Save and Cancel to return the maker to the band for Record a tasting, which would differ from Record a batch and Record another unless wn0 extends it to all three.

Then run the full suite, `npm --prefix app test`. It must pass with Task 0's baseline count plus this item's new tests and one new file (VersionRow.record.test.jsx), with none removed. If an existing assertion conflicts, update it to the new rule and name it in the SUMMARY; never delete a test. Run `npm --prefix app run build`.

Commit RecipePage.jsx, plus VersionRow.jsx if it changed, by explicit path: `feat(261002-wmz): band's Record a tasting calls the SEAM(261002-wn0) handler`.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && grep -q 'SEAM(261002-wn0)' app/src/ui/RecipePage.jsx && grep -q 'onRecordTasting={handleRecordTasting}' app/src/ui/RecipePage.jsx && grep -q 'handleStartAmending(sortedBatches(batches)\[0\])' app/src/ui/RecipePage.jsx && STATUS="$(git status --porcelain app/src)" && test -z "$STATUS"</automated>
  </verify>
  <done>
- Below 724, a version whose latest batch awaits tasting shows the filled Record a tasting. Clicking it calls handleRecordTasting, which opens the amend pen on the latest batch today.
- The seam is marked SEAM(261002-wn0), and its body is the one line wn0 replaces.
- The full suite and the build pass, and the count is recorded.
- The two findings for wn0 are written down.
  </done>
</task>

<task type="auto">
  <name>Task 3: Measure the matrix, the behaviour and both boards in WebKit and system Chrome, and write the SUMMARY</name>
  <files>.planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-SUMMARY.md, .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs (only if a probe defect is found)</files>
  <read_first>.planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs, .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-baseline.json, .planning/sketches/011-recipe-route-c/README.md line 101 (decision 30's measured numbers, to compare against)</read_first>
  <action>
app/dist must be built from the final code; Task 2 left it so. Run `node <probe> matrix,behaviour,boards`. It must exit 0.

If a cell fails, find out why before changing anything:
- If the cause is in VersionRow.jsx or RecipePage.jsx, fix it there, add a test first, re-run, and commit by explicit path.
- If the cause is the probe itself (a wrong selector or a wait), fix the probe, say so in the SUMMARY, and commit it by explicit path.
- If the cause is CSS or a board difference outside decision 30's recorded ones, record it for Mark. Do not edit app/src/styles, the sketch or its generator.

Write 261002-wmz-SUMMARY.md with:
- The rule as built and the RED-then-GREEN evidence for both tasks, naming D and E as guards.
- Step 0's answers about wmy's signal, standing and row placement, and whether the hook moved.
- The seam: its file, name and marker, what it does today, what wn0 replaces, and the two findings for wn0 from Task 2.
- The return path as built: Cancel stays put with focus on the log's own opener; Save lands on the saved batch's heading; the scrollY readings.
- A matrix table with: engine, width and pointer, case, labels, filled width x height, Next version x/width/height, Show changes x, row count, band height before and after, the Go to batch gap, and overflow.
- The three-control fit for the parent cases (tasted-parent, awaiting-parent, none-parent) at 320, 375, 393 and 428 in both engines: the controls' sum plus gaps against the row width and the row count. Compare with decision 30's figures: awaiting-parent wraps at 393 by 0.7 in Chromium and 3.6 in WebKit, and tasted-parent fits at 393 with 5.5 spare. Note that 261002-wn1 removes the wrap by moving Show changes.
- The ≥724 equality with the baseline.
- The board comparison per panel, with the two recorded 723-fine height departures and the filled-width difference.
- The two Record a batch buttons below 724 with no batch, and one from 724 up.
- The test count, as files and tests, with the delta from Task 1's Step 0 baseline (the plan-time figure was 55 files and 1516 tests at 4faea98, before wmy).

State plainly that the readings come from Playwright WebKit and system Chrome, not from Mark's devices.

Rebuilding app/dist already updates what Mark's :4173 preview serves; `vite preview` needs no restart. Do not start, stop or request that preview, and leave :8011 alone.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build && node .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs matrix,behaviour,boards && test -f .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-SUMMARY.md && TOUCHED="$(git log --name-only --format= --grep='261002-wmz')" && ! printf '%s\n' "$TOUCHED" | grep -E '^(\.planning/sketches/|\.planning/canvas-generators/|\.impeccable/|app/src/styles/|DESIGN\.md|app/src/ui/IngredientTable\.jsx)'</automated>
    <human-check>Deferred to Mark (end-of-run UAT). Mark's :4173 preview serves the rebuilt app/dist. On each device he reloads the tab (a hard reload if it looks stale), then checks:
(1) iPhone (393): Olive Oil v1's band shows a filled Record another with Next version underlined beside it. Tapping Record another opens the record pen with the Churn date in view. Cancel leaves him at the log, not back at the band.
(2) iPhone: Coconut v2 shows a filled Record a tasting. Today it opens the Correct pen on that batch with Add tasting inside; 261002-wn0 changes this to open on Add tasting directly. Show changes wraps under the filled action on this version until 261002-wn1 moves it.
(3) iPhone: Standard Base v1 shows two filled Record a batch buttons, one in the band and one in the log.
(4) iPad, landscape 1366 and portrait 1024: the band is as before, with Next version filled and no record button in the band.
The change counts as device-verified only when Mark confirms.</human-check>
  </verify>
  <done>
- The probe's matrix, behaviour and boards groups exit 0 in both engines at 320, 375, 393 and 428 coarse, 723 fine and coarse, and 724 fine and coarse, plus 1366 fine.
- The SUMMARY records every number, the 393 three-control fit for the parent cases, the seam and its two findings for wn0, and the return path.
- No commit of this item touches stylesheets, sketches, canvas generators, .impeccable, DESIGN.md or IngredientTable.jsx.
- Mark's device check is listed as deferred.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored batches to band control | the version's batches, already in the local store, decide the band's label and which RecipePage handler a tap calls. No new input is accepted. |
| band control to record and amend pens | the band opens the same pens the log opens. The amend pen writes to an existing batch on Save. |
| probe to local servers | the probe serves app/dist and the repo on ephemeral 127.0.0.1 ports and drives throwaway browser contexts, one of which saves a batch to its own IndexedDB |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-wmz-01 | Tampering | handleRecordTasting opening the amend pen on the wrong batch | medium | mitigate | The seam amends `sortedBatches(batches)[0]`, the batch standingFor read for the label (Test L pins the exact call). The button renders only when that batch awaits tasting (Tests F and D). The one known edge, a URL naming an older batch, is recorded for 261002-wn0, and nothing is saved without the maker's own Save in the pen. |
| T-wmz-02 | Repudiation | two filled Record a batch buttons (band and log) | low | mitigate | Both call the same handleStartRecording (Tests G and H, and the existing BatchRow test), so they can never make two different records. The band's acts row unmounts while any pen is open (Test E), so a second pen cannot open over the first. The existing batchSaveLockRef still guards a double Save. |
| T-wmz-03 | Denial of Service | the probe's servers, Mark's running :4173 preview and Sid's :8011 | low | mitigate | The harness binds only ephemeral 127.0.0.1 ports, aborts every non-127.0.0.1 request, and closes its servers and browsers. No Vite process is started, and :4173, :5173 and :8011 are never requested. The awaiting-first save stays in a throwaway context's own IndexedDB. |
| T-wmz-SC | Tampering | npm/pip/cargo installs | high | accept | No package is added or changed. The probe uses the playwright-core module and the WebKit build already on disk, and jsdom is already a devDependency (Mark 2026-09-28). If an install ever seems needed, stop and raise a blocking human checkpoint first. |
</threat_model>

<verification>
- The baseline was captured from the post-wmy build before any app/src edit, with its precondition asserted: no record control in any band, and Next version filled.
- `npm --prefix app test` passes with the Step 0 baseline count plus this item's tests and one new file, with none removed. `npm --prefix app run build` succeeds.
- `node .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs tracer,matrix,behaviour,boards` exits 0 in WebKit and system Chrome.
- RecipePage.jsx carries SEAM(261002-wn0) above handleRecordTasting, whose body is `handleStartAmending(sortedBatches(batches)[0])`.
- Under app/, only the files in files_modified changed. No stylesheet, token or IngredientTable.jsx changed.
</verification>

<success_criteria>
- Below 724 the band's one filled action is the record act the version is waiting on (Record a tasting, Record another or Record a batch), and Next version is an underlined word beside it, matching both phone-log boards.
- Record a batch and Record another open the log's own record pen in view and return by staying put. Record a tasting opens the amend pen on the latest batch through the marked seam that 261002-wn0 replaces.
- With no batch, the band and the log each carry a filled Record a batch.
- From 724 up the band measures identical to the baseline.
- The three-control fit at 393 for versions with a parent is recorded for 261002-wn1.
</success_criteria>

<output>
Create `.planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-SUMMARY.md` when done (Task 3 writes it).
</output>
