---
status: complete
quick_id: 260929-ujp
---

# Quick 260929-ujp: renumber plan 10 threat IDs

Plan 10's T-03.5-25/26 collided with plan 09's register (#4683 gate blocked execute-phase 03.5).
Renumbered plan 10's to T-03.5-69/70 in 03.5-10-PLAN.md, the citations in plans 11-25, and the
comments in 03.5-probe-harness.mjs. Plan 09 untouched.

Verified: `init.execute-phase 03.5` reports threat_id_duplicate_count 0; only plan 09 still holds T-03.5-25/26.
Executed inline (sed) rather than via planner/executor agents: a 16-file mechanical text substitution.
