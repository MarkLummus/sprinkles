# Cross-Cutting Type, Spacing & Feedback

App-wide rules validated in sketch 007's hardening/typography passes. **These apply to every surface — page shell, table, method, pens — not just the batch record.** They are targets for the real app: map them onto `app/src/styles/tokens.css` (which already carries `--gap-xs: 6px` and the same Georgia text face), keeping the app's own faces from DESIGN.md. The sketch tuned values, not typefaces.

## Type Roles

```css
/* Local type roles established in the sketch — map to tokens, don't copy as literals */
--type-section: 0.875rem;  /* section headings: 14px, weight 600, line-height 1.35 */
--type-label:   0.75rem;   /* compact field labels: 12px, weight 500 (axis names 600) */
--type-control: 0.8125rem; /* actionable choices, helper text, status: 13px */
--type-note:    1rem;      /* written notes: 16px, leading 1.5, max 70ch */
```

- Placeholders render italic; entered prose stays roman pen-blue.
- Status text uses one face — no italic-serif ↔ sans flip when a state changes.
- Helper text is plain grotesk, sentence case, no letter-spacing, no transform.
- **All-caps (`text-transform: uppercase`) only ever wraps a short caption.** Long hints ("select all that apply", "You can add a tasting later") are sibling helper paragraphs, never inside the uppercase element — otherwise the source gets shouty-caps to satisfy the transform.
- Metadata/state text is one consistent face; don't switch families on state change.

## Spacing

- **Caption-to-content gap is 6px (`--gap-xs`) everywhere** — every "caption and its content share one label" instance: inputs, textareas, segmented controls, axis rows, chip rows. Verified by measuring `getBoundingClientRect()` in a real browser, not by reasoning from CSS source. (This bug bit twice: a 2px rule and a 12px rule coexisted; only a DOM measurement exposed the 4px misalignment.)
- Pattern: one universal rule (`label > span.lbl { margin-bottom: var(--gap-xs) }` / `label:has(+ .seg)`) rather than per-instance margins.
- Field separators stay at `--gap-s` (12px); section breaks at `--gap-l` (32px) with graduation-weight top rules.

## Controls

- Hairline 1px ink border, radius 0, no fill, ink text. Hover: border-width 1.5px with compensating padding (no layout shift).
- Selected: pen-blue fill + ground text, **plus** a color-independent affordance (weight 700 + underline for text chips; the fill itself for stops/segments), and a `forced-colors` outline fallback.
- Selected and unselected headings reserve identical height (`min-height` on the head row) so marking an axis never shifts layout.
- Numeric/mono figures use `font-variant-numeric: tabular-nums` everywhere anything is counted.
- Focus: `outline: var(--focus-outline-width) solid` ink with 2px offset; `focus-visible` only.

## Touch Targets & the Responsive Ladder

- **Below the 760px step-down, interactive targets grow toward 44px**: rating stops 40×44 (track arithmetic scales: 5×40 + 4×4 = 216px, anchors re-aligned to match), chips and segmented options min-height 44, buttons and ink fields min-height 44. Desktop stays compact (34px stops on the 186px track, 34px buttons) — verified at 768px.
- **Ladder, not cliff:** a side-by-side arrangement needs the pen's full 640px; below ~760px step down to the intermediate arrangement (groups stacked on a horizontal rule, still 2-across); auto-fit collapses each group to one column once two 280px columns no longer fit. Below 600px: frame padding drops to gap-m, fields go to 1rem.
- The default arrangement is responsive on its own; explicit toolbar modes (1/2/3 columns) are for comparison, not the product.
- **Re-render per arrangement so tab order follows the eye** — one DOM order cannot serve both a row-major grid and stacked groups. Carry interaction state across re-renders by id, not by DOM reference.
- Zero horizontal overflow at 393px is the acceptance bar; verify with device emulation (768 and 393).

## Feedback & State

- **Feedback lives where the action is.** A section carries its own status line; the page foot is the save/announce channel. Undo sits in the action row it belongs to — relocated via real DOM move when its section collapses.
- **Destructive moments get toast + Undo:** the toast self-clears after 5 s with a guarded timer (never wipes a newer message); the Undo control is the lasting affordance.
- **Undo retirement is scoped to the section it undoes** — a keystroke in another section must not erase it. Radio/segmented handlers count as edits too (this bug shipped twice).
- **Focus management:** after a collapse, focus moves to the control that reopens (Add tasting); after restore, focus returns to the restored content. Undo buttons focus themselves when they appear from a destructive action.
- **State-based labels, not content-sniffing** — label by whether a section is open, not by whether its fields hold values.
- **Empty states are explicit:** an empty clear says "Nothing recorded to clear." rather than no-op'ing; a removed empty thing shows no Undo (nothing to restore).
- No announcement for changes that are their own evidence (a section opening, focus landing).

## Verification Method (how these were validated)

- Measure the real DOM in a live browser (`getBoundingClientRect` gaps, device emulation at 768/393, horizontal-overflow checks) — never trust CSS-source reasoning (see memory: measure, then edit).
- Keyboard passes: roving focus, clear/undo round-trips, malformed-input feedback.
- Multilingual/RTL and long-content notes grow without clipping; signed temperatures and decimal commas accepted.

## Origin

Synthesized from sketch: 007 (typography pass, hardening pass, spacing unification, feedback rounds)
Source files available in: `sources/007-full-battery/`
