---
phase: quick-261123-ghg
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/ui/Method.jsx
  - app/src/ui/Method.test.jsx
  - .planning/quick/261123-ghg-bug-pen-removed-step-words-shift-left-mark-answered-fix-it-i/261123-ghg-SUMMARY.md
autonomous: true
requirements: [bug-pen-removed-step-words-shift-left]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "In the Next version pen at 1366, a removed step's words start where every live step's words start: its .method-step__body x and width equal the live steps' (104 and 504 in Playwright WebKit, 103.1 and 504.9 in Chrome at HEAD's figures), closed or open, whether it was removed in the pen or before the pen opened, measured on a scratch build"
    - "A removed step's number cell still shows no numeral (D-UAT-5: the pen leaves a removed step's number empty) and is one figure wide, the live steps' own number width (12 in WebKit, 11.1 in Chrome)"
    - "Nothing else moves sideways: every live step's number and body keep their x and width in the pen, and Show changes and the reading page keep every box, before against after, in both engines"
    - "app.css holds one new rule, .method-step__n:empty::before, declaring content \"0\" and visibility hidden; no token is added and the .method-step grid rule is unchanged"
    - "The full suite passes (137 files, 4596 tests before this item, plus the new ones) and sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh ends GATE2 PASS"
  artifacts:
    - path: app/src/styles/app.css
      provides: ".method-step__n:empty::before: an empty number cell holds one hidden figure, so the auto column keeps a figure's width"
    - path: app/src/styles/cross-cutting.test.js
      provides: "The stylesheet test that pins the rule's two declarations"
    - path: app/src/ui/Method.test.jsx
      provides: "The bound that the pen's removed step renders its number cell with no child at all, so :empty reaches it"
    - path: app/src/ui/Method.jsx
      provides: "The pen branch's margin comment, corrected to name the rule that keeps the column"
  key_links:
    - from: app/src/ui/Method.jsx
      to: app/src/styles/app.css
      via: "the pen branch renders span.method-step__n with no child for a removed step; .method-step__n:empty::before matches exactly that span"
---

<objective>
Fix bug-pen-removed-step-words-shift-left (Mark answered Fix it, 2026-11-23). In the Next version pen a removed step's words start 12 px left of the other steps' (92 against 104 at 1366, WebKit and Chrome), because its number cell is empty and 0 wide. The fix keeps the number column's width for a removed step so its words line up. The number itself stays empty, as D-UAT-5 decided.

The cause is unverified until Task 1 measures it. The evidence so far is Sid's capture of the built page for sketch 017 (.planning/canvas-generators/p12pm-capture.json and p12pm-capture-chromium.json, states pen_removed and pen2). At 65678e4f the removed step's li is 84 high. Its .method-step__n is '' and 0 wide, and its body starts at x 92 with width 516. Every live step's li is 88 high, its number is 12 wide (11.1 in Chrome), and its body starts at x 104 (103.1). Each li is its own grid (app.css .method-step: grid-template-columns auto 1fr, gap var(--gap-s), align-items baseline), so an empty first cell sizes its auto track to 0. Method.jsx's pen-branch comment says the empty span keeps the grid from shifting. It keeps the body in the second column, but the column is 0 wide.

The planned fix is one CSS rule, .method-step__n:empty::before { content: "0"; visibility: hidden; }. An empty number cell then holds one generated figure, hidden and never read. It is set in the cell's own face, size and tabular figures, so the auto track gets exactly a live number's width in each engine. The cell's markup does not change, so every test that reads an empty margin still holds. The figure also gives the cell a baseline. The removed step therefore takes a live step's height and inner offset: li 88, body 4 below the li top, where it is 84 and 0 today. The steps after it sit 4 px lower. That is the live steps' own layout, not a new one. The SUMMARY states it.

Considered and not taken: a min-width on .method-step__n. It needs a size token or a ch literal (the token rule), ch need not equal the tabular figure in either engine, and it leaves the 4 px vertical difference. Also not taken: rendering the removed step's old number hidden in the JSX. A step removed before the pen opened has no number to render, and the existing margin tests read the cell as empty.

Authority and undrawn states. Board P12_PenStepOrder (.planning/sketches/017-pen-step-order/pen-step-order.html, panel data-pid="pm-removed") draws the removed step as built: an empty, 0-wide cell with its words 12 px left. README line 120 notes that as a bug for triage. No board draws the fixed state. The target is the bug row's own words, and the precedent is a live step's number column on the same board. The undrawn states, each built from that precedent, are:
- the removed step, closed;
- the removed step opened with Edit this step;
- a step removed before the pen opened.
The SUMMARY lists them. If a measurement contradicts this, the executor stops that point and reports it. It does not invent a design.

Out of scope, do not touch: the creation editor (its removal deletes the step outright, so it never draws an empty cell), the order work of 261123-ghk, the target chip of 261123-ghh, tokens.css, the store, the domain, and the gate scripts. No stored shape change and no DB_VERSION change.

Purpose: a removed step stands in the same column as the steps around it, so the pen reads as one list.
Output: one CSS rule, one corrected comment, two tests, before and after measurements in WebKit and Chrome, the SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/sketches/017-pen-step-order/CONTRACT.md

Read these ranges only:
- app/src/ui/Method.jsx lines 797-847 (the pen branch: the margin span and its comment, lines 804-820)
- app/src/styles/app.css lines 1114-1160 (.method-steps, .method-step, .method-step__n, .method-step__n--struck)
- app/src/styles/cross-cutting.test.js lines 20-66 (imports, ruleFor) and 1278-1309 (the describe that pins the .method-step rule)
- app/src/ui/Method.test.jsx lines 815-950 (makeTenStepMethod, extractStepEntries, and the two pen cases with a removed step)
- .planning/sketches/017-pen-step-order/README.md lines 94-120 (Measured, and the noticed bug)
- .planning/canvas-generators/p12pm-capture.mjs, the whole file (96 lines, some very long): the flow and the geo() measure this plan reuses as a scratch copy
- .planning/sketches/017-pen-step-order/pen-step-order.html: do not Read it. Its body is one long line from line 13161. Measure its panel with a scratch script (Task 3).

Facts checked at planning time (HEAD fa19967d, last app commit e865f298):
- `npm --prefix app test -- src/styles/cross-cutting.test.js src/ui/Method.test.jsx` passes: 2 files, 186 tests.
- `grep -c "^\.method-step__n:empty::before {" app/src/styles/app.css` is 0. `grep -c "bug-pen-removed-step-words-shift-left"` is 0 in app.css, Method.jsx, Method.test.jsx and cross-cutting.test.js.
- No stylesheet under app/src/styles has a :empty rule on .method-step__n, and none gives it a width. print.css has no .method-step__n rule.
- cross-cutting.test.js pins the top-level .method-step rule to exactly four declarations (display grid, grid-template-columns auto 1fr, gap var(--gap-s), align-items baseline), and pins that no other rule sets the step li's alignment. The new rule touches neither.
- Precedents for the rule's form: generated characters in notebook.css (`content: "\00b7"` on .fold-row__count::before), and :empty rules in app.css (.page-status:empty, .ingredient-table td.ingredient-table__col-numeric:empty).
- Where an empty .method-step__n renders: only in Method.jsx's pen branch, for a removed step (its number came from the baseline frame, or from neither frame), and in Show changes for a step with no number in either frame. The creation editor (CreationSteps.jsx) never draws a removed step, and StepReading always gets a live number.
- The gate: no 12-*.mjs, 11-walk.mjs or 08-*.mjs file measures a removed pen step's geometry. The only step removals in the gate are the creation editor's (12-keys-probe.mjs), which delete the step outright. The Phase 11 walk hashes words, not boxes. So no gate file is expected to change.
- Tools: playwright-core at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs, and Chrome at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome. p12pm-capture.mjs launches both (argument "chromium" for Chrome) and serves the dist through startServers from .planning/milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs, on a throwaway 127.0.0.1 port. It writes its JSON next to itself, which is why only a scratch copy is ever run.
- estimate-calibration: factor 1, 0 samples, confidence low.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Measure the built pen at HEAD in WebKit and Chrome and confirm the cause</name>
  <files>None in the repo. Scratch evidence only, under ${TMPDIR:-/tmp}/sprinkles-ghg</files>
  <precondition>playwright-core exists at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs and Chrome at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome (both present at planning time)</precondition>
  <action>
Record BASE as the output of `git rev-parse HEAD` before anything else; the SUMMARY's plan_head_before is BASE. S is "${TMPDIR:-/tmp}/sprinkles-ghg". Make "$S/before" and "$S/after".

1. Build once at BASE: `npm --prefix app run build -- --outDir "$S/dist-before" --emptyOutDir`. Never write app/dist, never start a dev or preview server, leave port 4173 alone, and start no build while another runs.

2. Copy .planning/canvas-generators/p12pm-capture.mjs to "$S/capture.mjs". Never run the repo file itself: it writes p12pm-capture*.json into .planning/canvas-generators, which is Sid's evidence. In the scratch copy only, make three edits:
- Point the harness import at the absolute path of .planning/milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs in this checkout, read from `git rev-parse --show-toplevel`.
- In geo()'s per-step object, add gtc: getComputedStyle(li).gridTemplateColumns.
- Directly after `await state('pen_removed')`, open the removed step and close it again, so the open removed step is measured. Click the control labelled "Removed step 3, edit this step" and wait for .method-step__open-fields. Then call state('pen_removed_open'). Then click that step's Done (the button with the text Done inside .method-step__done-cancel) and wait 300 ms. Use Done, not Cancel: Cancel restores the step from the opened version and would undo the removal the rest of the flow saves.
If the copy fails on a selector at this HEAD, adapt only the scratch copy's flow, never a repo file, and say so in the SUMMARY.

3. Run it in each engine: `node "$S/capture.mjs" "$S/dist-before" "$BASE"` (WebKit), then the same with a third argument chromium (Chrome). After each run, move the JSON it wrote in $S into "$S/before/" as webkit.json and chrome.json.

4. Write "$S/summarize.mjs", a scratch script outside the repo that is never committed. Given before, or before and after, it prints one table per engine. The rows are the states pen, pen_removed, pen_removed_open, pen2, v2_changes and v2_reading. For each li it prints the id, the number cell's words, the number's w and h, the body's x and w, the li's h, the body's top minus the li's top, and gtc. With the argument "cause" it exits 0 only when every point below holds in both engines, and it prints each check as PASS or FAIL:
- In pen_removed, pen_removed_open and pen2, exactly one li (method-step-4) has number words ''. Its number is 0 wide. Every other li's number has one width L, 12 in WebKit and 11.1 in Chrome.
- The removed li's body x is the live steps' body x minus L, within 0.1 px.
- The first track of the removed li's gtc is 0px, where a live li's is L.

5. Run `node "$S/summarize.mjs" cause before`. If it exits 0, the cause is the one the objective names: go on to Task 2. If any check fails, the cause is not that one. Stop here, change no repo file, and write a SUMMARY that reports the tables and the failed checks for re-planning.
  </action>
  <verify>
    <automated>node "${TMPDIR:-/tmp}/sprinkles-ghg/summarize.mjs" cause before</automated>
    <automated>git diff --quiet HEAD -- app .planning/canvas-generators .planning/sketches # [HEAD=0 EXPECT==0 @fa19967d GUARD MUTATION: running the repo's own .planning/canvas-generators/p12pm-capture.mjs rewrites the tracked p12pm-capture.json, exit 1] (exit status; Task 1 writes no repo file)</automated>
  </verify>
  <done>The before tables for WebKit and Chrome are in $S/before. The cause check passes in both engines: the removed step's number cell is empty, 0 wide, and its auto track is 0px, so its body starts one number width left. No repo file changed. On a failed check the plan stopped here, and the SUMMARY reports it.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The empty number cell holds one hidden figure, so a removed step's words line up</name>
  <files>app/src/styles/cross-cutting.test.js, app/src/ui/Method.test.jsx, app/src/styles/app.css, app/src/ui/Method.jsx</files>
  <behavior>
    - cross-cutting.test.js, a new describe placed after the one that pins the .method-step rule, citing bug-pen-removed-step-words-shift-left (Mark, 2026-11-23). A top-level rule (media undefined) with the exact selector .method-step__n:empty::before exists. Its declarations, split on ';', trimmed, with whitespace collapsed, are exactly ['content: "0"', 'visibility: hidden'], and they hold no px literal. RED at BASE: the rule is absent.
    - Method.test.jsx, one case in the "step display numbers" describe, a bound that passes at BASE. Build makeTenStepMethod's baseline with step 5 removed, and a draft from it with step 2 removed too. Render the pen as the two existing removed-step cases do (mode developing, penDiff buildDiff(draft, baseline), currentStepNumbers and baselineStepNumbers from displayNumbers). The markup must contain `<li id="method-step-2" class="method-step"><span class="method-step__n" aria-hidden="true"></span>` and the same for method-step-5, so the cell has no child at all and :empty can match it. It must also contain `<li id="method-step-1" class="method-step"><span class="method-step__n" aria-hidden="true">1</span>`, so a live cell keeps its numeral.
  </behavior>
  <action>
RED. Add the two tests in the behavior block, with nothing else changed in either file. Run `npm --prefix app test -- src/styles/cross-cutting.test.js src/ui/Method.test.jsx` and record the result: the stylesheet case fails and the Method case passes as a bound. Commit only those two files by explicit path: `test: a removed step's empty number cell keeps one figure's width`.

GREEN, in two files.
- app/src/styles/app.css: directly after the .method-step__n--struck rule, add the rule .method-step__n:empty::before in the file's multi-line style, with the declarations content: "0"; and visibility: hidden;. Put a short comment above it. The comment says:
  - the pen leaves a removed step's number empty (D-UAT-5), and each step li sizes its own auto column, so an empty cell gave the column no width and the words started 12 px left (bug-pen-removed-step-words-shift-left, Mark 2026-11-23);
  - the hidden figure, in the cell's own face and tabular figures, gives the column a live number's width and the cell a live number's baseline;
  - it is never shown or read, because it is hidden and the cell is aria-hidden;
  - it uses a keyword and a content string, and no token.
  Do not repeat the selector inside the comment. Change no other rule, and add no token.
- app/src/ui/Method.jsx: in the pen branch's margin comment (lines 804-813), replace only the sentence claiming that the rendered empty span keeps the two-column grid from shifting. The new sentence says the span still renders, empty, and app.css's :empty rule on the number gives it one figure's width, so a removed step's words start where the live steps' words start (bug-pen-removed-step-words-shift-left). Keep the rest of the comment. Change no code line in Method.jsx.
Run the two files green. Then run `npm --prefix app test -- src/styles` so the other style suites (tokens, binder, columns, notebook, print) still pass. Commit app.css and Method.jsx by explicit path: `fix: a removed step's words line up with the other steps in the pen`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/cross-cutting.test.js src/ui/Method.test.jsx src/styles</automated>
    <automated>grep -c "^\.method-step__n:empty::before {" app/src/styles/app.css # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "bug-pen-removed-step-words-shift-left" app/src/ui/Method.jsx # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>grep -c "bug-pen-removed-step-words-shift-left" app/src/styles/cross-cutting.test.js # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>D=$(git diff -U0 "$BASE" HEAD -- app/src/ui/Method.jsx) && test -z "$(printf '%s\n' "$D" | grep -E '^[+-]' | grep -vE '^(\+\+\+|---) ' | grep -vE '^[+-][[:space:]]*//')" # [HEAD=0 EXPECT==0 @fa19967d GUARD MUTATION: any code-line edit in Method.jsx, e.g. a placeholder child in the margin span, exit 1] (exit status; Method.jsx changes comment lines only; the diff's status is captured before the filter)</automated>
    <automated>git diff --quiet "$BASE" HEAD -- app/src/styles/tokens.css app/src/store app/src/domain app/src/ui/CreationSteps.jsx app/src/ui/StepReading.jsx # [HEAD=0 EXPECT==0 @fa19967d GUARD MUTATION: a new size token in tokens.css for the number column, exit 1] (exit status; no token, store, domain or other step component change)</automated>
  </verify>
  <done>The stylesheet case failed at BASE and passes now. The Method bound held before and after. app.css holds the one new rule, after .method-step__n--struck, with a comment. Method.jsx's comment tells the truth, and no code line in it changed. There are two commits, red then green, each staged by explicit path.</done>
</task>

<task type="auto">
  <name>Task 3: Measure after in WebKit and Chrome, side by side with the board's live steps; the full suite, GATE2, and the SUMMARY</name>
  <files>.planning/quick/261123-ghg-bug-pen-removed-step-words-shift-left-mark-answered-fix-it-i/261123-ghg-SUMMARY.md</files>
  <action>
S, BASE and the scratch scripts are Task 1's.

1. Build the fixed tree once: `npm --prefix app run build -- --outDir "$S/dist-after" --emptyOutDir`. The same rules apply: never app/dist, no server, no port 4173, one build at a time. Run "$S/capture.mjs" on "$S/dist-after" in WebKit and in Chrome, passing the current HEAD as the commit. Move the JSON into "$S/after/" as webkit.json and chrome.json.

2. Extend summarize.mjs with the argument "fix". It reads before and after and exits 0 only when every point below holds in both engines, printing each check as PASS or FAIL:
- In pen_removed, pen_removed_open and pen2, the removed li's number words are still '' (D-UAT-5). Its number is L wide and its gtc first track is L, both within 0.1 px of the live steps' in the same run.
- In the same three states, the removed li's body x and width equal the live steps' body x and width, within 0.1 px.
- In every state, every live li's number and body keep the x and width they had in the before run, within 0.1 px.
- v2_changes and v2_reading keep every li, number and body box (x, y, w, h) from the before run, within 0.1 px.
- Recorded, and expected but not chased: in pen_removed and pen2 the removed li's height and body offset (body top minus li top) equal a closed live step's. That is 88 with an offset of about 4 at HEAD's figures, and each li after it sits 4 px lower than before. In pen_removed_open the removed open step's number offset equals pen_open's open live step's. A different figure is a finding: report it in the SUMMARY and do not change CSS to chase it.
Run `node "$S/summarize.mjs" fix before after`.

3. Side by side with the board. Write "$S/board.mjs", a scratch script. It opens .planning/sketches/017-pen-step-order/pen-step-order.html by file URL in WebKit (hasTouch) and in Chrome, with a viewport of 2000 x 1400. Every request that is not file: is aborted. Inside [data-pid="pm-removed"], for each li.method-step, it reads the same figures relative to the li: the number's w and h, body left minus li left, body top minus li top, and li height. On the board the live steps read L, an offset of L plus the 12 px gap (24 in WebKit, about 23.1 in Chrome), and 88 high. The removed step (method-step-4-pm-removed) reads as built: number 0, offset 12, 84 high. The script checks two things, in the same engine, within 0.1 px:
- the app's removed step after the fix (pen_removed and pen2) has the board's live-step figures;
- the app's live steps have the board's live-step figures.
It prints the board's removed step's figures as the as-built drawing. They now differ from the app by one figure's width, and that is the fix.

4. Run the full suite: `npm --prefix app test`. If npm hangs inside the worktree, run `cd app && npx vitest run`, as 12-check.sh notes. It must pass with 137 files and 4596 tests, plus the new ones. A failing test outside the two files Task 2 touched is a deviation: name it, find the cause, and record it. Do not loosen it.

5. The gate: run `sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh` once, in the background, after step 4, and wait for it. It must end GATE2 PASS. Planning found no gate step that holds a removed pen step's geometry, so no gate file changes. If a step fails anyway, keep its output under $S. If the failure is a removed pen step's boxes held against an older board, report the panel and its figures, and do not edit the gate. The orchestrator decides. A failure in any other step is reported with its output, and that step is not edited either.

6. Write the SUMMARY with:
- the cause as measured, with Task 1's before tables for WebKit and Chrome (the six states, per li);
- the fix: the rule, the corrected comment, and why the alternatives were not taken;
- red then green, and the suite counts;
- the after tables and the PASS and FAIL lines of `summarize.mjs fix` and `board.mjs`, with the vertical consequence stated plainly: the removed step's row takes a live step's height, and the steps after it move 4 px down;
- the 12-check.sh result;
- the undrawn states and what the build does in each (the removed step closed, opened, and removed before the pen opened: each takes a live step's number column);
- noticed, not built: each li sizes its own number column, so from step 10 a two-figure number's words start one figure further right than steps 1 to 9 do, and a removed step among them gets one figure. This is as built and was not changed;
- the line "Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad";
- a "For the orchestrator" section with these points:
  - The executor has no ArtifactData, so the orchestrator closes bug-pen-removed-step-words-shift-left.
  - Board P12_PenStepOrder's pm-removed panel still draws the removed step as built. A board spec that 261123-ghk writes over pm-removed must not hold the removed step's number or body box against it, unless Sid first redraws the panel to the fixed state.
  - A dist built from this commit is safe to deploy once the suite and GATE2 pass. There is no store change and no export-first need.
  - The scratch evidence is under $S, not in the repo.
Commit the SUMMARY last, by explicit path: `docs: summary for the removed step's number column in the pen`.

Executor rules for this whole plan:
- Tests come first: a failing test commit before the change commit.
- Stage explicit paths only. Never use `git add -A` or `git add .`. A designer commits sketch files on main at the same time, so never stage anything under .planning/sketches or .planning/canvas-generators, and never run a script that writes there.
- Never write app/dist, never start a Vite dev or preview server, and leave port 4173 alone.
- Do not touch .planning/state.json or .planning/STATE.md.
- Commit messages are plain English.
- Keep the change surgical: one CSS rule, one comment, two tests. No token, no store, domain or gate change.
  </action>
  <verify>
    <automated>node "${TMPDIR:-/tmp}/sprinkles-ghg/summarize.mjs" fix before after</automated>
    <automated>node "${TMPDIR:-/tmp}/sprinkles-ghg/board.mjs" "${TMPDIR:-/tmp}/sprinkles-ghg/after"</automated>
    <automated>npm --prefix app test</automated>
    <automated>sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh</automated>
    <automated>grep -c "Device-unverified" .planning/quick/261123-ghg-bug-pen-removed-step-words-shift-left-mark-answered-fix-it-i/261123-ghg-SUMMARY.md # [HEAD=error:2 EXPECT>=1 @fa19967d]</automated>
  </verify>
  <done>In WebKit and in Chrome, a removed step's words start at the live steps' x, closed, open, and removed before the pen opened. Its number cell is empty and one figure wide. No live step, Show changes box or reading box moved sideways. The app's removed step matches the board's live-step figures. The full suite passes, and 12-check.sh ends GATE2 PASS, or the SUMMARY names the step that stopped it and gives that step's output. The SUMMARY is committed last.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema are involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stylesheet to assistive technology | generated content could reach a screen reader as a step number |
| scratch scripts to the repo | measurement scripts copied from the repo could write evidence back into it |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ghg-01 | Spoofing (a false step number) | app.css .method-step__n:empty::before | low | mitigate | The generated figure is visibility hidden, which keeps it out of the accessibility tree, and its cell carries aria-hidden="true" (Method.jsx, unchanged). The cell's textContent stays '', and summarize.mjs checks that in every state |
| T-ghg-02 | Tampering (evidence) | .planning/canvas-generators/p12pm-capture*.json, .planning/sketches | low | mitigate | Only a scratch copy of the capture script runs, from $TMPDIR/sprinkles-ghg, where it writes its JSON. Task 1's verify checks that .planning/canvas-generators and .planning/sketches are unchanged, and staging is by explicit path |
| T-ghg-03 | Tampering (gate) | 12-check.sh and its probes | low | mitigate | No gate file is edited. A gate failure is reported with its output for the orchestrator, never loosened |
| T-ghg-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- Task 1's cause check passed in WebKit and Chrome before any repo change.
- Task 2 landed a failing stylesheet test commit before the fix commit. Method.jsx changed in comment lines only. tokens.css, the store and the domain are untouched.
- `summarize.mjs fix` and `board.mjs` pass in both engines: the removed step's words start at the live steps' x, and nothing else moved sideways.
- `npm --prefix app test` passes: 137 files and 4596 tests before, plus the new cases.
- 12-check.sh ends GATE2 PASS.
</verification>

<success_criteria>
- In the Next version pen a removed step's words line up with every other step's, in Playwright WebKit and Chrome at 1366, closed, open, and removed before the pen opened. The SUMMARY records this as device-unverified.
- The removed step's number stays empty (D-UAT-5), and the cell holds the number column's width.
- The change is one CSS rule and one corrected comment, held by a stylesheet test and a markup bound. No token, store, domain or gate change.
- The full suite and GATE2 pass.
</success_criteria>

<output>
Create `.planning/quick/261123-ghg-bug-pen-removed-step-words-shift-left-mark-answered-fix-it-i/261123-ghg-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
