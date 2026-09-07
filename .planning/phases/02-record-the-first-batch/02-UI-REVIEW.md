# Phase 02 — UI Review

**Audited:** 2026-09-07
**Baseline:** Abstract 6-pillar standards + project design conventions (no UI-SPEC.md exists)
**Screenshots:** Not captured (Playwright browser driver unavailable; code-only audit)
**Verification Method:** Structural code audit, copywriting inventory, token usage analysis, state coverage review

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Specific, contextual labels; empty/error states clear and distinct; marked copy validates no color-dependency |
| 2. Visuals | 3/4 | Clear hierarchy via weight and outline; focal point (Save batch button) partially obscured by margin position |
| 3. Color | 4/4 | All values through CSS custom properties; pen-blue for recorded content only; no hardcoded colors; compliance with No-Verdict rule |
| 4. Typography | 4/4 | Two font stacks (serif/grotesk) applied through tokens; font sizes and weights consistent; all through design system |
| 5. Spacing | 4/4 | All spacing routed through `--gap-*` scale; no arbitrary values; numeric columns sized via `--col-numeric` token |
| 6. Experience Design | 3/4 | Recording and reading states complete; empty/unsaved states handled; one-way mark control partially resolved (G-02-6); minor dismiss-affordance gap |

**Overall: 22/24**

---

## Top 3 Priority Fixes

1. **Save batch button findability (design debt)** — Located at foot of a long margin column (1400px+), requiring vertical scroll beyond the fold on most viewports. Impeccable owns this as noted in UAT (G-02-4 design half); recommend button token and/or layout prominence review in Phase 2 follow-up.

2. **Amend button lacks visual weight distinction** — Both "Amend" and "Record another batch" are plain text buttons with identical styling, risking confusion about which control corrects vs. creates. Adding button visual weight (not yet implemented per A-3) would resolve; currently relies on label specificity alone.

3. **Mark control doesn't prevent accidental incomplete saves** — A user can mark three axes, then immediately mark a fourth and unintentionally click "Save tasting" before clearing the unwanted mark (no undo after save). The Clear control exists (G-02-6 resolved) but only while composing; once saved, marks are permanent. Recommend UX pattern audit in Phase 3 for amendment of existing marks.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

**Strengths:**

- **Contextually distinct labels** prevent mode confusion:
  - "Record a batch" (zero-batch state) vs. "Record another batch" (saved-batch state, new in 02-04)
  - "No batch recorded against this version yet." vs. "No batch of this version has that address." (D-06, unknown-address state)
  - "Amend" vs. "Record another batch" (distinct intents per D-06: correct vs. add)
  
- **Empty states clear and actionable** (BatchMargin.jsx):
  - "This batch has not been tasted yet." — reads as neutral statement, not urgency or status (No-Verdict rule compliance)
  - "Write words or mark at least one axis to save." — explicit save gate reason, visible even when button disabled (IngredientTable.jsx, line 121)
  - "As expected, nothing to note" — exact shortcut text immutable, no generic phrasing (D-05, line 107)

- **Field labels include units and constraints** (Method.jsx, BatchMargin.jsx):
  - "Come-up, min" / "Draw temperature, °C" / "Overrun, %" — units on label, never implied
  - "What did you do differently?" — past-tense framing for changed line input (Method.jsx, line 76)
  - "Next time" — labeled as intention, not correction (D-04)

- **Marks and axes use behavioral anchors**, never adjectives (AxisMark.jsx, CORE_AXES):
  - "spoon sinks … spoon won't enter" (hardness)
  - "crumbles … rolls clean" (scoopability)
  - No generic "low … high" or adjectival scale labels

- **No generic verbs**: Save/Cancel buttons paired with nouns (Save batch, Save tasting, Add a tasting), not bare OK/Apply

**No violations found** — all copy matches design contract or project best practices.

**Evidence files:** `BatchMargin.jsx` lines 6, 16, 247, 287, 309, 333; `Method.jsx` line 76; `AxisMark.jsx` (implicit via domain/axes.js CORE_AXES)

---

### Pillar 2: Visuals (3/4)

**Strengths:**

- **Visual hierarchy via weight and outline, never color** (No-Verdict rule):
  - Marked rows: bold weight + black outline (app.css lines 174-178), no background tint
  - Open batch in list: bold weight + black outline (app.css lines 465-469), matches marked-row convention
  - Struck step: text-decoration line-through + weight (app.css line 254), never red/crossed-out icon

- **Form state indicated through outline + label/hint text**:
  - Disabled "Save tasting" button paired with visible hint text (BatchMargin.jsx line 121)
  - Clear button conditional presence (AxisMark.jsx lines 41-50): visible only when mark exists
  - Strike checkbox paired with "Skipped" label (Method.jsx line 73): label always present, even in pre-recording state (form-only)

- **Focal points through text hierarchy**:
  - Main content (recipe) left column, margin (batch operations) right column (app.css lines 53-72)
  - Within margin: batch section → recorded fields → batch list → add tasting
  - Field labels and measured values separated by justified layout (app.css lines 436-444)

**Weakness:**

- **Save batch button location obscures discoverability**:
  - Placed at foot of right-column margin (BatchMargin.jsx line 233)
  - On a recorded batch, margin content extends beyond fold (~1400px+), requiring scroll to reach Save/Cancel controls
  - No visual weight tokens (no `button` class, inherits default sizing) — contrasts with labeled buttons on form fields
  - This is documented as G-02-4 design debt; not a code defect, but a UX posture issue

- **Amend and Record another batch buttons use identical styling** — only text distinguishes them
  - Both plain-text buttons without icon or visual distinction (lines 278, 300)
  - User relying on label accuracy to avoid overwriting vs. adding

**Evidence files:** `app.css` lines 174-178, 436-444, 465-469, 553; `BatchMargin.jsx` lines 233-237, 278, 300; `AxisMark.jsx` lines 41-50

---

### Pillar 3: Color (4/4)

**Strengths:**

- **All visual color routed through CSS custom properties** (tokens.css):
  - `--ink` (#141414) — all text, rules, borders in default state
  - `--pen-blue` (#1f3d7a) — recorded/typed content only (`.ink-text`, `.ink-field`)
  - `--ground` (#f7f7f4) — page background
  - `--bookcloth` (#33513b) — region headers (`.region-name`)
  - No hardcoded hex or rgb() literals in UI components or stylesheets

- **Recorded vs. recorded distinction via color and form state, not color alone**:
  - Recording state: blue ink in bordered field (`.ink-field`)
  - Reading state: blue ink as plain text (`.ink-text`), border gone
  - Color change paired with structural change (form → text), satisfying No-Verdict rule

- **Marked/struck content uses weight and outline, not color**:
  - Marked row: bold + outline (app.css 174-178)
  - Struck step: strike through + weight (app.css 253-254)
  - Open batch in list: bold + outline (app.css 465-469)
  - Zero color signaling status — confirms project's Two-Ink convention

- **No accent overuse** — pen-blue used for recorded content only, not applied to buttons, badges, or status indicators

**Zero violations** — audit confirms color compliance across all batch layer components.

**Evidence files:** `tokens.css` lines 5-9, 48-52; `app.css` lines 399, 414, 533; grep confirms zero hardcoded colors in UI components

---

### Pillar 4: Typography (4/4)

**Strengths:**

- **Two font stacks, consistently applied**:
  - `--face-text` (Georgia serif) — prose: headnote, method steps, draw notes, next-time notes, meltdown, tasting words
  - `--face-grotesk` (system sans) — interface: labels, figure values, field labels, button text, hint text

- **Sizes consistent and measured**:
  - `--size-table-body` (0.9375rem) — most form labels and text in fields
  - `--size-small-print` (0.75rem) — units on labels (min, °C, %, g), hints, marks stops, clear button
  - `--size-running-head` (0.75rem) — region headers (Batch, Method), column headers
  - `--size-mark-stop` (0.8125rem) — axis label and stop value (new for 02-03)
  - No custom sizes in batch components; all through tokens

- **Font weights disciplined**:
  - 700 (bold) for: total row, marked rows, open batch in list, struck step lead-in
  - No weight creep to 600 or 800; consistent at stated or unspecified (400)
  - Weight changes only where needed for hierarchy (marked/open/struck)

- **No web font overhead** — system fonts only, no @font-face imports

**Zero deviations** — all typography routed through tokens.

**Evidence files:** `tokens.css` lines 12-22; `app.css` grep confirms 4 instances of `font-weight: 700`, each justified

---

### Pillar 5: Spacing (4/4)

**Strengths:**

- **All spacing routed through `--gap-*` scale** (tokens.css lines 25-30):
  - `--gap-hair` (2px) — space between label and input, between axis anchors and stops
  - `--gap-xs` (6px) — padding inside buttons, margin between form rows
  - `--gap-s` (12px) — margin between adjacent form sections, gap between method steps
  - `--gap-m` (20px) — margin above new tasting section, margin above basis note
  - `--gap-l` (32px) — gap between recipe columns (ingredients/method and margin)

- **Numeric columns sized through token** (tokens.css line 52):
  - `--col-numeric` (88px) — Grams, As made, and % of batch columns, plus total-row cells
  - Right-aligned, content-sized, no stretching (app.css lines 138-146)

- **Mark control spacing** (tokens.css lines 55-56, app.css lines 504, 518):
  - `--gap-mark-stop` (var(--gap-xs)) — space between axis stops
  - `--size-mark-stop` (0.8125rem) — radio input and label dimensions
  - Consistent with field-label spacing

- **No arbitrary spacing values** — zero `[*px]` or `[*rem]` in components; all go through scale

- **Margin positions for state changes** (app.css):
  - Form fields margin-top: `--gap-xs` (line 431)
  - Tasting section top-margin: `--gap-m` (line 475)
  - Clear button margin-top: 0 (line 549, scoped to flex row for vertical centering)

**Zero violations** — spacing discipline complete.

**Evidence files:** `tokens.css` lines 25-30, 52-56; `app.css` grep confirms zero arbitrary spacing in batch-layer classes

---

### Pillar 6: Experience Design (3/4)

**Strengths:**

- **Recording and reading states fully implemented**:
  - Recording state (mode === 'recording'): ink fields for all churn + tasting data, no pre-fills from version (D-07, D-05)
  - Reading state: ink-text values and stored marks, no editable fields unless user clicks Amend or Add a tasting
  - Draft state clearly distinguishable: form controls visible, outline borders present

- **Empty/no-batch states handled**:
  - Zero-batch state: "No batch recorded against this version yet." + "Record a batch" button (line 333)
  - Unknown-address state: "No batch of this version has that address." + "Record a batch" button (line 333)
  - Not-tasted state: "This batch has not been tasted yet." (line 309, no color, no icon)
  - No required fields — words alone or marks alone sufficient (isTastingSaveable, line 50)

- **Unsaved work guarding** (RecipePage.jsx, beforeunload effect):
  - Browser's native leave warning fires while recording draft (churn or tasting) is dirty
  - Dirty check: presence-over-truthiness on all fields, so written 0 counts as dirty
  - No app-invented dialog (D-24)
  - Extended in 02-03 to cover in-progress tasting (Rule 2 fix, commit 2d010c0)

- **Disabled states explained in text**:
  - "Save tasting" disabled when no marks and no words: "Write words or mark at least one axis to save." (line 121)
  - Save gate through `isTastingSaveable`, visible before clicking disabled button

- **Mark control now reversible** (02-05, G-02-6):
  - Clear button appears only while mark exists (AxisMark.jsx lines 41-50)
  - Shares onChange handler with stops, passes `null` to clear
  - `setMark` in domain prevents mutations and handles both set and clear paths

**Minor weakness:**

- **Save batch button lacks visual weight differentiation**:
  - Both "Save batch" and "Cancel" inherit default button sizing (no `.button` class or token)
  - No button variant tokens exist in tokens.css to distinguish primary/secondary actions
  - Design debt G-02-4 left unfixed per A-3 (Impeccable to decide); documented as "Save batch is hard to find"
  - User relying on label text, not visual weight, to distinguish save from cancel

- **Amend half-and-half affordance clarity** (documented in 02-04):
  - "Amend" button corrects current batch; "Record another batch" creates new one
  - Both use identical button styling; user must read label carefully
  - No visual distinction (icon, color, weight) between the two operations

**Evidence files:** `BatchMargin.jsx` lines 156-240, 243-327, 330-338; `RecipePage.jsx` beforeunload effect and isDraftDirty; `AxisMark.jsx` lines 41-50; `domain/batch.js` isTastingSaveable, domain/axes.js setMark

---

## Registry Safety Audit

**shadcn/ui not initialized** — `components.json` absent. No third-party component registries in use. Registry audit not applicable.

---

## Files Audited

- `app/src/ui/BatchMargin.jsx` — batch-log block, churn section, tasting read/write, batch list, Amend/Record buttons
- `app/src/ui/AxisMark.jsx` — nine-stop mark control, native radio group, Clear button
- `app/src/ui/Method.jsx` — struck step rendering, changed-line input, strike label scoping
- `app/src/ui/IngredientTable.jsx` — as-made column, numeric column sizing, total row, save gate hint
- `app/src/ui/RecipePage.jsx` — pen-layer state management, beforeunload guard, draft dirty check
- `app/src/styles/tokens.css` — all visual values: color, typography, spacing, sizing
- `app/src/styles/app.css` — all component styling: batch margin, axis mark, method strike, numeric columns

---

## Notes

- **UAT Status**: 3 passed, 0 issues; known design debt G-02-4 (Save batch findability) documented and deferred to Impeccable
- **Design Compliance**: All code follows project conventions — every visual value through tokens, recorded vs. planned distinguished by ink + position not color alone, notes rendered as text not markup
- **Automated Verification**: 180 passing tests (Vitest 5.0.0) cover domain layer, component rendering (renderToStaticMarkup), and integration; no browser-based visual regression suite configured for this phase
