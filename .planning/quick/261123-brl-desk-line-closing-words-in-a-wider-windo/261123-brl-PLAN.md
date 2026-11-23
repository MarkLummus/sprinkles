---
phase: quick-261123-brl
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/RecipePage.drafts.test.jsx
  - app/src/ui/RecipePage.edit.test.jsx
  - app/src/ui/DeskOnly.jsx
  - app/src/ui/Placeholder.jsx
  - app/src/ui/CreationFlow.test.jsx
  - app/src/styles/shell.css
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs
  - .planning/quick/261123-brl-desk-line-closing-words-in-a-wider-windo/261123-brl-SUMMARY.md
autonomous: true
requirements: [decide-p12-desk-line-closing-words, PHONE-01]

estimate:
  tokens: 120000
  raw_tokens: 120000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Below 724 the recipe head's lines read 'Edit kept. Finish it in a wider window.' and 'Draft: <draft name>. Finish it in a wider window.' (the own draft in plain text; another version's draft with its name as the built link and the same ending); from 724 up the head is as built"
    - "Below 724, /notebook/new reads 'Done in a wider window.' with no create draft kept and 'Draft: <draft recipe's name>. Finish it in a wider window.' (plain text) with one kept; the Edit address reads 'Done in a wider window.' with no edit kept on its version and 'Edit kept. Finish it in a wider window.' with one kept"
    - "The one-line page reads the kept draft through the reads CreationRoute.jsx and EditRoute.jsx already make, and never writes or deletes a draft: the drafts store is identical before and after a visit"
    - "Below 724 the Edit page holds, between h1.place__title and p.place__note, one p.place__for with one link '<recipe name> · <version identity>' to that version's page, 44 high, carrying a literal tabIndex={0}, in both states"
    - "The built pages are held against desk-line-words.html at 393 and 723 in Playwright WebKit and in Chrome, element by element within 1 px, and the measurements are in the SUMMARY, named device-unverified"
    - "The full suite passes (137 files, 4591 tests before this task, plus the new ones), including tabindex-scan and the style suites; every new visual value reads through a token in tokens.css"
    - "sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh ends GATE2 PASS"
  artifacts:
    - path: app/src/ui/DeskOnly.jsx
      provides: "The one-line page below 724: the closing words, the kept-work sentence, and Edit's link line"
    - path: app/src/ui/VersionRow.jsx
      provides: "EDIT_KEPT_LINE and DRAFT_LINE_ENDING with the decided closing words, exported so the page and the head say the same thing"
    - path: app/src/styles/shell.css
      provides: ".place__for and .place__for a, copied from the snapshot, tokens only"
    - path: app/src/ui/CreationFlow.test.jsx
      provides: "The one-line page's states at 393 and the 724 cut, over the repository stand-in"
  key_links:
    - from: app/src/ui/DeskOnly.jsx
      to: app/src/store/repository.js
      via: "listDrafts (New recipe) and getVersion, getRecipe, listVersions, getDraft (Edit), read only"
    - from: app/src/ui/DeskOnly.jsx
      to: app/src/ui/VersionRow.jsx
      via: "imports EDIT_KEPT_LINE and DRAFT_LINE_ENDING, the head's own sentences"
    - from: app/src/ui/DeskOnly.jsx
      to: app/src/ui/Placeholder.jsx
      via: "the built placeholder place: children between the title and the note, the note left out while the read is out"
    - from: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
      to: .planning/sketches/016-entry-points-pen-preview-row-controls/desk-line-words.html
      via: "the one-line page's panels dl-new, dl-new-kept, dl-edit, dl-edit-kept, dl-edit-723, dl-edit-kept-723"
---

<objective>
Build the decided desk line (Mark's answer on Mark's List row decide-p12-desk-line-closing-words = B, 2026-11-23). Authority: sketch 016 CONTRACT.md section 12, the part headed "The one-line page" (APPROVED); the snapshot desk-line-words.html in that folder, its markup and its CSS; README decisions 23 to 27. Below 724 only:

1. The closing words become "in a wider window" in every built sentence that now ends "at the desk or on the iPad": the one-line page ("Done in a wider window.") and the recipe head's two lines ("Edit kept. Finish it in a wider window." and "Draft: <draft name>. Finish it in a wider window.").
2. The one-line page says when work is kept. On Edit with an edit kept on its version: "Edit kept. Finish it in a wider window." On New recipe with a create draft kept: "Draft: <draft recipe's name>. Finish it in a wider window.", plain text. The page reads the kept draft and never writes it.
3. The Edit page names its recipe: between the title and the note, p.place__for holding one link "<recipe name> · <version identity>" to that version's page, 44 high, in both states, styled from existing tokens as the snapshot draws it.

<!-- planner-discipline-allow: at the desk or on the iPad -->

Out of scope, do not build: anything on Home (RecipeList.jsx; CONTRACT section 13 is not approved), the ingredient picker, the pen's target chip. From 724 up nothing changes. No router change: router.jsx keeps both DeskOnly wrappers byte for byte (CreationFlow.test.jsx and notebookPaths.test.js grep those lines).

The snapshot and CONTRACT section 12 agree on every drawn state (checked at planning time: dl-new, dl-edit, dl-edit-723, dl-new-kept, dl-edit-kept, dl-edit-kept-723, dl-head-edit, dl-head-draft). States the snapshot does not draw, and what this plan does in each (the SUMMARY lists them for Mark; none is a new design, each reuses a built precedent):
- While the read is out: the title alone, no note (NotebookPlace.jsx's "Until the read settles the page shows nothing but its title").
- A read that fails: "Done in a wider window." and no link line.
- An Edit address naming no stored version, a version of another recipe, or no recipe (EditRoute.jsx renders RecipeNotFound there from 724 up): "Done in a wider window." and no link line.
- A create draft with a blank name: "Draft: Untitled. Finish it in a wider window.", creationTitle's word, the one the Notebook's draft row shows for the same record.
- An Edit address whose version holds a pen draft, or can no longer be edited, with no edit kept: "Done in a wider window." with the link line (below 724 the build shows the page there today; from 724 up EditRoute replaces the address).
If the executor finds the snapshot and the contract disagree anywhere else, or meets a state not listed here, it stops that point and reports it; it does not invent a design.

Purpose: the phone says where kept work is finished in Mark's chosen words, and the Edit page leads back to the version it would edit.
Output: the words in VersionRow.jsx and DeskOnly.jsx, the page's reads and link line, two CSS rules, tests, the phase 12 gate held against the decided board, the SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md
@app/src/ui/DeskOnly.jsx
@app/src/ui/Placeholder.jsx
@app/src/ui/CreationRoute.jsx
@app/src/ui/EditRoute.jsx

Read these ranges only:
- .planning/sketches/016-entry-points-pen-preview-row-controls/README.md lines 152-171 (decisions 23 to 27 and the round-two measurements)
- .planning/sketches/016-entry-points-pen-preview-row-controls/desk-line-words.html lines 3792-3807 (the built .place rules) and 13151-13152 (the two .place__for rules to copy). The body is one long line from 13170; read panel markup with a short script (python3 -I or node) that prints the text around `data-pid="dl-edit"`, not with Read.
- app/src/ui/VersionRow.jsx lines 24-29 (the two sentences) and 377-398 (the draft line)
- app/src/ui/NotebookPlace.jsx lines 55-66 (the create-draft read) and 276-296 (NotebookDraftRow, creationTitle)
- app/src/ui/CreationFlow.test.jsx lines 15-68 (the repository stand-in: store.drafts, store.recipes, store.versions), 160-210 (afterEach, createDraftRecord) and 2448-2622 (the PHONE-01 describe this plan extends)
- app/src/styles/shell.css lines 325-352 (.place, .place__title, .place__note)
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs lines 52-80 and 92-110 (spec and panel format: panelSelector, draft, seed, steps, ready, absent, extraWidths)

Facts checked at planning time (HEAD 65678e4f):
- The app's lines that quote the old closing words, 11 in all: app/src/ui/DeskOnly.jsx (2: the comment and the note), app/src/ui/VersionRow.jsx (2: EDIT_KEPT_LINE, DRAFT_LINE_ENDING), app/src/ui/VersionRow.test.jsx (4: Tests O, P, P2, R), app/src/ui/RecipePage.drafts.test.jsx (1, line 1058), app/src/ui/RecipePage.edit.test.jsx (1, line 429), app/src/ui/CreationFlow.test.jsx (1, line 2546, expectDeskPage). VersionRow.test.jsx line 859 (Test P3, a guard) holds the negative check 'Finish it at the desk', a shorter form. RecipeList.jsx and NotebookPlace.jsx quote none.
- The phase 12 gate reads these words in three files, and only there. 12-phone-probe.mjs quotes the old note (const LINE, line 75, and its header) and also requires "no control" in both pages, which the Edit page's link now breaks. 12-board-places.mjs holds the one-line page against the superseded board one-line-page.html (panels desk-new and desk-edit), and 12-board-band.mjs holds the head's two lines against recipe-head-below-724.html (panels band-editing and band-draft). Both specs read their words from those boards, never retype them, so a words-only edit cannot make them pass. This plan repoints exactly those panels at desk-line-words.html, the decided snapshot, keeping the same checks, and the SUMMARY says so. No other gate step reads these words: grep of every 12-*.mjs, 12-*.sh, 11-*.mjs and 08-*.mjs found no other match.
- 12-check.sh builds into "${TMPDIR:-/tmp}/sprinkles-12/check-<checkout dir name>/dist", serves every probe on an ephemeral 127.0.0.1 port, and never starts Vite or touches app/dist or port 4173. 12-board-check.mjs launches WebKit only, loading playwright-core through PLAYWRIGHT_CORE (default /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs) and calling only `webkit.launch()`. Chrome is launched in this repo with executablePath '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' and headless true (.planning/canvas-generators/p12r2-measure.mjs line 12).
- The snapshot's Edit panels read "Coffee · Version 1": a recipe named Coffee saved through the editor at 1366 with no version name typed (the default label "Version 1"), exactly what 12-board-band.mjs's makeCoffee makes.
- Tokens the two CSS rules read all exist in app/src/styles/tokens.css: --app-size-meta, --touch-min, --app-blue-text, --rule-ink-field, --offset-link-underline, --app-radius-control.
- A leaving editor writes its waiting draft from its unmount cleanup through `Promise.resolve().then(() => repository.saveDraft(record))` (useKeptDraft.js flushPendingDraft). React runs that cleanup before the new page's mount effect, so a read that the page starts inside its own `Promise.resolve().then(...)` is called after that write is called and IndexedDB opens its transaction after the write's. A read called directly in the effect body would run first and show the name from before the last keystrokes.
- estimate-calibration: factor 1, 0 samples, confidence low.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: The closing words, end to end: the recipe head's two lines and the one-line page's line read "in a wider window"</name>
  <files>app/src/ui/VersionRow.test.jsx, app/src/ui/RecipePage.drafts.test.jsx, app/src/ui/RecipePage.edit.test.jsx, app/src/ui/CreationFlow.test.jsx, app/src/ui/VersionRow.jsx, app/src/ui/DeskOnly.jsx</files>
  <behavior>
    - VersionRow.test.jsx Test O: the kept edit's line is exactly `<p class="notebook-version__draft">Edit kept. Finish it in a wider window.</p>`.
    - Test P: the own draft's line is exactly `<p class="notebook-version__draft">Draft: Version 2 · less cream. Finish it in a wider window.</p>`. Test P2: the blank-name form reads "Draft: Version 2. Finish it in a wider window."
    - Test R: another version's waiting draft reads "Draft: " + the built link "Version 3 · 40 g oil" + ". Finish it in a wider window." (the regex keeps its shape with the new ending).
    - Test P3 (a guard, from 724 up): its negative check names the new words, 'Finish it in a wider window', so it keeps guarding the line it guarded.
    - RecipePage.drafts.test.jsx line 1058: the page's one draft line reads 'Draft: Version 2 · less milk. Finish it in a wider window.' RecipePage.edit.test.jsx line 429: the line reads 'Edit kept. Finish it in a wider window.'
    - CreationFlow.test.jsx expectDeskPage: the note reads 'Done in a wider window.'
    - Red before the change: every case above except P3 fails on the old words; P3 passes as a bound.
  </behavior>
  <action>
RED. In the six expectations listed in the behavior block, replace the old closing words with "in a wider window", and nothing else. The four files are VersionRow.test.jsx, RecipePage.drafts.test.jsx, RecipePage.edit.test.jsx and CreationFlow.test.jsx. Leave every other assertion as it is. Run the four files and record the failures. Commit only those four test files by explicit path: `test: the desk sentences end in a wider window`.

GREEN. In app/src/ui/VersionRow.jsx set EDIT_KEPT_LINE to 'Edit kept. Finish it in a wider window.' and DRAFT_LINE_ENDING to '. Finish it in a wider window.'. Update their comment (lines 24-27) to cite sketch 016 CONTRACT sections 2 and 12, in one or two plain sentences. In app/src/ui/DeskOnly.jsx set the note to 'Done in a wider window.'. Rewrite the comment's first sentence so it no longer quotes the old phrase: creating and editing are done in a wider window (CONTRACT section 12). This task changes no structure; Task 2 does. Run the four files green. Commit VersionRow.jsx and DeskOnly.jsx by explicit path: `feat: the desk sentences end in a wider window`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/VersionRow.test.jsx src/ui/RecipePage.drafts.test.jsx src/ui/RecipePage.edit.test.jsx src/ui/CreationFlow.test.jsx</automated>
    <automated>! grep -rqF "at the desk or on the iPad" app/src # [HEAD=present EXPECT==absent @65678e4f] (11 lines at HEAD)</automated>
    <automated>grep -c "in a wider window" app/src/ui/VersionRow.jsx # [HEAD=0 EXPECT==2 @65678e4f]</automated>
    <automated>grep -c "Done in a wider window." app/src/ui/DeskOnly.jsx # [HEAD=0 EXPECT==1 @65678e4f]</automated>
  </verify>
  <done>The listed cases failed on the old words and pass on the new ones. Below 724 the recipe head's two lines and the one-line page end "in a wider window". No line under app/src quotes the old phrase. Two commits, red then green, each staged by explicit path.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The one-line page says what is kept and the Edit page names its recipe as a link back</name>
  <files>app/src/ui/CreationFlow.test.jsx, app/src/ui/DeskOnly.jsx, app/src/ui/Placeholder.jsx, app/src/ui/VersionRow.jsx, app/src/styles/shell.css</files>
  <behavior>
    All cases are in CreationFlow.test.jsx's PHONE-01 describe ("Below 724 the editor's addresses show the desk page"), at 393 unless named. "Not written" means repository.saveDraft and repository.deleteDraft were never called and store.drafts deep-equals its copy taken before the mount.
    - D1, New recipe, nothing kept: h1.place__title 'New recipe', p.place__note 'Done in a wider window.', no p.place__for, and no button, textarea, input or a in `.list-page.place`.
    - D2, New recipe with createDraftRecord('Vanilla') kept (the existing cold-visit case, rewritten): the note reads 'Draft: Vanilla. Finish it in a wider window.' with no a in the place. repository.listDrafts was called, the drafts are not written, and the path stays /notebook/new.
    - D3, the name rule: with createDraftRecord('') kept the note reads 'Draft: Untitled. Finish it in a wider window.'. With createDraftRecord('<b>x</b>') kept, the note's textContent is 'Draft: <b>x</b>. Finish it in a wider window.' and the place holds no b element.
    - D4, New recipe with only editDraftRecord() kept: 'Done in a wider window.' (a draft that is not a creation names nothing here).
    - D5, Edit, nothing kept: store.recipes holds { id: 'r-edit', name: 'Coffee' } and store.versions holds { id: 'v-edit', recipeId: 'r-edit', versionLabel: 'Version 1', createdAt: '2026-10-20T08:00:00.000Z' }. At /notebook/r-edit/v-edit/edit the place's children are, in order, h1.place__title 'Edit', p.place__for, and p.place__note 'Done in a wider window.'. p.place__for holds exactly one a: text 'Coffee · Version 1', href '/notebook/r-edit/v-edit', tabindex '0'. There is no button, textarea or input, and the drafts are not written.
    - D6, Edit with an edit kept (the existing cold-visit edit case, rewritten over D5's stored recipe and version, with editDraftRecord() kept): the same link line, and the note reads 'Edit kept. Finish it in a wider window.'. repository.getDraft was called with 'v-edit', the drafts are not written, and the path stays put.
    - D7, an Edit address naming no stored version, with editDraftRecord() kept and nothing in store.versions: 'Done in a wider window.', no p.place__for, and the drafts are not written.
    - D8, the 724 cut (the existing case): at 723 with createDraftRecord('Vanilla') kept, the note reads 'Draft: Vanilla. Finish it in a wider window.'; at 724 the editor shows.
    - D9, narrowing inside the debounce (the existing case): once the flushed write has resolved, the page's note reads 'Draft: Fresh mint. Finish it in a wider window.'. The page reads after the leaving editor's write, so it names what was typed.
    - Red before the change: D2, D3, D5, D6, D8 and D9 fail. D1, D4 and D7 pass as bounds.
  </behavior>
  <action>
RED. In the PHONE-01 describe of app/src/ui/CreationFlow.test.jsx:
- Replace expectDeskPage(title) with expectDeskPage(title, note, forLine = null). It checks the title, the note and the place's child order. When forLine is given, it checks one p.place__for holding exactly one a with that text, an href and tabindex '0'. When forLine is null, it checks that no p.place__for and no a exist. It also checks that no button, textarea or input exists and that no editor field is mounted.
- Replace expectDraftStoreUntouched with a helper asserting that the drafts are not written, as defined in the behavior block. The page now reads, so reads are allowed, and the cases name the read they expect.
- Write D1 to D9, reusing createDraftRecord, editDraftRecord and mountDesk as they are. D5 to D7 push their records into store.recipes and store.versions; the existing afterEach empties both.
Run the file and record which cases fail. Commit only CreationFlow.test.jsx by explicit path: `test: the one-line page says what is kept and names the recipe it would edit`.

GREEN, in five files.
- app/src/ui/VersionRow.jsx: add `export` to EDIT_KEPT_LINE and DRAFT_LINE_ENDING, and nothing else. The page says the head's own sentences (README decision 25), so the words have one source.
- app/src/ui/Placeholder.jsx: render `children` between the h1 and the note. Render the note's p only when note is not null; the default sentence stays as built. Every other caller passes neither, so its markup is unchanged. Adjust the comment in one sentence: DeskOnly passes Edit's link line as children and a null note while its read is out.
- app/src/ui/DeskOnly.jsx: keep DeskOnly({ title, children }) and its useBelow724 switch. Below 724 it returns a module-private page component given the title. That component tells the two jobs apart by useParams: a versionId means Edit, none means New recipe. The router stays untouched.
  - The reads are the ones CreationRoute.jsx and EditRoute.jsx already make, and no new store method and no new predicate are added.
  - New recipe: repository.listDrafts, then newestDraft over the records draftMatchesCreate accepts. Name a kept draft with creationTitle(record.payload.name), as the Notebook's draft row does.
  - Edit: repository.getVersion(versionId), getRecipe(recipeId), listVersions() and getDraft(versionId) in one Promise.all. That is EditRoute's own read minus getAllBatches, which feeds only the refusal this page does not show. When there is no version, or version.recipeId differs from recipeId, or there is no recipe, there is nothing to name (EditRoute's own not-found test). Otherwise the link text is `${recipe.name} · ${versionIdentity(sortedVersions(versionsForRecipe(versions, version.recipeId)), version)}`, the identity VersionRow's heading prints, and the link goes to notebookPath(version.recipeId, version.id). An edit is kept when the draft exists and draftMatchesEdit accepts it (EditRoute's keptEdit).
  - Start the read inside Promise.resolve().then(...) in a useEffect keyed on recipeId and versionId, with a cancelled flag, exactly as CreationRoute.jsx does. The context block gives the reason: a leaving editor's flushed write is then called first, and D9 pins it.
  - The page never writes or deletes a draft.
  - Render through Placeholder: name the title. While the read is out, the note is null and there are no children. A settled read gives the note: EDIT_KEPT_LINE for a kept edit, 'Draft: ' plus the name plus DRAFT_LINE_ENDING for a kept creation, else 'Done in a wider window.'.
  - Children: on Edit with something to name, one p with className "place__for" holding one react-router Link with a literal tabIndex={0}. The tabindex-scan test requires the literal.
  - A failed read settles as nothing kept with nothing to name.
  - Every name is a React text child.
  - Rewrite DeskOnly's head comment in plain sentences: what the page shows (CONTRACT section 12), that it reads and never writes, why the read is deferred, and the states the snapshot does not draw, as this plan's objective lists them.
- app/src/styles/shell.css: directly after the .place__note rule, add the snapshot's two rules (desk-line-words.html line 13151-13152), declaration for declaration, in the file's multi-line style, under a one-line comment citing sketch 016 CONTRACT section 12. .place__for takes margin 0 and font-size var(--app-size-meta). .place__for a takes display inline-flex, align-items center, min-height var(--touch-min), color var(--app-blue-text), text-decoration underline, text-decoration-thickness var(--rule-ink-field), text-underline-offset var(--offset-link-underline) and border-radius var(--app-radius-control). Add no value that is not a token or a keyword.
Run the verify commands green, with BASE set to the commit this plan started from (plan_head_before). Commit the five files by explicit path: `feat: the one-line page says what is kept and names the recipe it would edit`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/CreationFlow.test.jsx src/ui/tabindex-scan.test.js src/ui/Shell.test.jsx src/ui/notebookPaths.test.js src/styles/shell.test.js src/styles/tokens.test.js src/styles/cross-cutting.test.js</automated>
    <automated>grep -c "tabIndex={0}" app/src/ui/DeskOnly.jsx # [HEAD=0 EXPECT==1 @65678e4f]</automated>
    <automated>grep -c "place__for" app/src/styles/shell.css # [HEAD=0 EXPECT==2 @65678e4f]</automated>
    <automated>grep -c "^export const EDIT_KEPT_LINE\|^export const DRAFT_LINE_ENDING" app/src/ui/VersionRow.jsx # [HEAD=0 EXPECT==2 @65678e4f]</automated>
    <automated>git diff --quiet "$BASE" HEAD -- app/src/router.jsx app/src/ui/RecipeList.jsx app/src/ui/CreationRoute.jsx app/src/ui/EditRoute.jsx app/src/store</automated>
  </verify>
  <done>D2, D3, D5, D6, D8 and D9 failed before the change and pass after it, and D1, D4 and D7 hold as bounds. The one-line page names kept work in the head's own sentences, reads through the existing reads, and writes nothing. The Edit page holds the one link line. router.jsx, RecipeList.jsx, CreationRoute.jsx, EditRoute.jsx and the store are untouched. Two commits, red then green, staged by explicit path.</done>
</task>

<task type="auto">
  <name>Task 3: The phase 12 gate holds the decided board; side by side in WebKit and Chrome at 393 and 723; the full suite, GATE2, and the SUMMARY</name>
  <files>.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs, .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs, .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs, .planning/quick/261123-brl-desk-line-closing-words-in-a-wider-windo/261123-brl-SUMMARY.md</files>
  <action>
Every path below is in .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/ (PHASE). The gate changes are limited to what reads the changed words or the changed page. They keep every check kind each panel had, and they remove no check.

1. 12-phone-probe.mjs. Replace the one LINE constant with each address's own expectation, made by the probe's setup:
- /notebook/new: title 'New recipe', note 'Draft: Chocolate. Finish it in a wider window.', no control in the page.
- The edit address: title 'Edit', note 'Edit kept. Finish it in a wider window.', and exactly one control, an a inside p.place__for, whose text is 'Vanilla · Version 1' and whose href is the version's own address (editAddress without its '/edit').
At 393, wait for 'p.place__note', not '.list-page.place', so the settled page is what is read; do the same in the overflow loop. Keep the drafts-dump identity check as it is: it is the probe's proof that the page writes nothing. Update the header comment (lines 12-13) and the check's label to the new page. Change nothing else in the probe.

2. 12-board-band.mjs. Add `export` to clickUntil, visit, makeCoffee, KEEP_MS and DESK, and nothing else in them. The default export becomes an array of two specs:
- the existing board with its first five panels unchanged (band-tasted, band-awaiting, band-none, band-tasted-723, band-editable);
- board '.planning/sketches/016-entry-points-pen-preview-row-controls/desk-line-words.html' with two panels. bandPanel pid 'dl-head-edit' takes keptSteps('edit'), line true and buttonsAbsent true. bandPanel pid 'dl-head-draft' takes keptSteps('plan') with the same flags.
band-editing and band-draft leave the first spec: the decided board draws their state with the decided words. Update the header comment to say which board each panel is held against and why.

3. 12-board-places.mjs. Keep the Notebook and Home spec unchanged. Replace the one-line page's spec, board one-line-page.html with panels desk-new and desk-edit, by a spec on desk-line-words.html. Give WIN a width parameter, as 12-board-band.mjs's WIN has.
- dl-new: route '/notebook/new', no draft, extraWidths [723].
- dl-new-kept: route '/notebook/new', the engine's draft option { name: 'Coffee', recipeId: 'coffee', versionId: 'coffee-v1' }, extraWidths [723].
- dl-edit and dl-edit-kept at 393, and dl-edit-723 and dl-edit-kept-723 at 723: route '/', ready '.shell', no extraWidths, and steps from a small deskEditSteps(kept) built on the helpers imported from './12-board-band.mjs'. The steps run at DESK: makeCoffee; when kept, open Edit and type 'Strong, cold and a little bitter.' into the Recipe description, then wait KEEP_MS, as keptSteps('edit') does. Then they return to the arrived width and visit the version's address once, so its link counts as visited (the a:visited lesson). Then they visit `${address}/edit`, wait for 'p.place__note', and wait 600 ms.
- Every panel keeps anchor '.shell__main' and overflow true. Elements: .list-page.place (count, box); h1.place__title and p.place__note (count, text, font, box). The four Edit panels also take p.place__for (count, box) and p.place__for a (count, text, font, box, color).
- absent: on New recipe, p.place__for and every button, a and textarea in .list-page.place; on Edit, every button and textarea in it.
The old desk-edit panel goes with its comment: its address names no stored version, a state the decided board does not draw. Update the header comment.

4. Scratch build and runs. S is "${TMPDIR:-/tmp}/sprinkles-brl". Build once with `npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir`. Never write app/dist, never start a dev or preview server, leave port 4173 alone, and run no build while another is running. Then:
- WebKit: `PROBE_DIST="$S/dist" node PHASE/12-board-check.mjs PHASE/12-board-places.mjs PHASE/12-board-band.mjs --selftest --evidence "$S/evidence-webkit"`, then `PROBE_DIST="$S/dist" node PHASE/12-phone-probe.mjs page`.
- Chrome: write a scratch module "$S/chrome-shim.mjs" that imports playwright-core from the default PLAYWRIGHT_CORE path. It exports `webkit` as an object whose launch(options) calls chromium.launch with those options plus the Chrome executablePath and headless true named in the context block. Run the same board command with PLAYWRIGHT_CORE="$S/chrome-shim.mjs" and --evidence "$S/evidence-chrome". If the engine will not run in Chrome through the shim, say why in the SUMMARY and hold the panels another way, in a scratch script under $S.
- Measurements: write a scratch script under $S, never in the repo. It serves "$S/dist" through PHASE/../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs startServers, imported by absolute path, and aborts every request off 127.0.0.1, as 12-phone-probe.mjs does. It may import the helpers exported in step 2 by absolute path. In WebKit and in Chrome, at 393 and 723, it walks the six drawn states in one context: New recipe with nothing kept, then 'Coffee' started; Coffee saved; Edit with nothing kept; then an edit kept. It also reads the same panels in the snapshot's own page. It prints, for h1.place__title, p.place__for a and p.place__note, x and y from .shell__main's top-left, width, height and line count, plus scrollWidth against innerWidth.
- Once, in each engine: at 1366 open /notebook/new on the kept creation, type a new Recipe name, narrow to 393 within 250 ms, and read the note. It must name the typed name.
Every failure is a finding: report it and do not loosen a check to pass it.

5. The full suite: `npm --prefix app test` (if npm hangs inside the worktree, `cd app && npx vitest run`, as 12-check.sh notes). It must pass with 137 files and 4591 tests plus the new ones. An existing test failing on the old words or on the old "no control, no read" page, beyond those Tasks 1 and 2 named, is a deviation: name it, update its expectation to the decided page, and record it.

6. The gate: after step 4 finishes, run `sh PHASE/12-check.sh` once, in the background, and wait for it. It must end GATE2 PASS. If a step that reads none of these words fails (sim, pdf, walk, print, roundtrip, stops, tabs, keys), record that step's output, run the word-reading steps on their own (step 4's commands), report it, and do not edit that step.

7. Write the SUMMARY with:
- the words before and after, by file;
- the reads used and the existing readers they copy;
- red then green for Tasks 1 and 2, and the suite counts;
- the gate changes, file by file, and why they went past "the expected words only": the board specs read the words from superseded boards, and the phone probe's "no control" check met the Edit page's link;
- the measurements table, WebKit and Chrome, at 393 and 723, board against app, with the engine's PASS and FAIL counts per panel and the evidence folder paths;
- the crossing check's result;
- the 12-check.sh result;
- the undrawn states and what the build does in each, from the objective;
- the line "Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad or iPhone";
- a "For the orchestrator" section. The executor has no ArtifactData, so the orchestrator updates the row decide-p12-desk-line-closing-words and decides whether the undrawn states need a row. Home's sentence (decide-p12-home-row-sentence) is untouched. A dist built from this commit is safe to deploy once the suite and GATE2 pass.
Commit the three gate files by explicit path first: `chore: the phase 12 gate holds the one-line page and the head lines against the decided desk line board`. Then commit the SUMMARY last, by explicit path: `docs: summary for the desk line in a wider window`.

Executor rules for this whole plan:
- Tests come first: a failing test commit before each change commit.
- Stage explicit paths only. Never use `git add -A` or `git add .`. A designer is committing sketch files on main at the same time, so never stage anything under .planning/sketches or .planning/canvas-generators.
- Never write app/dist, never start a second Vite process, and leave port 4173 alone.
- Do not touch .planning/state.json or .planning/STATE.md.
- Commit messages are plain English.
- Changes are surgical: nothing on Home, the picker or the pen; nothing from 724 up; no router change.
  </action>
  <verify>
    <automated>! grep -qF "at the desk or on the iPad" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-phone-probe.mjs .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs # [HEAD=present EXPECT==absent @65678e4f] (5 lines at HEAD)</automated>
    <automated>grep -c "desk-line-words.html" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs # [HEAD=0 EXPECT>=1 @65678e4f]</automated>
    <automated>grep -c "desk-line-words.html" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs # [HEAD=0 EXPECT>=1 @65678e4f]</automated>
    <automated>grep -c "^export async function makeCoffee" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs # [HEAD=0 EXPECT==1 @65678e4f]</automated>
    <automated>npm --prefix app test</automated>
    <automated>sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh</automated>
    <automated>grep -c "Device-unverified" .planning/quick/261123-brl-desk-line-closing-words-in-a-wider-windo/261123-brl-SUMMARY.md # [HEAD=error:2 EXPECT>=1 @65678e4f]</automated>
  </verify>
  <done>The gate reads no old words. Its board specs hold the one-line page and the head's two lines against desk-line-words.html with the same check kinds. The phone probe expects the decided page and still proves the drafts store is untouched. The side by side ran in WebKit and Chrome at 393 and 723, with measurements in the SUMMARY. The full suite passes. 12-check.sh ends GATE2 PASS, or the SUMMARY names the unrelated step that stopped it, with its output, and the word-reading steps' own passes. The SUMMARY is committed last.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema are involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| address to page | recipeId and versionId come from the URL and become store keys and a link |
| store to page | stored names (a recipe's, a version's label, a kept draft's) are drawn on the page |
| kept draft | the maker's unsaved work is read by a page that must not change it |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-brl-01 | Tampering | DeskOnly.jsx names (recipe, identity, draft) | medium | mitigate | Every name is a React text child; no dangerouslySetInnerHTML. D3 renders '<b>x</b>' as text and finds no b element |
| T-brl-02 | Tampering | DeskOnly.jsx Edit read and link | low | mitigate | The URL ids are used only as keys for repository reads. The page names a version only when the stored version's recipeId equals the address's and the recipe exists, EditRoute's own check, and D7 proves it. The link is built by notebookPath, which runs every segment through encodeURIComponent |
| T-brl-03 | Tampering (data loss) | kept create and edit drafts | high | mitigate | The page reads only, through the existing reads. D2, D5 and D6 assert that saveDraft and deleteDraft are never called and that the drafts store is deep-equal before and after. The phone probe compares a drafts dump before and after each 393 visit in a real WebKit IndexedDB |
| T-brl-04 | Repudiation (misleading words) | the note after narrowing | low | mitigate | The read is deferred behind the leaving editor's flushed write, so the note names what was typed. D9 pins it over the stand-in and the scratch crossing check in WebKit and Chrome |
| T-brl-05 | Tampering (gate) | 12-board-places.mjs, 12-board-band.mjs, 12-phone-probe.mjs | low | mitigate | Panels are repointed only to the decided snapshot, every check kind is kept, --selftest still runs over them, and the SUMMARY lists each change |
| T-brl-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- Tasks 1 and 2 each land a failing test commit before their change commit.
- No line under app/src quotes the old closing words. Two lines in VersionRow.jsx and one in DeskOnly.jsx hold the new ones.
- `npm --prefix app test` passes: 137 files and 4591 tests before, plus the new cases.
- The board engine over 12-board-places.mjs and 12-board-band.mjs passes in WebKit and in Chrome (the shim), and 12-phone-probe.mjs passes. The SUMMARY holds the measurements at 393 and 723.
- 12-check.sh ends GATE2 PASS.
</verification>

<success_criteria>
- Below 724 every sentence that sends work to the desk ends "in a wider window": the one-line page and the recipe head's two lines.
- The one-line page says "Edit kept. Finish it in a wider window." or "Draft: <name>. Finish it in a wider window." when work is kept, reads the kept draft, and never writes it.
- The Edit page holds the one link line "<recipe name> · <version identity>" to the version's page, 44 high, with tabIndex={0}, styled only from tokens.
- The side by side with desk-line-words.html holds in WebKit and Chrome at 393 and 723, and is recorded as device-unverified.
- Nothing on Home, the picker, the pen or from 724 up changes. The full suite and GATE2 pass.
</success_criteria>

<output>
Create `.planning/quick/261123-brl-desk-line-closing-words-in-a-wider-windo/261123-brl-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
