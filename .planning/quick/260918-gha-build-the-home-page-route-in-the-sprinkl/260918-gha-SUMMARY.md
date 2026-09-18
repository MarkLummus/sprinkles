---
phase: quick-260918-gha
plan: 01
subsystem: ui
tags: [react, css-custom-properties, vitest, design-tokens]

requires:
  - phase: quick-260918-a5l (Impeccable)
    provides: ".impeccable/surfaces/route.md and route.sketch.html — The Sprinkles Jar direction"
provides:
  - "app/src/ui/RecipeList.jsx rebuilt as The Sprinkles Jar home page (route:/)"
  - "app/src/ui/recipe-colour.js — recipeHueByRecipeId, the deterministic identity-colour deal"
  - "app/src/styles/home.css + home.test.js — the Jar world's stylesheet and its own token-discipline guard"
  - "tokens.css Jar block — --jar-*, --home-*, --recipe-hue-01..12, and the world's own geometry tokens"
affects: [home page, recipe list, future route briefs that inherit The Sprinkles Jar]

actuals:
  tokens: 10435
  tasks: 3
  commits: 6

tech-stack:
  added: []
  patterns:
    - "Identity colour dealt (never stored): recipeHueByRecipeId orders recipes by earliest createdAt, ties by recipeId, deals hue n % RECIPE_HUE_COUNT — append-only, no migration."
    - "Per-surface stylesheet with its own token-discipline test (home.test.js), since the shared binder/cross-cutting suites never read it — mirrors the existing history.css precedent."

key-files:
  created:
    - app/src/ui/recipe-colour.js
    - app/src/ui/recipe-colour.test.js
    - app/src/styles/home.css
    - app/src/styles/home.test.js
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/app.css
    - app/src/main.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipeList.test.jsx

key-decisions:
  - "The nav's one reachable item ('Recipes') renders as a non-link aria-current span, not an <a>, matching the app's existing 'in view is not a link to itself' convention (domain/lineage.js's versionIdentity, the history register) rather than the sketch's literal <a class=\"on\">."
  - "Each tally's accessible text count is the visible micro-label itself ('4 versions', '2 batches'), not a separate sr-only element — one line does both jobs, matching the app's existing 'Versions (n)' convention (260917-odu) more directly than the sketch's bare 'versions' caption."
  - "Row layout uses flex: N 1 0 (unitless basis) instead of the sketch's px flex-basis values, so no new geometry token was needed for that arithmetic and no bare px literal reached home.css."
  - "recipeHueByRecipeId lives in app/src/ui/ (not app/src/domain/), per the plan's own reasoning: a CSS custom property name is a presentation fact, not recipe mathematics."

patterns-established:
  - "A route-scoped stylesheet ships with its own *.test.js token-discipline guard when the shared contract suites (binder.test.js, cross-cutting.test.js) don't read it."

requirements-completed: [JAR-01, HUE-02, HOME-03, CONTRACT-04, GUARD-05]

coverage:
  - id: D1
    description: "recipeHueByRecipeId deals a stable identity colour per recipe — same hue across a recipe's own versions, no collision at or below RECIPE_HUE_COUNT, order-independent, append-only, null-createdAt-safe."
    requirement: "HUE-02"
    verification:
      - kind: unit
        ref: "app/src/ui/recipe-colour.test.js — all 8 assertions"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipeList.test.jsx — hue/tally assertions"
        status: pass
    human_judgment: false
  - id: D2
    description: "home.css carries no hex and no bare px; every rule is scoped under .home; the one @media condition is the named touch step-down; main.jsx imports it after app.css."
    requirement: "GUARD-05"
    verification:
      - kind: unit
        ref: "app/src/styles/home.test.js — all 5 assertions"
        status: pass
    human_judgment: false
  - id: D3
    description: "The paper frames' contract suites (binder.test.js, cross-cutting.test.js, columns.test.js) stay green; .list-page keeps its one gutter rule and its one renderer."
    requirement: "CONTRACT-04"
    verification:
      - kind: unit
        ref: "npm --prefix app test — 38 files, 1038 tests, all pass"
        status: pass
      - kind: other
        ref: "npm --prefix app run build"
        status: pass
    human_judgment: false
  - id: D4
    description: "The home page renders The Sprinkles Jar in a real browser: brand + sprinkle rule, active nav mark, title/guidance, per-row identity bar/name/version line/tallies/last words, Import as the filled action with Export beside it, and the responsive ladder at 393px/coarse pointer."
    verification: []
    human_judgment: true
    rationale: "No browser-automation tool was available to this executor (only Read/Write/Edit/Bash/Skill). The <human-check> in Task 3's <verify> block — comparing http://localhost:5173/ against route.sketch.html at desktop and at 393px/coarse pointer — was not run and is deferred to end-of-phase UAT."

duration: ~45min
completed: 2026-09-18
status: complete
---

# Phase quick-260918-gha Plan 01: The Sprinkles Jar home page Summary

**Rebuilt `route:/` as The Sprinkles Jar — a new tokens.css palette block, a framework-free `recipeHueByRecipeId` identity-colour dealer, and a scoped `home.css` stylesheet with its own token-discipline test, replacing the bare recipe list with per-recipe identity bars, version/batch tallies, and the last verdict in pen blue.**

## Performance

- **Duration:** ~45 min
- **Tasks:** 3 (all `type="auto"`, Tasks 2 and 3 `tdd="true"`)
- **Files modified:** 9 (5 created, 4 modified — matches the plan's `files_modified` list exactly, confirmed via `git status --short`)

## Accomplishments

- **Task 1 — tokens.css Jar block:** six fixed `--jar-*` hues, `--home-ground`/`--home-ink`/`--home-mute`/`--home-rule`, twelve `--recipe-hue-01..12` identity hues, and the world's own geometry/type tokens (brand, title, recipe-name, meta, micro-label sizes; sprinkle-rod and identity-bar dimensions; the filled action's radius; the nav-active and row rule weights; one transition duration). No existing token changed; the file still opens no at-rule.
- **Task 2 — `recipe-colour.js` (TDD):** `recipeHueByRecipeId(versions)` deals hues by earliest-`createdAt` order, `recipeId` string as the order-stable tiebreak, hue `n % RECIPE_HUE_COUNT` (12). Append-only — a later-arriving recipe never moves an earlier one's hue. Written RED (8 failing assertions against a nonexistent module), then GREEN.
- **Task 3 — the home surface (TDD):** `RecipeList.jsx` rebuilt inside a single `.home` root under the unchanged `.list-page` wrapper — header (brand + sprinkle rule, one-item nav), title, guidance, `RecipeRows`, then Import (filled) and Export (quiet text) with the existing hidden file input and import-errors list. `RecipeRows` now reads `batches` (defaulted to `[]`) alongside `versions`, computing each recipe's hue, version count, batch count (scoped to that recipe's own versions via `sortedBatches`), and the newest batch's own words. `app.css` lost the seven `.recipe-list*` rules this orphaned; `.list-page`'s rule and comment were kept and corrected. `home.css` is new, entirely scoped under `.home`, reading every visual value from tokens.css; `home.test.js` is its own token-discipline guard (binder.test.js/cross-cutting.test.js never read this file). `main.jsx` imports `home.css` after `app.css`. Seven new RecipeRows behaviours written RED (6 of 7 failed against the pre-rebuild markup), then GREEN; the five pre-existing assertions were kept unchanged and still pass.

## WCAG AA contrast checked (route.md § 3, § 5)

Every hue that carries text, measured against `--home-ground` (`#FFFFFF`):

| Token | Value | Used for | Ratio |
|---|---|---|---|
| `--home-mute` | `#5B6169` | meta line, micro-labels | **6.25:1** (darkened from the sketch's own `#6C737A`, which measured 4.80:1 — on the line) |
| `--pen-blue` (existing) | `#1F3D7A` | the last verdict | **10.47:1** |
| `--home-ink` | `#1A1C1F` | brand, title, recipe name | **17.07:1** |

`--jar-teal` (the nav-active underline) and every `--recipe-hue-*` (the identity bar and its tally marks) carry no text — route.md § 3 states no contrast floor applies to them, so none was checked.

## Task Commits

1. **Task 1: The jar and the recipe palette** — `0765da5` (feat)
2. **Task 2: A recipe's colour, dealt not stored** — `efeb341` (test, RED), `4f99d07` (feat, GREEN)
3. **Task 3: The home surface** — `6f88381` (test, RED), `4cec75b` (feat, GREEN)

## Files Created/Modified

- `app/src/styles/tokens.css` — The Sprinkles Jar token block appended to `:root`
- `app/src/ui/recipe-colour.js` — `recipeHueByRecipeId`, `RECIPE_HUE_COUNT`
- `app/src/ui/recipe-colour.test.js` — 8 behaviour assertions
- `app/src/styles/home.css` — the Jar world's stylesheet, scoped under `.home`
- `app/src/styles/home.test.js` — home.css's own token-discipline guard
- `app/src/main.jsx` — imports `home.css` after `app.css`
- `app/src/ui/RecipeList.jsx` — rebuilt inside `.home`; `RecipeRows` gained hue, tallies, last words
- `app/src/ui/RecipeList.test.jsx` — 7 new Jar-world behaviour assertions, 5 pre-existing kept unchanged
- `app/src/styles/app.css` — 7 orphaned `.recipe-list*` rules removed; `.list-page` rule and comment kept and corrected

## Decisions Made

See `key-decisions` in frontmatter: the nav's current item as a non-link `aria-current` span (app convention over the sketch's literal `<a>`); the tally's accessible count folded into the visible micro-label text rather than a separate sr-only element; unitless `flex: N 1 0` row layout to avoid a new geometry token; `recipe-colour.js` placed in `ui/` per the plan's own reasoning.

## Deviations from Plan

None — plan executed exactly as written. The Rule-1-shaped fix during implementation (the doc comment in `RecipeList.jsx` accidentally repeating the literal `className="list-page"` string and tripping `cross-cutting.test.js`'s "exactly one match" assertion) was caught and corrected before any commit; no plan deviation was needed.

## Issues Encountered

None beyond the self-caught comment collision above.

## User Setup Required

None — no external service configuration required.

## Verification output (last lines)

`npm --prefix app test`:
```
 Test Files  38 passed (38)
      Tests  1038 passed (1038)
   Start at  12:15:47
   Duration  666ms (transform 60%, import 21%, tests 17%, worker 2%)
```

`npm --prefix app run build`:
```
✓ 122 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.39 kB │ gzip:   0.26 kB
dist/assets/index-PaxVQBib.css   40.77 kB │ gzip:   7.39 kB
dist/assets/index-CFNLOPKc.js   412.54 kB │ gzip: 124.36 kB

✓ built in 72ms
```

## Known Stubs / Deferred Verification

- **Task 3's `<human-check>` was not run.** This executor has no browser-automation tool in its function set (only Read/Write/Edit/Bash/Skill/SubagentHandback — no `claude-in-chrome`/`gsd-browser` function was exposed). The comparison of `http://localhost:5173/` against `route.sketch.html` at desktop and at 393px/coarse pointer is deferred to end-of-phase UAT with Mark. Recorded in `.planning/WINDOWS.md` as an `unrun-verify` entry.
- Everything else in the plan's `<verify>` block (`npm --prefix app test`, `npm --prefix app run build`) ran and passed.

## Next Phase Readiness

- `route:/` is built in The Sprinkles Jar and ready for Mark's live-browser UAT.
- `--recipe-hue-*` currently covers 12 recipes before the deal repeats a hue — route.md § 5's open decision (palette size, assignment rule) is still open, named as such in both `tokens.css` and `recipe-colour.js`'s own comments.
- The highlighter for the batch log, and whether the book's running head takes the recipe colour, remain open per route.md § 5 and are out of this task's scope.

## Fix round 1 (coordinator live-browser review, 2026-09-18)

Mark reviewed `http://localhost:5173/` in a browser after the initial build and found two defects against `.impeccable/surfaces/route.md`, fixed in one atomic commit, `42f790a`:

1. **The home world did not own the viewport.** `app.css`'s `body` rule still painted the paper world's warmer `--ground` (cream) beneath `.list-page`'s own padding, so the page read as a white card floating on cream — exactly the "objects on a page" look route.md § 3 (OWN-WORLD) refuses. Fixed entirely from `home.css`, with no change to `app.css`'s `body` rule or `.list-page`'s pinned padding: `body:has(.home) { background: var(--home-ground); }`. `:has()` is supported in current Chromium, WebKit and Firefox.
2. **The page title and each recipe name were set in the book's own voice.** Both read `--face-text` (Georgia) — the text face route.md § 3 reserves for the paper frames and, outside them, for the record's own words. OWN-WORLD calls for one grotesk. `.home__title` and `.home__name` now read `--face-grotesk` (title weight 800, "heavy"; name weight 700, "bold" — both already had the tight `-0.02em` tracking). `--face-text` now survives on exactly one rule, `.home__words` (the batch's own words in pen blue), which is where the contract keeps it.

`home.test.js` gained three new assertions — the route-level ground rule exists and declares `--home-ground`; the title and name rules read `--face-grotesk`; `--face-text` survives on `.home__words` alone — and the existing "every rule is scoped under `.home`" check gained one documented exception for `body:has(.home)`, which has to key off `.home` from the `body` element itself to reach the viewport edge (no selector rooted at `.home` can do that).

**Verification after the fix:** `npm --prefix app test` → 38 files, 1041 tests, all pass (3 more than before the fix). `npm --prefix app run build` → succeeds. `git diff --stat` for the fix commit touches exactly the two files the coordinator named (`home.css`, `home.test.js`) — nothing else.

No `RecipeList.test.jsx` assertion pinned either face, so none needed updating.

## Self-Check: PASSED

All 9 files_modified files and the SUMMARY.md itself confirmed present on disk; all 6 commits (`0765da5`, `efeb341`, `4f99d07`, `6f88381`, `4cec75b`, `42f790a`) confirmed present in `git log`.

---
*Phase: quick-260918-gha*
*Completed: 2026-09-18*
