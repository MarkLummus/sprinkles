---
phase: quick-261122-tqn
plan: 01
quick_id: 261122-tqn
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/domain/penDraft.test.js
  - app/src/ui/RecipePage.perStep.test.jsx
  - app/src/domain/lineage.js
  - app/src/domain/penDraft.js
  - app/src/domain/creationSave.js
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/Method.jsx
  - app/src/styles/notebook.css
autonomous: true
requirements:
  - bug-pen-saves-blank-lead-in

must_haves:
  truths:
    - "In Next version on Olive Oil v1, with a Version name typed: clear Step 1's lead-in (or fill it with spaces), then press Save as new version or Save over this version. Nothing is stored (createVersion and saveVersion are not called). Step 1 is open, focus is in 'Step 1, lead-in', the field is aria-invalid and described by the one .field-error on the page, which reads 'Required' and stands directly after the field inside its label. No 'Check the version' status is shown."
    - "The same holds for a blank 'Step 1, instruction', and for a target with one side blank: Required stands directly after the blank side's field inside its .target-chip, and focus is in that field. A target with both sides blank is not refused, as the creation gate does not refuse it."
    - "A refused Save opens the closed step it names and closes any other open step with its edits kept, as opening a step does."
    - "The pen still tells one thing at a time in page order: the Version name first, then an amount, then the first step in method order (lead-in, instruction, then targets). A removed step is not checked, as the creation gate checks live steps only."
    - "Typing one character in the refused field removes Required, aria-invalid and aria-describedby; the next Save stores the child with what was typed."
    - "Both editors read the word from one exported constant in lineage.js and the step rule from one function (stepRequiredFields). creationSaveBlock's output is unchanged: creationSave.test.js has no diff and passes."
    - "In Playwright WebKit and Chromium against a scratch build, the refused chip keeps its first line where it was (struck parent value when drawn, label field, value field, each within 0.5 px) and Required stands under the blank side; Required under a refused lead-in stands under the lead-in."
  artifacts:
    - path: app/src/domain/lineage.js
      provides: "REQUIRED, stepRequiredFields(step), blockedSaveStepField(penFields, version, versions); blockedSaveMessage returns REQUIRED for the first step field after the version line and the rows"
      contains: "export function stepRequiredFields"
    - path: app/src/domain/penDraft.js
      provides: "penSaveBlock returns { message: 'Required', target: { kind: 'stepLeadIn' | 'stepInstruction' | 'stepTarget', n, index?, side? } }"
      contains: "blockedSaveStepField"
    - path: app/src/domain/creationSave.js
      provides: "creationSaveBlock's Instructions loop reads stepRequiredFields and REQUIRED from lineage.js; same ids, same order, same output"
      contains: "stepRequiredFields"
    - path: app/src/ui/Method.jsx
      provides: "Method opens the step a block names; StepPenBody marks, describes and focuses the named field and draws FieldFeedback under it"
      contains: "step-field-error"
    - path: app/src/ui/RecipeSheet.jsx
      provides: "passes a step-kind block and its message to Method, as it passes a row block to IngredientTable"
      contains: "blockedStepTarget"
    - path: app/src/styles/notebook.css
      provides: "the pen's open-step chip holding a field error lays Required under the blank side, first line unchanged"
      contains: "method-step__open-fields .target-chip:has(> .field-error)"
  key_links:
    - from: "app/src/domain/penDraft.js"
      to: "app/src/domain/lineage.js"
      via: "penSaveBlock calls blockedSaveStepField when no row blocks, so the sentence and the field it names come from one traversal (T-03.1-21)"
      pattern: "blockedSaveStepField\\("
    - from: "app/src/ui/RecipeSheet.jsx"
      to: "app/src/ui/Method.jsx"
      via: "blockedStepTarget and blockedStepMessage props, derived from the blockedTarget and blockedMessage RecipePage already passes"
      pattern: "blockedStepTarget="
    - from: "app/src/ui/Method.jsx Method"
      to: "app/src/ui/Method.jsx StepPenBody"
      via: "an effect keyed on the block's attempt calls setOpenStepN(n); StepPenBody's focus effect, keyed on isOpen and the attempt, focuses the named field once per attempt"
      pattern: "setOpenStepN\\(blockedStepTarget\\.n\\)"
    - from: "app/src/domain/creationSave.js"
      to: "app/src/domain/lineage.js"
      via: "import of REQUIRED and stepRequiredFields, beside the existing gramsDraftMessage import (the D-08 one-source precedent)"
      pattern: "stepRequiredFields"
---

<objective>
Mark's List row bug-pen-saves-blank-lead-in: "Next version saves a step with a blank lead-in or a one-sided target; the creation editor refuses both with Required. The version pen applies the same checks, with the same words."

The cause, traced at planning HEAD b06add6f (line numbers are at that commit; find every site by content):
- Save as new version runs useVersionPen.handleSaveAsNewVersion (useVersionPen.js:190), whose buildPenFields (:177-182) calls usePenDraft.checkSave (usePenDraft.js:75-82), which calls penSaveBlock (penDraft.js:252-258). Save over this version takes the same path (useVersionPen.js:232-235).
- penSaveBlock asks lineage.js blockedSaveMessage (:292-299), which checks only the Version name (blank, then not unique) and then findBlockedRow (:256-269), the rows' grams. Nothing reads the draft method's lead-in, instruction or targets.
- When the gate passes, penFieldsFromDraft (penDraft.js:264-275) hands penDraft.method over as typed, and createChildVersion (lineage.js:145-168) or saveOverVersion (:180-192) stores a structuredClone of it.
- The pen's open step (Method.jsx StepPenBody, :100-508) draws no field feedback on any step field, and RecipeSheet's Method call (RecipeSheet.jsx:197-218) passes Method no block, so even a block would have had nowhere to show.
- The creation editor's gate, creationSaveBlock's Instructions loop (creationSave.js:199-210), refuses a blank lead-in, a blank instruction and a target with one side blank, on live steps only, with the word from its module-level REQUIRED constant (:31), reading text trimmed (hasWords, :33-35). CreationSteps.jsx (:97-160) stands each refusal directly after its field. That is Phase 11 D-10 (Mark, 2026-10-26).

Planning probe (scratch script, imports the domain modules, repo untouched). With Olive Oil v1's Step 1 edited and a Version name typed, penSaveBlock returned null for a blank lead-in, a lead-in of spaces, a blank instruction, a one-sided target, a both-blank target and a removed step with a blank lead-in. Every case except the spaces made validateStoreFile refuse the store file holding the saved child (for example "$.versions[19].method[0].leadIn: expected a non-empty string"). importStore then refuses the whole import. So the defect also makes any later backup of the store refuse to import, beyond the step reading "<b>.</b> Heat the milk." (audit 2026-11-22, item 7).

The fix:
- lineage.js gains the one word (REQUIRED) and the one step rule (stepRequiredFields), beside gramsDraftMessage. That follows the precedent the two editors already share for grams sentences (D-08: "so the two pens can never word the same fault differently").
- The pen's gate asks for the step rule after the version line and the rows.
- creationSaveBlock reads the same rule, with output unchanged.
- The pen's open step marks, describes and focuses the field a block names, and stands Required under it.

Claude's discretion, recorded for Mark:
- "The same checks" is read as Phase 11 D-10's three: a blank lead-in, a blank instruction, and a target with one side blank. Mark's row names two of them; D-10 names the instruction with the lead-in. Text is read trimmed, so a field of spaces is blank, as in the creation gate.
- The pen keeps its own one-at-a-time grammar (lineage.js blockedSaveMessage, "told about one thing at a time"). The creation editor shows every refusal at once (D-11). The step check comes after the version line and the amounts, which is page order in the pen.
- As for row blocks today, a step block announces nothing: no VERSION_BLOCKED_STATUS, which useVersionPen.js:180 sends for a version-line block only. Focus moves to the field, described by Required.
- A refused Save opens the closed step it names, so the field can be marked and focused (the pen's D-21: a block marks and focuses the field it names). The built creation editor does not answer this, because its steps are always open. Opening a step closes any other open step with its edits kept, exactly as Edit this step does today.
- For a target, Required stands under the blank side, as D-10 says and the creation chip draws it. The pen's chip is a one-line inline-flex box that draws the parent's struck value first when the side changed. While it holds the message it becomes two rows: the first line stays exactly as drawn, and Required stands on the second line under the blank side. No board draws the refused pen chip. This is the only design-bearing part of the plan, and it is Task 3 alone.
- The creation editor also shows a quiet "Required" (FieldFeedback's required prop) under a blank field before any Save. The pen's step fields get the refusal only: the row asks for the refusal, and the quiet line would be one prop per field if Mark wants it.

Not in this plan. The planning probe found both, they have the same root cause, and they are for Mark:
- A target with both sides blank: the creation editor drops it at Save (D-22); the pen stores it.
- A removed step with a blank field: the creation editor stores no removed step; the pen stores removed steps as struck tombstones.
Both make a backup refuse to import. A one-sided refusal makes the first more likely, because the pen's chip has no Remove and clearing the other side is the way out. Neither is answered by the built creation editor without a choice: dropping a chip changes what the pen's preview and Show changes read, and refusing on a removed step needs a placement on a struck step.

Sibling order: 261122-tqo (Done and Remove this step focus, also Method.jsx) depends on this item and lands after it. Nothing here moves focus on Done or Remove.

Purpose: the version pen never stores a step the creation editor would refuse, and it says so with the same word in the same place.
Output: three commits (red tests, the gate with the lead-in and instruction refusals, the target side), and an uncommitted SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read by range or by search, not whole:
- app/src/domain/lineage.js: 204-236 (parseGramsDraft, gramsDraftMessage), 238-329 (findBlockedRow, blockedSaveMessage, blockedSaveRowId, blockedSaveLineIndex).
- app/src/domain/penDraft.js: 246-275 (penSaveBlock, penFieldsFromDraft).
- app/src/domain/creationSave.js: 11-35 (imports, the sentences, the REQUIRED constant, hasWords), 147-210 (creationSaveBlock's doc and its Instructions loop).
- app/src/ui/usePenDraft.js 68-82 and app/src/ui/useVersionPen.js 166-182: read only. checkSave stamps an attempt on every blocked press, and buildPenFields announces for a version-line block only.
- app/src/ui/Method.jsx: 1-8 (imports); 100-208 (StepPenBody's props, the leadInRef and the two isOpen effects at 148-156, the lead-in and instruction fields); 222-253 (the target chips); 430-437 and 483-487 (Done/Cancel and the unkeyed-branch comment); 613-678 (Method's props, openStepN, handleOpenStep, handleDoneStep, handleCancelStep); 742-762 (the StepPenBody call).
- app/src/ui/RecipeSheet.jsx: 20-53 (props) and 160-218 (the IngredientTable row-block props at 167-170, the Method call at 197-218).
- app/src/ui/IngredientTable.jsx 14-17, 621-636, 1024-1031 and 1094-1100: read only. They show the pen's existing block grammar: one fixed error id, the focus Map keyed per field, the effect keyed on the attempt, and the sentence in the line it names.
- app/src/ui/CreationSteps.jsx 66-160: read only. The model for the error props and the FieldFeedback positions.
- app/src/ui/FieldFeedback.jsx (14 lines): it returns null with no error and no required.
- app/src/styles/notebook.css 210-226 and 318-366 (the creation chip's two-row grid at 324-353, the pen open-field rules); app/src/styles/app.css 1162-1177 and 1258-1268 (.method-step__targets, .target-chip, .field-error).
- app/src/domain/penDraft.test.js 1-37, 85-107 (clone, cleanDraftFor) and 277-318 (the penSaveBlock describe).
- app/src/ui/RecipePage.perStep.test.jsx 1-184 (the repository mock, mountAt, buttonByText, buttonByLabel, click, setValue, afterEach), 588-748 (the refused-save and blocked-line tests, the nearest models) and 824-848 (Save over).
- app/src/data/olive-oil.js 118-160: Step 1 'Lecithin into the oil', one target temp/room; Step 2 two targets (temp 85 °C, hold 2 min); Step 3 'Build the base', one target.
- For Task 3's measurement only: .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs (startServers({ appRoot }) serves a built app on an ephemeral 127.0.0.1 port with SPA fallback), and the audit's Playwright launch shape in .planning/state-machines/2026-11-22-audit.md lines 26-29.
</context>

<interfaces>
At planning HEAD b06add6f:
- penSaveBlock(penDraft, version, scopedVersions) returns null, { message, target: { kind: 'versionLine' } } or { message, target: { kind: 'row', rowId, index } }. usePenDraft.checkSave stamps `attempt` onto the target. RecipePage passes blockedTarget and blockedMessage to RecipeSheet unchanged (RecipePage.jsx:515-516).
- The pen draft's method is the version's method array, cloned: each step has n, leadIn, instruction, targets [{ label, value }], uses, removed, and purpose and aside when present.
- creationSaveBlock block ids for steps: `lead:${n}`, `instruction:${n}`, `target:${n}:${index}:${side}`. Targets: { kind: 'stepLeadIn', n }, { kind: 'stepInstruction', n }, { kind: 'stepTarget', n, index, side }, with side 'label' or 'value'.

Added by this plan:
- lineage.js: export const REQUIRED (the word Required); export function stepRequiredFields(step) returns those three target shapes, in that order, for the step's blank fields; export function blockedSaveStepField(penFields, version, versions) returns one of them or null.
- penSaveBlock adds { message: 'Required', target: <a stepRequiredFields entry> }, checked after the version line and the rows.
- Method props blockedStepTarget (that block with its attempt, or null) and blockedStepMessage. StepPenBody props blocked (the block when it names this step, else null) and blockedMessage. Error id 'step-field-error' (one block at a time, as 'version-field-error' and 'ingredient-field-error').
- Accessible names the tests use (fieldLabel): 'Step 1, edit this step', 'Step 1, lead-in', 'Step 1, instruction', 'Step 1, target 1, label', 'Step 1, target 1, value', 'Step 3, edit this step', 'Step 3, lead-in', 'Version name', 'Heavy cream, grams'. Buttons by text: 'Next version', 'Save as new version', 'Save over this version'. A step's own Done and Cancel are found with buttonByText on the step's li.
</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Red tests: the pen's gate and the pen's open step refuse what the creation editor refuses</name>
  <files>app/src/domain/penDraft.test.js, app/src/ui/RecipePage.perStep.test.jsx</files>
  <precondition>git status --porcelain app/src prints nothing.</precondition>
  <behavior>
    Domain, penDraft.test.js, a new describe 'penSaveBlock: the steps (bug-pen-saves-blank-lead-in)'. Each case builds draft = cleanDraftFor(clone()) and sets draft.versionLabel to 'v-next' unless it says otherwise. Steps are found by n, never by array position.
    - D1: Step 1's lead-in '' gives exactly { message: 'Required', target: { kind: 'stepLeadIn', n: 1 } }.
    - D2: Step 1's lead-in '   ' gives the same.
    - D3: Step 3's instruction '' gives { message: 'Required', target: { kind: 'stepInstruction', n: 3 } }.
    - D4: Step 1's first target value '' gives target { kind: 'stepTarget', n: 1, index: 0, side: 'value' }. On a fresh draft, Step 2's second target label '' gives { kind: 'stepTarget', n: 2, index: 1, side: 'label' }.
    - D5: Step 1's first target with both sides '' gives null, as the creation gate refuses no both-blank target.
    - D6: Step 1's lead-in '' with Step 1 removed true gives null: live steps only, as the creation gate.
    - D7, one thing at a time:
      - a blank Version name with a blank Step 1 lead-in names { kind: 'versionLine' };
      - a blank grams on version.rows[1] with a blank Step 1 lead-in names that row;
      - a blank Step 3 lead-in with a blank Step 1 instruction names the Step 1 instruction;
      - on Step 2, a blank lead-in, instruction and second-target value name the lead-in, then the instruction once the lead-in is filled, then the target once the instruction is filled.
    - Red at HEAD: D1-D4 and D7 fail (penSaveBlock returns null where a step block is expected). D5 and D6 pass and pin the bounds.
    UI, RecipePage.perStep.test.jsx, end-to-end through the real page. Every case: installMatchMedia(), mountAt(VERSION_PATH), press Next version, type 'v2' into Version name unless the case says otherwise. The new describe 'bug-pen-saves-blank-lead-in: a step field the pen refuses' holds U1 to U6:
    - U1, lead-in on a closed step:
      - press 'Step 1, edit this step', set 'Step 1, lead-in' to '', press the step's Done;
      - guard: 'Step 1, lead-in' is no longer drawn;
      - press Save as new version;
      - createVersion and saveVersion were not called;
      - 'Step 1, lead-in' is drawn and is document.activeElement, with aria-invalid 'true';
      - the page holds exactly one .field-error. It reads 'Required', its id is not empty and equals the field's aria-describedby, it is the field's nextElementSibling, and it sits in the field's own label;
      - the .form-status text is '' and there is no #version-field-error.
    - U2, Save over this version: Step 1 open, lead-in '   ', press Save over this version. saveVersion and createVersion were not called, focus is in 'Step 1, lead-in', and Required is wired as in U1.
    - U3, instruction: Step 1 open, 'Step 1, instruction' set to '', Save as new version. Nothing is stored, focus is in 'Step 1, instruction', and Required is its nextElementSibling inside its label, wired as in U1.
    - U4, another step open:
      - open Step 1, clear its lead-in, press 'Step 3, edit this step';
      - guard: 'Step 1, lead-in' is gone and 'Step 3, lead-in' is drawn;
      - press Save as new version: 'Step 3, lead-in' is gone, and 'Step 1, lead-in' is drawn and focused with Required.
    - U5, typing clears:
      - refuse as in U3 but on the lead-in;
      - set 'Step 1, lead-in' to 'L': no .field-error remains, and the field has no aria-invalid and no aria-describedby;
      - press Save as new version and flush until createVersion is called: it was called once, and the child's method step with n 1 has leadIn 'L'.
    - U6, order guard:
      - leave Version name blank, clear the Step 1 lead-in, press Save as new version: the one .field-error is #version-field-error reading 'Enter a version.', and 'Step 1, lead-in' has no aria-invalid;
      - type 'v2' into Version name, set 'Heavy cream, grams' to '', press Save as new version again: the one .field-error reads 'Heavy cream needs an amount, or remove it', and the lead-in has no aria-invalid;
      - nothing was stored.
    A second new describe, 'bug-pen-saves-blank-lead-in: a target with one side blank', holds U7 and U8:
    - U7: Step 1 open, 'Step 1, target 1, value' set to '', Save as new version. Nothing is stored. Focus is in the value field, which is aria-invalid. The one .field-error reads 'Required', is the value field's nextElementSibling, has the value field's .target-chip as its parentElement, and its id equals the value field's aria-describedby. The label field has no aria-invalid.
    - U8: the same with 'Step 1, target 1, label' set to '', on the label side. The value field has no aria-invalid.
    Red at HEAD: U1-U5, U7 and U8 fail at "createVersion/saveVersion not called", because the pen stores the step. U6 passes, a guard.
  </behavior>
  <action>
Step 0, before any edit:
- Let S be "${TMPDIR%/}/sprinkles-261122-tqn". Create it.
- Write `git rev-parse HEAD` to S/head-before. That commit is the base for every diff gate in this plan.
- Run npm --prefix app test and write its "Test Files" and "Tests" lines to S/suite-before. It must pass. If it does not, stop and report.
- This plan builds only into S/dist (Task 3), never into app/dist. It starts no Vite dev or preview server and never contacts port 4173.

Write the tests in the behavior block.
- penDraft.test.js: add the new describe right after the existing 'penSaveBlock' describe. Use the file's clone() and cleanDraftFor(version). Find steps with draft.method.find by n, and find rows by version.rows[1] as the existing grams case does.
- RecipePage.perStep.test.jsx: add the two new describes at the end of the file.
  - Use only the file's own helpers (mountAt, installMatchMedia, buttonByText(scope, text), buttonByLabel, click, setValue, flush).
  - Use a local field(label) that queries a textarea by aria-label, and a statusText() over .form-status, as the describes at 588 and 659 do.
  - Find a step's Done with buttonByText on the li taken from its field before the step closes (field.closest('li')).
  - Read VERSION_BLOCKED_STATUS from the existing import if a case needs it.
- Comments say why in plain English and name the row id once per describe.
- Change no existing test or helper in either file.

Run both files with the filter -t 'bug-pen-saves-blank-lead-in':
- D1-D4, D7, U1-U5, U7 and U8 must fail at the assertion named in the behavior block;
- D5, D6 and U6 must pass;
- every setup guard inside a failing case must pass. If a guard fails, the test is wrong, not the app: fix the test.
Copy the failing assertion lines into S/red.txt for the SUMMARY.

Commit only these two paths, with git add of the explicit paths, never -A: untracked .review-diagnostics and quick-batches folders sit under .planning. The message, in English: "test: the version pen refuses a step's blank lead-in, blank instruction and one-sided target (bug-pen-saves-blank-lead-in)". Then a blank line and the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01VWwTRSNw8tGVgeHqypcMwH.
  </action>
  <verify>
    <automated>S="${TMPDIR%/}/sprinkles-261122-tqn" && test -s "$S/head-before" && test -s "$S/suite-before" && ! npm --prefix app test -- src/domain/penDraft.test.js src/ui/RecipePage.perStep.test.jsx -t 'bug-pen-saves-blank-lead-in' > "$S/red-run.txt" 2>&1 && npm --prefix app test -- src/domain/penDraft.test.js src/ui/RecipePage.perStep.test.jsx -t '^(?!.*bug-pen-saves-blank-lead-in)' && test "$(grep -c 'bug-pen-saves-blank-lead-in' app/src/domain/penDraft.test.js)" -ge 1 && test "$(grep -c 'bug-pen-saves-blank-lead-in' app/src/ui/RecipePage.perStep.test.jsx)" -ge 2</automated>
  </verify>
  <done>
- Baselines at planning HEAD b06add6f: 'bug-pen-saves-blank-lead-in' is in 0 files under app/src [HEAD=0 EXPECT>=1 in penDraft.test.js, EXPECT>=2 in RecipePage.perStep.test.jsx].
- The filtered run holds 15 new tests: 12 fail (D1-D4, D7, U1-U5, U7, U8) at their named assertion, and 3 pass (D5, D6, U6).
- Every other test in the two files passes.
- No file outside the two test files changed. One commit.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: One step rule in lineage.js; the pen's gate refuses with Required, and the pen's open step shows it under the lead-in and the instruction</name>
  <files>app/src/domain/lineage.js, app/src/domain/penDraft.js, app/src/domain/creationSave.js, app/src/ui/RecipeSheet.jsx, app/src/ui/Method.jsx</files>
  <behavior>
    - D1-D7 pass. creationSave.test.js passes with no diff.
    - U1-U6 pass. U7 and U8 now pass every assertion except the Required line and its aria wiring, which Task 3 adds.
  </behavior>
  <action>
lineage.js, beside gramsDraftMessage (after its doc and body, near line 237):
- Export a constant REQUIRED holding the word Required. A comment says it is the one word a step's blank required field earns in both editors (Phase 11 D-10), so the creation gate and the version pen's gate cannot word it differently. The gramsDraftMessage precedent (D-08) already does this for the grams sentences.
- Export stepRequiredFields(step), pure:
  - A field has words when it is a string whose trimmed text is not empty, creationSave.js hasWords's rule.
  - It returns, in this order: { kind: 'stepLeadIn', n } when the lead-in has no words; { kind: 'stepInstruction', n } when the instruction has no words; then, for each of (step.targets ?? []) by index where exactly one side has words, { kind: 'stepTarget', n, index, side } naming the blank side.
  - A target with both sides blank is not listed.
  - It does not read removed: the caller passes live steps.
  - Its doc comment says all of this and cites D-10.
- Add an internal findBlockedStep(penFields). It walks (penFields.method ?? []) in order, skips a step whose removed is exactly true (findBlockedRow's rule for a removed step), and returns the first entry of the first step that has one, else null.
- blockedSaveMessage: after the rows check, return REQUIRED when findBlockedStep finds a field, else null. Extend its doc comment's ordered list. After the first blocking row comes the first step field in method order (lead-in, instruction, then a target with one side blank). A removed step is not checked, as the creation gate checks live steps only. Keep the words band, deviation and advisor out of the function body; lineage.test.js:566 scans it.
- Export blockedSaveStepField(penFields, version, versions):
  - null when the version line blocks (the same two checks blockedSaveRowId makes first);
  - null when findBlockedRow finds a row;
  - otherwise findBlockedStep(penFields).
  - A doc comment in the shape of blockedSaveRowId's says it reads the same traversal, so the field and the sentence cannot disagree (T-03.1-21).

penDraft.js:
- Import blockedSaveStepField with the other lineage.js names.
- penSaveBlock: when a row id comes back, return the row target exactly as now. Otherwise, when blockedSaveStepField returns a field, return { message, target: that field }. Otherwise return the versionLine target.
- Extend its comment by one sentence on the step field.

creationSave.js:
- Add REQUIRED and stepRequiredFields to the existing import from './lineage.js' (line 17), and delete the module-level REQUIRED constant at line 31. Every other use of REQUIRED in the file stays as it is and now reads the import.
- Replace the body of the Instructions loop (:199-210) so that each live step's stepRequiredFields entries are added in order, with the message REQUIRED, the target the entry itself, and the id built from the entry exactly as today: `lead:${n}`, `instruction:${n}`, `target:${n}:${index}:${side}`.
- hasWords stays for its other callers. creationSave.test.js must pass unchanged; that is the proof the output did not move.

RecipeSheet.jsx, in the Method call (:197-218):
- Pass blockedStepTarget: blockedTarget when its kind is 'stepLeadIn', 'stepInstruction' or 'stepTarget', else null.
- Pass blockedStepMessage: blockedMessage under the same condition, else null.
- This is the same shape as the row props IngredientTable gets at :167-170.

Method.jsx:
- Import FieldFeedback from './FieldFeedback.jsx'.
- Add a module constant STEP_FIELD_ERROR_ID, value 'step-field-error'. Its comment: one blocked step field at a time, as the version line has 'version-field-error' and the table has 'ingredient-field-error' (IngredientTable.jsx:15-17).
- Method:
  - Add the props blockedStepTarget = null and blockedStepMessage = null, with a comment beside the pen props.
  - After the effect that resets openStepN when the pen closes (:665-667), add an effect keyed on blockedStepTarget?.attempt. When a block stands, it calls setOpenStepN(blockedStepTarget.n).
  - Comment it: a refused Save opens the step it names, so its field can be marked and focused (the pen's D-21). A closed step draws no field. Opening closes any other open step with its edits kept, as Edit this step does.
  - Pass StepPenBody blocked (blockedStepTarget when its n equals step.n, else null) and blockedMessage (blockedStepMessage).
- StepPenBody, new props blocked = null and blockedMessage = null:
  - Derive leadError (blockedMessage when blocked?.kind is 'stepLeadIn', else null) and instructionError the same way for 'stepInstruction'.
  - Add an instructionRef on the instruction textarea.
  - Add a targetFieldsRef, a Map keyed `${index}:${side}`, filled through ref callbacks on both target textareas, as IngredientTable's gramsInputsRef (:626-636). The focus effect below reads it, so a target block is focused from this task on; Task 3 adds only its Required line.
  - The lead-in and instruction textareas get aria-invalid 'true' and aria-describedby STEP_FIELD_ERROR_ID while their error stands, as CreationSteps.jsx:104-105 and :117-118 do.
  - Render FieldFeedback error={leadError} errorId={STEP_FIELD_ERROR_ID} directly after the lead-in textarea inside its label, and the same for the instruction. These are the CreationSteps.jsx:109 and :122 positions, with no required prop.
  - Render FieldFeedback unconditionally (it returns null without an error), so the textarea nodes keep their child positions and the focused field is never remounted.
  - Add nothing at the top level of either branch's method-step__body: the two branches are unkeyed on purpose (the comment at :483-487).
- StepPenBody's focus:
  - Declare a new effect after the existing open effect that focuses the lead-in (:154-156), so it runs later in the same commit.
  - Key it on [isOpen, blocked?.attempt] and keep a ref of the last attempt it handled.
  - When the step is open and blocked carries an attempt not yet handled, focus the named field (leadInRef, instructionRef, or the targetFieldsRef entry for its index and side) and record the attempt.
  - Comment why: the step may open in the render after the refusal (Method's effect), so the attempt alone cannot key the focus. The record keeps a later Done and Edit this step from moving focus off the lead-in, which the open effect already gives.

Run the domain suite and the step-field describe. Then commit the five paths with git add of the explicit paths. Message: "fix: the version pen refuses a blank lead-in or instruction with Required, as the creation editor does (bug-pen-saves-blank-lead-in)", then a blank line and the same two attribution lines as Task 1.
  </action>
  <verify>
    <automated>S="${TMPDIR%/}/sprinkles-261122-tqn" && BASE="$(cat "$S/head-before")" && npm --prefix app test -- src/domain && npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx -t 'a step field the pen refuses' && git diff --quiet "$BASE" -- app/src/domain/creationSave.test.js && test "$(grep -c 'export function stepRequiredFields' app/src/domain/lineage.js)" = 1 && test "$(grep -c 'export function blockedSaveStepField' app/src/domain/lineage.js)" = 1 && test "$(grep -v '^[[:space:]]*//' app/src/domain/creationSave.js | grep -c "const REQUIRED = 'Required'")" = 0 && test "$(grep -v '^[[:space:]]*//' app/src/domain/creationSave.js | grep -c 'stepRequiredFields')" -ge 2 && test "$(grep -c 'blockedSaveStepField' app/src/domain/penDraft.js)" -ge 2 && test "$(grep -c 'blockedStepTarget' app/src/ui/RecipeSheet.jsx)" -ge 1 && test "$(grep -c "'step-field-error'" app/src/ui/Method.jsx)" = 1</automated>
  </verify>
  <done>
Baselines at planning HEAD b06add6f, each [HEAD=value EXPECT op value]:
- stepRequiredFields exported in lineage.js [HEAD=0 EXPECT==1].
- blockedSaveStepField exported [HEAD=0 EXPECT==1].
- The REQUIRED constant line in creationSave.js outside comments [HEAD=1 EXPECT==0].
- stepRequiredFields in creationSave.js code lines [HEAD=0 EXPECT>=2].
- blockedStepTarget in RecipeSheet.jsx [HEAD=0 EXPECT>=1].
- 'step-field-error' in Method.jsx [HEAD=0 EXPECT==1].
- The domain suite passes.
- creationSave.test.js has no diff since Step 0.
- U1-U6 pass. One commit.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Required under a target's blank side in the pen's chip, measured in WebKit and Chromium</name>
  <files>app/src/ui/Method.jsx, app/src/styles/notebook.css</files>
  <behavior>
    - U7 and U8 pass.
    - The full suite passes at S/suite-before's test count plus 15, with the same file count.
    - In a scratch build, the refused chip's first line does not move, and Required stands under the blank side, in WebKit and in Chromium.
  </behavior>
  <action>
Method.jsx, StepPenBody's target chips (:224-251):
- For each side, the error is blockedMessage when blocked?.kind is 'stepTarget' and its index and side are this chip's and this side; otherwise null.
- That textarea gets aria-invalid 'true' and aria-describedby STEP_FIELD_ERROR_ID while it stands.
- Render FieldFeedback error={that error} errorId={STEP_FIELD_ERROR_ID} directly after that side's textarea, inside the chip: after the label field and after the value field. These are CreationSteps.jsx's :148 and :160 positions.
- Render both unconditionally, so the value textarea keeps its child position when the label's line appears.
- The focus effect from Task 2 already reaches these fields through targetFieldsRef.

notebook.css, beside the creation chip's grid (:324-353), add one rule set scoped to the pen's open step and to a chip that holds a field error: .notebook .method-step__open-fields .target-chip:has(> .field-error).
- While it holds the error, the chip is two rows.
- Row 1 keeps what the chip draws today, in the same order, at its existing gap (var(--gap-hair)): the struck parent value when it is drawn, then the label field, then the value field.
- Row 2 holds the .field-error, under the column of the field it follows (the label field or the value field).
- The struck value is drawn when the value side changed and not when the label side changed, because buildTargetDiff pairs chips by label. So the column placement must hold with and without it. One way: an inline-grid with explicit columns chosen by :has(> .struck-value).
- A chip without a field error keeps today's inline-flex box and is not touched.
- Tokens only; integers for grid lines, as the creation rules use.
- A comment says: Required stands under the empty side (Phase 11 D-10), as the creation chip's grid draws it. The pen's chip keeps its first line as drawn, the parent's struck value first. No board draws the refused pen chip.

Measure it in a browser. Mark's rule: measure the real DOM, never reason from the CSS source.
- Build to the scratch outDir: npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir. Never build into app/dist.
- Write S/measure.mjs (not committed):
  - Serve "$S/dist" with startServers({ appRoot }) from .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs, which uses ephemeral 127.0.0.1 ports.
  - Import playwright-core from /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs, the audit's path.
  - Run webkit.launch() first, then chromium.launch({ channel: 'chrome', headless: true }).
  - Use a viewport of 1366 by 1024 with hasTouch true, and abort every request that is not to 127.0.0.1.
  - Use a fresh browser context for each case, so each starts from the seeded store with no kept draft.
- Each case:
  1. Open /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1.
  2. Wait for Next version and press it.
  3. Type 'probe' into Version name.
  4. Press 'Step 1, edit this step'.
- Case value:
  - Clear 'Step 1, target 1, value'.
  - Read the bounding boxes of Step 1's first chip's children: the struck value, the label field and the value field.
  - Press Save as new version and wait for the chip's .field-error.
  - Read the boxes again, and the error's.
  - Pass when: every first-line child's left and top moved by 0.5 px or less; the error's top is at or below the value field's bottom minus 0.5; the error's left is within 0.5 px of the value field's left; document.activeElement's aria-label is 'Step 1, target 1, value'; the address is unchanged; and the page shows no 'Version saved.'.
- Case label: the same on the label side, with no struck value drawn.
- Case lead-in:
  - Clear 'Step 1, lead-in' and press the step's Done.
  - Press Save as new version.
  - Pass when Step 1 is open; focus is in 'Step 1, lead-in'; the error's top is at or below the lead-in's bottom minus 0.5 and its left is within 0.5 px of the lead-in's left; and nothing is saved.
- Print one line per case per engine with the measured numbers. Exit 1 on any failure.
- Copy the lines into the SUMMARY. They are Playwright readings on a Mac, not device-verified.
- If a case fails, change the CSS and measure again. Do not loosen a threshold.

Then run the verify command. Commit the two paths with git add of the explicit paths. Message: "fix: the version pen stands Required under a target's blank side (bug-pen-saves-blank-lead-in)", then a blank line and the same two attribution lines.

Write the SUMMARY at .planning/quick/261122-tqn-bug-pen-saves-blank-lead-in-next-version-saves-a-step-with-a/261122-tqn-SUMMARY.md and leave it uncommitted. It records:
- S/red.txt and the green results;
- the suite totals before and after;
- the three commit hashes;
- the measurement lines;
- the Claude's discretion list from this plan's objective, so the orchestrator can tell Mark.
It also carries "Notes for the orchestrator":
- Close the Mark's List row bug-pen-saves-blank-lead-in after the merge (the executor has no ArtifactData).
- Two same-cause cases are not fixed: a target with both sides blank, and a removed step with a blank field. The planning probe showed that the pen stores both and that a backup holding them refuses to import. They are for Mark.
- app/dist is as it was; the only build went to S/dist.
- If a device check is wanted, the steps are, one per line:
  1. Open Olive Oil v1 at the desk and press Next version.
  2. Type a Version name.
  3. On Step 1 press Edit this step and clear the lead-in.
  4. Press Done.
  5. Press Save as new version. Expect: Step 1 opens with Required under the empty lead-in and the cursor in it; nothing is saved.
  6. Type a lead-in and press Save as new version. Expect: Version saved.
  </action>
  <verify>
    <automated>S="${TMPDIR%/}/sprinkles-261122-tqn" && BASE="$(cat "$S/head-before")" && npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx src/ui/Method && npm --prefix app test && npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir && node "$S/measure.mjs" && git diff --quiet "$BASE" -- app/src/ui/CreationSteps.jsx app/src/ui/CreationSteps.test.jsx app/src/domain/creationSave.test.js && test "$(grep -c 'method-step__open-fields .target-chip:has(> .field-error)' app/src/styles/notebook.css)" -ge 1 && test "$(grep -v '^[[:space:]]*//' app/src/ui/Method.jsx | grep -c 'FieldFeedback')" -ge 5 && ADDED="$(git diff "$BASE" -- app/src)" && test "$(printf '%s\n' "$ADDED" | grep -c '^+.*dangerouslySetInnerHTML')" = 0 && CHANGED="$(git diff --name-only "$BASE" -- app/src)" && test -n "$CHANGED" && test -z "$(printf '%s\n' "$CHANGED" | grep -vE '^app/src/(domain/(lineage|penDraft|creationSave)\.js|domain/penDraft\.test\.js|ui/(RecipeSheet|Method)\.jsx|ui/RecipePage\.perStep\.test\.jsx|styles/notebook\.css)$' | grep -v '^$')"</automated>
  </verify>
  <done>
Baselines at planning HEAD b06add6f, each [HEAD=value EXPECT op value]:
- The pen chip rule in notebook.css [HEAD=0 EXPECT>=1].
- FieldFeedback in Method.jsx code lines [HEAD=0 EXPECT>=5]: the import, the lead-in, the instruction, and the two chip sides.
- Added dangerouslySetInnerHTML lines [HEAD=0 EXPECT==0].
- U7 and U8 pass. The full suite passes at S/suite-before's test count plus 15, with the same number of test files.
- measure.mjs passes all three cases in WebKit and in Chromium.
- CreationSteps.jsx, CreationSteps.test.jsx and creationSave.test.js have no diff since Step 0.
- No file under app/src changed outside the eight in files_modified.
- Three commits in all; the SUMMARY is written and uncommitted.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker text to the version record | A step's lead-in, instruction and target sides are typed text, stored in IndexedDB through the repository seam on Save, and exported and imported as a store file checked by transfer.js validateStoreFile. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261122-tqn-01 | Denial of service | Version pen Save: createChildVersion and saveOverVersion via penSaveBlock | medium | mitigate | A pen-saved step with a blank lead-in, a blank instruction or a one-sided target made validateStoreFile refuse the whole backup (planning probe). penSaveBlock now refuses all three on live steps through stepRequiredFields before any record is built (Task 2). The both-blank target and the removed-step case stay open and are handed to Mark in the SUMMARY. |
| T-261122-tqn-02 | Tampering | creationSaveBlock after the shared rule | low | mitigate | The creation gate's output is pinned: creationSave.test.js passes with no diff, with the same ids, order and words, and the creation suites pass in the full run. |
| T-261122-tqn-03 | Information disclosure / injection | FieldFeedback lines in StepPenBody | low | accept | The only new text is the constant word Required, rendered as a React text child. No markup path is added; a negative gate counts added dangerouslySetInnerHTML lines. |
| T-261122-tqn-04 | Tampering | targetFieldsRef keys | low | accept | Keys are `${index}:${side}` strings built from the domain's literals and array indexes, held in a Map, never a bracket write keyed by maker text (the T-02-32 discipline). |
| T-261122-tqn-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. The measurement uses the playwright-core copy already on disk from the 2026-11-22 audit and is not added to app/package.json. |
</threat_model>

<verification>
- Each task's automated command passes as written.
- git log -3 --format=%s shows the three messages, each naming bug-pen-saves-blank-lead-in.
- git show --stat for the three commits lists only the eight files in files_modified.
- No vite dev or preview server was started, port 4173 was not contacted, and app/dist is untouched.
</verification>

<success_criteria>
- The version pen refuses a step with a blank lead-in, a blank instruction or a target with one side blank, on Save as new version and on Save over this version. It refuses with the creation editor's word, Required, under the field, and focus lands in it. A closed step it names opens.
- The pen and the creation editor read one word and one step rule from lineage.js; the creation editor's refusals are unchanged.
- Fifteen new tests: twelve fail before the fix, all pass after it, and the full suite is green at the starting count plus 15.
- The refused pen chip is measured in WebKit and Chromium: its first line does not move, and Required stands under the blank side.
</success_criteria>

<output>
Create `.planning/quick/261122-tqn-bug-pen-saves-blank-lead-in-next-version-saves-a-step-with-a/261122-tqn-SUMMARY.md` when done
</output>
