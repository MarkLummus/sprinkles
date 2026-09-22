---
status: diagnosed
trigger: "fail. I see the focus move on the browser chrome only - focus never moves into the app"
created: 2026-09-22T19:00:00Z
updated: 2026-09-22T19:40:00Z
---

## Current Focus

bug_class: "Bohrbug — deterministic on the device (Mark's iPad, FKA on), deterministic pass on desktop; environment-conditioned. SBFL skipped: no automated test can model iPadOS keyboard focus routing (suite runs in jsdom)."
known_pattern_candidate: "ipad-keyboard-no-focus-ring — prior diagnosis (G-03.4-4) inferred 'focus lands but no ring'; its own falsification test (read document.activeElement on the device) was never run. The round-three report is the OTHER branch of that test."

hypothesis: "Focus cannot reach the seven link stops on iPadOS Safari at all: WebKit excludes <a href> from sequential focus unless the embedder's TabsToLinks preference is on (default false on Apple platforms; iPadOS Safari exposes no switch for it) or the link carries an explicit tabindex. Full Keyboard Access only widens the form-control gate (buttons), never the link gate. So the 03.4-09 fallback styles a focus that cannot arrive, and the UAT truth is unsatisfiable with the current markup on this device. Why Import/Export (buttons) also show nothing is a device question with two candidates."
test: "WebKit main sources read directly: WKContentView.mm (UIKit focus hand-off), WKContentViewInteraction.mm, WebPage.cpp (keyboardUIMode), EventHandler.cpp (tabsToLinks / tabsToAllFormControls), HTMLAnchorElement.cpp, HTMLFormControlElement.cpp, Element.cpp, FocusController.cpp, WKFullKeyboardAccessWatcher.mm, UnifiedWebPreferences.yaml; plus the shipped app/dist."
expecting: "If links were reachable, HTMLAnchorElement::isKeyboardFocusable would return true without TabsToLinks or tabindex — it does not. If the page hid the stops, dist would carry tabindex=-1/inert/display:none on them — it does not."
next_action: "Diagnosis complete (goal: find_root_cause_only). Hand back with the on-device probe that separates the two remaining device-side candidates; no fix applied."

reasoning_checkpoint:
  hypothesis: "On iPadOS Safari, Tab can never land on Search, Home or the five rail places because WebKit's HTMLAnchorElement::isKeyboardFocusable requires either an explicit tabindex or the TabsToLinks preference (EventHandler::tabsToLinks); the NavLinks carry neither and Full Keyboard Access does not affect that gate. The two buttons (Import/Export) become focusable only when FKA is propagated into the web process (KeyboardAccessFull → tabsToAllFormControls). The 03.4-09 fallback (.shell__place:focus) addresses ring painting after focus arrives and so could not change what Mark sees."
  confirming_evidence:
    - "Direct (WebKit source): HTMLAnchorElement.cpp:127-142 — with no explicit tabindex (`Element::supportsFocus()` = `!!tabIndexSetExplicitly()`, Element.cpp:452-455) a link is keyboard-focusable only if `frame->eventHandler().tabsToLinks(focusEventData)`; EventHandler.cpp:5080-5090 — that is `keyboardUIMode & KeyboardAccessTabsToLinks`, inverted only by Option+Tab. KeyboardAccessFull is not consulted for links."
    - "Direct (WebKit source): WebPage.cpp:5053-5057 — keyboardUIMode = (FKA ? KeyboardAccessFull : Default) | (m_tabToLinks ? TabsToLinks : 0); m_tabToLinks reads WebPreferencesKey::tabsToLinksKey (WebPage.cpp:5444); UnifiedWebPreferences.yaml:5969-5977 — TabsToLinks default is false on every platform except GTK/WPE. No iOS UIProcess file (WKWebViewIOS.mm, WKContentViewInteraction.mm, WebPageProxyIOS.mm, WebPageIOS.mm) touches it."
    - "Direct (WebKit source): HTMLFormControlElement.cpp:220-227 + EventHandler.cpp:5097-5118 — a <button> without tabindex is keyboard-focusable only if KeyboardAccessFull or TabsToLinks (or Option+Tab); WKFullKeyboardAccessWatcher.mm feeds KeyboardAccessFull from `_AXSFullKeyboardAccessEnabled()` on iOS (commit 66ea0fe160, 2018-12-17, 'AX: Support keyboard access preference for iOS in WebKit'), snapshotted at web-process launch (WebProcessPool.cpp:1051) and updated via kAXSFullKeyboardAccessEnabledNotification."
    - "Direct (WebKit source): the only chrome→page hand-off is WKContentView.mm:754-771 `canBecomeFocused` (YES when the embedder implements `_webView:takeFocus:`, i.e. Safari) + `didUpdateFocusInContext:` → `_becomeFirstResponderWithSelectionMovingForward:` → `WebPageProxy::setInitialFocus(forward, isKeyboardEventValid=false)` (WKContentViewInteraction.mm:6338-6345) → `FocusController::setInitialFocus(dir, nullptr)` → advanceFocus with an EMPTY FocusEventData (FocusController.cpp:666-687), so no Option-inversion is possible on entry. Commits 43e9aac7b4 (2021-03-31) and 2640bdc5e2 (2021-05-12): 'enables a tab or a shift+tab to change the focus from browser chrome directly to an element on a web page' — iOS 15+."
    - "Direct (WebKit source): FocusController.cpp:721-765 — on InitialFocus::Yes with no keyboard-focusable element, nothing is focused and nothing is relinquished; on the NEXT Tab (InitialFocus::No) `relinquishFocusToChrome` → WebChromeClient::takeFocus (WebChromeClient.cpp:353-357) → WebPageProxy::takeFocus (WebPageProxy.cpp:13766-13773) → Safari's `_webView:takeFocus:` (UIDelegate.mm:783-798). WKContentView also sets `focusEffect = nil` (WKContentView.mm:298-301), so the web view itself never draws a UIKit focus ring. From the chair: Tab appears to cycle only the browser chrome."
    - "Direct (app): app/dist (built 13:45 local, after commit 48dfe22 at 12:54) contains `.shell__place:focus{outline:...}`; dist/index.html is `<div id=root>` + module script + stylesheet; Shell.jsx renders Search/Home/5 places as NavLink <a href> with NO tabIndex, Import/Export as <button type=button> with NO tabIndex; the only tabIndex=-1 is the hidden file input; no inert/autofocus/iframe anywhere under app/src."
    - "Direct (project record): 03.4-UAT.md G-03.4-4 device_check — 'Full Keyboard Access was off; enabled it and re-ran — still no focus rings on iPad Home' was read by the re-verifier as 'focus lands but WebKit does not set :focus-visible'. No activeElement reading was ever taken; the round-three report ('focus never moves into the app') is the observation the prior falsification test asked for, and it falsifies the round-two inference."
  falsification_test: "On the iPad, with the probe overlay below installed: if a Tab press ever makes document.activeElement a `.shell__place` that is an <a> (Search or a rail place) without any tabindex having been added, the link-gate hypothesis is wrong. If focusin lands on Import/Export (buttons) but never on a link, the hypothesis is confirmed exactly as stated."
  fix_rationale: "N/A — diagnose-only. Direction: give the shell's stops an explicit tabIndex={0}. HTMLAnchorElement.cpp:133-134 and HTMLFormControlElement.cpp:222-223 both route an element with an explicit tabindex to Element::isKeyboardFocusable, bypassing the TabsToLinks / FKA gates entirely — this is the mechanism WebKit's own commit 89bf60bf9f (2019-05-14, '[iOS] Cannot tab or shift + tab out of address bar') relies on ('Non-editable elements can participate in tab cycling via the HTML tabindex attribute'). It makes Search the document's first keyboard-focusable element for the chrome→page hand-off on iPadOS, independent of any device setting. The 03.4-09 :focus fallback then has something to paint."
  blind_spots:
    - "Cannot verify from source whether Safari's UIKit focus loop actually visits the WKContentView in Mark's FKA configuration (Safari's `_webViewCanBecomeFocused:` answer is closed-source). If it never visits, tabindex alone will not move focus from the chrome; a tap in the page first (or FKA's group-entry gesture) is the procedure. The probe below discriminates this."
    - "Cannot verify whether kAXSFullKeyboardAccessEnabledNotification reached Safari's already-running UI process when Mark flipped FKA in round two; if not, KeyboardAccessFull stays false in that process until Safari is relaunched, which alone explains why Import/Export did not ring either. The probe includes a force-quit."
    - "Which desktop browser 'desktop passes' was measured in. macOS Safari with 'Press Tab to highlight each item' OFF skips the same seven links; a Chrome-only pass leaves WebKit's link gate unobserved on desktop too."
    - "Whether iPadOS Safari has any hidden way to set TabsToLinks. No Settings switch is documented for iPadOS (macOS Safari's 'Press Tab to highlight each item' has no iPad counterpart in Apple's guides), and no iOS WebKit code sets it, but MobileSafari itself is closed-source."
  candidate_causes:
    - "code: the seven link stops (Search, Home, five places) are <a href> with no explicit tabindex, so WebKit's link gate (TabsToLinks) excludes them from Tab order on every Apple platform where that preference is off — including iPadOS Safari, where the user cannot turn it on"
    - "environment: Full Keyboard Access widens only the form-control gate; and its value reaches the web process at launch or via a notification that may not have been delivered to an already-running Safari"
    - "config/test-authoring: the UAT truth asserts a ring on link stops that iPadOS Safari cannot Tab to with the current markup, so it cannot pass on the device until either the markup or the truth changes"
  and_gate: "yes. 'Focus never enters the app' needs (i) the links excluded by the TabsToLinks gate AND (ii) the buttons excluded too — either because KeyboardAccessFull was not propagated to Safari's web process, or because the UIKit focus loop never handed focus to the web view. (i) is decided from source; (ii) is undecidable from here and is what the device probe separates. With (i) alone and FKA propagated, Mark would have seen rings on Import and Export only — still a UAT fail, but a different report."

## Symptoms

expected: "A visible ring at every stop through Search, Import, Export and each place in the rail, in that order, with no trap (UX1-01). The tab row and More do not render at iPad width, so only the desktop arm applies."
actual: "fail. I see the focus move on the browser chrome only - focus never moves into the app"
errors: "None reported."
reproduction: "Test 3 in 03.4-UAT.md (round three). Device: Mark's iPad (Safari/WebKit, ~1366px, coarse pointer), hardware keyboard, Full Keyboard Access ON. Served from the production build via `vite preview --host` at http://192.168.1.133:4173/. Desktop passes."
started: "Discovered 2026-09-22 during UAT round three. Regression-shaped re-test of G-03.4-4 (round two: 'no focus ring anywhere'; plan 03.4-09 shipped a `.shell__place:focus` fallback in shell.css). Round-two device_check: Mark enabled FKA and re-ran, still no rings. Round three: focus visibly cycles the browser chrome and never enters the page."

## Eliminated

- hypothesis: "Something in the shipped page makes the document's first focusable unreachable (tabindex=-1, inert, aria-hidden, autofocus, the .app-boot pre-paint path, an iframe, the <details> More element)."
  evidence: "app/dist/index.html is bare; the JS bundle has 0 `inert`; Shell.jsx's only tabIndex=-1 is the display:none hidden file input; no autofocus/iframe/focus() call anywhere in the shell or Home; main.jsx's boot path only renders a <p> then the App; More's <details> is display:none above 759.98px (out of focus order at 1366). The sequential focus order at 1366 is Search, Import, Export, Home, Notebook, Recipe book, Idea log, Ingredients, Kitchen — intact."
  timestamp: 2026-09-22T19:05Z

- hypothesis: "The build Mark tested predates the 03.4-09 fallback, or the fallback did not survive the build."
  evidence: "dist assets are dated 13:45 local; commit 48dfe22 (the fallback) is 12:54 local; dist/assets/index-BZDyv6Ge.css contains `.shell__place:focus{...}` once. UAT round three started 13:50 local."
  timestamp: 2026-09-22T19:05Z

- hypothesis: "A stylesheet rule hides the ring on the device, so focus is arriving invisibly (the round-two reading)."
  evidence: "Already eliminated in ipad-keyboard-no-focus-ring.md (no outline:none, no coarse-media outline rule; binder.test.js forbids outline:none) and now moot: the round-three observation is that focus stays in the chrome, and the `.shell__place:focus` fallback cannot paint on an element that never becomes activeElement. Ring styling is not the gate."
  timestamp: 2026-09-22T19:15Z

- hypothesis: "Full Keyboard Access makes links Tab-reachable in WebKit, so with FKA on the links should have been focused (the premise the 03.4-09 plan was built on)."
  evidence: "WebKit source: FKA feeds only KeyboardAccessFull (WebPage.cpp:5053-5057), which EventHandler::tabsToAllFormControls consults for form controls (EventHandler.cpp:5097-5118) and EventHandler::tabsToLinks never consults (EventHandler.cpp:5080-5090). Links require KeyboardAccessTabsToLinks (the TabsToLinks preference, default false; UnifiedWebPreferences.yaml:5969-5977) or an explicit tabindex (HTMLAnchorElement.cpp:132-134)."
  timestamp: 2026-09-22T19:25Z

## Evidence

- timestamp: 2026-09-22T19:00Z
  checked: ".planning/debug/knowledge-base.md and .planning/debug/resolved/"
  found: "Neither exists. Closest prior session is .planning/debug/ipad-keyboard-no-focus-ring.md (status: diagnosed, unarchived)."
  implication: "Known-pattern candidate only via the sibling file. Its falsification test — 'On the iPad, Tab into the page and read document.activeElement. If it never becomes a .shell__place, focus is not moving and the cause is the device' — was never executed; round-two device_check reads 'still no focus rings' and the re-verifier inferred 'focus lands' from that, which the round-three report contradicts."

- timestamp: 2026-09-22T19:05Z
  checked: "app/dist (built 2026-09-22 13:45 local, after commit 48dfe22 at 12:54 which added the fallback): dist/index.html, dist/assets/index-BZDyv6Ge.css, dist/assets/index-F7AIOFDT.js"
  found: "The served build contains `.shell__place:focus{outline:var(--focus-outline-width) solid var(--app-text);outline-offset:var(--focus-outline-offset)}` (1 match) plus the global `:focus-visible` rule. dist/index.html is `<div id=root>` + one module script + one stylesheet link — no tabindex, no inert, no iframe, no autofocus, no hidden attribute on body. The JS bundle has 0 occurrences of `inert`."
  implication: "The build Mark tested is the one with the 03.4-09 fallback. That rule can only paint once document.activeElement is a .shell__place; it does nothing to bring focus INTO the document, so it was never a candidate fix for the symptom now reported."

- timestamp: 2026-09-22T19:05Z
  checked: "app/src/ui/Shell.jsx (whole file), app/src/main.jsx, app/index.html, app/src/styles/shell.css (whole file), grep of app/src for tabindex|inert|aria-hidden|autofocus|iframe|.focus()"
  found: "At 1366px the first sequential focusables in DOM order are: Search (NavLink → <a href>), Import (<button type=button>), Export (<button type=button>), then the rail's Home + 5 place links (<a href>). None carries a tabIndex. The only tabIndex=-1 in the shell is the hidden file <input> (also display:none + aria-hidden). No `inert`, no `autofocus`, no iframe anywhere under app/src. .shell__tabs (and More's <summary>) is display:none above 759.98px so it is out of the focus order on the iPad. main.jsx renders <p class=app-boot> first, awaits seedIfEmpty, then renders <App/> — nothing in the boot path calls focus() or blur(), nothing sets tabindex on body/root. The routed pages' focus() calls (VersionRow, BatchRow, Method, Headnote autoFocus) are all inside recipe routes, not Home."
  implication: "ELIMINATES the 'page makes its first focusable unreachable' family. The document's sequential focus order is intact and starts at Search — but seven of the nine stops are links and two are buttons, and on WebKit those two element classes sit behind two different platform gates (next entries)."

- timestamp: 2026-09-22T19:10Z
  checked: "WebKit main branch sources (raw.githubusercontent.com): Source/WebKit/UIProcess/ios/WKContentViewInteraction.mm, WebProcess/WebPage/WebPage.cpp, WebCore/page/EventHandler.cpp, WebCore/html/HTMLAnchorElement.cpp, HTMLFormControlElement.cpp, WebCore/dom/Element.cpp, WTF/Scripts/Preferences/UnifiedWebPreferences.yaml"
  found: |
    1. Which elements Tab may land on is decided by `WebPage::keyboardUIMode()` (WebPage.cpp:5053-5057):
       `(WebProcess::fullKeyboardAccessEnabled() ? KeyboardAccessFull : Default) | (m_tabToLinks ? KeyboardAccessTabsToLinks : 0)`;
       m_tabToLinks reads the TabsToLinks preference (WebPage.cpp:5444), default false on Apple platforms
       (UnifiedWebPreferences.yaml:5969-5977). No iOS UIProcess file sets it.
    2. Links (<a href>): `HTMLAnchorElement::isKeyboardFocusable` (HTMLAnchorElement.cpp:127-142) — if the element has an
       explicit tabindex (`Element::supportsFocus()` = `!!tabIndexSetExplicitly()`, Element.cpp:452-455) it goes straight to
       `Element::isKeyboardFocusable` (Element.cpp:467-481: focusable && tabindex >= 0). Otherwise it returns false unless
       `EventHandler::tabsToLinks` (EventHandler.cpp:5080-5090) is true = `keyboardUIMode & KeyboardAccessTabsToLinks`,
       inverted only by Option+Tab on a real keydown (isKeyboardOptionTab, EventHandler.cpp:5057-5063). KeyboardAccessFull
       plays no part.
    3. Buttons: `HTMLFormControlElement::isKeyboardFocusable` (HTMLFormControlElement.cpp:220-227) — explicit tabindex →
       `Element::isKeyboardFocusable`; otherwise `tabsToAllFormControls` (EventHandler.cpp:5097-5118): true if
       KeyboardAccessFull, or if TabsToLinks, or on Option+Tab; else false.
    4. Text inputs are always keyboard-focusable (TextFieldInputType.cpp:99-107) — the well-known 'Tab only moves between
       text fields on iPad' behaviour is these three rules together.
    5. Raw Tab keydowns that reach the content view while nothing is contentEditable are deliberately not consumed by
       UIKit's text system (WKContentViewInteraction.mm:7929 `if (!contentEditable && event.isTabKey) return NO;`) — they
       go to the web process and WebCore's default Tab handler advances focus under the rules above.
  implication: "On iPadOS Safari the seven link stops are unreachable by Tab with the current markup no matter what Full Keyboard Access is set to. The two button stops are reachable only while KeyboardAccessFull is true in Safari's web process. This is the primary root cause and it is decided from source."

- timestamp: 2026-09-22T19:20Z
  checked: "Source/WebKit/UIProcess/ios/WKContentView.mm, WKContentViewInteraction.mm:6338-6345, WebCore/page/FocusController.cpp:666-800, WebKit/WebProcess/WebCoreSupport/WebChromeClient.cpp:347-357, WebKit/UIProcess/WebPageProxy.cpp:13766-13773, WebKit/UIProcess/Cocoa/UIDelegate.mm:783-798, WKUIDelegatePrivate.h:193,306; commits 43e9aac7b4, 0364566349, 2640bdc5e2, 89bf60bf9f"
  found: |
    - The chrome→page hand-off exists since iOS 15: WKContentView `canBecomeFocused` (WKContentView.mm:754-761) is YES when the
      embedder implements `_webView:takeFocus:` (Safari is the internal client this was built for) and `_webViewCanBecomeFocused:`
      does not veto; `didUpdateFocusInContext:` (763-771) on UIFocusHeadingNext calls
      `_becomeFirstResponderWithSelectionMovingForward:YES`, which calls `WebPageProxy::setInitialFocus(forward, isKeyboardEventValid=false)`
      (WKContentViewInteraction.mm:6338-6345) → `FocusController::setInitialFocus(dir, nullptr)` → `advanceFocus` with an EMPTY
      FocusEventData (FocusController.cpp:666-687). Commit 2640bdc5e2: 'This logic enables a tab or a shift+tab to change the
      focus from browser chrome directly to an element on a web page.'
    - With InitialFocus::Yes and no keyboard-focusable element, FocusController.cpp:749-765 focuses nothing and does NOT
      relinquish; the content view still becomes first responder. On the next Tab (InitialFocus::No) with still nothing
      focusable, `relinquishFocusToChrome` → `WebChromeClient::takeFocus` → `WebPageProxy::takeFocus` → Safari's
      `_webView:takeFocus:` → focus returns to Safari's chrome.
    - WKContentView sets `self.focusEffect = nil` (WKContentView.mm:298-301), so the web view as a whole never draws a UIKit
      focus ring while it is the focused item.
    - The FKA value reaches the web process from `WKFullKeyboardAccessWatcher` (`_AXSFullKeyboardAccessEnabled()` on iOS,
      commit 66ea0fe160 2018-12-17), snapshotted at web-process creation (WebProcessPool.cpp:1051) and updated only when
      kAXSFullKeyboardAccessEnabledNotification is observed on the UI process's default NSNotificationCenter.
  implication: "From Mark's chair, an iPad whose web process sees no keyboard-focusable element behaves exactly as reported: Tab reaches the (ring-less) web view for one press, nothing in the page takes focus, the next Tab hands focus straight back to the chrome. Two device-side conditions produce that: (A) KeyboardAccessFull not propagated (FKA flipped while Safari was already running and the notification was not delivered) so even Import/Export are excluded; or (B) Safari's focus loop never visits the content view in this configuration. Both are undecidable from source; the probe below separates them. With (A) cleared and links still tabindex-less, the expected observation is rings on Import and Export only."

- timestamp: 2026-09-22T19:30Z
  checked: "WebKit commit 89bf60bf9f (2019-05-14, '[iOS] Cannot tab or shift + tab out of address bar on google.com') and the tabindex branches at HTMLAnchorElement.cpp:132-134 and HTMLFormControlElement.cpp:222-223"
  found: "'Non-editable elements can participate in tab cycling via the HTML tabindex attribute. We should allow setting the initial focus to such an element when transitioning from the chrome (e.g. address bar) to the web page.' Both the anchor and form-control keyboard-focusability paths short-circuit to Element::isKeyboardFocusable when tabindex is set explicitly, bypassing the TabsToLinks and FKA gates."
  implication: "An explicit tabIndex={0} on the shell's stops is the one page-side change that makes them keyboard-focusable on WebKit independent of any device or Safari preference. It is the fix direction, not applied here."

- timestamp: 2026-09-22T19:35Z
  checked: "Apple's 'Control iPad with an external keyboard' guide (Full Keyboard Access defaults: Tab = move forward, Shift-Tab = move backward, Space = activate, Tab-H = commands list), WWDC21 sessions 10120 and 10260 (Tab moves between focus groups, arrows within a group; the same focus system drives FKA), and web searches for an iPadOS Safari 'tab to links' switch"
  found: "No iPadOS counterpart to macOS Safari's 'Press Tab to highlight each item on a webpage' is documented anywhere; every hit for that setting is macOS. FKA's documented Tab semantics are item/group movement through UIKit's focus system, which is the system WKContentView's `didUpdateFocusInContext:` participates in."
  implication: "Mark has no setting on the iPad that would let Tab reach the links with the current markup. The gap is a code/test-scope gap, not a mis-set device."

## Resolution

root_cause: |
  Two contributing conditions (AND-gate), the first decided from source, the second needing the device.

  1. CODE + PLATFORM (primary, decided): seven of the nine desktop-arm stops — Search, Home and the five rail places — are
     NavLink <a href> elements with no explicit tabindex (Shell.jsx:218, 250, 130). WebKit makes such a link keyboard-focusable
     only when the embedder's TabsToLinks preference is on (HTMLAnchorElement.cpp:127-142 → EventHandler::tabsToLinks,
     EventHandler.cpp:5080-5090 → `keyboardUIMode & KeyboardAccessTabsToLinks`, WebPage.cpp:5053-5057). That preference
     defaults to false on Apple platforms (UnifiedWebPreferences.yaml:5969-5977), iPadOS Safari exposes no switch for it, and
     Full Keyboard Access never touches it — FKA only sets KeyboardAccessFull, which EventHandler::tabsToAllFormControls
     (EventHandler.cpp:5097-5118) consults for buttons and inputs. So on Mark's iPad, Tab cannot land on any link stop under
     any setting, and the truth "a ring at every stop through Search ... and each place in the rail" is unsatisfiable with the
     current markup. The 03.4-09 fallback (`.shell__place:focus`, shell.css:207-210) is present in the served build
     (dist/assets/index-BZDyv6Ge.css) but styles a focus that cannot arrive; the plan was built on the round-two inference
     "focus lands without :focus-visible", which was never measured and which the round-three report falsifies.

  2. DEVICE (secondary, undecided from source): the two button stops, Import and Export (Shell.jsx:222, 226), ARE
     keyboard-focusable when KeyboardAccessFull is true in Safari's web process. Mark saw no ring on them either, which
     needs one of: (A) KeyboardAccessFull not propagated — WKFullKeyboardAccessWatcher reads `_AXSFullKeyboardAccessEnabled()`
     at web-process launch and thereafter only on kAXSFullKeyboardAccessEnabledNotification; FKA was switched on during round
     two while Safari was already running; or (B) Safari's UIKit focus loop never hands focus to the WKContentView in this
     configuration (`_webViewCanBecomeFocused:` / `_webView:takeFocus:` are Safari's, closed-source). In either case the
     mechanics from the chair are identical: Tab reaches the ring-less content view (`focusEffect = nil`,
     WKContentView.mm:298-301) or skips it, WebCore's setInitialFocus (FocusController.cpp:666-765) finds nothing, and the
     next Tab relinquishes focus back to the chrome via `_webView:takeFocus:` (FocusController.cpp:749-753 →
     WebChromeClient.cpp:353-357 → WebPageProxy.cpp:13766-13773 → UIDelegate.mm:783-798). "Focus moves on the browser chrome
     only" is exactly what that looks like.

  ELIMINATED: any page-side unreachability (no tabindex=-1/inert/aria-hidden/autofocus/iframe on the stops; boot path
  touches no focus; More is display:none at 1366); a stale build (dist postdates the fallback commit and contains it); a
  stylesheet hiding the ring (no outline:none, no coarse-media outline rule — and moot, since focus never arrives).
fix: "[not applied — goal: find_root_cause_only]. Direction only: explicit tabIndex={0} on every shell stop (the seven NavLinks and two buttons; the tab row's four links and More's summary for the phone arm) — HTMLAnchorElement.cpp:132-134 and HTMLFormControlElement.cpp:222-223 route an element with an explicit tabindex past the TabsToLinks/FKA gates, so Search becomes the document's first keyboard-focusable element for the chrome→page hand-off. Pin it in Shell.test.jsx. Then split the UAT truth: (a) with focus already in the page (tap once, then Tab) rings at every stop in order; (b) Tab from the chrome enters the page — a device/Safari behaviour to record, not assert, until measured."
verification: "[not applicable — diagnose-only]. On-device probe for the secondary condition is in the handback."
files_changed: []

## Device probe (needs Mark) — appended 2026-09-22 by the verify-work orchestrator from the debugger's hand-back

Preview server must be running (`npm --prefix app run build && npm --prefix app run preview -- --host`, one Vite process only). Install once on the iPad: in Safari, bookmark any page, then Bookmarks → Edit → change the bookmark's URL to the line below (paste it whole). Opening that bookmark on the app page adds a yellow overlay at the bottom that logs every keydown / focus change with `document.activeElement`.

```
javascript:(function(){var o=document.getElementById('fkaprobe');if(!o){o=document.createElement('div');o.id='fkaprobe';o.style.cssText='position:fixed;left:0;bottom:0;z-index:2147483647;max-width:100vw;background:#ffec3d;color:#000;font:14px/1.4 monospace;padding:8px;white-space:pre-wrap';document.body.appendChild(o);}var n=0;function d(el){if(!el)return 'none';return el.tagName+(el.className?'.'+String(el.className).split(' ')[0]:'')+(el.textContent?' "'+el.textContent.trim().slice(0,12)+'"':'');}function log(t){n++;o.textContent=n+' '+t+' | active='+d(document.activeElement)+' | hasFocus='+document.hasFocus()+'\n'+o.textContent.split('\n').slice(0,5).join('\n');}document.addEventListener('keydown',function(e){log('keydown '+e.key+(e.altKey?'+alt':'')+(e.ctrlKey?'+ctrl':'')+(e.shiftKey?'+shift':''));},true);document.addEventListener('focusin',function(e){log('focusin '+d(e.target));},true);document.addEventListener('focusout',function(e){log('focusout '+d(e.target));},true);window.addEventListener('focus',function(){log('window focus');});window.addEventListener('blur',function(){log('window blur');});log('probe ready');})();
```

Steps, in order, reporting the overlay's top line after each:

1. With Full Keyboard Access already ON, force-quit Safari (App Switcher → swipe it away), reopen it, load http://192.168.1.133:4173/ , tap the bookmark. Overlay should read "1 probe ready | active=BODY".
2. Tap the address bar, then press Tab up to 12 times, watching the overlay.
   - Overlay never changes → Safari's focus loop never visits the web view (condition B): a Safari/FKA behaviour; no page change can move focus in from the chrome — the truth must be split.
   - "window focus" and/or "keydown Tab | active=BODY" then focus leaves → the web view was entered but nothing was focusable (condition A: FKA value not reaching the web process even after relaunch).
   - "focusin BUTTON.shell__place "Import"" (Search skipped) → hand-off works and FKA is propagated; links skipped exactly as diagnosed; the tabindex fix will make Search first.
3. Tap once on blank white space in the page (below the rail), then press Tab. Same three readings as step 2, now independent of the chrome hand-off. Then press Option+Tab: if "focusin A.shell__place "Search"" (or a rail place) appears, that is the TabsToLinks gate observed directly — links reachable only with the Option inversion.
4. (Optional) After step 3, report whether the `.shell__place:focus` ring is visible on whichever element the overlay names as active — that confirms the 03.4-09 rule paints once focus does arrive.

Alternative to the bookmarklet: Settings → Apps → Safari → Advanced → Web Inspector on, cable to the Mac, Safari (Mac) → Develop → iPad → the page, and evaluate `document.activeElement` after each keypress.

## Device probe result — Mark, 2026-09-22

"overlay never changed on 1-4" — after "probe ready", no keydown, focusin, focusout, window focus or window blur was logged at any step: not from the address bar (step 2), not after tapping in the page (step 3), not for Option+Tab (step 3).

Reading: with Full Keyboard Access on, Tab (and Option+Tab) is consumed by UIKit's focus engine before it is ever dispatched to the page as a DOM keydown — the page never sees the key at all, even when it was just tapped. The page can therefore participate only through the UIKit focus hand-off (`WKContentView didUpdateFocusInContext` → `setInitialFocus`), and that hand-off makes no DOM event unless it finds a keyboard-focusable element. With no explicit tabindex on any shell stop and FKA's `KeyboardAccessFull` possibly not reaching the web process, there is nothing for it to find, so the overlay stays silent. This is consistent with condition (1) (link gate) plus either (2A) or (2B); it does not separate 2A from 2B.

What it does decide: no keyboard-event-side fix (key handlers, `:focus-visible` work) can help, because no key event arrives. The only lever the page has is to offer the hand-off a focus candidate — the explicit `tabIndex={0}` in plan 03.4-14. That plan is now also the discriminating experiment: after it ships, re-run the probe. `focusin A.shell__place "Search"` means the hand-off works and 2A/2B were moot; still silent means Safari never hands UIKit focus to the web view (2B) — a Safari/FKA behaviour with no page-side remedy, and truth (b) is dropped rather than re-planned.

Optional cross-check Mark can do meanwhile: on the iPad with FKA on, open any page with a text input (e.g. a search engine) and press Tab from the address bar; if focus never enters that page either, 2B is confirmed independently of Sprinkles.
