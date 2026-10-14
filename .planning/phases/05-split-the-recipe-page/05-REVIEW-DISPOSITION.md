---
phase: 05-split-the-recipe-page
review: 05-REVIEW.md
open: 5
total: 5
---

# Phase 5 code review: disposition

Advisory ledger, one row per finding of 05-REVIEW.md (0 critical, 2 warning, 3 info). Every row starts `open`; change the Disposition cell by hand and put the reason in Source.

| ID | Severity | Disposition | Source |
|----|----------|-------------|--------|
| WR-01 | warning | open | Inherited from the pre-split handler, not introduced by it. Raised as a bug row on Mark's List (bug-record-pen-proto-row-id); not fixed until Mark answers it. |
| WR-02 | warning | open | RecipePage.shell.test.js stripComments; nothing in the files today triggers it. |
| IN-01 | info | open | recordDraft.js imports usesListsDiffer from penDraft.js. |
| IN-02 | info | open | Stale comment at RecipePage.jsx 622-624. |
| IN-03 | info | open | useRecordDraft removeTasting / undoRemoveTasting read render-time state; latent. |
