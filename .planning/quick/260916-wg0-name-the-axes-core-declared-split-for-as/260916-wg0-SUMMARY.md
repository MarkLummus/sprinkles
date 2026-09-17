---
quick_id: 260916-wg0
slug: name-the-axes-core-declared-split-for-as
date: 2026-09-16
mode: quick
status: complete
files_modified:
  - app/src/ui/AxisMark.jsx
  - app/src/ui/AxisMark.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
commits:
  - c09f280
  - 8979e5e
---

# Name the axes core/declared split for assistive tech — Summary

Each of the six goldilocks axes' stops group is now named by its own axis
name followed by the matching core/declared cue —
`aria-labelledby="axis-name-hardness axes-core-cue"` for a core axis,
`aria-labelledby="axis-name-body axes-declared-cue"` for a declared one —
so a screen reader announces "Hardness, Every recipe" / "Body, This recipe
only" for every axis, in both the desktop and stacked arrangements
(Impeccable critique issue 5, P2).

## Restores, does not depart

This fix restores an unsuperseded contract line rather than departing from
the sketch. `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md:158`
reads "Screen readers hear the cue as part of Body's box." Line 532 records
that the cue-row redesign superseded the caption's *location* only (moving
"Declared for this recipe" out of Body's box and into the shared cue rows
above the grid) — it did not supersede the announcement requirement, and
moving the cue out of the box silently dropped it for assistive tech.
This fix meets line 158's requirement without moving any DOM: the cue text
stays exactly where the cue-row redesign put it, and the connection back to
each axis is made via `aria-labelledby` id reference instead. Nothing is
owed back to sketch 007/008 here — unlike 260916-vv1, which was a genuine
departure the sketch needs to absorb.

## What changed

**`app/src/ui/AxisMark.jsx`** — the leaf gained an optional `cueId` prop,
last in the destructured signature. The stops group's `aria-labelledby`
changed from the bare `nameId` to a truthy-checked composition:
`cueId ? `${nameId} ${cueId}` : nameId`. Omitted, the output is
byte-identical to before (`aria-labelledby="axis-name-{key}"`, no trailing
space) — every existing call site and test keeps rendering a valid group.
The div's attribute order (`class`, `role`, `aria-labelledby`, `onKeyDown`)
is unchanged; only the value changed. This task is a no-op on rendered
output by design — `BatchRow.jsx` is the only caller, and it did not yet
pass `cueId` until the second commit.

**`app/src/ui/BatchRow.jsx`** — two module-scope id constants above
`AxesGrid` (`AXES_CORE_CUE_ID = 'axes-core-cue'`,
`AXES_DECLARED_CUE_ID = 'axes-declared-cue'`), distinct from the defects
section's own `defects-core-cue` / `defects-declared-cue`. All four cue
`<p>` elements (two in the stacked arrangement, two on desktop) gained the
matching `id`, `className` first and `id` second — no `role`, no other
attribute, no class or text change. `renderAxis`, the single render path
shared by both arrangements, gained one line passing
`cueId={axis.group === 'declared' ? AXES_DECLARED_CUE_ID : AXES_CORE_CUE_ID}`.
One id pair suffices: `AxesGrid` renders exactly one arrangement per call
(early-returns on `below`), and `<AxesGrid>`/`<BatchRow>` each mount once
in the live app.

**Deliberately not done, per the plan's explicit rejections:** no group
wrapper gained a `role` or `aria-labelledby` (the desktop arrangement has
no wrapper to attach one to, and `display: contents` — the only way to add
one without restructuring the grid — has a history of dropping elements
from the accessibility tree); the stacked-only fix was rejected too. No
`role` was added to the cue `<p>` elements — `aria-labelledby` flattens
their text into the group's name regardless of role, so a role would add
nothing and risks the qualifier being announced twice.

## Mark's decision, applied as given

Mark ruled: label BOTH groups. Core axes get `axes-core-cue` ("Every
recipe"), declared axes get `axes-declared-cue` ("This recipe only") — a
symmetric fix, matching how the defects section already references
`defects-core-cue` for its own core group. This was implemented exactly as
decided; the core cue was not conditioned, reduced, or dropped for any
axis. Mark chose to decide the verbosity question on UAT evidence rather
than predict it, since dropping the core cue afterward is a one-ternary
change (flip the `renderAxis` branch to only pass `cueId` for declared
axes).

## Verified accessible names, both arrangements

Rendered `AxesGrid` directly with `below={false}` and `below={true}` and
captured the actual `aria-labelledby` values (not just asserted via test):

**Desktop (`below={false}`):**
```
aria-labelledby="axis-name-hardness axes-core-cue"
aria-labelledby="axis-name-scoopability axes-core-cue"
aria-labelledby="axis-name-body axes-declared-cue"
aria-labelledby="axis-name-smoothness axes-core-cue"
aria-labelledby="axis-name-sweetness axes-core-cue"
aria-labelledby="axis-name-oil axes-declared-cue"
```

**Stacked (`below={true}`):**
```
aria-labelledby="axis-name-hardness axes-core-cue"
aria-labelledby="axis-name-scoopability axes-core-cue"
aria-labelledby="axis-name-smoothness axes-core-cue"
aria-labelledby="axis-name-sweetness axes-core-cue"
aria-labelledby="axis-name-body axes-declared-cue"
aria-labelledby="axis-name-oil axes-declared-cue"
```

Both match the plan's table exactly, in both arrangements. In both
renders, `id="axes-core-cue"` and `id="axes-declared-cue"` each occurred
exactly once (`markup.split(needle).length - 1 === 1`), confirming each
cue id resolves to a single unambiguous target.

## Verification

1. `npm --prefix app test -- AxisMark` → `Test Files 1 passed (1)`,
   `Tests 9 passed (9)` (7 baseline + 2 new).
2. `npm --prefix app test -- BatchRow` → `Tests 122 passed (122)`
   (119 baseline + 3 new).
3. `npm --prefix app test` → `Test Files 33 passed (33)`,
   `Tests 950 passed (950)` (945 baseline + 5 new), exactly as required.
4. `git diff --name-only` after each task listed exactly the two files
   that task named — no stylesheet, no other component.
5. Confirmed the pre-existing assertions at `BatchRow.test.jsx` ~490-494
   (the `class="pen-caption axes-cue axes-cue--core"` / `--declared`
   `toContain` pair) and ~522 (`not.toContain('axes-declared-caption')`)
   are unmodified in the diff and still pass — the `id` went in after
   `className`, so the class attribute stayed a contiguous substring, and
   `axes-declared-cue` does not contain the literal `axes-declared-caption`.
6. Two commits, one per task: `c09f280` (Task 1, `AxisMark`), `8979e5e`
   (Task 2, `AxesGrid`).

## Deviations from Plan

None — plan executed exactly as written, including Mark's ruling to label
both groups without reducing or conditioning the core cue.

## UAT — real screen reader, outstanding (not a gate)

Needed from Mark, on a real screen reader (VoiceOver, macOS or iPad — the
iPad is the device that matters per the standing "verify in the engine
that matters" note; the stacked arrangement is what a phone gets):

- [ ] A **core** axis announces the axis name plus "Every recipe" — e.g.
      "Hardness, Every recipe".
- [ ] A **declared** axis announces the axis name plus "This recipe
      only" — e.g. "Body, This recipe only".
- [ ] The qualifier is **not announced twice** — not once from the group
      name and again from the cue `<p>` as the reader passes over it.
- [ ] Both hold in the **stacked** arrangement (below 760px, or the
      phone) as well as at desktop.
- [ ] **Listen specifically for verbosity**: "Every recipe" now trails
      all four core axes. If four repetitions per pass reads as noise,
      that is a decision for Mark to re-open — the code change to drop
      the core cue would be one ternary in `renderAxis` — but it was not
      a builder's call and was not made during this execution.
- [ ] Nothing visible moved: the cue rows sit where they did, the
      hairline is where it was, and tabbing the six axes follows the same
      order as before.

## Self-Check: PASSED

- FOUND: app/src/ui/AxisMark.jsx (modified, optional `cueId`)
- FOUND: app/src/ui/AxisMark.test.jsx (modified, two new tests)
- FOUND: app/src/ui/BatchRow.jsx (modified, two cue ids + pass-through)
- FOUND: app/src/ui/BatchRow.test.jsx (modified, three new tests)
- FOUND: commit c09f280 in `git log --oneline`
- FOUND: commit 8979e5e in `git log --oneline`
- CONFIRMED: `npm --prefix app test` reports 33 files / 950 tests passed
