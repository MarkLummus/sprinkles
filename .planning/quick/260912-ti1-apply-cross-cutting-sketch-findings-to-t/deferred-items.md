# Deferred Items — quick task 260912-ti1

## Pre-existing 393px horizontal overflow (out of scope; page-shell finding)

- **Found during:** Task 3 (the measured surface), 2026-09-13
- **Reading:** At 393x852 emulation the recipe page's `scrollWidth` is 608px against the 393px viewport.
- **Proof it is not from this task:** deleting the new `@media (max-width: 759.98px)` block from the CSSOM live in the browser left the overflow at exactly 608px.
- **Cause:** the fixed 2fr/1fr `.recipe-page` grid and `.version-row__meta-list`'s `max-content` label column never step down below 760px. The below-760px arrangement (groups stacked, still 2-across, then one column) belongs to the page-shell finding — `.claude/skills/sketch-findings-sprinkles/references/page-shell-front-matter.md`, "Touch Targets & the Responsive Ladder" — not to this task's touch-target/type/spacing scope.
- **Disposition:** deferred to whichever work applies the page-shell step-down; the zero-overflow-at-393px acceptance bar should be re-checked then. Touch-target half of the 393px bar is met (recorded in the SUMMARY).
