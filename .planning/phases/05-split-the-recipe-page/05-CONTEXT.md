# Phase 5: Split the recipe page - Context

**Gathered:** 2026-10-14
**Status:** Ready for planning

<domain>
## Phase Boundary

The recipe page's draft logic leaves `app/src/ui/RecipePage.jsx` (2,683 lines) for pure operations in `app/src/domain/`, driven through two hooks: `usePenDraft` (the version pen) and `useRecordDraft` (recording, correcting and tasting a batch). `RecipePage` is left as the route shell. The maker sees no change. Requirements: EDIT-01, EDIT-02, EDIT-03, EDIT-04. No screen changes, no UI-SPEC.

</domain>

<decisions>
## Implementation Decisions

### Where moved code lands
- **D-01:** Two new domain files. `domain/penDraft.js` holds the pen helpers and ops (`isPenDraftDirty`, `restoreStepFromVersion`, `toggleDraftRowLines`, `derivePenState` and the per-edit pure functions). `domain/recordDraft.js` holds the record/tasting helpers (`blankRecordDraft`, `draftFromBatch`, `isDraftDirty`, `validateRecordDraft`, `parseAllMeasuredFields`, `buildChurnFieldsFromDraft`, `buildTastingFieldsFromDraft`, `tastingHasInk`, `tastingPayloadFromDraft`, `restoreDraftFromUndo`, `isTastingBodyField`, `batchSavedStatus` and the record ops). `domain/draft.js` stays the storage-record module (`buildDraftRecord`, `newestDraft`, `draftMatchesVersion`) and its tests are untouched.
- **D-02:** Exported strings follow their user. A string a moved helper uses (e.g. `CHURN_DATE_BLOCKED_MESSAGE`) moves into the same domain file; strings only the page's save/cancel flow uses (e.g. `VERSION_SAVED_STATUS`, `DRAFT_KEPT_STATUS`, `BATCH_SAVE_ERROR`) stay exported from `RecipePage.jsx`. Tests that imported a moved helper or string now import it from `domain/`; none deleted or weakened.
- **D-03:** The five bare `penDraft.rows[row.id]` reads (`IngredientTable.jsx` 145 and 654; `RecipePage.jsx` 309, 1370, 2293) go through one accessor, `penDraftRow(penDraft, rowId)`, in `domain/penDraft.js`, using an own-property check, with a node test. This closes T-03.6-02.

### The blocked-save reset in one place
- **D-04:** `usePenDraft` keeps `useState` for `penDraft`, `blockedMessage` and `blockedTarget` and exposes one `edit(op, ...args)`: it clears `blockedMessage` and `blockedTarget` together, then applies a pure `(draft, ...args) => draft` op. All 16 pen edit handlers go through it, replacing the repeated `setBlockedMessage(null)` / `setBlockedTarget(null)` lines. No `useReducer`.
- **D-05:** Only `handleChangePenField` (headnote / version-line fields) also clears the page status (`onPageStatus('')`) and the announcer (`announce('')`); the other 15 edits do not. Keep exactly. The hook knows nothing about page status; `RecipePage`'s handler for that one field clears status and announce, then calls `edit()`.
- **D-06:** `useRecordDraft` does the same for the churn-date block: one place resets `blockedDateMessage` for the 16 sites that clear it today. Per-handler differences in what else each record handler clears (`fieldErrors` entry for its own field only, `formStatus`, `pendingUndo` only for tasting-body fields) are preserved exactly (WR-03).

### What the hooks own
- **D-07:** Hooks own the draft only: draft state, pure ops, dirty checks, validation, blocked state, and the built fields. They expose the built fields; `RecipePage` calls the repository and runs the save locks (`versionSaveLockRef`, `batchSaveAction`). A v2 creation editor reuses the hook with its own create-and-save.
- **D-08:** The draft-store effects (autosave on `visibilitychange`, restore on load via `draftRestoreDone`, discard on cancel) stay in `RecipePage`. They are persistence; the pure parts they use already live in `domain/`. No third hook.
- **D-09:** One record hook, `useRecordDraft`. It owns the draft, amend baseline and opener, field errors, the churn-date block and pending undo. Focus-attempt counters and status strings stay with the shell unless planning finds they belong with the blocks they accompany (planner's call).

### Tests and proof
- **D-10:** Hook tests follow `app/src/ui/useFold.reset.test.jsx`: a small Harness component, `createRoot` + `act`, jsdom opted in per file by docblock. No `@testing-library/react`, no new dependency. Pure ops carry most coverage under node (default environment, no jsdom docblock in `domain/` tests); hook tests prove only the wiring (`edit()` clears blocked state, one reset path).
- **D-11:** Success criterion 5 is proven by the suite plus a WebKit walk of the built app (Playwright WebKit is installed), done by Claude with no row for Mark. Before the first plan, record what the version pen, record pen, correction, tasting and a reload-with-draft do; after the last plan, repeat and compare saved records and the kept draft. The existing RecipePage tests render static markup and never run effects, so the reload path is not covered without the walk.

### Claude's Discretion
- Exact op names and signatures, and the split of ops between the two domain files beyond D-01's lists.
- Where the focus-attempt counters (`blockedDateAttempt`, `addTastingAttempt`, `removeTastingAttempt`, `restoreAttempt`, `focusBatchAttempt`, `blockedAttemptRef`) live (D-09).
- Plan and wave breakdown, keeping each step small and the suite green at every commit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` § Phase 5 — goal, five success criteria, notes on hook tests and T-03.6-02
- `.planning/REQUIREMENTS.md` § Editor refactor — EDIT-01 to EDIT-04; § Out of Scope (no creation UI)

### Conventions
- `.claude/CLAUDE.md` § Conventions — domain modules framework-free and tested under node; repository seam; `tabIndex` and Button rules
- `.planning/codebase/CONVENTIONS.md` — source of the Conventions block
- `.planning/notes/2026-10-01-engineering-notes.md` — why for device UAT, one Vite process, tabIndex

### Prior art for this code
- `app/src/ui/useFold.reset.test.jsx` — the hook-test pattern to follow (D-10)
- `app/src/domain/draft.js` — storage-record module that stays as is (D-01)
- `.planning/milestones/v1-phases/03.6-per-step-shared-ingredients/03.6-01-SUMMARY.md` — T-03.6-02 (row-id lookups)

No external specs beyond the above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/domain/draft.js` — `buildDraftRecord`, `newestDraft`, `draftMatchesVersion`: the pure parts of the drafts-store effects (stay used by the shell).
- `app/src/ui/useBelowDesktop.js` (`useFold`) — an existing hook in `ui/`; `usePenDraft` and `useRecordDraft` sit beside it.
- 8 test files import from `RecipePage.jsx`: `BatchRow.test.jsx`, `RecipePage.{test,folds,a11y,beforeYouStart,drafts,perStep,recordTasting}.test.jsx`.

### Established Patterns
- Domain tests run under Vitest's default `node` environment; a component or hook test opts into jsdom per file (19 files do today).
- Raw typed strings are held in the draft (grams per portion), never `Number()` on keystroke.
- Pen edits are `setPenDraft((prev) => ({ ...prev, ... }))` with a `rows` map keyed by row id and a `method` array keyed by step `n`.

### Integration Points
- `RecipePage.jsx` today: 73 `useState`/`useRef`/`useEffect` calls, pen handlers at lines ~2029-2410, record handlers at ~1517-2030; no `usePenDraft` exists yet.
- `IngredientTable.jsx` reads `penDraft.rows[row.id]` (D-03).

</code_context>

<specifics>
## Specific Ideas

- The split exists so v2's creation UI can reuse the editor: that is why the hooks stop at the draft and the caller saves (D-07).
- "The maker sees no change" is literal, including the one inconsistency in D-05; it is kept, not tidied.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

### Reviewed Todos (not folded)
- Build the Recipe book print format — keyword match only; a new surface, not draft logic.
- Write a product brief for phone-based jobs — design brief, not in this phase.
- Consider a "Mise en Place" auto-generator — new capability, not in this phase.

</deferred>

---

*Phase: 5-Split the recipe page*
*Context gathered: 2026-10-14*
