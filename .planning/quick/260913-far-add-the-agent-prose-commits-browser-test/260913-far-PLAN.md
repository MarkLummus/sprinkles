---
phase: quick-260913-far
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/CLAUDE.md
autonomous: true
requirements: [AGENT-PROSE-ENGLISH]
user_setup: []

estimate:
  tokens: 6000
  raw_tokens: 6000
  tasks: 1
  confidence: low

must_haves:
  truths:
    - "The Conventions section of .claude/CLAUDE.md carries one added bullet pinning agent-facing prose, git commit messages, and browser-test input values to English — one line, in the existing bullets' statement — rationale style."
    - "The bullet covers what GSD's response_language config key does not; no text in the file duplicates or restates the config setting."
    - "No other section of .claude/CLAUDE.md and no other file changed: the working-tree diff is exactly one insertion, zero deletions, in one file."
  artifacts:
    - .claude/CLAUDE.md
  key_links:
    - "the new bullet -> the four existing convention bullets: same section, same one-line style, so agent readers meet one conventions list"
---

<objective>
Add one bullet to `.claude/CLAUDE.md`'s Conventions section recording the language convention
this project adopts as of 2026-09-13: agent-facing prose, git commit messages, and
browser-test input values are English.

Purpose: GSD's `response_language: "en"` pins workflow narration only. During agent runs the
unpinned surfaces drifted (GLM runs wrote executor prose, commit messages, and browser-verification
sample values in other languages), so the convention is now pinned in the file agents actually read.

Output: one bullet appended to the GSD-managed Conventions block of `.claude/CLAUDE.md`. Nothing else.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.claude/CLAUDE.md
@.planning/STATE.md
</context>

<interface_context>
Facts established by reading the sources before planning — treat these as given, do not
re-derive them:

- The edit target is `.claude/CLAUDE.md` (the GSD delivery record), NOT the root `CLAUDE.md`.
  The root file has no Conventions section and is out of scope.
- The Conventions section sits inside a GSD-managed block: `<!-- GSD:conventions-start
  source:CONVENTIONS.md -->` at line 38 through `<!-- GSD:conventions-end -->` at line 46.
  The cited source `.planning/CONVENTIONS.md` does not exist anywhere in the repo (verified:
  no CONVENTIONS.md under `.planning/` or `.claude/`), so the generated block is the only
  copy — a direct edit there is the durable edit. Editing only a source file would be wrong;
  there is no source file.
- The section holds exactly four bullets today (lines 42-45), each one line in
  statement — rationale style with a spaced em dash, ending in a period:
  domain-math modules, repository seam, CSS custom properties, prose-as-text. The new bullet
  becomes the fifth, after line 45 and before the end marker on line 46.
- The `## Conventions` heading in `.claude/CLAUDE.md` is about agent/repo conventions. The
  Project section's "**Language**" constraint ("Familiar words by default... (D11); open labels
  stay open (D12)") governs product UI language — a different topic. Do not touch it.
- The exact bullet content is fixed by the task directive (the orchestrator's decision record):
  the three surfaces are agent-facing prose, git commit messages, and browser-test input
  values; the predicate is "are English"; the motivation is language drift in agent runs.
- The stale "No project skills found" line in the skills block is pre-existing and unrelated —
  leave it (surgical-changes rule).
</interface_context>

<tasks>

<task type="auto">
  <name>Task 1: Pin agent prose, commit messages, and browser-test inputs to English in the Conventions section</name>
  <files>.claude/CLAUDE.md</files>
  <read_first>.claude/CLAUDE.md lines 38-46 (the GSD:conventions managed block — the four existing bullets whose style this matches, and the end marker the insertion goes before)</read_first>
  <action>
    In `.claude/CLAUDE.md`, inside the GSD-managed Conventions block (between
    `<!-- GSD:conventions-start source:CONVENTIONS.md -->` and `<!-- GSD:conventions-end -->`),
    append exactly one bullet as the fifth list item, immediately after the
    prose-as-text bullet ("Notes and prose render as text, never as markup — no
    `dangerouslySetInnerHTML` anywhere under `app/src`.") and immediately before the
    `<!-- GSD:conventions-end -->` marker. Use Edit, not Write — every other byte of the file
    stays identical.

    The bullet, verbatim:

    - Agent-facing prose, git commit messages, and browser-test input values are English — pinned against language drift in agent runs.

    Match the existing bullets: one line, a spaced em dash before the rationale, terminal
    period, no terminal list marker. The wording is fixed by the task directive — the three
    surfaces named explicitly, the predicate "are English" — because the verify gate greps this
    exact phrase. Do not restate or mention GSD's `response_language` config: this bullet exists
    to pin what that config key does not (per the orchestrator's decision record). Add no other
    section, no reformatting, no trailing prose, no date stamp — the convention itself is what
    lives in the file; the when and why are this task's and SUMMARY's to record.
  </action>
  <verify>
    <automated>B="Agent-facing prose, git commit messages, and browser-test input values are English"; grep -qF -- "$B" .claude/CLAUDE.md || { echo "MISSING BULLET"; exit 1; }; awk '/GSD:conventions-start/,/GSD:conventions-end/' .claude/CLAUDE.md | grep -qF -- "$B" || { echo "BULLET OUTSIDE CONVENTIONS BLOCK"; exit 1; }; [ "$(git diff --numstat -- .claude/CLAUDE.md | awk '{print $1, $2}')" = "1 0" ] || { echo "UNEXPECTED DIFF"; git diff --numstat -- .claude/CLAUDE.md; exit 1; }; ST="$(git status --porcelain)" || { echo "GIT FAILED"; exit 1; }; [ -z "$(printf '%s\n' "$ST" | grep -v 'CLAUDE.md')" ] && echo BULLET-OK || { echo "OTHER FILES TOUCHED"; printf '%s\n' "$ST"; exit 1; }</automated>
  </verify>
  <done>The Conventions section of `.claude/CLAUDE.md` carries the new English bullet as its fifth item, sitting between the prose-as-text bullet and the GSD:conventions-end marker; the grep gate prints BULLET-OK (bullet present, inside the managed block, exactly one insertion and zero deletions, no other file touched); `response_language` appears nowhere in the file.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (none new) | Documentation only: one bullet in an agent-facing instruction file. No code, no handler, no store read/write, no network path, no untrusted input. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-FAR1-01 | Tampering | the Conventions bullet's wording | low | mitigate | The task prescribes the bullet verbatim and the verify gate greps the full three-surface head phrase and proves it sits inside the managed conventions block, so a paraphrase that drops a surface or drifts fails the run |
| T-FAR1-02 | Tampering | the surrounding CLAUDE.md sections | low | mitigate | The numstat gate demands exactly one insertion and zero deletions and the porcelain gate forbids any other modified file, so reformatting or out-of-section edits fail the run |
| T-FAR1-SC | Tampering | package installs | high | mitigate | No package installs occur in this plan — no npm/pip/cargo dependency is added or updated, so the package-legitimacy gate has nothing to check |

(No information disclosure, denial-of-service, elevation, or repudiation surface exists in scope: the change writes one markdown bullet. Security enforcement active at ASVS level 1, block-on high — nothing here crosses a trust boundary or handles untrusted input.)
</threat_model>

<verification>
- The grep gate prints BULLET-OK: the full three-surface bullet head is present, inside the GSD:conventions managed block.
- The diff gate confirms exactly one insertion, zero deletions, in `.claude/CLAUDE.md` alone.
- The bullet does not mention `response_language`; the three surfaces (agent-facing prose, git commit messages, browser-test input values) are each named in the bullet.
- The four pre-existing convention bullets, the managed-block markers, and every other section of the file are byte-identical to before.
</verification>

<success_criteria>
- `.claude/CLAUDE.md`'s Conventions section reads with five bullets, the fifth pinning agent-facing prose, git commit messages, and browser-test input values to English, in the established one-line statement — rationale style.
- Nothing else changed in the file or the repo.
</success_criteria>

<output>
Create `.planning/quick/260913-far-add-the-agent-prose-commits-browser-test/260913-far-SUMMARY.md` when done
</output>