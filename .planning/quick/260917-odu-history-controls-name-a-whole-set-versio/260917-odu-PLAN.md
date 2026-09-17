---
quick_id: 260917-odu
slug: history-controls-name-a-whole-set-versio
date: 2026-09-17
mode: quick
authority:
  - .planning/quick/260917-odu-history-controls-name-a-whole-set-versio/260917-odu-CONTEXT.md — Mark's direction, locked 2026-09-17 through `/impeccable clarify`. Three items — the version row's disclosure becomes the recipe's COMPLETE version list; the batch row's disclosure counts EVERY batch of the version in view; position inside both lists is named in words. "Next version" and "Record another" are preserved exactly. Every line number in it is a guide, not authority (#3786) — each one below was re-read live on 2026-09-17 against the current tree.
  - .impeccable/surfaces/route-recipe.md § 3, bullet "History controls name a whole set, never a direction" (line 91-97, commit `b9e773f`) — THE authority for the words and the reasoning. The controls read `Versions (n)` and `Batches (n)`; each count is the complete set including the one being read; "Later" is struck "as the lineage label, as the control's words … and as the disclosed region's own name"; the entry in view wears `In view`, the newest version wears `Latest`, both can sit on one entry, and both are words, not a colour or a weight. Also § 3 "Raises carried from the round" (line 54, "every superseded version reachable in one strip") and § 6 "Topology" (line 90, the lists open in place beneath their own row).
  - DESIGN.md:192 ("Colour identifies and form carries state") and DESIGN.md:253 — the **Small print** role (400, 0.75rem, tabular where numeric) explicitly names "version-strip meta". That is the type role the two markers take — grotesk, small print, reading tokens. DESIGN.md is Impeccable's file and is NOT edited.
  - .planning/sketches/003-front-matter-rows/index.html — the visual authority for these rows' STRUCTURE (`.vtree` grid at :97-103, the version row's dl at :208-216, the batch head line at :238, the batch list's in-view entry at :260). Its WORDS are pre-dated — it draws "Later versions" / "3 later versions" / "1 later batch" (:189-190, :214, :232, :238) because it is from 2026-09-09 and the brief bullet that strikes those words is from 2026-09-17. Structure from the sketch, words from the brief. One structural consequence is named and surfaced below (the `Later` dt has no replacement label, so the control leaves the dl) — that is Mark's decision landing, not a design choice taken here, and it is on the browser-check list.
  - CLAUDE.md § 3 (Surgical Changes) — every changed line traces to the words on screen, the two counts, or the markers. No adjacent rule is reformatted. Comments that THIS change makes false are rewritten (that is orphan cleanup of its own mess); comments and names it does not falsify are left alone, and the ones deliberately left are named for the SUMMARY. § 2 (Simplicity First) — two new CSS rules, two declarations each, no new token, no new module, no shared-constant abstraction for one word.
  - .claude/CLAUDE.md conventions — every visual value reads a custom property from tokens.css; notes and prose render as text; the domain and repository seams are untouched; agent prose and commit messages in English.
files_modified:
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/VersionStrip.jsx
  - app/src/ui/VersionStrip.test.jsx
  - app/src/styles/app.css
autonomous: true
must_haves:
  truths:
    - "The version row's disclosure counts and discloses EVERY version of the recipe in view, including the one being read — `versionsForRecipe(versions, version.recipeId)`, one computed array feeding both the count and the list, never two queries. An ancestor and a sibling are both in it; a subtree walk is not."
    - "The batch row's disclosure counts EVERY batch of the version in view, including the one being read — plain `batches.length`, where `batches` is already `listBatchesForVersion(id)` (RecipePage.jsx:709, MEASURED). The `- (openBatch ? 1 : 0)` correction is gone. The list it opens already rendered every batch, so only the count and the words move there."
    - "The controls read `Versions (n)` and `Batches (n)` — parenthetical, so no plural branch survives in either file. `Versions (1)` and `Versions (4)` are the same sentence (brief line 93)."
    - "`Later` is gone from every word a maker or a screen reader meets: the `<dt>Later</dt>` lineage label, both control texts, the version disclosure's `aria-label` and its `<h2>` (both become `Versions`), and every code comment in the two row files that repeats those phrases. The two DOM ids move off it as well: `version-row-later` → `version-row-versions`, `batch-row-later` → `batch-row-batches`, with their `aria-controls` following."
    - "Inside the version list, position is words: the entry being read wears `In view`, the first entry of the list's own order wears `Latest`, both can sit on one entry, every other entry wears neither. They are markup in the small-print grotesk role, not a class — readable by a screen reader and under forced colours. `.is-current`'s existing weight-plus-outline stays (brief § 6 sanctions it) and is not what carries the meaning."
    - "The marker and the order agree BY CONSTRUCTION: `Latest` is `ordered[0]` of the very array the list maps, so there is no second key to drift. The one key is `createdAt`, descending, through `sortedVersions` (lineage.js:17-26) — nulls last, ties stable. `latestVersionPerRecipe` is NOT called: a second traversal with its own null coercion is a second chance to disagree."
    - "The in-view entry is no longer a link to the page it is already on. Its version line renders as plain text and its `Open` control is not rendered at all — the dead-control rule, and the shape BatchRow's own list already uses for the batch in view (:971-974, MEASURED: `<strong>` text, no link)."
    - "The batch list's marker reads the same word as the version list's — `In view`, capitalised — so the two lists behave alike (CONTEXT item 3). Nothing else in that list changes."
    - "A ROOT version in the version list does not render `from null`. The strip's meta line is built unconditionally today (`from ${version.parentVersionLabel}`, VersionStrip.jsx:32) because it only ever received descendants, and every descendant has a parent. The complete set includes the root, whose `parentVersionId` and `parentVersionLabel` are both `null` (store contract, transfer.js:371-372). The `from …` part becomes conditional on `parentVersionId`, mirroring VersionRow's own branch at :178."
    - "Every new visual value reads a custom property. Two new rules, two declarations each, both `var(--…)`: no px, no rem, no hex, no literal."
    - "`npm --prefix app test` green. Baseline MEASURED at planning time by an actual run: **995 tests across 35 files**. No new test FILE, so 35 stays 35. Report the real number; never adjust an assertion to reach one."
    - "Two commits, in order, suite green at each. Commit 1 is the two disclosures; commit 2 is the two lists' markers. Neither leaves the suite red in between."
  artifacts:
    - "app/src/ui/VersionRow.jsx: `descendantVersions` dropped from the import (:4) and from the body; one `recipeVersions` array feeding the count and the strip; state renamed off `later`; the `<dt>Later</dt>`/`<dd>` pair (:219-234) replaced by a `<p class=\"version-row__history\">` holding the same control, sited between `</dl>` and the acts group; the disclosed section's id, `aria-label` and `<h2>` all reading `Versions` / `version-row-versions`."
    - "app/src/ui/BatchRow.jsx: the count at :459 becomes `batches.length` under a name that is not `later…`; the control's words become `Batches (n)`; the id and its `aria-controls` become `batch-row-batches`; the in-view marker at :973 reads `In view`. The `openPen !== 'record'` gate, the `> 0` gate, the `Correct` control, the churned-date span, `laterBatchMetaFor`'s behaviour and the whole tasting/battery body are untouched."
    - "app/src/ui/VersionStrip.jsx: a `latestId` derived from `ordered[0]`; a markers array per entry; the in-view entry's version line as text and its `Open` control absent; the meta line's `from …` part conditional on `parentVersionId`; the header comment rewritten off \"descendant\"."
    - "app/src/styles/app.css: exactly two new rules — `.version-row__history` (one declaration, a top margin reading `--gap-s`) placed after `.version-row__reason--empty` (~:711-715), and `.version-strip__marker` (grotesk face + small-print size, a character-for-character copy of `.version-strip__churned`'s two declarations) placed directly after it (~:799-803). THREE existing comments are corrected because this change makes them false, and no other line of the file moves: `.recipe-band__full-row`'s (:725) and `.batch-row__head`'s (:1641-1643) in Task 1 — MEASURED, those are the only two in this file that carry a struck phrase — and `.version-strip__list`'s (~:741-748, \"a card per descendant\") in Task 2, which carries no struck phrase but is no longer true."
    - "app/src/ui/VersionRow.test.jsx, BatchRow.test.jsx, VersionStrip.test.jsx: every assertion on the old words, the old counts and the old ids rewritten to the new contract — never loosened, never deleted — plus new coverage for the complete-set counts, for `In view`, for `Latest`, and for the root version's meta line."
  key_links:
    - "THE ORDER, AND WHICH KEY WINS. `VersionStrip` orders with `sortedVersions(versionsForRecipe(versions, recipeId))` (:21) — `createdAt` descending, a null `createdAt` last, ties left where the input had them (`Array#sort` is stable, and the comparator returns 0 on equal dates). `createdAt` is the ONLY orderable key the record carries: `versionLabel` is maker-authored free text (D-01/D-04), not an ordinal, and `saveOverVersion` (lineage.js:125-136) deliberately never retakes `createdAt`, so it means \"when this version was written\" and does not move on a correction. `Latest` therefore = `ordered[0].id` — positional, read off the same array the `.map` walks. Do NOT recompute it: `latestVersionPerRecipe` (lineage.js:53-62) coerces with `createdAt ?? ''` and keeps the first-encountered on a tie, so it would be a second opinion about \"newest\" living beside the first. With one array and one index there is nothing to disagree. The batch list's order is `sortedBatches` (batch.js:274-283): `churn.churnDate` descending, nulls last — and it carries no `Latest`, so it has no marker/order pair to keep honest (the brief names `Latest` for versions only; do not invent one for batches)."
    - "THE BATCH LIST IS NOT SYMMETRICAL WITH THE VERSION LIST, and the difference is load-bearing. There is no `BatchStrip` component: BatchRow.jsx renders its list inline at :951-988, and it ALREADY maps `sortedBatches(batches)` — the complete set, the batch in view included — and ALREADY marks that entry (`<strong>{date}</strong> <span class=\"batch-row__later-small\">· in view</span>`, :971-974) and ALREADY omits its link. Only the COUNT lied. So item 2 is a count-and-words change plus one capital letter in the list, and item 3's batch half is one word. The version list needs the structural work: `VersionStrip` renders every entry as a link to itself (:47, :54-58) because it has never been handed the version in view."
    - "THE COUNT'S `> 0` GATE STAYS, and its meaning changes. `RecipePage` loads `version` and `versions` in two separate effects (:696-728, MEASURED), so `versions` is `[]` for a paint or two after `version` has arrived. With the gate removed the control would flash `Versions (0)`. With it kept, the gate no longer means \"nothing later exists\" — it means \"the set has loaded\", because the version in view is always a member of its own recipe's set. `Versions (1)` therefore always shows once loaded, which is exactly what the brief's no-plural argument asks for. Same shape on the batch row: `batches.length > 0` keeps the zero-batch branch (:955-958, the `no batch yet` list, D-09) intact and unreached by this change."
    - "THE `Later` dt HAS NO REPLACEMENT LABEL, so the control leaves the dl. CONTEXT lists three things carrying the struck word and supplies two wordings for them: the control reads `Versions (n)`, the region reads `Versions`. The dt gets neither — and a dt reading `Versions` above a control reading `Versions (4)` says the word twice, while a dt reading `Versions` above a control reading `(4)` gives a screen reader a control named \"(4)\", which is worse than what is being replaced. Inventing a third word is forbidden (brief § 7 \"Must not be invented by a builder\"). So the pair is removed and the control becomes its own line immediately below the dl, keeping the sketch's tab order (metadata, then the count, then the acts) and staying inside the same non-pen branch — which is what keeps it openable while the BATCH pen is open, the availability `VersionStrip`'s own `openPen` link-suppression exists to serve (D-UAT-2). Moving it into `.versions__openers` instead would have silently removed it whenever a pen is open; moving it onto the head line beside `<h2>Version</h2>` would have needed a head wrapper the version row does not have. SURFACED, not hidden: the sketch draws this control inside the dl (:214) and it is now a line below it. Same stack, same order, slightly further left. On the browser-check list for Mark."
    - "WHAT IS DELIBERATELY NOT RENAMED, so a reader does not read it as an oversight. The five CSS class names carrying `later` (`.batch-row__later`, `-list`, `-date`, `-small`, `-meta`) and the exported helper `laterBatchMetaFor` keep their names. CONTEXT names \"the local state and the ids\" and \"its state, its ids and its region name\" — class names and a module export are none of those, they are invisible to the maker, and renaming them would pull in app.css's own rules and comments plus `cross-cutting.test.js:600` (which asserts `.batch-row__later-meta` by exact selector) and `BatchRow.test.jsx:11`'s import, for zero user-visible gain. Surgical Changes binds. Named in the SUMMARY as residual naming, not fixed here."
    - "TEST FIXTURE TRAP, and it WILL bite. `VersionStrip.test.jsx`'s `makeVersion` (:14-24) sets `parentVersionLabel` but no `parentVersionId` — a shape the store never produces (transfer.js treats the pair as both-null or both-set). The moment the meta line's `from …` becomes conditional on `parentVersionId`, the two meta assertions at :120 and :135 lose their `from 50 g oil · 800 g` prefix and go red for a fixture reason, not a product reason. Give `makeVersion` a default `parentVersionId` and add a case that overrides it to `null` to prove the root's meta line omits the part. Do not weaken the two existing assertions to accommodate the fixture."
    - "TEST ASSERTIONS THAT ARE THE CONTRACT CHANGING — 20 across two files, plus four in a third, all MEASURED by grep at planning time. `VersionRow.test.jsx`: :297-300, :314, :319-321, :331/:337, :361 (five `it`s; the old words, the `<dt>Later</dt>` negative-greps, the old aria-controls). `BatchRow.test.jsx`: :106-112, :115-124, :127-129, :132-141, :144-153, :182-190 (six `it`s; old words and the old aria-controls). `VersionStrip.test.jsx`: :66 (six anchors — becomes four, because `currentId: 'a'` IS in that fixture and that entry loses both of its links), :79-84 (\"still a link\" — now the opposite), :101-105 (the `vline` regex closes `</p>` straight after `</a>`; `currentId` is `'v1'` and the only entry is `'v2'`, so that entry is now `ordered[0]` and wears `· Latest`), :47-49 (a one-entry list where the entry is both in view and latest). :143's `Open` assertion and :86-93's churned assertions survive untouched — that fixture's entry is not the one in view. Rewrite each to the new contract and say per assertion what changed."
    - "THE OPEN STATE OF THE BATCH LIST IS NOT REACHABLE FROM A TEST, and that is a known project constraint, not a gap to paper over. There is no jsdom and no testing-library anywhere in the suite (`vitest.config.js` pins `environment: 'node'`; `grep -rln \"@testing-library|fireEvent|userEvent\" app/src` → nothing; all 19 component test files use `renderToStaticMarkup`), so a click-driven disclosure cannot be opened — which is exactly why `laterBatchMetaFor` is exported \"since the disclosure that renders this has no prop to open it from a render-only test\" (BatchRow.jsx:310-316). The version markers ARE covered, because `VersionStrip` is rendered directly by its own test file. The batch list's `In view` is covered by grep in Verify and by the orchestrator's browser check. Do NOT invent a shared constant module, a new prop, or a jsdom file to manufacture coverage for one word."
    - "`descendantVersions` BECOMES AN ORPHAN. MEASURED: its only non-test caller is VersionRow.jsx:80. After this change only `lineage.test.js` (:57-83) calls it. CONTEXT is explicit — name the orphan in the SUMMARY, do not delete it, and do not touch its tests. Removing it from VersionRow's import IS required (it is this change's own orphan); removing the function is not."
    - "COMMENT-TEXT TRAP, and this repo is the worst case for it. Both row files carry long historical comments that repeat the struck phrases verbatim (VersionRow.jsx:74-78, :272-274; BatchRow.jsx:454-457, :463-467, :951-954), and app.css does too (:725, :1641-1643). Verify negative-greps those phrases across `app/src`, so a comment that says \"formerly the later-versions disclosure\" reds the gate. Rewrite each comment to describe what the code now does; never carry a struck phrase into a file as narration. The gate reads source files only, never this plan, so the phrases appearing in the actions below cannot invalidate it."
---

# History controls name a whole set: Versions (n) and Batches (n)

Both disclosures were relative to wherever the maker was standing. "3 later versions" named a different
three on every page, and it named a subtree — so an ancestor or a sibling was unreachable from a page that
nonetheless claimed to count the versions, against the brief's own carried raise, "every superseded version
reachable in one strip". "1 later batch" was every batch minus the one being read, so the one batch a
version had was announced as none. This replaces both with the complete set and the count of it, and then
names position inside each list in words instead of leaving it to weight.

Two tasks, two commits. The disclosures first, the markers second; the suite is green at each.

## Discovered at planning — read this before editing

Every line number was read live on 2026-09-17 against the current tree. They guide, they do not authorize
(#3786) — re-grep and trust the file. Everything marked MEASURED was executed, not reasoned.

**The baseline is measured, not quoted:** `npm --prefix app test` → **35 files, 995 tests, all passing**,
run at planning time on a tree clean under `app/`.

**The batch list is already complete and already marks its in-view entry.** Only its count lied. The
version list is the one with structural work. Do not assume symmetry in the other direction — read
`must_haves.key_links`.

**The order is `createdAt` descending, via `sortedVersions`, and `Latest` is `ordered[0]`** — positional,
off the same array, so the marker cannot disagree with the order. `latestVersionPerRecipe` is a second
opinion and is not used.

**A root version now appears in the version list for the first time**, and its `parentVersionLabel` is
`null`. The meta line's `from …` part must become conditional or the card reads `from null`.

**The `Later` dt has no replacement word**, so the control moves out of the dl to the line below it. That
is the one structural consequence of Mark's decision and it is surfaced for the browser check, not decided
quietly.

**The sketch's words are pre-dated by the brief; its structure is not.** Sketch 003 (2026-09-09) draws
"Later versions"; the brief bullet striking that word is 2026-09-17 and says so explicitly. Structure from
the sketch, words from the brief. No conflict for Mark to settle beyond the dt consequence above.

---

## Task 1 — the two disclosures name whole sets

The first commit. `VersionStrip.jsx`, `router.jsx`, `PenFoot`, `lineage.js`, `DESIGN.md`, everything under
`.impeccable/`, the batch pen's save wiring, the churn-date wiring and the version field errors are all out
of this diff.

**Files:** `app/src/ui/VersionRow.jsx`, `app/src/ui/BatchRow.jsx`, `app/src/ui/VersionRow.test.jsx`,
`app/src/ui/BatchRow.test.jsx`, `app/src/styles/app.css`

**Behavior** (the contract this change must leave standing; most of these are red against the current tree,
so writing them first is welcome):

- A version row for a recipe with four versions, viewing any one of them, renders one control reading
  `Versions (4)` — the same four from every one of the four pages.
- A version with an ANCESTOR and a SIBLING counts both. Build the fixture as a three-generation, two-branch
  tree and view the middle one; the count is the whole recipe's, not the subtree's.
- A root version with no children renders `Versions (1)`, not nothing. A one-version list is still a list.
- Rendered with `versions: []` — the pre-load paint — no count control renders at all. Nothing ever shows
  `Versions (0)`.
- No `<dt>` anywhere in the row reads the struck lineage label, and the dl's remaining pairs (Written /
  From version, Why, From batch) are byte-identical to today.
- The control's `aria-controls` names the disclosed section's new id, and that id is the section's `id`.
- A batch row with two batches renders `Batches (2)`; with one — the one in view — `Batches (1)`; with none,
  no control and the `no batch yet` list still stands.
- While `openPen === 'record'` the batch count control still does not render; while amending it still does.
- Neither file contains any of the struck phrases, in markup or in a comment.

**Action:**

<!-- planner-discipline-allow: later version -->
<!-- planner-discipline-allow: later batch -->
<!-- planner-discipline-allow: Later versions -->
The struck phrases appear below ONLY as the strings being removed. Verify negative-greps them in
`app/src/**`, never in this plan, so naming them here is safe — but pasting any of them into a source
comment reds the gate loudly rather than passing falsely.

1. **`VersionRow.jsx` — the set.** Drop `descendantVersions` from the import at :4, leaving
   `citableBatches, versionsForRecipe`. Replace the `descendants` / `laterCount` pair at :80-81 with one
   array and its length: `versionsForRecipe(versions, version.recipeId)` under a name that says what it is
   (`recipeVersions`), and its `.length` under a name that is not `later…` (`versionCount`). Rename the
   disclosure state at :79 to match (`versionsOpen` / `setVersionsOpen`). Rewrite the comment block at
   :74-78 — it currently argues for the subtree in so many words, which is the behaviour being retired;
   state instead that the disclosure is the recipe's complete version list, the version in view included,
   citing the brief's bullet, and that one array feeds both the count and the strip so the two can never
   diverge.
2. **`VersionRow.jsx` — the control.** Remove the `{laterCount > 0 && (<><dt>…</dt><dd>…</dd></>)}` block
   at :219-234 from the dl entirely, leaving the dl's other pairs exactly as they are. Immediately after
   `</dl>` (:235) and before the acts group (:241), render the same control inside
   `<p className="version-row__history">`, gated on `versionCount > 0`: `type="button"`,
   `className="text-control"`, `aria-expanded` from the renamed state, `aria-controls="version-row-versions"`,
   the same toggle `onClick`, and its text `Versions (${versionCount})` — a template literal, no plural
   branch. Comment it in two or three lines: the control names the whole set so it labels itself, the
   struck lineage label had no replacement word and inventing one is forbidden, and the line sits here
   rather than in the acts group so it stays available while the batch pen is open (D-UAT-2).
3. **`VersionRow.jsx` — the region.** At :275-276 the section becomes `id="version-row-versions"`,
   `aria-label="Versions"`, and its `<h2 className="region-name">` reads `Versions`. `className` stays
   `recipe-band__full-row`. Pass the strip `versions={recipeVersions}` in place of `descendants` (:278);
   every other prop on that call is unchanged. Rewrite the comment at :272-274 the same way as step 1's.
4. **`BatchRow.jsx` — the count and the words.** At :459, `batches.length` under a name that is not
   `later…` (`batchCount`); the `- (openBatch ? 1 : 0)` correction and the `openBatch` read in it are gone.
   Rename the state at :458 to match. The control at :487-497 keeps both its gates — `openPen !== 'record'`
   and `> 0` on the new count — and its text becomes `Batches (${batchCount})`, no plural branch. Its
   `aria-controls` and the section's `id` at :961 both become `batch-row-batches`. Rewrite the comments at
   :454-457 and :951-954 so neither repeats a struck phrase and both say the count is every batch of the
   version in view. **Keep the section's `aria-label` and `<h2>` reading `Batches of this version`**: they
   carry no struck word, they are precise, and they are what distinguishes this set (one version's batches)
   from the other (one recipe's versions). Touch nothing else in the file — not `laterBatchMetaFor`, not the
   `Correct` control, not the churned-date span, not the zero-batch branch at :955-958, not the tasting or
   battery bodies, not the marker at :973 (that is Task 2).
5. **`app.css`** — one new rule, `.version-row__history`, placed after `.version-row__reason--empty`
   (~:711-715) and before the `.vmeta--developing` rule (~:721), carrying ONE declaration: a top margin
   reading `var(--gap-s)`, the same value `.version-row__reason-label` uses to open a new line in this
   stack. Comment it in two lines as the version row's history control on its own line below the metadata,
   naming the property in PROSE only — a comment line shaped as a `name: value` pair is the trap this
   project has hit before. While here, correct the two comments in this file that name a disclosure by its
   struck name and are now false — MEASURED, there are exactly two: `.recipe-band__full-row`'s (`:725`) and
   `.batch-row__head`'s (`:1641-1643`, which names the control the head line carries). Change the name in
   each and nothing else about either. Reformat, reorder and reindent nothing else in the file.
6. **`VersionRow.test.jsx`** — rewrite the five affected `it`s to the new contract (`:297-300`, `:314`,
   `:319-321`, `:331`/`:337`, `:361`), keeping each one's intent and tightening rather than loosening:
   the count assertions become the new parenthetical text; the `<dt>` negative-greps become a negative-grep
   for the struck word in any `<dt>`; the aria-controls assertion takes the new id. Retitle the describe at
   :291 and the block comment at :282-290 off the struck name. Then ADD three cases: the ancestor-plus-
   sibling tree counting the whole recipe (build it inline beside `childVersion` at :57, mirroring
   `createChildVersion`'s real shape — a second child of the root is the sibling, the grandchild the
   descendant, and view the middle version); a root with no children rendering `Versions (1)`; and
   `versions: []` rendering no control. Note in a comment that a test asserting a count must pass a
   `versions` prop that CONTAINS the version in view — the default at :32 is `[oliveOilVersion]`, so a child
   fixture rendered without it counts only the root.
7. **`BatchRow.test.jsx`** — rewrite the six affected `it`s (`:106-112`, `:115-124`, `:127-129`,
   `:132-141`, `:144-153`, `:182-190`) to the new words, counts and id. `:127-129` inverts: the case that
   asserted no control when the only batch is the one in view now asserts `Batches (1)`, and its title says
   so. `:132-141` and `:144-153` keep their existing meaning — hidden while recording, present while
   amending — with new words. Leave `:1271-1279` alone: they assert the region name, which is unchanged.
8. Run the suite, then the build. Commit all five files as one commit:
   `feat(history-controls): the two disclosures name whole sets`, with the session's `Co-Authored-By` and
   `Claude-Session` trailers.

**Verify:**

Run these lines individually: `grep -c` exits 1 when the count is zero, so an `&&` chain swallows the
rest of the block. Use `-F` where the pattern contains `${`.

```bash
# the struck phrases are gone from markup AND comments, everywhere under app/src.
# MEASURED at planning time: today this matches 6 files and 34 lines, and all 6 are in this plan's
# files_modified — VersionRow.jsx 5, BatchRow.jsx 5, VersionStrip.jsx 1, app.css 2,
# VersionRow.test.jsx 7, BatchRow.test.jsx 14. Task 1 clears all but VersionStrip.jsx's one.
grep -rniE "later[ -]version|later[ -]batch" app/src            # only app/src/ui/VersionStrip.jsx (Task 2 clears it)
grep -rn "version-row-later\|batch-row-later" app/src           # exits 1, no matches
# the new words exist
grep -c 'Versions (' app/src/ui/VersionRow.jsx                  # >= 1
grep -c 'Batches (' app/src/ui/BatchRow.jsx                     # >= 1
grep -c 'version-row-versions' app/src/ui/VersionRow.jsx        # >= 2  (the id and its aria-controls)
grep -c 'batch-row-batches' app/src/ui/BatchRow.jsx             # >= 2  (the id and its aria-controls)
# no plural branch survives in either control (-F: the pattern holds a literal ${ )
grep -cF 'version{' app/src/ui/VersionRow.jsx                   # 0   (1 today)
grep -cF 'batch${' app/src/ui/BatchRow.jsx                      # 0   (1 today)
# the subtree walk is gone from the row, and the helper is NOT deleted
grep -c "descendantVersions" app/src/ui/VersionRow.jsx          # 0
grep -c "export function descendantVersions" app/src/domain/lineage.js  # 1
# the retained region name is retained on BOTH the aria-label and the h2
grep -c "Batches of this version" app/src/ui/BatchRow.jsx       # >= 2  (3 today: aria-label, h2, comment)
# the new rule reads a token and carries no literal
grep -A3 '^\.version-row__history' app/src/styles/app.css | grep -c 'var(--'   # 1
grep -A3 '^\.version-row__history' app/src/styles/app.css | grep -cE '[0-9]+(px|rem|em)|#[0-9a-fA-F]{3}'  # 0
# no at-rule added
grep -c "^@media" app/src/styles/app.css                        # 7  (7 today, MEASURED)
# the suite and the build
npm --prefix app test          # 35 files, ~999 tests, all passing — report the real number
npm --prefix app run build     # succeeds
git diff --name-only HEAD~1 HEAD   # exactly the five files, VersionStrip.jsx absent
```

**Done:**

- Both controls read the complete set's count in the parenthetical form, from every page of a recipe.
- A version with an ancestor and a sibling counts both; a version with one batch says `Batches (1)`.
- Nothing under `app/src` — markup or comment — carries a struck phrase, and both ids have moved.
- `descendantVersions` is unreferenced by the row and still exported and still tested.
- One new CSS rule, one declaration, reading `--gap-s`; two false comments corrected; no at-rule added.
- Suite green with the real number reported; `npm --prefix app run build` succeeds.
- The diff is exactly five files.

---

## Task 2 — the two lists name position in words

The second commit. `VersionRow.jsx`, `lineage.js`, `router.jsx` and everything Task 1 settled are out of
this diff. `BatchRow.jsx` appears for exactly one word.

**Files:** `app/src/ui/VersionStrip.jsx`, `app/src/ui/VersionStrip.test.jsx`, `app/src/ui/BatchRow.jsx`,
`app/src/styles/app.css`

**Behavior:**

- In a three-version list viewed from the middle version, exactly one entry wears `In view` and exactly one
  wears `Latest`, and they are different entries.
- Viewed from the newest version, ONE entry wears both, in the order `In view` then `Latest`.
- Every other entry wears neither word.
- Two versions sharing a `createdAt` still produce exactly one `Latest`, and it is the entry the list puts
  first — so the marker and the order agree whatever the data does.
- The entry in view renders no `<a>` at all: its version line is text and its `Open` control is absent. The
  other entries keep both links, and while a pen is open they keep today's suppression exactly.
- The entry in view still carries `is-current`, so weight and outline still read; the words are additional,
  not a replacement.
- A root version's card reads its dates with no `from` clause and no `null` anywhere in the markup.
- The batch list's marker and the version list's read the same word.
- The two markers are in the markup as text, not as a class name, and their rule carries no literal.

**Action:**

1. **`VersionStrip.jsx` — the latest.** After `const ordered = …` (:21), derive the latest positionally from
   that same array: the id of `ordered[0]`, guarded for an empty list. One line, no import, no call into
   `lineage.js`. Comment it in two or three lines: the strip's order IS the definition of newest here, so
   reading index 0 of the array being mapped is what makes the marker and the order agree by construction;
   name `latestVersionPerRecipe` as the thing deliberately not called, and why (a second traversal with its
   own null coercion and its own tie rule is a second opinion about newest).
2. **`VersionStrip.jsx` — the markers.** Inside the `.map`, beside `isCurrent` (:27), an array built in
   reading order: the in-view word when `isCurrent`, then the latest word when the entry is `ordered[0]`.
   Render it inside `.version-strip__vline` (:42-48) immediately after the label, separated by a literal
   space, as `<span className="version-strip__marker">` whose text is the project's existing separator
   followed by the words joined by the same separator — the shape `metaParts.join(' · ')` already uses in
   this file (:49) and the shape BatchRow's list already uses for its own marker. Render nothing when the
   array is empty, so absence stays legible.
3. **`VersionStrip.jsx` — the dead controls.** The version line at :47 gains the in-view case ahead of the
   pen case: when the entry is the one in view it renders `version.versionLabel` as text, because a link to
   the page you are already on goes nowhere. On the batch line (:50-59) the `Open` control renders only when
   the entry is NOT the one in view — not as the plain word either, which would name an act that has already
   happened. Leave the `<p className="version-strip__batch">` element itself in place; with no churn date and
   no control it has no inline content and so generates no line box. The pen-suppression branch for every
   other entry is unchanged.
4. **`VersionStrip.jsx` — the root's meta line.** At :32 the `from …` part becomes conditional on
   `version.parentVersionId`, mirroring VersionRow's own branch at :178: start `metaParts` empty and push
   the `from` clause only when a parent id is present. The cited-batch clause and the written date are
   unchanged, so a root's card reads its date alone. Comment it in one line: the strip now receives the
   complete set, so it meets a root version for the first time, and a root's parent label is `null`.
   Rewrite the file's header comment (:5-19) off "descendant" — it now describes every version of the
   recipe, the one in view included, and the two markers.
5. **`BatchRow.jsx`** — one word at :973: the marker's text takes the same capitalisation the version list
   uses. Nothing else in the file changes.
6. **`app.css`** — one new rule, `.version-strip__marker`, placed directly after `.version-strip__churned`
   (~:799-803), carrying the same two declarations that rule carries: the grotesk face and the small-print
   size, both through their tokens. Comment it in two lines as the position markers' type role, citing
   DESIGN.md's Small print role, and that they are words because a marker that exists only as a style is
   invisible to a screen reader and under forced colours. While here, correct `.version-strip__list`'s
   comment (~:741-748), which says a card per descendant and is now false — the phrase only, nothing else
   about the rule. Add no colour, no weight, no motion, no position change: nothing may move on focus, hover
   or selection.
7. **`VersionStrip.test.jsx`** — first the fixture: give `makeVersion` (:14-24) a default `parentVersionId`
   so its `parentVersionLabel` is no longer orphaned, which keeps :120 and :135 asserting exactly what they
   assert today. Then rewrite the four affected cases: :66's anchor count (that fixture's `currentId` IS in
   the list, so that entry loses two anchors — state the new number and why in the comment at :64-65);
   :79-84, which now asserts the opposite of its title (`is-current` kept, no `<a>` for that entry, the
   in-view word present) — retitle it; :101-105's `vline` regex, which no longer closes `</p>` straight after
   `</a>` because that entry is `ordered[0]` and wears the latest word; and :47-49, whose single entry is now
   both in view and latest. Then ADD cases for: exactly one of each marker in a three-entry list viewed from
   the middle; both markers on one entry, in reading order, when the newest is the one in view; no marker
   text on the other entries; one `Latest` only when two entries share a `createdAt`; the in-view entry
   rendering no `<a>` and no `Open`; and a root version (`parentVersionId: null`) whose meta line carries no
   `from` clause and whose markup contains no `null`.
8. Run the suite, then the build. Commit all four files as one commit:
   `feat(history-controls): the version and batch lists name position in words`, with the session's
   `Co-Authored-By` and `Claude-Session` trailers.

**Verify:**

Run these lines individually — `grep -c` exits 1 on a zero count.

```bash
# the markers exist as words, in both lists, reading the same word
grep -c 'In view' app/src/ui/VersionStrip.jsx        # >= 1
grep -c 'In view' app/src/ui/BatchRow.jsx            # 1   (exactly one: the list's own marker)
grep -c 'Latest' app/src/ui/VersionStrip.jsx         # >= 1  (case-sensitive: latestId/latestChurnDate do not match)
grep -rn '· in view' app/src                          # exits 1 — the lowercase marker is retired
# no marker exists as a class name (form carries state; the WORDS carry the meaning)
grep -c 'is-latest\|is-in-view' app/src/ui/VersionStrip.jsx app/src/styles/app.css   # 0 in both
# the newest is positional, and the second opinion is not consulted
grep -c 'ordered\[0\]' app/src/ui/VersionStrip.jsx   # >= 1
grep -c 'latestVersionPerRecipe(' app/src/ui/VersionStrip.jsx  # 0  (naming it in a comment is fine; calling it is not)
# the new rule carries two token reads and no literal, and adds no motion
grep -A4 '^\.version-strip__marker' app/src/styles/app.css | grep -c 'var(--'  # 2
grep -A4 '^\.version-strip__marker' app/src/styles/app.css | grep -cE '[0-9]+(px|rem|em)|#[0-9a-fA-F]{3}|transition|transform'  # 0
# the struck phrases are now gone from every file, VersionStrip.jsx's header comment included
grep -rniE "later[ -]version|later[ -]batch" app/src   # exits 1, no matches
# no at-rule added; the file count is unchanged
grep -c "^@media" app/src/styles/app.css             # 7
npm --prefix app test          # 35 files, ~1004 tests, all passing — report the real number
npm --prefix app run build     # succeeds
git diff --name-only HEAD~1 HEAD   # exactly the four files
```

**Done:**

- The version list names position in words: `In view` on the entry being read, `Latest` on the entry the
  list puts first, both on one entry where they coincide, neither anywhere else.
- `Latest` is `ordered[0]` of the array being mapped, so the marker and the order cannot disagree; the one
  ordering key is `createdAt` through `sortedVersions`.
- The entry in view is no longer a link to itself and has no `Open`; it still carries `is-current`.
- A root version's card carries no `from` clause and no `null`.
- Both lists' in-view markers read the same word.
- One new CSS rule, two declarations, both tokens; no colour, no weight, no motion added; one false comment
  corrected.
- Suite green with the real number reported; `npm --prefix app run build` succeeds.
- The diff is exactly four files.

---

## For the SUMMARY

- **The order, stated:** the version list renders `createdAt` descending through `sortedVersions` (nulls
  last, ties stable), and `Latest` is `ordered[0]` of that same array — positional, not recomputed. Say why
  `latestVersionPerRecipe` was not used. The batch list renders `churn.churnDate` descending through
  `sortedBatches` and carries no `Latest`.
- **What the in-view entry's link does:** nothing — it is not a link, and its `Open` control is not
  rendered. Give the reason (a dead control) and the precedent (BatchRow's list already did this).
- **What was found about the batch list:** no `BatchStrip` exists; the list is inline in `BatchRow.jsx`, it
  already rendered every batch and already marked the one in view. Only the count lied. Record that the
  assumed symmetry was not there.
- **The root-version defect this change would have introduced** (`from null` in the strip's meta line),
  found at planning, fixed in Task 2.
- **The `Later` dt consequence:** the control left the dl because the struck label had no replacement word,
  and where it went instead. Flag it as Mark's to accept or redirect.
- **The sketch divergence:** sketch 003 draws the struck words (:189-190, :214, :232, :238) and is pre-dated
  by the brief's 2026-09-17 bullet. Structure from the sketch, words from the brief. Recommend the sketch be
  rationalized so it stops reading as competing authority.
- **Orphans and residual naming, named not fixed:** `descendantVersions` now has no non-test caller; the
  five `.batch-row__later-*` class names and the exported `laterBatchMetaFor` keep their names, with the
  reason.
- **Per-assertion account** of every rewritten test — what it asserted, what it asserts now, and why that is
  the contract changing rather than a loosening. Include the `makeVersion` fixture fix and why it was needed.
- **Coverage honestly bounded:** the batch list's open state is unreachable from a render-only test (no
  jsdom, no testing-library, 19 files on `renderToStaticMarkup`), so its `In view` word is grep-gated and
  browser-verified, following `laterBatchMetaFor`'s own precedent.
- **The real test numbers** at each commit, and the delta against the measured 995 / 35 files.
- **The seeded store holds one version and one batch**, so `Versions (1)` and `Batches (1)` are all it can
  show. Exercising the counts, `Latest` on a sibling, and a root's card needs a store with real lineage —
  say how to get one (save two versions and record a second batch, or import a file).

## What the orchestrator checks in a browser (not gated here)

At 1024 and 393, on a store with at least three versions across two branches and two batches:

- The version row reads `Versions (3)` from every one of the three pages — the same three each time.
- The control's new home: its own line directly under the metadata stack, above `Next version`, and it still
  opens while the batch pen is open. Whether that placement is right is Mark's call.
- Two headings now read `Version` and `Versions` on one screen — check it reads as a set name, not a stutter.
- Inside the open list: the entry being read is not clickable and has no `Open`; it wears `In view`; the
  newest wears `Latest`; one entry wears both where they coincide; no other entry wears a word. The marker
  is small-print grotesk beside a text-face label, and nothing moved on focus or hover.
- The root version's card reads its date with no `from` clause and no stray `null`.
- The batch row reads `Batches (2)`, and its list's in-view entry reads the same word the version list uses.
- `Next version` and `Record another` are untouched.
- Forced colours and a screen reader: both markers are announced as words.
