---
phase: quick-260921-gss
plan: 01
quick_id: 260921-gss
status: complete
tags: [docs, design-system]
dependency-graph:
  requires: []
  provides: [D-01, D-02]
  affects: [DESIGN.md]
key-files:
  created: []
  modified:
    - DESIGN.md
decisions:
  - "D-01: named the two visual contexts Sheet and App in DESIGN.md's Overview, prefixed all four Sheet colour tokens (sheet-ground/sheet-ink/sheet-pen-blue/sheet-bookcloth) and their 26 interpolations, renamed every context-naming use of the word paper to Sheet (8 material uses of paper kept), and recorded that tokens.css still declares the roles unprefixed pending a code rename."
  - "D-02: recorded five tentatively-approved-2026-09-21 text companions for the App accents (Notebook, Recipe Book, Idea log, Ingredients, App blue) in frontmatter and the App palette table, stated the companion rule, the Kitchen exemption, and the Notebook/Idea log caveats in words, and replaced 'darker text companions' in Still unresolved with a sentence naming the companions as pending Mark's confirmation."
metrics:
  duration: ~15min
  completed: 2026-09-21
---

# Phase quick-260921-gss Plan 01: Amend DESIGN.md — Sheet/App context prefix and text companions Summary

Renamed DESIGN.md's four implemented colour tokens and every context-naming use of "paper" to the Sheet/App vocabulary Mark settled on 2026-09-21, and added five tentatively-approved text companions for the App accent colours.

## What Was Built

**Task 1 (D-01):** Renamed the frontmatter colour keys `ground`, `ink`, `pen-blue`, `bookcloth` to `sheet-ground`, `sheet-ink`, `sheet-pen-blue`, `sheet-bookcloth` (values unchanged), repointed all 26 `{colors.*}` interpolations to their `sheet-` form (the 12 `{colors.app-*}` references were untouched), added a new "The two contexts are named" paragraph to the Overview naming Sheet and App and the prefix convention, renamed every context-naming use of "paper" to Sheet across the document (the 8 material uses of the word — e.g. "Text Paper", "paper and pen treatment" — were left as-is), renamed the Paper-Is-Flat rule to the Sheet-Is-Flat rule, and added a paragraph to the Colors scope section recording that `app/src/styles/tokens.css` still declares the roles unprefixed and that the typography/spacing roles are Sheet roles too.

**Task 2 (D-02):** Added five `app-*-text` companion keys to frontmatter directly after their accent (`app-notebook-text`, `app-recipe-book-text`, `app-idea-log-text`, `app-ingredients-text`, `app-blue-text`), added five corresponding rows to the App palette table (each beneath its accent, carrying its contrast ratio and "tentatively approved 2026-09-21"), added a companion rule paragraph stating the 4.5:1 darkening rule, the Kitchen exemption, and the Notebook (pure red, No-Verdict Rule caveat) and Idea log (reads as olive, not yellow) caveats, and replaced "darker text companions" in the Still unresolved list with a closing sentence naming the five companions as tentative and pending Mark's confirmation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Plan inconsistency] Companion rule paragraph stated the Kitchen exemption and text fallback in words instead of literal `{colors.app-kitchen}`/`{colors.app-text}` token syntax**
- **Found during:** Task 2, action (c)
- **Issue:** The plan's action text for the companion rule paragraph included the literal tokens `` `{colors.app-kitchen}` `` and `` `{colors.app-text}` ``. Writing them verbatim would add two extra `{colors.app-*}` interpolations beyond the table's 17 (12 existing + 5 new companions), because both tokens already appear once in the App palette table. That directly conflicts with the plan's own verify gate, which requires the total `{colors.app-[a-z-]*}` count to equal exactly 17, and with the plan's own fact stating "the 12 existing `{colors.app-*}` references... must not be touched; only the five new `-text` references are added." It also matches the plan's `must_haves.truths` wording that the Kitchen exemption is to be "stated in words," not necessarily via token syntax.
- **Fix:** Wrote "Kitchen needs no companion: it already reads 5.88:1" and "Either may fall back to the app's primary text colour" in plain prose, with no `{colors.*}` token markup, preserving the same factual content (the 5.88:1 ratio and the fallback) the plan asked for.
- **Files modified:** DESIGN.md
- **Commit:** 68a450a

## Verification

Both tasks' automated `<verify>` gates were run and passed:
- Task 1 gate: PASS (4 renamed frontmatter keys at unchanged values, 0 unprefixed leftovers, 26 `sheet-` interpolations, 12 `app-*` interpolations untouched at that point, exactly 8 material `paper` occurrences remaining, no `Paper-Is-Flat`, `Sheet-Is-Flat Rule` present, `The two contexts are named` present, pending tokens.css rename recorded, em-dash count unchanged at ≤51).
- Task 2 gate: PASS (5 companion keys at stated values directly after their accents, 5 `-text` interpolations, 17 total `{colors.app-*}` interpolations, ≥6 "tentatively approved 2026-09-21" occurrences, `darker text companions` absent, `5.88:1` present, `No-Verdict Rule` occurring exactly twice, "wait on Mark" present, 8 material `paper` occurrences unchanged).
- Task 1's gate was re-run after Task 2 to confirm the second edit did not disturb the first: PASS.
- `git diff --numstat -- DESIGN.md` confirms DESIGN.md is the only file this plan touched (13 insertions, 1 deletion after Task 1; 13 insertions, 1 deletion after Task 2). The working tree's pre-existing unrelated changes to `.planning/HANDOFF.json` and `.planning/STATE.md` were left untouched and unstaged, per the execution constraints.
- No file under `app/` was touched; no build or test run was required.

## Self-Check: PASSED

- FOUND: DESIGN.md (exists, modified as described)
- FOUND: d4855c6 (git log --oneline --all confirms)
- FOUND: 68a450a (git log --oneline --all confirms)

## Known Stubs

None.

## Threat Flags

None. This plan only edited one documentation file at the repo root; no new network surface, auth path, file access pattern, or schema change was introduced.
