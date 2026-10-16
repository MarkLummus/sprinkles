# Feature Research

**Domain:** Recipe creation for a home ice cream maker (blank recipe, library-backed ingredient rows, structured steps, reordering, per-recipe tasting scales), added to an existing Notebook-and-Sheet app
**Milestone:** v2.0 Recipe creation (subsequent milestone; reading, the version pen, batches, tastings, print and the library store already exist and are not re-researched)
**Researched:** 2026-10-15
**Confidence:** MEDIUM overall. HIGH on what the product packet and code already decide; MEDIUM on competitor behaviour (vendor docs and App Store listings, no hands-on use); LOW on any claim that "no competitor does X" (absence in search results).

## How to read this

Sprinkles sits between two product families, and the creation screen has to borrow from each:

- **Recipe managers** (Paprika, Recipe Keeper, Mela): a "+" opens an empty recipe; ingredients are text lines; directions are one text block; save at the end. No template choice, no formulation. Their lesson is *low ceremony*.
- **Formulation tools** (Gelato Maestro, Gelato Lab, IceForm, dairyscience.info calculators, Mark's own Ice Ed): an ingredient library carrying composition and PAC/POD; rows in grams; live balance gauges against editable targets; custom ingredients made by duplicating one; production history. Their lesson is *live numbers while you build*.

Sprinkles adds a third thing neither family has: **structured steps that own their ingredient amounts**, because the printed bench sheet lays rows by step and a row's total is the sum of its per-step portions. Competitors give no precedent for that part, so for it the evidence is Sprinkles' own code and packet.

Ice Ed (Mark's legacy app) has no public footprint; web search found only the dairyscience.info spreadsheet calculators it resembles. It is treated as Mark's own prior art, to be consulted by Mark, not researched here.

## Feature Landscape

### Table Stakes (a home maker expects these; missing = creation feels broken)

| Feature | Why Expected | Complexity | Notes / dependency on existing code |
|---------|--------------|------------|-------------------------------------|
| Notebook place with a "New recipe" action, and the list of recipes | Every recipe app opens creation from one obvious "+" (Paprika: "+" top right, Ctrl/Cmd-N). `/notebook` is a placeholder today | LOW | Reuses `RecipeList` and the `/notebook/:recipeId/:versionId` routes. Label is plain sentence case (D11). Starts from scratch with no template or base choice (REC-01: "does not require an unrelated template choice"; D12 keeps Template open, so no Template wording) |
| Blank start asks only name; everything else optional until Save | Paprika, Recipe Keeper and Mela all let you save with as little as a title. `createRecipe` needs only name, version name and one row | LOW | Hold the whole creation as an unsaved draft; write nothing to the store until Save, so no half-made recipe appears in the Notebook list. Refusals ("name is blank", "no rows yet") are words on the form, not exceptions (the packet's "throw for caller bugs, message for maker input" rule). Save is never gated by balance (D06) |
| Draft survives a closed tab or accidental navigation | Existing UX1-02 / kept-drafts behaviour: the app already promises entered data survives | MEDIUM | Reuse the draft mechanism from `usePenDraft` / `useRecordDraft`; creation is a draft with no parent. Cancel discards with no confirmation dialog (existing decision) |
| Name and description at recipe level; version name at version level | D17: Recipe name/description are enduring identity; Sheet title/description and Version name belong to the version | LOW | `createRecipe` already seeds sheet title from recipe name and an empty sheet description. Prefilling the version name is a design call (see Open decisions). No "Why" and no "From" line on a first version (`Saying absence`: omit what does not apply) |
| Add an ingredient by searching the library | Gelato Maestro (200+), Gelato Lab (95+) and Ice Ed all pick from a searchable library; typing a free-text ingredient is how recipe managers work but gives no figures | MEDIUM | Search by name with category filter; show each entry's basis flag (stated / derived / estimated / inherited) in the picker, since provenance is the product's trust claim (D09, ING-01). Uses the library store and `rowFromLibraryRecord` (embeds a `structuredClone`, so a later library change never moves a saved figure) |
| Enter grams per ingredient; figures answer live | Every formulation tool recalculates as you type. The six figures against bands already exist on the reading page | MEDIUM | Reuse the live-figure code the version pen uses. Grams only in the Notebook (D17). Blank is not zero; 0 g is a written value (existing rule) |
| Picking an ingredient already in the recipe goes to its existing row | A row carries per-step portions and a derived total, so a second row for the same ingredient would be a second identity | LOW | Needs the row-id rule: unique, not a reserved name (`RESERVED_ROW_IDS`). Splitting one ingredient over two steps is portions on one row, never two rows |
| Remove a row, remove a step, before first Save | Basic editing | LOW-MEDIUM | At creation nothing is history, so removal can be a true delete. Cleaning up is required: deleting a step must clear its key from every row's portions and every other step's `uses`; deleting a row must clear it from steps' `uses`. See Pitfalls handoff below |
| Reorder steps and rows | Gelato Maestro reorders ingredients by drag; Paprika/Recipe Keeper let you reorder lines or photos | MEDIUM | See reordering note below. Step display numbers are already derived from array order (`displayNumbers`), so a reorder renumbers for free; the stored key `n` stays identity |
| Write steps: lead-in, instruction text, targets | The bench sheet prints these; the reading page shows them. Paprika offers only one text block, so this is richer than the family norm | MEDIUM | Targets are label + value pairs as stored today (`temp` / `85 °C`, `hold` / `2 min`). Keep free text with a short suggested-label list; no unit parsing or conversion. Step keys come from `nextStepKey` (never reused) |
| Say which rows each step uses, and how much of a row goes in that step | The sheet's table reads in step order and a row's total is the sum of its portions; this is the app's own rule, not a competitor norm | HIGH | The hardest part of the screen. Default a one-portion row to "used in this step, all of it"; splitting an amount across steps is an explicit second action. The row total is shown as derived and is not an input. See Open decisions on rows that no step uses yet |
| Before you start notes | Existing section on the Sheet (`authored.beforeYouStart`); makers expect a place for prep and caveats | LOW | A list of short text lines; render as text, never markup. Reorder/remove like steps |
| Equipment and process | The sheet carries a machine, scale resolution and pasteurise/hold settings; creation must be able to author them or the printed sheet is incomplete | MEDIUM | `createRecipe` currently leaves `equipment`, `process`, `iceEd` and `targets` out ("none is invented"). v2.0 lets the maker author them; unauthored stays absent. D-supported-equipment scope is open in the register (conventional machines first); do not enumerate machines |
| Balance targets, authored per figure and optional | Gelato Maestro and Gelato Lab both let the user edit target ranges; the reading page already draws bands | MEDIUM | An absent band is a fact, not a zero-width band (`figures.js` branches on key presence). Targets are an assessment, never a gate (D06): a recipe outside every band still saves and prints. See Open decisions on pre-filled bands |
| Custom tasting scales (0 to 2) and custom problems (0 to 2) | SEED-261001-iq4: the batch record should say what *this* recipe is about (Mexican Chocolate "Heat", 1 "Not there" to 5 "Burn my lips"; a yes/no problem) | HIGH | See the scales section below. The cap of two each keeps the tasting light (D08: "no mandatory ten-axis survey") |
| Empty state for scales and problems shows nothing | Seed: when a recipe defines none, the "This recipe only" label must not show; the packet's absence rule says omit what does not apply | LOW | Today the label and a hard-coded Bitter chip show on every recipe. Fixing that is part of the same change as the new definitions, not a separate patch |
| Save lands on the new recipe's own page, first version, readable and printable | The loop's point is "make it from a printed sheet". Save must put the maker where reading and print already work | LOW | Reuses routes and the print sheet; the new version behaves like any stored version thereafter |
| Read-only Ingredients place | Gelato Maestro and Lab both expose their ingredient library as a browsable list with composition; Mark needs to see what a row will copy and where it came from | MEDIUM | List with search and category; detail shows composition per field with basis and source (D09). `/ingredients` is read-only: no create, no edit, no delete in v2.0 (Mark, 2026-10-16) |
| Library seeded beyond the current 12 rows, each field with provenance | A creation screen on a 12-ingredient library is a dead end for any new flavour. Competitors ship 95 to 200+ entries | HIGH (data work, not code) | Candidate datasets disagree (dextrose PAC 174.8 vs 190, salt 586 vs 580); settle conflicts before seeding, record the chosen value and its source. Existing field basis words and `source` per field already model provenance, so this is mostly data selection. Coefficient conflicts are the blocking decision |

### Differentiators (where Sprinkles competes; align with Core Value: develop, make from paper, get a citable record)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Structured steps whose rows and amounts print by step | Makes the printed bench sheet usable in a kitchen: the maker sees what to weigh for this step. Recipe managers cannot do this | HIGH | Already the shape of the model; creation must author it, not flatten it to a text block |
| Per-recipe tasting scales and problems carried into the batch record | The next version cites a record that names what this recipe cares about. No competitor found with this (LOW: absence evidence only). Gelato Maestro rates and annotates production runs with fixed fields | HIGH | Definitions snapshotted into each batch (existing invariant: `batch.snapshot.declaredAxes`). Needs sketch work first on the Claude Design canvas (seed open question 5) |
| Provenance visible in the picker and on the row | Competitors show PAC/POD numbers; none found that shows where a number came from or that it is estimated (LOW). Mark's own history (coefficient drift corrupted batches) makes this core | MEDIUM | Reuse the existing "estimated / unreviewed" words on rows; no colour carries status |
| Live balance during creation, framed as assessment under stated assumptions | Same figures as competitors but with basis stated and no pass/fail verdict (D06, FORM-01) | LOW (reuse) | Differentiator comes from restraint, not new maths |
| Print-first: the finished creation prints straight to a bench sheet with a code that finds the version again | Paper-first kitchen; competitors export a PDF at most (Gelato Lab) | LOW (reuse) | Existing print route; creation only needs to produce data the sheet already reads |
| Move-up / move-down controls instead of drag | Works with iPad touch, keyboard, and the project's shared `Button` rule; deterministic and testable | LOW-MEDIUM | See reordering note. Drag is the family norm but is not needed for a first creation |

### Anti-Features (commonly requested, problematic here; these feed Out of Scope)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Auto-balance / "Optimize" (Gelato Maestro's Auto Balance, cost-balance, ingredient locks) | Strongest feature of the formulation family; makers like it | D12 keeps the Optimize/Adjust label open; FORM-02 says proposals never silently replace the recipe; D06 forbids implying success; it is a solver project of its own | Live figures plus the maker's own edits. Existing "explore adjustments" stays the only adjustment surface; revisit only after Mark names the label and a design test |
| Create or edit ingredients (including "duplicate and edit", Gelato Maestro's route to custom ingredients) | Every competitor lets users add their own ingredient; a library gap is the most likely creation frustration | Out of v2.0 by Mark (read-only Ingredients). Also `importAll` currently overwrites a local library entry without asking, a decision still open "before library editing" | Seed breadth and provenance as the mitigation; say plainly in the picker when an ingredient is not in the library. See Open decisions on the dead end |
| Template or starter-recipe chooser, "Base" picker, "Adapted from" link on creation | Gelato Lab's "base types", other apps' template galleries | REC-01 says scratch start needs no template choice; D12 keeps Template open; D17 says Adapt starts from a specific version, and seeded recipes stand alone unless Mark names a base | One "New recipe" action. Adapt remains its own process. "Mark as Base" (REC-01) is not in the v2.0 target list; park it |
| Structure edits on later versions: add/remove/reorder steps or rows when developing version 2+ | Natural next ask once creation can reorder | Out of v2.0 by Mark (2026-10-16): needs Show changes for dropped, added and moved steps and batches recording changed structure | Structure controls exist only while authoring a first version. On saved versions they are absent, not disabled (the packet's absence rule) |
| Drag-and-drop reordering as the only means | Family norm; feels natural on a phone | Touch drag is unreliable in WebKit without extra code; the project requires every control through shared `Button`/`Checkbox`/`Radio` with literal `tabIndex={0}` and keyboard reachability on iPad | Up/down buttons first; drag later as an enhancement if Mark asks |
| Rich-text or Markdown step editor, auto-detected timers, cook mode, step photos | Paprika and Mela do timers and Markdown; photos are everywhere | Notes render as text, never markup (project convention: no `dangerouslySetInnerHTML`); the kitchen is paper-first; each is a feature bigger than the milestone | Plain text fields. Targets already carry hold times as data |
| Recipe photos, star ratings, categories/tags, difficulty, servings, nutrition, cost per batch | Standard recipe-manager fields | Stars/ratings label is open (D12); servings must not silently inherit a mass sum (IMP-02); the rest serve a different product (recipe collection) | Leave out. Revisit nutrition/cost only on stated demand |
| Import at creation: paste text, URL, file, photo | Recipe managers lead with import | D03 puts pasted text first but not in this milestone; URL/file later; photo needs discovery; TRUST-01/IMP-01 forbid network import without a policy | Import is its own milestone |
| Per-recipe custom scales beyond two, or free-form survey builders | "Let me track everything" | D08 forbids a mandatory ten-axis survey; each extra axis taxes every tasting | Keep the cap at 0-2 scales and 0-2 problems |
| Accounts, sync, sharing a recipe link | Recipe apps sync via iCloud/cloud | D16 keeps storage open; no social scope | Existing export/import of the store |
| Migration of existing stored data when the shape changes | Safe-looking | Mark confirmed no live data; reset-on-bump stays until creation ships (milestone note) | Reset on `DB_VERSION` bump; do this shape change before v2.0 ships, not after |

## Reordering note (rows and steps)

- **What the family does:** Gelato Maestro reorders ingredients by dragging, using native list behaviour since 6.6 (vendor listing, MEDIUM). Paprika's help describes dragging only for photos; it describes no ordering of ingredient lines or directions (official help, HIGH on what it says, silence is not proof). Recipe managers keep ingredients and directions as text, so "reorder" means cut and paste.
- **Sprinkles' constraint:** A step's stored key `n` is identity (diff pairing, row portions, uses lists, batch step changes). Display numbers derive from position among active steps. So reordering moves array positions and never rewrites `n`; any code or test assuming `n` ascends with position needs a check.
- **Rows:** the table reads in step order (Phase 03.3), so "reorder rows" needs a defined meaning (order within a step, or the order in which rows are listed in the form). Settle this before building (Open decisions).
- **Recommendation:** buttons, one move per press, with the moved item keeping focus and the new position announced in words. Pure domain operations (`moveStep`, `moveRow`) beside `nextStepKey`, testable under the node environment.

## Custom scales and problems note

- **Today:** `AXES` is a fixed table of six (four core always present, plus Body and Oil as the declared pair). A version names declared axes (`declaredAxes`) and problems (`declaredFlaws`, 0 to 2) resolved against the catalog; Bitter is a hard-coded chip shown on every recipe (the bug in the seed).
- **Wanted (seed):** a measure is a name plus a label for each end, scored 1 to 5; a problem is a yes/no flag with a name; each recipe 0 to 2 of each.
- **Mismatch to surface to Mark:** the existing battery is a "goldilocks" scale whose middle stop is the fixed word "right" with "leaning low / leaning high" between. Mark's own example ("Heat", 1 "Not there", 5 "Burn my lips") is a magnitude scale with no "right". These are different scale kinds. Choose before sketching (recommendation: keep one scale kind per measure and ask only for end labels, with the middle stops derived, so a magnitude measure like Heat simply never marks "right"; but this is Mark's call and needs a canvas sketch).
- **Invariants to keep:** a batch snapshots the definitions it was recorded with, so a stored mark never moves when the recipe changes. Definitions become data on the version (name plus end labels), not a name resolved against a catalog; because reset-over-migration applies while no live data exists, that shape change is cheap now and expensive after v2.0 ships.
- **Existing Body and Oil and Bitter:** become ordinary recipe-defined entries on the seeded recipes that use them (olive oil declares Body, Oil and Bitter). Whether any recipe carries a default is Mark's decision (seed question 3).
- **Where definitions live (version vs recipe):** the model already puts them on the version, snapshotted into each batch. Keep per version at creation; no cross-version inheritance rule is needed until structure edits on later versions come back in scope.

## Feature Dependencies

```
Read-only Ingredients place ──shares──> ingredient library store (exists)
Library seeded with provenance ──requires──> coefficient conflicts settled (data decision)
        └──enables──> Ingredient picker (search + basis flag)
                            └──requires──> rowFromLibraryRecord (exists)
                                                └──requires──> Row amount entry (grams) ──enhances──> Live figures (exists)

Notebook place + New recipe ──requires──> creation draft (new, built on draft hooks)
        └──requires──> shared editor split from RecipePage (first task of the milestone)
                            └──requires──> createRecipe (exists) extended for equipment/process/targets/scales

Steps (lead-in, text, targets) ──requires──> nextStepKey (exists)
        ├──requires──> row↔step linkage (uses lists + portions) ──requires──> Rows
        └──enables──> Reorder / remove steps ──requires──> cleanup of references (portions, uses)

Custom scales/problems ──requires──> sketch on canvas + Mark decisions (Bitter, scale kind)
        └──requires──> version/battery data shape change ──requires──> DB reset on version bump (allowed only until creation ships)
                            └──touches──> BatchRow (record pen), axes.js, battery.js, seeds

Balance targets (authored) ──enhances──> Live figures; absent band = no band

Structure controls ──conflicts──> saved versions (absent there; later-version structure edits are out of v2.0)
```

### Dependency Notes

- **Creation requires the editor split:** the milestone already sequences the `RecipePage` split first; creation and editing must share one editor, so none of the creation UI should start before it lands.
- **Library seeding is the long pole:** a read-only library and an ingredient picker are worth little on 12 entries, and the coefficient conflicts are an upstream decision. Settling them can run in parallel with the editor split.
- **Rows depend on steps in a non-obvious way:** `rowFromLibraryRecord` takes a `step` (default 1) for the row's single portion, so a row created before any step exists points at a step key that is not there. Decide the authoring order and what a not-yet-assigned row means before building the form (flagged for ARCHITECTURE and phase research).
- **Scales cannot start with code:** the seed requires a drawing first; the data shape change must land inside the reset window.
- **Reorder/remove conflict with later versions:** these controls must not appear in the version pen; the later-version behaviour is out of scope, so keep the creation editor's structure controls behind "this version is being authored for the first time".

## MVP Definition

### Launch With (v2.0)

- [ ] Editor split from `RecipePage`, no visible change (prerequisite)
- [ ] Notebook "New recipe" opening a blank draft; save lands on the new version's page
- [ ] Name, description, version name; message-style refusals; draft survives closed tab
- [ ] Library seeded beyond 12 with provenance; read-only Ingredients place
- [ ] Ingredient picker (search, basis flag), grams entry, live figures; pick-existing goes to its row
- [ ] Steps: lead-in, text, targets, which rows each step uses, and portion split as an explicit act
- [ ] Add, remove, reorder steps and rows via buttons, first version only, with reference cleanup
- [ ] Before you start notes; equipment and process; optional balance targets
- [ ] 0-2 custom scales and 0-2 custom problems, with the empty state showing nothing and Bitter settled

### Add After Validation (v2.x)

- [ ] Drag-to-reorder as a touch/pointer enhancement, if buttons feel slow on the iPad
- [ ] Pre-filled house-style target bands, if blank targets prove a barrier
- [ ] Mark a recipe as a Base (REC-01), once Base persistence and interaction are shaped (D17 open)

### Future Consideration (later milestones)

- [ ] Ingredient create/edit with provenance entry, and the `importAll` overwrite decision
- [ ] Structure edits on later versions with Show changes and batches recording changed structure
- [ ] Pasted-text import as a second way to start a recipe (D03)
- [ ] Auto-adjust under a label Mark chooses (D12)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Editor split | MEDIUM (enabler) | HIGH | P1 |
| New recipe from Notebook, blank draft, save | HIGH | MEDIUM | P1 |
| Seeded library with provenance | HIGH | HIGH (data) | P1 |
| Ingredient picker + grams + live figures | HIGH | MEDIUM | P1 |
| Steps with uses and portions | HIGH | HIGH | P1 |
| Add/remove/reorder steps and rows (first version) | HIGH | MEDIUM | P1 |
| Read-only Ingredients place | MEDIUM | MEDIUM | P1 |
| Before you start, equipment and process | MEDIUM | MEDIUM | P1 |
| Balance targets authored | MEDIUM | MEDIUM | P2 (P1 if the sheet needs bands to print) |
| Custom scales and problems | HIGH to Mark, MEDIUM to a first-time maker | HIGH (sketch, data shape, record pen) | P1 per Mark's target list, last in order |
| Drag reorder | LOW | MEDIUM | P3 |
| Base marking | LOW now | MEDIUM | P3 |

## Competitor Feature Analysis

| Feature | Recipe managers (Paprika, Recipe Keeper, Mela) | Formulation apps (Gelato Maestro, Gelato Lab) | Our approach |
|---------|------------------------------------------------|-----------------------------------------------|--------------|
| Start | "+" opens an empty recipe; Save at the end | Create recipe, pick base type (Lab) | "New recipe" in Notebook; blank draft; nothing stored until Save; no template |
| Ingredients | Text lines; "Sauce:" colon makes a heading; "1 cup milk" parsed for scaling | Pick from 95-200+ library entries with composition/PAC/POD; duplicate-and-edit to make custom | Pick from library; grams only; read-only library in v2.0 |
| Steps | One directions text block (Paprika); timers auto-detected | Not described in listings | Structured: lead-in, text, targets, uses; prints by step |
| Reordering | Photos dragged; ingredient/step reorder not documented | Ingredients dragged (native list) | Move up/down buttons; first version only |
| Targets | None | Editable gauges, house style, serving temperature | Optional authored bands per figure; assessment, not gate |
| Balance | None | Live gauges, auto-balance, locks, limits | Live figures with basis; no auto-balance |
| Custom ingredient | Free text | Create/duplicate with PAC/POD calculators; AI/barcode flow in 6.8 | Not in v2.0 |
| Tasting measures | Star rating, notes | Annotate/rate production runs | 0-2 custom scales and 0-2 problems per recipe, snapshotted per batch |
| History | None | Production history, branch from batch | Existing versions, batches, lineage |
| Output | Cook mode, share | PDF sheets (Lab), nutrition labels (Maestro) | Printed bench sheet with a finding code |

## Open decisions for Mark (do not resolve by running first)

1. **Ingredient not in the library.** With create/edit out of scope, the picker has a dead end. Options: (a) say "not in the library yet" and stop; (b) allow a name-only row with unknown composition whose figures are marked limited (D03 and D09 say useful partials may be saved and unknown stays unknown; `rowFromLibraryRecord` already accepts an empty composition, but how the figures treat it needs checking). Recommended: (a) for v2.0 plus seed breadth, unless Mark's own recipes show frequent gaps; flag (b) for phase research.
2. **Scale kind for custom measures** (goldilocks "right" middle vs plain magnitude); and Bitter's fate (seed questions 1-4); needs a drawn canvas.
3. **Version name default** on a blank start (blank and required, or a visible prefilled suggestion the maker can change).
4. **Meaning of "reorder rows"** given the table reads in step order.
5. **Pre-filled target bands** (the app's standard bands, labelled with their source) versus blank. `createRecipe` currently invents none (Phase 7 D-02); D06 allows either as long as bands never gate.
6. **Row removal at creation:** hard delete (no history yet) versus the existing `removed` flag. Recommended hard delete with reference cleanup, but the batch and diff code paths that expect flags need checking.
7. **`importAll` overwrite** stays an open decision before library editing; no v2.0 work depends on it.

## Sources

- Product packet and project record (HIGH): `product-requirements/README.md`, `03-decision-register.md` (D03, D04, D06, D08, D09, D11, D12, D16, D17, D18), `04-requirements.md` (REC-01, ING-01, FORM-01, IMP-02), `05-domain-and-language.md`; `.planning/PROJECT.md` (v2.0 scope and out-of-scope list, 2026-10-16).
- Code read for dependencies (HIGH): `app/src/domain/newRecipe.js`, `versionRow.js`, `stepKeys.js`, `stepNumbers.js`, `uses.js`, `axes.js`, `figures.js`; `app/src/data/library.js`, `olive-oil.js`; `.planning/seeds/SEED-261001-iq4-recipe-specific-tasting-measures-and-failures.md`.
- Paprika help, iOS (official, HIGH on stated behaviour): https://paprikaapp.com/help/ios (add via "+", fields, colon headings, directions as one text field, only photos documented as reorderable). Windows/Mac help via search results (MEDIUM).
- Gelato Maestro Pro, App Store listing (vendor claims, MEDIUM): https://apps.apple.com/gr/app/id6476892914 (200+ ingredients with PAC/POD, duplicate or create ingredients, editable target gauges, Auto Balance and locks, drag reorder, production history and branching).
- Gelato Lab, App Store listing (vendor claims, MEDIUM): https://apps.apple.com/app/id6757681641 (95+ ingredients, custom ingredients, custom base types as a paid tier, overrun calibration, cost, PDF sheets).
- Recipe Keeper and Mela (LOW): App Store marketing and a MacStories review of Mela; neither documents step structure or reordering in the material found. https://recipekeeperonline.com/, https://www.macstories.net/reviews/mela-an-elegant-and-innovative-recipe-and-cooking-app-for-iphone-ipad-and-mac/
- dairyscience.info calculators (MEDIUM): https://www.dairyscience.info/a125/a125.asp (spreadsheet-style POD/PAC calculators with editable supplier data tables). IceForm Pro (third-party listing, LOW). Ice Ed found no public documentation.
- Claims that no competitor offers per-recipe tasting scales or ingredient provenance rest on absence in search results (LOW).

---
*Feature research for: recipe creation in an ice cream recipe-development app*
*Researched: 2026-10-15*
