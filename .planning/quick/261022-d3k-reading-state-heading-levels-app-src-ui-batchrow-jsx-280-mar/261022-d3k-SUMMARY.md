---
phase: quick-261022-d3k
plan: 01
status: complete
commits: 2
plan_head_before: 3b028dec8da97a27e61640a6632740f142c585f7
plan_head_after: 11136a95
---

# Quick 261022-d3k: reading group headings step one level under Tasting

In the batch reading, the mark names (Every recipe, This recipe only) and Any problems? are now h3, and the problem names are h4, under the Tasting h2. Classes and text are unchanged.

## Commits
- 7b6d2d34 test(261022-d3k): reading heading outline steps one level at a time
- 11136a95 fix(261022-d3k): reading group names step one level under Tasting

## Results
- Full suite: 3733 before, 3734 after (120 files, all passing). BatchRow.test.jsx: 245 before, 246 after.
- G10 failed against unchanged BatchRow.jsx (1 failed, received [2,2,4,4,4,5,3]) and passes after the change.
- G10 pins the outlines: seeded reading [2,2,3,3,3,4,3]; all six marked plus core problem [2,2,3,3,3,4,4,3]; nothing marked plus core problem [2,2,3,4,4,3]; record pen [2,3].
- Strict walk: `MATCH 94 snapshots`. 10-walk-before.json and app.css are unchanged.

## Interpretations
1. The whole group subtree moved up one level (marks, Any problems?, problem names). Moving only the mark names would leave an h2 to h4 skip when nothing is marked.
2. The record pen is untouched. Its group names are pen-caption paragraphs labelling role=group, not headings.
3. notebook.css changed only in one comment (the level words), and no rule changed.

## Deviations from Plan
None. Test-side level shifts were done by one ordered sed (h4 to h3, then h5 to h4) over the 20 expected lines. G3's title now reads "h3 ... h4".

## For Mark (left unchanged)
In the reading, Next time (h3) follows the Tasting section, so a screen-reader outline nests it under Tasting even though it belongs to the batch. Not a skipped level, and outside this item.
