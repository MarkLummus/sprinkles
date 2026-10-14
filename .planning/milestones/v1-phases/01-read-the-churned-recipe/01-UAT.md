---
status: complete
phase: 01-read-the-churned-recipe
source: [01-VERIFICATION.md]
started: 2026-09-06T02:53:38Z
updated: 2026-09-06T03:42:41Z
---

## Current Test

[testing complete]

## Tests

### 1. Open http://localhost/ after `npm --prefix app run dev`. Confirm the list shows one recipe (Olive Oil Ice Cream, 50 g oil · 800 g, 799.7 g); click through to /recipe/olive-oil-ice-cream-v1; reload twice and confirm still exactly one recipe.
expected: List renders the seeded recipe; navigation and reload behave as described; no duplicate seeding.
result: pass

### 2. On /recipe/olive-oil-ice-cream-v1, read the page as a book spread: headnote, twelve-row ingredient table, ten numbered method steps with bold lead-ins and target chips (step 5 shows 69 °C, 40 min, 10–12 min), three carried-forward and two before-you-start notes under 'authored' legends, and an empty advisory slot.
expected: The spread reads as described, with no invented content in the advisory slot and no colour used as a status signal.
result: pass

### 3. Beneath the ingredient table, read the six graduated rules: PAC, POD, Total fat (with milkfat/added fat breakdown and 28% of fat), MSNF, Sugar solids ('no target set', no band drawn), Total solids. Confirm hatched bands are legible and nothing is coloured red/green/amber or marked pass/fail.
expected: Six rules in fixed order, each stating its deviation in words; sugar solids shows no band; no colour carries a verdict.
result: pass

### 4. Read the basis note under the six rules; confirm it names the coefficient set, both conventions, and the four estimated rows, and makes no claim about how the ice cream will turn out.
expected: One small-print note with the four required elements, factual tone only.
result: pass

### 5. Confirm the ingredient table's Data column shows the word 'estimated' on exactly four rows (whole milk, heavy cream, allulose, fine sea salt) and nothing on the other eight, visible without hovering or focusing anything.
expected: The word is visible at rest, not colour-only, not hover-only.
result: pass

### 6. Tab through the page with the keyboard. Confirm all six figures take focus in visible order with a visible focus indicator. Focus PAC and confirm exactly seven rows are marked (whole milk, heavy cream, skim milk powder, sucrose, allulose, dextrose, fine sea salt); focus MSNF and confirm exactly three rows are marked. Confirm nothing on the page shifts by a pixel as focus changes.
expected: Keyboard-only operation reaches every figure in order; contributor marking matches the named row sets; no layout shift on focus change.
result: pass

### 7. Export the store from the recipe list, clear the browser's IndexedDB for the origin, reload (seed rewrites the recipe), then import the exported file and confirm the recipe reads identically (same twelve rows, same figures). Then edit the exported file so one row's grams is a quoted string and re-import; confirm the app refuses, names the offending row/field in words, and the store is left untouched.
expected: Round-trip export/import preserves the recipe exactly; a malformed import is refused with a named error and no partial write.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
