---
phase: quick-261123-bdk
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/domain/penDraft.js
  - app/src/domain/lineage.js
  - app/src/domain/penDraft.test.js
  - app/src/store/pen-step-roundtrip.test.js
  - .planning/quick/261123-bdk-next-version-pen-never-save-a-step-that-/261123-bdk-SUMMARY.md
autonomous: true
requirements: [bug-pen-saves-step-backup-refuses]

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "A version saved through the pen (Save as new version and Save over this version) from a draft in which a live step's target has both sides blank exports, passes validateStoreFile and imports into a fresh store; the stored step no longer holds that target"
    - "A version saved through the pen with a removed step whose lead-in, instruction or one side of a target was blanked exports, passes validateStoreFile and imports; that field holds what the version the pen opened on holds for it"
    - "On a removed step, an edit that holds words (a rewritten instruction, a changed uses list) saves as typed: only the fields the store file check refuses are replaced"
    - "No on-screen word changes: nothing under app/src/ui changes, and transfer.js, db.js and repository.js are untouched (DB_VERSION stays 10, no store shape change)"
    - "The full suite passes: 4577 tests before this task plus the new ones"
  artifacts:
    - path: app/src/domain/penDraft.js
      provides: "penFieldsFromDraft applies the saved-step rule to the method both saves store"
    - path: app/src/store/pen-step-roundtrip.test.js
      provides: "Round trip through the repository seam: pen save, exportStore, JSON, validateStoreFile, importStore, for each case and both saves"
    - path: app/src/domain/penDraft.test.js
      provides: "Unit tests pinning the rule field by field"
  key_links:
    - from: app/src/ui/usePenDraft.js
      to: app/src/domain/penDraft.js
      via: "checkSave calls penFieldsFromDraft, the one source of the fields createChildVersion and saveOverVersion store"
    - from: app/src/domain/penDraft.js
      to: app/src/domain/lineage.js
      via: "imports hasWords, the trimmed holds-words rule stepRequiredFields and the pen gate already use"
    - from: app/src/store/pen-step-roundtrip.test.js
      to: app/src/store/transfer.js
      via: "exportStore, validateStoreFile and importStore prove the backup round trip"
---

<objective>
Fix Mark's List bug bug-pen-saves-step-backup-refuses (Mark answered "Fix it", 2026-11-23; follow-up to quick 261122-tqn, commit cad72d3f). The version pen can store a step the store file check (validateStoreFile in app/src/store/transfer.js) refuses, and a backup holding that version then refuses to import. Two cases, both confirmed at planning time with a probe against the domain modules on HEAD 990076a0:

1. A live step's target with both sides blank is stored as `{ label: '', value: '' }`; the check refuses `method[i].targets[j]`. The creation editor drops such a target at Save (app/src/domain/creationSave.js, buildCreation's method map); the pen must do the same.
2. A removed step is stored with whatever the draft holds, and the pen's gate skips removed steps (lineage.js findBlockedStep). A removed step with a blank lead-in, a blank instruction, a one-sided target or a both-blank target is stored blank; the check refuses `method[i].leadIn`, `.instruction` or `.targets[j]`.

How a removed step is stored today (traced at planning time): penFieldsFromDraft (app/src/domain/penDraft.js) hands `penDraft.method` through untouched; createChildVersion and saveOverVersion (app/src/domain/lineage.js) structuredClone it; so every step, removed or not, is stored in place with the draft's text, `removed: true` marking the struck one. Nothing between the gate and the store looks at a removed step's fields. Readers of a stored removed step's words: History Show changes (diff.js buildStepDiff), the next pen on that version (struck, and Restore brings the words back), and the table's removed-lines order (its uses). The Sheet and print skip it (activeSteps).

The rule this plan builds (the SUMMARY states it in these words):
- At Save, every step in the pen's method saves as typed, except:
- (a) on any step, a target whose label and value both hold no words is dropped, as the creation editor drops it;
- (b) on a removed step, a lead-in or an instruction that holds no words, or a target with exactly one side that holds no words, saves as the version the pen opened on holds it: that step's own lead-in, instruction, or its target at the same position.
- "Holds words" is lineage.js hasWords: a string whose trimmed text is not empty, the rule the pen gate and the creation editor already read.
- Everything else on a removed step saves as typed (edits that hold words, uses, purpose, aside, the removed flag).
- On a live step the gate refuses (b)'s fields before Save, so only (a) ever acts there.

Why this rule and not a smaller-to-write one (dropping every edit to a removed step): it replaces only the fields the check refuses, so what is stored matches what the pen showed struck, and it mirrors the pen's existing rule for a removed line's grams (penDraftRows falls back to the stored amount per portion when the typed one does not read). The opened version's step always exists: the pen cannot add or remove a step or a target, and a kept draft must pass draftMatchesVersion, which requires the version's step keys. Its fields pass the check, because it is a stored version.

Out of scope: the word Required on a one-sided target chip (held for a design board, decide-p12-pen-target-required-place); any change to validateStoreFile; anything outside the two cases. Other failing shapes are reported, not fixed.

Purpose: every version the pen saves exports and re-imports, so a backup never refuses because of a pen save.
Output: the rule in penDraft.js, a round-trip test file, unit tests, SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/quick/261122-tqn-bug-pen-saves-blank-lead-in-next-version-saves-a-step-with-a/261122-tqn-SUMMARY.md
@app/src/domain/penDraft.js
@app/src/domain/lineage.js
@app/src/ui/usePenDraft.js

Read these ranges only:
- app/src/domain/creationSave.js lines 81-95 (buildCreation's method map: the both-blank drop this plan copies)
- app/src/store/transfer.js lines 156-198 (validateStep: what the check refuses)
- app/src/store/pen-note-roundtrip.test.js (whole file, 85 lines: the fake-indexeddb harness to copy)
- app/src/store/seed-roundtrip.test.js lines 1-30 and 92-109 (export, JSON, validate, import into a fresh IDBFactory)
- app/src/domain/penDraft.test.js lines 1-40 and 434-470 (imports, clone(), the penFieldsFromDraft describe)

Facts checked at planning time (HEAD 990076a0):
- The seeded Olive Oil v1 (`oliveOilVersion.id` is 'olive-oil-ice-cream-v1') has ten live steps. Step 1 holds one target (label 'temp', value 'room') and no ingredient lines. Step 2 holds two targets and some lines. Rows have lines at steps 2, 3, 6 and 8 only.
- The raw `oliveOilVersion` export carries no sheetCode, so a Save over test built on it fails validateStoreFile for that reason alone. Round-trip tests must use the version the seeded store returns (`await repository.getVersion(oliveOilVersion.id)` after `seedIfEmpty`), or a child created from it.
- repository API: `createVersion(version)`, `saveVersion(version, { expected })`, `getVersion(id)`, `listVersions()`. exportStore, validateStoreFile and importStore are exported by app/src/store/transfer.js.
- `npm --prefix app test -- src/domain/penDraft.test.js src/store/pen-note-roundtrip.test.js` ran green (62 tests).
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Case 1 end to end. A live step's both-blank target is dropped at Save, and the backup round-trips</name>
  <files>app/src/store/pen-step-roundtrip.test.js, app/src/domain/penDraft.js, app/src/domain/lineage.js, app/src/domain/penDraft.test.js</files>
  <behavior>
    - R1 (round trip, Save as new version): seeded store; open the pen on the stored Olive Oil v1; Version name 'Round trip'; blank both sides of step 1's target 0. penSaveBlock is null; createChildVersion over penFieldsFromDraft; repository.createVersion. Then exportStore, JSON.parse(JSON.stringify(...)), and validateStoreFile is `{ ok: true, errors: [] }`. importStore into a fresh IDBFactory is `{ ok: true, errors: [] }`. The imported child's step 1 has `targets` equal to `[]`.
    - R2 (round trip, Save over this version): store a clean child first (pen on v1, Version name only, Save as new version). Open the pen on that stored child; Version name kept as the child's; the same blanking; penSaveBlock null against the recipe's versions excluding the child; saveOverVersion; repository.saveVersion(updated, { expected: child }). Same export, validate and import assertions; the imported version's step 1 targets equal `[]`.
    - D1 (penDraft.test.js, penFieldsFromDraft): a live step whose target 0 is both blank and target 1 both spaces, with a third target holding words, saves with only the third target, as typed. The other steps are equal to the draft's.
    - Red before the fix: R1 and R2 fail at the validateStoreFile assertion, naming `method[0].targets[0]`. D1 fails on the target list.
  </behavior>
  <action>
RED. Create app/src/store/pen-step-roundtrip.test.js. Copy the harness from app/src/store/pen-note-roundtrip.test.js. `import 'fake-indexeddb/auto'` is the first import. A beforeEach sets `globalThis.indexedDB = new IDBFactory()`. Use a fixed NOW string and fixed child ids.

Write two small local helpers in the test file:
- `savedThroughPen`: takes a store, the opened version, the save kind ('new' or 'over') and an edit function. It runs the pen's own save path, in the order usePenDraft.checkSave and useVersionPen use it: penDraftFromVersion, then setPenField for versionLabel, then the edit, then expect penSaveBlock(...) toBeNull, then penFieldsFromDraft, then createChildVersion + createVersion, or saveOverVersion + saveVersion with `{ expected }`. Build the scoped versions with versionsForRecipe over `listVersions()`, excluding the opened version's id for 'over'. It returns the saved id.
- `roundTrip`: exports the store, JSON-roundtrips the file, asserts validateStoreFile and importStore into a fresh store, and returns the second repository.

Use `it.each` over the two saves. Add D1 to the penFieldsFromDraft describe in app/src/domain/penDraft.test.js. Build D1's step targets with setPenStepTarget, or on a structuredClone of the draft. Run the two files and confirm the failures named in the behavior block. Commit only these two test files by explicit path: `test: the version pen stores a target with both sides blank, and the backup refuses it`.

GREEN. In app/src/domain/lineage.js, add the `export` keyword to the existing module-private hasWords, and nothing else. Do not add a third copy of that predicate anywhere. In app/src/domain/penDraft.js, import hasWords from './lineage.js' beside the existing imports. Add a module-private function that builds the saved method from the draft method and the opened version. For now it drops, on every step, each target where neither label nor value holds words. Use `step.targets ?? []`, as stepRequiredFields does. Every other key of a step stays as typed. penFieldsFromDraft's `method` reads that function. penDraftVersion keeps `penDraft.method` unchanged, because the pen's own live view is not the saved record.

Extend the comment above penFieldsFromDraft by one or two plain sentences stating rule (a), citing the creation editor's buildCreation. In the existing penFieldsFromDraft case "carries the draft's own version line, citation, method, titles and authored", change the method assertion from identity (toBe) to equality (toEqual). The saved method is now a new array, and for a clean draft it is equal. Record that edit in the SUMMARY as a changed existing assertion.

Run both files green, then commit penDraft.js, lineage.js and penDraft.test.js by explicit path: `fix: the version pen drops a target with both sides blank at Save, as the creation editor does`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/store/pen-step-roundtrip.test.js src/domain/penDraft.test.js src/domain/lineage.test.js</automated>
    <automated>grep -c "^export function hasWords" app/src/domain/lineage.js   [HEAD=0 EXPECT>=1]</automated>
    <automated>grep -c "expect(fields.method).toBe(" app/src/domain/penDraft.test.js   [HEAD=1 EXPECT==0]</automated>
  </verify>
  <done>R1, R2 and D1 failed before the fix, with the failure recorded, and pass after it. A pen-saved version whose live step had a both-blank target exports and re-imports through both saves. lineage.js exports hasWords, and penDraft.js imports it and declares no copy of its own. Two commits, red then green, each staged by explicit path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Case 2. A removed step's unsaveable fields save as the opened version holds them</name>
  <files>app/src/store/pen-step-roundtrip.test.js, app/src/domain/penDraft.js, app/src/domain/penDraft.test.js</files>
  <behavior>
    - R3 to R5 (round trip, it.each over both saves, as Task 1): on step 1, blank one field and then remove the step with togglePenStepRemoved. R3 blanks the lead-in (''). R4 blanks the instruction (''). R5 blanks target 0's value ('').
      - penSaveBlock is null, and export, validate and import are ok.
      - The imported step 1 has `removed: true`. Its lead-in, instruction or target 0 equals the opened version's step 1 field.
    - R6 (bound, both saves): on step 1, rewrite the instruction to 'Warm the milk first', toggle a row into its uses, then remove it. The imported step 1 holds 'Warm the milk first' and that uses list, with `removed: true`, and the round trip is ok.
    - D2 (penFieldsFromDraft): a removed step with a lead-in of spaces and an empty instruction saves with the opened step's lead-in and instruction. Its purpose, aside, uses and removed flag are as typed.
    - D3 (penFieldsFromDraft, step 2, two targets): target 0 has both sides blank and target 1 has its value blank, then step 2 is removed. The saved targets equal `[openedStep2.targets[1]]`: the drop applies, and the one-sided target falls back at its own position, not at the shifted one.
    - D4 (penFieldsFromDraft): a live step with a blank lead-in is passed through as typed. The gate refuses it, and the fallback acts only on a removed step, so a gate failure is never hidden.
    - Red before the fix: R3 to R5 fail at validateStoreFile, naming `method[0].leadIn`, `.instruction` or `.targets[0]`. R6 and D4 pass as bounds. D2 and D3 fail on the saved fields.
  </behavior>
  <action>
RED. Add R3 to R6 to app/src/store/pen-step-roundtrip.test.js through the Task 1 helpers. Add D2 to D4 to the penFieldsFromDraft describe in app/src/domain/penDraft.test.js. Build the edits with the pen's own ops: setPenStepField, setPenStepTarget, togglePenStepUses, togglePenStepRemoved. For D2 to D4, read the opened step from the same version object the draft came from. Run both files and confirm the failures named in the behavior block. Commit the two test files by explicit path: `test: the version pen stores a removed step's blank field, and the backup refuses it`.

GREEN. In app/src/domain/penDraft.js, extend the saved-method function from Task 1 for a step whose removed flag is exactly true, which is findBlockedStep's own test for removed. Find the opened step in `version.method` by `n`.
- The lead-in and the instruction each save as typed when they hold words (hasWords), else as the opened step's value.
- Each target, by its position in the draft, follows three cases:
  - both sides blank: dropped, the Task 1 rule;
  - both sides hold words: kept as typed;
  - exactly one side blank: the opened step's target at that same position.
- Decide each target by its original index before anything is dropped, so D3's position holds.
- A live step keeps only the Task 1 drop.

Add no handling for a missing opened step or a missing target at a position. Both are unreachable: the pen cannot add or remove a step or a target, and draftMatchesVersion requires the version's step keys.

Replace the comment above penFieldsFromDraft with the full rule (a) and (b), in the words of this plan's objective, in plain sentences. Name that it mirrors penDraftRows' per-portion fallback for a removed line's grams.

Run both files green, then commit penDraft.js and penDraft.test.js by explicit path: `fix: a removed step's blank lead-in, instruction or target saves as the version the pen opened on holds it`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/store/pen-step-roundtrip.test.js src/domain/penDraft.test.js src/domain/lineage.test.js src/ui/RecipePage.perStep.test.jsx</automated>
  </verify>
  <done>R3 to R5, D2 and D3 failed before the fix, with the failure recorded, and all pass after it. R6 and D4 hold as bounds. A pen-saved version with a removed step carrying a blank field exports and re-imports through both saves, and a removed step's edits that hold words are kept.</done>
</task>

<task type="auto">
  <name>Task 3: Full suite, the other-shape check, and the SUMMARY</name>
  <files>.planning/quick/261123-bdk-next-version-pen-never-save-a-step-that-/261123-bdk-SUMMARY.md</files>
  <action>
Run the full suite: `npm --prefix app test`. Record the test and file counts before (4577 tests) and after. An existing test that fails because it pinned the old pass-through of a removed step's text is a deviation. Report it by name. Do not weaken the new rule to make it pass. Stop and report if its intent conflicts with the rule.

Run the guard gates in the verify block, with BASE set to the commit this plan started from (plan_head_before).

The other-shape check: repeat the planning probe in a scratch script under `$TMPDIR`, never in the repo. Import penDraft.js, lineage.js, transfer.js and the seed data by absolute path from this worktree. Build a store file around a child saved from the stored-shape Olive Oil v1, and run validateStoreFile on it. State each shape checked and its result in the SUMMARY. The planner's results on HEAD 990076a0, all with the child path:
- Pass: a blank purpose and aside; a padded lead-in; a padded Version name; a reason of spaces; a blank Sheet title and description; a blank Before you start note; every note removed; every row's lines out; every step removed; uses toggled; an unreadable grams string ('abc') on a removed line, which falls back to the stored amount.
- FAILS, outside the two cases: a line that is removed, or that sits in a removed step, whose grams field holds a whole number of 309 or more digits. NUMERIC_GRAMS_PATTERN accepts it and Number() reads it as Infinity, so penDraftRows stores Infinity instead of falling back. The gate skips the line, IndexedDB keeps Infinity, the export writes null, and the check refuses `rows[i].portions[j].grams`. Reach: type the number into a live line, then remove that line or its step, then save. A live line is refused by gramsDraftMessage.
- Not reachable through the app: a kept draft step without a targets array. fitsMethodStep allows it, but only the app writes drafts, from a pen draft that always holds the array.

Confirm or correct each of these. Fix none of them.

Write the SUMMARY with:
- the rule, in the exact words of the objective's rule list;
- the trace of how a removed step was stored;
- red output for each case, then green, and the suite counts;
- the changed existing assertion (toBe to toEqual) and any other deviation;
- the other-shape list;
- a "For the orchestrator" section. Bug row bug-pen-saves-step-backup-refuses can close: the executor has no ArtifactData, so the orchestrator closes it. The Infinity grams shape is a new bug for Mark to triage: a candidate bug row with severity, detail, a cause worded as unverified, and options fix, defer and not-a-bug. The row for the Required word on a target chip (decide-p12-pen-target-required-place) is untouched.

State that nothing was measured in a browser or on a device. All results are Vitest, in node.

Commit only the SUMMARY by explicit path, as the last commit: `docs: summary for the version pen's saved-step rule`.

Executor rules for this whole plan:
- Domain code stays framework-free under app/src/domain.
- Tests come first: a failing test commit before each fix commit.
- Stage explicit paths only. Never use `git add -A` or `git add .`. A designer is committing sketch files on main at the same time.
- Never write app/dist, never start a dev or preview server or a second Vite process, and leave port 4173 alone.
- Do not touch .planning/state.json.
- Commit messages are plain English.
- Changes are surgical: no edits under app/src/ui, and none to transfer.js, db.js or repository.js.
  </action>
  <verify>
    <automated>npm --prefix app test</automated>
    <automated>git diff --quiet "$BASE" HEAD -- app/src/ui app/src/store/transfer.js app/src/store/db.js app/src/store/repository.js app/src/domain/creationSave.js</automated>
    <automated>grep -c "saves as the version the pen opened on holds it" .planning/quick/261123-bdk-next-version-pen-never-save-a-step-that-/261123-bdk-SUMMARY.md   [HEAD=absent EXPECT>=1]</automated>
  </verify>
  <done>The full suite passes with 4577 plus the new tests. The guard gate holds: the git diff exits 0, so there is no on-screen word change, no store shape change, and db.js (DB_VERSION 10) is untouched. The SUMMARY states the rule, the trace, red and green for each case, the counts and the other-shape list, including the Infinity grams finding reported and not fixed. It is committed last, by explicit path.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema are involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| pen draft to stored version | What the maker typed, including a kept draft read back from the drafts store, becomes a stored version record at Save |
| store to backup file to store | exportStore writes JSON; importStore accepts only what validateStoreFile passes |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-bdk-01 | Denial of service | penFieldsFromDraft (both pen saves) | high | mitigate | The saved-step rule (a) and (b) means a pen-saved step always passes validateStep. pen-step-roundtrip.test.js proves export, validate and import for each case through both saves |
| T-bdk-02 | Tampering | validateStoreFile (transfer.js) | medium | mitigate | The fix lives at the writer and never loosens the import check. The Task 3 guard gate requires transfer.js, db.js and repository.js unchanged |
| T-bdk-03 | Tampering | opened-step lookup in penDraft.js | low | accept | The opened step is found by `n` with Array find over version.method. No bracket read or write uses a maker-typed key, so no prototype key is reached. draftMatchesVersion already refuses a kept draft whose step keys differ from the version's |
| T-bdk-04 | Repudiation / integrity | stored removed step | low | accept | A removed step's unsaveable field is replaced by the opened version's own value, never invented. The SUMMARY states the rule so the stored record is explainable |
| T-bdk-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- `npm --prefix app test` passes: 4577 before, plus the new tests.
- R1 to R5 failed red before their fix, and all R and D cases pass green after it.
- Guard gates: no diff under app/src/ui, transfer.js, db.js, repository.js or creationSave.js since BASE; DB_VERSION is still 10.
- The SUMMARY states the rule verbatim and lists every other shape checked.
</verification>

<success_criteria>
- A version saved through either pen save never carries a step validateStoreFile refuses, for both cases. Each case is proven by an export, then import, round trip that failed before the fix.
- A removed step's edits that hold words are kept, and only refused fields are replaced.
- No on-screen word change, no store shape change, no DB_VERSION change, and the full suite is green.
- Other failing shapes are reported, not fixed: at least the Infinity grams case.
</success_criteria>

<output>
Create `.planning/quick/261123-bdk-next-version-pen-never-save-a-step-that-/261123-bdk-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
