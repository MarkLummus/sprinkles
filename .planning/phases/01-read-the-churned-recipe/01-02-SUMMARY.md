---
phase: 01-read-the-churned-recipe
plan: 02
subsystem: recipe-read
tags: [impeccable, design-tokens, css-custom-properties, react, vitest]

requires:
  - phase: 01-01
    provides: "The app/ workspace, the router, the repository seam, and the recipe page's reserved semantic regions"
provides:
  - "The Formulation Cookbook direction contract, recorded in .impeccable/surfaces/route-recipe.md § Direction contract: two type stacks, four colour roles, a six-step spacing scale, four rule weights plus a hatch pattern, the focus treatment, and the five plain-language block names"
  - "app/src/styles/tokens.css implementing every contract value as a CSS custom property — the app's only source of visual tokens"
  - "The seeded olive oil version completed with its ten method steps, five authored notes, and declaredAxes"
  - "Method and Authored components, wired into the recipe page's method and margin regions"
affects: ["01-03", "01-04", "phase-02-batch-record", "phase-03-develop-next-version"]

actuals:
  tokens: 5935
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "Every colour, face, size, spacing value, and rule weight in app/src/styles reads through a var(--…) custom property defined once in tokens.css; no component or stylesheet carries a literal"
    - "Region block names (Headnote, Ingredient table, Method, Margin) render as a visible .region-name running head in the bookcloth colour — the one role that identifies the book without ever carrying state"
    - "System font stacks only (Georgia for the text face, -apple-system/Segoe UI for the grotesk) — no font file fetched, no third-party origin, satisfying TRUST-01/IMP-01 without adding a self-hosted asset"

key-files:
  created:
    - app/src/styles/tokens.css
    - app/src/data/olive-oil.test.js
    - app/src/ui/Method.jsx
    - app/src/ui/Authored.jsx
  modified:
    - .impeccable/surfaces/route-recipe.md
    - app/src/main.jsx
    - app/src/styles/app.css
    - app/src/data/olive-oil.js
    - app/src/ui/RecipePage.jsx

key-decisions:
  - "Bookcloth colour chosen as a muted bottle green (#33513B) — a third hue distinct from ink and pen blue, used only for the plain-language block-name running heads, per the brief's carried raise that every block wears its name."
  - "Type stacks are system fonts only (Georgia + system sans), not self-hosted files — simplest way to satisfy the no-third-party-origin constraint without adding a font asset the project would then have to license and maintain."
  - "Method.jsx returns a fragment rather than its own <section>, matching IngredientTable.jsx's pattern of letting RecipePage's wrapper section carry the region's semantic label — avoids a nested landmark."

requirements-completed: []

coverage:
  - id: D1
    description: "The Formulation Cookbook direction contract is recorded in the surface brief before any token exists in code, closing all seven required items (type, colour, spacing, rule weights, focus treatment, block names, what stays open)"
    verification:
      - kind: other
        ref: "grep -c '^## Direction contract' .impeccable/surfaces/route-recipe.md"
        status: pass
    human_judgment: false
  - id: D2
    description: "tokens.css implements the contract as CSS custom properties; app.css and the new components consume only var(--…) references, no literal colour or font face"
    verification:
      - kind: other
        ref: "npm --prefix app run build"
        status: pass
      - kind: other
        ref: "grep -Ei '#[0-9a-f]{3,6}' app/src/styles/app.css app/src/ui/Method.jsx app/src/ui/Authored.jsx (expect none)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The seeded version carries the sheet's ten method steps with typed targets and its five authored notes, proven by test"
    verification:
      - kind: unit
        ref: "app/src/data/olive-oil.test.js — method order, five target sets, both note counts, declaredAxes"
        status: pass
    human_judgment: false
  - id: D4
    description: "The recipe page renders as the book spread: method on the right with target chips, authored notes in the margin under 'authored' legends, no derived advisory invented in the empty slot, no component renders a string as raw markup"
    verification:
      - kind: other
        ref: "npm --prefix app test; grep -rIl dangerouslySetInnerHTML app/src (expect none)"
        status: pass
    human_judgment: true
    rationale: "The plan's own <verify> block defers the full-page visual read (book-spread composition, chip layout, legend placement) to a <human-check> harvested at end-of-phase per workflow.human_verify_mode=end-of-phase; every mechanically checkable fact behind it (exports, DOM structure by source inspection, target values present, no raw-markup escape hatch) is confirmed above."

duration: 11min
completed: 2026-09-06
status: complete
---

# Phase 1 Plan 2: Direction Contract, Tokens, and the Sheet's Method and Notes Summary

**The Formulation Cookbook direction contract (Georgia text face, system grotesk, four colour roles including a new bottle-green bookcloth) implemented as CSS custom properties, plus the seeded version's ten method steps and five authored notes rendering in the recipe page's method and margin regions.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-09-05T22:00:41-04:00
- **Completed:** 2026-09-05T22:11:41-04:00
- **Tasks:** 3
- **Files modified:** 9 (4 created, 5 modified)

## Accomplishments
- Wrote the Formulation Cookbook's direction contract into `.impeccable/surfaces/route-recipe.md`, using the `impeccable` skill's context and new-work conventions to convert § 3's confirmed direction into seven concrete decisions (Task 1)
- Implemented every contract value as a CSS custom property in `app/src/styles/tokens.css`, and rewrote `app.css` so no component or stylesheet carries a literal colour, face, size, spacing value, or rule weight (Task 1)
- Completed the seeded olive oil version's `method` (ten steps), `authored` notes (three carried-forward, two before-you-start), and `declaredAxes`, transcribed verbatim and proven by a new test file (Task 2, TDD)
- Built `Method.jsx` and `Authored.jsx` and wired both into `RecipePage.jsx`'s reserved regions, applying the contract's plain-language block names in the bookcloth colour, with the advisory slot left empty (Task 3)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write the direction contract into the brief, then implement it as tokens** — `b1ef5e2` (feat)
2. **Task 2: Complete the seeded version — the method and the authored notes** (TDD)
   - `2a7fb51` (test) — failing tests for method order, targets, authored note counts, declaredAxes
   - `7421e93` (feat) — method, authored, and declaredAxes added to `oliveOilVersion`
3. **Task 3: The spread reads — method on the right, authored notes in the margin** — `d474b67` (feat)

**Plan metadata:** committed separately after this summary.

## Files Created/Modified
- `.impeccable/surfaces/route-recipe.md` — appended the `## Direction contract` section (type, colour, spacing, rule drawing, focus treatment, block names, open items)
- `app/src/styles/tokens.css` — the contract's values as CSS custom properties on `:root`
- `app/src/styles/app.css` — rewritten to consume only `var(--…)` references; adds method-step, target-chip, authored-note, and `.region-name` styles
- `app/src/main.jsx` — imports `tokens.css` ahead of `app.css`
- `app/src/data/olive-oil.js` — adds `method` (ten steps), `authored` (five notes), `declaredAxes`
- `app/src/data/olive-oil.test.js` — new: proves step order, five target sets, note counts, declaredAxes
- `app/src/ui/Method.jsx` — new: numbered steps, fixed margin column, bold lead-in, prose, target chips, purpose/aside
- `app/src/ui/Authored.jsx` — new: carried-forward and before-you-start lists under "authored" legends
- `app/src/ui/RecipePage.jsx` — wires `Method` and `Authored` into their regions; adds region-name running heads for Headnote, Ingredient table, and Margin

## Decisions Made
- Bookcloth colour is a new muted bottle green (`#33513B`), distinct from ink and pen blue, used only for block-name running heads — never a status signal.
- Type stacks are system fonts (Georgia + system sans), not self-hosted files, to satisfy the no-third-party-origin constraint with the least moving parts.
- `Method.jsx` returns a fragment rather than owning its own `<section>`, so `RecipePage.jsx`'s wrapper section carries the region's `aria-label`, matching `IngredientTable.jsx`'s existing pattern and avoiding a nested landmark.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The direction contract and its token layer are the only source of visual truth in the app; plan 01-03's six graduated rules and formulation note consume the same rule-drawing and hatch values without choosing their own.
- `oliveOilVersion` now carries every field plan 01-03 and 01-04 need (`targets`, `method`, `authored`, `declaredAxes`); no further seed-content additions are expected before Phase 2.
- REC1-01 is declared by this plan, 01-01, and 01-03; the shared-ID gate correctly deferred marking it complete until 01-03 also finishes (`gsd-tools requirements ready-ids` reports 0/1 ready).
- The formulation-note-region remains empty by design — plan 01-03 fills it.

---
*Phase: 01-read-the-churned-recipe*
*Completed: 2026-09-06*

## Self-Check: PASSED

- All 9 key files verified present on disk (`[ -f ]`).
- All 4 commits verified in git log: `b1ef5e2`, `2a7fb51`, `7421e93`, `d474b67`.
- Plan-level `<verification>` re-run: `npm --prefix app run build` exits 0 ("built in" line present); `npm --prefix app test` exits 0 with 28 passing tests (≥28 required); `.impeccable/surfaces/route-recipe.md` contains `## Direction contract` covering all seven items; no third-party origin under `app/index.html` or `app/src`; no `dangerouslySetInnerHTML` under `app/src`; `app/src/styles/app.css` has no hex literal and no literal `font-family` value.
- Impeccable's mechanical detector (`impeccable detect --json`) returned no findings on the changed UI files.
