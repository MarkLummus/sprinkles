---
phase: quick-261122-tqj
plan: 01
quick_id: 261122-tqj
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientTable.creating.test.jsx
  - .planning/quick/261122-tqj-bug-p12-add-ingredient-same-name-on-an-ingredient-split-acro/261122-tqj-SUMMARY.md
autonomous: true

must_haves:
  truths:
    - "In the creation editor, a row split across steps has one Add ingredient per line. Each one is named 'Add ingredient after <name> in step <N>', where N is the line's shown step number. The Move up and Move down on the same line already carry that suffix, read from the same inStep value"
    - "A row with one line keeps the name 'Add ingredient after <name>', with no step, as built. That covers a row in no step and a row in one step"
    - "No two per-line controls on the creating table share an accessible name: Move up, Move down, Add ingredient and the grams field. The Remove buttons are left out, as built, because each one removes the whole row"
    - "The button still reads 'Add ingredient' on screen, and its name still starts with those words (Label in Name). A press still calls onAddRowAfter(rowId, the line's step), as before"
  artifacts:
    - path: "app/src/ui/IngredientTable.jsx"
      provides: "RowActs names a split line's Add ingredient by its step"
      contains: "Add ingredient after ${name}${inStep}"
    - path: "app/src/ui/IngredientTable.creating.test.jsx"
      provides: "The split-row Add ingredient names pinned by step, and the per-line no-shared-name check extended to Add ingredient"
      contains: "Add ingredient after ${WHOLE_MILK} in step 1"
  key_links:
    - from: "app/src/ui/IngredientTable.creating.test.jsx"
      to: "app/src/ui/IngredientTable.jsx"
      via: "aria-label of [data-act=\"add-ingredient\"] on lines milk-row:1 and milk-row:2 of a split row; RowActs reads stepNumber (isSplit ? displayNumber : null) into inStep"
      pattern: "Add ingredient after \\$\\{name\\}\\$\\{inStep\\}"
  prohibitions:
    - statement: "MUST NOT change any visible word, the Remove names, the Move names, the Add to step or chooser names, CreationPage.jsx, a sketch file or the sketch 016 CONTRACT"
      verification: test
    - statement: "MUST NOT build into app/dist or start a Vite process. This item needs no browser run"
      verification: test
---

<objective>
Fix the Mark's List row bug-p12-add-ingredient-same-name, which is code review WR-01 in 12-REVIEW.md and an anti-pattern row in 12-VERIFICATION.md.

The bug: RowActs in app/src/ui/IngredientTable.jsx renders once for each line of a row. A row ticked into two steps therefore shows two Add ingredient buttons, and both carry the same accessible name. They do different things: one lands the pick in step 1, the other in step 2 (onAddAfter passes portion.step). A screen reader user hears two identical controls. Voice control cannot pick one of them.

The fix: name Add ingredient by step, as the Move up and Move down on the same line already are. RowActs already computes the suffix as inStep (line 296), from stepNumber, which the caller sets only for a split line (line 888). Add ingredient takes the same suffix.

Test first. Task 1 changes the two existing tests that pin the shared name or leave Add ingredient out, and shows they fail. Task 2 is the one-template fix.

Out of scope, so it is not touched:
- The Remove buttons. They share a name across a split row's lines on purpose: each one removes the whole row, and the test at IngredientTable.creating.test.jsx:291-303 pins that.
- Sibling 261122-tqm. It changes picker Cancel focus in CreationPage.jsx and does not touch these two files.
- Sketch 016 CONTRACT line 58 ("Add ingredient after <row>"). It is read here as covering a split line's "<row> in step N", the rule the Move buttons follow. Nothing in the sketch is edited.

Output: one test commit (red), then one fix commit (green), then the SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/IngredientTable.jsx
@app/src/ui/IngredientTable.creating.test.jsx
@.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-REVIEW.md

<interfaces>
These are read at b06add6f. Line numbers may move; find each place by its name.
- app/src/ui/IngredientTable.jsx:240-250 is the comment above RowActs. It says every line of a split row carries Remove, "and names its Move controls by step so no two share a name".
- app/src/ui/IngredientTable.jsx:296, inside RowActs: inStep is ' in step N' when stepNumber is not null, and an empty string otherwise.
- app/src/ui/IngredientTable.jsx:307-315 is the Add ingredient Button: data-act="add-ingredient", aria-keyshortcuts="Meta+Enter Control+Enter", onClick={onAddAfter}, visible text "Add ingredient". Its aria-label template is at line 310 and holds the name only.
- app/src/ui/IngredientTable.jsx:320 and :331 are the Move up and Move down aria-labels. Their templates end with the name and then inStep. Read them as the pattern to copy.
- app/src/ui/IngredientTable.jsx:885-896, the call site: stepNumber={isSplit ? displayNumber : null} and onAddAfter={() => creationRows.onAddRowAfter(row.id, portion.step)}.
- A split row's lines are always in steps. rowLines (app/src/domain/creationSteps.js:109-114) gives one line for step 0 (UNPLACED_STEP) only when the row is in no step at all. So inStep is never empty on a split line, and every split line gets a distinct name.
- In the test file:
  - :231-349 is the describe block 'a row in two steps reads one line per step'. Its splitDraft puts milk at 400 g in step 1 and 200 g in step 2, with sucrose in no step. That makes three lines: milk-row:1, milk-row:2 and sucrose-row:0.
  - :275-289 is the test "names each line's Move controls and grams field by its step, so no two share a name". It collects 'tbody [data-act^="move-"], tbody textarea', expects toHaveLength(3 * 2 + 3), and expects a Set of the same size.
  - :411-428 is the test "Add ingredient asks for the pressed line's row and group...". It mounts threeRows with milk also ticked into step 2. At :415-416 it expects both lines' aria-label to be the plain name. That pins the defect.
  - :386-403 is the Label in Name test. Its milk row is one line (threeRows alone), so the name it expects at :392 stays as it is.
- Baseline at b06add6f: `npm --prefix app test -- src/ui/IngredientTable.creating.test.jsx` gives 37 passed (37).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Red. Pin a split row's Add ingredient names by step, and add Add ingredient to the no-shared-name check</name>
  <files>app/src/ui/IngredientTable.creating.test.jsx</files>
  <read_first>app/src/ui/IngredientTable.creating.test.jsx lines 231-349 and 351-428; app/src/ui/IngredientTable.jsx lines 240-345</read_first>
  <behavior>
    - On a split row (milk in steps 1 and 2), line milk-row:1's Add ingredient is named "Add ingredient after Whole milk, 3.5% fat in step 1". Line milk-row:2's is named "Add ingredient after Whole milk, 3.5% fat in step 2".
    - A one-line row's Add ingredient keeps the plain name. In the same mount, cream-row:0 (in no step) reads "Add ingredient after Heavy cream, 36% fat".
    - Across splitDraft's three lines, the Move up, Move down, Add ingredient and grams-field names (12 controls) are all distinct.
  </behavior>
  <action>
Edit the test file only. Make no change under app/src other than this file.

Before the first edit, pin the base: create the folder ${TMPDIR:-/tmp}/sprinkles-tqj and write the output of git rev-parse HEAD to the file BASE in it.

(1) In the test at :411-428:
- Change the expectation at :415 to the step-1 name: the WHOLE_MILK template followed by ' in step 1'.
- Change the expectation at :416 to the same with ' in step 2'.
- Add one expectation that control('cream-row:0', 'add-ingredient') has the aria-label 'Add ingredient after Heavy cream, 36% fat'. This holds the one-line case in the same mount.
- Append ', each named by its step (bug-p12-add-ingredient-same-name)' to the test title, inside the closing parenthesis group or just before it. Keep the existing words.
- Leave the press and onAddRowAfter assertions as they are.

(2) In the test at :275-289:
- Widen the selector to 'tbody [data-act^="move-"], tbody [data-act="add-ingredient"], tbody textarea'.
- Change toHaveLength to (3 * 3 + 3).
- Change the comment above it to name each Move button, each Add ingredient and each grams field. Keep the sentence that leaves the removes out because each removes the row.
- Change the title to "names each line's Add ingredient, Move controls and grams field by its step, so no two share a name".

Leave the Label in Name test (:386-403) and the remove test (:291-303) unchanged.

Run the file and confirm it fails for the defect, not for a typo. Exactly two tests fail:
- The :411 test fails on the step-1 name. It received the plain name.
- The :275 test fails on the Set size: 11 distinct names out of 12.
Everything else still passes.

Commit only the test file. Message: "test(261122-tqj): a split row's Add ingredient is named by its step, red until the fix (bug-p12-add-ingredient-same-name)". Then write the output of git rev-parse HEAD to ${TMPDIR:-/tmp}/sprinkles-tqj/RED.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/IngredientTable.creating.test.jsx 2>&1 | grep -E 'Tests +2 failed \| 35 passed \(37\)'   [HEAD: 37 passed. EXPECT: the line matches, so exit 0]</automated>
    <automated>grep -v '^ *//' app/src/ui/IngredientTable.creating.test.jsx | grep -cF 'Add ingredient after ${WHOLE_MILK} in step'   [HEAD=0 EXPECT==2]</automated>
    <automated>grep -v '^ *//' app/src/ui/IngredientTable.creating.test.jsx | grep -cF 'tbody [data-act="add-ingredient"]'   [HEAD=0 EXPECT==1]</automated>
    <automated>git diff --name-only "$(cat "${TMPDIR:-/tmp}/sprinkles-tqj/BASE")" "$(cat "${TMPDIR:-/tmp}/sprinkles-tqj/RED")"   [EXPECT: exactly app/src/ui/IngredientTable.creating.test.jsx]</automated>
  </verify>
  <done>The two edited tests fail on the shared name and the other 35 pass. The red commit holds the test file alone.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Green. Name Add ingredient by step, as Move up and Move down are</name>
  <files>app/src/ui/IngredientTable.jsx</files>
  <read_first>app/src/ui/IngredientTable.jsx lines 240-345 (the RowActs comment and body)</read_first>
  <behavior>
    - The two tests that Task 1 turned red now pass. The whole file reads 37 passed (37).
    - The full suite has no failure. That includes app/src/ui/tabindex-scan.test.js, because the button still renders through Button.jsx.
  </behavior>
  <action>
Fix bug-p12-add-ingredient-same-name, as review WR-01 recommends.

In RowActs, on the Add ingredient Button (data-act="add-ingredient"), change the aria-label template so that inStep follows the name, exactly as on the Move up and Move down below it. The result reads Add ingredient after ${name}${inStep}. Reuse the inStep const the function already declares. Add no new const, prop or helper.

In the comment above RowActs (:240-250), change the clause that says a split line "names its Move controls by step so no two share a name". It must now say the line names its Add ingredient and Move controls by step. Keep the rest of the comment as it is.

Change nothing else:
- the visible word
- aria-keyshortcuts
- onClick
- the Add to step and chooser names
- the Remove name
- CreationPage.jsx

Run the file, then the full suite. Commit IngredientTable.jsx alone. Message: "fix(261122-tqj): Add ingredient on a split line is named by its step, as Move is (bug-p12-add-ingredient-same-name, WR-01)".

Write the SUMMARY, and include:
- the red and green test counts
- the full-suite file and test counts
- that VoiceOver and Voice Control were not run, so nothing is device-verified
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/IngredientTable.creating.test.jsx 2>&1 | grep -E 'Tests +37 passed \(37\)'   [after Task 1: 2 failed. EXPECT: the line matches]</automated>
    <automated>npm --prefix app test 2>&1 | tail -6 | grep -E 'Tests +[0-9]+ passed' | grep -v failed   [baseline before the batch: 136 files, 4538 tests passing. EXPECT: no failed count]</automated>
    <automated>grep -v '^ *//' app/src/ui/IngredientTable.jsx | grep -cF 'Add ingredient after ${name}${inStep}`'   [HEAD=0 EXPECT==1]</automated>
    <automated>grep -v '^ *//' app/src/ui/IngredientTable.jsx | grep -cF 'Add ingredient after ${name}`'   [HEAD=1 EXPECT==0]</automated>
    <automated>git diff --name-only "$(cat "${TMPDIR:-/tmp}/sprinkles-tqj/RED")" HEAD -- app   [EXPECT: exactly app/src/ui/IngredientTable.jsx]</automated>
    <automated>git diff --name-only "$(cat "${TMPDIR:-/tmp}/sprinkles-tqj/BASE")" HEAD -- app   [EXPECT: exactly app/src/ui/IngredientTable.jsx and app/src/ui/IngredientTable.creating.test.jsx]</automated>
  </verify>
  <done>A split row's two Add ingredient buttons read "... in step 1" and "... in step 2" to a screen reader, and a one-line row's name is unchanged. The creating-table file passes 37 of 37, and the full suite has no failure. The fix commit holds IngredientTable.jsx alone.</done>
</task>

</tasks>

<threat_model>
ASVS level 1; block on high. This plan calls no external API, pushes no schema and installs no package.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored row to screen | An ingredient name comes from the library or from an imported store file. It goes into an aria-label attribute. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-tqj-01 | Tampering | ingredient name interpolated into the Add ingredient aria-label | low | mitigate | No new text path. React sets the name as an attribute string. The suffix is a number from displayNumbers and never maker text. There is no dangerouslySetInnerHTML (the project rule holds). |
| T-tqj-02 | Tampering | a stray build overwriting app/dist, which Mark serves | low | mitigate | The plan runs only Vitest. It builds nothing and starts no Vite process. |
| T-tqj-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package. |
</threat_model>

<verification>
- Each task's verify lines pass. Task 1's red count is seen before Task 2 starts.
- The two commits are red, then green, and each holds exactly one file under app/.
- No visible word changed. The Label in Name test still passes.
- Nothing is claimed as device-verified. A screen reader reading of a split row on the iPad was not done.
</verification>

<success_criteria>
On a row split across steps, a screen reader or voice-control user can tell each line's Add ingredient apart by its step, the same way they tell its Move buttons apart. Every other name and word on the table is unchanged. The test that pinned the shared name now pins the step names, and the no-shared-name check covers Add ingredient.
</success_criteria>

## For the orchestrator after the SUMMARY (executors have no ArtifactData)

- Mark's List: close `bug-p12-add-ingredient-same-name` after the merge.
  - Set `status: "done"`.
  - Set `resolvedAt` from `date -u +%Y-%m-%dT%H:%M:%S.000Z`, read just before the write.
  - Add a one-line `reply`, such as "Each line's Add ingredient now says its step, as Move does; not checked with VoiceOver."
  - Use `if_version` from a read.
- 12-REVIEW-DISPOSITION.md: WR-01 can move from `open` to `fixed`. This plan leaves the file alone, because the review gate regenerates it and parallel items should not share it. The anti-pattern row for IngredientTable.jsx:309-316 in 12-VERIFICATION.md goes stale with this fix.
- Deploy after this item: safe. Only an accessible name changes. There is no store shape, DB_VERSION or store file version change.

<output>
Create `.planning/quick/261122-tqj-bug-p12-add-ingredient-same-name-on-an-ingredient-split-acro/261122-tqj-SUMMARY.md` when done
</output>
