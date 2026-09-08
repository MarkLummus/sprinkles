---
phase: quick-260908-eil
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/CLAUDE.md
  - .impeccable/surfaces/route-recipe.md
  - .impeccable/surfaces/route-recipe-version.md
  - .impeccable/surfaces/route-recipe-batch.md
  - .impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md
  - .planning/STATE.md
autonomous: true
requirements: [BRIEF-FOLLOWUP-2026-09-08]

estimate:
  tokens: 24000
  raw_tokens: 24000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "`git ls-files` lists all four revised files and the 2026-09-08 critique snapshot; none of the five is still reported by `git status --short`."
    - "The commit made by this plan contains exactly five paths — no path under `app/`, and no path under `.planning/`."
    - "`.planning/STATE.md` records, in prose, that the three briefs were revised and confirmed on 2026-09-08 after the 25/40 whole-page critique, and names the five headline decisions (imprint, binder, pen keeps the page, native date inputs with the icon hidden, Escape on an untouched pen only)."
    - "`.planning/STATE.md` records the new `.claude/CLAUDE.md` constraint in one line."
    - "`.planning/STATE.md` records that the code work is a phase inserted between Phase 3 and Phase 4, not quick tasks."
    - "`.planning/research/` is still untracked after this plan runs, and no file under `app/` differs from its committed state."
  artifacts:
    - ".claude/CLAUDE.md — committed with its already-written 'Impeccable and GSD in sync' constraint line; content unchanged by this plan."
    - ".impeccable/surfaces/route-recipe.md, route-recipe-version.md, route-recipe-batch.md — committed with their already-written 2026-09-08 revisions; content unchanged by this plan."
    - ".impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md — newly tracked by git; content unchanged by this plan."
    - ".planning/STATE.md — two bullets appended to Accumulated Context > Decisions and one bullet appended to Blockers/Concerns; left uncommitted for the orchestrator."
  key_links:
    - "STATE.md Decisions -> the three surface briefs by filename, so the planner of the inserted phase finds the confirmed direction without re-reading the critique."
    - "STATE.md Blockers/Concerns -> `.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md`, so the critique's three P1s are traceable from the delivery record."
    - "STATE.md Blockers/Concerns -> the phase-insertion decision, so `/gsd-phase` or `/gsd-plan-phase` does not mistake this body of work for a set of quick tasks."
---

<objective>
Record the 2026-09-08 Impeccable revisions in git and in the delivery record.

The content already exists in the working tree — three surface briefs revised and confirmed by Mark
on 2026-09-08 after the whole-page critique, a new `.claude/CLAUDE.md` constraint, and the critique
snapshot itself. This plan commits that content atomically and writes the corresponding note into
STATE.md so the phase that builds it can be planned from the delivery record.

Purpose: the confirmed design direction is currently uncommitted working-tree state and is invisible
to the delivery record. Until it is committed and recorded, a planner reading STATE.md would plan
Phase 4 against superseded briefs.
Output: one `docs(260908-eil)` commit of five files, plus an uncommitted STATE.md edit.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md

**No worktree.** This plan runs on the MAIN working tree at
`/Users/mark/Documents/projects/sprinkles`, because the content it commits IS uncommitted
working-tree state. Do not look for, create, or switch to a worktree; do not stash; do not
`git checkout` or `git restore` anything. If the working tree does not already hold the modified
files listed below, stop and report rather than recreating them.
</execution_context>

<context>
@.planning/STATE.md
@.claude/CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Commit the confirmed revisions as one atomic commit</name>
  <files>.claude/CLAUDE.md, .impeccable/surfaces/route-recipe.md, .impeccable/surfaces/route-recipe-version.md, .impeccable/surfaces/route-recipe-batch.md, .impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md</files>
  <precondition>`git status --short` reports the four files as modified (` M`) and the critique snapshot as untracked (`??`). If any is absent or already committed, stop and report — do not author replacement content.</precondition>
  <action>
Do NOT edit any of these five files. Their content was written and confirmed by Mark on 2026-09-08;
this task only moves it into git.

Re-run `git status --short` first and treat it as the authority for what is in scope. Stage exactly
these five paths by name — never `git add -A`, never `git add .`:

  .claude/CLAUDE.md
  .impeccable/surfaces/route-recipe.md
  .impeccable/surfaces/route-recipe-version.md
  .impeccable/surfaces/route-recipe-batch.md
  .impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md

Explicitly out of scope, and left untouched and unstaged: the untracked `.planning/research/`
directory (unrelated work in progress) and every path under the `app/` workspace (this is a
docs-only task; no source, test, or style file changes).

Commit with the message:

  docs(260908-eil): record the confirmed 2026-09-08 brief revisions and the Impeccable/GSD sync rule

Body: the three surface briefs were revised 2026-09-08 after the whole-page critique (25/40) and
confirmed by Mark the same day; the critique snapshot is added as evidence; `.claude/CLAUDE.md`
gains the Impeccable-and-GSD-in-sync constraint.

Follow the repository's commit trailer convention already used on recent commits.
  </action>
  <verify>
    <automated>cd /Users/mark/Documents/projects/sprinkles && RAW=$(git show --name-only --format= HEAD) && FILES=$(printf '%s\n' "$RAW" | grep -v '^[[:space:]]*$' | sort) && EXPECTED=$(printf '%s\n' '.claude/CLAUDE.md' '.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md' '.impeccable/surfaces/route-recipe-batch.md' '.impeccable/surfaces/route-recipe-version.md' '.impeccable/surfaces/route-recipe.md' | sort) && test "$FILES" = "$EXPECTED" && ! printf '%s\n' "$RAW" | grep -qE '^app/|^\.planning/' && ST=$(git status --short) && printf '%s\n' "$ST" | grep -qE '^\?\? \.planning/research/'</automated>
  </verify>
  <done>HEAD is a five-path commit holding the four revised files and the critique snapshot; no path under `app/` or `.planning/` is in it; `.planning/research/` is still untracked.</done>
</task>

<task type="auto">
  <name>Task 2: Record the revisions and the phase-insertion decision in STATE.md</name>
  <files>.planning/STATE.md</files>
  <action>
Append to `.planning/STATE.md`, matching the file's existing bullet style (prose bullets, most
recent last within each list). Do not reformat, reorder, or rewrite any existing bullet, and do not
touch the YAML frontmatter, the Performance Metrics tables, or the Quick Tasks Completed table —
the orchestrator's own finalization owns those.

**Two bullets at the end of `### Decisions`** (after the existing `[Phase 3, Plan 12]` bullet):

  - [Impeccable 2026-09-08] The three surface briefs (`route-recipe.md`, `route-recipe-version.md`,
    `route-recipe-batch.md`) were revised 2026-09-08 after the whole-page critique (25/40,
    `.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md`) and confirmed by Mark
    2026-09-08. Headline decisions: **the imprint** — a front-matter band beside the headnote that
    takes every control out of the printed spread (openers, version strip, lineage line and
    show-changes toggle, churned date, batch list, and each pen's save ceremony), with the pen's
    save/cancel pair repeated at the foot of the page; **the binder** — every control drawn in ink
    at hairline weight, no fill, no radius, no icon, a disabled control keeping its label and going
    from solid stroke to dashed with its reason in words, a pressed or current state as outline plus
    weight; **the pen keeps the page** — prose fields render as printed paragraphs with the hairline
    outline appearing only on focus, a step's purpose and aside appear on demand behind "add a
    purpose"/"add an aside", and the uses list reads as one line of names with a "change" control
    that opens the twelve checkboxes for that step alone; **native date inputs** kept for their
    validation and keyboard entry with the calendar icon hidden, the browser's segment highlight a
    named exception to the four-colour system; **Escape** closes only an untouched pen, returning
    focus to its opener, and does nothing once the draft holds ink, so Cancel is the one exit.
  - [Impeccable 2026-09-08] `.claude/CLAUDE.md` gains an "Impeccable and GSD in sync" constraint:
    Impeccable evaluates and decides (writing `.impeccable/`, `DESIGN.md`, `PRODUCT.md`), every edit
    under the app workspace goes through a GSD command, and Impeccable's refine, enhance and fix
    commands describe work for `/gsd-quick`, `/gsd-quick-batch` or a phase plan rather than editing
    the workspace directly.

**One bullet at the end of `### Blockers/Concerns`**:

  - [Impeccable 2026-09-08 -> new phase between 3 and 4] The code work for these confirmed
    revisions is to be planned as a phase inserted between Phase 3 and Phase 4, not as quick tasks:
    the imprint (front-matter band, every control out of the spread, the save pair repeated at the
    foot), the binder's control treatment and its new `--focus-outline-width` token, the pen's
    printed-paragraph prose fields with purpose and aside on demand and the uses line, native date
    inputs with the calendar icon hidden, and Escape closing only an untouched pen. Briefs:
    `.impeccable/surfaces/route-recipe.md` (§ 3 the imprint, § 6 the binder and § 8 Controls),
    `route-recipe-version.md`, `route-recipe-batch.md`; critique snapshot
    `.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md` (25/40, three P1s).

Write each bullet as a single unwrapped line, as the surrounding bullets are — the indentation above
is for readability in this plan only.

Leave `.planning/STATE.md` modified and UNCOMMITTED. The orchestrator commits it together with the
Quick Tasks Completed row and the frontmatter update, matching the 260907-dyn precedent.
  </action>
  <verify>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -q 'Impeccable 2026-09-08' .planning/STATE.md && grep -q 'the imprint' .planning/STATE.md && grep -q 'Impeccable and GSD in sync' .planning/STATE.md && grep -q 'new phase between 3 and 4' .planning/STATE.md && ST=$(git status --short -- .planning/STATE.md) && printf '%s\n' "$ST" | grep -q '^ M' && NS=$(git diff --numstat -- .planning/STATE.md) && DEL=$(printf '%s\n' "$NS" | cut -f2) && test "$DEL" = "0"</automated>
  </verify>
  <done>STATE.md carries two new Decisions bullets and one new Blockers/Concerns bullet covering the five headline decisions, the CLAUDE.md rule, and the phase insertion; the diff is additions only (zero deleted lines); the file is modified and unstaged.</done>
</task>

</tasks>

<verification>
Docs-only task; no application test suite is in scope and none should be run.

1. `git show --name-only --format= HEAD` lists exactly the five scoped paths.
2. `git status --short` reports only ` M .planning/STATE.md` and `?? .planning/research/`.
3. `git diff --stat app/` is empty — the app workspace is untouched.
4. `git diff --numstat .planning/STATE.md` shows deletions of 0.
</verification>

<success_criteria>
- One commit at HEAD holding `.claude/CLAUDE.md`, the three surface briefs, and the 2026-09-08
  critique snapshot — five paths, nothing more.
- `.planning/research/` remains untracked; nothing under `app/` was staged, committed, or modified.
- STATE.md records the confirmed revisions, the five headline decisions, the new CLAUDE.md rule, and
  the decision to plan the code work as a phase between Phase 3 and Phase 4.
- STATE.md is left uncommitted for the orchestrator.
</success_criteria>

<output>
Create `.planning/quick/260908-eil-record-the-2026-09-08-impeccable-revisio/260908-eil-SUMMARY.md` when done.
</output>
