---
status: diagnosed
trigger: "G-03.4-r4-1: fail. rings on tabs, search and import/export, then into the page, and then I lose focus on everything. keyboard stops working utnil I recycle power."
created: 2026-09-22T21:45:00Z
updated: 2026-09-22T22:20:00Z
---

## Current Focus

goal: find_root_cause_only
bug_class: "S1 (focus lost after the shell): Bohrbug, deterministic from source given the markup and WebKit's link gate. S2 (keyboard dead until power cycle): unclassified — the tier it lives in (Safari UI process / FKA service / keyboard transport) is not observable from here; treat as environment-conditioned until the on-device ladder places it. SBFL skipped: the suite runs in jsdom, which models neither WebKit's link gate nor iPadOS focus routing."
known_pattern_candidate: "ipad-tab-never-enters-app (G-03.4-r3-3) — same WebKit link gate (HTMLAnchorElement::isKeyboardFocusable → tabsToLinks). 03.4-14 applied the explicit-tabindex remedy to the shell's nine stops only; Home's own controls were never in that fix's scope."

hypothesis: "Two separable faults. S1 (app, decided): after Kitchen, Home offers no keyboard-focusable control — every one is a tabindex-less react-router <Link> (<a href>), which WebKit gates behind TabsToLinks — so the next Tab runs FocusController::relinquishFocusToChrome, which blurs the page (the ring vanishes) and hands focus to Safari via _webView:takeFocus:. S2 (not app-causable): the dead keyboard lives below the page — in Safari's UI-process focus hand-off, the Full Keyboard Access service, or the keyboard transport — because the page runs no key/focus/timer code on Home, never receives Tab as a DOM event under FKA, and the lock-up reproduced in test 2 with focus never entering the page."
test: "S1 decided from app source + WebKit main source. S2 needs the device: the recovery ladder in the hand-back (Tab-H / Fn-H → address-bar typing → Notes → FKA off → reconnect keyboard → only then power cycle) places the fault in one tier; the neutral-page control separates 'any page' from 'Sprinkles only'."
expecting: "If S2 recovers at Fn-H / address-bar typing / Notes, it is a Safari-local focus parking state (the page influences it only through relinquish). If only FKA-off recovers it, the FKA service. If only reconnecting the keyboard does, the transport/iPadOS input stack. If it reproduces on a neutral page, Sprinkles is uninvolved."
next_action: "Diagnosis complete (goal: find_root_cause_only). Hand back; no fix applied."

reasoning_checkpoint:
  hypothesis: "S1: Home's own controls are unreachable by Tab on iPadOS Safari because each is an <a href> without an explicit tabindex (RecipeList.jsx:63,67,110,170,180,183,192,195,229), and HTMLAnchorElement::isKeyboardFocusable (HTMLAnchorElement.cpp:127-143) admits such a link only under TabsToLinks, which is off on Apple platforms and untouched by FKA; with nothing after Kitchen, FocusController (FocusController.cpp:700-719, 755-767) relinquishes to chrome because WebChromeClient::canTakeFocus is hard-wired true (WebChromeClient.cpp:347-351). S2: the page cannot kill the device keyboard; at most its focusable set decides whether a Safari/FKA code path (relinquish → _webView:takeFocus:) runs."
  confirming_evidence:
    - "Direct (app): RecipeList.jsx has nine <Link> sites and zero tabIndex, zero <button>, zero <input>; home.css display:none rules are only in max-width blocks inactive at 1366."
    - "Direct (device, round four): rings DID appear on the shell stops once they carried tabindex=0 (7092f67, shipped in the 15:35 build Mark tested) — the round-three link-gate diagnosis is now empirically confirmed on the device, and the same gate still covers every Home link."
    - "Direct (WebKit main): relinquishFocusToChrome clears the focused element and calls chrome().takeFocus(); canTakeFocus returns true unconditionally, so on iOS focus leaves the document instead of wrapping."
    - "Direct (app): on Home no keydown/keyup listener, no preventDefault, no .focus()/.blur() reachable at 1366, no autoFocus, no rAF/setInterval/observer, no inert, no focusin/out listener; the only focus call (closeMore) needs a click inside the display:none More list."
    - "Direct (device, round three probe): under FKA no keydown/focusin/window-focus event ever reached the page — the page cannot even see the keys it would need to swallow."
    - "Direct (device, round four test 2): the lock-up reproduced with focus never entering the page."
  falsification_test: "S1: on the iPad, tap in the header beside the wordmark, Tab nine times to Kitchen, Tab once more: if a ring appears on the lead recipe's name link (a tabindex-less <a>), the link-gate account of the loss is wrong. S2: if the keyboard dies on a neutral page (new blank tab, or a page with no Sprinkles code) under the same FKA procedure, the app is uninvolved; if it dies ONLY on Sprinkles and ONLY after focus has entered the page, the page's focusables are a trigger for an Apple defect and need an A/B (tabindex vs none)."
  fix_rationale: "N/A — diagnose-only. Direction: S1 is the r3-3 remedy's missing half (explicit tabindex on the page's own links, or a project-wide link policy — a structural choice for Mark). S2 has no page-side remedy until the ladder places it."
  blind_spots:
    - "Whether Mark tried anything short of a power cycle (Fn-H, address-bar typing, another app, FKA off). 'Until I recycle power' proves a power cycle was sufficient, not that it was necessary. With no text field focused on Home, letters do nothing visible anyway, so a Safari-local stuck focus and a device-wide failure look identical from the chair if only Tab was pressed."
    - "iPadOS version and keyboard model/connection (Smart Connector / Bluetooth / USB) — unknown. iPadOS 26.x has public reports of external keyboards connected but producing no input in any app until restart, independent of any web page."
    - "What Safari's closed-source _webView:takeFocus: / _webViewCanBecomeFocused: do under FKA — the one place a page-influenced path could park focus on the ring-less WKContentView (focusEffect = nil, WKContentView.mm:298-301)."
    - "Where exactly Mark tapped in test 1. A tap in .shell__main sets the sequential-navigation starting point after all nine shell stops (EventHandler.cpp:958/2098, Document.cpp:6800-6850), so the first Tab would go straight out to Safari; the reported rings then imply either a header tap or a chrome→page re-entry that test 2 says does not happen from the address bar."
    - "Round three (same device, FKA on, Tab from the address bar up to 12 presses, tap-in-page, Option+Tab) reported no lock-up; round four locked twice. The differentials are the tabindex change AND an unbounded Tab count in test 2 AND any device change between rounds — not separable from here."
  candidate_causes:
    - "code: Home's own controls are tabindex-less <a href> — unreachable under WebKit's link gate, so focus relinquishes to Safari after Kitchen (S1, confirmed)"
    - "code/test-authoring: the test procedure is tap-position-dependent — a tap in the content column starts sequential navigation after the shell, so the first Tab leaves the page (S1 contributor to the confusing order)"
    - "environment: Safari UI-process focus parking after takeFocus / at the chrome's wrap point, on a view that draws no highlight (S2 candidate A)"
    - "environment: Full Keyboard Access service stops processing keys system-wide (S2 candidate B)"
    - "environment: iPadOS keyboard transport/input-stack fault, page-independent (S2 candidate C)"
  and_gate: "S1: yes — needs (i) the page's own controls gated (app) AND (ii) iOS WebKit relinquishing rather than wrapping (canTakeFocus true). S2: unknown; the report bundles an app-caused focus exit with a keyboard failure the app cannot produce on its own. They co-occur in test 1 but are separated by test 2."

## Symptoms

expected: "Test 1, 03.4-UAT.md round four: on Home at 1366px, tap page body, Tab repeatedly → rings at Search, Import, Export, Home, Notebook, Recipe book, Idea log, Ingredients, Kitchen, then the page's own controls; Shift-Tab walks back; nothing traps; keyboard keeps working."
actual: "fail. rings on tabs, search and import/export, then into the page, and then I lose focus on everything. keyboard stops working utnil I recycle power."
errors: "None reported."
reproduction: "Test 1 in 03.4-UAT.md round four. iPad Safari (WebKit, ~1366px, coarse pointer), hardware keyboard, Full Keyboard Access ON, production build via vite preview --host on :4173. Test 2 same session: force-quit Safari with FKA on, reopen, tap address bar, Tab until focus leaves chrome → 'focus cycles the chrome and never enters the page; and now I need to power cycle the device to regain use of the keyboard'."
started: "Discovered 2026-09-22 UAT round four (started 15:43 local), immediately after plan 03.4-14 (commit 7092f67, 15:26 local) put tabIndex={0} on every shell__place. Build in app/dist dated 15:35 local, contains 10 tabIndex:0."

## Eliminated

- hypothesis: "A focus sink in the page swallows focus after the shell: an element that is hidden, display:none, off-screen or unmounted on re-render; the hidden file input; More's <details>; the .app-boot path."
  evidence: "The file input is display:none (shell.css:96-98) and tabindex=-1; .shell__tabs (its four links, More's <summary>, and the closed <details> content) is display:none above 759.98px (shell.css:286-288) — display:none elements are not focusable. .app-boot is replaced by root.render(<App/>) before the shell exists (main.jsx:15-28). RecipeList's only state change swaps Loading → HomeBody inside .shell__main, where nothing is focused (every control there is gated). No element with tabindex exists on Home outside the shell. There is no sink: focus leaves because there is no next stop, not because something took it."
  timestamp: 2026-09-22T22:10:00Z

- hypothesis: "Page JavaScript intercepts, swallows or traps keys (keydown handler, preventDefault on Tab, focus loop)."
  evidence: "Home mounts no key listener at all (the only document keydown listener is RecipePage.jsx:832, recipe routes only); no preventDefault, focus()/blur(), autoFocus, timer, rAF or observer is reachable on Home at 1366. And under FKA no keydown ever reaches the page (round-three probe: overlay silent for Tab, Option+Tab, before and after a tap)."
  timestamp: 2026-09-22T22:10:00Z

- hypothesis: "The page, by itself, disables the device's keyboard (a sufficient cause for S2)."
  evidence: "The page runs in Safari's sandboxed WebContent process with no code executing on Home after load, cannot see FKA keystrokes, and the lock-up reproduced in test 2 with focus never entering the page. Retained only as a possible TRIGGER for an Apple defect (its focusable set decides whether relinquish → _webView:takeFocus: runs), not as a cause — see Current Focus."
  timestamp: 2026-09-22T22:12:00Z

- hypothesis: "'rings on tabs' means the viewport was narrow (Split View / Stage Manager < 760px), so the bottom tab row rendered."
  evidence: "Below 760px the header's Search/Import/Export are display:none (shell.css:371-373), reachable only inside More after activating it with Space; and the tab row follows the page in DOM order (Shell.jsx:291 after .shell__body). 'Rings on tabs, search and import/export, then into the page' cannot be produced at a narrow width by Tab alone. Mark's own vocabulary calls a destination a 'tab' ('Notebook tab', round two)."
  timestamp: 2026-09-22T22:12:00Z

- hypothesis: "Mark tested a build without the 03.4-14 tabindex."
  evidence: "7092f67 committed 15:26:21; app/dist built 15:35; round four started 15:43. The bundle carries tabIndex:0 x10 and tabIndex:-1 x1. The rings Mark now sees on the shell stops are themselves the empirical confirmation."
  timestamp: 2026-09-22T22:12:00Z

## Evidence

- timestamp: 2026-09-22T21:45:00Z
  checked: "git log timestamps vs app/dist mtime; grep tabIndex in app/dist/assets/index-CD3_um12.js"
  found: "7092f67 (tabindex) committed 15:26:21 -0400; dist built 15:35; round four started 15:43:38. Bundle carries tabIndex:0 x10, tabIndex:-1 x1 (file input), plus four computed tabIndex sites (n, o, S?-1:void 0, v||y!=null?-1:void 0)."
  implication: "Mark tested the 03.4-14 build. The link-gate fix shipped. Four computed tabIndex sites need locating (they are outside the shell's literal sites)."

- timestamp: 2026-09-22T21:50:00Z
  checked: "app/src/ui/Shell.jsx (whole), app/src/styles/shell.css (whole), app/src/router.jsx, app/src/main.jsx, app/index.html, app/dist/index.html"
  found: "DOM order at 1366px on Home: header tools [Search <a tabindex=0>, Import <button tabindex=0>, Export <button tabindex=0>, file <input tabindex=-1, display:none, aria-hidden>], then .shell__body [rail: Home, Notebook, Recipe book, Idea log, Ingredients, Kitchen — all <a tabindex=0>; main: Outlet], then .shell__tabs (display:none above 759.98px, so its four links and More's <summary>/<details> are out of the focus order). Below 760px the tools-row stops are display:none (shell.css:371-373) and the tab row renders AFTER the page (Shell.jsx:291 follows .shell__body). main.jsx boot path renders <p class=app-boot> then <App/>; no focus/blur/tabindex/inert on body or root."
  implication: "At 1366 the nine shell stops are exactly the truth's list and all nine are now explicitly keyboard-focusable. A narrow viewport cannot produce 'rings on tabs, search and import/export' in that combination unless More were opened by activation (Space), because the header's Search/Import/Export are display:none below 760 and the tab row comes after the page."

- timestamp: 2026-09-22T21:52:00Z
  checked: "app/src/ui/RecipeList.jsx (Home, whole) and home.css media blocks"
  found: "Every one of Home's own controls is a react-router <Link> (an <a href>) with NO tabIndex: the lead name link (line 110), RowActions links 'Record a batch' / 'Record a tasting' + 'Continue developing' / 'Next version' + 'Adapt' (lines 165-205), each row's name link (line 229), and the empty-state 'Recipe book' / 'Idea log' links (lines 63-69). Home has no <button>, no <input>, no element with tabindex. home.css display:none rules sit only in max-width 1099.98 / 759.98 blocks (not active at 1366)."
  implication: "Under WebKit's link gate (diagnosed from source in ipad-tab-never-enters-app.md: an <a href> is keyboard-focusable only with TabsToLinks on or an explicit tabindex; FKA does not open it), NOT ONE of Home's own controls is Tab-reachable on iPadOS Safari. 03.4-14 fixed the shell's nine stops only. After Kitchen, the document has no next keyboard-focusable element."

- timestamp: 2026-09-22T21:55:00Z
  checked: "grep across app/src (non-test) for keydown|keyup|keypress|onKeyDown|preventDefault|stopPropagation|.focus(|.blur(|autoFocus|tabIndex|inert|pointer-events|requestAnimationFrame|setInterval|ResizeObserver|MutationObserver|IntersectionObserver|addEventListener|focusin|focusout|onFocus|onBlur; and the four computed tabIndex sites in app/dist/assets/index-CD3_um12.js"
  found: "On the Home route the only focus-touching code is Shell's closeMore() (moreSummaryRef.focus(), fired only by a click inside the More list, which is display:none at 1366) and a setMoreOpen(false) effect keyed on pathname. The only document-level keydown listener is RecipePage.jsx:832 (recipe routes only); AxisMark/Method keydown handlers, all other .focus() calls, autoFocus, and the four computed tabIndex sites (GraduatedRule, FormulationNote, VersionRow h2, BatchRow h2) are recipe-route components. The only beforeunload listener is RecipePage.jsx:801. No requestAnimationFrame, setInterval, observer, inert or focusin/focusout listener anywhere under app/src. The only pointer-events rule is .axes-rule (app.css:2265, recipe route, decorative)."
  implication: "On Home the page runs no key handler, no focus manipulation, no timer or animation loop, and nothing that re-renders on focus. It cannot trap, steal or swallow a keystroke; a DOM key listener could not even see Tab under FKA (round-three probe: no keydown ever reached the page). The page's only influence on focus is WHICH elements are keyboard-focusable."

- timestamp: 2026-09-22T22:00:00Z
  checked: "WebKit main Source/WebCore/page/FocusController.cpp:700-719 (relinquishFocusToChrome), 721-800 (advanceFocusInDocumentOrder / findFocusableElementInDocumentOrderStartingWithFrame); WebKit/WebProcess/WebCoreSupport/WebChromeClient.cpp:347-357; WebKit/UIProcess/WebPageProxy.cpp:13814-13821; WebKit/UIProcess/Cocoa/UIDelegate.mm:783-798"
  found: "On a forward Tab (InitialFocus::No) with no next keyboard-focusable element, WebCore calls relinquishFocusToChrome: clearSelection, document->setFocusedElement(nullptr), setFocusedFrame(nullptr), chrome().takeFocus(Forward). WebChromeClient::canTakeFocus is hard-wired to `return true` (notImplemented), so on iOS this ALWAYS happens — it never wraps inside the page. takeFocus is an IPC to the UI process → WebPageProxy::takeFocus → Safari's closed-source `_webView:takeFocus:`. Tab-focus calls element->focus(... FocusVisibility::Visible), so :focus-visible and the .shell__place:focus fallback both paint once focus lands."
  implication: "Deterministic app-side cause for the S1 half of the report: after Kitchen, Home offers no keyboard-focusable control (all tabindex-less <a href>), so the next Tab blurs Kitchen (ring disappears from the page) and hands focus to Safari. What Safari then shows is Safari's; test 2 (and round three) show Safari's chrome loop does not hand focus back into this page. From the chair that reads as 'into the page, then I lose focus on everything'."

- timestamp: 2026-09-22T22:03:00Z
  checked: "WebKit main EventHandler.cpp:958 and :2098 (mouse press) and Document.cpp:6793-6850 (setFocusNavigationStartingNode / focusNavigationStartingNode)"
  found: "Every mouse press (a tap is dispatched as synthetic mouse events) sets the document's sequential focus navigation starting point to the tapped node (reset to document start only for <html>/the document itself). The next Tab searches forward from that node."
  implication: "Test 1's 'tap once on the page body away from any control' decides where the first Tab goes. A tap in .shell__head (brand area) starts before Search → Search first. A tap anywhere in .shell__main (Home's content column) starts AFTER all nine shell stops: the first Tab finds nothing keyboard-focusable (Home's links are gated, .shell__tabs is display:none) and relinquishes straight to Safari's chrome. The test procedure is therefore itself tap-position-dependent on this markup."

- timestamp: 2026-09-22T22:05:00Z
  checked: "Mark's own vocabulary in earlier UAT rounds (03.4-UAT-round2.md:31, round3.md:90)"
  found: "Round two/three report: 'when on Notebook tab in iphone width, More menu doesn't close…' — Mark calls a destination place a 'tab'."
  implication: "'rings on tabs' most plausibly means the rail's places (Home … Kitchen) — at 1366 those ARE the destinations; the bottom tab row is display:none (shell.css:286-288). Safari's own tab bar remains a code-permitted second reading (if the first Tab went out to the chrome — see the tap-position entry — and FKA then cycled the chrome before re-entering at Search). A narrow viewport (Split View/Stage Manager < 760px) is effectively excluded: the header's Search/Import/Export are display:none there (shell.css:371-373) and are reachable only inside More after activating it with Space, and the tab row sits AFTER the page in DOM order (Shell.jsx:291)."

- timestamp: 2026-09-22T22:08:00Z
  checked: "Web research: Apple's iPad guide 'Control iPad with an external keyboard' (support.apple.com, fetched); community/forum reports on FKA and external-keyboard failures"
  found: "Apple's FKA defaults: Tab-H = show commands, Tab / Shift-Tab = move, Space = activate, Fn-H = Home Screen, Fn-Up = App Switcher, Fn-C = Control Center, Fn-N = Notification Center; settings path Accessibility > Keyboards & Typing > Full Keyboard Access. Public reports: FKA intercepting keys so the keyboard 'stops accepting text input', fixed by toggling FKA off/on (Apple Community, AppleVis, dev forum thread 119022); iPadOS 26.x 'keyboard connected but no input in any app' until restart (Apple Community thread 256196462); iPadOS 26 app freezes with an external keyboard across many apps incl. WKWebView-based ones (Obsidian forum 106187). No report found of a web page disabling an iPad's keyboard."
  implication: "Device-wide external-keyboard failures on current iPadOS are documented and page-independent. FKA's own Fn-H / Tab-H commands give a zero-cost probe of whether the keyboard and FKA are still alive when the page appears dead."

- timestamp: 2026-09-22T22:10:00Z
  checked: "Differential: round three vs round four, same device, FKA on"
  found: "Round three (no tabindex): force-quit, Tab from the address bar up to 12 presses, tap in page + Tab, Option+Tab — no lock-up reported, keyboard usable through all four probe steps. Round four (tabindex): test 1 (tap + Tab through the shell and past Kitchen) → lock-up; after a power cycle, test 2 (force-quit, address bar, Tab 'until focus leaves the chrome' — unbounded) → lock-up with no page focus."
  implication: "Three differences, not separable from here: (1) the page now has keyboard-focusable elements, so focus can enter and relinquish back through Safari's takeFocus — a path round three never exercised; (2) test 2 pressed Tab an unbounded number of times vs at most 12; (3) any device change between rounds (iPadOS update, keyboard). Test 2 argues against (1) being necessary, since focus never entered the page there."

## Resolution

root_cause: |
  Two separable faults bundled in one report.

  S1 — FOCUS LEAVES THE PAGE AFTER THE SHELL (app, decided from source; AND-gate with platform):
  Home's own controls are all react-router <Link> elements rendered as <a href> with no tabindex
  (RecipeList.jsx:63, 67, 110, 170, 180, 183, 192, 195, 229). WebKit keyboard-focuses such a link
  only under the embedder's TabsToLinks preference (HTMLAnchorElement.cpp:127-143 →
  EventHandler::tabsToLinks, EventHandler.cpp:5080-5090), which is off on Apple platforms and not
  touched by Full Keyboard Access — the same gate diagnosed in ipad-tab-never-enters-app.md, now
  confirmed on the device by the shell stops ringing once 03.4-14 gave them tabindex=0. 03.4-14 fixed
  the nine shell stops only. So after Kitchen the document has no next keyboard-focusable element,
  and WebCore's FocusController::relinquishFocusToChrome (FocusController.cpp:700-719, called at
  755-767) clears the focused element (the ring vanishes from the page) and hands focus to Safari via
  chrome().takeFocus() — unconditionally on iOS, because WebChromeClient::canTakeFocus is hard-wired
  to true (WebChromeClient.cpp:347-351). Safari's chrome then does not hand focus back into the page
  (test 2; round three). The truth's "then on into the page's own controls" is unsatisfiable on Home
  with the current markup. Contributing: test 1's "tap on the page body" sets WebKit's sequential-
  navigation starting point at the tapped node (EventHandler.cpp:958/2098, Document.cpp:6800-6850),
  so a tap in the content column starts AFTER the shell and the very first Tab leaves the page.

  S2 — KEYBOARD DEAD UNTIL POWER CYCLE (not app-causable; tier undetermined):
  On Home the page runs no key, focus, timer or animation code; under FKA it never receives Tab as a
  DOM event; and the lock-up reproduced in test 2 with focus never entering the page. A sandboxed
  web page has no mechanism to disable the device's keyboard. Three candidates remain, all below the
  page, separated by the on-device recovery ladder:
    A. Safari UI-process focus parking — after takeFocus (test 1) or at the chrome's wrap point
       (test 2), UIKit/FKA focus rests on a view that draws no highlight (WKContentView sets
       focusEffect = nil, WKContentView.mm:298-301) or on nothing; Tab appears dead, and with no text
       field focused every other key does nothing visible either. Recoverable by Fn-H, tapping the
       address bar, or force-quitting Safari. The page influences this only by being the thing that
       relinquishes.
    B. Full Keyboard Access service stops processing keys system-wide. Recoverable by turning FKA
       off (touchscreen). Page cannot cause; could only trigger an Apple defect.
    C. iPadOS keyboard transport / input-stack fault (documented on iPadOS 26.x: keyboard connected,
       no input in any app until restart). Page-independent.
  The report does not establish that the failure was device-wide: a power cycle was sufficient, not
  shown necessary.
fix: "[not applied — goal: find_root_cause_only]"
verification: "[not applicable — diagnose-only]"
files_changed: []

## On-device procedure (for Mark, next round) — short

Before starting: note the iPadOS version (Settings > General > About) and the keyboard (Magic Keyboard / Smart Keyboard Folio / Bluetooth model / USB).

1. **When the keyboard next goes dead, do NOT power cycle first.** Try these in order and note the first one that works:
   a. Press Tab-H (Full Keyboard Access command list appears?) and Fn-H (goes to the Home Screen?).
   b. Tap Safari's address bar and type a letter.
   c. Swipe up to the Home Screen, open Notes, type.
   d. Settings > Accessibility > Keyboards & Typing > Full Keyboard Access off, then type in Notes.
   e. Detach and reattach the keyboard (or Bluetooth off and on).
   Then power cycle only if none worked. The first step that works tells us where the fault is: a/b/c = Safari's focus state (A); d = Full Keyboard Access (B); e or nothing = the keyboard connection or iPadOS input (C).
2. **Control without Sprinkles** (FKA on, same keyboard): open a new blank Safari tab, tap the address bar, press Tab about 30 times. Then open any ordinary site, tap in the page, and Tab past the last control. If the keyboard dies here, the app is not involved.
3. **Sprinkles, tap position** (reproduces S1 without needing the lock-up): tap the white space beside the "Sprinkles" wordmark (not the content column), Tab nine times to Kitchen, then once more. Expected with today's markup: the ring on Kitchen disappears and nothing on Home gets one, because Home's links carry no tabindex.
