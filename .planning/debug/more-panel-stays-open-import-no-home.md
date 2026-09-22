---
status: diagnosed
trigger: "fail - when on Notebook tab in iphone width, More menu doesn't close when one of the menu options is clicked; export works (json file is written); import doesn't navigate back to home"
created: 2026-09-22T00:00:00Z
updated: 2026-09-22T00:00:00Z
mode: find_root_cause_only
gap_id: G-03.4-3
bug_class: Bohrbug (deterministic; reproduces on every selection at narrow width)
---

## Current Focus

hypothesis: CONFIRMED — two independent causes, one per half of the report.
  (A) The More `<details>` has no close mechanism of any kind; native `<details>` only
      toggles from its own `<summary>`, and the element is outside the Outlet so its
      `open` attribute also survives NavLink navigation.
  (B) Import never navigates and was never specified to. The real gap is that a
      successful import from a non-Home route produces zero observable change.
test: static read of Shell.jsx/shell.css/router.jsx + plan/summary provenance + a
  3-assertion structural probe (run and removed) + full suite baseline.
expecting: done — diagnosis complete, no fix applied (find_root_cause_only).
next_action: hand back ROOT CAUSE FOUND; half B needs a product decision from Mark
  before any code change, because navigation to Home is not backed by the plan.

reasoning_checkpoint:
  hypothesis: "(A) No code can close the More panel: the details is uncontrolled and native details ignore descendant activation. (B) Import has no navigate call and none was specified; the observable defect is silence, not navigation."
  confirming_evidence:
    - "Shell.jsx:270 renders <details className=\"shell__more\"> with no open prop, no ref, no onToggle; the only state in Shell() is importErrors and storeRevision (144-146)"
    - "grep for onToggle/removeAttribute/.open =/useNavigate/open={ across app/src returns zero hits in Shell.jsx; useNavigate appears only in RecipePage.jsx:2,575"
    - "Probe assertion 1: the details is positioned after </main> on both /notebook and /search -> outside the Outlet, so it reconciles in place across navigation"
    - "03.4-03-PLAN.md:86 decision 8 — More is open/closed 'without any JavaScript'"
    - "03.4-03-PLAN.md:149 + :80 and 03.4-03-SUMMARY.md:169 all say storeRevision exists 'so a route below can reload its own data' / 'so Home reloads' — never 'navigate to Home'; plan adds 'do not reach into any route's state'"
    - "Placeholder.jsx:6 takes only {name} and ignores the Outlet context; RecipeList.jsx:23,38 is the sole storeRevision consumer"
  falsification_test: "(A) would be wrong if any handler or effect set the details' open state to false, or if the details remounted per route (it does not — probe assertions 1 and 3). (B) would be wrong if any plan or summary line stated navigation to Home; grep over the phase directory finds none."
  fix_rationale: "(A) requires adding the dismissal mechanism decision 8 excluded — close on item activation AND on route change. (B) is a decision, not a bug: either navigate (new behaviour) or announce the result where the maker is looking (closer to the plan's intent and also fixes invisible failures)."
  blind_spots: "Not confirmed in a live browser — no browser tool in this agent context. The file-picker-opens step at narrow width is inferred from the user's own report (Export worked; the complaint is about what happened after choosing a file) rather than observed. Whether the import actually wrote to IndexedDB on Mark's device is inferred from handleImportChange having no route-dependent branch, not measured."
  candidate_causes:
    - "code: no close logic on the details; no navigate; no feedback element near the narrow-width controls (Shell.jsx)"
    - "spec/decision: 03.4-03 decision 8's 'without any JavaScript' forecloses dismissal; navigation to Home never specified, and 'Home reloads via storeRevision' is ambiguous"
    - "environment/viewport: both halves are observable only below 759.98px, where .shell__tabs switches from display:none to flex and the controls move away from the header that holds the error channel (shell.css:247-249, 257-334)"
  and_gate: "yes for the severity of both halves. (A) panel-stays-open needs missing close logic AND the narrow-width overlay (at desktop .shell__tabs is display:none, so the defect is unobservable). (B) invisibility needs importing from a non-Home route AND that route not consuming storeRevision AND the narrow width that puts the error channel off-screen in the header. All conditions hold on /notebook at 393px."

## Symptoms

expected: More closes on selection; after Import the app lands on Home with the new data (03.4-03 wired Import to bump `storeRevision` so Home reloads).
actual: On the Notebook route at 393px, the More panel stays open after any option is clicked. Export writes the JSON file. Import does not navigate back to Home.
errors: None reported.
reproduction: Test 3 in .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-UAT.md. Start on /notebook at 393px, open More, tap Import, choose a JSON file.
started: Discovered during 03.4 UAT on 2026-09-22.

## Eliminated

- hypothesis: "The same handlers exist twice (tools row and More) and the duplicate pair fights over one shared file input ref."
  evidence: There is exactly one `<input type="file">` and one `fileInputRef` (Shell.jsx:217-225); Shell.test.jsx:108-110 pins `<details>` count to 1 and the file-input count to 1. Both Import buttons (209 and 289) call the identical `fileInputRef.current?.click()`, and both Export buttons call the identical `handleExport`. Duplication is by design (shell.css:327-331) and causes neither half.
  timestamp: T1

- hypothesis: "The folded tools row hides the file input at narrow width, so the picker never opens and import silently no-ops."
  evidence: shell.css:332-334 hides only `.shell__tools > .shell__place` (the three labelled controls); `.shell__tools` itself keeps `display: flex` and `.shell__file-input` is `display: none` at *every* width (shell.css:96-98), including desktop where Import demonstrably works. The call path is byte-identical at both widths. The user's own report ("export works"; the complaint concerns what happened after choosing a file) indicates the picker opened.
  timestamp: T2

- hypothesis: "Import fails at narrow width and the failure is being misread as 'did not navigate'."
  evidence: `handleImportChange` (171-191) contains no route-dependent or width-dependent branch; `importStore` (transfer.js:466-485) writes through the repository and returns `{ok:true, errors:[]}`. The more likely reading is that the import succeeded and was invisible — see Evidence T5. NOTE: not fully eliminated, because a failure would ALSO be invisible at that width (T6); the two are indistinguishable to the maker, which is itself the finding.
  timestamp: T3

## Evidence

- timestamp: T0
  checked: app/src/ui/Shell.jsx lines 262-302 (the `.shell__tabs` nav and `<details className="shell__more">`)
  found: The `<details>` is uncontrolled — no `open` prop, no `ref`, no `onToggle`, no `onClick` on the `<ul>` or on any of the five items. The only React state in `Shell()` is `importErrors` and `storeRevision` (144-146). No code path in the file can set the open state to false.
  implication: Nothing was ever written to close the More panel. Defect (A) is an omission, not a broken mechanism.

- timestamp: T1
  checked: app/src/ui/Shell.jsx `handleImportChange` (171-191) and the import list at line 2
  found: On success it calls only `setImportErrors([])` and `setStoreRevision((r) => r + 1)`. Line 2 imports only `NavLink` and `Outlet` from react-router — `useNavigate` is absent. A repo-wide grep finds `useNavigate` only in RecipePage.jsx (lines 2, 575).
  implication: Import can never navigate. Whether that is a defect depends entirely on provenance — see T4.

- timestamp: T2
  checked: `grep -rn "onToggle|removeAttribute|\.open =|useNavigate|open={" app/src --include='*.jsx' --include='*.js'` (excluding tests)
  found: Hits are all in History.jsx / VersionRow.jsx / BatchRow.jsx / IngredientTable.jsx / Method.jsx / RecipePage.jsx. `History.jsx`'s `HistoryDisclosure` is a *button*-based disclosure with `aria-expanded` and an `onToggle` prop — a different component with a working dismissal pattern already in the codebase. Shell.jsx has none of it.
  implication: The codebase already contains a controlled-disclosure precedent the More panel does not follow.

- timestamp: T3
  checked: .planning/phases/03.4-.../03.4-03-PLAN.md line 86 (decision 8)
  found: "**More is a `<details>` disclosure.** It is keyboard-operable and open/closed without any JavaScript; the alternative is a hand-rolled menu with focus management this phase does not need."
  implication: ROOT CAUSE (A) is the unintended consequence of a recorded decision. The decision reasoned about *opening* (keyboard operability, focus management) and never about *dismissal*. Per the HTML spec a `<details>` toggles only via its own `<summary>`'s activation behaviour; activating a descendant leaves `open` untouched. So "without any JavaScript" necessarily means "never closes on selection".

- timestamp: T4
  checked: provenance of "Home reloads via storeRevision" across the phase directory
  found: 03.4-03-PLAN.md:149 — "increment a `storeRevision` counter ... and pass it down as the Outlet's context value, **so a route below can reload its own data**; do not reload the page and **do not reach into any route's state**." 03.4-03-PLAN.md:80 (decision 2) — "hands routes below it a store-revision counter through the Outlet context **so Home reloads after a successful import** without a page reload." 03.4-03-SUMMARY.md:169 — "`RecipeList.jsx` now reads it via `useOutletContext()` and adds it to its data-loading effect's dependency array, **so Home reloads without a page reload**." No line in any plan, summary, VERIFICATION or REVIEW file specifies navigation to Home.
  implication: "Home reloads via `storeRevision`" means *when Home is the mounted route, it re-reads its data*. G-03.4-3's truth ("a completed import from a non-Home route returns to Home") and 03.4-UAT.md:29 are an over-reading authored at UAT time, not a restatement of the plan. The plan's "do not reach into any route's state" points away from the Shell driving routes. Half (B) is therefore MISSING BEHAVIOUR NEVER SPECIFIED, not a regression.

- timestamp: T5
  checked: app/src/router.jsx:94 and app/src/ui/Placeholder.jsx:6-12 against app/src/ui/RecipeList.jsx:23,38
  found: `/notebook` renders `<Placeholder name="Notebook" />`; `Placeholder` takes only `name` and never calls `useOutletContext()`. `RecipeList` (path `/`) is the sole consumer: `const storeRevision = useOutletContext()` (23) inside a load effect with `}, [storeRevision])` (38).
  implication: The REAL defect inside half (B): a successful import from /notebook writes to IndexedDB and bumps `storeRevision`, but produces zero observable change — the same placeholder sentence, with the More panel still open on top of it. The maker cannot distinguish "import succeeded" from "import did nothing".

- timestamp: T6
  checked: the import-feedback channel's position — Shell.jsx:226-232 vs shell.css:100-106 and 327-334
  found: `.shell__import-errors` renders inside `.shell__tools`, inside `<header className="shell__head">` — the top of the document. It carries no `role="status"` and no `aria-live`. shell.css:327-331 justifies keeping `.shell__tools` in the layout at narrow width precisely because "hiding the row would leave an import failure with nothing to report itself through."
  implication: At 393px the maker is looking at the More panel pinned above the bottom bar while the only feedback channel sits off-screen at the top, unannounced and unscrolled-to. A *failed* import is as invisible as a successful one. The stylesheet's stated mitigation does not hold at the width it was written for.

- timestamp: T7
  checked: structural probe (3 assertions) written to the scratchpad, copied into app/src/ui/__probe.test.jsx, run, then removed; tree confirmed clean
  found: All 3 pass. (1) `<details class="shell__more">` is positioned after `</main>` on both /notebook and /search — outside the Outlet. (2) It renders with no `open` attribute and no `aria-expanded`; it holds exactly 2 `<button>` and 3 `<a>`. (3) `</div><nav class="shell__tabs"` — the nav is an immediate sibling of `.shell__body`.
  implication: Proves the navigation half of (A): because the `<details>` is outside the Outlet and at a stable position, a NavLink route change reconciles it in place rather than remounting it, and React never writes `open` (it is not passed as a prop) — so the panel is still open on the destination route. Ingredients / Kitchen / Search navigate *and* leave the panel up.

- timestamp: T8
  checked: `npm --prefix app test` on the current tree, and Shell.test.jsx's harness header (lines 1-14)
  found: 41 files / 1119 tests, all passing. Shell.test.jsx uses `renderToStaticMarkup` (react-dom/server) in vitest's **node** environment with `MemoryRouter`. app/package.json declares no jsdom, happy-dom or testing-library dependency. 03.4-03-SUMMARY.md:109 states the click-through was deferred: "the actual file-picker flow ... cannot be exercised by renderToStaticMarkup ... a real import/export click-through is deferred to end-of-phase UAT."
  implication: WHY NOT CAUGHT — no existing gate could have caught either half. The shell suite cannot click, toggle a `<details>`, navigate, or run an effect. 1119 green tests coexist with both defects. The missing gate is any DOM-level interaction test for the shell.
  note: node/npm were not on PATH (`command not found: npm`); ran with /Users/mark/.nvm/versions/node/v25.9.0/bin prepended — the known Homebrew-symlink drift.

## Resolution

root_cause: |
  (A) More panel never closes — DEFECT against the UAT truth.
  app/src/ui/Shell.jsx:270 renders More as an uncontrolled native `<details>`. No open-state
  code exists anywhere in the file. Per the HTML spec a `<details>` toggles only via its own
  `<summary>`'s activation behaviour, so activating any of the five items inside leaves `open`
  set. For Import/Export (buttons, 289/295) there is no navigation to mask it. For
  Ingredients/Kitchen/Search (NavLinks) the route changes but the `<details>` is outside the
  Outlet at a stable position (probe T7), so React reconciles it in place and never writes
  `open` — the panel is still up on the destination route. This is the direct consequence of
  03.4-03-PLAN.md:86 decision 8, "open/closed without any JavaScript", which reasoned about
  opening and never about dismissal. Observable only below 759.98px, where `.shell__tabs`
  switches from `display:none` to `flex` (shell.css:247-249, 262).

  (B) Import does not go to Home — MISSING BEHAVIOUR NEVER SPECIFIED, wrapping a real defect.
  Navigation was never in scope: `useNavigate` is not imported in Shell.jsx, and no plan,
  summary or verification line asks for it. 03.4-03-PLAN.md:149 and :80 and
  03.4-03-SUMMARY.md:169 all define `storeRevision` as the means for "a route below to reload
  its own data" / "so Home reloads", and the plan explicitly adds "do not reach into any
  route's state". G-03.4-3's truth and 03.4-UAT.md:29 over-read "Home reloads" as "the app
  goes to Home". The genuine defect the report surfaced is SILENCE, not missing navigation:
  /notebook renders `Placeholder`, which ignores the Outlet context (Placeholder.jsx:6;
  router.jsx:94), and `RecipeList` is the only `storeRevision` consumer
  (RecipeList.jsx:23,38) — so a successful import from a non-Home route changes nothing on
  screen, and a failed one is equally invisible because `.shell__import-errors` sits in the
  header at the top of the document with no `aria-live` (Shell.jsx:226-232), off-screen at the
  very width the controls moved to the bottom bar (shell.css:100-106, 327-334).
fix: not applied — find_root_cause_only
verification: not applicable — no fix applied
files_changed: []
why_not_caught: |
  No gate existed for this class. The whole shell suite is `renderToStaticMarkup` in vitest's
  node environment (Shell.test.jsx:1-14) — it cannot click, toggle a `<details>`, navigate or
  run an effect; app/package.json carries no jsdom/happy-dom/testing-library. 1119 tests in 41
  files pass on the defective tree. 03.4-03-SUMMARY.md:109 recorded the click-through as
  deferred to UAT, which is exactly where both halves surfaced.
