---
phase: quick-261001-fcm
plan: 01
quick_id: 261001-fcm
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/tabindex-scan.test.js
  - .planning/notes/2026-10-01-engineering-notes.md
  - .claude/CLAUDE.md
autonomous: true
requirements: [UX1-01]

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "One Vitest file, app/src/ui/tabindex-scan.test.js (node environment, reads source text), fails when any link (a, react-router Link, NavLink), button, radio input or checkbox input in a non-test .jsx under app/src lacks a literal tabIndex={0}. The failure names file, line and tag (D-01)."
    - "The one real exemption, GraduatedRule's button reading tabIndex ?? 0 (FormulationNote passes -1 while recording or developing), is an explicit allowlist entry carrying its reason; an allowlist entry that matches no tag fails the test, so exemptions cannot rot, and any other untagged tag fails (D-01)."
    - "The scan is proven able to fail inside the test file: in-memory source fixtures for each tag kind (untagged flagged, tagged passes, literal -1 flagged, arrow-function handler does not cut a tag short, a URL in a string does not hide the rest of a line, text and file inputs and select ignored, commented-out tags ignored). No component is edited to prove it (D-01)."
    - "The scan passes on the real tree (zero violations, zero stale allowlist entries) and reads router.jsx, RecipePage.jsx and Method.jsx, so the source-text-pinned sites stay covered. Every existing per-component test is untouched: git diff lists no *.test.jsx file and no file under app/ except the new test (D-01, D-04)."
    - "The WebKit rationale is written once, briefly, in .planning/notes/2026-10-01-engineering-notes.md: why WebKit with TabsToLinks off Tabs only into text entry and explicit-tabindex controls, the iPad evidence (G-03.4-r3-3 and G-03.4-r4-1 for links, quick 261001-doi for buttons, radios and checkboxes), Full Keyboard Access stays off on Mark's iPad, the GraduatedRule/FormulationNote -1 exemption, that the scan test enforces the rule, and which sites are pinned on source text. The device-UAT measurement (64 requests and 6.22 MiB against 3 requests and about 134 KB gzipped) and the one-Vite-process measurement (shared optimised-deps cache, 504, whole-page reload) sit in the same note, nothing lost (D-02)."
    - "In .claude/CLAUDE.md exactly three Conventions bullets are replaced one for one by three one-line bullets: the long link rule becomes one line stating the rule for every link, button, radio and checkbox and pointing to the scan test and the note, and the device-UAT and one-Vite bullets each become one line pointing to the note. No second rule is added, no other line of that file changes, the line count stays 89, and the root CLAUDE.md is untouched. Before and after line and byte counts are in the SUMMARY (D-03)."
    - "The SUMMARY states that the Conventions block has no source file (no CONVENTIONS.md exists anywhere), that regeneration cannot be run safely and was not run on the real file, and that the generated block was therefore edited directly, as the commits that added those three bullets did (D-03)."
  artifacts:
    - path: app/src/ui/tabindex-scan.test.js
      provides: "the permanent scan: fixture proofs that it can fail, then the real-tree pass with the one allowlisted exemption"
      contains: "tabIndex={0}"
    - path: .planning/notes/2026-10-01-engineering-notes.md
      provides: "the WebKit keyboard rationale, the device-UAT build rule's measurement and the one-Vite-process measurement"
      contains: "TabsToLinks"
    - path: .claude/CLAUDE.md
      provides: "three one-line Conventions bullets pointing to the note and the scan test"
      contains: "tabindex-scan.test.js"
  key_links:
    - from: .claude/CLAUDE.md
      to: .planning/notes/2026-10-01-engineering-notes.md
      via: "each of the three shortened bullets ends with a pointer to the note"
      pattern: "2026-10-01-engineering-notes.md"
    - from: .claude/CLAUDE.md
      to: app/src/ui/tabindex-scan.test.js
      via: "the link, button, radio and checkbox bullet names the test that enforces it"
      pattern: "tabindex-scan.test.js"
    - from: app/src/ui/tabindex-scan.test.js
      to: app/src
      via: "walks app/src for non-test .jsx files and reads them as text"
      pattern: "readFileSync"
---

<objective>
Keep CLAUDE.md short by moving the explicit-tabindex rule's enforcement into a test and its rationale into one engineering note (Mark approved on 2026-10-01: "Yes, proceed. Let's try to keep CLAUDE.md short").

Quick task 261001-doi tagged 39 buttons, radios and checkboxes with tabIndex={0} after WebKit skipped them on Mark's iPad, and left the rule as prose in the code and a sibling of the link rule in .claude/CLAUDE.md. Prose rules drift; a test does not. This plan makes the rule a test, writes the WebKit rationale once, and shrinks three long Conventions bullets to one line each.

## Decisions

Every decision below comes from the orchestrator's brief (2026-10-01).

- **D-01** Permanent scan test. One Vitest test (node environment is fine, it reads source text) that fails when any `<a>`, react-router `Link` or `NavLink`, `<button>`, `<input type="radio">` or `<input type="checkbox">` rendered under app/src lacks an explicit tabIndex, with a small explicit allowlist for the documented exemptions (tabIndex -1 where the sheet's recording design keeps a control off the Tab path: GraduatedRule/FormulationNote while recording or developing). router.jsx and RecipePage.jsx stay covered, and Method.jsx's uses-list checkbox. Reuse the brace-aware scan from quick 261001-doi. Prove it can fail with an in-memory fixture in the test itself, not by editing a component, and prove it passes on the real tree. Keep the existing per-component exact-count pins; weaken or remove none.
- **D-02** Engineering note. Write the WebKit rationale once, briefly, in the repo's existing home for notes (no docs/ tree): why WebKit with TabsToLinks off only Tabs into text entry and explicit-tabindex controls; the iPad evidence (G-03.4-r3-3, G-03.4-r4-1 for links; quick 261001-doi for buttons, radios and checkboxes); Full Keyboard Access stays off on Mark's iPad; the GraduatedRule/FormulationNote -1 exemption; that the scan test enforces it; which sites are pinned on source text. Move the measured rationale of the device-UAT and one-Vite bullets into the same note: nothing lost, only relocated.
- **D-03** Shorten .claude/CLAUDE.md. Find the real source of the generated Conventions block and the regeneration command (do not guess); edit the source and regenerate so a later regeneration does not undo the change, and if regeneration cannot be run safely, edit source and generated block identically and say so in the SUMMARY. Replace the long link rule (about 636 characters) with ONE short line that states the rule (explicit tabIndex={0} on every link, button, radio and checkbox; enforced by test) and points to the note and the scan test, and add no second sibling rule. Shorten the device-UAT bullet (392 characters) and the one-Vite-process bullet (344 characters) to one line each. Change no other bullet, no other section, no Developer Profile, and not the root CLAUDE.md. Report before and after line and byte counts of .claude/CLAUDE.md.
- **D-04** No app/ production code changes at all (tests and docs only). Test command `npm --prefix app test -- --run` (baseline 1475). No build needed. Commit on main, English, each commit ending with the two trailer lines `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01WeaQszVGJ9FPrW4pPwpmYE`. Do not push. Keep persona voice (Sarge, Sid, Hicks, Bishop) out of commits and docs.

## Planner's readings (taken 2026-10-01, before any edit)

- **The generator and its sources.** `.claude/CLAUDE.md` blocks come from gsd-core's `generate-claude-md` command (the `generateConventionsSection` family in `bin/lib/profile-output.cjs`), called only from the new-project workflow. Conventions read `.planning/codebase/CONVENTIONS.md`, Architecture reads `.planning/codebase/ARCHITECTURE.md`, Stack reads `.planning/codebase/STACK.md` else `.planning/research/STACK.md`, Project reads `.planning/PROJECT.md`. None of the first four exists (there is no `.planning/codebase/` directory; `.planning/research/` is empty), and no CONVENTIONS.md, STACK.md or ARCHITECTURE.md exists anywhere in the repo. The marker `<!-- GSD:conventions-start source:CONVENTIONS.md -->` names a file that is not there.
- **Regeneration is destructive here.** Dry runs on scratch copies of `.claude/CLAUDE.md` (the real file untouched): a plain run replaces Stack, Conventions and Architecture with the fallback text ("not yet documented", "not yet established", "not yet mapped"), rewrites the Project block from the older PROJECT.md wording (drops the two Impeccable/sketch Constraints bullets, changes the Tech stack and Ingredient data bullets) and adds a Skills table; a run with `--auto` skips all six blocks as manually edited and changes only a blank line. So regeneration cannot be run safely, was not run on the real file, and must not be run by the executor.
- **The block is its own source.** `git log` for `.claude/CLAUDE.md` shows commits 5b16cf2 (device-UAT and one-Vite bullets) and 37ff04a (the link rule) adding these bullets by editing the block directly. There is no second copy to edit identically. Creating `.planning/codebase/CONVENTIONS.md` as a real source would start the codebase mapping that PROJECT.md's Key Decisions leaves pending ("map when useful"), and `/gsd-map-codebase` would own and overwrite that file, so this plan does not create it; the SUMMARY raises it as a question for Mark.
- **The home for the note.** The repo has no engineering-notes directory and no docs/ tree. The only tracked home for prose notes is `.planning/notes/` (`{YYYY-MM-DD}-{slug}.md` with `date` and `promoted` frontmatter), which already holds a working note addressed to another agent, so it is not limited to raw ideas. The note goes there, as one file with three short sections. Known side effect: it lists as an active note in `/gsd-note list`; the SUMMARY says so.
- **Gap ids.** The brief writes G-03.5-r3-3 and G-03.5-r4-1. The repo (the old link bullet, Shell.test.jsx, the two `.planning/debug/` sessions ipad-tab-never-enters-app.md and ipad-keyboard-locks-after-tab.md, the 03.4 summaries) writes G-03.4-r3-3 and G-03.4-r4-1, and no file anywhere contains the 03.5 forms. The note uses the repo's ids.
- **router.jsx renders no link now.** The running head was removed in 03.5-02 Task 3 (the comment above the not-found-link test in RecipePage.test.jsx says so; router.jsx holds no Link, anchor or tabIndex). The sites pinned on source text today are Method.jsx's uses-list checkbox (Method.test.jsx) and RecipePage.jsx's not-found link (RecipePage.test.jsx). The scan still reads router.jsx, so a link added there later is covered. The note states the current facts, not the old bullet's.
- **What the scan finds today.** A prototype of the scan below, run over every non-test .jsx under app/src (25 files, comments stripped, brace-aware), finds 63 in-scope tags: 39 buttons, 2 radio inputs, 3 checkbox inputs, 14 Link, 5 NavLink and no `<a>`. Under the rule "a literal tabIndex={0} on the tag" exactly one fails: GraduatedRule.jsx's button, whose prop reads `tabIndex={tabIndex ?? 0}`. That is the single allowlist entry. One `<input type={...}>` in BatchRow.jsx has a computed type (number or text); it is out of scope because only a literal radio or checkbox type is in scope. If the executor's scan finds anything else, STOP and report: it is a real untagged control for a separate fix, not something to allowlist or to patch here.
- **Reference scan.** Quick 261001-doi's Task 2 verify command is the inline version: strip block and line comments by blanking them so indices and newlines survive, find each `<button` or `<input`, walk to the closing angle bracket at brace depth zero, and test the tag text. This plan extends it to `a`, `Link` and `NavLink`, makes quote marks at depth zero skip to their closing quote (so a `>` inside an attribute string cannot end a tag), and adds the allowlist.

## Coverage audit

- GOAL: keep CLAUDE.md short; enforce the explicit-tabindex rule by test instead of prose. Task 1 (test), Task 2 (note, CLAUDE.md).
- REQ: UX1-01 (recipe editing and batch recording operable by keyboard): Task 1 guards it permanently.
- RESEARCH: none for a quick task.
- CONTEXT: D-01 Task 1; D-02 Task 2 steps 1; D-03 Task 2 steps 2-3 and the SUMMARY; D-04 both tasks' verify and commit steps.
- Not planned: creating `.planning/codebase/CONVENTIONS.md` (see the readings; a question for Mark in the SUMMARY), any change to the per-component pins, any change to app/ production code.

Purpose: a rule that WebKit makes load-bearing on the iPad stays enforced without costing 636 characters of every session's context.

Output: one scan test, one engineering note, three shortened bullets, a SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./.claude/CLAUDE.md
@.planning/STATE.md
@.planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-SUMMARY.md

<environment>
- Node 24 is on PATH. Tests: `npm --prefix app test -- --run` (baseline 1475 passing); one file: `npm --prefix app test -- --run src/ui/tabindex-scan.test.js` (the path is relative to app/). No build, no dev server, no Vite process of any kind.
- Run in the main checkout on main, one commit per task, staging only the files each task names, by path (the untracked `.impeccable/critique/` files in the working tree are not part of this work). Every commit message is English and ends with these two lines: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01WeaQszVGJ9FPrW4pPwpmYE`. Do not push.
- Do not run `generate-claude-md` on the real `.claude/CLAUDE.md` or on any file in the repo (see the readings). Edit the block with the Edit tool.
- If this turns out to be a worktree rather than the main checkout, say so in the SUMMARY's first lines.
</environment>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: A permanent scan that fails when a link, button, radio or checkbox lacks tabIndex={0} (D-01, D-04)</name>
  <files>app/src/ui/tabindex-scan.test.js</files>
  <read_first>.planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-PLAN.md (the long node one-liner in Task 2's verify block is the reference scan), app/src/ui/RecipePage.test.jsx (lines 861-882, the source-text pin: readFileSync on a URL-resolved path, comments stripped), app/src/ui/Method.test.jsx (lines 1509-1525, the brace-aware tag expression), app/src/ui/Shell.test.jsx (lines 180-212, the link rule's pin and its cause comment), app/src/ui/GraduatedRule.jsx (lines 76-95), app/src/ui/FormulationNote.jsx (lines 15-36, where -1 comes from), app/vitest.config.js (node environment, no globals), the first lines of any existing .test.js (the vitest import style)</read_first>
  <behavior>
    - Each of six tag kinds written without tabIndex in an in-memory source string is reported once, with its file label, 1-based line and tag name: a plain anchor with an href, a Link, a NavLink, a button, an input of type radio, an input of type checkbox.
    - The same six with tabIndex={0} among their props report nothing.
    - A literal tabIndex={-1} on an in-scope tag is reported (the rule is a literal zero), unless an allowlist entry matches it.
    - A button whose handler is an arrow function (so its props hold a greater-than sign inside braces) is judged on its whole tag: tabIndex={0} after the handler passes, and the same button without tabIndex is reported. A Link whose attribute string holds a greater-than sign (a title of "a > b") is judged on its whole tag too.
    - Out of scope and never reported: input of type text, number, date or file (including one carrying tabIndex={-1}), select, textarea, an element whose name merely starts with a scanned name (an abbreviation element, an article element, a component named LinkButton or NavLinkGroup), and an input whose type is computed.
    - A scanned tag inside a block comment, a line comment or a JSX comment is not reported; a double slash inside a URL string (an anchor whose href is http://x.test) does not hide that tag, so an untagged one is still reported.
    - Allowlist: an entry (file, tag name, a string the tag must contain, reason) exempts a matching tag; it does not exempt the same tag in another file, nor a tag of that name lacking the string; an entry that exempts nothing is returned as stale.
    - Real tree: every non-test .jsx under app/src is scanned (the file list includes router.jsx, ui/RecipePage.jsx and ui/Method.jsx); zero violations remain after the allowlist; zero stale entries.
  </behavior>
  <action>
    Work from the checkout root. Create one new file, app/src/ui/tabindex-scan.test.js, plain ES modules, importing describe, it and expect from vitest (the config enables no globals) and readFileSync, readdirSync, path helpers and fileURLToPath from node. Touch no other file: no component, no test, no stylesheet (D-04).

    Header comment, in the voice of the other test headers and short: what the file guards (every link, button, radio and checkbox the app renders is an explicit Tab stop, tabIndex={0}), the one-sentence cause (WebKit without the tab-to-highlight preference Tabs only into text entry and into controls with an explicit tabindex; Chromium Tabs to everything, so a Chromium run cannot prove it), a pointer to .planning/notes/2026-10-01-engineering-notes.md for the evidence, and the scan's known blind spots in one line each: an input whose type is computed, the select element, and a tag the text scan cannot see because it is built at runtime. State that the per-component tests keep pinning exact tag counts on rendered markup and that this file pins presence everywhere.

    Step 1, RED. Write the fixture tests and the two real-tree tests first, against stubs of the helpers that throw "not implemented". Run `npm --prefix app test -- --run src/ui/tabindex-scan.test.js`: every test MUST fail. Record the count for the SUMMARY.

    Step 2, GREEN. Implement three helpers in the file, none exported to app code (the file is a test; nothing imports it).

    One, comment stripping: blank every block comment (including a JSX comment's inner block) and every line comment with spaces, keeping every newline and the string length, so a match index maps back to the raw line. A line comment starts at a double slash that begins the line or follows whitespace, so a URL's double slash inside a string survives.

    Two, scanSource(fileLabel, source): returns one record per in-scope tag that lacks a literal `tabIndex={0}` among its props, each with file, 1-based line (counted from the raw source up to the tag's start), tag name and the tag text. Find opening tags with a global expression on the names a, Link, NavLink, button and input, each required to be followed by whitespace, a slash or a closing angle bracket (a plain word boundary would match a hyphenated custom element). From the name, walk to the closing angle bracket that sits at brace depth zero: count opening and closing braces, and at depth zero treat a double or single quote as the start of a string that runs to the matching quote (an arrow function inside braces contains a greater-than sign, and an attribute string may too; a bare "up to the first angle bracket" expression would end the tag early and report a tabIndex that is really there as missing). An input is in scope only when its tag holds a literal type of radio or checkbox; every other input type, a computed type included, is out of scope. A tag passes only when it holds `tabIndex={0}` as written (the same literal the other tests pin).

    Three, applyAllowlist(found, allowlist): each entry is { file, name, contains, reason }. A found tag is exempt when some entry matches its file label and tag name and the tag text includes the entry's string; it returns { violations, stale } where violations are the non-exempt records and stale lists entries that exempted nothing. The shipped allowlist is a named constant of exactly one entry: file 'ui/GraduatedRule.jsx', tag button, the string `tabIndex={tabIndex ?? 0}`, and a reason in one or two sentences: FormulationNote passes -1 while the sheet is recording or developing, keeping the six figure rules off the Tab path there (they stay clickable), and the default is 0 in every other state; FormulationNote.test.jsx pins both on rendered markup. Do not add any other entry (see the readings: anything else the scan finds is a real untagged control, STOP and report it).

    Real-tree tests: resolve the app/src directory from the test file's own URL (the parent of ui/), walk it recursively for files ending .jsx whose names do not contain `.test.`, label each by its path relative to app/src with forward slashes, scan each, and assert (a) the label list includes router.jsx, ui/RecipePage.jsx and ui/Method.jsx, and that at least one in-scope tag was seen overall, so a wrong path cannot pass vacuously; (b) violations equal an empty array, formatting each as file, line and tag name so a failure names the control; (c) stale equals an empty array. To count tags seen for (a), have scanSource's helper return both the in-scope tags and the failures, or expose a small countInScope helper; keep it a few lines.

    Fixture tests use the helpers directly on in-memory strings and never read a component. Keep the fixtures minimal and give each test a title that says what it proves. Re-run the single file: it MUST be green with the real-tree tests passing on the unmodified tree. Then run the full suite, which MUST stay green with nothing removed.

    Run the verify command below before committing: its last check reads the working tree, and it passes only while the new test file is the sole uncommitted change under app/. Then commit with a `test(261001-fcm): ...` message in English that says the scan guards every link, button, radio and checkbox under app/src, ending with the two trailer lines, staging app/src/ui/tabindex-scan.test.js by path.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/ui/tabindex-scan.test.js && npm --prefix app test -- --run && test "$(git status --porcelain -- app)" = "?? app/src/ui/tabindex-scan.test.js"</automated>
  </verify>
  <acceptance_criteria>
    - Before the helpers exist the new file's tests all fail (RED, recorded); afterwards the file passes and the full suite passes with the total at 1475 plus the new file's test count and no existing test removed or edited.
    - The fixtures cover each of the six in-scope tag kinds untagged (reported) and tagged (not reported), a literal -1 (reported), an arrow-function handler and a greater-than sign in an attribute string (judged on the whole tag), the out-of-scope kinds, comments and a URL double slash, and the allowlist's match, non-match and stale behaviour.
    - The real-tree tests pass with exactly one allowlist entry (GraduatedRule's button), zero violations, zero stale entries, and a file list that includes router.jsx, ui/RecipePage.jsx and ui/Method.jsx.
    - `git status --porcelain -- app` before the commit shows only the new test file, so no component, no existing test and no stylesheet changed.
  </acceptance_criteria>
  <done>A permanent test fails on an untagged link, button, radio or checkbox anywhere under app/src, is proven able to fail by in-memory fixtures, passes on the real tree with one documented exemption, and is committed on main with no other file touched.</done>
</task>

<task type="auto">
  <name>Task 2: The engineering note, then three one-line Conventions bullets in .claude/CLAUDE.md, then the SUMMARY (D-02, D-03, D-04)</name>
  <files>.planning/notes/2026-10-01-engineering-notes.md, .claude/CLAUDE.md</files>
  <read_first>.claude/CLAUDE.md (the Conventions block, lines 38-50; the three bullets to replace are the device-UAT, one-Vite-process and link bullets, whose measured figures and cause clauses are the text to relocate), .planning/notes/2026-10-01-for-sid-section-rhythm.md (the notes directory's file shape), .planning/debug/ipad-tab-never-enters-app.md and .planning/debug/ipad-keyboard-locks-after-tab.md (the G-03.4-r3-3 and G-03.4-r4-1 evidence), .planning/debug/ipad-page-load-seconds.md (the build-versus-dev-server and 504 measurements), .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-SUMMARY.md (the button, radio and checkbox evidence, the GraduatedRule decision, the device check), app/src/ui/tabindex-scan.test.js (Task 1's file name and allowlist reason)</read_first>
  <action>
    Work from the checkout root. Task 1 is committed. Before any edit run `wc -lc .claude/CLAUDE.md` and write the line and byte counts down as BEFORE (at planning time: 89 lines, 7791 bytes; trust your own reading).

    Step 1, write the engineering note (per D-02). Create .planning/notes/2026-10-01-engineering-notes.md with the Write tool. Frontmatter exactly as the notes directory does it: `date` set to the local time as "YYYY-MM-DD HH:mm" and `promoted: false`. Then a short H1, "Engineering notes", and three H2 sections, each brief and factual, in English, with no persona voice. Keep the whole file near forty lines.

    Section one, "Keyboard: every link, button, radio and checkbox is an explicit Tab stop". Cover, in this order: the rule (each anchor, react-router Link and NavLink, button, and radio or checkbox input the app renders carries a literal tabIndex={0}) and that app/src/ui/tabindex-scan.test.js enforces it by reading every non-test .jsx under app/src and naming file, line and tag on a miss; the cause (WebKit, which is every browser on the iPad, reaches a link only under its TabsToLinks preference, which is off on Apple platforms, has no iPadOS switch and is untouched by Full Keyboard Access; with it off, WebKit Tabs only into text entry and into controls that carry an explicit tabindex; Chromium Tabs to every native control, so a Chromium pass proves nothing about the iPad; a radio group is one Tab stop in both engines, and arrow keys move the selection, and the explicit tabindex changes neither); the evidence (for links, G-03.4-r3-3 in .planning/debug/ipad-tab-never-enters-app.md and G-03.4-r4-1 in .planning/debug/ipad-keyboard-locks-after-tab.md, where untagged links were unreachable on the iPad; for buttons, radios and checkboxes, quick task 261001-doi, where WebKit's Tab from the Churn duration field skipped both radio groups and Add tasting, Cancel and Save batch until all 39 sites were tagged, with Mark confirming on his iPad on 2026-10-01); that Full Keyboard Access stays off on Mark's iPad because with it on the keyboard has locked until a power cycle, so iPad keyboard UAT is tap, then Tab, and Tab past the last link handing focus to Safari's chrome is expected; the one exemption (GraduatedRule's button reads tabIndex ?? 0, FormulationNote passes -1 while recording or developing so the six figure rules stay off the Tab path there and remain clickable, they are Tab stops when reading, the scan allowlists that one tag with its reason and FormulationNote.test.jsx pins both values on rendered markup); and the other pins (each component's own test pins its exact tag count on rendered markup and stays; two sites the node harness cannot render are pinned on source text, Method.jsx's uses-list checkbox in Method.test.jsx and RecipePage.jsx's not-found link in RecipePage.test.jsx; router.jsx renders no link since the running head went in 03.5-02 Task 3 but the scan still reads it; Shell.jsx's hidden file input carries tabIndex -1 on purpose and is not a scanned kind; the one select element in VersionRow.jsx is neither scanned nor measured on WebKit).

    Section two, "Device UAT is served from the build". The command `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server; move the existing bullet's measured figures over unchanged (the dev server's unbundled module graph measured at 64 requests and 6.22 MiB against the build's 3 requests and about 134 KB gzipped), and that no device measurement taken against the dev server means anything. Cite .planning/debug/ipad-page-load-seconds.md and 03.4-13.

    Section three, "One Vite process per workspace". Move the existing bullet's reasoning over unchanged in substance: two servers started from the same app/ directory share one optimised-deps cache, so either one re-optimising invalidates the other's hashes and a stale request returns 504, which makes the client reload the whole page, a measured amplifier and not a theory; kill the duplicate before measuring anything. Cite the same debug file, and add its measurement (a wrong hash returned 504, the right hash or none returned 200).

    Step 2, shorten .claude/CLAUDE.md (per D-03). Do not run the generator and do not create a CONVENTIONS.md (see the readings). Use the Edit tool three times, each with the existing bullet's full line as old_string (copy it from your read; each is unique) and the new line as new_string. The three replacement lines, in place, in the same positions:

    The device-UAT bullet (it begins "- Device UAT") becomes this single line, which starts at the hyphen and ends at the final full stop:

- Device UAT (iPad or iPhone over the LAN) is served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server; why in `.planning/notes/2026-10-01-engineering-notes.md`.

    The one-Vite bullet (it begins "- Only one Vite process") becomes:

- Only one Vite process per workspace; kill the duplicate before measuring anything; why in `.planning/notes/2026-10-01-engineering-notes.md`.

    The link bullet (the long one that begins with the word Every and an anchor tag in backticks) becomes:

- Every link, button, radio and checkbox under `app/src` carries an explicit `tabIndex={0}` (iPad WebKit skips untagged ones); enforced by `app/src/ui/tabindex-scan.test.js`, why in `.planning/notes/2026-10-01-engineering-notes.md`.

    Each is one line of at most 260 characters. Leave every other line, including the GSD marker comments, byte for byte as it is, including the marker that names a source file that does not exist. Add no new bullet. Then run `wc -lc .claude/CLAUDE.md` as AFTER: the line count must still be 89 and the byte count lower.

    Step 3, check the relocation lost nothing. Read the three old bullets (from your read or `git diff -- .claude/CLAUDE.md`) against the note: every figure, id and cause clause in them appears in the note. If one is missing, add it to the note.

    Step 4, write the SUMMARY at .planning/quick/261001-fcm-keep-claude-md-short-enforce-explicit-ta/261001-fcm-SUMMARY.md and leave it uncommitted for the quick workflow's own docs commit. It carries: BEFORE and AFTER line and byte counts of .claude/CLAUDE.md and the saving; the scan test's RED count, final test count and the full-suite total against the 1475 baseline; what the real-tree scan saw (files, in-scope tags by kind, the one allowlisted tag); the generator finding stated plainly (no CONVENTIONS.md, STACK.md or ARCHITECTURE.md exists anywhere, so the Conventions block has no source file; a plain regeneration would replace Stack, Conventions and Architecture with fallback text and was not run on the real file; with --auto it skips every block; the block was edited directly, as 5b16cf2 and 37ff04a did, and a later plain regeneration would wipe it whatever its length); why the note lives in .planning/notes/ and that it lists as an active note in `/gsd-note list`; the two discrepancies from the brief (G-03.4 ids, not G-03.5; router.jsx renders no link now); and one question for Mark: whether to create .planning/codebase/CONVENTIONS.md as a real source for the block (it starts the codebase mapping PROJECT.md leaves pending), or keep editing the block by hand as the last three commits did.

    Step 5, prove it and commit. Run the verify command below first: it reads the working tree against HEAD, so it must run before the commit. Then commit the note and CLAUDE.md with a `docs(261001-fcm): ...` message in English, saying the WebKit, device-UAT and one-Vite rationale moved into an engineering note and three Conventions bullets became one line each, ending with the two trailer lines, staging .planning/notes/2026-10-01-engineering-notes.md and .claude/CLAUDE.md by path. Do not push.
  </action>
  <verify>
    <automated>test -f .planning/notes/2026-10-01-engineering-notes.md && grep -q "TabsToLinks" .planning/notes/2026-10-01-engineering-notes.md && grep -q "G-03.4-r3-3" .planning/notes/2026-10-01-engineering-notes.md && grep -q "G-03.4-r4-1" .planning/notes/2026-10-01-engineering-notes.md && grep -q "261001-doi" .planning/notes/2026-10-01-engineering-notes.md && grep -q "Full Keyboard Access" .planning/notes/2026-10-01-engineering-notes.md && grep -q "tabindex-scan.test.js" .planning/notes/2026-10-01-engineering-notes.md && grep -q "GraduatedRule" .planning/notes/2026-10-01-engineering-notes.md && grep -q "6.22 MiB" .planning/notes/2026-10-01-engineering-notes.md && grep -q "134 KB" .planning/notes/2026-10-01-engineering-notes.md && grep -q "504" .planning/notes/2026-10-01-engineering-notes.md && grep -q "Method.jsx" .planning/notes/2026-10-01-engineering-notes.md && grep -q "RecipePage.jsx" .planning/notes/2026-10-01-engineering-notes.md && node -e "const t=require('fs').readFileSync('.claude/CLAUDE.md','utf8').split('\n');const N='.planning/notes/2026-10-01-engineering-notes.md';let bad=0;for(const w of ['- Device UAT','- Only one Vite process','- Every link, button, radio and checkbox']){const l=t.filter(x=>x.startsWith(w));if(l.length!==1||l[0].length>260||!l[0].includes(N)){console.log('BAD',w,l.map(x=>x.length));bad=1}}if(!t.some(x=>x.includes('tabindex-scan.test.js')&&x.includes('tabIndex={0}')))bad=1;process.exit(bad)" && test "$(git diff --numstat -- .claude/CLAUDE.md)" = "$(printf '3\t3\t.claude/CLAUDE.md')" && test "$(wc -l .claude/CLAUDE.md | awk '{print $1}')" = "89" && test "$(grep -c 'GSD:conventions-' .claude/CLAUDE.md)" = "2" && git diff --quiet HEAD -- CLAUDE.md app</automated>
  </verify>
  <acceptance_criteria>
    - The note exists at .planning/notes/2026-10-01-engineering-notes.md with the `date` and `promoted: false` frontmatter and three sections, and carries every item the automated check names: the TabsToLinks cause, both link gap ids, quick 261001-doi, Full Keyboard Access, the scan test, the GraduatedRule exemption, Method.jsx and RecipePage.jsx, the 6.22 MiB and 134 KB figures, and the 504.
    - `git diff --numstat -- .claude/CLAUDE.md` reads 3 added and 3 deleted before the commit (three lines replaced one for one), the file still has 89 lines, both GSD conventions markers are intact, and each of the three new bullets is a single line of at most 260 characters ending in a pointer to the note, the link bullet also naming tabindex-scan.test.js.
    - The root CLAUDE.md and everything under app/ are unchanged by this task (`git diff --quiet HEAD -- CLAUDE.md app` exits 0).
    - The SUMMARY exists, is uncommitted, and states BEFORE and AFTER line and byte counts, the generator finding, and the question for Mark.
  </acceptance_criteria>
  <done>The WebKit, device-UAT and one-Vite rationale is written once in a short note, three Conventions bullets are one line each and point to it, the link bullet also names the test that enforces it, nothing in the old bullets is lost, the SUMMARY reports the byte savings and the fact that the block has no regenerable source, and the commit is on main.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| scan test to the source tree | The test reads app/src source files as text in a node process; nothing is executed, nothing leaves the machine |
| generator to .claude/CLAUDE.md | `generate-claude-md` can overwrite hand-maintained blocks of the project's instruction file with fallback text |

## STRIDE Threat Register

Threat IDs continue the quick task's own numbering; this task has no earlier plans.

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261001-fcm-01 | Tampering | tabindex-scan.test.js allowlist | medium | mitigate | The allowlist is a named constant of one entry; each entry names file, tag, the exact expression the tag must contain, and a reason; an entry that exempts nothing fails the test, so an exemption cannot outlive its tag, and a tag that loses its expression is reported. Any further exemption shows as a diff to that constant. |
| T-261001-fcm-02 | Tampering | .claude/CLAUDE.md Conventions block | medium | mitigate | The block has no source file and a plain regeneration would overwrite it with fallback text, so the executor edits it with the Edit tool and never runs the generator on the real file; the SUMMARY records that a later plain regeneration would wipe it and asks Mark whether to create a real source. |
| T-261001-fcm-03 | Information disclosure | scan blind spots (computed input type, select, tags built at runtime) | low | accept | The scan covers literal radio and checkbox types and the five tag names the app uses; the one computed-type input in the tree is number or text, and the one select is unmeasured on WebKit. Both are named in the test header and the note so the gap is documented, not hidden. |
| T-261001-fcm-04 | Elevation of privilege | notes rendering | low | accept | The change adds a test file, a markdown note and three markdown lines. No markup is injected into the app, no dangerouslySetInnerHTML is introduced, and no app/ production code changes. |
| T-261001-fcm-SC | Tampering | npm/pip/cargo installs | high | mitigate | This plan installs no package; the test uses only vitest and node built-ins already present. |
</threat_model>

<verification>
- `npm --prefix app test -- --run` passes: 1475 baseline plus the new file's tests, none removed or edited.
- `npm --prefix app test -- --run src/ui/tabindex-scan.test.js` passes on the real tree and its fixtures prove the scan can fail.
- Task 2's automated check passes: the note carries every named fact, the three bullets are single lines pointing to the note, the link bullet names the scan test, `.claude/CLAUDE.md` changed by exactly three lines for three lines and still has 89 lines.
- Scope: `git diff --name-only` for the two commits lists exactly app/src/ui/tabindex-scan.test.js, .planning/notes/2026-10-01-engineering-notes.md and .claude/CLAUDE.md; no CLAUDE.md at the root, no component, no existing test, no stylesheet.
- The SUMMARY exists, is uncommitted, and reports before and after line and byte counts of `.claude/CLAUDE.md`.
</verification>

<success_criteria>
- A test fails the build when any link, button, radio or checkbox under app/src is missing tabIndex={0}, and is proven able to fail without touching a component.
- The WebKit rationale, the iPad evidence, the Full Keyboard Access rule, the -1 exemption and the device-UAT and one-Vite measurements live once in a short note, nothing lost.
- `.claude/CLAUDE.md` is shorter by about 800 bytes (a scratch run of the three replacements takes it from 7791 to 7002 bytes at 89 lines), its three long Conventions bullets are one line each, and no other line moved.
- The SUMMARY is plain about the fact that the Conventions block has no regenerable source, and asks Mark the one open question.
</success_criteria>

<output>
Create `.planning/quick/261001-fcm-keep-claude-md-short-enforce-explicit-ta/261001-fcm-SUMMARY.md` when done
</output>
