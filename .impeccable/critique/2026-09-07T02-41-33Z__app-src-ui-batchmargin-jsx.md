---
target: app/src/ui/BatchMargin.jsx
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchMargin.jsx"
target_fingerprint: "sha256:816cd9269a4aa91c703b37abeef70d04c45339bae8c29b97fa5291bc7d2e2ad1"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/BatchMargin.jsx
timestamp: 2026-09-07T02-41-33Z
slug: app-src-ui-batchmargin-jsx
---
**Method: dual-agent (A: general-purpose design-review subagent · B: general-purpose detector/browser subagent)**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Reading state says everything in words. Save tasting gives no "recorded" line of its own, and its disabled state is browser grey. |
| 2 | Match System / Real World | 3 | Sheet order and lowercase units are right. "Words", "Tasting date" and the mm/dd/yyyy picker are app-speak. |
| 3 | User Control and Freedom | 2 | The tasting form has no Cancel. Cancel on Amend discards edits with no word. |
| 4 | Consistency and Standards | 2 | Buttons are browser defaults. Batch list links render browser blue and visited purple. |
| 5 | Error Prevention | 2 | Save batch with nothing typed creates a "date unknown" batch silently. |
| 6 | Recognition Rather Than Recall | 2 | Headnote says "churned 4 Sep" while an older batch is open. Focus on churn date puts the as-made column off-screen. |
| 7 | Flexibility and Efficiency | 3 | Native radios give arrow keys and Home/End free. Six graduated-rule buttons sit in the tab path while recording. |
| 8 | Aesthetic and Minimalist Design | 3 | Reading state is spare and true. The forms are a wall of same-height boxes with no heavy element. |
| 9 | Error Recovery | 2 | The "write words or mark an axis" hint is good. Nothing else explains a discarded or dropped value. |
| 10 | Help and Documentation | 2 | Units carry the load. "Ingredient notes" gives no hint it is the home for the oil bottle's open date. |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment.** Split down the middle. The reading state is unmistakably Sprinkles: blue figures against black labels, "unknown" and "unmarked" as words, "recorded 4 Aug 2026 against 50 g oil · 800 g", a tasting headed "date unknown". The recording and tasting forms are not authored for anything: a stack of full-width boxes under one-line labels, browser-default buttons, a calendar-icon date picker, resizable textareas, and a sentence-length shortcut button between two fields. The brief's thesis, "writing on the page you printed", survives in the table and the method but is weakest in the margin, the one region the brief says the log leads.

**Deterministic scan.** Clean. Zero findings on `app/src/ui/BatchMargin.jsx` and zero on `app/src/ui/AxisMark.jsx`. The page-level browser scan found 13 `cramped-padding` findings, all on the method's target chips (left column), none on the margin. DESIGN.md pins the chip at zero vertical padding, so these are false positives for this world and out of scope for this target.

**Visual overlays.** Injection succeeded; overlays were shown in a tab titled [Human] test, marking the 13 method chips only. The batch margin carried no overlay.

## Overall Impression

The record reads beautifully and writes like a form. Everything the brief asked the page to show rather than claim is there. But the ceremony of recording opens in the wrong place, one form has no exit, and the browser's chrome has leaked three colours into a four-colour system. The biggest opportunity is the moment "Record a batch" is pressed: land where Mark's pen landed, on the formula page, and make the path from there to Save one forward Tab.

## What's Working

- **Silence is spelled, never coloured.** Blank measured values read "unknown", an unjudged axis reads "unmarked", an undated tasting reads "date unknown", all in the same blue as a real value.
- **The mark control is native and honest.** `AxisMark` is a fieldset of real radios with anchor words at the ends and a separate Clear control. Half steps are values; nothing is checked by default; no average, no verdict.
- **The record cites its plan.** "recorded 4 Aug 2026 against 50 g oil · 800 g", plus "amended …" when it applies, in pen blue, with no icon.

## Priority Issues

**[P1] Focus and tab order contradict the sheet's page order.** `autoFocus` on the churn date (BatchMargin.jsx line 165) lands the maker at the bottom of the brief's order; Tab never reaches the table; Shift+Tab crosses six graduated-rule buttons and twenty step controls. Fix: render the margin before the method in the DOM, or move the churn date into the headnote's "churned ___" slot; set `tabIndex={-1}` on graduated rules while recording. Command: /impeccable layout

**[P1] The tasting form cannot be abandoned.** `TastingForm` (lines 49–124) has no Cancel; "Add a tasting" unmounts itself and drops focus to body. Fix: add Cancel beside Save tasting that clears the draft; give the form a legend ("Tasting") and move focus to its first field. Command: /impeccable harden

**[P2] Prose sits in the wrong face.** Body is the grotesk, so `.ink-text` prose paragraphs and the textareas render in the counting face. Fix: text face on prose `.ink-text` paragraphs and `textarea.ink-field`; keep `.batch-margin__measured` grotesk. Command: /impeccable typeset

**[P2] Fifth colours have leaked in from the browser.** `.batch-margin__list a` has no colour rule (browser blue/visited purple); disabled Save tasting is browser grey; the date input paints a calendar icon and placeholder in pen blue. Fix: `color: inherit` on list links; carry the save gate in the hint and style `:disabled` by weight only; draw the binder button treatment (hairline ink border, no fill, grotesk label). Command: /impeccable polish

**[P2] The reading state's controls are out of scope order.** Amend (this record) sits above the version's batch list, then "Record another batch", then this record's tastings; the headnote reads the latest churn date even when an older batch is open (RecipePage.jsx line 352). Fix: batch list as the section's running head, then record, Amend, tastings, "Record another batch" last; headnote names the open batch or omits the date. Command: /impeccable layout

## Persona Red Flags

**Alex:** Tab from the date never reaches the table; six rule buttons interrupt the path; Enter does not save; 54 radios on one tasting form.
**Sam:** "Add a tasting" removes itself and drops focus; tasting form has no heading; anchors are aria-hidden; Clear appears with no announcement.
**Riley:** Save with nothing typed yields a "date unknown" batch with three "unknown" rows; long single word in Words has no overflow-wrap; long axis names inflate every tasting row.
**Mark (sheet in hand):** starts at the formula page, app starts him at the batch log; "oil bottle open date" has no obvious home; undated tasting reads back under a legend "DATE UNKNOWN".

## Cognitive Load

Five of eight checklist items fail: chunking, grouping, visual hierarchy, minimal choices, working memory. 47 interactive elements visible while recording; 65 with a tasting form open. The count is intrinsic (the brief chose no wizard); the ungrouped churn stack is extraneous.

## Minor Observations

- Copy drift: "This batch has not been tasted yet." vs brief's "not yet evaluated".
- The shortcut button's label is a full sentence and reads like a pre-filled value.
- Anchors in parentheses when reading, at row ends when writing.
- First tasting has a hairline rule above it; the churn section has none.
- "amended" sits under the churn date; "recorded" at the bottom.
- No button treatment exists yet; `.batch-margin button` only adds top margin.

## Questions to Consider

- Why does the churn date live at the end of the DOM rather than in the sheet's corner beside the recipe name?
- Should "date unknown" ever be a heading?
- Is the batch list a list, or the running head of the whole margin?
