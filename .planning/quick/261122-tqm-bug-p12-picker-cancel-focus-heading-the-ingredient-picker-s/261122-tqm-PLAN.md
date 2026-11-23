---
phase: quick-261122-tqm
plan: 01
quick_id: 261122-tqm
type: execute
wave: 2
depends_on: ["261122-tqj"]
files_modified:
  - app/src/ui/CreationPage.jsx
  - app/src/ui/CreationFlow.test.jsx
  - .planning/quick/261122-tqm-bug-p12-picker-cancel-focus-heading-the-ingredient-picker-s/261122-tqm-SUMMARY.md
autonomous: true
requirements:
  - bug-p12-picker-cancel-focus-heading

must_haves:
  truths:
    - "In the creation editor, a row's Add ingredient opens the picker, the row is then placed into a step with Add to step, and the picker's Cancel puts focus on that row's Add ingredient on its line in the step, not on the heading's Add ingredient"
    - "A row's Add ingredient opens the picker, the row is then unticked through its step's Change ingredients, and Cancel puts focus on that row's Add ingredient under Not in a step yet"
    - "Cmd+Return in a row's grams opens the picker, the row is then placed into a step, and Cancel puts focus in that row's grams on its line in the step"
    - "A row's Add ingredient opens the picker, the row's step is then removed, and Cancel puts focus on that row's Add ingredient where the row now stands"
    - "The heading's Add ingredient takes focus on Cancel only when the row that opened the picker is gone from the draft, or when the heading opened the picker"
    - "When the line the picker was opened from still stands, Cancel goes back to that line even if the row has gained another line before it. The two existing Cancel cases (unmoved row, and the row's Add to step chooser open) pass unchanged"
    - "Nothing else changes: no on-screen words, no wording or label in IngredientTable.jsx, no store, domain or style file, and the focus effect's lookup code is untouched (only two of its comments change)"
  artifacts:
    - path: app/src/ui/CreationPage.jsx
      provides: "openerLine(draft, rowId, group): the line key the picker's opener stands on now. handleCancelPicker builds its row and grams focus requests from it against the committed draft at the press"
      contains: "function openerLine"
    - path: app/src/ui/CreationFlow.test.jsx
      provides: "Six cases in a describe named for bug-p12-picker-cancel-focus-heading, nested in the Add ingredient on a row describe. Four were red at the base, two are guards"
      contains: "bug-p12-picker-cancel-focus-heading"
  key_links:
    - from: app/src/ui/CreationPage.jsx
      to: app/src/domain/creationSteps.js
      via: "openerLine checks draft.rows for the row id before it calls rowLines (which throws a RangeError for a missing row), then keeps the pressed group when it is among rowLines' steps, else takes rowLines' first step"
      pattern: "rowLines\\(draft, rowId\\)"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/CreationPage.jsx
      via: "handleCancelPicker writes { kind: 'picker-opener', line } or { kind: 'row-grams', line } with line from openerLine. The focus effect's existing branches look the line up by tr[data-line] and fall back to the heading's Add ingredient when it is not drawn"
      pattern: "openerLine\\(createDraft"
---

<objective>
Close bug-p12-picker-cancel-focus-heading (state machine audit 2026-11-22, item 3, with the same shape in 23e and 25c). In the creation editor the ingredient picker's Cancel returns focus to what opened it (CONTRACT section 11, 9a). `handleCancelPicker` (app/src/ui/CreationPage.jsx:449-455) builds the opener's line key from the anchor stored when the picker opened: the row id and the group it was pressed in. When the row has since moved, that line is no longer drawn, and the focus effect's lookup (:334-348) falls to the heading's Add ingredient. The row can move by being placed into a step with Add to step, by being unticked through Change ingredients, or by having its step removed. The grams opener (Cmd+Return in the row's grams, :343-348) has the same shape. After the fix, Cancel resolves the row's current line at the press. The heading stays the fallback only when the row is gone.

Purpose: Cancel lands on the control the maker pressed, on the row where it now stands, as it already does for a row that has not moved.
Output: one small module-level helper and two changed request lines in CreationPage.jsx, two comments in the focus effect brought up to date, six new cases in CreationFlow.test.jsx, a green full suite, a scratch build and the SUMMARY.

Decisions taken in this plan (Claude's discretion, within the item's wording):
- Resolve at the press, in the handler, against the committed draft. The draft is the one the screen shows, as handleRemoveRow already reads it. The item says "at Cancel time". Cancel is a click on the picker's own Cancel, so no draft change is batched with it.
- When the line the picker was opened from still stands, keep it, even if the row gained or lost another line. This is the existing behaviour for an unmoved row, and case E pins it on a row that also gained a line.
- When that line is gone but the row is still on the draft, use the row's first line in method order. This is the rule focusLine (:597-600) already uses for a just-picked row.
- When the row is gone, the handler passes the line as it was pressed. That line is not drawn, so the effect's existing heading fallback takes it. The heading fallback therefore stays in one place, and the effect's lookup code does not change.
- The heading opener is unchanged: it still writes 'ingredient-target'.
- A consequence to record: when the opener row's step is removed while the picker is open, Cancel now lands on the row's Add ingredient. Before, it landed on the heading's. It is the same rule (the row moved) and case F pins it.
- No browser walk. The item asks for a test first. The audit already reproduced the defect in Playwright WebKit and Chromium at 1366. The jsdom cases assert `document.activeElement` identity through the same focus effect the browser runs. The fix changes only which line key that effect is given. The SUMMARY records this.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

Read by range, not whole. Line numbers are HEAD's at planning time (b06add6f). Sibling item 261122-tqj lands before this one and may add tests to CreationFlow.test.jsx and change an aria-label in IngredientTable.jsx. Find the ranges below by their text if they have shifted. The new cases select buttons by data-act and data-line, never by an Add ingredient aria-label, so tqj's label change cannot break them.
- app/src/ui/CreationPage.jsx: anchorHolds and its comment (lines 53-60), the focus effect's picker-opener and row-grams branches (lines 334-348), the picking state comment (lines 213-218), handleAddRowAfter and handleCancelPicker with their comments (lines 436-456), handleRemoveRow (lines 466-475) for how a handler reads createDraft, and focusLine (lines 597-600).
- app/src/domain/creationSteps.js: UNPLACED_STEP (line 24, the value 0), groupRows (lines 93-101), rowLines (lines 103-114, throws through assertRow for a row that is not on the draft), toggleStepUses and placeRow (lines 205-229). Read only.
- app/src/ui/IngredientTable.jsx: the creating row, keyed and data-line'd `${row.id}:${portion.step}`, with its grams textarea and its Cmd+Return opener (lines 826-905), and RowActs' add-ingredient button (lines 296-315). Read only.
- app/src/ui/CreationFlow.test.jsx: harness helpers (lines 122-219), the keydown helper shape (lines 2409-2416), and the describe "Add ingredient on a row lands the pick right after it" (lines 2622-2804), with its helpers headingAdd, rowAdd, pickerCancel, pickerName, gramsField, usesBox and groups, seed() (Sucrose and Whole milk in Step 1, whose key is 1; Heavy cream and Fine sea salt in no step), the two Cancel cases (lines 2736-2755) and the anchor-left-its-group describe (lines 2757-2803).
- .planning/state-machines/2026-11-22-audit.md item 3 (lines 93-102) and rows 23 and 25 (lines 60 and 62).
- Do not edit: app/src/ui/IngredientTable.jsx, IngredientPicker.jsx, CreationSteps.jsx, app/src/domain/, app/src/store/ (DB_VERSION included), app/src/styles/, app/dist, any on-screen word or exported string. Do not touch the heading's words, which the designer is redrawing. Leave the preview on port 4173 alone and start no dev server.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: RED: six Cancel cases, four of which fail on the moved-row focus at the base</name>
  <files>app/src/ui/CreationFlow.test.jsx</files>
  <read_first>
    - app/src/ui/CreationFlow.test.jsx (lines 122-219, 2409-2416, 2622-2804)
    - app/src/ui/CreationPage.jsx (lines 334-348, 436-456)
    - app/src/ui/IngredientTable.jsx (lines 296-315, 826-905)
  </read_first>
  <behavior>
    Add one describe nested inside "Add ingredient on a row lands the pick right after it (STRUCT-05, D-09, …)". Place it after the anchor-left-its-group describe closes and before the outer describe closes. Name it "the picker's Cancel finds the opener row where it stands now (bug-p12-picker-cancel-focus-heading)". It reuses the outer describe's seed, rowAdd, headingAdd, pickerCancel, pickerName, gramsField, usesBox and groups, and the file's click, field and flush. Add one local helper only: an async keydown(element, init) shaped like the one at lines 2409-2416. It dispatches a bubbling, cancelable KeyboardEvent('keydown') with key 'Enter' and init inside act, then awaits flush(). "Line key" below means the data-line attribute of the tr that holds the focused element, read with closest('tr'). UNPLACED_STEP is 0 and seed's step key is 1.
    - A, red at the base. Call seed(), then click rowAdd(CREAM). Click the Heavy cream row's [data-act="add-to-step"], then its [data-act="choose-1"]. Expect the picker still open and groups()[0].names to equal [SUGAR, MILK, CREAM]. Click pickerCancel(). Expect the picker closed. Expect document.activeElement to be rowAdd(CREAM) and not headingAdd(), and its line key to end with ':1'.
    - B, red at the base. Call seed(), then click rowAdd(SUGAR). Click field('Step 1, change ingredients'), then usesBox(1, SUGAR) to untick it. Expect groups()[0].names to equal [MILK] and groups()[1].names to contain SUGAR. Click pickerCancel(). Expect document.activeElement to be rowAdd(SUGAR) and not headingAdd(), and its line key to end with ':0'.
    - C, red at the base. Call seed(). Inside act, focus gramsField(CREAM). Call keydown(gramsField(CREAM), { metaKey: true }). Expect the picker open and document.activeElement to be pickerName(). Click the Heavy cream row's add-to-step, then choose-1. Click pickerCancel(). Expect document.activeElement to be gramsField(CREAM) and not headingAdd(), and its line key to end with ':1'.
    - F, red at the base. Call seed(), then click rowAdd(SUGAR). Click field('Step 1, remove'). Expect groups() to equal [{ head: null, names: [SUGAR, MILK, CREAM, SALT] }]. Click pickerCancel(). Expect document.activeElement to be rowAdd(SUGAR) and not headingAdd().
    - D, a guard that passes at the base. Call seed(), then click rowAdd(CREAM). Click the Heavy cream row's [data-act="remove"]. Click pickerCancel(). Expect the picker closed and document.activeElement to be headingAdd().
    - E, a guard that passes at the base. Call seed(), then click rowAdd(SUGAR); Sucrose has one line, in Step 1 (key 1). Click the Instructions heading's Add step, root().querySelector('.method-region .mk-head-act'). The new step goes first: it is drawn as Step 1 and the original step as Step 2. Click field('Step 1, change ingredients'), then usesBox(1, SUGAR) to tick it, so Sucrose now has two lines, the new step's first. Expect groups() to equal [{ head: 'Step 1', names: [SUGAR] }, { head: 'Step 2', names: [SUGAR, MILK] }, { head: 'Not in a step yet', names: [CREAM, SALT] }]. Click pickerCancel(). Collect every tr[aria-label^="Sucrose,"] button[data-act="add-ingredient"] in document order. Expect document.activeElement to be the second of them, and its line key to end with ':1'.
  </behavior>
  <action>
    First record the base. Create the directory "${TMPDIR:-/tmp}/sprinkles-tqm" and write the output of `git rev-parse HEAD` into a file named BASE inside it. Task 3's scope gates diff against it.

    Write cases A, B, C, F, D and E exactly as in the behavior block, in that order, with plain English case names that say what the maker did and where focus lands. Do not change any existing case, helper or seed. A line in the behavior block that only checks the setup (the groups() checks, and pickerName() in C) describes the drawn state at the base. If one of them differs from what is drawn, record the drawn value in the SUMMARY and correct only that setup line. Never change a focus expectation to make a case pass or fail.

    Run `npm --prefix app test -- src/ui/CreationFlow.test.jsx -t "bug-p12-picker-cancel-focus-heading"` against the unchanged CreationPage.jsx. The expected result is exactly four failures (A, B, C and F) and two passes (D and E). Each of the four must fail on its document.activeElement expectation, with focus on the heading's Add ingredient. Copy the four assertion messages into the SUMMARY as red evidence. STOP AND REPORT, without bending a case to force red, if any of the four fails for another reason, if any of them passes at the base, or if D or E fails at the base.

    Commit only the test file as `test(261122-tqm): Cancel cases for a picker whose opener row moved (bug-p12-picker-cancel-focus-heading)`. Write the commit message in English. End it with the attribution lines your own system reminder gives. If it gives none, end it with these two lines:
    Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01VWwTRSNw8tGVgeHqypcMwH
  </action>
  <verify>
    <automated>OUT="$(npm --prefix app test -- src/ui/CreationFlow.test.jsx -t 'bug-p12-picker-cancel-focus-heading' 2>&1)"; printf '%s\n' "$OUT" | grep -E 'Tests +4 failed [|] 2 passed' && test "$(grep -c 'bug-p12-picker-cancel-focus-heading' app/src/ui/CreationFlow.test.jsx)" -ge 1 && test -s "${TMPDIR:-/tmp}/sprinkles-tqm/BASE"</automated>
    Baselines: slug in CreationFlow.test.jsx [HEAD=0 EXPECT>=1]; failing cases in the filtered run at the base [HEAD=0 EXPECT==4]; passing cases in it [HEAD=0 EXPECT==2]. Vitest prints the line as "Tests  4 failed | 2 passed | N skipped (M)" (format checked at planning time on this file, which then held 130 cases). The gate is meant to hold only while CreationPage.jsx is unchanged. After Task 2 the same run reads 6 passed.
  </verify>
  <done>The six cases are written and committed. At the base, A, B, C and F fail on focus landing on the heading's Add ingredient, and D and E pass. The four messages are recorded for the SUMMARY.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: GREEN: Cancel resolves the opener row's current line at the press</name>
  <files>app/src/ui/CreationPage.jsx</files>
  <read_first>
    - app/src/ui/CreationPage.jsx (lines 53-60, 213-218, 334-348, 436-475, 597-600)
    - app/src/domain/creationSteps.js (lines 24, 93-114)
  </read_first>
  <behavior>
    - The six cases from Task 1 pass.
    - The two existing Cancel cases (the unmoved row's Add ingredient, and the chooser's Cancel while the row's Add to step chooser is open) and the anchor-left-its-group cases pass unchanged.
  </behavior>
  <action>
    Per the item, resolve the opener row's current line at Cancel time and keep the heading as the fallback only when the row is gone.

    Add one module-level function, openerLine(draft, rowId, group), directly below anchorHolds. It returns a line key in the form row id, a colon, step key. It works in three steps. First, when draft.rows has no row with that id, it returns the key of the line as pressed (rowId and group), which is gone with the row. Do not call rowLines in that case: rowLines throws a RangeError for a row that is not on the draft. Otherwise it reads the steps of rowLines(draft, rowId). When group is among them, it returns the key for group. Otherwise it returns the key for the first of them. Give it a short comment in the file's voice. The comment says: this is the line the picker's opener stands on now. It is the line it was pressed on while the row still sits there. Otherwise it is the row's first line, because the row moved into or out of a step while the picker was open. When the row is gone it is the line as pressed, which is not drawn, so focus falls to the heading's Add ingredient. rowLines is already imported. Add no import.

    In handleCancelPicker, delete the statement that builds the local `line` from the stored anchor's row id and group. In the 'row' branch, write the picker-opener request with line set to openerLine(createDraft, opener.afterRowId, opener.group). Do the same in the 'grams' branch for the row-grams request. Keep the request kinds, the branch order, setPicking(null), and the heading branch's 'ingredient-target' exactly as they are. Add one sentence to the comment above handleCancelPicker: the row's line is read when Cancel is pressed, so a row that moved into or out of a step while the picker was open is found where it stands.

    In the focus effect, change only two comments. In the picker-opener branch, "when the line is gone (review item 10)" becomes "when the row is gone (review item 10)". In the row-grams branch, "when the line is gone" becomes "when the row is gone". Do not change any code line of the effect. Its DOM lookups and heading fallbacks stay as they are.

    Change nothing else. Do not touch handlePick, anchorHolds, handleAddRowAfter, focusLine, IngredientTable.jsx or any on-screen word. Run CreationFlow.test.jsx whole, then the gates in verify. Commit as `fix(261122-tqm): the picker's Cancel finds the opener row where it stands now (bug-p12-picker-cancel-focus-heading)`. Write it in English, with the same attribution lines as Task 1.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/CreationFlow.test.jsx && test "$(grep -v '^\s*//' app/src/ui/CreationPage.jsx | grep -cF 'openerLine(')" -ge 3 && test "$(grep -v '^\s*//' app/src/ui/CreationPage.jsx | grep -cF 'opener?.afterRowId}')" -eq 0 && B="$(cat "${TMPDIR:-/tmp}/sprinkles-tqm/BASE")" && D="$(git diff -U0 "$B" -- app/src/ui/CreationPage.jsx)" && test "$(printf '%s\n' "$D" | grep -E '^[-+]' | grep -vE '^(\+\+\+|---)' | grep -vE '^[-+][[:space:]]*//' | grep -c 'querySelector')" -eq 0</automated>
    Baselines: `openerLine(` in code lines [HEAD=0 EXPECT>=3] (the definition and the two calls); the old line-building template's row-id interpolation in code lines [HEAD=1 EXPECT==0]; changed code lines mentioning querySelector in the CreationPage.jsx diff against BASE [HEAD=0 EXPECT==0 GUARD MUTATION: editing a lookup or a fallback in the focus effect turns it red]. The diff is working tree against BASE on purpose, so it covers the committed fix and anything left uncommitted.
  </verify>
  <done>CreationFlow.test.jsx passes whole, including the six new cases and the existing Cancel and anchor cases. openerLine exists below anchorHolds, and handleCancelPicker's row and grams branches use it against createDraft. The effect's code is unchanged, and only its two comments read "row" for "line". The fix commit is made.</done>
</task>

<task type="auto">
  <name>Task 3: Full suite, scratch build, scope gates and SUMMARY</name>
  <files>.planning/quick/261122-tqm-bug-p12-picker-cancel-focus-heading-the-ingredient-picker-s/261122-tqm-SUMMARY.md</files>
  <read_first>
    - ~/.claude/gsd-core/templates/summary.md
  </read_first>
  <action>
    Run the full suite with `npm --prefix app test` and expect zero failures. At the batch start it was 136 files and 4538 tests. Sibling items that landed before this one (261122-tqj at least) add their own cases, so expect the count at BASE plus six. State in the SUMMARY the count you see and where the difference from 4538 comes from.

    Build into scratch only, with `npm --prefix app run build -- --outDir "${TMPDIR:-/tmp}/sprinkles-tqm/dist" --emptyOutDir`. Leave app/dist and port 4173 alone and start no other Vite process. Run the scope gates in verify against BASE.

    Write the SUMMARY. It records the red evidence (the four assertion messages from Task 1) and the green counts. It records the decisions from the objective: the line is resolved at the press against the committed draft; the pressed line is kept while it stands; otherwise the row's first line is used; the heading fallback stays in the effect, for a row that is gone; and the step-removed consequence that case F pins. It also records the following.
    - Why there is no browser walk (see the objective).
    - "Deferred Human Verification: none".
    - The build is safe to deploy: no stored shape, DB_VERSION or wording changed.
    - The Mark's List row for bug-p12-picker-cancel-focus-heading is for the orchestrator to close once the fix commit lands, with resolvedAt read from `date -u` and a one-line reply. The executor does not touch the list.
    Do not edit any file under app/ in this task.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-tqm" && npm --prefix app test && npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir && test -s "$S/dist/index.html" && B="$(cat "$S/BASE")" && git diff --quiet "$B" -- app/src/ui/IngredientTable.jsx app/src/ui/IngredientPicker.jsx app/src/ui/CreationSteps.jsx app/src/domain app/src/store app/src/styles app/dist && N="$(git diff --name-only "$B" -- app)" && test "$(printf '%s\n' "$N" | sort | tr '\n' ' ')" = "app/src/ui/CreationFlow.test.jsx app/src/ui/CreationPage.jsx " && test -s .planning/quick/261122-tqm-bug-p12-picker-cancel-focus-heading-the-ingredient-picker-s/261122-tqm-SUMMARY.md</automated>
    Baselines: files changed under app/ against BASE [HEAD=0 EXPECT==2], and the two are exactly CreationFlow.test.jsx and CreationPage.jsx. Both diffs are working tree against BASE on purpose, so they cover the committed changes and anything left uncommitted. `git diff --quiet` over IngredientTable.jsx, IngredientPicker.jsx, CreationSteps.jsx, app/src/domain, app/src/store, app/src/styles and app/dist guards the protected paths, so editing any of them turns it red.
  </verify>
  <done>The full suite passes with zero failures. The scratch build writes index.html. Only CreationPage.jsx and CreationFlow.test.jsx changed under app/. The SUMMARY records the red evidence, the decisions, the F consequence, why there is no browser walk, and the list row for the orchestrator to close.</done>
</task>

</tasks>

<threat_model>
ASVS level 1; block on high. No external API, no schema change, no package install, no new input.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker presses to page handlers | The picker's Cancel can be pressed after any number of other edits made while the picker was open: a row placed, unticked or removed, or its step removed. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-tqm-01 | Denial of service (the editor stops on a thrown error) | CreationPage.jsx openerLine | low | mitigate | openerLine checks draft.rows for the row before it calls rowLines, which throws a RangeError for a missing row. Case D (row removed, then Cancel) runs that path, and an uncaught error in the handler fails the run. |
| T-tqm-02 | Tampering (draft integrity) | CreationPage.jsx handleCancelPicker | low | accept | Cancel only reads the draft to choose a focus target. It writes nothing to the draft or the store, and setPicking(null) is unchanged. |
| T-tqm-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package, so there is nothing to gate. |
</threat_model>

<verification>
- RED evidence: at the base, A, B, C and F fail on document.activeElement with focus on the heading's Add ingredient, and D and E pass.
- GREEN: CreationFlow.test.jsx passes whole, then the full suite passes with zero failures (count at BASE plus six).
- Build: `npm --prefix app run build` into "${TMPDIR:-/tmp}/sprinkles-tqm/dist" succeeds. app/dist and port 4173 are untouched.
- Scope: only CreationPage.jsx and CreationFlow.test.jsx change under app/. The focus effect's code lines are unchanged. No on-screen word changes.
</verification>

<success_criteria>
- After a row's Add ingredient or its grams Cmd+Return opens the picker and the row then moves (placed into a step, unticked, or its step removed), Cancel lands on that row's same control where the row now stands.
- The heading's Add ingredient takes Cancel's focus only when the heading opened the picker or the row is gone.
- An unmoved opener, a row with its Add to step chooser open, and a row that still holds the line it was opened from behave as before.
</success_criteria>

<output>
Create `.planning/quick/261122-tqm-bug-p12-picker-cancel-focus-heading-the-ingredient-picker-s/261122-tqm-SUMMARY.md` when done.
</output>
