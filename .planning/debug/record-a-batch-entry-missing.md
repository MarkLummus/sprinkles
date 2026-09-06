---
status: diagnosed
trigger: "G-02-1 record-a-batch-entry-missing — From the churned recipe page (/recipe/olive-oil-ice-cream-v1), once a batch already exists against the version (the seeded 2 Aug batch is always present after seeding), there is no visible way to start recording a new batch. The margin shows the existing batch with an \"Amend\" button but no \"Record a batch\" control."
created: 2026-09-06T23:30:00Z
updated: 2026-09-06T23:45:00Z
---

## Current Focus

hypothesis: CONFIRMED — the `Record a batch` control is bound exclusively to `BatchMargin`'s empty-state branch (`openBatch === null`), and `seedIfEmpty` guarantees the working-case version always has one batch, so that branch is unreachable on any real store.
test: Rendered `BatchMargin` through `react-dom/server` twice — once with `openBatch={null}`, once with `openBatch={augustSecondBatch}` — and searched the markup for the string "Record a batch".
expecting: Present in the null case, absent in the open-batch case. Both held.
next_action: Return diagnosis (goal: find_root_cause_only). No fix applied.

bug_class: Bohrbug — fully deterministic; reproduces on every load of the seeded store.

rca_branching:
  candidate_causes:
    - "code — BatchMargin.jsx renders the Record a batch button only in the final `return` reached when openBatch is falsy (CONFIRMED, necessary condition A)"
    - "data — store/seed.js unconditionally writes augustSecondBatch, so the olive oil version never has zero batches on a fresh store (CONFIRMED, necessary condition B)"
    - "config/routing — router.jsx has no route naming a recording state and RecipePage derives `mode` from the margin's control only (D-19), so no URL escape hatch exists (CONFIRMED, contributing condition C: removes the workaround)"
    - "environment — ruled out; nothing environment-specific, the branch is static JSX"
  and_gate: "YES. Condition A alone would only fail Test 8's second-batch step (a version that started empty could still record its first batch). Condition B alone is harmless. Both together make the pen layer unreachable for a NEW batch in every state a maker can actually reach — which is why Test 1's tracer was also reported as blocked, not just Test 8. Condition C is why no workaround exists."

plan_provenance: "Plan-level gap, not a deviation. 02-01-PLAN.md:237 enumerates exactly three margin states and gives `Record a batch` to the 'No batch yet, reading' state only. 02-03-PLAN.md:316 adds the batch list and closes with 'With one batch there is no list; with none, the line and the control 02-01 already built stand alone' — it never assigns a second-batch entry point a home. The implementation matches both plans literally. The requirement exists only in the plans' own verification prose (02-03-PLAN.md:348 'Record a second batch dated later') and in the surface brief's material states (route-recipe-batch.md:93 'a version with two batches'; :54 describes 'Record a batch' unconditionally as 'a control in the margin')."

## Symptoms
<!-- Prefilled from UAT — IMMUTABLE -->

expected: The maker can start recording a new batch from the churned recipe, including when a batch already exists against the version ("Record a batch" control visible). Test 8 of the UAT also expects "Record a second, later-dated batch: it appears in the margin's batch list, the version line moves to the newer churn date, and the older batch is unchanged when reopened by its own URL."
actual: User reported "I don't see anything on the list page or the recipe page that says anything close to 'Record a Batch'. What I see is the recorded batch." Second-batch step of Test 8 blocked for the same reason.
errors: None reported
reproduction: Test 1 and Test 8 in .planning/phases/02-record-the-first-batch/02-UAT.md. Start dev server (npm --prefix app run dev), open http://localhost:5173/recipe/olive-oil-ice-cream-v1 with the seeded store present.
started: Discovered during Phase 02 UAT, 2026-09-06

## Eliminated

- hypothesis: "The control renders but is visually hidden or unstyled (a CSS problem)"
  evidence: A server-side render of BatchMargin with an open batch produces exactly two buttons — `Amend` and `Add a tasting`. The string "Record a batch" is not in the markup at all. Nothing is hidden; nothing is rendered.
  timestamp: 2026-09-06T23:42:00Z

- hypothesis: "The list page (/) is the intended entry point and it regressed"
  evidence: app/src/ui/RecipeList.jsx renders only Export, Import, and one link per version. It has never carried a batch control, and no plan or brief assigns one there — route-recipe-batch.md:54 places the control in the recipe page's margin.
  timestamp: 2026-09-06T23:40:00Z

- hypothesis: "The implementation deviated from the plan"
  evidence: 02-01-PLAN.md:237 and 02-03-PLAN.md:316 both scope the control to the no-batch state. BatchMargin.jsx matches the plans exactly. This is a gap in the plans' design sections, not a coding mistake against them.
  timestamp: 2026-09-06T23:44:00Z

## Evidence

- timestamp: 2026-09-06T23:30:00Z
  checked: .planning/debug/knowledge-base.md
  found: No knowledge base exists yet (first debug session in this project)
  implication: No prior-pattern shortcut available; investigated from first principles.

- timestamp: 2026-09-06T23:33:00Z
  checked: app/src/ui/BatchMargin.jsx, whole file
  found: Three exclusive render branches. (1) `mode === 'recording'` → the churn form + Save batch, returns at line 236. (2) `if (openBatch)` → the reading state, returns at line 313, containing exactly two controls, `Amend` (line 274) and `Add a tasting` (line 308). (3) the final fallthrough `return` at line 316, the only place `onStartRecording` is called and the only place the words "Record a batch" appear (line 321).
  implication: `onStartRecording` is reachable only when `openBatch` is falsy. Branch (2) has no path back to the pen layer for a NEW batch.

- timestamp: 2026-09-06T23:35:00Z
  checked: app/src/ui/RecipePage.jsx lines 121-129
  found: "let openBatch = null; if (batchId) { openBatch = batches.find(...) ?? null } else if (batches.length > 0) { openBatch = sortedBatches(batches)[0] }" — with no batchId in the URL, the most recent batch is opened automatically whenever the version has any batch.
  implication: On /recipe/:id, `openBatch` is non-null for any version with ≥1 batch, so BatchMargin's branch (3) is unreachable there. On /recipe/:id/batch/:batchId it is non-null by construction. Branch (3) is reachable only when the version has zero batches — or, accidentally, when the URL names a batch id that does not exist (openBatch stays null while batches.length > 0), in which case the margin wrongly reads "No batch recorded against this version yet."

- timestamp: 2026-09-06T23:36:00Z
  checked: app/src/store/seed.js and app/src/main.jsx
  found: seedIfEmpty returns early only when versions already exist; otherwise it writes BOTH oliveOilVersion AND augustSecondBatch (line 13). main.jsx awaits it before mounting.
  implication: A freshly seeded store — the state every UAT test starts from, including after "clear site data" — always has one batch against the olive oil version. The zero-batch state that owns the only `Record a batch` control cannot occur for the working case.

- timestamp: 2026-09-06T23:37:00Z
  checked: app/src/router.jsx and RecipePage's `mode` state (lines 65, 131-144)
  found: Three routes only — `/`, `/recipe/:id`, `/recipe/:id/batch/:batchId`. `mode` is local component state set exclusively by `handleStartRecording` / `handleStartAmending`; a comment at line 63 records "mode is never derived from the URL (D-19)", and 02-01-PLAN.md's acceptance criteria require "there is no route whose path names a recording state".
  implication: No URL, deep link, or keyboard path can open the pen layer for a new batch. The single dead control is the only door, so there is no workaround for the maker.

- timestamp: 2026-09-06T23:38:00Z
  checked: app/src/ui/RecipeList.jsx
  found: Renders Export, Import, an error list, and one `<Link to={/recipe/:id}>` per version. No batch-related control of any kind.
  implication: Confirms the user's "nothing on the list page" half of the report; the list page is not and was never the entry point.

- timestamp: 2026-09-06T23:42:00Z
  checked: Empirical probe — rendered BatchMargin via react-dom/server twice (temp test file, since deleted; working tree clean)
  found: "no-batch contains Record a batch: true" / "one-batch contains Record a batch: false" / "one-batch buttons: [ 'Amend', 'Add a tasting' ]" — using the real augustSecondBatch and oliveOilVersion fixtures.
  implication: Hypothesis confirmed by direct observation, not inference. The falsification test (the control appearing in the open-batch render) did not occur.

- timestamp: 2026-09-06T23:44:00Z
  checked: 02-01-PLAN.md:237-239, 02-03-PLAN.md:316, 02-03-PLAN.md:348, .impeccable/surfaces/route-recipe-batch.md:54,56,70,93
  found: 02-01 fixes three margin states and gives the control to "No batch yet, reading" alone. 02-03's margin section adds the batch list and ends "With one batch there is no list; with none, the line and the control 02-01 already built stand alone" — no second-batch entry point is designed anywhere. But 02-03's own human-check demands "Record a second batch dated later", and the brief lists "a version with two batches" among the material states while describing "Record a batch" unconditionally as "a control in the margin".
  implication: The requirement was carried only in verification prose and in the brief's state list; it was never turned into a design instruction. The build satisfied every design instruction it was given.

- timestamp: 2026-09-06T23:45:00Z
  checked: All test files under app/src, and the deferral records in 02-03-SUMMARY.md:116 / 02-VERIFICATION.md
  found: Seven test files — data, domain (batch, figures, axes, composition), store (transfer, seed). Zero component/UI tests; vitest.config.js defaults to environment 'node'. 02-03 Task 3's human-check (the one containing "Record a second batch dated later") was explicitly deferred to end-of-phase UAT because the user was away from the computer.
  implication: The only gate that could have caught this was the deferred human-check. No automated gate could have — a missing JSX branch in an untested component is invisible to the domain/store suites, to `npm run build`, and to every grep-based acceptance check the plans wrote.

## Resolution

root_cause: "Two conditions together (AND-gate). (A) app/src/ui/BatchMargin.jsx renders the `Record a batch` control — the sole caller of `onStartRecording` — only in its final fallthrough branch, reached when `openBatch` is falsy; the `if (openBatch)` reading-state branch offers `Amend` and `Add a tasting` and no way to begin a new batch. (B) app/src/store/seed.js unconditionally writes `augustSecondBatch` alongside the version, and RecipePage auto-opens `sortedBatches(batches)[0]` when the URL names no batch, so the olive oil version always has an open batch and the branch carrying the control is unreachable. Upstream of both: this is a plan-level gap, not a coding deviation — 02-01-PLAN.md:237 scopes the control to the 'No batch yet' state and 02-03-PLAN.md:316 adds the batch list without adding a record-another-batch entry point, even though 02-03's own human-check and the surface brief's material states both require a second batch to be recordable. A third condition (C) explains why no workaround exists: D-19 keeps `mode` out of the URL and the router has no recording route, so the dead control is the only door."
fix: "(not applied — goal: find_root_cause_only)"
verification: "(n/a)"
files_changed: []
