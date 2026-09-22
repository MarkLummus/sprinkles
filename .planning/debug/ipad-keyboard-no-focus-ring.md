---
status: diagnosed
trigger: "pass on desktop; fail on iPad with keyboard / details on test 4: no focus ring anywhere."
created: 2026-09-22T00:00:00Z
updated: 2026-09-22T00:00:00Z
---

## Current Focus

bug_class: "Bohrbug — deterministic on the device, deterministic pass on desktop; an environment-conditioned Bohrbug, not a Heisenbug (Mark reports it every time on iPad, never on desktop). SBFL skipped: no failing automated test exists — the suite runs in jsdom, which cannot model WebKit focus modality."

hypothesis: "The app authors focus rings through exactly one mechanism, `:focus-visible` (app.css:21), and every test-4 stop is an <a>/<button>/<summary> — not a form field. iPadOS Safari does not route Tab to non-form-control elements unless Full Keyboard Access is on, so on the iPad focus never lands on those controls and no ring can paint. No stylesheet rule suppresses the ring under coarse pointer."
test: "Grep every focus/outline site under app/src/styles; read both (pointer: coarse) media blocks in full; enumerate the element types of every test-4 stop in Shell.jsx; confirm the tab row's display state at 1366."
expecting: "If (a) were true, an outline declaration would appear inside a coarse/hover media block. If (b) or (c), no such rule exists and the discriminator is element type + device setting."
next_action: "Diagnosis complete (goal: find_root_cause_only). Hand back; no fix applied."

reasoning_checkpoint:
  hypothesis: "Focus rings are absent on the iPad because keyboard focus never arrives at the controls, not because a rule hides the ring. iPadOS Safari with Full Keyboard Access off restricts Tab to text inputs and selects (Apple, WWDC21 'Focus on iPad keyboard navigation'); every stop test 4 names is an <a>, <button> or <summary>, and the app's sole ring mechanism is `:focus-visible` (app.css:21) with no `:focus` fallback that could reveal the difference."
  confirming_evidence:
    - "Direct: neither coarse-pointer media block (app.css:2377, app.css:2540) contains any `outline` declaration; binder.test.js:114-117 asserts no `outline: none` exists app-wide."
    - "Direct: shell.css and home.css contain zero `:focus` selectors — the shell's rings come only from the global `:focus-visible` rule."
    - "Direct: Shell.jsx renders every test-4 stop as NavLink (<a>), <button type=button>, or <summary>. Zero form controls."
    - "Direct: ring is #141414 at 2px against --app-background #ffffff (tokens.css:7, 119-120, 367) — a contrast or token-resolution cause is impossible."
    - "External, Apple's own: without Full Keyboard Access, iPadOS Safari's Tab cycles text inputs and selects only; links and buttons are excluded."
  falsification_test: "On the iPad, Tab into the page and read document.activeElement. If it never becomes a .shell__place, focus is not moving and the cause is the device (c). If it DOES become a .shell__place while el.matches(':focus-visible') is false, the cause is the WebKit heuristic (b) and the app needs a `:focus` fallback."
  fix_rationale: "N/A — diagnose-only. Direction, not implementation: whatever the device answer, the app carries a real robustness gap (single `:focus-visible` mechanism, no fallback) and the UAT step names a surface that is display:none on the tested device."
  blind_spots:
    - "Whether Full Keyboard Access is on or off on Mark's iPad — untested, and it decides (b) vs (c)."
    - "Whether Mark's 'pass on desktop' was Chrome or macOS Safari. macOS Safari with 'Press Tab to highlight each item' OFF would also skip links and buttons, so a Chrome-only desktop pass leaves WebKit's ring behaviour entirely unobserved."
    - "iPadOS version. `:focus-visible` needs Safari 15.4+; an older iPadOS would drop the rule as an unknown selector and produce the same total absence."
    - "Whether Mark tested the iPad in Split View narrow enough (<760px) to actually render the tab row; at full width it is display:none."
  candidate_causes:
    - "code: the single `:focus-visible` mechanism has no `:focus` fallback, so a platform that does not set the keyboard modality paints nothing (app.css:21)"
    - "environment: iPadOS Safari excludes links/buttons/summary from Tab unless Full Keyboard Access is on — focus never arrives"
    - "config/test-authoring: the UAT step names the tab row + More, which shell.css:247-263 puts at display:none above 760px; Mark's iPad is 1366/1024, so that arm of the test is unexecutable on the device"
  and_gate: "yes. The observed 'no focus ring anywhere' needs the platform condition AND the absence of any authored diagnostic to be indistinguishable from a styling bug. And the reported failure spans two surfaces, only one of which exists on the device — so the single report 'fail' bundles a platform behaviour with a test-scope error. Neither alone accounts for the whole report."

## Symptoms

expected: A visible focus ring at every Tab stop through the tools row (Search/Import/Export), the rail or tab row, and More (UX1-01).
actual: "pass on desktop; fail on iPad with keyboard" / "details on test 4: no focus ring anywhere."
errors: None reported.
reproduction: Test 4 in .planning/phases/03.4-the-design-layer-in-code-app-palette-sheet-prefixed-tokens-t/03.4-UAT.md. Desktop Chrome/Safari shows rings; iPad Safari with hardware keyboard shows none.
started: Discovered during 03.4 UAT on 2026-09-22 (gap G-03.4-4).

## Eliminated

## Evidence

- timestamp: 2026-09-22
  checked: ".planning/debug/knowledge-base.md and .planning/debug/resolved/"
  found: "Neither exists. No prior resolved session to match against; twelve earlier debug files sit unarchived in .planning/debug/ and none concerns focus rings."
  implication: "No known-pattern shortcut. Investigate from evidence."

- timestamp: 2026-09-22
  checked: "grep ':focus' across app/src/styles/*.css"
  found: "Exactly four focus-painting selectors exist app-wide: the global `:focus-visible` rule (app.css:21-24), the documented `.is-landing-focus:focus` exception (app.css:604-607), and the two radio `:has(input:focus-visible)` rules (app.css:1988-1992, and its forced-colors twin at 2583-2586). shell.css and home.css contain NO `:focus` selector at all."
  implication: "Every focus ring on the tools row, the rail and the tab row comes from the single `:focus-visible` rule. There is no `:focus` fallback for any of those controls."

- timestamp: 2026-09-22
  checked: "grep 'outline' across app/src, and the touch media blocks at app.css:2377 (max-width 759.98 OR pointer: coarse) and app.css:2540 (min-width 760 AND pointer: coarse), read in full"
  found: "Neither coarse-pointer block contains any `outline` declaration. The only outline sites are the four focus rules plus three state rules at --rule-graduation (app.css:1012, 1710; history.css:19). binder.test.js:114-117 asserts no rule anywhere declares `outline: none`."
  implication: "ELIMINATES explanation (a). No stylesheet rule hides rings under touch/coarse media, and nothing resets outline globally."

- timestamp: 2026-09-22
  checked: "tokens.css for the tokens the global focus rule reads"
  found: "--sheet-ink: #141414 (tokens.css:7), --focus-outline-width: var(--rule-hover) = 2px (tokens.css:78, 119), --focus-outline-offset: 2px (tokens.css:120) — all defined at :root, unconditionally."
  implication: "No var()-resolution failure could make the outline shorthand invalid-at-computed-value-time on one device and not another. The declaration is well-formed everywhere. Rules out a token-scoping cause introduced by the 03.4 app-*/sheet-* prefix rework."

- timestamp: 2026-09-22
  checked: "app/src/ui/Shell.jsx — the element type of every stop test 4 names"
  found: "Tools row: Search is a NavLink (<a href>), Import and Export are <button type=button>. Rail: six NavLinks (<a href>). More: a <summary> inside <details>. NOT ONE of the test-4 stops is a form control (input/textarea/select). The only <input> in the shell is the hidden file input, and it carries tabIndex={-1} and aria-hidden."
  implication: "Every test-4 stop falls in exactly the category iPadOS Safari excludes from Tab traversal by default. This is the discriminating fact."

- timestamp: 2026-09-22
  checked: "shell.css:247-249 and 257-263 — the rail/tab-row switch"
  found: "`.shell__tabs { display: none }` unconditionally, overridden to `display: flex` only inside `@media (max-width: 759.98px)`; `.shell__rail` is hidden by that same block. The switch is WIDTH-keyed, never pointer-keyed."
  implication: "Mark's iPad reports viewport 1366 landscape (app.css:2375 records the measurement) and 1024 portrait — both above 760px. The bottom tab row and More are display:none and out of the accessibility tree on the iPad at every orientation. Test 4's 'tab row + More' arm is not reachable on that device at all; only the tools row and the rail are."

- timestamp: 2026-09-22
  checked: "app.css:593-607, the project's own note on why .is-landing-focus needs a plain :focus rule"
  found: "The codebase already documents one case where `:focus-visible` refused to paint because the browser's input-modality tracking had recorded a mouse click, and solved it with a scoped `:focus` rule."
  implication: "The single-mechanism design is known to be modality-dependent. A second modality boundary — a platform that never sets the keyboard modality for Tab on links and buttons — produces exactly the reported total absence of rings, with no rule needing to be wrong."

## Resolution

root_cause: |
  Three contributing conditions; the code eliminates the styling explanation outright.

  1. ENVIRONMENT (primary): iPadOS Safari does not route Tab focus to links, buttons or
     summary elements unless Full Keyboard Access is enabled — Apple states this directly
     in WWDC21 "Focus on iPad keyboard navigation": without Full Keyboard Access the Tab key
     cycles text inputs and select elements only. Every stop test 4 names is a NavLink
     (<a href>), a <button type=button>, or More's <summary> (Shell.jsx). Not one is a form
     control. So on the iPad focus almost certainly never lands on any of them, and no ring
     of any kind — CSS or system — can appear. Desktop passes because Chrome (and macOS
     Safari with "Press Tab to highlight each item" on) does traverse links and buttons.

  2. CODE (robustness gap, not the trigger): the app authors focus rings through exactly
     one mechanism — the global `:focus-visible` rule at app.css:21-24 — with no `:focus`
     fallback for any shell control. shell.css and home.css declare no focus style at all.
     This is deliberate (D-14, "one focus rule"), and app.css:593-607 already records one
     case where `:focus-visible` refused to paint on a modality boundary. The consequence
     here is diagnostic, not visual: "no ring" cannot be told apart from "focus never
     arrived" without instrumenting the device.

  3. TEST SCOPE (part of the reported failure is unexecutable): shell.css:247-249 keeps
     `.shell__tabs { display: none }` and only reveals it inside
     `@media (max-width: 759.98px)`. Mark's iPad reports 1366 landscape (recorded as a
     measurement at app.css:2375) and 1024 portrait — both above 760px. The bottom tab row
     and More are therefore display:none and out of the accessibility tree on that device
     at every orientation. Test 4's "tab row + More at narrow widths" arm can never be
     exercised on the iPad, so part of "no focus ring anywhere" reports a surface that is
     not rendered rather than a ring that failed to paint.

  ELIMINATED — explanation (a), a stylesheet rule hiding rings under touch/coarse media:
  neither coarse block (app.css:2377 `(max-width: 759.98px), (pointer: coarse)`; app.css:2540
  `(min-width: 760px) and (pointer: coarse)`) contains any `outline` declaration, and
  binder.test.js:114-117 asserts no rule anywhere declares `outline: none`. Ring colour and
  width are unconditional :root tokens (#141414, 2px, 2px offset) against
  --app-background #ffffff, so no contrast or var()-resolution cause is possible either.
fix: "[not applied — goal: find_root_cause_only]"
verification: "[not applicable — diagnose-only]"
files_changed: []
