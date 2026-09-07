---
phase: quick-260907-dyn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .impeccable/surfaces/route-recipe-version.md
  - .impeccable/surfaces/route-recipe.md
  - .planning/STATE.md
autonomous: true
requirements: [BRIEF-FOLLOWUP-2026-09-07]

estimate:
  tokens: 30000
  raw_tokens: 30000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "`git ls-files` lists `.impeccable/surfaces/route-recipe-version.md`, and its bytes are identical to the file Mark confirmed (sha256 6283d62085f3d487198011e5153f5ca5296d8eb761e72d3fe0a5e304b325c83e)."
    - "`route-recipe.md`'s Status line records the 2026-09-07 revision and names `route-recipe-version.md` as superseding its version-editing and comparison direction."
    - "Nothing in `route-recipe.md` any longer directs a builder to build the retired comparison sheet, its fade, or a layer-over-the-page implementation."
    - "§ 3's Versions bullet describes tracked changes — the parent's value struck in ink beside the current one, one version-level \"show changes\" control after save — and points at `route-recipe-version.md`."
    - "§ 7's inherited-notes item is still present and reads as decided in `route-recipe-version.md`, not deleted."
    - "`route-recipe.md` differs from its committed state on exactly five lines; the Direction contract section and every other section are untouched."
    - "STATE.md's Blockers/Concerns records the confirmed Phase 3 brief, the Phase 3 discussion inputs, the held objections for milestone 2, and the post-Phase-3 documenter re-run — with no Quick Tasks row added and Last activity unchanged."
  artifacts:
    - ".impeccable/surfaces/route-recipe-version.md — tracked by git, content byte-identical to the confirmed file."
    - ".impeccable/surfaces/route-recipe.md — five single-line replacements: Status, § 3 Versions, § 3 Implementation consequence, § 6 Feedback, § 7 open item."
    - ".planning/STATE.md — one Blockers bullet extended and three Blockers bullets added; left uncommitted for the orchestrator."
  key_links:
    - "route-recipe.md § 3 -> route-recipe-version.md by filename, so a Phase 3 planner who follows the recipe brief lands on the confirmed brief instead of building the retired sheet."
    - "STATE.md Blockers/Concerns -> .impeccable/surfaces/route-recipe-version.md, so /gsd-discuss-phase 3 finds the prerequisite without searching for it."
    - "The new [Phase 3 input] bullet -> the existing partly-marked-tasting bullet immediately above it, by reference, so that question is listed exactly once."
---

<objective>
Land the confirmed Phase 3 surface brief in git, and stop the recipe brief from directing a builder
to the comparison direction it superseded.

`.impeccable/surfaces/route-recipe-version.md` ("Developing the next version") was shaped and
confirmed by Mark on 2026-09-07 and is still untracked. Its own "Follow-ups this brief creates"
section names exactly this task: revise `route-recipe.md` § 3 and § 6 to retire the old comparison
direction and point here, and record the brief in `STATE.md`.

Purpose: `/gsd-discuss-phase 3` must open on one brief, not two that disagree. Today `route-recipe.md`
still tells a builder to lay a sheet over the page and fade it in; the confirmed direction is tracked
changes in ink, in place.
Output: the new brief tracked, five surgical lines changed in the recipe brief, one commit carrying
both, and four recorded facts in STATE.md left uncommitted for the orchestrator.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.impeccable/surfaces/route-recipe-version.md
@.impeccable/surfaces/route-recipe.md
</context>

<locked_decisions>
Confirmed by Mark in the Impeccable shape session on 2026-09-07. Locked — do not revisit, do not
extend, do not improve adjacent prose.

- **D-01 The new brief is confirmed and final.** `.impeccable/surfaces/route-recipe-version.md` is
  complete and already marked confirmed. It is committed as-is. Not one byte of it changes in this
  task.
- **D-02 The recipe brief is revised minimally, in five places only.** Status line, § 3 Versions
  bullet, § 3 Implementation consequence clause, § 6 Feedback bullet, § 7 open item. The Direction
  contract section is not touched. Nothing else is touched — not spelling, not spacing, not an
  adjacent sentence that could read better.
- **D-03 The old comparison direction is retired, not deleted from history.** § 3 says it is retired
  and dated to Mark, 2026-09-07; § 7's inherited-notes item is marked as decided elsewhere rather
  than removed. A reader of the recipe brief must be able to see that a decision was made, not find
  a hole where one used to be.
- **D-04 Two commits' worth of work, one commit.** The two `.impeccable/surfaces/` files go in a
  single commit. STATE.md stays uncommitted — the orchestrator commits docs artifacts and owns the
  Quick Tasks row and the Last activity line.
- **D-05 Style is inherited, not invented.** The Status line follows the batch brief's precedent
  (semicolon-separated clauses appended in date order). Bullets keep the file's existing voice.
</locked_decisions>

<tasks>

<task type="auto">
  <name>Task 1: Retire the overlay direction in the recipe brief, in five lines</name>
  <files>.impeccable/surfaces/route-recipe.md</files>
  <precondition>`.impeccable/surfaces/route-recipe-version.md` exists on disk, untracked, with sha256 `6283d62085f3d487198011e5153f5ca5296d8eb761e72d3fe0a5e304b325c83e`. This task must not modify it (D-01).</precondition>
  <read_first>
    Read `.impeccable/surfaces/route-recipe.md` once, in full, before editing. It is 138 lines; one
    Read is enough. The five target lines are 10, 44, 49, 82 and 101 as the file stands now — use the
    quoted anchors below rather than the line numbers if they have drifted.
  </read_first>
  <action>
Make exactly five single-line replacements in `.impeccable/surfaces/route-recipe.md`. Each is a whole
line swapped for a whole line. Do not reflow, do not rewrap, do not touch any other line, and do not
touch the `## Direction contract` section at all (D-02).

**1. The Status line** (the `**Mode:** Operate, both halves.` paragraph). Append one clause to the
`**Status:**` run, after `confirmed by Mark 2026-09-05`, matching the batch brief's precedent of
semicolon-separated clauses in date order (D-05). The line becomes exactly:

`**Mode:** Operate, both halves. **Status:** shaped 2026-09-05; confirmed by Mark 2026-09-05; revised 2026-09-07: the version-editing and comparison direction is superseded by \`route-recipe-version.md\` (confirmed by Mark 2026-09-07). **Targets:** \`route:/recipe\` (review, version editing, comparison) and \`route:/print/recipe-sheet\` (the bench sheet). The batch-capture flow is a separate brief (GSD Phase 2). This brief feeds GSD Phases 1, 3, and 4.`

**2. § 3's `- **Versions.**` bullet** — the one whose second sentence today describes per-row deltas
carried on a comparison sheet. Replace the whole bullet with exactly:

`- **Versions.** Version 2 reads clean. Changes read as tracked changes: the parent's value struck in ink beside the current one, always visible while the pen is open and laid back on the page by one version-level "show changes" control after save; the translucent sheet is retired (Mark, 2026-09-07). Every version stays reachable in one strip under the headnote. The full direction is in \`route-recipe-version.md\`.`

**3. § 3's `- **Implementation consequence.**` bullet.** Rewrite only its third semicolon-separated
clause — the one that today says the comparison layer sits over the same page rather than being a
route — so the whole bullet reads exactly:

`- **Implementation consequence.** Screen and sheet render from one component tree with print CSS reflowing the spread; no component may carry status by colour; show-changes is a state of the same page, not a route; printing captures a saved version and never the live DOM.`

**4. § 6 "Interaction and layout", the `- **Feedback:**` bullet.** Delete its third
semicolon-separated clause — the one naming the comparison layer's fade — together with its trailing
`; `, so the bullet reads exactly:

`- **Feedback:** figures recompute live and state their deviation in words; nothing moves on selection or hover; no entrance motion.`

**5. § 7 "Open, to decide during build, not to be invented silently", the authored-notes item.** Do
not delete it (D-03); mark it decided. No prior "decided" marker pattern exists in these briefs, so
use the plain append. The line becomes exactly:

`- Whether authored notes copy into a child version by default or by explicit choice (the binder's Mexican Chocolate v3 shows the failure mode of silent copying) — decided in \`route-recipe-version.md\` (2026-09-07): they copy with a persistent "from …" marker until edited on the child.`

The `…` is a single U+2026 horizontal-ellipsis character, matching the file's existing use of `—`
and `·`. Write the file as UTF-8.

Do not stage or commit anything in this task — Task 2 owns the commit.
  </action>
  <verify>
    <automated>test "$(git -C /Users/mark/Documents/projects/sprinkles diff --numstat -- .impeccable/surfaces/route-recipe.md | awk '{print $1"/"$2}')" = "5/5" && test "$(grep -cF 'revised 2026-09-07: the version-editing and comparison direction is superseded by `route-recipe-version.md`' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 1 && test "$(grep -cF 'the translucent sheet is retired (Mark, 2026-09-07)' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 1 && test "$(grep -cF 'The full direction is in `route-recipe-version.md`.' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 1 && test "$(grep -cF 'show-changes is a state of the same page, not a route' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 1 && test "$(grep -cF 'nothing moves on selection or hover; no entrance motion.' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 1 && test "$(grep -cF 'decided in `route-recipe-version.md` (2026-09-07)' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 1 && test "$(grep -cF 'translucent sheet over the page' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 0 && test "$(grep -cF 'overlay fades' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 0 && test "$(grep -cF 'overlay is a layer' /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe.md)" = 0 && test "$(shasum -a 256 /Users/mark/Documents/projects/sprinkles/.impeccable/surfaces/route-recipe-version.md | cut -d' ' -f1)" = 6283d62085f3d487198011e5153f5ca5296d8eb761e72d3fe0a5e304b325c83e</automated>
  </verify>
  <done>
`route-recipe.md` differs from HEAD on exactly five lines (5 added, 5 removed — proving the Direction
contract and every other section are untouched). All six new phrases are present, the three retired
phrasings are gone, and `route-recipe-version.md` still hashes to the confirmed file.
  </done>
</task>

<task type="auto">
  <name>Task 2: Commit the confirmed brief and the retired overlay together</name>
  <files>.impeccable/surfaces/route-recipe-version.md, .impeccable/surfaces/route-recipe.md</files>
  <action>
Stage exactly the two named files by explicit path — never `git add -A`, never `git add .`, never a
directory path. `.impeccable/questions/` is untracked and must stay untracked; `.planning/STATE.md`
must stay uncommitted (D-04).

Commit with this subject line verbatim:

`docs(260907-dyn): confirm the Phase 3 surface brief and retire the recipe brief's overlay`

A short body is optional; if written, it says only what changed (the brief confirmed 2026-09-07 by
Mark is now tracked; the recipe brief's version-editing and comparison direction now points at it).
The commit message must end with these two trailer lines, verbatim, as the last two lines:

```
Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VzHjhq6xHm963k1dHqNTCK
```

Do not amend, do not rebase, do not tag.
  </action>
  <verify>
    <automated>git -C /Users/mark/Documents/projects/sprinkles ls-files --error-unmatch .impeccable/surfaces/route-recipe-version.md && test "$(git -C /Users/mark/Documents/projects/sprinkles show --numstat --format= HEAD | wc -l | tr -d ' ')" = 2 && test "$(git -C /Users/mark/Documents/projects/sprinkles show --numstat --format= HEAD -- .impeccable/surfaces/route-recipe.md | awk '{print $1"/"$2}')" = "5/5" && test "$(git -C /Users/mark/Documents/projects/sprinkles status --porcelain .impeccable/surfaces | wc -l | tr -d ' ')" = 0 && test "$(git -C /Users/mark/Documents/projects/sprinkles show -s --format=%s HEAD)" = "docs(260907-dyn): confirm the Phase 3 surface brief and retire the recipe brief's overlay" && test "$(git -C /Users/mark/Documents/projects/sprinkles show -s --format=%B HEAD | grep -cF 'Claude-Session: https://claude.ai/code/session_01VzHjhq6xHm963k1dHqNTCK')" = 1 && test "$(git -C /Users/mark/Documents/projects/sprinkles show -s --format=%B HEAD | grep -cF 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>')" = 1 && test "$(git -C /Users/mark/Documents/projects/sprinkles show HEAD:.impeccable/surfaces/route-recipe-version.md | shasum -a 256 | cut -d' ' -f1)" = 6283d62085f3d487198011e5153f5ca5296d8eb761e72d3fe0a5e304b325c83e && test "$(git -C /Users/mark/Documents/projects/sprinkles show --numstat --format= HEAD -- .planning/STATE.md | wc -l | tr -d ' ')" = 0</automated>
  </verify>
  <done>
HEAD carries exactly two files: the new brief added with the confirmed hash intact, and the recipe
brief changed on five lines. `.impeccable/surfaces` is clean. `.impeccable/questions/` is still
untracked and STATE.md is still uncommitted. Both trailers are present.
  </done>
</task>

<task type="auto">
  <name>Task 3: Record the confirmed brief and its Phase 3 inputs in STATE.md</name>
  <files>.planning/STATE.md</files>
  <action>
Four changes, all inside `### Blockers/Concerns`. Touch nothing else in the file: not the frontmatter,
not `last_updated`, not `Last activity`, not the Quick Tasks Completed table — the orchestrator owns
those (D-04).

**1. Extend the existing first bullet.** The bullet beginning `- Impeccable initialized 2026-09-05:`
currently ends `…so the Phase 2 prerequisite is met.` Append one sentence to that same bullet, on the
same line:

` The Phase 3 brief is confirmed: \`.impeccable/surfaces/route-recipe-version.md\` ("Developing the next version"), shaped and confirmed by Mark 2026-09-07, so the Phase 3 prerequisite is met.`

**2–4. Insert three new bullets** immediately after the existing `- [Phase 3 input] The UI review
asks whether a tasting saved with some axes marked…` bullet and immediately before the
`- [Housekeeping]` bullet, in this order:

`- [Phase 3 input] \`.impeccable/surfaces/route-recipe-version.md\` leaves five things to the Phase 3 discussion, not to a builder: the label of the control that opens the pen ("Develop the next version" is the working name); whether the show-changes state is URL-addressable; whether a fifth advisory, the batch mass against the machine's minimum fill, joins the four FORM2-02 advisories; the partly marked tasting question in the bullet above; and the store's schema move and what a schemaVersion 2 export does when imported after it.`

`- [Milestone 2 backlog, Mark 2026-09-07] Held objections from the Phase 3 shaping, recorded rather than dropped: editing target bands; adding a step; adding a row from the seed library (needs REQUIREMENTS.md's twelve-row limit lifted).`

`- [After Phase 3, Impeccable-owned] Re-run \`/impeccable document\` so \`DESIGN.md\` records the pen layer's components from Phases 2 and 3 together (field, strike, marks control, button, hollow tick, show-changes control) and the Strike Rule; \`DESIGN.md\` still says pen blue is unused on screen and no input exists.`

The partly marked tasting question is referenced, never restated — it already has its own bullet
directly above and must not appear twice.

Leave STATE.md staged-free and uncommitted. Do not run `git add` or `git commit` in this task.
  </action>
  <verify>
    <automated>test "$(git -C /Users/mark/Documents/projects/sprinkles diff --numstat -- .planning/STATE.md | awk '{print $1"/"$2}')" = "4/1" && test "$(grep -cF 'The Phase 3 brief is confirmed: `.impeccable/surfaces/route-recipe-version.md`' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(grep -cF 'so the Phase 3 prerequisite is met.' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(grep -cF 'leaves five things to the Phase 3 discussion' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(grep -cF '[Milestone 2 backlog, Mark 2026-09-07]' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(grep -cF '[After Phase 3, Impeccable-owned]' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(grep -cF 'twelve-row limit lifted' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(grep -cF 'axes marked and others unmarked is incomplete' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(grep -c '^| 260907-dyn' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 0 && test "$(grep -cF 'Last activity: 2026-09-06 - Completed quick task 260906-w9g' /Users/mark/Documents/projects/sprinkles/.planning/STATE.md)" = 1 && test "$(git -C /Users/mark/Documents/projects/sprinkles diff --cached --name-only -- .planning/STATE.md | wc -l | tr -d ' ')" = 0</automated>
  </verify>
  <done>
STATE.md shows 4 added lines and 1 removed (the extended bullet plus three new ones) and nothing
else. The Phase 3 brief is named with its path, the five discussion inputs are listed once, the held
objections and the documenter re-run are recorded. No Quick Tasks row was added, Last activity still
names 260906-w9g, and STATE.md is unstaged and uncommitted.
  </done>
</task>

</tasks>

<source_coverage_audit>

All five task facts confirmed by Mark on 2026-09-07 map to a task. No item is deferred, simplified,
or reduced.

| # | Source item (task facts, Impeccable shape session 2026-09-07) | Covered by | Status |
|---|---|---|---|
| 1 | `route-recipe-version.md` is the confirmed Phase 3 brief; commit as-is, do not edit | Task 1 precondition + hash gate, Task 2 commit + blob hash gate | COVERED |
| 2a | Status line gains the 2026-09-07 supersession clause | Task 1 edit 1 | COVERED |
| 2b | § 3 Versions bullet: tracked changes, sheet retired, points at the new brief | Task 1 edit 2 | COVERED |
| 2c | § 3 Implementation consequence: show-changes is a state, not a route | Task 1 edit 3 | COVERED |
| 2d | § 6 Feedback bullet: the fade clause removed | Task 1 edit 4 | COVERED |
| 2e | § 7 authored-notes item marked decided, not deleted (no prior marker pattern exists → plain append) | Task 1 edit 5 | COVERED |
| 2f | Direction contract and everything else untouched | Task 1 `5/5` numstat gate | COVERED |
| 3a | STATE.md first Blockers bullet gains the Phase 3 confirmation sentence | Task 3 change 1 | COVERED |
| 3b | New `[Phase 3 input]` bullet; tasting question folded by reference, not duplicated | Task 3 change 2 | COVERED |
| 3c | New `[Milestone 2 backlog, Mark 2026-09-07]` bullet | Task 3 change 3 | COVERED |
| 3d | New `[After Phase 3, Impeccable-owned]` bullet | Task 3 change 4 | COVERED |
| 3e | No Quick Tasks row, no Last activity change | Task 3 negative gates | COVERED |
| 4 | One commit for the two surface files, with both trailers; STATE.md uncommitted | Task 2 | COVERED |
| 5 | grep gates on new and retired phrases; `git status` shows the brief tracked | Task 1 + Task 2 verify | COVERED |

**Resolved ambiguity, recorded rather than decided silently:** fact 5 asks that the retired phrases
not appear "outside the Status line", while fact 2b requires § 3 to state that the sheet is retired.
The gates therefore target the retired *directives* — the sheet-over-the-page phrasing, the fade
clause, and the layer-not-a-route clause — and permit the § 3 sentence that records the retirement.
This is what fact 2b asks for; no directive survives.

**Prior-pattern check (fact 2e):** `grep -rn "D-21"` across `.impeccable/` and `.planning/` returns
nothing, and no "decided" marker pattern exists on any item in `.impeccable/surfaces/*.md`. The
conditional in fact 2e therefore resolves to its stated fallback: append
`— decided in \`route-recipe-version.md\` (2026-09-07)`.

</source_coverage_audit>

<threat_model>
## Trust Boundaries

This change is documentation-only: three markdown files under `.impeccable/surfaces/` and
`.planning/`. No code path, no runtime input, no network call, no dependency, and no ORM schema is
touched. `app/` is not modified. No trust boundary in the running product is crossed, so the STRIDE
register is trivially empty of product threats.

| Boundary | Description |
|----------|-------------|
| working tree → git history | the only boundary this task crosses: content becomes permanent and shareable once committed |

## STRIDE Threat Register

ASVS level 1; blocking threshold `high`. No threat here reaches `high`.

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260907-dyn-01 | Information disclosure | `git add` scope in Task 2 | low | mitigate | Stage the two files by explicit path only; `git add -A`, `git add .` and directory paths are forbidden. A verify gate asserts HEAD contains exactly 2 files, that `.impeccable/questions/` stays untracked, and that STATE.md stays uncommitted. |
| T-260907-dyn-02 | Tampering | `.impeccable/surfaces/route-recipe-version.md` | low | mitigate | The confirmed brief must reach git unaltered. A sha256 gate runs on the working-tree file in Task 1 and on the committed blob in Task 2. |
| T-260907-dyn-03 | Tampering | `.impeccable/surfaces/route-recipe.md` scope creep | low | mitigate | A `5/5` numstat gate proves exactly five lines changed, so the Direction contract cannot drift under an unrelated edit. |

**Package legitimacy:** no `npm`, `pip` or `cargo` install task exists in this plan, so the package
legitimacy gate does not apply and no `T-{phase}-SC` row is required.

**API coverage decision checkpoint:** documentation-only change; the detector reports
`detected:false` and no API matrix is fabricated.

**Assumption-delta architecture checkpoint:** advisory only; this quick task has no ROADMAP phase
section, so the scan reports `skipped` and nothing is raised.

**Schema push detection gate:** no ORM schema files are in scope; skipped.
</threat_model>

<verification>
Run from the repo root after all three tasks:

1. `git -C /Users/mark/Documents/projects/sprinkles show --numstat --format= HEAD` — exactly two
   files; `route-recipe-version.md` added whole, `route-recipe.md` at `5 5`.
2. `grep -nF 'translucent sheet over the page' .impeccable/surfaces/route-recipe.md` — no match.
   Same for `overlay fades` and `overlay is a layer`.
3. `git -C /Users/mark/Documents/projects/sprinkles diff --numstat -- .planning/STATE.md` — `4 1`,
   and STATE.md is unstaged.
4. `git -C /Users/mark/Documents/projects/sprinkles status --porcelain` — `.impeccable/questions/`
   still untracked; nothing else unexpected staged.
</verification>

<success_criteria>
- The confirmed Phase 3 brief is tracked in git with its bytes intact (sha256
  `6283d620…`), inside a commit carrying both required trailers.
- `route-recipe.md` no longer directs a builder to build the retired comparison sheet, its fade, or
  a layer-over-the-page implementation, and § 3 points a reader at `route-recipe-version.md` by name.
- `route-recipe.md` changed on exactly five lines; the Direction contract section is byte-identical.
- STATE.md's Blockers/Concerns names the confirmed brief and its path, lists the Phase 3 discussion
  inputs once each, and records the milestone-2 held objections and the post-Phase-3 documenter
  re-run — with the Quick Tasks table and Last activity left for the orchestrator.
</success_criteria>

<output>
Create `.planning/quick/260907-dyn-commit-the-confirmed-phase-3-surface-bri/260907-dyn-SUMMARY.md` when done.
</output>
