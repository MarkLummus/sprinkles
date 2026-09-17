---
quick_id: 260917-gjo
slug: one-shared-page-gutter-for-the-running-h
date: 2026-09-17
mode: quick
authority:
  - .planning/quick/260917-gjo-one-shared-page-gutter-for-the-running-h/260917-gjo-CONTEXT.md — Mark's direction, locked in session on 2026-09-17. The page's own 20px phone gutter wins; the running head is NOT widened back to 48px. The shared-value shape is the stated preference, and this plan takes it (see § 2 for why, and for the one thing CONTEXT.md got wrong).
  - .planning/quick/260917-ewf-…/260917-ewf-SUMMARY.md § "(e) The sub-600px divergence, observed and deliberately not fixed" — the finding this task closes. Its measurements are good and are NOT re-derived here; they are re-verified by grep and extended (§ 1).
  - DESIGN.md § the responsive ladder, `max-width: 600px` — "the page padding shrinks to 20px". The documented step, in the singular, naming the page. It never mentioned the running head; that omission IS the defect. DESIGN.md is Impeccable's file and is NOT edited by this task.
  - CLAUDE.md § 3 (Surgical Changes) — every changed line traces to the gutter. Nothing adjacent is improved, reflowed or reindented. Two comments and two assertions are rewritten because THIS change made them false; that is orphan cleanup, not adjacent refactoring. § 2 (Simplicity First) — one new property, no wrapper element, no second media block.
  - .claude/CLAUDE.md conventions — every visual value reads a custom property defined in tokens.css; the domain and the repository seam are untouched; agent prose and commit messages in English.
files_modified:
  - app/src/styles/tokens.css
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
autonomous: true
must_haves:
  truths:
    - "The page gutter has ONE name, `--gap-page`, defined once in `tokens.css` as `var(--gap-xl)`, and stepped down to `var(--gap-m)` exactly once — on `:root` inside app.css's ALREADY EXISTING `@media (max-width: 600px)` block. No second media block anywhere, in either file."
    - "FOUR consumers read it, not three (§ 1 — established by exhaustive grep, and CONTEXT.md's table is one short): `.recipe-page`, `.running-head`, `.page-status` (both its inline inset AND its max-width arm) and `.not-found`. All four left edges agree at every width."
    - "`.recipe-page`'s own override inside the 600px block is GONE. The page's phone gutter now arrives through the shared property, so the breakpoint is stated once instead of twice."
    - "app.css declares `var(--gap-xl)` nowhere after this task — the token survives in tokens.css as `--gap-page`'s desktop arm and as the scale step every other rule still reads."
    - "Neither media register changes. `binder.test.js` is NOT in this diff, and `cross-cutting.test.js`'s seven-condition register is untouched: no @media block is added, removed or re-conditioned. CONTEXT.md § Verification 2 warned both might need updating; measured, they do not, and saying so is part of the result."
    - "`tokens.css` still opens no at-rule. The step-down is NOT declared there, for a measured reason (§ 2): `css-source.js`'s `readCustomProperties` flattens that file into one map with no notion of a media condition, so a second declaration would make every suite silently resolve the phone value."
    - "A future edit cannot move one of the four without the others: one test asserts all four read `var(--gap-page)` as a single contract, and one asserts no media-scoped rule re-states an inline gutter for any of them."
    - "`npm --prefix app test` green. Baseline measured at planning time: **977 tests across 34 files** (260917-ewf's own measured end state; the only commit since, `0c93daa`, touched `.impeccable/`, `.planning/` and nothing under `app/`). Report the real end number; never adjust an assertion to reach one."
    - "One commit. The property, its four consumers, the removed override and the contract updates are one indivisible change — split across commits, the suite is red in between."
  artifacts:
    - "app/src/styles/tokens.css: `--gap-page: var(--gap-xl);` added to the spacing block (after `--gap-xl`, ~line 51), with a comment recording what shares it, where the step-down lives and why it is not here."
    - "app/src/styles/app.css: five declarations swapped to `var(--gap-page)` (291, 292, 349, 360, 417); `:root { --gap-page: var(--gap-m); }` as the first rule inside the 600px block (2511); the `.recipe-page` rule at 2512-2514 deleted; the `.page-status` comment (265-286) and the 1099.98px prelude comment (~2346) amended where this change made them false."
    - "app/src/styles/cross-cutting.test.js: the 600px `.recipe-page` padding test (201-210) rewritten to the new mechanism; the shared-left-edge test (610-613) widened to all four consumers; the `.page-status` max-width assertion (618) tracking the new arm; new assertions for the property's definition, its resolution, tokens.css's at-rule-free state, and the no-media-override guard."
  key_links:
    - "THE SET IS FOUR, NOT THREE. `grep -nE \"^[[:space:]]+[a-z-]+:[^;]*var\\(--gap-xl\\)\" app/src/styles/app.css` returns exactly five declaration lines — 291 `.page-status` `inset-inline-start`, 292 `.page-status`'s `max-width` viewport arm, 349 `.running-head` `padding: var(--gap-m) var(--gap-xl) 0`, 360 `.not-found` `padding: var(--gap-m) var(--gap-xl)`, 417 `.recipe-page` `padding: var(--gap-xl)` — plus one comment line (270) that quotes a declaration and is rewritten anyway. `.not-found` is the fourth box CONTEXT.md's table misses: DESIGN.md § the recipe list says \"a 'no recipe found' page carries the running head above it and a second link back to the list\", so it IS the page body in that route state, at the page gutter, wrong below 600px in exactly the same way. Changing three of four would be worse than changing none (CONTEXT.md's own instruction), so it is in."
    - "NOT a fifth: `padding-left: var(--gap-m)` at 403 (`.recipe-list__import-errors`) and 1296 are bullet indents, not page gutters. The recipe LIST route has no page gutter at all — `.recipe-list` and `.recipe-list__transfer` carry no inline padding, so the list sits flush at 0 (`RecipeList.jsx` returns `.recipe-list__transfer` and `.recipe-list` with no page wrapper). There is nothing there to bring into step; it is a separate pre-existing question and is recorded, not touched."
    - "WHY `:root` IN app.css AND NOT IN tokens.css — the decision CONTEXT.md asked not to be slipped past the reader. tokens.css declares no at-rule today (`grep -nE \"^[[:space:]]*@media\" app/src/styles/tokens.css` exits 1; its only two `@media` mentions, lines 269 and 278, are prose). Its own comment at 278 states the convention outright: \"The breakpoint literals themselves (759.98px, 600px) stay in app.css's own @media preludes, the one sanctioned exception the touch block above already established.\" And there is a MEASURED hazard, not just a convention: `css-source.js`'s `readCustomProperties` regex-scans the whole file into a flat `{name: value}` map with no notion of a media condition, last declaration winning — so a `@media` arm in tokens.css would make `resolveTokenPx(tokens, '--gap-page')` return 20 for every suite that ever reads it, a silently wrong desktop answer. Both suites call `readCustomProperties(tokensSource)` and `readAllRules(appCssSource)` — never the other way round, so the property's home in app.css poisons nothing. Definition of the name in tokens.css, breakpoint in app.css: each file keeps the job it already has."
    - "WHY A SHARED PROPERTY AND NOT THE PROJECT'S OTHER PATTERN. The touch ladder's shape (tokens.css names `--stop-h` AND `--touch-min`; app.css's media block switches which token a declaration reads) does not fit here, because the four consumers reach the gutter through four DIFFERENT properties — a one-value `padding` shorthand, a three-value `padding` shorthand, an `inset-inline-start`, and one arm of a `calc()` inside `min()`. Token-swapping would need four media-scoped rules, which is the shape CONTEXT.md forbids. A shared property is the only shape that states the breakpoint once. (A padded shell wrapper in `router.jsx` would also do it structurally, and is rejected: it moves `.page-status`'s containing block, changes `.recipe-page`'s own grid padding semantics, and touches the routed shell CONTEXT.md bounds out.)"
    - "CASCADE, and why it holds: `main.jsx` imports `./styles/tokens.css` (line 3) BEFORE `./styles/app.css` (line 4). Both declarations are on `:root` at equal specificity, and a media query adds none, so source order decides and app.css's arm wins below 600px. That is the single fact the mechanism rests on, so it gets an assertion of its own rather than trust — this project's own habit. The alternative (declaring on `body`, where nearest-ancestor inheritance makes order irrelevant) was considered and rejected as the less recognisable idiom for the same result."
    - "THE FOUR ASSERTIONS THAT GO RED ON THE SWAP, all in cross-cutting.test.js, all rewritten to the new mechanism rather than loosened: 201-210 (`.recipe-page carries its own reduced padding in the 600px block` — that rule is being deleted, so the test must assert what replaced it); 611 (`.page-status` `inset-inline-start: var(--gap-xl)`); 612 (`.running-head` `padding: var(--gap-m) var(--gap-xl) 0`); 618 (`.page-status` `max-width: min(var(--measure-prose), calc(100vw - var(--gap-xl) - var(--gap-m)))`). Each states a mechanism that this change moves; tracking a moved mechanism is not bending an assertion to hit a number."
    - "REGISTERS UNAFFECTED, measured: `binder.test.js:295` asserts `stripped.match(/@media\\b/g)` has length 7 and that every media condition is in a seven-entry `allowedMedia`; `cross-cutting.test.js:240` asserts the sorted condition set equals the same seven. This task adds a RULE inside an existing block, never a block — the count stays 7 and the conditions are unchanged, so `binder.test.js` stays out of the diff. Its bare-px gate (289) is also immune: `--gap-page: var(--gap-m)` carries no literal. Only the 1099.98px block has a \"carries exactly these selectors, in order\" test (`cross-cutting.test.js` ~257); the 600px block has none, so adding `:root` to it and removing `.recipe-page` from it breaks no enumeration."
    - "`readAllRules` parses the new rule correctly: `:root` inside a top-level `@media` is a flat selector/declarations pair tagged `media: '(max-width: 600px)'` — no parser change is needed or wanted (`assertNoAtRules` already permits a top-level `@media`, and no new at-rule keyword appears)."
    - "COMMENT-TEXT TRAP, inverted: the verify gate greps for a DECLARATION reading `--gap-xl` in app.css, anchored as `^[[:space:]]+[a-z-]+:`. Comment line 270 currently matches it (it quotes `inset-inline-start: var(--gap-xl)` in prose) — so the rewritten comments must name the token in PROSE, never as a quoted `property: var(--gap-xl)` pair, or the gate reds on its own commentary. Unlike the usual trap this direction fails loudly rather than passing falsely, but it is still a red to avoid."
    - "OBSERVE, DO NOT FIX: tokens.css's ingredient-column arithmetic (~172-178) and `columns.test.js`'s copy of it (43-44) both name \"--gap-xl (48px) padding on both sides\" as `.recipe-page`'s page padding. The arithmetic stays correct — `--gap-page` IS `--gap-xl` at the widths it is stated for (1280px, 1024px) — but a reader grepping `--gap-xl` for the page padding will no longer land on the rule. One clause in `--gap-page`'s own comment names that relationship; `columns.test.js` is NOT edited (it is outside this task's file set and its arithmetic is unchanged). Record it."
    - "OBSERVE, DO NOT FIX: DESIGN.md's responsive ladder says the 600px step shrinks \"the page padding\" — true before and after, and now true of the head and the notice as well. DESIGN.md is Impeccable's file; no file under `.impeccable/` and not DESIGN.md is touched. Name it in the SUMMARY."
---

# One shared page gutter for the running head, the notice and the page shell

The divergence 260917-ewf found and deliberately left: below 600px the page shell steps its gutter in
to 20px and the running head and the save notice do not, so on a phone they hang 28px right of the
content they head and overlay. Mark ruled in session that the page's own gutter wins — the head is not
widened back to 48px — and that it is resolved as ONE shared value rather than a second override per
element, because three restatements of one breakpoint is how these drifted apart in the first place.

One task, one commit: it is a single indivisible change. Splitting the property from its consumers, or
the consumers from the contract that pins them together, leaves the suite red in between.

## Discovered at planning — read this before editing

Every line number below was read live on 2026-09-17 against the current files, and every claim marked
MEASURED was executed, not reasoned. They guide; they do not authorize (#3786). Re-grep and take your
scope from what you find.

### 1. The set is FOUR, not three — CONTEXT.md's table is one box short

CONTEXT.md asked for exactly this check before concluding, and it changes the answer. One grep for
every declaration in app.css that reads the gutter token:

```
grep -nE "^[[:space:]]+[a-z-]+:[^;]*var\(--gap-xl\)" app/src/styles/app.css
```

| Line | Box | Declaration | Below 600px today |
|---|---|---|---|
| 291 | `.page-status` | `inset-inline-start: var(--gap-xl)` | unchanged, 48px — **wrong** |
| 292 | `.page-status` | `max-width: min(…, calc(100vw - var(--gap-xl) - var(--gap-m)))` | the box's own left inset, so **also wrong** |
| 349 | `.running-head` | `padding: var(--gap-m) var(--gap-xl) 0` — its only rule anywhere | unchanged, 48px — **wrong** |
| 360 | `.not-found` | `padding: var(--gap-m) var(--gap-xl)` | unchanged, 48px — **wrong, and not in CONTEXT.md** |
| 417 | `.recipe-page` | `padding: var(--gap-xl)` | `padding: var(--gap-m)` at 2512-2514 — 20px, the deliberate step |

`.not-found` is the fourth box. DESIGN.md's recipe-list section says "a 'no recipe found' page carries
the running head above it and a second link back to the list" — so `.not-found` IS the page body in
that route state (`RecipePage.jsx:836`), sitting at the page gutter directly under the head, with the
identical inline value and the identical defect. CONTEXT.md's own instruction settles it: changing
three of four would be worse than changing none. It is in.

**Not a fifth.** `padding-left: var(--gap-m)` at 403 (`.recipe-list__import-errors`) and 1296 are
bullet indents. The recipe LIST route has no page gutter at all — `RecipeList.jsx` returns
`.recipe-list__transfer` and `.recipe-list`, neither carrying inline padding, so the list sits flush at
0 and there is nothing there to bring into step. Separate pre-existing question; record it, leave it.

### 2. Where the property is declared, and why — the decision CONTEXT.md said not to slip past

`--gap-page` is **defined in tokens.css** (the name lives where every name lives) and **stepped down on
`:root` inside app.css's already-existing `@media (max-width: 600px)` block** (the breakpoint lives
where every breakpoint lives). Not the other way round, for two reasons:

1. **The project says so, in tokens.css's own words.** Its comment at 278 reads: "The breakpoint
   literals themselves (759.98px, 600px) stay in app.css's own @media preludes, the one sanctioned
   exception the touch block above already established." tokens.css opens no at-rule today —
   `grep -nE "^[[:space:]]*@media" app/src/styles/tokens.css` exits 1; both of its `@media` mentions
   (269, 278) are prose about app.css.
2. **MEASURED: a media arm in tokens.css would silently poison the token map.**
   `css-source.js`'s `readCustomProperties` regex-scans a whole file into a flat `{name: value}` map,
   last declaration winning, with no notion of a media condition. A second `--gap-page` declaration in
   tokens.css would make `resolveTokenPx(tokens, '--gap-page')` answer 20 — the phone value — for every
   suite that ever reads the desktop gutter. Confirmed safe in the chosen direction: both suites call
   `readCustomProperties(tokensSource)` and `readAllRules(appCssSource)`, never the reverse
   (`binder.test.js:35-36`, `cross-cutting.test.js:38-39`), so a custom property declared in app.css
   is invisible to the token map and every suite still resolves `--gap-page` to 48, by design.

So it is the FIRST custom property app.css declares (`grep -nE "^[[:space:]]+--[a-z-]+:" app/src/styles/app.css`
returns nothing today), and that is stated plainly rather than slipped past. It does not breach the
convention app.css's own header states — "Every colour, face, size, spacing value, and rule weight
reads through a custom property defined in tokens.css — none is a literal here": `--gap-page` IS
defined in tokens.css, both its arms read tokens, and no literal enters app.css. What app.css gains is
one breakpoint-scoped re-declaration, which is the one thing it was already the right file for.

**Why a shared property rather than the project's other pattern.** The touch ladder's shape — tokens.css
names both `--stop-h` and `--touch-min`, and app.css's media block switches which token a declaration
reads — cannot do this job, because the four consumers reach the gutter through four *different*
properties: a one-value `padding` shorthand, a three-value `padding` shorthand, an `inset-inline-start`,
and one arm of a `calc()` inside `min()`. Switching tokens would take four media-scoped rules, which is
exactly the shape CONTEXT.md forbids. A padded shell wrapper in `router.jsx` would also unify the edge
structurally, and is rejected: it moves `.page-status`'s containing block, changes `.recipe-page`'s own
grid padding semantics, and touches the routed shell CONTEXT.md bounds out.

**Cascade, MEASURED:** `main.jsx` imports `./styles/tokens.css` at line 3 and `./styles/app.css` at
line 4. Both declarations sit on `:root` at equal specificity and a media query adds none, so source
order decides and app.css's arm wins below 600px. That is the one fact the mechanism rests on, so step
9 pins it with an assertion instead of trusting it. (Declaring on `body` instead would make order
irrelevant by nearest-ancestor inheritance — considered, rejected as the less recognisable idiom for
the same result.)

### 3. Both media registers are UNAFFECTED — measured, and worth saying

CONTEXT.md § Verification 2 warned that `binder.test.js` (~295: `@media` count 7 plus a seven-entry
`allowedMedia`) and `cross-cutting.test.js` (~240: the sorted set of seven conditions) must be updated
together if the at-rule shape changes. It does not change. This task adds a *rule inside an existing
block* and removes another from the same block: the count stays 7, the conditions are identical, and
`binder.test.js` stays out of the diff entirely. Its bare-px gate (289) is immune too —
`--gap-page: var(--gap-m)` carries no literal. And only the 1099.98px block has a "carries exactly
these selectors, in order" enumeration (~257); the 600px block has none, so adding `:root` to it and
removing `.recipe-page` from it breaks no list.

### 4. The four assertions that go red, and why updating them is not bending them

| File | ~Line | What it pins | Why it moves |
|---|---|---|---|
| cross-cutting.test.js | 201-210 | `.recipe-page` has its own reduced padding in the 600px block | that rule is deleted; the step now arrives through the shared property, so the test must assert what replaced it |
| cross-cutting.test.js | 611 | `.page-status` reads `inset-inline-start: var(--gap-xl)` | now `var(--gap-page)` |
| cross-cutting.test.js | 612 | `.running-head` reads `padding: var(--gap-m) var(--gap-xl) 0` | now `var(--gap-page)` in the inline slot |
| cross-cutting.test.js | 618 | `.page-status`'s `max-width` arm `calc(100vw - var(--gap-xl) - var(--gap-m))` | its first term is the box's own left inset, now `var(--gap-page)` |

Each states a mechanism this change moves. Tracking a moved mechanism is not adjusting an assertion to
hit a number — and every one of them gets *stronger*, because after this task all four consumers are
asserted as one contract rather than two.

---

## Task 1 — one page gutter, named once, stepped once

Commit 1, the only commit. `binder.test.js`, `columns.test.js`, every `.jsx` file, `DESIGN.md` and
everything under `.impeccable/` are out of this diff.

**Files:** `app/src/styles/tokens.css`, `app/src/styles/app.css`,
`app/src/styles/cross-cutting.test.js`

**Behavior** (write steps 6-9's assertions before the CSS if you prefer red-first; several are red
against the current tree either way):

- `tokens.css` defines `--gap-page` exactly once, as `var(--gap-xl)`, and still opens no at-rule.
- `resolveTokenPx` over tokens.css answers 48 for `--gap-page` — the desktop gutter, unambiguously.
- A `:root` rule scoped to `(max-width: 600px)` in app.css declares `--gap-page: var(--gap-m)`.
- All four consumers read `var(--gap-page)` — asserted as ONE contract in ONE test, so none can drift
  alone: `.recipe-page`'s `padding`, `.running-head`'s inline padding slot, `.not-found`'s inline
  padding slot, and `.page-status`'s `inset-inline-start` plus the first term of its `max-width` arm.
- No rule inside ANY media block re-states an inline gutter for those four — the step is declared once.
- No app.css rule reads `var(--gap-xl)` any more.
- `main.jsx` imports `tokens.css` before `app.css`, so the step-down can win.
- app.css still carries exactly seven top-level `@media` blocks at the same seven conditions.

**Action:**

1. In `tokens.css`, add `--gap-page` to the spacing block, immediately after `--gap-xl` (~51), reading
   `var(--gap-xl)`. The name follows the file's own family for semantic spacing —
   `--gap-select-chevron-room`, `--gap-field-unit`, `--gap-defect-col` — and DESIGN.md's spacing scale
   already calls `--gap-xl` "the page margin", so `--gap-page` names the thing the scale step was
   always being spent on. One level of `var()` indirection, which is exactly what `resolveTokenPx`
   follows, so the token stays resolvable by the contract suites. Comment it as the page shell's one inline edge: name the four boxes that share it
   (the page, the running head above it, the "no recipe found" page in the same position, and the
   notice that anchors to the head); say the step to `--gap-m` below 600px is declared once on `:root`
   inside app.css's existing 600px block, and give both reasons from § 2 — the file's own convention
   that breakpoint literals stay in app.css's preludes, and the concrete one, that
   `readCustomProperties` flattens this file into one map with no notion of a media condition so a
   second declaration here would make every suite resolve the phone value. Add the clause from
   § key_links: the ingredient-column arithmetic above still holds, because `--gap-page` is `--gap-xl`
   at the widths that arithmetic is stated for.
2. In `app.css`, swap the five declarations to read `var(--gap-page)` and change nothing else about
   them: `.page-status`'s `inset-inline-start` (291); the first subtracted term of `.page-status`'s
   `max-width` viewport arm (292) — the `min()` wrapper, the `--measure-prose` arm and the trailing
   `- var(--gap-m)` breathing room all stay character for character; `.running-head`'s inline padding
   slot (349), its `--gap-m` block-start and its `0` block-end unchanged; `.not-found`'s inline padding
   slot (360), its `--gap-m` block values unchanged; and `.recipe-page`'s one-value `padding` (417).
3. In `app.css`'s `@media (max-width: 600px)` block (2511), add a `:root` rule as the block's FIRST
   rule, declaring `--gap-page: var(--gap-m)`. Comment it as the one place the page's phone gutter is
   stated: that four boxes step together because they read one name, that the literal 600 stays here in
   app.css's own prelude where the touch block already put it, and that it is deliberately not in
   tokens.css. No other declaration in this rule. Write the token's name in prose in that comment, not
   as a quoted `--gap-page: …` pair at the start of a line, or step 10's fourth gate prints two lines
   instead of the one declaration it is counting.
4. In the same block, DELETE the `.recipe-page` rule at 2512-2514. It becomes an exact duplicate of
   what the shared property now delivers, and leaving it would restate the breakpoint twice — the
   failure mode this whole task exists to remove. This is an orphan THIS change created, which
   CLAUDE.md § 3 requires cleaning up.
5. Amend the two comments this change made false, and only the false clauses:
   - `.page-status`'s comment block (265-286). Its clause saying the edge "only agrees with
     `.recipe-page` above 600px" and that the mismatch "is a pre-existing mismatch and is not resolved
     here" is now wrong: it agrees at every width, and the mismatch is resolved. Rewrite that clause to
     record the shared property instead. Keep the rest — the out-of-flow reasoning, the two anchors,
     the corrected viewport arm, the measured 1px collision behind `margin-block-start` — intact, with
     `--gap-xl` updated to `--gap-page` where it names the left edge. **Name tokens in prose, never as
     a quoted `property: var(--gap-xl)` pair** (line 270 does that today, which is why the verify gate
     currently hits a comment); a quoted declaration would red step 10's second gate on its own text.
   - The 1099.98px prelude comment (~2346). Its sentence "the paper's 48px page padding (--gap-xl)
     holds until the 600px block below shrinks it to --gap-m" names the old mechanism. Say instead that
     the page padding reads the shared `--gap-page`, which the 600px block steps for the whole shell at
     once, and keep its real point verbatim: no padding declaration lives in the 1099.98px block.
6. In `cross-cutting.test.js`, rewrite the 600px `.recipe-page` test (201-210) to assert the mechanism
   that replaced it: a rule with selector `:root` and `media === '(max-width: 600px)'` declaring
   `--gap-page: var(--gap-m)`, AND no `.recipe-page` rule remaining in that block. Keep the existing
   comment's warning about `mediaRuleFor` being first-match across all blocks, and keep resolving on
   `r.media` directly — the file's own precedent.
7. Widen the shared-left-edge test (610-613) from two rules to four, in one test, so the contract is
   indivisible: `.page-status`'s `inset-inline-start`, `.running-head`'s and `.not-found`'s inline
   padding slots, and `.recipe-page`'s `padding` all read `var(--gap-page)`. Retitle it to say four
   boxes, one gutter. Update the `max-width` assertion at 618 to the new first term.
8. Add the guard CONTEXT.md § Verification 3 asks for: no rule with a defined `media` whose selector is
   one of those four declares `padding`, `padding-inline`, `padding-left`, `inset-inline-start` or
   `inset-left`. That is what makes it impossible for a future edit to move one of the four at a
   breakpoint without moving them all. Add alongside it: no app.css rule's declarations contain
   `var(--gap-xl)` (over `rules`, which `readAllRules` already comment-strips, so prose about the token
   is correctly ignored).
9. Add the definition-side assertions, in the same new describe: `readCustomProperties(tokensSource)`
   has `--gap-page` equal to `var(--gap-xl)` and `resolveTokenPx(tokens, '--gap-page')` is 48;
   `tokensSource` opens no at-rule (assert against comment-stripped source so tokens.css's two prose
   mentions of `@media` are not miscounted — `stripCssComments` then a match for `@media`); and
   `main.jsx`'s source puts its `tokens.css` import before its `app.css` import, since source order is
   what lets the step-down win at equal specificity. Say in the describe's comment why that last one is
   a real contract and not trivia.
10. Change nothing else. No new media block in either file. No second custom property. No token value
    moved. No colour, no motion, nothing on focus, hover or selection. The notice stays
    `position: absolute` and still reflows nothing.

**Verify:**

```
npm --prefix app test
grep -nE "^[[:space:]]+--gap-page:" app/src/styles/tokens.css
grep -nE "^[[:space:]]+[a-z-]+:[^;]*var\(--gap-xl\)" app/src/styles/app.css ; test $? -eq 1
grep -nE "^[[:space:]]+[a-z-]+:[^;]*var\(--gap-page\)" app/src/styles/app.css
grep -nE "^[[:space:]]+--gap-page:" app/src/styles/app.css
grep -c "^@media" app/src/styles/app.css
grep -nE "^[[:space:]]*@media" app/src/styles/tokens.css ; test $? -eq 1
git diff --name-only HEAD | sort
```

Suite green and above the 977/34 baseline by the assertions added in steps 6-9. The first grep prints
exactly one line — the definition. The second exits 1: no app.css declaration reads `--gap-xl` any
more, in a rule OR quoted inside a comment (measured at planning time it prints six lines: 291, 292,
349, 360, 417 and comment line 270). The third prints five lines, one per consumer. The fourth prints
one line, the `:root` step-down. The fifth prints `7` — unchanged, no block added or removed. The sixth
exits 1: tokens.css still opens no at-rule (its two prose mentions of `@media` are mid-line and do not
match this anchored pattern). `git diff --name-only` lists exactly `app/src/styles/app.css`,
`app/src/styles/cross-cutting.test.js`, `app/src/styles/tokens.css` — `binder.test.js` must NOT appear.

**Done:**

- One name for the page gutter, defined once in tokens.css, stepped once in app.css, read by four boxes.
- All four left edges agree at every width; below 600px they are the page's own 20px, and the page was
  not widened back to 48px.
- `.recipe-page`'s duplicate override is gone, so the breakpoint is stated once instead of twice.
- Neither media register changed and `binder.test.js` is untouched, because no at-rule was added.
- A future edit cannot move one of the four without the others, and cannot re-introduce a per-element
  override at a breakpoint without a test going red.
- Commit: `refactor(page-shell): one page gutter, shared by the head, the notice and the page`

---

## For the SUMMARY

1. The real end test count against the **977 tests / 34 files** baseline measured at planning time.
2. **The set was four, not three.** `.not-found` — the "no recipe found" page body — carried the same
   `--gap-xl` inline padding and the same defect, and CONTEXT.md's table missed it. Name the grep that
   found it and the DESIGN.md line that makes it a page-gutter box.
3. **The placement decision, with both reasons:** the name in tokens.css, the breakpoint on `:root` in
   app.css's existing 600px block; tokens.css's own comment at 278 states the convention, and
   `readCustomProperties`'s flat map is the concrete hazard that would have made a tokens.css media arm
   silently resolve the phone value. Say plainly that `--gap-page` is the first custom property app.css
   declares, and why that does not breach the file's own "defined in tokens.css" header.
4. That the cascade rests on `main.jsx`'s import order (tokens.css line 3, app.css line 4) and that the
   order is now pinned by an assertion rather than trusted.
5. **That neither media register needed updating** — CONTEXT.md § Verification 2 warned they might, and
   measured, the count stays 7 with identical conditions because a rule was added inside an existing
   block, not a block. `binder.test.js` is absent from the diff by design.
6. The four assertions rewritten and why each is a moved mechanism, not a loosened one.
7. Observations left deliberately unfixed: the recipe LIST route has no page gutter at all (flush at 0,
   a separate pre-existing question); tokens.css's ingredient-column arithmetic and `columns.test.js`'s
   copy of it still name `--gap-xl` as the page padding, which stays true at the widths they state but
   no longer greps to the rule; and DESIGN.md's responsive ladder now understates its own step, since
   the 600px shrink covers the head and the notice too. `DESIGN.md` and every file under `.impeccable/`
   were not touched — those revisions are the orchestrator's and Impeccable's.

## What the orchestrator checks in a browser

Not the executor's work, and not gated on here:

- At 1024: all four left edges at 48px — the running head, the notice, the page's content, and (on a
  bad version id) the "no recipe found" page.
- At 393: all four at 20px, in step with the page shell, with nothing hanging right of the content.
- The notice still overlays the top of the page and still reflows nothing when it appears or clears.
- The notice's `max-width` no longer overshoots the right edge at 393 — the viewport arm now subtracts
  the box's real left inset.
