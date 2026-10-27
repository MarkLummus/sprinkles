---
phase: 11
review: 11-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "A create draft can be written back for a recipe another tab has already saved, leaving an unsaveable \"ghost\" draft that also hides Edit"
  - id: WR-02
    severity: warning
    disposition: open
    title: "A kept edit draft reopened after another tab saved over the version silently overwrites that save (the \"changed\" guard is defeated because `expected` is re-read at open)"
  - id: WR-03
    severity: warning
    disposition: open
    title: "Save-over overwrites two stored iceEd fields the editor cannot represent (an unlisted style name and `servingTemperatureC` when `serveTempC` differs)"
  - id: WR-04
    severity: warning
    disposition: open
    title: "Cancel does not take the save lock, so Save pressed while Cancel's delete is in flight can create the recipe the maker just cancelled"
  - id: WR-05
    severity: warning
    disposition: open
    title: "A failed or refused Save is announced only through a status paragraph inserted already filled, while focus is moved to a Save button that does not describe it"
  - id: IN-01
    severity: info
    disposition: open
    title: "Structure controls stay live while a Save is out and announce changes that were dropped"
  - id: IN-02
    severity: info
    disposition: open
    title: "Stored grams that do not round-trip through the draft grammar block an unchanged Save-over and read \"not a number\""
  - id: IN-03
    severity: info
    disposition: open
    title: "A Sheet-code clash or any other permanent save failure reads as \"Try again\" forever"
  - id: IN-04
    severity: info
    disposition: open
    title: "Save-over adds a partial `iceEd` to a version that had none"
  - id: IN-05
    severity: info
    disposition: open
    title: "Duplicated comment block in `StepReading.jsx`"
  - id: IN-06
    severity: info
    disposition: open
    title: "`leftUnreadable` is keyed by line and never pruned when a row changes lines"
---

# Phase 11 — Review disposition

One row per finding in 11-REVIEW.md. Written by the execute-phase code-review gate; every row starts open. A fix, a deferral or a not-a-bug call updates the row and says why.

| ID | Severity | Disposition | Title |
|----|----------|-------------|-------|
| WR-01 | warning | open | A create draft can be written back for a recipe another tab has already saved, leaving an unsaveable "ghost" draft that also hides Edit |
| WR-02 | warning | open | A kept edit draft reopened after another tab saved over the version silently overwrites that save (the "changed" guard is defeated because `expected` is re-read at open) |
| WR-03 | warning | open | Save-over overwrites two stored iceEd fields the editor cannot represent (an unlisted style name and `servingTemperatureC` when `serveTempC` differs) |
| WR-04 | warning | open | Cancel does not take the save lock, so Save pressed while Cancel's delete is in flight can create the recipe the maker just cancelled |
| WR-05 | warning | open | A failed or refused Save is announced only through a status paragraph inserted already filled, while focus is moved to a Save button that does not describe it |
| IN-01 | info | open | Structure controls stay live while a Save is out and announce changes that were dropped |
| IN-02 | info | open | Stored grams that do not round-trip through the draft grammar block an unchanged Save-over and read "not a number" |
| IN-03 | info | open | A Sheet-code clash or any other permanent save failure reads as "Try again" forever |
| IN-04 | info | open | Save-over adds a partial `iceEd` to a version that had none |
| IN-05 | info | open | Duplicated comment block in `StepReading.jsx` |
| IN-06 | info | open | `leftUnreadable` is keyed by line and never pruned when a row changes lines |
