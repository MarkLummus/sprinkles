---
phase: quick-261001-fcm
plan: 01
subsystem: testing
tags: [vitest, accessibility, webkit, keyboard, tabindex, claude-md, notes]
requires: []
provides:
  - "app/src/ui/tabindex-scan.test.js: a permanent text scan that fails when any link, button, radio or checkbox under app/src lacks tabIndex={0}"
  - ".planning/notes/2026-10-01-engineering-notes.md: the WebKit keyboard rationale, the device-UAT build rule and the one-Vite-process measurement, written once"
  - ".claude/CLAUDE.md: three Conventions bullets shortened to one line each"
affects: [CLAUDE.md conventions, keyboard accessibility, device UAT]
requirements-completed: [UX1-01]
actuals:
  tokens: 3800
  tasks: 2
  commits: 2
plan_head_before: 7d12b6cf109d6c43eb56c1421fc1860225ed3e41
plan_head_after: 867a4da3a2ff9814235ce23096c2c07debed90db
key-files:
  created:
    - app/src/ui/tabindex-scan.test.js
    - .planning/notes/2026-10-01-engineering-notes.md
  modified:
    - .claude/CLAUDE.md
key-decisions:
  - "The Conventions block was edited directly with the Edit tool; the generator was not run (no source file exists, see below)"
  - "One allowlist entry only: GraduatedRule's button (tabIndex ?? 0); a stale entry fails the test"
  - "The note lives in .planning/notes/, the only tracked home for prose notes"
duration: 5min
completed: 2026-10-01
status: complete
---

# Quick 261001-fcm: Keep CLAUDE.md short, enforce explicit tabindex by test Summary

**The explicit-tabindex rule for every link, button, radio and checkbox is now a 26-test Vitest scan that fails on a miss and names file, line and tag, its WebKit rationale sits once in an engineering note, and `.claude/CLAUDE.md` shrank by 789 bytes.**

Ran in the main checkout on main (not a worktree), sequentially. Nothing under `app/` changed except the new test file; the root CLAUDE.md is untouched.

## Task commits

1. **Task 1: scan test** - `f586e83` (test)
2. **Task 2: engineering note and three one-line bullets** - `867a4da` (docs)

This SUMMARY is left uncommitted for the orchestrator's docs commit.

## `.claude/CLAUDE.md` before and after

| | Lines | Bytes |
|---|---|---|
| Before | 89 | 7791 |
| After | 89 | 7002 |
| Saving | 0 | 789 |

`git diff --numstat` reads 3 added, 3 deleted. Both GSD conventions markers are intact. Each new bullet is one line of at most 260 characters ending in a pointer to the note; the link bullet also names `tabindex-scan.test.js`.

## Scan test

- **RED:** 26 of 26 tests failed against throwing stubs of the four helpers (stripComments, inScopeTags, scanSource, applyAllowlist).
- **GREEN:** 26 of 26 pass. Full suite: **1501 passing** (1475 baseline + 26), none removed or edited.
- **Real tree seen by the scan:** 25 non-test .jsx files, 63 in-scope tags: 39 button, 2 radio input, 3 checkbox input, 14 Link, 5 NavLink, no `<a>`. Exactly one fails the literal `tabIndex={0}` test, GraduatedRule's button (`tabIndex={tabIndex ?? 0}`), and it is the single allowlist entry. Zero violations and zero stale entries remain. The file list includes router.jsx, ui/RecipePage.jsx and ui/Method.jsx. This matches the planner's prototype, so no STOP condition tripped.
- **Fixtures** (in memory, no component read): each of the six tag kinds untagged (reported with file, line, name) and tagged (not reported); literal -1 reported; arrow-function handler and a `>` in an attribute string judged on the whole tag; text, number, date, file (even with -1) and computed-type inputs, select, textarea, abbr, article, LinkButton and NavLinkGroup ignored; block, line, JSX and trailing comments ignored; a URL's double slash does not hide a tag; comment stripping keeps length and newlines; allowlist match, other-file, missing-string and stale cases.

## The generator finding

No CONVENTIONS.md, STACK.md or ARCHITECTURE.md exists anywhere in the repo, so the Conventions block has no source file; its marker `source:CONVENTIONS.md` names a file that is not there. Per the planner's dry runs on scratch copies, a plain `generate-claude-md` run would replace Stack, Conventions and Architecture with fallback text ("not yet documented" and the like) and rewrite the Project block from older PROJECT.md wording; with `--auto` it skips all six blocks as manually edited. It cannot be run safely, so I did not run it on the real file or any other. The block was edited directly, as commits 5b16cf2 and 37ff04a did when they added these bullets. A later plain regeneration would wipe the block whatever its length.

## Notes on the engineering note

- It lives in `.planning/notes/` because that is the only tracked home for prose notes (no docs/ tree). Side effect: it appears as an active note in `/gsd-note list`.
- Relocation check: every figure, id and cause clause from the three old bullets is in the note (TabsToLinks, no iPadOS switch, Full Keyboard Access, G-03.4-r3-3 and G-03.4-r4-1, the per-component exact-count pins, the source-text pins, 64 requests and 6.22 MiB against 3 requests and about 134 KB gzipped, the shared optimised-deps cache, the 504 and the whole-page reload, kill the duplicate).

## Deviations from Plan

None - plan executed exactly as written. Two points the plan already named, restated:

- The brief's ids G-03.5-r3-3 and G-03.5-r4-1 are the repo's G-03.4-r3-3 and G-03.4-r4-1; the note uses the repo's ids.
- router.jsx renders no link now (the running head went in 03.5-02 Task 3). The note states the current facts and the scan still reads router.jsx. The sites pinned on source text today are Method.jsx's uses-list checkbox and RecipePage.jsx's not-found link.

One small observation, not a change: the literal string "G-03.4-r3-3" appears in `.planning/debug/ipad-keyboard-locks-after-tab.md` and `ipad-recipe-page-tab-skips-controls.md` and in Shell.test.jsx, which cite `ipad-tab-never-enters-app.md` as its debug session; that file does not contain the id itself. The note cites the same pairing Shell.test.jsx does.

## Known Stubs

None.

## Threat Flags

None. The change is a test file, a markdown note and three markdown lines; no app/ production code, no markup injection.

## Open question for Mark

Should `.planning/codebase/CONVENTIONS.md` become a real source for the generated Conventions block? Creating it would start the codebase mapping that PROJECT.md leaves pending ("map when useful"), and `/gsd-map-codebase` would own and overwrite that file. The alternative is to keep editing the block by hand, as the last three commits have. I did not act on this.

## Self-Check: PASSED

- `app/src/ui/tabindex-scan.test.js`, `.planning/notes/2026-10-01-engineering-notes.md` exist; commits `f586e83` and `867a4da` exist on main.
- Task 1 verify: single-file run 26/26, full suite 1501/1501, `git status --porcelain -- app` showed only the new test file before the commit.
- Task 2 verify: note carries every named fact; three bullets are single lines pointing to the note; `.claude/CLAUDE.md` numstat 3/3 at 89 lines; markers intact; `git diff --quiet HEAD -- CLAUDE.md app` exits 0.
- Scope: `git diff --name-only 7d12b6c HEAD` lists exactly the three planned files.
