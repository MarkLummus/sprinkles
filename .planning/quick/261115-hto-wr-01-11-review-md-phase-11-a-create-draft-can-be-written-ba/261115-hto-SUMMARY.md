---
phase: quick-261115-hto
plan: 01
quick_id: 261115-hto
subsystem: store/creation
tags: [wr-01, drafts, two-tabs, repository]
status: complete
key-files:
  modified:
    - app/src/store/repository.js
    - app/src/ui/CreationPage.jsx
    - app/src/store/repository.test.js
    - .planning/phases/11-steps-structure-save-and-print/11-REVIEW-DISPOSITION.md
  created:
    - app/src/ui/CreationPage.twoTabs.test.jsx
    - .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs
actuals:
  tasks: 2
  commits: 3
plan_head_before: 0922e3cbac4c0a62f79c53d0b71972604db3c424
plan_head_after: d69f36f25430d7c9985411939076820deb54c30f
---

# Quick 261115-hto: WR-01 fixed, no ghost create draft after another tab saves

saveDraft refuses a create draft once a version is stored under its id (same transaction as the read), and Save in the stale tab goes to the saved recipe instead of failing.

## BASE and suite counts
- BASE `0922e3cb` (app/ unchanged since planning HEAD 5ad63e63). Step 0 suite: 132 files, 4340 tests, all passing.
- Final suite: 133 files, 4348 tests, 0 failed (+1 file, +8 tests).

## RED then GREEN
RED run (`repository.test.js` + `CreationPage.twoTabs.test.jsx`): exactly 4 failed, each for its stated reason.
- S1: `expected true to be false` (saveDraft wrote on a stored version).
- U1: getDraft returned a `create` record carrying B's text "Typed in B after A saved."
- U2: B's pathname still `/notebook/new` (generic line).
- U3: pathname still `/notebook/new` after the ghost's Save.
S2, both S3 rows, U4 and all four T-11-47 rows (create row reseeded draft-first) passed at base.

GREEN: the two files pass, and the 25-file related suite (788 tests: store, CreationFlow, EditFlow, useKeptDraft, stalePen, NotebookPlace, Shell guards) passes.

## Probe (scratch builds, 1366x1024, two pages in one context)
WebKit and Chrome both launched. `check`: 16 PASS, 0 FAIL.

| Walk | Base build | Fixed build |
|---|---|---|
| W0 control | lands on recipe, "Recipe saved.", no draft, Edit | same |
| W1 typed after | afterType `create`; B stuck at /notebook/new with "Couldn’t save the recipe. Try again."; kind `create`; C acts `Next version, Print sheet` (no Edit); Notebook draft row 1 | afterType null; B on recipe, empty line; kind null; C acts `Next version, Edit, Print sheet`; draft row 0 |
| W2 saved after | B stuck with the generic line; kind null | B on recipe, empty line, empty status, kind null |
| W3 pre-fix ghost | editor opens; Save stuck with the line; kind `create` | editor opens; Save lands on recipe; kind null; Edit shows |

Identical readings in WebKit and Chrome.

## Scope gates
- `git diff --quiet BASE` over db.js, domain, styles, useKeptDraft.js, CreationRoute, NotebookPlace, Shell, EditRoute, CreationFlow.test.jsx: clean.
- CreationPage.jsx adds 0 `export const` lines; only handleSave's catch and its comment changed. repository.js changes only saveDraft.
- Gates: `['drafts', 'versions']` count 0 -> 1; `repository.getVersion` in CreationPage 0 -> 1.
- Changed files vs BASE are exactly the plan's files_modified.

## Commits
- `f6a465dd` test: red tests (S1-S3, U1-U4, T-11-47 create-row reseed)
- `fefd938c` fix: saveDraft guard and saved-elsewhere Save
- `d69f36f2` test: probe and WR-01 disposition set to fixed

## Deviations from Plan

**1. [Probe expectation correction] W2 base check no longer asserts a stored ghost**
- **Found during:** Task 2 first `check`.
- **Issue:** the plan expected base W2 to end with kind `create`. In the built app it is null: with nothing typed in B, the writer holds no pending record, so resumeDraft has nothing to write back. The stuck page and the generic line still reproduce.
- **Fix:** base W2 asserts pathname `/notebook/new` and the generic line only (comment in the probe says why). The fixed-build W2 check (kind null) is unchanged. No product code or test was loosened.
- **Commit:** d69f36f2.

Otherwise: plan executed as written. The pre-commit protected-branch assertion was not applicable: the orchestrator dispatched this sequentially onto main.

## Notes for the orchestrator
- WR-01 reproduced at BASE on every path (store, two jsdom tabs, built app in WebKit and Chrome) and is fixed, tested red then green and walked in WebKit and Chrome.
- The dist build is safe to deploy: no DB_VERSION, stored-shape or migration change.
- Two points for Mark, no new wording built:
  1. A tab whose creation was saved elsewhere lands on the recipe without "Recipe saved." (this press wrote nothing). Adding `saved: 'created'` to that landing state in CreationPage.handleSave would announce it; it is a one-word change.
  2. Words typed in that tab after the other tab saved are not kept. Telling the maker would need a new sentence.
- No device step needed: the WebKit walk is the engine evidence, and two tabs on one recipe is not device-specific.
- Sibling 261115-htp (WR-02): saveDraft's transaction scope is now `const creating = record.kind === 'create'` with a ternary; WR-02's "refuse an edit write when no version has that id" widens that same condition to 'edit'. saveDraft now reads the drafts store through a local `drafts = tx.objectStore('drafts')`.
- Scratch builds are in `${TMPDIR}/sprinkles-hto`; app/dist and port 4173 untouched. Nothing pushed; nothing written to Mark's List. STATE.md and ROADMAP.md not touched; this SUMMARY is uncommitted for the orchestrator.

## Self-Check: PASSED
Files exist (repository.js, CreationPage.jsx, both test files, probe, disposition); commits f6a465dd, fefd938c, d69f36f2 are ancestors of HEAD.
