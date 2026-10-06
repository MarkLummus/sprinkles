---
phase: quick-261005-wgz
plan: 01
quick_id: 261005-wgz
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/tokens.css
  - app/src/styles/tokens.test.js
  - app/src/ui/BatchRow.jsx
  - app/src/styles/app.css
  - app/src/ui/BatchRow.test.jsx
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs
  - .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-SUMMARY.md
autonomous: true
requirements: [UX1-01, OBS1-01]

# Prohibited (do not touch, do not stage): .planning/STATE.md, DESIGN.md, PRODUCT.md, .impeccable/** (Sid
# updates DESIGN.md and its sidecar afterwards; until then tokens.css and DESIGN.md disagree on two hexes
# and one weight, and that is expected), .planning/sketches/**, .planning/canvas-generators/**, CLAUDE.md,
# .claude/CLAUDE.md, .planning/phases/** (the 03.5 probe harness is imported read only), app/src/domain/**,
# app/src/store/**, and every file under app/ other than the eight named in files_modified.

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "D-01 (Mark, 2026-10-05, Mark's List row decide-companion-contrast-under-4-5: 'fix it with a 1 step darken'): the two approved text colours that measured just under 4.5:1 on --app-background, --app-blue-text (#1576DE, 4.489:1) and --app-notebook-text (#EE0803, 4.495:1), each become the approved hex less the smallest step that clears 4.5:1, computed by the WCAG relative-luminance formula and never guessed. The white label on the blue fill is --app-background on --app-blue-text, the same ratio, so it clears with it. The planner computed one step per channel as enough: #1475dd at 4.547:1 and #ed0702 at 4.534:1; the test, not this sentence, is authoritative."
    - "D-01: the other three companions (--app-recipe-book-text #bc5b0d at 4.525:1, --app-idea-log-text #976f01 at 4.575:1, --app-ingredients-text #358452 at 4.591:1) already pass and stay byte-identical. --app-blue, --app-notebook and every other token stay as they are."
    - "D-01: every consumer of the two colours already reads through the token (home.css, shell.css and notebook.css carry no literal), so changing the two declarations in tokens.css moves the Home filled action and its label, the Notebook filled and outline actions, the pen's picked controls and Save, the rail and tab row's Home and Notebook words, and the Home row's place names together."
    - "D-02 (Mark, 2026-10-05, Mark's List row decide-tasting-note-in-the-hand and todo arrebtzlmiqhd8mq9haq: 'the How did it turn out? field should be in the hand and is in the pen'): the saved free-text tasting note in the read view renders with the .app-hand role, exactly as a saved Why (.version-row__reason app-hand), Next time (span.app-hand) and the tasting's problems (app-hand tasting-reading__problems) do: the class prose-text leaves the element, its own modifier class tasting-reading__note stays, and no rule on that modifier sets a face, size, leading or colour of its own, so the hand role reaches it."
    - "D-02: the hand is for display, not entry (DESIGN.md Hand Rule, sketch 011 decision 17). The recording form is a different branch of BatchRow.jsx from the reading: the pen's textarea (aria-label 'How did it turn out?', class prose-field) is untouched and keeps the prose-field role; only TastingReading's one paragraph changes."
    - "D-02: measured on the built app in WebKit and Chromium at 1600, 1366 and 393 wide, the saved note's computed font-family starts with Caveat and equals that of a reference .app-hand element, its size, leading, colour and style equal the reference's, and the pen's textarea does not read Caveat. Before the fix the same cases read the grotesk (the log restyles .prose-text to --face-grotesk)."
    - "D-03 (Mark, 2026-10-05, Mark's List row decide-filled-action-weight): the Notebook's filled action .notebook-action (Save as a new version, Save, Record a batch, Next version) declares font-weight 600, the weight Home's filled action .home__action already declares, so the filled action is 600 on both. The number is stated as every other weight in the stylesheets is: a bare numeric font-weight in the rule (no weight token exists in tokens.css, and none is added); notebook.test.js pins the two rules equal so they cannot drift."
    - "Test first in every task, one commit per task, each commit staged by explicit path. npm --prefix app test passes in full and npm --prefix app run build exits 0 after the last task."
  artifacts:
    - path: app/src/styles/tokens.css
      provides: "--app-blue-text and --app-notebook-text one step darker, each clearing 4.5:1 on --app-background"
      contains: "--app-blue-text:"
    - path: app/src/styles/tokens.test.js
      provides: "a computed WCAG ratio test over the five text companions, a one-step-per-channel guard, a guard that the other three are unchanged, and a guard that no stylesheet or ui source carries a literal for the two colours"
      contains: "261005-wgz"
    - path: app/src/ui/BatchRow.jsx
      provides: "the saved tasting note paragraph reads app-hand tasting-reading__note"
      contains: "app-hand tasting-reading__note"
    - path: app/src/styles/app.css
      provides: "the .tasting-reading__note rule keeps a long word wrapping, as .version-row__reason does, now that prose-text no longer supplies it"
      contains: "tasting-reading__note"
    - path: app/src/styles/notebook.css
      provides: "the .notebook-action rule at weight 600"
      contains: "notebook-action"
    - path: .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs
      provides: "computed font-family of the saved tasting note against a reference .app-hand, and computed filled-action weights, in WebKit and Chromium on the built app"
      contains: "261005-wgz"
  key_links:
    - from: "app/src/ui/BatchRow.jsx TastingReading note paragraph"
      to: "app/src/styles/app.css .app-hand (face, size, leading, colour) and .tasting-reading__note (max-width, margin, overflow-wrap)"
      via: "the .app-hand class; no rule names .tasting-reading__note and sets font-family, font-size, line-height or color, in app.css or notebook.css"
      pattern: "app-hand tasting-reading__note"
    - from: "app/src/styles/notebook.css .notebook-action"
      to: "app/src/styles/home.css .home__action"
      via: "equal font-weight 600, pinned by notebook.test.js"
      pattern: "font-weight: 600"
    - from: "app/src/styles/tokens.css --app-blue-text and --app-notebook-text"
      to: "home.css, shell.css, notebook.css var() reads"
      via: "custom property; no literal copy of either colour anywhere else under app/src"
      pattern: "var\\(--app-(blue|notebook)-text\\)"
---

<objective>
Three fixes Mark decided on 2026-10-05, one task and one commit each, test first in each:

1. Contrast, one step darker (D-01). --app-blue-text and --app-notebook-text each measure just under 4.5:1 on the app background. Darken each by the smallest step that clears 4.5:1.
2. The saved tasting note in the hand (D-02). The read view's note renders as .prose-text, which the log restyles to the grotesk. It must show in the hand like Why and Next time, while the pen's input keeps the prose-field role.
3. Filled action weight 600 everywhere (D-03). Home's is 600 and the Notebook's is 700. Make the Notebook's 600.

Purpose: WCAG 2.2 AA text contrast (UX1-01) holds for every text companion, the maker's own words read in the maker's hand (OBS1-01, the Hand Rule), and the one filled action is one weight.
Output: two token declarations, one class swap plus one declaration, one weight, four test edits, one browser probe measured in WebKit and Chromium, and a SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Facts the planner read at HEAD 4e20f11 (do not re-derive; re-read the lines named before editing, since line numbers move):

Contrast (D-01):
- app/src/styles/tokens.css lines 306 to 318 hold the App palette. Line 307 is --app-notebook-text: #ee0803, line 317 is --app-blue-text: #1576de, line 318 is --app-background: #ffffff. Lines 298 to 305 are the comment above the palette. The other companions: --app-recipe-book-text #bc5b0d (line 309), --app-idea-log-text #976f01 (line 311), --app-ingredients-text #358452 (line 314). Kitchen (--app-kitchen #505db5) needs no companion and is not part of this task.
- The planner computed the WCAG 2 relative luminance (channel c/255, linear when c <= 0.03928 else ((c + 0.055) / 1.055) ^ 2.4; L = 0.2126 R + 0.7152 G + 0.0722 B; ratio = (Lhigh + 0.05) / (Llow + 0.05)) against #ffffff: #1576de 4.4891, #1475dd 4.5471, #ee0803 4.4954, #ed0702 4.5335, #bc5b0d 4.5254, #976f01 4.5751, #358452 4.5914. One hex step off every channel is the smallest uniform step that clears 4.5 for both colours. Re-compute in the test; do not copy these numbers.
- Consumers read through the tokens: --app-blue-text in home.css (.home__action fill and border, .home__action--secondary), notebook.css (.notebook-action fill and border, .notebook-action--outline, .notebook-link, the pen's picked controls and the .save-ceremony Save fill) and shell.css (.shell__place--home); --app-notebook-text in home.css (the place names) and shell.css (.shell__place--notebook). A grep over app/src and app/tests for the old hexes and their rgb forms finds only the two tokens.css declarations; no test pins them. Re-grep to confirm before editing.
- tokens.test.js already builds cssSourceFiles (tokens.css, app.css, home.css, shell.css, notebook.css) and jsFiles (every .js and .jsx under app/src/ui and app/src/domain) at lines 43 to 55, and imports readCustomProperties from css-source.js. It runs under Vitest's node environment.
- Not part of this task and left alone: on the subtle surface (--app-surface-subtle, the current rail place, shell.css) every companion reads about 4.1:1, a pairing Mark's decision did not name. The SUMMARY reports it; nothing changes.

Tasting note (D-02):
- app/src/ui/BatchRow.jsx function TastingReading starts near line 254. Line 341 is the one paragraph: it carries the classes prose-text and tasting-reading__note. The other maker's words in this file already use the hand: line 280 (span, app-hand tasting-reading__problems), lines 1110 and 1112 (p, batch-row__note app-hand), line 1133 (Next time, span app-hand). VersionRow.jsx line 366 gives a saved Why 'version-row__reason app-hand'.
- The pen's textarea is at about line 881 in the recording branch of the same file: class prose-field (plus prose-field--empty when blank), aria-label 'How did it turn out?'. It is not part of TastingReading and must not change.
- app/src/styles/app.css line 403: .app-hand sets font-family var(--face-hand), font-size max(var(--size-hand), var(--size-hand-min)), line-height var(--leading-hand), color var(--sheet-pen-blue). Lines 1456 to 1461: .prose-text sets the text face, the note leading, pen blue and overflow-wrap anywhere. Lines 1542 to 1545: .tasting-reading__note sets max-width var(--measure-prose) and margin var(--gap-m) 0 0, nothing else. Lines 629 to 645: the Why rule keeps margin-inline-start 0 and overflow-wrap anywhere and sets no face, size, leading or colour, so the hand role reaches it; cross-cutting.test.js has a test for exactly that near line 1005.
- app/src/styles/notebook.css line 949: .notebook-log .prose-text restyles the class to --face-grotesk, the app note size and secondary text. That is why the saved note reads in the grotesk today. Dropping the class from the paragraph is the whole fix; nothing in notebook.css changes.
- After the swap no JSX element carries the prose-text class. Its three rules (app.css .prose-text and .batch-row__conclusion .prose-text, notebook.css .notebook-log .prose-text) and the cross-cutting.test.js tests that pin .prose-text stay exactly as they are: retiring them is a separate decision. The SUMMARY names it as a follow-up.
- app/src/ui/BatchRow.test.jsx line 1568 pins the old markup. Lines 491 to 496 render the recording pen with renderBatchRow({ mode: 'recording', draft: { ...emptyRecordDraft, tastingOpen: true } }) and read the textarea tag by regex: copy that call for the guard. The reading render is renderBatchRow({ openBatch, batches, mode: 'reading' }) with augustSecondBatch from app/src/data/batch-2026-08-02.js, whose tasting note is null; line 1566 builds a noted batch by spreading it.
- app/src/styles/cross-cutting.test.js reads app.css into `rules` and defines ruleFor(selector) at line 59; the Why test is at about line 1005. It does not read notebook.css; the new test reads it with readFileSync, path and readAllRules, which the file already imports or can import from css-source.js.
- Browser measurement. The 03.5 harness (.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs) serves app/dist on an ephemeral 127.0.0.1 port with no Vite process and exports startServers, launch (system Chrome), openApp(browser, appUrl, routePath, { width, height, coarse }), check, finish and APP_ROUTE (the seeded olive oil batch b8cc3566). WebKit comes from playwright-core at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs (checked: it exists), as .planning/quick/261005-w3j-fix-hovering-the-header-import-or-export/261005-w3j-probe.mjs imports it; read that file for the style (readBox, hoverRead, ck, the per-engine loop, the closing finish call). The harness is the "build and preview on a free port" the task asks for: it serves the same built dist on a free loopback port and starts no Vite process, so CLAUDE.md's one-Vite-process rule holds and Mark's preview on :4173 is never requested. `npm --prefix app run build` is a one-shot, not a server. Start no dev server.
- The seeded batch has a tasting with note null, so the probe makes the note itself, in a fresh throwaway browser context per case (its IndexedDB is not Mark's): open APP_ROUTE, press Correct (button.batch-row__correct, the text control on the batch head), type an English note into textarea[aria-label="How did it turn out?"], press Save batch (the last button of .save-ceremony), wait for the read view. If Correct does not expose the tasting section on this batch, use Record another then Add tasting then Save batch, as .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs lines 278 to 280 do. Below the desktop width the Tasting fold starts closed: press button[aria-controls="fold-tasting"] if its aria-expanded is false before reading the note.

Filled action weight (D-03):
- app/src/styles/home.css lines 295 to 310: .home__action declares font-weight 600. app/src/styles/notebook.css lines 260 to 276: .notebook-action declares font-weight 700 at line 274; .notebook-action--outline (line 292) and .notebook-link (line 304) declare 600. DESIGN.md line 609 records the 600 and 700 as built; it is Sid's to update, not yours.
- Every font-weight in the stylesheets is a bare number in its rule (home.css 47, 133, 163, 201, 235, 308; notebook.css 119, 152, 274, 292 and others). tokens.css has no weight token. notebook.test.js forbids hex and px literals in notebook.css but not a weight number, and its own cue test declares font-weight 600 by value. Following that convention is what "through the existing rule, no literal" means here; do not add a token.
- Seen while reading, not asked for and not changed: the pen's filled Save (.notebook-log .save-ceremony button:last-of-type, notebook.css lines 1089 to 1092) sets a fill and a colour and no weight, and the base button rule in app.css sets none either, so it falls to the engine's button default. The probe prints its computed weight so the SUMMARY can report it for Mark; this plan does not change it.
- notebook.test.js imports readFileSync, path, and readAllRules, readCustomProperties, resolveTokenPx from css-source.js, builds `rules` from notebook.css, and has a describe-local `declares`-style helper near line 735. It has no home.css read yet; add one constant and one parse for this task's describe.

Working rules (all three tasks):
- Another agent (Sid) is editing DESIGN.md and .impeccable/ on this checkout. At planning time `git status` shows only untracked .impeccable/critique/* files and .planning/phases/03.6-per-step-shared-ingredients/.gitkeep. They are not yours. Never run `git add -A`, `git add .`, `git stash`, `git checkout -- .`, `git reset --hard` or `git clean`. Every commit uses the pathspec form, `git commit -m "<message>" -- <paths>` (a new file is first added with `git add -- <that exact path>`), which commits only the named paths. Leave .planning/STATE.md untouched.
- Test first, one commit per task: write the failing test, run it and read the failure, make the change, run it green, then commit the test and the change together. Do not commit a red test.
- A past executor committed a feat on a red suite because the commit was chained after a pipe that hid the test exit code. Run each test command on its own, read its exit status, and only then commit.
- Mark's `vite preview --host` is running on :4173 (serving app/dist). Leave it alone. `npm --prefix app run build` rewrites app/dist, which that preview then serves; that is expected and fine.
- Commit messages are English and end with the two attribution trailer lines from your own system reminder (Co-Authored-By and Claude-Session). Do not push.
- Do not file or close any Mark's List row. The orchestrator closes decide-companion-contrast-under-4-5, decide-tasting-note-in-the-hand (with todo arrebtzlmiqhd8mq9haq) and decide-filled-action-weight.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Darken --app-blue-text and --app-notebook-text one step, red first (D-01)</name>
  <files>app/src/styles/tokens.test.js, app/src/styles/tokens.css</files>
  <read_first>
    - app/src/styles/tokens.css lines 296 to 335
    - app/src/styles/tokens.test.js lines 1 to 70 and 180 to 203
    - app/src/styles/css-source.js lines 22 to 32 (readCustomProperties)
  </read_first>
  <behavior>
    - Test 1 (test.each over --app-notebook-text, --app-recipe-book-text, --app-idea-log-text, --app-ingredients-text, --app-blue-text): the token's hex, read from tokens.css, has a WCAG 2 contrast ratio of at least 4.5 against the value of --app-background. The failure message prints the token and its ratio to three decimals. Fails now for exactly two tokens: --app-blue-text (4.489) and --app-notebook-text (4.495).
    - Test 2: the white label on the blue fill. The ratio of --app-background against --app-blue-text is the same number and is at least 4.5, asserted by name as the filled action's label pairing, with the sentence that home.css's .home__action and notebook.css's .notebook-action fill with --app-blue-text and set color --app-background (read the two rules with readAllRules and assert both declarations by var() string). Fails now for the ratio, passes for the two declarations.
    - Test 3 (guard, passes before and after): each of the two darkened tokens is the approved hex (#1576de, #ee0803) less at most one step per channel, never lighter and never more than one off in any channel, so the change stays the one step Mark asked for.
    - Test 4 (guard, passes before and after): --app-recipe-book-text is #bc5b0d, --app-idea-log-text is #976f01 and --app-ingredients-text is #358452, byte for byte.
    - Test 5 (guard, passes before and after): none of app.css, home.css, shell.css, notebook.css, and no .js or .jsx under app/src/ui or app/src/domain, contains a literal copy of either approved hex or either darkened hex, matched case-insensitively, so every consumer reads the token.
  </behavior>
  <action>
RED first, per D-01. In app/src/styles/tokens.test.js add one describe, titled with Mark's decision and the quick id ("the text companions clear 4.5:1 on the app background (WCAG 2.2 AA; Mark 2026-10-05, decide-companion-contrast-under-4-5; quick 261005-wgz)"), after the existing "one App control radius" describe, holding the five tests in the behavior block. Write the WCAG 2 relative-luminance and contrast-ratio functions in the test file itself, in the file's own style, with the formula constants named in the comment above them (linear below 0.03928, the 2.4 exponent, the 0.2126, 0.7152 and 0.0722 weights, and the 0.05 offsets). Read the declared tokens through the existing readCustomProperties over tokens.css (the file already has a `declaredInTokens` pattern in the radius describe), parse the hex into channels, and reuse the file's existing cssSourceFiles and jsFiles for test 5. Use test.each for test 1 so each failure is named for its token. Do not add any import the file does not already need beyond what css-source.js already exports.

Run `npm --prefix app test -- src/styles/tokens.test.js` on its own and read the output. Exactly two tests fail, the --app-blue-text and --app-notebook-text rows of test 1, each printing a ratio just under 4.5, and test 2 fails for the ratio too; so three failures in all (two in test 1, one in test 2). Tests 3, 4 and 5 and every existing test pass. If anything else fails, the test is wrong: fix it before going on. Keep the failure messages for the SUMMARY.

Re-grep app/src and app/tests for the two old hexes and their rgb forms, 21, 118, 222 and 238, 8, 3. Expect only the two tokens.css declarations. If any other test or file pins an old value, update it in the same commit and name it in the SUMMARY; if none does, say none did.

GREEN. In app/src/styles/tokens.css change exactly two declarations: --app-blue-text from #1576de to the approved hex less the smallest uniform per-channel step that makes the computed ratio at least 4.5, and --app-notebook-text likewise. Compute it with the test's own helper (or a throwaway node one-liner in the scratchpad), starting from one hex step off every channel, and take the smallest step that clears 4.5; the planner's computation says one step, #1475dd and #ed0702. Do not change --app-blue, --app-notebook or any other token. Add one sentence to the comment above the palette (lines 298 to 305), by scoped Edit, saying that --app-notebook-text and --app-blue-text each stand one hex step per channel darker than the 2026-09-21 and 2026-10-05 approved values because those measured 4.495:1 and 4.489:1 on --app-background, and now measure the figures you computed (Mark, 2026-10-05, quick 261005-wgz); keep the comment's other text as it is. Do not edit DESIGN.md or .impeccable/: Sid updates them.

Run `npm --prefix app test -- src/styles/tokens.test.js` on its own: all green. Then run `npm --prefix app test` (the full suite) on its own and read its exit status: it must pass, including cross-cutting, home, shell and notebook, none of which names a hex. Then `npm --prefix app run build` on its own: exit 0.

Write down, for the SUMMARY: the new hex of each, its measured ratio on --app-background to three decimals, and the ratios of the other three companions, unchanged. Also compute and write down, for report only, the five companions' ratios on --app-surface-subtle (#f3f4f2); change nothing for them.

Run `git status --porcelain` and check your only modified paths are app/src/styles/tokens.css and app/src/styles/tokens.test.js. Commit only them: `git commit -m "fix(261005-wgz): the blue and Notebook text companions clear 4.5:1 on the app background" -- app/src/styles/tokens.css app/src/styles/tokens.test.js`, with the two trailer lines. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/tokens.test.js</automated>
  </verify>
  <acceptance_criteria>
    - The red run before the edit failed exactly the --app-blue-text and --app-notebook-text rows of the ratio test, and the label-pairing ratio test; no other test failed.
    - `npm --prefix app test -- src/styles/tokens.test.js` exits 0 after the edit, `npm --prefix app test` exits 0 in full, and `npm --prefix app run build` exits 0.
    - The two new values are the approved hex less the smallest uniform per-channel step that clears 4.5:1; the one-step guard test and the unchanged-three guard test pass.
    - `git show --name-only --format= HEAD` lists only app/src/styles/tokens.css and app/src/styles/tokens.test.js.
  </acceptance_criteria>
  <done>The blue and Notebook text companions each clear 4.5:1 on the app background, by a test that computes it; the other three companions and every other token are untouched; no consumer carries a literal; one commit holds the test and the two declarations.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Show the saved tasting note in the hand, red first, measured in WebKit and Chromium (D-02)</name>
  <files>app/src/ui/BatchRow.test.jsx, app/src/styles/cross-cutting.test.js, .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs, app/src/ui/BatchRow.jsx, app/src/styles/app.css</files>
  <read_first>
    - app/src/ui/BatchRow.jsx lines 254 to 262 and 338 to 345 (TastingReading, the one paragraph), and lines 875 to 892 (the pen's textarea, read only)
    - app/src/ui/BatchRow.test.jsx lines 1560 to 1572 (the old markup pin), 488 to 497 (the pen render), and the renderBatchRow helper near the top of the file
    - app/src/styles/app.css lines 396 to 408 (.app-hand), 626 to 650 (the Why rule), 1452 to 1461 (.prose-text) and 1538 to 1546 (.tasting-reading__note)
    - app/src/styles/cross-cutting.test.js lines 40 to 62 (imports, ruleFor) and 997 to 1015 (the Why test)
    - .planning/quick/261005-w3j-fix-hovering-the-header-import-or-export/261005-w3j-probe.mjs (the whole file, for style)
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs lines 84 to 125 (openApp)
  </read_first>
  <behavior>
    - BatchRow.test.jsx, edited test (the one at about line 1566): "renders the saved note in the hand when written, and nothing when blank (quick 261005-wgz)". With a note written, the reading markup contains the paragraph with class "app-hand tasting-reading__note" holding the note text, and does not contain the class prose-text anywhere. With no note, the note text is absent, as before. Fails now: the paragraph still carries prose-text.
    - BatchRow.test.jsx, new guard (passes before and after): in the recording pen the textarea labelled "How did it turn out?" carries the class prose-field (prose-field prose-field--empty when blank) and never app-hand, for a blank and for a filled draft: the hand is for display, not entry.
    - cross-cutting.test.js, new describe "the saved tasting note reads in the hand (D-02; Mark 2026-10-05; quick 261005-wgz)": (a) the top-level app.css rule .tasting-reading__note keeps max-width var(--measure-prose) and declares overflow-wrap anywhere, the long-word guard the prose-text class used to give the paragraph; fails now, since the rule has no overflow-wrap. (b) no rule in app.css or in notebook.css whose selector names .tasting-reading__note declares font-family, font-size, line-height or color, so the .app-hand role reaches it exactly as it reaches .version-row__reason; passes before and after.
  </behavior>
  <action>
RED first, per D-02. Edit the one pin in app/src/ui/BatchRow.test.jsx and add the one guard beside the pen-note test, exactly as the behavior block says, in the file's own style (renderToStaticMarkup, regex on the markup, expect with a message). Add the describe to app/src/styles/cross-cutting.test.js, after the Why row describe, using the file's own ruleFor for app.css and a describe-local read of notebook.css (readFileSync over path.join(STYLES_DIR, 'notebook.css') parsed with the readAllRules the file already imports from css-source.js). Match a selector that "names" .tasting-reading__note the way the Why test does: split the selector list on commas, split each part on the dot boundaries, and look for the class. Write the new comments in English and cite decision 17 of sketch 011 and Mark's 2026-10-05 decision.

Run `npm --prefix app test -- src/ui/BatchRow.test.jsx src/styles/cross-cutting.test.js` on its own and read it. Exactly two tests fail: the edited note test and the overflow-wrap test (a). The guard tests and every other test pass. If anything else fails, the edit is wrong: fix it before going on. Keep both failure messages for the SUMMARY.

Write .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs in the style of the w3j probe: a header comment saying what it measures (the computed typography of the saved tasting note against a reference .app-hand element, and the computed font-weight of the filled actions, in WebKit and Chromium, on the BUILT app in app/dist), how to run it (`node .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs` from the checkout root, after `npm --prefix app run build`), that it serves only the 03.5 harness's loopback servers, starts no Vite process, never requests Mark's :4173 preview, that every case runs in a fresh throwaway browser context whose IndexedDB is not Mark's, and that a reading is evidence about two engines, not about a device. Import webkit from the absolute playwright-core path the w3j probe uses and startServers, launch, openApp, check, finish and APP_ROUTE from the 03.5 harness by the same relative path (../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs). Run WebKit first, then Chromium, closing each browser and the servers in finally blocks.

Cases: per engine, at 1600, 1366 and 393 wide (fine pointer, height 1100, or 852 at 393), openApp at APP_ROUTE, await document.fonts.ready and wait 300ms, then: open the pen with Correct (fallback in the context section); read the pen textarea's computed font-family; type the English note "Soft set, clean finish" with fill; press Save batch; wait for the read view; open the Tasting fold if its aria-expanded is false; wait for .tasting-reading__note. Then inject, inside .notebook-log, one reference span with class app-hand, read its computed font-family, font-size, line-height, color, font-style and font-weight, and remove it. Read the same six for the note. One combined counted check per case, so a failing case is one FAIL line: the note exists; its font-family string equals the reference's and starts with the Caveat name (the token is 'Caveat' then the text face); its font-size, line-height, color and font-style equal the reference's; its font-weight is the normal weight; document.fonts.check for 22px Caveat is true (the file loaded, so it is the hand and not the fallback); and the pen textarea's font-family does not start with Caveat. A failing label names engine, width, the note's computed font-family and the reference's. Every case also prints one line with the engine, the width and those readings, so the SUMMARY can quote it. A missing target is a failed counted check naming it, not an exception that ends the run.

Also print, once per engine at 1366 only, INFO lines (not counted checks) with the computed font-weight of: Home's first .home__action (route '/'), the batch route's first .notebook-version__acts .notebook-action, and the pen's filled Save (.notebook-log .save-ceremony button:last-of-type) while the pen is open. Format them as "INFO weight <engine> <name>: <weight>" and print "not found" for a missing target. These exist so Task 3's before and after can be read from this same probe.

Run `npm --prefix app run build` on its own and read its exit status (the code is still pre-fix, so this is the pre-fix build). Then run the probe on its own from the checkout root. It must exit non-zero, and the FAIL lines must be exactly the six cases, three widths in each of the two engines, each showing the note's font-family beginning with the grotesk stack's first family (the pre-fix reading); the pen-textarea guard inside each case must not be the reason any case fails. Record every printed line, INFO lines included, for the SUMMARY: they are the "before". If the note does not read the grotesk in the pre-fix run, stop and report: the cause is not understood.

GREEN. In app/src/ui/BatchRow.jsx line 341, change only the paragraph's className from prose-text tasting-reading__note to app-hand tasting-reading__note; leave the text child, the condition and everything else in the file as they are (the pen's textarea, the problems span, Next time and the batch notes are not touched). In app/src/styles/app.css add overflow-wrap: anywhere to the .tasting-reading__note rule and a short comment above the rule saying the saved note reads in the hand like Why and Next time, that the face, size, leading and colour come from the .app-hand role and never from this rule, and that overflow-wrap keeps a long word wrapping as .version-row__reason does now that prose-text no longer supplies it (Mark, 2026-10-05, D-02; quick 261005-wgz). Edit by scoped replacement, not a whole-file write. Add nothing else, no new token, no new selector, and do not touch notebook.css or the three .prose-text rules.

Run `npm --prefix app test -- src/ui/BatchRow.test.jsx src/styles/cross-cutting.test.js` on its own: all green. Run `npm --prefix app test` (the full suite) on its own and read its exit status: it must pass, including tabindex-scan. Run `npm --prefix app run build` on its own. Run the probe on its own: it must exit 0 with all six cases passing. Compare: the note's size, leading, colour and family now equal the reference's, and the pen's textarea reads the text face. Record every printed line for the SUMMARY: the "after".

Run `git status --porcelain` and check your modified paths are exactly app/src/ui/BatchRow.jsx, app/src/ui/BatchRow.test.jsx, app/src/styles/app.css and app/src/styles/cross-cutting.test.js, and the new probe. Add the probe: `git add -- .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs`. Commit only those five: `git commit -m "fix(261005-wgz): the saved tasting note reads in the hand, like Why and Next time" -- app/src/ui/BatchRow.jsx app/src/ui/BatchRow.test.jsx app/src/styles/app.css app/src/styles/cross-cutting.test.js .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs`, with the two trailer lines. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/BatchRow.test.jsx src/styles/cross-cutting.test.js && npm --prefix app run build && node .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-probe.mjs</automated>
  </verify>
  <acceptance_criteria>
    - The red run before the fix failed exactly two tests (the edited note test and the overflow-wrap test), and the pre-fix probe run exited non-zero with six FAIL lines, one per engine and width, each reading the grotesk.
    - After the fix both test files exit 0, `npm --prefix app test` exits 0 in full, `npm --prefix app run build` exits 0, and the probe exits 0 with no FAIL line in WebKit or in Chromium at 1600, 1366 and 393.
    - Only line 341's className changed in BatchRow.jsx, and only .tasting-reading__note and its comment changed in app.css; notebook.css and every .prose-text rule are byte-identical to HEAD (`git diff 4e20f11..HEAD --stat -- app/src/styles/notebook.css` prints nothing at this point).
    - `git show --name-only --format= HEAD` lists exactly the five paths above.
  </acceptance_criteria>
  <done>A saved tasting note reads in the hand, the same role as Why and Next time, measured against a reference .app-hand in WebKit and Chromium at three widths; the pen's input is unchanged and still reads the prose-field role; the probe, the unit pins, the full suite and the build are green; one commit holds the tests, the probe and the two-line fix.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: The Notebook's filled action at weight 600, red first (D-03)</name>
  <files>app/src/styles/notebook.test.js, app/src/styles/notebook.css</files>
  <read_first>
    - app/src/styles/notebook.css lines 253 to 310
    - app/src/styles/home.css lines 290 to 318
    - app/src/styles/notebook.test.js lines 1 to 25 and 725 to 760
  </read_first>
  <behavior>
    - Test 1: the top-level .notebook-action rule in notebook.css declares font-weight 600. Fails now (700).
    - Test 2: the top-level .notebook-action rule and the top-level .home__action rule in home.css declare the same font-weight, and it is 600, so Home's and the Notebook's filled action cannot drift apart. Fails now (700 against 600).
    - Every other test in the file passes unchanged.
  </behavior>
  <action>
RED first, per D-03. In app/src/styles/notebook.test.js add a constant for home.css's path beside the file's existing path constants, read and parse it with readAllRules into a describe-local `homeRules`, and add one describe titled "the filled action reads weight 600 on Home and in the Notebook (Mark 2026-10-05, decide-filled-action-weight; quick 261005-wgz)" holding the two tests in the behavior block. Find each rule the way the file's other describes do (the top-level rule whose selector is exactly the class and whose media is undefined), read the weight with a describe-local reader that returns the value after font-weight: of the rule's declarations, and give every expect a message naming the selector. Use no px value and no hex colour in the new code, because this file's own literal tests read notebook.css only but its convention is token discipline throughout.

Run `npm --prefix app test -- src/styles/notebook.test.js` on its own and read it. Exactly two tests fail, both for the Notebook's 700. Every other test passes. Keep the two failure messages for the SUMMARY.

GREEN. In app/src/styles/notebook.css, in the one top-level .notebook-action rule, change font-weight from 700 to 600, the same bare weight .home__action and .notebook-action--outline declare; there is no weight token and none is added. Add a one-line comment above the rule saying the filled action is weight 600 on Home and in the Notebook (Mark, 2026-10-05, D-03; quick 261005-wgz), by scoped Edit. Change nothing else: not .notebook-action--outline, not .notebook-link, not the pen's filled Save rule, not .notebook-recipe__name, and not any 700 elsewhere in the file.

Run `npm --prefix app test -- src/styles/notebook.test.js` on its own: all green. Run `npm --prefix app test` (the full suite) on its own and read its exit status: it must pass. Run `npm --prefix app run build` on its own. Then run the Task 2 probe once more, unchanged, from the checkout root: it must still exit 0, and its INFO weight lines must now read 600 for Home's .home__action and for the Notebook's .notebook-action in both engines. Record the INFO lines for the SUMMARY next to Task 2's "before" lines (Notebook 700 then, 600 now), and record the pen's filled Save weight exactly as printed, with the sentence that it declares no weight of its own and is left for Mark to decide.

Write 261005-wgz-SUMMARY.md in .planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/, in the 261005-db4 shape (read .planning/quick/261005-db4-recording-reads-like-the-reading-sheet-w/261005-db4-SUMMARY.md first), in plain English. Cover, per task: what changed, the commit hash and its path list, the red failure messages, and the green result. Task 1: the new hexes and measured ratios for the two, and the ratios of the other three companions, unchanged; whether any other test pinned an old value. Task 2: the answer to whether the recording form is a different component from the reading (same file BatchRow.jsx, two branches: TastingReading for display, the recording branch's textarea for entry; only the display paragraph changed); the probe's before lines and after lines side by side for each engine and width; that the harness serves the same built dist on a free loopback port and started no Vite process, as the one-Vite-process rule requires. Task 3: the INFO weight lines before and after. Then a section "Observed, not changed" with: the pen's filled Save weight; the five companions' ratios on --app-surface-subtle (the current rail place) from Task 1; and that no JSX element carries prose-text any more, so its three rules and the cross-cutting tests that pin it are now unused and are a follow-up for Mark to decide. Under "Not verified" list Mark's own iPad (WebKit on a touch screen, Caveat on the device) and iPhone, and Mark's desktop Safari and Chrome. Add a short "Deferred Human Verification" section: on the build served by `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server, open a batch with a saved tasting note and see it in the hand, and look at the Home and Notebook filled actions side by side for weight and colour. Do not file or close any Mark's List row. Do not commit the SUMMARY; the quick workflow's docs commit carries it.

Run `git status --porcelain` and check your only modified paths are app/src/styles/notebook.css and app/src/styles/notebook.test.js. Commit only them: `git commit -m "fix(261005-wgz): the Notebook's filled action reads weight 600, as Home's does" -- app/src/styles/notebook.css app/src/styles/notebook.test.js`, with the two trailer lines. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/notebook.test.js</automated>
  </verify>
  <acceptance_criteria>
    - The red run before the edit failed exactly the two new tests, both naming the Notebook's 700.
    - After the edit `npm --prefix app test -- src/styles/notebook.test.js` exits 0, `npm --prefix app test` exits 0 in full, `npm --prefix app run build` exits 0, and the Task 2 probe exits 0 with its INFO weight lines reading 600 for both filled actions in both engines.
    - `git show --name-only --format= HEAD` lists only app/src/styles/notebook.css and app/src/styles/notebook.test.js; `git diff 4e20f11..HEAD --name-only -- app/` lists exactly the eight app paths in files_modified and nothing else.
    - `git log --format=%s 4e20f11..HEAD` shows the three fix commits in task order, with no push, and `git status --porcelain` shows none of .planning/STATE.md, DESIGN.md or .impeccable/ as modified or staged by you.
    - 261005-wgz-SUMMARY.md exists and quotes the new hexes and ratios, the before and after probe lines, and the weight readings.
  </acceptance_criteria>
  <done>The filled action is weight 600 on Home and in the Notebook, pinned equal by a test; nothing else in notebook.css moved; the full suite, the build and the probe are green; three commits hold only their own paths; the SUMMARY records the numbers and what was seen and left alone.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe to local servers and browsers | The probe starts the 03.5 harness's static servers on ephemeral 127.0.0.1 ports and two headless browsers; the harness aborts every request whose host is not 127.0.0.1. It types one fixed English string into a note field in a throwaway context. |
| maker's saved note to rendered read view | The tasting note is user-authored text. It reaches the DOM only as a React text child of one paragraph. |
| stylesheet and token values to rendered app | Two hex values, one class name on one paragraph, one overflow-wrap declaration and one weight change. No markup source, input handling, storage or network path changes. |

## STRIDE Threat Register

Threat IDs are unique within the phase; this quick task's IDs are prefixed T-261005-wgz. `T-261005-wgz-SC` is reserved and kept.

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261005-wgz-01 | Information Disclosure | 261005-wgz-probe.mjs servers and contexts | low | mitigate | The probe reuses the harness's loopback-only servers (no --host, no 0.0.0.0), starts no Vite process, never requests Mark's :4173 preview, aborts any non-127.0.0.1 request, and writes its note into a fresh context's IndexedDB that is discarded with the context. |
| T-261005-wgz-02 | Tampering | the saved tasting note paragraph in BatchRow.jsx | medium | mitigate | The class changes; the child stays the note string as a React text node, so the note renders as text and never as markup. No dangerouslySetInnerHTML is introduced, and the BatchRow test pins the paragraph's text content. |
| T-261005-wgz-03 | Tampering | tokens.css and notebook.css value changes | low | accept | Two colour values and one weight, read through existing tokens and rules. The tokens suite pins the one-step bound and the unchanged three companions; no script, markup or input path is added. |
| T-261005-wgz-SC | Tampering | npm installs | low | accept | No package is installed or changed. playwright-core is imported by absolute path from the existing npx cache, as the earlier probes do. |
</threat_model>

<verification>
- `npm --prefix app test -- src/styles/tokens.test.js`, `... src/ui/BatchRow.test.jsx src/styles/cross-cutting.test.js` and `... src/styles/notebook.test.js` each failed in exactly the named tests before their change and pass after.
- `npm --prefix app test` passes in full and `npm --prefix app run build` exits 0 after Task 3.
- The probe was red on the pre-fix build (six cases, the saved note in the grotesk, in WebKit and Chromium) and is green after Task 2, with INFO weights reading 600 for both filled actions after Task 3.
- `git log --format=%s 4e20f11..HEAD` shows three commits, one per task, and each commit's path list is its own. Nothing is pushed.
- `git status --porcelain` shows no change by you to .planning/STATE.md, DESIGN.md, .impeccable/** or the untracked critique files.
</verification>

<success_criteria>
- --app-blue-text and --app-notebook-text each clear 4.5:1 on --app-background by a computed test, one step darker than approved; the other three companions are byte-identical.
- The saved tasting note reads in the hand in the real built app in WebKit and Chromium; the pen's input keeps the prose-field role.
- The Notebook's filled action is weight 600, equal to Home's, pinned by a test.
- Three test-first commits, the probe and the full suite green, and a SUMMARY that reports the new hexes and ratios, the before and after readings, and what was left alone for Mark.
</success_criteria>

<output>
Create `.planning/quick/261005-wgz-three-decided-app-fixes-one-step-darken-/261005-wgz-SUMMARY.md` when done
</output>
