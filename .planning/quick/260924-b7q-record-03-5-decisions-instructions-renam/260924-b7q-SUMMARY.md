---
phase: quick-260924-b7q
plan: 01
quick_id: 260924-b7q
status: complete
subsystem: docs, app/src/ui, canvas-generators
tags: [instructions-rename, carried-forward-removal, phone-logging-deferral, 03.5]
dependency-graph:
  requires: []
  provides:
    - Instructions label live in app/src (heading + accessible name)
    - Instructions label recorded in all living docs
    - Carried forward drop recorded (briefs, domain language, gen.py, handoff)
    - Phone-logging deferral recorded as a new todo
  affects:
    - Phase 03.5 discussion (shorter open list, settled vocabulary)
tech-stack:
  added: []
  patterns:
    - "Source-text regex pinning for a component RecipePage.jsx cannot render in the node test harness (mirrors the existing G-03.4-r4-1 tabindex block)"
key-files:
  created:
    - .planning/todos/pending/2026-09-24-write-a-product-brief-for-phone-based-jobs.md
    - .planning/quick/260924-b7q-record-03-5-decisions-instructions-renam/260924-b7q-SUMMARY.md
  modified:
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx
    - DESIGN.md
    - .impeccable/design.json
    - .impeccable/surfaces/route-recipe.md
    - .impeccable/surfaces/route-recipe-version.md
    - .impeccable/surfaces/route-recipe-batch.md
    - .impeccable/surfaces/route-print-recipe-sheet.md
    - .impeccable/surfaces/route.md
    - product-requirements/05-domain-and-language.md
    - .claude/skills/sketch-findings-sprinkles/references/page-shell-front-matter.md
    - .planning/canvas-generators/gen.py
    - .planning/todos/pending/2026-09-24-decide-whether-the-batch-and-tasting-log-is-entered-on-the-phone.md
    - .planning/.continue-here.md
    - .planning/HANDOFF.json
    - product-requirements/01-product-brief.md
    - product-requirements/03-decision-register.md
    - .planning/ROADMAP.md
decisions:
  - "The Sheet's steps region is named Instructions everywhere a reader sees it, on screen and in the living docs; no identifier (Method.jsx, the Method component, method-region class, method-step classes, version.method) changed — that question stays open for Mark in the 03.5 discussion."
  - "Carried forward notes are dropped, recorded in both surface briefs with the 03.5-scope code consequence and the open question of where the three seeded notes' words go; gen.py stops drawing the block and its fold on every board."
  - "Phone logging is deferred out of 03.5 to a new product-brief todo, which takes the original phone-logging todo as its first input."
metrics:
  duration: ~50min
  completed: 2026-09-24
actuals:
  tokens: 46000
  tasks: 3
  commits: 3
plan_head_before: 7f56f9e
---

# Quick Task 260924-b7q: Record 03.5 decisions; Instructions rename Summary

Recorded three of Mark's 2026-09-24 decisions for Phase 03.5 (Carried forward notes dropped, phone logging deferred to a new product brief, Instructions replaces Method everywhere user-visible) and applied the Instructions rename across the app's two live strings and nine living-doc files, per a plan with a TDD-gated app task and two doc/generator tasks.

## What Was Built

**Task 1 (feat, commit 869dddd):** `Method.jsx`'s `region-name` heading and `RecipePage.jsx`'s `method-region` section's `aria-label` both now read "Instructions". RED/GREEN/REFACTOR: renamed and repointed `Method.test.jsx`'s existing "Before you start" order test to the new heading text; added a new source-text-pinned describe block to `RecipePage.test.jsx` (matching the file's existing G-03.4-r4-1 tabindex pattern, since RecipePage cannot render in the node harness) asserting exactly one `method-region` section carrying `aria-label="Instructions"`. Confirmed RED (exactly these two tests failed, 1155 total), then GREEN (1155 passed, build succeeded). No identifier, class name, comment, or describe title naming the component changed.

**Task 2 (docs, commit 32fc439):** Nine living-doc files replaced "Method" with "Instructions" wherever they name the region or its screen/accessible-name label — DESIGN.md (6 edits), `.impeccable/design.json` (3 edits, re-validated as JSON), the five surface briefs, `05-domain-and-language.md`, and the sketch-findings page-shell reference. `route-recipe.md` § "03.5 revision" gained two dated bullets: one recording the Instructions rename and its open code-identifier question, one recording the Carried forward drop with its 03.5-scope code consequence (`Authored.jsx`, `RecipePage.jsx` wiring, the `olive-oil.js` seed's three notes, `transfer.js` validation) and the open question of where the three seeded notes' words go. `route-recipe-version.md` § 3's Inherited notes paragraph now states the marker stays on Before you start notes. Historical/generic/CSS-class uses of "method" were left untouched (verified via `verify-quick.py docs`'s guard checks and the git-status scan for touched historical directories).

**Orchestrator scope addition (included in the Task 2 commit):** swapped "Method" → "Instructions" in `product-requirements/01-product-brief.md:35`, `product-requirements/03-decision-register.md` D18, and `.planning/ROADMAP.md`'s two not-yet-executed phase entries (Phase 03.5 line 464, Phase 5 lines 23 and 496). Phase 03.3's completed/historical ROADMAP entries (lines 257, 270) were left untouched, since they record what was actually built and decided at the time.

**Task 3 (docs, commit a4ac8f6):** `gen.py`'s `SHEET` fragment now strips the Carried forward `<div class="authored">...</ul></div>` block via a `re.sub` inserted right after the existing Method→Instructions replacement; the phone-fold logic's "close the balance fold before Carried forward" replace was swapped for a simpler `</div></article>` → `</div></div></article>` close (equivalent now that only closing divs sit between the balance fold and the Sheet's `</article>`); the three rung-title strings dropped "notes"; the `phone_folds` docstring and a code comment were updated to match. The phone-logging todo gained a "Deferred — 2026-09-24" section pointing at the new todo, refreshed its Solution wording, and updated its folds description; the new todo `2026-09-24-write-a-product-brief-for-phone-based-jobs.md` was created with the phone-logging todo and two brief line references as its `files` list. `.continue-here.md` and `HANDOFF.json` both gained all three 2026-09-24 decisions and a revised open-items list (rename label, fold memory, Recipe Book yield/timing fields, Done/Cancel wording, whether code identifiers follow the Instructions rename, and where the seeded carried-forward notes' words go, plus whether "Notes" still names anything on the Sheet).

## Verify-gen.py result

`python3 verify-gen.py` printed: **"OK 16 boards and canvas.json match the published outputs minus Carried forward."** It ran a copy of the edited `gen.py` and `longhist.py` with `OUT` redirected into a fresh temp directory (never the previous session's scratchpad, never published), against the canvas source copies and previously-published outputs still present in that session's scratchpad — confirming every board differs from its published counterpart by exactly the two intended edits (the Carried forward block/fold removed, the three rung titles reworded) and nothing else.

## Regeneration and publish — not done here

Regenerating the boards from the edited `gen.py` and publishing the chosen C boards to `.planning/sketches/` happens in handoff **Task 6**, per `.continue-here.md`'s remaining_work (amended this task to say "Regenerate first" and to grep the outputs for no "Carried forward" and no "fold-notes" before publishing). This task never ran `gen.py` or `longhist.py` directly — only `verify-gen.py`'s sandboxed copy — and never published to the canvas.

## Out of scope — left for the 05-domain row to govern

Per the plan's own recorded facts, these occurrences of "Method" were deliberately left unedited, since `05-domain-and-language.md`'s Preferred-vocabulary/Interface-labels rows are the governing record for older wording:
- `product-requirements/01-product-brief.md:35` — **edited** under the orchestrator's explicit "rename Instructions everywhere" scope addition (see above), which supersedes the plan's original out-of-scope note for this specific file.
- `product-requirements/03-decision-register.md:76` (D18) — **edited** under the same orchestrator scope addition.
- `.planning/ROADMAP.md:23/464/496` — **edited** (not-yet-executed phases only) under the same orchestrator scope addition; ROADMAP's completed/historical phase entries were left untouched.

(The plan's own text named these as out-of-scope for the plan itself; the orchestrator's mid-dispatch instruction explicitly broadened scope to include them, so they were edited here rather than deferred further.)

## Open question added for Mark

- **Whether code identifiers follow the Instructions rename** — `Method.jsx`, the exported `Method` component, its import in `RecipePage.jsx`, the `method-region` class, every `method-step` class, and `version.method` are all unchanged. This is recorded as open in `route-recipe.md` § "03.5 revision", `.continue-here.md`'s blockers, and `HANDOFF.json`'s `human_actions_pending`.
- **Whether "Notes" still names anything on the Sheet once Carried forward is gone** — added to `.continue-here.md`'s blockers and `HANDOFF.json`'s `human_actions_pending`, since Carried forward was the other component of the margin's authored-notes grouping alongside Before you start.

## Deviations from Plan

### Auto-corrected during execution (not Rule 1-4 deviations — self-caught before commit)

While drafting Task 2's route-print-recipe-sheet.md edits, an extra unplanned sentence ("Superseding 'Method page' above...") was briefly added and a stray duplicate edit introduced a double blank line; both were caught and reverted before running any verification, so the final Task 2 commit contains only the plan's specified edits. No deviation rule applies since nothing incorrect reached a commit.

None - plan executed exactly as written otherwise.

## Known Stubs

None.

## Threat Flags

None. This task only replaced static label text, added dated markdown/JSON bullets, and edited a local canvas-generator script that never runs against production data or is invoked in the app.

## Self-Check: PASSED

- FOUND: app/src/ui/Method.jsx (Instructions heading, line 590)
- FOUND: app/src/ui/RecipePage.jsx (Instructions aria-label, line 1884)
- FOUND: .planning/todos/pending/2026-09-24-write-a-product-brief-for-phone-based-jobs.md
- FOUND: commit 869dddd
- FOUND: commit 32fc439
- FOUND: commit a4ac8f6
- `npm --prefix app test`: 1155/1155 passed (41 files)
- `npm --prefix app run build`: succeeded
- `verify-quick.py app|docs|handoff`: all OK
- `verify-gen.py`: OK 16 boards and canvas.json match
