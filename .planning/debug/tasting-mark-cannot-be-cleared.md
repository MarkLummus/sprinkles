---
status: diagnosed
trigger: "G-02-6 tasting-mark-cannot-be-cleared — While composing a tasting on the batch page (Add a tasting), once a mark is placed on one of the six axes (e.g. hardness 4.5), there is no way to remove it so the axis returns to \"unmarked\" before saving."
created: 2026-09-06T00:00:00Z
updated: 2026-09-06T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — no clear path exists in either the control or the state updater; clearing was never specified in any upstream design artifact and was recorded as a deliberate implementation decision in 02-03-SUMMARY.md.
test: complete read of AxisMark.jsx, BatchMargin.jsx TastingForm, RecipePage.jsx tasting handlers, axes.js, batch.js; artifact trace across D-16, the surface brief, 02-RESEARCH.md Pattern 3, 02-03-PLAN.md, 02-03-SUMMARY.md, 02-VERIFICATION.md
expecting: confirmed
next_action: return diagnosis (goal: find_root_cause_only — no fix applied)

bug_class: Bohrbug — deterministic, reproduces every time, no timing or environment dependence
reasoning_checkpoint:
  hypothesis: "A placed mark cannot be cleared because the mark control offers only nine set-only stops (no unmarked stop, no clear control, no click-again handler) AND handleChangeTastingMark can only write a key into draft.marks, never delete one — so no code path exists that returns marks to a state with the axis key absent."
  confirming_evidence:
    - "AxisMark.jsx renders exactly nine <input type=radio> stops from MARK_STOPS = [1,1.5,...,5] plus two aria-hidden anchor spans. No other interactive element exists in the component."
    - "RecipePage.jsx:285-287 — handleChangeTastingMark(axisKey, stop) => setTastingDraft(prev => ({...prev, marks: {...prev.marks, [axisKey]: stop}})). Set only; no delete branch."
    - "RecipePage.jsx:282-284 code comment states the omission outright: 'there is no control to clear a mark once set, matching native grouped radios' own behavior'."
    - "02-03-SUMMARY.md:201 records it as a Decision Made: 'AxisMark has no control to un-mark an axis once set... nothing in the brief or acceptance criteria requires a clear affordance.'"
    - "app.css .axis-mark rules style only __legend, __row, __anchor, __stop and the radio itself — no hidden or display:none clear control."
  falsification_test: "Find any element, handler, keybinding, or CSS rule in AxisMark.jsx / BatchMargin.jsx / RecipePage.jsx / app.css that removes a key from tastingDraft.marks. None exists — searched exhaustively."
  fix_rationale: "N/A this session (find_root_cause_only). Any fix must change two sites together: an affordance in AxisMark.jsx and a delete branch in handleChangeTastingMark."
  blind_spots: "Not empirically exercised in a browser — but the conclusion does not depend on browser radio semantics: the control is a React controlled component (checked={value === stop}), so even a browser that permitted deselection would have the stop restored on the next render because `value` never becomes undefined. The fault is fully determined by application code."
  candidate_causes:
    - "code: set-only state updater and set-only control (CONFIRMED)"
    - "data/spec: the design contract (D-16, surface brief §6 Marks) is silent on clearing — says only 'one click sets' (CONFIRMED as the upstream why)"
    - "environment: native grouped radios are a one-way latch by platform design — the reason the chosen pattern silently inherited the limitation (CONTRIBUTING, not load-bearing)"
    - "config: none — no configuration governs this control (N/A)"
  and_gate: "no for the symptom — a single missing capability fully explains it. yes for the fix — two code sites (affordance + delete branch) must change together, and the affordance choice is a design decision the brief does not pre-answer."

## Symptoms

expected: While composing a tasting, a mark placed on an axis can be cleared again so the axis returns to unmarked before saving.
actual: "once a mark is made, it cannot be removed. otherwise pass"
errors: None reported
reproduction: Test 6 in .planning/phases/02-record-the-first-batch/02-UAT.md. npm --prefix app run dev; open http://localhost:5173/recipe/olive-oil-ice-cream-v1 with the seeded store, click Add a tasting in the margin, click a stop on any axis, then try to unmark it.
started: Discovered during Phase 02 UAT, 2026-09-06 (Phase 2 Plan 03, commit 2d010c0, shipped the tasting form)

## Eliminated

- hypothesis: "A clear affordance exists but is invisible or unreachable (CSS / a11y rendering bug)"
  evidence: AxisMark.jsx read in full — the component's entire interactive surface is nine radios; no button, no tenth stop, no keydown handler. app/src/styles/app.css .axis-mark* rules cover only __legend, __row, __anchor, __stop and the radio; nothing is hidden or clipped. Nothing exists to be made visible.
  timestamp: 2026-09-06

- hypothesis: "Clearing was specified in the design contract and omitted in implementation (a build miss against an existing requirement)"
  evidence: Exhaustive trace of every upstream artifact. D-16 (02-CONTEXT.md:38, 02-RESEARCH.md:36) says only "arrow keys move a half step, one click sets... Any axis may stay unmarked". Surface brief §6 Marks (.impeccable/surfaces/route-recipe-batch.md) says "operable by keyboard as a group (arrow keys move a half step, one click sets)". 02-03-PLAN.md:249 says only "No stop is checked by default". No artifact anywhere in .planning/ or product-requirements/ contains un-mark / clear-a-mark / deselect language. "May stay unmarked" describes the default state, never a reversal path.
  timestamp: 2026-09-06

- hypothesis: "The save-gate (isTastingSaveable) is the cause of the reported symptom"
  evidence: batch.js:200-204 — isTastingSaveable returns true when marks has >=1 own key. This is downstream of the fault, not its cause. It is, however, an aggravating consequence: see Evidence entry on the accidental-mark trap.
  timestamp: 2026-09-06

## Evidence

- timestamp: 2026-09-06
  checked: .planning/debug/knowledge-base.md
  found: File does not exist — no prior resolved sessions to match against
  implication: No known-pattern shortcut; investigated from first principles

- timestamp: 2026-09-06
  checked: app/src/ui/AxisMark.jsx (complete)
  found: |
    Renders a <fieldset> with role="group", two aria-hidden anchor spans, and exactly nine
    <input type="radio" name={groupName} value={stop} checked={value === stop}
    onChange={() => onChange(stop)} /> stops from MARK_STOPS. No clear button, no
    "unmarked" stop, no onClick/onKeyDown, no onChange path that emits undefined.
    A header comment states the design intent: "No stop is checked by default: `value` is
    `undefined` for an unmarked axis, which matches no stop, so nothing renders checked."
  implication: |
    The control can only ever move a mark from one stop to another, never back to undefined.
    Two independent locks: (a) the DOM has no element whose activation means "clear", and
    (b) even a click on the already-checked stop fires no React onChange (the input is
    already checked, so no change event), and if it did, the handler would set the same value.
    Because the input is a controlled component bound to `checked={value === stop}`, this
    holds regardless of browser behaviour — the conclusion does not rest on the platform
    radio-latch assumption.

- timestamp: 2026-09-06
  checked: app/src/domain/axes.js
  found: MARK_STOPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] — nine value stops, no null/"unmarked" sentinel stop.
  implication: The vocabulary of the control has no representation for "clear this axis". A tenth "unmarked" stop would be the smallest domain-level change that gives the radio group a way to express the absent state.

- timestamp: 2026-09-06
  checked: app/src/ui/RecipePage.jsx:282-287
  found: |
    // Marking an axis writes the stop's numeric value under its mark key
    // (D-16); there is no control to clear a mark once set, matching native
    // grouped radios' own behavior — an axis simply stays unmarked until
    // the maker clicks a stop.
    function handleChangeTastingMark(axisKey, stop) {
      setTastingDraft((prev) => ({ ...prev, marks: { ...prev.marks, [axisKey]: stop } }));
    }
  implication: |
    SECOND, INDEPENDENT LOCK. The state updater is set-only — there is no `delete` branch and
    no sentinel handling. Even if AxisMark gained a clear affordance today, this handler could
    not remove the key from draft.marks. A fix must change both sites together.

- timestamp: 2026-09-06
  checked: app/src/ui/BatchMargin.jsx TastingForm (lines 44-125)
  found: |
    The form renders: date, tastingTempC, one <AxisMark> per axis, meltdownLossG, words,
    the As-expected shortcut button, nextTimeNote, and a single "Save tasting" button
    (disabled when !isTastingSaveable) with hint text. There is no Cancel / Discard /
    Clear control of any kind anywhere in the form.
  implication: |
    No escape hatch at the form level either. Confirmed by grep across all of app/src/ui/*.jsx:
    the only "cancel" occurrences are useEffect race guards in RecipeList.jsx and RecipePage.jsx.
    (This is the same missing-cancel family as gap G-02-4, which was reported against the batch
    pen layer; it applies to the tasting draft too.)

- timestamp: 2026-09-06
  checked: app/src/domain/batch.js:200-204 (isTastingSaveable) interaction with the fault
  found: |
    isTastingSaveable returns true as soon as marks has >= 1 own key. Combined with the
    missing clear path and the missing Cancel control, a maker who clicks a stop by accident
    cannot return the draft to its pre-mark state: "Save tasting" is now permanently enabled,
    the "Write words or mark at least one axis to save" hint is gone for good, and the only
    way out is to reload the page — which trips the beforeunload leave-warning
    (isTastingDraftDirty counts Object.keys(marks).length > 0) and discards the entire draft.
  implication: |
    The gap is worse than "cannot unmark one axis": a single misclick permanently changes what
    the tasting will record, with no undo short of abandoning the whole tasting. This raises the
    user-facing severity and should inform the fix's priority.

- timestamp: 2026-09-06
  checked: app/src/ui/Method.jsx:65-67 (the strike control) vs AxisMark
  found: The step-strike control is <input type="checkbox" checked={entry ? entry.struck : false} onChange={handleChangeStruck} /> — freely toggleable in both directions. Every other pen-layer field is a text/number/date input, all clearable.
  implication: AxisMark is the ONLY one-way, non-reversible control in the entire pen layer. That asymmetry is the strongest argument that the omission is a genuine design gap rather than an intended constraint — the surface's own thesis is "recording a batch is writing on the page you printed", and every other mark on that page can be scratched out.

- timestamp: 2026-09-06
  checked: Design-contract trace — .planning/phases/02-record-the-first-batch/02-CONTEXT.md D-16 (line 38), 02-RESEARCH.md D-16 (line 36) and Pattern 3 (lines 283-318), .impeccable/surfaces/route-recipe-batch.md §5 line 50 and §6 "Marks", 02-03-PLAN.md lines 40/249/251/268
  found: |
    Every artifact specifies the same three things and only those three: nine stops 1-5 by
    halves with anchors at the ends; arrow keys move a half step and "one click sets"; no stop
    pre-selected, so "any axis may stay unmarked". The word "unmarked" appears throughout, but
    always describing the untouched default state or the reading-state wording for an absent
    key — never a transition back to it. grep for un-mark / clear a mark / deselect across all
    of .planning/ and product-requirements/ returns nothing outside 02-03-SUMMARY.md's own note.
  implication: CLEARING WAS NEVER SPECIFIED. This is a requirement/design gap, not a build miss against an existing requirement.

- timestamp: 2026-09-06
  checked: .planning/phases/02-record-the-first-batch/02-03-SUMMARY.md:201 ("Decisions Made") and .planning/STATE.md Accumulated Context
  found: |
    SUMMARY: "`AxisMark` has no control to un-mark an axis once set, matching native grouped
    radios' own behavior; nothing in the brief or acceptance criteria requires a clear affordance."
    STATE.md: "[Phase 2, Plan 03] ... the AxisMark control has no un-mark affordance, matching
    native grouped radios."
  implication: |
    The omission was conscious, reasoned, and recorded at build time — the builder correctly
    observed that no artifact required it and adopted the platform's default. The failure is
    upstream: the design contract never asked whether a mark is reversible, so the question was
    resolved by the implementation pattern's default rather than by design.

- timestamp: 2026-09-06
  checked: 02-RESEARCH.md Assumptions Log A1 (line 430)
  found: |
    "Native grouped <input type=radio> arrow-key navigation satisfies D-16's 'arrow keys move a
    half step, one click sets' without custom keydown handling. Risk: Low... if design QA finds
    a gap (e.g. a desired visual affordance native radios can't achieve even restyled), the
    fallback is a role='radiogroup' with a small custom keydown handler, which is a bounded,
    well-known pattern, not a rewrite."
  implication: |
    Research anticipated this exact class of gap and pre-authorised the escape route, but
    evaluated native radios only against what D-16 explicitly listed. Because D-16 listed only
    setting behaviours, the "one-way latch" property of native radios was never surfaced as a
    tradeoff for Mark to accept or reject.

- timestamp: 2026-09-06
  checked: .planning/phases/02-record-the-first-batch/02-VERIFICATION.md:89 and :63; app/vitest.config.js; find app/src -name "*.test.*"
  found: |
    Verification checked AxisMark for "no default `checked`" and confirmed it — the exact
    property that WAS specified. Reversibility was in no acceptance criterion, so no gate
    evaluated it. There are also zero component tests in the repo (7 test files, all domain /
    store / data), and vitest defaults to environment 'node' — no DOM interaction is exercised
    anywhere.
  implication: No existing gate could have caught this. It was reachable only by a human using the form — which is exactly how UAT Test 6 found it.

- timestamp: 2026-09-06
  checked: .impeccable/surfaces/route-recipe-batch.md §7 "Must not be invented by a builder"
  found: |
    The forbidden list is: a rating control or overall score (D12); a colour/icon/badge saying a
    deviation or blank is good, bad, or a problem; a default for any measured value, as-made
    amount, step outcome, or tasting date; a defect taxonomy in place of the open field; any
    sensory claim derived from the record.
  implication: |
    A clear affordance violates none of these — it is not forbidden. But it IS a new interaction
    on a confirmed design surface, and §6's "Marks" bullet is the brief's own wording for this
    control, so the fix's chosen affordance should be routed past Impeccable rather than picked
    by a builder, exactly as the A1 fallback anticipated ("if design QA finds a gap...").

## Resolution

root_cause: |
  Clearing a placed mark is not implemented anywhere, because it was never specified anywhere.

  Two independent code-level locks, both of which must be removed for any fix:
  (1) app/src/ui/AxisMark.jsx has no affordance that means "clear" — its entire interactive
      surface is nine set-only radio stops drawn from MARK_STOPS, which contains no "unmarked"
      sentinel. As a React controlled component (checked={value === stop}, onChange emitting
      only `stop`), it cannot return `undefined` to its parent under any interaction.
  (2) app/src/ui/RecipePage.jsx handleChangeTastingMark (lines 285-287) can only write a key
      into draft.marks; it has no delete branch, so the draft state cannot represent the
      transition back to absent even if the control could request it.

  The upstream cause: the design contract fixed only the setting behaviours. D-16 and the
  confirmed surface brief §6 both say "arrow keys move a half step, one click sets" and "any
  axis may stay unmarked" — the latter describing the untouched default, never a reversal. No
  artifact in .planning/ or product-requirements/ contains un-mark, clear-a-mark, or deselect
  language. 02-RESEARCH.md then selected native grouped radios (Pattern 3) precisely because
  they satisfy every behaviour D-16 listed for free; the pattern's one-way-latch property was
  inherited silently, was never surfaced as a tradeoff, and was recorded at build time as a
  deliberate decision (02-03-SUMMARY.md:201) on the accurate observation that nothing required
  otherwise. Verification checked the property that WAS specified (no default checked) and
  passed; with zero component tests and a node-default Vitest environment, no gate could have
  caught it.

  Aggravating consequence, worth carrying into the fix's priority: because isTastingSaveable
  flips true on the first mark key and TastingForm has no Cancel control (same family as gap
  G-02-4), a single misclick permanently enables "Save tasting", permanently removes the
  explanatory hint, and leaves reloading — which discards the whole draft through the
  beforeunload warning — as the only escape. AxisMark is also the only one-way control in the
  pen layer; the step-strike is a freely-toggled checkbox and every other field is clearable.

fix: (not applied — goal: find_root_cause_only)
verification: (not applied)
files_changed: []
