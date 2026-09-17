---
quick_id: 260917-ewf
slug: anchor-the-page-notice-beneath-the-runni
status: complete
date: 2026-09-17
commits:
  - f0a12ce
  - 8db14cc
  - d2f075b
  - 0dd391e
files_modified:
  - app/src/router.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/binder.test.js
---

# 260917-ewf: Anchor the page notice beneath the running head, and keep it off the printed sheet — Summary

The last of the three findings from the Impeccable review of `1333a7e`. The page notice stopped
floating in the bottom-right corner and became a page-owned band anchored directly beneath the
running head, out of flow in both states; it is now also absent from print. Three independent
items, three commits — plus a fourth commit after the orchestrator's own browser check found the
notice landing one pixel from the running head's underline.

## Task 1 — the running head moves to the routed shell

`router.jsx`'s `RecipePageForRoute` now renders the running head inside a new `.page-head` band,
wrapping it with `<PageStatus/>` — the head and the notice are the band's only two children, so
the band's height is exactly the head's own height, with no magic offset. `<RecipePage>` stays a
**sibling after** that div, still carrying its `key={`${id}::${batchId ?? ''}`}` — the notice
remains outside the keyed page, exactly as CONTEXT.md required.

Both running-head paragraphs were deleted from `app/src/ui/RecipePage.jsx` (the not-found branch
and the main return); both single-child fragments collapsed to their one remaining element (the
`<>…</>` wrappers dropped), and the main return's whole JSX subtree was dedented two spaces to
match — a mechanical, whitespace-only consequence of removing one nesting level, not a style
change. `grep -n "running-head" app/src/ui/RecipePage.jsx` returns zero hits, including in prose;
the replacement comment above the not-found branch spells out "running head" with a space for
exactly that reason.

`RecipePage.test.jsx` gained a source-text ownership contract (the same idiom the file's existing
`RecipePage.jsx` refusal/failure-channel describe already uses): `router.jsx` renders the running
head exactly once, `RecipePage.jsx` renders it zero times, and `<PageStatus` precedes `<RecipePage`
with the key still present.

**(b) Why there is no markup test for the running head's new home.** `router.jsx` cannot be
imported by any test in this suite. The blocker is `createBrowserRouter` running at module scope
and calling `createBrowserHistory` → `getUrlBasedHistory`, which needs `document` — Vitest's
`environment: 'node'` has none, and `jsdom` is not a dependency at all. This is **not** the
IndexedDB reason CONTEXT.md gives; the repository mock (`vi.mock('../store/repository.js', …)`)
already handles that seam exactly as `RecipePage.test.jsx` does elsewhere, and does not clear this
blocker. So the running head's new home rests on the source-text contract above plus the
orchestrator's own browser check — no jsdom was added, no component was extracted for the sake of
a test, and no markup test was faked.

**(c) A gain, not a regression.** `RecipePage` returns `null` until the version resolves, so the
running head now also renders during that loading state — it did not before. This matches the
head's own contract, "the way home in every state" (the comment now above the not-found branch
records this explicitly).

## Task 2 — the notice leaves the corner and rides the running head

`.page-status` is now `position: absolute` against `.page-head` (`position: relative`), anchored
at `inset-block-start: 100%` (the band's own bottom edge, which is the running head's bottom edge
since the band holds nothing else) and `inset-inline-start: var(--gap-xl)` (the same token
`.running-head` reads for its own left padding). `position: fixed` and both `inset-*-end`
declarations are gone. Every other declaration — `z-index: 10`, `margin`, `padding`, the border,
`--ground` background, `--ink` text, `--face-grotesk`, `--type-control`, and the `.page-status:empty`
collapse — survives verbatim. No token, colour, or motion was added; nothing reflows in either
state, and no blank line is reserved for the notice.

**(a) The max-width correction, and why.** CONTEXT.md Item 2 and the plan both said to keep
`max-width` verbatim and only *observe* that its viewport arm,
`calc(100vw - 2 * var(--gap-m))`, was written for a box inset `--gap-m` from the RIGHT and is
geometrically stale once the box is left-anchored at `--gap-xl` — at 393px a full-measure sentence
could reach past the right edge. **The orchestrator authorized a correction for this one
declaration**, overriding that "keep verbatim" instruction: the viewport arm is now
`calc(100vw - var(--gap-xl) - var(--gap-m))` — the box's own left inset, plus one `--gap-m` of
breathing room on the right. The `min()` wrapper and the `--measure-prose` arm are untouched; the
fix reads tokens only, no literal. `cross-cutting.test.js`'s assertion for `.page-status`'s
`max-width` was updated to match the corrected calc. This is the one place this task's result
differs from CONTEXT.md's own text, and it is recorded here per the amendment's instruction.

**Left-edge determination (§ 1 of the plan, established by exhaustive grep, not assumed).**
`.running-head` reads `padding: var(--gap-m) var(--gap-xl) 0` — its only rule anywhere, at every
width. `.recipe-page` reads `padding: var(--gap-xl)` above 600px and `padding: var(--gap-m)` inside
the `@media (max-width: 600px)` block. `--gap-xl` is 48px, `--gap-m` is 20px, and neither token is
re-declared in any media block (`tokens.css` has no `@media` at all). So the two boxes agree at
48px above 600px and disagree below it. **The running head's edge won** — the notice's vertical
anchor is the head's own box, so taking a different box for the inline edge would measure the two
anchors off two different boxes; above 600px the two edges are identical anyway; and below 600px
the divergence is pre-existing between `.running-head` and `.recipe-page`, not introduced here.

**(e) The sub-600px divergence, observed and deliberately not fixed.** Below 600px
`.running-head` (and now `.page-status`, riding the same token) sits at 48px from the left while
`.recipe-page` frames at 20px. This mismatch belongs to the running head's own rule and to the
page-shell ladder, not to this task — no `.page-status` override was added inside the 600px block.

**The one-token offer, not taken here — until the browser check called for it (Task 4 below).**
The notice landed tight under the head — `.running-head` has no bottom padding — because no gap
value was specified and none was invented at plan time. Left out per the scope guard, pending the
browser check's own call.

## Task 3 — the notice leaves the printed sheet

`@media print { .page-status { display: none; } }` was appended at the very end of `app.css`,
after the forced-colors block — the project's first print rule, top-level, never nested. It
suppresses only `.page-status`; nothing else was styled for print, so Phase 4's print route and
its geometry are untouched.

Both media-block registers were extended, since both would otherwise go red the moment the block
landed: `cross-cutting.test.js`'s six-condition register became seven with `'print'` sorted last
(confirmed against JS's default string sort — `(` is 0x28, `p` is 0x70, so `'print'` sorts after
every parenthesized condition), plus a dedicated assertion resolving on `r.media === 'print'`
explicitly rather than through `mediaRuleFor` (which returns the first match across all blocks).
`binder.test.js`'s `@media` count became 7, `'print'` joined `allowedMedia`, and the block's own
comment now calls the print layer the last block rather than forced-colors.

## Task 4 — the gap the browser check asked for

The orchestrator measured the built page in Chrome at 1024px after Tasks 1–3 landed. Everything
else held exactly as planned: the notice's left edge at x=48 (matching the running head's own
`--gap-xl` padding), its top at y=35 (precisely `.page-head`'s bottom edge, so
`inset-block-start: 100%` needed no literal offset), zero reflow (`.recipe-page` and
`.running-head` both measured 0px of movement), the notice overlaying the article beneath it, and
survival across the save's navigation. The one thing that did not read right: the "Sprinkles"
link's underline box bottom measured y=34, one pixel above the notice's own top border at y=35 —
two unrelated ink rules landing close enough to read as a collision rather than a relationship.

Applied the remedy the plan already named, as a fourth atomic commit: `margin-block-start: var(--gap-xs)`
on `.page-status`. Nothing else in the rule changed — `position: absolute` is untouched, so the
notice stays out of flow, and a margin on an absolutely positioned box offsets only that box,
never the head or the page beneath it (confirmed by the orchestrator's own before/after
measurement showing 0px of reflow). `cross-cutting.test.js`'s "every other declaration survives"
test was updated rather than left stale — its title now says "margin-block-start added" and it
asserts the new declaration directly, alongside the pre-existing `margin: 0`.

## Test results

`npm --prefix app test` → **34 files passed, 977 tests passed** (unchanged by Task 4: the new
`margin-block-start` declaration was asserted inside an existing test, not a new one). Measured
baseline at planning time: **968 tests across 34 files** (confirmed by an actual run before any
edit). +9 net: +3 from Task 1's source-text ownership contract, +5 from Task 2's new geometry
describe (anchor, shared left edge, corrected max-width, surviving declarations, no-transition),
+1 from Task 3's print assertion, +0 from Task 4 (an assertion added to an existing test). Real,
unrounded, re-run after every task; no assertion was adjusted to hit a number.

`git diff --name-only` across all four commits touches exactly the six files in `files_modified`
above, split correctly (`router.jsx`/`RecipePage.jsx`/`RecipePage.test.jsx`/`app.css` in commit 1;
`app.css`/`cross-cutting.test.js` in commit 2; `app.css`/`binder.test.js`/`cross-cutting.test.js`
in commit 3; `app.css`/`cross-cutting.test.js` again in commit 4 — `app.css` legitimately recurs
in every commit, since each task touches a different region or declaration of the same file).

## Outstanding for the orchestrator

**(d) `.impeccable/surfaces/route-recipe-version.md` § 4 is now stale.** It scopes "the running
head 'Sprinkles' in ink as the link home" to the version route's own component. After Task 1 the
head belongs to the routed shell (`router.jsx`) and is drawn on every list-less recipe route,
including the loading state. No file under `.impeccable/` was touched by this task — the
orchestrator owns that revision.

**The pending todo stays open.** `.planning/todos/pending/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md`
was not edited, closed, or deleted. This task landed only the notice's presentation and its print
suppression; the batch save's own announcement, the focus landing, the flash-message API, and the
layout route remain outstanding on that todo.

## The orchestrator's browser check (Chrome, 1024px) — done, remedy applied in Task 4

- The notice's left edge measured x=48, matching the running head's own left edge (`--gap-xl`). **Pass.**
- The notice's top measured y=35, precisely the running head's bottom edge, confirming
  `inset-block-start: 100%` needed no literal offset. **Pass.**
- `.recipe-page` and `.running-head` both measured 0px of movement when the notice appeared —
  nothing reflowed. **Pass.**
- The notice overlays the article beneath it, and survived the save's navigation. **Pass.**
- The running head's underline box bottom (y=34) sat one pixel from the notice's own top border
  (y=35) — read as a collision, not a relationship. **Fixed in Task 4**
  (`margin-block-start: var(--gap-xs)`).

Still open, per `human_verify_mode: end-of-phase` (this project has no DOM environment; every
component test renders through `renderToStaticMarkup` in Vitest's `node` environment, never
jsdom):

- The notice's left edge below 600px, where the running head's and `.recipe-page`'s edges diverge
  (expected, per the left-edge determination above — not a defect to chase).
- Absence from print preview, and that nothing else about the page changed in print.

## Self-Check: PASSED

- FOUND: app/src/router.jsx
- FOUND: app/src/ui/RecipePage.jsx
- FOUND: app/src/ui/RecipePage.test.jsx
- FOUND: app/src/styles/app.css
- FOUND: app/src/styles/cross-cutting.test.js
- FOUND: app/src/styles/binder.test.js
- FOUND: commit f0a12ce in `git log --oneline`
- FOUND: commit 8db14cc in `git log --oneline`
- FOUND: commit d2f075b in `git log --oneline`
- FOUND: commit 0dd391e in `git log --oneline`
- CONFIRMED: `npm --prefix app test` green at 34 files / 977 tests
- CONFIRMED: zero hits for `running-head` (markup or prose) in `app/src/ui/RecipePage.jsx`
- CONFIRMED: `app/src/styles/app.css` carries exactly 7 top-level `@media` blocks, the seventh
  being `@media print`, and no `@page` anywhere
