---
created: 2026-09-17T01:41:00.000Z
title: Page-owned feedback scope — the save announcement and its focus landing
area: ui
severity: major
updated: 2026-09-17T16:10:00.000Z
files:
  - app/src/ui/RecipePage.jsx
  - app/src/router.jsx
  - .impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md
---

## Status, 2026-09-17 — two thirds built, by a different route

**Read this before the analysis below: most of the machinery this asked for now exists.** It
arrived with the *version* pen rather than the batch pen, so the problem statement below still
describes the batch save accurately while the "why the obvious fix does not work" section is now
history rather than a live obstacle.

**Done:**

- **The page-owned region exists** — `PageStatus` in `router.jsx`, rendered in the routed shell
  beside the running head and *outside* the keyed `RecipePage`, so it survives the route change
  that remounts the page. Landed with the version-save work (`1333a7e`), then anchored beneath the
  running head and kept off the printed sheet (`f0a12ce`, `8db14cc`, `d2f075b`, `0dd391e`).
- **The scope discipline holds** — save *failures* stay field- or form-scoped, as this todo
  requires. `260917-e5k` (`1c50cb7`) moved the version pen's refusal and all four of its storage
  failures off the page channel. Only `VERSION_SAVED_STATUS` reaches the page today
  (`RecipePage.jsx` ~1650 and ~1691), which is exactly the rule: the page speaks for a save that
  ends the session.
- **No layout route was needed after all.** This todo predicted "the app's first layout route (a
  pathless route with `<Outlet/>`)". What shipped instead is a wrapper inside `RecipePageForRoute`
  holding the running head and the notice, with `RecipePage` a keyed sibling after it. Same
  property — outside the key, survives the navigation — without touching the route table.

**Still open, and it is the part that matters most:**

- **The batch save still says nothing, and still drops focus.** `handleSaveBatch` announces on both
  of its refusal paths (`MEASURED_INVALID_STATUS`, `CHURN_DATE_BLOCKED_STATUS`) and then calls
  `navigate()` with no `onPageStatus` and no focus landing. This is critique issue 1, unchanged: the
  one irreversible act in the app is the one act with no feedback.

**So what is left is narrow:** call the page channel on a completing batch save with the sentence
`route-recipe-batch.md` § 6 already specifies — "recorded 4 Aug 2026 against 50 g oil · 800 g",
buildable from `record.recordedAt` and `record.snapshot.versionLabel`, the shape `BatchRow` already
prints in the read view — and land focus on the saved record's heading with `tabIndex="-1"`, carried
through the navigation as route state the way `focusDevelop` already is. The amend path does not
navigate and needs the same sentence written in place.

**Also settled since this was written:** the page-shell brief this todo asked for (`/impeccable
shape` before implementation) was never written, because the shell arrived incrementally under the
version work instead. Whether the shell now wants its own brief retrospectively is Mark's call, not
a blocker on the remaining piece.

---

## Problem

This is critique fix 1 (P1) from the 2026-09-16 BatchRow critique, re-scoped after
investigation. It is **not** a harden pass on one component — it needs a new layout route.

**The defect.** Saving a batch says nothing and drops focus. `activeElement` ends up `<body>`,
no `[role=status]` speaks, and the page scrolls to top. The care in the component is inverted:
removing a tasting — recoverable — has a toast, a persistent Restore, a focus landing and a
spoken confirmation. Saving the record, which cannot be re-made because the ice cream is
eaten, has nothing.

**Why the obvious fix does not work.** A live region already exists at `PenFoot.jsx:31`
(`save-ceremony__status`, `role="status" aria-live="polite"`), fed by `recordStatus` and
mounted only on ceremony A (`BatchRow.jsx:742`). It has exactly one writer:
`RecipePage.jsx:1243`, the tasting-removal toast. Every other `setRecordStatus` call is a
clear. It is a removal-toast channel, not a save channel.

All three of the page's live regions are pen-scoped (`BatchRow.test.jsx:393`: tasting-status
in the head, ceremony A's record-status, form-status at `BatchRow.jsx:767`). `handleSaveBatch`
(`RecipePage.jsx:1278`) sets mode to `reading` and drops the draft, so every one of them
unmounts at the moment of the save that should fill it.

**And the save unmounts more than the pen.** `router.jsx:26` gives `RecipePage` an explicit
`key={`${id}::${batchId ?? ''}`}`, so the new-batch path's `navigate()` changes the key and
remounts the whole page. That key is deliberate — D-UAT-2's reset backstop, guarding a stale
`amendingBatchId` throwing in `recordAmendment` and a sibling version silently adopting
another's rows. It is not to be removed to make this easier.

## Solution

Mark's decision, 2026-09-16. **Three feedback scopes:**

| Scope | Owner | Examples |
|---|---|---|
| Field | individual control | "Churn date is required" |
| Form | the batch-entry pen | "Tasting removed — Restore" |
| Page | the stable page shell | "Batch saved", "Changes saved." |

"Tasting removed" belongs to the pen because the pen stays open and the action is reversible
there. "Batch saved" belongs to the page because saving ends the form session and changes the
route.

**The hardening requirement, as Mark stated it:**

> Successful saves publish feedback through a page-owned live region that remains mounted
> across recording and reading states, and across the route change that remounts the recipe
> page. After the reading destination renders, focus moves to the saved record heading
> (`tabIndex="-1"`, never the notice). New-record navigation and in-place amendments use the
> same flash-feedback mechanism through different triggers. Form-scoped status stays reserved
> for reversible actions that do not close the form; save *failures* stay field- or
> form-scoped beside the controls, preserving the maker's work.

**What the page shell owns:** a permanently mounted `aria-live="polite"` / `role="status"`
region; the visible notice presentation; a small flash-message API that survives route
changes; and the clearing behaviour after the announcement and visual display have had time
to land.

**Structural consequences to respect:**

- The region must sit **above** the keyed `RecipePage`, so this introduces the app's first
  **layout route** (a pathless route with `<Outlet/>`). `App` is currently bare
  `RouterProvider` and both recipe paths mount `RecipePageForRoute` directly.
- `location.state` is the right carrier for the new-batch path precisely *because* of the
  remount key — router state survives it where component state, refs and a context provider
  inside `RecipePage` do not. Shape roughly
  `navigate(batchUrl, { state: { flash: { message, focusTarget } } })`.
- **The amend path never navigates** (`RecipePage.jsx:1306-1312` returns to reading in
  place). One channel, two triggers: a navigation-carried payload for a new record, an
  imperative call for amend-in-place.
- **`StrictMode` is on** (`main.jsx:15`). A flash consumed in an effect double-invokes in
  dev — make the consume idempotent or it announces twice.
- **`DESIGN.md` forbids motion.** The notice appears and disappears with no transition. Mark:
  a quiet page-level notice beneath the main header fits Sprinkles better than a floating
  rounded notification, though it is architecturally still page-owned.
- The notice never takes focus — it is confirmation, not a new task. Focus goes to the saved
  record's heading or summary.

**Process, per Mark's choice:** the page shell gets **its own Impeccable brief**
(`/impeccable shape` for the shell surface) before implementation, because this is
cross-route furniture that `route-recipe-batch.md` does not own and that Phase 4's print route
and `RecipeList` also live inside. Then a GSD plan implements it. Impeccable never edits
`app/` directly.

**Sequencing:** Mark split this out from the other critique fixes. Fixes 3, 4, 2 and 5 run
first as small changes; this one lands on its own footing afterwards. Fix 3 in particular
(Next time below Save) should precede Phase 4 plans locking, because the printed batch-log's
side 1 / side 2 order mirrors the pen's sequence.
