---
status: diagnosed
trigger: "G-03.5-2a: clicking Show changes throws `null is not an object (evaluating 't.textFrom.purpose')`"
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED. Method.jsx's show-changes branch (lines 720-722, 757) reads stepDiff.textFrom.{purpose,aside,leadIn,instruction} gated only on the *Changed flags. For a step whose `n` is absent from the parent, buildDiff (diff.js:117-131) returns every *Changed flag true AND textFrom: null (a documented, tested contract), so line 721 dereferences null. The seeded Mexican Chocolate v4 (and v2, and Mocha v1) are the first records ever to carry a step absent from their parent; the pen cannot add steps, so no app-authored version reaches this branch, and every show-changes test fixture is structuredClone(baseline).
bug_class: Bohrbug (deterministic, data-shape triggered)
reasoning_checkpoint:
  hypothesis: "Show changes on mexican-chocolate v4 throws because v4.method has step n=2 ('Chill and churn') and its parent v3.method has only n=1; buildStepDiff returns {purposeChanged: true, textFrom: null} for n=2, and Method.jsx:721 evaluates `stepDiff.purposeChanged && stepDiff.textFrom.purpose`."
  confirming_evidence:
    - "Bundle col 34:133793 is exactly the `.purpose` in `i=t.purposeChanged&&t.textFrom.purpose!==``` inside `if(E){let t=D.steps.find(...)` - E=isShowingChanges, t=stepDiff; col 133033 is the steps.map callback, so Kc=Method."
    - "buildDiff(seed v4, seed v3).steps -> n=2 has textFrom null (probe.mjs)."
    - "Rendering the real Method.jsx (compiled into scratchpad) with RecipePage's exact show-changes props throws `Cannot read properties of null (reading 'purpose')` for mexican-chocolate-v2, -v4, mocha-v1; renders OK for mexican-chocolate-v3, mocha-v2, mocha-v3, strawberry-v2, coconut-v2."
  falsification_test: "If a version whose every step has a parent counterpart also threw, or v4 rendered cleanly, the hypothesis would be wrong. v3/mocha-v2/mocha-v3 render cleanly; v4 throws."
  fix_rationale: "(diagnose-only) The show-changes branch must treat textFrom === null as 'new in this version' - not strike parent text that does not exist."
  blind_spots: "Mark's IndexedDB content is assumed to equal the seed (UAT test 1 resets the store on hard reload). An imported (transfer.js) version could also carry a parent-less step - same crash, same fix."
  candidate_causes:
    - "code: Method.jsx show-changes branch omits the `!= null` guard that IngredientTable (gramsFrom/shareFrom) and target chips (targetDiff.from) apply to the same diff's null-on-absent fields"
    - "data: 03.5-03 seed transcriptions add steps in a child (v2, v4, mocha v1) and physically drop steps (v3, strawberry v2) - shapes the pen can never author"
  and_gate: "yes - the crash needs BOTH the unguarded read (latent since 03-09, 2026-09-07) AND a stored child version with a step absent from its parent (first introduced by 03.5-03 seed data, 2026-09-25). Neither alone crashes."
next_action: return ROOT CAUSE FOUND to orchestrator

## Symptoms

expected: Clicking "Show changes" in the Version band reveals the version's changes without error.
actual: Unexpected Application Error! null is not an object (evaluating 't.textFrom.purpose') at index-CrtH-8SI.js:34:133793, inside map, inside component Kc.
errors: TypeError (WebKit wording) null is not an object (evaluating 't.textFrom.purpose')
reproduction: /notebook/mexican-chocolate (opens v4) -> press "Show changes". (Orchestrator's "or mocha v3" does NOT reproduce - mocha v1 does.)
started: Discovered during 03.5 UAT (Test 2).

## Eliminated

- hypothesis: stepDiff itself is undefined (step missing from changeDiff.steps)
  evidence: WebKit message is "null is not an object (evaluating 't.textFrom.purpose')" - t is defined, t.textFrom is null. buildDiff emits one descriptor per current step, and Method iterates version.method (same array buildDiff iterated).
  timestamp: 2026-09-29
- hypothesis: crash is in the pen (StepPenBody, Method.jsx:108)
  evidence: bundle column is inside the `if(E)` isShowingChanges branch, not Wc (StepPenBody). The pen's draft is a clone of the version and the pen has no add-step control (grep: none), so penDiff never has a null textFrom.
  timestamp: 2026-09-29
- hypothesis: mocha v3 crashes too
  evidence: mocha v3 and v2 method n=[1], parent n=[1]; render OK. Only mocha v1 (parent v0 method []) crashes.
  timestamp: 2026-09-29
- hypothesis: the row side (IngredientTable) is equally unguarded
  evidence: IngredientTable.jsx:186,202,222,226 all guard gramsFrom/shareFrom != null.
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: .planning/debug/knowledge-base.md
  found: absent - no knowledge base
  implication: no known-pattern candidate

- timestamp: 2026-09-29
  checked: app/src/domain/diff.js:117-131, 184-190
  found: buildStepDiff with no baseStep returns leadInChanged/instructionChanged/purposeChanged/asideChanged all true and textFrom: null - documented ("textFrom stays null when there is no baseline step at all") and pinned by diff.test.js:389-408. Steps are matched by `n` (diff.js:209-210).
  implication: null textFrom is the domain's contract, not a domain bug.

- timestamp: 2026-09-29
  checked: app/src/ui/Method.jsx:712-797 (isShowingChanges branch)
  found: 720 showStruckBeneath = leadInChanged||instructionChanged; 721 `stepDiff.purposeChanged && stepDiff.textFrom.purpose !== ''`; 722 same for aside; 757 `stepDiff.textFrom.leadIn` / `.instruction`; 791, 793 textFrom.purpose/aside. None check textFrom != null. The target chips at 767 DO guard (`targetDiff.from != null`).
  implication: all four text reads crash for a parent-less step; purpose is merely first.

- timestamp: 2026-09-29
  checked: RecipePage.jsx:1002-1003, 1978-1992
  found: changeDiff = buildDiff(version, parentVersion); Method gets steps=version.method in show-changes.
  implication: any version.method step whose n is absent from parentVersion.method reaches the null read.

- timestamp: 2026-09-29
  checked: minified bundle /Users/mark/Documents/projects/sprinkles/app/dist/assets/index-CrtH-8SI.js line 34
  found: col 133793 = `.purpose` in `i=t.purposeChanged&&t.textFrom.purpose!==```, inside `if(E){let t=D.steps.find(t=>t.n===e.n)...`; col 133033 = `e.map(e=>{if(T){...` (Method's steps.map). T=isDeveloping, E=isShowingChanges.
  implication: crash site is Method.jsx:721, show-changes branch - exact match.

- timestamp: 2026-09-29
  checked: buildDiff over every seeded child vs its seeded parent (scratchpad probe.mjs)
  found: null textFrom on mexican-chocolate-v2 n=2 (parent v1 n=[1]), mexican-chocolate-v4 n=2 'Chill and churn' (parent v3 n=[1]), mocha-v1 n=1 (parent v0 method []). All others clean.
  implication: three seeded versions crash Show changes; v4 is the default version of /notebook/mexican-chocolate.

- timestamp: 2026-09-29
  checked: real Method.jsx compiled via vite transformWithOxc into scratchpad, rendered with renderToStaticMarkup and RecipePage's show-changes props (scratchpad repro.mjs)
  found: THROWS "Cannot read properties of null (reading 'purpose')" for mexican-chocolate-v2, -v4, mocha-v1; OK for mexican-chocolate-v3, mocha-v2, mocha-v3, strawberry-v2, coconut-v2.
  implication: deterministic reproduction outside the browser, same TypeError (V8 wording).

- timestamp: 2026-09-29
  checked: scratch copy with successive optional-chaining guards (patched.mjs)
  found: guard purpose -> throws on aside; + aside -> throws on leadIn; + leadIn/instruction -> renders, but emits 3 bogus prose-struck-beneath paragraphs for the new step, including an empty `<b>.</b> `.
  implication: fix must gate the struck-beneath treatments on textFrom != null (a new step has no parent text to strike), not just null-chain the reads.

- timestamp: 2026-09-29
  checked: grep app/src/ui, app/src/domain for add-step capability
  found: none - the pen can edit/remove (flag removed:true) steps but never add one, and the draft is a clone of the version.
  implication: before 03.5 seed data, no stored child could carry a parent-less step, so the branch was unreachable.

- timestamp: 2026-09-29
  checked: Method.test.jsx show-changes cases (544-640, 1060-1120); seed-coverage.test.js, seed.test.js, seed-recipes.test.js, RecipePage.test.jsx
  found: every show-changes fixture is currentVersion = structuredClone(baseline/parent) with edits/removals only - never a step added in the child. No seed test calls buildDiff or renders Method over the seeded lineage.
  implication: why not caught - the domain pins textFrom:null (diff.test.js:389) but no UI test renders it, and the seed tests check transcription, not rendering.

- timestamp: 2026-09-29
  checked: git log -S
  found: textFrom:null introduced 7a3bd44 (03-02, 2026-09-07); unguarded Method reads 237fb71 (03-09, 2026-09-07) / 5fe65dc (03.3-03); Mexican Chocolate v1-v4 and Mocha seed data 3f6ae4b/e2d68aa etc. (03.5-03, 2026-09-25).
  implication: latent defect since 03-09, made reachable by 03.5-03 seed data.

- timestamp: 2026-09-29
  checked: seeded parent rows/steps missing from child (rows.mjs)
  found: mexican-chocolate-v3 drops parent step 2; strawberry-v2 drops parent step 1 and row-11; coconut-v2 drops row-11. buildDiff iterates current only, so these disappear silently from Show changes (no crash).
  implication: related fidelity gap (not this crash) - the seed uses add/delete shapes the pen never authors (pen flags removed:true).

## Resolution

root_cause: Method.jsx's show-changes branch (app/src/ui/Method.jsx:721, also 722, 757, 791, 793) dereferences stepDiff.textFrom without a null check, gated only by purposeChanged/asideChanged/leadInChanged/instructionChanged; buildDiff (app/src/domain/diff.js:117-131) returns all those flags true with textFrom: null for any step whose n is absent from the parent; the 03.5-03 seed data (app/src/data/mexican-chocolate.js v4 step n=2 'Chill and churn' vs v3's single step; also v2 and mocha.js v1) is the first stored data with such a step, since the pen cannot add steps.
fix: (not applied - diagnose only)
verification: (n/a)
files_changed: []
