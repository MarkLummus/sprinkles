---
phase: quick-261123-ghj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/VersionRow.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipeList.test.jsx
  - app/src/styles/home.css
  - app/src/styles/home.test.js
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs
  - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs
  - .planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md
  - .planning/sketches/016-entry-points-pen-preview-row-controls/README.md
  - .planning/quick/261123-ghj-home-below-724-with-a-next-version-draft-kept-mark-answered/261123-ghj-SUMMARY.md
autonomous: true
requirements: [decide-p12-home-row-sentence, PHONE-01]

must_haves:
  truths:
    - "Below 724, when Home's lead is named by a kept Next version draft, the lead's line reads 'Draft: <draft name>. Finish it in a wider window.' as plain text, with no 'Draft open on this version' and no Go to draft; the draft name is the version page's own (the next ordinal, then the typed version name)"
    - "Below 724, a Record batch or Record tasting whose version holds a kept Next version draft is not in the markup; a row that loses it holds p.home__row-draft with the same sentence in its place, directly after span.home__meta; a lead that loses it has no span.home__actions"
    - "Below 724 Home's lead never shows Keep developing, with or without a kept draft (Mark's answer to decide-p12-home-row-sentence, 2026-11-23, reversing CONTRACT section 3 and README decision 4 below 724); a row's Keep developing stays as built, in the markup and hidden by home.css below 760, as the board draws it"
    - "From 724 up Home is unchanged: with the same kept drafts, below724 false and the prop left out render identical markup with the built lead line, the built actions and no p.home__row-draft"
    - "The sentence has one source: RecipeList.jsx imports heldDraftLine from VersionRow.jsx, which builds it from the version page's draft name and DRAFT_LINE_ENDING; RecipeList.jsx spells none of its words"
    - "Home reads kept drafts and never writes them: the band probe's drafts dump is byte-identical after Home loads at 393"
    - "The built Home at 393 is held against home-held-draft-393.html's third panel (hd-nokeep) in Playwright WebKit and in Chrome within 1 px, and the measurements are in the SUMMARY, named device-unverified"
    - "The full suite passes (137 files, 4596 tests before this item, plus the new ones) and 12-check.sh ends GATE2 PASS"
  artifacts:
    - path: app/src/ui/RecipeList.jsx
      provides: "Home below 724: the lead's draft sentence, the left-out record acts, the row sentence, no Keep developing in the lead"
    - path: app/src/ui/VersionRow.jsx
      provides: "heldDraftLine(record, versionCount), exported: the one sentence the version page and Home both say"
    - path: app/src/styles/home.css
      provides: ".home__row-draft, copied declaration for declaration from the snapshot, tokens only"
    - path: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
      provides: "Home with two kept drafts held against the decided panel hd-nokeep"
    - path: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs
      provides: "Home at 393 offers no record act on a version holding a plan draft, says why, and writes nothing"
  key_links:
    - from: app/src/ui/RecipeList.jsx
      to: app/src/ui/VersionRow.jsx
      via: "imports heldDraftLine ('Draft: ' + the draft name + DRAFT_LINE_ENDING)"
    - from: app/src/ui/RecipeList.jsx
      to: app/src/domain/draft.js
      via: "draftMatchesVersion and newestDraft: only a plan draft the version page would hold shut is named"
    - from: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs
      to: .planning/sketches/016-entry-points-pen-preview-row-controls/home-held-draft-393.html
      via: "panel hd-nokeep (the third panel, Keep developing left out)"
---

<objective>
Build Home below 724 with a Next version draft kept, as Mark answered `decide-p12-home-row-sentence` on 2026-11-23: the sentence on the row too, and Keep developing left out below 724. Authority: the snapshot `.planning/sketches/016-entry-points-pen-preview-row-controls/home-held-draft-393.html`, its third panel (`data-pid="hd-nokeep"`, "Drawn · the other choice: no Keep developing below 724"), markup and CSS; sketch 016 CONTRACT.md section 12 ("Home below 724 with a Next version draft kept") and section 13 ("Home's rows below 724"); README decisions 19 to 22 and 31 to 33. Below 724 only:

1. Lead line (decision 19): when the lead is named by a kept Next version draft, `p.home__lead-draft` reads "Draft: <draft name>. Finish it in a wider window." as plain text, in place of "Draft open on this version · Go to draft".
2. Left-out record act (decision 20): a record act whose version holds a kept Next version draft is not in the markup. That is Record batch when the latest version holds the draft, and Record tasting when the version of the batch awaiting its tasting holds it.
3. Row sentence (decision 31): a row that loses its record act loses its whole `span.home__actions` and holds `p.home__row-draft` with the same sentence in its place.
4. Keep developing (decision 32, Mark's answer): it is left out of Home's lead below 724. A lead whose record act is also left out has no `span.home__actions`.
5. One source: the sentence comes from VersionRow.jsx, the constants today's quick 261123-brl exported (commits 49e73378, e865f298). Nothing is copied.

From 724 up Home is unchanged, and a test pins that.

<!-- planner-discipline-allow: wider window -->

**This reverses part of an approved decision.** Keep developing in the lead was approved on 2026-11-21: CONTRACT section 3 ("the seed's lead, which awaits a tasting (Record tasting, Keep developing), as built") and README decision 4 ("Keep developing and Adapt only open the recipe page and stay as built"). Mark's answer leaves it out below 724. This plan reads the answer as covering every lead below 724, with or without a kept draft. Three reasons:
- the panel's caption says "no Keep developing below 724" and gives a reason that holds at any phone width ("nothing on that page develops the recipe at this width");
- Sid's recommendation is that "the label promises a desk job";
- the reversal of the 2026-11-21 decision is about the seed's lead, which holds no draft.

These places hold the earlier decision, and this plan updates each one and says so in the SUMMARY:
- app/src/ui/RecipeList.test.jsx line 858;
- 12-board-places.mjs line 67, which holds the lead's words against notebook-home-more-393.html;
- CONTRACT.md lines 30 and 150;
- README.md lines 80 and 158.

12-band-probe.mjs lines 297-316 press Home's Record tasting at 393 on a version that holds a plan draft. This build leaves that link out, so the check is rewritten to the decided behaviour.

States the snapshot does not draw. This plan states each one and builds it from a built precedent; the SUMMARY lists them for the orchestrator:
- U1, a kept record or Correct draft below 724: the lead reads "Draft open on this version · Go to draft", as built, and the record acts stay, because the pen reopens on the phone (README "Not settled", round two). Keep developing is still left out of the lead.
- U2, a recipe with an edit kept: no action and no line at any width, as built.
- U3, Adapt on a tasted recipe's lead: unchanged. Below 724 the lead holds Adapt alone.
- U4, a lead with no kept draft below 724, such as the seed's lead awaiting a tasting: Record tasting alone. No board draws it, and notebook-home-more-393.html still draws Keep developing.
- U5, a Next version draft kept on a version other than the one the record act opens (for example the latest, while the batch awaiting a tasting is on an older version): the record act stays in the lead and in the row (CONTRACT section 2, "Another version of the same recipe ... keeps its record act"). The lead's line reads the sentence. The row gets no sentence.
- U6, a tasted recipe holding a Next version draft: its row has no actions (PHONE-01) and no sentence, because decision 20 names only Record batch and Record tasting. As the lead, it reads the sentence and keeps Adapt.
- U7, a stale plan draft (one draftMatchesVersion refuses): not named, and the actions are as built. The version page deletes it on visit.
- U8, one recipe holding plan drafts on two of its versions: the lead's line names the newest draft. The row's sentence names the draft on the version its record act opens.

If the executor finds the snapshot and the contract disagree anywhere else, or meets a state not listed here, it stops that point and reports it. It does not invent a design.

Source coverage (catalog row and item notes):

| Source item | Task |
|---|---|
| lead reads "Draft: <draft name>. Finish it in a wider window." plain, no Go to draft | 1 |
| a record act whose version holds the kept draft is left out | 1 |
| a row whose action is left out reads the sentence in its place | 1 |
| Keep developing left out below 724 | 1, and 2 (gate) and 3 (contract notes) |
| from 724 up nothing changes, and a test pins it | 1 (B9), 2 (scratch read at 724 and 1366) |
| share the sentence with VersionRow.jsx, no second copy | 1 |
| snapshot third panel side by side, WebKit and Chromium, scratch build | 2 |
| earlier contract, tests and gate scripts updated, saying so | 1, 2, 3 |
| undrawn: kept record or Correct draft, edit kept, Adapt on a tasted lead | 1 (B6, B7, B11), objective U1 to U3 |
| 12-check.sh still ends GATE2 PASS | 3 |

Purpose: on the phone Home stops offering a record act that the version page refuses while a draft is kept. Today that link dead-ends (12-REVIEW.md IN-02). Home now says where the draft is finished.
Output: the build in VersionRow.jsx, RecipeList.jsx and home.css, the tests, the gate held against the decided panel, notes in sketch 016's contract and README, and the SUMMARY.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/RecipeList.jsx
@app/src/styles/home.css
@.planning/quick/261123-brl-desk-line-closing-words-in-a-wider-windo/261123-brl-SUMMARY.md

Read these ranges only:
- .planning/sketches/016-entry-points-pen-preview-row-controls/README.md lines 52-60 (Mark's round-three answers), 76-87 (decisions 1 to 7), 155-160 (decisions 19 to 22), 218-222 (decisions 31 to 33) and 263-270 (not settled).
- .planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md lines 25-31 (section 3), 125-142 (section 12) and 144-150 (section 13, Home's rows).
- .planning/sketches/016-entry-points-pen-preview-row-controls/home-held-draft-393.html line 13153 (the `.home__row-draft` rule to copy). The body is one long line from 13170. Read the third panel with a short script (`python3 -I` or node) that prints the markup from `data-pid="hd-nokeep"` to the next `data-pid`, svg elements dropped, never with Read.
- app/src/ui/VersionRow.jsx lines 24-29 (EDIT_KEPT_LINE, DRAFT_LINE_ENDING), 196-205 (the draft name closure) and 377-398 (the draft line).
- app/src/ui/useKeptDraft.js lines 310-317 (below 724 a fitting plan record is held shut: heldPlan).
- app/src/ui/RecipeList.test.jsx lines 388-500 (renderBodyWithDrafts, planPayloadFor, draftOn, correctDraftOn, leadOf, draftLine) and 821-877 (the PHONE-01 describe).
- app/src/styles/home.test.js lines 28-54 and 228-240 (the parse, the three-media rule, the renders-exactly-once pattern).
- .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs (all, 185 lines), 12-board-band.mjs lines 41-77, 12-band-probe.mjs lines 1-30 and 210-316, and 12-board-check.mjs lines 52-110 (spec and panel format).

Facts checked at planning time (HEAD fa19967d):
- **The third panel (hd-nokeep).** Every row's text is the seed's, except the two draft lines, which hold the version names the capture typed.
  - Lead: `section.home__lead` > `div.home__lead-identity` holds the place, the name (a link to Mexican Chocolate v4), `p.home__lead-meta` "Version 3 · v3", then `p.home__lead-draft` "Draft: Version 5 · more cinnamon. Finish it in a wider window." (text only). No `span.home__actions` follows.
  - Rows, in order:
    1. Mexican Chocolate: Awaiting tasting, `p.home__row-draft` with the same sentence, no actions span.
    2. Olive Oil Ice Cream, circulator: Tasted, nothing.
    3. Pineapple: Tasted, nothing.
    4. Underbelly Light Base: Not yet churned, `p.home__row-draft` "Draft: Version 3 · less cream. Finish it in a wider window.", no actions span.
    5. Coconut: Record tasting and Keep developing, as built.
    6. Mocha: Record tasting and Keep developing, as built.
    7. Standard Base: Record batch.
    8. Strawberry: Tasted, nothing.
  - Each `p.home__row-draft` stands directly after the row's `span.home__meta`.
  - The rows' Keep developing stays in the markup (home.css hides it below 760).
- **The snapshot rule** (line 13153, top level, outside any media block) is `.home__row-draft` with `grid-area: actions; margin: 0; font-family: var(--face-grotesk); font-size: var(--app-size-meta); color: var(--app-text)`. All three tokens exist and home.css already reads them.
- **How the board was made.** It was captured from the seed with Next version drafts typed at 1366: 'more cinnamon' on /notebook/mexican-chocolate/mexican-chocolate-v3, then 'less cream' on /notebook/underbelly-light-base/underbelly-light-base-v2 (.planning/canvas-generators/p12r2-capture.mjs line 54). The clock was fixed, so the two drafts tied, and Mexican Chocolate's won the tie for newest. The gate runs on the real clock. It must type Underbelly's draft first and Mexican Chocolate's second, so that Mexican Chocolate's is the newest and leads, as on the board.
- **The version page's rule.** Below 724, a plan record that fits (draftMatchesVersion) is held shut (useKeptDraft.js heldPlan). While one is held, VersionRow leaves the record act out (planHeld). Home's existing filter (RecipeList.jsx lines 98-106) is the same fit check, so Home and the page agree on which drafts are held.
- **The draft name** is the VersionRow closure at lines 201-204: "Version N" plus " · <label>" when the label is set, where N is the recipe's version count plus one. activeWork entries carry the recipe's versions as `entry.versions`, so Home's count is `entry.versions.length`.
- **The phase 12 gate and Home.** No other gate file reads Home's lead or rows: grep of every 12-*.mjs and 12-check.sh for Keep developing, home__lead and home__actions finds only 12-board-places.mjs and 12-band-probe.mjs line 300. RecipeList.nextVersion.test.jsx tests 1 to 4 run at desk width and do not change.
- **Tests that read RecipeList.jsx as text.** home.test.js requires `app-hand` exactly once and `home__loading` exactly once. cross-cutting.test.js requires the page's one outer class exactly once. No new comment may spell any of those three. home.test.js also requires exactly three @media conditions and every selector starting `.home`, so the new rule goes at the top level.
- **The seed holds a recipe named Mocha.** The band probe's own Mocha must be found by its row's name-link href, never by its name.
- **Tools present.** playwright-core is at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs. Chrome is at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome. 12-board-check.mjs launches `webkit` only. 261123-brl ran it in Chrome through a shim module passed as PLAYWRIGHT_CORE.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Home below 724, end to end: the draft sentence in the lead and on the row, the record act left out, Keep developing out of the lead, one source for the words</name>
  <files>app/src/ui/RecipeList.test.jsx, app/src/styles/home.test.js, app/src/ui/VersionRow.jsx, app/src/ui/RecipeList.jsx, app/src/styles/home.css</files>
  <behavior>
    Fixture for B1 to B11 (RecipeList.test.jsx, a new describe "Home below 724 with a Next version draft kept (sketch 016 CONTRACT sections 12 and 13)", rendered through HomeBody with below724 unless named):
    - Versions: recipe mc with mc-3 (2026-01-01) and mc-4 (2026-02-01); ub with ub-2; co with co-2; ol with ol-1. Each is built with makeVersion, so every draft built with planPayloadFor(oliveOilVersion) fits.
    - Recipes: { mc: 'Mexican Chocolate', ub: 'Underbelly Light Base', co: 'Coconut', ol: 'Olive Oil' }.
    - Batches: one awaiting batch on mc-3, one on co-2, and a tasted one on ol-1.
    - Drafts: a plan draft on mc-3 with payload versionLabel 'more cinnamon' and updatedAt 2026-03-02, and a plan draft on ub-2 with 'less cream' and 2026-03-01, built with draftOn and a payload override.
    Cases:
    - B1: the lead's line is exactly `<p class="home__lead-draft">Draft: Version 3 · more cinnamon. Finish it in a wider window.</p>`. It holds no a and no "Go to draft".
    - B2: the lead holds no `home__actions`. Record tasting is gone because mc-3 holds the draft, and Keep developing is gone below 724.
    - B3, mc's row: no `home__actions`, and `<p class="home__row-draft">Draft: Version 3 · more cinnamon. Finish it in a wider window.</p>` directly after its `home__meta` span.
    - B3, the other rows: ub's row has no actions and reads "Draft: Version 2 · less cream. Finish it in a wider window.". co's row holds Record tasting and Keep developing, as built. ol's tasted row has no actions and no draft line. The markup holds exactly two `home__row-draft`.
    - B4: the only draft is a plan on mc-4 (none on mc-3). The lead reads "Draft: Version 3 · <its label>. Finish it in a wider window.", and its actions are ['Record tasting'] alone. mc's row keeps ['Record tasting', 'Keep developing'] with no `home__row-draft` (U5).
    - B5: the existing PHONE-01 case at line 856. The awaiting lead below 724 now expects ['Record tasting'], because Keep developing is left out of the lead below 724 (U4). The rows' expectations ['Record tasting', 'Keep developing'] and ['Record batch'] and the not-yet-churned lead's ['Record batch'] are unchanged. The case name says so.
    - B6: the only draft is a Correct draft on mc-3 for its stored awaiting batch (correctDraftOn). The lead's line is the built one, "Draft open on this version · " with a Go to draft link to the batch's address. Its actions are ['Record tasting']. No `home__row-draft` appears (U1).
    - B7: the plan draft on ub-2 is replaced by an edit draft (kind 'edit', as the D-24 describe builds one). ub's row has no actions and no `home__row-draft` (U2).
    - B8: a plan draft on mc-3 whose versionLabel is '<b>x</b>'. The lead's line and mc's row hold `&lt;b&gt;x&lt;/b&gt;`, and the markup holds no `<b>` element.
    - B9, from 724 up: with B1's drafts, below724 false and the prop left out render identical markup. The lead's line matches the built `Draft open on this version · <a ...>Go to draft</a>`. The lead's actions are ['Record tasting', 'Keep developing']. Every row's actions span is as built: mc Record tasting and Keep developing, ub Record batch, co Record tasting and Keep developing, ol Next version and Adapt. No `home__row-draft` appears anywhere.
    - B10: the only draft is a stale plan on mc-3 (shapeVersion 2). No draft line, mc's row keeps Record tasting, and no `home__row-draft` (U7).
    - B11: the only draft is a plan on ol-1, the tasted recipe. ol leads, its line reads the sentence, and its actions are ['Adapt']. ol's row has no actions and no `home__row-draft` (U3, U6).
    - home.test.js: a top-level `.home__row-draft` rule declares grid-area actions, margin 0, font-family var(--face-grotesk), font-size var(--app-size-meta) and color var(--app-text). RecipeList.jsx's source carries `home__row-draft` exactly once.
    - Red before the change: B1 to B5, B8, B11 and the two home.test.js cases fail. B6 fails only on Keep developing. B7, B9 and B10 pass as bounds.
  </behavior>
  <action>
RED. Write the cases in the behavior block.
- In app/src/ui/RecipeList.test.jsx add the new describe with B1 to B4 and B6 to B11, and change the existing PHONE-01 case (B5). Reuse makeVersion, makeBatch, planPayloadFor, draftOn, correctDraftOn, buildDraftRecord, leadOf and draftLine as they are. A small helper may pick one row's markup by its name link's href.
- In app/src/styles/home.test.js add the two cases, following the `.home__loading` pattern.
Run `npm --prefix app test -- src/ui/RecipeList.test.jsx src/styles/home.test.js` and record which cases fail. Commit only those two test files, by explicit path: `test: Home below 724 names a kept Next version draft and leaves its record act out`.

GREEN, in three files. Per Mark's answer to decide-p12-home-row-sentence and sketch 016 CONTRACT sections 12 and 13.

app/src/ui/VersionRow.jsx:
- Move the draft name closure (lines 198-204) to module scope as `function draftName(record, versionCount)`. Keep its body and comment, with versionCount in place of ordered.length.
- Add `export function heldDraftLine(record, versionCount)` directly below it. It returns 'Draft: ', then draftName(record, versionCount), then DRAFT_LINE_ENDING. Give it a one-line comment: the version page's held line and Home's lead and rows say this one sentence (CONTRACT sections 2, 12 and 13).
- In the component, waitingName becomes draftName(draft, ordered.length), and the held line at line 389 renders heldDraftLine(ownDraft, ordered.length).
- Nothing else changes. VersionRow's rendered words stay byte-identical (Tests O, P, P2 and R in VersionRow.test.jsx hold them), and DeskOnly's imports are untouched.

app/src/ui/RecipeList.jsx:
- Import heldDraftLine from './VersionRow.jsx'.
- HomeBody:
  - Name the existing fit filter's result `fitting` and take newestDraft(fitting), with no change to the filter.
  - Build `heldPlans`, a Map from versionId to record over the fitting records whose kind is 'plan'. Build it only when below724; otherwise it is an empty Map, so nothing changes from 724 up. Use a Map, never an object keyed by a stored id (T-03-10).
  - Compute leadDraftLine: when below724 and the newest draft's kind is 'plan', heldDraftLine(draft, lead.versions.length); otherwise null.
  - Pass heldPlans to HomeLead and RecipeRows, and leadDraftLine to HomeLead as draftLine.
- Add a module-private recordActVersionId(entry): the version Home's record act opens. That is entry.latestVersion.id for NOT_YET_CHURNED (Record batch opens the latest version), entry.batches[0].versionId for AWAITING_TASTING (Record tasting opens that batch's version), and null for TASTED (Home has no record act there).
- HomeLead: add props `draftLine = null` and `heldPlans = new Map()`.
  - While draftVersion is set and draftLine is not null, the identity's line is `p.home__lead-draft` holding draftLine as a text child. Otherwise it is the built line, untouched.
  - RowActions gets `held={heldPlans.has(recordActVersionId(entry))}`.
- RowActions: add `held = false`.
  - For NOT_YET_CHURNED and AWAITING_TASTING, a held record act returns null: the whole span, as a tasted row's goes. In a lead below 724 the only other action, Keep developing, is out anyway.
  - For AWAITING_TASTING, render the Keep developing link unless below724 and lead.
  - TASTED is unchanged.
- RecipeRows: add `heldPlans = new Map()`.
  - A recipe in editingIds renders nothing in the actions place, as built.
  - Otherwise, if heldPlans holds a record for recordActVersionId(entry), render `<p className="home__row-draft">` holding heldDraftLine(record, entry.versions.length) in RowActions' place, after the meta span. Otherwise render RowActions as built.
- Every name is a React text child. No new link is added. Rewrite the RowActions comment (lines 200-211) and add one sentence to HomeBody's comment, in plain sentences citing sketch 016 CONTRACT sections 12 and 13 and Mark's answer. No comment in this file may spell the sentence's words, the class home__row-draft, app-hand, home__loading or the page's outer class name.

app/src/styles/home.css: directly after the `.home__actions` rule, add `.home__row-draft` with the snapshot's five declarations, in the file's multi-line style, under a short comment citing sketch 016 CONTRACT section 13. Put it at the top level, in no media block: the class renders only below 724, and home.test.js allows exactly three media conditions. Add only tokens and keywords.

Run the verify commands green. Commit the three files by explicit path: `feat: Home below 724 names a kept Next version draft and leaves its record act out`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/RecipeList.test.jsx src/ui/RecipeList.nextVersion.test.jsx src/styles/home.test.js src/ui/VersionRow.test.jsx src/ui/RecipePage.drafts.test.jsx src/ui/CreationFlow.test.jsx src/ui/tabindex-scan.test.js src/styles/cross-cutting.test.js src/styles/tokens.test.js</automated>
    <automated>grep -c "home__row-draft" app/src/ui/RecipeList.jsx # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "^\.home__row-draft {" app/src/styles/home.css # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "^export function heldDraftLine" app/src/ui/VersionRow.jsx # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "from './VersionRow.jsx'" app/src/ui/RecipeList.jsx # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>test "$(grep -c "heldDraftLine" app/src/ui/RecipeList.jsx)" -ge 3 && ! grep -q "wider window" app/src/ui/RecipeList.jsx # [HEAD=0 EXPECT>=3 @fa19967d] (heldDraftLine: the import, the lead and the row; the sentence's words stay out of this file, so their one source is VersionRow.jsx)</automated>
  </verify>
  <done>B1 to B5, B8, B11 and the two style cases failed before the change and pass after it. B6 failed on Keep developing alone and passes. B7, B9 and B10 held as bounds throughout. Below 724, Home's lead and rows say the version page's sentence, a record act on a version holding a kept Next version draft is gone, and Keep developing is out of the lead. From 724 up the markup is identical. Two commits, red then green, staged by explicit path.</done>
</task>

<task type="auto">
  <name>Task 2: The phase 12 gate holds the decided panel; side by side with hd-nokeep in WebKit and Chrome on a scratch build</name>
  <files>.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs, .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs, .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs</files>
  <precondition>playwright-core exists at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs, and Chrome exists at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome (both present at planning time)</precondition>
  <action>
Every path below is in .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/ (PHASE). The gate changes are limited to what reads Home's lead or rows. Each keeps the check kinds it had, and the SUMMARY names every change.

1. 12-board-band.mjs: add `export` to `const ROUTES`, and nothing else. Add ROUTES to the header line that names the helpers 12-board-places.mjs reuses.

2. 12-board-places.mjs.
- Split HOME_ROWS into its lead entries and the rest (title, `.home__lead`, then the rows' entries).
- The `home` panel on notebook-home-more-393.html keeps every entry except one: `.home__lead .home__actions` (count, text, box) becomes `.home__lead .home__actions` (count, box) plus `.home__lead .home__action:not(.home__action--secondary)` (count, text). Give it a comment. That board draws the seed's lead with Record tasting beside Keep developing (CONTRACT section 3, README decision 4, approved 2026-11-21). Mark's answer to decide-p12-home-row-sentence (2026-11-23) leaves Keep developing out of the lead below 724. So the lead's words and the filled action's width are no longer that board's; the span's place and size, and the filled action's word, still are. RecipeList.test.jsx B5 pins the absence.
- If the span's box does not match within 1 px, report it with the two boxes. Do not drop the check.
- Add a spec on '.planning/sketches/016-entry-points-pen-preview-row-controls/home-held-draft-393.html' with one panel, from base('hd-nokeep', '/'), ready '.home__list', extraWidths [723] as base gives.
- Its steps (a heldDraftSteps built on visit, clickUntil, KEEP_MS, DESK and ROUTES imported from './12-board-band.mjs'):
  - At DESK, for ROUTES.none with 'less cream' and then ROUTES.awaiting with 'more cinnamon', in that order (the context block says why): visit the route, wait for '.notebook-version', and clickUntil the acts row's Next version button until 'form[aria-label="Next version"]' shows.
  - Fill 'textarea[aria-label="Version name"]' with the words, then wait KEEP_MS.
  - Return to the arrived width, visit '/' waiting for '.home__list', and wait 600 ms.
- Elements: `.home__title` (text, font, box); `.home__lead` (count, box); `p.home__lead-draft` (count, text, font, box); the rows' entries as the `home` panel has them; `p.home__row-draft` (count, text, font, box).
- Absent: `.home__lead .home__actions`, `.home__lead-draft a`, and `.home__actions` under `.home__row:nth-child(1)`, `(2)`, `(3)`, `(4)` and `(8)`. Rows 1 and 4 are Mexican Chocolate and Underbelly Light Base, which hold the drafts. Rows 2, 3 and 8 are the tasted ones.
- Update the header comment: Home below 724 with two drafts kept is held against the decided panel hd-nokeep, and the old Home panel's lead check was narrowed, with the reason.

3. 12-band-probe.mjs.
- Replace the check "Mocha: Home's Record tasting at 393 opens the page with no pen ..." (lines 297-316). Below 724 Home no longer draws that link while the version holds a plan draft. The new check:
  - Take a drafts dump, then visit '/' waiting for '.home__list', and wait 600 ms.
  - The lead has no `.home__actions`. Its `p.home__lead-draft` has no a and reads 'Draft: Version 2 · more cocoa. Finish it in a wider window.' (Mocha's draft is the newest).
  - The probe's Mocha row (the li.home__row whose `.home__name a` href equals the probe's own `mocha` address; the seed also holds a Mocha) has no `.home__actions`, and its `p.home__row-draft` reads the same sentence.
  - The probe's Vanilla row (matched by href against `vanilla`) has no `.home__actions`, and its line reads 'Draft: Version 2 · less cream. Finish it in a wider window.'.
  - No `a.home__action` on the page has an href starting with either address.
  - The drafts dump is identical after load and after 2 s.
  - The check's label names all of this, and its PASS detail names what was read.
- Update the header's Mocha line (lines 18-20) to match. Change nothing else in the probe.

4. Scratch build and runs. S is "${TMPDIR:-/tmp}/sprinkles-ghj". Build once with `npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir`. Never write app/dist, never start a dev or preview server, leave port 4173 alone, and never run two builds at once. Then:
- WebKit: `PROBE_DIST="$S/dist" node PHASE/12-board-check.mjs PHASE/12-board-places.mjs PHASE/12-board-band.mjs --selftest --evidence "$S/evidence-webkit"`, then `PROBE_DIST="$S/dist" node PHASE/12-band-probe.mjs held widen`.
- Chrome: write "$S/chrome-shim.mjs" as 261123-brl did. It imports playwright-core from the default path and exports `webkit` as an object whose launch(options) calls chromium.launch with those options plus the Chrome executablePath and headless true. Run the same board command with PLAYWRIGHT_CORE="$S/chrome-shim.mjs" and --evidence "$S/evidence-chrome".
- Side by side: write a scratch script under $S, never in the repo.
  - It serves "$S/dist" through PHASE/../08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs startServers, imported by absolute path, and aborts every request off 127.0.0.1.
  - In WebKit and in Chrome, each in one context with a coarse pointer: at 1366 it makes the two drafts as the panel's steps do, then loads '/' at 393 x 852.
  - For `.home__lead`, `p.home__lead-draft`, every `.home__row`, every `p.home__row-draft` and every visible `.home__action`, it prints x and y from `.shell__main`'s top-left, width, height, line count and text, plus scrollWidth against innerWidth.
  - It reads the same elements in the snapshot's hd-nokeep panel, in the same engine.
  - It then reads the app at 723 (every sentence one line, README line 181, and no sideways overflow), at 724 and at 1366. From 724 up the lead must read "Draft open on this version · Go to draft", its actions must be Record tasting and Keep developing, and no `p.home__row-draft` may be present.

Every failure is a finding: report it, and do not loosen a check to pass it. Commit the three gate files by explicit path: `chore: the phase 12 gate holds Home with a kept draft against the decided board`.
  </action>
  <verify>
    <automated>grep -c "home-held-draft-393.html" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>grep -c "^export const ROUTES" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs # [HEAD=0 EXPECT==1 @fa19967d]</automated>
    <automated>grep -c "home__row-draft" .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs # [HEAD=0 EXPECT>=1 @fa19967d]</automated>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-ghj"; npm --prefix app run build -- --outDir "$S/dist" --emptyOutDir && PROBE_DIST="$S/dist" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-places.mjs .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-band.mjs --selftest && PROBE_DIST="$S/dist" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-band-probe.mjs held widen</automated>
  </verify>
  <done>12-board-places.mjs holds Home with two kept drafts against hd-nokeep, and the old Home panel's lead check is narrowed with its reason in a comment. The board engine passes over 12-board-places.mjs and 12-board-band.mjs in WebKit and in Chrome. The band probe passes with its rewritten Home check, the drafts dump identical. The side-by-side numbers, board against app at 393, and the 723, 724 and 1366 reads are recorded for the SUMMARY. One commit, staged by explicit path.</done>
</task>

<task type="auto">
  <name>Task 3: The earlier contract records the reversal; the full suite, GATE2, and the SUMMARY</name>
  <files>.planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md, .planning/sketches/016-entry-points-pen-preview-row-controls/README.md, .planning/quick/261123-ghj-home-below-724-with-a-next-version-draft-kept-mark-answered/261123-ghj-SUMMARY.md</files>
  <action>
1. Sketch 016's contract and README. Append one bracketed note to the end of four existing lines. Add no line and remove none, because research and plans cite these files by line number. Do not touch any HTML snapshot.
- CONTRACT.md line 30 (section 3, the lead): "(Reversed in part on 2026-11-23 by Mark's answer to decide-p12-home-row-sentence: below 724 Keep developing is left out of Home's lead, so the seed's lead holds Record tasting alone; see section 13.)"
- CONTRACT.md line 150 (section 13, Keep developing): "Mark answered on 2026-11-23 (decide-p12-home-row-sentence): left out below 724, in every lead."
- README.md line 80 (decision 4): "(Keep developing: reversed below 724 by Mark's answer to decide-p12-home-row-sentence, 2026-11-23; it is left out of Home's lead there. Adapt stays.)"
- README.md line 158 (decision 20), after "In the lead the other action stays (Keep developing, which opens a version that holds no draft).": "Replaced below 724 by Mark's answer to decide-p12-home-row-sentence (2026-11-23): Keep developing is left out of the lead, so this lead holds no action."
Commit these two files alone, by explicit path: `docs(sketch-016): record that Keep developing leaves Home's lead below 724`. A separate commit lets the orchestrator redo it if the designer has changed these files on main.

2. The full suite: `npm --prefix app test`. If npm hangs inside the worktree, use `cd app && npx vitest run`, as 12-check.sh notes. It must pass with 137 files and 4596 tests plus the new ones. Another existing test that held the lead's Keep developing below 724, or Home's Record tasting on a held version, is a deviation: name it, update its expectation to the decided behaviour, and record it.

3. The gate: run `sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh` once, in the background, and wait for it. It must end GATE2 PASS. A step that does not read Home may fail (suite aside: probe, print, roundtrip, pdf, sim, walk, tabs, keys). If one does, record its output, run Task 2's commands on their own, report it, and do not edit that step.

4. Write the SUMMARY with:
- what was built, file by file;
- red then green for Task 1, with the suite counts before and after;
- the reversal, and every place that held Keep developing in the lead (RecipeList.test.jsx, 12-board-places.mjs, CONTRACT.md lines 30 and 150, README.md lines 80 and 158), each with what changed;
- the band probe's rewritten Home check and why the old one went: the link it pressed is no longer drawn below 724;
- the gate changes, file by file;
- the side-by-side table, WebKit and Chrome, board against app at 393, with the engine's PASS and FAIL counts per panel, the evidence folder paths, and the 723, 724 and 1366 reads;
- the 12-check.sh result;
- the undrawn states U1 to U8 and what the build does in each;
- that this build addresses 12-REVIEW.md IN-02 (the review file itself is not edited);
- the line "Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad or iPhone";
- a "For the orchestrator" section. The executor has no ArtifactData, so the orchestrator closes decide-p12-home-row-sentence and, if still open, look-p12-home-held-draft. This plan read Mark's answer as covering every lead below 724; if he meant only while a draft is kept, the change is one condition in RowActions. The orchestrator decides whether U4 (the seed's lead at 393 now holds Record tasting alone, drawn nowhere) needs a row. A dist built from this commit is safe to deploy once the suite and GATE2 pass: it adds no store write.
Commit the SUMMARY last, by explicit path: `docs: summary for Home below 724 with a kept Next version draft`.

Executor rules for this whole plan:
- Tests come first: a failing test commit before the change commit.
- Stage explicit paths only. Never use `git add -A` or `git add .`.
- Under .planning/sketches, stage only the two files in step 1. Never stage anything under .planning/canvas-generators.
- Never write app/dist, never start a Vite dev or preview process, and leave port 4173 alone.
- Do not touch .planning/state.json or .planning/STATE.md.
- No stored shape change and no DB_VERSION change.
- Commit messages are plain English.
- Changes are surgical: nothing from 724 up, nothing on the recipe page, the pen, the picker or the Notebook.
  </action>
  <verify>
    <automated>grep -c "decide-p12-home-row-sentence" .planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md # [HEAD=1 EXPECT>=3 @fa19967d]</automated>
    <automated>grep -c "decide-p12-home-row-sentence" .planning/sketches/016-entry-points-pen-preview-row-controls/README.md # [HEAD=4 EXPECT>=6 @fa19967d]</automated>
    <automated>for f in CONTRACT.md README.md; do N=$(git diff --numstat fa19967d -- ".planning/sketches/016-entry-points-pen-preview-row-controls/$f") || exit 1; [ -n "$N" ] || exit 1; [ "$(printf '%s' "$N" | cut -f1)" = "$(printf '%s' "$N" | cut -f2)" ] || exit 1; done # each file changed, with as many lines added as removed: notes appended to existing lines, no line added</automated>
    <automated>npm --prefix app test</automated>
    <automated>sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh</automated>
    <automated>grep -c "Device-unverified" .planning/quick/261123-ghj-home-below-724-with-a-next-version-draft-kept-mark-answered/261123-ghj-SUMMARY.md # [HEAD=error:2 EXPECT>=1 @fa19967d]</automated>
  </verify>
  <done>Sketch 016's contract and README record the reversal on the four lines that held the earlier decision, with every line number unchanged. The full suite passes. 12-check.sh ends GATE2 PASS, or the SUMMARY names the unrelated step that stopped it, with its output, and Task 2's own passes. The SUMMARY is committed last.</done>
</task>

</tasks>

<threat_model>
No external API and no ORM schema are involved, so the API-coverage and schema-push checkpoints do not apply. No package is installed.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| store to page | a kept draft's typed version name is drawn on Home |
| kept draft | the maker's unsaved Next version work is read by Home, which must not change it |
| Home to recipe page | a link on Home must not lead to a page that refuses what the link promised |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ghj-01 | Tampering | RecipeList.jsx lead and row draft lines | medium | mitigate | heldDraftLine returns a string rendered as a React text child; no dangerouslySetInnerHTML. B8 renders the label '<b>x</b>' escaped in the lead and on the row and finds no b element |
| T-ghj-02 | Tampering (data loss) | kept plan drafts | high | mitigate | Home only reads drafts through the existing repository.listDrafts call; nothing in RecipeList.jsx calls saveDraft or deleteDraft. The band probe compares a drafts dump before and after Home loads at 393, and again after 2 s, in a real WebKit IndexedDB |
| T-ghj-03 | Tampering | heldPlans lookup keyed by stored version ids | low | mitigate | heldPlans is a Map, never an object written by bracket with a stored id (the T-03-10 lesson), and only records draftMatchesVersion accepts enter it (B10) |
| T-ghj-04 | Repudiation (misleading action) | Home's record acts below 724 | low | mitigate | A record act whose version holds a kept plan draft is left out of the markup and the sentence says where the draft is finished (B2, B3; band probe), closing 12-REVIEW IN-02 |
| T-ghj-05 | Tampering (gate) | 12-board-places.mjs, 12-band-probe.mjs, 12-board-band.mjs | low | mitigate | The new panel is held against the decided snapshot with the same check kinds and --selftest. The one narrowed check (the old board's lead words) is narrowed only for the decided reversal, with its reason in a comment, and B5 pins the absence. Every change is listed in the SUMMARY |
| T-ghj-SC | Tampering | npm installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- Task 1 lands a failing test commit before its change commit.
- RecipeList.jsx imports heldDraftLine from VersionRow.jsx and spells none of the sentence's words. home.css holds one top-level `.home__row-draft` rule, tokens only.
- `npm --prefix app test` passes: 137 files and 4596 tests before, plus the new cases.
- The board engine over 12-board-places.mjs and 12-board-band.mjs passes in WebKit and in Chrome (the shim), and 12-band-probe.mjs held widen passes. The SUMMARY holds the side-by-side numbers.
- 12-check.sh ends GATE2 PASS.
</verification>

<success_criteria>
- Below 724, Home's lead and every row that loses its record act say "Draft: <draft name>. Finish it in a wider window." in the version page's own words, and Home offers no record act on a version holding a kept Next version draft.
- Below 724 Home's lead shows no Keep developing. The rows' Keep developing is as built.
- From 724 up Home is byte-identical, pinned by B9 and read in the browser at 724 and 1366.
- The side by side with hd-nokeep holds in WebKit and Chrome at 393, and is recorded as device-unverified.
- The earlier contract, the test and the gate scripts that held Keep developing in the lead are updated, and the SUMMARY names each.
</success_criteria>

<output>
Create `.planning/quick/261123-ghj-home-below-724-with-a-next-version-draft-kept-mark-answered/261123-ghj-SUMMARY.md` when done, committed in the executor's worktree as the last commit.
</output>
