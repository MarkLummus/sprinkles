---
phase: 07-creation-primitives
review: 07-REVIEW.md
recorded: 2026-10-15
---

# Phase 7 review disposition

One row per finding in 07-REVIEW.md. Advisory: nothing here blocks the phase.

| Finding | Severity | Disposition | Note |
|---------|----------|-------------|------|
| WR-01 | Warning | open | `createRecipe` does not check `recipeId`, `versionId` or `now`; `{}` gives undefined ids. |
| WR-02 | Warning | open | `rowFromLibraryRecord` does not validate `ingredientName` or `record.entry`. |
| WR-03 | Warning | open | Row ids `__proto__`, `constructor`, `prototype` pass the builders but fail `validateRow` on import. |
| WR-04 | Warning | open | `nextStepKey` throws on a fractional step key that `validateStep` accepts. |
| IN-01 | Info | open | A child of a created root version carries own keys set to `undefined`. |
| IN-02 | Info | open | Purity guards match single-quoted imports only and are copy-pasted into three test files. |
| IN-03 | Info | open | Label checked blank on its trimmed value, stored untrimmed. |
