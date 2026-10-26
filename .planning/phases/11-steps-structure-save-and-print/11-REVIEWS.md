---
phase: 11
reviewers: [codex]
reviewed_at: 2026-10-26T23:05:43Z
plans_reviewed: [11-01-PLAN.md, 11-02-PLAN.md, 11-03-PLAN.md, 11-04-PLAN.md, 11-05-PLAN.md, 11-06-PLAN.md, 11-07-PLAN.md, 11-08-PLAN.md, 11-09-PLAN.md, 11-10-PLAN.md, 11-11-PLAN.md, 11-12-PLAN.md, 11-13-PLAN.md, 11-14-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
model_sources:
  codex: "banner"
---

# Cross-AI Plan Review — Phase 11

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

Round 2, `--codex`: Codex alone, against the 14 plans at e3bfe4cc (Round 1 incorporated at 6375c2dd and c53ac38c; the Round 1 file with its three reviews is at d52488be, which the plans' ledgers cite as `L##@d52488be`). Same prompt shape as Round 1 (PROJECT.md, the roadmap section, REQUIREMENTS.md, 11-CONTEXT.md, 11-RESEARCH.md, the 14 plans) plus a note that this is round 2: the plans carry a Review Dispositions Ledger, Mark's two answers were incorporated, 11-14 is new, and sound Round 1 dispositions should not be repeated. Codex took 8 minutes, gave each of the 14 plans its own section, cited source, and reports the baseline suite green (120 files, 3,771 tests). It could not launch WebKit in its sandbox, so its geometry findings rest on source and board structure, not a browser run. No `[reviewed-without-...]` marker.

## Codex Review

Reviewed against HEAD `e3bfe4cc`. The current suite passes: **120 files, 3,771 tests**. No repository files were changed. WebKit aborted during launch in this environment, so browser geometry findings below are based on source and board structure, not a completed browser run.

## 11-01

**Summary:** The revised harness closes several real coverage gaps. The struck-target normalisation still does not reproduce the planned renderer’s actual markup change.

**Strengths**

- Supporting `.nb` correctly covers the Notebook root, which differs from recipe pages. See [NotebookPlace.jsx:288](/Users/mark/Documents/projects/sprinkles/app/src/ui/NotebookPlace.jsx:288).
- The seed-preservation check and explicit scenario allow-list make the new scenarios meaningfully accountable.

**Concerns**

- **MEDIUM — The struck-form test proves the wrong transformation.** The current renderer places the struck value **before** the label: [Method.jsx:400](/Users/mark/Documents/projects/sprinkles/app/src/ui/Method.jsx:400). The proposed renderer places the label first. Removing the repeated label produces different normalised strings:
  - Current: `80 °Ctemp85 °C`
  - Planned: `temp80 °C85 °C`

  The normtest only changes the struck span’s text, leaving its position unchanged; see [11-01-PLAN.md:174](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-01-PLAN.md:174). It can pass without proving compatibility with the new renderer.

**Suggestions**

- Canonicalise target labels and old/new values into an explicit ordered representation.
- Test the actual before-and-after markup, including moving the struck span, while retaining the changed-old-value negative test.

**Risk assessment:** **MEDIUM.** The harness improvements are substantial, but this proof currently overstates what it establishes.

## 11-02

**Summary:** The allocation model, independent step ordering and session-scoped key ledger are well specified. The promised decimal precision exceeds what the proposed arithmetic guarantees.

**Strengths**

- Hidden tombstones fit the existing `nextStepKey` implementation, which includes removed steps when finding the highest key. See [stepKeys.js:24](/Users/mark/Documents/projects/sprinkles/app/src/domain/stepKeys.js:24).
- `normalizeAllocation`, explicit fold-back rules and conservation tests address the earlier loss-of-grams concerns directly.

**Concerns**

- **MEDIUM — “Exact hundredths up to the safe-integer limit” is false with the prescribed conversion.** [11-02-PLAN.md:198](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-02-PLAN.md:198) converts through `Number`, then `Math.round(value * 100)`. The existing parser also converts through `Number`: [lineage.js:212](/Users/mark/Documents/projects/sprinkles/app/src/domain/lineage.js:212).

  Reproduced example: `35184372088832.02` converts to `3518437208883203` hundredths, although the exact result is `3518437208883202`; both are safe integers. Adding `0.01` therefore produces the wrong exact total.

**Suggestions**

- Parse hundredths directly from the decimal strings, using integer/string arithmetic and a safe-range check.
- Test precision against an independent oracle rather than the same `Math.round` calculation used by the implementation.

**Risk assessment:** **MEDIUM.** Ordinary recipe quantities are unaffected, but the explicit precision and overflow contract needs correction.

## 11-03

**Summary:** Atomic creation, transactional edit refusals and draft-family ownership are strong improvements. Protection against concurrent version writes remains asymmetric.

**Strengths**

- The forced-failure strategy correctly follows the existing hand-aborted transaction pattern in [repository.js:240](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js:240).
- Comparing `expected` recipe and version records inside Save-over addresses concurrent edit saves without adding stored fields.

**Concerns**

- **HIGH — A stale version pen can still overwrite the newly edited root.** The new guards protect draft records and `saveFirstVersionOver`, but the existing version pen writes through `repository.saveVersion(updated)`: [useVersionPen.js:242](/Users/mark/Documents/projects/sprinkles/app/src/ui/useVersionPen.js:242). That repository method checks Sheet codes, without comparing the version that the pen originally read: [repository.js:98](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js:98).

  Concrete sequence:
  1. Tab B opens a clean Next version pen on root V0.
  2. Tab A edits and saves the root as V1.
  3. Tab B changes its stale pen and presses **Save over this version**.
  4. Its V0-based record overwrites V1.

  A clean pen creates no kept draft, so the draft-family guard cannot exclude this sequence. See [penDraft.js:84](/Users/mark/Documents/projects/sprinkles/app/src/domain/penDraft.js:84).

**Suggestions**

- Apply an expected-record check to the existing pen’s overwrite transaction too.
- Add a two-tab test in which the editor saves first and the stale version pen attempts Save-over second.

**Risk assessment:** **HIGH.** The proposed concurrency guarantee leaves a reachable lost-update path.

## 11-04

**Summary:** The renderer extraction is appropriately scoped, and the repeated-label and sole-removed-target fixes are sound.

**Strengths**

- Occurrence-based matching addresses the current label-keyed Maps, which collapse repeated labels: [diff.js:155](/Users/mark/Documents/projects/sprinkles/app/src/domain/diff.js:155).
- Removing outer length guards correctly allows a target present only in the baseline to render. The current guards are visible at [Method.jsx:395](/Users/mark/Documents/projects/sprinkles/app/src/ui/Method.jsx:395) and [Method.jsx:760](/Users/mark/Documents/projects/sprinkles/app/src/ui/Method.jsx:760).

**Concerns**

- **MEDIUM — Verification integration:** the planned label-first changed-target markup needs the corrected hash test identified in 11-01. The renderer itself follows the approved reading order.

**Suggestions**

- Include the changed-target renderer’s actual DOM in the normalisation fixture.
- Keep the repeated-label and sole-removed-target tests as specified.

**Risk assessment:** **MEDIUM.** Product behavior is well covered; the remaining issue is the compatibility proof.

## 11-05

**Summary:** This is a restrained print change with appropriate source-backed tests. The round 1 dispositions are sound.

**Strengths**

- Empty sections already depend on content through `wholePlan`; testing that behavior avoids unnecessary print changes. See [PrintSheetPages.jsx:318](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintSheetPages.jsx:318).
- Waiting for `data-print-ready` and selecting laid pages correctly avoids certifying the hidden measurement copy. See [PrintSheet.jsx:135](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintSheet.jsx:135).

**Concerns**

- No new blocking concern found in the inspected print path.

**Suggestions**

- Preserve the explicit distinction between automated print-media checks and the pending iPad PDF check.

**Risk assessment:** **LOW.** The changes are narrow and reuse the established print pipeline.

## 11-06

**Summary:** The editor slice is coherent, including the revised target-removal exception. One board gate is scheduled before all the geometry it measures exists.

**Strengths**

- Direct-child CSS selectors prevent editor rules from leaking into the nested Preview.
- Reusing the on-demand-field hook avoids duplicating established focus behavior.

**Concerns**

- **MEDIUM — pE1’s full target-line box comparison depends on deferred controls.** The spec measures both steps’ target-line boxes relative to the method region: [11-06-PLAN.md:195](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-06-PLAN.md:195).

  The board’s first step includes its uses control and acts row before the second step; that order is explicit in [CONTRACT.md:16](/Users/mark/Documents/projects/sprinkles/.planning/sketches/014-steps-structure-save/CONTRACT.md:16). The uses control arrives in 11-07 and the acts row in [11-08-PLAN.md:106](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-08-PLAN.md:106). Consequently, the second target line cannot yet occupy its final board position.

**Suggestions**

- Limit this gate to the first step/Preview, then add the second-step positional checks once the intervening controls exist.
- Alternatively, move the complete pE1 geometry gate to 11-08. Do not compensate with temporary spacing.

**Risk assessment:** **MEDIUM.** This can block the prescribed execution sequence despite correct incremental implementation.

## 11-07

**Summary:** The per-step-order rework is consistent with the owner’s decision and reaches the shared grouping seam used by screen and print.

**Strengths**

- Changing `groupPortionsByStep` reaches every consumer without creating parallel ordering implementations. Its existing entries are assembled centrally at [IngredientTable.jsx:36](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:36).
- Checking the old baseline before applying the ordering change prevents earlier editor regressions from being absorbed into the new recording.
- The kept-draft normalisation preserves amounts that the former projection could otherwise omit.

**Concerns**

- No additional app-ordering blocker found.
- **MEDIUM — Proof dependency:** baseline integrity depends on tightening 11-14’s patch restriction; its present checks do not establish the claimed “only these two code regions changed” boundary.

**Suggestions**

- Retain the plain-versus-patched recording sequence and require the strengthened patch check before replacing the committed baseline.

**Risk assessment:** **MEDIUM.** The app change is clear; the baseline replacement needs trustworthy tooling.

## 11-08

**Summary:** Stable identities, post-render focus requests and repeated announcements make this a strong interaction plan.

**Strengths**

- The focus-request approach extends the existing page pattern rather than assuming keyed DOM moves preserve focus. See [CreationPage.jsx:136](/Users/mark/Documents/projects/sprinkles/app/src/ui/CreationPage.jsx:136).
- Testing both groups after moving a split row verifies the newly accepted independent-order behavior.

**Concerns**

- **LOW — The accessible-name test contradicts the specified remove labels.** The plan deliberately gives both lines of a split row the same `remove ${name}` label, but then requires every table control’s accessible name to be unique. See [11-08-PLAN.md:140](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-08-PLAN.md:140) and [11-08-PLAN.md:154](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-08-PLAN.md:154).

**Suggestions**

- Scope uniqueness assertions to line-specific controls such as Move and grams fields, or explicitly distinguish the remove labels by step.

**Risk assessment:** **MEDIUM.** Interaction complexity warrants the planned browser/device coverage; the test contradiction is straightforward to fix.

## 11-09

**Summary:** Save now has a credible atomic path, appropriate failure recovery and a useful deferred-promise test matrix.

**Strengths**

- Ending the writer before saving addresses the existing unmount-flush mechanism, which otherwise writes pending drafts. See [useKeptDraft.js:35](/Users/mark/Documents/projects/sprinkles/app/src/ui/useKeptDraft.js:35).
- The saving lock, frozen draft setter and mounted check cover distinct races rather than relying only on disabling Save.
- The builder tests against `validateStoreFile` provide meaningful integration coverage.

**Concerns**

- **MEDIUM — The newly introduced total-overflow refusal is not carried through to field feedback.** The gate emits `grams-total:${rowId}` targeted at the last line: [11-09-PLAN.md:177](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-09-PLAN.md:177). The later UI plan only consumes `grams:${rowId}:${step}`. Saving is blocked, but the maker can receive focus without the promised explanation.

**Suggestions**

- Define the total-overflow message’s UI mapping here as part of the gate contract.
- Add a flow test using two individually finite lines whose sum overflows.

**Risk assessment:** **MEDIUM.** Atomicity is well addressed; one new refusal lacks its complete presentation path.

## 11-10

**Summary:** The stale-edit recovery and family-scoped deletion revisions address the earlier draft-loss findings. The no-op round-trip guarantee remains broader than the conversion supports.

**Strengths**

- Reading `activeRows` correctly excludes struck portions and portions belonging to removed steps. See [rows.js:65](/Users/mark/Documents/projects/sprinkles/app/src/domain/rows.js:65).
- Keeping stale edits reachable through a refused editor preserves Cancel as the maker’s recovery path.
- Exercising the real second-tab batch-save/discard path is substantially stronger than inserting a batch directly.

**Concerns**

- **MEDIUM — A no-op Edit can change balance when embedded coefficients differ from today’s library.** `draftFromVersion` retains library links and grams, while `applyEditToVersion` rebuilds rows from current library entries: [11-10-PLAN.md:130](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-10-PLAN.md:130). `rowFromLibraryRecord` copies the current entry: [versionRow.js:74](/Users/mark/Documents/projects/sprinkles/app/src/domain/versionRow.js:74).

  That follows D-03’s fresh-copy decision, but it contradicts the unconditional claim that a no-op edit preserves every Balance figure. Imported records can legitimately contain older embedded coefficients.

**Suggestions**

- Add a fixture whose embedded ingredient differs from its linked library entry.
- Keep D-03’s accepted refresh behavior explicit and narrow the “lossless” guarantee to the properties actually preserved.

**Risk assessment:** **MEDIUM.** The recovery behavior is strong; the coefficient-refresh consequence needs accurate tests and wording.

## 11-11

**Summary:** Feedback placement and accessibility wiring are carefully specified, including the previously missing `Segmented` integration. The total-overflow message remains omitted.

**Strengths**

- Extending `Segmented` is necessary because it owns the actual radiogroup: [Segmented.jsx:59](/Users/mark/Documents/projects/sprinkles/app/src/ui/Segmented.jsx:59).
- Repeated refused-press focus tests cover behavior that a one-shot `saveAttempted` flag alone would not establish.

**Concerns**

- **MEDIUM — `grams-total` has no consumer.** [11-11-PLAN.md:111](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-11-PLAN.md:111) only looks up per-line `grams` messages. Both fields can individually parse successfully, so the current blur-message mechanism also produces no error; see [IngredientTable.jsx:655](/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientTable.jsx:655).

**Suggestions**

- Project every line-targeted block onto its target line, including `grams-total`, rather than recognising only one ID prefix.
- Assert the visible message, outline, `aria-invalid`, `aria-describedby` and focus for this case in both modes.

**Risk assessment:** **MEDIUM.** The omission breaks the “every refusal appears in its own place” acceptance criterion.

## 11-12

**Summary:** Loading-state eligibility, stale-edit discoverability and the separated import states are improvements. The justification for deferring cross-tab refresh overstates the store’s protection.

**Strengths**

- Using the version’s own batch readiness flag avoids relying on `allBatches`, whose read has no corresponding readiness state. See [useRecipeData.js:188](/Users/mark/Documents/projects/sprinkles/app/src/ui/useRecipeData.js:188).
- Keeping Notebook resume links for stale edits correctly implements D-06 without quiet deletion.

**Concerns**

- **HIGH — The “store is the guard” disposition is incomplete.** The claim at [11-12-PLAN.md:37](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-12-PLAN.md:37) covers draft writes and deletes, but the stale pen’s version overwrite remains unguarded. Its handler checks the tab’s old `batches` array and then calls `saveVersion`: [useVersionPen.js:225](/Users/mark/Documents/projects/sprinkles/app/src/ui/useVersionPen.js:225).

  This is why the lost-update sequence identified under 11-03 remains possible. Live refresh can remain deferred, but transactional protection must cover the existing overwrite path.

**Suggestions**

- Correct the disposition’s guarantee and add the reciprocal stale-pen save test.
- Do not require a broad cross-tab event system merely to fix this; a conditional write at the repository boundary can address the integrity issue.

**Risk assessment:** **HIGH** until the version-write gap is closed.

## 11-13

**Summary:** The final proof plan appropriately separates automated completion from pending device verification.

**Strengths**

- Reading print output only after `data-print-ready` matches the actual print-route lifecycle: [PrintSheet.jsx:135](/Users/mark/Documents/projects/sprinkles/app/src/ui/PrintSheet.jsx:135).
- The expanded device sequence exercises row movement, boundary focus and split-row fold-back.
- The explicit automated-versus-iPad distinction is preserved in [11-13-PLAN.md:149](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-13-PLAN.md:149).

**Concerns**

- No independent new blocker found in this plan.
- Its final evidence cannot compensate for missing concurrency or overflow-feedback cases in earlier plans.

**Suggestions**

- Include the added stale-version-pen and total-overflow flow tests in the final suite.
- Continue reporting the actual iPad PDF and keyboard result as pending until Mark completes the row.

**Risk assessment:** **MEDIUM.** The handoff is well defined; final confidence depends on closing the earlier gaps.

## 11-14

**Summary:** Splitting the baseline tooling out of 11-07 improves execution scope. Its central patch-restriction claim is not enforced by the specified checks.

**Strengths**

- Optional raw-text recordings provide inspectable evidence for the order-only baseline change.
- The negative tests cover changed text, fields, stores and method hashes without weakening normal walk comparison.

**Concerns**

- **MEDIUM — The patch guard allows unrelated edits inside the two permitted files.** [11-14-PLAN.md:110](/Users/mark/Documents/projects/sprinkles/.planning/phases/11-steps-structure-save-and-print/11-14-PLAN.md:110) checks filenames, then compares only `groupPortionsByStep` and the `usesNames` line against the checkout. It never proves that the rest of either patched file equals BASE.

  A patch containing the intended ordering edits plus an unrelated render change elsewhere in `IngredientTable.jsx` satisfies all three checks. The current negative tests do not exercise that case.

**Suggestions**

- Require all text outside the two allowed regions to remain identical to BASE.
- Add a negative fixture containing valid ordering edits plus an unrelated edit elsewhere in an allowed file.
- Preserve the independent plain-versus-patched recording check.

**Risk assessment:** **MEDIUM.** The tooling is useful, but its claimed baseline boundary is currently wider than intended.

## Overall assessment

**Coverage: 14/14 plans reviewed. Overall risk: HIGH until the stale version-pen overwrite path is protected.**

Most round 1 dispositions are sound. The revised plans substantially improve atomicity, allocation conservation, stale-edit recovery and browser evidence. Before execution, address these concrete gaps:

1. Guard the existing version pen’s stale Save-over.
2. Reschedule pE1 geometry checks that depend on deferred controls.
3. Connect total-overflow refusals to visible, accessible field feedback.
4. Test actual changed-target markup in the hash normaliser.
5. Restrict baseline patches to the intended code regions.
6. Correct the exact-decimal arithmetic and narrow the no-op Balance guarantee.

---

## Consensus Summary

One grounded review this round, so there is no cross-reviewer agreement to report; the sections below record what Codex found, weighted as a single source-grounded voice. Codex rates the round overall **HIGH until the stale version-pen overwrite is guarded**, with the rest MEDIUM and 11-05 LOW. It judges most Round 1 dispositions sound and names one as incomplete (11-12's "the store is the guard").

### Agreed Strengths

Single reviewer; listed as Codex's strengths, not agreement.

- The Round 1 rework lands: atomic creation and Save-over with expected-record checks (11-03), `normalizeAllocation` with conservation tests (11-02), `endDraft()` before Save (11-09), stale edits kept reachable through a refused editor instead of deleted (11-10, 11-12), the `Segmented` wiring (11-11), print scoped to laid pages after `data-print-ready` (11-05, 11-13).
- Per-step order reaches every consumer through `groupPortionsByStep` (`IngredientTable.jsx:36`), and the plain-versus-patched recording check keeps earlier editor regressions out of the new baseline (11-07, 11-14).
- Hidden tombstones fit `nextStepKey` as it is (`stepKeys.js:24`); occurrence-based target matching fixes the label-keyed collapse (`diff.js:155`); the removed outer length guards let a sole removed target render (`Method.jsx:395`, `:760`).

### Agreed Concerns

Codex's findings, highest severity first.

1. **11-03 / 11-12 — a stale version pen can still overwrite the newly edited root** (HIGH). The new guards cover draft writes, draft deletes and `saveFirstVersionOver`, but the existing pen saves through `repository.saveVersion` (`useVersionPen.js:242`), which checks Sheet codes only (`repository.js:98`) and never compares the version the pen read. Tab B opens a clean Next version pen on V0, Tab A edits and saves V1, Tab B presses Save over this version, V0-based record overwrites V1. A clean pen writes no kept draft (`penDraft.js:84`), so the draft-family guard cannot catch it. The 11-12 disposition "the store is the guard" (`11-12-PLAN.md:37`) is therefore incomplete. Fix: an expected-record check on the pen's overwrite transaction too, plus a two-tab test with the editor saving first; no cross-tab event system needed.
2. **11-06 — pE1 measures geometry that does not exist yet** (MEDIUM). The full target-line box comparison (`11-06-PLAN.md:195`) assumes step 1's uses control (11-07) and acts row (`11-08-PLAN.md:106`) are between the two steps, as the board orders them (`CONTRACT.md:16`). Limit the gate to the first step and Preview, or move the full pE1 geometry gate to 11-08; do not pad spacing to compensate.
3. **11-09 / 11-11 — the total-overflow refusal has no field feedback** (MEDIUM in both). The gate emits `grams-total:${rowId}` (`11-09-PLAN.md:177`) but 11-11 consumes only `grams:${rowId}:${step}` (`11-11-PLAN.md:111`), and the blur-message path produces nothing when both lines parse (`IngredientTable.jsx:655`). Save is blocked and focus lands with no message. Project every line-targeted block onto its line and test message, outline, `aria-invalid`, `aria-describedby` and focus in both modes, with a flow test of two finite lines whose sum overflows.
4. **11-01 / 11-04 — the struck-target normaliser proves the wrong transformation** (MEDIUM). Today the struck value precedes the label (`Method.jsx:400`); 11-04 puts the label first. The normtest (`11-01-PLAN.md:174`) only rewrites the struck span's text, so it passes without the markup move. Canonicalise label, old and new value in an explicit order and test the actual before-and-after DOM.
5. **11-14 / 11-07 — the patch guard does not bound the baseline change** (MEDIUM). `ordercheck` (`11-14-PLAN.md:110`) checks filenames and the two allowed regions but never proves the rest of either file equals BASE, so an unrelated render change in `IngredientTable.jsx` passes. Require identity outside the two regions and add that negative fixture; 11-07's baseline replacement should wait on the stronger check.
6. **11-02 — "exact hundredths up to the safe-integer limit" is false via `Number`** (MEDIUM). `Math.round(Number(s) * 100)` (`11-02-PLAN.md:198`, same conversion as `lineage.js:212`) turns `35184372088832.02` into `...3203` hundredths instead of `...3202`. Parse hundredths from the decimal string with integer arithmetic and test against an independent oracle.
7. **11-10 — a no-op Edit can move Balance** (MEDIUM). `draftFromVersion` keeps links and grams while `applyEditToVersion` rebuilds rows from the current library (`11-10-PLAN.md:130`, `versionRow.js:74`), which follows D-03 but contradicts the unconditional "every Balance figure preserved" claim for imported records with older embedded coefficients. Add a fixture whose embedded entry differs from the library and narrow the guarantee.
8. **11-08 — the uniqueness test contradicts the remove labels** (LOW). Both lines of a split row get `remove ${name}` (`11-08-PLAN.md:140`) while `:154` requires every table control's name to be unique. Scope uniqueness to line-specific controls or name the step in the remove label.

### Divergent Views

None within this round (one reviewer). Against Round 1: Codex now reads 11-05, 11-13 and the stale-edit handling as settled, where Round 1 had them as agreed concerns, and it confirms Round 1's deferred cross-tab refresh can stay deferred provided the repository boundary gets the conditional write in finding 1.
