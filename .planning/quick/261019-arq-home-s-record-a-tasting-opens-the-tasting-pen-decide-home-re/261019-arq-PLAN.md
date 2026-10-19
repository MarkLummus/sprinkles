---
phase: quick-261019-arq
plan: 01
quick_id: 261019-arq
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipeList.nextVersion.test.jsx
autonomous: true

must_haves:
  truths:
    - "On Home, pressing Record a tasting on a recipe that is awaiting a tasting opens the batch log at the awaiting batch's own address with the tasting pen already open. This works from the row and from the lead block, which renders the same RowActions. The pen is the same one the recipe page's band opens: an amend pen with opener 'record-a-tasting'."
    - "Both Record a tasting links, the row's and the lead's, land with route state exactly { startTasting: true }. This is the object useBatchRecording.js line 328 passes for the band, and the one useRouteIntents.js line 26 reads through location.state?.startTasting."
    - "Keep developing is unchanged. It still links to the latest version's address and still lands with no state (null). Record a batch, Next version and Adapt are also unchanged."
    - "The Record a tasting link still points at the awaiting batch under its own version (notebookPath(entry.id, awaiting.versionId, awaiting.id), from 261018-x4s) and still has a literal tabIndex={0} (D-19)."
    - "The tasting pen opens once. useRouteIntents replaces the history entry's state with null before it opens the pen, so Back, Forward or a reload does not open it again. If a draft is kept on that batch page, the restored draft wins and no second pen opens (RecipePage.drafts.test.jsx). Neither file in this plan changes that behaviour."
    - "`npm --prefix app test -- RecipeList.nextVersion` passes 5 tests (4 at 5b09c58a, plus 1). `npm --prefix app test` passes with no failures across 114 files and 3472 tests (baseline 3471, plus 1), or more if a sibling item merged first."
    - "There is exactly one code commit, and it holds exactly the two files in files_modified."
  artifacts:
    - path: app/src/ui/RecipeList.jsx
      provides: "In the RowActions AWAITING_TASTING branch, the Record a tasting Link carries state={{ startTasting: true }}. The comment above RowActions says so."
    - path: app/src/ui/RecipeList.nextVersion.test.jsx
      provides: "A new jsdom click-and-land test: the row's and the lead's Record a tasting each land on /notebook/r1/v1/batch/b1 with state { startTasting: true }. Test 3 is narrowed to Keep developing, which still lands with null."
  key_links:
    - from: "RowActions AWAITING_TASTING branch (RecipeList.jsx)"
      to: "useRouteIntents startTastingOnMount (useRouteIntents.js line 26)"
      via: "the route state { startTasting: true } on the Link to tastingPath; the batch page reads it once and calls onStartAmending(target, { opener: 'record-a-tasting' })"
      pattern: "state=\\{\\{ startTasting: true \\}\\}"
    - from: "the Home link's state object"
      to: "the band's navigate state (useBatchRecording.js line 328)"
      via: "the same key and value, so one receiver serves both senders"
      pattern: "startTasting: true"
---

<objective>
Make Home's Record a tasting open the tasting pen when the batch log arrives. This carries out Mark's answer on decide-home-record-tasting-opens-pen (option open-pen). Today the AWAITING_TASTING Link in app/src/ui/RecipeList.jsx (lines 212-214) goes to tastingPath with no route state, so the batch page opens with the pen closed. The fix adds state={{ startTasting: true }} to that one Link. That is the same object the recipe page's band sends (useBatchRecording.js line 328), and the batch page already acts on it once through useRouteIntents.

Purpose: one press on Home takes the maker straight to the Tasted date, the same as pressing the band's Record a tasting.

Output: one changed Link and its comment in RecipeList.jsx, and one new click-and-land test plus one narrowed test in RecipeList.nextVersion.test.jsx.

The receiving half is not edited and is already tested. RecipePage.recordTasting.test.jsx T6 mounts the batch's own address with { startTasting: true } and asserts the pen opens there. RecipePage.drafts.test.jsx covers a kept draft taking the request. The plan runs both, so a change to that path cannot pass unnoticed.

Why the test goes in RecipeList.nextVersion.test.jsx and not RecipeList.test.jsx: RecipeList.test.jsx renders with renderToStaticMarkup, and route state never reaches static markup, so no test there can see it. RecipeList.nextVersion.test.jsx is the existing jsdom RecipeList test that clicks a Home link and reads the location it lands on. Its test 3 is currently the only test that pins Record a tasting landing with no state, so it is the test to update.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeList.jsx
@/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeList.nextVersion.test.jsx
@/Users/mark/Documents/projects/sprinkles/app/src/ui/useRouteIntents.js

<interfaces>
These already exist. Reuse them, and add no helper:
- RecipeList.jsx lines 207-220, RowActions AWAITING_TASTING branch: `awaiting = entry.batches[0]`; `tastingPath = notebookPath(entry.id, awaiting.versionId, awaiting.id)`. Two Links follow: Record a tasting (class home__action) and Keep developing (to latestPath, class "home__action home__action--secondary"). Both have tabIndex={0}.
- RecipeList.jsx line 224 is the attribute order to match. The Next version Link reads to, then state, then className, then tabIndex: `<Link to={latestPath} state={{ startNextVersion: true }} className="home__action" tabIndex={0}>`.
- HomeLead renders RowActions too, so the lead block carries the same Record a tasting link as the row. The change needs no lead-specific edit.
- useRouteIntents.js line 26: `const startTastingOnMount = Boolean(location.state?.startTasting);`. Lines 42-55 run the effect. It waits for the draft restore and needs a batchId and mode 'reading'. It finds the batch, skips it if the batch already has a tasting, replaces the history state with null, then calls onStartAmending(target, { opener: 'record-a-tasting' }).
- useBatchRecording.js line 328 is the band's sender: `navigate(notebookPath(version.recipeId, version.id, batch.id), { state: { startTasting: true } })`.
- RecipeList.nextVersion.test.jsx harness: `mount(batches)` renders HomeBody in a MemoryRouter at '/' with routes for the version and batch addresses. `Where` captures `landed = useLocation()`. `linksNamed(scope, text)` takes a scope of 'section.home__lead' or 'li.home__row'. `click(link)` exists. Fixture AWAITING = [makeBatch({ tasting: null })], with version v1 and recipe r1, so the batch address is /notebook/r1/v1/batch/b1. Test 1 (lines 94-116) shows the row-then-lead, unmount, remount pattern to copy.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Home's Record a tasting lands with { startTasting: true } (test red first, then the Link)</name>
  <files>app/src/ui/RecipeList.nextVersion.test.jsx, app/src/ui/RecipeList.jsx</files>
  <read_first>
    - app/src/ui/RecipeList.jsx lines 186-237 (the RowActions comment and the three standings' Links)
    - app/src/ui/RecipeList.nextVersion.test.jsx, the whole file (146 lines: the header comment, the harness, and tests 1-4)
    - app/src/ui/useRouteIntents.js lines 23-55 (the receiver, read only; do not edit)
  </read_first>
  <precondition>app/node_modules resolves. In a worktree without it, run `ln -s /Users/mark/Documents/projects/sprinkles/app/node_modules app/node_modules` before the first test run.</precondition>
  <behavior>
    - New test, in a new describe block placed after the existing describe and titled "Home’s Record a tasting asks the batch page to open its tasting pen (quick 261019-arq)". The test is titled "1: the row’s and the lead’s Record a tasting are literal-tabIndex links to the awaiting batch, and each lands with the flag". It mounts AWAITING. It asserts exactly one Record a tasting link in 'section.home__lead' and exactly one in 'li.home__row'. Each must have tabindex '0' and href '/notebook/r1/v1/batch/b1'. It clicks the row's link and expects landed.pathname to be '/notebook/r1/v1/batch/b1' and landed.state toEqual({ startTasting: true }). It then unmounts, removes the container, remounts AWAITING, clicks the lead's link, and expects the same pathname and state.
    - Existing test 3 is renamed "3: Keep developing lands on the latest version with no state". Its Record a tasting half (the click, the two expectations, and the unmount and remount that follow) is removed. What remains is mount(AWAITING), a click on the row's Keep developing, landed.pathname '/notebook/r1/v1', and landed.state null.
    - Tests 1, 2 and 4 are unchanged.
  </behavior>
  <action>
RED: in app/src/ui/RecipeList.nextVersion.test.jsx, make the test edits listed in the behavior block. Use the file's existing helpers (mount, linksNamed, click, landed) and copy test 1's pattern for the second mount: unmount inside act, remove the container, mount again. Update the header comment (lines 3-6) so it stays true. It should still credit quick 261012-e8l for Next version. It should add that quick 261019-arq gives Home's Record a tasting the route state the batch page uses once to open its tasting pen (decide-home-record-tasting-opens-pen). It should end by saying the other Home links land with no state. Run `npm --prefix app test -- RecipeList.nextVersion` and confirm that only the new test fails, and that it fails because landed.state is null instead of { startTasting: true }. Commit nothing yet.

GREEN, per decide-home-record-tasting-opens-pen (option open-pen, Mark): in app/src/ui/RecipeList.jsx, the RowActions AWAITING_TASTING branch, change only the Record a tasting Link's opening tag. It should become `<Link to={tastingPath} state={{ startTasting: true }} className="home__action" tabIndex={0}>`, with the attributes in the same order as the Next version Link on line 224. Leave the Keep developing Link character for character as it is. Leave tastingPath, awaiting, and every other branch alone. Then update the last sentence of the comment above RowActions (lines 193-195, beginning "Next version also asks the recipe page"). It should say that Record a tasting asks the batch page to open its tasting pen and Next version asks the recipe page to open its Next version pen, each through route state the page uses once. Write it in plain English and leave the rest of that comment unchanged.

Do not edit useRouteIntents.js, useBatchRecording.js, RecipePage.jsx or RecipeList.test.jsx. The receiver already handles this state. RecipePage.shell.test.js counts literal markers in useRouteIntents.js, and RecipeList.test.jsx's static-markup tests cannot see route state, so none of those files needs a change. Add no helper and no constant for the state object; it is written inline, as Next version's is.

Run the targeted suites in the verify block, then the full suite. Make one commit that holds exactly the two files, with a message in English. The subject names the decision, for example `feat(home): Record a tasting opens the tasting pen (decide-home-record-tasting-opens-pen)`. End the message with these two lines:
Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01D23VYRNqiLYsxmWdDFqhCG
  </action>
  <verify>
    <automated>[ -e app/node_modules ] || ln -s /Users/mark/Documents/projects/sprinkles/app/node_modules app/node_modules; npm --prefix app test -- RecipeList RecipePage.recordTasting RecipePage.drafts tabindex-scan && grep -A1 '<Link to={tastingPath} state={{ startTasting: true }} className="home__action" tabIndex={0}>' app/src/ui/RecipeList.jsx | grep -q 'Record a tasting' && grep -A1 '<Link to={latestPath} className="home__action home__action--secondary" tabIndex={0}>' app/src/ui/RecipeList.jsx | grep -q 'Keep developing' && grep -q 'state={{ startNextVersion: true }}' app/src/ui/RecipeList.jsx && grep -q 'toEqual({ startTasting: true })' app/src/ui/RecipeList.nextVersion.test.jsx</automated>
  </verify>
  <done>
    The targeted run passes. RecipeList.nextVersion goes from 4 tests to 5. RecipeList.test.jsx, RecipePage.recordTasting (T6 included), RecipePage.drafts and tabindex-scan are all green and unchanged.

    The grep gates, measured at 5b09c58a:
    - The new Record a tasting opening tag, followed on the next line by the words Record a tasting: found (no match at baseline).
    - Keep developing's opening tag, unchanged, followed by the words Keep developing: found (it already matches at baseline and must keep matching).
    - `state={{ startNextVersion: true }}` in RecipeList.jsx: still found.
    - `toEqual({ startTasting: true })` in RecipeList.nextVersion.test.jsx: found (no match at baseline).

    `npm --prefix app test` passes with no failures: 114 files and 3472 tests, or base plus 1 if a sibling merged first. One commit holds exactly app/src/ui/RecipeList.jsx and app/src/ui/RecipeList.nextVersion.test.jsx.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Home link → batch page (in-app navigation) | A history entry's route state crosses from the Home page to the batch page. Route state is browser history data. A user could forge it only in their own tab. It never leaves the device and is never stored. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261019arq-01 | Tampering | location.state.startTasting read by useRouteIntents.js | low | accept | No change in this plan. The only effect of the flag is that an amend pen opens on the batch already shown at that address. It opens only in mode 'reading', only for a batch with no tasting, and nothing is written until the maker presses Save. Existing code. |
| T-261019arq-02 | Repudiation/Integrity | a reopened pen after Back, Forward or reload | low | mitigate | useRouteIntents replaces the entry's state with null before it opens the pen (consume-once, startTastingConsumedRef), and a kept draft takes the request without opening a second pen. This plan relies on that and does not change it. RecipePage.drafts.test.jsx and RecipePage.recordTasting.test.jsx run in verify. |
| T-261019arq-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package. The only dependency step is the worktree symlink to the main checkout's existing app/node_modules. |
</threat_model>

<verification>
- `npm --prefix app test -- RecipeList.nextVersion` passes 5 tests.
- `npm --prefix app test` passes with no failures: 114 files and 3472 tests, or base plus 1.
- `npm --prefix app run build` succeeds.
- `git show --stat HEAD` lists exactly app/src/ui/RecipeList.jsx and app/src/ui/RecipeList.nextVersion.test.jsx.
</verification>

<success_criteria>
Pressing Record a tasting on Home, from the row or from the lead, opens the awaiting batch's log with the tasting pen open, exactly as the band's Record a tasting does. Keep developing and every other Home link behave as before. The pen opens only once per press: Back, Forward and reload do not reopen it.
</success_criteria>

<output>
Create `.planning/quick/261019-arq-home-s-record-a-tasting-opens-the-tasting-pen-decide-home-re/261019-arq-SUMMARY.md` when done
</output>
