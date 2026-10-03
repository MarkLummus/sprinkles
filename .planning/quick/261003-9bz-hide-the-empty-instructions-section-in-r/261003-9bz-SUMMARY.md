---
phase: quick-261003-9bz
plan: 01
quick_id: 261003-9bz
subsystem: ui
tags: [react, css-grid, recipe-page, instructions, empty-state]
status: complete
requires: []
provides:
  - "showsMethodRegion({ mode, steps, beforeYouStart }) in Method.jsx, the one rule deciding whether the Instructions section renders"
  - "RecipePage leaves out section.method-region when it would show nothing, and drops the empty grid row via .recipe-page--no-method"
  - "261003-9bz-probe.mjs and a pre-change baseline measuring the built app in WebKit and system Chrome"
affects: [recipe-page, print, show-changes, recording]
actuals:
  tokens: 7080
  tasks: 3
  commits: 4
plan_head_before: cc5b1e1023817b33cafb7245026819926317f3bb
plan_head_after: 9cf4ba4a4c8b9bfab2e4bddf44a48b43ab282124
tech-stack:
  added: []
  patterns:
    - "a grid modifier class that drops an empty explicit row, because an explicit grid row with no item still keeps its gutters"
key-files:
  created:
    - .planning/quick/261003-9bz-hide-the-empty-instructions-section-in-r/261003-9bz-probe.mjs
    - .planning/quick/261003-9bz-hide-the-empty-instructions-section-in-r/261003-9bz-baseline.json
  modified:
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
key-decisions:
  - "The Instructions section renders when mode is developing, or the steps Method receives are non-empty, or there is at least one Before you start note (Mark, 2026-10-03, option 1)"
  - "The guard and Method read the same two consts (methodSteps, methodNotes), so they cannot disagree"
  - "The empty method grid row is closed by a .recipe-page--no-method modifier at the base and inside the existing 983.98px block, not by a new media block"
requirements-completed: [REC1-01]
---

# Phase quick-261003-9bz Plan 01: Hide the empty Instructions section Summary

An Instructions section with no step and no note is now left out of the Sheet in reading, Show changes, recording and print, and the empty grid row it used to leave behind is dropped, so nothing else on the page moves.

## The rule as built

`showsMethodRegion({ mode, steps, beforeYouStart })` returns `mode === 'developing' || steps.length > 0 || beforeYouStart.length > 0`. RecipePage computes `methodSteps` and `methodNotes` once (the exact ternaries that were on the Method props), asks the rule, wraps the `section.method-region` in `{methodRegionShown && (...)}`, and marks the article `recipe-page--no-method` when the section is left out. The Method component's own markup is unchanged.

| State | Steps Method receives | Controls when the method is empty | Decision |
|-------|-----------------------|-----------------------------------|----------|
| reading, with or without a batch in view | `readingVersion.method` (removed steps filtered out) | none: changed lines hang on steps | hide when there is no step and no note |
| Show changes | `version.method` unfiltered, so removed steps still show struck | none | hide when the unfiltered method is empty and there is no note. A version whose only steps are removed keeps the section, struck. |
| recording or amending | `readingVersion.method` | none: the strike and line controls exist only per step | hide when there is no step and no note |
| developing pen | `version.method` | none today (flag 1) | always keep |
| print | the same DOM as the reading view | none | hide (the element is absent) |

Seed versions that now hide the section: Strawberry v2 and v2.1, Coconut v1 and v2, Standard Base v1 and v2, Underbelly v1 and v2, Mocha v0. Strawberry v1 (one step) and Mexican Chocolate v1 to v4 keep it.

## Commits

| Commit | Message |
|--------|---------|
| d46031e | test(261003-9bz): showsMethodRegion decides when Instructions renders (RED) |
| 79a62ce | fix(261003-9bz): hide the empty Instructions section outside the pen (Method.jsx, RecipePage.jsx, probe, baseline) |
| d065099 | test(261003-9bz): pin the no-method grid modifier (RED) |
| 9cf4ba4 | fix(261003-9bz): drop the empty method row so no gutter is left behind (app.css, RecipePage.jsx) |

`commits: 4` is measured: `git rev-list --count cc5b1e1..HEAD` at the last code commit. (No ledger file was written before the first commit; the base is the parent of d46031e, which is cc5b1e1.)

## RED then GREEN evidence

**Task 1.** Tests A to G in `Method.test.jsx` ("showsMethodRegion: the Instructions section renders only when it has something to show"). Before GREEN: 7 failed, 75 passed (`showsMethodRegion is not a function`). After GREEN the whole suite was 58 files, 1568 tests, all passing.

**Task 2.** RED set, four failing: the retitled 983.98px block test (now expects `['.recipe-page', '.recipe-page--no-method']`), the narrow-modifier pin, the base-modifier pin, and the article className pin. Three source pins in `RecipePage.test.jsx` already passed after Task 1 and are regression guards: `showsMethodRegion(` occurs once and is imported from `./Method.jsx`; the `{methodRegionShown && (<section className="method-region"` shape; and `steps={methodSteps}` / `beforeYouStart={methodNotes}`. After GREEN: 4 failed to 0 failed.

## Measured cause for the modifier (Task 1 `gap` run, before the CSS)

Hiding the section alone left one row gap. WebKit, 393, Strawberry v2.1 reading:

```
FAIL webkit 393 s21-reading: article height delta 90.78 vs expected 110.78
FAIL webkit 393 s21-reading: trailing 40 vs 20
FAIL webkit 393 s21-reading: className recipe-page lacks recipe-page--no-method
FAIL webkit 393 s21-reading: gridTemplateAreas still names method: "band" "ingredients" "side" "method" "foot"
```

The article lost 90.78 (the region) instead of 110.78 (region plus the 20px row gap), and the trailing whitespace grew from 20 to 40. Grid rows read `69.33px 568.66px 132px 0px 0px` against the baseline `69.33px 568.66px 132px 90.78px 0px`. After the modifier: delta 110.78 / 110.78, trailing 20 / 20, `gap` 42 checks passed.

## Audit (at HEAD 9cf4ba4)

(a) `grep -rn` for method-region, method-step, Instructions, Before you start and recipe-page under app/src. Every plan-time hit is still there. No hit in code is new apart from this task's own: the RecipePage guard and className, RecipePage.test.jsx and cross-cutting.test.js pins, and the two modifier rules in app.css. Comment-only mentions of `.recipe-page` or "Before you start" that the plan did not list, all pre-existing and untouched: tokens.css (53, 477), shell.css (18), notebook.css (6, 71), binder.test.js (method-step rules), data/mexican-chocolate.js (261), data/olive-oil.js (243). Method.test.jsx markup assertions render Method directly and are unaffected.

(b) `method-step-` appears only in Method.jsx and Method.test.jsx. `scrollIntoView` appears only at VersionRow.jsx:113 (the Record a tasting button), in a comment at RecipeHistory.jsx:40, and in RecipePage.recordTasting.test.jsx as a test stub. No code scrolls to, focuses or links to a step anchor.

(c) No sibling or position selector (`+`, `~`, `:has`, `:first`, `:last`, `:nth`) touches `.method-region` or `.side-region`. The grep returned nothing.

(d) The `@media print` block carries no `.recipe-page`, `.method-region` or `.side-region` rule, so print inherits the modifier. The print cells measure this.

## Matrix (`matrix` group: 2 engines x 4 widths x 12 cases, 4120 checks passed, exit 0)

Readings come from Playwright WebKit and system Chrome, not from Mark's devices. The print cells emulate print media at the screen viewport; they do not paginate.

Hidden cases (the 96 cells split 48 hidden, 48 kept). Heights in px; trailing is the whitespace below the Sheet's last child.

| engine | width | case | article height before to after | expected / actual delta | trailing before to after | doc height before to after |
|---|---|---|---|---|---|---|
| webkit | 393 | s21-reading | 980.77 to 869.98 | 110.78 / 110.78 | 20 to 20 | 2089 to 1978 |
| webkit | 393 | s21-show-changes | 1142.77 to 1031.98 | 110.78 / 110.78 | 20 to 20 | 2251 to 2140 |
| webkit | 393 | s21-recording | 1516.09 to 1405.31 | 110.78 / 110.78 | 0 to 0 | 2862 to 2751 |
| webkit | 393 | s21-print | 956.25 to 845.47 | 110.78 / 110.78 | 20 to 20 | 2064 to 1953 |
| webkit | 393 | c2-reading | 902.44 to 791.66 | 110.78 / 110.78 | 20 to 20 | 2021 to 1911 |
| webkit | 393 | c2-show-changes | 1100.44 to 989.66 | 110.78 / 110.78 | 20 to 20 | 2219 to 2109 |
| webkit | 723 | s21-reading | 944.78 to 834 | 110.78 / 110.78 | 20 to 20 | 1971 to 1861 |
| webkit | 723 | s21-show-changes | 1106.78 to 996 | 110.78 / 110.78 | 20 to 20 | 2133 to 2023 |
| webkit | 723 | s21-recording | 1294.42 to 1183.64 | 110.78 / 110.78 | 0 to 0 | 2364 to 2253 |
| webkit | 723 | s21-print | 940.27 to 829.48 | 110.78 / 110.78 | 20 to 20 | 1967 to 1856 |
| webkit | 723 | c2-reading | 866.78 to 756 | 110.78 / 110.78 | 20 to 20 | 1877 to 1766 |
| webkit | 723 | c2-show-changes | 1064.78 to 954 | 110.78 / 110.78 | 20 to 20 | 2075 to 1964 |
| webkit | 1366 | s21-reading | 1746.3 to 1746.3 | 0 / 0 | 32 to 32 | 2351 to 2351 |
| webkit | 1366 | s21-show-changes | 1799.08 to 1799.08 | 0 / 0 | 32 to 32 | 2404 to 2404 |
| webkit | 1366 | s21-recording | 1864.06 to 1864.06 | 0 / 0 | 0 to 0 | 2413 to 2413 |
| webkit | 1366 | s21-print | 1746.3 to 1746.3 | 0 / 0 | 32 to 32 | 2351 to 2351 |
| webkit | 1366 | c2-reading | 1662.3 to 1662.3 | 0 / 0 | 32 to 32 | 2288 to 2288 |
| webkit | 1366 | c2-show-changes | 1697.08 to 1697.08 | 0 / 0 | 32 to 32 | 2323 to 2323 |
| webkit | 1920 | s21-reading | 1415.97 to 1415.97 | 0 / 0 | 32 to 32 | 2021 to 2021 |
| webkit | 1920 | s21-show-changes | 1415.97 to 1415.97 | 0 / 0 | 32 to 32 | 2021 to 2021 |
| webkit | 1920 | s21-recording | 1522.97 to 1522.97 | 0 / 0 | 0 to 0 | 2072 to 2072 |
| webkit | 1920 | s21-print | 1415.97 to 1415.97 | 0 / 0 | 32 to 32 | 2021 to 2021 |
| webkit | 1920 | c2-reading | 1421.97 to 1421.97 | 0 / 0 | 32 to 32 | 2048 to 2048 |
| webkit | 1920 | c2-show-changes | 1421.97 to 1421.97 | 0 / 0 | 32 to 32 | 2048 to 2048 |
| chrome | 393 | s21-reading | 977.78 to 867 | 110.78 / 110.78 | 20 to 20 | 2085 to 1974 |
| chrome | 393 | s21-show-changes | 1139.78 to 1029 | 110.78 / 110.78 | 20 to 20 | 2247 to 2136 |
| chrome | 393 | s21-recording | 1514.63 to 1403.84 | 110.78 / 110.78 | 0 to 0 | 2863 to 2752 |
| chrome | 393 | s21-print | 953.67 to 842.89 | 110.78 / 110.78 | 20 to 20 | 2061 to 1950 |
| chrome | 393 | c2-reading | 899.78 to 789 | 110.78 / 110.78 | 20 to 20 | 2023 to 1912 |
| chrome | 393 | c2-show-changes | 1097.78 to 987 | 110.78 / 110.78 | 20 to 20 | 2221 to 2110 |
| chrome | 723 | s21-reading | 943.78 to 833 | 110.78 / 110.78 | 20 to 20 | 1969 to 1859 |
| chrome | 723 | s21-show-changes | 1105.78 to 995 | 110.78 / 110.78 | 20 to 20 | 2131 to 2021 |
| chrome | 723 | s21-recording | 1292.42 to 1181.64 | 110.78 / 110.78 | 0 to 0 | 2361 to 2250 |
| chrome | 723 | s21-print | 939.67 to 828.89 | 110.78 / 110.78 | 20 to 20 | 1965 to 1855 |
| chrome | 723 | c2-reading | 865.78 to 755 | 110.78 / 110.78 | 20 to 20 | 1880 to 1769 |
| chrome | 723 | c2-show-changes | 1063.78 to 953 | 110.78 / 110.78 | 20 to 20 | 2078 to 1967 |
| chrome | 1366 | s21-reading | 1697 to 1697 | 0 / 0 | 32 to 32 | 2303 to 2303 |
| chrome | 1366 | s21-show-changes | 1729 to 1729 | 0 / 0 | 32 to 32 | 2335 to 2335 |
| chrome | 1366 | s21-recording | 1815.95 to 1815.95 | 0 / 0 | 0 to 0 | 2366 to 2366 |
| chrome | 1366 | s21-print | 1697 to 1697 | 0 / 0 | 32 to 32 | 2303 to 2303 |
| chrome | 1366 | c2-reading | 1591 to 1591 | 0 / 0 | 32 to 32 | 2217 to 2217 |
| chrome | 1366 | c2-show-changes | 1606 to 1606 | 0 / 0 | 32 to 32 | 2232 to 2232 |
| chrome | 1920 | s21-reading | 1361 to 1361 | 0 / 0 | 32 to 32 | 1967 to 1967 |
| chrome | 1920 | s21-show-changes | 1361 to 1361 | 0 / 0 | 32 to 32 | 1967 to 1967 |
| chrome | 1920 | s21-recording | 1467 to 1467 | 0 / 0 | 0 to 0 | 2017 to 2017 |
| chrome | 1920 | s21-print | 1361 to 1361 | 0 / 0 | 32 to 32 | 1967 to 1967 |
| chrome | 1920 | c2-reading | 1339 to 1339 | 0 / 0 | 32 to 32 | 1965 to 1965 |
| chrome | 1920 | c2-show-changes | 1339 to 1339 | 0 / 0 | 32 to 32 | 1965 to 1965 |

Reading the table: below 984 the Sheet loses exactly the region plus one row gap (110.78 = 90.78 + 20). At 984 and above (1366, 1920) the Sheet height does not change at all (delta 0, as the plan's formula `max(I + g + M, S) - max(I, S)` predicts): the side column (Balance, Watch for) is taller than the ingredients plus method on every one of these versions, so it sets the Sheet's height. The method region's space is not reclaimed there; the left column simply ends after the ingredients. The plan's formula held in all 96 cells, but Mark may want to know the iPad Sheet does not get shorter.

**Kept cases.** All 48 kept cells (s21-pen, s1-reading, s1-recording, s1-print, mex4-reading, mex4-show-changes, in both engines at all four widths) are identical to the baseline: presence fields, landmarks, article height, className, grid rows, trailing, doc height, method-region box, log box and pen-foot box. Strawberry v2.1's pen still shows the "Instructions" heading.

## Test count

58 files, 1574 tests (baseline 1561, plus 13: 7 in Method.test.jsx, 4 source pins in RecipePage.test.jsx, 2 new CSS pins in cross-cutting.test.js; one existing cross-cutting test was retitled and its expected selector list extended, per the plan, not removed). `npm --prefix app run build` succeeds.

## Sketch and brief audit

No board in .planning/sketches/011-recipe-route-c draws an empty Instructions section: every board that shows Instructions shows the olive-oil steps, and 393-all-folded draws Instructions as a closed fold that its README calls exploration. README decision 11 only names the region. The briefs under .impeccable/surfaces have no empty-method state; the print brief's absent-not-empty precedent (route-print-recipe-sheet.md line 74) supports this change. Nothing was overridden.

## Deviations from Plan

None - plan executed exactly as written. The plan's `gap`-fails-first expectation was observed (about 20 at 393, exactly 20).

## Flags for Mark

1. **The pen keeps an empty heading, although it has no add-step or add-note control.** NoteList only offers a textarea and "remove" for existing notes, and StepPenBody only edits existing steps. So an empty version in the pen shows "Instructions" and "Before you start" over nothing, and the maker cannot add the first step or note there. Kept as instructed. If the pen should hide the section too, drop the `mode === 'developing'` arm of `showsMethodRegion` (one line, and test D flips).
2. **The empty "Before you start" subhead and its rule still render on versions that have steps but no notes** (Strawberry v1, every Mexican Chocolate version). Unchanged by instruction; Method.test.jsx pins it.
3. **Show changes cannot show a step the child dropped from storage entirely** (Strawberry v2 against v1 is an example). It iterates only the child's own stored method. Pre-existing and not changed here.

Also worth knowing (not a defect): at 984 and above the Sheet is no shorter after the change (see the matrix), because the Balance and Watch for column sets its height.

## Deferred to Mark (human check, end-of-run UAT)

Mark's :4173 preview serves the rebuilt app/dist. He reloads the tab on each device, with a hard reload if it looks stale, then checks:

1. iPhone (393): Strawberry v2.1 and Coconut v2 show no "Instructions" heading. Balance and Watch for end the Sheet with the usual space below them. Strawberry v1 and Mexican Chocolate v4 read as before.
2. iPad (1366, landscape): the same four recipes. Balance and Watch for stay where they were, beside the ingredients.
3. Strawberry v2.1, then Next version: the empty Instructions heading still shows in the pen. Cancel leaves nothing saved.
4. Print preview of Strawberry v2.1: no Instructions heading.

The change counts as device-verified only when Mark confirms.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path, file access or schema change.

## Self-Check: PASSED

- FOUND: app/src/ui/Method.jsx (`export function showsMethodRegion`), app/src/ui/RecipePage.jsx (`methodRegionShown`), app/src/styles/app.css (`recipe-page--no-method`, twice)
- FOUND: 261003-9bz-probe.mjs, 261003-9bz-baseline.json
- FOUND commits: d46031e, 79a62ce, d065099, 9cf4ba4
- Under app/, the four commits touch only Method.jsx, Method.test.jsx, RecipePage.jsx, RecipePage.test.jsx, app.css and cross-cutting.test.js. Nothing under .planning/sketches, .planning/canvas-generators or .impeccable, and not DESIGN.md.
