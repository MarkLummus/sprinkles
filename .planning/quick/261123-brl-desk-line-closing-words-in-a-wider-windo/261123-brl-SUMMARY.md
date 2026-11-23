---
phase: quick-261123-brl
plan: 01
subsystem: ui
tags: [react, phone, desk-line, sketch-016, board-gate]
requires:
  - phase: 12
    provides: the one-line page (DeskOnly), the recipe head's kept-work lines, the board engine and phone probe
provides:
  - "Below 724 every sentence that sends work elsewhere ends 'in a wider window'"
  - "The one-line page names kept work in the head's own sentences and reads, never writes, the kept draft"
  - "The Edit page's one link line '<recipe> · <version identity>' back to the version"
  - "The phase 12 gate holds these pages against the decided board desk-line-words.html"
affects: [phase 12 gate, sketch 016 CONTRACT section 12]
status: complete
actuals:
  tokens: 11300
  tasks: 3
  commits: 6
plan_head_before: df3395acf1deed08add3f7f52f7e6e774fc3e110
plan_head_after: 506d4d9019f37287fcdaba67ed5420773f53b9fb
key-files:
  modified:
    - app/src/ui/DeskOnly.jsx
    - app/src/ui/Placeholder.jsx
    - app/src/ui/VersionRow.jsx
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/ui/RecipePage.drafts.test.jsx
    - app/src/ui/RecipePage.edit.test.jsx
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs
key-decisions:
  - "The page says the head's own sentences (EDIT_KEPT_LINE, DRAFT_LINE_ENDING exported from VersionRow.jsx): one source for the words"
  - "The read starts inside Promise.resolve().then so a leaving editor's flushed draft write is called first"
requirements-completed: [decide-p12-desk-line-closing-words, PHONE-01]
---

# Quick 261123-brl: Desk line closing words in a wider window Summary

The one-line page and the recipe head's two lines now end "in a wider window". The one-line page says what is kept, and the Edit page names its recipe with a link back. All of it below 724 only; the full suite and the phase 12 gate (GATE2) pass.

Authority: sketch 016 CONTRACT section 12 ("The one-line page", approved), `desk-line-words.html`, README decisions 23 to 27, and Mark's answer B on decide-p12-desk-line-closing-words (2026-11-23).

## Words, before and after, by file

| File | Before | After |
|------|--------|-------|
| `app/src/ui/VersionRow.jsx` EDIT_KEPT_LINE | Edit kept. Finish it at the desk or on the iPad. | Edit kept. Finish it in a wider window. |
| `app/src/ui/VersionRow.jsx` DRAFT_LINE_ENDING | . Finish it at the desk or on the iPad. | . Finish it in a wider window. |
| `app/src/ui/DeskOnly.jsx` note | Done at the desk or on the iPad. | Done in a wider window. (plus "Edit kept. ..." and "Draft: <name>. ..." when work is kept) |

No line under `app/src` quotes the old phrase any more. The tests that quoted it (VersionRow.test.jsx Tests O, P, P2, R and the P3 guard, RecipePage.drafts.test.jsx, RecipePage.edit.test.jsx, CreationFlow.test.jsx) now hold the new words.

## What was built

- `DeskOnly.jsx`: below 724 it returns a private `DeskPage`. `useParams` tells the two jobs apart (a `versionId` means Edit). The reads are the ones the routes already make:
  - New recipe: `repository.listDrafts()`, `draftMatchesCreate`, `newestDraft`, named with `creationTitle(record.payload.name)` (the Notebook draft row's own rule).
  - Edit: `getVersion`, `getRecipe`, `listVersions`, `getDraft` in one `Promise.all`. That is `EditRoute`'s read minus `getAllBatches`, which feeds only a refusal this page does not show. It uses `EditRoute`'s own not-found test, `draftMatchesEdit` for "kept", and `sortedVersions(versionsForRecipe(...))` with `versionIdentity`, the identity the head prints. The link goes to `notebookPath(recipeId, versionId)`.
  - The read starts in `Promise.resolve().then(...)` inside a `useEffect` with a cancelled flag, as `CreationRoute` does. A leaving editor flushes its waiting draft the same way, so the flush is called first and the page names what was typed (D9, and the crossing check below).
  - It never calls `saveDraft` or `deleteDraft`. Every name is a React text child. The one link carries a literal `tabIndex={0}`.
- `Placeholder.jsx`: renders `children` between the title and the note, and omits the note when `note` is `null`. Every other caller is unchanged.
- `shell.css`: `.place__for` and `.place__for a`, copied declaration for declaration from the snapshot (tokens only).
- `router.jsx`, `RecipeList.jsx`, `CreationRoute.jsx`, `EditRoute.jsx` and `app/src/store` are untouched (`git diff` against the base is empty for them).

## Red then green, and counts

- Task 1 red `68a52a08`: 10 tests failed on the old words (Tests O, P, P2, R, the two RecipePage tests, the four PHONE-01 CreationFlow tests); P3 passed as a bound. Green `49e73378`: 306 tests in the four files pass.
- Task 2 red `5d8bf518`: D2, D3, D5, D6, D8, D9 failed; D1, D4, D7 passed as bounds. Green `e865f298`: all nine pass.
- Suite before: 137 files, 4591 tests. After: 137 files, 4596 tests (four old PHONE-01 cases became D1 to D9: +5).

## Deviations from Plan

**1. [Rule 3 - Blocking] `app/src/styles/shell.test.js` allow-list**
- Found during: Task 2 green.
- Issue: the style suite lists every selector allowed to declare a `border-radius`. The snapshot's `.place__for a` declares one, so the suite failed.
- Fix: added `.place__for a` to the sorted list and a check that it uses `var(--app-radius-control)` (so its focus ring follows the control radius, as the list's other links do). The test name gained "the Edit page's link back". No CSS value changed.
- Files: `app/src/styles/shell.test.js`. Commit `e865f298`.

**2. Gate files: why the gate changes went past "the expected words only"** (planned in Task 3, listed here because they are gate edits)
- `12-board-places.mjs`: held the one-line page against the superseded board `one-line-page.html` (panels `desk-new`, `desk-edit`), whose words and Edit page are not the decided ones. The spec now targets `desk-line-words.html`: `dl-new`, `dl-new-kept` (393, with the 723 overflow check), and `dl-edit`, `dl-edit-kept` (393), `dl-edit-723`, `dl-edit-kept-723` (723). Same check kinds as before (count, box, text, font), plus `p.place__for` (count, box) and `p.place__for a` (count, text, font, box, color) on Edit, and the `absent` lists (New recipe: no link line, button, a or textarea; Edit: no button or textarea). `WIN` takes a width. The old `desk-edit` panel is gone with its comment: its address named no stored version, which the decided board does not draw. The Edit panels' steps make Coffee at 1366 through the built editor, keep an edit where drawn, and visit the version's page once (the visited-link lesson) before the Edit address.
- `12-board-band.mjs`: `band-editing` and `band-draft` read their words from `recipe-head-below-724.html`, which draws the old words. They moved to a second spec on `desk-line-words.html` as `dl-head-edit` and `dl-head-draft`, with the same flags (`line: true`, `buttonsAbsent: true`). The first five panels are unchanged. `clickUntil`, `visit`, `makeCoffee`, `KEEP_MS` and `DESK` gained `export` (no other change) so the places spec reuses them. The default export is now an array of two specs.
- `12-phone-probe.mjs`: the old `LINE` constant and its "no control in the page" check no longer describe the Edit page (it holds a link). Each address now expects its own words (`Draft: Chocolate. Finish it in a wider window.`, `Edit kept. Finish it in a wider window.`), `/notebook/new` still holds no control, and the Edit address holds exactly one `a` inside `p.place__for` with text `Vanilla · Version 1` and href the version's own address. It waits for `p.place__note` so the settled page is read. The drafts-dump identity check is unchanged and is still the proof that the page writes nothing.

Nothing else in the gate changed and no check was loosened.

## Side by side, board against app

A scratch script (outside the repo, under `$TMPDIR/sprinkles-brl`) walked the six drawn states in one context per width, in WebKit and in Chrome (headless, `/Applications/Google Chrome.app`, coarse pointer via `hasTouch`). It read h1.place__title, p.place__for a and p.place__note: x and y from `.shell__main`'s top-left, width, height, line count and text, against the snapshot's own panel. Every element matched within 1 px, same line count, same text, no scrollWidth above innerWidth.

| State (board panel) | Width | Element | WebKit: x,y w x h | Chrome: x,y w x h |
|---|---|---|---|---|
| New recipe, nothing kept (dl-new) | 393 | title | 20,52 353x40 | 20,52 353x41 |
| | | note | 20,106 353x17 | 20,107 353x16 |
| New recipe, Coffee started (dl-new-kept) | 393 | title | 20,52 353x40 | 20,52 353x41 |
| | | note | 20,106 353x17 | 20,107 353x16 |
| Edit, nothing kept (dl-edit) | 393 | title | 20,52 353x40 | 20,52 353x41 |
| | | link | 20,94 113.05x44 | 20,95 110.52x44 |
| | | note | 20,152 353x17 | 20,153 353x16 |
| Edit, edit kept (dl-edit-kept) | 393 | title / link / note | as dl-edit | as dl-edit |
| Edit, nothing kept (dl-edit-723) | 723 | title | 20,52 683x40 | 20,52 683x41 |
| | | link | 20,94 113.05x44 | 20,95 110.52x44 |
| | | note | 20,152 563.41x17 | 20,153 505.95x16 |
| Edit, edit kept (dl-edit-kept-723) | 723 | title / link / note | as dl-edit-723 | as dl-edit-723 |

In every row the board's number was identical to the app's. New recipe at 723 has no drawn panel; the app measured 20,52 683x40 and a one-line note in both engines, with no overflow (scrollWidth 723). The link is 44 high in every state.

Board engine runs (`12-board-check.mjs 12-board-places.mjs 12-board-band.mjs --selftest`), each over the whole two files:

| Engine | Result | Evidence folder |
|---|---|---|
| Playwright WebKit | 475 PASS, 0 FAIL | `$TMPDIR/sprinkles-brl/evidence-webkit` |
| Chrome through a shim (`chrome-shim.mjs` exports `webkit` as chromium with the Chrome executable) | 475 PASS, 0 FAIL | `$TMPDIR/sprinkles-brl/evidence-chrome` |

PASS counts per decided-board panel, the same in both engines (checks only, selftest lines apart): dl-new 16, dl-new-kept 16, dl-edit 20, dl-edit-kept 20, dl-edit-723 20, dl-edit-kept-723 20, dl-head-edit 15, dl-head-draft 15. (`$TMPDIR` is `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/`.) The shim ran every panel in Chrome; no fallback was needed.

`12-phone-probe.mjs page` in WebKit: all checks PASS (the two 393 pages, the editor at 724 and 1366, both crossings, no overflow at 393 and 723).

## The crossing check

At 1366, open `/notebook/new` on a kept creation, type a new Recipe name, narrow to 393 inside 250 ms, read the note. WebKit: narrowed 21 ms after typing, note `Draft: Mint15788. Finish it in a wider window.`, names the typed name. Chrome: narrowed 18 ms after typing, note `Draft: Mint15847. Finish it in a wider window.`, names the typed name. Both PASS. CreationFlow D9 pins the same over the repository stand-in.

## Gate

`sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh` ends `GATE2 PASS` (run once, in the background, on HEAD `506d4d90`): suite 137 files and 4596 tests, build, stops, print, round trip, PDF, Simulator, Phase 11 walk (GATE1 PASS), board 3388 PASS and 0 FAIL, phone, band, tabs, keys. No step failed.

Gate files changed: `12-phone-probe.mjs`, `12-board-places.mjs`, `12-board-band.mjs` (reasons above). `12-check.sh` itself is unchanged.

## Undrawn states and what the build does in each

The snapshot and CONTRACT section 12 agreed on every drawn state, so no point was stopped. For the states the snapshot does not draw, the build reuses a built precedent (none is a new design):

- While the read is out: the title alone, no note (the Notebook place's rule).
- A read that fails: "Done in a wider window." and no link line.
- An Edit address naming no stored version, a version of another recipe, or no recipe: "Done in a wider window." and no link line (D7). A kept edit under that address is not named.
- A create draft with a blank name: "Draft: Untitled. Finish it in a wider window." (D3, `creationTitle`'s word, the one the Notebook's draft row shows).
- An Edit address whose version holds a pen draft, or can no longer be edited, with no edit kept: "Done in a wider window." with the link line (below 724 the page shows there today; from 724 up `EditRoute` replaces the address).
- A create draft whose name carries markup stays text (D3).
- Only an edit kept on the New recipe address: "Done in a wider window." (D4).

## Known Stubs

None.

## Threat Flags

None. The page reads drafts, recipes and versions through existing repository reads, adds no endpoint, and writes nothing. Mitigations T-brl-01 to T-brl-04 are covered by D3, D5 to D7, and the crossing checks.

Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad or iPhone

## For the orchestrator

- I have no ArtifactData. Close the row `decide-p12-desk-line-closing-words` (Mark answered B, 2026-11-23): the build matches the decided board. Home's sentence (`decide-p12-home-row-sentence`) is untouched, and Home, the picker and the pen's target chip were not touched.
- Decide whether the undrawn states above need a row. I built each from a precedent and recommend none. If Mark wants any drawn, the ones with a visible difference are the failed read and the pen-draft Edit address.
- A device check is optional: Mark could open `/notebook/new` and an Edit address on the iPad at the phone width. Everything above is device-unverified.
- A dist built from this commit is safe to deploy: the suite and GATE2 pass. It adds no store write and no export-before-Save requirement.
- Gate evidence and scratch scripts are under `$TMPDIR/sprinkles-brl` (not in the repo, not committed). I did not touch `STATE.md`, `ROADMAP.md`, `.planning/state.json` or anything under `.planning/sketches`.
- The `commits: 6` above counts the five commits before this summary plus the summary commit itself; `plan_head_after` is the head before the summary commit.

## Commits

- `68a52a08` test: the desk sentences end in a wider window
- `49e73378` feat: the desk sentences end in a wider window
- `5d8bf518` test: the one-line page says what is kept and names the recipe it would edit
- `e865f298` feat: the one-line page says what is kept and names the recipe it would edit
- `506d4d90` chore: the phase 12 gate holds the one-line page and the head lines against the decided desk line board
- this summary, committed last

## Self-Check: PASSED

All five code and test commits above exist on this branch, every changed file listed in the frontmatter is present, and the tree was clean before this file was added.
