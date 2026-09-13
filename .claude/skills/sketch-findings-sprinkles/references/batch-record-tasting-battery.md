# Batch Record & Tasting Battery

Validated by sketch 007 (winner A) through eight rounds with browser verification, 2026-09-11/12.

## Design Decisions

**Field set (the full battery, two sections — churned / tasting):**
- Churn: date, time to draw temp, out of machine (temp), churn duration, exit consistency (3-way segmented), airiness (estimated, segmented), tempering time.
- Tasting: tasted date, tasting temperature, six axis marks, note, defects checklist, melt style + melt test, next time.

**Axes — 5-point goldilocks scale:**
- Every axis (sweetness, hardness, smoothness, scoopability, oil character, density/body) runs a 5-point scale: too little / — / right / — / too much. Directionality is deliberate — it drives future-improvement suggestions (Mark's explicit call; the critique's descriptive-anchors argument is recorded but not adopted).
- The five stops carry their digits (1–5) — no blank squares, no separate readout line.
- Inline state next to the axis name: `(3)` in pen blue once marked, `(Not recorded)` in muted italic when not. A per-axis Clear text-control; clicking the selected stop again also clears.
- **Core vs. declared axes split side by side:** the four fixed core axes left, the recipe-declared pair (Body, Oil) right of a vertical hairline (the declared group's left border), captioned "Declared for this recipe" inside Body's box. Desktop 3-column mode renders one row-major grid (tab order follows the eye — Hardness, Scoopability, Body, Smoothness, Sweetness, Oil); below 760px or in 1/2-column modes the groups stack on a horizontal rule and re-render as grouped DOM. Marks survive re-renders (carried by axis id).
- **Bitter is not a goldilocks axis** — "too little bitterness" carries no information. It's a presence/severity toggle: "Bitter · declared" with `aria-label="Declared for this recipe: Bitter"`, trailing the universal defects row after a wider gap.

**Defects — one standalone section:**
- "Any problems?" with "select all that apply" as an inline lowercase hint on the caption's line; four chips (coarse & icy, sandy & gritty, gummy & elastic, greasy film) as clearly-secondary shortcuts after the axes grid. Never distributed under individual axes (variant B dropped).

**The note (winner A):**
- "How did it turn out?" is the one eyebrow; the note field sits **before** Texture & flavor, open and typable immediately — no mode to pick, no toggle.
- Neutral placeholder: "e.g. flavor, texture, anything that stood out" (the metallic-aftertaste example biased toward faults).
- The "as expected, nothing to note" shortcut is removed — axis marks and defects carry real signal, so a blank note reads clearly. Flagged: this removed a purpose-built disambiguator ("never tasted" vs "tasted, nothing to add"); revisit once the record is in real use.

**Saving — decoupled, two paths:**
- The churn section ends with its own save; the footer is the second. Labels are state-based, not content-sniffing: Tasting section visible → footer reads "Save batch & tasting"; section absent → "Save batch" with "Add tasting" beside it.
- **Hidden-until-added is the primary tasting mode:** the record opens with the entire Tasting section absent (no headline, no "Not added yet." line). Add tasting opens it and focuses the Tasted date. Always-visible stays as a comparison mode.
- Clear/remove tasting → toast + Undo. The undo trails the action row (tasting head when visible, footer row when hidden), retires only on tasting edits (never churn edits), and "Tasting removed." self-clears after 5 s while Undo persists.
- With no tasting section, one save ceremony: Ingredient notes → Next time → footer Cancel | Save batch | Add tasting. Each pen's ceremony carries Cancel first.

**Blank stays visibly blank:**
- No default selections on any stop or segmented option; pre-filled demo values removed. Clicking a selected stop/option again clears it. Malformed numbers stay in place with inline feedback and focus on the first error; decimal point/comma both accepted.

**Melt block at the end:** melt style and melt test together (both optional, both describe the same behavior), below Texture & flavor / defects, above Next time.

## CSS Patterns

```css
/* Pen shell: sections on graduation rules, one shared Next time, saves row */
.pen { max-width: 640px; }
.pen section + section { margin-top: var(--gap-l); padding-top: var(--gap-m); border-top: var(--rule-graduation) solid var(--ink); }

/* Axis row: 5 numbered stops on a 186px track (5×34 + 4×4); anchors matched to the track */
.axis .stops5  { display: flex; gap: 4px; width: 186px; }
.axis .stop5   { width: 34px; height: 24px; border: 1px solid var(--ink); background: none; font-variant-numeric: tabular-nums; }
.axis .stop5.on { background: var(--pen-blue); border-color: var(--pen-blue); color: var(--ground); }
.axis .anchors5 { display: flex; justify-content: space-between; width: 186px; font-style: italic; white-space: nowrap; }

/* Core/declared split: vertical hairline between columns 2 and 3 (desktop row-major grid) */
@media (min-width: 761px) {
  [data-cols="3"] #axes { grid-template-columns: repeat(3, minmax(0, 1fr)); position: relative; }
  [data-cols="3"] .axes-rule { position: absolute; top: 0; bottom: 0; left: calc(200% / 3); border-left: var(--rule-graduation) solid var(--ink); pointer-events: none; }
}

/* Segmented 3-way control: shared borders, pen-blue fill when picked */
.seg { display: flex; }
.seg .opt { border: var(--rule-ink-field) solid var(--ink); margin-right: -1px; padding: 5px 10px; }
.seg .opt.on { background: var(--pen-blue); border-color: var(--pen-blue); color: var(--ground); position: relative; z-index: 1; }

/* Note placement by variant via flex order on one DOM (winner A: note before texture) */
#tasting-body { display: flex; flex-direction: column; }
#tasting-body .field-row { order: 1; }
#tasting-body .note-block { order: 2; }
#tasting-body .texture-block { order: 3; }
#tasting-body .melt-block { order: 5; margin-top: var(--gap-m); }
/* React note: per-arrangement conditional render serves tab order; CSS order is the sketch's trick */

/* Selected-state affordances beyond fill (works without color) */
[aria-checked="true"], [aria-pressed="true"] { font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
```

## HTML Structures

- `.pen` → section churn (field-row of paired labels, segmented controls, its own Cancel | Save row) → section tasting (field-row, note-block, texture-block with axes grid + defects group, melt-block) → next-time-shared label → footer saves.
- Axis row: `.head` (name + inline state + Clear) → `.stops5` (five numbered buttons) → `.anchors5` (three short labels, space-between).
- Defects: `role="group" aria-label="Any problems? Select all that apply"` of `chip-toggle` buttons with `aria-pressed`.
- All statuses: named radio groups with roving keyboard focus (arrows, Home, End); `aria-invalid` + `.field-error` for malformed numbers; `#form-status` live region for save/announce.

## What to Avoid

- **Pre-selected defaults** — anything picked on load reads as a real default; blank must stay visibly blank.
- **Fault-biased prompt examples** ("e.g. there's a metallic aftertaste") — placeholder examples bias the maker's first response.
- **Two-question bridges** ("Anything stand out?" → "How did it turn out?") and **segmented either/or toggles for non-exclusive states** ("a note" and "as expected" can coexist).
- **Defects scattered under axes** — one place, always the same place.
- **Content-sniffing save labels** — label by state (is the section open?), not by sniffing field values.
- **Announcements for self-evident changes** — opening the tasting section is its own evidence; clear the status line instead of writing "Tasting added."
- **Unlabeled intermediate stops** — every pickable position needs a legible value (the digits on the stops).

**Carried for the phase plan (recorded, not built):** drop the underline on filled controls (P3); name the two Cancels' scopes — in the real product Cancel discards the whole pen draft (D-24), a persistence-contract decision; explicit persistence contract for the two save scopes (churn-only vs combined); undo-retired-on-resize edge; matchMedia-under-emulation caveat; the read-view summary line ("Soft (2) · grainy · bitter" in the tasting head) belongs to the batch *read* view, not this pen; the goldilocks-vs-descriptive-anchors question stays closed unless Mark reopens it; Scoopability's anchor wording (crumbly ↔ gummy) is left pending that decision.

## Origin

Synthesized from sketch: 007
Source files available in: `sources/007-full-battery/`
