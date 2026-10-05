---
phase: quick-261004-uyd
plan: 01
subsystem: recipe-route-batch-log
tags: [batch-head, fold-row, sketch-011-decision-50, notebook-css]
requires:
  - FoldRow, useFold (existing)
provides:
  - "The Batch head as a fold row (BATCH, Hide or Show, a dot, the date), open at every width, folding the whole batch body"
affects:
  - app/src/ui/BatchRow.jsx
  - app/src/styles/notebook.css
tech-stack:
  added: []
  patterns:
    - ":has(.fold-row) scoping so the pen and no-batch heads keep their computed style"
key-files:
  created:
    - .planning/quick/261004-uyd-build-decision-50-the-batch-fold-form-a-/261004-uyd-probe.mjs
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/RecipePage.folds.test.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
decisions:
  - "Decision 50 A (fold row form) with C1 (open at every width), Mark 2026-10-05"
  - "The new CSS rules are scoped with :has(.fold-row); no new class, markup is the board's"
  - "The two existing breakpoints (723.98px, 1366px) stand in for the brief's container query"
metrics:
  duration: "about 40 minutes"
  tasks: 3
  files: 7
  completed: 2026-10-05
status: complete
commits: 4
plan_head_before: ddc618c105ac558d2dfe16043535155b30573e71
plan_head_after: a328282646ebdca824d7b27f40bb9d94c74c3d97
actuals:
  tokens: 6100
  tasks: 3
  commits: 4
---

# Phase quick-261004-uyd Plan 01: The Batch head is a fold row (decision 50 A, C1) Summary

With no pen open and a batch in view, the Batch head is now the same fold row the Tasting head uses: BATCH, Hide or Show, a dot, then "churned 2 Aug 2026" in 12px grey. It is open on first load at every width. Hide folds the whole batch body. Correct and Record another stay in the head.

The full suite passes (62 files, 1709 tests). The probe passes all 247 checks in WebKit and Chrome. Nothing in this run failed. The plan went as written, with the departures listed below, which the plan itself named.

## What changed

Four commits, tests first for both code changes. The test-first order is real: after each test commit the new tests failed because the fold row or the rules were missing.

| Commit | What |
|---|---|
| 7901583 | test: pin the Batch head as a fold row, open at every width |
| 39b7b07 | feat: the Batch head is a fold row that hides the whole batch, open at every width |
| 1a23759 | test: pin the Batch fold head's layout rules |
| a328282 | feat: lay the Batch fold head out as the Tasting head, full row in the narrow log |

Files:
- `app/src/ui/BatchRow.jsx`: `useFold(true)` for the Batch fold (it does not read `foldsOpen`, so no width crossing resets it, nothing is stored). `batchFold = openPen === null && Boolean(openBatch)`. h2#batch keeps its attributes and holds `<FoldRow label="Batch" controls="fold-batch" count="churned ...">` when `batchFold`. The `.batch-row__date` span renders only when `!batchFold`. The `.batch-margin` div is wrapped in `<div id="fold-batch" hidden={batchFold && !batchOpen}>`, rendered in every state, so opening a pen never remounts the body. The wrapper's inner lines were not re-indented, to keep the diff to the lines that changed.
- `app/src/styles/notebook.css`: three top-level rules after `.batch-row__head-acts`, and the same three narrow rules at the end of the existing `(min-width: 1366px)` and `(max-width: 723.98px)` blocks. All scoped with `.notebook-log .batch-row__head:has(.fold-row)`. No new media block (still six steps), no new token.
- Tests: `BatchRow.test.jsx` (five existing read-state tests updated, `fold-row` absence added to the record, amend and plan tests, a new describe), `RecipePage.folds.test.jsx` (new describe: open at 393, 744, 1024, 1366; Hide, the head stays, and crossing 1366 either way leaves it closed; Go to batch lands on h2#batch), `RecipePage.recordTasting.test.jsx` (one line, the read state reads `.fold-row__count`), `notebook.test.js` (new describe for the nine rules).

Two extra tests had to be updated in Task 1 because they pinned the old read-state head. Both are in `BatchRow.test.jsx`:
- "renders exactly 2 links, each with tabindex="0", and the list before the Batch h2" now finds the heading by `<span class="fold-row__head">Batch<`.
- "reading a batch: Correct, Record another and the Tasting fold row — 3 buttons" now counts four buttons (the Batch fold row is the fourth) and says so in its title.

## What the brief said and the code does differently

1. **The 723 width: 88px built, the board's 44px.** The brief drew the narrow rule as a container query (log under 447px). This build has none, and `css-source.js` throws on any at-rule other than `@media`. So the existing `(max-width: 723.98px)` and `(min-width: 1366px)` blocks stand in. At 723 the head is 88px with Correct and Record another under the fold row. The brief's container form read 44 there. The same applies from about 487 to 723, where the actions would fit beside the fold row but stand under it instead. The probe gates 88 at 723 and prints the brief's 44 beside it. This is the cost the brief itself named.
2. **The pen heads were left as built.** The brief says that with a pen open the head is "the heading alone, as now". In the code, the amend pen (Correct, Record a tasting) and the plan pen show "Batch" and the `.batch-row__date` span today, and `BatchRow.test.jsx` pins that. Nothing here is drawn for them, so they stay as built, and the `.batch-row__date` rules in app.css and notebook.css are still in use. The brief expected them to be unused. The record pen and the no-batch state show the heading alone, as before.
3. **The `:has(.fold-row)` scoping.** The brief's rules were unscoped. Its narrow `.region-name { flex: 1 1 auto }` would have pushed the amend pen's date span to the far right at 393 and 1366. So every new rule is scoped with `:has(.fold-row)`, which matches only the head that renders the fold row. The markup is exactly the board's, with no new class. `.notebook-log .batch-row__head` (decision 42) is unchanged for the pen and no-batch heads.

## Behaviour not drawn, observed in the code, not built (questions for Mark)

1. **Correct from a closed fold.** The fold keeps its state while the page stays mounted. A Correct started from a closed fold returns to a closed fold after Save or Cancel, and the save's landing focuses the closed head. (While the pen is open, the body is shown regardless, because `hidden` applies only when `batchFold`.)
2. **Go to batch on a closed fold.** Go to batch on a fold the maker closed lands on the head and leaves it closed. Under C1 nothing reopens it.
3. **Moving to another batch.** Moving to another batch, by the batch list or after Record another, remounts the page, and the fold opens again.

None of these was built or decided.

## Readings

The method: the existing build (`app/dist`, read only, served on ephemeral 127.0.0.1 ports) with the new markup set in the page by a DOM edit and the nine rules read from the edited `notebook.css` added in a style tag. Both engines used the harness's `openApp` (coarse: touch, mobile, scale 3). Sid's numbers came from touch at scale 1, and the readings still matched to the hundredth.

Head height, open (coarse, then Chrome fine pointer):

| width | WebKit coarse | Chrome coarse | Chrome fine | built head (WebKit) |
|---|---|---|---|---|
| 393 | 88 | 88 | 68 | 78.22 |
| 723 | 88 (brief container form: 44) | 88 | not run | 44 |
| 724 | 44 | 44 | not run | 44 |
| 1024 | 44 | 44 | 44 | 44 |
| 1366 | 88 | 88 | 68 | 78.22 |

Date ink left, open / closed, WebKit coarse: 393 and 723: 139.66 / 144.82. 724 and 1024: 127.66 / 132.82. 1366: 119.66 / 124.82. These equal Sid's numbers exactly. Chrome (coarse and fine) reads 137.8 / 143.8 at 393 and 723, 125.8 / 131.8 at 724 and 1024, 117.8 / 123.8 at 1366, equal to Sid's Chrome numbers. Sid had only a fine pointer for Chrome; coarse Chrome matched the same figures.

Gate results (all passed, 247 checks):
- **G0, the build is the one the brief measured (WebKit):** built head 78.22, 44, 44, 44, 78.22; built date ink left 80.13, 80.13, 68.13, 68.13, 60.13; 15px, no `::before`.
- **G1, head height and fold row:** as in the table. The fold row is 44 tall everywhere. It equals the lead's width at 393, 723 and 1366, and ends at the date's ink right at 724 and 1024.
- **G2, the date like Tasting's:** 12px, rgb(89, 89, 89), the same dot, h2 size, weight, colour and transform equal Tasting's, accessible name "Batch, Hide, churned 2 Aug 2026".
- **G3, the actions:** Correct's ink left minus the date's ink right is 32 at 724 and 1024 (Chrome fine at 1024 too), and its centre lies within the fold row. At 393, 723 and 1366 Correct's ink left equals the fold row's left and the acts' top equals the fold row's bottom.
- **G4, closed:** the section equals the head (88 or 44), `.batch-margin` has no client rects, the head height equals the open head's, Correct and Record another are rendered.
- **G5, the wrap leaves the body alone:** zero difference at every width.
- **G6, the date's position against Sid:** every width, both engines, equal.
- **G7, landing (both engines, coarse, 393 and 1024):** h2#batch is focused with `is-landing-focus`, solid outline of the focus token's width, h2's box equals the fold row's box, the ring sits inside the window across, and no ancestor has a non-visible overflow, so nothing clips it. Ring top and bottom: WebKit 393: 410.67 to 462.67 of 852; WebKit 1024: 531.83 to 583.83 of 1000, sticky bar bottom 57. Chrome the same within 1.2px.
- **G8, the pen wrap is neutral (WebKit coarse, 393 and 1366):** `.batch-row` and the head have identical heights before and after wrapping the pen's body, and the head holds no `.fold-row`. The pen was never saved.

## Consequence: no build

Mark's running preview does not show this until `npm --prefix app run build` runs. A DOM edit on the old build is not a build. No build and no Vite were run, and :4173 was not touched.

## Not verified

- Two or more batches (the head after the batch list).
- The iPhone and the iPad (WebKit on a Mac and Chrome only).
- Chrome fine at 723 and 724 (not in the plan).

## Deviations from Plan

None, apart from the two updated tests named above (the plan allowed this) and the point that the wrapper's inner JSX was not re-indented.

## Known Stubs

None.

## Threat Flags

None. No new input, endpoint or stored state.

## Deferred Human Verification

Suggested device checks. I filed no Mark's List rows (no ArtifactData tool in this run). Serve from `npm --prefix app run build && npm --prefix app run preview -- --host`:
- iPhone, Olive Oil v1's batch. The Batch head reads BATCH, Hide, a dot and the date in small grey, like Tasting's. Correct and Record another sit just under it. Hide folds the whole batch away, and Show brings it back.
- iPad at 1024 (portrait). One line, with Correct and Record another after the date.
- iPad at 1366 (landscape). The log column, two lines as on the phone.
- Go to batch, on the iPhone and at 1024. It lands on the open batch, and the ring wraps the head.
- VoiceOver reads "Batch, Hide, churned 2 Aug 2026".

## Self-Check: PASSED

- Files found: BatchRow.jsx, notebook.css, the four test files, the probe.
- Commits found: 7901583, 39b7b07, 1a23759, a328282.
- `git status --porcelain app/` is empty. The four commits touch only BatchRow.jsx, notebook.css and their test files. Nothing under `.planning/sketches`, `.planning/canvas-generators`, `.planning/todos`, `.impeccable` or STATE.md was staged.
