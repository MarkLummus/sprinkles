---
quick_id: 260916-tai
slug: revise-route-recipe-batch-md-record-the-
date: 2026-09-16
mode: quick
doc_only: true
status: complete
files_modified:
  - .impeccable/surfaces/route-recipe-batch.md
commits:
  - ca8a1a4
  - f6ed685
  - aa096d4
---

# Revise route-recipe-batch.md: the twin Saves are deliberate; click-again-clears is struck — Summary

One-liner: Brought `.impeccable/surfaces/route-recipe-batch.md` back in line with the shipped `BatchRow.jsx`/`PenFoot.jsx` code on two threads Mark ruled stale — the twin Save ceremonies are one deliberate act offered twice (not two save scopes with state-based labels), and picking an already-picked stop or segmented option a second time no longer clears it (Clear is the only way back) — logging both supersessions in the file's own house style and its Status line.

## What was done

Three tasks, three commits, doc-only. `app/` was never touched (confirmed empty `git status --porcelain app/` after every task and again at the end).

### Task 1 — Thread A: twin Saves as deliberate redundancy (commit `ca8a1a4`)

| Line(s) (final) | Passage | Treatment |
|---|---|---|
| 54 | Section 3, "Saving is decoupled, two scopes" paragraph | Silent replacement — rewritten as "Saving is one act, offered twice", preserving the untouched toast/undo remainder verbatim |
| 60 | Section 3, "The ceremony's save pairs" | Silent replacement — reheaded "Where the ceremonies sit," records the 2026-09-12 reading as superseded 2026-09-16 rather than deleting it (house style) |
| 76 | Section 4, Breadth/Interactivity | Silent replacement — "the decoupled saves" → "the two save ceremonies"; "save either scope" → "save" |
| 78 | Section 4, "In:" (thread a clause) | Silent replacement — "decoupled saves with state-based labels (...)" → "one save act offered from two ceremony mounts, both reading \"Save batch\"" |
| 110 | Section 6, battery's controls (thread a clause) | Silent replacement — "...through its Cancel \| Save batch only..." → "...through the ceremony that closes the record body..." |
| 123 | Section 7, Binding, final sentence | Silent replacement — records the persistence contract as dissolved 2026-09-16 rather than open |
| 124 | Section 7, Binding bullet | Silent replacement — split into two sentences; the "state-based save labels" clause replaced with the unconditional-label statement dated to Mark, 2026-09-16 |
| 162 | Section 7, "Carried for the phase plan" | Recorded supersession — the two items moved to a new "Closed 2026-09-16" clause instead of remaining in the carried list |
| 168 | Section Labels | **Append only** — 2026-09-12 sentence preserved verbatim (retired labels survive only here); a new sentence appended retiring them |
| 80 | Section 4, "Out, and named:" | Recorded supersession — new item inserted naming the split save scopes as superseded 2026-09-16 |

Left alone on purpose, per plan: line 58 ("Save batch" is explicit), line 82 (no-content-sniffing anti-goal), line 115's 2026-09-08 record.

Task 1 verify gate: all 9 checks passed (negative grep for stale phrasing, retired-label counts in/out of the Labels register, "deliberate redundancy", "mounted twice", Out-list supersession text, unconditional-label sentence, untouched anti-goal, clean `app/`).

### Task 2 — Thread B: click-again-clears struck (commit `f6ed685`)

| Line(s) (final) | Passage | Treatment |
|---|---|---|
| 56 | Section 3, "Blank stays visibly blank" | Silent replacement — "Clicking a picked stop or option again clears it" → "Picking is final ... Clear ... is the only way back", citing `DESIGN.md` and sketch 007 |
| 78 | Section 4, "In:" (thread b clause) | Silent replacement — "per-axis Clear and click-again-clears..." → "a Clear in each axis's and each segmented control's caption line as the only way back..." |
| 102 | Section 5, Material states | Two-word deletions — "a segmented option cleared again" → "cleared"; "an axis cleared again" → "cleared" |
| 109 | Section 6, "Marks" | Silent replacement — "one click sets a stop, clicking it again clears" → "one click sets a stop and picking is final; per-axis Clear — the only way back — ..." |
| 110 | Section 6, battery's controls (thread b clause) | Silent replacement — "...no default, click-again clears;" → "...no default, and a Clear in the caption line as the only way back;" |
| 80 | Section 4, "Out, and named:" | Recorded supersession — second item inserted alongside Task 1's, naming the click-again gesture as superseded 2026-09-16 |

Defect-chip sentences (line 110's toggle-chips clause, section 6's independent-toggle description) and the unrelated "saving again adds an amended-on date" sentence (line 62 area) were left untouched, as required — defect chips remain independent on/off and do toggle off.

Task 2 verify gate: all 8 checks passed (negative grep for click-again/again-clears/cleared-again, "Picking is final" present, "only way back" count 5 ≥ 4, Out-list supersession text, material-states wording, untouched defect-chip and "saving again" sentences, clean `app/`).

### Task 3 — Status line revision (commit `aa096d4`)

| Line | Passage | Treatment |
|---|---|---|
| 10 | Status line | Appended (chain extended, not restructured) — new `revised 2026-09-16 after the BatchRow critique (...)` clause inserted between the 2026-09-12 clause's close and `**Target:**`, summarizing both threads |

Task 3 verify gate: all 9 checks passed (clause present, joins the chain with the correct semicolon boundary, critique path present, "deliberate redundancy" and "picking is final" both present, prior 2026-09-12 clause intact, `**Target:**` intact, front matter unchanged, clean `app/`).

## Plan-level `<verification>` block — run and reported as instructed

Ran all seven checks from the plan's overall verification section after all three tasks. Two produced output that differs from the plan's stated expectation; both trace to legitimate, plan-mandated verbatim text rather than any leftover stale claim. Reporting exactly as instructed rather than adjusting either gate or the content to force a pass:

1. **Expected: no match. Actual: matches, on line 10 only.** `grep -niE 'two scopes|two save scopes|...'` matches the Status line's own new clause, because the verbatim text mandated by plan entry C-1 (transcribed exactly) reads "...one act offered twice as deliberate redundancy, **not two scopes** with conditional labels...". The substring "two scopes" appears inside a negation stating the old reading no longer holds — there is no affirmative claim of two scopes anywhere in the file. No other line matches.
2. **Expected: ≥ 3. Actual: 2.** `grep -c 'superseded 2026-09-16' "$F"` counts matching *lines*, not occurrences. The phrase actually appears 3 times — line 60 (once) and line 80 (twice, one for each retired idea, both inserted on the same "Out, and named:" line) — but `grep -c` collapses the two same-line occurrences into one line-count, yielding 2 rather than 3.

Checks 2, 3, 5, 6, 7 all passed as stated: retired labels absent from sections 1–7 (count 0); the Labels register's dated 2026-09-12 sentence still carries exactly one "Save batch only" (count 1); the Status line carries "2026-09-16" (count 1); `git status --porcelain app/` is empty; `git diff --stat` across the three task commits names exactly one file (`.impeccable/surfaces/route-recipe-batch.md`, 28 lines changed).

Both discrepancies are artifacts of the plan's own blunt regex/line-counting choices interacting with plan-mandated verbatim prose (C-1's negation, and two Out-list items landing on one physical line) — not defects in the content. All `must_haves` in the plan frontmatter are independently satisfied: no sentence anywhere asserts two save scopes, state-based labels, or conditional save rendering; no sentence anywhere asserts that a second pick clears a stop or segmented option; both retired ideas are recorded as 2026-09-16 supersessions in the Out list; the Labels register keeps its 2026-09-12 sentence verbatim plus a retirement clause; the Status line carries the 2026-09-16 revision clause; `app/` is untouched throughout.

## Deviations from Plan

None — plan executed exactly as written, entry by entry, transcribed verbatim. The only departure from a clean run is the two verification-gate discrepancies documented above, which are reporting artifacts of the plan's own check design, not implementation deviations.

## Confirmation

`git status --porcelain app/` returned empty after every task and again at the end of the plan. `git diff --stat` across the three commits names exactly one file: `.impeccable/surfaces/route-recipe-batch.md`.

## Self-Check: PASSED

- FOUND: `.impeccable/surfaces/route-recipe-batch.md` (exists, modified as described)
- FOUND: commit `ca8a1a4` (Task 1)
- FOUND: commit `f6ed685` (Task 2)
- FOUND: commit `aa096d4` (Task 3)
- CONFIRMED: `git status --porcelain app/` empty
