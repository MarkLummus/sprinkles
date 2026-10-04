---
phase: quick-261004-igr
plan: 01
quick_id: 261004-igr
subsystem: recipe-route UI (notebook band and log, Next version pen)
tags: [sketch-011, decision-34, decision-35, brief-task-9, brief-task-10, css, headnote]
requires: [sketch 011 decisions 34 A and 35 A (Mark, 2026-10-04)]
provides:
  - "from 724 up, fold rows, Go to batch and the batch head read from the left with a dot (32px from the control word)"
  - "the Next version pen shows the Sheet title once, as one heading-faced textarea under its caption"
affects: [app/src/styles/notebook.css, app/src/ui/Headnote.jsx, app/src/styles/app.css, app/src/styles/tokens.css]
tech-stack:
  added: []
  patterns: ["dot separator as CSS ::before so accessible names are untouched", "textarea with field-sizing: content as a growing one-paragraph title"]
key-files:
  created:
    - .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-probe.mjs
    - .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-labels-baseline.json
    - .planning/quick/261004-igr-sketch-011-brief-tasks-9-and-10-readme-m/261004-igr-title-baseline.json
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/ui/Headnote.jsx
    - app/src/ui/Headnote.test.jsx
    - app/src/styles/app.css
    - app/src/styles/tokens.css
    - app/src/styles/cross-cutting.test.js
key-decisions:
  - "Below 724 nothing changes (the orchestrator's reading of Mark's answer 4); no board draws option A at 393 or 723."
  - "The pen's title field is a prose-field textarea, not an input, so it wraps instead of clipping."
requirements-completed: [REC1-02, BATCH2-02, UX1-01]
metrics:
  tasks: 3
  files: 7
status: complete
actuals:
  tokens: 12100
  tasks: 3
  commits: 4
plan_head_before: 361e127f314660b0758c41e8df45bb56d6030a74
plan_head_after: 490adfc4d590fc7b414e3ef654e4d537702025f2
---

# Phase quick-261004-igr Plan 01: Sketch 011 brief tasks 9 and 10 Summary

From 724 up the small info labels read from the left (label, control word, a dot, then the count, 32px from the control word), and in the Next version pen the Sheet title is one unboxed heading-faced field under its caption instead of an h1 plus a field plus a struck line.

Every reading below comes from Playwright WebKit and system Chrome against `app/dist`, not from Mark's devices. Nothing here is device-verified.

`commits: 4` counts this plan's four commits (efbf88f, 94ec0ab, b417cc5, 490adfc). `git rev-list 361e127..HEAD` reads 6 because the orchestrator's two docs commits (f4d7455, 975160e) landed on main during the run; they are not part of this plan.

## What was built

**Task 9, decision 34 A (notebook.css).** One `@media (min-width: 724px)` block after the 723.98px block and before the coarse block, four rules copied from row A of `info-labels-bands.html` and `info-labels-log.html`:
- `.notebook .fold-row` justify-content flex-start
- `.notebook .fold-row__count::before, .notebook .notebook-jump__status::before` content `"\00b7"`, margin-right `var(--app-notebook-recipe-rail-gap)`
- `.notebook-jump` justify-content flex-start (the row stays hidden from 724 until brief task 3)
- `.notebook-log .batch-row__head` justify-content flex-start, gap `var(--gap-l)`

FoldRow.jsx and GoToBatch.jsx are untouched, so the accessible names are unchanged.

**Task 10, decision 35 A (Headnote.jsx, app.css, tokens.css).** The pen renders no h1. The Sheet title is `<textarea class="prose-field" rows="1" aria-label="Sheet title">` under the kept "Sheet title" caption. Enter is blocked with `preventDefault` and CR/LF runs in onChange become one space. The rule `.headnote__sheet-title-field .prose-field` replaces the `.ink-field` rule (heading face, 2rem, bold, `line-height: var(--sheet-leading-title)`, resize none, overflow hidden), and the label's margin-top is gone. New token `--sheet-leading-title: 1.15`. The reading view and print keep the h1 (reading markup is byte-identical).

## RED then GREEN

| Task | RED commit | Failing before | GREEN commit |
|------|------------|----------------|--------------|
| 9 | efbf88f | exactly 5 (media steps now five, fold row, count dot, jump, batch head); every other notebook test passed | 94ec0ab |
| 10 | b417cc5 | exactly 7 (pen has no h1/input, textarea markup, Enter/paste guard, disabled count, three CSS/token tests); reading and description guards passed | 490adfc |

Re-grep `grep -rn "Sheet title\|<h1\|sheet-title-field" app/src --include='*.test.*'`: no other test pinned the pen's h1/input pair (RecipeBand.test.jsx pins the band's h1, RecipePage.test.jsx line 233 is a dirty-check). Headnote.test.jsx's two old cases (the `<input>` regex and the `<input ... disabled>` case) were rewritten as Test B and Test C.

## Labels (decision 34 A): before to after, gap from control word to count

Cells are engine, width, route. WebKit is coarse up to 1366 and fine above; Chrome is fine. `v`/`h` is the head's wrapped vertical gap or one-line horizontal gap, then its height. "Log shift" is exact: every element under a head moved by the head's own height change, and every band element's y equals the baseline. Overflow is 0 before and after in every cell.

| Cell | Fold gap before -> after | Head before -> after | Board row A (same engine and pointer) |
|------|--------------------------|----------------------|----------------------------------------|
| webkit 393 mex3 / olive1 / olive1-two | History 187, Tasting 128, Batches 187 -> same | v16/78.22 (93.22 two batches) -> same | not drawn |
| webkit 723 mex3 / olive1 | History 517, Tasting 458 -> same | h293 and h308 /44 -> same | not drawn |
| webkit 744 | History 514 -> 32, Tasting 439 -> 32 | h289/44 -> h32/44 | History 31.56, Tasting 31.57, head 32.01 / 44 |
| webkit 1024 | History 570 -> 32, Tasting 495 -> 32, Batches 554 -> 32 | h345/44 -> h32/44 (59 two batches, same) | History 31.56, Tasting 31.57, head 32.01 / 44 |
| webkit 1366 | History 917 -> 32, Tasting 130 -> 32 | v16/78.22 -> v32/94.22 | History 31.56, Tasting 31.57, head 32 / 94.22 |
| webkit 1600, 1920 | History 1151, 1321 -> 32, Tasting 130 -> 32 | v16/58.22 -> v32/74.22 | History 31.56 |
| chrome 393 / 723 | unchanged (History 192 / 522, Tasting 135 / 465) | unchanged | not drawn |
| chrome 744 to 1920 | History 518 to 1326 -> 31, Tasting 446 / 502 / 138 -> 31 | one line h32/24 (744, 1024); wrapped v16/58.19 -> v32/74.19 (1366 and up) | History 31.34, Tasting 31.34, head 32 |

Notes on the table:
- The gap reads 31.56 (WebKit) or 31.34 (Chrome) in both app and board: the same Range-based measure as Sid's, which rounds to the plan's 32. App and board agree to the hundredth.
- Each fold row stays one button, 44 or more tall, with the same x and width as before (probe check, every wide cell).
- Go to batch: computes flex-start with the dot (`"·"`, 14px) at 744 and up, and stays `display: none`. Below 724 it reads identically to the baseline.
- Sid's before-readings (info-measure.json, WebKit) match the probe baselines: History 514 / 794 / 1141 / 1151 / 1321, Tasting 439 / 719 / 130. His batch-head readings (289 at 744, 569 at 1024) are from his board panels' own crops; the app's olive1 head baseline is 289 at 744 and 345 at 1024, so only 744 agrees and the 1024 difference is a panel-crop difference, not a change in the app.

**Chrome head height.** The boards draw the head's Correct and Record another at 44 at every pointer (their CSS forces the touch floor); the app's are 24 under a mouse. The probe compares the head's height outright where the buttons agree (WebKit coarse: 44 and 44, 94.22 and 94.22) and otherwise the change option A makes on each side (0 and 0 at 744 and 1024, +16 and +16 at 1366 and up). Rule 1: no CSS changed for this; the board's own CSS explains the absolute difference.

## Title (decision 35 A): headnote height before -> after, and the board

Headnote height in px, baseline -> built. "Board" is row A of sheet-title-pen.html in the same engine and pointer.

| Cell | same | short | long | Field height / lines (same, short, long) | scrollHeight - clientHeight | Board (same, short, long) |
|------|------|-------|------|------------------------------------------|-----------------------------|----------------------------|
| webkit 393 | 315.27 -> 254.08 (-61.19) | 336.27 -> 308.67 | 336.27 -> 382.27 | 44/1, 77.59/2, 151.19/4 | 0 | 254.08, 308.67, 382.27 (4 lines) |
| webkit 1366 | 273.08 -> 211.89 (-61.19) | 294.08 -> 232.89 | 294.08 -> 266.48 | 44/1, 44/1, 77.59/2 | 0 | 211.89, 232.89, no panel |
| webkit 1600 | 273.08 -> 215.89 (-57.19) | 294.08 -> 236.89 | 294.08 -> 266.48 | 48/1, 48/1, 77.59/2 | 0 | 211.89, 232.89, no panel |
| chrome 393 | 314.94 -> 257.75 (-57.19) | 335.94 -> 308.34 | 335.94 -> 381.94 | 48/1, 77.59/2, 151.19/4 | 0 | 253.75, 308.34, 381.94 (4 lines) |
| chrome 1366 | 272.75 -> 215.56 | 293.75 -> 236.56 | 293.75 -> 266.16 | 48/1, 48/1, 77.59/2 | 0 | 211.56, 232.56, no panel |
| chrome 1600 | 272.75 -> 215.56 | 293.75 -> 236.56 | 293.75 -> 266.16 | 48/1, 48/1, 77.59/2 | 0 | 211.56, 232.56, no panel |

- Where the field heights agree (every WebKit coarse cell, and the two-and-four-line Chrome cells) the headnote is within 0.01px of the board. Unchanged, the pen is 61.19px shorter in WebKit coarse, as the plan expected.
- The long title wraps and is never clipped in any cell (scrollHeight - clientHeight is 0). The old input had overflowed (baseline precondition: scrollWidth > clientWidth, all 6 cells).
- Per cell, the pen has 0 h1, a TEXTAREA with class prose-field, 32px bold, 0px borders, the description's blue, the caption above the field, the old title struck beneath exactly when the draft differs. Enter adds no line (value and height unchanged), a pasted newline reads "Line one Line two", the reading h1 rect equals the baseline's before the pen opens and after Cancel, and print shows the h1 (display block, 36px).

**Fine-pointer difference (the board's own CSS explains it).** Under a mouse (WebKit 1600, all of Chrome) a single-line title field is 48 tall and the headnote is 4px taller than the board's 44 and 211.x. The board draws the 44px touch floor at every pointer; in the app `.prose-field`'s existing min-height is `calc(var(--sheet-leading-note) * 1em)`, which is 48 at 32px, and `--touch-min` only applies under a coarse pointer. The probe confirms everything but the field matches within 1px (headnote minus field height). I did not change the CSS. This only shows on a desktop mouse, never on Mark's iPad or iPhone. See item 5 below.

## Verification

- `npm --prefix app test`: 59 files, 1597 tests, all passing (1588 + 9 new: 4 for the labels block, 5 for the title; none removed; Headnote.test.jsx's two old cases were rewritten in place).
- `npm --prefix app run build`: succeeds.
- `node 261004-igr-probe.mjs labels,labels-board,title,title-board`: exit 0, 1371 checks passed, in WebKit and system Chrome.
- Scope: under `app/`, the 261004-igr commits touch only the seven planned files; `git status --porcelain app/` is clean; no commit touches `.planning/sketches` or `.planning/canvas-generators`. The uncommitted README.md in `.planning/sketches/011-recipe-route-c/` and the `.impeccable/` critiques were left alone.
- The probe binds only ephemeral 127.0.0.1 ports (through the 03.5 harness), starts no Vite process, and never requests :4173, :5173 or :8011. Rebuilding `app/dist` already updates what Mark's :4173 preview serves; I did not touch it.

## Deviations from Plan

None needing a rule. Two probe-level adaptations, both recorded above: the head-height and title-height comparisons against the boards compare outright only where the board and app controls agree, otherwise the change option A makes (head) or the headnote minus the field (title), because the boards force touch-size controls at every pointer. No CSS or markup was changed for either.

## Known Stubs

None.

## Threat Flags

None. The title textarea renders as text (no dangerouslySetInnerHTML); the only input handling added is the CR/LF-to-space replacement (T-igr-01), pinned by Test D.

## For Mark's List

The orchestrator writes these rows; I did not.

1. **Device check (deferred), both changes.** On the iPad at 1366 and 1024: History and Tasting read label, Show or Hide, dot, count or date from the left, and the batch head runs the date then Correct and Record another; each row is still one tap. On the iPhone at 393 nothing changed. In Next version, the Sheet title is one field under its "Sheet title" caption: tap it, type a long title (it wraps), press return (no new line), Cancel (the heading returns). `field-sizing: content` in Mobile Safari is unverified; the textarea is the only thing that makes the long title grow, and Playwright WebKit is not Mobile Safari.
2. **Decision 34 at the phone.** Mark's answer (4) reads "Every width, not only from 724". This run left below 724 unchanged on the orchestrator's reading, and no board draws option A at 393 or 723. If Mark meant the phone too, the sketch needs a 393 and 723 drawing first (sketch-first rule).
3. **Observation: the head grows 16px at 1366 and up.** Row A's `gap` puts the 350px log column's wrapped actions 32px under the date, not 16, so the head is 16px taller there (78.22 -> 94.22 in WebKit coarse; the app and the board agree). The decision 34 entry says heights do not change.
4. **Go to batch's dot from 724 is in the CSS but not yet visible**, until brief task 3 shows the row from 724 up.
5. **Fine-pointer pen title is 4px taller than the board.** With a mouse the single-line title field is 48 tall (the existing 1.5em floor at 32px) where the board draws 44, because the board forces the touch floor everywhere. Decide whether the desktop mouse should match the board (a title-specific min-height) or keep the existing prose-field floor. Nothing on the iPad or iPhone differs.

## Self-Check: PASSED

- All seven app files and the three probe artifacts exist.
- Commits efbf88f, 94ec0ab, b417cc5 and 490adfc exist on main.
