---
phase: 8
reviewers: [codex]
reviewed_at: 2026-10-17T13:26:25.000Z
plans_reviewed: [08-01-PLAN.md, 08-02-PLAN.md, 08-03-PLAN.md, 08-04-PLAN.md, 08-05-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
model_sources:
  codex: "banner"
---

# Cross-AI Plan Review — Phase 8

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

## Codex Review

## 08-01

**Summary:** A strong foundation: establish the baseline before changing application code, characterize uncovered behavior, and use the smallest extraction to establish the verification pattern. The Playwright recovery mechanism needs correction.

**Strengths**

- The Save-over test targets a real restore dependency: saving calls `setVersion(updated)`, while restoration depends on `version`. Removing the started-ref guard can therefore cause another draft read. See [app/src/ui/RecipePage.jsx:1539](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:1539) and [app/src/ui/RecipePage.jsx:551](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:551).
- Keeping `walk: '05'` is necessary: comparison explicitly checks that metadata before comparing snapshots. See [05-walk.mjs:841](/Users/mark/Documents/projects/sprinkles/.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs:841).
- The announcer is a coherent extraction: three channels use the same guarded timeout mechanism, with no repository dependency. See [app/src/ui/RecipePage.jsx:886](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:886).

**Concerns**

- **MEDIUM — `PLAYWRIGHT_CORE` does not repair the complete dependency chain.** The proposed override changes the walk’s import, but the imported harness still statically imports the original absolute cache path. If that cache disappears, supplying a valid alternative path still fails during harness loading. See [03.5-probe-harness.mjs:12](/Users/mark/Documents/projects/sprinkles/.planning/milestones/v1-phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs:12).
- **LOW — Fixture assertions are weaker than their stated purpose.** Checking only that `jobProblems` returns a nonempty array does not prove the intended check detected each mutation. Another check could produce the failure. See [08-01-PLAN.md:298](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-01-PLAN.md:298).

**Suggestions**

- Make Playwright resolution consistent across both modules, or extract the server-only harness code so it has no Playwright dependency. Verify the override with the original cache path unavailable.
- Assert the specific expected problem for each broken fixture.

**Risk assessment: MEDIUM.** The extraction is small; the main risk is blocking the phase’s mandatory verification when the cached dependency moves.

## 08-02

**Summary:** The loading and view-model boundaries match the current code well. The null-baseline changes are narrowly scoped, and the dependency order correctly settles loading before draft restoration.

**Strengths**

- Loading first preserves the prerequisites restoration actually checks: a version, matching recipe identity, loaded batches, and no load failure. See [app/src/ui/RecipePage.jsx:502](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:502).
- The three proposed baseline substitutions correspond to the existing pen comparison sites, while leaving Show changes against the parent intact. See [app/src/ui/RecipePage.jsx:821](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:821), [app/src/ui/RecipePage.jsx:833](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:833), and [app/src/ui/RecipePage.jsx:850](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:850).

**Concerns**

- **LOW — The “else newest” test cannot detect incorrect ordering.** Its singleton fixture passes even if the implementation simply selects `batches[0]`. The actual rule includes churn-date ordering, recorded-date fallback, and tie-breaking. See [08-02-PLAN.md:238](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-02-PLAN.md:238) and [app/src/domain/batch.js:362](/Users/mark/Documents/projects/sprinkles/app/src/domain/batch.js:362).

**Suggestions**

- Use at least two batches supplied in the wrong chronological order, including an undated batch.
- Assert that explicitly naming an older batch selects it and that selection leaves the input array unchanged.

**Risk assessment: LOW.** This is predominantly a direct move, with existing behavior and per-cut comparisons providing substantial coverage.

## 08-03

**Summary:** Extracting exactly the article and retaining the band, aside, and foot ownership is a sensible reusable boundary. Two inconsistencies weaken the promised fallback and creation-readiness evidence.

**Strengths**

- The foot slot preserves the existing article’s last-child placement without coupling the shared Sheet to batch handlers. See [app/src/ui/RecipePage.jsx:1777](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:1777).
- Re-pointing the Show changes source test is carefully planned: its assertions require two handler connections and an Ingredients heading inside its section. See [app/src/ui/RecipePage.test.jsx:1293](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.test.jsx:1293).
- The proposed local fold ownership matches `useFold`’s state-and-default-reset implementation. See [app/src/ui/useBelowDesktop.js:105](/Users/mark/Documents/projects/sprinkles/app/src/ui/useBelowDesktop.js:105).

**Concerns**

- **MEDIUM — The permitted fallback cannot pass the prescribed shell test.** The fallback retains `focusedFigureKey` and `useSheetTwoColumns` in the shell, but `shellLacks` explicitly forbids both and the component markers require local ownership. See [08-03-PLAN.md:86](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-03-PLAN.md:86) and [08-03-PLAN.md:178](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-03-PLAN.md:178).
- **MEDIUM — Empty-only rendering does not establish the populated null-baseline contract.** An empty Sheet bypasses `IngredientTable` and every method-step body. Furthermore, `Method` explicitly disables its developing branch when `baselineVersion` is null. The proposed test can pass while populated Instructions remain read-only. See [app/src/ui/RecipePage.jsx:1678](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:1678) and [app/src/ui/Method.jsx:593](/Users/mark/Documents/projects/sprinkles/app/src/ui/Method.jsx:593).

**Suggestions**

- Specify the fallback’s corresponding props and shell-test assertions, or remove that fallback.
- Add a populated in-memory version with a null baseline. Verify safe rendering and record the current read-only method behavior as a Phase 10 limitation; implementing `creating` mode remains outside this phase.

**Risk assessment: MEDIUM.** The extraction is viable, but its fallback instructions and evidence claims need alignment.

## 08-04

**Summary:** This plan handles the hardest dependency correctly. The effect-free writer breaks initialization coupling while preserving restoration and persistence ordering. The hook test needs more precise inputs.

**Strengths**

- The writer genuinely needs only refs, the version ID, and the repository; it does not require pen state. See [app/src/ui/RecipePage.jsx:473](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:473) and [app/src/ui/RecipePage.jsx:486](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:486).
- The amend redirect deliberately precedes restoration and leaves persistence disabled. Preserving that early return protects the draft for the next keyed page instance. See [app/src/ui/RecipePage.jsx:529](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:529).
- Keeping persist before pagehide preserves the existing timer cleanup followed by final flush. See [app/src/ui/RecipePage.jsx:593](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:593) and [app/src/ui/RecipePage.jsx:609](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:609).

**Concerns**

- **MEDIUM — The hook test omits the draft owner and can still pass.** Its specified inputs omit `versionId`, and its assertions count reads without checking their argument. A mock resolving any request can therefore hide `getDraft(undefined)`: validation compares the returned record against `version.id`, independently of the requested key. See [08-04-PLAN.md:261](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-04-PLAN.md:261), [app/src/ui/RecipePage.jsx:505](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:505), and [app/src/domain/draft.js:268](/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js:268).
- **LOW — The success harness leaves restoration disconnected from mode changes.** A spy-only `onRestorePlan` leaves mode as `reading`; once restoration completes, persistence can delete the restored record as clean. See [app/src/ui/RecipePage.jsx:580](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:580).

**Suggestions**

- Supply `versionId: oliveOilVersion.id`, `batches: []`, and explicit batch identity; assert the exact `getDraft` argument.
- Make the restoration harness update mode and pen state, or explicitly identify it as testing restoration callbacks only.

**Risk assessment: MEDIUM.** Persistence is sensitive, but the ownership design, existing integration suite, and proposed mutation checks substantially contain that risk.

## 08-05

**Summary:** The required route-intent cut and optional batch extraction are appropriately separated. Final evidence covers module completeness and behavior, but test-preservation verification is incomplete.

**Strengths**

- The intent extraction preserves meaningful sequencing: tasting waits for restoration; Next version additionally waits for versions and drafts before consuming the request. See [app/src/ui/RecipePage.jsx:628](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:628) and [app/src/ui/RecipePage.jsx:651](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:651).
- The bonus correctly addresses `handleStartTasting`’s dependency on `openBatch`, which currently exists below the early returns. Computing the same selection inside the event handler avoids accessing an unavailable render-local value. See [app/src/ui/RecipePage.jsx:855](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:855) and [app/src/ui/RecipePage.jsx:1136](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx:1136).

**Concerns**

- **MEDIUM — File presence and increased test totals do not prove tests were preserved.** Existing expectations can be removed or weakened while every filename remains and newly added tests increase the total. The final check currently establishes only those weaker conditions. See [08-05-PLAN.md:259](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-05-PLAN.md:259) and [08-05-PLAN.md:283](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-05-PLAN.md:283).

**Suggestions**

- Add a final base-to-result test diff audit: existing behavioral tests must be unchanged except the enumerated D-11 read-target edits; review the shell-test rewrite separately.
- Keep bonus failure independent of required-phase completion, as already specified.

**Risk assessment: MEDIUM.** The required extraction is straightforward; the optional batch move is larger, and the final preservation claim needs stronger evidence.

All five plans were reviewed against the repository at `9eb2df4`. I ran the existing suite: **91 files and 2,932 tests passed**. I did not rerun the WebKit walk or execute the extractions.

The overall approach is sound. Address the medium findings before execution; none requires expanding the agreed product scope.

---

## Consensus Summary

One reviewer ran (Codex). Claude was skipped because this session runs inside Claude Code, and no other reviewer CLI is installed. These are single-reviewer findings, not consensus; every concern below cites `file:line` evidence.

### Agreed Strengths
Not applicable with one reviewer. Codex's own strengths: the walk keeps `walk: '05'`; the effect-free draft writer breaks the pen/draft cycle; the amend-redirect early return is preserved; loading is cut before restoration; the foot slot keeps the Sheet free of batch handlers.

### Agreed Concerns
Not applicable with one reviewer. Codex's concerns (all MEDIUM or LOW, none requires new product scope):

- [ ] **08-01 MEDIUM:** `PLAYWRIGHT_CORE` overrides the walk's import, but the imported harness (`03.5-probe-harness.mjs:12`) still statically imports the npx cache path, so the walk still fails to load if that cache disappears.
- [ ] **08-01 LOW:** the fixture assertions only check `jobProblems` returns a nonempty array, not that the intended check fired.
- [ ] **08-02 LOW:** the "else newest" test uses a one-batch fixture and passes even if the code takes `batches[0]`; the real rule orders by churn date, recorded-date fallback and tie-break (`domain/batch.js:362`).
- [ ] **08-03 MEDIUM:** the permitted fallback (keep `focusedFigureKey` and `useSheetTwoColumns` in the shell) cannot pass the shell test, because `shellLacks` forbids both.
- [ ] **08-03 MEDIUM:** the empty-only `RecipeSheet` test bypasses `IngredientTable` and the method-step bodies, and `Method` disables its developing branch when `baselineVersion` is null (`Method.jsx:593`), so a populated null-baseline Sheet is untested.
- [ ] **08-04 MEDIUM:** the `useKeptDraft` hook test omits `versionId` and only counts reads, so `getDraft(undefined)` would still pass.
- [ ] **08-04 LOW:** the success harness uses a spy-only `onRestorePlan`, so mode stays `reading` and persistence can delete the restored record as clean.
- [ ] **08-05 MEDIUM:** the final check proves only that test files exist and the test total grew; it does not prove no existing expectation was removed or weakened.

### Divergent Views
None (single reviewer).
