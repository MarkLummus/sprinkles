---
phase: quick-261110-ac2
plan: 01
quick_id: 261110-ac2
status: complete
requirements: [bug-edit-missing-after-cancelled-restored-draft]
commits: 2
plan_head_before: 7910eb48f8bb924a6cc694e967bafb5cceffa266
plan_head_after: 6565fbed
---

# Quick 261110-ac2: Edit comes back after Cancel on a restored draft

The page now hands both pens a discardDraft of its own that calls the writer's discard and, once the delete resolves, drops this version's plan/record/amend record from the drafts list, so Edit is drawn at once.

## Commits
- e4f9260f test: red tests (edit.test.jsx, three cases)
- 6565fbed fix: setDrafts handed back by useRecipeData.js; wrapper in RecipePage.jsx

## Red run (at e4f9260f)
RecipePage.edit.test.jsx: 19 tests, 2 failed, 17 passed.
- "draws Edit at once after Cancel on a restored Next version draft": `expected null not to be null` at the Edit assertion.
- "draws Edit at once after Cancel on a restored Record batch draft": same assertion.
- "keeps Edit away when the draft cannot be deleted..." passed (guard case).

## Final
Full suite 132 files, 4324 tests passing (baseline 4321 + 3). Build succeeded (throwaway outDir). Shell test unchanged and green.

## Findings
- The waiting-draft band line and History rail draft node never name a draft this page discarded: waitingPlanDraft excludes this version's own records.
- Save over a restored draft goes through the same wrapper; no test of its own.
- Noticed, not fixed: useKeptDraft.js quietly deletes a kept pen draft that no longer fits its version (misfit delete, around 245-253), and that record also stays in the page's list, so Edit would be missing until reload there too. Different trigger; for Mark to triage as its own row.

## Deviations
None.
