# Phase 4: Prepare the next version for making - Research

**Researched:** 2026-10-06 (session date; Mark's option C answer is dated 2026-10-07 in the request)
**Domain:** Print route and WebKit/Chrome pagination, derived short code, IndexedDB draft persistence, shared control components, screen-reader close-out
**Confidence:** HIGH on in-repo facts and on the WebKit print behaviours (measured this session); MEDIUM on iPad-specific behaviour (macOS WebKit stands in; iPad proof is Mark's PDF)

## User Constraints (from CONTEXT.md)

<user_constraints>

### Locked Decisions

Copied verbatim from `04-CONTEXT.md` `## Decisions` (lines 16-70). One addition below them is Mark's 2026-10-07 answer from the planning question, which is not yet in CONTEXT.md.

- **D-00 (Mark, 2026-09-23, overrides the canvas drawings below):** The design canvas is initialised from the **current state of the built app**, never drawn fresh from a brief. The "Print formats" page now opens with two artboards captured from the production build (real markup, the app's own stylesheet): `AsBuiltRecipePage.dc.html` (the recipe page at 1280) and `PrintStartingPoint.dc.html` (the same sheet alone at letter width, no print design; the app has none beyond hiding the save notice and the hand's fallback). Mark designs the print by changing that starting point in Design; **the difference between the capture and his edits is Phase 4's print work**, and whatever he leaves unchanged is what the app already does, so judging the build against the canvas cannot flag correct existing code as a failure. The pages drawn 2026-09-22/23 from the brief's prose moved to the canvas page "Superseded print drafts" and are not a target.
- **D-00 amended (2026-10-06):** The print starting point (`PrintStartingPoint.dc.html`) was captured before Phase 03.7 moved Before you start above the Ingredients table, so it is captured again from the built Sheet before the bench sheet is drawn.
- **D-00a:** Example of the drift D-00 names: the canvas pages carried a "Formula" heading that exists nowhere in the built app. The app itself is not changed.
- **Canvas:** the bench sheet is drawn on the "Print formats" page of Mark's Sprinkles canvas, https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq (five letter pages plus the route at 1280 and 390). Awaiting Mark's approval, then the D-02 snapshot.
- **D-01:** The bench sheet is drawn on a **Claude Design canvas** (Artifact type "Design"), not by `/gsd-sketch`. It is drawn and approved by Mark **before** `/gsd-plan-phase 4`.
- **D-02:** Once Mark has shaped the print starting point and approved it, the canvas's HTML is **snapshotted into the repo as `.planning/sketches/010-bench-sheet/`**, together with the as-built capture it started from so the delta is explicit, and that snapshot is the acceptance target, read as a structural contract (elements, placement, states, text, CSS), as with sketches 007/008. Planner, checker, executors and UAT read the snapshot, never a prose paraphrase of it. — **Reversibility:** costly — every plan's acceptance criteria cite it.
- **D-03:** The canvas takes its values from Mark's **"Sprinkles Design System"** artifact (https://claude.ai/artifact/M7LkrAkNQYA897PpKnjjzU). Before drawing, check it against `app/src/styles/tokens.css` and `DESIGN.md` (the 2026-09-21 approvals: Sheet/App contexts, `sheet-*`/`app-*` prefixes, the hand in Caveat) and flag any drift to Mark. The build still reads every value through `tokens.css`; the design system does not become a second token source.
- **D-04:** The on-screen sheet route at phone width (393) is **decided by the canvas**: the Claude Design drawing must include a 393 view, and the build follows it.
- **D-22:** Printing has **two formats** because their uses differ: the **Notebook format** (the bench sheet, for developing a recipe: ingredient lines per portion with tick boxes, as-made column and % of batch, the full method, the two-sided batch log) and the **Recipe book format** (one page, for making a finished recipe: whole amounts, lean method with targets, and **no batch or tasting log**, Mark 2026-09-23). **Phase 4 builds the Notebook format only.** The Recipe book format is designed now on the canvas ("Print formats" page, `RecipeBookSheet.dc.html`) and built in a later phase. The sheet route must leave room for a second format without building a switcher (the brief's § 7 "modes" rule stands).
- **D-22a:** Open for the later phase, not decided here: whether one version's two formats share one sheet code. D-08 derives the code from "printed content"; for two formats to match back to the same version, the derivation should read the version's recipe content, not the format's layout. Planning for Phase 4 should derive from content that both formats share, so the rule does not need to change later.
- **D-05:** The version row's print control reads **"Print sheet"** (D17 "Sheet"; closes `route-recipe.md` § 7's open item).
- **D-06:** "Before you start" prints **once**, at the head of the method; it does not repeat when the method breaks onto a second sheet.
- **D-06 amended (sketch 011 decision 36, Mark 2026-10-04: placement B and print PC):** Before you start is its own Sheet section above the Ingredients on screen, and in print it opens the formula page above the ingredients table, printing **once**; "at the head of the method" no longer holds. D-06's sentence above stays as Mark's record of 2026-09-22.
- **D-06a (sketch 011 decision 45, Mark 2026-10-05):** When the ingredients table does not fit the page, it breaks **between step groups only**; a one-step table splits between rows; the header row repeats alone, with no "Ingredients, continued"; the Total goes with the last group and never repeats; the steps print whole. Built in Phase 03.7 for the Sheet's own table (one `tbody` per step group and the print rules in `app.css`; plan 03.7-02), so Phase 4's print route inherits it by reusing the table. Plan 03.7-02 measured the Total's edge case (P5, the Total straddling the page foot) and settled it: `tfoot` keeps `break-before: avoid`, which works in Chrome. Not yet verified in Safari's print (Mark's List row `before-you-start-safari-print`). Open for Phase 4: "the steps print whole" holds for the Sheet as the board lays it, not yet for the whole live route. There Chrome splits Instructions step 1 across pages although `.method-step` computes `break-inside: avoid`, because the route's print grid (`.recipe-page`) defeats the rule (found in plan 03.7-03); Phase 4's print route owns that grid and must make the steps whole.
- **D-06b (sketch 011 decision 45 answer 1, K1, Mark 2026-10-05; where it is built, Mark 2026-10-06):** After the table's tail the Instructions follow on the same page; when the table fits, the Instructions open their own page. Phase 03.7 adds no forced break. Mark answered where this is built on Mark's List (row `decide-bys-instructions-own-page`, 2026-10-06): **Phase 4**, as recommended. It is built with the fixed letter page (D-07) and pages laid by measurement (decision 45's brief items 4 and 5).
- **D-07:** **Letter portrait only.** No A4, no size choice.
- **D-07a (amends the brief's § 3 sequence, Mark 2026-09-23 on the canvas):** The **batch log prints first**, as pages 1 and 2, then the formula page, then the method. The log's two sides then always land on one sheet, front and back, however many pages the formula and method run to; a fixed blank page would break whenever the page count before the log changed parity, and browsers do not reliably honour right-hand-page print rules. The log sheet can also be pulled off the front of the stack and taken to the machine. — **Reversibility:** reversible — page order only.
- **D-08 (amends the brief's § 7 "derived from the version id"):** The code is derived from the **version id plus the version's printed content**. The same content always yields the same code, reprints of an unchanged version match, and nothing is stored. After a **Save over** (possible on a version with no batch, `lineage.js` / `canSaveOver`), a reprint carries a new code and a sheet printed before the save matches no version — honest, because the content it was made from no longer exists. Alphabet and grouping stay as the brief says: Crockford base32, `XXXX-XXXX`; no random nonce. — **Reversibility:** one-way — once sheets are printed and in the binder, changing the derivation strands every code already on paper.
- **D-09:** Matching back is a lookup computed over the stored versions (no index, no stored code). Entry accepts the code with or without its hyphen and in either case (Crockford's own normalisation).
- **D-10:** Code entry lives in **both** places: the rail's **Search** route (currently a placeholder) holds the field, and **Home** carries a short link to it. This replaces the brief's "on the recipe list beside export and import", which predates the "Active work first" Home.
- **D-11:** The field is labelled **"Sheet code"**. The sheet's footer uses the same word beside the code.
- **D-12:** A match lands on **the version's page** (`/recipe/:id` at that version), where Record is one step away.
- **D-13:** No match reads, fact only: **"No version has this code."** No second line.
- **D-14:** **All four pens** keep their draft through a reload: developing, recording, amending, tasting.
- **D-15:** On return, **the pen reopens with the ink** in pen blue, and a page notice beneath the running head (the existing `PageStatus`) says the draft was kept. Cancel still discards with no dialog.
- **D-16:** A draft lasts **until Save or Cancel**, stored through the repository seam (not `localStorage`/`sessionStorage`), so it survives a closed tab, a crash, or the next day. — **Reversibility:** costly — adds a store object and a `DB_VERSION` bump (currently 5); additive, no existing record reshaped.
- **D-17:** The browser's **leave warning is dropped** once drafts persist (it no longer protects anything, and it fires on reload).
- **D-18:** **Home names an open draft**: the active-work lead says a draft is open on that version and links to it, since one pen at a time means a forgotten draft keeps every other opener disabled.
- **D-19:** The **shared Button component lands in Phase 4 as an early plan** (folded todo below): one component always carrying `tabIndex={0}`, with the checkbox/radio equivalent; migrate the 34 buttons, 2 checkboxes, 2 radios; pin each component on rendered markup with exact counts, as 03.4-14/15 did for links. New print-route and Search controls are born on it. Extend the `.claude/CLAUDE.md` convention from "every `<a>`" to every non-text control when it lands.
- **D-20:** Fix the carried screen-reader items **except the plain-language glosses**: Headnote and Margin region names become real headings; the rule's "contributing to" name is carried where it is announced and the deviation words enter the rule's accessible name; the method's ordered list gets an explicit list role; the tab title leads with the recipe name; a live announcement when a rule marks its rows. The PAC/POD/MSNF glosses (D11) are wording and go to Impeccable.
- **D-21:** End-to-end keyboard UAT runs on the desktop and on the iPad (WebKit, 1366, tap-then-Tab with Full Keyboard Access off), served from `build` + `preview --host`, never the dev server.
- **Folded todo (D-19's source):** `2026-09-22-shared-button-component-carries-tabindex-for-webkit.md` (gap G-03.4-r5-2, debug `.planning/debug/ipad-recipe-page-tab-skips-controls.md`). Deferred by Mark in 03.4 to a shared component; Phase 4 must verify UX1-01 end to end, which it cannot on the iPad without this.
- **Addition, not in CONTEXT.md — Mark's chosen Safari print approach (2026-10-07, via the planning question; not yet recorded on his list), option C:** Phase 4 takes the route's print grid (`.recipe-page`) out of print (`display: block`), plus a Safari-only table rule (step groups stay whole, no repeated header in Safari, Chrome stays the reference; As made column first in Safari's print). Source: the orchestrator's request for this research.

### Claude's Discretion

- The route path for the sheet. The brief names both `route:/print/recipe-sheet` (target id) and `/recipe/:id/sheet` (implementation consequence); the brief's `/recipe/:id/sheet` is the default unless planning finds a reason.
- The hash used to derive the code from id + content and exactly which fields count as "printed content" — must be exactly what the sheet prints, so a change that does not alter the paper does not change the code.
- Draft store shape and how each pen serialises its draft.
- How the four pens' existing `isDraftDirty` logic feeds persistence.

### Deferred Ideas (OUT OF SCOPE)

- **Recipe book print format** (D-22) — designed on the canvas, built in a later phase; todo `2026-09-23-build-the-recipe-book-print-format.md`.
- Plain-language glosses for PAC, POD and MSNF (D11) — wording for Impeccable, not code in this phase.
- Reviewed, not folded: none of the nine keyword-matched todos in CONTEXT.md `Reviewed Todos` is Phase 4 scope.
- Out, and named by the brief: QR codes, the print-log nudge, any mode picker, publishing output, printing a batch record or show-changes, scaling.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description (REQUIREMENTS.md) | Research Support |
|----|-------------|------------------|
| PRINT-01 | Print the new version as a bench sheet; formula page shows ingredient, grams, % of batch, step allocation, a mise-en-place box and a blank as-made column; unit on every value | **Wording is superseded by approved sketch 010**: E1 retires the tick box, E2 removes "% of batch". Build the sketch's table (As made, Grams, Ingredient; step heads; Balance in column 2). See "Corrections to carry into planning" C1 and the print-route sections |
| PRINT-02 | Method with typed targets beside prose | `Method` already renders targets in reading mode; reuse with defaults (Method props, `Method.jsx:566-605`). `.method-step` break rule exists |
| PRINT-03 | Blank batch-log page | Two fixed letter pages built from `battery.js` and `axes.js` exports; fit in WebKit is the risk (Pitfall 3) |
| PRINT-04 | Short code on the sheet, matched back, no QR | Pure sync hash + Crockford base32 in `app/src/domain/`; `crypto.subtle` is unavailable over the LAN HTTP preview used for device UAT (Don't Hand-Roll) |
| PRINT-05 | Prints a saved version, never unsaved edits; no batch created | A route that reads `repository.getVersion` and renders nothing from pen state makes it true by construction; persisted drafts make navigating to it mid-pen lossless |
| UX1-01 | Keyboard operable, visible labels/focus, AA contrast | Shared Button/Checkbox/Radio (D-19), D-20 items, iPad tap-then-Tab UAT (D-21) |
| UX1-02 | Entered data survives a reload mid-edit | Drafts object store behind the repository seam, restore on page mount (Draft section) |
| UX1-03 | Never conveyed by colour alone | Print is ink only; existing "estimated" flag is words; re-audit new surfaces (Search, draft notice) |

Note: REQUIREMENTS.md traceability already marks UX1-01 and UX1-03 "Complete" while Phase 4 maps them for end-to-end verification. Treat them as verify-only here.
</phase_requirements>

## Summary

The phase is five loosely coupled builds: (1) a print route that renders a saved version as two fixed log pages, then the Sheet (formula page with Balance in column 2, then Instructions); (2) a deterministic short code and a lookup on Search and Home; (3) draft persistence for the record, amend and plan pens in a new IndexedDB store; (4) a shared Button, Checkbox and Radio migration; (5) the carried screen-reader fixes. Most of it is plain application work on code that exists. The risk is concentrated in print, and this session measured it rather than reasoning about it.

**WebKit print differs from Chrome in ways that change the design, and Mark's option C is workable but not sufficient on its own.** Measured with the repo's own WebKit print harness (macOS 26.5, WebKit via `WKWebView` and `NSPrintOperation`) and Chrome 154's PDF: (a) WebKit's `@page` margin is honoured, but one CSS px prints as 0.8 pt (not 0.75), so a 0.5 in margin gives a **675 px** layout width and a **900 px** content height where Chrome gives 720 and 960; Mark's iPad PDF has identical text metrics to the macOS harness, so the iPad does the same. (b) WebKit has no running footer at all: a `position: fixed` foot prints once, `@page` margin boxes and named `@page` pages are ignored. So the brief's "foot with page n of m on every page" cannot be done in Safari by CSS. (c) Sketch 010's log page 1 needs about 927-940 px of height; WebKit's content box at 0.5 in margins is 900 px, so the log pages as drawn **do not fit one printed page in Safari** without a change. (d) With the grid out of print, Balance beside the table works as a **float** placed before the table in the DOM (tested in both engines, no cut rows, header repeats in Chrome), but the two columns must flex because the sketch's 436 + 264 px does not fit in 675 px. (e) D-06b (Instructions open their own page when the table fits) needs no measurement: `min-height: calc(100% - 2px)` on the formula section makes a short formula page fill its page, so the Instructions fall to the next one, and a long one flows on; verified in both engines on a test page.

The short code needs a synchronous pure-JS hash because `crypto.subtle` exists only in secure contexts and device UAT is served over plain HTTP on the LAN. The draft work has a trap CONTEXT.md does not know: the app now has **three** pen states, not four (the tasting pen folded into the record draft in 03.3.1-02), and `DB_VERSION` is **7**, not 5.

**Primary recommendation:** Build the print route as its own top-level print tree (own class names, no `.recipe-page` grid), with `html, body { height: 100% }` and fixed 100%-high log pages, a float for Balance, `@page { size: letter; margin: ... }` pinned, a WebKit-only `@supports (font: -apple-system-body)` table rule (the debug record's r8) after the grid is gone, and put all of it in a new `app/src/styles/print.css` because the repo's CSS test parser rejects `@page` and `@supports` in `app.css`. Get Mark's answers on the foot, the log-page fit, and the unapproved on-screen surfaces before locking plans.

## Corrections to carry into planning (CONTEXT.md and docs vs the code, checked this session)

| # | Claim in CONTEXT.md or docs | What the code says | Source |
|---|---|---|---|
| C1 | PRINT-01 / ROADMAP criterion 1: "% of batch ... a mise-en-place box" | Sketch 010 E1 retires the tick box; E2 removes % of batch. The plans' acceptance must cite sketch 010, and REQUIREMENTS.md/ROADMAP wording needs amending through the normal route | `.planning/sketches/010-bench-sheet/README.md` E1, E2 [VERIFIED: read this session] |
| C2 | Canonical refs: "sketch 010 ... Does not exist yet" | It exists, approved 2026-10-06, with `CONTRACT.md` | same folder [VERIFIED: ls and Read] |
| C3 | D-16: "`DB_VERSION` bump (currently 5); additive" | `export const DB_VERSION = 7;` and the upgrade callback **drops and recreates all three stores on any bump** (`if (oldVersion > 0 && oldVersion < DB_VERSION) { ... deleteObjectStore ... }`). A bump is not additive today | `app/src/store/db.js:4`, `:14-18` [VERIFIED] |
| C4 | D-14 / D-19: "four pens" including tasting | `derivePenState` returns exactly `plan`, `record`, `amend`. Tasting is `draft.tastingOpen` inside the record draft; "Record a tasting" is an amend opener (`amendOpener: 'record-a-tasting'`). Two state objects need persisting (`penDraft`, `draft`) | `RecipePage.jsx:320-342`, `:1390-1424` [VERIFIED] |
| C5 | D-19: "34 buttons, 2 checkboxes, 2 radios" | Comment-stripped scan of `app/src/ui/*.jsx` (non-test): **43** `<button`, **3** checkbox (`Method.jsx` x2, `VersionRow.jsx` x1), **2** radio (`AxisMark.jsx`, `Segmented.jsx`). Per-file buttons: Authored 1, AxisMark 1, BatchRow 7, FoldRow 1, GraduatedRule 1, IngredientTable 3, Method 9, PenFoot 4, RecipeBand 3, Segmented 1, Shell 6, VersionRow 6 | scan run this session [VERIFIED: node script over the sources] |
| C6 | D-20: "Headnote and Margin region names become real headings" | Already `<h2 className="region-name">` in `DerivedAdvisories.jsx:31`, `FormulationNote.jsx:23`, `IngredientTable.jsx:378`, `Method.jsx:667`, `RecipePage.jsx:2117`. That item is done. Still open: the rule's accessible name omits the deviation words (`GraduatedRule.jsx` builds `accessibleName` from label, value, target and basis only, while `deviation.words` is rendered as visible text); `.method-steps { list-style: none; }` on an `<ol>` (`app.css:1070-1071`) drops list semantics in Safari; no `document.title` is set anywhere (only `index.html`'s `<title>Sprinkles</title>`); no live region marks a rule's rows | grep and Read [VERIFIED] |
| C7 | D-10: "the rail's Search route" | The Search link is in the Shell's tools row and the More list (`Shell.jsx:353`, `:475`), not the places rail. `/search` is `<Placeholder name="Search" />` | `router.jsx`, `Shell.jsx` [VERIFIED] |
| C8 | Discretion: route `/recipe/:id/sheet` default | The brief's 2026-09-23 amendment already settles it: print sits at `…/print` under each Notebook form, i.e. **`/notebook/:recipeId/:versionId/print`**, "superseding § 3's `/recipe/:id/sheet` and Phase 4 CONTEXT's default". Build addresses through `notebookPath`'s encoding pattern | `.impeccable/surfaces/route-print-recipe-sheet.md` (Assets and processes amendment) [VERIFIED] |
| C9 | D-12: "`/recipe/:id` at that version" | That address is a legacy redirect; land on `notebookPath(version.recipeId, version.id)` | `notebookPaths.js`, `router.jsx` [VERIFIED] |
| C10 | Sketch 010 README: Sheet "gap `--gap-l` 32" and columns 436 + 264 | 436 + 264 + 32 = 732 but the board's content is 720 wide (816 less two 48 px paddings); 436 + 264 + `--gap-m` (20) = 720. `measurements.json` records the table at 436 (webkit_C/chromium_C). Confirm the gap against the board's own CSS before the plan cites it | `measurements.json`, `CONTRACT.md` [VERIFIED numbers; arithmetic inference] |
| C11 | `.claude/CLAUDE.md` "Project Skills: none found" | `.claude/skills/` holds `gsd-ui-review`, `marks-list`, `sketch-findings-sprinkles` | `ls .claude/skills` [VERIFIED] |

## Project Constraints (from CLAUDE.md)

From `./CLAUDE.md` and `./.claude/CLAUDE.md`; the planner treats these as locked:

- Small, reviewable steps; surface structural choices (routing, state, testing framework) rather than assuming. Minimum code, surgical changes, no speculative flexibility.
- Stack ratified: React 19.2.8, Vite 8.2.2, `react-router` 8.3.1, `idb` 8.0.3, Vitest 5.0.0; **TypeScript not adopted**.
- Domain math in framework-free modules under `app/src/domain/` (no framework, DOM or store import); domain tests run in Vitest's `node` environment.
- Every store access through `app/src/store/repository.js`; only `app/src/store/db.js` imports `idb`.
- Every visual value reads through a CSS custom property in `app/src/styles/tokens.css`; no literal in any component or stylesheet. (Sketch 010's literals, listed in its README "Tokens", must become tokens.)
- No `dangerouslySetInnerHTML` under `app/src`; notes and prose render as text.
- Agent-facing prose, commit messages and browser-test input values in English.
- Device UAT served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server; one Vite process per workspace.
- Every link, button, radio and checkbox carries an explicit `tabIndex={0}`, enforced by `app/src/ui/tabindex-scan.test.js`.
- Every `app/` edit goes through a GSD command; Impeccable decides design and briefs, GSD builds. `@media print` blocks are top-level siblings, never nested (CONTEXT canonical patterns).
- Mark's List (the pinned artifact) holds what waits on Mark. This research could not read it (the `ArtifactData` tool is not available to this agent), so row state is unchecked. The option C answer is not yet on it: the orchestrator should add a row.

## Architectural Responsibility Map

Single-tier app (browser SPA over IndexedDB); tiers here are the app's own layers.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Short-code derivation, normalisation, lookup | `app/src/domain/` (pure) | `ui/` Search page calls it | Framework-free rule; one-way once printed, so golden-vector tested in node |
| "Printed content" model | `app/src/domain/` (pure) | print route renders from it | The code and the paper must come from one function so they cannot drift |
| Blank batch-log fields | `domain/battery.js`, `axes.js` data | print route component | The pens' own labels, units, options; no second copy |
| Draft persistence | `store/` (new object store) via `repository.js` | `ui/RecipePage.jsx` effects | Seam rule; survives reload |
| Draft shape validation on restore | `domain/` (pure) | RecipePage | A stored draft must not crash `isPenDraftDirty` when it no longer matches the version |
| Print layout, page size, margins | `styles/print.css` (new) | print route component structure | `@page`, `@supports` cannot live in `app.css` (test parser) |
| Safari table rule | `styles/print.css` under `@supports` | — | Chrome fails the `@supports` test, keeps its own table model |
| Shared controls | `ui/` (new Button, Checkbox, Radio) | scan test | One place carries `tabIndex={0}` |
| Tab title, list role, live announcement | `ui/` components | — | Screen-reader items D-20 |
| Page foot with code | Print route markup, inside each fixed page | — | No CSS running footer exists in WebKit (Pitfall 2) |

## Standard Stack

### Core

No new packages. Everything below is already in `app/package.json` [VERIFIED: `app/package.json` read this session].

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react / react-dom | 19.2.8 | print route, Search page, shared controls | project stack, ratified |
| react-router | 8.3.1 | new `/notebook/:recipeId/:versionId/print` route | existing router (`router.jsx`) |
| idb | 8.0.3 | `drafts` object store | only `db.js` may import it |
| vitest | 5.0.0 | unit tests; jsdom 30.1.1 and fake-indexeddb 6.2.5 for the few interaction and store tests | existing; baseline `npm --prefix app test` = 1926 passed in about 2 s [VERIFIED: ran this session] |

### Supporting (tools, not dependencies)

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `.planning/canvas-generators/wkprint.swift` | repo file | WebKit print to PDF (macOS, Letter, margins 36/36/36/50 pt unless the CSS sets `@page`) | every print verification on the Mac; compiled with `swiftc -O` (Swift 6.3.3 present) |
| `.planning/canvas-generators/pdf-pages.swift` | repo file | per-page text dump of a PDF | page-order checks |
| PDFKit `findString` script (`findrows`, used in the 03.7 debug) | not in repo | page and y-position of a needle | checks for cut rows and group splits; recreate from the debug record if wanted (about 15 lines) |
| `03.7-print-probe.mjs` | repo file | Chrome print cases P1 to P7 | re-run after print CSS changes (needs `PROBE_DIST`); it imports `playwright-core` from an npx cache path (`/Users/mark/.npm/_npx/e41f203b7505f1fb/...`, v1.63.0), which is fragile |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New `print.css` | Add to `app.css` | `app.css` is read by `css-source.js`, whose `assertNoAtRules` throws on any at-rule that is not a top-level `@media` (including `@page`, and `@supports` nested in `@media`); and `cross-cutting.test.js` pins "exactly ten top-level @media blocks" and "exactly nine" print rules. A new file avoids editing the parser, but `tokens.test.js` `CSS_FILE_NAMES` must list it to keep the token gate honest |
| Float for Balance | Grid kept, or flex row | Grid in print is exactly what option C removes (debug record: WebKit cuts grid items at their pre-print offset). Flex-column was weaker than block in the reviewer's note. Float works (tested) |
| CSS min-height fill for D-06b | JS measurement in `beforeprint` | JS cannot measure WebKit's print layout from the screen layout (different width and 0.8 scale). CSS fill needs no measurement |

**Installation:** none.

**Version verification:** not applicable (no new packages). Existing versions read from `app/package.json`.

## Package Legitimacy Audit

No external package is recommended for this phase. The Crockford base32 encoder, the hash and the draft store are small in-repo code. `package-legitimacy check` was therefore not run.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
Version row ("Print sheet" Link, openPen === null)
        |
        v
/notebook/:recipeId/:versionId/print   (new route, inside Shell on screen)
        |
        |-- repository.getVersion(versionId), getRecipe, listVersions (saved record only)
        |        |-- not found -> existing RecipeNotFound page
        v
printedContent(version)  (domain, pure)  <------------------------------+
        |                                                                |
        |--> sheetCode(version) = base32(hash(canonical(printedContent))) |  same function feeds code
        |                                                                |  and the paper
        v
  PrintSheet component tree (own class names, no .recipe-page grid)
   |- screen furniture: one line (recipe, version line, saved date, Sheet code) + "Print" control [no approved board]
   |- Log page 1  "At the machine"   (fixed page, foot in-flow: Sheet code)
   |- Log page 2  "When you taste it" (fixed page, foot in-flow)
   |- Formula section (min-height fills the page, so Instructions fall to the next page when it fits)
   |     band -> Before you start -> Ingredients (table: As made | Grams | Ingredient; step groups)
   |                                   + Balance floated right, before the table in the DOM
   |- Instructions section (Method, reading mode defaults), steps whole
   v
@media print in print.css:
   Shell chrome hidden, height:100% chain, @page { size; margin }, break rules
   Chrome: table model (thead repeats, tbody break-inside: avoid)
   WebKit only (@supports (font: -apple-system-body)): groups as atomic inline-blocks, no repeat

Search route (/search) --Sheet code field--> normalise -> sheetCode over listVersions() -> match? navigate(notebookPath) : "No version has this code."
Home --short link--> /search      Home --draft line--> listDrafts() -> link to the draft's page

RecipePage (record / amend / plan pens)
   state change --(debounced, only when dirty, gated on restore-finished)--> repository.saveDraft
   mount --> repository.getDraft(versionId) --validate vs version/batches--> restore mode + draft, PageStatus "draft kept"
   Save or Cancel --> repository.deleteDraft(versionId)
```

### Recommended Project Structure

```
app/src/
├── domain/
│   ├── sheetCode.js        # printedContent -> canonical string -> hash -> Crockford XXXX-XXXX; normaliseCode; findVersionsByCode
│   ├── sheetCode.test.js   # determinism, golden vector for Olive Oil v1, normalisation, "content change => code change, paper-neutral change => same"
│   ├── blankLog.js         # (optional) the print log's field list derived from battery.js/axes.js, incl. axesForVersion
│   └── draft.js            # draftMatchesVersion(...) shape validation (pure)
├── store/
│   ├── db.js               # DB_VERSION 8, 'drafts' store
│   └── repository.js       # getDraft, saveDraft, deleteDraft, listDrafts
├── ui/
│   ├── controls/ (or flat) Button.jsx, Checkbox.jsx, Radio.jsx
│   ├── PrintSheet.jsx, PrintLogPages.jsx, PrintTable (or a print variant of IngredientTable)
│   └── SheetCodeSearch.jsx # Search route body
└── styles/
    └── print.css           # @page, print layout, WebKit branch; imported after notebook.css in main.jsx
```

### Pattern 1: One function produces the printed model and the code

**What:** `printedContent(version)` returns the clean reading the sheet prints (active rows with their portions and step, active steps with lead-in, instruction, targets, purpose and aside, the authored Before-you-start texts, Sheet title and description, the version line) in a fixed field order with explicit field lists (no object spread, no key-order dependence). The print route renders from the same object. The code hashes the canonical string of it plus `version.id` plus a derivation tag (for example `"sprinkles-sheet-code:1"`).
**When to use:** always; it is the only way "a change that does not alter the paper does not change the code" stays true.
**Notes:**
- Use the domain's own clean reading, `activeRows(version)` and `activeSteps(version)` from `domain/rows.js` (the same filters `RecipePage` applies at `readingVersion`).
- Normalise before hashing: `purpose ?? ''`, `aside ?? ''`, `String(grams)`, Unicode NFC. Leave out anything the paper does not show (`reason`, `citedBatchId`, `createdAt`, `parentVersionId`).
- Balance is derived from the rows and their embedded ingredient coefficients (`rows[].ingredient`), so a coefficient change that moves a printed figure should change the code. Decide whether to hash the rounded figures that print or the coefficients; hashing the printed figures is closest to "exactly what the sheet prints".
- D-22a: do not include anything format-specific (log pages, column order); recipe content only.
- Pin the Olive Oil v1 seed code in a test (golden vector). **The derivation is one-way (D-08): a silent change to canonicalisation or the hash strands every printed sheet.**

### Pattern 2: Fixed letter pages and fill-to-page, in both engines

**What (verified on test pages, both engines):**
```css
@page { size: letter; margin: <pinned>; }
html, body { height: 100%; margin: 0; }
.print-log-page { height: 100%; break-after: page; page-break-after: always; display: flex; flex-direction: column; }
.print-log-page__foot { margin-top: auto; }
.print-formula { min-height: calc(100% - 2px); } /* short formula page fills its page, so Instructions start the next */
```
- Log pages: WebKit and Chrome both printed two log pages as exactly two pages with the foot at the content-box bottom (WebKit foot at y 741-754 pt of 792; Chrome 742-754) [VERIFIED: wkprint and Chrome PDF, this session].
- `100vh` does not work in WebKit print: it is the window height, the page overflowed [VERIFIED]. `height: 100%` needs `html, body { height: 100% }` and every ancestor to have a definite height; in the real app `Shell` sets `.shell { min-height: 100vh }`, so the print CSS must neutralise `.shell`, `.shell__body`, `.shell__main` and `.notebook`-style wrappers (`display: block; height: 100%; min-height: 0`), or the print route is mounted outside `Shell`.
- Fill-to-page: with the formula block at 5 and 14 rows, the Instructions began on page 2 in both engines; with 30 rows the Instructions followed the tail on page 2 instead of page 3 [VERIFIED: test page]. That implements D-06b with no measurement. Keep the `- 2px` guard: an exact-height box can spill a blank page (a log page sized `10in - 2px` in a 0.5 in margin page is not the fix; see Pitfall 3).
**Open item to verify in the real tree:** the chain through the Shell and `#root`; the test pages had no wrappers.

### Pattern 3: Balance in column 2 without a grid

**What:** in the print DOM put the Balance section **before** the table inside the ingredients region and float it right; give the table a fixed width, and `clear: both` the Instructions. In WebKit (grid removed, `.recipe-page` as block) this printed Balance beside the table on page 1, rows uncut, the table breaking between step groups (Steps 2, 3, 6 on page 1, Step 8 and the Total on page 2), and the float's tail continuing beside the table tail on page 2 [VERIFIED: wkprint on the built route with injected CSS and a DOM move]. In Chrome 154 the same CSS gave the repeated header on page 2, groups whole, Total with Step 8 [VERIFIED: Chrome PDF].
**Width:** table 436 px plus Balance 200 px plus a 20 px gap fits WebKit's 675 px content width; table 436 plus Balance 264 plus 32 does not, and the table then dropped below the float. Make the table column fixed (it needs about 435 px: As made 90, Grams 81, Ingredient 264, from `measurements.json`) and let Balance take the remainder (about 220 px at 675, 264 at 720). The gauges already scale to their column (`max-width: var(--rule-width)`).
**Without `clear`:** the Instructions' first steps wrapped beside the float's tail on page 2. The sketch's grid starts the method row below both columns, so use `clear: both` on the Instructions to match it (not tested: confirm no large gap results).

### Pattern 4: The Safari table rule (after the grid is gone)

**What:** the debug record's candidate r8, carried into `print.css` under `@media print { @supports (font: -apple-system-body) { ... } }`. `CSS.supports('font: -apple-system-body')` is false in Chrome 154 and true in Playwright WebKit (Safari 26.6 UA) [CITED: `.planning/debug/safari-print-ingredient-table.md`, evidence 2026-10-06 14:14]; do not use `-webkit-touch-callout` (matches iOS only, so the macOS harness could not verify) [CITED: same record, Specialist Review]. Its core, from the same record:
```css
.ingredient-table { orphans: 2; widows: 2 }
.ingredient-table:has(> tbody:only-of-type > tr.ingredient-table__step-head) { orphans: 3 }
.ingredient-table thead,
.ingredient-table tbody:not(:only-of-type),
.ingredient-table tfoot { display: inline-block; vertical-align: top; width: 100% }
.ingredient-table tbody:only-of-type { display: contents }
.ingredient-table tbody:only-of-type > tr:not(.ingredient-table__step-head) { display: inline-grid; vertical-align: top }
.ingredient-table tbody:only-of-type > tr.ingredient-table__step-head { display: inline-block; vertical-align: top; width: 100% }
```
preceded by the table-as-blocks and rows-as-grids block (the screen D3 rules, `app.css:2928-3053`, which for the print table with three tracks must be rewritten for As made | Grams | Ingredient). The record's sweep (21 and 43 offsets, flat and one-step cases) passed with the grid out of print; its limit is a step group taller than one page, which it cuts.
**Verified this session:** r8 applied together with the Balance float and `.recipe-page` as block printed 3 pages with Steps 2, 3, 6 on page 1, Step 8 and the Total on page 2, header on page 1, nothing cut. That page break fell in the same place as the plain float run, so this is a compatibility check, not a re-proof of the sweep; run the sweep (the record's `sweep.sh` lives in an earlier session's scratchpad, not the repo) against the final DOM.
**Known costs (record):** WebKit never repeats a `thead` (WebKit bug 17205), so Safari prints the header once; the region heading ("Ingredients") can stand alone at a page foot (WebKit ignores `break-after: avoid`, which the existing `.region-name` rule relies on).
**Simplification for As made first:** if the print table's DOM puts As made first in every engine (sketch 010 E1 draws it that way), the "As made first only in Safari" difference in option C disappears, and so does the record's overflow of the Total's as-made figure into the plan Total (the sketch's Total As made cell is empty).

### Pattern 5: Draft persistence

**What:** a new object store `drafts`, `keyPath: 'versionId'` (one open pen per version; `RecipePage` is keyed by version and batch). Record shape (proposed names, [ASSUMED]): `{ versionId, kind: 'plan' | 'record' | 'amend', payload, amendingBatchId, amendBaseline, amendOpener, openedAt, updatedAt }`. `payload` is `penDraft` or `draft`, both plain structured-cloneable objects (`handleStartDeveloping` builds `penDraft` from strings, arrays, `structuredClone`; `blankRecordDraft` and `draftFromBatch` build `draft`), so IndexedDB stores them directly.
**Wiring in `RecipePage.jsx` (all verified present):**
- Replace the `beforeunload` effect (`RecipePage.jsx:909-920`, D-17) with a persistence effect that reads the same two dirty checks (`isDraftDirty(mode, draft, amendBaseline)`, `isPenDraftDirty(mode, penDraft, version)`): dirty -> debounced `saveDraft`; clean or closed -> `deleteDraft`. Flush on unmount and on `visibilitychange` hidden / `pagehide` so a reload inside the debounce window does not lose the last keystrokes (IndexedDB writes in `pagehide` are best effort).
- Restore effect on mount after `version` and `batches` have loaded: read the draft, validate with a pure `draftMatchesVersion`, then `setMode`, `setDraft` or `setPenDraft`, `setAmendingBatchId`, `setAmendBaseline`, `setAmendOpener`, `penOpenedAtRef.current`, and `onPageStatus('<kept notice>', { persist: true })`. `announcePageStatus(message, { persist })` already exists in `router.jsx`.
- Delete on `handleCancelRecording`, `handleCancelDeveloping`, after `handleSaveBatch` resolves (both branches), after `handleSaveAsNewVersion` resolves (delete the **parent's** draft; the page then navigates to the child) and after `handleSaveOverVersion` resolves.
- Escape stays as is: it closes only a clean pen, which `deleteDraft` handles through the effect.
**Dirty rules already exist** and are exported/pure; do not write a third notion of dirtiness (the Escape comment says the same).

### Anti-Patterns to Avoid

- **Mounting the print layout on `.recipe-page`.** The grid is the defect (cut rows in WebKit, steps split in Chrome). Use own markup and class names; reuse the primitives (`IngredientTable` pieces, `Method`, `FormulationNote`, `BasisNote`, `NoteList`).
- **A footer via `position: fixed` or `@page` margin boxes as the only mechanism.** Chrome repeats them; WebKit prints a fixed element once and ignores margin boxes.
- **`100vh` for page height.** WebKit's `vh` in print is the window.
- **Named `@page` pages** (`page: log`): ignored by WebKit (text stayed at the default margin), so fixed log pages cannot get a different margin from the flow pages.
- **Deleting the stored draft from a "clean" effect before restore has finished.** On first mount `mode` is `'reading'`, `draft` and `penDraft` are `null`, which is "clean"; an unguarded delete wipes the draft before it is read (Pitfall 5).
- **Storing the code.** D-08/D-09: compute over stored versions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hash for the code | `crypto.subtle.digest` | A small synchronous pure-JS hash in `domain/` (for example 64-bit FNV-1a via `BigInt` with a final mix, keep 40 bits), or any well-known public-domain 53/64-bit string hash | `crypto.subtle` "is available only in secure contexts (HTTPS)" [CITED: developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle]; the device UAT URL is `http://192.168.x.x:4173`. `id.js` already carries the same lesson for `randomUUID`. The code is an identifier, not a secret, so a non-cryptographic hash is fine; 40 bits over a personal library (19 seeded versions) has negligible collision risk, but `findVersionsByCode` must still return an array and the page must handle length > 1 deterministically |
| Crockford encoding | An ad hoc alphabet | The alphabet `0123456789ABCDEFGHJKMNPQRSTVWXYZ`, upper case on output, decode treats `i` and `l` as `1`, `o` as `0`, accepts either case, ignores hyphens [CITED: crockford.com/base32.html]. The old prototype's `shortCodeFrom` (`~/Documents/projects/old-sprinkles/src/domain/sheet-codes.js`) encodes 40 bits as 8 symbols grouped `XXXX-XXXX`; copy the alphabet and grouping only (its nonce is not carried over, D-08) | Matches D-08/D-09 |
| Print table pagination in Safari | JS pagination | The r8 CSS rule (Pattern 4) | The record's sweeps pass; JS would not see WebKit's print layout |
| Page numbers in Safari | CSS counters | Nothing: not available (Pitfall 2) | Decide the foot with Mark |
| Draft dirtiness | A new comparison | `isDraftDirty`, `isPenDraftDirty` | Already presence-over-truthiness and baseline-aware |
| Code-entry parsing | Regex scattered in the page | One `normaliseCode(input)` in `domain/` | Hyphen, case, I/L/O handling, length check, tested in node |
| Version link building | Template literals | `notebookPath(recipeId, versionId, batchId)` | `encodeURIComponent` on each segment |

**Key insight:** the print layout is the part where custom solutions are worse than a measured constraint set. Everything else here is small, pure and testable code.

## Common Pitfalls

### Pitfall 1: WebKit prints at 0.8 pt per CSS px, so the layout is narrower than Chrome's
**What goes wrong:** at `@page { margin: 0.5in }` WebKit lays the page out at **675 px** wide and **900 px** tall; Chrome gives **720 x 960**. A box `480px` wide measured 384 pt in the WebKit PDF (0.8 pt/px) and the content width 540 pt (675 px). `5in` printed as 384 pt, not 360 pt.
**Why:** WebKit's print scaling; the iPad matches the macOS harness (text bounds for "Olive Oil Ice Cream" are `p1@94-120` in both Mark's iPad PDF and the harness PDF, and "Heavy cream" `p1@652-663` vs `p1@627-638` differ only by margin).
**How to avoid:** design the print route to flex between 675 and 720 px wide; never assume a 720 px content width, and never size fixed pages in `in` or `px` against the page: use `height: 100%` pages. The sketch's 436 + 264 columns and log-page geometry were measured at 816 x 1056.
**Warning signs:** the table dropping below the float, names wrapping in the table, log page foot on a third page.

### Pitfall 2: No running footer exists in WebKit
**What goes wrong:** the brief's § 6 foot (recipe, version line, short code, page n of m, on every page) cannot be done with CSS in Safari. Measured in WebKit 26.5 (macOS): `position: fixed` foot printed **once**, at the last page; `@page { @bottom-right { content: counter(page) } }` printed nothing; named `@page` pages ignored. Chrome 154 repeated the fixed element and rendered `counter(page)` and `counter(pages)` margin boxes.
**How to avoid:** put the foot **in flow** inside each fixed log page (two pages, so the code appears on both sides of the sheet, which is the brief's stated reason), plus one at the end of the Sheet. "Page n of m" is unknowable for the flowing pages in Safari. This needs Mark's decision (Open Question 1).

### Pitfall 3: Sketch 010's log pages do not fit one printed page in WebKit at 0.5 in margins
**What goes wrong:** `measurements.json` gives log page 1 content bottom at y 953 from a 48 px top (905 px of content), foot 22 px tall, spare 41; page 2 content bottom 963, spare 31. The content plus foot needs about 927 to 940 px; WebKit's content box at 0.5 in margins is 900 px, Chrome's is 960. A 959 px flex page (`10in - 2px`) in WebKit split its foot onto the next page in a test [VERIFIED]. Page 1 also changes under D6 (fewer writing lines, group heads).
**How to avoid:** spike the real log pages in `wkprint` before locking the margin. Options to put to Mark or the planner: smaller `@page` margins (about 0.25 in gives WebKit roughly 936 x 711 px), a WebKit-only `zoom` on the log pages, or fewer lines in Safari. Heights here are measured in Chrome and Playwright WebKit at screen scale, then scaled by inference: [ASSUMED] until the log pages are printed through `wkprint`.

### Pitfall 4: The repo's CSS test parser rejects the print rules
**What goes wrong:** `css-source.js` `assertNoAtRules` throws for any at-rule other than a top-level `@media`, including `@supports` nested in `@media` and `@page`; `cross-cutting.test.js` pins the number of top-level `@media` blocks (ten) and exactly nine print rules (`:398`, `:921`), and says "the condition is screen-only, so print is untouched (Phase 04 owns print)" (`:535`).
**How to avoid:** put the new print CSS in `print.css` (not read by those suites) and add it to `tokens.test.js` `CSS_FILE_NAMES` so the no-literal gate covers it; write a `print.test.js` that reads it with a print-aware reader; leave `app.css`'s print block and its tests alone unless a rule must move. If an `app.css` edit is unavoidable, the parser and the counts must be updated in the same plan.

### Pitfall 5: Deleting the draft before reading it
**What goes wrong:** the persistence effect sees `mode === 'reading'` and null drafts on first render, calls it clean, deletes the stored draft; the restore read then finds nothing.
**How to avoid:** a `draftRestoreDone` flag (state or ref) set only after the restore read settles; the persist and delete logic runs only after it. StrictMode double-invokes effects in dev (`main.jsx` wraps `<App />` in `StrictMode`): make the restore idempotent.

### Pitfall 6: A stored draft that no longer matches its version crashes the page
**What goes wrong:** `isPenDraftDirty` reads `penDraft.rows[row.id].portions[i]` for every version row and throws if a row id is missing. An import (`transfer.js` writes versions and batches by `put`) can replace a version under a stored draft; an amend draft can name a batch that no longer exists.
**How to avoid:** `draftMatchesVersion` before restoring (row ids and portion counts, step numbers, `amendingBatchId` present in the batch list); on mismatch delete the draft quietly. Also decide whether an amend draft restores only on its own batch route (`/notebook/:r/:v/batch/:b`): `openBatch` comes from the URL, and an amend draft on another batch's route would show the wrong head.

### Pitfall 7: `DB_VERSION` bump wipes everything
**What goes wrong:** see C3. Bumping to 8 under the current callback drops `versions`, `batches`, `recipes` for any returning profile, which `seedIfEmpty` then reseeds. That also means any real batch Mark recorded in his browser since the last bump is lost.
**How to avoid:** decide explicitly. D6b says "only seed data exists", so the reset is acceptable, and if D6 lands with regenerated seeds the reset is wanted (a seeded profile never receives new seed content otherwise: the comment at `db.js:11-13` says so). If instead D-16's "additive" is meant, guard the reset to `oldVersion < 7` and only create `drafts`. Update `db.test.js` (it asserts version 7 and the reset cases). Export files do not need to carry drafts (`STORE_SCHEMA_VERSION` 6 stays).

### Pitfall 8: The shared Button must still allow the one exemption
**What goes wrong:** `GraduatedRule` passes `tabIndex ?? 0` and `FormulationNote` passes -1 while recording or developing; the scan test allowlists exactly that tag and fails on a stale entry. A Button that hard-codes `tabIndex={0}` cannot express it.
**How to avoid:** keep `GraduatedRule`'s raw `<button>` as the single allowlisted exemption, or give Button an explicit override and update the allowlist entry; do not weaken the scan. The scan reads source text for `<button`, `<input type="radio|checkbox">`, so after migration those tags appear only in the shared components, each carrying a literal `tabIndex={0}`.

### Pitfall 9: Chrome-only verification of Safari items
Chromium Tabs to every control and repeats table headers; neither proves the iPad. The print debug record says macOS WebKit "is evidence, not device proof"; Mark's iPad PDF is the proof (D-21 for keyboard).

## Code Examples

### Crockford encode and normalise (shape only; alphabet is from the spec)
```js
// Source: https://www.crockford.com/base32.html (alphabet, decoding rules)
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export function normaliseCode(input) {
  const s = input.trim().toUpperCase().replace(/[-\s]/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');
  return /^[0-9A-HJKMNP-TV-Z]{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4)}` : null;
}
```
(The regex classes are the alphabet's runs; a test should assert every alphabet symbol round-trips and `I`, `L`, `O`, `U` behave as the spec says. `U` is not in the alphabet and should fail.)

### Restore-safe persistence effect (shape)
```js
// Proposed, not in the repo. Names are [ASSUMED].
useEffect(() => {
  if (!draftRestoreDone) return undefined;
  const dirty = isDraftDirty(mode, draft, amendBaseline) || isPenDraftDirty(mode, penDraft, version);
  const timer = setTimeout(() => {
    if (dirty) repository.saveDraft(buildDraftRecord(...));
    else repository.deleteDraft(versionId);
  }, dirty ? 250 : 0);
  return () => clearTimeout(timer); // plus a flush on unmount / pagehide
}, [draftRestoreDone, mode, draft, amendBaseline, penDraft, version]);
```

### Blank log from the pens' own data
`BATTERY_FIELDS` (key, label, unit), `SEGMENT_OPTIONS` (`exitConsistency`, `airiness`, `meltStyle`), `DEFECTS`, `DECLARED_FLAW`, `AXES` with `group` and `low`/`high` anchors are exported pure data (`battery.js`, `axes.js`; read in full this session). `axesForBatch(batch)` reads `batch.snapshot.declaredAxes`; the print route has a version, so add a small pure `axesForVersion(version)` over `version.declaredAxes` (seed versions carry `declaredAxes` and `declaredFlaw`). Captions that differ from the pen are fixed by the sketch: "Airiness" without "(estimated)" (D3; `BatchRow.jsx:767` has "Airiness (estimated)").

## D6 (mark-one At draw / From freezer): not approved; treat as a gated plan

The sketch README says D6, D6a and D6b are drawn and not approved. They touch: `battery.js` (field definitions), `BatchRow.jsx` (1187 lines; group heads and the "only while blank" control), `RecipePage.jsx` (`blankRecordDraft`, `draftFromBatch`, `isDraftDirty`, `buildChurnFieldsFromDraft`, `buildTastingFieldsFromDraft`), `domain/batch.js` (`buildChurn`, `buildTasting`; `BATCH_SCHEMA_VERSION = 3`), `transfer.js` (`validateBatch` and `STORE_SCHEMA_VERSION = 6`), the seed batches (hand-written data files such as `data/batch-2026-08-02.js`, each listing `exitConsistency: null`), and the draft payload (so draft restore must not ship before D6's field names are final, or the draft needs its own shape version). Per D6b the app stores only "Nothing to note" or "Not evaluated" (or nothing), shown only while the group is blank; the print keeps all three boxes. Recommend: plan the log pages and the draft store against the **D1-D5 approved** forms, and make D6 a separate late plan that is blocked on Mark's approval; do not let it gate PRINT-03. If D6 lands, the store reset that comes with the `DB_VERSION` bump regenerates the seeds (Pitfall 7).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Print = the notebook route's own `@media print` (hides notice and hand fallback only) | Own print route with fixed letter pages | brief 2026-09-16, amended 2026-09-23 and 2026-10-06 | New route and `print.css` |
| Tick box and % of batch on the formula page | As made line first, no tick box, no %, Balance in column 2, step rules in ink | sketch 010, 2026-10-06 | Print table is a variant, not the on-screen table |
| Tasting pen | Tasting section inside the record draft | 03.3.1-02 | Two draft objects, three pen states |
| Version `DB_VERSION` bumps as additive | Bumps reset the stores | `db.js` D-05/D-10 | See Pitfall 7 |

**Deprecated/outdated:** the brief's "no Balance in column two" anti-goal (E4 overrides it); CONTEXT's canonical ref saying sketch 010 does not exist.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | iPadOS Safari honours `@page { margin }` as macOS WebKit does (measured: left/top margin 54 pt for `0.75in`, 18 pt for `0.25in`) | Pattern 2, Pitfall 1 | Margins on the iPad differ; the whole layout width shifts. Needs Mark's iPad PDF |
| A2 | The 0.8 pt/px WebKit print scale and 675 x 900 px content box hold on the iPad (evidence: text metrics equal to the iPad PDF at default margins) | Pitfall 1 | Log-page fit and column widths mis-tuned |
| A3 | Log-page content heights from `measurements.json` (905 and 915 px of content plus a 22 px foot) transfer to WebKit print scale | Pitfall 3 | The fit margin could be larger or smaller; spike before locking |
| A4 | `window.print()` from a button works in iPadOS Safari (otherwise the user uses Share, Print) | Print route | Print control needs a fallback sentence |
| A5 | Proposed names: `drafts` store, `versionId` key, `saveDraft` / `getDraft` / `deleteDraft` / `listDrafts`, `sheetCode.js`, `printedContent`, `axesForVersion`, derivation tag string | Patterns 1 and 5 | Cosmetic; planner may rename |
| A6 | 250 ms debounce is short enough that flush-on-`pagehide` covers the rest | Pattern 5 | Last keystrokes lost on a very fast reload; verify with a reload test |
| A7 | A non-cryptographic 40-bit hash is enough for a personal library | Don't Hand-Roll | Collision between two versions; handle length > 1 in the lookup page |
| A8 | `clear: both` on the Instructions gives the sketch's placement without a large gap | Pattern 3 | Visible white gap on page 2; test on real content |
| A9 | The r8 Safari rule carries over to the three-column print table with As made first (it was swept on the on-screen table) | Pattern 4 | Re-run the offset sweep on the final DOM |
| A10 | Firing the first-load `PageStatus` with `persist: true` is the right behaviour for the "draft kept" notice | Pattern 5 | Notice lingers or vanishes too soon; wording is Mark's or Impeccable's |

## Open Questions

1. **The foot on every page, and "Page n of m".**
   - Known: Safari cannot repeat a foot or number pages by CSS (Pitfall 2). Sketch 010 leaves the code and page count as placeholders; brief § 6 wants the foot on every page; D-07a puts the two log pages first so their numbers are known.
   - Recommendation (put to Mark): in-flow foot with the Sheet code at the bottom of both log pages and at the end of the Sheet; label the log pages by what they are ("side 1 of 2") instead of a total; add Chrome-only page numbers on flow pages only if he wants them. Mark's call.

2. **Do the log pages fit in Safari?** Needs a spike in `wkprint` and a decision: pin `@page` margin near 0.25 in, or a WebKit-only scale on the log pages, or fewer lines. Mark should confirm what his printer clips.

3. **Surfaces with no approved design.** Sketch 010 covers the paper only. There is no approved board for: the print route on screen (the line stating recipe, version line, saved date and code, the Print control, the 393 view that D-04 says the canvas decides), the Search page with the Sheet code field and its no-match line, Home's short link and open-draft line (D-18; which recipe or version it names is open), the draft-kept notice wording. Either Mark/Sid draws them, or Impeccable shapes them, or the planner uses existing tokens and patterns as discretion. Ask before planning those plans.

4. **Amend drafts and routes.** Restore an amend draft only on its batch's route, or navigate there? (Pitfall 6.) Recommended: restore wherever the version page opens only for plan and record drafts; for amend, link Home's draft line to the batch route and restore only there.

5. **D6 timing.** Approved or not? If not, keep it out of the draft payload and the log pages (D6 section).

6. **`DB_VERSION` semantics.** Confirm with Mark that no real recorded data lives in his browser store (reset is acceptable) or choose the guarded additive upgrade (Pitfall 7).

7. **Which fields hash into the code** (Pattern 1), in particular whether Balance's printed figures or the embedded coefficients count. Discretion, but one-way once printed.

8. **Option C bookkeeping.** The 2026-10-07 answer is not in CONTEXT.md, the debug record or Mark's List; the orchestrator should record it (and the CONTEXT D-06a note that "Safari print" is now decided).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests | yes | v24.21.0 | — |
| npm, Vite, Vitest | build, tests | yes | `npm --prefix app test`: 1926 passed | — |
| Swift toolchain | `wkprint.swift`, PDF tools | yes | Swift 6.3.3 | — |
| macOS WebKit (Safari) | WebKit print harness | yes | macOS 26.5, Safari 26.5 | — |
| Google Chrome | Chrome PDF, 03.7 print probe | yes | 154.0.8037.98 | — |
| playwright-core | print probe, ad hoc PDF scripts | yes, in an npx cache | 1.63.0 at `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core` | install into a scratch dir |
| Mark's iPad (Safari, WebKit) | iPad PDF proof, keyboard UAT (D-21) | manual | — | none: this is device proof |
| Mark's `vite preview` on :4173 and sketch server on :8077 | — | running | — | never kill, never write to `app/dist`; build to a scratch `--outDir` and preview on another port (done this session on :4611 and :4601, both stopped) |

**Missing with no fallback:** the iPad cannot be driven from here; its PDF and its keyboard behaviour are Mark's.

## Security Domain

`security_enforcement` is on (ASVS level 1, block on high).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | single-user local app, no accounts |
| V3 Session Management | no | none |
| V4 Access Control | no | none (no server) |
| V5 Input Validation | yes | `normaliseCode` strict alphabet and length; `draftMatchesVersion` on restore; route params through `encodeURIComponent` (`notebookPath`) |
| V6 Cryptography | no (not security) | the code is an identifier, not a secret; no `crypto.subtle` dependency |
| V8 Data Protection | yes (low) | drafts are on-device IndexedDB only, outside export; no network call added (privacy constraint, TRUST-01) |
| V14 Configuration | n/a | — |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored markup rendered from a draft or note | Tampering / XSS | render as text; no `dangerouslySetInnerHTML` (project rule, already enforced by tests and convention) |
| Corrupt or foreign draft object crashes the page | DoS (self) | shape validation before restore, delete on mismatch |
| Crafted route param (`/print`, code input) used to build a path | Tampering | `notebookPath` encodes every segment; the code input never reaches a path or markup unvalidated |
| Drafts surviving an import that replaced their version | Integrity | validate on restore |

## Sources

### Primary (HIGH confidence, read or measured this session)
- `app/src/store/db.js`, `repository.js`, `seed.js`, `router.jsx`, `main.jsx` (read in full)
- `app/src/ui/RecipePage.jsx` (lines 1-630 and 631-1230, 1375-1475, 1500-1760, 1885-2292), `RecipeList.jsx`, `Placeholder.jsx`, `notebookPaths.js`, `VersionRow.jsx` (lines 390-441), `FormulationNote.jsx`, `Headnote.jsx`, `GraduatedRule.jsx` (1-100), `Segmented.jsx`, `tabindex-scan.test.js` (1-120)
- `app/src/domain/battery.js`, `axes.js`, `lineage.js` (1-200), `batch.js` (code, comments stripped), `id.js`, `recipe.js`
- `app/src/styles/app.css` 2354-2434, 2526-2640, 2795-3085; `css-source.js`; `cross-cutting.test.js`, `tokens.test.js` (relevant parts)
- Sketch 010 `README.md`, `CONTRACT.md`, `measurements.json`, and the diff between `as-built-sheet-letter.html` and `sheet-balance-col2.html`
- `.impeccable/surfaces/route-print-recipe-sheet.md`, `.planning/debug/safari-print-ingredient-table.md`, `04-CONTEXT.md`, `REQUIREMENTS.md`, `ROADMAP.md` Phase 4, `STATE.md` carries
- WebKit and Chrome experiments run this session with `wkprint.swift` (recompiled into the scratchpad) and Chrome 154 via `playwright-core`: margin and scale, fixed foot, named pages, margin boxes, `height: 100%` fixed pages, `100vh`, fill-to-page, float for Balance (WebKit and Chrome), r8 plus float. Nothing under `app/` was changed; a build and preview ran in the scratchpad and were stopped.

### Secondary (MEDIUM confidence)
- developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle (secure-context sentence, fetched)
- www.crockford.com/base32.html (alphabet and decoding rules, fetched)
- `~/Documents/projects/old-sprinkles/src/domain/sheet-codes.js` (alphabet and grouping only)

### Tertiary (LOW confidence)
- iPadOS-specific behaviour beyond the one iPad PDF Mark supplied (A1, A2, A4) is [ASSUMED].

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (no change; read from `package.json`)
- Architecture: HIGH for the code structure; MEDIUM for print layout (measured on macOS WebKit and Chrome, iPad pending)
- Pitfalls: HIGH for 2, 4, 5, 7, 8 (measured or read); MEDIUM for 1, 3 (scale inference to iPad and to the log pages)

**Research date:** 2026-10-06
**Valid until:** about 30 days; re-measure the print findings if Safari or iPadOS updates, and after Mark answers the open questions

## Suggested plan shape (for the planner to adopt or reject)

1. Shared Button, Checkbox, Radio and migration; scan test and per-component counts updated (43 / 3 / 2); `.claude/CLAUDE.md` convention line extended. First, because new controls are born on it.
2. Domain: `sheetCode.js` with golden vector, normalisation, lookup, `printedContent`; `axesForVersion`.
3. Store: `drafts` object store, repository methods, `DB_VERSION` decision, `db.test.js`.
4. Draft wiring in `RecipePage` (restore, persist, delete, drop the leave warning), `PageStatus` notice, `draftMatchesVersion`.
5. Search route code entry and Home link and draft line (after Open Question 3 is answered).
6. Print route: route and Print sheet link, `print.css` (page, chain, table variant, Balance float, Safari branch), formula and Instructions sections with fill-to-page, two log pages, in-flow foot. Spike the log-page fit and the iPad margin first.
7. D6 mark-one, only if approved.
8. D-20 screen-reader items (deviation words in the rule's name, list role on the steps, document title, live announcement; headings already done) and the end-to-end keyboard UAT (D-21), plus Mark's iPad PDF.
