---
quick_id: 260917-e5k
slug: retire-the-orphaned-hint-rules-and-move-
status: complete
date: 2026-09-17
commits:
  - 51c862e
  - 1c50cb7
files_modified:
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
---

# 260917-e5k: Retire the orphaned hint rules, and move the version pen's refusal to form scope — Summary

Two independent follow-ups from the Impeccable review of `1333a7e`, approved by Mark on
2026-09-17. Item 1 deleted three dead CSS rules and repointed the two tests pinning them at the
rules a component actually renders. Item 2 brought the version pen into line with the batch pen:
a refused save and a failed write now speak inside the pen, beside the controls and the kept
draft, instead of in the page region reserved for the save that ends the session.

## Task 1 — the three orphaned hint rules

**Removing a rule nothing renders changed no rendered pixel.** `.versions__hint`,
`.batch-margin__hint` and `.pen-hint` were deleted from `app/src/styles/app.css` verbatim, with
no other rule's blank-line rhythm disturbed. `grep -rn "pen-hint\|batch-margin__hint\|versions__hint" app/src`
returned zero hits afterward, including inside the test file itself — the three names appear
nowhere under `app/src` any more, not even in a comment.

**How the live helper/status set was established and confirmed:** not guessed. Two greps over
`app/src` — one for the three dead names (hits only in the stylesheet and the test file, never
JSX), one for every `className` a component actually renders that names a helper or status role.
The second grep surfaced five live sites, one of which (`.tasting-status pen-helper`) shares a
class with another (`.save-ceremony__status pen-helper`) — both carry no type rule of their own,
their face and size arriving through the shared `.pen-helper` class on the same element. The
type-role set that remained was four selectors: `.page-status`, `.form-status`,
`.save-ceremony__hint`, `.pen-helper`. Confirmed live by reading each rule's own declarations in
`app.css` (all four carry `font-family: var(--face-grotesk)` and `font-size: var(--type-control)`)
and by running the retargeted tests, which passed against exactly those four.

Three findings that fell out of the grep, worth recording:

- `.pen-helper` states its guarantee positively — `text-transform: none; font-style: normal` —
  rather than by omission. The old test's `.not.toMatch(/text-transform/)` /
  `.not.toMatch(/font-style/)` assertions would have gone red on the very rule that carries the
  guarantee most widely. The retarget collects every declared `text-transform`/`font-style`
  value with `matchAll` and asserts each one is `none`/`normal`, never asserting absence.
- `.save-ceremony__status` and `.tasting-status` are live class names on rendered elements, but
  neither carries a type rule of its own — both stayed out of the type-role list for that reason,
  matching the plan's own finding.
- `.field-requirement, .field-error` read `--size-small-print`, a deliberate different role from
  quick task 260916-xbh, and stayed out of both blocks.

Both retargeted `cross-cutting.test.js` blocks now iterate a single shared
`HELPER_STATUS_SELECTORS` constant so the two tests can never disagree, and both titles read
"four" rather than "three".

## Task 2 — the version pen's refusal and failure drop to form scope

`VersionRow.jsx` gained a `formStatus = ''` prop and mounts one
`<p className="form-status" role="status" aria-live="polite">` in the `openPen === 'plan'`
branch, immediately above `.headnote__ceremony` — matching `BatchRow.jsx`'s own region in
element, classes and ARIA exactly. `RecipePage.jsx` now passes `formStatus={formStatus}` on the
`VersionRow` mount, reusing the existing channel rather than adding a second state: `BatchRow`
mounts only while `mode !== 'developing'`, and its own `.form-status` only while
`mode === 'recording'`, so exactly one `.form-status` element ever exists at a time — the version
pen and the batch pen can never both be open.

Five sites moved from `onPageStatus` to `announce()` (the form channel, which persists unless
`selfClear: true` is passed, so `persist: true` was already honoured by construction, not a
flag): the version-line refusal (`VERSION_BLOCKED_STATUS`, one site in `buildPenFields`) and all
**four** `VERSION_SAVE_ERROR` sites — the plan's own live grep found two per handler
(`handleSaveAsNewVersion`, `handleSaveOverVersion`), a synchronous constructor `catch` and a
promise `.catch()` each, not the two `.catch()` handlers CONTEXT.md's earlier draft named. Both
`VERSION_SAVED_STATUS` success sites were left untouched — the page region now speaks only on a
successful version save. Five existing page clears (`onPageStatus('')`) each gained a form clear
beside them, never a replacement; the one in `handleStartDeveloping` is load-bearing, not
defensive — without it a refusal would survive in `formStatus` after the pen closes and print
itself the next time the pen opens.

Two comments (in the `fieldErrors`/`invalidFieldTarget` state block and beside `recordStatus`)
described `formStatus` as belonging to one pen specifically ("the foot's own... channel"); both
were corrected to say the open pen's own channel, whichever pen is open, since that description
is now false and both sentences sit directly beside the state this task changes.

**`.save-ceremony__hint` — the honest caveat.** It is live per the plan's own grep
(`PenFoot.jsx:35`) and stays in the four-selector type-role list. Its renderer is gated on a
`hint` prop that no current caller supplies (`RecipePage.jsx`'s `PenFoot` mount passes no
`penHint`). It was kept deliberately, exactly as the plan required, and its currently-missing
caller is **not** licence to delete it in a future pass — it is read by a test and otherwise
untouched here.

### A deviation worth naming

The existing `RecipePage.test.jsx` describe block titled "`VERSION_BLOCKED_STATUS` — the
page-owned reassurance for a field-owned Version error" became factually wrong the moment
`VERSION_BLOCKED_STATUS` moved off the page channel in this task. Its title was corrected to
"the form-owned reassurance... (260917-e5k: moved off the page channel)"; the test body (which
only pins the constant's string value) was not touched. This is a Rule 1 deviation — the title
directly describes the exact behavior this task changes, not adjacent unrelated code, so leaving
it stating the opposite of the new truth would misdocument the very code being moved.

### A gap the plan's own sanity check did not actually catch

The plan's Task 2 verify step says to comment out the `formStatus` prop on the `VersionRow` mount
and confirm a test goes red. Tried literally (commenting out `formStatus={formStatus}` at the
`RecipePage.jsx` mount site) and re-ran the full suite: **nothing went red** — 968/34, unchanged.
This project's house style never renders `RecipePage.jsx` itself (it opens a real IndexedDB at
module load, per `RecipePage.test.jsx`'s own header comment), so no automated test exercises that
one wiring line. The source-text guard covers the *routing* (which function each constant is
passed to, inside `RecipePage.jsx`); the *prop-wiring* from `RecipePage.jsx` to the mounted
`VersionRow` is uncovered by any unit test and rests entirely on the end-of-phase browser UAT.
Restored the prop immediately and confirmed the suite returned to green before moving on. As a
genuine sanity check on the parts that *can* be tested this way: removing the `<p className="form-status">`
element itself from `VersionRow.jsx` correctly reds two of the three new `VersionRow.test.jsx`
tests, and reverting one `announce(VERSION_SAVE_ERROR)` call back to `onPageStatus(...)` correctly
reds the new `RecipePage.test.jsx` source guard. Both were restored after confirming the red.

## Test results

`npm --prefix app test` → **34 files passed, 968 tests passed** (measured baseline 962/34; +6 new
tests, +0 net from Task 1's two retargeted-not-added-or-removed tests). Real, unrounded, run
after every edit in this task, never adjusted to hit a number.

`git diff --name-only` against `4b02413` shows exactly the six files named above, in the two
commits' correct split — `app.css`/`cross-cutting.test.js` in commit 1 only, the four `ui/` files
in commit 2 only. `git diff HEAD -- app/src/router.jsx app/src/ui/PenFoot.jsx app/src/styles/`
(scoped to commit 2's own diff) is empty. `router.jsx`, `PenFoot.jsx`, `BatchRow.jsx`,
`tokens.css`, the churn-date wiring, and the version field's own errors ("Enter a version." /
"This version already exists...") are untouched.

## Browser check — deferred to end-of-phase UAT

Per `human_verify_mode: end-of-phase`, none of the plan's browser checks were run in this task —
this project has **no DOM environment**: every component test renders through
`renderToStaticMarkup` (react-dom/server) in Vitest's `node` environment, never jsdom or
testing-library, and there is no click driver anywhere in the suite. So every claim that depends
on real interaction rather than markup — the page region staying empty on a blank-version refusal
while the pen's own region carries "Check the version. Your changes have been kept."; the field's
own "Enter a version." still taking focus; `document.querySelectorAll('.form-status').length`
being exactly 1; the refusal clearing on reopen rather than reappearing stale; the four-colour,
no-motion computed styling at 1099/759/600px and on a coarse pointer — is left for Mark to run at
`/recipe/olive-oil-ice-cream-v1`, exactly as the plan's own "Browser check" section lists. This
task's automated verification proves the markup and the routing: the region's presence, position,
and empty default; and that the refusal/failure/success constants each reach exactly the function
the plan requires.

## Self-Check: PASSED

- FOUND: app/src/styles/app.css
- FOUND: app/src/styles/cross-cutting.test.js
- FOUND: app/src/ui/RecipePage.jsx
- FOUND: app/src/ui/RecipePage.test.jsx
- FOUND: app/src/ui/VersionRow.jsx
- FOUND: app/src/ui/VersionRow.test.jsx
- FOUND: commit 51c862e in `git log --oneline`
- FOUND: commit 1c50cb7 in `git log --oneline`
- CONFIRMED: `npm --prefix app test` green at 34 files / 968 tests
- CONFIRMED: zero hits for `pen-hint`/`batch-margin__hint`/`versions__hint` anywhere under `app/src`
- CONFIRMED: `PenFoot.jsx:35` still renders `save-ceremony__hint`, untouched
