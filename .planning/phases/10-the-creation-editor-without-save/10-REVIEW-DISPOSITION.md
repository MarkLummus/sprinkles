---
phase: 10
review: 10-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "Import refusal trusts a possibly stale \"present\" and never refreshes it"
  - id: WR-02
    severity: warning
    disposition: open
    title: "Notebook place now fails entirely when the drafts read fails"
  - id: WR-03
    severity: warning
    disposition: open
    title: "Target-band fields silently reject input the maker can plausibly type"
  - id: IN-01
    severity: info
    disposition: open
    title: "Stale comment says a cleared creation is deleted"
  - id: IN-02
    severity: info
    disposition: open
    title: "`isCreateDraftDirty` is dead in production code"
  - id: IN-03
    severity: info
    disposition: open
    title: "A failed Cancel announces a message about opening the store"
  - id: IN-04
    severity: info
    disposition: open
    title: "Cancel has no re-entry guard"
  - id: IN-05
    severity: info
    disposition: open
    title: "Picker repeats a landmark name and speaks twice on an empty result"
  - id: IN-06
    severity: info
    disposition: open
    title: "`record` shadows the component prop in two places"
  - id: IN-07
    severity: info
    disposition: open
    title: "Every creation row's remove control has the same accessible name"
  - id: IN-08
    severity: info
    disposition: open
    title: "Style menu shows \"No style\" for a kept style id the catalog does not hold"
open: 11
total: 11
recorded: 2026-10-20T16:43:31.501Z
---

# Phase 10: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| WR-03 | warning | open | - |
| IN-01 | info | open | - |
| IN-02 | info | open | - |
| IN-03 | info | open | - |
| IN-04 | info | open | - |
| IN-05 | info | open | - |
| IN-06 | info | open | - |
| IN-07 | info | open | - |
| IN-08 | info | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved.
