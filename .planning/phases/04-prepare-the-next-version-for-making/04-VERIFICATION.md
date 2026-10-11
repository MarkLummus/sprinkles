---
phase: 04-prepare-the-next-version-for-making
verified: 2026-10-11T08:00:00Z
status: human_needed
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
  - "app/src/domain/sheetCode.js"
  - "app/src/domain/sheetPages.js"
  - "app/src/router.jsx"
  - "app/src/store/db.js"
  - "app/src/store/repository.js"
  - "app/src/store/transfer.js"
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
covered_digest: "v3:sha256:ea5b0484b35640b7a550f4642a8b5b3158d82aaf63c6ccd27b40dde7ad1a2ed9"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Walk the whole loop by keyboard on desktop and on the iPad (Safari, 1366 landscape, tap then Tab, Full Keyboard Access OFF, served from build + preview --host): review, Next version and save, record with a tasting and save, Correct, Print sheet then Print, a Sheet code on Search. Include the date fields' new ink ring."
    expected: "Every control reachable, focus always visible, labels visible; Tab past the last link hands focus to Safari's chrome (expected)."
    why_human: "The automated walk (04-keyboard-probe.mjs, 54 checks) ran in Playwright's WebKit, not Mobile Safari. Mark's List row check-keyboard-walk-loop (D-21 device half)."
  - test: "With VoiceOver on, focus a balance rule and then read the Balance region."
    expected: "The rule's name carries its deviation words after the target; the live region says 'Contributing to {figure}: {row names}'."
    why_human: "Spoken output cannot be asserted from the DOM; folded into check-keyboard-walk-loop."
  - test: "Print the bench sheet from iPad Safari for Olive Oil v1 (headers and footers off) and compare with sketch 010."
    expected: "Five pages: Batch log, Tasting log, formula page, table tail with steps, rest with the closing foot; groups whole, header row repeated, Sheet code in every foot."
    why_human: "WebKit's own print and Chrome's PDF match the layout (04-print-probe.mjs, all MATCH), but Playwright WebKit is not Mobile Safari's print. Rows check-ipad-pdf-bench-sheet-olive-oil, look-print-sheet-route-device, check-whole-loop-on-paper-after-phase-4."
  - test: "On the iPad: open a pen, type, close the tab or reload, return; also the 393 phone look of the print route and Search."
    expected: "Pen reopens with ink in pen blue and 'Draft kept. Cancel discards it.'; Home and the band name the waiting draft; the 393 route stacks as drawn."
    why_human: "Real-device closed-tab recovery and the 393 look. Rows p4-draft-ipad-uat, p4-05-ipad-mark-one, look-sheet-code-search-ipad."
  - test: "Confirm the three rows 04-10 handed to the orchestrator exist on Mark's List: decide-three-pens-keep-drafts, look-aug-2-draw-temp-dropped, check-keyboard-walk-loop; and that build-remove-draw-temp-data-element is closed."
    expected: "Rows present with owner mark, status open (the last one done)."
    why_human: "04-10's executor had no ArtifactData tool; the verifier also has none. Not confirmed by this report."
---

# Phase 4: Prepare the next version for making - Verification Report

**Phase Goal:** Maker can print the new version as a bench sheet, carry it to the kitchen, and match the printed sheet back to its version, with the whole develop loop operable by keyboard and recoverable.
**Verified:** 2026-10-11
**Status:** human_needed
**Re-verification:** No, initial verification

All five roadmap success criteria are backed by code and by green automated evidence. Every open item is a device-only check that Mark already holds on his list. No blocker was found. The code review's 9 warnings are real but narrow edge cases, and four of them touch must-haves (listed below as warnings).

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Formula page: each ingredient line under its step, blank As made first, planned grams, ingredient, Balance beside the table, a unit on every value | VERIFIED | `PrintSheetPages.jsx` and `sheetPages.js` lay the pages by measurement. `04-print-probe.mjs check` ran against a scratch build: ALL MATCH for the logs, screen, sheet and sweep modes, across all 19 seed versions in WebKit's print and Chrome's PDF. REQUIREMENTS PRINT-01 and ROADMAP criteria 1 and 2 were reworded to the approved sketch 010 (no % of batch, no tick box). |
| 2 | Instructions with typed targets in a tag row beside the prose; blank two-sided log (Batch log, Tasting log) | VERIFIED | `PrintLogPages.jsx` (BatchLogPage, TastingLogPage), the Method print treatment and the closing foot. The probe confirms two log pages and the Instructions placement per seed version, steps whole, closing foot once and last. Tasting log reads the version's 0 to 2 declared scales and problems (04-03). |
| 3 | Human-readable short code on the sheet; the app uses it to reach the same version; prints a saved version only, never creates a batch | VERIFIED | `sheetCode.js` (FNV-1a, Crockford, XXXX-XXXX, tag `sprinkles-sheet-code:1`). Golden vector `64JH-G408` for Olive Oil v1 pinned in `sheetCode.test.js`. My own check over the 19 seed versions: 19 unique codes, and each is found again by `findVersionsByCode` when typed lower-case without the hyphen. `SheetCodeSearch.jsx` navigates to `notebookPath`, and Home carries "Enter Sheet code". `PrintSheet.jsx` calls only `getVersion`, `getRecipe` and `listVersions` (no write). Probe isolation check: 0 requests to another host. |
| 4 | Review, edit, record, print are keyboard-operable with visible labels and focus; text contrast AA | VERIFIED (device half pending) | Shared `Button`, `Checkbox`, `Radio` place `tabIndex={0}` after the spread; the only raw `<button>` left under `app/src/ui` is the allowlisted `GraduatedRule` one. `04-keyboard-probe.mjs check`: 54 checks passed (Tab walk of Home, recipe reading, three pens, print route and Search at 1366 fine and 393 coarse, visible outline, contrast on every measured text). The iPad half is on Mark's List. |
| 5 | Entered data survives a reload mid-edit; uncertainty, estimated data and errors never by colour alone | VERIFIED | `DB_VERSION` 8 with a `drafts` store behind the repository seam (`getDraft`, `saveDraft`, `deleteDraft`, `listDrafts`); only `db.js` imports `idb`. No `beforeunload` handler (test pins it). `04-draft-probe.mjs check`: 164 checks passed with real reloads in WebKit and Chrome for the plan, record, amend and home modes. Colour: probe `colour` mode (printed pages one ink; draft notice, no-match line and mark-one off state carry words); the estimated flag is a word. |

**Score:** 5/5 truths verified (0 behavior-unverified; device checks listed below)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` | Shared controls with tab stop | VERIFIED | tabIndex after spread; scan test green |
| `app/src/domain/sheetCode.js` | Pure derivation, normalise, lookup | VERIFIED | Golden vector; no store or DOM import |
| `app/src/ui/SheetCodeSearch.jsx`, route `/search` | Code entry | VERIFIED | Wired in `router.jsx`; exact "No version has this code." |
| `app/src/ui/PrintSheet.jsx` (+ `PrintSheetPages`, `PrintLogPages`, `sheetPages.js`) | Print route and pages | VERIFIED | Route `/notebook/:recipeId/:versionId/print`; VersionRow "Print sheet" link |
| `app/src/store/db.js`, `repository.js`, `transfer.js` | Drafts store, bounded reset, `importAll` one transaction | VERIFIED | DB 8; STORE_SCHEMA_VERSION stays 7 |
| `app/src/domain/draft.js` + `RecipePage.jsx` | Draft keep for three pens | VERIFIED | Persist, restore and delete wired; "Draft kept. Cancel discards it." |
| `app/src/ui/MarkOneField.jsx`, At draw / From freezer | Record pen and reading | VERIFIED | `04-pen-probe.mjs check`: 1440 MATCH, 0 DIFF against sketch 010 boards |
| `app/src/styles/print.css` | Print layer | VERIFIED | One `@media print` block; no literal colours found by grep |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| VersionRow "Print sheet" | print route | `printPath` | WIRED |
| PrintSheet | `sheetCode()` | line and every foot | WIRED |
| Search / Home link | version page | `findVersionsByCode`, `notebookPath` | WIRED |
| RecipePage pens | drafts store | `saveDraft`, `deleteDraft`, restore effect | WIRED |
| RecipeList / RecipeBand | `listDrafts` | Draft open, Go to draft | WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Data | Source | Real data | Status |
|----------|------|--------|-----------|--------|
| PrintSheet | version, recipe, sheet code | `repository.getVersion/getRecipe/listVersions` | Yes (saved record only) | FLOWING |
| SheetCodeSearch | versions | `repository.listVersions` | Yes | FLOWING |
| Home draft lead | drafts | `repository.listDrafts` | Yes | FLOWING |

### Behavioral Spot-Checks and Probe Execution

All run against a scratch build (`--outDir` under the scratchpad, `PROBE_DIST` set; `app/dist` untouched; `git status` unchanged).

| Check | Result | Status |
|-------|--------|--------|
| `npm --prefix app test`: 77 files, 2438 tests | all pass | PASS |
| `npm --prefix app run build` (scratch outDir) | exit 0 (chunk-size warning only) | PASS |
| `04-draft-probe.mjs check` | 164 checks passed | PASS |
| `04-keyboard-probe.mjs check` | 54 checks passed | PASS |
| `04-pen-probe.mjs check` | 1440 MATCH, 0 DIFF | PASS |
| `04-print-probe.mjs check` | ALL MATCH, 0 foreign requests | PASS |
| Seed sheet codes: unique and round-trip through lookup | 19/19 | PASS |

### Requirements Coverage

| Requirement | Source plans | Status | Evidence |
|-------------|--------------|--------|----------|
| PRINT-01 | 04-06, 04-07, 04-08, 04-10 | SATISFIED | Truth 1; text amended to sketch 010 |
| PRINT-02 | 04-08, 04-10 | SATISFIED | Truth 2 (tag row, verbatim targets) |
| PRINT-03 | 04-03, 04-05, 04-06 | SATISFIED | Truth 2 (two-side blank log, declared scales and problems) |
| PRINT-04 | 04-02, 04-06, 04-08 | SATISFIED | Truth 3 (code on every foot; lookup in app) |
| PRINT-05 | 04-06 | SATISFIED | Truth 3 (read-only route, no write calls; probe and test) |
| UX1-01 | 04-01, 04-02, 04-05, 04-06, 04-09, 04-10 | SATISFIED in automation, device half pending | Truth 4 |
| UX1-02 | 04-04, 04-09 | SATISFIED | Truth 5 |
| UX1-03 | 04-02 to 04-10 | SATISFIED | Truth 5; probe `colour` mode |

All eight IDs appear in plan frontmatter and in REQUIREMENTS.md (all marked Complete, traceability rows lines 113 to 120). No orphaned requirement for Phase 4.

### Anti-Patterns Found

None blocking. No `TBD`, `FIXME` or `XXX` markers under `app/src` outside the `XXXX` code format. No `dangerouslySetInnerHTML` (one comment saying it is not used). Only `db.js` imports `idb`.

### Code Review Findings That Bear on Must-Haves (04-REVIEW.md, all still `open`, advisory)

None is critical. I read the code for WR-06 and WR-07 and confirmed both as described; the rest I did not independently reproduce.

| ID | Bears on | Assessment |
|----|----------|------------|
| WR-06 | Truth 1 (PRINT-01) | CONFIRMED in `PrintSheet.jsx:140`: the Print button is live before `sheet.pages` exists, so a press during a slow font load prints the two log pages only. The normal path is proven by the probe. WARNING. |
| WR-07 | Truth 3 (PRINT-04) | CONFIRMED in `SheetCodeSearch.jsx:34-43`: a submit before `listVersions()` resolves reads "No version has this code." for a real code; a repeat identical message is not re-announced; a malformed code reads like a missing one. WARNING. |
| WR-05 | Truth 5 (UX1-02) | A rejected `listBatchesForVersion` silently turns draft keeping off. Needs a storage failure to trigger. WARNING. |
| WR-09 | Truth 5 / D-18 | Home and the band can name a draft that will not restore after an import. WARNING. |
| WR-03, WR-04 | Truth 5 | An import can leave an open page stale (Save can revert imported records), and a restored draft can save a batch the import validator later rejects. Import-driven edge cases. WARNING. |
| WR-01, WR-02, WR-08, IN-01 to IN-05 | Not a must-have | Import validator gaps, deep-JSON throw, second-tab upgrade hang, off-state hint association, and so on. Quality items. |

Recommendation: WR-06 and WR-07 are cheap (a `disabled` guard and a loading guard) and sit on the two moments Mark touches most (pressing Print on an iPad over the LAN, typing a code from paper). Worth a `/gsd-quick` before or alongside the device checks. They do not fail a success criterion, so they are not recorded as gaps.

### Human Verification Required

See the `human_verification` list in the frontmatter. In plain terms:

1. **Keyboard walk on desktop and iPad** (D-21 device half; Mark's List `check-keyboard-walk-loop`), including the date-field ink ring.
2. **VoiceOver on a balance rule** and the "Contributing to" announcement.
3. **iPad print of Olive Oil v1** (`check-ipad-pdf-bench-sheet-olive-oil`, `look-print-sheet-route-device`, `check-whole-loop-on-paper-after-phase-4`).
4. **Closed-tab draft recovery and the 393 look** on the device (`p4-draft-ipad-uat`, `p4-05-ipad-mark-one`, `look-sheet-code-search-ipad`).
5. **List housekeeping:** 04-10 could not write its three new rows (`decide-three-pens-keep-drafts`, `look-aug-2-draw-temp-dropped`, `check-keyboard-walk-loop`) or close `build-remove-draw-temp-data-element`; it handed them to the orchestrator. I have no ArtifactData tool, so I did not confirm they exist.

### Gaps Summary

No gaps. The phase goal is achieved in code and in every automated probe I could run. The status is `human_needed` solely because iPad Safari print, the keyboard and VoiceOver walk, closed-tab recovery and the 393 look cannot be proved by Playwright and are already queued for Mark. One departure from CONTEXT is recorded for Mark's decision (D-14 says four pens keep drafts; the build keeps three, because the tasting folded into the record pen in 03.3.1 and its ink rides inside that draft).

---

_Verified: 2026-10-11_
_Verifier: Claude (gsd-verifier)_
