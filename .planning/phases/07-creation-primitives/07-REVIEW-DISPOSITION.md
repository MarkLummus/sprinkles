---
phase: 07-creation-primitives
review: 07-REVIEW.md
recorded: 2026-10-15
---

# Phase 7 review disposition

Advisory: nothing here blocks the phase. 07-REVIEW.md was rewritten by the re-review after the fix, so its finding ids restart. The first review stays in git at 5c6145d.

## First review (5c6145d)

| Finding | Severity | Disposition | Note |
|---------|----------|-------------|------|
| WR-01 | Warning | fixed (quick 261015-8y9) | `createRecipe` checks `recipeId`, `versionId`, `now`. |
| WR-02 | Warning | fixed (quick 261015-8y9) | `rowFromLibraryRecord` checks the entry and the name (see re-review WR-01 for the remaining gap). |
| WR-03 | Warning | fixed (quick 261015-8y9) | Reserved row ids refused, pinned to the import check and to `draft.js`. |
| WR-04 | Warning | fixed (quick 261015-8y9) | Import check requires a safe-integer step key. |
| IN-01 | Info | open | A child of a created root version carries own keys set to `undefined`. Needs `/gsd-quick` (touches `lineage.js`). |
| IN-02 | Info | open | Purity guards match single-quoted imports only and are copied into three test files. |
| IN-03 | Info | open | Label checked blank on its trimmed value, stored untrimmed. |

## Re-review (current 07-REVIEW.md)

| Finding | Severity | Disposition | Note |
|---------|----------|-------------|------|
| WR-01 | Warning | open | `rowFromLibraryRecord` returns a row the import check refuses when the entry has no valid `composition` (`{ name: 'Oil' }`, `{ fat: NaN }`). Real library records pass `validateLibraryRecord`, so the exposure is narrow. |
| IN-01 | Info | open | The step-key agreement test passes for `0` by coincidence and skips negative keys. |
