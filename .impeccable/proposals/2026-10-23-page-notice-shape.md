# The page notice after a save: where it should appear, and how big

Sid, 2026-10-23. From Mark's List row `bug-save-notice-covers-title-393` and Mark's note on it ("a different kind/shape of notification toast? push up from the bottom? always the same way no matter what triggered? a larger card so it is more visible?"). Decision row: `decide-page-notice-shape`. Board: Sprinkles canvas, page "Page notice shape", board `Notice_Shape` (generator `.planning/canvas-generators/noticeshape.py`; measures `noticeshape-capture.mjs`, `noticeshape-measure.mjs`, `noticeshape-options.json`; screenshots `noticeshape-shots/`). Nothing under `app/` is touched here; each option ends in the change set a `/gsd-quick` would make.

## 1. Inventory: every transient status the app shows

Measured in Playwright WebKit on a scratch build (`npm run build --outDir <scratch>`, served on a throwaway 127.0.0.1 port by the 03.5 probe harness; never the :4173 preview, never a dev server), 1366 × 1024 and 393 × 852, coarse pointer, Olive Oil v1, Record a batch, churn date, Save batch at the pen foot.

**The page notice** (`PageNotice.jsx` on the Notebook and creation routes; `PageStatus` in `router.jsx` on the recipe route; both draw `.page-status` inside `.page-status-anchor`). One per page, out of flow, `role="status" aria-live="polite"`, 13px grotesk (`--sheet-type-control`) in the Sheet's ground with a 1.5px ink border, 6 / 12 px padding, 5 s unless the caller passes `persist`, hidden in print. Under the sticky bar at the end edge, inset by `--gap-page` (48, 20 below 724); below 724 the bar is static and scrolls away, so the anchor sticks to the window's top. Triggers:

| Trigger | Words | Where it is raised | Stays |
|---|---|---|---|
| Save batch (first save or Correct) | "recorded 24 Oct 2026" | `useBatchRecording` via the route's `onPageStatus`; survives the navigation to the batch route | 5 s |
| Save as a new version / save edits | "Version saved." | `useVersionPen` | 5 s |
| Leaving a pen with ink (Phase 10 kept drafts) | "Draft kept. Cancel discards it." | `useKeptDraft`; suppressed right after Start on the creation route | 5 s |
| Discarding a kept draft from the Notebook | "Draft discarded." | `NotebookPlace` | 5 s |
| Import pressed while a pen or a creation draft is open | "Close the open pen before importing." / "Cancel the new recipe draft before importing." | `Shell.refuseImport` → the route's registered notice, else the Shell's own `PageNotice` | 5 s |
| The local store cannot open | "Could not open the local store. Try reloading." | `CreationPage`, `NotebookPlace`, `Shell` | 5 s |

**Not the page notice** (left as they are; they live where the act is, per the batch brief's three scopes):

- `.form-status` (record body, above the ceremony; `VersionRow`, `RecipeBand` rename form): the pen's refusals, "Check the marked measurements. Your entries have been kept.", "Check the churn date. …", "Couldn't save the batch. Try again.", "Check the version. …". 5 s, prose measure, control size.
- `.save-ceremony__status` (`PenFoot`) and `.tasting-status` (`BatchRow`): the tasting removal toasts with Undo, "Tasting removed." / "… You can restore it." / "Tasting restored.". 5 s; Undo persists.
- `.ing__count`, `.pick__none`, `.place__note` (Ingredients place, the picker, Sheet code search) and the Sheet's visually-hidden status: live counts and results, not transient.

**As built after Save batch, measured.** The brief's sentence (`route-recipe-batch.md` § 3: "recorded 4 Aug 2026 against 50 g oil · 800 g") is not what the app says: the notice reads "recorded 24 Oct 2026" with no "against …" tail. A separate wording finding, not part of this decision.

| | 1366 | 393 |
|---|---|---|
| Save batch (pen foot) before the click | page y 3,978, 92 × 44 | page y 4,818 |
| Scroll the save leaves | 0 (the batch route opens at the top) | 2,886 (the browser scrolls the focused Batch heading into view) |
| Notice box | 161 × 30 at 1157, 63 (6 px under the bar, 48 px from the edge) | 161 × 30 at 212, 6 (the bar scrolled off; 760 px above the tab row) |
| Focused element | the Batch heading, 505 px below the notice | the Batch heading, 368 px below the notice |
| What the notice covers | the Version fold control ("Version · Hide details", 161 × 16) | step 8's text ("Emulsify the oil, cold.", 161 × 22); scrolled to the top, the recipe name (161 × 20, the bug as filed) |
| Clears | 5 s | 5 s |

So the bug is two things: at 1366 the notice already covers a control (the Version fold row), which quick 261021-07s did not see because it checked the creation route, where nothing sits at the band's end edge; and at 393 the notice sticks to the window's top and covers whatever is there, the recipe name when the page is at the top.

## 2. Assessment against DESIGN.md and the brief

The rules that bind: the notice is App context (D17 palette: ground, ink, the one text blue for actions; no colour as a verdict); "nothing moves", so the notice overlays and never reflows; it never takes focus (focus lands on the saved record's heading); the 16px Field Rule names 16 as the size a coarse pointer reads; the hand is never used for app text; Operate mode: the world lends type, palette and density, never a layout the maker has to find. The batch brief asks for one page-level confirmation on every completing save, where the page shell decides its place and look. Mark's note adds: one behaviour for every trigger, visible where the eye is, larger.

Where the eye is after Save batch is not the Save button: at both widths the save navigates and the browser moves the viewport (to the top at 1366, to the focused Batch heading at 393). The eye follows focus to the Batch heading. Any overlay covers something; the question is what it may cover and whether its place is the same at every width and for every trigger.

| Option | 1366 covers | 393 covers | Same place everywhere | Reads at coarse |
|---|---|---|---|---|
| A as built | the Version fold control | step text; the recipe name at the top | no (under the bar from 724; the window's top below) | 13 px |
| B card from the bottom edge, centred, 16 px | the Balance region's last figure row (Fat, 20 px above the window's foot) | the log's own "Recorded 24 Oct 2026" line, 20 px above the tab row; 279 px below the focused heading | yes, one rule at every width; the tab row inset is the only phone step | 16 px |
| C band from under the bar, 16 px | the recipe name and the Version fold control | step text; the recipe name at the top | nearly (the bar scrolls off below 724) | 16 px |
| D larger card where it is, 16 px | the Version fold control, more of it (204 × 50) | step text, the recipe name at the top (204 × 40) | no, as A | 16 px |

**Recommendation: B.** A bottom-edge card is the one shape that never covers the band, a control or the focused heading at either width: at 1366 it sits over the Sheet's last Balance figure for five seconds, at 393 over the log's own "Recorded" line, which says the same thing as the notice. It is one rule for every trigger (the import refusal, a saved version, a kept draft all land in the same place, which is also where the pen foot's Save and Cancel were a moment earlier at 393), its 16 px text meets the Field Rule's coarse-pointer size, and it stays 312 / 279 px from the focused heading, so it reads without competing with the record the maker's attention belongs on. C is the worst, covering the recipe name at both widths; D keeps A's faults and enlarges them. The costs of B: the 5 s overlay sits near the thumb's resting place at 393 (it is not interactive, so a tap through it does nothing until it clears) and its centring means the pill no longer lines up with any bar tool, which was decision 23's reason; decision 23 was made on the creation route, where the import refusal is the only trigger, and the finding above (A covers the Version fold at 1366) retires that reason.

What Mark must decide: the shape (A to D), and whether the 5 s hold is enough at 16 px or should become 6 (not measured; no evidence either way).

## 3. The change set per option (for `/gsd-quick`; tokens only; `app.css` only)

Every option keeps `PageNotice.jsx`, `router.jsx`'s `PageStatus`, the registrar and the 5 s rule. No new component, no `hidden` attributes, nothing under `app/` edited here.

**A, keep as built.** Close `bug-save-notice-covers-title-393` as not a bug or defer; DESIGN.md's page-notice entry gains the 1366 finding (covers the Version fold control) as a known cost.

**B, a card from the bottom edge (recommended).** In `app.css`:

1. `.page-status-anchor`: `position: fixed; inset-block: auto 0; inset-inline: 0` (replacing `position: sticky; inset-block-start: var(--app-size-header-h)`); keep `z-index: var(--app-z-notice)`. The phone-block override `inset-block-start: 0` goes.
2. `.page-status`: `inset-block-start: auto; inset-block-end: var(--gap-m); inset-inline: 0; margin: 0 auto; width: max-content; max-width: min(var(--measure-prose), calc(100vw - 2 * var(--gap-page))); box-sizing: border-box; padding: var(--gap-s) var(--gap-m); font-size: var(--sheet-type-note); line-height: var(--sheet-leading-note)` (replacing `inset-block-start: 0; inset-inline-end: var(--gap-page); margin-block-start: var(--gap-xs); padding: var(--gap-xs) var(--gap-s); font-size: var(--sheet-type-control)`).
3. In the phone-forms block (max-width 723.98px): `.page-status { inset-block-end: calc(var(--app-size-tab-h) + var(--gap-m)); }` so it clears the tab row.
4. The three comments above those rules say the new place and cite this proposal; the print rule (`display: none`) stays.
5. `shell.test.js` pins the stacking order (page, notice, scrim, fly-out, import errors, bar): unchanged, since `--app-z-notice` is unchanged. The sticky-anchor test, if one reads `position: sticky`, moves to `fixed`.
6. DESIGN.md "The page notice" entry and sketch 013 README decision 23: the notice rises from the bottom edge, centred, 16 px; the Notebook and creation boards that still draw it under the bar are redrawn when next touched.
7. Measured in WebKit at 1366 and 393 after Save batch and after an import refusal; the iPad check is Mark's (device-unverified until then).

**C, a band from under the bar.** `.page-status`: `inset-inline: 0; max-width: none; margin: 0; padding: var(--gap-s) var(--gap-page); border-width: 0 0 var(--rule-baseline); font-size: var(--sheet-type-note); line-height: var(--sheet-leading-note)`. The anchor stays. Doc edits as B's 6 and 7.

**D, a larger card where it is.** `.page-status`: `padding: var(--gap-s) var(--gap-m); font-size: var(--sheet-type-note); line-height: var(--sheet-leading-note)`. Nothing else. Doc edits as B's 6 and 7.

## 4. Device-unverified

Every number above is WebKit on the Mac, 1366 and 393, coarse pointer. Mark's iPad (WebKit, 1366, coarse) and iPhone are unmeasured; the tab-row inset at 393 and the fixed anchor's behaviour while the iOS keyboard is up (B) are the two things to look at there.

## Mark's answer (2026-10-24): B, styled as the Page

On `decide-page-notice-shape` Mark chose **B**, the card rising from the bottom edge, with this note: "I prefer the card from the bottom, but not styled like the Sheet. the same color background loses the card against the sheet. should it be styled in the Page instead?" And today: "Sid should redraw the B card in Page styling." Decided: B's geometry, size and placement as drawn (centred at the bottom edge, 16 px text, 12 / 20 px padding, 20 px above the window's foot or the tab row; one place for every trigger), in the App context's skin. Board `Notice_Shape` redrawn (canvas page "Page notice shape"): A as built, **BS** (Page skin with a shadow, the proposal), **BP** (Page skin flat) and B as drawn on 2026-10-23 in the Sheet's skin; C and D are off the board. Row `look-page-notice-card-page-styling`.

**He is right on the facts, and the Page's ground does not fix it on its own.** Measured in WebKit on a scratch build with each option's rules injected after Save batch (`noticeshape-measure.json`, `colours`; WCAG contrast from the computed colours): the Sheet-skin card's ground is the paper's own colour, 1.00:1 against the Sheet at 1366 and 1.07:1 against the App ground at 393, so only its ink border (17.2:1 / 18.4:1) drew it. In Page tokens the card's ground (`--app-background`, white) is 1.07:1 against the Sheet and 1.00:1 against the App ground, and the row hairline in `--app-divider` is 1.32:1 against the paper and 1.41:1 against white. So a flat Page card (BP, the Import error panel's grammar exactly) stands off the Sheet by a faint hairline and off the App ground by nothing but its radius. What lifts the card is a shadow: BS reads as a thing on top of the page at both widths. The App is otherwise flat (DESIGN.md, Elevation: only the fly-out carries a shadow, `--app-shadow-flyout`, with "what floats casts" as the rule), and the notice is App context, so the Sheet-Is-Flat rule does not bind it; BS makes it the App's second shadowed floater. Text on the card 18.4:1 (`--app-text` on `--app-background`).

**Tokens (the Page skin).** Ground `--app-background`; ink `--app-text`; rule `--app-rule-row` solid `--app-divider` (the Import error panel's hairline); radius `--app-radius-control` (the one App radius, 10 px); shadow **`--app-shadow-notice`**, which does not exist yet: proposed in `tokens.css` beside `--app-shadow-flyout` as `0 4px 16px rgba(20, 20, 20, 0.18)`, the fly-out's blur and alpha cast downward instead of sideways (the fly-out's `4px 0 16px` is an edge shadow for a side panel and would read wrong under a centred card). One new token, no literal outside `tokens.css`. The type stays `--sheet-type-note` 16 px on `--sheet-leading-note`, as B was drawn: the App has no 16 px prose token of its own, and the Field Rule's coarse-pointer floor is what the size answers (if the token rename of the two contexts lands first, the App's name for 16 px replaces it).

**The change set for B, revised (for `/gsd-quick`; `app.css` and one line in `tokens.css`).** Replaces § 3's B items 1 to 4; items 5 to 7 stand.

1. `tokens.css`, App context: `--app-shadow-notice: 0 4px 16px rgba(20, 20, 20, 0.18);` with the comment "the page notice's shadow: the fly-out's blur and alpha cast downward (decide-page-notice-shape, Mark 2026-10-24)".
2. `.page-status-anchor`: `position: fixed; inset-block: auto 0; inset-inline: 0` (replacing `position: sticky; inset-block-start: var(--app-size-header-h)`); keep `z-index: var(--app-z-notice)`. The phone-block `inset-block-start: 0` override goes.
3. `.page-status`: `inset-block-start: auto; inset-block-end: var(--gap-m); inset-inline: 0; margin: 0 auto; width: max-content; max-width: min(var(--measure-prose), calc(100vw - 2 * var(--gap-page))); box-sizing: border-box; padding: var(--gap-s) var(--gap-m); font-size: var(--sheet-type-note); line-height: var(--sheet-leading-note); background: var(--app-background); color: var(--app-text); border: var(--app-rule-row) solid var(--app-divider); border-radius: var(--app-radius-control); box-shadow: var(--app-shadow-notice)` (replacing `inset-block-start: 0; inset-inline-end: var(--gap-page); margin-block-start: var(--gap-xs); padding: var(--gap-xs) var(--gap-s); border: var(--rule-baseline) solid var(--sheet-ink); background: var(--sheet-ground); color: var(--sheet-ink); font-size: var(--sheet-type-control)`). `.page-status:empty` keeps `padding: 0; border: 0` and gains `box-shadow: none`.
4. Phone block (max-width 723.98px): `.page-status { inset-block-end: calc(var(--app-size-tab-h) + var(--gap-m)); }`.
5. The comments above those rules name the new place and skin and cite this section; the print rule (`display: none`) stays; `shell.test.js`'s stacking order is unchanged (`--app-z-notice` unchanged); a sticky-anchor assertion, if any, moves to `fixed`.
6. DESIGN.md: "The page notice" entry rewritten (a card from the bottom edge, centred, 16 px, in the App's ground with the row hairline, the control radius and `--app-shadow-notice`; one place for every trigger); Elevation & Depth: the notice joins the fly-out as the second thing that floats and carries a shadow. Sketch 013 README decision 23 superseded.
7. Verified in WebKit at 1366 and 393 after Save batch and after an import refusal: the card's box, colours and shadow as `noticeshape-measure.json` records BS; nothing covered that was not covered on the board; the iPad and the iPhone are Mark's (the tab-row inset and the fixed anchor under the iOS keyboard are the two things to look at).

The fix lands by `/gsd-quick` once Mark has looked at the board (`look-page-notice-card-page-styling`), and that quick closes `bug-save-notice-covers-title-393`. If he would rather keep the App flat, BP is drawn on the same board and is the same change set without item 1 and the `box-shadow` declaration.


## Mark's approval (2026-10-25): BS

On `look-page-notice-card-page-styling` Mark wrote "Approve BS". The revised change set above (items 1 to 7, with the shadow token) goes to `/gsd-quick` on 2026-10-25; that quick closes `bug-save-notice-covers-title-393`.
