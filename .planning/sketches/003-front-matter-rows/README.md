---
sketch: 003
name: front-matter-rows
question: "Does the page's front matter read as two stacked rows in column one, the version and its batch, each with its own layout, with the lists and the ceremony opening under the row they belong to?"
winner: "B"
tags: [layout, shell, front-matter, versions, batches, tablet]
---

# Sketch 003: Front matter in rows

## Design Question
Sketch 002's synthesis D was rejected: two tiny sub-columns in column two. Mark's direction: split the top of the page into outer rows in column one, the version's details in one row and the batch's in a second, each with an appropriate layout. The page holds the tip (latest version, latest batch); earlier ones open on request beneath their row. The remaining question is what column two does beside those rows.

## How to View
open .planning/sketches/003-front-matter-rows/index.html

Variants A, B, C; states Reading, Later versions, Later batches, Develop. The Develop ceremony replaces the version row's metadata cell in place. Save writes the new version's line, reason and citation into the row and empties the batch row ("not churned yet"). The readout gives the front matter's height and where the table, Balance, the fat rule and Method start.

## Variants
- **A: Rows in column one, Balance level with Ingredients** — column two is empty beside the front matter, as the page is today.
- **B: Rows across the whole page** — the two rows span both columns; the version row's metadata and the batch's cells get the full width.
- **C: Rows in column one, Balance rises beside them** — Balance starts at the top of column two, beside the version row, and Notes follow beneath Ingredients' level.

## Added 2026-09-09: the table in step order, with portions
Mark weighs in step order, and his sheet records a split ingredient as two portions (whole milk 120 g + 263 g). The sketch gains a toggle, "Table as written" against "Table in step order". Underneath, an ingredient is the formula's row (one total, one share of batch, one coefficient snapshot) and a portion is what is weighed for one step. In step order the table groups by step with the step's lead-in as a head, a split ingredient appears once per step as a portion line with "120 g of 370.4 g · 46.3% in all" beneath its name and the portion's own share in the column, and the Step column disappears. As made is recorded per portion. The design question: does the step-ordered reading replace the written order on screen and on the sheet, or sit beside it?

## Outcome (2026-09-09)
Mark chose **B, rows across the whole page, with the table in step order**. The tray is no longer needed: the rows hold the acts and open the lists and the ceremony beneath themselves. Added on the same decision: a baseline-weight rule closes the front matter above Ingredients; "Before you start" moves to the head of the Method, before step 1; Things to check and the carried-forward Notes are restored under Balance. Absence labels follow the guide's "Saying absence" rule.

## What to Look For
- The version row: name, line and headnote on the left; the version's metadata (line, reason, later versions) and its acts (Develop, Record another, Show changes) on the right. Does that read as one row?
- The batch row: measured values as labelled cells at figure size, the words in the text face, tasting marks as a second cell group. Is that the record, laid out, rather than stuffed?
- A: how much paper sits empty in column two beside the rows, and how far down Balance starts.
- C: Balance beside the version row means the rules sit beside the reason for the version; is that a good neighbour or a distraction?
- Develop: the ceremony takes the metadata cell's place in the version row; the table's struck 40 and the fat rule's strike should be on the same screen.
- 1024 and 834: the rows stack; does the batch row's cell grid reflow cleanly?

## Handoff to `/impeccable shape route:/recipe` (2026-09-09)

The decisions in this section were made in conversation with Mark and are recorded nowhere else. The critique that started the round is `.impeccable/critique/2026-09-09T11-54-37Z__app-src-ui-recipepage-jsx.md`; the labels and the "Saying absence" rule are in `product-requirements/05-domain-and-language.md`.

### The jobs, and where each one lives now

| Job | Object | Where on the page | Control |
|---|---|---|---|
| Read the recipe as a recipe | Version | The spread | none |
| Read plan and reality together | Batch on version | As-made column, struck steps, the batch row | none |
| Know which version I am on and reach the others | Recipe's versions | Version row | "N later versions" opens the list under the row |
| Know where this version came from and why | Version | Version row | From version, Why, From batch, Show changes |
| Pick which batch I am reading | Version's batches | Batch row | "N later batches" opens the list under the row |
| Put the sheet's ink in against the version I churned | New batch | Record another on the version row; ink in place; ceremony under the row and repeated at the foot | Record another, churn date, Save, Cancel |
| Add a tasting later | Tasting on batch | Batch row | Add tasting |
| Fix a misread record | Batch | Batch row | Correct |
| Make the next version with its reason on the page | New version | Next version on the version row; pen in the spread; ceremony under the row and at the foot | Next version, Version, Why, From batch, Save as new version, Cancel |
| Fork twice for the same batch | New version | Same; also "New version from …" in the later-versions list | |
| See what changed and what it did | Version pair | Version row; strikes in the spread | Show changes |
| Correct an unchurned plan without forking | Version | Ceremony | Save over |
| Print the sheet | Version | Version row, Phase 4 | Print |

### Decisions carried

- The page holds the tip: the latest version and its latest batch. Earlier ones are one control away. This follows the binder (29 sheets, one line of work) and Mark's own account of how he works.
- Version and batch stay separate records (D04; the same plan churned twice is two batches of one version). The words merge: a version with no batch reads "not yet churned", one with a batch "churned 2 Aug 2026", a repeated one "churned twice". "Draft" is acceptable for the unchurned state.
- The two rows stay two because their acts differ: Next version and Record another act on the plan; Correct and Add tasting act on one churn. Putting them on one row is how the imprint got overloaded.
- The tray (sketch 001) is superseded. Ingredient management and import are pages of their own, in the same material, not spreads and not trays.
- Step order is the table's order and the sheet's. An ingredient is the formula's row (one total, one share, one snapshot); a portion is what is weighed for one step; as-made is recorded per portion and the total derived. The Step column disappears in step order; the step's lead-in heads each group.
- "Before you start" notes head the Method, before step 1. Things to check and the carried-forward Notes sit under Balance in column two.
- The per-step controls in the pen are a read-only method with one "edit this step" text control per step (Mark, 2026-09-09, from the critique's question).
- The Balance note stays level with Ingredients; nothing in column two sits above it.

### Still open for shape

- Whether the written order survives on screen once step order is the sheet's order.
- Editing a split ingredient in the pen: portions edited, total derived; not sketched.
- The later-versions list beyond four entries; three across at 1440 worked.
- Print's place on the version row (Phase 4).
- Tablet: the page stacks below 1100 with the front matter first; Phase 4 owns the breakpoint.
