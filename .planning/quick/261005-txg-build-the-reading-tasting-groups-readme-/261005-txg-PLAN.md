---
phase: quick-261005-txg
plan: 01
quick_id: 261005-txg
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/styles/notebook.css
  - app/src/ui/BatchRow.test.jsx
  - app/src/styles/notebook.test.js
  - .planning/quick/261005-txg-build-the-reading-tasting-groups-readme-/261005-txg-SUMMARY.md
autonomous: true
requirements: [BATCH2-02, OBS1-01]

# Prohibited (do not touch, do not stage): .impeccable/** (the batch brief's "not repeated as a
# suffix in reading" sentence is amended by the /impeccable document pass, Mark's List row
# run-impeccable-surface-removal, not here), DESIGN.md, PRODUCT.md, .planning/sketches/** (the
# sketch 011 README and every board, tasting-group-names.html included: read only),
# .planning/canvas-generators/** (read and copy only; never edit or run in place), CLAUDE.md,
# .planning/state.json, the 03.6 phase docs, app/src/styles/tokens.css (no new or changed token),
# app/src/styles/app.css, app/src/domain/**, app/src/store/**, every other app/src/ui file.

estimate:
  tokens: 50000
  raw_tokens: 50000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Sketch 011 README decision 58, Mark's answer (1) 'B' (2026-10-06): in the reading's Tasting fold the measured grid div.batch-row__cells.tasting-reading__conditions holds four cells in this order: Tempering, Tasting temperature, Melt test, Melt style; the Melt group and its heading are gone; a blank melt value still reads 'not measured'."
    - "The marked axes split by axis.group into two groups, each div.tasting-reading__group headed by an h4 with class 'batch-row__group-label batch-row__group-label--cue': 'Every recipe' (core: Hardness, Scoopability, Smoothness, Sweetness) then 'This recipe only' (declared: Body, Oil); each is drawn only when it holds a mark; the 'Observations' heading is gone."
    - "The picked problems stand under an h4 'Any problems?' with class 'batch-row__group-label' only (Next time's caption face, per Mark's note of 2026-10-06), split into div.tasting-reading__subgroup blocks: an h5 'Every recipe' over the picked DEFECTS words and an h5 'This recipe only' over Bitter, both h5s with class 'batch-row__group-label batch-row__group-label--cue', each block's words in span.app-hand.tasting-reading__problems joined by ' · '; a block with no word is left out, and with nothing picked the Any problems? group is left out."
    - "Mark's answer (2) 'B2': in the log the four names (the two h4s over the marks, the two h5s over the problems) read in decision 40's cue face: font-size var(--app-size-meta), weight 600, text-transform none, letter-spacing 0, line-height var(--app-notebook-pen-cue-line-h), colour var(--app-text); Any problems? and Next time keep the caps grey label face; a second problems block stands var(--gap-l) below the first; the problems line takes margin-top 0 inside a block."
    - "Board against build: the scratch copy of tgroups-conform.mjs, run on a copy of the new app/dist against the three B2 panels of tasting-group-names.html (full, seeded, sparse) at 1366 and 393 in Playwright WebKit and system Chrome, reports 0 off, including a face check on every group heading; or the SUMMARY records exactly why it could not run and lists the comparison as deferred."
    - "npm --prefix app test passes in full (tabindex-scan included); npm --prefix app run build exits 0; the test commit comes before the feat commit; only the four app files in files_modified change."
  artifacts:
    - path: app/src/ui/BatchRow.jsx
      provides: "TastingReading: melt cells in the conditions grid; marks split under Every recipe and This recipe only; Any problems? with two subgroup blocks; the amended code comment"
      contains: "batch-row__group-label batch-row__group-label--cue"
    - path: app/src/styles/notebook.css
      provides: "the modifier-scoped cue face for the four names, the second-block gap, the block's zero line margin"
      contains: ".notebook-log .batch-row__group-label--cue"
    - path: app/src/ui/BatchRow.test.jsx
      provides: "the amended pins and the new decision 58 cases (marks' split, problems' split, the melt cells' place)"
      contains: "decision 58"
    - path: app/src/styles/notebook.test.js
      provides: "the CSS pins for the cue face rule, its source order and the subgroup spacing"
      contains: "decision 58"
  key_links:
    - from: "TastingReading markedAxes"
      to: "two h4 group names"
      via: "filter by axis.group === 'core' / 'declared' (axesForBatch returns core then the snapshot's declared axes)"
      pattern: "axis\\.group === 'core'"
    - from: "TastingReading batch.tasting.defects and bitterDeclared"
      to: "the two h5 problem blocks"
      via: "defects -> Every recipe block; bitterDeclared -> DECLARED_FLAW in the This recipe only block (the pen's defect-group--core / defect-group--declared split)"
      pattern: "tasting-reading__subgroup"
    - from: "h4/h5 .batch-row__group-label--cue"
      to: "notebook.css cue face rule"
      via: "same two-class specificity as the base .notebook-log .batch-row__group-label rule, placed after it in source order"
      pattern: "\\.notebook-log \\.batch-row__group-label--cue"
---

<objective>
Build Mark's answers on sketch 011 README decision 58 (2026-10-06): Melt = B and names = B2. In the reading state of a batch's Tasting fold:
- Melt test and Melt style join the measured cells at the top, after Tasting temperature, and the Melt group goes (B).
- The marked axes split under the pen's own two names, Every recipe and This recipe only.
- Any problems? replaces Problems in Next time's caption face, and under it the picked words split the same two ways, as the pen splits its chips.
- The four names (two over the marks, two over the problems) take the pen's cue face through a modifier-scoped rule in notebook.css (B2).
Options A and C are not built.

Purpose: the reading names the same fields with different words and a different face from the pen (decision 58 findings (1), (2), (d), (e)). Mark's note made the reading follow the pen's structure, and his answers fixed where melt goes and the names' face.
Output: TastingReading in BatchRow.jsx, one face rule and two spacing rules in notebook.css, test-first cases in BatchRow.test.jsx and notebook.test.js, a board-against-build check in WebKit and Chrome, and a SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Spec: .planning/sketches/011-recipe-route-c/README.md decision 58, lines 688 to 699. The "App change brief" is line 696, "What stays as built" is line 695, the options are line 692 and Mark's answers are line 699. Read it; do not edit it. Another agent (Sid) may be editing that README, its boards and .planning/canvas-generators while you work.

Facts the planner read (do not re-derive):
- HEAD at planning time: 4abf5a2. Nothing is staged. The untracked .impeccable/critique/* files and .planning/phases/03.6-per-step-shared-ingredients/.gitkeep are not yours. Never stage them. Never run `git add -A`, `git add .`, `git stash`, `git checkout -- .`, `git reset --hard` or `git clean`. Every commit uses the pathspec form, `git commit -m "<message>" -- <paths>`, which commits only the named paths. Work on main, in order, with no worktree.
- app/src/ui/BatchRow.jsx: `TastingReading` is lines 251 to 363, and its code comment is lines 237 to 250. Line 244 to 245 hold the parenthetical you amend (Bitter stored separately; the classification not repeated in reading). `markedAxes` is line 254 and `defectWords` lines 255 to 258. The conditions grid is lines 274 to 297 (Tempering, then Tasting temperature). The note is line 298. The Observations group is lines 299 to 311. The Problems comment is lines 312 to 314 and its group lines 315 to 320. The Melt group is lines 321 to 344; its two cells are lines 324 to 334 (Melt test, unit " g lost at 20 min") and 335 to 342 (Melt style). Imports already in place: `DEFECTS`, `DECLARED_FLAW` (line 4), `axesForBatch`, `readMarkWord` (line 5). `axesForBatch(batch)` returns the four core axes, then the batch snapshot's declared axes; each axis carries `group: 'core' | 'declared'` (app/src/domain/axes.js lines 18 to 23, 49 to 55). The pen splits problems the same way: `batch.tasting.defects` (the four DEFECTS words) is its `defect-group--core`, and `bitterDeclared` (shown as DECLARED_FLAW, 'Bitter') is its `defect-group--declared` (BatchRow.jsx lines 918 to 960). The comment on lines 32 to 39 concerns the pen's own field row (TASTING_MEASURED_FIELDS) and stays as it is. BatchRow renders only inside `aside.notebook-log` (app/src/ui/RecipePage.jsx line 2220), so a `.notebook-log`-scoped rule reaches every reading.
- The board, B2 panels (.planning/sketches/011-recipe-route-c/tasting-group-names.html; each panel is one line of about 47,000 characters, lines 51406, 51408 and 51410 for 1366, so do not Read those lines whole). The structure, read by the planner from the B2 full-batch panel and the B2 seeded panel:
  - The conditions div holds four batch-row__cell children: Tempering, Tasting temperature, Melt test, Melt style. Each keeps its built markup.
  - The note follows.
  - Next comes a div.tasting-reading__group with an h4.batch-row__group-label "Every recipe" and a div.batch-row__cells.tasting-reading__axes of the core cells. A second group follows, its h4 reading "This recipe only", over the declared cells.
  - Then a div.tasting-reading__group with h4.batch-row__group-label "Any problems?" carrying no extra style. Inside it, a div.tasting-reading__subgroup holds h5.batch-row__group-label "Every recipe" and span.app-hand.tasting-reading__problems with inline margin-top 0. A second div.tasting-reading__subgroup carries inline `margin-top: var(--gap-l)` and holds h5 "This recipe only" and the same span.
  - The four names (both h4 marks' names and both h5s) carry the inline style font-size var(--app-size-meta), font-weight 600, text-transform none, letter-spacing 0, line-height var(--app-notebook-pen-cue-line-h), color var(--app-text).
  - In the seeded panel (Bitter only), the single subgroup is "This recipe only" with no top margin. So the gap belongs to a block that follows another block, not to the declared block as such.
  - A group or block with nothing in it is not drawn. The board's own CSS adds nothing else for these elements.
- CSS today: the base face is `.notebook-log .batch-row .region-name, .notebook-log .tasting-reading .region-name, .notebook-log .batch-row__group-label` (app/src/styles/notebook.css lines 805 to 814: label size, 600, label tracking, uppercase, --app-text-secondary). The next rule is `.notebook-log .tasting-reading > .region-name` (lines 819 to 821). The pen's cue face is `.notebook-log .axes-cue` (lines 1079 to 1086); it is the face B2 copies. app/src/styles/app.css (do not edit) gives `.batch-row__group-label` the margin 0 0 var(--gap-xs) (6px name to content), `.tasting-reading__group` margin-top var(--gap-l), and `.tasting-reading__problems` margin var(--gap-s) 0 0 (lines 1547 to 1568). Tokens exist: --gap-xs 6px, --gap-l 32px, --app-size-meta 14px, --app-notebook-pen-cue-line-h 20px, --app-text. No CSS rule anywhere targets the melt group's grid class, so dropping that group leaves no orphan rule.
- notebook.test.js reads notebook.css as text through `readAllRules` (app/src/styles/css-source.js): each rule is `{ selector, declarations, media }`, and a grouped selector is one string joined by ", ". Its top guards forbid hex colours and bare px values in notebook.css, and require every selector to start with `.notebook`. The decision 40 describe (lines 730 to 772) is the pattern: local `find(selector, media)` and `declares(rule, property, value)` helpers, and a source-order check through `rules.indexOf`.
- BatchRow.test.jsx renders with renderToStaticMarkup (no jsdom). `renderBatchRow(props)` is line 60. The seeded fixture `augustSecondBatch` (app/src/data/batch-2026-08-02.js) has tasting marks { sweetness: 4, oil: 4 }, defects null, bitterDeclared true, temperingMinutes absent, tastingTempC -12 (renders "−12", U+2212), meltTestG 3, meltStyle null and no note. The Olive Oil snapshot's declared axes are ['Body', 'Oil']. The read-view describe is lines 1444 to 1575. The pins this plan changes: line 1486 (Melt test cell), line 1525 (the Problems h4, line 1528), line 1532 (joined words with Bitter, line 1539), line 1543 (no defects line) and line 1559 (the order test, which reads '>Observations<' and '>Melt<'). The pen cases that read '>Every recipe<' (lines 628 to 654) render AxesGrid alone, and the defects cases (lines 802 to 835) render recording mode with no openBatch, so the reading's new names cannot reach them.
- A previous executor once committed a feat on a red suite because the commit was chained after a pipe that hid the test exit code. Run each test and build command on its own, never through grep or tail, read its exit status, and only then commit.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The reading's tasting groups under the pen's names, test first (decision 58, B and B2)</name>
  <files>app/src/ui/BatchRow.test.jsx, app/src/styles/notebook.test.js, app/src/ui/BatchRow.jsx, app/src/styles/notebook.css</files>
  <read_first>
    - .planning/sketches/011-recipe-route-c/README.md lines 688 to 699 (decision 58; read only)
    - app/src/ui/BatchRow.jsx lines 1 to 13, 237 to 363, 912 to 960
    - app/src/styles/notebook.css lines 800 to 822 and 1070 to 1100
    - app/src/styles/app.css lines 1536 to 1568 (read only)
    - app/src/ui/BatchRow.test.jsx lines 1 to 75 and 1440 to 1575
    - app/src/styles/notebook.test.js lines 1 to 30 and 725 to 772
  </read_first>
  <behavior>
    Every new or amended case carries a short English comment naming sketch 011 README decision 58, Mark's answers B and B2 (2026-10-06). Exact strings below are renderToStaticMarkup output. "C" stands for the class string `batch-row__group-label batch-row__group-label--cue`.
    BatchRow.test.jsx, amended in place in the read-view describe:
    - R1 (line 1486): the Melt test cell follows the Tasting temperature cell directly in the conditions grid. One regex: the Tasting temperature cell as pinned today, then `</div><div class="batch-row__cell"><span class="batch-row__cell-label">Melt test</span><span class="batch-row__cell-value">3<span class="batch-row__unit"> g lost at 20 min</span></span></div>`. Fails before.
    - R2 (line 1525, retitled for "Any problems?" and the This recipe only block, the seeded case): the markup contains `<div class="tasting-reading__group"><h4 class="batch-row__group-label">Any problems?</h4><div class="tasting-reading__subgroup"><h5 class="C">This recipe only</h5><span class="app-hand tasting-reading__problems">Bitter</span></div></div>` (with C expanded), and no `>Problems</h4>`. Fails before.
    - R3 (line 1532, retitled: picked words and the declared flaw in two blocks): defects ['Sandy, gritty', 'Greasy film'] with bitterDeclared true. The markup contains `<h4 class="batch-row__group-label">Any problems?</h4><div class="tasting-reading__subgroup"><h5 class="C">Every recipe</h5><span class="app-hand tasting-reading__problems">Sandy, gritty · Greasy film</span></div><div class="tasting-reading__subgroup"><h5 class="C">This recipe only</h5><span class="app-hand tasting-reading__problems">Bitter</span></div></div>`, and does not contain `Greasy film · Bitter`. Fails before.
    - R4 (line 1543, extended): with defects null and bitterDeclared null, the reading markup also contains none of `Any problems?`, `tasting-reading__subgroup` or `tasting-reading__problems`. Passes before (a guard).
    - R5 (line 1559, retitled "reads conditions with the melt cells, then own words, then Every recipe, This recipe only, Any problems?"): with the seeded batch plus a note, these indexes rise strictly in this order: 'tasting-reading__conditions', '>Melt test<', 'tasting-reading__note', '>Every recipe</h4>', '>This recipe only</h4>', '>Any problems?</h4>'. The markup contains no '>Melt</h4>'. Fails before.
    BatchRow.test.jsx, one new describe after the read-view describe, "BatchRow — the reading's tasting groups under the pen's names (sketch 011 README decision 58: Melt B, names B2)":
    - G1 marks, both groups (seeded): the markup contains `<div class="tasting-reading__group"><h4 class="C">Every recipe</h4><div class="batch-row__cells tasting-reading__axes"><div class="batch-row__cell"><span class="batch-row__cell-label">Sweetness</span><span class="batch-row__cell-value">more (4)</span></div></div></div><div class="tasting-reading__group"><h4 class="C">This recipe only</h4><div class="batch-row__cells tasting-reading__axes"><div class="batch-row__cell"><span class="batch-row__cell-label">Oil</span><span class="batch-row__cell-value">strong (4)</span></div></div></div>`, and no '>Observations<'. Fails before.
    - G2 all six marked (hardness 4, scoopability 3, smoothness 2, sweetness 4, body 4, oil 5; defects null, bitterDeclared null): the cell labels between '>Every recipe</h4>' and '>This recipe only</h4>' are exactly Hardness, Scoopability, Smoothness, Sweetness, in order. Those between '>This recipe only</h4>' and '</section>' are exactly Body, Oil. Fails before.
    - G3 core marks only (marks { hardness: 3, smoothness: 4 }, bitterDeclared true): the markup contains `<h4 class="C">Every recipe</h4>` and the Hardness and Smoothness cells. It does not contain `<h4 class="C">This recipe only</h4>`. It does contain `<h5 class="C">This recipe only</h5>`: the problems block is a different heading. Fails before.
    - G4 declared marks only (marks { oil: 4 }): no `<h4 class="C">Every recipe</h4>`; `<h4 class="C">This recipe only</h4>` followed by the Oil cell. Fails before.
    - G5 none marked (marks {}): neither h4 name and no 'tasting-reading__axes'. Passes before (a guard).
    - G6 problems, core only (defects ['Coarse, icy'], bitterDeclared null): the markup contains `<div class="tasting-reading__group"><h4 class="batch-row__group-label">Any problems?</h4><div class="tasting-reading__subgroup"><h5 class="C">Every recipe</h5><span class="app-hand tasting-reading__problems">Coarse, icy</span></div></div>` and no `<h5 class="C">This recipe only</h5>`. Fails before. (Declared only is R2, both is R3, none is R4.)
    - G7 the melt cells' place (seeded): the markup contains exactly this grid: `<div class="batch-row__cells tasting-reading__conditions"><div class="batch-row__cell"><span class="batch-row__cell-label">Tempering</span><span class="batch-row__unit batch-row__unit--absent">not measured</span></div><div class="batch-row__cell"><span class="batch-row__cell-label">Tasting temperature</span><span class="batch-row__cell-value">−12<span class="batch-row__unit"> °C</span></span></div><div class="batch-row__cell"><span class="batch-row__cell-label">Melt test</span><span class="batch-row__cell-value">3<span class="batch-row__unit"> g lost at 20 min</span></span></div><div class="batch-row__cell"><span class="batch-row__cell-label">Melt style</span><span class="batch-row__unit batch-row__unit--absent">not measured</span></div></div>`. Fails before.
    - G8 no Melt group: the markup contains neither '>Melt</h4>' nor 'tasting-reading__melt'. Fails before.
    - G9 a tasting with no marks and no problems (marks {}, defects null, bitterDeclared null): the section markup (from '<section class="tasting-reading"' to the next '</section>') contains no 'tasting-reading__group'. Its conditions grid's cell labels are exactly Tempering, Tasting temperature, Melt test, Melt style. Fails before.
    notebook.test.js, one new describe at the end, "the reading's four group names take the pen's cue face (sketch 011 decision 58 B2, Mark 2026-10-06; quick 261005-txg)", with its own local find and declares helpers copied from the decision 40 describe:
    - N1: the top-level rule `.notebook-log .batch-row__group-label--cue` declares font-size var(--app-size-meta), font-weight 600, text-transform none, letter-spacing 0, line-height var(--app-notebook-pen-cue-line-h) and color var(--app-text). Its index in `rules` is greater than the index of the top-level rule whose selector, split on ',' and trimmed, includes `.notebook-log .batch-row__group-label`. Fails before.
    - N2: `.notebook-log .tasting-reading__subgroup + .tasting-reading__subgroup` declares margin-top var(--gap-l), and `.notebook-log .tasting-reading__subgroup > .tasting-reading__problems` declares margin-top 0. Fails before.
    - N3: that base grouped rule still declares text-transform uppercase and color var(--app-text-secondary), so Any problems? and Next time keep their face. Passes before (a guard).
  </behavior>
  <action>
RED. Write R1 to R5, G1 to G9 and N1 to N3 exactly as the behavior block says. Follow each file's existing helpers and house style. In BatchRow.test.jsx, change no case outside R1 to R5. Build fixtures by spreading augustSecondBatch and its tasting, as the existing cases do.

Run `npm --prefix app test -- BatchRow.test notebook.test` on its own and read its exit status. These must fail: R1, R2, R3, R5, G1 to G4, G6 to G9, N1 and N2. These must pass: R4, G5, N3 and every other existing case in the two files. If a guard fails, the expectation or the fixture is wrong, not the app: find out why before going on. Record each RED failure message for the SUMMARY.

Run `git status --porcelain` and check that only the two test files are yours. Commit only them: `git commit -m "test(261005-txg): pin the reading's tasting groups under the pen's names" -- app/src/ui/BatchRow.test.jsx app/src/styles/notebook.test.js`. End the message with the two attribution trailer lines from your own system reminder (Co-Authored-By and Claude-Session). Do not push.

GREEN, per decision 58's App change brief and Mark's answers B and B2:
(1) app/src/ui/BatchRow.jsx, TastingReading, the measured cells (B): move the Melt test cell and the Melt style cell, their markup unchanged, from the Melt group into the conditions grid, directly after the Tasting temperature cell. Then delete the Melt group entirely: its wrapper div, its h4 and its own cells grid.
(2) The marks: in place of the single Observations group, split markedAxes by axis.group into the core axes and the declared axes. Draw a div.tasting-reading__group for each, in this order: Every recipe for core, then This recipe only for declared. Each group holds an h4 with className exactly `batch-row__group-label batch-row__group-label--cue`, then the same `batch-row__cells tasting-reading__axes` grid of cells the Observations group draws today (label, then the `${readMarkWord(...)} (${n})` value). Draw a group only when it holds at least one mark. A small local helper inside TastingReading, used for both groups, is fine (your choice; say which in the SUMMARY).
(3) The problems: replace defectWords with two lists. The core list is batch.tasting.defects, or empty when that is null. The declared list is [DECLARED_FLAW] when bitterDeclared is set, and empty otherwise. When either list has a word, draw a div.tasting-reading__group with an h4 of className `batch-row__group-label` (no modifier: it keeps Next time's face, per Mark's note of 2026-10-06) reading "Any problems?". Under that h4, draw one div.tasting-reading__subgroup per non-empty list, core first. Each holds an h5 with className `batch-row__group-label batch-row__group-label--cue` ("Every recipe" or "This recipe only"), then a span with className `app-hand tasting-reading__problems` holding that list's words joined by ' · '. Put no inline style on any element: the spacing comes from CSS in step (5). The group order in the body is: conditions, note, Every recipe, This recipe only, Any problems?.
(4) Comments, in English. In the TastingReading comment, replace the parenthetical about Bitter being stored separately and the classification not being repeated in reading with a short sentence: the reading now heads the marks and the picked words with the pen's own two names, Every recipe and This recipe only, under sketch 011 README decision 58 (Mark's answers B and B2, 2026-10-06), Any problems? heads the picked words in Next time's caption face, and melt test and melt style stand with the measured cells at the top. Replace the old Problems JSX comment with a one-line comment for the Any problems? group that cites decision 58. Every other comment stays as it is.
(5) app/src/styles/notebook.css (B2): directly after the `.notebook-log .tasting-reading > .region-name` rule, add a short English comment citing sketch 011 decision 58 B2 and the board tasting-group-names.html, then three rules:
- `.notebook-log .batch-row__group-label--cue`, which carries decision 40's `.axes-cue` face: font-size var(--app-size-meta); font-weight 600; text-transform none; letter-spacing 0; line-height var(--app-notebook-pen-cue-line-h); color var(--app-text). It has the same two-class specificity as the base grouped rule above it, so its place after that rule is what makes it win; the comment says so.
- `.notebook-log .tasting-reading__subgroup + .tasting-reading__subgroup` with margin-top var(--gap-l): the board's 32px between the two blocks, on whichever block follows another.
- `.notebook-log .tasting-reading__subgroup > .tasting-reading__problems` with margin-top 0: the board's inline zero, so a name sits its own 6px label margin above its words.
Use no literal value other than 600, 0 and none (the same as the `.axes-cue` rule), and no new token.

Change nothing else. Leave alone the Tasting fold head, Tempering and Tasting temperature, the note, the cell markup and words ("hard (4)", "not measured"), Next time, the pen (AxesGrid, the defects chips, the melt block at the pen's foot), app.css and tokens.css. Add no button or link (the tabindex scan is unaffected). Render every word as a React text child; add no raw-HTML path.

Run `npm --prefix app test -- BatchRow.test notebook.test` on its own and read its exit status. Every case passes, old and new. If an existing case outside R1 to R5 fails, stop and report it; do not weaken it. Commit only the two source files: `git commit -m "feat(261005-txg): head the reading's tasting groups with the pen's names" -- app/src/ui/BatchRow.jsx app/src/styles/notebook.css`, with the same two trailer lines. Do not push.
  </action>
  <verify>
    <automated>npm --prefix app test -- BatchRow.test notebook.test</automated>
  </verify>
  <acceptance_criteria>
    - The test commit comes before the feat commit. In the RED run, R1, R2, R3, R5, G1 to G4, G6 to G9, N1 and N2 failed, and R4, G5, N3 and every other existing case in the two files passed. The SUMMARY records the failure messages.
    - `grep -c "batch-row__group-label batch-row__group-label--cue" app/src/ui/BatchRow.jsx` returns at least 1.
    - `grep -c "tasting-reading__subgroup" app/src/ui/BatchRow.jsx` returns at least 1.
    - `grep -c ">Observations<" app/src/ui/BatchRow.jsx` returns 0.
    - `grep -c "read view does not" app/src/ui/BatchRow.jsx` returns 0 (the old parenthetical is gone).
    - `grep -c "decision 58" <file>` returns at least 1 for each of app/src/ui/BatchRow.jsx, app/src/styles/notebook.css, app/src/ui/BatchRow.test.jsx and app/src/styles/notebook.test.js.
    - `grep -c "^\.notebook-log \.batch-row__group-label--cue {" app/src/styles/notebook.css` returns 1.
    - `grep -v '^\s*//' app/src/ui/BatchRow.jsx | grep -c dangerouslySetInnerHTML` returns 0.
    - `npm --prefix app test -- BatchRow.test notebook.test` exits 0.
    - `git show --name-only --format= HEAD` lists only app/src/ui/BatchRow.jsx and app/src/styles/notebook.css. `git show --name-only --format= HEAD~1` lists only the two test files.
  </acceptance_criteria>
  <done>The reading's Tasting fold reads the measured grid with the melt cells at its end. The marks stand under Every recipe and This recipe only, and the picked words stand under Any problems? in two blocks named the same way. Each group and block is drawn only when it holds something. In the log the four names wear the pen's cue face, while Any problems? and Next time keep the caps grey label face. There are two commits, test then feat, each holding only its own paths.</done>
</task>

<task type="auto">
  <name>Task 2: Full suite, build, and the board against the build in WebKit and Chrome</name>
  <files>(none in the repo; scratch files only, in your session scratchpad)</files>
  <read_first>
    - .planning/canvas-generators/tgroups-conform.mjs (whole file, 62 lines; read and copy only)
    - .planning/canvas-generators/tgroups-page.mjs lines 1 to 30 (install, __restore, __ov; with overlay 'none', __ov returns at once and __restore only records the section)
  </read_first>
  <action>
Run `npm --prefix app test` (the full suite, app/src/ui/tabindex-scan.test.js included), then `npm --prefix app run build`. Run each on its own and read its exit status. If a test outside the two touched test files fails because of Task 1, stop and report it; do not edit another file to make it pass. Only one Vite process may run per workspace (CLAUDE.md). The build is not a server: start no dev server and no preview here.

Board against build (the sketch is the authority, compared in a browser rather than from CSS source). Work only in your session scratchpad directory: never /tmp, never inside the repo.
(a) Copy app/dist to the scratchpad as `txg-dist` with `cp -R`, so the measured build cannot change under the run.
(b) Copy .planning/canvas-generators/tgroups-conform.mjs to the scratchpad as `txg-conform.mjs`. Edit only the copy:
- Rewrite its two relative imports, the probe harness under .planning/phases/03.5-separate-the-recipe-from-the-sheet/ and ./tgroups-page.mjs, to absolute paths under the checkout root (from `git rev-parse --show-toplevel`). Leave the absolute playwright-core import as it is.
- Replace PANELS with the three B2 panels driven with overlay 'none', because the build is now B2 and nothing needs laying on it: b2 maps to ['full', 'none'], seed-b2 to ['seed', 'none'] and sparse-b2 to ['sparse', 'none'].
- In `read`, for the read kind, add a `faces` list. For every `.batch-row__group-label` inside the section, one string: its trimmed text, then its computed font-size, line-height, font-weight, text-transform, letter-spacing and color. After the existing read-kind checks, add one check per panel that the panel's faces list equals the page's.
(c) Run `node <scratchpad>/txg-conform.mjs <scratchpad>/txg-dist 1366,393 webkit,chrome` with a long timeout (up to ten minutes) and read its exit status. It serves the copy on throwaway 127.0.0.1 ports, never :4173, and starts no Vite. Keep its full output for the SUMMARY: the check count, the number off, and each panel's line.
(d) If every check passes, you are done. If a check is off, measure the panel and the page side by side to find where. If the difference is in the reading's new structure (the four names, Any problems?, the subgroups and their spacing, the conditions grid), correct app/src/ui/BatchRow.jsx or app/src/styles/notebook.css so it matches the panel. Add or adjust the failing pin first, rerun the targeted and the full suite and the build, each on its own, and commit by pathspec as `fix(261005-txg): <what>` with the trailer lines. If the difference lies outside that structure (drift since the board's capture of 2026-10-05 09:44), do not fix it: record it in the SUMMARY.
(e) If the run cannot start (a missing module path, no system Chrome at the harness's path), try `webkit` alone. If that fails too, record the exact error in the SUMMARY and list the side-by-side comparison under Deferred Human Verification. Do not block on it.

Never edit, write in or run in place anything under .planning/canvas-generators or .planning/sketches.
  </action>
  <verify>
    <automated>npm --prefix app test && npm --prefix app run build</automated>
  </verify>
  <acceptance_criteria>
    - `npm --prefix app test` passes in full, including tabindex-scan.test.js.
    - `npm --prefix app run build` exits 0.
    - The scratch conformance run over the three B2 panels at 1366 and 393 in WebKit and Chrome reports 0 off, faces check included. If it does not, its output and the reason are recorded for the SUMMARY.
    - `git status --porcelain -- .planning/canvas-generators .planning/sketches` shows no change made by you.
  </acceptance_criteria>
  <done>The full suite and the build pass. The new build has been compared, panel by panel, with the B2 panels of tasting-group-names.html in WebKit and Chrome at 1366 and 393, or the reason it could not be is written down.</done>
</task>

<task type="auto">
  <name>Task 3: Scope check and SUMMARY</name>
  <files>.planning/quick/261005-txg-build-the-reading-tasting-groups-readme-/261005-txg-SUMMARY.md</files>
  <read_first>
    - .planning/quick/261005-t32-build-the-blocked-save-sentence-in-the-b/261005-t32-SUMMARY.md (the SUMMARY shape and its Deferred Human Verification section)
  </read_first>
  <action>
Scope check; every item must hold. Sid may commit his own files meanwhile, so these checks read app/ and your own commits only:
- `git status --porcelain -- app/` prints nothing.
- `git diff --name-only 4abf5a2..HEAD -- app/` lists only app/src/ui/BatchRow.jsx, app/src/styles/notebook.css, app/src/ui/BatchRow.test.jsx and app/src/styles/notebook.test.js.
- `git diff --name-only 4abf5a2..HEAD -- app/src/styles/tokens.css app/src/styles/app.css app/src/domain app/src/store` prints nothing.
- Your commits (git show --name-only on each) touch nothing under .impeccable, DESIGN.md, PRODUCT.md, .planning/sketches, .planning/canvas-generators, CLAUDE.md or .planning/state.json.
- Nothing is pushed.

Write 261005-txg-SUMMARY.md in the 261005-t32 shape, in plain English. Cover:
- what changed: the melt cells moved into the conditions grid and the Melt group dropped; the marks split; Any problems? and its two blocks; the modifier and its three rules; the amended comment;
- the choices made at discretion: the modifier name `batch-row__group-label--cue`, the sibling rule that puts the 32px on whichever block follows another, the zero margin kept from the board, the local helper if you used one, and notebook.test.js added as the home of the CSS pins (it already pins decision 40's face);
- the commits;
- each case, R1 to R5, G1 to G9 and N1 to N3, with its RED result or guard status;
- the full-suite file and test counts and the build result;
- the board-against-build run: the command shape, checks and offs per engine and width, or why it did not run.

Add a short note. The batch brief .impeccable/surfaces/route-recipe-batch.md still says the recipe-specific classification "is not repeated as a suffix in reading". Decision 58 routes that amendment to the /impeccable document pass (Mark's List row run-impeccable-surface-removal). The twenty-five boards that draw the reading with the old names are retaken by Sid after this build (decision 58 (c), `redraw.sh`). This quick edited neither the brief, nor the README, nor any board.

Under "Not verified", list the iPad and the iPhone, VoiceOver's heading navigation over the new h4 and h5 names, and widths 724 to 1365 with the tasting open (no board draws it; the four-across grid applies there).

Add a "Deferred Human Verification" section with suggested checks for decision 58. Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server. On the iPad (1366, the 350px log column) and the iPhone (393), open Olive Oil v1's seeded batch with Tasting open:
- Tempering, Tasting temperature, Melt test and Melt style stand at the top, two rows of two, and no Melt heading is drawn.
- Every recipe (Sweetness) and This recipe only (Oil) read in 14px dark sentence case, the pen's cue face.
- Any problems? reads in the small grey capitals Next time has; under it stand This recipe only and Bitter in the hand.
- Record a batch with every mark and all five problems: both mark groups appear, and under Any problems? the Every recipe block (four words), then 32px lower the This recipe only block (Bitter).
- Record one with only Hardness and Smoothness: only Every recipe is drawn, and there is no Any problems? group.

File no Mark's List rows; the orchestrator does. Do not commit the SUMMARY; the quick workflow's docs commit carries it.
  </action>
  <verify>
    <automated>git status --porcelain -- app/ && git diff --name-only 4abf5a2..HEAD -- app/</automated>
  </verify>
  <acceptance_criteria>
    - `git status --porcelain -- app/` prints nothing.
    - `git diff --name-only 4abf5a2..HEAD -- app/` prints only the four app paths named in this plan.
    - `git diff --name-only 4abf5a2..HEAD -- app/src/styles/tokens.css app/src/styles/app.css app/src/domain app/src/store` prints nothing.
    - The SUMMARY exists, records R1 to R5, G1 to G9, N1 to N3 and the board-against-build result, and names decision 58 in its Deferred Human Verification section.
  </acceptance_criteria>
  <done>Only the four planned app files changed, nothing prohibited was touched or staged, and the SUMMARY records the cases, the conformance run and the suggested device checks for decision 58.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored tasting record to the reading on screen | `batch.tasting.defects`, `bitterDeclared`, `marks`, `meltStyle` and the measured values come from IndexedDB, which a maker writes or an import fills (validated by transfer.js). This plan regroups where they print; it reads nothing new. |
| stylesheet to the face of the names | The new rules are scoped under `.notebook-log` and a modifier class, so they cannot restyle Next time, Any problems? or any Sheet heading. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261005-txg-01 | Tampering | BatchRow.jsx TastingReading, the problems blocks | medium | mitigate | Every word renders only as a React text child (the joined words in span.tasting-reading__problems, the names as fixed strings), so a stored defect string holding markup prints as characters; no raw-HTML path is added (acceptance grep on BatchRow.jsx). |
| T-261005-txg-02 | Spoofing | the split of marks and problems | low | mitigate | The split reads the same fields the pen writes (axis.group from axesForBatch over the batch's own snapshot; defects vs bitterDeclared), so a mark or word cannot appear under the other group's name; G2, G3, G4, G6 and R3 pin each side. |
| T-261005-txg-03 | Information disclosure | notebook.css modifier rule | low | accept | Styling only; no data crosses. Scoped by the modifier and `.notebook-log` (N1, N3). |
| T-261005-txg-SC | Tampering | npm installs | low | accept | No package is installed or changed. The scratch conformance run uses the playwright-core already in the npx cache that tgroups-conform.mjs imports, and installs nothing. |
</threat_model>

<verification>
- `npm --prefix app test -- BatchRow.test notebook.test` passes, with R1 to R5, G1 to G9 and N1 to N3.
- `npm --prefix app test` passes in full, and `npm --prefix app run build` exits 0.
- The scratch copy of tgroups-conform.mjs reports 0 off for the three B2 panels at 1366 and 393 in WebKit and Chrome, faces included, or the SUMMARY says why it did not run.
- git log shows test(261005-txg) before feat(261005-txg); any fix(261005-txg) comes after both. Each commit holds only its own paths, and nothing is pushed.
- `git status --porcelain -- app/` is empty after the commits. The other agent's files are still untracked, as they were.
</verification>

<success_criteria>
- The reading's measured grid holds Tempering, Tasting temperature, Melt test and Melt style, and no Melt group remains (decision 58 B).
- The marks stand under Every recipe and This recipe only. The picked words stand under Any problems?, split into Every recipe and This recipe only blocks. Each group and block is drawn only when it holds something.
- The four names wear decision 40's cue face through `.notebook-log .batch-row__group-label--cue`, while Any problems? and Next time keep the caps grey label face (decision 58 B2). The second block stands 32px below the first.
- The build matches the board's B2 panels in WebKit and Chrome, or the gap is recorded. No token, app.css, domain, store, .impeccable, README or board edit. tabindex-scan is green and the build passes.
</success_criteria>

<output>
Create `.planning/quick/261005-txg-build-the-reading-tasting-groups-readme-/261005-txg-SUMMARY.md` when done (Task 3; not committed by the executor).
</output>
