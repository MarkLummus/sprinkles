---
status: diagnosed
trigger: "fail. on recipes page, only link on the recipes page is Sprinkles link in the sheet header, then back to Search"
created: 2026-09-22T23:15:00Z
updated: 2026-09-22T23:55:00Z
---

## Current Focus

goal: find_root_cause_only
bug_class: "Bohrbug -- deterministic from markup + WebKit source, confirmed by an on-device differential in the same round (shell <button tabindex=0> rings with FKA off; recipe-page <button> without tabindex does not). SBFL skipped: the suite runs under jsdom/node, which models neither WebKit's form-control gate nor iPadOS keyboard focus."
known_pattern_candidate: "ipad-tab-never-enters-app (G-03.4-r3-3) + ipad-keyboard-locks-after-tab (G-03.4-r4-1) -- same WebKit keyboard-focus gates; 03.4-14 and 03.4-15 applied the explicit-tabindex remedy to Link/NavLink (and the shell's own buttons) only. This session is the form-control half of the same gate."

hypothesis: "CONFIRMED. With Full Keyboard Access off, WebKit's keyboardUIMode has neither KeyboardAccessFull nor TabsToLinks, so HTMLFormControlElement::isKeyboardFocusable excludes every <button>, checkbox and radio that lacks an explicit tabindex. The recipe page in its default reading state renders its own controls exclusively as tabindex-less <button> elements (History, Next version, Record batch/another, Show changes, Batches (N), Correct, six GraduatedRule buttons) and no text field; its only tabindex-0 elements after the running head are the From version / From batch lineage links, which do not render on a root version such as the seeded Olive Oil v1. So after the running head the document has no keyboard-focusable element and the next Tab relinquishes to Safari's chrome ('then back to Search'). History, being a gated button, cannot be opened by keyboard, so its links (mounted only while open) are unreachable too."
test: "Done: full reading-mode inventory of the recipe route; seed data; shipped-bundle check; WebKit main source for button/select/checkbox/radio/textarea/text/date/summary gates; on-device differential from UAT round five test 1."
expecting: "n/a -- diagnosed."
next_action: "Diagnosis complete (goal: find_root_cause_only). Hand back; no fix applied."

reasoning_checkpoint:
  hypothesis: "The recipe page's own controls are skipped by Tab on Mark's iPad because each is a <button> without an explicit tabindex, and with FKA off WebKit's HTMLFormControlElement::isKeyboardFocusable (HTMLFormControlElement.cpp:220-227) returns tabsToAllFormControls(), which is false without KeyboardAccessFull or TabsToLinks (EventHandler.cpp:5097-5118, per ipad-tab-never-enters-app.md). The page has no ungated control (no text field/textarea/select) in reading mode, and the seeded root version renders no lineage link, so nothing follows the running head."
  confirming_evidence:
    - "Direct (device, same round, FKA off): test 1 PASSED with rings on Import and Export -- <button tabindex=0> (Shell.jsx:231,235). Test 2 FAILED on the recipe page, whose buttons carry no tabindex. Same device, same setting, same build: the explicit tabindex is the only difference between buttons that ring and buttons that do not."
    - "Direct (shipped bundle index-9kqhhgeH.js, built 18:36 after 0009e12): Next version, Record another/batch, Show changes and HistoryDisclosure are emitted as `button` with no tabIndex prop."
    - "Direct (source): reading-mode inventory -- zero <input>/<textarea>/<select> on the route; FormulationNote.jsx:19 passes tabIndex undefined (reading) or -1 (pens) to GraduatedRule, never 0; VersionRow/BatchRow h2 computed tabIndex is -1 or undefined, never 0; HistoryPanel/BatchHistoryPanel mount their links only while open."
    - "Direct (data): seed.js saves one version, olive-oil-ice-cream-v1, parentVersionId null, citedBatchId null -> VersionRow.jsx:217 and :242 guards render neither lineage link."
    - "Direct (WebKit main): HTMLButtonElement has no isKeyboardFocusable override (inherits the gated HTMLFormControlElement path); checkbox/radio go InputType::isKeyboardFocusable (InputType.cpp:711-716) -> HTMLInputElement::isTextFormControlKeyboardFocusable (HTMLInputElement.cpp:442-445) -> HTMLTextFormControlElement (no override) -> HTMLFormControlElement::isKeyboardFocusable -> gated."
  falsification_test: "On the iPad (FKA off), open a recipe, tap beside the wordmark, Tab past the running head. If any tabindex-less <button> on the page (e.g. History or Next version) takes a ring, the form-control-gate account is wrong. Conversely, adding tabIndex={0} to History alone in a local build should make exactly that one control ring next."
  fix_rationale: "N/A -- diagnose-only. HTMLFormControlElement.cpp:222-223 routes any form control with an explicit tabindex to Element::isKeyboardFocusable, bypassing tabsToAllFormControls -- the same mechanism 03.4-14 already relies on for Import/Export, which Mark saw ring with FKA off."
  blind_spots:
    - "Which recipe/version Mark actually opened: the iPad's IndexedDB (origin 192.168.1.133:4173) is not inspectable from here. Seed data plus 'only link ... is Sprinkles' both point to a root version. If it had been a child version, From version would have rung and then the same exit would follow -- the page's own controls would still be skipped."
    - "What 'back to Search' is exactly (chrome wrap and re-entry, or the chrome's own ring toggling next to Search) -- the same boundary behaviour test 1 recorded on Home; not load-bearing for the cause."
    - "Pen modes (recording/developing/amend) were not exercised by the UAT; by the same gate their text/date inputs, textareas and <select> would ring but their buttons, radios (Segmented, AxisMark) and checkboxes (Skipped, uses) -- including Save and Cancel -- would not. Inferred from source, not observed."
  candidate_causes:
    - "code: every recipe-page control is a tabindex-less <button> (form-control gate) -- CONFIRMED"
    - "environment: FKA off, so KeyboardAccessFull is false and tabsToAllFormControls() is false -- CONFIRMED contributing condition (Mark's standing decision; FKA on made buttons reachable but routed Tab through UIKit and locked the keyboard)"
    - "data: the opened version is a root (seed v1) so the only ungated-by-tabindex links on the page (From version / From batch) are absent -- CONFIRMED contributing condition for 'only the Sprinkles link'"
    - "code (eliminated): a focus sink, trap or key handler on the recipe route -- see Eliminated"
    - "test-authoring: the truth's 'Open History with Space' presumes History is Tab-reachable; it is a gated button, so that step cannot be performed by keyboard with the current markup"
  and_gate: "yes. The observed 'only Sprinkles, then back to Search' needs (i) tabindex-less <button> controls (code) AND (ii) no KeyboardAccessFull/TabsToLinks (environment: FKA off) AND (iii) no lineage link rendered (data: root version). Removing (i) fixes it on every version; (ii) is Mark's settled choice and must be treated as the baseline; (iii) only changes whether one or two links ring before the same exit."

## Symptoms

expected: "Open a recipe and tap beside the wordmark. Tab through the nine shell stops. The running head's Sprinkles link rings next, then the page's own controls in order. From version and From batch ring as links where present. Open History with Space and every version/batch name shown as a link rings."
actual: "fail. on recipes page, only link on the recipes page is Sprinkles link in the sheet header, then back to Search"
errors: "None reported."
reproduction: "Test 2 in 03.4-UAT.md (round five). Mark's iPad, Safari/WebKit, ~1366px, hardware keyboard, Full Keyboard Access OFF, production build via vite preview --host :4173."
started: "2026-09-22 UAT round five, right after 03.4-15 put tabIndex={0} on all 17 Link sites outside the shell. Home passed in the same round with FKA off."

## Eliminated

- hypothesis: "A focus sink, trap or key handler on the recipe route swallows Tab after the running head."
  evidence: "RecipePage's only document keydown listener (RecipePage.jsx:821-836) is registered only while a pen is open (derivePenState -> openPen !== null) and handles only Escape; in reading mode it is not registered. No inert, no autofocus, no tabindex=-1 on anything focusable in reading mode. Home's links carry no route state (RecipeList.jsx:110,170-195,229), so focusVersionOnMount/focusBatchOnMount are false and no landing focus() runs. Nothing takes focus -- there is simply no next keyboard-focusable element."
  timestamp: 2026-09-22T23:40:00Z

- hypothesis: "Mark tested a build without 03.4-15's tabindex on the running head / lineage / history links."
  evidence: "dist built 18:36:05 after 0009e12 (18:29:16); round five began 18:42; bundle tabIndex:0 x27. The running head -- one of 03.4-15's sites -- did ring."
  timestamp: 2026-09-22T23:40:00Z

- hypothesis: "The page's controls are hidden or display:none at 1366, so they cannot be focused regardless of tabindex."
  evidence: "The openers, History, Batches, Correct and the six rules are all rendered in reading mode at 1366 (Mark operates them by touch). Only .shell__tabs is display:none above 759.98px, and it is outside the page. The History/Batches panels are hidden by design until opened, which needs their gated buttons."
  timestamp: 2026-09-22T23:40:00Z

- hypothesis: "Some recipe-page element carries a computed tabIndex of 0 in the default view (GraduatedRule, FormulationNote, VersionRow h2, BatchRow h2)."
  evidence: "FormulationNote.jsx:19 `mode === 'recording' || mode === 'developing' ? -1 : undefined` -> GraduatedRule.jsx:89 receives undefined in reading (gated button). VersionRow.jsx:195 `focusVersionOnMount ? -1 : undefined`; BatchRow.jsx:506 `focusBatchOnMount || focusBatchAttempt != null ? -1 : undefined`. None is ever 0; an h2 with tabindex -1 or none is never in sequential order."
  timestamp: 2026-09-22T23:40:00Z

## Evidence

- timestamp: 2026-09-22T23:16:00Z
  checked: ".planning/debug/knowledge-base.md, .planning/debug/resolved/"
  found: "Neither exists. Sibling sessions ipad-tab-never-enters-app.md (WebKit link/form-control gates, from source) and ipad-keyboard-locks-after-tab.md (Home's links gated; relinquishFocusToChrome after the last stop) are the known-pattern candidates."
  implication: "Test the form-control gate (HTMLFormControlElement::isKeyboardFocusable -> EventHandler::tabsToAllFormControls, EventHandler.cpp:5097-5118 as cited there) first; do not redo the WebKit source reading."

- timestamp: 2026-09-22T23:20:00Z
  checked: "app/dist mtime vs git log; grep tabIndex:0 in app/dist/assets/index-9kqhhgeH.js"
  found: "dist built 18:36:05 local; last 03.4-15 code commit 0009e12 at 18:29:16; round five commit eeb4f53 started at 18:42. Bundle carries tabIndex:0 x27 (Shell 10 + 03.4-15's 17). In the same bundle the VersionRow openers are `(0,G.jsx)(`button`,{type:`button`,ref:C,onClick:p,children:`Next version`})`, `{type:`button`,ref:T,onClick:x,children:b?`Record another`:`Record batch`}`, Show changes `{type:`button`,className:`headnote__show-changes ...`,"aria-pressed":c,onClick:y}` and HistoryDisclosure `{type:`button`,className:`text-control history-disclosure`,"aria-expanded":e,"aria-controls":n,onClick:t}` -- no tabIndex on any."
  implication: "Mark tested the 03.4-15 build. The recipe page's own controls ship as tabindex-less <button> elements."

- timestamp: 2026-09-22T23:25:00Z
  checked: "Recipe route render tree in the default state (RecipePage.jsx:602 mode='reading', openPen=null): router.jsx RecipePageForRoute, RecipePage.jsx:1771-1954, Headnote.jsx, VersionRow.jsx, History.jsx, RecipeHistory.jsx, BatchRow.jsx, IngredientTable.jsx, Method.jsx, FormulationNote.jsx, GraduatedRule.jsx, Authored.jsx, PenFoot.jsx, BasisNote.jsx, DerivedAdvisories.jsx"
  found: |
    DOM order at 1366, reading mode, after the shell's header stops and rail (.shell__tabs is display:none above 759.98px):
      1. router.jsx:62 running head <Link to="/" tabIndex={0}>Sprinkles</Link>            -> tabindex 0, reachable (Mark saw it ring)
      2. Headnote.jsx: <h1>, <p> only (input/textarea render only when mode==='developing')  -> nothing
      3. VersionRow.jsx:192-196 identity <h2 tabIndex={focusVersionOnMount ? -1 : undefined}> -> never 0; not in Tab order
      4. VersionRow.jsx:225 From version <Link tabIndex={0}>   -> ONLY if version.parentVersionId
      5. VersionRow.jsx:248 From batch <Link tabIndex={0}>     -> ONLY if version.citedBatchId && citedBatch
      6. VersionRow.jsx:266-276 History = HistoryDisclosure (History.jsx:3-7) <button> no tabIndex -> GATED
      7. VersionRow.jsx:285-303 Next version <button>, Record another/Record batch <button>, Show changes <button> (only with a parent) -- no tabIndex -> GATED
      8. VersionRow.jsx:312-321 HistoryPanel: <section hidden> with children NOT rendered while closed (History.jsx:12-17) -> RecipeHistory's 3 tabindex-0 Link sites do not exist until History is opened
      9. BatchRow.jsx:503-514 <h2 tabIndex={focusBatchOnMount||focusBatchAttempt!=null ? -1 : undefined}> -> never 0
     10. BatchRow.jsx:521-529 Batches (N) HistoryDisclosure <button> no tabIndex -> GATED (renders when batchCount>0)
     11. BatchRow.jsx:536-545 Correct <button> no tabIndex -> GATED (renders when openBatch)
     12. BatchHistoryPanel (BatchRow.jsx:328-363) closed -> its tabindex-0 Link not rendered
     13. IngredientTable reading entries: text only (GramsCell returns text when mode!=='developing'; AsMadeCell input only when recording; RemoveRowControl/OrphanedRowFlag only developing)
     14. Method reading branch (Method.jsx:743-781): text only; NoteList (Authored.jsx:15-41) renders note text only outside developing
     15. FormulationNote.jsx:19 tabIndex = recording||developing ? -1 : undefined -> six GraduatedRule <button tabIndex={undefined}> (GraduatedRule.jsx:85-92) -> GATED
     16. BasisNote, DerivedAdvisories, Authored: no controls. PenFoot.jsx:85 returns null when openPen===null.
    No <input>, <textarea>, <select> or contentEditable exists anywhere on the route in reading mode. No element other than the running head carries tabIndex >= 0 unless lineage links render.
  implication: "With FKA off (no KeyboardAccessFull) and TabsToLinks off, the keyboard-focusable set after the running head is exactly {From version, From batch} and only where lineage exists. Every <button> on the page -- History, Next version, Record, Show changes, Batches, Correct, six rules -- is excluded by the form-control gate. Because History is a gated button, it cannot be opened by keyboard at all, so its links (which only mount when open) are unreachable too."

- timestamp: 2026-09-22T23:28:00Z
  checked: "Seed data: app/src/store/seed.js, app/src/data/olive-oil.js:48-58, app/src/data/batch-2026-08-02.js; db.js upgrade (resets rather than lifts); grep of 03.4-UAT*.md for any version Mark created on the device"
  found: "The store seeds exactly one recipe: 'Olive Oil Ice Cream', one version olive-oil-ice-cream-v1 with parentVersionId: null, citedBatchId: null, and one batch (2 Aug). No UAT round records Mark saving a new version on the iPad."
  implication: "The recipe Mark most likely opened is Olive Oil v1 (a root version). Its page renders NO From version and NO From batch link. So after the running head the document has no keyboard-focusable element at all -> FocusController relinquishes to Safari's chrome on the next Tab (as diagnosed in ipad-keyboard-locks-after-tab.md, FocusController.cpp:700-719) -> 'then back to Search', the same boundary behaviour test 1 recorded on Home ('focus ring goes away, then reappears on Search'). The report is exactly what the hypothesis predicts. Even on a child version only From version / From batch would ring, then the same exit."

- timestamp: 2026-09-22T23:30:00Z
  checked: "Differential against Home (passed in the same round, FKA off) and the Shell: RecipeList.jsx, Shell.jsx:130-330"
  found: "RecipeList.jsx has 0 <button>/<input>/<select>/<textarea>/<summary> and 9 Link sites all tabIndex={0}. Shell.jsx: every <button> (Import, Export x2 each) and More's <summary> carry tabIndex={0} (03.4-14); the hidden file input is tabIndex=-1. Round five test 1 (FKA off) passed with rings at Search, Import, Export -- i.e. <button tabindex=0> rings on this device with FKA off."
  implication: "Direct on-device differential: <button> WITH explicit tabindex (Shell Import/Export) rings with FKA off; <button> WITHOUT (every recipe-page control) does not. Home passed only because it renders no button. 03.4-15 extended the remedy to Link sites only; buttons were out of its scope (its grep gate matches `<(Link|NavLink)`)."

- timestamp: 2026-09-22T23:45:00Z
  checked: "WebKit main (raw.githubusercontent.com, fetched 2026-09-22): HTMLButtonElement.h, HTMLFormControlElement.cpp/.h, HTMLTextFormControlElement.h, HTMLInputElement.cpp, InputType.cpp/.h, CheckboxInputType.h, BaseCheckableInputType.cpp/.h, RadioInputType.cpp/.h, TextFieldInputType.cpp, BaseDateAndTimeInputType.cpp/.h, HTMLSelectElement.cpp, HTMLTextAreaElement.h, HTMLSummaryElement.cpp/.h, Element.cpp, HTMLElement.cpp"
  found: |
    Per-control keyboard-focus gate without an explicit tabindex (FKA off, TabsToLinks off):
      GATED (skipped):
        <button>            HTMLButtonElement : HTMLFormControlElement, no override -> HTMLFormControlElement.cpp:220-227 -> tabsToAllFormControls
        checkbox <input>    InputType.cpp:711-716 -> HTMLInputElement.cpp:442-445 -> HTMLTextFormControlElement (no override, HTMLTextFormControlElement.h:46 derives HTMLFormControlElement) -> gated. CheckboxInputType/BaseCheckableInputType: no override.
        radio <input>       RadioInputType.cpp:191-211 first calls InputType::isKeyboardFocusable (gated), then group logic (checked one, or any if none checked; skip same-name siblings once one is focused)
        <a href>            (already diagnosed: HTMLAnchorElement.cpp:127-142 -> tabsToLinks)
      UNGATED (always reachable when rendered and enabled):
        text <input>        TextFieldInputType.cpp:99-108 (on iOS, readonly excluded)
        date <input>        BaseDateAndTimeInputType.cpp:280-285 (isTextFormControlFocusable, readonly excluded)
        <textarea>          HTMLTextAreaElement.h:110 `isKeyboardFocusable -> isFocusable()`
        <select>            HTMLSelectElement.cpp:620-625 `if (renderer()) return isFocusable();`
        <summary>           HTMLSummaryElement : HTMLElement; supportsFocus = isActiveSummary() (HTMLSummaryElement.cpp:88-91), defaultTabIndex 0 when active (83-86); no isKeyboardFocusable override -> Element::isKeyboardFocusable (Element.cpp:467-481)
      Explicit tabindex on any form control: HTMLFormControlElement.cpp:222-223 -> Element::isKeyboardFocusable -> reachable if focusable and tabindex >= 0.
      Disabled: HTMLFormControlElement.h:53 `supportsFocus() { return !isDisabled(); }` -> not focusable -> Element::isKeyboardFocusable returns false even with tabindex=0.
  implication: "The fix class is <button> + checkbox + radio (and links, already done). <summary>, <select>, <textarea>, text and date inputs need nothing. A disabled button with tabIndex={0} stays out of the Tab order, so conditional-disabled sites (PenFoot, VersionRow plan ceremony, Headnote) need no special handling. WebKit's radio-group logic still applies after the gate, so tabIndex={0} on every radio of a named group (Segmented.jsx:56 name=groupName, AxisMark.jsx:96 name=groupName) yields one stop per group, not one per option."

- timestamp: 2026-09-22T23:50:00Z
  checked: "Every <button>/<input>/<select>/<textarea>/<summary> site under app/src (non-test .jsx), classified by WebKit gate and tabindex"
  found: |
    Gated sites lacking an explicit tabindex >= 0 (source sites; runtime count in brackets):
      VersionRow.jsx      7 buttons: 285 Next version, 292 Record batch/another, 296 Show changes (reading); 162,167,170,175 plan-pen Cancel/Save (disabled-conditional)
      History.jsx         1 button: 3-7 HistoryDisclosure [2 on the page: VersionRow 'History' (268), BatchRow 'Batches (N)' (522)]
      BatchRow.jsx        5 buttons: 537 Correct (reading); 679 Restore tasting, 681 Remove tasting, 781 defect chip [x4 via DEFECTS.map], 804 Bitter chip (record/amend pen)
      GraduatedRule.jsx   1 button: 85-92, tabIndex prop computed in FormulationNote.jsx:19 as undefined (reading) / -1 (pens) [x6]
      Method.jsx          7 buttons (237 add purpose, 264 add aside, 284 change/done uses, 325 remove this step, 343 remove/restore, 410 edit this step, 467 done differently) + 2 checkboxes (299 uses, 445 Skipped) = 9
      IngredientTable.jsx 2 buttons: 156 remove/restore row, 261 orphaned-row restore (developing)
      Authored.jsx        1 button: 30 remove note (developing)
      PenFoot.jsx         8 buttons: 39,42,44,47 (record/amend foot), 93,98,101,106 (plan foot) -- all disabled-conditional
      Segmented.jsx       1 button (41 Clear) + 1 radio (54, name=groupName) = 2 [x3 groups in the record pen]
      AxisMark.jsx        1 button (76 Clear) + 1 radio (94, name=groupName) = 2 [xN axes]
      TOTAL: 38 source sites (34 <button>, 2 checkbox, 2 radio). Of these, reachable in the reading view Mark tested: VersionRow 285/292/296, History.jsx (x2), BatchRow 537, GraduatedRule (x6) -- 11 runtime controls on a seeded v1 page (10 without Show changes, which needs a parent).
    Already compliant: Shell.jsx buttons 231,235,318,324 and <summary> 300 carry tabIndex={0}; the file input 239-245 is tabIndex=-1 + display:none by design.
    Ungated, need nothing: text inputs (BatchRow 80, Headnote 37, IngredientTable 123, 281, Method 148, 187, 194, 456), date inputs (BatchRow 570, 697), all <textarea>, the VersionRow plan-pen <select>.
  implication: "03.4-15's rule ('every app link carries tabindex 0') and its grep gate (`<(Link|NavLink)\\b`) do not cover form controls. 38 sites across 10 files are the full remaining exposure; 11 runtime controls are what Mark's test 2 skipped. A one-line grep cannot gate buttons reliably: 14 of the 34 <button> sites put `<button` alone on its line with the attributes on following lines."

## Resolution

root_cause: |
  AND-gate of three conditions; the first is the defect.

  1. CODE (the defect): every control the recipe page renders in its default reading state is a
     <button> with no explicit tabindex -- History (HistoryDisclosure, History.jsx:3-7, used at
     VersionRow.jsx:268), Next version (VersionRow.jsx:285), Record batch/Record another (:292),
     Show changes (:296, only with a parent), Batches (N) (HistoryDisclosure at BatchRow.jsx:522),
     Correct (BatchRow.jsx:537) and the six Balance rules (GraduatedRule.jsx:85, tabIndex computed as
     undefined in reading by FormulationNote.jsx:19). The page renders no text field, textarea or
     select in reading mode. WebKit makes a tabindex-less form control keyboard-focusable only through
     EventHandler::tabsToAllFormControls (HTMLFormControlElement.cpp:220-227), i.e. only with
     KeyboardAccessFull (FKA) or TabsToLinks -- already established from source in
     ipad-tab-never-enters-app.md. 03.4-14 gave the shell's own buttons tabIndex={0}; 03.4-15 extended
     tabIndex={0} to every Link/NavLink but no <button>, so the recipe page's controls were never
     covered.
  2. ENVIRONMENT (settled baseline): Full Keyboard Access is off by Mark's standing decision, so
     KeyboardAccessFull is false and tabsToAllFormControls() is false. Same-round on-device differential:
     Shell's <button tabindex=0> Import/Export rang (test 1 pass); the recipe page's tabindex-less buttons
     did not (test 2).
  3. DATA (why 'only' the Sprinkles link): the seeded recipe is a single root version
     (olive-oil-ice-cream-v1: parentVersionId null, citedBatchId null), so VersionRow renders neither
     From version (:217-231) nor From batch (:242-252) -- the only tabindex-0 elements the page itself
     would otherwise offer. History's links mount only while History is open (History.jsx:12-17) and
     History's toggle is itself a gated button, so they cannot be reached by keyboard at all; the same
     holds for the Batches panel's link.

  Net effect: after the running head (router.jsx:62, tabIndex={0}) the document has no keyboard-focusable
  element, WebCore relinquishes focus to Safari's chrome on the next Tab (FocusController.cpp:700-719,
  per ipad-keyboard-locks-after-tab.md), and Mark sees the ring return to Search -- the same boundary
  behaviour Home showed after its last link in test 1. Home passed only because it renders no <button>
  (RecipeList.jsx: 0 buttons, 9 tabindex-0 links).
fix: "[not applied -- goal: find_root_cause_only]. Direction: extend the explicit-tabindex remedy from links to every gated form control -- <button>, checkbox and radio -- at the 38 source sites listed in Evidence (FormulationNote.jsx:19: undefined -> 0 in reading, keeping -1 in pens; the two landing-focus h2s stay -1/undefined). Not needed: <summary>, <select>, <textarea>, text/date inputs. Disabled buttons need no care. Structural choice for Mark: how to pin it (per-component rendered-markup tests + a multiline-aware source scan, or a shared Button component)."
verification: "[not applicable -- diagnose-only]"
files_changed: []
