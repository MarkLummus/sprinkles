---
status: diagnosed
trigger: "G-03.5-R2-2 (03.5-UAT.md round 2, test 2): Out of machine and Tasting temperature open a full keyboard on the alphabet, not the numbers layer, on the iPhone (built app). -6 and -12 save and read back; other fields keep the decimal pad."
created: 2026-09-30T00:00:00Z
updated: 2026-09-30T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED (config/design-contract cause, not a code defect) - MeasuredField renders the two signed fields as type="text" inputMode="text". WebKit iOS maps InputMode::Text to UIKeyboardTypeDefault, the general QWERTY keyboard, which opens on the letters layer. The minus is one tap away on its "123" layer. No HTML inputmode value and no attribute asks iOS to open the default keyboard on its numbers layer.
test: done - code read, plan 21 summary/PLAN read, contract + sketches read, WebKit source (main) read for the keyboard mapping.
expecting: n/a
next_action: return ROOT CAUSE FOUND (diagnose-only). Candidate configurations listed in Resolution; the choice is Mark's design call; A must be tested on the iPhone against the build before anything is planned.
bug_class: Bohrbug (deterministic platform mapping, iPhone/WebKit only)

reasoning_checkpoint:
  hypothesis: "The signed fields open on letters because inputMode='text' (React -> inputmode attribute) maps to UIKeyboardTypeDefault in WebKit's iOS UI process, and UIKeyboardTypeDefault starts on the alphabet layer; the plan-21 decision chose 'a keyboard that has a minus' and took 'the full keyboard' as the means, which satisfies 'has a minus' but not 'on the numbers layer'."
  confirming_evidence:
    - "BatchRow.jsx:93-95 sets inputMode={field.signed ? 'text' : 'decimal'} (+ autoCorrect/autoCapitalize off) on type='text'; the plan 21 keypad probe reads inputmode='text' on exactly the two signed fields at 393 and 1366 (03.5-21-SUMMARY.md), so the DOM carries what the code says."
    - "WebKit Source/WebKit/UIProcess/ios/WKContentViewInteraction.mm (main), the keyboardType switch on _focusedElementInformation.inputMode: Text -> UIKeyboardTypeDefault; Decimal -> UIKeyboardTypeDecimalPad; Numeric -> UIKeyboardTypeNumberPad; Telephone -> UIKeyboardTypePhonePad. Mark's report matches on both sides: signed fields (Text) open a full keyboard on letters; unsigned (Decimal) keep the decimal pad."
    - "The HTML inputmode vocabulary (none, text, tel, url, email, numeric, decimal, search) has no value for 'numbers and punctuation layer, switchable to letters'; WHATWG html#3478 asks for exactly that and is a proposal, not a shipped value."
    - "The prior diagnosis already recorded the cost: no-minus-key-on-iphone.md Evidence (web research): 'inputmode=text (or omitting inputMode) is the established workaround, at the cost of opening on the letter plane.' Plan 21's truth and human-check said only 'a keyboard with a minus key', so the cost was never part of what Mark approved or what was checked."
  falsification_test: "If the two signed inputs on the device had inputmode other than 'text' (e.g. decimal) or the iPhone opened the numbers layer for a type=text/inputmode=text field, the hypothesis would be wrong. Both are contradicted: the probe reads inputmode='text', and Mark observes letters."
  fix_rationale: "Not applicable (diagnose only). Any fix must change the input configuration (type/inputmode) or add a sign control; the parser already accepts '-' and U+2212."
  blind_spots: "No device access in this session. UNCONFIRMED: Mark's iOS version (the WebKit mapping read is from main; it has been stable since inputmode support, iOS 12.2/13, but the shipped build is not read). UNCONFIRMED: what every candidate below does on the physical iPhone, especially type=number."
  candidate_causes:
    - "config/design contract: contract line 187 + sketches 007:620 / 008:354,359 (amended by plan 21) prescribe inputMode='text' for the two C fields; the requirement was worded as 'has a minus', the UAT truth is 'on the numbers layer' (PRIMARY)"
    - "environment: iOS default keyboard always opens on letters; WebKit has no hint for the numbers layer of the default keyboard"
    - "code: MeasuredField faithfully implements the contract (ruled out as defect; it does what it was told)"
    - "data/parser: ruled out - parseMeasuredDraft accepts '-' and U+2212, -6/-12 save and read back per Mark"
  and_gate: "yes - both (a) inputMode 'text' on the field (the contract's choice) AND (b) iOS default keyboard opening on letters. Change either (a: a configuration that maps to NumbersAndPunctuation, or a sign control beside a decimal pad) and the symptom goes."

## Symptoms

expected: Out of machine and Tasting temperature (the two signed degrees C fields) open a keyboard that reaches a minus key without hunting, on the numbers layer.
actual: "the keyboard is a full keyboard, but it opens on the alphabet, not on the numbers; -6 and -12 save and read back. others keep the decimal pad." (Mark, iPhone, built app)
errors: none
reproduction: iPhone, build served by `npm --prefix app run build && npm --prefix app run preview -- --host`; Record another -> tap Out of machine; Add tasting -> tap Tasting temperature.
started: introduced by plan 21 (2026-09-29/30) as the fix for G-03.5-5b (decimal pad had no minus); first device check is UAT round 2 test 2.

## Eliminated

- hypothesis: The decimal pad is still being shown on the signed fields (plan 21 not built/served).
  evidence: Mark says full keyboard on the signed fields and decimal pad on the others; BatchRow.jsx:93 is live; probe keypad group passed.
  timestamp: 2026-09-30

- hypothesis: autocorrect/autocapitalize off, or the React prop casing, changes which layer opens.
  evidence: WKContentViewInteraction.mm sets keyboardType from inputMode/element type only; autocorrect/autocapitalize set traits.autocorrectionType/autocapitalizationType, separate from keyboardType. The probe reads the lowercase attributes as expected.
  timestamp: 2026-09-30

- hypothesis: A pattern attribute can select the numbers-and-punctuation layer.
  evidence: WebKit WebProcess/WebPage/WebPage.cpp:7959 and :7986 match the pattern only as the exact strings "\\d*" or "[0-9]*", which yield InputType::NumberPad (digits only, no minus). Any other pattern falls through to InputType::Text -> letters.
  timestamp: 2026-09-30

## Evidence

- timestamp: 2026-09-30
  checked: app/src/ui/BatchRow.jsx:70-109 (MeasuredField), call sites :682 (churn), :797 (tasting), :909 (melt)
  found: type="text"; inputMode={field.signed ? 'text' : 'decimal'}; autoCorrect/autoCapitalize 'off' when signed. Comment :70-77 cites G-03.5-5b and Mark's 2026-09-29 decision. BATTERY_FIELDS (battery.js:19, :22) marks outOfMachineTempC and tastingTempC signed:true.
  implication: the letters layer is the configured outcome, not a bug in the component.

- timestamp: 2026-09-30
  checked: 03.5-21-SUMMARY.md and 03.5-21-PLAN.md (lines 33, 85, 148)
  found: Key decision "Signed fields take inputMode text, not a plus-minus control and not a parser change (Mark, 2026-09-29)". Truth: "open the full keyboard, which has a minus". Human-check: "Out of machine opens a keyboard with a minus key". D1 verification carries human_judgment:true with rationale "Whether the iPhone actually shows a minus key is a device fact no Chromium probe can assert."
  implication: the plan verified the attribute, not the layer; "on the numbers layer" was never stated until the round-2 truth. A plus-minus control was explicitly set aside.

- timestamp: 2026-09-30
  checked: .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md:187; .planning/sketches/007-full-battery/index.html:620 (mirror sources/007-full-battery/index.html:619); .planning/sketches/008-control-sheet/index.html:354, :359
  found: 187: 'Non-date inputs carry inputMode="decimal", except the two C fields (inputMode="text", autocorrect and autocapitalize off: the iPhone decimal pad has no minus, G-03.5-5b).' 007:620 sets field.inputMode = isC ? 'text' : 'decimal'. 008:354 and :359 draw the two C inputs inputmode="text" autocorrect="off" autocapitalize="off"; 008:358 (Tempering) decimal. The sketches' mechanism and the app agree; neither sketch was ever exercised on an iPhone keyboard. The 011-recipe-route-c boards and canvas-generators carry no inputmode.
  implication: contract, sketches and app are consistent with each other and all inherit the same mapping; the authority line is where the layer question enters.

- timestamp: 2026-09-30
  checked: WebKit main, Source/WebKit/UIProcess/ios/WKContentViewInteraction.mm lines ~7435-7490 (fetched from raw.githubusercontent.com)
  found: switch on _focusedElementInformation.inputMode. None/Unspecified: falls back to element type (Phone -> PhonePad, URL, Email, Number -> UIKeyboardTypeNumbersAndPunctuation, NumberPad -> UIKeyboardTypeNumberPad, Text/etc -> UIKeyboardTypeDefault). Text -> UIKeyboardTypeDefault. Telephone -> PhonePad. Numeric -> NumberPad. Decimal -> DecimalPad. Search -> WebSearch. An explicit inputmode wins over the element type.
  implication: (1) text == unspecified on type=text == default QWERTY, which opens on letters. (2) type=number with inputmode absent maps to NumbersAndPunctuation, the one route from HTML to a numbers layer that has punctuation. (3) any inputmode set on a type=number field overrides that.

- timestamp: 2026-09-30
  checked: WebKit main, Source/WebKit/WebProcess/WebPage/WebPage.cpp:7935-7990 (inputTypeForElement)
  found: isNumberField -> NumberPad if pattern is exactly "\\d*" or "[0-9]*", else Number. isText with the same two exact patterns -> NumberPad, else Text.
  implication: pattern cannot produce a minus layer; it can only produce the digits-only pad.

- timestamp: 2026-09-30
  checked: WebKit main, Source/WebCore/html/NumberInputType.cpp (stripInvalidNumberCharacters :148, handleBeforeTextInsertedEvent :388, sanitizeValue :588, hasBadInput :597)
  found: inserted text is filtered to 0123456789.Ee-+ (locale decimal separator converted first); full-width digits/hyphen and U+2212 are normalised to '-' in this version; sanitizeValue returns '' for a value that is not a finite number; hasBadInput is derived from the visible text.
  implication: type=number side effects: malformed text ("-", "1-2", "e") reads as value '' while the visible text stays; letters cannot be typed; comma is dropped in a '.'-locale; U+2212 is handled only by the newer WebKit (shipped iOS UNCONFIRMED).

- timestamp: 2026-09-30
  checked: web search (catskull.net iOS 12.2 note, MDN inputmode, WHATWG html#3478, OSM issue 4665 comment)
  found: inputmode decimal/numeric "devices may or may not show a minus key"; WHATWG html#3478 (2018) requests an inputmode for "Numbers and Punctuation, switchable to alphabetical" and is not a shipped value; one OSM comment (an iOS test two years before 2024, locale-dependent) claims type=number on Mobile Safari had no minus key, which disagrees with the WebKit source mapping to NumbersAndPunctuation.
  implication: type=number is a candidate, not a fact; it must be tried on the iPhone before any plan relies on it.

- timestamp: 2026-09-30
  checked: pins on the current configuration (grep under app/src and the phase probes)
  found: BatchRow.test.jsx:836-845 (markup must not contain type="number", :841), :847-855 (two C fields inputMode text + autoCorrect/autoCapitalize off), :857-869 (unsigned fields decimal, no autoCorrect); 03.5-batches-probe.mjs:500-590 keypad group (inputmode per field, type==='text' on all six, autocorrect attrs, then fill -6/-12, save, read back); contract :187; sketches 007:620/619, 008:354,359; 03.3.1-RESEARCH.md:113,602 and 03.3.1-02-PLAN.md:95 (the original reason for text-mode fields: type=number rejects a malformed value before validation runs). app.css:254-265 already hides number spinners (D-19), pinned by binder.test.js:242.
  implication: the test/probe/contract surface each candidate touches (see Resolution).

## Resolution

root_cause: >
  MeasuredField (app/src/ui/BatchRow.jsx:93-95) renders the two signed degrees C fields as type="text" inputMode="text". On iOS Safari, WebKit maps inputmode "text" (same as no inputmode on a text input) to UIKeyboardTypeDefault, the ordinary QWERTY keyboard, which always opens on the letters layer; the minus lives one tap away on its "123" layer. HTML has no inputmode value that opens the default keyboard on its numbers layer (WHATWG html#3478 is an unshipped request). Plan 21 (G-03.5-5b) set "full keyboard" to get a minus after the decimal pad (UIKeyboardTypeDecimalPad) turned out to have none, and the cost (opens on letters) was noted in the round-1 diagnosis but not carried into the truth or the human-check, so the round-2 truth "on the numbers layer" was a requirement the chosen configuration cannot meet. The component, parser and save path are behaving as configured; the cause sits in the authority line (contract :187, sketches 007/008) that prescribes inputMode "text".
  Layer outcomes from the WebKit source, each UNCONFIRMED on the device: text -> letters (Mark confirmed); decimal -> decimal pad, no minus (round 1 confirmed); numeric/pattern [0-9]* -> digits only, no minus; tel -> phone pad, no minus; type=number with no inputmode -> NumbersAndPunctuation (numbers layer with a hyphen).
fix: (not applied - find_root_cause_only)
verification: n/a
files_changed: []

candidates:  # each needs Mark's call; none is chosen here
  A_type_number_no_inputmode:
    config: 'type="number" on the two signed fields only, no inputMode attribute, step="any"; unsigned fields unchanged.'
    expected_layer: "UIKeyboardTypeNumbersAndPunctuation: opens on the numbers layer, hyphen-minus and period present, key to reach letters. UNCONFIRMED on device (WebKit source says so; an older OSM comment disagrees)."
    changes: "BatchRow.jsx MeasuredField: type and inputMode become per-field (signed -> number, no inputMode, no autoCorrect/autoCapitalize), step=any. battery.js unchanged (the string '-6' parses). Authority first: contract :187, sketch 007:620 (and mirror :619), sketch 008:354,359; 03.3.1 'never type=number' wording in BatchRow.jsx:70-77 comment."
    side_effects:
      - "Reverses the 03.3.1 decision (RESEARCH.md:113,602; 02-PLAN.md:95) for these two fields: a malformed value no longer stays in place. WebKit sanitizes it to '' (NumberInputType.cpp:588), so onChange reads '' and a typed '-', '--6', '1-2' or 'e' saves as blank with no field-error. Needs event.target.validity.badInput to be carried into the draft, or accepted."
      - "Typing is filtered to 0123456789.Ee-+; letters and ';' cannot be typed; a comma is dropped in a '.' locale; U+2212 paste is normalised only by newer WebKit (shipped iOS UNCONFIRMED), older builds would drop the minus and flip the sign silently. The parser's comma/U+2212 paths become mostly unreachable on these fields."
      - "'e'/'+' are allowed by the filter; '1e3' reads as a finite number and the parser then rejects it with the contract sentence (acceptable)."
      - "Desktop: arrow keys step (step=any, step of 1), focused wheel may change the value in Chromium; spinners already hidden (app.css:257-264, binder.test.js:242). Selection APIs are null on number inputs (check focus-first-invalid only calls focus())."
      - "Locale: comma-locale phones show a comma on the layer; WebKit converts to '.' for value."
    tests_that_pin_today: "BatchRow.test.jsx:841 (markup not type=number) and :847-855 fail; probe keypad group (03.5-batches-probe.mjs:535-560 type==='text' and inputmode checks) fails for the two fields; contract/sketch lines above. Probe fill('-6') still works in Chromium."
    confirm_on_device: "Build + preview --host, iPhone, real app: layer on open; hyphen and period present; whether the layer stays up for digits after the minus; -6 and -12 save and read back; a saved -6 reopens correctly in Correct; paste of a U+2212 value; behaviour with a comma-locale if Mark ever uses one; VoiceOver name unchanged."

  B_decimal_pad_plus_sign_control:
    config: 'Keep type="text" inputMode="decimal" (decimal pad, numbers layer) on the signed fields and add a sign control beside each (a +/- button, or a plain-words "below zero" toggle).'
    expected_layer: "Decimal pad (confirmed in round 2 for the unsigned fields); the minus is supplied by the control, not the keyboard."
    changes: "BatchRow.jsx MeasuredField: sibling control rendered only when field.signed; it flips a leading '-' on the draft string (state stays in the draft string so dirty checks at RecipePage.jsx:193,:203, draftFromBatch :391/:401 and parse at :491 need no change); blank-draft case ('-' alone parses as malformed, battery.js:52) needs a rule. Authority and boards first: a new control drawn in sketch 007/008, the 011-recipe-route-c boards (1600-pen, 393-batch, 723-batch, 1024/1366 batch) and the contract (tab order, touch floor, label in plain words per Mark's label rule). Mark set a plus-minus control aside on 2026-09-29, so this reopens that decision."
    side_effects:
      - "Layout budget: the churn cells (5 equal columns at 984, 2 x 3 at 723 and below) and the Tasting field-row (three columns) have to fit a 44px control."
      - "Accessibility: accessible name, pressed state, tab order in the contract's 'Keyboard and tab order', VoiceOver wording; one more control to reach on the iPad keyboard-only path."
      - "Two ways to make the same edit (typing '-' on a hardware keyboard or paste vs the control) must stay in sync."
    tests_that_pin_today: "BatchRow.test.jsx:847-855 (would flip to decimal for signed), new DOM-level tests for the control (static-markup harness cannot click), probe keypad group, contract :187, sketch lines above."
    confirm_on_device: "Decimal pad opens on the signed fields; tap target and thumb reach; control and typed digits compose in either order; blank-field toggle; VoiceOver reads the state."

  C_implied_sign_convention:
    config: "Decimal pad on the signed fields; the field takes the magnitude and the sign is a convention (for example a fixed '-' before the field, with an escape for above zero)."
    expected_layer: "Decimal pad. Nothing device-specific to test."
    changes: "Domain and product meaning, not keyboard: battery.js signed semantics, save assembly (RecipePage.jsx:545, :562), draftFromBatch (:391, :401), every read-back and print display, seed data, battery.test.js, batch.test.js, contract. Needs a product decision; a bare '6' would be stored as -6."
    side_effects: "Silent data-meaning change for any above-zero reading; out of machine and tasting temperature differ in how often they are below zero; existing stored records (none live per the no-live-data note, but the seeds carry values) would need a check."
    confirm_on_device: "None for the keyboard; the question is Mark's convention."

  D_keep_text_and_accept_the_tap:
    config: "No code change. Amend the UAT truth to 'full keyboard; minus is one tap on 123'."
    expected_layer: "Letters first (Mark's observation)."
    side_effects: "An extra tap for every signed entry (two fields per batch). UNCONFIRMED whether iOS returns to letters after the minus so digits need a second layer switch; this is the 'hunting' the truth names."
    confirm_on_device: "Count taps for -6 and -12 from a cold field."

  E_custom_in_page_keypad:
    config: 'inputmode="none" with an in-page keypad (digits, minus, decimal, backspace).'
    note: "Full control of the layer but the largest scope: hardware-keyboard and paste paths, focus/scroll with the system keyboard suppressed, VoiceOver, boards. Listed for completeness only."

ruled_out_by_the_webkit_mapping:
  - 'inputmode="decimal" -> DecimalPad, no minus (the round-1 defect)'
  - 'inputmode="numeric" or pattern="[0-9]*" / "\d*" (exact strings) -> NumberPad, digits only, no minus and no decimal point'
  - 'inputmode="tel" -> PhonePad (digits, * #, +), no minus'
  - 'type="number" with an inputmode attribute present -> the inputmode wins; so A needs the attribute absent'
  - 'autocorrect, autocapitalize, enterkeyhint, lang -> none selects a keyboard layer'

adjacent_note: "Method.jsx step target value fields (type=text, no inputMode, per the round-1 diagnosis) already open on letters; that is unchanged and not part of this gap."
