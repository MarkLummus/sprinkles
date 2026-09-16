---
quick_id: 260916-ch0
slug: apply-impeccable-fix-2026-09-16-one-fill
status: complete
date: 2026-09-16
commits: [1bcd9de, 57a6b2f, 6a8b44a, f79791c]
plan_head_before: ce3533d
files_modified:
  - app/src/styles/tokens.css
  - app/src/styles/app.css
  - app/src/ui/VersionRow.jsx
  - app/src/styles/binder.test.js
  - app/src/styles/cross-cutting.test.js
  - app/src/ui/VersionRow.test.jsx
  - DESIGN.md
  - .impeccable/design.json
actuals:
  tokens: 8000
  tasks: 3
  commits: 4
---

# One fill for every on state

Applied `.impeccable/fix/2026-09-16__one-fill-for-every-on-state.md`. Pen blue now
fills every on state — the checked checkbox, the pressed defect, and the pressed
Show changes toggle — closing the two-directions drift the brief documented (the
checkbox filling solid ink, Show changes wearing the retired bold-plus-outline
treatment). The three CONTENT states (`.version-strip__item.is-current`,
`.batch-margin__list li.is-open`, `.ingredient-table tbody tr.is-marked`) were not
touched; their four `binder.test.js` tests are byte-identical to before.

## What changed, by task/commit

**Task 1 — the token pair (two commits, as required):**
- `1bcd9de` — added `--control-h: var(--stop-h)` to `tokens.css`, the shared 32px
  control-height alias sketch 008 line 55 names. `--stop-h` keeps its own name and
  stays the axis stop's own token; no existing `--stop-h` consumer was repointed.
- `57a6b2f` — renamed `--size-defect-mark` → `--size-lead-mark` (sketch 008 line
  59's name), value unchanged (`var(--size-mark-stop)`). Three sites: the
  definition, `.chip-toggle::before`'s width/height, and the
  `binder.test.js:334` assertion. `grep -rn -- '--size-defect-mark' app/src`
  prints nothing (verified after the rename).

  **Revert path, recorded per the plan:** reverting `57a6b2f` alone leaves
  `.text-toggle::before` (added in Task 2, commit `6a8b44a`) pointing at a token
  that no longer exists. A clean revert is `57a6b2f` **plus** repointing
  `.text-toggle::before`'s two `var()` reads back to `--size-defect-mark` — the
  brief's own stated cut, at the cost of a token named for one control (the
  defect) sizing two.

**Task 2 — Show changes becomes the square and the word (`6a8b44a`):**
- `VersionRow.jsx:223` — Show changes carries `text-toggle` alongside
  `headnote__show-changes text-control`.
- `app.css` — inserted the `.text-toggle` block (five rules, transcribed from the
  brief verbatim) immediately after `.text-control`'s own rules; deleted
  `.headnote__show-changes[aria-pressed='true']` (the bold-plus-outline rule)
  entirely and rewrote the comment above `.headnote__show-changes` to state what
  is true now; added `.text-toggle[aria-pressed='true']::before` to the
  `forced-colors: active` block's first selector list.
- Confirmed the touch cascade in source, not by assumption: a new
  `cross-cutting.test.js` test asserts `.text-toggle`'s top-level index is less
  than the touch-union `.text-control` rule's index (so the union's 44px wins at
  a coarse pointer), and that no `.text-toggle` rule exists inside any media
  block.
- Also confirmed at planning and unchanged by this task: at a **wide** touch
  viewport (`(min-width: 760px) and (pointer: coarse)`) the only `.text-control`
  narrowing is scoped to `.axis-mark__head`/`.segmented-field__head` — Show
  changes is not in a caption line, so it keeps the union's 44px there too.

**Task 3 — the checkbox fills pen blue, its label takes the touch target
(`f79791c`):**
- `app.css:input[type='checkbox']` — added `box-sizing: border-box`,
  `cursor: pointer`, `flex: 0 0 auto`; new `:hover` rule thickens the border to
  `--rule-hover`; `:checked` now declares `background: var(--pen-blue);
  border-color: var(--pen-blue)` (was `background: var(--ink)`, no border-color).
- Touch union — added `.method-step__uses-item, .method-step__strike-control`
  (the two checkbox label wrappers, confirmed as the app's only two
  `type="checkbox"` call sites) immediately after `.text-control`, per sketch 008
  line 260: the label grows, not the square.
- Forced colours — added `input[type='checkbox']:checked` to the same selector
  list Task 2 extended (Task 3 ran second and did not clobber Task 2's entry).
- Design record — `DESIGN.md`'s Checkbox entry now says "filled pen blue when
  checked, like every other on state"; Box-or-word gained the square-and-word
  third case naming Show changes; Elevation & Depth's 1px-outline list dropped
  "a pressed Show changes" (content states only now). `.impeccable/design.json`
  gained a **Text toggle** component entry beside Defect toggle, modelled on it,
  with `html`/`css` transcribing the shipped rules including its touch and
  forced-colors media blocks. One additional fix beyond the plan's literal
  instructions: the existing **Defect toggle** entry's own `css` field still read
  `var(--size-defect-mark)` in its `.ds-chip-toggle::before` transcription — that
  token no longer exists anywhere under `app/src` after Task 1's rename, so the
  design record would have described a token the shipped app no longer has.
  Updated it to `--size-lead-mark` to keep the record accurate (Rule 1 — the
  design record's own stated job is to describe shipped code).

## Tests rewritten rather than amended, and why

Four assertions pinned exactly the drift this brief removes; each was replaced,
not patched, because amending them would have quietly weakened what they prove:

1. `binder.test.js` — the `.headnote__show-changes[aria-pressed='true']` outline
   test (the rule it asserted was deleted). Replaced with a test asserting the
   rule is `undefined`, the `.text-toggle[aria-pressed='true']::before` square
   fills pen blue, and — using a filter over `rules` rather than
   `ruleFor(...)` — the button itself never fills, bolds, or gains an outline.
   `ruleFor` does exact-string lookup and `css-source.js` stores the brief's
   paired underline rule as one grouped, whitespace-normalised string, so a bare
   `ruleFor(".text-toggle[aria-pressed='true']")` would return `undefined`
   whether or not the rule existed — that would have passed for the wrong
   reason, so the plan's filter-and-assert form was used instead.
2. `binder.test.js` — the checkbox `:checked` test asserted
   `background: var(--ink)`, the exact drift being removed. Replaced with a test
   asserting `var(--pen-blue)` fill and border-color; also added tests for the
   new `box-sizing`/`flex` declarations, the new `:hover` rule, and the checkbox's
   presence in the forced-colors block (none of these existed before).
3. `cross-cutting.test.js` — the touch-union census asserted **exactly five**
   rules by an exact selector array; Task 3 adds a sixth
   (`.method-step__uses-item, .method-step__strike-control`). The array and the
   test title were both updated ("five" → "six").
4. `VersionRow.test.jsx` — an exact-string regex matched
   `class="headnote__show-changes text-control"`; adding `text-toggle` would
   have broken the match outright, so it was extended to the full three-class
   string. The looser `toContain('headnote__show-changes')` test beside it was
   also extended to assert `text-toggle`.

The four content-state tests (`is-current`, `is-marked`, the batch-list
`is-open`, and the "no rule declares outline: none" census) are byte-identical
to before this task.

## Verification

`npm --prefix app test`: **944/944 passing**, run fresh after each task and once
more after all four commits.

`node -e "JSON.parse(...)"` confirms `.impeccable/design.json` still parses.

`grep -rn -- '--size-defect-mark' app/src` prints nothing (exit 1) — the rename
left zero occurrences under `app/src`, including comments.

## Live-browser checkpoint — deferred per Mark's standing instruction

Mark is away; per the standing instruction to defer a blocking `human-verify`
checkpoint to end-of-phase UAT rather than self-approve it, this executor did
**not** open the app or attempt any of the following. All automated verification
is complete and green — item 1 below, `npm --prefix app test`, is already
satisfied; items 2-5 are carried verbatim from the plan's checkpoint for Mark to
run in a real browser:

1. `npm --prefix app test` green. **Done — 944/944.**
2. **Desktop width, a version with a parent** — press **Show changes**: a 13px
   square before the word fills pen blue; the word does **not** bold; **no
   outline** appears; the underline stays hairline; **nothing on the line
   moves**. Hover thickens the square only. Tab to it — one 2px ink ring around
   square and word together.
3. **A batch pen** — check **Skipped** on a step: the square fills **pen blue,
   not ink**. Same for a row in the **Uses** checklist.
4. **Coarse pointer emulated** — this is the VERIFY-not-assume item. Read the
   computed value, do not eyeball it: `getComputedStyle($0).minHeight` on the
   real Show changes button reads `44px` at coarse and `32px` at fine, and both
   checkbox labels read `44px`. If Show changes reads 32px at coarse, the
   `.text-toggle` block landed after the touch union — move it and re-run Task
   2's source-order test.
5. **`forced-colors: active` emulated** — all three fills repaint in the system
   `Highlight` and none of them vanishes.

## Known Stubs

None.

## Self-Check: PASSED

All 8 code/design files and the SUMMARY itself confirmed present on disk; all
four commits (`1bcd9de`, `57a6b2f`, `6a8b44a`, `f79791c`) confirmed in
`git log --oneline --all`.
