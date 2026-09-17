# 260917-ewf — Context (locked decisions)

The last of three findings from the Impeccable review of `1333a7e`. Mark decided both points in
session on 2026-09-17. Nothing here is open.

## Background

`.page-status` (`app/src/styles/app.css:265`) is the page-scoped live region introduced with the
version-save work. It is `position: fixed` in the bottom-right corner — measured at 893,935 in a
1024×984 viewport — floating over whatever is beneath it. Mark's own decision record
(`.planning/todos/pending/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md`) says
"a quiet page-level notice beneath the main header fits Sprinkles better than a floating rounded
notification, though it is architecturally still page-owned."

It also has **no print rule**, and there is no `@media print` block anywhere in `app/src/styles`. A
`position: fixed` element typically repeats on every printed page in Chrome, and the printed bench
sheet is this product's core-value artifact (PRODUCT.md, "Paper works the kitchen").

**Mark's ruling on how it occupies space:** it stays **out of flow** — absolutely positioned,
anchored beneath the running head instead of the viewport corner. It must never reflow the page;
DESIGN.md's "nothing moves" holds, so it overlays the top of the page. Do **not** move it into normal
flow, and do **not** reserve a permanent blank line for it (that is the void the 2026-09-16 critique
docked for under the group cues).

## Item 1 — lift the running head into the routed shell

The notice must stay **outside** the keyed `RecipePage` — that key is what lets it survive the save's
navigation, and `router.jsx`'s header comment documents the two data-corruption bugs the key makes
unreachable. Do not weaken it. But the running head it must sit beneath is currently **inside**
`RecipePage`, rendered twice: `app/src/ui/RecipePage.jsx` ~836 (the "no recipe found" branch) and
~1708 (the main page). So the head moves to the shell; anchoring by a magic offset instead would be
fragile and would depend on `RecipePage`'s internals.

- In `RecipePageForRoute` (`app/src/router.jsx`), render the running head —
  `<p className="running-head"><Link to="/">Sprinkles</Link></p>` — above `<PageStatus/>` and
  `<RecipePage/>`, wrapped so the notice can anchor to it.
- Remove **both** running-head paragraphs from `RecipePage.jsx`. Keep the "Back to the recipe list"
  link in the not-found branch; only the running head moves.
- Side effect to keep, not fight: `RecipePage` returns `null` until the version resolves, so the head
  will now also show during load. That matches its own comment — "the way home in every state" — so
  it is an improvement. Note it in the SUMMARY.
- `RecipeList` has no running head and is not part of this. Leave it alone.
- Coverage: `.running-head` has no markup test, only a CSS-register test at
  `app/src/styles/cross-cutting.test.js:581`, so the lift costs no existing coverage. Confirm that
  yourself before relying on it.

## Item 2 — reposition the notice

- `.page-status` becomes absolutely positioned against the shell wrapper (give the wrapper
  `position: relative`), anchored directly beneath the running head and aligned to the same left edge
  as the page content rather than to a corner.
- Drop `inset-block-end` and `inset-inline-end`. Keep it overlaying (`z-index` stays), keep the
  `:empty` collapse, and keep every existing visual declaration — border, ground background, ink
  text, grotesk face, control size, max-width.
- Every value reads a custom property from `app/src/styles/tokens.css`. No literal, no colour change,
  no motion, no transition.

## Item 3 — print suppression

- Add `@media print { .page-status { display: none; } }`. This is the project's **first** print
  block, so place and comment it so it reads as the start of a print layer rather than a stray rule.
- Suppress **only** `.page-status`. Do not style anything else for print — Phase 4 owns the print
  route and its geometry, and this must not pre-empt it.

## Constraints

- Do not change which channel any sentence uses. `VERSION_SAVED_STATUS` stays page-scoped; refusals
  and storage failures stay form-scoped. That was settled in 260917-e5k (`51c862e`, `1c50cb7`).
- Do not touch the batch pen, the churn-date wiring, the version field errors, or `PenFoot`.
- Notes and prose render as text, never markup.

## Verification

1. `npm --prefix app test` — baseline **968 passing across 34 files**. Report the real number; never
   adjust an assertion to hit it.
2. Add coverage in `cross-cutting.test.js` for the print suppression and the notice's new
   positioning — that file reads the stylesheet, so both are testable there.
3. For the running head's new home: `router.jsx` cannot be rendered in tests, because `RecipePage`
   opens real IndexedDB at module load. If no honest markup test is possible, say so rather than
   faking one.
4. Browser checks belong to the orchestrator, not the executor: position beneath the head, overlay
   without reflow, and absence from print preview.
