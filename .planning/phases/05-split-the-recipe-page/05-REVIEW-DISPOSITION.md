---
phase: 05-split-the-recipe-page
review: 05-REVIEW.md
open: 2
total: 5
---

# Phase 5 code review: disposition

Advisory ledger, one row per finding of 05-REVIEW.md (0 critical, 2 warning, 3 info). Every row starts `open`; change the Disposition cell by hand and put the reason in Source.

| ID | Severity | Disposition | Source |
|----|----------|-------------|--------|
| WR-01 | warning | fixed | Inherited from the pre-split handler, not introduced by it; raised as Mark's List bug row bug-record-pen-proto-row-id. Fixed in quick batch 261014-e88, item 261014-e89: recordDraft.js builds its as-made maps without a bare computed-key write, and transfer.js refuses a reserved row id on import. |
| WR-02 | warning | fixed | RecipePage.shell.test.js stripComments. Fixed in quick batch 261014-e88, item 261014-e8b: stripComments no longer treats // inside a string as a comment, and a test runs the whole stripping pipeline over such a line. |
| IN-01 | info | open | recordDraft.js imports usesListsDiffer from penDraft.js. Left open: there is no cycle today (penDraft.js imports nothing from recordDraft.js), so the move waits for a change that needs it. |
| IN-02 | info | fixed | Stale comment at RecipePage.jsx 622-624. Fixed in quick batch 261014-e88, item 261014-e8c: the comment names the onPageStatus prop and the recordPen hook value among what handleStartAmending reads. |
| IN-03 | info | open | useRecordDraft removeTasting / undoRemoveTasting read render-time state; latent. Left open: deferred to v2 creation as a design question (compute the payload inside the functional update, or document a call-alone rule). |
