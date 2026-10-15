# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1 — Develop the next olive oil recipe

**Shipped:** 2026-10-13
**Phases:** 14 (Phases 1 to 4 and ten inserted phases) | **Plans:** 120 | **Sessions:** not counted

### What Was Built
- The churned olive oil recipe readable in the app with its balance figures, the 2 Aug batch recorded as what actually happened, and a version 2 developed against it without disturbing the first.
- A printed bench sheet with blank batch and tasting logs, a short code that finds the same version again, and drafts that survive a closed tab.
- A design layer in code (the App and Sheet token sets, the hand), recipe and Sheet separated in the store, per-step shared ingredients, and "Before you start" as its own Sheet section.
- 23 of 23 requirements satisfied; 2,536 tests passing at close.

### What Worked
- Framework-free domain modules and the repository seam: structure changes (portions, the recipe and Sheet split, drafts) landed without domain rewrites, and the domain suite stayed provable under the node environment.
- Mark's List as the single place for human checks, decisions and bugs, with one device check at a time on the iPad.
- Measuring the real app in WebKit and Chromium before trusting CSS reasoning.

### What Was Inefficient
- The roadmap stopped forecasting: four planned phases became fourteen through insertions, and Phase 03.5 alone took 31 plans.
- Review dispositions and verification reports went stale. At close, 12 phase verifications were stale, and 03.6's review disposition still listed four findings as open that quick tasks had fixed the same week. The audit nearly carried them as debt.
- 33 debug session files were never closed, so the close audit raised 41 open items that were mostly history.
- `RecipePage.jsx` grew to 2,683 lines holding two workflows.

### Patterns Established
- Domain math in framework-free modules; every store access through the repository seam.
- Sketch HTML as the structural authority; conformance is measured side by side in a browser, never argued from prose.
- Decisions as radio-button rows on Mark's List; device checks walked in WebKit before they are handed over.

### Key Lessons
1. Check the code before treating a review disposition as open work. The file can be older than the fix.
2. Close a debug session or a quick task when its fix lands; otherwise every milestone close re-reads them.
3. Refactor the shared editor before building the feature that needs two uses of it (creation and editing).
4. Say "reset on a version bump" and when it ends in plain words; here it ends when a recipe can be created from scratch, not when a milestone closes.

### Cost Observations
- Model mix: not measured
- Sessions: not counted
- Notable: the close audit's largest cost was re-establishing which open items were real.

## Milestone: v1.1 — Groundwork for creation

**Shipped:** 2026-10-15
**Phases:** 3 (Phases 5 to 7) | **Plans:** 12 | **Sessions:** not counted

### What Was Built
- `RecipePage`'s draft logic as pure `domain/` operations behind `usePenDraft` and `useRecordDraft`, proved against a 94-snapshot WebKit walk recorded before any code moved.
- The ingredient library as an IndexedDB store (database version 9) behind the repository seam, seeded, exported and imported with the other stores in one transaction.
- `createRecipe`, `nextStepKey` and `rowFromLibraryRecord`: framework-free, tested under node, called by no screen yet.
- 10 of 10 requirements satisfied; 2,932 tests passing at close.

### What Worked
- Recording a before-walk of the built app first, then comparing after: "the maker sees no change" became a MATCH instead of a claim.
- Small phases with one audit trail each: the milestone took two days from the first walk to the last verification.
- The integration checker confirmed the cross-phase seams (record shape, step-key rules, import check) without finding a broken path.

### What Was Inefficient
- Phase 6's verification went stale again: a Phase 7 quick task changed `store/transfer.js`, which Phase 6 covers, and the close ran as override_closeout for it.
- `RecipePage.jsx` is still 1,837 lines. The draft logic left, but the loading effects and the regions stayed.
- Two quick-task summaries had frontmatter that was not valid YAML, which blocked the close-out acknowledge until quoted.

### Patterns Established
- A source test pins a shell's shape (no draft setter, resets written once, domain modules pure) so a split cannot drift back.
- A phase's primitives land behind tests before any screen calls them; the unused-export list is expected debt, not an orphan.

### Key Lessons
1. A quick task that edits a finished phase's covered files should re-run that phase's verifier, or the close pays for it.
2. Quote flow-sequence and colon-bearing frontmatter values when writing summaries; the close tooling refuses to parse them.
3. Wait for the second consumer before the next split: extract the loader hook when v2 creation needs a page with no loaded version.

### Cost Observations
- Model mix: not measured
- Sessions: not counted
- Notable: the close audit surfaced 6 open items, all history or v2 material.

## Cross-Milestone Trends

| Milestone | Phases | Plans | Inserted phases | Stale verifications at close |
|-----------|--------|-------|-----------------|------------------------------|
| v1 | 14 | 120 | 10 | 12 |
| v1.1 | 3 | 12 | 0 | 1 |
