---
status: diagnosed
trigger: "G-03-9 — The rule that only one pen is open at a time leaks in three places: adding a tasting is not treated as a pen (its controls stay enabled while developing, and Develop, Amend and Record stay enabled while a tasting is being written); and while amending a batch, the version strip still navigates to another version."
created: 2026-09-07T00:00:00Z
updated: 2026-09-07T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — there is no single "a pen is open" predicate. Openness is
  split across two independent React states in RecipePage.jsx (`mode` and
  `tastingDraft`); every disabled condition hand-rolls its own subset of those two,
  and the tasting opener has no condition at all. Separately, no in-app navigation
  guard exists, and react-router preserves RecipePage state across a param change.
test: complete — static-markup probe of BatchMargin/Headnote, plus source reading of
  RecipePage.jsx, router.jsx and react-router's _renderMatches.
expecting: n/a — diagnosis complete
next_action: return diagnosis (goal: find_root_cause_only). Do not fix.

bug_class: Bohrbug — deterministic, reproduces on every attempt, no timing component.

reasoning_checkpoint:
  hypothesis: "Three separate defects share one design omission: 'a pen is open' is
    not a derived value anywhere, so each control invents its own test; and no
    in-app navigation guard exists at all."
  confirming_evidence:
    - "Probe: BatchMargin with mode='developing' renders Add a tasting as
       <button type=\"button\">, no disabled attribute — Amend and Record another
       batch in the same markup both carry disabled=\"\"."
    - "Probe: BatchMargin with tastingDraft set renders Amend and Record another
       batch both without disabled."
    - "Headnote.jsx:203 reads disabled={mode === 'recording'}; Headnote is never
       passed tastingDraft (RecipePage.jsx:776-790)."
    - "grep for useBlocker/usePrompt/blocker across app/src returns nothing."
    - "react-router dist/development/lib/hooks.js:791 creates RenderedRoute with no
       key prop, so /recipe/A -> /recipe/B reuses the same RecipePage instance."
  falsification_test: "If BatchMargin's Add a tasting carried disabled={mode ===
    'developing'} and the probe still showed it enabled, the cause would be
    elsewhere (a prop not threaded, a stale mode). It does not — the attribute is
    simply absent from the JSX."
  fix_rationale: "n/a — diagnose-only. Fix direction is a single derived openPen
    value plus a decision on navigation, not per-control patching."
  blind_spots:
    - "No browser available; every symptom is confirmed from source and static
       markup, not from a live click. The navigation consequences (crash on save
       after amend+navigate, cross-version write after develop+navigate) are
       derived from reading handleSaveBatch/buildPenFields, not executed."
    - "jsdom is not a devDependency, so no test in this repo can currently drive a
       click or a route change — the reproduction could not be automated."
  candidate_causes:
    - "code: missing disabled condition on Add a tasting (BatchMargin.jsx:341)"
    - "code: openness modelled as two independent states, not one predicate"
    - "config/architecture: router.jsx registers RecipePage on two routes with no
       key, and no navigation blocker is installed anywhere"
    - "data: sibling versions share row ids (createChildVersion structuredClones the
       parent's rows), which is what turns navigate-while-developing from a crash
       into a silent cross-version write"
  and_gate: "YES — this is a genuine multi-cause failure. Symptom 3 (navigation)
    cannot be produced by the missing disabled attributes, and symptoms 1-2 cannot
    be produced by the routing. They are independent defects reported as one gap.
    Root cause is recorded as a set."

## Symptoms

expected: |
  Exactly one pen is open at a time. While developing, every batch-side opener
  (Record a batch, Record another batch, Amend, Add a tasting) is disabled with a
  stated reason in words. While recording, amending, or adding a tasting, "Develop
  the next version" and the other batch-side openers are disabled with a stated
  reason in words. While any pen is open, navigating away (version strip, batch
  list, running head) does not silently discard unsaved ink: either the controls
  are disabled with a reason or the leave warning fires (03-CONTEXT D-10).
actual: |
  User reported: "when developing, the batch controls are disabled, but the add
  tasting controls are not disabled. Develop button is disabled when Amending or
  Batch Recording, but not when Adding a tasting. Amend and Batch recording buttons
  are also enabled while adding a tasting. I was able to select another version
  while amending."
errors: None reported by the user. Two latent throws found by reading (Evidence 9).
reproduction: |
  Test 9 in UAT — on /recipe/olive-oil-ice-cream-v1:
  (1) click Develop the next version, look at Add a tasting in the margin;
  (2) cancel, click Add a tasting, look at Develop, Amend and Record another batch;
  (3) click Amend, then click another version in the version strip.
started: |
  Discovered during Phase 3 UAT on 2026-09-07. Batch pen (record, amend) and the
  tasting form built in Phase 2 (BatchMargin.jsx, RecipePage.jsx mode state);
  plan 03-01 added the `developing` mode and disabled batch-starting controls in
  BatchMargin while developing (Rule 2 deviation in 03-01-SUMMARY.md); plan 03-03
  added VersionStrip.jsx and the Headnote's Develop control.

## Eliminated

- hypothesis: "The tasting opener has a disabled condition but the mode prop is not
    reaching it / is stale."
  evidence: "BatchMargin.jsx:341 is `<button type=\"button\" ref={addTastingButtonRef}
    onClick={onStartTasting}>` — there is no disabled prop in the source at all.
    `mode` does reach BatchMargin and does correctly disable Amend (line 296) and
    Record another batch (line 318) in the same render branch."
  timestamp: 2026-09-07

- hypothesis: "Amending uses a mode value the Develop button does not know about
    (e.g. mode === 'amending'), which is why Develop leaks."
  evidence: "RecipePage.jsx:102 declares mode as 'reading' | 'recording' |
    'developing' only; handleStartAmending (line 402) sets mode='recording' and
    distinguishes amend from record via a separate amendingBatchId. Develop's
    disabled={mode === 'recording'} therefore does cover amending — matching the
    user's report that Develop IS disabled while amending. Amending is not the leak;
    the tasting draft is."
  timestamp: 2026-09-07

- hypothesis: "The beforeunload leave warning should have fired on the version-strip
    click and a bug stopped it."
  evidence: "beforeunload only fires on document unload. VersionStrip.jsx:29 uses
    react-router's <Link>, which is client-side history navigation — the document
    never unloads, so beforeunload is not merely failing here, it is structurally
    the wrong mechanism for in-app navigation. The correct mechanism (useBlocker) is
    absent from the codebase entirely."
  timestamp: 2026-09-07

## Evidence

- timestamp: 2026-09-07
  checked: ".planning/debug/knowledge-base.md and .planning/debug/resolved/"
  found: "Neither exists. Seven prior unresolved debug files sit in .planning/debug/,
    one of which — pen-layer-no-cancel-save-hard-to-find.md — is cited in
    RecipePage.jsx:460 as the source of the distinction between the in-app
    abandonment path and the beforeunload warning."
  implication: "No prior-pattern shortcut available; the cited prior session shows
    the in-app/unload distinction was already understood for cancel, but was never
    carried to navigation."

- timestamp: 2026-09-07
  checked: "BatchMargin.jsx:341 — the Add a tasting control"
  found: "`<button type=\"button\" ref={addTastingButtonRef} onClick={onStartTasting}>
    Add a tasting</button>` — no disabled prop. Its two siblings in the same branch,
    Amend (line 296) and Record another batch (line 318), both carry
    disabled={mode === 'developing'}."
  implication: "SYMPTOM 1 root cause, directly. Plan 03-01's Rule 2 deviation added
    the disabled condition to the three batch-starting controls it enumerated
    (record / record another / amend) and did not enumerate the tasting opener."

- timestamp: 2026-09-07
  checked: "Static-markup probe (throwaway vitest file, since removed): BatchMargin
    rendered with mode='developing', openBatch=augustSecondBatch"
  found: |
    DEVELOPING/Amend          : <button type="button" disabled="">Amend</button>
    DEVELOPING/Record another : <button type="button" disabled="">Record another batch</button>
    DEVELOPING/Add a tasting  : <button type="button">Add a tasting</button>
  implication: "Symptom 1 confirmed by direct observation, not inference."

- timestamp: 2026-09-07
  checked: "Same probe: BatchMargin rendered with mode='reading' and a non-null
    tastingDraft (the tasting pen open)"
  found: |
    TASTING/Amend             : <button type="button">Amend</button>
    TASTING/Record another    : <button type="button">Record another batch</button>
    (the one .batch-margin__hint present is TastingForm's own
    'Write words or mark at least one axis to save.' — a save gate, not a one-pen
    reason)
  implication: "SYMPTOM 2 (batch half) confirmed. Both conditions read only `mode`,
    and the tasting pen is not represented in `mode`."

- timestamp: 2026-09-07
  checked: "Headnote.jsx:203 and the props RecipePage passes it (RecipePage.jsx:776-790)"
  found: "`disabled={mode === 'recording'}`. RecipePage passes version, mode, draft,
    penDraft, openBatch, batches, citedBatch, parentVersion, showingChanges,
    blockedMessage and handlers — `tastingDraft` is not among them."
  implication: "SYMPTOM 2 (Develop half) root cause. The Headnote physically cannot
    know a tasting is being written; the prop is not threaded."

- timestamp: 2026-09-07
  checked: "RecipePage.jsx:98-119 — the state declarations, and their comments"
  found: |
    const [mode, setMode] = useState('reading');        // 'reading'|'recording'|'developing'
    const [draft, setDraft] = useState(null);
    const [tastingDraft, setTastingDraft] = useState(null);
    const [amendingBatchId, setAmendingBatchId] = useState(null);
    const [penDraft, setPenDraft] = useState(null);
    Comment at 105-107: "A tasting is added to an already-saved batch, so this is
    independent of `mode`/`draft`, which are the churn recording state."
    Comment at 535-536 (handleStartDeveloping): "the two pens are exclusive through
    mode alone".
  implication: "THE SHARED ROOT CAUSE, stated in the code's own comments. The design
    holds exactly two pens in `mode` and deliberately places the tasting outside it.
    No derived 'a pen is open' value exists anywhere in the file; each control
    re-derives its own subset, so every new opener is a fresh chance to miss one."

- timestamp: 2026-09-07
  checked: "grep -rn 'useBlocker|unstable_|Prompt|usePrompt|blocker' app/src/"
  found: "No matches."
  implication: "No in-app navigation guard of any kind exists."

- timestamp: 2026-09-07
  checked: "router.jsx, and react-router 8.3.1's dist/development/lib/hooks.js:791"
  found: "router.jsx registers `{ path: '/recipe/:id', Component: RecipePage }` and
    `{ path: '/recipe/:id/batch/:batchId', Component: RecipePage }`. react-router's
    _renderMatches does
    `React.createElement(RenderedRoute, { match, routeContext, children })` — no key
    prop, and children is `React.createElement(match.route.Component)`."
  implication: "SYMPTOM 3 root cause. Two things at once: (a) nothing prevents the
    <Link> navigation, and (b) because the element type and position are unchanged,
    React preserves RecipePage's state across the navigation — mode, draft,
    amendingBatchId, tastingDraft and penDraft all survive. The pen does not just
    fail to block the move; it follows the maker to the new version."

- timestamp: 2026-09-07
  checked: "The consequences of that surviving state — handleSaveBatch
    (RecipePage.jsx:433-435) and buildPenFields (RecipePage.jsx:706-720)"
  found: |
    (a) Amend on version A, click version B in the strip, press Save batch:
        amendingBatchId still names A's batch; `batches` has reloaded to B's;
        `batches.find(b => b.id === amendingBatchId)` -> undefined;
        recordAmendment(undefined, ...) reads `batch.amendedAt` -> TypeError.
    (b) Develop on version A, click sibling B, press Save as a new version:
        createChildVersion (lineage.js:96) structuredClones the parent's rows
        including their ids, so siblings share row ids; buildPenFields therefore
        finds a draftRow for every row of B and writes a CHILD OF B carrying A's
        grams, and penDraft.method / .headnote / .authored wholesale from A.
        No error — a silent cross-version write.
    (c) Running head -> "/" is a different route AND a different component, so
        RecipePage unmounts and the ink is dropped with no warning at all.
  implication: "Symptom 3 is more severe than reported. The user saw only the
    navigation; behind it sit one crash path and one silent-wrong-write path. This
    raises the priority of the navigation half above the two disabled-attribute
    halves."

- timestamp: 2026-09-07
  checked: "isPenDraftDirty (RecipePage.jsx:62-79) against what handleStartDeveloping
    seeds (RecipePage.jsx:536-549)"
  found: "The dirty check tests versionLabel, reason, citedBatchId and rows
    (grams/step/removed). It never tests penDraft.method, penDraft.headnote or
    penDraft.authored — all three of which the pen seeds and edits (via
    handleChangePenStepField, handleChangePenField('headnote'),
    handleChangePenNoteText / handleRemovePenNote)."
  implication: "A FOURTH LEAK inside the same gap truth: a maker who edits only the
    method text, the headnote prose, or an authored note has unsaved ink and gets NO
    browser leave warning on reload or close. The beforeunload half of D-10 is
    incomplete independently of the navigation half."

- timestamp: 2026-09-07
  checked: "isDraftDirty (RecipePage.jsx:26-39) against handleStartAmending
    (RecipePage.jsx:381-404)"
  found: "isDraftDirty compares every churn field against '' / {}. handleStartAmending
    pre-fills all of them from the batch being amended. So the draft reads dirty the
    instant Amend opens, before the maker types anything."
  implication: "The inverse defect, and minor: the leave warning over-fires during
    amend. Worth naming in the same fix so the corrected predicate compares an amend
    draft against the batch's own values, not against blank."

- timestamp: 2026-09-07
  checked: "Whether the disabled controls state a reason in words (D-10: 'never just
    visually implied')"
  found: "BatchMargin does, twice: `.batch-margin__hint` reading 'Batch controls are
    unavailable while the plan is being developed' at lines 294 and 357. The
    Headnote's Develop button does NOT — Headnote.jsx:203 renders a bare
    disabled attribute, and `blockedMessage` (the only prose channel it has) is
    rendered inside the `mode === 'developing'` branch at line 110, so it is
    unreachable while recording or amending."
  implication: "A FIFTH leak, in the half of the truth the user did not test: even
    where the mutual exclusion works today, the Develop button gives no reason."

- timestamp: 2026-09-07
  checked: "Test coverage — find app/src -name '*.test.*', plus the assertions in
    BatchMargin.test.jsx and Headnote.test.jsx"
  found: "There is no RecipePage.test.jsx. RecipePage.jsx is the largest module in
    app/src/ui (895 lines) and the only one with no test file. BatchMargin.test.jsx's
    only tasting-opener assertion is line 180, `expect(markup).toContain('Add a
    tasting')` — presence, never disabled state. Headnote.test.jsx never renders
    mode: 'recording'. All UI tests use renderToStaticMarkup under the node
    environment; jsdom and testing-library are not devDependencies."
  implication: "WHY IT WAS NOT CAUGHT. The interlock lives in the one module with no
    tests, and the component tests take `mode` as a prop, so they can only ever
    assert what the caller already believes. No test in this repo can currently
    drive a click or a route change, which is why the navigation leak had no gate
    at all."

## Resolution

root_cause: |
  Four independent defects behind one gap (AND-gate: no single cause produces all
  the reported behaviour).

  RC1 — No "a pen is open" predicate exists. RecipePage.jsx models pen openness as
  two unrelated states, `mode` ('reading'|'recording'|'developing') and
  `tastingDraft` (null|object), and the code comments at RecipePage.jsx:105-107 and
  535-536 make the split deliberate. Every disabled condition therefore hand-rolls
  its own subset: Headnote.jsx:203 tests only `mode === 'recording'`,
  BatchMargin.jsx:296/318/353 test only `mode === 'developing'`. None of them can
  see the tasting pen, because `tastingDraft` is not passed to Headnote at all and
  is not folded into `mode`.

  RC2 — BatchMargin.jsx:341's "Add a tasting" has no `disabled` prop whatsoever.
  Plan 03-01's Rule 2 deviation enumerated three batch-starting controls (record /
  record another / amend) and the tasting opener was not on that list.

  RC3 — No in-app navigation guard exists (no useBlocker/usePrompt anywhere under
  app/src), and `beforeunload` cannot serve as one because a react-router <Link>
  never unloads the document. Compounding it, react-router 8's _renderMatches
  creates RenderedRoute without a key, so navigating /recipe/A -> /recipe/B reuses
  the same RecipePage instance and PRESERVES mode, draft, amendingBatchId,
  tastingDraft and penDraft. The pen follows the maker to the new version, which
  yields a TypeError on Save batch after amend+navigate and a silent write of
  version A's ink as a child of version B after develop+navigate.

  RC4 — The dirty check is incomplete in both directions. isPenDraftDirty
  (RecipePage.jsx:62-79) omits penDraft.method, .headnote and .authored, so editing
  only those gives no leave warning; and isDraftDirty compares an amend draft
  against blank rather than against the batch it was pre-filled from, so the warning
  fires the moment Amend opens.

  Adjacent, same truth: the Headnote's disabled Develop button states no reason in
  words (Headnote.jsx:203; blockedMessage is only rendered inside the developing
  branch at line 110), which fails D-10's "never just visually implied" for the one
  case that does work today.
fix: "" # diagnose-only — no fix applied
verification: "" # n/a
files_changed: []
