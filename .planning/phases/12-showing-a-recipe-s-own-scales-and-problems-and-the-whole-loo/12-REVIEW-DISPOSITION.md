---
phase: 12
review: 12-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "Log pages have almost no slack after the clipboard drop, and the Tasting log can spill onto the first bench page"
  - id: WR-02
    severity: warning
    disposition: open
    title: "No automated check ties the notes-line counts to the clipboard drop"
  - id: IN-01
    severity: info
    disposition: open
    title: "`stopWordsFor` now returns `null` entries, and `readMarkWord` remains an exported kind-blind reader"
  - id: IN-02
    severity: info
    disposition: open
    title: "`readMarkText` uses strict equality where `readMarkWord` coerces"
  - id: IN-03
    severity: info
    disposition: open
    title: "A test title claims an order it does not check, and one test has a formatting slip"
  - id: IN-04
    severity: info
    disposition: open
    title: "Stale and garbled comments around the changed code"
open: 6
total: 6
recorded: 2026-11-16T09:21:28.724Z
---

# Phase 12: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |
| IN-04 | info | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
