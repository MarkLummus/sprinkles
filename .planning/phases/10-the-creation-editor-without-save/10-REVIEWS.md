---
phase: 10
reviewers: [codex, opencode-astra, opencode-argon]
reviewer_instances: [opencode-astra, opencode-argon]
reviewed_at: 2026-10-20T10:06:40Z
plans_reviewed: [10-01-PLAN.md, 10-02-PLAN.md, 10-03-PLAN.md, 10-04-PLAN.md, 10-05-PLAN.md, 10-06-PLAN.md, 10-07-PLAN.md, 10-08-PLAN.md, 10-09-PLAN.md, 10-10-PLAN.md, 10-11-PLAN.md, 10-12-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
  opencode-astra: "openrouter/openai/gpt-6-astra#high"
  opencode-argon: "openrouter/google/gemini-4-argon#high"
model_sources:
  codex: "banner"
  opencode-astra: "pinned"
  opencode-argon: "pinned"
---

# Cross-AI Plan Review — Phase 10

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

> Note: opencode-astra and opencode-argon share the opencode adapter; their consensus is cross-model, not cross-tool.

Round 1, against the plans at 271c7e7e (after the plan check revision 4b435c5a). Run with `--all`: Codex plus the two configured OpenCode instances; the plain OpenCode lane was not run because it is pinned to the same Argon model. Lanes ran in parallel; Astra finished in 8 minutes, Codex in 10, Argon in 17. All three reviewed against source and reported the baseline suite green (113 files, 3,475 tests). Codex and Astra also ran in-memory probes of the proposed hook changes; Astra and Argon measured the frozen boards in WebKit.

## Codex Review

Reviewed all 12 plans against repository source. The baseline passes **113 test files and 3,475 tests**. I also ran focused probes for draft compatibility, numeric overflow and cancellation timing. WebKit aborted during launch, so browser-layout findings below are based on source inspection rather than fresh measurements.

## 10-01

**Summary:** Recording the baseline before implementation and removing Phase 9’s allowances are sound. The board engine needs a different coordinate contract before it can support the planned acceptance checks.

**Strengths**

- Detached baseline builds and scratch output preserve the existing isolation mechanism. See [09-walk-record-base.sh:40](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk-record-base.sh:40).
- Store, snapshot and added-key doctorings exercise meaningful failure paths in the existing recursive comparator. See [09-walk.mjs:869](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:869).

**Concerns**

- **HIGH:** Document-relative comparison cannot handle all approved panels. The generator constructs some panels from `sheet_only` or `log_only`, omitting the shell and editor band entirely. Subtracting the panel wrapper’s position does not restore that missing layout. See [p10.py:370](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:370) and the proposed comparison contract at [10-01-PLAN.md:177](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-01-PLAN.md:177).
- **MEDIUM:** Comparing scenarios and steps through names, sets and `.find()` can ignore duplicate names or labels. An extra duplicate step containing changed data could escape comparison. The inherited mechanism does this at [09-walk.mjs:1205](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:1205).
- **MEDIUM:** The walk records text, fields, focus and stores—not geometry or screenshots. A strict MATCH therefore cannot establish unchanged visual layout. See [09-walk.mjs:157](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:157).

**Suggestions**

- Add explicit board/app comparison roots and origins; prove the engine against a cropped Sheet panel and a log-only panel immediately.
- Reject duplicate scenario names and step labels; add corresponding doctorings.
- Describe the walk as semantic/store regression proof, with a small separate visual check for affected existing surfaces.

**Risk Assessment:** **HIGH**, because the proposed engine would reject correct implementations of several boards.

## 10-02

**Summary:** The route and shared-editor spine are appropriate. Supported partial drafts and the complete Cancel lifecycle need stronger treatment.

**Strengths**

- Finding the record before mounting the editor respects the hook’s keyed restore mechanism and protects typing from a late read. See [useKeptDraft.js:139](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:139) and [useKeptDraft.js:158](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:158).
- A synthetic version can use the existing reading path without a stored version or baseline. See [sheetView.js:34](/Users/mark/Documents/projects/sprinkles/app/src/ui/sheetView.js:34).

**Concerns**

- **HIGH:** `draftMatchesCreate` requires only `recipeId`, `versionId` and `name`; the hook explicitly tests restoring that minimal payload. Mounting `record.payload` directly leaves arrays and descriptions undefined, while the proposed projection and Sheet dereference them. See [draft.js:499](/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js:499), [useKeptDraft.test.jsx:407](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.test.jsx:407) and [RecipeSheet.jsx:88](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeSheet.jsx:88). A source probe confirmed the minimal payload passes validation.
- **HIGH:** Returning the existing delete chain still swallows deletion failure because it ends in `.catch(() => {})`. Cancel could announce success while the record remains. See [useKeptDraft.js:49](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:49).
- **HIGH:** Clearing pending writes is not a terminal cancellation guard. A late restore can update state and schedule another write while deletion is pending. See [useKeptDraft.js:175](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:175). A focused hook probe reproduced a save scheduled after `discardDraft()`.

**Suggestions**

- Normalize optional fields over `blankCreateDraft` at both initial load and restore. Safely handle accepted rows with empty portions as well.
- Make cancellation prevent subsequent restores/edits from rearming persistence.
- Test rejected deletion and Cancel during a deferred restore; announce discard only after confirmed deletion.

**Risk Assessment:** **HIGH**, because these affect reopening and abandoning a creation.

## 10-03

**Summary:** Name validation, duplicate-name guidance and submission deduplication are well scoped. Pending submission needs an explicit cancellation policy.

**Strengths**

- Reusing `recipeNameMessage` preserves the established blank-name rule and wording. See [recipe.js:13](/Users/mark/Documents/projects/sprinkles/app/src/domain/recipe.js:13).
- The planned field feedback distinguishes an advisory from invalid input while reusing the existing feedback component. See [FieldFeedback.jsx:4](/Users/mark/Documents/projects/sprinkles/app/src/ui/FieldFeedback.jsx:4).

**Concerns**

- **MEDIUM:** The ref guard covers repeated Start presses, but not Cancel while `saveDraft` is pending. The entry can close while the parent’s awaited write subsequently completes and navigates into the editor. See [10-03-PLAN.md:121](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-03-PLAN.md:121) and [10-02-PLAN.md:154](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-02-PLAN.md:154).
- **MEDIUM:** Specify Start’s submission wiring. Shared `Button` defaults to `type="button"`; relying on the form’s `onSubmit` without an explicit submit type can leave the visible Start button inert. See [Button.jsx:7](/Users/mark/Documents/projects/sprinkles/app/src/ui/Button.jsx:7).

**Suggestions**

- State whether entry Cancel is unavailable during submission or cancels the pending transition; test that choice using a deferred write.
- Use `type="submit"` for Start and test both a real button click and Enter.

**Risk Assessment:** **MEDIUM**. The normal path is straightforward; asynchronous interaction boundaries are underspecified.

## 10-04

**Summary:** Keeping chooser activation synchronous is correct. The proposed cached flag does not yet guarantee refusal whenever a creation exists.

**Strengths**

- The synchronous refusal preserves the existing chooser mechanism at [Shell.jsx:332](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx:332).
- Registering the existing route announcer follows the guarded-release pattern already used by `guardImport`, without moving the recipe notice. See [Shell.jsx:322](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx:322) and [router.jsx:79](/Users/mark/Documents/projects/sprinkles/app/src/router.jsx:79).

**Concerns**

- **HIGH:** `creationKeptRef` starts false and becomes authoritative only after an asynchronous read. On cold boot, Import can open before that read resolves. Likewise, Start followed by navigation away from `/notebook/new` can expose the chooser before a positive read completes. A read counter prevents stale results winning; it does not close this window. See [10-04-PLAN.md:99](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-04-PLAN.md:99).
- **MEDIUM:** Guarding chooser opening alone does not cover an import already reading `file.text()` when a creation starts. The current handler proceeds to `importStore` after that await without rechecking. See [Shell.jsx:354](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx:354).

**Suggestions**

- Represent initial guard state as unknown, and publish successful Start/Cancel transitions synchronously to the Shell.
- Add delayed-read tests that click Import before resolution and immediately after navigation.
- Recheck the creation condition before committing an already-started import.

**Risk Assessment:** **HIGH**. The remaining windows can overwrite library values used by a kept draft.

## 10-05

**Summary:** The additive `creating` branches fit the shared Sheet well. The note-handler interface should be made explicit.

**Strengths**

- Preserving the single Sheet/table/formulation instances respects the actual architectural pins. See [RecipePage.shell.test.js:198](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.shell.test.js:198).
- Hiding Balance only for zero-mass creations follows the real calculation boundary: `computeBalance` returns null at zero mass. See [composition.js:24](/Users/mark/Documents/projects/sprinkles/app/src/domain/composition.js:24).

**Concerns**

- **MEDIUM:** `NoteList` calls changes as `(listKey, index, text)` and removal as `(listKey, index)`. The plan describes creation handlers in terms of `index` and `text` without specifying adapters. Directly forwarding those arguments would pass `"beforeYouStart"` as the index. See [Authored.jsx:35](/Users/mark/Documents/projects/sprinkles/app/src/ui/Authored.jsx:35) and [10-05-PLAN.md:123](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-05-PLAN.md:123).

**Suggestions**

- Spell out adapters such as `(_listKey, index, text) => …`.
- Exercise editing and removing the second note through actual textarea/button events, including focus after removal.

**Risk Assessment:** **MEDIUM**, primarily from callback integration; the component changes themselves are contained.

## 10-06

**Summary:** Library-linked draft rows and a separate creation rendering branch meet the intended model. Numeric and load-failure handling need two additions.

**Strengths**

- The proposed draft row matches the existing exact-key contract. See [draft.js:422](/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js:422).
- Reusing `rowFromLibraryRecord` preserves the established projection and coefficient-copy mechanism. See [versionRow.js:34](/Users/mark/Documents/projects/sprinkles/app/src/domain/versionRow.js:34).

**Concerns**

- **MEDIUM:** `parseGramsDraft(raw) ?? 0` does not guarantee a finite number. A 309-digit numeric string passes the regex and becomes `Infinity`; the row constructor then throws during rendering. This was reproduced directly. See [lineage.js:212](/Users/mark/Documents/projects/sprinkles/app/src/domain/lineage.js:212) and [versionRow.js:48](/Users/mark/Documents/projects/sprinkles/app/src/domain/versionRow.js:48).
- **MEDIUM:** The proposed failed-library branch renders only an error paragraph, removing the editor’s Cancel action. A kept draft can therefore require Resume to cancel while Resume repeatedly reaches that failure screen. See [10-06-PLAN.md:125](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-06-PLAN.md:125).

**Suggestions**

- Ensure parsed grams are finite before projection; test pasted overflow-sized values.
- Keep the page notice and Cancel available when the library cannot load.

**Risk Assessment:** **MEDIUM**. Both failures have small fixes but otherwise break recoverability.

## 10-07

**Summary:** Sharing the grams sentences is appropriate, and per-row feedback resolves the pen’s single-error limitation. The proposed tests and board coordinates need correction.

**Strengths**

- Extracting the message function can preserve the pen’s existing removed-line checks and traversal order. See [lineage.js:234](/Users/mark/Documents/projects/sprinkles/app/src/domain/lineage.js:234).
- Separate creation error IDs correctly avoid the pen’s shared blocked-row mechanism. See [IngredientTable.jsx:484](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:484).

**Concerns**

- **HIGH:** The assertion that eC1/eC2 compare “as in a full panel” is incorrect. Those panels contain `sheet_only` markup, not a full editor with a cropped viewport. Their table positions cannot equal full-document positions. See [p10.py:370](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:370) and [10-07-PLAN.md:130](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-07-PLAN.md:130).
- **MEDIUM:** The test proposes clearing feedback by rerendering props, while the implementation clears it in `onChange`. Rerendering does not invoke that handler. See [10-07-PLAN.md:103](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-07-PLAN.md:103) and [10-07-PLAN.md:105](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-07-PLAN.md:105).

**Suggestions**

- Compare cropped Sheet contents relative to an equivalent Sheet origin.
- Use a stateful test harness that dispatches input events and rebuilds both the raw values and numeric projection.

**Risk Assessment:** **HIGH** for the planned acceptance gate; **MEDIUM** for the feature implementation.

## 10-08

**Summary:** Style application, clearing and signed-temperature reuse are sensible. Some acceptance statements exceed what the specified UI or parser establishes.

**Strengths**

- Reusing `readSignedInput` and `shownSignedValue` carries forward the existing malformed-number handling. See [BatchRow.jsx:86](/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx:86).
- Omitting invalid target keys fits `buildFigures`, which deliberately distinguishes absent targets from `[0, 0]`. See [figures.js:155](/Users/mark/Documents/projects/sprinkles/app/src/domain/figures.js:155).

**Concerns**

- **HIGH:** Style panels use `log_only`, omitting the shell and band. Their absolute boxes cannot match a full editor under the proposed engine. See [p10.py:374](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:374) and [p10.py:414](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:414).
- **MEDIUM:** The requirement that reselecting the already-selected style reapplies defaults is not established by testing `applyStyle` twice. The specified UI uses select change handling; choosing the unchanged option normally produces no value change. See [10-08-PLAN.md:34](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-08-PLAN.md:34).
- **MEDIUM:** The band parser also needs an explicit finite check; `parseGramsDraft` can return `Infinity`. See [lineage.js:212](/Users/mark/Documents/projects/sprinkles/app/src/domain/lineage.js:212).

**Suggestions**

- Use region-relative board comparisons.
- Remove the unsupported same-selection promise or prove an approved interaction for it in a real browser.
- Qualify “No style means blank bands” as the initial state: after Clear, the approved behavior retains bands.
- Reconcile the enumerated 15 comparison panels with the acceptance text claiming sixteen.

**Risk Assessment:** **HIGH** for verification as written; the underlying state operations are otherwise manageable.

## 10-09

**Summary:** The definition shapes, limits and radio-group repair are well grounded. The isolated-board fixtures cannot be treated as complete editor layouts.

**Strengths**

- Per-scale radio names directly fix the existing label-derived group collision. See [Segmented.jsx:29](/Users/mark/Documents/projects/sprinkles/app/src/ui/Segmented.jsx:29).
- Minted keys and two-item limits reuse established domain rules. See [catalog.js:22](/Users/mark/Documents/projects/sprinkles/app/src/domain/catalog.js:22) and [catalog.js:74](/Users/mark/Documents/projects/sprinkles/app/src/domain/catalog.js:74).

**Concerns**

- **HIGH:** The scales boards contain only Scales and Problems, with an empty Sheet slot. The actual editor contains Style first and a populated Sheet. Absolute positions differ, broad selectors such as `.mk-add` include extra controls, and Scales receives different `:first-child` styling. See [p10.py:374](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:374), [p10.py:399](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:399) and [p10.py:35](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:35).
- **LOW:** Removing an item from a two-item list makes its Add control reappear. Focus must move after that render, rather than attempting to focus a currently absent control. See [10-09-PLAN.md:165](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-09-PLAN.md:165).

**Suggestions**

- Scope comparisons separately to Scales and Problems, with equivalent origins; reserve integrated placement checks for the full editor board.
- Specify an effect/ref-based focus landing after removal and retain the two-item removal test.

**Risk Assessment:** **HIGH** for the acceptance fixture; **MEDIUM** for implementation.

## 10-10

**Summary:** The final store-equality proof and real-tab lifecycle walkthrough are valuable. The plan currently treats fixture differences as application defects.

**Strengths**

- Before/after store dumps test the phase’s central negative guarantee: creation writes no recipe, version or batch. The existing dump uses one transaction across its stores. See [09-walk.mjs:190](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:190).
- Scratch serving uses an existing local-only server with an explicit app root. See [08-walk-server.mjs:81](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs:81).

**Concerns**

- **HIGH:** Applying `pageHeight: true` to eC1/eC2 compares full application document height with a Sheet-only fixture’s height. The recorded 1528 value is for those isolated panels, not the complete editor. See [p10.py:379](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:379), [README.md:76](/Users/mark/Documents/projects/sprinkles/.planning/sketches/013-creation-editor/README.md:76) and [10-10-PLAN.md:110](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-10-PLAN.md:110).
- **MEDIUM:** Retrying user actions until their outcome appears can hide missed taps. The existing walk retry permits four clicks, so it proves eventual reachability rather than the exact device steps. See [09-walk.mjs:230](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:230).

**Suggestions**

- Compare full document heights only for full-page fixtures; compare selected-region heights for isolated fixtures.
- Classify fixture/engine errors before directing executors to modify application CSS.
- Wait for readiness before each device action and treat a required second tap as a reported failure.

**Risk Assessment:** **HIGH**, because the current gate could force incorrect layout changes or fail indefinitely.

## 10-11

**Summary:** Resume and page notices closely follow existing mechanisms. The stated concurrency behavior conflicts with unconditional post-Cancel expectations.

**Strengths**

- Pagehide, visibility and unmount coverage exercises the actual hook listeners. See [useKeptDraft.js:250](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:250).
- Constant notices and consumed route-state flags follow the existing announcement pattern without rendering arbitrary history text. See [router.jsx:52](/Users/mark/Documents/projects/sprinkles/app/src/router.jsx:52).

**Concerns**

- **MEDIUM:** The plan permits two stored creation drafts and deletes only the displayed one, but also promises that Cancel leaves no draft row and offers New recipe. With two records, `newestDraft` will select the remaining record. Both promises cannot hold universally. See [10-11-PLAN.md:28](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:28), [10-11-PLAN.md:32](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md:32) and [draft.js:95](/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js:95).
- **LOW:** Event-dispatch tests prove a flush attempt, not completed persistence during browser shutdown. The hook explicitly documents pagehide as best effort. See [useKeptDraft.js:245](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:245).

**Suggestions**

- State the single-draft precondition for the empty-after-Cancel assertion, or define the residual behavior explicitly; add a two-record test without introducing new UI.
- Preserve the accepted 250 ms loss boundary in verification wording.

**Risk Assessment:** **MEDIUM**. The normal Resume flow is well supported; concurrency guarantees need consistent wording.

## 10-12

**Summary:** Search reuse, Added behavior and safe display-field handling are well designed. Production-library coverage and fixture coordinates remain gaps.

**Strengths**

- Reusing `filterLibrary` and `libraryCategories` preserves deterministic matching, sorting and category type handling. See [ingredientSearch.js:25](/Users/mark/Documents/projects/sprinkles/app/src/domain/ingredientSearch.js:25).
- Sharing `summaryText` avoids drifting coefficient summaries between the place and picker. See [IngredientsPlace.jsx:91](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientsPlace.jsx:91).

**Concerns**

- **HIGH:** Picker panels are generated through `sheet_only`, so their boxes cannot match full-document coordinates merely by reproducing their draft data. See [p10.py:379](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:379) and [p10.py:387](/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/p10.py:387).
- **MEDIUM:** Component and board checks primarily use the original 26 entries. Production seeds the larger merged library; these checks do not establish picker behavior with its additional categories, longer names and summaries. See [seed.js:12](/Users/mark/Documents/projects/sprinkles/app/src/store/seed.js:12) and [10-12-PLAN.md:132](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-12-PLAN.md:132).

**Suggestions**

- Compare picker and landing-row geometry relative to equivalent Sheet origins.
- Retain original-library board checks, then add a current-library smoke pass at both widths covering search, categories, scrolling, Added and overflow.

**Risk Assessment:** **HIGH** for verification as specified; **MEDIUM** for production behavior coverage.

## Overall assessment

**Coverage: 12/12 plans reviewed. Overall risk: HIGH until revised.**

The feature scope and shared-editor architecture are credible. The main blockers are specific:

1. **Repair the board comparison contract.** Several boards are isolated component compositions, not full-page screenshots.
2. **Normalize every supported creation payload before rendering.**
3. **Make Cancel terminal and verify deletion success.**
4. **Close the import guard’s initial and transition windows.**

Also reconcile the concurrency boundary: 10-11 explicitly describes multiple-tab behavior, while 10-04 declares another tab outside scope and accepts an import bypass. See [10-04-PLAN.md:168](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-04-PLAN.md:168).

These corrections can preserve the approved product scope and the twelve-plan structure.

---

## OpenCode Review (opencode-astra)

I’ll verify the plans against the source and tests, focusing on draft persistence, import refusal, and whether the board checks can prove what they claim. I’ll cover all 12 plans individually before the overall assessment.

I found two significant gaps: the draft validator accepts name-only payloads, but the planned editor assumes every field exists; and several boards omit the surrounding page, so their coordinates cannot match the full editor as the proposed checker expects. I’m checking the affected flows and panels before assigning severity.

The cancellation race reproduces: with the planned hook changes applied in memory, a late restore can queue a write while Cancel awaits deletion; unmount then writes the draft back. I also confirmed that the two-scale board has one checked radio group, while the required implementation must have two independent groups. The existing suite passes all 3,475 tests.

Verified all **12 plans** against the repository, including the referenced hooks, components, validators, tests, board generators, and rendered boards.

- **Baseline:** `npm --prefix app test` passes: **113 files, 3,475 tests**.
- **Additional verification:** read-only WebKit measurements and isolated, in-memory probes of the proposed hook changes.
- **Repository files changed:** none.

Plan-file citations below are relative to `.planning/phases/10-the-creation-editor-without-save/`.

## 10-01

**Summary:** The strict-walk approach is sound, but the board engine assumes that every panel represents a complete page. Several acceptance panels are isolated component compositions. The proposed coordinate and screenshot comparisons would reject a correct implementation.

**Strengths**
- Preserving the recorder while replacing its comparison policy provides a credible regression baseline. The existing recorder fixes the clock and IDs, and records page state plus store contents: `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:106–131`, `137–223`.
- Removing Phase 9’s allowances is appropriate. Its existing `diffLeaves` already traverses added and removed keys: `09-walk.mjs:869–881`.

**Concerns**
- **HIGH — The board-coordinate model is incorrect.** `10-01-PLAN.md:175–177` compares board-wrapper-relative positions with application-document positions. However, `.planning/canvas-generators/p10.py:370–375` constructs `sheet_only` and `log_only` panels without the shell or editor band. WebKit measured the same table at **y=684.78** in full-page `eB1` and **y=387.78** in isolated `eC1`: a **297 px structural difference**, not implementation drift.
- **MEDIUM — Evidence images will not consistently show equivalent regions.** The generator explicitly crops panels using `x0`, `y0`, width, and height at `p10.py:306–311`. The planned application screenshot uses the application width and board-origin height, which does not reproduce those crops.
- **MEDIUM — The self-test does not validate the checker’s important failure modes.** Font perturbation establishes that *something* differs, but does not prove handling of missing elements, incorrect counts, crop origins, or empty comparisons (`10-01-PLAN.md:177`).

**Suggestions**
- Distinguish full-page fixtures from isolated-component fixtures, with explicit comparison roots, scopes, and crop mappings.
- Prove the engine against representative full-page, sheet-only, and log-only panels before making it an execution dependency.
- Add negative checks for a missing required element, wrong count, and positional displacement; reject unexpected zero-match comparisons.

**Risk Assessment: HIGH.** The walk is credible, but the board engine’s foundational assumption would block multiple acceptance checks or encourage incorrect CSS changes.

## 10-02

**Summary:** The route and shared-Sheet architecture fit the codebase. The editor initialization and cancellation lifecycle need revision before implementation: valid stored drafts can crash the proposed editor, and Cancel can resurrect a deleted draft.

**Strengths**
- Mounting the editor with a resolved `versionId` and stable key respects the existing restore-once lifecycle at `app/src/ui/useKeptDraft.js:133–139`.
- Reusing `sheetView` with `baseline: null` is supported by its reading path and guarded diff construction: `app/src/ui/sheetView.js:34–60`, `80`.
- Draft persistence has a distinct repository boundary: `app/src/store/repository.js:309–324`.

**Concerns**
- **HIGH — A fitting draft is not necessarily a fully populated draft.** The plan initializes state directly from `record.payload` and restores through `setCreateDraft` (`10-02-PLAN.md:152`). Yet only `recipeId`, `versionId`, and `name` are required by `app/src/domain/draft.js:499–523`; name-only acceptance is explicitly tested at `app/src/domain/draft.test.js:574–576`. Accessing `draft.rows`, `beforeYouStart`, or later `scales` without defaults can therefore fail. Empty `portions` also fit the validator (`draft.test.js:659–661`), contrary to the projection’s one-portion assumption.
- **HIGH — Awaiting deletion does not make Cancel terminal.** `discardDraft` clears pending work but does not invalidate an outstanding restore (`useKeptDraft.js:44–49`, `139–186`). With the proposed unconditional creation persistence, a restore completing while deletion is pending queues another save; unmount flushes it at `250–259`. An isolated probe of the planned changes produced **`delete → save`**, leaving the draft present after Cancel.
- **MEDIUM — The returned promise still swallows deletion failures.** Simply adding `return` preserves `.catch(() => {})` at `useKeptDraft.js:49`; awaiting that promise cannot establish that deletion succeeded.

**Suggestions**
- Normalize accepted payloads over `blankCreateDraft` both at initialization and in `onRestoreCreate`, without narrowing the stored contract.
- Define safe handling for accepted zero-portion rows.
- Make discard a terminal lifecycle transition that prevents late restore and persistence from recreating the record.
- Add deferred-read/deferred-delete tests and a rejected-delete test.

**Risk Assessment: HIGH.** These defects affect opening and abandoning a creation, both central phase outcomes.

## 10-03

**Summary:** Name validation and duplicate-name warning behavior are well specified. The remaining gap is the lifetime of an asynchronous Start operation when the entry is cancelled or its page is left.

**Strengths**
- Reusing `recipeNameMessage` preserves the established blank-name rule and wording: `app/src/domain/recipe.js:5–14`.
- Treating a duplicate name as advisory rather than `aria-invalid` correctly separates a permitted name from missing required input (`10-03-PLAN.md:121`).
- The in-flight ref addresses duplicate activation before React rerenders, which a state-only lock would not reliably do.

**Concerns**
- **MEDIUM — Start’s completion can outlive the entry.** The specified lock blocks another Start, but does not define Cancel or navigation while `saveDraft` is pending (`10-03-PLAN.md:121`). The Start continuation always navigates after the write (`10-02-PLAN.md:154`). A maker can close the entry or leave the Notebook, then be unexpectedly taken to the editor when that write resolves.
- **LOW — Submit semantics should be explicit.** The shared `Button` defaults to `type="button"` at `app/src/ui/Button.jsx:7–8`. The plan should specify whether Start is a submit button or a click handler; tests should exercise both pointer activation and Enter through the same guarded operation.

**Suggestions**
- Define and test pending-Start behavior for entry Cancel and route departure, including delayed success and rejection.
- Use one guarded submit path and explicitly specify Start’s button type.

**Risk Assessment: MEDIUM.** The normal path is clear; the unresolved asynchronous transition can produce surprising navigation and retained drafts.

## 10-04

**Summary:** Keeping the chooser-opening handler synchronous is appropriate. The proposed cached flag does not, however, establish that import is safe at the moment of the click.

**Strengths**
- The existing guard genuinely returns before opening the file input: `app/src/ui/Shell.jsx:332–338`.
- Reusing registered page announcers matches the existing registration/release pattern at `Shell.jsx:322–327` and preserves the recipe route’s notice location at `app/src/router.jsx:79–82`.

**Concerns**
- **HIGH — Import is permitted while draft status is unknown.** The plan initializes `creationKeptRef` to `false` and fills it asynchronously (`10-04-PLAN.md:99`). On Home or another non-creation route, a click before `listDrafts` resolves opens the chooser even when a creation exists. A rejected read leaves that false value indefinitely.
- **HIGH — Route changes are not a reliable mutation notification.** The `/notebook/new` exception protects only that pathname. After a fast Start-and-leave sequence, the next route can temporarily use stale false state. The read counter prevents old results from winning; it does not make the latest result available synchronously.
- **MEDIUM — An already-started import can still commit.** `handleImportChange` awaits `file.text()` and then invokes `importStore` without another guard at `Shell.jsx:347–360`. Creation may begin during that interval.

**Suggestions**
- Represent draft status as **unknown / absent / present**; do not open the chooser until absence is established.
- Update the Shell’s guard directly when Start and Cancel settle, with route reads as reconciliation.
- Recheck before committing an asynchronous import.
- Test delayed and rejected boot reads, fast navigation after Start, and a delayed file read overlapping creation.

**Risk Assessment: HIGH.** The stated library-protection guarantee is currently false even within one tab.

## 10-05

**Summary:** The creating-only presentation changes are suitably narrow. The note-event adapter needs an explicit signature, and the proposed preservation of shared rendering behavior is otherwise well grounded.

**Strengths**
- The existing Sheet already passes note callbacks through a single `NoteList` instance: `app/src/ui/RecipeSheet.jsx:110–120`. Adding a footer and widening the edit mode avoids duplicating the section.
- Creating-only Balance visibility preserves the existing reading-mode contract. `FormulationNote` already returns nothing for zero figures at `app/src/ui/FormulationNote.jsx:8–10`.
- The new mode can preserve the existing single-component markers enforced at `app/src/ui/RecipePage.shell.test.js:198–223`.

**Concerns**
- **MEDIUM — The note callback arguments are underspecified.** The plan describes calling `updateNote(createDraft, index, text)`, but the component actually emits **`(listKey, index, text)`**, and remove emits **`(listKey, index)`**: `app/src/ui/Authored.jsx:35–37`. An adapter accepting only the described arguments would pass `"beforeYouStart"` as the index.
- **LOW — State operations should use functional updates.** The proposed captured-draft updates depart from the established operation wrapper at `app/src/ui/usePenDraft.js:41–45`, which explicitly preserves two edits in one React batch.

**Suggestions**
- Specify adapters such as `(_listKey, index, text) => setCreateDraft(prev => updateNote(prev, index, text))`.
- Drive note editing and removal through the rendered controls in integration tests, checking the actual saved payload and focus destination.

**Risk Assessment: MEDIUM.** The component changes are small, but incorrect callback adaptation would break the main authoring interaction.

## 10-06

**Summary:** The library-link draft model and dedicated creation-row rendering are appropriate. Numeric projection and focus recovery need additional boundary handling.

**Strengths**
- `rowFromLibraryRecord` embeds a cloned entry and preserves the library link: `app/src/domain/versionRow.js:71–77`.
- A flat table genuinely follows from the existing grouping behavior: unresolved portions enter the unallocated group at `app/src/ui/IngredientTable.jsx:51–55`, and that sole group suppresses step heads at `559–561`.
- A separate creation renderer avoids the false baseline strike that `GramsCell` would introduce through its comparison at `IngredientTable.jsx:160–169`.

**Concerns**
- **MEDIUM — The numeric fallback does not guarantee a finite number.** `parseGramsDraft` checks a regex and then calls `Number`, without a finite check (`app/src/domain/lineage.js:212–213`). A 309-digit numeric string returns `Infinity`; `?? 0` preserves it; `rowFromLibraryRecord` throws at `versionRow.js:48–49`. I reproduced this chain. A pasted amount can therefore crash rendering.
- **MEDIUM — Remove has no focus destination while the picker is open.** The picker replaces Add ingredient, but existing rows remain removable (`10-06-PLAN.md:125`, `157`). The remove handler’s Add ingredient ref is then absent. Picker Cancel also needs focus restoration after the replacement control mounts, not immediately before that render.

**Suggestions**
- Check finiteness at the creation boundary and keep projection and error-message validity consistent.
- Add a large-number paste case.
- Specify focus after removing a row with the picker open, and perform focus restoration after the relevant control mounts.

**Risk Assessment: MEDIUM.** The ordinary flow is sound; these are bounded but real crash and keyboard-recovery cases.

## 10-07

**Summary:** Sharing the pen’s messages is a good choice. The planned test does not exercise the event that clears those messages, and the cropped table panels cannot use the stated whole-page coordinate comparison.

**Strengths**
- Extracting the two messages from `findBlockedRow` keeps validation wording centralized: `app/src/domain/lineage.js:234–247`.
- Per-row IDs are necessary because the existing table deliberately supports only one blocked error ID at `app/src/ui/IngredientTable.jsx:12–14`, `745`, `791`.

**Concerns**
- **MEDIUM — The test’s simulated typing does not trigger the specified implementation.** The implementation clears messages in the input’s change handler (`10-07-PLAN.md:103`), while the test merely rerenders with a new `gramsByRow` and expects clearing (`:105`). Rerendering controlled props does not dispatch `onChange`.
- **HIGH — The remove-panel position assertion has an incompatible reference frame.** The plan says `eC1/eC2` compare “as in a full panel” (`:130`). They are generated with `sheet_only`, omitting the shell and band: `.planning/canvas-generators/p10.py:370–381`. Their table positions are 297 px above the otherwise equivalent full-page panel.

**Suggestions**
- Use a state-holding test harness and dispatch actual input and blur events.
- Make cropped-panel comparisons component-relative, with the same component scope on both sides.
- Preserve the guard against changing unrelated CSS merely to satisfy a failing measurement.

**Risk Assessment: HIGH as written.** The behavioral work is manageable, but the acceptance comparison cannot pass faithfully.

## 10-08

**Summary:** Style application, clearing, and signed-temperature handling mostly match existing contracts. The same-style reapplication promise is not delivered by the proposed native-select event path.

**Strengths**
- Catalog ordering already has a single boundary at `app/src/store/catalog.js:22–35`.
- The approved sparse bands and temperature defaults exist in `app/src/data/styles.js:18–67`; replacing rather than merging prevents old dairy bands surviving a Sorbet selection.
- Reusing `readSignedInput` on both input and change events addresses the browser’s empty-value/bad-input distinction: `app/src/ui/BatchRow.jsx:74–95`, `124–144`.

**Concerns**
- **MEDIUM — Reselecting the current style does not normally fire `change`.** `10-08-PLAN.md:34` promises that selecting the already-selected style reapplies defaults, but `:130` specifies ordinary select-change handling. A WebKit probe confirmed that reopening and confirming the same option emitted no change. Playwright’s `selectOption` did emit one, so automation could falsely validate this behavior.
- **MEDIUM — Band parsing also needs an explicit finite check.** The shared parser can return `Infinity` (`app/src/domain/lineage.js:212–213`). Two infinite ends satisfy `low <= high`, violating D-08b and allowing invalid bands into `buildFigures`, which trusts supplied bands at `app/src/domain/figures.js:151–156`.

**Suggestions**
- Reconcile same-style reapplication with the approved native-select interaction; verify it through real keyboard/touch behavior rather than only `selectOption` or repeated pure-function calls.
- Require `Number.isFinite` for both parsed band ends and test numeric overflow.
- Apply the appropriate component-relative measurement scope to isolated Style panels.

**Risk Assessment: MEDIUM.** The data transformations are straightforward; event semantics and numeric boundaries need correction.

## 10-09

**Summary:** The scale-definition model and keyed radio groups are correct. The acceptance board contains the exact radio-group defect the implementation is meant to fix, creating contradictory acceptance criteria.

**Strengths**
- `mintScaleKey` provides the intended stable namespace at `app/src/domain/catalog.js:66–76`.
- Adding optional `name` and `clearable` props addresses concrete existing behavior: `Segmented` derives its radio name from the label and always offers Clear after selection (`app/src/ui/Segmented.jsx:28–30`, `45–65`).
- The stored limits and kinds already have shared definitions at `app/src/domain/catalog.js:18–23`.

**Concerns**
- **HIGH — Correct independent selections fail the board’s checked-count oracle.** The board generator gives both scale cards the same `"Kind"` radio name (`.planning/canvas-generators/p10.py:174–179`, `231–235`, `400–408`). In WebKit, `sC1` and `sC2` each have only **one** checked radio, despite two checked attributes in the HTML. The planned selector `.segmented__option input:checked` therefore expects one, while the correct implementation needs two (`10-09-PLAN.md:193`).
- **MEDIUM — Card context is not exposed accessibly.** The proposed cards are plain `div`s with repeated “Name”, “Low end”, “High end”, and “Kind” labels (`:133`). Unique native radio names prevent interference but do not tell a screen-reader user which scale or problem they are editing.
- **MEDIUM — Isolated Scales markup has different structural styling.** Scales is the first region in these boards but follows Style in the app. The first-child rule removes its top border and padding (`p10.py:33–35`), so translating coordinates alone cannot establish equivalence.

**Suggestions**
- Correct or explicitly reconcile the board’s radio grouping before using its checked state as an oracle.
- Give each card an accessible group name tied to “Scale n” or “Problem n”.
- Test removing a card at the two-item limit and focus the reappearing Add control after commit.
- Compare isolated regions in a fixture with equivalent ancestry and sibling context.

**Risk Assessment: HIGH.** The implementation contract is sensible, but the current acceptance fixture would reward incorrect behavior.

## 10-10

**Summary:** A final integrated creation walk is necessary and valuable. Its page-height assertions are internally incompatible, and the device instructions do not specify the route required to reach Resume.

**Strengths**
- Comparing stored records before and after the creation flow directly supports the draft-only boundary. The existing dump method reads the four stores together and sorts them deterministically: `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs:189–223`.
- The pending human check is explicitly recorded as open rather than presented as completed device verification (`10-10-PLAN.md:175–185`).

**Concerns**
- **HIGH — The full application cannot have both required heights for the same state.** The plan gives `eB1` and `eC1` the same draft and checks document height against both (`10-10-PLAN.md:110`). WebKit measured `eB1` at **1824.97 px** and `eC1` at **1527.97 px** because `eC1` omits the shell and band, as generated at `.planning/canvas-generators/p10.py:365–381`. Fixing application CSS cannot satisfy both faithfully.
- **MEDIUM — The device row’s reopen instruction is ambiguous.** Step 9 says “Open the address again” and expects the Notebook (`10-10-PLAN.md:181`). The printed preview address opens `/`; reopening `/notebook/new` opens the editor. The automated script explicitly goes to `/notebook`, so the human and automated procedures differ.
- **MEDIUM — Repeated clicking weakens reachability evidence.** The requested click-until-success pattern can conceal a lost first activation. The inherited helper explicitly retries up to four times at `09-walk.mjs:230–239`; that is unsuitable as sole evidence that each device step works on its first tap.

**Suggestions**
- Restrict document-height equality to actual full-page panels; compare cropped regions by appropriate bounds.
- Specify `/notebook` in the human reopen step.
- Wait for a meaningful ready state, then assert one activation reaches the expected result.
- Keep “automated verification passed” and “iPad verification pending” distinct in completion records.

**Risk Assessment: HIGH.** The final acceptance gate currently contains impossible and non-equivalent checks.

## 10-11

**Summary:** The draft row and page-notice design fit existing patterns. Persistence during an unfinished restore remains uncovered, and the documented multiple-draft fallback contradicts the single-draft cancellation outcome.

**Strengths**
- The existing hook genuinely wires pagehide, hidden-tab, and unmount flushing: `app/src/ui/useKeptDraft.js:250–259`.
- Page-level announcement timing has a working precedent at `app/src/router.jsx:52–60`.
- Keeping drafts outside the recipe count aligns with the Notebook’s existing recipe-derived list at `app/src/ui/NotebookPlace.jsx:58–73`.

**Concerns**
- **HIGH — Edits can be lost outside the stated 250 ms window.** Persistence returns while `draftRestoreDone` is false (`useKeptDraft.js:195–196`). The planned editor is already editable from the wrapper’s payload, but its second `getDraft` may still be pending. I reproduced typing, waiting **350 ms**, and unmounting before that read resolved: **zero saves**, with the old description retained. The proposed tests exercise leaving inside the debounce after restore, not leaving during restore.
- **MEDIUM — “Newest draft” is selection, not single-draft enforcement.** The repository stores drafts independently by `versionId` (`app/src/store/db.js:58–62`). The plan explicitly permits two Starts in two tabs and deletes only the displayed draft (`10-11-PLAN.md:32`). After Cancel, the older draft reappears, contradicting the expected no-draft row/New recipe state.

**Suggestions**
- Test editing and leaving while the restore read is deferred. Either delay interaction until restoration settles or ensure those edits enter a flushable pending record immediately.
- Establish an explicit singleton policy, or obtain a decision that narrows the guarantee. Do not describe `newestDraft` as enforcing one creation.
- Keep browser-close persistence claims qualified by the existing hook’s best-effort comment at `useKeptDraft.js:245–249`.

**Risk Assessment: HIGH.** Resume and abandonment are core requirements, and the uncovered lifecycle permits lost or resurfacing work.

## 10-12

**Summary:** Search reuse and display-field handling are well grounded. The proposed acceptance work needs production-library coverage and a measurement scope appropriate to the isolated picker boards.

**Strengths**
- Reusing `filterLibrary` preserves deterministic matching and ordering, including category type guards: `app/src/domain/ingredientSearch.js:15–41`.
- Reusing `summaryText` avoids a second formatting implementation: `app/src/ui/IngredientsPlace.jsx:85–94`.
- Explicitly ignoring activation on Added rows is necessary because `aria-disabled` alone does not disable a button (`10-12-PLAN.md:102`).

**Concerns**
- **MEDIUM — The detailed picker checks only use the 26-entry fixture.** Production seeding merges the larger dataset with the original library at `app/src/store/seed.js:6–12`, `36–37`. The proposed unit tests and board checks mainly cover the original entries (`10-12-PLAN.md:104` and Task 2), leaving new categories, longer names, scrolling, and selection of newly seeded entries insufficiently exercised.
- **HIGH — Picker panels also omit the surrounding application.** They are generated through `sheet_only` at `.planning/canvas-generators/p10.py:379–394`. Their absolute positions cannot match the full editor document as specified.
- **MEDIUM — Broad selectors include unrelated controls.** The after-pick spec compares `.mk-add` across the application, but its board contains only the Sheet. The finished editor also contains Add scale and Add problem, producing different counts and content.

**Suggestions**
- Retain the original-library fixture for visual comparison, and add a production-library integration pass at 393 and 1366.
- Exercise at least one new entry, a long name/summary, category filtering, scrolling, Added, and re-adding after removal.
- Scope Sheet assertions under `.notebook-body__sheet` and use component-relative bounds and matching screenshot crops.

**Risk Assessment: HIGH as written.** The feature logic is modest, but the mandatory visual comparison is not currently achievable without changing the checker or fixture.

## Overall assessment

**Recommendation: revise before execution. Overall risk: HIGH.**

All **12/12 plans** are covered. Requirement allocation is broadly complete, and the shared-editor, pure-domain, repository-seam, and draft-only choices are supported by the source. The principal risks are concentrated in a few mechanisms:

| Priority | Required revision | Affected plans |
|---|---|---|
| 1 | Make the board checker distinguish full pages from isolated components; reconcile the radio-state fixture defect | 10-01, 10-07, 10-08, 10-09, 10-10, 10-12 |
| 2 | Normalize accepted drafts and make Cancel terminal against outstanding restore/persist work | 10-02, 10-11 |
| 3 | Make import refusal reliable while draft status is loading and while import itself is asynchronous | 10-04 |
| 4 | Cover finite-number boundaries, pending Start, real input events, and native-select behavior | 10-03, 10-06, 10-07, 10-08 |
| 5 | Resolve the difference between displaying one draft and enforcing one draft | 10-11 |

The evidence warrants targeted revisions, not a wholesale architectural rewrite. In particular, the instruction to “fix the build until every comparison passes” should not proceed while the comparison itself demands contradictory geometry or browser state.

**Before execution, which evidence governs when a frozen board’s DOM behavior contradicts the accepted interaction contract?**

---

## OpenCode Review (opencode-argon)

## 10-01

### 1. Summary
Plan `10-01` establishes the two verification harnesses for Phase 10 before any `app/` code is modified: (1) a strict WebKit walk (`10-walk.mjs`, `10-walk-record-base.sh`, `10-walk-check.sh`, and `10-walk-before.json`) recorded from a detached worktree at `BASE=ec44fa72` with all Phase 9 store-diff allowances stripped (`D-11`), and (2) a side-by-side WebKit board comparison engine (`10-board-check.mjs`) self-tested against Sketch 012's Notebook board (`10-board-012.mjs`).

### 2. Strengths
- **Byte-identical walk recording body:** The acceptance check slices `09-walk.mjs` and `10-walk.mjs` from `// playwright-core: the one place` (`09-walk.mjs:69`) through the `RECORDED` log line (`09-walk.mjs:857`), proving the 12 scenarios and 94 snapshots are unchanged while `ALLOWED_STORE_PATHS`, `REQUIRED_STORE_FIELDS`, and the seven `app/src/data` / `app/src/domain` imports (`09-walk.mjs:61-67`) are removed.
- **Worktree-isolated scratch builds:** `10-walk-check.sh` keys `SCRATCH` by `walk-$(basename "$(pwd)")` under `$TMPDIR/sprinkles-10`, preventing parallel executor worktrees from clobbering each other's build output or touching `app/dist`.
- **Negative self-tests on both harnesses:** `10-walk.mjs selftest` verifies three doctored failure modes (store leaf mutation, snapshot `pageStatus` mutation, added store key), and `10-board-check.mjs --selftest` injects a `font-size: 1px !important` perturbation to verify the engine cannot pass vacuously.

### 3. Concerns
- **[HIGH] `10-board-check.mjs` assumes every board panel's origin is the full document, which breaks on cropped `sheet_only` and `log_only` panels in Plans `10-07`, `10-08`, `10-09`, `10-10`, and `10-12`:**
  - *Evidence:* In `.planning/canvas-generators/p10.py:363-367`, full editor panels (`eA1`, `eB1`) wrap `page_html(...)` inside `shell_main(...)` (which includes `<div class="shell">`, `<header class="shell__head">`, and `<header class="notebook-band">`). However, `sheet_only` (`p10.py:370-373`, used for `eC1`, `eC2` in `creation-editor.html`, `kA1..kC4` in `ingredient-picker.html`, and `tA2, tB2, tC2, tD5` in `style-menu-and-bands.html`) and `log_only` (`p10.py:374-375`, used for `tA1..tG1` in `style-menu-and-bands.html` and `sA1..sD2` in `scales-and-problems.html`) emit `<div class="notebook mk-page"><div class="notebook-body">...` **without** `<div class="shell">` and **without** `<header class="notebook-band">`. Furthermore, `P10_Scales` (`p10.py:399-409`, `scales-and-problems.html:6221`) emits only `Scales` and `Problems` inside `<aside class="notebook-log">` (omitting `Style` above `Scales`, and making `Scales` match `.mk-region:first-child { border-top: none; padding-top: 0 }`) and leaves `<div class="notebook-body__sheet"></div>` empty at `393`.
  - *Impact:* Task 3 defines `box` as comparing "the board's relative to its page origin [first child of `.p4-win.<id>`] and the app's relative to the document (rect plus scroll)". Because `10-board-012.mjs` only tests full-page panels (`pn1`, `pn2`), `10-01` will pass, but every cropped panel in `10-07`, `10-08`, `10-09`, and `10-12` will have a ~297 px (or larger at 393) `y`-offset mismatch between the board and the built app, and `pageHeight: true` on `eC1`/`eC2` (`p10-measure.json:14-15`: `1528` vs `1825` on `eB1`) will fail by 297 px in `10-10`.
- **[MEDIUM] Copying `useOriginalLibrary` verbatim from `09-places-check.mjs:109-133` will time out on `/notebook/new`:**
  - *Evidence:* `09-places-check.mjs:131` hardcodes `await page.waitForSelector('.place__title');` after `page.reload()`. Task 3 instructs the executor to "copy useOriginalLibrary from 09-places-check.mjs".
  - *Impact:* On `/notebook/new` (`10-board-picker.mjs` in Plan `10-12`, which uses `library: 'original'` and `route: '/notebook/new'`), there is no `.place__title` element, so `useOriginalLibrary` will hang until timeout. Additionally, if `10-board-check.mjs` navigates to `/notebook/new` before seeding the `draft` into IndexedDB, `CreationRoute` (`D-02`) will immediately redirect the page to `/notebook`, so a subsequent `page.reload()` would stay on `/notebook` unless `page.goto(servers.appUrl + panel.route)` is called after seeding IndexedDB.

### 4. Suggestions
- In `10-board-check.mjs`, compute `box` relative to a common anchor element when the board panel does not contain `.shell`:
  - If the board panel's first child contains `.shell` (e.g., `pn1`, `pn2`, `nA1..nE1`, `eA1`, `eB1`), use the board's first child and the app's document origin (and compare `pageHeight` against `document.documentElement.scrollHeight`).
  - If the board panel's first child has no `.shell` (cropped `sheet_only` / `log_only` panels), allow an optional `origin` selector on the panel (or auto-anchor to `.notebook-body__sheet` for `sheet_only` panels, `.mk-region[aria-label="Style"]` for `P10_Style` log panels, and `.mk-region[aria-label="Scales"] .batch-row__head` for `P10_Scales` panels — anchoring at `.batch-row__head` avoids the 16 px `padding-top` difference caused by `Scales` being `:first-child` in `scales-and-problems.html` vs second child after `Style` in the app), and for `pageHeight` on `sheet_only` panels (`eC1`, `eC2`), compare the board wrapper's height (`1528`) against `.notebook-body`'s bounding rect height in the app.
- In `10-board-check.mjs`, replace `await page.waitForSelector('.place__title')` inside `useOriginalLibrary` with `await page.waitForSelector('.shell')`, and seed `library` and `draft` into IndexedDB before calling `await page.goto(servers.appUrl + panel.route, { waitUntil: 'networkidle' })`.
- When loading `/notebook/new` with a seeded `draft` in `10-board-check.mjs`, suppress or clear `.page-status` (or seed `history.replaceState({ usr: { started: true } }, '')`) before taking `--evidence` screenshots so the 5-second `"Draft kept. Cancel discards it."` banner added in `10-11` does not cover the top-left of `.notebook-band` in the `-app.png` evidence images.

### 5. Risk Assessment
- **Risk Level:** MEDIUM
- **Justification:** No application code is touched, and the walk harness design is sound, but `10-board-check.mjs` needs coordinate-origin handling for cropped panels and a selector fix in `useOriginalLibrary` so downstream board specs (`10-07` through `10-12`) do not hit harness bugs.

---

## 10-02

### 1. Summary
Plan `10-02` wires the end-to-end creation spine: `NOTEBOOK_PLACE_PATH` and `NEW_RECIPE_PATH` in `notebookPaths.js`, the `/notebook/new` route in `router.jsx` above `/notebook/:recipeId`, `CreationRoute.jsx` (which finds the newest valid `create` draft or silently replace-redirects to `/notebook`), `CreationPage.jsx` (rendering the band, ceremony form without Save, and `RecipeSheet` in `creating` mode), `domain/creation.js` (`UNTITLED`, `creationTitle`, `creationSheetVersion`), the `New recipe` entry and `Start` action in `NotebookPlace.jsx`, and the `D-04a` change in `useKeptDraft.js` so a started creation remains kept until `Cancel`.

### 2. Strengths
- **Respects every `RecipePage.shell.test.js` and `RecipePage.test.jsx` pin:**
  - In `useKeptDraft.js:3, 49, 199-207`, dropping `if (isCreateDraftDirty(createDraft))` and removing `isCreateDraftDirty` from the line 3 import satisfies `unusedImports` (`RecipePage.shell.test.js:83-92, 489-491`) and preserves the exact call-site counts in `RecipePage.shell.test.js:264-279` (`repository.deleteDraft(versionId)` ×3, `buildDraftRecord(` ×3, `kind: 'create'` ×1).
  - Returning the promise from `discardDraft()` (`return Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});` at `useKeptDraft.js:49`) keeps `function discardDraft(` at 1 (`RecipePage.shell.test.js:252`) and `writerDeclaresNoEffect` true (`RecipePage.shell.test.js:581-592`).
  - Adding `{ path: '/notebook/new', Component: CreationRoute }` at `router.jsx:115` preserves the index ordering of `className="page-status-anchor"`, `<PageStatus`, and `<RecipePage` (`RecipePage.test.jsx:946-954`) and the exact route regexes (`RecipePage.test.jsx:967-990`).
- **Prevents the Cancel vs. `listDrafts` race (`Pitfall 6`):** Having `Cancel` `await writer.discardDraft()` before navigating to `/notebook` guarantees the draft is deleted in IndexedDB before `NotebookPlace` mounts and calls `repository.listDrafts()`.

### 3. Concerns
- **[MEDIUM] Updating `useKeptDraft.test.jsx:494-508` and `564-587` requires advancing fake timers and updating the mocked second-visit read:**
  - *Evidence:* `useKeptDraft.test.jsx:404` installs `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })` for the entire `describe('a create draft is kept through the same hook with no version (D-18)')` block. In the existing tests at `494-508` and `564-587`, the old delete branch (`useKeptDraft.js:233`) ran immediately in a microtask without a 250 ms timer, so neither test called `vi.advanceTimersByTime(250)`. Furthermore, line `582` (`repo.getDraft.mockResolvedValue(null);`) explicitly mocked an empty store for the second visit.
  - *Impact:* When `useKeptDraft.js` switches to overwriting via the 250 ms debounce (`useKeptDraft.js:239`), `repo.saveDraft` will not have been called in `564-587` until `vi.advanceTimersByTime(250)` runs, and the "next-visit half restores the cleared draft" instruction in Task 2 will fail if `repo.getDraft` is still mocked to resolve `null` at line `582` instead of the saved cleared record.
- **[LOW] `useKeptDraft.test.jsx:435-444` ("deletes a stored create draft that does not fit and restores nothing") queues a pending draft when `draftRestoreDone` turns `true`:**
  - *Evidence:* At `useKeptDraft.js:145-148`, when an unfit `create` record is deleted, `setDraftRestoreDone(true)` is called. With `D-04a` unconditional persistence in `useKeptDraft.js:199-206`, `draftRestoreDone === true` schedules a 250 ms timer for `createDraft`, which `afterEach`'s `unmountCurrent()` (`useKeptDraft.test.jsx:486`) flushes via `flushPendingDraft()`.
  - *Impact:* While `435-444` only asserts `expect(repo.deleteDraft).toHaveBeenCalledTimes(1)` before `afterEach`, note that in production `CreationRoute` (`10-02` Task 1) filters `records.filter(draftMatchesCreate)` before mounting `CreationPage`, so `CreationPage` is never mounted on an unfit draft.

### 4. Suggestions
- In `10-02` Task 2's instructions for `useKeptDraft.test.jsx:564-587`, explicitly note that after `await resolveStored()` the test must advance timers by 250 ms (`await act(async () => { vi.advanceTimersByTime(250); }); await flush();`) to assert `repo.saveDraft` was called with the cleared payload, and then pass that saved record to `repo.getDraft.mockResolvedValue(saved)` at line `582` so the second mount restores the cleared draft.

### 5. Risk Assessment
- **Risk Level:** LOW
- **Justification:** All source-text pins, hook-order constraints, and repository boundaries were verified against the actual test files and hold cleanly.

---

## 10-03

### 1. Summary
Plan `10-03` completes the Notebook's `New recipe` entry (`MAKE-04`, `D-08c`, `D-13`, `T-02`): it adds `RECIPE_NAME_TAKEN` and `recipeNameTaken` to `app/src/domain/recipe.js`, wires the blank-name error (`Enter a recipe name.`), the non-blocking same-name warning (`Another recipe already has this name. You can still use it.`), and an in-flight `Start` guard in `NotebookPlace.jsx`, ports the `.place .nb__*` CSS rules into `app/src/styles/shell.css`, and verifies all 9 target panels of `notebook-new-recipe.html` in WebKit via `10-board-notebook.mjs`.

### 2. Strengths
- **Complies with every `shell.test.js` CSS contract pin:**
  - All new selectors in `shell.css` are prefixed with `.place .nb__...` (`shell.test.js:69-80`).
  - The 759.98 px stacking rules (`.place .nb__draft` and `.place .nb__draft-act`) are placed inside the existing `@media (max-width: 759.98px)` block (`shell.css:684`), preserving the exact 5 `@media` block count (`shell.test.js:141-152`) and the rule that every selector under the places' media blocks starts with `.place ` and names an `.nb__` or `.ing__` class (`shell.test.js:100-110`).
  - None of the new rules declares `border-radius`, preserving the exact 10-selector radius allow-list (`shell.test.js:412-425`).
- **Clean separation of error vs. warning accessibility semantics:** `aria-invalid="true"` is set only when `RECIPE_NAME_REQUIRED` is active, whereas `RECIPE_NAME_TAKEN` links via `aria-describedby="nb-new-name-error"` without setting `aria-invalid` or blocking `Start`.

### 3. Concerns
- **[LOW] Focus state on `.nb__new .ink-field` after clicking `New recipe` in `10-board-notebook.mjs` panels `nB1` and `nB2`:**
  - *Evidence:* In `10-02` Task 1, clicking `New recipe` moves focus to the `Name` input. In `10-03` Task 2, `10-board-notebook.mjs` drives `nB1` and `nB2` with the step "click New recipe" and checks `.nb__new .ink-field` `[box, font, color, border]`.
  - *Impact:* Because `border` only checks `border-top` width, style, and color (and not `outline`), and `.ink-field:focus` in `app.css` uses `outline` rather than changing `border`, the `border` check will pass; however, for `--evidence` screenshots in `10-10` (just like `09-places-check.mjs:554` does with `document.activeElement?.blur()`), blurring before taking the screenshot on `nB1`, `nB2`, `nC1`, `nC2` will match the static board's unfocused rendering.

### 4. Suggestions
- In `10-board-notebook.mjs` (or in `10-board-check.mjs` when no `focus` check is requested on the panel), blur `document.activeElement` after running `steps` on panels `nB1`, `nB2`, `nC1`, `nC2`, and `nD1` so the `--evidence` screenshots match the board's at-rest (unfocused) rendering.

### 5. Risk Assessment
- **Risk Level:** LOW
- **Justification:** Pure domain helper, small UI state additions, and well-scoped `shell.css` rules that fit every existing style test constraint.

---

## 10-04

### 1. Summary
Plan `10-04` implements `D-10` and `D-10a`: while a `create` draft is kept, clicking `Import` (in the header tools or under `More`) on any route synchronously refuses to open the file chooser and announces `CREATION_IMPORT_BLOCKED_STATUS` (`'Cancel the new recipe draft before importing.'`) in the current page's `.page-status` notice (or in a Shell-owned fallback `PageNotice` on routes that do not own one).

### 2. Strengths
- **Preserves synchronous `chooseImportFile` execution (`Shell.jsx:332-338`):** By maintaining `creationKeptRef.current` in `Shell` and checking `creationKeptRef.current || pathname === NEW_RECIPE_PATH`, `chooseImportFile` remains a synchronous click handler so iOS/iPadOS WebKit user-activation gestures for `fileInputRef.current?.click()` are never lost across an `await`.
- **Single `.page-status` invariant preserved across all routes:** `RecipePageForRoute` (`router.jsx:35-85`), `NotebookPlace`, and `CreationPage` register their announcer via `PageNoticeContext`, suppressing `Shell`'s `{!routeOwnsNotice && <PageNotice message={shellNotice} />}` fallback so recipe routes keep their `.page-status` first in the DOM (`09-walk.mjs:137-228`, `RecipePage.test.jsx:946-954`).
- **Safe against bare `repository: {}` mocks (`Shell.test.jsx:15`, `Shell.flyout.test.jsx:17`):** Wrapping `Promise.resolve().then(() => repository.listDrafts()).catch(() => {})` prevents synchronous `TypeError: repository.listDrafts is not a function` when `repository` is mocked as `{}`.

### 3. Concerns
- **[MEDIUM] Brief asynchronous window after `Cancel` (or after an unfit draft is auto-deleted on restore) where `creationKeptRef.current` remains `true` until `listDrafts()` resolves:**
  - *Evidence:* In Task 1, `Shell` updates `creationKeptRef.current` inside a `useEffect(..., [pathname])` via `Promise.resolve().then(() => repository.listDrafts())`. While the user is on `/notebook/new`, `creationKeptRef.current` becomes `true`. When the user presses `Cancel` on `/notebook/new`, `Cancel` awaits `deleteDraft` and navigates to `/notebook` with `{ replace: true, state: { discarded: true } }`. During the first render and commit at `/notebook` (before the async `listDrafts()` promise resolves), `creationKeptRef.current` is still `true` from the previous route. Similarly, if `CreationPage` ever deleted an unfit draft on restore without changing `pathname`, the `[pathname]` effect would not re-run.
  - *Impact:* If a test or rapid click triggers `Import` on `/notebook` in the tick immediately after `Cancel` navigates (before `listDrafts()` settles), `creationKeptRef.current` would still be `true` unless cleared synchronously when `location.state?.discarded` is present (or when `pathname` changes away from `NEW_RECIPE_PATH` with `state?.discarded`).

### 4. Suggestions
- In `Shell.jsx`, read `const { pathname, state } = useLocation();` (instead of only `{ pathname }`): if `state?.discarded` is truthy, synchronously set `creationKeptRef.current = false` before the async `listDrafts()` effect settles. This closes the post-Cancel microtask window and satisfies `D-10a` ("on every create-draft write or delete") with zero extra context plumbing.

### 5. Risk Assessment
- **Risk Level:** LOW
- **Justification:** The `PageNoticeContext` registration pattern cleanly mirrors the existing `ImportGuardContext` in `Shell.jsx:322-327` and `router.jsx:66-69`, and Task 1 runs `10-walk-check.sh` immediately to prove zero impact on the 94-snapshot walk.

---

## 10-05

### 1. Summary
Plan `10-05` adds the `creating` mode behavior for the upper half of `RecipeSheet` (`MAKE-05`, `MAKE-08`, `T-01`, `D-08a`): pure note operations (`addNote`, `updateNote`, `removeNote`) in `domain/creation.js`, editable `Before you start` notes in `Authored.jsx` (`NoteList`) with an `Add note` control via `beforeFoot` in `RecipeSheet.jsx`, omitting empty `.headnote__prose` in `Headnote.jsx` while `creating`, hiding `.side-region` while `creating` until `view.figures.length > 0`, taking `FormulationNote` rules out of the Tab order (`tabIndex = -1`) while `creating`, porting the `.mk-add` and `.mk-page` rules into `notebook.css`, and verifying `creation-editor.html` panels `eA1` and `eB1` in `10-board-editor.mjs`.

### 2. Strengths
- **Surgical edits to `RecipeSheet.jsx` preserve all source-text pins:**
  - `RecipePage.test.jsx:1159-1192` pins `showsMethodRegion({ mode, steps: methodSteps })`, `{methodRegionShown && (<section className="method-region"`, `{beforeRegionShown && (<section className="before-region" aria-label="Before you start"`, and `'recipe-page' + (beforeRegionShown ? '' : ' recipe-page--no-before') + (methodRegionShown ? '' : ' recipe-page--no-method')`. Changing only line 88 (`const beforeRegionShown = mode === 'developing' || mode === 'creating' || beforeNotes.length > 0;`) and adding `{beforeFoot}` at the end of `<section className="before-region">` keeps every pin intact.
  - `RecipeSheet.test.jsx:68` (which checks `formulation-note-region` on an empty Sheet in `reading` mode) stays green because `mode !== 'creating' || view.figures.length > 0` gates `.side-region` only in `creating` mode.

### 3. Concerns
- **[MEDIUM] Parameter signature mismatch between `NoteList` (`Authored.jsx:35, 37`) and the `onChangePenNoteText` / `onRemovePenNote` description in Task 1:**
  - *Evidence:* In `app/src/ui/Authored.jsx:35` and `37`, `NoteList` invokes its callbacks with `listKey` (`"beforeYouStart"`) as the **first** argument:
    - `onChange={(event) => onChangeNoteText(listKey, index, event.target.value)}` (`Authored.jsx:35`)
    - `onClick={() => onRemoveNote(listKey, index)}` (`Authored.jsx:37`)
    However, `10-05-PLAN.md` Task 1 (line 119) states:
    > "In app/src/ui/CreationPage.jsx pass RecipeSheet onChangePenNoteText (calls setCreateDraft(updateNote(createDraft, index, text))), onRemovePenNote (removeNote, then focus Add note)"
  - *Impact:* If the executor writes `(index, text) => setCreateDraft(updateNote(createDraft, index, text))` and `(index) => ...` without the leading `_listKey` parameter, `index` will receive `'beforeYouStart'` and `updateNote`/`removeNote` will throw `RangeError` on every edit or remove.

### 4. Suggestions
- In `10-05` Task 1, explicitly specify the callback signatures in `CreationPage.jsx` as `(_listKey, index, text) => setCreateDraft(updateNote(createDraft, index, text))` and `(_listKey, index) => { setCreateDraft(removeNote(createDraft, index)); ... }` to match `Authored.jsx:35, 37`.

### 5. Risk Assessment
- **Risk Level:** LOW
- **Justification:** Once the leading `_listKey` parameter from `NoteList` is accounted for, the `RecipeSheet`, `Headnote`, `FormulationNote`, and `notebook.css` changes are small, additive, and well-tested.

---

## 10-06

### 1. Summary
Plan `10-06` connects the ingredient library to the creation editor (`MAKE-06`, `D-05`, `D-07`, `D-08`, `T-01`): it adds pure row helpers (`addRow`, `setRowGrams`, `removeRow`) to `domain/creation.js`, creates the initial `IngredientPicker.jsx` (list and Cancel), adds `creationRows` and `ingredientsFoot` props to `RecipeSheet.jsx` and `renderCreatingEntry` to `IngredientTable.jsx` (flat table, raw grams input, `.mk-focus` landing class, outright `remove` control, live share), and loads `repository.listLibrary()` once in `CreationPage.jsx` to share between the picker and `creationSheetVersion`.

### 2. Strengths
- **Single `<IngredientTable` element preserved in `RecipeSheet.jsx`:** Passing `creationRows={creationRows}` into the existing `<IngredientTable` tag satisfies `RecipePage.shell.test.js:206` (`['<IngredientTable', 1]`) and `223` (`allow: ['react', './']`).
- **Automatic flat table without duplicating grouping logic:** Because `creationSheetVersion` sets `method: []` and `addRow` sets `portions: [{ step: 1, grams: '' }]`, `groupPortionsByStep` (`IngredientTable.jsx:36-79`) places all rows into the single `unallocated` group and `showStepHeads` (`IngredientTable.jsx:561`) evaluates to `false`, producing a single `<tbody>` with no `.ingredient-table__step-head` (`D-05`).
- **Avoids false struck baselines on empty or edited grams (`T-01`, `Pitfall 8`):** By rendering a dedicated `renderCreatingEntry` branch in `IngredientTable.jsx` that reads raw string values from `creationRows.gramsByRow.get(row.id)` and numeric shares from the projected `rowFromLibraryRecord` rows (`parseGramsDraft(raw) ?? 0`), the table never runs `GramsCell`'s `draftPortion.grams !== String(portion.grams)` comparison (`IngredientTable.jsx:160`) and never renders `.struck-value`.

### 3. Concerns
- **[LOW] `isDeveloping` vs. `isCreating` table class and total calculation in `IngredientTable.jsx`:**
  - *Evidence:* In `IngredientTable.jsx:512`, `const isDeveloping = mode === 'developing' && draftVersion != null;`, and at line `821`:
    `className={`ingredient-table${hasAsMadeLayer ? ' ingredient-table--as-made' : ''}${isDeveloping ? ' is-developing' : ''}`}`
    Task 1 notes: "The table's class adds is-developing while creating as well (the board's markup)."
  - *Impact:* If the executor widened `isDeveloping` itself to `mode === 'developing' || mode === 'creating'`, lines `518-522` (`activeRows(draftVersion)` where `draftVersion` is `null` in `creating` mode!) would throw `TypeError: Cannot read properties of null (reading 'rows')`. Keep `isDeveloping` strictly for `mode === 'developing' && draftVersion != null`, define a separate `const isCreating = mode === 'creating' && creationRows != null;`, and only include `isCreating` in the `<table className=...>` expression at line `821` (`${isDeveloping || isCreating ? ' is-developing' : ''}`).

### 4. Suggestions
- In `10-06` Task 1, explicitly state that `isCreating = mode === 'creating' && creationRows != null` must be a separate boolean from `isDeveloping` in `IngredientTable.jsx` so `draftVersion` reads at lines `518-522, 559, 877` remain gated on `isDeveloping` alone while line `821` uses `isDeveloping || isCreating` for the `is-developing` CSS class.

### 5. Risk Assessment
- **Risk Level:** LOW
- **Justification:** The data flow from `createDraft.rows` + `libraryById` through `creationSheetVersion` into `sheetView` and `IngredientTable` is clean and backed by existing domain primitives (`rowFromLibraryRecord`, `parseGramsDraft`).

---

## 10-07

### 1. Summary
Plan `10-07` implements blur-timed per-row grams validation messages (`D-08`, `MAKE-06`) and expands `10-board-editor.mjs` to check the creation table and row removal (`eA1`, `eB1`, `eC1`, `eC2`): it extracts `gramsDraftMessage(ingredientName, raw)` in `app/src/domain/lineage.js` (shared by `findBlockedRow` and `IngredientTable`), tracks per-row blur messages in `IngredientTable.jsx` with unique error IDs (`create-grams-error-${row.id}`) and `.is-marked` row outlines, tests them in `IngredientTable.creating.test.jsx`, and runs `10-board-editor.mjs` in WebKit.

### 2. Strengths
- **Single source of truth for grams validation sentences:** Extracting `gramsDraftMessage(ingredientName, raw)` in `app/src/domain/lineage.js:234-251` ensures `findBlockedRow` (used by the version pen's save gate) and `renderCreatingEntry` (used by creation's on-blur feedback) can never drift in wording or parsing (`parseGramsDraft`).
- **Zero file overlap with Wave 6 sibling Plan `10-12`:** `10-07` touches only `lineage.js`, `lineage.test.js`, `IngredientTable.jsx`, `IngredientTable.creating.test.jsx`, and `10-board-editor.mjs`, allowing safe parallel execution in Wave 6 alongside `10-12`.

### 3. Concerns
- **[HIGH] `10-board-editor.mjs` panels `eC1` and `eC2` are cropped `sheet_only` panels without `.shell` or `.notebook-band`, so `box` comparisons will fail by 297 px unless anchored:**
  - *Evidence:* Task 2 states: "Add panels eC1 and eC2 (1366, the board's 1000-wide crop: its page origin is the inner wrapper, so boxes compare as in a full panel)". However, in `.planning/canvas-generators/p10.py:370-381`, `eC1` and `eC2` are generated with `sheet_only(1366, pid, state)`, which renders `<div class="notebook mk-page"><div class="notebook-body">...` directly inside the inner wrapper—omitting `<div class="shell">` (`.shell__head`) and `<header class="notebook-band">`. As confirmed in `.planning/canvas-generators/p10-measure.json:13-15`, `eB1` (full page) is `1825` px tall while `eC1` (`sheet_only` of the exact same state) is `1528` px tall—a `297` px vertical offset.
  - *Impact:* In `eC1` and `eC2`, `.ingredient-table tbody tr` has a `y` coordinate `297` px smaller relative to the board's inner wrapper than relative to the app's document origin on `/notebook/new`, causing `[count, box]` on `.ingredient-table tbody tr` to fail in Task 2 unless `10-board-check.mjs` anchors `sheet_only` panels to `.notebook-body__sheet` (see `10-01` Concern 1).
- **[MEDIUM] Potential mismatch in `IngredientTable.creating.test.jsx` between prop re-rendering and `onChange` message clearing:**
  - *Evidence:* Task 1 states both: (a) "its change clears that row's message when the new value reads (gramsDraftMessage returns null)" and (b) "re-render with new gramsByRow to model typing... Sucrose re-rendered at '150' clears its line and Whole milk's stays".
  - *Impact:* If the executor clears the per-row message `Map` **only** inside the `<input>`'s `onChange` handler, and then writes the test to re-render `<IngredientTable>` with an updated `gramsByRow` prop (`'150'`) **without** firing a DOM `input`/`change` event on the `<input>`, `onChange` will not run during the re-render and the stale error message in the `Map` will remain visible.

### 4. Suggestions
- In `IngredientTable.jsx`, store `blurredRowIds` (or `messagesByRowId`) in state, and when rendering `renderCreatingEntry(row, ...)` compute the active error as `messagesByRowId.has(row.id) ? gramsDraftMessage(row.ingredientName, raw) : null` (while also deleting `row.id` from `messagesByRowId` in `onChange` when `gramsDraftMessage` returns `null`, and adding `row.id` in `onBlur` when `gramsDraftMessage` is non-null). That way, both a real DOM `input` event and a prop re-render with a valid `gramsByRow` value immediately clear the error, while re-entering an invalid value before the next blur shows nothing until `onBlur` fires.
- For `eC1` and `eC2` in `10-board-editor.mjs`, anchor `box` comparisons to `.notebook-body__sheet` (via the `origin` support in `10-board-check.mjs`).

### 5. Risk Assessment
- **Risk Level:** MEDIUM
- **Justification:** The domain and component changes are straightforward, but the cropped-panel origin assumption on `eC1`/`eC2` and the `onChange` vs. prop-rerender clearing mechanism need attention to avoid test failures during execution.

---

## 10-08

### 1. Summary
Plan `10-08` builds the `Style` region of the creation editor's log column (`MAKE-09`, `D-08b`, decisions 6, 9, 14, 16, 17, 18, 21): it adds `creationTargets`, `applyStyle`, `clearStyle`, and `setBandEnd` to `app/src/domain/creation.js`, creates `app/src/ui/CreationSetup.jsx` (rendering the `Style` region with `Clear`, the `select.ink-field.mk-menu` style menu reading `useCatalog()`, the signed `Serving temperature` number input reusing `BatchRow.jsx`'s `MALFORMED_NUMBER_ENTRY` / `readSignedInput` / `shownSignedValue`, and the six target band pairs), ports the Style CSS rules into `app/src/styles/notebook.css`, and verifies all 16 target panels of `style-menu-and-bands.html` via `10-board-style.mjs`.

### 2. Strengths
- **Reuses `BatchRow.jsx`'s proven signed-temperature handling (`BatchRow.jsx:82-96, 126-145`):** Using `readSignedInput`, `shownSignedValue`, `MALFORMED_NUMBER_ENTRY`, `onChange` + `onInput`, and `onWheel={(event) => event.currentTarget.blur()}` handles WebKit's lone-minus quirk (`validity.badInput` with `value === ""`) and prevents accidental scroll-wheel stepping.
- **Reads styles dynamically from `useCatalog()` (`T-05`, `LIB-09`):** `CreationSetup.jsx` never imports `app/src/data/styles.js`, keeping `seed-data-scan.test.js:135-137` green.
- **Handles the board's `<option value="Philadelphia">` vs. app's `<option value="philadelphia">` difference:** Because `10-board-check.mjs` checks a `<select>`'s selected option text for `value`, `10-board-style.mjs` matches the board while storing lowercase style IDs (`'philadelphia'`, `'french'`, `'gelato'`, `'sorbet'`) in `createDraft.style` (`D-08b`).

### 3. Concerns
- **[HIGH] Cropped panels in `style-menu-and-bands.html` (`tA1..tG1` and `tA2..tD5`) omit `.shell` and `.notebook-band`:**
  - *Evidence:* In `.planning/canvas-generators/p10.py:414-426` and `style-menu-and-bands.html:6231`, `tA1..tG1` are generated by `log_only(1366, pid, style_region(...))` with `transform: translate(-976px, -0px)`, and `tA2, tB2, tC2, tD5` are generated by `sheet_only(1366, pid, state)` with `transform: translate(-632px, -<balY-8>px)`. None of them renders `<div class="shell">` or `<header class="notebook-band">`.
  - *Impact:* In `10-board-style.mjs` (Task 2), `tA1..tG1` check `box` on `.mk-region[aria-label="Style"] .region-name`, `.mk-menu`, `.mk-field-row .ink-field`, `.mk-unit`, `.mk-band`, and `.mk-band__ends .ink-field`. While `x` coordinates match (because `10-board-check.mjs` subtracts the inner wrapper's `getBoundingClientRect().left`, canceling the `-976px` translate), the `y` coordinates on the board start at `y = 0` (top of `.notebook-body`), whereas in the app on `/notebook/new` `.notebook-body` sits ~297 px below `.shell__head` and `.notebook-band`.
- **[LOW] `10-board-style.mjs` must skip panel `tO1` (the drawn stand-in open list):**
  - *Evidence:* `style-menu-and-bands.html` contains 17 panels total (`tA1, tA2, tO1, tB1, tB2, tC1, tC2, tD1..tD5, tF1..tF3, tG1`), where `tO1` is "The menu open · 1366" (`p10.py:418`), drawing the static `ul.mk-list` stand-in. Task 2 rightly lists `tA1, tB1, tC1, tD1 to tD4, tF1 to tF3 and tG1` plus `tA2, tB2, tC2 and tD5` (16 panels, omitting `tO1`), which matches `CONTRACT.md` section 4 ("the build renders the select and nothing for the list").

### 4. Suggestions
- Anchor `10-board-style.mjs` panels `tA1..tG1` to `origin: '.mk-region[aria-label="Style"]'` in `10-board-check.mjs` so `box` comparisons measure relative to the `Style` region's top-left on both the board and the built app.
- In `10-board-style.mjs`, when driving `<select class="ink-field mk-menu">` in `steps`, select by label (`await page.selectOption('.mk-menu', { label: 'Philadelphia' })`) or by lowercase ID (`'philadelphia'`) so Playwright selects the option whose `value` is the style ID (`D-08b`).

### 5. Risk Assessment
- **Risk Level:** MEDIUM
- **Justification:** Domain logic and component wiring are well-specified and reuse existing patterns (`BatchRow.jsx`, `figures.js`), with the main execution risk being the `y`-origin offset on `log_only` panels in `10-board-style.mjs`.

---

## 10-09

### 1. Summary
Plan `10-09` completes the creation editor's log column with the `Scales` and `Problems` regions (`TASTE-01`, `TASTE-02`, decision 12, `T-04`, `T-05`): it adds scale and problem state transitions (`addScale`, `updateScale`, `removeScale`, `scaleStopsLine`, `addProblem`, `updateProblem`, `removeProblem`) to `domain/creation.js`, extends `Segmented.jsx` with optional `name` and `clearable` props, renders the `Scales` and `Problems` regions in `CreationSetup.jsx`, ports the `.mk-cue`, `.mk-core`, `.mk-pair`, `.mk-card`, and `.mk-stops` rules into `notebook.css`, and verifies `scales-and-problems.html` at 1366 and 393 via `10-board-scales.mjs`.

### 2. Strengths
- **Solves the radio-group collision in `Segmented.jsx` (`T-04`):** Adding `name` and `clearable = true` to `Segmented.jsx:28-54` is backwards-compatible with all existing callers (`Segmented.test.jsx` stays untouched and green) while giving Scale 1 and Scale 2 distinct DOM radio group names (`kind-${scale.key}`) and suppressing the `Clear` button that `scales-and-problems.html` does not draw.
- **Derives core scale and problem cues from `useCatalog()` (`T-05`):** Joining `catalog.scales.filter((s) => s.group === 'core').map((s) => s.name).join(', ')` and `catalog.problems.map((p) => p.name).join(' · ')` avoids any array literal of core scale or problem names, keeping `seed-data-scan.test.js:114-124` green.
- **Mints scale keys once in the click handler (`mintScaleKey(freshId())`):** Guarantees scale keys start with `scale-`, never collide with core keys or unsafe property names (`__proto__`, `constructor`, `prototype`), and never change across re-renders or when an earlier scale is removed.

### 3. Concerns
- **[HIGH] `scales-and-problems.html` panels (`sA1..sD1` at 1366 and `sA2..sD2` at 393) do NOT contain the Sheet or the `Style` region, contradicting Task 3's assumption:**
  - *Evidence:* Task 3 states:
    > "Create 10-board-scales.mjs (board '.planning/sketches/013-creation-editor/scales-and-problems.html', route '/notebook/new', library 'current'), each panel's draft being the state its page holds, read from the board panel's own markup (the name, the Sheet's rows and notes, the style, and the scales and problems it draws, keys minted as 'scale-board-1' and 'scale-board-2'), so every box above the log column (and, at 393, the whole Sheet above it) sits where the board puts it."
    However, inspecting `.planning/canvas-generators/p10.py:399-409` and `.planning/sketches/013-creation-editor/scales-and-problems.html:6221` shows that `sA1..sD1` and `sA2..sD2` were generated with `log_only(W, pid, scales_region(...), problems_region(...))`:
    1. There is **no** `.shell`, **no** `.notebook-band`, and `<div class="notebook-body__sheet"></div>` is completely empty (even at `393`!).
    2. There is **no** `<section aria-label="Style">` in `<aside class="notebook-log">` on `scales-and-problems.html`—`<section aria-label="Scales">` is the `:first-child` of `<aside class="notebook-log">`!
    3. Because `<section aria-label="Scales">` is `:first-child` on `scales-and-problems.html`, `.mk-region:first-child { border-top: none; padding-top: 0 }` (`p10.py:35`) applies to `Scales` on the board, whereas in the built app `<section aria-label="Style">` is `:first-child` and `<section aria-label="Scales">` is the second child (giving `Scales` a `1px` `border-top` and `16px` `padding-top`, and placing it ~500 px below `Style`, plus below `.notebook-body__sheet` at 393).
  - *Impact:* Comparing `box` on `sA1..sD2` relative to the page origin will fail on every element in `10-board-scales.mjs` because in the built app `Style` (and at 393 the Sheet and band) sits above `Scales`.Furthermore, selectors like `.mk-add` and `.mk-region` in `10-board-scales.mjs` must be scoped to the `Scales` and `Problems` regions (`section[aria-label="Scales"], section[aria-label="Problems"]`) so they do not match `Add note` / `Add ingredient` on the Sheet or the `Style` region in the app!
- **[LOW] Multiple `input[aria-label="Name"]` elements exist when focusing a newly added scale or problem card:**
  - *Evidence:* Both Scale cards (`p10.py:232`) and Problem cards (`p10.py:244`) render `<input class="ink-field" type="text" aria-label="Name">`.
  - *Impact:* When `Add scale` or `Add problem` focuses the newly added card's `Name` input, the focus effect in `CreationSetup.jsx` must scope its query to the specific region (`section[aria-label="Scales"]` vs. `section[aria-label="Problems"]`) and the last `.mk-card` in that region so `Add problem` does not focus Scale 1's `Name` input.

### 4. Suggestions
- In `10-board-scales.mjs` and `10-board-check.mjs`:
  1. Set `origin: '.mk-region[aria-label="Scales"] .batch-row__head'` on `sA1..sD2` (anchoring at `.batch-row__head` inside `Scales` eliminates both the vertical offset from `Style`/Sheet/band above `Scales` and the 16 px `padding-top` difference from `.mk-region:first-child`).
  2. Scope every element selector in `10-board-scales.mjs` (such as `.mk-card`, `.mk-add`, `.mk-cue`, `.mk-core`) to `.notebook-log` (or `:is(.mk-region[aria-label="Scales"], .mk-region[aria-label="Problems"]) ...`) so `Add note` and `Add ingredient` in `.notebook-body__sheet` are not counted in the app's `.mk-add` matches.
- In `CreationSetup.jsx`, scope the post-add focus query to `.mk-region[aria-label="Scales"] .mk-card:last-of-type input[aria-label="Name"]` for `Add scale` and `.mk-region[aria-label="Problems"] .mk-card:last-of-type input[aria-label="Name"]` for `Add problem`.

### 5. Risk Assessment
- **Risk Level:** MEDIUM
- **Justification:** The domain functions, `Segmented` props, and `CreationSetup` JSX/CSS are rock-solid, but `10-board-scales.mjs` will fail without anchoring at `Scales`'s `.batch-row__head` and scoping selectors away from the Sheet and `Style` region.

---

## 10-10

### 1. Summary
Plan `10-10` runs the final end-to-end phase verification and stops at a checkpoint for the orchestrator to write the iPad UAT row on Mark's List (`D-11`, `D-12`, `D-13`): Task 1 adds `extraWidths` overflow checks (`[393, 744, 768, 1024]`) to `10-board-check.mjs`, completes `10-board-editor.mjs` with full worked state, deviation words, and `pageHeight: true`, runs all five Sketch 013 board specs with `--evidence`, and runs `10-walk-check.sh`; Task 2 creates and runs `10-device-steps.mjs` in Playwright WebKit at 1366; Task 3 is a `checkpoint:human-action` returning the `check-creation-editor-ipad` row for the orchestrator to write via `ArtifactData`.

### 2. Strengths
- **Verifies device steps in WebKit before handing them to Mark (`verify-device-check-steps` rule):** `10-device-steps.mjs` walks all 10 steps of `check-creation-editor-ipad` in Playwright WebKit at 1366 with a coarse pointer, including verifying that `filechooser` never fires on `Import` while a creation is kept and that `recipes`, `versions`, and `batches` stores are deep-equal before and after while `drafts` is empty after `Cancel`.
- **Respects executor tool boundaries (`gsd-executor-has-no-artifactdata`):** Task 3 stops at a `checkpoint:human-action` so the orchestrator writes and reads back the Mark's List row with fresh UTC timestamps.
- **Covers the undrawn 724–759 px breakpoint gap (`Open Question 6`):** `extraWidths: [393, 744, 768, 1024]` verifies `scrollWidth <= innerWidth` across the `723.98px` vs. `759.98px` range on both `/notebook` and `/notebook/new`.

### 3. Concerns
- **[HIGH] `pageHeight: true` on `eC1` and `eC2` in `10-board-editor.mjs` compares a cropped `sheet_only` board (`1528` px) against the full app document (`~1825` px):**
  - *Evidence:* Task 1's acceptance criterion requires `grep -c "pageHeight: true" .planning/phases/10-the-creation-editor-without-save/10-board-editor.mjs` to print 4 or more (`eA1`, `eB1`, `eC1`, `eC2`). As shown in `.planning/canvas-generators/p10-measure.json:12-15` and `p10.py:366-381`, `eA1` (`1249`) and `eB1` (`1825`) are full-shell pages, whereas `eC1` (`1528`) and `eC2` (`1528`) are `sheet_only` crops that omit `.shell__head` and `.notebook-band`.
  - *Impact:* If `10-board-check.mjs` always compares `document.documentElement.scrollHeight` for `pageHeight: true`, `eC1` and `eC2` will fail by ~297 px.
- **[MEDIUM] Potential race in `10-device-steps.mjs` between typing `'Bitter'` and calling `await page.close()` inside the 250 ms debounce window:**
  - *Evidence:* In Task 2, `10-device-steps.mjs` types `'Bitter'` into Problem 1, clicks header `Import`, and immediately closes the tab (`await page.close()`). As noted in `useKeptDraft.js:247-249`, `pagehide` triggers `flushPendingDraft()`, which starts an IndexedDB write transaction, but Playwright's `page.close()` destroys the browser page immediately and may not wait for an IndexedDB transaction started inside `pagehide` to commit before the next page opens `/notebook`.
  - *Impact:* Without waiting for the 250 ms debounce (e.g. `await page.waitForTimeout(300)`) before `await page.close()`, the last keystroke (`'Bitter'`) could intermittently be absent when the new page opens `/notebook` and clicks `Resume`.

### 4. Suggestions
- In `10-board-check.mjs`, when `pageHeight: true` is set on a panel whose board DOM does not contain `.shell` (such as `eC1` and `eC2`), measure the height of `.notebook-body` in the app (`document.querySelector('.notebook-body').getBoundingClientRect().height`, which is `1528` px) instead of `document.documentElement.scrollHeight`.
- In `10-device-steps.mjs`, wait 300 ms (past the 250 ms debounce) after typing `'Bitter'` before calling `await page.close()` so the test does not race Playwright's page destruction against an uncommitted IndexedDB transaction.

### 5. Risk Assessment
- **Risk Level:** MEDIUM
- **Justification:** Once `10-board-check.mjs` handles `pageHeight` and `origin` for cropped panels and `10-device-steps.mjs` waits past the 250 ms debounce before closing the page, the final verification and checkpoint flow are comprehensive.

---

## 10-11

### 1. Summary
Plan `10-11` (split out of `10-02` in Wave 3) implements draft survival across closed tabs, the Notebook's draft row and `Resume` action, and the two page-scoped notices (`MAKE-11`, `D-03`, `D-08c`, `D-10a`): it creates `app/src/ui/PageNotice.jsx` (`PageNoticeContext`, `usePageNotice`, `PageNotice`), reads `repository.listDrafts()` in `NotebookPlace.jsx` to render `ul.nb__drafts > li.nb__draft` with `Resume` (and suppress `New recipe`), consumes `{ discarded: true }` once on `/notebook` to announce `'Draft discarded.'`, and consumes `{ started: true }` once in `CreationRoute.jsx`/`CreationPage.jsx` so `'Draft kept. Cancel discards it.'` is announced on `Resume`, reload, or direct visit—never right after `Start`.

### 2. Strengths
- **Zero changes to `router.jsx` or `useKeptDraft.js`:** Keeping `PageNotice` in its own module (`app/src/ui/PageNotice.jsx`) and filtering `DRAFT_KEPT_STATUS` inside `CreationPage`'s `onPageStatus` callback while `justStarted` is true leaves both `router.jsx` (`RecipePage.test.jsx:926-993`) and `useKeptDraft.js` (`RecipePage.shell.test.js:257-293`) completely untouched.
- **Security of route-state notices (`T-10-05`):** Route state carries only boolean flags (`{ started: true }`, `{ discarded: true }`), and the announced strings are hardcoded module constants (`DRAFT_KEPT_STATUS`, `DRAFT_DISCARDED_STATUS`), preventing history-state injection.
- **Thorough closed-tab verification in `CreationFlow.test.jsx`:** Tests all three flush paths inside the 250 ms debounce (`window` `pagehide` event, `document` `visibilitychange` with `visibilityState === 'hidden'`, and component unmount) followed by a fresh mount at `/notebook` and `Resume`.

### 3. Concerns
- **[LOW] `CreationRoute.jsx` replacing route state on mount can trigger a re-render if not guarded:**
  - *Evidence:* Task 2 states: "In CreationRoute.jsx read `location.state?.started` once into a ref at first render, pass `justStarted={startedRef.current}` to CreationPage, and in a mount effect replace the entry's state with null when it was set, so a later reload announces the kept draft."
  - *Impact:* Because `startedRef = useRef(Boolean(location.state?.started))` captures the initial boolean on the first render before `navigate({ pathname: location.pathname }, { replace: true, state: null })` runs in the mount effect, `justStarted={startedRef.current}` remains `true` across the state-clearing re-render for that page instance, while `location.state` is cleared for any subsequent reload. Just ensure `CreationRoute`'s draft-loading `useEffect` has `[]` dependencies (not `[location]`) so clearing `location.state` does not re-run `repository.listDrafts()`.

### 4. Suggestions
- In `CreationRoute.jsx`, keep the `repository.listDrafts()` effect's dependency array empty (`[]`) so the `navigate({ pathname: location.pathname }, { replace: true, state: null })` call that consumes `location.state?.started` does not trigger a second `listDrafts()` read.

### 5. Risk Assessment
- **Risk Level:** LOW
- **Justification:** Small, well-isolated slice with clear state transitions and comprehensive jsdom coverage.

---

## 10-12

### 1. Summary
Plan `10-12` (split out of `10-06` in Wave 6) completes `IngredientPicker.jsx` to match Sketch 013's `ingredient-picker.html` (`MAKE-06`, decisions 4 and 7, `Phase 9 D-11`, `T-02`, `T-05`, `D-13`): it exports `summaryText` and `capitalised` from `app/src/ui/IngredientsPlace.jsx`, adds the `Name` and `Category` filters, polite status count (`ingredientCountWords`), `Clear filters`, `Added` (`aria-disabled="true"`), and `"Not in the library yet"` empty state to `IngredientPicker.jsx`, ports the `.pick*`, `.mk-focus`, and `.notebook .pick .ing__*` rules into `app/src/styles/notebook.css`, and verifies all 8 panels of `ingredient-picker.html` at 1366 and 393 via `10-board-picker.mjs`.

### 2. Strengths
- **Re-homes `.ing__*` filter styles under `.notebook .pick` (`Pitfall 5`, `T-02`):** Because `shell.css:443-490, 701-708, 768-774` scopes the Ingredients place's filter rules under `.place`, porting them under `.notebook .pick` in `notebook.css` (and placing the stacking rules in `notebook.css`'s existing `@media (max-width: 723.98px)` block and touch floor rules in `@media (pointer: coarse)`) satisfies `notebook.test.js:36-53`, `binder.test.js:308-315` (underline on `.notebook .pick__act` instead of `app.css`), and `notebook.test.js:698-701` (using `.notebook .pick .ing__clear` without `notebook-link` in the selector so the single `notebook-link` `min-height` pin is untouched).
- **Uses the 26-entry original library mode for board comparison:** Running `10-board-picker.mjs` with `library: 'original'` matches the board's `"26 ingredients"` and `"5 of 26 ingredients"` counts while keeping the 111-entry seeded library in production.

### 3. Concerns
- **[HIGH] `ingredient-picker.html` panels (`kA1, kA2, kB1, kB2` at 1366 and `kC1..kC4` at 393) are `sheet_only` crops without `.shell` or `.notebook-band`:**
  - *Evidence:* In `.planning/canvas-generators/p10.py:387-394` and `ingredient-picker.html:6223`, all 8 panels are generated via `sheet_only(W, pid, state, picker=...)`, which starts at `<div class="notebook mk-page"><div class="notebook-body"><div class="notebook-body__sheet">` and omits `<div class="shell">` and `<header class="notebook-band">`.
  - *Impact:* As noted in `10-01` Concern 1, every `box` check in `10-board-picker.mjs` will have a `y`-coordinate offset equal to the height of `.shell__head` + `.notebook-band` unless `10-board-check.mjs` anchors `sheet_only` panels to `.notebook-body__sheet` (or `.ingredient-table-region`), and `useOriginalLibrary` in `10-board-check.mjs` must wait for `.shell` rather than `.place__title`.
- **[LOW] Trailing `' · '` separator in `.pick__sum` for library entries whose composition figures are all zero (e.g., Water in the 111-entry library):**
  - *Evidence:* Task 1 states: "`span.pick__sum` (the capitalised category, only when it is a non-blank string, then summaryText(entry), joined by ' · ')". In the 111-entry library (`librarySeedDb`), `water` has all-zero composition figures, so `summaryText(entry)` (`IngredientsPlace.jsx:91-95`) returns `''`.
  - *Impact:* If joined without filtering empty strings, `[capitalised(category), summaryText(entry)].join(' · ')` would render `"Other · "` with a trailing separator when `summaryText(entry)` is `''`. Filtering with `.filter(Boolean).join(' · ')` keeps all 26 original entries identical (`Category · summary`) while cleanly rendering `"Other"` when `summaryText(entry)` is empty.

### 4. Suggestions
- Join `.pick__sum` text with `[catWord, summaryText(entry)].filter(Boolean).join(' · ')` so entries with no non-zero composition figures do not render a dangling `' · '`.
- Anchor `10-board-picker.mjs` panels `kA1..kC4` to `origin: '.notebook-body__sheet'` in `10-board-check.mjs`, and blur `document.activeElement` after opening the picker or typing into `Name` on `kA1, kA2, kB1, kC1, kC2, kC3` (since `10-board-picker.mjs` only checks `focus` on the after-pick panels `kB2` and `kC4`, where `.mk-focus` is active).

### 5. Risk Assessment
- **Risk Level:** MEDIUM
- **Justification:** The component and CSS rules are accurately specified and avoid every style-suite pin, provided `10-board-check.mjs` anchors `sheet_only` panels and waits for `.shell` in `useOriginalLibrary`.

---

## Cross-Plan Synthesis & Overall Assessment

### Wave & Dependency Ordering
The 9-wave structure (`10-01` → `10-02` → `10-11` → `10-03 || 10-04 || 10-05` → `10-06` → `10-07 || 10-12` → `10-08` → `10-09` → `10-10`) is well-ordered:
- Parallel waves (`Wave 4`: `10-03`, `10-04`, `10-05`; `Wave 6`: `10-07`, `10-12`) have **disjoint `files_modified` sets**, preventing merge conflicts across executor worktrees:
  - In Wave 4: `10-03` modifies `recipe.js`, `NotebookPlace.jsx`, `shell.css`; `10-04` modifies `Shell.jsx`, `router.jsx`, `Shell.creationGuard.test.jsx`; `10-05` modifies `creation.js`, `RecipeSheet.jsx`, `Authored.jsx`, `Headnote.jsx`, `FormulationNote.jsx`, `CreationPage.jsx`, `CreationFlow.test.jsx`, `notebook.css`.
  - In Wave 6: `10-07` modifies `lineage.js`, `IngredientTable.jsx`, `IngredientTable.creating.test.jsx`, `10-board-editor.mjs`; `10-12` modifies `IngredientPicker.jsx`, `IngredientPicker.test.jsx`, `IngredientsPlace.jsx`, `CreationFlow.test.jsx`, `notebook.css`, `10-board-picker.mjs`.

### Top Priorities Before Execution
1. **Fix cropped-panel coordinate origins and `useOriginalLibrary` in `10-board-check.mjs` (`10-01` Task 3):**
   - `p10.py` generated `eC1`, `eC2`, `kA1..kC4`, `tA1..tG1`, `tA2..tD5`, and `sA1..sD2` via `sheet_only` and `log_only` (without `.shell` and `.notebook-band`, and in `scales-and-problems.html` without the `Style` region). Support an `origin` selector per panel (or auto-anchor when `.shell` is absent in the board panel) and compare `.notebook-body` height for `pageHeight` when `.shell` is absent on the board (`eC1`, `eC2`).
   - Replace `waitForSelector('.place__title')` with `waitForSelector('.shell')` in `useOriginalLibrary`, and seed `library` + `draft` before `page.goto(servers.appUrl + panel.route)`.
2. **Fix the `NoteList` callback arity in `10-05` Task 1:**
   - `Authored.jsx:35, 37` passes `listKey` (`'beforeYouStart'`) as the first argument to `onChangeNoteText(listKey, index, value)` and `onRemoveNote(listKey, index)`. Ensure `CreationPage.jsx` accepts `(_listKey, index, text)` and `(_listKey, index)`.
3. **Ensure `useKeptDraft.test.jsx` fake timers and `IngredientTable.creating.test.jsx` message clearing align (`10-02` Task 2, `10-07` Task 1):**
   - Advance fake timers by 250 ms in the updated `useKeptDraft.test.jsx:494-508` and `564-587` cases, and evaluate `gramsDraftMessage` dynamically for blurred rows in `IngredientTable.jsx` so both DOM `input` events and prop re-renders clear resolved errors.

---

## Consensus Summary

All three reviewers covered 12/12 plans with `file:line` evidence and count at full weight. Codex and Astra rate the phase HIGH until revised; Argon rates most plans LOW or MEDIUM because it treats the board-engine defect as a harness fix inside 10-01 rather than a blocker for the downstream plans. The three agree on the defect itself. The product scope, the twelve-plan split, the wave ordering (Argon verified disjoint `files_modified` in waves 4 and 6) and the shared-editor architecture are not in question.

### Agreed Strengths

- Recording the strict walk baseline before any `app/` change, and stripping the Phase 9 allowances, is sound (all three; `09-walk.mjs:869`).
- Finding the record before mounting the editor respects the hook's restore-once lifecycle (`useKeptDraft.js:133-139`), and `sheetView` with `baseline: null` works through the existing reading path (Codex, Astra).
- Keeping `chooseImportFile` synchronous preserves the iOS user-activation gesture (`Shell.jsx:332-338`); the page-notice registration mirrors the existing `ImportGuardContext` pattern (all three).
- Reusing `recipeNameMessage`, `rowFromLibraryRecord`, `parseGramsDraft`, `readSignedInput`, `filterLibrary`, `summaryText`, `mintScaleKey` and the catalog limits keeps domain rules single-sourced (all three).
- A separate `renderCreatingEntry` branch avoids the false struck baseline `GramsCell` would produce (`IngredientTable.jsx:160-169`) (Astra, Argon).
- Per-scale radio names fix the real label-derived group collision in `Segmented.jsx:28-30` (Codex, Astra, Argon).
- Route state carries only boolean flags and the announced strings are constants (Argon, Codex).

### Agreed Concerns

1. **The board engine's coordinate contract is wrong for cropped panels — HIGH, all three.** `p10.py:370-375` builds `sheet_only` and `log_only` panels without `.shell` and `.notebook-band`; the scales panels (`p10.py:399-409`) also omit Style and leave the Sheet slot empty, so Scales gets `:first-child` styling. Comparing board-wrapper-relative boxes to app-document boxes misses by 297 px (Astra measured the same table at y=684.78 in `eB1` and y=387.78 in `eC1`; Argon confirms via `p10-measure.json`), and `pageHeight: true` on `eC1`/`eC2` compares 1528 against the full app's ~1825 (10-10). The 10-01 self-test (`10-board-012.mjs`) only exercises full-page panels, so it would pass and the defect would surface in 10-07, 10-08, 10-09, 10-10 and 10-12 as apparent app bugs. All three warn that "fix the build until every comparison passes" would then push wrong CSS changes. Fix: per-panel origin anchor (Argon names `.notebook-body__sheet`, `.mk-region[aria-label="Style"]`, and `.batch-row__head` for Scales to dodge the 16 px padding difference), region-scoped selectors, region height instead of document height on cropped panels, and prove the engine against a sheet-only and a log-only panel inside 10-01.
2. **A fitting create draft is not a fully populated one — HIGH, Codex and Astra.** `draftMatchesCreate` requires only `recipeId`, `versionId`, `name` (`draft.js:499-523`; name-only acceptance tested at `draft.test.js:574-576`, empty portions at `659-661`). 10-02 mounts `record.payload` directly and the projection and Sheet dereference `rows`, `beforeYouStart`, `scales`. Normalize over `blankCreateDraft` at load and in `onRestoreCreate`; define safe handling for zero-portion rows.
3. **Cancel is not terminal — HIGH, Codex and Astra; both reproduced it.** `discardDraft` clears pending work but not an outstanding restore (`useKeptDraft.js:44-49, 139-186`); with unconditional creation persistence a late restore schedules a save that unmount flushes (`250-259`), writing the draft back after delete. The returned promise also still ends in `.catch(() => {})` at line 49, so awaiting it cannot prove deletion. Make discard a terminal transition and test deferred restore, deferred delete and rejected delete.
4. **The import guard has open windows — HIGH Codex and Astra, MEDIUM Argon.** `creationKeptRef` starts false and is filled asynchronously (10-04 plan line 99), so a click before `listDrafts` resolves on cold boot opens the chooser; after a fast Start-and-leave the next route reads stale state; and Argon adds the mirror window after Cancel where the ref stays true. `handleImportChange` also commits `importStore` after awaiting `file.text()` with no recheck (`Shell.jsx:347-360`). Fix: tri-state unknown/absent/present, publish Start and Cancel transitions to the Shell synchronously (Argon: read `location.state?.discarded`), recheck before committing an import.
5. **`NoteList` callback arity — MEDIUM, all three.** `Authored.jsx:35-37` emits `(listKey, index, text)` and `(listKey, index)`; 10-05 describes `(index, text)` adapters, which would pass `"beforeYouStart"` as the index.
6. **`parseGramsDraft` can return `Infinity` — MEDIUM, Codex and Astra; both reproduced it.** A 309-digit string passes the regex (`lineage.js:212-213`); `?? 0` keeps it; `rowFromLibraryRecord` throws at `versionRow.js:48-49` (10-06), and two infinite band ends satisfy `low <= high` (10-08). Add `Number.isFinite` at both boundaries.
7. **The 10-07 clear-on-type test does not drive the implementation — MEDIUM, all three.** The implementation clears in `onChange` (plan line 103) but the test rerenders props (line 105). Use a stateful harness dispatching input events, or (Argon) derive the message dynamically so both paths clear.
8. **Reselecting the already-selected style fires no `change` — MEDIUM, Codex and Astra.** 10-08 line 34 promises reapplication; Astra confirmed in WebKit that confirming the same option emits nothing while Playwright's `selectOption` does, so automation would falsely pass. Drop the promise or specify an approved interaction.
9. **Two tabs, two drafts: 10-11's wording contradicts itself — MEDIUM, Codex and Astra.** The plan allows two Starts in two tabs and deletes only the displayed draft (lines 28-32) while promising no draft row after Cancel; `newestDraft` (`draft.js:95`) selects, it does not enforce. State the single-draft precondition or decide a singleton policy. Codex also notes 10-04 declares other tabs out of scope while 10-11 describes them.
10. **Pending Start outlives the entry — MEDIUM, Codex and Astra.** The ref lock stops a second Start but Cancel or navigation during the awaited `saveDraft` still navigates into the editor (10-03 line 121, 10-02 line 154). Codex and Astra also want Start's button `type` stated, since `Button.jsx:7` defaults to `type="button"`.
11. **10-10 device step and retry pattern — MEDIUM, Codex and Astra.** "Open the address again" (line 181) opens `/`, not `/notebook`; the four-click retry in `09-walk.mjs:230-239` proves eventual reachability, not first-tap success.
12. **Picker coverage uses only the 26-entry library — MEDIUM, Codex and Astra.** Production seeds the merged dataset (`seed.js:6-12`); add a current-library pass at 393 and 1366.

### Divergent Views

- **Severity of the board defect.** Codex and Astra mark every plan that consumes a cropped board HIGH; Argon marks 10-01 MEDIUM and the consumers LOW, holding that one harness fix in 10-01 clears them all. The agreed fix is the same; the disagreement is whether the plans can execute before it lands. Given the "fix the build until comparisons pass" instruction in the consumer plans, treat it as blocking 10-01.
- **10-09's board oracle.** Astra alone found that the frozen scales board gives both cards the same `"Kind"` radio name (`p10.py:174-179, 231-235`), so `sC1`/`sC2` have one checked radio in WebKit where a correct implementation has two; the planned `input:checked` count would reward the bug. Astra closes by asking which evidence governs when a frozen board contradicts the interaction contract. This is a question for Mark.
- **Edits lost during restore.** Astra alone reproduced typing, waiting 350 ms and unmounting before the second `getDraft` resolved: zero saves, because persistence returns while `draftRestoreDone` is false (`useKeptDraft.js:195-196`). Outside the accepted 250 ms boundary; the planned tests leave after restore, not during it.
- **Argon's harness details, raised by no one else.** `useOriginalLibrary` copied from `09-places-check.mjs:131` waits for `.place__title`, which does not exist on `/notebook/new`, so the picker board check would hang; the board check must seed the draft before `page.goto` or `CreationRoute` redirects to `/notebook`; the 5-second "Draft kept" banner from 10-11 will sit in the evidence screenshots. Argon also flags that widening `isDeveloping` to cover `creating` would null-deref `draftVersion` at `IngredientTable.jsx:518-522`, and that the updated `useKeptDraft.test.jsx:564-587` must advance fake timers 250 ms and remock `getDraft` for the second visit.
- **Accessibility of scale and problem cards.** Astra alone asks for an accessible group name per card, since repeated "Name / Low end / High end / Kind" labels do not say which card a screen-reader user is in.
- **Argon's low risk ratings** rest on verified source-text pins (call-site counts, route regexes, hook order) that the other two did not re-check; those pins hold.
