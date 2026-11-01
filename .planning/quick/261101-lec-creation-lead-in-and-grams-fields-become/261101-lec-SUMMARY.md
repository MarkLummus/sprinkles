---
phase: quick-261101-lec
plan: 01
quick_id: 261101-lec
subsystem: ui
tags: [ipad, hardware-keyboard, textarea, creation-editor, bug-p11-ipad-hardware-tab-skips-fields]
status: complete
requirements: [bug-p11-ipad-hardware-tab-skips-fields]
key-files:
  created:
    - app/src/ui/oneLineField.js
    - .planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs
  modified:
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/styles/notebook.css
    - app/src/ui/CreationSteps.test.jsx
    - app/src/ui/CreationStructure.test.jsx
    - app/src/ui/IngredientTable.creating.test.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/EditFlow.test.jsx
    - app/src/ui/RecipeSheet.test.jsx
plan_head_before: e63381c78964c5b69b15c588e58454aaff8dd75b
plan_head_after: ed93b024f70ca6f3a12e09223ac02b6366100adf
commits: 2
actuals:
  tokens: 12400
  tasks: 2
  commits: 2
---

# Phase quick-261101-lec Plan 01: Lead-in and grams fields as one-row textareas Summary

The creation editor's step lead-in and its creating row's grams field are now one-row textareas (iPadOS 27 Safari drops a hardware Tab from every input element and a textarea takes it). Return inserts nothing and line breaks never reach the draft. A scratch-build probe shows both fields look and focus as the inputs did: 132 PASS, 0 FAIL in WebKit and Chrome.

## Commits

- 22ec33f5 fix: the creation step's lead-in is a one-row textarea, so iPad Tab reaches the instruction
- ed93b024 fix: the creation row's grams field is a one-row textarea, so iPad Tab leaves it

## What changed

- `app/src/ui/oneLineField.js` (new): `holdReturn` prevents every Enter keydown outside IME composition (modifiers included); `stripNewlines` removes every LF and CR.
- `CreationSteps.jsx` lead-in and `IngredientTable.jsx` creating grams field: textarea, `rows="1"`, `onKeyDown={holdReturn}`, `onChange` through `stripNewlines`. Every other attribute kept (grams keeps `inputMode="decimal"`, the ref callback and `mk-focus`).
- `CreationPage.jsx`: the `lead-in` focus request and the refused-Save `line` target select the textarea.
- `notebook.css`, tokens only, no new media block: the lead-in label and the grams wrapper become flex so the step number and " g" keep the text baseline; `white-space: pre; overflow: hidden` for one scrolled line; centring `padding-block` inside the existing `(pointer: coarse)` block.
- Not touched: the other 26 input elements (counts: non-test .jsx 28 to 26 inputs, 16 to 18 textareas; Method.jsx 4 inputs; IngredientTable.jsx inputs 3 to 2; CreationSteps.jsx inputs 3 to 2). No aria-multiline (orchestrator's decision).

## Test totals

Before: 4238 tests in 130 files. After: 4246 tests in 130 files (8 new: 4 for the lead-in, 4 for grams), none deleted, `npm --prefix app test` all pass. `tabindex-scan.test.js` passes unchanged.

## Probe verdict (261101-lec-field-probe.mjs, scratch builds under /private/tmp/sprinkles-261101-lec/, app/dist untouched)

`check --field all`: 132 PASS, 0 FAIL, for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2. Lead-in and grams both pass F0, F1, L1 to L10 and G1 to G8 (box, computed style, ink, step number and ink gap, instruction top, li and tr heights, " g" box, name top, Required line, focus outline and :focus-visible, Enter, pasted line break, long text on one line scrolling to the caret). The 393 coarse run is INFO only (identical boxes and ink in both builds):

```
PASS F1 webkit 1366 fine: coarse false equals hasTouch false
PASS F1 webkit 1366 fine: the same ingredient was picked, 'Alcohol 40%' (base 'Alcohol 40%')
PASS F0 webkit 1366 fine: lead-in is TEXTAREA rows 1 (base INPUT)
PASS L1 webkit 1366 fine: lead-in box top 0.58 left 24.03 w 503.97 h 26.5 (base top 0.58 left 24.03 w 503.97 h 26.5)
PASS L2 webkit 1366 fine: lead-in computed equal (15px 700 22.5px pad 0px/0px); resize none, scrollbars 0/0 (base resize none)
PASS L3 webkit 1366 fine: lead-in text ink L24.03 T7.58 R141.03 B19.58 (base L24.03 T7.58 R141.03 B19.58)
PASS L4 webkit 1366 fine: number top 0 left 0 w 12.03 h 23 (base top 0 left 0 w 12.03 h 23); number ink bottom minus text ink bottom 0.42 (base 0.42)
PASS L5 webkit 1366 fine: instruction top 33.08 (base 33.08), li height 182.91 (base 182.91)
PASS L6 webkit 1366 fine: empty field top 0.58 left 24.03 w 503.97 h 26.5 (base top 0.56 left 24.03 w 503.97 h 26.5); Required top 27.08 left 24.03 w 503.97 h 15 (base top 27.06 left 24.03 w 503.97 h 15)
PASS L7 webkit 1366 fine: focus-visible true outline {"style":"solid","width":"2px","offset":"2px"} (base true {"style":"solid","width":"2px","offset":"2px"})
PASS L8 webkit 1366 fine: after Enter and Shift+Enter value 'Warm the milk' focus true (base 'Warm the milk' true)
PASS L9 webkit 1366 fine: insertText with a line feed leaves 'Warmthe milk' (contract 'Warmthe milk'; the base input leaves 'Warm the milk')
PASS L10 webkit 1366 fine: long text height 26.5 (filled 26.5, base long 26.5), scrollLeft 337 (base 519), scrollbars 0/0
PASS F0 webkit 1366 fine: grams is TEXTAREA rows 1 inputmode decimal (base INPUT)
PASS G1 webkit 1366 fine: grams box top 6 left 6 w 52 h 26.25 (base top 6 left 6 w 52 h 26.25)
PASS G2 webkit 1366 fine: grams computed equal (15px 400 20.25px pad 6px/6px); resize none, scrollbars 0/0 (base resize none)
PASS G3 webkit 1366 fine: grams text ink L25 T14 R50 B25 (base L25 T14 R50 B25)
PASS G4 webkit 1366 fine: tr height 55.91 (base 55.91); ' g' top 10.29 left 58 w 12.89 h 17.67 (base top 10.28 left 58 w 12.89 h 17.67); name top 6.17 (base 6.17)
PASS G5 webkit 1366 fine: picked row focused true (base true), mk-focus true (base true), outline {"style":"solid","width":"2px","offset":"2px"} (base {"style":"solid","width":"2px","offset":"2px"})
PASS G6 webkit 1366 fine: after Enter and Shift+Enter value '150' focus true (base '150' true)
PASS G7 webkit 1366 fine: insertText with a line feed leaves '150' (contract '150'; the base input leaves '15 0')
PASS G8 webkit 1366 fine: 13 digits height 26.25 (filled 26.25, base long 26.25), scrollLeft 76 (base 84), scrollbars 0/0
PASS F1 webkit 1366 coarse: coarse true equals hasTouch true
PASS F1 webkit 1366 coarse: the same ingredient was picked, 'Alcohol 40%' (base 'Alcohol 40%')
PASS F0 webkit 1366 coarse: lead-in is TEXTAREA rows 1 (base INPUT)
PASS L1 webkit 1366 coarse: lead-in box top 0 left 24.03 w 503.97 h 44 (base top 0 left 24.03 w 503.97 h 44)
PASS L2 webkit 1366 coarse: lead-in computed equal (16px 700 24px pad 0px/0px); resize none, scrollbars 0/0 (base resize none)
PASS L3 webkit 1366 coarse: lead-in text ink L24.03 T15 R149.03 B28 (base L24.03 T15 R149.03 B28)
PASS L4 webkit 1366 coarse: number top 8.53 left 0 w 12.03 h 23 (base top 8.53 left 0 w 12.03 h 23); number ink bottom minus text ink bottom -0.47 (base -0.47)
PASS L5 webkit 1366 coarse: instruction top 50 (base 50), li height 277.33 (base 277.33)
PASS L6 webkit 1366 coarse: empty field top 0 left 24.03 w 503.97 h 44 (base top 0 left 24.03 w 503.97 h 44); Required top 44 left 24.03 w 503.97 h 15 (base top 44 left 24.03 w 503.97 h 15)
PASS L7 webkit 1366 coarse: focus-visible true outline {"style":"solid","width":"2px","offset":"2px"} (base true {"style":"solid","width":"2px","offset":"2px"})
PASS L8 webkit 1366 coarse: after Enter and Shift+Enter value 'Warm the milk' focus true (base 'Warm the milk' true)
PASS L9 webkit 1366 coarse: insertText with a line feed leaves 'Warmthe milk' (contract 'Warmthe milk'; the base input leaves 'Warm the milk')
PASS L10 webkit 1366 coarse: long text height 44 (filled 44, base long 44), scrollLeft 360 (base 587), scrollbars 0/0
PASS F0 webkit 1366 coarse: grams is TEXTAREA rows 1 inputmode decimal (base INPUT)
PASS G1 webkit 1366 coarse: grams box top 6 left 6 w 52 h 44 (base top 6 left 6 w 52 h 44)
PASS G2 webkit 1366 coarse: grams computed equal (16px 400 21.6px pad 6px/6px); resize none, scrollbars 0/0 (base resize none)
PASS G3 webkit 1366 coarse: grams text ink L24 T23 R50 B35 (base L24 T23 R50 B35)
PASS G4 webkit 1366 coarse: tr height 75.91 (base 75.91); ' g' top 19.54 left 58 w 12.89 h 17.67 (base top 19.54 left 58 w 12.89 h 17.67); name top 6.17 (base 6.17)
PASS G5 webkit 1366 coarse: picked row focused true (base true), mk-focus true (base true), outline {"style":"solid","width":"2px","offset":"2px"} (base {"style":"solid","width":"2px","offset":"2px"})
PASS G6 webkit 1366 coarse: after Enter and Shift+Enter value '150' focus true (base '150' true)
PASS G7 webkit 1366 coarse: insertText with a line feed leaves '150' (contract '150'; the base input leaves '15 0')
PASS G8 webkit 1366 coarse: 13 digits height 44 (filled 44, base long 44), scrollLeft 83 (base 91), scrollbars 0/0
PASS F1 webkit 1366 coarse dpr2: coarse true equals hasTouch true
PASS F1 webkit 1366 coarse dpr2: the same ingredient was picked, 'Alcohol 40%' (base 'Alcohol 40%')
PASS F0 webkit 1366 coarse dpr2: lead-in is TEXTAREA rows 1 (base INPUT)
PASS L1 webkit 1366 coarse dpr2: lead-in box top 0 left 24.03 w 503.97 h 44 (base top 0 left 24.03 w 503.97 h 44)
PASS L2 webkit 1366 coarse dpr2: lead-in computed equal (16px 700 24px pad 0px/0px); resize none, scrollbars 0/0 (base resize none)
PASS L3 webkit 1366 coarse dpr2: lead-in text ink L24.03 T15.5 R148.53 B28.5 (base L24.03 T15.5 R148.53 B28.5)
PASS L4 webkit 1366 coarse dpr2: number top 8.53 left 0 w 12.03 h 23 (base top 8.53 left 0 w 12.03 h 23); number ink bottom minus text ink bottom 0.03 (base 0.03)
PASS L5 webkit 1366 coarse dpr2: instruction top 50 (base 50), li height 277.33 (base 277.33)
PASS L6 webkit 1366 coarse dpr2: empty field top 0 left 24.03 w 503.97 h 44 (base top 0 left 24.03 w 503.97 h 44); Required top 44 left 24.03 w 503.97 h 15 (base top 44 left 24.03 w 503.97 h 15)
PASS L7 webkit 1366 coarse dpr2: focus-visible true outline {"style":"solid","width":"2px","offset":"2px"} (base true {"style":"solid","width":"2px","offset":"2px"})
PASS L8 webkit 1366 coarse dpr2: after Enter and Shift+Enter value 'Warm the milk' focus true (base 'Warm the milk' true)
PASS L9 webkit 1366 coarse dpr2: insertText with a line feed leaves 'Warmthe milk' (contract 'Warmthe milk'; the base input leaves 'Warm the milk')
PASS L10 webkit 1366 coarse dpr2: long text height 44 (filled 44, base long 44), scrollLeft 360 (base 587), scrollbars 0/0
PASS F0 webkit 1366 coarse dpr2: grams is TEXTAREA rows 1 inputmode decimal (base INPUT)
PASS G1 webkit 1366 coarse dpr2: grams box top 6 left 6 w 52 h 44 (base top 6 left 6 w 52 h 44)
PASS G2 webkit 1366 coarse dpr2: grams computed equal (16px 400 21.6px pad 6px/6px); resize none, scrollbars 0/0 (base resize none)
PASS G3 webkit 1366 coarse dpr2: grams text ink L23.5 T22.5 R50.5 B35 (base L23.5 T22.5 R50.5 B35)
PASS G4 webkit 1366 coarse dpr2: tr height 75.91 (base 75.91); ' g' top 19.54 left 58 w 12.89 h 17.67 (base top 19.54 left 58 w 12.89 h 17.67); name top 6.17 (base 6.17)
PASS G5 webkit 1366 coarse dpr2: picked row focused true (base true), mk-focus true (base true), outline {"style":"solid","width":"2px","offset":"2px"} (base {"style":"solid","width":"2px","offset":"2px"})
PASS G6 webkit 1366 coarse dpr2: after Enter and Shift+Enter value '150' focus true (base '150' true)
PASS G7 webkit 1366 coarse dpr2: insertText with a line feed leaves '150' (contract '150'; the base input leaves '15 0')
PASS G8 webkit 1366 coarse dpr2: 13 digits height 44 (filled 44, base long 44), scrollLeft 83 (base 91), scrollbars 0/0
INFO webkit 393 coarse lead-in: after TEXTAREA top 0 left 24.03 w 328.97 h 44 li 329.33; base INPUT top 0 left 24.03 w 328.97 h 44 li 329.33; ink after L24.03 T15.5 R148.53 B28.5 base L24.03 T15.5 R148.53 B28.5
INFO webkit 393 coarse grams: after TEXTAREA top 8 left 0 w 52 h 44 tr 80.91; base INPUT top 8 left 0 w 52 h 44 tr 80.91; ink after L17.5 T25 R44.5 B37.5 base L17.5 T25 R44.5 B37.5
PASS F1 chrome 1366 fine: coarse false equals hasTouch false
PASS F1 chrome 1366 fine: the same ingredient was picked, 'Alcohol 40%' (base 'Alcohol 40%')
PASS F0 chrome 1366 fine: lead-in is TEXTAREA rows 1 (base INPUT)
PASS L1 chrome 1366 fine: lead-in box top 1 left 23.13 w 504.88 h 26.5 (base top 1 left 23.13 w 504.88 h 26.5)
PASS L2 chrome 1366 fine: lead-in computed equal (15px 700 22.5px pad 0px/0px); resize none, scrollbars 0/0 (base resize none)
PASS L3 chrome 1366 fine: lead-in text ink L23.13 T7 R140.13 B19 (base L23.13 T7 R140.13 B19)
PASS L4 chrome 1366 fine: number top 0 left 0 w 11.13 h 24 (base top 0 left 0 w 11.13 h 24); number ink bottom minus text ink bottom 0 (base 0)
PASS L5 chrome 1366 fine: instruction top 33.5 (base 33.5), li height 182 (base 182)
PASS L6 chrome 1366 fine: empty field top 1 left 23.13 w 504.88 h 26.5 (base top 1 left 23.13 w 504.88 h 26.5); Required top 27.5 left 23.13 w 504.88 h 14 (base top 27.5 left 23.13 w 504.88 h 14)
PASS L7 chrome 1366 fine: focus-visible true outline {"style":"solid","width":"2px","offset":"2px"} (base true {"style":"solid","width":"2px","offset":"2px"})
PASS L8 chrome 1366 fine: after Enter and Shift+Enter value 'Warm the milk' focus true (base 'Warm the milk' true)
PASS L9 chrome 1366 fine: insertText with a line feed leaves 'Warmthe milk' (contract 'Warmthe milk'; the base input leaves 'Warm the milk')
PASS L10 chrome 1366 fine: long text height 26.5 (filled 26.5, base long 26.5), scrollLeft 337 (base 516), scrollbars 0/0
PASS F0 chrome 1366 fine: grams is TEXTAREA rows 1 inputmode decimal (base INPUT)
PASS G1 chrome 1366 fine: grams box top 6 left 6 w 52 h 26.25 (base top 6 left 6 w 52 h 26.25)
PASS G2 chrome 1366 fine: grams computed equal (15px 400 20.25px pad 6px/6px); resize none, scrollbars 0/0 (base resize none)
PASS G3 chrome 1366 fine: grams text ink L27 T13 R51 B24 (base L27 T13 R51 B24)
PASS G4 chrome 1366 fine: tr height 55.31 (base 55.31); ' g' top 10 left 58 w 12.78 h 17 (base top 10 left 58 w 12.78 h 17); name top 6 (base 6)
PASS G5 chrome 1366 fine: picked row focused true (base true), mk-focus true (base true), outline {"style":"solid","width":"2px","offset":"2px"} (base {"style":"solid","width":"2px","offset":"2px"})
PASS G6 chrome 1366 fine: after Enter and Shift+Enter value '150' focus true (base '150' true)
PASS G7 chrome 1366 fine: insertText with a line feed leaves '150' (contract '150'; the base input leaves '15 0')
PASS G8 chrome 1366 fine: 13 digits height 26.25 (filled 26.25, base long 26.25), scrollLeft 64 (base 70), scrollbars 0/0
PASS F1 chrome 1366 coarse: coarse true equals hasTouch true
PASS F1 chrome 1366 coarse: the same ingredient was picked, 'Alcohol 40%' (base 'Alcohol 40%')
PASS F0 chrome 1366 coarse: lead-in is TEXTAREA rows 1 (base INPUT)
PASS L1 chrome 1366 coarse: lead-in box top 0 left 23.13 w 504.88 h 44 (base top 0 left 23.13 w 504.88 h 44)
PASS L2 chrome 1366 coarse: lead-in computed equal (16px 700 24px pad 0px/0px); resize none, scrollbars 0/0 (base resize none)
PASS L3 chrome 1366 coarse: lead-in text ink L23.13 T15 R148.13 B27 (base L23.13 T15 R148.13 B27)
PASS L4 chrome 1366 coarse: number top 8 left 0 w 11.13 h 24 (base top 8 left 0 w 11.13 h 24); number ink bottom minus text ink bottom 0 (base 0)
PASS L5 chrome 1366 coarse: instruction top 50 (base 50), li height 276 (base 276)
PASS L6 chrome 1366 coarse: empty field top 0 left 23.13 w 504.88 h 44 (base top 0 left 23.13 w 504.88 h 44); Required top 44 left 23.13 w 504.88 h 14 (base top 44 left 23.13 w 504.88 h 14)
PASS L7 chrome 1366 coarse: focus-visible true outline {"style":"solid","width":"2px","offset":"2px"} (base true {"style":"solid","width":"2px","offset":"2px"})
PASS L8 chrome 1366 coarse: after Enter and Shift+Enter value 'Warm the milk' focus true (base 'Warm the milk' true)
PASS L9 chrome 1366 coarse: insertText with a line feed leaves 'Warmthe milk' (contract 'Warmthe milk'; the base input leaves 'Warm the milk')
PASS L10 chrome 1366 coarse: long text height 44 (filled 44, base long 44), scrollLeft 360 (base 584), scrollbars 0/0
PASS F0 chrome 1366 coarse: grams is TEXTAREA rows 1 inputmode decimal (base INPUT)
PASS G1 chrome 1366 coarse: grams box top 6 left 6 w 52 h 44 (base top 6 left 6 w 52 h 44)
PASS G2 chrome 1366 coarse: grams computed equal (16px 400 21.6px pad 6px/6px); resize none, scrollbars 0/0 (base resize none)
PASS G3 chrome 1366 coarse: grams text ink L25 T21 R51 B33 (base L25 T21 R51 B33)
PASS G4 chrome 1366 coarse: tr height 75.31 (base 75.31); ' g' top 19.19 left 58 w 12.78 h 17 (base top 19.2 left 58 w 12.78 h 17); name top 6 (base 6)
PASS G5 chrome 1366 coarse: picked row focused true (base true), mk-focus true (base true), outline {"style":"solid","width":"2px","offset":"2px"} (base {"style":"solid","width":"2px","offset":"2px"})
PASS G6 chrome 1366 coarse: after Enter and Shift+Enter value '150' focus true (base '150' true)
PASS G7 chrome 1366 coarse: insertText with a line feed leaves '150' (contract '150'; the base input leaves '15 0')
PASS G8 chrome 1366 coarse: 13 digits height 44 (filled 44, base long 44), scrollLeft 71 (base 77), scrollbars 0/0
PASS F1 chrome 1366 coarse dpr2: coarse true equals hasTouch true
PASS F1 chrome 1366 coarse dpr2: the same ingredient was picked, 'Alcohol 40%' (base 'Alcohol 40%')
PASS F0 chrome 1366 coarse dpr2: lead-in is TEXTAREA rows 1 (base INPUT)
PASS L1 chrome 1366 coarse dpr2: lead-in box top 0 left 23.13 w 504.88 h 44 (base top 0 left 23.13 w 504.88 h 44)
PASS L2 chrome 1366 coarse dpr2: lead-in computed equal (16px 700 24px pad 0px/0px); resize none, scrollbars 0/0 (base resize none)
PASS L3 chrome 1366 coarse dpr2: lead-in text ink L23.13 T14.5 R148.13 B27.5 (base L23.13 T14.5 R148.13 B27.5)
PASS L4 chrome 1366 coarse dpr2: number top 8 left 0 w 11.13 h 24 (base top 8 left 0 w 11.13 h 24); number ink bottom minus text ink bottom -0.5 (base -0.5)
PASS L5 chrome 1366 coarse dpr2: instruction top 50 (base 50), li height 276 (base 276)
PASS L6 chrome 1366 coarse dpr2: empty field top 0 left 23.13 w 504.88 h 44 (base top 0 left 23.13 w 504.88 h 44); Required top 44 left 23.13 w 504.88 h 14 (base top 44 left 23.13 w 504.88 h 14)
PASS L7 chrome 1366 coarse dpr2: focus-visible true outline {"style":"solid","width":"2px","offset":"2px"} (base true {"style":"solid","width":"2px","offset":"2px"})
PASS L8 chrome 1366 coarse dpr2: after Enter and Shift+Enter value 'Warm the milk' focus true (base 'Warm the milk' true)
PASS L9 chrome 1366 coarse dpr2: insertText with a line feed leaves 'Warmthe milk' (contract 'Warmthe milk'; the base input leaves 'Warm the milk')
PASS L10 chrome 1366 coarse dpr2: long text height 44 (filled 44, base long 44), scrollLeft 360 (base 584), scrollbars 0/0
PASS F0 chrome 1366 coarse dpr2: grams is TEXTAREA rows 1 inputmode decimal (base INPUT)
PASS G1 chrome 1366 coarse dpr2: grams box top 6 left 6 w 52 h 44 (base top 6 left 6 w 52 h 44)
PASS G2 chrome 1366 coarse dpr2: grams computed equal (16px 400 21.6px pad 6px/6px); resize none, scrollbars 0/0 (base resize none)
PASS G3 chrome 1366 coarse dpr2: grams text ink L25.5 T21.5 R50.5 B33.5 (base L25.5 T21.5 R50.5 B33.5)
PASS G4 chrome 1366 coarse dpr2: tr height 75.31 (base 75.31); ' g' top 19.19 left 58 w 12.78 h 17 (base top 19.2 left 58 w 12.78 h 17); name top 6 (base 6)
PASS G5 chrome 1366 coarse dpr2: picked row focused true (base true), mk-focus true (base true), outline {"style":"solid","width":"2px","offset":"2px"} (base {"style":"solid","width":"2px","offset":"2px"})
PASS G6 chrome 1366 coarse dpr2: after Enter and Shift+Enter value '150' focus true (base '150' true)
PASS G7 chrome 1366 coarse dpr2: insertText with a line feed leaves '150' (contract '150'; the base input leaves '15 0')
PASS G8 chrome 1366 coarse dpr2: 13 digits height 44 (filled 44, base long 44), scrollLeft 71 (base 77), scrollbars 0/0
INFO chrome 393 coarse lead-in: after TEXTAREA top 0 left 23.13 w 329.88 h 44 li 328; base INPUT top 0 left 23.13 w 329.88 h 44 li 328; ink after L23.13 T15 R148.13 B28 base L23.13 T15 R148.13 B28
INFO chrome 393 coarse grams: after TEXTAREA top 8 left 0 w 52 h 44 tr 80.31; base INPUT top 8 left 0 w 52 h 44 tr 80.31; ink after L19.5 T24 R44.5 B36 base L19.5 T24 R44.5 B36
132 PASS, 0 FAIL

```

## Deviations from Plan

**1. [Rule 1 - Plan assumption wrong] L9/G7 base expectation.** The plan expected the base input to strip a pasted line feed (`Warmthe milk`, `150`). Both engines' inputs actually turn it into a space (`Warm the milk`, `15 0`). The gates L9/G7 therefore check the after build against the plan's stated contract (every LF and CR removed, no space) and print the base figure for the record. Whether a pasted line break should become a space, as the inputs did, instead of vanishing is a one-line change in `stripNewlines`; flagged for the orchestrator. Return itself behaves identically (nothing inserted).

**2. [Rule 3 - Blocking] Probe methods.** Playwright `keyboard.insertText('a\nb')` presses Enter in WebKit (not a paste), and `fill` plus End does not reveal the caret in a WebKit textarea. The probe uses `document.execCommand('insertText')` for the paste check and `keyboard.type` for the scroll-to-caret check. Both are properties of the probe, not the app. Also, the ink clip of the bordered grams field is inset by 2 px so an engine that rounds a clip outward does not pull the field's own rule into the ink box.

**3. [Rule 3 - Blocking] One test selector the plan missed.** `IngredientTable.creating.test.jsx` line ~281 counted grams fields with `tbody input` (Move buttons plus grams fields, 9 names); it now reads `tbody textarea`. Without it that test failed (6 names).

The tracer gate: Task 1's probe was run end-to-end on the lead-in (78 PASS, 0 FAIL) before the grams change was made.

## Notes for the orchestrator

- Quick 261027-ubi's probe gates U1, U4 and U5 select the creation lead-in by its old tag (`input[data-field="lead-in"]`) and will no longer find it. This plan's L1, L4 and L5 cover the same ground against base. The old probe was not edited.
- Screen readers now meet two textareas, so the fields may be announced as multi-line. No aria-multiline was added (decided).
- The HEAD at planning (e0015f23) had moved to e63381c7 (docs only); app/src was clean, so the base build is the same code.
- Nothing was written to Mark's List, STATE.md or ROADMAP.md; this SUMMARY is uncommitted as instructed.
- app/dist/index.html mtime unchanged (1793559325); port 4173 still has only Mark's preview (pid 31386); no Vite dev or preview was started.

## Deferred Human Verification

For the orchestrator's iPad check (iPadOS 27.0.1 Safari, Magic Keyboard, Full Keyboard Access off). The orchestrator rebuilds app/dist; the executor never did.

1. Open a new recipe, press Add step, tap the step's lead-in and type a word.
2. Press Tab. Expect: focus moves to that step's instruction field.
3. Press Add ingredient, pick a row, type 150 in its grams field.
4. Press Tab. Expect: focus moves to the row's next control, not out of the page.
5. Press Return in the lead-in and in grams. Expect: nothing is inserted and focus stays.
6. Look at both fields against the previous build. Expect: same size, same text position, same rule under grams.

## Self-Check: PASSED

Files exist (oneLineField.js, the probe, this SUMMARY); commits 22ec33f5 and ed93b024 are on main; full suite 4246 pass.
