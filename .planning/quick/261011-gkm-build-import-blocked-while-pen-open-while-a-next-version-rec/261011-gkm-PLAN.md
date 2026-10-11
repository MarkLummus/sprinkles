---
phase: quick-261011-gkm
plan: 01
quick_id: 261011-gkm
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: [UX1-02]

# Finding at planning time (2026-10-11, base db4457b): this item is ALREADY BUILT on main by quick 261011-dz2.
#   ff07724 feat(quick-261011-dz2): refuse Import while a recipe pen is open
#     (app/src/ui/Shell.jsx, app/src/router.jsx, app/src/ui/RecipePage.jsx, app/src/ui/Shell.importGuard.test.jsx)
#   d0d9af7 docs(quick-261011-dz2): D-14 reads three pens keep their drafts
#     (.planning/phases/04-prepare-the-next-version-for-making/04-CONTEXT.md, line 51)
# The planner ran app/src/ui/Shell.importGuard.test.jsx on db4457b: 6 of 6 pass.
# So this plan confirms the build against the item's own words and edits nothing. Building it a second time would
# duplicate dz2's code and touch app/src/ui/RecipePage.jsx, which sibling 261011-gko also edits.
# Prohibited (do not touch, do not stage): every file under app/, 04-CONTEXT.md (the D-14 bullet already reads
# three pens; lines 66 and 107 still say "four pens" and stay as written, outside this item), the
# "proposed copy awaiting Mark's approval" comment at app/src/ui/Shell.jsx lines 20-22 (whether Mark approved
# the wording is his call, not inferred here), Mark's List (device UAT rows for this item already exist; the
# orchestrator closes row build-import-blocked-while-pen-open), .planning/STATE.md, .planning/ROADMAP.md, the
# pre-existing modified .planning/state.json and the untracked 03.6 .gitkeep.

must_haves:
  truths:
    - "While a Next version, record or Correct pen is open, pressing Import (in the header or in More's list) opens no file chooser, calls importStore not at all, and leaves storeRevision unchanged: Import does nothing to the store."
    - "In the same state the page notice reads exactly 'Close the open pen before importing.', from the one exported constant IMPORT_BLOCKED_STATUS in app/src/ui/Shell.jsx."
    - "With no pen open, including after Cancel, Import opens the chooser and a chosen file reaches importStore as before."
    - "The D-14 bullet in .planning/phases/04-prepare-the-next-version-for-making/04-CONTEXT.md reads three pens: developing, recording (the tasting section included), amending."
    - "This item changes no file. Every check above passes on the dispatch base with git status unchanged."
  artifacts:
    - path: app/src/ui/Shell.jsx
      provides: "IMPORT_BLOCKED_STATUS, ImportGuardContext, guardImport, chooseImportFile on both Import buttons (delivered by ff07724)"
      contains: "export const IMPORT_BLOCKED_STATUS = 'Close the open pen before importing.';"
    - path: app/src/router.jsx
      provides: "RecipePageForRoute registers announcePageStatus with the Shell's guard while a pen is open (delivered by ff07724)"
      contains: "guardImport(announcePageStatus)"
    - path: app/src/ui/Shell.importGuard.test.jsx
      provides: "the six jsdom cases: refusal for each of the three pens and both Import buttons, Import after Cancel, Import with no pen"
    - path: .planning/phases/04-prepare-the-next-version-for-making/04-CONTEXT.md
      provides: "D-14 reads three pens (delivered by d0d9af7)"
      contains: "**Three pens** keep their draft through a reload"
  key_links:
    - from: app/src/ui/RecipePage.jsx
      to: app/src/router.jsx
      via: "onPenOpenChange(derivePenState(...).openPen !== null) -> setPenOpen in RecipePageForRoute"
      pattern: "onPenOpenChange"
    - from: app/src/router.jsx
      to: app/src/ui/Shell.jsx
      via: "useContext(ImportGuardContext) -> guardImport(announcePageStatus) while penOpen"
      pattern: "ImportGuardContext"
    - from: app/src/ui/Shell.jsx
      to: "both Import buttons"
      via: "chooseImportFile calls the registered guard with IMPORT_BLOCKED_STATUS and returns before the chooser opens"
      pattern: "chooseImportFile"
---

<objective>
Confirm that build-import-blocked-while-pen-open is already met on the dispatch base, word for word, and record that in the SUMMARY. Edit nothing.

The item asks for three things. Quick 261011-dz2 built all three on 2026-10-11 (ff07724, d0d9af7):
1. While a Next version, record or Correct pen is open, Import does nothing to the store.
2. A short notice reads exactly 'Close the open pen before importing.'
3. D-14 in 04-CONTEXT.md reads three pens.

Purpose: Mark's List still has the Build row open, so the batch picked it up again. One verified pass against the item's own words lets the orchestrator close the row and cite the commits, without a second implementation.
Output: no source change. The executor writes .planning/quick/261011-gkm-build-import-blocked-while-pen-open-while-a-next-version-rec/261011-gkm-SUMMARY.md, and the orchestrator commits it.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/261011-dz2-block-import-while-a-pen-is-open-print-o/261011-dz2-SUMMARY.md
@app/src/ui/Shell.importGuard.test.jsx

Read only these ranges (no need to read the whole files):
- app/src/ui/Shell.jsx lines 20-29 (IMPORT_BLOCKED_STATUS, ImportGuardContext) and 306-325 (guardImport, chooseImportFile)
- app/src/router.jsx lines 33-80 (RecipePageForRoute: penOpen, the guard effect, onPenOpenChange)
- app/src/ui/RecipePage.jsx lines 1170-1177 (the onPenOpenChange effect)
- .planning/phases/04-prepare-the-next-version-for-making/04-CONTEXT.md line 51 (D-14)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Check the existing build against the item's words; edit nothing</name>
  <files>(none modified; reads app/src/ui/Shell.jsx, app/src/router.jsx, app/src/ui/RecipePage.jsx, app/src/ui/Shell.importGuard.test.jsx, .planning/phases/04-prepare-the-next-version-for-making/04-CONTEXT.md)</files>
  <action>
Verification only. Run each check below from the repo root and record the command and its result for the SUMMARY. Make no edit to any file, and stage nothing.

(a) The behaviour. Run the six jsdom cases in app/src/ui/Shell.importGuard.test.jsx. They mount Shell, RecipePageForRoute and RecipePage over an in-memory repository stand-in. Item clause by clause:
- "Next version, record or Correct pen": one case per pen opens it, presses the header Import and is refused. A further case presses More's Import with the Next version pen open.
- "Import does nothing to the store": the refusal cases assert that the file input's click is never called, importStore is never called and storeRevision stays 0.
- "a short notice reads exactly": the refusal cases assert that the .page-status text equals IMPORT_BLOCKED_STATUS.
- The last two cases show Import still works after Cancel and with no pen ever opened.

(b) The exact sentence and the wiring, by fixed-string grep (presence checks, in verify below). The notice is one exported constant in app/src/ui/Shell.jsx. Both Import buttons go through chooseImportFile. The production router (app/src/router.jsx, not only the test's own Routes) registers the guard and reads onPenOpenChange. RecipePage reports pen-open from derivePenState.

(c) D-14. Line 51 of 04-CONTEXT.md reads three pens. Lines 66 and 107 still say "four pens". They are outside this item's D-14 scope and stay as they are. List them in the SUMMARY as a note for Mark.

(d) The full suite, to confirm the base is green: npm --prefix app test. Record the file and test counts. dz2 left 78 files and 2472 tests; later quick tasks may have moved the counts.

(e) No change: git status --porcelain shows only what it showed before the task started.

If any check fails, do not re-implement or patch anything. Stop and report the failing command and its output as your result. Do not write a SUMMARY with status complete. A failure means the base differs from what the planner measured on db4457b, and the orchestrator has to route it.

Write the SUMMARY with status: complete in its frontmatter. It records these points:
1. The item was delivered by 261011-dz2: ff07724 (Import refused while a pen is open) and d0d9af7 (D-14 reads three pens). This item added no commit.
2. The command and result for each check (a) to (e).
3. Notes for the orchestrator to raise with Mark. Change none of them here:
   - app/src/ui/Shell.jsx lines 20-22 still call the sentence "proposed copy awaiting Mark's approval". The Build row gives the same sentence as exact. If that means Mark approved it, the comment can be updated in a later quick.
   - 04-CONTEXT.md lines 66 and 107 still say "four pens".
   - The guard runs when Import is pressed, not when the chosen file comes back (handleImportChange). Suppose the chooser is already open and a stored draft then reopens a pen. This can only happen in the tens of milliseconds between a route mounting and its draft restore finishing. In that case the chosen file would still import. No code was added for it, because no one can press Import that fast (threat T-261011-gkm-02, accepted).
4. Deferred Human Verification: none added. The device UAT rows for this item are already on Mark's List.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/Shell.importGuard.test.jsx && grep -qF "export const IMPORT_BLOCKED_STATUS = 'Close the open pen before importing.';" app/src/ui/Shell.jsx && grep -qF 'onClick={chooseImportFile}' app/src/ui/Shell.jsx && grep -qF 'guardImport(announcePageStatus)' app/src/router.jsx && grep -qF 'onPenOpenChange={setPenOpen}' app/src/router.jsx && grep -qF 'onPenOpenChange(derivePenState' app/src/ui/RecipePage.jsx && grep -qF -- '- **D-14:** **Three pens** keep their draft through a reload: developing, recording (the tasting section included), amending.' .planning/phases/04-prepare-the-next-version-for-making/04-CONTEXT.md && echo GKM-CHECKS-OK</automated>
  </verify>
  <done>The command prints GKM-CHECKS-OK, with 6 of 6 cases passing in app/src/ui/Shell.importGuard.test.jsx. npm --prefix app test passes in full. git status --porcelain is unchanged from before the task. No file under app/ or .planning/phases/ changed. The SUMMARY cites ff07724 and d0d9af7, gives the result of each check and carries the three notes.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker's chosen file -> importStore | Untrusted JSON replaces stored records by id (existing; validated by app/src/store/transfer.js) |
| open pen's in-memory state -> store | A pen's next Save would write its stale copy over an import (the reason Import is refused while a pen is open) |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261011-gkm-01 | Tampering (an import silently reverted by an open pen's Save) | app/src/ui/Shell.jsx chooseImportFile, app/src/router.jsx RecipePageForRoute | medium | mitigate | Already mitigated by ff07724: while a pen is open, the click is refused before the chooser opens. Task 1 re-runs the six cases that cover all three pens and both Import buttons. |
| T-261011-gkm-02 | Tampering (an import landing under a pen that a draft restore reopened while the chooser was open) | app/src/ui/Shell.jsx handleImportChange | low | accept | Only reachable in the tens of milliseconds between a route mounting and its draft restore. No one can press Import that fast, so no code is added (CLAUDE.md: no handling for scenarios that cannot happen). Recorded in the SUMMARY for Mark. |
| T-261011-gkm-SC | Tampering | npm installs | low | accept | No package is installed or changed. |
</threat_model>

<verification>
- Task 1's automated command prints GKM-CHECKS-OK.
- npm --prefix app test passes in full, including app/src/ui/tabindex-scan.test.js.
- git status --porcelain is unchanged by this item. The pre-existing .planning/state.json change and the untracked 03.6 .gitkeep are never staged.
- Source audit. GOAL: all three clauses of the item (no store change while a pen is open, the exact notice, D-14 three pens) are covered by checks (a) to (c). CONTEXT: D-14 is covered by (c). REQ: UX1-02 is covered by (a). Nothing is left unplanned. Exclusions: the Shell.jsx comment wording, 04-CONTEXT.md lines 66 and 107, and any guard in handleImportChange are noted for Mark and not built.
</verification>

<success_criteria>
- Every clause of build-import-blocked-while-pen-open is shown to hold on the dispatch base by a runnable check, and dz2's commits ff07724 and d0d9af7 are named as where it was built.
- No source, test, stylesheet or 04-CONTEXT.md change, and no Mark's List write.
- The SUMMARY gives the orchestrator what it needs to close row build-import-blocked-while-pen-open, plus the three notes for Mark.
</success_criteria>

<output>
Create `.planning/quick/261011-gkm-build-import-blocked-while-pen-open-while-a-next-version-rec/261011-gkm-SUMMARY.md` when done (the orchestrator commits it).
</output>
