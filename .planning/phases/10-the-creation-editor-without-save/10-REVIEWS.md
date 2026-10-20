---
phase: 10
reviewers: [codex]
reviewed_at: 2026-10-20T13:13:49Z
plans_reviewed: [10-01-PLAN.md, 10-02-PLAN.md, 10-03-PLAN.md, 10-04-PLAN.md, 10-05-PLAN.md, 10-06-PLAN.md, 10-07-PLAN.md, 10-08-PLAN.md, 10-09-PLAN.md, 10-10-PLAN.md, 10-11-PLAN.md, 10-12-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
model_sources:
  codex: "banner"
---

# Cross-AI Plan Review — Phase 10

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

Round 2, Codex only (`--codex`), against the plans at e8a96bc8: the round-1 replan fe24221d plus D-04b (Start reuses an existing create draft) at 24b8009f. Round 1 (Codex, Astra and Argon) is in git at d14adb94 and is dispositioned in each plan's Review Dispositions Ledger. Codex was asked to check that every round-1 disposition holds in the plan text and the cited source, and to raise only new findings and regressions. It ran 12 minutes and reported the baseline suite green (113 files, 3,475 tests).

## Codex Review

## 10-01

**Summary.** The strict comparator and anchored measurements address the main round-1 harness findings. One new contract conflict would prevent later board specs from passing.

**Strengths**

- Duplicate detection and removal of allowance machinery are explicitly specified in [10-01-PLAN.md:126](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-01-PLAN.md:126). The reused [`diffLeaves` implementation](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:869) compares added keys and changed leaves as required.

**Concerns**

- **HIGH — Expected absence is treated as a spec defect.** [Line 189](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-01-PLAN.md:189) rejects every selector with zero board matches. Later specs deliberately count absent controls: no cards initially, no checked radio before choosing Kind, and no Add controls at the limit. The generator confirms those states at [p10.py:402](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:402). The engine could pass its own self-tests yet reject correct downstream implementations.

**Suggestions**

- Support explicit expected-zero counts. Continue rejecting empty selections for element-property checks unless absence is declared.
- Add a self-test proving legitimate absence passes while a missing expected element fails.

**Risk Assessment: HIGH.** The engine is a dependency of every visual acceptance gate.

## 10-02

**Summary.** Normalization, restore gating and awaited deletion substantively address round-1 concerns. The new terminal-discard mechanism introduces a persistence failure after an unsuccessful Cancel.

**Strengths**

- Normalizing both initial and restored state correctly accommodates the accepted partial payload contract: [`draft.js:499`](/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js:499) requires only three fields, and [the revised task](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-02-PLAN.md:206) supplies defaults at both entry points.

**Concerns**

- **HIGH — Failed Cancel permanently disables autosave.** [Line 210](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-02-PLAN.md:210) sets `endedRef` before deletion and makes persistence stop whenever it remains true. [The failure branch](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-02-PLAN.md:208) leaves the editable page mounted, with no specified reversal or requeue. Subsequent edits therefore disappear on leaving or reloading. The existing writer also clears pending ink before deleting ([`useKeptDraft.js:44`](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:44)).
- **MEDIUM — The split no longer defines a consistent green boundary.** [Task 1’s test](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-02-PLAN.md:161) expects an existing draft’s row and Resume immediately, while their implementation remains assigned to [10-11:105](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:105). D-04b needs that rendering brought forward explicitly.

**Suggestions**

- Preserve terminal behavior after successful deletion, but restore persistence—including current pending ink—when deletion fails.
- Test failed Cancel → edit → debounce → leave → Resume.
- Move the minimal draft-row implementation into this plan and update 10-11’s ownership.

**Risk Assessment: HIGH.** The failure path can silently lose work.

## 10-03

**Summary.** The revised plan handles submission, duplicate names and pending navigation well. Its round-1 dispositions are supported by the task text.

**Strengths**

- The submit-button correction is necessary: [`Button.jsx:7`](/Users/mark/Documents/projects/sprinkles/app/src/ui/Button.jsx:7) defaults to `type="button"`. The planned single submission path and pending-start lifetime at [10-03:122](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-03-PLAN.md:122) and [124](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-03-PLAN.md:124) cover the earlier defects.

**Concerns**

- No new local finding. The required-name rule correctly reuses [`recipeNameMessage`](/Users/mark/Documents/projects/sprinkles/app/src/domain/recipe.js:13), and the revised tasks distinguish withdrawing navigation from withdrawing the already-started write.

**Suggestions**

- Retain the deferred-write tests when resolving 10-02’s draft-row ownership; they protect the intended pending-Start behavior.

**Risk Assessment: LOW.** The behavior is bounded and has concrete interaction tests.

## 10-04

**Summary.** The tri-state boot guard and import-time recheck address the earlier windows. Two revised shortcuts weaken the resulting guarantee.

**Strengths**

- Keeping the chooser handler synchronous matches [`Shell.jsx:332`](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx:332). [The revised handler](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-04-PLAN.md:109) now refuses unknown boot state instead of assuming absence.

**Concerns**

- **MEDIUM — The final recheck fails open to preserve incomplete mocks.** [Line 111](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-04-PLAN.md:111) converts a failed drafts read to `null` and permits import when the cached state is absent. An older absence observation cannot establish that no creation exists now. The stated motivation is repository stubs missing `listDrafts` ([line 82](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-04-PLAN.md:82)); that should be fixed in tests.
- **MEDIUM — `{ discarded: true }` does not prove global absence.** [Lines 107–109](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-04-PLAN.md:107) force absent state after Cancel. However, [10-11’s defensive two-draft case](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:109) deliberately leaves the older draft kept. Import can then open its chooser before the read settles. The later recheck may prevent replacement, but the no-chooser guarantee is violated.

**Suggestions**

- Refuse the import commit when its recheck fails; update mocks with an explicit empty drafts response.
- Make post-Cancel knowledge account for remaining drafts, and test Cancel with two stored creations followed immediately by Import.

**Risk Assessment: MEDIUM.** The common path is protected, but failure and defensive concurrency cases remain inconsistent.

## 10-05

**Summary.** The note adapters and narrowly scoped creating branches address the round-1 findings without expanding the phase.

**Strengths**

- [The adapters](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-05-PLAN.md:124) now match the actual `(listKey, index, text)` and `(listKey, index)` calls in [`Authored.jsx:35`](/Users/mark/Documents/projects/sprinkles/app/src/ui/Authored.jsx:35). Functional updates also preserve multiple edits in one batch.

**Concerns**

- No new local finding. [The Headnote change](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-05-PLAN.md:153) limits empty-prose suppression to creating mode, preserving the existing reading branch at [`Headnote.jsx:71`](/Users/mark/Documents/projects/sprinkles/app/src/ui/Headnote.jsx:71).

**Suggestions**

- Keep the second-note interaction test and unchanged reading/developing tests as specified.

**Risk Assessment: LOW.** The shared-component changes have explicit mode boundaries.

## 10-06

**Summary.** The row projection, removal and focus changes now address the cited round-1 issues. No additional local blocker emerged.

**Strengths**

- [The finite-number guard](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-06-PLAN.md:123) correctly protects [`rowFromLibraryRecord`’s finite-grams requirement](/Users/mark/Documents/projects/sprinkles/app/src/domain/versionRow.js:48).
- Keeping `isCreating` separate in [line 129](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-06-PLAN.md:129) avoids widening the existing `draftVersion` branches at [`IngredientTable.jsx:512`](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:512).

**Concerns**

- No new local finding. The failed-library branch now explicitly retains Cancel ([line 131](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-06-PLAN.md:131)), supporting the round-1 disposition.

**Suggestions**

- Exercise that retained Cancel with the corrected failed-delete lifecycle from 10-02.

**Risk Assessment: MEDIUM.** The table is shared with existing routes, although the planned boundaries and regression checks are appropriate.

## 10-07

**Summary.** The revised message lifecycle and stateful test harness resolve the earlier implementation/test mismatch.

**Strengths**

- [The revised Set-based rule](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-07-PLAN.md:104) derives messages from current values and tests actual input and blur events. Extracting the existing sentences preserves their current order in [`lineage.js:242`](/Users/mark/Documents/projects/sprinkles/app/src/domain/lineage.js:242).

**Concerns**

- No new local finding. The overflow-message inconsistency is explicitly deferred at [line 203](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-07-PLAN.md:203); I am not reopening that disposition.

**Suggestions**

- Keep the pen’s existing gate tests unchanged while extracting the shared message function.

**Risk Assessment: LOW.** The behavior and regression boundary are well specified.

## 10-08

**Summary.** Style replacement, clearing, finite bands and native-select behavior are now coherent. The setup handlers and optional-control comparisons need revision.

**Strengths**

- The selected defaults match the stored rows: Philadelphia’s bands and temperature are at [`styles.js:23`](/Users/mark/Documents/projects/sprinkles/app/src/data/styles.js:23), and Gelato’s temperature is at [line 54](/Users/mark/Documents/projects/sprinkles/app/src/data/styles.js:54). The signed-input reuse matches [`BatchRow.jsx:86`](/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx:86).

**Concerns**

- **MEDIUM — Setup handlers still replace state from a render snapshot.** [Line 130](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-08-PLAN.md:130) specifies calls such as `onChange(clearStyle(createDraft))` and `onChange(setBandEnd(...))`, while [line 132](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-08-PLAN.md:132) passes `setCreateDraft` directly. Two band edits in one batch can overwrite each other. This departs from the established functional-update mechanism at [`usePenDraft.js:45`](/Users/mark/Documents/projects/sprinkles/app/src/ui/usePenDraft.js:45).
- **HIGH — The No-style panels cannot pass the specified engine.** [The spec inventory](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-08-PLAN.md:164) includes Clear-button count, box and text checks for every Style panel. The generator deliberately omits Clear when nothing is picked ([`p10.py:170`](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:170)).

**Suggestions**

- Pass functional updates for every setup mutation; test two band edits in one batch.
- Declare Clear absent in the relevant panels and resolve 10-01’s expected-zero contract.

**Risk Assessment: HIGH.** The current visual gate rejects correct initial and cleared states.

## 10-09

**Summary.** Radio-group isolation, accessible card names and bounded authoring are well addressed. The empty-state comparisons and evidence framing remain inconsistent.

**Strengths**

- The fixture correction targets the actual collision: [`Segmented.jsx:29`](/Users/mark/Documents/projects/sprinkles/app/src/ui/Segmented.jsx:29) and [`p10.py:175`](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:175) derive names from the shared label. [The revised correction](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-09-PLAN.md:200) preserves approved CSS while assigning separate names.

**Concerns**

- **HIGH — Several valid panels necessarily fail nonempty-selector enforcement.** [Line 207](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-09-PLAN.md:207) applies card, Required-line, checked-radio, stops and Add-control checks across all panels. The actual generated states include zero cards initially, zero Required lines for completed cards, zero checked radios for unpicked Kind, and zero Add controls at the limit ([`p10.py:402`](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:402)).
- **MEDIUM — Equivalent-region evidence is not achieved for scales.** The same spec uses `.notebook-log` as scope, and [10-01 screenshots that scope](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-01-PLAN.md:197). The board log contains Scales and Problems, whereas the app also contains Style: compare [`p10.py:365`](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:365) with [403](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:403). Anchored measurements can match while the evidence pictures show different regions.

**Suggestions**

- Specify expected absence per panel.
- Separate measurement scope from evidence framing; capture equivalent regions beginning at the Scales heading on both sides.

**Risk Assessment: HIGH.** Correct authoring behavior would still fail the planned gate.

## 10-10

**Summary.** The final verification plan now distinguishes automated proof from pending iPad verification and checks first activation explicitly.

**Strengths**

- [The device walkthrough](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-10-PLAN.md:140) correctly avoids the retry behavior in [`09-walk.mjs:230`](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:230). Waiting past debounce before closing also respects the existing best-effort shutdown qualification in [`useKeptDraft.js:245`](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:245).

**Concerns**

- **HIGH — The final acceptance claim depends on unresolved harness contradictions.** [The final board run](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-10-PLAN.md:112) inherits the expected-absence failures and unequal scales evidence described above. These are spec/engine defects, so they must not trigger application CSS changes.

**Suggestions**

- Resolve those contracts before execution reaches this gate; retain the existing instruction to classify failures before editing the app.

**Risk Assessment: HIGH.** The gate is comprehensive but currently cannot produce all promised evidence consistently.

## 10-11

**Summary.** Resume, notices and shutdown qualifications address the round-1 concerns. D-04b was not fully propagated into acceptance checks and ledger instructions.

**Strengths**

- [The closed-tab tests](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:109) accurately distinguish a flush attempt from guaranteed shutdown persistence, matching the listeners and qualification in [`useKeptDraft.js:245`](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:245).

**Concerns**

- **LOW — The exact `listDrafts()` count is stale.** [Line 116](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:116) expects one occurrence and a prior count of zero. D-04b already adds one Start-time read in [10-02:157](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-02-PLAN.md:157); this plan adds another at [line 105](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:105).
- **LOW — Superseded ledger instructions still request a decision.** [Line 215](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:215) says the orchestrator adds a singleton-policy decide row, despite D-04b already settling it. Equivalent stale deferred rows remain in 10-02 and 10-04.

**Suggestions**

- Correct the count or replace it with behavior assertions.
- Mark the old deferred rows superseded and remove the instruction to ask Mark again.

**Risk Assessment: MEDIUM.** Local behavior is sound, but it inherits the failed-Cancel persistence defect from 10-02.

## 10-12

**Summary.** Separating frozen-board comparisons from tests using the larger seeded library addresses round-1 coverage concerns. The board inventory needs explicit state exclusions.

**Strengths**

- Reusing matching and summary functions is supported by [`ingredientSearch.js:25`](/Users/mark/Documents/projects/sprinkles/app/src/domain/ingredientSearch.js:25) and [`IngredientsPlace.jsx:91`](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientsPlace.jsx:91). [The current-library script](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-12-PLAN.md:141) adds meaningful coverage beyond the 26-entry fixture.

**Concerns**

- **MEDIUM — The comparison inventory includes elements absent from the states being tested.** [Line 137](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-12-PLAN.md:137) includes `.pick__list [box]` without explicitly excluding no-match panels. The generator replaces that list with `.pick__none` ([`p10.py:275`](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:275)). After-pick panels contain no picker at all ([line 390](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:390)). Under 10-01’s rule, these expected absences fail.

**Suggestions**

- Give open, filtered, no-match and after-pick panels explicit positive and absent selector sets.
- Keep the separate seeded-library checks unchanged.

**Risk Assessment: MEDIUM.** Functional coverage is strong; the visual specification needs clarification.

## Overall assessment

**Request changes before execution.** All 12 plans were reviewed against repository source. Most round-1 dispositions hold, particularly normalization, anchors, note adapters, finite projections and first-activation checks.

Prioritize:

1. Recover persistence after a failed Cancel.
2. Reconcile expected absence with the board engine and panel specs.
3. Correct import recheck failure handling and post-Cancel remaining-draft knowledge.
4. Finish propagating D-04b through ownership, acceptance counts and ledgers.
5. Use functional setup updates and equivalent scales evidence framing.

The existing source baseline passes **113 test files and 3,475 tests**. That establishes the starting state; the proposed Phase 10 implementation and harnesses have not yet been executed.

---

## Consensus Summary

One reviewer this round, so there is no cross-model consensus; Codex's verdict counts at full weight (source-grounded, 12/12 plans). Most round-1 dispositions hold: normalization, anchors, note adapters, finite projections, the fixture correction and first-activation checks. Codex asks for changes before execution on five points, four of them introduced or exposed by the round-1 revision.

### Agreed Strengths

- The strict comparator and anchored measurements resolve the round-1 harness findings (10-01, `09-walk.mjs:869`).
- Normalizing at both entry points matches the three-field contract in `draft.js:499` (10-02).
- Submit-type Start, the pending-Start lifetime and `recipeNameMessage` reuse hold (10-03).
- Note adapters now match `Authored.jsx:35`; the Headnote change is scoped to creating (10-05).
- `Number.isFinite` protects `versionRow.js:48`; `isCreating` stays separate from `isDeveloping` (10-06).
- The Set-based message rule and event-driven harness fix the round-1 test mismatch (10-07).
- The scales fixture correction targets the real collision in `Segmented.jsx:29` and `p10.py:175` (10-09).
- The device walk avoids the `09-walk.mjs:230` retry and waits past the debounce (10-10).

### Agreed Concerns

1. **Expected absence is a FAIL in the new engine — HIGH (10-01, 10-08, 10-09, 10-12; inherited by 10-10).** 10-01 line 189 rejects every selector with zero board matches. The boards deliberately contain absences: no Clear button when no style is picked (`p10.py:170`), no cards, no checked radio and no Add control at the limit (`p10.py:402`), `.pick__none` in place of `.pick__list` and no picker after a pick (`p10.py:275`, `p10.py:390`). The engine passes its self-tests and then rejects correct implementations. Fix: an explicit expected-zero declaration per selector per panel, with a self-test that legitimate absence passes and a missing expected element fails; each consumer spec lists its absent selectors.
2. **A failed Cancel disables autosave for good — HIGH (10-02, inherited by 10-11).** `endedRef` is set before the delete (plan line 210) and persistence stops while it is true; the failure branch (line 208) leaves the editable page mounted with no reversal. Edits after a failed Cancel vanish on leave or reload. Fix: terminal only after a successful delete; on failure restore persistence including the pending ink `useKeptDraft.js:44` cleared; test failed Cancel, edit, debounce, leave, Resume.
3. **Import guard: fail-open recheck and post-Cancel absence — MEDIUM (10-04).** The recheck turns a failed `listDrafts` into null and permits the import when the cached state is absent (line 111), kept that way for repository stubs missing `listDrafts` (line 82); fix the stubs instead and refuse when the recheck fails. `{ discarded: true }` forces absent after Cancel (lines 107–109), but the defensive two-draft store in 10-11 leaves an older draft, so the chooser can open before the read settles.
4. **D-04b not fully propagated — MEDIUM/LOW (10-02, 10-11, 10-04).** 10-02's new test expects the existing draft's row and Resume at Start, but that rendering is still owned by 10-11 line 105: bring the minimal draft row forward into 10-02 or make 10-02's test not depend on it. The exact `listDrafts()` count at 10-11 line 116 is stale now that Start reads once more. The old Deferred rows and 10-11 line 215's "orchestrator adds a decide row" are superseded by the D-04b Addressed row and should say so.
5. **Setup handlers replace state from a render snapshot — MEDIUM (10-08).** Line 130 calls `onChange(clearStyle(createDraft))` and `onChange(setBandEnd(...))` while line 132 passes `setCreateDraft` directly; two band edits in one batch overwrite each other. Use functional updates as `usePenDraft.js:45` does; test two edits in one batch.
6. **Scales evidence framing — MEDIUM (10-09).** Measurement scope `.notebook-log` matches anchored boxes, but the evidence pictures differ: the board log has Scales and Problems, the app's also has Style (`p10.py:365` vs `403`). Capture equivalent regions from the Scales heading on both sides.

### Divergent Views

Single reviewer; none. Codex explicitly did not reopen the round-1 deferral of the overflow-grams message (10-07 line 203).
