---
target: sketch007
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html"
target_fingerprint: "sha256:75f8e920f330ae1e51ac8b228b046f48eaaf828dc47f907191526be48200201c"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html
timestamp: 2026-09-12T23-38-52Z
slug: planning-sketches-007-full-battery-index-html
---
Method: dual-agent (A: design-review agent · B: detector/browser agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Solid — every action confirms; status lands on the headline baseline |
| 2 | Match System / Real World | 4 | Maker's vocabulary throughout; "Tempering" the only domain assumption |
| 3 | User Control and Freedom | 3 | Undo excellent but silently dies on any axes re-render |
| 4 | Consistency and Standards | 3 | Optionality written three ways; two identical Cancels, unnamed scopes |
| 5 | Error Prevention | 3 | Blank-stays-blank + undo real; churn-row Save can read page-level while excluding tasting |
| 6 | Recognition Rather Than Recall | 3 | Intermediate stops 2/4 have no visible word |
| 7 | Flexibility and Efficiency | 3 | Keyboard-complete with accelerators; proportionate |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined; filled record = a dozen equal-weight pen-blue blocks |
| 9 | Error Recovery | 4 | Word-level inline errors, focus to first error, entries never wiped |
| 10 | Help and Documentation | 3 | Inline helpers task-focused; "tasted, nothing to add" carried by structure alone |
| **Total** | | **33/40** | **Good (83%)** |

## Design Specificity Verdict

**LLM assessment**: Unmistakably authored for Sprinkles and Mark's loop. The selection grammar is the Two-Ink Rule (every maker mark fills pen-blue #1f3d7a, nothing green/red); blank-stays-blank enforced with zero defaults anywhere; the "· declared" suffix and "Declared for this recipe" cue encode the four-fixed-plus-declared axis constraint in the UI with no explanatory paragraph. A generic form-builder could not have produced this page.

**Deterministic scan**: `impeccable detect --json` exit 2, 9 findings (8 advisory, 1 warning). All 7 design-system-color findings are chrome-only false positives (verified against computed styles in four page states; the live in-page detector never surfaced a color finding). The one product finding: monotonous-spacing — literal 4px micro-gaps on .field-unit, .stops5, .defect-chips (the stops' gap is the deliberate 186px track arithmetic). repeating-stripes-gradient is the hidden chrome ruler.

**Visual overlays**: Overlay injected across four states (default hidden, always-visible, hidden again, 393px). No user-visible overlay on the human's screen; evidence captured programmatically.

## Overall Impression

Same 33/40 as the prior run — the floor is real. The last run's top P2 (below-the-fold reassurance) is measured solved at both 1080px and 800px. What holds the score at Good is naming and sizing, not structure: a four-button ceremony at the peak-end moment, and a touch pass that grew the marking controls but skipped the page's most-used ones.

## What's Working

1. Destructive moments are the best-designed part of the page — feedback bound to the trigger's location, empty clear explains itself, toast self-clears while Undo persists, undo retirement correctly scoped.
2. Blank-stays-blank with zero defaults — the record opens exactly as a fresh one would.
3. One uniform selection grammar, keyboard-complete — click-to-set/click-to-clear everywhere, roving tabindex, marks surviving re-renders by axis id.

## Priority Issues

1. [P2] The 44px touch pass skipped .btn (34px) and inputs (28–30px) at 393px — the primary action and highest-frequency typing targets are the smallest elements. Fix: min-height 44px on .btn and .ink-field/date inputs in the ≤760px block. Suggested command: /impeccable adapt
2. [P2] The four-button ceremony is ambiguous at the peak-end moment — both Cancels identical and unnamed; churn-row Save silently excludes the tasting while looking page-level. Fix: name the scopes on the buttons (or drop the churn-row ceremony while the tasting section is present). Suggested command: /impeccable clarify
3. [P3] Undo renders far from Clear on desktop — the wrapped head puts Undo ~570px from Clear tasting. Fix: order head children status → Undo → spacer → Clear. Suggested command: /impeccable layout
4. [P3] Intermediate stops 2/4 have no visible word — "leaning hard" survives only in the aria-label. Fix: render the word in the state span ("(4 · leaning hard)"). Suggested command: /impeccable clarify
5. [P3] Undo dies on resize/re-render without notice — captured element references go stale. Fix: store the cleared tasting as data (field ids + values + axis ids), restore on re-render. Suggested command: /impeccable harden

## Persona Red Flags

**Sam (accessibility)**: sub-44px buttons/inputs at phone width; per-axis "Hardness cleared." announces to the page-foot live region ~800px away from the axis; the h2 swallows its helper sentence. Everything else exemplary.

**Casey (phone)**: no horizontal overflow at 393; footer in the thumb zone. Flags: 34px/28px targets; "Undo clear tasting" wraps alone onto a second footer row at 393px; no persistence on interruption (phase-plan carry).

**Jordan (first-timer)**: two identical Cancels and two differently-scoped Saves; "Undo clear tasting" after "Remove tasting" names neither the action nor its reversal; "Tempering"/"Exit consistency" assume vocabulary.

## Minor Observations

- matchMedia re-render did not fire under CDP device emulation (first load at phone width correct; real phones fine; only live desktop drag across 760px depends on the event) — worth one manual check.
- Placeholder text renders at full ink italic rather than muted.
- Churn date accepts future dates (dates excluded from validation).
- The 5s toast guard works across different targets; anchors aria-hidden correctly; caption/helper baseline within 1px.
- Churn-only flow is a clean 455px page with one ceremony — the strongest first impression in either mode.

## Questions to Consider

1. When Mark returns next day just to add a tasting, does re-scrolling past all eight churn fields hold up, or does "two moments in one flow" win once this carries real data?
2. "Tasted, nothing to add" vs "never finished recording" now distinguished only by the presence of marks — will that survive contact with a real half-filled record at read time?
3. The goldilocks middle says "right" — is one word doing two jobs (description and approval) the quietest violation of the No-Verdict Rule, or exactly the directional signal D07 will need?
