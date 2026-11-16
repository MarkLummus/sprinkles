---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
reviewed: 2026-11-16T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - app/src/domain/axes.js
  - app/src/domain/axes.test.js
  - app/src/domain/creation.js
  - app/src/domain/creation.test.js
  - app/src/styles/print.css
  - app/src/styles/print.test.js
  - app/src/styles/tokens.css
  - app/src/ui/AxisMark.jsx
  - app/src/ui/AxisMark.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/CreationSetup.test.jsx
  - app/src/ui/PrintLogPages.jsx
  - app/src/ui/PrintLogPages.test.jsx
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
  necessity: 0
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-11-16
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

I reviewed the Phase 12 diff (e37db11a..HEAD) for the kind-aware scale readers in `axes.js`, their call sites (`AxisMark`, `BatchRow`, `PrintLogPages`, `creation.js`), the clipboard-drop print rules, and the tests added with them.

The kind branch really does live in `axes.js` alone. The only components that read the new functions are the three listed above, and none tests a kind itself. Prose still renders as text, and no `dangerouslySetInnerHTML` was added. Every new visual value goes through a token. The `.lf-sc` grid now has an explicit second row, so a Low to high row keeps the height of a Right in the middle row. I found no correctness bug in the domain or UI logic.

The main risk is in print. The clipboard drop removes 96 px (90 px in WebKit) from each log page, and the compensation is a one-line cut in the Batch log notes and a one-line cut in the Tasting log notes. Phase 12's own measurements show the Batch log nearly full and the Tasting log spilling for long words. No test guards this. The remaining findings are comment and contract hygiene.

I read `necessity-review.md` and assessed necessity. I found no necessity findings.

## Warnings

### WR-01: Log pages have almost no slack after the clipboard drop, and the Tasting log can spill onto the first bench page

**File:** `app/src/styles/print.css:915-921`, `app/src/ui/PrintLogPages.jsx:133`, `app/src/ui/PrintLogPages.jsx:206`
**Issue:** The drop adds 90 px to the top of each log page in WebKit and 96 px elsewhere. The page still has `height: 100%` with `.lf-foot { margin-top: auto }`. Overflow is not contained, because `.print-page` is `overflow: visible` in print. When the body is taller than the page, the foot is pushed past the page box and prints onto the next page.

Phase 12's own measurements, in `12-02-SUMMARY.md` and `12-05-SUMMARY.md`:
- **Batch log, WebKit:** needs 790 px of 810, so 20 px spare. In the WebKit PDF its ink reaches 756 pt of 756.
- **Tasting log, normal recipe:** 42 px spare.
- **Tasting log, long scale names, end words and problem words:** needs 827.8 px of 810. It spills by 17.8 px. "Side 2 of 2" lands on page 3, on top of the first bench page. Long end words also run 28 to 54 px past their 76 px grid column.

12-05 says the long-words case was measured and left for Mark. The code still ships with no guard, and the only tests are line counts. The Batch log is also very close to the limit in WebKit.

The fixed cut of one notes line was sized against a typical recipe, but the Tasting log's height depends on stored, user-typed content: scale names and ends, and problem words. Nothing in the app bounds that content.

**Fix:** Choose one of these:
- Make the Tasting log notes lines the shrinkable part, for example `flex: 0 1 auto` with a `min-height` of two lines. Alternatively, drop notes lines in `TastingLogPage` according to the count of declared scales and flaws.
- Contain the page in print so a spill cannot reach the next sheet. Use `overflow: hidden` on `.print-page--log` in `@media print`. That clips the foot instead of overprinting a bench page. It is the lesser evil only if the fit cannot be guaranteed.
- Cap the length of scale ends and names at the creation step so the measured worst case cannot be reached. Pin the cap with a fit test, not a line-count test.

The mitigation should come before Mark's "long words" decision is closed.

### WR-02: No automated check ties the notes-line counts to the clipboard drop

**File:** `app/src/ui/PrintLogPages.test.jsx:81-85`, `app/src/styles/print.test.js:97-137`
**Issue:** The only protection for the page-fit trade-off is a test that counts `lf-line` elements: 13 on the Batch log and 4 on the Tasting log. The CSS tests assert that the drop tokens exist and which rules read them. Nothing ties the drop height (96 or 90 px) to the line count (32 px each) and the measured body heights. A later edit to a gap token or a font size can push either log page over its limit with every test still green. The real fit check is the manual script `12-print-check.mjs`, which does not run in the suite. The drop alone costs three lines' height, so cutting one line only works because of existing slack. The tests state the cut without stating that slack.

**Fix:** Add a Playwright or WebKit fit test to the gate, even if it is not in the Vitest run, with a spare-pixels floor for the fullest normal recipe: Batch log at least 15 px, Tasting log at least 30 px. Failing that, record in the tests why the line count is 13 and 4 and where the 20 px and 42 px spare figures come from, so a changed token is caught.

## Info

### IN-01: `stopWordsFor` now returns `null` entries, and `readMarkWord` remains an exported kind-blind reader

**File:** `app/src/domain/axes.js:37-40`, `app/src/domain/axes.js:100-104`
**Issue:** `stopWordsFor` used to return five strings. For a magnitude scale it now returns `[low, null, null, null, high]`. The only non-axes caller, `scaleStopsLine` in `creation.js:309`, handles this with `?? index + 1`. Any future caller that joins, maps or lowercases the array will print or crash on `null`.

`readMarkWord` is still exported and still documented as "the word the read view prints". It has no kind awareness: it returns "right" at stop 3 for any scale. Its only remaining caller is `readMarkText`, which guards it by branching first. This leaves a trap: someone using `readMarkWord` directly for a magnitude scale gets "right".

**Fix:** Keep the null contract but note it on `stopWordsFor`'s own doc line (the doc comment already says "null at stops 2 to 4", so mark it as a contract in the module header). Make `readMarkWord` module-private, or add "Right in the middle only; use readMarkText" to its doc. The `axes.test.js` imports of `readMarkWord` can then go through `readMarkText`.

### IN-02: `readMarkText` uses strict equality where `readMarkWord` coerces

**File:** `app/src/domain/axes.js:112-118`
**Issue:** On the magnitude branch, `stop === 1` and `stop === 5` are strict. `readMarkWord` on the goldilocks branch uses `<=` and `>=`, which coerce. A mark that arrives as the string `"5"` (hand-edited data, or a future import) reads "high (5)" on a Right in the middle scale but "5 of 5" on a Low to high one. A mark of `6` reads "6 of 5". Marks are written only through `setMark` as integers from `STOPS`, so this is not reachable through the UI today. It is an inconsistency between the two branches.

**Fix:** Either compare numerically on both branches, with `Number(stop)`, or state in the doc comment that stops are integers 1 to 5 and that the function trusts the caller.

### IN-03: A test title claims an order it does not check, and one test has a formatting slip

**File:** `app/src/ui/BatchRow.test.jsx:2119-2124`
**Issue:** The test "a recipe with a Low to high scale and a problem of its own draws both cues, scales first" asserts the cue count and the chip list. It never checks that the scales cue comes before the problems chips. The title overstates the check. The `it(...)` header and its first statement share one line (`() => {    const markup = ...`), a leftover from an edit.

**Fix:** Assert `markup.indexOf('id="axes-declared-cue"') < markup.indexOf(...)` for the problems cue, or rename the test. Put the statement on its own line.

### IN-04: Stale and garbled comments around the changed code

**File:** `app/src/ui/BatchRow.jsx:273-278`, `app/src/domain/axes.js:1-8`, `app/src/styles/tokens.css:558`
**Issue:**
- **`BatchRow.jsx`:** the `TastingReading` header comment now ends a clause with "from the batch's own snapshot, D-04's battery); the tasting's own measured cells...". The long line is garbled, and "D-04's battery" now follows the wrong clause.
- **`axes.js`:** the top comment still opens with "The five whole goldilocks stops" and says `stopWordsFor`, `readMarkWord` and `setMark` "stay constants and functions because they are the battery's controls". The rest of the same comment says the readers are kind-aware from Phase 12.
- **`tokens.css` (`--sheet-print-clipboard-drop`):** the comment says the token is "the page picture's top padding and every engine's print but WebKit's". On the page picture it is added to the 48 px margin, and it is the whole top padding only in print. The text reads as if it were the page picture's whole top padding.

**Fix:** Reword each comment to match the code.

---

_Reviewed: 2026-11-16_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
