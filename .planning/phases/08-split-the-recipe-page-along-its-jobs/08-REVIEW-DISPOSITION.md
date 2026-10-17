---
phase: 08
review: 08-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "Test I's source-text pin no longer proves what its name says after the move to RecipeSheet"
  - id: WR-02
    severity: warning
    disposition: open
    title: "RecipeSheet advertises a nullable `draft` and then dereferences it unguarded"
  - id: IN-01
    severity: info
    disposition: open
    title: "Stale comments left behind by the move"
  - id: IN-02
    severity: info
    disposition: open
    title: "`joinNames` is now a third copy"
  - id: IN-03
    severity: info
    disposition: open
    title: "Source-text markers in the shell test are tightly coupled to exact call counts"
open: 5
total: 5
recorded: 2026-10-17T16:35:58.701Z
---

# Phase 08: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
