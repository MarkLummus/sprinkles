---
phase: quick-261017-tit
plan: 01
quick_id: 261017-tit
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/Authored.jsx
  - app/src/ui/Authored.test.jsx
  - app/src/styles/app.css
autonomous: true
requirements: [D31]

estimate:
  tokens: 35000
  raw_tokens: 35000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "While developing, each Before you start note's remove control renders as button type=button class=text-control tabindex=0 with the word remove, the same markup sketch 010 draws in screen-draft-kept.html and screen-draft-kept-words.html (D31). It is still a real button rendered through app/src/ui/Button.jsx."
    - "The note remove reads as an underlined word with no border, the same look as the Ingredients row remove (IngredientTable.jsx RemoveRowControl)."
    - "In WebKit, the real app's note remove matches the sketch 010 board within 1 px for height, width, top offset in the field, gap after the textarea and inset from the field's right edge: at 1280 with a fine pointer against board .p4d1, and at 393 with a coarse pointer against board .p4d2. The README expects 24 px tall at a fine pointer and 44 px tall, about 45 px wide, at a coarse one."
    - "npm --prefix app test passes: 96 files, 3001 tests (the 3000 baseline plus the new D31 test). The existing remove-markup test and the tabindex test in Authored.test.jsx pass unchanged."
    - "The commit changes only app/src/ui/Authored.jsx, app/src/ui/Authored.test.jsx and, if the measurement called for it, app/src/styles/app.css. No file under .planning/sketches or .planning/canvas-generators is staged. app/src/domain/figures.js and the Sweetness · POD rule (D30) do not change."
  artifacts:
    - path: app/src/ui/Authored.jsx
      provides: "The note's remove Button carries className text-control (D31)"
      contains: 'className="text-control"'
    - path: app/src/ui/Authored.test.jsx
      provides: "A test pinning class=\"text-control\" on every note remove button while developing"
      contains: "text-control"
  key_links:
    - from: app/src/ui/Authored.jsx
      to: app/src/styles/app.css
      via: "the .text-control rule and its (pointer: coarse) min-height of var(--touch-min)"
      pattern: "text-control"
    - from: app/src/ui/Authored.jsx
      to: app/src/ui/Button.jsx
      via: "Button sets tabIndex 0 after the prop spread, so className cannot drop it"
      pattern: "<Button className=\"text-control\""
---

<objective>
Make the Before you start note's remove control look like a link, the same `text-control` look as the Ingredients row remove (sketch 010 README D31, Mark 2026-10-18). Then measure the real app against the sketch 010 boards in WebKit and change the `authored__note-field` CSS only if the measurement shows a difference.

Purpose: D31 is already drawn in sketch 010 (`screen-draft-kept.html`, `screen-draft-kept-words.html`). The sketch HTML is the authority, so the app has to match the boards as measured, not as the CSS source suggests.
Output: one class added to the note's `<Button>`, a test that pins it, a measurement table in the SUMMARY, and a token-only CSS rule only if the numbers call for one.

Planner contributions: the active plan:pre contributions (security, schema-gate, assumption-delta, ai-integration) do not apply to a one-class markup change. None apply.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/Authored.jsx
@app/src/ui/Authored.test.jsx
@app/src/ui/Button.jsx

Facts the planner checked (2026-10-17, HEAD 1fef2ea):
- `app/src/ui/Authored.jsx` line 37: `<Button onClick={() => onRemoveNote(listKey, index)}>` with the word `remove` and no className, so today it gets the global bordered button look.
- `app/src/ui/IngredientTable.jsx` line 211 is the model: `<Button className="text-control" ...>`.
- `app/src/ui/Button.jsx` renders `<button type="button" {...props} tabIndex={0} />`. Through `renderToStaticMarkup` the note remove will come out as `<button type="button" class="text-control" tabindex="0">remove</button>`, the board's markup to the character.
- `app/src/styles/app.css`: `.text-control` (line 106) sets `min-height: var(--sheet-text-control-min)` (24px). The `@media (pointer: coarse)` touch union (line 2449, rule at line 2465) raises it to `var(--touch-min)` (44px). The touch union is keyed on the pointer only, not on width, so the 393 measurement needs a coarse-pointer context. `.authored__note-field` (line 1357) is `display: flex; align-items: flex-start; gap: var(--gap-xs)`, and `textarea.prose-field` inside it is `flex: 1 1 auto`.
- Sketch 010 `screen-draft-kept.html` carries the same `.authored__note-field` rules under each board scope (`.p4d1` from line 1036, `.p4d2` from line 4027, `.p4d3` from line 7254). It has no `@media` blocks: board `.p4d2` writes the coarse rules without a condition (line 4690, `.p4d2 .text-control { min-height: var(--touch-min) }`). The boards use only `translate(-0px,-0px)`, never a scale. Boards: `.p4d1` = 1280 window (fine pointer); `.p4d2` = 393, coarse pointer, first screen; `.p4d3` = 393, scrolled. `screen-draft-kept-words.html` has `.p4w1a`/`.p4w1b` (1280) and `.p4w3a`/`.p4w3b` (393).
- `--face-grotesk` is a system stack (`-apple-system, ...`), so the word's width uses the same face in the app and on a file:// board.
- Playwright WebKit: `import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'` (playwright-core 1.63.0, browser webkit-2359 installed). The pattern to copy is `.planning/canvas-generators/p10-capture.mjs` lines 1-50 (read it, do not edit or commit it): a fresh context seeds the store; go to `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1`, wait for `.notebook-band`, click `getByRole('button', { name: 'Next version' }).first()`, wait about 500 ms. Olive Oil v1 has two Before you start notes.
- Baseline: `npm --prefix app test -- Authored` gives 1 file, 11 tests. `npm --prefix app test` gives 96 files, 3000 tests. Both pass.
- The working tree already has changes to `.planning/sketches/010-bench-sheet/*`, `.planning/canvas-generators/*`, `.planning/config.json` and `.planning/state.json`, plus untracked files. None of them belong to this task.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Give the note remove the text-control class and pin it in Authored.test.jsx (D31)</name>
  <files>app/src/ui/Authored.jsx, app/src/ui/Authored.test.jsx</files>
  <read_first>
    - app/src/ui/Authored.jsx (whole file, 50 lines; the Button is at line 37)
    - app/src/ui/Authored.test.jsx (whole file; the remove-markup test at lines 62-65, the tabindex describe at lines 98-112)
    - app/src/ui/IngredientTable.jsx lines 199-216 (RemoveRowControl, the model)
    - .planning/sketches/010-bench-sheet/README.md line 63 (D31)
  </read_first>
  <behavior>
    - New test (RED before the edit): while developing, NoteList renders exactly two `<button\b[^>]*>` tags for Olive Oil v1's two notes, and each tag contains `class="text-control"` (D31).
    - The existing test "renders a remove control beside the field" (`/<button[^>]*>remove<\/button>/`) still passes, unchanged.
    - The existing tabindex describe (each button tag contains `tabindex="0"`; reading state renders no button) still passes, unchanged.
  </behavior>
  <action>
    RED: in app/src/ui/Authored.test.jsx, inside the describe block named "NoteList — a note while developing (03.1-04, D-13 § 8)", add one `it` after "renders a remove control beside the field". Name it so it cites D31, for example: the remove control takes the row remove's link look, class text-control (sketch 010 D31). It renders `renderNoteList({ mode: 'developing' })`, collects `markup.match(/<button\b[^>]*>/g)`, expects length 2, and expects each tag to contain `class="text-control"`. Run `npm --prefix app test -- Authored` and confirm only this new test fails.

    GREEN: in app/src/ui/Authored.jsx, add `className="text-control"` to the note's remove `<Button>` at line 37, before `onClick`, in the same order as IngredientTable.jsx line 211. Leave it a `<Button>` from `./Button.jsx`, never a raw `<button>` or a link. Do not pass tabIndex: Button.jsx sets the literal tabIndex 0 itself. Keep the word `remove` and the onClick handler as they are. You may add one comment line above the `<span className="authored__note-field">` saying the remove uses the row remove's link look (sketch 010 D31, IngredientTable.jsx). Change nothing else in either file. Do not edit the existing tests.

    Do not touch app/src/styles/ in this task. Do not touch app/src/domain/figures.js or the Sweetness · POD rule (D30).

    Commit only these two files, with explicit paths: `git add app/src/ui/Authored.jsx app/src/ui/Authored.test.jsx`. Never `git add -A`, `git add .` or `git commit -a`, because the working tree holds sketch and canvas-generator changes that are not part of this task. Message: `fix(261017-tit): note remove takes the text-control link look (D31)`.
  </action>
  <verify>
    <automated>npm --prefix app test -- Authored</automated>
    <fails_when>Vitest reports any failed test in app/src/ui/Authored.test.jsx, or the total is not 12 tests (11 baseline plus the new D31 test), or the new test passes before the Authored.jsx edit (then it does not test anything).</fails_when>
    <automated>npm --prefix app test</automated>
    <fails_when>Any test file fails, or the summary is not "96 passed" files and "3001 passed" tests. A drop below 3001 means a test was lost; a failure in RecipePage.beforeYouStart.test.jsx or ui/tabindex-scan.test.js means the button lost its tabindex or its word.</fails_when>
    <automated>C=$(git log -1 --format=%H --fixed-strings --grep='fix(261017-tit): note remove takes the text-control link look') && test -n "$C" && git diff --name-only "$C^" "$C"</automated>
    <fails_when>The command exits non-zero (no Task 1 commit with that message), or the list is anything other than exactly app/src/ui/Authored.jsx and app/src/ui/Authored.test.jsx.</fails_when>
  </verify>
  <done>The note remove renders `<button type="button" class="text-control" tabindex="0">remove</button>` while developing. The new D31 test fails without the class and passes with it. The full suite shows 96 files and 3001 tests passing. The commit holds exactly the two files.</done>
</task>

<task type="auto">
  <name>Task 2: Measure the note remove in WebKit against sketch 010, then fix the note-field CSS only if it differs</name>
  <files>app/src/styles/app.css</files>
  <read_first>
    - .planning/canvas-generators/p10-capture.mjs lines 1-50 (the WebKit pattern: playwright-core import path, contexts, the Next version click). Read only. Do not edit, stage or commit it.
    - app/src/styles/app.css lines 97-131 (.text-control), lines 1347-1368 (.authored__notes, .authored__note-field), lines 2449-2470 (the coarse touch union)
    - .planning/sketches/010-bench-sheet/screen-draft-kept.html lines 1029-1043 (the .p4d1 note-field CSS) and lines 4686-4692 (the .p4d2 forced coarse rules). The file is 373 KB, so read only these ranges.
  </read_first>
  <action>
    Measure first, then edit (sketch HTML is the authority; measure the real DOM, do not reason from the CSS source). Everything temporary lives under `$TMPDIR/sprinkles-261017-tit/`, never in the repo and never in app/dist.

    Step 1, one Vite process only. Run `pgrep -fl vite`. If a Vite process is already running for this workspace, stop it before you start one (the project allows one Vite process per workspace), and record in the SUMMARY that you stopped it.

    Step 2, build and serve the built app. Run `npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-261017-tit/dist" --emptyOutDir`. Then start `npm --prefix app run preview -- --outDir "$TMPDIR/sprinkles-261017-tit/dist" --port 4199 --strictPort` in the background. Wait until `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4199/` returns 200.

    Step 3, write the measurement script at `$TMPDIR/sprinkles-261017-tit/measure.mjs`. Import webkit from the playwright-core path in the context section. The script takes one note remove at a time: the `button` inside each `.authored__note-field`, reading both notes. For each one it records, in CSS px after `await document.fonts.ready`: the button's width and height from getBoundingClientRect; top and left relative to the field (button.top minus field.top, button.left minus field.left); the gap from the textarea's right edge to the button's left edge; the inset from the button's right edge to the field's right edge; the field's width; the computed min-height, text-decoration-line, border-top-width and font-size; the button's outerHTML. Run it on these four sources:
    (a) app at 1280, fine pointer: WebKit context with viewport 1280x1000, no hasTouch, deviceScaleFactor 1. Go to `http://127.0.0.1:4199/`, wait for `.home__lead`, then go to `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1`, wait for `.notebook-band`, click Next version as p10-capture.mjs does. Record `matchMedia('(pointer: coarse)').matches`, which must be false.
    (b) app at 393, coarse pointer: the same steps with viewport 393x852 and hasTouch true. `matchMedia('(pointer: coarse)').matches` must be true. If WebKit does not report a coarse pointer, stop and report that in the SUMMARY. Do not count a fine-pointer 393 run as the coarse case.
    (c) board .p4d1: open `file://` + the absolute path of `.planning/sketches/010-bench-sheet/screen-draft-kept.html` in a context with viewport 2300x1700 and no hasTouch (the boards carry their own forced rules and the file has no @media blocks). Measure the note fields under `.p4d1`.
    (d) board .p4d2: the same page, the note fields under `.p4d2`.
    For the record, also measure `.p4w1a` and `.p4w3a` in `screen-draft-kept-words.html` if their windows contain a note field, and report 1366 with a coarse pointer (viewport 1366x1024, hasTouch true, Mark's iPad window) for the app only, with no board to compare. The script writes all numbers to `$TMPDIR/sprinkles-261017-tit/measure.json`. It exits 1 if the app differs from its board by more than 1 px in height, width, top offset, gap after the textarea or right inset ((a) against (c), (b) against (d)), if (b) is not coarse or (a) is coarse, or if any app note remove does not compute text-decoration-line underline with a border-top-width of 0px. Otherwise it exits 0.

    Step 4, decide.
    - If the script exits 0, the app matches the boards. Do not edit app/src/styles/app.css. Put the measurement table in the SUMMARY.
    - If it exits 1 because of a box or position difference inside the field (height, width, top offset, gap or right inset), add the smallest rule that fixes it, scoped to `.authored__note-field .text-control` (or the `.authored__note-field` rule itself), next to the existing `.authored__note-field` rules near line 1357 of app/src/styles/app.css. If the difference only happens at a coarse pointer, put the rule inside the existing `@media (pointer: coarse)` block at line 2449 instead. Do not add a new top-level @media block. The rule reads only existing custom properties from app/src/styles/tokens.css, with no number, px value or colour literal. Add a short comment citing sketch 010 D31 and the measured numbers. Rebuild (Step 2's build command, then restart the same single preview), re-run the script, and repeat until it exits 0.
    - If the field's own width or left offset differs (the Before you start region or its column is a different width in the app than on the board), the cause is outside the note field and outside this task. Do not fix it here. Report the two widths in the SUMMARY as a finding for Mark.
    - If the board itself does not match README D31 (for example, not 44 px tall at a coarse pointer on .p4d2), the board wins. Match the app to the board and report the README mismatch in the SUMMARY.

    Never change app/src/domain/figures.js or the Sweetness · POD rule (D30). Never edit anything under .planning/sketches or .planning/canvas-generators.

    Step 5, clean up. Stop the preview process you started and confirm `pgrep -fl vite` lists nothing of yours. Leave `$TMPDIR/sprinkles-261017-tit/` in place for the record. If you changed app/src/styles/app.css, commit only that file with `git add app/src/styles/app.css` and the message `fix(261017-tit): seat the note remove where sketch 010 draws it (D31)`. If you did not change it, there is no second commit.

    Put the measurement table in the SUMMARY. Rows: app 1280 fine, board .p4d1, app 393 coarse, board .p4d2, app 1366 coarse. Columns: width, height, top, left, gap, right inset, field width, min-height, font-size, underline, border. Also give the pass or fail verdict and, if you edited CSS, the before and after values.
  </action>
  <verify>
    <automated>node "$TMPDIR/sprinkles-261017-tit/measure.mjs"</automated>
    <fails_when>The script exits non-zero: the app note remove differs from board .p4d1 (1280, fine) or .p4d2 (393, coarse) by more than 1 px in height, width, top offset, gap or right inset; or the 393 context does not report pointer coarse; or the app remove does not compute an underline with a 0px border.</fails_when>
    <automated>npm --prefix app test</automated>
    <fails_when>Any test fails, or the count is not 96 files and 3001 tests. A failure in app/src/styles/cross-cutting.test.js or binder.test.js means a new rule broke the .text-control order, the touch-union order or the no-literal rule.</fails_when>
    <automated>git diff --quiet 1fef2ea -- app/src/domain/figures.js && test -z "$(git status --porcelain -- app/)" && test -z "$(find app/dist -newer app/src/ui/Authored.test.jsx -print -quit)"</automated>
    <fails_when>The command exits non-zero. Either figures.js differs from the planning baseline 1fef2ea, or a file under app/ is uncommitted or stray, or something in app/dist is newer than Task 1's test edit. app/dist already exists and is gitignored, so the last case means a build wrote into app/dist instead of $TMPDIR.</fails_when>
  </verify>
  <done>The SUMMARY holds the measurement table for app 1280 fine, board .p4d1, app 393 coarse, board .p4d2 and app 1366 coarse. measure.mjs exits 0. Any CSS change is token-only, scoped to the note field, re-measured and committed on its own. Otherwise app/src/styles/app.css is unchanged. No Vite process of this task is still running, and nothing in the existing gitignored app/dist was rewritten.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | A class name added to an existing button and a CSS rule that may follow it. No new input, store access, network call or dependency. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261017-01 | Tampering | git staging in a dirty working tree | low | mitigate | Each commit stages explicit paths only (Task 1: two files; Task 2: app/src/styles/app.css if changed). The Task 1 commit's file list (pinned by its message, not by a relative anchor) and `git status --porcelain -- app/` gate it, so the sketch and canvas-generator changes stay unstaged. |
| T-261017-02 | Denial of Service | the iPad Tab order (WebKit skips controls with no tabindex) | low | mitigate | The control stays a `<Button>` from Button.jsx, which sets tabIndex 0 after the spread. The existing tabindex test and ui/tabindex-scan.test.js gate it. |
| T-261017-SC | Tampering | npm/pip/cargo installs | low | accept | No package install. The measurement uses the playwright-core already present in the npx cache, run from $TMPDIR, and nothing is added to app/package.json. |
</threat_model>

<verification>
- `npm --prefix app test -- Authored` passes with 12 tests. `npm --prefix app test` passes with 96 files and 3001 tests.
- The rendered note remove is `<button type="button" class="text-control" tabindex="0">remove</button>`, the same markup as sketch 010 screen-draft-kept.html.
- WebKit measurement: app 1280 fine matches board .p4d1, and app 393 coarse matches board .p4d2, within 1 px. The numbers are in the SUMMARY.
- `git log --name-only --format= --fixed-strings --grep='fix(261017-tit)' 1fef2ea..HEAD` shows only app/src/ui/Authored.jsx, app/src/ui/Authored.test.jsx and, if needed, app/src/styles/app.css. Nothing under .planning/sketches or .planning/canvas-generators is committed.
</verification>

<success_criteria>
- D31 is implemented: the Before you start note remove has the same link look as the Ingredients row remove, and it is still a real button with tabindex 0.
- The real app matches the sketch 010 board, as measured in WebKit at 1280 (fine) and 393 (coarse).
- No literal value in CSS, no change to figures.js or the POD rule, no stray Vite process, nothing written into app/dist (it already exists, gitignored; builds go to $TMPDIR).
</success_criteria>

<output>
Create `.planning/quick/261017-tit-make-the-before-you-start-note-remove-co/261017-tit-SUMMARY.md` when done. Include the measurement table, the verdict, any CSS before and after values, any width or README finding for Mark, and whether a running Vite process was stopped.
</output>
