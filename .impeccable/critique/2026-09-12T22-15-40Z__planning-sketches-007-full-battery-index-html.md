---
target: Sketch 007 current Option A, three columns, hidden-until-added tasting
total_score: 25
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html"
target_fingerprint: "sha256:48725cf3244501ae4f39bdd97f3d4da4a2e4bac33a6dde4182f8ba12baaae40a"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html
timestamp: 2026-09-12T22-15-40Z
slug: planning-sketches-007-full-battery-index-html
---
Method: dual-agent (A: /root/fresh_design · B: /root/fresh_evidence)

Keep Option A and the three-column desktop axes. The current hidden-until-added tasting state gives the churn-only form a clean ending. Once expanded, the note → ratings → problems → melt-test sequence is coherent. The notebook identity feels specific to Sprinkles, and the stronger typography makes section names, labels and written observations easier to distinguish. No visual redesign is warranted.

What works: three-column axes remain compact and legible; unrecorded states remain explicit; rating groups now announce their names and checked values and respond to arrow keys; Add tasting opens and focuses the date, and Remove tasting really collapses the section. Previous criticism that Remove merely clears the form no longer applies.

Priority issues:
1. [P2] Undo disappears after an unrelated churn selection. Reproduced: add a tasting, enter a note or rating, remove tasting, then select Smooth ribbon under Exit consistency. Undo disappears. Churn changes cannot conflict with restoring a tasting. Restrict undo invalidation to tasting edits, and keep the saved snapshot independent of rendered element references. Suggested command: impeccable harden.
2. [P2] The open observation is still prompted by a defect. The metallic-aftertaste placeholder biases the first response toward faults even though Option A deliberately places this question before the checklist. Use “Flavor, texture, anything that stood out…” or leave it blank. Suggested command: impeccable clarify.
3. [P3] Visual grouping needs a discoverable meaning. The vertical separation before Body/Oil and extra gap before Bitter signal a difference without explaining it. If the distinction matters while recording, provide a compact group cue or accessible description. Keep the three-column grid and avoid adding repeated headings to each cell. Suggested command: impeccable clarify.

Minor observations: the prefilled churn date should remain understood as example content rather than an automatic real observation. Two Save scopes in the expanded form need an explicit persistence contract when this becomes functional; the current preview does not establish what gets stored. Do not count demonstration save behavior as a broken production feature.

Cognitive load: low-to-moderate for an experienced maker. Progressive disclosure now reduces the initial demand, and repeated ordered scales are easy to scan. No reason to shorten the five-point scale or add more collapsing sections. The main remaining mental work is interpreting group distinctions. The journey now ends cleanly at Save batch when untasted and Next time plus combined save when expanded.

Persona checks: a returning maker can lose removed-tasting recovery by correcting churn observations; a first-time user is guided toward a defect by the note example; a keyboard user now receives named rating groups and selected-state feedback, resolving the previous blocker.

Provisional sketch assessment:
| Heuristic | Score / 4 | Basis |
|---|---:|---|
| Status visibility | 3 | Clear selected and unanswered states |
| Real-world match | 3 | Coherent churn/tasting sequence |
| Control and freedom | 2 | Undo invalidation defect |
| Consistency | 3 | Predictable rating semantics |
| Error prevention | 3 | Explicit blanks and measurement feedback |
| Recognition | 3 | Visible units and anchors |
| Efficiency | 3 | Compact grid and keyboard ratings |
| Minimalist design | 3 | Clear notebook hierarchy |
| Error recovery | N/A | Save/persistence remains a preview |
| Help | 2 | Grouping meaning not explicit |
| Total | 25/36 | Sketch-level, not release readiness |

Detector: 9 flags, comprising seven sketch-chrome color advisories, one optional measurement-ruler stripe advisory and one aggregate spacing warning. These do not establish a product design defect; the live form has deliberate section spacing. No reliable overlay is available because browser evaluation is read-only; source detector, live screenshots, accessibility state and keyboard behavior supplied evidence instead. Mobile was not retested in this critique.

Questions: Should the next pass prioritize the undo fix only, or include the two copy/grouping refinements? Should the observation cue be neutral text or blank?
