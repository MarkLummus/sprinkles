---
phase: 09
review: 09-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "Import is not guarded against a throw from the validation gate, so a hostile or odd file fails silently"
  - id: WR-02
    severity: warning
    disposition: open
    title: "The Ingredients category filter goes stale after an import, so the select shows \"All\" while the list stays filtered"
  - id: IN-01
    severity: info
    disposition: open
    title: "The generated library module's header is stale, and the header line can be broken by a U+2028 in the dataset version"
  - id: IN-02
    severity: info
    disposition: open
    title: "`seed-sheet-codes.js` ends with `,});`"
  - id: IN-03
    severity: info
    disposition: open
    title: "The Ingredients and Notebook places import `PAGE_LOAD_ERROR` from the whole RecipePage module"
  - id: IN-04
    severity: info
    disposition: open
    title: "Library and version-row composition figures are only checked for finiteness"
  - id: IN-05
    severity: info
    disposition: open
    title: "Dead ternary branch in the review renderer, and a dangling `aria-controls`"
open: 7
total: 7
recorded: 2026-10-19T03:04:18Z
---

# Phase 09: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | Shell.jsx:360 awaits importStore with no try/catch; scanForUnsafeKeys (transfer.js:688) recurses without a depth bound; a deeply nested file throws RangeError and the Import panel shows nothing |
| WR-02 | warning | open | IngredientsPlace.jsx:158-222: after an import removes the only entry in the selected category the `category` state goes stale (IngredientsList not keyed); select shows All, list shows 0 of N |
| IN-01 | info | open | convert-ingredient-seed.mjs header says "the app does not import it yet" (seed.js now imports it); `[\r\n]` replace is a no-op; U+2028 in the dataset version would break the `//` header line |
| IN-02 | info | open | seed-sheet-codes.js ends with `,});` |
| IN-03 | info | open | NotebookPlace.jsx and IngredientsPlace.jsx import PAGE_LOAD_ERROR from RecipePage.jsx |
| IN-04 | info | open | composition fractions checked only for finiteness; values below 0 or above 1 import; worth tightening when Phase 10's picker lands |
| IN-05 | info | open | dead ternary branch in the converter's review renderer; `aria-controls` on a closed row points at an id not in the DOM |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
