# Sketch 014: structural contract

Read with the files themselves. Their markup and inlined CSS are the authority; this note names what they hold so a planner, a checker and UAT cite one source. Mark approved the four boards on 2026-10-25 (the look rows in `README.md`). The values below are the boards' own, measured on these files in WebKit (Playwright, coarse pointer) on 2026-10-26, Chrome in brackets where it differs. "Token" means a custom property in `app/src/styles/tokens.css`; the boards draw no literal. Nothing is verified on the iPad. Everything sketch 013's `CONTRACT.md` says about the editor (the band, the Sheet, the picker, the log column) holds here unchanged except where this note says otherwise.

Targets: `instructions-steps.html`, `add-remove-move.html` (except its third panel, "After remove on step 2", where roadmap decision 24 governs: see `README.md`, For the plan, 1), `save.html`, `first-version.html`.

## 1. The heading rows (every editor panel; sketch 013 decisions 29, 31, 33)

- Before you start, Ingredients and Instructions each head a `.mk-head-row`: a 44 row (`--touch-min`), `h2.region-name` then the add control (`button.text-control.mk-head-act`) 14 after it at the rail gap, in the Sheet's own fold head look (13 / 400 / ink, underlined at the link offset), 6 below the row. Add note 54.7 × 44, Add ingredient 88.8 × 44, Add step 54.1 × 44 [53.2, 85, 52.8].
- Add ingredient goes while the picker is open (013 §3); Add step on the heading adds a step at the beginning of the list and is the only Add step while there is no step; the reading page after Save keeps plain headings.
- Add scale and Add problem stay under their lists (013 §5).

## 2. A step while creating (`instructions-steps.html`; MAKE-07)

- The Instructions section (`section.method-region`, aria-label Instructions) sits under the Balance; with no step it is the heading row alone and the table stays flat, Phase 10's, with each row's moves. Steps are `ol.method-steps > li.method-step.mk-step`: the number (`.method-step__n`, aria-hidden) at the left, the body (`.method-step__body`) beside it, number top and lead-in top equal (no `.method-step__open-fields` box, no first-field margin; 013 decision 32).
- The body, in order: the lead-in (`label.method-step__field > input.prose-field.prose-field--lead-in`, bold, aria-label "Step n, lead-in", 44 tall); the instruction (`textarea.prose-field`, 2 rows, "Step n, instruction"); the targets line (`p.method-step__targets`: one `.target-chip` per target holding two `input.ink-field` fields, label and value, then Add target 64 × 44 [61], then Preview step 77.5 × 44 [74.6], all `.text-control`); a purpose and an aside (`textarea.prose-field`, 2 rows) once added; the preview when open; the uses line; the Uses checklist when open; the acts row.
- Required (`span.field-requirement`) stands under an empty lead-in and an empty instruction of a just-added step. A step with Required standing refuses Save (section 4).
- The uses line (`p.method-step__uses-line`) reads "uses nothing yet" or "uses " and the row names in the step's order, then "change the ingredients" (reads "done" while the checklist is open), then "· add a purpose" and "· add an aside" while the step has none. The checklist (`fieldset.method-step__uses`, legend Uses) lists every row of the table with a checkbox; ticked rows are the step's.
- Preview (013 decision 34): Preview step reads Hide preview while open; the preview (`div.mk-preview`, role group "Step n, preview") sits under the step's last content field and before the uses line: a cue "Preview" (`p.mk-preview__cue`, the checklist legend's face: `--sheet-type-label` 12 px, 500, uppercase, 0.04em) over the step as the Sheet prints it (the reading step's own markup: `.method-step__n`, `.method-step__lead` with the lead-in bold and a full stop, `.method-step__targets` chips, `.method-step__purpose` in italics), set off by `--rule-graduation` solid `--sheet-ink` at the left, `--gap-s` above and as padding. 504 × 103 for step 1 with one target and a purpose.
- The acts row (`p.method-step__acts`): "remove · Move up · Move down · Add step", each a `.text-control` 44 tall (44.7, 51.7, 69, 54.1 wide [43.1, 50.8, 68.1, 52.8]), the dots aria-hidden; aria-labels "Step n, remove / move up / move down / add a step after it". Add step adds a step right after this one; focus goes to the new step's lead-in. A move that cannot act carries `.mk-off` (`--app-text-secondary`, no underline, default cursor) and `aria-disabled="true"`.
- The table under steps: the build's step heads (`tr.ingredient-table__step-head`: "Step n" and the lead-in in `.ingredient-table__step-head-lead`) in step order, a step that uses nothing drawing no head; rows no step uses under a last head "Not in a step yet" (roadmap decision 25) as soon as a step exists. A row ticked in two steps splits into one line per step, each under its step's head with its own grams field and the build's portion line "400 g of 600 g · 58.0% in all" (roadmap decision 23); a split row with one line left reads as a one-line row with no portion line (sketch 011 decision 56). Each row's name cell carries its acts on its own line (`.mk-row-acts`: remove · Move up · Move down).
- Words: Instructions, Add step, Add target, Preview step, Hide preview, Preview, uses nothing yet, uses, change the ingredients, done, add a purpose, add an aside, Uses, remove, Move up, Move down, Required, Step n, Not in a step yet.

## 3. Add, remove and move (`add-remove-move.html`; STRUCT-01, STRUCT-02, STRUCT-03)

- Steps: Move up and Move down reorder the list; the numbers on screen follow the order and the step's stored number never changes (STRUCT-03); the table's step groups follow the method. The first step's Move up and the last's Move down are `.mk-off`.
- Rows: Move up and Move down move a row within its step only (roadmap decision 9); the first row of a step has Move up off, the last Move down off. Rows under "Not in a step yet" move within that group.
- remove on a step deletes it outright with no strike and no restore (roadmap decision 10): rows whose only line was in it keep their grams and go back under "Not in a step yet"; for a row split across two steps the grams fold back into its remaining line and the Balance stands (roadmap decision 24; the board's third panel predates that answer and draws 400 g, see `README.md`). No removed step's key is handed out again (the roadmap's `nextStepKey`).
- remove on a row deletes it outright and prunes the uses that name it (013 decision 5, STRUCT-01); the Balance follows.

## 4. Save (`save.html`; MAKE-10)

- The ceremony (`form.notebook-ceremony`, aria-label "New recipe"): caption "New recipe · draft", Version name (`.ink-field`, required, "Required" under it while empty), then Cancel (`.notebook-action--outline`, 88.3 × 44) and Save (`.notebook-action`, the filled action, 74.4 × 44 [88.4, 74.5]) on one row. Cancel abandons the draft, as in 013.
- Save refused: "Enter a recipe name." (`.field-error`, the Notebook's own sentence) under the empty recipe name and Required under the empty version name; a step with Required standing refuses the same way. Nothing is saved and the page stays.
- Save creates the recipe and its first version in one step and lands on the new recipe's page as the seeded ones read it: the band with the name, its description and Rename; "Version 1 · Latest", Written today, no From version on a root, "no reason recorded"; the acts Next version (filled, 126.3 × 44) and Edit (`.notebook-link`, underlined, 26.3 × 44); History with one node, "1 version", "not churned"; the Sheet with its steps numbered and the table under step heads (no "Not in a step yet" is drawn on a saved page); the Batch margin not yet churned.
- The notice: "Recipe saved." as the built page notice (`.page-status` in `.page-status-anchor`, role status, polite): the ink card at the window's foot, centred, 20 above the foot, 16 on 24, padding 12 / 20, radius 10, `--app-shadow-notice`; 142.6 × 50 [143.4]. It clears after 5 s as the others do. On the board the anchor is absolute in the panel's window (`.mk-win-foot`); the app fixes it to the viewport.
- Words: New recipe · draft, Version name, Required, Cancel, Save, Enter a recipe name., Recipe saved., Version 1 · Latest, Next version, Edit, no reason recorded, 1 version, not churned.

## 5. The first version after Save (`first-version.html`; STRUCT-04, roadmap decisions 12 and 22)

- Edit stands beside Next version only while the version has no batch and no child version; Show changes needs a parent, so it is absent on a root.
- Edit reopens the creation editor on the saved version with its steps, rows, style, scales and problems as saved and the same Add, remove and move controls as while creating. The ceremony reads "Version 1 · editing" (form label "Edit version"), Version name, Cancel and Save; Save writes over the version, Cancel keeps it as it was. The band keeps the recipe's fields in Rename's form as 013 draws them.
- Once a batch exists Edit is gone: the acts row reads Next version alone; the Batch margin holds the batch as built; the version pen's own remove and restore apply to its children as before. No other saved version shows Edit.
- Words: Edit, Version 1 · editing, Cancel, Save.

## 6. Rules for every panel

- Every control is 44 px tall under the coarse pointer (`--touch-min`): fields, chips' fields, the add controls, the moves, Preview step, Cancel, Save, Edit. Nothing moves on hover or focus.
- No new token. The `mk-*` rules in `p11.py`'s `P11_CSS` read existing tokens only; the build keeps that.
- 1366 only, the iPad's width; no 393 panel (Mark does not create recipes on an iPhone).

## Decision map

Roadmap 9, 10 and 12 (2026-10-16) set the moves, the removal and the editable first version; roadmap 22 to 25 (2026-10-25, morning) are the boards' own four questions; sketch 013's 29 to 34 (2026-10-25, evening) are Mark's looks on these boards: the heading rows, the notice card, no box, Add step in both places, Preview step. 013 23 (the notice beside Import) is superseded by 013 30. Roadmap 24 is answered against the drawn panel (README, For the plan, 1). The numbers are `README.md`'s Decisions section.
