---
quick_id: 260917-gjo
slug: one-shared-page-gutter-for-the-running-h
status: complete
date: 2026-09-17
commits:
  - 4bcac2f
files_modified:
  - app/src/styles/tokens.css
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
---

# 260917-gjo: One shared page gutter for the running head, the notice and the page shell — Summary

The divergence 260917-ewf found and deliberately left: below 600px the page shell steps its
gutter in to 20px while the running head and the save notice stay at 48px, hanging 28px right of
the content they head and overlay. One commit closes it with a single custom property,
`--gap-page` (`tokens.css`), read by every box that needs the page's left edge; the breakpoint is
now stated once instead of three or four times.

## The set was four, not three

CONTEXT.md's table listed `.recipe-page`, `.running-head`, and `.page-status`. A grep for every
`app.css` declaration reading `--gap-xl` —
`grep -nE "^[[:space:]]+[a-z-]+:[^;]*var\(--gap-xl\)" app/src/styles/app.css` — returned five
declaration lines, not three: `.page-status`'s `inset-inline-start` and its `max-width` viewport
arm, `.running-head`'s padding, `.recipe-page`'s padding, and a fourth box CONTEXT.md's table
missed — `.not-found` (`app.css:359` before this change), the "no recipe found" page body. Per
`.impeccable/surfaces/route-recipe-version.md`, that state carries the running head above it and a
second link back to the list — it IS the page body in that route state, sitting at the page
gutter, wrong below 600px in exactly the same way as the other three. Changing three of four would
have been worse than changing none, so it is in.

**Not a fifth.** `.recipe-list__import-errors`'s `padding-left: var(--gap-m)` is a bullet indent,
not a page gutter — and the recipe LIST route has no page gutter at all. `RecipeList.jsx` returns
`.recipe-list__transfer` and `.recipe-list`, neither carrying inline padding, so the list sits
flush at 0. Recorded, not touched — a separate pre-existing question for whichever phase next
touches that route.

## Where the property lives, and why it is the first one in app.css

`--gap-page: var(--gap-xl);` is defined once in `tokens.css`, immediately after `--gap-xl`. The
step to `--gap-m` below 600px is declared once, as `:root { --gap-page: var(--gap-m); }`, the
*first* rule inside `app.css`'s already-existing `@media (max-width: 600px)` block — replacing the
`.recipe-page`-only override that block used to carry.

Two reasons put the breakpoint in `app.css` and not `tokens.css`, both stated in `--gap-page`'s own
comment: **(1)** `tokens.css`'s own comment already states the convention — breakpoint literals
stay in `app.css`'s `@media` preludes, the exception the touch block already established; `tokens.css`
opens no at-rule today. **(2)** Measured, not just conventional: `css-source.js`'s
`readCustomProperties` regex-scans the whole file into one flat `{name: value}` map with no notion
of a media condition, last declaration winning. A second `--gap-page` declaration in `tokens.css`
would make `resolveTokenPx(tokens, '--gap-page')` silently answer 20 — the phone value — for every
suite that ever reads the desktop gutter. Confirmed safe in the chosen direction: both suites call
`readCustomProperties(tokensSource)` and `readAllRules(appCssSource)`, never the reverse, so a
custom property declared in `app.css` never poisons the token map.

This makes `--gap-page` the first custom property `app.css` itself declares
(`grep -nE "^[[:space:]]+--[a-z-]+:" app/src/styles/app.css` returned nothing before this task).
That does not breach `app.css`'s own "every value reads a custom property defined in `tokens.css`"
convention: `--gap-page` IS defined in `tokens.css`, both its arms read tokens, and no literal
enters `app.css`. What `app.css` gains is one breakpoint-scoped re-declaration of a property it was
already the right file to hold the breakpoint for.

The mechanism rests on one fact, now pinned by an assertion rather than trusted: `main.jsx` imports
`./styles/tokens.css` before `./styles/app.css`. Both declarations sit on `:root` at equal
specificity and a media query adds none, so source order alone decides that `app.css`'s arm wins
below 600px.

## Neither media register needed updating — measured, not assumed

CONTEXT.md warned that `binder.test.js` (an `@media` count plus an `allowedMedia` list) and
`cross-cutting.test.js` (a sorted seven-condition set) might both need updating together if the
at-rule shape changed. It did not: this task adds a rule *inside* an existing block and removes
another from the same block, so the count stays 7 and the conditions are identical.
`binder.test.js` is absent from the diff by design — confirmed by `git diff --name-only`, which
lists exactly `app/src/styles/app.css`, `app/src/styles/cross-cutting.test.js`,
`app/src/styles/tokens.css`.

## The four assertions that moved, and why that is not loosening them

All four in `cross-cutting.test.js`, all rewritten to track the mechanism that replaced the one
they used to pin:

- **The 600px `.recipe-page` test** (`~201-210`) used to assert `.recipe-page` carried its own
  reduced padding inside the 600px block. That rule is now deleted, so the test asserts what
  replaced it: a `:root` rule scoped to `(max-width: 600px)` declaring `--gap-page: var(--gap-m)`,
  and that no `.recipe-page` rule remains in that block at all.
- **The shared-left-edge test** (`~610-613`) used to check two rules (`.page-status`,
  `.running-head`) for `var(--gap-xl)`. It now checks all four consumers for `var(--gap-page)` in
  one test, retitled "four boxes, one gutter" — so none of the four can drift alone.
  `.page-status`'s `max-width` assertion (`~618`, in a neighboring test) was updated to the
  corrected first term, `calc(100vw - var(--gap-page) - var(--gap-m))`.

Each states a mechanism this task moved. All four consumers are now asserted through the one
shared property rather than a scattering of token references, which is a strictly stronger
contract than before.

## A comment trap avoided while amending false prose

`.page-status`'s comment block (previously naming the pre-existing sub-600px mismatch as
unresolved — now resolved, since all four boxes read one property) was rewritten to record the
shared property instead. The first draft of that rewrite reintroduced the exact trap CONTEXT.md
and the plan warned about: a line reading `inset-inline-start: var(--gap-page) is the same shared
token...` matched the verify gate's anchored `^[[:space:]]+[a-z-]+:` pattern as if it were a real
declaration, inflating the "how many declarations read `--gap-page`" grep from five lines to six.
Reworded to name the property in prose without the leading `property:` shape
("this box's own left inset reads the same shared gutter, `--gap-page`, that `.running-head`
reads...") — verified the grep returns exactly five lines, one per real consumer, after the fix.
The 1099.98px prelude comment (`~2340-2354`) was also amended: its sentence naming `--gap-xl` as
the mechanism now says the page padding reads the shared `--gap-page`, keeping its real point —
no padding declaration lives in that block — verbatim.

## Test results

`npm --prefix app test` → **34 files passed, 982 tests passed**. Measured baseline at planning
time, confirmed by an actual run before any edit: **977 tests across 34 files**. +5 net, all from
the new `cross-cutting.test.js` describe block ("one shared page gutter") added in this task: the
definition-and-resolution assertion, the at-rule-free assertion, the `main.jsx` import-order
assertion, the no-media-override guard, and the no-`--gap-xl`-survivor guard. The two rewritten
tests (the 600px block test, the widened shared-left-edge test) hold their prior counts — a moved
mechanism, not an added one. Real, unrounded, re-run after every edit; no assertion was adjusted to
hit a number. `npm --prefix app run build` also succeeds.

## Observations recorded, deliberately not fixed

- **The recipe LIST route has no page gutter at all.** `.recipe-list` and `.recipe-list__transfer`
  carry no inline padding — the list sits flush at 0. A separate pre-existing question, not part
  of this task's four boxes.
- **`tokens.css`'s ingredient-column arithmetic (`~172-178`) and `columns.test.js:43-44`** both
  still name `--gap-xl (48px) padding on both sides` as `.recipe-page`'s page padding. The
  arithmetic stays correct — `--gap-page` IS `--gap-xl` at the widths it is stated for (1280px,
  1024px) — but a reader grepping `--gap-xl` for the page padding will no longer land on the rule
  that draws it. `--gap-page`'s own comment in `tokens.css` names this relationship; neither
  `columns.test.js` nor its arithmetic was edited, both being outside this task's file set.
- **`DESIGN.md`'s responsive ladder** says the 600px step shrinks "the page padding" — true before
  and after, and now also true of the running head and the notice, which it never mentioned.
  `DESIGN.md` is Impeccable's file; nothing under `.impeccable/` or `DESIGN.md` was touched by this
  task. Named here for the orchestrator/Impeccable to fold into the next `/impeccable document`
  pass.

## What the orchestrator checks in a browser (not gated here)

- At 1024px: all four left edges at 48px — the running head, the notice, the page's content, and
  (on a bad version id) the "no recipe found" page.
- At 393px: all four at 20px, in step with the page shell, nothing hanging right of the content.
- The notice still overlays the top of the page and still reflows nothing when it appears or
  clears.
- The notice's `max-width` no longer overshoots the right edge at 393px.

## Self-Check: PASSED

- FOUND: app/src/styles/tokens.css
- FOUND: app/src/styles/app.css
- FOUND: app/src/styles/cross-cutting.test.js
- FOUND: commit 4bcac2f in `git log --oneline`
- CONFIRMED: `npm --prefix app test` green at 34 files / 982 tests
- CONFIRMED: `grep -nE "^[[:space:]]+--gap-page:" app/src/styles/tokens.css` prints exactly one line
- CONFIRMED: `grep -nE "^[[:space:]]+[a-z-]+:[^;]*var\(--gap-xl\)" app/src/styles/app.css` exits 1
- CONFIRMED: `grep -nE "^[[:space:]]+[a-z-]+:[^;]*var\(--gap-page\)" app/src/styles/app.css` prints
  exactly five lines
- CONFIRMED: `grep -c "^@media" app/src/styles/app.css` prints 7
- CONFIRMED: `grep -nE "^[[:space:]]*@media" app/src/styles/tokens.css` exits 1
- CONFIRMED: `git diff --name-only HEAD~1 HEAD` lists exactly the three files in `files_modified`
  above; `binder.test.js` is absent
