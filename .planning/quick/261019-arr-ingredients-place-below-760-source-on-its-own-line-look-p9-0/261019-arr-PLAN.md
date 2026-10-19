---
phase: quick-261019-arr
plan: 01
quick_id: 261019-arr
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/shell.css
autonomous: true
requirements: [PLACE-01]

must_haves:
  truths:
    - "Below the 760 cut, an open entry's figure row on the Ingredients place reads as three lines: the figure and the amount on one line, the basis word under them, and the source text left-aligned on its own line under the basis. A long source, such as Heavy cream's Fat source, wraps under the basis instead of running into it (sketch 012 README decision 5, decide-p9-393-source-own-line)."
    - "At 760 and wider nothing changes. The top-level .place .ing__figures rules (shell.css lines 576-620) are untouched, so the four columns stay at 1366."
    - "Inside shell.css's @media (max-width: 759.98px) block, the rule for `.place .ing__figures tr` declares grid-template-areas 'fig amt' 'basis basis' 'src src', and the rule for `.place .ing__figures .ing__source` declares text-align: left. No other declaration in either rule changes, and no rule or token is added."
    - "The comment above the 760 block describes the new layout (the source on a line of its own, sketch 012 decision 5). It does not describe the old basis-beside-source layout."
    - "`npm --prefix app test` passes with no failures. The test count equals its base, because this item adds no test: 113 files and 3471 tests at 5b09c58a, or more if a sibling item (261019-arq, 261019-ars) merged first."
    - "Exactly one code commit, holding exactly app/src/styles/shell.css."
  artifacts:
    - path: app/src/styles/shell.css
      provides: "The phone-block figure row with the basis and the source each on a full-width line, and the source left-aligned"
  key_links:
    - from: "td.ing__source and td.ing__basis (IngredientsPlace.jsx line ~294, inside table.ing__figures)"
      to: "grid areas src and basis in `.place .ing__figures tr` under @media (max-width: 759.98px)"
      via: "the existing grid-area: basis and grid-area: src declarations (shell.css lines ~744 and ~750), which stay unchanged and now land on full-width rows"
      pattern: "'basis basis' 'src src'"
---

<objective>
Below the 760 cut on the Ingredients place, an open entry's figure row puts the source text on its own left-aligned line under the basis, per Mark's answer on decide-p9-393-source-own-line (redraw) and the approved redraw (look-p9-012-redraw), as recorded in sketch 012 README decision 5.

Purpose: at 393, a long source such as Heavy cream's Fat source ("panel reconciled three ways against a 36% regulatory floor") is currently squeezed into the right-hand auto column beside the basis word. On its own line it wraps under the basis and reads cleanly.

Output: two declarations changed in app/src/styles/shell.css inside the existing @media (max-width: 759.98px) block, plus the block's lead comment updated to describe the new layout. No test file changes. At planning time, grep found no test under app/src that pins the old areas or the source's alignment: shell.test.js pins no `.ing__figures` rule, and the IngredientsPlace tests read only the source's text and class. The orchestrator ruled out a jsdom layout test because jsdom has no grid layout. The verify gate instead reads the parsed rules through the existing css-source.js helper.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md

<interfaces>
The two rules as they stand at 5b09c58a in app/src/styles/shell.css, inside `@media (max-width: 759.98px)` (the block opens at line 683 and closes at line 755):
- `.place .ing__figures tr` (lines 719-726): display grid; grid-template-columns minmax(0,1fr) auto; grid-template-areas 'fig amt' 'basis src' (line 722); column-gap var(--gap-m); padding var(--gap-xs) 0; border-top var(--app-rule-row) solid var(--app-divider).
- `.place .ing__figures .ing__source` (lines 749-754): grid-area src; color var(--app-text-secondary); font-size var(--app-size-meta); text-align right (line 753).
- `.place .ing__figures .ing__basis` (lines 743-747) keeps grid-area basis and is not edited. With 'basis basis' it now spans both columns.
- The block's lead comment (lines 679-682) currently says the figures table reads "as a list, figure and amount over basis and source, as the ingredient table does below 724."

The authority is the sketch, which already carries the override: .planning/sketches/012-places/ingredients-place.html lines 6686-6687, the `.pc393 .place .ing__figures tr` areas and `.pc393 .place .ing__figures .ing__source` text-align left. Decision 5 in .planning/sketches/012-places/README.md (line 41) says: "Nothing else moves; no new token." It reports these WebKit measurements at 393 with the rules injected: Heavy cream open is 498 px, Cocoa powder 550.5, Milk Chocolate 587, with no horizontal overflow.

The test-side helper `readAllRules(cssText)` in app/src/styles/css-source.js returns one object per rule, `{ selector, declarations, media }`. `media` is the condition string, for example '(max-width: 759.98px)', and is undefined at top level. shell.test.js parses shell.css through it. Its file-wide gates (no hex, no bare px, every rule under .shell or .place, places media rules naming an nb__ or ing__ class, exactly five @media blocks) all stay satisfied by this change.
</interfaces>
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Source on its own left-aligned line below 760 (two declarations in shell.css's 760 block)</name>
  <files>app/src/styles/shell.css</files>
  <read_first>
    - app/src/styles/shell.css lines 676-755 (the 760 block's lead comment and every .ing__figures rule in it)
    - .planning/sketches/012-places/README.md line 41 (decision 5, which is the rule the build needs)
    - .planning/sketches/012-places/ingredients-place.html lines 6680-6687 (the .pc393 figures rules and the two override lines this change mirrors)
  </read_first>
  <action>
Precondition, worktree only: if app/node_modules is missing, run `ln -s /Users/mark/Documents/projects/sprinkles/app/node_modules app/node_modules` from the worktree root before any npm command. app/.gitignore line 10 ignores the symlink because its pattern has no trailing slash. Still, stage only the one file below by its explicit path, and never use `git add -A` or `git add .`.

Per sketch 012 README decision 5 (decide-p9-393-source-own-line, redraw; look-p9-012-redraw approved), make these edits in app/src/styles/shell.css, all inside the existing @media (max-width: 759.98px) block and nowhere else:

1. In the `.place .ing__figures tr` rule (line 722), change the grid-template-areas value from the two-row form to the three-row form 'fig amt' 'basis basis' 'src src'. Keep the same quoting style (single quotes, one space between row strings) and the same indentation. Leave grid-template-columns minmax(0,1fr) auto, the column-gap, the padding and the border-top as they are. The two-column track list stays; the basis and source rows simply span both columns.

2. In the `.place .ing__figures .ing__source` rule (line 753), change text-align from right to left. Leave grid-area src, the colour and the font size as they are.

3. Rewrite the block's lead comment (lines 679-682) so it no longer claims that the basis and the source share a line. Keep its first clause about the Notebook row and the Ingredients fields word for word. Then say that the figures table reads as a list, as the ingredient table does below 724: the figure and the amount on one line, the basis under them, and the source on a line of its own so a long one wraps under the basis (sketch 012 decision 5). Plain English, inside the same comment, with the same indentation. Do not quote the old areas string in the comment.

Nothing else moves (decision 5). Do not touch the top-level .place .ing__figures rules (lines 576-620), the 1100 block, the coarse-pointer block, the basis rule, any other stylesheet, tokens.css, any test file, IngredientsPlace.jsx, the sketch files, or anything under .planning/phases. 09-places-check.mjs reads only the source's text, which grep confirmed at planning time. Add no custom property and no new rule.

Then run the full suite and make one commit holding exactly app/src/styles/shell.css. Write the message in English, with the subject `style(places): source on its own line below 760 (decide-p9-393-source-own-line)` and a one-line body naming sketch 012 decision 5. The message must end with these two lines:
Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01D23VYRNqiLYsxmWdDFqhCG
  </action>
  <verify>
    <automated>cd app && node --input-type=module -e "import {readFileSync} from 'node:fs'; import {readAllRules} from './src/styles/css-source.js'; const r=readAllRules(readFileSync('src/styles/shell.css','utf8')); const M='(max-width: 759.98px)'; const tr=r.filter((x)=>x.media===M&&x.selector==='.place .ing__figures tr'); const s=r.filter((x)=>x.media===M&&x.selector==='.place .ing__figures .ing__source'); const ok=tr.length===1&&s.length===1&&/grid-template-areas:\s*'fig amt' 'basis basis' 'src src';/.test(tr[0].declarations)&&/text-align:\s*left;/.test(s[0].declarations)&&/text-align:\s*right/.test(s[0].declarations)===false; if(ok===false){console.error('phone-block figures rules not as decision 5 states');process.exit(1)} console.log('decision 5 rules present')" && cd .. && test "$(grep -c "'basis src'" app/src/styles/shell.css)" = 0 && npm --prefix app test -- shell && npm --prefix app test</automated>
  </verify>
  <done>
    The node gate prints "decision 5 rules present". It reads the parsed rules through readAllRules, so it checks only the two rules inside the 759.98 block. At 5b09c58a it exits 1, and on a scratch copy with the two edits applied it exits 0; both were confirmed at planning time. The grep count of the old two-row areas literal in shell.css is 0, down from a baseline of 1 at line 722; no comment carries it. The shell suite passes unchanged. `npm --prefix app test` passes with no failures at its base count: 113 files and 3471 tests at 5b09c58a, plus whatever a sibling item merged first adds. `git show --stat HEAD` lists exactly app/src/styles/shell.css. `git diff HEAD~1 -- app/src/styles/shell.css` shows only the two declaration lines and the lead comment changing.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| store/import → Ingredients place | Library entries can come from an imported backup, and their per-figure source text renders in td.ing__source. This item changes only where that cell sits and how it aligns, not how its text renders. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-arr-01 | Tampering | td.ing__source text in IngredientsPlace.jsx | low | accept | Layout only. The source stays a React text child and no markup path is added; dangerouslySetInnerHTML stays absent (T-09-06), as the escape case in IngredientsPlace.test.jsx line 441 still pins. No JSX changes in this item. |
| T-arr-02 | Denial of service | `.place .ing__figures tr` grid below 760 | low | accept | A long unbroken source string could widen the row. The source now gets the full row width instead of an auto column beside the basis, which lowers that risk. Decision 5 measured no horizontal overflow at 393 in WebKit with these exact rules. |
</threat_model>

<verification>
- The node gate in Task 1's verify prints "decision 5 rules present".
- `grep -c "'basis src'" app/src/styles/shell.css` prints 0.
- `npm --prefix app test` passes with no failures at its base count; this item adds no test.
- `npm --prefix app run build` succeeds.
- `git show --stat HEAD` lists exactly app/src/styles/shell.css.
- Deferred human verification, for the SUMMARY: the rendered layout cannot be proven by a text-level gate. Decision 5's WebKit measurements were taken on the 2026-10-19 build with these rules injected, not on this commit. The look to confirm is at 393 in WebKit, or on the iPhone from `npm --prefix app run build && npm --prefix app run preview -- --host`: with Heavy cream open, the Fat row reads figure and amount, then "unreviewed" or the basis word, then the source left-aligned on its own line, with no horizontal scroll. At 1366 the four columns are unchanged. The executor records this in the SUMMARY's "Deferred Human Verification" section and does not write to Mark's List; the orchestrator decides whether it becomes a row.
</verification>

<success_criteria>
Below the 760 cut, an open entry on the Ingredients place shows each figure as the figure and the amount on one line, the basis under them, and the source left-aligned on a line of its own, matching sketch 012's .pc393 board. At 760 and wider nothing changes. The only file touched is app/src/styles/shell.css, with no new token and no new rule. The full suite passes.
</success_criteria>

<output>
Create `.planning/quick/261019-arr-ingredients-place-below-760-source-on-its-own-line-look-p9-0/261019-arr-SUMMARY.md` when done
</output>
