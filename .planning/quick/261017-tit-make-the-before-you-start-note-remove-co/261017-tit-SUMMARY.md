---
phase: quick-261017-tit
plan: 01
quick_id: 261017-tit
subsystem: ui
tags: [d31, sketch-010, text-control, before-you-start]
status: complete
requirements: [D31]
key-files:
  modified:
    - app/src/ui/Authored.jsx
    - app/src/ui/Authored.test.jsx
actuals:
  tokens: 600
  tasks: 2
  commits: 1
plan_head_before: 1fef2ea19287b65b288bb316d07c9b8177e431da
plan_head_after: 7196b4d2e02e8604fb623c1bb20eee258de91c5e
---

# Quick 261017-tit: Before you start note remove takes the text-control link look (D31)

One class (`className="text-control"`) on the note's remove `<Button>` gives it the same underlined-word look as the Ingredients row remove. The real app matches the sketch 010 boards exactly in WebKit, so no CSS changed.

## Commits

- `7196b4d` fix(261017-tit): note remove takes the text-control link look (D31): `app/src/ui/Authored.jsx`, `app/src/ui/Authored.test.jsx` only.
- No second commit: the measurement matched the boards, so `app/src/styles/app.css` is unchanged.

## What changed

- `Authored.jsx`: the note remove is `<Button className="text-control" onClick=...>remove</Button>`. It renders `<button type="button" class="text-control" tabindex="0">remove</button>`, the board's markup character for character (confirmed in the WebKit DOM).
- `Authored.test.jsx`: one new test pins `class="text-control"` on both note remove buttons while developing (RED before the edit, GREEN after). Existing tests unchanged.

## Tests

- `npm --prefix app test -- Authored`: 12 tests pass (11 baseline + 1).
- `npm --prefix app test`: 96 files, 3001 tests pass.

## WebKit measurement (CSS px, Olive Oil v1, both notes identical)

Built app served from `$TMPDIR/sprinkles-261017-tit/dist` (preview on port 4199, stopped afterwards). Script `$TMPDIR/sprinkles-261017-tit/measure.mjs` exited 0 (PASS); raw numbers in `measure.json` next to it.

| Source | Pointer | Width | Height | Top | Left | Gap | Right inset | Field width | Min-height | Font | Underline | Border |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| app 1280 | fine | 44.69 | 24 | 0 | 534.2 | 6 | 0 | 578.89 | 24px | 13px | underline | 0px |
| board .p4d1 | fine | 44.69 | 24 | 0 | 534.2 | 6 | 0 | 578.89 | 24px | 13px | underline | 0px |
| app 393 | coarse | 44.69 | 44 | 0 | 288.31 | 6 | 0 | 333 | 44px | 13px | underline | 0px |
| board .p4d2 | forced coarse | 44.69 | 44 | 0 | 288.31 | 6 | 0 | 333 | 44px | 13px | underline | 0px |
| app 1366 | coarse | 44.69 | 44 | 0 | 463.31 | 6 | 0 | 508 | 44px | 13px | underline | 0px |

Also measured for the record: `screen-draft-kept-words.html` `.p4w1a`/`.p4w1b` equal `.p4d1`; `.p4w3a`/`.p4w3b` equal `.p4d2`. The app's 1280 context reported `pointer: coarse` false; the 393 and 1366 contexts (hasTouch) reported true.

## Verdict

PASS. Differences from the boards are 0 px on height, width, top offset, gap and right inset at both widths; field width also matches (578.89 and 333). The README expectation (24 px tall fine, 44 px tall and about 45 px wide coarse) holds on the boards and in the app. No CSS before/after values because no CSS was edited.

## Deviations from Plan

- `curl http://127.0.0.1:4199/` returned 000 because `vite preview` listens on `localhost` only (IPv6); the check and the measurement used `http://localhost:4199`. No effect on results.
- The commit went onto `main` directly, as the orchestrator instructed (sequential mode, main checkout).

## Housekeeping

- No Vite process was running at the start; the preview I started was stopped and `pgrep -fl vite` lists nothing.
- `app/dist` untouched (builds went to `$TMPDIR`); `git status --porcelain -- app/` is clean; `figures.js` identical to 1fef2ea.
- Stubs: none. Threat flags: none.

## Self-Check: PASSED

- `app/src/ui/Authored.jsx`, `app/src/ui/Authored.test.jsx` exist; commit `7196b4d` is an ancestor of HEAD and holds exactly those two files.
