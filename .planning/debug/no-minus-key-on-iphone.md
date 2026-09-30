---
status: diagnosed
trigger: "G-03.5-5b: Creating a tasting on iPhone, it's not possible to enter a negative temperature as there is no negative sign."
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - MeasuredField (app/src/ui/BatchRow.jsx:88-90) renders type="text" inputMode="decimal" for every battery field, never reading field.signed; on iPhone Safari inputmode=decimal maps to the decimal pad (digits + locale separator, no minus). The prescription comes from the structural contract (sketch 007 "Controls spec": "Non-date inputs carry inputMode=\"decimal\"").
test: done - code read, contract read, parser exercised, platform behaviour researched.
expecting: n/a
next_action: return ROOT CAUSE FOUND to orchestrator (diagnose-only).
bug_class: Bohrbug (deterministic: platform keyboard layout for a given inputMode, iPhone only)

reasoning_checkpoint:
  hypothesis: "The two signed degrees-C battery fields cannot take a minus on iPhone because MeasuredField hard-codes inputMode='decimal' for all fields, and iOS maps decimal to UIKeyboardTypeDecimalPad on iPhone, which has no minus key."
  confirming_evidence:
    - "BatchRow.jsx:88-90 type=text inputMode=decimal, unconditional; the component receives field (with field.signed) but never reads signed"
    - "All three render sites (BatchRow.jsx:678 churn, :793 tasting, :905 melt) go through MeasuredField - Out of machine and Tasting temperature both included"
    - "MDN inputmode: decimal/numeric 'Devices may or may not show a minus key'; css-tricks / catskull: iPhone shows 0-9 pad, iPad shows the punctuation plane (explains iPhone-only report)"
    - "parseMeasuredDraft accepts '-6', U+2212 '−6', '-6,5' on signed fields - the domain is not the blocker"
  falsification_test: "If typing -6 via an external/hardware keyboard or paste on the iPhone were ALSO rejected, the parser/save path would be implicated; node run shows parser returns ok:-6 for both minus glyphs."
  fix_rationale: "Give the signed fields a keyboard that has a minus (or a separate sign control); unsigned fields can keep the decimal pad."
  blind_spots: "Not observed on a physical iPhone in this session (no device access, no vite per instructions). Did not measure iOS 26 keyboard layouts directly; relies on MDN + multiple independent write-ups + the iPhone-vs-iPad split matching Mark's report."
  candidate_causes:
    - "code: MeasuredField ignores field.signed and hard-codes inputMode=decimal (BatchRow.jsx:90)"
    - "config/design contract: sketch 007 Controls spec + structural contract line 187 prescribe inputMode=decimal for all non-date inputs, including degrees-C"
    - "environment: iPhone Safari decimal pad has no minus key (iPad's does via the punctuation plane)"
    - "data/parser: ruled out - parseMeasuredDraft accepts '-' and U+2212"
  and_gate: "yes - requires (a) inputMode=decimal on a signed field AND (b) an iPhone (compact) keyboard. On iPad or desktop the same markup works, which is why Chromium/iPad verification never caught it. The contract prescription is the upstream cause of (a)."

## Symptoms

expected: On the iPhone, a temperature field accepts a negative value (out of machine normally below zero, e.g. -6 C; tasting temperature -12 C).
actual: "Creating a tasting on iPhone, it's not possible to enter a negative temperature as there is no negative sign."
errors: none (no minus key on the on-screen keyboard)
reproduction: UAT Test 5 - iPhone, open the record pen or add a tasting, try to type -6 in Out of machine or Tasting temperature.
started: discovered during 03.5 UAT

## Eliminated

- hypothesis: The parser rejects negative temperatures (ASCII vs Unicode minus mismatch).
  evidence: node run of parseMeasuredDraft({signed:true}) -> '-6' ok -6; '−6' (U+2212) ok -6; '-6,5' ok -6.5; '-12' ok -12. RecipePage.jsx:491 passes { signed: field.signed }.
  timestamp: 2026-09-29

- hypothesis: Some other input (step targets, grams, as-made) is the signed field Mark hit.
  evidence: Mark says "creating a tasting ... temperature"; step target value fields (Method.jsx:200) have no inputMode (full keyboard, minus reachable); grams/as-made (IngredientTable.jsx:131, :292) are non-negative by parser (lineage.js:186 /^\d+(\.\d{1,2})?$/).
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: app/src/ui/BatchRow.jsx:82-104 (MeasuredField)
  found: input type="text" inputMode="decimal" for every BATTERY_FIELDS entry; no branch on field.signed. Comment at :70-72 cites contract "Controls spec" / sketch 007 lines 37-44 / D-13.
  implication: the two signed fields get the same keyboard as unsigned ones.

- timestamp: 2026-09-29
  checked: app/src/domain/battery.js:17-24, 49-59
  found: outOfMachineTempC and tastingTempC are signed:true; parseMeasuredDraft normalizes U+2212 to '-' and accepts /^-?\d*\.?\d*$/ after comma->dot. Error copy "Enter a temperature, such as −6, or leave blank."
  implication: domain accepts negatives with either minus glyph; the block is purely at the keyboard layer.

- timestamp: 2026-09-29
  checked: MeasuredField render sites
  found: BatchRow.jsx:678 (CHURN_MEASURED_FIELDS: Time to draw temp., Out of machine, Churn duration), :793 (TASTING_MEASURED_FIELDS: Tempering, Tasting temperature), :905 (MELT_TEST_FIELD). No other component renders battery inputs.
  implication: single fix point; both signed fields affected.

- timestamp: 2026-09-29
  checked: every inputMode / <input> under app/src (non-test)
  found: inputMode="decimal" at BatchRow.jsx:90, IngredientTable.jsx:131 (plan grams, pen), IngredientTable.jsx:292 (as-made grams, recording). Method.jsx:193/200 (step target label/value) type=text, no inputMode. All other inputs are date/checkbox/radio/prose text.
  implication: the only signed-value inputs are the two degrees-C battery fields (decimal pad - broken on iPhone) and step target values (free text, full keyboard - minus reachable). Grams fields are unsigned by parser, so decimal pad is correct there.

- timestamp: 2026-09-29
  checked: contract - .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md:187; sketch .planning/sketches/007-full-battery/index.html:620, 008-control-sheet/index.html:354,358-359; 03.3.1-RESEARCH.md:113,259
  found: contract bullet "Non-date inputs carry inputMode=\"decimal\"" with no degrees-C exception; sketch 007 script sets field.inputMode='decimal' on every non-date input; sketch 008 draws Out of machine and Tasting temperature with inputmode="decimal".
  implication: the build is contract-conformant; the defect originates in the contract and sketches (never exercised on an iPhone keyboard).

- timestamp: 2026-09-29
  checked: app/src/ui/BatchRow.test.jsx:836-845
  found: test pins inputMode="decimal" only on "Time to draw temp., minutes" (unsigned). No test asserts the keyboard for a signed field.
  implication: changing signed fields' inputMode will not break existing tests; a new test should pin the signed-field choice.

- timestamp: 2026-09-29
  checked: web research - MDN inputmode; css-tricks inputmode articles; catskull.net iOS 12.2 note; PrairieLearn PR #15869
  found: MDN: decimal and numeric - "Devices may or may not show a minus key". iPhone renders decimal as a 0-9 pad plus separator; iPad renders the numbers/punctuation plane (which has '-'). PrairieLearn fixed the same iPhone gap by switching to inputmode="text" on type="text".
  implication: explains the iPhone-only report; inputMode="text" (or omitting inputMode) is the established workaround, at the cost of opening on the letter plane.

- timestamp: 2026-09-29
  checked: parser edge - U+2013 en dash (long-press on iOS '-'), "- 6"
  found: both rejected (ok:false).
  implication: minor edge if the fix uses the full keyboard; not the reported bug.

## Resolution

root_cause: MeasuredField (app/src/ui/BatchRow.jsx:88-90) hard-codes inputMode="decimal" on every battery field, including the two signed degrees-C fields (battery.js:19, :22 signed:true); iPhone Safari maps inputmode=decimal to a decimal pad with no minus key, so -6 cannot be typed. The markup follows the structural contract verbatim (batch-record-tasting-battery-structure.md:187, sketch 007 index.html:620), which prescribes decimal for all non-date inputs without a degrees-C exception. Parser is not involved (accepts '-' and U+2212).
fix: (not applied - find_root_cause_only)
verification:
files_changed: []
