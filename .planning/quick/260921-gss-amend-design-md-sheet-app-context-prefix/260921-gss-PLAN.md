---
phase: quick-260921-gss
plan: 01
quick_id: 260921-gss
type: execute
wave: 1
depends_on: []
files_modified:
  - DESIGN.md
autonomous: true
requirements: [D-01, D-02]

must_haves:
  truths:
    - "D-01: DESIGN.md names its two visual contexts Sheet and App, and every colour token in it carries its context as a prefix."
    - "D-01: No token reference anywhere in DESIGN.md reads the unprefixed `ground`, `ink`, `pen-blue` or `bookcloth` form; all 26 read the `sheet-` form, and the four hex values are unchanged."
    - "D-01: The word paper survives in DESIGN.md only where it names the material (8 occurrences); every context-naming use reads Sheet, including the rule now titled Sheet-Is-Flat."
    - "D-01: DESIGN.md states that tokens.css still declares the unprefixed names and that the code rename is pending."
    - "D-02: Five text companions are recorded in frontmatter directly after their accent, appear in the App palette table, and are marked tentatively approved 2026-09-21 rather than approved."
    - "D-02: The companion rule, the Kitchen exemption, and the two caveats (Notebook red, Idea log olive) are stated in words."
    - "D-02: `darker text companions` no longer appears in the Still unresolved list, and a separate sentence records that the companions wait on Mark's confirmation."
  artifacts:
    - "DESIGN.md frontmatter `colors`: keys `sheet-ground`, `sheet-ink`, `sheet-pen-blue`, `sheet-bookcloth` plus five `app-*-text` companions"
    - "DESIGN.md Colors section: the tokens.css pending-rename paragraph, five companion rows in the App palette table, and the companion rule paragraph"
  key_links:
    - "Frontmatter `components` interpolations (`{colors.ink}` x14, `{colors.pen-blue}` x7, `{colors.ground}` x3, `{colors.bookcloth}` x2, 26 total) must move in lockstep with the key rename, or the frontmatter references keys that no longer exist."
    - "The 12 existing `{colors.app-*}` references are already correct and must not be touched; only the five new `-text` references are added."
    - "The Design System artifact (https://claude.ai/artifact/M7LkrAkNQYA897PpKnjjzU) already carries both decisions; DESIGN.md is being brought into agreement with it, not ahead of it."
---

<objective>
Two decisions Mark made on 2026-09-21 land in `DESIGN.md`. D-01 names the two visual contexts **Sheet** (Recipe Sheet, batch and tasting log, print sheet) and **App** (Home, Notebook, Recipe Book, Idea log, Ingredients, Kitchen), and gives every colour token its context as a prefix. D-02 records five tentatively approved text companions for the App accents.

Purpose: DESIGN.md agrees with the Design System artifact, and the four implemented colour roles stop being named after a material that the App half of the product does not use.
Output: one amended `DESIGN.md` at the repo root. No file under `app/` is touched, and no handwriting or hand-text wording changes.
</objective>

<context>
@DESIGN.md
@CLAUDE.md
@.claude/CLAUDE.md
</context>

<facts>
Line numbers are the file as it stands before any edit.

**Token references (26 total, all must become the `sheet-` form):** `{colors.ink}` x14, `{colors.pen-blue}` x7, `{colors.ground}` x3, `{colors.bookcloth}` x2. Most sit in the frontmatter `components` block (lines 94-192); four sit in the body at lines 255, 258, 261, 264. The 12 `{colors.app-*}` references in the App palette table (lines 232-245) are already correctly prefixed.

**Frontmatter values that must not change:** `ground: "#f7f7f4"`, `ink: "#141414"`, `pen-blue: "#1f3d7a"`, `bookcloth: "#33513b"`.

**The word paper appears 43 times.** 35 name the context and become Sheet. 8 name the material and stay, and they are exactly these:

| Line | Kept text | Why |
|---|---|---|
| 206 | `Batch records keep the paper and pen treatment.` | paper and pen are the two physical media |
| 211 | table cell `Paper, ink, pen blue, restrained rules, ...` | a list of materials |
| 212 | `screen paper color is not a requirement to print a background` | the colour of the paper itself |
| 264 | the role name `**Text Paper**` | the role's own name |
| 264 | `so it reads as text paper rather than parchment` | two kinds of physical stock |
| 354 | `nothing floats above the paper` | the physical surface |
| 376 | `a picked or pressed control fills pen blue with paper-coloured text` | the colour of the paper |
| 384 | `its text turns the paper's colour` | the colour of the paper |

**Casing of app / App is out of scope.** DESIGN.md already mixes `app interface` (prose) with `App interface` and `App palette` (headings and table cells). Leave every existing occurrence exactly as it is; this task renames paper, not app.

**Typography and spacing frontmatter keys stay unprefixed.** They are not colour aliases. The body records that they are Sheet roles (D-01).

**Baselines for the verify gates:** 43 case-insensitive `paper`, 51 em-dashes, 12 `{colors.app-*}` references, 1 occurrence of `No-Verdict Rule`, 0 occurrences of `sheet-`.
</facts>

<!-- planner-discipline-allow: paper -->
<!-- planner-discipline-allow: Paper-Is-Flat -->
<!-- planner-discipline-allow: darker text companions -->

<tasks>

<task type="auto">
  <name>Task 1: Sheet and App are named, and every colour token carries its context (D-01)</name>
  <files>DESIGN.md</files>
  <action>
Edit `DESIGN.md` in place. Four moves, all of them D-01.

**(a) Rename the four frontmatter colour keys.** `ground` becomes `sheet-ground`, `ink` becomes `sheet-ink`, `pen-blue` becomes `sheet-pen-blue`, `bookcloth` becomes `sheet-bookcloth` (lines 5-8). The four hex values are unchanged, the key order is unchanged, and the `app-*` keys beneath them are untouched.

**(b) Repoint all 26 interpolations.** Every `{colors.ground}`, `{colors.ink}`, `{colors.pen-blue}` and `{colors.bookcloth}` becomes its `sheet-` form, in the frontmatter `components` block and in the four body bullets at lines 255, 258, 261 and 264. Do not touch any `{colors.app-*}` reference; there must be no such string as `{colors.sheet-app-...}` when you are done.

**(c) Name the two contexts in the Overview.** Immediately above `**The Context Boundary Rule.**` (line 206), add one new paragraph:

`**The two contexts are named.** The **Sheet** is the Recipe Sheet, the batch and tasting log, and the print sheet. The **App** is Home, Notebook, Recipe Book, Idea log, Ingredients, and Kitchen. Every colour token carries its context as a prefix: `sheet-*` for the Sheet, `app-*` for the App. Earlier drafts of this document named the Sheet after its material.`

**(d) Rename every context-naming use of the word paper.** The `<facts>` table above lists the 8 material occurrences that stay; every other occurrence changes. Use exactly these forms, and change nothing else on the line:

- L196 `from the implemented paper system` to `from the implemented Sheet system`; `these are implemented paper primitives` to `these are implemented Sheet primitives`; `existing paper tokens remain unchanged` to `existing Sheet tokens remain unchanged`
- L204 `Around those paper surfaces` to `Around those Sheet surfaces`; `paper supports reading, making, and recording` to `the Sheet supports reading, making, and recording`
- L206 `Apply paper rules to` to `Apply Sheet rules to`
- L210 `Existing paper-styled shell/history controls` to `Existing Sheet-styled shell/history controls`
- L217 the whole bullet becomes `- Two explicit visual contexts: the colorful app interface, and the Sheet (Recipe Sheets and records).`
- L218 `Four implemented paper color roles` to `Four implemented Sheet color roles`
- L219 `Paper prose uses the text face` to `Sheet prose uses the text face`
- L220 `Paper controls preserve` to `Sheet controls preserve`
- L228 `the **implemented paper palette**` to `the **implemented Sheet palette**`
- L230 `they do not replace paper tokens` to `they do not replace Sheet tokens`
- L249 `The paper highlighter's color and meaning` to `The Sheet highlighter's color and meaning`
- L261 `Paper region names and the hairline` to `Sheet region names and the hairline`
- L267 `Within the paper contexts, printed matter is ink black` to `Within the Sheet, printed matter is ink black`
- L271 `In paper contexts, bookcloth names regions` to `In the Sheet, bookcloth names regions`
- L275 `catalogue implemented paper typography` to `catalogue implemented Sheet typography`; `paper uppercase captions and serif/grotesk assignments` to `Sheet uppercase captions and serif/grotesk assignments`
- L315 the heading `### Existing paper-page implementation` to `### Existing Sheet-page implementation`
- L317 `currently mixes app context with paper` to `currently mixes app context with the Sheet`
- L347 `paper's prohibitions on second backgrounds` to `the Sheet's prohibitions on second backgrounds`
- L349 `**Paper contexts:** flat,` to `**The Sheet:** flat,`; `no paper shadow token is established` to `no Sheet shadow token is established`
- L354 the rule title `**The Paper-Is-Flat Rule.**` to `**The Sheet-Is-Flat Rule.**` (the rest of that sentence is untouched)
- L362 `Paper's square-edge and browser-chrome treatments` to `The Sheet's square-edge and browser-chrome treatments`
- L364 `**Implemented paper controls:** square.` to `**Implemented Sheet controls:** square.`
- L374 `preserve the implemented paper controls` to `preserve the implemented Sheet controls`; `transitional reuse of these controls outside paper` to `transitional reuse of these controls outside the Sheet`
- L455 `preserve the implemented paper tokens` to `preserve the implemented Sheet tokens`
- L460 `use the paper catalogue for paper typography` to `use the Sheet catalogue for Sheet typography`
- L465 `impose the paper palette's four colors` to `impose the Sheet palette's four colors`
- L466 `extend paper's flatness` to `extend the Sheet's flatness`
- L467 `or animation inside paper contexts` to `or animation inside the Sheet`

**(e) Record the pending code rename.** In the Colors section under `### Scope and status`, directly after the paragraph that now reads `The four frontmatter roles below are the **implemented Sheet palette**. ...` (line 228), add one new paragraph:

``app/src/styles/tokens.css` still declares these roles unprefixed (`--ground`, `--ink`, `--pen-blue`, `--bookcloth`, `--gap-*`, `--type-*`); the code rename is pending and rides with the tokens.css palette rework. The typography and spacing roles catalogued below are Sheet roles too, and take the `sheet-` prefix in the design system; this document's frontmatter `typography` and `spacing` keys stay as they are, because they are not colour aliases.`

Match the file's existing voice. Write no em-dash in any new or rewritten prose. Do not touch the handwriting or hand-text wording anywhere in the file, do not restyle adjacent sentences, and do not change the casing of any existing `app` or `App`.
  </action>
  <verify>
    <automated>D=/Users/mark/Documents/projects/sprinkles/DESIGN.md; [ "$(grep -oE '^  sheet-(ground: "#f7f7f4"|ink: "#141414"|pen-blue: "#1f3d7a"|bookcloth: "#33513b")$' "$D" | wc -l | tr -d ' ')" = 4 ] && ! grep -qE '^  (ground|ink|pen-blue|bookcloth): ' "$D" && ! grep -q '{colors\.\(ground\|ink\|pen-blue\|bookcloth\)}' "$D" && [ "$(grep -o '{colors\.sheet-[a-z-]*}' "$D" | wc -l | tr -d ' ')" = 26 ] && ! grep -q '{colors\.sheet-app' "$D" && [ "$(grep -o '{colors\.app-[a-z-]*}' "$D" | wc -l | tr -d ' ')" = 12 ] && [ "$(grep -oi paper "$D" | wc -l | tr -d ' ')" = 8 ] && ! grep -qiE 'paper[ -](context|palette|token|surface|system|primitiv|typograph|control|catalogue|prose|highlighter|region|world|page|styled|rules)' "$D" && ! grep -q 'Paper-Is-Flat' "$D" && grep -q 'Sheet-Is-Flat Rule' "$D" && grep -q 'The two contexts are named' "$D" && grep -q 'the code rename is pending' "$D" && grep -q 'are Sheet roles too' "$D" && [ "$(grep -o '—' "$D" | wc -l | tr -d ' ')" -le 51 ] && echo PASS</automated>
  </verify>
  <done>The frontmatter carries `sheet-ground`, `sheet-ink`, `sheet-pen-blue`, `sheet-bookcloth` at their original values; all 26 interpolations read the `sheet-` form and the 12 `app-*` ones are untouched; exactly 8 material occurrences of the word paper remain and no context-naming one does; the Overview names Sheet and App and the prefix rule; the Colors scope paragraph records the pending tokens.css rename and that the typography and spacing roles are Sheet roles; the em-dash count has not risen.</done>
</task>

<task type="auto">
  <name>Task 2: Five tentatively approved text companions for the App accents (D-02)</name>
  <files>DESIGN.md</files>
  <action>
Edit `DESIGN.md` in place. Four moves, all of them D-02.

**(a) Frontmatter.** Add each companion directly beneath its accent in the `colors` block, keeping the existing two-space indent and quoted-hex form:

- `app-notebook-text: "#EE0803"` after `app-notebook`
- `app-recipe-book-text: "#BC5B0D"` after `app-recipe-book`
- `app-idea-log-text: "#976F01"` after `app-idea-log`
- `app-ingredients-text: "#358452"` after `app-ingredients`
- `app-blue-text: "#1576DE"` after `app-blue`

`app-pantry` and `app-kitchen` get no companion. Do not reorder or revalue anything already there.

**(b) App palette table.** In the Colors section, add one row per companion to the existing two-column table (lines 232-245), each immediately beneath its accent's row, and carry the contrast ratio and the tentative status in the Role cell so a reader cannot mistake a companion for an approved accent:

- `| Notebook text · 4.50:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-notebook-text}` |` beneath the Notebook row
- `| Recipe Book text · 4.52:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-recipe-book-text}` |` beneath the Recipe Book row
- `| Idea log text · 4.59:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-idea-log-text}` |` beneath the Idea log row
- `| Ingredients text · 4.60:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-ingredients-text}` |` beneath the Ingredients row
- `| App blue text · 4.51:1 on the app background · tentatively approved 2026-09-21 | `{colors.app-blue-text}` |` beneath the App blue row

Leave the twelve existing rows, their wording and their order exactly as they are.

**(c) The companion rule.** Directly beneath that table, above the paragraph beginning `Recipe-specific identity colors are retired.` (line 247), add one new paragraph:

`**Text companions, tentatively approved 2026-09-21.** A companion is the same hue darkened only until it clears 4.5:1 on the app background, for a destination name, a count, or a link set in its own colour. A companion is never a fill, and an accent is never text. `{colors.app-kitchen}` needs no companion: it already reads 5.88:1. Two companions carry a caveat. The Notebook companion is a pure red and must be watched against the No-Verdict Rule; the Idea log companion is an olive that no longer reads as the yellow. Either may fall back to `{colors.app-text}`.`

**(d) Still unresolved.** In the `**Still unresolved:**` paragraph (line 249), the clause `pale tints and darker text companions;` becomes `pale tints;`, leaving the rest of the list in its existing order. Then append one sentence to the end of that same paragraph: `The five text companions above are tentatively approved 2026-09-21 and wait on Mark's confirmation.`

Match the file's existing voice. Write no em-dash in any new prose. Do not restate a companion as approved anywhere, do not touch the App palette approval sentence at line 230, and do not touch anything the first task renamed.
  </action>
  <verify>
    <automated>D=/Users/mark/Documents/projects/sprinkles/DESIGN.md; [ "$(grep -oE '^  (app-notebook-text: "#EE0803"|app-recipe-book-text: "#BC5B0D"|app-idea-log-text: "#976F01"|app-ingredients-text: "#358452"|app-blue-text: "#1576DE")$' "$D" | wc -l | tr -d ' ')" = 5 ] && for k in notebook recipe-book idea-log ingredients blue; do grep -A1 "^  app-$k: " "$D" | tail -1 | grep -q "^  app-$k-text: " || exit 1; done && [ "$(grep -o '{colors\.app-[a-z-]*-text}' "$D" | wc -l | tr -d ' ')" = 5 ] && [ "$(grep -o '{colors\.app-[a-z-]*}' "$D" | wc -l | tr -d ' ')" = 17 ] && [ "$(grep -o 'tentatively approved 2026-09-21' "$D" | wc -l | tr -d ' ')" -ge 6 ] && ! grep -q 'darker text companions' "$D" && grep -q '5\.88:1' "$D" && [ "$(grep -o 'No-Verdict Rule' "$D" | wc -l | tr -d ' ')" = 2 ] && grep -q 'wait on Mark' "$D" && [ "$(grep -oi paper "$D" | wc -l | tr -d ' ')" = 8 ] && echo PASS</automated>
  </verify>
  <done>Five companions sit in frontmatter directly after their accents at the stated values; five companion rows sit in the App palette table beneath their accents, each carrying its ratio and the tentative date; the companion rule, the Kitchen exemption at 5.88:1 and both caveats are stated in words; `darker text companions` is gone from the unresolved list and a separate sentence records that the companions wait on Mark's confirmation; Task 1's work is intact.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none crossed | A documentation edit to one repo-root markdown file. No runtime code, no dependency, no user input, no network call. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-260921-gss-01 | Tampering | DESIGN.md frontmatter | low | mitigate | A key rename that misses an interpolation leaves the frontmatter citing a key that no longer exists. Gated: 0 unprefixed references and exactly 26 `sheet-` ones. |
| T-260921-gss-02 | Information disclosure | none | low | accept | No secret, credential or personal datum is added; the five hex values and their contrast ratios are design facts. |

No package-manager install occurs in this plan, so no package-legitimacy gate applies.
</threat_model>

<verification>
Both tasks edit the same file and run in order. After Task 2, re-run Task 1's gate to prove the second edit did not disturb the first: the 8 material occurrences of the word paper, the 26 `sheet-` references and the absent unprefixed ones must all still hold.

`git diff --stat` must name `DESIGN.md` and nothing else. No file under `app/` is touched, so no build or test run is required or meaningful here.
</verification>

<success_criteria>
- `DESIGN.md` is the only changed file.
- D-01: Sheet and App are named in the Overview; 4 frontmatter keys and 26 interpolations carry the `sheet-` prefix at unchanged values; the word paper survives only in the 8 material uses; the rule reads Sheet-Is-Flat; the pending tokens.css rename and the Sheet typography and spacing roles are recorded in Colors.
- D-02: five companions in frontmatter and in the App palette table, marked tentatively approved 2026-09-21; the rule, the Kitchen exemption and the two caveats stated; `darker text companions` removed from the unresolved list and replaced by a sentence naming the companions as tentative.
- No em-dash in new prose; no handwriting or hand-text wording changed; no `app`/`App` casing changed.
- Committed as `docs: name the Sheet and App contexts, prefix every token, add five tentative text companions`.
</success_criteria>

<output>
Create `.planning/quick/260921-gss-amend-design-md-sheet-app-context-prefix/260921-gss-SUMMARY.md` when done.
</output>
