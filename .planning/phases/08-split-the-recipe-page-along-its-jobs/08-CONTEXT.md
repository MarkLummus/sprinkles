# Phase 8: Split the recipe page along its jobs - Context

**Gathered:** 2026-10-17
**Status:** Ready for planning

<domain>
## Phase Boundary

`RecipePage.jsx` (about 1,837 lines, one component) is cut along six jobs so the creation editor in Phase 10 can mount the same Sheet and pen modules that editing uses, and the maker sees no change. The six jobs are the announcer, record loading, the sheet view, the version pen, kept drafts and route intents (EDIT-05). The recorded WebKit walk of 94 snapshots still matches, and the shell test asserts the new modules positively (EDIT-06). No screen changes, so no design gate and no UI-SPEC.

</domain>

<decisions>
## Implementation Decisions

### Scope of the split
- **D-01:** The six jobs named in EDIT-05 are the required cuts. The record-pen and tasting handlers (about 400 lines, roughly lines 933 to 1330 of today's file, `useBatchRecording` in the research) are NOT required. They are extracted last, as a bonus, only if the six required cuts are done and the walk matches; otherwise they stay in the page and the phase still meets EDIT-05. Creation never touches the batch side. (Mark, 2026-10-17)
- **D-02:** Because the batch handlers may stay, the page after this phase is the route shell plus the batch side, not a bare shell. Success criterion 1 ("route shell only") is read as: the six named jobs each live in a module of their own; the shell test pins that and does not require the batch handlers to have moved.

### Order of the cuts and the stop rule
- **D-03:** Cut in the research's order: `useAnnouncer`, then `useRecipeData` (record loading, the eight load effects, about 180 lines), then the pure `sheetView.js`, then the `RecipeSheet` component, then `useVersionPen`, then `useKeptDraft`, then `useRouteIntents`, then (bonus) `useBatchRecording`. Record loading moves second, so it is settled before the kept-draft restore that waits on `loadFailed`. (Mark, 2026-10-17)
- **D-04:** Each cut is its own commit and lands green (every existing test and the shell test passing) or is reverted and retried, in a follow-up plan if needed. The phase stays open until every one of the six required cuts has landed: Phase 8 is not done, and Phase 9 does not execute, until then, so EDIT-05 holds as written. The kept-draft cut is the likeliest to need a second attempt. The optional record-pen cut (D-01) is not affected and may stay in the page. (Mark, 2026-10-17, `decide-phase8-stop-rule`, replacing the earlier "drop a cut that cannot be made green")

### Sequencing with Phase 9
- **D-05:** Phase 8 executes and merges before Phase 9 executes. The walk baseline stays valid (Phase 9's reset rewrites the seeded versions the walk dumps), and Phase 9's `create` draft kind builds on the finished kept-draft hook. Phase 9's planning, and Sid's two place boards, may proceed meanwhile. (Mark, 2026-10-17)

### Proof of no change
- **D-06:** The walk cannot run from its archived location as it stands (Codex review, verified): `05-walk.mjs` imports its harness from `../../milestones/v1-phases/...`, which resolves to a path that does not exist, its repo root resolves to `.planning/` so the default build directory is `.planning/app/dist`, and its Playwright import points into an npx cache. The plan's first task repairs those paths (copying the walk into this phase's directory is fine) and proves it runs. Then, before any code moves, run the walk (`.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs`) at this phase's base commit and compare it with the old baseline `05-walk-before.json`. If it does not match, record a new before-walk at that base commit (as Phase 5 plan 01 did) and compare the finished split against it. The old baseline predates Phases 6 and 7 and later quick tasks. (Mark, 2026-10-17)
- **D-07:** No iPad device check for this phase: the WebKit walk and the tests are the evidence, and the iPad is checked once, in Phase 12, for the whole loop. No device row is added to Mark's List for Phase 8. (Mark, 2026-10-17)

### Wiring and contracts the plan must settle
- **D-08:** The version pen and the kept drafts depend on each other. Version save and cancel call `discardDraft` (`RecipePage.jsx` about 1362-1368, 1497-1504, 1537-1543) and the record save and cancel need it too (about 1260-1320), while the draft restore resets the version pen's state, locks and timestamps (about 533-539). The plan states which hook owns what and how the callbacks are wired, so the hooks do not need each other to initialise, with every hook above the early returns and the callbacks safe while records are still loading.
- **D-09:** What Phase 8 delivers for Phase 10: the pure `sheetView` accepts `baseline = null`, and `RecipeSheet` renders with no stored version and no baseline (diff props nullable, no band, no batch aside). Phase 8 adds a node test for `sheetView` with a null baseline and a component test that mounts `RecipeSheet` without a stored version. Phase 10's new controls and its `creating` mode are not part of this phase.
- **D-10:** StrictMode: the restore-once effect (about 450-457) keeps its started-ref behaviour and gets no conventional cancellation cleanup, which would suppress the only permitted restore read. The plan adds a focused test that mounts the page under `React.StrictMode` and proves the draft is restored once, because the current draft tests have no StrictMode wrapper and the walk runs the built app.

### Claude's Discretion
- The names and homes of the new modules, within the existing patterns (hooks beside `usePenDraft.js` and `useRecordDraft.js` under `app/src/ui/`, pure functions under `app/src/domain/` or `ui/sheetView.js` as the research proposes).
- The exact props of `RecipeSheet` (the research: the derived view, the mode, handlers and diff props, all nullable; it does not include the band or the batch aside).
- What the rewritten shell test asserts beyond naming each module and checking that the shell imports it and the job lives there.

### Fixed by earlier decisions (carry forward)
- Existing tests change only their imports; none is deleted or weakened (ROADMAP Phase 8 criterion 4).
- The pen's state is pure operations in `domain/` behind a hook (Phase 5, `decide-pen-state-approach`, already shipped).
- Hook-order law: every hook sits above the early returns. A hook that moves behind a guard breaks on first load (`research/ARCHITECTURE.md`).
- The kept-draft restore is order-sensitive: it waits on version, batches and `loadFailed`, and the amend-redirect branch deliberately leaves `draftRestoreDone` false so the next page instance owns the draft. Extract it with its callbacks (`onRestorePlan`, `onRestoreRecord`) passed in.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` Phase 8 (goal, success criteria, Notes) and "Before planning" - the gates and decisions.
- `.planning/REQUIREMENTS.md` EDIT-05, EDIT-06 - the testable criteria.

### How to cut
- `.planning/research/ARCHITECTURE.md` "Recommended cuts (extraction targets)" and the pitfalls near line 330 (hook-order law, the order-sensitive restore, ids minted in effects) - the cut order and the risks.
- `.planning/research/SUMMARY.md` "Architecture Approach" - the 11 jobs and the components.
- `.planning/research/PITFALLS.md` - read for the split's traps.

### Proof
- `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs`, `05-walk-before.json`, `05-walk-after.json` - the 94-snapshot WebKit walk and its baseline.
- `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-CONTEXT.md`, `05-VERIFICATION.md` - how Phase 5 did the same kind of cut.
- `app/src/ui/RecipePage.shell.test.js` - the shell test to rewrite with positive assertions.
- `.planning/notes/2026-10-01-engineering-notes.md` - device and Vite process rules.

### Conventions
- `.claude/CLAUDE.md` Conventions: domain modules framework-free; all store access through `app/src/store/repository.js`; every visual value reads a token; every link has `tabIndex={0}` and every button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` (enforced by `ui/tabindex-scan.test.js`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/ui/usePenDraft.js`, `app/src/ui/useRecordDraft.js` and `app/src/domain/penDraft.js`, `recordDraft.js`, `draft.js`: the pen and record state already live behind hooks and pure functions; the split follows the same discipline.
- `app/src/ui/useBelowDesktop.js` (`useFold`, `useSheetTwoColumns`): fold and media state already extracted.

### Established Patterns
- Eight `RecipePage.*.test.jsx` files mount the page and are the no-visible-change net (`RecipePage.test.jsx` itself does not render the page); they stay as they are except for imports.
- `RecipePage` today: 16 `useEffect`s (eight repository-load effects, a title effect, three draft effects, two route-intent effects, Escape and the Import guard), about 37 `handle*` functions, `announce` at about line 886, record-pen handlers about 933-1330, version-pen handlers about 1334-1560, kept-draft restore and persist about 463-700.

### Integration Points
- Phase 10's creation editor mounts `RecipeSheet` in a `creating` mode with no baseline, and reuses `useAnnouncer` and the kept-draft hook with a `create` kind.
- Phase 9 (after this phase) adds a `create` draft kind that the kept-draft hook must accept.

</code_context>

<specifics>
## Specific Ideas

No specific requirements - the behaviour is "the maker sees no change", proven by the walk.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

### Reviewed Todos (not folded)
- "Build the Recipe book print format", "Write a product brief for phone-based jobs", "Consider a Mise en Place auto-generator": matched on keywords only; none concerns splitting the page.
- `todo-split-recipepage` on Mark's List is this phase's own work; it closes when the phase is done.

</deferred>

---

*Phase: 8-Split the recipe page along its jobs*
*Context gathered: 2026-10-17*
