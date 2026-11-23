---
phase: quick-261122-tql
plan: 01
quick_id: 261122-tql
type: execute
wave: 2
depends_on: ["261122-tqk"]
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/RecipePage.recordTasting.test.jsx
  - app/src/ui/NotebookPlace.test.jsx
  - .planning/quick/261122-tql-bug-p12-focus-lost-across-724-cancel-leaves-nothing-focused/261122-tql-SUMMARY.md
autonomous: true
requirements:
  - bug-p12-focus-lost-across-724

must_haves:
  truths:
    - "Below 724 the band's Record batch opens the new-record pen. After the window widens to 724 or more, Cancel puts focus on the batch log's own Record batch, not on the page body"
    - "Below 724 the band's Record another opens the new-record pen. After widening, Cancel or Escape on the untouched pen puts focus on the batch log's own Record another"
    - "Below 724 the band's Record tasting opens the tasting pen. After widening, Cancel puts focus on the log head's Correct, which opens the same pen on the same batch"
    - "At 724 or more, Home's Record tasting opens the tasting pen on the batch page through route state with the band's opener. Cancel there now puts focus on Correct. Before the fix it left focus on the page body (found by reading; Task 1 proves it red)"
    - "As built and unchanged: below 724 with no crossing, or after widening and narrowing again before Cancel, Cancel returns to the band's record act and scrolls it to centre. The log's own Record batch, Record another and Correct return to themselves at every width. An amend Save still lands on the Batch heading. The Next version pen closing below 724 is untouched (decide-p12-phone-focus-after-pen-close)"
    - "Case one after 261122-tqk: below 724 the New recipe entry, its Cancel included, is not drawn, so its Cancel cannot drop focus there. At 724 or more the entry's Cancel returns focus to New recipe, and also after the window narrowed below 724 and widened again (tqk hides the entry and keeps it open, so it is drawn again on widening). NotebookPlace.jsx is not changed by this item"
    - "Reproduced in Playwright WebKit and Chromium against scratch builds: the base build fails exactly the four case-two probe lines in both engines. The fixed build passes all seven lines in both engines. Nothing is device-verified"
  artifacts:
    - path: app/src/ui/BatchRow.jsx
      provides: "The Correct and Record focus returns latch which opener opened the pen. At Cancel they take a pen the band opened when the window is 724 or more, where the band draws no record act"
      contains: "amendOpenedByRef"
    - path: app/src/ui/RecipePage.recordTasting.test.jsx
      provides: "A resizable matchMedia stub (resizeTo) and six cases in a describe named for bug-p12-focus-lost-across-724. Four are red at the base and two are guards"
      contains: "bug-p12-focus-lost-across-724"
    - path: app/src/ui/NotebookPlace.test.jsx
      provides: "Guards C1 and C2, nested in 261122-tqk's width describe: the entry's Cancel returns focus to New recipe at a desk width, and after a narrowing and widening"
      contains: "bug-p12-focus-lost-across-724"
  key_links:
    - from: app/src/ui/BatchRow.jsx
      to: app/src/ui/useBelowDesktop.js
      via: "BatchRow's own useBelow724() value, read in the Correct and Record focus-return effects when openPen returns to null. The band's record act (VersionRow.jsx) is drawn only while that value is true"
      pattern: "useBelow724\\(\\)"
    - from: app/src/ui/RecipePage.recordTasting.test.jsx
      to: app/src/ui/BatchRow.jsx
      via: "resizeTo(1366) fires the change listeners the width hooks registered, so BatchRow re-renders with below724 false while the pen stays open"
      pattern: "resizeTo\\("
  prohibitions:
    - statement: "MUST NOT change VersionRow.jsx, RecipePage.jsx, useBatchRecording.js, useRouteIntents.js, NotebookPlace.jsx, any on-screen word, any stored shape or DB_VERSION"
      verification: test
    - statement: "MUST NOT build into app/dist, start a Vite dev or preview process, or touch port 4173. Every build names an --outDir under ${TMPDIR:-/tmp}/sprinkles-tql"
      verification: test
---

<objective>
Close the Mark's List row bug-p12-focus-lost-across-724 (state machine audit 2026-11-22, items 2 and 17). The defect: Cancel leaves nothing focused when the control it returns to is not drawn at the current width.

**Case two, the recipe head (the fix).** Below 724 the band's record act (Record batch, Record another or Record tasting, VersionRow.jsx:477-485) opens a pen with the band's opener: 'band' for the new-record pen, 'record-a-tasting' for the tasting pen. VersionRow latches that when the pen opens (:133-141). At close it focuses its own record-act ref (:142-150). From 724 up that button is not drawn, so the ref is null and nothing takes focus. BatchRow's two returns (BatchRow.jsx:541-577) take only the log's own openers ('correct', 'log'). So after a widening, focus falls to the page body.

By reading, the same gap exists at a desk width with no crossing at all. Home draws Record tasting at every width (RecipeList.jsx:223-236). On the batch page its route state opens the tasting pen with the 'record-a-tasting' opener (useRouteIntents.js:41-55), and Cancel there finds no band button. A kept tasting draft restored at a desk width carries the same opener (RecipePage.drafts.test.jsx:712-724). Task 1 proves the Home path red. The one fix covers all of these, because it decides at Cancel from the current width.

**Case one, the Notebook, as it stands after sibling 261122-tqk lands.** tqk's plan puts `!below724` in front of the entry form's render condition (NotebookPlace.jsx:236), the test New recipe already carries at :230. It hides the entry and does not close it: the open state and the typed name are kept, and the entry is drawn again from 724 up. The focus effect and handleCancel (:192-207) are left to this item. Then the entry's Cancel is drawn only from 724 up, where New recipe is drawn again as soon as the entry closes, so the return at :195-197 always finds it. Item 2's steps end at "narrow below 724" with no Cancel to press. Nothing is left to fix in NotebookPlace.jsx. What remains of case one:
- One Cancel path still crosses the cut: open the entry at a desk width, narrow, widen, then Cancel. It lands on New recipe as built. Task 1 pins it with guard C2. Guard C1 pins the plain desk return, which no test pins today.
- tqk introduces a narrowing with focus inside the entry. That narrowing takes the entry out of the markup, so focus drops to the body. This happens on narrowing, not on Cancel. It has the same shape as the editor's own narrowing, which Mark left as built (decide-p12-narrowing-closes-editor). It is not fixed here. The SUMMARY names it for the orchestrator.
- Two more paths, not width-related, are seen by reading only. (a) Cancel pressed while Start's write is still out. (b) Start pressed while a draft is kept elsewhere. Both end with the draft row replacing the head's controls, and focus then drops to the body. They are outside this item. The SUMMARY names them and does not fix them.

Decisions taken in this plan (Claude's discretion, within the item's "a control that is drawn at the current width"):
- **The target:** when the band's record act is not drawn, the batch log's own opener for the same pen takes the return: Record batch or Record another for a new record, Correct for the tasting pen. Each one opens that pen on that batch at this width, and BatchRow already returns to it when it opened the pen. It stands beside the pen the maker just closed. Record batch and Record another carry the same words the maker pressed.
- **Rejected:** the band's Next version (the first control where the record act stood). It names a different act and pulls the page back up to the band. It would be a one-file change in VersionRow.jsx. It would also cover the residual below. Record the rejection in the SUMMARY so Mark can overrule it.
- **When it is decided:** at Cancel, from the width at that moment, not at open. Widen and then narrow again before Cancel, and focus still goes to the band, as built (guard G1).
- **Where:** BatchRow.jsx only. BatchRow already reads useBelow724 (:655), so neither RecipePage.jsx nor VersionRow.jsx changes. VersionRow's return already does nothing while its button is not drawn. The two returns never both act, because VersionRow's button is drawn exactly while below724 is true. Its other conditions (no kept edit, no held plan) cannot change while a record or tasting pen is open.
- **Residual, not covered:** an address naming no batch of the version (a hand-typed address only, test O3 at :373-384). From 724 up that address draws no record opener in the log at all, so a band pen opened at 393, widened and cancelled still leaves focus on the body. The audit leaves hand-typed-only paths unfiled. The SUMMARY records it.
- **Not touched:** the Next version pen closing below 724 (decide-p12-phone-focus-after-pen-close, leave as built), and every on-screen word.

Purpose: Cancel always leaves the maker on a control they can see and use at the width they are at.
Output: two focus-return effects changed in BatchRow.jsx, eight test cases across two test files, two scratch builds, and the SUMMARY. The probe script lives in scratch and is not kept in the repo, as with 261122-tqk and the audit. The SUMMARY holds its output lines as the record.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

Read by range, not whole. Line numbers are HEAD's at planning time (b06add6f). Sibling 261122-tqk lands first and changes NotebookPlace.jsx and NotebookPlace.test.jsx. Find those ranges by their text.
- .planning/state-machines/2026-11-22-audit.md: rows 2 and 17 (lines 39 and 54), items 2 and 17 (lines 85-91 and 128-135).
- app/src/ui/VersionRow.jsx: the band's focus return (lines 124-151), the acts row with the band's record act and Next version (lines 475-494). Read only.
- app/src/ui/BatchRow.jsx: the opener props (lines 490-491), the Correct and Record focus returns (lines 541-577), the landing effect (lines 579-590), the useBelow724 read and its comment (lines 653-655), Correct and Record another in the head (lines 789-818), and the no-batch Record batch (lines 1334-1347).
- app/src/ui/useBatchRecording.js: handleStartRecording (lines 113-134), handleStartAmending and handleStartTasting (lines 282-333), the amend save (lines 440-467: setMode('reading') and setFocusBatchAttempt are in the same callback), handleCancelRecording (lines 497-518). Read only.
- app/src/ui/useRouteIntents.js lines 37-55 and app/src/ui/RecipeList.jsx lines 200-236. Read only.
- app/src/ui/useBelowDesktop.js lines 30-52 (useBelow724, BELOW_724_QUERY). Read only.
- app/src/ui/RecipePage.recordTasting.test.jsx: helpers (lines 66-189), the T block (lines 191-327), the O block (lines 329-415).
- app/src/ui/RecipePage.drafts.test.jsx lines 142-178: the resizable matchMedia stub and resizeTo to copy the shape from.
- app/src/ui/NotebookPlace.jsx NotebookHead (about lines 176-269 before tqk), and app/src/ui/NotebookPlace.test.jsx, the "NotebookPlace starting a recipe" describe (lines 463-813, helpers 487-535). Read them as tqk left them. tqk adds a nested describe named "an entry open as the window crosses 724 (bug-p12-start-after-narrowing-strands-draft)". It holds its own width stub (installWidth, setWidth, and an afterEach that restores window.matchMedia) and cases N1 to N3.
- The 261122-tqk PLAN and SUMMARY (.planning/quick/261122-tqk-*/): how the entry behaves when the window narrows and widens again, and the INFO focus line its probe recorded for this item.
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs lines 31-76 (the PROBE_DIST refusal block and the PLAYWRIGHT_CORE load), and 12-band-probe.mjs lines 141-218 (server, context, request abort, clickUntil, visit, makeRecipe, recordBatch).
- Do not edit: VersionRow.jsx, RecipePage.jsx, useBatchRecording.js, useRouteIntents.js, NotebookPlace.jsx, app/src/domain, app/src/store, app/src/styles, app/dist, any phase probe. Leave the preview on port 4173 alone. Start no Vite dev or preview process.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: RED: case-two cases and case-one guards in jsdom, then the probe against a base build in WebKit and Chromium</name>
  <files>app/src/ui/RecipePage.recordTasting.test.jsx, app/src/ui/NotebookPlace.test.jsx</files>
  <precondition>Sibling 261122-tqk has landed in this checkout: its SUMMARY exists under .planning/quick/261122-tqk-*/ and `git log --oneline` names 261122-tqk. Stop and report if not.</precondition>
  <read_first>
    - app/src/ui/RecipePage.recordTasting.test.jsx (lines 66-189, 329-415)
    - app/src/ui/RecipePage.drafts.test.jsx (lines 142-178)
    - app/src/ui/BatchRow.jsx (lines 541-590)
    - app/src/ui/VersionRow.jsx (lines 124-151, 475-494)
    - app/src/ui/NotebookPlace.jsx (NotebookHead, as tqk left it) and app/src/ui/NotebookPlace.test.jsx (the "NotebookPlace starting a recipe" describe)
    - the 261122-tqk SUMMARY
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs (lines 31-76) and 12-band-probe.mjs (lines 141-218)
  </read_first>
  <behavior>
    In RecipePage.recordTasting.test.jsx, add one top-level describe after the O block, named "Cancel after the window crosses 724 returns focus to a control drawn at that width (bug-p12-focus-lost-across-724)". "The log's X" below means buttonByText(current.container.querySelector('.notebook-log'), 'X'). awaiting is the file's own tasting-less 2 Aug batch, and augustSecondBatch the tasted one.
    - W1, red at the base. installMatchMedia(393); mountAt(VERSION_PATH, []). Expect band() to read 'Record batch'. Click band(). Expect pen() not null. resizeTo(1366). Expect pen() still not null. Click the pen's Cancel. Expect pen() null, document.activeElement to be the log's Record batch, and not document.body.
    - W2, red at the base. installMatchMedia(393); mountAt(VERSION_PATH, [augustSecondBatch]). Expect band() to read 'Record another'. Click band(). resizeTo(1366). Call pressEscape() on the untouched pen. Expect pen() null and document.activeElement to be the log's Record another.
    - W3, red at the base. installMatchMedia(393); mountAt(VERSION_PATH, [awaiting]). Expect band() to read 'Record tasting'. Click band(). Expect document.activeElement to be tastedInput(). resizeTo(1366). Click the pen's Cancel. Expect pen() null and document.activeElement to be the container's .batch-row__correct.
    - W4, red at the base (Home's Record tasting at a desk width). installMatchMedia(1366). mountAt({ pathname: VERSION_PATH + '/batch/' + awaiting.id, state: { startTasting: true } }, [awaiting]), then flush until pen() is not null. Expect document.activeElement to be tastedInput(). Click the pen's Cancel. Expect pen() null and document.activeElement to be .batch-row__correct.
    - G1, a guard that passes at the base. installMatchMedia(393); mountAt(VERSION_PATH, [awaiting]). Click band(), which is Record tasting. resizeTo(1366), then resizeTo(393). Click the pen's Cancel. Expect document.activeElement to be band() and scrollIntoView.mock.contexts to contain band().
    - G2, a guard that passes at the base. Set up as W4. Fill the pen's 'How did it turn out?' with 'Soft, not greasy.' and its Tempering field with '10', as T4 does. Click 'Save batch' and flush until pen() is null. Expect store.saveBatch called once and document.activeElement to be the container's h2#batch.
    In NotebookPlace.test.jsx, nest one describe inside tqk's "an entry open as the window crosses 724 (bug-p12-start-after-narrowing-strands-draft)", after its last case. Name it "the entry's Cancel across the 724 cut (bug-p12-focus-lost-across-724)". It reuses tqk's installWidth and setWidth, and tqk's afterEach restores window.matchMedia, so it adds no stub of its own. It also reuses the outer harness: mount, open, press, type, button and nameField. Each case calls installWidth before mount().
    - C1, a guard. installWidth(1366). Mount and open New recipe. Expect document.activeElement to be nameField(container). Press Cancel. Expect no form.nb__new, and document.activeElement to be button(container, 'New recipe').
    - C2, a guard. installWidth(1366). Mount, open and type 'Vanilla'. setWidth(393). Expect no form.nb__new and no Cancel button: this is tqk's rule, checked as setup. setWidth(1366). Expect form.nb__new drawn again. Press Cancel. Expect no form.nb__new, and document.activeElement to be button(container, 'New recipe').
  </behavior>
  <action>
    First record the base and build it. Make the directory "${TMPDIR:-/tmp}/sprinkles-tql" and write `git rev-parse HEAD` into a file named BASE inside it. Build the unchanged app with `npm --prefix app run build -- --outDir "${TMPDIR:-/tmp}/sprinkles-tql/dist-base" --emptyOutDir`. Never build into app/dist.

    In RecipePage.recordTasting.test.jsx, make installMatchMedia resizable in the shape of RecipePage.drafts.test.jsx lines 142-178. Keep its signature, its default of 393, its scrollIntoView stub and its query rules exactly: max-width, then min-width, then 'pointer: coarse' answers true. Add a module-level width and listener list. Make each returned object's matches a getter over that width, and make addEventListener and removeEventListener keep the list. Add an async resizeTo(width): it sets the width, calls every listener with { matches } for its own query inside act, then awaits flush(() => false). Clear the list in the existing afterEach. No existing case calls resizeTo, so they behave as before. Then write W1, W2, W3, W4, G1 and G2 exactly as in the behavior block, in that order, with case names in plain English that say what the maker did and where focus lands.

    In NotebookPlace.test.jsx, first read how tqk left NotebookHead and its width describe. If below 724 the entry's Cancel is still drawn, STOP AND REPORT: case one's premise is tqk's to deliver, and this item does not change NotebookPlace.jsx. If tqk's width helpers carry other names, use them. If tqk closes the entry on narrowing instead of hiding it, leave C2 out: no Cancel path is then left across the cut, and the SUMMARY says so. Otherwise write C1 and C2 as in the behavior block.

    Do not change any existing case, helper or fixture beyond the matchMedia stub. A line that only checks setup (band words, pen present, the entry hidden at 393) describes the drawn state at the base. If one differs, record the drawn value in the SUMMARY and correct only that setup line. Never change a focus expectation to make a case pass or fail.

    Run `npm --prefix app test -- src/ui/RecipePage.recordTasting.test.jsx -t "bug-p12-focus-lost-across-724"`. Expect exactly four failures (W1 to W4) and two passes (G1, G2). Each of the four must fail on its document.activeElement expectation, with focus on the body. Copy the four messages into the SUMMARY. Then run NotebookPlace.test.jsx whole and expect it green. STOP AND REPORT, without bending a case, if any of W1 to W4 passes at the base, if one fails for another reason, or if G1, G2, C1 or C2 fails.

    Write the probe with the Write tool at "${TMPDIR:-/tmp}/sprinkles-tql/probe-tql.mjs". It goes in scratch, never in the repo, as tqk's does. Give it a header comment in the style of 12-band-probe.mjs: what it walks, the usage line, and that nothing is device-verified. It reads PROBE_DIST and REPO (the checkout's root, from `git rev-parse --show-toplevel`) from the environment, and prints a FAIL and exits 1 when either is missing. Copy the refusal block and the PLAYWRIGHT_CORE load from 12-phone-probe.mjs lines 42-76, with REPO standing in for REPO_ROOT. Load startServers with a dynamic import of REPO's .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs, as a file URL. Copy the server, context, request abort, clickUntil, visit, makeRecipe and recordBatch helpers from 12-band-probe.mjs lines 141-218. Use hasTouch true and no isMobile. The engine is argv[2], webkit or chromium. Launch Chromium as the audit did, with channel 'chrome' and headless. If that throws, launch the bundled chromium, and print an INFO line naming which one ran. Set up at 1366 in one context: makeRecipe('Lemon') (no batch), then makeRecipe('Ginger') and recordBatch on Ginger's version (it then awaits its tasting). Every typed value is English. Each check visits its address fresh and then reports. After Cancel it waits for .batch-margin--pen to detach and reads document.activeElement: tag, trimmed text, class, whether it sits inside .notebook-log or .notebook-version__acts, and whether its box lies inside the viewport. It prints exactly one line, "PASS <id> <detail>" or "FAIL <id> <detail>", with a single space after the id. The checks:
    - narrow-control-band: at 393, the band's Record batch on Lemon, then Cancel. Focus is in .notebook-version__acts and reads Record batch.
    - widen-record-batch: at 393, the band's Record batch on Lemon, then setViewportSize 1366, then Cancel. Focus is a button inside .notebook-log that reads Record batch.
    - cut-record-batch: the same at 723, then 724.
    - widen-record-tasting: at 393, the band's Record tasting on Ginger, then 1366, then Cancel. Focus has the class batch-row__correct.
    - desk-home-record-tasting: Home at 1366. Click the Record tasting link whose href starts with Ginger's version address followed by /batch/. When the pen shows, press Cancel. Focus has the class batch-row__correct.
    - one-no-cancel-below-724: /notebook at 1366, press New recipe, then set 393. The page has no .nb__new and no Cancel button.
    - one-round-trip: set 1366 again. If .nb__new is drawn, press its Cancel: focus reads New recipe. If it is not drawn, New recipe must be drawn, and the detail says there is nothing to cancel.
    Also print INFO lines, never PASS or FAIL, for these: each case-two check's viewport result; desk-correct-control (at 1366 on Ginger's batch, press Correct, then Cancel: where focus lands, and whether it is in the viewport); and tab-after-cancel (in widen-record-batch, press Tab once after Cancel and name the element focus reaches). Print "FAIL setup <message>" if setup throws. Exit 1 on any FAIL. Close the browser and the servers in a finally block. If PLAYWRIGHT_CORE is missing, stop and report. Do not install anything.

    Run the probe against the base build in both engines, saving the output. With S set to the scratch folder, run `REPO="$(git rev-parse --show-toplevel)" PROBE_DIST="$S/dist-base" node "$S/probe-tql.mjs" webkit > "$S/base-webkit.txt"`, then the same for chromium into base-chromium.txt. Follow each with `|| true`, because the probe exits 1 on the expected FAILs. Expect in each file exactly four FAIL lines (widen-record-batch, cut-record-batch, widen-record-tasting and desk-home-record-tasting) and three PASS lines. STOP AND REPORT if the set differs. Copy both files' PASS, FAIL and INFO lines into the SUMMARY.

    Commit the two test files (the probe stays in scratch) as `test(261122-tql): reproduce Cancel leaving nothing focused across 724 (bug-p12-focus-lost-across-724)`. Write the message in English. End it with the attribution lines your system reminder gives. If it gives none, end it with these two lines:
    Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01VWwTRSNw8tGVgeHqypcMwH
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-tql"; OUT="$(npm --prefix app test -- src/ui/RecipePage.recordTasting.test.jsx -t 'bug-p12-focus-lost-across-724' 2>&1)"; printf '%s\n' "$OUT" | grep -E 'Tests +4 failed [|] 2 passed' && npm --prefix app test -- src/ui/NotebookPlace.test.jsx && test -s "$S/BASE" && test -s "$S/dist-base/index.html" && test "$(grep '^FAIL ' "$S/base-webkit.txt" | awk '{print $2}' | sort | tr '\n' ' ')" = "cut-record-batch desk-home-record-tasting widen-record-batch widen-record-tasting " && test "$(grep '^FAIL ' "$S/base-chromium.txt" | awk '{print $2}' | sort | tr '\n' ' ')" = "cut-record-batch desk-home-record-tasting widen-record-batch widen-record-tasting " && test "$(grep '^PASS ' "$S/base-webkit.txt" | awk '{print $2}' | sort | tr '\n' ' ')" = "narrow-control-band one-no-cancel-below-724 one-round-trip " && test "$(grep '^PASS ' "$S/base-chromium.txt" | awk '{print $2}' | sort | tr '\n' ' ')" = "narrow-control-band one-no-cancel-below-724 one-round-trip " && test "$(grep -c 'bug-p12-focus-lost-across-724' app/src/ui/RecipePage.recordTasting.test.jsx)" -ge 1 && test "$(grep -c 'bug-p12-focus-lost-across-724' app/src/ui/NotebookPlace.test.jsx)" -ge 1</automated>
    Baselines: slug in RecipePage.recordTasting.test.jsx [HEAD=0 EXPECT>=1]; slug in NotebookPlace.test.jsx [HEAD=0 EXPECT>=1]. The filtered jsdom run must read 4 failed and 2 passed (no case matches it at HEAD). The base probe's FAIL ids per engine must be exactly the four case-two ids, and its PASS ids exactly the other three (no probe exists at HEAD). The jsdom gate holds only while BatchRow.jsx is unchanged. After Task 2 the same run reads 6 passed.
  </verify>
  <done>BASE is recorded, and the base build is in scratch. W1 to W4 fail on focus left on the body and G1, G2 pass. NotebookPlace.test.jsx is green with C1, and with C2 where tqk keeps the entry. The probe fails exactly the four case-two lines in WebKit and in Chromium and passes the other three. The two test files are committed. The probe stays in scratch.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: GREEN: BatchRow takes a band-opened pen's Cancel from 724 up</name>
  <files>app/src/ui/BatchRow.jsx</files>
  <read_first>
    - app/src/ui/BatchRow.jsx (lines 530-600, 653-663)
    - app/src/ui/VersionRow.jsx (lines 124-151, 475-485)
  </read_first>
  <behavior>
    - W1 to W4 and G1, G2 pass.
    - Every existing case in RecipePage.recordTasting.test.jsx still passes. T2, T3 and T6 return to the band below 724. T5 returns to Correct. O1 to O5 return to whichever opener was pressed. T4's Save lands on the Batch heading.
    - The BatchRow, VersionRow and RecipePage.drafts suites pass unchanged.
  </behavior>
  <action>
    Move the line that reads BatchRow's own useBelow724() value, with its comment, from its place after the remove-tasting focus effect to directly above the Correct focus-return comment. Its value is then in scope where the two returns read it. The call stays unconditional at the top level, so the hook order is the same on every render. Extend its comment by one sentence: the same cut decides, at Cancel, whether a pen the band opened returns here, since the band's record act (VersionRow.jsx) is drawn only below 724.

    In the Correct focus return, replace the boolean was-open ref with a ref named amendOpenedByRef. It holds the opener of the open tasting or correct pen, or null. While openPen is 'amend', store amendOpener in it and return. Otherwise, read it and set it to null. Then focus amendButtonRef when that opener was 'correct', or when it was 'record-a-tasting' and below724 is false. Do the same in the Record focus return with a ref named recordOpenedByRef: store recordOpener while openPen is 'record'. At close, focus recordButtonRef when the opener was 'log', or when it was 'band' and below724 is false. Keep both effects' dependency arrays as [openPen]. The opener is latched when the pen opens. The width is the one at the render where the pen closed.

    Rewrite the two comments above these effects, which now say a band-opened pen always returns to the band. Each should say that the band takes the return below 724, where it draws its record act (VersionRow.jsx). From 724 up the band draws no record act, so this row's own opener for the same pen takes it: Correct opens the tasting pen on the same batch, and Record batch or Record another opens the new-record pen. This covers a pen opened below 724 before the window widened. It also covers one opened at a desk width with the band's opener, from Home's Record tasting or a restored tasting draft (bug-p12-focus-lost-across-724). Keep the file's voice.

    Change nothing else: no button, no condition on what is drawn, the landing effect, VersionRow.jsx, RecipePage.jsx or any word. The amend Save still lands on the Batch heading. The landing effect runs after the Correct return in the same commit, because the save sets mode and the landing attempt in one callback, so the heading wins. G2 pins this.

    Run RecipePage.recordTasting.test.jsx whole, then the gates in verify. Commit as `fix(261122-tql): Cancel on a band-opened pen returns to the log's opener from 724 up (bug-p12-focus-lost-across-724)`. Write it in English, with the same attribution lines as Task 1.
  </action>
  <verify>
    <automated>B="$(cat "${TMPDIR:-/tmp}/sprinkles-tql/BASE")" && npm --prefix app test -- src/ui/RecipePage.recordTasting.test.jsx src/ui/BatchRow src/ui/VersionRow src/ui/RecipePage.drafts.test.jsx && git diff --quiet "$B" -- app/src/ui/VersionRow.jsx app/src/ui/RecipePage.jsx app/src/ui/useBatchRecording.js app/src/ui/useRouteIntents.js app/src/ui/NotebookPlace.jsx && test "$(grep -v '^[[:space:]]*//' app/src/ui/BatchRow.jsx | grep -cE 'wasAmendingRef|wasRecordingRef')" -eq 0 && test "$(grep -v '^[[:space:]]*//' app/src/ui/BatchRow.jsx | grep -cE 'amendOpenedByRef|recordOpenedByRef')" -ge 6 && test "$(grep -n 'const below724 = useBelow724()' app/src/ui/BatchRow.jsx | cut -d: -f1)" -lt "$(grep -n 'const amendButtonRef = useRef(null)' app/src/ui/BatchRow.jsx | cut -d: -f1)"</automated>
    Baselines: the old boolean refs in BatchRow code lines [HEAD=8 EXPECT==0]; the two new refs in code lines [HEAD=0 EXPECT>=6] (declaration, store and read for each). The useBelow724() line must sit above the amendButtonRef line; at HEAD it is line 655 against 544, so the gate is red until the move. VersionRow, RecipePage, useBatchRecording, useRouteIntents and NotebookPlace must show no diff against BASE. GUARD MUTATION: editing any of them turns it red.
  </verify>
  <done>The four red cases now pass, and so does every existing case in the touched suites. BatchRow's two returns latch the opener and decide at Cancel from the current width. The useBelow724 read sits above them. VersionRow.jsx is unchanged. The fix commit is made.</done>
</task>

<task type="auto">
  <name>Task 3: Full suite, fixed build, the probe in both engines, scope gates and SUMMARY</name>
  <files>.planning/quick/261122-tql-bug-p12-focus-lost-across-724-cancel-leaves-nothing-focused/261122-tql-SUMMARY.md</files>
  <read_first>
    - ~/.claude/gsd-core/templates/summary.md
  </read_first>
  <action>
    Run `npm --prefix app test` and expect zero failures. The batch started at 136 files and 4538 tests. Siblings that landed before this item (261122-tqk at least) add their own cases, so state the count you see and where the difference comes from: this item adds six cases, plus one or two.

    Build the fixed app into scratch with `npm --prefix app run build -- --outDir "${TMPDIR:-/tmp}/sprinkles-tql/dist-fix" --emptyOutDir`. Run the probe against it in WebKit and in Chromium into fix-webkit.txt and fix-chromium.txt. Expect seven PASS lines and no FAIL line in each, exit 0. Leave app/dist and port 4173 alone, and start no other Vite process. Run the scope gates in verify against BASE.

    Write the SUMMARY. Record the following.
    - The red evidence: the four jsdom messages and both base probe files' lines. The green evidence: counts and both fixed probe files' lines, INFO lines included.
    - The decisions from the objective: the log's opener as the target, with Next version rejected and why; the choice made at Cancel from the current width; BatchRow.jsx alone. Also the Home-at-a-desk path found by reading and proved by W4.
    - The residual: an address naming no batch of the version, at 724 or more.
    - What remains of case one after 261122-tqk: no Cancel below 724, the round trip pinned by C2 or absent, the narrowing-with-focus drop that tqk brings (same shape as decide-p12-narrowing-closes-editor, not fixed here), and the two non-width paths seen by reading.
    - Whether the returned control sat inside the viewport in each engine, against desk-correct-control. Add no scrolling in this item. A difference goes into the SUMMARY for the orchestrator.
    - "Deferred Human Verification": one iPad Split View check for the orchestrator to put on Mark's List if it wants one. Write at most six numbered steps, each with an "Expect:" where it has one. Take its Expect from what the probe measured, including tab-after-cancel. If tab-after-cancel names no control a hand could recognise, write "none, not legible by hand" in its place.
    - The build is safe to deploy: no stored shape, DB_VERSION or wording changed.
    - The Mark's List row bug-p12-focus-lost-across-724 is for the orchestrator to close once the fix lands, with resolvedAt read from `date -u` and a one-line reply. The executor does not touch the list.
    Do not edit any file under app/ in this task.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-tql"; Q=.planning/quick/261122-tql-bug-p12-focus-lost-across-724-cancel-leaves-nothing-focused; B="$(cat "$S/BASE")" && npm --prefix app test && npm --prefix app run build -- --outDir "$S/dist-fix" --emptyOutDir && test -s "$S/dist-fix/index.html" && R="$(git rev-parse --show-toplevel)" && REPO="$R" PROBE_DIST="$S/dist-fix" node "$S/probe-tql.mjs" webkit > "$S/fix-webkit.txt" && REPO="$R" PROBE_DIST="$S/dist-fix" node "$S/probe-tql.mjs" chromium > "$S/fix-chromium.txt" && ALL="cut-record-batch desk-home-record-tasting narrow-control-band one-no-cancel-below-724 one-round-trip widen-record-batch widen-record-tasting " && test "$(grep '^PASS ' "$S/fix-webkit.txt" | awk '{print $2}' | sort | tr '\n' ' ')" = "$ALL" && test "$(grep '^PASS ' "$S/fix-chromium.txt" | awk '{print $2}' | sort | tr '\n' ' ')" = "$ALL" && git diff --quiet "$B" -- app/src/ui/VersionRow.jsx app/src/ui/NotebookPlace.jsx app/src/ui/RecipePage.jsx app/src/ui/useBatchRecording.js app/src/ui/useRouteIntents.js app/src/domain app/src/store app/src/styles app/dist && CH="$(git diff --name-only "$B" -- app)" && test "$(printf '%s\n' "$CH" | sort | tr '\n' ' ')" = "app/src/ui/BatchRow.jsx app/src/ui/NotebookPlace.test.jsx app/src/ui/RecipePage.recordTasting.test.jsx " && test -s "$Q/261122-tql-SUMMARY.md"</automated>
    Baselines: the fixed probe's PASS ids per engine must be all seven, and exit 0 means no FAIL line. Files changed under app/ against BASE must be exactly BatchRow.jsx, NotebookPlace.test.jsx and RecipePage.recordTasting.test.jsx (none at HEAD). The diffs compare BASE with the working tree on purpose, so committed and uncommitted changes both count. `git diff --quiet` over the protected paths turns red if any of them is edited.
  </verify>
  <done>The full suite passes with zero failures. The fixed build passes all seven probe lines in WebKit and in Chromium. Under app/ only BatchRow.jsx and the two test files changed. The SUMMARY records the red and green evidence, the decisions, the residual, what remains of case one, the deferred iPad check, and the list row for the orchestrator to close.</done>
</task>

</tasks>

<threat_model>
ASVS level 1; block on high. No external API, no schema change, no package install, no new input, no new word.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| window width to page state | The width can change while a pen is open (Split View, a dragged window). The focus return must not trust the width at open time. |
| probe to local build | The probe drives a scratch build on 127.0.0.1. It must never serve or write app/dist, which Mark's preview serves. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-tql-01 | Tampering | Scratch builds and the probe against app/dist | low | mitigate | Every build names an --outDir under ${TMPDIR:-/tmp}/sprinkles-tql. The probe carries 12-phone-probe.mjs's PROBE_DIST refusal block and only reads PROBE_DIST. Task 3's `git diff --quiet ... app/dist` gate fails on any change there. |
| T-tql-02 | Information disclosure | Probe network traffic | low | mitigate | The probe's context aborts every request whose host is not 127.0.0.1, as 12-band-probe.mjs does. It types only English values that are not a recipe Mark keeps. |
| T-tql-03 | Denial of service (focus stolen from a later landing) | BatchRow.jsx Correct return after an amend Save | low | mitigate | The landing effect runs after the Correct return in the same commit, so the Batch heading keeps focus. Guard G2 (Save at a desk width from Home's Record tasting) fails if the order ever flips. |
| T-tql-04 | Tampering (draft integrity) | Focus-return effects | low | accept | The effects only move focus. They read refs and props, write nothing to a draft or the store, and leave the opener stored in a kept draft unchanged. |
| T-tql-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs nothing. playwright-core is read from the existing npx cache through PLAYWRIGHT_CORE. If it is missing, the executor stops and installs nothing. |
</threat_model>

<verification>
- RED: at BASE, W1 to W4 fail on focus left on the body, and G1, G2, C1 (and C2 where it applies) pass. The probe on the base build fails exactly widen-record-batch, cut-record-batch, widen-record-tasting and desk-home-record-tasting, in WebKit and in Chromium.
- GREEN: the touched suites pass, then the full suite passes with zero failures. The probe on the fixed build passes all seven lines in both engines.
- Scope: under app/ only BatchRow.jsx, RecipePage.recordTasting.test.jsx and NotebookPlace.test.jsx change. VersionRow.jsx, RecipePage.jsx, useBatchRecording.js, useRouteIntents.js, NotebookPlace.jsx, domain, store, styles and app/dist are unchanged. No word on screen changes.
- Builds: both go to ${TMPDIR:-/tmp}/sprinkles-tql. Port 4173 and app/dist are untouched.
</verification>

<success_criteria>
- A pen opened from the band's Record batch, Record another or Record tasting below 724 and cancelled at 724 or more leaves focus on the log's Record batch, Record another or Correct.
- Home's Record tasting at a desk width, cancelled, leaves focus on Correct.
- Below 724, with or without a round trip across the cut, Cancel still returns to the band's record act, as built.
- The Notebook's entry Cancel is drawn only from 724 up (tqk). There it returns to New recipe, and this item pins that with guards and changes no Notebook code.
</success_criteria>

<output>
Create `.planning/quick/261122-tql-bug-p12-focus-lost-across-724-cancel-leaves-nothing-focused/261122-tql-SUMMARY.md` when done.
</output>
