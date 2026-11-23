---
phase: quick-261123-ghj
plan: 01
subsystem: ui
tags: [react, phone, home, sketch-016, board-gate]
requires:
  - phase: 12
    provides: the held draft sentence (quick 261123-brl), the board engine and the phone band probe
provides:
  - "Below 724 Home's lead and rows say 'Draft: <name>. Finish it in a wider window.' for a kept Next version draft"
  - "Below 724 Home draws no record act on a version holding a kept Next version draft"
  - "Keep developing is left out of Home's lead below 724"
  - "The phase 12 gate holds Home with two kept drafts against the decided panel hd-nokeep"
affects: [phase 12 gate, sketch 016 CONTRACT sections 3, 12 and 13]
status: complete
actuals:
  tokens: 9000
  tasks: 3
  commits: 4  # measured before this summary's own commit, which is the fifth
plan_head_before: 27a9f61f96495dc82782a93ce63c14c8443f393b
plan_head_after: 87da1172380b6786b0d4d9fb93a1cb7aa1826b43
key-files:
  modified:
    - app/src/ui/VersionRow.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/styles/home.css
    - app/src/ui/RecipeList.test.jsx
    - app/src/styles/home.test.js
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs
    - .planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md
    - .planning/sketches/016-entry-points-pen-preview-row-controls/README.md
key-decisions:
  - "heldDraftLine(record, versionCount) is exported from VersionRow.jsx and is the one source of the sentence; RecipeList.jsx spells none of its words"
  - "Mark's answer to decide-p12-home-row-sentence is read as covering every lead below 724, with or without a kept draft"
requirements-completed: [decide-p12-home-row-sentence, PHONE-01]
---

# Quick 261123-ghj: Home below 724 with a Next version draft kept Summary

Below 724, Home names a kept Next version draft in the version page's own words, offers no record act on the version that holds it, and leaves Keep developing out of the lead. From 724 up Home is unchanged. The full suite (137 files, 4608 tests) and `12-check.sh` (GATE2 PASS) pass.

Authority: the snapshot `home-held-draft-393.html`, third panel `hd-nokeep`; sketch 016 CONTRACT sections 12 and 13; README decisions 19 to 22 and 31 to 33; Mark's answer to `decide-p12-home-row-sentence` (2026-11-23).

## What was built, file by file

- `app/src/ui/VersionRow.jsx`: the draft name closure moved to module scope as `draftName(record, versionCount)`; new `export function heldDraftLine(record, versionCount)` returns 'Draft: ' + the name + `DRAFT_LINE_ENDING`. The component's `waitingName` and the held line now read them. VersionRow's rendered words are byte-identical (VersionRow.test.jsx Tests O, P, P2 and R pass untouched).
- `app/src/ui/RecipeList.jsx`: imports `heldDraftLine`. `HomeBody` names the fitting drafts, takes the newest as before, and below 724 builds `heldPlans`, a Map of versionId to plan record (empty from 724 up). It passes `draftLine` and `heldPlans` to `HomeLead` and `heldPlans` to `RecipeRows`. New private `recordActVersionId(entry)`. `HomeLead` prints the sentence as a plain text child when given `draftLine`, otherwise the built "Draft open on this version" line with Go to draft. `RowActions` takes `held`: Record batch and Record tasting return null (the whole span) when held, and Keep developing is not drawn in a lead below 724. `RecipeRows` renders `p.home__row-draft` in place of the actions when the row's record act is held.
- `app/src/styles/home.css`: one top-level `.home__row-draft` rule, the snapshot's five declarations (grid-area actions, margin 0, face grotesk, meta size, app text), tokens only.
- Tests: `RecipeList.test.jsx` (new describe, 10 cases, and the PHONE-01 case changed), `home.test.js` (2 cases).

## Red then green (Task 1)

Suite before this item: 137 files, 4596 tests. After: 137 files, 4608 tests (12 new, none removed).

Red, commit a7f4e452, 10 cases failed: B1, B2, B3, B4, B8, B11, the changed PHONE-01 case (B5), B6 (on Keep developing alone, as the plan expected), and both home.test.js cases. B7, B9 and B10 passed as bounds. Green, commit 802ade2c: all pass.

## The reversal, and every place that held it

Mark's answer leaves Keep developing out of Home's lead below 724. This build reads that as every lead below 724, with or without a kept draft (the panel's caption and Sid's reason both hold at any phone width). Places that held the earlier decision:

| Place | What changed |
|-------|--------------|
| `RecipeList.test.jsx` PHONE-01 case (was line 856-861) | An awaiting lead below 724 now expects ['Record tasting']; the rows' expectations are unchanged. The case name says so. |
| `12-board-places.mjs` Home panel (was line 67) | `.home__lead .home__actions` keeps count and box; its text check moved to `.home__lead .home__action:not(.home__action--secondary)` (count, text). Comment `HOME_LEAD_OLD_BOARD` gives the reason. The span's box still matched the old board within 1 px. |
| `CONTRACT.md` line 30 | Note appended: reversed in part on 2026-11-23, see section 13. |
| `CONTRACT.md` line 150 | Note appended: Mark answered, left out below 724 in every lead. |
| `README.md` line 80 (decision 4) | Note appended: Keep developing reversed below 724, Adapt stays. |
| `README.md` line 158 (decision 20) | Note appended as the plan wrote it: "so this lead holds no action". That holds for the drawn state (record act and Keep developing both out). Where the record act stays (U5) the lead holds Record tasting; the note's words are the plan's, left as written. |

The contract and README changes are in their own commit (87da1172), appended to four existing lines; no line added or removed (2 and 2 lines changed in each file). No HTML snapshot was touched.

## The band probe's rewritten Home check

`12-band-probe.mjs` used to press Home's Record tasting at 393 on Mocha, whose version holds a plan draft. This build does not draw that link, so the check is now: take a drafts dump, load Home at 393, and read the lead and the probe's own Mocha and Vanilla rows (matched by name-link href, because the seed also holds a Mocha). The lead has no actions span and a link-free line "Draft: Version 2 · more cocoa. Finish it in a wider window."; both rows have no actions span and read their own sentence; no `a.home__action` href starts with either address; the drafts dump is identical after load and after 2 s. Header comment updated to match. Nothing else in the probe changed.

## Gate changes, file by file

- `12-board-band.mjs`: `ROUTES` exported; header line names it. Nothing else.
- `12-board-places.mjs`: HOME_ROWS split into HOME_TITLE, HOME_LEAD and the rows; the old `home` panel keeps every check except the narrowed lead-actions one (above); new spec on `home-held-draft-393.html` with panel `hd-nokeep` (steps type Underbelly's draft first, then Mexican Chocolate's, so Mexican Chocolate's is the newest on the real clock; elements: title, lead, `p.home__lead-draft`, the rows' entries, `p.home__row-draft`; absent: the lead's actions and link, and the actions of rows 1, 2, 3, 4 and 8). Header comment updated.
- `12-band-probe.mjs`: the Home check, as above.

## Side by side, 393, hd-nokeep against the built app (scratch build, one engine each)

Elements read: `.home__lead`, `p.home__lead-draft`, all eight `.home__row`, both `p.home__row-draft`, and the three visible `.home__action`, boxes from `.shell__main`'s top-left, plus text and sideways overflow.

| Engine | Elements compared | Largest x/y/width/height difference | Text differences | scrollWidth / innerWidth |
|--------|-------------------|-------------------------------------|------------------|--------------------------|
| Playwright WebKit | 15 | 0.0 px | none | 393 / 393 |
| Chrome (shim) | 15 | 0.0 px | none | 393 / 393 |

Examples (WebKit, board = app): lead 20,134 353x146; lead line 33,233 327x34 (two lines); row 1 sentence 20,444 353x34; row 4 sentence 20,766 353x34; the three Record acts 353x44. Chrome lines are 32 high for two lines and 16 for one, equal on both sides.

Board engine (`12-board-check.mjs` over `12-board-places.mjs` and `12-board-band.mjs`, `--selftest`): WebKit 575 PASS, 0 FAIL; Chrome 575 PASS, 0 FAIL. Panel `places-hd-nokeep`: 99 comparison lines each engine, 0 FAIL, selftest PASS. Panel `places-home`: 99 lines, 0 FAIL. Evidence folders: `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/c53b815f-c9c0-4392-9afe-1d608eb4dfd9/scratchpad/sprinkles-ghj/evidence-webkit` and `.../evidence-chrome`. Read-out scripts and logs are in the same folder (`side-by-side.mjs`, `sbs-webkit.log`, `sbs-chrome.log`).

Other widths in the app, both engines the same: at 723 the lead sentence and both row sentences are one line each, no sideways overflow, the lead has no actions; at 724 and 1366 the lead reads "Draft open on this version · Go to draft", its actions are Record tasting and Keep developing, no `p.home__row-draft` is present, and there is no sideways overflow.

Band probe (`held widen`, WebKit): all PASS, including the rewritten Home check; the drafts dump is identical after load and after 2 s.

## 12-check.sh

Run once in full: suite 137 files and 4608 tests, GATE1 PASS, board 3488 PASS and 0 FAIL, phone, band, tabs and keys steps pass, ends **GATE2 PASS**. No step failed, so there was nothing to rerun.

## Undrawn states (U1 to U8) and what the build does

- U1, a kept record or Correct draft below 724: the lead reads the built "Draft open on this version · Go to draft", the record acts stay, Keep developing is out of the lead (test B6).
- U2, a recipe with an edit kept: no actions and no sentence, as built (B7).
- U3, Adapt on a tasted lead: unchanged, Adapt alone below 724 (B11).
- U4, a lead with no kept draft below 724 (the seed's awaiting lead): Record tasting alone. Drawn nowhere; `notebook-home-more-393.html` still draws Keep developing there.
- U5, a draft on a version other than the one the record act opens: the record act stays in the lead and row, the lead's line reads the sentence, the row gets none (B4).
- U6, a tasted recipe holding a draft: lead reads the sentence and keeps Adapt; row has no actions and no sentence (B11).
- U7, a stale plan draft: not named, actions as built (B10).
- U8, plan drafts on two versions of one recipe: the lead names the newest; each row names the draft on the version its record act opens.

This build addresses 12-REVIEW.md IN-02 (Home's record link that dead-ended on a held draft). The review file itself is not edited.

## Deviations from Plan

None - plan executed as written. Notes on tooling, not on the build:

- The impeccable hook flagged three "font outside DESIGN.md" lines in `home.test.js` (L109, L115, L234). All are test regexes that read the existing `--face-grotesk` token or an existing assertion; false positives, nothing suppressed, left standing.
- The README decision 20 note's last clause ("this lead holds no action") is the plan's wording and is exact only for the drawn state; U5 above is the exception.

## Stub scan

No stubs, placeholders or empty data paths added. Nothing recorded to `.planning/WINDOWS.md`.

## Threat flags

None. Home reads kept drafts and never writes them (band probe: drafts dump identical after load and after 2 s). Names render as React text children (test B8: `<b>x</b>` renders escaped). `heldPlans` is a Map.

Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad or iPhone.

## For the orchestrator

- Close `decide-p12-home-row-sentence`, and `look-p12-home-held-draft` if it is still open (executor has no ArtifactData).
- This build read Mark's answer as covering every lead below 724, with or without a kept draft. If he meant Keep developing out only while a draft is kept, the change is one condition in `RowActions` in `app/src/ui/RecipeList.jsx` (`!(below724 && lead)`).
- U4: the seed's lead at 393 now holds Record tasting alone, drawn nowhere. Decide whether it needs a row for Mark.
- Dist safety: a dist built from this item's commits is safe to deploy; it adds no store write, no stored shape change and no DB_VERSION change.
- Machine note: no Simulator step of my own ran apart from the one inside `12-check.sh`; it passed.

## Self-Check: PASSED

Files and commits verified present: a7f4e452, 802ade2c, 1837ab07, 87da1172 are ancestors of HEAD; `heldDraftLine`, `.home__row-draft` and the gate files exist.
