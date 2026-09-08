---
version: 1
slug: "route-recipe-batch"
primary_target: "route:/recipe/batch"
related_targets: ["route:/recipe","route:/print/recipe-sheet"]
---

# Surface brief — Recording a batch

**Mode:** Operate. **Status:** shaped 2026-09-06; confirmed by Mark 2026-09-06; revised 2026-09-06 after the GSD Phase 2 discussion and confirmed by Mark 2026-09-06; revised 2026-09-07 after the BatchMargin critique; revised 2026-09-08 after the whole-page critique (`.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md`): the date field, Escape, focus return, field widths, and the record's prose face — the date-field and Escape choices made by Mark 2026-09-08; the controls moved to the imprint with the save pair repeated at the foot; confirmed by Mark 2026-09-08. **Target:** the pen layer of `route:/recipe`, reached from the recipe page and addressable per saved batch. Related: `route:/recipe` (the reading state this layer lands in; its brief is `route-recipe.md`) and `route:/print/recipe-sheet` (this brief owns what the printed batch-log page's fields say; Phase 4 owns its geometry). This brief feeds GSD Phase 2; its decisions are recorded in `.planning/phases/02-record-the-first-batch/02-CONTEXT.md`.

Product truth: `PRODUCT.md` and `product-requirements/03-decision-register.md`. Requirement IDs: `.planning/REQUIREMENTS.md`. Primary evidence: the five photographs of the 2 Aug 2026 sheet (`~/Downloads/IMG_2485–2489.HEIC`) and the churn-log audit (`Ice Cream Log Pages/sprinkles-churn-log-binder-audit.md`).

## 1. Job and audience

Mark, at the desktop, days after churning, with the annotated sheet in hand. The ice cream is in the freezer and the sheet carries ink in three places: written-over grams on the formula page, a struck step and changed values on the method pages, and the batch log on the last page. He is transcribing, not composing. The binder's finding sets the stakes: 14 of 29 churned batches left no result, and silence there means nothing in either direction. The job is to get the record in while it is still true, in about the time it took to write it.

Two later arrivals: reopening the batch weeks on, while developing version 2 (Phase 3 cites it as the change reason), and adding a tasting after the batch was saved, because draw notes are written at the machine and tasting happens a day later, sometimes more than once.

Transcription is by hand in milestone 1 (Mark, 2026-09-06). Nothing is parsed, inferred, or read from a photograph: TRUST-01 forbids model calls without a policy, and the audit's own conclusion was not to build a return path for the prose. What the product does instead is make the return cheap: the sheet only asked for ink where reality differed, and this surface only asks for the same.

Desktop only in Phase 2 (Mark, 2026-09-06). The layer stacks with the page below 1280 as Phase 1 does, but the phone receives no design and no testing here.

## 2. Outcome and proof

Primary task: record the 2 Aug batch against the churned version by transcribing the sheet's ink in the sheet's order, and save it. A second task closes the loop: reopen the batch and read plan, actual, and result together, unchanged.

Success is the roadmap's Phase 2 criteria: BATCH1-01, BATCH1-02, BATCH2-01, BATCH2-02, OBS1-01, plus UX1-01 for keyboard and contrast.

Proof content is the real ink, read from the photographs and confirmed by Mark in the Phase 2 discussion (2026-09-06):

- Formula page: churn date 8/2/2026 in the corner. Whole milk 370.4 → 383 (written as 120 g + 263 g). Heavy cream 252.8 struck, 241 beside it. Olive oil 40, with "Actually 45 g" on page four, written during the churn. Sucrose written as 12 g + 64 g and the gum rows bracketed "+12 g sugar + 120 g milk", both matching the plan. The soy lecithin row struck with "→ Drizzle" beside it: the lecithin was skipped, so its as-made is 0 g. A mise-en-place tick on every row.
- Method pages: step 1 struck through (skipped). Step 3's amounts overwritten to match the table; the as-made column carries that, and step 3 records nothing of its own. Step 8's blend 45 s overwritten 60. Step 9 annotated "Fast, Soft, Prechill 15 min" (Whynter machine settings), with "Speed Δ @ 20 minutes / Really thick @ 24 minutes / Full churn 30 minutes" below the page: the machine's speed was changed at 20 minutes.
- Batch log page, which folds two events onto one page: the churn and an undated first tasting. "Date / oil bottle open date" 7/24/2026. Cream butterfat blank. Come-up ~20 minutes against a plan of 10–12. Draw temperature −6. Overrun "?". Draw notes "Soft, Not greasy". Then the tasting: at −12 °C; oil character 4.5, bitterness 5, sweetness 4, on the printed 1–5; meltdown at 20 min "54 − 51 = 3"; no date and no words.

Product-specific truth the surface must show, not claim: the plan is never edited while recording and never copied into the record; a blank stays blank and reads as unknown in words; the record is the maker's and is painted as such; a batch that has not been tasted yet says so, so silence becomes a value.

## 3. Selected direction

**Visual authority:** `DESIGN.md` as recorded from Phase 1, the Formulation Cookbook, with the three inherited rules binding: the Two-Ink Rule, the No-Verdict Rule, the Bookcloth Rule. Pen blue, defined and unused since Phase 1, is first painted here. No new world, no palette change, no new face.

**Thesis: recording a batch is writing on the page you printed.** The recipe page does not gain a form; its pen layer becomes writable, in the sheet's page order, and the ink lands in the three places it landed on paper. The surface refuses the recipe-app arrangement of a "log a batch" wizard with steps and progress, and the calculator's spreadsheet of every field at once. It refuses, just as firmly, to make the maker type the plan back in.

**Structural thesis, three places for ink.**

- **Ingredient table: an as-made column.** A blue column beside grams, blank by default. The maker types only where reality differed (383, 241, 45, and 0 on the skipped lecithin row). Blank means nothing was written, and stays blank in reading; 0 is a written value and reads as one; the plan beside it stays black. No per-row tick in Phase 2: the tick was the sheet's confirmation ritual and belongs to paper. The column's arrival is when the table's numeric columns right-align and size to content, a total row lands (plan total, and an as-made total that sums the as-made where written and the plan elsewhere, labelled as such), and a row under 0.05% reads "trace" or a further decimal (carried from the Phase 1 critique in `STATE.md`).
- **Method: strike or change, per step.** Each step gets a strike (skipped) and one blue line for what was done differently, in the maker's words ("blend 60 s"; "Fast, Soft, Prechill 15 min. Speed Δ @ 20 min, really thick @ 24, full churn 30"). A struck step reads struck, its prose intact. Nothing is pre-filled from the method: an unwritten step stays unknown, never "done as written" (BATCH-01). A step whose amounts changed only because the table did carries no line; the as-made column already says it.
- **Margin: the batch log leads the margin, as a churn section and its tastings.** Above the advisories and the authored notes, in the printed page's order. The churn date lives in the headnote's version line, in the slot that already prints the date after the version label; the margin's **churn section** begins with the measured values, come-up first, with a unit on every label (come-up, min; draw temperature, °C; overrun, %); then draw notes; then an optional ingredient-notes line in the maker's words for facts like the oil bottle's open date; then a next-time note, labelled as intention (Mark, 2026-09-07). Beneath it, **one tasting section per tasting**, each headed by its date (or "date unknown" in ink when none was written): tasting temperature, °C; the marks; meltdown at 20 min, g lost; the words; a next-time note, labelled as intention. A measured field left blank reads as the word "unknown" in ink, never a value from the recipe.

**Dimensions (Mark, 2026-09-06: fixed core axes plus declared).** Four core axes always present in every tasting: hardness, scoopability, smoothness, sweetness, each with the earlier attempt's behavioural anchor words at the ends ("spoon sinks … spoon won't enter"; "crumbles … rolls clean"; "grainy … no crystal felt"; "flat … dominant"), never adjectival. Beneath them the version's declared axes with anchors authored on the version; the olive oil version declares olive oil character ("can't find it … tastes of oil first") and bitterness ("none … catches the throat"), so the sheet's three tasting lines all have a home. Marks on 1–5 with half steps, as the sheet was written. Any axis may stay unmarked. No overall rating (D12).

**Silence becomes a value.** A batch can be saved before it has been tasted, because the sheet is written in two sittings. Until a tasting exists, the margin says "not yet evaluated" in ink and offers to add one. A tasting saves with its words or its marks, whichever the maker has; the words field offers one shortcut, "as expected, nothing to note", that writes those words, so the audit's two kinds of silence, untasted and tasted with nothing to say, take one tap to tell apart.

**The ceremony.** "Record a batch" is a control in the margin, in the binder's button style. It opens the pen layer: the headnote's "churned ___" slot becomes the writable date field and focus lands there, the as-made column appears, each step gains its strike and line, and the churn section appears starting at its measured values. Everything the maker types is pen blue inside a hairline ink field. "Save batch" is explicit. Saving snapshots the version's rows and coefficients (BATCH2-01), returns the page to reading, and leaves the record in place: still blue, because it is the record, but now text with no field around it — the saved state prints the open batch's date in that same headnote slot. Form carries state; colour never changes on save. The version line under the recipe name then names the open batch's date, never the print date and never a count (Phase 1 D-13; not the version's latest churn — an older batch opened by URL reads its own date) (Mark, 2026-09-07). "Add a tasting" is the same ceremony on a smaller field: a dated tasting section opens in the margin, is written, and is saved.

**Reopening and amending.** A saved batch is addressable at `/recipe/:id/batch/:batchId`, under the version it was made against, so Phase 3's change reason can cite it and the reading state can be reached by URL; the batch's id is opaque and its churn date is its name. A version's page shows its latest batch by default; when a version has more than one, the margin lists them by churn date and choosing one swaps the layer. "Amend" reopens the pen layer with the record's values in the fields; saving again adds an amended-on date, the latest shown beside the churn date (Mark, 2026-09-06). Adding a tasting is not an amendment; it is a new dated section. The snapshot is never retaken.

**Deferred to a later phase (Mark, 2026-09-06):** the batch's as-made value as a second tick in pen blue on each graduated rule, with its own deviation in words. It follows from the snapshot and from the Two-Ink Rule, but no Phase 2 requirement names it. In Phase 2 the formulation note shows the plan's figures only. Also deferred: a blue "actual" beside each target chip in the method, until method amounts reference the ingredient rows (Phase 3); the per-step line carries it in words until then.

**Focal moment.** The spread after saving, looking like the photograph: 383 beside 370.4, 0 beside 1.2 on the struck lecithin row, step 1 struck, "−6 °C" and "Soft, not greasy" in the churn section, and below it a tasting headed "date unknown" with 4.5, 5, and 4 marked, all in one blue against the black plan.

**Raises carried from the recipe brief:** state changes weight and outline, never position or hue; every block wears its plain-language name; nothing moves on focus; one heavy element per view.

**Implementation consequence.** One component tree: the pen layer is a state of the recipe page's regions, not a second page or a modal. The batch record is a separate stored object that references the version and embeds the snapshot; it holds one churn section and a list of tastings; the version is never written to while recording. Blank is stored as absent, never as zero or as the plan's value; 0 is stored as 0. The printed batch-log page (Phase 4) draws its field list from this brief, prints the churn section and one dated tasting section, and prints every blue field as blank space.

## 4. Scope and boundaries

**Fidelity:** production-ready. **Breadth:** the pen layer on the recipe page, the churn section and tasting sections in the margin, the saved batch's reading state, reopen by URL, add a tasting, amend. **Interactivity:** full flow (start, transcribe, save, reopen, add a tasting later, amend).

**In:** as-made per row; strike or change per step; churn date; come-up, draw temperature, overrun; draw notes; an optional ingredient-notes line; a next-time note on the churn; tastings, each with an optional date, tasting temperature, the four core axes and the version's declared axes, meltdown loss, words, and a next-time note; the "as expected, nothing to note" shortcut; save; the not-yet-evaluated state; reopen; add a tasting after saving; amend with a dated amendment; the version line's latest churn date; the margin's "no batch yet" state; the total row, right-aligned sized numeric columns, and "trace" that arrive with the as-made column.

**Out, and named:** phone design and testing; a photograph attached to the batch; any parsing or inference from a photo; comparison across batches (LEARN-01); a structured "what to change" delta block (Phase 3's change reason is its home); as-made figures on the graduated rules and a blue "actual" per target chip (deferred, § 3); diagnosis (D07); the printed page's geometry (Phase 4); typed ingredient fields on the batch (the sheet's "oil bottle open date" and cream butterfat are ingredient facts; the free-text ingredient-notes line is their only home here); a rating control (D12); draft persistence across a reload (UX1-02, Phase 4); structured machine settings (a later recipe-side concern).

**Anti-goals:** no measured value pre-filled from the recipe; no as-made value copied from the plan; no colour on a deviation, a blank, or a mark; no required field on a tasting beyond one of its words or its marks; no wizard, stepper, or modal; no editing of the plan while recording; no taxonomy of defects standing in for the open field; no tasting date invented by the app.

## 5. States and ranges

| | Realistic range |
|---|---|
| Ingredient rows | 5–15; the working case has 12 |
| As-made entries per batch | 0–12; the working case has 4 (383, 241, 45, 0) |
| Method steps | 3–10; the working case has 10 |
| Struck or changed steps | 0–10; the working case has 1 struck and 2 changed |
| Churn measured values | 3, each possibly unknown; the working case has 1 unknown |
| Tastings per batch | 0–4; the working case has 1, undated |
| Tasting measured values | 2 (temperature, meltdown loss), each possibly unknown |
| Dimensions per tasting | 4 core plus 0–4 declared; the working case has 2 declared and 3 core unmarked |
| Tasting words | none, one line, or a short paragraph; the working case has none |
| Next-time note | 0–5 lines, on the churn and on each tasting |
| Batches per version | 0–3 in milestone 1; the working case has 1 |
| Amendments per batch | 0–3 |

**Material states:** no batch yet · recording, unsaved · a row's as-made blank · a row's as-made 0 · a step struck · a step changed · a measured value unknown · saved batch, reading · not yet evaluated (no tasting) · a tasting with marks and no words · a tasting with words and no marks · a tasting with no date · a second tasting added later · amended batch · reopened by URL · a version with two batches · leaving the page with an unsaved record · a batch whose version has since been superseded by version 2 (the record must read unchanged).

## 6. Interaction and layout

- **Hierarchy while recording:** the churn date in the headnote; the as-made column; the steps' strikes and lines; the churn section from come-up; the tasting section if one is being written; save. Reading order is the sheet's page order, and the tab order follows it: the headnote's churn date, then down the as-made column, then the steps top to bottom, then the churn section from come-up top to bottom, then each tasting top to bottom, then save. The six graduated rules leave the tab path while recording — they stay clickable and keep their focus treatment, but do not sit between the method and the churn section (Mark, 2026-09-07).
- **Topology:** one page; the pen layer is a state of it; a saved batch has a URL, `/recipe/:id/batch/:batchId`; no route for the recording state itself.
- **Fields:** hairline ink outline, no fill, no radius (no radius token exists); label in the grotesk with the unit in lowercase; typed text in pen blue in the grotesk for anything counted and in the text face for words. Numeric fields accept what the sheet says: come-up in whole minutes; draw and tasting temperature to a half degree with a leading sign; overrun in whole percent; meltdown loss in whole grams. Anything typed finer is kept as typed, never rounded, and the record shows what was entered. Blank is stored as absent.
- **Marks:** each axis is a labelled group of nine stops, 1 to 5 by halves, with its anchor words at the ends, operable by keyboard as a group (arrow keys move a half step, one click sets); a half step is a value, not a rounding.
- **Feedback:** saving states in words what was recorded and when ("recorded 4 Aug 2026 against 50 g oil · 800 g"); a tasting states its date, or "date unknown"; an amendment states its date the same way; nothing moves and nothing changes colour.
- **Leaving with unsaved ink:** the browser's own leave warning; no invented dialog.
- **Responsiveness:** designed and tested at 1280 and wider; below that the page stacks as Phase 1's grid does, and the churn and tasting sections stack with the margin.
- **Keyboard and contrast:** every field has a visible label and the shared focus outline; pen blue on ground meets AA (9.75:1); the strike control has a text label, not only a line.
- **Revised 2026-09-08 after the whole-page critique.** The controls leave the margin (Mark's direction; `route-recipe.md` § 3, "The imprint"): "Record a batch", "Record another batch", "Amend", "Add a tasting", the batch list and the churned date live in the imprint, the front-matter band beside the headnote, and so does each pen's ceremony — the churn date with "Save batch" and "Cancel", the tasting date with "Save tasting" and "Cancel". The margin holds the record's content only: the churn section's measured values, draw notes, ingredient notes and next-time note, then each tasting, in the sheet's order, as reading or as in-place fields while the pen is open, with no button among them. § 6's first bullet is read accordingly: the tab order runs imprint (churn date, save, cancel), as-made column, steps, churn section, tastings, then the same save and cancel pair repeated once at the foot of the page (Mark, 2026-09-08), so the sheet's order still ends at Save; the pair alone repeats, with the save gate's hint beside both. The churn-date and tasting-date fields stay the browser's own date input, with the calendar icon hidden; the browser's segment highlight is a named exception to the four-colour system (Mark, 2026-09-08). Escape closes the record or tasting pen only while it holds no ink, returning focus to the control that opened it; with ink, Cancel is the one exit (Mark, 2026-09-08). Saving or cancelling a batch returns focus to "Record a batch", "Record another batch" or "Amend", whichever opened the pen, as the tasting pen already returns to "Add a tasting". "Save batch" and "Cancel", and "Amend" and "Record another batch", are separated by the small gap, never by a space. A measured field is sized to what it holds — a number of three digits and a sign — not to the column; the words fields alone run the column's width. The record's own prose — draw notes, words, next-time notes, ingredient notes — reads in the text face when saved, as this section's "Fields" line already says, and the same face while being typed; only counted values sit in the grotesk. When the batch list first appears (a version's second batch) its links are ink. The "Skipped" checkbox of each step names its step ("Step 3, skipped"); the checkbox itself is drawn as the marks control's stops are, an ink square filled when checked. The "Batch" legend and the margin's region name are headings, so a screen reader's outline reaches the record.

## 7. Constraints and open decisions

**Binding**
- The Two-Ink, No-Verdict, and Bookcloth rules from `DESIGN.md`.
- The batch snapshots the version's rows and coefficients on first save and never retakes them (BATCH2-01, D04).
- No measured value, as-made amount, or step outcome is ever filled from the recipe (BATCH-01).
- A batch is one churn section plus zero or more tastings; a tasting saves with at least one of its words or its marks and nothing else is required; a batch may be saved with no tasting (OBS1-01, read with the two-sitting sheet; Mark, 2026-09-06).
- A tasting's date may be absent and then reads "date unknown"; the app never supplies one (Mark, 2026-09-06).
- Amendments are explicit and dated as a list; the original recording date stays; adding a tasting is not an amendment (BATCH-02; Mark, 2026-09-06).
- Transcription by hand; no parsing, no model call (TRUST-01; Mark, 2026-09-06).
- Desktop only (Mark, 2026-09-06).
- Keyboard-operable with visible labels and focus; text contrast at AA (UX1-01).

**Decided here, reflected in `PRODUCT.md`:** outcome dimensions are four fixed core axes plus recipe-declared axes (Mark, 2026-09-06). D12's rating question stays open.

**Resolved in the GSD Phase 2 discussion (2026-09-06; `02-CONTEXT.md` is the record)**
- The struck lecithin step and row: skipped, no lecithin used; as-made 0 g, step 1 struck.
- The scale: 1–5 with half steps and behavioural anchors; the signed scale centred on "Good" is rejected.
- Tasting temperature is recorded per tasting, never taken from the version's serve target.
- Overrun is a typed percentage; meltdown is the loss in grams; come-up is a plain number.
- The batch's id is opaque; its URL is nested under the version; the version line shows the latest churn date and no count.
- A blue "actual" beside each target chip is deferred until method amounts reference the rows (Phase 3).

**Must not be invented by a builder**
- A rating control or an overall score (D12).
- A colour, icon, or badge that says a deviation or a blank is good, bad, or a problem.
- A default for any measured value, as-made amount, step outcome, or tasting date.
- A defect taxonomy in place of the open field.
- Any sensory claim derived from the record.
