---
target: sketch007
total_score: 36
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html"
target_fingerprint: "sha256:a28ceb15f17446fce522a697d617d693d72522d1abbd36e73c2c19f6337a0d73"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html
timestamp: 2026-09-13T00-55-37Z
slug: planning-sketches-007-full-battery-index-html
---
Method: dual-agent (A: design-review agent · B: detector/browser agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Solid — every action confirms; honest preview save |
| 2 | Match System / Real World | 4 | Ice-cream language throughout; "right" carries the goldilocks middle |
| 3 | User Control and Freedom | 4 | Undo on all destructive paths, clear-per-axis, Cancel keeps entries |
| 4 | Consistency and Standards | 3 | Two identical "Cancel" buttons whose scopes differ |
| 5 | Error Prevention | 4 | Scoped validation, signed temps, decimal comma, no destructive defaults |
| 6 | Recognition Rather Than Recall | 3 | Intermediate stops (2/4) visually number-only |
| 7 | Flexibility and Efficiency | 3 | Roving arrows + Home/End, two save paths; good, not exceptional |
| 8 | Aesthetic and Minimalist Design | 4 | Every element earns its place; length is the tested question, not clutter |
| 9 | Error Recovery | 4 | Errors at the field, plain words, focus moved, work preserved |
| 10 | Help and Documentation | 3 | Inline hints only — right dose for this surface |
| **Total** | | **36/40** | **Excellent (90%)** |

## Design Specificity Verdict

**LLM assessment**: As product-specific as a form gets. Every element is load-bearing for Sprinkles' ontology: goldilocks stops whose middle is "right," defects in the maker's own words, "g lost at 20 min," "Declared for this recipe." The Two-Ink Rule is the page's data model made visible; blank-stays-blank enforces D03/D09 at the control level. No other product could use this page unchanged.

**Deterministic scan**: `impeccable detect --json` exit 2, 9 findings (8 advisory, 1 warning). All 7 design-system-color findings chrome-only false positives (verified against computed styles; the live in-page detector surfaced none of them; one attribution error noted — CLI attached the .frame outline to .app, which computes outline-style none). Sole product finding: monotonous-spacing, 9/13 (69%), stable across all states — the stops' 4px is the deliberate track arithmetic. repeating-stripes-gradient is the hidden chrome ruler. 44px media rules confirmed active at 393px; zero overflow at 393px in both tasting modes; no new issues.

**Visual overlays**: Overlay injected successfully in the automation browser (2 live findings: spacing + hidden ruler). No user-visible overlay on the human's screen.

## Overall Impression

Score moved to the Excellent band. The two previous blockers (touch targets, ceremony naming) verified fixed, the round-8 regression restored, and every previously-solved finding stays solved. What remains is one real P2 (touch tablets at 761–1024px) and P3s.

## What's Working

1. The Two-Ink Rule as data model, not palette — the page is readable from color alone.
2. Optionality carried by verbs, not decoration — "Save batch only" / "Save batch & tasting" / "Add tasting" / "Clear tasting" / "Remove tasting" carry the tasting's optional status in every state.
3. Undo engineering that matches the mental model — survives churn edits (text and radios), retires on tasting edits, survives the toast, arms nothing on empty.

## Priority Issues

1. [P2] Touch devices at 761–1024px get sub-44px targets — the ladder is keyed to viewport width only; a kitchen tablet at 768px gets 34px buttons and 32px stops. Fix: add @media (pointer: coarse) alongside the ≤760px query. Suggested command: /impeccable adapt
2. [P3] Undo not adjacent to Clear when the head wraps — 534px apart at 768px. Fix: one wrapping cluster (status + Undo + Clear). Suggested command: /impeccable layout
3. [P3] Intermediate stops have no visible word — "leaning soft" only in the aria-label; the state slot is free to carry it ("(2 · leaning soft)"). Suggested command: /impeccable clarify
4. [P3] Unit fields clip plausible values — 48px field overflows at "120.5"; churn duration of 120 min is real. Fix: widen to ~56px. Suggested command: /impeccable layout
5. [P3] Two identical Cancels with position-implied different scopes — deferred to the persistence contract (D-24: Cancel discards the whole pen). Suggested command: phase plan

## Persona Red Flags

**Sam (keyboard/AT)**: mostly clean (roving tabindex correct everywhere, aria-pressed chips, two status regions, ≥AA contrast). Flags: sighted keyboard users get strictly less information than screen-reader users (stop words in aria-label only); .field-error capped at 24ch wraps to three cramped lines.

**Casey (thumb, interrupted)**: everything 44px at ≤760px verified, zero overflow at 393, ceremony in the thumb zone. Flags: the 761–1024px touch-tablet band (issue 1); the full record is 2274px on a phone — an interruption mid-tasting means a long scroll back.

**Alex (power user)**: keyboard-complete, no redundant confirmations. Flags: no keyboard path to save (Ctrl/⌘+Enter); churn-only save after opening the tasting requires Remove tasting first — a two-step where one should do.

## Minor Observations

- .btn:hover thickens the border while shrinking padding — textbook no-move state change.
- The tasting head packs three signals; at some widths the status reads as a continuation of the heading.
- Column toggles retire a pending undo (documented carried edge).
- All previous solved findings stay solved on re-verification (remove-paths, undo scoping, helper placement, "Save batch only" rendering).

## Questions to Consider

1. Does the record still want to be one pen with two save buttons, or is "two moments in one flow" the shape the measured length (1152px/2274px) argues for?
2. What if the grid opened as "mark what stood out" with the rest behind "record all axes" — does the full battery need to be the default shape of every record?
3. Should the free state slot carry the word ("leaning soft") instead of duplicating the digit the stop already shows?
