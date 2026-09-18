---
phase: quick-260918-mpy
plan: 01
subsystem: ui
tags: [version-row, lineage, provenance]
status: complete
dependency-graph:
  requires: []
  provides:
    - "VersionRow.jsx: a child version renders its own Written term instead of folding its date into From version"
  affects:
    - app/src/ui/VersionRow.jsx
tech-stack:
  added: []
  patterns:
    - "Shared dt/dd pair hoisted out of a root/child ternary so both branches read one definition"
key-files:
  created: []
  modified:
    - app/src/ui/VersionRow.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/styles/app.css
decisions:
  - "The Written dt/dd pair (previously root-only) now renders unconditionally, first in the dl; From version's guard becomes `{version.parentVersionId && (...)}`, retiring the ternary."
actuals:
  tokens: 9500
  tasks: 2
  commits: 2
plan_head_before: 06fae6e48695f41f5eafa6148a5d1b7131c76c0e
metrics:
  duration: ~15min
  completed: 2026-09-18
---

# Phase quick-260918-mpy Plan 01: Child version's own written date is printed inside it Summary

A child version's row folded its own creation date into the `From version` value, appending
`· written 5 Aug 2026` after the parent's name — one value stating two records' facts, with the
middot switching records mid-value instead of joining parts of one record. The row now prints
`Written` for its own date (same pair a root version already had, now shared instead of
duplicated) and `From version` carries the parent's name alone.

## What Changed

**Task 1 (RED):** `VersionRow.test.jsx` — the `childVersion` fixture gained its own `createdAt`
(5 Aug 2026, distinct from the inherited seed date of 1 Jul 2026) so an assertion could tell the
child's date from the parent's at all. The case titled "folded with the written date" was
retitled and retargeted to drop the middot-suffix assertion; one new case was added pinning both
target facts (the child's own Written term, and a From-version value containing the parent's
label and no date words).

**Task 2 (GREEN):** `VersionRow.jsx` — the ternary that rendered either a root's `Written` pair
or a child's `From version` pair (with the date folded into the latter) was replaced with the
`Written` pair rendering unconditionally, followed by `{version.parentVersionId && (...)}`
guarding the `From version` pair alone (its appended `· written ...` span deleted). Two
now-untrue comments were corrected: the block comment atop the right-hand stack in
`VersionRow.jsx`, and the comment above `.version-row__parent-name` in `app.css` (comment-only
diff — no selector, declaration, or value changed).

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npm --prefix app test -- --run` → 38 files, 1047 tests, all passing (HEAD's 1046 plus the one
  new case).
- `git diff --stat` names exactly `app/src/ui/VersionRow.jsx`, `app/src/ui/VersionRow.test.jsx`,
  `app/src/styles/app.css`.
- `git diff app/src/styles/app.css` contains no line beginning with a property declaration —
  confirmed comment-only.
- `grep -rn "· written" app/src` and `grep -rn "written \${recordDateWords" app/src` both return
  nothing — the retired suffix string appears nowhere in `app/src`.
- **Live check (not run, per plan's "do not block on it"):** the plan asked that on a
  two-version store, the version row's `Written` value for the version in view be confirmed
  equal to the History register's own line for that version, and `From version` read as the
  parent's name alone. Not exercised in a real browser this pass; the render-level test added in
  Task 1 asserts the same facts (child's `Written` = its own `createdAt`; `From version`'s
  captured value contains only the parent's label). Recommend confirming visually at
  end-of-phase UAT.

## Self-Check: PASSED

- FOUND: app/src/ui/VersionRow.jsx
- FOUND: app/src/ui/VersionRow.test.jsx
- FOUND: app/src/styles/app.css
- FOUND commit: 23ba367
- FOUND commit: 0332b57
