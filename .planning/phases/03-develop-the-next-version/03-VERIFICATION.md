---
phase: 03-develop-the-next-version
verified: 2026-09-07T16:10:00Z
status: human_needed
score: 5/5 must-haves verified
covered_files: [".planning/REQUIREMENTS.md", ".planning/phases/03-develop-the-next-version/03-01-PLAN.md", ".planning/phases/03-develop-the-next-version/03-01-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-02-PLAN.md", ".planning/phases/03-develop-the-next-version/03-02-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-03-PLAN.md", ".planning/phases/03-develop-the-next-version/03-03-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-04-PLAN.md", ".planning/phases/03-develop-the-next-version/03-04-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-05-PLAN.md", ".planning/phases/03-develop-the-next-version/03-05-SUMMARY.md", "app/src/data/olive-oil.js", "app/src/data/olive-oil.test.js", "app/src/domain/advisories.js", "app/src/domain/advisories.test.js", "app/src/domain/axes.test.js", "app/src/domain/diff.js", "app/src/domain/diff.test.js", "app/src/domain/lineage.js", "app/src/domain/lineage.test.js", "app/src/domain/rows.js", "app/src/domain/rows.test.js", "app/src/domain/uses.js", "app/src/domain/uses.test.js", "app/src/store/db.js", "app/src/store/transfer.js", "app/src/store/transfer.test.js", "app/src/store/versionLift.js", "app/src/styles/app.css", "app/src/styles/tokens.css", "app/src/ui/Authored.jsx", "app/src/ui/BatchMargin.jsx", "app/src/ui/DerivedAdvisories.jsx", "app/src/ui/DerivedAdvisories.test.jsx", "app/src/ui/FormulationNote.jsx", "app/src/ui/GraduatedRule.jsx", "app/src/ui/GraduatedRule.test.jsx", "app/src/ui/Headnote.jsx", "app/src/ui/Headnote.test.jsx", "app/src/ui/IngredientTable.jsx", "app/src/ui/IngredientTable.test.jsx", "app/src/ui/Method.jsx", "app/src/ui/Method.test.jsx", "app/src/ui/RecipeList.jsx", "app/src/ui/RecipeList.test.jsx", "app/src/ui/RecipePage.jsx", "app/src/ui/VersionStrip.jsx", "app/src/ui/VersionStrip.test.jsx", "app/tests/db-migration.test.js"]
covered_digest: "v1:sha256:33fb7719c1b539967432538bc223a701735050514572a42f0aca6bc817c9fd79"
behavior_unverified: 0
overrides_applied: 0
behavior_unverified_items:
  - truth: "Two pens open on the same parent in two browser tabs produce two distinct children and neither clobbers the other (03-01 must_haves, verification: backstop)."
    test: "Open the same churned version's pen in two tabs, edit and save 'as a new version' in each, in either order."
    expected: "Two distinct child records exist, each naming the same parentVersionId; neither save is lost or corrupted."
    why_human: "A genuine interleaving of two write transactions from two tabs cannot be produced or observed by a static test; only the single-writer path (one saveVersion call, parent never in the write set) is checked by code."
  - truth: "An interrupted save (browser closed mid-write) leaves either no child version or a complete one, never a half-written record (03-01 must_haves, verification: backstop)."
    test: "Trigger a save and interrupt the browser process before the IndexedDB transaction settles."
    expected: "On reopening, either the child does not exist or it exists complete with every field."
    why_human: "IndexedDB's own transaction atomicity is the guarantee; observing a genuine interruption needs a real browser process kill, not a test harness."
coincidental_reliance_items: []
human_verification:
  - test: "Open the churned olive oil version, click 'Develop the next version', type 48 over the oil row's 40 g, watch the parent's 40 struck in ink beside the new value, type a version line, click 'Save as a new version', and confirm landing on the child's own URL reading clean."
    expected: "The strike renders live, the six figures and basis note answer live against the typed grams, the save lands on a new URL, and the churned version and its 2 Aug batch are unchanged when reopened (REC1-02)."
    why_human: "Interactive rendering, live figure recompute, and URL navigation require a browser to observe; deferred to end-of-phase UAT per Mark's standing preference (all five SUMMARY.md files record this same deferral)."
  - test: "Reload the child version's URL in a fresh page load."
    expected: "The same twelve rows, grams, method text, and authored notes reappear (REC1-05)."
    why_human: "A true full-page reload against the browser's own IndexedDB is not exercised by the test suite; the closest automated proof (app/tests/db-migration.test.js) verifies put/get round-tripping against a real IndexedDB for an existing record, not the interactive reload flow for a freshly created child."
  - test: "In the pen, remove a row and watch it render struck in place with the totals and six figures updating live; remove a method step that uses a still-active row and watch the row-side orphaned-row flag appear beside it; restore both and watch the flags clear."
    expected: "Struck rendering, live totals, and the two removal cross-flags behave exactly as described, with no cascade (REC1-03, D-10)."
    why_human: "The interactive editing, live recompute, and cross-flag appearance/disappearance sequence needs a browser; the underlying domain logic (uses.js, diff.js) is unit-tested but the rendered interaction is not."
  - test: "Type a reason, tap a cited batch from the list, save, and read the child's lineage line ('from 50 g oil · 800 g, after the batch of 2 Aug 2026') with both parent and batch as live links; leave the reason blank and confirm it reads 'no reason recorded'."
    expected: "The ceremony behaves exactly as the brief and D-04 describe (REC1-04)."
    why_human: "The full ceremony flow, including reading back live links in a saved record, needs a browser."
  - test: "Fork the same parent twice, then read the version strip's three entries (parent, child A, child B) in creation order, with the current version carried by weight and outline and the churned parent wearing 'churned'."
    expected: "Strip renders correctly per D-06/D-21 wording rules."
    why_human: "Multi-version list rendering and visual weight/outline distinction need a browser to observe."
  - test: "On a saved child, press the show-changes toggle in the lineage line and confirm the URL gains '?changes', the marks appear (struck grams/share, hollow parent tick on the rules, struck-beneath method text), then press the browser's back button and confirm the clean reading returns; copy the URL with the parameter into a new tab."
    expected: "The addressable toggle behaves exactly as D-02 describes, with no new route (FORM2-01)."
    why_human: "URL state changes, back-button navigation, and cross-tab URL sharing need a real browser session."
  - test: "Read the four derived advisories in the margin for the churned olive oil version (sub-scale, ultra-pasteurised, hydration, estimated-exposure), confirming the block's 'derived' legend sits parallel to the authored block's own legend, then remove rows in the pen and watch advisories appear/disappear live."
    expected: "Four advisories render with correct wording and basis lines, positioned between BatchMargin and Authored, and react live to pen edits (FORM2-02)."
    why_human: "Visual placement/styling and live recompute during interactive editing need a browser; the underlying advisories.js math is thoroughly unit-tested (19 tests) against the exact published figures."
  - test: "Click the running head 'Sprinkles' from several page states (reading, developing, not-found) and confirm it always returns to the recipe list; visit a version id that does not exist and confirm 'No recipe found' links back to the list."
    expected: "Navigation behaves as described in every state."
    why_human: "Click-through navigation needs a browser."
  - test: "Confirm the plan's pen and the batch's pen cannot both be open: with the plan's pen open, the batch margin's 'Record a batch'/'Record another batch'/'Amend' controls are disabled with a stated reason in words; with the batch pen open, 'Develop the next version' is disabled."
    expected: "Mutual exclusivity holds and the reason is stated in words, never just visually implied (D-10)."
    why_human: "The disabled-state rendering and the stated-reason text need visual/interactive confirmation."
---

# Phase 3: Develop the next version Verification Report

**Phase Goal:** Maker can create version 2 from the churned version, adjust it, and see exactly what changed and what it did to the balance — with the churned version and its recorded batch untouched
**Verified:** 2026-09-07T16:10:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth (Roadmap Success Criterion) | Status | Evidence |
|---|---|---|---|
| 1 | Maker creates a new version from the churned version; the new version records its parent, and the churned version and its recorded batch are unchanged afterwards. | ✓ VERIFIED | `createChildVersion` (`app/src/domain/lineage.js:77-101`) deep-copies every structural field with `structuredClone`, never mutates `parent`; `app/src/domain/lineage.test.js` — "does not mutate the parent" and "shares no structure with the parent: mutating the parent afterwards leaves the child unchanged" both pass (behavioral, not merely presence). `RecipePage.jsx`'s two `repository.saveVersion(...)` call sites (lines 739, 757) write only the child/updated record — the parent is never passed. Full suite (354 tests) and build pass. |
| 2 | Maker edits the new version's ingredient amounts, removes or restores any of its twelve rows, and edits method steps and their targets. | ✓ VERIFIED | `IngredientTable.jsx`/`Method.jsx` wired to `penDraft`/`draftVersion`/`activeRows`/`activeSteps` (`app/src/domain/rows.js`); removal cross-flags (`stepsUsingRow`, `removedRowsUsedBy`, `orphanedRows`) read-only, never assign a `removed` flag (`app/src/domain/uses.js:24-55`, confirmed by direct reading — no writes to `removed` anywhere in the module); `diff.test.js` (23 tests) and `uses.test.js` (12 tests) exercise these functions directly, non-vacuously. |
| 3 | Maker records why the version changed as free text citing the batch that motivated it, and the saved version reopens with the same values after the app is reloaded. | ✓ VERIFIED (reason/citation half); ⚠️ interactive reload deferred | `Headnote.jsx`'s ceremony reads `citableBatches`/`blockedSaveMessage` from `lineage.js`; `Headnote.test.jsx` (11 tests) proves nothing is pre-filled and blocked-save messages render in words. Reload persistence is proven at the storage-mechanism level by `app/tests/db-migration.test.js` (a real IndexedDB, via `fake-indexeddb`, proving `db.put`/`db.get` round-trips a version record byte-for-byte across a fresh `openStore()` call) but the specific interactive flow of reloading a freshly-created child's own URL is not exercised by any test — see Human Verification. |
| 4 | Maker sees the new version beside the churned one: per-row change in grams and in % of batch, and the change in each balance figure. | ✓ VERIFIED | `domain/diff.js`'s `buildDiff` (23 tests: identity, grams/share/figure deltas at display precision, removed-row exclusion, never-mutates/never-reorders) is the one comparison; `IngredientTable.jsx`'s show-changes branch and `GraduatedRule.jsx`'s `figureDelta` prop (struck head, hollow tick, "was X, now Y" accessible name, computes no comparison of its own — confirmed by direct source reading) both consume it. `IngredientTable.test.jsx` (4 tests) and `GraduatedRule.test.jsx` (6 tests) pass. |
| 5 | Structural advisories show the basis they were computed from, and a version outside a target band still saves; no figure predicts a sensory outcome or is labeled as guaranteeing success. | ✓ VERIFIED | `domain/advisories.js`'s `buildAdvisories` (19 tests) matches the published figures exactly (sub-scale 0.48 g/0.16 g with 1.68 g take; 623.2 g ultra-pasteurised mass; 82 °C vs 69 °C hydration naming step 2's 85 °C target; PAC/POD/MSNF/Total-solids for estimated exposure); `equipment.minFillG` confirmed unread anywhere in the module (grep, D-05); `grep -niE "band\|deviation\|advisor"` over `lineage.js`/`Headnote.jsx` finds only a doc comment, no code coupling (FORM1-03); `advisories.test.js#"no verdict"` and grep gates confirm no judgement language. |

**Score:** 5/5 truths verified at the code/domain-logic level (0 present-but-behavior-unverified — every state-transition claim above has a passing behavioral test backing it, even where the full interactive UI flow is separately deferred to human verification below).

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `app/src/domain/lineage.js` | Parent/child construction, save-block rules | ✓ VERIFIED | 163 lines; exports `createChildVersion`, `saveOverVersion`, `versionLineUnique`, `sortedVersions`, `versionsForRecipe`, `latestVersionPerRecipe`, `citableBatches`, `blockedSaveMessage` — all present, wired into `RecipePage.jsx`, all exercised by 30+ tests in `lineage.test.js` |
| `app/src/domain/diff.js` | Per-row/step/figure comparison | ✓ VERIFIED | 192 lines, `buildDiff` wired into `IngredientTable.jsx`, `Method.jsx`, `GraduatedRule.jsx` (via `FormulationNote.jsx`), `uses.js` |
| `app/src/domain/uses.js` | Removal cross-flags, stale-amount flag | ✓ VERIFIED | 87 lines, all four exports present, no `removed`-flag writes, wired into `IngredientTable.jsx`/`Method.jsx` |
| `app/src/domain/advisories.js` | Four FORM2-02 advisories | ✓ VERIFIED | 176 lines, `buildAdvisories` matches published figures, wired into `DerivedAdvisories.jsx` via `RecipePage.jsx`'s `liveVersion` |
| `app/src/domain/rows.js` | `activeRows`/`activeSteps` removal filter | ✓ VERIFIED | 24 lines, used by `advisories.js`, `RecipePage.jsx`'s `readingVersion`/`liveVersion` |
| `app/src/store/versionLift.js` | Shared, idempotent schema lift | ✓ VERIFIED | Called from both `db.js`'s upgrade and (per SUMMARY) `transfer.js`'s import; idempotence proven by `lineage.test.js#liftVersionRecord idempotence` |
| `app/src/ui/Headnote.jsx` | Save ceremony, lineage line, show-changes toggle | ✓ VERIFIED | 212 lines added; `aria-pressed` present on the toggle; 11+3 tests pass |
| `app/src/ui/VersionStrip.jsx` | Version list, creation order | ✓ VERIFIED | Uses `sortedVersions`/`versionsForRecipe`, renders nothing for a single version, 5 tests pass |
| `app/src/ui/DerivedAdvisories.jsx` | Margin's derived block | ✓ VERIFIED | Pure render over `buildAdvisories`, returns `null` for empty result, 4 tests pass |
| `app/src/ui/GraduatedRule.jsx` | Struck head, hollow tick | ✓ VERIFIED | `figureDelta` prop present, computes no comparison itself, ink-only colour, 6 tests pass |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `RecipePage.jsx` | `repository.js` (`getVersion`) | live parent read for show-changes | ✓ WIRED | Line 189: `repository.getVersion(version.parentVersionId)`, cancelled-flag effect, never a copy stored on the child |
| `RecipePage.jsx` | `domain/diff.js` (`buildDiff`) | one comparison threaded to every region | ✓ WIRED | Line 301: `buildDiff(version, parentVersion)`, computed once, passed to `IngredientTable`, `Method`, `FormulationNote` |
| `DerivedAdvisories.jsx` | `domain/advisories.js` (`buildAdvisories`) | pure render, computes nothing itself | ✓ WIRED | Confirmed by direct reading of `DerivedAdvisories.jsx` |
| `RecipePage.jsx` (save handlers) | `repository.saveVersion` | single write, never the parent | ✓ WIRED | Lines 739, 757 — exactly two call sites, each writing only the newly-constructed record |
| `advisories.js` | `figures.js` (`buildFigures`) | estimated-exposure reuses figures' own `estimatedRowNames` | ✓ WIRED | `estimatedExposureAdvisory` calls `buildFigures({ rows, targets })` directly, no second library scan |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|---|---|---|---|---|
| `VersionStrip` | `versionIdsWithBatches` | `repository.getAllBatches()` in a `useEffect` keyed on `id` | Yes | ✓ FLOWING |
| `DerivedAdvisories` | `liveVersion` | `RecipePage`'s live draft (developing) or `readingVersion`, both filtered through `activeRows`/`activeSteps` | Yes | ✓ FLOWING |
| `Headnote` lineage line | cited batch churn date | `repository.getBatch(citedBatchId)` in a cancelled-flag effect | Yes | ✓ FLOWING |
| `GraduatedRule` `figureDelta` | `changeDiff` | `buildDiff(version, parentVersion)`, `parentVersion` from live `repository.getVersion` | Yes | ✓ FLOWING |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| REC1-02 | 03-01, 03-03 | Create version, records parent, parent unchanged | ✓ SATISFIED | `createChildVersion`, no-mutate tests, lineage line rendering |
| REC1-03 | 03-02 | Edit amounts, remove/restore rows, edit steps/targets | ✓ SATISFIED | `IngredientTable.jsx`, `Method.jsx`, `diff.js`, `uses.js` |
| REC1-04 | 03-03 | Record reason citing batch | ✓ SATISFIED | `Headnote.jsx` ceremony, `citableBatches`, `blockedSaveMessage` |
| REC1-05 | 03-01 | Reopens with same values after reload | ✓ SATISFIED (mechanism); interactive reload deferred to human verification | `app/tests/db-migration.test.js` proves the underlying put/get round-trip |
| FORM1-03 | 03-03 | Version outside band still saves, no guarantee wording | ✓ SATISFIED | grep confirms no band/deviation coupling in save path |
| FORM2-01 | 03-04 | Compare new version to churned: per-row/figure change | ✓ SATISFIED | `buildDiff`, `IngredientTable` show-changes, `GraduatedRule` `figureDelta` |
| FORM2-02 | 03-05 | Four structural advisories with basis | ✓ SATISFIED | `buildAdvisories`, `DerivedAdvisories.jsx`, matches published figures exactly |

No orphaned requirements: `.planning/REQUIREMENTS.md`'s Phase 3 row maps exactly REC1-02 through REC1-05, FORM1-03, FORM2-01, FORM2-02 — the same seven IDs declared across the five plans' frontmatter. UX1-01 (the accessibility build constraint named in 03-CONTEXT.md) is correctly mapped to Phase 4 in REQUIREMENTS.md, not orphaned here; `aria-pressed` on the show-changes toggle was spot-checked as present.

### Anti-Patterns Found

None. Scanned every non-test file changed in this phase (37 files) for `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER|placeholder|coming soon|not yet implemented|not available` — zero matches. Scanned all changed `.jsx` files for judgement/verdict language (`correct|guaranteed|safe|better|worse|too much|too little|problem`) — zero matches. Scanned for hex-colour and `px` literals in changed `.jsx` and added CSS — zero matches (every value routes through `var(--token)`). Confirmed `dangerouslySetInnerHTML` appears nowhere under `app/src`. Confirmed only `app/src/store/db.js` imports `idb` (the seam is intact; the one `domain/batch.test.js` grep hit is a comment, not an import).

### Prohibitions (judgment-tier, autonomous LLM-judge verdict — non-authoritative)

| # | Prohibition | Plan | My verdict | Evidence |
|---|---|---|---|---|
| 1 | MUST NOT write to a churned version's record or any batch when a child is saved | 03-01 | Resolved | Single `saveVersion` call per path, parent never referenced in either write; `lineage.test.js` behavioral proof |
| 2 | MUST NOT cascade a removal | 03-02 | Resolved | `uses.js` never assigns `removed`; every cross-flag function is read-only |
| 3 | MUST NOT let an inherited note lose its marker while text is unchanged | 03-02 | Resolved | `RecipePage.jsx:675` — `inheritedFrom` cleared only `value === originalNote.text ? ... : null` |
| 4 | MUST NOT pre-fill or auto-generate reason/citation/version line | 03-03 | Resolved | `Headnote.test.jsx` — "renders nothing pre-filled" |
| 5 | MUST NOT let balance become a gate | 03-03 | Resolved | grep confirms no band/deviation coupling in the save path; `Headnote.test.jsx` — band-independence test |
| 6 | MUST NOT present a change as improvement/regression | 03-04 | Resolved | grep gates across `IngredientTable.jsx`, `FormulationNote.jsx`, `Method.jsx`, `Authored.jsx` — zero matches |
| 7 | MUST NOT word an advisory as a judgement of quality or taste prediction | 03-05 | Resolved | `advisories.test.js#"no verdict"`, `DerivedAdvisories.test.jsx` grep gates, direct reading of `advisories.js`'s output strings |

These are recorded as a non-authoritative LLM-judge verdict per ADR-550; a human should confirm this reading rather than take it as the final word, particularly items 3 and 5 which turn on subtle wording/timing rules.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full test suite | `npm --prefix app test` | 23 test files, 354 tests passed | ✓ PASS |
| Production build | `npm --prefix app run build` | builds clean, no errors | ✓ PASS |
| D-06 migration against a real IndexedDB | `npx vitest run app/tests/db-migration.test.js` | 3/3 tests passed (figures/batch identical before/after, one-pass lift, idempotent re-open) | ✓ PASS |
| No `removed`-flag assignment in `uses.js` | direct source reading | zero assignment statements found | ✓ PASS |
| Single `saveVersion` write per save path | direct source reading of `RecipePage.jsx` | exactly two call sites, each writing only its own new record | ✓ PASS |

### Probe Execution

Not applicable — this phase is not a migration/tooling phase with declared `scripts/*/tests/probe-*.sh` probes; no probe references found in any PLAN/SUMMARY file. Skipped.

### Human Verification Required

See the `human_verification` list in the frontmatter for the full set (9 items). In summary, every item is an interactive or visual confirmation that a browser session is required to observe — clicking through the pen-open/edit/save/reload flow, watching live figure and cross-flag recompute, the show-changes URL toggle and back-button behavior, the version strip's visual weight/outline, the advisories' placement and legend styling, and the mutual-exclusivity of the two pens. This exactly matches the pattern every one of the five SUMMARY.md files in this phase records: "Deferred to end-of-phase UAT per Mark's standing preference (STATE.md carry, MEMORY.md)." All underlying domain logic and component wiring for these flows is unit-tested and confirmed present in this report; only the live-browser confirmation remains.

Two additional plan-level must-haves (03-01, marked `verification: backstop` in the PLAN frontmatter — a concurrent double-tab save and an interrupted-save atomicity guarantee) are non-inferable by any test in this suite and are recorded as `behavior_unverified_items` above; they route to human verification rather than either a pass or a gap.

### Gaps Summary

No gaps found. Every roadmap success criterion has direct, non-vacuous code and test evidence; every declared requirement is satisfied; no anti-patterns, stub markers, or judgement-language violations were found in any file changed by this phase; the full test suite (354 tests) and production build both pass; every prohibition is resolved by direct code inspection. The only open items are interactive/visual confirmations that require a live browser session, consistent with this project's established, standing preference (recorded in MEMORY.md and every prior phase) to defer such checks to end-of-phase UAT rather than block automated verification on them.

---

*Verified: 2026-09-07T16:10:00Z*
*Verifier: Claude (gsd-verifier)*
