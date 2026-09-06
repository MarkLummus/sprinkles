# Phase 1: Read the churned recipe - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-05
**Phase:** 1-Read the churned recipe
**Areas discussed:** Ingredient data and which figures must match, Data model and the provisional store, Target bands, Project skeleton: routing and test runner

---

## Ingredient data and which figures must match

| Option | Description | Selected |
|--------|-------------|----------|
| The slice's 12-row library | Reproduces the sheet exactly; carries per-field basis and notes | ✓ |
| Seed DB 0.2-draft rows | Sourced, but coefficients differ from the sheet | |
| Seed DB rows overridden to the sheet's coefficients | Seed DB records with pinned PAC/POD, flagged recipe-stated | |

**User's choice:** The slice's 12-row library.

| Option | Description | Selected |
|--------|-------------|----------|
| Exactly, as a regression fixture | Sheet figures as exact fixture | |
| Within 0.1 | Rounding tolerated; fixture checks ranges | ✓ |
| No numeric requirement | Nothing enforces the sheet's values | |

**User's choice:** Within 0.1.

| Option | Description | Selected |
|--------|-------------|----------|
| Exactly as printed | 370.4 stays; weighable rounding is a Phase 3/4 concern | ✓ |
| Weighable grams, exact kept in data | Show 370, store 370.4 | |
| Show both | Printed grams with weighable beside | |

**User's choice:** Exactly as printed.

| Option | Description | Selected |
|--------|-------------|----------|
| On the figure and on the row | Same fact in both places | ✓ |
| On the figure only | Table stays clean | |
| On the row only | Reader infers affected figures | |

**User's choice:** On the figure and on the row.

---

## Data model and the provisional store

| Option | Description | Selected |
|--------|-------------|----------|
| Embedded in the version | Each version carries a copy of coefficients and basis | ✓ |
| Library reference, snapshot at batch | Only a batch copies coefficients | |
| Embedded, plus a library link | Embedded with origin record remembered | |

**User's choice:** Embedded in the version.

| Option | Description | Selected |
|--------|-------------|----------|
| Browser storage (IndexedDB) with JSON export/import | No server code; export guards against purge | ✓ |
| JSON files in the repo via a dev-server write hook | Diffable files; dev server only | |
| In-memory with manual JSON export/import | Nothing persists unless exported | |

**User's choice:** Browser storage (IndexedDB) with JSON export/import.

| Option | Description | Selected |
|--------|-------------|----------|
| Seeded into the store on first run | Seed content becomes an ordinary record | ✓ |
| Built in, never stored | Always rendered from bundled data | |
| Loaded from a JSON file you supply | Store starts empty | |

**User's choice:** Seeded into the store on first run.

| Option | Description | Selected |
|--------|-------------|----------|
| Keep it mappable | Every Ice Ed field has a home | ✓ |
| Ignore Ice Ed for now | Design freely | |

**User's choice:** Keep it mappable.

---

## Target bands

| Option | Description | Selected |
|--------|-------------|----------|
| Per-recipe authored bands, seeded from the slice | PAC 22–26, POD 12–16, fat 16–20, MSNF 7.5–10, solids 38–42 | ✓ |
| Style preset with per-recipe override | Gelato/ice-cream defaults, recipe may override | |
| Preset only | Bands belong to the style | |

**User's choice:** Per-recipe authored bands, seeded from the slice.

| Option | Description | Selected |
|--------|-------------|----------|
| The value with 'no target set' | Rule without a hatched band | ✓ |
| Require a band for every figure | Seed a sugar-solids band now | |
| Hide the rule until a band exists | Plain number only | |

**User's choice:** The value with 'no target set'.

| Option | Description | Selected |
|--------|-------------|----------|
| One basis note under the formulation block | Coefficient set, conventions, estimated rows; per-figure on focus | ✓ |
| A basis line under every figure | Each rule carries its own basis | |
| Behind a details disclosure | Basis opens on demand | |

**User's choice:** One basis note under the formulation block.

| Option | Description | Selected |
|--------|-------------|----------|
| Inside / above / below with the amount | 'inside 22–26', '1.4 above 26'; words only | ✓ |
| Distance to nearest edge only | Always relative | |
| Number and band, no judgment word | '24.1 (22–26)' | |

**User's choice:** Inside / above / below with the amount.

---

## Project skeleton: routing and test runner

| Option | Description | Selected |
|--------|-------------|----------|
| A recipe list, then the recipe | One-item list; the brief's departing arrival | ✓ |
| Straight to the olive oil recipe | No list until a second recipe | |

**User's choice:** A recipe list, then the recipe.

| Option | Description | Selected |
|--------|-------------|----------|
| React Router | URL-addressable pages now | ✓ |
| No router in Phase 1 | State-driven view switching | |
| Hand-rolled hash routes | No dependency | |

**User's choice:** React Router.

| Option | Description | Selected |
|--------|-------------|----------|
| Vitest | Native to Vite; fixture as ordinary tests | ✓ |
| Node's built-in test runner | No dependency | |
| A verify script, no runner | What the slice did | |

**User's choice:** Vitest.

| Option | Description | Selected |
|--------|-------------|----------|
| Repo root | package.json at root, as CLAUDE.md assumes | |
| An app/ subfolder | Code apart from packet and evidence; CLAUDE.md to update | ✓ |

**User's choice:** An app/ subfolder.
**Notes:** Departs from CLAUDE.md's root-layout assumption; the Status section and commands are to be updated when the structure lands.

## Claude's Discretion

- Record identity scheme, schema-version field, coefficient-set naming.
- IndexedDB wrapper and repository interface shape.
- Empty-store detection for seeding; how export/import are exposed.
- Component decomposition, CSS approach, exact type faces within the brief.
- Exact basis-note wording beyond the required elements.

## Deferred Ideas

- Seed DB adoption and convention reconciliation (library phase).
- Style presets for bands (new-recipe creation).
- Weighable-gram rounding (Phases 3–4).
- Freezing curve on screen (not in milestone 1).
- Ice Ed import converter (import milestone).
