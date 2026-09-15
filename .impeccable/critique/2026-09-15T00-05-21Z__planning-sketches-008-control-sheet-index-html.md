---
target: .planning/sketches/008-control-sheet/index.html
total_score: 13
max_score: 20
na_heuristics: 3,5,7,9,10
p0_count: 0
p1_count: 0
p2_count: 2
p3_count: 1
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/008-control-sheet/index.html"
target_fingerprint: "sha256:e12d978df95e370334f39fb0231b4408f147f1d8928f02de4389ceae9ae92150"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/008-control-sheet/index.html
timestamp: 2026-09-15T00-05-21Z
slug: planning-sketches-008-control-sheet-index-html
---
Method: dual-agent (A: box_design · B: box_evidence)

Your concern is justified most strongly for Save batch versus Coarse, icy. Both are isolated hairline rectangles, but one performs an action and the other retains an independent selection. The joined segments and numbered rating stops already communicate different structures.

The restrained paper, ink and pen-blue vocabulary suits Sprinkles. Preserve it. The opportunity is to make behavior recognizable before clicking, rather than introduce four unrelated visual styles.

| Role | Recommendation |
|---|---|
| Action | Keep the standalone outlined button, verb label and action-area placement. |
| One choice | Keep joined segments; their shared boundary communicates a single set. |
| Any choices | Use a visible square checkbox beside each defect; remove the enclosing chip rectangle. Keep the whole label clickable. |
| Rating | Keep equal numbered stops with the axis name and endpoint anchors. |

Priorities:
1. P2: Replace defect chips with compact checkbox labels. Reuse the leading-square vocabulary already chosen for Show changes, without importing its text underline. Keep selected blue on the square. This gives first-time and distracted users an immediate clue that several defects can coexist. Suggested command: impeccable adapt.
2. P2: Add a complete defect group and anchored rating to the comparison. A lone chip strips away context while segments retain their siblings. Evaluate both isolated affordances and realistic groups before changing the rating. Suggested command: impeccable clarify.
3. P3: Make hover feedback consistent. The current border change on actions and stops, but none on segments and chips, does not explain their different meanings. Use the common border-weight treatment wherever an outlined choice remains. Suggested command: impeccable polish.

Strengths: connected exclusive options, orderly numbered ratings, shared selection blue and consistent focus ring. Preserve these. Five rating stops form one ordered decision, not five unrelated tasks. The main cognitive burden is remembering which identical-looking rectangle acts and which stays selected. For a first-time user this causes hesitation; for a distracted tasting user it invites missed additional defects. Familiar checkboxes would reduce that uncertainty without adding explanatory prose or vertical space.

| Nielsen heuristic | Score /4 | Evidence |
|---|---|---|
| Status visibility | 3 | Retained selections clearly fill blue. |
| Real-world match | 3 | Familiar labels; defect checkbox lacks its familiar visible indicator. |
| Control and freedom | n/a | No complete workflow in this section. |
| Consistency and standards | 2 | Action and checkbox look alike at rest. |
| Error prevention | n/a | No validation workflow in this specimen. |
| Recognition over recall | 2 | Multiple-selection behavior needs inference. |
| Efficiency | n/a | Component comparison, not an end-to-end task. |
| Minimalist design | 3 | Coherent restraint; redundant chip outlines add noise. |
| Error recovery | n/a | No recovery workflow here. |
| Help and documentation | n/a | Specimen annotations are not product help. |
| Total | 13/20 | Acceptable; narrow component assessment. |

Issue counts: P0 0, P1 0, P2 2, P3 1.

Evidence: live desktop screenshot and source review, plus independent live interaction checks. Button/radio/checkbox roles are exposed correctly, and click selection behaves correctly. Segment arrow-key navigation did not respond in the specimen; this is an implementation caveat for a later hardening pass. The source detector returned 22 flags: 12 warnings and 10 palette advisories. Most concern specimen chrome; small low-contrast state captions are relevant to sheet readability, while annotation font/palette and heading-hierarchy flags do not explain the requested control ambiguity. No user-visible detector overlay was injected because browser evaluation is read-only. No UI source edits.
