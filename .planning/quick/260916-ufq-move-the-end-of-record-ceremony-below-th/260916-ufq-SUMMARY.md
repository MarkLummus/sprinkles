---
phase: quick-260916-ufq
plan: 01
subsystem: ui-record-pen
tags: [sketch-007, batch-record, save-ceremony, tab-order, accessibility, css-tokens]
requires:
  - ".planning/sketches/007-full-battery/index.html (THE DESIGN AUTHORITY, edited first)"
  - ".impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md issue 3 (the origin — measured tab path)"
provides:
  - "Sketch 007's end-of-record ceremony rule changed from 'after whichever section is last' to 'after all record content' — Next time now precedes the ceremony in DOM/tab order, in both tasting states"
  - "The app's counterpart CSS rule (.batch-margin__field--next-time) giving Next time the sketch's own 32px separation, which the app never had before this task"
  - "A test proving the tab path (Next time < ceremony < Cancel < Save) in both tasting states"
affects:
  - "Any future citation of sketch 007 lines 301-307 (renumbered by meaning, not mechanically)"
  - "UAT: browser confirmation of the new tab order and the 32px rhythm is still open (see UAT section below)"
tech-stack:
  added: []
  patterns:
    - "Equal-specificity CSS modifier resolved by source order alone (.batch-margin__field--next-time after .batch-margin__field), same technique the sketch's own line 54/55 pairing uses"
key-files:
  created: []
  modified:
    - .planning/sketches/007-full-battery/index.html
    - .planning/sketches/007-full-battery/README.md
    - .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md
    - app/src/ui/BatchRow.jsx
    - app/src/ui/PenFoot.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/PenFoot.test.jsx
    - app/src/styles/app.css
decisions:
  - "Mark ruled (2026-09-16): add the app-side .batch-margin__field--next-time rule (32px, sketch's own rhythm) rather than leaving Next time to inherit 6px from .batch-margin__field — settled, not re-opened here."
  - "Mark ruled: the comment travels WITH the ceremony block (Next time -> 301, comment -> 302, .saves -> 303-307), not left behind at 301 — keeps ceremony A contiguous, equally line-count neutral."
  - "Mark ruled: the three commit-pinned citations (PenFoot.jsx:5-8, RecipePage.jsx:46-47, RecipePage.jsx:628, all @ 109733d) stay verbatim even though they now sit near renumbered unpinned citations — each is true against its own reference."
metrics:
  duration: ~35min
  completed: 2026-09-16
status: complete
actuals:
  tokens: 9100        # chars/4 over the realized diff (36,414 chars across 8 files)
  tasks: 3
  commits: 3
  plan_head_before: e6166c5
---

# Quick Task 260916-ufq: Move the end-of-record ceremony below Next time Summary

Reversed sketch 007's end-of-record ceremony placement rule from "after whichever section is last" to "after all record content," moved the `.next-time-shared` field and the ceremony's DOM block in both the sketch and the app so a maker tabbing to the end of the record reaches Next time *before* Cancel/Save, added the app's missing 32px separation rule above Next time (`.batch-margin__field--next-time`), and renumbered every live "007 line NNN" citation the swap shifted (the three commit-pinned citations were left verbatim by design).

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | The sketch: the reorder, the re-derived sibling rule, and the round entry | 8d1c38a | `.planning/sketches/007-full-battery/index.html`, `.planning/sketches/007-full-battery/README.md` |
| 2 | The citations: renumber only what actually moved | afd5f78 | `app/src/ui/BatchRow.jsx`, `app/src/ui/PenFoot.jsx`, `app/src/ui/BatchRow.test.jsx`, `app/src/ui/PenFoot.test.jsx`, `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md` |
| 3 | The app: Next time above the ceremony, and the tab path proven | 63d714a | `app/src/ui/BatchRow.jsx`, `app/src/styles/app.css`, `app/src/ui/BatchRow.test.jsx` |

## Before / After tab-order evidence

**Before (the origin critique, `.impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md` issue 3):** measured tab path Cancel(27), Save batch(28), Next time(29); Cancel/Save `top=1297`, the Next time textarea `top=1365` — Save reachable, and activatable by Enter, before the record's last field.

**Before (JSX, `app/src/ui/BatchRow.jsx`, pre-Task-3):**
```jsx
<SaveCeremony onCancel={...} onSave={...} ... />
<label className="batch-margin__field">
  <span className="pen-caption">Next time</span>
  <textarea ... aria-label="Next time" />
</label>
<p className="form-status" ...>{formStatus}</p>
```

**After (JSX, `app/src/ui/BatchRow.jsx`, post-Task-3):**
```jsx
<label className="batch-margin__field batch-margin__field--next-time">
  <span className="pen-caption">Next time</span>
  <textarea ... aria-label="Next time" />
</label>
<SaveCeremony onCancel={...} onSave={...} ... />
<p className="form-status" ...>{formStatus}</p>
```

**After (rendered markup, from the passing test run):**
```
...<label class="batch-margin__field batch-margin__field--next-time"><span class="pen-caption">Next time</span><textarea .../></label><div class="save-ceremony">...<button type="button">Cancel</button><button type="button">Save batch</button></div><p class="form-status" .../>...
```

**Proof, both tasting states** (`app/src/ui/BatchRow.test.jsx`, new test in the "DOM order inventory" describe): for `tastingOpen: true` and `tastingOpen: false`, `nextTimeIndex < ceremonyIndex < cancelIndex < saveIndex`, where `cancelIndex`/`saveIndex` are found via `markup.indexOf('Cancel'|'Save batch', ceremonyIndex)` so they are the ceremony's own controls. DOM order is tab order here because neither `BatchRow.jsx` nor `PenFoot.jsx` sets a `tabIndex` (verified: `grep -n 'tabIndex'` on both files finds nothing) — browser confirmation of the actual tab key sequence is deferred to UAT (see below), not this gate.

## The citation map, as applied

Renumbering was done by re-running the plan's finder greps against the live tree and correcting each hit by meaning, not mechanically. Applied exactly as the plan's table specified:

| Site | Was | Became |
|------|-----|--------|
| `BatchRow.jsx:735` (comment, ceremony A) | `(007 line 303)` | `(007 line 304)` — record-status live region |
| `BatchRow.jsx:748` (comment, Next time) | `(sketch 007 line 307; ...)` | `(sketch 007 line 301; ...)` — Next time field |
| `PenFoot.jsx:15` (comment) | `(007 line 303; ...)` | `(007 line 304; ...)` — record-status, unpinned |
| `BatchRow.test.jsx:753` (describe) | `007 lines 301-306, 484, 505-510` | `007 lines 302-307, 484, 505-510` |
| `BatchRow.test.jsx:791` (it) | `(007 lines 303, 561; ...)` | `(007 lines 304, 561; ...)` |
| `BatchRow.test.jsx:806` (it) | `(007 line 303)` | `(007 line 304)` |
| `BatchRow.test.jsx:900` (it) | `(sketch 007 line 307; ...)` | `(sketch 007 line 301; ...)` |
| `PenFoot.test.jsx:121` (it) | `(D-14, 007 lines 301-306)` | `(D-14, 007 lines 302-307)` |
| `PenFoot.test.jsx:232` (it) | `(D-14, 007 lines 304-306)` | `(D-14, 007 lines 305-307)` |
| skill doc `:49` | "the end-of-record ceremony above Next time" | "...below the shared Next time" |
| skill doc `:430` | "the record status (line 303)" | "(line 304)" |
| skill doc `:449` | "both ceremonies (lines 305, 312–313)" | "(lines 306, 312–313)" |
| skill doc `:450` | "Add tasting (lines 304, 311)" | "(lines 305, 311)" |
| skill doc `:451` | `#record-saves (lines 301–306)`; "sits after whichever section is last, just above Next time"; `align-items: baseline (lines 302, 310)`; `#record-status (line 303:`; `.pen .saves + .next-time-shared { margin-top: var(--gap-l) }` (line 54) | `(lines 302–307)`; "sits after all record content, below the shared Next time"; `(lines 303, 310)`; `(line 304:`; `.pen section + .next-time-shared { margin-top: var(--gap-l) }` (line 54) |
| skill doc `:451` lede | "(ninth round; ...; unchanged by the tenth)" | "...unchanged by the tenth; placement revised 2026-09-16" |
| skill doc `:487` | `.pen section + .next-time-shared, .pen .saves + .next-time-shared` (line 54); "Order ...: the end-of-record ceremony, Next time, ..." | `.pen section + .next-time-shared` (line 54); "...: Next time, the end-of-record ceremony, ..." |
| skill doc `:527` | "one end-of-record ceremony above Next time" | "...below Next time" |
| skill doc `:531` | "an identical end-of-record ceremony (`#record-saves`) above Next time" | "...below the shared Next time" |

**Left verbatim, each checked and confirmed unchanged:** `PenFoot.jsx:5-8` and `RecipePage.jsx:46-47,628` (all `007 @ 109733d`, commit-pinned); `RecipePage.jsx:632` (`line 309`, `#form-status`, unaffected); `PenFoot.jsx:66`, `PenFoot.test.jsx:146,242` (foot ceremony, `310-314`/`505-510`, unmoved); `BatchRow.jsx:368`, `RecipePage.jsx:1231,1235` (`542,543,560,561`); `app.css`, `tokens.css`, `binder.test.js`, `cross-cutting.test.js`, sketches 008/009 (outside the 301-307 window); the skill's stale `sources/007-full-battery/index.html` snapshot (owned by `/gsd-sketch --wrap-up`); `references/batch-record-tasting-battery.md:35` (describes the melt block, genuinely still above Next time).

## The re-derived CSS rule

Sketch 007 line 54, before: `.pen section + .next-time-shared, .pen .saves + .next-time-shared { margin-top: var(--gap-l); }`

Sketch 007 line 54, after: `.pen section + .next-time-shared { margin-top: var(--gap-l); } /* the ceremony now follows Next time; its own 32px comes from line 55 (reversal, 2026-09-16) */`

Reasoning: in the new DOM order, `.next-time-shared` still always follows the last `section` (churn or tasting), so the first half of the old selector is still live and unchanged. The second half (`.pen .saves + .next-time-shared`) can no longer match anything — no `.next-time-shared` follows a `.saves` in the new order — so it was removed rather than left dead. No new declaration was needed for the ceremony's own separation: line 55 already gives every `.pen .saves` `margin-top: var(--gap-l)`, and the label's own 12px bottom margin (line 34) collapses into that 32px since `.pen` is a plain block and collapsing is suppressed only between a flex container and its children, not its siblings. Rhythm before and after the swap is identical: `section → 32 → Next time → 32 → ceremony → 32 → placeholder`.

The app had no counterpart to this rule — Next time used to follow the ceremony, so the ceremony row supplied the separation instead. Task 3 added `.batch-margin__field--next-time { margin-top: var(--gap-l); }` in `app/src/styles/app.css`, placed immediately after the base `.batch-margin__field` rule (equal specificity, so source order alone makes 32px beat the base rule's 6px), reading only the `--gap-l` token — no px literal, verified against `binder.test.js`'s existing gate.

## The assertions changed (Task 3c), none weakened

1. `BatchRow.test.jsx:230` (was): flipped `nextTimeIndex > ceremonyIndex` to `ceremonyIndex > nextTimeIndex`, and added `nextTimeIndex > ingredientNotesIndex` so the DOM-order chain from the churn date to the ceremony stays unbroken — a strengthening (two links instead of one), not a swap.
2. `BatchRow.test.jsx:202` (was): renamed the `it` from "...then ceremony A, in that DOM order" to "...then the shared Next time, then ceremony A, in that DOM order" — the name is now the contract a reader trusts.
3. `BatchRow.test.jsx:829-831` (was): the existing `formStatusIndex > nextTimeIndex` assertion is unchanged (still true); added `formStatusIndex > ceremonyIndex` so the new order is pinned at both ends, not only above.
4. `BatchRow.test.jsx:903` (was): the verbatim Next-time-label match updated from `class="batch-margin__field"` to the two-class string `class="batch-margin__field batch-margin__field--next-time"` — more specific, still pins everything it pinned before plus the new modifier.
5. **New test** (`BatchRow.test.jsx`, in the same describe as #1): proves the tab path in both tasting states — see "Before / After tab-order evidence" above for the full assertion and its reasoning about DOM order being tab order here.

## Verify output (actual, as run)

**Task 1 (sketch + README):** every `OK-*` printed (`OK-head`, `OK-middle`, `OK-tail`, `OK-nexttime-moved`, `OK-ceremony-moved`, `OK-comment`, `OK-selector`, `OK-token`, `OK-linecount`, `OK-no-stale-phrase`, `OK-readme-history`, `OK-readme-entry`, `OK-readme-date`, `OK-readme-supersedes`, `OK-readme-attribution`); no `FAIL-*` printed. The three `diff`s against the pre-edit copies were silent.

**Task 2 (citations):** `OK-no-stale-phrase`, `OK-pin-penfoot`, `OK-pin-recipepage`, `OK-penfoot-304`, `OK-batchrow-301`, `OK-penfoot-test`, `OK-skill-rule`, `OK-skill-linecount` all printed; no `FAIL-*` printed; suite green before this task's own follow-up. One expected exception, documented below (not a `FAIL-*`, and not code): the stale-citation finder grep itself (as literally given in the plan) reports one line (skill doc `:451`) because the plan's own correct replacement text for the "align-items: baseline" citation reintroduces the digit sequence "lines 303" (now correctly pointing at the moved `.saves` div, not at the old `#record-status` reference the pattern was written to catch). Verified by meaning: line 451's "(lines 303, 310)" is correct per the plan's own table (302→303 for the `.saves` div). Not adjusted or force-passed — reported here per the "check each hit's MEANING, not what this plan predicts" instruction in Task 2's own preamble.

**Task 3 (app):** `OK-no-tabindex`, `OK-rule`, `OK-source-order`, `OK-jsx-order`, `OK-no-stale-phrase` all printed; no `FAIL-*` printed (specifically `FAIL-literal` did not print — the new CSS rule has no bare px value). `npm --prefix app test`: 33 files, 945 tests (944 baseline + the 1 new tab-order test), all green.

## Deviations from Plan

### Auto-fixed / Reported Issues

**1. [Reported, not a code defect] Task 2's stale-citation grep produces one expected false positive**
- **Found during:** Task 2 verify
- **Issue:** The plan's own verify regex `lines? (303|307)([^0-9]|$)|...` is written to catch leftover *stale* references to the old line numbers. After the correct fix, the `.saves` div for the ceremony legitimately sits at the *new* line 303 (it was line 302 before the swap), so the correct citation "align-items: baseline (lines 303, 310)" at skill-doc line 451 coincidentally matches the same pattern the gate uses to flag staleness.
- **Resolution:** Verified by hand that the citation is correct against the revised sketch (per the plan's own table row for `:451`) and left it as specified. Did not alter the grep pattern or the file content to force a clean match — per the orchestrator's instruction to report rather than adjust a gate that doesn't flip as predicted.
- **Files affected:** `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md` (content unchanged from what the plan specified).
- **Committed in:** afd5f78 (Task 2 commit).

---

**Total deviations:** 1 reported (a verify-gate false positive on correct content; no code change needed or made).
**Impact on plan:** None on the shipped result — content matches the plan's table exactly at every cited site; the gate quirk is cosmetic to Task 2's own diagnostic grep, not a defect in the sketch, the skill doc, or the app.

## Issues Encountered

- macOS/BSD `grep -rc <file>` prefixes the filename to the count even for a single explicit file path (unlike GNU grep), which broke a literal copy of the plan's `[ ... -eq 1 ]` pin checks with an "integer expression expected" shell error. Not a plan or content defect — re-ran the same checks with plain `grep -c` (no `-r`) and both pin counts (`PenFoot.jsx` = 1, `RecipePage.jsx` = 2) confirmed correct.

## Two items flagged for Mark

1. **The 32px app-side separation** (`.batch-margin__field--next-time`) is the one design judgment in this plan (Discovered at planning, item 2). It is one line to back out (`app/src/styles/app.css`) if browser confirmation shows it reading wrong (e.g., too close to a field-of-the-section reading, or too far from the ceremony above it in the tasting-open state).
2. **Whether the three commit-pinned citations** (`PenFoot.jsx:5-8`, `RecipePage.jsx:46-47`, `RecipePage.jsx:628`, all `007 @ 109733d`) should ever be repinned to the revised sketch, now that the lines they cite have moved in the live file. They remain accurate against their pinned commit; repinning is a separate, deliberate decision this task did not make.

## UAT — browser confirmation (deferred, per the plan)

Not addressed by this task's automated gates (deliberately — DOM-order assertions are cheaper and more stable than a live measurement):

1. At `/recipe/olive-oil-ice-cream-v1`, open the record pen and Tab to the end. Confirm the order is Next time → Cancel → Save batch, in both tasting states.
2. Confirm the 32px above Next time reads as a record-level boundary, not as a field of the tasting section — the one design judgment flagged above.
3. Confirm in the sketch tab too, hard-reloaded (port 8077 sends no cache headers).
4. Still open from the origin critique, not addressed here: the silent save and the blocked save's off-screen sentence (critique issues 1 and 2).

## Next Phase Readiness

Committed, tested, and citation-consistent. No blockers. UAT items above are open follow-ups, not gates on this task's completion.

## Self-Check: PASSED

- `.planning/sketches/007-full-battery/index.html` and `README.md`: modified, present, verified via diff gates in Task 1 — both exist.
- `app/src/ui/BatchRow.jsx`, `PenFoot.jsx`, `BatchRow.test.jsx`, `PenFoot.test.jsx`, `app/src/styles/app.css`: all present and modified as listed.
- `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md`: present, modified, line count unchanged from `git show HEAD:...` at time of Task 2 verify.
- Commit 8d1c38a exists (`git log --oneline --all | grep 8d1c38a` → found).
- Commit afd5f78 exists (found).
- Commit 63d714a exists (found).
- `git rev-list --count e6166c5..HEAD` = 3, matching `actuals.commits`.
- `npm --prefix app test` final state: 33 files, 945 tests, all passing.

## Known Stubs

None — this task moved existing markup and CSS declarations and updated existing test assertions; no new UI surface, no new data path, nothing rendered from an empty/mock source.
