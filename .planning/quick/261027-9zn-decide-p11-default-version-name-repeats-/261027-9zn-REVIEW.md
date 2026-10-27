---
phase: quick-261027-9zn
reviewed: 2026-10-27T00:00:00Z
depth: quick
files_reviewed: 5
files_reviewed_list:
  - app/src/domain/lineage.js
  - app/src/domain/lineage.test.js
  - .planning/phases/11-steps-structure-save-and-print/11-board-save.mjs
  - .planning/phases/11-steps-structure-save-and-print/11-board-first-version.mjs
  - .planning/phases/11-steps-structure-save-and-print/11-board-selftest.mjs
findings:
  critical: 0
  warning: 1
  info: 3
  total: 4
status: issues_found
---

# Quick 261027-9zn: Code Review Report

**Reviewed:** 2026-10-27
**Depth:** quick (diff of 107b649f, plus a read of the four callers and the two other sites that build a "Version N · name" string)
**Files Reviewed:** 5
**Status:** issues_found (one Warning, three Info, no blockers)

## Summary

The change itself is correct and small. `versionIdentity` now compares `versionLabel.trim().toLowerCase()` with the ordinal's lower-cased words and returns the ordinal alone on a match. Any other label keeps the long form untrimmed. The `index < 0` path returns before the comparison, so the pre-load paint is unchanged.

- **Callers.** `VersionRow.jsx:343`, `PrintSheet.jsx:85`, `RecipeList.jsx:164` and `historyRail.js:59` all take the string as-is. None re-parses it, none splits on the middot, and none compares it with a label. The " · Latest" tail in `VersionRow.jsx:344` is appended separately, so the "Version 1 · Latest" read holds.
- **Tests.** `npx vitest run src/ui src/domain` passes (98 files, 3092 tests). The four new domain tests cover the match, the other-number mismatch, padding and case.
- **Board scripts.** All three parse (`node --check`). Each seed that the restored `.notebook-version__identity` text check reads uses `versionLabel: 'Version 1'` as the first version, so the identity reads "Version 1" plus " · Latest". The removed comments described a mismatch that no longer exists, and the replacement comments say so.
- **Security.** No injection, markup or `tabIndex` surface. The string renders as text in every caller.

## Warnings

### WR-01: The waiting-draft name builds the same string by hand and does not get the new rule

**File:** `app/src/ui/VersionRow.jsx:171-176` and `app/src/domain/historyRail.js:73`
**Issue:** The commit says the four sites that name a version now read "Version 1" for the default. Two more places build `Version {n} · {label}` themselves instead of calling `versionIdentity`: the waiting draft's name in `VersionRow.jsx` (`Version ${ordered.length + 1} · ${waitingLabel}`) and the draft row in `railEntries` (`Version ${ordinal} · ${draft.label}`). Both comments call this "the rail's rule", so the two were meant to track `versionIdentity`. If a maker types a Next version name equal to the ordinal's words, say "Version 2" or "version 2", the draft row reads "Version 2 · Version 2". The same version, once saved, reads "Version 2". That is the repeat this change removes, still showing on the draft, and the draft and the saved version now name the same version differently.
**Fix:** Move the rule into one exported helper in `lineage.js` and call it from all three places. For example:
```js
export function ordinalName(ordinal, label) {
  const words = `Version ${ordinal}`;
  const authored = label ?? '';
  if (!authored.trim() || authored.trim().toLowerCase() === words.toLowerCase()) return words;
  return `${words} · ${authored}`;
}
```
`versionIdentity` then returns `ordinalName(ordered.length - index, version.versionLabel)`. `VersionRow.jsx` and `historyRail.js` call `ordinalName(n, label)` for the draft. Add one `railEntries` test with a draft labelled "Version 2".

## Info

### IN-01: `versionLabel.trim()` throws where the old code printed "undefined"

**File:** `app/src/domain/lineage.js:67`
**Issue:** The old template string tolerated a missing `versionLabel`. `.trim()` now throws a `TypeError` on a null or undefined label. `creationSave.js:169` requires a name, so a stored version should always have one. Home, the print route and the history rail map over every stored version, so one malformed or legacy row would now blank the whole screen instead of showing one odd line.
**Fix:** Either accept the strictness (it is a caller bug under the "throw for caller bugs" rule), or read `(version.versionLabel ?? '')`. Prefer the first, and add a one-line note to the docblock.

### IN-02: The docblock's opening line still describes only the long form

**File:** `app/src/domain/lineage.js:36`
**Issue:** The first line reads `versionIdentity(ordered, version) -> "Version {n} · {authored name}"`. The new paragraph at the end of the block gives the short form, but the summary line, which is what a reader sees first, is now wrong for the default case.
**Fix:** Change the first line to `-> "Version {n} · {authored name}", or "Version {n}" alone when the name is those same words,`.

### IN-03: No caller-level test pins the default reading

**File:** `app/src/ui/RecipeList.test.jsx:513,536`, `app/src/ui/PrintSheet.test.jsx:113,163`, `app/src/ui/PrintSheetPages.test.jsx:357`
**Issue:** Every existing caller test seeds a non-default label ("older work", "first", "50 g oil · 800 g"). Only the domain test and the board panels exercise the new behaviour. The commit message lists the print foot, Home's lead, the page and the rail as the visible changes. A later refactor of any one of them could bring the repeat back with the suite still green. The board scripts are not run by `npm test`.
**Fix:** Add one case to `RecipeList.test.jsx` (lead reads `Version 1` for a version labelled "Version 1") and one to `PrintSheet.test.jsx` (foot reads `Olive Oil Ice Cream · Version 1 · {code}`).

---

_Reviewed: 2026-10-27_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
