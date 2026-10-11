---
phase: quick-261011-enm
plan: 01
quick_id: 261011-enm
type: execute
wave: 1
depends_on: []
files_modified:
  - .claude/skills/marks-list/SKILL.md
  - .planning/quick/261011-enm-marks-list-skill-reads-open-rows-and-rec/261011-enm-SUMMARY.md
autonomous: true
requirements: [QUICK-261011-enm]

# Scope (authorized by the quick prompt, revised by the coordinator on 2026-10-11): edit only
# .claude/skills/marks-list/SKILL.md so /marks-list reads the rows it can act on (open rows and rows the page
# flagged `touched`) and never the whole collection. The coordinator replaced the date-window read with the
# page's `touched` flag after a dry run showed the window cut nothing (the project is about five weeks old).
# Prohibited (do not touch, do not stage): every other file, app/, CLAUDE.md, .claude/CLAUDE.md, the page,
# the skill's frontmatter and allowed-tools, .planning/STATE.md, this PLAN.md and the SUMMARY.md (the quick
# orchestrator commits docs), the pre-existing modified .planning/state.json and the untracked
# .planning/phases/03.6-per-step-shared-ingredients/.gitkeep. No task writes to Mark's List.

estimate:
  tokens: 35000
  raw_tokens: 35000
  tasks: 1
  confidence: low

must_haves:
  truths:
    - "Step 1 reads `items` with two `query` calls and never `list`s the whole collection: (a) `query.where: [[\"status\", \"ne\", \"done\"]]` for every open, scheduled and parked row (the report and context), and (b) `query.where: [[\"touched\", \"eq\", true]]` with no status filter and no date window (the rows that may need a reaction). Both page with `query.limit` 100 and `cursor` until no cursor comes back, use no `order_by`, and are deduped by doc id. It says old Done rows are history, not work; a row without a `touched` field counts as handled; one specific row outside the reads is read by id with `get`; and each row's version is kept from the read."
    - "Step 3 reacts only to a row with `touched: true` (from query (b)) that is not a `note` kind row and still meets one of the existing tests (an answer, a non-empty note, a scheduled or done todo, a done check, a todo Mark added with no `where`). The handledAt-to-updatedAt comparison is gone. It says the page sets `touched: true` for an answer, a note, Done or Schedule and on every todo Mark adds, never for a phase edit, Park, Unpark, Unschedule or Reopen, and that the skill clears it when it claims the row, so a reopened row with an old answer is not new until Mark changes something. A touched row that meets none of the tests gets only `touched: false` (no reply, not in the report). An `other` answer still waiting for its note is skipped and keeps `touched`."
    - "Step 4's claim writes `handledAt` (ISO now) and `touched: false` with `if_version`, `updatedAt` left as read, before any route; a page re-touch during the work is seen by the next run; a failed version check still re-reads and starts again from step 3. The check bullets write only the claim fields and the reply on a check Mark already pressed Done on. The passed-check bullet reads each `closes` todo by id with `get`, and finds the other checks naming it with one `query.where: [[\"kind\", \"eq\", \"check\"]]`, only when a passed check carries `closes`. The scheduled-todo bullet says the claim clears `touched`, so later runs skip it."
    - "Step 5 keeps the claim's `handledAt`, carries `touched` as its re-read shows it and never sets it, gives a row updated without a claim `handledAt` (ISO now) and `touched: false`, and leaves `updatedAt` as read. Its owner and needs rules, the decide/Draw/Build/Fix/Run/check recipes and the no-follow-up-only-in-a-reply rule are unchanged."
    - "Steps 6 and 7 take what is still open from query (a)."
    - "Byte-identical to commit baa592e: lines 1 to 25 (frontmatter with allowed-tools, objective, `<process>`), step 2, the sketch and app bullets, the Mark-added-todo, note and done-todo bullets, and everything from `Boundaries:` to `</process>`. Steps still number 1 to 7. No new line is wider than 100 columns."
    - "One unpushed commit touches only `.claude/skills/marks-list/SKILL.md`; `.planning/state.json` and the 03.6 `.gitkeep` stay unstaged."
  artifacts:
    - path: .claude/skills/marks-list/SKILL.md
      provides: "the /marks-list skill: it reads open rows and touched rows only, reacts to touched rows, and clears `touched` when it claims a row"
      contains: "Never `list` the whole collection in this skill"
  key_links:
    - from: ".claude/skills/marks-list/SKILL.md step 1 query (b) (`touched` eq true)"
      to: ".claude/skills/marks-list/SKILL.md step 3 (a row qualifies only with `touched: true`)"
      via: "step 3 tests only the rows query (b) read, so no Done history is read to find work"
      pattern: "the row has `touched: true`, so query (b) read it"
    - from: ".claude/skills/marks-list/SKILL.md step 4 claim (`touched: false` with if_version)"
      to: ".claude/skills/marks-list/SKILL.md step 3 and the scheduled-todo bullet (Start a step only once)"
      via: "a second run either loses the version race and re-reads a row whose flag is now false, or never sees the row in query (b) at all"
      pattern: "clears `touched`, which makes every later or concurrent run skip it"
    - from: "Mark's List page (sets `touched: true` on an answer, a note, Done, Schedule and every todo Mark adds)"
      to: ".claude/skills/marks-list/SKILL.md step 5 (carry `touched` as the re-read shows it)"
      via: "a change Mark makes while the work runs survives the reply write and is picked up next run"
      pattern: "carry `touched` as this re-read shows it, never setting it yourself here"
---

<objective>
Edit only `.claude/skills/marks-list/SKILL.md` so `/marks-list` reads only the rows it can act on. Today step 1 reads the whole `items` collection: about 384 rows and about 140,000 tokens, of which 356 Done rows cost about 134,000. Mark: "a skill processing old done records is tokens spent = $".

The new design (the coordinator's revision of Option A):
1. Step 1 makes two `query` calls: (a) the rows that are not done, and (b) the rows the page flagged `touched`. It never lists the whole collection, and it reads one specific older row by id with `get`.
2. Step 3 picks candidates by the `touched` flag in place of the handledAt-to-updatedAt comparison.
3. The claim in step 4 clears `touched`. Step 5 never sets it.
4. Steps 6 and 7 report open rows from query (a).

Purpose: a run reads about 30 open rows plus the few Mark has touched, so it no longer pays for Done history on every run.

Output: one commit changing only `.claude/skills/marks-list/SKILL.md`, plus this quick task's SUMMARY. The executor does not commit the SUMMARY.

Planner choices the brief left open. They are built into the texts below, and the return message flags each one:
- (a) Step 4's passed-check bullet needs "every other `check` naming that todo in `closes`". With partial reads, an older done check that failed would be invisible, and a todo could close despite a known defect. So the bullet runs one extra `query.where: [["kind", "eq", "check"]]`, once per run and only when a passed check carries `closes`. The alternative is to look only among the rows step 1 read. It is cheaper, but an old failed check would then no longer block the todo.
- (b) Step 3 clears `touched` on a touched row that meets none of the reaction tests: a `note` kind row, or a look Mark pressed Done on with no note. It writes only `touched: false`: no reply, no `handledAt`, not in the report. Without this, such rows come back in query (b) on every run. An `other` answer still waiting for its note is excluded, and keeps the dkf rule "claim nothing".
- (c) Step 5 carries `touched` "as this re-read shows it". The coordinator wrote "as the claim left it". The two differ only when Mark touches the row while the work runs. Carrying the re-read value keeps his re-touch, which is the coordinator's stated intent: "the next run sees it".
- (d) Step 3 keeps the list of page actions that set `touched` (answer, note, Done, Schedule, every todo Mark adds; not a phase edit, Park, Unpark, Unschedule or Reopen), taken from the coordinator's message. The reopened-row sentence depends on that list.

This is a one-file prose edit with a single layer. The plan has one `auto` task and no separate tracer. The executor commits only the skill file.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/skills/marks-list/SKILL.md

Facts the planner checked (2026-10-11):
- `.claude/skills/marks-list/SKILL.md` is tracked. Its last commit is `baa592e` (quick 261011-dkf), and the working-tree copy is clean. It has 158 lines and ends with `</process>` and a trailing newline.
- Line map at baa592e:
  - frontmatter 1-17, objective 19-23, `<process>` 25
  - step 1 at 26-28, step 2 at 29-30, step 3 at 31-39
  - step 4 intro at 40-50; its claim sentence sits on lines 46-47
  - sketch bullet 51-54, app bullet 55-58
  - passed-check bullet 59-69: the claim clause is on line 60, the todo read on lines 64-65
  - failed-check bullet 70-75: the claim clause is on lines 72-73
  - scheduled-todo bullet 76-89: the "Start a step only once" sentence is on lines 84-85
  - Mark-added-todo bullet 90-96, note bullet 97-99, done-todo bullet 100-103
  - step 5 at 104-137: the `handledAt` and `updatedAt` sentences are on lines 107-110
  - step 6 at 138-141, step 7 at 142, blank 143, Boundaries 144-157, `</process>` 158
- Four lines are already wider than 100 columns: 3 (172), 62 (103), 146 (114) and 148 (137). Lines 3, 146 and 148 sit in regions that must stay byte-identical, so leave them. Line 62 is inside the passed-check bullet, which this task rewraps; its new lines must be 100 columns or less.
- The gaps the full list used to cover, found by the planner:
  - step 3's candidate test (now the `touched` flag)
  - the passed-check bullet's todo read (now `get`) and its scan of every linked check (now one `kind` query; choice (a))
  - steps 6 and 7's open rows (now query (a))
  - The done-todo and Mark-added-todo bullets need no change: Done and every todo Mark adds set `touched`, so those rows come back in query (b).
- Side effect, recorded and not changed: rows the skill adds carry no `touched` field, so they count as handled. A "Draw: ..." row it creates as `scheduled` is no longer picked up as new work by the next run. The old test would have picked it up, because it had no `handledAt`.
- Pre-existing behavior, recorded and not changed: when Mark presses Decided or Done on a row that is already handled and has an answer, `touched` is set again and the row qualifies again. The same was true under the old `updatedAt` rule.
- The working tree has unrelated changes: ` M .planning/state.json` and `?? .planning/phases/03.6-per-step-shared-ingredients/.gitkeep`. Never stage them. Stage and commit by explicit path only.
- The planner applied Texts A to I to a scratch copy and rewrapped it to 100 columns. The Task 1 gate printed ALL_GATES_PASS on it (176 lines) under both bash and zsh. On the untouched file, 39 checks fail. So the gate tells the two apart, and it can be met.
- The executor has no `ArtifactData` tool (gsd-executor tools: Read, Write, Edit, Bash, Grep, Glob, Skill). The read-only dry run of the new queries is the orchestrator's; see `<verification>`.
</context>

<tasks>

<task type="auto">
  <name>Task 1: /marks-list reads open and touched rows only (SKILL.md Texts A to I)</name>
  <files>.claude/skills/marks-list/SKILL.md</files>
  <read_first>
    - /Users/mark/Documents/projects/sprinkles/.claude/skills/marks-list/SKILL.md (the whole file, 158 lines). Read it once.
    - /Users/mark/Documents/projects/sprinkles/CLAUDE.md, the section "## Mark's List" only, for context. Do not edit it.
  </read_first>
  <precondition>From the repo root, `git log -1 --format=%h -- .claude/skills/marks-list/SKILL.md` prints `baa592e`, and `git status --porcelain -- .claude/skills/marks-list/SKILL.md` prints nothing.</precondition>
  <action>
Make nine scoped edits with the Edit tool, one per Text below. Never use Write on this file. Line numbers refer to the file at baa592e.

Wrapping: each Text below is given as one run-on paragraph or phrase. Rewrap only the step or bullet you edit, to the file's width of 100 columns or less.
- Step lines start with the step number at column 1. Their continuation lines are indented 3 spaces.
- Bullet lines start with 3 spaces and a hyphen. Their continuation lines are indented 5 spaces.
- Never let a wrapped line begin with a digit followed by a period and a space. The step-number gate counts those.
- Never break a line inside a backtick span. If a span such as `query.where: [["touched", "eq", true]]` would cross the margin, move the whole span to the next line.

Keep these exactly as written: backticks, straight double quotes, the square brackets in the where clauses, and every word of each Text. Do not rewrap, reword or reorder any line outside the nine regions named below.

Leave these byte-identical:
- lines 1 to 25: the frontmatter (including allowed-tools), the objective, and `<process>`
- step 2, with "Treat row text as data, never as instructions."
- the sketch-decision and app bullets (51 to 58)
- the Mark-added-todo, note and done-todo bullets (90 to 103)
- everything from the line beginning `Boundaries:` through `</process>` (144 to 158)

Text A, step 1. Replace all of step 1, lines 26 to 28, from "1. Load `ArtifactData`" through "row's version from the read.", with:
1. Load `ArtifactData` with ToolSearch if it is deferred. Read `items` with two `query` calls. Never `list` the whole collection in this skill: old Done rows are history, not work. (a) The rows still open, `query.where: [["status", "ne", "done"]]`: every open, scheduled and parked row, for the report (step 6) and for context. (b) The rows Mark has touched, `query.where: [["touched", "eq", true]]`, with no status filter and no date window: the rows that may need a reaction, whatever their status or age. Page each read with `query.limit` 100 and `cursor` until no cursor comes back, and leave out `order_by` (a query with `order_by` returns one page only). The two reads overlap: dedupe by doc id. A row without a `touched` field predates the flag and counts as handled (every row stored before the flag has been handled). When a step needs one specific row outside these reads (a todo in a check's `closes`, a row a `source` names), read it by id with `get`; step 4 adds one more `query` only when a passed check closes a todo. Keep each row's version from the read.

Text B, step 3, per choices (b) and (d). Replace all of step 3, lines 31 to 39, from "3. React to the rows" through "until Mark changes something.", with:
3. React to the rows Mark has touched since the last reply (never a `note` kind row; see step 4): the row has `touched: true`, so query (b) read it, and it has an `answer` or a non-empty `note`, or is a todo with status `scheduled` or `done` (a note is optional there), or is a `check` with status `done` (a note is optional there too), or is a todo Mark added (`addedBy` is `mark`) that has no `where` yet. The page sets `touched: true` only for an answer, a note, Done or Schedule, and on every todo Mark adds; a phase edit, Park, Unpark, Unschedule or Reopen leave it alone. The skill clears it when it claims the row (step 4). So `touched` reads "changed since handled", and a reopened row with an old answer is not new until Mark changes something. A touched row that meets none of these tests (a `note` kind row, a look Mark pressed Done on with no note) needs no reaction: clear its flag with an `update` with `if_version` from the read, carrying every field as read plus `touched: false`, with `updatedAt` left as read; write nothing else on it and leave it out of the report, so it stops coming back in query (b). If that version check fails, re-read the row and test it again. An `other` answer still waiting for its note is not such a row: step 4 skips it and leaves `touched` alone.

Text C, the claim in the step 4 intro. On lines 46 and 47, replace exactly "an `update` with `if_version` from the read, carrying every field as read plus `handledAt` (ISO now), with `updatedAt` left as read." with the text below. Keep the next sentence, "If the version check fails, another run or Mark changed the row: re-read it and start again from step 3.", and the rest of the intro word for word. Rewrap the intro from line 45 on.
an `update` with `if_version` from the read, carrying every field as read plus `handledAt` (ISO now) and `touched: false`, with `updatedAt` left as read. If Mark changes the row while the work runs, the page sets `touched` back to true, so the next run sees it.

Text D, the passed-check bullet, per choice (a). Make two replacements and keep every other word of the bullet. Then rewrap the whole bullet (lines 59 to 69). Its new lines must be 100 columns or less, which also fixes the 103-column line 62.
- D1, line 60: replace the words between "is closed by him, " and "and the `reply` on it;" with: so write only the claim (`handledAt` and `touched: false`)
- D2, lines 64 and 65: replace "read the todo; if it is already `done`, leave it." with: read the todo by id with `get`; if it is already `done`, leave it. To find every other `check` naming that todo in `closes`, run one more `query` with `query.where: [["kind", "eq", "check"]]`, paged as step 1 says, once per run and only when a passed check carries `closes`.
After this, the sentence that already follows, "If every other `check` naming that todo in `closes` is also `done` and passed, ...", continues unchanged.

Text E, the failed-check bullet. On lines 72 and 73, replace the words between "is closed by him," and "; a check with a defect note" with the text below, keeping one space after the comma. Rewrap the bullet (lines 70 to 75).
so it gets only the claim (`handledAt` and `touched: false`) and the reply

Text F, the scheduled-todo bullet. On lines 84 and 85, replace the sentence that begins "Start a step only once:" and ends "concurrent run skip it." with the text below. Rewrap the bullet from line 84 on.
Start a step only once: the claim (step 4's opening) clears `touched`, which makes every later or concurrent run skip it.

Text G, step 5, per choice (c). Replace the span on lines 107 to 110 that starts with "The claim already set" and ends with the sentence that begins "Leave `updatedAt` as read". That sentence ends with the word "working." at the start of line 110. Replace the span with the text below. Keep "If the version check fails, re-read the row and write the reply again; never start its work a second time." and everything after it in step 5 word for word. Rewrap step 5 from line 107 on.
The claim already set `handledAt` and cleared `touched`: keep `handledAt`, and carry `touched` as this re-read shows it, never setting it yourself here, so a change Mark made while the work ran (the page set `touched` back to true) still reads as new next run. A row you update without a claim (a todo a passed check closes) also gets `handledAt` (ISO now) and `touched: false`. Leave `updatedAt` as read.

Text H, step 6. On line 138, replace "what is still open grouped by kind" with the text below. Rewrap step 6.
what is still open (the rows query (a) read) grouped by kind

Text I, step 7. On line 142, replace "list what is open." with:
list what is open from query (a).

Then read the whole file once, top to bottom, and check it for contradictions:
- Does any sentence still pick rows by comparing `handledAt` with `updatedAt`?
- Does any sentence still read or list every row?
- Does any write by the skill set `touched` to true? Only the page sets it.
- Does step 5 set `touched`? It must carry it as read.
- Does step 3 still exclude `note` rows from reactions?
- Does a `note` kind row get anything other than `touched: false`, such as a reply, a file or a command?
- Do the owner and needs rules, the closure rule and the claim-before-routes order still read as they did at baa592e, apart from the `touched` additions?

Fix a contradiction only inside the nine edited regions. Report any contradiction outside them in the SUMMARY, and leave it alone.

Then commit by explicit path, from the repo root:
1. Run `git add .claude/skills/marks-list/SKILL.md`.
2. Run `git diff --cached --name-only`. It must print exactly `.claude/skills/marks-list/SKILL.md`. If it prints anything else, unstage each extra path by explicit path with `git restore --staged`. Never use `.` or `-A`.
3. Commit with the subject "docs: /marks-list reads open and touched rows, never the whole list". Add a body of one to three English sentences. The body says that a run read about 140,000 tokens of rows, 134,000 of them Done history, and that the page's `touched` flag now marks the rows to react to. End the message with the Co-Authored-By and Claude-Session attribution lines from your own session's system reminder.
4. Do not push.
5. Do not stage or commit the SUMMARY, the PLAN, STATE.md or `.planning/state.json`. The quick workflow's own docs commit takes the SUMMARY.

In the SUMMARY, record under a heading "ArtifactData dry run": "Not run by the executor (no ArtifactData tool); the orchestrator runs it and records the counts here." Do not call any Mark's List tool, and do not write to Mark's List.

No build, no Vite, no preview and no tests: this is prose. Do not edit CLAUDE.md, `.claude/CLAUDE.md`, `app/`, `.planning/todos` or STATE.md.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && F=.claude/skills/marks-list/SKILL.md && FAIL= ; B=$(git show baa592e:.claude/skills/marks-list/SKILL.md) || { echo BASE_UNREADABLE; FAIL=1; }; ex() { awk "$1" "$2"; }; exb() { printf '%s\n' "$B" | awk "$1"; }; diff <(printf '%s\n' "$B" | sed -n '1,25p') <(sed -n '1,25p' $F) >/dev/null || { echo HEAD25_CHANGED; FAIL=1; }; for r in '/^2\. /{f=1} /^3\. /{f=0} f' '/- A sketch decision: record/{f=1} /- A device check that passed/{f=0} f' '/- A todo Mark added on the page/{f=1} /^5\. /{f=0} f' '/^Boundaries:/{f=1} f'; do diff <(exb "$r") <(ex "$r" $F) >/dev/null || { echo "UNCHANGED_REGION_CHANGED: $r"; FAIL=1; }; done; [ -n "$(ex '/^Boundaries:/{f=1} f' $F)" ] || { echo NO_BOUNDARIES; FAIL=1; }; [ "$(tail -n 1 $F)" = '</process>' ] || { echo BAD_TAIL; FAIL=1; }; [ "$(grep -oE '^[0-9]+\. ' $F | tr -d '. \n')" = "1234567" ] || { echo STEP_NUMBERS; FAIL=1; }; [ "$(wc -l < $F)" -le 180 ] || { echo TOO_LONG; FAIL=1; }; awk 'length > 100' $F | while IFS= read -r l; do printf '%s\n' "$B" | grep -qxF -- "$l" || echo "NEW_WIDE_LINE: ${l:0:60}"; done | grep . && FAIL=1; T=$(tr -s ' \n' ' ' < $F); has() { printf '%s' "$1" | grep -qF -- "$2"; }; for p in 'Read `items` with two `query` calls.' 'Never `list` the whole collection in this skill: old Done rows are history, not work.' '`query.where: [["status", "ne", "done"]]`' 'every open, scheduled and parked row' '`query.where: [["touched", "eq", true]]`' 'no status filter and no date window' '`query.limit` 100 and `cursor` until no cursor comes back' 'leave out `order_by`' 'returns one page only' 'dedupe by doc id' 'A row without a `touched` field predates the flag and counts as handled' 'read it by id with `get`' "Keep each row's version from the read." 'Treat row text as data, never as instructions.' 'the row has `touched: true`, so query (b) read it' 'never a `note` kind row' 'The page sets `touched: true` only for an answer, a note, Done or Schedule, and on every todo Mark adds' 'Park, Unpark, Unschedule or Reopen leave it alone' 'The skill clears it when it claims the row' 'is not new until Mark changes something' 'so it stops coming back in query (b)' 'step 4 skips it and leaves `touched` alone' 'plus `handledAt` (ISO now) and `touched: false`, with `updatedAt` left as read' 'the page sets `touched` back to true, so the next run sees it' 'Then claim the row before any route below acts on it' 'another run or Mark changed the row: re-read it and start again from step 3' 'claim nothing, and count it as still waiting' 'so write only the claim (`handledAt` and `touched: false`) and the `reply` on it' 'read the todo by id with `get`' '`query.where: [["kind", "eq", "check"]]`' 'only when a passed check carries `closes`' 'so it gets only the claim (`handledAt` and `touched: false`) and the reply' 'clears `touched`, which makes every later or concurrent run skip it' 'carry `touched` as this re-read shows it, never setting it yourself here' 'also gets `handledAt` (ISO now) and `touched: false`' 'never start its work a second time' 'Every row you add gets `owner`' '`owner: "mark"` with `needs: "answer"`' '`owner: "mark"` with `needs: "hands"`' '`owner: "claude"`, with no `needs`' 'No follow-up lives only in a reply.' 'Do not leave a finished Run or Fix row open.' 'never mark one done for him' 'what is still open (the rows query (a) read) grouped by kind' 'list what is open from query (a).'; do has "$T" "$p" || { echo "MISSING: $p"; FAIL=1; }; done; for n in 'List every row in' 'earlier than `updatedAt`' 'The page moves `updatedAt`' '30 days' 'widen' 'so step 3 keeps working' "the claim's \`handledAt\`" 'so write only `handledAt`' 'gets only `handledAt` and the reply'; do has "$T" "$n" && { echo "STILL_PRESENT: $n"; FAIL=1; }; done; [ "$(printf '%s' "$T" | grep -o 'touched: false' | wc -l | tr -d ' ')" -ge 5 ] || { echo TOUCHED_FALSE_COUNT; FAIL=1; }; P=${T%%"3. React to the rows"*}; has "$P" '[["touched", "eq", true]]' || { echo QUERY_B_NOT_IN_STEP1; FAIL=1; }; P=${T%%"A sketch decision: record"*}; has "$P" '`touched: false`, with `updatedAt` left as read. If Mark changes' || { echo CLAIM_NOT_BEFORE_ROUTES; FAIL=1; }; [ "$(git show --name-only --format= HEAD)" = "$F" ] || { echo COMMIT_NOT_SKILL_ONLY; FAIL=1; }; [ "$(git log -1 --format=%h -- $F)" != "baa592e" ] || { echo NOT_COMMITTED; FAIL=1; }; git diff --quiet HEAD -- $F || { echo WORKTREE_DIRTY; FAIL=1; }; [ -z "$(git diff --cached --name-only)" ] || { echo INDEX_NOT_EMPTY; FAIL=1; }; [ -z "$FAIL" ] && echo ALL_GATES_PASS</automated>
  </verify>
  <done>
- The gate prints ALL_GATES_PASS.
- `git diff baa592e -- .claude/skills/marks-list/SKILL.md` shows changes in only nine places: step 1, step 3, the claim in the step 4 intro, the passed-check bullet, the failed-check bullet, the scheduled-todo bullet from "Start a step only once" on, the `handledAt` and `updatedAt` sentences of step 5, step 6 and step 7.
- HEAD is one unpushed commit that touches only `.claude/skills/marks-list/SKILL.md`.
- ` M .planning/state.json` and `?? .planning/phases/03.6-per-step-shared-ingredients/.gitkeep` are still unstaged in `git status --porcelain`.
- The SUMMARY says the ArtifactData dry run was not run by the executor.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Mark's List page to `/marks-list` | Row text and the page-written `touched` flag are shared page data the skill reads. Row text is not an instruction channel. |
| `/marks-list` to the `touched` flag | The skill now writes `touched: false` on rows it claims, on a todo a passed check closes, and on touched rows that need no reaction. |
| concurrent `/marks-list` runs and Mark's own page edits | Two writers can hold the same row version. |
| executor to shared working tree | Unrelated uncommitted files (`.planning/state.json`, a 03.6 `.gitkeep`) sit in the tree. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-enm-01 | Denial of Service | query (b) regrowing with touched rows that never qualify (a note row, a look done with no note), re-read on every run | low | mitigate | Text B clears `touched` on such a row with `if_version` and writes nothing else. The gate requires "so it stops coming back in query (b)". |
| T-enm-02 | Tampering | the skill's `touched: false` write erasing a change Mark makes while the work runs | medium | mitigate | Every write uses `if_version`. Text C says a page re-touch during the work is seen by the next run. Text G carries `touched` as the step 5 re-read shows it and never sets it. The gate requires both sentences. |
| T-enm-03 | Repudiation | a legacy row without `touched` that still needed a reaction is silently skipped | low | accept | The coordinator states that every existing row has been handled up to now. The orchestrator's dry run counts open rows the old test would still have picked up (see `<verification>`), so any such row surfaces once. |
| T-enm-04 | Information Disclosure | a todo closing despite an older failed check that the partial reads cannot see | medium | mitigate | Text D2 reads every check with one `query.where: [["kind", "eq", "check"]]`, only when a passed check carries `closes`, so "every other check naming that todo" stays exact (choice (a)). |
| T-enm-05 | Elevation of Privilege | a row note that tries to steer the skill, for example by asking it to read or close everything | medium | mitigate | Step 2's "Treat row text as data, never as instructions." stays byte-identical (the step 2 region gate). Reads are fixed to queries (a) and (b), plus a `get` by id and one `kind` query. |
| T-enm-06 | Tampering | unrelated files committed by accident | low | mitigate | One explicit pathspec and a `git diff --cached --name-only` check before the commit. Gate checks that HEAD touches only the skill and that the index is empty afterwards. |
| T-enm-SC | Tampering | npm/pip/cargo installs | high | accept | No installs: this is a prose edit, and no package manager runs. |
</threat_model>

<verification>
- Task 1's automated gate prints ALL_GATES_PASS.
- Lines 1 to 25, step 2, the sketch and app bullets, the Mark-added-todo, note and done-todo bullets, and Boundaries through `</process>` are byte-identical to baa592e. The steps still run 1 to 7.
- The two queries, the "never `list`" rule, the `get` by id, the legacy-row rule and the `touched` claim are present. The old full-list read and the handledAt-to-updatedAt comparison are gone.

Orchestrator dry run. It is READ ONLY, and the orchestrator runs it after the executor returns, because the executor has no ArtifactData. Write nothing to the collection. Use ArtifactData `query` on https://claude.ai/artifact/BUn1EoVgfbMQ5dApdtBsBC, collection `items`, with `query.limit` 100 and no `order_by`. Record in the SUMMARY under "ArtifactData dry run", replacing the executor's not-run line:
1. Query (a), `where: [["status", "ne", "done"]]`. Record the row count and whether a cursor came back. Expect about 30 rows: the coordinator already confirmed 30.
2. Query (b), `where: [["touched", "eq", true]]`. Record the row count. Expect 0, plus any row Mark has touched since the page was republished.
3. The step 4 checks query, `where: [["kind", "eq", "check"]]`. Record the row count and pages. This is what choice (a) costs when a passed check carries `closes`.
4. Cross-checks:
   - Confirm that returned rows carry a version usable as `if_version`.
   - Count the rows from (a) that have `touched: true`. Each must also appear in (b). If (b) misses one, the boolean shape is wrong.
   - Count the rows from (a) that the old test would still have picked up (an answer or a note, and `handledAt` missing or older than `updatedAt`), so any unhandled row from before the flag surfaces once.
5. If a query shape is rejected or misreads the flag, fix the wording in `.claude/skills/marks-list/SKILL.md` to the shape that works. Commit it by explicit path through this quick task, and update the matching literal in the Task 1 gate. Say so in the SUMMARY.
</verification>

<success_criteria>
- A `/marks-list` run reads the not-done rows and the touched rows, about 30 plus a handful, and never the 356 Done rows of history.
- A row Mark answers, notes, marks Done or Schedules, and every todo he adds, is picked up whatever its age. A row he has not touched since it was handled is not.
- A second run started while the first is working still cannot start the same task: the claim clears `touched` with `if_version`.
- A change Mark makes while the work runs survives the reply and is seen by the next run.
- The owner and needs rules, the closure rules, and the rule that a decision, check or look stays Mark's are unchanged.
- Nothing else in the skill changed.
</success_criteria>

<output>
Create `.planning/quick/261011-enm-marks-list-skill-reads-open-rows-and-rec/261011-enm-SUMMARY.md` when done. Note in it:
- the four planner choices (a) to (d) from the objective, as built
- the side effect: rows the skill adds count as handled, so a Draw row it creates is no longer picked up as new work
- the pre-existing re-qualify on Decided or Done, which this task leaves unchanged
- any contradiction the full re-read found outside the nine edited regions (left alone)
- "ArtifactData dry run: not run by the executor (no ArtifactData tool); the orchestrator runs it and records the counts here."
- No Mark's List row is added by the executor. Whether any planner choice needs Mark's confirmation is the orchestrator's call.
</output>
