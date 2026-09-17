---
quick_id: 260916-vv1
slug: add-prose-field-to-the-touch-union-min-h
date: 2026-09-16
mode: quick
status: complete
files_modified:
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
commit: 8987f85
---

# `.prose-field` joins the touch-union `min-height` list — Summary

`.prose-field` now takes the shared 44px touch-target floor (`--touch-min`)
alongside `button, select, .ink-field, .segmented__option,
.batch-margin .chip-toggle`, closing a real UX1-01 violation on the four
record prose fields (Impeccable critique issue 4, P1).

## Root cause (resolved, not "unexplained")

Independently measured in Chrome (orchestrator level) at the real app,
`/recipe/:id` record pen open, viewport **1366x937**, `pointer: coarse`
**false**, `(max-width: 759.98px)` **false** — i.e. true desktop. The three
open `.prose-field` textareas (At the machine, Ingredient notes, Next time)
each measured:

- `height: 18px`, `width: 598px`, `rows: 2`, `min-height: auto`,
  `padding: 0px/0px`, `line-height: normal`, `font-size: 15px`,
  `scrollHeight: 17`, `field-sizing: content`, no inline height.

`field-sizing: content` (app.css:259-262, unconditional on `textarea`) sizes
the box to its content, so `rows="2"` is inert and an empty field collapses
to one line. **This affects desktop too, at ~18px** — this fix does not
reach desktop, by Mark's decision (see "Deferred" below).

The fix was verified on the live element to compose correctly with
`field-sizing` rather than fight it:

| State | `min-height: 44px`? | Rendered height |
|---|---|---|
| empty | no | 18px |
| empty | yes | **44px** (floored) |
| four lines | yes | **69px** (grows past the floor) |
| four lines | no | 69px (identical — the floor doesn't cap growth) |

Nothing was saved during measurement; the pen was cancelled and React state
was never touched.

## What changed

**`app/src/styles/app.css`** — inside the touch union
(`@media (max-width: 759.98px), (pointer: coarse)`), `.prose-field` joins
the min-height rule's selector list, positioned after `.ink-field` and
before `.segmented__option` (matching this block's existing
`.ink-field, .prose-field` font-size pairing). It rides the SHARED
`min-height: var(--touch-min)` declaration — no private rule, no new
declaration, no px literal. A comment above the rule records the critique
origin, Mark's approval, the shared-token reasoning, and the sketch
departure (below). `.prose-field`'s base rule (~1351) is unchanged: still
no `min-height`, no `height`, so nothing competes with `autoGrow`'s inline
`height` in `BatchRow.jsx` — `min-height` wins by definition, so the floor
holds through every input event with no JS change.

**`app/src/styles/cross-cutting.test.js`** — the contract pinning the touch
union's selector list moved to the new string at unchanged strictness:

- Line 56 (test name) and line 57 (`mediaRuleFor(...)` argument): both now
  read `'button, select, .ink-field, .prose-field, .segmented__option, .batch-margin .chip-toggle'`.
- Line 86 (the `toEqual` array's first element): same new string, with a
  comment recording that `.prose-field` joined in 260916-vv1.

No assertion was weakened. The line-83 test name ("the six sizing rules")
and the `widthOnly` array below it are untouched — the touch union still
carries exactly six rules; a selector joined an existing rule, none was
added.

## Verification

All five plan gates ran and passed, as predicted:

1. `tr '\n' ' ' < app.css | grep -q '...min-height: var(--touch-min);...'`
   — PASS. The exact new selector list, in order, token-only.
2. `! grep -q 'select, .ink-field, .segmented__option'` — PASS. No stale
   copy of the old selector sequence remains anywhere in app.css.
3. Region-scoped `awk` extract of `.prose-field`'s own base rule, anchored
   `grep -Eq '^[[:space:]]*(min-)?height:'` — PASS (no match). Confirmed
   the anchored form matters: the base rule's `line-height: inherit` would
   have falsely tripped an unanchored gate.
4. `.ink-field, .prose-field { font-size: var(--type-note); }` pairing —
   PASS, untouched.
5. `npm --prefix app test` — **33 files / 945 tests passed**, matching the
   baseline exactly. No test added or removed.

`git diff --name-only` (staged) listed exactly `app/src/styles/app.css` and
`app/src/styles/cross-cutting.test.js`. One commit: `8987f85`.

## Deviations from Plan

None — plan executed exactly as written.

## Twelve fields reached

Because the floor lives in the shared declaration, every `.prose-field`
instance gains the 44px minimum at a coarse pointer or below 760px, not
just the four record fields the critique named:

- `Headnote.jsx:23` — the intro paragraph
- `Method.jsx:150, 158, 228, 255, 459` — lead-in, instruction, purpose,
  aside, and the method's own note
- `Authored.jsx:24` — an authored note
- `VersionRow.jsx:272` — the reason
- `BatchRow.jsx:511, 524, 607, 730` — the critique's original four (At the
  machine, Ingredient notes, How did it turn out?, Next time)

This is the intended consequence of keeping the token shared (they are all
fields a maker types into on the same device), but it is a visible change
to the recipe-version page at touch as well as the record.

## Deferred / for Mark

**1. Desktop `.prose-field` stays one line tall (~18px) — not fixed here,
by design.** The app's `.prose-field` base rule is missing sketch 008 line
141's three declarations: `min-height: calc(var(--leading-note) * 1em)`,
`padding: var(--gap-hair) 0`, and `line-height: var(--leading-note)`. The
app has `padding: 0`, `line-height: inherit`, and no `min-height`. Combined
with `textarea { field-sizing: content }` (app.css 259-262, unconditional),
this collapses every prose field to one line at rest, on desktop where this
task's fix (a `min-height` inside the touch-only media union) can never
reach. 44px here is a touch-target floor, not the restored two-row prose
field the sketch draws. Widening this task to fix that would have breached
CLAUDE.md §3 (surgical, single-fix scope); it needs its own task, sized
against `.prose-field`'s base rule.

**2. Sketch departure — this app-side fix goes beyond the sketch.** Sketch
008 line 166 lists the touch `min-height` selectors as `.chip-toggle,
.defect, .check, .seg .opt, .text-control, .btn, .ink-field` —
`.prose-field` is deliberately absent — while line 167 pairs `.ink-field,
.prose-field` for `font-size` only. Sketch 007 lines 176-179 say the same.
The sketch's own prose field at touch measures ~24px (`min-height: 1.5em`),
also under 44px — so the critique's finding is a finding against the
sketch too. Mark approved landing the app-side fix ahead of the sketch;
the standing rule is that app-side decisions get drawn back into the
sketch rather than left as a departure row. Editing sketch 008/007 was
outside this task's file list (`app/src/styles/app.css`,
`app/src/styles/cross-cutting.test.js` only); the departure is recorded
here and in the CSS comment for a follow-up sketch rationalisation.

**3. iPad UAT still outstanding.** No suite in this project has a layout
engine (`cross-cutting.test.js` says so in its own header), so no automated
check here can observe a rendered height. Needed from Mark:
- On the iPad, in the real app, confirm the four prose fields each measure
  at least 44px at rest. Mark's iPad reports viewport **1366** with
  `pointer: coarse` — a width threshold would never catch this, which is
  why the union's pointer arm exists and why the device is the only place
  this can be confirmed.
- A Chromium pass at 759px width exercises the same CSS branch (the
  union's width arm) but is an inference about a coarse pointer, not an
  observation of one — precedent SR-6, the date input, where Chromium
  reported 44px for a field the iPad rendered at 29px.
- Check the recipe-version page at touch too (not just the record): the
  intro paragraph, each step's lead-in and instruction, the purpose, the
  aside, an authored note, and the reason all gain the same floor. Confirm
  the page still reads as a printed sheet and no field now looks like an
  empty box.

## Self-Check: PASSED

- FOUND: app/src/styles/app.css (modified, `.prose-field` in touch union)
- FOUND: app/src/styles/cross-cutting.test.js (modified, three assertions)
- FOUND: commit 8987f85 in `git log --oneline`
- CONFIRMED: `npm --prefix app test` reports 33 files / 945 tests passed
