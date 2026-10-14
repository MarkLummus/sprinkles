---
phase: 05-split-the-recipe-page
verified: 2026-10-14T11:54:55Z
status: human_needed
score: 4/5 must-haves verified
covered_files:
  - ".planning/phases/05-split-the-recipe-page/05-01-PLAN.md"
  - ".planning/phases/05-split-the-recipe-page/05-01-SUMMARY.md"
  - ".planning/phases/05-split-the-recipe-page/05-02-PLAN.md"
  - ".planning/phases/05-split-the-recipe-page/05-02-SUMMARY.md"
  - ".planning/phases/05-split-the-recipe-page/05-03-PLAN.md"
  - ".planning/phases/05-split-the-recipe-page/05-03-SUMMARY.md"
  - ".planning/phases/05-split-the-recipe-page/05-04-PLAN.md"
  - ".planning/phases/05-split-the-recipe-page/05-04-SUMMARY.md"
  - ".planning/phases/05-split-the-recipe-page/05-05-PLAN.md"
  - ".planning/phases/05-split-the-recipe-page/05-05-SUMMARY.md"
  - ".planning/phases/05-split-the-recipe-page/05-06-PLAN.md"
  - ".planning/phases/05-split-the-recipe-page/05-06-SUMMARY.md"
  - "app/src/domain/penDraft.js"
  - "app/src/domain/recordDraft.js"
  - "app/src/ui/IngredientTable.jsx"
  - "app/src/ui/RecipePage.jsx"
  - "app/src/ui/RecipePage.shell.test.js"
  - "app/src/ui/usePenDraft.js"
  - "app/src/ui/useRecordDraft.js"
covered_digest: "v3:sha256:9394dc5371a75faa658847de1535d5c1ce006efb3b4e46245ee6e1d4e42b4928"
behavior_unverified: 1
behavior_unverified_items:
  - truth: "Undo of a removed tasting retires only when the edit is inside the tasting body (SC3 / D-13e, the split keeps the tasting-body-only retirement exactly)"
    test: "Remove a tasting that has ink, then edit a tasting-body field (a tasting text field, segment, mark-one or axis mark) and confirm Restore tasting is gone; edit a churn field instead and confirm Restore tasting stays"
    expected: "Tasting-body edit sets pendingUndo to null; churn-field edit leaves it"
    why_human: "The page's conditional (if isTastingBodyField(field) recordPen.retireUndo()) in handleChangeRecordField / handleChangeSegment / handleChangeMarkOne / handleClearSegment / handleClearMarkOne is exercised by no test. The hook's retireUndo() and isTastingBodyField() are each unit-tested, and the walk covers the churn-field half (undo stays). The tasting-body half cannot be reached by clicking once the section is collapsed (05-01-SUMMARY known limit), so the walk cannot cover it either."
overrides_applied: 0
re_verification:
  is_re_verification: false
gaps: []
deferred: []
advisory: []
human_verification:
  - test: "Decide on behavior_unverified_items[0]: accept as an override (the branch is unreachable by the maker, the 9 retirement sites match the 9 at 4f1f98f line for line) or add one jsdom test that drives the page handler"
    expected: "A recorded decision. No device check is needed (D-11)."
    why_human: "Rule: a state-transition truth with no test on the composition cannot be VERIFIED on presence alone. Whether an unreachable branch needs a test is a product call."
---

# Phase 5: Split the recipe page Verification Report

**Phase Goal:** Creating and editing can share one editor: the recipe page's draft logic becomes pure operations in `domain/`, driven through `usePenDraft` for the pen and a second hook for recording and tasting, and `RecipePage` is left as the route shell, with nothing changed for the maker
**Verified:** 2026-10-14T11:54:55Z
**Status:** human_needed
**Re-verification:** No, initial verification

The goal is achieved in the codebase. I found no failed truth, no missing or stubbed artifact and no broken link. One sub-invariant is present and wired but no test exercises it (see below), and that routes the phase to `human_needed` under the decision tree. It is not a gap and is not a blocker for Phase 6.

## Goal Achievement

### Observable Truths (ROADMAP success criteria, the contract)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Every pure helper `RecipePage.jsx` exported at 4f1f98f is imported from `app/src/domain/` with no React, DOM or store import; tests run under node with no jsdom docblock | VERIFIED | `git show 4f1f98f:...RecipePage.jsx` exported 16 helpers plus `CHURN_DATE_BLOCKED_MESSAGE`. I grepped each: all 17 are exported from `domain/penDraft.js` (isPenDraftDirty, toggleDraftRowLines, derivePenState, restoreStepFromVersion) or `domain/recordDraft.js` (the rest). `RecipePage.jsx` now exports only `RecipeNotFound`, `RecipePage` and 11 status strings. Domain imports are sibling `./*.js` only (penDraft: rows, lineage; recordDraft: battery, axes, batch, lineage, penDraft). `domain/penDraft.test.js` and `recordDraft.test.js` have no `@vitest-environment`; `vitest.config.js` default is `node`. |
| 2 | Each pen change is a pure function in `domain/`, tested under node, reached through `usePenDraft`; blocked-save reset happens in one place instead of 32 lines | VERIFIED | `usePenDraft.js` holds exactly one `setBlockedMessage(null)` and one `setBlockedTarget(null)` (lines 37-38, inside `clearBlock`). `RecipePage.jsx` contains zero `setBlocked*` and zero `setPenDraft`. `versionPen.edit(` appears 11 times (the eleven pen edits), plus open, close, restore, checkSave. `penDraftRow` own-property lookup (`domain/penDraft.js:16`) serves IngredientTable (146, 655) and the domain readers. `usePenDraft.test.jsx` tests "two edit() calls in one batch both land". |
| 3 | Recording, correcting and tasting are pure ops in `domain/`, tested under node, driven through one hook, with the churn-date reset in one place | VERIFIED for structure; one sub-invariant PRESENT_BEHAVIOR_UNVERIFIED (see below) | `useRecordDraft.js` holds one `setBlockedDateMessage(null)` (line 65, in `clearDateBlock`); `RecipePage.jsx` has none of the 12 hook-owned setters. `recordPen.edit(` appears 11 times. Ops live in `domain/recordDraft.js` with `recordDraft.test.js` under node. `useRecordDraft.test.jsx` covers the date-block reset, own-field error clear, remove/restore tasting and lifecycle resets. |
| 3a | Undo retires only for a tasting-body edit, and for every mark, defect and declared-problem edit | PRESENT_BEHAVIOR_UNVERIFIED | Wired, and the 9 retirement sites in `RecipePage.jsx` (967, 985, 999, 1011, 1022, 1035, 1040, 1053, 1064) match the 9 handler sites at 4f1f98f one for one, with the same `isTastingBodyField` guards. But no test drives the page conditional; the walk cannot reach it. |
| 4 | `RecipePage.jsx` reads as the route shell; every existing test passes; moved-helper imports repointed; none deleted or weakened | VERIFIED | `RecipePage.shell.test.js` (24 tests, passes) pins: module functions are only `joinNames`, `PageLoadFailed`, `RecipeNotFound`, `RecipePage`; each hook called once above the early return; no unused import; repository seam still imported; no `dangerouslySetInnerHTML`. `it(` counts at HEAD vs 4f1f98f: RecipePage.test.jsx 108/108, RecipePage.drafts.test.jsx 38/38, BatchRow.test.jsx 206/206. The diff of those three files is import lines only. `domain/draft.js` is byte-identical to 4f1f98f. Full suite: 84 files, 2672 tests, all pass (my own run). The file is still 1836 lines (down from 2683): what remains is route reading, repository loads, save locks, status/announce/focus counters and JSX composition, with every draft mutation delegated to `edit()`/hook methods. |
| 5 | In the built app the maker sees no change: same page, same saved records, same kept draft after reload | VERIFIED | I built HEAD to a scratch `--outDir`, ran `05-walk.mjs record` in WebKit (94 snapshots), and `compare 05-walk-before.json <mine>` printed `MATCH 94 snapshots`. The before file was committed in ba812fa, and no `app/` commit lies between base 4f1f98f and ba812fa. It spans 11 scenarios: version pen kept draft, blocked, notice edits, save-as-new/save-over; record pen edit handlers (all 11), blocked, save, kept draft; correct save and kept draft; tasting remove/restore and save. Store dumps (versions, batches, recipes, drafts) are in the compare. |

**Score:** 4/5 success criteria fully verified; SC3 is verified structurally with 1 present, behavior-unverified sub-invariant (3a).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/domain/penDraft.js` | pen helpers, ops, builders (399 lines) | VERIFIED | Substantive, imported by RecipePage, IngredientTable, usePenDraft, recordDraft. |
| `app/src/domain/recordDraft.js` | record helpers, ops, builders (538 lines) | VERIFIED | Imported by RecipePage and useRecordDraft. |
| `app/src/ui/usePenDraft.js` | hook: state, edit, open, close, restore, checkSave (94 lines) | VERIFIED | Imports only `react` and `../domain/`; no repository. |
| `app/src/ui/useRecordDraft.js` | record hook (250 lines) | VERIFIED | Same. |
| `app/src/ui/usePenDraft.test.jsx`, `useRecordDraft.test.jsx` | jsdom Harness tests | VERIFIED | Pass in suite. |
| `app/src/ui/RecipePage.shell.test.js` | node source-text proof | VERIFIED | 24 tests pass (see WR-02 below for its limit). |
| `05-walk.mjs`, `05-walk-before.json`, `05-walk-after.json` | walk and baselines | VERIFIED | Independently re-recorded; MATCH. |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| RecipePage.jsx | usePenDraft.js | `const versionPen = usePenDraft()`, `versionPen.edit/open/close/restore/checkSave` | WIRED |
| RecipePage.jsx | useRecordDraft.js | `const recordPen = useRecordDraft()`, `recordPen.*` | WIRED |
| usePenDraft.js | domain/penDraft.js | `penDraftFromVersion`, `penSaveBlock`, `penFieldsFromDraft` | WIRED |
| useRecordDraft.js | domain/recordDraft.js | `validateRecordDraft`, `recordFieldsFromDraft`, `blankRecordDraft`, `amendDraftFromBatch` | WIRED |
| IngredientTable.jsx | domain/penDraft.js | `penDraftRow(penDraft, row.id)` at 146 and 655 | WIRED |
| recordDraft.js | penDraft.js | `usesListsDiffer` | WIRED |
| 05-walk.mjs | store | IndexedDB `sprinkles` reads | WIRED (ran) |

### Data-Flow Trace (Level 4)

The hooks' state feeds the page's JSX through destructured values (`draft`, `penDraft`, `blockedMessage`, `fieldErrors` and so on). Real state, set by real ops; the walk shows the rendered fields, marks and focus follow edits. FLOWING.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite | `npm --prefix app test` | 84 files, 2672 tests pass | PASS |
| Build to scratch outDir | `npm --prefix app run build -- --outDir <scratch>` | built, `app/dist` untouched | PASS |
| WebKit walk vs baseline | `05-walk.mjs record` then `compare` | `MATCH 94 snapshots` | PASS |
| Shell test | `vitest run src/ui/RecipePage.shell.test.js` | 24 pass | PASS |

### Probe Execution

SKIPPED: the phase declares no `probe-*.sh`; the walk is the equivalent and was run above.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| EDIT-01 | 05-02, 05-04, 05-06 | Pure helpers live in `domain/`, no framework/DOM/store import, tests under node | SATISFIED | SC1 evidence. |
| EDIT-02 | 05-03, 05-06 | Pen changes are pure domain ops through `usePenDraft`; clear-block lines gone | SATISFIED | SC2 evidence. |
| EDIT-03 | 05-05, 05-06 | Recording and tasting extracted the same way | SATISFIED for structure; 3a noted | SC3 evidence. |
| EDIT-04 | 05-01, 05-06 | RecipePage is the route shell; maker sees no change; suite passes | SATISFIED | SC4 and SC5 evidence. |

All four IDs appear in plan frontmatter and in REQUIREMENTS.md (traceability table rows 71-74, still marked Pending there; the checkboxes and table are a tracking update for the orchestrator). No orphaned requirements: REQUIREMENTS.md maps only EDIT-01..04 to Phase 5, and every one is claimed by a plan.

### Prohibitions (05-06-PLAN must_haves.prohibitions, ADR-550)

All three carry `status: unresolved, flagged: true` and no `verification` tier; I treat them as judgment-tier, so my verdicts are non-authoritative.

| Prohibition | Verdict | Evidence |
|-------------|---------|----------|
| MUST NOT change what a stored record or kept draft holds | No violation found | Walk compare includes the versions, batches, recipes and drafts store dumps for every save and kept-draft scenario: MATCH. |
| MUST NOT tidy behaviour (D-05 inconsistency, own-field-only error clear, tasting-body-only undo) | No violation found, with the 3a caveat | Only version-line/headnote edit also clears page status; own-field `clearFieldError`; retirement sites match the original. The undo-retirement composition is the 3a item. |
| MUST NOT add any screen, control or creation UI; hooks gain no caller beyond RecipePage | No violation found | New files at HEAD vs base are 4 domain files, 2 hooks, 3 tests only (no new `.jsx` component). Only `RecipePage.jsx` imports either hook. |

Flag: `unverified-prohibition, human review recommended` is carried here for the record; evidence for each is deterministic or by diff, so the review can be a glance.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | | TBD/FIXME/XXX in modified files | | None found. |

Code review findings (05-REVIEW.md, advisory, not gaps; dispositions are all `open`):

| ID | Severity | Note |
|----|----------|------|
| WR-01 | Warning | `recordDraft.js` `setAsMadePortion` does a bare `asMade[rowId] = next` write; a row id of `__proto__` loses the maker's typing. Inherited unchanged from the old handler, already raised to Mark as bug row `bug-record-pen-proto-row-id`. Not fixed until he answers. Not a Phase 5 gap. |
| WR-02 | Warning | `stripComments` in `RecipePage.shell.test.js` can hide a setter after `//` inside a string. I read RecipePage.jsx and found no such line today, so the proof holds now; the test is weaker than it reads. |
| IN-01..03 | Info | Peer-module coupling `usesListsDiffer`; stale comment at `RecipePage.jsx` 622-624; `removeTasting`/`undoRemoveTasting` read render-time state (latent, matches pre-phase behavior). |

### Human Verification Required

#### 1. Undo retirement on a tasting-body edit (behavior_unverified_items[0])

**Test:** Remove a tasting that has ink, then edit a tasting-body field (a tasting text field, a segment, mark-one or an axis mark). Then repeat, editing a churn field instead.
**Expected:** The tasting-body edit retires Restore tasting; the churn-field edit leaves it.
**Why human:** No test drives the page's `if (isTastingBodyField(field)) recordPen.retireUndo()` composition, and clicking cannot reach it in the built app (the section is collapsed after removal), so the walk cannot either. The code matches the pre-split handlers one for one; this is a decision whether that is enough. Suggested resolution if you accept it:

```yaml
overrides:
  - must_have: "Undo of a removed tasting retires only when the edit is inside the tasting body"
    reason: "Unreachable by the maker in the built app; the 9 retirement sites match 4f1f98f one for one; hook retireUndo and isTastingBodyField are unit-tested separately"
    accepted_by: "Mark"
    accepted_at: "<ISO timestamp>"
```

The alternative is one jsdom test that mounts `RecipePage` and drives the handler. SC5 is device-free by D-11; no row for Mark is needed on the list.

### Gaps Summary

No gaps. The split is real: the 17 moved names are in `domain/`, the two hooks own the draft state with one reset each, `RecipePage.jsx` holds no draft setter, the suite is green, and a fresh WebKit walk of a fresh build matches the pre-split baseline on all 94 snapshots including the stores. The only open item is the one present-but-unexercised undo-retirement branch, which needs a human decision and does not block Phase 6.

---

_Verified: 2026-10-14T11:54:55Z_
_Verifier: Claude (gsd-verifier)_
