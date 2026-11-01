---
status: resolved
trigger: "With the Magic Keyboard on the iPad, Tab from a creation step's lead-in does not reach the instruction field, and Tab from a row's grams field does nothing; the on-screen keyboard's Tab moves lead-in to instruction but never to the step's links. Chromium on the Mac is fine. Bug row bug-p11-ipad-hardware-tab-skips-fields on Mark's List; D-19 (literal tabIndex) and the ios-keyboard-bar memory are the known history."
created: 2026-11-01T18:50:00Z
updated: 2026-11-01T20:59:47Z
---

## Current Focus

goal: find_and_fix
bug_class: "Bohrbug on the device as reported (every attempt fails), but its mechanism sits in iPadOS UIKit/Safari's routing of a hardware Tab from an editable field, which no local engine models. SBFL skipped: the suite runs under jsdom/node; desktop Playwright WebKit has no iPadOS hardware-keyboard path."
known_pattern_candidate: "none in a knowledge base (none exists). Sibling sessions (link/form-control gates, FKA off) explain buttons and links but not a text field failing to reach the next text field: WebKit never gates text inputs or textareas."
hypothesis: "CONFIRMED (round 3, Mark 2026-11-01): on iPadOS 27 Safari 27.0.1 a Magic Keyboard Tab is lost from every <input> element tried (type text, search, number, tel; text with inputmode=decimal; text inside a <form>; text with enterkeyhint=next): no keydown, window blur, focus leaves the page. A <textarea rows=1> and a contenteditable div receive keydown Tab and focus moves to the next control. Sprinkles' lead-in and grams are <input type=text>, hence the bug; every other single-line <input> in the app is affected the same way."
next_action: "Done. Fixed in quick 261101-lec (22ec33f5, ed93b024); Mark passed the iPad check on 2026-11-01. The other single-line inputs in the app have the same platform behaviour: Mark's List row bug-ipad-tab-lost-from-single-line-fields. Test servers on 8098 and 8099 stopped."

## Symptoms

expected: "In the creation editor (/notebook/new), Tab from a step's lead-in moves to that step's instruction field, then on through the step's controls (Add target, Preview step, Change ingredients, Add purpose, Add aside, Remove, Move up, Move down, Add step). Tab from a row's grams field moves to the next control in order."
actual: "With the Magic Keyboard attached: with the caret in a step's lead-in, Tab and Return do not advance to the instruction field. With the caret in a row's grams field, Tab does nothing. With the on-screen keyboard instead, its Tab moves between lead-in and instruction but never reaches the step's links (Move up, Move down, Remove)."
errors: "None reported."
reproduction: "Mark's iPad, Safari (WebKit), landscape ~1366px, coarse pointer, Magic Keyboard, Full Keyboard Access OFF (Mark's standing setting; FKA on locks the keyboard). Production build via `npm --prefix app run build && npm --prefix app run preview -- --host`, served at http://192.168.1.133:4173. New recipe, name it, Start, Add step, tap into the lead-in, press Tab. Add an ingredient, tap into its grams field, press Tab."
started: "First seen on the iPad check of 2026-10-27 (check-p11-ipad-create-steps-save-print-edit, steps 10 and 11). Confirmed still current by Mark on 2026-11-01. The same Tab path works in Chromium on the Mac."

## Context

- Mark is at the iPad with the Magic Keyboard now and can press keys and report what focus does. Ask him one short, concrete thing at a time; he reads at arm's length.
- Known history: D-19 (every button, checkbox and radio renders through app/src/ui/Button.jsx, Checkbox.jsx or Radio.jsx with a literal tabIndex={0}; links carry tabIndex={0}; enforced by app/src/ui/tabindex-scan.test.js) and why in .planning/notes/2026-10-01-engineering-notes.md. Prior sessions: .planning/debug/ipad-tab-never-enters-app.md, ipad-keyboard-locks-after-tab.md, ipad-recipe-page-tab-skips-controls.md (WebKit's form-control keyboard-focus gate with FKA off). iOS keyboard bar skips radio axes (accepted, 2026-10-03).
- Playwright WebKit (desktop) is available via /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs; it does not model iPadOS hardware-keyboard focus, so a desktop pass proves nothing about the device. Device-verified only when Mark confirms.
- Constraints: never edit app/ outside a GSD flow is relaxed here only because /gsd-debug is the GSD flow Mark invoked; keep the fix minimal and run `npm --prefix app test`. Never build into app/dist without telling the orchestrator (Mark's preview on 4173 serves it; a rebuild for his device test is expected and fine once a fix exists). Commit messages English, ending with:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2

## Eliminated

- hypothesis: "H1: hardware Tab reaches the page and UIKit's text-command/system path claims it in _interpretKeyEvent"
  evidence: "No keydown Tab in the device log (seq contiguous); H1 needs a dispatched keydown because _interpretKeyEvent runs during the keydown's default handling."
  timestamp: 2026-11-01T19:09:00Z
- hypothesis: "H2: UIKit inserts a tab character into the field"
  evidence: "No beforeinput/input after the typed letter or digit; field length unchanged (len=1 lead-in, len=4 grams); tabs=0."
  timestamp: 2026-11-01T19:09:00Z
- hypothesis: "H4: DOM focus moves and the UI does not follow, or focus bounces back"
  evidence: "No focusout/focusin between the typed key and Mark's next tap (lead-in) or leaving the page (grams)."
  timestamp: 2026-11-01T19:09:00Z

- hypothesis: "S: something on the Sprinkles page or in its fields steers the Tab"
  evidence: "The bare page with no Sprinkles code behaves the same: no keydown Tab, window blur on each Tab (round 2)."
  timestamp: 2026-11-01T20:13:05Z
- hypothesis: "W: text-assist attributes (writingsuggestions, autocorrect, autocomplete, spellcheck) steer UIKit"
  evidence: "Boxes Four and Six, with those attributes off, fail the same way as One (round 2)."
  timestamp: 2026-11-01T20:13:05Z
- hypothesis: "K: iPadOS takes every non-character key"
  evidence: "Backspace logs keydown keyCode=8 and deleteContentBackward on the device (round 2)."
  timestamp: 2026-11-01T20:13:05Z

## Evidence

- timestamp: 2026-11-01T18:51:00Z
  checked: ".planning/debug/knowledge-base.md, resolved/, sibling sessions ipad-tab-never-enters-app, ipad-keyboard-locks-after-tab, ipad-recipe-page-tab-skips-controls, engineering notes D-19"
  found: "No knowledge base. Siblings settle the WebKit link gate (TabsToLinks) and form-control gate (KeyboardAccessFull) for <a>/<button>/checkbox/radio with FKA off, remedied by literal tabIndex={0} (Button/Checkbox/Radio). They record text <input> and <textarea> as always keyboard-focusable (TextFieldInputType.cpp, HTMLTextAreaElement.h)."
  implication: "The known gates cannot explain the lead-in case: the lead-in is <input type=text> and the instruction is <textarea>, both ungated. A different mechanism is at work."

- timestamp: 2026-11-01T18:51:30Z
  checked: "app/src/ui/CreationSteps.jsx (whole), FieldFeedback.jsx, Button.jsx, Checkbox.jsx; IngredientTable.jsx creating branch (renderCreatingEntry, focus effects, RowActs); CreationPage.jsx focus-request effect and grams handlers; grep of app/src for keydown|onKey|preventDefault|addEventListener|.focus(|autoFocus|inert|beforeinput|onInput|onBlur|onFocus"
  found: |
    Lead-in: <label class=method-step__field><input type=text class="prose-field prose-field--lead-in" data-field=lead-in>{FieldFeedback: span or null}</label>
    then directly <label class=method-step__field><textarea class=prose-field rows=2></label>. No element of any kind between them that is focusable; no key handler on either field or any ancestor in the step except the uses line (Escape only, gated on the checklist open).
    Grams: <input type=text inputMode=decimal class=ink-field> with onChange and onBlur only (onBlur -> handleBlurGrams sets focusRowId null; IngredientTable's focus effect focuses only when focusLine becomes non-null). Next in DOM order: the row's RowActs Buttons (tabIndex 0).
    Document keydown listeners: Shell.jsx fly-out trap (only while the Places fly-out is open) and import-errors Escape (only while errors show); RecipePage's pen listener (not on /notebook/new). CreationPage's focus effect runs only when focusRequestRef is set by an action handler.
  implication: "Nothing in the app intercepts, prevents or redirects Tab on these two fields, and no app code moves focus on blur. The app-side 'key handler / focus bounce' family is unlikely from source; the failure lies in how iPadOS WebKit routes a hardware Tab from an editable field."

- timestamp: 2026-11-01T18:52:00Z
  checked: "WebKit main (fetched 2026-11-01): WKContentViewInteraction.mm _interpretKeyEvent (7769-7840), canPerformActionForWebView (4734-4742), accessoryTab / accessoryView:tabInDirection: (6288-6311); WebPageIOS.mm handleEditingKeyboardEvent (687-722); EventHandler.cpp defaultKeyboardEventHandler (4684-4725) and defaultTabEventHandler (5487-5510); FocusController.cpp advanceFocusInDocumentOrder (773-787)"
  found: |
    Two Tab paths exist on iOS while a text field is focused:
      (A) UIKit's accessory tab: _nextAccessoryTab: is performable only when _hasFocusedElement && _focusedElementInformation.hasNextNode; it calls WebPageProxy::focusNextFocusedElement -> WebPage nextAssistableElement (text fields, textareas, selects, contentEditable; skips buttons, links and obscured elements). The keyboard accessory bar and (by its observed behaviour) the on-screen keyboard's Tab key take this path.
      (B) WebCore's own Tab: the hardware keydown is dispatched to the page; in its default handling Editor -> WebPage::handleEditingKeyboardEvent -> sync InterpretKeyEvent -> _interpretKeyEvent. With contentEditable true, UIKit's [UIKeyboardImpl handleKeyTextCommandForCurrentEvent] may claim the key (return YES = handled, WebCore stops); else WebCore runs defaultTabEventHandler -> FocusController::advanceFocus(Forward) to the next keyboard-focusable element in DOM order (tabindex-0 buttons included). On iOS 17.4+ with BrowserEngineKit async interactions, the decision is instead [systemDelegate shouldDeferEventHandlingToSystemForTextInput:].
  implication: "Mark's two observations split exactly along these paths: on-screen Tab (A) reaches the textarea and skips the step's buttons (nextAssistableElement, the same Safari form-assist behaviour as the accepted ios-keyboard-bar-skips-axis-stops); hardware Tab is routed through (B) or claimed by UIKit's text-command/system path without moving focus. Which of those happens is not decidable from open source (UIKit and Safari are closed) and needs an event-level observation on the device."

- timestamp: 2026-11-01T18:52:30Z
  checked: ".planning/quick/261001-doi-*/261001-doi-SUMMARY.md (Device check), BatchRow.jsx MeasuredField; WebKit LayoutTests fast/events/ios/tab-cycle.html and focus-tab-next-field.html (hardware keyboard mode)"
  found: "Mark confirmed on 2026-10-01 that hardware Tab from Churn duration reached Exit consistency, Airiness (radio groups), the three textareas, Add tasting, Cancel and Save batch in order. Churn duration is <input type=text inputMode=decimal class=ink-field> inside a <label> -- the same shape as the creation grams field. WebKit's own iOS tests assert hardware Tab cycles input -> iframe input -> textarea, and input -> next input."
  implication: "Hardware Tab from a text field on Mark's iPad took WebCore's advanceFocus path a month ago (radios and buttons are never reached by the accessory path). Either something differs on /notebook/new, or the platform changed since 2026-10-01 (an iPadOS update). The Churn duration field is the control for a later round if the event log does not decide it."

- timestamp: 2026-11-01T18:53:00Z
  checked: "app/dist mtimes vs git log; the bundle's chooser aria-label; the running preview (pid 31386, started 2026-10-19, sirv dev:true)"
  found: "dist was built 2026-10-31 13:07:59, before 62833ee1 (13:16:44); the bundle still has aria-label `Add ${e} to step ${t.number}`. 62833ee1 touched only IngredientTable's chooser labels. The preview serves dist with sirv dev:true, so new files and a rebuild are picked up without restart."
  implication: "Mark's build is 62833ee1's parent for app code; the difference is the chooser's accessible name only and cannot bear on Tab. A rebuild brings dist to current main before the probe goes in."

- timestamp: 2026-11-01T18:54:00Z
  checked: "Diagnostic build: dist rebuilt from current main (index-BZIl1q9s.js), scratchpad/probe/__probe.js copied to dist/__probe.js and loaded first in dist/index.html's head; log sink scratchpad/probe/logserver.mjs on 0.0.0.0:8099 (firewall off). Self-test and a desktop Playwright WebKit 26.6 baseline (1366x1024, touch) of the creation editor through the probe."
  found: |
    Beacons arrive (probe ready + events). Desktop WebKit baseline, same build:
      lead-in: keydown Tab target=INPUT "Step 1, lead-in", defaultPrevented=false, focusout INPUT -> focusin TEXTAREA "Step 1, instruction".
      grams:   keydown Tab target=INPUT "Alcohol 40%, grams", defaultPrevented=false, focusout INPUT -> focusin BUTTON "remove Alcohol 40%" ti=0.
    No app handler prevents Tab on either field.
  implication: "The page's own behaviour on the engine is correct and the instrument works. Any departure in the device log is the iPadOS key-routing layer."

- timestamp: 2026-11-01T19:09:00Z
  checked: "Device log (scratchpad/probe/device-log-1.txt plus probe.log lines after it), read against __probe.js. Mark's answer: 'Both stayed put' (cursor stayed in lead-in, then in grams, after each Tab)."
  found: |
    Device: 192.168.1.105, UA Safari Version/27.0.1 (iPadOS 27.0.1; desktop-class UA), touch=5, 1366x892. Prior sessions recorded iPadOS 26 on 2026-09-22, so the iPad was updated since.
    The probe would log a Tab: the capture keydown listener on window logs every keydown and passes key "Tab" through unchanged (desktop baseline lines 4, 47, 65, 136 show keydown "Tab" code=Tab keyCode=9 from this same file).
    Lead-in: seq 155 focusin, 159-163 KeyA keydown/keypress/beforeinput/input/keyup, then seq 164 = pointerdown on grams 9.4 s later. Grams: seq 166 focusin, 168-172 Digit1, then seq 173-174 = window blur / visibility hidden at 19:07:46 (Mark leaving the page, 5 min later). Sequence numbers are contiguous, so no beacon was lost: in both windows the page received no keydown, keypress, keyup, beforeinput, input, focusout or focusin of any kind.
    Non-character keys elsewhere in the session: Shift keydowns (seq 22, 50) and Space (seq 44) only. Shift reaches the page by WKContentView's synthetic flags-changed path (modifierFlagsDidChangeFrom), not the ordinary key path, so no non-character, non-modifier key (Tab, Backspace, Return, arrows) is shown reaching the page on the device in this session.
    WebKit source (EventHandler::internalKeyEvent 4461-4495; WKContentView _internalHandleKeyWebEvent 7707-7739): once UIKit hands a hardware key to WKContentView's handleKeyWebEvent, a DOM keydown is always dispatched, even when the input method claims the key first (it is then sent with keyCode 229). H1 and H2 both require that keydown.
  implication: "H3 holds: the hardware Tab is consumed before WKContentView's handleKeyWebEvent, upstream of WebKit (UIKit key-command / focus-system routing or Safari), and no app JavaScript can see or act on it. H1, H2 and H4 are refuted. Open: whether this happens on every page on this iPad (platform, iPadOS 27) or only on Sprinkles (something page- or field-specific steering UIKit), and whether all non-character keys or only Tab are taken."

- timestamp: 2026-11-01T20:13:05Z
  checked: "Round 2 device log on the bare page (scratchpad/probe/site/tab.html; copy at scratchpad/probe/device-log-2.saved.txt), read by the orchestrator; Mark's answers: 'All stayed put', then his clarification: 'the cursor left the field, but no other field was focused. blue focus ring left all 3'."
  found: |
    Device 192.168.1.105, Safari Version/27.0.1. Two passes at 20:0xZ, same result both times.
    Backspace reaches the page: keydown "Backspace" code=Backspace keyCode=8 then input deleteContentBackward (seq 16/18 first pass; 42-60 second pass). So not every non-character key is taken (K refuted).
    Tab in One, Four and Six: no keydown Tab, no focusout/focusin. At the moment of each Tab the log shows only `window blur ... hasFocus=false` (first pass seq 20, 31, 42; second pass seq 62, 106, 154). activeElement stays the field, but the document no longer has focus. The next tap brings `window focus` back.
    Four (writingsuggestions=false) and Six (autocomplete/autocorrect/autocapitalize/spellcheck off) behave like One (W refuted). No focus move to Two (A refuted). No keydown Tab at all (S refuted).
    Round 1 on Sprinkles: the grams Tab is followed by window blur / visibility events (seq 173-181); the lead-in Tab shows no event before Mark's next tap, consistent with the same blur being dropped or Mark's 'stayed put' meaning the cursor looked unchanged.
  implication: "P holds: iPadOS 27 Safari routes a hardware Tab from a text field out of the web content (window blur), before WebKit dispatches it. Every page on this iPad behaves the same; Sprinkles cannot see or prevent it. The 2026-10-01 pass (hardware Tab from Churn duration walked the fields) predates the iPadOS 27 update, which is the likely change (unconfirmed)."

- timestamp: 2026-11-01T20:17:29Z
  checked: "Mark on the bare page: 'when I put the cursor in box Two and tab or shift tab, it works fine'. Log saved at scratchpad/probe/device-log-3.saved.txt (802 lines)."
  found: |
    Every keydown "Tab" on the device has target TEXTAREA "Two" or BUTTON "Three" (seq 230, 238, 265, 275, 286, 301, 310, 321, 337), each followed by focusout/focusin to the next or previous control in order, Shift-Tab included (Three -> Two -> One).
    Every Tab from INPUT[text] One or Four logs only `window blur` (seq 193-222, 246, 251-259, 294, 331), including from One reached by Shift-Tab (seq 324 focusin One, 331 blur).
  implication: "The loss is specific to single-line <input type=text>. The round-2 'platform, every field' reading was too broad: <textarea> and <button> take hardware Tab normally on the same iPad, so an app-side fix through the field kind is likely."

- timestamp: 2026-11-01T20:23:32Z
  checked: "Round 3 bare page scratchpad/probe/site/tab3.html (eight field kinds A-H, each followed by an 'after' button); Mark: 'G & H are only ones that move to their after button'. Device log saved at scratchpad/probe/device-log-4.saved.txt. Desktop WebKit baseline (walk3.mjs): all eight move to their 'after' button."
  found: |
    A input[type=search], B input[type=number], C input[type=text][inputmode=decimal], D input[type=tel], E input[type=text] inside <form>, F input[type=text][enterkeyhint=next]: no keydown Tab; window blur after each Tab (seq 13, 66, 87, 172, 191/222, 235/239).
    G div[contenteditable][role=textbox]: keydown Tab (seq 254) then focusin "after G" (257).
    H textarea rows=1: keydown Tab (seq 272) then focusin "after H" (275).
  implication: "The loss is tied to the <input> element itself, not its type, keypad, form or Return label. A one-row <textarea> is a working field kind for the lead-in and the grams field."

## Resolution

root_cause: "iPadOS 27 Safari (27.0.1) drops a Magic Keyboard Tab from any <input> element (all types tried) and moves focus out of the page; <textarea> and contenteditable are unaffected. Sprinkles' creation lead-in and grams fields were single-line inputs. Platform behaviour, reproduced on bare pages."
fix: "Quick 261101-lec: the creation step's lead-in (22ec33f5) and the creating row's grams field (ed93b024) render as one-row <textarea> elements (app/src/ui/oneLineField.js holds Return and strips newlines; tokens-only CSS in notebook.css keeps the look). Visual parity proven by the quick's probe (132 PASS, WebKit and Chrome at 1366 fine, coarse and coarse DPR 2)."
verification: "Mark on the iPad, 2026-11-01 (Safari 27.0.1, Magic Keyboard, FKA off): Tab from the lead-in reaches the instruction; Tab from grams reaches the row's next control; Return inserts nothing in either; both fields look as before. Suite 4246 passing."
files_changed: ["app/src/ui/oneLineField.js", "app/src/ui/CreationSteps.jsx", "app/src/ui/IngredientTable.jsx", "app/src/ui/CreationPage.jsx", "app/src/styles/notebook.css"]
