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

## Sketch 008's control language carried in (2026-09-14)

The page shell takes the three rules from sketch 008 that touch it (008 README, "Settled values"; commit 3ed0c0f): the focus ring is a whole 2px (`--focus-outline-width` on the app; 1.5px rendered as 1px at DPR 1); a hairline button's hover is a 2px border with the padding giving the pixel back (measured on Record batch in Mark's Chrome: 116.9×34.3 at rest and hovered, border 2px, padding 5px 11px); the prose field's focus is the one ring, its baseline stays a hairline (the thickened-baseline focus rule is gone). Show changes, drawn after a version is saved, is now the sheet's square-and-word toggle: a `text-toggle` with the checkbox-sized 13px ink square before the word, hollow at rest and pen blue when on, the underline hairline in both states, 32px tall, `aria-pressed` following (measured: 98.3×32, square 13px with a 1px border, fill rgb(31, 61, 122) when pressed). The strikes it would lay back are not drawn here. The step's Skipped checkbox is not on this sketch — it is an app control, in the quick-batch after the phase (03.3.1.1-CONTEXT.md, out of scope).

Mark asked whether the shell used every settled value; it did not, so the second pass carries the rest (measured in Mark's Chrome at the 1440 preset; the type roles are the same local tokens 007 carries, `--type-section` 0.875rem, `--type-label` 0.75rem, `--type-control` 0.8125rem, `--type-note` 1rem):

- **Region names and running heads take the section role**, 0.875rem at 600, 6px beneath (were 0.75rem at 400). Measured: 14px / 600 / 0.56px tracking / 6px, bookcloth. The tasting head's pen-blue suffix ("· at −12 °C · date unknown") stays at 400: it records a fact, it names nothing (Mark, 2026-09-14).
- **Every uppercase caption is 0.75rem at 500** — the version row's terms, the batch cells' captions, the develop pen's labels, the table's column heads and step heads (were 400). Measured: 12px / 500 on all five. The pen-blue "skipped" label keeps 400: it records a fact, it captions nothing.
- **Caption gaps are 6px** on the batch cells and the develop pen's labels (were 2px). Measured: 6px to the field, 5px to the cell's figure (its 1.1 leading).
- **Text controls are the control size**, 0.8125rem at 1.3 leading, 24px tall (were 0.75rem with no height). Measured: 13px, 88.1×24 on "3 later versions".
- **The develop pen's status line** is 0.8125rem at note leading, at the prose measure (was 0.75rem). Measured: 13px / 19.5px / 469.8px, "The version needs a name before this saves."
- **Placeholders are italic ink**: the Version and Why fields' "e.g." examples (were the field's pen blue, upright). Measured on the Version field: rgb(20, 20, 20), italic, opacity 1.
- **Touch sizes below 760px**: buttons, text controls (Show changes included) and fields grow to 44px; fields take 1rem at 600px and below (the version-line field keeps its 1.125rem text face). Verified in gsd-browser at a real 360 (Galaxy S23): the queries match, Record another 44px, the text control 44px at 13px, the gram field 16px, the Why field 16px, the status line 13px at 19.5px. 003's width presets narrow the frame, not the viewport, so nothing on the toolbar shows these; and at 360 the frame itself stays 1440px wide — the shell was never drawn for a phone (its ladder ends at the 760px version row; Phase 4 owns the breakpoint), so that overflow is the sketch's standing state, not this pass's.

Mark's review of the pass (2026-09-14): 003 looked like a different app in four places, each a field rule of its own where the sheet has one. Fixed, measured in Mark's Chrome at the 1440 preset: the develop pen's Version field is the sheet's ink field, the grotesk at 0.9375rem (was the text face at 1.125rem, mirroring the read view's version line) — 15px, 26.3px tall; the From batch select stands the same 26.3px beside it (the ink field takes the section's 1.35 leading; it was 23px with no leading); the Why field is the sheet's prose field, 1rem at 1.5 leading, 2px padding, sized to its text and growing with it (was a fixed two-row box at 1.4) — 29px empty, 53px on two lines, 29px again when cleared; the batch row's foot acts are gone: Correct moved to the Batch head line, right-aligned, where 007 puts a section-level word (Remove tasting on the Tasting head) — an underlined word stands beside the thing it acts on, and the head names the record; the foot is the ceremony's place, and when Correct opens the pen the pen's ceremony lands there (Mark, 2026-09-14). DESIGN.md's batch row sentence ("Correct/Add tasting sit at the foot as text controls") and the app's BatchRow foot placement (G-03.3-4) follow the sketch in the phase. The version row's acts stay left. Add tasting is gone from the batch row: the pen is the one door (Correct reopens it with everything editable, 03.3.1 D-03) and Add tasting lives inside it beside the foot ceremony (D-01, D-14), as the app already does; the drawn batch has a tasting anyway, where D-03 offers no Add tasting at all (Mark, 2026-09-14).

The paper's margin is one rule across 003, 007 and the app (Mark, 2026-09-14): 48px, and 20px at 600px and below. 003's narrow step (the one-column stack below 1100px) used to shrink the padding to 20px as well; it now changes only the columns and the gap. Measured at a real 768 (stacked): 48px; at a real 393: 20px.

Not carried, Mark's calls: the develop pen's gram fields stay 72px, a table-column width rather than the sheet's 56px numeric token; and the step list's ingredient tags are still hairline boxes — read-only labels that the sheet's language now reads as actions.


## The recorded figure (Mark, 2026-09-14)
The batch cells' figures borrowed the balance figure's role, 1.25rem at 700, so a row of seven read as loud as the balance page. Sketch 008 drew four candidates in context; Mark chose D: the note size (1rem) at the prose weight (400), pen blue, tabular, the unit word at the deviation size beside it, the plan sub-line beneath (line 88). The balance figures keep 1.25rem/700 in ink: the page's assessment stays the heavy element, the maker's record reads at the weight of the maker's words. The app's `.batch-row__cell-value` follows in the D-15 plan.

An absence is ink: the Air cell's "not measured" was pen blue like a recorded value; it now reads in ink at the unit's size (line 242, `.u.absent`), from the Impeccable critique of the 008 figure candidates (2026-09-15, P2: absence looked recorded).
