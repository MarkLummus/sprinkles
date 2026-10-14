---
phase: 03-develop-the-next-version
plan: 12
subsystem: ui
tags: [react, css, step-numbering, accessibility, gap-closure]

requires:
  - phase: 03-develop-the-next-version
    provides: "The derived step-position maps (stepNumbers.js) and their threading through Method.jsx and IngredientTable.jsx (03-10); the diagnosed root cause in .planning/debug/removed-step-number-ambiguous-in-pen.md and the D-UAT-5/D-UAT-4 rulings it produced"
provides:
  - "Method.jsx's displayNumberFor returns {number, frame} instead of a bare integer, so every call site knows whether a step's number came from the live draft or from the pre-removal baseline instead of blending the two into one voice"
  - "The pen's margin renders no numeral at all for a removed step, in both the removed-this-session and already-removed cases — one rule instead of two side by side (D-UAT-5)"
  - "Show-changes' margin prints a removed step's parent number carrying a new .method-step__n--struck modifier that reads the existing --rule-strike token (D-UAT-4, D-UAT-5)"
  - "A removed step's field labels now name the number it had before removal, closing the ink-versus-announcement disagreement 03-10 closed for live steps and left open for removed ones"
  - "The ingredient table's step selector drops the number from a removed step's option label; the orphaned-row flag names a removed causing step by lead-in alone in every case — the pen's one rule, stated once beside StepCell"
  - "app/src/ui/Method.test.jsx's extractStepEntries captures the whole class attribute (not just the base class) so a struck modifier reads correctly, plus a new assertNoDuplicateMargins helper asserting the union of every margin a render emits (live and removed together) holds no duplicate pair of numeral and mark"
affects: []

actuals:
  tokens: 9200
  tasks: 2
  commits: 2

plan_head_before: e38c0f707a04bb3e5fb2b1ac2793c70467749185

tech-stack:
  added: []
  patterns:
    - "A resolver returning {value, frame} instead of a bare value, so a caller can render two reference frames differently instead of blending them into one voice — generalizes beyond step numbers to any future site combining a current and a baseline read"
    - "A union assertion over every rendered instance of a value (live and removed together, as numeral+mark pairs) instead of two separate half-assertions, so a guardrail can see a cross-branch collision neither half could see alone"

key-files:
  created: []
  modified:
    - app/src/ui/Method.jsx
    - app/src/styles/app.css
    - app/src/ui/Method.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx

key-decisions:
  - "The pen suppresses a removed step's margin number entirely rather than marking it — the empty margin the pen already used for a step removed before it opened becomes the pen's single rule for every removed step, per D-UAT-5. Show-changes marks it struck instead, per D-UAT-4."
  - "The struck margin number reuses the app's one Strike Rule (--rule-strike) as a new .method-step__n--struck modifier beside .method-step__n, not a reuse of .struck-value — a margin number has nothing beside it to need .struck-value's right margin."
  - "The step selector's option and the orphaned-row flag both drop a removed step's number outright rather than marking it, per D-UAT-5's own flagged assumption: an <option>'s text cannot be reliably struck across browsers, and a struck numeral in the flag's small print would read as a typo. Both surfaces already had a lead-in-alone branch for a step with no position in either version; that branch becomes the only branch."
  - "resolveStepNumber (IngredientTable.jsx) is left in place rather than deleted even though its baseline-fallback branch has no remaining caller that can reach it through a removed step today — it is still the correct rule for a future site naming a step that might be either currently active or removed, and its comment now says so explicitly."
  - "OrphanedRowFlag's currentStepNumbers/baselineStepNumbers props were dropped from its signature and call site (not left unused) — every causing step it names is removed by construction, so it never needed a number source once the number itself was dropped from its output."

patterns-established:
  - "assertNoDuplicateMargins(entries): a reusable union-uniqueness check over (numeral, mark) pairs, kept local to Method.test.jsx for now — the template for a future two-reference-frame display value's own guardrail."

requirements-completed: [REC1-03, FORM2-01]

coverage:
  - id: D1
    description: "Method.jsx's margin number resolver reports which reference frame answered (current or baseline); the pen renders no numeral for a removed step in either the removed-this-session or already-removed case, show-changes renders the parent number with a new struck modifier reading --rule-strike, and a removed step's field labels name the number it had — all closing the G-03-14 collision between a removed step's number and the live step that inherited its position"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — step display numbers (03-10, G-03-6, D-UAT-4) — 15 tests, including assertNoDuplicateMargins over the pen (single removal, non-adjacent double removal, last-step removal) and show-changes (single removal)"
        status: pass
    human_judgment: true
    rationale: "The plan's own task 1 <verify> is fully automated (build, full suite, greps against the struck-modifier class, the Strike Rule token, zero literals, and anchor-id count) and all passed. The plan's task 2 carries the phase's one real-browser <human-check> covering both tasks together (open the pen on the churned olive oil version, remove steps 1 and then 2, read the margins/cue/field labels/selector, save and press show changes) — deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase, this phase's standing precedent (03-01, 03-06 through 03-11). Recorded here rather than split across two coverage entries since the check exercises task 1's and task 2's fixes together on one page."
  - id: D2
    description: "The step selector's option for a removed step and the orphaned-row flag both drop the step's number entirely, naming it by lead-in alone (and, for the option, still present/disabled/valued on the stored key) — closing the second surface the diagnosis found (the '2 … + 2' self-contradiction) and the selector's own duplicate-numeral collision"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx#IngredientTable — the selector keeps a removed step in its list (G-03-3 S3, 03-10) — 4 tests, including the no-duplicate-leading-numeral and one-number-not-two split-step cases; #IngredientTable — the orphaned-row flag names a removed step by its lead-in alone (G-03-14, D-UAT-5) — 2 tests"
        status: pass
    human_judgment: true
    rationale: "Same real-browser <human-check> as D1 (task 2's own <verify> block): opening a flagged row's step selector and confirming no two options share a leading numeral, and pressing show changes to confirm the struck margins and live 1-through-9 sequence together on the churned olive oil version. Deferred to end-of-phase UAT per the same standing precedent; all automated verification (build, full suite, every plan-specified grep gate) passed."

duration: ~20min
completed: 2026-09-08
status: complete
---

# Phase 3 Plan 12: The margin says which frame answered — G-03-14 closed Summary

**`displayNumberFor` now returns which reference frame answered (current or baseline) instead of a bare integer, so the pen suppresses a removed step's margin number entirely while show-changes marks it struck through a new `.method-step__n--struck` rule reading the app's existing Strike Rule token — and the ingredient table's selector and orphaned-row flag both drop a removed step's number outright, closing the "2 … + 2" collision the diagnosis found.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-09-07 (see task commits below for exact timestamps)
- **Completed:** 2026-09-08T02:38:29Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- `displayNumberFor` (Method.jsx) returns `{ number, frame }` instead of a bare integer — `frame` is `'current'` for a live step's own position, `'baseline'` for the number a removed step had before removal, or `null` when neither map holds a position. Every call site (the margin in all three branches, `fieldLabel`) now reads the frame instead of discarding it.
- The pen's margin (`Method.jsx`) renders no numeral for a removed step, in both the removed-this-session case and the already-removed-when-the-pen-opened case — the two treatments the pen rendered differently before this plan become one, per D-UAT-5. The span itself still renders, so the two-column grid never shifts.
- Show-changes' margin renders a removed step's parent number carrying the new `.method-step__n--struck` class (`app.css`), which reads `--rule-strike` for its stroke thickness — the same one stroke the app's Strike Rule already uses for every "not in force" meaning, no new token added. A live step's number renders unmarked exactly as before.
- A removed step's field labels (`Method.jsx`'s `fieldLabel`) now name the number it had before removal — `"Removed step 2, lead-in"` instead of dropping the number entirely — closing the ink-versus-announcement disagreement 03-10 closed for live steps and left open for removed ones. A step with no position in either version still names none.
- `IngredientTable.jsx`'s step selector (`StepCell`) drops the number from a removed step's option label entirely — `"Cool (removed)"`, not `"2. Cool (removed)"` — while the option stays present, disabled, and valued on the stored key, so G-03-3 S3 stays closed. The orphaned-row flag (`OrphanedRowFlag`) now names every causing step by lead-in alone, always, since every causing step is removed by construction; its now-unused `currentStepNumbers`/`baselineStepNumbers` props were dropped from its signature and call site.
- `Method.test.jsx`'s `extractStepEntries` now captures the whole class attribute (not just the literal `method-step__n"` substring the old regex assumed), so it can see the struck modifier as well as the numeral; a new `assertNoDuplicateMargins` helper asserts the union of every margin a render emits — live and removed together, as numeral+mark pairs — holds no duplicate, checked in the pen (single removal, a non-adjacent double removal at steps 1 and 5, and the last-step-removal case that never collided) and in show-changes (single removal).
- Full suite: 518/518 passing, up from 513 at plan start (+5: 3 in `Method.test.jsx`'s net count, 2 in `IngredientTable.test.jsx`'s).

## Task Commits

Each task was committed atomically (MVP mode is active, `workflow.tdd_mode: false`, consistent with this phase's precedent):

1. **Task 1: The margin says which frame answered — empty in the pen, struck in show-changes** — `eaa5335` (test)
2. **Task 2: The table stops printing a removed step's number as if it were live** — `4767da3` (feat)

**Plan metadata:** committed alongside this SUMMARY.

## Files Created/Modified
- `app/src/ui/Method.jsx` — `displayNumberFor` returns `{number, frame}`; `fieldLabel` names a removed step's number; the pen's margin suppresses a baseline-frame number, show-changes' margin marks it struck
- `app/src/styles/app.css` — new `.method-step__n--struck` modifier beside `.method-step__n`, reading `--rule-strike`, documented under the existing Strike Rule comment
- `app/src/ui/Method.test.jsx` — `extractStepEntries` rewritten to capture the class attribute and the numeral together; new `assertNoDuplicateMargins`; 5 net new tests (2 field-label, 1 already-removed field-label companion, 2 union/non-adjacent/last-step) plus rewrites of the pen-removed-number and show-changes-struck tests to assert the new (correct) behavior
- `app/src/ui/IngredientTable.jsx` — `StepCell`'s option label drops the number for a removed step; `OrphanedRowFlag` names by lead-in alone and drops its now-unused step-number props; `resolveStepNumber`'s comment records that its baseline branch has no remaining reachable caller
- `app/src/ui/IngredientTable.test.jsx` — rewrote the removed-option test to assert no number; added a no-duplicate-leading-numeral / one-number-not-two split-step test; rewrote the orphaned-flag test to assert lead-in-alone and added a two-causing-steps-joined test

## Decisions Made
- The pen suppresses a removed step's number rather than marking it (its single rule now, replacing two side-by-side treatments); show-changes marks it struck instead — per D-UAT-5 and D-UAT-4 respectively.
- The struck margin number is a new `.method-step__n--struck` modifier reading `--rule-strike`, not a reuse of `.struck-value` (which carries a right margin meant for sitting beside a replacement value — a margin number has nothing beside it).
- The selector's option and the orphaned-row flag drop a removed step's number outright rather than marking it (D-UAT-5's own flagged assumption: an `<option>` can't be reliably struck cross-browser, and a struck numeral in small print reads as a typo) — the lead-in-alone branch both already had for an unresolvable step becomes their only branch.
- `resolveStepNumber` is kept, not deleted, with a comment noting its baseline-fallback branch has no remaining reachable caller today — it stays correct for a hypothetical future site naming a step that could be either live or removed.
- `OrphanedRowFlag`'s step-number props were removed from its signature and call site rather than left unused, since every causing step it names is removed by construction and the number was the only reason it needed them.

## Deviations from Plan

None - plan executed exactly as written. All automated `<verify>` gates for both tasks passed on the first implementation pass (no fix-attempt iterations needed).

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Deferred Human Verification

Both tasks carry the same real-browser `<human-check>` in task 2's `<verify>` block, exercising task 1's and task 2's fixes together on the churned olive oil version: remove step 1 and confirm its margin is empty and the coverage cue beside it resolves to a step number that appears exactly once on the page; remove step 2 as well and confirm the same for both; open a flagged row's step selector and confirm the removed step's option shows no number and no two options share a leading numeral; save the child and press show changes to confirm the struck margins carry the parent numbers with a stroke through them, live steps read 1 to 9, and no numeral appears twice in the same form. Deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`, this phase's standing precedent (03-01, 03-06 through 03-11) and MEMORY.md. `human_judgment: true` for both coverage entries above — all automated verification (build, full suite, every plan-specified grep gate) passed.

## Next Phase Readiness
- G-03-14 is closed: a removed step's number can no longer be mistaken for the live step's beside it, in the pen (suppressed) or in show-changes (struck), and the coverage cue's "still used by step N" always resolves to exactly one unmarked N on the page.
- The identical latent defect in show-changes, and the ingredient table's selector/split-step collision, are closed with it, per D-UAT-5 and D-UAT-4.
- The pen keeps one rule for what a removed step is named by, stated once beside `StepCell`, across all three of its surfaces (margin, field labels, selector).
- The stored step key still never moves; every number still reads the derived maps 03-10 threaded; no domain module was touched (`git diff --stat -- app/src/domain/` is empty).
- This was the second gap-closure plan in this batch (after 03-11/G-03-11). With this SUMMARY written, the shared requirement IDs (REC1-03, FORM2-01) were already marked complete by earlier sibling plans in this phase (03-09, 03-10) — no further action needed on REQUIREMENTS.md.
- The task 2 `<human-check>` covering both tasks is deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`. All automated verification (`npm --prefix app test -- --run`: 518/518 pass, up from 513 at plan start; `npm --prefix app run build`: exits 0; every plan-specified grep gate) passed.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-08*

## Self-Check: PASSED
All key files confirmed present on disk: app/src/ui/Method.jsx, app/src/styles/app.css, app/src/ui/Method.test.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx, this SUMMARY. Both task commits (eaa5335, 4767da3) confirmed in `git log`. `npm --prefix app test -- --run` passes 518/518 (up from 513 at plan start, no test removed); `npm --prefix app run build` exits 0; every plan-specified grep gate for both tasks passed; `git diff --stat -- app/src/domain/` is empty, confirming no domain module was touched.
