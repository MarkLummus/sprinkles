---
phase: quick-260918-cdg
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements:
  - RTL-01
  - GUARD-02
  - ORPHAN-03
  - TODOS-04
  - COMMIT-05
files_modified:
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/history.css
  - app/src/ui/RecipeHistory.jsx
  - .planning/todos/pending/2026-09-18-recipe-history-batch-is-current-is-emitted-with-no-rule.md
  - .planning/todos/pending/2026-09-18-the-standalone-batches-register-has-no-in-view-cue.md
  - .planning/todos/pending/2026-09-18-history-register-comment-still-describes-margin-left.md
  - .planning/todos/completed/2026-09-18-recipe-history-batch-is-current-is-emitted-with-no-rule.md
  - .planning/todos/completed/2026-09-18-the-standalone-batches-register-has-no-in-view-cue.md
  - .planning/todos/completed/2026-09-18-history-register-comment-still-describes-margin-left.md

estimate:
  tokens: 62000
  raw_tokens: 62000
  tasks: 4
  confidence: low

must_haves:
  truths:
    - "The three nested history offsets indent from the reading start edge in both text directions — no rule under app/src/styles/history.css names a physical left or right edge, and no margin shorthand in that file states four values (RTL-01)."
    - "history.css's (max-width: 759.98px) block is asserted exhaustively by name, and that condition is the only @media condition the file carries — a new narrow-width or touch-union rule added there fails the suite until it is listed (GUARD-02)."
    - "The guard written in Task 1 goes red against the unfixed stylesheet before Task 2 touches it, so it is proven to bite rather than assumed to (GUARD-02)."
    - "The version <li> in RecipeHistory.jsx carries only its structural class; the state class it emitted for a rule that no longer exists is gone, and the article's own current flag is untouched (ORPHAN-03)."
    - "All three 2026-09-18 todos are verified against the code and then moved to .planning/todos/completed/ by the GSD todo tooling, each stamped status: completed (TODOS-04)."
    - "The whole working tree — the shared-history extraction plus these fixes — is committed on main as atomic commits, unpushed (COMMIT-05)."
  artifacts:
    - app/src/styles/cross-cutting.test.js
    - app/src/styles/history.css
    - app/src/ui/RecipeHistory.jsx
  key_links:
    - "history.css's narrow block sets margin-inline-start on the three offset selectors; it only overrides the base rule's start edge if the base rule states its offset logically too — a physical margin-left in the base leaves both edges indented in RTL (RTL-01)."
    - "app.css:896-902 at HEAD carried a `margin: 0` reset for these paragraphs that the extraction folded into the shorthand — whatever replaces the shorthand must still zero the block end, or a <p>'s UA bottom margin returns (RTL-01)."
    - "historyRuleFor() in cross-cutting.test.js is a first-match lookup over comma-split group selectors, and `.recipe-history__empty` is a member of the earlier type-role group at history.css:66-69 — so it resolves to a rule with no margin at all. The offset rules must be selected by a margin-declaring filter, never by historyRuleFor (GUARD-02)."
    - "RecipeHistory.test.jsx:233 matches `/<li class=\"recipe-history__version/` as a prefix, so it keeps passing after the state class is removed (ORPHAN-03)."
---

<objective>
Fix an RTL margin regression and a media-block coverage hole that the shared-history extraction introduced, drop the dead state class it orphaned, close the three todos it resolves, and commit the whole working tree.

Purpose: the extraction moved 245 lines out of `app.css` into a new `history.css` and, in the move, silently undid a hardening pass. Commit `dc097cf` had converted three nested offsets to logical properties so the outline holds in both text directions; the extracted copy states them as a `margin` shorthand whose fourth value is physical `margin-left`. The same extraction deleted those selectors from the exhaustive narrow-width assertion in `cross-cutting.test.js` instead of re-pointing it at the new file — which is exactly why the regression got through. None of this is committed yet, so it can be corrected before it enters history rather than after.

Output: three edited source files, three closed todos, and the whole working tree committed on `main` as atomic commits.

Not a tracer plan: the scope is three enumerated findings against code that already exists and already works end-to-end. There is no architecture to prove with a thin slice. The task order is the RED/GREEN order the findings themselves ask for — the guard first, proven failing, then the fix that turns it green.
</objective>

<execution_constraints>
**This plan operates on UNCOMMITTED working-tree changes on `main`. Execution is SEQUENTIAL on the main working tree.**

- Do NOT create a worktree. A worktree forked from `origin/HEAD` would not contain this work.
- Do NOT run `git stash`, `git checkout <branch>`, `git switch`, `git reset`, or `git restore`. The only copy of the extraction is in this tree.
- Do NOT create a branch. Do NOT push.
- Tasks 1, 2 and 3 do NOT commit. Only Task 4 commits.
- **Mutable-scope authority (#3786):** the authorized file set is the live `git status` working tree at execution time, not the list in this plan's frontmatter. Every line number in this plan is advisory — re-read each file before editing; earlier tasks shift later line numbers.

**Surgical discipline (CLAUDE.md § 3):** every changed line must trace to Finding 1, Finding 2 or Finding 3. No adjacent improvements, no refactors, no comment rewrites elsewhere in either stylesheet. If you notice unrelated dead code or stale prose, name it in the SUMMARY — do not change it.

**Simplicity discipline (CLAUDE.md § 2):** these are corrections. No new abstractions, no options, no defensive handling beyond what each finding names.

**Comment hygiene:** the gates below count occurrences of a selector, a class or a sentence in a source file. Do not leave a gated string inside a code comment — a comment naming what was removed re-fails its own gate.
<!-- planner-discipline-allow: margin-left, is-current, .history-register -->
</execution_constraints>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.planning/STATE.md
@/Users/mark/Documents/projects/sprinkles/app/src/styles/history.css
@/Users/mark/Documents/projects/sprinkles/app/src/styles/cross-cutting.test.js
@/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeHistory.jsx

Read as needed, in the task that needs them:
- `app/src/styles/css-source.js` — the parser all three style-contract suites read through. `readAllRules` returns `{ selector, declarations, media }` in source order, with whitespace in the selector collapsed to single spaces and `media: undefined` for top-level rules.
- `app/src/ui/History.jsx` — the shared components; `HistoryItem` is what now emits the current-state class.
- `app/src/ui/BatchRow.jsx` (~line 337) — the standalone Batches register's `HistoryItem` call site, needed to verify the second todo.
- `app/src/styles/app.css` — only to confirm what the third todo says is gone. Do not edit it.

**Measured baseline, this working tree, before any edit:**

| Fact | Value |
|------|-------|
| `npm --prefix app test` | 36 files, **1018 passed** |
| `npm --prefix app run build` | passes |
| `wc -l app/src/styles/history.css` | 168 |
| history.css `@media` conditions | exactly one: `(max-width: 759.98px)` |
| history.css narrow-block selectors, in source order | `.history-list--records`, `.history-list--branches`, `.recipe-history__reason`, `.recipe-history__outcome, .recipe-history__next, .recipe-history__empty` |
| `grep -c 'current={isInView}' app/src/ui/RecipeHistory.jsx` | 4 |
| `grep -c '<li className="recipe-history__version">' app/src/ui/RecipeHistory.jsx` | 0 (today it carries the state class too) |
| `grep -n '^\.history-register' app/src/styles/app.css` | no match — the block moved out of app.css entirely |
| `grep -c 'shared right edge at width AND the whole-block drop' app/src/styles/app.css` | 0 |

**Test-count arithmetic, stated so drift is visible:** 1018 + 1 (one new test in Task 1; the second change extends an existing test and adds no count) = **1019** at the end.

- After Task 1: **1019 total — 1018 passed, 1 failed.** The one failure is required: it is the extended logical-property test going red against the unfixed stylesheet.
- After Task 2: **1019 passed**
- After Task 3: **1019 passed** (no test changes)
- After Task 4: **1019 passed** on the committed tree

A different number at any gate means something unintended moved. Stop and report it rather than adjusting the expectation.

**The parsed shape of the two rules Finding 1 fixes** (read out of `readAllRules` against today's file, so the executor does not have to re-derive it):

| Whole selector string | Declarations |
|---|---|
| `.recipe-history__outcome, .recipe-history__next` | `margin: var(--gap-hair) 0 0 var(--gap-l); overflow-wrap: anywhere;` |
| `.recipe-history__empty` | `margin: var(--gap-s) 0 0 var(--gap-l);` |

**The trap in the existing helper.** `historyRuleFor(selector)` returns the first non-media rule whose comma-split selector list contains `selector`. `.recipe-history__empty` is a member of the type-role group at history.css:66-69 (`.history-register__marker, .history-provenance, .recipe-history__empty, .recipe-history__outcome:not(.prose-text)`), which comes first in source order and declares no margin at all. So `historyRuleFor('.recipe-history__empty')` resolves to the wrong rule and would make the new guard pass vacuously. Task 1 selects the offset rules by a margin-declaring filter instead.

**Why the zeroes matter.** At HEAD, `app.css:896-902` carried `.recipe-history__outcome, .recipe-history__next, .recipe-history__cause, .recipe-history__empty, .recipe-history__reason p { margin: 0; }`. The extraction dropped that reset for the outcome/next/empty paragraphs and folded its zeroes into the shorthand. There is no global `p { margin: 0 }` in either stylesheet. So a replacement that states only a top offset and a start offset lets a `<p>`'s UA block-end margin back in — a second regression wearing the fix's clothes.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write the guards that would have caught this, and prove they fail (GUARD-02)</name>
  <files>app/src/styles/cross-cutting.test.js</files>
  <action>
Close Finding 2 by restoring the discipline the extraction dropped, in the suite that already owns it. No stylesheet is edited in this task — the guards must go red first.

Re-read `app/src/styles/cross-cutting.test.js` before editing; the line numbers below are advisory. The file already defines `historyRules` and `historyRuleFor` near the top (~line 45) — reuse them, do not redefine them.

**Change A — a module-scope helper, added beside `historyRuleFor`.** Add `fourValueShorthands(declarations)`. It returns every `margin` or `padding` shorthand in a rule's declarations that states exactly four whitespace-separated values, as an array of readable strings. Implement it as `[...declarations.matchAll(/(?:^|[\s;])(margin|padding):\s*([^;]+);/g)]`, filtered to the matches whose trimmed second group splits on `/\s+/` into exactly 4 parts, mapped to `` `${m[1]}: ${m[2].trim()}` ``. Two properties of this regex are load-bearing and should be stated in a short comment above it: the `(?:^|[\s;])` prefix and the literal colon mean it matches the shorthand only and never `margin-block`, `margin-inline` or any `-start`/`-end` longhand; and only the four-value form is reported, because three values or fewer set left and right to the same value and are therefore direction-symmetric. The comment should say why the helper exists at all — the fourth value of the shorthand IS the physical left edge, so a regex looking for the physical longhand reads a direction-locked rule as clean.

**Change B — extend the existing logical-property test.** The test named `'history keeps authored names wrappable and reduces nested indentation with logical properties on phone widths'` (~line 65) already asserts that `.history-list--branches` carries no physical left edge. Extend it, after the existing narrow-block assertions, to cover the three nested offsets:

- Build `offsetRules` as `historyRules.filter((r) => !r.media && /(^|[\s;])margin/.test(r.declarations) && ['.recipe-history__outcome', '.recipe-history__next', '.recipe-history__empty'].some((c) => r.selector.split(', ').includes(c)))`. Add a short comment recording why this is not `historyRuleFor` — that the empty paragraph is also a member of the earlier type-role group, which declares no margin, so a first-match lookup silently resolves to the wrong rule.
- Assert `offsetRules.map((r) => r.selector)` equals `['.recipe-history__outcome, .recipe-history__next', '.recipe-history__empty']`, so a rule disappearing or splitting is caught rather than skipped.
- Then, for each rule in `offsetRules`, assert all four of:
  - `expect(rule.declarations).toMatch(/margin-inline(?:-start)?:\s*var\(--gap-l\)/)` — the start offset reads the same token it always did, through a logical property. The optional `-start` deliberately admits either spelling.
  - `expect(rule.declarations).toMatch(/margin-block:\s*var\(--gap-(?:hair|s)\) 0|margin-bottom:\s*0/)` — the block end stays zeroed. Comment this one with the reason: the reset these paragraphs used to get from app.css left with the extraction, so the zero now has to be stated here or a paragraph's UA bottom margin returns.
  - `expect(rule.declarations).not.toMatch(/margin-left|margin-right|padding-left|padding-right|border-left|border-right/)` — no physical inline edge.
  - `expect(fourValueShorthands(rule.declarations)).toEqual([])` — and comment that this is the assertion the other three depend on, because the shorthand is invisible to all of them.

**Change C — a new test, placed immediately after `'the touch union carries the six sizing rules, and the width-only block keeps the version row'` (~line 111), in the same describe block.** Name it so it says what it is for: that history.css's narrow block is listed exhaustively and that the width-only-versus-touch-union discipline now covers the extracted file. It asserts two things:

- `historyRules.filter((r) => r.media === '(max-width: 759.98px)').map((r) => r.selector)` equals exactly `['.history-list--records', '.history-list--branches', '.recipe-history__reason', '.recipe-history__outcome, .recipe-history__next, .recipe-history__empty']`.
- `[...new Set(historyRules.filter((r) => r.media !== undefined).map((r) => r.media))]` equals exactly `['(max-width: 759.98px)']`.

Comment the second assertion with what it buys: history.css carries one breakpoint, so a rule added under the touch union or any other condition forces a decision in this suite rather than shipping unguarded — which is the mode of failure Finding 1 arrived through.

Add nothing else. Do not touch any other test, and do not edit `history.css` in this task.
  </action>
  <verify>
    <automated>cd /Users/mark/Documents/projects/sprinkles && npm --prefix app test 2>&1 | tail -30</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && npm --prefix app test 2>&1 | grep -E "Tests +[0-9]+ (failed|passed)"</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -c "fourValueShorthands" app/src/styles/cross-cutting.test.js</automated>
  </verify>
  <done>
`npm --prefix app test` reports **1019 tests total: 1 failed, 1018 passed**, across 36 files. The single failure is in `cross-cutting.test.js`, in the extended test `'history keeps authored names wrappable and reduces nested indentation with logical properties on phone widths'` — this is the required proof that the guard bites. Any other failing test, or a passing run, is a stop-and-report: a green run here means the guard is vacuous and must be rewritten before Task 2 proceeds.

The failure output names the four-value shorthand (`fourValueShorthands` returning `["margin: var(--gap-hair) 0 0 var(--gap-l)"]` rather than `[]`) and the missing logical start offset — not merely a `toBeTruthy` on a rule lookup.

The new test from Change C **passes** on this unfixed tree: the narrow block itself is correct and is not what Finding 1 changes.

`grep -c "fourValueShorthands" app/src/styles/cross-cutting.test.js` is **3** — the definition and its two call sites in the loop body count once each per line.
  </done>
  <reversibility rating="reversible">Test-only additions to one uncommitted file.</reversibility>
</task>

<task type="auto">
  <name>Task 2: Restore the logical offsets and drop the dead state class (RTL-01, ORPHAN-03)</name>
  <files>app/src/styles/history.css, app/src/ui/RecipeHistory.jsx</files>
  <action>
Turn Task 1's guards green, and remove the orphan the extraction created. Re-read both files first; Task 1 changed no line in either, but the advisory line numbers below come from the pre-task tree.

**Finding 1 — `app/src/styles/history.css`, the two base rules at ~line 125 and ~line 145.** Both currently state their offsets as a `margin` shorthand whose fourth value is physical `margin-left`. Measured in a live browser with `dir="rtl"` on the page, the outcome paragraph computes a 32px left offset in BOTH directions while its own container correctly flips — and the narrow block at ~line 163 then adds a start offset on top, so at narrow RTL widths these paragraphs are indented from both edges.

Replace each shorthand with two logical longhands, keeping every value exactly as it is today:

- The grouped rule for the outcome and next-time paragraphs takes `margin-block: var(--gap-hair) 0;` and `margin-inline: var(--gap-l) 0;`, and keeps its existing `overflow-wrap` declaration unchanged.
- The empty-state rule takes `margin-block: var(--gap-s) 0;` and `margin-inline: var(--gap-l) 0;`.

The trailing zeroes are not decoration. At HEAD these paragraphs got their zeroed edges from a separate `margin: 0` reset in `app.css` that the extraction did not carry across, and neither stylesheet has a global paragraph reset — stating only a block start and an inline start would let a `<p>`'s UA block-end margin back in. `margin-block` and `margin-inline` are the two-value logical forms: block start then block end, inline start then inline end.

Leave the narrow media block at ~line 149-168 **exactly as it is**. Its `margin-inline-start: var(--gap-s)` is what should override the base rule's start edge at narrow widths, and with the base rule now logical it does so in both directions. Do not restate it, do not reorder it, and do not add a rule to it.

Change nothing else in this stylesheet — not the container rules, not the type-role group, not a comment.

**Finding 3 — `app/src/ui/RecipeHistory.jsx`, the `<li>` opening `VersionNode`'s return (~line 111).** It renders a ternary that appends a state class to the list item when the version is the one in view. The current-item treatment moved onto the inner `<article>` — which `HistoryItem` renders with its own state class and `aria-current` — and no rule in either stylesheet matches that state class on this list item any more. Replace the whole ternary with the bare structural class, so the element reads `<li className="recipe-history__version">`. Keep the structural class: it carries `min-width: 0` in history.css.

Do **not** touch the article's own current flag on the next line, and do not touch either `HistoryMarkers` call. The count of `current={isInView}` in this file must stay at 4.

Add no comment to `RecipeHistory.jsx` and no comment to `history.css` — the surrounding prose in both files is already accurate, and a comment naming what was removed re-fails the gates below.
  </action>
  <verify>
    <automated>cd /Users/mark/Documents/projects/sprinkles && npm --prefix app test 2>&1 | tail -20</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && npm --prefix app run build 2>&1 | tail -8</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -c 'margin-inline: var(--gap-l) 0;' app/src/styles/history.css</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -cE '^\s*(margin|padding):\s*\S+\s+\S+\s+\S+\s+\S+;' app/src/styles/history.css</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -c '<li className="recipe-history__version">' app/src/ui/RecipeHistory.jsx</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -c 'current={isInView}' app/src/ui/RecipeHistory.jsx</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -c 'margin-inline-start: var(--gap-s);' app/src/styles/history.css</automated>
  </verify>
  <done>
`npm --prefix app test` reports **1019 passed**, 36 files, zero failures — Task 1's guard is green because the stylesheet changed, not because the assertion was weakened.

`npm --prefix app run build` succeeds.

`grep -c 'margin-inline: var(--gap-l) 0;' app/src/styles/history.css` is **2** — both offset rules carry the logical inline pair.

The four-value shorthand grep returns **0** — no `margin` or `padding` shorthand anywhere in `history.css` states four values.

`grep -c '<li className="recipe-history__version">' app/src/ui/RecipeHistory.jsx` is **1** — the list item carries its structural class alone.

`grep -c 'current={isInView}' app/src/ui/RecipeHistory.jsx` is **4** — unchanged, so the article's flag and both marker calls were not touched.

`grep -c 'margin-inline-start: var(--gap-s);' app/src/styles/history.css` is **1** — the narrow override survives untouched.
  </done>
  <reversibility rating="reversible">Four declarations in an uncommitted stylesheet and one className in an uncommitted component; both are covered by the guard written in Task 1.</reversibility>
</task>

<task type="auto">
  <name>Task 3: Verify and close the three resolved todos (TODOS-04)</name>
  <files>.planning/todos/pending/2026-09-18-recipe-history-batch-is-current-is-emitted-with-no-rule.md, .planning/todos/pending/2026-09-18-the-standalone-batches-register-has-no-in-view-cue.md, .planning/todos/pending/2026-09-18-history-register-comment-still-describes-margin-left.md</files>
  <action>
All three todos dated 2026-09-18 in `.planning/todos/pending/` describe defects this extraction resolves. Verify each against the code **first**, then close it. Do not close one you cannot verify — report it instead.

**Read the tooling before using it.** Run the GSD todo verb with no arguments to see what it requires, and read what it does with the file rather than assuming a destination. It takes a bare filename — not a path — and it moves the file from `.planning/todos/pending/` to `.planning/todos/completed/`, stamping `completed: <today>` and `status: completed` into the frontmatter. Invoke it as `node /Users/mark/.claude/gsd-core/bin/gsd-tools.cjs query todo complete <filename>`, once per todo. It has a `--dry-run` that previews the move without mutating anything; use it first if you want to confirm the destination yourself. Create nothing by hand and move nothing by hand.

**Todo 1, the nested batch's dead state class.** It reports that `RecipeHistory.jsx` marked the batch in view with a state class no stylesheet answered. Confirm against the current tree that the batch entry now renders through `HistoryItem` with a current flag rather than a hand-written class, and that `history.css` answers the resulting state class twice: once with the shared outline, and once with a weight scoped through a child combinator to the batch head's own name element — so the weight reaches the identity and cannot reach the authored outcome or next-time prose beneath it, which was the original reason the weight was removed.

**Todo 2, the standalone Batches register's missing in-view cue.** It reports that the register's open entry was distinguished by marker words alone, and that the rule which would have carried the state had no caller. Confirm against `BatchRow.jsx` (~line 337) that the register's entry now renders through `HistoryItem` with a current flag, and that `history.css` bolds it through a child-combinator chain from the state class down through the register's identity wrapper to its name element. Confirm the element chain in the JSX actually matches that combinator chain — a `>` chain fails silently if a wrapper is missing.

**Todo 3, the stale comment.** It reports a comment inside the `.history-register` block in `app.css` still naming a physical edge the rule had stopped using. Confirm the block and its comment left `app.css` with the extraction, and that no surviving comment in `app.css` carries that stale sentence. The remaining occurrences of that physical property in `app.css` belong to other rules entirely and are out of scope — do not touch them.

Close all three only after all three verify. Do not edit the todo bodies; the verb owns the frontmatter stamp.
  </action>
  <verify>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -n 'current={isInView}\|current={isOpenBatch}' app/src/ui/RecipeHistory.jsx app/src/ui/BatchRow.jsx</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -n 'is-current' app/src/styles/history.css</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -c 'history-register__identity' app/src/ui/BatchRow.jsx app/src/styles/history.css</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -c 'shared right edge at width AND the whole-block drop' app/src/styles/app.css</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -n '^\.history-register' app/src/styles/app.css; echo "grep-exit=$?"</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && ls .planning/todos/pending/ | grep -c '^2026-09-18-'; echo "expect 0"</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && ls .planning/todos/completed/ | grep '^2026-09-18-'</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && grep -l 'status: completed' .planning/todos/completed/2026-09-18-*.md | wc -l</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && npm --prefix app test 2>&1 | grep -E "Tests +[0-9]+ (failed|passed)"</automated>
  </verify>
  <done>
Each todo was verified against the code before it was closed, and the SUMMARY records what proved each one.

`app/src/styles/history.css` shows the state class answered at four lines: the shared outline rule, and a three-selector weight group whose members are child-combinator chains to the register name, the version name, and the batch name.

`grep -c 'shared right edge at width AND the whole-block drop' app/src/styles/app.css` is **0**, and `grep -n '^\.history-register' app/src/styles/app.css` matches nothing (`grep-exit=1`) — the block and its comment left app.css with the extraction.

`.planning/todos/pending/` contains **no** file beginning `2026-09-18-`; `.planning/todos/completed/` contains all three, and **3** of them carry `status: completed`.

`npm --prefix app test` still reports **1019 passed** — closing todos changes no code.
  </done>
  <reversibility rating="reversible">Three markdown files moved between two directories by the project's own tooling; nothing is deleted.</reversibility>
</task>

<task type="auto">
  <name>Task 4: Commit the whole working tree on main as atomic commits (COMMIT-05)</name>
  <files>(git only — no source edits)</files>
  <action>
Commit everything: the pre-existing shared-history extraction AND the three fixes and three closures from Tasks 1-3.

Confirm the tree is green first: `npm --prefix app test` reports 1019 passed and `npm --prefix app run build` succeeds. Do not commit a red tree.

Then make **two** commits, in this order, staging by explicit path with `git add` — never `git commit -a`, and remember `app/src/ui/History.jsx`, `app/src/ui/History.test.jsx` and `app/src/styles/history.css` are untracked and need adding by name.

1. **The extraction and its corrections.** Everything under `app/` plus `DESIGN.md`. Run `git status --porcelain` first and stage exactly what it lists under those paths — the three new files above, plus `app/src/main.jsx`, `app/src/styles/app.css`, `app/src/styles/binder.test.js`, `app/src/styles/cross-cutting.test.js`, `app/src/styles/history.css`, `app/src/ui/BatchRow.jsx`, `app/src/ui/BatchRow.test.jsx`, `app/src/ui/RecipeHistory.jsx`, `app/src/ui/VersionRow.jsx`, `app/src/ui/VersionRow.test.jsx`.

   The extraction and the three corrections land in **one** commit because they share every file they touch: the corrections edit `history.css` and `cross-cutting.test.js`, which the extraction itself creates and rewrites, so there is no file-level split that leaves two self-consistent trees. Hunk-level staging is not available here (`git add -p` is interactive, and `git stash` is forbidden). Do not attempt a three-way split — instead make the corrections legible in the commit body, and say plainly in the SUMMARY that they are folded into the extraction commit and why.

2. **The closed todos.** `.planning/todos/` alone — the three deletions from `pending/` and the three additions to `completed/`. Nothing else under `.planning/` goes in this commit; the PLAN and SUMMARY are committed separately by the quick-task workflow.

Read `git log -1 --format=%B dc097cf` and `git log -1 --format=%B e7d2a10` first and match the house style: a subject line in the project's voice, then body paragraphs (the feature commits) or a short paragraph (the docs commits) — not a bare bullet dump. Write the bodies from what you actually changed. The first commit's body must name all three corrections: the offsets returning to logical properties so the outline holds in both directions, the exhaustive narrow-block assertion now covering the extracted stylesheet, and the list item losing a state class no rule answers.

End every commit message with these two trailer lines, exactly:

Co-Authored-By: Claude Opus 5 (1M context) &lt;noreply@anthropic.com&gt;
Claude-Session: https://claude.ai/code/session_011cHYYRAddzeKHZdteKfA1o

Because `git stash` is forbidden, no intermediate tree is checked out and re-tested. The two commits are ordered so each is self-consistent on its own; state that in the SUMMARY rather than claiming per-commit verification you did not run. Do not push. Do not create a branch.
  </action>
  <verify>
    <automated>cd /Users/mark/Documents/projects/sprinkles && npm --prefix app test 2>&1 | tail -8</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && npm --prefix app run build 2>&1 | tail -5</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && git status --porcelain -- app DESIGN.md .planning/todos; echo "git-exit=$?"</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && git log --oneline -2</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && git log -2 --format=%B > /tmp/cdg-msgs.txt; echo "git-exit=$?"; grep -c "Co-Authored-By: Claude Opus 5" /tmp/cdg-msgs.txt</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && git show --stat --oneline HEAD~1 > /tmp/cdg-stat.txt; echo "git-exit=$?"; tail -20 /tmp/cdg-stat.txt</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && git rev-parse --abbrev-ref HEAD</automated>
    <automated>cd /Users/mark/Documents/projects/sprinkles && git status -sb</automated>
  </verify>
  <done>
`npm --prefix app test` reports **1019 passed** and `npm --prefix app run build` succeeds, both on the committed tree.

`git status --porcelain` over `app`, `DESIGN.md` and `.planning/todos` prints **nothing** and reports `git-exit=0` — nothing from the change is left uncommitted and nothing was left untracked.

`git log --oneline -2` shows the two new commits, newest first: the closed todos, then the extraction with its corrections.

The trailer grep counts **2** — both commits carry the attribution lines.

`git show --stat HEAD~1` lists the eleven `app/` paths plus `DESIGN.md`, with `History.jsx`, `History.test.jsx` and `history.css` as new files.

`git rev-parse --abbrev-ref HEAD` reports **main**; no branch was created.

`git status -sb` shows `main` **ahead of** its upstream by the new commits and behind by none — they are local, nothing was pushed.
  </done>
  <reversibility rating="reversible">Two local commits on `main`, unpushed; `git reset --soft` restores the working tree exactly. (No reset is to be run as part of this task.)</reversibility>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored records → rendered markup | version names, reasons, tasting notes and next-time notes render as text only; no `dangerouslySetInnerHTML` anywhere under `app/src` — unchanged by this task |
| authored text → layout | user-authored prose of arbitrary length and script direction flows through the three nested offsets this task fixes |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-cdg-01 | Denial of Service | the nested offsets in `app/src/styles/history.css` | low | mitigate | A right-to-left reading of the outline currently indents three paragraphs from both edges at narrow widths, compounding with the container's own flipped indent and squeezing the reading measure toward unusable on a phone. Task 2 returns both rules to logical properties; Task 1's guard — the four-value shorthand check in particular — keeps a future edit from re-introducing it silently. |
| T-cdg-02 | Tampering | `app/src/styles/history.css` narrow block | low | mitigate | The extraction left history.css's `(max-width: 759.98px)` block outside the suite's exhaustive width-only-versus-touch-union list, so any rule added there shipped unguarded. Task 1's Change C restores an exhaustive assertion over the extracted file and pins it to exactly one `@media` condition. |
| T-cdg-03 | Information Disclosure | `app/src/ui/RecipeHistory.jsx` | low | accept | Removing a class from a list item changes no data path, no route, and no scoping; the version outline's recipe scoping is unchanged and already covered by its own test. |

No package-manager installs occur in this task, so no package-legitimacy gate applies and no `T-cdg-SC` row is opened.
</threat_model>

<verification>
Run on the final tree, after Task 4:

1. `npm --prefix app test` → **1019 passed**, 36 files. Any other number is drift: report it, do not adjust the expectation.
2. `npm --prefix app run build` → succeeds.
3. `git status --short` → nothing from this change left uncommitted; `HEAD` is `main`; two new commits ahead of `origin/main`; nothing pushed.
4. All three findings closed, each provable by its own gate in the task that owns it; all three todos in `.planning/todos/completed/`.

**Deferred to end-of-phase UAT (non-blocking, `human_verify_mode: end-of-phase`).** The RTL defect was measured in a live browser; the fix is verified here only as stylesheet text, because none of the three style-contract suites has a layout engine. Record as a UAT item: with `dir="rtl"` applied to the live page at a narrow width, confirm the outcome, next-time and empty-state paragraphs take their indent from the right edge alone and that their left edge is flush — and confirm at LTR that nothing moved, in particular that no paragraph gained a bottom margin. The project's own precedent says to confirm device defects on the device rather than in Chromium alone.

**Observations to record in the SUMMARY, not to fix here** (CLAUDE.md § 3 — name it, do not delete it):

- **The Batches register no longer closes at the bottom.** The standalone register's row rule moved from a `border-bottom` on every row to the shared `border-top`, so the last row has no rule beneath it — measured: last item `border-bottom: 0px none`, `border-top: 1px solid`. The deleted comment on the old rule said the bottom border was there so the block closes. **This is a design call for Mark, explicitly out of scope.** Do not change it and do not add a code comment about it.
- `app/src/styles/app.css` (~line 1677) has a comment telling the reader that the Batches panel's rows read the shared register family "above" — that family is now in `history.css`, so the direction is stale. Not one of the three findings; the surgical rule forbids rewriting it here.
</verification>

<success_criteria>
- **RTL-01:** both nested-offset rules in `history.css` state their offsets through `margin-block` and `margin-inline` at their existing token values; no rule in the file names a physical left or right edge; no `margin` or `padding` shorthand in the file states four values; the narrow media block is byte-for-byte unchanged.
- **GUARD-02:** `cross-cutting.test.js` asserts history.css's `(max-width: 759.98px)` block exhaustively by selector and pins that condition as the file's only one; the existing logical-property test covers all three nested offsets, resolving them by a margin-declaring filter rather than the first-match helper; the four-value shorthand is caught by its own assertion; and the whole guard was observed failing against the unfixed stylesheet before the fix landed.
- **ORPHAN-03:** the version list item in `RecipeHistory.jsx` carries its structural class alone; the article's current flag and both marker calls are untouched, with `current={isInView}` still appearing 4 times.
- **TODOS-04:** all three 2026-09-18 todos verified against the code, then moved to `.planning/todos/completed/` by the GSD todo verb with `status: completed` stamped; none edited by hand.
- **COMMIT-05:** the whole change — extraction plus these fixes plus the closures — is committed on `main` as two atomic commits with the attribution trailers; no branch, no push, no stash.
- Test count lands at **1019**; build passes.
- Every changed line traces to Finding 1, Finding 2 or Finding 3. The out-of-scope border finding is untouched.
</success_criteria>

<output>
Create `.planning/quick/260918-cdg-fix-the-rtl-margin-regression-and-media-/260918-cdg-SUMMARY.md` when done.

Record in it: the final test count against the 1019 expectation; the exact failure text Task 1's guard produced against the unfixed stylesheet, as the proof it bites; the declarations adopted for the two offset rules; what verified each of the three todos; the two commit SHAs and what each carries, including the plain statement that the corrections are folded into the extraction commit because no file-level split exists; the deferred RTL browser UAT item; and the two out-of-scope observations.
</output>
