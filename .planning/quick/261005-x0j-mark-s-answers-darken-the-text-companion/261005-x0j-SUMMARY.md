---
phase: quick-261005-x0j
plan: 01
quick_id: 261005-x0j
subsystem: ui
tags: [contrast, wcag, filled-action, font-weight, dead-css]
requires: []
provides:
  - "Five --app-*-text-on-subtle tokens, each clearing 4.5:1 on --app-surface-subtle, read by five .shell__place--{slug}[aria-current='page'] rules"
  - "The pen's filled Save is weight 600, pinned equal to .notebook-action and .home__action"
  - "The unused read-only prose class (prose-text) is gone from every stylesheet, with a guard against its return"
affects: [app/src/styles/tokens.css, app/src/styles/shell.css, app/src/styles/notebook.css, app/src/styles/app.css]
tech-stack:
  added: []
  patterns: ["WCAG ratio and the smallest whole-percent scale computed in the test", "probe reads computed colour and weight on the built app in WebKit and Chromium"]
key-files:
  created:
    - .planning/quick/261005-x0j-mark-s-answers-darken-the-text-companion/261005-x0j-probe.mjs
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/tokens.test.js
    - app/src/styles/shell.css
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
key-decisions:
  - "D-01 (Mark 2026-10-06, decide-companions-on-subtle-surface): darken the companions further on the subtle surface only"
  - "D-02 (Mark 2026-10-06, decide-pen-save-weight): the pen's filled Save is 600"
  - "D-03 (Mark 2026-10-06, decide-retire-prose-text-rules): retire the unused read-only prose rules"
requirements-completed: [UX1-01]
metrics:
  duration: "about 15 minutes"
  completed: 2026-10-05
status: complete
commits: 3
plan_head_before: 519200b
plan_head_after: 2fb72394ea08299bfd61759dd82e5bdcf0ead344
actuals:
  tokens: 7000
  tasks: 3
  commits: 3
---

# Phase quick-261005-x0j Plan 01: Mark's answers Summary

The five text companions clear 4.5:1 where their word sits on the grey current-place surface, the pen's Save is weight 600 like the other filled actions, and the dead read-only prose rules are removed with a guard so they stay gone.

## Commits

| Task | Commit | Paths |
| ---- | ------ | ----- |
| 1 companions on subtle | 8897591 | app/src/styles/tokens.css, app/src/styles/tokens.test.js, app/src/styles/shell.css, .planning/quick/261005-x0j-mark-s-answers-darken-the-text-companion/261005-x0j-probe.mjs |
| 2 pen Save weight | 4f9eca2 | app/src/styles/notebook.css, app/src/styles/notebook.test.js, the probe (extended) |
| 3 retire prose rules | 2fb7239 | app/src/styles/app.css, app/src/styles/notebook.css, app/src/styles/cross-cutting.test.js |

Nothing pushed. All three on `main`, as the orchestrator instructed. `git rev-list --count 519200b..HEAD` is 3. The staged todo rename was left staged and in none of the commits.

## Task 1: companions on the current place's surface (D-01)

Mechanism: five new tokens in tokens.css, each the plain companion with every channel scaled by one factor (the smallest whole percent that clears 4.5:1 on `--app-surface-subtle` #f3f4f2), plus five one-declaration rules in shell.css, `.shell__place--{slug}[aria-current='page'] { color: var(--app-{x}-text-on-subtle) }`. The plain tokens and the plain `.shell__place--{slug}` rules are byte-identical, so nothing changes on the white app background. Rejected: re-declaring the plain token names under `[aria-current]` (shadows a token by name, hides the pairing from the tokens gates), and a `colour-mix()` read (the engine does the rounding and a text test cannot pin it). A uniform per-channel hex step was also not used: the Notebook red would need twelve steps and its green and blue channels would clamp at 0 after two, changing the hue.

| Place | Plain token | Plain on white | Plain on subtle | New token value | k | New on subtle | New on white |
| ----- | ----------- | -------------- | --------------- | --------------- | - | ------------- | ------------ |
| Home | --app-blue-text #1475dd | 4.547 | 4.121 | --app-blue-text-on-subtle #136ed0 | 6 | 4.566 | 5.037 |
| Notebook | --app-notebook-text #ed0702 | 4.534 | 4.109 | --app-notebook-text-on-subtle #df0702 | 6 | 4.566 | 5.037 |
| Recipe book | --app-recipe-book-text #bc5b0d | 4.525 | 4.102 | --app-recipe-book-text-on-subtle #b1560c | 6 | 4.525 | 4.993 |
| Idea log | --app-idea-log-text #976f01 | 4.575 | 4.147 | --app-idea-log-text-on-subtle #8f6901 | 5 | 4.544 | 5.013 |
| Ingredients | --app-ingredients-text #358452 | 4.591 | 4.161 | --app-ingredients-text-on-subtle #327d4e | 5 | 4.554 | 5.025 |

The planner quoted 4.526 for recipe-book; the test and the browser both compute 4.525. The value is the same, #b1560c. Kitchen's indigo #505db5 reads 5.325 on subtle and is untouched. All five pairings are real: every place word is a NavLink carrying `.shell__place--{slug}`, NavLink sets `aria-current='page'` on its own route, and the one rule `.shell__place[aria-current='page']` paints subtle under it, in the rail, the tab row and More. None was skipped.

Red: `npm --prefix app test -- src/styles/tokens.test.js` failed exactly eleven tests (five word rows, five token rows, the read-once test); Kitchen's row, the plain-tokens guard and every existing test passed. Failure messages for the word rows: home `--app-blue-text #1475dd on #f3f4f2: 4.121:1`, notebook `#ed0702` 4.109, recipe-book `#bc5b0d` 4.102, idea-log `#976f01` 4.147, ingredients `#358452` 4.161.

Green: tokens.test.js and shell.test.js 94 of 94 pass, full suite passes, build exits 0.

Probe (WebKit and Chromium, built app, fine pointer; 1600 = rail, 393 = tab row, Ingredients in More). Before (pre-change build, exit 1, twenty FAIL lines, scope check passed): every case read the plain colour on subtle at 4.121 (Home, rgb(20, 117, 221)), 4.109 (Notebook, rgb(237, 7, 2)), 4.102 (Recipe book, rgb(188, 91, 13)), 4.147 (Idea log, rgb(151, 111, 1)), 4.161 (Ingredients, rgb(53, 132, 82)), identically in both engines at both widths. After (exit 0, 22 checks passed), identical in both engines at both widths:

| Place | Computed colour | On rgb(243, 244, 242) |
| ----- | --------------- | --------------------- |
| Home | rgb(19, 110, 208) | 4.566:1 |
| Notebook | rgb(223, 7, 2) | 4.566:1 |
| Recipe book | rgb(177, 86, 12) | 4.525:1 |
| Idea log | rgb(143, 105, 1) | 4.544:1 |
| Ingredients | rgb(50, 125, 78) | 4.554:1 |

Scope check at 1600 on `/`, both engines, before and after: the non-current Notebook, Recipe book, Idea log and Ingredients still read their plain companions (rgb(237, 7, 2), rgb(188, 91, 13), rgb(151, 111, 1), rgb(53, 132, 82)).

## Task 2: the pen's filled Save at weight 600 (D-02)

One declaration, `font-weight: 600`, in `.notebook-log .save-ceremony button:last-of-type`, with a one-line comment. Nothing else in notebook.css moved.

Red: `npm --prefix app test -- src/styles/notebook.test.js` failed exactly two tests, both `.notebook-log .save-ceremony button:last-of-type declares font-weight: expected undefined to be defined`. Green: 80 of 80, full suite passes, build exits 0.

Probe, computed font-weight of the pen's Save:

| Engine | 1600 | 1366 | 393 |
| ------ | ---- | ---- | --- |
| WebKit before | 400 | 400 | 400 |
| WebKit after | 600 | 600 | 600 |
| Chromium before | 400 | 400 | 400 |
| Chromium after | 600 | 600 | 600 |

Before: exit 1 with exactly the six pen FAIL lines and every Task 1 case passing. After: exit 0, 28 checks passed. INFO lines at 1366, same in both engines before and after: Home's filled action 600, the Notebook's filled action 600, the pen's outline Cancel 400.

## Task 3: retire the unused read-only prose rules (D-03)

Grep over app/src, app/index.html and app/src/main.jsx before deleting: `prose-text` appeared in app.css (three places: the rule, a comment, the `.batch-row__conclusion` selector), notebook.css (one), cross-cutting.test.js, BatchRow.test.jsx and VersionRow.test.jsx (the last two assert it is absent from markup). No .jsx or .js outside a test names it or builds a class name from pieces; the only dynamic className expressions are the literal `prose-field` and `prose-field--empty` conditionals. Suite was green before the change.

Removed: (1) the `.prose-text` rule in app.css with its comment; (2) the `.batch-row__conclusion .prose-text` selector, which narrowed the shared margin rule to `.tasting-reading__problems { margin: var(--gap-s) 0 0 }`; (3) the `.notebook-log .prose-text` rule in notebook.css. The comment above `.tasting-reading__note` was reworded so no stylesheet names the class. Tests in cross-cutting.test.js: the one pinning the retired rule's line-height and absent font-size was removed whole; 'entered prose carries no italic of its own' was cut to its two `.prose-field` assertions and retitled; two new tests were added (no stylesheet or non-test ui source names the class; the shared margin rule still serves `.tasting-reading__problems`). BatchRow.test.jsx and VersionRow.test.jsx are unchanged.

Red: exactly one test failed, `files that still name prose-text: expected [ 'app.css: 3', 'notebook.css: 1' ] to deeply equal []`. Green: cross-cutting.test.js 88 of 88; full suite 63 files, 1909 tests pass; build exits 0. No other test pinned the removed rules or counted a reader of the properties they carried, so none was adjusted. No probe was run: no element carried the class, so no rendered value changes.

## Deviations from Plan

None. The plan executed as written. The only difference from the plan's own numbers is Recipe book's 4.525 against the planner's 4.526, noted above.

## Observed, not changed

- The pen's outline Cancel (`.notebook-log .save-ceremony button:first-of-type`) declares no weight and computes 400 in both engines, while the Home and Notebook filled actions read 600. D-02 named only Save; whether Cancel should change is for Mark.
- tokens.css now has five tokens DESIGN.md does not name, the pen's Save weight and the retired class are out of date in DESIGN.md until Sid updates it. Not touched here, as the plan prohibits.
- BatchRow.test.jsx still mentions `prose-text` in a comment and in a `not.toContain` absence pin; both are intended and the guard does not scan test files.

## Not verified

Mark's own iPad and iPhone (WebKit on a touch screen), and Mark's desktop Safari and Chrome. The probe is two engines at a fine pointer, at 1600, 1366 and 393.

## Deferred Human Verification

On the build served by `npm --prefix app run build && npm --prefix app run preview -- --host` (never the dev server): click through the five places and look at each current place's word on its grey surface, in the rail and in the tab row; open the pen and look at Save beside Home's filled action. Rows for the orchestrator to close: `decide-companions-on-subtle-surface`, `decide-pen-save-weight`, `decide-retire-prose-text-rules`. No Mark's List row was filed or closed here.

## Known Stubs

None.

## Threat Flags

None. No endpoint, auth path, file access or schema change; the probe uses only the harness's 127.0.0.1 servers.

## Self-Check: PASSED

- Commits 8897591, 4f9eca2 and 2fb7239 are on `main`, each listing exactly its own paths.
- The probe file exists at .planning/quick/261005-x0j-mark-s-answers-darken-the-text-companion/261005-x0j-probe.mjs.
- `git diff 519200b..HEAD --name-only -- app/` lists exactly the seven app files in the plan (tokens.css, tokens.test.js, shell.css, notebook.css, notebook.test.js, app.css, cross-cutting.test.js).
- STATE.md, DESIGN.md, .impeccable/** untouched; the staged todo rename is still staged.
