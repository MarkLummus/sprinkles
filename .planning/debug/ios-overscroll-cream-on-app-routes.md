---
status: diagnosed
trigger: "On iOS Safari the elastic-overscroll (rubber-band) colour behind a non-Sheet route is the App's white? No - 'Fail. It's cream on all pages that I tested.' UAT test 9 / gap G-03.4-9 / 03.4-REVIEW.md IN-03."
created: 2026-09-22T15:35:00Z
updated: 2026-09-22T15:55:00Z
mode: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - the canvas background is the Sheet cream on every route, because `html` declares no background at all (so `body`'s `background: var(--sheet-ground)` is propagated to the canvas and paints it without bound), while the App's white is declared only on `.shell`, a descendant whose background can never reach the canvas. iOS Safari paints the rubber-band region with the canvas background.
test: (1) source audit of every element that can paint cream on an App route; (2) a four-variant browser experiment isolating canvas propagation from box painting.
expecting: confirmed - cream fills every pixel a descendant does not cover; declaring the colour on the root element (or switching body's own colour) moves the canvas.
next_action: none - diagnose-only mode. Root cause reported to caller; fix belongs to a plan for G-03.4-9.

bug_class: Bohrbug (deterministic; engine-conditional visibility - only engines with elastic overscroll, i.e. WebKit/iOS and macOS Safari, expose the canvas colour at all, which is why every Chromium check passed)

reasoning_checkpoint:
  hypothesis: "The rubber-band region paints the CSS canvas background. `html` has no background rule anywhere in the codebase, so the UA propagates `body`'s background - `var(--sheet-ground)`, cream - to the canvas, where it paints unbounded. `.shell`'s `background: var(--app-background)` is a descendant background and is architecturally incapable of painting the canvas. Therefore the overscroll is cream on every route, App or Sheet."
  confirming_evidence:
    - "app/src/styles/app.css:5-11 declares `body { background: var(--sheet-ground) }` unconditionally; tokens.css:6 makes that #f7f7f4 (cream)."
    - "No `html` selector exists in any stylesheet (grep over app/src/styles/*.css returns only comment text referencing index.html); app/index.html carries no inline style, no <meta name=\"theme-color\">, and no color-scheme declaration exists anywhere."
    - "app/src/styles/shell.css:20-26 puts `background: var(--app-background)` on `.shell`, which is `<div class=\"shell\">` inside `#root` inside `<body>` (Shell.jsx:194, main.jsx:20) - two levels below the propagating element."
    - "Experiment (Chromium headless, 400x800): variant A reproduces the exact layering (no html rule, body cream, descendant white with a short box). Every pixel outside the descendant's box is (247,247,244) cream - body's background painted the whole canvas, not just body's box."
    - "Experiment variant B adds `html { background: #ffffff }` and the same pixels become (255,255,255): with html non-transparent, body's cream stops propagating and is confined to its own box. This isolates propagation as the mechanism."
    - "On an App route no other cream painter renders: the only `--sheet-ground` declarations are body (app.css:7), .page-status (306), .page-head (353), .not-found (377), .recipe-page (421) - the last four render only on /recipe/* (RecipePage.jsx:846, 1772; router.jsx:61). Home renders .list-page + .home (RecipeList.jsx:43-44) and the placeholders .list-page + .place (Placeholder.jsx:8), none of which paint cream. #f7f7f4 appears nowhere but the token definition."
  falsification_test: "If some other element painted the cream, variant A would not reproduce it from body alone, or a cream painter would be reachable on Home. Both checks came back negative. If the canvas were NOT the rubber-band source, variant B's html-level change would not move those pixels."
  fix_rationale: "The colour must be declared on an element whose background reaches the canvas - the root element, or `body` while `html` stays transparent. Repainting `.shell` or any descendant cannot fix it at any size, because the canvas is unbounded and no descendant background propagates."
  blind_spots:
    - "The experiment ran in Chromium (Blink), not WebKit: canvas propagation is engine-agnostic spec behaviour and Mark's device already supplies the WebKit symptom, but the FIX has not been seen on an iPad/iPhone. Per 'verify in the engine that matters', whatever lands must be confirmed on Mark's own device."
    - "Not investigated: whether iOS also tints the URL/status-bar chrome from the same canvas colour (it does on some versions). If so the fix changes that band too - a design question, not a defect."
    - "Whether the Sheet routes' canvas SHOULD be cream is a design decision I did not settle (see the note under Resolution)."
  candidate_causes:
    - "code (CSS cascade/architecture): the App ground is declared on a descendant (.shell) while the canvas-propagating element declares the Sheet cream - CONFIRMED"
    - "code (regression): commit 4105848 deleted the only rule that ever painted the App ground at a propagating level (`body:has(.home)` in home.css) and deleted the guard test named 'the route-level ground reaches the whole viewport' - CONFIRMED as how the defect arrived and why no test caught it"
    - "environment: WebKit/iOS elastic overscroll is the only surface that exposes the canvas colour; Chromium and Firefox desktop never rubber-band, so every non-device check is blind to it - CONFIRMED as the visibility condition, not the defect"
    - "config/build (Vite CSS order deciding a cascade fight): ELIMINATED - there is no competing rule to order; html is simply unstyled"
    - "data: ELIMINATED - no stored record influences a stylesheet"
  and_gate: "yes - three conditions hold simultaneously and removing any one removes the symptom: (a) `html` carries no background, so body's background becomes the canvas background; (b) body's background is the Sheet cream, unconditionally, on every route; (c) the App white is painted only on a descendant (.shell). The root cause is stated as that conjunction, not as any one line."

## Symptoms

expected: White (--app-background) behind App-context routes (Home, Notebook, Recipe book, Idea log, Ingredients, Kitchen, Search); cream (--sheet-ground) reserved for the three paper frames (recipe spread, batch log, print sheet).
actual: "Fail. It's cream on all pages that I tested." - cream rubber-band on every route tested, including App-context routes.
errors: none
reproduction: iOS Safari; open any App-context route; scroll past the top or bottom far enough to trigger elastic overscroll; observe the colour revealed behind the page.
started: Discovered in 03.4 UAT test 9 on 2026-09-22; predicted from source by 03.4-REVIEW.md finding IN-03 on 2026-09-21. The Home route regressed in commit 4105848 (2026-09-21); the other five destinations and /search never had an App-level canvas at all.

## Eliminated

- hypothesis: "Some element on the App routes paints cream over/behind the page (a stray rule, a literal, an inherited surface)."
  evidence: "The only `--sheet-ground` declarations in app/src are app.css:7 (body), 306 (.page-status), 353 (.page-head), 377 (.not-found), 421 (.recipe-page). The last four render only on /recipe/* routes; .page-status only inside .page-head. No cream literal (#f7f7f4) exists outside tokens.css:6. Home renders .list-page + .home; the placeholders render .list-page + .place - no cream painter among them."
  timestamp: 2026-09-22T15:48:00Z

- hypothesis: "The overscroll tint comes from a UA/system source - color-scheme, a theme-color meta, or a default canvas colour - rather than from author CSS."
  evidence: "grep over app/src and app/index.html finds no `color-scheme`, no `theme-color` meta, no `overscroll-behavior`, and no `height: 100%` on html/body. index.html's head is charset + viewport + title only. Variant A reproduces the cream from author CSS alone, so no UA source needs to be invoked."
  timestamp: 2026-09-22T15:49:00Z

- hypothesis: "`.shell` fails to cover the viewport (a sizing bug - min-height: 100vh not resolving on iOS), and the fix is to make the shell taller / use 100dvh."
  evidence: "Variant A shows the cream is the CANVAS, which is unbounded - it exists beyond any finite element box by definition. Variant B moves those pixels by changing only the root element's background, with the descendant's box untouched. No height given to `.shell` can paint the canvas, so shell sizing is not the mechanism."
  timestamp: 2026-09-22T15:52:00Z

- hypothesis: "Vite's stylesheet import order (main.jsx:3-8 loads app.css before shell.css) lets the wrong background win the cascade."
  evidence: "There is no cascade conflict: `body` and `.shell` are different elements, so both declarations apply and both win on their own element. The defect is which element propagates, not which declaration wins."
  timestamp: 2026-09-22T15:50:00Z

## Evidence

- timestamp: 2026-09-22T15:38:00Z
  checked: app/src/styles/app.css:5-11 and app/src/styles/tokens.css:6
  found: "`body { margin: 0; background: var(--sheet-ground); color: var(--sheet-ink); ... }`, with `--sheet-ground: #f7f7f4`. Unconditional - no route scoping of any kind."
  implication: "Every route's body is cream. The reviewer's IN-03 read of the source is accurate."

- timestamp: 2026-09-22T15:39:00Z
  checked: "grep -E '^\\s*(html|body|:root)' over app/src/styles/*.css"
  found: "Exactly two root-level selectors exist: `body` (app.css:5) and `:root` (tokens.css:4, token definitions only - it declares no `background`; plus app.css:2483, a 600px media block that only redefines --gap-page). There is no `html` selector anywhere in the project."
  implication: "html's background is the initial value, `transparent`. That is the precondition for CSS Backgrounds propagation: a transparent root element makes the UA propagate the BODY element's background to the canvas instead. The canvas - therefore the iOS rubber-band region - is cream on every route."

- timestamp: 2026-09-22T15:40:00Z
  checked: app/src/styles/shell.css:12-26 and app/src/ui/Shell.jsx:193-194, app/src/main.jsx:20
  found: "shell.css's own header comment states the intent - 'The shell owns the App ground for every route it wraps (gap 3, route.md 1): .shell paints --app-background once, here, rather than each route painting it for itself' - and `.shell { min-height: 100vh; background: var(--app-background); }`. The element is `<div className=\"shell\">`, rendered into `#root` inside `<body>`."
  implication: "The App ground is declared two levels below the propagating element. Descendant backgrounds never propagate to the canvas, so this white is invisible to the overscroll region at any size. The stated intent ('for every route it wraps') is met for in-page pixels and structurally unmeetable for the canvas."

- timestamp: 2026-09-22T15:42:00Z
  checked: app/src/router.jsx:87-102, RecipeList.jsx:43-44, Placeholder.jsx:8, RecipePage.jsx:846/1772
  found: "Every route nests under the Shell layout route. Sheet-context routes: /recipe/:id and /recipe/:id/batch/:batchId (render .page-head, then .recipe-page or .not-found). App-context routes: / (.list-page + .home), /notebook, /recipe-book, /idea-log, /ingredients, /kitchen, /search (.list-page + .place). The print sheet is not yet a route."
  implication: "Seven of nine routes are App-context, matching Mark's 'cream on all pages that I tested'. Both contexts currently share one canvas colour, so any fix must be able to differ per context, not just flip a global default."

- timestamp: 2026-09-22T15:44:00Z
  checked: "Chromium headless experiment, 400x800, pixel-sampled at y=5 (inside the descendant's box) and y=400/795 (outside it). Variant A = the app's layering: no html rule, `body { background: #f7f7f4 }`, descendant `.shell { min-height: 20px; background: #fff }`. Variant B = variant A plus `html { background: #fff }`."
  found: "A: y=5 (255,255,255) white; y=400 and y=795 (247,247,244) cream. B: all three sample points (255,255,255) white."
  implication: "Decisive. In A, body's cream painted the entire canvas far outside body's own 20px-tall box, and the descendant's white reached only its own box - exactly the defect's shape. In B, giving the root element a background stopped body's propagation and moved the canvas. The mechanism is canvas background propagation, and the lever is the root element (or body while html stays transparent)."

- timestamp: 2026-09-22T15:46:00Z
  checked: "Same harness. Variant C = html unstyled, `body { background: #fff }` plus `body:has(.recipe-page) { background: #f7f7f4 }`, with a script appending a `.recipe-page` div 50ms AFTER first paint (an SPA route change). Variant D = variant C with no injection."
  found: "C: y=400/795 (247,247,244) cream. D: y=400/795 (255,255,255) white."
  implication: "A per-context canvas is achievable in pure CSS and re-propagates dynamically when the matched descendant appears after first paint - so a client-routed navigation into and out of a Sheet frame moves the canvas with no JS and no route class on <body>. Prerequisite: html must stay unstyled, because giving html a background would cancel body's propagation (variant B)."

- timestamp: 2026-09-22T15:50:00Z
  checked: "git show 4105848 (feat(03.4-06): paint the shell's App ground and zero out the visited rule's specificity) - diffs of home.css and home.test.js"
  found: "The commit DELETED home.css's `body:has(.home) { background: var(--app-background); }`, whose own comment said it was scoped on body deliberately because no selector rooted at .home can reach the viewport edge. It also deleted home.test.js's guard test literally named 'the route-level ground reaches the whole viewport (fix round 1: no cream frame around a white card)', and rewrote the 'every rule is scoped under .home' test to remove the documented body exception. The App ground moved to `.shell` in the same commit."
  implication: "This is both the regression and the reason no gate caught it. The one rule that ever painted the App ground at a canvas-propagating level was retired as redundant, the guard that would have failed was deleted with it, and the replacement test (shell.test.js:59) asserts only that SOME rule declares --app-background - it cannot tell a canvas-propagating element from a descendant. For Home this is a regression introduced 2026-09-21; for the other six App routes there was never an App canvas to lose."

- timestamp: 2026-09-22T15:53:00Z
  checked: "grep for a test pinning body's background in app/src/styles/*.test.js"
  found: "None. No CSS test references the `body` selector's declarations at all (binder.test.js covers app.css but never looks up `body`). home.test.js:44 still enforces that every rule in home.css is scoped under `.home`."
  implication: "A fix's new rule cannot live in home.css (that guard would fail it); app.css's own prelude, where the `body` rule already lives, is the natural place. A replacement guard test is free to write and is the recurrence guard this class needs."

## Resolution

root_cause: |
  The elastic-overscroll region paints the CSS canvas background, and the canvas is cream on every route because of three conditions holding at once:
  (a) no stylesheet declares a background for the root element `html` (no `html` selector exists in app/src/styles at all), so html is transparent and the UA propagates the BODY element's background to the canvas;
  (b) app/src/styles/app.css:5-11 declares `body { background: var(--sheet-ground) }` unconditionally - cream, on every route, App or Sheet;
  (c) the App's white is declared only on `.shell` (app/src/styles/shell.css:20-26), a descendant of `#root` inside body, and descendant backgrounds never propagate to the canvas, so it cannot reach the overscroll region at any size.
  Remove any one condition and the symptom disappears. Commit 4105848 created (a)+(c) for Home by retiring home.css's `body:has(.home) { background: var(--app-background) }` - the only rule that ever painted the App ground at a canvas-propagating level - and moving the paint to `.shell`; for the other six App routes no App canvas ever existed. The same commit deleted the guard test named 'the route-level ground reaches the whole viewport', which is why no automated gate caught it, and elastic overscroll exists only in WebKit, which is why no Chromium check could see it.
fix: "[not applied - diagnose-only mode. Direction reported to caller.]"
verification: "[n/a - no fix applied]"
files_changed: []

design_question_for_mark: |
  The UAT expectation only speaks for App routes. The reviewer's suggested fix in IN-03 (paint --app-background on html/body as the new default) fixes the seven App routes and simultaneously turns the three paper frames' overscroll WHITE - a new cosmetic defect against "cream is reserved for the three paper frames". A per-context canvas (verified achievable in variants C/D) keeps both worlds right. Which is wanted is Mark's/Impeccable's call, not the fix's.
