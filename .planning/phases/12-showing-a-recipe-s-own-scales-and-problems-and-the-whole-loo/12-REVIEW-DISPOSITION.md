---
phase: 12
review: 12-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "Add ingredient buttons on a split row share one accessible name"
  - id: IN-01
    severity: info
    disposition: open
    title: "DeskOnly takes a live editor away on narrowing, unlike NotebookHead"
  - id: IN-02
    severity: info
    disposition: open
    title: "Home's Record tasting does nothing visible on the phone while a plan draft is held"
  - id: IN-03
    severity: info
    disposition: open
    title: "Preview state survives a remove and restore of the open step"
  - id: IN-04
    severity: info
    disposition: open
    title: "`planHeld` is a pure alias of `planGuard`"
  - id: WR-02
    severity: warning
    disposition: open
    title: "No automated check ties the notes-line counts to the clipboard drop"
open: 6
total: 6
recorded: 2026-11-22T22:52:32.694Z
---

# Phase 12: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |
| IN-04 | info | open | - |
| WR-02 | warning | open | - (not in the current review) |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
