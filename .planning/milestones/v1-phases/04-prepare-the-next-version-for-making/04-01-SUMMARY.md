---
phase: 04-prepare-the-next-version-for-making
plan: 01
subsystem: ui
tags: [react, keyboard, tabindex, shared-components, webkit, d-19]

requires:
  - phase: 03.4
    provides: "quick task 261001-doi hand-tagged every control with tabIndex={0}; tabindex-scan.test.js"
provides:
  - "Button, Checkbox, Radio: the only places a raw button, checkbox or radio tag exists under app/src/ui (plus GraduatedRule's one allowlisted button)"
  - "tabindex-scan.test.js second rule (SHARED_CONTROL_FILES, rawControlsOutsideShared)"
  - "The D-19 convention in CONVENTIONS.md, .claude/CLAUDE.md and the engineering note"
affects: [04-02, 04-05, 04-06, 04-10]

actuals:
  tokens: 6127
  tasks: 3
  commits: 3
plan_head_before: 77d6b35a7b4a701cae94f9613de0f55028cd83f2
plan_head_after: 74b6569da3e54c1093e82e09d6e084b1d87425bf
commits: 3

tech-stack:
  added: []
  patterns:
    - "Shared control components place tabIndex={0} after the prop spread so no caller can drop a Tab stop"
    - "React 19 ref-as-prop on function components, no forwardRef"

key-files:
  created:
    - app/src/ui/Button.jsx
    - app/src/ui/Checkbox.jsx
    - app/src/ui/Radio.jsx
    - app/src/ui/controls.test.jsx
  modified:
    - app/src/ui/Segmented.jsx
    - app/src/ui/AxisMark.jsx
    - app/src/ui/VersionRow.jsx
    - app/src/ui/Authored.jsx
    - app/src/ui/FoldRow.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/ui/PenFoot.jsx
    - app/src/ui/RecipeBand.jsx
    - app/src/ui/Shell.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/tabindex-scan.test.js
    - .planning/codebase/CONVENTIONS.md
    - .claude/CLAUDE.md
    - .planning/notes/2026-10-01-engineering-notes.md

key-decisions:
  - "Checkbox and Radio put their literal type before the prop spread and tabIndex={0} after it, matching the old attribute order (type first, tabindex last); only tabIndex is protected from override (T-04-01)"
  - "A disabled Radio still carries tabIndex={0}; the browser drops a disabled input from the Tab order natively, so the scan's literal rule and the disabled state do not conflict (sketch 010 CONTRACT section 11, open item 2)"

patterns-established:
  - "New buttons, checkboxes and radios are born on Button, Checkbox, Radio; the scan fails on a raw tag anywhere else"

requirements-completed: [UX1-01]

coverage:
  - id: D1
    description: "Button, Checkbox and Radio exist, always render tabindex=0 even when a caller passes tabIndex -1, and pass props and refs through"
    requirement: UX1-01
    verification:
      - kind: unit
        ref: "app/src/ui/controls.test.jsx"
        status: pass
    human_judgment: false
  - id: D2
    description: "All 42 buttons, 3 checkboxes and 2 radios outside GraduatedRule render through the shared components with markup unchanged"
    requirement: UX1-01
    verification:
      - kind: unit
        ref: "npm --prefix app test (1950 passed), per-component rendered tabindex pins"
        status: pass
    human_judgment: false
  - id: D3
    description: "The scan keeps raw buttons, checkboxes and radios inside the three shared components, with GraduatedRule's button as the single exemption, and fails on a raw tag elsewhere"
    requirement: UX1-01
    verification:
      - kind: unit
        ref: "app/src/ui/tabindex-scan.test.js#raw buttons, checkboxes and radios appear only in Button.jsx, Checkbox.jsx, Radio.jsx and the one allowlisted rule"
        status: pass
    human_judgment: false
  - id: D4
    description: "The convention is written in CONVENTIONS.md, .claude/CLAUDE.md and the engineering note"
    requirement: UX1-01
    verification:
      - kind: other
        ref: "grep -c 'Button.jsx, Checkbox.jsx or Radio.jsx' on both files returns 1"
        status: pass
    human_judgment: false

duration: ~8min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 01: Shared Button, Checkbox and Radio Summary

**Three shared control components that always carry tabIndex={0} after the prop spread, with 42 buttons, 3 checkboxes and 2 radios migrated onto them and a scan rule that keeps raw tags out of every other file.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-10-11T06:09Z
- **Tasks:** 3
- **Files modified:** 21 touched across the three commits (4 created)

## Accomplishments

- `Button`, `Checkbox` and `Radio` land (D-19). Each renders one native element, takes `ref` as an ordinary React 19 prop, and writes `tabIndex={0}` after `{...props}`, so a caller's `tabIndex={-1}` cannot remove a Tab stop (T-04-01, pinned in `controls.test.jsx`).
- Migrated: Segmented, AxisMark, VersionRow (Task 1, the tracer); Authored, FoldRow, IngredientTable, Method, PenFoot (Task 2); RecipeBand, Shell, BatchRow (Task 3). GraduatedRule's one button stays raw by allowlist; Shell's hidden file input is out of scope and untouched.
- `tabindex-scan.test.js` gains `SHARED_CONTROL_FILES`, `rawControlsOutsideShared`, three fixture tests and a real-tree test that reports `file:line` for any raw button, checkbox or radio outside the three components (empty list now). The existing link rule is unchanged.
- The convention bullet in `.planning/codebase/CONVENTIONS.md` is split into links (literal `tabIndex={0}`) and the three controls (shared components), mirrored by hand into `.claude/CLAUDE.md`; the engineering note's "Other pins" paragraph gets the one sentence.

## Task Commits

1. **Task 1 (tracer): Button, Checkbox, Radio and the radio pair and version row** - `c81cc47` (feat)
2. **Task 2: sheet and pen controls (Authored, FoldRow, IngredientTable, Method, PenFoot)** - `2a582d8` (refactor)
3. **Task 3: band, shell and batch log, scan rule, convention** - `74b6569` (refactor)

Tracer feedback gate: the tracer's `<verify>` was automated-only and `human_verify_mode` is end-of-phase, so it was re-run end to end (131 targeted tests, then the full 1945) and passed before expansion.

**Plan metadata:** committed separately after this file (docs).

## Files Created/Modified

- `app/src/ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` - the shared controls
- `app/src/ui/controls.test.jsx` - jsdom test: tabindex override, prop pass-through, type default, refs
- `app/src/ui/tabindex-scan.test.js` - second rule and real-tree test
- Twelve components migrated (list in frontmatter), `Method.test.jsx` source pin rewritten to count `<Button` (9) and `<Checkbox` (2)
- `.planning/codebase/CONVENTIONS.md`, `.claude/CLAUDE.md`, `.planning/notes/2026-10-01-engineering-notes.md` - the convention

## Decisions Made

See key-decisions. Counts differ from the plan's "43 buttons": 42 were migrated, the 43rd is GraduatedRule's allowlisted button.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Exact-markup pins in IngredientTable.test.jsx follow the shared control's attribute order**
- **Found during:** Task 2
- **Issue:** `IngredientTable.test.jsx` pins literal markup strings in which `tabindex="0"` sits before `aria-label` on the remove and restore buttons. The shared Button must put `tabIndex={0}` after the prop spread (T-04-01), so the attribute now follows `aria-label`. Same attributes, same values, different order, which broke three markup assertions. A fourth test (Test F) found the button by `child.type === 'button'` in an element tree, which is now `Button`.
- **Fix:** Moved `tabindex="0"` after `aria-label` in the four expected strings and compared `child.type` to the imported `Button`. No expectation about counts, values or presence changed. The plan's "no edit to their expectations" held for every other test file.
- **Files modified:** `app/src/ui/IngredientTable.test.jsx`
- **Verification:** full suite green (1945, then 1950 with the new scan tests)
- **Commit:** `2a582d8`

**2. [Rule 1 - Bug] Checkbox and Radio first wrote type after the spread, which changed markup order**
- **Found during:** Task 1
- **Issue:** `VersionRow.test.jsx` matches `<input type="checkbox"[^>]*disabled=""`; with `type` after the spread the attribute order moved and the match failed.
- **Fix:** `type` now comes before the spread in Checkbox and Radio (the old order); `tabIndex={0}` stays after it.
- **Files modified:** `app/src/ui/Checkbox.jsx`, `app/src/ui/Radio.jsx`
- **Commit:** `c81cc47`

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug). **Impact:** none on behavior; rendered markup is identical apart from tabindex now trailing the other attributes on buttons that carry an aria-label.

## Issues Encountered

None. A first sed attempt on macOS (no `-i ''`) failed before touching anything; redone with the Edit tool.

## Known Stubs

None.

## Threat Flags

None. T-04-01 and T-04-02 are mitigated as planned (override-proof tabindex pinned by `controls.test.jsx`; raw-tag scan rule). T-04-SC: no package installed.

## Deferred Human Verification

None. No checkpoint in this plan. The keyboard check on the iPad is plan 04-10 (D-21); this plan only makes the stops structural.

## Self-Check: PASSED

- Created files exist: Button.jsx, Checkbox.jsx, Radio.jsx, controls.test.jsx (FOUND)
- Commits `c81cc47`, `2a582d8`, `74b6569` are on main
- `npm --prefix app test -- --run`: 65 files, 1950 passed, 0 failed (baseline 1931 plus 14 controls tests and 5 scan tests)
- `npm --prefix app run build` exits 0
- Acceptance: no raw button/checkbox/radio in the migrated files (comment-stripped check exits 0); both docs contain "Button.jsx, Checkbox.jsx or Radio.jsx"
