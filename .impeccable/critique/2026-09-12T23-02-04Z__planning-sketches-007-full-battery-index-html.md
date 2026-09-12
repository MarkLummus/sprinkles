---
target: sketch007
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html"
target_fingerprint: "sha256:bc9c6fb89d8612b65941a167a4cf91dcec3ee8bec72a7c88ea1058fee3386eba"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html
timestamp: 2026-09-12T23-02-04Z
slug: planning-sketches-007-full-battery-index-html
---
Method: dual-agent (A: design-review agent · B: detector/browser agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Toast + Undo at the page foot while Remove/Clear happens mid-page; empty Clear is a silent no-op |
| 2 | Match System / Real World | 4 | Maker's own vocabulary throughout; plain-language errors |
| 3 | User Control and Freedom | 3 | Undo correctly scoped; empty-clear silence the one dead control |
| 4 | Consistency and Standards | 3 | 6px caption gaps uniform; two identical Cancel buttons, different scopes |
| 5 | Error Prevention | 4 | No defaults, blank-stays-blank, per-field sign constraints, decimal-comma normalization |
| 6 | Recognition Rather Than Recall | 3 | Inline hints everywhere; intermediate stops 2/4 unlabeled for sighted users |
| 7 | Flexibility and Efficiency | 3 | Roving tabindex, click-to-clear, decoupled saves; proportionate accelerators |
| 8 | Aesthetic and Minimalist Design | 3 | World held cleanly; selected controls triple-coded |
| 9 | Error Recovery | 4 | Inline word-level messages, focus to first error, entries preserved |
| 10 | Help and Documentation | 3 | Inline labels/hints are the contextual help — right shape for this surface |
| **Total** | | **33/40** | **Good** |

## Design Specificity Verdict

**LLM assessment**: Unmistakably authored for this product. Bookcloth green on precisely two elements (region names); pen blue exclusively on maker-entered values; selected states are the pen's fill and nothing else carries fill; no grays, shadows, or radius in the product area. The vocabulary is the churn sheet's own. The core/declared split with positioned hairline and "Declared for this recipe" cue encodes PRODUCT.md's four-fixed-axes constraint structurally. A generic form builder could not produce this page.

**Deterministic scan**: `impeccable detect --json` exit 2, 9 findings (8 advisory, 1 warning monotonous-spacing). 8 of 9 are false positives landing exclusively on the declared sketch chrome (#variant-nav, .frame, .ruler, page backdrop) or hidden-by-default elements; live in-DOM scan corroborated none of the color findings, and every gray inside .app is exactly --ink #141414. The reproducing finding: monotonous-spacing — literal 4px micro-gaps on .field-unit, .axis .stops5, .defect-chips (13 elements at computed 4px); the 4px comes from literals, not the token scale (--gap-xs is 6px); the stops gap is the load-bearing 186px track arithmetic.

**Visual overlays**: Overlay injected successfully in the automation browser (console: monotonous-spacing + repeating-stripes-gradient, the latter hidden chrome). No user-visible overlay on the human's screen; evidence captured programmatically.

## Overall Impression

The strongest state the sketch has reached. Held back from Excellent not by structure but by placement problems — reassurance rendered where the eye isn't — and one silent distinction one row below where the same distinction already earned a name.

## What's Working

1. The state-based save ceremony — Save batch vs Save batch & tasting tracks structure, not content; churn-only reads complete with zero modes to learn.
2. Blank-stays-blank made legible — nothing pre-selected, "(Not recorded)" in ink vs "(3)" in pen, "(estimated)", the region head states the contract in words.
3. Keyboard/AT engineering that follows the eye — roving tabindex, Home/End, row-major 3-col tab order, marks surviving re-renders, focus landing correctly after Add/Remove.

## Priority Issues

1. [P2] Reassurance renders at the page foot while the action happens mid-page — in always-visible mode, Clear tasting empties the section visibly but toast + Undo sit below the fold with no focus move; empty clear is a silent no-op. Fix: co-locate transient status + Undo with the tasting section head, or move focus to Undo on clear. Suggested command: /impeccable harden
2. [P2] The Bitter chip's declared distinction is whitespace-only — a measured 26px gap with no name, while the axes' identical distinction earned a named cue. Fix: caption-face "declared" micro-cue on the chip, aria-label "Declared for this recipe: Bitter". Suggested command: /impeccable clarify
3. [P2] 32px targets on the primary recording controls on the phone-transcription device — stops 34×32, chips 87×32, segs 110×32, Add tasting a 24px link; at 393px the axis is full-width yet stops stay 34px. Fix: at ≤760px grow toward 44px targets. Suggested command: /impeccable adapt
4. [P3] Selected controls triple-coded (fill + bold + underline) — the underline inside a filled 34px digit box reads as hyperlink noise. Fix: drop underline where fill carries state; keep forced-colors outline. Suggested command: /impeccable polish
5. [P3] Two identical Cancel buttons with different scopes when the tasting is open — Mark's explicit fourth-round call; name the scopes in the persistence contract when this becomes functional. Suggested command: phase-plan note

## Persona Red Flags

**Jordan (first-timer)**: intermediate stops 2/4 carry no sighted word; the Bitter gap says nothing; "Tempering" has no inline gloss; two Saves and two Cancels with no scope labels — a real first-use stall.

**Sam (accessibility)**: radiogroups that uncheck on re-activation violate the ARIA radio contract (deliberate no-defaults rule; a toggle-button pattern would be honest); empty Clear announces nothing; the tasting h2 swallows its helper text; text controls 24px tall. Everything else exemplary: roving focus, Home/End, forced-colors fallback, dir=auto, 17:1 contrast.

**Casey (distracted mobile)**: 32px targets across every marking control; the open record runs 2,067px at 393px with no draft persistence (persistence contract already flagged for the phase plan). Verified good: zero horizontal overflow, single-column ladder, decimal keyboards.

## Minor Observations

- The stops' 4px gap is principled track arithmetic; the field-unit and chips 4px gaps have no such constraint and could read --gap-xs (6px).
- Recorded vs unrecorded axis state is pen-blue vs ink at 12px, same weight — subtle at a glance across six axes.
- A marked axis inserts Clear ahead of the stop row in tab order — worth a live screen-reader listen.
- Breakpoint crossing retires a pending undo — a resize between Remove and Undo erases the remedy.
- The closed record ships 65 buttons in the DOM (hidden tasting included) — fine for a sketch.
- Churn date 2026-08-02 remains the sanctioned working-case exception; everything else verified blank on load.

## Questions to Consider

1. Should the churn instruments (4 numerics + 2 segs) get the same hidden-until-wanted treatment the tasting got, or does the sheet metaphor need everything visible?
2. What if the tasting section head carried the record in the margin's own voice — "Soft (2) · grainy · bitter" — so the closed record reads without being unwrapped?
3. Is Save the last emotional beat, or is "Next time" the ending — what would it mean to save into the next version rather than after it?
