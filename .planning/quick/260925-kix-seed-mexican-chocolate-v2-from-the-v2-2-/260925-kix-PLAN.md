---
phase: quick-260925-kix
plan: 01
quick_id: 260925-kix
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/data/mexican-chocolate.js
  - app/src/data/seed-recipes.js
  - app/src/data/seed-recipes.test.js
  - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md
  - Ice Cream Log Pages/seed-transcription-sidecar.json
  - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md
  - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md
autonomous: true
requirements: []

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "mexicanChocolateV2 exists in app/src/data/mexican-chocolate.js with the 12 rows of ~/Documents/Mexican Chocolate v2-2.ier in file order and grams (Whole Milk 3.3% 427, Cocoa Powder 30, Sucrose 50, Dextrose 35, Fructose 5, Dried Skimmed Milk Powder 39, Salt 1, Cream, heavy 140, Vanilla Extract 7, Stabilizer Mix 4421 2.2, Cinnamon 2.6, Allulose 50), serving temperature -16, createdAt 2026-01-11T23:22:38.000Z, every row embedded from an existing library entry."
    - "Mexican Chocolate reads v1 -> v2 -> v3 -> v4: v2's parent is v1, v3's parent is v2, v4's parent is v3; transcribedRecipeGroups lists the four versions in that order and railEntries names them 'Version 1 · v1', 'Version 2 · v2', 'Version 3 · v3', 'Version 4 · v4'."
    - "v2 has no batch and no tasting; its reason and citedBatchId are null; its carried-forward Notes (v1's Observations and to-fix text) are not on the version, only in the sidecar, flagged — process and Instructions follow the v4 precedent exactly."
    - "v3's rows are unchanged (binder photo IMG_2454 wins); v3's citedBatchId is null because the app keeps a cited batch on the parent and v2 has none; v3's reason is left as written and flagged for Mark."
    - "npm --prefix app test passes."
    - "03.5-SEED-REVIEW.md carries a v2 source row, a Mexican Chocolate v2 section, the v1 Documents-export note, v3's parent as v2, a four-version History paragraph and a v2 states row; 03.5-09-PLAN.md and 03.5-CONTEXT.md D-01 no longer tell a later executor that Mexican Chocolate has no v2."
    - "Nothing is wired into app/src/store/seed.js and no DB or schema version moves."
  artifacts:
    - path: app/src/data/mexican-chocolate.js
      provides: "MEXICAN_CHOCOLATE_V2_ID and mexicanChocolateV2; v3 re-parented to v2"
      contains: "mexican-chocolate-v2"
    - path: app/src/data/seed-recipes.js
      provides: "Mexican Chocolate group with versions v1, v2, v3, v4"
      contains: "mexicanChocolateV2"
    - path: app/src/data/seed-recipes.test.js
      provides: "v2 rows/fields, v1 -> v2 -> v3 -> v4 chain, rail names, no v2 batch, cited-batch-on-parent invariant"
      contains: "railEntries"
    - path: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md
      provides: "Mexican Chocolate v2 review section and corrected lineage text"
      contains: "## Mexican Chocolate v2"
    - path: Ice Cream Log Pages/seed-transcription-sidecar.json
      provides: "mexican-chocolate-v2 sidecar entry (kcal, stale notes, flag)"
      contains: "mexican-chocolate-v2"
  key_links:
    - from: app/src/data/seed-recipes.js
      to: app/src/data/mexican-chocolate.js
      via: "import of mexicanChocolateV2 into the Mexican Chocolate group's versions array"
      pattern: "mexicanChocolateV2"
    - from: app/src/data/mexican-chocolate.js
      to: "mexicanChocolateV3.parentVersionId"
      via: "MEXICAN_CHOCOLATE_V2_ID"
      pattern: "parentVersionId: MEXICAN_CHOCOLATE_V2_ID"
    - from: app/src/data/seed-recipes.test.js
      to: app/src/domain/historyRail.js
      via: "railEntries over the Mexican Chocolate group"
      pattern: "railEntries\\("
---

<objective>
Seed Mexican Chocolate v2 from Mark's Ice Ed export `~/Documents/Mexican Chocolate v2-2.ier` and fix the version chain to v1 -> v2 -> v3 -> v4, then bring the D-07 seed review (and the two planning files that still pin the old three-version reading) in line.

Purpose: Mark found the v2 export on disk (2026-09-25). Phase 03.5's D-01 kept v2 out because it was believed lost; that belief is now false, and the seed should carry the real v2 rather than a hole. Every one of Mark's 2026-09-25 decisions is locked: v2 from v2-2.ier only; v3's rows from IMG_2454 unchanged; chain v1 -> v2 -> v3 -> v4; v2 has no batch and no tasting; v2's carried-forward Notes become neither notes, reason, nor tasting; process/Instructions follow the v4 precedent; createdAt on 2026-01-11.

Output: mexicanChocolateV2 in the data module and the transcribed group, tests pinning it, an updated 03.5-SEED-REVIEW.md, a v2 sidecar entry, and D-01 amended in 03.5-CONTEXT.md and 03.5-09-PLAN.md.

Scope facts observed at planning time (2026-09-25), which the executor relies on:
- `app/src/store/seed.js` seeds olive oil only and never imports `transcribedRecipeGroups` (D-07 gate; wiring is plan 03.5-09, unexecuted, which itself moves DB_VERSION to 7). So no DB version, `STORE_SCHEMA_VERSION` or `MEXICAN_CHOCOLATE_SCHEMA_VERSION` bump and no migration are needed — no stored data changes (no live data exists either).
- The only test that pins the Mexican Chocolate version set is `app/src/data/seed-recipes.test.js` (grep over app/src at planning time); no UI test pins a count of three. Baseline: 13 tests pass.
- v4's parent is already `mexican-chocolate-v3` — no change to v4.
- `~/Documents/Mexican Chocolate v2-2.ier` has no `SavedAt` and no `RecipeId`; its file modification time is 2026-01-11 18:22:38 −05:00 (= 2026-01-11T23:22:38Z). Its Notes are byte-identical to `~/Documents/Mexican Chocolate v1.ier`'s. `~/Documents/Mexican Chocolate v2.ier` equals `~/Documents/Mexican Chocolate v1.ier` apart from `Recipe.Name`. `~/Documents/Mexican Chocolate v1.ier` has the same 11 rows and coefficients as `~/Desktop/Ice Cream/Mexican Chocolate v1.ier`; only its Notes differ (60 minutes, not 45).
- The app treats a cited batch as the parent's: `app/src/ui/RecipePage.jsx` (comment near line 793: "the batch itself lives on the parent") and `app/src/ui/VersionRow.jsx` near line 314 routes the From batch link through `version.parentVersionId`. Re-parenting v3 to v2 (which has no batch) therefore forces v3's `citedBatchId` to `null`. This is the one state the model forces; it is surfaced here and flagged in the review, not decided silently.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@.claude/CLAUDE.md
@app/src/data/mexican-chocolate.js
@app/src/data/seed-recipes.js
@app/src/data/seed-recipes.test.js
@app/src/domain/historyRail.js
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md

<interfaces>
From app/src/domain/historyRail.js:
- railEntries(versions, allBatches, { currentVersionId, draft = null }) -> entries oldest first, each { id, dateWords, name, stateWords, churned, inView, latest, isDraft }. name is versionIdentity's "Version N · label" (N counted by createdAt). stateWords is 'not yet churned' for a version with no batch, with ' · Latest' appended only on the newest version.

From app/src/domain/lastEvent.js: standingFor(batches) and NOT_YET_CHURNED — already imported by seed-recipes.test.js.

From app/src/data/mexican-chocolate.js: embed(ingredientName, ingredient, fields) (module-private), KITCHEN_EQUIPMENT, MEXICAN_CHOCOLATE_SCHEMA_VERSION (5), MEXICAN_CHOCOLATE_V1_ID, MEXICAN_CHOCOLATE_V1_BATCH_ID, MEXICAN_CHOCOLATE_V3_ID, mexicanChocolateV1/V3/V4, mexicanChocolateV1Batch, mexicanChocolateV3Batch.

Library keys used by v2 (all already exist in app/src/data/library.js): wholeMilk33, cocoaPowder, sucrose, dextrose, fructose, skimMilkPowder, salt, heavyCream, vanillaExtract, stabilizerMix4421, cinnamon, allulose.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Mexican Chocolate v2 end to end — data module, transcribed group, and the chain read back through validation, balance and the History rail</name>
  <files>app/src/data/seed-recipes.test.js, app/src/data/mexican-chocolate.js, app/src/data/seed-recipes.js</files>
  <behavior>
    - mexicanChocolateV2.rows has 12 entries whose ingredientName and summed portion grams are, in order: 'Whole Milk 3.3%' 427, 'Cocoa Powder' 30, 'Sucrose' 50, 'Dextrose' 35, 'Fructose' 5, 'Dried Skimmed Milk Powder' 39, 'Salt' 1, 'Cream, heavy' 140, 'Vanilla Extract' 7, 'Stabilizer Mix 4421' 2.2, 'Cinnamon' 2.6, 'Allulose' 50.
    - mexicanChocolateV2 has id 'mexican-chocolate-v2', versionLabel 'v2', recipeId 'mexican-chocolate', parentVersionId mexicanChocolateV1.id, parentVersionLabel 'v1', reason null, citedBatchId null, createdAt '2026-01-11T23:22:38.000Z', process { pasteuriseC: 75, holdMinutes: 60 }, iceEd { style: 'Gelato', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.2993 }.
    - mexicanChocolateV2.method deep-equals mexicanChocolateV4.method (the v4 precedent, Mark 2026-09-25).
    - Chain: v2's parent is v1, v3's parent is v2 (parentVersionLabel 'v2'), v4's parent is v3; each parentVersionLabel equals its parent's versionLabel.
    - The Mexican Chocolate group's version ids are exactly ['mexican-chocolate-v1', 'mexican-chocolate-v2', 'mexican-chocolate-v3', 'mexican-chocolate-v4'] in that order, with createdAt strictly ascending.
    - railEntries(group.versions, group.batches, { currentVersionId: mexicanChocolateV4.id }) names are ['Version 1 · v1', 'Version 2 · v2', 'Version 3 · v3', 'Version 4 · v4']; the v2 entry has churned false and stateWords 'not yet churned'.
    - No batch in the flattened groups has versionId 'mexican-chocolate-v2' (no batch, so no tasting).
    - Invariant across every transcribed version: when citedBatchId is non-null, a batch with that id exists in the flattened batches and its versionId equals the citing version's parentVersionId (holds for Coconut v2 today; forces v3's citedBatchId to null).
    - The existing store-file validation, finite-balance and no-HTML tests keep passing with v2 included (they iterate every version automatically).
  </behavior>
  <action>
Implements Mark's 2026-09-25 decisions, which amend phase 03.5 D-01 (v2 found on disk) and extend D-02 (sources). Tests first, then data.

RED — in app/src/data/seed-recipes.test.js:
1. Add mexicanChocolateV2 to the existing import from './mexican-chocolate.js', and import railEntries from '../domain/historyRail.js' (a domain module — the file stays free of repository/idb imports).
2. Add a describe block for mexicanChocolateV2 (title naming the v2-2.ier export and Mark 2026-09-25) holding the row-order/grams test (same shape as the existing mexicanChocolateV4 row test: an expected [name, grams] table, toHaveLength(12), toBeCloseTo(grams, 5)), the record-fields test, and the method-deep-equals-v4 test from the behavior list.
3. Replace the existing 'Mexican Chocolate lineage' describe — both its tests, including the one that forbids any Mexican Chocolate version from being named v2 — with a describe titled 'Mexican Chocolate lineage (v1 -> v2 -> v3 -> v4)' holding the chain test, the ordered-ids-and-ascending-createdAt test, and the railEntries names/v2-state test from the behavior list. Read the group with transcribedRecipeGroups.find on recipe.id 'mexican-chocolate', as the old test did.
4. In the 'Mexican Chocolate v1/v3 batches' describe (retitle it to cover v2 as well), add the v2-has-no-batch test and the cited-batch-lives-on-the-parent invariant test.
5. Run the focused test and confirm it fails because mexicanChocolateV2 is not exported yet.

GREEN — in app/src/data/mexican-chocolate.js (match the file's existing style; every change traces to v2 or the chain):
1. Header comment (lines 1–6): name v1, v2, v3 and v4, and add v2's source, ~/Documents/Mexican Chocolate v2-2.ier (Ice Ed export).
2. Insert a v2 block after mexicanChocolateV1Batch and before the v3 comment block (chronological order). Lead with a comment stating: source v2-2.ier (Recipe.Name "Mexican Chocolate v2", file saved 2026-01-11); ~/Documents/Mexican Chocolate v2.ier is v1 saved under the v2 name before any edit and is not a source; no binder page and no churn evidence, so no batch and no tasting; the Notes are v1's text carried forward by Ice Ed, so process and Instructions follow the v4 precedent and the Observations/to-fix text goes only to the sidecar (03.5-SEED-REVIEW.md, Mexican Chocolate v2, judgement calls 26–28).
3. Export const MEXICAN_CHOCOLATE_V2_ID = 'mexican-chocolate-v2' and export const mexicanChocolateV2, keys in the same order as mexicanChocolateV1: schemaVersion MEXICAN_CHOCOLATE_SCHEMA_VERSION; id MEXICAN_CHOCOLATE_V2_ID; recipeId 'mexican-chocolate'; parentVersionId MEXICAN_CHOCOLATE_V1_ID; parentVersionLabel 'v1'; reason null; citedBatchId null (per Mark: the carried Notes do not become a reason/Why); createdAt '2026-01-11T23:22:38.000Z' with a comment saying it is the .ier file's own modification time (2026-01-11 18:22:38 −05:00) because the file carries no save timestamp; versionLabel 'v2'; coefficientSetId '2026.1-slice-transcription'; coefficientSetName 'coefficient set 2026.1 (slice transcription)'; sheetTitle 'Mexican Chocolate'; sheetDescription ''; rows — 12 rows built with embed() exactly like v1's, ids 'row-01' to 'row-12' in the .ier's own order: 'Whole Milk 3.3%' library.wholeMilk33 427; 'Cocoa Powder' library.cocoaPowder 30; 'Sucrose' library.sucrose 50; 'Dextrose' library.dextrose 35; 'Fructose' library.fructose 5; 'Dried Skimmed Milk Powder' library.skimMilkPowder 39; 'Salt' library.salt 1; 'Cream, heavy' library.heavyCream 140; 'Vanilla Extract' library.vanillaExtract 7; 'Stabilizer Mix 4421' library.stabilizerMix4421 2.2; 'Cinnamon' library.cinnamon 2.6; 'Allulose' library.allulose 50 — each with portions [{ step: 1, grams: N }] and removed false. No library entry is added or edited. equipment KITCHEN_EQUIPMENT; process { pasteuriseC: 75, holdMinutes: 60 }; iceEd { style: 'Gelato', servingTemperatureC: -16, hardness: 0.75, overrunPercent: 0.2993 } (Recipe.Overrun 0.2992666… rounded to 4 decimals, as v1 and v4 do); declaredAxes []; declaredFlaw null; method — written out literally (not shared by reference with v4), the same two steps v4 carries: step 1 leadIn 'Cayenne and sous vide', instruction 'Add a pinch of cayenne pepper. Sous vide for 60 minutes at 75 °C.', targets temp '75 °C' and hold '60 min', removed false, uses 'row-01' through 'row-12'; step 2 leadIn 'Chill and churn', instruction 'Chill the base overnight, then churn.', targets [], aside 'Very thick by morning. Takes 40+ minutes to churn.', removed false, uses []; authored { beforeYouStart: [] }. Do not create a v2 batch or tasting.
4. mexicanChocolateV3: parentVersionId becomes MEXICAN_CHOCOLATE_V2_ID and parentVersionLabel 'v2' (Mark 2026-09-25). citedBatchId becomes null — forced, not chosen: the app keeps a cited batch on the parent version (RecipePage.jsx's cited-batch comment; VersionRow.jsx routes the From batch link through parentVersionId) and v2 has no batch. Leave reason exactly as written (Mark's call — flagged in the review's judgement call 14 amendment and open question 8). Update the v3 comment block and the comment above reason so they name v2 as the parent and say why citedBatchId is null. Do not touch v3's rows, process, iceEd or method; do not touch v1, v1's batch, v3's batch or v4. MEXICAN_CHOCOLATE_V1_BATCH_ID stays exported (v1's batch still uses it).

In app/src/data/seed-recipes.js: import mexicanChocolateV2 and make the Mexican Chocolate group's versions [mexicanChocolateV1, mexicanChocolateV2, mexicanChocolateV3, mexicanChocolateV4]; batches unchanged.

Do not import anything into app/src/store/seed.js and do not change any DB, store or version-schema constant (see objective: the transcribed groups are not wired in until plan 03.5-09).

Run the focused test, then the full suite; both pass. Commit (English message).
  </action>
  <verify>
    <automated>npm --prefix app test -- src/data/seed-recipes.test.js && npm --prefix app test && test "$(grep -c "MEXICAN_CHOCOLATE_V2_ID" app/src/data/mexican-chocolate.js)" -ge 3 && D=$(git diff -U0 bf8533c -- app/src/data/mexican-chocolate.js) && test -n "$D" && test "$(printf '%s\n' "$D" | grep -c "^-.*id: 'row-")" -eq 0 && S=$(git diff --name-only bf8533c -- app/src/store) && test -z "$S"</automated>
  </verify>
  <done>The focused test file and the full suite pass; mexicanChocolateV2 is exported and in the group between v1 and v3; v3's parent is v2 with citedBatchId null and its rows untouched (no removed row line in the diff); nothing under app/src/store changed.</done>
</task>

<task type="auto">
  <name>Task 2: Bring the seed review, the sidecar, plan 03.5-09 and D-01 in line with the four-version chain</name>
  <files>.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md, Ice Cream Log Pages/seed-transcription-sidecar.json, .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md, .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md</files>
  <action>
Per Mark's 2026-09-25 decisions (amending D-01, extending D-02). Use Edit for every change; keep every other line of each file as it is. Judgement calls in the review currently run to 25, so v2's are 26, 27 and 28.

A. 03.5-SEED-REVIEW.md
1. Sources table: insert, directly after the Mexican Chocolate v1 row, the row: | Mexican Chocolate v2 | `~/Documents/Mexican Chocolate v2-2.ier` | Ice Ed export |
2. Mexican Chocolate v1 section: after the **Source:** paragraph, add one paragraph: `~/Documents/Mexican Chocolate v1.ier` is the same recipe — the same 11 rows and coefficients as the Desktop export — saved later with Notes whose sous-vide line reads 60 minutes instead of the typed 45; it is not a separate source, and the version keeps the Desktop export's typed 45 minutes (judgement call 8).
3. Insert a new section "## Mexican Chocolate v2" between the v1 section's closing rule and "## Mexican Chocolate v3", in the v1/v3/v4 format, ending with its own "---" rule:
   - **Source:** `~/Documents/Mexican Chocolate v2-2.ier` (Ice Ed export, Recipe.Name "Mexican Chocolate v2", file saved 2026-01-11 18:22 −05:00; the file carries no SavedAt and no RecipeId). Parent: v1. No binder page and no churn evidence — no batch, no tasting (Mark, 2026-09-25). `~/Documents/Mexican Chocolate v2.ier` is v1 saved under the v2 name before any edit (identical apart from Recipe.Name) and is not a source. `Mexican Chocolate v3.ier`, `v4.ier` and `v4-2.ier` in ~/Documents are not used: v3 keeps the binder photo's rows (they differ from v3.ier; the photo wins), and v4-2 matches the Downloads v4 export already transcribed.
   - ### Field-by-field — the three-column table, one row each for: Recipe.Name "Mexican Chocolate v2" → versionLabel 'v2', recipe stays "Mexican Chocolate" → version.versionLabel; Recipe.Type "Gelato" → iceEd.style; Recipe.ServingTemperature -16 → iceEd.servingTemperatureC; Recipe.Hardness 0.75 → iceEd.hardness; Recipe.Overrun 0.2992666666666666 → iceEd.overrunPercent 0.2993 (rounded to 4 decimals, as v1 and v4); file modification time 2026-01-11 18:22:38 −05:00 → createdAt 2026-01-11T23:22:38.000Z; Notes "Sous Vide for 60 minutes @ 75C" → process { pasteuriseC: 75, holdMinutes: 60 } and step 1 targets (v4 precedent); Notes "1 Pinch of Cayenne Pepper" → step 1 instruction; Notes "Chill Base overnight" / "(very thick in morning)" / "40+ minutes to churn" → step 2 instruction and aside (v4 precedent); Notes "Observations: sweetness is good / hard straight from freezer" and the to-fix list → **not transcribed onto v2** → sidecar (staleNotesText, flagged); Recipe.Ingredients[] (12 rows, Amount) → mexicanChocolateV2.rows (12 rows, same order and grams) → version.rows; per-ingredient kcal → not modeled → sidecar (kcalPer100gByIngredient); a final row "— (no binder page, no churn evidence)" → no batch, no tasting.
   - ### Ingredient mapping — one sentence: every row maps to the library entry v1, v3 and v4 already use for that name (Allulose, Stabilizer Mix 4421 and Cinnamon included); no library entry is added or edited.
   - ### Judgement calls — 26: createdAt is the file's own modification time converted to UTC, since the .ier carries no save timestamp; it falls on 2026-01-11 in both −05:00 and UTC and orders v2 between v1 (printed 12/12/25) and v3 (printed 1/13/26). 27: process and Instructions follow the v4 precedent — the carried Notes' process lines give the same process and the same two steps v4 has, step 2's aside included; the Observations and to-fix text is v1's, carried forward by Ice Ed (identical to ~/Documents/Mexican Chocolate v1.ier's Notes), and becomes no note, no reason, no tasting and no battery mark on v2 — reason and citedBatchId stay null (Mark, 2026-09-25). 28: with no batch recorded, History reads v2 "not yet churned"; that is the app's reading of "no batch recorded", not evidence v2 was never made.
4. Mexican Chocolate v3 section: in the **Source:** line change "Parent: v1." to "Parent: v2.". Append to judgement call 14: **Amended 2026-09-25 (v2 added):** v3's parent is now v2, which has no batch, so citedBatchId is null — the app keeps a cited batch on the parent and routes its From batch link through parentVersionId, so v1's batch can no longer be cited from v3. reason is left as written, pending Mark: v2's own numbers follow the to-fix list (stabilizer 5 → 2.2 g, cream 67 → 140 g, dextrose 86 → 35 g, allulose +50 g) while v3 moves partly back (dextrose 35 → 45 g, allulose 50 → 36.8 g), so the list now reads as the step from v1 to v2 rather than from v2 to v3. See open question 8.
5. Replace the whole paragraph under v3's "### History" heading with: The rail shows four versions for Mexican Chocolate — v1, v2, v3, v4 — oldest first. The app counts versions by createdAt, so History reads "Version 1 · v1", "Version 2 · v2", "Version 3 · v3", "Version 4 · v4": the app's count and the source names now agree. v2 and v4 read "not yet churned" (no batch is recorded for either).
6. States coverage table: insert, directly after the Mexican Chocolate v1 row: | Mexican Chocolate | v2 | Not yet churned | `Mexican Chocolate v2-2.ier` — an Ice Ed export with no binder page and no churn evidence; no batch recorded |
7. Open questions: in question 1 change "Mexican Chocolate v1/v3/v4" to "Mexican Chocolate v1/v2/v3/v4"; in question 3 change "Mexican Chocolate v3's and v4's own" to "Mexican Chocolate v2's, v3's and v4's own". Append question 8: **Judgement call 14, amended (v3's reason under parent v2).** v3's reason is still v1's to-fix list, which now describes the step from v1 to v2. Keep it on v3, clear it to null, or confirm another reading — v2 carries no reason by your 2026-09-25 decision.

B. Ice Cream Log Pages/seed-transcription-sidecar.json — the file is hand-formatted (some arrays and objects inline), so insert text with Edit; never re-serialize the whole file. Insert a "mexican-chocolate-v2" entry between the "mexican-chocolate-v1" and "mexican-chocolate-v3" entries, indented like the v4 entry: "source": "Mexican Chocolate v2-2.ier (Ice Ed export, ~/Documents; Recipe.Name \"Mexican Chocolate v2\")"; "fields": { "kcalPer100gByIngredient" in the .ier's row order — Whole Milk 3.3% 0.61, Cocoa Powder 2.28, Sucrose 3.85, Dextrose 3.66, Fructose 3.98, Dried Skimmed Milk Powder 3.55, Salt null, Cream, heavy 3.4, Vanilla Extract 2.88, Stabilizer Mix 4421 5.127, Cinnamon null, Allulose 0.2; "staleNotesText" — copy the v4 entry's staleNotesText string exactly (v2's Notes carry the identical text); "staleNotesFlag" — Carried forward by Ice Ed from Mexican Chocolate v1's Notes (identical to ~/Documents/Mexican Chocolate v1.ier's own Notes). v2 has no binder page and no churn evidence, so none of this text is v2's own result — it is not stored as an authored note, a reason, a tasting or a battery mark on this version. See 03.5-SEED-REVIEW.md, Mexican Chocolate v2, judgement call 27. } (write the em dash as —, as the v4 flag does). No iceEdRecipeId: the .ier has none.

C. .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md — plan 09 is unexecuted and still instructs its executor to assert the old three-version reading and to fix data, never assertions, if one fails; left alone it would delete v2. Replace these lines whole (read the file first; keep indentation and quoting):
- line 34 (must_haves truth): - "The seeded store holds Mexican Chocolate as v1 -> v2 -> v3 -> v4 (D-01 as amended 2026-09-25, quick 260925-kix). On the History rail it reads as four nodes in order, 'Version 1 · v1' through 'Version 4 · v4'."
- line 43 (seed-coverage.test.js provides): provides: "the seeded set's invariants: D-01 lineage (v1 -> v2 -> v3 -> v4), D-05 standings, validation, finite figures, recipe resolution, routes"
- line 103: after "Plan 03 wrote Mexican Chocolate v1/v3/v4" insert " (quick 260925-kix then added v2 from `~/Documents/Mexican Chocolate v2-2.ier` and made the chain v1 -> v2 -> v3 -> v4)", and replace the last list item before ". Nothing is in seed.js yet." (the quoted rail name pairing v3 with ordinal 2) with "the four-version History rail".
- line 164 (Task 3 name): <name>Task 3: The seeded set's invariants — Mexican Chocolate reads v1 to v4, every standing is covered, and every record validates, computes and routes</name>
- line 171: - The Mexican Chocolate versions in seedRecipeGroups are exactly the ids mexican-chocolate-v1, -v2, -v3 and -v4. v2's parent is v1, v3's parent is v2 and v4's parent is v3. railEntries over them yields four entries whose names are 'Version 1 · v1', 'Version 2 · v2', 'Version 3 · v3' and 'Version 4 · v4' (or the labels Mark approved) (D-01 as amended 2026-09-25).
- line 177: change its second sentence to "Where Mark's approved labels differ from v1, v2, v3 and v4, assert the approved labels." — drop the clause after it about keeping an assertion against a v2; the rest of the line stays.
- line 188: in the human-check, "/notebook/mexican-chocolate opens v4 with" becomes "/notebook/mexican-chocolate opens v4 with a four-node rail, v1 to v4, and Coconut v2's log reads churned, not yet tasted." (replacing the old rail description through the end of that sentence).
- line 190 (Task 3 done): "The seeded set is proven to hold Mexican Chocolate's v1 -> v2 -> v3 -> v4 chain, to cover every standing, and to validate, compute and route, and the human-check is queued for end-of-phase UAT."

D. .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md — keep D-01's original text (it is the decision record) and add one nested bullet directly beneath it: **Amended 2026-09-25 (Mark, quick 260925-kix):** v2 exists after all — `~/Documents/Mexican Chocolate v2-2.ier` (Ice Ed export, saved 2026-01-11) — and is seeded as v2 with parent v1; v3's parent is v2; the chain is v1 → v2 → v3 → v4 and History shows four versions. Nothing is made up: v2 carries no batch and no tasting, and its carried-forward Notes become no note, reason or tasting.

Commit (English message).
  </action>
  <verify>
    <automated>R=.planning/phases/03.5-separate-the-recipe-from-the-sheet; test "$(grep -c '^## Mexican Chocolate v2$' $R/03.5-SEED-REVIEW.md)" -eq 1 && test "$(grep -c '^| Mexican Chocolate v2 | ' $R/03.5-SEED-REVIEW.md)" -eq 1 && test "$(grep -c '^| Mexican Chocolate | v2 | Not yet churned |' $R/03.5-SEED-REVIEW.md)" -eq 1 && test "$(grep -c 'zero handwriting). Parent: v2.' $R/03.5-SEED-REVIEW.md)" -eq 1 && test "$(grep -c 'Version 4 · v4' $R/03.5-SEED-REVIEW.md)" -ge 1 && test "$(grep -c 'Documents/Mexican Chocolate v1.ier' $R/03.5-SEED-REVIEW.md)" -ge 1 && test "$(grep -c 'missing from both' $R/03.5-SEED-REVIEW.md)" -eq 0 && test "$(grep -c 'Version 2 · v3' $R/03.5-SEED-REVIEW.md $R/03.5-09-PLAN.md | awk -F: '{s+=$2} END {print s}')" -eq 0 && test "$(grep -c 'no.v2' $R/03.5-09-PLAN.md)" -eq 0 && test "$(grep -c 'gap' $R/03.5-09-PLAN.md)" -eq 0 && test "$(grep -c 'mexican-chocolate-v1, -v2, -v3 and -v4' $R/03.5-09-PLAN.md)" -eq 1 && test "$(grep -c 'Amended 2026-09-25 (Mark, quick 260925-kix)' $R/03.5-CONTEXT.md)" -eq 1 && node -e "const d=JSON.parse(require('fs').readFileSync('Ice Cream Log Pages/seed-transcription-sidecar.json','utf8'));const m=d['mexican-chocolate'];const k=Object.keys(m).join();if(k!=='mexican-chocolate-v1,mexican-chocolate-v2,mexican-chocolate-v3,mexican-chocolate-v4')throw new Error(k);const f=m['mexican-chocolate-v2'].fields;if(f.staleNotesText!==m['mexican-chocolate-v4'].fields.staleNotesText)throw new Error('staleNotesText');if(Object.keys(f.kcalPer100gByIngredient).length!==12)throw new Error('kcal')"</automated>
  </verify>
  <done>The review has the v2 source row, the v2 section (judgement calls 26–28), the v1 Documents-export note, v3's parent as v2 with judgement call 14 amended, the four-version History paragraph, the v2 states row and open question 8; the sidecar parses with a v2 entry between v1 and v3; plan 03.5-09 and D-01 describe the v1 -> v2 -> v3 -> v4 chain; every gate in the verify command holds.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Ice Ed export -> app data | Text from an external file (Notes carry HTML markup) is transcribed by hand into app records that later render on screen |
| Source record -> version record | Carried-forward text could be mistaken for this version's own result |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-kix-01 | Tampering | mexicanChocolateV2 strings | medium | mitigate | Notes' `<div>` markup is never copied; only plain step text is written, and seed-recipes.test.js's existing no-HTML test iterates every version including v2; notes render as text, never markup (project convention) |
| T-kix-02 | Repudiation | v2 record integrity (whose words these are) | medium | mitigate | v2 carries reason null, citedBatchId null and no batch/tasting — pinned by Task 1 tests; the carried Observations text goes only to the sidecar with a flag naming its v1 origin |
| T-kix-03 | Tampering | plan 03.5-09 reinstating the old reading | medium | mitigate | Task 2 rewrites plan 09's truths/tests/human-check and amends D-01, so plan 09's "fix the data, never the assertion" rule cannot delete v2 |
| T-kix-SC | Tampering | package installs | low | accept | No package is installed by this plan |
</threat_model>

<verification>
- `npm --prefix app test` passes (full suite).
- `transcribedRecipeGroups`' Mexican Chocolate group lists v1, v2, v3, v4 and the History rail names them Version 1–4 with matching labels.
- `git diff --name-only bf8533c -- app/src/store` is empty (bf8533c = HEAD at planning time; nothing wired in; no DB/schema bump).
- Task 2's verify gates all hold.
</verification>

<success_criteria>
- The seed data has four Mexican Chocolate versions chained v1 -> v2 -> v3 -> v4; v2 carries exactly the v2-2.ier rows, no batch, no tasting, no reason.
- v3's rows are unchanged; the forced citedBatchId change and the open reason question are flagged for Mark in the review.
- The review, sidecar, plan 03.5-09 and D-01 all describe the four-version chain; no planning file still tells an executor Mexican Chocolate has no v2.
</success_criteria>

<output>
Create `.planning/quick/260925-kix-seed-mexican-chocolate-v2-from-the-v2-2-/260925-kix-SUMMARY.md` when done.
</output>
