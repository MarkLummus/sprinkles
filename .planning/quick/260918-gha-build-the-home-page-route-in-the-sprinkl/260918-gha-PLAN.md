---
phase: quick-260918-gha
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements:
  - JAR-01
  - HUE-02
  - HOME-03
  - CONTRACT-04
  - GUARD-05
files_modified:
  - app/src/styles/tokens.css
  - app/src/styles/home.css
  - app/src/styles/home.test.js
  - app/src/styles/app.css
  - app/src/main.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipeList.test.jsx
  - app/src/ui/recipe-colour.js
  - app/src/ui/recipe-colour.test.js

estimate:
  tokens: 78000
  raw_tokens: 78000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Loading / shows The Sprinkles Jar: brand with its sprinkle rule, a nav marked on Recipes, the page title and one line of guidance, then one row per recipe carrying an identity bar in that recipe's colour, its name, its version line, a version tally, a batch tally in jar gold, and the last words in pen blue (HOME-03)."
    - "Every recipe takes one colour from the recipe palette and keeps it across all of its versions; no two recipes share a colour while fewer than RECIPE_HUE_COUNT recipes are stored; the colour is computed, never stored — no field is added to a recipe or a version and no migration is written (HUE-02)."
    - "A recipe with no batch reads 'not yet made' and draws no batch mark; a recipe with batches shows the newest batch's own words, rendered as text (HOME-03)."
    - "Export, Import and the import-errors list keep working exactly as they do at HEAD, restyled in the new world, with the errors still rendering as text (HOME-03)."
    - "No colour, size, spacing or rule weight in home.css is a literal — every one reads a custom property defined in tokens.css, and home.test.js fails if a hex or a bare px value appears there (GUARD-05)."
    - "The paper frames are untouched: app.css's button/select binder, its global link underline and its no-hex rule still hold, and RecipeList.jsx still renders className=\"list-page\" exactly once over app.css's preserved .list-page gutter rule (CONTRACT-04)."
    - "npm --prefix app test and npm --prefix app run build both pass, with every assertion that passes at HEAD still passing (CONTRACT-04)."
  artifacts:
    - app/src/styles/tokens.css
    - app/src/styles/home.css
    - app/src/styles/home.test.js
    - app/src/ui/RecipeList.jsx
    - app/src/ui/recipe-colour.js
    - app/src/ui/recipe-colour.test.js
  key_links:
    - "cross-cutting.test.js:775 greps RecipeList.jsx for the literal className=\"list-page\" and requires exactly one match — a second class on that element (className=\"list-page home\") does NOT match and breaks the suite. The Jar world must render in a child element, not by extending that class attribute."
    - "cross-cutting.test.js:708 pins app.css's .list-page rule to padding: var(--gap-page). That rule is the home page's one inline gutter; home.css must not declare a second one on .home."
    - "RecipeList.test.jsx counts rows with markup.match(/<li>/g) — an attribute on the <li> breaks two passing assertions. The row's class belongs on the <ul> and on the inner <Link>."
    - "A batch's churn date and the maker's words are NESTED: batch.churn.churnDate and batch.churn.atTheMachine, not top-level fields. Only batch.versionId is top level. domain/batch.js's sortedBatches is the one ordering — do not write a second."
    - "binder.test.js and cross-cutting.test.js read app.css, history.css and tokens.css as TEXT; they never read home.css. That is what lets home.css carry a radius, a fill and a transition — and it is also why home.test.js has to exist, or the token discipline goes unenforced on the new file."
    - "css-source.js parses exactly one level of nesting (a top-level @media block) and throws on anything else, so a nested or non-media at-rule in home.css fails home.test.js loudly rather than being silently mis-parsed."
    - "tokens.css must stay at-rule-free — cross-cutting.test.js:753 strips comments and then asserts the file contains no @media at all."
---

<objective>
Build the home page (`route:/`) in The Sprinkles Jar world: the direction contract at
`.impeccable/surfaces/route.md` is the authority, `.impeccable/surfaces/route.sketch.html` is the
visual reference (its literal hex values are not binding — tokens are chosen at build).

Purpose: home is the arrival. Mark needs to find the recipe he is working on, see at a glance how
far each one has come — versions, batches, the last verdict in his own words — and go into the
book. Today it is a bare list of names, a version line and a mass.

Output: a new `app/src/styles/home.css` and a Jar palette block in `app/src/styles/tokens.css`; a
rebuilt `RecipeList.jsx`; a framework-free identity-colour helper; and the two test files that
prove it. The recipe spread, batch log and print surfaces are not touched.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.impeccable/surfaces/route.md
@.impeccable/surfaces/route.sketch.html
@app/src/ui/RecipeList.jsx
@app/src/ui/RecipeList.test.jsx
@app/src/styles/tokens.css
@app/src/styles/css-source.js
@app/src/domain/lineage.js
@app/src/domain/batch.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: The jar and the recipe palette — a Sprinkles Jar block in tokens.css</name>
  <files>app/src/styles/tokens.css</files>
  <read_first>
    - `.impeccable/surfaces/route.md` — § 1 (where this world applies), § 3 (Mark's binding steer:
      two palettes with two jobs), the direction contract's OWN-WORLD line, § 5 (open decisions).
    - `.impeccable/surfaces/route.sketch.html` — the `:root` block and the geometry in `.brand:after`,
      `.r .bar`, `.sp i`, `.lab`, `.cta`. Its hues are the starting point, not the decision.
    - `app/src/styles/tokens.css` — the whole file, for the commenting convention and the existing
      spacing, rule-weight and touch tokens this block must reuse rather than duplicate.
  </read_first>
  <action>
Append ONE new block at the end of the `:root` rule in `app/src/styles/tokens.css`, under a comment
header that names its source and its boundary: The Sprinkles Jar, `.impeccable/surfaces/route.md`,
outside the paper frames only. Say in that comment that the Formulation Cookbook tokens above stay
the three paper frames' own (the recipe spread, the batch log, the printed sheet) and that nothing
in this block moves any of them. Change no existing token.

Declare, all inside the existing `:root`, no at-rule of any kind (`cross-cutting.test.js` strips
comments and then asserts this file contains no at-rule — the word may appear in prose, the
construct may not):

1. The jar — six hues, fixed, each named for the sprinkle colour it is, not for a job:
   `--jar-pink`, `--jar-gold`, `--jar-teal`, `--jar-green`, `--jar-orange`, `--jar-violet`. These are
   the app's own marks: tallies, the active nav, the primary action, moments of delight. The
   sketch's own six are the starting point; adjust any that reads muddy or too close to its
   neighbour. Note in the comment that a jar hue never carries a verdict (D06).
2. The home ground and ink: `--home-ground` (the sketch's pure white — the paper frames' warmer
   `--ground` stays theirs), `--home-ink` (near-black), `--home-mute` for the meta line and the
   micro-labels, and `--home-rule` for the hairline between rows. `--home-mute` CARRIES TEXT, so it
   must meet WCAG AA (4.5:1) against `--home-ground`; the sketch's grey sits on the line — measure it
   and darken it if it falls short, and record the measured ratio in the comment. `--home-rule`
   carries no text and needs no ratio.
3. The recipe palette — an ordered set of at least twelve, `--recipe-hue-01` through `--recipe-hue-12`
   (more is fine; the count must match `RECIPE_HUE_COUNT` in Task 2). Identity only: these draw the
   row's identity bar and its version tally, never text, so no contrast floor applies — but each must
   read clearly against `--home-ground` and be distinguishable from its neighbours at a glance. Note
   in the comment that route.md § 5 leaves the palette's size and the assignment rule open, and that
   Task 2 ships the deterministic default.
4. The world's geometry and type, one token each, because every visual value in this project reads a
   custom property: the brand's size and the height of its sprinkle rule; the page title's size; the
   recipe name's size; the meta line's size; the micro-label's size and its letter-spacing; the
   sprinkle rod's width, height and radius; the identity bar's width, height and radius; the filled
   action's radius and its padding; the nav active underline's weight; the row rule's weight; and the
   one short transition duration the world is allowed. Reuse the existing `--gap-xs`/`--gap-s`/
   `--gap-m`/`--gap-l`/`--gap-xl` scale wherever the sketch's spacing already lands on it, and
   `--touch-min` for the narrow-width targets; add a spacing token only where the world needs a step
   the scale does not carry.

Do not reference `--pen-blue` here or define a second blue: the last words on a row read the
existing `--pen-blue`, because the Two-Ink rule still binds wherever plan and actual meet (route.md
§ 1).
  </action>
  <verify>
    <automated>npm --prefix app test</automated>
  </verify>
  <done>The new block exists in `:root`; no existing token changed; the file still opens no at-rule; every suite that passes at HEAD still passes.</done>
  <reversibility rating="costly">Token names become call sites across home.css and the JSX. Renaming later is a mechanical sweep of two files, not a structural change — cheap now, tedious later.</reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 2: A recipe's colour, dealt not stored</name>
  <files>app/src/ui/recipe-colour.js, app/src/ui/recipe-colour.test.js</files>
  <read_first>
    - `.impeccable/surfaces/route.md` § 3 (identity only; two recipes may not share a colour while
      both are on the shelf) and § 5 (how a colour is assigned and changed is an open decision).
    - `app/src/domain/lineage.js` — `sortedVersions`'s null-`createdAt` tie shape, which this helper
      mirrors rather than inventing its own.
  </read_first>
  <behavior>
    - Every version of one recipe resolves to the same hue token.
    - Two recipes never share a hue while the number of recipes is at or below `RECIPE_HUE_COUNT`.
    - The result does not depend on the order of the input array — shuffling the versions changes nothing.
    - Adding a recipe created later does not move an earlier recipe's hue.
    - A version with a null `createdAt` sorts last, the same way `sortedVersions` already puts it, and takes a hue without throwing.
    - An empty version list returns an empty map.
  </behavior>
  <action>
Create `app/src/ui/recipe-colour.js`: framework-free — no React import, no DOM access, no store
import — so it runs under Vitest's `node` environment (`app/vitest.config.js` sets that as the
default). It lives beside its only consumer in `ui/` rather than in `domain/` because a CSS custom
property name is a presentation fact, not recipe mathematics.

Export `RECIPE_HUE_COUNT` (matching the number of `--recipe-hue-NN` tokens Task 1 declared) and
`recipeHueByRecipeId(versions)`, which returns a `Map` from `recipeId` to a hue token NAME string,
e.g. `--recipe-hue-03` — never a colour value.

The rule: take each recipe's earliest `createdAt` across its own versions, order the recipes by that
date ascending with a null date last, break ties by comparing `recipeId` as a string so the result
can never depend on input order, and deal the nth recipe in that order hue `n % RECIPE_HUE_COUNT`.
An ordered deal is used instead of a hash of `recipeId` for one reason, which the comment must state:
route.md § 3 binds "two recipes may not share a colour while both are on the shelf", and a hash
collides where a deal does not. Because `createdAt` is never retaken (see `saveOverVersion` in
`domain/lineage.js`) and a new recipe's date is later than every stored one, the order is
append-only: an arriving recipe takes the next hue and moves nobody.

The comment must also record two things plainly: the colour is computed and stored NOWHERE — no
field on a recipe or a version, no migration, nothing to import or export — and route.md § 5 leaves
how a colour is assigned and changed open, so this is the deterministic default, not the settled
answer. Name the wrap: past `RECIPE_HUE_COUNT` recipes the deal repeats a hue, which is the point at
which that open decision has to be taken.

Write `app/src/ui/recipe-colour.test.js` first, covering the six behaviours above.
  </action>
  <verify>
    <automated>npm --prefix app test</automated>
  </verify>
  <done>`recipe-colour.test.js` covers all six behaviours and passes; the module imports nothing from React, the DOM or the store.</done>
  <reversibility rating="costly">The assignment rule is a default over an open decision (route.md § 5). Nothing persists it, so replacing it later changes only which colour a row draws — no data to migrate.</reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 3: The home surface — home.css, the rebuilt RecipeList, and the guards</name>
  <files>app/src/styles/home.css, app/src/styles/home.test.js, app/src/main.jsx, app/src/ui/RecipeList.jsx, app/src/ui/RecipeList.test.jsx, app/src/styles/app.css</files>
  <read_first>
    - `.impeccable/surfaces/route.md` — the FIRST VIEWPORT line and § 1 (the no-motion/no-shadow/
      no-radius binder does not cross the paper frame; the Two-Ink and No-Verdict rules do).
    - `.impeccable/surfaces/route.sketch.html` — the whole file including its CSS: composition,
      marks, hierarchy. The sketch is the visual reference; its hex values are not binding.
    - `app/src/ui/RecipeList.jsx` and `app/src/ui/RecipeList.test.jsx` — what ships today.
    - `app/src/styles/app.css` lines 365-420 — the rules this task orphans, and the `.list-page`
      rule and comment it must keep.
    - `app/src/styles/cross-cutting.test.js` lines 700-794 — the two `.list-page` assertions.
    - `app/src/styles/binder.test.js` lines 22-45 and 285-300 — which stylesheets the contract
      suites actually read, and the raw-source hex assertion on app.css.
    - `app/src/styles/history.css` lines 1-40 and `app/src/main.jsx` — the pattern a second
      stylesheet already follows.
    - `app/src/domain/batch.js` — `createBatch`'s returned shape and `sortedBatches`.
    - `.claude/skills/sketch-findings-sprinkles/SKILL.md` — the responsive ladder that still applies
      outside the paper frames: below 760px targets grow toward `--touch-min`, and 393px must not overflow.
  </read_first>
  <behavior>
    Write these into `app/src/ui/RecipeList.test.jsx` before the rebuild, alongside the five
    assertions already there, all five of which must keep passing untouched:
    - Each row carries its recipe's hue token, and two versions of one recipe produce the same hue on the one row rendered for them.
    - Two recipes produce two different hues.
    - The version tally draws as many marks as that recipe has versions.
    - The batch tally draws as many marks as there are batches across that recipe's versions, and none of another recipe's.
    - A recipe with no batch reads "not yet made" and draws no batch mark.
    - The newest batch's own words render on the row, chosen by churn date, and render as escaped text: a batch whose words contain angle brackets appears escaped in the markup and opens no element.
    - `RecipeRows` renders without a `batches` prop (the default) and does not throw.
  </behavior>
  <action>
Four files change and two are created. Every changed line must trace to this surface; the recipe
spread, batch log and print surfaces are not touched.

**`app/src/ui/RecipeList.jsx` — rebuilt.** Keep the outer element exactly `<div className="list-page">`,
once, and render the Jar world in a child under a single root class `home`. Two live assertions
depend on this and neither tolerates a second class on that element:
`cross-cutting.test.js` greps this file for the literal `className="list-page"` and requires exactly
one match, and it pins app.css's `.list-page` rule to `padding: var(--gap-page)` as the page's one
inline gutter.

Inside, in the order route.md's FIRST VIEWPORT gives:
- A header: the brand word at top left with its sprinkle rule beneath it, and the nav at the right
  holding ONE item, "Recipes", marked as the active one and underlined in a jar colour. Invent no
  destination: `router.jsx` routes only `/`, `/recipe/:id` and `/recipe/:id/batch/:batchId`, so the
  sketch's "Line of work" and "Bring in a recipe" nav items have nowhere to go and are not drawn.
- The page title, then one line of guidance. Plain words, sentence case, short, no articles where a
  label reads fine without one, and no book vocabulary on screen.
- The rows, via `RecipeRows`.
- The actions below the list: Import as the one filled action the contract calls for — bringing a
  recipe in IS the import this page already performs — with Export beside it as a quiet text action.
  Keep both existing handlers, the hidden file input, its `tabIndex`/`aria-hidden` pair, and the
  import-errors list byte-for-byte in behaviour; only their classes and position move. The errors
  still render as text in a list.

`RecipeList` loads versions and batches in one effect — `Promise.all([repository.listVersions(),
repository.getAllBatches()])` — keeping the existing cancelled-flag guard, and refreshes both after a
successful import.

`RecipeRows({ versions, batches = [] })` stays the presentational export. The `batches` default is
what keeps the existing tests, which pass `versions` alone, passing. For each recipe from
`latestVersionPerRecipe(versions)`:
- `ordered = sortedVersions(versionsForRecipe(versions, version.recipeId))` — used for both the
  version tally's count and the version line.
- The version line reads `versionIdentity(ordered, version)`, the one version identity wherever a
  version is named, followed by the computed mass from `computeBalance(activeRows(version))`, which
  is what the existing removed-row mass assertion measures. Keep the "no ingredient rows" wording
  for a version that computes no balance.
- The hue comes from Task 2's `recipeHueByRecipeId(versions)`, computed once for the whole list, and
  reaches CSS as a custom property on the row — the sketch's own `--c` pattern. The JSX carries no
  colour literal: the inline style's value is a `var(--recipe-hue-NN)` reference and nothing else.
- Batch figures: a batch's version is `batch.versionId` (top level), but its date and the maker's
  own words are NESTED — `batch.churn.churnDate` and `batch.churn.atTheMachine`. The recipe's
  batches are those whose `versionId` is the id of any version in `ordered`; the newest is the first
  of `sortedBatches` from `app/src/domain/batch.js`, which is the one ordering this app has — do not
  write a second. Its words render in `var(--pen-blue)` as a text child. With no batch, the batch
  cell reads "not yet made" in the muted colour and draws no mark. A batch carrying no words of its
  own leaves the words cell empty rather than inventing a sentence.
- A tally is a row of sprinkle marks: the version tally in the recipe's own hue, the batch tally in
  jar gold. A count told only in marks is invisible to a screen reader and colour must never be the
  sole carrier, so give each tally an accessible text count alongside it. route.md § 5 leaves how a
  tally reads past a dozen open, so let the marks wrap and note the open decision in a comment
  rather than settling it here.
- The `<li>` stays attribute-free. `RecipeList.test.jsx` counts rows with `markup.match(/<li>/g)`;
  an attribute on that element breaks two passing assertions. Put the list class on the `<ul>` and
  the row class on the inner `<Link>`.

Notes and prose render as text everywhere; nothing under `app/src` uses `dangerouslySetInnerHTML`
and this task adds no exception.

**`app/src/styles/home.css` — new.** Every selector is scoped under `.home`, which is what lets this
world override the global link underline and the `button, select` binder for the home page alone
while the paper frames keep both. It may use a border radius, a fill and one short transition —
route.md § 1 records Mark's decision that the no-motion/no-shadow/no-radius binder does not cross the
paper frame — and each of those reads a token from Task 1. No hex and no bare px anywhere: every
colour, face, size, spacing and rule weight reads a custom property from tokens.css. Declare no
inline padding on `.home`: the page gutter is `.list-page`'s, already pinned by a test, and a second
one would double it. If a breakpoint is needed, a single top-level `@media` block and nothing
deeper — `css-source.js` parses exactly one level of nesting and throws on anything else. Below
760px the interactive targets grow toward `--touch-min` and the row grid steps down so nothing
overflows at 393px.

**`app/src/main.jsx`** imports `./styles/home.css` after `./styles/history.css`, the position
history.css already established.

**`app/src/styles/app.css`** loses the seven rules this rebuild orphans — `.recipe-list`,
`.recipe-list li + li`, `.recipe-list a`, `.recipe-list__name`, `.recipe-list__transfer`,
`.recipe-list__file-input` and `.recipe-list__import-errors` — and keeps `.list-page` and its rule
untouched. Correct that rule's comment: its closing sentence describes an import-errors list that no
longer lives in this stylesheet. Any comment written into app.css must not place a colour literal
after a colon; binder.test.js's no-hex assertion reads this file's raw text, comments included.
Remove nothing else — pre-existing dead code elsewhere in the file is not this task's to touch.

**`app/src/styles/home.test.js` — new.** The token discipline on home.css has no enforcement
otherwise: binder.test.js and cross-cutting.test.js read app.css, history.css and tokens.css and
never this file. Read home.css through `css-source.js`'s `readAllRules` (which runs `assertNoAtRules`
for you) and assert: no declaration contains a hex colour; no declaration contains a bare px value;
every rule's selector is scoped under the home root class; the file's `@media` conditions, if any,
are exactly the ones listed by name in the test; and `main.jsx` imports home.css after app.css.
  </action>
  <verify>
    <automated>npm --prefix app test</automated>
    <automated>npm --prefix app run build</automated>
    <human-check>Load http://localhost:5173/ beside `.impeccable/surfaces/route.sketch.html` open in a second tab and compare composition, marks and hierarchy — brand and sprinkle rule, the active nav mark, the identity bar, both tallies, the last words, the filled action. Then check 393px and a coarse pointer: nothing overflows and the targets are reachable.</human-check>
  </verify>
  <done>`/` renders The Sprinkles Jar; Export, Import and the import errors behave as they do at HEAD; every assertion passing at HEAD still passes; the new assertions in `RecipeList.test.jsx` and `home.test.js` pass; the build succeeds.</done>
  <reversibility rating="reversible">A new stylesheet, one rebuilt component and the removal of rules nothing renders. Revertible in one commit.</reversibility>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| stored record → home row | Recipe names, version lines and a batch's own words are free text the maker typed; they now render in a new place. |
| imported JSON → store → home row | `importStore` accepts a file the maker chose. Its validation is unchanged by this task, but its output now reaches new fields on this page. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260918-gha-01 | Tampering | `RecipeRows` — the batch words, recipe name and version line | medium | mitigate | Render every one as a React text child. No `dangerouslySetInnerHTML` is added; Task 3's behaviour block asserts that words containing angle brackets appear escaped and open no element. |
| T-260918-gha-02 | Tampering | `recipeHueByRecipeId` and the row's inline custom property | low | mitigate | The inline style's value is a fixed `var(--recipe-hue-NN)` reference built from an integer index, never a string taken from a record, so no stored value reaches the CSS. |
| T-260918-gha-03 | Denial of Service | `RecipeRows` reading an imported record | low | mitigate | Read `batch.churn` and a version's rows null-safely so a malformed imported record renders an incomplete row instead of throwing the page away; the import-errors path is unchanged. |
| T-260918-gha-04 | Information disclosure | the whole surface | low | accept | Local-only app: no network call, no external model call, no telemetry is added (TRUST-01, IMP-01). |
| T-260918-gha-SC | Tampering | npm/pip/cargo installs | n/a | accept | No package-manager install in this task — no dependency is added, removed or upgraded, so the legitimacy gate does not fire. |
</threat_model>

<source_coverage_audit>
| Source | Item | Covered by |
|--------|------|-----------|
| GOAL | Home page built in The Sprinkles Jar world per route.md, sketch as visual reference | Tasks 1-3 |
| GOAL | Scope limited to RecipeList.jsx, its styles, and new tokens | Task 3 (app.css loses only rules this rebuild orphans; no other surface touched) |
| CONTRACT route.md § 3 | The jar — a small fixed set of named sprinkle hues | Task 1 (1) |
| CONTRACT route.md § 3 | The recipe palette — larger, identity only, no two recipes share while both on the shelf | Task 1 (3), Task 2 |
| CONTRACT route.md § 3 / D06 | Neither palette carries a verdict | Task 1 comment, Task 3 (tally carries a text count; words state standing) |
| CONTRACT route.md § 1 | Two-Ink rule still binds outside the frames | Task 3 (last words read `--pen-blue`) |
| CONTRACT route.md § 1 | The no-motion/no-shadow/no-radius binder does not cross the frame | Task 3 (home.css may carry radius, fill, one transition) |
| CONTRACT FIRST VIEWPORT | Brand + sprinkle rule; nav right, active underlined in a jar colour | Task 3 |
| CONTRACT FIRST VIEWPORT | Page title, one line of guidance | Task 3 |
| CONTRACT FIRST VIEWPORT | Rows: identity bar, name, version line, version tally, batch tally in gold, last verdict in pen blue | Task 3 |
| CONTRACT FIRST VIEWPORT | One filled action below the list | Task 3 (Import takes that slot; Export stays a text action) |
| CONTRACT § 5 | Open: exact hues, palette size, assignment rule | Task 1 + Task 2 (deterministic default, named as such in comments) |
| CONTRACT § 5 | Open: how a tally reads past a dozen | Task 3 (marks wrap; the open decision is recorded, not settled) |
| ORCHESTRATOR fact 1 | Styles live in a new home.css; app.css orphans removed; `.list-page` comment kept accurate | Task 3 |
| ORCHESTRATOR fact 2 | Jar palette, home ground/ink, 12+ recipe hues, AA for any hue carrying text | Task 1 |
| ORCHESTRATOR fact 3 | Identity colour computed, not stored; no migration | Task 2 |
| ORCHESTRATOR fact 4 | Data available: latest version per recipe, version count, batch count, last words, "not yet made" | Task 3 |
| ORCHESTRATOR fact 5 | No invented nav destinations; Export/Import keep working; errors render as text | Task 3 |
| ORCHESTRATOR fact 6 | `RecipeRows` stays presentational; `batches` prop defaulted; new assertions; optional home.css contract check | Task 3 (the home.css check is taken, not skipped — nothing else enforces the token rule there) |
| ORCHESTRATOR fact 7 | Plain words, sentence case, short labels | Task 3 |
| ORCHESTRATOR fact 8 | `npm --prefix app test` and `npm --prefix app run build` pass; browser check if available | Every task's `<verify>` |
| SKILL sketch-findings-sprinkles | The responsive ladder outside the paper frames: 44px targets below 760px, no overflow at 393px | Task 3 (home.css narrow-width block; human-check) |

No item is MISSING. Excluded as out of scope, not as a gap: the shell that frames every route
(route.md § 4 — home is the first surface and this task's scope is RecipeList.jsx, so the header is
built here rather than lifted into `router.jsx`); the batch log's highlighter and the book's running
head colour (route.md § 5, both scoped to surfaces this task does not touch).
</source_coverage_audit>

<verification>
- `npm --prefix app test` passes: every suite green, including `binder.test.js`, `cross-cutting.test.js`
  and `columns.test.js` unchanged, and the five original `RecipeList.test.jsx` assertions unchanged.
- `npm --prefix app run build` passes.
- `.impeccable/surfaces/route.md` and `route.sketch.html` are unmodified — they are the authority, not an output.
- `git diff --stat` touches only the nine files in `files_modified`.
</verification>

<success_criteria>
- `/` renders The Sprinkles Jar: brand and sprinkle rule, an active nav mark, title and guidance, one
  row per recipe with identity bar, name, version line, version tally, gold batch tally and the last
  words in pen blue, and one filled action below the list.
- Each recipe has one colour, the same on every one of its versions, computed and stored nowhere.
- "not yet made" appears for a recipe with no batch; a batch's words appear as text.
- Export, Import and the import-errors list behave exactly as they do at HEAD.
- home.css carries no hex and no bare px, and `home.test.js` fails if either returns.
- The paper frames' contract suites are untouched and green.
</success_criteria>

<output>
Create `.planning/quick/260918-gha-build-the-home-page-route-in-the-sprinkl/260918-gha-SUMMARY.md` when done
</output>
