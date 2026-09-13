---
phase: quick-260912-vni
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md
  - .claude/skills/sketch-findings-sprinkles/SKILL.md
  - .planning/ROADMAP.md
autonomous: true
requirements: [SKETCH-007-STRUCTURAL-CONTRACT]
user_setup: []

estimate:
  tokens: 48000
  raw_tokens: 32000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "A Phase 03.3.1 plan task can cite a named section of the structural contract and receive the verbatim labels, units, placeholders, aria-labels, option lists, toast strings, save labels, undo rules, tab-order rules, and responsive numbers it needs, without opening the sketch HTML."
    - "Every caption the sketch carries in a class=\"lbl\" span appears verbatim in the contract, as do the six AXES rows with their anchor words, the three segmented option lists, and the five chips (four universal plus the declared Bitter chip)."
    - "The save matrix names the exact control set and labels for each tasting state (section absent, section open, always-visible mode) and records the state-based label rule — labels never sniff field values."
    - "The feedback and undo section carries every status string verbatim with its target element, the five-second guarded self-clear, the removal path matrix (empty vs data, visible vs hidden), and the undo placement, retirement-scope, and restore rules."
    - "The keyboard section states the per-arrangement axis DOM orders (row-major flat: Hardness, Scoopability, Body, Smoothness, Sweetness, Oil; grouped stacked: core then declared) and the roving-focus radio behavior."
    - "The responsive ladder states the numbers: side-by-side split holds to 768px, steps down below 760px, stops 34x32 on the 186px track growing to 40x44 on the 216px track, 44px minimum heights below 760px, the 600px tweaks, pen width 640px."
    - "A where-sources-disagree section records the HTML-wins reconciliations, and the deferred section carries every recorded-not-built item for the phase plan."
    - "The ROADMAP's Phase 03.3.1 notes carry the one added citation sentence and no other roadmap text changed; the SKILL.md index row points at the new file."
  artifacts:
    - .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md
    - .claude/skills/sketch-findings-sprinkles/SKILL.md
    - .planning/ROADMAP.md
  key_links:
    - "the contract file -> ROADMAP Phase 03.3.1 Phase notes: the appended sentence names the contract's path and requires per-task citation plus browser conformance checks"
    - "the contract file -> SKILL.md findings index: the batch-record row's Reference cell names the contract so the skill auto-load surfaces it"
    - "each contract section -> its derivation source: the sketch HTML's line anchors and the README's named rounds, so a checker can re-trace any value"
---

<objective>
Write the self-sufficient structural contract for sketch 007's settled full-battery record pen —
one reference file the Phase 03.3.1 planner, its task executors, and the checker read INSTEAD OF
the 33KB sketch HTML — and amend the 03.3.1 roadmap notes to require citing it per task.

Purpose: during Phase 03.3, plans worked because each task embedded the sketch's relevant
fragment verbatim. For 03.3.1 the planner would otherwise re-derive the structure from the HTML
and its README, and paraphrase-of-paraphrase executor fragments are where implementation fights
start. The contract ends that: every string, order, number, and lifecycle rule in one citable file.

Output: `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md`
(sibling of the existing `batch-record-tasting-battery.md`, which stays as-is), one appended
sentence in ROADMAP.md's Phase 03.3.1 Phase notes, and an extended SKILL.md index row.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md
@.planning/sketches/007-full-battery/index.html
@.planning/sketches/007-full-battery/README.md
@.claude/skills/sketch-findings-sprinkles/SKILL.md
@.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery.md
@.planning/ROADMAP.md
</context>

<interface_context>
Facts established by reading the sources before planning — treat these as given, do not
re-derive them:

- The deliverable's directory: the goal text says `reference/` singular, but the sibling file
  `batch-record-tasting-battery.md` lives in `.claude/skills/sketch-findings-sprinkles/references/`
  (plural). Write the contract to `references/batch-record-tasting-battery-structure.md`. The
  sibling findings file stays exactly as it is.
- The sketch HTML is `.planning/sketches/007-full-battery/index.html`, 615 lines. Its `#variant-nav`
  toolbar, the 100px ruler, the variant A/C switch, the Axes 1/2/3-column buttons, and the
  Tasting always-visible/hidden switch are SKETCH CHROME — comparison devices, not the design.
  The settled state they select is: variant A, 3 columns, hidden tasting — applied by the init
  calls at lines 608-610 (`setCols(3)`, `setVariant('A')`, `setTastingMode('hidden')`).
- The AXES array sits at lines 312-319, six rows: Hardness soft/right/hard; Scoopability
  crumbly/right/gummy; Smoothness grainy/right/smooth; Sweetness less/right/more; Body
  thin/right/heavy; Oil faint/right/strong. Index 4 (Body) and 5 (Oil) are the declared pair.
- Section headings: "Batch — churned" (line 207) and "Tasting · optional" with helper
  "— leave anything you did not record blank" (line 245). Churn labels (209-235): Churn date
  (type=date, sketch value 2026-08-02 — the working case's real date in the depiction, not a
  default), Time to draw temp. (unit min), Out of machine (unit °C), Churn duration (unit min),
  Exit consistency, Airiness (estimated), At the machine (textarea, no placeholder), Ingredient
  notes (textarea, placeholder "e.g. oil bottle opened 24 Jul"). Segmented options: seg-exit
  (Smooth ribbon / Wet, soupy / Chunky, separated), seg-overrun (Low, dense / Medium, standard /
  High, airy), seg-melt (Watery, weeping / Creamy puddle / Stable foam), wired with their
  radiogroup aria-labels at line 593.
- Tasting labels (251-298): Tasted (type=date), Tempering (unit min), Tasting temperature
  (unit °C), How did it turn out? (placeholder "e.g. flavor, texture, anything that stood out"),
  Melt test (optional) (unit "g lost at 20 min"), Melt style (optional), and the shared Next time
  (placeholder "optional — for the batch, the tasting, or both"). Note the DOM order inside
  #tasting-body (variant A): field-row, note-block, texture-block, melt-block — the note sits
  before the axes.
- Defect chips (lines 272-278), comma-worded in the HTML: "Coarse, icy", "Sandy, gritty",
  "Gummy, elastic", "Greasy film", plus the declared chip "Bitter" with a visible
  "· declared" helper suffix and aria-label "Declared for this recipe: Bitter"
  (class declared-flaw, trailing the row after a wider gap). The group's aria-label is
  "Any problems? Select all that apply"; the caption row reads "Any problems?" with a lowercase
  helper "select all that apply" beside it.
- The declared cue (line 399, inside the axis render for index 4): a caption-face "Declared for
  this recipe" line inside Body's box, above its head — right of the vertical hairline in
  3-column mode, under the horizontal rule when stacked.
- Behavior functions and their line anchors: renderAxes 386-416 (flat 3-column DOM order
  [0,1,4,2,3,5] = Hardness, Scoopability, Body, Smoothness, Sweetness, Oil with a positioned
  hairline; stacked DOM = axes-core [0,1,2,3] then axes-declared [4,5]; marks carried across
  re-renders keyed by the axis name span's id; calls forgetUndo on every re-render);
  wireRadioGroup 346-365 (role=radiogroup/radio, aria-checked, roving tabIndex — first button
  tabbable when nothing selected; Arrow keys, Home, End move and select with wrap; an
  `inTasting` guard scopes undo retirement to tasting-side groups); updateAxisState 375-381
  (state text "(Not recorded)" unmarked, "(N)" marked, Clear button hidden until marked);
  clearAxis 367-373 (announces the axis name plus " cleared.", returns focus to the first stop);
  removeTasting 513-549 and undoTasting 550-565 (the removal/undo lifecycle, below);
  updateSaveLabel 505-508 (keys on closed = hidden mode and section not open — never sniffs
  values); renderTastingVisibility 493-504 (toggle button text: "Remove tasting" in hidden
  mode, "Clear tasting" in always-visible; hides #churn-saves when closed; shows/hides
  Add tasting); placeUndo 487-492 (Undo lives in the tasting head slot while the section is
  visible, moves to the footer slot when the section is absent; the button is static in the
  head slot in the markup so init never finds it missing); previewSave 571-590 (number
  validation); announceTransient 325-331 (toast, self-clears after five seconds, guarded so it
  never wipes a newer message); resizeNote 509-512 and dir="auto" on textareas (line 604).
- Status strings (verbatim, with targets): "Nothing recorded to clear." to tasting-status
  (empty, visible mode, section stays); "Tasting removed." to form-status (empty, hidden mode —
  collapse, focus Add tasting, no undo); "Tasting removed. You can undo this." to form-status
  (data, hidden mode); "Tasting cleared. You can undo this." to tasting-status (data, visible
  mode, focus the Undo); "Tasting restored." to tasting-status after undo (which reopens the
  section in hidden mode, restores fields and selections, focuses the Clear/Remove control, and
  hides itself); the axis Clear announces "{Axis name} cleared." to form-status. Retirement of
  the undo: any edit inside #tasting-body — inputs, textareas, radio groups, chips, axis Clear
  — never a churn-section or Next-time edit. Adding a tasting writes no announcement at all
  (the section opening and the focus on the Tasted date are the evidence); the status is
  cleared instead so a stale removal toast cannot linger.
- Sketch-only save announcements (lines 238, 302, 588-589: "This is a sketch. Your entries have
  been kept; nothing was saved.", "Sketch preview checked. Nothing has been saved; your entries
  remain here.") are preview artifacts of the sketch, not strings to build; record them as such.
  The two field-error strings ARE design content: "Enter a temperature, such as −6, or leave
  blank." for °C fields and "Enter zero or a positive number, or leave blank." for all other
  numeric fields — malformed values stay in place with aria-invalid, a .field-error line wired
  by aria-describedby, focus moving to the first invalid field, and the status reading
  "Check the marked measurements. Your entries have been kept."; decimal point and comma both
  accepted, a Unicode minus (−) normalized, negatives rejected except on °C fields, blank
  always allowed (previewSave, lines 571-590).
- Save/save-pair states: with the tasting section absent — churn saves row hidden, footer reads
  Cancel | Save batch | Add tasting (plus the undo footer slot when an undo is pending); with
  the section open — churn row reads Cancel | Save batch only, footer reads Cancel |
  Save batch & tasting. In always-visible mode the churn row stays and the footer label is
  fixed at "Save batch & tasting". Each pen ceremony carries Cancel first.
- Responsive ladder (media blocks 63-67, 110-114, 134-139, 173-180): desktop 3-column pen is
  640px wide, stops 34x32 on a 186px track (5x34 + 4x4); the side-by-side core/declared split
  holds to 768px (browser-verified); below 760px the 3-column mode steps down — axes collapse
  toward one column, groups stack on a horizontal rule, stops grow to 40x44 on a 216px track
  (5x40 + 4x4) with anchors re-aligned, and chip toggles, segmented options, text controls,
  .btn, and .ink-field all take min-height 44px; a 600px block tweaks frame padding, field-row
  label widths, field font sizes, and lets the saves rows wrap. A matchMedia listener on
  (max-width: 760px) re-renders the axes on crossing. 393px shows zero horizontal overflow
  (verified).
- Where sources disagree — the HTML wins and the contract must note each: (1) Tempering sits in
  the TASTING field-row in the settled HTML (line 253), while the findings file's field list and
  the ROADMAP's phase notes both place "tempering time" among the churn-phase fields; (2) the
  chips read with commas ("Coarse, icy") where the findings file paraphrases with ampersands
  ("coarse & icy"); (3) the findings file's CSS block shows stop height 24px, but the settled
  HTML renders stops 34x32 on desktop (hardening pass raised the height, line 121) and 40x44
  below 760px; (4) the README's eighth round mentions "a new ≤720px rule that stacks the axis
  groups" but the shipped HTML's step-down rule is @media (max-width: 760px) with no 720px
  block anywhere — 760 is the threshold; (5) the findings file's churn field list omits
  "At the machine" and "Ingredient notes" entirely — the inventory must carry them.
- The two P3s the ROADMAP carries (drop the underline on filled controls; name the two Cancels'
  scopes) come from README round 7; round 8 updated the carried list to three further P3s (undo
  adjacency in the wrapped head; visible words for intermediate stops; data-based undo that
  survives resize). Both lists are recorded, not built — the contract's deferred section carries
  all of them plus the persistence contract for the two save scopes, the matchMedia-under-
  emulation caveat, the read-view summary line ("Soft (2) · grainy · bitter" — the batch READ
  view's, not the pen's), the closed goldilocks-vs-descriptive-anchors question with
  Scoopability's anchor wording riding it, and the flagged revisit of the removed
  "as expected, nothing to note" shortcut.
</interface_context>

<tasks>

<task type="auto">
  <name>Task 1: Write the structural contract the 03.3.1 planner, executors, and checker cite instead of the sketch</name>
  <files>.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md</files>
  <read_first>.planning/sketches/007-full-battery/index.html (whole file, 615 lines — every verbatim string comes from here), .planning/sketches/007-full-battery/README.md (whole file — the eight rounds' settled decisions), .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery.md (the sibling findings file whose disagreements get recorded)</read_first>
  <action>
    Create the contract as a self-sufficient markdown reference. Derive every value from the
    sketch HTML and cross-check behaviors against the README's rounds and the findings file;
    never paraphrase a label, never invent a field or option, and where sources disagree the
    HTML wins with the disagreement recorded. The file documents STRUCTURE, TEXT, GEOMETRY, and
    BEHAVIOR — visual face and colour stay with DESIGN.md and the sibling findings files, and
    the contract says so once in its preamble. Carry the sketch's AXES array verbatim as a
    fenced code block; carry short verbatim strings inline in quotation marks.

    Structure the file with exactly these named sections, in this order, so plan tasks can
    cite them by name:

    1. "How to cite this contract" — a short header for planners, executors, and checkers:
       cite this file's section names plus the verbatim strings each task needs, per task;
       never defer to the sketch HTML; checkers verify the built record against this file in
       the browser. State that this file supersedes the sketch HTML as the reading surface and
       that the sibling findings file (`batch-record-tasting-battery.md`) carries the validated
       design decisions and CSS patterns this contract does not repeat.
    2. "Settled defaults" — variant A (note before Texture & flavor), 3-column axes, hidden
       tasting as the primary mode; the initial closed state (all fields blank, churn date
       blank in the app — the sketch's 2026-08-02 is the working case's real date in the
       depiction only; footer Cancel | Save batch | Add tasting; empty status; Undo hidden);
       the sketch chrome list that is NOT the design (variant nav and its toolbar, the 100px
       ruler, the column/variant/tasting-mode switches, the two save-preview announcements).
    3. "DOM order inventory" — the pen top to bottom as the settled DOM reads: Batch — churned
       section (its full field list with units and placeholders, the two segmented controls
       with all nine option words, the two textareas, the Cancel | Save batch only row); the
       Tasting section head (heading, "· optional", the leave-blank helper, the tasting-status
       live region, the Undo control, the Clear tasting/Remove tasting control); the tasting
       field-row (Tasted, Tempering, Tasting temperature); the note block (How did it turn out?
       with its neutral placeholder); the texture block (axes, then Any problems? with the
       five chips); the melt block (Melt test (optional) with its unit, Melt style (optional)
       with its options); the shared Next time label (and that no section-break rule sits above
       it — its own underline is the only rule, the double-separator fix); the form-status live
       region; the footer saves row. Mark which live regions are aria-live polite.
    4. "Axes spec" — the AXES array verbatim (all six rows); the 5-stop markup per axis: stop
       buttons carrying their digits 1-5 with aria-label "{n}: {word}" where the five words are
       the low anchor, "leaning {low}", "right", "leaning {high}", the high anchor; the anchors
       row showing only the three anchor words, space-between on the track width, aria-hidden;
       the inline state text "(Not recorded)" unmarked and "(N)" marked beside the axis name;
       the per-axis Clear text control (aria-label "Clear {name}", hidden until marked, returns
       focus to the scale and announces "{Axis name} cleared."); click-the-same-stop-again
       clears; the core/declared split (core: Hardness, Scoopability, Smoothness, Sweetness;
       declared: Body, Oil), the vertical hairline in 3-column mode with the "Declared for this
       recipe" caption inside Body's box, the horizontal rule when stacked; no defaults on load.
    5. "Controls spec" — the three segmented controls with their group aria-labels and options
       verbatim; the five chips verbatim with the Bitter chip's "· declared" suffix and full
       aria-label, and the group aria-label; the date and numeric fields (inputMode decimal,
       blank allowed, decimal point and comma accepted, Unicode minus normalized, negatives
       rejected except on °C fields, the two error strings verbatim, aria-invalid plus
       describedby error line, focus on the first invalid field, malformed values stay in
       place); the textareas (notes grow with content, dir auto so RTL and multilingual text
       behave, placeholders verbatim); the blank-stays-blank rule (nothing pre-picked;
       click-again clears any stop, option, or chip).
    6. "Save and save-pair matrix" — a table of the three tasting states (section absent,
       section open, always-visible mode) against the churn row's controls, the footer's
       controls, and each control's exact label in that state, including where the Undo trails;
       the state-based label rule (the footer label keys on whether the tasting section is on
       the page, never on whether tasting fields hold values — an empty-but-visible tasting
       does not relabel the footer); Cancel first in both ceremonies; Add tasting focuses the
       Tasted date.
    7. "Feedback and undo lifecycle" — every status string from interface_context with its
       target element (tasting-status beside the action vs form-status at the foot), the
       five-second guarded self-clear, the removal path matrix (empty vs data crossed with
       visible vs hidden mode, naming focus, toast, and whether an undo exists on each of the
       four paths), the undo's placement rule (head slot while visible, footer row when
       absent, static button so init never crashes), the retirement scope (tasting edits only,
       never churn or Next-time edits, radios and chips included), retirement on re-render
       (captured references go stale), and the restore sequence.
    8. "Keyboard and tab order" — the two axis DOM orders verbatim (row-major flat for the
       3-column arrangement with the hairline between columns 2 and 3; core-then-declared
       grouped containers when stacked), the rule that one DOM order cannot serve both so the
       axes re-render per arrangement (a matchMedia listener on the 760px boundary), marks
       carried across re-renders keyed by axis id; the roving radio contract (radiogroup/radio
       roles, aria-checked, one tab stop per group, Arrow keys and Home and End move and
       select, click-again clears); chips as native toggle buttons with aria-pressed and the
       bold-plus-underline pressed affordance; the focus landings after add, clear, remove,
       and undo.
    9. "Responsive ladder" — the numbers as verified: pen 640px; 3-column side-by-side split
       holds to 768px; below 760px the step-down (single-column axes, groups stacked on the
       horizontal rule, auto-fit collapsing groups once two 280px columns no longer fit);
       stops 34x32 desktop on the 186px track growing to 40x44 on the 216px track below 760px
       with anchors re-aligned; 44px minimum heights below 760px on chips, segmented options,
       text controls, .btn, and .ink-field (buttons and ink fields added in the eighth round);
       the 600px block; zero horizontal overflow at 393px; desktop untouched at 768px.
    10. "Where sources disagree (HTML wins)" — the five reconciliations from interface_context,
        each stating what the findings file or README says, what the settled HTML says, and
        that the HTML governs.
    11. "Deferred to the phase plan (recorded, not built)" — the full carried list from
        interface_context's last bullet, each as one line a plan task can lift.
    12. "Origin" — derived from the sketch HTML (path), the README's eight rounds (dated
        2026-09-11/12), and the sibling findings file; written 2026-09-12 for Phase 03.3.1.

    Keep every string byte-identical to the HTML — punctuation, capitalization, ellipses,
    en/em dashes, and the degree sign included. Do not invent fields, options, states, or
    behaviors; if the HTML and README leave something genuinely undecided, list it under the
    deferred section rather than resolving it.
  </action>
  <verify>
    <automated>C=.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md; S=.planning/sketches/007-full-battery/index.html; fail=0; for s in "['Hardness', 'soft', 'right', 'hard']" "['Scoopability', 'crumbly', 'right', 'gummy']" "['Smoothness', 'grainy', 'right', 'smooth']" "['Sweetness', 'less', 'right', 'more']" "['Body', 'thin', 'right', 'heavy']" "['Oil', 'faint', 'right', 'strong']" "Smooth ribbon" "Wet, soupy" "Chunky, separated" "Low, dense" "Medium, standard" "High, airy" "Watery, weeping" "Creamy puddle" "Stable foam" "Coarse, icy" "Sandy, gritty" "Gummy, elastic" "Greasy film" "Declared for this recipe: Bitter" "Any problems? Select all that apply" "Save batch only" "Save batch & tasting" "Add tasting" "Remove tasting" "Clear tasting" "Undo clear tasting" "Nothing recorded to clear." "Tasting removed. You can undo this." "Tasting cleared. You can undo this." "Tasting restored." "Enter a temperature, such as −6, or leave blank." "Enter zero or a positive number, or leave blank." "e.g. flavor, texture, anything that stood out" "e.g. oil bottle opened 24 Jul" "optional — for the batch, the tasting, or both" "leave anything you did not record blank" "(Not recorded)" "leaning" "Declared for this recipe" "select all that apply" "186" "216" "640" "760" "768" "44px" "## How to cite this contract" "## Settled defaults" "## DOM order inventory" "## Axes spec" "## Controls spec" "## Save and save-pair matrix" "## Feedback and undo lifecycle" "## Keyboard and tab order" "## Responsive ladder" "## Where sources disagree" "## Deferred to the phase plan"; do grep -qF -- "$s" "$C" || { echo "MISSING: $s"; fail=1; }; done; [ $fail -eq 0 ] && echo STRINGS-OK; grep -o 'class="lbl">[^<]*' "$S" | sed 's/class="lbl">//' | sort -u | while IFS= read -r l; do grep -qF -- "$l" "$C" || echo "MISSING LABEL: $l"; done; echo LABELS-CHECKED</automated>
  </verify>
  <done>The contract file exists with all twelve named sections; the string gate prints STRINGS-OK (every required verbatim string present); the label gate prints LABELS-CHECKED with no MISSING LABEL lines (every caption in the sketch's lbl spans appears in the contract); the six AXES rows, the nine segmented options, the five chips, all toast and error strings, both footer save labels, the churn-row label, the undo control text, and the ladder numbers are byte-identical to the sketch HTML; the where-sources-disagree section records the five reconciliations.</done>
</task>

<task type="auto">
  <name>Task 2: Point the roadmap and the skill index at the contract</name>
  <files>.planning/ROADMAP.md, .claude/skills/sketch-findings-sprinkles/SKILL.md</files>
  <read_first>.planning/ROADMAP.md lines 294-301 (the Phase 03.3.1 entry — Goal, Requirements, Phase notes), .claude/skills/sketch-findings-sprinkles/SKILL.md (the findings index table)</read_first>
  <action>
    Two scoped edits, nothing else.

    In .planning/ROADMAP.md, append exactly one sentence to the end of Phase 03.3.1's
    **Phase notes** paragraph (the entry inserted at line 294; its Phase notes paragraph ends
    with the UX1-01–UX1-03 sentence). The sentence, lightly adjustable to flow with the
    surrounding prose but carrying both obligations: the phase plan must cite the structural
    contract `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md`
    in every task — verbatim fragments by section name, never a pointer back to the sketch
    HTML — and verify the built record's conformance in the browser against that contract.
    Touch no other roadmap text: not the Goal, Requirements, Scope bullets, or any other
    phase's entry.

    In .claude/skills/sketch-findings-sprinkles/SKILL.md, extend the "Batch record & tasting
    battery" row's Reference cell in the findings index table to name both files — the existing
    findings file and the new structural contract at
    `references/batch-record-tasting-battery-structure.md` — keeping one row per design area.
    Change nothing else in SKILL.md.
  </action>
  <verify>
    <automated>grep -c "batch-record-tasting-battery-structure" .planning/ROADMAP.md .claude/skills/sketch-findings-sprinkles/SKILL.md && git diff --numstat -- .planning/ROADMAP.md .claude/skills/sketch-findings-sprinkles/SKILL.md && git status --porcelain</automated>
  </verify>
  <done>ROADMAP.md's Phase 03.3.1 Phase notes carry the citation sentence naming the contract file and the browser-conformance obligation; git shows the ROADMAP diff confined to that one paragraph and SKILL.md changed only in the index table's batch-record row; no other file under .planning or the skill directory moved.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (none new) | Documentation only: a new reference markdown under the skill directory, one sentence in the roadmap, one index-table cell. No code, no handler, no store read/write, no network path. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-QVNI1-01 | Tampering | the contract's verbatim strings | medium | mitigate | Task 1's verify gate greps every required string and every lbl-derived caption against the contract, so a paraphrased or dropped label fails the run instead of reaching the 03.3.1 planner |
| T-QVNI1-02 | Tampering | .planning/ROADMAP.md | low | mitigate | Task 2's action scopes the edit to one appended sentence in the 03.3.1 Phase notes and its verify inspects the numstat and porcelain status to prove no other roadmap text moved |
| T-QVNI1-SC | Tampering | package installs | high | mitigate | No package installs occur in this plan — no npm/pip/cargo dependency is added or updated, so the package-legitimacy gate has nothing to check |

(No information disclosure, denial-of-service, elevation, or repudiation surface exists in scope: the change writes planning and skill documentation only. Security enforcement active at ASVS level 1, block-on high — nothing here crosses a trust boundary or handles untrusted input.)
</threat_model>

<verification>
- Task 1's string gate prints STRINGS-OK: every enumerated verbatim string, all twelve section headers, and the ladder numbers appear in the contract.
- The label-coverage gate prints LABELS-CHECKED with zero MISSING LABEL lines: every caption in the sketch's lbl spans is in the contract verbatim.
- The contract's where-sources-disagree section carries the five HTML-wins reconciliations (Tempering's section, chip commas, stop heights, the 720px-vs-760px mention, the omitted churn textareas).
- The deferred section carries the two ROADMAP P3s, the three eighth-round P3s, the persistence contract, the undo-resize edge, the matchMedia caveat, the read-view summary line, the closed anchors question, and the removed-shortcut revisit.
- Task 2's git checks show the ROADMAP diff confined to the one sentence in Phase 03.3.1's Phase notes and SKILL.md changed only in the index table row.
</verification>

<success_criteria>
- `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md` exists, is self-sufficient (a planner, executor, or checker needs no other sketch artifact to build or check a task), organized under the twelve citable section names, with every string byte-identical to the settled sketch HTML.
- The sibling findings file `batch-record-tasting-battery.md` is untouched.
- ROADMAP.md's Phase 03.3.1 Phase notes require per-task citation of the contract and browser conformance verification against it; no other roadmap text changed.
- SKILL.md's batch-record row points at both reference files.
</success_criteria>

<output>
Create `.planning/quick/260912-vni-sketch-007-structural-contract-write-the/260912-vni-SUMMARY.md` when done
</output>
