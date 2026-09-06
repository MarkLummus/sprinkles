---
phase: quick-260906-chn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - DESIGN.md
  - .impeccable/design.json
autonomous: true
requirements: [QUICK-260906-chn]

estimate:
  tokens: 12000
  raw_tokens: 8000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "`git log -1` on `main` is a docs commit containing exactly two files: `DESIGN.md` and `.impeccable/design.json`."
    - "The commit message ends with the `Co-Authored-By:` and `Claude-Session:` trailer lines, in that order, with `Claude-Session:` last."
    - "`git status --short -- DESIGN.md .impeccable/design.json` is empty after the commit — neither file is untracked or dirty."
    - "The unrelated dirty paths (`.planning/config.json`, `.planning/state.json`, `.gsd/`, `.impeccable/questions/`, `.planning/ui-reviews/`, `sprinkles-archive-context/`) are still uncommitted after the run."
    - "The content of `DESIGN.md` and `.impeccable/design.json` is byte-identical to what was in the working tree before the run."
  artifacts:
    - DESIGN.md
    - .impeccable/design.json
  key_links:
    - "Explicit-path staging (`git add -- <two paths>`) is the only thing standing between this commit and the six unrelated dirty paths; `git add -A`/`git add .`/`git commit -a` would sweep them all in."
    - "`git commit -F -` is the only message path that keeps the two trailers on adjacent lines; repeated `-m` flags insert a blank line between them and break the required ending."
---

<objective>
Commit the two design-documentation files that `/impeccable document` generated this session — `DESIGN.md` (project root) and `.impeccable/design.json` — as a single docs commit on `main`, without staging any of the other dirty paths in the working tree.

Purpose: the generated design record is finished and sitting untracked; it needs to be in history so later phases can cite it. Nothing about it is under review here.
Output: one commit on `main` containing exactly those two files, unmodified.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<constraints>
- **Do not edit either file.** They are finished output. No formatting, no lint pass, no trailing-newline fix, no reordering of `design.json` keys. If something in them looks wrong, note it in the SUMMARY and commit them as-is anyway.
- **Do not run the build or the test suite.** Both files live outside `app/` and change no code, no tests, no behaviour. There is nothing to build and nothing to test.
- **Never use `git add -A`, `git add .`, `git add -u`, or `git commit -a`.** Stage only the two named paths, explicitly, with `--`.
- The working tree also carries `.planning/config.json` (modified) and untracked `.gsd/`, `.impeccable/questions/`, `.planning/state.json`, `.planning/ui-reviews/`, `sprinkles-archive-context/`. All six must remain uncommitted.
- Work directly on the current branch, `main`. Do not create a branch or a worktree — isolation was already resolved to sequential-on-main by the orchestrator.
</constraints>

<tasks>

<task type="tracer">
  <name>Task 1: Stage exactly the two design files</name>
  <files>DESIGN.md, .impeccable/design.json</files>
  <precondition>`DESIGN.md` and `.impeccable/design.json` both exist in the working tree and are untracked (`git status --short` reports `??` for each). If either is already tracked, or either is missing, halt and report rather than staging.</precondition>
  <action>
Re-verify the live state first, because the plan's record of it is an observation from planning time, not a guarantee: run `git status --short -- DESIGN.md .impeccable/design.json` and confirm it reports both paths as untracked. Also confirm the current branch is `main` via `git branch --show-current`. If either check disagrees with the precondition, stop and report the actual state — do not stage.

Then stage the two files by explicit path and nothing else:

`git add -- DESIGN.md .impeccable/design.json`

The `--` separator is required so the paths are never interpreted as revisions. Do not pass any other path, and do not use a directory argument such as `.impeccable/` — that directory also holds `questions/`, which must stay out of this commit.

Do not touch the file contents at any point in this task.
  </action>
  <verify>
    <automated>STAGED=$(git diff --cached --name-only) && test "$(printf '%s\n' "$STAGED" | sort | tr '\n' ' ')" = '.impeccable/design.json DESIGN.md '</automated>
  </verify>
  <done>The staging area holds exactly two paths — `.impeccable/design.json` and `DESIGN.md` — and no others. Both files are unmodified relative to their pre-run content.</done>
</task>

<task type="auto">
  <name>Task 2: Commit with the required conventional subject and trailers</name>
  <files>DESIGN.md, .impeccable/design.json</files>
  <action>
Commit the staged pair. Use `git commit -F -` with a heredoc so the message is written verbatim — repeated `-m` flags would insert a blank line between the two trailers, which breaks the required ending:

```
git commit -F - <<'MSG'
docs(quick-260906-chn): add DESIGN.md and .impeccable/design.json

Generated by /impeccable document from the shipped tokens and components
in app/src/. Documentation only - no code, test, or behaviour change.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VzHjhq6xHm963k1dHqNTCK
MSG
```

The subject follows the conventional-commit-with-scope style already in this history (`docs(01): ...`). The final two lines are the required trailers and must be the last two non-empty lines of the message, in that order, with `Claude-Session:` last.

Do not amend, rebase, or push. Do not stage anything further after the commit.
  </action>
  <verify>
    <automated>FILES=$(git show --name-only --pretty=format: HEAD) && MSG=$(git log -1 --pretty=%B) && test "$(printf '%s\n' "$FILES" | sed '/^$/d' | sort | tr '\n' ' ')" = '.impeccable/design.json DESIGN.md ' && printf '%s\n' "$MSG" | grep -qF 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>' && test "$(printf '%s\n' "$MSG" | sed -e '/^[[:space:]]*$/d' | tail -1)" = 'Claude-Session: https://claude.ai/code/session_01VzHjhq6xHm963k1dHqNTCK' && test -z "$(git status --short -- DESIGN.md .impeccable/design.json)" && test -n "$(git status --short -- .planning/config.json .planning/state.json .gsd .impeccable/questions .planning/ui-reviews sprinkles-archive-context)"</automated>
  </verify>
  <done>HEAD is a commit touching exactly `DESIGN.md` and `.impeccable/design.json`; its message carries both required trailers with `Claude-Session:` as the final line; both files are clean in `git status`; and all six unrelated dirty paths are still uncommitted.</done>
</task>

</tasks>

<threat_model>
ASVS level 1, block-on threshold: high.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| working tree → git history | Content crossing here becomes permanent and, on any later push, publicly readable. This is the only boundary this task crosses. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-quick-260906-chn-01 | Information Disclosure | staging area (`git add`) | high | mitigate | Broad staging would sweep six unrelated dirty paths — including `.planning/state.json` and `sprinkles-archive-context/` — into permanent history. Mitigated by explicit two-path `git add -- ...`, a plan-level prohibition on `-A`/`.`/`-u`/`commit -a`, and a Task 1 gate asserting the staged set is exactly those two paths. |
| T-quick-260906-chn-02 | Information Disclosure | `.impeccable/design.json`, `DESIGN.md` contents | low | accept | Both are generated design documentation derived from `app/src/` tokens and components already in history — design tokens, component names, spacing scales. No credential, key, or personal-data surface. Accepted without a content scan. |
| T-quick-260906-chn-03 | Tampering | file contents at commit time | low | mitigate | An unrequested "cleanup" edit would silently alter the committed record. Mitigated by the no-edit constraint and by Task 1 staging before any other operation touches the files. |
| T-quick-260906-chn-SC | Tampering | npm/pip/cargo installs | n/a | n/a | No package-manager install in this task — no dependency is added, removed, or upgraded. The package-legitimacy gate does not apply and no RESEARCH.md audit table is required. |

## Planner contribution detectors

- **API coverage checkpoint:** not fired — this task integrates no external API, SDK, or service.
- **Assumption-delta checkpoint:** `detected: false` — no singular→plural, required→optional, or derived→chosen transition in scope.
- **Schema push gate:** skipped — no Payload/Prisma/Drizzle/Supabase/TypeORM schema files in scope.
</threat_model>

<verification>
1. `git log -1 --stat` shows one commit with two files changed and no others.
2. `git log -1 --pretty=%B` ends with the `Co-Authored-By:` line followed by the `Claude-Session:` line.
3. `git status --short` still lists `.planning/config.json` as modified and `.gsd/`, `.impeccable/questions/`, `.planning/state.json`, `.planning/ui-reviews/`, `sprinkles-archive-context/` as untracked.
4. `git show HEAD -- DESIGN.md | head -20` shows added lines only — no deletions, no modifications to pre-existing content.
</verification>

<success_criteria>
- Exactly one new commit exists on `main`.
- That commit contains exactly `DESIGN.md` and `.impeccable/design.json`, both added whole.
- Neither file's content was altered by this task.
- The commit message uses a docs-scoped conventional subject and ends with the two required trailer lines, `Claude-Session:` last.
- No unrelated path was staged, committed, or cleaned up.
- No build ran, no test ran, no push happened.
</success_criteria>

<output>
Create `.planning/quick/260906-chn-commit-the-two-design-files-written-by-i/260906-chn-SUMMARY.md` when done.
</output>
