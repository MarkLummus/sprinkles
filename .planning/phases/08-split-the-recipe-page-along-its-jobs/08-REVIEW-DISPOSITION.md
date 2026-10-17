---
phase: 08
review: 08-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: fixed
    title: "Test I's source-text pin no longer proves what its name says after the move to RecipeSheet"
  - id: WR-02
    severity: warning
    disposition: fixed
    title: "RecipeSheet advertises a nullable `draft` and then dereferences it unguarded"
  - id: IN-01
    severity: info
    disposition: fixed
    title: "Stale comments left behind by the move"
  - id: IN-02
    severity: info
    disposition: deferred
    title: "`joinNames` is now a third copy"
  - id: IN-03
    severity: info
    disposition: deferred
    title: "Source-text markers in the shell test are tightly coupled to exact call counts"
open: 0
total: 5
recorded: 2026-10-17T16:35:58.701Z
---

# Phase 08: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | fixed | 08-06, 7367a56 |
| WR-02 | warning | fixed | 08-06, eb6a23d |
| IN-01 | info | fixed | 08-06, db52d5a |
| IN-02 | info | deferred | pre-existing duplication shared with GraduatedRule and BasisNote, not a split defect; one shared joinNames touches files outside Phase 8, left for a later cleanup |
| IN-03 | info | deferred | the literal counts are house style and intentional per the shell test header; naming each counted site inline is maintenance polish outside this gap plan |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
