# Batch Record & Tasting Battery — Structural Contract

This file is the settled structure of the full-battery record pen from sketch 007, packaged so the
Phase 03.3.1 planner, its task executors, and the checker never need to open the sketch HTML. It
documents STRUCTURE, TEXT, GEOMETRY, and BEHAVIOR only — visual face and colour stay with DESIGN.md
and the sibling findings files. Every label, option, status string, order, number, and lifecycle
rule below is byte-identical to the settled sketch HTML (`.planning/sketches/007-full-battery/index.html`),
whose settled state is applied by its init calls at lines 608–610 (`setCols(3)`, `setVariant('A')`,
`setTastingMode('hidden')`). Where the sketch's README or the sibling findings file disagree with
that HTML, the HTML governs and the disagreement is recorded in "Where sources disagree (HTML wins)".

## How to cite this contract

Plan tasks cite this file by section name and carry the verbatim strings each task needs — per task,
in the task's own text. Never defer to the sketch HTML; executor fragments are quoted from here, not
re-derived from the 33KB source. Checkers verify the built record against this file in the browser.
This file supersedes the sketch HTML as the reading surface. The sibling findings file
(`batch-record-tasting-battery.md`) carries the validated design decisions and CSS patterns this
contract does not repeat; DESIGN.md owns visual face and colour.

## Settled defaults

The sketch chrome selected state: variant A, 3-column axes, hidden tasting — the primary mode.
These are the defaults the phase plan builds.

- **Variant A**: the note ("How did it turn out?") sits before Texture & flavor (the axes and
  "Any problems?" row).
- **3-column axes** at desktop width, with the core/declared side-by-side split (see "Axes spec").
- **Hidden tasting as the primary mode**: the record opens with the entire Tasting section absent —
  no headline, no helper, no section rule. Always-visible stays a comparison mode, not the default.

Initial closed state (what a fresh record looks like):

- All fields blank. The churn date is blank in the app — the sketch's `2026-08-02` value is the
  working case's real date in the depiction only, never a default or example.
- Footer: Cancel | Save batch | Add tasting. Empty status line. Undo hidden.

Sketch chrome that is NOT the design — comparison devices and preview artifacts, never to be built:

- The `#variant-nav` toolbar: the variant tabs ("A: How did it turn out? before Texture & flavor",
  "C: How did it turn out? after Texture & flavor"), the "Axes: 1 column" / "Axes: 2 columns" /
  "Axes: 3 columns" buttons, the "Tasting: always visible" / "Tasting: hidden until added" buttons,
  the "Toggle 100px ruler" button, and the toolbar's comparison note.
- The 100px ruler (`.ruler`) — a measurement device.
- The two save-preview announcements: "This is a sketch. Your entries have been kept; nothing was
  saved." (both Cancel buttons) and "Sketch preview checked. Nothing has been saved; your entries
  remain here." (successful preview) — preview artifacts of the sketch, not strings to build.

## DOM order inventory

The pen, top to bottom, as the settled DOM reads:

**Batch — churned** section:

1. `Churn date` — date input (type=date). The sketch shows `2026-08-02`, the working case's real
   date in the depiction only; the app pen opens blank.
2. `Time to draw temp.` — numeric input, unit `min`.
3. `Out of machine` — numeric input, unit `°C`.
4. `Churn duration` — numeric input, unit `min`.
5. `Exit consistency` — segmented control, aria-label "Exit consistency", options: "Smooth ribbon",
   "Wet, soupy", "Chunky, separated".
6. `Airiness (estimated)` — segmented control, aria-label "Airiness (estimated)", options: "Low,
   dense", "Medium, standard", "High, airy".
7. `At the machine` — textarea, no placeholder.
8. `Ingredient notes` — textarea, placeholder "e.g. oil bottle opened 24 Jul".
9. The churn saves row (`#churn-saves`): Cancel | Save batch only. This row renders only while the
   Tasting section is on the page; it is hidden when the section is absent.

**Tasting** section head (in order):

- Heading: `Tasting` with helper "· optional" and helper "— leave anything you did not record blank".
- The tasting-status live region (`#tasting-status`, `role="status"`, `aria-live="polite"`) — sits
  beside the action, in the head.
- The undo head slot (`#undo-head-slot`) holding the Undo text control, label "Undo clear tasting",
  hidden until a removal is pending. The button is static in the head slot in the markup so init
  never finds it missing.
- The Clear/Remove text control (`#tasting-toggle-btn`): "Remove tasting" in hidden mode,
  "Clear tasting" in always-visible mode.

**Tasting body** (`#tasting-body`; variant A DOM order — the note sits before the axes):

1. The tasting field-row: `Tasted` (date input), `Tempering` (numeric, unit `min`), `Tasting
   temperature` (numeric, unit `°C`).
2. The note block: `How did it turn out?` — textarea, placeholder "e.g. flavor, texture, anything
   that stood out".
3. The texture block: the axes grid (`.axes-core` + `.axes-declared`, see "Axes spec"), then the
   defects group — caption `Any problems?` with the lowercase helper "select all that apply" beside
   it on one row, then the chip row (see "Controls spec").
4. The melt block: `Melt test (optional)` — numeric, unit `g lost at 20 min`; and `Melt style
   (optional)` — segmented control, aria-label "Melt style (optional)", options: "Watery, weeping",
   "Creamy puddle", "Stable foam".

**Shared Next time** label (`.next-time-shared`): textarea, placeholder
"optional — for the batch, the tasting, or both". No section-break rule sits above it — its own
underline is the only rule (the double-separator fix).

**Form-status live region** (`#form-status`, `role="status"`, `aria-live="polite"`) — at the foot,
above the footer saves row.

**Footer saves row**: Cancel | Save batch & tasting (label state-based, see the save matrix) |
Add tasting (hidden while the section is open) | the undo footer slot (`#undo-footer-slot`).

Both live regions — `#tasting-status` and `#form-status` — are `role="status"`, `aria-live="polite"`.

## Axes spec

The AXES array, verbatim from the sketch (index 4 Body and 5 Oil are the declared pair):

```
const AXES = [
  ['Hardness', 'soft', 'right', 'hard'],
  ['Scoopability', 'crumbly', 'right', 'gummy'],
  ['Smoothness', 'grainy', 'right', 'smooth'],
  ['Sweetness', 'less', 'right', 'more'],
  ['Body', 'thin', 'right', 'heavy'],
  ['Oil', 'faint', 'right', 'strong'],
];
```

Each row is `[name, low anchor, mid anchor, high anchor]`. Per axis:

- **Five stops** on one track: stop buttons carrying their digits 1–5, with
  `aria-label "{n}: {word}"` where the five words are the low anchor, "leaning {low}", "right",
  "leaning {high}", the high anchor — e.g. for Hardness: "1: soft", "2: leaning soft", "3: right",
  "4: leaning hard", "5: hard". The stops group carries `aria-labelledby` pointing at the axis
  name's id.
- **Anchors row**: only the three anchor words (low, mid, high), spaced `justify-content:
  space-between` across the track width, `aria-hidden="true"`.
- **Inline state text** beside the axis name: "(Not recorded)" when unmarked, "(N)" when marked
  (e.g. "(3)") — pen-faced when marked, muted italic when not.
- **Per-axis Clear** text control, `aria-label "Clear {name}"`, hidden until the axis is marked.
  Activating it returns focus to the scale's first stop and announces "{Axis name} cleared." to
  form-status. Clicking the same stop again also clears.
- **Core/declared split**: core = Hardness, Scoopability, Smoothness, Sweetness (indices 0–3);
  declared = Body, Oil (indices 4–5). In 3-column mode the declared column sits right of a vertical
  hairline (`.axes-rule`, graduation-weight, `aria-hidden`, positioned at `left: calc(200% / 3)` —
  between columns 2 and 3), and the "Declared for this recipe" caption sits inside Body's box above
  its head. When the groups stack, the split reverts to a horizontal rule above the declared group.
  Screen readers hear the cue as part of Body's box.
- **No defaults on load** — every axis unmarked; blank stays visibly blank.

## Controls spec

**Segmented controls** (three, each a `role="radiogroup"` with its group aria-label):

- "Exit consistency": "Smooth ribbon" | "Wet, soupy" | "Chunky, separated"
- "Airiness (estimated)": "Low, dense" | "Medium, standard" | "High, airy"
- "Melt style (optional)": "Watery, weeping" | "Creamy puddle" | "Stable foam"

**Defect chips**: a `role="group"` with aria-label "Any problems? Select all that apply", carrying
five native toggle buttons (`aria-pressed`): "Coarse, icy", "Sandy, gritty", "Gummy, elastic",
"Greasy film", plus the declared chip `Bitter` with the visible "· declared" helper suffix and the
full aria-label "Declared for this recipe: Bitter". The Bitter chip trails the row after a wider
gap (the `declared-flaw` margin) marking it as a different kind of thing.

**Date and numeric fields**:

- Non-date inputs carry `inputMode="decimal"`. Blank is always allowed.
- Decimal point and comma both accepted; a Unicode minus (−) is normalized to ASCII; negatives are
  rejected except on °C fields (a field is a temperature when its label's text includes "°C" —
  "Out of machine" and "Tasting temperature").
- Malformed values stay in place, marked `aria-invalid`, with a `.field-error` line appended inside
  the field's label and wired by `aria-describedby`; focus moves to the first invalid field; the
  status reads "Check the marked measurements. Your entries have been kept."
- The two error strings, verbatim: "Enter a temperature, such as −6, or leave blank." for °C fields;
  "Enter zero or a positive number, or leave blank." for all other numeric fields. Date inputs are
  exempt from numeric validation. Validation scope follows the save pressed: the churn row's save
  validates the churn section alone; the footer save validates the whole pen.

**Textareas**: notes grow with their content (height re-fits to the scroll height); `dir="auto"` so
RTL and multilingual text behave. Placeholders verbatim: "e.g. oil bottle opened 24 Jul"
(Ingredient notes), "e.g. flavor, texture, anything that stood out" (the note),
"optional — for the batch, the tasting, or both" (Next time). "At the machine" has no placeholder.

**Blank stays blank**: nothing is pre-picked — no stop, no segmented option, no chip carries a
default on load; clicking a selected stop, option, or chip again clears it.

## Save and save-pair matrix

| Tasting state | Churn row (`#churn-saves`) | Footer row | Undo placement |
|---|---|---|---|
| Section absent (hidden mode, nothing recorded) | hidden entirely | Cancel \| Save batch \| Add tasting | footer slot, trailing Add tasting, while pending |
| Section open (hidden mode) | Cancel \| Save batch only | Cancel \| Save batch & tasting | tasting head slot, while pending |
| Always-visible mode | Cancel \| Save batch only (stays) | Cancel \| Save batch & tasting (label fixed) | head slot, beside the action |

- **The state-based label rule**: the footer label keys on whether the tasting section is on the
  page (hidden mode AND the section not opened) — never on whether tasting fields hold values. An
  empty-but-visible tasting does not relabel the footer.
- Cancel comes first in both ceremonies.
- Add tasting opens the section and focuses the Tasted date.

## Feedback and undo lifecycle

Two status channels: `#tasting-status` beside the action in the tasting head, and `#form-status` at
the foot. Both `role="status"`, `aria-live="polite"`.

Status strings, verbatim, with their targets:

- "Nothing recorded to clear." → tasting-status. Empty tasting, always-visible mode; the section
  stays open.
- "Tasting removed." → form-status. Empty tasting, hidden mode; the section collapses, focus moves
  to Add tasting, and no undo exists (nothing to restore).
- "Tasting removed. You can undo this." → form-status. Tasting with data, hidden mode; the section
  collapses, focus moves to Add tasting, an undo exists.
- "Tasting cleared. You can undo this." → tasting-status. Tasting with data, always-visible mode;
  the section stays, focus moves to the Undo control.
- "Tasting restored." → tasting-status, after undo.
- "{Axis name} cleared." → form-status, from the per-axis Clear control.
- "Check the marked measurements. Your entries have been kept." → form-status, when a save hits an
  invalid measurement.

The removal/undo toasts self-clear after five seconds, guarded so the timer never wipes a newer
message written in the meantime (it clears only if the text is still the message it wrote). The
per-axis Clear and validation announcements write persistently — no self-clear.

**Removal path matrix** (empty vs data × visible vs hidden mode):

| Path | Toast (target) | Section | Focus | Undo exists? |
|---|---|---|---|---|
| Empty, visible | "Nothing recorded to clear." (tasting-status) | stays | unchanged | no |
| Empty, hidden | "Tasting removed." (form-status) | collapses | Add tasting | no |
| Data, visible | "Tasting cleared. You can undo this." (tasting-status) | stays | the Undo | yes |
| Data, hidden | "Tasting removed. You can undo this." (form-status) | collapses | Add tasting | yes (footer slot) |

**Undo placement rule**: the Undo lives in the tasting head slot while the section is visible, and
moves to the footer slot (trailing Add tasting) when the section is absent — a real DOM move, with
the button static in the head slot in the markup so init never finds it missing.

**Retirement scope**: any edit inside the tasting body retires a pending undo — inputs, textareas,
radio groups (the in-tasting guard scopes retirement to tasting-side groups), chips, and the
per-axis Clear. Never a churn-section edit or a Next-time edit. Every axes re-render also retires
it: the captured element references go stale on rebuild.

**Restore sequence**: undo reopens the section when the mode is hidden, restores the field values
and selections, re-fits the textareas, hides itself, focuses the Clear/Remove control, and
announces "Tasting restored." to tasting-status.

**Adding a tasting writes no announcement at all** — the section opening and the focus landing on
the Tasted date are the evidence; the status line is cleared instead, so a stale removal toast
cannot linger beside a visible section.

## Keyboard and tab order

- **Two axis DOM orders, one per arrangement.** Row-major flat for the 3-column desktop
  arrangement: Hardness, Scoopability, Body, Smoothness, Sweetness, Oil (tab order follows the eye;
  the hairline draws the core/declared boundary between columns 2 and 3). Core-then-declared
  grouped containers when stacked: Hardness, Scoopability, Smoothness, Sweetness, then Body, Oil.
  One DOM order cannot serve both, so the axes re-render per arrangement — a `matchMedia` listener
  on the 760px boundary re-renders on crossing. Marks are carried across re-renders, keyed by the
  axis name span's id.
- **Roving-focus radio contract** (axes stops and segmented options): `role="radiogroup"` /
  `role="radio"`, `aria-checked` on each option, one tab stop per group — the first option is
  tabbable when nothing is selected, the selected option otherwise. Arrow keys (Right/Down forward,
  Left/Up back), Home, and End move and select, with wrap; focus follows the selection. Clicking
  the selected option again clears.
- **Chips are native toggle buttons** with `aria-pressed`; the pressed affordance is bold plus
  underline (the same affordance the checked radio state carries).
- **Focus landings**: Add tasting → the Tasted date; per-axis Clear → the axis's first stop; empty
  clear → focus unchanged; data removal in hidden mode → Add tasting; data removal in visible mode
  → the Undo; undo after restore → the Clear/Remove control.

## Responsive ladder

The numbers, as verified in the browser:

- The pen is 640px wide (`max-width: 640px`).
- The 3-column grid applies from 761px up; the side-by-side core/declared split holds to 768px
  (browser-verified, 12px minimum stop-to-rule clearance).
- Desktop stops are 34×32 on the 186px track (5 × 34 + 4 × 4), anchors matched to the same 186px.
- Below 760px (`max-width: 760px`) the 3-column mode steps down: the axes collapse toward one
  column, the core and declared groups stack on the horizontal rule, and each group's grid becomes
  `auto-fit, minmax(min(100%, 280px), 1fr)` — collapsing further once two 280px columns no longer
  fit. Stops grow to 40×44 on the 216px track (5 × 40 + 4 × 4), anchors re-aligned to the 216px
  width. Chip toggles, segmented options, text controls, `.btn`, and `.ink-field` all take
  min-height 44px (buttons and ink fields added in the eighth round).
- A 600px block tweaks the frame padding, field-row label widths, and field font sizes, and lets
  the saves rows wrap.
- A `matchMedia` listener on `(max-width: 760px)` re-renders the axes on crossing the boundary.
- Zero horizontal overflow at 393px (verified). Desktop untouched at 768px (verified).

## Where sources disagree (HTML wins)

Each of these records what an older source says, what the settled HTML says, and that the HTML
governs:

1. **Tempering's section.** The findings file's field list and the ROADMAP's phase notes both place
   "tempering time" among the churn-phase fields; the settled HTML renders Tempering (unit min) in
   the TASTING field-row, between Tasted and Tasting temperature. The HTML governs: Tempering is a
   tasting field.
2. **Chip wording.** The findings file paraphrases the defects with ampersands ("coarse & icy");
   the HTML words them with commas: "Coarse, icy", "Sandy, gritty", "Gummy, elastic", "Greasy
   film". The comma wording is the design.
3. **Stop heights.** The findings file's CSS block shows stop height 24px; the settled HTML renders
   stops 34×32 on desktop (the hardening pass raised the height) and 40×44 below 760px.
4. **The step-down threshold.** The README's eighth round mentions "a new ≤720px rule that stacks
   the axis groups", but the shipped HTML's step-down rule is `@media (max-width: 760px)` with no
   720px block anywhere — 760 is the threshold.
5. **The churn textareas.** The findings file's churn field list omits "At the machine" and
   "Ingredient notes" entirely; the HTML carries both textareas in the churn section, and this
   contract's inventory includes them.

## Deferred to the phase plan (recorded, not built)

Each line is a carried item a plan task can lift:

- Drop the underline on filled controls (P3, seventh round's carried list).
- Name the two Cancels' scopes — in the real product Cancel discards the whole pen draft (D-24), so
  the scope naming is a persistence-contract decision, not a sketch label (P3).
- Undo adjacency in the wrapped tasting head (P3, eighth round).
- Visible words for intermediate stops (P3, eighth round).
- Data-based undo that survives resize (P3, eighth round) — today a pending undo retires on the
  axes re-render a breakpoint crossing triggers.
- The persistence contract for the two save scopes (churn-only vs combined).
- The matchMedia-under-emulation caveat — emulation tools may not fire the change listener; verify
  breakpoint behavior at real widths.
- The read-view summary line ("Soft (2) · grainy · bitter") belongs to the batch READ view, not
  this recording pen; the sketch has no saved/read state.
- The goldilocks-vs-descriptive-anchors question stays closed unless Mark reopens it; Scoopability's
  anchor wording (crumbly ↔ gummy) rides that decision.
- The flagged revisit of the removed "as expected, nothing to note" shortcut — it was a
  purpose-built disambiguator between "never tasted" and "tasted, nothing to add"; revisit once the
  record is in real use.

## Origin

Derived from the sketch HTML `.planning/sketches/007-full-battery/index.html` (615 lines; settled
state applied by init at lines 608–610), the README's eight rounds (dated 2026-09-11/12, with
browser verification the same days), and the sibling findings file
`batch-record-tasting-battery.md`. Written 2026-09-12 for Phase 03.3.1.

## Visual treatment (from the sketch CSS)

Added 2026-09-14 by Phase 03.3.1.1 research (CONTEXT.md D-02); re-cited the same day against
the committed ninth round (sketch commit `977846a`, 635 lines). This section is the contract's
visual layer: per control and caption, what the sketch's `<style>` block declares, with
`.planning/sketches/007-full-battery/index.html` line numbers (page shell lines are from
`003-front-matter-rows/index.html` and say so). Since 03.3.1.1 D-01 the live sketch HTML — not
this file — is the design authority; where a line below and the HTML ever disagree, the HTML
governs, and **where a section above this one and the HTML disagree, the HTML governs too** — the
ninth round changed strings and structure the sections above still describe in their 03.3.1 form;
"Superseded by the ninth round" at the end lists them. The sketch's `<style>` block is a cascade:
a later rule at equal or higher specificity overrides an earlier one, so each entry below gives
the *computed* result and cites every line that contributes. Sketch chrome (`#variant-nav`,
`.frame`, `.ruler`, `.recipe-placeholder`, lines 9–20, 109, 136, 138, 308) is not the design.

**Tokens the sketch reads** (`.planning/sketches/themes/default.css`, a copy of the app's
`tokens.css` values): `--ground #f7f7f4` (rgb 247 247 244), `--ink #141414` (rgb 20 20 20),
`--pen-blue #1f3d7a` (rgb 31 61 122), `--bookcloth #33513b` (rgb 51 81 59); `--size-small-print`
0.75rem, `--size-ink-field` 0.9375rem, `--size-table-body` 0.9375rem, `--size-deviation-words`
0.8125rem, `--size-running-head` 0.75rem; `--gap-hair` 2px, `--gap-xs` 6px, `--gap-s` 12px,
`--gap-m` 20px, `--gap-l` 32px, `--gap-xl` 48px; `--rule-ink-field` 1px, `--rule-graduation` 1px,
`--rule-baseline` 1.5px; `--focus-outline-width` = `--rule-baseline`, `--focus-outline-offset` 2px.
The sketch's own local type roles (lines 148–154): `--type-section` 0.875rem, `--type-label`
0.75rem, `--type-control` 0.8125rem, `--type-note` 1rem, `--leading-note` 1.5. The app's
`tokens.css` already carries all of these under the same names.

**Universal rules:**

- Focus ring (line 24): `.app *:focus-visible { outline: var(--focus-outline-width) solid var(--ink); outline-offset: var(--focus-outline-offset) }` — 1.5px solid ink, 2px offset, on whatever element holds focus. Stops and segment options are `<button>`s in the sketch, so the ring draws on the visible box itself.
- Forced colours (lines 143–145): `@media (forced-colors: active) { .on { outline: 2px solid Highlight } }` — the only outline any picked control ever carries.
- `button, input, textarea { font: inherit }` (line 25): every control takes the `.app` face, size and line-height (grotesk, `--size-table-body`, 1.35; line 23) unless a rule below resizes it.
- Transitions: none anywhere in the file (grep-verified 2026-09-14). Hover changes are instantaneous.
- `[hidden] { display: none !important }` (line 132).

**Captions:**

- Field caption `.lbl` (line 36, overridden by line 156): `display: block`; `text-transform: uppercase`; `margin-bottom: var(--gap-xs)` (6px caption-to-content gap); computed `font-size: var(--type-label)` (12px), `font-weight: 500`, `line-height: 1.35`, `letter-spacing: 0.025em` (line 156 wins over line 36's 0.04em). Inside a `.field-row`, `.field-row label > span.lbl` (line 39, higher specificity) adds `display: flex; align-items: flex-end; white-space: normal; line-height: 1.2; min-height: 2.4em` — two lines of height are reserved so short and long captions in one row keep their fields on the same baseline.
- Axis name `.axis .name` (line 76, overridden by line 157): uppercase; computed 12px (`--type-label`), weight 600, line-height 1.35, letter-spacing 0.025em.
- Region name `.region-name` (line 31, overridden by line 155): grotesk; uppercase; `color: var(--bookcloth)`; `margin: 0 0 var(--gap-s)`; computed `font-size: var(--type-section)` (14px), weight 600, line-height 1.35, letter-spacing 0.035em. Used for the two plain place-nouns **"Batch"** (line 210) and **"Tasting"** (line 243, inline `margin-bottom: 0`) — the "— churned" suffix and the tasting head's "· optional — leave anything you did not record blank" helpers are gone (ninth round).
- Helper `.helper` (line 169): grotesk; `--type-control` (13px); line-height 1.4; weight 400; `font-style: normal`; `text-transform: none`; `letter-spacing: 0`; `color: var(--ink)`. Used for "select all that apply" (line 265), the tasting status (line 244) and the record status (line 303).
- Group cues `.lbl.axes-cue` — **"Every recipe"** and **"This recipe only"** (lines 416–417 for the axes, 268 and 277 for the defect groups): the `.lbl` treatment above, as grid items on their own row: `#axes .axes-cue { grid-column: 1 / -1; margin: 0 0 var(--gap-xs) }` (line 61); in 3-column mode `.axes-cue--core { grid-column: 1 / 3 }` and `.axes-cue--declared { grid-column: 3; padding-left: var(--gap-s) }` (line 67). The sixth round's "Declared for this recipe" cue inside Body's box is gone; no axis carries a caption, so the first-row heads start level.
- Sketch 003 page-shell captions: `.cell .k` (003:87) `display: block; font-size: var(--size-small-print); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px` (weight inherits 400); `.vmeta dt` (003:76) small-print, uppercase, 0.04em, `padding-top: 2px`; table `th` (003:123) `--size-running-head`, uppercase, 0.04em, weight 400, `border-bottom-width: var(--rule-baseline)`; `.region-name` in 003 (003:36) is 0.04em weight 400 (007's typography pass, above, is the later value).

**Field rows, date and numeric fields:**

- `label` (line 34): `display: block; margin: 0 0 var(--gap-s)`. `label:has(+ .seg)` (line 35): `margin-bottom: var(--gap-xs)`.
- `.field-row` (line 37): `display: flex; gap: var(--gap-s); flex-wrap: wrap; align-items: flex-end`. `.field-row label` (line 38): `flex: 0 0 auto` — every label sits at its own content width; a label that does not fit wraps to the next line whole. Below 600px (line 139): `.field-row label { max-width: 100% }`. The melt row overrides alignment inline: `style="align-items:flex-start"` (line 286).
- `.f-date` (line 41): `width: 128px` on the *label*; its `input.num-field` (line 40: `width: 100%; box-sizing: border-box; text-align: right`) fills it, so the date field is 128px wide.
- `.field-unit` (line 42): `display: flex; align-items: baseline; gap: 4px`. `.field-unit .num-field` (line 43): `width: 48px; flex: 0 0 auto`. `.field-unit .u` (line 44, 170): `font-size: var(--size-deviation-words)` (13px); `white-space: nowrap`; line-height 1.3. The unit word ("min", "°C", "g lost at 20 min") sits *after* the box, never in the caption.
- `.ink-field` (line 32): grotesk; `--size-ink-field` (15px); tabular numerals; `color: var(--pen-blue)`; `border: var(--rule-ink-field) solid var(--ink)`; `border-radius: 0`; `background: none`; `padding: 2px 6px`. Below 600px (line 140): `font-size: 1rem`. Below 760px (line 182): `min-height: 44px`. No hover rule; focus is the universal ring.
- Row grouping in the markup: churn row = Churn date (`.f-date`), Time to draw temp. (min), Out of machine (°C), Churn duration (min) in one `.field-row` (lines 211–216); tasting row = Tasted (`.f-date`), Tempering (min), Tasting temperature (°C) in one `.field-row` (lines 249–253); melt row = Melt test (g lost at 20 min) beside the Melt style `.category` in one `.field-row` (lines 286–296).
- Malformed value: `[aria-invalid="true"]` (line 135) takes the focus ring's width/offset as an outline; `.field-error` (lines 134, 171): `display: block; max-width: 24ch; margin-top: var(--gap-xs)`, computed `--type-control`, weight 400, line-height 1.4, no transform.

**Prose fields (`.prose-field`, lines 33, 126–127, 167–168, 140):** text face; `color: var(--pen-blue)`; `border: 0; border-bottom: 2px solid var(--ink)` (always, not only when empty); `background: none`; `padding: 2px 0`; `width: 100%`; `resize: none`; `box-sizing: border-box`; `field-sizing: content`; `overflow-wrap: anywhere`; `min-height: 1.4em`; `overflow-y: hidden`; computed `font-size: var(--type-note)` (16px), `line-height: var(--leading-note)` (1.5), `max-width: 70ch`; placeholder ink, opacity 1, italic. Below 600px: `font-size: 1rem`. **Placeholders, verbatim (ninth round — every prose field carries an "e.g." example, each one line at 360px so all four fields measure 30px):** At the machine "e.g. bowl frozen overnight" (line 237); Ingredient notes "e.g. oil bottle opened 24 Jul" (238); How did it turn out? "e.g. flavor, texture, what stood out" (256); Next time "e.g. churn 2 min longer" (307).

**Buttons and text controls:**

- `.btn` (line 27): grotesk; `--size-table-body`; ink; `background: none`; `border: var(--rule-ink-field) solid var(--ink)`; `border-radius: 0`; `padding: 6px 12px`. Hover (line 28): `border-width: 1.5px; padding: 5.5px 11.5px` (no layout shift). Below 760px (line 181): `min-height: 44px`. Used for Cancel / Save batch in both ceremonies (lines 305, 312–313).
- `.text-control` (lines 29–30, 131, 166, 180): grotesk; no background, border or padding; `text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: 1px`; hover thickness 1.5px; `min-height: 24px`; computed `font-size: var(--type-control)` (13px), line-height 1.3, `white-space: nowrap`; below 760px `min-height: 44px`. Used for Remove tasting / Clear tasting (line 246, `style="margin-left:auto"` — right-aligned on the head row), Restore tasting (line 245), the per-axis Clear (line 410) and Add tasting (lines 304, 311).
- **The two ceremonies (ninth round; 03.3.1 D-01 and 03.3.1.1 D-14).** The end-of-record ceremony `#record-saves` (lines 301–306) sits after whichever section is last, just above Next time, and stays visible in every state (line 514); the foot ceremony (lines 310–314) sits at the page foot. Both read, in DOM order, **Add tasting | Cancel | Save batch** — the text control first, the two buttons last (this reverses the 03.3.1 footer order; the app follows the sketch) — and "Save batch" in every state ("Save batch only" / "Save batch & tasting" are retired, line 525). `.pen .saves` (line 55): `display: flex; gap: var(--gap-s); margin-top: var(--gap-l); justify-content: flex-end` — right-aligned, flush with the pen's right edge, at every width; inline `align-items: baseline` (lines 302, 310); below 600px `flex-wrap: wrap` (line 141). `.pen .saves + .next-time-shared { margin-top: var(--gap-l) }` (line 54). Add tasting is `hidden` while the tasting section is open **and** while a removed tasting can still be restored (line 484). The end-of-record ceremony also holds the removal toast `#record-status` (line 303: a `.helper` live region, `role="status" aria-live="polite"`, `margin-right: auto` per line 55 so the controls stay flush right even when it is empty) and the undo record slot; the foot has no undo slot. The undo slots `#undo-head-slot, #undo-record-slot { display: contents }` (line 55) so a hidden button leaves no gap. Measured at 1188px: the message and the controls share one row; at 360px the message takes its own row and the controls wrap right-aligned beneath it.
- **Restore tasting** (line 245, renamed from "Undo clear tasting"): lives in the tasting head slot while the section is visible and moves to the record slot when it collapses (lines 505–510). While it is pending, it takes Add tasting's place in the right-aligned set — Restore tasting | Cancel | Save batch (286px, one row at 360px) — and focus after a data removal lands on it (line 560); removing an empty tasting shows Add tasting and focuses the end-of-record one (line 542). Toasts: "Tasting removed. You can restore it." and "Tasting removed." → `record-status` (lines 561, 543); "Tasting cleared. You can restore it." and "Nothing recorded to clear." (always-visible mode only) and "Tasting restored." → `tasting-status` (lines 564, 535, 582).

**Segmented options (`.seg .opt`):**

- `.seg` (lines 47, 121): `display: flex; margin: 0 0 var(--gap-s); flex-wrap: wrap; row-gap: var(--gap-xs)` — a wrapped option keeps 6px clear of the row above (ninth round); options on one row still share their vertical borders.
- `.seg .opt` (lines 48, 122, 164, 165): `border: var(--rule-ink-field) solid var(--ink)`; `background: none`; `margin-right: -1px` (adjacent options share one hairline); `min-height: 32px`; `color: var(--ink)`; computed `font-size: var(--type-control)` (13px), line-height 1.3, letter-spacing 0, `padding: 5px 8px` (line 48's `5px 10px` then line 165's `padding-inline: 8px`). No hover rule. Below 760px (line 179): `min-height: 44px`.
- Picked `.seg .opt.on` (lines 49, 123): `background: var(--pen-blue); border-color: var(--pen-blue); color: var(--ground); position: relative; z-index: 1` — the fill and the pen-blue border show edge to edge over the shared hairlines. No bold, no underline (the former bold-plus-underline rule is gone; see departures).
- The two churn categories sit side by side: `.category-row` (line 119) `display: flex; gap: var(--gap-l); flex-wrap: wrap`; `.category` (line 120) `min-width: 0; max-width: 100%` (markup lines 218–235). The caption above each is a `label > span.lbl` (lines 220, 228, 289) with the 6px gap from line 35.

**Axis rows:**

- `.axis` (line 74): `margin: 0 0 var(--gap-m); min-width: 0`. `.axis .head` (lines 75, 158; base `.head` line 73, wrap line 118): `display: flex; align-items: center` (line 158 — ninth round, from `baseline`); `gap: var(--gap-xs); margin-bottom: var(--gap-xs); min-height: 24px; flex-wrap: wrap`.
- Per-axis Clear `.axis .head .clear` (markup line 410, a `.text-control` hidden until the axis is marked; ninth round): line 131 `margin-left: auto; margin-block: -4px` — right-aligned on the caption row, the same placement as Remove tasting on the TASTING row, with the `.text-control`'s 24px `min-height` (line 131) pulled to 16px in flow so the head row stays 24px whether or not Clear is showing. Below 760px, line 180 `margin-block: -10px` pulls the 44px touch box (line 180's `min-height: 44px`) to 24px in flow. In 3-column desktop mode, line 66 `[data-cols="3"] .axis:not(.axis--declared) { padding-right: var(--gap-m) }` keeps a right-aligned Clear 20px off the next column's caption and the vertical rule. Measured in a real tab at 1188px and 393px: picking a stop moves neither the caption, the head row (24px before and after) nor the stops; at 393px Clear's 44px box sits at x 330–361, clear of the stops (right edge 248). "Inline with the stops" was measured and rejected (228.6px needed in a 213.3px column).
- State text `.axis .state` (lines 77–79, 125, 159–162): computed for *both* `.pen` and `.unmarked`: grotesk, `--type-label` (12px), `font-style: normal`, weight 400, line-height 1.35, tabular numerals. Marked "(N)" is `color: var(--pen-blue)` (line 78); unmarked "(Not recorded)" is `color: var(--ink)` (line 125 overrides line 79's `#777`) and *roman* (line 160 overrides line 79's italic). The older "muted italic" wording in this contract's "Axes spec" describes the pre-typography-pass sketch; the HTML's computed style is roman ink.
- Track `.axis .stops5` (line 80): `display: flex; gap: 4px; width: 186px`; below 760px (line 178) `width: 216px`.
- Stop `.axis .stop5` (lines 81, 124): `width: 34px; height: 32px` (line 124 raises line 81's 24px; `flex: 0 0 34px`); `box-sizing: border-box`; `border: 1px solid var(--ink)`; `background: none`; `padding: 0`; grotesk; `--size-ink-field` (15px); tabular numerals; `color: var(--ink)`. Hover (line 82): `border-width: 1.5px` (border-box, so no size change). Picked `.on` (line 83): `background: var(--pen-blue); border-color: var(--pen-blue); color: var(--ground)`. Below 760px (line 177): `width: 40px; height: 44px; flex: 0 0 40px`.
- Anchors `.axis .anchors5` (lines 84, 125, 163, 178): `display: flex; justify-content: space-between; width: 186px` (216px below 760px); `margin-top: 2px`; `--size-deviation-words` (13px); `font-style: italic`; text face; `color: var(--ink)` (line 125 overrides `#555`); `white-space: nowrap`; line-height 1.3; letter-spacing 0.
- **One grid for the axes and the defects (ninth round).** `#axes` (line 58) holds `#axes-rows` (line 262, `display: contents`, into which the cue rows and axes render) followed by the defects head and the two defect groups (lines 263–281), so the defects share the axes' columns and the vertical rule spans them. Desktop 3-column (lines 64–70, min-width 761px): `#axes { grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 0; position: relative }` (65); `.axis--declared { padding-left: var(--gap-s) }` and core axes `padding-right: var(--gap-m)` (66); cue row (67); `.defects-head { grid-column: 1 / 3 }`, `.defect-group--core { grid-column: 1 / 3; padding-right: var(--gap-m) }`, `.defect-group--declared { grid-column: 3; padding-left: var(--gap-s); border-top: 0; padding-top: 0; margin-top: 0 }` (68); `.axes-rule` absolute, `top: 0; bottom: 0; left: calc(200% / 3)`, `border-left: var(--rule-graduation) solid var(--ink)` (69). Row-major DOM order in 3-column mode (line 419): cue core, cue declared, Hardness, Scoopability, Body, Smoothness, Sweetness, Oil, the rule; then the defects head and groups. Measured at 1188px: the rule runs 702→1010 spanning the chips; both cues at the same y; all five chips at the same y; Bitter's group in the Body column. Stacked (lines 58–61, 113–117, line 420): `.axes-core` (cue then Hardness…Sweetness) and `.axes-declared` (cue then Body, Oil), each `display: grid; gap: 0 var(--gap-l); grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))`; `.axes-declared { border-top: var(--rule-graduation) solid var(--ink); padding-top: var(--gap-s) }`; the defects head and groups follow as full-width grid items (`.defects-head { grid-column: 1 / -1 }`, line 90).

**Defect chips and the declared toggle:**

- Head row (lines 263–266): `.head.defects-head` with inline `margin-bottom: var(--gap-xs)`; `p.lbl#defects-caption` "Any problems?" and `p.helper` "select all that apply", both `margin: 0`, on one baseline row.
- Two labelled groups (lines 267–281), each `role="group" aria-labelledby="defects-caption defects-<group>-cue"`: `.defect-group--core` with cue `p.lbl.axes-cue#defects-core-cue` **"Every recipe"** and the four chips Coarse, icy · Sandy, gritty · Gummy, elastic · Greasy film; `.defect-group--declared` with cue **"This recipe only"** and **Bitter** (line 279: text "Bitter", `class="chip-toggle declared-flaw"`, **no aria-label and no helper** — the group cue carries the meaning, so a screen reader hears "Any problems? This recipe only, Bitter"). A second declared flaw lands in the second group with no new design.
- `.defect-chips` (line 89): `display: flex; flex-wrap: wrap; margin-top: 4px`; inside a group `.defect-group .defect-chips { margin-top: 0 }` (line 130) — chips sit 6px under their cue (the cue's own `margin-bottom`).
- Stacked arrangements (line 130): `.defect-group--declared { border-top: var(--rule-graduation) solid var(--ink); padding-top: var(--gap-s); margin-top: calc(var(--gap-m) - 6px) }` — the preceding chip row's 6px bottom margin plus 14px gives the 20px the declared axes have above their rule, then 12px to the cue; measured at 360px, no overflow. In 3-column mode line 68 removes the border, padding and margin (the vertical rule marks the group).
- `.chip-toggle` (lines 87, 128, 164): `border: var(--rule-ink-field) solid var(--ink)`; `padding: 3px 10px`; `background: none`; `margin: 0 6px 6px 0` (6px between chips, 6px below each row); `min-height: 32px`; `color: var(--ink)`; computed `font-size: var(--type-control)` (13px), line-height 1.3, letter-spacing 0. No hover rule. Below 760px (line 179): `min-height: 44px`.
- Pressed `.chip-toggle.on` (lines 88, 129): `background: var(--pen-blue); border-color: var(--pen-blue); color: var(--ground)`. No bold, no underline.
- There is no longer a `.declared-flaw` margin rule, no "· declared" / "· this recipe only" helper and no `.defect-chips > .helper` rule: the gap that marked Bitter as a different kind of thing is now its own captioned group and column.

**Pen shell and section rhythm:**

- `.pen` (line 52): `max-width: 640px`. `.pen section + section` (line 53): `margin-top: var(--gap-l); padding-top: var(--gap-m); border-top: var(--rule-graduation) solid var(--ink)`. `.pen section + .next-time-shared, .pen .saves + .next-time-shared` (line 54): `margin-top: var(--gap-l)` and no rule above (the Next time field's own 2px underline is the only rule). Order at the pen's foot (lines 301–314): the end-of-record ceremony, Next time, [sketch-chrome placeholder], `#form-status`, the foot ceremony.
- Tasting head (line 242): `.head` with inline `margin-bottom: var(--gap-s)`; the bare region name "Tasting" (243), the `tasting-status` helper span (244), the head undo slot holding Restore tasting (245) and the right-aligned Remove tasting / Clear tasting toggle (246) share one baseline row.
- Tasting body (lines 93–98, 101–102): `#tasting-body { display: flex; flex-direction: column }`; variant A order: field-row (1), note block (2, `margin-bottom: var(--gap-m)`), texture block (3), melt block (5, `margin-top: var(--gap-m)`).
- `#form-status` (lines 133, 172): `margin-top: var(--gap-m); overflow-wrap: anywhere`; computed `--type-control`, line-height 1.5, `max-width: 70ch` — the foot's save and validation channel, whichever Save was pressed.

**Touch targets below 760px (lines 174–183):** stops 40×44 on a 216px track; `.chip-toggle`, `.seg .opt`, `.text-control`, `.btn`, `.ink-field` all `min-height: 44px`; Clear's `margin-block: -10px`. The 600px block (lines 137–142): frame padding `--gap-m`, `.field-row label { max-width: 100% }`, `.ink-field, .prose-field { font-size: 1rem }`, saves rows wrap.

**Page shell (sketch 003, for the three page-shell items):** `.page` (003:47) `display: grid; grid-template-columns: 2fr 1fr; gap: var(--gap-l); padding: var(--gap-xl); align-items: start; grid-template-areas: 'front side-top' 'ingredients side' 'method side'`; stacked below a 1100px frame (003:48, toggled by `relayout()` at 003:510 when the frame is narrower than 1100): `grid-template-columns: 1fr; padding: var(--gap-m); gap: var(--gap-m); grid-template-areas: 'front' 'ingredients' 'side' 'method'` — column two follows the ingredient table, the method comes last. Every area carries `min-width: 0` (003:49–53). `.front` (003:49, 68): `container-type: inline-size; border-bottom: var(--rule-baseline) solid var(--ink); padding-bottom: var(--gap-m)`. `.row` (003:66–67): `padding-bottom: var(--gap-m); margin-bottom: var(--gap-m); border-bottom: var(--rule-graduation) solid var(--ink)`, none on the last row. `.row-version` (003:69): `grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr); gap: var(--gap-l); align-items: start`; `@container (max-width: 760px)` (003:71) collapses it and the open ceremony to `1fr`. `.headnote { max-width: var(--measure-prose) }` (003:70). `.vmeta dl` (003:75): `grid-template-columns: max-content 1fr; gap: var(--gap-hair) var(--gap-s)`; `.vmeta dd { min-width: 0 }` (003:81); `.acts` (003:79): flex, `gap: var(--gap-s)`, wrap, centre, `margin-top: var(--gap-s)`; `.btn, .text-control { white-space: nowrap }` (003:80). Batch cells `.cells` (003:86): `grid-template-columns: repeat(auto-fit, minmax(96px, max-content)); gap: var(--gap-s) var(--gap-l); margin: var(--gap-s) 0 0`; `.cell .v` (003:88) `--size-figure-value`, weight 700, pen blue, tabular; `.cell .v .u` (003:89) `--size-deviation-words`, weight 400; `.cell .plan` (003:90) block, small print, `margin-top: 2px`. Ingredients region: `h2.region-name` then the table (003:267–273); `table` (003:121) `border-collapse: collapse; width: 100%; table-layout: fixed`; `th, td` (003:122) `padding: 4px 6px; box-sizing: border-box; vertical-align: baseline; border-bottom: var(--rule-graduation) solid var(--ink)`; columns (003:126) `col.c-num 94px`, `col.c-step 78px`, `col.c-data 86px`, the name column unsized.

**Decided departures (CONTEXT.md, Phase 03.3.1.1) — all now drawn into the committed sketch (ninth round, commit `977846a`, Mark's calls 2026-09-14), so the conformance pass compares against a matching reference:**

- **D-04** — the former `[aria-checked="true"], [aria-pressed="true"].chip-toggle { font-weight: 700; text-decoration: underline; … }` rule is removed; picked or pressed state is the fill alone (lines 49, 83, 88), nothing bold, nothing underlined, app-wide. The "Keyboard and tab order" section's sentence "the pressed affordance is bold plus underline" is superseded by this.
- **D-08, superseded by the ninth round** — the helper first became a sibling of the Bitter button, then went away entirely: Bitter is a plain chip in its own captioned group "This recipe only" (lines 276–281) with no helper and no aria-label. Mark's deferred "tweak the helper's placement" quick task has nothing left to place.
- **D-12** — "(optional)" is dropped from the Melt test and Melt style captions (lines 287, 289) and from the `seg-melt` aria-label (line 612): the captions read "Melt test" and "Melt style".
- **Per-axis Clear placement** (lines 66, 131, 158, 180; see the axis entry above) — after CONTEXT.md's "confirmed as-sketch" bullet; the HTML governs per D-01.
- **The ceremonies follow 03.3.1 D-01 / 03.3.1.1 D-14** (lines 301–314, 480–485, 511–526): one end-of-record ceremony above Next time plus the foot ceremony, both "Add tasting | Cancel | Save batch", both right-aligned at every width, "Save batch" in every state; the churn section's own saves row and the "Save batch only" / "Save batch & tasting" labels are gone. The previous "pre-declared departure" is no longer needed.

**Superseded by the ninth round (the sections above still carry the 03.3.1 wording; the HTML governs):**

- *DOM order inventory*: "Batch — churned" → **"Batch"** (line 210); the tasting heading's helpers "· optional" / "— leave anything you did not record blank" → bare **"Tasting"** (line 243); the churn saves row (`#churn-saves`) no longer exists; "Melt test (optional)" / "Melt style (optional)" → "Melt test" / "Melt style"; the footer row → **Add tasting | Cancel | Save batch** and an identical end-of-record ceremony (`#record-saves`) above Next time; the undo footer slot → the record slot inside `#record-saves`; the "Declared for this recipe" caption inside Body's box → the two cue rows "Every recipe" / "This recipe only"; the defects group → the head plus two labelled groups inside the axes grid; "How did it turn out?" placeholder → "e.g. flavor, texture, what stood out"; "At the machine" now has the placeholder "e.g. bowl frozen overnight"; Next time's placeholder → "e.g. churn 2 min longer".
- *Axes spec*: "the 'Declared for this recipe' caption sits inside Body's box" → the cue rows above; "(Not recorded) … muted italic" → roman ink.
- *Controls spec*: "Melt style (optional)" aria-label → "Melt style"; the declared chip's "· declared" helper and `aria-label="Declared for this recipe: Bitter"` → none (group cue "This recipe only"); "trails the row after a wider gap (the `declared-flaw` margin)" → its own group/column.
- *Save and save-pair matrix*: every row now reads Add tasting (while closed and no restore pending) | Cancel | Save batch in both ceremonies; the churn row is gone; the undo lives in the record slot (section absent) or the head slot (section visible).
- *Feedback and undo lifecycle*: "Undo clear tasting" → **"Restore tasting"**; "Tasting removed. You can undo this." → "Tasting removed. You can restore it." and, with "Tasting removed.", targets `record-status` (the end-of-record ceremony's live region, left of its row), not `form-status`; "Tasting cleared. You can undo this." → "Tasting cleared. You can restore it."; focus after a data removal in hidden mode → Restore tasting (not Add tasting); focus after an empty removal → the end-of-record ceremony's Add tasting; Add tasting is hidden in both ceremonies while a restore is pending.
- *Keyboard and tab order*: the pressed affordance is the fill (D-04). Sketch 3-column DOM order now begins with the two cue rows and ends with the defects head and groups.
