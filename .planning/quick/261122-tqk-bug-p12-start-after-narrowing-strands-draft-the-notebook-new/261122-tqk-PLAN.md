---
phase: quick-261122-tqk
plan: 01
quick_id: 261122-tqk
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/NotebookPlace.test.jsx
  - .planning/quick/261122-tqk-bug-p12-start-after-narrowing-strands-draft-the-notebook-new/261122-tqk-SUMMARY.md
autonomous: true
requirements:
  - bug-p12-start-after-narrowing-strands-draft

must_haves:
  truths:
    - "Below 724 the Notebook draws neither New recipe nor the New recipe entry. If the entry is open when the window narrows below 724, it leaves the page: no Name field, no Cancel, no Start. Neither Start nor Return in the Name field can be pressed there, so no create draft is written and the address stays /notebook. Cases N1 and N2 cover this, and so do the probe's fix runs in WebKit at 393 and 723 and in Chromium at 393."
    - "The cut is 724. At 723 the entry is gone. At 724 it is drawn again holding the name typed before the narrowing, with New recipe still hidden while it is open. Start there writes one create draft with that name and opens the editor at /notebook/new. Case N2 and the WebKit 723-to-724 probe run cover this."
    - "A Notebook opened below 724 shows no New recipe and no entry. Widening it to 1024 offers New recipe, and pressing it opens the entry with focus in Name. Case N3 covers this, and it passes both before and after the fix, which proves the width stub works."
    - "At 724 and wider, with no crossing, the entry works as it does today. Every NotebookPlace test that exists at HEAD passes unchanged."
    - "Nothing else changes. In NotebookPlace.jsx the only changed code line is the entry form's render condition. handleStart, NotebookHead's focus effect and handleCancel, NotebookList and NotebookDraftRow are untouched. DeskOnly.jsx, Placeholder.jsx, RecipeList.jsx, useBelowDesktop.js, app/src/store, app/src/domain, app/src/styles and app/dist are unchanged. No on-screen words change."
  artifacts:
    - path: app/src/ui/NotebookPlace.jsx
      provides: "NotebookHead draws the entry form only when !below724, as well as when no draft is kept and the entry is open. This is the same width test its New recipe button carries. The NotebookHead comment now says the entry is not drawn below 724."
      contains: "{!below724 && !draft && open && ("
    - path: app/src/ui/NotebookPlace.test.jsx
      provides: "A describe named for bug-p12-start-after-narrowing-strands-draft, nested in 'NotebookPlace starting a recipe'. It uses a mutable-width window.matchMedia stub and holds cases N1 and N2 (red at HEAD) and N3 (control)."
      contains: "bug-p12-start-after-narrowing-strands-draft"
  key_links:
    - from: app/src/ui/NotebookPlace.jsx
      to: app/src/ui/useBelowDesktop.js
      via: "NotebookPlace reads useBelow724() and passes below724 to NotebookList, which passes it to NotebookHead. The entry form's condition now reads below724, as the New recipe button's condition already does."
      pattern: "!below724 && !draft && open"
    - from: app/src/ui/NotebookPlace.test.jsx
      to: app/src/ui/useBelowDesktop.js
      via: "A window.matchMedia stub, installed before mount, answers the max-width query from a mutable width, and setWidth fires its change listeners inside act. This is the model in CreationFlow.test.jsx lines 2458-2503."
      pattern: "bug-p12-start-after-narrowing-strands-draft"
---

<objective>
Close bug-p12-start-after-narrowing-strands-draft (state machine audit 2026-11-22, item 1).

The defect: the Notebook's New recipe entry (a Name field, Cancel and Start) stays open when the window narrows below 724. Start then writes a create draft and moves to /notebook/new. DeskOnly shows the one-line desk page there ("Done at the desk or on the iPad."), with no control on it. Back on the Notebook at that width, the draft row has no Resume.

Mark decided the editor is a desk job (decide-p12-narrowing-closes-editor: leave as built). So the entry follows the same width rule as its own New recipe button, and is not offered below 724.

The fix is one render condition. NotebookHead draws the entry form only when it is not below 724, as it already does for New recipe (NotebookPlace.jsx line 230 against line 236, HEAD b06add6f).

Purpose: Start can no longer be pressed at a width where the editor cannot open, so no draft is stranded.
Output: one changed code line and one rewritten comment sentence in NotebookPlace.jsx. Three jsdom cases in NotebookPlace.test.jsx. A browser reproduction in Playwright WebKit and Chromium against two scratch builds (before and after). A SUMMARY.

Decisions taken in this plan (Claude's discretion, inside the row's answer):
- The entry is hidden, not closed. Narrowing leaves NotebookHead's own state alone (open, name, required), so widening to 724 or more draws the entry again with what was typed. This is the literal "same width rule as its New recipe button": hidden below 724, drawn from 724 up. It is also how the editor's own addresses cross the cut (sketch 016 CONTRACT section 5(c): nothing typed is lost, and it is there again when the window widens). Closing the entry on narrowing would need an effect and would throw away the typed name. Reversibility: reversible (one condition).
- handleStart (lines 126-153, including the navigate at 144-147) is left as it is. The row cites those lines as the place the defect lands, not as a second change. Once the entry is not drawn below 724, Start cannot be pressed there. The only remaining way in is a narrowing during the few milliseconds of the draft write. The audit puts that timing class out of reach by hand (items 6 and 30). No guard is added for it, per CLAUDE.md's "no error handling for impossible scenarios". The SUMMARY records this.
- Focus after the narrowing: if focus was in Name, it goes to the page body when the form leaves the page. That already happens to New recipe itself, and to the editor at the DeskOnly swap (decided leave as built). This plan does not move focus. Focus across 724 belongs to sibling 261122-tql. Its case one, Cancel on the narrowed entry, can no longer be reached after this fix: below 724 the entry's Cancel is not drawn, and from 724 up Cancel returns focus to New recipe, which is drawn there. The SUMMARY says so for tql.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

Line numbers are HEAD's at planning time (b06add6f). Read by range.
- app/src/ui/NotebookPlace.jsx: NotebookPlace and its refs (lines 26-55), handleStart and the NotebookList call (lines 120-174), NotebookHead with its comment (lines 176-269). The file is 355 lines.
- app/src/ui/NotebookPlace.test.jsx: imports and the repository mock (lines 1-25), the "NotebookPlace starting a recipe" harness (lines 463-551: Probe, the afterEach, mount, button, buttonTexts, nameField, press, open, type), the nested describe "New recipe Name as a one-row textarea" and the outer describe's close (lines 714-813), and the static PHONE-01 cases (lines 815-888).
- app/src/ui/CreationFlow.test.jsx lines 2454-2503: the mutable-width matchMedia model (evaluate, installWidth, setWidth). Read only.
- app/src/ui/useBelowDesktop.js lines 36-49 (useBelow724 reads matchMedia in its useState initializer and subscribes to 'change'). Read only.
- app/src/ui/DeskOnly.jsx (16 lines). Read only.
- .planning/state-machines/2026-11-22-audit.md: verdict row 1 (line 38) and "Item 1" (lines 71-83).
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs lines 1-80: the PROBE_DIST refusal and the playwright-core loading to copy. Read only.
- .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs: startServers({ appRoot }) from line 81, a static server on an ephemeral 127.0.0.1 port with an SPA fallback. Read only.
- Optional reference: the audit's own item-1 probe and helpers, /private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/c53b815f-c9c0-4392-9afe-1d608eb4dfd9/scratchpad/sma/p01.mjs and lib.mjs (read only, and they may have been cleared; everything Task 2 needs is written out there).
- Do not edit: handleStart, NotebookHead's focus effect and handleCancel (lines 192-207; sibling 261122-tql owns focus), NotebookList, NotebookDraftRow, DeskOnly.jsx, Placeholder.jsx, RecipeList.jsx, CreationPage.jsx, IngredientTable.jsx, Method.jsx, VersionRow.jsx, useBelowDesktop.js, app/src/store, app/src/domain, app/src/styles, the phase 12 probe scripts, sketch 016 and its CONTRACT, and app/dist. Leave port 4173 alone and start no Vite process (a build is not a server).
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Base build, failing jsdom cases for an entry open across 724, then the entry follows New recipe's width rule</name>
  <files>app/src/ui/NotebookPlace.test.jsx, app/src/ui/NotebookPlace.jsx</files>
  <read_first>
    - app/src/ui/NotebookPlace.jsx (lines 26-55, 120-269)
    - app/src/ui/NotebookPlace.test.jsx (lines 1-25, 463-551, 714-888)
    - app/src/ui/CreationFlow.test.jsx (lines 2454-2503)
    - app/src/ui/useBelowDesktop.js (lines 36-49)
  </read_first>
  <behavior>
    Add a describe nested inside "NotebookPlace starting a recipe". Put it after "New recipe Name as a one-row textarea" closes (line 811) and before the outer describe closes (line 813). Name it "an entry open as the window crosses 724 (bug-p12-start-after-narrowing-strands-draft)". It reuses the outer harness: mount, press, open, type, button, buttonTexts, nameField and path. It adds its own width stub, described in the action.
    - N1, red at HEAD. installWidth(1024). Set repository.saveDraft to vi.fn().mockResolvedValue(undefined). Mount, press New recipe, and type 'Pistachio'. Expect the Name field's value to be 'Pistachio'. Call setWidth(393). Expect all of these: container.querySelector('form.nb__new') is null; container has no textarea; buttonTexts(container) equals [] (no New recipe, Cancel or Start); div.nb__head has exactly one child (the title); repository.saveDraft was not called; path is '/notebook'. At HEAD the case fails on the first expectation, because the form is still drawn.
    - N2, red at HEAD. installWidth(1024). saveDraft resolves as in N1. Mount, open, type 'Pistachio'. Call setWidth(723) and expect form.nb__new to be null. Call setWidth(724). Expect form.nb__new to be present, the Name field's value to be 'Pistachio', and buttonTexts(container) to equal ['Cancel', 'Start'] (New recipe stays hidden while the entry is open). Press Start. Expect saveDraft to have been called once, mock.calls[0][0].payload.name to be 'Pistachio', and path to be '/notebook/new'. At HEAD the case fails on the 723 null expectation.
    - N3, the control; passes at HEAD and after the fix. installWidth(393). Mount. Expect form.nb__new to be null and buttonTexts(container) to equal []. Call setWidth(1024). Expect buttonTexts(container) to equal ['New recipe']. Press New recipe. Expect form.nb__new to be present and document.activeElement to be nameField(container). This proves the stub drives useBelow724, both at mount and on a change. So N1 and N2 can only be red because of the defect.
  </behavior>
  <action>
    First record the base and build it, before any edit. Create the directory "${TMPDIR:-/tmp}/sprinkles-tqk" (called S below). Write `git rev-parse HEAD` into S/BASE. Run `npm --prefix app run build -- --outDir "$S/dist-base" --emptyOutDir`. Task 2 reproduces the defect against this build, and Task 3's scope gates diff against BASE. Never build into app/dist.

    RED. In the new describe, declare width, lists and originalMatchMedia. Copy evaluate(query), installWidth(initialWidth) and setWidth(next) from CreationFlow.test.jsx lines 2458-2503, with two changes. Leave out the scrollIntoView stub. setWidth awaits act around the listener calls and calls no flush helper. installWidth saves window.matchMedia into originalMatchMedia before it replaces it. Add an afterEach in the nested describe that sets window.matchMedia back to originalMatchMedia. jsdom has no matchMedia, so the saved value is undefined and every other case in the file keeps the desk arrangement. Each case calls installWidth before mount(), because useBelow724 reads matchMedia in its useState initializer. Write N1, N2 and N3 exactly as in the behavior block. Add no helper beyond these three, and name the cases in plain English.

    Run `npm --prefix app test -- src/ui/NotebookPlace.test.jsx -t "bug-p12-start-after-narrowing-strands-draft"` against the unchanged NotebookPlace.jsx. The expected result is exactly two failures, N1 and N2. Each must fail on its form.nb__new null expectation, with a form element received. N3 must pass. Copy the two assertion messages into the SUMMARY as red evidence. STOP AND REPORT, and do not bend a test to force red, if any of these happens: N1 or N2 fails for another reason; N1 or N2 passes at HEAD; N3 fails at HEAD.

    GREEN, per Mark's answer on the row and decide-p12-narrowing-closes-editor. In NotebookHead, the entry form's render condition is on line 236. Put `!below724 && ` at its front, so the line reads `{!below724 && !draft && open && (`. That is the same width test the New recipe button's condition on line 230 carries. Change no other code line. The state (open, name, required) stays as it is, so the entry is hidden below 724 and drawn again from 724 up with what was typed (see the objective). Do not add an effect, a ref or a guard in handleStart. Do not touch the focus effect or handleCancel.

    Comment. In the comment above NotebookHead, replace its last sentence. It begins "Below 724 New" on line 180 and runs to the end of line 182. The new sentences: "Below 724 neither New recipe nor the entry is drawn (PHONE-01, bug-p12-start-after-narrowing-strands-draft): starting a recipe is a desk job, as the editor is (DeskOnly.jsx). An entry open as the window narrows leaves the page with what was typed kept, and is drawn again from 724 up." Change no other comment.

    Run NotebookPlace.test.jsx whole, then the gates in verify. Commit the two files as `fix(261122-tqk): the Notebook's New recipe entry is not drawn below 724, so Start cannot strand a draft (bug-p12-start-after-narrowing-strands-draft)`. Write the message in English. End it with the attribution lines your session's system reminder gives. At planning time those were "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" and "Claude-Session: https://claude.ai/code/session_01VWwTRSNw8tGVgeHqypcMwH".
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-tqk" && npm --prefix app test -- src/ui/NotebookPlace.test.jsx && test "$(grep -c 'bug-p12-start-after-narrowing-strands-draft' app/src/ui/NotebookPlace.test.jsx)" -ge 1 && test "$(grep -vE '^[[:space:]]*//' app/src/ui/NotebookPlace.jsx | grep -cF '{!below724 && !draft && open && (')" -ge 1 && test "$(grep -c 'from under the maker' app/src/ui/NotebookPlace.jsx)" -eq 0 && test -s "$S/BASE" && test -s "$S/dist-base/index.html"</automated>
    Baselines, measured at b06add6f. Slug in NotebookPlace.test.jsx [HEAD=0 EXPECT>=1]. The entry's new condition outside comments [HEAD=0 EXPECT>=1]. The old comment's phrase "from under the maker" [HEAD=1 EXPECT==0]. S/BASE [HEAD=absent EXPECT==present]. S/dist-base/index.html [HEAD=absent EXPECT==present]. Task 3's diff gate proves that the new condition is the only changed code line, and that New recipe's own condition on line 230 is untouched.
  </verify>
  <done>Before the fix, N1 and N2 failed on their form.nb__new null expectations and N3 passed, all recorded. After it, all three pass and NotebookPlace.test.jsx passes whole. The entry's condition carries !below724 and nothing else in the code changed. The base build exists in scratch. The fix commit is made.</done>
</task>

<task type="auto">
  <name>Task 2: Reproduce in Playwright WebKit and Chromium against the base build, then show it gone against the fixed build</name>
  <files>${TMPDIR:-/tmp}/sprinkles-tqk/probe-tqk.mjs, ${TMPDIR:-/tmp}/sprinkles-tqk/dist-fix/, ${TMPDIR:-/tmp}/sprinkles-tqk/out-*.txt (scratch only; no repo file)</files>
  <precondition>playwright-core 1.63.0 is at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs, Playwright WebKit is in ~/Library/Caches/ms-playwright (webkit-2359), and Google Chrome is in /Applications (Chromium runs through channel 'chrome', because no Playwright Chromium is cached). If any is missing, stop and report.</precondition>
  <read_first>
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs (lines 1-80)
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs (lines 60-97)
    - .planning/state-machines/2026-11-22-audit.md (lines 38, 71-83)
  </read_first>
  <action>
    Build the fixed tree into scratch: `npm --prefix app run build -- --outDir "$S/dist-fix" --emptyOutDir`, with S as in Task 1.

    Write the probe with the Write tool at S/probe-tqk.mjs. It goes in scratch, never in the repo. Its arguments are engine (webkit or chromium), mode (base or fix), the narrow width, and in fix mode the widen width. It reads PROBE_DIST and REPO from the environment.
    - Guard. Copy the PROBE_DIST checks from 12-phone-probe.mjs lines 44-59: refuse an unset PROBE_DIST, and any PROBE_DIST that resolves to or ends in app/dist, with a FAIL line and exit 1, before anything is served. Then require index.html in it.
    - Imports. Load playwright-core from PLAYWRIGHT_CORE, defaulting to the npx cache path in the precondition. Load startServers by dynamic import of the file URL of REPO joined with .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs.
    - Browser. Start the server with appRoot set to PROBE_DIST. That is an ephemeral 127.0.0.1 port, never 4173. Launch webkit.launch(), or chromium.launch({ channel: 'chrome', headless: true }). Open one context at 1024 x 900 with hasTouch: true, and abort every request whose host is not 127.0.0.1. The fresh context seeds its own IndexedDB on first load. Close the context, the browser and the server in a finally block.
    - Helpers, as in the audit's lib.mjs. A clickUntil that clicks again until a selector appears (the first click on a fresh route can miss). A drafts dump that opens IndexedDB 'sprinkles' and reads every row of the 'drafts' store. The focused element, in words (BODY for document.body).
    - Common start. Visit /notebook and wait for .nb__head. clickUntil the head's .notebook-action until .nb__new textarea appears. Fill it with 'Pistachio'. Require that no draft of kind 'create' is stored yet. Call page.setViewportSize to the narrow width, with height 852, and wait 400 ms.
    - Base mode: the defect, as the audit's item 1 reads it. Print PASS lines for these, and a FAIL for each one not seen. The .nb__new textarea count is 1 after the narrowing. Press the button in .nb__new-actions whose text is exactly Start, and wait for the path /notebook/new. .shell__main's text contains "Done at the desk or on the iPad.", and .shell__main holds no button, textarea or input. Exactly one create draft is stored, with payload.name 'Pistachio'. Then visit /notebook at the same width: .nb__draft contains 'Pistachio' and holds no button.
    - Fix mode: PASS or FAIL for each of these. After the narrowing, the counts of .nb__new, .nb__new textarea and .nb__head .notebook-action are all 0. No button whose text is Start is in .shell__main. The path is /notebook. Still no create draft is stored. Print an INFO line with the focused element; it is expected to be BODY, and is recorded for sibling 261122-tql, not judged. Then call setViewportSize to the widen width and wait 400 ms. The .nb__new textarea's value is 'Pistachio', and .nb__head .notebook-action's count is 0. Press Start and wait for the field [aria-label="Recipe name"]. The path is /notebook/new, that field's value is 'Pistachio', and exactly one create draft is stored with that name. Press the editor's Cancel (.notebook-ceremony__actions .notebook-action--outline) and wait for the path /notebook. The page shows "Draft discarded.", the head's .notebook-action reads New recipe, and no create draft is stored. Fix mode walks the device steps written in Task 3, steps 2 to 7.
    - Print one line per check, beginning PASS, FAIL or INFO, each naming the engine and widths. Exit 1 on any FAIL. Everything typed is English, and not a recipe Mark keeps.

    Run these from the repo root with REPO set to `$(git rev-parse --show-toplevel)`. Write each run's output (stdout and stderr) to its own file in S:
    - out-base-webkit-393.txt: PROBE_DIST=$S/dist-base, webkit base 393.
    - out-base-chromium-393.txt: PROBE_DIST=$S/dist-base, chromium base 393.
    - out-fix-webkit-393.txt: PROBE_DIST=$S/dist-fix, webkit fix 393 1024.
    - out-fix-webkit-723.txt: PROBE_DIST=$S/dist-fix, webkit fix 723 724 (the exact cut).
    - out-fix-chromium-393.txt: PROBE_DIST=$S/dist-fix, chromium fix 393 1024.
    - out-refuse.txt: PROBE_DIST set to the repo's app/dist path, webkit fix 393 1024. It must exit non-zero with the app/dist FAIL line before serving anything.

    If a base run does not reproduce the defect, or a fix run fails, STOP AND REPORT with the output. Do not adjust the probe until it passes. Every reading is Playwright on a Mac, not a device. Do not edit any file under app/ in this task.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-tqk" && test -s "$S/dist-fix/index.html" && test -s "$S/probe-tqk.mjs" && for f in base-webkit-393 base-chromium-393 fix-webkit-393 fix-webkit-723 fix-chromium-393; do { test -s "$S/out-$f.txt" && grep -q '^PASS' "$S/out-$f.txt" && ! grep -q '^FAIL' "$S/out-$f.txt"; } || exit 1; done && grep -q '^FAIL.*app/dist' "$S/out-refuse.txt" && test -z "$(git status --porcelain -- app)"</automated>
    Baselines. Each of the five out files, holding a PASS line and no FAIL line [HEAD=absent EXPECT==present]. The refusal run's FAIL line naming app/dist [HEAD=absent EXPECT==present]. Modified or untracked paths under app after Task 1's commit [HEAD=0 EXPECT==0 GUARD MUTATION: writing the probe or a build under app/ turns it red]. Against dist-base, the fix-mode checks fail on the .nb__new count, which is why the base runs prove the reproduction.
  </verify>
  <done>WebKit and Chromium both reproduce the defect against the base build: the entry outlives the narrowing, Start lands on the desk line, and a create draft with no Resume is left. Against the fixed build at 393 (WebKit, Chromium) and 723 (WebKit), the entry leaves the page on narrowing and writes nothing. It comes back with Pistachio on widening, Start opens the editor, and Cancel discards the draft. The probe refuses app/dist. Nothing in the repo changed.</done>
</task>

<task type="auto">
  <name>Task 3: Full suite, scope gates and SUMMARY</name>
  <files>.planning/quick/261122-tqk-bug-p12-start-after-narrowing-strands-draft-the-notebook-new/261122-tqk-SUMMARY.md</files>
  <read_first>
    - ~/.claude/gsd-core/templates/summary.md
  </read_first>
  <action>
    Run the full suite with `npm --prefix app test`. Before this batch it was 136 files and 4538 tests. Expect 136 files and 4541 tests (the three new cases) with zero failures. If the count differs, for example because sibling work is in this tree, say why in the SUMMARY.

    Run the scope gates in verify against S/BASE.

    Write the SUMMARY. It records:
    - The red evidence: the assertion messages of N1 and N2. The green counts.
    - The probe readings: one line per run of the five, plus the refusal. Name the engines and widths. Say plainly that nothing is device-verified.
    - The decisions from the objective. The entry is hidden, not closed, and keeps what was typed for the return from 724 up. handleStart is unchanged, and why. Focus goes to the page body when the entry leaves at the narrowing, as it does for New recipe and at the DeskOnly swap.
    - A note for sibling 261122-tql: its case one, Cancel on the narrowed entry, can no longer be reached. Below 724 the entry's Cancel is not drawn, and from 724 up Cancel returns focus to New recipe, which is drawn there. The INFO focus lines from the fix runs go with this note.
    - "Deferred Human Verification", for the orchestrator to put on Mark's List with the batch or drop. It is one check row, titled "The New recipe entry leaves the Notebook in Split View and comes back with the name". It serves the build as CLAUDE.md says, after Mark has deployed main. Write each step as its own numbered line, with an "Expect:" where the step has a result:
      1. On the iPad in landscape, open Sprinkles in Safari full screen, on the Notebook.
      2. Tap New recipe. Expect: the Name field opens.
      3. Type Pistachio.
      4. Open another app beside Safari in Split View, so Safari takes the smaller part. Expect: the Name field, Cancel and Start are gone, and there is no New recipe.
      5. Drag the divider to give Safari the whole screen again. Expect: the Name field is back, holding Pistachio.
      6. Tap Start. Expect: the editor opens, with Recipe name Pistachio.
      7. Tap Cancel. Expect: the Notebook, with "Draft discarded." and New recipe.
      The pass rule goes after the last step, unnumbered: every Expect holds.
    - The build is safe to deploy: no stored shape, DB_VERSION or wording changed.
    - The Mark's List row bug-p12-start-after-narrowing-strands-draft is for the orchestrator to close once the fix commit lands, with resolvedAt read from `date -u` and a one-line reply. The executor has no ArtifactData and does not touch the list.

    Do not edit any file under app/ in this task.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-tqk" && npm --prefix app test && B="$(cat "$S/BASE")" && N="$(git diff --name-only "$B" -- app)" && test "$(printf '%s\n' "$N" | grep -vxE 'app/src/ui/NotebookPlace(\.test)?\.jsx' | grep -c .)" -eq 0 && U="$(git ls-files --others --exclude-standard -- app)" && test -z "$U" && D="$(git diff -U0 "$B" -- app/src/ui/NotebookPlace.jsx)" && test "$(printf '%s\n' "$D" | grep '^+' | grep -cF '{!below724 && !draft && open && (')" -ge 1 && test "$(printf '%s\n' "$D" | grep -E '^[-+]' | grep -vE '^(\+\+\+|---)' | grep -vE '^[-+][[:space:]]*//' | grep -vE '^[-+][[:space:]]*$' | grep -vE '^\+[[:space:]]*\{!below724 && !draft && open && \($' | grep -vE '^-[[:space:]]*\{!draft && open && \($' | grep -c .)" -eq 0 && test -s .planning/quick/261122-tqk-bug-p12-start-after-narrowing-strands-draft-the-notebook-new/261122-tqk-SUMMARY.md</automated>
    Baselines. The added condition in NotebookPlace.jsx's diff against BASE [HEAD=0 EXPECT>=1]. Any other changed code line in that diff, outside comments and blanks [HEAD=0 EXPECT==0 GUARD MUTATION: an added effect, ref or handleStart guard, or an edit to New recipe's condition on line 230, turns it red]. Files changed under app against BASE other than NotebookPlace.jsx and its test [HEAD=0 EXPECT==0 GUARD MUTATION: an edit to DeskOnly.jsx or useBelowDesktop.js turns it red]. Untracked files under app [HEAD=0 EXPECT==0 GUARD MUTATION: a probe or build left under app/ turns it red]. The SUMMARY [HEAD=absent EXPECT==present].
  </verify>
  <done>The full suite passes with zero failures. Under app, only NotebookPlace.jsx and NotebookPlace.test.jsx changed, and NotebookPlace.jsx's code diff is the one condition line. The SUMMARY records the red evidence, the browser readings, the decisions, the note for tql, the deferred iPad check with numbered steps, the deploy safety and the row for the orchestrator to close.</done>
</task>

</tasks>

<threat_model>
ASVS level 1; block on high. No external API, no schema change, no package install.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| window width to render | The 724 media query flips while the maker is mid-entry (iPad Split View, Slide Over, a dragged desktop window). The page must not offer a job the next page cannot do. |
| maker input to the drafts store | Start writes a create draft from the typed name through the repository seam. |
| probe to the local machine | The browser probe serves a build and drives two engines on Mark's Mac, next to his own preview on port 4173 and app/dist. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-tqk-01 | Tampering (integrity of stored work) | NotebookHead entry render condition, NotebookPlace.jsx line 236 | medium | mitigate | The entry form is drawn only when !below724, so Start cannot write a create draft at a width where the editor cannot open. N1 pins saveDraft not called and the path unchanged. The probe's fix runs show no create draft after the narrowing in WebKit and Chromium. |
| T-tqk-02 | Denial of service (typed work lost) | NotebookHead state across the cut | low | mitigate | open, name and required are left alone, so the entry returns from 724 up with the typed name. N2 and the WebKit 723-to-724 run pin it. |
| T-tqk-03 | Tampering (Mark's served build) | S/probe-tqk.mjs | medium | mitigate | The probe refuses a PROBE_DIST that resolves to app/dist before serving (out-refuse.txt pins it). It serves on an ephemeral 127.0.0.1 port, never 4173. It aborts every other host and starts no Vite process. Both builds go to scratch outDirs. |
| T-tqk-04 | Information disclosure | the entry's Name and the draft row | low | accept | No rendering path changes. The name stays a React text child, as the existing angle-bracket cases pin. |
| T-tqk-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package. playwright-core is already in the npx cache, and the probe only loads it. |
</threat_model>

<verification>
- RED: before the fix, N1 and N2 fail on their form.nb__new null expectations and N3 passes.
- GREEN: NotebookPlace.test.jsx passes whole, then the full suite passes with zero failures (136 files, 4541 tests expected).
- Browser: the defect reproduces against dist-base in WebKit and Chromium at 393. It is gone against dist-fix in WebKit at 393 and 723 and in Chromium at 393. The entry returns with the typed name on widening, and Start opens the editor. The probe refuses app/dist. Nothing is device-verified.
- Scope: under app, only NotebookPlace.jsx and its test changed against BASE. NotebookPlace.jsx's code diff is one condition line. app/dist and port 4173 are untouched.
</verification>

<success_criteria>
- Below 724 the Notebook offers neither New recipe nor its entry, so Start can no longer land the maker on the desk line with a stranded draft.
- An entry open as the window narrows is drawn again from 724 up, holding what was typed.
- At the desk with no crossing, the entry works exactly as today.
- No wording, stored shape, store call, focus rule or style changes.
</success_criteria>

<output>
Create `.planning/quick/261122-tqk-bug-p12-start-after-narrowing-strands-draft-the-notebook-new/261122-tqk-SUMMARY.md` when done.
</output>
