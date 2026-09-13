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
