---
phase: 04-prepare-the-next-version-for-making
verified: 2026-10-13T04:30:00Z
status: passed
score: 5/5 must-haves verified
covered_files:
  - ".planning/phases/04-prepare-the-next-version-for-making/04-01-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-01-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-02-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-02-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-03-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-03-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-04-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-04-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-05-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-05-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-06-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-06-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-07-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-07-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-08-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-08-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-09-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-09-SUMMARY.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-10-PLAN.md"
  - ".planning/phases/04-prepare-the-next-version-for-making/04-10-SUMMARY.md"
  - "app/src/domain/draft.js"
  - "app/src/domain/lineage.js"
  - "app/src/domain/sheetCode.js"
  - "app/src/domain/sheetPages.js"
  - "app/src/main.jsx"
  - "app/src/router.jsx"
  - "app/src/store/db.js"
  - "app/src/store/repository.js"
  - "app/src/store/transfer.js"
  - "app/src/styles/home.css"
  - "app/src/styles/notebook.css"
  - "app/src/styles/print.css"
  - "app/src/ui/Button.jsx"
  - "app/src/ui/GraduatedRule.jsx"
  - "app/src/ui/MarkOneField.jsx"
  - "app/src/ui/Method.jsx"
  - "app/src/ui/PrintLogPages.jsx"
  - "app/src/ui/PrintSheet.jsx"
  - "app/src/ui/PrintSheetPages.jsx"
  - "app/src/ui/RecipeList.jsx"
  - "app/src/ui/RecipePage.jsx"
  - "app/src/ui/SheetCodeSearch.jsx"
  - "app/src/ui/Shell.jsx"
covered_digest: "v3:sha256:854bb76f906fdb79d602125d79137b3966310457c6d7f20fa320a39b6a1bc2cc"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/5
  gaps_closed: []
  gaps_remaining: []
  regressions: []
---

# Phase 4: Prepare the next version for making - Verification Report

**Phase Goal:** Maker can print the new version as a bench sheet, carry it to the kitchen, and match the printed sheet back to its version, with the whole develop loop operable by keyboard and recoverable.
**Verified:** 2026-10-13
**Status:** passed
**Re-verification:** Yes. The 2026-10-11 report was `human_needed` and went stale when covered source files changed. This report regenerates it: the automated checks were re-run against current code, and each human item was matched to `04-UAT.md`.

The automated must-haves still hold on the current code, and every human verification item in the previous report is covered by a passing UAT result. No blocker was found.

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Formula page: each ingredient line under its step, blank As made first, planned grams, ingredient, Balance beside the table, a unit on every value | VERIFIED | `PrintSheetPages.jsx` and `sheetPages.js` lay the pages by measurement. `04-print-probe.mjs check` re-run on a fresh build: ALL MATCH (WebKit print and Chrome PDF, 0 foreign requests). UAT 3: Mark printed Olive Oil v1 from iPad Safari on paper, five pages, groups whole, header row repeated. |
| 2 | Instructions with typed targets in a tag row beside the prose; blank two-sided log (Batch log, Tasting log) | VERIFIED | `PrintLogPages.jsx`, the Method print treatment and the closing foot. The same probe confirms two log pages, Instructions placement, steps whole, closing foot once and last. UAT 3 confirms on paper. |
| 3 | Human-readable short code on the sheet; the app uses it to reach the same version; prints a saved version only, never creates a batch | VERIFIED | `sheetCode.js` (golden vector `64JH-G408` for Olive Oil v1). Re-run over the 19 seed versions: 19 unique codes, 19 of 19 found again by `findVersionsByCode` when typed lower-case without the hyphen. `codeProblem` is new since the last report and sits beside `normaliseCode` through one shared `codeSymbols` reader, so the two cannot disagree on a count. `PrintSheet.jsx` calls only `getVersion`, `getRecipe` and `listVersions`; no write call. UAT 3: Sheet code Find landed on the version. |
| 4 | Review, edit, record, print are keyboard-operable with visible labels and focus; text contrast AA | VERIFIED | `04-keyboard-probe.mjs check` re-run: 54 checks passed (Tab walks of Home, recipe reading, three pens, print route and Search at 1366 fine and 393 coarse). The device half is UAT 1 (iPad, tap then Tab, every stop shows a ring; two square rings were found and fixed in fca5b26) and UAT 2 (VoiceOver). |
| 5 | Entered data survives a reload mid-edit; uncertainty, estimated data and errors never by colour alone | VERIFIED | `04-draft-probe.mjs check` re-run: 164 checks passed with real reloads (plan, record, amend, home). `idb` is imported by `db.js` only. UAT 3 and 4 on the iPad: reload and closed-tab recovery kept the ink and said "Draft kept. Cancel discards it." |

**Score:** 5/5 truths verified (0 behavior-unverified)

### Changes Since the 2026-10-11 Report (all read, all backed by tests)

| Change | Where | Check |
|--------|-------|-------|
| Search by Sheet code names why a code is wrong | `sheetCode.js` `codeProblem`, `SheetCodeSearch.jsx` | `sheetCode.test.js` and `SheetCodeSearch.test.jsx` pass; `codeProblem` and `normaliseCode` share `codeSymbols` |
| Home's Next version link opens the pen in one tap | `RecipeList.jsx`, `RecipeList.nextVersion.test.jsx` | passes |
| Print button disabled until pages are laid (WR-06); route key carries `storeRevision` | `PrintSheet.jsx` | read in the diff; `PrintSheet.test.jsx` passes |
| `createChildVersion` keeps `declaredFlaws` | `lineage.js:140`; `lineage.test.js:263-269` | child `declaredFlaws` equals `['Bitter']`; the empty-list case is pinned too |
| Review fixes WR-04, 05, 06, 07, 08, 09 | `draft.js`, `db.js`, `RecipePage.jsx`, `Shell.jsx`, `SheetCodeSearch.jsx` | covered by the new tests; the build and all four probes pass on the result |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` | Shared controls with tab stop | VERIFIED | `tabindex-scan.test.js` is in the green suite |
| `app/src/domain/sheetCode.js` | Pure derivation, normalise, lookup, problem | VERIFIED | No store or DOM import |
| `app/src/ui/SheetCodeSearch.jsx`, route `/search` | Code entry | VERIFIED | Wired in `router.jsx` |
| `app/src/ui/PrintSheet.jsx` with `PrintSheetPages`, `PrintLogPages`, `sheetPages.js` | Print route and pages | VERIFIED | Route `/notebook/:recipeId/:versionId/print` |
| `app/src/store/db.js`, `repository.js`, `transfer.js` | Drafts store, bounded reset, `importAll` in one transaction | VERIFIED | `db.test.js` and `repository.test.js` pass |
| `app/src/domain/draft.js` with `RecipePage.jsx` | Draft keeping for three pens | VERIFIED | Draft probe 164 checks |
| `app/src/ui/MarkOneField.jsx` | Record pen and reading | VERIFIED | Pen probe: 1440 MATCH, 0 DIFF |
| `app/src/styles/print.css` | Print layer | VERIFIED | Print probe ALL MATCH |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| VersionRow "Print sheet" | print route | `printPath` | WIRED |
| PrintSheet | `sheetCode()` | line and every foot | WIRED |
| Search and Home link | version page | `findVersionsByCode`, `notebookPath` | WIRED (UAT 3 and 4 landed on the version) |
| RecipePage pens | drafts store | `saveDraft`, `deleteDraft`, restore effect | WIRED |
| RecipeList and band | `listDrafts` | Draft open, Go to draft | WIRED (UAT 4) |

### Behavioral Spot-Checks and Probe Execution

Run against a scratch build (`--outDir` under the scratchpad, `PROBE_DIST` set). `app/dist` untouched, `git status` shows only the pre-existing `.planning/state.json` change.

| Check | Result | Status |
|-------|--------|--------|
| `npm --prefix app test` | 79 files, 2525 of 2525 | PASS |
| `npm --prefix app run build` (scratch outDir) | exit 0, chunk-size warning only | PASS |
| `04-draft-probe.mjs check` | 164 checks passed | PASS |
| `04-keyboard-probe.mjs check` | 54 checks passed | PASS |
| `04-pen-probe.mjs check` | 1440 MATCH, 0 DIFF | PASS |
| `04-print-probe.mjs check` | ALL MATCH, 0 foreign requests | PASS |
| Seed sheet codes unique and round-trip | 19 of 19 | PASS |

### Requirements Coverage

| Requirement | Source plans | Status | Evidence |
|-------------|--------------|--------|----------|
| PRINT-01 | 04-06, 04-07, 04-08, 04-10 | SATISFIED | Truth 1 |
| PRINT-02 | 04-08, 04-10 | SATISFIED | Truth 2 |
| PRINT-03 | 04-03, 04-05, 04-06 | SATISFIED | Truth 2 |
| PRINT-04 | 04-02, 04-06, 04-08 | SATISFIED | Truth 3 |
| PRINT-05 | 04-06 | SATISFIED | Truth 3 (no write call on the print route) |
| UX1-01 | 04-01, 04-02, 04-05, 04-06, 04-09, 04-10 | SATISFIED | Truth 4, device half passed (UAT 1, 2) |
| UX1-02 | 04-04, 04-09 | SATISFIED | Truth 5 |
| UX1-03 | 04-02 to 04-10 | SATISFIED | Truths 4 and 5; probe colour mode |

All eight IDs appear in plan frontmatter and in REQUIREMENTS.md (all marked Complete, lines 113 to 120). No orphaned requirement for Phase 4.

### Anti-Patterns Found

None blocking. No `TBD`, `FIXME` or `XXX` markers under `app/src` outside the `XXXX` code format. The only `dangerouslySetInnerHTML` hit is a comment saying it is not used. Only `db.js` imports `idb`.

### Code Review (04-REVIEW.md, disposition in 04-REVIEW-DISPOSITION.md, not redone)

WR-04, 05, 06, 07, 08 and 09 are fixed (WR-06 and WR-07 re-read in the code above). WR-01, WR-02 and WR-03 and IN-01 to IN-05 remain open by the orchestrator's decision. They are import-validator and import-overwrite edge cases and quality items, not must-haves, so they are not gaps.

### Human Verification (previous report's five items against 04-UAT.md)

| Previous item | UAT result |
|---------------|------------|
| Keyboard walk of the loop on desktop and iPad, including the date ink ring | UAT 1 pass (Mark, iPad, 2026-10-12; the churn date field shows its ring) |
| VoiceOver on a balance rule and the Balance region | UAT 2 pass (Mark, iPad VoiceOver, 2026-10-12) |
| iPad Safari print of Olive Oil v1 against sketch 010 | UAT 3 pass (Mark, iPad, 2026-10-13, five pages on paper, whole loop) |
| Closed-tab draft recovery and the 393 look | UAT 4 pass (Mark, iPad and iPhone, 2026-10-13) |
| The three rows 04-10 handed over exist on Mark's List and the fourth is closed | UAT 5 pass (orchestrator read the list) |

`04-UAT.md`: status complete, 5 total, 5 passed, 0 issues, 0 pending.

### Notes for the Orchestrator

1. **MVP mode tag.** ROADMAP.md marks Phase 4 `mode: mvp`, but its goal is not in "As a ..., I want to ..., so that ..." form (`user-story.validate` returns `valid: false`). The MVP guard says to ask for `/gsd-mvp-phase` to set a proper goal. I did not refuse: the report asks only for a regeneration, and the previous report used the standard goal-backward method. I did the same, so there is no User Flow Coverage table. If the MVP tag matters, the goal wording needs fixing in the roadmap.
2. **Decided, not a verification item.** The build keeps drafts for three pens where CONTEXT D-14 first said four (the tasting folded into the record pen). Mark decided three on 2026-10-11 (Mark's List row `decide-three-pens-keep-drafts`, closed) and D-14 in `04-CONTEXT.md` is amended to three. It does not fail a success criterion.

### Gaps Summary

No gaps. The phase goal is achieved in code, in every automated probe re-run today, and on Mark's iPad and iPhone.

---

_Verified: 2026-10-13_
_Verifier: Claude (gsd-verifier)_
