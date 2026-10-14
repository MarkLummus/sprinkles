---
milestone: v1
audited: 2026-10-14T02:07:16.000Z
status: tech_debt
scores:
  requirements: 23/23
  phases: 14/14
  integration: 9/9
  flows: 4/4
gaps:
  requirements: []
  integration: []
  flows: []
tech_debt:
  - phase: 02-record-the-first-batch
    items:
      - "Deferred to end-of-phase UAT: new-batch door and unknown-address wording, cancel door, struck-step label (closed by the UAT that followed)"
  - phase: 03.2-the-portion-and-the-reset
    items:
      - "WR-01 subScaleAdvisory judges a row's total, not each portion (domain/advisories.js); unexercised by seed data"
      - "WR-02 import validator does not cross-check as-made length against portion count (store/transfer.js validateBatch); reachable only through a hand-edited file"
      - "WR-03 unguarded read past a shorter draft array (ui/IngredientTable.jsx:450); only matters if WR-02 lets a misaligned array in"
  - phase: 03.5-separate-the-recipe-from-the-sheet
    items:
      - "Deferred (Mark, 2026-09-29): G-03.5-2b Show changes omits steps and rows a version dropped, and marks no added step. Needs an Impeccable drawing, then a follow-up plan; no roadmap phase claims it"
      - "03.5 probes are stale against decisions 34, 41 and 46 (32 and 2 FAIL lines, none an app defect); cannot be used as a green gate until retargeted"
      - "Code review WR-01, WR-02, IN-01 to IN-04 open"
  - phase: 03.6-per-step-shared-ingredients
    items:
      - "WR-01 to WR-04 and IN-01 were listed open here from a stale disposition file; all fixed (39ee7cb, 50f91bc, f2d6b4d, fb06388; see 03.6-REVIEW-DISPOSITION.md, corrected 2026-10-14)"
      - "IN-02 open: lines[].removedChanged has no reader, and the % of batch cell for a line out in both versions prints a struck share of a batch that never held it"
      - "1600 fine-pointer look never drawn or looked at (deferred by Mark, 2026-10-06)"
      - "Amend .impeccable/surfaces/route-recipe-version.md for per-line and per-step removal (Mark's /impeccable job; row run-impeccable-surface-removal)"
  - phase: 04-prepare-the-next-version-for-making
    items:
      - "Code review WR-01, WR-02, WR-03 and IN-01 to IN-05 open by decision (import-validator and import-overwrite edge cases)"
  - phase: cross-phase (integration check)
    items:
      - "W1 four of five rail places (Recipe book, Idea log, Ingredients, Kitchen) and /notebook are Placeholder screens; Home's empty state links to two of them"
      - "W2 repository.importAll replaces recipes, versions and batches in one transaction but leaves drafts; draftMatchesVersion removes a mismatched draft on load, so contained"
      - "W3 draft save and delete failures are swallowed (.catch(() => {})); a failed autosave gives no warning"
      - "domain/uses.js stepsUsingRow is exported with no consumer outside its file; data/seed-recipes.js header comment contradicts itself"
      - "03.3.1.1 CONFORMANCE.md carries two leftover sections from its first pass"
nyquist: not scanned (validate-phase step hook not active)
---

# Milestone v1 Audit

**Milestone:** Mark can develop and prepare the next version of the olive oil recipe inside Sprinkles (D14).
**Result:** No blockers. All 23 requirements are satisfied and wired. The debt below is carried, not blocking.
**Scope:** Phases 1 to 4 and the 10 inserted phases (14 phases, 120 plans). Phase 5 (Version evolution) is unstarted, has no requirements, and is outside this audit.

## Requirements (23/23)

The 3-source cross-reference found every REQ-ID satisfied: each is `passed` in a phase VERIFICATION.md, listed in a SUMMARY `requirements-completed` frontmatter, and checked Complete in the REQUIREMENTS.md traceability table. No orphans.

| Group | REQ-IDs | Phase | Status |
|---|---|---|---|
| Read the recipe | REC1-01 | 1 | satisfied |
| Figures | FORM1-01, FORM1-02 | 1 | satisfied |
| Develop v2 | REC1-02..05, FORM1-03, FORM2-01, FORM2-02 | 3 | satisfied |
| Record the batch | BATCH1-01, BATCH1-02, BATCH2-01, BATCH2-02, OBS1-01 | 2 | satisfied |
| Print and match back | PRINT-01..05 | 4 | satisfied |
| Whole-loop UX | UX1-01..03 | 4 | satisfied (see W1) |

## Phases (14/14)

All 14 phase VERIFICATION.md files read `passed`. Phase 03.1 passed with 3 recorded overrides accepted by Mark on 2026-09-09. Phase 05 has no VERIFICATION.md because it has not started.

## Integration (9/9) and flows (4/4)

The integration checker found no broken wiring and no broken flow. Verified by running: `npm --prefix app test`, 79 files and 2525 tests, all passing. Everything else was verified by reading and grep. The flows were traced in code and not walked in a browser, though Mark's iPad and iPhone passes in Phase 4 UAT cover the same loop.

| Link | Status |
|---|---|
| Repository seam is the only path to IndexedDB (`idb` imported only by `store/db.js`) | wired |
| Import/export through the repository | wired |
| Domain purity | wired |
| Batch snapshot vs version rows (`structuredClone`; `createChildVersion` copies rows, method, authored) | wired |
| Seed (recipes and batches, versions last) | wired |
| Print route | wired |
| Sheet code print and Find | wired |
| Draft recovery | wired |
| Routes | wired |

Flows: seed, read v1, record batch; Next version, edit, save; print, then Find returns the same version; draft recovery after closing the tab. No orphaned exports; `splitStep` is gone cleanly.

## What the debt means for scope

Nothing above blocks the milestone's goal. The items that bear on the rebaseline are:

- **Placeholder rail places (W1)** are the largest visible gap against "navigation", and are the natural content of later work (Recipe book, Idea log, Ingredients, Kitchen).
- **Show changes omitting dropped steps and rows (G-03.5-2b)** is the only deferred feature that touches version evolution, and so Phase 5.
- **Open code-review items** are import edge cases and quality notes. They cluster around `store/transfer.js`, which the storage-upgrade todo also covers.
- **Stale 03.5 probes** cannot serve as a green gate until retargeted.
