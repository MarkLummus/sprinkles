---
phase: quick-261123-ghf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/domain/penDraft.js
  - app/src/domain/penDraft.test.js
  - app/src/store/pen-step-roundtrip.test.js
  - .planning/quick/261123-ghf-bug-pen-huge-grams-on-removed-line-backup-refuses-mark-answe/261123-ghf-SUMMARY.md
autonomous: true
requirements: [bug-pen-huge-grams-on-removed-line-backup-refuses]

must_haves:
  truths:
    - "A version saved through the pen (Save as new version and Save over this version) from a draft in which a removed line's amount holds a whole number of 309 digits exports, passes validateStoreFile and imports into a fresh store; that line holds the amount the version the pen opened on holds for it"
    - "The same holds for a line that is not removed but sits in a removed step"
    - "On a live line a 309-digit amount is still refused at Save with the sentence \"<ingredient>'s amount is not a number\", naming that row and line; the pen's live figures read that line's stored amount, as they already do for an amount such as 'abc'"
    - "parseGramsDraft, the pen gate and every other reader of it are unchanged: lineage.js, everything under app/src/ui, transfer.js, db.js and repository.js have no diff (DB_VERSION stays 10, no stored shape change, no on-screen word change)"
    - "The full suite passes: 137 files and 4596 tests before, plus the new ones"
  artifacts:
    - path: app/src/domain/penDraft.js
      provides: "penDraftRows falls back to the portion's stored amount when the typed amount does not read as a finite number"
    - path: app/src/store/pen-step-roundtrip.test.js
      provides: "Round trip through the repository seam for both line cases and both saves"
    - path: app/src/domain/penDraft.test.js
      provides: "Unit tests pinning the finite fallback on the saved fields and the live figures, and the gate's refusal on a live line"
  key_links:
    - from: app/src/ui/usePenDraft.js
      to: app/src/domain/penDraft.js
      via: "checkSave calls penFieldsFromDraft, whose rows come from penDraftRows"
    - from: app/src/domain/penDraft.js
      to: app/src/domain/lineage.js
      via: "penDraftRows reads parseGramsDraft, which returns Infinity for a 309-digit whole number; the finite check sits at this caller, as creation.js finiteGrams and creationSave.js gramsOf already do"
    - from: app/src/store/pen-step-roundtrip.test.js
      to: app/src/store/transfer.js
      via: "exportStore, validateStoreFile and importStore prove the backup round trip"
---

<objective>
Fix Mark's List bug `bug-pen-huge-grams-on-removed-line-backup-refuses` (Mark answered Fix it, 2026-11-23). Found by quick 261123-bdk's other-shape check (its SUMMARY, "Other-shape check" and "For the orchestrator").

The bug, confirmed at planning time by a node probe against the domain modules on HEAD fa19967d:
- In the Next version pen a maker types a whole number of 309 or more digits into a line's amount, then removes that line, or removes the step the line sits in, then saves.
- NUMERIC_GRAMS_PATTERN (lineage.js) accepts the digits. Number() reads them as Infinity, so parseGramsDraft returns Infinity, not null.
- penDraftRows (penDraft.js) falls back to the stored amount only on null (`?? portion.grams`), so it keeps Infinity, and penFieldsFromDraft hands it to createChildVersion or saveOverVersion.
- The pen gate (lineage.js findBlockedRow) skips a removed line and a line in a removed step, so nothing refuses it. IndexedDB keeps Infinity, the export writes null, and validateStoreFile refuses `rows[i].portions[j].grams: expected a finite number of at least zero, got null`. The backup will not import.
- Probe results: removed line row-02 (Heavy cream, step 3): gate null, saved grams Infinity. Line row-03 (Graza Drizzle) with step 8 removed: gate null, saved grams Infinity. The same line left live: the gate refuses with "Heavy cream's amount is not a number", and the live figures read Infinity.

The rule this plan builds (the SUMMARY states it in these words): a line's amount that does not read as a finite number saves as the amount the version the pen opened on holds for that line, as a blank or unreadable amount already does. A whole number of 309 digits reads as Infinity, so it falls back.

Where the fix goes, and why. There were two ways to fix it, and this plan picks the first:
1. CHOSEN: a finite check in penDraftRows (app/src/domain/penDraft.js), the file the item names. It follows the codebase's own precedent: creation.js `finiteGrams` and creationSave.js `gramsOf` each guard parseGramsDraft's result with Number.isFinite at the caller. gramsDraftMessage's own comment in lineage.js records that parseGramsDraft returns Infinity for a 309-digit amount.
2. NOT CHOSEN: making parseGramsDraft return null for a value that is not finite (lineage.js). That reaches every other reader too: the batch record's as-made figures (recordDraft.js), the creation editor's fold (creationSteps.js) and range ends (creation.js), and the pen table's own per-line share cell (IngredientTable.jsx). That breaks the "minimum change, nothing adjacent" rule. lineage.js is also edited later in this batch by 261123-ghk (buildDiff).

The check applies to every line, not only to a removed one, because penDraftRows already applies one fallback to every portion. Restricting it to removed lines would add a branch and leave the pen's live figures reading Infinity. On a live line the effect is bounded:
- Save is still refused by the gate, which reads the draft's typed string, not penDraftRows, so the gate does not change.
- The pen's live figures read that line's stored amount, as they already do for 'abc'.
The SUMMARY states this as the one behaviour change outside the removed cases.

Out of scope, reported and not fixed: parseGramsDraft itself; IngredientTable.jsx's own `parseGramsDraft(...) ?? portion.grams` for the per-line share cell; the batch record's as-made path; the comment in app/src/ui/sheetView.js that repeats penDraftRows' old wording. No stored shape change, no DB_VERSION change.

Purpose: every version the pen saves exports and re-imports, whatever digits a removed line held.
Output: the finite fallback in penDraftRows, round-trip and unit tests, SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/quick/261123-bdk-next-version-pen-never-save-a-step-that-/261123-bdk-SUMMARY.md
@app/src/domain/penDraft.js
@app/src/store/pen-step-roundtrip.test.js

Read these ranges only:
- app/src/domain/lineage.js lines 204-236 (NUMERIC_GRAMS_PATTERN, parseGramsDraft, gramsDraftMessage: why Infinity comes back) and lines 304-317 (findBlockedRow: the gate skips a removed line and a line in a removed step)
- app/src/domain/creation.js lines 50-56 (finiteGrams: the caller-side Number.isFinite precedent)
- app/src/domain/creationSave.js lines 35-41 (gramsOf: the same precedent)
- app/src/domain/penDraft.test.js lines 1-40 and 85-107 (imports, clone(), cleanDraftFor), 239-251 (the penDraftVersion fallback case), 277-296 (the penSaveBlock row case to copy) and 434-456 (the penFieldsFromDraft describe)
- app/src/store/transfer.js line 109 (the grams check that refuses null)

Facts checked at planning time (HEAD fa19967d):
- Olive Oil v1 (`oliveOilVersion`, and the version the seeded store returns) rows by id:
  - `row-02` Heavy cream: one line, step 3, 252.8 g.
  - `row-03` Graza Drizzle: one line, step 8, 40 g.
  - Steps 1 to 10, all live.
- createChildVersion keeps row ids, so the clean child the Save over tests open on has the same `row-02` and `row-03`. Read each expected amount from the opened version object, never as a typed literal.
- `Number('9'.repeat(309))` is Infinity. `Number('9'.repeat(308))` is 1e308, which is finite and passes the grams check.
- penSaveBlock is null for both removed cases and refuses the live case with "Heavy cream's amount is not a number".
- `npm --prefix app test -- src/store/pen-step-roundtrip.test.js src/domain/penDraft.test.js` runs green: 2 files, 73 tests.
- The suite baseline is 137 files and 4596 tests. DB_VERSION is 10 (app/src/store/db.js line 8).
- No Phase 12 or Phase 11 gate probe types a 309-digit amount. The only step of 12-check.sh this change can move is `suite`.
- The gate's HEAD baseline (ends GATE2 PASS) is taken from the 261123-brl SUMMARY (run on 506d4d90) and the batch notes. It was not rerun at planning time.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: A 309-digit amount on a removed line, or on a line in a removed step, saves as the stored amount, and the backup round-trips</name>
  <files>app/src/store/pen-step-roundtrip.test.js, app/src/domain/penDraft.test.js, app/src/domain/penDraft.js</files>
  <behavior>
    - R7 (round trip, it.each over both saves, through the existing savedThroughPen and roundTrip helpers): set row-02's line 0 to a 309-digit string of 9s with setPenGrams, then remove that line with togglePenLine. penSaveBlock is null. Export, validate and import are ok. The imported row-02 line 0 has grams equal to the opened version's row-02 line 0 grams, and `removed: true`.
    - R8 (round trip, both saves): set row-03's line 0 to the same 309-digit string, then remove step 8 with togglePenStepRemoved. penSaveBlock is null. Export, validate and import are ok. The imported row-03 line 0 has grams equal to the opened version's amount for it, and step 8 has `removed: true`.
    - D5 (penDraft.test.js, penFieldsFromDraft describe): a draft with row-02's line 0 holding 309 nines and removed, and row-03's line 0 holding 309 nines with step 8 removed. Both lines save with the version's own stored amounts. Bound, in the same case on a second draft: a removed line holding 308 nines saves as `Number('9'.repeat(308))`, so the fallback is the finite test, not a digit count.
    - D6 (penDraft.test.js, penDraftVersion describe): on a live row-02 line 0 holding 309 nines, the live figures read the stored amount, as they do for 'abc'. Bound: penSaveBlock on the same draft, with a Version name typed, names `{ kind: 'row', rowId: 'row-02', index: 0 }` with the message "Heavy cream's amount is not a number", so the gate's refusal is not hidden.
    - Red before the fix: R7 and R8 fail at the validateStoreFile assertion, naming `rows[1].portions[0].grams` (R7) and `rows[2].portions[0].grams` (R8), each with "expected a finite number of at least zero, got null". D5 fails on the two saved amounts (received Infinity). D6 fails on the live figure (received Infinity). The 308-digit bound and the penSaveBlock bound pass before and after.
  </behavior>
  <action>
RED. In app/src/store/pen-step-roundtrip.test.js:
- Add setPenGrams and togglePenLine to the existing import from '../domain/penDraft.js'.
- Add one sentence to the header comment naming the second bug it pins (`bug-pen-huge-grams-on-removed-line-backup-refuses`).
- Add a module-level constant for the 309-digit string, built with `'9'.repeat(309)`.
- Add a new describe after the last one, holding R7 and R8 as `it.each(SAVES)`, through the existing savedThroughPen, roundTrip and setUp helpers unchanged. Find rows by id (`row-02`, `row-03`) in `opened.rows` and in the imported version's rows. Read the expected amounts from `opened`.

In app/src/domain/penDraft.test.js, add D5 inside the penFieldsFromDraft describe and D6 inside the penDraftVersion describe. Build the drafts from clone() and cleanDraftFor, and edit them with the pen's own ops: setPenGrams, togglePenLine, togglePenStepRemoved. Read every expected amount from the same version object the draft came from.

Run the two files and confirm the failures named in the behavior block. Record the red output for the SUMMARY. Commit only these two test files by explicit path: `test: the version pen stores a 309-digit amount on a removed line, and the backup refuses it`.

GREEN. In app/src/domain/penDraft.js, in penDraftRows only:
- Read `parseGramsDraft(draftPortion.grams)` once into a local.
- A portion's grams is that number when Number.isFinite holds for it. Otherwise it is `portion.grams`, the portion's stored amount. This replaces the `?? portion.grams` fallback, and follows creation.js finiteGrams and creationSave.js gramsOf, which guard parseGramsDraft's result the same way at the caller.
- Do not change parseGramsDraft, NUMERIC_GRAMS_PATTERN, gramsDraftMessage or anything else in lineage.js.
- Add no new export and no helper of its own.
- Leave penFieldsFromDraft, savedMethod and penDraftVersion as they are. Both read penDraftRows, so the one change covers the saved fields and the live figures.

Extend the comment above penDraftRows by one plain clause: the fallback also applies when the typed amount reads as a number that is not finite (a whole number of 309 digits reads as Infinity), because a backup holding one would not import. Leave the comment's other words as they are.

Run both files green, plus lineage.test.js, then commit penDraft.js by explicit path: `fix: the version pen saves a removed line's amount that is not a finite number as the stored amount`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/store/pen-step-roundtrip.test.js src/domain/penDraft.test.js src/domain/lineage.test.js</automated>
    <automated>grep -v '^\s*//' app/src/domain/penDraft.js | grep -c "Number.isFinite"   [HEAD=0 EXPECT>=1]</automated>
    <automated>grep -c "repeat(309)" app/src/store/pen-step-roundtrip.test.js   [HEAD=0 EXPECT>=1]</automated>
    <automated>grep -c "repeat(309)" app/src/domain/penDraft.test.js   [HEAD=0 EXPECT>=1]</automated>
  </verify>
  <done>R7, R8, D5 and D6 failed before the fix, and the failures are recorded. All pass after it, and the two bounds held both before and after. A pen-saved version whose removed line, or whose line in a removed step, held a 309-digit amount exports and re-imports through both saves, holding the stored amount for that line. There are two commits, red then green, each staged by explicit path. lineage.js is unchanged.</done>
</task>

<task type="auto">
  <name>Task 2: Full suite, guard gates, the Phase 12 gate, and the SUMMARY</name>
  <files>.planning/quick/261123-ghf-bug-pen-huge-grams-on-removed-line-backup-refuses-mark-answe/261123-ghf-SUMMARY.md</files>
  <action>
Run the full suite with `npm --prefix app test`. If the npm form hangs inside the worktree, run `sh -c 'cd app && npx vitest run'` instead; 12-check.sh uses the same runner for the same reason. Record the counts before (137 files, 4596 tests) and after. With the tests written as planned, the new tests number six: R7 and R8 over both saves, D5 and D6.

An existing test that fails because it pinned Infinity reaching a pen row or the pen's live figures is a deviation. Report it by name. Do not weaken the fallback to make it pass. Stop and report if the test's intent conflicts with the rule.

Run the guard gate in the verify block, with BASE set to the commit this plan started from (plan_head_before).

Run the Phase 12 gate once, in the background: `sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh`. It must end `GATE2 PASS`. This plan changes no gate file, and only the gate's `suite` step can move with this change.
- If a later step (pdf, sim, board, phone, band, tabs, keys) fails for a reason this change cannot reach, such as the Simulator or WebKit being held by another worktree in the same wave, rerun the gate once.
- If it fails again, record the step name and its output in the SUMMARY and hand it to the orchestrator.
- Never edit a gate file.

Write the SUMMARY with:
- the rule, in the exact words of the objective;
- the trace (pattern, Number, parseGramsDraft, penDraftRows, gate skip, IndexedDB, export null, check);
- why the fix sits in penDraftRows and not in parseGramsDraft (the objective's two options);
- red output for each case, then green, the suite counts, and the gate's last line;
- the one behaviour change outside the removed cases: on a live line the pen's live figures read the stored amount, and the gate still refuses Save with the same sentence;
- any deviation;
- a "For the orchestrator" section with these points:
  - Mark's List row `bug-pen-huge-grams-on-removed-line-backup-refuses` can close once this lands. The executor has no ArtifactData, so the orchestrator closes it.
  - Three adjacent readers were not changed and are reported for triage, none of them verified in the app:
    - IngredientTable.jsx keeps its own `parseGramsDraft(...) ?? portion.grams` for the per-line share cell, so a live 309-digit line's share cell may read differently from the row's other figures until the gate refuses Save.
    - The batch record's as-made path (recordDraft.js buildChurnFieldsFromDraft) keeps what parseGramsDraft returns. An as-made Infinity would export as null, which the store check accepts for as-made, so it would read as never touched. Whether the record's own gate refuses such an entry first was not checked.
    - The comment in app/src/ui/sheetView.js that repeats penDraftRows' fallback wording now omits the finite clause.

State that nothing was measured in a browser or on a device: all results are Vitest in node, plus the gate's own probes, which are device-unverified.

Commit only the SUMMARY by explicit path, as the last commit: `docs: summary for the version pen's finite amount fallback`.

Executor rules for this whole plan:
- Domain code stays framework-free under app/src/domain.
- Tests come first: the failing test commit lands before the fix commit.
- Stage explicit paths only. Never use `git add -A` or `git add .`.
- Never write app/dist. Never start a dev or preview server or a second Vite process. Leave port 4173 alone. 12-check.sh builds to its own scratch folder and starts no server.
- Do not touch .planning/state.json or .planning/STATE.md.
- Commit messages are plain English.
- Changes are surgical: nothing under app/src/ui, and no change to lineage.js, transfer.js, db.js or repository.js.
  </action>
  <verify>
    <automated>npm --prefix app test</automated>
    <automated>git diff --quiet "$BASE" HEAD -- app/src/ui app/src/domain/lineage.js app/src/store/transfer.js app/src/store/db.js app/src/store/repository.js</automated>
    <automated>sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh 2>&1 | tail -n 1 | grep -c '^GATE2 PASS$'   [HEAD=1 EXPECT==1 @506d4d90 GUARD MUTATION: penDraftRows storing Infinity again turns the suite step red once R7 and R8 exist]</automated>
    <automated>grep -c "reads as a number that is not finite" app/src/domain/penDraft.js   [HEAD=0 EXPECT>=1]</automated>
  </verify>
  <done>The full suite passes with 4596 tests plus the new ones. The guard gate's git diff exits 0, so there is no change under app/src/ui and none to lineage.js, transfer.js, db.js or repository.js (DB_VERSION 10). 12-check.sh ends GATE2 PASS, or a failure this change cannot reach is recorded with its output and handed to the orchestrator. The SUMMARY states the rule, the trace, the choice of fix site, red and green, the counts, the live-line behaviour and the three adjacent readers. It is committed last, by explicit path.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema are involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| pen draft to stored version | What the maker typed in an amount field, including a kept draft read back from the drafts store, becomes a stored version's line at Save |
| store to backup file to store | exportStore writes JSON (Infinity becomes null); importStore accepts only what validateStoreFile passes |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ghf-01 | Denial of service | penDraftRows, read by penFieldsFromDraft (both pen saves) | high | mitigate | A typed amount that does not read as a finite number falls back to the stored amount, so a pen-saved line always passes the grams check. pen-step-roundtrip.test.js R7 and R8 prove export, validate and import through both saves |
| T-ghf-02 | Tampering | validateStoreFile (transfer.js) | medium | mitigate | The fix sits at the writer and never loosens the import check. The Task 2 guard gate requires transfer.js, db.js, repository.js and lineage.js unchanged |
| T-ghf-03 | Repudiation / integrity | a removed line's stored amount | low | accept | The fallback stores the amount the version the pen opened on holds for that line, never an invented one. A removed line does not count in the figures, and the SUMMARY states the rule so the stored record is explainable |
| T-ghf-04 | Tampering | pen gate on a live line | low | mitigate | The gate reads the typed string through gramsDraftMessage, not penDraftRows, so a live 309-digit amount is still refused at Save. D6's penSaveBlock bound pins it |
| T-ghf-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- `npm --prefix app test` passes: 137 files and 4596 tests before, plus the new tests.
- R7, R8, D5 and D6 failed red before the fix and pass green after it. The 308-digit bound and the live-line gate bound pass throughout.
- Guard gate: no diff under app/src/ui or to lineage.js, transfer.js, db.js or repository.js since BASE. DB_VERSION is still 10.
- 12-check.sh ends GATE2 PASS.
</verification>

<success_criteria>
- A version saved through either pen save never carries a line amount validateStoreFile refuses, for a removed line and for a line in a removed step. Each case is proven by an export-then-import round trip that failed before the fix.
- A live 309-digit amount is still refused at Save with the same sentence.
- No on-screen word change, no stored shape change, no DB_VERSION change, and the full suite and the Phase 12 gate are green.
</success_criteria>

<output>
Create `.planning/quick/261123-ghf-bug-pen-huge-grams-on-removed-line-backup-refuses-mark-answe/261123-ghf-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
