---
status: diagnosed
trigger: "G-02-3 skipped-label-struck-through — On the batch page, a method step that was struck (step 1 of the seeded 2 Aug batch) shows a \"Skipped\" text label, but the label itself renders with the same strike-through as the step's prose. The label is meant to be a legible marker beside struck prose, not part of what is struck."
created: 2026-09-07T00:05:00Z
updated: 2026-09-07T00:25:00Z
---

## Current Focus

hypothesis: The `Skipped` label is a `<span>` nested INSIDE the `<p>` that carries `.method-step__lead--struck`, whose only declaration is `text-decoration: line-through`. Per CSS Text Decoration L3, a text decoration set on a block box propagates to all in-flow descendants and CANNOT be switched off by a descendant — so the label is struck by construction, and no rule on `.method-step__skipped-label` could ever have prevented it.
test: Render `Method` via `react-dom/server` with a struck step; confirm the label span is a descendant of the element carrying the struck class. Read the CSS to confirm the decoration is declared on the ancestor `<p>` and that no cancelling attempt exists on the label.
expecting: Label span nested inside the struck `<p>`; `.method-step__skipped-label` carries only face/size/case/tracking, no decoration property.
next_action: Return diagnosis (goal: find_root_cause_only). No fix applied.

rca_branching:
  candidate_causes:
    - "code — Method.jsx:48 nests the label <span> inside the lead <p> that carries the struck class (CONFIRMED, necessary condition A)"
    - "config/styles — app.css:249-251 declares text-decoration: line-through on that ancestor <p>, so the decoration propagates to every in-flow inline descendant (CONFIRMED, necessary condition B)"
    - "data — the seeded 2 Aug batch marks step 1 struck (batch-2026-08-02.js:26); this is only the trigger that makes the rendering reachable, not a cause"
    - "environment — ruled out. Decoration propagation is CSS Text Decoration L3 §2.1 behaviour, implemented identically in every browser; no browser or viewport makes the label legible"
  and_gate: "YES. A alone is harmless — a nested label under a paragraph with no decoration reads clean. B alone is harmless — the strike through prose is the intended rendering, and is what the plan asked for. Only both together strike the label. Consequently a fix must break exactly one of them: move the label out of the decorated <p> (breaks A), or scope the decoration to the prose rather than the paragraph (breaks B). Adding text-decoration: none to the label breaks neither and would change nothing."

plan_provenance: "Plan-level gap in the verification gate, not a code deviation. 02-02-PLAN.md:154 specifies 'a strike drawn through it ... and BESIDE IT a short text label saying the step was skipped'. The implementation put the label inside rather than beside. The plan's automated gate (02-02-PLAN.md:179) only asserts 'the label string is present in the component's output for a struck step' — a string-presence check that a struck label passes. The human-check (:175) says 'struck and still legible with a text label beside it', which is exactly what UAT caught; nothing automatable stood between them."

bug_class: Bohrbug — fully deterministic. Every load of the seeded store renders step 1 struck; the strike propagation is spec-mandated in every browser, not environment-dependent.

## Symptoms
<!-- Prefilled from UAT — IMMUTABLE -->

expected: Step 1's prose reads struck with a visible "Skipped" text label (not a line alone); the label is itself legible, not rendered with the step's strike-through.
actual: "'Skipped' on method step 1 is struck-thru like rest of step. seems like SKIPPED would not have strike-thru style applied."
errors: None reported.
reproduction: Test 3 in .planning/phases/02-record-the-first-batch/02-UAT.md. `npm --prefix app run dev`, open http://localhost:5173/recipe/olive-oil-ice-cream-v1 with the seeded store (step 1 struck in the seeded 2 Aug batch).
started: Discovered during Phase 02 UAT, 2026-09-06. Present since 02-02 Task 1 shipped the strike rendering.

## Eliminated

- hypothesis: "A class is applied too broadly — the struck class lands on the whole step or on the label as well as the prose."
  evidence: Method.jsx:41 puts `method-step__lead--struck` on the lead `<p>` only; the `<li class="method-step">` and the label `<span class="method-step__skipped-label">` never receive it. The class scope is correct — the nesting is the problem, not the selector.
  timestamp: 2026-09-07T00:12:00Z

- hypothesis: "The label is missing a `text-decoration: none` that would have fixed it."
  evidence: CSS Text Decoration Level 3 §2.1 — decorations propagate to in-flow descendants and are not affected by descendant `text-decoration` values. Adding `text-decoration: none` to `.method-step__skipped-label` would be a no-op. This is why the omission is not itself the root cause.
  timestamp: 2026-09-07T00:14:00Z

## Evidence

- timestamp: 2026-09-07T00:08:00Z
  checked: Knowledge base (.planning/debug/knowledge-base.md)
  found: File does not exist; one prior session (record-a-batch-entry-missing.md, G-02-1) is diagnosed but not archived, and is unrelated (margin control branch).
  implication: No known-pattern shortcut. Investigate from evidence.

- timestamp: 2026-09-07T00:10:00Z
  checked: app/src/ui/Method.jsx lines 40-49
  found: |
    <p className={struck ? 'method-step__lead method-step__lead--struck' : 'method-step__lead'}>
      <b>{step.leadIn}.</b> {step.instruction}
      {struck && <span className="method-step__skipped-label"> Skipped</span>}
    </p>
    The label span is a direct child of the struck paragraph.
  implication: Nesting condition A holds — the label is inside the strike's propagation scope.

- timestamp: 2026-09-07T00:11:00Z
  checked: app/src/styles/app.css lines 246-258
  found: |
    .method-step__lead--struck { text-decoration: line-through; }
    .method-step__skipped-label {
      font-family: var(--face-grotesk);
      font-size: var(--size-small-print);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    The decoration is declared on the ancestor block; the label carries no decoration property at all.
  implication: Condition B holds — the decoration originates on the ancestor, so it propagates to every inline descendant including the label.

- timestamp: 2026-09-07T00:15:00Z
  checked: 02-02-PLAN.md:154 (the plan's own rendering contract) and .impeccable/surfaces/route-recipe-batch.md:104
  found: |
    Plan: "Render the lead paragraph with a strike drawn through it, its prose intact and fully readable,
    and BESIDE IT a short text label saying the step was skipped. The label is the requirement, not a decoration."
    Brief: "the strike control has a text label, not only a line."
  implication: The intent was "beside it" — the label was never meant to be inside the struck paragraph. The implementation satisfied the label-exists requirement (and its automated gate, which only checks the string is present in output) while violating the beside-it placement. The verification gate at 02-02-PLAN.md:179 checks only that "the label string is present in the component's output" — it cannot catch a struck label.

- timestamp: 2026-09-07T00:20:00Z
  checked: Rendered Method via react-dom/server with steps=[{n:1,...}] and stepChanges={1:{struck:true,line:null}}, mode='reading' (throwaway probe test, deleted after the run)
  found: |
    <p class="method-step__lead method-step__lead--struck"><b>Steep.</b> Warm the milk and steep the zest.<span class="method-step__skipped-label"> Skipped</span></p>
    The label span is emitted as a direct in-flow inline child of the paragraph carrying the strike.
  implication: Conditions A and B are confirmed together in the real render, not merely in the source. The struck label is structural, not incidental.

- timestamp: 2026-09-07T00:22:00Z
  checked: Every text-decoration and display declaration in app/src/styles/app.css
  found: |
    `line-through` appears exactly once, at :250 on .method-step__lead--struck — this bug has no other site.
    The only other text-decoration (:27) is `none` on .recipe-list a, unrelated.
    .target-chip (:228) already uses `display: inline-flex` — the codebase has precedent for an atomic
    inline-level box, which is the form a propagated decoration does not draw through.
  implication: Blast radius is exactly this one label; and a token-free, precedent-matching fix form already exists in the stylesheet.

## Resolution

root_cause: |
  Two contributing conditions, both required (AND):
  (A) app/src/ui/Method.jsx:48 renders the "Skipped" label as a <span> nested inside the lead <p>;
  (B) app/src/styles/app.css:249-251 declares `text-decoration: line-through` on that same <p> via
      `.method-step__lead--struck`.
  Per CSS Text Decoration Level 3, a decoration specified on a block box propagates to its in-flow
  inline descendants and cannot be cancelled by them — so the nested label is struck by construction.
  Neither condition alone produces the bug: a label placed outside the struck <p> would read clean under
  the same CSS, and a strike scoped to the prose text alone would leave a nested label clean.
fix: (not applied — goal: find_root_cause_only)
verification: (n/a — diagnose-only)
files_changed: []
