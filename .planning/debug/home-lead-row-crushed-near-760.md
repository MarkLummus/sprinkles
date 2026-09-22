---
status: diagnosed
trigger: "at 760px width, the lead row is unusable due to compression of name column and Next time column while action button stay on a single line centered in the row - need to adopt iPhone layout ealier in responsive ladder"
created: 2026-09-22T00:00:00Z
updated: 2026-09-22T00:00:00Z
---

## Current Focus

bug_class: Bohrbug — deterministic, reproduces at every load at a given viewport width; pure CSS layout arithmetic, no timing or state involved.

hypothesis: The lead is a single-line flex row with no stack step between 760px and infinity. Its two text columns are `flex: 1 1 0` (base size 0) while `.home__lead .home__actions` is `flex: 0 0 auto` (base size = max-content, never shrinks). So the two columns divide only the space the actions leave over, and that residue goes to zero in the 760-900px band once the 224px rail and the two page/block paddings are taken out. Confirmed by measurement, arithmetic exact to 0.01px.

reasoning_checkpoint:
  hypothesis: "The lead's two text columns get `(main - 96 page pad - 42 lead pad/border - 8 rod - 60 col-gaps - A) / 2` where A is the actions' immovable max-content width; with A = 219.17px (TASTED) each column is 55.4px at 760px, and with A = 343.59px (AWAITING_TASTING) each column is 0px at 760px. No stack step exists between 760px and infinity, so the crush band is 760px-~1100px."
  confirming_evidence:
    - "Measured in Chrome against the running dev server: at 760px identity = 55.41px and next = 55.42px (TASTED), and identity = next = 0px (AWAITING_TASTING)."
    - "Predicted column width from the arithmetic matches the measured value exactly at every width tested (760/820/900/1000/1100/1200/1440), residual < 0.01px."
    - "The actions block measures 219.17px at EVERY width from 760 to 1440 — it never shrinks, confirming flex-shrink: 0 is what starves the columns."
    - "home.css carries exactly one @media block, `(max-width: 759.98px)`; home.test.js:51 asserts that is the only condition in the file — so no stack step above 760px exists by construction."
  falsification_test: "If the columns were starved by something other than the actions' fixed basis, then removing the actions from the flex row would not restore them. Measured the no-Next-time case (3 children instead of 4): identity jumps from 55.41px to 130.83px at 760px — exactly the 55.4 + 55.4 + 20 gap the fourth column was consuming. The actions' basis is the starving term."
  fix_rationale: "The fix must introduce a stack step for the lead above 760px, because no distribution of a ~330px residue between two text columns and a 219-344px action block is readable. Reflowing within the row (min-widths, wrapping the actions) is the alternative, but Mark's ruling names the remedy: adopt the stacked (phone) form earlier on the ladder."
  blind_spots: "Measured in Chromium-family Chrome at deviceScaleFactor 1 with the seeded recipe name 'Olive Oil Ice Cream' (name max-content 244.9px) and one 48-character Next time note. A longer name or note makes the crush worse, not better, so the threshold derived here is a floor. Not measured on WebKit or on Mark's iPad (1366 coarse, above the crush band, so unaffected)."
  candidate_causes:
    - "code/CSS: `.home__lead .home__actions { flex: 0 0 auto }` gives the actions an immovable max-content basis while the two text columns get `flex-basis: 0` (category: code)"
    - "code/CSS: the responsive ladder has no lead-specific stack step above 759.98px, so the row form is asked to hold at every width from 760 up (category: config — the breakpoint ladder)"
    - "data: the recipe name and the Next time note are real content whose min-content (85.9px for the name) exceeds the box it is given, so the crush is literal overflow, not just tight wrapping (category: data)"
    - "environment: the 224px desktop nav rail is still shown at 760-1000px, taking 29%-22% of the viewport before the page's own 48px gutters (category: environment/layout context)"
  and_gate: "YES — this needs more than one condition at once. The AND is: (1) the 224px rail plus two 48px page gutters plus 42px of lead padding/border remove 314px before any column is laid out, AND (2) the actions' flex-shrink: 0 claims 219-344px of what is left, AND (3) no stack step exists in that band. Remove any one and the row is usable: hide the rail and 760px yields 279px columns; let the actions wrap and the columns get 219px back; add the stack step and the columns get full width. That is why the single-cause reading ('the actions are too wide') would under-fix."

test: [complete] candidate-threshold check — injected a 1099.98px stack block at runtime and re-measured
expecting: [met] full-width columns, name on one line, note on one line at every width in the crush band
next_action: [none — goal is find_root_cause_only; hand the diagnosis back for a fix plan. No fix applied, nothing committed.]

## Symptoms

expected: Readable name and Next time columns at every width; the lead stacks before its columns become unusable.
actual: At 760px the lead row's name column and Next time column are crushed while the two action buttons stay on one centred line.
errors: None reported.
reproduction: Load Home at ~760-900px wide with a recipe whose newest batch carries a Next time note so the Next time column renders. Test 6 note in .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-UAT.md (gap G-03.4-6).
started: Discovered during 03.4 UAT on 2026-09-22.

## Eliminated

## Evidence

- timestamp: 2026-09-22 (phase 0)
  checked: .planning/debug/knowledge-base.md
  found: File does not exist; no prior resolved-session patterns to match.
  implication: No known-pattern shortcut; investigate from first principles.

- timestamp: 2026-09-22 (phase 1, source read)
  checked: app/src/ui/RecipeList.jsx HomeLead (lines 98-130) and RowActions (166-206)
  found: |
    The lead renders four flex children in order — .home__rail (rod),
    .home__lead-identity, .home__lead-next (only when the newest batch
    carries churn.nextTimeNote), and <RowActions>. RowActions emits ONE
    action for NOT_YET_CHURNED, and TWO for AWAITING_TASTING ("Record a
    tasting" + "Continue developing") and for TASTED ("Next version" +
    "Adapt").
  implication: |
    The worst case for the row is a churned batch carrying a Next time
    note — which is exactly the reproduction, because the note is written
    at churn time. That case renders four children including the widest
    two-button pair.

- timestamp: 2026-09-22 (phase 1, source read)
  checked: app/src/styles/home.css lines 63-92 and the single @media block at 315-347
  found: |
    .home__lead { display: flex; align-items: center; column-gap: 20px;
    padding: 20px; border: 1px } with NO flex-wrap (computed: nowrap).
    .home__lead-identity, .home__lead-next { flex: 1 1 0; min-width: 0 }
    .home__lead .home__actions { flex: 0 0 auto }
    .home__lead .home__rail { flex-shrink: 0 }
    The file's ONE @media block is (max-width: 759.98px) — it stacks the
    lead to a column and hides the rod. There is no other width rule.
  implication: |
    The two text columns have flex-basis 0 AND min-width 0, so they claim
    nothing of their own and may be squeezed below their own min-content.
    The actions have flex-basis auto with flex-shrink 0, so they claim
    their full max-content and never yield. The row form is therefore
    asked to hold at every width from 760px to infinity.

- timestamp: 2026-09-22 (phase 1, source read)
  checked: app/src/styles/shell.css 108-131 and app/src/styles/app.css .list-page
  found: |
    .shell__rail is flex: 0 0 224px (--app-size-nav-w) and is hidden only
    below 759.98px. .list-page carries padding: var(--gap-page) =
    var(--gap-xl) = 48px, stepping to 20px only below 600px.
  implication: |
    At 760px the 224px rail plus 96px of page gutters remove 320px — 42%
    of the viewport — before the lead's own 42px of padding and border.

- timestamp: 2026-09-22 (phase 3, MEASURED — real app, Chrome, dev server at localhost:5173,
  deviceScaleFactor 1, document.fonts.ready awaited, seeded "Olive Oil Ice Cream" with a
  48-character Next time note)
  checked: rendered widths of .home__lead-identity, .home__lead-next and .home__lead .home__actions
  found: |
    TASTED ("Next version" + "Adapt"), actions = 219.17px at EVERY width:
      W      main   leadContent  identity  next    actions  nameLines  noteLines
      760    536    398          55.41     55.42   219.17   4          9
      820    596    458          85.41     85.42   219.17   3          6
      900    676    538          125.41    125.42  219.17   3          4
      1000   776    638          175.41    175.42  219.17   2          3
      1100   876    738          225.41    225.42  219.17   2          2
      1200   976    838          275.41    275.42  219.17   1          2
      1440   1216   1078         395.41    395.42  219.17   1          1

    AWAITING_TASTING ("Record a tasting" + "Continue developing"), actions = 343.59px at EVERY width:
      760    536    398          0.00      0.00    343.59   4          9
      820    596    458          23.20     23.20   343.59   4          9
      900    676    538          63.20     63.20   343.59   4          8
      1000   776    638          113.20    113.20  343.59   3          4
      1100   876    738          163.20    163.20  343.59   2          3
      1440   1216   1078         333.20    333.20  343.59   1          2

    No Next time note (3 children), TASTED:
      760    536    398          130.83    —       219.17   3          —
  implication: |
    The actions' rendered width is CONSTANT across a 680px range of
    viewport — the definitive proof that flex-shrink: 0 makes them the
    fixed term and the two text columns the residue. At 760px in the
    churned-not-yet-tasted case both text columns are literally ZERO
    pixels wide.

- timestamp: 2026-09-22 (phase 3, arithmetic confirmation)
  checked: predicted vs measured column width
  found: |
    column = (W - 430 - A) / 2, where
      430 = 224 (rail) + 96 (page gutters) + 40 (lead padding) + 2 (lead border)
            + 8 (rod) + 60 (three 20px column gaps)
      A   = the actions' max-content width (219.17 TASTED / 343.59 AWAITING)
    At 760, TASTED: (760 - 430 - 219.17)/2 = 55.415 — measured 55.41.
    At 760, AWAITING: (760 - 430 - 343.59)/2 = -6.8 — clamped to 0, measured 0.
  implication: Residual under 0.01px at every width. The mechanism is fully accounted for; nothing else contributes.

- timestamp: 2026-09-22 (phase 3, intrinsic widths)
  checked: min-content / max-content of each lead child, measured by off-screen clones
  found: |
    .home__lead-name    "Olive Oil Ice Cream"  min-content 85.9   max-content 244.9  (28px/700)
    .home__lead-meta    "Version 1 · 50 g …"   min-content 45.9   max-content 220.5
    .home__lead-place   "Notebook"             min-content 75.1   max-content 75.1
    .home__lead-caption "Next time"            min-content 35.0   max-content 71.8
    .home__lead-next-time (48-char note)       min-content 56.4   max-content 369.6  (Caveat 22px)
    .home__lead .home__actions                 min-content 90.8   max-content 219.2
  implication: |
    The identity column's min-content is 85.9px. At 760px it is given
    55.41px, so the word "Cream" physically SPILLS OUT of its box and
    overlaps the Next time column — visible in the 760px screenshot. This
    is literal overflow, not merely tight wrapping, and min-width: 0 is
    what permits it.

- timestamp: 2026-09-22 (phase 3, source inconsistency found while checking overflow)
  checked: overflow-wrap on the row's name vs the lead's name
  found: |
    .home__name (the list row, home.css:224) declares `overflow-wrap: anywhere`.
    .home__lead-name (the lead, home.css:117-123) declares NO overflow-wrap
    (computed: normal).
  implication: |
    The row's name breaks mid-word rather than spilling; the lead's name
    spills. The two names in the same file were given different wrap
    behaviour. Hardening the lead's name is a secondary fix, independent
    of the stack threshold.

- timestamp: 2026-09-22 (phase 3, legibility sweep 780→1440 in 20px steps, both standings)
  checked: first viewport width at which each legibility criterion is met in the shipped row form
  found: |
                                        TASTED    AWAITING_TASTING
      name stops overflowing its box    840px     960px
      name fits in <= 2 lines           920px     1040px
      Next time note fits in <= 2 lines 1040px    1160px
      name fits on 1 line               1140px    1280px
      note fits on 1 line               1400px    never (>1440)
  implication: |
    The shipped row form does not become legible until ~1040px in the
    case Mark reproduced and ~1160px in the worst standing. The crush band
    is not "just above 760" — it runs the whole way from 760px to roughly
    1100px.

- timestamp: 2026-09-22 (phase 3, falsification test)
  checked: remove the Next time column (3 children instead of 4) and re-measure at 760px
  found: identity goes from 55.41px to 130.83px — exactly the 55.4 + 55.4 + 20px gap the fourth child was consuming.
  implication: |
    Rules out "the columns are starved by the page gutters alone". The
    starving term is the actions' fixed basis competing with a second
    flexible column. Hypothesis survives falsification.

- timestamp: 2026-09-22 (phase 3, candidate-threshold verification — CSS injected at
  runtime via addStyleTag, NO file edited, nothing committed)
  checked: |
    injected `@media (max-width: 1099.98px) { .home__lead { flex-direction: column;
    align-items: stretch; row-gap: 12px } .home__lead .home__rail { display: none } }`
    and re-measured the same widths
  found: |
      W      shipped identity/next   candidate identity/next   candidate name/note lines
      760    55.4 / 55.4             398 / 398                 1 / 1
      820    85.4 / 85.4             458 / 458                 1 / 1
      900    125.4 / 125.4           538 / 538                 1 / 1
      1000   175.4 / 175.4           638 / 638                 1 / 1
      1090   220.4 / 220.4           728 / 728                 1 / 1
      1100   225.4 / 225.4           225.4 / 225.4 (row form)  2 / 2
    Lead height at 760px falls from 331.5px to 233.5px.
  implication: |
    Stacking below the ladder's existing 1099.98px step removes the crush
    at every width in the band, and hands the row form back at exactly the
    width where it first reads (name 2 lines, note 2 lines, 225.4px
    columns). Confirmed by screenshot at 1090px.

- timestamp: 2026-09-22 (phase 3, co-located finding — a SECOND defect in the same band)
  checked: which element overflows the page's content box at 760px and 820px
  found: |
    Not the lead. The page's horizontal overflow comes from .home__row's
    own actions in the desktop grid (grid-template-columns:
    auto 1fr 120px 132px auto):
      760px TASTED:    .home__actions overflows the page content box by 65.8px (documentElement.scrollWidth 778 vs 760)
      820px TASTED:    overflows by 5.8px
      760px AWAITING:  overflows by 90.2px (scrollWidth 802)
      820px AWAITING:  overflows by 30.2px
      900px and above: no overflow
    Present with the plain seeded data too (no Next time note): scrollWidth 778 at 760px.
  implication: |
    The rows, not only the lead, break in the 760-900px band: the row's
    fixed 120px standing and 132px tally tracks plus the actions exceed
    the 440px the grid has at 760px. Stacking the lead alone leaves this
    (measured: scrollWidth still 778 at 760px with the candidate applied).
    The fix plan must decide the rows' behaviour in the same band, or Home
    still scrolls sideways at 760px.

- timestamp: 2026-09-22 (phase 3, ladder cross-check)
  checked: DESIGN.md "The responsive ladder" (lines 348-364) and app/src/styles/app.css:2321
  found: |
    The ladder already names five blocks, and `max-width: 1099.98px` is
    one of them — "the spread collapses", from sketch 003 line 511's
    `want < 1100`. 759.98px, 600px and `min-width: 760px and (pointer:
    coarse)` are the others. DESIGN.md's Drawn-For Rule: "A rule governs
    only the case it was drawn for… When a new case appears, it gets its
    own condition — never a widened old one."
  implication: |
    1100px is an already-named step on the ladder, not a new breakpoint —
    stacking the lead there costs the project no new number. Whether the
    lead's rule joins app.css's existing 1099.98px block or takes its own
    block in home.css is a Drawn-For Rule judgement for the fix plan.

- timestamp: 2026-09-22 (phase 3, test-gate check)
  checked: app/src/styles/home.test.js
  found: |
    Line 51: test('the only @media condition in home.css is the named touch
    step-down …') asserts
      expect([...mediaConditions]).toEqual(['(max-width: 759.98px)'])
    css-source.js itself supports several top-level @media blocks per file
    (app.css carries six), so the parser is not the constraint — this
    assertion is.
  implication: |
    Adding a second @media block to home.css FAILS this test. The fix plan
    must update home.test.js:51 to name both conditions deliberately, and
    should add a positive assertion that a .home__lead rule exists under
    the new condition, so the stack step cannot be silently dropped later.

- timestamp: 2026-09-22 (phase 3, open design question measured)
  checked: what the destination rod does if the new stack step keeps it rather than hiding it
  found: |
    Stacked at 900px with the rod KEPT, the rod renders as an orphan
    8 x 56px bar on its own row above the place name, and the lead grows
    from 233.5px to 302px tall. Hiding it (as the existing 759.98px rule
    does, citing board 171) removes that.
  implication: |
    The rod cannot simply survive the stack step in its current form. The
    fix plan must choose: hide it (following the 759.98px precedent, and
    consistent with ruling 6.2's flag to revisit "the rod on all
    destination rows no matter the size"), or give the stacked lead a
    different rod treatment. This is a design decision for Impeccable, not
    something the fix should pick silently.

- timestamp: 2026-09-22 (phase 3, detail the fix plan needs)
  checked: which of the 759.98px block's rules the stacked lead depends on
  found: |
    `.home__actions { width: 100% }` and `.home__action { flex: 1 1 0 }`
    live INSIDE the (max-width: 759.98px) block and are not reached by a
    new 1099.98px step. With the candidate applied at 1090px the stacked
    lead's two buttons sat left-aligned at their natural widths
    (125.5px and 81.67px), not stretched edge to edge.
  implication: |
    That is probably the right desktop-width reading — full-width stretched
    buttons at 1090px would look wrong — but it is a choice the plan should
    make explicitly rather than inherit by omission.

## Resolution

root_cause: |
  Three conditions hold simultaneously in the 760px-1100px band, and all
  three are required to produce the failure (AND-gate: yes):

  (1) app/src/styles/home.css:63-71 — .home__lead is a nowrap flex ROW
      and app/src/styles/home.css:315 carries exactly one width step,
      (max-width: 759.98px). There is no stack step anywhere between
      760px and infinity, so the four-column row form is asked to hold at
      every width from 760px up.

  (2) app/src/styles/home.css:82-92 — the two text columns are
      `flex: 1 1 0; min-width: 0` (they claim nothing of their own and may
      be squeezed below their own min-content) while
      `.home__lead .home__actions` is `flex: 0 0 auto` (flex-basis
      max-content, flex-shrink 0 — it never yields). The columns are
      therefore the residue after the actions take their full width.
      Measured: the actions render at 219.17px (TASTED) or 343.59px
      (AWAITING_TASTING) at EVERY viewport from 760px to 1440px.

  (3) The 224px desktop nav rail (shell.css:115, --app-size-nav-w) is
      still shown at these widths, and .list-page keeps its 48px gutters
      (--gap-page = --gap-xl, stepping down only below 600px). Together
      with the lead's own 40px padding + 2px border, 8px rod and three
      20px column gaps, 430px is removed before either column is laid out.

  The resulting arithmetic is column = (W - 430 - A) / 2, A being the
  actions' immovable width. Measured, in the real app:
    760px, TASTED (the seeded recipe with a Next time note):
      identity 55.41px, next 55.42px, actions 219.17px
    760px, AWAITING_TASTING (churned, not yet tasted — the most natural
      state for a Next time note):
      identity 0.00px, next 0.00px, actions 343.59px
  At 55.41px the recipe name's min-content (85.9px) exceeds its box, so
  "Cream" physically spills across into the Next time column; the 48-char
  note renders on 9 lines of roughly one word each. The row form does not
  become legible until 1040px (TASTED) / 1160px (AWAITING_TASTING).

  Removing any one of the three conditions fixes it, which is why the
  single-cause reading ("the buttons are too wide") would under-fix.

fix: [not applied — goal: find_root_cause_only]
verification: [n/a — diagnosis only; the candidate threshold was verified by runtime CSS injection, not by editing any file]
files_changed: []
