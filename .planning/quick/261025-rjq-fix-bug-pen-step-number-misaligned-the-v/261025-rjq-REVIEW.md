---
phase: quick-261025-rjq
reviewed: 2026-10-25T00:00:00Z
depth: quick
files_reviewed: 2
files_reviewed_list:
  - app/src/styles/app.css
  - app/src/styles/binder.test.js
findings:
  critical: 0
  warning: 0
  info: 2
  total: 2
status: issues_found
---

# Quick 261025-rjq: Code Review Report

**Reviewed:** 2026-10-25
**Depth:** quick (pattern scan, plus a read of the selector's context in `Method.jsx` and the neighbouring rules)
**Files Reviewed:** 2
**Status:** issues_found (two Info items, no blockers)

## Summary

Commit 21878842 adds one CSS rule and one test. The rule is correct and minimal.

- **Selector target.** `.method-step__open-fields > .method-step__field:first-child` matches the lead-in `<label>`, which is the first child of the wrapper at `Method.jsx:153-154` and is always rendered. The later `.method-step__field` labels (instruction, and purpose and aside when open) are not first-child. The purpose and aside labels sit under `.method-step__body`, not under `.method-step__open-fields`. So the 6px rhythm is untouched everywhere else.
- **Specificity and order.** The rule has specificity (0,3,0) and the base `.method-step__field` rule has (0,1,0). The new rule wins regardless of source order. No media block, print.css or notebook.css rule touches `.method-step__field`, so nothing overrides it.
- **Token rule.** `margin-top: 0` is a unitless zero, not a visual literal. app.css already uses it at lines 1623, 2059, 2129, 2146 and 2755 (notebook.css and print.css use it too). The "no visual literal" tests in `binder.test.js` forbid only hex colours and bare `px` values, and they pass. There is no `dangerouslySetInnerHTML`, no new at-rule (the media-block count of 10 is unchanged) and no `tabIndex` surface.
- **Test.** I ran `binder.test.js` and all 45 tests pass.

## Info

### IN-01: Test regex pins `margin-top: 0` as the rule's last declaration

**File:** `app/src/styles/binder.test.js:157`
**Issue:** `/margin-top:\s*0\s*;?\s*$/` is anchored to the end of the declarations string. If someone later adds another declaration to this rule, even a harmless one, the test fails although `margin-top: 0` is still there. It also matches only when the rule has no other declaration after it.
**Fix:** Drop the end anchor and require a boundary instead: `/margin-top:\s*0\s*(?:;|$)/`. This still rejects `margin-top: 0.5rem` and `margin-top: 06px`.

### IN-02: Outline position relative to the step top was not measured

**File:** `app/src/styles/app.css:1231-1233` (interacts with `.method-step__open-fields`, app.css:1313-1316)
**Issue:** The SUMMARY measures lead-in top against margin-number top (6.0 to 0.0) and the field gap (6 to 6). It does not record where the hairline outline's top edge sits now. The outline uses `outline-offset: var(--sheet-open-fields-offset)` (4px). The outline wraps `.method-step__open-fields`, and its first child had a 6px top margin. Removing that margin moves the lead-in, and perhaps the outline, 6px up. The outline top edge is now 4px above the lead-in and the number. If the previous step's bottom spacing is under 4px, the outline could touch or overlap it. The summary reports that later steps sit 6.0 above base, which fits the container shrinking but does not show the clearance. Nothing in the diff is wrong, and this is a gap in verification, not a defect found.
**Fix:** In the next device or browser pass, look at an open step that follows a closed step and confirm the outline's top edge keeps clear of the previous step's text. No code change unless it does not.

---

_Reviewed: 2026-10-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
