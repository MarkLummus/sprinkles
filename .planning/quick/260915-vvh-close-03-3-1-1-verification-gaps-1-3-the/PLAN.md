---
quick_id: 260915-vvh
slug: close-03-3-1-1-verification-gaps-1-3-the
date: 2026-09-15
mode: quick
---

# Close 03.3.1.1 verification gaps 1–3

Three statically confirmed code defects found by the 03.3.1.1 tail gates
(`03.3.1.1-REVIEW.md` CR-01/CR-02/WR-02, `03.3.1.1-VERIFICATION.md` gap 3).
Bug fixes only — no design change, no token change, no refactoring. The
sketch is untouched; none of these is an app-vs-sketch difference.

## Objective

Close the three gaps that need neither a sketch round nor the device, so the
follow-up phase opens with only the genuinely device-bound work (SR-6, the
wide-touch drawing, the Melt row) in its scope.

## Tasks

### Task 1 — CR-01 + WR-02: the `useBelow760` breakpoint mismatch

`app/src/ui/BatchRow.jsx:114-125`. The hook queries `(max-width: 760px)` in
two places while every sibling CSS rule for the same feature uses
`759.98px` — a convention `app.css` documents repeatedly ("keeps exactly
760px on the desktop side of the boundary"). At exactly 760px this renders
the stacked DOM arrangement with desktop stop geometry.

- Both `window.matchMedia('(max-width: 760px)')` literals → `759.98px`.
- The header comment's `(max-width: 760px)` → `759.98px`.

Verify: `grep -c "max-width: 760px" app/src/ui/BatchRow.jsx` → 0.

### Task 2 — CR-02: the orphaned `batch-row__dates` className

`app/src/ui/BatchRow.jsx:218`. `TastingReading`'s tasted-date paragraph
uses `batch-row__dates` (plural); no such rule exists. The styled singular
`.batch-row__date` (`app.css:1424` — text face, version-line size, pen
blue) is what the churned date uses one function away. Two assertions in
`BatchRow.test.jsx` (lines 1062, 1068) pin the typo rather than catch it.

- `className="batch-row__dates"` → `className="batch-row__date"`.
- Both test assertions follow the class.

Verify: `grep -c "batch-row__dates" app/src/` → 0.

### Task 3 — Gap 3: `.method-step__edit` stretches in the column flex

`app/src/styles/app.css:1107-1110`. The rule's own comment says "same
shape as `.method-step__on-demand` above", but the sibling carries
`align-self: flex-start` (added expressly to stop column-flex stretching,
measured on the device 2026-09-15) and this rule does not. It is an inline
text action and must sit at its content width.

- Add `align-self: flex-start` to `.method-step__edit`.

Verify: the rule declares `align-self: flex-start`.

## Acceptance

- `npm --prefix app test` → 936/936 passing.
- `npm --prefix app run build` → clean.
- No token added, removed or changed; no visual value written as a literal.
- No file outside the three named above is modified.
