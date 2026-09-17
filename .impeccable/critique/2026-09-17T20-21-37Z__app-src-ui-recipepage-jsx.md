---
target: recipe reading view with multiple versions and batches
total_score: 23
max_score: 40
verdict: Acceptable
p0_count: 0
p1_count: 2
p2_count: 4
p3_count: 0
assessment_a: design and information architecture
assessment_b: browser, source, and detector evidence
detector_findings: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:c3a83301d61eb6d3c930407b56ae1094077b50dba384d2c8a1ab222cf55ef2bb"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-17T20-21-37Z
slug: app-src-ui-recipepage-jsx
---
---
target: recipe reading view with multiple versions and batches
total_score: 23
max_score: 40
verdict: Acceptable
assessment_a: design and information architecture
assessment_b: browser, source, and detector evidence
detector_findings: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app-src-ui-recipepage-jsx"
timestamp: 2026-09-17T20-21-14Z
slug: app-src-ui-recipepage-jsx
---
# Impeccable critique: recipe version and batch history

## Verdict

The reading page has strong recipe-specific structure, but its history model becomes misleading once more than one version or batch exists. “Later” should be removed. It means descendants for versions, but every record except the selected one for batches; neither use reliably describes chronology.

Use neutral noun-and-count controls—“Versions (2)” and “Batches (3)”—and mark the selected item “In view.” Preserve the distinction between a version (a recipe plan) and a batch (an execution of that plan), while letting a recipe-level history show their causal sequence together.

## Priority findings

### P1 — “Later batches” can be factually wrong

The reading route opens the newest batch by default, yet `BatchRow.jsx` calculates the count as all batches other than the open one and calls them “later.” From the newest batch they are earlier; from a middle batch they may be both earlier and later. The expanded heading, “Batches of this version,” is already accurate.

**Recommendation:** Change the trigger to “Batches (3)” or “2 other batches.” Show every batch newest-first in the expanded panel and mark the selected record “In view.” Use explicit Earlier/Later groups only if chronology itself becomes a user task.

### P1 — Versions and batches do not yet form a coherent experiment history

The interface separates descendant versions into one disclosure and sibling batches into another. A maker reconstructing plan → attempt → learning → revised plan must move between pages and remember context. This weakens the otherwise excellent separation of planned recipe, recorded batch, and tasting observations.

**Recommendation:** Keep the current Version and Batch reading sections, but add one recipe-level “History” disclosure or destination. In it, show version nodes in sequence or lineage, with each version’s batches nested beneath it. Connect a new version to the motivating record with “Made after batch · [date]” or the existing From batch provenance.

### P2 — “Later” hides both scope and current position

The compact metadata says “Later,” the control says “1 later version,” and the expanded row repeats “Later versions.” The count actually includes the descendant subtree, not simply the next chronological version. The wording does not say whether the relationship is time, direct parentage, or ancestry.

**Recommendation:** Prefer “Versions (2)” with an expanded heading “Recipe versions” or “Version history.” Include every version, mark the one in view, and show `From [version]` or indentation if branching is meaningful. If the product is intentionally linear, show chronological order and keep lineage details secondary.

### P2 — The version panel is sparse and duplicates navigation

In the live expanded state, one narrow card sits at the left of a full-width row. Its long title wraps to three short lines, and both the title and “Open” link go to the same route. This creates two keyboard stops for one action and makes the history feel like an appended card gallery rather than part of the recipe record.

**Recommendation:** Use a ruled list at the reading measure. Make the version title the single link. Use the trailing area for distinct information: Written date, From version/batch, batch count, or Latest/In view status. Remove “Open” unless it becomes a genuinely different action such as Compare.

### P2 — The current version is not explicit inside the version block

The page presents Written, Why, From batch, and Later, but does not name the version in that block or identify its place in the recipe history. Version names elsewhere can look like change summaries rather than parallel saved plans.

**Recommendation:** Give every history item the same identity pattern, such as “Version 1 · 50 g oil · 800 g,” with “In view” and, where true, “Latest.” Derive ordinals for display rather than making them the stored identity.

### P2 — Narrow layouts need defensive wrapping

Touch targets grow appropriately on narrow or coarse-pointer devices, but the 260px version-card grid and batch-history list lack explicit containment for long version names.

**Recommendation:** Use a single-column history list on narrow screens, apply `min-width: 0`, and allow long authored names to wrap safely. Preserve the 44px interactive target treatment.

## Recommended information model

- **Recipe versions** are preserved plans. “Next version” creates a child or successor plan.
- **Batches** are repeated executions of one preserved version. “Record another” creates a sibling batch.
- A version view may default to its latest batch, but “Batches (n)” reveals all batches for that version and marks the one in view.
- A recipe-level “History” view shows versions and their batches together, so the maker can follow plan → batch → tasting → reason → next plan.
- Relative words such as Later or Earlier should describe filtered chronology only, never the complement of the selected item.

## Strengths to preserve

- The Version → Batch → recipe-content order clearly distinguishes plan from actuality.
- “Next version” and “Record another” neatly express the two valid continuations after a result.
- Stable version and batch URLs, latest-batch defaulting, and the “in view” marker provide a sound navigation foundation.
- The book/front-matter visual language is distinctive and appropriate to a recipe-development notebook.

## Heuristic scores

| Heuristic | Score / 4 | Note |
|---|---:|---|
| Visibility of system status | 3 | Disclosure state and batch “in view” are clear; current/latest version position is not. |
| Match with the real world | 2 | Recipe/version/batch concepts are strong; “Later” misstates chronology and lineage. |
| User control and freedom | 3 | Stable links and collapsible lists work; whole-history navigation is missing. |
| Consistency and standards | 2 | Version and batch histories use different placement, scope, and meanings for “Later.” |
| Error prevention | 3 | Preserved records help; misleading chronology can produce context mistakes. |
| Recognition rather than recall | 2 | Reconstructing the learning sequence requires memory across pages. |
| Flexibility and efficiency | 2 | Direct URLs help; duplicate links and no compact history path slow scanning. |
| Aesthetic and minimalist design | 2 | The reading page is restrained, but repeated labels, duplicate links, and sparse cards add noise. |
| Error recovery | 2 | Invalid batch-address feedback exists, but offers weak recovery context. |
| Help and documentation | 2 | Provenance is readable; the history model and the word “Later” are unexplained. |

**Total: 23/40 — Acceptable, with a weak history model limiting an otherwise strong reading view.**

## Assessment provenance

- Assessment A: independent design and information-architecture review in a fresh browser tab; no detector.
- Assessment B: independent browser/source evidence review plus Impeccable detector.
- Detector: 0 automated findings. The issues are semantic, structural, and interaction-model problems rather than detector-rule violations.
- Ignore file: none.
- No application data or source files were changed during the critique.
