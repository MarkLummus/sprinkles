---
phase: quick-261004-szl
plan: 01
quick_id: 261004-szl
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/BatchRow.dates.test.jsx
  - app/src/ui/BatchRow.signed.test.jsx
  - .planning/quick/261004-szl-drop-the-against-version-suffix-from-the/261004-szl-SUMMARY.md
autonomous: true

estimate:
  tokens: 35000
  raw_tokens: 35000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The batch read view's provenance row reads `<dt>Recorded</dt><dd>4 Aug 2026</dd>` for the seeded 2 Aug batch: the record date alone, with no version after it. The dt still says Recorded. This is Mark's decision of 2026-10-04: the page already shows the version, as the save confirmation does since quick 261004-ly3."
    - "The Recorded row is still the first fact in `dl.batch-row__provenance` and still comes after the measured cells. The Changed row is unchanged."
    - "BatchRow no longer declares the version-name prop. RecipePage no longer computes it or passes it. RecipePage.jsx no longer imports the two lineage helpers that only that value used. `versionsForRecipe` stays imported because ~line 1840 still uses it."
    - "No test fixture passes the dropped prop to BatchRow."
    - "The test changed first and was red against the old component. Commit order is test(261004-szl), then fix(261004-szl), then refactor(261004-szl)."
    - "`npm --prefix app test` passes with no test removed. Under app/, the 261004-szl commits change only the five files listed in files_modified."
  artifacts:
    - path: app/src/ui/BatchRow.jsx
      provides: "the Recorded row printing recordDateWords(openBatch.recordedAt) alone"
      contains: "<dd>{recordDateWords(openBatch.recordedAt)}</dd>"
    - path: app/src/ui/BatchRow.test.jsx
      provides: "the renamed Recorded-fact test pinning the date alone"
      contains: "Recorded fact"
  key_links:
    - from: app/src/ui/RecipePage.jsx (the <BatchRow> element in aside.notebook-log, ~line 2160)
      to: app/src/ui/BatchRow.jsx (the props list, ~lines 400-435)
      via: "after this change the element passes no version-name prop and BatchRow declares none"
      pattern: "<BatchRow"
---

<objective>
The batch read view's Recorded row shows the record date alone, for example "4 Aug 2026", with no version after it.

Purpose: Mark decided on 2026-10-04 to drop the suffix. The page already shows the version, the same reasoning that took it out of the save confirmation in quick 261004-ly3. Once the suffix is gone, nothing reads the version name that RecipePage computes and passes to BatchRow, so this plan also removes that value, the prop, the two imports that only it used, and the test fixtures that pass it.

Output: the failing test first, then the one-line fix in BatchRow.jsx, then the cleanup commit, and a SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

<interfaces>
The planner read these facts at HEAD f281024. Check them again before you rely on them.

- app/src/ui/BatchRow.jsx line 2 imports `formatRecordDate, readMeasured, recordDateWords, sortedBatches, tastingProvenance` from '../domain/batch.js'. `recordDateWords` is also used at ~lines 355, 598, 624 and 633, so the import stays.
- app/src/ui/BatchRow.jsx ~lines 422-426: a four-line `//` comment block (it begins "The Recorded line's own version identity (03.5-07, decisions_recorded") followed by the destructured prop with a null default. Line 427 starts the next comment ("The Record opener, moved here from VersionRow.jsx"); leave that one alone.
- app/src/ui/BatchRow.jsx ~lines 1115-1119: `<dl className="batch-row__provenance">`, `<div>`, `<dt>Recorded</dt>`, then line 1118, a dd holding a template string. The string is `recordDateWords(openBatch.recordedAt)`, then the word "against", then the version name prop with a fallback to `openBatch.snapshot.versionLabel`. That line is the only place the prop is read (the planner checked with `grep -nw`).
- app/src/ui/BatchRow.test.jsx:
  - lines 60-89: the `renderBatchRow(props)` fixture. Line 83 passes the prop as the string "Version 1 · 50 g oil · 800 g".
  - lines 1319-1324: the test to change. Line 1319 has the old title, which says the fact names the version by identity through the prop. Line 1321 is `expect(markup).toMatch(/<dl class="batch-row__provenance"><div><dt>Recorded<\/dt><dd>4 Aug 2026 against Version 1 · 50 g oil · 800 g<\/dd>/);`. Lines 1322-1323 check that the Recorded dt comes after the end of the measured cells. Keep those two lines.
  - No other test in the app reads the Recorded row. The planner grepped app/src for "Recorded" in test files and found only lines 1321 and 1323.
- app/src/ui/BatchRow.dates.test.jsx line 78 and app/src/ui/BatchRow.signed.test.jsx line 88 pass the same prop string in their own fixtures. Neither file asserts on that string anywhere else (the planner grepped "Version 1 · 50 g oil" in both).
- app/src/ui/RecipePage.jsx:
  - lines 10-19: the lineage import, with one name per line: `createChildVersion`, `saveOverVersion`, `versionsForRecipe` (13), `sortedVersions` (14), `versionIdentity` (15), `blockedSaveMessage`, `blockedSaveRowId`, `parseGramsDraft`.
  - lines 1968-1972: a four-line `//` comment ("The batch log's own Recorded line names the version by identity …") and then the const that calls the two helpers over `versionsForRecipe(versions, version.recipeId)`. Line 1973 is blank, and a blank line also sits above at 1967.
  - line 2162: the prop passed on the `<BatchRow` element inside `aside.notebook-log`.
  - `grep -nw` at plan time: `sortedVersions` appears only at lines 14 and 1972. `versionIdentity` appears only at 15, 1969 (comment) and 1972. `versionsForRecipe` appears at 13, 1840 and 1972, so it stays imported.
- Other modules (VersionRow.jsx, RecipeList.jsx, domain/historyRail.js, domain/lineage.js and its tests) import and use `versionIdentity` themselves. Do not touch them.
- Baseline at plan time: BatchRow.test.jsx, BatchRow.dates.test.jsx and BatchRow.signed.test.jsx together run 3 files and 179 tests, all passing.
- Do not run `npm --prefix app run build`. The build rewrites app/dist, which the preview server on :4173 serves, and that server must not be touched. Do not start any Vite process. Vitest runs are fine. The test suites import RecipePage.jsx and BatchRow.jsx, so a syntax slip in either file fails the suite.
</interfaces>
</context>

<!-- planner-discipline-allow: versionName -->
<!-- planner-discipline-allow: versionIdentity -->
<!-- planner-discipline-allow: sortedVersions -->

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Pin the Recorded row as the date alone in a failing test, then drop the suffix in BatchRow</name>
  <files>app/src/ui/BatchRow.test.jsx, app/src/ui/BatchRow.jsx</files>
  <behavior>
    - The renamed test renders the seeded 2 Aug batch in reading mode. It expects `<dl class="batch-row__provenance"><div><dt>Recorded</dt><dd>4 Aug 2026</dd>` exactly, so the dd ends right after the year.
    - The existing ordering check stays as it is: the Recorded dt comes after the end of the measured cells.
  </behavior>
  <action>
RED. In app/src/ui/BatchRow.test.jsx, change only the `it` at ~lines 1319-1324. Rename it so the title contains the phrase "Recorded fact" and says what is now true. Suggested title: "renders the Recorded fact as supporting provenance: the record date alone, since the page already shows the version (261004-szl)". In the toMatch regex on ~line 1321, remove the version suffix so the dd closes right after "4 Aug 2026"; the regex becomes the provenance dl, div, the Recorded dt, then `<dd>4 Aug 2026<\/dd>`. Keep the two measuredEnd lines unchanged. In this step, do not touch the fixture prop at line 83 or any other test. Run the first verify command and confirm the test FAILS. Today the received markup still carries the suffix, so record the received dd text for the SUMMARY. Commit only BatchRow.test.jsx with the message `test(261004-szl): pin the Recorded row as the record date alone`.

GREEN. In app/src/ui/BatchRow.jsx, line ~1118, make the dd print `recordDateWords(openBatch.recordedAt)` as a plain JSX expression with no template string, so it renders "4 Aug 2026". Keep `<dt>Recorded</dt>`, the dl, the div and the Changed row exactly as they are. The edit leaves the version-name prop unread, so remove its destructured entry `versionName = null,` at ~line 426 and its four-line comment block at ~lines 422-425. Keep the comment that starts at ~line 427. Add no new comment that names the dropped prop or the suffix. Run the first verify command (now green), then the three BatchRow files together (second verify command). Commit only BatchRow.jsx with the message `fix(261004-szl): the batch read view's Recorded row shows the date alone`.

Stage by explicit path for both commits, never `git add -A` or `.`. Commit messages are in English and end with these two lines:
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01DnSshE2JfScJcTaMMxNapN
Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/BatchRow.test.jsx -t "Recorded fact"</automated>
    <automated>npm --prefix app test -- src/ui/BatchRow.test.jsx src/ui/BatchRow.dates.test.jsx src/ui/BatchRow.signed.test.jsx</automated>
    <automated>! grep -nw 'versionName' app/src/ui/BatchRow.jsx</automated>
  </verify>
  <done>
The filtered run failed before the fix, and the SUMMARY quotes the received dd text. It passes after the fix. The three BatchRow files pass with 179 tests, the same count as before. BatchRow.jsx no longer mentions the prop. There are two commits, test first and then fix, and each touches only its own file.
  </done>
</task>

<task type="auto">
  <name>Task 2: Remove the orphans the fix leaves in RecipePage and the test fixtures, run the full suite, write the SUMMARY</name>
  <files>app/src/ui/RecipePage.jsx, app/src/ui/BatchRow.test.jsx, app/src/ui/BatchRow.dates.test.jsx, app/src/ui/BatchRow.signed.test.jsx, .planning/quick/261004-szl-drop-the-against-version-suffix-from-the/261004-szl-SUMMARY.md</files>
  <action>
First re-run the grep checks from the interfaces block (`grep -nw` for `versionName` across app/src, and for `sortedVersions`, `versionIdentity` and `versionsForRecipe` in RecipePage.jsx). They confirm that each item below has no remaining use. Remove an item only if the grep shows nothing else uses it. If something new does use it, leave that item and say so in the SUMMARY.

In app/src/ui/RecipePage.jsx:
- Delete the `versionName={versionName}` line on the `<BatchRow` element (~line 2162). Keep every other prop.
- Delete the four-line comment and the const that computes the version name (~lines 1968-1972), plus one of the two blank lines around them, so a single blank line separates handleSaveRecipe from the next comment ("The two values Method receives").
- In the lineage import (~lines 10-19), delete only the `sortedVersions,` and `versionIdentity,` lines. Keep `versionsForRecipe`, which ~line 1840 uses, and every other name.

In the three BatchRow test fixtures, delete the line that passes `versionName="Version 1 · 50 g oil · 800 g"`: BatchRow.test.jsx ~line 83, BatchRow.dates.test.jsx ~line 78 and BatchRow.signed.test.jsx ~line 88. After Task 1, BatchRow no longer reads that prop, so the line means nothing. Change nothing else in these files.

Then run the verify commands. The full suite must pass with no test removed; report the actual file and test counts. The scope check must list only the five app/ files in files_modified. Commit RecipePage.jsx and the three test files by explicit path with the message `refactor(261004-szl): drop the version name the Recorded row no longer uses`. Use the same two trailer lines as Task 1. Do not push. Do not run the build and do not start Vite; the interfaces block explains why.

Write 261004-szl-SUMMARY.md in this quick directory. It records:
- the before and after dd text;
- the RED evidence (the received text) and the GREEN run;
- each orphan removed, with the grep that proved it was unused;
- `versionsForRecipe` kept, and why;
- the full-suite counts;
- the scope-check output;
- why the build was skipped.
No device check is needed: the change removes text from one dd, and the unit test pins the exact markup. Commit the SUMMARY by explicit path with the message `docs(261004-szl): add the summary`.
  </action>
  <verify>
    <automated>! grep -rnw 'versionName' app/src</automated>
    <automated>! grep -nwE 'sortedVersions|versionIdentity' app/src/ui/RecipePage.jsx</automated>
    <automated>grep -nw 'versionsForRecipe' app/src/ui/RecipePage.jsx</automated>
    <automated>npm --prefix app test</automated>
    <automated>git log --name-only --format= --grep="261004-szl" -- app/</automated>
  </verify>
  <done>
No file under app/src mentions the dropped prop. RecipePage.jsx no longer imports or calls the two lineage helpers. The `versionsForRecipe` grep prints two lines: the import and the use at ~line 1840 (the line numbers shift up by about two once the imports are removed). The full suite passes with no test removed. Under app/, the 261004-szl commits touch exactly BatchRow.jsx, BatchRow.test.jsx, BatchRow.dates.test.jsx, BatchRow.signed.test.jsx and RecipePage.jsx. The SUMMARY is committed.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored record → batch read view | `openBatch.recordedAt` is read back from IndexedDB and rendered as React text |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261004-szl-01 | Tampering | BatchRow Recorded dd | low | accept | The dd still renders a plain string as React text, and the project bans dangerouslySetInnerHTML under app/src. The change removes maker-authored text from the line and adds no markup path. |
| T-261004-szl-02 | Repudiation | batch provenance | low | accept | The record date itself is unchanged and still pinned by the test. The version stays visible elsewhere on the page, per Mark's decision of 2026-10-04. |
| T-261004-szl-SC | Tampering | npm/pip/cargo installs | high | accept | This plan installs no package, so the legitimacy gate does not apply. |
</threat_model>

<verification>
- `npm --prefix app test -- src/ui/BatchRow.test.jsx -t "Recorded fact"` was red with only the test commit and green after the fix commit.
- `npm --prefix app test` passes with no test removed.
- No file under app/src mentions the dropped prop. `grep -nw 'versionsForRecipe' app/src/ui/RecipePage.jsx` prints the import line and the ~line 1840 use, and RecipePage.jsx has neither of the two removed helpers.
- `git log --name-only --format= --grep="261004-szl" -- app/` lists only the five app/ files in files_modified (repeats across commits are expected).
</verification>

<success_criteria>
On the batch read view the maker sees "Recorded" and the date, for example "4 Aug 2026", and no version after it. The code that only fed the old suffix is gone, nothing still in use was removed, and the change was written test-first in atomic commits.
</success_criteria>

<output>
Create `.planning/quick/261004-szl-drop-the-against-version-suffix-from-the/261004-szl-SUMMARY.md` when done.
</output>
