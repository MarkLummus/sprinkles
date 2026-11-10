---
phase: quick-261110-abz
plan: 01
quick_id: 261110-abz
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
autonomous: true
requirements:
  - bug-record-pen-no-skipped-with-show-changes

must_haves:
  truths:
    - "With ?changes in the address on a saved child version, Record batch opens the record pen with a Skipped checkbox (aria-label 'Step N, skipped') and a Done differently control (aria-label 'Step N, done differently') on every live step, numbered 1 to N in the version's own order, exactly as it does without ?changes."
    - "In the record pen, and in the amend pen (Correct), which is the same mode 'recording', nothing on the Sheet draws a change: no removed step in Instructions, no struck-beneath paragraph, no struck margin number, no Removed group in the table, no struck value in the table or the Balance rules, and no as-made field on a line the version does not hold. The table and Instructions agree because both read one page-level value."
    - "The address keeps ?changes. Nothing strips it when a pen opens. When the pen closes (Cancel or Save batch), the Sheet shows the changes again and the toggle still reads Hide changes."
    - "The plan pen (Next version) is unchanged: every guard it reads already gives mode 'developing' precedence over Show changes (Method.jsx about line 589, IngredientTable.jsx about line 697, RecipeSheet.jsx lines 92, 161, 205 and 242), and IngredientTable reads diff only inside its show-changes branches."
    - "The reading view with no pen open draws Show changes exactly as before."
    - "The new test fails against the unfixed page at planning HEAD 4e678dfa, at the Step 1 skipped assertion, and passes with the fix. npm --prefix app test passes: 131 files and 4316 tests at planning, 4317 with the new test, more only if a sibling merged first."
  artifacts:
    - path: app/src/ui/RecipePage.jsx
      provides: "One page-level value that turns Show changes off while any pen is open, fed to both sheetView and RecipeSheet"
      contains: "const sheetShowsChanges = showingChanges && openPen === null;"
    - path: app/src/ui/RecipePage.perStep.test.jsx
      provides: "An end-to-end jsdom test that fails without the fix: Record batch over Show changes draws Skipped and Done differently on every step and no change marks, and Cancel shows the changes again"
      contains: "bug-record-pen-no-skipped-with-show-changes"
  key_links:
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/sheetView.js
      via: "sheetView receives showingChanges: sheetShowsChanges, so changeDiff, changeStaleSteps and the parent's baselineStepNumbers are null while a pen is open"
      pattern: "showingChanges: sheetShowsChanges"
    - from: app/src/ui/RecipePage.jsx
      to: app/src/ui/RecipeSheet.jsx
      via: "RecipeSheet receives showingChanges={sheetShowsChanges}, so methodSteps (line 92) is the reading method, and the table, Method and the Balance rules never see Show changes in a pen"
      pattern: "showingChanges=\\{sheetShowsChanges\\}"
---

<objective>
Fix bug-record-pen-no-skipped-with-show-changes (major; Mark approved it on Mark's List). With ?changes in the address, Record batch opens a pen whose steps draw as changes, with no Skipped and no Done differently controls. Nothing strips ?changes when a pen opens, and the toggle is not drawn while a pen is open, so the maker cannot get the controls back.

Root cause, read at planning HEAD 4e678dfa:
- RecipePage.jsx line 93 reads `showingChanges` straight from the address. Line 351 hands it to sheetView and line 458 hands it to RecipeSheet, whatever the mode.
- sheetView.js builds changeDiff whenever Show changes is on and the version has a read parent, in any mode.
- Method.jsx line 590 tests only the plan pen (isDeveloping) before Show changes. In mode 'recording' its show-changes branch wins, and that branch draws no StepRecordingControls.
- The siblings agree with Method in the wrong direction. RecipeSheet.jsx line 92 hands Method the unfiltered method, so the removed step is drawn as well. IngredientTable.jsx line 697 also tests only isDeveloping, so the table takes renderShowChangesEntry, and that path draws the Removed group with an as-made field on each removed line (line 1096). RecipeSheet.jsx lines 161 and 205 and FormulationNote's diff (line 242) read Show changes too, so the Balance rules strike parent figures in the record pen.

The fix, at one place (Claude's discretion, recorded):
- Show changes is the reading's own state. The page derives one value, sheetShowsChanges (Show changes in the address, and no pen open), and feeds it to both sheetView and RecipeSheet. All five guards then see Show changes off in every pen, so the table and Method agree by construction.
- Rejected alternative: add a recording test to each guard (Method.jsx 590, IngredientTable.jsx 697, RecipeSheet.jsx 92, 161, 205 and the FormulationNote diff at 242). That is six conditions in three files that must stay in step, which is exactly the disagreement the row warns about. It also edits Method.jsx, which sibling 261110-ac1 edits.
- The condition is openPen === null, not a test of mode 'recording' alone. It matches the rule the toggle already follows: VersionRow.jsx line 432 and IngredientsHead (IngredientTable.jsx line 505) both draw it only with no pen open. It covers the record and the amend pens, and it changes nothing in the plan pen (see must_haves). The full suite passed with it at planning in a scratch copy.
- ?changes is ignored in a pen, not stripped. The row asks that the pen draw its own steps "whether or not Show changes was on". Leaving the address alone means no history entry is pushed, and the change view comes back when the pen closes.
- VersionRow keeps the raw address value (line 402), since it names its own toggle, and that toggle is not drawn while a pen is open.

Adjacent "Step null" path (scope note only, not chased): with a hand-typed ?changes on a parentless version holding a removed step, the record pen printed "Step null" labels. Two things caused it: RecipeSheet.jsx line 92 handed Method the unfiltered method, and the removed step has no number in either map, so Method's fieldLabel (about lines 641-645) printed null. With this fix, the record and amend pens read readingVersion.method, where removed steps are absent, so that path is closed in both pens. The reading view with no pen open still hands Method the unfiltered method under a hand-typed ?changes on a parentless version. This fix leaves that as it is. It is outside this row, and the SUMMARY names it for Mark.

Purpose: with Show changes on, the maker can still record which steps were skipped or done differently. The record pen draws only the version as it stands.
Output: a new end-to-end test (committed first, red), then a two-line page fix (green). Two commits, both naming bug-record-pen-no-skipped-with-show-changes.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read by range, not whole:
- app/src/ui/RecipePage.jsx: 85-93 (the show-changes comment and the address read), 319-321 (openPen from derivePenState), 349-352 (the sheetView call), 387-460 (VersionRow at 393-424, RecipeSheet at 451-490).
- app/src/ui/sheetView.js: 34-100 (changeDiff, changeStaleSteps and baselineStepNumbers, each keyed on showingChanges).
- app/src/ui/RecipeSheet.jsx: 86-99 (methodSteps), 153-216 (the table and Method mounts).
- app/src/ui/Method.jsx: 586-602 (isDeveloping and isShowingChanges), 779-817 (the reading and recording branch with StepRecordingControls), 453-500 (StepRecordingControls and its aria-labels). Read only. This plan does not edit Method.jsx.
- app/src/ui/IngredientTable.jsx: 689-697 (isShowingChanges), 1094-1099 (renderEntry). Read only.
- app/src/ui/RecipePage.perStep.test.jsx: 1-185 (the jsdom harness: the mocked repository, mountAt, buttonByText, buttonByLabel, click, setValue, installMatchMedia and the afterEach), 380-399 (bodyEntries, headTexts and linesUnder, all module-level functions), 490-516 (the 'Show changes strikes a removed step' flow this test starts from), 750-771 (the Recording describe's band helper and its wait for the record pen's date input), 1040-1059 (the file's end). The new describe is appended at the very end of the file, because the comment at about lines 816-817 says plan 11-07 cites line numbers in this file, so no line above may move.

Facts read at planning HEAD 4e678dfa:
- Olive Oil v1 has 10 steps. Step 2's lead-in is 'Gum slurry — the only high-heat step'. Step 3's prose mentions "gum slurry" in lower case, so the test matches the full lead-in, never a bare 'Gum slurry'.
- At 393 (installMatchMedia), the record act is the band button '.notebook-version__acts .notebook-action', which reads 'Record batch' on a version with no batch. The Show changes toggle is IngredientsHead's text control, drawn only with no pen open.
- StepRecordingControls draws Checkbox (an input of type checkbox) with aria-label 'Step N, skipped', and a Done differently Button or textarea with aria-label 'Step N, done differently'. N comes from fieldLabel through currentStepNumbers.
- GraduatedRule (the Balance rules) and the table both strike with class struck-value. Method's show-changes branch uses prose-struck-beneath and method-step__n--struck.
- Gate baselines in RecipePage.jsx: `sheetShowsChanges` 0 times; `showingChanges={showingChanges}` 2 times (VersionRow, RecipeSheet); `parentVersion, showingChanges, batches, batchId` 1 time. RecipePage.perStep.test.jsx names the row id 0 times and has 37 tests, all passing. Full suite: 131 files, 4316 tests, all passing.
- A prototype of the test below ran at planning in a scratch copy of app/. Against the unfixed page: 1 failed and 37 skipped (with -t), failing at the Step 1 skipped assertion (expected null not to be null). With a fix to Method.jsx 590 and RecipeSheet.jsx 92 only, it still failed, at the no-struck-value assertion, so the test also guards the table and the Balance rules. With this plan's page fix: 38 of 38 in the file, and the full suite 131 files and 4317 tests.
- Siblings: 261110-ac2 edits RecipePage.jsx (about line 181, editState) and must not run in parallel with this item. 261110-ac1 edits Method.jsx, which this plan does not touch. No earlier sibling (261110-aby) touches these two files.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Record batch over Show changes draws the record pen's own steps and table (failing test first, then the page fix)</name>
  <files>app/src/ui/RecipePage.perStep.test.jsx, app/src/ui/RecipePage.jsx</files>
  <precondition>git status --porcelain app/src prints nothing, and npm --prefix app test passes before any edit. If it does not, stop and report: a dependency left it red.</precondition>
  <behavior>
    - New describe, appended at the end of RecipePage.perStep.test.jsx, titled "the record pen draws its own steps whether or not Show changes was on (bug-record-pen-no-skipped-with-show-changes)", with one it. Its own helpers live inside the describe: band() is the '.notebook-version__acts .notebook-action' button; sheet() is 'article.recipe-page'; asMadeLabels() returns the aria-labels of every '.ingredient-table .ingredient-table__as-made-field'. It reuses the module-level installMatchMedia, mountAt, VERSION_PATH, buttonByText, buttonByLabel, click, setValue, flush, store and headTexts.
    - Flow: installMatchMedia(); mount VERSION_PATH; click Next version; click the button labelled 'Step 2, remove'; set the Version name textarea to 'no slurry'; click Save as new version; flush until store.createVersion has a call; flush until the table and the Show changes button are present; click Show changes; flush until a Hide changes button is present. Precondition assertion: headTexts()[0] is 'RemovedGum slurry — the only high-heat step', which proves ?changes is on and the change view is drawn.
    - Then: band() reads 'Record batch'; click it; flush until an input of type date is present (the record pen is open).
    - Assert, in this order, so the RED failure names the bug first:
      1. sheet() holds an input of type checkbox with aria-label 'Step 1, skipped'.
      2. The '.method-steps > .method-step' items under sheet() number exactly 9. Item i (0-based) holds an input of type checkbox with aria-label 'Step {i+1}, skipped' and an element with aria-label 'Step {i+1}, done differently'.
      3. The '.method-region' text does not contain 'Gum slurry — the only high-heat step'.
      4. sheet() holds no element matching '.struck-value, .prose-struck-beneath, .method-step__n--struck' (this covers the table, its total and the Balance rules).
      5. No headTexts() entry starts with 'Removed'.
      6. asMadeLabels() is not empty, and none of its labels starts with 'Locust bean gum' (a line only the removed step held).
      7. No element in the container has an aria-label containing 'Step null'.
    - Then click the first button reading Cancel. Flush until a Hide changes button is present. Assert that no input of type date remains and that headTexts()[0] is again 'RemovedGum slurry — the only high-heat step'. This shows that the address kept ?changes and the change view came back.
    - Against the unfixed page this fails at assertion 1, because Method's show-changes branch draws no recording controls. With only Method and RecipeSheet line 92 fixed, it fails at assertion 4. With the page fix, it passes.
  </behavior>
  <action>
Constraints for the whole task: do not start vite dev or vite preview, and do not build into app/dist (Mark deploys main by hand). Stage only with git add of explicit paths, never -A, because untracked .review-diagnostics and quick-batches folders sit under .planning. Do not commit this PLAN or the SUMMARY. Commit messages are English. Each message is the subject line, a blank line, then these two attribution lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VWwTRRYFSwKmysy7Vh6Ai1

Step 0. Run `mkdir -p /private/tmp/sprinkles-261110-abz`. Write `git rev-parse HEAD` to /private/tmp/sprinkles-261110-abz/base-sha. Write the mtime of app/dist/index.html (stat -f %m) to /private/tmp/sprinkles-261110-abz/dist-mtime-before. Run npm --prefix app test and note the totals: 131 files and 4316 tests at planning, more if a sibling merged first.

Step 1, RED. Append the describe in the behavior block to the very end of app/src/ui/RecipePage.perStep.test.jsx, after the last closing line. Do not insert it anywhere else and do not move any line above it: plan 11-07 cites line numbers in this file. Put a comment of one or two lines above the describe. It names the row id bug-record-pen-no-skipped-with-show-changes and says, in words, that Show changes is the reading's own state, so the record pen draws its own steps and table while the address still holds the changes key. Browser-test input values stay English ('no slurry').
Run `npm --prefix app test -- RecipePage.perStep > /private/tmp/sprinkles-261110-abz/red.txt 2>&1`. It exits non-zero. Read red.txt: expect 1 failed and 37 passed, with the failure at assertion 1 (the Step 1 skipped checkbox is null). If the new test passes against the unfixed page, it is vacuous. Fix the test, never the app, and re-run into red.txt before going on. If it fails earlier, in the flow, because a step of the flow cannot find its control, fix the test's flow, not the app.
Commit the test file alone: `git add app/src/ui/RecipePage.perStep.test.jsx`, subject "test(261110-abz): Record batch over Show changes draws Skipped and Done differently on every step (bug-record-pen-no-skipped-with-show-changes)". Then run `git rev-parse HEAD > /private/tmp/sprinkles-261110-abz/test-sha`.

Step 2, GREEN. In app/src/ui/RecipePage.jsx (this implements the row's fix: the record pen draws its own steps with Skipped and Done differently whether or not Show changes was on):
- Directly above the sheetView call (about line 351), after the comment that introduces it, add one line that reads exactly `const sheetShowsChanges = showingChanges && openPen === null;`. Put a short comment above it, three or four lines in the file's voice. The comment says that Show changes is the reading's own state, so while any pen is open the Sheet draws that pen's own steps and table whether or not the address holds the changes key; that the address keeps the key, so the changes come back when the pen closes; that VersionRow names its toggle from the address itself, a toggle not drawn while a pen is open; and the row id bug-record-pen-no-skipped-with-show-changes. The comment quotes no code: no JSX prop and no assignment, because the verify counts those literals.
- In the sheetView call, replace the shorthand showingChanges argument with the named argument `showingChanges: sheetShowsChanges`. Leave every other argument as it is.
- In the RecipeSheet mount (about line 458), the prop becomes `showingChanges={sheetShowsChanges}`.
- Leave line 93, its comment, handleToggleShowChanges, and VersionRow's own prop (about line 402) exactly as they are. Do not edit Method.jsx, IngredientTable.jsx, RecipeSheet.jsx or sheetView.js: once the page feeds them sheetShowsChanges, their guards are correct as written.
Run `npm --prefix app test -- RecipePage.perStep` (38 passed), then `npm --prefix app test` (all green: 131 files and 4317 tests at planning, more only if a sibling merged first).
Commit the page alone: `git add app/src/ui/RecipePage.jsx`, subject "fix: the record pen draws its own steps with Skipped and Done differently while Show changes is on (bug-record-pen-no-skipped-with-show-changes)". Then run `git rev-parse HEAD > /private/tmp/sprinkles-261110-abz/fix-sha`.

Step 3. Write the SUMMARY at .planning/quick/261110-abz-bug-record-pen-no-skipped-with-show-changes-major-app-src-ui/261110-abz-SUMMARY.md and leave it uncommitted. It records:
- the RED run's totals and its failure line;
- the GREEN totals for the file and for the full suite, against 38 and 131/4317;
- both commit hashes;
- whether app/dist/index.html's mtime changed during the run (no command of this plan writes there);
- the design choice: one page-level value, openPen === null, ?changes ignored in a pen but not stripped, and Method.jsx, IngredientTable.jsx, RecipeSheet.jsx and sheetView.js untouched;
- the amend pen (Correct) is covered by the same condition, because it is mode 'recording' with openPen 'amend'. The new test drives Record batch only;
- the adjacent Step null path: closed in the record and amend pens. The reading view with no pen open, with a hand-typed ?changes on a parentless version holding a removed step, still hands Method the unfiltered method (RecipeSheet.jsx line 92). That is unchanged and outside this row; name it for Mark as a possible bug row, unverified, and do not fix it;
- Deferred Human Verification: none needed. The fix changes which existing branch draws, and the jsdom test drives the whole page. The orchestrator may batch a short iPad look if it chooses: on a saved child version, Show changes, then Record batch; expect Skipped and Done differently on every step.
  </action>
  <verify>
    <automated>D=/private/tmp/sprinkles-261110-abz && B=$(cat $D/base-sha) && T=$(cat $D/test-sha) && F=$(cat $D/fix-sha) && npm --prefix app test -- RecipePage.perStep && test "$(grep -cF 'const sheetShowsChanges = showingChanges && openPen === null;' app/src/ui/RecipePage.jsx)" -ge 1 && test "$(grep -cF 'showingChanges: sheetShowsChanges' app/src/ui/RecipePage.jsx)" -ge 1 && test "$(grep -cF 'showingChanges={sheetShowsChanges}' app/src/ui/RecipePage.jsx)" -ge 1 && test "$(grep -cF 'showingChanges={showingChanges}' app/src/ui/RecipePage.jsx)" -ge 1 && test "$(grep -cF 'bug-record-pen-no-skipped-with-show-changes' app/src/ui/RecipePage.perStep.test.jsx)" -ge 1 && test "$(git rev-list --count "$B..$F")" = 2 && test "$(git rev-list --count --grep='bug-record-pen-no-skipped-with-show-changes' "$B..$F")" = 2 && git diff --quiet "$B" "$T" -- . ':(exclude)app/src/ui/RecipePage.perStep.test.jsx' && git diff --quiet "$T" "$F" -- . ':(exclude)app/src/ui/RecipePage.jsx' && npm --prefix app test</automated>
  </verify>
  <done>
Baselines at planning HEAD 4e678dfa (every count gate below fails there):
- RecipePage.jsx: `const sheetShowsChanges = showingChanges && openPen === null;` goes from 0 to 1; `showingChanges: sheetShowsChanges` from 0 to 1; `showingChanges={sheetShowsChanges}` from 0 to 1; `showingChanges={showingChanges}` from 2 to 1 (VersionRow keeps it).
- RecipePage.perStep.test.jsx names bug-record-pen-no-skipped-with-show-changes 0 times at planning and at least once after. It holds 37 tests at planning and 38 after, all passing.
- The RED run had 1 failed and 37 passed, at the Step 1 skipped assertion. The test commit (test-sha) changes only the test file, so it carries the unfixed page.
- The full suite passes at 131 files and 4317 tests, or more if a sibling merged first.
- Exactly two commits from base-sha to fix-sha, test then fix, both naming bug-record-pen-no-skipped-with-show-changes, each touching only its one file. So Method.jsx, IngredientTable.jsx, RecipeSheet.jsx and sheetView.js are unchanged. The SUMMARY is written and uncommitted.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| address to page state | The changes search parameter is set by the toggle or typed by hand. RecipePage reads its presence alone, never its value |
| record pen to batch record | What the record pen draws decides what the maker can write into the batch's stepChanges and asMade through useBatchRecording and the repository seam |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261110-abz-01 | Tampering | RecipePage.jsx's sheetShowsChanges, between the address and sheetView and RecipeSheet | low | mitigate | A changes key in the address can no longer change what any pen draws: sheetShowsChanges is false whenever openPen is not null, so the record and amend pens always draw StepRecordingControls and the as-made fields over the version's own live rows. The new perStep test pins it end to end |
| T-261110-abz-02 | Tampering | the batch record's asMade and stepChanges written from the record pen | low | mitigate | With the fix the table takes its reading branch in a pen, so no as-made field is drawn for a line the version does not hold (the test asserts there is no Locust bean gum field), and a skipped step can be recorded again. The draft's existing parsing and the one save gate are unchanged |
| T-261110-abz-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed or upgraded |
</threat_model>

<verification>
- Task 1's automated command passes as written.
- `git log --format=%s` over the pinned range base-sha..fix-sha shows the test commit, then the fix commit, both naming bug-record-pen-no-skipped-with-show-changes. `git show --stat` on test-sha and on fix-sha each lists only its one file.
- No vite dev or vite preview process was started, and nothing was built into app/dist.
</verification>

<success_criteria>
- With Show changes on, Record batch (and Correct) opens a pen that draws Skipped and Done differently on every live step, with no change marks in Instructions, the table or the Balance rules.
- Closing the pen brings the change view back, because the address still holds ?changes. The plan pen and the reading view are unchanged.
- The new test fails without the fix (shown by the RED run) and passes with it. The full suite is green. Only RecipePage.jsx and RecipePage.perStep.test.jsx changed.
</success_criteria>

<output>
Create `.planning/quick/261110-abz-bug-record-pen-no-skipped-with-show-changes-major-app-src-ui/261110-abz-SUMMARY.md` when done (left uncommitted for the orchestrator).
</output>
