---
phase: quick-261101-mbe
plan: 01
quick_id: 261101-mbe
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs
  - app/src/ui/Authored.jsx
  - app/src/ui/Authored.test.jsx
  - app/src/styles/tokens.css
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/print.test.js
autonomous: true
requirements:
  - bug-p11-bys-note-dot-on-right

estimate:
  tokens: 120000
  raw_tokens: 120000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Every editable note list draws its dot without the engine's list marker. This covers the creation editor (/notebook/new, and Edit version, both CreationPage in mode 'creating') and the version pen (RecipePage in mode 'developing', opened by Next version). Each editing li is display: block, so no engine generates a ::marker for it. Its first child is an empty span.authored__note-bullet with aria-hidden='true', outside span.authored__note-field. The span is absolutely positioned against the li (position: relative) in the ul's left padding: right: 100% plus margin-right var(--gap-s), top var(--gap-hair), which is the textarea's own top padding. Its ::before is the disc, an inline-block on that line box's baseline. Mark chose this fix on 2026-11-01 (bug-p11-bys-note-dot-on-right): 'the dot stands in the left margin beside the box's first line on the iPad'."
    - "The reading list and print do not change. NoteList's reading branch renders byte-identical markup: ul class exactly 'authored__notes' with no role attribute, and each li holds the plain text plus the inherited marker. No CSS rule that matches the reading list or the print pages changes. The probe's reading area matches HEAD: ul outerHTML equal, li boxes within 0.5 px, native marker ink within 1 device px, li display list-item with list-style-type disc."
    - "The editing bullet sits where the HEAD build's native disc sat. The probe checks desktop Playwright WebKit and Chrome (channel 'chrome') at 1366x1024 with a fine pointer, a coarse pointer, and a coarse pointer at DPR 2. In the creation editor and in the version pen, including the first line of the pen's three-line note, the bullet's ink box is within 1 CSS px of HEAD's native-disc ink box on every edge. Its colour equals HEAD's li colour. The li, textarea, Remove and note-field boxes are within 0.5 px of HEAD. The note-field holds only the textarea and Remove. The bullet's span lies wholly in the ul's padding strip, intersects neither the textarea nor Remove, and its disc ink falls inside the textarea's first line box."
    - "Screen readers meet a list of N items. The editing ul carries role='list', because WebKit exposes a ul whose items draw no marker as a group, not a list. Each li keeps its implicit listitem role. The bullet span is empty and aria-hidden. This is proven by NoteList markup tests, by Playwright's role queries in both engines (N listitems), and by Chrome's own accessibility tree via CDP: the ul is a list with N listitem nodes and the bullet node is ignored."
    - "Forced colours keep the bullet. A rule in app.css's existing forced-colors block paints the disc CanvasText with forced-color-adjust: none. Under Chrome's forced-colours emulation, which really forces colours, the bullet's ink is present and within 1 px of HEAD's native disc. WebKit's emulation matches the media query but does not force colours, so its forced figures are INFO only."
    - "Tokens only. The disc's size and its rise above the baseline read two new tokens in tokens.css, --sheet-note-bullet-size and --sheet-note-bullet-rise. The gap reads --gap-s, the top reads --gap-hair and the colour reads --sheet-ink. No new rule declares a px or colour literal."
    - "npm --prefix app test passes with no failure. At HEAD 04a616bd the suite is 4246 tests in 130 files; after this plan it is 130 files and 4246 plus the new tests, with no existing test deleted."
    - "Device verification is the orchestrator's, after a dist rebuild the executor never makes: on Mark's iPad (Safari 27.0.1) the editor's note dot stands in the left margin beside the box's first line, nothing sits inside the box, and it matches the reading page."
  artifacts:
    - path: app/src/ui/Authored.jsx
      provides: "NoteList's editable branch: ul with the authored__notes--editing modifier and role list; each li opens with the aria-hidden span.authored__note-bullet before span.authored__note-field. The reading branch is untouched"
      contains: "authored__note-bullet"
    - path: app/src/styles/app.css
      provides: "The editing li as a positioned block, the bullet span in the ul's padding, its ::before disc on the first line's baseline, and the forced-colors fill"
      contains: ".authored__note-bullet::before"
    - path: app/src/styles/tokens.css
      provides: "--sheet-note-bullet-size and --sheet-note-bullet-rise, calibrated by the probe to desktop WebKit's native disc"
      contains: "--sheet-note-bullet-size"
    - path: .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs
      provides: "Record and check of the reading list, the creation editor, the version pen and forced colours against a scratch HEAD build, in WebKit and Chrome"
      contains: "record"
  key_links:
    - from: app/src/ui/Authored.jsx
      to: app/src/styles/app.css
      via: "ul.authored__notes--editing > li is display: block and position: relative; span.authored__note-bullet is its absolutely positioned first child; .authored__note-bullet::before draws the disc"
      pattern: "authored__notes--editing"
    - from: app/src/styles/app.css
      to: app/src/styles/tokens.css
      via: "the ::before reads var(--sheet-note-bullet-size) for width and height and var(--sheet-note-bullet-rise) for vertical-align; the span reads var(--gap-s) and var(--gap-hair)"
      pattern: "var\\(--sheet-note-bullet-"
    - from: app/src/styles/app.css
      to: app/src/styles/app.css
      via: "the bullet's top: var(--gap-hair) tracks .prose-field's padding: var(--gap-hair) 0 (app.css line 1502), so the bullet's line box starts where the textarea's first text line starts"
      pattern: "top: var\\(--gap-hair\\)"
    - from: app/src/ui/RecipeSheet.jsx
      to: app/src/ui/Authored.jsx
      via: "RecipeSheet passes mode ('creating' from CreationPage line 729, 'developing' from the version pen) to NoteList (line 127), so both editors take the fix through one component"
      pattern: "NoteList"
---

<objective>
Mark's decision on bug-p11-bys-note-dot-on-right (2026-11-01, Fix): "the dot stands in the left margin beside the box's first line on the iPad".

The defect: on Mark's iPad (Safari 27.0.1), the creation editor's Before you start note shows its list dot inside the note's box at its right edge, just before Remove. Desktop Playwright WebKit 26.6 and Chrome draw it correctly, in the left margin. The cause is unverified. The working theory is that Safari 27 places the outside marker of a list-item whose first child is a flex container (span.authored__note-field, display: flex) inside that flex row, as an item. The markup is in app/src/ui/Authored.jsx, NoteList's editable branch. The CSS is in app/src/styles/app.css lines 1382-1399.

The fix applies to the editable branch only, so the dot's position no longer depends on the engine's marker placement:
- The editing li becomes display: block. CSS Lists generates a ::marker only for a list-item box, so no engine creates a marker for it, and Safari 27 has nothing to misplace, whatever its placement logic does.
- The dot is an ordinary box: an empty, aria-hidden span, the li's first child, outside the flex row. It is absolutely positioned against the li in the ul's left padding (right: 100% plus a gap). Its line box uses the li's own font and leading, starting at the textarea's top padding, so it shares the first text line's baseline. The disc is an inline-block ::before on that baseline.
- Absolute positioning and inline-block baseline alignment are core CSS 2.1 paths with no list-marker logic. The span is not inside span.authored__note-field, and an out-of-flow box is never a flex item. So the dot cannot enter the note's row, whatever the cause on the iPad turns out to be.
- A structure that keeps the native marker, such as the note-field as inline-flex, would still rely on Safari 27's marker placement, which nothing here can test. It was rejected for that reason.

Screen readers: WebKit's accessibility code exposes a ul as a list only if its items show a marker or the ul has an explicit list role. Without a marker the editing ul would read as a group, so it carries role="list". Chrome ignores the attribute's redundancy. The li keep their implicit listitem role. The bullet span is empty and aria-hidden, so the list still reads as N items and the dot is never announced.

Planning measurements (scratch build of HEAD 04a616bd, Playwright WebKit 26.6 and Chrome, 1366x1024, 2026-11-01). Ink is given in CSS px, x against the li's left content edge, y against the li's top. These figures name the candidate; they do not replace the probe.
- WebKit's native disc, in the editor: x -17 to -11, y 12 to 18 at DPR 1, fine and coarse; x -17 to -11.5, y 12.5 to 18.5 at DPR 2. In the reading list: y 10 to 16. The editor's disc sits 2 px lower, on the textarea's first text line.
- Chrome's native disc, in the editor: x -17 to -12, y 11 to 16, in all three configs.
- Both engines paint the disc as a shape sized from the font, not as a glyph. A "• " text bullet in the note font drew at x -10 to -5, 4 to 5 px wide, so a glyph is rejected.
- The candidate: an empty span with position absolute, right 100%, top var(--gap-hair), margin-right 12 px (var(--gap-s)). Its ::before is an inline-block with width and height 5.5 px, border-radius 50%, background-color the li's ink, vertical-align 2 px.
  - WebKit: x -17 to -12, y 12 to 18 at DPR 1; x -17.5 to -12, y 12.5 to 18 at DPR 2. That is within 0.5 px of the native disc on every edge.
  - Chrome: x -17 to -12, y 12 to 17, the same 21 (DPR 1) or 88 (DPR 2) ink pixels as its native disc, 1 px lower. Chrome's native disc sits 1 px higher against its own text than WebKit's, so one rule can match WebKit to 0.5 px and Chrome to exactly 1 px. The calibration favours WebKit, the iPad's engine.
  - The li heights are unchanged: 28 px at fine, 44 px at coarse.
  - In the version pen's three-line olive-oil note, WebKit's native disc is at x -17 to -11, y 12 to 18, and the candidate at x -17 to -12, y 12 to 18: the first line.
- Forced colours: Chrome's emulation really forces colours. A span's background-color became rgb(255, 255, 255), which is Canvas, so without a forced-colors rule the disc vanishes where the native marker stays. WebKit's emulation matches the media query and forces nothing.

Sketch 014 is the design authority. It draws the dot in the left margin with the native marker. That drawing is unchanged here; only the mechanism differs.

Purpose: on the iPad, the note's dot stands in the left margin beside the box's first line, as on the reading page.
Output: NoteList's editable branch with an aria-hidden bullet and an explicit list role, token-only CSS, two tokens, a forced-colours rule, markup and CSS tests, and a committed probe with before and after evidence.
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
@.planning/quick/261101-lec-creation-lead-in-and-grams-fields-become/261101-lec-field-probe.mjs
@.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs

Read by range, not whole:
- app/src/styles/app.css:
  - lines 1382-1407: .authored__notes, .authored__note-field, the field's textarea rule, .authored__inherited. The new rules go after line 1399.
  - lines 1495-1509: .prose-field. Its padding is var(--gap-hair) 0, which the bullet's top tracks.
  - lines 2464-2480: the coarse floor. .prose-field takes min-height --touch-min; its text still starts at the top padding.
  - lines 2832-2871: the forced-colors block, the fourth top-level @media. Add to it; add no new @media block, because cross-cutting.test.js pins exactly ten.
- app/src/styles/tokens.css lines 36-50: the note type tokens and the spacing scale (--gap-hair 2px, --gap-xs 6px, --gap-s 12px, --gap-m 20px). The two new tokens go beside --sheet-leading-note.
- app/src/styles/cross-cutting.test.js:
  - lines 20-70: imports, and the ruleFor and mediaRuleFor helpers. ruleFor matches the exact selector string, outside @media.
  - lines 686-690: the .authored__notes test, which must stay green.
- app/src/styles/print.test.js lines 180-195 and 275-280. PAGE_CLASSES is every class the print pages render, in reading mode. Line 279 lists the editing-only classes that must be absent.
- app/src/ui/RecipeSheet.jsx lines 92-136: beforeNotes, and the NoteList call with mode.

Rules that reach the editing li or the new span, all checked at planning:
- app.css .authored__notes sets the ul's padding-left var(--gap-m), 20 px. The bullet's extent, 17.5 px left of the li, fits inside it.
- No rule in app.css, notebook.css, shell.css, home.css or print.css targets .authored__notes li or a bare li inside .before-region.
- print.css renders NoteList only in reading mode (PrintSheetPages.jsx line 278), so no editing class can reach a print page.
- tokens.test.js allows border-radius 50%, requires every token to be --sheet- or --app- prefixed, and requires every declared token to be read.
</context>

<interfaces>
NoteList today (app/src/ui/Authored.jsx lines 22-49). It takes listKey, notes, mode, onChangeNoteText and onRemoveNote; editable is mode 'developing' or 'creating'. It renders ul.authored__notes; per note, an li keyed by index.
- Editable branch: span.authored__note-field holding textarea.prose-field (rows 2, value note.text, aria-label `${listKey} note ${index + 1}`, onChange) and Button.text-control 'Remove'.
- Reading branch: note.text.
- After either branch: span.authored__inherited with ` from ${note.inheritedFrom}` when present.

Callers: RecipeSheet.jsx line 127, with mode from CreationPage ('creating', line 729) or RecipePage ('reading' or 'developing'), and PrintSheetPages.jsx line 278 ('reading').

Seeded fixture for the probe's reading and pen areas: /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 has two Before you start notes; the first wraps to three lines in the pen at 1366. The reading page's version row has a Next version button that opens the version pen. In the creation editor, Before you start's head carries Add note (CreationPage.jsx line 745). Each press adds an empty note, whose textarea takes focus.
</interfaces>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The editing note's bullet as an aria-hidden box in the left margin, end to end, measured against the HEAD build</name>
  <files>.planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs, app/src/ui/Authored.jsx, app/src/ui/Authored.test.jsx, app/src/styles/tokens.css, app/src/styles/app.css</files>
  <precondition>git status --porcelain app/src prints nothing, so the base build is HEAD; /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs exists and Google Chrome is installed (the probe checks both and fails loudly otherwise).</precondition>
  <behavior>
    - In mode 'creating' and in mode 'developing', NoteList renders ul class 'authored__notes authored__notes--editing' with role 'list'. Each li's first child is an empty span class 'authored__note-bullet' with aria-hidden 'true', then span.authored__note-field, whose only children are the textarea and the Remove button. There is one bullet per note.
    - In mode 'reading', the markup is exactly ul class 'authored__notes', with no role, and li elements holding the note text: equal to a string built from the fixture's two notes. There is no bullet and no modifier class.
    - The inherited-from marker still renders after the field while editing, and after the text while reading. The two Remove buttons still carry class text-control and tabindex 0.
  </behavior>
  <action>
Step 0, before any edit under app/. Run mkdir -p /private/tmp/sprinkles-261101-mbe. Write the output of stat -f %m app/dist/index.html to /private/tmp/sprinkles-261101-mbe/dist-mtime.txt; Task 2's last check reads it.
- Never build into app/dist. Never contact port 4173 or 8077. Never start vite dev or vite preview.
- The only Vite processes this plan runs are scratch builds with --outDir under /private/tmp/sprinkles-261101-mbe, each of which exits.

Step 1, write the probe at .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs, modelled on 261101-lec-field-probe.mjs.
- Keep from the model: the usage header comment; the PLAYWRIGHT_CORE default and its existence check; startServers({ appRoot }) from 08-walk-server.mjs on ephemeral 127.0.0.1 ports; aborting every request to another host; clickUntil (Chrome's first click after a navigation often misses); settle (document.fonts.ready plus 300 ms); the in-page PNG decode for ink, scrolling the element into view first; one fresh browser context per area, so no kept draft carries over; the record and check modes.
- Output is PASS, FAIL and INFO lines, ending "N PASS, M FAIL", with exit 1 on any FAIL. All typed and printed text is English.
- Engines: webkit, and chromium with channel 'chrome'. Both must record. A missing engine in either file is a FAIL, not an INFO, because the bug's proof needs both.
- Configs: 1366x1024 fine; 1366x1024 coarse (hasTouch true); 1366x1024 coarse at DPR 2; 393x852 coarse at DPR 2. The 393 run is recorded and printed as INFO only. A flow step that fails there prints INFO with the error and does not stop the run.
- check takes --base <base.json> and --area with a comma list of reading, create, pen and forced. The default is all.

Areas, each in a fresh context:
- reading: open /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 and wait for ul.authored__notes li.
- create: open /notebook, press New recipe, fill Name with 'Probe sorbet', press Start and wait for .mk-page. Press Add note (exact name) and wait for ul.authored__notes textarea. Fill the first textarea with 'Chill the mix overnight before churning.'. Press Add note again and fill the second with 'Keep the cream cold until it goes in.'. Then blur with document.activeElement.blur().
- pen: open the reading page, press Next version until ul.authored__notes textarea appears, then blur.
- forced: recorded at 1366 fine only. Run the create flow, then call page.emulateMedia({ forcedColors: 'active' }) and settle. Record whether matchMedia('(forced-colors: active)') matches, and whether colours are really forced: the li's computed colour differs from the one recorded in the same context before emulation.

Record per li, scrolling each into view before any clip:
- Boxes relative to the ul: li, and for editing areas the textarea, the Remove button and span.authored__note-field.
- The li's computed display, list-style-type and color.
- The ul's role attribute, its className and its outerHTML (reading only).
- The note-field's child tagNames.
- Marker-strip ink: clip x from the ul's left to the li's left (the padding strip), and y from the li's top for the li's own height. Express it relative to the li's left and top.
- For editing areas:
  - textarea text ink: the padding box, inset by its borders;
  - gap-strip ink: x from the textarea's right to Remove's left, y over the li's height;
  - the textarea's top plus computed padding-top, and its line-height in px;
  - when span.authored__note-bullet exists: its rect relative to the li, its aria-hidden, its textContent, and getComputedStyle(span, '::before') width, height, background-color and border-radius. Otherwise null.
- Accessibility, both engines: the count of page.locator('ul.authored__notes').getByRole('listitem').
- Accessibility, Chrome only, through a CDP session:
  - DOM.getDocument and DOM.querySelector give the ul and the first bullet span; DOM.describeNode gives each one's backendNodeId;
  - Accessibility.getPartialAXTree with fetchRelatives false gives the ul's role and the bullet's ignored flag;
  - Accessibility.queryAXTree with role listitem under the ul gives the count.

check gates, after against base, per engine and gated config. Each line prints both figures. Equal within 0.5 px means boxes; within 1 device px means 1 divided by DPR.
- R1 (reading): ul outerHTML is identical.
- R2 (reading): li boxes are within 0.5 px.
- R3 (reading): marker-strip ink is within 1 device px on every edge, and present in both.
- R4 (reading): after's li display is list-item and list-style-type is disc.
- E1 (create and pen, after only): ul role is list and className contains authored__notes--editing; every li's display is block; every li's first element child is span.authored__note-bullet with aria-hidden true and empty textContent; every note-field's children are exactly TEXTAREA then BUTTON. Print base's display as INFO.
- E2: li, textarea, Remove and note-field boxes, and the ul height, are within 0.5 px of base.
- E3: after's marker-strip ink (the bullet) is within 1 CSS px of base's (the native disc) on every edge, and present in both.
- E4 (after):
  - the bullet span's right edge is at or left of the li's left edge, and its left edge is at or right of the ul's left edge;
  - the span intersects neither the textarea box nor the Remove box;
  - the bullet ink's top and bottom fall between the textarea's top plus padding-top and that plus one line-height.
- E5: after's ::before background-color equals base's li colour.
- E6: textarea text ink is within 1 device px of base, and the gap strip has no ink in either build. Nothing new is drawn inside the note box.
- E7: the listitem count equals the note count (2) in both builds. In Chrome, after's ul AX role is list with 2 listitem nodes and the bullet's AX node is ignored. Base's Chrome figures are printed as INFO.
- FC (forced; Chrome gated, WebKit INFO): the media query matches and colours are forced; after's bullet ink is present and within 1 CSS px of base's native-disc ink. In WebKit, print all forced figures as INFO.

Step 2, the base record, still with no app/ edit:
- npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-mbe/base-dist --emptyOutDir
- PROBE_DIST=/private/tmp/sprinkles-261101-mbe/base-dist node <probe> record /private/tmp/sprinkles-261101-mbe/base.json
Both engines must record every gated config and every area. If a flow step fails at HEAD, fix the probe, not the app.

Step 3, RED. In Authored.test.jsx, add a describe naming bug-p11-bys-note-dot-on-right that pins the behaviour above. Use the file's renderNoteList helper and its renderToStaticMarkup house style, for both 'creating' and 'developing'. For the reading-markup string, build the expected value from oliveOilVersion.authored.beforeYouStart. Assert first that neither text contains a character renderToStaticMarkup escapes. Run npm --prefix app test -- Authored and see the new editing tests fail. The reading test passes before and after; it guards the reading branch.

Step 4, GREEN, Authored.jsx, editable branch only (per Mark's decision on bug-p11-bys-note-dot-on-right).
- The ul's className is 'authored__notes authored__notes--editing' when editable, else 'authored__notes'.
- Its role is 'list' when editable, else undefined, so React renders no attribute.
- Inside each li's editable branch, render a fragment: first an empty span with className 'authored__note-bullet' and aria-hidden 'true', then the existing span.authored__note-field, unchanged.
- The reading branch and the inherited marker are untouched.
- Add three or four comment lines after the existing comment block. Name bug-p11-bys-note-dot-on-right, and say why the editing li draws its own dot and why the editing list names its role.

Step 5, GREEN, CSS.
- tokens.css, after --sheet-leading-note: add --sheet-note-bullet-size: 5.5px and --sheet-note-bullet-rise: 2px. Each carries a one-line comment: the editing note's drawn dot, calibrated to desktop WebKit's native disc at the 16 px note size (bug-p11-bys-note-dot-on-right).
- app.css, after the `.authored__note-field textarea.prose-field` rule, three rules with a short comment naming the bug id:
  - `.authored__notes--editing > li` declares display: block and position: relative.
  - `.authored__note-bullet` declares position: absolute, right: 100%, top: var(--gap-hair) and margin-right: var(--gap-s). The comment says top tracks .prose-field's own top padding.
  - `.authored__note-bullet::before` declares content as an empty string, display: inline-block, width and height var(--sheet-note-bullet-size), border-radius: 50%, background-color: var(--sheet-ink) and vertical-align: var(--sheet-note-bullet-rise).
- No px, hex or rgb literal.

Step 6, after record and check (see verify).
- If E3 or E4 fails, calibrate only the two token values, and --gap-s only by swapping it for another spacing token or a new named token. Rebuild and re-run.
- Favour WebKit's figures: they are the iPad's engine, and the brief's reference is the disc desktop WebKit draws today.
- If no token-only value passes every gate, stop. Report the gate and its numbers in the SUMMARY, do not loosen a tolerance, and do not commit the failing state.

Step 7, commit with git add of the five explicit paths only, never -A: untracked .review-diagnostics directories sit under .planning/phases. The message is English: "fix: the editing note's dot is drawn in the left margin, not left to the list marker (bug-p11-bys-note-dot-on-right)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.
  </action>
  <verify>
    <automated>npm --prefix app test -- Authored RecipeSheet RecipePage.beforeYouStart CreationFlow PrintSheet styles && test "$(grep -c 'authored__note-bullet' app/src/ui/Authored.jsx)" -ge 1 && test "$(grep -c 'authored__notes--editing' app/src/styles/app.css)" -ge 1 && test "$(grep -c 'sheet-note-bullet' app/src/styles/tokens.css)" -ge 2 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-mbe/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-mbe/after-dist node .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs record /private/tmp/sprinkles-261101-mbe/after.json && node .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs check /private/tmp/sprinkles-261101-mbe/after.json --base /private/tmp/sprinkles-261101-mbe/base.json --area reading,create,pen</automated>
  </verify>
  <done>
- The probe's reading, create and pen check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2. The 393 INFO lines are kept for the SUMMARY.
- The targeted suites pass, including the new Authored tests, cross-cutting.test.js and print.test.js.
- Grep counts, against HEAD 04a616bd: authored__note-bullet in Authored.jsx, 0 to at least 1; authored__notes--editing in app.css, 0 to at least 1; sheet-note-bullet in tokens.css, 0 to at least 2.
- One commit holds the five files.
- app/dist/index.html's mtime equals dist-mtime.txt.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Forced-colours parity, the CSS and print guards, and the full proof</name>
  <files>app/src/styles/app.css, app/src/styles/cross-cutting.test.js, app/src/styles/print.test.js</files>
  <behavior>
    - cross-cutting.test.js:
      - `.authored__notes--editing > li` declares display: block and position: relative.
      - `.authored__note-bullet` declares position: absolute, right: 100%, top: var(--gap-hair) and margin-right as calibrated in Task 1.
      - `.authored__note-bullet::before` declares width and height var(--sheet-note-bullet-size), vertical-align var(--sheet-note-bullet-rise), border-radius 50% and background-color var(--sheet-ink).
      - None of the three declares a px number.
      - resolveTokenPx gives the two tokens their calibrated values.
    - cross-cutting.test.js: the forced-colors block (mediaRuleFor with media '(forced-colors: active)') has a `.authored__note-bullet::before` rule declaring forced-color-adjust: none and background-color: CanvasText.
    - print.test.js: authored__note-bullet and authored__notes--editing are not in PAGE_CLASSES. The print pages never render the editing list.
  </behavior>
  <action>
RED. In cross-cutting.test.js, add a describe naming bug-p11-bys-note-dot-on-right with the first two behaviour items. Use the file's ruleFor, mediaRuleFor, tokens and resolveTokenPx. Pin margin-right and the two token values at whatever Task 1's probe accepted, reading them from the committed tokens.css and app.css. In print.test.js line 279, add the two class names to the editing-only list that must be absent. Run npm --prefix app test -- styles: only the forced-colors test fails.

GREEN. In app.css's existing forced-colors block (line 2839), after the `.sheet-hand` rule, add `.authored__note-bullet::before` declaring forced-color-adjust: none and background-color: CanvasText. Comment it: forced colours repaint a background as Canvas, so the drawn dot would vanish where the native marker it replaces stays in CanvasText; CanvasText is a system colour keyword, not a literal (bug-p11-bys-note-dot-on-right). Add no new @media block.

Then:
- Run the full suite.
- Rebuild after-dist, record, and check every area, including forced (see verify).
- Commit the three files with git add of explicit paths only. The message is English: "fix: the editing note's dot keeps CanvasText in forced colours (bug-p11-bys-note-dot-on-right)", then a blank line, then the two attribution lines: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> and Claude-Session: https://claude.ai/code/session_01S9gLeSQY1nAUXSLqteAxg2.

The SUMMARY records:
- the probe's full check output, as a table per engine, config and area, with base against after for each gate, and the calibrated token values;
- the 393 INFO figures and WebKit's forced INFO figures;
- the test totals, before (4246 in 130 files at HEAD 04a616bd) and after;
- a "Deferred Human Verification" section for the orchestrator's iPad check, served from a dist rebuild the orchestrator makes. The executor never builds dist. One short step per line:
  - open a new recipe and add two notes, one long enough to wrap;
  - expect each dot in the left margin beside the box's first line, nothing inside the box, and no gap before Remove;
  - open Next version on a recipe with notes and expect the same;
  - with VoiceOver, expect "list, 2 items" and no dot announced.
  There are no Mark's List writes in this plan, because the executor has no ArtifactData;
- a note for the orchestrator: sketch 014's drawing is unchanged, but its markup still uses the native marker. Whether the sketch takes the same structure is the orchestrator's call; no app/ change depends on it.
  </action>
  <verify>
    <automated>npm --prefix app test && test "$(grep -c 'authored__note-bullet' app/src/styles/print.test.js)" -ge 1 && test "$(grep -c 'sheet-note-bullet' app/src/styles/cross-cutting.test.js)" -ge 1 && test "$(grep -c 'background-color: CanvasText' app/src/styles/app.css)" -ge 1 && npm --prefix app run build -- --outDir /private/tmp/sprinkles-261101-mbe/after-dist --emptyOutDir && PROBE_DIST=/private/tmp/sprinkles-261101-mbe/after-dist node .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs record /private/tmp/sprinkles-261101-mbe/after.json && node .planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-bullet-probe.mjs check /private/tmp/sprinkles-261101-mbe/after.json --base /private/tmp/sprinkles-261101-mbe/base.json --area all && test "$(stat -f %m app/dist/index.html)" = "$(cat /private/tmp/sprinkles-261101-mbe/dist-mtime.txt)"</automated>
  </verify>
  <done>
Baselines at HEAD 04a616bd, measured at planning:
- The full suite passes: 130 files, 4246 tests plus the new ones, none deleted.
- authored__note-bullet in print.test.js: 0 to at least 1.
- sheet-note-bullet in cross-cutting.test.js: 0 to at least 1.
- 'background-color: CanvasText' in app.css: 0 to at least 1. A bare CanvasText count already reads 2 at HEAD (a comment and the focus-ring rule), so it cannot gate.
- The probe's --area all check prints 0 FAIL for webkit and chrome at 1366 fine, 1366 coarse and 1366 coarse DPR 2, with FC gated in Chrome.
- app/dist/index.html's mtime is unchanged.
- There are two commits on main, and the SUMMARY carries the evidence and the deferred device check.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| maker input to the note fields | Typed note text enters the draft through the existing onChange and is shown as a textarea value or a React text child; this plan changes no data path |
| scratch probe to network | The probe serves a scratch build on 127.0.0.1 and drives local browsers |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261101-mbe-01 | Tampering | NoteList editable markup | low | mitigate | The bullet is an empty span with no text and no handler. Note text still renders as a textarea value or a React text child, never as markup; no dangerouslySetInnerHTML is added, per project convention. Authored.test.jsx pins the reading markup exactly |
| T-261101-mbe-02 | Information disclosure | 261101-mbe-bullet-probe.mjs | low | mitigate | It serves only the scratch build, through 08-walk-server.mjs on ephemeral 127.0.0.1 ports, and aborts every request to another host. It never binds 0.0.0.0 and never contacts 4173 or 8077 |
| T-261101-mbe-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed. playwright-core is the existing npx cache at the path named in the probe, and PNG decoding runs in the browser |
</threat_model>

<verification>
- The Task 1 and Task 2 automated commands pass as written.
- `git log -2 --format=%s` shows the two fix commits, and `git show --stat HEAD~1 HEAD` lists only the files named in each task.
- No vite dev or vite preview process was started, port 4173 was never contacted, and app/dist/index.html's mtime is unchanged.
</verification>

<success_criteria>
- In both editors, the note's dot is an aria-hidden box drawn in the ul's left margin, on the first text line. It no longer depends on any engine's list-marker placement, because the editing li generates no marker.
- The reading list and print are byte-identical in markup and unchanged in rendering.
- The probe proves parity with HEAD's native disc within 1 px, and unchanged layout, in WebKit and Chrome, fine and coarse, with 0 FAIL. Forced colours keep the dot.
- Screen readers still meet a list of N items, with the dot hidden.
- The full suite is green.
- The iPad check is handed to the orchestrator as deferred human verification.
</success_criteria>

<output>
Create `.planning/quick/261101-mbe-before-you-start-note-bullet-stands-in-t/261101-mbe-SUMMARY.md` when done
</output>
