---
phase: quick-261031-fyo
plan: 01
quick_id: 261031-fyo
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/useVersionPen.js
  - app/src/ui/useBatchRecording.js
  - app/src/ui/useRouteIntents.js
  - app/src/ui/useRecordDraft.js
  - app/src/ui/RecipePage.jsx
  - app/src/ui/sheetView.js
  - app/src/router.jsx
  - app/src/domain/recordDraft.js
  - app/src/domain/penDraft.js
  - app/src/styles/app.css
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/VersionRow.record.test.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/BatchRow.dates.test.jsx
  - app/src/ui/RecipeList.test.jsx
  - app/src/ui/RecipeList.nextVersion.test.jsx
  - app/src/ui/RecipePage.test.jsx
  - app/src/ui/RecipePage.drafts.test.jsx
  - app/src/ui/RecipePage.edit.test.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - app/src/ui/RecipePage.recordTasting.test.jsx
  - app/src/ui/RecipePage.shellEffects.test.jsx
  - app/src/ui/RecipePage.stalePen.test.jsx
  - app/src/ui/RecipePage.beforeYouStart.test.jsx
  - app/src/ui/Shell.importGuard.test.jsx
  - app/src/ui/IngredientTable.test.jsx
  - app/src/ui/Method.test.jsx
  - app/src/domain/recordDraft.test.js
  - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
autonomous: true
requirements:
  - look-button-words

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The Batch margin's no-batch state, the version band below 724 and Home's filled action (lead and row) read Record batch (sketch 014 decision 11; product-requirements/05-domain-and-language.md line 153, 'Kept as they are')."
    - "The version band below 724 and Home's awaiting-tasting action (lead and row) read Record tasting."
    - "The Next version ceremony's filled action reads Save as new version, and the refused Save over this version says 'This version has a batch now. Save as new version instead.'"
    - "The version pen's removed-step flag on a row reads Remove this row. The batch pen's per-step opener reads Done differently, and its accessible name stays 'Step N, done differently': per decision 11 the visible words appear in the name when case is ignored, which is all WCAG 2.5.3 asks."
    - "Nothing else changes: no other visible word, no class, token, layout or aria-label, and no identifier (the 'record-a-tasting' opener value stays on its 23 lines). The busy labels Saving new version… and Saving this version… stay as they are."
    - "Under app/src and in the Phase 11 walk, the multi-line old-label gate finds 0 (137 under app/src at 2beebaa2). Lower-case 'done differently' remains only on aria-label and fieldLabel lines (8 other lines at 2beebaa2, 0 after)."
    - "npm --prefix app test passes 4237 tests in 130 files, the same count as at 2beebaa2. This plan edits tests and adds or removes none. Nothing is built into app/dist, which Mark's preview on port 4173 serves."
  artifacts:
    - path: app/src/ui/VersionRow.jsx
      provides: "RECORD_ACT_WORDS reads Record batch and Record tasting; the ceremony's filled action reads Save as new version"
      contains: "[NOT_YET_CHURNED]: 'Record batch'"
    - path: app/src/ui/RecipeList.jsx
      provides: "Home's filled action links read Record batch and Record tasting"
      contains: "Record tasting"
    - path: app/src/ui/BatchRow.jsx
      provides: "The no-batch state's filled action reads Record batch"
      contains: "Record batch"
    - path: app/src/ui/IngredientTable.jsx
      provides: "OrphanedRowFlag's button reads Remove this row"
      contains: "Remove this row"
    - path: app/src/ui/Method.jsx
      provides: "StepRecordingControls' opener reads Done differently; both fieldLabel names are unchanged"
      contains: "Done differently"
    - path: app/src/ui/useVersionPen.js
      provides: "VERSION_HAS_BATCH_STATUS names the button by its new words"
      contains: "Save as new version instead."
  key_links:
    - from: app/src/ui/VersionRow.jsx
      to: app/src/ui/VersionRow.test.jsx
      via: "The acts-row tests parse each button's text into a label array and compare it exactly (lines 743, 766, 779). If the word map changes and the arrays do not, those tests fail."
      pattern: "RECORD_ACT_WORDS"
    - from: app/src/ui/useVersionPen.js
      to: app/src/ui/RecipePage.stalePen.test.jsx
      via: "The stale-pen test asserts VERSION_HAS_BATCH_STATUS against a literal sentence at line 232."
      pattern: "VERSION_HAS_BATCH_STATUS"
    - from: app/src/ui/Method.jsx
      to: app/src/ui/Method.test.jsx
      via: "The on-demand tests match the opener's markup by regex (lines 81, 96) and the field's aria-label by regex (lines 82, 94). The aria-label regexes stay as they are."
      pattern: "done differently"
---

<objective>
Mark approved `look-button-words` on 2026-10-31. Sketch 014 decision 11 says boxed buttons follow the inline controls' rule: sentence case and no articles. Five visible labels in app/src break that rule. This plan changes them, along with the tests that quote them and the comments and test titles that name them.

The labels (HEAD 2beebaa2):

| Reads now | Reads after | Visible site |
|---|---|---|
| Record a batch | Record batch | `app/src/ui/BatchRow.jsx` 1313, `app/src/ui/VersionRow.jsx` 18 (RECORD_ACT_WORDS), `app/src/ui/RecipeList.jsx` 212 (Home's Link) |
| Record a tasting | Record tasting | `app/src/ui/VersionRow.jsx` 19, `app/src/ui/RecipeList.jsx` 223 (Home's Link) |
| Save as a new version | Save as new version | `app/src/ui/VersionRow.jsx` 299 |
| remove this row | Remove this row | `app/src/ui/IngredientTable.jsx` 432 |
| done differently | Done differently | `app/src/ui/Method.jsx` 488 |

Remove this step (`Method.jsx` 342) already changed in db1b2c06 and is not part of this plan.

<!-- planner-discipline-allow: Record a batch -->
<!-- planner-discipline-allow: Record a tasting -->
<!-- planner-discipline-allow: Save as a new version -->
<!-- planner-discipline-allow: remove this row -->
<!-- planner-discipline-allow: done differently -->

Decisions taken here:

1. **Done differently keeps its accessible name.** Its name stays `fieldLabel(step, false, 'done differently')`, which renders as "Step N, done differently". Decision 11 settled this ("the visible words still appear in the accessible name (WCAG 2.5.3 matches without regard to case), so it stands"). The 261031-fq1 precedent agrees: a sibling name that passes with case ignored stays in lower case, as the Skipped checkbox's "Step N, skipped" does. No other changed label carries an aria-label. Home's two Links have none, and the Batch and band buttons have none. The opener's existing markup test is tightened in place so that it pins the name and the visible words on the same button.
2. **VERSION_HAS_BATCH_STATUS follows.** `app/src/ui/useVersionPen.js` line 28 tells the maker which button to press instead, so it changes to "This version has a batch now. Save as new version instead." It is the one visible string outside decision 11's six-file table. It changes because it names the button, and a stale name would send the maker looking for words that are not on screen. The SUMMARY reports this call.
3. **Comments and test titles that name a label follow.** That includes comments in domain modules (`recordDraft.js`, `penDraft.js`) and the CSS comment in `app.css`. Edits are word-only, in place. Where a comment splits a label across a line break, drop only the article and do not reflow, so that every file keeps its line count. The one exception is in decision 6.
4. **Some things stay.** The identifiers stay: the 'record-a-tasting' opener value (23 lines), recordTastingButtonRef, onStartTasting, startTasting and AWAITING_TASTING. So do the lower-case prose "record a batch" in `app/src/store/repository.js` 192, which describes the act and is not the label, and the "remove this step" comments in `Method.jsx` 330/333, `useVersionPen.js` 134 and `penDraft.js` 366, which belong to db1b2c06 and are not on this list. "Record another batch" in `RecipePage.test.jsx` 106 stays too: it is not one of the five.
5. **The Phase 11 walk follows; nothing else outside app/src does.** `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs` belongs to the phase still open (verification human_needed). It clicks two old labels by exact name (lines 535, 704) and by name (1178, 1192), and it guards "no record act while editing" with a startsWith on the old words (1360). Left alone, the first two fail on the walk's next run and the guard passes no matter what. Its 8 lines follow. These stay as they are: the 08, 09 and 10 walks, which are records of completed phases; the sketch 010 and 011 boards and the canvas generators, which decision 11 keeps "as the record of their day"; and `DESIGN.md` 611, which belongs to Impeccable. The SUMMARY lists them.
6. **One line is deleted.** `app/src/ui/VersionRow.test.jsx` 190 already asserts `not.toContain('Record batch')`, and 191 asserts the same for the old words. After the change 191 would duplicate 190, so it is deleted. Every later line number in that file moves up by one.

Line numbers in the tasks are at 2beebaa2. Find each site by its text. The gates check text, not lines.

Purpose: every boxed control the maker presses reads in sentence case with no article, as decision 11 and the settled vocabulary require.
Output: 5 visible labels and 1 status sentence changed, about 130 test and comment lines following them, and 8 lines in the Phase 11 walk. Three commits.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/sketches/014-steps-structure-save/README.md (decision 11 only, lines 91-102: the table, what is not changed, and the aria-label ruling)
@product-requirements/05-domain-and-language.md (line 153 only: Record batch and Done differently are the settled words)

Run constraints:
- The executor works sequentially on main, with no worktree.
- Never run `npm --prefix app run build` and never write to app/dist, because Mark's preview on port 4173 serves it. Never run the Phase 11 walk either: it needs PROBE_DIST, a build.
- Only vitest runs, through `npm --prefix app test`. The whole suite takes about 6 seconds, so every task runs all of it.
- Most edits are literal word swaps on known lines. `sed -i ''` (macOS) on a named line or a unique string is fine. Read the surrounding lines before each multi-line comment edit.
- Each commit stages its task's files by name. Never `git add -A`: untracked `.review-diagnostics/` directories sit under `.planning/phases/`. No .planning file is staged except the walk in Task 3.
- Commit messages are English and end with the attribution lines the session's system-reminder gives.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Record batch, end to end: Home's link, the band's act and the Batch margin's filled action</name>
  <files>app/src/ui/BatchRow.jsx, app/src/ui/VersionRow.jsx, app/src/ui/RecipeList.jsx, app/src/ui/VersionRow.test.jsx, app/src/ui/VersionRow.record.test.jsx, app/src/ui/BatchRow.test.jsx, app/src/ui/RecipeList.test.jsx, app/src/ui/RecipeList.nextVersion.test.jsx, app/src/ui/RecipePage.drafts.test.jsx, app/src/ui/RecipePage.perStep.test.jsx, app/src/ui/RecipePage.edit.test.jsx, app/src/ui/RecipePage.shellEffects.test.jsx, app/src/ui/Shell.importGuard.test.jsx, app/src/ui/RecipePage.test.jsx</files>
  <read_first>
    - app/src/ui/VersionRow.jsx lines 13-21 (RECORD_ACT_WORDS), 66-74, 418-440
    - app/src/ui/BatchRow.jsx lines 66-72, 505-536, 770-780, 1300-1316
    - app/src/ui/RecipeList.jsx lines 104-108, 205-216
    - app/src/ui/VersionRow.test.jsx lines 182-192
  </read_first>
  <action>
One label across its three surfaces, per sketch 014 decision 11: Record a batch becomes Record batch. This proves the swap end to end before the other four labels follow. Edit the tests first, then the sources.

1. Tests. On each listed line, replace the old words with Record batch, in assertions and titles alike:
   - app/src/ui/VersionRow.test.jsx: delete line 191 (decision 6); then lines 741 (title), 743 (the label array), 923, 932.
   - app/src/ui/VersionRow.record.test.jsx: 80 (title), 82.
   - app/src/ui/BatchRow.test.jsx: 194, 199, 1750, 1751, 1754 (the regex's button text), 1758, 1761, 1835 (comment), 1857 (title), 2747, 2748, 2749.
   - app/src/ui/RecipeList.test.jsx: 124, 126, 288, 655 (a comment split across 655-656: drop only the trailing "a" on 655, so it reads Record, then batch on 656), 687, 688, 691, 693, 706, 715, 716, 726, 733, 739.
   - app/src/ui/RecipeList.nextVersion.test.jsx: 134, 136.
   - app/src/ui/RecipePage.drafts.test.jsx: 561.
   - app/src/ui/RecipePage.perStep.test.jsx: 774 (the band's textContent).
   - app/src/ui/RecipePage.edit.test.jsx: 7 (comment), 288 (title), 296, 304 (title), 309, 332.
   - app/src/ui/RecipePage.shellEffects.test.jsx: 163.
   - app/src/ui/Shell.importGuard.test.jsx: 198.
   - app/src/ui/RecipePage.test.jsx: 106 (comment; only the last item in the parenthesis changes).
2. RED. Run `npm --prefix app test` and record the failing-test count in the SUMMARY. It proves the edited tests read the rendered label.
3. Sources:
   - app/src/ui/BatchRow.jsx: line 1313 (the no-batch state's filled Button text). Comments at 70, 508, 776, 1305, and 533 (a split comment: drop only the trailing "a" on 533).
   - app/src/ui/VersionRow.jsx: line 18 (the RECORD_ACT_WORDS value for NOT_YET_CHURNED). Comments at 70 and 423. On 423 change only the Record a batch phrase: the tasting phrase that wraps from 422 is Task 2's.
   - app/src/ui/RecipeList.jsx: line 212 (the NOT_YET_CHURNED Link's text). Comment at 106 (split: drop only the trailing "a" on 106).
4. GREEN. Run the verify command. Commit the 14 files: `fix(261031-fyo): the record act reads Record batch at Home, on the band and in the Batch margin (look-button-words, sketch 014 decision 11)`.
  </action>
  <verify>
    <automated>npm --prefix app test 2>&1 | grep -E 'Tests +4237 passed \(4237\)' && test "$(perl -0777 -ne 'BEGIN{$n=0} $s=q{\s+(?:(?://|\*)\s*)?}; $n++ while /Record${s}a${s}batch\b/g; END{print $n}' $(find app/src -type f))" = 0 && test "$(grep -cE '^\s+Record batch$' app/src/ui/BatchRow.jsx)" = 1 && test "$(grep -cE '^\s+Record batch$' app/src/ui/RecipeList.jsx)" = 1 && test "$(grep -c "\[NOT_YET_CHURNED\]: 'Record batch'" app/src/ui/VersionRow.jsx)" = 1</automated>
  </verify>
  <done>
- The suite passes 4237 tests in 130 files.
- The multi-line Record-a-batch gate over app/src finds 0. It found 57 at 2beebaa2: 54 single-line occurrences and 3 split comments.
- The three positive gates each find 1. Each found 0 at 2beebaa2.
- The SUMMARY records the RED failing count.
- One commit with the 14 files.
  </done>
</task>

<task type="auto">
  <name>Task 2: Record tasting on the band and at Home</name>
  <files>app/src/ui/VersionRow.jsx, app/src/ui/RecipeList.jsx, app/src/ui/BatchRow.jsx, app/src/ui/useBatchRecording.js, app/src/ui/useRouteIntents.js, app/src/ui/RecipePage.jsx, app/src/ui/sheetView.js, app/src/ui/useRecordDraft.js, app/src/domain/recordDraft.js, app/src/ui/VersionRow.test.jsx, app/src/ui/VersionRow.record.test.jsx, app/src/ui/RecipeList.test.jsx, app/src/ui/RecipeList.nextVersion.test.jsx, app/src/ui/RecipePage.drafts.test.jsx, app/src/ui/RecipePage.recordTasting.test.jsx, app/src/ui/BatchRow.dates.test.jsx, app/src/domain/recordDraft.test.js</files>
  <read_first>
    - app/src/ui/VersionRow.jsx lines 17-21, 104-110, 418-425
    - app/src/ui/RecipeList.jsx lines 196-226
  </read_first>
  <action>
Record a tasting becomes Record tasting (decision 11). The 'record-a-tasting' opener value is an identifier and stays on all 23 of its lines (decision 4). Do not touch it, or any name built from "tasting".

1. Tests. Every listed line, old words to Record tasting:
   - app/src/ui/VersionRow.test.jsx: 764 (title), 766, 779. Task 1's deletion moves these to 763, 765 and 778.
   - app/src/ui/VersionRow.record.test.jsx: 88 (title), 90.
   - app/src/ui/RecipeList.test.jsx: 130 (title), 134, 196, 298, 325 (comment), 327 (describe title), 341.
   - app/src/ui/RecipeList.nextVersion.test.jsx: 5 (comment), 142, 143 (titles), 145, 146, 148, 153, 160.
   - app/src/ui/RecipePage.drafts.test.jsx: 668 (title).
   - app/src/ui/RecipePage.recordTasting.test.jsx: 4 (comment), 190 (describe title), 194, 225, 289 (title), 301, 480 (title).
   - app/src/ui/BatchRow.dates.test.jsx: 141 (title).
   - app/src/domain/recordDraft.test.js: 529 (title).
2. Sources:
   - app/src/ui/VersionRow.jsx: line 19 (the RECORD_ACT_WORDS value for AWAITING_TASTING). Comments at 107, and 422 (split across 422-423: drop only the trailing "a" on 422).
   - app/src/ui/RecipeList.jsx: line 223 (the AWAITING_TASTING Link's text). Comments at 203, and 198 (split across 198-199: drop only the trailing "a" on 198).
   - Comments only, one phrase each: app/src/ui/BatchRow.jsx 519 and 815; app/src/ui/useBatchRecording.js 284 and 314; app/src/ui/useRouteIntents.js 23 and 31; app/src/ui/RecipePage.jsx 232; app/src/ui/sheetView.js 27; app/src/ui/useRecordDraft.js 145; app/src/domain/recordDraft.js 525.
3. Run the verify command. Commit the 17 files: `fix(261031-fyo): the tasting act reads Record tasting on the band and at Home (look-button-words, sketch 014 decision 11)`.
  </action>
  <verify>
    <automated>npm --prefix app test 2>&1 | grep -E 'Tests +4237 passed \(4237\)' && test "$(perl -0777 -ne 'BEGIN{$n=0} $s=q{\s+(?:(?://|\*)\s*)?}; $n++ while /Record${s}a${s}(?:batch|tasting)\b/g; END{print $n}' $(find app/src -type f))" = 0 && test "$(grep -cE '^\s+Record tasting$' app/src/ui/RecipeList.jsx)" = 1 && test "$(grep -c "\[AWAITING_TASTING\]: 'Record tasting'" app/src/ui/VersionRow.jsx)" = 1 && test "$(grep -rn 'record-a-tasting' app/src | wc -l | tr -d ' ')" = 23</automated>
  </verify>
  <done>
- The suite passes 4237 tests in 130 files.
- The record-act gate over app/src finds 0. It found 103 at 2beebaa2 (57 batch, 46 tasting) and 46 after Task 1.
- Both positive gates find 1, against 0 at 2beebaa2.
- The opener identifier still sits on 23 lines. That gate is a preservation check, so it also passes at 2beebaa2.
- One commit with the 17 files.
  </done>
</task>

<task type="auto">
  <name>Task 3: The three pen labels (Save as new version, Remove this row, Done differently) and the Phase 11 walk</name>
  <files>app/src/ui/VersionRow.jsx, app/src/ui/useVersionPen.js, app/src/router.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/Method.jsx, app/src/domain/penDraft.js, app/src/styles/app.css, app/src/ui/VersionRow.test.jsx, app/src/ui/RecipePage.perStep.test.jsx, app/src/ui/RecipePage.stalePen.test.jsx, app/src/ui/RecipePage.beforeYouStart.test.jsx, app/src/ui/IngredientTable.test.jsx, app/src/ui/RecipePage.test.jsx, app/src/ui/Method.test.jsx, .planning/phases/11-steps-structure-save-and-print/11-walk.mjs</files>
  <read_first>
    - app/src/ui/Method.jsx lines 440-495 (StepRecordingControls) and 632-636 (fieldLabel)
    - app/src/ui/Method.test.jsx lines 71-97
    - app/src/ui/IngredientTable.jsx lines 409-436 (OrphanedRowFlag)
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs lines 488, 1355-1366
  </read_first>
  <action>
Three labels from decision 11, the status sentence (decision 2) and the Phase 11 walk (decision 5).

1. Save as a new version becomes Save as new version.
   - app/src/ui/VersionRow.jsx line 299: only the idle half of the ternary changes. The busy text Saving new version… stays.
   - app/src/ui/useVersionPen.js line 28: VERSION_HAS_BATCH_STATUS becomes 'This version has a batch now. Save as new version instead.'
   - app/src/router.jsx line 27 (comment).
   - app/src/ui/VersionRow.test.jsx (Task 1 moved these up one line): 262 (title), 265, 270 (the regex's button text), 273, 661 (title).
   - app/src/ui/RecipePage.perStep.test.jsx: 223, 252, 318, 498, 539, 601, 608, 612, 632, 647, 670, 734, 765, 861, 875.
   - app/src/ui/RecipePage.stalePen.test.jsx: 220 (title), 232 (the literal sentence, matching useVersionPen.js exactly).
   - app/src/ui/RecipePage.beforeYouStart.test.jsx: 274.
2. remove this row becomes Remove this row.
   - app/src/ui/IngredientTable.jsx: line 432 (OrphanedRowFlag's Button text). Comment at 411.
   - app/src/ui/IngredientTable.test.jsx: 1159 (title), 1183 (the toContain, now with the capital R).
   - Comments: app/src/ui/RecipePage.test.jsx 302; app/src/ui/useVersionPen.js 93; app/src/domain/penDraft.js 112 and 294.
3. done differently becomes Done differently (visible text only).
   - app/src/ui/Method.jsx: line 488 (the .method-step__on-demand Button's text). Comments at 45 and 440. Both fieldLabel calls at 477 and 485 stay exactly as they are (decision 1).
   - app/src/ui/Method.test.jsx: line 72 (comment). Line 81: tighten the opener regex so that one button carries both the unchanged name and the new text, i.e. a button tag whose attributes include aria-label "Step [^"]*, done differently" and whose text is Done differently. Line 96: the negative regex's button text becomes Done differently, so the check still means "no opener while the field is open". Line 1465: the title names the Done differently button. Lines 82 and 94, the input's aria-label regexes, stay.
   - app/src/styles/app.css line 1287: the quoted words in the comment become "Done differently".
4. The Phase 11 walk, `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs`. Edit only; do not run it, because it needs a built dist.
   - Lines 535 and 704: the exact-name button lookup becomes Save as new version.
   - Lines 1178 and 1192: the getByRole name becomes Record batch.
   - Line 1360: the startsWith becomes Record batch.
   - Line 1365: the message text becomes Record batch.
   - Lines 1166 and 1312 (comments) also become Record batch.
5. Run the verify command. Commit the 15 files, the walk included: `fix(261031-fyo): the pen labels read Save as new version, Remove this row and Done differently (look-button-words, sketch 014 decision 11)`.
  </action>
  <verify>
    <automated>npm --prefix app test 2>&1 | grep -E 'Tests +4237 passed \(4237\)' && test "$(perl -0777 -ne 'BEGIN{$n=0} $s=q{\s+(?:(?://|\*)\s*)?}; $n++ while /Record${s}a${s}(?:batch|tasting)\b|Save${s}as${s}a${s}new${s}version|remove${s}this${s}row/g; END{print $n}' $(find app/src -type f) .planning/phases/11-steps-structure-save-and-print/11-walk.mjs)" = 0 && test "$(grep -rn 'done differently' app/src | grep -v 'aria-label\|fieldLabel(' | wc -l | tr -d ' ')" = 0 && test "$(grep -n "fieldLabel(step, false, 'done differently')" app/src/ui/Method.jsx | wc -l | tr -d ' ')" = 2 && test "$(grep -cE '^\s+Remove this row$' app/src/ui/IngredientTable.jsx)" = 1 && test "$(grep -cE '^\s+Done differently$' app/src/ui/Method.jsx)" = 1 && test "$(grep -c "'Save as new version'" app/src/ui/VersionRow.jsx)" = 1 && test "$(grep -c 'Save as new version instead\.' app/src/ui/useVersionPen.js)" = 1 && node --check .planning/phases/11-steps-structure-save-and-print/11-walk.mjs && test -z "$(find app/dist -newer .planning/quick/261031-fyo-boxed-buttons-read-sentence-case-without/261031-fyo-PLAN.md -print 2>/dev/null | head -n 1)"</automated>
  </verify>
  <done>
- The suite passes 4237 tests in 130 files.
- The full old-label gate over app/src and the walk finds 0. It found 145 at 2beebaa2: 137 under app/src and 8 in the walk.
- Lower-case 'done differently' sits only on aria-label and fieldLabel lines: 8 other lines at 2beebaa2, 0 after. Both fieldLabel calls are still there (2; preservation).
- The four positive gates each find 1, against 0 at 2beebaa2.
- The walk still parses.
- Nothing under app/dist is newer than this plan.
- One commit with the 15 files.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| static copy → rendered text | Every change is a literal string inside JSX text, a constant or a comment. No maker input, storage, network or markup path is added or changed. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261031-fyo-01 | Tampering | The negative test guards that quote a label (e.g. RecipePage.edit.test.jsx 296/309/332, BatchRow.test.jsx 1761/2748, RecipeList.test.jsx 726/733, VersionRow.test.jsx 932, Method.test.jsx 96, the walk's line 1360) | low | mitigate | A guard left on the old words would pass whatever the app does. The multi-line gate needs 0 old-label occurrences under app/src and in the walk, so every negative guard must quote the new words. Task 1's RED run shows that the positive guards read the rendered text. |
| T-261031-fyo-02 | Information disclosure | VERSION_HAS_BATCH_STATUS in the pen's live region | low | accept | A fixed sentence that carries no record data. Only its words change. |
| T-261031-fyo-SC | Tampering | npm/pip/cargo installs | low | accept | The plan installs no package. package.json and package-lock.json are not in files_modified, and each task stages only its named files. |
</threat_model>

<verification>
- `npm --prefix app test` passes 4237 tests in 130 files.
- `git log --oneline 2beebaa2..HEAD` shows this plan's three commits, each naming look-button-words. `git show --stat` on each lists only that task's files.
- The full old-label gate (Task 3's perl command) finds 0 under app/src and in the walk.
- `git diff 2beebaa2 -- app/src/ui/Method.jsx` shows no change to either fieldLabel line.
- `git diff 2beebaa2 --stat` shows a net line change of -1, which is VersionRow.test.jsx line 191. Every other change is in place.
- Nothing under app/dist is newer than this plan file, and no build was run.
</verification>

<success_criteria>
- The five labels read Record batch, Record tasting, Save as new version, Remove this row and Done differently. Nothing else visible changes, apart from the status sentence that names Save as new version.
- Every aria-label, class, token, identifier and busy label is unchanged.
- The tests and comments under app/src, and the Phase 11 walk, use the new words. The negative guards still mean what they meant.
- The SUMMARY records:
  - the RED count;
  - decisions 1 and 2, flagging the status sentence as the one visible string outside decision 11's table;
  - what stayed and why (decision 4);
  - the old words still outside app/src: the 08, 09 and 10 walks, sketches 010 and 011 with their canvas generators, and `DESIGN.md` 611, which is Impeccable's;
  - "Not iPad-verified";
  - that app/dist was not rebuilt, so Mark's 4173 preview shows the old words until he builds.
- Nothing under .planning/ is staged except the walk.
</success_criteria>

<output>
Create `.planning/quick/261031-fyo-boxed-buttons-read-sentence-case-without/261031-fyo-SUMMARY.md` when done. Do not stage or commit it, because the orchestrator commits planning docs. The orchestrator also closes the `look-button-words` row on Mark's List; the executor has no ArtifactData.
</output>
