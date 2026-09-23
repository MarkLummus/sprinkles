# Phase 4: Prepare the next version for making - Context

**Gathered:** 2026-09-22
**Status:** Ready for planning — after the Claude Design prerequisite below is met

<domain>
## Phase Boundary

The maker prints a saved version as a bench sheet from its own route, carries it to the kitchen, and uses the short code on the sheet to reach the same version in the app. Every pen's draft survives a reload. The whole loop (review, develop, record, print) is keyboard-operable on desktop and on the iPad, with visible labels and focus, AA text contrast, and nothing conveyed by colour alone. Requirements: PRINT-01…05, UX1-01…03.

The approved surface brief `.impeccable/surfaces/route-print-recipe-sheet.md` (confirmed 2026-09-16) already fixes the sheet's content, page sequence, batch-log split, black-only print, derived code format and anti-goals. This context records only what was still open, plus one amendment to that brief (D-05).

Out, and named by the brief: QR codes, the print-log nudge, any mode picker, publishing output, printing a batch record or show-changes, scaling.
</domain>

<decisions>
## Implementation Decisions

### Design authority for the sheet (prerequisite to planning)
- **D-00 (Mark, 2026-09-23, overrides the canvas drawings below):** The design canvas is initialised from the **current state of the built app**, never drawn fresh from a brief. The "Print formats" page now opens with two artboards captured from the production build (real markup, the app's own stylesheet): `AsBuiltRecipePage.dc.html` (the recipe page at 1280) and `PrintStartingPoint.dc.html` (the same sheet alone at letter width, no print design; the app has none beyond hiding the save notice and the hand's fallback). Mark designs the print by changing that starting point in Design; **the difference between the capture and his edits is Phase 4's print work**, and whatever he leaves unchanged is what the app already does, so judging the build against the canvas cannot flag correct existing code as a failure. The pages drawn 2026-09-22/23 from the brief's prose moved to the canvas page "Superseded print drafts" and are not a target.
- **D-00a:** Example of the drift D-00 names: the canvas pages carried a "Formula" heading that exists nowhere in the built app. The app itself is not changed.
- **Canvas:** the bench sheet is drawn on the "Print formats" page of Mark's Sprinkles canvas, https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq (five letter pages plus the route at 1280 and 390). Awaiting Mark's approval, then the D-02 snapshot.
- **D-01:** The bench sheet is drawn on a **Claude Design canvas** (Artifact type "Design"), not by `/gsd-sketch`. It is drawn and approved by Mark **before** `/gsd-plan-phase 4`.
- **D-02:** Once Mark has shaped the print starting point and approved it, the canvas's HTML is **snapshotted into the repo as `.planning/sketches/010-bench-sheet/`**, together with the as-built capture it started from so the delta is explicit, and that snapshot is the acceptance target, read as a structural contract (elements, placement, states, text, CSS), as with sketches 007/008. Planner, checker, executors and UAT read the snapshot, never a prose paraphrase of it. — **Reversibility:** costly — every plan's acceptance criteria cite it.
- **D-03:** The canvas takes its values from Mark's **"Sprinkles Design System"** artifact (https://claude.ai/artifact/M7LkrAkNQYA897PpKnjjzU). Before drawing, check it against `app/src/styles/tokens.css` and `DESIGN.md` (the 2026-09-21 approvals: Sheet/App contexts, `sheet-*`/`app-*` prefixes, the hand in Caveat) and flag any drift to Mark. The build still reads every value through `tokens.css`; the design system does not become a second token source.
- **D-04:** The on-screen sheet route at phone width (393) is **decided by the canvas**: the Claude Design drawing must include a 393 view, and the build follows it.

### Print formats (Mark, 2026-09-23)
- **D-22:** Printing has **two formats** because their uses differ: the **Notebook format** (the bench sheet, for developing a recipe: ingredient lines per portion with tick boxes, as-made column and % of batch, the full method, the two-sided batch log) and the **Recipe book format** (one page, for making a finished recipe: whole amounts, lean method with targets, and **no batch or tasting log**, Mark 2026-09-23). **Phase 4 builds the Notebook format only.** The Recipe book format is designed now on the canvas ("Print formats" page, `RecipeBookSheet.dc.html`) and built in a later phase. The sheet route must leave room for a second format without building a switcher (the brief's § 7 "modes" rule stands).
- **D-22a:** Open for the later phase, not decided here: whether one version's two formats share one sheet code. D-08 derives the code from "printed content"; for two formats to match back to the same version, the derivation should read the version's recipe content, not the format's layout. Planning for Phase 4 should derive from content that both formats share, so the rule does not need to change later.

### Sheet wording and pagination
- **D-05:** The version row's print control reads **"Print sheet"** (D17 "Sheet"; closes `route-recipe.md` § 7's open item).
- **D-06:** "Before you start" prints **once**, at the head of the method; it does not repeat when the method breaks onto a second sheet.
- **D-07:** **Letter portrait only.** No A4, no size choice.
- **D-07a (amends the brief's § 3 sequence, Mark 2026-09-23 on the canvas):** The **batch log prints first**, as pages 1 and 2, then the formula page, then the method. The log's two sides then always land on one sheet, front and back, however many pages the formula and method run to; a fixed blank page would break whenever the page count before the log changed parity, and browsers do not reliably honour right-hand-page print rules. The log sheet can also be pulled off the front of the stack and taken to the machine. — **Reversibility:** reversible — page order only.

### Short code
- **D-08 (amends the brief's § 7 "derived from the version id"):** The code is derived from the **version id plus the version's printed content**. The same content always yields the same code, reprints of an unchanged version match, and nothing is stored. After a **Save over** (possible on a version with no batch, `lineage.js` / `canSaveOver`), a reprint carries a new code and a sheet printed before the save matches no version — honest, because the content it was made from no longer exists. Alphabet and grouping stay as the brief says: Crockford base32, `XXXX-XXXX`; no random nonce. — **Reversibility:** one-way — once sheets are printed and in the binder, changing the derivation strands every code already on paper.
- **D-09:** Matching back is a lookup computed over the stored versions (no index, no stored code). Entry accepts the code with or without its hyphen and in either case (Crockford's own normalisation).
- **D-10:** Code entry lives in **both** places: the rail's **Search** route (currently a placeholder) holds the field, and **Home** carries a short link to it. This replaces the brief's "on the recipe list beside export and import", which predates the "Active work first" Home.
- **D-11:** The field is labelled **"Sheet code"**. The sheet's footer uses the same word beside the code.
- **D-12:** A match lands on **the version's page** (`/recipe/:id` at that version), where Record is one step away.
- **D-13:** No match reads, fact only: **"No version has this code."** No second line.

### Draft recovery (UX1-02)
- **D-14:** **All four pens** keep their draft through a reload: developing, recording, amending, tasting.
- **D-15:** On return, **the pen reopens with the ink** in pen blue, and a page notice beneath the running head (the existing `PageStatus`) says the draft was kept. Cancel still discards with no dialog.
- **D-16:** A draft lasts **until Save or Cancel**, stored through the repository seam (not `localStorage`/`sessionStorage`), so it survives a closed tab, a crash, or the next day. — **Reversibility:** costly — adds a store object and a `DB_VERSION` bump (currently 5); additive, no existing record reshaped.
- **D-17:** The browser's **leave warning is dropped** once drafts persist (it no longer protects anything, and it fires on reload).
- **D-18:** **Home names an open draft**: the active-work lead says a draft is open on that version and links to it, since one pen at a time means a forgotten draft keeps every other opener disabled.

### Keyboard and screen-reader close-out (UX1-01, UX1-03)
- **D-19:** The **shared Button component lands in Phase 4 as an early plan** (folded todo below): one component always carrying `tabIndex={0}`, with the checkbox/radio equivalent; migrate the 34 buttons, 2 checkboxes, 2 radios; pin each component on rendered markup with exact counts, as 03.4-14/15 did for links. New print-route and Search controls are born on it. Extend the `.claude/CLAUDE.md` convention from "every `<a>`" to every non-text control when it lands.
- **D-20:** Fix the carried screen-reader items **except the plain-language glosses**: Headnote and Margin region names become real headings; the rule's "contributing to" name is carried where it is announced and the deviation words enter the rule's accessible name; the method's ordered list gets an explicit list role; the tab title leads with the recipe name; a live announcement when a rule marks its rows. The PAC/POD/MSNF glosses (D11) are wording and go to Impeccable.
- **D-21:** End-to-end keyboard UAT runs on the desktop and on the iPad (WebKit, 1366, tap-then-Tab with Full Keyboard Access off), served from `build` + `preview --host`, never the dev server.

### Claude's Discretion
- The route path for the sheet. The brief names both `route:/print/recipe-sheet` (target id) and `/recipe/:id/sheet` (implementation consequence); the brief's `/recipe/:id/sheet` is the default unless planning finds a reason.
- The hash used to derive the code from id + content and exactly which fields count as "printed content" — must be exactly what the sheet prints, so a change that does not alter the paper does not change the code.
- Draft store shape and how each pen serialises its draft.
- How the four pens' existing `isDraftDirty` logic feeds persistence.

### Folded Todos
- **`2026-09-22-shared-button-component-carries-tabindex-for-webkit.md`** (gap G-03.4-r5-2, debug `.planning/debug/ipad-recipe-page-tab-skips-controls.md`). Deferred by Mark in 03.4 to a shared component; Phase 4 must verify UX1-01 end to end, which it cannot on the iPad without this. Folded as D-19.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### The sheet
- `.planning/sketches/010-bench-sheet/` — **acceptance target** once snapshotted from the approved Claude Design canvas (D-02). Does not exist yet; planning waits for it.
- `.impeccable/surfaces/route-print-recipe-sheet.md` — the confirmed bench-sheet brief: sequence, batch-log sides, blank-space thesis, footer, anti-goals, material states. § 7's "derived from the version id" is amended by D-08; § 4's code-entry placement is amended by D-10.
- `.impeccable/surfaces/route-recipe.md` — § 5 (superseded for the sheet by the brief above), § 7 open item on Print placement (closed by D-05).
- `.impeccable/surfaces/route-recipe-batch.md` — owns what the batch-log fields *say*; the sheet owns their geometry.
- `.impeccable/surfaces/route-recipe-version.md` — Save over / Save as new ceremony (context for D-08); the clean reading the sheet prints.
- `.impeccable/surfaces/route.md` — Home "Active work first" (D-10 link, D-18 draft line); § on the three paper frames.
- `DESIGN.md`, `PRODUCT.md` — world, contexts, the hand's print fallback; "paper works the kitchen".
- `product-requirements/05-domain-and-language.md` — field labels (retires Come-up/Draw/Overrun/Meltdown); D17 Sheet vocabulary.
- Sprinkles Design System artifact — https://claude.ai/artifact/M7LkrAkNQYA897PpKnjjzU (canvas source, D-03).

### Prior prototype (reference only, not to be built on)
- `~/Documents/projects/old-sprinkles/src/domain/sheet-codes.js` — Crockford alphabet and grouping only; its nonce is not carried over.
- `~/Documents/projects/old-sprinkles/src/styles/print.css`, `src/ui/BatchLog.jsx` — stale vocabulary and axis model.

### Requirements and state
- `.planning/REQUIREMENTS.md` — PRINT-01…05, UX1-01…03.
- `.planning/ROADMAP.md` — Phase 4 success criteria and notes.
- `.planning/STATE.md` — carried UX1-01 items (lines on Headnote/Margin headings, rule aria-label, list role, tab title, live announcement).
- `.planning/todos/pending/2026-09-22-shared-button-component-carries-tabindex-for-webkit.md` and `.planning/debug/ipad-recipe-page-tab-skips-controls.md` — D-19.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/router.jsx` — routes nest under `Shell`; the file already anticipates "Phase 4's print route" as an addition. `/search` is a `Placeholder` today (D-10's home for the code field). `PageStatus` is the page notice D-15 uses.
- `app/src/ui/BatchRow.jsx` — already splits the battery into churn and tasting sections; the batch log's two sides take that seam.
- `app/src/domain/battery.js` (`BATTERY_FIELDS`), `axes.js` — field and axis definitions the blank log prints from.
- `app/src/domain/lineage.js` — version identity line (`Version 3 · 40 g oil · 800 g`), `saveOverVersion`; `canSaveOver = batches.length === 0` in `RecipePage.jsx`.
- `app/src/ui/RecipePage.jsx` — `isDraftDirty` and the four pens' draft state (D-14…D-17).
- `app/src/domain/id.js` — version id generation.
- `app/src/styles/app.css` — the print layer's start: one top-level `@media print` block (hides `.page-status`, the hand's fallback). Phase 4 owns everything else in print.

### Established Patterns
- Every store access through `app/src/store/repository.js`; only `db.js` imports `idb`; `DB_VERSION` is 5.
- Domain math framework-free under `app/src/domain/`, tested in Vitest's node environment — the code derivation and lookup belong there.
- Every visual value through `tokens.css`; `@media print` blocks are top-level siblings, never nested.
- Every `<a>` carries `tabIndex={0}`, pinned per component on rendered markup (extends to all non-text controls with D-19).
- Notes and prose render as text; no `dangerouslySetInnerHTML`.
- One pen at a time; no dialogs; Cancel discards without confirmation.

### Integration Points
- Version row: the "Print sheet" control.
- Shell rail: Search gains its first real content.
- Home: a link to the code field and a line naming an open draft.
</code_context>

<specifics>
## Specific Ideas

- Mark asked to use Claude Design in place of a `/gsd-sketch` for the bench sheet.
- Draft restore should feel like the page simply kept the ink, not like a recovery prompt.
</specifics>

<deferred>
## Deferred Ideas

- **Recipe book print format** (D-22) — designed on the canvas, built in a later phase; todo `2026-09-23-build-the-recipe-book-print-format.md`.
- Plain-language glosses for PAC, POD and MSNF (D11) — wording for Impeccable, not code in this phase.

### Reviewed Todos (not folded)
Matched by keyword only; none is Phase 4 scope:
- `2026-09-16-second-staleness-pass-on-route-recipe-batch-md-reading-order.md` — Impeccable brief upkeep.
- `2026-09-17-an-amendment-announces-its-original-recording-date.md` — batch-record copy; quick task.
- `2026-09-17-design-md-responsive-ladder-understates-the-600px-step.md` — `/impeccable document`.
- `2026-09-22-board-170-drop-the-lead-page-preview-glyph.md` — Home board polish.
- `2026-09-22-overscroll-canvas-white-on-every-route.md` — shell polish.
- `2026-09-22-remove-the-sprinkles-home-link-from-the-recipe-route.md` — shell polish.
- `2026-09-22-settle-app-context-radius-then-revisit-rail-active-item.md` — design decision first.
- `2026-09-22-shorten-continue-developing-to-keep-developing.md` — copy quick task.
- `2026-09-22-three-impeccable-document-jobs-this-phase-hands-off.md` — Impeccable-owned.
</deferred>

---

*Phase: 04-prepare-the-next-version-for-making*
*Context gathered: 2026-09-22*
