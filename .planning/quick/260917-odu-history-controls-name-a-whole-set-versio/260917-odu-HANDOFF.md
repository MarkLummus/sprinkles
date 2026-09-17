# 260917-odu — Handoff to a fresh session

Planned, not executed. The previous session stopped here deliberately, at Mark's request, because its
context had grown long. Nothing is in flight: no executor was dispatched, the tree is clean.

## Start here

1. Read `260917-odu-PLAN.md` (in this directory) and `260917-odu-CONTEXT.md` beside it.
2. The design authority is `.impeccable/surfaces/route-recipe.md` § 3, the bullet **"History controls
   name a whole set, never a direction"** (commit `b9e773f`). Read it before the plan — it carries
   the reasoning, not just the words.
3. **One decision is Mark's and is not settled** — see "Blocked on Mark" below. It can be asked and
   answered in one exchange; the rest of the plan does not depend on it except in Task 1.

## State

- Branch `main`, clean, **2 commits ahead of origin**: `b9e773f` (the brief revision) and `4174742`
  (the plan). Both may be pushed whenever.
- Baseline measured at planning time: **995 tests across 35 files, all passing.**
- The plan is two tasks / two commits: the two disclosures, then the in-list markers.

## Blocked on Mark — the `Later` dt has no replacement label

The struck word "Later" had three carriers. The brief supplies wording for two (the control becomes
`Versions (n)`, the region becomes `Versions`) and none for the third, the `<dt>` label above the
control. A dt reading `Versions` above a control reading `Versions (4)` stutters; a dt reading
`Versions` above a bare `(4)` gives a screen reader a control named "(4)"; and inventing a third word
is what brief § 7 forbids.

The planner's answer is to **remove the dt/dd pair and let the control stand as its own line below
the dl** — same stack, same tab order, slightly further left. It explicitly does *not* move into
`.versions__openers`, because that group renders only when `openPen === null`, which would make the
disclosure vanish whenever a pen is open — exactly the availability `VersionStrip`'s `openPen`
link-suppression exists to preserve (D-UAT-2).

**This is the one place sketch 003's structure gives way** — the sketch draws the control inside the
dl (`:214`). Put that to Mark before executing Task 1.

## What the planner settled, so the next session need not re-derive it

- **`Latest` = `ordered[0]`**, read positionally off the array `VersionStrip` already maps, so the
  marker and the order cannot disagree. Order is `sortedVersions` — `createdAt` descending, nulls
  last. `createdAt` is the only orderable key the record carries: `versionLabel` is maker-authored
  free text, and `saveOverVersion` deliberately never retakes `createdAt`. The plan **forbids**
  `latestVersionPerRecipe`, which is the obvious thing to reach for and carries its own null
  coercion and tie rule — a second opinion where there must be one.
- **The in-view entry stops being a link**, and its `Open` control is not rendered at all. Precedent,
  not invention: `BatchRow`'s own list already renders the batch in view as plain `<strong>` text.
- **The batches list is already almost right.** There is no `BatchStrip`; `BatchRow` renders it
  inline and already maps the complete `sortedBatches` set, already marks the entry in view, already
  omits its link. Only the *count* lied. So item 2 is the count plus the words, and item 3's batch
  half is one capital letter. All the structural work is on the version side.
- **A latent defect the complete set would have exposed**, fixed in Task 2: `VersionStrip` builds
  `from ${version.parentVersionLabel}` unconditionally, safe only while it received descendants only.
  The complete set includes the root, whose `parentVersionId`/`parentVersionLabel` are both `null`,
  so the card would have read `from null`. The clause becomes conditional, mirroring `VersionRow`.
- **The `> 0` gate stays and changes meaning.** `RecipePage` loads `version` and `versions` in two
  effects, so `versions` is `[]` for a paint or two; without the gate the control would flash
  `Versions (0)`. Kept, it now means "the set has loaded".
- **Sketch vs brief is a supersession, not a conflict.** Sketch 003 (2026-09-09) draws the old words;
  the brief bullet striking them is 2026-09-17 and says so. Structure from the sketch, words from the
  brief. The plan recommends rationalising the sketch afterwards so it stops reading as competing
  authority — worth doing, and not part of this task.

## Traps the plan names, which a fresh executor will otherwise hit

- **A test fixture lies.** `VersionStrip.test.jsx`'s `makeVersion` sets `parentVersionLabel` with no
  `parentVersionId`, a shape the store never produces. The moment the `from` clause becomes
  conditional, two meta assertions go red *for a fixture reason*. Fix the fixture; do not weaken the
  assertions.
- **20 assertions across two files, plus four in a third, are enumerated by line** as the contract
  changing. They are to be rewritten to the new contract, never loosened or deleted.
- **Coverage is honestly bounded.** No jsdom, no testing-library (`vitest.config.js` pins
  `environment: 'node'`; all 19 component test files use `renderToStaticMarkup`), so a click-driven
  disclosure cannot be opened in a test. The version markers *are* covered; the batch list's
  `In view` is grep-gated and browser-verified. The plan forbids inventing a shared-constant module
  or a jsdom file to manufacture coverage for one word.
- **The struck-phrase gate reads comments too.** It currently matches 6 files / 34 lines, all of them
  in `files_modified`, including two app.css comments (`:725`, `:1641-1643`) that are historical
  narration rather than live wording.

## Deliberately not done, named rather than silently skipped

- The five `.batch-row__later-*` CSS class names and the exported `laterBatchMetaFor` keep their
  names. They are neither local state nor ids, are invisible to the maker, and renaming them would
  pull in app.css, `cross-cutting.test.js:600` and a test import for no user-visible gain.
- `descendantVersions` becomes an orphan — its only non-test caller was `VersionRow.jsx:80`. Name it
  in the SUMMARY; do not delete it. Dead-code removal beyond this change is out of scope.

## After execution

Browser-check at 1024 and 393 on a store that actually has lineage — **the seeded store holds one
version and one batch, so the counts prove nothing there.** Confirm: the counts include the entry in
view; an ancestor and a sibling are both reachable; `In view` and `Latest` render as words and can
coexist on one entry; "Next version" and "Record another" are untouched; and the relocated control
from the blocked decision above reads correctly in the stack.
