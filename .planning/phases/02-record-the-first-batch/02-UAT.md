---
status: testing
phase: 02-record-the-first-batch
source: [02-VERIFICATION.md]
started: 2026-09-06T20:35:00Z
updated: 2026-09-06T20:35:00Z
---

## Current Test

number: 1
name: Tracer — record a batch with one as-made value and reopen it by URL
expected: |
  Open the churned recipe, click Record a batch: the As made column appears, the churn date field is focused, nothing is pre-filled. Type a churn date and 383 beside whole milk's 370.4 g, leave every other cell empty, click Save batch. The URL becomes /recipe/olive-oil-ice-cream-v1/batch/{id}, the cell renders as plain blue text, and the margin reads "recorded {today} against {version label}". Opening that URL in a new tab, and reloading, shows the same 383 and the same empty cells.
awaiting: user response

## Tests

### 1. Tracer — record a batch with one as-made value and reopen it by URL
expected: Open the churned recipe, click Record a batch: the As made column appears with the churn date field focused and nothing pre-filled. Type a churn date and 383 beside whole milk's 370.4 g, leave every other cell empty, click Save batch. The URL becomes /recipe/olive-oil-ice-cream-v1/batch/{id}, the cell renders as plain blue text, and the margin reads "recorded {today} against {version label}". Opening that URL in a new tab, and reloading, shows the same 383 and the same empty cells.
result: [pending]

### 2. Sized numeric columns, total row, trace threshold
expected: On the churned recipe the three numeric columns are right-aligned and no wider than their contents; lambda carrageenan reads "trace", guar gum reads "0.1%"; the plan total row reads 799.7 g. Recording a batch with 383/241/45/0 on four rows makes the as-made total read 804.3 g, and clearing the 0 on the lecithin row raises it to 805.5 g.
result: [pending]

### 3. Method strikes and changed lines
expected: In recording mode, tick step 1's strike, type "blend 60 s" on step 8 and the Speed Δ line on step 9, leave step 3 alone, save. Step 1's prose reads struck with a visible "Skipped" text label (not a line alone); steps 8 and 9 show their blue changed lines; step 3 shows nothing; no target chip gains a second value; the whole method is operable and visibly focusable by keyboard.
result: [pending]

### 4. The churn section's measured values and the native leave-warning
expected: Every churn field is empty before typing with no trace of the recipe's targets. Type 20 for come-up, −6 for draw temperature, leave overrun blank, add draw/ingredient notes, save: the reading state shows 20, −6, and the word "unknown" for overrun, with notes in blue prose. Start recording again and try to close the tab: only the browser's native leave-warning appears, never an app-drawn one; reloading afterward shows no persisted draft.
result: [pending]

### 5. schemaVersion 2 export and import
expected: After recording a batch, the exported store file carries schemaVersion 2 with both versions and batches. Importing a hand-edited copy with one invalid field names the error by its path and leaves the store completely untouched, including the good batch beside it. Importing a genuine Phase 1 export is accepted with no batch appearing.
result: [pending]

### 6. A tasting saved with words alone
expected: A saved batch with no tasting shows the "not yet evaluated" wording with no colour, bold, or icon. Click Add a tasting: every field including date is empty; Save tasting stays disabled with explanatory text until words or a mark exist; the As-expected shortcut fills exactly "As expected, nothing to note"; a dateless save reads "date unknown"; a second, earlier-dated tasting sorts above the first.
result: [pending]

### 7. The marks — six axes, nine stops
expected: Adding a tasting shows six axes in a fixed order with anchor words at the ends (never adjectival) and no stop pre-selected. Tab into the hardness group; arrow keys, Home and End move a half-step at a time with a visible focus outline. Mark olive oil character 4.5, bitterness 5, sweetness 4, leave three unmarked, save: the three marked axes show their values, the other three read "unmarked", and nothing anywhere shows an average, total, or score.
result: [pending]

### 8. Amend, the batch list, and the seeded 2 Aug record
expected: After clearing site data and reloading, the 2 Aug batch is present exactly as transcribed: 383/241/45/0 as-made, the struck lecithin row, step 1 struck, steps 8/9's lines, the churn section's values, and the undated tasting with its three marks and three "unmarked" axes; identical after a second reload with no duplicate. Click Amend, change come-up to 22, save: the margin shows the amendment date beside the original churn date and the tasting is untouched. Record a second, later-dated batch: it appears in the margin's batch list, the version line moves to the newer churn date, and the older batch is unchanged when reopened by its own URL.
result: [pending]

### 9. Product decision — scope of the batch snapshot (BATCH2-01 / Success Criterion 5)
expected: Confirm the intended reading before Phase 3 adds version editing. Today the ingredient table and method render the plan-side columns (grams, names, method prose) from the live version record, while every batch-scoped value (as-made, strikes, measurements, tastings) comes from the batch's own stored values; only the snapshot's version label and declared axes are consumed by the UI. The plan for 02-01 documents this as a deliberate "two shown on one spread, not merged" reading. Decide whether that satisfies the roadmap's wording that later edits to the recipe or ingredient data do not change what the batch shows, or whether the batch page must render its plan side from snapshot.rows once versions become editable.
result: [pending]

## Summary

total: 9
passed: 0
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps
