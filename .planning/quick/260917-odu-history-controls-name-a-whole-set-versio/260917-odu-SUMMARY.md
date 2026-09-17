---
quick_id: 260917-odu
slug: history-controls-name-a-whole-set-versio
status: complete
date: 2026-09-17
commits:
  - bb4304b
  - b7fd19b
files_modified:
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/VersionStrip.jsx
  - app/src/ui/VersionStrip.test.jsx
  - app/src/styles/app.css
actuals:
  tokens: 11421
  tasks: 2
  commits: 2
plan_head_before: dcb641c5a406111771006de334b8827e02989618
---

# History controls name a whole set: Versions (n) and Batches (n) — Summary

Both disclosures now name the complete set they open — `Versions (n)` on the version row counts
every version of the recipe, `Batches (n)` on the batch row counts every batch of the version in
view, each including the one being read — and position inside each opened list is now named in
words (`In view`, `Latest`) instead of left to weight. The one open question from planning — where
the struck `Later` dt's control goes since it has no replacement label — was answered by Mark: it
left the `<dl>` entirely and became its own line, `<p className="version-row__history">`, between
`</dl>` and the acts group, executed exactly as the planner's own recommendation and the plan's key
link described.

## Baseline, measured

`npm --prefix app test` before any edit: **35 files, 995 tests, all passing** — matches the plan's
own measured baseline exactly, no drift.

## Task 1 — the two disclosures name whole sets (`bb4304b`)

**`VersionRow.jsx`.** `descendantVersions` dropped from the import; the old `descendants`/`laterCount`
pair (a subtree walk below the version in view) replaced by one array, `recipeVersions =
versionsForRecipe(versions, version.recipeId)`, and its `.length` as `versionCount` — the recipe's
complete version list, the one in view included. State renamed `versionsOpen`/`setVersionsOpen`.
The `<dt>Later</dt>`/`<dd>` pair was removed from the `<dl>` outright (the settled decision) and the
same toggle button now renders inside `<p className="version-row__history">` immediately after
`</dl>` and before the acts group, reading `Versions (${versionCount})` (a template literal, no
plural branch), `aria-controls="version-row-versions"`, gated on `versionCount > 0`. The disclosed
section's `id`, `aria-label` and `<h2>` all became `version-row-versions`/`Versions`, and it now
passes the strip `versions={recipeVersions}` instead of `descendants`.

**`BatchRow.jsx`.** The count became plain `batches.length` (`batchCount`) — the `- (openBatch ? 1
: 0)` correction is gone, so the one batch a version has is `Batches (1)`, not "no batches beyond
the one in view." State renamed `batchesOpen`/`setBatchesOpen`; the section's `id` and `aria-controls`
both became `batch-row-batches`. The `aria-label`/`<h2>` stayed `Batches of this version` — per the
plan, it carries no struck word and is what distinguishes this set (one version's batches) from the
other (one recipe's versions). Nothing else in the file changed — not `laterBatchMetaFor`, not
`Correct`, not the churned-date span, not the zero-batch branch, not the tasting/battery bodies, not
the in-view marker at the bottom of the list (that was Task 2).

**`app.css`.** One new rule, `.version-row__history { margin-top: var(--gap-s); }`, placed after
`.version-row__reason--empty` and before `.vmeta--developing`, reading the same token
`.version-row__reason-label` uses to open a new line in this stack. Two false comments corrected in
place (`.recipe-band__full-row`'s and `.batch-row__head`'s), naming "Versions"/"Batches" instead of
the struck word. No other line in the file moved.

**Test rewrites (`VersionRow.test.jsx`).** The describe block and its block comment retitled off
"Later-versions" (that phrase itself matched the struck-phrase grep, hyphen and all). Five `it`s
rewritten to the new contract:
- The "descendant count" test (ancestor + one child) now asserts `Versions (2)`, `aria-controls="version-row-versions"`, still no version-strip markup while closed.
- The "plural count" test (root/child/grandchild) now asserts `Versions (3)` — no plural branch to exercise, but the count is still the whole recipe regardless of tree depth.
- The "no descendants" test now asserts **`Versions (1)`**, not absence — a root with no other versions is still a list of one, per the plan's own behavior contract. This deliberately absorbs the plan's requested "root with no children renders `Versions (1)`" ADD case rather than adding a byte-identical duplicate test (CLAUDE.md § 2, Simplicity First) — recorded as a conscious consolidation, not an omission.
- The "no later versions, no Later dt/dd" test retitled to drop the struck phrase from its own title (the phrase itself is inside a JS string literal, which the negative-grep also scans).
- The "Later count for a child version" test retitled and its assertion changed to `Versions (3)` (three total in that fixture: root, child, grandchild).

Two genuinely new cases added: the ancestor-**and**-sibling three-generation, two-branch tree,
viewed from the middle version (`Versions (4)`, proving the count is the recipe's, not the 2-member
subtree below the viewed version); and `versions: []` rendering no control at all (the pre-load
paint, so `Versions (0)` never shows). A comment on the describe block states the
`renderVersionRow` default-`versions`-prop trap explicitly, per the plan's own instruction.

**`BatchRow.test.jsx`.** Six `it`s rewritten:
- "the later-batches count...with no list content" → asserts `Batches (2)` (was `1 later batch`, subtracting the one in view).
- "the plural count for more than one later batch" → asserts `Batches (3)` (same number as before, since `openBatch` was already `null` there; only the words changed).
- "no later-batches control when there are none beyond the one in view" → **inverted**: now asserts `Batches (1)` renders (the complete set includes the one in view, so a version with exactly one batch is never "none beyond it").
- The two "while recording"/"while amending" tests kept their meaning (hidden while recording since `openPen !== 'record'` gates it; present while amending) with new words — `Batches (2)`, not `1 later batch`.
- "names the later-batches panel by aria-controls" → asserts `Batches (2)` and `aria-controls="batch-row-batches"`.

`:1271-1279` (the "batch list, always a list only with zero batches" describe) was left alone —
it asserts the region name, unchanged. `laterBatchMetaFor` and its own describe/comments kept the
function name (residual naming, below) but the hyphenated phrase "later-batches list" in two
prose comments was reworded to "batch list" since that phrase itself matched the struck-phrase
grep (`later[ -]batch`), independent of the identifier.

**Verify, run individually, every number real:**
- `grep -rniE "later[ -]version|later[ -]batch" app/src` → only `app/src/ui/VersionStrip.jsx` (1 line) — Task 2 clears it.
- `grep -rn "version-row-later\|batch-row-later" app/src` → exit 1, no matches.
- `Versions (` in `VersionRow.jsx` → 1. `Batches (` in `BatchRow.jsx` → 1.
- `version-row-versions` in `VersionRow.jsx` → 2 (id + aria-controls). `batch-row-batches` in `BatchRow.jsx` → 2.
- `version{` (literal) in `VersionRow.jsx` → 0. `batch${` (literal) in `BatchRow.jsx` → 0.
- `descendantVersions` in `VersionRow.jsx` → 0; `export function descendantVersions` in `lineage.js` → 1 (untouched).
- `Batches of this version` in `BatchRow.jsx` → 3 (aria-label, h2, comment — unchanged count).
- `.version-row__history`'s own rule → 1 `var(--)`, 0 literal units.
- `@media` blocks in `app.css` → 7 (unchanged).
- `npm --prefix app test` → **35 files, 997 tests, all passing** (995 baseline + 2 net new: the ancestor-and-sibling case and the empty-`versions` case).
- `npm --prefix app run build` → succeeds.
- `git diff --name-only HEAD~1 HEAD` → exactly the five files, `VersionStrip.jsx` absent.

## Task 2 — the two lists name position in words (`b7fd19b`)

**`VersionStrip.jsx`.** After `const ordered = …`, one new line: `const latestId = ordered.length >
0 ? ordered[0].id : null` — positional, off the very array the `.map` walks, so the marker and the
order cannot disagree by construction. `latestVersionPerRecipe` is named in a comment as the thing
deliberately not called (a second traversal with its own `?? ''` null coercion and its own
first-wins tie rule) but is never imported or invoked (`grep -c 'latestVersionPerRecipe('` → 0).
Inside the `.map`, a `markers` array built in reading order — `In view` when `isCurrent`, `Latest`
when `version.id === latestId` — rendered inside `.version-strip__vline` immediately after the
label, separated by a literal space, as `<span className="version-strip__marker">` whose own text
is `· ${markers.join(' · ')}` — the exact shape `BatchRow.jsx`'s own `· In view` marker already
uses (`<strong>{dateWords}</strong> <span>...`). Nothing renders when `markers` is empty.

The dead-control rule: the entry in view (`isCurrent`) renders `version.versionLabel` as **text**
unconditionally — pen open or not — because a link to the page you are already on goes nowhere; the
`Open` control on the batch line renders **only** when the entry is not the one in view, never as
the plain word either (which would name an act that has already happened). The
`<p className="version-strip__batch">` element itself always renders; with no churn date and no
control it simply has no inline content, generating no line box.

The root-version fix, found at planning and closed here: `metaParts` now starts empty and only
pushes `from ${version.parentVersionLabel}` when `version.parentVersionId` is truthy — mirroring
`VersionRow.jsx`'s own branch. Before this change the strip had only ever received descendants
(every one of which has a parent); the complete set now includes the root, whose
`parentVersionId`/`parentVersionLabel` are both `null` by store contract (`transfer.js:371-372`),
so without the guard a root's card would have read `from null`.

The file's header comment was rewritten off "descendant" — it now describes every version of the
recipe, the one in view included, and both markers.

**`BatchRow.jsx`.** One word: the batch list's own in-view marker at the bottom of the file
(`· in view` → `· In view`), matching the version list's capitalisation exactly. Nothing else in
the file changed.

**`app.css`.** One new rule, `.version-strip__marker`, placed directly after
`.version-strip__churned`, carrying a character-for-character copy of that rule's two declarations
(`font-family: var(--face-grotesk); font-size: var(--size-small-print);`) — the same small-print
grotesk type role `.version-strip__churned` and `.batch-row__later-small` already use, cited to
DESIGN.md's Small print role in the comment. `.version-strip__list`'s comment ("a card per
descendant") corrected to "a card per version of the recipe" — it carried no struck phrase but was
no longer true. No colour, weight, motion or position value added; nothing moves on focus, hover or
selection.

**Test rewrites (`VersionStrip.test.jsx`) — the fixture fix first, then seven affected `it`s, then
six new cases:**

The fixture trap, exactly as the plan predicted: `makeVersion`'s default carried
`parentVersionLabel` with no `parentVersionId` — a shape the store never produces — so the moment
the meta line's `from …` clause became conditional on `parentVersionId`, two passing tests
("renders the meta line naming the parent...", "drops the 'after the batch of' segment...") went
red for a fixture reason, not a product reason (their `from 50 g oil · 800 g` prefix disappeared).
Fixed by giving `makeVersion` a default `parentVersionId: 'v0'`; both tests were restored to
green with zero changes to their own assertions. A dedicated case overriding both to `null` proves
the root's own meta line and asserts no `null` string anywhere in the markup.

Seven `it`s needed rewriting (the plan's own line-numbered list named four; re-running the suite
against the live tree surfaced three more identical-shaped duplicates the plan's line list didn't
separately enumerate — all are the same underlying change, the dead-control rule, applied to
fixtures the plan's four call out and two more that share the exact same `currentId: 'a'` fixture
in a second describe block):
1. "three cards in creation order" — anchor count **6 → 4**: `currentId: 'a'` is in that fixture and now loses both of its own links (version-line link and Open).
2. "carries the current version's entry... still a link" — **inverted and retitled**: `b` (the current entry) is no longer a link at all; it wears `In view` and not `Latest` (the newest is `c`).
3. "renders the version line as a link to the version" — that fixture's one entry is not the `currentId` (`v1` vs `v2`) but IS the only entry, so it is `ordered[0]`: it keeps its link and gains `· Latest`.
4. "renders no anchor... Open in words too" — **3 → 2**: `a` is the entry in view under `openPen`, so it renders no `Open` word at all (dead-control rule applies regardless of pen state); only `b` and `c` (both suppressed to text by the open pen) still read the word.
5. "renders the same six anchors... two per card" — **6 → 4**, same reasoning as #1, in the sibling describe block using the identical fixture (`currentId: 'a'`).
6. "a list of one version is still a list" — retitled and extended: the one entry is both `In view` and `Latest` (the whole list is one card), so it wears `· In view · Latest` and carries no `<a>` at all.

New coverage added, a dedicated `describe('VersionStrip — the position markers')` plus the root
case above: exactly one `In view` and one `Latest` on different entries viewed from the middle of a
three-version list; both markers, in reading order, on one entry when the newest is the one in
view (`· In view · Latest`); no marker text at all on an entry that is neither the newest nor the
one in view; exactly one `Latest`, on the entry the list puts first, when two entries share a
`createdAt` (the tie-break case — `sortedVersions`' comparator returns `0` on equal dates, and
`Array#sort` is stable, so the first-listed entry wins and the marker never disagrees); the in-view
entry rendering no `<a>` and no `Open` with no pen open at all.

**Verify, run individually, every number real:**
- `In view` in `VersionStrip.jsx` → 2. `In view` in `BatchRow.jsx` → 1 (exactly the list's own marker).
- `Latest` in `VersionStrip.jsx` → 4 (case-sensitive; `latestId` does not match).
- `· in view` (lowercase) anywhere under `app/src` → exit 1, no matches — retired.
- `is-latest`/`is-in-view` in `VersionStrip.jsx` and `app.css` → 0 in both — no marker exists as a class.
- `ordered[0]` in `VersionStrip.jsx` → 3. `latestVersionPerRecipe(` in `VersionStrip.jsx` → 0.
- `.version-strip__marker`'s own rule → 2 `var(--)`, 0 literal units/transition/transform.
- `later[ -]version|later[ -]batch` anywhere under `app/src` → no matches at all now (VersionStrip.jsx cleared).
- `@media` blocks in `app.css` → 7 (unchanged).
- `npm --prefix app test` → **35 files, 1003 tests, all passing** (997 after Task 1 + 6 net new — one for the root-meta case, plus the five-case `position markers` describe block).
- `npm --prefix app run build` → succeeds.
- `git diff --name-only HEAD~1 HEAD` → exactly the four files.

## Orphans and residual naming, named not fixed

- **`descendantVersions`** (`app/src/domain/lineage.js:41-44`) now has no non-test caller —
  `VersionRow.jsx` was its only one. Left exported and untouched; its own tests in `lineage.test.js`
  (:57-83) are untouched. Not deleted, per the plan's explicit instruction and CLAUDE.md § 3
  (Surgical Changes — dead-code removal beyond this change is out of scope).
- **The five `.batch-row__later-*` class names** (`.batch-row__later`, `-list`, `-date`, `-small`,
  `-meta`) and the exported **`laterBatchMetaFor`** helper keep their names. They are invisible to
  the maker (a class name, a module export), renaming would touch `app.css`'s own rules plus
  `cross-cutting.test.js`'s exact-selector assertion on `.batch-row__later-meta` and
  `BatchRow.test.jsx`'s own import, for zero user-visible gain — CLAUDE.md § 3 binds. Only the
  prose comments naming these things in hyphenated form ("later-batches list") were reworded, since
  that phrase (not the identifier) matched the struck-phrase grep.

## The order, stated

The version list renders `createdAt` descending through `sortedVersions` — a null `createdAt` last,
ties left where the input had them (`Array#sort` is stable and the comparator returns `0` on equal
dates) — and `Latest` is `ordered[0]` of that exact array, read positionally, never recomputed.
`latestVersionPerRecipe` was not used: it is a second traversal with its own `createdAt ?? ''`
coercion and its own first-encountered tie rule, a second opinion about "newest" living beside the
first with nothing to keep the two in agreement. The batch list renders `churn.churnDate`
descending through `sortedBatches` (nulls last) and carries no `Latest` at all — the brief names
that marker for versions only.

## What the in-view entry's link does

Nothing — it is not a link (rendered as plain text), and its `Open` control is not rendered at all,
neither as a link nor as the plain word. Reason: a link to the page you are already on goes
nowhere, and a word naming "Open" on the thing already open would misdescribe the state. Precedent:
`BatchRow.jsx`'s own batch list already did exactly this for its in-view entry before this plan
touched it.

## What was found about the batch list

No `BatchStrip` component exists. The list is inline in `BatchRow.jsx` (:960-989), and it already
rendered every batch of the version — the one in view included — and already marked that entry.
Only the **count** lied (`batches.length - (openBatch ? 1 : 0)`). So the assumed symmetry between
the two lists was not there: Task 1's item 2 was a count-and-words change plus one capitalised word
in Task 2; the version list needed the real structural work (Task 1's whole-set computation, Task
2's markers and dead-control rule).

## The root-version defect, found at planning

Before this change, `VersionStrip` only ever received descendants of the version in view — every
one of which has a parent. The complete set (Task 1) includes the root for the first time, whose
`parentVersionId`/`parentVersionLabel` are both `null`. Without a guard, a root's card in the
opened list would have read `from null`. Fixed in Task 2 by making the `from …` clause conditional
on `parentVersionId`, mirroring `VersionRow.jsx`'s own existing branch.

## The `Later` dt consequence — Mark's decision, executed

The struck lineage label (`<dt>Later</dt>`) had no replacement word (inventing one is forbidden by
the brief's own § 7), so the control could not stay inside the `<dl>` under a `dt` reading
"Versions" without either repeating the word twice (a `dt` and a control both saying "Versions") or
naming a control "(4)" with no visible word before it. Mark's settled decision — the planner's own
recommendation — removed the pair from the `<dl>` and gave the control its own line,
`<p className="version-row__history">`, between `</dl>` and the acts group: same stack, same order,
slightly further left, keeping the sketch's tab order (metadata, then the count, then the acts) and
staying inside the same non-pen branch, so the control stays available while the batch pen is open
(D-UAT-2's own availability guarantee). This was executed exactly as directed and is **on the
orchestrator's browser-check list** for Mark to confirm the placement reads well — not re-decided
here.

## The sketch divergence

Sketch 003 (`.planning/sketches/003-front-matter-rows/index.html`) draws the struck words — "Later
versions" (:189-190), "3 later versions" (:214), "1 later batch" (:232, :238) — because it predates
the 2026-09-17 brief bullet that strikes them. Structure came from the sketch (the row layout, the
dl-then-acts order); words came from the brief. Per the sketch-findings-sprinkles skill's own
"sketch is a structural contract" finding, this divergence is worth rationalizing so sketch 003
stops reading as a competing authority on wording it predates — recommended as a follow-up, not
done here (out of this quick task's scope).

## Coverage honestly bounded

The batch list's open state is unreachable from any test in this suite: there is no jsdom and no
testing-library anywhere (`vitest.config.js` pins `environment: 'node'`; every one of the 19
component test files renders through `renderToStaticMarkup`), so a click-driven disclosure can
never actually be opened inside a test. `BatchRow.jsx`'s own `In view` capitalisation change is
grep-verified (exactly 1 occurrence) but not rendered-and-opened by any test — following
`laterBatchMetaFor`'s own established precedent for exactly this kind of coverage gap (it is
exported specifically "since the disclosure that renders this has no prop to open it from a
render-only test"). `VersionStrip.jsx`'s own markers ARE fully covered, since `VersionStrip` is
rendered directly by its own test file with no disclosure gate in the way.

## The seeded store's real-lineage caveat

The seeded store holds exactly one version and one batch, so a maker running the app today can only
ever see `Versions (1)` and `Batches (1)` — the counts, `Latest` on a sibling, and a root's own card
inside an opened list all need a store with real lineage to exercise visually. To get one: save a
second version from the seeded olive-oil version (produces a child with `Latest` moving to it and
the root staying in the list with no `from` clause), or record a second batch against the existing
version, or import a store file carrying more than one version/batch of the same recipe.

## Browser check — run by the orchestrator, 2026-09-17

The executor did not run it (`human_verify_mode: end-of-phase`); the orchestrator did, after the
executor handed back. A four-version, two-branch tree plus a second batch was written straight into
IndexedDB (root `olive-oil-ice-cream-v1` → `v2` and `v3` as siblings, `v4` below `v2`; two batches
on `v2`), since the seeded store holds one version and one batch and so proves nothing about counts.

At **1024**, viewing the middle version `v2`:

- `Versions (4)` and `Batches (2)` — the ancestor and the sibling are both counted, so the disclosure
  is the recipe's set and not a subtree walk. `Versions (4)` reads the same from `v4`.
- The opened list holds four cards. `Latest` sits on `v4` (newest `createdAt`), `In view` on `v2`,
  and neither word appears on the other two.
- The in-view card renders no `<a>` at all and no `Open` control; it still carries `is-current`.
- The root card's meta line reads `1 Jul 2026` alone — no `from` clause, and `null` appears nowhere
  in the disclosed markup. The defect found at planning is confirmed fixed in a real engine.
- Viewed from `v4`, one card wears both words in reading order: `· In view · Latest`.
- The batch list's entries read `20 Aug 2026 · In view` and `6 Aug 2026` — the same capitalised word
  the version list uses, and the in-view entry has no link.
- **D-UAT-2 confirmed:** with the batch pen open the acts group (`.versions__openers`) is gone from
  the DOM, and `Versions (4)` is still present and still opens. This is precisely what the control's
  new home buys; inside the acts group it would have vanished.
- `Next version`, `Record another` and `Show changes` are untouched.

At **393** (device emulation, coarse pointer):

- No horizontal overflow — `document.documentElement.scrollWidth` is 393 against a 393 viewport.
- The history control's line is flush with the `<dl>`'s left edge (both at x=20) and opens 12px
  below it — the `--gap-s` the rule reads.
- `.version-strip__marker` computes to the small-print grotesk role: 12px, weight 400, the system
  grotesk stack — the same face and size as the churned date beside it, per DESIGN.md:253.
- Every marker, dead-control and root-card assertion above holds identically.

**What is still Mark's** (WINDOWS entry 2, narrowed rather than closed): whether the relocated
control reads right on its own line below the metadata stack, whether `Version` and `Versions` on
one screen read as a set name rather than a stutter, and a forced-colours plus screen-reader pass.
The markers survive forced colours by construction — they are words in the markup, and the only
rule touching them sets face and size, no colour and no weight — but that has not been seen.

## Known Stubs

None — every disclosed value (`Versions (n)`, `Batches (n)`, `In view`, `Latest`) is wired to real
data with no placeholder path.

## Threat Flags

None — no new network endpoint, auth path, file access pattern, or schema change. This is a pure
presentation/wording change over data the app already reads.

## Self-Check: PASSED

- FOUND: app/src/ui/VersionRow.jsx
- FOUND: app/src/ui/VersionRow.test.jsx
- FOUND: app/src/ui/BatchRow.jsx
- FOUND: app/src/ui/BatchRow.test.jsx
- FOUND: app/src/ui/VersionStrip.jsx
- FOUND: app/src/ui/VersionStrip.test.jsx
- FOUND: app/src/styles/app.css
- FOUND: commit bb4304b in `git log --oneline`
- FOUND: commit b7fd19b in `git log --oneline`
- CONFIRMED: `npm --prefix app test` green at 35 files / 1003 tests (measured, not rounded)
- CONFIRMED: `npm --prefix app run build` succeeds
- CONFIRMED: zero hits for `later[ -]version|later[ -]batch` anywhere under `app/src` (final state)
- CONFIRMED: `git status --short` clean after both commits, no untracked or deleted files
