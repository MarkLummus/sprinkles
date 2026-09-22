---
target: "Phase 03.4 surface — the App shell (rail, tools row, bottom tab row), Home rebuilt as lead block + rows, the placeholder pages, the sheet-/app- token split and the hand, at http://localhost:5173/"
method: impeccable-audit
total_score: 12
max_score: 20
verdict: Acceptable
p0_count: 1
p1_count: 2
p2_count: 5
p3_count: 4
detector_findings: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx"
target_fingerprint: "sha256:fdaa5a61d18a1729be039dfac11491a0dafc23a279970b915222ec9138dd3e3f"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.jsx
related_paths:
  - /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeList.jsx
  - /Users/mark/Documents/projects/sprinkles/app/src/ui/Placeholder.jsx
  - /Users/mark/Documents/projects/sprinkles/app/src/styles/shell.css
  - /Users/mark/Documents/projects/sprinkles/app/src/styles/home.css
  - /Users/mark/Documents/projects/sprinkles/app/src/styles/tokens.css
timestamp: 2026-09-22T01-19-43Z
slug: app-src-ui-shell-jsx
---

# Impeccable technical audit — Phase 03.4, the design layer in code

Method: single-thread audit in the running app (Vite dev server, main checkout at commit `dd9118d`), measured with the gsd-browser tools at 1920×1080 (pointer: coarse reported), iPad Mini (768×1024) and iPhone 15 (393×852) emulation, on `/`, `/notebook` and `/recipe/olive-oil-ice-cream-v1`. Every number below is a `getBoundingClientRect` / `getComputedStyle` read, never CSS-source reasoning. The file-based detector (`impeccable detect --json` over the eight changed files) returned `[]` — a null result on JSX per the project's standing rule, not a pass. Truth sources: DESIGN.md (2026-09-21 App palette, App marks, the Hand Rule), `.impeccable/surfaces/route.md` (§ 1 where the App world applies), `03.4-CONTEXT.md` D-01…D-20, and `sketch-findings-sprinkles` cross-cutting (zero horizontal overflow at 393, 44px targets below 760).

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|------:|-------------|
| 1 | Accessibility | 2 | On the phone the fifth tab (More) sits at x = 433.9 in a 393px viewport: Ingredients and Kitchen cannot be reached by touch. Landmarks, `aria-current`, heading count and contrast are otherwise sound. |
| 2 | Performance | 4 | No motion, no shadows, one self-hosted woff2 with `font-display: swap`, no console errors, no duplicate ids. |
| 3 | Responsive Design | 1 | The phone step's own navigation overflows (five tabs total 532px); the fixed bar measures 69px against a 56px clearance token; the tools row stays in the header at 393 while More repeats it. 768 is clean. |
| 4 | Theming | 2 | Token discipline is excellent and gated (`tokens.test.js`), but the App ground stops at Home: `body` paints `--sheet-ground` on every other route, and the placeholder pages carry no rules at all. |
| 5 | Implementation Integrity | 3 | Coherent, product-specific and token-true. Deductions: two brand marks on the recipe route, a secondary action with no behaviour of its own, a 70px "quiet" control, a stylesheet comment that describes a rule that does not exist. |
| **Total** | | **12/20** | **Acceptable — the desktop shell and Home hold; the phone step needs a real fix before anyone uses it on a phone.** |

## Implementation Integrity Verdict

**Pass, with conditions.** The shell and Home express one product-specific system: every visual value read from the page resolves to a token (`--app-*` for the App, `--sheet-*` for the Sheet, bare names for the shared scale); the destination grammar (icon in accent, word in companion, active place on the subtle surface, the 8px Notebook rail, hollow batch sprinkles with the count in words) matches DESIGN.md "App marks" line for line; `aria-current` comes from the router; the hidden navigation leaves the accessibility tree. The failures are at the edges of the world, not in its centre: the App world was applied to Home's own root but not to the shell that frames every route, and the phone tab row was drawn but never measured at 393.

## Findings, most severe first

### [P0] The bottom tab row overflows the phone; More and its contents are off-screen
- **Location:** `app/src/styles/shell.css` — `.shell__place` (padding `var(--gap-s) var(--gap-m)`, row layout) reused unchanged inside `.shell__tabs`; the `@media (max-width: 759.98px)` block.
- **Measured (iPhone 15, 393×852):** the five tab items measure 103.6 + 127.7 + 109.6 + 93.0 + 98.2 = **532px** wide in a 393px bar. Home 0–103.6, Notebook 103.6–231.3, Recipe book 231.3–340.9, Idea log 340.9–433.9 (clipped at 393), More **433.9–532** (entirely off-screen). With `details.open = true` the More list renders at x = 433.9 as well (Ingredients, Kitchen, Search at 68px each; Import, Export at 46px), and the fixed bar grows to **365px** tall (y 487–852), covering the page. Because the bar is `position: fixed`, `document.documentElement.scrollWidth` stays 393 — the overflow is invisible to the usual scroll-width check and the user simply cannot reach it.
- **Violates:** 03.4-CONTEXT D-16 ("five coloured tabs fixed at the bottom"; More holds Ingredients, Kitchen, Search, Import, Export); sketch-findings cross-cutting "zero horizontal overflow at 393px is the acceptance bar"; WCAG 1.4.10 Reflow and 2.4.7 (a focused off-screen link has no visible focus).
- **Impact:** on a phone, Ingredients and Kitchen are unreachable, and opening More (if reached by keyboard) covers 43% of the viewport.
- **Fix (brief):** give the tab row its own item rule instead of the rail's — `flex: 1 1 0; min-width: 0; flex-direction: column; gap: var(--gap-hair); padding: var(--gap-xs) 0; font-size: var(--app-size-label)` — so the icon sits over the word and five tabs share 393; pin the bar to `height: var(--app-size-tab-h)`; let More open as a panel anchored above the bar (not as flow inside it) so the bar never grows. Verify at 393 by measuring the five rects and the open panel.
- **Suggested command:** `/gsd-quick` (one task, `shell.css` only, plus a `shell.test.js` pin that the tab-row items do not read the rail's padding).

### [P1] The App ground stops at Home: the shell sits on paper on every other route
- **Location:** `app/src/styles/app.css:5-11` (`body { background: var(--sheet-ground) }`), `app/src/styles/home.css` (`body:has(.home) { background: var(--app-background) }`), `app/src/styles/shell.css` (`.shell` declares no background).
- **Measured:** `getComputedStyle(document.body).backgroundColor` is `rgb(255, 255, 255)` on `/` and **`rgb(247, 247, 244)`** on `/notebook`, `/recipe/olive-oil-ice-cream-v1` at 1920, 768 and 393. `.shell`, `.shell__head`, `.shell__rail` and `.shell__main` are all `rgba(0, 0, 0, 0)`, so the header, the five-sprinkle brand mark and the destination rail render on the Sheet's paper wherever Home is not the routed page.
- **Violates:** `.impeccable/surfaces/route.md` § 1 (paper stays inside three frames; "everything outside those frames — home, the shell and navigation … is this world"); DESIGN.md "The Context Boundary Rule" and the OWN-WORLD line "White ground, near-black ink"; 03.4-CONTEXT D-09 (the shell is App).
- **Fix (brief):** the shell paints its own ground — `.shell { background: var(--app-background); color: var(--app-text); }` — and the Sheet frame paints its own paper (`.recipe-page`, the batch log and the print route already own their geometry; add `background: var(--sheet-ground)` to `.recipe-page` and the not-found page). Then delete the `body:has(.home)` rule and its comment. Note for Mark: this touches one declaration on the Sheet's root, which 03.4-CONTEXT put out of scope — the alternative (keeping `body` white and letting the Sheet float) is the "objects on a page" look home.css already refuses, so the one line is the smaller change.
- **Suggested command:** `/gsd-quick-batch` together with the placeholder finding below (same two stylesheets).

### [P1] The placeholder pages have no rules: user-agent type on paper
- **Location:** `app/src/ui/Placeholder.jsx` renders `h1.place__title` and `p.place__note`; `app/src/styles/shell.css` declares no `.place__*` selector (the page's `[...styleSheets].cssRules` filtered on `.place` returns `[]`).
- **Measured (`/notebook`, 1920):** `h1` at the UA's **30px / 700 / margin 20.1px**, `p` at 15px (`--sheet-size-table-body`, inherited from `body`) in `--sheet-ink` on paper. Title top at y = 136 versus Home's title at y = 148: the two App pages do not even share a first baseline.
- **Violates:** the project convention "every visual value reads a token" (a UA default is a visual value); 03.4-CONTEXT D-10 (the place's name as its title — in the App's own voice); DESIGN.md "Don't impose the Sheet palette … on Home, navigation, Ingredients, Kitchen".
- **Fix (brief):** two rules under the `.place` root in `shell.css` — `.place__title` reads what `.home__title` reads (`--app-size-title`, 800, -0.02em, `margin: var(--gap-l) 0 var(--gap-hair)`), `.place__note` reads `--app-size-meta` in `--app-text-secondary` — and `shell.test.js` pins both against Home's title so the two pages cannot drift.
- **Suggested command:** `/gsd-quick-batch` (with the ground fix above).

### [P2] Two brand marks on the recipe route
- **Location:** `app/src/router.jsx` `RecipePageForRoute` still renders `.page-head > .running-head` ("Sprinkles", a link to `/`) inside `Shell`'s `<main>`, 34px below the shell header's own `.shell__brand` "Sprinkles".
- **Measured (1920):** `.shell__brand` 22px/700 at y = 14.5; `.running-head` 12px uppercase at y = 68–102 (h 34), same link target `/`. Two `header` landmarks in the tree (`HEADER, NAV#Places, MAIN, HEADER, NAV#Places`). At 393 the chrome above the recipe is 107 + 34 = **141px** before the H1.
- **Violates:** DESIGN.md "Navigation (incumbent implementation; app redesign pending)" — the running head was the way home when there was no shell; now Home is the rail's first place, so the second mark is redundant and the second `header` landmark is noise.
- **Fix (brief):** decide with Mark what the band above the Sheet says now (nothing; or the place the recipe lives in, "Notebook", in the App's label role, as recipe context per the Context Boundary Rule). Keep `.page-head` as the `.page-status` anchor either way — it is the only positioned ancestor the notice relies on (`shell.test.js` guards this).
- **Suggested command:** `/gsd-quick` after Mark picks the band's content.

### [P2] The filled action is 70px tall
- **Location:** `app/src/styles/home.css` `.home__action` — `min-height: var(--touch-min)` with `padding: var(--gap-s) var(--gap-m)` and a 1px border on the default `box-sizing: content-box`.
- **Measured:** every `.home__action` is **70 × 125.5** ("Next version") and 70 × 81.7 ("Adapt") at 1920 and 768; 70 × 170.5 each at 393. The row is 111px tall at desktop because the actions column (70) outgrows the text column (62).
- **Violates:** DESIGN.md OWN-WORLD "controls are plain, rounded, and quiet"; `--touch-min` is defined as a floor ("interactive targets grow toward 44px"), not a target; the 03.3.1 audit fixed exactly this class of bug on `.axis-mark__stop` (`box-sizing`).
- **Fix (brief):** `box-sizing: border-box` on `.home__action` (renders 44px at desktop and keeps the 44 floor everywhere), and let `home.test.js` pin it.
- **Suggested command:** `/gsd-quick`.

### [P2] "Adapt" goes where "Next version" goes
- **Location:** `app/src/ui/RecipeList.jsx` `RowActions`, `TASTED` branch: both links resolve to `latestPath`.
- **Measured:** `a.home__action[href="/recipe/olive-oil-ice-cream-v1"]` twice on the same row; nothing on the recipe page starts an adaptation (Adapt is D17 vocabulary with no implementation this milestone).
- **Violates:** PRODUCT.md principle 2 ("a proposal is not a change made" — a control is a promise) and 03.4-CONTEXT D-07's intent that the secondary action names a distinct continuation.
- **Fix (brief):** drop the secondary until Adapt exists, or make it open the pen in the mode its word names; the same check applies to "Continue developing" in the `AWAITING_TASTING` branch. Surface to Mark before coding — D-07 named the pair.
- **Suggested command:** `/gsd-quick` after the decision.

### [P2] The fixed bar under-clears its own token, and the tools row is doubled at 393
- **Location:** `app/src/styles/shell.css` phone block — `.shell__main { padding-bottom: var(--app-size-tab-h) }` (56px) while `.shell__tabs` has no height; `.shell__tools` is never hidden.
- **Measured (393):** `.shell__tabs` is **69px** tall (44 min-height + 12px padding × 2 + 1px rule), 13px more than the clearance; with More open, 365px. The header is **107px** tall because Search / Import / Export (44 × 110 each) wrap under the brand — and the same three appear again inside More, so they exist twice in the document.
- **Violates:** 03.4-CONTEXT D-16 (More holds Search, Import and Export on the phone; nothing says the tools row stays too); the token's own comment ("`.shell__main`'s bottom padding matches it so the fixed row never covers the end of a page").
- **Fix (brief):** part of the P0 brief above — pin the bar's height to the token and hide `.shell__tools` in the phone block (the file input must stay in the DOM: it is shared).
- **Suggested command:** fold into the P0 `/gsd-quick`.

### [P3] Heading levels on Home
- Each recipe row's name is an `h2` — a sibling of the `h2` "Recipes" it sits under (`H1, H2 lead, H2 Recipes, H2 row`). Make row names `h3`; the lead block's `h2` is right. `/gsd-quick`, one line in `RecipeList.jsx` and its test.

### [P3] Recipe-name links wear the Sheet's hairline underline; the comment says otherwise
- `.home__name a` and `.home__lead-name a` measure `text-decoration: underline`, 1px, offset 2px — the global `a` rule from `app.css` — under 24px and 28px bold headings. `home.css`'s header comment says the Home world "override[s] the global link underline"; no rule does. DESIGN.md leaves the App's link treatment open ("whether app blue is the shared link and focus colour"). Decide the link treatment with Mark, then either write the rule or fix the comment. `/impeccable` decides; `/gsd-quick` applies.

### [P3] The App's focus ring is a Sheet token
- `:focus-visible { outline: … var(--sheet-ink) }` in `app.css` is the only focus rule, so every rail place, tab and action in the App reads a `--sheet-` colour — the one thing D-02 says the App never does except for the hand's pen blue. DESIGN.md lists the shared focus colour as unresolved; this is a decision for Mark, not a defect yet. Programmatic `focus()` did not trip `:focus-visible` in this session, so the ring's rendered colour in the App was not measured.

### [P3] The hand has nothing to say in the seeded app
- `app/src/data/batch-2026-08-02.js:46` sets `nextTimeNote: null`, so D-18's one hand appearance (the lead block's Next time) renders on no route in the running app. An injected `p.home__lead-next-time.app-hand` confirmed the role works: Caveat `status: loaded` from `/fonts/caveat-regular.woff2`, **22px / 27.5px leading**, `rgb(31, 61, 122)` (`--sheet-pen-blue`), 400 normal, measure 643.5px (`--measure-prose`), and a Georgia fallback stack. The `forced-colors` and print fallbacks were not exercised here. Human UAT: record a Next time on the batch, return to Home, and look at it on the iPad too.

### Watch item (D-19), not a finding
The Notebook companion `#EE0803` measures **exactly 4.50:1** on white and reads as a pure red on the uppercase NOTEBOOK label above every recipe, beside an 8px red rail. DESIGN.md already flags it against the No-Verdict Rule; Mark confirms or falls back to `--app-text` once he has seen it in the real app.

## Patterns and systemic issues

- **The world was applied to a page, not to the frame.** `body:has(.home)` scopes the App ground to one route; the shell that carries the App on every route paints nothing. The same root cause leaves `Placeholder` in UA/Sheet defaults.
- **The rail's item rule was reused for the tab row without a measurement at 393.** The phone step's arithmetic (5 × (20 icon + 6 gap + word + 40 padding)) was never read from the DOM; the fixed bar hides the overflow from the usual scroll-width check.
- **Floors used as targets.** `--touch-min` on a content-box element with its own padding (`.home__action`) — the third time this box-sizing shape has appeared in an audit.

## Positive findings

- Token discipline is complete and now provable: `tokens.test.js` gates unresolved `var()` reads, dead tokens and prefix discipline; every colour, size and weight read from the page resolves to `--app-*`, `--sheet-*` or a shared bare token. The detector reports nothing.
- The destination grammar is exactly DESIGN.md's: icon in accent (`stroke: rgb(253, 91, 87)` for Notebook) with the word in the companion (`rgb(238, 8, 3)`); Kitchen's one token for both; the active place on `--app-surface-subtle` with `aria-current="page"` from the router; a 1px `--app-divider` hairline between the two groups; five sprinkles in navigation order, 18 × 6, `rotate(-8deg)`, under the wordmark.
- Every rail place is **224 × 44**; every tools-row item is 44 tall; no console errors; no duplicate ids; `main`, `header` and two labelled `nav`s (the hidden one leaves the tree).
- Every text companion clears AA on white (4.50–4.60:1 as specified; Kitchen 5.88:1); the filled action is white on `#1576DE` at 4.51:1.
- Home's own spacing lands on the shared scale as drawn: lead → section 32px (`--gap-l`), section → row 12px (`--gap-s`), title margin 32/2, 8 × 56 rail with 4px radius, hollow 22 × 10 tally with a 2px edge and the count in words.
- At 768 (rail visible, main 544px) Home and the recipe route both measure zero horizontal overflow; the row's name wraps to two lines rather than pushing the actions.
- Caveat is vendored with its OFL, declared once, and loads from the app's own origin; nothing is fetched from a network.

## Recommended actions

1. **[P0] `/gsd-quick`** — the phone tab row: own item rule (column layout, `flex: 1 1 0`, label size), bar height on `--app-size-tab-h`, More as a panel above the bar, tools row hidden below 760; verify the five rects and the open panel at 393.
2. **[P1] `/gsd-quick-batch`** — the shell paints `--app-background`, the Sheet frame paints its own `--sheet-ground`, `body:has(.home)` goes; `.place__title` / `.place__note` read Home's title and meta roles.
3. **[P2] `/gsd-quick`** — `box-sizing: border-box` on `.home__action`; row names to `h3`.
4. **[P2] Mark decides, then `/gsd-quick`** — the band above the Sheet on the recipe route (drop the running head or say the place); whether "Adapt" / "Continue developing" ship before they do anything.
5. **[P3] `/impeccable`** — settle the App's link and focus treatment (underline or not; app blue or ink), then fix `home.css`'s comment either way.
6. **Human UAT** — write a Next time on the batch and read the hand on Home at desktop and on the iPad; confirm the Notebook companion red against the No-Verdict Rule (D-19).
7. **[Final] `/impeccable polish`** — re-audit the shell at 393 and 768 after the fixes land.

Re-run `/impeccable audit` after fixes to see the score move.
