---
quick_id: 260915-vvh
slug: close-03-3-1-1-verification-gaps-1-3-the
status: complete
date: 2026-09-15
commits: [748e0dc, c5085f4, 3c7a3cd]
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/styles/app.css
---

# Close 03.3.1.1 verification gaps 1–3

Three statically confirmed code defects from the 03.3.1.1 tail gates, all
closed. Bug fixes only — no token touched, no design decision reopened, no
sketch consulted, because none of these was an app-vs-sketch difference.

## What changed

**`748e0dc` — CR-01 + WR-02, the breakpoint mismatch.** `useBelow760` read
`(max-width: 760px)` in the initial `useState` and again in the listener,
while every CSS rule for the same feature reads `759.98px`. At exactly
760px the hook answered "stacked" while the track geometry stayed desktop,
producing a hybrid render. Both literals and the header comment now read
`759.98px`. The function name `useBelow760` is unchanged — it names the
760 boundary, which is still what it tests.

**`c5085f4` — CR-02, the orphaned className.** `TastingReading`'s
tasted-date paragraph used `batch-row__dates` (plural), which matches no
rule; the tasted date rendered in body defaults while the churned date one
function away used the styled singular `.batch-row__date`. Fixed, and the
two assertions that pinned the typo (`BatchRow.test.jsx:1062,1068`) now
follow the corrected class. No occurrence of the plural remains anywhere
under `app/src/`.

**`3c7a3cd` — gap 3, the stretch defect.** `.method-step__edit` lacked the
`align-self: flex-start` its sibling `.method-step__on-demand` carries,
despite its own comment claiming the same shape. It stretched to the full
column instead of sitting at its content width. The handoff called this
unconfirmed because the control renders only on a saved step; it is
provable from the two rules side by side, and the verifier confirmed it
statically.

## Verification

- `npm --prefix app test` → 33 files, 936/936 passing, after each task.
- `npm --prefix app run build` → clean, 79ms.
- `grep -c "max-width: 760px" app/src/ui/BatchRow.jsx` → 0.
- `grep -r "batch-row__dates" app/src/` → no matches.
- No token added, removed or changed.

## What this does not close

03.3.1.1's other two verification gaps are untouched and still need the
device:

- **SR-6** — the churn-row date box does not take touch height in the real
  app, though a probe page showed the fix working. Cause unknown; the probe
  does not replicate the surrounding flex/label structure.
- **Melt row alignment** — 15px out at 1366/coarse, and whether the sketch
  shares the misalignment is unestablished.

Also still open, by decision rather than defect: the wide-viewport touch
drawing (sketch 009, agreed with Mark 2026-09-15) and the re-measure of the
superseded CONFORMANCE.md Measurements table.

## Note for the follow-up phase

Neither CR-01 nor CR-02 was catchable by the existing suite — the
breakpoint bug only manifests at exactly 760px, and a text-only assertion
cannot tell a styled class from an unstyled one. If the follow-up phase
adds coverage, those are the two shapes worth a test.
