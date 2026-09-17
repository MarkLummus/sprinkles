---
quick_id: 260917-ewf
slug: anchor-the-page-notice-beneath-the-runni
date: 2026-09-17
mode: quick
authority:
  - .planning/quick/260917-ewf-anchor-the-page-notice-beneath-the-runni/260917-ewf-CONTEXT.md — all three items, locked by Mark in session on 2026-09-17. Nothing there is open. In particular the ruling that the notice stays OUT OF FLOW is not to be revisited: it is absolutely positioned, it overlays the top of the page, it never reflows anything, and no blank line is reserved for it.
  - .planning/todos/pending/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md — Mark's three feedback scopes and the line this task closes, "a quiet page-level notice beneath the main header fits Sprinkles better than a floating rounded notification, though it is architecturally still page-owned." Do NOT edit, close or delete this todo. Its remaining work (the batch save's own announcement, the focus landing, the flash-message API, the layout route) stays open; this task only lands the notice's presentation and its absence from print.
  - CLAUDE.md § 3 (Surgical Changes) — every changed line traces to Item 1, 2 or 3. Nothing adjacent is improved, reflowed or reindented. § 2 (Simplicity First) — no new abstraction beyond the one wrapper the anchor needs, no new state, no new token.
  - .claude/CLAUDE.md conventions — every visual value reads a token from tokens.css; notes and prose render as text, never markup; the repository seam and domain purity are untouched; agent prose and commit messages in English.
  - DESIGN.md — "nothing moves". The out-of-flow ruling exists to protect it: moving the notice into normal flow would push the page down every time it speaks.
  - .impeccable/surfaces/route-recipe-version.md § 4 — describes the running head as part of THIS route's scope. After Task 1 the head is rendered by the routed shell instead. The brief needs revising; the ORCHESTRATOR owns that edit. Do NOT edit any file under .impeccable/.
files_modified:
  - app/src/router.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/binder.test.js
autonomous: true
must_haves:
  truths:
    - "Item 1: the running head is rendered once, by `RecipePageForRoute` in `app/src/router.jsx`, and zero times by `app/src/ui/RecipePage.jsx`. Both of RecipePage's copies (~836 not-found, ~1708 main) are gone."
    - "Item 1: the keyed `RecipePage` still carries `key={`${id}::${batchId ?? ''}`}`. The key is untouched and `<PageStatus/>` is still its sibling, never its child — the notice must survive the save's navigation."
    - "Item 1: the head now also shows while `RecipePage` returns null waiting on the version. That is a gain, not a regression — it matches the head's own contract, 'the way home in every state'. Record it in the SUMMARY."
    - "Item 1: the not-found branch keeps its 'Back to the recipe list' link. Only the running head moved. `RecipeList` is not in the diff."
    - "Item 2: `.page-status` is `position: absolute` against `.page-head`, anchored at `inset-block-start: 100%` — the running head's own bottom edge — and `inset-inline-start: var(--gap-xl)`, the same token `.running-head`'s horizontal padding reads. `position: fixed`, `inset-block-end` and `inset-inline-end` are gone."
    - "Item 2: nothing reflows. The notice is out of flow in both states, so appearing and disappearing moves no pixel of the page beneath it; the `:empty` collapse is kept and no blank line is reserved."
    - "Item 2: every other visual declaration survives verbatim — `z-index: 10`, `max-width`, `margin`, `padding`, border at `--rule-baseline`, `--ground` background, `--ink` text, `--face-grotesk`, `--type-control`. No colour change, no motion, no transition, no new token."
    - "Item 3: `@media print { .page-status { display: none; } }` exists as a seventh top-level @media block, sibling to the six, never nested. It suppresses `.page-status` and nothing else — Phase 4 owns the print route and its geometry."
    - "Both media-block registers are updated, because both go red otherwise: `cross-cutting.test.js` (~240, six named conditions) and `binder.test.js` (~295, `@media` count 6 plus an `allowedMedia` list). Extending a register the print layer legitimately grows is not adjusting an assertion to hit a number."
    - "`npm --prefix app test` green. Baseline measured at planning time on 2026-09-17: **968 tests across 34 files** — CONTEXT.md's figure is correct. Report the real end number in the SUMMARY; never edit an assertion to reach one."
    - "Three commits, one per item, in order. The items are independent and must not be squashed."
  artifacts:
    - "app/src/router.jsx: `Link` added to the `react-router` import; a `<div className=\"page-head\">` in `RecipePageForRoute` holding the running head paragraph then `<PageStatus/>`; `<RecipePage/>` stays a sibling AFTER that div, still keyed."
    - "app/src/ui/RecipePage.jsx: the not-found branch (~833-845) loses its running head and its now-single-child fragment; the main return (~1703-1711, 1888-1890) loses its running head and its now-single-child fragment; the comment at ~829-832 is rewritten to say the head comes from the routed shell."
    - "app/src/ui/RecipePage.test.jsx: one source-text describe proving the ownership — router.jsx renders `className=\"running-head\"` exactly once, RecipePage.jsx zero times, and `<PageStatus` still precedes `<RecipePage` (the notice outside the keyed page)."
    - "app/src/styles/app.css: `.page-head { position: relative; }` with its comment, added immediately above the `.running-head` comment block (~309); `.page-status` (~265-278) rewritten to the absolute anchor; a `@media print` block at the very end of the file, after the forced-colors block."
    - "app/src/styles/cross-cutting.test.js: one new describe for the notice's anchor, left edge and kept declarations; one new assertion for the print rule; the six-block register at ~240 becomes seven with `'print'` sorted last."
    - "app/src/styles/binder.test.js: `toHaveLength(6)` becomes `toHaveLength(7)`, `'print'` joins `allowedMedia`, and the block's own comment stops calling forced-colors last."
  key_links:
    - "THE LEFT EDGE, established by exhaustive grep (see § 1 below), not assumed: `.running-head` reads `--gap-xl` (48px) at EVERY width — it has exactly one rule in the whole stylesheet and none in any media block. `.recipe-page` reads `--gap-xl` too, except inside `@media (max-width: 600px)` where it drops to `--gap-m` (20px). The two agree above 600px and disagree below it. The running head's edge wins; the reasoning is in § 1 and must be repeated in the SUMMARY."
    - "THE ANCHOR: `.page-head` holds the running head and the notice and NOTHING else, so its height IS the head's height and `inset-block-start: 100%` resolves to exactly the head's bottom edge. This is why the wrapper is scoped to the head band rather than wrapped around `RecipePage` as well — a wrapper containing the page would force the magic offset CONTEXT.md Item 1 calls fragile. The notice still overlays whatever follows: an absolutely positioned child overflows its containing block freely, and nothing sets `overflow` on the new div."
    - "`position: relative` with `z-index: auto` does NOT create a stacking context, so `.page-status`'s `z-index: 10` still competes globally and still paints over the page. Do not add a `z-index` to `.page-head`."
    - "MEASURED, not assumed: `body` declares only margin/background/colour/face/size and `#root` has no rule at all (`grep -n \"^html\\|^body\\|^#root\\|:root\" app/src/styles/app.css` returns one hit, line 5). Plain block flow, so wrapping two siblings in a div changes no layout."
    - "MEASURED, not assumed: `router.jsx` cannot be imported by any test. A probe run on 2026-09-17 with the repository stubbed (`vi.mock('./store/repository.js', …)`) failed at `router.jsx:71` with `ReferenceError: document is not defined` in `createBrowserHistory` — `createBrowserRouter` runs at module scope and `jsdom` is not a dependency at all (`app/package.json`), with `environment: 'node'` in `vitest.config.js`. CONTEXT.md's stated reason (IndexedDB at module load) is NOT the blocker; the mock handles that, exactly as `RecipePage.test.jsx:20` already does. The conclusion still holds: no markup test. Use the source-text contract instead, the genre `RecipePage.test.jsx:690` already uses. Do not add jsdom for this."
    - "COVERAGE CONFIRMED, as CONTEXT.md asked: `grep -rn \"running-head\" app/src` returns app.css (310, 312, 319, and a comment at 918 plus a token read at 953 that belong to a different selector), cross-cutting.test.js (574, 581-582) and the two JSX sites. `grep -rln \"Sprinkles\" app/src` returns RecipePage.jsx alone. No markup test asserts the head, so the lift costs no existing coverage; the CSS-register test at cross-cutting.test.js:581 reads `.running-head`'s rule, which this task does not touch."
    - "COMMENT-TEXT TRAP: Task 1's gate negative-greps `running-head` in RecipePage.jsx. The replacement comment must write the head's name in WORDS — `running head`, with a space — never the hyphenated class token, or the gate is satisfied by its own prose. The test strips comments before matching, so the test survives either way; the shell gate does not."
    - "BOTH suites pin the media register, not one. `binder.test.js:295` asserts `stripped.match(/@media\\b/g)` has length 6 AND that every media rule's condition is in an `allowedMedia` list; `cross-cutting.test.js:240` asserts the sorted set of conditions equals six named strings. `'print'` sorts LAST in both (`(` is 0x28, `p` is 0x70). Missing either one reds the suite."
    - "`css-source.js` already parses `@media print` — `assertNoAtRules` permits any top-level `@media`, and `readAllRules` tags inner rules with `media: 'print'`. No parser change is needed or wanted."
    - "`mediaRuleFor(selector)` in cross-cutting.test.js returns the FIRST match across ALL media blocks. No existing call passes `.page-status`, so the print block breaks nothing — but the new print assertion must resolve on `r.media === 'print'` explicitly, following the file's own precedent at ~206, never through `mediaRuleFor`."
    - "`Link` is still used at RecipePage.jsx:841 ('Back to the recipe list') after both heads go, so the `react-router` import stays. Both fragments collapse to a single child, though — remove the now-pointless `<>…</>` in each. That is cleaning up an orphan THIS change created, which CLAUDE.md § 3 requires; it is not adjacent refactoring."
    - "OBSERVE, DO NOT FIX: `max-width: min(var(--measure-prose), calc(100vw - 2 * var(--gap-m)))` was written for a box inset `--gap-m` from the RIGHT. Left-anchored at `--gap-xl` it is geometrically stale — a 65ch sentence at a 393px viewport could reach ~8px past the right edge. CONTEXT.md Item 2 says keep max-width, and the only writer is `VERSION_SAVED_STATUS` ('Version saved.', far below any cap), so keep it VERBATIM and record the observation in the SUMMARY for Mark to rule on."
    - "OBSERVE, DO NOT FIX: below 600px `.running-head` sits at 48px while `.recipe-page` frames at 20px. That mismatch is pre-existing and belongs to the running head's own rule, not to this task. Record it; do not add a `.page-status` override inside the 600px block."
---

# Anchor the page notice beneath the running head, and keep it off the printed sheet

The last of the three findings from the Impeccable review of `1333a7e`, decided by Mark in session
on 2026-09-17. The page notice stops being a floating corner notification and becomes what his own
decision record asked for: a quiet page-level notice beneath the main header. It stays architecturally
page-owned — outside the keyed `RecipePage`, alive across the save's navigation — and it stays out of
flow, so nothing moves when it speaks.

Three items, three commits, in order. They are independent: Item 1 lifts the running head into the
shell so there is something to anchor to, Item 2 moves the notice onto that anchor, Item 3 takes the
notice off the printed bench sheet.

## Discovered at planning — read this before editing

Every line number below was read live on 2026-09-17 against the current files, and every claim marked
MEASURED was executed, not reasoned. They guide; they do not authorize. Re-grep and take your scope
from what you find.

### 1. The left edge: how it was established, and which box wins

CONTEXT.md Item 2 says the notice is "aligned to the same left edge as the page content". Three
candidate boxes exist — the running head's own box, the shell wrapper, the page's content column —
and they do not all share an edge. The determination was made by reading every rule that touches the
two candidates, across the whole stylesheet including all six at-rule blocks:

```
grep -rn "running-head" app/src            # every rule and every reader
grep -rn "recipe-page" app/src             # same
grep -n "@media" app/src/styles/app.css    # the six blocks each was checked inside
grep -n "@media" app/src/styles/tokens.css # none — no token is re-declared at any width
```

| Box | Declared left inset | Where | Value at ≥600px | Value at <600px |
|---|---|---|---|---|
| `.running-head` | `padding: var(--gap-m) var(--gap-xl) 0` | app.css:310-317, its **only** rule anywhere | 48px | 48px |
| `.recipe-page` | `padding: var(--gap-xl)` | app.css:375-385 | 48px | — |
| `.recipe-page` | `padding: var(--gap-m)` | app.css:2478, `@media (max-width: 600px)` | — | 20px |

`--gap-xl` is 48px and `--gap-m` is 20px (tokens.css:49, 51); tokens.css declares no `@media` block
at all, so neither value changes at any width. The 1099.98px block carries no padding declaration —
cross-cutting.test.js:264 pins that absence deliberately. So there are exactly three rules in play,
and the two boxes agree on 48px at every width above 600px and disagree only below it.

**The running head's edge wins, at `var(--gap-xl)`.** Three reasons:

1. The notice's vertical anchor is the running head's own box (§ 2 below). Taking the inline edge
   from a different box would leave the notice's two anchors measuring off two different things.
2. Above 600px the two edges ARE the same 48px, so "the same left edge as the page content" is
   satisfied at every width where the question has one answer.
3. Below 600px the divergence is a pre-existing mismatch between `.running-head` and `.recipe-page`,
   not something this task introduced. Following `.recipe-page` there would need a second
   `.page-status` rule inside the 600px block, and would anchor the notice to an edge its own
   containing box does not have. Resolving that mismatch belongs to the running head's rule and to
   the page-shell ladder, not here (CLAUDE.md § 3). Record it; leave it.

### 2. The anchor: why a head band, and why no offset literal

CONTEXT.md Item 1 rejects "anchoring by a magic offset" as fragile. The way to honour that is to make
the containing block *be* the thing the notice anchors to:

- `.page-head` wraps the running head and `<PageStatus/>` and nothing else.
- The notice is `position: absolute` and therefore out of flow, so `.page-head`'s height is exactly
  the running head's box height.
- `inset-block-start: 100%` resolves against that height → the notice's top edge lands precisely on
  the running head's bottom edge. No literal, no dependence on the head's font metrics, nothing to
  keep in step if `--size-running-head` or `--gap-m` ever changes.

`RecipePage` stays a **sibling after** that div, not inside it. That keeps the notice outside the
keyed page (the whole point of the region) and keeps `.page-head`'s height equal to the head's.
The notice still overlays the page: an absolutely positioned box overflows its containing block
freely, and nothing sets `overflow` on the new div.

It lands tight — `.running-head` has no bottom padding, so the notice's border sits within a few
pixels of the head's glyphs. That is what "directly beneath" was asked for and no gap value was
given, so none is invented. If Mark wants air there on the browser check, it is a one-token change
(`margin-block-start: var(--gap-xs)`); flag it in the SUMMARY rather than pre-empting it.

### 3. What can honestly be tested, and what cannot

MEASURED on 2026-09-17. A probe test was written, run and deleted:

```js
vi.mock('./store/repository.js', () => ({ repository: {} }));
await import('./router.jsx');
```

It failed with `ReferenceError: document is not defined` at `router.jsx:71` →
`createBrowserRouter` → `createBrowserHistory` → `getUrlBasedHistory`. The repository mock worked;
the blocker is `createBrowserRouter` running at module scope with no DOM. `vitest.config.js` sets
`environment: 'node'`, no file opts into a DOM anywhere (`grep -rn "@vitest-environment" app/src`
returns nothing), and `jsdom` is not in `app/package.json` at all.

So: **no markup test for the running head's new home, and none is to be faked.** Do not add jsdom,
do not export `RecipePageForRoute`, do not extract a component for the sake of a test. What IS honest
and is already this repo's genre — `RecipePage.test.jsx:690` reads its own source with comments
stripped and asserts which module calls what — is a source-text ownership contract. Task 1 adds one.

The CSS work is fully testable: `cross-cutting.test.js` reads app.css as text through `css-source.js`,
which already handles a top-level `@media print` (its `assertNoAtRules` permits any top-level
`@media` and tags inner rules with `media: 'print'`).

### 4. The two registers that will go red if you touch only one

| File | ~Line | What it pins |
|---|---|---|
| `app/src/styles/binder.test.js` | 295 | `expect(stripped.match(/@media\b/g)).toHaveLength(6)`, plus every media rule's condition must appear in a six-entry `allowedMedia` array. Its comment also calls forced-colors "last". |
| `app/src/styles/cross-cutting.test.js` | 240 | the sorted unique set of media conditions equals six named strings, and the title says six. |

Both must gain `'print'`, sorted last in each. Neither is an assertion bent to reach a number: the
print layer is a real, new, deliberate seventh block and these registers exist precisely so it cannot
arrive unnoticed.

Nothing else counts rules globally in a way this task disturbs. `binder.test.js`'s bare-px gate
(~289) is unaffected by `display: none`, `100%` and a `var()` read.

### 5. The brief the orchestrator owns

`.impeccable/surfaces/route-recipe-version.md` § 4 lists "the running head 'Sprinkles' in ink as the
link home" inside THIS route's scope. After Task 1 the head belongs to the routed shell and is drawn
on the list-less recipe routes by `router.jsx`. The brief is stale on that point. **Do not edit it,
or any file under `.impeccable/`.** Name it in the SUMMARY so the orchestrator can revise it.

---

## Task 1 — lift the running head into the routed shell

Commit 1. Item 1 only. `app/src/styles/cross-cutting.test.js`, `binder.test.js` and every rule but the
one new `.page-head` are out of this diff. `RecipeList.jsx` is not in it either.

**Files:** `app/src/router.jsx`, `app/src/ui/RecipePage.jsx`, `app/src/ui/RecipePage.test.jsx`,
`app/src/styles/app.css`

**Behavior** (write the source-text contract in step 5 first; it goes red on the current tree because
RecipePage.jsx still renders both heads):

- `router.jsx`'s source contains `className="running-head"` exactly once.
- `RecipePage.jsx`'s source, comments stripped, contains it zero times.
- In `router.jsx`, `<PageStatus` still appears before `<RecipePage`, and the `key=` on `<RecipePage`
  is still there — the notice stays outside the keyed page.

**Action:**

1. In `router.jsx`, add `Link` to the existing `react-router` import (`createBrowserRouter`,
   `useParams`). Do not touch the `RouterProvider` import from `react-router/dom`.
2. In `RecipePageForRoute`, replace the returned fragment's two children with a head band and the
   keyed page:

   - a `<div className="page-head">` holding, in order, `<p className="running-head"><Link to="/">Sprinkles</Link></p>`
     and then the existing `<PageStatus message={pageStatus} />`;
   - the existing `<RecipePage key={...} onPageStatus={announcePageStatus} />`, unchanged, as a
     sibling AFTER that div.

   The `key` expression, `announcePageStatus`, the five-second timer and the existing comment about
   the region surviving the navigation are all untouched. Add one short comment on the band saying
   the running head lives here so the notice has something to anchor to, and that the page is a
   sibling so the band's height stays the head's height.
3. In `RecipePage.jsx`, delete the running head from the not-found branch (~836-838). The branch's
   fragment now has a single child, so return the `<div className="not-found">` directly and drop the
   `<>…</>`. Keep the "Back to the recipe list" link exactly as it is.
4. Rewrite the comment above that branch (~829-832). It currently explains why the head is drawn
   here; it now records that the routed shell draws it, so the way home covers this state and the
   loading state alike. **Write the head's name in words — `running head`, with a space.** The
   hyphenated class token must not appear in this file after the task, or step 6's gate passes on its
   own prose.
5. In `RecipePage.jsx`, delete the running head from the main return (~1705-1710) including its own
   comment. That fragment is also left with a single child (`<article className="recipe-page">`), so
   return the article directly and drop the `<>…</>` at ~1704 and ~1889.
6. In `RecipePage.test.jsx`, add one `describe` beside the existing source-text block (~686-717),
   reading both sources with the same idiom that block already uses — `fileURLToPath(new URL(…, import.meta.url))`,
   `readFileSync`, then strip `/* */` and `//`. `router.jsx` is at `'../router.jsx'` from `app/src/ui/`.
   Assert the three behaviors above. Say in the describe's comment that this is a source-text contract
   because `router.jsx` cannot be imported under the node environment — `createBrowserRouter` runs at
   module scope and needs a `document` — and that the repository mock is not the obstacle.
7. In `app.css`, add `.page-head { position: relative; }` immediately above the `.running-head`
   comment block (~309), with a comment recording that it is the containing block for `.page-status`,
   that it holds the head and the notice and nothing else, and that this is what lets the notice's
   own `inset-block-start: 100%` land on the head's bottom edge instead of an offset literal. No
   `z-index` here — adding one would make it a stacking context and trap the notice.

**Verify:**

```
npm --prefix app test
grep -n 'className="running-head"' app/src/ui/RecipePage.jsx ; test $? -eq 1
grep -c 'className="running-head"' app/src/router.jsx
grep -rn "running-head" app/src/ui/RecipePage.jsx ; test $? -eq 1
grep -n "Back to the recipe list" app/src/ui/RecipePage.jsx
grep -n "key={" app/src/router.jsx
git diff --name-only HEAD | sort
```

Suite green, above the 968/34 baseline by the tests added in step 6. The first and third greps exit 1
(no hit in RecipePage.jsx, in markup or in prose). The second prints `1`. The "Back to the recipe
list" link and the `key={` on `RecipePage` both still print. `git diff --name-only` lists exactly
`app/src/router.jsx`, `app/src/styles/app.css`, `app/src/ui/RecipePage.jsx`,
`app/src/ui/RecipePage.test.jsx`.

**Done:**

- One running head in the app, rendered by the routed shell, above `<PageStatus/>` and the keyed page.
- The keyed `RecipePage` keeps its key and the notice is still its sibling.
- The head now also shows while the version resolves — recorded in the SUMMARY as an improvement,
  matching the head's own "the way home in every state".
- `.page-head` exists as the notice's containing block; nothing anchors to it yet, and nothing moved:
  the head is still the first in-flow element on the page, and `body`/`#root` are plain block flow.
- Commit: `refactor(shell): the running head moves to the routed shell, above the keyed page`

---

## Task 2 — the notice leaves the corner and rides the running head

Commit 2. Item 2 only. `router.jsx`, `RecipePage.jsx` and `binder.test.js` are not in this diff.

**Files:** `app/src/styles/app.css`, `app/src/styles/cross-cutting.test.js`

**Behavior** (write these assertions first; every one is red against the current `position: fixed`
rule):

- `.page-status` declares `position: absolute`, and declares neither `position: fixed`,
  `inset-block-end` nor `inset-inline-end`.
- `.page-head` declares `position: relative` and `.page-status` declares `inset-block-start: 100%`.
- `.page-status` declares `inset-inline-start: var(--gap-xl)` and `.running-head` still declares
  `padding: var(--gap-m) var(--gap-xl) 0` — one left edge, asserted as one contract across the two
  rules so neither can drift alone.
- `.page-status` keeps `z-index: 10`, its `max-width: min(var(--measure-prose), …)`, `margin: 0`,
  `padding: var(--gap-xs) var(--gap-s)`, `border: var(--rule-baseline) solid var(--ink)`,
  `background: var(--ground)`, `color: var(--ink)`, `font-family: var(--face-grotesk)`,
  `font-size: var(--type-control)`; and `.page-status:empty` still zeroes padding and border.

**Action:**

1. In `app.css`, rewrite `.page-status` (~265-278). Replace `position: fixed` with
   `position: absolute`; delete the `inset-block-end` and `inset-inline-end` declarations; add
   `inset-block-start: 100%` and `inset-inline-start: var(--gap-xl)`. **Every other declaration is
   copied across character for character**, `max-width` included — it is stale for a left-anchored box
   (§ key_links) but CONTEXT.md Item 2 keeps it, and the only sentence this region carries comes
   nowhere near the cap.
2. Give it a comment recording why it is out of flow — DESIGN.md's "nothing moves", so it overlays
   the top of the page and never reflows it, and no blank line is reserved — and recording both
   anchors in one line each: `100%` is `.page-head`'s bottom edge, and `--gap-xl` is the same token
   `.running-head`'s horizontal padding reads, so head and notice share one left edge. Name the 600px
   divergence in a clause so the next reader does not "fix" it by accident.
3. Leave `.page-status:empty` (~280-283) exactly as it is.
4. In `cross-cutting.test.js`, add one `describe` for the notice's new geometry carrying the four
   behaviors above. Resolve rules with the file's own `ruleFor` helper (top-level rules only).
5. Do not add any rule inside any `@media` block. Do not add a token. Do not add a transition — the
   notice appears and disappears with no motion.

**Verify:**

```
npm --prefix app test
grep -n "position: fixed" app/src/styles/app.css ; test $? -eq 1
grep -n "inset-block-end\|inset-inline-end" app/src/styles/app.css ; test $? -eq 1
grep -n "inset-inline-start\|inset-block-start" app/src/styles/app.css
grep -n "transition" app/src/styles/app.css ; test $? -eq 1
git diff --name-only HEAD | sort
```

Suite green and up by the tests added in step 4. The first two greps exit 1 — measured at planning
time, `.page-status` is the stylesheet's ONLY `position: fixed` (line 266) and its only `inset-*-end`
pair (268, 269); if either prints a hit afterwards, stop and report it rather than deleting someone
else's rule. The third prints the two new anchors. The fourth exits 1: app.css declares no
`transition` today and this task adds none. `git diff --name-only` lists exactly
`app/src/styles/app.css` and
`app/src/styles/cross-cutting.test.js`.

**Done:**

- The notice sits directly beneath the running head, sharing its left edge, overlaying the top of the
  page and reflowing nothing in either state.
- No corner inset survives; no visual declaration was lost; no token, colour or motion was added.
- The SUMMARY records two observations for Mark, neither fixed here: the stale `max-width` calc, and
  the pre-existing 48px/20px head-vs-page edge mismatch below 600px. It also offers the one-token
  `margin-block-start: var(--gap-xs)` if the browser check finds the notice too tight under the head.
- Commit: `fix(page-status): the notice anchors beneath the running head instead of the corner`

---

## Task 3 — the notice leaves the printed sheet

Commit 3. Item 3 only. No JSX in this diff.

**Files:** `app/src/styles/app.css`, `app/src/styles/cross-cutting.test.js`,
`app/src/styles/binder.test.js`

**Behavior** (write these first; both registers go red on the current tree the moment the block
lands, and the print assertion is red until it does):

- A rule with `media === 'print'` and selector `.page-status` declares `display: none`.
- `cross-cutting.test.js`'s media register lists seven conditions, `'print'` sorted last.
- `binder.test.js` counts seven `@media` occurrences and accepts `'print'` in `allowedMedia`.

**Action:**

1. In `app.css`, append a `@media print` block at the very end of the file, after the forced-colors
   block, containing `.page-status { display: none; }` and nothing else. Top-level, never nested —
   `css-source.js`'s one-level contract.
2. Comment it as the START of the print layer, not a stray rule: why the notice in particular goes
   (it is screen furniture, and a fixed or floating notice repeats on every printed page in Chrome,
   while the printed bench sheet is this product's core-value artifact), and why nothing else is
   styled here (Phase 4 owns the print route and its geometry and this must not pre-empt it). Note it
   is the seventh top-level block, sibling to the six.
3. In `cross-cutting.test.js`, add the print assertion, resolving on `r.media === 'print'` explicitly
   — the file's own precedent at ~206 — never through `mediaRuleFor`, which returns the first match
   across all blocks. Then update the register test at ~240: `'print'` joins the sorted array last,
   and the title says seven, not six.
4. In `binder.test.js` (~295), change `toHaveLength(6)` to `toHaveLength(7)`, add `'print'` to
   `allowedMedia`, correct the title from six to seven, and amend the block's own comment: it
   currently calls `forced-colors: active` the last block. Say instead that the print layer is last,
   and add one clause naming what it holds and why it is only one rule.
5. Change no other rule. No `@page`, no print styling of anything but `.page-status` —
   `assertNoAtRules` throws on `@page` by design.

**Verify:**

```
npm --prefix app test
grep -c "^@media" app/src/styles/app.css
grep -n "^@media print" app/src/styles/app.css
grep -n "@page" app/src/styles/app.css ; test $? -eq 1
git diff --name-only HEAD | sort
```

Suite green and up by the assertion added in step 3. The anchored count prints `7` — measured at
planning time it is `6`, and only a rule-opening `@media` sits at column 0. Do NOT use a bare
`grep -c "@media"`: it already returns `8` today, because two of app.css's own comments discuss the
media blocks in prose, and your new comment will likely name `@media print` too. (`binder.test.js`'s
own count is immune — it strips comments first.) `@media print` prints once. No `@page`.
`git diff --name-only` lists exactly `app/src/styles/app.css`,
`app/src/styles/binder.test.js`, `app/src/styles/cross-cutting.test.js`.

**Done:**

- `.page-status` is suppressed in print, and nothing else is.
- Both media registers name the print layer; neither was loosened, and no existing assertion was
  weakened to accommodate it.
- Commit: `feat(print): open the print layer by keeping the page notice off the sheet`

---

## For the SUMMARY

Record all of these; several are what the orchestrator's browser pass and the brief revision depend on.

1. The real end test count against the 968/34 baseline measured at planning time.
2. **The left-edge determination** — the three rules in the table in § 1, the 48px/20px divergence
   below 600px, and that the running head's edge won, with the reason.
3. That the running head now shows while the version resolves, which is a gain against its own
   contract.
4. That `router.jsx` cannot be imported by any test — the measured `ReferenceError: document is not
   defined` from `createBrowserRouter` at module scope, NOT the IndexedDB reason CONTEXT.md gives —
   so the head's new home is covered by a source-text ownership contract and no markup test was faked.
5. The two observations left deliberately unfixed: the stale `max-width` calc, and the pre-existing
   head-vs-page left-edge mismatch below 600px.
6. The one-token offer if the notice reads too tight under the head: `margin-block-start: var(--gap-xs)`.
7. **`.impeccable/surfaces/route-recipe-version.md` § 4 is now stale** — it scopes the running head to
   the version route, and the routed shell owns it. The orchestrator makes that edit; no file under
   `.impeccable/` was touched by this task.
8. That the pending todo `2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md` stays
   open: this task landed the notice's presentation and its print suppression only. The batch save's
   announcement, the focus landing, the flash-message API across the route change, and the layout
   route are all still outstanding on it.

## What the orchestrator checks in a browser

Not the executor's work, and not gated on here:

- The notice sits directly beneath the running head, sharing its left edge, at a desktop width and
  below 600px.
- It overlays the top of the page and nothing reflows when it appears or clears — save a version and
  watch the page beneath it hold still.
- It is absent from print preview, and nothing else about the page changed in print.
