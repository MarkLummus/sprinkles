---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 15
subsystem: ui
tags: [shell, more, phone, import, export, board-check, webkit]
requires:
  - phase: 12-08
    provides: the 12-board-check.mjs engine and the sketch 016 contract
  - phase: 12-09
    provides: the Notebook, Home and desk-page phone entry points (same PHONE-01 requirement)
provides:
  - More, open below 724, lists Ingredients, Kitchen, the hairline and Search, with no Import and no Export
  - 12-board-more.mjs, the More panel of sketch 016 held against the build in WebKit at 393 and 723
affects: [12-14, 12-16]
tech-stack:
  added: []
  patterns:
    - "dead controls are removed, not gated: the tab row and More render at every width and show only below 724"
key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-more.mjs
  modified:
    - app/src/ui/Shell.jsx
    - app/src/ui/Shell.test.jsx
    - app/src/ui/Shell.importGuard.test.jsx
    - app/src/ui/Shell.creationGuard.test.jsx
    - app/src/ui/Shell.flyout.test.jsx
    - app/src/styles/shell.css
key-decisions:
  - "More's Import and Export are deleted from Shell.jsx outright; the header's Import, Export, chooseImportFile, handleExport and the one hidden file input are untouched"
  - "The below-724 focus fallback in closeImportErrors (More's summary) and shell.css's below-724 .shell__import-errors rules stay: a panel opened by the header's Import from 724 up can still show after the window narrows"
status: complete
actuals:
  tokens: 14000
  tasks: 2
  commits: 2
plan_head_before: 875ef703710c1a01136029f37b0f69a2a407a7c4
plan_head_after: 08bbe646efa876def6ef94703f245f21ce43ca95
completed: 2026-11-22
---

# Phase 12 Plan 15: More without Import and Export Summary

**More, open at phone width, lists Ingredients, Kitchen, the hairline and Search only; the header's Import and Export are unchanged, and the one reachable narrow Import path (the error panel's focus fallback to More's summary) is kept, pinned and documented.**

All results are Playwright WebKit on a Mac or jsdom: device-unverified.

## What was built

- **Shell.jsx**: More's list lost its Import and Export `<li>`s. Comments that described More's copies were corrected: the hairline comment, the comment above `chooseImportFile` ("The header's Import opens the one hidden file input"), the tab-row comment (More is Ingredients, Kitchen and Search; one input belongs to the header's Import) and the `closeImportErrors` comment (opener is the header's Import; below 724, where that control is not drawn, focus goes to More's summary).
- **Pins changed**, all caused by the removal:
  - `Shell.test.jsx`: the More case now asserts Ingredients, Kitchen, Search present and Import, Export absent (PHONE-01); the order case reads Ingredients, Kitchen, the separator, Search; the stop count is 17 (name "3 More items"); the case name at 155 drops "and More"; the hairline describe's name drops "Import, Export".
  - `Shell.importGuard.test.jsx`: "Next version pen: More's Import is refused the same way" deleted; `moreImport` helper and the header comment's mention of More removed.
  - `Shell.creationGuard.test.jsx`: "More's Import is refused the same way" deleted; the More halves of the empty-store case and the Home edit-draft case removed (header halves stay); `moreImport` helper gone.
  - The header's Import cases still prove the shared `chooseImportFile` refusal path.
- **Shell.flyout.test.jsx**: two new cases. At 393 More's items read Ingredients, Kitchen, (hairline), Search with no button and no "Import"/"Export" text, then at 1024 the header's tools are Import and Export. The wide-to-narrow crossing: an error panel opened at 1024, width set to 393, Close focused and pressed, focus lands on More's summary. The existing 393 panel cases are unchanged.
- **shell.css**: comment above `.shell__tools > .shell__place` only (words). No rule or value changed.
- **12-board-more.mjs**: panel `more` of `notebook-home-more-393.html`, label `more-more`, route `/notebook`, anchor `.shell__tabs`, steps press `.shell__more summary`; checks `.shell__tabs > *` (count, box), `.shell__more li` (count, text, box), `.shell__more-sep` (count, box), `.shell__more button` declared absent, overflow at 393, `extraWidths: [723]`.

## Verification

- `npx vitest run` (whole): 134 files, 4440 tests, all passing (baseline 134 / 4440: two cases added, two deleted).
- Board: `12-board-check.mjs 12-board-more.mjs --selftest` on a scratch build: 21 PASS, 0 FAIL, including `PASS selftest more-more` (the 1 px font run produced a FAIL, so the check can fail), `overflow` at 393 and `overflow at 723`.
- Walk: `11-walk-check.sh` prints `MATCH 94 snapshots` (the NEW scenarios listed on the same line are the later phase plans' own).
- Acceptance greps: one `<ImportIcon />` and one `<ExportIcon />` outside comments (the header's); one `onClick={chooseImportFile}`; one `(below724 ? moreSummaryRef : importRef)`; `Both Import buttons`, `More's Import opens` and `all three are duplicated inside More` each 0; `toHaveLength(17)` present; `moreImport()` 0 in both guard files; `PHONE-01` in Shell.flyout.test.jsx.

## Deviations from Plan

### Notes on the plan's gates

**1. [Gate heuristic] shell.css comment-only gate counts continuation lines of a block comment**
- The Task 2 gate (`grep -E '^[+-][^+-]' | grep -vE '^[+-]\s*(/\*|\*)' | grep -c .` prints 0) prints 5 here, because it only recognises comment lines that start with `/*` or `*`, and this file's comments continue on plain lines. The whole shell.css diff is one three-line comment replaced by another three-line comment (verified by reading the diff); no rule or value changed. Intent met, literal count not.

**2. [Ordering] The `closeImportErrors` comment change landed in the Task 1 commit**
- Task 2 assigns that comment to Task 2, but it is in the same file as Task 1's comment corrections and the hunks sit in one working copy; it is committed with Task 1 (bfa11ad5). Task 2's commit holds the flyout cases and the shell.css comment.

No other deviations. Rules 1-3 did not fire.

## Left to the orchestrator (executors have no ArtifactData)

- Mark's List `todo-phone-hide-entry-points` closes when 12-09, 12-10, 12-15 and 12-16 have all landed.
- PHONE-01 is shared with 12-10 and 12-16: not marked complete in REQUIREMENTS.md; STATE.md and ROADMAP.md untouched.
- Deploy: no store shape, DB_VERSION or store-file-version change; main is safe to deploy once 12-09, 12-10 and 12-16 have also landed.
- 12-14 runs `12-board-more.mjs` in 12-check.sh round two's board step.

## Known Stubs

None.

## Threat Flags

None. T-12-49 (header Import and refusal guards intact: `onClick={chooseImportFile}` once, every header guard case kept) and T-12-50 (narrow focus fallback kept and pinned by the wide-to-narrow case) are mitigated.

## Commits

- bfa11ad5: feat(12-15): More leaves Import and Export to the desk and the iPad
- 08bbe646: test(12-15): More at phone width holds no Import or Export, and the kept narrow error-panel path is pinned

## Self-Check: PASSED

Files found: Shell.jsx, Shell.test.jsx, Shell.importGuard.test.jsx, Shell.creationGuard.test.jsx, Shell.flyout.test.jsx, shell.css, 12-board-more.mjs. Commits bfa11ad5 and 08bbe646 are ancestors of HEAD.
