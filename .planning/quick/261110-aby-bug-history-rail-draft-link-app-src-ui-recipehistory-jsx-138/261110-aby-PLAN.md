---
phase: quick-261110-aby
plan: 01
quick_id: 261110-aby
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/RecipeHistory.jsx
  - app/src/ui/RecipeHistory.test.jsx
autonomous: true
requirements:
  - bug-history-rail-draft-link

must_haves:
  truths:
    - "From 1366 (the horizontal History rail, belowDesktop false), a waiting Next version draft kept on another version of this recipe draws as plain text: its node is the span with class notebook-history__node-inner and no aria-current, and the rail carries no href to notebookPath(recipeId, 'draft'). Saved versions not in view stay Links with tabIndex 0 and state focusVersion, exactly as before."
    - "The horizontal branch's span-or-Link test reads the same three conditions as the upright branch (RecipeHistory.jsx about line 104): in view, the draft node, or any pen open."
    - "Below 1366 (UprightRail) nothing changes: its draft node was already plain text."
    - "The waiting-draft test in RecipeHistory.test.jsx (about lines 168-181) fails against the unfixed component at planning HEAD 4e678dfa and passes with the fix. It counts the anchor tags (exactly one, to /notebook/recipe-1/v1), forbids the draft href, and checks that the draft node renders as the node-inner span, in both arrangements. The old negative assertion (the name followed by a closing anchor tag), which could never match because the name closes with a span, is gone."
    - "npm --prefix app test passes: 131 files and 4316 tests at planning HEAD 4e678dfa. One test is rewritten and none are added or deleted, so the count stays the same unless a sibling item merged first."
  artifacts:
    - path: app/src/ui/RecipeHistory.jsx
      provides: "The horizontal rail draws the draft node as plain text"
      contains: "entry.inView || entry.isDraft || openPen ? ("
    - path: app/src/ui/RecipeHistory.test.jsx
      provides: "A waiting-draft test that fails without the fix"
      contains: 'href="/notebook/recipe-1/draft"'
  key_links:
    - from: app/src/ui/RecipeHistory.jsx
      to: app/src/domain/historyRail.js
      via: "railEntries sets isDraft true on the draft entry (historyRail.js about line 78); the horizontal branch now reads it, as the upright branch already did"
      pattern: "entry\\.isDraft"
---

<objective>
Fix bug-history-rail-draft-link (Mark approved it on Mark's List). On the wide History rail (1366 and up), a waiting Next version draft node is drawn as a Link to notebookPath(recipeId, 'draft'), a version id no stored version has. The upright rail already draws it as plain text. Make the wide rail do the same, and replace the vacuous test with one that fails without the fix.

Purpose: a maker who taps the draft node on the iPad rail lands on a route with no version behind it. The draft is reached through Next version, not through History.
Output: a rewritten test (committed first, red), then a one-condition fix (green). Two commits, both naming bug-history-rail-draft-link.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/RecipeHistory.jsx
@app/src/ui/RecipeHistory.test.jsx

Facts read at planning HEAD 4e678dfa:
- RecipeHistory.jsx about line 104 (upright branch): `to` is null when the entry is in view, is the draft, or any pen is open.
- RecipeHistory.jsx about line 138 (horizontal branch): the span-or-Link ternary tests only the in-view flag and openPen, so the draft node (id 'draft', inView false, isDraft true from app/src/domain/historyRail.js about lines 70-78) falls through to the Link with no pen open.
- Probe at planning, rendering versions [v1, v2] with currentVersionId 'v2', openPen null and waitingDraft { label '40 g oil', createdAt '2026-10-09T10:00:00.000Z' }: belowDesktop false gives two anchor tags, to /notebook/recipe-1/v1 and /notebook/recipe-1/draft, and the second wraps the draft node's date, mark, name span and state span. belowDesktop true gives one anchor, to v1.
- The current test's last assertion looks for the draft name followed by a closing anchor tag. The name always closes with a span and the state span follows, so the assertion passes whether or not the node is a link.
- .notebook-history__node-inner (app/src/styles/notebook.css about line 1150) styles the class on either element. The in-view node and every node under an open pen are already this span, so no CSS changes.
- Baselines: RecipeHistory.test.jsx has 19 tests and all pass. The full suite has 131 files and 4316 tests and all pass.
- No sibling item in this batch touches RecipeHistory.jsx or its test.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Wide History rail's waiting draft node is plain text (failing test first, then the fix)</name>
  <files>app/src/ui/RecipeHistory.test.jsx, app/src/ui/RecipeHistory.jsx</files>
  <behavior>
    - Fixture: versions [root, successor], currentVersionId 'v2', allBatches [], openPen null, waitingDraft { label '40 g oil', createdAt '2026-10-09T10:00:00.000Z' }.
    - For belowDesktop false, then true: the markup holds '3 versions', 'Version 3 · 40 g oil' and '9 Oct'. Its anchor opening tags (the existing /<a\b[^>]*>/g match) number exactly 1, and that one carries href="/notebook/recipe-1/v1". The markup holds no href="/notebook/recipe-1/draft".
    - For belowDesktop false only: the markup holds '>draft<'. The draft node (from the last '<li' before 'Version 3 · 40 g oil' up to the next '</li>') contains '<span class="notebook-history__node-inner">' and no '<a '.
    - Against the unfixed component the belowDesktop false pass fails (2 anchors). The belowDesktop true pass would pass.
  </behavior>
  <action>
Constraints for the whole task: do not start vite dev or vite preview, and do not build into app/dist (Mark deploys main by hand). Stage only with git add of explicit paths, never -A, because untracked .review-diagnostics and quick-batches folders sit under .planning. Do not commit this PLAN or the SUMMARY. Commit messages are English. Each message is the subject line, a blank line, then these two attribution lines:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VWwTRRYFSwKmysy7Vh6Ai1

Step 0. Run `mkdir -p /private/tmp/sprinkles-261110-aby`. The RED output and both commit SHAs go there, and the verify reads them so the commits are pinned by SHA, not by HEAD offsets.

Step 1, RED. In app/src/ui/RecipeHistory.test.jsx, rewrite the single test titled "draws a waiting draft as the rail’s draft node with no pen open: no link, and the count includes it" (about lines 168-181) so it asserts the behavior block above. Keep its place in the describe block and its fixture (the same versions, currentVersionId, allBatches, openPen null and waitingDraft label and date). Loop over belowDesktop false first, then true, so the failure message names the wide arrangement. Rename it to say plain text, not a link, in either arrangement, with the count including it. Delete the old negative assertion on the name followed by a closing anchor tag; the anchor count, the forbidden draft href and the span check replace it. Do not quote that old assertion in a comment. In the comment above the test (about lines 165-167), add one short clause saying the draft node is plain text on both rails (bug-history-rail-draft-link). Leave the other 18 tests and the helpers as they are.
Run `npm --prefix app test -- RecipeHistory > /private/tmp/sprinkles-261110-aby/red.txt 2>&1`. It exits non-zero. Read red.txt: expect 1 failed and 18 passed, with the failure in the belowDesktop false pass (2 anchor tags where 1 is expected). If the rewritten test passes against the unfixed component, it is still vacuous. Fix the test, never the component, and re-run into red.txt before going on. Copy the failure's assertion line into the SUMMARY.
Commit the test file alone: `git add app/src/ui/RecipeHistory.test.jsx`, subject "test(261110-aby): a waiting draft on the wide History rail is pinned as plain text, not a link (bug-history-rail-draft-link)". Then run `git rev-parse HEAD > /private/tmp/sprinkles-261110-aby/test-sha`.

Step 2, GREEN. In app/src/ui/RecipeHistory.jsx, horizontal branch (about line 138), add the draft test to the span-or-Link ternary between the in-view test and the openPen test, the same order as the upright branch at about line 104. The line must then read exactly `{entry.inView || entry.isDraft || openPen ? (`. This implements the row's fix: the draft node is plain text on the wide rail too. Change nothing else. aria-current stays keyed to entry.inView alone, so the draft span carries none. The Link branch, its state and tabIndex, the upright branch, the scroll effect and notebook.css are all untouched.
Run `npm --prefix app test -- RecipeHistory` (19 passed), then `npm --prefix app test` (all green; 131 files and 4316 tests at planning, more only if a sibling merged first).
Commit the component alone: `git add app/src/ui/RecipeHistory.jsx`, subject "fix: the wide History rail draws a waiting Next version draft as plain text, not a link (bug-history-rail-draft-link)". Then run `git rev-parse HEAD > /private/tmp/sprinkles-261110-aby/fix-sha`.

Step 3. Write the SUMMARY at .planning/quick/261110-aby-bug-history-rail-draft-link-app-src-ui-recipehistory-jsx-138/261110-aby-SUMMARY.md and leave it uncommitted. It records:
- the RED run's totals and failure line;
- the GREEN totals for the file and for the full suite, against 19 and 131/4316;
- both commit hashes;
- whether app/dist/index.html's mtime changed during the run (no command of this plan writes there);
- Deferred Human Verification: none needed. The change is markup only. The draft node becomes the same span the rail already draws for the in-view node and for every node under an open pen, with the same class and grid. The orchestrator may still hand Mark a one-line iPad look (with a Next version draft waiting on another version, the rail's draft node does not respond to a tap) if it batches checks.
  </action>
  <verify>
    <automated>S=/private/tmp/sprinkles-261110-aby && T="$(cat "$S/test-sha")" && F="$(cat "$S/fix-sha")" && grep -qE '1 failed' "$S/red.txt" && grep -qE '18 passed' "$S/red.txt" && npm --prefix app test -- RecipeHistory && grep -qF 'entry.inView || entry.isDraft || openPen ? (' app/src/ui/RecipeHistory.jsx && ! grep -qF '40 g oil</a>' app/src/ui/RecipeHistory.test.jsx && grep -qF 'href="/notebook/recipe-1/draft"' app/src/ui/RecipeHistory.test.jsx && TESTED="$(git show "$T:app/src/ui/RecipeHistory.jsx")" && ! printf '%s\n' "$TESTED" | grep -qF 'entry.inView || entry.isDraft || openPen ? (' && test "$(git diff --name-only "$T^" "$T")" = app/src/ui/RecipeHistory.test.jsx && test "$(git diff --name-only "$F^" "$F")" = app/src/ui/RecipeHistory.jsx && TS="$(git log -1 --format=%s "$T")" && FS="$(git log -1 --format=%s "$F")" && printf '%s\n' "$TS" | grep -qF 'bug-history-rail-draft-link' && printf '%s\n' "$FS" | grep -qF 'bug-history-rail-draft-link' && npm --prefix app test</automated>
  </verify>
  <done>
Baselines at planning HEAD 4e678dfa (every content gate below fails there):
- RecipeHistory.jsx: the horizontal form `entry.inView || entry.isDraft || openPen ? (` is absent at planning and present after. The upright form ending in `? null` (about line 104) is unchanged.
- RecipeHistory.test.jsx: the vacuous name-then-closing-anchor literal is present at planning and absent after. The forbidden draft href is absent at planning and present after.
- red.txt records the RED run at 1 failed and 18 passed, on the wide arrangement. The test commit (test-sha) carries the unfixed component.
- RecipeHistory.test.jsx has 19 tests and all pass. The full suite passes at 131 files and 4316 tests, or more if a sibling merged first.
- Two commits, test (test-sha) then fix (fix-sha). Both name bug-history-rail-draft-link, and each touches only its one named file. The SUMMARY is written and uncommitted.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored draft to rail markup | A Next version draft's label, read from IndexedDB through the repository seam by RecipePage, is rendered in the History rail |
| rail to router | A rail node that is a Link hands a route to react-router |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261110-aby-01 | Tampering | the draft node's name and state in RecipeHistory.jsx | low | mitigate | The label stays a React text child inside the name span. There is no dangerouslySetInnerHTML, per project convention, and this change only swaps the wrapping element from Link to span |
| T-261110-aby-02 | Denial of service | the horizontal rail's draft Link to notebookPath(recipeId, 'draft') | low | mitigate | The fix removes the Link to a version id no stored version has. The rewritten test forbids href="/notebook/recipe-1/draft" in both arrangements, so the route cannot come back unnoticed |
| T-261110-aby-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed or upgraded |
</threat_model>

<verification>
- Task 1's automated command passes as written.
- `git log -1 --format=%s` on test-sha and on fix-sha (in /private/tmp/sprinkles-261110-aby) shows the test commit and the fix commit, both naming bug-history-rail-draft-link. `git show --stat` on each lists only its one file.
- No vite dev or vite preview process was started and nothing was built into app/dist.
</verification>

<success_criteria>
- On the wide History rail, a waiting Next version draft is plain text, as it already is on the upright rail and under any open pen. Saved versions not in view stay links.
- The waiting-draft test now fails without the fix (shown by the RED run) and passes with it.
- The full suite is green with the same test count. Only RecipeHistory.jsx and RecipeHistory.test.jsx changed.
</success_criteria>

<output>
Create `.planning/quick/261110-aby-bug-history-rail-draft-link-app-src-ui-recipehistory-jsx-138/261110-aby-SUMMARY.md` when done (left uncommitted for the orchestrator).
</output>
