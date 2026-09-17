# 260917-odu — Context (locked decisions)

Mark directed this on 2026-09-17 through `/impeccable clarify`. The decisions are recorded in
`.impeccable/surfaces/route-recipe.md` § 3, **"History controls name a whole set, never a
direction"** (commit `b9e773f`). **Read that bullet first** — it is the authority and it carries the
reasoning as well as the words.

## This is not only a rename

The counts and the contents both change. Do not treat it as a string swap.

The old wording was relative to wherever the maker was standing: "3 later versions" named a different
three on every page, and the disclosure showed only the subtree *below* the current version — so an
ancestor or a sibling was unreachable from a page that nonetheless claimed to count the versions. The
brief's own raise from the round already asked for the opposite: "every superseded version reachable
in one strip".

## Item 1 — the version row's disclosure becomes the recipe's complete version list

- Today `VersionRow.jsx` (~74-81) computes
  `descendants = descendantVersions(versionsForRecipe(versions, version.recipeId), version.id)` and
  `laterCount = descendants.length`. Its own comment calls this "the CURRENT version's own
  descendants — the whole subtree below it, not the recipe's full version list". That behaviour is
  retired.
- It becomes **every version of this recipe, including the one in view**. The count is that set's
  length.
- The `<dt>Later</dt>` label (~221), the control's words `{laterCount} later version{s}` (~230), and
  the disclosed `<section aria-label="Later versions">` with its `<h2>Later versions</h2>` (~275-276)
  all take the brief's wording: the control reads **`Versions (n)`**; the region and its accessible
  name read **`Versions`**.
- Rename the local state and the ids off "later" as well — `version-row-later` as an id is now a lie.
- Check whether `descendantVersions` still has another caller. If this was its only one, **name the
  orphan in the SUMMARY** rather than deleting it; dead-code removal beyond this change is not in
  scope.

## Item 2 — the batch row's disclosure counts every batch of the version in view

- Today `BatchRow.jsx` (~458-459) computes `laterBatchesCount = batches.length - (openBatch ? 1 : 0)`
  — every batch *except* the one being read.
- It becomes every batch of the version in view, **including that one**, and its control reads
  **`Batches (n)`**. Rename its state, its ids and its region name off "later" the same way.

## Item 3 — name position inside the lists

- In `VersionStrip.jsx` the entry matching `currentId` carries only an `is-current` class (~40). It
  gains a visible text marker reading **`In view`**.
- The newest version gains a visible text marker reading **`Latest`**. Both can land on the same
  entry; every other entry carries neither, so absence stays legible.
- These are **words, not a style**. `DESIGN.md`'s rule is that form carries state, and a marker that
  exists only as a class is invisible to a screen reader and under forced colours. Put them in the
  markup, in the existing type roles, reading tokens for every value.
- Decide and state how "newest" is determined. `createdAt` is the obvious key, but check what the
  strip already sorts by so the marker and the order cannot disagree.
- Apply the same `In view` marker to the batches list for the batch being read, so the two lists
  behave alike.

## Preserve exactly

**"Next version"** and **"Record another"**. They are acts, not history, and they already say what
they do.

## Constraints

- Every visual value reads a custom property from `app/src/styles/tokens.css`. No literal.
- No colour change, no motion, nothing moves on focus, hover or selection.
- Notes and prose render as text, never markup.
- Do not touch the batch pen's save wiring, the churn-date wiring, the version field errors,
  `router.jsx`, or `PenFoot`.
- Do not edit anything under `.impeccable/` or `DESIGN.md` — those are the orchestrator's.

## Verification

1. `npm --prefix app test` — baseline **995 passing across 35 files**. Report the real number; never
   adjust an assertion to hit it.
2. Existing tests almost certainly assert the old strings and the old counts. Those are **the
   contract changing** — rewrite them to the new contract rather than loosening or deleting them, and
   say per assertion what changed.
3. Add coverage for the complete-set counts (a version with an ancestor **and** a sibling must count
   them), for `In view` on the entry being read, and for `Latest` on the newest.
4. The orchestrator runs the browser check at 1024 and 393. Note in the SUMMARY that the seeded store
   holds only one version and one batch, so the counts need a store with real lineage to exercise.
