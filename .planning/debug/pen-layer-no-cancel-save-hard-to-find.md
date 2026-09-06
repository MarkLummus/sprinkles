---
status: diagnosed
trigger: "G-02-4 pen-layer-no-cancel-save-hard-to-find — when Amending, no cancel button is visible and Save batch button is hard to find."
created: 2026-09-06T23:30:00Z
updated: 2026-09-06T23:55:00Z
---

## Current Focus

hypothesis: CONFIRMED (two independent causes, one per sub-question)
  (1) Cancel: never designed. Absent from the surface brief's In list, absent from its
      Out-and-named list, absent from 02-CONTEXT decisions, absent from all three plans,
      absent from code. D-24's beforeunload leave-warning covers *document unload*, not
      an in-app abandon path — the two were conflated.
  (2) Save batch hard to find: AND of two conditions — (a) a dangling style reference
      ("the binder's button style") the direction contract never defined, so no token and
      no CSS rule exists and the button renders as bare UA chrome; (b) position at the
      bottom of the page's longest column, ~1400px down, below the six graduated rules,
      the basis note, and seven stacked fields.
test: read BatchMargin.jsx / RecipePage.jsx / app.css / tokens.css, the three 02-*-PLAN.md,
  02-CONTEXT.md, 02-DISCUSSION-LOG.md, and .impeccable/surfaces/route-recipe-batch.md +
  route-recipe.md; grep every cancel/abandon/discard token and every button selector.
expecting: resolved — see Resolution
next_action: return diagnosis to caller (goal: find_root_cause_only — no fix applied)

reasoning_checkpoint:
  hypothesis: "Two causes. (1) No cancel control exists because none was ever specified: the brief names 'Leaving with unsaved ink: the browser's own leave warning; no invented dialog' (§6) and the Phase 2 discussion's only related choice was 'Leave warning only' vs 'Persist the draft now' — both about page-unload loss, neither about an intentional in-app abandon. (2) Save batch is hard to find because the brief's 'binder's button style' is a dangling reference the direction contract never defined, so tokens.css has no button token and app.css has no button rule beyond `margin-top`, AND the button sits at the foot of the side column beneath the six graduated rules, the basis note, and seven fields."
  confirming_evidence:
    - "grep -rniE 'cancel|discard|abandon' app/src/ returns only useEffect cleanup flags (RecipePage.jsx:78,88; RecipeList.jsx:15) — no handler, no control."
    - "setMode('reading') occurs at exactly two sites, RecipePage.jsx:249 and :260, both inside repository.saveBatch(...).then() — recording mode has no non-saving exit."
    - "BatchMargin.jsx:155-237 (mode === 'recording') returns early and renders exactly one control: <button>Save batch</button> at line 232."
    - "No <Link>, <a>, or <nav> renders anywhere on the page while recording — IngredientTable/Method/Authored/FormulationNote/BasisNote contain none, and BatchMargin's batch-list Links are inside the openBatch branch, which recording mode never reaches. The page is a dead end."
    - "route-recipe-batch.md:70 (In) lists 'save' and never lists cancel/abandon; :72 (Out, and named) lists eight exclusions and never names cancel — so it was neither included nor deliberately excluded."
    - "route-recipe-batch.md:102 says 'Leaving with unsaved ink: the browser's own leave warning; no invented dialog'; :93 material states list 'leaving the page with an unsaved record'. Both are unload events, not an abandon control."
    - "02-DISCUSSION-LOG.md:209-212 — the only decision in this area was 'Leave warning only | beforeunload; draft persistence in Phase 4' vs 'Persist the draft now'. Cancel was never on the table."
    - "'the binder's button style' appears exactly twice project-wide: route-recipe-batch.md:54 and 02-01-PLAN.md:237 (copied forward). route-recipe.md's Direction contract items 1-7 are Type, Colour, Spacing, Rule drawing, Focus treatment, Block names, Open decisions — no button/control item exists."
    - "tokens.css header states 'Every value here is decided there; nothing here decides anything new' — with no button decision in the contract, no button token exists (grep 'button' in tokens.css: no match)."
    - "grep 'button' app/src/styles/*.css: the only rule is app.css:442 `.batch-margin button { margin-top: var(--gap-s); }` — spacing only. Every button in the app is bare UA chrome."
    - "That one descendant selector applies identically to Save batch, Amend, Add a tasting, Save tasting, the As-expected shortcut, and Record a batch — Save batch has zero distinction as the primary action."
    - "app.css:53-62 grids the page 2fr 1fr; :104-109 makes .side-region a flex column of formulation-note-region then margin-region. FormulationNote renders six figures (figures.js:17-24) each ~86px with 20px gaps, plus BasisNote; the recording margin then stacks a legend and seven fields (five inputs, two rows=2 textareas) above the button."
    - "The user independently reported the position cause in the same UAT test — Deferred Follow-Up, test 4: 'Should we hide the Formulation Note when entering a Batch or an Amendment to a Batch? Seems to be in the way...'"
  falsification_test: "For (1): a cancel/abandon control named in route-recipe-batch.md's In list, in 02-CONTEXT.md's decisions, or in any 02-*-PLAN.md task — none exists. For (2): a button token in tokens.css or a button rule in app.css defining size/weight/border/colour — none exists; or Save batch rendering above the formulation note — it does not."
  fix_rationale: "N/A — diagnose-only mode. No fix applied."
  blind_spots: "Pixel offsets above are computed from token values and line-height arithmetic, not measured in a real browser; the ~1400px figure is an estimate. The user's own 'Formulation Note is in the way' report is the direct observation that carries the position claim. Viewport-height and zoom dependence not measured. Whether Mark wants cancel to discard silently or confirm first is a product decision, not a debug finding."
  candidate_causes:
    - "code — no cancel handler and no non-saving setMode('reading') path (RecipePage.jsx); no cancel control rendered (BatchMargin.jsx:155-237)"
    - "config/design-token — no button token in tokens.css and no button rule in app.css beyond margin-top, because the direction contract never defined the 'binder's button style' the brief cites"
    - "data/spec — the surface brief omits an abandon control from both its In and its Out lists; the Phase 2 discussion only ever decided the unload-loss question"
    - "process — no UI test file exists anywhere under app/src (only domain/ and store/ tests), so no automated gate ever rendered the recording state"
  and_gate: "yes for sub-question 2. Style-absence and position-burial are independent and each is individually survivable — a token-styled button at the foot of the column is findable by scrolling to the end of the form, and an unstyled button adjacent to the last field is findable by proximity. Only both together make it effectively invisible, which matches the report ('hard to find', not 'missing'). Sub-question 1 is single-cause (spec omission propagated to code); its AND-gate is no."

## Symptoms

expected: While recording or amending a batch, the maker can see how to abandon the edit (a cancel control) and can readily find Save batch.
actual: "when Amending, no cancel button is visible and Save batch button is hard to find."
errors: None reported
reproduction: Test 4 in .planning/phases/02-record-the-first-batch/02-UAT.md — npm --prefix app run dev, open http://localhost:5173/recipe/olive-oil-ice-cream-v1 with seeded store, click Amend in the margin.
started: Discovered during Phase 02 UAT, 2026-09-06

## Eliminated

- hypothesis: "A cancel control was designed in the brief or the plans and dropped during implementation"
  evidence: "route-recipe-batch.md's In list (:70) and Out-and-named list (:72) both omit it; 02-CONTEXT.md's only related entry is D-24 (leave warning); 02-DISCUSSION-LOG.md:209-212's options were 'Leave warning only' vs 'Persist the draft now'; no 02-*-PLAN.md task mentions cancel. It was never designed."
  timestamp: 2026-09-06T23:45:00Z

- hypothesis: "The beforeunload leave-warning is the designed abandonment path, so cancel is redundant"
  evidence: "beforeunload fires only on document unload (tab close, reload, external navigation). It does not fire on React Router client-side navigation, and it offers no way back to the reading state — the maker who wants out must destroy the page. It covers accidental loss, not intentional abandonment. The two are different requirements; the brief only ever addressed the first."
  timestamp: 2026-09-06T23:47:00Z

- hypothesis: "Save batch is merely below the fold — position alone explains it"
  evidence: "Position is necessary but not sufficient. app.css has no button rule beyond `.batch-margin button { margin-top: var(--gap-s) }` and tokens.css has no button token, so the button also carries no visual weight once reached. The AND-gate fires: both conditions are required to produce 'hard to find' rather than 'at the bottom'."
  timestamp: 2026-09-06T23:50:00Z

- hypothesis: "Save batch is placed contrary to the brief"
  evidence: "route-recipe-batch.md:97 fixes the recording hierarchy as 'churn date; the as-made column; the steps' strikes and lines; the churn section; the tasting section if one is being written; save' — save last. BatchMargin.jsx:232 honours that order exactly. The placement is per-brief; what the brief did not anticipate is that the two-column layout puts the whole formulation note above the margin, so 'last in the margin' became 'foot of the longest column'."
  timestamp: 2026-09-06T23:52:00Z

## Evidence

- timestamp: 2026-09-06T23:30:00Z
  checked: .planning/debug/knowledge-base.md
  found: No knowledge base file exists yet
  implication: No prior-pattern shortcut; investigate from scratch

- timestamp: 2026-09-06T23:33:00Z
  checked: grep -rniE "cancel|discard|abandon|dismiss|exit" app/src/
  found: Only three useEffect cleanup flags (RecipePage.jsx:78, :88; RecipeList.jsx:15). No handler, no control, no prop.
  implication: No cancel affordance exists anywhere in the codebase.

- timestamp: 2026-09-06T23:35:00Z
  checked: app/src/ui/BatchMargin.jsx, mode === 'recording' branch (lines 155-237)
  found: The branch returns early. It renders a legend, seven labelled ink fields, and one control — <button type="button" onClick={onSaveBatch}>Save batch</button> at line 232. The batch list, Amend, tastings, and Add-a-tasting all live in the openBatch branch, which recording mode never reaches.
  implication: While recording, the margin offers exactly one action, and it commits.

- timestamp: 2026-09-06T23:37:00Z
  checked: grep -n "setMode" app/src/ui/RecipePage.jsx
  found: setMode('reading') at :249 and :260 only — both inside repository.saveBatch(...).then(). setMode('recording') at :143 (handleStartRecording) and :212 (handleStartAmending).
  implication: Writing a record is the sole exit from recording mode. Confirmed dead end.

- timestamp: 2026-09-06T23:38:00Z
  checked: grep -nE "<Link|<a |<nav|<button" across IngredientTable/Method/Authored/FormulationNote/BasisNote; router.jsx
  found: No link, anchor, or nav element renders anywhere on the page while recording. router.jsx has no shell, no nav, no back link. GraduatedRule's <button> only focuses a figure.
  implication: The maker in recording mode has no in-app navigation at all. Browser Back is also unreliable here: mode is deliberately not derived from the URL (RecipePage.jsx:62-64, D-19), so navigating /recipe/:id/batch/:batchId → /recipe/:id keeps RecipePage mounted and leaves mode === 'recording' intact, and beforeunload does not fire for client-side navigation.

- timestamp: 2026-09-06T23:41:00Z
  checked: .impeccable/surfaces/route-recipe-batch.md lines 54, 70, 72, 93, 97, 102
  found: :70 In list ends "...the 'as expected, nothing to note' shortcut; save; the not-yet-evaluated state; reopen; add a tasting after saving; amend..." — no cancel. :72 Out-and-named lists eight exclusions — no cancel. :102 "Leaving with unsaved ink: the browser's own leave warning; no invented dialog." :93 material states include "leaving the page with an unsaved record". :97 fixes the recording hierarchy with save last.
  implication: A cancel control was never designed. It is not an omission from the Out list either — the brief simply never considered intentional abandonment as distinct from accidental unload.

- timestamp: 2026-09-06T23:43:00Z
  checked: .planning/phases/02-record-the-first-batch/02-DISCUSSION-LOG.md:209-212 and 02-CONTEXT.md:50
  found: The single decision in this area offered "Leave warning only | beforeunload; draft persistence in Phase 4" against "Persist the draft now". Chosen: leave warning only. D-24 records it as "Leaving the page with unsaved ink uses the browser's own leave warning only."
  implication: Both options concerned what happens to a draft when the document unloads. Neither was about an in-app way out. The decision does not cover the gap.

- timestamp: 2026-09-06T23:48:00Z
  checked: grep -rniE "binder's button|button style" across .impeccable/, product-requirements/, .planning/
  found: Exactly two hits — route-recipe-batch.md:54 ("'Record a batch' is a control in the margin, in the binder's button style ... 'Save batch' is explicit") and 02-01-PLAN.md:237, which copies the phrase forward verbatim.
  implication: The plan inherited a style name it could not resolve.

- timestamp: 2026-09-06T23:49:00Z
  checked: .impeccable/surfaces/route-recipe.md "Direction contract" section, items 1-7 (lines 115-137)
  found: The contract defines Type, Colour (four roles), Spacing scale, Rule drawing, Focus treatment, Plain-language block names, and What stays open. There is no button or control item anywhere in it.
  implication: "The binder's button style" is a dangling reference. The direction contract — the sole authority tokens.css draws from — never defined it.

- timestamp: 2026-09-06T23:50:00Z
  checked: grep -n "button" app/src/styles/tokens.css and app/src/styles/app.css
  found: tokens.css — no match (no button token of any kind). app.css — the only button rule in the entire stylesheet is `.batch-margin button { margin-top: var(--gap-s); }` (line 442), which sets spacing and nothing else. tokens.css's own header states "Every value here is decided there; nothing here decides anything new."
  implication: Save batch renders as unstyled UA-default chrome — small, grey, system-shaped — inside a page whose every other element reads through a token. It is also styled identically to Amend, Add a tasting, Save tasting, the As-expected shortcut, and Record a batch: no primary-action distinction exists.

- timestamp: 2026-09-06T23:52:00Z
  checked: app.css:53-62 (.recipe-page grid), :104-109 (.side-region), FormulationNote.jsx, figures.js:17-24, GraduatedRule.jsx (HEIGHT = 30)
  found: The page is a 2fr 1fr grid; .side-region is a flex column of formulation-note-region (six graduated rules — pac, pod, fat, msnf, sugar, solids — each ~86px with --gap-m between, plus the fat breakdown line and BasisNote) then margin-region. In recording mode the margin adds a legend and seven fields (five inputs, two rows=2 textareas) above the button.
  implication: Save batch lands roughly 1400px into the document (estimate from token arithmetic, not measured), at the foot of the page's longest column, in its narrow third. Clicking Amend expands the margin from ~8 short reading lines into a ~440px form without moving the scroll position, so the button appears well below the viewport at the moment it becomes relevant.

- timestamp: 2026-09-06T23:53:00Z
  checked: .planning/phases/02-record-the-first-batch/02-UAT.md Deferred Follow-Ups, test 4
  found: The user, in the same test, independently wrote "Should we hide the Formulation Note when entering a Batch or an Amendment to a Batch? Seems to be in the way..."
  implication: Direct user observation of the position cause, recorded separately from the G-02-4 report. Corroborates the burial half of the AND-gate.

- timestamp: 2026-09-06T23:54:00Z
  checked: ls app/src/**/*.test.*
  found: Seven test files — data/olive-oil, domain/axes, domain/batch, domain/composition, domain/figures, store/seed, store/transfer. No UI test file exists anywhere under app/src/ui/.
  implication: Why it was not caught — no automated gate ever renders the recording state, so neither the missing control nor the unstyled button could fail a test. Both human-checks that would have caught it (02-01 Task 1's and 02-02 Task 2's <human-check>) were deferred to end-of-phase UAT at the user's instruction (02-02-SUMMARY.md:82), which is exactly where it surfaced.

## Resolution

root_cause: >
  Two independent causes, one per sub-question.

  (1) No cancel control: it was never designed. The surface brief names an abandonment
  behaviour only for document unload — "Leaving with unsaved ink: the browser's own leave
  warning; no invented dialog" (route-recipe-batch.md:102) — and lists "save" but no cancel
  in its In list (:70), while its Out-and-named list (:72) never excludes one either. The
  Phase 2 discussion's sole decision in this area chose "Leave warning only" over "Persist
  the draft now" (02-DISCUSSION-LOG.md:209-212, D-24) — both options about unload-time draft
  loss, neither about an intentional way out. Accidental loss and deliberate abandonment were
  conflated as one requirement. The code faithfully implements the brief: setMode('reading')
  exists only inside the two saveBatch success callbacks (RecipePage.jsx:249, :260), and the
  recording branch of BatchMargin (lines 155-237) renders no link, no nav, and one control.
  Recording mode is therefore a dead end whose only exit writes a record.

  (2) Save batch hard to find: an AND of two conditions, both required. (a) The brief asks for
  "the binder's button style" (route-recipe-batch.md:54), a phrase that appears only there and
  in the plan that copied it forward (02-01-PLAN.md:237). The direction contract that tokens.css
  draws from — route-recipe.md's Direction contract, items 1-7: Type, Colour, Spacing, Rule
  drawing, Focus treatment, Block names, Open decisions — never defines a button style. So no
  button token exists, app.css's only button rule is `.batch-margin button { margin-top:
  var(--gap-s) }` (line 442), and the button ships as bare UA chrome, visually identical to the
  five other buttons in the app and unrelated to the page's typographic language. (b) The
  two-column layout (app.css:53-62, :104-109) stacks the six graduated rules and the basis note
  above the margin in the narrow right column, and the recording margin puts seven fields above
  the button, so it sits at the foot of the page's longest column. Its ordering is correct per
  the brief's own hierarchy (:97, save last) — the brief simply did not anticipate that "last in
  the margin" would mean "roughly 1400px down". Either condition alone is survivable; together
  they make the only action in the mode effectively invisible, which is why the report says
  "hard to find" rather than "missing".

fix: not applied — diagnose-only mode (goal: find_root_cause_only)
verification: n/a
files_changed: []
