---
phase: 11
reviewers: [codex, opencode-astra, opencode-argon]
reviewed_at: 2026-10-26T14:35:03Z
plans_reviewed: [11-01-PLAN.md, 11-02-PLAN.md, 11-03-PLAN.md, 11-04-PLAN.md, 11-05-PLAN.md, 11-06-PLAN.md, 11-07-PLAN.md, 11-08-PLAN.md, 11-09-PLAN.md, 11-10-PLAN.md, 11-11-PLAN.md, 11-12-PLAN.md, 11-13-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
  opencode-astra: "openrouter/openai/gpt-6-astra#high"
  opencode-argon: "openrouter/google/gemini-4-argon#high"
model_sources:
  codex: "banner"
  opencode-astra: "pinned"
  opencode-argon: "pinned"
---

# Cross-AI Plan Review — Phase 11

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

> Note: opencode-astra and opencode-argon share the opencode adapter; their consensus is cross-model, not cross-tool.

Round 1, `--all`: Codex (`--codex`) plus the two configured OpenCode instances, against the 13 plans at 05f53a42 (plans planned at a00dc83f on the app baseline cf64aa70). All three ran in parallel against the same prompt (PROJECT.md, the roadmap section, REQUIREMENTS.md, 11-CONTEXT.md, 11-RESEARCH.md, the 13 plans). Codex took 11.5 minutes, Astra 25, Argon 30. The first two OpenCode attempts died at the first model call on OpenRouter's credit reservation ("This request would exceed your available credits given your current in-flight requests"); Mark topped up and the third attempt ran clean. The stubs from the failed attempts are kept under `.review-diagnostics/`. Every reviewer gave each of the 13 plans its own section and cited source; none carries a `[reviewed-without-...]` marker. Codex and Astra both report the baseline suite green (120 files, 3,771 tests).

## Codex Review

Reviewed all 13 plans against the repository. The current baseline passes **3,771 tests across 120 files**. Findings below concern the proposed implementation; those changes have not been executed.

## 11-01

**Summary:** A useful foundation, with strong baseline isolation and comparison rules. The proposed method normalization weakens some of the regression coverage it claims to preserve.

**Strengths**

- Extends an existing comparator that checks individual leaves and rejects duplicate scenario and step names. This is a sound basis for a narrow allowance for new scenarios. [10-walk.mjs:883](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-walk.mjs:883)
- Reuses static servers bound to ephemeral localhost ports, keeping verification separate from the device preview. [08-walk-server.mjs:64](/Users/mark/Documents/projects/sprinkles/.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs:64)

**Concerns**

- **MEDIUM:** Removing every target’s `.struck-value` from the hash also removes meaningful comparison content. An incorrect old target value could pass unchanged hashes. Those spans currently carry the previous label and value. [Method.jsx:401](/Users/mark/Documents/projects/sprinkles/app/src/ui/Method.jsx:401), [11-01-PLAN.md:120](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-01-PLAN.md:120)

**Suggestions**

- Hash canonical target comparison data separately: label, previous value, current value and removal state. Normalize presentation changes without discarding previous values.
- Add a self-test that changes a displayed previous target value and must fail.

**Risk assessment: MEDIUM.** The harness architecture is appropriate, but its normalization currently creates a verification blind spot.

## 11-02

**Summary:** The allocation model and pure-operation boundary are well grounded. The grams-folding specification contains a direct contradiction that should be resolved before implementation.

**Strengths**

- Correctly handles the collision between the existing placeholder step `1` and the first issued step key. [creation.js:138](/Users/mark/Documents/projects/sprinkles/app/src/domain/creation.js:138), [stepKeys.js:24](/Users/mark/Documents/projects/sprinkles/app/src/domain/stepKeys.js:24)
- Tombstones fit the existing key allocator, which examines removed steps when calculating the next key. [stepKeys.js:25](/Users/mark/Documents/projects/sprinkles/app/src/domain/stepKeys.js:25)

**Concerns**

- **HIGH:** The behavior requires `addGrams('4.', '200')` to return `'4.'`, while the implementation instructions require returning the only parseable operand, `'200'`. That implementation would erase partially typed input during removal. [11-02-PLAN.md:161](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-02-PLAN.md:161), [11-02-PLAN.md:175](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-02-PLAN.md:175)
- **MEDIUM:** Allocation invariants alone do not prove conservation of grams. Totals are derived directly from portions, so a structurally valid result can still lose an amount. [rows.js:98](/Users/mark/Documents/projects/sprinkles/app/src/domain/rows.js:98)

**Suggestions**

- Specify one policy that preserves entered data when either operand is incomplete or unreadable.
- Add conservation assertions for valid amounts, both operand orders for invalid amounts, and overflow cases.

**Risk assessment: HIGH.** The contradiction affects user-entered quantities and the phase’s balance-preservation promise.

## 11-03

**Summary:** Atomic creation and transaction-local eligibility checks are strong choices. Draft ownership is not enforced consistently at the storage boundary.

**Strengths**

- The proposed rollback mechanism follows a proven repository pattern, including explicit abort after synchronous cloning failures. [repository.js:240](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js:240), [repository.test.js:139](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.test.js:139)
- Reusing `sheetCodeProblems` protects stored codes against replacement. [sheetCode.js:253](/Users/mark/Documents/projects/sprinkles/app/src/domain/sheetCode.js:253)

**Concerns**

- **HIGH:** The plan explicitly permits Save-over to succeed while a foreign `plan` draft occupies the version’s draft key. Leaving that draft present does not protect it: the version it describes has just changed beneath it. This can happen after another tab opens a pen. [11-03-PLAN.md:171](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-03-PLAN.md:171), [repository.js:314](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js:314)

**Suggestions**

- Refuse Save-over inside the transaction when a foreign draft occupies the key.
- Test the sequence “open edit, another tab stores a plan draft, Save-over.”
- Define conflict handling for two edit tabs; matching id, code and creation date cannot detect concurrent content changes.

**Risk assessment: HIGH.** Atomicity protects complete writes, but does not by itself protect ownership or prevent lost updates.

## 11-04

**Summary:** Sharing the printed reading treatment is sensible. Rendering directly from the existing target diff introduces a data-loss edge case.

**Strengths**

- The print component provides a concrete reference for targets, purpose and aside markup. [PrintSheetPages.jsx:202](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintSheetPages.jsx:202)
- Existing diffs include baseline-only targets, enabling the required removed-target display. [diff.js:152](/Users/mark/Documents/projects/sprinkles/app/src/domain/diff.js:152)

**Concerns**

- **MEDIUM:** `buildTargetDiff` collapses targets by label through `Map`. Creation permits repeated labels, and the import validator does not reject them. Mapping the new reading component over these descriptors will omit targets in closed pen and Show changes views. A source probe confirmed that two `temp` targets produce one descriptor containing the last value. [diff.js:155](/Users/mark/Documents/projects/sprinkles/app/src/domain/diff.js:155), [transfer.js:188](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:188)

**Suggestions**

- Make comparison preserve repeated target occurrences.
- Add tests for repeated labels in reading, closed pen and Show changes.
- Include a closed pen step in the WebKit evidence; the proposed board fixtures primarily exercise reading pages.

**Risk assessment: MEDIUM.** The visual approach is sound, but diff identity needs attention before it becomes the rendering source.

## 11-05

**Summary:** Appropriately limited print work that reuses existing pagination and code lookup. The browser checks need more precise DOM scoping.

**Strengths**

- Empty notes and instructions are already omitted by the page planner, supporting the decision to avoid new print sections. [PrintSheetPages.jsx:318](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintSheetPages.jsx:318)
- Search reads stored Sheet codes and navigates using the matched version’s ids. The proposed persistence test exercises the correct mechanism. [SheetCodeSearch.jsx:81](/Users/mark/Documents/projects/sprinkles/app/src/ui/SheetCodeSearch.jsx:81)

**Concerns**

- **MEDIUM:** The print route also contains a hidden measurement copy of the complete sheet. Broad `.ps-page`, heading and foot queries can inspect this copy alongside the actual paginated output, producing misleading counts or geometry results. [PrintSheetPages.jsx:433](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintSheetPages.jsx:433), [print.css:518](/Users/mark/Documents/projects/sprinkles/app/src/styles/print.css:518)

**Suggestions**

- Wait for `[data-print-ready="true"]`.
- Scope assertions to `.print-route__pages .print-page--sheet`.
- Measure section spacing and page overflow, alongside checking absent headings.

**Risk assessment: MEDIUM.** Product implementation risk is low; verification could otherwise certify the wrong DOM.

## 11-06

**Summary:** The shared editor integration is coherent, but the proposed Preview board check cannot pass as specified.

**Strengths**

- Reusing `useOnDemandField` preserves established focus and collapse behavior for purpose and aside fields. [Method.jsx:51](/Users/mark/Documents/projects/sprinkles/app/src/ui/Method.jsx:51)
- Heading and creation-region changes fit the existing Sheet’s mode-based visibility boundary. [RecipeSheet.jsx:89](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeSheet.jsx:89)

**Concerns**

- **HIGH:** The approved target remove control adds another `.method-step__targets .text-control`, but the pE1 spec still compares that broad selector’s count and text against a board without the control. Omitting box checks does not resolve the count or text mismatch. The existing engine explicitly compares both. [11-06-PLAN.md:190](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-06-PLAN.md:190), [10-board-check.mjs:292](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-board-check.mjs:292)

**Suggestions**

- Compare Add target and Preview through specific selectors.
- Verify target removal separately as the documented D-22 exception.
- Record exactly which geometry changes D-22 permits.

**Risk assessment: HIGH.** This is a deterministic execution blocker in the acceptance gate.

## 11-07

**Summary:** The per-line editing contract follows existing grouping and portion calculations well. Restored draft consistency remains insufficiently protected.

**Strengths**

- Reuses grouping that already resolves stored step keys and preserves table order. [IngredientTable.jsx:36](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:36)
- Reuses the established portion-note calculation rather than introducing another total. [IngredientTable.jsx:631](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:631)

**Concerns**

- **MEDIUM:** Draft validation checks row and method shapes independently; it does not check agreement between `uses` and portions. A source probe confirmed that a draft containing two portions but only one referencing step passes restore validation. The proposed projection can then omit the extra portion, while the Save gate has no allocation-consistency refusal. [draft.js:422](/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js:422), [draft.js:439](/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js:439)

**Suggestions**

- Check allocation consistency before Save and before destructive allocation operations.
- Preserve inconsistent kept drafts for recovery; do not silently project away quantities.
- Add a restored-draft integration test with an unmatched portion.

**Risk assessment: MEDIUM.** Normal operation sequences are well covered, but accepted stored drafts can violate the new model.

## 11-08

**Summary:** Focus handling and control behavior are carefully specified. Row movement has a wider effect than the stated “within its step” interaction suggests.

**Strengths**

- Explicit post-render focus requests extend an existing editor pattern. [CreationPage.jsx:136](/Users/mark/Documents/projects/sprinkles/app/src/ui/CreationPage.jsx:136)
- Shared buttons already provide the explicit tab index required by the project. [Button.jsx:7](/Users/mark/Documents/projects/sprinkles/app/src/ui/Button.jsx:7)

**Concerns**

- **MEDIUM:** All groups derive row order from the same `rows` array. Swapping two split rows within one step also swaps them in every other shared step. The domain plan acknowledges this consequence, but acknowledgment does not establish that it matches the intended interaction. [IngredientTable.jsx:28](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:28), [11-02-PLAN.md:173](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-02-PLAN.md:173)

**Suggestions**

- Resolve this behavior explicitly before implementation.
- If movement must affect only the selected step, give groups independent ordering semantics.
- Add a two-step fixture where the same two rows occur in both groups and assert both resulting orders.

**Risk assessment: MEDIUM.** Accessibility coverage is strong; ordering semantics need clarification.

## 11-09

**Summary:** This covers the essential Save workflow, but its numeric gate and pending-save behavior need strengthening.

**Strengths**

- Ending the writer addresses a real resurrection path: unmount currently flushes pending draft writes. [useKeptDraft.js:292](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:292)
- Building rows through `rowFromLibraryRecord` preserves the existing coefficient-copy boundary. [versionRow.js:71](/Users/mark/Documents/projects/sprinkles/app/src/domain/versionRow.js:71)

**Concerns**

- **HIGH:** `gramsDraftMessage` does not reject numeric overflow. A 309-digit amount returns `Infinity` from the parser and **no message**. The planned gate therefore passes a value that the row constructor and import validator reject. This was reproduced against the source. [lineage.js:212](/Users/mark/Documents/projects/sprinkles/app/src/domain/lineage.js:212), [lineage.js:224](/Users/mark/Documents/projects/sprinkles/app/src/domain/lineage.js:224), [versionRow.js:48](/Users/mark/Documents/projects/sprinkles/app/src/domain/versionRow.js:48)
- **HIGH:** Only Save is explicitly disabled while saving. Cancel and further edits can race the pending transaction, causing navigation after cancellation or discarding changes typed after the saved snapshot. The referenced RecipeBand pattern disables fields and Cancel too. [11-09-PLAN.md:126](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-09-PLAN.md:126), [RecipeBand.jsx:75](/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeBand.jsx:75)

**Suggestions**

- Validate finite parsed amounts and finite totals.
- Freeze editing and Cancel during commit, or explicitly preserve subsequent edits.
- Test both cases using a deferred save promise.

**Risk assessment: HIGH.** These gaps affect successful saving and preservation of entered data.

## 11-10

**Summary:** Reusing the creation editor and introducing a sibling draft kind are appropriate. Conversion from existing versions needs to preserve effective recipe content.

**Strengths**

- The recipe-page restore guard fixes a confirmed hazard: an unrecognized draft is currently deleted. [useKeptDraft.js:184](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:184)
- Clean-payload handling fits the existing persistence mechanism’s distinction between a stored record and no record. [useKeptDraft.js:266](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:266)

**Concerns**

- **HIGH:** `draftFromVersion` does not specify handling removed rows or removed portions. Such roots are reachable through the existing version pen’s Save-over, which permits saving without batches. Creation then rebuilds rows with `removed: false`, potentially restoring ingredients the maker removed. [useVersionPen.js:225](/Users/mark/Documents/projects/sprinkles/app/src/ui/useVersionPen.js:225), [rows.js:31](/Users/mark/Documents/projects/sprinkles/app/src/domain/rows.js:31), [versionRow.js:77](/Users/mark/Documents/projects/sprinkles/app/src/domain/versionRow.js:77), [11-10-PLAN.md:117](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-10-PLAN.md:117)

**Suggestions**

- Define conversion for whole-row removals, removed portions and portions under removed steps.
- Test a root modified through the existing pen, then opened and saved through Edit.
- Assert unchanged effective ingredients, grams and balance after conversion.

**Risk assessment: HIGH.** Reopening must preserve what the saved recipe currently means.

## 11-11

**Summary:** The field-feedback design is consistent and accessible in principle. Two integration details are missing.

**Strengths**

- Reuses a component that replaces quiet guidance with an error in the same location. [FieldFeedback.jsx:4](/Users/mark/Documents/projects/sprinkles/app/src/ui/FieldFeedback.jsx:4)
- Recomputing messages after refusal follows the existing line-feedback approach. [IngredientTable.jsx:509](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:509)

**Concerns**

- **MEDIUM:** Kind’s actual radiogroup lives inside `Segmented`, which exposes no error, description or invalid-state props. That file is absent from the plan’s modifications, leaving the promised accessibility wiring underspecified. [Segmented.jsx:32](/Users/mark/Documents/projects/sprinkles/app/src/ui/Segmented.jsx:32), [Segmented.jsx:59](/Users/mark/Documents/projects/sprinkles/app/src/ui/Segmented.jsx:59)
- **MEDIUM:** The no-rows focus target disappears while the ingredient picker is open. Save can therefore refuse without finding its specified target. The picker replaces Add ingredient. [CreationPage.jsx:325](/Users/mark/Documents/projects/sprinkles/app/src/ui/CreationPage.jsx:325)

**Suggestions**

- Extend `Segmented` with optional error accessibility props and test the actual radiogroup.
- Define no-rows focus behavior while the picker is open.
- Add that picker-open refusal case to integration tests.

**Risk assessment: MEDIUM.** The gate is comprehensive, but some refusals may remain difficult to locate or hear.

## 11-12

**Summary:** This correctly covers the distributed entry points. Quiet deletion of closed edit drafts conflicts with the retention promise.

**Strengths**

- Handler-level refusal is necessary because route intents invoke the opener directly; hiding buttons alone would not protect the draft. [useRouteIntents.js:65](/Users/mark/Documents/projects/sprinkles/app/src/ui/useRouteIntents.js:65)
- Extending the import-time reread follows the existing protection against stale draft knowledge. [Shell.jsx:461](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx:461)

**Concerns**

- **HIGH:** Notebook cleanup and edit-route redirects delete edit drafts after a batch or child appears. An edit kept after D-06’s stale-save refusal can therefore disappear when another tab opens Notebook or the maker reloads. D-06 explicitly says the draft remains until Cancel discards it. [11-CONTEXT.md:26](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-CONTEXT.md:26), [11-10-PLAN.md:162](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-10-PLAN.md:162)
- **MEDIUM:** Eligibility is gated on drafts loading, while versions and batches load independently. Temporary empty collections can expose Edit before disqualifying records arrive. [useRecipeData.js:47](/Users/mark/Documents/projects/sprinkles/app/src/ui/useRecipeData.js:47), [useRecipeData.js:86](/Users/mark/Documents/projects/sprinkles/app/src/ui/useRecipeData.js:86)

**Suggestions**

- Provide a reachable closed-edit recovery state with explicit discard, preserving the draft until then.
- Gate eligibility on all required reads completing.
- Test stale refusal followed by reload and a second-tab Notebook visit.

**Risk assessment: HIGH.** Current cleanup instructions can silently delete work the accepted decision promises to keep.

## 11-13

**Summary:** A thorough final verification plan, with appropriate separation between automated checks and pending iPad verification. Two proof gaps remain.

**Strengths**

- Reuses the first-activation device discipline, which activates once and fails when the outcome does not follow. [10-device-steps.mjs:87](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-device-steps.mjs:87)
- Keeps real iPad PDF verification explicit rather than treating browser emulation as completion. [11-CONTEXT.md:48](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-CONTEXT.md:48)

**Concerns**

- **MEDIUM:** The inherited evidence routine waits for page notices to disappear before taking screenshots. The final vC1 evidence will therefore omit the very “Recipe saved.” notice it is meant to demonstrate. [10-board-check.mjs:473](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-board-check.mjs:473)
- **HIGH:** New scenarios bypass baseline comparison completely. Their proposed assertions check selected counts and created records, but do not prove that creation or editing left existing seeded records unchanged. A regression triggered only by the new Save flow could escape the 94 existing snapshots. The harness already supports complete store dumps. [11-01-PLAN.md:124](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-01-PLAN.md:124), [10-walk.mjs:186](/Users/mark/Documents/projects/sprinkles/.planning/phases/10-the-creation-editor-without-save/10-walk.mjs:186)

**Suggestions**

- Capture notice panels while their expected notice is visible.
- In every new scenario, compare pre-existing records before and after, excluding only explicitly created or edited records.
- Preserve the distinction between automated completion and iPad verification pending.

**Risk assessment: HIGH.** Broad coverage is planned, but the evidence currently overstates preservation guarantees.

---

**Overall assessment: request changes before execution.**

The dependency ordering is workable, and the plans reuse the repository’s architecture well. The highest-priority revisions are:

1. Resolve incomplete-grams folding and finite-number validation.
2. Enforce draft ownership during Save-over.
3. Preserve removed ingredients when reopening existing roots.
4. Retain stale edit drafts until explicit discard.
5. Repair the target-remove board comparison and strengthen final preservation assertions.

These changes should fit within the existing phase scope.

---

## OpenCode Review (opencode-astra)

I’ll check the plans against the source, focusing on allocation, transaction safety, kept drafts, and whether the proposed checks can catch regressions. Then I’ll give each of the 13 plans its own review.

Two verification gaps are confirmed in the source: the board self-test changes only font size, so the planned text-only fixtures cannot pass it; and the walk’s proposed normalization removes old target values from regression coverage. I’m also tracing whether edit-draft guards protect the shared draft key when reads are delayed or another tab is active.

The baseline suite passes: **120 files, 3,771 tests**. I’ve found substantive plan issues: one global row order cannot provide independent ordering within each step; dropping step tombstones at Save permits key reuse after reopening; and the stale-edit walk bypasses the real batch-save path, which deletes the shared draft record.

Source review completed for **all 13 plans**, against the app baseline at `cf64aa70`.

Verification performed:
- `npm --prefix app test`: **120 files, 3,771 tests passed**.
- WebKit inspection of the approved boards, including a reproduction of the text-only self-test problem.
- Focused Node probes confirming numeric-overflow handling and duplicate-target collapse.
- No repository files were changed.

## 11-01

**Summary.** The harness needs correction before it can serve as the phase’s acceptance gate. Its isolation and baseline strategy are sound, but one required self-test cannot pass as specified, and the proposed normalization removes meaningful regression coverage.

**Strengths**
- Recording from a detached worktree and building outside `app/dist` follows an existing, working isolation mechanism: `.planning/phases/10-the-creation-editor-without-save/10-walk-record-base.sh:38–44`.
- The inherited comparator explicitly detects duplicate scenarios and steps before comparing leaves, preventing duplicate names from concealing differences: `.planning/phases/10-the-creation-editor-without-save/10-walk.mjs:893–930`.

**Concerns**
- **HIGH — The text-only board self-test cannot detect the injected fault.** The planned `vC1-seeded` fixture checks only text (`.planning/phases/11-steps-structure-save-and-print/11-01-PLAN.md:197`). The engine’s self-test changes only font size and requires a resulting failure (`.planning/phases/10-the-creation-editor-without-save/10-board-check.mjs:554–566`). Its text reader uses `textContent`, which the injection does not change (`:184`). I reproduced this in WebKit.
- **HIGH — Normalization discards actual historical values.** Removing every `.struck-value` inside a target chip (`11-01-PLAN.md:120`) makes a wrong or missing old temperature invisible to `methodHash`. Those spans currently contain meaningful comparison data: `app/src/ui/Method.jsx:395–405`. Normalizing the repeated label is justified; dropping the old value is broader than the intended presentation allowance.
- **MEDIUM — Whole-new-scenario exemption is broader than the record allowance.** The plan exempts the entire new scenario (`11-01-PLAN.md:27`), including its store dumps. Existing scenarios run in separate contexts (`10-walk.mjs:266–268`), so they cannot detect a new creation scenario accidentally changing a seeded recipe.

**Suggestions**
- Give each self-test a mutation affecting a property it actually checks, or add a font/geometry assertion to text-only fixtures.
- Hash normalized target semantics—label, old value, new value, removal—rather than deleting comparison content.
- In every new scenario, compare pre/post stores and permit changes only to explicitly identified new records.

**Risk Assessment: HIGH.** As written, the harness can both reject correct implementations and overlook relevant regressions.

## 11-02

**Summary.** The pure-domain boundary and allocation invariant are appropriate. However, global row ordering cannot implement independent within-step ordering, and the key ledger stops satisfying its promise once Save removes tombstones.

**Strengths**
- Treating `uses` as placement authority avoids the genuine collision between the existing placeholder `step: 1` and the first allocated step key. See `app/src/domain/creation.js:134–138` and `app/src/domain/stepKeys.js:24–35`.
- The proposed allocation checks address the distinction between draft portions, which require positive step keys, and saved portions, which accept any finite step: `app/src/domain/draft.js:412–426`; `app/src/store/transfer.js:103–113`.

**Concerns**
- **HIGH — Moving a split row can reorder another step.** The plan explicitly permits this side effect (`.planning/phases/11-steps-structure-save-and-print/11-02-PLAN.md:173`). The existing grouping algorithm derives every group’s ordering from the same `rows` iteration (`app/src/ui/IngredientTable.jsx:36–61`). If rows A and B occur in both steps, swapping them for step 1 also swaps them for step 2. That conflicts with “within its step only” in `.planning/sketches/014-steps-structure-save/CONTRACT.md:27`.
- **HIGH — Deleted keys can be reused after Save/reopen.** `nextStepKey` knows only the highest key remaining in the supplied method (`app/src/domain/stepKeys.js:24–35`). Create steps 1 and 2, remove 2, save without its tombstone, reopen, then add: the allocator returns 2. The accepted context says no removed key is handed out again (`.planning/phases/11-steps-structure-save-and-print/11-CONTEXT.md:65`).
- **MEDIUM — `addGrams` has contradictory requirements.** The behavior example expects `addGrams('4.', '200')` to preserve `'4.'`, while the implementation instruction returns the only parseable side, `'200'` (`11-02-PLAN.md:161,175`). The parser rejects `'4.'` (`app/src/domain/lineage.js:201–213`), so these instructions cannot both hold. Discarding malformed text also silently removes an outstanding input error.

**Suggestions**
- Settle and represent independent per-step ordering before implementing `moveRow`.
- Preserve a durable issued-key watermark, or obtain an explicit decision narrowing key non-reuse to one editing session.
- Define one incomplete-input folding policy and test malformed text on either side, blank lines, three-way splits, and Save/reopen sequences.

**Risk Assessment: HIGH.** These are data-model and requirement conflicts that later UI tests cannot repair.

## 11-03

**Summary.** The transaction design directly addresses partial writes and stale eligibility. The main gap is that Save-over deliberately succeeds while another kind of draft occupies the same key, potentially invalidating and subsequently deleting that draft.

**Strengths**
- Copying `importAll`’s explicit abort handling is justified. Its rollback test specifically exercises a synchronous cloning failure after earlier writes have been queued: `app/src/store/repository.test.js:139–156`; implementation at `app/src/store/repository.js:240–280`.
- Checking Sheet-code uniqueness inside the transaction reuses a mechanism that distinguishes collisions from changing an existing version’s code: `app/src/domain/sheetCode.js:230–263`.

**Concerns**
- **HIGH — Preserving a foreign draft record does not preserve its work.** The plan requires successful Save-over with a kept `plan` draft left in place (`.planning/phases/11-steps-structure-save-and-print/11-03-PLAN.md:171–176`). But a plan draft must match the version’s row counts, portion counts, and step keys (`app/src/domain/draft.js:242–271`). Restructuring the version can invalidate it, after which restore deletes it (`app/src/ui/useKeptDraft.js:184–187`).
- **HIGH — UI exclusivity is not storage exclusivity.** Draft writes and deletes are unconditional operations on one `versionId` key (`app/src/store/repository.js:309–320`). An editor already open in another tab can replace the draft between route loading and Save. The proposed transaction reads the draft but uses its kind only to decide whether to delete it.

**Suggestions**
- Refuse Save-over when an incompatible draft occupies the key, checking inside the same transaction.
- Define conditional draft write/delete semantics using the expected draft ownership or content, so stale callers cannot overwrite or delete another editor’s draft.
- Add interleaving tests where a foreign draft appears after Edit opens, including a structural change that would invalidate it.

**Risk Assessment: HIGH.** Atomic recipe/version writes are covered, but the shared draft record remains vulnerable to lost work.

## 11-04

**Summary.** Extracting shared read-only step components is a good fit for the existing duplication. The important missing edge case is repeated target labels: switching rendering to the diff descriptors can make valid targets disappear.

**Strengths**
- Rendering removed targets from the diff fixes a real omission: `buildTargetDiff` includes baseline-only labels (`app/src/domain/diff.js:152–168`), while current Show changes iterates only current targets (`app/src/ui/Method.jsx:760–774`).
- Keeping the existing recording lead and controls while replacing only the read-only target/purpose/aside fragments preserves distinct behavior visible in `app/src/ui/Method.jsx:798–842`.

**Concerns**
- **MEDIUM — Duplicate labels collapse in the proposed renderer.** `buildTargetDiff` constructs maps keyed by label and deduplicates labels (`app/src/domain/diff.js:155–168`). The planned renderer maps those descriptors (`.planning/phases/11-steps-structure-save-and-print/11-04-PLAN.md:146–148`). Two targets both named `temp` become one, even when comparing a version with itself. I reproduced this with the current domain function. The store validator permits repeated labels (`app/src/store/transfer.js:188–196`).
- **MEDIUM — Browser coverage does not exercise all modified branches.** Both planned board fixtures visit the reading page (`11-04-PLAN.md:112`), while the closed pen and Show changes have separate markup and surrounding content (`app/src/ui/Method.jsx:382–449,737–792`).

**Suggestions**
- Preserve target multiplicity in diff matching, or obtain a decision on duplicate-label refusal before adding any new validation rule.
- Add browser fixtures for a closed pen step and Show changes, covering changed, removed, added, and duplicate-label targets.

**Risk Assessment: MEDIUM.** The component extraction is straightforward, but comparison rendering can omit authored information.

## 11-05

**Summary.** This is appropriately small production work built on the existing print pipeline. Its main completeness issue is the case where steps exist but every ingredient remains unplaced.

**Strengths**
- The printed foot already reads the stored Sheet code, and Search resolves that stored value rather than recomputing it: `app/src/ui/PrintSheetPages.jsx:81–83`; `app/src/ui/SheetCodeSearch.jsx:81–84`.
- Empty Before you start and Instructions sections are already omitted by the page plan, supporting the decision to verify rather than introduce new print sections: `app/src/ui/PrintSheetPages.jsx:318–330`.

**Concerns**
- **MEDIUM — The lone-unplaced-group rule conflicts with the newly saved case.** The plan preserves suppression of the heading whenever there is one unplaced group. Existing code does exactly that (`app/src/ui/PrintSheetPages.jsx:51–65`). Therefore a recipe with a valid step using no rows prints no “Not in a step yet” heading, although D-09 allows that recipe and says its unplaced rows read under that heading (`.planning/phases/11-steps-structure-save-and-print/11-CONTEXT.md:31`).
- **MEDIUM — The proposed print assertions do not establish “no blank band.”** Checking that each heading has a nonzero-height sibling does not measure spacing or pagination (`.planning/phases/11-steps-structure-save-and-print/11-05-PLAN.md:133`). The document also contains a hidden measuring copy using the same page markup (`app/src/ui/PrintSheetPages.jsx:433–438`).

**Suggestions**
- Add a fixture with live steps, empty `uses`, and all rows unplaced; distinguish it from a recipe with no steps.
- Wait for `[data-print-ready="true"]`, scope assertions to `.print-route__pages`, and check relevant section geometry and overflow. The readiness signal already exists at `app/src/ui/PrintSheet.jsx:134–155`.

**Risk Assessment: MEDIUM.** Production changes are limited, but one required saved shape and part of the visual proof are missing.

## 11-06

**Summary.** The editor composition follows existing component boundaries and focus patterns. Its acceptance specification nevertheless contradicts the newly approved target-remove control, and a proposed CSS selector reaches into Preview.

**Strengths**
- Reusing `useOnDemandField` preserves its deliberate blur-time value reading and user-initiated focus behavior: `app/src/ui/Method.jsx:45–73`.
- The creation-specific method slot fits the existing shared Sheet boundary, where method visibility and the region wrapper are already centralized: `app/src/ui/RecipeSheet.jsx:89–96,173–197`.

**Concerns**
- **MEDIUM — The pE1 comparison cannot match the added remove control.** The plan adds a `.text-control` inside each target chip, then compares the count and text of all `.method-step__targets .text-control` elements (`.planning/phases/11-steps-structure-save-and-print/11-06-PLAN.md:151,190`). WebKit inspection confirms the approved pE1 has four matching controls and no target-remove control. Avoiding box checks does not avoid the count/text mismatch; the engine compares those explicitly (`10-board-check.mjs:292–304`).
- **MEDIUM — Preview inherits the open-editor target alignment.** The proposed `.mk-step .method-step__targets` rule uses `align-items: center` (`11-06-PLAN.md:159`). Preview is nested inside that `.mk-step` (`:155`), so this more-specific selector also overrides the read-only tag row’s required baseline alignment. The required treatment is documented at `.planning/sketches/014-steps-structure-save/CONTRACT.md:58`.

**Suggestions**
- Compare board-drawn target actions with a selector excluding the new chip remove control; verify remove separately against D-22.
- Scope open-editor target rules to direct editor children or an explicit editor-only modifier.
- Give multiple target fields distinguishable accessible names and specify focus after removing a target.

**Risk Assessment: MEDIUM.** The implementation approach is reasonable, but the browser gate needs internally consistent selectors and scope.

## 11-07

**Summary.** Per-line state is the right correction for split ingredients. The plan’s execution checks need adjustment: its first task changes text before updating the assertions it runs, and its final self-tests contain no font-sensitive checks.

**Strengths**
- Replacing row-only grams state addresses the exact limitation in current creation rendering: raw values, messages, and refs currently use row identity or line zero (`app/src/ui/IngredientTable.jsx:650–671`).
- Reusing `formatPortionLine` and the existing grouping mechanism keeps displayed totals and portions aligned with the reading table: `app/src/ui/IngredientTable.jsx:605–633`.

**Concerns**
- **MEDIUM — Task 1’s verification runs assertions that it deliberately leaves obsolete.** Task 1 renames the heading, while Task 2 updates `IngredientTable.test.jsx`. Existing assertions require the literal old heading (`app/src/ui/IngredientTable.test.jsx:827,1688,1706`). Task 1 therefore cannot meet its own green-test requirement.
- **MEDIUM — The pC1-table and pD1-table self-tests cannot detect the font injection.** Their planned checks are counts, text, values, and absence (`.planning/phases/11-steps-structure-save-and-print/11-07-PLAN.md:162–166`). None changes when the engine injects a one-pixel font; the engine requires a failure at `10-board-check.mjs:554–566`.
- **MEDIUM — Saved-table coverage repeats the lone-group omission.** Retaining the current non-creation heading rule (`app/src/ui/IngredientTable.jsx:597`) leaves all-unplaced rows unlabeled after Save even when live steps exist.

**Suggestions**
- Move affected text assertions into the task that changes the text.
- Use suitable self-test mutations for non-geometric panels, or add a stable font assertion.
- Test creation, saved reading, and pen views for “steps exist, no step uses any row.”

**Risk Assessment: MEDIUM.** The line-state design is good; the staged verification and saved-view edge case require repair.

## 11-08

**Summary.** The explicit post-render focus requests are a strong response to the WebKit risk. Remaining issues are ambiguous split-row controls and a board selector placed outside its declared measurement scope.

**Strengths**
- Stable item-based focus requests extend an existing working pattern instead of relying on browser focus surviving DOM reordering: `app/src/ui/CreationPage.jsx:136–154`.
- The chooser’s cancellation, placement, and focus outcomes are concrete and correspond to the approved interaction contract: `.planning/sketches/014-steps-structure-save/CONTRACT.md:30`.

**Concerns**
- **MEDIUM — Split-row Move controls have duplicate accessible names.** The plan labels them only with the ingredient name (`.planning/phases/11-steps-structure-save-and-print/11-08-PLAN.md:136`). A row in two steps consequently has two indistinguishable “Move Whole milk … down” controls. Existing pen removal deliberately includes the step in a split-line name (`app/src/ui/IngredientTable.jsx:204–210,850`).
- **MEDIUM — The completed pB1 spec searches for table heads inside Instructions.** It adds `tr.ingredient-table__step-head` to pB1 (`11-08-PLAN.md:175`), whose scope is `section.method-region`. The engine searches within that scope (`10-board-check.mjs:153–189`) and rejects a selector matching nothing on the board (`:285–290`).
- **LOW — Repeated identical announcements may be silent.** The proposed live region holds only the latest sentence. Moving different steps to the same position can repeat “Step 2 of 3.” The app already recognizes this issue and deliberately clears/re-announces repeated Search feedback: `app/src/ui/SheetCodeSearch.jsx:71–88`.

**Suggestions**
- Include step context in split-line control names or accessible descriptions.
- Put the step-head check in the separate `pB1-table` panel.
- Test repeated identical announcements and ensure each operation causes an observable live-region update.

**Risk Assessment: MEDIUM.** The interaction design is explicit, but accessibility and harness details remain incomplete.

## 11-09

**Summary.** Save’s atomic write and draft shutdown address the central creation milestone. The critical omission is what happens to edits or Cancel presses while Save is pending; the numeric gate also does not fully match stored-value validation.

**Strengths**
- Ending the writer before navigation addresses a real resurrection mechanism: unmount calls `flushPendingDraft`, which otherwise writes the pending record (`app/src/ui/useKeptDraft.js:35–43,292–301`).
- Building saved records with explicit step and note shapes is necessary for the existing validator: `app/src/store/transfer.js:168–196,205–215`.

**Concerns**
- **HIGH — Input accepted during Save can be lost.** The plan disables Save but does not disable editable fields or Cancel (`.planning/phases/11-steps-structure-save-and-print/11-09-PLAN.md:126`). Existing creation inputs remain editable (`app/src/ui/CreationPage.jsx:255–271`). After `buildCreation` captures one payload, later typing can update the draft while `endDraft` suppresses persistence; successful navigation then discards that newer text. Cancel can likewise race an already-running save.
- **MEDIUM — `gramsDraftMessage` does not reject numeric overflow.** It rejects only parser result `null` (`app/src/domain/lineage.js:212–227`). A 309-digit integer produces `Infinity` and no field message—I confirmed this directly. The row constructor then throws because grams are not finite (`app/src/domain/versionRow.js:48–49`), contradicting the promised complete field-level gate.
- **MEDIUM — Lost work during a delayed write is not covered by the double-press test.** The specified tests check duplicate Save presses and rejection, not mutations or Cancel while the transaction is unresolved (`11-09-PLAN.md:130`).

**Suggestions**
- Define an explicit in-flight state that prevents additional edits and conflicting cancellation, or preserves and reconciles newer input.
- Add a deferred-promise test that attempts typing, Cancel, and navigation during Save.
- Require finite parsed grams in the gate and keep the failure attached to the affected line.

**Risk Assessment: HIGH.** The normal successful path is well specified, but delayed storage can expose accepted-input loss.

## 11-10

**Summary.** Reusing the creation editor and introducing a sibling draft kind are appropriate. This plan has the most serious remaining recovery problems: conversion can change the saved formula, stale drafts are silently discarded, and the concurrency test bypasses the production path that threatens them.

**Strengths**
- The recipe-page restore guard addresses a verified destructive behavior: unfamiliar drafts currently fail matching and are deleted at `app/src/ui/useKeptDraft.js:184–187`.
- Keeping a separate clean seed lets untouched Edit avoid the current creation branch’s unconditional persistence (`app/src/ui/useKeptDraft.js:238–246`).

**Concerns**
- **HIGH — `draftFromVersion` is not lossless for existing valid roots.** The specified conversion copies rows and portions without respecting their removal flags, and retains only portions resolving to live steps when a row has placements (`.planning/phases/11-steps-structure-save-and-print/11-10-PLAN.md:117`). Removal has explicit semantic meaning in `app/src/domain/rows.js:31–34,65–77`; rebuilding through `rowFromLibraryRecord` makes rows active (`app/src/domain/versionRow.js:71–77`). This can resurrect removed ingredients or lose an unplaced portion. It is reachable through the existing zero-batch Save-over path, not just malformed imports (`app/src/ui/RecipePage.jsx:301–306`; `app/src/ui/useVersionPen.js:225–242`).
- **HIGH — Quiet cleanup contradicts draft retention.** The plan deletes an edit draft when an ineligible version is reopened (`11-10-PLAN.md:162`). D-06 says the draft is kept and Cancel discards it (`11-CONTEXT.md:26`). A stale refusal followed by reload should not silently destroy the work.
- **HIGH — The stale-edit walk bypasses the dangerous production operation.** It inserts a batch directly into IndexedDB (`11-10-PLAN.md:193`). The real batch-save path subsequently calls `discardDraft()` (`app/src/ui/useBatchRecording.js:477–478`), whose deletion is unconditional (`app/src/ui/useKeptDraft.js:60–67`). The proposed walk therefore cannot prove retention during a real second-tab batch save.

**Suggestions**
- Define conversion for removed rows, removed portions, removed steps, and mixed placed/unplaced portions; assert unchanged active quantities and balance before and after a no-op edit/save.
- Preserve stale work with an explicit recovery/discard path on the landing surface.
- Exercise an actual second-tab batch or child-version save, including its draft cleanup, and make cleanup ownership-aware.

**Risk Assessment: HIGH.** Formula preservation and unsaved-work recovery are not yet guaranteed.

## 11-11

**Summary.** The shared message map and field-level feedback are coherent. Two integration details are missing: the Kind component cannot currently receive the required accessibility attributes, and one first-error focus target can be absent.

**Strengths**
- The plan follows the actual `FieldFeedback` contract: errors replace quiet, aria-hidden Required guidance in the same location (`app/src/ui/FieldFeedback.jsx:4–15`).
- Recomputing messages from the current draft avoids keeping stale validation state alongside controlled fields. Existing creation fields already update through functional state changes (`app/src/ui/CreationPage.jsx:161–165`).

**Concerns**
- **MEDIUM — The Kind accessibility work requires an unlisted component change.** `Segmented` owns the radiogroup, accepts a fixed prop list, and does not forward `aria-describedby` or `aria-invalid` (`app/src/ui/Segmented.jsx:32,59–69`). Changing only `CreationSetup` cannot attach the promised attributes to that existing group as specified at `.planning/phases/11-steps-structure-save-and-print/11-11-PLAN.md:130`.
- **MEDIUM — “No rows” can point focus at a nonexistent Add ingredient button.** The picker replaces Add ingredient while open (`app/src/ui/CreationPage.jsx:325–339`), and the planned heading action preserves that behavior. A refused Save with no rows and the picker open cannot focus `.ingredient-table-region .mk-head-act`.

**Suggestions**
- Add `Segmented.jsx` and its tests to the plan, with explicit error-description and invalid-state support.
- Define a picker-open focus fallback, such as its search field or Cancel.
- Test first-error focus after feedback has rendered, including repeated refused presses and both create/edit modes.

**Risk Assessment: MEDIUM.** The validation architecture is sound, but the promised accessibility contract is not fully implementable within the listed changes.

## 11-12

**Summary.** This plan correctly identifies the multiple surfaces that expose conflicting actions. However, it treats asynchronous, once-loaded state as an authoritative lock, leaving both initial-load and cross-tab holes.

**Strengths**
- Guarding the page’s handlers as well as hiding controls is necessary because route intents call the opener directly: `app/src/ui/RecipePage.jsx:210–214`.
- Extending both Home action locations is appropriate: `HomeLead` delegates to `RowActions`, which also supplies the normal row actions (`app/src/ui/RecipeList.jsx:143–174,196–229`).

**Concerns**
- **HIGH — Loading is treated as unlocked.** The plan sets `editState` to `null` until drafts load, and locks recording only when it equals `'editing'` (`.planning/phases/11-steps-structure-save-and-print/11-12-PLAN.md:116`). The page can render before that read resolves (`app/src/ui/RecipePage.jsx:274–295`). A fast opener can therefore start a pen over an existing edit.
- **HIGH — Eligibility and draft state become stale.** Drafts and versions are read once per version ID (`app/src/ui/useRecipeData.js:65–102`); `allBatches` is independently loaded without a readiness flag (`:188–202`). The proposed state can temporarily offer Edit before the other reads settle and never observes a draft created in another tab. Unconditional draft writes remain capable of overwriting it.
- **MEDIUM — The import state conflates an open edit route with a kept creation.** The plan makes `creationStateFromRoute` return `'present'` for `/edit` (`11-12-PLAN.md:179`). The current consumer interprets `'present'` as a new-recipe draft and immediately emits the creation refusal (`app/src/ui/Shell.jsx:428–431`). The new behavior needs a distinct state, not just another route matching the old state.

**Suggestions**
- Represent loading/unknown explicitly and withhold conflicting openers until all required reads settle.
- Add a defined refresh/invalidation mechanism for draft and eligibility changes, backed by conditional repository writes.
- Use distinct import-guard states for kept creation, kept edit, and untouched open edit; test their wording and precedence.
- Add delayed-read tests and two-tab tests rather than relying only on immediately resolved repository stubs.

**Risk Assessment: HIGH.** The UI covers the right surfaces, but its proposed state model does not enforce the exclusivity it claims.

## 11-13

**Summary.** The final proof plan appropriately includes production-build interaction checks and keeps real iPad verification pending. Its evidence capture and device checklist need refinement before they support the full completion claim.

**Strengths**
- Requiring first-activation success improves on the older walk’s retry-until-open behavior. The reusable device helper activates once and fails if the outcome does not arrive (`.planning/phases/10-the-creation-editor-without-save/10-device-steps.mjs:76–88`).
- Keeping real iPad print verification distinct is justified by the existing engine-specific print sizing (`app/src/ui/PrintSheetPages.jsx:22–30`) and is explicitly required by the plan (`.planning/phases/11-steps-structure-save-and-print/11-13-PLAN.md:38`).

**Concerns**
- **MEDIUM — Evidence capture removes the success notice before taking the picture.** The inherited screenshot routine waits for `.page-status` to become empty (`10-board-check.mjs:473–482`). The final vC1 pair would therefore omit the very “Recipe saved.” card that the board draws, even if its earlier measurement passed.
- **MEDIUM — Device steps do not cover row Move focus or step-removal folding.** The prescribed sequence moves steps and removes rows, but never moves a row or removes a step containing a split portion (`11-13-PLAN.md:136,175`). Those are distinct DOM and allocation paths; the existing table renders lines inside separate groups (`app/src/ui/IngredientTable.jsx:36–76`).
- **MEDIUM — “All boards pass” remains weaker than the stated final proof unless the inherited harness gaps are corrected.** In particular, the new scenarios’ seeded-record preservation and old target values need explicit assertions rather than relying on the 94 unchanged scenarios.

**Suggestions**
- Add an evidence option that preserves and captures notices when the panel explicitly measures them.
- Extend the same device check with a row move by keyboard/touch and removal of a split-row step, verifying focus and total preservation.
- Require final evidence to come from the corrected harness, and retain the distinction between automated completion and the pending iPad result.

**Risk Assessment: MEDIUM.** The final verification structure is appropriate, but its current checks do not substantiate every claimed outcome.

## Overall assessment

**Overall risk: HIGH. Revise before execution.**

The principal blockers are:

1. **Structure invariants:** independent within-step row order and step-key non-reuse across Save/reopen.
2. **Draft integrity:** conditional ownership checks for writes/deletes, real multi-tab tests, and preservation of stale edits.
3. **Lossless reopening:** correct handling of removed and unplaced portions in saved first versions.
4. **Save lifecycle:** preventing edits or Cancel from racing an in-flight save.
5. **Trustworthy verification:** executable self-tests, narrower normalization, correct board scopes, and protection of seeded records inside new scenarios.

The dependency waves are broadly sensible, and the domain/store/UI division matches the repository. The problem is not insufficient planning detail; several detailed mechanisms contradict the guarantees they are intended to prove.

**Before execution, what test will demonstrate that a real second-tab save cannot overwrite or delete the first tab’s kept edit?**

---

## OpenCode Review (opencode-argon)

## 11-01

### 1. Summary
Plan 11-01 builds the Phase 11 WebKit verification harnesses (`11-walk.mjs`, `11-walk-record-base.sh`, `11-walk-check.sh`, `11-walk-before.json`, `11-board-check.mjs`, and `11-board-selftest.mjs`) before any application code changes. It splits the walk's page-text hash into `textHash` and a normalized `methodHash` so the on-screen printed method treatment in `11-04` does not invalidate the 94 existing snapshots, adds an allow-list for the five new Phase 11 scenarios, and extends the board engine with store seeding (`seed`), anchored full-page panels, and a computed `type` check.

### 2. Strengths
- **Isolated baseline recording**: Copying `.planning/phases/10-the-creation-editor-without-save/10-walk-record-base.sh:19-44` to build `BASE=cf64aa70` from a detached git worktree into `$TMPDIR/sprinkles-11` guarantees `app/dist` is never touched while recording `11-walk-before.json`.
- **Self-verifying normalization and allow-list**: Adding `selftest` (10 cases) and `normtest` on top of `.planning/phases/10-the-creation-editor-without-save/10-walk.mjs:960-1034` proves both that `methodHash` absorbs only the `.method-step__purpose-label` / `.struck-value` / uppercase label changes and that leaf mutations in the 12 existing scenarios are still rejected.
- **Store seeding in the board engine**: Extending `arrive()` in `.planning/phases/10-the-creation-editor-without-save/10-board-check.mjs:350-405` with `seed: { recipes, versions, batches, drafts }` cleanly supports `save.html` (`vC1`) and `first-version.html` (`fA1`–`fC1`) without requiring `11-03`'s new repository methods to exist yet.

### 3. Concerns
- **[HIGH] `walk.open(route)` and `snapshot(page)` in `10-walk.mjs` assume `.notebook` is always present, which fails on `/notebook` (`NotebookPlace.jsx`)**: In `.planning/phases/10-the-creation-editor-without-save/10-walk.mjs:281`, `walk.open(route)` executes `await page.waitForSelector('.notebook');`, and in `10-walk.mjs:178`, `snapshot(page)` reads `document.querySelector('.notebook')?.innerText ?? ''`. All 12 existing scenarios open `VERSION_ROUTE` or `BATCH_ROUTE` (`RecipePage.jsx:366`, which renders `<div className="notebook">`). However, the new Phase 11 scenarios (`create-recipe` in `11-09`, `create-save-refused` in `11-11`, `edit-kept` in `11-13`) open `/notebook` (`app/src/ui/NotebookPlace.jsx:83,96,279,288`), which renders `<div className="list-page place nb">` and has **no `.notebook` element**. Calling `walk.open('/notebook')` will time out waiting for `.notebook`, and `walk.step('listed')` / `walk.step('notebook')` on `/notebook` will record an empty `text` string.
- **[MEDIUM] `pictures()` in `11-board-check.mjs` will fail or clip out `section.method-region` and `.page-status` when `--evidence` runs in `11-13`**:
  1. In `.planning/phases/10-the-creation-editor-without-save/10-board-check.mjs:489-498`, `pictures()` uses `boardClip = b.rects.root` when `kind === 'full'`, and `intersect(b.rects.scope, b.rects.root)` otherwise. For `11-board-reading.mjs` (`11-04`), `vC1` (`save.html`) and `fA1` (`first-version.html`) are full-page panels (`.p4-win` height `1024px` and `620px` with `overflow: hidden`) anchored at `section.method-region`, which begins at `y = 1165px` (`.planning/sketches/014-steps-structure-save/README.md:99`). When `11-13` runs `--evidence`, `intersect(b.rects.scope, b.rects.root)` yields `h = 0` (throwing a Playwright screenshot clip error), whereas `b.rects.root` clips off `section.method-region` completely.
  2. In `10-board-check.mjs:476-482`, `pictures()` waits up to 6s for `.page-status` to become empty before taking the app screenshot. On panel `vC1` in `11-board-save.mjs` (`11-09`), `.page-status` (`"Recipe saved."`) is a measured element on the board itself, so waiting for it to clear before taking the evidence screenshot will capture `vC1-app.png` without the notice card.

### 4. Suggestions
- In `11-walk.mjs`, update `walk.open(route)` (`10-walk.mjs:281`) to `await page.waitForSelector('.notebook, .nb')` and update `snapshot(page)` (`10-walk.mjs:178`) to fall back to `document.querySelector('.nb')?.innerText ?? ''` when `.notebook` is absent (which changes nothing for the 12 existing scenarios that all sit on `.notebook`).
- In `11-board-check.mjs`, update `GATHER` (`10-board-check.mjs:128-167`) so an anchored `full` panel records `out.rects.scope`, and in `pictures()` (`10-board-check.mjs:474-502`), skip waiting for `.page-status` to clear when `panel.elements` measures `.page-status`, and expand `.p4-win`'s height/overflow (or use `b.rects.scope` without intersecting `b.rects.root`) when taking evidence screenshots of an anchored full-page panel whose scope sits below the window's fold.

### 5. Risk Assessment
**MEDIUM** — No application files are modified, and the baseline walk and board self-test are well-structured, but the `.notebook` selector assumption in `11-walk.mjs` and the `pictures()` clipping/notice behavior in `11-board-check.mjs` will surface in `11-09` and `11-13` if not addressed in `11-01`.

---

## 11-02

### 1. Summary
Plan 11-02 introduces `app/src/domain/creationSteps.js` and updates `creationSheetVersion` and `removeRow` in `app/src/domain/creation.js`. It establishes `step.uses` as the single source of truth for row placement in a create draft, projects unplaced rows at `UNPLACED_STEP = 0`, keeps removed steps as blanked tombstones so `nextStepKey` never reissues a key within a session, folds grams back into the first remaining line on step removal or unticking, and verifies the invariant across 500 seeded random operations.

### 2. Strengths
- **Resolves the `step: 1` placeholder collision (G-2)**: By deriving placement exclusively from `liveSteps(draft)`'s `uses` arrays and projecting unplaced rows to `UNPLACED_STEP = 0`, `groupPortionsByStep` (`app/src/ui/IngredientTable.jsx:50-56`) naturally places unplaced rows into the trailing `'unallocated'` group because `displayNumberOf(stepNumberMap, 0)` (`app/src/domain/stepNumbers.js:45-47`) returns `null`, while `fitsCreatePortion` (`app/src/domain/draft.js:412-420`, which requires `portion.step > 0` in the draft) remains untouched.
- **Decimal-safe `addGrams` fold-back**: Performing gram addition in integer hundredths (`Math.round(a * 100) + Math.round(b * 100)`) aligns with `NUMERIC_GRAMS_PATTERN = /^\d+(\.\d{1,2})?$/` in `app/src/domain/lineage.js:201` and avoids IEEE-754 floating-point drift (such as `0.1 + 0.2 = 0.30000000000000004`) that would fail `parseGramsDraft`.
- **Tombstone hygiene**: Blanking removed steps to `{ n, leadIn: '', instruction: '', uses: [], targets: [], removed: true }` in `removeStep` satisfies `nextStepKey(draft.method)` (`app/src/domain/stepKeys.js:24-36`) and `fitsCreateStep` (`app/src/domain/draft.js:433-437`).

### 3. Concerns
- **[MEDIUM] Three existing tests in `app/src/domain/creation.test.js` pin `step: 1` for unplaced rows in `creationSheetVersion`**: In `app/src/domain/creation.test.js:105-106`, `114`, and `124`, the existing tests call `creationSheetVersion(withRows([rowOf('600')]), records)` (where `method` is `[]`, so `row-a` is unplaced) and assert `step: 1` (`expect(version.rows[0].portions).toEqual([{ step: 1, grams: 0 }])`). Once `creationSheetVersion` projects unplaced rows at `UNPLACED_STEP = 0`, those three assertions will fail unless updated to `step: 0` (`UNPLACED_STEP`).
- **[LOW] `toggleStepUses` portion ordering when ticking an earlier step after a later step**: In `app/src/domain/creationSteps.js`, if a row is first ticked into Step 2 (`portions: [{ step: 2, grams: '600' }]`) and then ticked into Step 1, `rowLines(draft, rowId)` returns lines in `liveSteps` (method) order (`[step 1, step 2]`), whereas `toggleStepUses` "appends `{ step: n, grams: '' }`" to `row.portions`. If `removeStep(draft, 2)` later runs and folds into `rest[0]` of `row.portions` vs the first remaining line in method order, `row.portions` order and method order could diverge if Step 1 and Step 2 were reordered with `moveStep`.

### 4. Suggestions
- Explicitly note in Task 1 that the three existing unplaced-row assertions in `app/src/domain/creation.test.js:106,114,124` must be updated from `step: 1` to `step: UNPLACED_STEP` (`0`).
- In `removeStep` and `toggleStepUses`, always order `row.portions` (or select the target line to fold into) by the live steps' current method order (`placementOf(draft, row.id)`), as Task 2's prose specifies ("folds its grams into the first remaining line in method order"), rather than `rest[0]` in raw `row.portions` order.

### 5. Risk Assessment
**LOW** — Pure domain module with zero UI or store dependencies and strong property-based invariant coverage via `checkAllocation`.

---

## 11-03

### 1. Summary
Plan 11-03 extends `createRecipe` in `app/src/domain/newRecipe.js` with optional authored fields, adds `createRecipeWithVersion` and `saveFirstVersionOver` to `app/src/store/repository.js`, creates `app/src/domain/firstVersion.js` (`firstVersionRefusal`, `isEditableFirstVersion`, `editStateFor`), adds the `'edit'` draft kind and `draftMatchesEdit` to `app/src/domain/draft.js`, and adds `editPath` to `app/src/ui/notebookPaths.js`.

### 2. Strengths
- **Preserves existing `createRecipe` pins**: Keeping `targets` and `iceEd` as omitted keys when undefined in `app/src/domain/newRecipe.js:65-86` preserves all existing deep-equality tests in `app/src/domain/newRecipe.test.js`, while allowing `buildCreation` (`11-09`) to pass `targets` and `iceEd` so child versions inherit them via `KEYS_COPIED_WHEN_OWNED` (`app/src/domain/lineage.js:110`).
- **Single pure eligibility rule across tiers**: Extracting `firstVersionRefusal` and `editStateFor` into `app/src/domain/firstVersion.js` ensures `repository.saveFirstVersionOver`, `EditRoute`, `RecipePage`, and `NotebookPlace` never disagree on whether a version is editable, including the `libraryId !== null` check needed because `fitsCreateRow` (`app/src/domain/draft.js:425`) requires `isSafeName(row.libraryId)`.
- **Sibling `'edit'` kind avoids `CREATE_DRAFT_KEYS` churn**: Adding `'edit'` to `KINDS` (`app/src/domain/draft.js:53`) and refusing `'edit'` alongside `'create'` in `draftMatchesVersion` (`app/src/domain/draft.js:309`) keeps `draftMatchesCreate` and `CREATE_DRAFT_KEYS` untouched.

### 3. Concerns
- **[MEDIUM] Potential unhandled rejection on `tx.done` in `saveFirstVersionOver`'s business-refusal branch**: In `app/src/store/repository.js` (Task 2), when `firstVersionRefusal` returns a non-null reason (`'gone' | 'not-first' | 'has-batch' | 'has-child' | 'unlinked-row'`), the plan states: *"when refusal is not null, abort the transaction by hand, quiet the requests and resolve `{ saved: false, reason: refusal }` (a business refusal is a value, not a throw)"*. In `idb`, calling `tx.abort()` causes `tx.done` (`const done = tx.done`) to reject with `AbortError`. In `importAll` (`app/src/store/repository.js:273-280`), `for (const request of [...queued, done]) request.catch(() => {});` lives in the `catch` block. If `saveFirstVersionOver` calls `tx.abort()` and returns early inside `try` without attaching `done.catch(() => {})`, `tx.done` will trigger an unhandled promise rejection in Vitest and WebKit.
- **[LOW] `createRecipe` optional field validation should guard against `null` vs `undefined` for `targets` and `iceEd`**: In `app/src/domain/newRecipe.js`, `serveTempC` defaults to `null` (and accepts a finite number or `null`), whereas `targets` and `iceEd` are plain objects when provided (`{}` or `{ style, ... }`). Make sure the type check distinguishes `targets !== undefined` (must be a plain object, not `null` or an array) from `serveTempC` (finite number or `null`).

### 4. Suggestions
- In `saveFirstVersionOver` (`app/src/store/repository.js`), when `refusal !== null` before any write is queued, either attach `done.catch(() => {})` immediately before calling `tx.abort()` and returning `{ saved: false, reason: refusal }`, or simply let the read-only operations finish (`await done; return { saved: false, reason: refusal };`) since no `put` or `delete` has been queued yet.

### 5. Risk Assessment
**LOW** — Store transactions follow the battle-tested `importAll` pattern (`app/src/store/repository.js:240-282`) and are directly verified with `fake-indexeddb` forced-failure and collision tests.

---

## 11-04

### 1. Summary
Plan 11-04 implements the printed method treatment on screen (`StepReading.jsx`, `Method.jsx`, `notebook.css`, and `11-board-reading.mjs`) for the reading page, the version pen's closed steps, and Show changes (decision 014 2, D-18, D-26).

### 2. Strengths
- **Respects CSS contract suites (`cross-cutting.test.js` and `binder.test.js`)**: Keeping `.method-step__purpose, .method-step__aside` untouched in `app/src/styles/app.css:1174-1181` satisfies `app/src/styles/cross-cutting.test.js:769-772`, and placing `.target-chip__value`'s `text-decoration: underline` in `app/src/styles/notebook.css` under `.notebook` satisfies `app/src/styles/binder.test.js:322-324` (which pins `text-decoration: underline` in `app.css` to `.text-control` and `a` only).
- **Scoped modifier protects `.ingredient-table__flag` and open pen chips**: Scoping the tag-row rules to `.notebook .method-step__targets--tags` rather than `.method-step:not(.mk-step)` prevents stripping the border off the version pen's open step target chips (`app/src/ui/Method.jsx:186-211`) or the table's estimate flag (`app/src/ui/IngredientTable.jsx:627`).

### 3. Concerns
- **[HIGH] Outer `step.targets?.length > 0` / `draftStep.targets?.length > 0` guards in `Method.jsx` will hide a step's sole removed target in Show changes and the closed pen**: In `app/src/ui/Method.jsx:395` (closed pen branch) and `app/src/ui/Method.jsx:760` (Show changes branch), the targets block is currently gated on `{draftStep.targets?.length > 0 && (...)}` and `{step.targets?.length > 0 && (...)}`. Under D-18 and Task 2, `StepTargets({ targets, targetDiffs })` maps over `targetDiffs` (`stepDiff.targets` from `buildTargetDiff` in `app/src/domain/diff.js:155-170`) so that a target present in the baseline and removed in the current version (`to: null`) renders as one struck tag. However, if a step had one target in the parent and removed it in the child, `step.targets` (and `draftStep.targets`) has `length === 0` while `stepDiff.targets` has `length === 1`! If `Method.jsx:395,760` keeps the outer `draftStep.targets?.length > 0` / `step.targets?.length > 0` check (or if `StepTargets` checks `targets.length === 0` instead of `(targetDiffs ?? targets).length === 0`), the removed target will never render when it was the step's only target.
- **[LOW] `11-board-reading.mjs` panels `vC1` and `fA1` have `section.method-region` below the `.p4-win` fold**: As noted in `11-01`, `.planning/sketches/014-steps-structure-save/README.md:99` states that `section.method-region` starts at `y = 1165px` on `vC1` (1024px window) and `fA1` (620px window). While `GATHER` in `11-board-check.mjs` reads `getBoundingClientRect()` accurately, running `11-board-reading.mjs` with `--evidence` in `11-13` requires `11-board-check.mjs`'s `pictures()` to handle scopes below `.p4-win`'s clipped height.

### 4. Suggestions
- In `StepTargets` (`app/src/ui/StepReading.jsx`), check `const list = targetDiffs ?? targets; if (!list || list.length === 0) return null;`, and in `app/src/ui/Method.jsx:395,760`, render `<StepTargets targets={...} targetDiffs={stepDiff.targets} />` unconditionally (without the outer `draftStep.targets?.length > 0` / `step.targets?.length > 0` guard), and include a test in `Method.test.jsx` where a step's *only* target is removed (`step.targets = []`, `baseline.targets = [{ label: 'hold', value: '2 min' }]`).

### 5. Risk Assessment
**LOW** — Self-contained UI and CSS changes verified against both `Method.test.jsx`, style contract suites, `11-board-reading.mjs`, and `11-walk-check.sh`.

---

## 11-05

### 1. Summary
Plan 11-05 updates the printed bench sheet's unplaced group head from `'Unallocated'` to `'Not in a step yet'` in `app/src/ui/PrintSheetPages.jsx`, tests Sheet code persistence across `createRecipeWithVersion` and `saveFirstVersionOver` in `app/src/store/sheet-code-created.test.js`, and adds `11-print-check.mjs` to verify empty-section omission and code printing in WebKit under `@media print`.

### 2. Strengths
- **Minimal, targeted print change**: As verified in `app/src/ui/PrintSheetPages.jsx:52-65,318-333`, `wholePlan` already omits `.ps-before` when `blocks.notes.length === 0` and omits `PrintInstructions` when `blocks.steps.length === 0` while still printing `PrintClosingFoot` (`PrintSheetPages.jsx:312`). Changing only line 62 (`'Unallocated'` -> `'Not in a step yet'`) avoids touching `print.css`.
- **End-to-end Sheet code persistence test**: `app/src/store/sheet-code-created.test.js` directly verifies MAKE-12 and CODE-01 across `createRecipeWithVersion`, `findVersionsByCode`, and `saveFirstVersionOver` with reordered steps/rows and a renamed recipe.

### 3. Concerns
- **[MEDIUM] `11-print-check.mjs` waiting on `.ps-page` and querying the document will match the hidden `.ps-measure` box**: In `app/src/ui/PrintSheet.jsx:170-181` and `app/src/ui/PrintSheetPages.jsx:433-440`, `PrintSheet` renders `{sheet.measureElement}` (`<div className="ps-measure" aria-hidden="true"><div className="ps-box ps-frame"><SheetPage ... /></div>...</div>`) on the first render after store records load, *before* `useLayoutEffect` and `document.fonts.ready.then(lay)` (`PrintSheetPages.jsx:426`) populate `sheet.pages` and set `data-print-ready="true"` (`PrintSheet.jsx:135`). Furthermore, `.ps-measure` has `width: 0; height: 0; overflow: hidden; visibility: hidden` (`app/src/styles/print.css:518-525`) and stays in the DOM alongside `.print-route__pages`. If `11-print-check.mjs` only calls `waitForSelector('.ps-page')` and queries `h2.region-name` across `document`, it can race ahead of `data-print-ready="true"` and match elements inside `.ps-measure`.

### 4. Suggestions
- In `11-print-check.mjs` (Task 2), wait for `.print-route[data-print-ready="true"]` (and `.print-page--sheet .ps-page`), and scope all DOM assertions (`h2.region-name`, `.ps-before`, `.mp-step`, `.mp-tags`, `.mp-foot`) to `.print-route__pages` (or `.print-page--sheet`) so `.ps-measure` is never inspected.

### 5. Risk Assessment
**LOW** — Only one string literal changes in `PrintSheetPages.jsx`, and the rest of the plan is test and verification coverage.

---

## 11-06

### 1. Summary
Plan 11-06 builds the creation editor's heading rows (`div.mk-head-row` with `Add note`, `Add ingredient`, and `Add step`) in `RecipeSheet.jsx`, `IngredientTable.jsx`, and `CreationPage.jsx`, creates `app/src/ui/CreationSteps.jsx` for authoring open steps (lead-in, instruction, targets with remove controls, on-demand purpose and aside, and `Preview step`), and verifies layout against `instructions-steps.html` (`pA1`, `pB1`, `pE1`) in `11-board-steps.mjs`.

### 2. Strengths
- **Preserves `RecipePage.test.jsx` and `RecipeSheet.test.jsx` source-text pins**: Updating `showsMethodRegion` inside `app/src/ui/Method.jsx:519-521` keeps the call site `showsMethodRegion({ mode, steps: methodSteps })` in `app/src/ui/RecipeSheet.jsx:92` intact (`app/src/ui/RecipePage.test.jsx:1167`), and keeping `<Method steps={methodSteps} ... />` as the fallback when `creationMethod` is null preserves `RecipePage.test.jsx:1180` (`expect(source).toContain('steps={methodSteps}')`) and `RecipePage.shell.test.js:207` (`['<Method', 1]`).
- **Reuses `useOnDemandField` and `StepReading`**: Exporting `useOnDemandField` from `app/src/ui/Method.jsx:51` and rendering `StepReading` (`11-04`) inside `div.mk-preview` avoids duplicating collapse-on-blur or reading-step markup.

### 3. Concerns
- **[HIGH] `11-board-steps.mjs` panel `pE1` selector `.method-step__targets .text-control` with `[count, text]` will FAIL due to D-22's target `remove` button**: In Task 2, each target chip in `CreationSteps.jsx` renders a D-22 remove button (`<Button className="text-control" aria-label="Step ${number}, remove target ${i + 1}">remove</Button>`) inside `p.method-step__targets`, which is not drawn on any board (`CONTRACT.md` / D-22: *"No board draws the chip's remove"*). On panel `pE1` of `.planning/sketches/014-steps-structure-save/instructions-steps.html`, Step 1 has 1 target (`temp` / `85 °C`), `Add target`, and `Hide preview`, and Step 2 has `Add target` and `Preview step` — so the board has **4** elements matching `.method-step__targets .text-control`, whereas the app has **5** (including Step 1's `remove` target button). In `11-board-check.mjs` (`10-board-check.mjs:292-306`), checking `.method-step__targets .text-control` with `[count, text]` on `pE1` will fail both `count` (`board 4, app 5`) and `text` (`board "Add target", app "remove"` at index 0).
- **[MEDIUM] Existing `creating`-mode tests in `app/src/ui/RecipeSheet.test.jsx:160-174` assert `recipe-page--no-method` and `not.toContain('method-region')`**: In `app/src/ui/RecipeSheet.test.jsx:160-174`, two existing tests (`'draws the article without a method...'` and `'draws no Instructions, step head or Sheet code'`) call `renderCreating(draftOf())` (where `mode === 'creating'` and `steps` is `[]`) and assert `expect(markup).toContain('class="recipe-page recipe-page--no-method"')` (line 162) and `expect(markup).not.toContain('method-region')` / `expect(markup).not.toContain('aria-label="Instructions"')` (lines 171–172). Once `showsMethodRegion` returns `true` for `mode === 'creating'` in Task 1, both tests will fail unless updated alongside the `beforeFoot` -> `beforeAct` test update.
- **[LOW] `IngredientsHead` in `app/src/ui/IngredientTable.test.jsx:1847-1852` is called as a plain function in Test F**: `IngredientTable.test.jsx:1849` calls `const element = IngredientsHead(props({ onToggleShowChanges }))`. Since `act` defaults to `null` (or `undefined`) when not passed, `IngredientsHead` returning the existing branches when `!act` will keep Test A–F in `IngredientTable.test.jsx:1808-1853` green.

### 4. Suggestions
- In `11-board-steps.mjs` (Task 3, panel `pE1`), either scope the selector to exclude the D-22 target remove control or place the target's remove button inside `.target-chip` and use `.method-step__targets > .text-control`? Wait: on the board `instructions-steps.html`, `Add target` and `Hide preview` are direct children of `.method-step__targets` (`.method-step__targets > .text-control`), and if the D-22 target `remove` button is inside `span.target-chip`, then `.method-step__targets > .text-control` matches `Add target` and `Hide preview` / `Preview step` (count 4 on both board and app)! Even simpler, `CreationSteps.jsx` can put the target's `remove` button inside `span.target-chip` (after the value field), and `pE1` can check `.method-step__targets > .text-control` with `[count, text]`.
- In Task 1, explicitly mention updating `app/src/ui/RecipeSheet.test.jsx:160-174` to expect `class="recipe-page"` (no `recipe-page--no-method`) and `aria-label="Instructions"` in `creating` mode.

### 5. Risk Assessment
**MEDIUM** — Touches shared components (`RecipeSheet.jsx`, `Method.jsx`, `IngredientTable.jsx`, `CreationPage.jsx`) and WebKit board measurements; the `pE1` selector and `RecipeSheet.test.jsx:160-174` assertions need attention during execution.

---

## 11-07

### 1. Summary
Plan 11-07 wires step-to-ingredient allocation in the creation editor: the `change the ingredients` / `done` toggle and `Uses` checklist in `CreationSteps.jsx`, step heads and `"Not in a step yet"` in `IngredientTable.jsx`, split rows with per-line grams inputs (`gramsByLine` keyed by `${rowId}:${step}`) and portion notes, and WebKit board checks for `pC1` and `pD1` in `11-board-steps.mjs`.

### 2. Strengths
- **Per-line state keying (`${row.id}:${portion.step}`)**: Keying `gramsByLine`, `gramsInputsRef`, `leftUnreadable`, and `create-grams-error-${row.id}-${portion.step}` by `${row.id}:${portion.step}` cleanly extends Phase 10's per-row blur validation and focus management to split rows without colliding across steps.
- **Complete retirement of `'Unallocated'` on screen**: Replacing `'Unallocated'` at both `app/src/ui/IngredientTable.jsx:850` (split-line accessible name) and `app/src/ui/IngredientTable.jsx:930` (group head) and updating `app/src/ui/IngredientTable.test.jsx` satisfies D-12 across reading, developing, and creating modes.

### 3. Concerns
- **[HIGH] `app/src/ui/RecipeSheet.test.jsx:200-235` is not in `files_modified` and will throw `TypeError` when `creationRows.gramsByRow` is replaced by `gramsByLine`**: In `app/src/ui/RecipeSheet.test.jsx:200-206`, `creationRowsOf` builds `{ gramsByRow: new Map([['row-a', grams]]), focusRowId: null, ... }`, which is passed to `<RecipeSheet mode="creating" creationRows={creationRowsOf('60')} />` on lines 210, 220, and 231. When Task 2 changes `renderCreatingEntry` in `app/src/ui/IngredientTable.jsx:654` from `creationRows.gramsByRow.get(row.id)` to `creationRows.gramsByLine.get(`${row.id}:${portion.step}`)`, `RecipeSheet.test.jsx` (which is not run in Task 2's `<verify>`, but *is* run in Task 3's `npm --prefix app test`) will fail with `TypeError: Cannot read properties of undefined (reading 'get')`.
- **[MEDIUM] `IngredientTable.jsx` with `currentStepNumbers = null` in standalone tests (`IngredientTable.creating.test.jsx`)**: In `app/src/ui/IngredientTable.creating.test.jsx:39-50`, `<IngredientTable>` is mounted directly without `RecipeSheet` and does not pass `currentStepNumbers` (which defaults to `null` at `IngredientTable.jsx:469`). In `groupPortionsByStep` (`IngredientTable.jsx:50`), when `stepNumberMap` is `null`, `displayNumberOf` is not called and every portion is grouped into `unallocated` even when `steps` are provided!
- **[LOW] `registerGramsInput` key in `IngredientTable.jsx`**: In `app/src/ui/IngredientTable.jsx:488-502`, `blockedRowAttempt` (version pen) looks up `${blockedRowId}:${blockedLineIndex}` (where `blockedLineIndex` is `portionIndex`), whereas `creationFocusRowId` (creating mode) looks up `${creationFocusRowId}:0`. When Task 2 switches creating mode to `focusLine` (`${rowId}:${portion.step}`), make sure `registerGramsInput` in `GramsCell` (developing mode, line 823, keyed by `portionIndex`) and in `renderCreatingEntry` (creating mode, line 662, keyed by `portion.step`) do not break each other.

### 4. Suggestions
- Add `app/src/ui/RecipeSheet.test.jsx` to `files_modified` in Plan 11-07 and update `creationRowsOf` at `RecipeSheet.test.jsx:200-206` to pass `gramsByLine: new Map([['row-a:0', grams]])` and `focusLine: null`.
- In `app/src/ui/IngredientTable.jsx:596` (or in `IngredientTable.creating.test.jsx`), pass `currentStepNumbers ?? displayNumbers(stepsForGrouping)` to `groupPortionsByStep` when `isCreating` is true, or pass `currentStepNumbers={displayNumbers(version.method)}` in `IngredientTable.creating.test.jsx`.

### 5. Risk Assessment
**MEDIUM** — The `creationRows` contract change across `CreationPage.jsx`, `IngredientTable.jsx`, and `RecipeSheet.test.jsx` will break the full test suite in Task 3 unless `RecipeSheet.test.jsx:200` is updated in Task 2.

---

## 11-08

### 1. Summary
Plan 11-08 adds the structure controls (`remove`, `Move up`, `Move down`, `Add step` on steps; `remove`, `Move up`, `Move down`, and `Add to step` chooser on rows), implements focus restoration and polite live-region announcements after moves and removals (D-14 to D-17), and verifies conformance against `add-remove-move.html` (`qA1`–`qE1`) and `instructions-steps.html` (`pA1`–`pD1`) in WebKit.

### 2. Strengths
- **Explicit post-render focus effect (G-13)**: Resolving focus in `CreationPage.jsx`'s `useEffect` via `li.mk-step[data-step="${n}"] [data-act="${act}"]` and `tr[data-line="${CSS.escape(line)}"] [data-act="${act}"]` (falling back to the opposite Move button when `aria-disabled="true"`) avoids relying on WebKit preserving focus across DOM `insertBefore` reorders.
- **Compliance with `cross-cutting.test.js` and `binder.test.js`**: Styling `.notebook .mk-off` in `app/src/styles/notebook.css` (`color: var(--app-text-secondary); text-decoration: none; cursor: default`) leaves `app/src/styles/app.css`'s pinned `(pointer: coarse)` selector list (`cross-cutting.test.js:96-125`) and underline selector list (`binder.test.js:322-324`) untouched while inheriting the 44px touch floor from `.text-control`.

### 3. Concerns
- **[MEDIUM] Focus transitions inside `IngredientTable.jsx` when opening and cancelling the `Add to step` chooser**: In Task 2 (D-17), pressing `Add to step` replaces the row's acts buttons (`remove · Move up · Move down · Add to step`) with the chooser buttons (`Cancel · Step 1, ...`), and pressing `Cancel` or `Escape` replaces the chooser back with the normal acts buttons. Because the target button (`Cancel` on open, `Add to step` on close) is not in the DOM until React commits the `choosingRowId` state update in `IngredientTable.jsx`, calling `.focus()` synchronously inside the `onClick` / `onKeyDown` handler will fail (`null?.focus()`).
- **[LOW] Removing a row while the ingredient picker is open**: In Task 2, if a maker removes the last remaining row while `picking` is `true` (so `Add ingredient` is hidden and the picker is open), the fallback selector `page.querySelector('.ingredient-table-region .mk-head-act') ?? page.querySelector('.ingredient-table-region .pick__head button')` (matching `CreationPage.jsx:150-151`) is needed so focus lands on the picker's `Cancel` button when `Add ingredient` is absent. Task 2 notes this in prose; make sure the code keeps that fallback.

### 4. Suggestions
- In `app/src/ui/IngredientTable.jsx`, use a small ref + `useEffect` (e.g. `chooserFocusRef.current = { lineKey, act: 'cancel' | 'add-to-step' }`) to focus `tr[data-line="..."] [data-act="cancel"]` after opening the chooser and `tr[data-line="..."] [data-act="add-to-step"]` after closing it via `Cancel` or `Escape`, and ensure choosing a step (`onPlaceRow`) also resets the open chooser state in `IngredientTable`.

### 5. Risk Assessment
**MEDIUM** — Keyboard focus choreography across reordered DOM nodes and unmounting chooser buttons is intricate, though well-tested by `CreationStructure.test.jsx` and `11-board-structure.mjs` (`qB1` and `qE1` check `focus` in WebKit).

---

## 11-09

### 1. Summary
Plan 11-09 implements `creationSave.js` (`buildCreation` and `creationSaveBlock`), adds `endDraft()` and `resumeDraft()` to `useDraftWriter` in `app/src/ui/useKeptDraft.js`, wires the `Save` button and landing notice (`"Recipe saved."`) in `CreationPage.jsx` and `router.jsx`, adds the `create-recipe` WebKit walk scenario and `11-board-save.mjs` (`vA1`, `vC1`), and pauses at a blocking checkpoint for the orchestrator to write the export-first row (`check-p11-export-store-before-saving`) to Mark's List (D-21).

### 2. Strengths
- **Prevents draft resurrection on unmount (G-10)**: Adding `endDraft()` and `resumeDraft()` to `useDraftWriter` (`app/src/ui/useKeptDraft.js:19-86`) without adding any `repository.deleteDraft(versionId)` call preserves the source-text pin `['repository.deleteDraft(versionId)', 3]` in `app/src/ui/RecipePage.shell.test.js:266` while stopping `useKeptDraft`'s unmount cleanup from writing the draft back after `createRecipeWithVersion` deletes it.
- **Preserves `focusVersion` across landing notice consumption**: Replacing `location.state` in `RecipePageForRoute` (`app/src/router.jsx:37-92`) without dropping `focusVersion` ensures `RecipePage.jsx:81` (`const focusVersionOnMount = Boolean(location.state?.focusVersion)`) still focuses the version heading on mount.

### 3. Concerns
- **[MEDIUM] Scale field focus selectors in `CreationPage.jsx` (Task 2) do not match `CreationSetup.jsx`'s actual `aria-label`s**: Task 2 states that on a refused Save, focus is found by target kind: *"section[aria-label="Scales"] .mk-card[aria-label="Scale ${i + 1}"] and its field"*. In `creationSaveBlock`, the scale field keys are `'name' | 'low' | 'high' | 'kind'`, but in `app/src/ui/CreationSetup.jsx:235,241,242,244`, the inputs' `aria-label`s are:
  - `'name'` -> `input[aria-label="Name"]`
  - `'low'` -> `input[aria-label="Low end"]` (not `"Low"`)
  - `'high'` -> `input[aria-label="High end"]` (not `"High"`)
  - `'kind'` -> `input[type="radio"]` (inside `.segmented`, since `Segmented` renders radios)
  If `CreationPage.jsx` queries `input[aria-label="${field}"]` without mapping `'low'` -> `'Low end'`, `'high'` -> `'High end'`, and `'kind'` -> `input[type="radio"]`, focusing a refused scale low, high, or kind field will silently match `null`.
- **[MEDIUM] `creationSaveBlock` scale key collision with core keys and whitespace-only strings**: In `app/src/store/transfer.js:376-384`, `validateDeclaredAxes` checks `isScaleDefinition(scale)` (which requires non-empty `name`, `low`, `high`) AND `!coreKeys.includes(scale.key)`. When `buildCreation` constructs `declaredAxes` from `draft.scales`, if a scale's `name`, `low`, or `high` is whitespace-only (`'   '`), `creationSaveBlock` must check `.trim() === ''` on `name`, `low`, and `high`, and `buildCreation` should trim them (just as it trims `problems`) so a whitespace-only string can never slip past or fail `validateStoreFile`.
- **[LOW] `Shell.jsx`'s `creationStateFromRoute` after Save**: When `CreationPage` navigates from `/notebook/new` to `/notebook/:recipeId/:versionId` with `state: { focusVersion: true, saved: 'created' }`, `Shell.jsx:44-52` (`creationStateFromRoute`) currently only recognizes `state?.discarded` and returns `null` for `state?.saved === 'created'`, leaving `creationStateRef.current` as `'present'` until the async `readDrafts()` resolves.

### 4. Suggestions
- In `CreationPage.jsx` (Task 2), explicitly map scale target fields `{ name: 'input[aria-label="Name"]', low: 'input[aria-label="Low end"]', high: 'input[aria-label="High end"]', kind: 'input[type="radio"]' }` within the scale card.
- In `creationSaveBlock` and `buildCreation` (`app/src/domain/creationSave.js`), check `.trim() === ''` on `scale.name`, `scale.low`, `scale.high`, `step.leadIn`, `step.instruction`, `target.label`, `target.value`, and problem words.

### 5. Risk Assessment
**MEDIUM** — High-value integration slice combining domain validation, transaction writes, draft lifecycle, router state, and a blocking checkpoint; the scale-field focus selector mapping is the main implementation trap to watch.

---

## 11-10

### 1. Summary
Plan 11-10 adds the edit route (`/notebook/:recipeId/:versionId/edit`, `EditRoute.jsx`), extends `creationSave.js` with `draftFromVersion`, `applyEditToVersion`, and `sameCreateDraft`, updates `useKeptDraft.js` (and its pins in `RecipePage.shell.test.js`) with `creationKind = 'create' | 'edit'`, `cleanPayload`, and the non-creating `'edit'` guard, wires `mode="edit"` and `saveFirstVersionOver` in `CreationPage.jsx`, and adds the `edit-first-version` and `edit-stale` walk scenarios plus `11-board-first-version.mjs` (`fB1`).

### 2. Strengths
- **Solves G-1 (`useKeptDraft` deleting kept edit drafts on the recipe page)**: Adding `if (!creating && record.kind === 'edit') { setDraftRestoreDone(true); return; }` before `draftMatchesVersion` in `app/src/ui/useKeptDraft.js:184` without setting `draftStoredRef.current = true` guarantees that visiting `/notebook/:recipeId/:versionId` neither deletes a kept edit draft on mount nor deletes it in the persist effect.
- **Solves G-7 / D-23 (`cleanPayload` prevents untouched edits from locking the version)**: Suppressing `record` creation in `useKeptDraft`'s persist effect while `cleanPayload && sameCreateDraft(createDraft, cleanPayload)` ensures simply opening `/notebook/:r/:v/edit` and leaving (or reverting an edit back to the saved state) leaves no kept draft in IndexedDB.
- **Exact accounting of `RecipePage.shell.test.js` markers**: Updating `["kind: 'create'", 1]` to `['kind: creationKind', 1]` and adding `['draftMatchesEdit(record)', 1]` in `app/src/ui/RecipePage.shell.test.js:258-293` keeps the shell test green.

### 3. Concerns
- **[MEDIUM] `CreationPage` in `mode="edit"` needs `justStarted` / ` DRAFT_KEPT_STATUS` behavior clarified when a kept edit draft is restored**: Look at `app/src/ui/CreationPage.jsx:37,83-86`:
  ```js
  onPageStatus: (message, options) => {
    if (justStarted && message === DRAFT_KEPT_STATUS) return;
    announce(message, options);
  },
  ```
  When `EditRoute` opens `/notebook/:r/:v/edit` with **no** kept edit draft in the store (`getDraft(versionId)` returns `undefined`), `useKeptDraft`'s restore effect (`useKeptDraft.js:180`) sees `if (!record) { setDraftRestoreDone(true); return; }` and does *not* call `onPageStatus(DRAFT_KEPT_STATUS)`. When `EditRoute` opens (or reloads) with a kept `'edit'` draft in the store (`getDraft(versionId)` returns the `'edit'` record), `useKeptDraft`'s restore effect sees `createDraftRef.current === createDraftAtRead` (because `EditRoute` initialized `CreationPage`'s `record` prop with that same kept `'edit'` draft!) and calls `onPageStatus(DRAFT_KEPT_STATUS)` (`'Draft kept. Cancel discards it.'`), which Task 2's test and `11-13`'s `edit-kept` walk scenario both expect! However, make sure `EditRoute` passes `justStarted={false}` so `DRAFT_KEPT_STATUS` is not suppressed on reload.
- **[LOW] `EditRoute.jsx` needs `useCatalog()` for `draftFromVersion(version, recipe, catalog.styles)`**: In `app/src/ui/EditRoute.jsx`, `seed = normalizeCreateDraft(draftFromVersion(version, recipe, catalog.styles))` reads `catalog.styles` from `useCatalog()`. Since `CatalogProvider` wraps the router in `main.jsx`, `useCatalog()` is available, and in `EditFlow.test.jsx` the test harness must wrap the router in `<CatalogFixture>` (just like `Shell.creationGuard.test.jsx:139` does).

### 4. Suggestions
- In `EditFlow.test.jsx`, wrap the test router in `<CatalogFixture>` from `app/src/ui/catalog.fixtures.jsx` so `EditRoute` and `CreationSetup` both receive `catalog.styles`, `catalog.scales`, and `catalog.problems`.
- In `draftFromVersion` (`app/src/domain/creationSave.js`), if a stored row has multiple portions that resolve to the same live step (possible only in a hand-crafted import), combine them with `addGrams` so `fitsCreateRow`'s `isUniqueBy(row.portions, (p) => p.step)` (`app/src/domain/draft.js:426`) always holds.

### 5. Risk Assessment
**MEDIUM** — Coordinates route loading, draft restoration, `RecipePage.shell.test.js` source-text pins, and multi-tab stale-edit transaction refusals.

---

## 11-11

### 1. Summary
Plan 11-11 threads the `saveMessages` map from `CreationPage.jsx` into `CreationSteps.jsx`, `IngredientTable.jsx`, `CreationSetup.jsx`, and `RecipeSheet.jsx` so that every refusal returned by `creationSaveBlock` renders in place under its field with `aria-invalid="true"` and `aria-describedby` wired, adds the `create-save-refused` walk scenario, and adds panel `vB1` to `11-board-save.mjs`.

### 2. Strengths
- **Screen-reader accessible refusal states (Pitfall 2)**: Because `FieldFeedback` (`app/src/ui/FieldFeedback.jsx:4-17`) renders quiet `Required` guidance with `aria-hidden="true"` and swaps it for `<span id={errorId} className="field-error">{error}</span>` when `error` is passed, threading `saveMessages` into each `FieldFeedback` and setting `aria-invalid="true"` + `aria-describedby={errorId}` makes every refused field audible without adding duplicate DOM lines.
- **Live clearing on edit**: Recomputing `saveMessages` from `creationSaveBlock(createDraft, { libraryById })` on each render once `saveAttempted` is true means fixing any field immediately clears its error and `aria-invalid` attribute while leaving remaining errors standing.

### 3. Concerns
- **[HIGH] `app/src/ui/Segmented.jsx` is not in `files_modified`, but Task 2 requires setting `aria-describedby` and rendering `<span class="field-error">` for `Segmented` (`Kind`)**: In Task 2, the plan states: *"its Kind control shows `scale:${key}:kind` as a `span.field-error` under the radios (id `create-scale-${key}-kind-error`, the radiogroup described by it)"*. However, in `app/src/ui/CreationSetup.jsx:244-251`, the Kind control is rendered by `<Segmented groupLabel="Kind" ... />`, and inside `app/src/ui/Segmented.jsx:59`, `<div className="segmented" role="radiogroup" aria-label={groupLabel}>` is rendered with **no prop for `aria-describedby`, `aria-invalid`, or an error element**. Without modifying `Segmented.jsx` (or adding `Segmented.jsx` to `files_modified` to accept `error` and `errorId` props), `CreationSetup.jsx` cannot set `aria-describedby="create-scale-${key}-kind-error"` on `div[role="radiogroup"]`!
- **[MEDIUM] `snapshot()`'s `invalid` array in `11-walk.mjs` (Task 3, `create-save-refused`)**: Look at how `snapshot(page)` in `.planning/phases/10-the-creation-editor-without-save/10-walk.mjs:137-141,159` records `invalid`:
  ```js
  const fieldLabel = (el) =>
    el.getAttribute('aria-label') ||
    (el.closest('label')?.textContent ?? '').trim().slice(0, 40) ||
    el.getAttribute('name') ||
    `${el.tagName.toLowerCase()}:${el.type}`;
  ...
  invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map(fieldLabel),
  ```
  In Task 3 (`create-save-refused`), `walk.expect` checks that `invalid` holds `'Recipe name'`, `'Version name'`, `'Step 1, lead-in'`, and `'Step 1, instruction'`. Because all four of those inputs have explicit `aria-label` attributes (`aria-label="Recipe name"`, `aria-label="Version name"`, `aria-label="Step 1, lead-in"`, `aria-label="Step 1, instruction"`), `fieldLabel(el)` will return those exact strings as long as `aria-invalid="true"` is placed on the `<input>` / `<textarea>` elements themselves.

### 4. Suggestions
- Add `app/src/ui/Segmented.jsx` to `files_modified` in Plan 11-11 and give `Segmented` optional `error = null` and `errorId = undefined` props so it can set `aria-describedby={error ? errorId : undefined}` on `<div className="segmented" role="radiogroup">` and render `<FieldFeedback error={error} errorId={errorId} />` under the radios.

### 5. Risk Assessment
**LOW** — Straightforward prop threading once `Segmented.jsx` is included for the scale `Kind` radiogroup's `aria-describedby`.

---

## 11-12

### 1. Summary
Plan 11-12 connects first-version editing to the rest of the app: `Edit` and `Resume editing` in `VersionRow.jsx` (with `Next version` and `Record a batch` hidden and refused while an edit draft is kept), `Resume editing` and orphaned-edit cleanup in `NotebookPlace.jsx` (`shell.css`), hidden shortcuts in `RecipeList.jsx` (Home), synchronous import refusal naming the recipe in `Shell.jsx`, and panels `fA1` and `fC1` in `11-board-first-version.mjs`.

### 2. Strengths
- **Defense in depth against pen/edit key collisions (G-1, G-8)**: Hiding `Next version` and `Record a batch` in `VersionRow.jsx`, `BatchRow.jsx`, and `RecipeList.jsx` *and* guarding `handleStartDeveloping` and `handleStartRecording` in `RecipePage.jsx` ensures that even a route intent (`location.state.startNextVersion` in `app/src/ui/useRouteIntents.js:64-74`) cannot open a pen over a kept `'edit'` draft.
- **Orphaned edit draft cleanup (G-12)**: Quietly deleting an `'edit'` draft in `NotebookPlace.jsx` on load when its version is missing or `firstVersionRefusal` is non-null (complementing `EditRoute.jsx`'s redirect cleanup in `11-10`) prevents a batch recorded in another tab from leaving an un-cancellable edit draft that blocks store imports forever.

### 3. Concerns
- **[HIGH] Contradiction in Task 3's instructions for `creationStateFromRoute` vs `chooseImportFile` in `app/src/ui/Shell.jsx`**:
  In Task 3, the plan says:
  1. *"creationStateFromRoute answers 'present' for an address matching `/notebook/<id>/<id>/edit`."*
  2. *"chooseImportFile, synchronously: an open pen refuses as today; then a kept create draft refuses with `CREATION_IMPORT_BLOCKED_STATUS`; then a kept edit draft refuses with `editImportBlockedStatus(its name)`; then the edit address with no kept edit refuses with `IMPORT_BLOCKED_STATUS` (the editor is an open form); `'unknown'` as today."*
  3. *"on the edit address with nothing kept it refuses with `'Save or cancel your changes before importing.'`"* (`IMPORT_BLOCKED_STATUS`).
  Look at `app/src/ui/Shell.jsx:428-432`:
  ```js
  const creationState = creationStateFromRoute(pathname, location.state) ?? creationStateRef.current;
  if (creationState === 'present') {
    refuseImport(CREATION_IMPORT_BLOCKED_STATUS);
    return;
  }
  ```
  If `creationStateFromRoute(pathname, location.state)` returns `'present'` for `/notebook/<id>/<id>/edit`, then `creationState === 'present'` will be true whenever the user is on `/notebook/<id>/<id>/edit`, and `chooseImportFile` (as well as `Shell.jsx:280-285`, which sets `creationStateRef.current = fromRoute`) will think a **`create` draft** is kept and will refuse with `CREATION_IMPORT_BLOCKED_STATUS` (`'Cancel the new recipe draft before importing.'`) instead of `IMPORT_BLOCKED_STATUS` (`'Save or cancel your changes before importing.'`)!
- **[MEDIUM] Synchronous state in `Shell.jsx` immediately after `Save` or `Cancel` from `/notebook/new` or `/notebook/:r/:v/edit` before `readDrafts()` settles**:
  In `app/src/ui/Shell.jsx:280-287`, when the user cancels an edit on `/notebook/:r/:v/edit` (or saves on `/notebook/new` or `/notebook/:r/:v/edit`), the router navigates to `/notebook/:r/:v`. In `Shell.creationGuard.test.jsx:466-495`, tests verify that clicking `Import` in the very first tick after navigation (while `Shell`'s async `readDrafts()` is still pending) already knows the updated draft state. If `editNameRef.current` held `'Vanilla'` before `Cancel` or `Save-over` on the edit route, or if `creationStateRef.current` held `'present'` before `Save` on `/notebook/new`, then in the first tick after landing on `/notebook/:r/:v` (before `readDrafts()` resolves), `editNameRef.current` or `creationStateRef.current` will still hold its pre-navigation value unless cleared by route state (`state?.saved === 'created'` -> `creationStateRef.current = 'absent'`; `state?.saved === 'edited'` or edit `Cancel` -> `editNameRef.current = null`)!
- **[LOW] Passing `editing` set through `HomeBody` to `HomeLead` and `RecipeRows` in `app/src/ui/RecipeList.jsx`**: `HomeLead` (`RecipeList.jsx:143`) and `RecipeRows` (`RecipeList.jsx:250`) are both exported components tested directly in `RecipeList.test.jsx`. Any new prop passed from `HomeBody` to `HomeLead` and `RecipeRows` (such as `editingIds = new Set()`) must default to an empty `Set` so existing unit tests calling `<HomeLead>` and `<RecipeRows>` without that prop continue to pass.

### 4. Suggestions
- In `app/src/ui/Shell.jsx` (Task 3), keep `creationStateFromRoute` strictly for `create` drafts (`/notebook/new`, `state?.discarded`, and `state?.saved === 'created'` -> `'absent'`), and use a separate helper `isEditPath(pathname)` (`/^\/notebook\/[^/]+\/[^/]+\/edit$/.test(pathname)`) for the edit route so `chooseImportFile` can distinguish:
  1. `importGuardRef.current` -> `IMPORT_BLOCKED_STATUS`
  2. `creationState === 'present'` -> `CREATION_IMPORT_BLOCKED_STATUS`
  3. `editNameRef.current !== null` -> `editImportBlockedStatus(editNameRef.current)`
  4. `isEditPath(pathname)` -> `IMPORT_BLOCKED_STATUS`
  5. `creationState === 'unknown'` -> `PAGE_LOAD_ERROR`
- In `readCreationState()` (`Shell.jsx:266`), also filter `draftMatchesEdit` records against eligible versions (or clear `editNameRef.current` on `state?.saved === 'edited'` / edit Cancel) so a just-saved or just-cancelled edit does not linger in `editNameRef.current` while `readDrafts()` is in flight.

### 5. Risk Assessment
**MEDIUM** — Touches multiple navigation and guard surfaces (`VersionRow`, `BatchRow`, `RecipePage`, `NotebookPlace`, `RecipeList`, `Shell`); resolving the `creationStateFromRoute` vs `isEditPath` distinction in `Shell.jsx` is essential for Task 3's tests to pass.

---

## 11-13

### 1. Summary
Plan 11-13 is the final verification and hand-off wave: it adds the `edit-kept` scenario to `11-walk.mjs`, runs all five board specs (`11-board-reading.mjs`, `11-board-steps.mjs`, `11-board-structure.mjs`, `11-board-save.mjs`, `11-board-first-version.mjs`) with `--evidence`, runs `11-print-check.mjs` and `11-walk-check.sh`, walks the iPad UAT script in WebKit (`11-device-steps.mjs`) under the first-activation discipline, moves the two folded todo files from `.planning/todos/pending/` to `.planning/todos/completed/`, and stops at a checkpoint for the orchestrator to write the iPad check row (`check-p11-ipad-create-steps-save-print-edit`) and close the todo rows on Mark's List.

### 2. Strengths
- **First-activation WebKit pre-check (`11-device-steps.mjs`)**: Following `.planning/phases/10-the-creation-editor-without-save/10-device-steps.mjs:76-96`, every step of Mark's iPad check (including keyboard Tab + Enter on `Move up` and `remove`, print foot Sheet code reading, `/search` lookup, `Edit`, `Save-over`, and second `/search` lookup) is proven reachable on its first activation in WebKit at 1366 with `hasTouch: true` before Mark is handed the check row.
- **Clear separation of verification states**: Explicitly separating "automated verification passed" from "iPad verification pending" and keeping `app/dist` untouched by any script protects Mark's live preview server.

### 3. Concerns
- **[MEDIUM] `11-device-steps.mjs` (Task 2) and `edit-kept` in `11-walk.mjs` (Task 1) depend on the harness details flagged in `11-01` and `11-05`**:
  1. In Task 1, `11-board-check.mjs ... --evidence "$S/evidence-11"` runs `pictures()` across all five board specs, including `11-board-reading.mjs` (where `section.method-region` sits at `y = 1165px` below `.p4-win`'s `1024px` / `620px` height) and `11-board-save.mjs` (`vC1`, which expects `.page-status` to be visible, whereas `10-board-check.mjs:476-480` waits 6s for `.page-status` to clear before taking evidence screenshots).
  2. In Task 1, `edit-kept` calls `open /notebook and record 'notebook' with stores`, which requires `11-walk.mjs`'s `walk.open` and `snapshot` to support `.nb` on `/notebook` (see `11-01` Concern 1).
  3. In Task 2 (`11-device-steps.mjs`), when reading the Sheet code on `/notebook/<id>/<id>/print`, the script must wait for `.print-route[data-print-ready="true"]` before reading `.print-page--sheet .mp-foot` so it does not read before `useSheetPages` finishes laying the pages.
- **[LOW] Gram input `aria-label` change once `Whole milk, 3.5% fat` is ticked into a second step in `11-device-steps.mjs`**: In Task 2, before ticking `Whole milk, 3.5% fat` into Step 2, its one grams input has `aria-label="Whole milk, 3.5% fat, grams"`; as soon as it is ticked into Step 2, it becomes a split row and its two inputs take `aria-label="Whole milk, 3.5% fat, grams, portion 1"` and `aria-label="Whole milk, 3.5% fat, grams, portion 2"` (`app/src/ui/IngredientTable.jsx:178`). Task 2 notes `"type 400 in Whole milk's portion 1 line and 200 in its portion 2 line"` — make sure the locator uses the full ingredient name `'Whole milk, 3.5% fat, grams, portion 1'` and `'Whole milk, 3.5% fat, grams, portion 2'`.

### 4. Suggestions
- In `11-device-steps.mjs` (Task 2), wait for `.print-route[data-print-ready="true"]` when visiting `/print` before reading `.print-page--sheet .mp-foot`, and use `input[aria-label="Whole milk, 3.5% fat, grams, portion 1"]` / `portion 2` for the split row lines.

### 5. Risk Assessment
**LOW** — Proof and checkpoint plan that modifies no application logic unless a board discrepancy is uncovered; once the harness items in `11-01`, `11-05`, and `11-06` are in place, `11-13` will run cleanly.

---

## Cross-Plan Comparison & Summary of Key Findings

### Dependency & Wave Ordering
The 9-wave structure across `11-01` through `11-13` is well-partitioned:
- **Wave 1 (`11-01`, `11-02`, `11-03`)** has completely disjoint `files_modified` sets, so worktree parallelization is safe. Note that `11-03`'s `creation-roundtrip.test.js` rightly avoids importing `UNPLACED_STEP` from `11-02`'s `creationSteps.js` so `11-03` does not depend on `11-02`.
- **Wave 2 (`11-04`, `11-05`)** and **Wave 8 (`11-11`, `11-12`)** also touch disjoint file sets within their waves.

### Top Cross-Plan Issues to Fix Before/During Execution (with `file:line` citations)
1. **`app/src/ui/RecipeSheet.test.jsx:160-174` and `:200-235` (`11-06` & `11-07`) — HIGH**:
   - In `11-06`, changing `showsMethodRegion` (`app/src/ui/Method.jsx:519`) to return `true` for `mode === 'creating'` invalidates `RecipeSheet.test.jsx:162,171-172` (`recipe-page--no-method` and `not.toContain('method-region')`).
   - In `11-07`, changing `creationRows.gramsByRow` to `creationRows.gramsByLine` in `app/src/ui/IngredientTable.jsx:654` without updating `creationRowsOf` in `app/src/ui/RecipeSheet.test.jsx:200-206` (which is omitted from `11-07`'s `files_modified`) will throw `TypeError: Cannot read properties of undefined (reading 'get')` when `11-07` Task 3 runs `npm --prefix app test`.
2. **`app/src/ui/Shell.jsx:44-52,423-439` `creationStateFromRoute` vs `isEditPath` (`11-12` Task 3) — HIGH**:
   - `11-12` Task 3 instructs `creationStateFromRoute` to return `'present'` on `/notebook/<id>/<id>/edit`, which causes `chooseImportFile` (`Shell.jsx:428-432`) to enter the kept-create-draft branch (`CREATION_IMPORT_BLOCKED_STATUS`) instead of the open-edit-form branch (`IMPORT_BLOCKED_STATUS`). Keep `creationStateFromRoute` for `create` drafts and check `isEditPath(pathname)` separately after checking `editNameRef.current`.
3. **`app/src/ui/Method.jsx:395,760` outer `targets?.length > 0` guard (`11-04` Task 2) — HIGH**:
   - Removing the only target on a step leaves `step.targets.length === 0` while `stepDiff.targets.length === 1`. `Method.jsx:395,760` must not gate `<StepTargets>` on `draftStep.targets?.length > 0` / `step.targets?.length > 0`, or a sole removed target will never render in Show changes or the closed pen.
4. **`app/src/ui/Segmented.jsx:59` and `CreationPage.jsx` scale focus selectors (`11-09` Task 2 & `11-11` Task 2) — HIGH/MEDIUM**:
   - Add `app/src/ui/Segmented.jsx` to `11-11`'s `files_modified` so `<div className="segmented" role="radiogroup">` can receive `aria-describedby="create-scale-${key}-kind-error"`.
   - Map scale field keys `'low'` -> `'Low end'`, `'high'` -> `'High end'`, and `'kind'` -> `'input[type="radio"]'` in `CreationPage.jsx` to match `app/src/ui/CreationSetup.jsx:235-251`.
5. **Harness selectors in `11-walk.mjs`, `11-board-check.mjs`, `11-board-steps.mjs`, and `11-print-check.mjs` (`11-01`, `11-05`, `11-06`, `11-13`) — HIGH/MEDIUM**:
   - `11-walk.mjs`: support `.nb` alongside `.notebook` in `walk.open` (`10-walk.mjs:281`) and `snapshot` (`10-walk.mjs:178`) for `/notebook`.
   - `11-board-steps.mjs` (`pE1` in `11-06`): exclude D-22's target `remove` button from `.method-step__targets .text-control` so `count` (4 on board vs 5 in app) does not fail.
   - `11-board-check.mjs` (`pictures()` in `10-board-check.mjs:476-502`): do not wait for `.page-status` to clear on panels that measure `.page-status` (`vC1`), and handle anchored full-page panels whose scope (`section.method-region` at `y = 1165px` on `vC1`/`fA1`) sits below `.p4-win`'s height.
   - `11-print-check.mjs` (`11-05`): wait for `.print-route[data-print-ready="true"]` and scope queries to `.print-route__pages` to avoid matching the hidden `.ps-measure` box (`PrintSheetPages.jsx:434`).
6. **`saveFirstVersionOver` early business-refusal abort in `app/src/store/repository.js` (`11-03` Task 2) — MEDIUM**:
   - Ensure `done.catch(() => {})` is attached if `tx.abort()` is called before returning `{ saved: false, reason: refusal }` so `tx.done` does not raise an unhandled `AbortError` rejection.

---

## Consensus Summary

Three grounded reviews. Codex and Astra (both OpenAI models, see the 2026-10-18 lane decision) converge on the same verdict: **HIGH risk, revise before execution**, with the data-model and draft-lifecycle guarantees as the blockers. Argon rates every plan LOW or MEDIUM and reads the plans as executable once a set of concrete harness, test-pin and selector defects is fixed; its findings are mostly existence-class and cite exact lines, so they are cheap to verify and fold in. The two kinds of finding are complementary: Codex and Astra ask whether the plans deliver the guarantees the context promises; Argon asks whether the tasks as written will pass their own `<verify>` blocks.

### Agreed Strengths

- **Wave order and the domain/store/UI split** fit the repository; Wave 1 file sets are disjoint and 11-03 deliberately avoids depending on 11-02 (all three).
- **Save in one transaction** copies the proven `importAll` abort pattern and its forced-failure test (`repository.js:240-280`, `repository.test.js:139-156`), and `sheetCodeProblems` is reused inside the transaction (all three).
- **`uses` as placement authority with step 0 for unplaced rows** resolves the real `step: 1` placeholder collision (`creation.js:134-138`, `stepKeys.js:24-35`) and the tombstones fit the existing allocator (all three).
- **`endDraft()` before navigation** closes a real resurrection path: unmount currently flushes the pending draft write (`useKeptDraft.js:292-301`) (Codex, Astra, Argon).
- **The recipe-page restore guard** fixes a verified hazard: an unrecognised draft is currently deleted (`useKeptDraft.js:184-187`) (all three).
- **Explicit post-render focus requests** extend the existing `CreationPage.jsx:136-154` pattern instead of trusting WebKit to keep focus across reorders (Codex, Astra, Argon).
- **Print** needs only the one string change; empty sections are already omitted by the page planner (`PrintSheetPages.jsx:318-330`), and Search resolves the stored code (all three).
- **First-activation device discipline** in 11-13 and keeping the iPad PDF as the print evidence, not Chrome (Codex, Astra, Argon).

### Agreed Concerns

Raised by two or more reviewers, highest severity first.

1. **11-09 — edits and Cancel can race an in-flight Save** (Codex HIGH, Astra HIGH). Only Save is disabled while saving (`11-09-PLAN.md:126`); fields stay editable (`CreationPage.jsx:255-271`), so text typed after `buildCreation` captured its payload is discarded on landing, and Cancel can navigate after a save already committed. The cited RecipeBand pattern disables fields and Cancel too (`RecipeBand.jsx:75`). Add a deferred-promise test for typing, Cancel and navigation during Save.
2. **11-10 — `draftFromVersion` is not lossless for a root that already has removed rows or portions** (Codex HIGH, Astra HIGH). The conversion at `11-10-PLAN.md:117` ignores removal flags; `rowFromLibraryRecord` rebuilds rows active (`versionRow.js:71-77`). Such roots are reachable today through the pen's zero-batch Save-over (`useVersionPen.js:225-242`), so Edit then Save could resurrect a removed ingredient. Define conversion for removed rows, removed portions and portions under removed steps; assert unchanged grams and balance across a no-op edit and save.
3. **11-10 / 11-12 — quiet deletion of a kept edit draft contradicts D-06** (Codex HIGH, Astra HIGH; Argon lists the same cleanup as a strength, see Divergent Views). `11-10-PLAN.md:162` and the Notebook cleanup delete the edit draft once a batch or child exists; `11-CONTEXT.md:26` says the draft stays until Cancel discards it. Astra adds that the planned stale-edit walk inserts the batch straight into IndexedDB (`11-10-PLAN.md:193`) and so never exercises the real batch-save path, which calls an unconditional `discardDraft()` (`useBatchRecording.js:477-478`, `useKeptDraft.js:60-67`). Give the stale edit a reachable recovery state with explicit discard, and walk a real second-tab batch save.
4. **11-03 — Save-over succeeds while a foreign `plan` draft holds the version's draft key** (Codex HIGH, Astra HIGH). `11-03-PLAN.md:171-176` leaves the plan draft in place; a plan draft must match the version's row counts, portion counts and step keys (`draft.js:242-271`), so the restructured version invalidates it and the next restore deletes it (`useKeptDraft.js:184-187`). Draft writes and deletes are unconditional on one key (`repository.js:309-320`). Refuse Save-over inside the transaction when an incompatible draft occupies the key and test the second-tab interleaving.
5. **11-06 — the pE1 board check cannot pass with the D-22 remove control** (Codex HIGH, Argon HIGH, Astra MEDIUM). The chip's remove button adds a fifth `.method-step__targets .text-control`; the board has four, and the engine compares count and text (`10-board-check.mjs:292-306`). Argon's fix: put remove inside `span.target-chip` and compare `.method-step__targets > .text-control`; verify remove separately as the D-22 exception.
6. **11-02 — `addGrams('4.', '200')` is specified two ways** (Codex HIGH, Astra MEDIUM). The behaviour at `11-02-PLAN.md:161` keeps `'4.'`; the implementation at `:175` returns the only parseable operand. Pick one policy that preserves entered text and test malformed input on either side, blank lines and three-way splits. Codex adds that the allocation invariant does not prove gram conservation (`rows.js:98`).
7. **11-08 — moving a split row reorders the other step too** (Astra HIGH, Codex MEDIUM). Every group derives order from the same `rows` array (`IngredientTable.jsx:36-61`), so swapping A and B in step 1 swaps them in step 2, against "within its step only" (`CONTRACT.md:27`); `11-02-PLAN.md:173` admits the effect. Decide before `moveRow` is written, or give groups their own order.
8. **11-01 / 11-13 — new scenarios skip baseline comparison and the method hash drops real values** (Codex HIGH on 11-13, Astra HIGH on 11-01). Exempting whole new scenarios (`11-01-PLAN.md:27`, `:124`) means a Save-flow regression that touches a seeded record escapes the 94 snapshots; removing every `.struck-value` (`11-01-PLAN.md:120`) hides a wrong old target value (`Method.jsx:395-405`). Compare pre and post stores in each new scenario, excluding only the created records; hash target label, old value, new value and removal state instead of deleting them.
9. **11-13 / 11-01 — evidence screenshots wait for `.page-status` to clear** (all three MEDIUM). `10-board-check.mjs:473-482` empties the notice before the picture, so vC1 never shows "Recipe saved."; Argon adds that anchored full-page panels with `section.method-region` below the `.p4-win` fold clip to zero height. Add a capture option for panels that measure `.page-status`, and clip full panels to the scope.
10. **11-05 — the print check can inspect the hidden `.ps-measure` copy** (all three MEDIUM). `PrintSheetPages.jsx:433-440` keeps a measuring copy of the whole sheet in the DOM; broad `.ps-page` and heading queries count it. Wait for `[data-print-ready="true"]` and scope to `.print-route__pages .print-page--sheet`; measure spacing and overflow, not only absent headings.
11. **11-11 — `Segmented.jsx` is not in the plan but must change** (Argon HIGH, Codex MEDIUM, Astra MEDIUM). The Kind radiogroup lives in `Segmented.jsx:59` with no `aria-describedby`, `aria-invalid` or error slot, so the promised wiring at `11-11-PLAN.md:130` cannot land from `CreationSetup.jsx` alone. Add the file, its props and its tests.
12. **11-11 — the no-rows focus target is gone while the ingredient picker is open** (Codex MEDIUM, Astra MEDIUM). The picker replaces Add ingredient (`CreationPage.jsx:325-339`); a refused Save with the picker open focuses nothing. Define a picker-open fallback (its search field or Cancel) and test it.
13. **11-04 — `buildTargetDiff` collapses repeated labels** (Codex MEDIUM, Astra MEDIUM). The map at `diff.js:155-168` keys by label; two `temp` targets become one descriptor (both reproduced it), and the import validator allows repeats (`transfer.js:188-196`). Keep multiplicity in the diff or get a decision on refusing duplicate labels; add closed-pen and Show-changes fixtures, since both board fixtures visit only the reading page.
14. **11-12 — the loading state is treated as unlocked and the import guard conflates edit with creation** (Astra HIGH, Codex MEDIUM; Argon HIGH on the import guard, Astra MEDIUM). `editState` is `null` until drafts load (`11-12-PLAN.md:116`) while the page renders before that read (`RecipePage.jsx:274-295`), and batches load without a readiness flag (`useRecipeData.js:188-202`), so Edit can show before the disqualifying records arrive and a fast opener can start a pen over an edit. Making `creationStateFromRoute` answer `'present'` for `/edit` (`11-12-PLAN.md:179`) sends `chooseImportFile` (`Shell.jsx:428-432`) down the kept-create branch with the wrong message. Represent loading explicitly, gate on all reads, and give the edit route its own guard state.
15. **11-09 — the grams gate passes numeric overflow** (Codex HIGH, Astra MEDIUM). `gramsDraftMessage` rejects only `null` (`lineage.js:212-227`); a 309-digit amount parses to `Infinity`, gets no message, and the row constructor throws (`versionRow.js:48-49`). Both reproduced it. Require finite grams and totals.

### Divergent Views

- **Overall risk.** Codex and Astra: HIGH, request changes before execution. Argon: LOW to MEDIUM per plan, executable once the listed defects are fixed. Both OpenAI models share blind spots by design of the lane set, so Argon's lower rating is one voice against two correlated ones, not one against two independent ones.
- **Orphaned-edit cleanup (11-12, G-12).** Argon counts the quiet deletion of an edit draft whose version gained a batch as a strength (it stops an un-cancellable draft blocking imports forever). Codex and Astra call the same deletion a breach of D-06. The plan needs to pick: keep the draft and offer a discard on the landing surface, or get Mark to narrow D-06. This is the one place a reviewer disagreement is a product decision.
- **Step-key reuse after Save and reopen** (Astra only, HIGH). `nextStepKey` reads the highest key in the method it is given (`stepKeys.js:24-35`); dropping tombstones at Save lets a removed key be reissued after reopening, against `11-CONTEXT.md:65`. Existence-class and source-grounded; worth confirming in the replan, either with a stored watermark or by narrowing the promise to one editing session.
- **Text-only board self-tests cannot fail under the engine's font-size mutation** (Astra only, HIGH on 11-01 and MEDIUM on 11-07; reproduced in WebKit against `10-board-check.mjs:554-566`). Argon and Codex did not examine the self-test mechanism.
- **Argon's execution-level findings have no second voice but cite exact lines**: `walk.open` waits for `.notebook`, which `/notebook` never renders (`10-walk.mjs:281`, `NotebookPlace.jsx`); `RecipeSheet.test.jsx:160-174` and `:200-235` break under 11-06 and 11-07 and are in neither plan's file list; `creation.test.js:106,114,124` pin `step: 1` for unplaced rows; the scale-field focus selectors in 11-09 must map `low` to "Low end", `high` to "High end" and `kind` to the radio; `Method.jsx:395,760` gate targets on `step.targets.length`, which hides a step's sole removed target; `saveFirstVersionOver`'s hand abort needs `done.catch` to avoid an unhandled `AbortError`. Each is a short check in the replan.
- **Row Move accessible names** (Astra only, MEDIUM): a split row gets two indistinguishable "Move Whole milk down" controls; the pen already names the step in split-line removal (`IngredientTable.jsx:204-210`).
- **Lone unplaced group in print and the saved table** (Astra only, MEDIUM): with live steps that use no rows, the current one-group rule suppresses "Not in a step yet", against D-09 (`11-CONTEXT.md:31`).
